import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, X, Heart, MessageCircle, Eye, Play, ChevronDown } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Comments from "@/components/Comments";
import { useIsMobile } from "@/hooks/use-mobile";
import { fetchReels, likeReel } from "@/lib/reels-api";
import { toast } from "sonner";

const categories = [
  { key: "miasto",        label: "Miasto",        color: "bg-blue-500" },
  { key: "rozrywka",      label: "Rozrywka",      color: "bg-rose-500" },
  { key: "kultura",       label: "Kultura",       color: "bg-amber-500" },
  { key: "biznes",        label: "Biznes",        color: "bg-emerald-500" },
  { key: "gastronomia",   label: "Gastronomia",   color: "bg-orange-500" },
  { key: "bydgoszczanie", label: "Bydgoszczanie", color: "bg-violet-500" },
  { key: "medyczna",      label: "Medycyna",      color: "bg-teal-500" },
  { key: "sport",         label: "Sport",         color: "bg-blue-600" },
  { key: "polityka",      label: "Polityka",      color: "bg-slate-600" },
  { key: "inwestycje",    label: "Inwestycje",    color: "bg-amber-600" },
] as const;

type CategoryKey = (typeof categories)[number]["key"];

type Reel = {
  _id: string;
  title: string;
  description?: string;
  coverImage?: string;
  author?: string;
  category?: string;
  sourceType: "upload" | "link" | "facebook" | "instagram" | "youtube";
  videoUrl: string;
  embedUrl?: string;
  likes?: number;
  views?: number;
  isActive: boolean;
  publishedAt: number;
};

function ReelCard({
  reel,
  index,
  activeIndex,
  isLiked,
  onToggleLike,
  onShowComments,
  showNextHint,
}: {
  reel: Reel;
  index: number;
  activeIndex: number;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
  onShowComments: (id: string) => void;
  showNextHint?: boolean;
}) {
  const isActive = index === activeIndex;
  const likeCount = Math.max(0, (reel.likes ?? 0) + (isLiked ? 1 : 0));

  const renderVideo = () => {
    if (reel.sourceType === "facebook" || reel.sourceType === "instagram") {
      // Embed via iframe
      const embedSrc = reel.embedUrl || reel.videoUrl;
      return (
        <iframe
          src={embedSrc}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          title={reel.title}
        />
      );
    }
    if (reel.sourceType === "youtube") {
      const embedSrc = reel.embedUrl || reel.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
      return (
        <iframe
          src={`${embedSrc}${isActive ? "?autoplay=1&mute=1" : ""}`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={reel.title}
        />
      );
    }
    // Direct video (upload or link)
    return (
      <video
        src={reel.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay={isActive}
        loop
        muted
        playsInline
        poster={reel.coverImage}
      />
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Video / Embed */}
      {renderVideo()}

      {/* Cover image fallback overlay when not active */}
      {!isActive && reel.coverImage && (
        <div className="absolute inset-0 z-10">
          <img src={reel.coverImage} alt={reel.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>
        </div>
      )}

      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

      {/* Right side actions */}
      <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-5">
        <motion.button
          type="button"
          onClick={() => onToggleLike(reel._id)}
          whileTap={{ scale: 0.85 }}
          className="flex flex-col items-center gap-1"
        >
          <div className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm border transition-all duration-200 ${isLiked ? "bg-rose-500/80 border-rose-400" : "bg-black/30 border-white/20"}`}>
            <Heart className={`w-5 h-5 transition-all duration-200 ${isLiked ? "fill-white text-white scale-110" : "text-white"}`} />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">{likeCount > 0 ? likeCount : ""}</span>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => onShowComments(reel._id)}
          whileTap={{ scale: 0.85 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/20">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">Komentarze</span>
        </motion.button>

        {(reel.views ?? 0) > 0 && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/20">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow">{reel.views}</span>
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-16 z-30 p-4 pb-6">
        {reel.author && (
          <p className="text-[13px] font-black text-white/90 mb-1">@{reel.author}</p>
        )}
        <p className="text-sm font-bold text-white leading-snug line-clamp-2 mb-1">{reel.title}</p>
        {reel.description && (
          <p className="text-xs text-white/70 line-clamp-2">{reel.description}</p>
        )}
      </div>

      {/* Next hint */}
      <AnimatePresence>
        {showNextHint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-1">
              <ChevronDown className="w-5 h-5 text-white/60 animate-bounce" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ReelsPage() {
  const { category } = useParams<{ category?: string }>();
  const isMobile = useIsMobile();
  const activeCategory: CategoryKey = categories.some((c) => c.key === category)
    ? (category as CategoryKey)
    : categories[0].key;

  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [showComments, setShowComments] = useState<string | null>(null);
  const [visibleCategoryBadge, setVisibleCategoryBadge] = useState<CategoryKey | null>(null);
  const [timerProgress, setTimerProgress] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  const [autoAdvancedCount, setAutoAdvancedCount] = useState(0);
  const [showNextHint, setShowNextHint] = useState(false);
  const progressIntervalRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const currentCategoryIndex = useMemo(
    () => Math.max(0, categories.findIndex((c) => c.key === activeCategory)),
    [activeCategory],
  );

  useEffect(() => {
    setActiveIndex(0);
    setTimerProgress(0);
    setAutoAdvancedCount(0);
    containerRef.current?.scrollTo({ top: 0, behavior: "auto" });
    setVisibleCategoryBadge(activeCategory);
    const timeout = window.setTimeout(() => setVisibleCategoryBadge(null), 850);
    return () => window.clearTimeout(timeout);
  }, [activeCategory]);

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
      try {
        const payload = await fetchReels({ category: activeCategory, limit: 20 });
        if (!isMounted) return;
        setReels(normalizeList(payload));
      } catch (error) {
        if (!isMounted) return;
        setReels([]);
        toast.error("Nie udało się pobrać rolek.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [activeCategory]);

  useEffect(() => {
    const saved = localStorage.getItem("reels_liked");
    if (!saved) return;
    try { setLiked(JSON.parse(saved)); } catch { localStorage.removeItem("reels_liked"); }
  }, []);

  useEffect(() => {
    const activeTab = tabsRef.current?.querySelector<HTMLButtonElement>(`[data-cat='${activeCategory}']`);
    activeTab?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeCategory]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      const viewportHeight = container.clientHeight || window.innerHeight;
      const idx = Math.round(container.scrollTop / viewportHeight);
      if (idx !== activeIndex && idx >= 0 && idx < (reels?.length ?? 0)) {
        setActiveIndex(idx);
        setTimerProgress(0);
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [activeIndex, reels]);

  useEffect(() => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (!reels || reels.length === 0 || isTouching || showComments) return;
    progressIntervalRef.current = window.setInterval(() => {
      setTimerProgress((prev) => {
        const next = prev + 100 / 60;
        return next >= 100 ? 100 : next;
      });
    }, 100);
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [activeIndex, activeCategory, reels, isTouching, showComments]);

  useEffect(() => {
    setShowNextHint(timerProgress >= 83);
    if (timerProgress < 100 || !reels || reels.length === 0) return;
    const isLastReel = activeIndex >= reels.length - 1;
    const reachedStep = autoAdvancedCount + 1 >= 8;
    if (!isLastReel && !reachedStep) {
      const nextIndex = activeIndex + 1;
      const viewportHeight = containerRef.current?.clientHeight || window.innerHeight;
      containerRef.current?.scrollTo({ top: nextIndex * viewportHeight, behavior: "smooth" });
      setActiveIndex(nextIndex);
      setAutoAdvancedCount((prev) => prev + 1);
      setTimerProgress(0);
      return;
    }
    if (currentCategoryIndex < categories.length - 1) {
      setTimerProgress(0);
      setAutoAdvancedCount(0);
      goToCategory(currentCategoryIndex + 1);
      return;
    }
    if (!isLastReel) {
      const nextIndex = activeIndex + 1;
      const viewportHeight = containerRef.current?.clientHeight || window.innerHeight;
      containerRef.current?.scrollTo({ top: nextIndex * viewportHeight, behavior: "smooth" });
      setActiveIndex(nextIndex);
      setTimerProgress(0);
      return;
    }
    setTimerProgress(0);
  }, [timerProgress, reels, activeIndex, autoAdvancedCount, currentCategoryIndex]);

  const goToCategory = (idx: number) => {
    const next = categories[idx];
    if (!next) return;
    navigate(next.key === categories[0].key ? "/rolka" : `/rolka/${next.key}`);
  };

  const toggleLike = async (id: string) => {
    const was = liked[id];
    const next = { ...liked, [id]: !was };
    setLiked(next);
    localStorage.setItem("reels_liked", JSON.stringify(next));
    try {
      await likeReel(id, { is_liked: !was });
    } catch (error) {
      const fallback = { ...liked, [id]: was };
      setLiked(fallback);
      localStorage.setItem("reels_liked", JSON.stringify(fallback));
      toast.error("Nie udało się zapisać polubienia.");
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsTouching(true);
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsTouching(false);
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0 && currentCategoryIndex < categories.length - 1) goToCategory(currentCategoryIndex + 1);
    if (dx > 0 && currentCategoryIndex > 0) goToCategory(currentCategoryIndex - 1);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  const activeCat = categories.find((c) => c.key === visibleCategoryBadge);

  const reelsList = (
    <>
      {reels.map((reel, index) => (
        <div key={reel._id} className="h-[100dvh] w-full snap-start snap-always">
          <ReelCard
            reel={reel as Reel}
            index={index}
            activeIndex={activeIndex}
            isLiked={!!liked[reel._id]}
            onToggleLike={toggleLike}
            onShowComments={setShowComments}
            showNextHint={showNextHint && index === activeIndex}
          />
        </div>
      ))}
      {reels.length === 0 && (
        <div className="flex h-[100dvh] items-center justify-center px-8 text-center">
          <div>
            <p className="text-lg font-black text-white">Brak rolek</p>
            <p className="mt-2 text-sm text-white/60">Przesuń w lewo lub prawo, aby zmienić kategorię.</p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress Bar */}
      <div className={`absolute z-40 h-[3px] bg-white/15 ${isMobile ? 'inset-x-0 top-0' : 'left-1/2 -translate-x-1/2 top-0 w-full max-w-[450px] rounded-t-3xl overflow-hidden'}`}>
        <motion.div
          className="h-full bg-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.6)]"
          animate={{ width: `${timerProgress}%` }}
          transition={{ duration: 0.08, ease: "linear" }}
        />
      </div>

      {/* Desktop: Centered vertical container */}
      {!isMobile && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div
            ref={containerRef}
            className="relative h-full w-full max-w-[450px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {reelsList}
          </div>
        </div>
      )}

      {/* Mobile: Full screen */}
      {isMobile && (
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {reelsList}
        </div>
      )}

      {/* Top overlay: back button + logo + category tabs */}
      <div
        className={`pointer-events-none absolute top-0 z-30 ${isMobile ? 'inset-x-0' : 'left-1/2 -translate-x-1/2 w-full max-w-[450px]'}`}
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0) 100%)" }}
      >
        <div className="pointer-events-auto px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition active:scale-90"
              aria-label="Wróć do strony głównej"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <img
              src="/logo-love-bydgoszcz.png"
              alt="Love Bydgoszcz"
              className="h-11 w-auto max-w-[13rem] object-contain drop-shadow-[0_3px_12px_rgba(0,0,0,0.6)]"
            />
            <div className="h-9 w-9 shrink-0" />
          </div>

          <div ref={tabsRef} className="mt-2.5 flex gap-1.5 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => {
              const isActiveCat = cat.key === activeCategory;
              return (
                <button
                  key={cat.key}
                  data-cat={cat.key}
                  type="button"
                  onClick={() => goToCategory(categories.findIndex((c) => c.key === cat.key))}
                  className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black transition-all duration-150 active:scale-95 ${
                    isActiveCat
                      ? `${cat.color} text-white shadow-[0_4px_16px_-6px_rgba(0,0,0,0.5)]`
                      : "bg-white/18 text-white/80 backdrop-blur-sm"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category badge flash */}
      <AnimatePresence>
        {activeCat && (
          <motion.div
            key={visibleCategoryBadge}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-white shadow-xl ${activeCat.color}`}
            >
              {activeCat.label}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments drawer */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowComments(null)}
              className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 z-50 flex h-[75%] flex-col overflow-hidden rounded-t-[2rem] bg-background shadow-[0_-24px_60px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                <h3 className="text-base font-black text-foreground">Komentarze</h3>
                <button type="button" onClick={() => setShowComments(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-95">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-background">
                <Comments targetId={showComments} targetType="article" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}