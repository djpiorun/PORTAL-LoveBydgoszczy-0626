import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ArticleCard from "@/components/ArticleCard";
import { Heart, Users, Megaphone, Handshake, Target, TrendingUp, ChevronRight, ChevronLeft, Star, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { getArticleHref } from "@/lib/articleRouting";
import { useResolvedArticles } from "@/hooks/use-resolved-articles";

const ACTION_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  akcja: { label: "Akcja", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800", Icon: Target },
  projekt: { label: "Projekt", color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800", Icon: Sparkles },
  kampania: { label: "Kampania", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800", Icon: Megaphone },
  wspolpraca: { label: "Współpraca", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800", Icon: Handshake },
};

const ACTION_FILTERS = [
  { id: "all", label: "Wszystkie", color: "from-rose-600 to-pink-600", shadow: "shadow-rose-500/30", Icon: Heart },
  { id: "akcja", label: "Akcje", color: "from-red-600 to-rose-600", shadow: "shadow-red-500/30", Icon: Target },
  { id: "projekt", label: "Projekty", color: "from-pink-600 to-rose-600", shadow: "shadow-pink-500/30", Icon: Sparkles },
  { id: "kampania", label: "Kampanie", color: "from-amber-600 to-orange-600", shadow: "shadow-amber-500/30", Icon: Megaphone },
  { id: "wspolpraca", label: "Współpraca", color: "from-cyan-600 to-blue-600", shadow: "shadow-cyan-500/30", Icon: Handshake },
];

function OurActionsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-[500px] animate-pulse bg-rose-50 dark:bg-rose-950/20" />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-muted animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OurActionsCard({ article, index }: { article: any; index: number }) {
  const nav = useNavigate();
  const action = (article as any).ourActions;
  const actionType = action?.actionType;
  const typeCfg = actionType ? ACTION_TYPE_CONFIG[actionType] : null;
  const relationProject = article.__relationMeta?.ourActionsProjectLabel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: Math.min(index * 0.06, 0.4), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group cursor-pointer"
      onClick={() => nav(getArticleHref(article))}
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm transition-all duration-300 group-hover:border-rose-400/50 group-hover:shadow-2xl group-hover:shadow-rose-500/15">
        {article.imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {typeCfg && (
              <div className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm ${typeCfg.bg} ${typeCfg.color}`}>
                <typeCfg.Icon className="h-3 w-3" />
                {typeCfg.label}
              </div>
            )}
            {article.featured && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1">
                <Heart className="h-3 w-3 text-white fill-white" />
                <span className="text-[10px] font-black text-white">Inicjatywa</span>
              </div>
            )}
          </div>
        )}
        <div className="p-5">
          <h3 className="mb-2 line-clamp-2 text-base font-black leading-tight text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{article.title}</h3>
          {relationProject && <p className="mb-2 text-xs font-semibold text-rose-700 dark:text-rose-300">{relationProject}</p>}
          {article.excerpt && <p className="mb-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed">{article.excerpt}</p>}
          {action?.results && (
            <div className="mb-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-3 py-2">
              <p className="text-xs text-rose-700 dark:text-rose-400 font-medium line-clamp-1">{action.results}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{article.author || "Love Bydgoszcz"}</span>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Czytaj <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </motion.div>
  );
}

export default function OurActionsPage() {
  const nav = useNavigate();
  const articles = useQuery(api.articles.list, { category: "nasze_dzialania", limit: 50 });
  const resolvedArticles = useResolvedArticles(articles);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const filteredArticles = resolvedArticles?.filter(a => typeFilter === "all" || (a as any).ourActions?.actionType === typeFilter);

  if (resolvedArticles === undefined) return <OurActionsSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 dark:from-[#1a0408] dark:via-[#200610] dark:to-[#1a0408] pt-20 pb-0">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#ffffff15_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_50%,#ff000010_0%,transparent_60%)]" />
          <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/3 translate-x-1/3 rounded-full bg-white/15 dark:bg-rose-500/10 blur-[140px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/3 rounded-full bg-pink-200/20 dark:bg-pink-500/8 blur-[120px]" />
        </motion.div>

        {/* Logo watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <img
            src="/assets/logo-lovebydgoszcz.png"
            alt=""
            className="w-[520px] max-w-[70%] opacity-[0.07] select-none"
            style={{ filter: "brightness(10)" }}
          />
        </div>

        {/* Floating hearts */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { top: "18%", left: "7%", size: "h-12 w-12", dur: 6, delay: 0 },
            { top: "35%", right: "9%", size: "h-16 w-16", dur: 8, delay: 1.2 },
            { bottom: "30%", left: "11%", size: "h-10 w-10", dur: 7, delay: 0.6 },
            { bottom: "22%", right: "13%", size: "h-14 w-14", dur: 9, delay: 2 },
          ].map(({ size, dur, delay, ...pos }, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -14, 0], scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
              transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
              className="absolute text-white"
              style={pos as any}
            >
              <Heart className={`${size} fill-white`} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-center pb-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.button
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => nav(-1)}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/25 transition-colors backdrop-blur-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Powrót
              </motion.button>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 backdrop-blur-sm"
              >
                <Heart className="h-3 w-3 text-white fill-white" />
                <span className="text-[11px] font-black uppercase tracking-widest text-white">Nasze Działania</span>
              </motion.div>
            </div>

            <h1 className="mb-2 text-6xl font-black tracking-[-0.04em] text-white md:text-8xl" style={{ lineHeight: 0.88 }}>
              <span className="block">Nasze</span>
              <span className="block text-white/75 text-5xl md:text-6xl font-bold" style={{ marginTop: "-0.1em" }}>Działania</span>
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Inicjatywy, projekty i kampanie redakcji Love Bydgoszcz dla naszego miasta i społeczności
            </p>
          </motion.div>
        </div>

        <div className="relative z-10">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-16 w-full block">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z" className="fill-background" />
          </svg>
        </div>
      </div>

      {/* ── FILTER BAR ─────────────────────────────────────────────────────── */}
      <div className="border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto py-4 scrollbar-hide">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-md">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <div className="flex gap-2">
              {ACTION_FILTERS.map(f => (
                <motion.button
                  key={f.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setTypeFilter(f.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                    typeFilter === f.id
                      ? `bg-gradient-to-r ${f.color} text-white shadow-lg ${f.shadow}`
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <f.Icon className="h-3.5 w-3.5" />
                  {f.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Featured brand cards */}
        {filteredArticles && filteredArticles.some(a => a.featured) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">Nasze inicjatywy</h2>
                <p className="text-xs text-muted-foreground">Wyróżnione działania redakcji</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {filteredArticles.filter(a => a.featured).slice(0, 2).map((article, index) => {
                const action = (article as any).ourActions;
                return (
                  <motion.div
                    key={article._id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group relative cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-rose-600 dark:from-[#1a0408] dark:via-[#200610] dark:to-[#1a0408] p-7 shadow-2xl border border-rose-400/30 dark:border-rose-700/30"
                    onClick={() => nav(getArticleHref(article))}
                  >
                    <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/10 dark:bg-rose-500/10 blur-3xl" />
                    <div className="relative z-10">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-3 py-1">
                          <Heart className="h-3 w-3 text-white fill-white" />
                          <span className="text-xs font-black uppercase text-white">Inicjatywa</span>
                        </div>
                        {action?.actionType && ACTION_TYPE_CONFIG[action.actionType] && (
                          <div className="rounded-full border border-white/20 bg-white/15 px-3 py-1">
                            <span className="text-xs font-black uppercase text-white/80">
                              {ACTION_TYPE_CONFIG[action.actionType].label}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="mb-3 text-xl font-black leading-tight text-white">{article.title}</h3>
                      <p className="mb-4 text-sm leading-relaxed text-white/60">{article.excerpt}</p>
                      {action?.results && (
                        <div className="rounded-2xl border border-white/20 bg-white/15 p-3">
                          <p className="text-xs font-bold text-white/80">{action.results}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {filteredArticles?.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-24 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/20">
              <Heart className="h-12 w-12 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="mb-2 text-2xl font-black text-foreground">Brak działań</h3>
            <p className="text-muted-foreground">Nie znaleziono działań wybranego typu.</p>
          </motion.div>
        )}

        {/* Grid */}
        {filteredArticles && filteredArticles.length > 0 && (
          <>
            <div className="mb-6 flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-400" />
              <p className="text-sm font-bold text-muted-foreground">
                <span className="text-foreground">{filteredArticles.length}</span> działań
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article, index) => (
                <OurActionsCard key={article._id} article={article} index={index} />
              ))}
            </div>
          </>
        )}
      </div>

      <BackToTop />
      <Footer />
    </div>
  );
}
