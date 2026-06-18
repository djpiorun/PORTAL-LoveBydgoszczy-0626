import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";

interface StoryItem {
  type: "image" | "video" | "facebook_reel";
  url: string;
  duration?: number;
  text?: string;
  link?: string;
}

interface Story {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  items: StoryItem[];
}

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
}

function getFacebookSourceUrl(rawValue: string) {
  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const candidate = iframeSrcMatch?.[1]?.trim() || trimmed;

  if (!candidate) return null;

  if (candidate.includes("facebook.com/plugins/video.php")) {
    try {
      const parsed = new URL(candidate);
      const href = parsed.searchParams.get("href");
      return href ? decodeURIComponent(href) : candidate;
    } catch {
      return candidate;
    }
  }

  if (candidate.includes("facebook.com/")) {
    return candidate;
  }

  return null;
}

function getFacebookEmbedUrl(rawValue: string) {
  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const iframeSrc = iframeSrcMatch?.[1]?.trim();
  if (iframeSrc) {
    try {
      const parsed = new URL(iframeSrc);
      parsed.searchParams.set("show_text", "false");
      parsed.searchParams.set("autoplay", "true");
      parsed.searchParams.set("mute", "1");
      return parsed.toString();
    } catch {
      return iframeSrc;
    }
  }

  const sourceUrl = getFacebookSourceUrl(rawValue);
  if (!sourceUrl) return null;

  try {
    const isReelLike =
      sourceUrl.includes("/reel/") ||
      sourceUrl.includes("/share/r/") ||
      sourceUrl.includes("/posts/");
    const embedUrl = new URL(
      isReelLike
        ? "https://www.facebook.com/plugins/post.php"
        : "https://www.facebook.com/plugins/video.php",
    );
    embedUrl.searchParams.set("href", sourceUrl);
    if (isReelLike) {
      embedUrl.searchParams.set("show_text", "false");
      embedUrl.searchParams.set("width", "560");
    } else {
      embedUrl.searchParams.set("show_text", "false");
      embedUrl.searchParams.set("autoplay", "true");
      embedUrl.searchParams.set("mute", "1");
    }
    return embedUrl.toString();
  } catch {
    return null;
  }
}

export default function StoryViewer({ stories, initialStoryIndex, onClose }: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [videoRuntime, setVideoRuntime] = useState({ duration: 0, currentTime: 0, ready: false });
  const [facebookCountdown, setFacebookCountdown] = useState(5);
  const [facebookActivated, setFacebookActivated] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentStory = stories[currentStoryIndex];
  const currentItem = currentStory?.items[currentItemIndex];
  const facebookEmbedUrl = useMemo(
    () => (currentItem?.type === "facebook_reel" ? getFacebookEmbedUrl(currentItem.url) : null),
    [currentItem],
  );
  const isFacebookReel = currentItem?.type === "facebook_reel";

  const goToNextItem = useCallback(() => {
    if (!currentStory) return;

    if (currentItemIndex < currentStory.items.length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
      setProgress(0);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setCurrentItemIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentItemIndex, currentStory, currentStoryIndex, stories.length, onClose]);

  const goToPrevItem = useCallback(() => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setCurrentItemIndex(stories[currentStoryIndex - 1].items.length - 1);
      setProgress(0);
    }
  }, [currentItemIndex, currentStoryIndex, stories]);

  useEffect(() => {
    setVideoRuntime({ duration: 0, currentTime: 0, ready: false });
    setFacebookCountdown(5);
    setFacebookActivated(false);
  }, [currentStoryIndex, currentItemIndex]);

  useEffect(() => {
    if (!isFacebookReel || facebookActivated) return;

    const timer = window.setInterval(() => {
      setFacebookCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          goToNextItem();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [facebookActivated, goToNextItem, isFacebookReel]);

  useEffect(() => {
    if (isPaused || !currentItem) return;

    const useNaturalVideoDuration = currentItem.type === "video" && !currentItem.duration;
    if (useNaturalVideoDuration) {
      return;
    }

    const fallbackDurationSeconds =
      currentItem.type === "facebook_reel" ? 15 : currentItem.duration || 5;
    const duration = fallbackDurationSeconds * 1000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          window.clearInterval(timer);
          goToNextItem();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => window.clearInterval(timer);
  }, [currentItem, goToNextItem, isPaused, videoRuntime.ready]);

  useEffect(() => {
    setIsMounted(true);

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  if (!currentStory || !currentItem || !isMounted) return null;

  const backgroundImageUrl =
    currentItem.type === "image" ? currentItem.url : currentStory.coverImage;

  return createPortal(
    <div className="fixed inset-0 z-[260] flex items-center justify-center overflow-hidden overscroll-none bg-slate-950/70 backdrop-blur-2xl">
      {isFacebookReel ? (
        <div className="absolute inset-0 bg-black" />
      ) : (
        <>
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-35 blur-3xl"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.22),rgba(2,6,23,0.82))]" />
        </>
      )}

      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-black shadow-2xl sm:h-[90vh] sm:rounded-[2rem]">
        <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 bg-gradient-to-b from-black/60 to-transparent p-4 pt-6">
          {currentStory.items.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30 backdrop-blur-sm">
              <div
                className="h-full bg-white transition-all duration-75 ease-linear"
                style={{
                  width: idx === currentItemIndex ? `${progress}%` : idx < currentItemIndex ? "100%" : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute left-0 right-0 top-10 z-20 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {!isFacebookReel && (
              <>
                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white/50">
                  <img src={currentStory.coverImage} alt={currentStory.author} className="h-full w-full object-cover" />
                </div>
                <div className="text-white drop-shadow-md">
                  <p className="text-sm font-bold leading-tight">{currentStory.author}</p>
                  <p className="text-xs text-white/80">{currentStory.title}</p>
                </div>
              </>
            )}
          </div>
          {!isFacebookReel && (
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        <div
          className="relative flex-1"
          onPointerDown={() => setIsPaused(true)}
          onPointerUp={() => setIsPaused(false)}
          onPointerLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentStoryIndex}-${currentItemIndex}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {currentItem.type === "image" ? (
                <img src={currentItem.url} alt="Story content" className="h-full w-full object-cover" />
              ) : currentItem.type === "facebook_reel" ? (
                <div className="flex h-full w-full items-center justify-center bg-black px-0 py-0">
                  {facebookEmbedUrl ? (
                    <div className="relative z-20 h-full w-full">
                      <div className="h-full w-full overflow-hidden bg-black shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                        <iframe
                          src={facebookEmbedUrl}
                          title="Facebook Reel"
                          className="h-full w-full border-0"
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          referrerPolicy="origin-when-cross-origin"
                          scrolling="no"
                          allowFullScreen
                        />
                      </div>
                      <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-black/52 text-white backdrop-blur-md transition-colors hover:bg-black/68"
                        aria-label="Zamknij rolkę"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      {!facebookActivated && (
                        <button
                          type="button"
                          onClick={() => setFacebookActivated(true)}
                          className="absolute inset-0 z-30 bg-black/18 transition-colors hover:bg-black/10"
                          aria-label="Odtwórz rolkę Facebook"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-center text-white">
                      <p className="text-lg font-bold">Nie udało się osadzić tej rolki</p>
                      <p className="mt-2 text-sm text-white/70">Otwórz materiał bezpośrednio na Facebooku.</p>
                    </div>
                  )}
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={currentItem.url}
                  autoPlay
                  playsInline
                  muted
                  preload="metadata"
                  className="h-full w-full object-cover"
                  onLoadedMetadata={(event) => {
                    const duration = Number(event.currentTarget.duration || 0);
                    setVideoRuntime({
                      duration,
                      currentTime: Number(event.currentTarget.currentTime || 0),
                      ready: Number.isFinite(duration) && duration > 0,
                    });
                  }}
                  onTimeUpdate={(event) => {
                    if (currentItem.duration) return;
                    const duration = Number(event.currentTarget.duration || 0);
                    const currentTime = Number(event.currentTarget.currentTime || 0);
                    if (!Number.isFinite(duration) || duration <= 0) return;
                    setVideoRuntime({ duration, currentTime, ready: true });
                    setProgress(Math.min((currentTime / duration) * 100, 100));
                  }}
                  onEnded={() => {
                    goToNextItem();
                  }}
                />
              )}

              {currentItem.type === "facebook_reel" ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-90" />
              ) : (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
              )}

              {currentItem.text && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="absolute left-0 right-0 z-20 px-5 text-center"
                  style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
                >
                  <div className="inline-block max-w-[92%] rounded-2xl border border-white/10 bg-black/50 px-5 py-3 text-[15px] font-medium leading-snug text-white shadow-2xl backdrop-blur-md">
                    {currentItem.text}
                  </div>
                </motion.div>
              )}

              {(currentItem.link || currentItem.type === "facebook_reel") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute bottom-8 left-0 right-0 z-30 flex justify-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <a
                      href={currentItem.link || currentItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/36 px-4 py-2 text-white shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-md transition-colors hover:bg-black/54"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest drop-shadow-md">Zobacz więcej</span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-950 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    </a>
                    {currentItem.type === "facebook_reel" && !facebookActivated && (
                      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-white/82 backdrop-blur-md">
                        <span className="text-[11px] font-semibold">Automatyczne przejście za</span>
                        <span className="min-w-7 rounded-full bg-white px-2 py-0.5 text-center text-sm font-black text-slate-950">
                          {facebookCountdown}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {!isFacebookReel && (
            <>
              <div className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer" onClick={goToPrevItem} />
              <div className="absolute inset-y-0 right-0 z-10 w-2/3 cursor-pointer" onClick={goToNextItem} />
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
