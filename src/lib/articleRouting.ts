export function buildArticleSlug(title: string) {
  const normalized = title
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (char) => ({ ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" }[char] ?? char))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.slice(0, 72).replace(/-+$/g, "") || "artykul";
}

export function getArticleSlug(article: { slug?: string | null; title: string }) {
  return article.slug?.trim() || buildArticleSlug(article.title);
}

export function getArticleHref(article: { _id: string; slug?: string | null; title: string }) {
  return `/${getArticleSlug(article)}`;
}

export function getCategoryHref(category: string) {
  if (category === "nasze_dzialania") return "/nasze-dzialania";
  return `/${category}`;
}
