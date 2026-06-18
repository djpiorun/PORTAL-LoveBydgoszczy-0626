import { motion } from "framer-motion";
import {
  MapPin, Calendar, DollarSign, Building2, TrendingUp,
  Clock, CheckCircle2, AlertCircle, Pause, Image as ImageIcon
} from "lucide-react";

interface InvestmentPhase {
  id: string;
  date: string;
  title: string;
  description?: string;
  status: "completed" | "current" | "upcoming";
}

interface ArticleInvestmentProps {
  data: {
    enabled: boolean;
    projectName: string;
    projectStatus: "planowana" | "w_trakcie" | "zakonczona" | "wstrzymana";
    location?: string;
    startDate?: string;
    endDate?: string;
    estimatedEndDate?: string;
    budget?: string;
    contractor?: string;
    investor?: string;
    progressPercent?: number;
    timeline?: InvestmentPhase[];
    mapUrl?: string;
    beforeImages?: string[];
    afterImages?: string[];
    impactDescription?: string;
    styleVariant: "technical" | "visual" | "report";
  };
}

export default function ArticleInvestment({ data }: ArticleInvestmentProps) {
  if (!data.enabled) return null;

  const getStatusConfig = () => {
    switch (data.projectStatus) {
      case "planowana":
        return {
          label: "Planowana",
          icon: Clock,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          border: "border-blue-200 dark:border-blue-900/50"
        };
      case "w_trakcie":
        return {
          label: "W trakcie realizacji",
          icon: TrendingUp,
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-100 dark:bg-amber-900/30",
          border: "border-amber-200 dark:border-amber-900/50"
        };
      case "zakonczona":
        return {
          label: "Zakończona",
          icon: CheckCircle2,
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-100 dark:bg-green-900/30",
          border: "border-green-200 dark:border-green-900/50"
        };
      case "wstrzymana":
        return {
          label: "Wstrzymana",
          icon: Pause,
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-100 dark:bg-red-900/30",
          border: "border-red-200 dark:border-red-900/50"
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-8 space-y-6"
    >
      {/* Project Header Card */}
      <div className={`rounded-3xl border ${statusConfig.border} ${statusConfig.bg} p-6 shadow-md`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-foreground">{data.projectName}</h2>
          <div className={`flex items-center gap-2 rounded-full ${statusConfig.bg} px-4 py-2 ${statusConfig.color}`}>
            <StatusIcon className="h-4 w-4" />
            <span className="text-sm font-black uppercase tracking-wider">
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {data.progressPercent !== undefined && data.projectStatus === "w_trakcie" && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-bold text-foreground">Postęp realizacji</span>
              <span className={`font-black ${statusConfig.color}`}>{data.progressPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/50 dark:bg-slate-800/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Key Info Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.location && (
          <div className="rounded-2xl border border-border/50 bg-card p-4 dark:border-border/30">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-wider">Lokalizacja</span>
            </div>
            <p className="font-bold text-foreground">{data.location}</p>
          </div>
        )}

        {data.startDate && (
          <div className="rounded-2xl border border-border/50 bg-card p-4 dark:border-border/30">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-wider">Data rozpoczęcia</span>
            </div>
            <p className="font-bold text-foreground">
              {new Date(data.startDate).toLocaleDateString("pl-PL", {
                year: "numeric",
                month: "long"
              })}
            </p>
          </div>
        )}

        {(data.endDate || data.estimatedEndDate) && (
          <div className="rounded-2xl border border-border/50 bg-card p-4 dark:border-border/30">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-wider">
                {data.endDate ? "Data zakończenia" : "Planowane zakończenie"}
              </span>
            </div>
            <p className="font-bold text-foreground">
              {new Date(data.endDate || data.estimatedEndDate!).toLocaleDateString("pl-PL", {
                year: "numeric",
                month: "long"
              })}
            </p>
          </div>
        )}

        {data.budget && (
          <div className="rounded-2xl border border-border/50 bg-card p-4 dark:border-border/30">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-wider">Budżet</span>
            </div>
            <p className="font-bold text-foreground">{data.budget}</p>
          </div>
        )}

        {data.contractor && (
          <div className="rounded-2xl border border-border/50 bg-card p-4 dark:border-border/30">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-wider">Wykonawca</span>
            </div>
            <p className="font-bold text-foreground">{data.contractor}</p>
          </div>
        )}

        {data.investor && (
          <div className="rounded-2xl border border-border/50 bg-card p-4 dark:border-border/30">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-wider">Inwestor</span>
            </div>
            <p className="font-bold text-foreground">{data.investor}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      {data.timeline && data.timeline.length > 0 && (
        <div className="rounded-3xl border border-border/50 bg-card p-6 dark:border-border/30">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-black">
            <TrendingUp className="h-5 w-5 text-primary" />
            Harmonogram realizacji
          </h3>
          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

            {data.timeline.map((phase, index) => {
              const isCompleted = phase.status === "completed";
              const isCurrent = phase.status === "current";
              const isUpcoming = phase.status === "upcoming";

              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-12"
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full shadow-lg ring-4 ring-background ${
                      isCompleted
                        ? "bg-green-600 dark:bg-green-500"
                        : isCurrent
                        ? "bg-amber-600 dark:bg-amber-500 animate-pulse"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : isCurrent ? (
                      <AlertCircle className="h-4 w-4 text-white" />
                    ) : (
                      <Clock className="h-4 w-4 text-white" />
                    )}
                  </div>

                  <div
                    className={`rounded-2xl p-4 ${
                      isCurrent
                        ? "bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isCompleted
                            ? "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300"
                            : isCurrent
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {isCompleted ? "Ukończone" : isCurrent ? "W trakcie" : "Zaplanowane"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(phase.date).toLocaleDateString("pl-PL", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                    <h4 className="mb-1 font-bold text-foreground">{phase.title}</h4>
                    {phase.description && (
                      <p className="text-sm text-foreground/80">{phase.description}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Before/After Images */}
      {((data.beforeImages && data.beforeImages.length > 0) ||
        (data.afterImages && data.afterImages.length > 0)) && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Before */}
          {data.beforeImages && data.beforeImages.length > 0 && (
            <div className="rounded-3xl border border-border/50 bg-card p-4 dark:border-border/30">
              <div className="mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                  Przed realizacją
                </h3>
              </div>
              <div className="grid gap-2">
                {data.beforeImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Przed realizacją ${index + 1}`}
                    className="h-48 w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* After */}
          {data.afterImages && data.afterImages.length > 0 && (
            <div className="rounded-3xl border border-border/50 bg-card p-4 dark:border-border/30">
              <div className="mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-green-900 dark:text-green-300">
                  Po realizacji
                </h3>
              </div>
              <div className="grid gap-2">
                {data.afterImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Po realizacji ${index + 1}`}
                    className="h-48 w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Impact Description */}
      {data.impactDescription && (
        <div className="rounded-3xl border border-green-200/50 bg-gradient-to-br from-green-50 via-white to-green-50/50 p-6 dark:border-green-900/30 dark:from-green-950/20 dark:via-slate-900/50 dark:to-green-950/10">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-green-900 dark:text-green-300">
                Wpływ na miasto
              </h3>
              <p className="leading-relaxed text-foreground/90">{data.impactDescription}</p>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      {data.mapUrl && (
        <div className="rounded-3xl border border-border/50 bg-card p-4 dark:border-border/30">
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
              Lokalizacja na mapie
            </h3>
          </div>
          <iframe
            src={data.mapUrl}
            className="h-64 w-full rounded-2xl"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </motion.div>
  );
}
