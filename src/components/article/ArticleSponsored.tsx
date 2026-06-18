import { BriefcaseBusiness, ExternalLink, Megaphone, ShieldCheck, Sparkles } from "lucide-react";

type ArticleSponsoredData = {
  enabled: boolean;
  sponsorLabel?: string;
  partnerName?: string;
  partnerLogo?: string;
  partnerUrl?: string;
  partnerDescription?: string;
  partnerCtaLabel?: string;
  partnerCtaUrl?: string;
  sponsorBoxTitle?: string;
  sponsorDisclaimer?: string;
  contactOffer?: string;
  sectionPlacement: "start" | "end";
  styleVariant: "classic" | "premium" | "lifestyle" | "business" | "magazine";
};

const styleMap = {
  classic: "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,.96),#fff)]",
  premium: "border-fuchsia-200 bg-[linear-gradient(180deg,rgba(253,242,248,.96),#fff)]",
  lifestyle: "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,.96),#fff)]",
  business: "border-sky-200 bg-[linear-gradient(180deg,rgba(239,246,255,.96),#fff)]",
  magazine: "border-violet-200 bg-[linear-gradient(180deg,rgba(245,243,255,.96),#fff)]",
} as const;

function SponsorBox({ sponsored }: { sponsored: ArticleSponsoredData }) {
  return (
    <section className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,250,251,0.96))] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/55 dark:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.88)]">
      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{sponsored.sponsorBoxTitle || "Partner materialu"}</p>
      <div className="flex items-start gap-4">
        {sponsored.partnerLogo ? (
          <img src={sponsored.partnerLogo} alt={sponsored.partnerName || "Partner"} className="h-16 w-16 rounded-[20px] object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-muted">
            <BriefcaseBusiness className="h-7 w-7 text-muted-foreground" />
          </div>
        )}
        <div>
          <p className="text-lg font-black text-foreground">{sponsored.partnerName}</p>
          {sponsored.partnerDescription ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sponsored.partnerDescription}</p> : null}
        </div>
      </div>
      {sponsored.partnerCtaLabel && sponsored.partnerCtaUrl ? (
        <a
          href={sponsored.partnerCtaUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-[20px] bg-foreground px-4 py-3 text-sm font-bold text-background transition-opacity hover:opacity-90"
        >
          {sponsored.partnerCtaLabel}
          <ExternalLink className="h-4 w-4" />
        </a>
      ) : null}
    </section>
  );
}

export default function ArticleSponsored({
  article,
  sponsored,
}: {
  article: any;
  sponsored: ArticleSponsoredData;
}) {
  const wrapperClass = styleMap[sponsored.styleVariant] ?? styleMap.classic;
  const sponsorBox = <SponsorBox sponsored={sponsored} />;

  return (
    <div className={`not-prose rounded-[36px] border p-5 shadow-[0_28px_90px_rgba(15,23,42,0.08)] dark:border-slate-700/70 dark:shadow-[0_30px_90px_-36px_rgba(0,0,0,0.86)] sm:p-7 ${wrapperClass}`}>
      <div className="relative mb-8 overflow-hidden rounded-[32px] border border-white/60 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-slate-950/48 dark:shadow-[0_20px_60px_-34px_rgba(0,0,0,0.9)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_36%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-background">
              <Megaphone className="h-3.5 w-3.5" />
              {sponsored.sponsorLabel || "Sponsorowany"}
            </div>
            <p className="mt-4 text-3xl font-black leading-tight text-foreground sm:text-[2.45rem]">{article.title}</p>
            {article.excerpt ? <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">{article.excerpt}</p> : null}
          </div>
          <div className="rounded-[28px] border border-border bg-background/95 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] dark:border-slate-700/70 dark:bg-slate-900/78">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Partner</p>
            <p className="mt-1 text-base font-black text-foreground">{sponsored.partnerName || "Material partnerski"}</p>
          </div>
        </div>
      </div>

      {sponsored.sectionPlacement === "start" ? <div className="mb-6">{sponsorBox}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.85fr)]">
        <div className="space-y-5">
          <section className="rounded-[28px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          </section>

          {sponsored.sponsorDisclaimer ? (
            <section className="rounded-[26px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Informacja o wspolpracy</p>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{sponsored.sponsorDisclaimer}</p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          {sponsored.sectionPlacement === "end" ? sponsorBox : null}

          {sponsored.contactOffer ? (
            <section className="rounded-[26px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Kontakt / oferta</p>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{sponsored.contactOffer}</p>
            </section>
          ) : null}

          {sponsored.partnerUrl ? (
            <a
              href={sponsored.partnerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-background px-4 py-3 text-sm font-bold text-foreground ring-1 ring-border transition-colors hover:bg-muted"
            >
              Strona partnera
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
