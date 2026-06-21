import { motion } from "framer-motion";
import ArticleCard from "./ArticleCard";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { getCategoryHref } from "@/lib/articleRouting";
import { useResolvedArticles } from "@/hooks/use-resolved-articles";
import { useArticles } from "@/hooks/use-articles-api";

interface CategorySectionProps {
  id: string;
  title: string;
  category: "miasto" | "rozrywka" | "kultura" | "biznes" | "gastronomia" | "bydgoszczanie" | "medyczna" | "sport" | "polityka" | "inwestycje" | "nasze_dzialania";
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  bgColor?: string;
  className?: string;
}

const categoryShells: Record<CategorySectionProps["category"], string> = {
  miasto: "bg-[linear-gradient(135deg,rgba(239,246,255,0.92),rgba(255,255,255,0.84)_42%,rgba(240,249,255,0.9))] dark:bg-[linear-gradient(135deg,rgba(30,58,138,0.14),rgba(15,23,42,0.30)_42%,rgba(30,64,175,0.11))]",
  rozrywka: "bg-[linear-gradient(135deg,rgba(250,245,255,0.92),rgba(255,255,255,0.84)_42%,rgba(253,242,248,0.88))] dark:bg-[linear-gradient(135deg,rgba(88,28,135,0.14),rgba(15,23,42,0.30)_42%,rgba(107,33,168,0.11))]",
  kultura: "bg-[linear-gradient(135deg,rgba(255,251,235,0.94),rgba(255,255,255,0.86)_42%,rgba(255,247,237,0.9))] dark:bg-[linear-gradient(135deg,rgba(120,53,15,0.16),rgba(15,23,42,0.30)_42%,rgba(146,64,14,0.12))]",
  biznes: "bg-[linear-gradient(135deg,rgba(236,253,245,0.94),rgba(255,255,255,0.86)_42%,rgba(240,253,250,0.88))] dark:bg-[linear-gradient(135deg,rgba(6,78,59,0.15),rgba(15,23,42,0.30)_42%,rgba(6,95,70,0.11))]",
  gastronomia: "bg-[linear-gradient(135deg,rgba(255,247,237,0.94),rgba(255,255,255,0.86)_42%,rgba(255,251,235,0.9))] dark:bg-[linear-gradient(135deg,rgba(124,45,18,0.16),rgba(15,23,42,0.30)_42%,rgba(154,52,18,0.12))]",
  bydgoszczanie: "bg-[linear-gradient(135deg,rgba(255,241,242,0.94),rgba(255,255,255,0.86)_42%,rgba(253,242,248,0.9))] dark:bg-[linear-gradient(135deg,rgba(136,19,55,0.15),rgba(15,23,42,0.30)_42%,rgba(159,18,57,0.11))]",
  medyczna: "bg-[linear-gradient(135deg,rgba(236,254,255,0.94),rgba(255,255,255,0.86)_42%,rgba(240,253,255,0.9))] dark:bg-[linear-gradient(135deg,rgba(8,51,68,0.15),rgba(15,23,42,0.30)_42%,rgba(6,78,59,0.11))]",
  sport: "bg-[linear-gradient(135deg,rgba(239,246,255,0.94),rgba(255,255,255,0.86)_42%,rgba(238,242,255,0.9))] dark:bg-[linear-gradient(135deg,rgba(30,58,138,0.16),rgba(15,23,42,0.30)_42%,rgba(37,99,235,0.12))]",
  polityka: "bg-[linear-gradient(135deg,rgba(248,250,252,0.94),rgba(255,255,255,0.86)_42%,rgba(241,245,249,0.9))] dark:bg-[linear-gradient(135deg,rgba(51,65,85,0.15),rgba(15,23,42,0.30)_42%,rgba(71,85,105,0.11))]",
  inwestycje: "bg-[linear-gradient(135deg,rgba(254,252,232,0.94),rgba(255,255,255,0.86)_42%,rgba(254,249,195,0.9))] dark:bg-[linear-gradient(135deg,rgba(113,63,18,0.15),rgba(15,23,42,0.30)_42%,rgba(146,64,14,0.11))]",
  nasze_dzialania: "bg-[linear-gradient(135deg,rgba(250,245,255,0.94),rgba(255,255,255,0.86)_42%,rgba(250,232,255,0.9))] dark:bg-[linear-gradient(135deg,rgba(88,28,135,0.15),rgba(15,23,42,0.30)_42%,rgba(126,34,206,0.11))]",
};

const categoryOrbs: Record<CategorySectionProps["category"], { top: string; bottom: string; line: string }> = {
  miasto: {
    top: "bg-sky-200/60",
    bottom: "bg-blue-200/40",
    line: "from-sky-300/80 via-blue-200/30 to-transparent",
  },
  rozrywka: {
    top: "bg-fuchsia-200/55",
    bottom: "bg-violet-200/35",
    line: "from-fuchsia-300/80 via-violet-200/30 to-transparent",
  },
  kultura: {
    top: "bg-amber-200/60",
    bottom: "bg-orange-200/35",
    line: "from-amber-300/80 via-orange-200/30 to-transparent",
  },
  biznes: {
    top: "bg-emerald-200/60",
    bottom: "bg-teal-200/35",
    line: "from-emerald-300/80 via-teal-200/30 to-transparent",
  },
  gastronomia: {
    top: "bg-orange-200/60",
    bottom: "bg-amber-200/35",
    line: "from-orange-300/80 via-amber-200/30 to-transparent",
  },
  bydgoszczanie: {
    top: "bg-rose-200/60",
    bottom: "bg-pink-200/35",
    line: "from-rose-300/80 via-pink-200/30 to-transparent",
  },
  medyczna: {
    top: "bg-cyan-200/60",
    bottom: "bg-teal-200/35",
    line: "from-cyan-300/80 via-teal-200/30 to-transparent",
  },
  sport: {
    top: "bg-blue-200/60",
    bottom: "bg-indigo-200/40",
    line: "from-blue-300/80 via-indigo-200/30 to-transparent",
  },
  polityka: {
    top: "bg-slate-200/60",
    bottom: "bg-gray-200/35",
    line: "from-slate-300/80 via-gray-200/30 to-transparent",
  },
  inwestycje: {
    top: "bg-amber-200/60",
    bottom: "bg-yellow-200/40",
    line: "from-amber-300/80 via-yellow-200/30 to-transparent",
  },
  nasze_dzialania: {
    top: "bg-purple-200/60",
    bottom: "bg-fuchsia-200/35",
    line: "from-purple-300/80 via-fuchsia-200/30 to-transparent",
  },
};

const categoryButtonColors: Record<CategorySectionProps["category"], string> = {
  miasto: "hover:bg-blue-600 hover:text-white hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600",
  rozrywka: "hover:bg-purple-600 hover:text-white hover:border-purple-600 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600",
  kultura: "hover:bg-amber-600 hover:text-white hover:border-amber-600 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600",
  biznes: "hover:bg-emerald-600 hover:text-white hover:border-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
  gastronomia: "hover:bg-orange-600 hover:text-white hover:border-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600",
  bydgoszczanie: "hover:bg-rose-600 hover:text-white hover:border-rose-600 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600",
  medyczna: "hover:bg-cyan-600 hover:text-white hover:border-cyan-600 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600",
  sport: "hover:bg-blue-600 hover:text-white hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600",
  polityka: "hover:bg-slate-700 hover:text-white hover:border-slate-700 group-hover:bg-slate-700 group-hover:text-white group-hover:border-slate-700",
  inwestycje: "hover:bg-amber-600 hover:text-white hover:border-amber-600 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600",
  nasze_dzialania: "hover:bg-purple-600 hover:text-white hover:border-purple-600 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600",
};

export default function CategorySection({ id, title, category, description, icon, accentColor, className = "", prefetchedArticles }: CategorySectionProps & { prefetchedArticles?: any[] }) {
  const shouldFetch = prefetchedArticles === undefined;
  const { articles: fetchedArticles, isLoading } = useArticles({
    category,
    limit: shouldFetch ? 7 : 0,
  });
  const articlesToUse = prefetchedArticles !== undefined ? prefetchedArticles.slice(0, 7) : fetchedArticles;
  const resolvedArticles = useResolvedArticles(articlesToUse as any);
  const navigate = useNavigate();
  const shellClass = categoryShells[category];
  const orbClass = categoryOrbs[category];
  const buttonColorClass = categoryButtonColors[category];
  const categoryHref = getCategoryHref(category);

  return (
    <section id={id} className={`pt-8 pb-8 scroll-mt-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`group relative overflow-hidden rounded-[2.25rem] border border-white/85 dark:border-white/10 px-5 py-6 shadow-[0_24px_64px_-16px_rgba(15,23,42,0.09)] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.5)] backdrop-blur-md sm:px-7 sm:py-7 transition-all duration-300 ${shellClass}`}>
          <div className={`pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-1/4 -translate-y-1/4 rounded-full blur-[72px] ${orbClass.top}`} />
          <div className={`pointer-events-none absolute bottom-0 left-0 h-44 w-44 -translate-x-1/4 translate-y-1/4 rounded-full blur-[72px] ${orbClass.bottom}`} />
          <div className={`pointer-events-none absolute left-8 right-8 top-0 h-px bg-gradient-to-r ${orbClass.line} opacity-90`} />
          <div className={`pointer-events-none absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r ${orbClass.line} opacity-60`} />
          <div className="pointer-events-none absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.10) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-[1.25rem] ${accentColor} flex items-center justify-center shadow-md ring-1 ring-white/90`}>
                  {icon}
                </div>
                <div>
                  <h2 className="text-[1.6rem] font-black text-slate-900 tracking-tight">{title}</h2>
                  <p className="text-[14px] text-slate-600 font-medium">{description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(categoryHref)}
                  className={`group/btn hidden h-11 rounded-[1.25rem] border-white/85 bg-white/85 px-6 text-sm font-extrabold text-slate-700 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:inline-flex ${buttonColorClass}`}
                >
                  Zobacz więcej
                  <ChevronRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(categoryHref)}
                  className={`group/btn inline-flex h-10 rounded-[1.1rem] border-white/85 bg-white/85 px-5 text-sm font-extrabold text-slate-700 shadow-md transition-all duration-300 hover:shadow-lg sm:hidden ${buttonColorClass}`}
                >
                  Więcej
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </motion.div>

            {shouldFetch && isLoading ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] xl:grid-cols-[1fr_1fr]">
                <div className="h-[28rem] rounded-[2rem] bg-white/65 animate-pulse shadow-sm" />
                <div className="grid content-start grid-cols-1 gap-6 sm:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-56 rounded-[2rem] bg-white/65 animate-pulse shadow-sm" />
                  ))}
                </div>
              </div>
            ) : resolvedArticles.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>Brak artykułów w tej kategorii.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] xl:grid-cols-[1fr_1fr]">
                <div className="grid content-start gap-6">
                  <motion.div
                    key={resolvedArticles[0]?.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {resolvedArticles[0] && <ArticleCard article={resolvedArticles[0]} featured index={0} large />}
                  </motion.div>

                  {resolvedArticles[1] && (
                    <motion.div
                      key={resolvedArticles[1]._id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ArticleCard article={resolvedArticles[1]} featured index={1} wide />
                    </motion.div>
                  )}

                  {resolvedArticles[2] && (
                    <motion.div
                      key={resolvedArticles[2]._id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ArticleCard article={resolvedArticles[2]} featured index={2} wideCompact />
                    </motion.div>
                  )}
                </div>

                <div className="grid content-start grid-cols-1 gap-6 sm:grid-cols-2">
                  {resolvedArticles.slice(3).map((article: any, i: number) => (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ArticleCard article={article} featured index={i + 3} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
