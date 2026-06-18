import { motion } from "framer-motion";
import { User, Building2, Calendar, ExternalLink, Twitter, Facebook, Globe, Quote } from "lucide-react";

interface Politician {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  party?: string;
  position?: string;
  bio?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
}

interface PoliticalEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type?: "wypowiedz" | "decyzja" | "glosowanie" | "inne";
}

interface ArticlePoliticsProps {
  data: {
    enabled: boolean;
    politicians?: Politician[];
    mainPoliticianId?: string;
    politicalContext?: string;
    parties?: string[];
    topic?: string;
    timeline?: PoliticalEvent[];
    relatedLegislation?: string;
    styleVariant: "editorial" | "news" | "analysis";
  };
}

export default function ArticlePolitics({ data }: ArticlePoliticsProps) {
  if (!data.enabled) return null;

  const mainPolitician = data.politicians?.find(p => p.id === data.mainPoliticianId) || data.politicians?.[0];

  const getEventTypeIcon = (type?: string) => {
    switch (type) {
      case "wypowiedz": return "💬";
      case "decyzja": return "📋";
      case "glosowanie": return "🗳️";
      default: return "📌";
    }
  };

  const getEventTypeLabel = (type?: string) => {
    switch (type) {
      case "wypowiedz": return "Wypowiedź";
      case "decyzja": return "Decyzja";
      case "glosowanie": return "Głosowanie";
      default: return "Wydarzenie";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-8 space-y-6"
    >
      {/* Political Context Banner */}
      {data.politicalContext && (
        <div className="rounded-3xl border border-blue-200/50 bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50/50 p-6 dark:border-blue-900/30 dark:from-blue-950/30 dark:via-slate-900/50 dark:to-blue-950/20">
          <div className="flex items-start gap-3">
            <Quote className="h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Kontekst polityczny
              </h3>
              <p className="leading-relaxed text-foreground/90">{data.politicalContext}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Politician Profile */}
      {mainPolitician && (
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-md dark:border-border/30">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Główny bohater artykułu
          </h3>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Photo */}
            {mainPolitician.photo ? (
              <div className="mx-auto flex-shrink-0 sm:mx-0">
                <img
                  src={mainPolitician.photo}
                  alt={mainPolitician.fullName}
                  className="h-32 w-32 rounded-2xl object-cover shadow-lg ring-4 ring-border/20"
                />
              </div>
            ) : (
              <div className="mx-auto flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-5xl font-black text-white shadow-lg sm:mx-0">
                {mainPolitician.fullName[0]}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="text-2xl font-black text-foreground">{mainPolitician.fullName}</h4>
                {mainPolitician.position && (
                  <p className="text-sm font-semibold text-muted-foreground">{mainPolitician.position}</p>
                )}
              </div>

              {mainPolitician.party && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
                    {mainPolitician.party}
                  </span>
                </div>
              )}

              {mainPolitician.bio && (
                <p className="text-sm leading-relaxed text-foreground/80">{mainPolitician.bio}</p>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap gap-2">
                {mainPolitician.facebookUrl && (
                  <a
                    href={mainPolitician.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    <Facebook className="h-3.5 w-3.5" />
                    Facebook
                  </a>
                )}
                {mainPolitician.twitterUrl && (
                  <a
                    href={mainPolitician.twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    Twitter
                  </a>
                )}
                {mainPolitician.websiteUrl && (
                  <a
                    href={mainPolitician.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Strona WWW
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Politicians Involved */}
      {data.politicians && data.politicians.length > 1 && (
        <div className="rounded-3xl border border-border/50 bg-card p-6 dark:border-border/30">
          <h3 className="mb-4 text-lg font-black">Politycy w artykule</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.politicians
              .filter(p => p.id !== data.mainPoliticianId)
              .map((politician) => (
                <motion.div
                  key={politician.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3 transition-colors hover:bg-muted"
                >
                  {politician.photo ? (
                    <img
                      src={politician.photo}
                      alt={politician.fullName}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 text-lg font-black text-white">
                      {politician.fullName[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-bold text-foreground">{politician.fullName}</p>
                    {politician.party && (
                      <p className="truncate text-xs text-muted-foreground">{politician.party}</p>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {data.timeline && data.timeline.length > 0 && (
        <div className="rounded-3xl border border-border/50 bg-card p-6 dark:border-border/30">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-black">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Oś czasu wydarzeń
          </h3>
          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-blue-400 to-transparent dark:from-blue-400 dark:via-blue-600" />

            {data.timeline.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-12"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-base shadow-lg ring-4 ring-background dark:bg-blue-500">
                  {getEventTypeIcon(event.type)}
                </div>

                <div className="rounded-2xl bg-muted/50 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
                      {getEventTypeLabel(event.type)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("pl-PL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <h4 className="mb-1 font-bold text-foreground">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-foreground/80">{event.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Related Legislation */}
      {data.relatedLegislation && (
        <div className="rounded-3xl border border-amber-200/50 bg-gradient-to-br from-amber-50 via-white to-amber-50/50 p-6 dark:border-amber-900/30 dark:from-amber-950/20 dark:via-slate-900/50 dark:to-amber-950/10">
          <div className="flex items-start gap-3">
            <ExternalLink className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Powiązane przepisy
              </h3>
              <p className="leading-relaxed text-foreground/90">{data.relatedLegislation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Parties Involved */}
      {data.parties && data.parties.length > 0 && (
        <div className="rounded-3xl border border-border/50 bg-card p-6 dark:border-border/30">
          <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-muted-foreground">
            Partie zaangażowane
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.parties.map((party, index) => (
              <span
                key={index}
                className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-900 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {party}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
