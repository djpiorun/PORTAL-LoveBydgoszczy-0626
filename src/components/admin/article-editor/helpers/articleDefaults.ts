import type {
  ArticlePollDraft, PollOptionDraft,
  ArticleQuizDraft, QuizAnswerDraft, QuizQuestionDraft, QuizResultDraft,
  ArticleInterviewDraft, InterviewParticipantDraft, InterviewBlockDraft,
  ArticleAnalysisDraft, AnalysisMetricDraft, AnalysisBlockDraft,
  ArticleReportDraft, ReportCharacterDraft, ReportPlaceDraft, ReportBlockDraft,
  ArticleOpinionDraft, OpinionBlockDraft,
  ArticleDialogDraft, DialogParticipantDraft, DialogBlockDraft,
  ArticleAnnouncementDraft, ArticleSponsoredDraft,
  ArticleBydgoszczanieDraft, ArticleSportDraft, ArticlePoliticsDraft,
  ArticleInvestmentDraft, ArticleOurActionsDraft,
} from "@/components/admin/article-editor/types/articleEditorTypes";

export function createDefaultPollOption(label = ""): PollOptionDraft {
  return {
    id: crypto.randomUUID(),
    label,
    description: "",
    icon: "",
    imageUrl: "",
    color: "#f59e0b",
  };
}

export function createDefaultPoll(): ArticlePollDraft {
  return {
    enabled: false,
    pollId: `ankieta-${Date.now()}`,
    title: "",
    lead: "",
    type: "single",
    status: "active",
    options: [
      createDefaultPollOption("Tak"),
      createDefaultPollOption("Nie"),
      createDefaultPollOption("Nie wiem"),
    ],
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: { min: "Bardzo źle", max: "Świetnie" },
    allowMultiple: false,
    maxSelections: 2,
    voteLimitMode: "single_device",
    revoteAfterHours: 24,
    allowAnonymous: true,
    requireLogin: false,
    showResultsAfterVote: true,
    hideResultsUntilEnd: false,
    showPercentages: true,
    showVoteCount: true,
    showProgressBars: true,
    showWinner: true,
    showAverageRating: true,
    startDate: undefined,
    endDate: undefined,
    autoCloseAfterEnd: true,
    endMessage: "Ankieta została zakończona.",
    styleVariant: "portal",
    width: "container",
    borderRadius: 24,
    shadow: true,
    backgroundColor: "#ffffff",
    accentColor: "#f59e0b",
    buttonColor: "#f59e0b",
    resultStyle: "bars",
    answerCardStyle: "soft",
    voteButtonLabel: "Głosuj",
    afterVoteLabel: "Dziękujemy za oddanie głosu.",
    resultsLabel: "Wyniki ankiety",
    closedLabel: "Ankieta zakończona",
    repeatVoteError: "Ten głos został już oddany.",
    showBelowArticleWhenNoShortcode: true,
  };
}

export function createDefaultQuizAnswer(label = "", patch?: Partial<QuizAnswerDraft>): QuizAnswerDraft {
  return {
    id: crypto.randomUUID(),
    label,
    description: "",
    icon: "",
    imageUrl: "",
    color: "#f97316",
    isCorrect: false,
    points: 0,
    resultKey: "",
    ...patch,
  };
}

export function createDefaultQuizQuestion(index = 1): QuizQuestionDraft {
  return {
    id: crypto.randomUUID(),
    question: `Pytanie ${index}`,
    description: "",
    imageUrl: "",
    answerType: "single",
    maxSelections: 2,
    answers: [
      createDefaultQuizAnswer("Odpowiedź A", { isCorrect: true, points: 2, resultKey: "miejski" }),
      createDefaultQuizAnswer("Odpowiedź B", { points: 1, resultKey: "slow" }),
      createDefaultQuizAnswer("Odpowiedź C", { points: 0, resultKey: "soft" }),
    ],
  };
}

export function createDefaultQuizResult(key: string, title: string, patch?: Partial<QuizResultDraft>): QuizResultDraft {
  return {
    id: crypto.randomUUID(),
    key,
    title,
    description: "Opis wyniku quizu. Możesz tutaj rozwinąć charakter wyniku i dodać redakcyjny komentarz.",
    imageUrl: "",
    ctaLabel: "Czytaj więcej",
    ctaUrl: "",
    minScore: undefined,
    maxScore: undefined,
    minPercent: undefined,
    maxPercent: undefined,
    ...patch,
  };
}

export function createDefaultQuiz(): ArticleQuizDraft {
  return {
    enabled: false,
    quizId: `quiz-${Date.now()}`,
    status: "draft",
    type: "single",
    title: "",
    description: "",
    badgeLabel: "QUIZ",
    subtitle: "",
    intro: "Sprawdź swój wynik w lekkim, lifestylowym quizie przygotowanym przez redakcję.",
    startButtonLabel: "Rozpocznij quiz",
    showQuestionNumbers: true,
    showProgress: true,
    showQuestionCount: true,
    randomizeQuestions: false,
    randomizeAnswers: false,
    allowBack: true,
    singlePage: false,
    autoAdvance: false,
    showResultImmediately: true,
    questions: [createDefaultQuizQuestion(1), createDefaultQuizQuestion(2)],
    results: [
      createDefaultQuizResult("wynik-a", "Masz miejski lifestyle", { minPercent: 0, maxPercent: 49, minScore: 0, maxScore: 3 }),
      createDefaultQuizResult("wynik-b", "Masz wyczucie trendów", { minPercent: 50, maxPercent: 79, minScore: 4, maxScore: 7 }),
      createDefaultQuizResult("wynik-c", "Jesteś mistrzem quizu", { minPercent: 80, maxPercent: 100, minScore: 8, maxScore: 999 }),
      createDefaultQuizResult("miejski", "Pasuje do Ciebie miejski lifestyle"),
      createDefaultQuizResult("slow", "Jesteś typem slow life"),
      createDefaultQuizResult("soft", "Masz miękki, kobiecy styl"),
    ],
    styleVariant: "lifestyle",
    answerCardStyle: "soft",
    width: "container",
    layout: "column",
    borderRadius: 28,
    shadow: true,
    accentColor: "#f97316",
    buttonColor: "#ea580c",
    backgroundColor: "#fff7ed",
    progressStyle: "line",
    headerStyle: "hero",
    resultStyle: "card",
    headerImageUrl: "",
    headerGradient: "linear-gradient(135deg, rgba(249,115,22,0.14), rgba(236,72,153,0.12))",
    showCoverImage: false,
    showBadge: true,
    isPublic: true,
    adminPreview: true,
  };
}

export function createDefaultInterviewParticipant(name: string, patch?: Partial<InterviewParticipantDraft>): InterviewParticipantDraft {
  return {
    id: crypto.randomUUID(),
    name,
    role: "",
    imageUrl: "",
    bio: "",
    color: "#0f766e",
    shortLabel: name.slice(0, 2).toUpperCase(),
    isHost: false,
    ...patch,
  };
}

export function createDefaultInterviewBlock(type: InterviewBlockDraft["type"], content: string, patch?: Partial<InterviewBlockDraft>): InterviewBlockDraft {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    title: "",
    speakerId: "",
    hidden: false,
    ...patch,
  };
}

export function createDefaultInterview(): ArticleInterviewDraft {
  const host = createDefaultInterviewParticipant("Prowadzący", { role: "Dziennikarz", isHost: true, shortLabel: "P" });
  const guest = createDefaultInterviewParticipant("Rozmówca", { role: "Gość rozmowy", shortLabel: "R", color: "#c2410c" });
  return {
    enabled: false,
    status: "draft",
    intro: "Krótki wstęp do rozmowy. To miejsce na kontekst, temat i przedstawienie bohaterów wywiadu.",
    participants: [host, guest],
    blocks: [
      createDefaultInterviewBlock("question", "Jak zaczęła się ta historia?", { speakerId: host.id }),
      createDefaultInterviewBlock("answer", "To był proces, który dojrzewał od dłuższego czasu i wymagał kilku ważnych decyzji.", { speakerId: guest.id }),
      createDefaultInterviewBlock("commentary", "Komentarz redakcyjny: w tym miejscu możesz dopisać kontekst lub doprecyzowanie dla czytelnika."),
      createDefaultInterviewBlock("quote", "Najmocniejsze zdanie z rozmowy, które warto wyróżnić."),
    ],
    styleVariant: "classic",
    questionStyle: "accent",
    answerStyle: "boxed",
    speakerLabelStyle: "pill",
    width: "container",
    showSeparators: true,
    quoteStyle: "accent",
    showBioPanel: true,
  };
}

export function createDefaultAnalysisMetric(label: string, value: string): AnalysisMetricDraft {
  return {
    id: crypto.randomUUID(),
    label,
    value,
    note: "",
  };
}

export function createDefaultAnalysisBlock(type: AnalysisBlockDraft["type"], content: string): AnalysisBlockDraft {
  return {
    id: crypto.randomUUID(),
    type,
    title: "",
    content,
    value: "",
    sourceLabel: "",
    hidden: false,
  };
}

export function createDefaultAnalysis(): ArticleAnalysisDraft {
  return {
    enabled: false,
    thesis: "",
    summary: "",
    expertLevel: "średni",
    mainQuestion: "",
    context: "",
    arguments: ["Pierwszy argument analizy"],
    counterarguments: ["Najważniejszy kontrargument"],
    sources: ["Źródło główne / raport / opracowanie"],
    bibliography: "",
    conclusions: "",
    recommendations: "",
    metrics: [
      createDefaultAnalysisMetric("Zmiana rok do roku", "+12,4%"),
      createDefaultAnalysisMetric("Szacowany koszt", "3,2 mln zł"),
    ],
    blocks: [
      createDefaultAnalysisBlock("argument", "Najważniejszy argument wspierający tezę analizy."),
      createDefaultAnalysisBlock("data_box", "Kluczowa liczba lub wskaźnik, który buduje kontekst."),
      createDefaultAnalysisBlock("counterargument", "Kontrargument, który trzeba uczciwie uwzględnić."),
      createDefaultAnalysisBlock("partial_conclusion", "Wniosek cząstkowy z przedstawionych danych."),
    ],
    styleVariant: "expert",
  };
}

export function createDefaultReportCharacter(name: string, patch?: Partial<ReportCharacterDraft>): ReportCharacterDraft {
  return {
    id: crypto.randomUUID(),
    name,
    role: "",
    bio: "",
    imageUrl: "",
    isPrimary: false,
    ...patch,
  };
}

export function createDefaultReportPlace(name: string, patch?: Partial<ReportPlaceDraft>): ReportPlaceDraft {
  return {
    id: crypto.randomUUID(),
    name,
    description: "",
    imageUrl: "",
    ...patch,
  };
}

export function createDefaultReportBlock(type: ReportBlockDraft["type"], content: string, patch?: Partial<ReportBlockDraft>): ReportBlockDraft {
  return {
    id: crypto.randomUUID(),
    type,
    title: "",
    content,
    imageUrl: "",
    extra: "",
    hidden: false,
    ...patch,
  };
}

export function createDefaultReport(): ArticleReportDraft {
  return {
    enabled: false,
    intro: "To jest wejście reportażowe. Tu budujesz pierwszą scenę, atmosferę i wprowadzenie do historii.",
    mainHero: "Główny bohater reportażu",
    characters: [
      createDefaultReportCharacter("Główny bohater", { role: "Osoba prowadząca historię", isPrimary: true }),
      createDefaultReportCharacter("Drugi bohater", { role: "Postać drugoplanowa" }),
    ],
    places: [
      createDefaultReportPlace("Bydgoszcz", { description: "Miejsce, w którym rozgrywa się historia reportażu." }),
    ],
    eventPeriod: "",
    tone: "immersyjny",
    theme: "",
    whatToKnow: "",
    materials: ["Materiał źródłowy / rozmowa / dokument"],
    ending: "",
    blocks: [
      createDefaultReportBlock("scene", "Pierwsza scena reportażu. Opisz moment, obraz, dźwięk albo sytuację."),
      createDefaultReportBlock("hero_quote", "Najmocniejsza wypowiedź bohatera, która ustawia ton materiału."),
      createDefaultReportBlock("turning_point", "Moment zwrotny, który zmienia kierunek opowieści."),
      createDefaultReportBlock("context_box", "Krótki kontekst potrzebny czytelnikowi do zrozumienia historii."),
    ],
    styleVariant: "classic",
  };
}

export function createDefaultOpinionBlock(type: OpinionBlockDraft["type"], content: string): OpinionBlockDraft {
  return {
    id: crypto.randomUUID(),
    type,
    title: "",
    content,
    hidden: false,
  };
}

export function createDefaultOpinion(): ArticleOpinionDraft {
  return {
    enabled: false,
    thesis: "",
    position: "",
    authorNote: "",
    authorBio: "",
    leadQuote: "",
    counterpoint: "",
    closingPoint: "",
    arguments: ["Pierwszy argument autora"],
    blocks: [
      createDefaultOpinionBlock("argument", "Najmocniejszy argument rozwijajacy teze autora."),
      createDefaultOpinionBlock("lead_quote", "Przewodni cytat lub zdanie, ktore ma ustawic ton opinii."),
      createDefaultOpinionBlock("counterpoint", "Kontrpunkt albo polemika wobec dominujacego spojrzenia."),
      createDefaultOpinionBlock("summary", "Podsumowanie stanowiska autora."),
    ],
    styleVariant: "classic",
  };
}

export function createDefaultDialogParticipant(name: string, patch?: Partial<DialogParticipantDraft>): DialogParticipantDraft {
  return {
    id: crypto.randomUUID(),
    name,
    role: "",
    color: "#1d4ed8",
    ...patch,
  };
}

export function createDefaultDialogBlock(type: DialogBlockDraft["type"], content: string, patch?: Partial<DialogBlockDraft>): DialogBlockDraft {
  return {
    id: crypto.randomUUID(),
    type,
    speakerId: "",
    content,
    title: "",
    hidden: false,
    ...patch,
  };
}

export function createDefaultDialog(): ArticleDialogDraft {
  const speakerA = createDefaultDialogParticipant("Uczestnik A", { color: "#1d4ed8" });
  const speakerB = createDefaultDialogParticipant("Uczestnik B", { color: "#b45309" });
  return {
    enabled: false,
    description: "Wprowadzenie do rozmowy i zarys tego, czego dotyczy wymiana zdan.",
    context: "",
    conversationStyle: "swobodny",
    place: "",
    ending: "",
    participants: [speakerA, speakerB],
    blocks: [
      createDefaultDialogBlock("speaker_a", "Pierwsza wypowiedz uczestnika A.", { speakerId: speakerA.id }),
      createDefaultDialogBlock("speaker_b", "Odpowiedz uczestnika B.", { speakerId: speakerB.id }),
      createDefaultDialogBlock("narrator", "Komentarz narratora, ktory porzadkuje przebieg rozmowy."),
      createDefaultDialogBlock("highlight_quote", "Najmocniejsze zdanie, ktore warto wyroznic."),
    ],
  };
}

export function createDefaultAnnouncement(): ArticleAnnouncementDraft {
  return {
    enabled: false,
    noticeType: "",
    priority: "standard",
    validUntil: "",
    institution: "",
    noticeStatus: "aktywny",
    ctaLabel: "",
    ctaUrl: "",
    mustKnow: "",
    styleVariant: "neutral",
  };
}

export function createDefaultSponsored(): ArticleSponsoredDraft {
  return {
    enabled: false,
    sponsorLabel: "Sponsorowany",
    partnerName: "",
    partnerLogo: "",
    partnerUrl: "",
    partnerDescription: "",
    partnerCtaLabel: "",
    partnerCtaUrl: "",
    sponsorBoxTitle: "Partner materialu",
    sponsorDisclaimer: "",
    contactOffer: "",
    sectionPlacement: "start",
    styleVariant: "classic",
  };
}

export function createDefaultBydgoszczanie(): ArticleBydgoszczanieDraft {
  return {
    displayName: "",
    aboutHero: "",
    portraitUrl: "",
    storyTitle: "",
    storyDescription: "",
    gallery: [],
  };
}

export function createDefaultSport(): ArticleSportDraft {
  return {
    enabled: true,
    sportType: "pilka_nozna",
    teamIds: [],
    playerIds: [],
    leagueId: "",
    seasonId: "",
    tableId: "",
    eventId: "",
    isMatchReport: false,
    matchDate: "",
    matchLocation: "",
    league: "",
    round: "",
    homeScore: "",
    awayScore: "",
    matchStatus: "zaplanowany",
    homeLineup: [],
    awayLineup: [],
    matchStats: [],
    scorers: [],
    yellowCards: [],
    redCards: [],
    matchHighlights: [],
    leagueTableUrl: "",
    styleVariant: "dynamic",
  };
}

export function createDefaultPolitics(): ArticlePoliticsDraft {
  return {
    enabled: true,
    politicianIds: [],
    groupIds: [],
    positionIds: [],
    materialTypeId: "",
    eventIds: [],
    politicians: [],
    mainPoliticianId: "",
    politicalContext: "",
    parties: [],
    party: "",
    topic: "",
    timeline: [],
    relatedLegislation: "",
    styleVariant: "editorial",
  };
}

export function createDefaultInvestment(): ArticleInvestmentDraft {
  return {
    enabled: true,
    investmentIds: [],
    contractorIds: [],
    locationIds: [],
    statusIds: [],
    phaseIds: [],
    typeIds: [],
    linkedInvestmentId: "",
    district: "",
    projectName: "",
    projectStatus: "planowana",
    location: "",
    startDate: "",
    endDate: "",
    estimatedEndDate: "",
    budget: "",
    contractor: "",
    investor: "",
    progressPercent: 0,
    timeline: [],
    mapUrl: "",
    beforeImages: [],
    afterImages: [],
    impactDescription: "",
    styleVariant: "technical",
  };
}

export function createDefaultOurActions(): ArticleOurActionsDraft {
  return {
    enabled: true,
    partnerIds: [],
    projectIds: [],
    campaignIds: [],
    actionTypeId: "",
    resultIds: [],
    actionType: "akcja",
    actionStatus: "aktywna",
    startDate: "",
    endDate: "",
    partners: [],
    milestones: [],
    results: "",
    participants: "",
    impact: "",
    gallery: [],
    ctaLabel: "",
    ctaUrl: "",
    videoUrl: "",
    styleVariant: "storytelling",
  };
}

export function normalizeInterviewDraft(interview?: ArticleInterviewDraft) {
  if (!interview) return undefined;

  return {
    ...interview,
    intro: interview.intro?.trim() || undefined,
    participants: interview.participants
      .map((participant) => ({
        id: participant.id,
        name: participant.name.trim(),
        role: participant.role?.trim() || undefined,
        imageUrl: participant.imageUrl?.trim() || undefined,
        bio: participant.bio?.trim() || undefined,
        color: participant.color?.trim() || undefined,
        shortLabel: participant.shortLabel?.trim() || undefined,
        isHost: participant.isHost || undefined,
      }))
      .filter((participant) => participant.name),
    blocks: interview.blocks
      .map((block) => ({
        id: block.id,
        type: block.type,
        content: block.content.trim(),
        title: block.title?.trim() || undefined,
        speakerId: block.speakerId?.trim() || undefined,
        hidden: block.hidden || undefined,
      }))
      .filter((block) => block.content),
  };
}

export function generateSlug(title: string): string {
  const normalized = title
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => ({ ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.slice(0, 72).replace(/-+$/g, "") || "artykul";
}