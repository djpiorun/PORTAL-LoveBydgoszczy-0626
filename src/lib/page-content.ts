export type PageStatus = "draft" | "published";
export type PageType = "standard" | "contact" | "legal" | "about" | "editorial";
export type PageVersionSource = "manual" | "rollback" | "restore" | "hard_delete" | "archive" | "duplicate";

export const PAGE_ORDER_MIN = 0;
export const PAGE_ORDER_MAX = 1000;
export const SEO_TITLE_MAX_LENGTH = 70;
export const SEO_DESCRIPTION_MAX_LENGTH = 180;
export const OG_TITLE_MAX_LENGTH = 95;
export const OG_DESCRIPTION_MAX_LENGTH = 200;
export const CANONICAL_URL_MAX_LENGTH = 500;

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "img",
]);

export function normalizeOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[ąćęłńóśźż]/g, (char) => ({ ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" }[char] ?? char))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidPageSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function isLikelyHttpUrl(value?: string) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizePageHtml(input?: string) {
  if (!input) return "";

  let html = input;

  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|option|video|audio|canvas|svg|math)[^>]*>[\s\S]*?<\/\1>/gi, "");
  html = html.replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|option|video|audio|canvas|svg|math)[^>]*\/?>/gi, "");
  html = html.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  return html.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (full, rawTagName: string, rawAttrs: string) => {
    const tagName = rawTagName.toLowerCase();
    const isClosing = full.startsWith("</");

    if (!ALLOWED_TAGS.has(tagName)) {
      return "";
    }

    if (isClosing) {
      return `</${tagName}>`;
    }

    if (tagName === "a") {
      const hrefMatch = rawAttrs.match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const titleMatch = rawAttrs.match(/\stitle\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const href = hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "";
      const safeHref = /^(https?:|mailto:|tel:|\/)/i.test(href) && !/^javascript:/i.test(href) ? href : "#";
      const title = titleMatch?.[1] ?? titleMatch?.[2];
      const titleAttr = title ? ` title="${escapeHtmlAttribute(title)}"` : "";
      const rel = /^https?:/i.test(safeHref) ? ` target="_blank" rel="noopener noreferrer"` : "";
      return `<a href="${escapeHtmlAttribute(safeHref)}"${titleAttr}${rel}>`;
    }

    if (tagName === "img") {
      const srcMatch = rawAttrs.match(/\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const altMatch = rawAttrs.match(/\salt\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const titleMatch = rawAttrs.match(/\stitle\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const src = srcMatch?.[1] ?? srcMatch?.[2] ?? srcMatch?.[3] ?? "";
      const safeSrc = /^(https?:|\/)/i.test(src) && !/^javascript:/i.test(src) ? src : "";
      if (!safeSrc) return "";
      const alt = altMatch?.[1] ?? altMatch?.[2] ?? "";
      const title = titleMatch?.[1] ?? titleMatch?.[2] ?? "";
      const altAttr = ` alt="${escapeHtmlAttribute(alt)}"`;
      const titleAttr = title ? ` title="${escapeHtmlAttribute(title)}"` : "";
      return `<img src="${escapeHtmlAttribute(safeSrc)}"${altAttr}${titleAttr} />`;
    }

    return `<${tagName}>`;
  });
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const PAGE_VERSION_SOURCE_LABELS: Record<PageVersionSource, string> = {
  manual: "Zapis ręczny",
  rollback: "Rollback",
  restore: "Przywrócenie z kosza",
  hard_delete: "Trwałe usunięcie",
  archive: "Archiwizacja",
  duplicate: "Duplikowanie",
};

export type PageRecordLike = {
  _id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  status: PageStatus;
  pageType?: PageType;
  isVisibleInMenu?: boolean;
  isVisibleInFooter?: boolean;
  order?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  heroImage?: string | null;
  updatedAt?: number;
  isDeleted?: boolean;
  deletedAt?: number | null;
  publishAt?: number | null;
  archivedAt?: number | null;
  canonicalUrl?: string | null;
  robots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
};

export type PageVisibilityLike = {
  _id?: string;
  slug: string;
  title?: string;
  excerpt?: string | null;
  status?: PageStatus;
  isVisibleInMenu?: boolean;
  isVisibleInFooter?: boolean;
  order?: number;
  deletedAt?: number | null;
  publishAt?: number | null;
  archivedAt?: number | null;
};

export function getPageVersionSummary(version: {
  source: PageVersionSource;
  title?: string;
  slug?: string;
  status?: PageStatus;
  pageType?: PageType;
}) {
  const sourceLabel = PAGE_VERSION_SOURCE_LABELS[version.source];
  const statusLabel = version.status === "published" ? "opublikowana" : "szkic";
  const typeLabel = version.pageType ?? "standard";
  return `${sourceLabel} · ${version.title ?? "Bez tytułu"} · /${version.slug ?? ""} · ${statusLabel} · ${typeLabel}`;
}

export function isPageDeleted(page: Pick<PageVisibilityLike, "deletedAt">) {
  return typeof page.deletedAt === "number";
}

export function isPageArchived(page: Pick<PageVisibilityLike, "archivedAt">) {
  return typeof page.archivedAt === "number";
}

export function isPageScheduled(page: Pick<PageVisibilityLike, "status" | "publishAt">) {
  return page.status === "draft" && typeof page.publishAt === "number" && page.publishAt > Date.now();
}

/**
 * Returns true if the page should be visible publicly right now.
 * A page is visible if:
 * - status is "published" OR (status is "draft" but publishAt is in the past)
 * - not deleted
 * - not archived
 */
export function canViewPublicPage(page: Pick<PageVisibilityLike, "status" | "deletedAt" | "publishAt" | "archivedAt">) {
  if (isPageDeleted(page)) return false;
  if (isPageArchived(page)) return false;

  if (page.status === "published") return true;

  // Draft with a past publishAt is treated as published
  if (page.status === "draft" && typeof page.publishAt === "number" && page.publishAt <= Date.now()) {
    return true;
  }

  return false;
}

export function canViewAdminPreview(page: Pick<PageVisibilityLike, "deletedAt">) {
  return !isPageDeleted(page);
}

export function getVisiblePagesForPlacement<T extends Pick<PageVisibilityLike, "status" | "deletedAt" | "order" | "isVisibleInMenu" | "isVisibleInFooter" | "publishAt" | "archivedAt">>(
  pages: T[],
  placement: "menu" | "footer",
) {
  return pages
    .filter((page) =>
      canViewPublicPage(page) &&
      (placement === "menu" ? page.isVisibleInMenu : page.isVisibleInFooter),
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function matchesPageSearch(
  page: Pick<PageVisibilityLike, "title" | "slug" | "excerpt">,
  query: string,
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    (page.title ?? "").toLowerCase().includes(normalized) ||
    (page.slug ?? "").toLowerCase().includes(normalized) ||
    (page.excerpt ?? "").toLowerCase().includes(normalized)
  );
}

export function hasSlugConflict(
  existingPages: Array<Pick<PageVisibilityLike, "_id" | "slug">>,
  slug: string,
  excludeId?: string | null,
) {
  const normalizedSlug = slugify(slug);
  if (!normalizedSlug) return false;

  return existingPages.some((page) => (page.slug ?? "") === normalizedSlug && page._id !== excludeId);
}

export function validatePageInput(input: {
  title: string;
  slug: string;
  order: number;
  heroImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
}) {
  const errors: Partial<Record<"title" | "slug" | "order" | "heroImage" | "seoTitle" | "seoDescription" | "canonicalUrl" | "ogTitle" | "ogDescription", string>> = {};

  if (!input.title.trim()) {
    errors.title = "Tytuł jest wymagany";
  }

  if (!input.slug.trim()) {
    errors.slug = "Slug jest wymagany";
  } else if (!isValidPageSlug(input.slug.trim())) {
    errors.slug = "Slug może zawierać tylko małe litery, cyfry i myślniki";
  }

  if (!Number.isFinite(input.order) || input.order < PAGE_ORDER_MIN || input.order > PAGE_ORDER_MAX) {
    errors.order = `Kolejność musi być liczbą od ${PAGE_ORDER_MIN} do ${PAGE_ORDER_MAX}`;
  }

  if (input.heroImage && !isLikelyHttpUrl(input.heroImage.trim())) {
    errors.heroImage = "Podaj poprawny adres URL rozpoczynający się od http:// lub https://";
  }

  if (input.seoTitle && input.seoTitle.trim().length > SEO_TITLE_MAX_LENGTH) {
    errors.seoTitle = `SEO tytuł może mieć maksymalnie ${SEO_TITLE_MAX_LENGTH} znaków`;
  }

  if (input.seoDescription && input.seoDescription.trim().length > SEO_DESCRIPTION_MAX_LENGTH) {
    errors.seoDescription = `SEO opis może mieć maksymalnie ${SEO_DESCRIPTION_MAX_LENGTH} znaków`;
  }

  if (input.canonicalUrl && !isLikelyHttpUrl(input.canonicalUrl.trim())) {
    errors.canonicalUrl = "Canonical URL musi być poprawnym adresem http:// lub https://";
  }

  if (input.ogTitle && input.ogTitle.trim().length > OG_TITLE_MAX_LENGTH) {
    errors.ogTitle = `OG tytuł może mieć maksymalnie ${OG_TITLE_MAX_LENGTH} znaków`;
  }

  if (input.ogDescription && input.ogDescription.trim().length > OG_DESCRIPTION_MAX_LENGTH) {
    errors.ogDescription = `OG opis może mieć maksymalnie ${OG_DESCRIPTION_MAX_LENGTH} znaków`;
  }

  return errors;
}