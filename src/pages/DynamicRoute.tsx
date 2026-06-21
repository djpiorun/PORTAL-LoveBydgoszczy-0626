import { useEffect, useState } from "react";
import { useParams } from "react-router";
import CategoryPage from "./CategoryPage";
import ArticlePage, { RestArticlePage } from "./ArticlePage";
import StaticPage from "./StaticPage";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

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

  const [restArticle, setRestArticle] = useState<any | null | undefined>(undefined);
  const [cmsPage, setCmsPage] = useState<any | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) {
      setRestArticle(null);
      return;
    }

    const controller = new AbortController();
    setRestArticle(undefined);

    const fetchRestArticle = async () => {
      try {
        const response = await fetch(`/api/articles/slug/${encodeURIComponent(slug)}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          setRestArticle(null);
          return;
        }

        const payload = await response.json();
        const data = payload?.data ?? payload;
        const articleData = data?.data ?? data;
        if (articleData?.id) {
          setRestArticle(articleData);
          return;
        }

        setRestArticle(null);
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        setRestArticle(null);
      }
    };

    void fetchRestArticle();

    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setCmsPage(undefined);
    const loadPage = async () => {
      try {
        const payload = await apiFetch<any>(`/pages/slug/${slug}`);
        if (!active) return;
        const data = payload?.data ?? payload ?? null;
        setCmsPage(data);
      } catch (error) {
        if (!active) return;
        setCmsPage(null);
        toast.warning("Strony CMS są chwilowo niedostępne.");
      }
    };

    loadPage();
    return () => {
      active = false;
    };
  }, [slug]);

  if (!slug) return null;

  if (restArticle) {
    return <RestArticlePage article={restArticle} />;
  }

  if (restArticle === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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