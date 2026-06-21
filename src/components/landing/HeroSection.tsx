import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen, Mic, BarChart2, FileText, Lightbulb, Users, Send, DollarSign } from "lucide-react";
import { getArticleHref } from "@/lib/articleRouting";
import { useArticles } from "@/hooks/use-articles-api";

const articleTypeBadgeMap: Record<string, { label: string; icon: any; className: string }> = {
  quiz: { label: "QUIZ", icon: BookOpen, className: "bg-fuchsia-500/90 text-white" },
  interview: { label: "WYWIAD", icon: Mic, className: "bg-purple-500/90 text-white" },
  analysis: { label: "ANALIZA", icon: BarChart2, className: "bg-indigo-500/90 text-white" },
  report: { label: "REPORTAZ", icon: FileText, className: "bg-amber-500/90 text-white" },
  opinion: { label: "OPINIA", icon: Lightbulb, className: "bg-cyan-500/90 text-white" },
  dialog: { label: "DIALOG", icon: Users, className: "bg-violet-500/90 text-white" },
  press_release: { label: "KOMUNIKAT", icon: Send, className: "bg-blue-500/90 text-white" },
  sponsored: { label: "SPONSOROWANY", icon: DollarSign, className: "bg-rose-500/90 text-white" },
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

function HeroCardStack() {
  const { articles: latestArticles, isLoading } = useArticles({ limit: 5 });
  const [order, setOrder] = useState<number[]>([]);

  useEffect(() => {
    if (latestArticles && order.length === 0) {
      setOrder(latestArticles.map((_, i) => i));
    }
  }, [latestArticles, order.length]);

  useEffect(() => {
    if (order.length === 0) return;
    const interval = setInterval(() => {
      setOrder((prev) => {
        const newOrder = [...prev];
        const first = newOrder.shift();
        if (first !== undefined) newOrder.push(first);
        return newOrder;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [order.length]);

  if (isLoading) {
    return <div className="h-[350px] w-full animate-pulse rounded-[1.5rem] bg-muted" />;
  }

  if (!latestArticles.length) {
    return null;
  }

  return (
    <div className="relative flex h-[460px] w-full items-center justify-center perspective-[1200px]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-[42%] h-[280px] w-full">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,rgba(14,165,233,0.20),rgba(56,189,248,0.14)_28%,rgba(251,191,36,0.12)_48%,rgba(255,255,255,0)_76%)] blur-[80px]" />
      </div>

      <div className="pointer-events-none absolute right-10 top-8 h-16 w-16 rounded-full bg-sky-300/14 blur-[40px]" />
      <div className="pointer-events-none absolute bottom-14 left-12 h-20 w-20 rounded-full bg-amber-300/12 blur-[40px]" />

      {order.map((articleIndex, visualIndex) => {
        const article = latestArticles[articleIndex];
        if (!article) return null;

        const isFront = visualIndex === 0;
        const rotateZ = isFront ? 0 : visualIndex % 2 === 0 ? visualIndex * 3 : -visualIndex * 3;
        const xOffset = isFront ? 0 : visualIndex % 2 === 0 ? visualIndex * 15 : -visualIndex * 15;

        return (
          <motion.div
            key={article.id}
            layout
            initial={false}
            animate={{
              scale: isFront ? 1 : 1 - visualIndex * 0.06,
              y: isFront ? 0 : visualIndex * 12,
              x: xOffset,
              rotateZ,
              zIndex: order.length - visualIndex,
              opacity: visualIndex < 4 ? 1 : 0,
            }}
            whileHover={{
              y: isFront ? -8 : visualIndex * 12 - 8,
              scale: isFront ? 1.01 : 1 - visualIndex * 0.06 + 0.01,
            }}
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000 || offset.x < -100) {
                setOrder((prev) => {
                  const newOrder = [...prev];
                  const first = newOrder.shift();
                  if (first !== undefined) newOrder.push(first);
                  return newOrder;
                });
              } else if (swipe > 10000 || offset.x > 100) {
                setOrder((prev) => {
                  const newOrder = [...prev];
                  const last = newOrder.pop();
                  if (last !== undefined) newOrder.unshift(last);
                  return newOrder;
                });
              }
            }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.25 }}
            className="absolute h-[340px] w-[86%] origin-bottom cursor-pointer overflow-hidden rounded-[2rem] bg-card shadow-[0_20px_56px_-14px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)]"
            onClick={() => {
              if (isFront) {
                window.location.href = getArticleHref(article as any);
                return;
              }
              setOrder((prev) => {
                const newOrder = [...prev];
                const clickedIdx = newOrder.indexOf(articleIndex);
                const moved = newOrder.splice(0, clickedIdx);
                return [...newOrder, ...moved];
              });
            }}
          >
            {article.imageUrl && (
              <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent" />

            <div className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/40 backdrop-blur-lg shadow-lg">
              <span className="text-sm font-black text-white/95">{visualIndex + 1}</span>
            </div>

            <div className="absolute right-0 bottom-0 left-0 p-7 text-white">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="inline-block rounded-full bg-primary/92 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white backdrop-blur-sm shadow-md">
                  {categoryLabels[article.category] || article.category}
                </span>
                {article.articleType && article.articleType !== "news" && articleTypeBadgeMap[article.articleType] ? (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest shadow-lg ${articleTypeBadgeMap[article.articleType].className}`}>
                    {(() => {
                      const Icon = articleTypeBadgeMap[article.articleType].icon;
                      return <Icon className="h-2.5 w-2.5" />;
                    })()}
                    {articleTypeBadgeMap[article.articleType].label}
                  </span>
                ) : null}
              </div>
              <h3 className="mb-2 line-clamp-2 text-2xl font-black leading-[1.15] tracking-tight sm:text-[1.65rem]">{article.title}</h3>
              <p className="line-clamp-2 text-sm font-medium leading-relaxed text-white/85">{article.excerpt}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[42vh] items-start overflow-visible bg-transparent pt-0">
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-6 px-4 pt-2 sm:px-6 sm:pt-4 lg:grid-cols-2 lg:gap-10 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl pt-2"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/92 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-foreground shadow-[0_4px_16px_-4px_rgba(15,23,42,0.1)] backdrop-blur-md dark:border-primary/25 dark:bg-card/85 dark:text-foreground dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            Od 10 lat z Wami
          </motion.div>

          <h1 className="mb-5 text-4xl font-black leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            Odkryj <br />
            <span className="gradient-text">Bydgoszcz</span> <br />
            na nowo.
          </h1>

          <p className="mb-8 max-w-xl text-base font-medium leading-[1.6] text-muted-foreground sm:text-lg">
            Twój lifestylowy przewodnik po mieście. Najlepsze miejsca, inspirujące wydarzenia i kultura w jednym, eleganckim miejscu.
          </p>

          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById("aktualnosci")?.scrollIntoView({ behavior: "smooth" })}
              className="group flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background shadow-[0_6px_20px_-4px_rgba(15,23,42,0.25)] transition-all hover:shadow-[0_12px_32px_-6px_rgba(15,23,42,0.35)] dark:bg-primary dark:text-primary-foreground dark:shadow-[0_10px_32px_-10px_rgba(249,115,22,0.5)] dark:hover:shadow-[0_16px_48px_-10px_rgba(249,115,22,0.6)]"
            >
              Czytaj magazyn
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>
        </motion.div>

        <div className="relative hidden lg:block">
          <HeroCardStack />
        </div>
      </div>
    </section>
  );
}
