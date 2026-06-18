import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
  canViewAdminPreview,
  canViewPublicPage,
  getVisiblePagesForPlacement,
  hasSlugConflict,
  isLikelyHttpUrl,
  isValidPageSlug,
  normalizeOptionalString,
  PAGE_ORDER_MAX,
  PAGE_ORDER_MIN,
  sanitizePageHtml,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
  OG_TITLE_MAX_LENGTH,
  OG_DESCRIPTION_MAX_LENGTH,
  slugify,
} from "../lib/page-content";

const VERSION_HISTORY_LIMIT = 25;

type PageDoc = Doc<"pages">;

async function createVersionSnapshot(
  ctx: any,
  page: PageDoc,
  options: {
    source: "manual" | "rollback" | "restore" | "hard_delete" | "archive" | "duplicate";
    createdById?: Id<"users">;
    restoredFromVersionId?: Id<"page_versions">;
  },
) {
  await ctx.db.insert("page_versions", {
    pageId: page._id,
    title: page.title,
    slug: page.slug,
    excerpt: page.excerpt,
    content: page.content,
    status: page.status,
    pageType: page.pageType,
    isVisibleInMenu: page.isVisibleInMenu,
    isVisibleInFooter: page.isVisibleInFooter,
    order: page.order,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    heroImage: page.heroImage,
    canonicalUrl: page.canonicalUrl,
    robots: page.robots,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    ogImage: page.ogImage,
    publishAt: page.publishAt,
    archivedAt: page.archivedAt,
    source: options.source,
    createdAt: Date.now(),
    createdById: options.createdById,
    restoredFromVersionId: options.restoredFromVersionId,
    isDeleted: page.isDeleted,
    deletedAt: page.deletedAt,
  });
}

async function trimVersionHistory(ctx: any, pageId: Id<"pages">) {
  const versions = await ctx.db
    .query("page_versions")
    .withIndex("by_pageId_and_createdAt", (q: any) => q.eq("pageId", pageId))
    .order("desc")
    .take(VERSION_HISTORY_LIMIT + 10);

  const overflow = versions.slice(VERSION_HISTORY_LIMIT);
  await Promise.all(overflow.map((version: { _id: Id<"page_versions"> }) => ctx.db.delete(version._id)));
}

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Brak dostępu");
  }

  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("Brak dostępu");
  }

  return user;
}

function validatePayload(args: {
  title: string;
  slug: string;
  order: number;
  heroImage?: string;
  canonicalUrl?: string;
}) {
  const title = args.title.trim();
  const slug = slugify(args.slug);

  if (!title) {
    throw new Error("Tytuł jest wymagany");
  }

  if (!slug) {
    throw new Error("Slug jest wymagany");
  }

  if (!isValidPageSlug(slug)) {
    throw new Error("Slug może zawierać tylko małe litery, cyfry i myślniki");
  }

  if (!Number.isFinite(args.order) || args.order < PAGE_ORDER_MIN || args.order > PAGE_ORDER_MAX) {
    throw new Error(`Kolejność musi być liczbą od ${PAGE_ORDER_MIN} do ${PAGE_ORDER_MAX}`);
  }

  const heroImage = normalizeOptionalString(args.heroImage);
  if (heroImage && !isLikelyHttpUrl(heroImage)) {
    throw new Error("Zdjęcie nagłówkowe musi być poprawnym adresem URL");
  }

  const canonicalUrl = normalizeOptionalString(args.canonicalUrl);
  if (canonicalUrl && !isLikelyHttpUrl(canonicalUrl)) {
    throw new Error("Canonical URL musi być poprawnym adresem http:// lub https://");
  }

  return {
    title,
    slug,
    heroImage,
    canonicalUrl,
  };
}

async function ensureUniqueSlug(ctx: any, slug: string, excludeId?: Id<"pages">) {
  const existing = await ctx.db.query("pages").withIndex("by_slug", (q: any) => q.eq("slug", slug)).take(10);
  if (hasSlugConflict(existing, slug, excludeId ?? null)) {
    throw new Error("Slug jest już zajęty przez inną stronę");
  }
}

function buildPagePayload(args: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  status: "draft" | "published";
  pageType: "standard" | "contact" | "legal" | "about" | "editorial";
  isVisibleInMenu: boolean;
  isVisibleInFooter: boolean;
  order: number;
  seoTitle?: string;
  seoDescription?: string;
  heroImage?: string;
  canonicalUrl?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  publishAt?: number;
}) {
  const validated = validatePayload(args);

  return {
    title: validated.title,
    slug: validated.slug,
    excerpt: normalizeOptionalString(args.excerpt),
    content: normalizeOptionalString(sanitizePageHtml(args.content)),
    status: args.status,
    pageType: args.pageType,
    isVisibleInMenu: args.isVisibleInMenu,
    isVisibleInFooter: args.isVisibleInFooter,
    order: Math.round(args.order),
    seoTitle: normalizeOptionalString(args.seoTitle)?.slice(0, SEO_TITLE_MAX_LENGTH),
    seoDescription: normalizeOptionalString(args.seoDescription)?.slice(0, SEO_DESCRIPTION_MAX_LENGTH),
    heroImage: validated.heroImage,
    canonicalUrl: validated.canonicalUrl,
    robots: normalizeOptionalString(args.robots),
    ogTitle: normalizeOptionalString(args.ogTitle)?.slice(0, OG_TITLE_MAX_LENGTH),
    ogDescription: normalizeOptionalString(args.ogDescription)?.slice(0, OG_DESCRIPTION_MAX_LENGTH),
    ogImage: normalizeOptionalString(args.ogImage),
    publishAt: args.publishAt ?? undefined,
    updatedAt: Date.now(),
  };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const pages = await ctx.db.query("pages").withIndex("by_order").order("asc").take(200);
    return pages.filter((page) => !page.deletedAt);
  },
});

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("pages").withIndex("by_order").order("asc").take(200);
  },
});

export const listVisibleInMenu = query({
  args: {},
  handler: async (ctx) => {
    const pages = await ctx.db.query("pages").withIndex("by_status", (q) => q.eq("status", "published")).take(200);
    // Also include draft pages with past publishAt
    const allPages = await ctx.db.query("pages").withIndex("by_order").order("asc").take(200);
    return getVisiblePagesForPlacement(allPages, "menu");
  },
});

export const listVisibleInFooter = query({
  args: {},
  handler: async (ctx) => {
    const allPages = await ctx.db.query("pages").withIndex("by_order").order("asc").take(200);
    return getVisiblePagesForPlacement(allPages, "footer");
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const normalizedSlug = slugify(args.slug);
    if (!normalizedSlug || !isValidPageSlug(normalizedSlug)) {
      return null;
    }

    const page = await ctx.db.query("pages").withIndex("by_slug", (q) => q.eq("slug", normalizedSlug)).unique();
    if (!page || !canViewPublicPage(page)) {
      return null;
    }

    return page;
  },
});

export const getAdminPreviewBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const normalizedSlug = slugify(args.slug);
    if (!normalizedSlug || !isValidPageSlug(normalizedSlug)) {
      return null;
    }

    const page = await ctx.db.query("pages").withIndex("by_slug", (q) => q.eq("slug", normalizedSlug)).unique();
    if (!page || !canViewAdminPreview(page)) {
      return null;
    }

    return page;
  },
});

export const listVersions = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("page_versions")
      .withIndex("by_pageId_and_createdAt", (q) => q.eq("pageId", args.pageId))
      .order("desc")
      .take(VERSION_HISTORY_LIMIT);
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("pages")),
    title: v.string(),
    slug: v.string(),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
    pageType: v.union(
      v.literal("standard"),
      v.literal("contact"),
      v.literal("legal"),
      v.literal("about"),
      v.literal("editorial"),
    ),
    isVisibleInMenu: v.boolean(),
    isVisibleInFooter: v.boolean(),
    order: v.number(),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    heroImage: v.optional(v.string()),
    canonicalUrl: v.optional(v.string()),
    robots: v.optional(v.string()),
    ogTitle: v.optional(v.string()),
    ogDescription: v.optional(v.string()),
    ogImage: v.optional(v.string()),
    publishAt: v.optional(v.number()),
    saveSource: v.optional(v.union(v.literal("manual"), v.literal("autosave"))),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const payload = buildPagePayload(args);
    await ensureUniqueSlug(ctx, payload.slug, args.id);

    if (args.id) {
      const existing = await ctx.db.get(args.id);
      if (!existing) {
        throw new Error("Nie znaleziono strony do edycji");
      }

      if (args.saveSource !== "autosave") {
        await createVersionSnapshot(ctx, existing, {
          source: "manual",
          createdById: admin._id,
        });
      }

      await ctx.db.patch(args.id, {
        ...payload,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        archivedAt: existing.archivedAt,
      });

      if (args.saveSource !== "autosave") {
        await trimVersionHistory(ctx, args.id);
      }

      return args.id;
    }

    return await ctx.db.insert("pages", payload);
  },
});

export const archive = mutation({
  args: { id: v.id("pages") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Nie znaleziono strony do archiwizacji");
    }

    if (existing.archivedAt) {
      return; // already archived
    }

    await createVersionSnapshot(ctx, existing, {
      source: "archive",
      createdById: admin._id,
    });

    await ctx.db.patch(args.id, {
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await trimVersionHistory(ctx, args.id);
  },
});

export const unarchive = mutation({
  args: { id: v.id("pages") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Nie znaleziono strony do przywrócenia z archiwum");
    }

    await createVersionSnapshot(ctx, existing, {
      source: "restore",
      createdById: admin._id,
    });

    await ctx.db.patch(args.id, {
      archivedAt: undefined,
      updatedAt: Date.now(),
    });

    await trimVersionHistory(ctx, args.id);
  },
});

export const duplicate = mutation({
  args: { id: v.id("pages") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const source = await ctx.db.get(args.id);
    if (!source) {
      throw new Error("Nie znaleziono strony do duplikowania");
    }

    // Generate a unique slug for the copy
    const baseSlug = `kopia-${source.slug}`;
    let candidateSlug = baseSlug;
    let attempt = 0;

    while (true) {
      const existing = await ctx.db
        .query("pages")
        .withIndex("by_slug", (q) => q.eq("slug", candidateSlug))
        .unique();

      if (!existing) break;

      attempt++;
      candidateSlug = `${baseSlug}-${attempt}`;
    }

    const newId = await ctx.db.insert("pages", {
      title: `Kopia: ${source.title}`,
      slug: candidateSlug,
      excerpt: source.excerpt,
      content: source.content,
      status: "draft",
      pageType: source.pageType,
      isVisibleInMenu: false,
      isVisibleInFooter: false,
      order: source.order + 1,
      seoTitle: source.seoTitle,
      seoDescription: source.seoDescription,
      heroImage: source.heroImage,
      canonicalUrl: undefined,
      robots: source.robots,
      ogTitle: source.ogTitle,
      ogDescription: source.ogDescription,
      ogImage: source.ogImage,
      publishAt: undefined,
      updatedAt: Date.now(),
    });

    return newId;
  },
});

export const rollbackToVersion = mutation({
  args: {
    pageId: v.id("pages"),
    versionId: v.id("page_versions"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const [page, version] = await Promise.all([
      ctx.db.get(args.pageId),
      ctx.db.get(args.versionId),
    ]);

    if (!page) {
      throw new Error("Nie znaleziono strony");
    }

    if (!version || version.pageId !== args.pageId) {
      throw new Error("Nie znaleziono wybranej wersji");
    }

    await ensureUniqueSlug(ctx, version.slug, args.pageId);

    await createVersionSnapshot(ctx, page, {
      source: "rollback",
      createdById: admin._id,
      restoredFromVersionId: args.versionId,
    });

    await ctx.db.patch(args.pageId, {
      title: version.title,
      slug: version.slug,
      excerpt: version.excerpt,
      content: version.content,
      status: version.status,
      pageType: version.pageType,
      isVisibleInMenu: version.isVisibleInMenu,
      isVisibleInFooter: version.isVisibleInFooter,
      order: version.order,
      seoTitle: version.seoTitle,
      seoDescription: version.seoDescription,
      heroImage: version.heroImage,
      canonicalUrl: version.canonicalUrl,
      robots: version.robots,
      ogTitle: version.ogTitle,
      ogDescription: version.ogDescription,
      ogImage: version.ogImage,
      publishAt: version.publishAt,
      isDeleted: false,
      deletedAt: undefined,
      archivedAt: undefined,
      updatedAt: Date.now(),
    });

    await trimVersionHistory(ctx, args.pageId);
    return args.pageId;
  },
});

export const remove = mutation({
  args: { id: v.id("pages") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Nie znaleziono strony do usunięcia");
    }

    if (existing.deletedAt) {
      return;
    }

    await createVersionSnapshot(ctx, existing, {
      source: "manual",
      createdById: admin._id,
    });

    await ctx.db.patch(args.id, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await trimVersionHistory(ctx, args.id);
  },
});

export const restore = mutation({
  args: { id: v.id("pages") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Nie znaleziono strony do przywrócenia");
    }

    await createVersionSnapshot(ctx, existing, {
      source: "restore",
      createdById: admin._id,
    });

    await ctx.db.patch(args.id, {
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: Date.now(),
    });

    await trimVersionHistory(ctx, args.id);
  },
});

export const hardRemove = mutation({
  args: { id: v.id("pages"), confirmationSlug: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Nie znaleziono strony do trwałego usunięcia");
    }

    if (!existing.deletedAt) {
      throw new Error("Trwałe usunięcie jest dostępne tylko dla stron z kosza");
    }

    if (slugify(args.confirmationSlug) !== existing.slug) {
      throw new Error("Potwierdzenie usunięcia nie zgadza się ze slugiem strony");
    }

    await createVersionSnapshot(ctx, existing, {
      source: "hard_delete",
      createdById: admin._id,
    });

    const versions = await ctx.db
      .query("page_versions")
      .withIndex("by_pageId_and_createdAt", (q) => q.eq("pageId", args.id))
      .take(VERSION_HISTORY_LIMIT + 100);

    await Promise.all(versions.map((version: { _id: Id<"page_versions"> }) => ctx.db.delete(version._id)));
    await ctx.db.delete(args.id);
  },
});

export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.query("pages").take(1);
    if (existing.length > 0) return { skipped: true };

    const now = Date.now();
    const demos = [
      {
        title: "O nas",
        slug: "o-nas",
        excerpt: "Poznaj redakcję Love Bydgoszcz — lokalny portal informacyjny z pasją do miasta.",
        content: `<h2>Kim jesteśmy?</h2><p>Love Bydgoszcz to niezależny portal informacyjny poświęcony Bydgoszczy i jej mieszkańcom. Tworzymy treści z pasją, rzetelnie i lokalnie.</p><h2>Nasza misja</h2><p>Chcemy być głosem Bydgoszczy — informować, inspirować i łączyć społeczność. Piszemy o tym, co ważne dla mieszkańców: od polityki miejskiej, przez kulturę, sport, aż po codzienne życie w mieście.</p><h2>Redakcja</h2><p>Nasz zespół tworzą dziennikarze, fotografowie i pasjonaci Bydgoszczy. Działamy lokalnie, myślimy globalnie.</p>`,
        status: "published" as const,
        pageType: "about" as const,
        isVisibleInMenu: true,
        isVisibleInFooter: true,
        order: 1,
        seoTitle: "O nas — Love Bydgoszcz",
        seoDescription: "Poznaj redakcję Love Bydgoszcz — lokalny portal informacyjny z pasją do miasta.",
        heroImage: undefined,
      },
      {
        title: "Regulamin",
        slug: "regulamin",
        excerpt: "Regulamin korzystania z portalu Love Bydgoszcz.",
        content: `<h2>§1. Postanowienia ogólne</h2><p>Niniejszy regulamin określa zasady korzystania z portalu LoveBydgoszcz.pl, zwanego dalej „Portalem".</p><h2>§2. Użytkownicy</h2><p>Użytkownikiem Portalu jest każda osoba, która korzysta z jego zasobów. Korzystanie z Portalu jest równoznaczne z akceptacją niniejszego Regulaminu.</p><h2>§3. Prawa autorskie</h2><p>Wszelkie treści zamieszczone na Portalu, w tym teksty, zdjęcia i grafiki, są chronione prawem autorskim. Kopiowanie i rozpowszechnianie bez zgody redakcji jest zabronione.</p><h2>§4. Odpowiedzialność</h2><p>Redakcja dokłada wszelkich starań, aby informacje zamieszczone na Portalu były rzetelne i aktualne. Nie ponosimy odpowiedzialności za treści zamieszczane przez użytkowników w komentarzach.</p><h2>§5. Postanowienia końcowe</h2><p>Regulamin może ulec zmianie. O wszelkich zmianach użytkownicy będą informowani na stronie Portalu.</p>`,
        status: "published" as const,
        pageType: "legal" as const,
        isVisibleInMenu: false,
        isVisibleInFooter: true,
        order: 2,
        seoTitle: "Regulamin — Love Bydgoszcz",
        seoDescription: "Regulamin korzystania z portalu Love Bydgoszcz.",
        heroImage: undefined,
      },
      {
        title: "Polityka prywatności",
        slug: "polityka-prywatnosci",
        excerpt: "Informacje o przetwarzaniu danych osobowych w portalu Love Bydgoszcz.",
        content: `<h2>Administrator danych</h2><p>Administratorem danych osobowych jest redakcja portalu LoveBydgoszcz.pl z siedzibą w Bydgoszczy.</p><h2>Zakres zbieranych danych</h2><p>Portal zbiera dane osobowe wyłącznie w zakresie niezbędnym do świadczenia usług, w tym: adres e-mail przy rejestracji, dane podane dobrowolnie w formularzach kontaktowych.</p><h2>Cel przetwarzania</h2><p>Dane osobowe przetwarzane są w celu: świadczenia usług portalu, wysyłki newslettera (za zgodą użytkownika), odpowiedzi na zapytania kontaktowe.</p><h2>Prawa użytkownika</h2><p>Każdy użytkownik ma prawo do: dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz przenoszenia danych.</p><h2>Kontakt</h2><p>W sprawach dotyczących ochrony danych osobowych prosimy o kontakt: redakcja@lovebydgoszcz.pl</p>`,
        status: "published" as const,
        pageType: "legal" as const,
        isVisibleInMenu: false,
        isVisibleInFooter: true,
        order: 3,
        seoTitle: "Polityka prywatności — Love Bydgoszcz",
        seoDescription: "Informacje o przetwarzaniu danych osobowych w portalu Love Bydgoszcz.",
        heroImage: undefined,
      },
    ];

    for (const page of demos) {
      const payload = buildPagePayload(page);
      await ensureUniqueSlug(ctx, payload.slug);
      await ctx.db.insert("pages", { ...payload, updatedAt: now });
    }

    return { created: demos.length };
  },
});