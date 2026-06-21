import { fetchUpdates, normalizeUpdatesPayload } from "@/lib/updates-api";
import { toast } from "sonner";
import { Zap, MapPin, Link2, ArrowLeft, Filter, ChevronDown } from "lucide-react";
import { Link } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const CATEGORY_LABELS: Record<string, string> = {
  miasto: "Miasto",
  rozrywka: "Rozrywka",
  kultura: "Kultura",
  biznes: "Biznes",
  gastronomia: "Gastronomia",
  bydgoszczanie: "Bydgoszczanie",
  medyczna: "Medycyna",
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; badge: string; time: string; from: string; to: string }> = {
  miasto:        { bg: "bg-blue-500",    text: "text-white", badge: "bg-blue-100 text-blue-700",       time: "text-blue-500",    from: "#2563eb", to: "#0891b2" },
  rozrywka:      { bg: "bg-pink-500",    text: "text-white", badge: "bg-pink-100 text-pink-700",       time: "text-pink-500",    from: "#e11d48", to: "#db2777" },
  kultura:       { bg: "bg-amber-500",   text: "text-white", badge: "bg-amber-100 text-amber-700",     time: "text-amber-500",   from: "#d97706", to: "#ea580c" },
  biznes:        { bg: "bg-emerald-500", text: "text-white", badge: "bg-emerald-100 text-emerald-700", time: "text-emerald-500", from: "#059669", to: "#0d9488" },
  gastronomia:   { bg: "bg-orange-500",  text: "text-white", badge: "bg-orange-100 text-orange-700",   time: "text-orange-500",  from: "#ea580c", to: "#dc2626" },
  bydgoszczanie: { bg: "bg-violet-500",  text: "text-white", badge: "bg-violet-100 text-violet-700",   time: "text-violet-500",  from: "#7c3aed", to: "#9333ea" },
  medyczna:      { bg: "bg-teal-500",    text: "text-white", badge: "bg-teal-100 text-teal-700",       time: "text-teal-500",    from: "#0d9488", to: "#0891b2" },
};

const CATEGORY_ROUTE: Record<string, string> = {
  miasto: "/miasto", rozrywka: "/rozrywka", kultura: "/kultura",
  biznes: "/biznes", gastronomia: "/gastronomia", bydgoszczanie: "/bydgoszczanie", medyczna: "/medyczna",
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS);

function formatTime(ts: number) {
  return {
    time: new Date(ts).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
    date: new Date(ts).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" }),
  };
}

type UpdateItem = {
  _id?: string;
  title: string;
  publishedAt: number;
  category?: string | null;
  description?: string | null;
  location?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  linkUrl?: string | null;
  linkLabel?: string | null;
};

type UpdatesStatus = "Loading" | "CanLoadMore" | "LoadingMore" | "Done";

function groupByDate(updates: UpdateItem[], weekday = false) {
  const grouped: Record<string, UpdateItem[]> = {};
  for (const upd of updates ?? []) {
    const key = new Date(upd.publishedAt).toLocaleDateString("pl-PL", {
      ...(weekday ? { weekday: "long" } : {}),
      day: "numeric",
      month: "long",
      ...(weekday ? {} : { year: "numeric" }),
    });
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(upd);
  }
  return grouped;
}

function useUpdatesFeed(activeCategory: string | null, pageSize: number) {
  const [updates, setUpdates] = useState<UpdateItem[] | null>(null);
  const [status, setStatus] = useState<UpdatesStatus>("Loading");
  const [page, setPage] = useState(1);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadPage = async (pageToLoad: number, replace: boolean) => {
    try {
      const params = new URLSearchParams({
        page: String(pageToLoad),
        per_page: String(pageSize),
      });
      if (activeCategory) params.set("category", activeCategory);
      const payload = await fetchUpdates({
        page: pageToLoad,
        per_page: pageSize,
        ...(activeCategory ? { category: activeCategory } : {}),
      });
      if (!isMountedRef.current) return;
      const nextUpdates = normalizeUpdatesPayload(payload);
      const hasMore = payload?.meta?.current_page && payload?.meta?.last_page
        ? payload.meta.current_page < payload.meta.last_page
        : nextUpdates.length === pageSize;

      setUpdates((prev) => (replace ? nextUpdates : [...(prev ?? []), ...nextUpdates]));
      setStatus(hasMore ? "CanLoadMore" : "Done");
      setPage(pageToLoad);
    } catch (error) {
      if (!isMountedRef.current) return;
      setUpdates((prev) => (replace ? [] : prev ?? []));
      setStatus("Done");
      toast.warning("Aktualizacje są chwilowo niedostępne.");
    }
  };

  useEffect(() => {
    setUpdates(null);
    setStatus("Loading");
    setPage(1);
    loadPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, pageSize]);

  const loadMore = () => {
    if (status !== "CanLoadMore") return;
    setStatus("LoadingMore");
    loadPage(page + 1, false);
  };

  return { updates, status, loadMore };
}

// ─── Shared Update Card ───────────────────────────────────────────────────────

function UpdateCard({ upd, index, isLast, mobile }: { upd: any; index: number; isLast: boolean; mobile: boolean }) {
  const { time, date } = formatTime(upd.publishedAt);
  const catColors = upd.category ? CATEGORY_COLORS[upd.category] : null;
  const catRoute = upd.category ? CATEGORY_ROUTE[upd.category] : null;
  const catFrom = catColors?.from ?? "#f59e0b";
  const catTo = catColors?.to ?? "#ea580c";

  return (
    <motion.article
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex gap-3 ${mobile ? "pl-0" : "pl-0"}`}
    >
      {/* Timeline column */}
      <div className="flex flex-col items-center shrink-0" style={{ width: mobile ? "2.8rem" : "3.5rem" }}>
        <div
          className="rounded-full border border-border/50 bg-background/90 px-1.5 py-1 shadow-sm backdrop-blur-sm text-center"
          style={{ minWidth: mobile ? "2.4rem" : "3rem" }}
        >
          <span className="block text-[10px] font-black leading-none tabular-nums" style={{ color: catFrom }}>
            {time}
          </span>
        </div>
        <div
          className="mt-1.5 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-background shadow-sm shrink-0"
          style={{ background: `linear-gradient(135deg, ${catFrom}, ${catTo})` }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-background/90" />
        </div>
        {!isLast && (
          <div
            className="w-0.5 flex-1 mt-1"
            style={{ background: `linear-gradient(180deg, ${catFrom}55, ${catTo}22, transparent)`, minHeight: "1.5rem" }}
          />
        )}
      </div>

      {/* Card */}
      <div
        className="flex-1 min-w-0 mb-3 rounded-[1.4rem] overflow-hidden relative"
        style={{
          background: "hsl(var(--card))",
          border: `1px solid ${catFrom}28`,
          boxShadow: `0 4px 18px -6px ${catFrom}30, 0 1px 4px -1px rgba(0,0,0,0.06)`,
        }}
      >
        {/* Colored left accent bar */}
        <div
          className="absolute top-0 left-0 bottom-0 w-[3px]"
          style={{ background: `linear-gradient(180deg, ${catFrom}, ${catTo})` }}
        />
        <div className="pl-4 pr-3 py-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {upd.category ? (
                catRoute ? (
                  <Link
                    to={catRoute}
                    className="inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white"
                    style={{ background: `linear-gradient(135deg, ${catFrom}, ${catTo})` }}
                  >
                    {CATEGORY_LABELS[upd.category]}
                  </Link>
                ) : (
                  <span
                    className="inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white"
                    style={{ background: `linear-gradient(135deg, ${catFrom}, ${catTo})` }}
                  >
                    {CATEGORY_LABELS[upd.category]}
                  </span>
                )
              ) : (
                <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                  Aktualizacja
                </span>
              )}
            </div>
            <span className="text-[9px] font-medium text-muted-foreground shrink-0 mt-0.5">{date}</span>
          </div>

          <p className={`font-black leading-[1.2] text-foreground ${mobile ? "text-[13px]" : "text-[15px]"}`}>
            {upd.title}
          </p>

          {upd.description && (
            <p className={`mt-2 leading-relaxed text-muted-foreground ${mobile ? "text-[11px]" : "text-[13px]"}`}>
              {upd.description}
            </p>
          )}

          {upd.mediaUrl && upd.mediaType === "image" && (
            <img src={upd.mediaUrl} alt={upd.title} className="mt-3 h-44 w-full rounded-[1rem] object-cover" />
          )}
          {upd.mediaUrl && upd.mediaType === "video" && (
            <video src={upd.mediaUrl} controls className="mt-3 w-full rounded-[1rem]" />
          )}

          {(upd.location || upd.linkUrl) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {upd.location && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" style={{ color: catFrom }} />
                  {upd.location}
                </span>
              )}
              {upd.linkUrl && (
                <a
                  href={upd.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black text-white shadow-sm transition active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${catFrom}, ${catTo})` }}
                >
                  <Link2 className="h-2.5 w-2.5" />
                  {upd.linkLabel || "Zobacz więcej"}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── Mobile Updates Page ──────────────────────────────────────────────────────

function MobileUpdatesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const { updates, status, loadMore } = useUpdatesFeed(activeCategory, 30);

  const grouped = groupByDate(updates ?? [], true);

  return (
    <div className="mobile-app-shell relative min-h-screen overflow-hidden bg-background pb-[calc(5.9rem+env(safe-area-inset-bottom,0px))] pt-[calc(4.8rem+env(safe-area-inset-top,0px))]">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-4rem] top-[-2rem] h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-[-3rem] top-24 h-36 w-36 rounded-full bg-orange-500/8 blur-3xl" />
        <div className="absolute bottom-24 left-8 h-28 w-28 rounded-full bg-yellow-500/8 blur-3xl" />
      </div>

      <div className="relative px-4 pb-8 pt-4">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-4">

          {/* Hero header */}
          <section className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/90 p-4 shadow-[0_20px_50px_-26px_rgba(15,23,42,0.38)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_34%),radial-gradient(circle_at_left,rgba(234,88,12,0.12),transparent_28%)]" />
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #f59e0b, #ea580c, transparent)" }} />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/75 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Aktualizacje
                </div>
                <h1 className="mt-3 max-w-[15rem] text-[1.72rem] font-black leading-[0.95] tracking-[-0.05em] text-foreground">
                  Bądź na bieżąco z informacjami.
                </h1>
              </div>
              <motion.div
                animate={{ y: [0, -4, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.35rem] shadow-sm"
                style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)" }}
              >
                <Zap className="h-5 w-5 text-white" />
              </motion.div>
            </div>
          </section>

          {/* Category filter */}
          <section className="sticky top-[calc(4.55rem+env(safe-area-inset-top,0px))] z-20 -mx-1">
            <div className="rounded-[1.7rem] border border-border/50 bg-background/88 px-3 py-3 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.32)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Kategorie</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setFilterOpen((v) => !v)}
                    className="flex h-9 items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 text-[11px] font-bold text-foreground transition active:scale-95"
                  >
                    <Filter className="h-3 w-3" />
                    Filtr
                    <ChevronDown className={`h-3 w-3 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {filterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-[1.25rem] border border-border/50 bg-card shadow-xl"
                      >
                        <button type="button" onClick={() => { setActiveCategory(null); setFilterOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-[12px] font-bold transition-colors ${activeCategory === null ? "bg-amber-500 text-white" : "text-foreground hover:bg-muted"}`}>
                          Wszystkie
                        </button>
                        {ALL_CATEGORIES.map((cat) => (
                          <button key={cat} type="button" onClick={() => { setActiveCategory(activeCategory === cat ? null : cat); setFilterOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-[12px] font-bold transition-colors ${activeCategory === cat ? `${CATEGORY_COLORS[cat]?.bg ?? "bg-primary"} text-white` : "text-foreground hover:bg-muted"}`}>
                            {CATEGORY_LABELS[cat]}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button type="button" onClick={() => setActiveCategory(null)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-black transition active:scale-95 ${activeCategory === null ? "border-amber-500/30 bg-amber-500 text-white shadow-sm" : "border-border/50 bg-card text-muted-foreground"}`}>
                  Wszystkie
                </button>
                {ALL_CATEGORIES.map((cat) => {
                  const cc = CATEGORY_COLORS[cat];
                  return (
                    <button key={cat} type="button" onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                      className={`shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-black transition active:scale-95 ${activeCategory === cat ? `${cc?.bg ?? "bg-primary"} border-transparent text-white shadow-sm` : "border-border/50 bg-card text-foreground/80"}`}>
                      {CATEGORY_LABELS[cat]}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Content */}
          {updates === null ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 rounded-[1.7rem] bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : updates.length === 0 ? (
            <div className="flex flex-col items-center rounded-[2rem] border border-border/30 bg-card px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Zap className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <p className="mt-4 text-[15px] font-black text-foreground">Brak aktualizacji</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {activeCategory ? "W tej kategorii nie ma jeszcze nowych wpisów." : "Sprawdź ponownie za chwilę."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([dateKey, dayUpdates], gi) => (
                <motion.section key={dateKey} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }} className="space-y-0">
                  {/* Date header */}
                  <div className="sticky top-[calc(8.4rem+env(safe-area-inset-top,0px))] z-10 mb-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/94 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground shadow-sm backdrop-blur-xl capitalize">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {dateKey}
                    </div>
                  </div>
                  {/* Timeline */}
                  <div className="relative">
                    <div className="absolute bottom-0 left-[1.35rem] top-0 w-[2px] rounded-full bg-[linear-gradient(180deg,hsl(38_92%_50%/0.3),hsl(var(--border)),transparent)]" />
                    {(dayUpdates ?? []).map((upd, i) => (
                      <UpdateCard key={upd._id} upd={upd} index={i} isLast={i === (dayUpdates?.length ?? 0) - 1} mobile={true} />
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>
          )}

          {status === "CanLoadMore" && (
            <div className="flex justify-center pt-1">
              <button type="button" onClick={() => loadMore()}
                className="rounded-full border border-border/50 bg-card px-5 py-3 text-[12px] font-black text-foreground transition active:scale-95 shadow-sm">
                Wczytaj więcej
              </button>
            </div>
          )}
          {status === "LoadingMore" && (
            <div className="flex justify-center py-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Desktop Updates Page ─────────────────────────────────────────────────────

function DesktopUpdatesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { updates, status, loadMore } = useUpdatesFeed(activeCategory, 20);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const grouped = groupByDate(updates ?? [], true);
  const activeCatColors = activeCategory ? CATEGORY_COLORS[activeCategory] : null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" style={{ background: "rgba(245,158,11,0.08)" }} />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full blur-[100px] translate-x-1/3" style={{ background: "rgba(234,88,12,0.06)" }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" style={{ background: "rgba(245,158,11,0.07)" }} />
      </div>

      <Navbar />
      <div className="relative z-10 pt-28 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Strona główna
          </Link>

          {/* Header card */}
          <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/90 p-6 shadow-[0_20px_50px_-26px_rgba(15,23,42,0.2)] backdrop-blur-xl mb-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_40%)]" />
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #f59e0b, #ea580c, transparent)" }} />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/75 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-3">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Live feed
                </div>
                <h1 className="text-4xl font-black text-foreground tracking-[-0.03em]">Aktualizacje</h1>
                <p className="text-muted-foreground mt-1.5 text-base">Bieżące informacje z Bydgoszczy w czasie rzeczywistym</p>
              </div>
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.8rem] shadow-lg" style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)" }}>
                <Zap className="h-9 w-9 text-white" />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setActiveCategory(null)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${activeCategory === null ? "border-amber-500/30 bg-amber-500 text-white shadow-sm" : "border-border/50 bg-card text-muted-foreground hover:text-foreground"}`}>
                Wszystkie
              </button>
              {ALL_CATEGORIES.map(cat => {
                const cc = CATEGORY_COLORS[cat];
                return (
                  <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${activeCategory === cat ? `${cc?.bg ?? "bg-primary"} border-transparent text-white shadow-sm` : "border-border/50 bg-card text-muted-foreground hover:text-foreground"}`}>
                    {CATEGORY_LABELS[cat]}
                  </button>
                );
              })}
            </div>
            <div className="relative shrink-0" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${activeCategory ? `${activeCatColors?.bg} ${activeCatColors?.text} border-transparent shadow-sm` : "bg-card text-muted-foreground border-border/50 hover:text-foreground"}`}>
                <Filter className="w-3 h-3" />
                {activeCategory ? CATEGORY_LABELS[activeCategory] : "Filtruj"}
                <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl border border-border/50 bg-card shadow-xl overflow-hidden z-50">
                    <button onClick={() => { setActiveCategory(null); setDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${activeCategory === null ? "bg-amber-500 text-white" : "hover:bg-muted text-foreground"}`}>
                      Wszystkie
                    </button>
                    {ALL_CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => { setActiveCategory(activeCategory === cat ? null : cat); setDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${activeCategory === cat ? `${CATEGORY_COLORS[cat]?.bg} ${CATEGORY_COLORS[cat]?.text}` : "hover:bg-muted text-foreground"}`}>
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {updates === null ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 rounded-[1.5rem] bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : updates.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground">
            <Zap className="h-14 w-14 mb-4 opacity-30" />
            <p className="font-bold text-lg text-foreground">Brak aktualizacji</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateKey, dayUpdates], gi) => (
            <motion.div key={dateKey} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }} className="mb-8">
              {/* Date divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-border/50" />
                <span className="rounded-full px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider border border-border/50 bg-card shadow-sm capitalize">
                  {dateKey}
                </span>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              {/* Timeline */}
              <div className="relative">
                <div className="absolute bottom-0 left-[1.65rem] top-0 w-[2px] rounded-full bg-[linear-gradient(180deg,rgba(245,158,11,0.35),hsl(var(--border)),transparent)]" />
                {(dayUpdates ?? []).map((upd, i) => (
                  <UpdateCard key={upd._id} upd={upd} index={i} isLast={i === (dayUpdates?.length ?? 0) - 1} mobile={false} />
                ))}
              </div>
            </motion.div>
          ))
        )}

        {status === "CanLoadMore" && (
          <div className="flex justify-center pt-6">
            <button onClick={() => loadMore()}
              className="px-6 py-2.5 rounded-xl text-sm font-bold border border-border/50 bg-card text-foreground hover:bg-muted transition-colors shadow-sm">
              Wczytaj więcej
            </button>
          </div>
        )}
        {status === "LoadingMore" && (
          <div className="flex justify-center pt-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function UpdatesPage() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileUpdatesPage />;
  return <DesktopUpdatesPage />;
}