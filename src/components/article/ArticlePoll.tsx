import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BadgeCheck, BarChart3, CheckCircle2, Loader2 } from "lucide-react";

type PollOption = {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  color?: string;
};

type ArticlePollConfig = {
  enabled: boolean;
  pollId: string;
  title: string;
  lead?: string;
  type: "single" | "multiple" | "scale" | "duel";
  status: "active" | "hidden" | "closed";
  options: PollOption[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min?: string; max?: string };
  allowMultiple?: boolean;
  maxSelections?: number;
  voteLimitMode: "single_device" | "single_user" | "revote_after_time" | "none";
  revoteAfterHours?: number;
  allowAnonymous: boolean;
  requireLogin: boolean;
  showResultsAfterVote: boolean;
  hideResultsUntilEnd: boolean;
  showPercentages: boolean;
  showVoteCount: boolean;
  showProgressBars: boolean;
  showWinner: boolean;
  showAverageRating: boolean;
  startDate?: number;
  endDate?: number;
  autoCloseAfterEnd: boolean;
  endMessage?: string;
  styleVariant: "portal" | "minimal" | "featured" | "editorial";
  width: "full" | "container" | "narrow";
  borderRadius?: number;
  shadow: boolean;
  backgroundColor?: string;
  accentColor?: string;
  buttonColor?: string;
  resultStyle: "bars" | "compact" | "cards";
  answerCardStyle: "soft" | "outline" | "solid";
  voteButtonLabel?: string;
  afterVoteLabel?: string;
  resultsLabel?: string;
  closedLabel?: string;
  repeatVoteError?: string;
  showBelowArticleWhenNoShortcode: boolean;
};

type SubmitPollVoteResult = {
  ok: boolean;
  code: string;
  message?: string;
  voteId?: string;
};

function getClientVoteKey(pollId: string) {
  return `article-poll:${pollId}`;
}

export default function ArticlePoll({
  articleId,
  poll,
}: {
  articleId: Id<"articles">;
  poll: ArticlePollConfig;
}) {
  const results = useQuery(api.articles.getPollResults, { articleId });
  const submitVote = useMutation(api.articles.submitPollVote);
  const currentUser = useQuery(api.users.currentUser);
  const [selected, setSelected] = useState<string[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [localVoted, setLocalVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const voteStorageKey = useMemo(() => getClientVoteKey(poll.pollId), [poll.pollId]);

  useEffect(() => {
    const raw = window.localStorage.getItem(voteStorageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { votedAt: number };
      if (poll.voteLimitMode === "revote_after_time") {
        const expiresAt = parsed.votedAt + (poll.revoteAfterHours ?? 24) * 60 * 60 * 1000;
        setLocalVoted(expiresAt > Date.now());
        return;
      }
      if (poll.voteLimitMode !== "none") {
        setLocalVoted(true);
      }
    } catch {
      window.localStorage.removeItem(voteStorageKey);
    }
  }, [voteStorageKey, poll.voteLimitMode, poll.revoteAfterHours]);

  const canVote = poll.status === "active" && !submitting;
  const maxSelections = poll.maxSelections ?? 2;
  const hasVoted = localVoted;
  const isClosed = !!results?.isClosed || poll.status === "closed";
  const showResults = !!results && (poll.hideResultsUntilEnd ? results.isClosed || hasVoted : poll.showResultsAfterVote ? hasVoted || results.isClosed : true);
  const showVotingUI = !hasVoted && !isClosed && poll.status === "active";
  const hasTwoOptions = poll.options.length === 2 && poll.type !== "multiple";
  const widthClass = poll.width === "narrow" ? "max-w-2xl" : poll.width === "container" ? "max-w-4xl" : "max-w-none";

  const variantClass = {
    portal: "border-border bg-white dark:border-slate-700/70 dark:bg-slate-900/72",
    minimal: "border-border bg-background dark:border-slate-700/70 dark:bg-slate-900/72",
    featured: "border-primary/20 bg-primary/5 dark:border-primary/25 dark:bg-primary/10",
    editorial: "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.96))] dark:border-slate-700/70 dark:bg-slate-900/72",
  }[poll.styleVariant];

  const answerClass = {
    soft: "border-transparent bg-muted/40 hover:bg-muted/60 dark:bg-slate-800/60 dark:hover:bg-slate-800/82",
    outline: "border-border bg-white hover:border-primary/30 dark:border-slate-700/70 dark:bg-slate-900/74",
    solid: "border-transparent bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/72 dark:hover:bg-slate-800/90",
  }[poll.answerCardStyle];

  const accent = poll.accentColor || "#d97706";
  const buttonColor = poll.buttonColor || accent;
  const radius = poll.borderRadius ?? 24;

  const handleToggleSelection = (optionId: string) => {
    setError(null);
    setNotice(null);
    if (poll.type === "single" || poll.type === "duel") {
      setSelected([optionId]);
      return;
    }

    setSelected((current) => {
      if (current.includes(optionId)) {
        return current.filter((item) => item !== optionId);
      }
      if (current.length >= maxSelections) {
        return current;
      }
      return [...current, optionId];
    });
  };

  const handleVote = async () => {
    if (poll.type === "scale" && rating === null) {
      setError("Wybierz ocenę");
      return;
    }
    if (poll.type !== "scale" && selected.length === 0) {
      setError("Wybierz odpowiedź");
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const response = await submitVote({
        articleId,
        voterKey: currentUser?._id ?? voteStorageKey,
        selections: poll.type === "scale" ? undefined : selected,
        rating: poll.type === "scale" ? rating ?? undefined : undefined,
      }) as SubmitPollVoteResult;

      if (response.ok) {
        window.localStorage.setItem(voteStorageKey, JSON.stringify({ votedAt: Date.now() }));
        setLocalVoted(true);
        setNotice(poll.afterVoteLabel || "Dziękujemy za oddanie głosu.");
        return;
      }

      if (response.code === "already_voted" || response.code === "revote_blocked") {
        window.localStorage.setItem(voteStorageKey, JSON.stringify({ votedAt: Date.now() }));
        setLocalVoted(true);
      }

      if (response.code === "already_voted") {
        setNotice(response.message ? `${response.message} Pokazujemy aktualne wyniki ankiety.` : "Twój głos został już zapisany. Poniżej są aktualne wyniki ankiety.");
        return;
      }

      setError(response.message || "Nie udało się oddać głosu");
    } catch (err: any) {
      setError(err?.message || "Nie udało się oddać głosu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className={`my-4 ${widthClass}`}
    >
      <div
        className={`border p-3.5 sm:p-4 ${variantClass} ${poll.shadow ? "shadow-md shadow-slate-200/35" : ""}`}
        style={{ borderRadius: `${radius}px`, backgroundColor: poll.backgroundColor || undefined }}
      >
        <div className="mb-2.5 flex items-center gap-2">
          <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em]" style={{ backgroundColor: `${accent}1A`, color: accent }}>
            Ankieta
          </span>
          <span className="text-xs text-muted-foreground">{poll.status === "closed" ? (poll.closedLabel || "Zakończona") : "Aktywna"}</span>
        </div>

        <h3 className="text-lg font-black leading-tight text-foreground sm:text-xl">{poll.title}</h3>
        {poll.lead && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{poll.lead}</p>}

        {showVotingUI && poll.type === "scale" ? (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: (poll.scaleMax ?? 5) - (poll.scaleMin ?? 1) + 1 }, (_, index) => (poll.scaleMin ?? 1) + index).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black transition-all ${rating === value ? "border-transparent text-white" : "border-border bg-white text-foreground"}`}
                  style={rating === value ? { backgroundColor: accent } : undefined}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>{poll.scaleLabels?.min}</span>
              <span>{poll.scaleLabels?.max}</span>
            </div>
          </div>
        ) : showVotingUI && poll.type === "duel" ? (
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {poll.options.slice(0, 2).map((option) => {
              const isSelected = selected.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggleSelection(option.id)}
                  className={`rounded-[18px] border p-4 text-left transition-all ${isSelected ? "border-transparent text-white shadow-md" : `${answerClass}`}`}
                  style={isSelected ? { backgroundColor: option.color || accent } : undefined}
                >
                  <div className="flex items-center gap-3">
                    {option.imageUrl ? <img src={option.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" /> : null}
                    <div>
                      <p className="text-base font-black">{option.icon ? `${option.icon} ` : ""}{option.label}</p>
                      {option.description && <p className={`mt-1 text-sm ${isSelected ? "text-white/85" : "text-muted-foreground"}`}>{option.description}</p>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : showVotingUI ? (
          <div className={`mt-3 ${hasTwoOptions ? "grid gap-2 sm:grid-cols-2" : "space-y-2"}`}>
            {poll.options.map((option) => {
              const isSelected = selected.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggleSelection(option.id)}
                  className={`flex w-full items-center gap-3 rounded-[15px] border px-3 py-2.5 text-left transition-all ${isSelected ? "border-transparent text-white shadow-sm" : answerClass}`}
                  style={isSelected ? { backgroundColor: option.color || accent } : undefined}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? "border-white bg-white/20" : "border-border bg-white"}`}>
                    {isSelected ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{option.icon ? `${option.icon} ` : ""}{option.label}</p>
                    {option.description && <p className={`text-xs ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>{option.description}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {!showVotingUI && hasVoted && (
          <div className="mt-3 flex items-center gap-2 rounded-[15px] border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{notice || poll.afterVoteLabel || "Dziękujemy za oddanie głosu."}</span>
          </div>
        )}

        {!showVotingUI && !hasVoted && isClosed && (
          <div className="mt-3 rounded-[15px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {poll.closedLabel || poll.endMessage || "Ankieta została zakończona."}
          </div>
        )}

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        {showVotingUI && (
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleVote}
              disabled={!canVote}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: buttonColor }}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (poll.voteButtonLabel || "Głosuj")}
            </button>
            {poll.type === "multiple" && (
              <span className="text-xs text-muted-foreground">Maksymalnie: {maxSelections}</span>
            )}
          </div>
        )}

        {showResults && results && (
          <div className="mt-4 border-t border-border pt-3.5">
            <div className="mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <p className="text-sm font-black text-foreground">{poll.resultsLabel || "Wyniki ankiety"}</p>
              {poll.showVoteCount && <span className="text-xs text-muted-foreground">{results.totalVotes} głosów</span>}
              {poll.type === "scale" && poll.showAverageRating && results.averageRating !== null && (
                <span className="text-xs text-muted-foreground">Średnia: {results.averageRating}</span>
              )}
            </div>

            {poll.type !== "scale" && (
              <div className={`gap-2 ${hasTwoOptions ? "grid sm:grid-cols-2" : "space-y-2"}`}>
                {results.optionResults.map((option) => (
                  <div key={option.id} className={`rounded-[15px] border p-2.5 ${poll.resultStyle === "cards" ? "bg-white" : "bg-muted/20"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{option.icon ? `${option.icon} ` : ""}{option.label}</p>
                      <div className="flex items-center gap-2">
                        {poll.showPercentages && <span className="text-xs font-bold text-foreground">{option.percentage}%</span>}
                        {poll.showVoteCount && <span className="text-xs text-muted-foreground">{option.votes}</span>}
                        {poll.showWinner && results.winnerId === option.id && <BadgeCheck className="h-4 w-4 text-primary" />}
                      </div>
                    </div>
                    {poll.showProgressBars && (
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted/40">
                        <div className="h-full rounded-full" style={{ width: `${option.percentage}%`, backgroundColor: option.color || accent }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {results.isClosed && poll.endMessage && (
              <p className="mt-4 text-sm text-muted-foreground">{poll.endMessage}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
