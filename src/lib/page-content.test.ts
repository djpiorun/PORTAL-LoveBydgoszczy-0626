import { describe, expect, test } from "bun:test";
import {
  canViewAdminPreview,
  canViewPublicPage,
  getPageVersionSummary,
  getVisiblePagesForPlacement,
  hasSlugConflict,
  isPageArchived,
  isPageDeleted,
  isPageScheduled,
  isValidPageSlug,
  matchesPageSearch,
  sanitizePageHtml,
  slugify,
} from "./page-content";

describe("page-content helpers", () => {
  test("slug validation and normalization", () => {
    expect(slugify("Polityka prywatności")).toBe("polityka-prywatnosci");
    expect(isValidPageSlug("o-nas")).toBe(true);
    expect(isValidPageSlug("O Nas")).toBe(false);
  });

  test("detects slug conflict", () => {
    expect(hasSlugConflict([{ _id: "page-1", slug: "o-nas" }], "o-nas", undefined)).toBe(true);
    expect(hasSlugConflict([{ _id: "page-1", slug: "o-nas" }], "o-nas", "page-2")).toBe(true);
    expect(hasSlugConflict([{ _id: "page-1", slug: "o-nas" }], "o-nas", "page-1")).toBe(false);
  });

  test("sanitizes html", () => {
    const html = `<p onclick="alert(1)">Test</p><script>alert(1)</script><a href="javascript:alert(2)">x</a>`;
    const sanitized = sanitizePageHtml(html);
    expect(sanitized).toContain("<p>Test</p>");
    expect(sanitized).not.toContain("script");
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).toContain('href="#"');
  });

  test("public access excludes drafts and soft-deleted pages", () => {
    expect(canViewPublicPage({ status: "published" })).toBe(true);
    expect(canViewPublicPage({ status: "draft" })).toBe(false);
    expect(canViewPublicPage({ status: "published", deletedAt: Date.now() })).toBe(false);
  });

  test("public access includes draft with past publishAt", () => {
    const pastTs = Date.now() - 60_000;
    expect(canViewPublicPage({ status: "draft", publishAt: pastTs })).toBe(true);
    const futureTs = Date.now() + 60_000;
    expect(canViewPublicPage({ status: "draft", publishAt: futureTs })).toBe(false);
  });

  test("public access excludes archived pages", () => {
    expect(canViewPublicPage({ status: "published", archivedAt: Date.now() })).toBe(false);
  });

  test("admin preview excludes soft-deleted pages", () => {
    expect(canViewAdminPreview({ deletedAt: undefined })).toBe(true);
    expect(canViewAdminPreview({ deletedAt: Date.now() })).toBe(false);
  });

  test("isPageArchived detects archivedAt", () => {
    expect(isPageArchived({ archivedAt: Date.now() })).toBe(true);
    expect(isPageArchived({ archivedAt: undefined })).toBe(false);
  });

  test("isPageDeleted detects deletedAt", () => {
    expect(isPageDeleted({ deletedAt: Date.now() })).toBe(true);
    expect(isPageDeleted({ deletedAt: undefined })).toBe(false);
  });

  test("isPageScheduled detects future publishAt on draft", () => {
    const future = Date.now() + 60_000;
    expect(isPageScheduled({ status: "draft", publishAt: future })).toBe(true);
    expect(isPageScheduled({ status: "published", publishAt: future })).toBe(false);
    expect(isPageScheduled({ status: "draft", publishAt: undefined })).toBe(false);
    const past = Date.now() - 60_000;
    expect(isPageScheduled({ status: "draft", publishAt: past })).toBe(false);
  });

  test("menu and footer only return published, visible, non-deleted, non-archived pages", () => {
    const pages = [
      { status: "published" as const, deletedAt: undefined, archivedAt: undefined, publishAt: undefined, isVisibleInMenu: true, isVisibleInFooter: false, order: 2 },
      { status: "draft" as const, deletedAt: undefined, archivedAt: undefined, publishAt: undefined, isVisibleInMenu: true, isVisibleInFooter: true, order: 1 },
      { status: "published" as const, deletedAt: Date.now(), archivedAt: undefined, publishAt: undefined, isVisibleInMenu: true, isVisibleInFooter: true, order: 0 },
      { status: "published" as const, deletedAt: undefined, archivedAt: Date.now(), publishAt: undefined, isVisibleInMenu: true, isVisibleInFooter: true, order: 3 },
      { status: "published" as const, deletedAt: undefined, archivedAt: undefined, publishAt: undefined, isVisibleInMenu: false, isVisibleInFooter: true, order: 4 },
    ];
    expect(getVisiblePagesForPlacement(pages, "menu")).toHaveLength(1);
    expect(getVisiblePagesForPlacement(pages, "footer")).toHaveLength(1);
  });

  test("search matches excerpt too", () => {
    const page = { title: "O nas", slug: "o-nas", excerpt: "Lokalny portal z Bydgoszczy" };
    expect(matchesPageSearch(page, "portal")).toBe(true);
    expect(matchesPageSearch(page, "bydgoszczy")).toBe(true);
    expect(matchesPageSearch(page, "regulamin")).toBe(false);
  });

  test("builds readable version summary", () => {
    expect(
      getPageVersionSummary({ source: "manual", title: "O nas", slug: "o-nas", status: "draft", pageType: "about" }),
    ).toContain("Zapis ręczny");
  });
});

describe("CMS routing — reserved slugs", () => {
  // Mirror of RESERVED_SLUGS from DynamicRoute.tsx
  const RESERVED_SLUGS = new Set([
    "panel", "admin", "auth", "logowanie", "login", "dashboard", "api",
    "wydarzenie", "szukaj", "rolka", "pogoda", "rozklad", "rozklad-jazdy",
    "nekrolog", "autor", "aktualizacje", "profil", "kontakt", "strona",
    "nasze-dzialania", "nasze_dzialania",
  ]);

  const categories = new Set([
    "miasto", "rozrywka", "kultura", "biznes", "gastronomia", "medyczna", "bydgoszczanie",
    "sport", "polityka", "inwestycje", "nasze-dzialania", "nasze_dzialania",
  ]);

  function resolveRoute(slug: string, cmsPageExists: boolean): "category" | "cms" | "article" | "reserved" {
    const lower = slug.toLowerCase();
    if (RESERVED_SLUGS.has(lower) && !categories.has(lower)) return "reserved";
    if (categories.has(lower)) return "category";
    if (cmsPageExists) return "cms";
    return "article";
  }

  test("system slugs are reserved and never handled by CMS", () => {
    expect(resolveRoute("panel", true)).toBe("reserved");
    expect(resolveRoute("admin", true)).toBe("reserved");
    expect(resolveRoute("auth", true)).toBe("reserved");
    expect(resolveRoute("logowanie", true)).toBe("reserved");
    expect(resolveRoute("api", true)).toBe("reserved");
    expect(resolveRoute("strona", true)).toBe("reserved");
  });

  test("category slugs are handled as categories, not CMS", () => {
    expect(resolveRoute("miasto", true)).toBe("category");
    expect(resolveRoute("sport", true)).toBe("category");
    expect(resolveRoute("medyczna", true)).toBe("category");
  });

  test("CMS page slug is handled by CMS when page exists", () => {
    expect(resolveRoute("polityka-prywatnosci", true)).toBe("cms");
    expect(resolveRoute("o-nas", true)).toBe("cms");
    expect(resolveRoute("regulamin", true)).toBe("cms");
  });

  test("unknown slug falls through to article when no CMS page exists", () => {
    expect(resolveRoute("jakis-artykul-123", false)).toBe("article");
  });

  test("redirect compatibility: /strona/:slug path is reserved", () => {
    // 'strona' itself is in RESERVED_SLUGS so it cannot be a CMS page slug
    expect(RESERVED_SLUGS.has("strona")).toBe(true);
  });
});