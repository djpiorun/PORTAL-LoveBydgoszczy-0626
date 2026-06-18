import { useState, useEffect } from "react";
import { Plus, Link } from "lucide-react";
import CollapsibleSection from "@/components/admin/article-editor/helpers/CollapsibleSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type {
  ArticlePollDraft, PollOptionDraft,
  ArticleQuizDraft, QuizAnswerDraft, QuizQuestionDraft, QuizResultDraft,
  ArticleInterviewDraft, InterviewParticipantDraft, InterviewBlockDraft,
  ArticleAnalysisDraft, AnalysisMetricDraft, AnalysisBlockDraft,
  ArticleReportDraft, ReportCharacterDraft, ReportPlaceDraft, ReportBlockDraft,
  ArticleOpinionDraft, OpinionBlockDraft,
  ArticleDialogDraft, DialogParticipantDraft, DialogBlockDraft,
  ArticleAnnouncementDraft, ArticleSponsoredDraft,
} from "@/components/admin/article-editor/types/articleEditorTypes";
import {
  createDefaultPollOption, createDefaultPoll,
  createDefaultQuizAnswer, createDefaultQuizQuestion, createDefaultQuizResult, createDefaultQuiz,
  createDefaultInterviewParticipant, createDefaultInterviewBlock, createDefaultInterview,
  createDefaultAnalysisMetric, createDefaultAnalysisBlock, createDefaultAnalysis,
  createDefaultReportCharacter, createDefaultReportPlace, createDefaultReportBlock, createDefaultReport,
  createDefaultOpinionBlock, createDefaultOpinion,
  createDefaultDialogParticipant, createDefaultDialogBlock, createDefaultDialog,
  createDefaultAnnouncement, createDefaultSponsored,
  normalizeInterviewDraft,
} from "@/components/admin/article-editor/helpers/articleDefaults";

export function PollEditor({
  poll,
  articleContent,
  onChange,
}: {
  poll: ArticlePollDraft;
  articleContent: string;
  onChange: (next: ArticlePollDraft) => void;
}) {
  const shortcodeUsed = articleContent.includes("[ankieta]") || articleContent.includes(`[${poll.pollId}]`);

  const updatePoll = (patch: Partial<ArticlePollDraft>) => onChange({ ...poll, ...patch });
  const updateOption = (index: number, patch: Partial<PollOptionDraft>) => {
    onChange({
      ...poll,
      options: poll.options.map((option, optionIndex) => optionIndex === index ? { ...option, ...patch } : option),
    });
  };
  const moveOption = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= poll.options.length) return;
    const next = [...poll.options];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);
    updatePoll({ options: next });
  };
  const addOption = () => updatePoll({ options: [...poll.options, createDefaultPollOption(`Opcja ${poll.options.length + 1}`)] });
  const removeOption = (index: number) => updatePoll({ options: poll.options.filter((_, optionIndex) => optionIndex !== index) });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-foreground">ANKIETA</p>
            <p className="text-xs text-muted-foreground">Moduł zapisuje się razem z artykułem i może być osadzony shortcode `[ankieta]` lub `[${poll.pollId}]`.</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-[11px] font-bold ${poll.enabled ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
            {poll.enabled ? "Aktywna" : "Wyłączona"}
          </div>
        </div>
      </div>

      <CollapsibleSection title="Podstawowe" defaultOpen={true}>
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs mb-1.5 block">Tytuł ankiety</Label>
              <Input value={poll.title} onChange={e => updatePoll({ title: e.target.value })} placeholder="Np. Jak oceniasz tę zmianę?" className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Typ ankiety</Label>
              <select value={poll.type} onChange={e => updatePoll({ type: e.target.value as ArticlePollDraft["type"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="single">Jednokrotnego wyboru</option>
                <option value="multiple">Wielokrotnego wyboru</option>
                <option value="scale">Ocena / skala</option>
                <option value="duel">Pojedynek</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs mb-1.5 block">Lead ankiety</Label>
              <Textarea value={poll.lead ?? ""} onChange={e => updatePoll({ lead: e.target.value })} placeholder="Krótki opis ankiety..." className="min-h-[80px] resize-none text-sm" />
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1.5 block">Status</Label>
                <select value={poll.status} onChange={e => updatePoll({ status: e.target.value as ArticlePollDraft["status"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="active">Aktywna</option>
                  <option value="hidden">Ukryta</option>
                  <option value="closed">Zakończona</option>
                </select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">ID techniczne</Label>
                <Input value={poll.pollId} onChange={e => updatePoll({ pollId: e.target.value })} className="h-9 text-sm font-mono" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                <div>
                  <p className="text-xs font-semibold text-foreground">Pokaż automatycznie pod treścią</p>
                  <p className="text-[11px] text-muted-foreground">Używane, gdy shortcode nie występuje w treści.</p>
                </div>
                <Switch checked={poll.showBelowArticleWhenNoShortcode} onCheckedChange={value => updatePoll({ showBelowArticleWhenNoShortcode: value })} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            Shortcode w treści: {shortcodeUsed ? <strong className="text-foreground">wykryty</strong> : <strong className="text-foreground">brak</strong>}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Opcje odpowiedzi" defaultOpen={true} badge={String(poll.options.length)}>
        <div className="space-y-3">
          {poll.options.map((option, index) => (
            <div key={option.id} className="rounded-2xl border border-border bg-background p-3">
              <div className="grid gap-2 md:grid-cols-[1.2fr_0.9fr_0.7fr_0.7fr_auto]">
                <Input value={option.label} onChange={e => updateOption(index, { label: e.target.value })} placeholder="Treść odpowiedzi" className="h-9 text-sm" />
                <Input value={option.description ?? ""} onChange={e => updateOption(index, { description: e.target.value })} placeholder="Krótki opis" className="h-9 text-sm" />
                <Input value={option.icon ?? ""} onChange={e => updateOption(index, { icon: e.target.value })} placeholder="Emoji / ikonka" className="h-9 text-sm" />
                <Input value={option.color ?? ""} onChange={e => updateOption(index, { color: e.target.value })} placeholder="#f59e0b" className="h-9 text-sm" />
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveOption(index, -1)} className="h-9 w-9 rounded-md border border-border text-xs">↑</button>
                  <button type="button" onClick={() => moveOption(index, 1)} className="h-9 w-9 rounded-md border border-border text-xs">↓</button>
                  <button type="button" onClick={() => removeOption(index)} className="h-9 w-9 rounded-md border border-border text-red-600">×</button>
                </div>
              </div>
              <Input value={option.imageUrl ?? ""} onChange={e => updateOption(index, { imageUrl: e.target.value })} placeholder="URL obrazka przy odpowiedzi (opcjonalnie)" className="mt-2 h-9 text-sm" />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addOption} className="w-full justify-center">
            <Plus className="w-4 h-4 mr-1.5" />
            Dodaj odpowiedź
          </Button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Zasady głosowania" defaultOpen={false}>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-xs mb-1.5 block">Tryb limitu głosu</Label>
            <select value={poll.voteLimitMode} onChange={e => updatePoll({ voteLimitMode: e.target.value as ArticlePollDraft["voteLimitMode"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="single_device">Jeden głos na urządzenie</option>
              <option value="single_user">Jeden głos na użytkownika</option>
              <option value="revote_after_time">Ponowne głosowanie po czasie</option>
              <option value="none">Bez limitu</option>
            </select>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Maksymalna liczba odpowiedzi</Label>
            <Input type="number" value={poll.maxSelections ?? 2} onChange={e => updatePoll({ maxSelections: Number(e.target.value) || 1 })} className="h-9 text-sm" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2.5">
            <div>
              <p className="text-xs font-semibold text-foreground">Głosowanie bez logowania</p>
            </div>
            <Switch checked={poll.allowAnonymous} onCheckedChange={value => updatePoll({ allowAnonymous: value })} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2.5">
            <div>
              <p className="text-xs font-semibold text-foreground">Tylko dla zalogowanych</p>
            </div>
            <Switch checked={poll.requireLogin} onCheckedChange={value => updatePoll({ requireLogin: value })} />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Wyniki i czas trwania" defaultOpen={false}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            {[
              ["showResultsAfterVote", "Pokaż wyniki po głosie"],
              ["hideResultsUntilEnd", "Ukryj wyniki do końca"],
              ["showPercentages", "Pokaż procenty"],
              ["showVoteCount", "Pokaż liczbę głosów"],
              ["showProgressBars", "Pokaż paski postępu"],
              ["showWinner", "Pokaż zwycięską odpowiedź"],
              ["showAverageRating", "Pokaż średnią ocenę"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                <p className="text-xs font-semibold text-foreground">{label}</p>
                <Switch checked={(poll as any)[key]} onCheckedChange={value => updatePoll({ [key]: value } as Partial<ArticlePollDraft>)} />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1.5 block">Data rozpoczęcia</Label>
              <input type="datetime-local" value={poll.startDate ? new Date(poll.startDate).toISOString().slice(0, 16) : ""} onChange={e => updatePoll({ startDate: e.target.value ? new Date(e.target.value).getTime() : undefined })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Data zakończenia</Label>
              <input type="datetime-local" value={poll.endDate ? new Date(poll.endDate).toISOString().slice(0, 16) : ""} onChange={e => updatePoll({ endDate: e.target.value ? new Date(e.target.value).getTime() : undefined })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
            <Textarea value={poll.endMessage ?? ""} onChange={e => updatePoll({ endMessage: e.target.value })} placeholder="Komunikat po zakończeniu ankiety" className="min-h-[80px] resize-none text-sm" />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Wygląd i teksty" defaultOpen={false}>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-xs mb-1.5 block">Styl ankiety</Label>
            <select value={poll.styleVariant} onChange={e => updatePoll({ styleVariant: e.target.value as ArticlePollDraft["styleVariant"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="portal">Nowoczesny portalowy</option>
              <option value="minimal">Minimalistyczny</option>
              <option value="featured">Wyróżniony / kolorowy</option>
              <option value="editorial">Premium / editorial</option>
            </select>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Szerokość</Label>
            <select value={poll.width} onChange={e => updatePoll({ width: e.target.value as ArticlePollDraft["width"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="full">Pełna</option>
              <option value="container">W kontenerze</option>
              <option value="narrow">Wąska</option>
            </select>
          </div>
          <Input value={poll.backgroundColor ?? ""} onChange={e => updatePoll({ backgroundColor: e.target.value })} placeholder="Kolor tła" className="h-9 text-sm" />
          <Input value={poll.accentColor ?? ""} onChange={e => updatePoll({ accentColor: e.target.value })} placeholder="Kolor akcentu" className="h-9 text-sm" />
          <Input value={poll.buttonColor ?? ""} onChange={e => updatePoll({ buttonColor: e.target.value })} placeholder="Kolor przycisku głosowania" className="h-9 text-sm" />
          <Input value={poll.voteButtonLabel ?? ""} onChange={e => updatePoll({ voteButtonLabel: e.target.value })} placeholder="Napis przycisku głosowania" className="h-9 text-sm" />
          <Input value={poll.afterVoteLabel ?? ""} onChange={e => updatePoll({ afterVoteLabel: e.target.value })} placeholder="Napis po oddaniu głosu" className="h-9 text-sm" />
          <Input value={poll.resultsLabel ?? ""} onChange={e => updatePoll({ resultsLabel: e.target.value })} placeholder="Napis przy wynikach" className="h-9 text-sm" />
        </div>
      </CollapsibleSection>

      <div className="rounded-2xl border border-border bg-background p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Podgląd ankiety w panelu</p>
        <div className="rounded-2xl border border-border bg-muted/20 p-4">
          <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary">ANKIETA</span>
          <p className="mt-3 text-lg font-black text-foreground">{poll.title || "Tytuł ankiety"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{poll.lead || "Krótki opis ankiety wyświetlany na froncie."}</p>
          <div className="mt-4 space-y-2">
            {poll.options.slice(0, poll.type === "duel" ? 2 : 4).map((option) => (
              <div key={option.id} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                {option.icon ? `${option.icon} ` : ""}{option.label || "Opcja odpowiedzi"}
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            {shortcodeUsed ? `Shortcode [ankieta] lub [${poll.pollId}] został użyty w treści.` : `Shortcode [ankieta] lub [${poll.pollId}] nie został użyty. Ankieta może pojawić się pod treścią, jeśli włączono tę opcję.`}
          </p>
        </div>
      </div>
    </div>
  );
}

export function QuizEditor({
  quiz,
  articleTitle,
  articleLead,
  onChange,
}: {
  quiz: ArticleQuizDraft;
  articleTitle: string;
  articleLead: string;
  onChange: (next: ArticleQuizDraft) => void;
}) {
  const [tab, setTab] = useState<"settings" | "questions" | "results" | "appearance" | "publication">("settings");
  const updateQuiz = (patch: Partial<ArticleQuizDraft>) => onChange({ ...quiz, ...patch });
  const updateQuestion = (index: number, patch: Partial<QuizQuestionDraft>) => {
    updateQuiz({
      questions: quiz.questions.map((question, questionIndex) => questionIndex === index ? { ...question, ...patch } : question),
    });
  };
  const updateAnswer = (questionIndex: number, answerIndex: number, patch: Partial<QuizAnswerDraft>) => {
    updateQuestion(questionIndex, {
      answers: quiz.questions[questionIndex].answers.map((answer, currentIndex) => currentIndex === answerIndex ? { ...answer, ...patch } : answer),
    });
  };
  const addQuestion = () => updateQuiz({ questions: [...quiz.questions, createDefaultQuizQuestion(quiz.questions.length + 1)] });
  const removeQuestion = (index: number) => updateQuiz({ questions: quiz.questions.filter((_, questionIndex) => questionIndex !== index) });
  const moveQuestion = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= quiz.questions.length) return;
    const next = [...quiz.questions];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);
    updateQuiz({ questions: next });
  };
  const addAnswer = (questionIndex: number) => {
    const question = quiz.questions[questionIndex];
    updateQuestion(questionIndex, {
      answers: [...question.answers, createDefaultQuizAnswer(`Odpowiedź ${String.fromCharCode(65 + question.answers.length)}`)],
    });
  };
  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    updateQuestion(questionIndex, {
      answers: quiz.questions[questionIndex].answers.filter((_, currentIndex) => currentIndex !== answerIndex),
    });
  };
  const addResult = () => updateQuiz({ results: [...quiz.results, createDefaultQuizResult(`wynik-${quiz.results.length + 1}`, `Wynik ${quiz.results.length + 1}`)] });
  const updateResult = (index: number, patch: Partial<QuizResultDraft>) => {
    updateQuiz({
      results: quiz.results.map((result, resultIndex) => resultIndex === index ? { ...result, ...patch } : result),
    });
  };
  const removeResult = (index: number) => updateQuiz({ results: quiz.results.filter((_, resultIndex) => resultIndex !== index) });

  useEffect(() => {
    if (!quiz.title.trim() && articleTitle.trim()) {
      updateQuiz({ title: articleTitle });
    }
  }, [articleTitle]);

  const quizTabs = [
    { id: "settings" as const, label: "Ustawienia quizu" },
    { id: "questions" as const, label: "Pytania" },
    { id: "results" as const, label: "Wyniki" },
    { id: "appearance" as const, label: "Wygląd quizu" },
    { id: "publication" as const, label: "Publikacja / zachowanie" },
  ];

  return (
    <div className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.95))] p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            TRYB QUIZ
          </div>
          <h3 className="mt-2 text-xl font-black text-foreground">{quiz.title || articleTitle || "Nowy quiz"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Typ artykułu `QUIZ` zapisuje pełny obiekt quizu i renderuje go publicznie jako interaktywny materiał.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background px-3 py-2 text-right">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Stan quizu</p>
          <p className="text-sm font-semibold text-foreground">{quiz.status}</p>
          <p className="mt-1 text-[11px] font-mono text-muted-foreground">{quiz.quizId}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quizTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              tab === item.id ? "border-border bg-background text-primary shadow-sm" : "border-transparent bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "settings" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs">Typ quizu</Label>
                  <select value={quiz.type} onChange={(e) => updateQuiz({ type: e.target.value as ArticleQuizDraft["type"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="single">Jednokrotnego wyboru</option>
                    <option value="multiple">Wielokrotnego wyboru</option>
                    <option value="image">Obrazkowy / lifestyle</option>
                    <option value="personality">Osobowościowy / wynikowy</option>
                    <option value="scored">Punktowy</option>
                    <option value="yes_no">Tak / Nie</option>
                    <option value="choices">Co wybierasz?</option>
                  </select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Tytuł quizu</Label>
                  <Input value={quiz.title} onChange={(e) => updateQuiz({ title: e.target.value })} className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Etykieta nad tytułem</Label>
                  <Input value={quiz.badgeLabel ?? ""} onChange={(e) => updateQuiz({ badgeLabel: e.target.value })} className="h-9 text-sm" placeholder="QUIZ" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Podtytuł quizu</Label>
                  <Input value={quiz.subtitle ?? ""} onChange={(e) => updateQuiz({ subtitle: e.target.value })} className="h-9 text-sm" placeholder="Krótki podtytuł lub kicker" />
                </div>
              </div>
              <div className="mt-3">
                <Label className="mb-1.5 block text-xs">Opis quizu / intro</Label>
                <Textarea value={quiz.description ?? ""} onChange={(e) => updateQuiz({ description: e.target.value })} className="min-h-[90px] resize-none text-sm" placeholder={articleLead || "Opis lifestylowego quizu widoczny na froncie."} />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs">Tekst startowy</Label>
                  <Textarea value={quiz.intro ?? ""} onChange={(e) => updateQuiz({ intro: e.target.value })} className="min-h-[80px] resize-none text-sm" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Tekst przycisku start</Label>
                  <Input value={quiz.startButtonLabel ?? ""} onChange={(e) => updateQuiz({ startButtonLabel: e.target.value })} className="h-9 text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              ["showQuestionNumbers", "Pokazuj numer pytania"],
              ["showProgress", "Pokazuj pasek postępu"],
              ["showQuestionCount", "Pokazuj liczbę pytań"],
              ["randomizeQuestions", "Losuj kolejność pytań"],
              ["randomizeAnswers", "Losuj kolejność odpowiedzi"],
              ["allowBack", "Pozwalaj wrócić do poprzedniego pytania"],
              ["singlePage", "Quiz jednostronicowy"],
              ["autoAdvance", "Po odpowiedzi przechodź dalej"],
              ["showResultImmediately", "Pokaż wynik od razu po zakończeniu"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <Switch checked={(quiz as any)[key]} onCheckedChange={(value) => updateQuiz({ [key]: value } as Partial<ArticleQuizDraft>)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "questions" && (
        <div className="mt-4 space-y-4">
          {quiz.questions.map((question, questionIndex) => (
            <div key={question.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-black text-foreground">Pytanie {questionIndex + 1}</p>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveQuestion(questionIndex, -1)} className="h-8 w-8 rounded-md border border-border text-xs">↑</button>
                  <button type="button" onClick={() => moveQuestion(questionIndex, 1)} className="h-8 w-8 rounded-md border border-border text-xs">↓</button>
                  <button type="button" onClick={() => removeQuestion(questionIndex)} className="h-8 w-8 rounded-md border border-border text-red-600">×</button>
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <Label className="mb-1.5 block text-xs">Treść pytania</Label>
                  <Input value={question.question} onChange={(e) => updateQuestion(questionIndex, { question: e.target.value })} className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Typ odpowiedzi</Label>
                  <select value={question.answerType} onChange={(e) => updateQuestion(questionIndex, { answerType: e.target.value as QuizQuestionDraft["answerType"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="single">Jedna odpowiedź</option>
                    <option value="multiple">Wiele odpowiedzi</option>
                    <option value="image">Obrazkowe kafle</option>
                    <option value="yes_no">Tak / Nie</option>
                    <option value="choices">Co wybierasz?</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr]">
                <Textarea value={question.description ?? ""} onChange={(e) => updateQuestion(questionIndex, { description: e.target.value })} className="min-h-[72px] resize-none text-sm" placeholder="Opis lub doprecyzowanie pytania" />
                <div className="space-y-3">
                  <Input value={question.imageUrl ?? ""} onChange={(e) => updateQuestion(questionIndex, { imageUrl: e.target.value })} className="h-9 text-sm" placeholder="URL grafiki pytania" />
                  <Input type="number" value={question.maxSelections ?? 2} onChange={(e) => updateQuestion(questionIndex, { maxSelections: Number(e.target.value) || 1 })} className="h-9 text-sm" placeholder="Maks. zaznaczeń" />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {question.answers.map((answer, answerIndex) => (
                  <div key={answer.id} className="rounded-2xl border border-border bg-muted/20 p-3">
                    <div className="grid gap-2 md:grid-cols-[1.1fr_0.8fr_0.6fr_0.5fr_0.7fr_auto]">
                      <Input value={answer.label} onChange={(e) => updateAnswer(questionIndex, answerIndex, { label: e.target.value })} className="h-9 text-sm" placeholder="Treść odpowiedzi" />
                      <Input value={answer.description ?? ""} onChange={(e) => updateAnswer(questionIndex, answerIndex, { description: e.target.value })} className="h-9 text-sm" placeholder="Opis" />
                      <Input value={answer.icon ?? ""} onChange={(e) => updateAnswer(questionIndex, answerIndex, { icon: e.target.value })} className="h-9 text-sm" placeholder="Emoji" />
                      <Input value={answer.color ?? ""} onChange={(e) => updateAnswer(questionIndex, answerIndex, { color: e.target.value })} className="h-9 text-sm" placeholder="#f97316" />
                      <Input value={answer.resultKey ?? ""} onChange={(e) => updateAnswer(questionIndex, answerIndex, { resultKey: e.target.value })} className="h-9 text-sm" placeholder="Klucz wyniku" />
                      <button type="button" onClick={() => removeAnswer(questionIndex, answerIndex)} className="h-9 w-9 rounded-md border border-border text-red-600">×</button>
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-[1fr_120px_120px]">
                      <Input value={answer.imageUrl ?? ""} onChange={(e) => updateAnswer(questionIndex, answerIndex, { imageUrl: e.target.value })} className="h-9 text-sm" placeholder="URL obrazka odpowiedzi" />
                      <Input type="number" value={answer.points ?? 0} onChange={(e) => updateAnswer(questionIndex, answerIndex, { points: Number(e.target.value) || 0 })} className="h-9 text-sm" placeholder="Punkty" />
                      <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3">
                        <span className="text-xs font-semibold text-foreground">Poprawna</span>
                        <Switch checked={answer.isCorrect ?? false} onCheckedChange={(value) => updateAnswer(questionIndex, answerIndex, { isCorrect: value })} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => addAnswer(questionIndex)} className="w-full justify-center">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Dodaj odpowiedź
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" onClick={addQuestion} className="w-full justify-center rounded-2xl">
            <Plus className="mr-1.5 h-4 w-4" />
            Dodaj pytanie
          </Button>
        </div>
      )}

      {tab === "results" && (
        <div className="mt-4 space-y-4">
          {quiz.results.map((result, resultIndex) => (
            <div key={result.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-black text-foreground">Wynik {resultIndex + 1}</p>
                <button type="button" onClick={() => removeResult(resultIndex)} className="h-8 w-8 rounded-md border border-border text-red-600">×</button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Input value={result.key} onChange={(e) => updateResult(resultIndex, { key: e.target.value })} className="h-9 text-sm font-mono" placeholder="Klucz wyniku" />
                <Input value={result.title} onChange={(e) => updateResult(resultIndex, { title: e.target.value })} className="h-9 text-sm" placeholder="Tytuł wyniku" />
                <Textarea value={result.description} onChange={(e) => updateResult(resultIndex, { description: e.target.value })} className="min-h-[90px] resize-none text-sm" placeholder="Opis wyniku" />
                <div className="space-y-3">
                  <Input value={result.imageUrl ?? ""} onChange={(e) => updateResult(resultIndex, { imageUrl: e.target.value })} className="h-9 text-sm" placeholder="URL grafiki wyniku" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" value={result.minScore ?? ""} onChange={(e) => updateResult(resultIndex, { minScore: e.target.value ? Number(e.target.value) : undefined })} className="h-9 text-sm" placeholder="Min pkt" />
                    <Input type="number" value={result.maxScore ?? ""} onChange={(e) => updateResult(resultIndex, { maxScore: e.target.value ? Number(e.target.value) : undefined })} className="h-9 text-sm" placeholder="Max pkt" />
                    <Input type="number" value={result.minPercent ?? ""} onChange={(e) => updateResult(resultIndex, { minPercent: e.target.value ? Number(e.target.value) : undefined })} className="h-9 text-sm" placeholder="Min %" />
                    <Input type="number" value={result.maxPercent ?? ""} onChange={(e) => updateResult(resultIndex, { maxPercent: e.target.value ? Number(e.target.value) : undefined })} className="h-9 text-sm" placeholder="Max %" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={result.ctaLabel ?? ""} onChange={(e) => updateResult(resultIndex, { ctaLabel: e.target.value })} className="h-9 text-sm" placeholder="CTA label" />
                    <Input value={result.ctaUrl ?? ""} onChange={(e) => updateResult(resultIndex, { ctaUrl: e.target.value })} className="h-9 text-sm" placeholder="CTA URL" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addResult} className="w-full justify-center">
            <Plus className="mr-1.5 h-4 w-4" />
            Dodaj wynik
          </Button>
        </div>
      )}

      {tab === "appearance" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs">Styl quizu</Label>
                <select value={quiz.styleVariant} onChange={(e) => updateQuiz({ styleVariant: e.target.value as ArticleQuizDraft["styleVariant"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="lifestyle">Nowoczesny lifestyle</option>
                  <option value="editorial">Premium editorial</option>
                  <option value="magazine">Magazynowy</option>
                  <option value="news">Newsowy light</option>
                  <option value="soft">Kobiecy / soft lifestyle</option>
                  <option value="urban">Miejski / modern</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Styl kafli odpowiedzi</Label>
                <select value={quiz.answerCardStyle} onChange={(e) => updateQuiz({ answerCardStyle: e.target.value as ArticleQuizDraft["answerCardStyle"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="soft">Soft</option>
                  <option value="outline">Outline</option>
                  <option value="solid">Solid</option>
                  <option value="glass">Glass</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Szerokość</Label>
                <select value={quiz.width} onChange={(e) => updateQuiz({ width: e.target.value as ArticleQuizDraft["width"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="narrow">Wąska</option>
                  <option value="container">W kontenerze</option>
                  <option value="full">Pełna szerokość</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Układ</Label>
                <select value={quiz.layout} onChange={(e) => updateQuiz({ layout: e.target.value as ArticleQuizDraft["layout"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="column">Kolumna</option>
                  <option value="grid">Siatka</option>
                  <option value="two_column">Kafle 2 kolumny</option>
                  <option value="full_width">Pełna szerokość</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Styl paska postępu</Label>
                <select value={quiz.progressStyle} onChange={(e) => updateQuiz({ progressStyle: e.target.value as ArticleQuizDraft["progressStyle"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="line">Linia</option>
                  <option value="steps">Kroki</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Styl nagłówka</Label>
                <select value={quiz.headerStyle} onChange={(e) => updateQuiz({ headerStyle: e.target.value as ArticleQuizDraft["headerStyle"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="classic">Classic</option>
                  <option value="hero">Hero</option>
                  <option value="split">Split</option>
                </select>
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Input type="number" value={quiz.borderRadius ?? 28} onChange={(e) => updateQuiz({ borderRadius: Number(e.target.value) || 0 })} className="h-9 text-sm" placeholder="Zaokrąglenia" />
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                <span className="text-xs font-semibold text-foreground">Cienie</span>
                <Switch checked={quiz.shadow} onCheckedChange={(value) => updateQuiz({ shadow: value })} />
              </div>
              <Input value={quiz.accentColor ?? ""} onChange={(e) => updateQuiz({ accentColor: e.target.value })} className="h-9 text-sm" placeholder="Kolor akcentu" />
              <Input value={quiz.buttonColor ?? ""} onChange={(e) => updateQuiz({ buttonColor: e.target.value })} className="h-9 text-sm" placeholder="Kolor przycisku" />
              <Input value={quiz.backgroundColor ?? ""} onChange={(e) => updateQuiz({ backgroundColor: e.target.value })} className="h-9 text-sm" placeholder="Kolor tła sekcji" />
              <Input value={quiz.headerGradient ?? ""} onChange={(e) => updateQuiz({ headerGradient: e.target.value })} className="h-9 text-sm" placeholder="Gradient nagłówka" />
              <Input value={quiz.headerImageUrl ?? ""} onChange={(e) => updateQuiz({ headerImageUrl: e.target.value })} className="h-9 text-sm md:col-span-2" placeholder="Zdjęcie w tle nagłówka quizu" />
            </div>
          </div>
          <div className="space-y-3">
            {[
              ["showCoverImage", "Pokaż grafikę główną quizu"],
              ["showBadge", "Pokaż badge QUIZ"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <Switch checked={(quiz as any)[key]} onCheckedChange={(value) => updateQuiz({ [key]: value } as Partial<ArticleQuizDraft>)} />
              </div>
            ))}
            <div className="rounded-[28px] border border-border bg-background p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Podgląd stylu</p>
              <div className="mt-3 rounded-[24px] border border-border p-4" style={{ background: quiz.headerGradient || quiz.backgroundColor || "#fff7ed" }}>
                {quiz.showBadge && <span className="inline-flex rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-foreground">{quiz.badgeLabel || "QUIZ"}</span>}
                <p className="mt-3 text-lg font-black text-foreground">{quiz.title || articleTitle || "Tytuł quizu"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{quiz.description || articleLead || "Opis quizu widoczny na froncie."}</p>
                <button type="button" className="mt-4 rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: quiz.buttonColor || "#ea580c" }}>
                  {quiz.startButtonLabel || "Rozpocznij quiz"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "publication" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Status quizu</Label>
            <select value={quiz.status} onChange={(e) => updateQuiz({ status: e.target.value as ArticleQuizDraft["status"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="active">Aktywny</option>
              <option value="draft">Roboczy</option>
              <option value="hidden">Ukryty</option>
              <option value="preview">Podgląd admina</option>
              <option value="template">Szablon quizu</option>
              <option value="archived">Archiwizacja</option>
            </select>
            <p className="mt-2 text-[11px] text-muted-foreground">
              `template`, `draft`, `hidden` i `archived` nie powinny być używane jako publiczna publikacja quizu.
            </p>
          </div>
          <div className="space-y-3">
            {[
              ["enabled", "Quiz włączony w artykule"],
              ["isPublic", "Publikacja publiczna"],
              ["adminPreview", "Podgląd tylko dla admina"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <Switch checked={(quiz as any)[key]} onCheckedChange={(value) => updateQuiz({ [key]: value } as Partial<ArticleQuizDraft>)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function InterviewEditor({
  interview,
  onChange,
}: {
  interview: ArticleInterviewDraft;
  onChange: (next: ArticleInterviewDraft) => void;
}) {
  const [tab, setTab] = useState<"intro" | "participants" | "content" | "extras" | "appearance">("intro");
  const updateInterview = (patch: Partial<ArticleInterviewDraft>) => onChange({ ...interview, ...patch });
  const updateParticipant = (index: number, patch: Partial<InterviewParticipantDraft>) => {
    updateInterview({
      participants: interview.participants.map((participant, participantIndex) => participantIndex === index ? { ...participant, ...patch } : participant),
    });
  };
  const addParticipant = () => updateInterview({ participants: [...interview.participants, createDefaultInterviewParticipant(`Rozmówca ${interview.participants.length + 1}`)] });
  const removeParticipant = (index: number) => updateInterview({ participants: interview.participants.filter((_, participantIndex) => participantIndex !== index) });
  const updateBlock = (index: number, patch: Partial<InterviewBlockDraft>) => {
    updateInterview({
      blocks: interview.blocks.map((block, blockIndex) => blockIndex === index ? { ...block, ...patch } : block),
    });
  };
  const addBlock = (type: InterviewBlockDraft["type"]) => updateInterview({
    blocks: [...interview.blocks, createDefaultInterviewBlock(type, type === "question" ? "Nowe pytanie..." : "Nowy blok...")],
  });
  const removeBlock = (index: number) => updateInterview({ blocks: interview.blocks.filter((_, blockIndex) => blockIndex !== index) });
  const moveBlock = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= interview.blocks.length) return;
    const next = [...interview.blocks];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);
    updateInterview({ blocks: next });
  };

  const tabs = [
    { id: "intro" as const, label: "Wstęp wywiadu" },
    { id: "participants" as const, label: "Rozmówcy" },
    { id: "content" as const, label: "Treść wywiadu" },
    { id: "extras" as const, label: "Dodatki redakcyjne" },
    { id: "appearance" as const, label: "Ustawienia wyglądu" },
  ];

  return (
    <div className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.96))] p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            TRYB WYWIAD
          </div>
          <h3 className="mt-2 text-xl font-black text-foreground">Struktura wywiadu</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Wywiad zapisuje rozmówców, układ pytanie–odpowiedź i dodatkowe bloki redakcyjne jako osobny obiekt artykułu.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background px-3 py-2 text-right">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="text-sm font-semibold text-foreground">{interview.status}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              tab === item.id ? "border-border bg-background text-primary shadow-sm" : "border-transparent bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "intro" && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <Label className="mb-1.5 block text-xs">Wstęp wywiadu</Label>
          <Textarea value={interview.intro ?? ""} onChange={(e) => updateInterview({ intro: e.target.value })} className="min-h-[120px] resize-none text-sm" />
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2.5">
            <span className="text-xs font-semibold text-foreground">Aktywny wywiad</span>
            <Switch checked={interview.enabled} onCheckedChange={(value) => updateInterview({ enabled: value })} />
          </div>
        </div>
      )}

      {tab === "participants" && (
        <div className="mt-4 space-y-4">
          {interview.participants.map((participant, index) => (
            <div key={participant.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-black text-foreground">Rozmówca {index + 1}</p>
                <button type="button" onClick={() => removeParticipant(index)} className="h-8 w-8 rounded-md border border-border text-red-600">×</button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Input value={participant.name} onChange={(e) => updateParticipant(index, { name: e.target.value })} className="h-9 text-sm" placeholder="Imię i nazwisko" />
                <Input value={participant.role ?? ""} onChange={(e) => updateParticipant(index, { role: e.target.value })} className="h-9 text-sm" placeholder="Rola / opis" />
                <Input value={participant.imageUrl ?? ""} onChange={(e) => updateParticipant(index, { imageUrl: e.target.value })} className="h-9 text-sm" placeholder="Zdjęcie" />
                <Input value={participant.shortLabel ?? ""} onChange={(e) => updateParticipant(index, { shortLabel: e.target.value })} className="h-9 text-sm" placeholder="Skrót przy wypowiedzi" />
                <Input value={participant.color ?? ""} onChange={(e) => updateParticipant(index, { color: e.target.value })} className="h-9 text-sm" placeholder="Kolor podpisu" />
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                  <span className="text-xs font-semibold text-foreground">Prowadzący / dziennikarz</span>
                  <Switch checked={participant.isHost ?? false} onCheckedChange={(value) => updateParticipant(index, { isHost: value })} />
                </div>
              </div>
              <Textarea value={participant.bio ?? ""} onChange={(e) => updateParticipant(index, { bio: e.target.value })} className="mt-3 min-h-[90px] resize-none text-sm" placeholder="Krótki bio opis rozmówcy" />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addParticipant} className="w-full justify-center">
            <Plus className="mr-1.5 h-4 w-4" />
            Dodaj rozmówcę
          </Button>
        </div>
      )}

      {tab === "content" && (
        <div className="mt-4 space-y-4">
          {interview.blocks.map((block, index) => (
            <div key={block.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-black text-foreground">{block.type}</p>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveBlock(index, -1)} className="h-8 w-8 rounded-md border border-border text-xs">↑</button>
                  <button type="button" onClick={() => moveBlock(index, 1)} className="h-8 w-8 rounded-md border border-border text-xs">↓</button>
                  <button type="button" onClick={() => updateBlock(index, { hidden: !block.hidden })} className="rounded-md border border-border px-2 text-[11px]">{block.hidden ? "Pokaż" : "Ukryj"}</button>
                  <button type="button" onClick={() => removeBlock(index)} className="h-8 w-8 rounded-md border border-border text-red-600">×</button>
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr]">
                <select value={block.type} onChange={(e) => updateBlock(index, { type: e.target.value as InterviewBlockDraft["type"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="question">Pytanie</option>
                  <option value="answer">Odpowiedź</option>
                  <option value="commentary">Komentarz redakcyjny</option>
                  <option value="heading">Śródtytuł</option>
                  <option value="quote">Cytat wyróżniony</option>
                  <option value="teaser">Dodatkowa zajawka</option>
                  <option value="info_box">Ramka informacyjna</option>
                </select>
                <select value={block.speakerId ?? ""} onChange={(e) => updateBlock(index, { speakerId: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Bez przypisanego rozmówcy</option>
                  {interview.participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>{participant.name}</option>
                  ))}
                </select>
              </div>
              <Input value={block.title ?? ""} onChange={(e) => updateBlock(index, { title: e.target.value })} className="mt-3 h-9 text-sm" placeholder="Nagłówek / tytuł bloku (opcjonalnie)" />
              <Textarea value={block.content} onChange={(e) => updateBlock(index, { content: e.target.value })} className="mt-3 min-h-[110px] resize-none text-sm" placeholder="Treść bloku..." />
            </div>
          ))}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["question", "Dodaj pytanie"],
              ["answer", "Dodaj odpowiedź"],
              ["commentary", "Dodaj komentarz"],
              ["quote", "Dodaj cytat"],
            ].map(([type, label]) => (
              <Button key={type} type="button" variant="outline" onClick={() => addBlock(type as InterviewBlockDraft["type"])} className="justify-center">
                <Plus className="mr-1.5 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {tab === "extras" && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">Dodatki redakcyjne</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bloki `komentarz redakcyjny`, `śródtytuł`, `cytat wyróżniony`, `dodatkowa zajawka` i `ramka informacyjna` dodajesz bezpośrednio w sekcji treści wywiadu.
          </p>
        </div>
      )}

      {tab === "appearance" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs">Styl wywiadu</Label>
                <select value={interview.styleVariant} onChange={(e) => updateInterview({ styleVariant: e.target.value as ArticleInterviewDraft["styleVariant"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="classic">Klasyczny redakcyjny</option>
                  <option value="magazine">Premium magazynowy</option>
                  <option value="portal">Nowoczesny portalowy</option>
                  <option value="minimal">Minimalistyczny</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Wyróżnienie pytań</Label>
                <select value={interview.questionStyle} onChange={(e) => updateInterview({ questionStyle: e.target.value as ArticleInterviewDraft["questionStyle"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="accent">Akcent</option>
                  <option value="boxed">Boxed</option>
                  <option value="inline">Inline</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Wyróżnienie odpowiedzi</Label>
                <select value={interview.answerStyle} onChange={(e) => updateInterview({ answerStyle: e.target.value as ArticleInterviewDraft["answerStyle"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="plain">Plain</option>
                  <option value="boxed">Boxed</option>
                  <option value="bubble">Bubble</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Styl podpisów rozmówców</Label>
                <select value={interview.speakerLabelStyle} onChange={(e) => updateInterview({ speakerLabelStyle: e.target.value as ArticleInterviewDraft["speakerLabelStyle"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="pill">Pill</option>
                  <option value="minimal">Minimal</option>
                  <option value="editorial">Editorial</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Szerokość treści</Label>
                <select value={interview.width} onChange={(e) => updateInterview({ width: e.target.value as ArticleInterviewDraft["width"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="narrow">Wąska</option>
                  <option value="container">W kontenerze</option>
                  <option value="wide">Szeroka</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Styl cytatów</Label>
                <select value={interview.quoteStyle} onChange={(e) => updateInterview({ quoteStyle: e.target.value as ArticleInterviewDraft["quoteStyle"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="accent">Akcent</option>
                  <option value="magazine">Magazynowy</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              ["showSeparators", "Pokaż separatory między blokami"],
              ["showBioPanel", "Pokaż panel bio rozmówców"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <Switch checked={(interview as any)[key]} onCheckedChange={(value) => updateInterview({ [key]: value } as Partial<ArticleInterviewDraft>)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AnalysisEditor({
  analysis,
  onChange,
}: {
  analysis: ArticleAnalysisDraft;
  onChange: (next: ArticleAnalysisDraft) => void;
}) {
  const [tab, setTab] = useState<"thesis" | "arguments" | "data" | "conclusions" | "appearance">("thesis");
  const updateAnalysis = (patch: Partial<ArticleAnalysisDraft>) => onChange({ ...analysis, ...patch });
  const updateArrayItem = (key: "arguments" | "counterarguments" | "sources", index: number, value: string) => {
    updateAnalysis({
      [key]: analysis[key].map((item, itemIndex) => itemIndex === index ? value : item),
    } as Partial<ArticleAnalysisDraft>);
  };
  const addArrayItem = (key: "arguments" | "counterarguments" | "sources", placeholder: string) => updateAnalysis({
    [key]: [...analysis[key], placeholder],
  } as Partial<ArticleAnalysisDraft>);
  const removeArrayItem = (key: "arguments" | "counterarguments" | "sources", index: number) => updateAnalysis({
    [key]: analysis[key].filter((_, itemIndex) => itemIndex !== index),
  } as Partial<ArticleAnalysisDraft>);
  const updateMetric = (index: number, patch: Partial<AnalysisMetricDraft>) => updateAnalysis({
    metrics: analysis.metrics.map((metric, metricIndex) => metricIndex === index ? { ...metric, ...patch } : metric),
  });
  const addMetric = () => updateAnalysis({ metrics: [...analysis.metrics, createDefaultAnalysisMetric("Nowa metryka", "0")] });
  const removeMetric = (index: number) => updateAnalysis({ metrics: analysis.metrics.filter((_, metricIndex) => metricIndex !== index) });
  const updateBlock = (index: number, patch: Partial<AnalysisBlockDraft>) => updateAnalysis({
    blocks: analysis.blocks.map((block, blockIndex) => blockIndex === index ? { ...block, ...patch } : block),
  });
  const addBlock = (type: AnalysisBlockDraft["type"]) => updateAnalysis({ blocks: [...analysis.blocks, createDefaultAnalysisBlock(type, "Nowa treść bloku analitycznego")] });
  const removeBlock = (index: number) => updateAnalysis({ blocks: analysis.blocks.filter((_, blockIndex) => blockIndex !== index) });

  const tabs = [
    { id: "thesis" as const, label: "Teza / pytanie" },
    { id: "arguments" as const, label: "Argumenty" },
    { id: "data" as const, label: "Dane / źródła" },
    { id: "conclusions" as const, label: "Wnioski" },
    { id: "appearance" as const, label: "Wygląd" },
  ];

  return (
    <div className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.96))] p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            TRYB ANALIZA
          </div>
          <h3 className="mt-2 text-xl font-black text-foreground">Struktura analizy</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Analiza zapisuje tezę, argumenty, kontrargumenty, dane, źródła, wnioski i rekomendacje jako osobny obiekt artykułu.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background px-3 py-2 text-right">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Poziom ekspercki</p>
          <p className="text-sm font-semibold text-foreground">{analysis.expertLevel}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              tab === item.id ? "border-border bg-background text-primary shadow-sm" : "border-transparent bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "thesis" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Teza analizy</Label>
            <Textarea value={analysis.thesis ?? ""} onChange={(e) => updateAnalysis({ thesis: e.target.value })} className="min-h-[90px] resize-none text-sm" />
            <Label className="mb-1.5 mt-4 block text-xs">Główne pytanie analizy</Label>
            <Textarea value={analysis.mainQuestion ?? ""} onChange={(e) => updateAnalysis({ mainQuestion: e.target.value })} className="min-h-[90px] resize-none text-sm" />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Krótkie streszczenie</Label>
            <Textarea value={analysis.summary ?? ""} onChange={(e) => updateAnalysis({ summary: e.target.value })} className="min-h-[90px] resize-none text-sm" />
            <Label className="mb-1.5 mt-4 block text-xs">Kontekst</Label>
            <Textarea value={analysis.context ?? ""} onChange={(e) => updateAnalysis({ context: e.target.value })} className="min-h-[120px] resize-none text-sm" />
            <Label className="mb-1.5 mt-4 block text-xs">Poziom ekspercki</Label>
            <select value={analysis.expertLevel} onChange={(e) => updateAnalysis({ expertLevel: e.target.value as ArticleAnalysisDraft["expertLevel"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="podstawowy">Podstawowy</option>
              <option value="średni">Średni</option>
              <option value="zaawansowany">Zaawansowany</option>
              <option value="ekspercki">Ekspercki</option>
            </select>
          </div>
        </div>
      )}

      {tab === "arguments" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="mb-3 text-sm font-black text-foreground">Kluczowe argumenty</p>
            <div className="space-y-2">
              {analysis.arguments.map((item, index) => (
                <div key={`arg-${index}`} className="flex gap-2">
                  <Input value={item} onChange={(e) => updateArrayItem("arguments", index, e.target.value)} className="h-9 text-sm" />
                  <button type="button" onClick={() => removeArrayItem("arguments", index)} className="h-9 w-9 rounded-md border border-border text-red-600">×</button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => addArrayItem("arguments", "Nowy argument")} className="w-full justify-center">
                <Plus className="mr-1.5 h-4 w-4" />
                Dodaj argument
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="mb-3 text-sm font-black text-foreground">Kontrargumenty</p>
            <div className="space-y-2">
              {analysis.counterarguments.map((item, index) => (
                <div key={`counter-${index}`} className="flex gap-2">
                  <Input value={item} onChange={(e) => updateArrayItem("counterarguments", index, e.target.value)} className="h-9 text-sm" />
                  <button type="button" onClick={() => removeArrayItem("counterarguments", index)} className="h-9 w-9 rounded-md border border-border text-red-600">×</button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => addArrayItem("counterarguments", "Nowy kontrargument")} className="w-full justify-center">
                <Plus className="mr-1.5 h-4 w-4" />
                Dodaj kontrargument
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4 lg:col-span-2">
            <p className="mb-3 text-sm font-black text-foreground">Bloki analizy</p>
            <div className="space-y-3">
              {analysis.blocks.map((block, index) => (
                <div key={block.id} className="rounded-2xl border border-border bg-muted/20 p-3">
                  <div className="grid gap-2 md:grid-cols-[180px_1fr_auto]">
                    <select value={block.type} onChange={(e) => updateBlock(index, { type: e.target.value as AnalysisBlockDraft["type"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="argument">Argument</option>
                      <option value="counterargument">Kontrargument</option>
                      <option value="chart">Wykres / liczba</option>
                      <option value="data_box">Ramka danych</option>
                      <option value="expert_quote">Cytat eksperta</option>
                      <option value="partial_conclusion">Wniosek cząstkowy</option>
                      <option value="sources">Sekcja źródeł</option>
                      <option value="recommendations">Sekcja rekomendacji</option>
                    </select>
                    <Input value={block.title ?? ""} onChange={(e) => updateBlock(index, { title: e.target.value })} className="h-9 text-sm" placeholder="Nagłówek bloku" />
                    <button type="button" onClick={() => removeBlock(index)} className="h-9 w-9 rounded-md border border-border text-red-600">×</button>
                  </div>
                  <Textarea value={block.content} onChange={(e) => updateBlock(index, { content: e.target.value })} className="mt-2 min-h-[90px] resize-none text-sm" />
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["argument", "Dodaj argument"],
                ["chart", "Dodaj liczbę"],
                ["expert_quote", "Dodaj cytat"],
                ["recommendations", "Dodaj rekomendacje"],
              ].map(([type, label]) => (
                <Button key={type} type="button" variant="outline" onClick={() => addBlock(type as AnalysisBlockDraft["type"])} className="justify-center">
                  <Plus className="mr-1.5 h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "data" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="mb-3 text-sm font-black text-foreground">Dane / liczby / źródła</p>
            <div className="space-y-3">
              {analysis.metrics.map((metric, index) => (
                <div key={metric.id} className="rounded-xl border border-border bg-muted/20 p-3">
                  <div className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
                    <Input value={metric.label} onChange={(e) => updateMetric(index, { label: e.target.value })} className="h-9 text-sm" placeholder="Etykieta" />
                    <Input value={metric.value} onChange={(e) => updateMetric(index, { value: e.target.value })} className="h-9 text-sm" placeholder="Wartość" />
                    <button type="button" onClick={() => removeMetric(index)} className="h-9 w-9 rounded-md border border-border text-red-600">×</button>
                  </div>
                  <Input value={metric.note ?? ""} onChange={(e) => updateMetric(index, { note: e.target.value })} className="mt-2 h-9 text-sm" placeholder="Krótka nota / źródło" />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addMetric} className="w-full justify-center">
                <Plus className="mr-1.5 h-4 w-4" />
                Dodaj liczbę / metrykę
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="mb-3 text-sm font-black text-foreground">Lista źródeł</p>
            <div className="space-y-2">
              {analysis.sources.map((item, index) => (
                <div key={`source-${index}`} className="flex gap-2">
                  <Input value={item} onChange={(e) => updateArrayItem("sources", index, e.target.value)} className="h-9 text-sm" />
                  <button type="button" onClick={() => removeArrayItem("sources", index)} className="h-9 w-9 rounded-md border border-border text-red-600">×</button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => addArrayItem("sources", "Nowe źródło")} className="w-full justify-center">
                <Plus className="mr-1.5 h-4 w-4" />
                Dodaj źródło
              </Button>
            </div>
            <Label className="mb-1.5 mt-4 block text-xs">Bibliografia</Label>
            <Textarea value={analysis.bibliography ?? ""} onChange={(e) => updateAnalysis({ bibliography: e.target.value })} className="min-h-[100px] resize-none text-sm" />
          </div>
        </div>
      )}

      {tab === "conclusions" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Wnioski końcowe</Label>
            <Textarea value={analysis.conclusions ?? ""} onChange={(e) => updateAnalysis({ conclusions: e.target.value })} className="min-h-[140px] resize-none text-sm" />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Rekomendacje / podsumowanie</Label>
            <Textarea value={analysis.recommendations ?? ""} onChange={(e) => updateAnalysis({ recommendations: e.target.value })} className="min-h-[140px] resize-none text-sm" />
          </div>
        </div>
      )}

      {tab === "appearance" && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <Label className="mb-1.5 block text-xs">Styl analizy</Label>
          <select value={analysis.styleVariant} onChange={(e) => updateAnalysis({ styleVariant: e.target.value as ArticleAnalysisDraft["styleVariant"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="expert">Ekspercki</option>
            <option value="economic">Ekonomiczny / biznesowy</option>
            <option value="political">Polityczny / publicystyczny</option>
            <option value="report">Raportowy</option>
            <option value="minimal">Minimalistyczny</option>
          </select>
        </div>
      )}
    </div>
  );
}

export function ReportEditor({
  report,
  onChange,
}: {
  report: ArticleReportDraft;
  onChange: (next: ArticleReportDraft) => void;
}) {
  const [tab, setTab] = useState<"intro" | "characters" | "places" | "blocks" | "ending" | "appearance">("intro");
  const updateReport = (patch: Partial<ArticleReportDraft>) => onChange({ ...report, ...patch });
  const updateCharacter = (index: number, patch: Partial<ReportCharacterDraft>) => updateReport({
    characters: report.characters.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
  });
  const updatePlace = (index: number, patch: Partial<ReportPlaceDraft>) => updateReport({
    places: report.places.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
  });
  const updateBlock = (index: number, patch: Partial<ReportBlockDraft>) => updateReport({
    blocks: report.blocks.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
  });

  const tabs = [
    { id: "intro" as const, label: "Intro reportażu" },
    { id: "characters" as const, label: "Bohaterowie" },
    { id: "places" as const, label: "Miejsca" },
    { id: "blocks" as const, label: "Sceny i bloki" },
    { id: "ending" as const, label: "Zakończenie" },
    { id: "appearance" as const, label: "Wygląd" },
  ];

  return (
    <div className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(250,250,249,0.98))] p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            TRYB REPORTAZ
          </div>
          <h3 className="mt-2 text-xl font-black text-foreground">Narracja reportazowa</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Budujesz immersyjny material z bohaterami, miejscami, scenami, cytatami i zakonczeniem narracyjnym.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background px-3 py-2 text-right">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Ton reportazu</p>
          <p className="text-sm font-semibold text-foreground">{report.tone}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              tab === item.id ? "border-border bg-background text-primary shadow-sm" : "border-transparent bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "intro" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Intro reportazu</Label>
            <Textarea value={report.intro ?? ""} onChange={(e) => updateReport({ intro: e.target.value })} className="min-h-[140px] resize-none text-sm" />
            <Label className="mb-1.5 mt-4 block text-xs">Glowny bohater</Label>
            <Input value={report.mainHero ?? ""} onChange={(e) => updateReport({ mainHero: e.target.value })} className="h-9 text-sm" />
            <Label className="mb-1.5 mt-4 block text-xs">Motyw przewodni</Label>
            <Input value={report.theme ?? ""} onChange={(e) => updateReport({ theme: e.target.value })} className="h-9 text-sm" />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Lokalizacja / miejsce</Label>
            <Input value={report.places[0]?.name ?? ""} onChange={(e) => updatePlace(0, { name: e.target.value })} className="h-9 text-sm" />
            <Label className="mb-1.5 mt-4 block text-xs">Data / okres wydarzen</Label>
            <Input value={report.eventPeriod ?? ""} onChange={(e) => updateReport({ eventPeriod: e.target.value })} className="h-9 text-sm" />
            <Label className="mb-1.5 mt-4 block text-xs">Ton reportazu</Label>
            <select value={report.tone} onChange={(e) => updateReport({ tone: e.target.value as ArticleReportDraft["tone"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="spokojny">Spokojny</option>
              <option value="emocjonalny">Emocjonalny</option>
              <option value="surowy">Surowy</option>
              <option value="lokalny">Lokalny</option>
              <option value="immersyjny">Immersyjny</option>
            </select>
            <Label className="mb-1.5 mt-4 block text-xs">Co warto wiedziec</Label>
            <Textarea value={report.whatToKnow ?? ""} onChange={(e) => updateReport({ whatToKnow: e.target.value })} className="min-h-[110px] resize-none text-sm" />
          </div>
        </div>
      )}

      {tab === "characters" && (
        <div className="mt-4 space-y-3">
          {report.characters.map((character, index) => (
            <div key={character.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={character.name} onChange={(e) => updateCharacter(index, { name: e.target.value })} className="h-9 text-sm" placeholder="Imie i nazwisko" />
                <Input value={character.role ?? ""} onChange={(e) => updateCharacter(index, { role: e.target.value })} className="h-9 text-sm" placeholder="Rola w historii" />
                <Input value={character.imageUrl ?? ""} onChange={(e) => updateCharacter(index, { imageUrl: e.target.value })} className="h-9 text-sm md:col-span-2" placeholder="URL zdjecia" />
                <Textarea value={character.bio ?? ""} onChange={(e) => updateCharacter(index, { bio: e.target.value })} className="min-h-[100px] resize-none text-sm md:col-span-2" placeholder="Krotki bio opis" />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => updateReport({ characters: [...report.characters, createDefaultReportCharacter("Nowy bohater")] })} className="w-full justify-center">
            <Plus className="mr-1.5 h-4 w-4" />
            Dodaj bohatera
          </Button>
        </div>
      )}

      {tab === "places" && (
        <div className="mt-4 space-y-3">
          {report.places.map((place, index) => (
            <div key={place.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="grid gap-3">
                <Input value={place.name} onChange={(e) => updatePlace(index, { name: e.target.value })} className="h-9 text-sm" placeholder="Nazwa miejsca" />
                <Input value={place.imageUrl ?? ""} onChange={(e) => updatePlace(index, { imageUrl: e.target.value })} className="h-9 text-sm" placeholder="URL zdjecia miejsca" />
                <Textarea value={place.description ?? ""} onChange={(e) => updatePlace(index, { description: e.target.value })} className="min-h-[90px] resize-none text-sm" placeholder="Opis miejsca" />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => updateReport({ places: [...report.places, createDefaultReportPlace("Nowe miejsce")] })} className="w-full justify-center">
            <Plus className="mr-1.5 h-4 w-4" />
            Dodaj miejsce
          </Button>
        </div>
      )}

      {tab === "blocks" && (
        <div className="mt-4 space-y-3">
          {report.blocks.map((block, index) => (
            <div key={block.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                <select value={block.type} onChange={(e) => updateBlock(index, { type: e.target.value as ReportBlockDraft["type"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="scene">Scena</option>
                  <option value="place_description">Opis miejsca</option>
                  <option value="hero_quote">Cytat bohatera</option>
                  <option value="reporter_note">Notatka reportera</option>
                  <option value="turning_point">Punkt zwrotny</option>
                  <option value="timeline">Os czasu</option>
                  <option value="context_box">Ramka kontekstowa</option>
                  <option value="gallery">Galeria zdjec</option>
                </select>
                <Input value={block.title ?? ""} onChange={(e) => updateBlock(index, { title: e.target.value })} className="h-9 text-sm" placeholder="Tytul bloku" />
              </div>
              <Textarea value={block.content} onChange={(e) => updateBlock(index, { content: e.target.value })} className="mt-3 min-h-[110px] resize-none text-sm" placeholder="Tresc bloku reportazowego" />
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Input value={block.imageUrl ?? ""} onChange={(e) => updateBlock(index, { imageUrl: e.target.value })} className="h-9 text-sm" placeholder="URL grafiki / galerii" />
                <Input value={block.extra ?? ""} onChange={(e) => updateBlock(index, { extra: e.target.value })} className="h-9 text-sm" placeholder="Dodatkowe dane / podpis / os czasu" />
              </div>
            </div>
          ))}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["scene", "Dodaj scene"],
              ["hero_quote", "Dodaj cytat"],
              ["turning_point", "Dodaj punkt zwrotny"],
              ["gallery", "Dodaj galerie"],
            ].map(([type, label]) => (
              <Button key={type} type="button" variant="outline" onClick={() => updateReport({ blocks: [...report.blocks, createDefaultReportBlock(type as ReportBlockDraft["type"], "Nowa tresc reportazowa")] })} className="justify-center">
                <Plus className="mr-1.5 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {tab === "ending" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Zakonczenie narracyjne</Label>
            <Textarea value={report.ending ?? ""} onChange={(e) => updateReport({ ending: e.target.value })} className="min-h-[160px] resize-none text-sm" />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="mb-3 text-sm font-black text-foreground">Zrodla / materialy</p>
            <div className="space-y-2">
              {report.materials.map((item, index) => (
                <Input key={`${item}-${index}`} value={item} onChange={(e) => updateReport({ materials: report.materials.map((source, sourceIndex) => sourceIndex === index ? e.target.value : source) })} className="h-9 text-sm" />
              ))}
            </div>
            <Button type="button" variant="outline" onClick={() => updateReport({ materials: [...report.materials, "Nowy material"] })} className="mt-3 w-full justify-center">
              <Plus className="mr-1.5 h-4 w-4" />
              Dodaj material
            </Button>
          </div>
        </div>
      )}

      {tab === "appearance" && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <Label className="mb-1.5 block text-xs">Styl reportazu</Label>
          <select value={report.styleVariant} onChange={(e) => updateReport({ styleVariant: e.target.value as ArticleReportDraft["styleVariant"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="classic">Klasyczny reportaz</option>
            <option value="magazine">Premium magazynowy</option>
            <option value="field">Terenowy / lokalny</option>
            <option value="human">Human story</option>
            <option value="visual">Mocno wizualny</option>
          </select>
        </div>
      )}
    </div>
  );
}

export function OpinionEditor({
  opinion,
  onChange,
}: {
  opinion: ArticleOpinionDraft;
  onChange: (next: ArticleOpinionDraft) => void;
}) {
  const [tab, setTab] = useState<"thesis" | "arguments" | "author" | "summary" | "appearance">("thesis");
  const updateOpinion = (patch: Partial<ArticleOpinionDraft>) => onChange({ ...opinion, ...patch });
  const updateBlock = (index: number, patch: Partial<OpinionBlockDraft>) => updateOpinion({
    blocks: opinion.blocks.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
  });

  return (
    <div className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.98))] p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            TRYB OPINIA
          </div>
          <h3 className="mt-2 text-xl font-black text-foreground">Komentarz autorski</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Budujesz tekst stanowiskowy z teza, argumentacja, polemika i mocna puenta autora.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background px-3 py-2 text-right">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Styl</p>
          <p className="text-sm font-semibold text-foreground">{opinion.styleVariant}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ["thesis", "Teza i stanowisko"],
          ["arguments", "Argumentacja"],
          ["author", "Autor i nota"],
          ["summary", "Puenta i polemika"],
          ["appearance", "Wyglad"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id as typeof tab)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              tab === id ? "border-border bg-background text-primary shadow-sm" : "border-transparent bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "thesis" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Teza opinii</Label>
            <Textarea value={opinion.thesis ?? ""} onChange={(e) => updateOpinion({ thesis: e.target.value })} className="min-h-[110px] resize-none text-sm" />
            <Label className="mb-1.5 mt-4 block text-xs">Stanowisko autora</Label>
            <Textarea value={opinion.position ?? ""} onChange={(e) => updateOpinion({ position: e.target.value })} className="min-h-[130px] resize-none text-sm" />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Cytat przewodni</Label>
            <Textarea value={opinion.leadQuote ?? ""} onChange={(e) => updateOpinion({ leadQuote: e.target.value })} className="min-h-[110px] resize-none text-sm" />
            <Label className="mb-1.5 mt-4 block text-xs">Polemika / kontrpunkt</Label>
            <Textarea value={opinion.counterpoint ?? ""} onChange={(e) => updateOpinion({ counterpoint: e.target.value })} className="min-h-[130px] resize-none text-sm" />
          </div>
        </div>
      )}

      {tab === "arguments" && (
        <div className="mt-4 space-y-3">
          {opinion.arguments.map((item, index) => (
            <Input key={`${item}-${index}`} value={item} onChange={(e) => updateOpinion({ arguments: opinion.arguments.map((arg, argIndex) => argIndex === index ? e.target.value : arg) })} className="h-9 text-sm" />
          ))}
          <Button type="button" variant="outline" onClick={() => updateOpinion({ arguments: [...opinion.arguments, "Nowy argument"] })} className="w-full justify-center">
            <Plus className="mr-1.5 h-4 w-4" />
            Dodaj argument
          </Button>
          <div className="space-y-3 pt-2">
            {opinion.blocks.map((block, index) => (
              <div key={block.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                  <select value={block.type} onChange={(e) => updateBlock(index, { type: e.target.value as OpinionBlockDraft["type"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="argument">Argument</option>
                    <option value="counterpoint">Kontrpunkt</option>
                    <option value="lead_quote">Cytat przewodni</option>
                    <option value="author_note">Nota autora</option>
                    <option value="summary">Podsumowanie</option>
                  </select>
                  <Input value={block.title ?? ""} onChange={(e) => updateBlock(index, { title: e.target.value })} className="h-9 text-sm" placeholder="Naglowek bloku" />
                </div>
                <Textarea value={block.content} onChange={(e) => updateBlock(index, { content: e.target.value })} className="mt-3 min-h-[100px] resize-none text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "author" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Nota autora</Label>
            <Textarea value={opinion.authorNote ?? ""} onChange={(e) => updateOpinion({ authorNote: e.target.value })} className="min-h-[130px] resize-none text-sm" />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Bio autora</Label>
            <Textarea value={opinion.authorBio ?? ""} onChange={(e) => updateOpinion({ authorBio: e.target.value })} className="min-h-[130px] resize-none text-sm" />
          </div>
        </div>
      )}

      {tab === "summary" && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <Label className="mb-1.5 block text-xs">Koncowa puenta</Label>
          <Textarea value={opinion.closingPoint ?? ""} onChange={(e) => updateOpinion({ closingPoint: e.target.value })} className="min-h-[140px] resize-none text-sm" />
        </div>
      )}

      {tab === "appearance" && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <Label className="mb-1.5 block text-xs">Styl opinii</Label>
          <select value={opinion.styleVariant} onChange={(e) => updateOpinion({ styleVariant: e.target.value as ArticleOpinionDraft["styleVariant"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="classic">Klasyczna opinia</option>
            <option value="premium">Premium komentarz</option>
            <option value="polemics">Polemika</option>
            <option value="column">Felietonowa</option>
            <option value="news">News opinion</option>
          </select>
        </div>
      )}
    </div>
  );
}

export function DialogEditor({
  dialog,
  onChange,
}: {
  dialog: ArticleDialogDraft;
  onChange: (next: ArticleDialogDraft) => void;
}) {
  const [tab, setTab] = useState<"intro" | "participants" | "conversation" | "ending">("intro");
  const updateDialog = (patch: Partial<ArticleDialogDraft>) => onChange({ ...dialog, ...patch });
  const updateParticipant = (index: number, patch: Partial<DialogParticipantDraft>) => updateDialog({
    participants: dialog.participants.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
  });
  const updateBlock = (index: number, patch: Partial<DialogBlockDraft>) => updateDialog({
    blocks: dialog.blocks.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
  });

  return (
    <div className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.98))] p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            TRYB DIALOG
          </div>
          <h3 className="mt-2 text-xl font-black text-foreground">Uklad rozmowy</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Swobodna rozmowa z uczestnikami, komentarzami redakcyjnymi i logicznym przeplywem wypowiedzi.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ["intro", "Wprowadzenie"],
          ["participants", "Uczestnicy"],
          ["conversation", "Tresc dialogu"],
          ["ending", "Zakonczenie"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id as typeof tab)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              tab === id ? "border-border bg-background text-primary shadow-sm" : "border-transparent bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "intro" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Opis dialogu</Label>
            <Textarea value={dialog.description ?? ""} onChange={(e) => updateDialog({ description: e.target.value })} className="min-h-[120px] resize-none text-sm" />
            <Label className="mb-1.5 mt-4 block text-xs">Kontekst rozmowy</Label>
            <Textarea value={dialog.context ?? ""} onChange={(e) => updateDialog({ context: e.target.value })} className="min-h-[120px] resize-none text-sm" />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <Label className="mb-1.5 block text-xs">Styl rozmowy</Label>
            <select value={dialog.conversationStyle} onChange={(e) => updateDialog({ conversationStyle: e.target.value as ArticleDialogDraft["conversationStyle"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="swobodny">Swobodny</option>
              <option value="dynamiczny">Dynamiczny</option>
              <option value="formalny">Formalny</option>
              <option value="emocjonalny">Emocjonalny</option>
              <option value="miejski">Miejski</option>
            </select>
            <Label className="mb-1.5 mt-4 block text-xs">Miejsce / okolicznosci</Label>
            <Input value={dialog.place ?? ""} onChange={(e) => updateDialog({ place: e.target.value })} className="h-9 text-sm" />
          </div>
        </div>
      )}

      {tab === "participants" && (
        <div className="mt-4 space-y-3">
          {dialog.participants.map((participant, index) => (
            <div key={participant.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Input value={participant.name} onChange={(e) => updateParticipant(index, { name: e.target.value })} className="h-9 text-sm" placeholder="Nazwa uczestnika" />
                <Input value={participant.role ?? ""} onChange={(e) => updateParticipant(index, { role: e.target.value })} className="h-9 text-sm" placeholder="Rola / opis" />
                <Input value={participant.color ?? ""} onChange={(e) => updateParticipant(index, { color: e.target.value })} className="h-9 text-sm" placeholder="#kolor" />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => updateDialog({ participants: [...dialog.participants, createDefaultDialogParticipant(`Uczestnik ${String.fromCharCode(65 + dialog.participants.length)}`, { color: "#7c3aed" })] })} className="w-full justify-center">
            <Plus className="mr-1.5 h-4 w-4" />
            Dodaj uczestnika
          </Button>
        </div>
      )}

      {tab === "conversation" && (
        <div className="mt-4 space-y-3">
          {dialog.blocks.map((block, index) => (
            <div key={block.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="grid gap-3 md:grid-cols-[180px_180px_1fr]">
                <select value={block.type} onChange={(e) => updateBlock(index, { type: e.target.value as DialogBlockDraft["type"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="speaker_a">Wypowiedz A</option>
                  <option value="speaker_b">Wypowiedz B</option>
                  <option value="speaker_c">Wypowiedz C</option>
                  <option value="narrator">Komentarz narratora</option>
                  <option value="highlight_quote">Cytat wyrozniony</option>
                  <option value="editor_note">Notatka redakcyjna</option>
                </select>
                <select value={block.speakerId ?? ""} onChange={(e) => updateBlock(index, { speakerId: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Bez przypisania</option>
                  {dialog.participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>{participant.name}</option>
                  ))}
                </select>
                <Input value={block.title ?? ""} onChange={(e) => updateBlock(index, { title: e.target.value })} className="h-9 text-sm" placeholder="Naglowek" />
              </div>
              <Textarea value={block.content} onChange={(e) => updateBlock(index, { content: e.target.value })} className="mt-3 min-h-[100px] resize-none text-sm" />
            </div>
          ))}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["speaker_a", "Dodaj wypowiedz A"],
              ["speaker_b", "Dodaj wypowiedz B"],
              ["narrator", "Dodaj komentarz"],
              ["highlight_quote", "Dodaj cytat"],
              ["editor_note", "Dodaj note"],
            ].map(([type, label]) => (
              <Button key={type} type="button" variant="outline" onClick={() => updateDialog({ blocks: [...dialog.blocks, createDefaultDialogBlock(type as DialogBlockDraft["type"], "Nowa tresc dialogu")] })} className="justify-center">
                <Plus className="mr-1.5 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {tab === "ending" && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <Label className="mb-1.5 block text-xs">Zakonczenie</Label>
          <Textarea value={dialog.ending ?? ""} onChange={(e) => updateDialog({ ending: e.target.value })} className="min-h-[140px] resize-none text-sm" />
        </div>
      )}
    </div>
  );
}

export function AnnouncementEditor({
  announcement,
  onChange,
}: {
  announcement: ArticleAnnouncementDraft;
  onChange: (next: ArticleAnnouncementDraft) => void;
}) {
  const updateAnnouncement = (patch: Partial<ArticleAnnouncementDraft>) => onChange({ ...announcement, ...patch });

  return (
    <div className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.98))] p-4 shadow-sm">
      <div className="border-b border-border pb-4">
        <div className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          TRYB KOMUNIKAT
        </div>
        <h3 className="mt-2 text-xl font-black text-foreground">Uklad komunikatu</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Krotki, oficjalny lub wazny komunikat z priorytetem, data obowiazywania, zrodlem i CTA.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-4">
          <Label className="mb-1.5 block text-xs">Typ komunikatu</Label>
          <Input value={announcement.noticeType ?? ""} onChange={(e) => updateAnnouncement({ noticeType: e.target.value })} className="h-9 text-sm" />
          <Label className="mb-1.5 mt-4 block text-xs">Poziom waznosci</Label>
          <select value={announcement.priority} onChange={(e) => updateAnnouncement({ priority: e.target.value as ArticleAnnouncementDraft["priority"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="niski">Niski</option>
            <option value="standard">Standard</option>
            <option value="wazny">Wazny</option>
            <option value="pilny">Pilny</option>
          </select>
          <Label className="mb-1.5 mt-4 block text-xs">Data obowiazywania</Label>
          <Input value={announcement.validUntil ?? ""} onChange={(e) => updateAnnouncement({ validUntil: e.target.value })} className="h-9 text-sm" placeholder="np. do 20 marca 2026" />
          <Label className="mb-1.5 mt-4 block text-xs">Instytucja / zrodlo</Label>
          <Input value={announcement.institution ?? ""} onChange={(e) => updateAnnouncement({ institution: e.target.value })} className="h-9 text-sm" />
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          <Label className="mb-1.5 block text-xs">Status komunikatu</Label>
          <select value={announcement.noticeStatus} onChange={(e) => updateAnnouncement({ noticeStatus: e.target.value as ArticleAnnouncementDraft["noticeStatus"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="aktywny">Aktywny</option>
            <option value="obowiazujacy">Obowiazujacy</option>
            <option value="zakonczony">Zakonczony</option>
            <option value="archiwalny">Archiwalny</option>
          </select>
          <Label className="mb-1.5 mt-4 block text-xs">CTA / etykieta linku</Label>
          <Input value={announcement.ctaLabel ?? ""} onChange={(e) => updateAnnouncement({ ctaLabel: e.target.value })} className="h-9 text-sm" />
          <Label className="mb-1.5 mt-4 block text-xs">CTA / URL</Label>
          <Input value={announcement.ctaUrl ?? ""} onChange={(e) => updateAnnouncement({ ctaUrl: e.target.value })} className="h-9 text-sm" />
          <Label className="mb-1.5 mt-4 block text-xs">Co trzeba wiedziec</Label>
          <Textarea value={announcement.mustKnow ?? ""} onChange={(e) => updateAnnouncement({ mustKnow: e.target.value })} className="min-h-[110px] resize-none text-sm" />
          <Label className="mb-1.5 mt-4 block text-xs">Styl komunikatu</Label>
          <select value={announcement.styleVariant} onChange={(e) => updateAnnouncement({ styleVariant: e.target.value as ArticleAnnouncementDraft["styleVariant"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="neutral">Neutralny</option>
            <option value="alert">Pilny / alert</option>
            <option value="official">Oficjalny</option>
            <option value="info">Informacyjny</option>
            <option value="local">Lokalny komunikat</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export function SponsoredEditor({
  sponsored,
  onChange,
}: {
  sponsored: ArticleSponsoredDraft;
  onChange: (next: ArticleSponsoredDraft) => void;
}) {
  const updateSponsored = (patch: Partial<ArticleSponsoredDraft>) => onChange({ ...sponsored, ...patch });

  return (
    <div className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.98))] p-4 shadow-sm">
      <div className="border-b border-border pb-4">
        <div className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          TRYB SPONSOROWANY
        </div>
        <h3 className="mt-2 text-xl font-black text-foreground">Material partnerski</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Konfiguracja brandingu partnera, disclaimera, CTA i boxu sponsora dla branded content.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-4">
          <Label className="mb-1.5 block text-xs">Etykieta sponsorowana</Label>
          <Input value={sponsored.sponsorLabel ?? ""} onChange={(e) => updateSponsored({ sponsorLabel: e.target.value })} className="h-9 text-sm" />
          <Label className="mb-1.5 mt-4 block text-xs">Nazwa partnera</Label>
          <Input value={sponsored.partnerName ?? ""} onChange={(e) => updateSponsored({ partnerName: e.target.value })} className="h-9 text-sm" />
          <Label className="mb-1.5 mt-4 block text-xs">Logo partnera</Label>
          <Input value={sponsored.partnerLogo ?? ""} onChange={(e) => updateSponsored({ partnerLogo: e.target.value })} className="h-9 text-sm" />
          <Label className="mb-1.5 mt-4 block text-xs">Link partnera</Label>
          <Input value={sponsored.partnerUrl ?? ""} onChange={(e) => updateSponsored({ partnerUrl: e.target.value })} className="h-9 text-sm" />
          <Label className="mb-1.5 mt-4 block text-xs">Opis partnera</Label>
          <Textarea value={sponsored.partnerDescription ?? ""} onChange={(e) => updateSponsored({ partnerDescription: e.target.value })} className="min-h-[110px] resize-none text-sm" />
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          <Label className="mb-1.5 block text-xs">CTA partnera</Label>
          <Input value={sponsored.partnerCtaLabel ?? ""} onChange={(e) => updateSponsored({ partnerCtaLabel: e.target.value })} className="h-9 text-sm" placeholder="Etykieta przycisku" />
          <Label className="mb-1.5 mt-4 block text-xs">Link CTA</Label>
          <Input value={sponsored.partnerCtaUrl ?? ""} onChange={(e) => updateSponsored({ partnerCtaUrl: e.target.value })} className="h-9 text-sm" />
          <Label className="mb-1.5 mt-4 block text-xs">Tytul boxu sponsora</Label>
          <Input value={sponsored.sponsorBoxTitle ?? ""} onChange={(e) => updateSponsored({ sponsorBoxTitle: e.target.value })} className="h-9 text-sm" />
          <Label className="mb-1.5 mt-4 block text-xs">Disclaimer / wspolpraca</Label>
          <Textarea value={sponsored.sponsorDisclaimer ?? ""} onChange={(e) => updateSponsored({ sponsorDisclaimer: e.target.value })} className="min-h-[90px] resize-none text-sm" />
          <Label className="mb-1.5 mt-4 block text-xs">Sekcja kontakt / oferta</Label>
          <Textarea value={sponsored.contactOffer ?? ""} onChange={(e) => updateSponsored({ contactOffer: e.target.value })} className="min-h-[90px] resize-none text-sm" />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs">Umiejscowienie sekcji sponsora</Label>
              <select value={sponsored.sectionPlacement} onChange={(e) => updateSponsored({ sectionPlacement: e.target.value as ArticleSponsoredDraft["sectionPlacement"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="start">Na poczatku</option>
                <option value="end">Na koncu</option>
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Styl materialu</Label>
              <select value={sponsored.styleVariant} onChange={(e) => updateSponsored({ styleVariant: e.target.value as ArticleSponsoredDraft["styleVariant"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="classic">Partnerski klasyczny</option>
                <option value="premium">Premium branded</option>
                <option value="lifestyle">Lifestyle sponsorowany</option>
                <option value="business">Biznes sponsorowany</option>
                <option value="magazine">Magazynowy branded</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
