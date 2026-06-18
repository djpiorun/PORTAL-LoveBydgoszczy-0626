import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import WeatherWidget from "@/components/WeatherWidget";
import PatronageSlider from "@/components/PatronageSlider";
import NewsletterSection from "@/components/NewsletterSection";
import SocialWidget from "@/components/SocialWidget";
import ArticleCard from "@/components/ArticleCard";
import SidebarAd from "@/components/ads/SidebarAd";
import { Sparkles, Activity, Music, UtensilsCrossed, ChevronRight, Star, Bus } from "lucide-react";
import { useNavigate } from "react-router";
import { Link } from "react-router";

function CandleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path d="M12 3.1c1.8 1.2 2.8 2.7 2.8 4.3A2.8 2.8 0 0 1 12 10.2 2.8 2.8 0 0 1 9.2 7.4c0-1.6 1-3.1 2.8-4.3Z" fill="#F59E0B" />
      <path d="M10.4 4.8c.5.5.8 1.1.8 1.8A1.4 1.4 0 0 1 9.8 8c-.1-.5-.1-1 .1-1.5.1-.7.3-1.2.5-1.7Z" fill="#FDE68A" />
      <path d="M9.2 9.8h5.6l-.6 1.8h-4.4l-.6-1.8Z" fill="#B91C1C" />
      <path d="M9.7 11.3h4.6v5a2.3 2.3 0 0 1-2.3 2.3h0a2.3 2.3 0 0 1-2.3-2.3v-5Z" fill="#F8FAFC" />
      <path d="M10.5 12.4h3v4.5h-3Z" fill="#CBD5E1" />
      <path d="M8.5 20.1h7l-.8.8H9.3l-.8-.8Z" fill="#78716C" />
    </svg>
  );
}

export default function SidebarWidgets() {
  const featured = useQuery(api.articles.getFeatured);
  const navigate = useNavigate();

  return (
    <aside className="space-y-6 flex flex-col">
      <WeatherWidget />

      <SidebarAd placement="sidebar_square" label="Reklama partnera" />
      
      <SocialWidget />
      
      {/* Polecane działy */}
        <div>
        <div className="relative mb-6 ml-2">
          <div className="inline-flex -skew-x-12 items-center gap-3 rounded-lg border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(254,240,138,0.92)_45%,rgba(224,242,254,0.92))] px-6 py-2.5 text-slate-900 shadow-[0_12px_28px_rgba(148,163,184,0.18)] backdrop-blur dark:border-amber-300/25 dark:bg-[linear-gradient(135deg,rgba(45,29,18,0.86),rgba(64,44,22,0.8)_45%,rgba(22,39,54,0.8))] dark:text-amber-100 dark:shadow-[0_20px_40px_-28px_rgba(0,0,0,0.9)]">
            <Sparkles className="w-4 h-4 animate-pulse text-amber-500 transform skew-x-12" />
            <h3 className="text-sm font-black uppercase tracking-widest transform skew-x-12">Polecane działy</h3>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/miasto')} className="group flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-50/30 hover:shadow-xl dark:border-slate-700/70 dark:bg-slate-900/50 dark:hover:border-blue-400/60 dark:hover:bg-blue-500/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white dark:bg-blue-500/18 dark:text-blue-200">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <h4 className="inline-block origin-left text-sm font-bold text-slate-900 transition-transform duration-300 group-hover:scale-105 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-200">Medyczna Bydgoszcz</h4>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-300/80">Zdrowie i medycyna</p>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-blue-100 dark:bg-slate-800 dark:group-hover:bg-blue-500/20">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-200" />
            </div>
          </button>

          <button onClick={() => navigate('/rozrywka')} className="group flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-400 hover:bg-purple-50/30 hover:shadow-xl dark:border-slate-700/70 dark:bg-slate-900/50 dark:hover:border-purple-400/60 dark:hover:bg-purple-500/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-500 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white dark:bg-purple-500/18 dark:text-purple-200">
              <Music className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <h4 className="inline-block origin-left text-sm font-bold text-slate-900 transition-transform duration-300 group-hover:scale-105 group-hover:text-purple-600 dark:text-slate-100 dark:group-hover:text-purple-200">Klubowa Bydgoszcz</h4>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-300/80">Życie nocne i imprezy</p>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-purple-100 dark:bg-slate-800 dark:group-hover:bg-purple-500/20">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-purple-600 dark:text-slate-300 dark:group-hover:text-purple-200" />
            </div>
          </button>

          <button onClick={() => navigate('/gastronomia')} className="group flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:bg-orange-50/30 hover:shadow-xl dark:border-slate-700/70 dark:bg-slate-900/50 dark:hover:border-orange-400/60 dark:hover:bg-orange-500/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-500/18 dark:text-orange-200">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <h4 className="inline-block origin-left text-sm font-bold text-slate-900 transition-transform duration-300 group-hover:scale-105 group-hover:text-orange-600 dark:text-slate-100 dark:group-hover:text-orange-200">Kuchnia Bydgoska</h4>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-300/80">Lokalne smaki</p>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-orange-100 dark:bg-slate-800 dark:group-hover:bg-orange-500/20">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-orange-600 dark:text-slate-300 dark:group-hover:text-orange-200" />
            </div>
          </button>
        </div>
      </div>

      <div className="pt-10 lg:pt-14">
        <PatronageSlider />
      </div>

      {/* Rozkład Jazdy MZK Button */}
      <button 
        onClick={() => navigate('/rozklad-jazdy')} 
        className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-900/50 dark:hover:border-blue-400/60"
      >
        <div className="absolute top-0 right-0 h-32 w-32 -mr-10 -mt-10 rounded-full bg-blue-50 blur-3xl transition-all group-hover:bg-blue-100 dark:bg-blue-500/12 dark:group-hover:bg-blue-500/20"></div>
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600">
          <Bus className="w-6 h-6" />
        </div>
        <div className="relative text-left flex-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Rozkład Jazdy MZK</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-300/80">Sprawdź odjazdy na żywo</p>
        </div>
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-blue-50 dark:bg-slate-800 dark:group-hover:bg-blue-500/20">
          <ChevronRight className="w-4 h-4 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-200" />
        </div>
      </button>

      <NewsletterSection />

      {/* Polecane publikacje */}
      <div>
        <div className="relative mb-6 ml-2">
          <div className="inline-flex -skew-x-12 items-center gap-3 rounded-lg border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(254,240,138,0.92)_45%,rgba(224,242,254,0.92))] px-6 py-2.5 text-slate-900 shadow-[0_12px_28px_rgba(148,163,184,0.18)] backdrop-blur dark:border-amber-300/25 dark:bg-[linear-gradient(135deg,rgba(45,29,18,0.86),rgba(64,44,22,0.8)_45%,rgba(22,39,54,0.8))] dark:text-amber-100 dark:shadow-[0_20px_40px_-28px_rgba(0,0,0,0.9)]">
            <Star className="w-4 h-4 fill-current animate-pulse text-amber-500 transform skew-x-12" />
            <h3 className="text-sm font-black uppercase tracking-widest transform skew-x-12">Polecane publikacje</h3>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {!featured
            ? [...Array(5)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-50 dark:bg-slate-800/60" />
              ))
            : featured.slice(0, 5).map((article, i) => (
                <ArticleCard key={article._id} article={article} index={i} compact />
              ))}
        </div>
      </div>

      {/* Strefa Pamięci Button */}
      <Link to="/nekrolog" className="block group -mt-3">
        <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-stone-700/70 dark:bg-slate-900/55">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fff7ed,#fde68a)] text-amber-700 shadow-inner shadow-amber-200/70 dark:shadow-amber-800/35">
              <CandleIcon />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Strefa Pamięci</h3>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/75">Nekrologi i pożegnania</p>
            </div>
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-900 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-amber-500 dark:group-hover:text-slate-950">
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>
    </aside>
  );
}