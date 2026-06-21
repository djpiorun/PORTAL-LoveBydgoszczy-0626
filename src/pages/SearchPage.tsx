import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { fetchEvents } from "@/lib/events-api";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getArticleHref } from "@/lib/articleRouting";
import { fetchArticles, type Article } from "@/lib/articles-api";
import ArticleCard from "@/components/ArticleCard";
import EventCard from "@/components/EventCard";
import { Search as SearchIcon, History, X, ArrowLeft, Clock, FileText, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router";

// ─── Mobile Search Page ───────────────────────────────────────────────────────

function MobileSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setSearchHistory(history);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!query) {
      setArticles([]);
      setIsLoadingArticles(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingArticles(true);
    fetchArticles({ search: query, limit: 20 })
      .then((data) => {
        if (!isMounted) return;
        setArticles(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setArticles([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingArticles(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const newHistory = [searchInput, ...searchHistory.filter(h => h !== searchInput)].slice(0, 6);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    navigate(`/szukaj?q=${encodeURIComponent(searchInput)}`);
  };

  const removeHistoryItem = (item: string) => {
    const next = searchHistory.filter(h => h !== item);
    setSearchHistory(next);
    localStorage.setItem("searchHistory", JSON.stringify(next));
  };

  useEffect(() => {
    let isMounted = true;

    if (!query) {
      setEvents([]);
      setIsLoadingEvents(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingEvents(true);
    fetchEvents({ search: query })
      .then((payload) => {
        if (!isMounted) return;
        const data = payload?.data ?? payload?.events ?? payload ?? [];
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setEvents([]);
        toast.warning("Wydarzenia są chwilowo niedostępne.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingEvents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  const isLoading = !!query && (isLoadingArticles || isLoadingEvents);
  const hasResults = articles.length > 0 || events.length > 0;

  function timeAgo(ts?: number) {
    if (!ts) return "";
    const diff = Date.now() - ts;
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "przed chwilą";
    if (h < 24) return `${h}h temu`;
    return `${Math.floor(h / 24)}d temu`;
  }

  return (
    <div
      className="min-h-screen bg-background"
      style={{ paddingTop: "calc(4.5rem + env(safe-area-inset-top,0px))", paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom,0px))" }}
    >
      {/* Search header */}
      <div className="px-4 pt-3 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-[22px] font-black tracking-tight text-foreground mb-3">
            Szukaj
          </h1>

          {/* Search input — solid colored */}
          <form onSubmit={handleSearch}>
            <div
              className="flex items-center gap-2.5 rounded-[1.4rem] px-4"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                boxShadow: "0 8px 24px -6px rgba(79,70,229,0.5)",
              }}
            >
              <SearchIcon className="h-4 w-4 shrink-0 text-white/80" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Szukaj artykułów i tematów..."
                className="h-12 flex-1 bg-transparent text-[14px] font-semibold text-white outline-none placeholder:text-white/55"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white active:scale-90 transition-transform"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-4">
        {/* No query — show history */}
        {!query && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {searchHistory.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] font-black uppercase tracking-[0.12em] text-foreground/40">Ostatnie wyszukiwania</p>
                  <button
                    type="button"
                    onClick={() => { setSearchHistory([]); localStorage.removeItem("searchHistory"); }}
                    className="text-[10px] font-bold text-primary/60 active:scale-95 transition-transform"
                  >
                    Wyczyść
                  </button>
                </div>
                <div className="space-y-1.5">
                  {searchHistory.map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className="flex items-center gap-3 rounded-[1.1rem] border border-border/30 bg-card px-4 py-3 shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/szukaj?q=${encodeURIComponent(item)}`)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.6rem] bg-primary/10">
                          <Clock className="h-3.5 w-3.5 text-primary/70" />
                        </span>
                        <span className="text-[13px] font-semibold text-foreground">{item}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeHistoryItem(item)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-foreground/30 active:scale-90 transition-transform"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-foreground/30">
                <SearchIcon className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-[14px] font-bold">Wpisz frazę, aby wyszukać</p>
                <p className="text-[11px] mt-1 text-foreground/25">Artykuły, wydarzenia, tematy</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {/* Results */}
        {query && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <p className="text-[11px] font-bold text-foreground/40">
              Wyniki dla: <span className="text-foreground/70">„{query}"</span>
            </p>

            {!hasResults ? (
              <div className="flex flex-col items-center rounded-[1.75rem] border border-border/30 bg-card px-5 py-14 text-center shadow-sm">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <SearchIcon className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <h2 className="text-[17px] font-black text-foreground mb-1">Brak wyników</h2>
                <p className="text-[12px] text-muted-foreground">Spróbuj wpisać inną frazę lub sprawdź pisownię.</p>
              </div>
            ) : (
              <>
                {/* Articles */}
                {articles && articles.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-[0.45rem]" style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
                        <FileText className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-[13px] font-black text-foreground">Artykuły</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{articles.length}</span>
                    </div>
                    <div className="space-y-3">
                      {articles.map((article, i) => (
                        <motion.button
                          key={article.id}
                          type="button"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, delay: i * 0.04 }}
                          onClick={() => navigate(getArticleHref(article))}
                          className="flex w-full items-start gap-3 rounded-[1.4rem] border border-border/30 bg-card p-3 text-left shadow-sm active:scale-[0.985] transition-transform duration-150"
                        >
                          {article.imageUrl && (
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[0.9rem]">
                              <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1 pt-0.5">
                            <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-foreground">{article.title}</h3>
                            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-foreground/45">
                              <Clock className="h-2.5 w-2.5 shrink-0" />
                              <span>{timeAgo(article.publishedAt)}</span>
                              {article.author && (
                                <>
                                  <span className="opacity-40">·</span>
                                  <span className="truncate">{article.author}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Events */}
                {events && events.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-[0.45rem]" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        <CalendarDays className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-[13px] font-black text-foreground">Wydarzenia</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{events.length}</span>
                    </div>
                    <div className="space-y-3">
                      {events.map((event, i) => (
                        <motion.div
                          key={event._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, delay: i * 0.04 }}
                        >
                          <EventCard event={event} index={i} />
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Desktop Search Page ──────────────────────────────────────────────────────

function DesktopSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setSearchHistory(history);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!query) {
      setArticles([]);
      setIsLoadingArticles(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingArticles(true);
    fetchArticles({ search: query, limit: 20 })
      .then((data) => {
        if (!isMounted) return;
        setArticles(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setArticles([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingArticles(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const newHistory = [searchInput, ...searchHistory.filter(h => h !== searchInput)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    navigate(`/szukaj?q=${encodeURIComponent(searchInput)}`);
    setIsFocused(false);
  };

  const removeHistoryItem = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== item);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  useEffect(() => {
    let isMounted = true;

    if (!query) {
      setEvents([]);
      setIsLoadingEvents(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingEvents(true);
    fetchEvents({ search: query })
      .then((payload) => {
        if (!isMounted) return;
        const data = payload?.data ?? payload?.events ?? payload ?? [];
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setEvents([]);
        toast.warning("Wydarzenia są chwilowo niedostępne.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingEvents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  const isLoading = !!query && (isLoadingArticles || isLoadingEvents);
  const hasResults = articles.length > 0 || events.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
            <h1 className="text-4xl font-black mb-3 text-foreground">Czego szukasz?</h1>
            <p className="text-base text-muted-foreground">Szukaj artykułów, wydarzeń i tematów z Bydgoszczy.</p>
            <div className="relative max-w-2xl mx-auto mt-8">
              <form onSubmit={handleSearch} className="relative z-20">
                <div className={`flex items-center rounded-[1.5rem] border transition-all duration-300 ${isFocused ? "border-primary bg-white shadow-lg shadow-primary/10" : "border-slate-200 bg-white shadow-sm hover:border-slate-300"}`}>
                  <SearchIcon className={`ml-4 h-5 w-5 ${isFocused ? "text-primary" : "text-slate-400"}`} />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholder="Wpisz szukaną frazę..."
                    className="w-full bg-transparent outline-none px-4 py-4 text-lg font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <button type="submit" className="mr-1 rounded-[1.1rem] font-bold transition-colors px-6 py-2 bg-primary text-white hover:bg-blue-600">Szukaj</button>
                </div>
              </form>
              {isFocused && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-xl z-10">
                  <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                    <History className="w-4 h-4" />
                    Ostatnie wyszukiwania
                  </div>
                  <ul>
                    {searchHistory.map((item, idx) => (
                      <li key={idx}>
                        <button onClick={() => { setSearchInput(item); navigate(`/szukaj?q=${encodeURIComponent(item)}`); }} className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors group hover:bg-slate-50">
                          <span className="font-medium text-slate-700 group-hover:text-primary transition-colors">{item}</span>
                          <div onClick={(e) => removeHistoryItem(item, e)} className="p-1 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>

          {query && (
            <div className="mt-8">
              <p className="mb-8 text-lg text-center text-muted-foreground">Wyniki dla: <span className="font-bold text-foreground">"{query}"</span></p>
              {isLoading ? (
                <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : !hasResults ? (
                <div className="text-center rounded-[2rem] border border-slate-200 bg-white py-20 shadow-sm">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50"><SearchIcon className="w-10 h-10 text-slate-300" /></div>
                  <h2 className="text-2xl font-bold mb-2 text-foreground">Brak wyników</h2>
                  <p className="text-muted-foreground">Spróbuj wpisać inną frazę lub sprawdź pisownię.</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {articles && articles.length > 0 && (
                    <section>
                      <h2 className="mb-5 flex items-center gap-3 font-black text-foreground text-2xl">Artykuły <span className="text-sm font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">{articles.length}</span></h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{articles.map((article, i) => <ArticleCard key={article.id} article={article} index={i} />)}</div>
                    </section>
                  )}
                  {events && events.length > 0 && (
                    <section>
                      <h2 className="mb-5 flex items-center gap-3 font-black text-foreground text-2xl">Wydarzenia <span className="text-sm font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">{events.length}</span></h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{events.map((event, i) => <EventCard key={event._id} event={event} index={i} />)}</div>
                    </section>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileSearchPage />;
  return <DesktopSearchPage />;
}
