import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Play, Heart, Eye, ChevronRight, Film } from "lucide-react";
import { useEffect } from "react";

const categoryColors: Record<string, string> = {
  miasto: "bg-blue-500",
  rozrywka: "bg-rose-500",
  kultura: "bg-amber-500",
  biznes: "bg-emerald-500",
  gastronomia: "bg-orange-500",
  bydgoszczanie: "bg-violet-500",
  medyczna: "bg-teal-500",
  sport: "bg-blue-600",
  polityka: "bg-slate-600",
  inwestycje: "bg-amber-600",
  nasze_dzialania: "bg-purple-600",
};

const categoryLabels: Record<string, string> = {
  miasto: "Miasto",
  rozrywka: "Rozrywka",
  kultura: "Kultura",
  biznes: "Biznes",
  gastronomia: "Gastronomia",
  bydgoszczanie: "Bydgoszczanie",
  medyczna: "Medycyna",
  sport: "Sport",
  polityka: "Polityka",
  inwestycje: "Inwestycje",
  nasze_dzialania: "Nasze Działania",
};

export default function ReelsStrip() {
  const reels = useQuery(api.reels.listActive, { limit: 8 });
  const seedMutation = useMutation(api.reels.seed);
  const navigate = useNavigate();

  // Auto-seed when empty
  useEffect(() => {
    if (reels !== undefined && reels.length === 0) {
      seedMutation({}).catch(() => {});
    }
  }, [reels, seedMutation]);

  // Don't hide — show skeleton while loading or seeding
  // Only hide if we've confirmed empty after seed attempt (give it time)
  if (reels !== undefined && reels.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-slate-200/80 bg-[linear-gradient(135deg,rgba(15,15,20,0.97),rgba(20,20,30,0.98)_50%,rgba(10,10,18,0.97))] p-5 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.4)] dark:border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-sm shadow-rose-500/30">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Rolki</h3>
              <p className="text-xs text-white/50">Najnowsze wideo z Bydgoszczy</p>
            </div>
          </div>
          <Link
            to="/rolka"
            className="flex items-center gap-1.5 rounded-[1.1rem] bg-white/10 px-3.5 py-1.5 text-xs font-extrabold text-white/80 transition-all duration-300 hover:bg-white/20 hover:text-white"
          >
            Wszystkie
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Reels row */}
        {!reels || reels.length === 0 ? (
          <div className="flex gap-3 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[120px] h-[200px] rounded-2xl bg-white/8 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {reels.map((reel, i) => (
              <motion.button
                key={reel._id}
                type="button"
                onClick={() => navigate(`/rolka${reel.category ? `/${reel.category}` : ""}`)}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                className="group relative shrink-0 w-[120px] h-[200px] rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.7)]"
              >
                {/* Cover image */}
                {reel.coverImage ? (
                  <img
                    src={reel.coverImage}
                    alt={reel.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Category badge */}
                {reel.category && (
                  <div className="absolute top-2 left-2">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full text-white ${categoryColors[reel.category] ?? "bg-slate-600"}`}>
                      {categoryLabels[reel.category] ?? reel.category}
                    </span>
                  </div>
                )}

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-[11px] font-bold text-white leading-tight line-clamp-2 mb-1.5">
                    {reel.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-white/60">
                    {(reel.likes ?? 0) > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                        {reel.likes}
                      </span>
                    )}
                    {(reel.views ?? 0) > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" />
                        {reel.views}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}