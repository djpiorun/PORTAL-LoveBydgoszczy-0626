import { motion } from "framer-motion";
import {
  Heart, Calendar, Users, TrendingUp, Award, ExternalLink,
  CheckCircle2, Image as ImageIcon, Play, Target
} from "lucide-react";

interface ActionPartner {
  id: string;
  name: string;
  logo?: string;
  url?: string;
}

interface ActionMilestone {
  id: string;
  date: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

interface ArticleOurActionsProps {
  data: {
    enabled: boolean;
    actionType: "akcja" | "projekt" | "kampania" | "wspolpraca";
    actionStatus: "aktywna" | "zakonczona" | "planowana";
    startDate?: string;
    endDate?: string;
    partners?: ActionPartner[];
    milestones?: ActionMilestone[];
    results?: string;
    participants?: string;
    impact?: string;
    gallery?: string[];
    ctaLabel?: string;
    ctaUrl?: string;
    videoUrl?: string;
    styleVariant: "storytelling" | "brand" | "impact";
  };
}

export default function ArticleOurActions({ data }: ArticleOurActionsProps) {
  if (!data.enabled) return null;

  const getActionTypeConfig = () => {
    switch (data.actionType) {
      case "akcja":
        return {
          label: "Akcja",
          icon: "🎯",
          color: "text-rose-600 dark:text-rose-400",
          bg: "bg-rose-100 dark:bg-rose-900/30"
        };
      case "projekt":
        return {
          label: "Projekt",
          icon: "🚀",
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-900/30"
        };
      case "kampania":
        return {
          label: "Kampania",
          icon: "📢",
          color: "text-purple-600 dark:text-purple-400",
          bg: "bg-purple-100 dark:bg-purple-900/30"
        };
      case "wspolpraca":
        return {
          label: "Współpraca",
          icon: "🤝",
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-100 dark:bg-green-900/30"
        };
    }
  };

  const getStatusConfig = () => {
    switch (data.actionStatus) {
      case "aktywna":
        return {
          label: "Aktywna",
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-100 dark:bg-green-900/30"
        };
      case "zakonczona":
        return {
          label: "Zakończona",
          color: "text-slate-600 dark:text-slate-400",
          bg: "bg-slate-100 dark:bg-slate-800"
        };
      case "planowana":
        return {
          label: "Planowana",
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-900/30"
        };
    }
  };

  const typeConfig = getActionTypeConfig();
  const statusConfig = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-8 space-y-6"
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 shadow-lg">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-rose-500 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-4 py-2 text-2xl ${typeConfig.bg}`}>
              {typeConfig.icon}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm font-black uppercase tracking-wider ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
              {(data.startDate || data.endDate) && (
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {data.startDate && (
                    <span>
                      {new Date(data.startDate).toLocaleDateString("pl-PL", {
                        year: "numeric",
                        month: "long"
                      })}
                    </span>
                  )}
                  {data.endDate && (
                    <>
                      <span>—</span>
                      <span>
                        {new Date(data.endDate).toLocaleDateString("pl-PL", {
                          year: "numeric",
                          month: "long"
                        })}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          {data.ctaLabel && data.ctaUrl && (
            <motion.a
              href={data.ctaUrl}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-black text-primary-foreground shadow-lg transition-shadow hover:shadow-xl"
            >
              <Heart className="h-4 w-4" />
              {data.ctaLabel}
              <ExternalLink className="h-4 w-4" />
            </motion.a>
          )}
        </div>
      </div>

      {/* Video */}
      {data.videoUrl && (
        <div className="rounded-3xl border border-border/50 bg-card p-4 dark:border-border/30">
          <div className="mb-3 flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
              Materiał wideo
            </h3>
          </div>
          <div className="aspect-video overflow-hidden rounded-2xl bg-black">
            <iframe
              src={data.videoUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Partners */}
      {data.partners && data.partners.length > 0 && (
        <div className="rounded-3xl border border-border/50 bg-card p-6 dark:border-border/30">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
            <Users className="h-5 w-5 text-primary" />
            Partnerzy akcji
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.partners.map((partner) => (
              <motion.div
                key={partner.id}
                whileHover={{ scale: 1.05 }}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-muted/30 p-4 transition-all hover:border-primary/50 hover:shadow-md dark:border-border/30"
              >
                {partner.logo ? (
                  <div className="mb-3 flex h-16 items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex h-16 items-center justify-center rounded-xl bg-primary/10 text-2xl font-black text-primary">
                    {partner.name[0]}
                  </div>
                )}
                <p className="text-center text-sm font-bold text-foreground">{partner.name}</p>
                {partner.url && (
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex items-center justify-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Odwiedź <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      {data.milestones && data.milestones.length > 0 && (
        <div className="rounded-3xl border border-border/50 bg-card p-6 dark:border-border/30">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-black">
            <Target className="h-5 w-5 text-primary" />
            Kamienie milowe
          </h3>
          <div className="space-y-6">
            {data.milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col gap-4 rounded-2xl bg-muted/50 p-4 sm:flex-row sm:items-start"
              >
                {/* Image */}
                {milestone.imageUrl && (
                  <img
                    src={milestone.imageUrl}
                    alt={milestone.title}
                    className="h-32 w-full rounded-xl object-cover sm:h-24 sm:w-32 sm:flex-shrink-0"
                  />
                )}

                {/* Content */}
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(milestone.date).toLocaleDateString("pl-PL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <h4 className="mb-1 font-bold text-foreground">{milestone.title}</h4>
                  {milestone.description && (
                    <p className="text-sm text-foreground/80">{milestone.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Results Box */}
      {data.results && (
        <div className="rounded-3xl border border-green-200/50 bg-gradient-to-br from-green-50 via-white to-green-50/50 p-6 dark:border-green-900/30 dark:from-green-950/20 dark:via-slate-900/50 dark:to-green-950/10">
          <div className="flex items-start gap-3">
            <Award className="h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-green-900 dark:text-green-300">
                Co osiągnęliśmy
              </h3>
              <p className="leading-relaxed text-foreground/90">{data.results}</p>
            </div>
          </div>
        </div>
      )}

      {/* Impact */}
      {data.impact && (
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-primary">
                Wpływ na społeczność
              </h3>
              <p className="leading-relaxed text-foreground/90">{data.impact}</p>
            </div>
          </div>
        </div>
      )}

      {/* Participants Info */}
      {data.participants && (
        <div className="rounded-3xl border border-border/50 bg-card p-6 dark:border-border/30">
          <div className="flex items-start gap-3">
            <Users className="h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-muted-foreground">
                Uczestnicy
              </h3>
              <p className="leading-relaxed text-foreground">{data.participants}</p>
            </div>
          </div>
        </div>
      )}

      {/* Gallery */}
      {data.gallery && data.gallery.length > 0 && (
        <div className="rounded-3xl border border-border/50 bg-card p-6 dark:border-border/30">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
            <ImageIcon className="h-5 w-5 text-primary" />
            Galeria
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.gallery.map((img, index) => (
              <motion.img
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                src={img}
                alt={`Zdjęcie ${index + 1}`}
                className="h-48 w-full rounded-2xl object-cover shadow-md transition-transform hover:scale-105"
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
