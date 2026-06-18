import { MessageSquareQuote, UserRound, Quote } from "lucide-react";

type InterviewParticipant = {
  id: string;
  name: string;
  role?: string;
  imageUrl?: string;
  bio?: string;
  color?: string;
  shortLabel?: string;
  isHost?: boolean;
};

type InterviewBlock = {
  id: string;
  type: "question" | "answer" | "commentary" | "heading" | "quote" | "teaser" | "info_box";
  content: string;
  title?: string;
  speakerId?: string;
  hidden?: boolean;
};

type InterviewConfig = {
  enabled: boolean;
  status: "active" | "draft" | "hidden";
  intro?: string;
  participants: InterviewParticipant[];
  blocks: InterviewBlock[];
  styleVariant: "classic" | "magazine" | "portal" | "minimal" | "lifestyle";
  questionStyle: "accent" | "boxed" | "inline";
  answerStyle: "plain" | "boxed" | "bubble";
  speakerLabelStyle: "pill" | "minimal" | "editorial";
  width: "narrow" | "container" | "wide";
  showSeparators: boolean;
  quoteStyle: "accent" | "magazine" | "minimal";
  showBioPanel: boolean;
};

export default function ArticleInterview({
  article,
  interview,
}: {
  article: any;
  interview: InterviewConfig;
}) {
  const widthClass = interview.width === "narrow" ? "max-w-3xl" : interview.width === "wide" ? "max-w-6xl" : "max-w-4xl";
  const styleClass = {
    classic: "border-slate-200 bg-white",
    magazine: "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,0.72),rgba(255,255,255,1))]",
    portal: "border-blue-200 bg-[linear-gradient(180deg,rgba(239,246,255,0.72),rgba(255,255,255,1))]",
    minimal: "border-slate-200 bg-[linear-gradient(180deg,rgba(250,250,250,1),rgba(255,255,255,1))]",
    lifestyle: "border-orange-200 bg-[linear-gradient(180deg,rgba(255,247,237,0.75),rgba(255,255,255,1))]",
  }[interview.styleVariant];

  const questionClass = {
    accent: "border-l-4 border-primary pl-4",
    boxed: "rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3",
    inline: "",
  }[interview.questionStyle];

  const answerClass = {
    plain: "",
    boxed: "rounded-2xl border border-border bg-muted/20 px-4 py-3",
    bubble: "rounded-[22px] bg-slate-100 px-4 py-3",
  }[interview.answerStyle];

  const quoteClass = {
    accent: "border-l-4 border-primary bg-primary/5",
    magazine: "border border-rose-200 bg-rose-50/70",
    minimal: "border border-border bg-muted/20",
  }[interview.quoteStyle];

  const participantMap = new Map(interview.participants.map((participant) => [participant.id, participant]));
  const visibleBlocks = interview.blocks.filter((block) => !block.hidden);

  return (
    <section className={`my-8 ${widthClass}`}>
      <div className={`overflow-hidden rounded-[34px] border shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-700/70 dark:shadow-[0_28px_90px_-34px_rgba(0,0,0,0.86)] ${styleClass}`}>
        <div className="relative border-b border-border px-5 py-6 sm:px-7">
          <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_56%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.14),transparent_48%)]" />
          <div className="relative z-10 rounded-[30px] border border-white/75 bg-white/72 px-4 py-5 backdrop-blur-sm dark:border-white/8 dark:bg-slate-950/46 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-background shadow-sm">
                <MessageSquareQuote className="h-3 w-3" />
                WYWIAD
              </span>
            </div>
            <h2 className="mt-4 max-w-4xl text-3xl font-black leading-[1.02] tracking-tight text-foreground sm:text-[2.35rem]">
              {article.title}
            </h2>
            {article.excerpt && <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>}
          </div>
          {interview.intro && (
            <div className="relative z-10 mt-6 rounded-[28px] border border-white/70 bg-white/90 px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/8 dark:bg-slate-950/58 dark:shadow-[0_18px_50px_-30px_rgba(0,0,0,0.88)]">
              <p className="text-base leading-relaxed text-foreground/80">{interview.intro}</p>
            </div>
          )}
        </div>

        {interview.participants.length > 0 && (
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-muted-foreground">Rozmówcy</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {interview.participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`rounded-[28px] border p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] ${
                    participant.isHost
                      ? "border-sky-200 bg-[linear-gradient(180deg,rgba(239,246,255,0.95),rgba(255,255,255,0.98))] dark:border-sky-400/28 dark:bg-[linear-gradient(180deg,rgba(18,38,52,0.92),rgba(16,18,28,0.94))]"
                      : "border-white/80 bg-white/95 dark:border-white/10 dark:bg-slate-950/64"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {participant.imageUrl ? (
                      <img
                        src={participant.imageUrl}
                        alt={participant.name}
                        className={`h-14 w-14 object-cover ${participant.isHost ? "rounded-full ring-4 ring-sky-100" : "rounded-2xl"}`}
                      />
                    ) : (
                      <div className={`flex h-14 w-14 items-center justify-center text-muted-foreground ${participant.isHost ? "rounded-full bg-sky-100 text-sky-700" : "rounded-2xl bg-muted"}`}>
                        <UserRound className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className={`inline-flex ${interview.speakerLabelStyle === "editorial" ? "text-[10px] uppercase tracking-[0.2em] text-muted-foreground" : interview.speakerLabelStyle === "minimal" ? "text-xs font-semibold text-muted-foreground" : "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-white"}`} style={interview.speakerLabelStyle === "pill" ? { backgroundColor: participant.color || "#0f766e" } : undefined}>
                          {participant.shortLabel || participant.name.slice(0, 2)}
                        </div>
                        {participant.isHost && (
                          <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-700 dark:border-sky-400/24 dark:bg-sky-500/10 dark:text-sky-200">
                            Prowadzacy
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-lg font-black text-foreground">{participant.name}</p>
                      {participant.role && <p className="text-sm text-muted-foreground">{participant.role}</p>}
                    </div>
                  </div>
                  {interview.showBioPanel && participant.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-foreground/75">{participant.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-5 py-5 sm:px-6">
          <div className="space-y-5">
            {visibleBlocks.map((block, index) => {
              const speaker = block.speakerId ? participantMap.get(block.speakerId) : null;
              const separator = interview.showSeparators && index < visibleBlocks.length - 1;

              return (
                <div key={block.id} className={separator ? "border-b border-border/70 pb-5" : ""}>
                  {block.type === "heading" && (
                    <h3 className="text-2xl font-black text-foreground">{block.content}</h3>
                  )}

                  {block.type === "question" && (
                    <div className={`${questionClass} rounded-[24px] bg-white/70 dark:bg-slate-900/56`}>
                      {speaker && <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: speaker.color || "#0f766e" }}>{speaker.shortLabel || speaker.name}</p>}
                      <p className="text-lg font-black leading-relaxed text-foreground">{block.content}</p>
                    </div>
                  )}

                  {block.type === "answer" && (
                    <div className={`${answerClass} shadow-[0_10px_30px_rgba(15,23,42,0.04)]`}>
                      {speaker && <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: speaker.color || "#c2410c" }}>{speaker.shortLabel || speaker.name}</p>}
                      <p className="text-base leading-relaxed text-foreground/85">{block.content}</p>
                    </div>
                  )}

                  {block.type === "commentary" && (
                    <aside className="rounded-[24px] border border-border bg-slate-50/90 px-4 py-4 dark:border-slate-700/70 dark:bg-slate-900/62">
                      {block.title && <p className="mb-2 text-sm font-black text-foreground">{block.title}</p>}
                      <p className="text-sm leading-relaxed text-foreground/75">{block.content}</p>
                    </aside>
                  )}

                  {block.type === "quote" && (
                    <blockquote className={`rounded-[28px] px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] ${quoteClass}`}>
                      <Quote className="mb-3 h-5 w-5 text-primary" />
                      <p className="text-lg font-semibold leading-relaxed text-foreground">{block.content}</p>
                    </blockquote>
                  )}

                  {block.type === "teaser" && (
                    <div className="rounded-[22px] bg-primary/6 px-4 py-3 dark:bg-primary/12">
                      {block.title && <p className="mb-2 text-sm font-black text-foreground">{block.title}</p>}
                      <p className="text-sm leading-relaxed text-foreground/80">{block.content}</p>
                    </div>
                  )}

                  {block.type === "info_box" && (
                    <div className="rounded-[22px] border border-border bg-white/90 px-4 py-3 dark:border-slate-700/70 dark:bg-slate-900/68">
                      {block.title && <p className="mb-2 text-sm font-black text-foreground">{block.title}</p>}
                      <p className="text-sm leading-relaxed text-foreground/80">{block.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
