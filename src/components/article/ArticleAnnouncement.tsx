import { AlertTriangle, BellRing, CalendarDays, ExternalLink, ShieldAlert } from "lucide-react";

type ArticleAnnouncementData = {
  enabled: boolean;
  noticeType?: string;
  priority: "niski" | "standard" | "wazny" | "pilny";
  validUntil?: string;
  institution?: string;
  noticeStatus: "aktywny" | "archiwalny" | "zakonczony" | "obowiazujacy";
  ctaLabel?: string;
  ctaUrl?: string;
  mustKnow?: string;
  styleVariant: "neutral" | "alert" | "official" | "info" | "local";
};

const styleMap = {
  neutral: "border-slate-200 bg-[linear-gradient(180deg,#fff,rgba(248,250,252,.98))]",
  alert: "border-red-200 bg-[linear-gradient(180deg,rgba(254,242,242,.96),#fff)]",
  official: "border-blue-200 bg-[linear-gradient(180deg,rgba(239,246,255,.96),#fff)]",
  info: "border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,.96),#fff)]",
  local: "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,.96),#fff)]",
} as const;

export default function ArticleAnnouncement({
  article,
  announcement,
}: {
  article: any;
  announcement: ArticleAnnouncementData;
}) {
  const wrapperClass = styleMap[announcement.styleVariant] ?? styleMap.neutral;

  return (
    <div className={`not-prose rounded-[34px] border p-5 shadow-[0_28px_90px_rgba(15,23,42,0.08)] dark:border-slate-700/70 dark:shadow-[0_30px_90px_-36px_rgba(0,0,0,0.86)] sm:p-7 ${wrapperClass}`}>
      <div className="relative mb-8 overflow-hidden rounded-[30px] border border-white/60 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-slate-950/48 dark:shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_42%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-background">
              <BellRing className="h-3.5 w-3.5" />
              Komunikat
            </div>
            <p className="mt-4 text-3xl font-black leading-tight text-foreground sm:text-[2.35rem]">{article.title}</p>
            {article.excerpt ? <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">{article.excerpt}</p> : null}
          </div>
          <div className="rounded-[28px] border border-border bg-background/95 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] dark:border-slate-700/70 dark:bg-slate-900/78">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Waznosc</p>
            <p className="mt-1 text-base font-black text-foreground">{announcement.priority}</p>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">Status: {announcement.noticeStatus}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.85fr)]">
        <div className="space-y-5">
          <section className="rounded-[26px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <ShieldAlert className="h-4 w-4" />
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Tresc komunikatu</p>
            </div>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          </section>

          {announcement.mustKnow ? (
            <section className="rounded-[26px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Co trzeba wiedziec</p>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{announcement.mustKnow}</p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-[26px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Typ komunikatu</p>
            <p className="text-sm font-semibold text-foreground">{announcement.noticeType || "Komunikat ogolny"}</p>
          </section>

          <section className="rounded-[26px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Instytucja / zrodlo</p>
            <p className="text-sm font-semibold text-foreground">{announcement.institution || article.sourceName || "Redakcja"}</p>
          </section>

          {announcement.validUntil ? (
            <section className="rounded-[26px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <CalendarDays className="h-4 w-4" />
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Data obowiazywania</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{announcement.validUntil}</p>
            </section>
          ) : null}

          {announcement.ctaLabel && announcement.ctaUrl ? (
            <a
              href={announcement.ctaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-foreground px-4 py-3 text-sm font-bold text-background transition-opacity hover:opacity-90"
            >
              {announcement.ctaLabel}
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
