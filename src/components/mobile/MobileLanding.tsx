import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router";
import {
  CalendarDays, ChevronRight, Clock, CloudSun, Flame, HeartPulse,
  MapPin, Mail, Music, Newspaper, Palette, PlayCircle, TramFront,
  Users, Building2, TrendingUp, Star, Zap, Heart, Play, ArrowRight,
  Clapperboard,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchHomepageFeed, buildDirectoryHref, buildDirectoryListingHref, getPortalReturnUrl, type HomepageFeedPlace, type HomepageFeedEvent } from "@/lib/homepage-feed";
import StoryViewer from "@/components/StoryViewer";
import { getArticleHref } from "@/lib/articleRouting";
import { useResolvedArticles } from "@/hooks/use-resolved-articles";
import { apiFetch } from "@/lib/api-client";
import { fetchEvents } from "@/lib/events-api";
import { fetchUpdates } from "@/lib/updates-api";
import { fetchArticles } from "@/lib/articles-api";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "all",           label: "Dla Ciebie",   dot: "bg-primary",      icon: Star,        href: null,              from: "#6366f1", to: "#8b5cf6" },
  { key: "miasto",        label: "Miasto",        dot: "bg-blue-500",     icon: Building2,   href: "/miasto",         from: "#2563eb", to: "#0891b2" },
  { key: "rozrywka",      label: "Rozrywka",      dot: "bg-rose-500",     icon: Music,       href: "/rozrywka",       from: "#e11d48", to: "#db2777" },
  { key: "kultura",       label: "Kultura",       dot: "bg-amber-500",    icon: Palette,     href: "/kultura",        from: "#d97706", to: "#ea580c" },
  { key: "medyczna",      label: "Medycyna",      dot: "bg-teal-500",     icon: HeartPulse,  href: "/medyczna",       from: "#0d9488", to: "#0891b2" },
  { key: "bydgoszczanie", label: "Bydgoszczanie", dot: "bg-violet-500",   icon: Users,       href: "/bydgoszczanie",  from: "#7c3aed", to: "#9333ea" },
  { key: "biznes",        label: "Biznes",        dot: "bg-emerald-500",  icon: TrendingUp,  href: "/biznes",         from: "#059669", to: "#0d9488" },
  { key: "gastronomia",   label: "Gastro",        dot: "bg-orange-500",   icon: Flame,       href: "/gastronomia",    from: "#ea580c", to: "#dc2626" },
  { key: "sport",         label: "Sport",         dot: "bg-blue-600",     icon: PlayCircle,  href: "/sport",          from: "#2563eb", to: "#4f46e5" },
  { key: "polityka",      label: "Polityka",      dot: "bg-slate-700",    icon: Newspaper,   href: "/polityka",       from: "#475569", to: "#0f172a" },
  { key: "inwestycje",    label: "Inwest.",       dot: "bg-amber-500",    icon: TrendingUp,  href: "/inwestycje",     from: "#d97706", to: "#f59e0b" },
  { key: "nasze_dzialania", label: "Działania",   dot: "bg-pink-600",     icon: Heart,       href: "/nasze-dzialania", from: "#e11d48", to: "#db2777" },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

const CAT_LABEL: Record<string, string> = {
  miasto: "Miasto", rozrywka: "Rozrywka", kultura: "Kultura",
  biznes: "Biznes", gastronomia: "Gastro", bydgoszczanie: "Bydgoszczanie",
  medyczna: "Medycyna", sport: "Sport", polityka: "Polityka", inwestycje: "Inwestycje", nasze_dzialania: "Nasze Działania",
};
const CAT_COLOR: Record<string, string> = {
  miasto: "bg-blue-500", rozrywka: "bg-rose-500", kultura: "bg-amber-500",
  biznes: "bg-emerald-500", gastronomia: "bg-orange-500",
  bydgoszczanie: "bg-violet-500", medyczna: "bg-teal-500", sport: "bg-blue-600", polityka: "bg-slate-700", inwestycje: "bg-amber-500", nasze_dzialania: "bg-pink-600",
};
const CAT_FROM: Record<string, string> = {
  miasto: "#2563eb", rozrywka: "#e11d48", kultura: "#d97706",
  biznes: "#059669", gastronomia: "#ea580c", bydgoszczanie: "#7c3aed", medyczna: "#0d9488", sport: "#2563eb", polityka: "#475569", inwestycje: "#d97706", nasze_dzialania: "#e11d48",
};
const CAT_TO: Record<string, string> = {
  miasto: "#0891b2", rozrywka: "#db2777", kultura: "#ea580c",
  biznes: "#0d9488", gastronomia: "#dc2626", bydgoszczanie: "#9333ea", medyczna: "#0891b2", sport: "#4f46e5", polityka: "#0f172a", inwestycje: "#f59e0b", nasze_dzialania: "#db2777",
};
const CAT_GRADIENT_TOP: Record<string, string> = {
  miasto: "from-blue-900/85 via-blue-900/40 to-transparent",
  rozrywka: "from-rose-900/85 via-rose-900/40 to-transparent",
  kultura: "from-amber-900/85 via-amber-900/40 to-transparent",
  biznes: "from-emerald-900/85 via-emerald-900/40 to-transparent",
  gastronomia: "from-orange-900/85 via-orange-900/40 to-transparent",
  bydgoszczanie: "from-violet-900/85 via-violet-900/40 to-transparent",
  medyczna: "from-teal-900/85 via-teal-900/40 to-transparent",
  sport: "from-blue-900/85 via-indigo-900/40 to-transparent",
  polityka: "from-slate-900/85 via-slate-900/40 to-transparent",
  inwestycje: "from-amber-900/85 via-orange-900/40 to-transparent",
  nasze_dzialania: "from-rose-900/85 via-pink-900/40 to-transparent",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function articleHref(a: { slug?: string; _id: string; title: string }) { return getArticleHref(a); }

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

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

function formatEventDate(ts: number) {
  return new Date(ts).toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}

function getDaysUntil(ts: number) {
  const diff = ts - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days === 0) return "Dziś";
  if (days === 1) return "Jutro";
  if (days <= 7) return `Za ${days} dni`;
  return null;
}

function getPlaceCategoryTone(category?: string) {
  const tones: Record<string, { color: string }> = {
    Kultura: { color: "from-purple-500 to-violet-600" },
    Muzea: { color: "from-indigo-500 to-blue-600" },
    Gastronomia: { color: "from-orange-500 to-amber-600" },
    Rozrywka: { color: "from-pink-500 to-rose-600" },
    Sport: { color: "from-green-500 to-emerald-600" },
    Edukacja: { color: "from-blue-500 to-cyan-600" },
    Kawiarnie: { color: "from-amber-500 to-yellow-600" },
    Parki: { color: "from-teal-500 to-green-600" },
  };
  return tones[category || ""] ?? { color: "from-slate-500 to-slate-700" };
}

const toTimestamp = (value?: string | number | null) => {
  if (typeof value === "number") return value;
  if (!value) return Date.now();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() : parsed;
};

const normalizeStory = (story: any) => ({
  _id: String(story?.id ?? story?._id ?? ""),
  title: story?.title ?? "",
  author: story?.author ?? "",
  coverImage: story?.coverImage ?? story?.cover_image ?? "",
  items: Array.isArray(story?.items) ? story.items : [],
});

const normalizeStoriesPayload = (payload: any) => {
  const data = payload?.data ?? payload?.stories ?? payload?.results ?? payload ?? [];
  return Array.isArray(data) ? data.map(normalizeStory) : [];
};

const normalizeUpdate = (update: any) => ({
  _id: String(update?.id ?? update?._id ?? ""),
  title: update?.title ?? "",
  category: update?.category ?? null,
  location: update?.location ?? null,
  publishedAt: toTimestamp(update?.publishedAt ?? update?.published_at ?? update?.created_at),
});

const normalizeUpdatesPayload = (payload: any) => {
  const data = payload?.data ?? payload?.updates ?? payload?.results ?? payload ?? [];
  return Array.isArray(data) ? data.map(normalizeUpdate) : [];
};

const normalizeEvent = (event: any) => ({
  _id: String(event?.id ?? event?._id ?? ""),
  title: event?.title ?? "",
  description: event?.description ?? "",
  category: event?.category ?? "",
  imageUrl: event?.imageUrl ?? event?.image_url ?? null,
  location: event?.location ?? "",
  startDate: toTimestamp(event?.startDate ?? event?.start_date),
  endDate: event?.endDate ?? event?.end_date ?? null,
  price: event?.price ?? null,
  organizer: event?.organizer ?? null,
});

const normalizeEventsPayload = (payload: any) => {
  const data = payload?.data ?? payload?.events ?? payload?.results ?? payload ?? [];
  return Array.isArray(data) ? data.map(normalizeEvent) : [];
};

const normalizeAuthor = (author: any) => ({
  name: author?.name ?? author?.full_name ?? "",
  image: author?.image ?? author?.image_url ?? author?.avatar_url ?? null,
});

const normalizeAuthorsPayload = (payload: any) => {
  const data = payload?.data ?? payload?.authors ?? payload?.results ?? payload ?? [];
  return Array.isArray(data) ? data.map(normalizeAuthor) : [];
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[0.6rem] bg-muted/60 ${className ?? ""}`}
    />
  );
}

// ─── Section Head ─────────────────────────────────────────────────────────────

function SectionHead({ title, href, icon: Icon, accentFrom, accentTo }: {
  title: string; href: string; icon: React.ElementType; accentFrom?: string; accentTo?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-[0.45rem]"
          style={accentFrom ? { background: `linear-gradient(135deg, ${accentFrom}, ${accentTo || accentFrom})` } : { background: "hsl(var(--primary)/0.12)" }}
        >
          <Icon className="h-3 w-3" style={accentFrom ? { color: "white" } : { color: "hsl(var(--primary))" }} />
        </div>
        <span className="text-[13px] font-black tracking-[-0.01em] text-foreground">{title}</span>
      </div>
      <Link to={href} className="flex items-center gap-0.5 text-[10px] font-bold text-primary/55 active:scale-95 transition-transform duration-150">
        Więcej <ChevronRight className="h-2.5 w-2.5" />
      </Link>
    </div>
  );
}

// ─── Mobile Stories Section ───────────────────────────────────────────────────

function MobileStoriesSection() {
  const [stories, setStories] = useState<any[] | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const loadStories = async () => {
      try {
        const payload = await apiFetch("/stories?active=1");
        if (!active) return;
        setStories(normalizeStoriesPayload(payload));
      } catch (error) {
        if (!active) return;
        setStories([]);
        toast.warning("Relacje są chwilowo niedostępne.");
      }
    };

    loadStories();
    return () => {
      active = false;
    };
  }, []);

  // Loading skeleton
  if (stories === null) {
    return (
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-0.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 shrink-0">
            <Skeleton className="h-[3rem] w-[3rem] rounded-full" />
            <Skeleton className="h-2 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-0.5">
        {stories.map((story, index) => (
          <motion.button
            key={story._id}
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.24, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setActiveStoryIndex(index)}
            className="flex flex-col items-center gap-1 shrink-0 active:scale-95 transition-transform duration-150"
          >
            <div className="relative h-[3rem] w-[3rem]">
              <div className="absolute inset-0 rounded-full p-[2px]" style={{ background: "linear-gradient(135deg, #f43f5e, #a855f7, #f59e0b)" }}>
                <div className="h-full w-full rounded-full border-[2px] border-background overflow-hidden bg-muted">
                  <img src={story.coverImage} alt={story.title} className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background bg-rose-500" />
            </div>
            <p className="w-[3rem] truncate text-center text-[7.5px] font-semibold text-foreground/50">{story.author}</p>
          </motion.button>
        ))}
      </div>
      {activeStoryIndex !== null && (
        <StoryViewer stories={stories} initialStoryIndex={activeStoryIndex} onClose={() => setActiveStoryIndex(null)} />
      )}
    </>
  );
}

// ─── Hero Carousel ────────────────────────────────────────────────────────────

function HeroCarousel({ articles }: { articles: any[] }) {
  const nav = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = Math.min(articles.length, 4);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count < 2) return;
    timerRef.current = setInterval(() => { setDirection(1); setCurrent((c) => (c + 1) % count); }, 5000);
  }, [count]);

  useEffect(() => {
    if (count === 0) { setCurrent(0); return; }
    setCurrent((prev) => (prev >= count ? 0 : prev));
  }, [count]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const goTo = useCallback((idx: number, dir: 1 | -1) => {
    if (count < 2) return;
    setDirection(dir);
    setCurrent(((idx % count) + count) % count);
    startTimer();
  }, [count, startTimer]);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragCurrentX.current = e.touches[0].clientX;
    setIsDragging(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    dragCurrentX.current = e.touches[0].clientX;
    if (Math.abs(dragCurrentX.current - dragStartX.current) > 8) setIsDragging(true);
  };
  const handleTouchEnd = () => {
    const dx = dragCurrentX.current - dragStartX.current;
    if (Math.abs(dx) > 44 && count > 1) {
      if (dx < 0) goTo(current + 1, 1); else goTo(current - 1, -1);
      requestAnimationFrame(() => setIsDragging(false));
      return;
    }
    startTimer();
    requestAnimationFrame(() => setIsDragging(false));
  };

  if (articles.length === 0) return null;

  const article = articles[current];
  const img = article.imageUrl || "/assets/logo-lovebydgoszcz.png";
  const catColor = CAT_COLOR[article.category] || "bg-primary";
  const catLabel = CAT_LABEL[article.category] || article.category;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "105%" : "-105%", scale: 0.94, opacity: 0.7 }),
    center: { x: 0, scale: 1, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-105%" : "105%", scale: 0.94, opacity: 0.7 }),
  };

  return (
    // paddingBottom gives room for dots that translateY(50%) out of the slider
    <div className="relative" style={{ paddingBottom: "0.625rem" }}>
      <div
        className="relative h-[23rem] w-full overflow-hidden rounded-[1.75rem]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence custom={direction} mode="popLayout" initial={false}>
          <motion.div
            key={`${article._id}-${current}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.36, ease: [0.22, 0.68, 0.36, 1] }}
            className="absolute inset-0 overflow-hidden rounded-[1.75rem] shadow-[0_10px_36px_-12px_rgba(0,0,0,0.38)]"
          >
            <button
              type="button"
              onClick={() => { if (!isDragging) nav(articleHref(article)); }}
              className="relative block h-full w-full text-left"
            >
              <img src={img} alt={article.title} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.04)_22%,rgba(0,0,0,0.48)_55%,rgba(0,0,0,0.92)_83%,rgba(0,0,0,0.98)_100%)]" />
              {/* Category badge */}
              <div className="absolute left-3.5 top-3.5">
                <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-md ${catColor}`}>
                  {catLabel}
                </span>
              </div>
              {/* Bottom content */}
              <div className="absolute inset-x-0 bottom-0 px-4 pb-5">
                <h2 className="line-clamp-2 text-[1.25rem] font-black leading-[1.18] tracking-[-0.02em] text-white drop-shadow-sm">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="mt-0.5 line-clamp-1 text-[10.5px] font-medium leading-relaxed text-white/58">
                    {article.excerpt}
                  </p>
                )}
                <div className="mt-2.5 flex items-center justify-between">
                  {article.author ? (
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full border border-white/30 bg-white/20">
                        {article.authorImage ? (
                          <img src={article.authorImage} alt={article.author} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[7px] font-black text-white/80">
                            {article.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="block text-[9.5px] font-semibold text-white/80 leading-none">{article.author}</span>
                        <span className="block text-[8px] font-medium text-white/45 mt-0.5">{timeAgo(article.publishedAt)}</span>
                      </div>
                    </div>
                  ) : <span />}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); nav(articleHref(article)); }}
                    className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[9.5px] font-black text-slate-900 shadow-lg active:scale-95 transition-transform duration-150"
                  >
                    <PlayCircle className="h-2.5 w-2.5 text-primary" />
                    Czytaj
                  </button>
                </div>
              </div>
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Pagination dots — translateY(50%) = half inside slider, half outside */}
        {count > 1 && (
          <div
            className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-1.5"
            style={{ transform: "translateY(50%)" }}
          >
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i, i > current ? 1 : -1)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "h-[0.4rem] w-5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.55)]"
                    : "h-[0.4rem] w-[0.4rem] bg-white/50 shadow-[0_1px_4px_rgba(0,0,0,0.35)]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Hero Skeleton ────────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="relative h-[23rem] w-full rounded-[1.75rem] overflow-hidden">
      <Skeleton className="h-full w-full rounded-[1.75rem]" />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-5 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
    </div>
  );
}

// ─── Large Article Card ───────────────────────────────────────────────────────

function LargeArticleCard({ article, index }: { article: any; index: number }) {
  const nav = useNavigate();
  const img = article.imageUrl || "/assets/logo-lovebydgoszcz.png";
  const catColor = CAT_COLOR[article.category] || "bg-primary";
  const catLabel = CAT_LABEL[article.category] || article.category;
  const topGradient = CAT_GRADIENT_TOP[article.category] || "from-slate-900/80 via-slate-900/30 to-transparent";

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay: index * 0.05 }}
      onClick={() => nav(articleHref(article))}
      className="relative block h-[11rem] w-full overflow-hidden rounded-[1.4rem] text-left active:scale-[0.985] transition-transform duration-150 shadow-[0_5px_20px_-8px_rgba(0,0,0,0.28)]"
    >
      <img src={img} alt={article.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className={`absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b ${topGradient}`} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_32%,rgba(0,0,0,0.7)_72%,rgba(0,0,0,0.92)_100%)]" />
      <div className="absolute inset-x-0 top-0 px-3 pt-2.5">
        <h3 className="line-clamp-2 text-[14px] font-black leading-tight tracking-[-0.01em] text-white drop-shadow-sm">{article.title}</h3>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-2.5">
        <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.15em] text-white shadow-sm ${catColor}`}>{catLabel}</span>
        <span className="flex items-center gap-1 text-[9px] font-medium text-white/55">
          <Clock className="h-2 w-2" />
          {timeAgo(article.publishedAt)}
        </span>
      </div>
    </motion.button>
  );
}

// ─── List Card ────────────────────────────────────────────────────────────────

function ListCard({ article, index }: { article: any; index: number }) {
  const nav = useNavigate();
  const img = article.imageUrl || "/assets/logo-lovebydgoszcz.png";
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.03 }}
      onClick={() => nav(articleHref(article))}
      className="flex w-full items-start gap-3 py-2.5 px-3 text-left active:bg-muted/30 transition-colors duration-150"
    >
      <div className="h-[3.6rem] w-[3.6rem] shrink-0 overflow-hidden rounded-[0.75rem] shadow-sm">
        <img src={img} alt={article.title} className="h-full w-full object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
        <h3 className="line-clamp-2 text-[12px] font-bold leading-snug tracking-[-0.01em] text-foreground">{article.title}</h3>
        <div className="flex items-center gap-1.5 text-[9px] text-foreground/40">
          <Clock className="h-2 w-2 shrink-0" />
          <span>{timeAgo(article.publishedAt)}</span>
          {article.author && <><span className="opacity-40">·</span><span className="truncate">{article.author}</span></>}
        </div>
      </div>
    </motion.button>
  );
}

// ─── Mobile Event Card ────────────────────────────────────────────────────────

function MobileEventCard({ event, index }: { event: any; index: number }) {
  const nav = useNavigate();
  const [fav, setFav] = useState(false);
  const daysUntil = getDaysUntil(event.startDate);
  const dateStr = event.endDate
    ? `${formatEventDate(event.startDate)} – ${formatEventDate(event.endDate)}`
    : formatEventDate(event.startDate);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.26, delay: index * 0.055 }}
      onClick={() => nav(`/wydarzenia/${event._id}`)}
      className="relative w-[calc(62vw)] max-w-[13rem] shrink-0 overflow-hidden rounded-[1.4rem] border border-border/25 bg-card shadow-[0_6px_20px_-6px_rgba(0,0,0,0.16)] active:scale-[0.97] transition-transform duration-150 text-left"
    >
      {event.imageUrl ? (
        <div className="relative h-[8rem] overflow-hidden">
          <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          {daysUntil && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-rose-500 px-2 py-0.5 text-[8.5px] font-black text-white shadow-sm">{daysUntil}</span>
          )}
        </div>
      ) : (
        <div className="h-[8rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <CalendarDays className="h-9 w-9 text-primary/30" />
        </div>
      )}
      <div className="p-2.5">
        <h3 className="line-clamp-2 text-[12px] font-black leading-snug text-foreground">{event.title}</h3>
        <div className="mt-1.5 space-y-0.5">
          <div className="flex items-center gap-1.5 text-[9.5px] text-foreground/50">
            <CalendarDays className="h-2.5 w-2.5 shrink-0 text-primary" />
            <span>{dateStr}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 text-[9.5px] text-foreground/50">
              <MapPin className="h-2.5 w-2.5 shrink-0 text-primary" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          {event.price ? (
            <span className="text-[9.5px] font-bold text-primary">{event.price}</span>
          ) : (
            <span className="text-[9.5px] font-bold text-emerald-600">Bezpłatne</span>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setFav(v => !v); }}
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${fav ? "bg-rose-500 text-white" : "bg-muted text-foreground/35"}`}
          >
            <Heart className={`h-3 w-3 ${fav ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Live Update Row ──────────────────────────────────────────────────────────

function LiveRow({ update, last }: { update: any; last: boolean }) {
  const nav = useNavigate();
  const catFrom = CAT_FROM[update.category] || "#6366f1";
  const catTo = CAT_TO[update.category] || "#8b5cf6";
  return (
    <button
      type="button"
      onClick={() => nav("/aktualizacje")}
      className={`flex w-full items-start gap-2.5 text-left px-3 py-2 active:bg-muted/25 transition-colors duration-150 ${!last ? "border-b border-border/15" : ""}`}
    >
      {/* Time + dot column */}
      <div className="flex flex-col items-center shrink-0 w-8 pt-0.5">
        <span className="text-[8.5px] font-black tabular-nums leading-none" style={{ color: catFrom }}>{fmtTime(update.publishedAt)}</span>
        <div className="mt-1 h-2 w-2 rounded-full" style={{ background: `linear-gradient(135deg, ${catFrom}, ${catTo})` }} />
        {!last && <div className="mt-0.5 w-px flex-1 min-h-[1rem]" style={{ background: `linear-gradient(180deg, ${catFrom}44, transparent)` }} />}
      </div>
      <div className="flex-1 min-w-0">
        {update.category && (
          <span
            className="inline-block rounded-full px-1.5 py-0.5 text-[7.5px] font-bold text-white mb-0.5"
            style={{ background: `linear-gradient(135deg, ${catFrom}, ${catTo})` }}
          >
            {CAT_LABEL[update.category] || update.category}
          </span>
        )}
        <p className="text-[12px] font-bold leading-snug text-foreground line-clamp-2">{update.title}</p>
        {update.location && (
          <div className="mt-0.5 flex items-center gap-1 text-[8.5px] text-foreground/40">
            <MapPin className="h-2 w-2 shrink-0" />
            <span className="truncate">{update.location}</span>
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Most Read Section ────────────────────────────────────────────────────────

function MostReadSection({ articles }: { articles: any[] }) {
  const nav = useNavigate();
  if (articles.length === 0) return null;

  return (
    // overflow: visible on section so card shadows bleed into next section
    <section style={{ overflow: "visible" }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-[0.45rem]" style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
          <Flame className="h-3 w-3 text-white" />
        </div>
        <span className="text-[13px] font-black tracking-[-0.01em] text-foreground">Najczęściej czytane</span>
      </div>
      {/* overflowX: auto, overflowY: visible — critical for shadow rendering */}
      <div
        className="-mx-4 scrollbar-hide"
        style={{ overflowX: "auto", overflowY: "visible", paddingBottom: "0.75rem" }}
      >
        <div className="flex gap-2.5 px-4 pr-8 pt-0.5" style={{ paddingBottom: "0.5rem" }}>
          {articles.slice(0, 8).map((article, i) => {
            const img = article.imageUrl || "/assets/logo-lovebydgoszcz.png";
            const catFrom = CAT_FROM[article.category] || "#6366f1";
            const catTo = CAT_TO[article.category] || "#8b5cf6";
            return (
              <motion.button
                key={article._id}
                type="button"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.26, delay: i * 0.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => nav(articleHref(article))}
                className="relative w-[9.5rem] shrink-0 rounded-[1.4rem] active:scale-[0.97] transition-transform duration-150"
                style={{ boxShadow: "0 12px 32px -8px rgba(0,0,0,0.4)" }}
              >
                <div className="relative h-[8.5rem] w-full overflow-hidden rounded-[1.4rem]">
                  <img src={img} alt={article.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.12)_30%,rgba(0,0,0,0.88)_100%)]" />
                  <div
                    className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${catFrom}, ${catTo})` }}
                  >
                    {i + 1}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2">
                    <h4 className="line-clamp-2 text-[11px] font-black leading-[1.2] tracking-[-0.02em] text-white">
                      {article.title}
                    </h4>
                    <div className="mt-0.5 flex items-center gap-1 text-[8px] text-white/50">
                      <Clock className="h-1.5 w-1.5 shrink-0" />
                      <span>{timeAgo(article.publishedAt)}</span>
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

// ─── Mobile Places Section ────────────────────────────────────────────────────

function MobilePlacesSection() {
  const [places, setPlaces] = useState<HomepageFeedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingHref, setListingHref] = useState<string | null>(null);

  useEffect(() => {
    const portalUrl = getPortalReturnUrl();
    setListingHref(buildDirectoryListingHref("miejsca", portalUrl));
    fetchHomepageFeed()
      .then(feed => setPlaces(feed.featuredPlaces.slice(0, 6)))
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && places.length === 0) return null;

  return (
    <section style={{ overflow: "visible" }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-[0.45rem]" style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
            <MapPin className="h-3 w-3 text-white" />
          </div>
          <span className="text-[13px] font-black tracking-[-0.01em] text-foreground">Polecane miejsca</span>
        </div>
        {listingHref && (
          <a href={listingHref} className="flex items-center gap-0.5 text-[10px] font-bold text-primary/55 active:scale-95 transition-transform duration-150">
            Więcej <ChevronRight className="h-2.5 w-2.5" />
          </a>
        )}
      </div>

      {loading ? (
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[10rem] w-[calc(78vw)] max-w-[17rem] shrink-0 rounded-[1.4rem]" />
          ))}
        </div>
      ) : (
        <div
          className="flex gap-2.5 scrollbar-hide -mx-4 px-4"
          style={{ overflowX: "auto", overflowY: "visible", paddingBottom: "0.75rem" }}
        >
          {places.map((place, i) => {
            const href = buildDirectoryHref("miejsca", place.slug, getPortalReturnUrl());
            const img = place.coverImage || place.imageUrl;
            const tone = getPlaceCategoryTone(place.category);
            const CardTag = href ? "a" : "div";
            return (
              <motion.div
                key={place._id}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: i * 0.055 }}
                className="relative h-[10rem] w-[calc(78vw)] max-w-[17rem] shrink-0 overflow-hidden rounded-[1.4rem] active:scale-[0.97] transition-transform duration-150"
                style={{ boxShadow: "0 8px 24px -6px rgba(0,0,0,0.28)" }}
              >
                <CardTag {...(href ? { href } : {})} className="block h-full w-full">
                  {img ? (
                    <img src={img} alt={place.brandName || place.name} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${tone.color}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />
                  <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col items-center text-center">
                    {place.category && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-bold text-white/80 mb-1">
                        <MapPin className="h-2 w-2 shrink-0" />
                        {place.category}
                      </span>
                    )}
                    <h4 className="line-clamp-1 text-[13px] font-black text-white leading-tight w-full text-center">{place.brandName || place.name}</h4>
                    {place.address && (
                      <div className="mt-0.5 flex items-center justify-center gap-1 text-[9px] text-white/55">
                        <MapPin className="h-2 w-2 shrink-0" />
                        <span className="truncate">{place.address}</span>
                      </div>
                    )}
                  </div>
                </CardTag>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Mobile Directory Events Section ─────────────────────────────────────────

function MobileDirectoryEventsSection() {
  const [events, setEvents] = useState<HomepageFeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingHref, setListingHref] = useState<string | null>(null);

  useEffect(() => {
    const portalUrl = getPortalReturnUrl();
    setListingHref(buildDirectoryListingHref("wydarzenia", portalUrl));
    fetchHomepageFeed()
      .then(feed => setEvents(feed.featuredEvents.slice(0, 5)))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && events.length === 0) return null;

  function formatEventDateShort(value?: string) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
  }

  function formatEventTime(value?: string) {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  }

  function getDaysRemaining(value?: string) {
    if (!value) return null;
    const today = new Date();
    const eventDate = new Date(value);
    if (isNaN(eventDate.getTime())) return null;
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <section style={{ overflow: "visible" }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-[0.45rem]" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <CalendarDays className="h-3 w-3 text-white" />
          </div>
          <span className="text-[13px] font-black tracking-[-0.01em] text-foreground">Najbliższe wydarzenia</span>
        </div>
        {listingHref && (
          <a href={listingHref} className="flex items-center gap-0.5 text-[10px] font-bold text-primary/55 active:scale-95 transition-transform duration-150">
            Więcej <ChevronRight className="h-2.5 w-2.5" />
          </a>
        )}
      </div>

      {loading ? (
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[12rem] w-[calc(70vw)] max-w-[14rem] shrink-0 rounded-[1.4rem]" />
          ))}
        </div>
      ) : (
        <div
          className="flex gap-2.5 scrollbar-hide -mx-4 px-4"
          style={{ overflowX: "auto", overflowY: "visible", paddingBottom: "0.75rem" }}
        >
          {events.map((event, i) => {
            const href = buildDirectoryHref("wydarzenia", event.slug, getPortalReturnUrl());
            const img = event.imageUrl;
            const daysRemaining = getDaysRemaining(event.startDate);
            const isSoon = typeof daysRemaining === "number" && daysRemaining >= 0 && daysRemaining <= 7;
            const CardTag = href ? "a" : "div";
            const monthStr = event.startDate
              ? new Date(event.startDate).toLocaleDateString("pl-PL", { month: "short" }).replace(".", "").toUpperCase()
              : "—";
            const dayStr = event.startDate
              ? new Date(event.startDate).toLocaleDateString("pl-PL", { day: "2-digit" })
              : "--";
            const timeStr = formatEventTime(event.startDate);
            const soonLabel = daysRemaining === 0 ? "Dziś" : daysRemaining === 1 ? "Jutro" : `Za ${daysRemaining} dni`;

            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: i * 0.055 }}
                className="relative w-[calc(70vw)] max-w-[14rem] shrink-0 overflow-hidden rounded-[1.4rem] border border-border/25 bg-card active:scale-[0.97] transition-transform duration-150"
                style={{ boxShadow: "0 8px 24px -6px rgba(0,0,0,0.18)" }}
              >
                <CardTag {...(href ? { href } : {})} className="block">
                  <div className="relative h-[7.5rem] overflow-hidden">
                    {img ? (
                      <img src={img} alt={event.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <CalendarDays className="h-9 w-9 text-primary/25" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute left-2.5 bottom-2.5 flex flex-col items-center overflow-hidden rounded-[0.6rem] border border-white/20 shadow-md min-w-[2.2rem]">
                      <div className="bg-primary px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.06em] text-primary-foreground w-full text-center">{monthStr}</div>
                      <div className="bg-white/95 px-1.5 py-0.5 text-[1rem] font-black leading-none text-slate-900 w-full text-center">{dayStr}</div>
                    </div>
                    {isSoon && (
                      <span className="absolute right-2.5 top-2.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[8px] font-black text-white shadow-sm">{soonLabel}</span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h4 className="line-clamp-2 text-[12px] font-black leading-snug text-foreground">{event.title}</h4>
                    {(event.location || timeStr) && (
                      <div className="mt-2 pt-2 border-t border-border/40 space-y-0.5">
                        {event.location && (
                          <div className="flex items-center gap-1.5 text-[9px] text-foreground/50">
                            <MapPin className="h-2.5 w-2.5 shrink-0 text-primary" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                        {timeStr && (
                          <div className="flex items-center gap-1.5 text-[9px] text-foreground/50">
                            <Clock className="h-2.5 w-2.5 shrink-0 text-primary" />
                            <span>{timeStr}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardTag>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Category Explorer ────────────────────────────────────────────────────────

function CategoryExplorer({ articles }: { articles: any[] }) {
  const nav = useNavigate();
  const cats = CATEGORIES.filter(c => c.key !== "all");
  const featuredCats = cats.slice(0, 2);
  const gridCats = cats.slice(2);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-[3px] rounded-full" style={{ background: "linear-gradient(180deg, #6366f1, #8b5cf6)" }} />
          <span className="text-[13px] font-black tracking-[-0.01em] text-foreground">Odkryj kategorie</span>
        </div>
        <span className="text-[9px] font-semibold text-foreground/30 italic">wszystkie tematy →</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {featuredCats.map((cat, i) => {
          const Icon = cat.icon;
          const catArticle = articles.find(a => a.category === cat.key);
          const img = catArticle?.imageUrl;
          return (
            <motion.button
              key={cat.key}
              type="button"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.94 }}
              onClick={() => nav(cat.href!)}
              className="relative overflow-hidden rounded-[1.4rem] h-[8.5rem] text-left shadow-[0_8px_24px_-10px_rgba(0,0,0,0.32)]"
              style={{ background: `linear-gradient(145deg, ${cat.from}, ${cat.to})` }}
            >
              {img && <img src={img} alt={cat.label} className="absolute inset-0 h-full w-full object-cover opacity-22" />}
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,transparent_50%)]" />
              <div className="absolute -bottom-3 -right-3 opacity-[0.13]">
                <Icon className="h-16 w-16 text-white" />
              </div>
              <div className="relative z-10 flex h-full flex-col justify-between p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[0.6rem]" style={{ background: "rgba(255,255,255,0.22)" }}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="block text-[13px] font-black text-white leading-tight mb-0.5">{cat.label}</span>
                  <div className="flex items-center gap-0.5 text-[7.5px] font-bold text-white/55 uppercase tracking-wider">
                    Czytaj więcej <ChevronRight className="h-1.5 w-1.5" />
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {gridCats.map((cat, i) => {
          const Icon = cat.icon;
          const catArticle = articles.find(a => a.category === cat.key);
          const img = catArticle?.imageUrl;
          return (
            <motion.button
              key={cat.key}
              type="button"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.26, delay: 0.1 + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.93 }}
              onClick={() => nav(cat.href!)}
              className="relative overflow-hidden rounded-[1.1rem] h-[5.5rem] text-left shadow-[0_5px_16px_-6px_rgba(0,0,0,0.28)]"
              style={{ background: `linear-gradient(145deg, ${cat.from}, ${cat.to})` }}
            >
              {img && <img src={img} alt={cat.label} className="absolute inset-0 h-full w-full object-cover opacity-18" />}
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.11)_0%,transparent_55%)]" />
              <div className="absolute -bottom-2 -right-2 opacity-[0.13]">
                <Icon className="h-10 w-10 text-white" />
              </div>
              <div className="relative z-10 flex h-full flex-col justify-between p-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-[0.45rem]" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <span className="block text-[10.5px] font-black text-white leading-tight">{cat.label}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

// ─── Katalog Section ──────────────────────────────────────────────────────────

function KatalogSection() {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1.5">
        <div className="h-4 w-[3px] rounded-full" style={{ background: "linear-gradient(180deg, #059669, #0d9488)" }} />
        <span className="text-[13px] font-black tracking-[-0.01em] text-foreground">Katalog Bydgoski</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { href: "https://katalog.lovebydgoszcz.pl/wydarzenia", icon: CalendarDays, label: "Wydarzenia", from: "#6366f1", to: "#8b5cf6" },
          { href: "https://katalog.lovebydgoszcz.pl/miejsca", icon: MapPin, label: "Miejsca", from: "#059669", to: "#0d9488" },
          { href: "https://katalog.lovebydgoszcz.pl/firmy", icon: Building2, label: "Baza Firm", from: "#2563eb", to: "#0891b2" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.a
              key={item.href}
              href={item.href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, delay: i * 0.055 }}
              className="relative flex flex-col items-center gap-1.5 overflow-hidden rounded-[1.1rem] py-3 px-2 active:scale-[0.96] transition-transform duration-150 text-center"
              style={{ background: `linear-gradient(145deg, ${item.from}, ${item.to})` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.13)_0%,transparent_55%)]" />
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-[0.6rem] bg-white/20">
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="relative z-10 text-[10.5px] font-black text-white leading-tight">{item.label}</span>
            </motion.a>
          );
        })}
      </div>

      <motion.a
        href="https://katalog.lovebydgoszcz.pl/"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.18 }}
        className="relative flex w-full items-center gap-3 overflow-hidden rounded-[1.3rem] p-3.5 active:scale-[0.98] transition-transform duration-150"
        style={{ background: "linear-gradient(135deg, #064e3b, #065f46, #047857)" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-[0.07] bg-white" />
        <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.7rem] bg-white/20">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div className="relative z-10 flex-1 min-w-0">
          <p className="text-[13px] font-black text-white leading-tight">Katalog Bydgoski</p>
          <p className="text-[9.5px] font-medium text-white/65 mt-0.5">Miejsca, wydarzenia i firmy</p>
        </div>
        <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/18">
          <ArrowRight className="h-3 w-3 text-white" />
        </div>
      </motion.a>
    </section>
  );
}

// ─── Relacje Button ───────────────────────────────────────────────────────────

function RelacjeButton({ firstArticleImg }: { firstArticleImg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.06 }}
      className="relative pt-4"
    >
      <Link
        to="/rolka"
        className="relative flex items-center gap-3 overflow-visible rounded-[1.4rem] active:scale-[0.98] transition-transform duration-150"
        style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)", minHeight: "3.5rem", padding: "0.65rem 0.9rem 0.65rem 1.1rem" }}
      >
        {/* Shine overlay */}
        <div className="absolute inset-0 rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.09)_0%,transparent_50%)]" />
        {/* Decorative dots */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex gap-1 opacity-[0.15]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-white" />
          ))}
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-[0.07] bg-white" />
        {/* Play circle — protruding from top */}
        <div className="absolute -top-4 left-3.5 z-20">
          <div
            className="h-[2.6rem] w-[2.6rem] rounded-full overflow-hidden border-2 border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4c1d95)" }}
          >
            {firstArticleImg && (
              <img
                src={firstArticleImg}
                alt="Relacje"
                className="h-full w-full object-cover opacity-55"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center rounded-full">
            <Play className="h-3 w-3 fill-white text-white ml-0.5 drop-shadow-md" />
          </div>
        </div>
        {/* Text */}
        <div className="relative z-10 flex-1 min-w-0 pl-9">
          <div className="flex items-baseline gap-1.5">
            <p className="text-[13px] font-black text-white leading-tight">Relacje</p>
            <span className="text-[9px] font-semibold text-white/45">Szybkie informacje</span>
          </div>
          <p className="text-[9px] font-medium text-white/55 mt-0.5">Scrolluj publikacje</p>
        </div>
        {/* Arrow */}
        <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
          <ArrowRight className="h-3 w-3 text-white" />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MobileLanding() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const nav = useNavigate();

  const [allArticles, setAllArticles] = useState<any[] | null>(null);
  const [updates, setUpdates] = useState<any[] | null>(null);
  const [events, setEvents] = useState<any[] | null>(null);
  const [authors, setAuthors] = useState<any[] | null>(null);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      const [articlesResult, updatesResult, eventsResult, authorsResult] = await Promise.allSettled([
        fetchArticles({ limit: 30 }),
        fetchUpdates({ limit: 8 }),
        fetchEvents({ limit: 8 }),
        apiFetch("/authors"),
      ]);

      if (!active) return;

      if (articlesResult.status === "fulfilled") {
        setAllArticles(Array.isArray(articlesResult.value) ? articlesResult.value : []);
      } else {
        setAllArticles([]);
        toast.warning("Artykuły są chwilowo niedostępne.");
      }

      if (updatesResult.status === "fulfilled") {
        setUpdates(normalizeUpdatesPayload(updatesResult.value));
      } else {
        setUpdates([]);
        toast.warning("Aktualizacje są chwilowo niedostępne.");
      }

      if (eventsResult.status === "fulfilled") {
        setEvents(normalizeEventsPayload(eventsResult.value));
      } else {
        setEvents([]);
        toast.warning("Wydarzenia są chwilowo niedostępne.");
      }

      if (authorsResult.status === "fulfilled") {
        setAuthors(normalizeAuthorsPayload(authorsResult.value));
      } else {
        setAuthors([]);
        toast.warning("Autorzy są chwilowo niedostępni.");
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const resolvedArticles = useResolvedArticles(allArticles ?? undefined);

  const heroArticles = useMemo(() => {
    const authorMap = new Map((authors ?? []).map((author: any) => [author.name, author.image]));
    return (resolvedArticles ?? []).slice(0, 4).map((article: any) => ({
      ...article,
      authorImage: article.authorImage || (article.author ? authorMap.get(article.author) : undefined),
    }));
  }, [resolvedArticles, authors]);

  const feedArticles = useMemo(() => {
    const base = activeCategory === "all" ? (resolvedArticles ?? []) : (resolvedArticles ?? []).filter((a: any) => a.category === activeCategory);
    return base.slice(0, 11);
  }, [resolvedArticles, activeCategory]);

  const largeArticles = feedArticles.slice(0, 3);
  const listArticles = feedArticles.slice(3);
  const latestUpdates = useMemo(() => (updates ?? []).slice(0, 4), [updates]);

  const mostReadArticles = useMemo(() => {
    return [...(allArticles ?? [])].sort((a: any, b: any) => b.publishedAt - a.publishedAt).slice(4, 12);
  }, [allArticles]);

  const firstArticleImg = (allArticles ?? [])[0]?.imageUrl || "/assets/logo-lovebydgoszcz.png";
  const isLoading = allArticles === null;

  return (
    <div className="relative bg-background overflow-x-hidden">
      {/* Subtle ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute -top-24 -right-24 h-[20rem] w-[20rem] rounded-full opacity-[0.055]"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)", filter: "blur(48px)" }}
        />
        <div
          className="absolute top-[35%] -left-20 h-[16rem] w-[16rem] rounded-full opacity-[0.035]"
          style={{ background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)", filter: "blur(52px)" }}
        />
      </div>

      {/* Main content */}
      <div
        className="relative space-y-2.5 px-4"
        style={{
          zIndex: 1,
          paddingTop: "calc(5.5rem + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Stories */}
        <MobileStoriesSection />

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-0.5">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCategory === cat.key;
            return (
              <motion.button
                key={cat.key}
                type="button"
                whileTap={{ scale: 0.93 }}
                onClick={() => {
                  setActiveCategory(cat.key);
                  if (cat.href) nav(cat.href);
                }}
                className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-all duration-200 border ${
                  active
                    ? `${cat.dot} text-white border-transparent shadow-sm`
                    : "bg-transparent text-foreground/55 border-border/40"
                }`}
              >
                <Icon className="h-2.5 w-2.5 shrink-0" />
                {cat.label}
              </motion.button>
            );
          })}
        </div>

        {/* Hero carousel */}
        {isLoading ? (
          <HeroSkeleton />
        ) : heroArticles.length > 0 ? (
          <HeroCarousel articles={heroArticles} />
        ) : null}

        {/* Aktualizacje */}
        {latestUpdates.length > 0 && (
          <section>
            <div className="mb-1">
              <SectionHead title="Aktualizacje" href="/aktualizacje" icon={Zap} accentFrom="#f59e0b" accentTo="#ea580c" />
            </div>
            <div
              className="rounded-[1.2rem] overflow-hidden"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border)/0.28)", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.08)" }}
            >
              {latestUpdates.map((u, i) => (
                <LiveRow key={u._id} update={u} last={i === latestUpdates.length - 1} />
              ))}
            </div>
          </section>
        )}

        {/* Events */}
        {events && events.length > 0 && (
          <section>
            <div className="mb-1">
              <SectionHead title="Wydarzenia" href="/wydarzenia" icon={CalendarDays} accentFrom="#6366f1" accentTo="#8b5cf6" />
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-0.5 scrollbar-hide -mx-4 px-4">
              {events.map((event, i) => (
                <MobileEventCard key={event._id} event={event} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Most read — overflow: visible so shadows bleed through */}
        <MostReadSection articles={mostReadArticles} />

        {/* Quick access tiles */}
        <section className="grid grid-cols-3 gap-2">
          {[
            { href: "/pogoda", icon: CloudSun, label: "Pogoda", sublabel: "Bydgoszcz", from: "#0ea5e9", to: "#0891b2" },
            { href: "/rozklad", icon: TramFront, label: "Rozkład", sublabel: "MZK", from: "#3b82f6", to: "#2563eb" },
            { href: "/nekrolog", icon: Heart, label: "Pamięć", sublabel: "Nekrologi", from: "#64748b", to: "#475569" },
          ].map(tile => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.href}
                to={tile.href}
                className="relative flex flex-col gap-1.5 overflow-hidden rounded-[1.1rem] p-2.5 active:scale-[0.96] transition-transform duration-150"
                style={{ background: `linear-gradient(145deg, ${tile.from}, ${tile.to})` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.11)_0%,transparent_55%)]" />
                <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-[0.5rem] bg-white/20">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="relative z-10">
                  <p className="text-[11px] font-black leading-tight text-white">{tile.label}</p>
                  <p className="mt-0.5 text-[8.5px] font-medium text-white/55">{tile.sublabel}</p>
                </div>
              </Link>
            );
          })}
        </section>

        {/* Relacje button */}
        <RelacjeButton firstArticleImg={firstArticleImg} />

        {/* Najnowsze */}
        {feedArticles.length > 0 && (
          <section>
            <div className="mb-1">
              <SectionHead title="Najnowsze" href={activeCategory === "all" ? "/miasto" : `/${activeCategory}`} icon={Newspaper} accentFrom="#2563eb" accentTo="#0891b2" />
            </div>
            {largeArticles.length > 0 && (
              <div
                className="space-y-2 rounded-[1.25rem] p-2"
                style={{ background: "hsl(var(--muted)/0.2)", border: "1px solid hsl(var(--border)/0.16)" }}
              >
                {largeArticles.map((a, i) => (
                  <LargeArticleCard key={a._id} article={a} index={i} />
                ))}
              </div>
            )}
            {listArticles.length > 0 && (
              <div
                className="mt-1.5 overflow-hidden rounded-[1.2rem]"
                style={{ background: "hsl(var(--card)/0.5)", border: "1px solid hsl(var(--border)/0.16)" }}
              >
                {listArticles.map((a, i) => (
                  <div key={a._id} className={i < listArticles.length - 1 ? "border-b border-border/12" : ""}>
                    <ListCard article={a} index={i} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Polecane miejsca */}
        <MobilePlacesSection />

        {/* Najbliższe wydarzenia */}
        <MobileDirectoryEventsSection />

        {/* Odkryj kategorie */}
        <CategoryExplorer articles={allArticles ?? []} />

        {/* Katalog Bydgoski */}
        <KatalogSection />

        {/* Kontakt — last item, no trailing space */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.05 }}
        >
          <Link
            to="/kontakt"
            className="relative flex w-full items-center gap-3 overflow-hidden rounded-[1.3rem] border border-border/25 bg-card p-3 active:scale-[0.98] transition-transform duration-150"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.7rem] shadow-sm"
              style={{ background: "linear-gradient(135deg, #0891b2, #0d9488)" }}
            >
              <Mail className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-black text-foreground leading-tight">Kontakt</p>
              <p className="text-[9.5px] font-medium text-foreground/42 mt-0.5">Bądź blisko z nami — skontaktuj się</p>
            </div>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
              <ArrowRight className="h-2.5 w-2.5 text-foreground/38" />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
