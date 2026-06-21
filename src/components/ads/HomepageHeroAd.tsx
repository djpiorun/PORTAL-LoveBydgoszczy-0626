import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

const normalizeCreative = (creative: any) => ({
  _id: String(creative?.id ?? creative?._id ?? ""),
  name: creative?.name ?? "",
  content: creative?.content ?? creative?.html ?? null,
  desktopImageUrl: creative?.desktopImageUrl ?? creative?.desktop_image_url ?? creative?.image_url ?? creative?.imageUrl ?? null,
  mobileImageUrl: creative?.mobileImageUrl ?? creative?.mobile_image_url ?? null,
  targetUrl: creative?.targetUrl ?? creative?.target_url ?? null,
});

const normalizeAdsPayload = (payload: any) => {
  const data = payload?.data ?? payload?.ads ?? payload?.results ?? payload ?? [];
  return Array.isArray(data) ? data.map(normalizeCreative) : [];
};

export default function HomepageHeroAd() {
  const [ads, setAds] = useState<any[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [impressed, setImpressed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const trackImpression = useCallback(async (creativeId: string) => {
    if (!creativeId) return;
    try {
      await apiFetch("/ads/track-impression", {
        method: "POST",
        body: { creative_id: creativeId },
      });
    } catch (error) {
      console.warn("Ads impression tracking unavailable", error);
    }
  }, []);

  const trackClick = useCallback(async (creativeId: string) => {
    if (!creativeId) return;
    try {
      await apiFetch("/ads/track-click", {
        method: "POST",
        body: { creative_id: creativeId },
      });
    } catch (error) {
      console.warn("Ads click tracking unavailable", error);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadAds = async () => {
      try {
        const payload = await apiFetch("/ads?placement=home_top_banner");
        if (!active) return;
        setAds(normalizeAdsPayload(payload));
      } catch (error) {
        if (!active) return;
        setAds([]);
        toast.warning("Reklamy są chwilowo niedostępne.");
      }
    };

    loadAds();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ref.current || impressed || !ads || ads.length === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !impressed) {
          setImpressed(true);
          trackImpression(ads[0]._id);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [impressed, ads, trackImpression]);

  if (ads === null) {
    return (
      <section className="relative z-20 overflow-visible px-4 pt-24 pb-1 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl h-2" />
      </section>
    );
  }

  if (ads.length === 0 || dismissed) {
    return (
      <section className="relative z-20 overflow-visible px-4 pt-24 pb-1 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl h-2" />
      </section>
    );
  }

  const ad = ads[0];
  const imgUrl = ad.desktopImageUrl || ad.mobileImageUrl;

  if (!imgUrl && !ad.content) return null;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-20 overflow-visible px-4 pt-24 pb-1 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 rounded-[28px] border border-slate-200/80 bg-white/95 px-3 py-2 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-700/70 dark:bg-slate-950/68 dark:shadow-[0_18px_48px_-24px_rgba(0,0,0,0.8)] sm:px-4">
        <div className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-slate-500 dark:bg-slate-800/88 dark:text-slate-200">
          Reklama
        </div>
        <div
          className="flex min-w-0 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-slate-50/80 px-2 py-1 dark:bg-slate-900/70"
          onClick={() => {
            trackClick(ad._id);
            if (ad.targetUrl) window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
          }}
        >
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={ad.name}
              className="h-10 w-full object-contain sm:h-12"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="truncate text-sm font-semibold text-slate-700 transition-colors hover:text-primary dark:text-slate-100">{ad.name}</div>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          <X className="w-3 h-3 text-slate-500 dark:text-slate-100" />
        </button>
      </div>
    </motion.section>
  );
}