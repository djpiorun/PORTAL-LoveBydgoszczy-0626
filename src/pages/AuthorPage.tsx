import { useParams, useNavigate } from "react-router";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { motion } from "framer-motion";
import { getArticleHref } from "@/lib/articleRouting";
import { User, FileText, ShieldCheck, Mail, Phone, Globe, Facebook, Instagram, Twitter, ArrowLeft, Clock, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Przed chwilą";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} godz.`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} dni`;
  return new Date(ts).toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}

const CAT_COLOR: Record<string, string> = {
  miasto: "bg-blue-500", rozrywka: "bg-rose-500", kultura: "bg-amber-500",
  biznes: "bg-emerald-500", gastronomia: "bg-orange-500",
  bydgoszczanie: "bg-violet-500", medyczna: "bg-teal-500",
};
const CAT_LABEL: Record<string, string> = {
  miasto: "Miasto", rozrywka: "Rozrywka", kultura: "Kultura",
  biznes: "Biznes", gastronomia: "Gastro", bydgoszczanie: "Bydgoszczanie",
  medyczna: "Medycyna",
};

function MobileAuthorPage({ decodedName }: { decodedName: string }) {
  const nav = useNavigate();
  const author = useQuery(api.users.getBySlugOrName, { identifier: decodedName });
  const { results, status, loadMore } = usePaginatedQuery(
    api.articles.getByAuthor,
    { author: author?.name || (author === null ? decodedName.replace(/-/g, " ") : "") },
    { initialNumItems: 20 }
  );

  const heroArticles = results.slice(0, 3);
  const listArticles = results.slice(3);

  return (
    <div className="min-h-screen bg-background pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
      {/* Top bar */}
      <div
        className="sticky top-0 z-[130] bg-background/97 border-b border-border/20"
        style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => nav(-1 as any)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card active:scale-90 transition"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-black text-foreground">{author?.name || decodedName}</p>
            <p className="truncate text-[10px] font-medium text-foreground/50">{results.length} publikacji</p>
          </div>
        </div>
      </div>

      {/* Author hero card */}
      <div className="px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-[2rem] bg-card border border-border/30 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.22)]"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)/0.08),transparent_60%)]" />
          <div className="relative p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-20 w-20 overflow-hidden rounded-[1.25rem] border-2 border-background bg-primary/10 shadow-lg">
                  {author?.image ? (
                    <img src={author.image} alt={author.name ?? ""} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-8 w-8 text-primary/50" />
                    </div>
                  )}
                </div>
                {author?.isLoveBydgoszczTeam && (
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary border-2 border-background shadow-sm">
                    <ShieldCheck className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="min-w-0 flex-1">
                <h1 className="text-[18px] font-black leading-tight text-foreground">
                  {author?.name || decodedName}
                </h1>
                {author?.subtitle && (
                  <p className="mt-0.5 text-[12px] font-bold text-primary">{author.subtitle}</p>
                )}
                {author?.status && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[11px] font-semibold text-foreground/60">{author.status}</span>
                  </div>
                )}
                <div className="mt-2 flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-primary" />
                  <span className="text-[11px] font-bold text-foreground/60">{results.length} publikacji</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {author?.description && (
              <div className="mt-4 rounded-[1rem] bg-primary/5 px-4 py-3">
                <p className="text-[12.5px] font-medium italic leading-relaxed text-foreground/70">
                  "{author.description}"
                </p>
              </div>
            )}

            {/* Social links */}
            {(author?.facebookUrl || author?.instagramUrl || author?.twitterUrl || author?.websiteUrl || author?.contactEmail) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {author?.facebookUrl && (
                  <a href={author.facebookUrl} target="_blank" rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background text-foreground/60 active:scale-90 transition">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {author?.instagramUrl && (
                  <a href={author.instagramUrl} target="_blank" rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background text-foreground/60 active:scale-90 transition">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {author?.twitterUrl && (
                  <a href={author.twitterUrl} target="_blank" rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background text-foreground/60 active:scale-90 transition">
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {author?.websiteUrl && (
                  <a href={author.websiteUrl} target="_blank" rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background text-foreground/60 active:scale-90 transition">
                    <Globe className="h-4 w-4" />
                  </a>
                )}
                {author?.contactEmail && (
                  <a href={`mailto:${author.contactEmail}`}
                    className="flex h-9 items-center gap-1.5 rounded-full border border-border/50 bg-background px-3 text-[11px] font-bold text-foreground/60 active:scale-95 transition">
                    <Mail className="h-3.5 w-3.5" />
                    {author.contactEmail}
                  </a>
                )}
                {author?.contactPhone && (
                  <a href={`tel:${author.contactPhone}`}
                    className="flex h-9 items-center gap-1.5 rounded-full border border-border/50 bg-background px-3 text-[11px] font-bold text-foreground/60 active:scale-95 transition">
                    <Phone className="h-3.5 w-3.5" />
                    {author.contactPhone}
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Articles */}
      <div className="px-4 pt-5 space-y-4">
        {status === "LoadingFirstPage" ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-[1.5rem] bg-muted animate-pulse" />)}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-foreground/40">
            <FileText className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-bold text-[14px]">Brak artykułów</p>
          </div>
        ) : (
          <>
            {/* Section label */}
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-black text-foreground">Publikacje</h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">{results.length}</span>
            </div>

            {/* Hero cards (first 3) */}
            {heroArticles.length > 0 && (
              <div className="space-y-3">
                {heroArticles.map((article, i) => (
                  <motion.button
                    key={article._id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    onClick={() => nav(getArticleHref(article))}
                    className="relative block w-full overflow-hidden rounded-[1.75rem] text-left active:scale-[0.985] transition-transform duration-150 bg-card border border-border/30 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.22)]"
                  >
                    <div className="relative h-[11rem] w-full overflow-hidden">
                      <img
                        src={article.imageUrl || "/assets/logo-lovebydgoszcz.png"}
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_30%,rgba(0,0,0,0.65)_100%)]" />
                      {article.category && (
                        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-md ${CAT_COLOR[article.category] || "bg-primary"}`}>
                          {CAT_LABEL[article.category] || article.category}
                        </span>
                      )}
                      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[9px] font-semibold text-white/90">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(article.publishedAt)}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
                        <h3 className="line-clamp-2 text-[15px] font-black leading-snug text-white drop-shadow-sm">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                    {article.excerpt && (
                      <div className="px-4 py-3">
                        <p className="line-clamp-2 text-[12px] font-medium leading-relaxed text-foreground/60">{article.excerpt}</p>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {/* List articles */}
            {listArticles.length > 0 && (
              <div className="rounded-[1.5rem] border border-border/30 bg-card px-1 py-1 shadow-sm">
                {listArticles.map((article, i) => (
                  <motion.button
                    key={article._id}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.04 }}
                    onClick={() => nav(getArticleHref(article))}
                    className="flex w-full items-start gap-3.5 px-1 py-3.5 text-left active:bg-muted/40 transition-colors duration-100 rounded-xl border-b border-border/30 last:border-0"
                  >
                    <div className="h-[5rem] w-[5rem] shrink-0 overflow-hidden rounded-[1rem] shadow-sm">
                      <img
                        src={article.imageUrl || "/assets/logo-lovebydgoszcz.png"}
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
                      {article.category && (
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${CAT_COLOR[article.category] || "bg-primary"}`} />
                          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground/55">
                            {CAT_LABEL[article.category] || article.category}
                          </span>
                        </div>
                      )}
                      <h3 className="line-clamp-2 text-[13.5px] font-bold leading-snug text-foreground">{article.title}</h3>
                      <div className="flex items-center gap-1.5 text-[10.5px] text-foreground/50">
                        <Clock className="h-2.5 w-2.5 shrink-0" />
                        <span>{timeAgo(article.publishedAt)}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-foreground/30 mt-1" />
                  </motion.button>
                ))}
              </div>
            )}

            {status === "CanLoadMore" && (
              <div className="flex justify-center py-4">
                <button
                  type="button"
                  onClick={() => loadMore(10)}
                  className="rounded-full border border-border/50 bg-card px-5 py-2.5 text-[12px] font-bold text-foreground/70 active:scale-95 transition shadow-sm"
                >
                  Załaduj więcej
                </button>
              </div>
            )}
            {status === "LoadingMore" && (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DesktopAuthorPage({ decodedName }: { decodedName: string }) {
  const author = useQuery(api.users.getBySlugOrName, { identifier: decodedName });

  const { results, status, loadMore } = usePaginatedQuery(
    api.articles.getByAuthor,
    { author: author?.name || (author === null ? decodedName.replace(/-/g, ' ') : "") },
    { initialNumItems: 13 }
  );

  const latestArticles = results.slice(0, 3);
  const otherArticles = results.slice(3);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Author Hero */}
      <div className="relative pt-32 pb-20 overflow-hidden border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-background z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            {/* Avatar */}
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-colors duration-500" />
              <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-card border-4 border-background shadow-2xl flex items-center justify-center overflow-hidden shrink-0 relative z-10">
                {author?.image ? (
                  <img src={author.image} alt={author?.name || decodedName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                ) : (
                  <User className="w-20 h-20 text-muted-foreground" />
                )}
              </div>
              {author?.isLoveBydgoszczTeam && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-20 whitespace-nowrap border-2 border-background">
                  <ShieldCheck className="w-4 h-4" />
                  Zespół Love Bydgoszcz
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex flex-col items-center w-full">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground mb-3">
                {author?.name || decodedName}
              </h1>
              
              {author?.subtitle && (
                <p className="text-xl sm:text-2xl text-primary font-bold mb-6">
                  {author.subtitle}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                {author?.status && (
                  <span className="px-4 py-1.5 bg-background border border-border shadow-sm text-foreground text-sm font-bold rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {author.status}
                  </span>
                )}
                <span className="flex items-center gap-2 px-4 py-1.5 bg-background border border-border shadow-sm text-foreground text-sm font-bold rounded-full">
                  <FileText className="w-4 h-4 text-primary" />
                  {results.length} publikacji
                </span>
              </div>

              {author?.description && (
                <div className="relative max-w-3xl mb-10">
                  <div className="absolute -top-4 -left-4 text-6xl text-primary/20 font-serif">"</div>
                  <div className="absolute -bottom-8 -right-4 text-6xl text-primary/20 font-serif">"</div>
                  <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed relative z-10 font-medium italic">
                    {author.description}
                  </p>
                </div>
              )}

              {/* Social & Contact Links */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {author?.facebookUrl && (
                  <a href={author.facebookUrl} target="_blank" rel="noreferrer" className="p-3.5 bg-background border border-border rounded-full text-muted-foreground hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                )}
                {author?.instagramUrl && (
                  <a href={author.instagramUrl} target="_blank" rel="noreferrer" className="p-3.5 bg-background border border-border rounded-full text-muted-foreground hover:text-pink-600 hover:border-pink-600 hover:bg-pink-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                )}
                {author?.twitterUrl && (
                  <a href={author.twitterUrl} target="_blank" rel="noreferrer" className="p-3.5 bg-background border border-border rounded-full text-muted-foreground hover:text-sky-500 hover:border-sky-500 hover:bg-sky-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                )}
                {author?.websiteUrl && (
                  <a href={author.websiteUrl} target="_blank" rel="noreferrer" className="p-3.5 bg-background border border-border rounded-full text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                )}
                {author?.contactEmail && (
                  <a href={`mailto:${author.contactEmail}`} className="flex items-center gap-2.5 px-6 py-3.5 bg-background border border-border rounded-full text-sm font-bold text-muted-foreground hover:text-red-500 hover:border-red-500 hover:bg-red-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {author.contactEmail}
                  </a>
                )}
                {author?.contactPhone && (
                  <a href={`tel:${author.contactPhone}`} className="flex items-center gap-2.5 px-6 py-3.5 bg-background border border-border rounded-full text-sm font-bold text-muted-foreground hover:text-green-600 hover:border-green-600 hover:bg-green-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {author.contactPhone}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        
        {status === "LoadingFirstPage" ? (
          <div className="flex flex-col gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[400px] rounded-[2.5rem] bg-muted animate-pulse border border-border" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-card rounded-[3rem] border border-border shadow-sm"
          >
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Brak artykułów</h3>
            <p className="text-muted-foreground">Ten autor nie opublikował jeszcze żadnych wpisów.</p>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {/* Latest 3 Articles - Featured Grid */}
            {latestArticles.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  Najnowsze publikacje
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {latestArticles.map((article, i) => (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <ArticleCard article={article} index={i} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Rest of the articles - List */}
            {otherArticles.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  Pozostałe artykuły
                </h2>
                <div className="flex flex-col gap-6">
                  {otherArticles.map((article, i) => (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <ArticleCard article={article} index={i} list />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {status === "CanLoadMore" && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => loadMore(10)}
                  className="bg-background text-foreground font-bold px-8 py-3 rounded-full transition-all border-2 border-border hover:border-foreground flex items-center gap-2"
                >
                  Załaduj więcej
                </button>
              </div>
            )}
            {status === "LoadingMore" && (
              <div className="flex justify-center mt-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function AuthorPage() {
  const params = useParams<{ name?: string; slug?: string }>();
  const isMobile = useIsMobile();
  const name = params.name || params.slug;
  const decodedName = name ? decodeURIComponent(name) : "";
  if (isMobile) return <MobileAuthorPage decodedName={decodedName} />;
  return <DesktopAuthorPage decodedName={decodedName} />;
}
