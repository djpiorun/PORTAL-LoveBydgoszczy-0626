import { motion } from "framer-motion";
import { User, ArrowRight, Clock, Star, AlertCircle, AlertTriangle, Newspaper, Info, PenLine, BookOpen, Mic, BarChart2, FileText, Lightbulb, Users, Send, DollarSign } from "lucide-react";
import { useNavigate } from "react-router";
import { useIsMobile } from "@/hooks/use-mobile";
import { getArticleHref, getCategoryHref } from "@/lib/articleRouting";

const categoryLabels: Record<string, string> = {
  miasto: "Miasto",
  rozrywka: "Rozrywka",
  kultura: "Kultura",
  biznes: "Biznes",
  gastronomia: "Gastronomia",
  bydgoszczanie: "Bydgoszczanie",
  medyczna: "Medyczna Bydgoszcz",
  sport: "Sport",
  polityka: "Polityka",
  inwestycje: "Inwestycje",
  nasze_dzialania: "Nasze Działania",
};

const categoryColors: Record<string, string> = {
  miasto: "bg-blue-500",
  rozrywka: "bg-purple-500",
  kultura: "bg-amber-500",
  biznes: "bg-emerald-500",
  gastronomia: "bg-orange-500",
  bydgoszczanie: "bg-rose-500",
  medyczna: "bg-teal-500",
  sport: "bg-blue-600",
  polityka: "bg-slate-700",
  inwestycje: "bg-amber-600",
  nasze_dzialania: "bg-purple-600",
};

const categoryTextColors: Record<string, string> = {
  miasto: "group-hover:text-blue-500",
  rozrywka: "group-hover:text-purple-500",
  kultura: "group-hover:text-amber-500",
  biznes: "group-hover:text-emerald-500",
  gastronomia: "group-hover:text-orange-500",
  bydgoszczanie: "group-hover:text-rose-500",
  medyczna: "group-hover:text-teal-500",
  sport: "group-hover:text-blue-600",
  polityka: "group-hover:text-slate-700",
  inwestycje: "group-hover:text-amber-600",
  nasze_dzialania: "group-hover:text-purple-600",
};

const categoryHoverBg: Record<string, string> = {
  miasto: "group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:text-white",
  rozrywka: "group-hover:bg-purple-500 group-hover:border-purple-500 group-hover:text-white",
  kultura: "group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-white",
  biznes: "group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white",
  gastronomia: "group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white",
  bydgoszczanie: "group-hover:bg-rose-500 group-hover:border-rose-500 group-hover:text-white",
  medyczna: "group-hover:bg-teal-500 group-hover:border-teal-500 group-hover:text-white",
  sport: "group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white",
  polityka: "group-hover:bg-slate-700 group-hover:border-slate-700 group-hover:text-white",
  inwestycje: "group-hover:bg-amber-600 group-hover:border-amber-600 group-hover:text-white",
  nasze_dzialania: "group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:text-white",
};

const categoryGroupHoverBg: Record<string, string> = {
  miasto: "group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500",
  rozrywka: "group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500",
  kultura: "group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500",
  biznes: "group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500",
  gastronomia: "group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500",
  bydgoszczanie: "group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500",
  medyczna: "group-hover:bg-teal-500 group-hover:text-white group-hover:border-teal-500",
  sport: "group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600",
  polityka: "group-hover:bg-slate-700 group-hover:text-white group-hover:border-slate-700",
  inwestycje: "group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600",
  nasze_dzialania: "group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600",
};

const categoryBorderColors: Record<string, string> = {
  miasto: "border-blue-500 text-blue-600",
  rozrywka: "border-purple-500 text-purple-600",
  kultura: "border-amber-500 text-amber-600",
  biznes: "border-emerald-500 text-emerald-600",
  gastronomia: "border-orange-500 text-orange-600",
  bydgoszczanie: "border-rose-500 text-rose-600",
  medyczna: "border-teal-500 text-teal-600",
  sport: "border-blue-600 text-blue-600",
  polityka: "border-slate-700 text-slate-700",
  inwestycje: "border-amber-600 text-amber-600",
  nasze_dzialania: "border-purple-600 text-purple-600",
};

interface ArticleCardProps {
  article: {
    id?: string;
    _id?: string;
    title: string;
    excerpt: string;
    category: string;
    imageUrl?: string | null;
    author: string;
    publishedAt: number;
    tags?: string[] | null;
    isPatronage?: boolean | null;
    slug?: string | null;
    personName?: string | null;
    labelUrgent?: boolean | null;
    labelImportant?: boolean | null;
    labelOurNews?: boolean | null;
    labelMustKnow?: boolean | null;
    labelAuthorArticle?: boolean | null;
    label18Plus?: boolean | null;
    articleType?: string | null;
    authorImage?: string | null;
    authorSlug?: string | null;
  };
  featured?: boolean;
  index?: number;
  large?: boolean;
  wide?: boolean;
  wideCompact?: boolean;
  compact?: boolean;
  list?: boolean;
}

function formatPublicationLabel(ts: number) {
  const diff = Date.now() - ts;
  const date = new Date(ts);
  const minutes = Math.floor(diff / 60000);
  const timeString = date.toLocaleTimeString("pl-PL", { hour: '2-digit', minute: '2-digit' });

  if (minutes < 15) {
    return "Przed chwilą dodano";
  }

  if (minutes < 60) {
    return `${minutes} minut temu`;
  }

  const dateString = date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${dateString} o ${timeString}`;
}

function timeAgo(ts: number) {
  return formatPublicationLabel(ts);
}

function formatDateTime(ts: number) {
  return formatPublicationLabel(ts);
}

function formatShortDate(ts: number) {
  return new Date(ts).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function ArticleLabels({ article }: { article: ArticleCardProps["article"] }) {
  return (
    <>
      {article.labelUrgent && (
        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-wider shadow-sm">
          <AlertCircle className="w-2.5 h-2.5" />
          PILNE
        </span>
      )}
      {article.labelImportant && (
        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-yellow-500 text-white uppercase tracking-wider shadow-sm">
          <AlertTriangle className="w-2.5 h-2.5" />
          WAŻNE
        </span>
      )}
      {article.labelOurNews && (
        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider shadow-sm">
          <Newspaper className="w-2.5 h-2.5" />
          NASZ TEKST
        </span>
      )}
      {article.labelMustKnow && (
        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-green-600 text-white uppercase tracking-wider shadow-sm">
          <Info className="w-2.5 h-2.5" />
          MUSISZ WIEDZIEĆ
        </span>
      )}
      {article.labelAuthorArticle && (
        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-600 text-white uppercase tracking-wider shadow-sm">
          <PenLine className="w-2.5 h-2.5" />
          ARTYKUŁ AUTORA
        </span>
      )}
      {article.label18Plus && (
        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-red-700 text-white uppercase tracking-wider shadow-sm">
          18+
        </span>
      )}
    </>
  );
}

function ArticleTypeBadge({ article }: { article: ArticleCardProps["article"] }) {
  if (!article.articleType || article.articleType === "news") return null;

  const typeMap: Record<string, { label: string; icon: any; className: string }> = {
    quiz: { label: "QUIZ", icon: BookOpen, className: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200" },
    interview: { label: "WYWIAD", icon: Mic, className: "bg-purple-100 text-purple-700 border-purple-200" },
    analysis: { label: "ANALIZA", icon: BarChart2, className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    report: { label: "REPORTAZ", icon: FileText, className: "bg-amber-100 text-amber-700 border-amber-200" },
    opinion: { label: "OPINIA", icon: Lightbulb, className: "bg-cyan-100 text-cyan-700 border-cyan-200" },
    dialog: { label: "DIALOG", icon: Users, className: "bg-violet-100 text-violet-700 border-violet-200" },
    press_release: { label: "KOMUNIKAT", icon: Send, className: "bg-blue-100 text-blue-700 border-blue-200" },
    sponsored: { label: "SPONSOROWANY", icon: DollarSign, className: "bg-rose-100 text-rose-700 border-rose-200" },
  };

  const type = typeMap[article.articleType];
  if (!type) return null;
  const Icon = type.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider shadow-sm ${type.className}`}>
      <Icon className="h-2.5 w-2.5" />
      {type.label}
    </span>
  );
}

function buildAuthorHref(authorName: string, authorSlug?: string) {
  return `/autor/${authorSlug || authorName.toLowerCase().replace(/\s+/g, "-")}`;
}

function ArticleAuthorMeta({
  authorName,
  publishedAt,
  authorImage,
  authorSlug,
}: {
  authorName: string;
  publishedAt: number;
  authorImage?: string | null;
  authorSlug?: string | null;
}) {
  const navigate = useNavigate();
  const displayName = authorName;
  const authorHref = buildAuthorHref(authorName, authorSlug ?? undefined);
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-center gap-3.5 min-w-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          navigate(authorHref);
        }}
        className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 shadow-sm"
        aria-label={`Przejdz do autora ${displayName}`}
      >
        {authorImage ? (
          <img src={authorImage} alt={displayName} className="w-full h-full object-cover" />
        ) : initials ? (
          <span className="text-xs font-black text-slate-700">{initials}</span>
        ) : (
          <User className="w-4 h-4 text-slate-500" />
        )}
      </button>
      <div className="flex flex-col min-w-0">
        <button
          type="button"
          className="text-sm font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer text-left truncate"
          onClick={(e) => {
            e.stopPropagation();
            navigate(authorHref);
          }}
        >
          {displayName}
        </button>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Clock className="w-3 h-3" />
          {formatDateTime(publishedAt)}
        </div>
      </div>
    </div>
  );
}

export default function ArticleCard({
  article,
  index = 0,
  large = false,
  wide = false,
  wideCompact = false,
  compact = false,
  list = false,
}: ArticleCardProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const articleHref = getArticleHref(article);

  // Compact list style (sidebar)
  if (compact) {
    return (
      <motion.article
        onClick={() => navigate(articleHref)}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        className={`group flex gap-3 p-3 rounded-[1.25rem] hover:bg-white border transition-all duration-300 cursor-pointer bg-slate-50/50 ${article.labelUrgent ? 'border-red-200 bg-red-50/30 hover:shadow-lg hover:shadow-red-100/50' : article.labelImportant ? 'border-yellow-200 bg-yellow-50/30 hover:shadow-lg hover:shadow-yellow-100/50' : 'border-transparent hover:border-slate-200 hover:shadow-lg'}`}
      >
        {article.imageUrl && (
          <div className="w-[4.5rem] h-[4.5rem] rounded-xl overflow-hidden shrink-0 shadow-md">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </div>
        )}
        <div className="flex flex-col justify-center py-0.5 flex-1 min-w-0">
          {article.personName && (
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider mb-0.5">
              {article.personName}
            </span>
          )}
          <div className="flex flex-wrap gap-1 mb-1">
            <ArticleLabels article={article} />
          </div>
          <h4 className={`font-extrabold text-[13px] text-slate-900 leading-snug line-clamp-2 mb-1.5 transition-colors duration-300 ${categoryTextColors[article.category] || "group-hover:text-primary"}`}>
            {article.title}
          </h4>
          <div className="flex items-center justify-between gap-2 flex-wrap mt-auto">
            <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider transition-colors duration-300 border bg-transparent ${categoryBorderColors[article.category] || "border-slate-400 text-slate-600"} ${categoryGroupHoverBg[article.category] || "group-hover:bg-slate-600 group-hover:text-white"}`}>
              {categoryLabels[article.category] || article.category}
            </span>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(article.publishedAt)}
            </span>
            </div>
            {article.isPatronage && (
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1 ml-auto">
                <Star className="w-3 h-3 fill-current" />
              </span>
            )}
          </div>
        </div>
      </motion.article>
    );
  }

  // List style (Aktualności)
  if (list) {
    return (
      <motion.article
        onClick={() => navigate(articleHref)}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        className={`group relative overflow-hidden rounded-[1.75rem] border shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col ${article.labelUrgent ? 'bg-red-50 dark:bg-red-950/20 border-red-200/80 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-800/40' : article.labelImportant ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200/80 dark:border-yellow-900/30 hover:border-yellow-300 dark:hover:border-yellow-800/40' : 'bg-white dark:bg-card border-slate-100/80 dark:border-border hover:border-slate-200 dark:hover:border-border/80'}`}
      >
        {/* Image Section */}
        <div className="relative w-full overflow-hidden shrink-0 rounded-t-[1.75rem]" style={{ height: '200px' }}>
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-200" />
          )}
          
          {/* Patronage Badge - Top Left */}
          {article.isPatronage && (
            <div className="absolute top-3 left-3 z-20">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm uppercase tracking-wider">
                <Star className="w-2.5 h-2.5 fill-current" />
                Patronat Redakcji
              </span>
            </div>
          )}

          {/* Type Badge - Top Left */}
          <div className="absolute top-4 left-4 z-20">
            <ArticleTypeBadge article={article} />
          </div>

          {/* Category Badge - Top Right */}
          <div className="absolute top-3 right-3 z-20">
            <span
              onClick={(e) => {
                e.stopPropagation();
                navigate(getCategoryHref(article.category));
              }}
              className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full text-white ${categoryColors[article.category]} shadow-md uppercase tracking-wider hover:scale-105 transition-transform cursor-pointer`}
            >
              {categoryLabels[article.category] || article.category}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 pb-3 pt-1 flex flex-col flex-1 relative">
          {/* Labels row */}
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            <ArticleLabels article={article} />
          </div>

          {article.personName && (
            <span className="text-[11px] font-black text-rose-500 uppercase tracking-wider mb-0.5 block">
              {article.personName}
            </span>
          )}
          <h3 className={`font-black text-[1.25rem] sm:text-[1.45rem] text-slate-900 leading-[1.2] tracking-tight mb-1.5 transition-colors duration-300 line-clamp-2 ${categoryTextColors[article.category] || "group-hover:text-primary"}`}>
            {article.title}
          </h3>

          <p className="text-slate-700 text-sm mb-3 leading-[1.65] relative z-10 font-normal">
            {article.excerpt.length > 520 ? article.excerpt.substring(0, 520) + '...' : article.excerpt}
          </p>
          
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
          
          <div className="pt-2.5 border-t border-slate-200 dark:border-border/60 flex flex-row items-end justify-between gap-3 mt-auto relative z-10">
            <ArticleAuthorMeta
              authorName={article.author}
              publishedAt={article.publishedAt}
              authorImage={article.authorImage}
              authorSlug={article.authorSlug}
            />

            <div className={`mb-0.5 flex items-center gap-1.5 text-slate-600 dark:text-muted-foreground transition-all duration-300 bg-white dark:bg-muted/40 px-4 py-2 rounded-full border border-slate-200 dark:border-border/60 shadow-sm ${categoryHoverBg[article.category] || "group-hover:border-primary group-hover:text-primary dark:group-hover:text-primary group-hover:shadow-md"}`}>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] transition-colors">
                Czytaj
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  // Featured card (Magazine Style)
  return (
    <motion.article
      onClick={() => navigate(articleHref)}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden border transition-all duration-500 cursor-pointer ${
        isMobile
          ? "rounded-[1.75rem] border-border/70 bg-card/98 shadow-[0_16px_48px_-8px_rgba(15,23,42,0.12)] backdrop-blur-sm"
          : "rounded-[2rem] bg-card border-border shadow-md hover:shadow-2xl hover:-translate-y-1"
      }`}
    >
      <div className={`relative overflow-hidden shrink-0 ${large ? "h-56 sm:h-64" : wide ? "h-48 sm:h-52 lg:h-56" : wideCompact ? "h-36 sm:h-40 lg:h-44" : "h-48"}`}>
        <div className={`relative h-full w-full overflow-hidden ${large || wide || wideCompact ? "" : "rounded-t-[1.75rem] bg-slate-100"}`}>
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,#e2e8f0,#f8fafc)]" />
          )}
          <div 
            className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: large || wide || wideCompact ? 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)' : 'linear-gradient(to top, rgba(15,23,42,0.72) 0%, rgba(15,23,42,0.16) 52%, rgba(15,23,42,0.04) 100%)' }}
          />
          
          <div className={`absolute left-3 flex flex-col gap-1.5 items-start ${large ? "top-3" : "top-3.5"}`}>
            <ArticleTypeBadge article={article} />
            {article.isPatronage && (
              <span className="flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm uppercase tracking-wider">
                <Star className="w-2.5 h-2.5 fill-current" />
                Patronat Redakcji
              </span>
            )}
          </div>

          <div className={`absolute right-3 flex flex-col gap-1.5 items-end ${large ? "top-3" : "bottom-3.5"}`}>
            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full text-white ${categoryColors[article.category]} shadow-md uppercase tracking-wider`}>
              {categoryLabels[article.category]}
            </span>
          </div>

          {(large || wide || wideCompact) && (
            <div className={`absolute bottom-0 left-0 right-0 text-white ${large ? "p-4" : wideCompact ? "p-3 sm:p-4" : "p-4 sm:p-5"}`}>
              <div className="flex flex-wrap gap-1 mb-2">
                <ArticleLabels article={article} />
              </div>
              <h3 className={`font-black leading-tight mb-2 drop-shadow-md ${large ? "text-lg sm:text-xl" : wideCompact ? "text-[15px] sm:text-base" : "text-lg sm:text-xl"}`}>
                {article.title}
              </h3>
              <div className={`flex items-center gap-3 text-white/80 font-medium ${wideCompact ? "text-[9px]" : "text-[10px]"}`}>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(article.publishedAt)}
                </span>
                <span 
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    const slug = article.author.toLowerCase().replace(/\s+/g, '-');
                    navigate(`/autor/${slug}`);
                  }}
                >
                  <User className="w-3 h-3" />
                  {article.author}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Content below image (only for non-large cards) */}
      {!large && !wide && !wideCompact && (
        <div className={`${isMobile ? "px-3.5 pb-3.5 pt-2" : "px-4 pb-4 pt-2"} flex flex-col`}>
          <h3 className={`font-black text-base leading-[1.3] tracking-tight text-slate-900 mb-1.5 transition-colors duration-300 line-clamp-2 ${categoryTextColors[article.category] || "group-hover:text-primary"}`}>
            {article.title}
          </h3>
          <p className="text-[13px] leading-[1.6] text-slate-600 line-clamp-3 font-normal">
            {article.excerpt}
          </p>
          <div className="mt-auto">
            <div className="flex items-center justify-between pt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                {formatShortDate(article.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-900 opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
                Przeczytaj
                <ArrowRight className="w-3.5 h-3.5 text-primary transition-all duration-300 group-hover:translate-x-1.5" />
              </span>
            </div>
            <div className="mt-0.5 border-b border-slate-200" />
          </div>
        </div>
      )}
    </motion.article>
  );
}
