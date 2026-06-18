import { MessageCircleMore, MessagesSquare, Quote, StickyNote } from "lucide-react";

type DialogParticipant = {
  id: string;
  name: string;
  role?: string;
  color?: string;
};

type DialogBlock = {
  id: string;
  type: "speaker_a" | "speaker_b" | "speaker_c" | "narrator" | "highlight_quote" | "editor_note";
  speakerId?: string;
  content: string;
  title?: string;
  hidden?: boolean;
};

type ArticleDialogData = {
  enabled: boolean;
  description?: string;
  context?: string;
  conversationStyle: "swobodny" | "dynamiczny" | "formalny" | "emocjonalny" | "miejski";
  place?: string;
  ending?: string;
  participants: DialogParticipant[];
  blocks: DialogBlock[];
};

export default function ArticleDialog({ dialog }: { dialog: ArticleDialogData }) {
  const visibleBlocks = dialog.blocks.filter((block) => !block.hidden && block.content.trim());

  return (
    <div className="not-prose rounded-[36px] border border-violet-200 bg-[linear-gradient(180deg,rgba(245,243,255,.95),#fff)] p-5 shadow-[0_28px_90px_rgba(15,23,42,0.08)] dark:border-violet-400/24 dark:shadow-[0_30px_90px_-36px_rgba(0,0,0,0.86)] sm:p-7">
      <div className="relative mb-8 overflow-hidden rounded-[32px] border border-white/60 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-slate-950/48 dark:shadow-[0_20px_60px_-34px_rgba(0,0,0,0.9)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_38%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-700 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white">
            <MessagesSquare className="h-3.5 w-3.5" />
            Dialog
          </div>
          {dialog.description ? <p className="mt-4 max-w-4xl text-xl leading-relaxed text-foreground/85">{dialog.description}</p> : null}
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {dialog.place ? <span className="rounded-full border border-border bg-background px-3 py-1.5 dark:border-slate-700/70 dark:bg-slate-900/78">{dialog.place}</span> : null}
            <span className="rounded-full border border-border bg-background px-3 py-1.5 dark:border-slate-700/70 dark:bg-slate-900/78">Styl: {dialog.conversationStyle}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.85fr)]">
        <div className="space-y-4">
          {dialog.context ? (
            <section className="rounded-[26px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Kontekst rozmowy</p>
              <p className="text-sm leading-relaxed text-foreground">{dialog.context}</p>
            </section>
          ) : null}

          {visibleBlocks.map((block) => {
            const speaker = dialog.participants.find((participant) => participant.id === block.speakerId);
            const accent = speaker?.color || "#7c3aed";

            if (block.type === "highlight_quote") {
              return (
                <section key={block.id} className="rounded-[28px] bg-violet-50 px-6 py-6 dark:bg-violet-500/10">
                  <div className="mb-2 flex items-center gap-2 text-violet-700">
                    <Quote className="h-4 w-4" />
                    <p className="text-[11px] font-black uppercase tracking-[0.18em]">Cytat wyrózniony</p>
                  </div>
                  <p className="text-xl font-semibold leading-relaxed text-foreground">{block.content}</p>
                </section>
              );
            }

            if (block.type === "editor_note") {
              return (
                <section key={block.id} className="rounded-[28px] border border-border bg-background/92 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] dark:border-slate-700/70 dark:bg-slate-900/74">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <StickyNote className="h-4 w-4" />
                    <p className="text-[11px] font-black uppercase tracking-[0.18em]">Notatka redakcyjna</p>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{block.content}</p>
                </section>
              );
            }

            if (block.type === "narrator") {
              return (
                <section key={block.id} className="rounded-[28px] border border-border bg-white/85 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] dark:border-slate-700/70 dark:bg-slate-900/72">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <MessageCircleMore className="h-4 w-4" />
                    <p className="text-[11px] font-black uppercase tracking-[0.18em]">Komentarz narratora</p>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{block.content}</p>
                </section>
              );
            }

            return (
              <section key={block.id} className="rounded-[30px] border border-border bg-background/95 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] dark:border-slate-700/70 dark:bg-slate-900/76">
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full ring-4 ring-white dark:ring-slate-950" style={{ backgroundColor: accent }} />
                  <div>
                    <p className="text-sm font-black text-foreground">{speaker?.name || block.title || "Uczestnik"}</p>
                    {speaker?.role ? <p className="text-xs text-muted-foreground">{speaker.role}</p> : null}
                  </div>
                </div>
                <div className="rounded-[22px] px-4 py-4" style={{ backgroundColor: `${accent}12` }}>
                  <p className="text-base leading-relaxed text-foreground">{block.content}</p>
                </div>
              </section>
            );
          })}

          {dialog.ending ? (
            <section className="rounded-[28px] bg-foreground px-6 py-6 text-background">
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-background/70">Zakonczenie</p>
              <p className="text-lg leading-relaxed">{dialog.ending}</p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
            <section className="rounded-[28px] border border-border bg-background/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/74">
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Uczestnicy dialogu</p>
            <div className="space-y-3">
              {dialog.participants.map((participant) => (
                <div key={participant.id} className="rounded-[22px] bg-muted/20 px-4 py-3 dark:bg-slate-800/70">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: participant.color || "#7c3aed" }} />
                    <p className="text-sm font-black text-foreground">{participant.name}</p>
                  </div>
                  {participant.role ? <p className="text-xs text-muted-foreground">{participant.role}</p> : null}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
