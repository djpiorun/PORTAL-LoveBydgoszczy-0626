import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ArticleCard from "@/components/ArticleCard";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useResolvedArticles } from "@/hooks/use-resolved-articles";
import { usePaginatedArticles } from "@/hooks/use-articles-api";

const ITEMS_PER_PAGE = 5;

export default function AktualnosciSection() {
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { articles, isLoading, meta, page, setPage } = usePaginatedArticles({
    category: activeCategory === "all" ? undefined : activeCategory,
    perPage: ITEMS_PER_PAGE,
    page: currentPage,
  });
  const resolvedResults = useResolvedArticles(articles);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
    setPage(1);
  }, [activeCategory, setPage]);

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    setPage(nextPage);
    
    // Scroll to top of section smoothly
    const el = document.getElementById("aktualnosci");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    const nextPage = Math.max(1, currentPage - 1);
    setCurrentPage(nextPage);
    setPage(nextPage);
    
    // Scroll to top of section smoothly
    const el = document.getElementById("aktualnosci");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const currentResults = resolvedResults ?? [];
  const totalPages = meta?.last_page ?? 1;

  const categories = [
    { id: "all", label: "Wszystkie" },
    { id: "miasto", label: "Miasto" },
    { id: "sport", label: "Sport" },
    { id: "polityka", label: "Polityka" },
    { id: "inwestycje", label: "Inwestycje" },
    { id: "nasze_dzialania", label: "Nasze Działania" },
    { id: "rozrywka", label: "Rozrywka" },
    { id: "kultura", label: "Kultura" },
    { id: "biznes", label: "Biznes" },
  ];

  return (
    <section id="aktualnosci" className="scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary/12 flex items-center justify-center shadow-md border border-primary/25">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-[1.65rem] font-black tracking-tight text-slate-900 dark:text-foreground">Aktualności</h2>
            <p className="mt-0.5 text-[13px] font-medium text-slate-500 dark:text-muted-foreground">Najnowsze artykuły, wywiady i relacje z życia miasta</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat.id
                  ? "scale-105 bg-primary text-primary-foreground shadow-md"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-primary/30 hover:shadow-sm dark:border-border/70 dark:bg-card/50 dark:text-muted-foreground dark:hover:bg-card/75"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col gap-5">
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <div key={i} className="h-56 rounded-[1.75rem] bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse shadow-sm border border-slate-100/50 dark:from-card/60 dark:to-card/40 dark:border-border/30" />
          ))}
        </div>
      ) : (resolvedResults?.length ?? 0) === 0 ? (
        <div className="rounded-[2rem] border border-slate-100 bg-slate-50 py-16 text-center dark:border-border/70 dark:bg-card/42">
          <p className="text-lg font-medium text-slate-500 dark:text-muted-foreground">Brak artykułów w tej kategorii.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {currentResults.length > 0 ? (
            currentResults.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} list />
            ))
          ) : (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {/* Pagination Controls */}
          <div className="night-soft-surface-strong mt-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-border/70 dark:bg-card/52">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-foreground dark:hover:bg-card/70"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Poprzednia</span>
            </button>
            
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm font-bold text-slate-700 dark:text-foreground">
                Strona {currentPage} z {totalPages}
              </span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-foreground dark:hover:bg-card/70"
            >
              <span className="hidden sm:inline">Następna</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
