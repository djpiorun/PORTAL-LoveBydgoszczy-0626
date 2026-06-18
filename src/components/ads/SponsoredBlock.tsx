import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { ExternalLink, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SponsoredBlockProps {
  placement: string;
  className?: string;
}

export default function SponsoredBlock({ placement, className = "" }: SponsoredBlockProps) {
  const ads = useQuery(api.ads.getAdsByPlacement, { placementSystemName: placement });
  const trackImpression = useMutation(api.ads.trackImpression);
  const trackClick = useMutation(api.ads.trackClick);
  const ref = useRef<HTMLDivElement>(null);
  const [impressed, setImpressed] = useState(false);

  useEffect(() => {
    if (!ref.current || impressed || !ads || ads.length === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !impressed) {
          setImpressed(true);
          ads.forEach(ad => trackImpression({ creativeId: ad._id }));
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [impressed, ads, trackImpression]);

  if (ads === undefined || ads.length === 0) return null;

  return (
    <div ref={ref} className={`py-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Materiały sponsorowane</span>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.slice(0, 3).map((ad, i) => (
          <motion.div
            key={ad._id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
            onClick={() => {
              trackClick({ creativeId: ad._id });
              if (ad.targetUrl) window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
            }}
          >
            {(ad.desktopImageUrl || ad.mobileImageUrl) && (
              <div className="h-32 overflow-hidden">
                <img
                  src={ad.desktopImageUrl || ad.mobileImageUrl}
                  alt={ad.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                />
              </div>
            )}
            <div className="p-4">
              <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1">Sponsor</div>
              <h4 className="text-sm font-bold text-slate-800 line-clamp-2">{ad.name}</h4>
              {ad.content && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ad.content}</p>}
              {ad.targetUrl && (
                <div className="flex items-center gap-1 mt-2 text-xs text-amber-700 font-semibold">
                  <ExternalLink className="w-3 h-3" /> Więcej
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
