import { CloudSun, Search, ArrowUpRight, Clock3, X, Sun, Moon, Home, TramFront, Heart, Zap, Users, Building2, Flame, HeartPulse, Music, Palette, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { fetchBydgoszczWeather, toWeatherSummary } from "@/lib/weather";
import type { WeatherSummary } from "@/lib/weather";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { fetchArticles, type Article } from "@/lib/articles-api";
import { getArticleHref } from "@/lib/articleRouting";

// ─── Date Chip ────────────────────────────────────────────────────────────────

function DateChip() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const day = now.toLocaleDateString("pl-PL", { weekday: "long" });
      const date = now.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
      setLabel(`${day.charAt(0).toUpperCase() + day.slice(1)}, ${date}`);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-[10.5px] font-semibold tracking-tight whitespace-nowrap select-none text-foreground/50 dark:text-foreground/40">
      {label}
    </span>
  );
}

// ─── Weather Chip ─────────────────────────────────────────────────────────────

function WeatherChip() {
  const [w, setW] = useState<WeatherSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBydgoszczWeather()
      .then(d => { if (!cancelled && d) setW(toWeatherSummary(d)); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <button
      type="button"
      onClick={() => nav("/pogoda")}
      className="flex h-7 items-center gap-1 rounded-full bg-sky-500/10 px-2.5 text-[11px] font-bold text-sky-600 transition-all active:scale-95 dark:bg-sky-400/15 dark:text-sky-300"
    >
      <CloudSun className="h-3 w-3 shrink-0" />
      {loading ? (
        <span className="h-2.5 w-7 animate-pulse rounded bg-sky-400/25" />
      ) : w ? (
        `${w.temp}°C`
      ) : "—"}
    </button>
  );
}

// ─── Dark Mode Hook ───────────────────────────────────────────────────────────

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next ? "#0f1117" : "#fafafa");
  };
  return { isDark, toggle };
}

// ─── Day/Night Toggle Button ──────────────────────────────────────────────────

function DayNightToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.82 }}
      aria-label={isDark ? "Tryb dzienny" : "Tryb nocny"}
      className="relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(251,191,36,0.22), rgba(245,158,11,0.14))"
          : "linear-gradient(135deg, rgba(148,163,184,0.14), rgba(100,116,139,0.08))",
        border: isDark
          ? "1px solid rgba(251,191,36,0.35)"
          : "1px solid rgba(148,163,184,0.28)",
        boxShadow: isDark
          ? "0 2px 12px rgba(251,191,36,0.25), inset 0 1px 0 rgba(255,255,255,0.1)"
          : "inset 0 1px 0 rgba(255,255,255,0.5)",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? "sun" : "moon"}
          initial={{ rotate: -45, opacity: 0, scale: 0.4 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 45, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {isDark ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-slate-500" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Search Overlay ───────────────────────────────────────────────────────────
// Backdrop: z-[175] (below top bar z-[190] and bottom nav z-[185])
// Panel: z-[176]

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Article[]>([]);

  useEffect(() => {
    if (!open) { setValue(""); return; }
    setHistory(JSON.parse(localStorage.getItem("searchHistory") || "[]"));
  }, [open]);

  const normalized = value.trim();

  useEffect(() => {
    let isMounted = true;
    if (!open || normalized.length < 2) {
      setSuggestions([]);
      return () => {
        isMounted = false;
      };
    }

    fetchArticles({ search: normalized, limit: 10 })
      .then((articles) => {
        if (!isMounted) return;
        setSuggestions(articles);
      })
      .catch(() => {
        if (!isMounted) return;
        setSuggestions([]);
      });

    return () => {
      isMounted = false;
    };
  }, [open, normalized]);

  const saveHistory = (query: string) => {
    const next = [query, ...history.filter(i => i !== query)].slice(0, 6);
    setHistory(next);
    localStorage.setItem("searchHistory", JSON.stringify(next));
  };

  const openResult = (article?: Pick<Article, "slug" | "id" | "title">) => {
    if (!article) return;
    navigate(getArticleHref(article));
    onClose();
    setValue("");
  };

  const submitSearch = (query: string) => {
    const q = query.trim();
    if (!q) return;
    saveHistory(q);
    navigate(`/szukaj?q=${encodeURIComponent(q)}`);
    onClose();
    setValue("");
  };

  const removeHistoryItem = (item: string) => {
    const next = history.filter(e => e !== item);
    setHistory(next);
    localStorage.setItem("searchHistory", JSON.stringify(next));
  };

  const items = useMemo(() => {
    if (normalized.length >= 2 && suggestions) {
      return suggestions.slice(0, 6).map(a => ({
        key: a.id,
        title: a.title,
        subtitle: a.author || "Artykuł",
        onClick: () => openResult(a),
        isHistory: false,
      }));
    }
    return history.map(item => ({
      key: item,
      title: item,
      subtitle: "Ostatnie wyszukiwanie",
      onClick: () => submitSearch(item),
      isHistory: true,
    }));
  }, [history, normalized, suggestions]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-[175]"
            style={{
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          />

          {/* Search panel — centered, colorful */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.94 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 z-[176]"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 4.8rem)" }}
          >
            <div
              className="mx-auto max-w-md overflow-hidden rounded-[2rem]"
              style={{
                background: "linear-gradient(145deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)",
                border: "none",
                boxShadow: "0 40px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.4)",
              }}
            >
              <div className="p-4">
                {/* Title */}
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-black text-white">Szukaj</p>
                    <p className="text-[10px] font-medium text-white/60">Artykuły, tematy, autorzy</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white active:scale-90 transition-transform"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Input row — white solid background */}
                <div
                  className="flex items-center gap-2.5 rounded-[1.4rem] px-4"
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    border: "none",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,1)",
                  }}
                >
                  <Search className="h-4 w-4 shrink-0 text-indigo-500" />
                  <input
                    autoFocus
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") submitSearch(value); }}
                    placeholder="Szukaj artykułów i tematów..."
                    className="h-12 flex-1 bg-transparent text-[14px] font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  {value && (
                    <motion.button
                      type="button"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => setValue("")}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-500 active:scale-90 transition-transform"
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  )}
                </div>

                {/* Results list */}
                {items.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 overflow-hidden rounded-[1.4rem]"
                    style={{
                      border: "none",
                      background: "rgba(255,255,255,0.12)",
                    }}
                  >
                    {items.map((item, index) => (
                      <div
                        key={item.key}
                        className={`flex items-center gap-3 px-4 py-2.5 ${index < items.length - 1 ? "border-b border-white/10" : ""}`}
                      >
                        <button type="button" onClick={item.onClick} className="flex flex-1 items-center gap-3 text-left">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.75rem]"
                            style={{
                              background: item.isHistory
                                ? "rgba(255,255,255,0.15)"
                                : "rgba(255,255,255,0.2)",
                            }}
                          >
                            {!item.isHistory
                              ? <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                              : <Clock3 className="h-3.5 w-3.5 text-white/70" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-bold text-white">{item.title}</span>
                            <span className="block truncate text-[10px] text-white/55">{item.subtitle}</span>
                          </span>
                        </button>
                        {item.isHistory && (
                          <button type="button" onClick={() => removeHistoryItem(item.title)} className="flex h-7 w-7 items-center justify-center rounded-full text-white/30 active:scale-90">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}

                {normalized.length >= 2 && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => submitSearch(value)}
                    className="mt-3 w-full rounded-[1.2rem] py-3 text-[13px] font-black active:scale-[0.98] transition-transform duration-150"
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      color: "#4f46e5",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                    }}
                  >
                    Szukaj: „{normalized}"
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Full-screen Menu Overlay ─────────────────────────────────────────────────
// z-[205] — above top bar z-[190] and bottom nav z-[185]

export function GlobalMenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate();
  const { isDark, toggle: toggleDark } = useDarkMode();

  const categories = [
    { href: "/miasto",        label: "Miasto",        icon: Building2,  from: "#2563eb", to: "#0891b2" },
    { href: "/rozrywka",      label: "Rozrywka",      icon: Music,      from: "#e11d48", to: "#db2777" },
    { href: "/kultura",       label: "Kultura",       icon: Palette,    from: "#d97706", to: "#ea580c" },
    { href: "/biznes",        label: "Biznes",        icon: TrendingUp, from: "#059669", to: "#0d9488" },
    { href: "/gastronomia",   label: "Gastronomia",   icon: Flame,      from: "#ea580c", to: "#dc2626" },
    { href: "/bydgoszczanie", label: "Bydgoszczanie", icon: Users,      from: "#7c3aed", to: "#9333ea" },
    { href: "/medyczna",      label: "Medycyna",      icon: HeartPulse, from: "#0d9488", to: "#0891b2" },
  ];

  const services = [
    { href: "/aktualizacje",  label: "Aktualizacje",   sublabel: "Na żywo",     icon: Zap,      from: "#f59e0b", to: "#ea580c" },
    { href: "/pogoda",        label: "Pogoda",         sublabel: "Bydgoszcz",   icon: CloudSun, from: "#0ea5e9", to: "#2563eb" },
    { href: "/rozklad-jazdy", label: "Rozkład MZK",    sublabel: "Komunikacja", icon: TramFront,from: "#3b82f6", to: "#6366f1" },
    { href: "/nekrolog",      label: "Strefa Pamięci", sublabel: "Nekrologi",   icon: Heart,    from: "#64748b", to: "#475569" },
    { href: "/autor",         label: "Autorzy",        sublabel: "Redakcja",    icon: Users,    from: "#8b5cf6", to: "#ec4899" },
  ];

  const go = (href: string) => { nav(href); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
            className="fixed inset-0 z-[203]"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
          />

          {/* Full-screen panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[205] flex flex-col overflow-hidden"
            style={{
              height: "100dvh",
              background: isDark
                ? "linear-gradient(160deg, #0a0e1a 0%, #0f1628 35%, #0d1220 70%, #0a0e1a 100%)"
                : "linear-gradient(160deg, #fafbff 0%, #f0f4ff 35%, #fafbff 70%, #f5f8ff 100%)",
              boxShadow: "0 -40px 100px -20px rgba(0,0,0,0.6)",
            }}
          >
            {/* ── Rich decorative background ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {/* Large colorful ambient blobs */}
              <div
                className="absolute -right-16 -top-16 h-72 w-72 rounded-full blur-3xl"
                style={{ background: isDark ? "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)" : "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)" }}
              />
              <div
                className="absolute -left-16 top-[20%] h-64 w-64 rounded-full blur-3xl"
                style={{ background: isDark ? "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 65%)" : "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 65%)" }}
              />
              <div
                className="absolute right-[10%] top-[42%] h-48 w-48 rounded-full blur-2xl"
                style={{ background: isDark ? "radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 65%)" : "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 65%)" }}
              />
              <div
                className="absolute left-[20%] bottom-[18%] h-56 w-56 rounded-full blur-3xl"
                style={{ background: isDark ? "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 65%)" : "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 65%)" }}
              />
              {/* Dot grid */}
              <div
                className="absolute inset-0 opacity-[0.4]"
                style={{
                  backgroundImage: isDark
                    ? "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)"
                    : "radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              {/* Top color wash */}
              <div
                className="absolute inset-x-0 top-0 h-64"
                style={{
                  background: isDark
                    ? "linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)"
                    : "linear-gradient(180deg, rgba(99,102,241,0.05) 0%, transparent 100%)",
                }}
              />
              {/* Floating animated shapes */}
              <motion.div
                animate={{ y: [-8, 8, -8], rotate: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute right-[10%] top-[16%] h-14 w-14 rounded-[1rem]"
                style={{
                  background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)",
                  border: isDark ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(99,102,241,0.15)",
                }}
              />
              <motion.div
                animate={{ y: [6, -6, 6], rotate: [0, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute left-[6%] top-[30%] h-10 w-10 rounded-full"
                style={{
                  background: isDark ? "rgba(236,72,153,0.08)" : "rgba(236,72,153,0.05)",
                  border: isDark ? "1px solid rgba(236,72,153,0.2)" : "1px solid rgba(236,72,153,0.12)",
                }}
              />
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute right-[22%] bottom-[24%] h-8 w-8 rounded-full"
                style={{
                  background: isDark ? "rgba(14,165,233,0.1)" : "rgba(14,165,233,0.06)",
                  border: isDark ? "1px solid rgba(14,165,233,0.2)" : "1px solid rgba(14,165,233,0.12)",
                }}
              />
              <motion.div
                animate={{ y: [4, -4, 4], x: [-3, 3, -3] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute left-[40%] bottom-[35%] h-6 w-6 rounded-[0.5rem]"
                style={{
                  background: isDark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.06)",
                  border: isDark ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(245,158,11,0.12)",
                }}
              />
            </div>

            {/* Safe area top padding */}
            <div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }} />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-love-bydgoszcz.png"
                  alt="Love Bydgoszcz"
                  className="h-8 w-auto object-contain"
                  style={{ filter: isDark ? "brightness(0) invert(1)" : "none" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="flex items-center gap-2">
                {/* Day/Night toggle */}
                <motion.button
                  type="button"
                  onClick={toggleDark}
                  whileTap={{ scale: 0.9 }}
                  className="relative flex h-8 items-center gap-2 overflow-hidden rounded-full px-3 text-[11px] font-black transition-all duration-300"
                  style={{
                    background: isDark
                      ? "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.12))"
                      : "linear-gradient(135deg, rgba(100,116,139,0.12), rgba(71,85,105,0.08))",
                    border: isDark ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(100,116,139,0.22)",
                    color: isDark ? "#fbbf24" : "#64748b",
                    boxShadow: isDark ? "0 2px 12px rgba(251,191,36,0.18)" : "none",
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isDark ? "sun" : "moon"}
                      initial={{ rotate: -30, opacity: 0, scale: 0.6 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 30, opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                    </motion.div>
                  </AnimatePresence>
                  <span>{isDark ? "Dzień" : "Noc"}</span>
                </motion.button>

                {/* Close button */}
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileTap={{ scale: 0.85, rotate: 90 }}
                  transition={{ duration: 0.18 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/50 active:scale-90"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Thin divider */}
            <div
              className="mx-5 h-px shrink-0"
              style={{
                background: isDark
                  ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
                  : "linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)",
              }}
            />

            {/* Scrollable content */}
            <div className="relative z-10 flex-1 overflow-y-auto px-5 py-5 space-y-5">

              {/* Categories — 2-col gradient cards */}
              <div>
                <p
                  className="mb-3 text-[9px] font-black uppercase tracking-[0.28em]"
                  style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}
                >
                  Kategorie
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat, i) => {
                    const Icon = cat.icon;
                    return (
                      <motion.button
                        key={cat.href}
                        type="button"
                        initial={{ opacity: 0, y: 14, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.24, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => go(cat.href)}
                        className="relative flex items-center gap-2.5 overflow-hidden rounded-[1.1rem] px-3.5 py-3 text-left active:scale-[0.96] transition-transform duration-150"
                        style={{
                          background: `linear-gradient(135deg, ${cat.from}, ${cat.to})`,
                          boxShadow: `0 6px 20px -8px ${cat.from}60`,
                        }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_0%,transparent_50%)] pointer-events-none" />
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] bg-white/22">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="relative z-10 text-[13px] font-black text-white leading-tight drop-shadow-sm">{cat.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div
                  className="h-px flex-1"
                  style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}
                />
                <span
                  className="text-[8.5px] font-black uppercase tracking-[0.26em]"
                  style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)" }}
                >
                  Usługi
                </span>
                <div
                  className="h-px flex-1"
                  style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}
                />
              </div>

              {/* Services — gradient cards 3-col */}
              <div className="grid grid-cols-3 gap-2">
                {services.map((svc, i) => {
                  const Icon = svc.icon;
                  return (
                    <motion.button
                      key={svc.href}
                      type="button"
                      initial={{ opacity: 0, scale: 0.85, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: 0.3 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => go(svc.href)}
                      className="relative flex flex-col items-center gap-2 overflow-hidden rounded-[1.1rem] p-3 text-center active:scale-[0.95] transition-transform duration-150"
                      style={{
                        background: `linear-gradient(145deg, ${svc.from}, ${svc.to})`,
                        boxShadow: `0 6px 18px -6px ${svc.from}55`,
                      }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0%,transparent_50%)] pointer-events-none" />
                      <div className="absolute -right-3 -top-3 h-10 w-10 rounded-full opacity-15 pointer-events-none" style={{ background: "rgba(255,255,255,0.5)" }} />
                      <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-[0.65rem] bg-white/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                        <Icon className="text-white" style={{ width: "1.1rem", height: "1.1rem" }} />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[11px] font-black leading-tight text-white drop-shadow-sm">{svc.label}</p>
                        <p className="mt-0.5 text-[8px] font-semibold text-white/60">{svc.sublabel}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Home shortcut */}
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.55 }}
                onClick={() => go("/")}
                className="flex w-full items-center justify-between rounded-[1rem] px-4 py-3 active:scale-[0.98] transition-transform duration-150"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-[0.55rem]"
                    style={{ background: "hsl(var(--primary)/0.12)" }}
                  >
                    <Home className="h-4 w-4 text-primary" />
                  </span>
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)" }}
                  >
                    Strona główna
                  </span>
                </div>
                <svg className="h-4 w-4" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Top Bar ─────────────────────────────────────────────────────────────
// z-[190] — above search overlay (z-[175/176]) and bottom nav (z-[185])

export default function MobileGlobalTopBar() {
  const isMobile = useIsMobile();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggle: toggleDark } = useDarkMode();

  // Listen for search toggle events from bottom nav
  useEffect(() => {
    const handler = () => setSearchOpen(v => !v);
    window.addEventListener("mobile-search-toggle", handler);
    return () => window.removeEventListener("mobile-search-toggle", handler);
  }, []);

  if (!isMobile) return null;

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => { setSearchOpen(false); window.dispatchEvent(new Event("mobile-search-close")); }} />
      <GlobalMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Top bar — z-[190] */}
      <div
        className="fixed inset-x-0 top-0 z-[190]"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(15,22,40,0.97) 0%, rgba(20,14,35,0.97) 50%, rgba(10,18,32,0.97) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(240,245,255,0.97) 50%, rgba(248,250,255,0.97) 100%)",
          borderBottom: "1px solid hsl(var(--border)/0.15)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: isDark
            ? "0 1px 0 rgba(99,102,241,0.12), 0 4px 20px -4px rgba(0,0,0,0.4)"
            : "0 1px 0 rgba(99,102,241,0.08), 0 4px 20px -4px rgba(0,0,0,0.06)",
        }}
      >
        {/* Subtle gradient accent line at top */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.6) 30%, rgba(236,72,153,0.5) 60%, transparent 100%)" }}
        />

        {/* Main row — logo + icons */}
        <div
          className="flex items-center justify-between px-4 pb-2"
          style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top, 0px))" }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/logo-love-bydgoszcz.png"
              alt="Love Bydgoszcz"
              className="h-8 w-auto object-contain block"
              style={{ maxWidth: "140px" }}
              onError={e => {
                const img = e.target as HTMLImageElement;
                img.src = "/logo.png";
                img.onerror = () => { img.style.display = "none"; };
              }}
            />
          </Link>

          {/* Right: date + action buttons stacked */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            {/* Date row — top right */}
            <DateChip />
            {/* Action buttons row */}
            <div className="flex items-center gap-1.5">
              <WeatherChip />
              <DayNightToggle isDark={isDark} onToggle={toggleDark} />
              {/* Search button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => setSearchOpen(v => !v)}
                className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200 ${
                  searchOpen
                    ? "border-primary/50 bg-primary text-primary-foreground shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    : "border-border/40 bg-card/70 text-foreground/60"
                }`}
              >
                <Search className="h-3.5 w-3.5" />
              </motion.button>
              {/* Menu button */}
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border/40 bg-card/70 text-foreground/60 active:scale-90 transition-transform duration-150"
                aria-label="Menu"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
