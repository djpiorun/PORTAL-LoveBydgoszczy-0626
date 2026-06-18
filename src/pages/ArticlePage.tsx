import { useParams, Link, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import Comments from "@/components/Comments";
import NotFound from "@/pages/NotFound";
import AuthorFooterCard from "@/components/AuthorFooterCard";
import ArticlePoll from "@/components/article/ArticlePoll";
import ArticleQuiz from "@/components/article/ArticleQuiz";
import ArticleInterview from "@/components/article/ArticleInterview";
import ArticleAnalysis from "@/components/article/ArticleAnalysis";
import ArticleReport from "@/components/article/ArticleReport";
import ArticleOpinion from "@/components/article/ArticleOpinion";
import ArticleDialog from "@/components/article/ArticleDialog";
import ArticleAnnouncement from "@/components/article/ArticleAnnouncement";
import ArticleSponsored from "@/components/article/ArticleSponsored";
import ArticleSport from "@/components/article/ArticleSport";
import ArticlePolitics from "@/components/article/ArticlePolitics";
import ArticleInvestment from "@/components/article/ArticleInvestment";
import ArticleOurActions from "@/components/article/ArticleOurActions";
import ArticleInlineAd from "@/components/ads/ArticleInlineAd";
import ArticleTTS from "@/components/article/ArticleTTS";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, User, ArrowLeft, Share2, Heart, MessageSquare,
  BookmarkPlus, Star, Tag, Zap, AlertTriangle, Info, PenTool,
  Newspaper, Mic, BarChart2, FileText, Lightbulb, Users, Send,
  DollarSign, ExternalLink, BookOpen,
  RefreshCw, Link2, ShieldCheck, Flame, Home, ZoomIn, X,
  PhoneCall, HeartHandshake, RefreshCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getArticleHref, getCategoryHref } from "@/lib/articleRouting";

// AgeGate overlay component
function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: "blur(12px) brightness(0.55)", WebkitBackdropFilter: "blur(12px) brightness(0.55)", backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl p-10 max-w-md w-full mx-4 text-center border border-red-200 dark:border-red-900 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <div className="relative mx-auto mb-6 w-24 h-24">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-xl shadow-red-500/40 ring-4 ring-red-200 dark:ring-red-900">
              <span className="text-white font-black text-3xl tracking-tight">18+</span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">Publikacja dla Pełnoletnich</h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-xs mx-auto">
            Ta treść jest przeznaczona wyłącznie dla osób, które ukończyły 18 lat. Potwierdź swój wiek, aby kontynuować.
          </p>

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(220,38,38,0.35)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onConfirm}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-500/25 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <span className="text-base">✓</span> Mam ukończone 18 lat — wejdź
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/")}
              className="w-full py-3.5 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 font-semibold rounded-2xl transition-all text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700"
            >
              <Home className="w-4 h-4" /> Nie mam 18 lat
            </motion.button>
          </div>

          <p className="text-[11px] text-muted-foreground mt-5 leading-relaxed">
            Klikając „Wejdź" potwierdzasz, że masz ukończone 18 lat i wyrażasz zgodę na wyświetlenie treści dla dorosłych.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MobileMetaPill({
  icon: Icon,
  label,
}: {
  icon: any;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/80 px-3 py-1.5 text-[11px] font-bold text-foreground/70 backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span>{label}</span>
    </div>
  );
}

const categoryColors: Record<string, string> = {
  miasto: "bg-blue-500",
  rozrywka: "bg-purple-500",
  kultura: "bg-amber-500",
  biznes: "bg-emerald-500",
  gastronomia: "bg-orange-500",
  bydgoszczanie: "bg-rose-500",
  medyczna: "bg-teal-500",
  sport: "bg-sky-500",
  polityka: "bg-slate-600",
  inwestycje: "bg-yellow-600",
  nasze_dzialania: "bg-pink-500",
};

const categoryLabels: Record<string, string> = {
  miasto: "Miasto",
  rozrywka: "Rozrywka",
  kultura: "Kultura",
  biznes: "Biznes",
  gastronomia: "Gastronomia",
  bydgoszczanie: "Bydgoszczanie",
  medyczna: "Medyczna",
  sport: "Sport",
  polityka: "Polityka",
  inwestycje: "Inwestycje",
  nasze_dzialania: "Nasze Działania",
};

const articleTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  news: { label: "Wiadomość", icon: Newspaper, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  interview: { label: "Wywiad", icon: Mic, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  analysis: { label: "Analiza", icon: BarChart2, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
  report: { label: "Reportaż", icon: FileText, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  opinion: { label: "Opinia", icon: Lightbulb, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  dialog: { label: "Dialog", icon: Users, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" },
  press_release: { label: "Komunikat prasowy", icon: Send, color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700" },
  sponsored: { label: "Sponsorowany", icon: DollarSign, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  quiz: { label: "QUIZ", icon: BookOpen, color: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300" },
};

const articleTypePageThemes: Record<string, string> = {
  interview: "bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_24%),linear-gradient(180deg,#fff7ed_0%,#ffffff_38%)]",
  analysis: "bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.09),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#ffffff_40%)]",
  report: "bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.08),transparent_24%),linear-gradient(180deg,#fffbeb_0%,#ffffff_42%)]",
  opinion: "bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_24%),linear-gradient(180deg,#faf5ff_0%,#ffffff_42%)]",
  dialog: "bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.08),transparent_24%),linear-gradient(180deg,#f5f3ff_0%,#ffffff_42%)]",
  press_release: "bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(239,68,68,0.07),transparent_24%),linear-gradient(180deg,#ecfeff_0%,#ffffff_42%)]",
  sponsored: "bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_24%),linear-gradient(180deg,#fdf2f8_0%,#ffffff_42%)]",
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  });
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
  });
}

function ImageCredit({ credit }: { credit?: string }) {
  if (!credit?.trim()) return null;
  return (
    <p className="mt-2 text-right text-[11px] font-medium tracking-[0.01em] text-muted-foreground">
      Fot. {credit}
    </p>
  );
}

function getTitleClasses(title: string) {
  const base = "font-black text-foreground tracking-[-0.03em]";
  if (title.length > 110) return `${base} text-[1.65rem] sm:text-3xl lg:text-[2.5rem] leading-[1.12]`;
  if (title.length > 65) return `${base} text-[1.85rem] sm:text-[2.2rem] lg:text-[2.85rem] leading-[1.08]`;
  return `${base} text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem] leading-[1.05]`;
}

function getBydgoszczanieTitleClasses(title: string) {
  const base = "font-black tracking-tight text-white";
  if (title.length > 125) return `${base} text-3xl sm:text-4xl lg:text-[3.6rem] leading-[1.02]`;
  if (title.length > 80) return `${base} text-4xl sm:text-[2.9rem] lg:text-[4.2rem] leading-[1]`;
  return `${base} text-4xl sm:text-5xl lg:text-[4.8rem] leading-[0.96]`;
}

function getBydgoszczanieProfile(article: any) {
  const profile = article?.bydgoszczanie ?? {};
  return {
    displayName: profile.displayName || article?.personName || "",
    aboutHero: profile.aboutHero || "",
    portraitUrl: profile.portraitUrl || "",
    storyTitle: profile.storyTitle || "",
    storyDescription: profile.storyDescription || "",
    gallery: Array.isArray(profile.gallery) ? profile.gallery.filter(Boolean) : [],
  };
}

function BydgoszczanieHeroSection({ article }: { article: any }) {
  const profile = getBydgoszczanieProfile(article);
  const hasProfile =
    !!profile.displayName ||
    !!profile.aboutHero ||
    !!profile.portraitUrl;

  if (!hasProfile) return null;

  return (
    <div className="mb-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-rose-200/70 bg-[linear-gradient(180deg,rgba(255,244,248,1),rgba(255,255,255,0.98))] shadow-[0_24px_70px_rgba(244,63,94,0.10)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-6 h-28 w-28 rounded-full bg-rose-200/45 blur-3xl" />
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[2rem] bg-white/40" />
          <div className="absolute bottom-0 right-10 h-32 w-32 rounded-full bg-amber-100/35 blur-3xl" />
        </div>
        <div className="relative grid gap-0 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="flex items-center justify-center border-b border-rose-200/60 bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.18),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,244,247,0.92))] px-4 py-5 lg:border-b-0 lg:border-r">
            {profile.portraitUrl ? (
              <div className="h-28 w-28 overflow-hidden rounded-full border-[5px] border-white shadow-[0_18px_50px_rgba(244,63,94,0.18)] sm:h-32 sm:w-32">
                <img src={profile.portraitUrl} alt={profile.displayName || article.title} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-rose-200 bg-white text-center text-sm font-medium text-rose-300 sm:h-32 sm:w-32">
                Bohater historii
              </div>
            )}
          </div>

          <div className="space-y-4 px-5 py-5 sm:px-6">
            {profile.displayName && (
              <div>
                <span className="inline-flex rounded-full border border-rose-300 bg-rose-500 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-sm shadow-rose-500/20">
                  {profile.displayName}
                </span>
              </div>
            )}

            {profile.aboutHero && (
              <div className="rounded-[1.5rem] border border-white/80 bg-white/92 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-rose-300 via-rose-200 to-transparent" />
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-rose-500">Dzisiaj o naszym bohaterze...</p>
                </div>
                <div
                  className="article-content prose prose-lg mt-3 max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: profile.aboutHero }}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function BydgoszczanieAfterContent({ article }: { article: any }) {
  const profile = getBydgoszczanieProfile(article);
  const hasExtraSection = !!profile.storyTitle || !!profile.storyDescription;
  const hasGallery = profile.gallery.length > 0;

  if (!hasExtraSection && !hasGallery) return null;

  return (
    <div className="mt-6 space-y-4">
      {hasExtraSection && (
        <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,249,251,0.96))] p-5 shadow-sm sm:p-6">
          {profile.storyTitle && (
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-amber-300 via-rose-100 to-transparent" />
                <h3 className="text-2xl font-black tracking-tight text-amber-700 sm:text-[2rem]">
                  {profile.storyTitle}
                </h3>
              </div>
            </div>
            
          )}
          {profile.storyDescription && (
            <div
              className="article-content prose prose-lg mt-4 max-w-none text-slate-600"
              dangerouslySetInnerHTML={{ __html: profile.storyDescription }}
            />
          )}
        </section>
      )}

      {hasGallery && (
        <section className="rounded-[2rem] border border-rose-100 bg-[linear-gradient(180deg,rgba(255,247,250,0.92),rgba(255,255,255,1))] p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-2xl font-black tracking-tight text-rose-700">Zdjęcia i kadry bohatera</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-rose-200 via-rose-100 to-transparent" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {profile.gallery.map((imageUrl: string, index: number) => (
              <InteractiveArticleImage
                key={`${imageUrl}-${index}`}
                imageUrl={imageUrl}
                title={`${article.title} - galeria ${index + 1}`}
                className="h-64 overflow-hidden rounded-[1.6rem] shadow-[0_12px_34px_rgba(244,63,94,0.12)]"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function BydgoszczanieCoverHeader({ article }: { article: any }) {
  const profile = getBydgoszczanieProfile(article);

  if (!article.imageUrl) {
    return (
      <div className="mb-5">
        <h1 className={getTitleClasses(article.title)}>{article.title}</h1>
      </div>
    );
  }

  return (
    <div className="mb-6 overflow-hidden rounded-[2.35rem] border border-rose-100/80 bg-white shadow-[0_28px_90px_rgba(244,63,94,0.14)]">
      <div className="relative overflow-hidden rounded-[2rem]">
        <InteractiveArticleImage
          imageUrl={article.imageUrl}
          title={article.title}
          className="aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[18/8]"
        />
        <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent px-5 pb-5 pt-16 sm:px-7 sm:pb-6 sm:pt-24">
          <div className="max-w-4xl">
            {profile.displayName && (
              <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/14 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md shadow-sm">
                {profile.displayName}
              </span>
            )}
            <h1 className={getBydgoszczanieTitleClasses(article.title)}>
              {article.title}
            </h1>
          </div>
        </div>
      </div>
      <div className="bg-white px-5 pb-3 pt-2 sm:px-7">
        <ImageCredit credit={(article as any).imageAuthor} />
      </div>
    </div>
  );
}

function InteractiveArticleImage({
  imageUrl,
  title,
  className,
  imageClassName,
}: {
  imageUrl: string;
  title: string;
  className: string;
  imageClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        onClick={() => setIsOpen(true)}
        className={`${className} group relative cursor-zoom-in text-left`}
      >
        <img src={imageUrl} alt={title} className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${imageClassName || ""}`} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/70 bg-white/18 text-white shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-md transition-all duration-300 group-hover:scale-110">
            <ZoomIn className="h-11 w-11 transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/88 px-4 py-8 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Zamknij podglad zdjecia"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.22 }}
              src={imageUrl}
              alt={title}
              className="max-h-full max-w-full rounded-[2rem] object-contain shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
              onClick={(event) => event.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AuthorAvatar({ name, image, slug }: { name: string; image?: string; slug?: string }) {
  const authorSlug = slug || name.toLowerCase().replace(/\s+/g, "-");
  return (
    <Link to={`/autor/${authorSlug}`} className="flex items-center gap-3 group">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-2 ring-border group-hover:ring-primary/50 transition-all">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{name}</p>
        <p className="text-xs text-muted-foreground">Autor</p>
      </div>
    </Link>
  );
}

/** PILNE — czerwone tło z ukośnym paskiem-watermarkiem */
function UrgentBanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/30">
      {/* Diagonal watermark strip */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div
          className="absolute inset-0 flex items-center"
          style={{
            background: "repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(255,255,255,0.07) 60px, rgba(255,255,255,0.07) 120px)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-start overflow-hidden">
          <div
            className="whitespace-nowrap text-white/10 font-black text-4xl uppercase tracking-widest select-none"
            style={{ transform: "rotate(-8deg) translateY(-10px)", letterSpacing: "0.3em" }}
          >
            {Array(8).fill("🔴 PILNE").join("  ")}
          </div>
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-3 px-6 py-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Flame className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <p className="text-white font-black text-lg uppercase tracking-widest leading-none">Pilne</p>
          <p className="text-red-100 text-xs font-semibold mt-0.5">Ważna informacja — przeczytaj teraz</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
            <Zap className="w-3 h-3 fill-white" /> PILNE
          </span>
        </div>
      </div>
    </div>
  );
}

/** WAŻNE — żółte/bursztynowe tło z gradientem */
function ImportantBanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-lg shadow-amber-400/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div
          className="absolute inset-0"
          style={{
            background: "repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(255,255,255,0.08) 60px, rgba(255,255,255,0.08) 120px)",
          }}
        />
      </div>
      <div className="relative z-10 flex items-center gap-3 px-6 py-4">
        <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-900 fill-amber-900/20" />
        </div>
        <div>
          <p className="text-amber-900 font-black text-lg uppercase tracking-widest leading-none">Ważne</p>
          <p className="text-amber-800 text-xs font-semibold mt-0.5">Ten temat wymaga Twojej uwagi</p>
        </div>
        <div className="ml-auto">
          <span className="bg-amber-900/20 text-amber-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> WAŻNE
          </span>
        </div>
      </div>
    </div>
  );
}

/** KOMUNIKAT PRASOWY — ramka na dole artykułu */
/** DEPRESJA — ramka wsparcia kryzysowego na dole artykułu */
function BeingUpdatedBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-8 overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-yellow-50 shadow-lg shadow-amber-100/50 dark:from-amber-950/30 dark:via-background dark:to-yellow-950/20 dark:border-amber-800/50"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400" />
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-400/30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCcw className="h-5 w-5 text-white" />
          </motion.div>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">W trakcie aktualizacji</p>
          <p className="text-sm font-semibold text-foreground leading-relaxed">
            Publikacja w trakcie aktualizacji. Pilny komunikat zostanie uzupełniony gdy uda nam się uzyskać więcej informacji.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function DepressionSupportBox() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-10 overflow-hidden rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 shadow-lg shadow-violet-100/50 dark:from-violet-950/30 dark:via-background dark:to-indigo-950/20 dark:border-violet-800/50"
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
            <HeartHandshake className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-1">Ważna informacja</p>
            <h3 className="text-xl font-black text-foreground leading-tight">Gdzie szukać pomocy?</h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          Jeśli przeżywasz trudny czas, jesteś w kryzysie lub masz myśli samobójcze — nie zostawaj z tym sam/a. Wsparcie jest dostępne bezpłatnie, całą dobę.
        </p>

        {/* Helplines */}
        <div className="grid gap-3 sm:grid-cols-3 mb-5">
          {[
            { number: "800 70 22 22", label: "Centrum Wsparcia", desc: "Czynne 24/7", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
            { number: "116 111", label: "Telefon Zaufania", desc: "Dla dzieci i młodzieży", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
            { number: "116 123", label: "Wsparcie dla dorosłych", desc: "Bezpłatna pomoc", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
          ].map((line) => (
            <a
              key={line.number}
              href={`tel:${line.number.replace(/\s/g, "")}`}
              className={`flex items-center gap-3 rounded-xl border border-border/50 bg-background/80 p-3.5 transition-all hover:shadow-md hover:-translate-y-0.5 ${line.color}`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-current/10">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-black text-base leading-none">{line.number}</p>
                <p className="text-xs font-semibold mt-0.5 opacity-80 truncate">{line.label}</p>
                <p className="text-[10px] opacity-60 truncate">{line.desc}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Emergency */}
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
            <PhoneCall className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            W sytuacji bezpośredniego zagrożenia życia zadzwoń pod numer <strong className="font-black">112</strong>
          </p>
        </div>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Nie musisz radzić sobie z tym sam/a. Pomoc jest bezpłatna i dostępna całą dobę.
        </p>
      </div>
    </motion.div>
  );
}

function PressReleaseFooterBlock({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.52 }}
      className="mt-10 p-6 rounded-2xl border-2 border-cyan-200 bg-cyan-50/60 dark:bg-cyan-500/10 dark:border-cyan-500/30"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/30">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-cyan-600 uppercase tracking-widest mb-1">Komunikat Prasowy</p>
          <p className="text-sm text-cyan-800 dark:text-cyan-200 font-medium leading-relaxed">
            Powyższy materiał <strong>„{title}"</strong> jest komunikatem prasowym. Redakcja portalu <strong>Love Bydgoszcz</strong> nie ponosi odpowiedzialności za treść komunikatów prasowych, które są publikowane na zlecenie podmiotów zewnętrznych.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/** NASZA WIADOMOŚĆ — ramka na dole artykułu */
function OurNewsFooterBlock({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.52 }}
      className="mt-10 p-6 rounded-2xl border-2 border-blue-200 bg-blue-50/60 dark:bg-blue-500/10 dark:border-blue-500/30"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Nasz Tekst</p>
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
            Powyższy materiał <strong>„{title}"</strong> został przygotowany wyłącznie przez redakcję portalu <strong>Love Bydgoszcz</strong>. Treść jest oryginalnym dziełem naszych dziennikarzy i nie pochodzi z zewnętrznych źródeł.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function getPartnerSponsorData(article: any) {
  const sponsored = (article as any).sponsored;

  return {
    label:
      article.partnerLabel ||
      sponsored?.sponsorBoxTitle ||
      sponsored?.sponsorLabel ||
      "Partner / Sponsor artykulu",
    name: article.partnerName || sponsored?.partnerName,
    logoUrl: article.partnerLogoUrl || sponsored?.partnerLogo,
    url: article.partnerUrl || sponsored?.partnerUrl,
  };
}

function PartnerSponsorCard({ article }: { article: any }) {
  const partner = getPartnerSponsorData(article);
  const hasLogo = !!partner.logoUrl;
  const hasUrl = !!partner.url;

  // Logo version: show logo only, name as tooltip
  const logoVisual = (
    <div className="mt-3 flex items-center justify-center" title={partner.name || undefined}>
      <img src={partner.logoUrl} alt={partner.name || "Partner"} className="max-h-16 max-w-[220px] object-contain transition-transform duration-200 hover:scale-105" />
    </div>
  );

  // Name-only version: larger, prominent centered text
  const nameVisual = (
    <div className="mt-4 flex items-center justify-center py-3">
      <span className="text-2xl font-black leading-snug tracking-[-0.02em] text-foreground text-center">
        {partner.name}
      </span>
    </div>
  );

  const visual = hasLogo ? logoVisual : nameVisual;

  const content = (
    <div className="rounded-[24px] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] px-6 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{partner.label}</p>
      {hasUrl ? (
        <a href={partner.url} target="_blank" rel="noreferrer" className="block" title={hasLogo ? partner.name || undefined : undefined}>
          {visual}
        </a>
      ) : (
        visual
      )}
    </div>
  );

  return content;
}

/** MUSISZ WIEDZIEĆ — informacyjny baner */
function MustKnowBanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div
          className="absolute inset-0"
          style={{
            background: "repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(255,255,255,0.06) 60px, rgba(255,255,255,0.06) 120px)",
          }}
        />
      </div>
      <div className="relative z-10 flex items-center gap-3 px-6 py-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <BookmarkPlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-black text-lg uppercase tracking-widest leading-none">Musisz wiedzieć</p>
          <p className="text-violet-200 text-xs font-semibold mt-0.5">Ważna informacja dla mieszkańców</p>
        </div>
        <div className="ml-auto">
          <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
            <Info className="w-3 h-3" /> INFO
          </span>
        </div>
      </div>
    </div>
  );
}

/** ARTYKUŁ AUTORA — wyróżnienie autora */
function AuthorArticleBanner({ author }: { author: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-teal-600 to-emerald-600 shadow-lg shadow-teal-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div
          className="absolute inset-0"
          style={{
            background: "repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(255,255,255,0.06) 60px, rgba(255,255,255,0.06) 120px)",
          }}
        />
      </div>
      <div className="relative z-10 flex items-center gap-3 px-6 py-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <PenTool className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-black text-lg uppercase tracking-widest leading-none">Artykuł Autora</p>
          <p className="text-teal-100 text-xs font-semibold mt-0.5">Wyjątkowy materiał przygotowany przez <strong>{author}</strong></p>
        </div>
        <div className="ml-auto">
          <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" /> AUTOR
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Graphics Layout: renders image in different positions ───────────────────
function ArticleImage({
  imageUrl,
  title,
  graphicsLayout,
  imageAuthor,
}: {
  imageUrl: string;
  title: string;
  graphicsLayout?: string;
  imageAuthor?: string;
}) {
  if (graphicsLayout === "none") return null;

  if (graphicsLayout === "background" || graphicsLayout === "background_blur") {
    return (
      <div className="mb-8">
        <div
          className={`w-full rounded-[2rem] overflow-hidden shadow-2xl relative ${graphicsLayout === "background_blur" ? "h-[420px] sm:h-[520px]" : "h-[400px] sm:h-[500px]"}`}
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: graphicsLayout === "background_blur" ? "saturate(1.08)" : undefined,
          }}
        >
          <div className={`absolute inset-0 rounded-[2rem] ${graphicsLayout === "background_blur" ? "backdrop-blur-[2px] bg-slate-950/35" : "bg-gradient-to-t from-black/70 via-black/20 to-transparent"}`} />
        </div>
        <ImageCredit credit={imageAuthor} />
      </div>
    );
  }

  if (graphicsLayout === "left" || graphicsLayout === "right" || graphicsLayout === "split") {
    return null; // handled inline in content area
  }

  const variantClassMap: Record<string, string> = {
    default: "w-full h-[400px] sm:h-[500px]",
    top_full: "w-full h-[480px] sm:h-[620px]",
    square_top: "w-full max-w-3xl mx-auto aspect-square",
    rectangle_top: "w-full h-[360px] sm:h-[420px]",
    portrait_top: "w-full max-w-xl mx-auto aspect-[4/5]",
    card_floating: "w-full max-w-4xl mx-auto h-[380px] sm:h-[460px] -mb-4",
    cinema: "w-full h-[300px] sm:h-[380px] lg:h-[460px]",
    gallery_cover: "w-full h-[460px] sm:h-[560px]",
  };

  const containerClass = variantClassMap[graphicsLayout ?? "default"] ?? variantClassMap.default;

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        <InteractiveArticleImage imageUrl={imageUrl} title={title} className={`${containerClass} rounded-[2rem] overflow-hidden shadow-2xl relative`} />
        {graphicsLayout === "gallery_cover" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-6 py-8 text-white">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-white/75">Galeria / Foto cover</p>
            <p className="mt-2 max-w-md text-sm text-white/90">Ten wariant eksponuje duże otwarcie wizualne i przygotowuje miejsce pod rozwinięcie zdjęć w treści artykułu.</p>
          </div>
        )}
      </motion.div>
      <ImageCredit credit={imageAuthor} />
    </div>
  );
}

// ─── Content area with optional side image ───────────────────────────────────
function ArticleContentArea({
  article,
  graphicsLayout,
}: {
  article: any;
  graphicsLayout?: string;
}) {
  const hasSideImage = article.imageUrl && (graphicsLayout === "left" || graphicsLayout === "right");

  const contentBlock = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="prose prose-lg dark:prose-invert max-w-none"
    >
      <div className="relative mb-6 rounded-2xl border border-border/60 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6">
        <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-primary/60" />
        <p className="pl-3 text-base sm:text-lg font-medium leading-relaxed text-foreground/80 tracking-[-0.01em]">
          {article.excerpt}
        </p>
      </div>
      <div
        className="text-foreground leading-relaxed article-content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </motion.div>
  );

  if (!hasSideImage) return contentBlock;

  const sideImageClass =
    graphicsLayout === "left"
      ? "w-72 lg:w-80"
      : "w-64 lg:w-72";

  return (
    <div className={`flex gap-8 items-start mb-8 max-lg:flex-col ${graphicsLayout === "right" ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`${sideImageClass} flex-shrink-0`}>
        <InteractiveArticleImage imageUrl={article.imageUrl} title={article.title} className="rounded-2xl overflow-hidden shadow-xl" imageClassName="h-auto" />
        <ImageCredit credit={(article as any).imageAuthor} />
      </div>
      <div className="flex-1 min-w-0">{contentBlock}</div>
    </div>
  );
}

// ─── Category layout wrapper ──────────────────────────────────────────────────
function CategoryLayoutWrapper({
  category,
  categoryLayout,
  children,
}: {
  category: string;
  categoryLayout?: string;
  children: React.ReactNode;
}) {
  if (categoryLayout === "highlight") {
    const colorMap: Record<string, string> = {
      miasto: "border-blue-500/30 bg-blue-50/30 dark:bg-blue-500/5",
      rozrywka: "border-purple-500/30 bg-purple-50/30 dark:bg-purple-500/5",
      kultura: "border-amber-500/30 bg-amber-50/30 dark:bg-amber-500/5",
      biznes: "border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-500/5",
      gastronomia: "border-orange-500/30 bg-orange-50/30 dark:bg-orange-500/5",
      bydgoszczanie: "border-rose-500/30 bg-rose-50/30 dark:bg-rose-500/5",
      medyczna: "border-teal-500/30 bg-teal-50/30 dark:bg-teal-500/5",
    };
    return (
      <div className={`rounded-3xl border-2 p-6 sm:p-8 ${colorMap[category] ?? "border-border bg-muted/20"}`}>
        {children}
      </div>
    );
  }

  if (categoryLayout === "minimal") {
    return <div className="max-w-2xl mx-auto">{children}</div>;
  }

  if (categoryLayout === "magazine") {
    return (
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full" />
        <div className="pl-6">{children}</div>
      </div>
    );
  }

  // default
  return <>{children}</>;
}

function ArticleContentWithEmbeds({ article }: { article: any }) {
  const poll = article.poll;
  const content = article.content ?? "";
  const shortcodePattern = /\[(ankieta(?:-[^[\]\s"]+)?)(?:\s+id="([^"]+)")?\]/g;
  const segments: Array<{ type: "html" | "poll"; value?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = shortcodePattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "html", value: content.slice(lastIndex, match.index) });
    }
    const shortcodeName = match[1];
    const shortcodeId = match[2];
    const matchesPoll =
      shortcodeName === "ankieta" ||
      shortcodeName === poll?.pollId ||
      shortcodeId === poll?.pollId;

    if (matchesPoll) {
      segments.push({ type: "poll" });
    } else {
      segments.push({ type: "html", value: match[0] });
    }
    lastIndex = shortcodePattern.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "html", value: content.slice(lastIndex) });
  }

  const shortcodeUsed = content.includes("[ankieta]") || (!!poll?.pollId && content.includes(`[${poll.pollId}]`));

  return (
    <div className="text-foreground leading-relaxed article-content">
      {segments.map((segment, index) => {
        if (segment.type === "poll" && poll?.enabled) {
          return <ArticlePoll key={`poll-${index}`} articleId={article._id} poll={poll} />;
        }

        if (!segment.value) return null;
        return <div key={`content-${index}`} dangerouslySetInnerHTML={{ __html: segment.value }} />;
      })}

      {!shortcodeUsed && poll?.enabled && poll.showBelowArticleWhenNoShortcode && (
        <ArticlePoll articleId={article._id} poll={poll} />
      )}
    </div>
  );
}

// ─── Element renderer ─────────────────────────────────────────────────────────
function renderElement(
  id: string,
  article: any,
  updates: any[] | undefined,
  commentCount: number | undefined,
  hasSource: boolean,
  hasPartner: boolean,
  hasFooter: boolean,
  graphicsLayout?: string,
) {
  const extraSources = (() => {
    try {
      return article.sourceFromContact ? JSON.parse(article.sourceFromContact) : [];
    } catch {
      return [];
    }
  })() as Array<{ name?: string; url?: string }>;
  const validExtraSources = extraSources.filter((source) => source?.name || source?.url);

  switch (id) {
    case "image":
      return article.articleType === "quiz" || article.category === "bydgoszczanie" ? null : article.imageUrl ? (
        <ArticleImage
          key="image"
          imageUrl={article.imageUrl}
          title={article.title}
          graphicsLayout={graphicsLayout}
          imageAuthor={(article as any).imageAuthor}
        />
      ) : null;

    case "excerpt":
      return article.articleType === "quiz" ? (
        <motion.div
          key="excerpt"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mb-8 flex justify-center"
        >
          <div className="w-full max-w-2xl rounded-[28px] border border-fuchsia-200 bg-[linear-gradient(180deg,#fff7fb_0%,#ffffff_100%)] px-6 py-7 text-center shadow-[0_18px_44px_rgba(217,70,239,0.10)]">
            <p className="text-xl font-medium leading-relaxed text-slate-600 sm:text-2xl">
              {article.excerpt}
            </p>
          </div>
        </motion.div>
      ) : article.category === "bydgoszczanie" ? (
        <motion.div
          key="excerpt"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mb-4 flex justify-center"
        >
          <div className="w-full rounded-[1.9rem] border border-rose-200 bg-[linear-gradient(180deg,rgba(255,247,250,0.98),rgba(255,255,255,1))] px-5 py-5 shadow-[0_18px_50px_rgba(244,63,94,0.08)] sm:px-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-rose-300 via-rose-200 to-transparent" />
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-rose-500">Wprowadzenie</p>
            </div>
            <p className="mt-3 text-lg font-medium leading-relaxed text-slate-600 sm:text-[1.35rem]">
              {article.excerpt}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="excerpt"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mb-6"
        >
          <div className="relative rounded-2xl border border-border/60 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6">
            <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-primary/60" />
            <p className="pl-3 text-base sm:text-lg font-medium leading-relaxed text-foreground/80 tracking-[-0.01em]">
              {article.excerpt}
            </p>
          </div>
        </motion.div>
      );

    case "content":
      return (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-none"
        >
          {article.category === "bydgoszczanie" && <BydgoszczanieHeroSection article={article} />}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {article.articleType === "quiz" && (article as any).quiz?.enabled ? (
              <div id="article-quiz">
                <ArticleQuiz article={article} quiz={(article as any).quiz} />
              </div>
            ) : article.articleType === "interview" && (article as any).interview?.enabled ? (
              <ArticleInterview article={article} interview={(article as any).interview} />
            ) : article.articleType === "analysis" && (article as any).analysis?.enabled ? (
              <ArticleAnalysis analysis={(article as any).analysis} />
            ) : article.articleType === "report" && (article as any).report?.enabled ? (
              <ArticleReport report={(article as any).report} />
            ) : article.articleType === "opinion" && (article as any).opinion?.enabled ? (
              <ArticleOpinion article={article} opinion={(article as any).opinion} />
            ) : article.articleType === "dialog" && (article as any).dialog?.enabled ? (
              <ArticleDialog dialog={(article as any).dialog} />
            ) : article.articleType === "press_release" && (article as any).announcement?.enabled ? (
              <ArticleAnnouncement article={article} announcement={(article as any).announcement} />
            ) : article.articleType === "sponsored" && (article as any).sponsored?.enabled ? (
              <ArticleSponsored article={article} sponsored={(article as any).sponsored} />
            ) : article.category === "bydgoszczanie" ? (
              <div className="rounded-[2rem] border border-rose-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,249,251,0.96))] px-5 py-5 shadow-[0_18px_54px_rgba(244,63,94,0.06)] sm:px-7 sm:py-6">
                <ArticleContentWithEmbeds article={article} />
                <BydgoszczanieAfterContent article={article} />
              </div>
            ) : (
              <>
                <ArticleContentWithEmbeds article={article} />

                {/* Category-specific components */}
                {article.category === "sport" && (article as any).sport?.enabled && (
                  <ArticleSport data={(article as any).sport} />
                )}
                {article.category === "polityka" && (article as any).politics?.enabled && (
                  <ArticlePolitics data={(article as any).politics} />
                )}
                {article.category === "inwestycje" && (article as any).investment?.enabled && (
                  <ArticleInvestment data={(article as any).investment} />
                )}
                {article.category === "nasze_dzialania" && (article as any).ourActions?.enabled && (
                  <ArticleOurActions data={(article as any).ourActions} />
                )}
              </>
            )}
          </div>
        </motion.div>
      );

    case "author":
      return null;

    case "author_footer": {
      const footerStyle = (article as any).authorFooterStyle ?? "graphic";
      if (footerStyle === "none") return (
        <div key="author_footer_group_none">
          {(article as any).labelBeingUpdated && <BeingUpdatedBanner />}
          {(article as any).labelDepresja ? <DepressionSupportBox key="depression_box" /> : null}
        </div>
      );
      return (
        <div key="author_footer_group">
          {(article as any).labelBeingUpdated && <BeingUpdatedBanner />}
          {article.labelOurNews && <OurNewsFooterBlock title={article.title} />}
          {(article as any).labelDepresja && <DepressionSupportBox />}
          <AuthorFooterCard
            authorName={article.author}
            coauthorName={article.coauthor}
            coauthor2={(article as any).coauthor2}
            coauthor3={(article as any).coauthor3}
            style={footerStyle}
          />
        </div>
      );
    }

    case "tags":
      return article.tags && article.tags.length > 0 ? (
        <motion.div
          key="tags"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-2 pt-0 flex flex-wrap gap-2 items-center"
        >
          <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
            <Tag className="w-3.5 h-3.5" />
            Tagi
          </span>
          {article.tags.map((tag: string) => (
            <Link
              key={tag}
              to={`/szukaj?q=${encodeURIComponent(tag)}`}
              className="bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground px-3 py-1 rounded-full text-sm font-medium transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </motion.div>
      ) : null;

    case "comments":
      return article.allowComments !== false ? (
        <motion.div
          key="comments"
          id="comments"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-6 pt-5 border-t border-border"
        >
          <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-foreground">
            <MessageSquare className="w-5 h-5 text-primary" />
            Komentarze
            {commentCount !== undefined && commentCount > 0 && (
              <span className="text-sm font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{commentCount}</span>
            )}
          </h3>
          <Comments targetId={article._id} targetType="article" />
        </motion.div>
      ) : null;

    case "updates":
      return article.showUpdates !== false && updates && updates.length > 0 ? (
        <motion.section
          key="updates"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-10 rounded-[2rem] border border-border bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,1))] p-4 sm:p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <RefreshCw className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-black text-foreground">
                  {updates.length === 1 ? "Aktualizacja publikacji" : "Aktualizacje publikacji"}
                </h3>
              </div>
            </div>
            {updates.length > 1 && (
              <span className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                {updates.length}
              </span>
            )}
          </div>
          {updates.length === 1 ? (
            /* Single update — simple card without timeline */
            (() => {
              const upd = updates[0] as any;
              const timeLabel = new Date(upd.publishedAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw" });
              const dateLabel = new Date(upd.publishedAt).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Warsaw" });
              return (
                <div className="rounded-2xl border border-primary/20 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Clock className="h-3 w-3" />
                    </span>
                    <p className="text-sm font-bold text-foreground">{timeLabel}</p>
                    <p className="text-[11px] text-muted-foreground">{dateLabel}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80">{upd.content}</p>
                </div>
              );
            })()
          ) : (
            /* Multiple updates — timeline */
            <div className="relative space-y-3 pl-4 before:absolute before:left-[7px] before:top-3 before:bottom-3 before:w-0.5 before:rounded-full before:bg-gradient-to-b before:from-primary/40 before:via-primary/15 before:to-transparent">
              {updates.map((upd: any, index: number) => {
                const timeLabel = new Date(upd.publishedAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw" });
                const dateLabel = new Date(upd.publishedAt).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Warsaw" });
                return (
                  <div key={upd._id} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className={`absolute left-[-4px] top-3 h-3 w-3 rounded-full border-2 border-background ${index === 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${index === 0 ? "border-primary/20 bg-white" : "border-border bg-white/90"}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        {index === 0 && (
                          <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                            Najnowsza
                          </span>
                        )}
                        <span className="text-xs font-bold text-foreground">{timeLabel}</span>
                        <span className="text-[10px] text-muted-foreground">{dateLabel}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80">{upd.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>
      ) : null;

    case "source":
      return hasSource ? (
        <motion.div
          key="source"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-10 p-5 rounded-2xl border border-border bg-muted/30 flex flex-wrap items-start gap-4"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Źródło</p>
            {article.sourceName && <p className="font-semibold text-foreground">{article.sourceName}</p>}
            {article.sourceUrl && (
              <a href={article.sourceUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline break-all">
                {article.sourceUrl} <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            )}
            {validExtraSources.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Dodatkowe źródła</p>
                {validExtraSources.map((source, index) => (
                  <div key={`${source.name || source.url || "source"}-${index}`} className="text-sm text-muted-foreground">
                    {source.name && <span className="font-medium text-foreground">{source.name}</span>}
                    {source.name && source.url && <span className="text-muted-foreground"> - </span>}
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline break-all">
                        {source.url}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ) : null;

    case "expert_quote":
      return article.category === "medyczna" && article.expertQuote ? (
        <motion.div
          key="expert_quote"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.47 }}
          className="mt-6 p-6 sm:p-8 rounded-3xl border border-teal-200/50 bg-teal-50/60 dark:bg-teal-500/10"
        >
          <h3 className="text-xl font-black text-foreground mb-4">Komentarz eksperta</h3>
          <blockquote className="border-l-4 border-teal-400 pl-4 italic text-foreground/80">
            "{article.expertQuote}"
          </blockquote>
        </motion.div>
      ) : null;

    case "bibliography":
      return hasFooter ? (
        <motion.div
          key="bibliography"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mt-10 pt-8 border-t border-border space-y-5"
        >
          {article.bibliography && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2 uppercase tracking-widest">
                <BookOpen className="w-4 h-4" /> Bibliografia
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{article.bibliography}</p>
            </div>
          )}
          {article.sources && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2 uppercase tracking-widest">
                <FileText className="w-4 h-4" /> Źródła
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{article.sources}</p>
            </div>
          )}
          {validExtraSources.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2 uppercase tracking-widest">
                <Link2 className="w-4 h-4" /> Linki źródłowe
              </h4>
              <div className="space-y-2">
                {validExtraSources.map((source, index) => (
                  <div key={`${source.name || source.url || "footer-source"}-${index}`} className="text-sm text-muted-foreground">
                    {source.name && <p className="font-medium text-foreground">{source.name}</p>}
                    {source.url && (
                      <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline break-all">
                        {source.url}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {article.footerInfo && (
            <div className="p-4 rounded-xl bg-muted/40 border border-border">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{article.footerInfo}</p>
            </div>
          )}
        </motion.div>
      ) : null;

    case "patronage":
      return article.isPatronage ? (
        <motion.div
          key="patronage"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 rotate-3">
              <Star className="w-8 h-8 text-white fill-current" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground mb-2">Patronat Medialny</h3>
              <p className="text-muted-foreground leading-relaxed">
                Redakcja Love Bydgoszcz objęła patronat medialny nad wydarzeniem/projektem: <strong className="text-foreground">{article.title}</strong>.
                Patronat świadczy o weryfikacji partnera oraz jego projektów, gwarantując najwyższą jakość i rzetelność informacji.
              </p>
            </div>
          </div>
        </motion.div>
      ) : null;

    case "partner":
      return null;

    default:
      return null;
  }
}

// Default element order when no articleElements saved
const DEFAULT_ELEMENT_ORDER = [
  "image", "author", "excerpt", "updates", "content", "expert_quote",
  "patronage", "partner", "author_footer", "source", "bibliography", "tags", "comments"
];

// ─── NewsArticle JSON-LD injection ────────────────────────────────────────────
function useNewsArticleJsonLd(article: any, canonicalHref: string | null) {
  useEffect(() => {
    if (!article) return;

    const baseUrl = window.location.origin;
    const articleUrl = canonicalHref
      ? (canonicalHref.startsWith("http") ? canonicalHref : `${baseUrl}${canonicalHref}`)
      : window.location.href;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleUrl,
      },
      "headline": article.title,
      "description": article.excerpt || article.seoDescription || "",
      "image": article.imageUrl ? [article.imageUrl] : [],
      "datePublished": new Date(article.publishedAt).toISOString(),
      "dateModified": article.updatedAt
        ? new Date(article.updatedAt).toISOString()
        : new Date(article.publishedAt).toISOString(),
      "author": {
        "@type": "Person",
        "name": article.author || "Redakcja Love Bydgoszcz",
      },
      "publisher": {
        "@type": "Organization",
        "name": "Love Bydgoszcz",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/assets/logo-lovebydgoszcz.png`,
        },
      },
      "isPartOf": {
        "@type": ["CreativeWork", "Product"],
        "name": "Love Bydgoszcz",
        "productID": "CAow6cjEDA:openaccess",
      },
      "isAccessibleForFree": "True",
    };

    const SCRIPT_ID = "article-jsonld";
    let tag = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!tag) {
      tag = document.createElement("script");
      tag.id = SCRIPT_ID;
      tag.type = "application/ld+json";
      document.head.appendChild(tag);
    }
    tag.textContent = JSON.stringify(jsonLd);

    return () => {
      const existing = document.getElementById(SCRIPT_ID);
      if (existing) existing.remove();
    };
  }, [article, canonicalHref]);
}

export default function ArticlePage() {
  const params = useParams<{ id?: string, slug?: string }>();
  const id = params.id || params.slug;
  const navigate = useNavigate();
  const [ageVerified, setAgeVerified] = useState(false);
  const isMobile = useIsMobile();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (article?.category) {
      navigate(`/${article.category}`);
    } else {
      navigate("/");
    }
  };

  const handleMobileShare = async () => {
    const url = window.location.href;
    const title = article?.title || "Love Bydgoszcz";

    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }

    await navigator.clipboard.writeText(url);
  };

  const isValidId = id ? /^[a-zA-Z0-9]{15,30}$/.test(id) && !id.includes("-") && !id.includes("_") : false;
  const articleById = useQuery(api.articles.get, isValidId && id ? { id: id as Id<"articles"> } : "skip");
  const articleBySlug = useQuery(api.articles.getBySlug, id ? { slug: id } : "skip");
  const article = (isValidId ? articleById : null) ?? articleBySlug;
  const updates = useQuery(
    api.articles.getUpdates,
    article?._id ? { articleId: article._id as Id<"articles"> } : "skip"
  );
  const commentCount = useQuery(
    api.comments.countByTarget,
    article?._id ? { targetId: article._id, targetType: "article" } : "skip"
  );
  const canonicalHref = article ? getArticleHref(article) : null;

  if (!id) return <NotFound />;

  if (article === undefined) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {isMobile ? null : <Navbar />}
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium">Ładowanie artykułu...</p>
          </div>
        </div>
        {isMobile ? null : <Footer />}
      </div>
    );
  }

  if (article === null) return <NotFound />;

  const articleTypeInfo = article.articleType && article.articleType !== "news" ? articleTypeLabels[article.articleType] : null;
  const extraSources = (() => {
    try {
      return article.sourceFromContact ? JSON.parse(article.sourceFromContact) : [];
    } catch {
      return [];
    }
  })() as Array<{ name?: string; url?: string }>;
  const validExtraSources = extraSources.filter((source) => source?.name || source?.url);
  const hasSource = !!(article.sourceName || article.sourceUrl || validExtraSources.length);
  const partnerData = getPartnerSponsorData(article);
  const hasPartner = !!(partnerData.name || partnerData.logoUrl || partnerData.url);
  const hasFooter = !!(article.bibliography || article.sources || article.footerInfo || validExtraSources.length);

  // Resolve layout settings from saved article data
  const graphicsLayout: string = (article as any).graphicsLayout ?? "default";
  const categoryLayout: string = (article as any).categoryLayout ?? "default";
  const articleLayout: string = article.layout ?? "standard";
  const hasSplitLayout = article.articleType !== "quiz" && !!article.imageUrl && graphicsLayout === "split";

  // Layout-based container classes
  const layoutContainerClass: Record<string, string> = {
    standard: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
    wide: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
    fullwidth: "max-w-full mx-auto px-4 sm:px-6 lg:px-8",
    magazine: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8",
    minimal: "max-w-2xl mx-auto px-4 sm:px-6",
    hero: "max-w-5xl mx-auto px-0 sm:px-0",
  };
  const articleContainerClass = layoutContainerClass[articleLayout] ?? layoutContainerClass.standard;

  // Build ordered, filtered element list from saved articleElements
  const savedElements: Array<{ id: string; enabled: boolean }> | undefined = (article as any).articleElements;
  let elementOrder: string[] = savedElements
    ? savedElements.filter((e) => e.enabled).map((e) => e.id)
    : DEFAULT_ELEMENT_ORDER;

  if (elementOrder.includes("updates")) {
    elementOrder = elementOrder.filter((elementId) => elementId !== "updates");
    const excerptIdx = elementOrder.indexOf("excerpt");
    const insertAt = excerptIdx === -1 ? 1 : excerptIdx + 1;
    elementOrder = [
      ...elementOrder.slice(0, insertAt),
      "updates",
      ...elementOrder.slice(insertAt),
    ];
  }

  const showPartnerCard = hasPartner && elementOrder.includes("partner");
  if (showPartnerCard) {
    elementOrder = elementOrder.filter((elementId) => elementId !== "partner");
  }

  // Always ensure author_footer appears before tags (inject if missing)
  if (!elementOrder.includes("author_footer")) {
    const tagsIdx = elementOrder.indexOf("tags");
    if (tagsIdx !== -1) {
      elementOrder = [
        ...elementOrder.slice(0, tagsIdx),
        "author_footer",
        ...elementOrder.slice(tagsIdx),
      ];
    } else {
      // Insert before comments or at end
      const commentsIdx = elementOrder.indexOf("comments");
      if (commentsIdx !== -1) {
        elementOrder = [
          ...elementOrder.slice(0, commentsIdx),
          "author_footer",
          ...elementOrder.slice(commentsIdx),
        ];
      } else {
        elementOrder = [...elementOrder, "author_footer"];
      }
    }
  }

  const showAgeGate = !!(article as any).label18Plus && !ageVerified;
  const pageThemeClass = article.category === "bydgoszczanie"
    ? "bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.10),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.08),transparent_22%),linear-gradient(180deg,#fff4f8_0%,#ffffff_38%)]"
    : articleTypePageThemes[article.articleType ?? ""] ?? "bg-background";

  if (isMobile) {
    const heroImage = article.imageUrl || "/logo-love-bydgoszcz.png";
    const articleCategoryColor = categoryColors[article.category] || "bg-primary";

    return (
      <div className={`min-h-screen ${pageThemeClass}`}>
        <AnimatePresence>
          {showAgeGate && <AgeGate onConfirm={() => setAgeVerified(true)} />}
        </AnimatePresence>
        <SEO
          title={article.seoTitle || article.title}
          description={article.seoDescription || article.excerpt}
          image={article.imageUrl}
          canonicalUrl={canonicalHref ?? undefined}
          url={canonicalHref ?? undefined}
          ogTitle={article.seoTitle || article.title}
          ogDescription={article.seoDescription || article.excerpt}
          ogImage={article.imageUrl}
        />

        <main className="pt-[calc(4.8rem+env(safe-area-inset-top,0px))] pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]">
          {/* Hero image section */}
          <section className="relative overflow-hidden">
            <div className="relative h-[26rem]">
              <img src={heroImage} alt={article.title} className="h-full w-full object-cover" />
              {/* Multi-layer gradient for depth */}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0.12)_20%,rgba(0,0,0,0.55)_60%,rgba(0,0,0,0.92)_100%)]" />
              {/* Subtle vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.25)_100%)]" />

              {/* Top controls */}
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4">
                <motion.button
                  type="button"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={goBack}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md active:scale-95 shadow-lg"
                >
                  <ArrowLeft className="h-4 w-4" />
                </motion.button>
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => void handleMobileShare()}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md active:scale-95 shadow-lg"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </motion.div>
              </div>

              {/* Bottom content overlay */}
              <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-md ${articleCategoryColor}`}>
                      {categoryLabels[article.category]}
                    </span>
                    {articleTypeInfo && (
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${articleTypeInfo.color}`}>
                        {articleTypeInfo.label}
                      </span>
                    )}
                  </div>

                  <h1 className="text-[1.85rem] font-black leading-[1.06] tracking-tight text-white drop-shadow-md">
                    {article.title}
                  </h1>

                  {article.excerpt && (
                    <p className="mt-2.5 max-w-[95%] text-[12.5px] font-medium leading-relaxed text-white/75">
                      {article.excerpt}
                    </p>
                  )}
                </motion.div>
              </div>
            </div>
          </section>

          {/* Author + meta card — overlaps hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="-mt-6 relative z-20 px-4"
          >
            <div className="space-y-3.5 rounded-[2rem] border border-border/40 bg-background/97 p-4 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              {/* Author row */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-primary/10 shadow-sm">
                  {article.authorImage ? (
                    <img src={article.authorImage} alt={article.author || "Autor"} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-primary/55" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-black text-foreground">
                    {article.author || "Redakcja Love Bydgoszcz"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <MobileMetaPill icon={Calendar} label={formatDate(article.publishedAt)} />
                    <MobileMetaPill icon={Clock} label={new Date(article.publishedAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw" })} />
                  </div>
                </div>
              </div>

              {/* TTS */}
              <div className="rounded-[1.35rem] border border-border/35 bg-muted/35 p-3">
                <ArticleTTS article={article} />
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {article.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-[10px] font-bold text-foreground/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Article content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="px-4 pt-3"
          >
            <div className="rounded-[2rem] border border-border/30 bg-background px-4 py-5 shadow-[0_12px_32px_-20px_rgba(0,0,0,0.22)]">
              <CategoryLayoutWrapper category={article.category} categoryLayout={categoryLayout}>
                {elementOrder.map((elementId) =>
                  renderElement(
                    elementId,
                    article,
                    updates,
                    commentCount,
                    hasSource,
                    hasPartner,
                    hasFooter,
                    graphicsLayout,
                  )
                )}
              </CategoryLayoutWrapper>
            </div>
          </motion.div>

          {/* Ad */}
          <div className="px-4 pt-3">
            <div className="rounded-[1.75rem] border border-border/30 bg-card p-3 shadow-sm">
              <ArticleInlineAd placement="below_article" />
            </div>
          </div>

          {article.labelOurNews && (
            <div className="px-4 pt-3">
              <div className="rounded-[1.75rem] border border-border/30 bg-card p-4 shadow-sm">
                <OurNewsFooterBlock title={article.title} />
              </div>
            </div>
          )}

          {article.articleType === "press_release" && (
            <div className="px-4 pt-3">
              <div className="rounded-[1.75rem] border border-border/30 bg-card p-4 shadow-sm">
                <PressReleaseFooterBlock title={article.title} />
              </div>
            </div>
          )}
        </main>

        {/* Fixed bottom action bar */}
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/35 bg-background/96 px-4 py-3 backdrop-blur-xl"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/aktualizacje")}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-muted text-[12px] font-black text-foreground active:scale-[0.98] transition-transform"
            >
              <Zap className="h-4 w-4 text-primary" />
              Aktualności
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("comments");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-card border border-border/40 text-[12px] font-black text-foreground shadow-sm active:scale-[0.98] transition-transform"
            >
              <MessageSquare className="h-4 w-4 text-primary" />
              {typeof commentCount === "number" && commentCount > 0 ? `Komentarze (${commentCount})` : "Komentarze"}
            </button>
            <button
              type="button"
              onClick={() => void handleMobileShare()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md active:scale-[0.98] transition-transform"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatePresence>
        {showAgeGate && <AgeGate onConfirm={() => setAgeVerified(true)} />}
      </AnimatePresence>
      <SEO
        title={article.seoTitle || article.title}
        description={article.seoDescription || article.excerpt}
        image={article.imageUrl}
        canonicalUrl={canonicalHref ?? undefined}
        url={canonicalHref ?? undefined}
        ogTitle={article.seoTitle || article.title}
        ogDescription={article.seoDescription || article.excerpt}
        ogImage={article.imageUrl}
      />
      {isMobile ? null : <Navbar />}

      {article.isPatronage && (
        <div className={`w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 ${isMobile ? "mt-0" : "mt-24"} z-40 relative shadow-md`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest">
            <Star className="w-4 h-4 fill-current" />
            Patronat Redakcji Love Bydgoszcz
            <Star className="w-4 h-4 fill-current" />
          </div>
        </div>
      )}

      <main className={`flex-1 ${article.isPatronage ? "pt-2" : isMobile ? "pt-4" : "pt-24"} ${isMobile ? "pb-28" : "pb-16"} ${pageThemeClass}`}>
        <article className={articleLayout === "hero" ? "w-full" : articleContainerClass}>
          {articleLayout === "hero" ? (
            <div className={articleContainerClass} />
          ) : (
            <div className="h-0" />
          )}

          {showPartnerCard && (
            <div className="mb-6 flex justify-center">
              <div className="w-full max-w-md">
                <PartnerSponsorCard article={article} />
              </div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* === LABEL BANNERS === */}
            {article.labelUrgent && <UrgentBanner />}
            {article.labelImportant && !article.labelUrgent && <ImportantBanner />}
            {article.labelMustKnow && !article.labelUrgent && !article.labelImportant && <MustKnowBanner />}
            {article.labelAuthorArticle && !article.labelUrgent && !article.labelImportant && !article.labelMustKnow && (
              <AuthorArticleBanner author={article.author} />
            )}

            {/* Row 1: Wróć + badges (left) | Author/date + TTS (right, pinned) */}
            <div className="mb-4 lg:mb-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* Left: Wróć + category + labels — all inline on desktop */}
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 lg:pl-0">
                  <button
                    onClick={goBack}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground lg:-ml-24 xl:-ml-28"
                  >
                    <ArrowLeft className="w-4 h-4" /> Wróć
                  </button>
                  <Link
                    to={getCategoryHref(article.category)}
                    className={`text-xs font-bold px-3 py-1 rounded-full text-white ${categoryColors[article.category] ?? "bg-primary"} uppercase tracking-wider transition-transform hover:scale-[1.03] hover:shadow-sm`}
                  >
                    {categoryLabels[article.category] ?? article.category}
                  </Link>
                  {article.labelUrgent && (
                    <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-red-600 text-white uppercase tracking-wide whitespace-nowrap">
                      <Zap className="w-3 h-3 fill-white" /> Pilne
                    </span>
                  )}
                  {article.labelImportant && (
                    <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-amber-400 text-amber-900 uppercase tracking-wide whitespace-nowrap">
                      <AlertTriangle className="w-3 h-3" /> Ważne
                    </span>
                  )}
                  {article.labelOurNews && (
                    <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-blue-600 text-white uppercase tracking-wide whitespace-nowrap">
                      <ShieldCheck className="w-3 h-3" /> Nasz tekst
                    </span>
                  )}
                  {article.labelMustKnow && (
                    <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-violet-600 text-white uppercase tracking-wide whitespace-nowrap">
                      <BookmarkPlus className="w-3 h-3" /> Musisz wiedzieć
                    </span>
                  )}
                  {article.labelAuthorArticle && (
                    <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-teal-600 text-white uppercase tracking-wide whitespace-nowrap">
                      <PenTool className="w-3 h-3" /> Artykuł autora
                    </span>
                  )}
                </div>

                {/* Right: Author/date bar + TTS — pinned to right edge */}
                <div className="flex items-center gap-2 shrink-0 lg:-mr-32 xl:-mr-40 2xl:-mr-48">
                  <div className="flex flex-wrap items-center gap-3 rounded-full border border-border/70 bg-background/90 px-4 py-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      Autor {article.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(article.publishedAt)}
                    </span>
                    {article.updatedAt && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Aktualizacja {formatDateTime(article.updatedAt)}
                      </span>
                    )}
                    {article.allowComments !== false && commentCount !== undefined && commentCount > 0 && (
                      <a href="#comments" className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                        <MessageSquare className="w-4 h-4" />
                        {commentCount} {commentCount === 1 ? "komentarz" : commentCount < 5 ? "komentarze" : "komentarzy"}
                      </a>
                    )}
                  </div>
                  {article.category !== "bydgoszczanie" && (
                    <ArticleTTS article={article} />
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {article.category === "bydgoszczanie" ? (
            <>
              <BydgoszczanieCoverHeader article={article} />
            </>
          ) : hasSplitLayout ? (
            <div className="mb-8 grid gap-6 lg:grid-cols-2 lg:items-start">
              <div>
                <h1 className={getTitleClasses(article.title)}>
                  {article.category === "bydgoszczanie" && getBydgoszczanieProfile(article).displayName && (
                    <span className="mb-1.5 block text-rose-600 text-2xl sm:text-3xl uppercase tracking-widest">
                      {getBydgoszczanieProfile(article).displayName}
                    </span>
                  )}
                  {article.title}
                </h1>
              </div>
              {showPartnerCard ? (
                <div>
                  <InteractiveArticleImage imageUrl={article.imageUrl!} title={article.title} className="rounded-[2rem] overflow-hidden shadow-2xl min-h-[280px] sm:min-h-[360px]" />
                  <ImageCredit credit={(article as any).imageAuthor} />
                </div>
              ) : (
                <div>
                  <InteractiveArticleImage imageUrl={article.imageUrl!} title={article.title} className="rounded-[2rem] overflow-hidden shadow-2xl min-h-[280px] sm:min-h-[360px]" />
                  <ImageCredit credit={(article as any).imageAuthor} />
                </div>
              )}
            </div>
          ) : (
            <div className="mb-3">
              <h1 className={getTitleClasses(article.title)}>
                {article.category === "bydgoszczanie" && getBydgoszczanieProfile(article).displayName && (
                  <span className="mb-1.5 block text-rose-600 text-2xl sm:text-3xl uppercase tracking-widest">
                    {getBydgoszczanieProfile(article).displayName}
                  </span>
                )}
                {article.title}
              </h1>
            </div>
          )}

          {/* === DYNAMIC ELEMENT RENDERING === */}
          {articleLayout === "hero" ? (
            <div className={`${articleContainerClass} mt-0`}>
              <CategoryLayoutWrapper category={article.category} categoryLayout={categoryLayout}>
                {elementOrder.map((elementId) =>
                  renderElement(elementId, article, updates, commentCount, hasSource, hasPartner, hasFooter, graphicsLayout)
                )}
              </CategoryLayoutWrapper>
            </div>
          ) : articleLayout === "magazine" ? (
            <div className="flex gap-8">
              <div className="flex-1 min-w-0">
                <CategoryLayoutWrapper category={article.category} categoryLayout={categoryLayout}>
                  {elementOrder.map((elementId) =>
                    renderElement(elementId, article, updates, commentCount, hasSource, hasPartner, hasFooter, graphicsLayout)
                  )}
                </CategoryLayoutWrapper>
              </div>
              <aside className="w-64 shrink-0 hidden lg:block">
                <div className="sticky top-28 space-y-4">
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Kategoria</p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${categoryColors[article.category] ?? "bg-primary"} uppercase tracking-wider`}>
                      {categoryLabels[article.category] ?? article.category}
                    </span>
                  </div>
                  {article.tags && article.tags.length > 0 && (
                    <div className="rounded-xl border bg-muted/30 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Tagi</p>
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag: string) => (
                          <span key={tag} className="text-xs bg-background border rounded-full px-2 py-0.5">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          ) : (
            <CategoryLayoutWrapper category={article.category} categoryLayout={categoryLayout}>
              {elementOrder.map((elementId) =>
                renderElement(elementId, article, updates, commentCount, hasSource, hasPartner, hasFooter, graphicsLayout)
              )}
            </CategoryLayoutWrapper>
          )}

          {/* OurNews footer block */}
          <div className={articleLayout === "hero" || articleLayout === "magazine" ? articleContainerClass : ""}>
            <ArticleInlineAd placement="below_article" />
          </div>

          {(article as any).labelBeingUpdated && (
            articleLayout === "hero" || articleLayout === "magazine" ? (
              <div className={articleContainerClass}>
                <BeingUpdatedBanner />
              </div>
            ) : (
              <BeingUpdatedBanner />
            )
          )}

          {article.labelOurNews && (
            articleLayout === "hero" || articleLayout === "magazine" ? (
              <div className={articleContainerClass}>
                <OurNewsFooterBlock title={article.title} />
              </div>
            ) : (
              <OurNewsFooterBlock title={article.title} />
            )
          )}

          {article.articleType === "press_release" && (
            articleLayout === "hero" || articleLayout === "magazine" ? (
              <div className={articleContainerClass}>
                <PressReleaseFooterBlock title={article.title} />
              </div>
            ) : (
              <PressReleaseFooterBlock title={article.title} />
            )
          )}
        </article>
      </main>

      {isMobile ? null : <Footer />}
    </div>
  );
}