import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Eye, FileText, ShieldAlert, ChevronRight, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { sanitizePageHtml } from "@/lib/page-content";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

const PAGE_TYPE_LABELS: Record<string, string> = {
  standard: "Strona",
  contact: "Kontakt",
  legal: "Dokument prawny",
  about: "O nas",
  editorial: "Redakcja",
};

export default function StaticPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminPreview = searchParams.get("preview") === "admin";
  const [publicPage, setPublicPage] = useState<any | null | undefined>(undefined);
  const [previewPage, setPreviewPage] = useState<any | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) {
      setPublicPage(null);
      return;
    }
    let active = true;
    setPublicPage(undefined);
    apiFetch<any>(`/pages/slug/${slug}`)
      .then((payload) => {
        if (!active) return;
        const data = payload?.data ?? payload?.page ?? payload;
        if (!data) {
          setPublicPage(null);
          return;
        }
        setPublicPage({
          ...data,
          _id: String(data?.id ?? data?._id ?? ""),
          content: data?.content ?? "",
          pageType: data?.pageType ?? data?.page_type ?? "standard",
          heroImage: data?.heroImage ?? data?.hero_image ?? null,
          excerpt: data?.excerpt ?? null,
          seoTitle: data?.seoTitle ?? data?.seo_title ?? null,
          seoDescription: data?.seoDescription ?? data?.seo_description ?? null,
          canonicalUrl: data?.canonicalUrl ?? data?.canonical_url ?? null,
          robots: data?.robots ?? null,
          ogTitle: data?.ogTitle ?? data?.og_title ?? null,
          ogDescription: data?.ogDescription ?? data?.og_description ?? null,
          ogImage: data?.ogImage ?? data?.og_image ?? null,
          updatedAt: data?.updatedAt ?? data?.updated_at ?? null,
        });
      })
      .catch(() => {
        if (!active) return;
        setPublicPage(null);
        toast.warning("Nie udało się pobrać strony.");
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!isAdminPreview || !slug) {
      setPreviewPage(undefined);
      return;
    }
    let active = true;
    setPreviewPage(undefined);
    apiFetch<any>(`/admin/pages/slug/${slug}`)
      .then((payload) => {
        if (!active) return;
        const data = payload?.data ?? payload?.page ?? payload;
        if (!data) {
          setPreviewPage(null);
          return;
        }
        setPreviewPage({
          ...data,
          _id: String(data?.id ?? data?._id ?? ""),
          content: data?.content ?? "",
          pageType: data?.pageType ?? data?.page_type ?? "standard",
          heroImage: data?.heroImage ?? data?.hero_image ?? null,
          excerpt: data?.excerpt ?? null,
          seoTitle: data?.seoTitle ?? data?.seo_title ?? null,
          seoDescription: data?.seoDescription ?? data?.seo_description ?? null,
          canonicalUrl: data?.canonicalUrl ?? data?.canonical_url ?? null,
          robots: data?.robots ?? null,
          ogTitle: data?.ogTitle ?? data?.og_title ?? null,
          ogDescription: data?.ogDescription ?? data?.og_description ?? null,
          ogImage: data?.ogImage ?? data?.og_image ?? null,
          updatedAt: data?.updatedAt ?? data?.updated_at ?? null,
          status: data?.status ?? null,
        });
      })
      .catch(() => {
        if (!active) return;
        setPreviewPage(null);
        toast.warning("Podgląd strony jest niedostępny.");
      });

    return () => {
      active = false;
    };
  }, [isAdminPreview, slug]);

  const page = isAdminPreview ? previewPage : publicPage;
  const sanitizedContent = useMemo(() => sanitizePageHtml(page?.content), [page?.content]);
  const isDraftPreview = page?.status === "draft";

  // Loading state
  if (page === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-border animate-pulse" />
            <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Ładowanie strony…</p>
        </div>
        <Footer />
      </div>
    );
  }

  // 404 state
  if (page === null) {
    return (
      <div className="min-h-screen bg-background">
        <SEO
          title="Strona nie istnieje"
          description="Nie znaleziono strony o podanym adresie."
          url={typeof window !== "undefined" ? window.location.href : undefined}
        />
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border/60 bg-muted/40">
              <FileText className="h-9 w-9 text-muted-foreground/40" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground mb-2">Strona nie istnieje</h1>
              <p className="text-muted-foreground text-sm max-w-sm">
                Nie znaleziono strony o podanym adresie. Sprawdź, czy link jest poprawny.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              <Home className="h-4 w-4" />
              Wróć na stronę główną
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const updatedDate = page.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const pageTypeLabel = PAGE_TYPE_LABELS[page.pageType] ?? "Strona";
  const hasHero = Boolean(page.heroImage);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={isDraftPreview ? `${page.seoTitle || page.title} (podgląd szkicu)` : page.seoTitle || page.title}
        description={page.seoDescription || page.excerpt || undefined}
        image={page.heroImage || undefined}
        url={typeof window !== "undefined" ? window.location.href : undefined}
        canonicalUrl={page.canonicalUrl || undefined}
        robots={page.robots || undefined}
        ogTitle={page.ogTitle || undefined}
        ogDescription={page.ogDescription || undefined}
        ogImage={page.ogImage || page.heroImage || undefined}
      />
      <Navbar />

      {/* Hero section */}
      <section className={`relative overflow-hidden ${hasHero ? "pt-0" : "pt-24 pb-12"}`}>
        {hasHero ? (
          <>
            {/* Full-bleed hero image */}
            <div className="relative h-[38vh] min-h-[260px] max-h-[480px] w-full overflow-hidden">
              <img
                src={page.heroImage!}
                alt={page.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />
            </div>
            {/* Title overlapping the hero */}
            <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 -mt-20">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {isDraftPreview && (
                  <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-300/60 bg-amber-100/90 px-4 py-3 text-amber-900 backdrop-blur-sm dark:border-amber-800/40 dark:bg-amber-900/30 dark:text-amber-200">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-bold">Podgląd szkicu</span>
                    <span className="text-xs opacity-80">Ta wersja jest widoczna tylko dla administratora.</span>
                  </div>
                )}
                <Breadcrumb onBack={() => navigate(-1)} pageTypeLabel={pageTypeLabel} isDraftPreview={isDraftPreview} />
                <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-tight">
                  {page.title}
                </h1>
                {page.excerpt && (
                  <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                    {page.excerpt}
                  </p>
                )}
                {updatedDate && (
                  <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Aktualizacja: {updatedDate}</span>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        ) : (
          /* No hero — elegant gradient background */
          <>
            {/* Subtle decorative background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/3 blur-3xl" />
            </div>
            <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {isDraftPreview && (
                  <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-300/60 bg-amber-100/80 px-4 py-3 text-amber-900 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-200">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-bold">Podgląd szkicu</span>
                    <span className="text-xs opacity-80">Ta wersja jest widoczna tylko dla administratora.</span>
                  </div>
                )}
                <Breadcrumb onBack={() => navigate(-1)} pageTypeLabel={pageTypeLabel} isDraftPreview={isDraftPreview} />
                <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-tight">
                  {page.title}
                </h1>
                {page.excerpt && (
                  <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl border-l-2 border-primary/30 pl-4">
                    {page.excerpt}
                  </p>
                )}
                {updatedDate && (
                  <div className="flex items-center gap-2 mt-5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Aktualizacja: {updatedDate}</span>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </section>

      {/* Content section */}
      <section className={`pb-24 ${hasHero ? "pt-8" : "pt-10"}`}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
          >
            {sanitizedContent ? (
              <div
                className="article-content rounded-2xl border border-border/50 bg-card px-6 py-8 sm:px-10 sm:py-10 shadow-sm"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm italic">Brak treści.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Breadcrumb({
  onBack,
  pageTypeLabel,
  isDraftPreview,
}: {
  onBack: () => void;
  pageTypeLabel: string;
  isDraftPreview: boolean;
}) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <button
        onClick={onBack}
        className="flex items-center gap-1 font-semibold hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Wróć
      </button>
      <ChevronRight className="h-3 w-3 opacity-40" />
      <span className="font-medium">{pageTypeLabel}</span>
      {isDraftPreview && (
        <>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
            <Eye className="h-3 w-3" />
            Szkic
          </span>
        </>
      )}
    </nav>
  );
}