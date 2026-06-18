import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { Building2, Globe, Facebook, Twitter, ChevronLeft, FileText, Scale, ArrowRight, Quote } from "lucide-react";
import { getArticleHref } from "@/lib/articleRouting";

export default function PoliticianProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const politician = useQuery(api.politicians.get, slug ? { slug } : "skip");
  const articles = useQuery(api.articles.list, { category: "polityka", limit: 50 });

  const relatedArticles = articles?.filter(a => {
    const politics = (a as any).politics;
    if (!politics) return false;
    return politics.politicians?.some((p: any) => p.id === politician?._id) ||
      politics.mainPoliticianId === politician?._id ||
      politics.politicianIds?.includes(politician?._id);
  }).slice(0, 6);

  if (politician === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (politician === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-32 text-center">
          <Scale className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
          <h1 className="mb-2 text-2xl font-black text-foreground">Polityk nie znaleziony</h1>
          <Link to="/polityka" className="text-primary hover:underline">Wróć do polityki</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 pt-24 pb-0">
        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        {/* Glow orbs */}
        <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/3 translate-x-1/3 rounded-full bg-slate-500/20 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/3 -translate-x-1/3 rounded-full bg-slate-600/20 blur-[120px]" />

        {/* Floating icons */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { top: "20%", left: "5%", delay: 0, dur: 6 },
            { top: "55%", right: "6%", delay: 1.2, dur: 8 },
            { bottom: "30%", left: "12%", delay: 0.6, dur: 7 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0], rotate: [0, i % 2 === 0 ? 5 : -5, 0] }}
              transition={{ duration: pos.dur, repeat: Infinity, ease: "easeInOut", delay: pos.delay }}
              className="absolute opacity-[0.06]"
              style={{ top: (pos as any).top, left: (pos as any).left, right: (pos as any).right, bottom: (pos as any).bottom }}
            >
              <Scale className="h-16 w-16 text-white" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link to="/polityka" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Polityka
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-8 pb-12 text-center md:flex-row md:text-left"
          >
            {/* Photo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="shrink-0"
            >
              {politician.photo ? (
                <div className="relative">
                  <img
                    src={politician.photo}
                    alt={politician.fullName}
                    className="h-36 w-36 rounded-3xl object-cover border-2 border-white/20 shadow-2xl ring-4 ring-white/10"
                  />
                  <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-600 border-2 border-white/20 shadow-lg">
                    <Scale className="h-5 w-5 text-white/80" />
                  </div>
                </div>
              ) : (
                <div className="relative flex h-36 w-36 items-center justify-center rounded-3xl bg-slate-600 border-2 border-white/20 shadow-2xl ring-4 ring-white/10 text-4xl font-black text-white">
                  {politician.fullName[0]}
                  <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-500 border-2 border-white/20 shadow-lg">
                    <Scale className="h-5 w-5 text-white/80" />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {politician.party && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-3 flex justify-center md:justify-start"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5">
                    <Building2 className="h-3.5 w-3.5 text-white/70" />
                    <span className="text-xs font-black text-white/80">{politician.party}</span>
                  </div>
                </motion.div>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="mb-2 text-5xl font-black leading-[0.95] tracking-tight text-white md:text-6xl"
              >
                {politician.fullName}
              </motion.h1>

              {politician.position && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-5 text-lg font-semibold text-white/55"
                >
                  {politician.position}
                </motion.p>
              )}

              {/* Social links */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex justify-center gap-3 md:justify-start"
              >
                {politician.facebookUrl && (
                  <a href={politician.facebookUrl} target="_blank" rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 border border-white/20 text-white/70 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-110 transition-all duration-200">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {politician.twitterUrl && (
                  <a href={politician.twitterUrl} target="_blank" rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 border border-white/20 text-white/70 hover:bg-slate-900 hover:text-white hover:scale-110 transition-all duration-200">
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {politician.websiteUrl && (
                  <a href={politician.websiteUrl} target="_blank" rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 border border-white/20 text-white/70 hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-200">
                    <Globe className="h-4 w-4" />
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

        {/* Bio */}
        {politician.bio && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 shadow-sm"
          >
            <Quote className="absolute top-6 right-6 h-12 w-12 text-muted-foreground/10" />
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-muted-foreground">Biogram</h2>
            <p className="text-base leading-relaxed text-foreground/80 relative z-10">{politician.bio}</p>
          </motion.div>
        )}

        {/* Related articles */}
        {relatedArticles && relatedArticles.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-700 dark:bg-slate-600 shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground">Powiązane artykuły</h2>
                  <p className="text-xs text-muted-foreground">{relatedArticles.length} materiałów</p>
                </div>
              </div>
              <Link to="/polityka" className="hidden sm:flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                Więcej polityki <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedArticles.map((article, i) => (
                <motion.a
                  key={article._id}
                  href={getArticleHref(article)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group flex gap-4 rounded-2xl border border-border/50 bg-card p-4 hover:border-slate-400/50 hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-200"
                >
                  {article.imageUrl ? (
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                      <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      <Scale className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex flex-col justify-center">
                    <h3 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{article.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(article.publishedAt).toLocaleDateString("pl-PL")}</p>
                  </div>
                </motion.a>
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
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="mb-4 flex justify-center"
            >
              <Scale className="h-12 w-12 text-muted-foreground/30" />
            </motion.div>
            <p className="text-sm font-bold text-muted-foreground">Brak artykułów powiązanych z tym politykiem</p>
            <Link to="/polityka" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors">
              <ChevronLeft className="h-3 w-3" />
              Wróć do polityki
            </Link>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}