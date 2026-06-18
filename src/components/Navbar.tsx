import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, Bell, Users, Heart, TramFront, CloudSun, HeartPulse,
  PlaySquare, Search, Menu, X, Sun, Moon, ChevronDown, Trophy,
  Building2, HardHat, Target, MoreHorizontal, Mail, Phone, MapPin,
  Utensils, Music, Laugh, Briefcase, LucideIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const ICON_MAP: Record<string, LucideIcon> = {
  Newspaper, Bell, Users, Heart, TramFront, CloudSun, HeartPulse,
  Trophy, Building2, HardHat, Target, Mail, Phone, MapPin,
  Utensils, Music, Laugh, Briefcase, MoreHorizontal, ChevronDown,
};
function resolveIcon(name: string): LucideIcon { return ICON_MAP[name] ?? Newspaper; }

const CATEGORY_COLORS: Record<string, { active: string; dot: string; hoverBg: string; hoverText: string; hoverIcon: string; accent: string }> = {
  "/sport":           { active: "bg-blue-600 text-white",    dot: "bg-blue-500",    hoverBg: "hover:bg-blue-600 hover:text-white",    hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",    hoverIcon: "group-hover:text-blue-600 dark:group-hover:text-blue-400",    accent: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  "/polityka":        { active: "bg-slate-700 text-white",   dot: "bg-slate-500",   hoverBg: "hover:bg-slate-700 hover:text-white",   hoverText: "group-hover:text-slate-700 dark:group-hover:text-slate-300",  hoverIcon: "group-hover:text-slate-700 dark:group-hover:text-slate-300",  accent: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  "/inwestycje":      { active: "bg-orange-600 text-white",  dot: "bg-orange-500",  hoverBg: "hover:bg-orange-600 hover:text-white",  hoverText: "group-hover:text-orange-600 dark:group-hover:text-orange-400", hoverIcon: "group-hover:text-orange-600 dark:group-hover:text-orange-400", accent: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  "/nasze-dzialania": { active: "bg-emerald-600 text-white", dot: "bg-emerald-500", hoverBg: "hover:bg-emerald-600 hover:text-white", hoverText: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400", hoverIcon: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400", accent: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  "/nasze_dzialania": { active: "bg-emerald-600 text-white", dot: "bg-emerald-500", hoverBg: "hover:bg-emerald-600 hover:text-white", hoverText: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400", hoverIcon: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400", accent: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  "/medyczna":        { active: "bg-teal-600 text-white",    dot: "bg-teal-500",    hoverBg: "hover:bg-teal-600 hover:text-white",    hoverText: "group-hover:text-teal-600 dark:group-hover:text-teal-400",    hoverIcon: "group-hover:text-teal-600 dark:group-hover:text-teal-400",    accent: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
  "/kontakt":         { active: "bg-rose-600 text-white",    dot: "bg-rose-500",    hoverBg: "hover:bg-rose-600 hover:text-white",    hoverText: "group-hover:text-rose-600 dark:group-hover:text-rose-400",    hoverIcon: "group-hover:text-rose-600 dark:group-hover:text-rose-400",    accent: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  "/kultura":         { active: "bg-violet-600 text-white",  dot: "bg-violet-500",  hoverBg: "hover:bg-violet-600 hover:text-white",  hoverText: "group-hover:text-violet-600 dark:group-hover:text-violet-400", hoverIcon: "group-hover:text-violet-600 dark:group-hover:text-violet-400", accent: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  "/gastronomia":     { active: "bg-amber-600 text-white",   dot: "bg-amber-500",   hoverBg: "hover:bg-amber-600 hover:text-white",   hoverText: "group-hover:text-amber-600 dark:group-hover:text-amber-400",  hoverIcon: "group-hover:text-amber-600 dark:group-hover:text-amber-400",  accent: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  "/rozrywka":        { active: "bg-pink-600 text-white",    dot: "bg-pink-500",    hoverBg: "hover:bg-pink-600 hover:text-white",    hoverText: "group-hover:text-pink-600 dark:group-hover:text-pink-400",    hoverIcon: "group-hover:text-pink-600 dark:group-hover:text-pink-400",    accent: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  "/biznes":          { active: "bg-cyan-700 text-white",    dot: "bg-cyan-600",    hoverBg: "hover:bg-cyan-700 hover:text-white",    hoverText: "group-hover:text-cyan-700 dark:group-hover:text-cyan-400",    hoverIcon: "group-hover:text-cyan-700 dark:group-hover:text-cyan-400",    accent: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" },
  "/aktualizacje":    { active: "bg-indigo-600 text-white",  dot: "bg-indigo-500",  hoverBg: "hover:bg-indigo-600 hover:text-white",  hoverText: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400", hoverIcon: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400", accent: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  "/miasto":          { active: "bg-primary text-primary-foreground", dot: "bg-primary", hoverBg: "hover:bg-primary hover:text-primary-foreground", hoverText: "group-hover:text-primary", hoverIcon: "group-hover:text-primary", accent: "bg-primary/15 text-primary" },
};
const DEFAULT_CFG = { active: "bg-primary text-primary-foreground", dot: "bg-primary", hoverBg: "hover:bg-primary hover:text-primary-foreground", hoverText: "group-hover:text-primary", hoverIcon: "group-hover:text-primary", accent: "bg-primary/15 text-primary" };

function getCfg(pathname: string) {
  const match = Object.keys(CATEGORY_COLORS).find(k => pathname === k || pathname.startsWith(k + "/"));
  return match ? CATEGORY_COLORS[match] : DEFAULT_CFG;
}

// Pages that have dark hero backgrounds (transparent nav looks good at top)
const DARK_HERO_PAGES = ["/", "/sport", "/inwestycje", "/polityka", "/nasze-dzialania", "/nasze_dzialania", "/nekrolog", "/pogoda", "/rozklad-jazdy", "/rozklad", "/aktualizacje", "/miasto", "/biznes", "/kultura", "/gastronomia", "/rozrywka", "/medyczna", "/bydgoszczanie", "/autor"];

// Pages where nav text should be white (dark colored hero backgrounds)
const WHITE_TEXT_PAGES = ["/sport", "/inwestycje", "/polityka", "/nasze-dzialania", "/nasze_dzialania"];

function hasDarkHero(pathname: string): boolean {
  return DARK_HERO_PAGES.some(p => pathname === p || pathname.startsWith(p + "/"));
}

function hasWhiteNavText(pathname: string): boolean {
  return WHITE_TEXT_PAGES.some(p => pathname === p || pathname.startsWith(p + "/"));
}

type NavItem = { name: string; path: string; icon: LucideIcon; tooltip?: string; desc?: string };

const ROW1_ITEMS: NavItem[] = [
  { name: "Wiadomości",  path: "/miasto",      icon: Newspaper,  tooltip: "Najnowsze miejskie informacje" },
  { name: "Aktualizacje",path: "/aktualizacje",icon: Bell,       tooltip: "Bieżące aktualizacje portalu" },
  { name: "Rozrywka",    path: "/rozrywka",    icon: Laugh,      tooltip: "Czas wolny i atrakcje" },
  { name: "Kultura",     path: "/kultura",     icon: Music,      tooltip: "Wydarzenia, sztuka i lokalne życie" },
  { name: "Gastronomia", path: "/gastronomia", icon: Utensils,   tooltip: "Kuchnia bydgoska w jednym miejscu" },
  { name: "Medycyna",    path: "/medyczna",    icon: HeartPulse, tooltip: "Zdrowie i medycyna w mieście" },
];

const ROW2_ITEMS: NavItem[] = [
  { name: "Biznes",    path: "/biznes",    icon: Briefcase, tooltip: "Lokalna gospodarka i przedsiębiorczość" },
  { name: "Sport",     path: "/sport",     icon: Trophy,    tooltip: "Miejska kultura sportu i wyniki" },
  { name: "Inwestycje",path: "/inwestycje",icon: HardHat,   tooltip: "Rozwój miasta i najważniejsze zmiany" },
  { name: "Polityka",  path: "/polityka",  icon: Building2, tooltip: "Sprawy miasta, decyzje i ludzie" },
];

const MORE_ITEMS: NavItem[] = [
  { name: "Nasze Działania", path: "/nasze-dzialania", icon: Target,    desc: "To, co robimy lokalnie" },
  { name: "Bydgoszczanie",   path: "/bydgoszczanie",   icon: Users,     desc: "Ludzie i społeczność" },
  { name: "Nekrologi",       path: "/nekrolog",        icon: Heart,     desc: "Strefa Pamięci" },
  { name: "Transport",       path: "/rozklad-jazdy",   icon: TramFront, desc: "Rozkład jazdy MZK" },
  { name: "Pogoda",          path: "/pogoda",          icon: CloudSun,  desc: "Aktualna pogoda" },
];

const KONTAKT_ITEMS: NavItem[] = [
  { name: "Nasze Działania", path: "/nasze-dzialania", icon: Target, desc: "To, co robimy lokalnie" },
  { name: "Napisz do nas", path: "/kontakt", icon: Mail, desc: "Formularz kontaktowy" },
];

// Tooltip — rendered via portal to avoid stacking context issues
function NavTooltip({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.92 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      style={{ zIndex: 9999, position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "8px", pointerEvents: "none" }}
    >
      <div className="relative whitespace-nowrap rounded-lg border border-border/70 bg-card/98 px-2.5 py-1 text-[10.5px] font-semibold text-foreground shadow-xl backdrop-blur-md">
        {text}
        <div className="absolute -top-[4px] left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-card border-l border-t border-border/70" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
      </div>
    </motion.div>
  );
}

// Row 1 NavBtn — fills with category color on hover
function Row1Btn({ link, isActive, onClick, index, onDarkHero = false }: {
  link: NavItem; isActive: boolean; onClick: () => void; index: number; onDarkHero?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const cfg = getCfg(link.path);
  const Icon = link.icon;

  return (
    <div
      style={{ position: "relative", flexShrink: 0, zIndex: hovered ? 9998 : "auto" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-bold transition-all duration-200 ${
          isActive
            ? `${cfg.active} shadow-sm`
            : onDarkHero
              ? `text-white/90 hover:bg-white/15 hover:text-white`
              : `text-foreground/80 dark:text-white/80 ${cfg.hoverBg}`
        }`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="whitespace-nowrap">{link.name}</span>
      </motion.button>
      <AnimatePresence>
        {hovered && link.tooltip && !isActive && (
          <NavTooltip text={link.tooltip} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Row 2 NavBtn — text + icon turn category color on hover
function Row2Btn({ link, isActive, onClick, index, onDarkHero = false }: {
  link: NavItem; isActive: boolean; onClick: () => void; index: number; onDarkHero?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const cfg = getCfg(link.path);
  const Icon = link.icon;

  return (
    <div
      style={{ position: "relative", flexShrink: 0, zIndex: hovered ? 9998 : "auto" }}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[12px] font-bold transition-all duration-200 ${
          isActive
            ? `${cfg.active} shadow-sm`
            : onDarkHero
              ? "text-white/80 hover:bg-white/15 hover:text-white"
              : "text-foreground/65 dark:text-white/60 hover:bg-muted/60 dark:hover:bg-white/8"
        }`}
      >
        <Icon className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${!isActive && !onDarkHero ? cfg.hoverIcon : ""}`} />
        <span className={`whitespace-nowrap transition-colors duration-200 ${!isActive && !onDarkHero ? cfg.hoverText : ""}`}>{link.name}</span>
      </motion.button>
      <AnimatePresence>
        {hovered && link.tooltip && !isActive && (
          <NavTooltip text={link.tooltip} />
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownPanel({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{ zIndex: 9990 }}
      className={`absolute top-full mt-2 rounded-2xl border border-border/60 bg-card/98 p-2 shadow-2xl backdrop-blur-xl ${
        align === "right" ? "right-0" : "left-0"
      }`}
    >
      {children}
    </motion.div>
  );
}

function DropdownItem({ icon: Icon, name, desc, isActive, activeClass, onClick, accentClass }: {
  icon: LucideIcon; name: string; desc?: string; isActive: boolean; activeClass?: string; onClick: () => void; accentClass?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 2 }}
      whileTap={{ scale: 0.98 }}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
        isActive ? `${activeClass ?? "bg-primary text-primary-foreground"}` : "text-foreground hover:bg-muted/80"
      }`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
        isActive ? "bg-white/20" : `${accentClass ?? "bg-muted"} group-hover:scale-110`
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-left flex-1 min-w-0">
        <div className="font-semibold leading-tight text-[13px]">{name}</div>
        {desc && <div className={`text-[11px] mt-0.5 leading-tight ${isActive ? "opacity-70" : "text-muted-foreground"}`}>{desc}</div>}
      </div>
    </motion.button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNightMode, setIsNightMode] = useState(false);
  const [moreOpen, setMoreOpen]       = useState(false);
  const [kontaktOpen, setKontaktOpen] = useState(false);
  const moreRef    = useRef<HTMLDivElement>(null);
  const kontaktRef = useRef<HTMLDivElement>(null);
  const navigate   = useNavigate();
  const location   = useLocation();
  const isMobile   = useIsMobile();

  const navData = useQuery(api.menuItems.getNavData);
  const menuData = navData?.menuItems;
  const pageMenuLinksData = navData?.menuPages ?? [];
  const hasConvexData = menuData !== undefined && menuData.length > 0;

  const moreLinks: NavItem[] = hasConvexData
    ? menuData!.filter(i => i.placement === "more" && i.isActive).sort((a, b) => a.order - b.order)
        .map(i => ({ name: i.label, path: i.path, icon: resolveIcon(i.icon), tooltip: i.tooltip, desc: i.tooltip }))
    : MORE_ITEMS;

  const pageMenuLinks: NavItem[] = pageMenuLinksData.map((page: (typeof pageMenuLinksData)[number]) => ({
    name: page.title,
    path: `/${page.slug}`,
    icon: Newspaper,
    desc: page.excerpt ?? "Strona informacyjna portalu",
  }));

  const kontaktLinksBase: NavItem[] = hasConvexData
    ? menuData!.filter(i => i.placement === "kontakt" && i.isActive).sort((a, b) => a.order - b.order)
        .map(i => ({ name: i.label, path: i.path, icon: resolveIcon(i.icon), tooltip: i.tooltip, desc: i.tooltip }))
    : KONTAKT_ITEMS;

  const kontaktLinks: NavItem[] = [...kontaktLinksBase, ...pageMenuLinks];
  const allLinks: NavItem[] = [...ROW1_ITEMS, ...ROW2_ITEMS, ...moreLinks, ...pageMenuLinks, { name: "Kontakt", path: "/kontakt", icon: Mail }];

  useEffect(() => {
    const saved = window.localStorage.getItem("lovebydgoszcz-theme");
    const dark = saved === "night";
    document.documentElement.classList.toggle("dark", dark);
    setIsNightMode(dark);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (kontaktRef.current && !kontaktRef.current.contains(e.target as Node)) setKontaktOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false); setMoreOpen(false); setKontaktOpen(false);
  }, [location.pathname]);

  const toggleTheme = useCallback(() => {
    const next = !isNightMode;
    setIsNightMode(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("lovebydgoszcz-theme", next ? "night" : "day");
  }, [isNightMode]);

  const goTo = useCallback((path: string) => {
    setMobileOpen(false); setMoreOpen(false); setKontaktOpen(false);
    navigate(path);
    window.scrollTo({ top: 0 });
  }, [navigate]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/szukaj?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false); setSearchQuery("");
    }
  };

  const isMoreActive = moreLinks.some(l => location.pathname === l.path || location.pathname.startsWith(l.path + "/"));
  const isKontaktActive =
    location.pathname === "/kontakt" || location.pathname.startsWith("/kontakt/");

  // Transparent at top only on pages with dark hero backgrounds; frosted glass on light pages or when scrolled
  const isDarkHero = hasDarkHero(location.pathname);
  const showGlass = scrolled || !isDarkHero;
  // On specific category pages at top (not scrolled), nav text should be white
  const onDarkHeroAtTop = hasWhiteNavText(location.pathname) && !scrolled;

  const renderDropdowns = () => (
    <>
      {/* Więcej */}
      <div ref={moreRef} style={{ position: "relative", flexShrink: 0 }}
        onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}
      >
        <motion.button
          onClick={() => setMoreOpen(v => !v)}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-all duration-200 border ${
            isMoreActive || moreOpen
              ? onDarkHeroAtTop
                ? "bg-white/20 text-white border-white/30"
                : "bg-violet-600 text-white border-violet-600"
              : onDarkHeroAtTop
                ? "text-white/90 border-white/25 hover:bg-white/15 hover:text-white hover:border-white/40"
                : "text-foreground/75 dark:text-white/75 border-border/60 dark:border-white/15 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white hover:border-violet-600"
          }`}
        >
          <span className="whitespace-nowrap">Więcej</span>
          <motion.span animate={{ rotate: moreOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex items-center">
            <ChevronDown className="h-3 w-3" />
          </motion.span>
        </motion.button>
        <AnimatePresence>
          {moreOpen && (
            <DropdownPanel align="left">
              <div className="w-[26rem] grid grid-cols-2 gap-1.5 p-1">
                {moreLinks.map((link, i) => {
                  const cfg = getCfg(link.path);
                  const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + "/");
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.04 }}
                    >
                      <DropdownItem
                        icon={link.icon}
                        name={link.name}
                        desc={link.desc}
                        isActive={isActive}
                        activeClass={cfg.active}
                        accentClass={cfg.accent}
                        onClick={() => goTo(link.path)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </DropdownPanel>
          )}
        </AnimatePresence>
      </div>

      {/* Kontakt */}
      <div
        ref={kontaktRef}
        style={{ position: "relative", flexShrink: 0 }}
        onMouseEnter={() => setKontaktOpen(true)}
        onMouseLeave={() => setKontaktOpen(false)}
      >
        <motion.button
          onClick={() => goTo("/kontakt")}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-all duration-200 ${
            isKontaktActive || kontaktOpen
              ? onDarkHeroAtTop
                ? "bg-white/20 text-white"
                : "bg-blue-600 text-white"
              : onDarkHeroAtTop
                ? "text-white/90 hover:bg-white/15 hover:text-white"
                : "text-foreground/75 hover:bg-blue-600 hover:text-white"
          }`}
        >
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="whitespace-nowrap">Kontakt</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${kontaktOpen ? "rotate-180" : ""}`}
          />
        </motion.button>

        <AnimatePresence>
          {kontaktOpen && (
            <DropdownPanel align="right">
              <div className="w-[300px]">
                {kontaktLinks.map((link) => {
                  const cfg = getCfg(link.path);
                  const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + "/");
                  return (
                    <DropdownItem
                      key={link.path}
                      icon={link.icon}
                      name={link.name}
                      desc={link.desc}
                      isActive={isActive}
                      activeClass={cfg.active}
                      accentClass={cfg.accent}
                      onClick={() => goTo(link.path)}
                    />
                  );
                })}
                <ContactInfoBlock />
              </div>
            </DropdownPanel>
          )}
        </AnimatePresence>
      </div>
    </>
  );

  // Theme toggle with circular sweep animation
  const ThemeToggle = () => (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="relative flex h-8 w-8 items-center justify-center rounded-xl text-foreground/70 hover:bg-muted/70 transition-colors overflow-hidden"
      aria-label={isNightMode ? "Tryb dzienny" : "Tryb nocny"}
    >
      <AnimatePresence mode="wait">
        {isNightMode ? (
          <motion.div
            key="sun"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Sun className="h-4 w-4 text-amber-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ scale: 0, rotate: 180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: -180, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Moon className="h-4 w-4 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Ripple effect on toggle */}
      <motion.div
        key={isNightMode ? "night-ripple" : "day-ripple"}
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`absolute inset-0 rounded-full ${isNightMode ? "bg-amber-400/30" : "bg-primary/20"}`}
      />
    </motion.button>
  );

  function RightControls() {
    return (
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <motion.button
          onClick={() => setSearchOpen(v => !v)}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-foreground/70 hover:bg-muted/70 transition-colors"
          aria-label="Szukaj"
        >
          <Search className="h-4 w-4" />
        </motion.button>
        <ThemeToggle />
      </div>
    );
  }

  function LogoBtn({ h }: { h: string }) {
    return (
      <motion.button
        onClick={() => goTo("/")}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center shrink-0"
        aria-label="Strona główna"
      >
        <img src="/assets/logo-lovebydgoszcz.png" alt="Love Bydgoszcz" className={`${h} w-auto object-contain`} />
      </motion.button>
    );
  }

  // Row 1 container: transparent at top on dark-hero pages, frosted glass everywhere else
  const row1Class = showGlass
    ? "flex items-center gap-0 px-3 py-1.5 rounded-2xl border border-border/50 bg-background/92 backdrop-blur-xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.10)]"
    : "flex items-center gap-0 px-2 py-1";

  // Row 2 container: subtle pill, always visible
  const row2Class = showGlass
    ? "flex items-center gap-0 rounded-2xl px-1.5 py-0.5 border border-border/40 bg-background/80 backdrop-blur-xl"
    : "flex items-center gap-0 rounded-2xl px-1.5 py-0.5 backdrop-blur-sm border border-white/15 dark:border-white/8 bg-white/10 dark:bg-white/5";

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-[140]"
      >
        {/* ── DESKTOP ─────────────────────────────────────────────────── */}
        {!isMobile && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2">
            <AnimatePresence mode="wait">
              {!scrolled ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-0.5 py-1.5"
                >
                  {/* Row 1 — higher z-index so tooltips appear above Row 2 */}
                  <div className={row1Class} style={{ position: "relative", zIndex: 10 }}>
                    <LogoBtn h="h-8" />
                    <div className="h-5 w-px bg-border/50 dark:bg-white/20 shrink-0 mx-2" />
                    <div className="flex items-center gap-0">
                      {ROW1_ITEMS.map((link, i) => {
                        const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + "/");
                        return <Row1Btn key={link.path} link={link} isActive={isActive} onClick={() => goTo(link.path)} index={i} onDarkHero={onDarkHeroAtTop} />;
                      })}
                      <div className="flex items-center gap-0 ml-1">
                        {renderDropdowns()}
                      </div>
                    </div>
                    <div className="flex-1" />
                    {/* Rolki button - original solid gradient */}
                    <motion.button
                      onClick={() => goTo("/rolka")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-bold mr-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-sm"
                    >
                      <PlaySquare className="h-3.5 w-3.5 shrink-0" />
                      <span>Rolki</span>
                    </motion.button>
                    <RightControls />
                  </div>

                  {/* Row 2 */}
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-center"
                    style={{ position: "relative", zIndex: 5 }}
                  >
                    <div className={row2Class}>
                      {ROW2_ITEMS.map((link, i) => {
                        const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + "/");
                        return (
                          <div key={link.path} className="flex items-center">
                            {i > 0 && <div className={`h-3 w-px mx-0.5 ${onDarkHeroAtTop ? "bg-white/20" : "bg-border/40 dark:bg-white/12"}`} />}
                            <Row2Btn link={link} isActive={isActive} onClick={() => goTo(link.path)} index={i} onDarkHero={onDarkHeroAtTop} />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                /* Compact scrolled */
                <motion.div
                  key="compact"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-0.5 rounded-2xl border border-border/50 bg-background/92 px-3 py-1.5 shadow-[0_4px_32px_-4px_rgba(0,0,0,0.12)] backdrop-blur-xl mt-1"
                >
                  <LogoBtn h="h-7" />
                  <div className="h-5 w-px bg-border/50 shrink-0 mx-2" />
                  <nav className="flex items-center gap-0 flex-1 min-w-0">
                    {ROW1_ITEMS.map((link, i) => {
                      const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + "/");
                      return <Row1Btn key={link.path} link={link} isActive={isActive} onClick={() => goTo(link.path)} index={i} />;
                    })}
                    <div className="flex items-center gap-0 ml-1">
                      {renderDropdowns()}
                    </div>
                  </nav>
                  {/* Rolki button compact */}
                  <motion.button
                    onClick={() => goTo("/rolka")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[12px] font-bold mr-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-sm"
                  >
                    <PlaySquare className="h-3.5 w-3.5 shrink-0" />
                    <span>Rolki</span>
                  </motion.button>
                  <RightControls />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── MOBILE ──────────────────────────────────────────────────── */}
        {isMobile && (
          <div className="px-3 pt-2 pb-1">
            <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 backdrop-blur-xl transition-all duration-300 ${
              showGlass
                ? "bg-background/94 border-border/50 shadow-[0_4px_28px_-4px_rgba(0,0,0,0.12)]"
                : "bg-background/70 border-white/20 dark:border-white/10 dark:bg-background/60"
            }`}>
              <LogoBtn h="h-7" />
              <div className="flex-1" />
              <motion.button onClick={() => setSearchOpen(v => !v)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-foreground/60 hover:bg-muted/70 transition-all" aria-label="Szukaj">
                <Search className="h-4 w-4" />
              </motion.button>
              <motion.button onClick={toggleTheme} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-foreground/60 hover:bg-muted/70 transition-all">
                <AnimatePresence mode="wait">
                  {isNightMode ? (
                    <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Sun className="h-4 w-4 text-amber-400" />
                    </motion.span>
                  ) : (
                    <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Moon className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <motion.button onClick={() => setMobileOpen(v => !v)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-foreground/60 hover:bg-muted/70 transition-all" aria-label="Menu">
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X className="h-4 w-4" />
                    </motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <AnimatePresence>
              {searchOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input autoFocus type="text" placeholder="Szukaj..." value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch}
                      className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-4 text-sm text-foreground outline-none focus:border-primary" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {mobileOpen && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto max-w-md mt-2 rounded-2xl border border-border/60 bg-card/98 p-2 shadow-xl backdrop-blur-xl">
                  <div className="space-y-0.5">
                    {allLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + "/");
                      const cfg = getCfg(link.path);
                      return (
                        <button key={link.path} onClick={() => goTo(link.path)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${isActive ? cfg.active : "text-foreground hover:bg-muted/60"}`}>
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left">{link.name}</span>
                          {isActive && <div className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />}
                        </button>
                      );
                    })}
                    <div className="pt-1 border-t border-border/40 mt-1">
                      <button onClick={() => { navigate("/rolka"); setMobileOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-3.5 py-2.5 text-sm font-bold text-white">
                        <PlaySquare className="w-4 h-4" />
                        Rolki
                      </button>
                    </div>
                    <div className="pt-1 border-t border-border/40 mt-1">
                      <button onClick={toggleTheme}
                        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors">
                        {isNightMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-primary" />}
                        {isNightMode ? "Tryb dzienny" : "Tryb nocny"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Desktop search overlay */}
        {!isMobile && (
          <AnimatePresence>
            {searchOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 backdrop-blur-md"
                onClick={() => setSearchOpen(false)}>
                <motion.div initial={{ scale: 0.93, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.93, opacity: 0, y: 12 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full max-w-xl px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input autoFocus type="text" placeholder="Szukaj artykułów, wydarzeń, miejsc... (Enter)"
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch}
                      className="w-full pl-14 pr-5 py-4 bg-card rounded-2xl text-base border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-2xl" />
                    <button onClick={() => setSearchOpen(false)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-xl hover:bg-muted transition-colors" aria-label="Zamknij wyszukiwarkę">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="mt-2.5 text-center text-xs text-muted-foreground">
                    Wciśnij <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Enter</kbd> aby wyszukać
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.header>
    </>
  );
}

function ContactInfoBlock({ onDarkHero = false }: { onDarkHero?: boolean }) {
  const cls = `flex items-center gap-2 text-[11px] ${onDarkHero ? "text-white/78 hover:text-white" : "text-muted-foreground hover:text-blue-600"} transition-colors`;
  return (
    <div className={`mt-1.5 border-t pt-1.5 ${onDarkHero ? "border-white/15" : "border-border/60"}`}>
      <div className="space-y-1 rounded-xl px-3 py-1.5">
        <a href="tel:+48523353000" className={cls}>
          <Phone className="h-3 w-3 shrink-0" />
          <span>+48 52 335 30 00</span>
        </a>
        <a href="mailto:redakcja@lovebydgoszcz.pl" className={cls}>
          <Mail className="h-3 w-3 shrink-0" />
          <span>redakcja@lovebydgoszcz.pl</span>
        </a>
        <a href="https://maps.google.com/?q=Bydgoszcz" target="_blank" rel="noopener noreferrer" className={cls}>
          <MapPin className="h-3 w-3 shrink-0" />
          <span>Bydgoszcz, kujawsko-pomorskie</span>
        </a>
      </div>
    </div>
  );
}