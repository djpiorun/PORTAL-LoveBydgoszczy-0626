import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Flame, Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ObituaryForm from "@/components/obituaries/ObituaryForm";
import RealisticCandle from "@/components/obituaries/RealisticCandle";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

const CrossIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 36" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0V10H4V14H10V36H14V14H20V10H14V0H10Z" />
  </svg>
);

type Obituary = {
  _id: string;
  slug: string;
  type: "nekrolog" | "wspomnienie" | "pozegnanie" | string;
  firstName: string;
  lastName: string;
  age?: number | null;
  birthDate?: string | null;
  deathDate?: string | null;
  shortDescription?: string | null;
  content?: string | null;
  image?: string | null;
  _creationTime?: number | null;
};

type FeedStatus = "LoadingFirstPage" | "LoadingMore" | "CanLoadMore" | "Done";

type FeedParams = {
  type?: string;
  searchQuery?: string;
  perPage?: number;
};

const normalizeObituaries = (payload: any): Obituary[] => {
  if (Array.isArray(payload)) return payload as Obituary[];
  if (Array.isArray(payload?.data)) return payload.data as Obituary[];
  if (Array.isArray(payload?.results)) return payload.results as Obituary[];
  return [];
};

const useObituariesFeed = ({ type, searchQuery, perPage = 12 }: FeedParams) => {
  const [results, setResults] = useState<Obituary[]>([]);
  const [status, setStatus] = useState<FeedStatus>("LoadingFirstPage");
  const [page, setPage] = useState(1);

  const fetchPage = useCallback(async (pageToLoad: number, replace: boolean) => {
    setStatus(pageToLoad === 1 ? "LoadingFirstPage" : "LoadingMore");
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (searchQuery) params.set("search", searchQuery);
    params.set("page", String(pageToLoad));
    params.set("per_page", String(perPage));

    try {
      const payload = await apiFetch<any>(`/obituaries?${params.toString()}`);
      const items = normalizeObituaries(payload);
      const meta = payload?.meta ?? null;
      setResults((prev) => (replace ? items : [...prev, ...items]));

      const hasMore = meta?.current_page && meta?.last_page
        ? meta.current_page < meta.last_page
        : items.length === perPage;
      setStatus(hasMore ? "CanLoadMore" : "Done");
      setPage(pageToLoad);
    } catch (error) {
      if (replace) setResults([]);
      setStatus("Done");
      toast.error("Nie udało się pobrać nekrologów.");
    }
  }, [perPage, searchQuery, type]);

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  const loadMore = () => {
    if (status !== "CanLoadMore") return;
    fetchPage(page + 1, false);
  };

  return { results, status, loadMore };
};

function ObituaryCard({ obituary, compact = false }: { obituary: any; compact?: boolean }) {
  const isNekrolog = obituary.type === 'nekrolog';
  const addedDate = new Date(obituary._creationTime).toLocaleDateString('pl-PL');

  if (compact) {
    // Mobile card — original desktop style, scaled for mobile
    if (isNekrolog) {
      return (
        <Link to={`/nekrolog/${obituary.slug}`} className="group block h-full">
          <motion.div
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="bg-[#f4f4f5] dark:bg-zinc-800 border-2 border-black dark:border-zinc-500 p-[3px] relative flex flex-col h-full"
            style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.08)" }}
          >
            <div className="border border-black dark:border-zinc-500 p-3 flex flex-col items-center text-center h-full bg-white dark:bg-zinc-900 relative">
              {/* Corner decorations */}
              <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-black dark:border-zinc-400" />
              <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-black dark:border-zinc-400" />
              <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-black dark:border-zinc-400" />
              <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-black dark:border-zinc-400" />
              <CrossIcon className="w-4 h-6 mb-2 text-black dark:text-zinc-300 opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="text-[7px] font-bold uppercase tracking-[0.18em] border border-black dark:border-zinc-500 text-black dark:text-zinc-300 px-1.5 py-0.5 mb-2 inline-block">Nekrolog</div>
              <h3 className="text-[11px] font-bold text-black dark:text-zinc-100 mb-1 uppercase tracking-wide leading-tight group-hover:text-gray-600 dark:group-hover:text-zinc-300 transition-colors">
                Śp. {obituary.firstName} {obituary.lastName}
              </h3>
              {(obituary.age || obituary.birthDate || obituary.deathDate) && (
                <div className="text-[9px] text-gray-600 dark:text-zinc-400 mb-1.5 font-bold tracking-widest">
                  {obituary.age ? `${obituary.age} lat` : `${obituary.birthDate ? new Date(obituary.birthDate).getFullYear() : '*'} – ${obituary.deathDate ? new Date(obituary.deathDate).getFullYear() : '†'}`}
                </div>
              )}
              <p className="text-gray-500 dark:text-zinc-400 text-[9px] italic leading-relaxed font-light line-clamp-2 mt-auto">{obituary.shortDescription || obituary.content}</p>
              <div className="mt-2 pt-1.5 border-t border-black/15 dark:border-zinc-600 w-full flex justify-between items-center">
                <span className="text-[8px] text-gray-400 dark:text-zinc-500">{addedDate}</span>
                <span className="text-[8px] font-bold text-black dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  Więcej<span className="w-2 h-px bg-black dark:bg-zinc-400 group-hover:w-4 transition-all duration-300 inline-block" />
                </span>
              </div>
            </div>
          </motion.div>
        </Link>
      );
    }
    // wspomnienie / pozegnanie mobile card
    return (
      <Link to={`/nekrolog/${obituary.slug}`} className="group block h-full">
        <motion.div
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="relative flex flex-col h-full overflow-hidden border border-amber-500/20 bg-slate-900 dark:bg-slate-950"
          style={{ boxShadow: "0 4px 16px -4px rgba(245,158,11,0.12)" }}
        >
          {obituary.image ? (
            <div className="relative overflow-hidden w-full aspect-[4/3] shrink-0">
              <img src={obituary.image} alt="" className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-900/90" />
            </div>
          ) : (
            <div className="w-full flex justify-center pt-4 pb-1 shrink-0">
              <RealisticCandle className="w-5 h-9 opacity-55 group-hover:opacity-80 transition-opacity" />
            </div>
          )}
          <div className="flex-1 flex flex-col p-3 z-10 items-center text-center">
            <div className="text-[7px] font-bold uppercase tracking-[0.18em] border border-amber-500/30 text-amber-500/75 px-1.5 py-0.5 mb-1.5 inline-block bg-amber-500/5">{obituary.type}</div>
            <h3 className="text-[11px] font-bold text-slate-200 mb-1 uppercase tracking-wide leading-tight group-hover:text-amber-400 transition-colors">
              Śp. {obituary.firstName} {obituary.lastName}
            </h3>
            {(obituary.age || obituary.birthDate || obituary.deathDate) && (
              <div className="text-[9px] text-slate-400 mb-1 font-bold tracking-widest">
                {obituary.age ? `${obituary.age} lat` : `${obituary.birthDate ? new Date(obituary.birthDate).getFullYear() : '*'} – ${obituary.deathDate ? new Date(obituary.deathDate).getFullYear() : '†'}`}
              </div>
            )}
            <p className="text-slate-400 text-[9px] italic leading-relaxed font-light line-clamp-2 mt-auto">{obituary.shortDescription || obituary.content}</p>
          </div>
          <div className="border-t border-amber-500/10 px-3 py-1.5 flex justify-between items-center">
            <span className="text-[8px] text-slate-500">{addedDate}</span>
            <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-widest group-hover:text-amber-400 transition-colors flex items-center gap-1">
              Więcej<span className="w-2 h-px bg-amber-500/50 group-hover:w-4 transition-all duration-300 inline-block" />
            </span>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Desktop card (original)
  return (
    <Link to={`/nekrolog/${obituary.slug}`} className="group block h-full">
      {isNekrolog ? (
        <div className="bg-[#f4f4f5] border-2 border-black p-1 relative flex flex-col h-full hover:shadow-xl transition-all duration-500">
          <div className="border border-black p-4 flex flex-col items-center text-center h-full bg-white">
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-black"></div>
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-black"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-black"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-black"></div>
            <CrossIcon className="w-5 h-8 mb-3 text-black opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="flex-1 flex flex-col items-center w-full">
              <div className="text-[9px] font-bold uppercase tracking-widest border border-black text-black px-2 py-0.5 mb-2 inline-block">Nekrolog</div>
              <h3 className="text-lg font-bold text-black mb-1.5 uppercase tracking-wider leading-tight group-hover:text-gray-700 transition-colors">
                Śp. {obituary.firstName} {obituary.lastName}
              </h3>
              {(obituary.age || obituary.birthDate || obituary.deathDate) && (
                <div className="text-xs text-gray-800 mb-2 font-bold tracking-widest">
                  {obituary.age ? `${obituary.age} lat` : `${obituary.birthDate ? new Date(obituary.birthDate).getFullYear() : '*'} - ${obituary.deathDate ? new Date(obituary.deathDate).getFullYear() : '†'}`}
                </div>
              )}
              <p className="text-gray-700 text-xs italic leading-relaxed font-light line-clamp-3 mb-4">{obituary.shortDescription || obituary.content}</p>
              <div className="mt-auto pt-2 border-t border-black/20 w-full flex justify-between items-center">
                <span className="text-[9px] text-gray-400">Dodano: {addedDate}</span>
                <span className="text-[9px] font-bold text-black uppercase tracking-widest group-hover:text-gray-600 transition-colors flex items-center gap-1.5">
                  Informacje<span className="w-2 h-px bg-black group-hover:w-5 transition-all duration-300"></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col h-full overflow-hidden border border-amber-500/20 hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] bg-slate-900">
          {obituary.image ? (
            <div className="relative overflow-hidden w-full aspect-[4/3] shrink-0">
              <img src={obituary.image} alt="" className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-900/95"></div>
            </div>
          ) : (
            <div className="w-full flex justify-center pt-6 pb-2 shrink-0">
              <RealisticCandle className="w-10 h-16 opacity-60 group-hover:opacity-90 transition-opacity" />
            </div>
          )}
          <div className="flex-1 flex flex-col p-5 z-10 items-center text-center">
            <div className="text-[9px] font-bold uppercase tracking-widest border border-amber-500/30 text-amber-500/80 px-2.5 py-1 mb-3 inline-block bg-amber-500/5">{obituary.type}</div>
            <h3 className="text-xl font-bold text-slate-200 mb-2 uppercase tracking-wider leading-tight group-hover:text-amber-400 transition-colors w-full">
              Śp. {obituary.firstName} {obituary.lastName}
            </h3>
            {(obituary.age || obituary.birthDate || obituary.deathDate) && (
              <div className="text-xs text-slate-400 mb-3 font-bold tracking-widest">
                {obituary.age ? `${obituary.age} lat` : `${obituary.birthDate ? new Date(obituary.birthDate).getFullYear() : '*'} - ${obituary.deathDate ? new Date(obituary.deathDate).getFullYear() : '†'}`}
              </div>
            )}
            <p className="text-slate-400 text-sm italic leading-relaxed font-light line-clamp-3 mb-4 w-full">{obituary.shortDescription || obituary.content}</p>
            <div className="mt-auto pt-3 border-t border-amber-500/10 w-full flex justify-between items-center">
              <span className="text-[9px] text-slate-500">Dodano: {addedDate}</span>
              <span className="text-[9px] font-bold text-amber-500/70 uppercase tracking-widest group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                Informacje<span className="w-3 h-px bg-amber-500/50 group-hover:w-6 transition-all duration-300"></span>
              </span>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}

function MobileObituarySection({ type, title }: { type: "nekrolog" | "wspomnienie" | "pozegnanie"; title: string }) {
  const { results, status } = useObituariesFeed({ type, perPage: 5 });
  if (results.length === 0 && status !== "LoadingFirstPage") return null;
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-border/40" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.22em] text-foreground/40 px-2">{title}</h2>
        <div className="h-px flex-1 bg-border/40" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {status === "LoadingFirstPage" ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-[180px] rounded-[1.2rem] bg-muted animate-pulse" />)
        ) : (
          results.map((obituary, i) => (
            <motion.div
              key={obituary._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: i * 0.04 }}
            >
              <ObituaryCard obituary={obituary} compact />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function ObituarySection({ type, title, onViewMore }: { type: "nekrolog" | "wspomnienie" | "pozegnanie", title: string, onViewMore: () => void }) {
  const { results, status } = useObituariesFeed({ type, perPage: 4 });
  if (results.length === 0 && status !== "LoadingFirstPage") return null;
  return (
    <div className="mb-16">
      <div className="flex justify-between items-end mb-6 border-b border-border pb-2">
        <h2 className="text-2xl font-serif font-bold uppercase tracking-wider">{title}</h2>
        <Button variant="ghost" onClick={onViewMore} className="text-sm font-serif tracking-widest uppercase">Zobacz więcej</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {results.map(obituary => <ObituaryCard key={obituary._id} obituary={obituary} />)}
      </div>
    </div>
  );
}

function SearchResults({ query }: { query: string }) {
  const { results, status, loadMore } = useObituariesFeed({ searchQuery: query, perPage: 12 });
  if (status === "LoadingFirstPage") {
    return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>;
  }
  if (results.length === 0) {
    return <div className="text-center py-12 text-muted-foreground font-serif text-lg">Nie znaleziono wpisów dla "{query}".</div>;
  }
  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-serif font-bold uppercase tracking-wider mb-8 border-b border-border pb-4">Wyniki wyszukiwania</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {results.map(obituary => <ObituaryCard key={obituary._id} obituary={obituary} />)}
      </div>
      {status === "CanLoadMore" && (
        <div className="mt-12 text-center">
          <Button onClick={() => loadMore()} variant="outline" className="font-serif tracking-widest uppercase">Załaduj więcej</Button>
        </div>
      )}
    </div>
  );
}

function FullList({ type, title, onBack }: { type: "nekrolog" | "wspomnienie" | "pozegnanie", title: string, onBack: () => void }) {
  const { results, status, loadMore } = useObituariesFeed({ type, perPage: 12 });
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
        <h2 className="text-3xl font-serif font-bold uppercase tracking-wider">{title}</h2>
        <Button variant="outline" onClick={onBack} className="font-serif tracking-widest uppercase text-xs">
          <ArrowLeft className="w-4 h-4 mr-2" /> Powrót
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {results.map(obituary => <ObituaryCard key={obituary._id} obituary={obituary} />)}
      </div>
      {status === "CanLoadMore" && (
        <div className="mt-12 text-center">
          <Button onClick={() => loadMore()} variant="outline" className="font-serif tracking-widest uppercase">Załaduj więcej</Button>
        </div>
      )}
    </div>
  );
}

export default function ObituariesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeType, setActiveType] = useState<"all" | "nekrolog" | "wspomnienie" | "pozegnanie">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const isMobile = useIsMobile();

  const getTitleForType = (type: string) => {
    switch(type) {
      case "nekrolog": return "Nekrologi";
      case "wspomnienie": return "Wspomnienia";
      case "pozegnanie": return "Pożegnania";
      default: return "";
    }
  };

  if (isMobile) {
    return (
      <div
        className="min-h-screen bg-background"
        style={{ paddingTop: "calc(4.5rem + env(safe-area-inset-top,0px))", paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom,0px))" }}
      >
        <SEO title="Strefa Pamięci – Love Bydgoszcz" />

        {/* Header */}
        <div className="px-4 pt-3 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-primary/10">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-[20px] font-black tracking-tight text-foreground">Strefa Pamięci</h1>
                <p className="text-[10px] font-medium text-muted-foreground">Nekrologi i wspomnienia</p>
              </div>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm active:scale-90 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl font-bold uppercase tracking-widest text-center">Dodaj wpis</DialogTitle>
                </DialogHeader>
                <ObituaryForm onSuccess={() => setIsFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.08 }}
            className="mt-3 flex items-center gap-2.5 rounded-[1.25rem] border border-border/50 bg-card px-3.5 shadow-sm"
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Szukaj po imieniu..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="h-11 flex-1 bg-transparent text-[13px] font-medium text-foreground outline-none placeholder:text-muted-foreground/55"
            />
            {mobileSearch && (
              <button type="button" onClick={() => setMobileSearch("")} className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-90">
                <X className="h-3 w-3" />
              </button>
            )}
          </motion.div>
        </div>

        {/* Content */}
        <div className="px-4">
          {mobileSearch.trim().length >= 2 ? (
            <MobileSearchResults query={mobileSearch.trim()} />
          ) : (
            <>
              <MobileObituarySection type="nekrolog" title="Nekrologi" />
              <MobileObituarySection type="wspomnienie" title="Wspomnienia" />
              <MobileObituarySection type="pozegnanie" title="Pożegnania" />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Strefa Pamięci – Love Bydgoszcz" />
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <RealisticCandle className="w-12 h-36" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-widest uppercase">Strefa Pamięci</h1>
            <p className="text-lg text-muted-foreground italic mb-8 font-light max-w-2xl mx-auto">
              „Nie umiera ten, kto trwa w pamięci żywych."
            </p>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="font-serif tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90">
                  <Flame className="w-4 h-4 mr-2 text-amber-400" />
                  Dodaj wpis
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl font-bold uppercase tracking-widest text-center border-b border-border pb-4">
                    Dodaj wpis do Strefy Pamięci
                  </DialogTitle>
                </DialogHeader>
                <ObituaryForm onSuccess={() => setIsFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-12 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Szukaj po imieniu i nazwisku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-base rounded-2xl border-border"
              />
            </div>
          </div>

          {searchQuery.trim().length >= 2 ? (
            <SearchResults query={searchQuery.trim()} />
          ) : activeType === "all" ? (
            <>
              <ObituarySection type="nekrolog" title="Nekrologi" onViewMore={() => setActiveType("nekrolog")} />
              <ObituarySection type="wspomnienie" title="Wspomnienia" onViewMore={() => setActiveType("wspomnienie")} />
              <ObituarySection type="pozegnanie" title="Pożegnania" onViewMore={() => setActiveType("pozegnanie")} />
            </>
          ) : (
            <FullList type={activeType} title={getTitleForType(activeType)} onBack={() => setActiveType("all")} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function MobileSearchResults({ query }: { query: string }) {
  const { results, status } = useObituariesFeed({ searchQuery: query, perPage: 20 });
  if (status === "LoadingFirstPage") {
    return <div className="flex justify-center py-8"><div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  }
  if (results.length === 0) {
    return <p className="py-8 text-center text-[13px] text-muted-foreground">Nie znaleziono wyników dla „{query}".</p>;
  }
  return (
    <div className="space-y-2">
      {results.map((obituary, i) => (
        <motion.div key={obituary._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.03 }}>
          <ObituaryCard obituary={obituary} compact />
        </motion.div>
      ))}
    </div>
  );
}