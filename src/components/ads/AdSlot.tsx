import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

interface AdSlotProps {
  placement: string;
  className?: string;
  fallback?: React.ReactNode;
}

function CreativeRenderer({ creative, onImpression, onClick }: {
  creative: any;
  onImpression: () => void;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [impressed, setImpressed] = useState(false);

  useEffect(() => {
    if (!ref.current || impressed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !impressed) {
          setImpressed(true);
          onImpression();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [impressed, onImpression]);

  const handleClick = () => {
    onClick();
    if (creative.targetUrl) {
      window.open(creative.targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const type = creative.type || "banner";

  if (type === "banner" || type === "image") {
    const imgUrl = creative.desktopImageUrl || creative.mobileImageUrl || creative.content;
    if (!imgUrl) return null;
    return (
      <div ref={ref} className="relative group cursor-pointer overflow-hidden rounded-xl" onClick={handleClick}>
        <img
          src={imgUrl}
          alt={creative.name}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
          Reklama
        </div>
      </div>
    );
  }

  if (type === "html" || type === "embed") {
    if (!creative.content) return null;
    return (
      <div ref={ref} className="relative">
        <div dangerouslySetInnerHTML={{ __html: creative.content }} />
        <div className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          Reklama
        </div>
      </div>
    );
  }

  if (type === "text") {
    return (
      <div ref={ref} className="relative group cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-primary/40 transition-colors" onClick={handleClick}>
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reklama</div>
        <p className="text-sm font-semibold text-slate-800">{creative.name}</p>
        {creative.content && <p className="text-xs text-slate-500 mt-1">{creative.content}</p>}
        {creative.targetUrl && (
          <div className="flex items-center gap-1 mt-2 text-xs text-primary font-medium">
            <ExternalLink className="w-3 h-3" /> Dowiedz się więcej
          </div>
        )}
      </div>
    );
  }

  if (type === "logo" || type === "partner") {
    const imgUrl = creative.desktopImageUrl || creative.mobileImageUrl || creative.content;
    if (!imgUrl) return null;
    return (
      <div ref={ref} className="cursor-pointer flex items-center justify-center p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all" onClick={handleClick}>
        <img
          src={imgUrl}
          alt={creative.name}
          className="max-h-12 w-auto object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>
    );
  }

  if (type === "sponsored" || type === "sponsored_article") {
    return (
      <div ref={ref} className="relative group cursor-pointer p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl hover:shadow-lg transition-all" onClick={handleClick}>
        <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
          Materiał sponsorowany
        </div>
        <p className="text-sm font-bold text-slate-800">{creative.name}</p>
        {creative.content && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{creative.content}</p>}
        {creative.targetUrl && (
          <div className="flex items-center gap-1 mt-3 text-xs text-amber-700 font-semibold">
            <ExternalLink className="w-3 h-3" /> Czytaj więcej
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default function AdSlot({ placement, className = "", fallback }: AdSlotProps) {
  const ads = useQuery(api.ads.getAdsByPlacement, { placementSystemName: placement });
  const trackImpression = useMutation(api.ads.trackImpression);
  const trackClick = useMutation(api.ads.trackClick);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!ads || ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [ads]);

  if (ads === undefined) return null;
  if (ads.length === 0) return fallback ? <>{fallback}</> : null;

  const creative = ads[currentIndex % ads.length];
  if (!creative) return null;

  return (
    <div className={className}>
      <CreativeRenderer
        creative={creative}
        onImpression={() => trackImpression({ creativeId: creative._id })}
        onClick={() => trackClick({ creativeId: creative._id })}
      />
    </div>
  );
}
