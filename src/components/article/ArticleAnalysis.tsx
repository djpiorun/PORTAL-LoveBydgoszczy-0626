import type { ReactNode } from "react";
import { BarChart2, BookOpen, CheckCircle2, FileBarChart2, Gauge, Quote, Sparkles } from "lucide-react";

type AnalysisMetric = {
  id: string;
  label: string;
  value: string;
  note?: string;
};

type AnalysisBlock = {
  id: string;
  type: "argument" | "counterargument" | "chart" | "data_box" | "expert_quote" | "partial_conclusion" | "sources" | "recommendations";
  title?: string;
  content: string;
  value?: string;
  sourceLabel?: string;
  hidden?: boolean;
};

type ArticleAnalysisData = {
  enabled: boolean;
  thesis?: string;
  summary?: string;
  expertLevel: "podstawowy" | "średni" | "zaawansowany" | "ekspercki";
  mainQuestion?: string;
  context?: string;
  arguments: string[];
  counterarguments: string[];
  sources: string[];
  bibliography?: string;
  conclusions?: string;
  recommendations?: string;
  metrics: AnalysisMetric[];
  blocks: AnalysisBlock[];
  styleVariant: "expert" | "economic" | "political" | "report" | "minimal";
};

const variantStyles = {
  expert: {
    shell: "border-slate-200 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))]",
    accent: "text-slate-900",
    badge: "bg-slate-900 text-white",
    panel: "bg-white border-slate-200",
    tone: "bg-slate-900",
  },
  economic: {
    shell: "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.7),#ffffff)]",
    accent: "text-emerald-900",
    badge: "bg-emerald-700 text-white",
    panel: "bg-white border-emerald-200/70",
    tone: "bg-emerald-700",
  },
  political: {
    shell: "border-indigo-200 bg-[linear-gradient(180deg,rgba(238,242,255,0.72),#ffffff)]",
    accent: "text-indigo-950",
    badge: "bg-indigo-800 text-white",
    panel: "bg-white border-indigo-200/70",
    tone: "bg-indigo-800",
  },
  report: {
    shell: "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.72),#ffffff)]",
    accent: "text-amber-950",
    badge: "bg-amber-600 text-white",
    panel: "bg-white border-amber-200/70",
    tone: "bg-amber-600",
  },
  minimal: {
    shell: "border-zinc-200 bg-white",
    accent: "text-zinc-950",
    badge: "bg-zinc-900 text-white",
    panel: "bg-zinc-50 border-zinc-200",
    tone: "bg-zinc-900",
  },
} as const;

function SectionTitle({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="text-lg font-black text-foreground">{label}</h3>
    </div>
  );
}

export default function ArticleAnalysis({
  analysis,
}: {
  analysis: ArticleAnalysisData;
}) {
  const variant = variantStyles[analysis.styleVariant] ?? variantStyles.expert;
  const cleanArguments = analysis.arguments.filter((item) => item.trim());
  const cleanCounterarguments = analysis.counterarguments.filter((item) => item.trim());
  const cleanSources = analysis.sources.filter((item) => item.trim());
  const visibleBlocks = analysis.blocks.filter((block) => !block.hidden && block.content.trim());

  return (
    <div className={`not-prose rounded-[36px] border p-5 sm:p-7 shadow-[0_28px_90px_rgba(15,23,42,0.08)] ${variant.shell}`}>
      <div className="relative mb-8 overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_38%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_34%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] ${variant.badge}`}>
              <BarChart2 className="h-3.5 w-3.5" />
              Analiza
            </div>
            {analysis.thesis ? <p className={`mt-4 text-3xl font-black leading-tight sm:text-[2.45rem] ${variant.accent}`}>{analysis.thesis}</p> : null}
            {analysis.summary ? (
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{analysis.summary}</p>
            ) : null}
          </div>
          <div className={`min-w-[180px] rounded-[24px] border px-4 py-3 dark:border-slate-700/70 dark:bg-slate-900/76 ${variant.panel}`}>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Poziom ekspercki</p>
            <p className={`mt-1 text-lg font-black ${variant.accent}`}>{analysis.expertLevel}</p>
          </div>
        </div>
      </div>

      {(analysis.thesis || analysis.mainQuestion) && (
        <div className={`mb-6 rounded-[30px] border px-5 py-5 sm:px-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] dark:border-slate-700/70 dark:bg-slate-900/76 ${variant.panel}`}>
          {analysis.mainQuestion ? (
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Główne pytanie</p>
              <p className="mt-2 text-base font-semibold leading-relaxed text-foreground">{analysis.mainQuestion}</p>
            </div>
          ) : null}
        </div>
      )}

      {analysis.context ? (
        <section className="mb-6">
          <SectionTitle icon={<FileBarChart2 className="h-4 w-4" />} label="Kontekst" />
          <div className={`rounded-[28px] border px-5 py-5 leading-relaxed text-foreground sm:px-6 dark:border-slate-700/70 dark:bg-slate-900/76 ${variant.panel}`}>
            {analysis.context}
          </div>
        </section>
      ) : null}

      {analysis.metrics.length > 0 ? (
        <section className="mb-6">
          <SectionTitle icon={<Gauge className="h-4 w-4" />} label="Dane / liczby" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {analysis.metrics.map((metric) => (
              <div key={metric.id} className={`rounded-[30px] border px-5 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] dark:border-slate-700/70 dark:bg-slate-900/76 ${variant.panel}`}>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
                <p className={`mt-2 text-3xl font-black leading-none ${variant.accent}`}>{metric.value}</p>
                {metric.note ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{metric.note}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          {cleanArguments.length > 0 ? (
            <section>
              <SectionTitle icon={<CheckCircle2 className="h-4 w-4" />} label="Kluczowe argumenty" />
              <div className="space-y-3">
                {cleanArguments.map((argument, index) => (
                  <div key={`${argument}-${index}`} className={`rounded-[28px] border px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] dark:border-slate-700/70 dark:bg-slate-900/76 ${variant.panel}`}>
                    <p className="text-sm leading-relaxed text-foreground">{argument}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {visibleBlocks.length > 0 ? (
            <section>
              <SectionTitle icon={<Sparkles className="h-4 w-4" />} label="Bloki analizy" />
              <div className="space-y-3">
                {visibleBlocks.map((block) => (
                  <div key={block.id} className={`rounded-[30px] border px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] dark:border-slate-700/70 dark:bg-slate-900/76 ${variant.panel}`}>
                    {block.title ? <p className={`mb-2 text-sm font-black uppercase tracking-[0.16em] ${variant.accent}`}>{block.title}</p> : null}
                    {block.type === "chart" && block.value ? (
                      <p className={`mb-3 text-3xl font-black leading-none ${variant.accent}`}>{block.value}</p>
                    ) : null}
                    {block.type === "expert_quote" ? (
                      <div className="rounded-[24px] bg-foreground/[0.03] px-4 py-4 dark:bg-white/[0.04]">
                        <div className="mb-2 flex items-center gap-2 text-primary">
                          <Quote className="h-4 w-4" />
                          <span className="text-[11px] font-black uppercase tracking-[0.18em]">Cytat eksperta</span>
                        </div>
                        <p className="text-base leading-relaxed text-foreground">{block.content}</p>
                        {block.sourceLabel ? <p className="mt-2 text-xs font-semibold text-muted-foreground">{block.sourceLabel}</p> : null}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-foreground">{block.content}</p>
                    )}
                    {block.sourceLabel && block.type !== "expert_quote" ? (
                      <p className="mt-3 text-xs font-semibold text-muted-foreground">{block.sourceLabel}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          {cleanCounterarguments.length > 0 ? (
            <section>
              <SectionTitle icon={<BarChart2 className="h-4 w-4" />} label="Kontrargumenty" />
              <div className="space-y-3">
                {cleanCounterarguments.map((item, index) => (
                  <div key={`${item}-${index}`} className={`rounded-[24px] border px-5 py-4 dark:border-slate-700/70 dark:bg-slate-900/76 ${variant.panel}`}>
                    <p className="text-sm leading-relaxed text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {analysis.conclusions ? (
            <section>
              <SectionTitle icon={<CheckCircle2 className="h-4 w-4" />} label="Wnioski" />
              <div className={`rounded-[26px] border px-5 py-5 dark:border-slate-700/70 dark:bg-slate-900/76 ${variant.panel}`}>
                <p className="text-sm leading-relaxed text-foreground">{analysis.conclusions}</p>
              </div>
            </section>
          ) : null}

          {analysis.recommendations ? (
            <section>
              <SectionTitle icon={<Sparkles className="h-4 w-4" />} label="Rekomendacje" />
              <div className={`rounded-[26px] border px-5 py-5 dark:border-slate-700/70 dark:bg-slate-900/76 ${variant.panel}`}>
                <p className="text-sm leading-relaxed text-foreground">{analysis.recommendations}</p>
              </div>
            </section>
          ) : null}

          {(cleanSources.length > 0 || analysis.bibliography) ? (
            <section>
              <SectionTitle icon={<BookOpen className="h-4 w-4" />} label="Źródła i bibliografia" />
              <div className={`rounded-[26px] border px-5 py-5 dark:border-slate-700/70 dark:bg-slate-900/76 ${variant.panel}`}>
                {cleanSources.length > 0 ? (
                  <ul className="space-y-2">
                    {cleanSources.map((source, index) => (
                      <li key={`${source}-${index}`} className="flex gap-3 text-sm leading-relaxed text-foreground">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${variant.tone}`} />
                        <span>{source}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {analysis.bibliography ? (
                  <div className={cleanSources.length > 0 ? "mt-4 border-t border-border pt-4" : ""}>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Bibliografia</p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">{analysis.bibliography}</p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
