import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Trophy, Globe, ChevronLeft, FileText, MapPin, Zap, Calendar, Users, ArrowRight } from "lucide-react";
import { getArticleHref } from "@/lib/articleRouting";
import { useResolvedArticles } from "@/hooks/use-resolved-articles";

const SPORT_TYPE_LABELS: Record<string, string> = {
  pilka_nozna: "Piłka nożna",
  zuzel: "Żużel",
  siatkowka: "Siatkówka",
  inne: "Inne",
};

const SPORT_TYPE_EMOJI: Record<string, string> = {
  pilka_nozna: "⚽",
  zuzel: "🏍️",
  siatkowka: "🏐",
  inne: "🏆",
};

const SPORT_TYPE_COLORS: Record<string, { from: string; via: string; to: string; glow: string }> = {
  pilka_nozna: { from: "from-green-700", via: "via-emerald-800", to: "to-green-900", glow: "bg-green-500/20" },
  zuzel: { from: "from-orange-700", via: "via-red-800", to: "to-orange-900", glow: "bg-orange-500/20" },
  siatkowka: { from: "from-amber-600", via: "via-yellow-700", to: "to-amber-800", glow: "bg-amber-500/20" },
  inne: { from: "from-blue-700", via: "via-indigo-800", to: "to-blue-900", glow: "bg-blue-500/20" },
};

export default function SportTeamProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const nav = useNavigate();
  const team = useQuery(api.sportTeams.get, slug ? { slug } : "skip");
  const allArticles = useQuery(api.articles.list, { category: "sport", limit: 100 });
  const resolvedArticles = useResolvedArticles(allArticles);

  const safeArticles = resolvedArticles ?? [];

  if (team === undefined || allArticles === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  const relatedArticles = safeArticles.filter((a) => {
    const sport = (a as any).sport;
    if (!sport) return false;
    const teamId = team?._id;
    if (teamId && sport.teamIds?.includes(teamId)) return true;
    if (slug && sport.teamIds?.includes(slug)) return true;
    if (teamId && sport.homeTeam?.id === teamId) return true;
    if (slug && sport.homeTeam?.id === slug) return true;
    if (teamId && sport.awayTeam?.id === teamId) return true;
    if (slug && sport.awayTeam?.id === slug) return true;
    if (team?.name && (sport.homeTeam?.name === team.name || sport.awayTeam?.name === team.name)) return true;
    return false;
  }).slice(0, 8) || [];

  if (team === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (team === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-32 text-center">
          <Trophy className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
          <h1 className="mb-2 text-2xl font-black text-foreground">Drużyna nie znaleziona</h1>
          <Link to="/sport" className="text-primary hover:underline">Wróć do sportu</Link>
        </div>
      </div>
    );
  }

  const sportEmoji = SPORT_TYPE_EMOJI[team.sportType] || "🏆";
  const sportLabel = SPORT_TYPE_LABELS[team.sportType] || team.sportType;
  const colors = SPORT_TYPE_COLORS[team.sportType] || SPORT_TYPE_COLORS.inne;

  const details = [
    { label: "Dyscyplina", value: `${sportEmoji} ${sportLabel}`, Icon: Trophy, show: true },
    { label: "Liga / Rozgrywki", value: team.league, Icon: Trophy, show: !!team.league },
    { label: "Miasto", value: team.city, Icon: MapPin, show: !!team.city },
    { label: "Stadion / Hala", value: team.stadium, Icon: Zap, show: !!team.stadium },
    { label: "Rok założenia", value: team.founded, Icon: Calendar, show: !!team.founded },
  ].filter(d => d.show);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} pt-24 pb-0`}>
        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        {/* Glow orbs */}
        <div className={`absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/3 translate-x-1/3 rounded-full ${colors.glow} blur-[140px]`} />
        <div className={`absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/3 -translate-x-1/3 rounded-full ${colors.glow} blur-[120px]`} />

        {/* Floating emoji */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { top: "20%", left: "5%", size: "text-6xl", delay: 0, dur: 5 },
            { top: "60%", right: "6%", size: "text-5xl", delay: 1, dur: 7 },
            { bottom: "25%", left: "15%", size: "text-4xl", delay: 0.5, dur: 6 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -14, 0], rotate: [0, i % 2 === 0 ? 6 : -6, 0] }}
              transition={{ duration: pos.dur, repeat: Infinity, ease: "easeInOut", delay: pos.delay }}
              className={`absolute ${pos.size} opacity-[0.10]`}
              style={{ top: (pos as any).top, left: (pos as any).left, right: (pos as any).right, bottom: (pos as any).bottom }}
            >
              {sportEmoji}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link to="/sport" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Sport
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-8 pb-12 text-center md:flex-row md:text-left"
          >
            {/* Logo / Initials */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="shrink-0"
            >
              {team.logo ? (
                <div className="flex h-36 w-36 items-center justify-center rounded-3xl border-2 border-white/25 bg-white/15 backdrop-blur-sm shadow-2xl p-4 ring-4 ring-white/10">
                  <img src={team.logo} alt={team.name} className="h-full w-full object-contain drop-shadow-lg" />
                </div>
              ) : (
                <div
                  className="flex h-36 w-36 items-center justify-center rounded-3xl border-2 border-white/25 shadow-2xl ring-4 ring-white/10 text-4xl font-black text-white"
                  style={{ backgroundColor: team.primaryColor ? `${team.primaryColor}60` : "rgba(255,255,255,0.15)" }}
                >
                  {(team.shortName || team.name).slice(0, 3)}
                </div>
              )}
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-3 flex flex-wrap items-center justify-center gap-2 md:justify-start"
              >
                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-white/80">
                  {sportEmoji} {sportLabel}
                </span>
                {team.league && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/70">
                    {team.league}
                  </span>
                )}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="mb-3 text-5xl font-black leading-[0.95] tracking-tight text-white md:text-6xl"
              >
                {team.name}
              </motion.h1>

              {team.shortName && (
                <p className="mb-4 text-lg font-bold text-white/50">{team.shortName}</p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-wrap justify-center gap-2 md:justify-start"
              >
                {team.city && (
                  <div className="flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1.5">
                    <MapPin className="h-3.5 w-3.5 text-white/70" />
                    <span className="text-xs font-bold text-white/80">{team.city}</span>
                  </div>
                )}
                {team.stadium && (
                  <div className="flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1.5">
                    <Users className="h-3.5 w-3.5 text-white/70" />
                    <span className="text-xs font-bold text-white/80">{team.stadium}</span>
                  </div>
                )}
                {team.website && (
                  <a href={team.website} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1.5 hover:bg-white/25 transition-colors">
                    <Globe className="h-3.5 w-3.5 text-white/70" />
                    <span className="text-xs font-bold text-white/80">Strona www</span>
                  </a>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="relative z-10">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-16 w-full block">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z" className="fill-background" />
          </svg>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Details grid */}
        {details.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {details.map((detail, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5 shadow-sm hover:border-border hover:shadow-md transition-all duration-200"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                  <detail.Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{detail.label}</p>
                  <p className="text-sm font-black text-foreground truncate">{detail.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground">Artykuły o drużynie</h2>
                  <p className="text-xs text-muted-foreground">{relatedArticles.length} materiałów</p>
                </div>
              </div>
              <Link to="/sport" className="hidden sm:flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                Więcej sportu <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedArticles.map((article, i) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => nav(getArticleHref(article))}
                  className="group flex cursor-pointer gap-4 rounded-2xl border border-border/50 bg-card p-4 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200"
                >
                  {article.imageUrl ? (
                    <div className="h-18 w-24 shrink-0 overflow-hidden rounded-xl">
                      <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                      <span className="text-2xl">{sportEmoji}</span>
                    </div>
                  )}
                  <div className="min-w-0 flex flex-col justify-center">
                    <h3 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{article.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString("pl-PL")
                        : "Materiał sportowy"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-dashed border-border/60 bg-muted/20 py-20 text-center"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-4 block text-5xl"
            >
              {sportEmoji}
            </motion.span>
            <p className="text-sm font-bold text-muted-foreground">Brak artykułów powiązanych z tą drużyną</p>
            <Link to="/sport" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors">
              <ChevronLeft className="h-3 w-3" />
              Wróć do sportu
            </Link>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}