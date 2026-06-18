import { MessageSquareQuote, PenSquare, Quote, ShieldCheck, Sparkles } from "lucide-react";

type OpinionBlock = {
  id: string;
  type: "argument" | "counterpoint" | "lead_quote" | "author_note" | "summary";
  title?: string;
  content: string;
  hidden?: boolean;
};

type ArticleOpinionData = {
  enabled: boolean;
  thesis?: string;
  position?: string;
  authorNote?: string;
  authorBio?: string;
  leadQuote?: string;
  counterpoint?: string;
  closingPoint?: string;
  arguments: string[];
  blocks: OpinionBlock[];
  styleVariant: "classic" | "premium" | "polemics" | "column" | "news";
};

const styleMap = {
  classic: "border-slate-200 bg-[linear-gradient(180deg,#fff,rgba(248,250,252,.98))]",
  premium: "border-amber-200 bg-[linear-gradient(180deg,rgba(255,247,237,.9),#fff)]",
  polemics: "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,.88),#fff)]",
  column: "border-violet-200 bg-[linear-gradient(180deg,rgba(245,243,255,.88),#fff)]",
  news: "border-sky-200 bg-[linear-gradient(180deg,rgba(240,249,255,.88),#fff)]",
} as const;

export default function ArticleOpinion({
  article,
  opinion,
}: {
  article: any;
  opinion: ArticleOpinionData;
}) {
  const wrapperClass = styleMap[opinion.styleVariant] ?? styleMap.classic;
  const visibleBlocks = opinion.blocks.filter((block) => !block.hidden && block.content.trim());
  const cleanArguments = opinion.arguments.filter((item) => item.trim());

  return (
    <div className={`not-prose rounded-[36px] border p-5 sm:p-7 shadow-[0_28px_90px_rgba(15,23,42,0.08)] dark:border-slate-700/70 dark:shadow-[0_30px_90px_-36px_rgba(0,0,0,0.86)] ${wrapperClass}`}>
      <div className="relative mb-8 overflow-hidden rounded-[32px] border border-white/60 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-slate-950/48 dark:shadow-[0_20px_60px_-34px_rgba(0,0,0,0.9)] sm:p-7">
        <div className="absolute inset-y-0 left-0 w-2 rounded-l-[32px] bg-[linear-gradient(180deg,#f59e0b,#fb7185,#8b5cf6)]" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="pl-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-background">
              <PenSquare className="h-3.5 w-3.5" />
              Opinia
            </div>
            {opinion.thesis ? <p className="mt-4 max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-[2.35rem]">{opinion.thesis}</p> : null}
          </div>
          <div className="rounded-[28px] border border-border bg-background/95 px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-700/70 dark:bg-slate-900/78">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Autor opinii</p>
            <p className="mt-1 text-base font-black text-foreground">{article.author}</p>
            {opinion.authorBio ? <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{opinion.authorBio}</p> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.85fr)]">
        <div className="space-y-5">
          {opinion.position ? (
            <section className="rounded-[30px] border border-border bg-background/90 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] dark:border-slate-700/70 dark:bg-slate-900/74">
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Stanowisko</p>
              <p className="text-base leading-relaxed text-foreground">{opinion.position}</p>
            </section>
          ) : null}

          {cleanArguments.length > 0 ? (
            <section className="rounded-[30px] border border-border bg-background/90 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] dark:border-slate-700/70 dark:bg-slate-900/74">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Argumentacja</p>
              </div>
              <div className="space-y-3">
                {cleanArguments.map((argument, index) => (
                  <div key={`${argument}-${index}`} className="rounded-[22px] bg-muted/20 px-4 py-3 text-sm leading-relaxed text-foreground dark:bg-slate-800/70">
                    {argument}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {visibleBlocks.map((block) => (
            <section key={block.id} className="rounded-[30px] border border-border bg-background/90 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] dark:border-slate-700/70 dark:bg-slate-900/74">
              {block.type === "lead_quote" ? (
                <div className="rounded-[24px] bg-primary/5 px-5 py-5 dark:bg-primary/12">
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    <Quote className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase tracking-[0.18em]">Cytat przewodni</span>
                  </div>
                  <p className="text-xl font-semibold leading-relaxed text-foreground">{block.content}</p>
                </div>
              ) : (
                <>
                  {block.title ? <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{block.title}</p> : null}
                  <p className="text-base leading-relaxed text-foreground">{block.content}</p>
                </>
              )}
            </section>
          ))}

          {opinion.closingPoint ? (
            <section className="rounded-[28px] border border-foreground/10 bg-foreground px-6 py-6 text-background">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-background/80" />
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-background/70">Puenta</p>
              </div>
              <p className="text-lg leading-relaxed">{opinion.closingPoint}</p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          {opinion.leadQuote ? (
            <section className="rounded-[28px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <MessageSquareQuote className="h-4 w-4" />
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Wyróżniony cytat</p>
              </div>
              <p className="text-base font-semibold leading-relaxed text-foreground">{opinion.leadQuote}</p>
            </section>
          ) : null}

          {opinion.counterpoint ? (
            <section className="rounded-[28px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Kontrpunkt / polemika</p>
              <p className="text-sm leading-relaxed text-foreground">{opinion.counterpoint}</p>
            </section>
          ) : null}

          {opinion.authorNote ? (
            <section className="rounded-[28px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Nota autora</p>
              <p className="text-sm leading-relaxed text-foreground">{opinion.authorNote}</p>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
