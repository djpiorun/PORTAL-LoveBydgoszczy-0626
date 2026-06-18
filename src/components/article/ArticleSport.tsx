import { motion } from "framer-motion";
import { Trophy, Calendar, MapPin, Users, TrendingUp, Award, Zap, Clock } from "lucide-react";

interface SportTeam {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  color?: string;
  type: "home" | "away";
}

interface SportPlayer {
  id: string;
  name: string;
  number?: string;
  position?: string;
  rating?: number;
}

interface SportMatchStat {
  label: string;
  homeValue: string;
  awayValue: string;
}

interface ArticleSportProps {
  data: {
    enabled: boolean;
    sportType: "pilka_nozna" | "zuzel" | "siatkowka" | "inne";
    isMatchReport?: boolean;
    matchDate?: string;
    matchLocation?: string;
    league?: string;
    round?: string;
    homeTeam?: SportTeam;
    awayTeam?: SportTeam;
    homeScore?: string;
    awayScore?: string;
    matchStatus?: "zaplanowany" | "trwa" | "zakonczony" | "odwolany";
    homeLineup?: SportPlayer[];
    awayLineup?: SportPlayer[];
    matchStats?: SportMatchStat[];
    scorers?: string[];
    yellowCards?: string[];
    redCards?: string[];
    matchHighlights?: string[];
    leagueTableUrl?: string;
    styleVariant: "dynamic" | "modern" | "classic";
  };
}

export default function ArticleSport({ data }: ArticleSportProps) {
  if (!data.enabled || !data.isMatchReport) return null;

  const getSportEmoji = () => {
    switch (data.sportType) {
      case "pilka_nozna": return "⚽";
      case "zuzel": return "🏍️";
      case "siatkowka": return "🏐";
      default: return "🏆";
    }
  };

  const isLive = data.matchStatus === "trwa";
  const isFinished = data.matchStatus === "zakonczony";

  const statusConfig = {
    trwa: { label: "NA ŻYWO", bg: "bg-green-500", pulse: true },
    zakonczony: { label: "KONIEC", bg: "bg-slate-600", pulse: false },
    odwolany: { label: "ODWOŁANY", bg: "bg-red-500", pulse: false },
    zaplanowany: { label: "ZAPOWIEDŹ", bg: "bg-blue-500", pulse: false },
  };
  const statusCfg = statusConfig[data.matchStatus || "zaplanowany"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-8 space-y-5"
    >
      {/* ── SCOREBOARD ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a0f1e] shadow-2xl">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f610_1px,transparent_1px),linear-gradient(to_bottom,#3b82f610_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        </div>

        <div className="relative z-10 p-6">
          {/* Header row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{getSportEmoji()}</span>
              <div>
                {data.league && <p className="text-xs font-black uppercase tracking-wider text-blue-300/70">{data.league}</p>}
                {data.round && <p className="text-[10px] text-slate-500">{data.round}</p>}
              </div>
            </div>
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white ${statusCfg.bg}`}>
              {statusCfg.pulse && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-white"
                />
              )}
              {statusCfg.label}
            </div>
          </div>

          {/* Teams + Score */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Home */}
            <motion.div whileHover={{ scale: 1.03 }} className="flex flex-col items-center gap-3 text-center">
              {data.homeTeam?.logo ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 p-3 border border-white/10">
                  <img src={data.homeTeam.logo} alt={data.homeTeam.name} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black text-white shadow-lg border border-white/10"
                  style={{ backgroundColor: `${data.homeTeam?.color || "#3b82f6"}30`, borderColor: `${data.homeTeam?.color || "#3b82f6"}40` }}
                >
                  <span style={{ color: data.homeTeam?.color || "#60a5fa" }}>{data.homeTeam?.shortName?.[0] || "H"}</span>
                </div>
              )}
              <div>
                <h3 className="text-base font-black text-white">{data.homeTeam?.name || "Gospodarz"}</h3>
                {data.homeTeam?.shortName && <p className="text-xs text-slate-500">{data.homeTeam.shortName}</p>}
              </div>
            </motion.div>

            {/* Score */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-6xl font-black text-white md:text-7xl tabular-nums">{data.homeScore || "0"}</span>
                <span className="text-3xl font-black text-slate-600">:</span>
                <span className="text-6xl font-black text-white md:text-7xl tabular-nums">{data.awayScore || "0"}</span>
              </div>
              {isLive && (
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-1 text-xs font-bold text-green-400"
                >
                  <Clock className="h-3 w-3" />
                  NA ŻYWO
                </motion.div>
              )}
            </div>

            {/* Away */}
            <motion.div whileHover={{ scale: 1.03 }} className="flex flex-col items-center gap-3 text-center">
              {data.awayTeam?.logo ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 p-3 border border-white/10">
                  <img src={data.awayTeam.logo} alt={data.awayTeam.name} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black text-white shadow-lg border border-white/10"
                  style={{ backgroundColor: `${data.awayTeam?.color || "#ef4444"}30`, borderColor: `${data.awayTeam?.color || "#ef4444"}40` }}
                >
                  <span style={{ color: data.awayTeam?.color || "#f87171" }}>{data.awayTeam?.shortName?.[0] || "A"}</span>
                </div>
              )}
              <div>
                <h3 className="text-base font-black text-white">{data.awayTeam?.name || "Gość"}</h3>
                {data.awayTeam?.shortName && <p className="text-xs text-slate-500">{data.awayTeam.shortName}</p>}
              </div>
            </motion.div>
          </div>

          {/* Match details */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 border-t border-white/5 pt-4 text-sm">
            {data.matchDate && (
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>{new Date(data.matchDate).toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            )}
            {data.matchLocation && (
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="h-4 w-4" />
                <span>{data.matchLocation}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MATCH STATS ─────────────────────────────────────────────────── */}
      {data.matchStats && data.matchStats.length > 0 && (
        <div className="rounded-3xl border border-border/40 bg-card p-6">
          <h3 className="mb-5 flex items-center gap-2 text-base font-black">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Statystyki meczu
          </h3>
          <div className="space-y-4">
            {data.matchStats.map((stat, index) => {
              const homeVal = parseFloat(stat.homeValue) || 0;
              const awayVal = parseFloat(stat.awayValue) || 0;
              const total = homeVal + awayVal || 1;
              const homePct = (homeVal / total) * 100;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-black text-foreground">{stat.homeValue}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                    <span className="font-black text-foreground">{stat.awayValue}</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-muted gap-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${homePct}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                      className="h-full rounded-l-full bg-blue-500"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${100 - homePct}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                      className="h-full rounded-r-full bg-red-500"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LINEUPS ─────────────────────────────────────────────────────── */}
      {(data.homeLineup?.length || data.awayLineup?.length) ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.homeLineup && data.homeLineup.length > 0 && (
            <div className="rounded-3xl border border-border/40 bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-black">
                <Users className="h-4 w-4" style={{ color: data.homeTeam?.color || "#3b82f6" }} />
                Skład {data.homeTeam?.shortName || "Gospodarzy"}
              </h3>
              <div className="space-y-1.5">
                {data.homeLineup.map((player) => (
                  <div key={player.id} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5 transition-colors hover:bg-muted">
                    {player.number && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black" style={{ backgroundColor: `${data.homeTeam?.color || "#3b82f6"}20`, color: data.homeTeam?.color || "#3b82f6" }}>
                        {player.number}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{player.name}</p>
                      {player.position && <p className="text-[10px] text-muted-foreground">{player.position}</p>}
                    </div>
                    {player.rating && (
                      <div className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-sm font-black text-foreground">{player.rating}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.awayLineup && data.awayLineup.length > 0 && (
            <div className="rounded-3xl border border-border/40 bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-black">
                <Users className="h-4 w-4" style={{ color: data.awayTeam?.color || "#ef4444" }} />
                Skład {data.awayTeam?.shortName || "Gości"}
              </h3>
              <div className="space-y-1.5">
                {data.awayLineup.map((player) => (
                  <div key={player.id} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5 transition-colors hover:bg-muted">
                    {player.number && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black" style={{ backgroundColor: `${data.awayTeam?.color || "#ef4444"}20`, color: data.awayTeam?.color || "#ef4444" }}>
                        {player.number}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{player.name}</p>
                      {player.position && <p className="text-[10px] text-muted-foreground">{player.position}</p>}
                    </div>
                    {player.rating && (
                      <div className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-sm font-black text-foreground">{player.rating}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* ── HIGHLIGHTS ──────────────────────────────────────────────────── */}
      {data.matchHighlights && data.matchHighlights.length > 0 && (
        <div className="rounded-3xl border border-border/40 bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-black">
            <Zap className="h-5 w-5 text-yellow-500" />
            Najważniejsze momenty
          </h3>
          <ul className="space-y-2.5">
            {data.matchHighlights.map((highlight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-start gap-3 text-sm text-foreground"
              >
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-black text-blue-600 dark:text-blue-400">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{highlight}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}