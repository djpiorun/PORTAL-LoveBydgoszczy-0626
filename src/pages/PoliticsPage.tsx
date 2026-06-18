import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Building2, FileText, Users, ChevronRight, BookOpen, Scale, Landmark, Globe, Calendar } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { getArticleHref } from "@/lib/articleRouting";
import { useResolvedArticles } from "@/hooks/use-resolved-articles";

const PARTY_COLORS: Record<string, string> = {
  "Koalicja Obywatelska": "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  "Prawo i Sprawiedliwość": "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  "Trzecia Droga": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  "Lewica": "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

function PoliticsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-[480px] animate-pulse bg-slate-100 dark:bg-slate-900/50" />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border/40 bg-card animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="h-44 bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-muted rounded-full w-3/4" />
                <div className="h-3 bg-muted rounded-full w-full" />
                <div className="h-3 bg-muted rounded-full w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PoliticsArticleCard({ article, index }: { article: any; index: number }) {
  const nav = useNavigate();
  const img = article.imageUrl;
  const party = article.__relationMeta?.primaryParty || (article as any).politics?.politicians?.[0]?.party;
  const partyClass = party ? (PARTY_COLORS[party] || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700") : null;
  const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("pl-PL", { day: "numeric", month: "short" }) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.07, 0.45), duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.25, ease: "easeOut" } }}
      className="group cursor-pointer h-full"
      onClick={() => nav(getArticleHref(article))}
    >
      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 group-hover:border-slate-400/60 dark:group-hover:border-slate-500/60 group-hover:shadow-2xl group-hover:shadow-slate-500/10 h-full">
        {img ? (
          <div className="relative h-52 overflow-hidden shrink-0">
            <img src={img} alt={article.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-slate-800/0 group-hover:bg-slate-800/10 transition-colors duration-500" />
            {partyClass && (
              <div className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm ${partyClass}`}>
                {party}
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-52 shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/50 dark:to-slate-900/50 flex items-center justify-center overflow-hidden">
            <motion.div
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Scale className="h-14 w-14 text-slate-300 dark:text-slate-600" />
            </motion.div>
            {partyClass && (
              <div className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${partyClass}`}>
                {party}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col flex-1 p-5">
          <h3 className="mb-2 line-clamp-2 text-base font-black leading-tight text-foreground group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-200">{article.title}</h3>
          {article.excerpt && <p className="mb-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed flex-1">{article.excerpt}</p>}
          <div className="mt-auto pt-3 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-[9px] font-black text-slate-600 dark:text-slate-300">
                  {(article.author || "L").charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[90px]">{article.author || "Love Bydgoszcz"}</span>
                {date && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground/70 shrink-0">
                      <Calendar className="h-3 w-3" />{date}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 transition-all duration-200 group-hover:border-slate-400 dark:group-hover:border-slate-500 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50">
                Czytaj <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
      </div>
    </motion.div>
  );
}

function PoliticianCover({ politician }: { politician: any }) {
  return (
    <Link to={`/polityka/polityk/${politician.slug}`}>
      <motion.div
        whileHover={{ scale: 1.08, y: -4 }}
        className="flex flex-col items-center gap-2 cursor-pointer group"
      >
        <div className="relative h-16 w-16 rounded-full border-2 border-white/30 bg-white/15 backdrop-blur-sm overflow-hidden shadow-lg group-hover:border-white/60 transition-all duration-300">
          {politician.photo ? (
            <img src={politician.photo} alt={politician.fullName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-600 text-lg font-black text-white">
              {politician.fullName[0]}
            </div>
          )}
        </div>
        <div className="text-center max-w-[80px]">
          <p className="text-[10px] font-bold text-white/80 leading-tight group-hover:text-white transition-colors truncate">{politician.fullName}</p>
          {politician.party && <p className="text-[9px] text-white/45 leading-tight truncate">{politician.party}</p>}
        </div>
      </motion.div>
    </Link>
  );
}

export default function PoliticsPage() {
  const nav = useNavigate();
  const articles = useQuery(api.articles.list, { category: "polityka", limit: 50 });
  const resolvedArticles = useResolvedArticles(articles);
  const allPoliticians = useQuery(api.politicians.list, {});
  const heroConfig = useQuery(api.categoryHeroConfig.getByCategory, { categoryKey: "polityka" });
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const filteredArticles = resolvedArticles?.filter(a => {
    if (partyFilter === "all") return true;
    return ((a as any).__relationMeta?.primaryParty || (a as any).politics?.politicians?.[0]?.party) === partyFilter
      || (a as any).politics?.parties?.includes(partyFilter);
  });

  const parties = [...new Set(
    resolvedArticles?.flatMap(a => [
      (a as any).__relationMeta?.primaryParty,
      ...((a as any).politics?.parties ?? []),
    ].filter(Boolean)) || []
  )];

  const heroPoliticians = (() => {
    if (!allPoliticians) return [];
    const active = allPoliticians.filter(p => p.isActive !== false);
    if (heroConfig && heroConfig.length > 0) {
      const visibleConfig = heroConfig.filter(c => c.isVisible).sort((a, b) => a.order - b.order);
      return visibleConfig.map(c => active.find(p => p._id === c.itemId)).filter(Boolean);
    }
    return active.slice(0, 8);
  })();

  if (resolvedArticles === undefined) return <PoliticsSkeleton />;

  const featuredArticles = filteredArticles?.filter(a => a.featured) || [];
  const regularArticles = filteredArticles?.filter(a => !a.featured) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 dark:from-[#0a0e1a] dark:via-[#0d1020] dark:to-[#0a0e1a] pt-20 pb-0">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/3 translate-x-1/3 rounded-full bg-slate-400/10 dark:bg-slate-600/15 blur-[140px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/3 rounded-full bg-blue-400/8 dark:bg-blue-600/10 blur-[120px]" />
        </motion.div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { Icon: Landmark, top: "20%", left: "6%", dur: 8, delay: 0 },
            { Icon: Scale, top: "35%", right: "8%", dur: 10, delay: 1.5 },
            { Icon: Globe, bottom: "30%", left: "10%", dur: 9, delay: 0.8 },
            { Icon: Building2, bottom: "25%", right: "12%", dur: 7, delay: 2 },
          ].map(({ Icon, dur, delay, ...pos }, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0], opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
              className="absolute text-white"
              style={pos as any}
            >
              <Icon className="h-16 w-16" />
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
            <div className="flex justify-start items-center gap-3 mb-2">
              <motion.button
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => nav(-1)}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/25 transition-colors backdrop-blur-sm"
              >
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                Powrót
              </motion.button>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 backdrop-blur-sm"
              >
                <Scale className="h-3 w-3 text-white" />
                <span className="text-[11px] font-black uppercase tracking-widest text-white">Polityka Bydgoska</span>
              </motion.div>
            </div>

            <div className="relative mb-4">
              <h1 className="text-7xl font-black tracking-[-0.05em] text-white md:text-9xl leading-none">
                <span className="block">Polityka</span>
              </h1>
              <h2 className="text-4xl font-bold tracking-[-0.02em] text-white/50 md:text-6xl leading-none -mt-2 md:-mt-4 ml-1">
                i Samorząd
              </h2>
            </div>

            {heroPoliticians.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/15" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Politycy</span>
                  <div className="h-px flex-1 bg-white/15" />
                </div>
                <div className="flex flex-wrap justify-center gap-5">
                  {heroPoliticians.map((politician: any, i: number) => (
                    <motion.div
                      key={politician._id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                    >
                      <PoliticianCover politician={politician} />
                    </motion.div>
                  ))}
                </div>
                <Link
                  to="/polityka/politycy"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white/80 transition-colors"
                >
                  <Users className="h-3.5 w-3.5" />
                  Poznaj więcej samorządowców
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </motion.div>
            )}
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-700 dark:bg-slate-600 shadow-md">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setPartyFilter("all")}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  partyFilter === "all"
                    ? "bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900 shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                Wszystkie
              </motion.button>
              {parties.map(party => (
                <motion.button
                  key={party}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setPartyFilter(party)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                    partyFilter === party
                      ? "bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900 shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {party}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {featuredArticles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-700 dark:bg-slate-600 shadow-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">Analiza redakcji</h2>
                <p className="text-xs text-muted-foreground">Wyróżnione materiały polityczne</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {featuredArticles.slice(0, 2).map((article, index) => {
                const party = (article as any).politics?.politicians?.[0]?.party;
                return (
                  <motion.div
                    key={article._id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 dark:from-[#0f1520] dark:via-[#141c2e] dark:to-[#0f1520] p-7 shadow-xl border border-slate-500/30 dark:border-slate-700/30"
                    onClick={() => nav(getArticleHref(article))}
                  >
                    <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1">
                          <BookOpen className="h-3 w-3 text-white/80" />
                          <span className="text-xs font-black uppercase text-white/80">Analiza</span>
                        </div>
                        {party && (
                          <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                            <span className="text-xs font-bold text-white/70">{party}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="mb-3 text-xl font-black leading-tight text-white">{article.title}</h3>
                      <p className="mb-4 text-sm leading-relaxed text-white/55">{article.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">{article.author}</span>
                        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                          Czytaj <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {filteredArticles?.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-24 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Scale className="h-12 w-12 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="mb-2 text-2xl font-black text-foreground">Brak artykułów</h3>
            <p className="text-muted-foreground">Nie znaleziono artykułów dla wybranej partii.</p>
          </motion.div>
        )}

        {regularArticles.length > 0 && (
          <>
            <div className="mb-6 flex items-center gap-3">
              <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <h2 className="text-lg font-black text-foreground">Wszystkie materiały</h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">{regularArticles.length}</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {regularArticles.map((article, index) => (
                <PoliticsArticleCard key={article._id} article={article} index={index} />
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