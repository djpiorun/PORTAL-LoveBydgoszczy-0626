import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";

type QuizAnswer = {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  color?: string;
  isCorrect?: boolean;
  points?: number;
  resultKey?: string;
};

type QuizQuestion = {
  id: string;
  question: string;
  description?: string;
  imageUrl?: string;
  answerType: "single" | "multiple" | "image" | "yes_no" | "choices";
  maxSelections?: number;
  answers: QuizAnswer[];
};

type QuizResult = {
  id: string;
  key: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  minScore?: number;
  maxScore?: number;
  minPercent?: number;
  maxPercent?: number;
};

type ArticleQuizConfig = {
  enabled: boolean;
  quizId: string;
  status: "active" | "draft" | "hidden" | "template" | "archived" | "preview";
  type: "single" | "multiple" | "image" | "personality" | "scored" | "yes_no" | "choices";
  title: string;
  description?: string;
  badgeLabel?: string;
  subtitle?: string;
  intro?: string;
  startButtonLabel?: string;
  showQuestionNumbers: boolean;
  showProgress: boolean;
  showQuestionCount: boolean;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  allowBack: boolean;
  singlePage: boolean;
  autoAdvance: boolean;
  showResultImmediately: boolean;
  questions: QuizQuestion[];
  results: QuizResult[];
  styleVariant: "lifestyle" | "editorial" | "magazine" | "news" | "soft" | "urban";
  answerCardStyle: "soft" | "outline" | "solid" | "glass";
  width: "narrow" | "container" | "full";
  layout: "column" | "grid" | "two_column" | "full_width";
  borderRadius?: number;
  shadow: boolean;
  accentColor?: string;
  buttonColor?: string;
  backgroundColor?: string;
  progressStyle: "line" | "steps" | "minimal";
  headerStyle: "classic" | "hero" | "split";
  resultStyle: "card" | "editorial" | "minimal";
  headerImageUrl?: string;
  headerGradient?: string;
  showCoverImage: boolean;
  showBadge: boolean;
  isPublic: boolean;
  adminPreview: boolean;
};

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }
  return next;
}

function normalizeQuestions(quiz: ArticleQuizConfig) {
  const questions = quiz.randomizeQuestions ? shuffle(quiz.questions) : quiz.questions;
  return questions.map((question) => ({
    ...question,
    answers: quiz.randomizeAnswers ? shuffle(question.answers) : question.answers,
  }));
}

function getKnowledgeFallback(percent: number) {
  if (percent <= 20) return { title: "Spróbuj jeszcze raz", description: "To dopiero rozgrzewka. Wróć do pytań i sprawdź się ponownie." };
  if (percent <= 50) return { title: "Nieźle", description: "Masz podstawy, ale jeszcze trochę i będziesz ekspertem." };
  if (percent <= 80) return { title: "Masz wyczucie", description: "Widać, że dobrze czujesz temat i potrafisz wybierać trafnie." };
  return { title: "Mistrz quizu", description: "Świetny wynik. Ten temat masz opanowany bardzo dobrze." };
}

export default function ArticleQuiz({
  article,
  quiz,
}: {
  article: any;
  quiz: ArticleQuizConfig;
}) {
  const preparedQuestions = useMemo(() => normalizeQuestions(quiz), [quiz]);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    setStarted(false);
    setCurrentIndex(0);
    setResponses({});
    setResult(null);
  }, [quiz.quizId]);

  const widthClass = quiz.width === "narrow" ? "max-w-3xl" : quiz.width === "full" ? "max-w-none" : "max-w-5xl";
  const layoutClass = quiz.layout === "grid" ? "grid md:grid-cols-2" : quiz.layout === "two_column" ? "grid md:grid-cols-2" : "grid grid-cols-1";
  const accent = quiz.accentColor || "#f97316";
  const buttonColor = quiz.buttonColor || accent;
  const radius = quiz.borderRadius ?? 28;
  const containerClass = {
    lifestyle: "border-orange-200 bg-[linear-gradient(180deg,rgba(255,251,235,1),rgba(255,255,255,1))]",
    editorial: "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.98))]",
    magazine: "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,1),rgba(255,255,255,1))]",
    news: "border-blue-200 bg-[linear-gradient(180deg,rgba(239,246,255,0.7),rgba(255,255,255,1))]",
    soft: "border-pink-200 bg-[linear-gradient(180deg,rgba(253,242,248,1),rgba(255,255,255,1))]",
    urban: "border-zinc-200 bg-[linear-gradient(180deg,rgba(250,250,250,1),rgba(244,244,245,0.95))]",
  }[quiz.styleVariant];
  const answerClass = {
    soft: "border-transparent bg-white/80 hover:bg-white dark:bg-slate-900/62 dark:hover:bg-slate-900/82",
    outline: "border-border bg-transparent hover:border-primary/40 dark:border-slate-700/70",
    solid: "border-transparent bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800/90",
    glass: "border-white/30 bg-white/60 backdrop-blur dark:border-white/10 dark:bg-slate-900/56",
  }[quiz.answerCardStyle];

  const questionCount = preparedQuestions.length;
  const answeredCount = Object.values(responses).filter((value) => value.length > 0).length;
  const progress = questionCount === 0 ? 0 : Math.round((Math.min(currentIndex + (started ? 1 : 0), questionCount) / questionCount) * 100);

  const resolveResult = () => {
    const selectedAnswers = preparedQuestions.flatMap((question) => {
      const selected = responses[question.id] ?? [];
      return question.answers.filter((answer) => selected.includes(answer.id));
    });

    if (quiz.type === "personality" || (quiz.type === "image" && selectedAnswers.some((answer) => answer.resultKey))) {
      const counts = new Map<string, number>();
      selectedAnswers.forEach((answer) => {
        if (!answer.resultKey) return;
        counts.set(answer.resultKey, (counts.get(answer.resultKey) ?? 0) + 1);
      });
      const winningKey = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      const matched = quiz.results.find((item) => item.key === winningKey) ?? quiz.results[0];
      return { mode: "personality", matched };
    }

    if (quiz.type === "scored") {
      const totalPoints = selectedAnswers.reduce((sum, answer) => sum + (answer.points ?? 0), 0);
      const matched = quiz.results.find((item) => {
        const min = item.minScore ?? Number.NEGATIVE_INFINITY;
        const max = item.maxScore ?? Number.POSITIVE_INFINITY;
        return totalPoints >= min && totalPoints <= max;
      }) ?? quiz.results[0];
      return { mode: "scored", matched, totalPoints };
    }

    let correctCount = 0;
    preparedQuestions.forEach((question) => {
      const correctIds = question.answers.filter((answer) => answer.isCorrect).map((answer) => answer.id).sort();
      const selectedIds = [...(responses[question.id] ?? [])].sort();
      if (correctIds.length > 0 && correctIds.length === selectedIds.length && correctIds.every((id, index) => selectedIds[index] === id)) {
        correctCount += 1;
      }
    });
    const percent = questionCount === 0 ? 0 : Math.round((correctCount / questionCount) * 100);
    const matched = quiz.results.find((item) => {
      const min = item.minPercent ?? Number.NEGATIVE_INFINITY;
      const max = item.maxPercent ?? Number.POSITIVE_INFINITY;
      return percent >= min && percent <= max;
    });
    return {
      mode: "knowledge",
      correctCount,
      percent,
      matched: matched ?? {
        id: "fallback",
        key: "fallback",
        ...getKnowledgeFallback(percent),
      },
    };
  };

  const finishQuiz = () => {
    setResult(resolveResult());
  };

  const setAnswer = (question: QuizQuestion, answerId: string) => {
    setResponses((current) => {
      const currentAnswers = current[question.id] ?? [];
      const singleChoice = question.answerType === "single" || question.answerType === "image" || question.answerType === "yes_no" || question.answerType === "choices";
      if (singleChoice) {
        return { ...current, [question.id]: [answerId] };
      }

      const maxSelections = question.maxSelections ?? 2;
      const nextAnswers = currentAnswers.includes(answerId)
        ? currentAnswers.filter((item) => item !== answerId)
        : currentAnswers.length >= maxSelections
          ? currentAnswers
          : [...currentAnswers, answerId];
      return { ...current, [question.id]: nextAnswers };
    });
  };

  useEffect(() => {
    if (!started || quiz.singlePage || !quiz.autoAdvance || result) return;
    const question = preparedQuestions[currentIndex];
    if (!question) return;
    const selectionCount = responses[question.id]?.length ?? 0;
    const singleChoice = question.answerType === "single" || question.answerType === "image" || question.answerType === "yes_no" || question.answerType === "choices";
    if (singleChoice && selectionCount > 0) {
      const timer = window.setTimeout(() => {
        if (currentIndex === preparedQuestions.length - 1) {
          finishQuiz();
        } else {
          setCurrentIndex((index) => Math.min(index + 1, preparedQuestions.length - 1));
        }
      }, 220);
      return () => window.clearTimeout(timer);
    }
  }, [responses, started, quiz.singlePage, quiz.autoAdvance, currentIndex, preparedQuestions, result]);

  const renderAnswer = (question: QuizQuestion, answer: QuizAnswer) => {
    const selected = (responses[question.id] ?? []).includes(answer.id);
    const imageCard = question.answerType === "image" || quiz.type === "image";
    const choiceCard = question.answerType === "choices" || quiz.type === "choices";
    const yesNoCard = question.answerType === "yes_no" || quiz.type === "yes_no";

    return (
      <button
        key={answer.id}
        type="button"
        onClick={() => setAnswer(question, answer.id)}
        className={`w-full rounded-[20px] border text-left transition-all ${selected ? "border-transparent text-white shadow-md" : answerClass} ${imageCard || choiceCard || yesNoCard ? "p-3.5" : "px-3.5 py-3"}`}
        style={selected ? { backgroundColor: answer.color || accent } : undefined}
      >
        {imageCard && answer.imageUrl && (
          <img src={answer.imageUrl} alt="" className="mb-3 h-40 w-full rounded-[16px] object-cover" />
        )}
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-black ${selected ? "border-white bg-white/20" : "border-border bg-white text-muted-foreground"}`}>
            {selected ? "✓" : question.answerType === "multiple" ? "+" : ""}
          </span>
          <div className="flex-1">
            <p className={`font-semibold ${imageCard || choiceCard || yesNoCard ? "text-base" : "text-sm"}`}>
              {answer.icon ? `${answer.icon} ` : ""}{answer.label}
            </p>
            {answer.description && (
              <p className={`mt-1 text-xs ${selected ? "text-white/85" : "text-muted-foreground"}`}>
                {answer.description}
              </p>
            )}
          </div>
        </div>
      </button>
    );
  };

  const renderQuestion = (question: QuizQuestion, index: number) => (
    <div key={question.id} className="rounded-[24px] border border-border bg-white/90 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {quiz.showQuestionNumbers && (
          <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            Pytanie {index + 1}
          </span>
        )}
        {quiz.showQuestionCount && (
          <span className="text-xs text-muted-foreground">{index + 1} / {questionCount}</span>
        )}
      </div>
      <h3 className="text-2xl font-black leading-tight text-foreground">{question.question}</h3>
      {question.description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{question.description}</p>}
      {question.imageUrl && <img src={question.imageUrl} alt="" className="mt-4 h-56 w-full rounded-[22px] object-cover" />}
      <div className={`mt-5 gap-3 ${question.answerType === "image" || quiz.type === "image" || quiz.layout === "grid" || quiz.layout === "two_column" ? "grid md:grid-cols-2" : layoutClass}`}>
        {question.answers.map((answer) => renderAnswer(question, answer))}
      </div>
    </div>
  );

  const currentQuestion = preparedQuestions[currentIndex];

  return (
    <section className={`my-8 ${widthClass}`}>
      <div
        className={`overflow-hidden border ${containerClass} ${quiz.shadow ? "shadow-2xl shadow-slate-200/40" : ""}`}
        style={{ borderRadius: `${radius}px`, backgroundColor: quiz.backgroundColor || undefined }}
      >
        <div
          className={`relative overflow-hidden px-5 py-6 sm:px-6 ${quiz.headerStyle === "split" ? "lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch lg:gap-6" : ""}`}
          style={{ background: quiz.headerGradient || undefined }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl ${
              quiz.styleVariant === "soft" ? "bg-pink-300/25" :
              quiz.styleVariant === "urban" ? "bg-zinc-400/15" :
              quiz.styleVariant === "news" ? "bg-blue-300/20" :
              quiz.styleVariant === "magazine" ? "bg-rose-300/25" :
              quiz.styleVariant === "editorial" ? "bg-slate-300/15" :
              "bg-orange-300/25"
            }`} />
          </div>
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0" />
              {quiz.showBadge && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-foreground shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  {quiz.badgeLabel || "QUIZ"}
                </span>
              )}
            </div>
            {quiz.subtitle && <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{quiz.subtitle}</p>}
            <h2 className="mt-2 text-3xl font-black leading-tight text-foreground sm:text-4xl">{quiz.title || article.title}</h2>
            {quiz.description && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/80">{quiz.description}</p>}
            {!started && !result && (
              <div className="mx-auto mt-5 max-w-2xl rounded-[28px] border border-white/75 bg-white/82 p-4 text-center shadow-sm backdrop-blur sm:p-5">
                <p className="text-sm leading-relaxed text-foreground/80">{quiz.intro}</p>
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white shadow-sm"
                  style={{ backgroundColor: buttonColor }}
                >
                  <HelpCircle className="h-4 w-4" />
                  {quiz.startButtonLabel || "Rozpocznij quiz"}
                </button>
              </div>
            )}
          </div>
          {quiz.showCoverImage && quiz.headerImageUrl && (
            <div className={`relative mt-6 min-h-[220px] overflow-hidden rounded-[24px] ${quiz.headerStyle === "split" ? "lg:mt-0" : ""}`}>
              <img src={quiz.headerImageUrl} alt={quiz.title || article.title} className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        {started && !result && (
          <div className="p-5 sm:p-6">
            {quiz.showProgress && (
              <div className="mb-5">
                {quiz.progressStyle === "steps" ? (
                  <div className="flex flex-wrap gap-2">
                    {preparedQuestions.map((question, index) => (
                      <span key={question.id} className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-black ${index <= currentIndex ? "text-white" : "bg-muted text-muted-foreground"}`} style={index <= currentIndex ? { backgroundColor: accent } : undefined}>
                        {index + 1}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className={`overflow-hidden rounded-full ${quiz.progressStyle === "minimal" ? "h-1.5" : "h-2.5"} bg-muted/40`}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: accent }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Postęp quizu</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {quiz.singlePage ? (
              <div className="space-y-4">
                {preparedQuestions.map((question, index) => renderQuestion(question, index))}
                <button
                  type="button"
                  onClick={finishQuiz}
                  disabled={answeredCount !== questionCount}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: buttonColor }}
                >
                  Zobacz wynik
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : currentQuestion ? (
              <>
                {renderQuestion(currentQuestion, currentIndex)}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
                    disabled={!quiz.allowBack || currentIndex === 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Wróć
                  </button>
                  <button
                    type="button"
                    onClick={() => currentIndex === preparedQuestions.length - 1 ? finishQuiz() : setCurrentIndex((index) => Math.min(index + 1, preparedQuestions.length - 1))}
                    disabled={(responses[currentQuestion.id] ?? []).length === 0}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: buttonColor }}
                  >
                    {currentIndex === preparedQuestions.length - 1 ? "Pokaż wynik" : "Dalej"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}

        {result && (
          <div className="p-5 sm:p-6">
            <div className={`rounded-[26px] border border-border bg-white/90 p-5 ${quiz.resultStyle === "editorial" ? "sm:p-6" : ""}`}>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Wynik quizu
              </span>
              <h3 className="mt-4 text-3xl font-black leading-tight text-foreground">{result.matched?.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">{result.matched?.description}</p>

              {result.mode === "knowledge" && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                    {result.correctCount}/{questionCount} poprawnych
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-sm font-bold text-foreground">
                    {result.percent}%
                  </span>
                </div>
              )}
              {result.mode === "scored" && (
                <div className="mt-4 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary inline-flex">
                  Wynik punktowy: {result.totalPoints}
                </div>
              )}

              {result.matched?.imageUrl && (
                <img src={result.matched.imageUrl} alt={result.matched.title} className="mt-5 h-56 w-full rounded-[22px] object-cover" />
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {result.matched?.ctaUrl && result.matched?.ctaLabel && (
                  <a
                    href={result.matched.ctaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-black text-white"
                    style={{ backgroundColor: buttonColor }}
                  >
                    {result.matched.ctaLabel}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setStarted(false);
                    setCurrentIndex(0);
                    setResponses({});
                    setResult(null);
                  }}
                  className="inline-flex items-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground"
                >
                  Rozwiąż jeszcze raz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
