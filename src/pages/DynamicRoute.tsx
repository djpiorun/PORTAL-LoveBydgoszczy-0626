import { useParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CategoryPage from "./CategoryPage";
import ArticlePage from "./ArticlePage";
import StaticPage from "./StaticPage";

export const DYNAMIC_ROUTE_CATEGORIES = [
  "miasto", "rozrywka", "kultura", "biznes", "gastronomia", "medyczna", "bydgoszczanie",
  "sport", "polityka", "inwestycje", "nasze-dzialania", "nasze_dzialania"
] as const;

// Reserved system slugs that must never be handled by CMS
export const DYNAMIC_ROUTE_RESERVED_SLUGS = new Set([
  "panel", "admin", "auth", "logowanie", "login", "dashboard", "api",
  "wydarzenie", "szukaj", "rolka", "pogoda", "rozklad", "rozklad-jazdy",
  "nekrolog", "autor", "aktualizacje", "profil", "kontakt", "strona",
  "nasze-dzialania", "nasze_dzialania",
]);

/** Pure routing decision — exported for testing */
export type RouteDecision = "category" | "cms" | "article" | "reserved";
export function resolveRouteDecision(slug: string, cmsPageExists: boolean): RouteDecision {
  const lower = slug.toLowerCase();
  if (DYNAMIC_ROUTE_RESERVED_SLUGS.has(lower) && !DYNAMIC_ROUTE_CATEGORIES.includes(lower as typeof DYNAMIC_ROUTE_CATEGORIES[number])) return "reserved";
  if (DYNAMIC_ROUTE_CATEGORIES.includes(lower as typeof DYNAMIC_ROUTE_CATEGORIES[number])) return "category";
  if (cmsPageExists) return "cms";
  return "article";
}

export default function DynamicRoute() {
  const { slug } = useParams<{ slug: string }>();

  // Check if this slug belongs to a CMS static page
  const cmsPage = useQuery(api.pages.getBySlug, slug ? { slug } : "skip");

  if (!slug) return null;

  const lowerSlug = slug.toLowerCase();

  if (DYNAMIC_ROUTE_RESERVED_SLUGS.has(lowerSlug) && !DYNAMIC_ROUTE_CATEGORIES.includes(lowerSlug as typeof DYNAMIC_ROUTE_CATEGORIES[number])) {
    return <ArticlePage />;
  }

  if (DYNAMIC_ROUTE_CATEGORIES.includes(lowerSlug as typeof DYNAMIC_ROUTE_CATEGORIES[number])) {
    return <CategoryPage />;
  }

  // If CMS page query is still loading, wait
  if (cmsPage === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If a published CMS page exists for this slug, render it
  if (cmsPage !== null) {
    return <StaticPage />;
  }

  // Otherwise treat as article
  return <ArticlePage />;
}