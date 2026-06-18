import Navbar from "@/components/Navbar";
import CategorySection from "@/components/CategorySection";
import Footer from "@/components/Footer";
import StoriesSection from "@/components/StoriesSection";
import HeroSection from "@/components/landing/HeroSection";
import AktualnosciSection from "@/components/landing/AktualnosciSection";
import StatsBanner from "@/components/landing/StatsBanner";
import SidebarWidgets from "@/components/landing/SidebarWidgets";
import BydgoszczanieSlider from "@/components/landing/BydgoszczanieSlider";
import { HomepageDirectoryFeedSections } from "@/components/landing/HomepageDirectoryFeed";
import HomepageHeroAd from "@/components/ads/HomepageHeroAd";
import PartnerLogosStrip from "@/components/ads/PartnerLogosStrip";
import ReelsStrip from "@/components/landing/ReelsStrip";
import SEO from "@/components/SEO";
import { Building2, Music, Palette, Briefcase, UtensilsCrossed, Users, Zap, MapPin, ChevronRight, ChevronLeft, Trophy, HardHat, Scale, Newspaper } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLanding from "@/components/mobile/MobileLanding";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useState, useRef, useMemo } from "react";
import { getArticleHref } from "@/lib/articleRouting";
import { useResolvedArticles } from "@/hooks/use-resolved-articles";

const categorySections = [
  {
    id: "miasto",
    title: "Miasto",
    category: "miasto" as const,
    description: "Rozwój, inwestycje i życie miejskie",
    icon: <Building2 className="w-5 h-5 text-blue-600" />,
    accentColor: "bg-blue-100",
    bgColor: "",
  },
  {
    id: "rozrywka",
    title: "Rozrywka",
    category: "rozrywka" as const,
    description: "Koncerty, wystawy i życie nocne",
    icon: <Music className="w-5 h-5 text-purple-600" />,
    accentColor: "bg-purple-100",
    bgColor: "bg-muted/30",
  },
  {
    id: "gastronomia",
    title: "Gastronomia",
    category: "gastronomia" as const,
    description: "Restauracje, kawiarnie i lokalne smaki",
    icon: <UtensilsCrossed className="w-5 h-5 text-orange-600" />,
    accentColor: "bg-orange-100",
    bgColor: "",
  },
  {
    id: "kultura",
    title: "Kultura",
    category: "kultura" as const,
    description: "Teatr, muzea i festiwale",
    icon: <Palette className="w-5 h-5 text-amber-600" />,
    accentColor: "bg-amber-100",
    bgColor: "bg-muted/30",
  },
  {
    id: "biznes",
    title: "Biznes",
    category: "biznes" as const,
    description: "Gospodarka i przedsiębiorczość",
    icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
    accentColor: "bg-emerald-100",
    bgColor: "",
  },
  {
    id: "bydgoszczanie",
    title: "Bydgoszczanie",
    category: "bydgoszczanie" as const,
    description: "Poznaj niezwykłych ludzi z naszego miasta",
    icon: <Users className="w-5 h-5 text-rose-600" />,
    accentColor: "bg-rose-100",
    bgColor: "bg-muted/30",
  },
];

function HomepageUpdatesStrip() {
  const updates = useQuery(api.updates.list, { limit: 5 });

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw" });
  };

  const CATEGORY_COLORS: Record<string, string> = {
    miasto: "bg-blue-100 text-blue-700 dark:bg-blue-500/18 dark:text-blue-200",
    rozrywka: "bg-pink-100 text-pink-700 dark:bg-pink-500/18 dark:text-pink-200",
    kultura: "bg-purple-100 text-purple-700 dark:bg-purple-500/18 dark:text-purple-200",
    biznes: "bg-green-100 text-green-700 dark:bg-emerald-500/18 dark:text-emerald-200",
    gastronomia: "bg-orange-100 text-orange-700 dark:bg-orange-500/18 dark:text-orange-200",
    bydgoszczanie: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/18 dark:text-cyan-200",
    medyczna: "bg-teal-100 text-teal-700 dark:bg-teal-500/18 dark:text-teal-200",
    sport: "bg-blue-100 text-blue-700 dark:bg-blue-500/18 dark:text-blue-200",
    polityka: "bg-slate-100 text-slate-700 dark:bg-slate-500/18 dark:text-slate-200",
    inwestycje: "bg-amber-100 text-amber-700 dark:bg-amber-500/18 dark:text-amber-200",
    nasze_dzialania: "bg-purple-100 text-purple-700 dark:bg-purple-500/18 dark:text-purple-200",
  };

  const CATEGORY_LABELS: Record<string, string> = {
    miasto: "Miasto",
    rozrywka: "Rozrywka",
    kultura: "Kultura",
    biznes: "Biznes",
    gastronomia: "Gastronomia",
    bydgoszczanie: "Bydgoszczanie",
    medyczna: "Medycyna",
    sport: "Sport",
    polityka: "Polityka",
    inwestycje: "Inwestycje",
    nasze_dzialania: "Nasze Działania",
  };

  const latest = updates?.slice(0, 5) ?? [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-amber-200/60 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-5 shadow-sm dark:border-amber-300/20 dark:bg-[linear-gradient(130deg,rgba(57,34,18,0.72),rgba(24,30,46,0.8)_46%,rgba(43,26,16,0.72))] dark:shadow-[0_22px_56px_-34px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 shadow-sm shadow-amber-200 dark:shadow-amber-700/30">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-amber-100">Najnowsze aktualizacje</h3>
              <p className="text-xs text-slate-500 dark:text-amber-50/70">Bieżące informacje z Bydgoszczy</p>
            </div>
          </div>
          <Link
            to="/aktualizacje"
            className="flex items-center gap-1.5 rounded-[1.1rem] bg-amber-100 px-3.5 py-1.5 text-xs font-extrabold text-amber-700 transition-all duration-300 hover:bg-amber-200 hover:text-amber-800 hover:shadow-sm dark:bg-amber-500/18 dark:text-amber-100 dark:hover:bg-amber-500/30"
          >
            Wszystkie
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!updates ? (
          <div className="flex gap-3 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 w-48 shrink-0 animate-pulse rounded-[1.25rem] bg-gradient-to-br from-amber-100/60 to-amber-50/40 shadow-sm border border-amber-100/40 dark:from-amber-500/16 dark:to-amber-500/10 dark:border-amber-500/20" />
            ))}
          </div>
        ) : latest.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400 dark:text-amber-50/60">Brak aktualizacji</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {latest.map((upd, i) => (
              <motion.div
                key={upd._id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[1.25rem] border border-amber-100/80 dark:border-amber-500/15 bg-white dark:bg-card/60 p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:border-amber-500/25 dark:hover:bg-card/80"
              >
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="text-xs font-black text-amber-500 dark:text-amber-300">{formatTime(upd.publishedAt)}</span>
                  {upd.category && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[upd.category] || "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-200"}`}>
                      {CATEGORY_LABELS[upd.category] || upd.category}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 dark:text-slate-100">{upd.title}</p>
                {upd.location && (
                  <p className="mt-1 flex items-center gap-0.5 text-[10px] text-slate-400 dark:text-slate-300/70">
                    <MapPin className="w-2.5 h-2.5 shrink-0" /> {upd.location}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}

function HomepageFeedBand({
  shellClassName,
  children,
}: {
  shellClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={`relative overflow-visible ${shellClassName ?? ""}`}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

// ─── Polecane Nasze Publikacje — one article per category rotating ────────────
function PolecanePubSection() {
  const allArticles = useQuery(api.articles.list, { limit: 20 });
  const resolved = useResolvedArticles(allArticles);
  const [active, setActive] = useState(0);
  const nav = useNavigate();

  // Build a list: one article per category, rotating through categories
  const CATEGORY_ORDER = ["miasto", "rozrywka", "kultura", "biznes", "gastronomia", "bydgoszczanie", "sport", "polityka", "inwestycje", "medyczna"];
  
  const items = useMemo(() => {
    if (!resolved) return [];
    const byCategory: Record<string, typeof resolved[0][]> = {};
    for (const a of resolved) {
      if (a.category && a.imageUrl) {
        if (!byCategory[a.category]) byCategory[a.category] = [];
        byCategory[a.category].push(a);
      }
    }
    // Pick one per category in order, cycling if needed
    const result: typeof resolved = [];
    const maxPerCat = 3;
    for (let round = 0; round < maxPerCat; round++) {
      for (const cat of CATEGORY_ORDER) {
        const catArticles = byCategory[cat] ?? [];
        if (catArticles[round]) result.push(catArticles[round]);
      }
    }
    return result.slice(0, 12);
  }, [resolved]);

  const loading = resolved === undefined;
  const canPrev = active > 0;
  const canNext = active + 1 < items.length;

  const slide = (dir: 1 | -1) => {
    setActive(p => Math.max(0, Math.min(items.length - 1, p + dir)));
  };

  const featured = items[active];
  const THUMB_VISIBLE = 4;
  const thumbStart = Math.max(0, Math.min(active - 1, items.length - THUMB_VISIBLE));
  const thumbItems = items.slice(thumbStart, thumbStart + THUMB_VISIBLE);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });

  const CAT_COLORS: Record<string, string> = {
    miasto: "bg-blue-500", rozrywka: "bg-purple-500", kultura: "bg-amber-500",
    biznes: "bg-emerald-500", gastronomia: "bg-orange-500", bydgoszczanie: "bg-rose-500",
    sport: "bg-blue-600", polityka: "bg-slate-600", inwestycje: "bg-amber-600", medyczna: "bg-teal-500",
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-7"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-md border border-primary/20">
            <Newspaper className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-[1.55rem] font-black tracking-tight text-foreground">Polecane Nasze Publikacje</h2>
            <p className="mt-0.5 text-[13px] font-medium text-muted-foreground">Wybrane artykuły z każdej kategorii</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => slide(-1)}
            disabled={!canPrev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card shadow-sm transition-all hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => slide(1)}
            disabled={!canNext}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card shadow-sm transition-all hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex gap-5">
          <div className="flex-1 h-[420px] rounded-3xl bg-muted/50 animate-pulse" />
          <div className="w-72 flex flex-col gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted/50 animate-pulse" />)}
          </div>
        </div>
      ) : items.length === 0 ? null : (
        <div className="flex gap-5 items-stretch">
          {/* Featured article */}
          <AnimatePresence mode="wait">
            <motion.div
              key={featured?._id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => featured && nav(getArticleHref(featured))}
              className="flex-1 relative overflow-hidden rounded-3xl cursor-pointer group shadow-xl"
              style={{ minHeight: 420 }}
            >
              {featured?.imageUrl && (
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              {/* Category badge */}
              {featured?.category && (
                <div className="absolute top-5 left-5">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${CAT_COLORS[featured.category] ?? "bg-primary"}`}>
                    {featured.category}
                  </span>
                </div>
              )}
              {/* Nav arrows overlay */}
              <button
                onClick={e => { e.stopPropagation(); slide(-1); }}
                disabled={!canPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white transition-all hover:bg-black/60 disabled:opacity-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); slide(1); }}
                disabled={!canNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white transition-all hover:bg-black/60 disabled:opacity-0"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-7">
                <h3 className="text-xl font-black leading-tight text-white drop-shadow-lg line-clamp-3 mb-3">
                  {featured?.title}
                </h3>
                <div className="flex items-center gap-3 text-white/70 text-xs">
                  {featured?.author && (
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-black">
                        {featured.author.charAt(0)}
                      </div>
                      <span className="font-semibold">{featured.author}</span>
                    </div>
                  )}
                  {featured?.publishedAt && (
                    <span>{formatDate(featured.publishedAt)}</span>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-xs font-black text-white border border-white/30 group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                    Czytaj artykuł
                  </span>
                  <ChevronRight className="h-4 w-4 text-white" />
                </div>
              </div>
              {/* Progress dots */}
              <div className="absolute bottom-5 right-5 flex gap-1">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setActive(i); }}
                    className={`rounded-full transition-all duration-300 ${i === active ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Thumbnails sidebar */}
          <div className="w-72 flex flex-col gap-3">
            {thumbItems.map((article, i) => {
              const globalIdx = thumbStart + i;
              const isActive = globalIdx === active;
              return (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  onClick={() => setActive(globalIdx)}
                  className={`group flex gap-3 cursor-pointer rounded-2xl p-2.5 transition-all duration-300 ${isActive ? "bg-primary/8 ring-1 ring-primary/30 shadow-sm" : "hover:bg-muted/60"}`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Newspaper className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/20 rounded-xl" />
                    )}
                    {/* Category dot */}
                    {article.category && (
                      <div className={`absolute top-1.5 left-1.5 w-2 h-2 rounded-full ${CAT_COLORS[article.category] ?? "bg-primary"}`} />
                    )}
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <h4 className={`line-clamp-2 text-[12px] font-bold leading-snug transition-colors ${isActive ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                      {article.title}
                    </h4>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {article.author && (
                        <span className="text-[10px] text-muted-foreground font-medium truncate">{article.author}</span>
                      )}
                      {article.publishedAt && (
                        <span className="text-[10px] text-muted-foreground/70">{formatDate(article.publishedAt)}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Shared article card for Polityka/Sport/Inwestycje ───────────────────────
interface ThemeCardProps {
  article: any;
  hovered: string | null;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
  index: number;
  accentColor: string;
  borderColor: string;
  shadowColor: string;
  btnClass: string;
  cardBg?: string;
  fallbackIcon: ReactNode;
}

function ThemeArticleCard({ article, hovered, onHoverStart, onHoverEnd, onClick, index, accentColor, borderColor, shadowColor, btnClass, cardBg, fallbackIcon }: ThemeCardProps) {
  const isHovered = hovered === article._id;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.25 } }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={onClick}
      className="group cursor-pointer flex flex-col"
    >
      <div className={`flex flex-col flex-1 overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${cardBg ?? "bg-card"} ${borderColor} ${isHovered ? `shadow-xl ${shadowColor}` : ""}`}>
        {/* Image with title overlay */}
        <div className="relative h-52 overflow-hidden shrink-0">
          {article.imageUrl ? (
            <>
              <img
                src={article.imageUrl}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient: stronger at bottom for title readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/10"
                  />
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="h-full bg-muted/50 flex items-center justify-center">
              {fallbackIcon}
            </div>
          )}
          {/* Title inside image at bottom */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className={`line-clamp-2 text-sm font-black leading-tight text-white drop-shadow-lg transition-colors`}>
              {article.title}
            </h3>
          </div>
        </div>
        {/* Bottom bar: author + date + Czytaj button */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-white/15 flex items-center justify-center text-[9px] font-black text-white/80">
              {(article.author || "L").charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/70 font-medium truncate max-w-[90px]">{article.author || "Love Bydgoszcz"}</span>
              {article.publishedAt && (
                <span className="text-[9px] text-white/40">{new Date(article.publishedAt).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}</span>
              )}
            </div>
          </div>
          <motion.div
            animate={{ scale: isHovered ? 1 : 0.95 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-black transition-all duration-300 ${isHovered ? btnClass : "bg-white/10 text-white/60"}`}
          >
            Czytaj <ChevronRight className="h-3 w-3" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Polityka Section — 3 articles horizontal ────────────────────────────────
function PolitykaSectionHorizontal() {
  const articles = useQuery(api.articles.list, { category: "polityka" as any, limit: 10 });
  const resolved = useResolvedArticles(articles);
  const nav = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  const items = resolved?.slice(0, 3) ?? [];

  return (
    <section className="relative py-12 overflow-hidden">
      {/* Polityka: deep civic/governmental atmosphere */}
      <div className="absolute inset-0 bg-slate-900 dark:bg-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(71,85,105,0.6),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(51,65,85,0.8),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(30,41,59,0.8),transparent_50%),radial-gradient(circle_at_100%_0%,rgba(15,23,42,0.9),transparent_50%)]" />
      {/* Subtle newspaper column lines */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(148,163,184,1) 0, rgba(148,163,184,1) 1px, transparent 0, transparent 33.33%)" }} />
      {/* Top accent bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent" />
      {/* Glow orbs */}
      <div className="absolute left-[10%] top-[30%] w-64 h-64 rounded-full bg-slate-600/20 blur-[80px]" />
      <div className="absolute right-[5%] bottom-[10%] w-48 h-48 rounded-full bg-slate-500/15 blur-[60px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-7"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shadow-md border border-white/20 backdrop-blur-sm">
              <Scale className="w-5 h-5 text-slate-200" />
            </div>
            <div>
              <h2 className="text-[1.55rem] font-black tracking-tight text-white">Polityka</h2>
              <p className="mt-0.5 text-[13px] font-medium text-slate-400">Samorząd, decyzje i lokalna debata</p>
            </div>
          </div>
          <Link
            to="/polityka"
            className="flex items-center gap-1.5 rounded-[1.1rem] border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-xs font-extrabold text-white transition-all hover:bg-white hover:text-slate-900 hover:shadow-lg"
          >
            Poznaj więcej publikacji
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {!resolved ? (
          <div className="grid grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? null : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
            {items.map((article, i) => (
              <ThemeArticleCard
                key={article._id}
                article={article}
                hovered={hovered}
                onHoverStart={() => setHovered(article._id)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => nav(getArticleHref(article))}
                index={i}
                accentColor="text-slate-300"
                borderColor="border-white/10 group-hover:border-slate-400/50"
                shadowColor="shadow-slate-900/50"
                btnClass="bg-slate-200 text-slate-900"
                cardBg="bg-white/[0.07] backdrop-blur-sm"
                fallbackIcon={<Scale className="h-10 w-10 text-slate-400" />}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Inwestycje Section — 3 articles horizontal ──────────────────────────────
function InwestycjeSectionHorizontal() {
  const articles = useQuery(api.articles.list, { category: "inwestycje" as any, limit: 10 });
  const resolved = useResolvedArticles(articles);
  const nav = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  const items = resolved?.slice(0, 3) ?? [];

  return (
    <section className="relative py-12 overflow-hidden">
      {/* Inwestycje: warm construction/urban development atmosphere */}
      <div className="absolute inset-0 bg-amber-950 dark:bg-[#1a1000]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_110%,rgba(217,119,6,0.55),transparent)] dark:bg-[radial-gradient(ellipse_90%_70%_at_50%_110%,rgba(180,83,9,0.6),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(245,158,11,0.3),transparent_45%),radial-gradient(circle_at_0%_100%,rgba(180,83,9,0.25),transparent_45%)]" />
      {/* Blueprint grid */}
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(251,191,36,1) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      {/* Top accent bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      {/* Glow orbs */}
      <div className="absolute right-[8%] top-[20%] w-72 h-72 rounded-full bg-amber-500/15 blur-[90px]" />
      <div className="absolute left-[5%] bottom-[5%] w-56 h-56 rounded-full bg-orange-600/12 blur-[70px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-7"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-400/20 flex items-center justify-center shadow-md border border-amber-400/30">
              <HardHat className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-[1.55rem] font-black tracking-tight text-white">Inwestycje</h2>
              <p className="mt-0.5 text-[13px] font-medium text-amber-200/70">Budowy, remonty i rozwój infrastruktury</p>
            </div>
          </div>
          <Link
            to="/inwestycje"
            className="flex items-center gap-1.5 rounded-[1.1rem] border border-amber-400/30 bg-amber-400/15 backdrop-blur-sm px-4 py-2 text-xs font-extrabold text-amber-200 transition-all hover:bg-amber-400/25 hover:border-amber-400/50 hover:shadow-md"
          >
            Więcej Inwestycji
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {!resolved ? (
          <div className="grid grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <div key={i} className="h-80 rounded-2xl bg-muted/50 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? null : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
            {items.map((article, i) => (
              <ThemeArticleCard
                key={article._id}
                article={article}
                hovered={hovered}
                onHoverStart={() => setHovered(article._id)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => nav(getArticleHref(article))}
                index={i}
                accentColor="text-amber-300"
                borderColor="border-amber-400/20 group-hover:border-amber-400/50"
                shadowColor="shadow-amber-900/50"
                btnClass="bg-amber-400 text-amber-950"
                cardBg="bg-amber-900/30 backdrop-blur-sm"
                fallbackIcon={<HardHat className="h-10 w-10 text-amber-400" />}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Sport Section — 3 articles horizontal ───────────────────────────────────
function SportSectionHorizontal() {
  const articles = useQuery(api.articles.list, { category: "sport" as any, limit: 10 });
  const resolved = useResolvedArticles(articles);
  const nav = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  const items = resolved?.slice(0, 3) ?? [];

  return (
    <section className="relative py-12 overflow-hidden">
      {/* Sport: bold stadium energy atmosphere */}
      <div className="absolute inset-0 bg-blue-950 dark:bg-[#020b18]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_120%,rgba(37,99,235,0.6),transparent)] dark:bg-[radial-gradient(ellipse_100%_80%_at_50%_120%,rgba(29,78,216,0.7),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(79,70,229,0.3),transparent_40%),radial-gradient(circle_at_100%_50%,rgba(37,99,235,0.25),transparent_40%)]" />
      {/* Stadium arc lines */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "repeating-radial-gradient(circle at 50% 120%, transparent 0, transparent 60px, rgba(96,165,250,0.8) 61px, transparent 62px)" }} />
      {/* Diagonal speed lines */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(-45deg, rgba(96,165,250,1) 0, rgba(96,165,250,1) 1px, transparent 0, transparent 30px)" }} />
      {/* Top accent bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-700 via-blue-400 to-blue-700" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      {/* Glow orbs */}
      <div className="absolute left-[15%] top-[10%] w-80 h-80 rounded-full bg-blue-500/12 blur-[100px]" />
      <div className="absolute right-[10%] bottom-[5%] w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-7"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-400/20 flex items-center justify-center shadow-md border border-blue-400/30">
              <Trophy className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-[1.55rem] font-black tracking-tight text-white">Sport</h2>
              <p className="mt-0.5 text-[13px] font-medium text-blue-200/70">Mecze, wyniki i lokalne emocje sportowe</p>
            </div>
          </div>
          <Link
            to="/sport"
            className="flex items-center gap-1.5 rounded-[1.1rem] border border-blue-400/30 bg-blue-400/15 backdrop-blur-sm px-4 py-2 text-xs font-extrabold text-blue-200 transition-all hover:bg-blue-400/25 hover:border-blue-400/50 hover:shadow-md"
          >
            Więcej Sportu
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {!resolved ? (
          <div className="grid grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <div key={i} className="h-80 rounded-2xl bg-muted/50 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? null : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
            {items.map((article, i) => (
              <ThemeArticleCard
                key={article._id}
                article={article}
                hovered={hovered}
                onHoverStart={() => setHovered(article._id)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => nav(getArticleHref(article))}
                index={i}
                accentColor="text-blue-300"
                borderColor="border-blue-400/20 group-hover:border-blue-400/50"
                shadowColor="shadow-blue-900/50"
                btnClass="bg-blue-400 text-blue-950"
                cardBg="bg-blue-900/30 backdrop-blur-sm"
                fallbackIcon={<Trophy className="h-10 w-10 text-blue-400" />}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Landing() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        <SEO
          title="Strona Główna"
          description="Love Bydgoszcz - Najlepszy portal informacyjny o Bydgoszczy. Wiadomości, wydarzenia, kultura i biznes."
        />
        <MobileLanding />
        <MobileBottomNav />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Strona Główna" 
        description="Love Bydgoszcz - Najlepszy portal informacyjny o Bydgoszczy. Wiadomości, wydarzenia, kultura i biznes."
      />
      <Navbar />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_8%_8%,rgba(14,165,233,0.14),transparent_32%),radial-gradient(circle_at_84%_10%,rgba(251,191,36,0.14),transparent_26%),radial-gradient(circle_at_50%_44%,rgba(59,130,246,0.07),transparent_36%),radial-gradient(circle_at_16%_76%,rgba(14,165,233,0.11),transparent_28%),radial-gradient(circle_at_86%_72%,rgba(251,191,36,0.11),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.90)_26%,rgba(255,255,255,0.96)_60%,rgba(248,250,252,0.99))] dark:bg-[radial-gradient(circle_at_10%_12%,rgba(244,114,82,0.16),transparent_26%),radial-gradient(circle_at_86%_10%,rgba(245,158,11,0.14),transparent_22%),radial-gradient(circle_at_48%_44%,rgba(96,165,250,0.09),transparent_30%),radial-gradient(circle_at_16%_76%,rgba(56,189,248,0.09),transparent_26%),radial-gradient(circle_at_86%_74%,rgba(251,191,36,0.09),transparent_22%),linear-gradient(180deg,rgba(16,20,32,0.99),rgba(18,24,38,0.96)_28%,rgba(14,18,30,0.99)_100%)]" />
        <div className="pointer-events-none absolute left-[6%] top-12 h-32 w-32 rounded-full bg-sky-200/22 blur-[64px] dark:bg-orange-300/12" />
        <div className="pointer-events-none absolute right-[8%] top-16 h-28 w-28 rounded-full bg-amber-200/22 blur-[64px] dark:bg-amber-300/12" />
        <div className="pointer-events-none absolute left-[24%] top-[42%] h-28 w-28 rounded-full bg-blue-200/16 blur-[64px] dark:bg-sky-400/11" />
        <div className="pointer-events-none absolute left-[10%] top-[74%] h-28 w-28 rounded-full bg-sky-200/16 blur-[64px] dark:bg-cyan-300/11" />
        <div className="pointer-events-none absolute right-[12%] top-[68%] h-24 w-24 rounded-full bg-amber-200/16 blur-[64px] dark:bg-orange-300/11" />
        <div className="relative z-10">
          <HomepageHeroAd />
          <HeroSection />
          <StoriesSection />
        </div>
      </div>

      <HomepageUpdatesStrip />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.95)_18%,rgba(255,255,255,0.93)_40%,rgba(248,250,252,0.97)_66%,rgba(255,255,255,0.99)_100%)] dark:bg-[linear-gradient(180deg,rgba(18,24,38,0.97),rgba(17,23,36,0.95)_18%,rgba(15,20,32,0.95)_44%,rgba(12,17,28,0.99)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_12%_16%,rgba(14,165,233,0.11),transparent_26%),radial-gradient(circle_at_86%_14%,rgba(251,191,36,0.09),transparent_22%),radial-gradient(circle_at_48%_46%,rgba(59,130,246,0.06),transparent_32%)] dark:bg-[radial-gradient(circle_at_14%_18%,rgba(56,189,248,0.13),transparent_24%),radial-gradient(circle_at_86%_14%,rgba(251,146,60,0.13),transparent_20%),radial-gradient(circle_at_48%_46%,rgba(244,114,82,0.09),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[26rem] bg-[radial-gradient(circle_at_16%_76%,rgba(14,165,233,0.09),transparent_24%),radial-gradient(circle_at_86%_70%,rgba(245,158,11,0.09),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.92))] dark:bg-[radial-gradient(circle_at_16%_76%,rgba(56,189,248,0.09),transparent_24%),radial-gradient(circle_at_86%_70%,rgba(249,115,22,0.11),transparent_22%),linear-gradient(180deg,rgba(15,20,32,0),rgba(12,17,28,0.94))]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AktualnosciSection />
            </div>
            <div className="lg:col-span-1">
              <SidebarWidgets />
            </div>
          </div>
        </div>

        <HomepageFeedBand
          key="homepage-places-band"
          shellClassName="relative z-10 pb-3"
        >
          <HomepageDirectoryFeedSections key="homepage-places-feed" sections={["places"]} backgroundClassName="bg-transparent" />
        </HomepageFeedBand>

        <div className="relative z-10">
          <StatsBanner />
        </div>
        
        <div className="relative z-10">
          <BydgoszczanieSlider />
        </div>

        <HomepageFeedBand
          key="homepage-events-band"
          shellClassName="relative z-10 py-2"
        >
          <HomepageDirectoryFeedSections key="homepage-events-feed" sections={["events"]} backgroundClassName="bg-transparent" />
        </HomepageFeedBand>

        <div className="relative -mt-6 overflow-hidden pt-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.54)_44%,rgba(255,255,255,0)_100%)] dark:bg-[linear-gradient(180deg,rgba(14,18,30,0.92),rgba(14,18,30,0.44)_44%,rgba(14,18,30,0)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(248,250,252,0.28)_22%,rgba(255,248,240,0.30)_46%,rgba(255,255,255,0.95)_100%)] dark:bg-[linear-gradient(180deg,rgba(12,17,28,0)_0%,rgba(20,27,42,0.32)_22%,rgba(40,24,26,0.24)_46%,rgba(10,14,24,0.97)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_12%_16%,rgba(14,165,233,0.07),transparent_26%),radial-gradient(circle_at_84%_14%,rgba(245,158,11,0.09),transparent_24%),radial-gradient(circle_at_50%_58%,rgba(251,191,36,0.05),transparent_28%)] dark:bg-[radial-gradient(circle_at_12%_16%,rgba(56,189,248,0.09),transparent_26%),radial-gradient(circle_at_84%_14%,rgba(249,115,22,0.11),transparent_24%),radial-gradient(circle_at_50%_58%,rgba(251,191,36,0.07),transparent_28%)]" />
          <div className="pointer-events-none absolute left-[-4rem] top-24 h-52 w-52 rounded-full bg-sky-100/22 blur-[72px] dark:bg-sky-400/9" />
          <div className="pointer-events-none absolute right-[-3rem] top-52 h-60 w-60 rounded-full bg-amber-100/22 blur-[72px] dark:bg-orange-300/9" />
          <div className="pointer-events-none absolute right-[10%] bottom-16 h-44 w-44 rounded-full bg-blue-100/20 blur-[72px] dark:bg-cyan-300/9" />

          <div className="relative z-10">
            <section className="max-w-7xl mx-auto px-4 pb-4 sm:px-6 lg:px-8">
              <PartnerLogosStrip title="Partnerzy Love Bydgoszcz" className="pt-4" />
            </section>

            {/* Rolki strip — above Polecane Publikacje */}
            <ReelsStrip />

            {/* Polecane Nasze Publikacje — above Miasto */}
            <PolecanePubSection />

            {/* Generic category sections (miasto, rozrywka, gastronomia, kultura, biznes, bydgoszczanie) */}
            {categorySections.map((section, index) => (
              <CategorySection
                key={section.id}
                {...section}
                className={index === 0 ? "pt-4" : ""}
              />
            ))}

            {/* Sport — 3 articles horizontal */}
            <SportSectionHorizontal />

            {/* Polityka — 3 articles horizontal */}
            <PolitykaSectionHorizontal />

            {/* Inwestycje — 3 articles horizontal */}
            <InwestycjeSectionHorizontal />

            <HomepageFeedBand
              key="homepage-businesses-band"
              shellClassName="pt-4 pb-0"
            >
              <HomepageDirectoryFeedSections key="homepage-businesses-feed" sections={["businesses"]} backgroundClassName="bg-transparent" />
            </HomepageFeedBand>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}