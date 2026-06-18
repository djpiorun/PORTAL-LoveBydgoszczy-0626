import { CloudSun, Menu, Search } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { fetchBydgoszczWeather, toWeatherSummary } from "@/lib/weather";
import type { WeatherSummary } from "@/lib/weather";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router";

function WeatherChipSmall() {
  const [w, setW] = useState<WeatherSummary | null>(null);
  const nav = useNavigate();
  useEffect(() => {
    fetchBydgoszczWeather().then(d => { if (d) setW(toWeatherSummary(d)); }).catch(() => undefined);
  }, []);
  return (
    <button
      type="button"
      onClick={() => nav("/pogoda")}
      className="flex h-8 items-center gap-1.5 rounded-full bg-sky-500/12 px-3 text-[11px] font-bold text-sky-700 transition-all active:scale-95 dark:bg-sky-400/20 dark:text-sky-200"
    >
      <CloudSun className="h-3.5 w-3.5" />
      {w ? `${w.temp}°C` : "—"}
    </button>
  );
}

interface MobileTopBarProps {
  onMenuOpen?: () => void;
}

export default function MobileTopBar({ onMenuOpen }: MobileTopBarProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Don't render on desktop or admin pages
  if (!isMobile) return null;
  if (location.pathname.startsWith("/panel")) return null;

  const today = new Date();
  const dayName = today.toLocaleDateString("pl-PL", { weekday: "long" });
  const dateStr = today.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });

  const handleMenuClick = () => {
    if (onMenuOpen) {
      onMenuOpen();
    }
  };

  return (
    <div
      className="sticky top-0 z-[120] bg-background/95 border-b border-border/20"
      style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      {/* Logo row — centered */}
      <div className="flex items-center justify-center px-4 pt-3 pb-1 relative">
        <Link to="/" className="flex items-center justify-center">
          <img
            src="/assets/logo-lovebydgoszcz.png"
            alt="Love Bydgoszcz"
            className="h-10 w-auto object-contain block"
            style={{ maxWidth: "180px" }}
          />
        </Link>
      </div>
      {/* Bottom row: date left, weather+search+menu right */}
      <div className="flex items-center justify-between px-4 pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold capitalize text-foreground/45">{dayName},</span>
          <span className="text-[10px] font-bold capitalize text-foreground/65">{dateStr}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <WeatherChipSmall />
          <Link
            to="/szukaj"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-card/80 active:scale-90 transition"
          >
            <Search className="h-3.5 w-3.5 text-foreground/70" />
          </Link>
          {onMenuOpen && (
            <button
              type="button"
              onClick={handleMenuClick}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-card/80 active:scale-90 transition"
            >
              <Menu className="h-3.5 w-3.5 text-foreground/70" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
