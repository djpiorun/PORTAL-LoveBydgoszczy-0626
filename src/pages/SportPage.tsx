import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Trophy, TrendingUp, Flame, Award, ChevronRight, Star, Calendar } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { useResolvedArticles } from "@/hooks/use-resolved-articles";
import { useNavigate, Link } from "react-router";
import { getArticleHref } from "@/lib/articleRouting";
import { apiFetch } from "@/lib/api-client";
import { fetchArticles, type Article } from "@/lib/articles-api";
import { toast } from "sonner";

const SPORT_FILTERS = [
  { id: "all", label: "Wszystkie", emoji: "🏆", color: "from-blue-600 to-indigo-600", shadow: "shadow-blue-500/30" },
  { id: "pilka_nozna", label: "Piłka nożna", emoji: "⚽", color: "from-green-600 to-emerald-600", shadow: "shadow-green-500/30" },
  { id: "zuzel", label: "Żużel", emoji: "🏍️", color: "from-orange-600 to-red-600", shadow: "shadow-orange-500/30" },
  { id: "siatkowka", label: "Siatkówka", emoji: "🏐", color: "from-amber-600 to-yellow-600", shadow: "shadow-amber-500/30" },
  { id: "inne", label: "Inne", emoji: "🥊", color: "from-purple-600 to-pink-600", shadow: "shadow-purple-500/30" },
];

const SPORT_TYPE_LABEL: Record<string, string> = {
  pilka_nozna: "Piłka nożna",
  zuzel: "Żużel",
  siatkowka: "Siatkówka",
  inne: "Sport",
};

function SportSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-[520px] animate-pulse bg-blue-100 dark:bg-blue-900/20" />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-border/40 bg-card animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="h-48 bg-muted" />
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

function SportArticleCard({ article, index }: { article: any; index: number }) {
  const nav = useNavigate();
  const img = article.imageUrl;
  const sportType = article.sport?.sportType;
  const sportEmoji = sportType === "pilka_nozna" ? "⚽" : sportType === "zuzel" ? "🏍️" : sportType === "siatkowka" ? "🏐" : "🏆";
  const fixtureLabel = [article.__relationMeta?.primarySportTeam, article.__relationMeta?.secondarySportTeam].filter(Boolean).join(" vs ");
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
      <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm transition-all duration-300 group-hover:border-blue-400/60 group-hover:shadow-2xl group-hover:shadow-blue-500/15 h-full">
        {img ? (
          <div className="relative h-52 overflow-hidden shrink-0">
            <img src={img} alt={article.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors duration-500" />
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm border border-white/10">
              <span className="text-sm">{sportEmoji}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-white">
                {SPORT_TYPE_LABEL[sportType] || "Sport"}
              </span>
            </div>
            {article.featured && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-1 shadow-lg">
                <Star className="h-3 w-3 text-yellow-900" />
                <span className="text-[10px] font-black text-yellow-900">HOT</span>
              </div>
            )}
            {fixtureLabel && (() => {
              const parts = fixtureLabel.split(" vs ");
              return (
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="rounded-xl bg-black/75 backdrop-blur-sm border border-white/15 px-3 py-2 flex items-center justify-center gap-2">
                    <span className="text-xs font-black text-white truncate flex-1 text-right">{parts[0]}</span>
                    <span className="text-[10px] font-black text-blue-300 italic shrink-0 px-1">vs</span>
                    <span className="text-xs font-black text-white truncate flex-1 text-left">{parts[1] || ""}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="relative h-52 shrink-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 flex items-center justify-center overflow-hidden">
            <motion.span
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-7xl opacity-20"
            >
              {sportEmoji}
            </motion.span>
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-blue-600/80 px-2.5 py-1 border border-blue-400/30">
              <span className="text-[10px] font-black uppercase tracking-wider text-white">
                {SPORT_TYPE_LABEL[sportType] || "Sport"}
              </span>
            </div>
          </div>
        )}
        <div className="flex flex-1 flex-col p-5 pb-4">
          <h3 className="mb-2 line-clamp-2 text-base font-black leading-tight text-foreground transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{article.title}</h3>
          {article.excerpt && <p className="mb-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>}
          <div className="mt-auto border-t border-border/40 pt-2">
            <div className="flex items-end justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-black text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {(article.author || "L").charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-xs text-muted-foreground">{article.author || "Love Bydgoszcz"}</span>
                {date && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground/70">
                      <Calendar className="h-3 w-3" />{date}
                    </span>
                  </>
                )}
              </div>
              <div className="relative overflow-hidden rounded-full px-1 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                <span className="absolute inset-0 origin-left scale-x-0 rounded-full bg-blue-100 transition-transform duration-300 group-hover:scale-x-100 dark:bg-blue-950/40" />
                <span className="relative z-10 flex items-center gap-1">
                  Czytaj <ChevronRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Animated bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
      </div>
    </motion.div>
  );
}

function TeamCircle({ team }: { team: any }) {
  return (
    <Link to={`/sport/druzyna/${team.slug}`}>
      <motion.div
        whileHover={{ scale: 1.08, y: -4 }}
        className="flex flex-col items-center gap-2 cursor-pointer group"
      >
        <div className="relative h-16 w-16 rounded-full border-2 border-white/30 bg-white/15 backdrop-blur-sm overflow-hidden flex items-center justify-center shadow-lg group-hover:border-white/60 transition-all duration-300">
          {team.logo ? (
            <img src={team.logo} alt={team.name} className="h-12 w-12 object-contain" />
          ) : (
            <span className="text-base font-black text-white">{(team.shortName || team.name).slice(0, 3)}</span>
          )}
        </div>
        <span className="max-w-[96px] text-center text-[9px] font-semibold leading-tight text-white/72 transition-colors group-hover:text-white sm:text-[10px]">
          {team.name}
        </span>
      </motion.div>
    </Link>
  );
}

function MatchResultCard({ match }: { match: any }) {
  const isFinished = match.matchStatus === "zakonczony";
  const isLive = match.matchStatus === "trwa";
  const sportEmoji = match.sportType === "pilka_nozna" ? "⚽" : match.sportType === "zuzel" ? "🏍️" : match.sportType === "siatkowka" ? "🏐" : "🏆";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-4 py-3 shadow-sm">
      <span className="text-base">{sportEmoji}</span>
      <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
        <span className="text-sm font-bold text-foreground truncate">{match.homeTeamName}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {isLive && (
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="h-2 w-2 rounded-full bg-red-500" />
          )}
          <span className={`text-base font-black ${isFinished ? "text-foreground" : "text-muted-foreground"}`}>
            {match.homeScore} : {match.awayScore}
          </span>
        </div>
        <span className="text-sm font-bold text-foreground truncate text-right">{match.awayTeamName}</span>
      </div>
    </div>
  );
}

export default function SportPage() {
  const nav = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [heroConfig, setHeroConfig] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const resolvedArticles = useResolvedArticles(articles);
  const [sportFilter, setSportFilter] = useState<string>("all");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    let isMounted = true;
    const normalizeList = (payload: any) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.results)) return payload.results;
      return [];
    };

    const load = async () => {
      setIsLoading(true);
      const [articlesResult, teamsResult, heroResult, matchesResult] = await Promise.allSettled([
        fetchArticles({ category: "sport", limit: 50 }),
        apiFetch("/sport-teams"),
        apiFetch("/category-hero-config?category_key=sport"),
        apiFetch("/match-results/recent"),
      ]);

      if (!isMounted) return;

      if (articlesResult.status === "fulfilled") {
        setArticles(articlesResult.value ?? []);
      } else {
        setArticles([]);
        toast.error("Nie udało się pobrać artykułów sportowych.");
      }

      if (teamsResult.status === "fulfilled") {
        setAllTeams(normalizeList(teamsResult.value));
      } else {
        setAllTeams([]);
        toast.error("Nie udało się pobrać listy drużyn.");
      }

      if (heroResult.status === "fulfilled") {
        setHeroConfig(normalizeList(heroResult.value));
      } else {
        setHeroConfig([]);
        toast.error("Nie udało się pobrać konfiguracji hero sportu.");
      }

      if (matchesResult.status === "fulfilled") {
        setRecentMatches(normalizeList(matchesResult.value));
      } else {
        setRecentMatches([]);
        toast.error("Nie udało się pobrać ostatnich wyników.");
      }

      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const safeArticles = resolvedArticles ?? [];
  const safeTeams = allTeams ?? [];
  const safeHeroConfig = heroConfig ?? [];
  const safeRecentMatches = recentMatches ?? [];

  const filteredArticles = safeArticles.filter(
    (a) => sportFilter === "all" || (a as any).sport?.sportType === sportFilter
  );

  const heroTeams = (() => {
    const activeTeams = safeTeams.filter((t) => t?.isActive !== false);
    if (safeHeroConfig.length > 0) {
      const visibleConfig = safeHeroConfig
        .filter((c) => c?.isVisible)
        .sort((a, b) => a.order - b.order);

      const mappedTeams = visibleConfig
        .map((c) => activeTeams.find((t) => t && t._id === c.itemId))
        .filter(Boolean);

      if (mappedTeams.length > 0) return mappedTeams;
    }
    return activeTeams.slice(0, 8);
  })();

  const stats = {
    total: safeArticles.length,
    pilka: safeArticles.filter((a) => (a as any).sport?.sportType === "pilka_nozna").length,
    zuzel: safeArticles.filter((a) => (a as any).sport?.sportType === "zuzel").length,
    siatkowka: safeArticles.filter((a) => (a as any).sport?.sportType === "siatkowka").length,
  };

  const animatedTotal = useCountUp(stats.total);
  const animatedPilka = useCountUp(stats.pilka);
  const animatedZuzel = useCountUp(stats.zuzel);
  const animatedSiatkowka = useCountUp(stats.siatkowka);

  if (isLoading && articles.length === 0) {
    return <SportSkeleton />;
  }

  const featuredArticles = filteredArticles.filter((a) => a.featured);
  const regularArticles = filteredArticles.filter((a) => !a.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-[#0a0f1e] dark:via-[#0d1530] dark:to-[#0a0f1e] pt-14 pb-0">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#3b82f620_1px,transparent_1px),linear-gradient(to_bottom,#3b82f620_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="absolute right-0 top-0 h-[700px] w-[700px] -translate-y-1/4 translate-x-1/4 rounded-full bg-white/10 dark:bg-blue-600/20 blur-[140px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-300/20 dark:bg-indigo-600/15 blur-[120px]" />
        </motion.div>

        {/* Floating sport icons */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { emoji: "⚽", top: "18%", left: "8%", size: "text-5xl", dur: 5, delay: 0 },
            { emoji: "🏆", top: "30%", right: "10%", size: "text-6xl", dur: 7, delay: 1 },
            { emoji: "🏍️", bottom: "30%", left: "12%", size: "text-4xl", dur: 6, delay: 0.5 },
            { emoji: "🏐", bottom: "20%", right: "15%", size: "text-5xl", dur: 8, delay: 1.5 },
          ].map(({ emoji, size, dur, delay, ...pos }, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -16, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
              transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
              className={`absolute ${size} opacity-[0.12]`}
              style={pos as any}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-center pb-2"
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
                <Trophy className="h-3 w-3 text-white" />
                <span className="text-[11px] font-black uppercase tracking-widest text-white">Sport w Bydgoszczy</span>
              </motion.div>
            </div>

            <div className="relative mb-3">
              <h1 className="text-7xl font-black tracking-[-0.05em] text-white md:text-9xl leading-none">
                <span className="block">Sportowe</span>
              </h1>
              <h2 className="text-4xl font-bold tracking-[-0.02em] text-white/70 md:text-6xl leading-none -mt-2 md:-mt-4 ml-1">
                Emocje
              </h2>
            </div>

            {/* Teams strip */}
            {heroTeams.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-2"
              >
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/15" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Nasze drużyny</span>
                  <div className="h-px flex-1 bg-white/15" />
                </div>
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-3">
                  {heroTeams.map((team: any, i: number) => (
                    <motion.div
                      key={team._id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                    >
                      <TeamCircle team={team} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className="relative z-10">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-12 w-full block">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z" className="fill-background" />
          </svg>
        </div>
      </div>

      {/* ── FILTER BAR ─────────────────────────────────────────────────────── */}
      <div className="border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto py-4 scrollbar-hide">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <div className="flex gap-2">
              {SPORT_FILTERS.map(f => (
                <motion.button
                  key={f.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSportFilter(f.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                    sportFilter === f.id
                      ? `bg-gradient-to-r ${f.color} text-white shadow-lg ${f.shadow}`
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <span>{f.emoji}</span>
                  {f.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RECENT MATCH RESULTS ──────────────────────────────────────────── */}
      {safeRecentMatches.length > 0 && (
        <div className="border-b border-border/40 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-black text-foreground">Ostatnie wyniki</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {safeRecentMatches.slice(0, 6).map((match) => (
                <MatchResultCard key={match._id} match={match} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Featured */}
        {featuredArticles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">Najgorętsze</h2>
                <p className="text-xs text-muted-foreground">Wyróżnione relacje sportowe</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {featuredArticles.slice(0, 2).map((article, index) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 dark:from-[#0a1628] dark:via-[#0d1f3c] dark:to-[#0a1628] p-7 shadow-2xl border border-blue-400/30 dark:border-blue-500/20"
                  onClick={() => nav(getArticleHref(article))}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 dark:bg-blue-500/10 blur-3xl" />
                  <div className="relative z-10">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="rounded-full bg-yellow-400/90 px-3 py-1">
                        <span className="text-xs font-black uppercase text-yellow-900">⚡ Wyróżnione</span>
                      </div>
                      {(article as any).sport?.sportType && (
                        <div className="rounded-full border border-white/20 bg-white/15 px-3 py-1 backdrop-blur-sm">
                          <span className="text-xs font-bold text-white">
                            {SPORT_TYPE_LABEL[(article as any).sport.sportType] || "Sport"}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="mb-3 text-xl font-black leading-tight text-white">{article.title}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-white/60">{article.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">{article.author}</span>
                      <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        Czytaj <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {filteredArticles?.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-24 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Trophy className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-2xl font-black text-foreground">Brak artykułów</h3>
            <p className="text-muted-foreground">Nie znaleziono artykułów dla wybranego sportu.</p>
          </motion.div>
        )}

        {/* Grid */}
        {regularArticles.length > 0 && (
          <>
            <div className="mb-6 flex items-center gap-3">
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-black text-foreground">Wszystkie materiały</h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">{regularArticles.length}</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {regularArticles.map((article, index) => (
                <SportArticleCard key={article._id} article={article} index={index} />
              ))}
            </div>
          </>
        )}
        {featuredArticles.length > 0 && regularArticles.length === 0 && filteredArticles && filteredArticles.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {featuredArticles.slice(2).map((article, index) => (
              <SportArticleCard key={article._id} article={article} index={index} />
            ))}
          </div>
        )}
      </div>

      <BackToTop />
      <Footer />
    </div>
  );
}