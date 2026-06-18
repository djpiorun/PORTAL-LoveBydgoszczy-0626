import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, ArrowRight, BookOpen, Mic, BarChart2, FileText, Lightbulb, Users, Send, DollarSign, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import { getArticleHref } from "@/lib/articleRouting";

const categoryLabels: Record<string, string> = {
  miasto: "Miasto", rozrywka: "Rozrywka", kultura: "Kultura",
  biznes: "Biznes", gastronomia: "Gastronomia", bydgoszczanie: "Bydgoszczanie", medyczna: "Medycyna",
};

const categoryBadgeClasses: Record<string, string> = {
  miasto: "bg-blue-500 text-white",
  rozrywka: "bg-rose-500 text-white",
  kultura: "bg-amber-500 text-black",
  biznes: "bg-emerald-500 text-white",
  gastronomia: "bg-orange-500 text-white",
  bydgoszczanie: "bg-violet-500 text-white",
  medyczna: "bg-teal-500 text-white",
};

const articleTypeLabels: Record<string, { label: string; icon: any; className: string }> = {
  quiz: { label: "QUIZ", icon: BookOpen, className: "bg-fuchsia-500/80 text-white border-fuchsia-300/40" },
  interview: { label: "WYWIAD", icon: Mic, className: "bg-purple-500/80 text-white border-purple-300/40" },
  analysis: { label: "ANALIZA", icon: BarChart2, className: "bg-indigo-500/80 text-white border-indigo-300/40" },
  report: { label: "REPORTAŻ", icon: FileText, className: "bg-amber-500/80 text-white border-amber-300/40" },
  opinion: { label: "OPINIA", icon: Lightbulb, className: "bg-cyan-500/80 text-white border-cyan-300/40" },
  dialog: { label: "DIALOG", icon: Users, className: "bg-violet-500/80 text-white border-violet-300/40" },
  press_release: { label: "KOMUNIKAT", icon: Send, className: "bg-blue-500/80 text-white border-blue-300/40" },
  sponsored: { label: "SPONSOROWANY", icon: DollarSign, className: "bg-rose-500/80 text-white border-rose-300/40" },
};

interface ReelItemProps {
  article: {
    _id: string; slug?: string; title: string; excerpt: string;
    category: string; articleType?: string; imageUrl?: string;
    author: string; publishedAt: number; likes?: number;
  };
  index: number; activeIndex: number; isLiked: boolean;
  onToggleLike: (id: string) => void;
  onShowComments: (id: string) => void;
  showNextHint?: boolean;
}

export default function ReelItem({
  article, index, activeIndex, isLiked, onToggleLike, onShowComments, showNextHint,
}: ReelItemProps) {
  const navigate = useNavigate();
  const isActive = index === activeIndex;
  const likeCount = Math.max(0, (article.likes ?? 0) + (isLiked ? 1 : 0));
  const publishedDate = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        {article.imageUrl ? (
          <>
            <motion.img
              initial={{ scale: 1.08, x: 0 }}
              animate={{ scale: isActive ? 1.22 : 1.12, x: isActive ? 18 : 6 }}
              transition={{ duration: 6, ease: "easeInOut" }}
              src={article.imageUrl}
              alt={article.title}
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
            />
            <img
              src={article.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-125 object-cover blur-3xl opacity-30"
            />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0)_34%,rgba(0,0,0,0.78)_70%,rgba(0,0,0,0.98)_100%)]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-[calc(0.7rem+env(safe-area-inset-bottom,0px))] pt-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: isActive ? 1 : 0.72, y: isActive ? 0 : 10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex min-h-[17.75rem] flex-col justify-end"
        >
          <div className="pr-[3.55rem] pt-[7.5rem]">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] shadow-sm ${categoryBadgeClasses[article.category] ?? "bg-white/20 text-white"}`}>
                {categoryLabels[article.category] || article.category}
              </span>
              {article.articleType && article.articleType !== "news" && articleTypeLabels[article.articleType] ? (
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${articleTypeLabels[article.articleType].className}`}>
                  {(() => {
                    const Icon = articleTypeLabels[article.articleType].icon;
                    return <Icon className="h-3 w-3" />;
                  })()}
                  {articleTypeLabels[article.articleType].label}
                </span>
              ) : null}
            </div>

            <h2 className="max-w-full text-[1.45rem] font-black leading-[0.94] tracking-[-0.03em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-[1.6rem]">
              {article.title}
            </h2>

            <div className="mt-5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 text-sm font-bold text-white backdrop-blur-sm">
                {article.imageUrl ? (
                  <img src={article.imageUrl} alt={article.author} className="h-full w-full object-cover" />
                ) : (
                  article.author.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-white">{article.author}</div>
                <div className="text-[10px] text-white/65">Dodano {publishedDate}</div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => navigate(getArticleHref(article))}
                className="rounded-full border border-white/15 bg-black/28 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-sm transition active:scale-95"
              >
                <span className="inline-flex items-center gap-1">
                  Czytaj więcej
                  <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 12 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="absolute bottom-[calc(2.65rem+env(safe-area-inset-bottom,0px))] right-0 flex w-[3rem] shrink-0 flex-col items-center gap-2"
          >
            <button
              type="button"
              onClick={() => onToggleLike(article._id)}
              className="flex flex-col items-center gap-0.5 transition active:scale-90"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/28 backdrop-blur-sm">
                <Heart className={`h-3 w-3 transition-colors ${isLiked ? "fill-rose-500 text-rose-500" : "text-white"}`} />
              </div>
              <span className="text-[8px] font-bold text-white">{likeCount}</span>
            </button>

            <button
              type="button"
              onClick={() => onShowComments(article._id)}
              className="flex flex-col items-center gap-0.5 transition active:scale-90"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/28 backdrop-blur-sm">
                <MessageCircle className="h-3 w-3 text-white" />
              </div>
              <span className="text-[8px] font-bold text-white">Komentuj</span>
            </button>
          </motion.div>

          <AnimatePresence>
            {showNextHint ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
              >
                <motion.div
                  animate={{ y: [0, 5, 0], opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center justify-center text-white/70"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
