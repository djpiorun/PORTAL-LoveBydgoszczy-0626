import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { HardHat, TrendingUp, Activity, CheckCircle2, Clock, AlertCircle, BarChart3, MapPin, ChevronRight, Wrench, Building2, Calendar } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useNavigate } from "react-router";
import { getArticleHref } from "@/lib/articleRouting";
import { useResolvedArticles } from "@/hooks/use-resolved-articles";
import { apiFetch } from "@/lib/api-client";
import { fetchArticles } from "@/lib/articles-api";
import { toast } from "sonner";

const STATUS_CONFIG = {
  all: { label: "Wszystkie", Icon: BarChart3, color: "from-orange-600 to-amber-600", shadow: "shadow-orange-500/30", light: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800" },
  w_trakcie: { label: "W trakcie", Icon: Activity, color: "from-blue-600 to-cyan-600", shadow: "shadow-blue-500/30", light: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800" },
  planowana: { label: "Planowane", Icon: Clock, color: "from-amber-600 to-yellow-600", shadow: "shadow-amber-500/30", light: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800" },
  zakonczona: { label: "Zakończone", Icon: CheckCircle2, color: "from-green-600 to-emerald-600", shadow: "shadow-green-500/30", light: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800" },
  wstrzymana: { label: "Wstrzymane", Icon: AlertCircle, color: "from-red-600 to-rose-600", shadow: "shadow-red-500/30", light: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800" },
};

function InvestmentSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-[480px] animate-pulse bg-orange-50 dark:bg-orange-900/10" />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-border/40 bg-card animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="h-44 bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-2 bg-muted rounded-full w-full" />
                <div className="h-4 bg-muted rounded-full w-3/4" />
                <div className="h-3 bg-muted rounded-full w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InvestmentCard({ article, index }: { article: any; index: number }) {
  const nav = useNavigate();
  const investment = (article as any).investment;
  const statusKey = investment?.projectStatus || "planowana";
  const cfg = STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.planowana;
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
        <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm transition-all duration-300 group-hover:border-orange-400/60 group-hover:shadow-2xl group-hover:shadow-orange-500/15 h-full">
        {article.imageUrl ? (
          <div className="relative h-48 overflow-hidden shrink-0">
            <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-orange-600/0 group-hover:bg-orange-600/10 transition-colors duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm ${cfg.light}`}>
              {cfg.label}
            </div>
          </div>
        ) : (
          <div className="relative h-44 shrink-0 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30 flex items-center justify-center">
            <HardHat className="h-12 w-12 text-orange-300 dark:text-orange-700" />
            <div className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${cfg.light}`}>
              {cfg.label}
            </div>
          </div>
        )}
        <div className="flex flex-col flex-1 p-5">
          {investment?.progressPercent !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Postęp</span>
                <span className="text-xs font-black text-foreground">{investment.progressPercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${investment.progressPercent}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                />
              </div>
            </div>
          )}
          <h3 className="mb-2 line-clamp-2 text-base font-black leading-tight text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{article.title}</h3>
          {investment?.location && (
            <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{investment.location}</span>
            </div>
          )}
          {article.excerpt && <p className="mb-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed flex-1">{article.excerpt}</p>}
          <div className="mt-auto pt-3 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-[9px] font-black text-orange-700 dark:text-orange-300">
                  {(article.author || "L").charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[80px]">{article.author || "Love Bydgoszcz"}</span>
                {date && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground/70 shrink-0">
                      <Calendar className="h-3 w-3" />{date}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 rounded-full border border-orange-200 dark:border-orange-800/50 px-2.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:bg-orange-50 dark:group-hover:bg-orange-950/30 shrink-0">
                Czytaj <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </motion.div>
  );
}

function InvestmentHeroCard({ investment }: { investment: any }) {
  const statusCfg = STATUS_CONFIG[investment.projectStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.planowana;
  return (
    <Link to={`/inwestycje/${investment.slug}`}>
      <motion.div
        whileHover={{ scale: 1.04, y: -4 }}
        className="flex flex-col gap-2 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-3 cursor-pointer group hover:border-white/40 transition-all duration-300 min-w-[140px] max-w-[160px]"
      >
        {investment.mainImageUrl ? (
          <div className="h-16 w-full rounded-xl overflow-hidden">
            <img src={investment.mainImageUrl} alt={investment.projectName} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-16 w-full items-center justify-center rounded-xl bg-white/10">
            <HardHat className="h-7 w-7 text-white/60" />
          </div>
        )}
        <div>
          <p className="text-[10px] font-black text-white/80 leading-tight line-clamp-2 group-hover:text-white transition-colors">{investment.projectName}</p>
          <div className={`mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold ${statusCfg.light}`}>
            {statusCfg.label}
          </div>
        </div>
        {investment.progressPercent !== undefined && (
          <div className="h-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white/70 transition-all" style={{ width: `${investment.progressPercent}%` }} />
          </div>
        )}
      </motion.div>
    </Link>
  );
}

const normalizeInvestment = (investment: any) => ({
  _id: String(investment?.id ?? investment?._id ?? ""),
  slug: investment?.slug ?? "",
  projectName: investment?.projectName ?? investment?.project_name ?? "",
  description: investment?.description ?? "",
  projectStatus: investment?.projectStatus ?? investment?.project_status ?? "planowana",
  mainImageUrl: investment?.mainImageUrl ?? investment?.main_image_url ?? null,
  progressPercent: investment?.progressPercent ?? investment?.progress_percent ?? undefined,
  investor: investment?.investor ?? null,
  contractor: investment?.contractor ?? null,
  budget: investment?.budget ?? null,
  location: investment?.location ?? null,
  startDate: investment?.startDate ?? investment?.start_date ?? null,
  endDate: investment?.endDate ?? investment?.end_date ?? null,
  isActive: investment?.isActive ?? investment?.is_active ?? true,
});

const normalizeInvestmentsPayload = (payload: any) => {
  const data = payload?.data ?? payload?.investments ?? payload ?? [];
  return Array.isArray(data) ? data.map(normalizeInvestment) : [];
};

const normalizeHeroConfig = (payload: any) => {
  const data = payload?.data ?? payload?.items ?? payload ?? [];
  return Array.isArray(data)
    ? data.map((item) => ({
        itemId: item?.itemId ?? item?.item_id ?? item?.item ?? "",
        order: item?.order ?? 0,
        isVisible: item?.isVisible ?? item?.is_visible ?? true,
      }))
    : [];
};

export default function InvestmentsPage() {
  const nav = useNavigate();
  const [articles, setArticles] = useState<any[] | undefined>(undefined);
  const resolvedArticles = useResolvedArticles(articles);
  const [allInvestments, setAllInvestments] = useState<any[] | null>(null);
  const [heroConfig, setHeroConfig] = useState<any[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    let active = true;
    fetchArticles({ category: "inwestycje", limit: 50 })
      .then((items) => {
        if (!active) return;
        setArticles(items);
      })
      .catch(() => {
        if (!active) return;
        setArticles([]);
        toast.warning("Nie udało się pobrać inwestycji.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch("/investments")
      .then((payload) => {
        if (!active) return;
        setAllInvestments(normalizeInvestmentsPayload(payload));
      })
      .catch(() => {
        if (!active) return;
        setAllInvestments([]);
        toast.warning("Lista inwestycji jest chwilowo niedostępna.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch("/category-hero-config?category=inwestycje")
      .then((payload) => {
        if (!active) return;
        setHeroConfig(normalizeHeroConfig(payload));
      })
      .catch(() => {
        if (!active) return;
        setHeroConfig([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredArticles = resolvedArticles?.filter(a => {
    if (statusFilter === "all") return true;
    return (a as any).investment?.projectStatus === statusFilter;
  });

  const getCount = (id: string) => {
    if (id === "all") return resolvedArticles?.length || 0;
    return resolvedArticles?.filter(a => (a as any).investment?.projectStatus === id).length || 0;
  };

  const heroInvestments = (() => {
    if (!allInvestments) return [];
    const activeInvestments = allInvestments.filter(inv => inv.isActive !== false);
    if (heroConfig && heroConfig.length > 0) {
      const visibleConfig = heroConfig.filter(c => c.isVisible).sort((a, b) => a.order - b.order);
      return visibleConfig.map(c => activeInvestments.find(inv => inv._id === c.itemId)).filter(Boolean);
    }
    return activeInvestments.filter(inv => inv.projectStatus === "w_trakcie").slice(0, 5);
  })();

  if (resolvedArticles === undefined) return <InvestmentSkeleton />;

  const featuredArticles = filteredArticles?.filter(a => a.featured) || [];
  const regularArticles = filteredArticles?.filter(a => !a.featured) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-700 to-orange-800 dark:from-[#1a0800] dark:via-[#251200] dark:to-[#1a0800] pt-16 pb-0">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/3 translate-x-1/3 rounded-full bg-white/10 blur-[140px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/3 rounded-full bg-amber-300/15 blur-[120px]" />
        </motion.div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { Icon: HardHat, top: "20%", left: "6%", dur: 8, delay: 0 },
            { Icon: Wrench, top: "35%", right: "8%", dur: 10, delay: 1.5 },
            { Icon: Building2, bottom: "30%", left: "10%", dur: 9, delay: 0.8 },
            { Icon: TrendingUp, bottom: "25%", right: "12%", dur: 7, delay: 2 },
          ].map(({ Icon, dur, delay, ...pos }, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0], opacity: [0.06, 0.12, 0.06] }}
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
                <HardHat className="h-3 w-3 text-white" />
                <span className="text-[11px] font-black uppercase tracking-widest text-white">Inwestycje Bydgoskie</span>
              </motion.div>
            </div>

            <div className="relative mb-4">
              <h1 className="text-7xl font-black tracking-[-0.05em] text-white md:text-9xl leading-none">
                <span className="block">Inwestycje</span>
              </h1>
              <h2 className="text-4xl font-bold tracking-[-0.02em] text-white/55 md:text-6xl leading-none -mt-2 md:-mt-4 ml-1">
                Miejskie
              </h2>
            </div>

            {heroInvestments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/15" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Kluczowe inwestycje</span>
                  <div className="h-px flex-1 bg-white/15" />
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {heroInvestments.map((investment: any, i: number) => (
                    <motion.div
                      key={investment._id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                    >
                      <InvestmentHeroCard investment={investment} />
                    </motion.div>
                  ))}
                </div>
                <Link
                  to="/inwestycje/tracking"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white/80 transition-colors"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Wszystkie inwestycje
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-md">
              <HardHat className="h-4 w-4 text-white" />
            </div>
            <div className="flex gap-2">
              {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([id, cfg]) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setStatusFilter(id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                    statusFilter === id
                      ? `bg-gradient-to-r ${cfg.color} text-white shadow-lg ${cfg.shadow}`
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <cfg.Icon className="h-3.5 w-3.5" />
                  {cfg.label} ({getCount(id)})
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
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">Inwestycje priorytetowe</h2>
                <p className="text-xs text-muted-foreground">Najważniejsze projekty w mieście</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {featuredArticles.slice(0, 2).map((article, index) => {
                const investment = (article as any).investment;
                return (
                  <motion.div
                    key={article._id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="group relative cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-600 to-orange-600 dark:from-[#1a0800] dark:via-[#251200] dark:to-[#1a0800] p-7 shadow-2xl border border-orange-400/30 dark:border-orange-700/30"
                    onClick={() => nav(getArticleHref(article))}
                  >
                    <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 dark:bg-orange-500/10 blur-3xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="rounded-full bg-white/20 border border-white/30 px-3 py-1">
                          <span className="text-xs font-black uppercase text-white">Priorytet</span>
                        </div>
                        {investment?.progressPercent !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/25">
                              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${investment.progressPercent}%` }} />
                            </div>
                            <span className="text-sm font-black text-white">{investment.progressPercent}%</span>
                          </div>
                        )}
                      </div>
                      <h3 className="mb-3 text-xl font-black leading-tight text-white">{article.title}</h3>
                      <p className="mb-4 text-sm leading-relaxed text-white/65">{article.excerpt}</p>
                      <div className="flex flex-wrap gap-2">
                        {investment?.projectStatus && (
                          <div className="rounded-full bg-white/15 border border-white/20 px-3 py-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-white">
                              {investment.projectStatus === "w_trakcie" && "W REALIZACJI"}
                              {investment.projectStatus === "planowana" && "PLANOWANA"}
                              {investment.projectStatus === "zakonczona" && "ZAKOŃCZONA"}
                            </span>
                          </div>
                        )}
                        {investment?.location && (
                          <div className="flex items-center gap-1 rounded-full bg-white/15 border border-white/20 px-3 py-1">
                            <MapPin className="h-3 w-3 text-white/70" />
                            <span className="text-xs font-bold text-white/80">{investment.location}</span>
                          </div>
                        )}
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
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <AlertCircle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="mb-2 text-2xl font-black text-foreground">Brak inwestycji</h3>
            <p className="text-muted-foreground">Nie znaleziono inwestycji dla wybranego statusu.</p>
          </motion.div>
        )}

        {regularArticles.length > 0 && (
          <>
            <div className="mb-6 flex items-center gap-3">
              <HardHat className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              <h2 className="text-lg font-black text-foreground">Wszystkie inwestycje</h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">{regularArticles.length}</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {regularArticles.map((article, index) => (
                <InvestmentCard key={article._id} article={article} index={index} />
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