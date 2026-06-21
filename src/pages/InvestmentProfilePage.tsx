import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { HardHat, MapPin, Calendar, ChevronLeft, FileText, Building2, Activity, CheckCircle2, Clock, AlertCircle, BarChart3, Wrench, ArrowRight, TrendingUp } from "lucide-react";
import { getArticleHref } from "@/lib/articleRouting";
import { useResolvedArticles } from "@/hooks/use-resolved-articles";
import { apiFetch } from "@/lib/api-client";
import { fetchArticles } from "@/lib/articles-api";
import { toast } from "sonner";

const STATUS_CONFIG = {
  planowana: {
    label: "Planowana",
    Icon: Clock,
    cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800",
    heroFrom: "from-blue-700",
    heroVia: "via-blue-800",
    heroTo: "to-indigo-900",
    glow: "bg-blue-500/20",
  },
  w_trakcie: {
    label: "W trakcie",
    Icon: Activity,
    cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800",
    heroFrom: "from-orange-700",
    heroVia: "via-amber-800",
    heroTo: "to-orange-900",
    glow: "bg-orange-500/20",
  },
  zakonczona: {
    label: "Zakończona",
    Icon: CheckCircle2,
    cls: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800",
    heroFrom: "from-green-700",
    heroVia: "via-emerald-800",
    heroTo: "to-green-900",
    glow: "bg-green-500/20",
  },
  wstrzymana: {
    label: "Wstrzymana",
    Icon: AlertCircle,
    cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800",
    heroFrom: "from-red-700",
    heroVia: "via-rose-800",
    heroTo: "to-red-900",
    glow: "bg-red-500/20",
  },
};

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
  timeline: investment?.timeline ?? [],
  isActive: investment?.isActive ?? investment?.is_active ?? true,
});

const normalizeInvestmentPayload = (payload: any) => {
  const data = payload?.data ?? payload?.investment ?? payload;
  return data ? normalizeInvestment(data) : null;
};

export default function InvestmentProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const nav = useNavigate();
  const [investment, setInvestment] = useState<any | null | undefined>(undefined);
  const [allArticles, setAllArticles] = useState<any[] | undefined>(undefined);
  const resolvedArticles = useResolvedArticles(allArticles);

  useEffect(() => {
    if (!slug) {
      setInvestment(null);
      return;
    }
    let active = true;
    setInvestment(undefined);
    apiFetch(`/investments/${slug}`)
      .then((payload) => {
        if (!active) return;
        const normalized = normalizeInvestmentPayload(payload);
        setInvestment(normalized && normalized._id ? normalized : null);
      })
      .catch(() => {
        if (!active) return;
        setInvestment(null);
        toast.warning("Inwestycja jest chwilowo niedostępna.");
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    let active = true;
    fetchArticles({ category: "inwestycje", limit: 100 })
      .then((articles) => {
        if (!active) return;
        setAllArticles(articles);
      })
      .catch(() => {
        if (!active) return;
        setAllArticles([]);
        toast.warning("Nie udało się pobrać artykułów inwestycyjnych.");
      });

    return () => {
      active = false;
    };
  }, []);

  const relatedArticles = resolvedArticles?.filter(a => {
    const inv = (a as any).investment;
    if (!inv) return false;
    const invId = investment?._id;
    if (inv.linkedInvestmentId === invId || inv.linkedInvestmentId === slug) return true;
    if (inv.investmentIds?.includes(invId) || inv.investmentIds?.includes(slug)) return true;
    if (investment?.projectName && inv.projectName === investment.projectName) return true;
    return false;
  }).slice(0, 8) || [];

  if (investment === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (investment === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-32 text-center">
          <HardHat className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
          <h1 className="mb-2 text-2xl font-black text-foreground">Inwestycja nie znaleziona</h1>
          <Link to="/inwestycje" className="text-primary hover:underline">Wróć do inwestycji</Link>
        </div>
      </div>
    );
  }

  const statusKey = investment.projectStatus as keyof typeof STATUS_CONFIG;
  const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.planowana;
  const StatusIcon = statusCfg.Icon;

  const params = [
    { label: "Inwestor", value: investment.investor, Icon: Building2, show: !!investment.investor },
    { label: "Wykonawca", value: investment.contractor, Icon: Wrench, show: !!investment.contractor },
    { label: "Budżet", value: investment.budget, Icon: BarChart3, show: !!investment.budget },
    { label: "Lokalizacja", value: investment.location, Icon: MapPin, show: !!investment.location },
    { label: "Start", value: investment.startDate, Icon: Calendar, show: !!investment.startDate },
    { label: "Koniec", value: investment.endDate, Icon: Calendar, show: !!investment.endDate },
  ].filter(p => p.show);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${statusCfg.heroFrom} ${statusCfg.heroVia} ${statusCfg.heroTo} pt-24 pb-0`}>
        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        {/* Glow orbs */}
        <div className={`absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/3 translate-x-1/3 rounded-full ${statusCfg.glow} blur-[140px]`} />
        <div className={`absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/3 -translate-x-1/3 rounded-full ${statusCfg.glow} blur-[120px]`} />

        {/* Cover image overlay */}
        {investment.mainImageUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={investment.mainImageUrl} alt={investment.projectName} className="h-full w-full object-cover opacity-15" />
            <div className={`absolute inset-0 bg-gradient-to-b ${statusCfg.heroFrom}/80 via-transparent to-${statusCfg.heroTo}/90`} />
          </div>
        )}

        {/* Floating icons */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { top: "20%", left: "5%", delay: 0, dur: 5 },
            { top: "55%", right: "6%", delay: 1, dur: 7 },
            { bottom: "30%", left: "12%", delay: 0.5, dur: 6 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
              transition={{ duration: pos.dur, repeat: Infinity, ease: "easeInOut", delay: pos.delay }}
              className="absolute opacity-[0.08]"
              style={{ top: (pos as any).top, left: (pos as any).left, right: (pos as any).right, bottom: (pos as any).bottom }}
            >
              <HardHat className="h-16 w-16 text-white" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link to="/inwestycje" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Inwestycje
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Status + location badges */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wider ${statusCfg.cls}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {statusCfg.label}
              </div>
              {investment.location && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-bold text-white/80">
                  <MapPin className="h-3.5 w-3.5" />
                  {investment.location}
                </div>
              )}
            </div>

            <h1 className="mb-4 text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
              {investment.projectName}
            </h1>

            {investment.description && (
              <p className="mb-8 max-w-2xl text-base leading-relaxed text-white/65">{investment.description}</p>
            )}

            {/* Progress bar */}
            {investment.progressPercent !== undefined && (
              <div className="max-w-lg">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-white/60" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/60">Postęp realizacji</span>
                  </div>
                  <span className="text-2xl font-black text-white">{investment.progressPercent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${investment.progressPercent}%` }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
                    className="h-full rounded-full bg-white shadow-lg"
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] font-bold text-white/40">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Wave */}
        <div className="relative z-10">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-16 w-full block">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z" className="fill-background" />
          </svg>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Key parameters grid */}
        {params.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-muted-foreground">Parametry projektu</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {params.map((param, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5 shadow-sm hover:border-border hover:shadow-md transition-all duration-200"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted group-hover:bg-orange-100 dark:group-hover:bg-orange-950/30 transition-colors">
                    <param.Icon className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{param.label}</p>
                    <p className="text-sm font-black text-foreground truncate">{param.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Timeline if available */}
        {(investment as any).timeline && (investment as any).timeline.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-muted-foreground">Harmonogram</h2>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 via-orange-300 to-transparent" />
              {(investment as any).timeline.map((phase: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="relative mb-6 last:mb-0"
                >
                  <div className="absolute -left-[18px] top-1.5 h-3 w-3 rounded-full border-2 border-orange-400 bg-background" />
                  <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-black text-foreground">{phase.name || phase.title}</h3>
                      {phase.date && <span className="shrink-0 text-xs text-muted-foreground">{phase.date}</span>}
                    </div>
                    {phase.description && <p className="text-xs text-muted-foreground leading-relaxed">{phase.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground">Powiązane artykuły</h2>
                  <p className="text-xs text-muted-foreground">{relatedArticles.length} materiałów</p>
                </div>
              </div>
              <Link to="/inwestycje" className="hidden sm:flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                Więcej inwestycji <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedArticles.map((article, i) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => nav(getArticleHref(article))}
                  className="group flex cursor-pointer gap-4 rounded-2xl border border-border/50 bg-card p-4 hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200"
                >
                  {article.imageUrl ? (
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                      <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/30">
                      <HardHat className="h-7 w-7 text-orange-300 dark:text-orange-700" />
                    </div>
                  )}
                  <div className="min-w-0 flex flex-col justify-center">
                    <h3 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{article.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(article.publishedAt).toLocaleDateString("pl-PL")}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="rounded-3xl border border-dashed border-border/60 bg-muted/20 py-20 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-4 flex justify-center"
            >
              <HardHat className="h-12 w-12 text-muted-foreground/30" />
            </motion.div>
            <p className="text-sm font-bold text-muted-foreground">Brak artykułów powiązanych z tą inwestycją</p>
            <Link to="/inwestycje" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors">
              <ChevronLeft className="h-3 w-3" />
              Wróć do inwestycji
            </Link>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}