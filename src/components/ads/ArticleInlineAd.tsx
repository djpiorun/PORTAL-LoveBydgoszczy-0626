import AdSlot from "./AdSlot";
import SponsoredBlock from "./SponsoredBlock";

interface ArticleInlineAdProps {
  placement: string;
  variant?: "banner" | "sponsored";
  className?: string;
}

export default function ArticleInlineAd({ placement, variant = "banner", className = "" }: ArticleInlineAdProps) {
  if (variant === "sponsored") {
    return <SponsoredBlock placement={placement} className={className} />;
  }

  return (
    <div className={`my-8 ${className}`}>
      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Reklama</div>
      <AdSlot placement={placement} className="w-full" />
    </div>
  );
}
