import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Grid3X3, Home, Search, User, X,
  Building2, Flame, HeartPulse, Heart, Music, Palette,
  TramFront, Users, TrendingUp, CloudSun, CalendarDays, MapPin, Briefcase,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

// ─── Category Overlay ─────────────────────────────────────────────────────────

const MAIN_CATEGORIES = [
  { href: "/miasto",        label: "Miasto",        from: "#2563eb", to: "#0891b2",  icon: Building2,  },
  { href: "/rozrywka",      label: "Rozrywka",      from: "#e11d48", to: "#db2777",  icon: Music,      },
  { href: "/kultura",       label: "Kultura",       from: "#d97706", to: "#ea580c",  icon: Palette,    },
  { href: "/biznes",        label: "Biznes",        from: "#059669", to: "#0d9488",  icon: TrendingUp, },
  { href: "/gastronomia",   label: "Gastronomia",   from: "#ea580c", to: "#dc2626",  icon: Flame,      },
  { href: "/bydgoszczanie", label: "Bydgoszczanie", from: "#7c3aed", to: "#9333ea",  icon: Users,      },
  { href: "/medyczna",      label: "Medycyna",      from: "#0d9488", to: "#0891b2",  icon: HeartPulse, },
];

const SERVICE_ITEMS = [
  { href: "/pogoda",        label: "Pogoda",     sublabel: "Bydgoszcz",  from: "#0ea5e9", to: "#0891b2",  icon: CloudSun },
  { href: "/rozklad-jazdy", label: "Rozkład",    sublabel: "MZK",        from: "#3b82f6", to: "#2563eb",  icon: TramFront },
  { href: "/nekrolog",      label: "Pamięć",     sublabel: "Nekrologi",  from: "#64748b", to: "#475569",  icon: Heart },
  { href: "/wydarzenia",    label: "Wydarzenia", sublabel: "Bydgoszcz",  from: "#6366f1", to: "#8b5cf6",  icon: CalendarDays },
  { href: "/miejsca",       label: "Miejsca",    sublabel: "Katalog",    from: "#ec4899", to: "#db2777",  icon: MapPin },
  { href: "/firmy",         label: "Baza Firm",  sublabel: "Katalog",    from: "#059669", to: "#047857",  icon: Briefcase },
];

function CategoryOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate();
  const go = (href: string) => { nav(href); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-background/90 backdrop-blur-2xl"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.8 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[155] flex flex-col overflow-hidden"
            style={{
              maxHeight: "92vh",
              borderRadius: "2rem 2rem 0 0",
              background: "hsl(var(--background))",
              boxShadow: "0 -32px 80px -20px rgba(0,0,0,0.32), 0 -1px 0 0 hsl(var(--border)/0.2)",
              paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="h-1 w-10 rounded-full bg-border/60" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 pt-2 shrink-0">
              <div>
                <h2 className="text-[22px] font-black tracking-[-0.04em] text-foreground">Kategorie</h2>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Wybierz temat który Cię interesuje</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground active:scale-90 transition-transform duration-150"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-4">
              {/* Main categories — 2 col grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {MAIN_CATEGORIES.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <motion.button
                      key={cat.href}
                      type="button"
                      initial={{ opacity: 0, y: 20, scale: 0.93 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.26, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => go(cat.href)}
                      className="relative flex flex-col gap-3 overflow-hidden rounded-[1.5rem] p-4 text-left active:scale-[0.96] transition-transform duration-150"
                      style={{
                        background: `linear-gradient(145deg, ${cat.from}, ${cat.to})`,
                        boxShadow: `0 10px 28px -8px ${cat.from}60`,
                        minHeight: "5.5rem",
                      }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22)_0%,transparent_45%)] pointer-events-none" />
                      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-15 pointer-events-none" style={{ background: "rgba(255,255,255,0.6)" }} />
                      <div className="absolute -left-3 -bottom-3 h-12 w-12 rounded-full opacity-10 pointer-events-none" style={{ background: "rgba(255,255,255,0.5)" }} />
                      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[14.5px] font-black text-white leading-tight tracking-[-0.02em] drop-shadow-sm">{cat.label}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/30" />
                <span className="text-[9.5px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">Poznaj także</span>
                <div className="h-px flex-1 bg-border/30" />
              </div>

              {/* Services — 3 col grid */}
              <div className="grid grid-cols-3 gap-2">
                {SERVICE_ITEMS.map((svc, i) => {
                  const Icon = svc.icon;
                  return (
                    <motion.button
                      key={svc.href}
                      type="button"
                      initial={{ opacity: 0, scale: 0.85, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.24, delay: 0.32 + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => go(svc.href)}
                      className="relative flex flex-col items-center gap-2 overflow-hidden rounded-[1.2rem] p-3 text-center active:scale-[0.95] transition-transform duration-150"
                      style={{
                        background: `linear-gradient(145deg, ${svc.from}, ${svc.to})`,
                        boxShadow: `0 6px 20px -6px ${svc.from}50`,
                      }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0%,transparent_50%)] pointer-events-none" />
                      <div className="absolute -right-3 -top-3 h-10 w-10 rounded-full opacity-15 pointer-events-none" style={{ background: "rgba(255,255,255,0.5)" }} />
                      <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-[0.65rem] bg-white/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                        <Icon className="text-white" style={{ width: "1.1rem", height: "1.1rem" }} />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[11px] font-black leading-tight text-white drop-shadow-sm">{svc.label}</p>
                        <p className="mt-0.5 text-[8px] font-semibold text-white/60">{svc.sublabel}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
// z-[185] — above search overlay (z-[175/176]) but below menu (z-[205])

const NAV_ITEMS = [
  { label: "Główna",      path: "/" as string | null,           icon: Home,     match: (p: string) => p === "/",                                                                                                    action: null as null | string },
  { label: "Kategorie",   path: null as string | null,          icon: Grid3X3,  match: (p: string) => ["/miasto","/rozrywka","/kultura","/biznes","/gastronomia","/medyczna","/bydgoszczanie"].includes(p),          action: "categories" as null | string },
  { label: "Szukaj",      path: null as string | null,          icon: Search,   match: (p: string) => p.startsWith("/szukaj"),                                                                                       action: "search" as null | string },
  { label: "Aktualności", path: "/aktualizacje" as string|null, icon: Bell,     match: (p: string) => p.startsWith("/aktualizacje"),                                                                                 action: null as null | string },
  { label: "Profil",      path: "/profil" as string | null,     icon: User,     match: (p: string) => p.startsWith("/profil") || p.startsWith("/autor") || p.startsWith("/auth") || p.startsWith("/logowanie"),     action: null as null | string },
] as const;

export default function MobileBottomNav() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [catOpen, setCatOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  // Track search overlay state — toggle but also close categories
  useEffect(() => {
    const handleToggle = () => {
      setSearchActive(v => {
        const next = !v;
        if (next) setCatOpen(false); // close categories when search opens
        return next;
      });
    };
    window.addEventListener("mobile-search-toggle", handleToggle);
    return () => window.removeEventListener("mobile-search-toggle", handleToggle);
  }, []);

  // Reset search active when search overlay closes via backdrop or X button
  useEffect(() => {
    const handleClose = () => setSearchActive(false);
    window.addEventListener("mobile-search-close", handleClose);
    return () => window.removeEventListener("mobile-search-close", handleClose);
  }, []);

  // When navigating to a path, deactivate search and categories
  useEffect(() => {
    setSearchActive(false);
    setCatOpen(false);
  }, [location.pathname]);

  if (!isMobile) return null;
  if (location.pathname.startsWith("/panel")) return null;
  if (location.pathname.startsWith("/rolka")) return null;

  return (
    <>
      <CategoryOverlay open={catOpen} onClose={() => setCatOpen(false)} />

      <motion.nav
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 bottom-0 z-[185] md:hidden"
        aria-label="Dolna nawigacja"
      >
        <div
          className="border-t border-border/20 bg-background/96 shadow-[0_-1px_0_0_hsl(var(--border)/0.2),0_-12px_32px_-8px_rgba(0,0,0,0.1)]"
          style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
        >
          <div className="flex items-stretch px-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isProfile = item.label === "Profil";
              const isCategories = item.label === "Kategorie";
              const isSearch = item.label === "Szukaj";
              const targetPath = isProfile ? (isAuthenticated ? "/profil" : "/auth") : (item.path ?? "/");
              // Only ONE item can be active at a time
              // If an overlay is open, it takes priority over path matching
              let active = false;
              if (catOpen) {
                active = isCategories;
              } else if (searchActive) {
                active = isSearch;
              } else {
                active = isCategories
                  ? item.match(location.pathname)
                  : isSearch
                  ? location.pathname.startsWith("/szukaj")
                  : isProfile
                  ? location.pathname.startsWith("/profil") || location.pathname.startsWith("/auth") || location.pathname.startsWith("/logowanie")
                  : item.match(location.pathname);
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (isCategories) {
                      setCatOpen(v => {
                        const next = !v;
                        if (next) setSearchActive(false); // close search when categories opens
                        return next;
                      });
                      return;
                    }
                    if (isSearch) {
                      window.dispatchEvent(new Event("mobile-search-toggle"));
                      return;
                    }
                    navigate(targetPath);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-all duration-200 active:scale-90"
                  style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom, 0px))" }}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-bg"
                      className="absolute inset-x-1.5 top-1 bottom-1 rounded-2xl bg-primary/10"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <div className="relative flex flex-col items-center gap-1">
                    <Icon
                      className={`h-[1.25rem] w-[1.25rem] transition-colors duration-200 ${active ? "text-primary" : "text-muted-foreground"}`}
                      strokeWidth={active ? 2.5 : 1.8}
                    />
                    <span className={`text-[10px] font-bold leading-none transition-colors duration-200 ${active ? "text-primary" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </>
  );
}