import { Camera, Clock3, FileText, Image as ImageIcon, MapPin, Quote, ScrollText, Users2 } from "lucide-react";

type ReportCharacter = {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  imageUrl?: string;
  isPrimary?: boolean;
};

type ReportPlace = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

type ReportBlock = {
  id: string;
  type: "scene" | "place_description" | "hero_quote" | "reporter_note" | "turning_point" | "timeline" | "context_box" | "gallery";
  title?: string;
  content: string;
  imageUrl?: string;
  extra?: string;
  hidden?: boolean;
};

type ArticleReportData = {
  enabled: boolean;
  intro?: string;
  mainHero?: string;
  characters: ReportCharacter[];
  places: ReportPlace[];
  eventPeriod?: string;
  tone: "spokojny" | "emocjonalny" | "surowy" | "lokalny" | "immersyjny";
  theme?: string;
  whatToKnow?: string;
  materials: string[];
  ending?: string;
  blocks: ReportBlock[];
  styleVariant: "classic" | "magazine" | "field" | "human" | "visual";
};

const styleMap = {
  classic: "border-stone-200 bg-[linear-gradient(180deg,#fff,rgba(250,250,249,.96))]",
  magazine: "border-amber-200 bg-[linear-gradient(180deg,rgba(255,247,237,.86),#fff)]",
  field: "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,.86),#fff)]",
  human: "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,.82),#fff)]",
  visual: "border-sky-200 bg-[linear-gradient(180deg,rgba(240,249,255,.86),#fff)]",
} as const;

export default function ArticleReport({ report }: { report: ArticleReportData }) {
  const visibleBlocks = report.blocks.filter((block) => !block.hidden && block.content.trim());
  const primaryHero = report.characters.find((character) => character.isPrimary) ?? report.characters[0];
  const wrapperClass = styleMap[report.styleVariant] ?? styleMap.classic;

  return (
    <div className={`not-prose rounded-[36px] border p-5 sm:p-7 shadow-[0_28px_90px_rgba(15,23,42,0.08)] dark:border-slate-700/70 dark:shadow-[0_30px_90px_-36px_rgba(0,0,0,0.86)] ${wrapperClass}`}>
      <div className="relative mb-8 overflow-hidden rounded-[32px] border border-white/60 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-slate-950/48 dark:shadow-[0_20px_60px_-34px_rgba(0,0,0,0.9)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_38%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-background">
            <ScrollText className="h-3.5 w-3.5" />
            Reportaz
          </div>
          {report.intro ? (
            <p className="mt-4 max-w-4xl text-xl leading-relaxed text-foreground/85 sm:text-[1.35rem]">{report.intro}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {report.eventPeriod ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 dark:border-slate-700/70 dark:bg-slate-900/78">
                <Clock3 className="h-4 w-4" />
                {report.eventPeriod}
              </span>
            ) : null}
            {report.theme ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 dark:border-slate-700/70 dark:bg-slate-900/78">
                <FileText className="h-4 w-4" />
                {report.theme}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 dark:border-slate-700/70 dark:bg-slate-900/78">
              <Users2 className="h-4 w-4" />
              Ton: {report.tone}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(290px,0.8fr)]">
        <div className="space-y-5">
          {visibleBlocks.map((block) => (
            <section key={block.id} className="rounded-[30px] border border-border bg-background/85 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] dark:border-slate-700/70 dark:bg-slate-900/74">
              {block.title ? <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{block.title}</p> : null}

              {block.type === "hero_quote" ? (
                <div className="rounded-[24px] bg-primary/5 px-5 py-5 dark:bg-primary/12">
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    <Quote className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase tracking-[0.18em]">Cytat bohatera</span>
                  </div>
                  <p className="text-xl font-semibold leading-relaxed text-foreground">{block.content}</p>
                </div>
              ) : block.type === "gallery" ? (
                <div className="space-y-4">
                  {block.imageUrl ? (
                    <img src={block.imageUrl} alt={block.title ?? "Galeria reportazu"} className="h-72 w-full rounded-[24px] object-cover" />
                  ) : null}
                  <div className="rounded-[24px] border border-dashed border-border bg-muted/20 px-4 py-5 dark:border-slate-700/70 dark:bg-slate-800/64">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <Camera className="h-4 w-4" />
                      <span className="text-[11px] font-black uppercase tracking-[0.18em]">Galeria zdjec</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{block.content}</p>
                  </div>
                </div>
              ) : block.type === "place_description" ? (
                <div className="space-y-4">
                  {block.imageUrl ? (
                    <img src={block.imageUrl} alt={block.title ?? "Miejsce reportazu"} className="h-64 w-full rounded-[24px] object-cover" />
                  ) : null}
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-primary">
                      <MapPin className="h-4 w-4" />
                      <span className="text-[11px] font-black uppercase tracking-[0.18em]">Opis miejsca</span>
                    </div>
                    <p className="text-base leading-relaxed text-foreground">{block.content}</p>
                  </div>
                </div>
              ) : block.type === "turning_point" ? (
                <div className="rounded-[24px] border border-primary/20 bg-primary/5 px-5 py-5 dark:bg-primary/12">
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary">Punkt zwrotny</p>
                  <p className="text-base font-semibold leading-relaxed text-foreground">{block.content}</p>
                </div>
              ) : block.type === "timeline" ? (
                <div className="rounded-[24px] bg-muted/20 px-5 py-5 dark:bg-slate-800/64">
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Os wydarzen</p>
                  <p className="text-sm leading-relaxed text-foreground">{block.content}</p>
                  {block.extra ? <p className="mt-3 text-xs font-semibold text-muted-foreground">{block.extra}</p> : null}
                </div>
              ) : block.type === "context_box" ? (
                <div className="rounded-[24px] border border-border bg-muted/20 px-5 py-5 dark:border-slate-700/70 dark:bg-slate-800/64">
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Kontekst</p>
                  <p className="text-sm leading-relaxed text-foreground">{block.content}</p>
                </div>
              ) : (
                <p className="text-base leading-relaxed text-foreground">{block.content}</p>
              )}

              {block.extra && block.type !== "timeline" ? (
                <p className="mt-4 text-xs font-semibold text-muted-foreground">{block.extra}</p>
              ) : null}
            </section>
          ))}

          {report.ending ? (
            <section className="rounded-[30px] border border-border bg-foreground px-6 py-6 text-background">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-background/70">Zakonczenie</p>
              <p className="mt-3 text-lg leading-relaxed">{report.ending}</p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          {primaryHero ? (
            <section className="rounded-[28px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Glowny bohater</p>
              <div className="mt-4 flex items-start gap-4">
                {primaryHero.imageUrl ? (
                  <img src={primaryHero.imageUrl} alt={primaryHero.name} className="h-20 w-20 rounded-[24px] object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-muted">
                    <Users2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-black text-foreground">{report.mainHero || primaryHero.name}</p>
                  {primaryHero.role ? <p className="text-sm font-semibold text-primary">{primaryHero.role}</p> : null}
                  {primaryHero.bio ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{primaryHero.bio}</p> : null}
                </div>
              </div>
            </section>
          ) : null}

          {report.characters.length > 0 ? (
            <section className="rounded-[28px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Bohaterowie</p>
              <div className="space-y-3">
                {report.characters.map((character) => (
                  <div key={character.id} className="rounded-[22px] bg-muted/20 px-4 py-3 dark:bg-slate-800/64">
                    <p className="text-sm font-black text-foreground">{character.name}</p>
                    {character.role ? <p className="text-xs font-semibold text-primary">{character.role}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {report.places.length > 0 ? (
            <section className="rounded-[28px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Miejsca</p>
              <div className="space-y-3">
                {report.places.map((place) => (
                  <div key={place.id} className="rounded-[22px] bg-muted/20 px-4 py-3 dark:bg-slate-800/64">
                    <p className="text-sm font-black text-foreground">{place.name}</p>
                    {place.description ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{place.description}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {report.whatToKnow ? (
            <section className="rounded-[28px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Co warto wiedziec</p>
              <p className="text-sm leading-relaxed text-foreground">{report.whatToKnow}</p>
            </section>
          ) : null}

          {report.materials.filter(Boolean).length > 0 ? (
            <section className="rounded-[28px] border border-border bg-background/90 p-5">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Zrodla / materialy</p>
              <div className="space-y-2">
                {report.materials.filter(Boolean).map((item, index) => (
                  <div key={`${item}-${index}`} className="flex gap-3 rounded-[18px] bg-muted/20 px-4 py-3">
                    <ImageIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm leading-relaxed text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
