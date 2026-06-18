import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, ArrowRight, ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { getArticleHref } from "@/lib/articleRouting";

export default function BydgoszczanieSlider() {
  const articles = useQuery(api.articles.list, { category: "bydgoszczanie" as const, limit: 10 });
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [portraitImages, setPortraitImages] = useState<Record<string, boolean>>({});

  if (!articles || articles.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const currentArticle = articles[currentIndex];
  const currentImageKey = currentArticle.imageUrl || currentArticle._id;
  const isPortraitImage = portraitImages[currentImageKey] ?? false;

  return (
    <section className="relative py-4 sm:py-5">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-rose-100/80 bg-[linear-gradient(135deg,rgba(255,241,242,0.96),rgba(255,255,255,0.98)_48%,rgba(255,247,250,0.94))] px-4 py-4 shadow-[0_22px_70px_rgba(190,24,93,0.07)] sm:px-5 sm:py-5">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/70 to-transparent" />
            <div className="absolute -left-10 top-10 h-48 w-48 rounded-full bg-rose-200/45 blur-3xl" />
            <div className="absolute bottom-6 right-12 h-56 w-56 rounded-full bg-pink-200/35 blur-3xl" />
          </div>

          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Bydgoszczanie</h2>
                <p className="mt-0.5 text-sm font-medium text-slate-500 sm:text-base">Poznaj niezwykłych ludzi z naszego miasta</p>
              </div>
            </div>

            {articles.length > 1 && (
              <div className="flex gap-2 sm:pt-1">
                <button onClick={prevSlide} className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-600 shadow-sm transition-all hover:scale-105 hover:bg-rose-50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={nextSlide} className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-600 shadow-sm transition-all hover:scale-105 hover:bg-rose-50">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <div
              className="group flex cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-white/90 bg-white/92 p-2.5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur md:flex-row sm:p-3"
              onClick={() => navigate(getArticleHref(currentArticle))}
            >
                <div className={`relative shrink-0 overflow-hidden rounded-[1.6rem] ${isPortraitImage ? "h-32 sm:h-36 md:w-[28%]" : "h-44 sm:h-48 md:w-[38%]"} md:h-auto`}>
                  {currentArticle.imageUrl ? (
                    <img
                      src={currentArticle.imageUrl}
                      alt={currentArticle.title}
                      onLoad={(event) => {
                        const { naturalWidth, naturalHeight, currentSrc } = event.currentTarget;
                        const key = currentSrc || currentImageKey;
                        setPortraitImages((prev) => {
                          const nextValue = naturalHeight > naturalWidth;
                          if (prev[key] === nextValue) {
                            return prev;
                          }
                          return { ...prev, [key]: nextValue };
                        });
                      }}
                      className={`h-full w-full transition-transform duration-700 group-hover:scale-105 ${
                        isPortraitImage ? "rounded-[1.15rem] object-contain bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,241,242,0.82))] p-2 sm:p-2.5" : "object-cover"
                      }`}
                    />
                  ) : (
                    <div className="h-full w-full bg-rose-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent md:hidden" />

                  <div className="absolute right-0 bottom-0 left-0 p-4 md:hidden">
                    {currentArticle.personName && (
                      <div className="mb-2 inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-3 py-1.5 backdrop-blur-md">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white">
                          <UserRound className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-xs font-black tracking-wide text-white">{currentArticle.personName}</span>
                      </div>
                    )}
                    <h3 className="text-xl font-extrabold leading-tight text-white drop-shadow-md">{currentArticle.title}</h3>
                  </div>
                </div>

                <div className="relative hidden flex-1 flex-col justify-center rounded-[1.6rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,247,250,0.94))] p-5 md:flex md:p-7">
                  <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-rose-50 opacity-60 blur-3xl -mr-32 -mt-32" />

                  {currentArticle.personName && (
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-3 rounded-[1.25rem] border border-rose-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,241,242,0.92))] px-3 py-2.5 shadow-[0_16px_32px_rgba(190,24,93,0.08)]">
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                          <UserRound className="h-4 w-4" />
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-rose-500">Dzisiejszy bohater</span>
                          <span className="text-base font-black text-slate-900">{currentArticle.personName}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <h3 className="mb-3 text-2xl font-extrabold leading-tight text-slate-900 transition-colors group-hover:text-rose-600 lg:text-[2rem]">
                    {currentArticle.title}
                  </h3>
                  <p className="mb-6 line-clamp-6 text-base leading-relaxed text-slate-600">{currentArticle.excerpt}</p>

                  <div className="mt-auto flex justify-end pt-3">
                    <button className="group/btn inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-rose-600 hover:text-white hover:shadow-xl">
                      Poznaj historię
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-2" />
                    </button>
                  </div>
                </div>
            </div>

            {articles.length > 1 && (
              <div className="mt-5 flex justify-center gap-2">
                {articles.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-rose-500" : "w-2 bg-rose-200 hover:bg-rose-300"}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
