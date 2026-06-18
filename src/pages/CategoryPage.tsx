import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Navigate } from "react-router";
import NotFound from "@/pages/NotFound";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import SidebarWidgets from "@/components/landing/SidebarWidgets";
import PatronageSlider from "@/components/PatronageSlider";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Music, Palette, Briefcase, UtensilsCrossed, Sparkles, Users,
  HeartPulse, Stethoscope, Activity, Syringe, ShieldPlus, Pill,
  Play, ArrowLeft, Clock, ChevronRight, ChevronLeft, TrendingUp,
  Flame, Star, MapPin, Coffee, Theater, Landmark, Utensils,
  Zap, Heart, BookOpen, Camera, Mic2, Eye, Loader2, BarChart2
} from "lucide-react";
import { useNavigate } from "react-router";
import { useIsMobile } from "@/hooks/use-mobile";
import { getArticleHref } from "@/lib/articleRouting";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CategoryTheme {
  primary: string;
  bg: string;
  accent: string;
  gradient: string;
  lightBg: string;
  border: string;
  badge: string;
  pattern: string;
  patternSize?: string;
  patternOpacity?: string;
}

interface CategoryConfig {
  title: string;
  description: string;
  icon: React.ElementType;
  theme: CategoryTheme;
  moodLabel: string;
  bgIcons: React.ElementType[];
  accentHex: string;
  heroGradient: string;
  chipColor: string;
  headerGradient: string;
  headerFrom: string;
  headerTo: string;
  hashtags: string[];
}

// ─── Medical animated background ─────────────────────────────────────────────
const MedicalBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[
      { Icon: Stethoscope, top: "15%", left: "10%", dur: 6, delay: 0 },
      { Icon: Syringe, top: "25%", right: "8%", dur: 7, delay: 1 },
      { Icon: Pill, bottom: "20%", left: "25%", dur: 8, delay: 2 },
      { Icon: ShieldPlus, bottom: "25%", right: "25%", dur: 6.5, delay: 0.5 },
      { Icon: HeartPulse, top: "10%", left: "40%", dur: 7.5, delay: 1.5 },
    ].map(({ Icon, dur, delay, ...pos }, i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
        className="absolute opacity-[0.14] text-white"
        style={pos as any}
      >
        <Icon className="w-14 h-14" />
      </motion.div>
    ))}
    <motion.div
      animate={{ scale: [1, 1.06, 1], opacity: [0.05, 0.1, 0.05] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
    >
      <Activity className="w-52 h-52" />
    </motion.div>
  </div>
);

// ─── Per-category decorative background ──────────────────────────────────────
const CAT_BG_ICONS: Record<string, { icons: React.ElementType[] }> = {
  miasto: { icons: [Building2, Landmark, MapPin, Zap] },
  rozrywka: { icons: [Music, Mic2, Camera, Star] },
  kultura: { icons: [Palette, Theater, BookOpen, Sparkles] },
  biznes: { icons: [Briefcase, TrendingUp, Zap, Star] },
  gastronomia: { icons: [UtensilsCrossed, Coffee, Utensils, Heart] },
  bydgoszczanie: { icons: [Users, Heart, Camera, Mic2] },
  medyczna: { icons: [HeartPulse, Stethoscope, ShieldPlus, Activity] },
};

function CategoryBackground({ slug }: { slug: string }) {
  if (slug === "medyczna") return <MedicalBackground />;
  const cfg = CAT_BG_ICONS[slug];
  if (!cfg) return null;
  const positions = [
    { top: "8%", left: "5%", size: "w-12 h-12", dur: 7, delay: 0 },
    { top: "20%", right: "6%", size: "w-16 h-16", dur: 9, delay: 1.2 },
    { top: "45%", left: "2%", size: "w-10 h-10", dur: 8, delay: 0.6 },
    { bottom: "28%", right: "4%", size: "w-14 h-14", dur: 6.5, delay: 2 },
    { bottom: "10%", left: "16%", size: "w-11 h-11", dur: 10, delay: 0.3 },
    { top: "62%", right: "18%", size: "w-9 h-9", dur: 7.5, delay: 1.8 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {positions.map((pos, i) => {
        const Icon = cfg.icons[i % cfg.icons.length];
        const { size, dur, delay, ...style } = pos;
        return (
          <motion.div
            key={i}
            animate={{ y: [0, -14, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0], opacity: [0.1, 0.18, 0.1] }}
            transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
            className="absolute text-white"
            style={style as any}
          >
            <Icon className={size} />
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Advanced category redirects ─────────────────────────────────────────────
const ADVANCED_CATEGORY_ROUTES: Record<string, string> = {
  sport: "/sport",
  polityka: "/polityka",
  inwestycje: "/inwestycje",
  nasze_dzialania: "/nasze-dzialania",
  "nasze-dzialania": "/nasze-dzialania",
};

// ─── Category config ──────────────────────────────────────────────────────────
const categoryConfig: Record<string, CategoryConfig> = {
  miasto: {
    title: "Miasto",
    description: "Rozwój, inwestycje i życie miejskie. Bądź na bieżąco z tym, co dzieje się w Bydgoszczy.",
    icon: Building2,
    moodLabel: "Miejskie tempo",
    bgIcons: [Building2, Landmark, MapPin],
    accentHex: "#3b82f6",
    heroGradient: "from-blue-900 via-blue-700 to-cyan-600",
    headerGradient: "from-blue-600 via-blue-500 to-cyan-500",
    headerFrom: "#2563eb",
    headerTo: "#0891b2",
    chipColor: "bg-blue-500",
    theme: {
      primary: "text-blue-600",
      bg: "bg-blue-50/50",
      accent: "bg-blue-600",
      gradient: "from-blue-600 to-cyan-500",
      lightBg: "bg-slate-50",
      border: "border-blue-100",
      badge: "bg-blue-100 text-blue-700 border-blue-200",
      pattern: "radial-gradient(#3b82f6 1px, transparent 1px)"
    },
    hashtags: ["Bydgoszcz", "Miasto", "Inwestycje", "Infrastruktura", "Samorząd", "Rewitalizacja", "Urbanistyka", "Transport"]
  },
  rozrywka: {
    title: "Rozrywka",
    description: "Koncerty, wystawy i życie nocne. Odkryj najlepsze miejsca na spędzenie wolnego czasu.",
    icon: Music,
    moodLabel: "Po godzinach",
    bgIcons: [Music, Mic2, Camera],
    accentHex: "#f43f5e",
    heroGradient: "from-rose-900 via-rose-700 to-pink-600",
    headerGradient: "from-rose-600 via-rose-500 to-pink-500",
    headerFrom: "#e11d48",
    headerTo: "#db2777",
    chipColor: "bg-rose-500",
    theme: {
      primary: "text-rose-600",
      bg: "bg-rose-50/50",
      accent: "bg-rose-600",
      gradient: "from-rose-600 to-pink-500",
      lightBg: "bg-slate-50",
      border: "border-rose-100",
      badge: "bg-rose-100 text-rose-700 border-rose-200",
      pattern: "radial-gradient(#f43f5e 1px, transparent 1px)"
    },
    hashtags: ["Koncerty", "Imprezy", "Nocne Życie", "Festiwale", "Muzyka", "Rozrywka", "Kultura", "Weekend"]
  },
  kultura: {
    title: "Kultura",
    description: "Teatr, muzea i festiwale. Zanurz się w bogatym życiu kulturalnym naszego miasta.",
    icon: Palette,
    moodLabel: "Scena miasta",
    bgIcons: [Palette, Theater, BookOpen],
    accentHex: "#f59e0b",
    heroGradient: "from-amber-900 via-amber-700 to-orange-600",
    headerGradient: "from-amber-600 via-amber-500 to-orange-500",
    headerFrom: "#d97706",
    headerTo: "#ea580c",
    chipColor: "bg-amber-500",
    theme: {
      primary: "text-amber-600",
      bg: "bg-amber-50/50",
      accent: "bg-amber-600",
      gradient: "from-amber-600 to-orange-500",
      lightBg: "bg-slate-50",
      border: "border-amber-100",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
      pattern: "radial-gradient(#f59e0b 1px, transparent 1px)"
    },
    hashtags: ["Teatr", "Muzeum", "Sztuka", "Festiwal", "Kultura", "Wystawy", "Film", "Literatura"]
  },
  biznes: {
    title: "Biznes",
    description: "Gospodarka, przedsiębiorczość i innowacje. Śledź rozwój bydgoskiego rynku.",
    icon: Briefcase,
    moodLabel: "Ruch w biznesie",
    bgIcons: [Briefcase, TrendingUp, Zap],
    accentHex: "#10b981",
    heroGradient: "from-emerald-900 via-emerald-700 to-teal-600",
    headerGradient: "from-emerald-600 via-emerald-500 to-teal-500",
    headerFrom: "#059669",
    headerTo: "#0d9488",
    chipColor: "bg-emerald-500",
    theme: {
      primary: "text-emerald-600",
      bg: "bg-emerald-50/50",
      accent: "bg-emerald-600",
      gradient: "from-emerald-600 to-teal-500",
      lightBg: "bg-slate-50",
      border: "border-emerald-100",
      badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pattern: "radial-gradient(#10b981 1px, transparent 1px)"
    },
    hashtags: ["Biznes", "Startup", "Gospodarka", "Praca", "Inwestycje", "Przedsiębiorczość", "Finanse", "Rynek"]
  },
  gastronomia: {
    title: "Gastronomia",
    description: "Restauracje, kawiarnie i lokalne smaki. Przewodnik po kulinarnych zakątkach Bydgoszczy.",
    icon: UtensilsCrossed,
    moodLabel: "Smaki miasta",
    bgIcons: [UtensilsCrossed, Coffee, Utensils],
    accentHex: "#f97316",
    heroGradient: "from-orange-900 via-orange-700 to-red-600",
    headerGradient: "from-orange-600 via-orange-500 to-red-500",
    headerFrom: "#ea580c",
    headerTo: "#dc2626",
    chipColor: "bg-orange-500",
    theme: {
      primary: "text-orange-600",
      bg: "bg-orange-50/50",
      accent: "bg-orange-600",
      gradient: "from-orange-600 to-red-500",
      lightBg: "bg-slate-50",
      border: "border-orange-100",
      badge: "bg-orange-100 text-orange-700 border-orange-200",
      pattern: "radial-gradient(#f97316 1px, transparent 1px)"
    },
    hashtags: ["Restauracje", "Kawiarnie", "Jedzenie", "Smaki", "Gastronomia", "Bydgoszcz", "Kuchnia", "Brunch"]
  },
  bydgoszczanie: {
    title: "Bydgoszczanie",
    description: "Poznaj niezwykłych ludzi z naszego miasta. Sylwetki, wywiady i historie mieszkańców Bydgoszczy.",
    icon: Users,
    moodLabel: "Ludzie i historie",
    bgIcons: [Users, Heart, Camera],
    accentHex: "#8b5cf6",
    heroGradient: "from-violet-900 via-violet-700 to-purple-600",
    headerGradient: "from-violet-600 via-violet-500 to-purple-500",
    headerFrom: "#7c3aed",
    headerTo: "#9333ea",
    chipColor: "bg-violet-500",
    theme: {
      primary: "text-violet-600",
      bg: "bg-violet-50/50",
      accent: "bg-violet-600",
      gradient: "from-violet-600 to-purple-500",
      lightBg: "bg-slate-50",
      border: "border-violet-100",
      badge: "bg-violet-100 text-violet-700 border-violet-200",
      pattern: "radial-gradient(#8b5cf6 1px, transparent 1px)"
    },
    hashtags: ["Ludzie", "Wywiady", "Historie", "Bydgoszczanie", "Sylwetki", "Społeczność", "Pasje", "Inspiracje"]
  },
  medyczna: {
    title: "Medyczna Bydgoszcz",
    description: "Zdrowie, medycyna, porady i informacje z bydgoskich placówek medycznych.",
    icon: HeartPulse,
    moodLabel: "Zdrowie blisko Ciebie",
    bgIcons: [HeartPulse, Stethoscope, ShieldPlus],
    accentHex: "#14b8a6",
    heroGradient: "from-teal-900 via-teal-700 to-cyan-600",
    headerGradient: "from-teal-600 via-teal-500 to-cyan-500",
    headerFrom: "#0d9488",
    headerTo: "#0891b2",
    chipColor: "bg-teal-500",
    theme: {
      primary: "text-teal-600",
      bg: "bg-gradient-to-br from-teal-50 via-cyan-50/50 to-white",
      accent: "bg-teal-600",
      gradient: "from-teal-600 to-cyan-500",
      lightBg: "bg-slate-50",
      border: "border-teal-100",
      badge: "bg-teal-100 text-teal-700 border-teal-200",
      pattern: "none",
    },
    hashtags: ["Zdrowie", "Medycyna", "Szpital", "Profilaktyka", "Leczenie", "Bydgoszcz", "Lekarze", "Wellness"]
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Przed chwilą";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} godz.`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} dni`;
  return new Date(ts).toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="space-y-4 px-4">
      <div className="h-[19rem] rounded-[2.2rem] bg-muted/70 animate-pulse" />
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => <div key={i} className="h-8 flex-1 rounded-full bg-muted/60 animate-pulse" />)}
      </div>
      <div className="rounded-[1.8rem] bg-card border border-border/30 p-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-[5.5rem] w-[5.5rem] shrink-0 rounded-[1.15rem] bg-muted/70 animate-pulse" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-1/3 rounded-full bg-muted/60 animate-pulse" />
              <div className="h-4 w-full rounded-full bg-muted/70 animate-pulse" />
              <div className="h-4 w-4/5 rounded-full bg-muted/70 animate-pulse" />
              <div className="h-3 w-1/2 rounded-full bg-muted/50 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hero Slider ──────────────────────────────────────────────────────────────
function HeroSlider({ articles, chipColor, heroGradient, config }: { articles: any[]; chipColor: string; heroGradient: string; config: CategoryConfig }) {
  const [active, setActive] = useState(0);
  const nav = useNavigate();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (articles.length < 2) return;
    timerRef.current = setInterval(() => setActive(p => (p + 1) % articles.length), 4500);
  }, [articles.length]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  if (!articles.length) return null;
  const article = articles[active];
  const img = article.imageUrl || "/assets/logo-lovebydgoszcz.png";
  const authorImg = article.authorImageUrl || null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 44 && dy < 30) {
      if (dx < 0) setActive(p => (p + 1) % articles.length);
      else setActive(p => (p - 1 + articles.length) % articles.length);
      resetTimer();
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-[2.2rem] shadow-[0_32px_80px_-24px_rgba(15,23,42,0.65)]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bars + time badge in same row */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center gap-2 px-4 pt-3.5">
        <div className="flex flex-1 gap-1">
          {articles.map((_, i) => (
            <div key={i} className="h-[3px] flex-1 rounded-full overflow-hidden bg-white/25">
              {i === active && (
                <motion.div
                  key={`prog-${active}`}
                  className="h-full bg-white rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4.5, ease: "linear" }}
                />
              )}
              {i < active && <div className="h-full w-full bg-white rounded-full" />}
            </div>
          ))}
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-sm shrink-0">
          <Clock className="h-2.5 w-2.5" />
          {timeAgo(article.publishedAt)}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.button
          key={active}
          type="button"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
          onClick={() => nav(getArticleHref(article))}
          className="relative block h-[22rem] w-full overflow-hidden text-left active:scale-[0.985] transition-transform duration-150"
        >
          <img src={img} alt={article.title} className="h-full w-full object-cover" />
          {/* Only bottom gradient — no top tint */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_30%,rgba(0,0,0,0.55)_60%,rgba(0,0,0,0.95)_100%)]" />

          {/* Bottom content */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="line-clamp-3 text-[19px] font-black leading-[1.04] tracking-[-0.04em] text-white drop-shadow-lg">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-white/75">{article.excerpt}</p>
            )}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {authorImg ? (
                  <img src={authorImg} alt={article.author} className="h-6 w-6 rounded-full object-cover border border-white/30" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                    <span className="text-[8px] font-black text-white">{(article.author || "LB").charAt(0)}</span>
                  </div>
                )}
                <span className="text-[10.5px] font-bold text-white/75">{article.author || "Love Bydgoszcz"}</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-white/18 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm border border-white/20">
                Czytaj <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </motion.button>
      </AnimatePresence>

      {/* Dot indicators */}
      {articles.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {articles.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setActive(i); resetTimer(); }}
              className={`rounded-full transition-all duration-300 ${i === active ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Article list item ────────────────────────────────────────────────────────
function ArticleListItem({ article, index, chipColor }: { article: any; index: number; chipColor: string }) {
  const nav = useNavigate();
  const img = article.imageUrl || "/assets/logo-lovebydgoszcz.png";
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.04, 0.28) }}
      onClick={() => nav(getArticleHref(article))}
      className="group flex w-full items-start gap-3.5 py-3.5 text-left transition-colors duration-150 active:bg-muted/40 border-b border-border/20 last:border-0"
    >
      <div className="relative h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-[1.15rem] shadow-sm">
        <img src={img} alt={article.title} className="h-full w-full object-cover transition-transform duration-300 group-active:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(0,0,0,0.5))]" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
        <div className="flex items-center gap-1.5 text-[10px] text-foreground/45">
          <Clock className="h-2.5 w-2.5 shrink-0" />
          <span>{timeAgo(article.publishedAt)}</span>
          {article.author && <><span>·</span><span className="truncate max-w-[8rem]">{article.author}</span></>}
        </div>
        <h3 className="line-clamp-2 text-[14px] font-black leading-[1.18] tracking-[-0.025em] text-foreground">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="line-clamp-1 text-[11.5px] text-foreground/55 leading-relaxed">{article.excerpt}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 self-center text-foreground/25 group-active:translate-x-0.5 transition-transform mt-1" />
    </motion.button>
  );
}

// ─── Popular card (horizontal scroll) ────────────────────────────────────────
function PopularCard({ article, rank, chipColor, headerFrom, headerTo }: { article: any; rank: number; chipColor: string; headerFrom: string; headerTo: string }) {
  const nav = useNavigate();
  const img = article.imageUrl || "/assets/logo-lovebydgoszcz.png";
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: rank * 0.06 }}
      onClick={() => nav(getArticleHref(article))}
      className="group relative w-[11rem] shrink-0 text-left active:scale-[0.97] transition-transform duration-150"
    >
      <div className="overflow-hidden rounded-[1.7rem] shadow-[0_14px_36px_-18px_rgba(15,23,42,0.38)]">
        <div className="relative h-[10rem] w-full overflow-hidden">
          <img src={img} alt={article.title} className="h-full w-full object-cover transition-transform duration-300 group-active:scale-105" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.18)_30%,rgba(0,0,0,0.88)_100%)]" />
          {/* Rank badge */}
          <div
            className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${headerFrom}, ${headerTo})` }}
          >
            {rank + 1}
          </div>
          {/* Title at bottom */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <h4 className="line-clamp-2 text-[12px] font-black leading-[1.22] tracking-[-0.02em] text-white">{article.title}</h4>
            <div className="mt-1 flex items-center gap-1 text-[9px] text-white/60">
              <Clock className="h-2 w-2 shrink-0" />
              <span>{timeAgo(article.publishedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Category Reel Button — circle with article cover ────────────────────────
function CategoryReelButton({
  slug,
  title,
  headerFrom,
  headerTo,
  coverImg,
}: {
  slug: string;
  title: string;
  chipColor: string;
  headerFrom: string;
  headerTo: string;
  Icon: React.ElementType;
  coverImg?: string;
}) {
  const nav = useNavigate();

  return (
    <button
      type="button"
      onClick={() => nav(`/rolka/${slug}`)}
      className="group flex flex-col items-center active:scale-95 transition-transform duration-150"
      aria-label={`Otwórz rolkę kategorii ${title}`}
      style={{ gap: 0 }}
    >
      {/* Outer container — circle + label as one pill */}
      <div
        className="flex flex-col items-center overflow-hidden rounded-[1.4rem]"
        style={{ background: "rgba(0,0,0,0.25)", border: "1.5px solid rgba(255,255,255,0.22)", backdropFilter: "blur(8px)", gap: 0 }}
      >
        {/* Circle with gradient ring + article cover */}
        <div className="relative h-[2.8rem] w-[2.8rem] m-1 mb-0">
          <div
            className="absolute inset-0 rounded-full p-[2px] shadow-md"
            style={{ background: `linear-gradient(135deg, ${headerFrom}, ${headerTo})` }}
          >
            <div className="h-full w-full rounded-full overflow-hidden bg-muted">
              {coverImg ? (
                <img src={coverImg} alt={title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${headerFrom}, ${headerTo})` }} />
              )}
            </div>
          </div>
          {/* Play badge */}
          <div
            className="absolute -bottom-0.5 -right-0.5 flex h-[1rem] w-[1rem] items-center justify-center rounded-full border border-background shadow"
            style={{ background: `linear-gradient(135deg, ${headerFrom}, ${headerTo})` }}
          >
            <Play className="h-[5px] w-[5px] fill-white text-white ml-[1px]" />
          </div>
        </div>
        {/* Label — directly attached, no gap */}
        <span
          className="w-full text-center px-3 py-[5px] text-[7.5px] font-black uppercase tracking-[0.14em] text-white"
          style={{ background: `linear-gradient(135deg, ${headerFrom}cc, ${headerTo}cc)` }}
        >
          Rolka
        </span>
      </div>
    </button>
  );
}

// ─── Editorial Overlay Card ───────────────────────────────────────────────────
function EditorialOverlayCard({
  article,
  index,
  accentFrom,
  accentTo,
}: {
  article: any;
  index: number;
  accentFrom?: string;
  accentTo?: string;
}) {
  const nav = useNavigate();
  const img = article.imageUrl || "/assets/logo-lovebydgoszcz.png";
  const authorImg = article.authorImageUrl || null;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.08, 0.22) }}
      onClick={() => nav(getArticleHref(article))}
      className="group relative block w-full overflow-hidden rounded-[1.5rem] text-left active:scale-[0.985] transition-transform duration-150 shadow-[0_8px_24px_-10px_rgba(15,23,42,0.35)]"
    >
      <div className="relative h-[13rem] w-full overflow-hidden">
        <img
          src={img}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-active:scale-[1.03]"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.0)_0%,rgba(0,0,0,0.08)_30%,rgba(0,0,0,0.85)_100%)]" />
        {/* Accent tint at top */}
        {accentFrom && (
          <div
            className="absolute inset-x-0 top-0 h-16 opacity-30"
            style={{ background: `linear-gradient(180deg, ${accentFrom}, transparent)` }}
          />
        )}
        {/* Content at bottom */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="line-clamp-2 text-[16px] font-black leading-[1.1] tracking-[-0.03em] text-white drop-shadow-lg mb-2.5">
            {article.title}
          </h3>
          {/* Author + date row at bottom */}
          <div className="flex items-center justify-between">
            {article.author ? (
              <div className="flex items-center gap-1.5">
                {authorImg ? (
                  <img src={authorImg} alt={article.author} className="h-5 w-5 rounded-full object-cover border border-white/30 shrink-0" />
                ) : (
                  <div
                    className="h-5 w-5 rounded-full flex items-center justify-center border border-white/30 shrink-0"
                    style={{ background: accentFrom ? `${accentFrom}80` : "rgba(255,255,255,0.2)" }}
                  >
                    <span className="text-[7px] font-black text-white">{(article.author || "L").charAt(0)}</span>
                  </div>
                )}
                <p className="text-[9.5px] font-bold text-white/75 truncate max-w-[8rem]">{article.author}</p>
              </div>
            ) : <div />}
            {/* Date on right */}
            <div className="flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
              <Clock className="h-2 w-2" />
              {timeAgo(article.publishedAt)}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Other Category Button ────────────────────────────────────────────────────
const OTHER_CATEGORIES = [
  { slug: "miasto", label: "Miasto", from: "#2563eb", to: "#0891b2" },
  { slug: "rozrywka", label: "Rozrywka", from: "#e11d48", to: "#db2777" },
  { slug: "kultura", label: "Kultura", from: "#d97706", to: "#ea580c" },
  { slug: "biznes", label: "Biznes", from: "#059669", to: "#0d9488" },
  { slug: "gastronomia", label: "Gastronomia", from: "#ea580c", to: "#dc2626" },
  { slug: "bydgoszczanie", label: "Bydgoszczanie", from: "#7c3aed", to: "#9333ea" },
  { slug: "medyczna", label: "Medyczna", from: "#0d9488", to: "#0891b2" },
];

function ExploreOtherCategories({ currentSlug, headerFrom, headerTo }: { currentSlug: string; headerFrom: string; headerTo: string }) {
  const nav = useNavigate();
  const others = OTHER_CATEGORIES.filter(c => c.slug !== currentSlug).slice(0, 6);

  return (
    <section className="pt-1 pb-0">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-[3px] rounded-full shrink-0" style={{ background: `linear-gradient(180deg, ${headerFrom}, ${headerTo})` }} />
        <h2 className="text-[14px] font-black tracking-[-0.02em] text-foreground">Poznaj także</h2>
        <span className="ml-auto text-[9px] font-semibold text-foreground/35 italic">wszystkie kategorie</span>
      </div>
      {/* Horizontal scroll */}
      <div className="-mx-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2.5 px-4 pr-8 pb-1 pt-0.5">
          {others.map((cat, i) => {
            const CatIcon = categoryConfig[cat.slug]?.icon;
            return (
              <motion.button
                key={cat.slug}
                type="button"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.24, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.93 }}
                onClick={() => nav(`/${cat.slug}`)}
                className="group relative shrink-0 overflow-hidden rounded-[1.5rem] h-[8rem] w-[6.5rem] text-left shadow-[0_10px_28px_-12px_rgba(15,23,42,0.45)] active:scale-[0.95] transition-transform duration-150"
                style={{ background: `linear-gradient(155deg, ${cat.from}, ${cat.to})` }}
              >
                {/* Shine overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22)_0%,transparent_50%)]" />
                {/* Large icon watermark */}
                {CatIcon && (
                  <div className="absolute -bottom-3 -right-3 opacity-[0.18]">
                    <CatIcon className="h-16 w-16 text-white" />
                  </div>
                )}
                {/* Content */}
                <div className="relative z-10 flex h-full flex-col justify-between p-3">
                  {/* Icon badge at top */}
                  {CatIcon && (
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-[0.6rem]"
                      style={{ background: "rgba(255,255,255,0.22)" }}
                    >
                      <CatIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div>
                    <span className="block text-[11.5px] font-black text-white leading-tight line-clamp-2 mb-1">{cat.label}</span>
                    <div className="flex items-center gap-0.5 text-[8px] font-bold text-white/65 uppercase tracking-wider">
                      Czytaj <ChevronRight className="h-2 w-2" />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Hashtag Island ───────────────────────────────────────────────────────────
const CATEGORY_HASHTAGS: Record<string, string[]> = {
  miasto: ["Bydgoszcz", "Miasto", "Inwestycje", "Infrastruktura", "Samorząd", "Rewitalizacja", "Urbanistyka", "Transport"],
  rozrywka: ["Koncerty", "Imprezy", "Nocne Życie", "Festiwale", "Muzyka", "Rozrywka", "Kultura", "Weekend"],
  kultura: ["Teatr", "Muzeum", "Sztuka", "Festiwal", "Kultura", "Wystawy", "Film", "Literatura"],
  biznes: ["Biznes", "Startup", "Gospodarka", "Praca", "Inwestycje", "Przedsiębiorczość", "Finanse", "Rynek"],
  gastronomia: ["Restauracje", "Kawiarnie", "Jedzenie", "Smaki", "Gastronomia", "Bydgoszcz", "Kuchnia", "Brunch"],
  bydgoszczanie: ["Ludzie", "Wywiady", "Historie", "Bydgoszczanie", "Sylwetki", "Społeczność", "Pasje", "Inspiracje"],
  medyczna: ["Zdrowie", "Medycyna", "Szpital", "Profilaktyka", "Leczenie", "Bydgoszcz", "Lekarze", "Wellness"],
};

function HashtagIsland({ slug, headerFrom, headerTo }: { slug: string; headerFrom: string; headerTo: string }) {
  const tags = CATEGORY_HASHTAGS[slug] || ["Bydgoszcz", "LoveBydgoszcz"];
  const nav = useNavigate();

  // Each tag gets a deterministic style based on index
  const getTagStyle = (i: number): React.CSSProperties => {
    const styles: React.CSSProperties[] = [
      { background: `linear-gradient(135deg, ${headerFrom}, ${headerTo})`, color: "white", fontSize: 14, fontWeight: 900, padding: "8px 16px", boxShadow: `0 4px 14px -6px ${headerFrom}70` },
      { background: `${headerFrom}18`, color: headerFrom, fontSize: 11, fontWeight: 700, padding: "6px 12px" },
      { background: "transparent", border: `1.5px solid ${headerFrom}55`, color: headerFrom, fontSize: 12, fontWeight: 800, padding: "6px 13px" },
      { background: `${headerTo}14`, color: headerTo, fontSize: 10, fontWeight: 600, padding: "5px 11px", border: `1px solid ${headerTo}30` },
      { background: `linear-gradient(135deg, ${headerFrom}dd, ${headerTo}dd)`, color: "white", fontSize: 13, fontWeight: 900, padding: "7px 15px", boxShadow: `0 3px 10px -5px ${headerFrom}60` },
      { background: `${headerFrom}22`, color: headerFrom, fontSize: 11.5, fontWeight: 700, padding: "6px 13px", border: `1px solid ${headerFrom}35` },
      { background: `${headerTo}18`, color: headerTo, fontSize: 15, fontWeight: 900, padding: "9px 18px" },
      { background: "transparent", border: `1.5px solid ${headerTo}50`, color: headerTo, fontSize: 10.5, fontWeight: 600, padding: "5px 12px" },
    ];
    return { ...styles[i % styles.length], borderRadius: "999px", whiteSpace: "nowrap" as const };
  };

  return (
    <section className="pt-0 pb-1">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className="h-5 w-[3px] rounded-full shrink-0"
          style={{ background: `linear-gradient(180deg, ${headerFrom}, ${headerTo})` }}
        />
        <h2 className="text-[14px] font-black tracking-[-0.02em] text-foreground">Odkryj tematy</h2>
        <span className="ml-auto text-[9px] font-semibold text-foreground/35 italic">dotknij, by szukać →</span>
      </div>

      {/* Tag cloud card — full bleed with gradient bg */}
      <div
        className="relative overflow-hidden rounded-[1.8rem] px-4 pt-4 pb-5"
        style={{
          background: `linear-gradient(145deg, ${headerFrom}16 0%, ${headerTo}0c 60%, ${headerFrom}06 100%)`,
          border: `1.5px solid ${headerFrom}25`,
        }}
      >
        {/* Decorative # watermarks */}
        <div
          className="pointer-events-none absolute -right-1 -top-3 select-none font-black leading-none opacity-[0.06]"
          style={{ color: headerFrom, fontSize: "7rem" }}
        >
          #
        </div>
        <div
          className="pointer-events-none absolute -left-3 bottom-1 select-none font-black leading-none opacity-[0.04]"
          style={{ color: headerTo, fontSize: "4.5rem" }}
        >
          #
        </div>

        {/* Tag cloud — natural wrap */}
        <div className="relative z-10 flex flex-wrap gap-[7px]">
          {tags.map((tag, i) => (
            <motion.button
              key={tag}
              type="button"
              initial={{ opacity: 0, scale: 0.82, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.26, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.86 }}
              onClick={() => nav(`/szukaj?q=${encodeURIComponent(tag)}`)}
              className="transition-all duration-150 active:scale-90"
              style={getTagStyle(i)}
            >
              #{tag}
            </motion.button>
          ))}
        </div>

        {/* Bottom divider + count */}
        <div className="mt-4 flex items-center gap-2">
          <div
            className="h-px flex-1 opacity-15 rounded-full"
            style={{ background: `linear-gradient(90deg, ${headerFrom}, transparent)` }}
          />
          <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-foreground/25">
            {tags.length} tematów
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── Mobile Category Page ─────────────────────────────────────────────────────
function MobileCategoryPage({ slug, config }: { slug: string; config: CategoryConfig }) {
  const nav = useNavigate();
  const Icon = config.icon;
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "recommended">("newest");
  const [visibleCount, setVisibleCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const articles = useQuery(api.articles.list, { category: slug as any, limit: 60 });

  let sorted = [...(articles || [])];
  if (sortBy === "newest") sorted.sort((a, b) => b.publishedAt - a.publishedAt);
  else if (sortBy === "popular") sorted.sort((a, b) => (b.title.length + b.publishedAt / 1e10) - (a.title.length + a.publishedAt / 1e10));
  else sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.publishedAt - a.publishedAt);

  const heroArticles = sorted.slice(0, 3);
  const topThreeArticles = sorted.slice(3, 6);
  const remainingArticles = sorted.slice(6);
  const hasMore = visibleCount < remainingArticles.length;
  const popularArticles = [...sorted].sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 8);

  const handleLoadMore = () => {
    if (isLoadingMore || visibleCount >= sorted.length) return;
    setIsLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((current) => Math.min(current + 5, sorted.length));
      setIsLoadingMore(false);
    }, 320);
  };

  return (
    <div className="relative min-h-screen bg-background pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">

      {/* ── Immersive header ── */}
      <div
        className="relative"
        style={{
          background: `linear-gradient(160deg, ${config.headerFrom} 0%, ${config.headerTo} 100%)`,
          paddingTop: "calc(4.6rem + env(safe-area-inset-top, 0px))",
          paddingBottom: "5.5rem",
        }}
      >
        <CategoryBackground slug={slug} />
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
        {/* Gradient fade at bottom — bleeds into content */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "12rem",
            background: `linear-gradient(to bottom, transparent, var(--background))`,
          }}
        />

        <div className="relative z-10 px-4">
          {/* Row 1: Back button + Rolka button — right under top bar */}
          <div className="flex items-center justify-between mb-2">
            <motion.button
              type="button"
              onClick={() => nav(-1 as any)}
              whileTap={{ scale: 0.9 }}
              className="flex h-8 items-center gap-1.5 rounded-full px-3 text-white active:scale-90 transition-transform duration-150"
              style={{ background: "rgba(0,0,0,0.30)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(12px)" }}
              aria-label="Wróć"
            >
              <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="text-[10.5px] font-black tracking-wide">Wróć</span>
            </motion.button>

            <CategoryReelButton
              slug={slug}
              title={config.title}
              chipColor={config.chipColor}
              headerFrom={config.headerFrom}
              headerTo={config.headerTo}
              Icon={Icon}
              coverImg={heroArticles[0]?.imageUrl}
            />
          </div>

          {/* Row 2: Icon + Title + subtitle — right under back button */}
          <div className="flex items-center gap-3 mb-1.5">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-[3.2rem] w-[3.2rem] shrink-0 items-center justify-center rounded-[1rem] shadow-lg"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.3)" }}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-black uppercase tracking-[0.28em] text-white/40 mb-0.5">Love Bydgoszcz</p>
              <h1 className="text-[1.75rem] font-black leading-[0.87] tracking-[-0.045em] text-white">
                {config.title}
              </h1>
            </div>
          </div>

          {/* Description */}
          <p className="text-[11px] leading-[1.52] text-white/58 mb-3 max-w-[92%] line-clamp-2">
            {config.description}
          </p>

          {/* Sort buttons — 3 separate italic skewed pills, centered */}
          <div className="flex items-center justify-center gap-1.5">
            {(["newest", "popular", "recommended"] as const).map((s, i) => {
              const isActive = sortBy === s;
              const skews = ["-skew-x-6", "skew-x-0", "skew-x-6"];
              const labels = ["Najnowsze", "Na topie", "Polecane"];
              return (
                <motion.button
                  key={s}
                  type="button"
                  onClick={() => { setSortBy(s); setVisibleCount(5); }}
                  whileTap={{ scale: 0.87 }}
                  className={`h-8 shrink-0 rounded-[0.65rem] px-3.5 text-[10px] font-black italic transition-all duration-200 ${skews[i]}`}
                  style={isActive
                    ? {
                        background: "rgba(255,255,255,0.97)",
                        color: config.headerFrom,
                        boxShadow: `0 6px 20px -6px ${config.headerFrom}90`,
                      }
                    : {
                        background: "rgba(255,255,255,0.11)",
                        color: "rgba(255,255,255,0.78)",
                        border: "1px solid rgba(255,255,255,0.18)",
                      }
                  }
                >
                  {labels[i]}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content — overlaps the gradient fade ── */}
      <div className="relative z-10 -mt-[4.5rem] px-4 space-y-5">
        {!articles ? (
          <div className="pt-[4.5rem]"><SkeletonLoader /></div>
        ) : articles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-[4.5rem] flex flex-col items-center rounded-[2rem] border border-border/30 bg-card px-6 py-16 text-center shadow-sm"
          >
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.4rem] text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${config.headerFrom}, ${config.headerTo})` }}
            >
              <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-[18px] font-black tracking-[-0.03em] text-foreground">Brak publikacji</h3>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              W tej kategorii wkrótce pojawią się nowe materiały.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Hero slider — sits right at the gradient fade boundary */}
            {heroArticles.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <HeroSlider articles={heroArticles} chipColor={config.chipColor} heroGradient={config.heroGradient} config={config} />
              </motion.div>
            )}

            {/* "Więcej z [Kategoria]" — colorful accent header, all 3 cards stacked vertically */}
            {topThreeArticles.length > 0 && (
              <section className="space-y-3">
                {/* Colorful section header with gradient accent background */}
                <div
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-[1.2rem]"
                  style={{ background: `linear-gradient(135deg, ${config.headerFrom}22, ${config.headerTo}14)` }}
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.6rem]"
                    style={{ background: `linear-gradient(135deg, ${config.headerFrom}, ${config.headerTo})` }}
                  >
                    <config.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h2 className="text-[14px] font-black tracking-[-0.02em] text-foreground flex-1">
                    Więcej z <span style={{ color: config.headerFrom }}>{config.title}</span>
                  </h2>
                  <div
                    className="text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 rounded-full text-white"
                    style={{ background: `${config.headerFrom}` }}
                  >
                    Artykuły
                  </div>
                </div>

                {/* All 3 cards — stacked vertically, full width */}
                <div className="space-y-3">
                  {topThreeArticles.map((article, index) => (
                    <EditorialOverlayCard
                      key={article._id}
                      article={article}
                      index={index}
                      accentFrom={config.headerFrom}
                      accentTo={config.headerTo}
                    />
                  ))}
                </div>

                {/* Remaining articles list */}
                {remainingArticles.length > 0 && (
                  <div className="space-y-0 rounded-[1.5rem] border border-border/20 bg-card/80 overflow-hidden">
                    {remainingArticles.slice(0, visibleCount).map((article, index) => (
                      <ArticleListItem
                        key={article._id}
                        article={article}
                        index={index}
                        chipColor={config.chipColor}
                      />
                    ))}

                    {hasMore && (
                      <div className="p-3">
                        <motion.button
                          type="button"
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          whileTap={{ scale: 0.97 }}
                          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[1.2rem] py-3 text-[12.5px] font-black text-white shadow-sm transition disabled:opacity-60"
                          style={{ background: `linear-gradient(135deg, ${config.headerFrom}, ${config.headerTo})` }}
                        >
                          {isLoadingMore ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Ładowanie...</>
                          ) : (
                            <><ChevronRight className="h-4 w-4" /> Załaduj więcej</>
                          )}
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Patronage slider — tight spacing */}
            <section className="pt-1 pb-0 -mt-1">
              <PatronageSlider />
            </section>

            {/* "Najczęściej oglądane" — horizontal scroll, proper overflow */}
            {popularArticles.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-5 w-[3px] rounded-full shrink-0"
                      style={{ background: `linear-gradient(180deg, ${config.headerFrom}, ${config.headerTo})` }}
                    />
                    <h2 className="text-[15px] font-black tracking-[-0.025em] text-foreground">Najczęściej oglądane</h2>
                  </div>
                  <div
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${config.headerFrom}, ${config.headerTo})` }}
                  >
                    <Flame className="h-2.5 w-2.5" /> Top
                  </div>
                </div>

                {/* Overflow container with padding so shadows aren't clipped */}
                <div className="-mx-4 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 px-4 pr-8 pb-4 pt-1">
                    {popularArticles.map((article, i) => (
                      <PopularCard
                        key={article._id}
                        article={article}
                        rank={i}
                        chipColor={config.chipColor}
                        headerFrom={config.headerFrom}
                        headerTo={config.headerTo}
                      />
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Hashtag island */}
            <HashtagIsland
              slug={slug}
              headerFrom={config.headerFrom}
              headerTo={config.headerTo}
            />

            {/* Explore other categories */}
            <ExploreOtherCategories
              currentSlug={slug}
              headerFrom={config.headerFrom}
              headerTo={config.headerTo}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Desktop Category Hero (lifestyle redesign) ───────────────────────────────
function DesktopCategoryHero({
  config,
  slug,
  sortBy,
  setSortBy,
  setCurrentPage,
  nav,
}: {
  config: CategoryConfig;
  slug: string;
  sortBy: string;
  setSortBy: (s: "newest" | "popular" | "recommended") => void;
  setCurrentPage: (p: number) => void;
  nav: ReturnType<typeof useNavigate>;
}) {
  const Icon = config.icon as React.ElementType;
  const bgIcons = config.bgIcons;

  // Per-category lifestyle palette — light pastel / dark rich
  const LIFESTYLE_PALETTE: Record<string, {
    lightBg: string; lightAccent: string; lightText: string; lightSubtext: string; lightBadgeBg: string; lightBadgeText: string;
    darkBg: string; darkAccent: string; darkText: string; darkSubtext: string; darkBadgeBg: string; darkBadgeText: string;
    iconBg: string; iconColor: string; glowColor: string; accentBtn: string;
  }> = {
    miasto: {
      lightBg: "bg-gradient-to-br from-sky-50 via-blue-50/80 to-white",
      lightAccent: "bg-blue-500", lightText: "text-slate-900", lightSubtext: "text-slate-500",
      lightBadgeBg: "bg-blue-100/80", lightBadgeText: "text-blue-700",
      darkBg: "dark:bg-gradient-to-br dark:from-[#0a1628] dark:via-[#0d1f3c] dark:to-[#0a1628]",
      darkAccent: "dark:bg-blue-500", darkText: "dark:text-white", darkSubtext: "dark:text-slate-400",
      darkBadgeBg: "dark:bg-blue-900/50", darkBadgeText: "dark:text-blue-300",
      iconBg: "bg-blue-500", iconColor: "text-white", glowColor: "#3b82f6", accentBtn: "bg-blue-500",
    },
    rozrywka: {
      lightBg: "bg-gradient-to-br from-rose-50 via-pink-50/80 to-white",
      lightAccent: "bg-rose-500", lightText: "text-slate-900", lightSubtext: "text-slate-500",
      lightBadgeBg: "bg-rose-100/80", lightBadgeText: "text-rose-700",
      darkBg: "dark:bg-gradient-to-br dark:from-[#1a0812] dark:via-[#2a0d1e] dark:to-[#1a0812]",
      darkAccent: "dark:bg-rose-500", darkText: "dark:text-white", darkSubtext: "dark:text-slate-400",
      darkBadgeBg: "dark:bg-rose-900/50", darkBadgeText: "dark:text-rose-300",
      iconBg: "bg-rose-500", iconColor: "text-white", glowColor: "#f43f5e", accentBtn: "bg-rose-500",
    },
    kultura: {
      lightBg: "bg-gradient-to-br from-amber-50 via-orange-50/80 to-white",
      lightAccent: "bg-amber-500", lightText: "text-slate-900", lightSubtext: "text-slate-500",
      lightBadgeBg: "bg-amber-100/80", lightBadgeText: "text-amber-700",
      darkBg: "dark:bg-gradient-to-br dark:from-[#1a1000] dark:via-[#2a1a00] dark:to-[#1a1000]",
      darkAccent: "dark:bg-amber-500", darkText: "dark:text-white", darkSubtext: "dark:text-slate-400",
      darkBadgeBg: "dark:bg-amber-900/50", darkBadgeText: "dark:text-amber-300",
      iconBg: "bg-amber-500", iconColor: "text-white", glowColor: "#f59e0b", accentBtn: "bg-amber-500",
    },
    biznes: {
      lightBg: "bg-gradient-to-br from-emerald-50 via-teal-50/80 to-white",
      lightAccent: "bg-emerald-600", lightText: "text-slate-900", lightSubtext: "text-slate-500",
      lightBadgeBg: "bg-emerald-100/80", lightBadgeText: "text-emerald-700",
      darkBg: "dark:bg-gradient-to-br dark:from-[#001a10] dark:via-[#002a18] dark:to-[#001a10]",
      darkAccent: "dark:bg-emerald-500", darkText: "dark:text-white", darkSubtext: "dark:text-slate-400",
      darkBadgeBg: "dark:bg-emerald-900/50", darkBadgeText: "dark:text-emerald-300",
      iconBg: "bg-emerald-600", iconColor: "text-white", glowColor: "#10b981", accentBtn: "bg-emerald-600",
    },
    gastronomia: {
      lightBg: "bg-gradient-to-br from-orange-50 via-amber-50/80 to-white",
      lightAccent: "bg-orange-500", lightText: "text-slate-900", lightSubtext: "text-slate-500",
      lightBadgeBg: "bg-orange-100/80", lightBadgeText: "text-orange-700",
      darkBg: "dark:bg-gradient-to-br dark:from-[#1a0800] dark:via-[#2a1200] dark:to-[#1a0800]",
      darkAccent: "dark:bg-orange-500", darkText: "dark:text-white", darkSubtext: "dark:text-slate-400",
      darkBadgeBg: "dark:bg-orange-900/50", darkBadgeText: "dark:text-orange-300",
      iconBg: "bg-orange-500", iconColor: "text-white", glowColor: "#f97316", accentBtn: "bg-orange-500",
    },
    medyczna: {
      lightBg: "bg-gradient-to-br from-teal-50 via-cyan-50/80 to-white",
      lightAccent: "bg-teal-500", lightText: "text-slate-900", lightSubtext: "text-slate-500",
      lightBadgeBg: "bg-teal-100/80", lightBadgeText: "text-teal-700",
      darkBg: "dark:bg-gradient-to-br dark:from-[#001a18] dark:via-[#002a24] dark:to-[#001a18]",
      darkAccent: "dark:bg-teal-500", darkText: "dark:text-white", darkSubtext: "dark:text-slate-400",
      darkBadgeBg: "dark:bg-teal-900/50", darkBadgeText: "dark:text-teal-300",
      iconBg: "bg-teal-500", iconColor: "text-white", glowColor: "#14b8a6", accentBtn: "bg-teal-500",
    },
    bydgoszczanie: {
      lightBg: "bg-gradient-to-br from-violet-50 via-purple-50/80 to-white",
      lightAccent: "bg-violet-500", lightText: "text-slate-900", lightSubtext: "text-slate-500",
      lightBadgeBg: "bg-violet-100/80", lightBadgeText: "text-violet-700",
      darkBg: "dark:bg-gradient-to-br dark:from-[#0e0018] dark:via-[#180028] dark:to-[#0e0018]",
      darkAccent: "dark:bg-violet-500", darkText: "dark:text-white", darkSubtext: "dark:text-slate-400",
      darkBadgeBg: "dark:bg-violet-900/50", darkBadgeText: "dark:text-violet-300",
      iconBg: "bg-violet-500", iconColor: "text-white", glowColor: "#8b5cf6", accentBtn: "bg-violet-500",
    },
  };

  const pal = LIFESTYLE_PALETTE[slug] ?? LIFESTYLE_PALETTE["miasto"];

  // Floating icon positions
  const floatPositions = [
    { top: "10%", right: "14%", size: "w-12 h-12", dur: 6.5, delay: 0, opacity: 0.12 },
    { top: "35%", right: "5%", size: "w-18 h-18", dur: 8, delay: 1, opacity: 0.09 },
    { top: "60%", right: "20%", size: "w-10 h-10", dur: 7, delay: 0.5, opacity: 0.11 },
    { top: "18%", right: "35%", size: "w-7 h-7", dur: 9, delay: 1.5, opacity: 0.08 },
    { top: "70%", right: "7%", size: "w-11 h-11", dur: 6, delay: 2, opacity: 0.1 },
    { top: "48%", left: "3%", size: "w-9 h-9", dur: 7.5, delay: 0.8, opacity: 0.07 },
  ];

  return (
    <div className="relative">
      {/* Hero band */}
      <div className={`relative overflow-hidden pt-24 pb-16 ${pal.lightBg} ${pal.darkBg}`}>

        {/* Dot grid texture — subtle */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${pal.glowColor}40 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            opacity: 0.4,
          }}
        />

        {/* Glow orb — top right */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full pointer-events-none blur-[130px]"
          style={{ background: `${pal.glowColor}35` }}
        />
        {/* Glow orb — bottom left */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-28 -left-28 w-[400px] h-[400px] rounded-full pointer-events-none blur-[110px]"
          style={{ background: `${pal.glowColor}28` }}
        />

        {/* Floating decorative icons */}
        {floatPositions.map((pos, i) => {
          const FIcon = bgIcons[i % bgIcons.length] as React.ElementType;
          const { size, dur, delay, opacity, ...style } = pos;
          return (
            <motion.div
              key={i}
              animate={{ y: [0, -14, 0], rotate: [0, i % 2 === 0 ? 9 : -9, 0] }}
              transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
              className={`absolute pointer-events-none ${pal.lightText} dark:text-white`}
              style={{ ...style as any, opacity }}
            >
              <FIcon className={size} />
            </motion.div>
          );
        })}

        {/* Main content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button + mood badge row */}
          <div className="flex items-center gap-3 mb-8">
            <motion.button
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => nav(-1)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${pal.lightBadgeBg} ${pal.lightBadgeText} ${pal.darkBadgeBg} ${pal.darkBadgeText} hover:opacity-75`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Powrót
            </motion.button>

            {/* Mood badge — left, next to back button */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] ${pal.lightBadgeBg} ${pal.lightBadgeText} ${pal.darkBadgeBg} ${pal.darkBadgeText}`}
            >
              <motion.span
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className={`inline-block h-1.5 w-1.5 rounded-full ${pal.iconBg}`}
              />
              {config.moodLabel}
            </motion.div>
          </div>

          {/* Centered layout */}
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mb-5"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-[2rem] pointer-events-none"
                  style={{ boxShadow: `0 0 0 12px ${pal.glowColor}18, 0 0 60px 18px ${pal.glowColor}20` }}
                />
                <motion.div
                  animate={{ rotate: [-2, 2, -2], y: [0, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className={`w-20 h-20 rounded-[2rem] ${pal.iconBg} ${pal.iconColor} flex items-center justify-center shadow-2xl`}
                  style={{ boxShadow: `0 20px 60px -12px ${pal.glowColor}55` }}
                >
                  <Icon style={{ width: "2.5rem", height: "2.5rem" }} />
                </motion.div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] ${pal.lightText} ${pal.darkText}`}
            >
              {config.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.26 }}
              className={`mt-2 text-sm sm:text-base leading-relaxed max-w-lg mx-auto ${pal.lightSubtext} ${pal.darkSubtext}`}
            >
              {config.description}
            </motion.p>

            {/* Hashtags row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.34 }}
              className="mt-3 flex items-center justify-center flex-wrap gap-x-2 gap-y-1"
            >
              {config.hashtags.slice(0, 5).map((tag) => (
                <a
                  key={tag}
                  href={`/szukaj?q=${encodeURIComponent(tag)}`}
                  className={`text-[10.5px] font-semibold transition-opacity hover:opacity-100 opacity-70 ${pal.lightSubtext} ${pal.darkSubtext}`}
                >
                  #{tag}
                </a>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Soft bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-8 pointer-events-none bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Filter buttons — straddling the hero/content boundary */}
      <div className="relative z-20 flex justify-center gap-3 -mt-4">
        {(["newest", "popular", "recommended"] as const).map((s, i) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.28 + i * 0.07 }}
            onClick={() => { setSortBy(s); setCurrentPage(1); }}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 shadow-lg border ${
              sortBy === s
                ? `${pal.accentBtn} text-white border-transparent`
                : `bg-card text-foreground border-border hover:bg-muted hover:shadow-md`
            }`}
            style={sortBy === s ? { boxShadow: `0 8px 24px -4px ${pal.glowColor}50` } : {}}
          >
            {s === "newest" ? "Najnowsze" : s === "popular" ? "Popularne" : "Polecane"}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Desktop Category Page ────────────────────────────────────────────────────
export default function CategoryPage() {
  const { slug: rawSlug } = useParams();
  // Normalize slug: nasze-dzialania → nasze_dzialania
  const slug = rawSlug === "nasze-dzialania" ? "nasze_dzialania" : rawSlug;
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "recommended">("popular");
  const articlesPerPage = 15;
  const nav = useNavigate();

  if (!slug || !(slug in categoryConfig)) {
    return <NotFound />;
  }

  const config = categoryConfig[slug as keyof typeof categoryConfig];
  const Icon = config.icon;

  const articles = useQuery(api.articles.list, { category: slug as any, limit: 100 });

  if (isMobile) {
    return <MobileCategoryPage slug={slug} config={config} />;
  }

  let sortedArticles = [...(articles || [])];
  if (sortBy === "newest") sortedArticles.sort((a, b) => b.publishedAt - a.publishedAt);
  else if (sortBy === "popular") sortedArticles.sort((a, b) => (b.title.length * b.publishedAt) - (a.title.length * a.publishedAt));
  else if (sortBy === "recommended") sortedArticles.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const totalPages = Math.ceil(sortedArticles.length / articlesPerPage);
  const currentArticles = sortedArticles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);
  const topArticles = currentArticles.slice(0, 7);
  const gridArticles = currentArticles.slice(7);

  return (
    <div className={`min-h-screen ${config.theme.lightBg}`}>
      <Navbar />

      <main>
        {/* Category Hero */}
        <DesktopCategoryHero
          config={config}
          slug={slug}
          sortBy={sortBy}
          setSortBy={setSortBy}
          setCurrentPage={setCurrentPage}
          nav={nav}
        />

        {/* Articles Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 w-full">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  Publikacje
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white border ${config.theme.border} ${config.theme.primary}`}>
                    {articles?.length || 0}
                  </span>
                </h2>
              </div>

              {!articles ? (
                <div className="flex flex-col gap-8">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-[240px] rounded-3xl bg-white/60 animate-pulse border border-slate-100" />
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                  <Icon className={`w-16 h-16 mx-auto mb-4 opacity-20 ${config.theme.primary}`} />
                  <h3 className="text-2xl font-bold mb-2">Brak publikacji</h3>
                  <p className="text-muted-foreground">W tej kategorii nie ma jeszcze żadnych publikacji.</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex flex-col gap-6 mb-10">
                    {topArticles.map((article, i) => (
                      <motion.div key={article._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                        <ArticleCard article={article} index={i} list />
                      </motion.div>
                    ))}
                  </div>

                  {gridArticles.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                      {gridArticles.map((article, i) => (
                        <motion.div key={article._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="h-full">
                          <ArticleCard article={article} index={i + 7} />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <Pagination className="mt-12 mb-8">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => { e.preventDefault(); if (currentPage > 1) { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === i + 1}
                              onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </div>

            <div className="w-full lg:w-[340px] shrink-0">
              <div className="sticky top-24">
                <SidebarWidgets />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}