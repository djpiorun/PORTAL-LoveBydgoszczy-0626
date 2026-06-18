import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const CATEGORIES = {
  MIASTO: "miasto",
  ROZRYWKA: "rozrywka",
  KULTURA: "kultura",
  BIZNES: "biznes",
  GASTRONOMIA: "gastronomia",
  BYDGOSZCZANIE: "bydgoszczanie",
  MEDYCZNA: "medyczna",
  SPORT: "sport",
  POLITYKA: "polityka",
  INWESTYCJE: "inwestycje",
  NASZE_DZIALANIA: "nasze_dzialania",
} as const;

export const categoryValidator = v.union(
  v.literal(CATEGORIES.MIASTO),
  v.literal(CATEGORIES.ROZRYWKA),
  v.literal(CATEGORIES.KULTURA),
  v.literal(CATEGORIES.BIZNES),
  v.literal(CATEGORIES.GASTRONOMIA),
  v.literal(CATEGORIES.BYDGOSZCZANIE),
  v.literal(CATEGORIES.MEDYCZNA),
  v.literal(CATEGORIES.SPORT),
  v.literal(CATEGORIES.POLITYKA),
  v.literal(CATEGORIES.INWESTYCJE),
  v.literal(CATEGORIES.NASZE_DZIALANIA),
);

export const pollOptionValidator = v.object({
  id: v.string(),
  label: v.string(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  color: v.optional(v.string()),
});

export const articlePollValidator = v.object({
  enabled: v.boolean(),
  pollId: v.string(),
  title: v.string(),
  lead: v.optional(v.string()),
  type: v.union(
    v.literal("single"),
    v.literal("multiple"),
    v.literal("scale"),
    v.literal("duel"),
  ),
  status: v.union(
    v.literal("active"),
    v.literal("hidden"),
    v.literal("closed"),
  ),
  options: v.array(pollOptionValidator),
  scaleMin: v.optional(v.number()),
  scaleMax: v.optional(v.number()),
  scaleLabels: v.optional(v.object({
    min: v.optional(v.string()),
    max: v.optional(v.string()),
  })),
  allowMultiple: v.optional(v.boolean()),
  maxSelections: v.optional(v.number()),
  voteLimitMode: v.union(
    v.literal("single_device"),
    v.literal("single_user"),
    v.literal("revote_after_time"),
    v.literal("none"),
  ),
  revoteAfterHours: v.optional(v.number()),
  allowAnonymous: v.boolean(),
  requireLogin: v.boolean(),
  showResultsAfterVote: v.boolean(),
  hideResultsUntilEnd: v.boolean(),
  showPercentages: v.boolean(),
  showVoteCount: v.boolean(),
  showProgressBars: v.boolean(),
  showWinner: v.boolean(),
  showAverageRating: v.boolean(),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  autoCloseAfterEnd: v.boolean(),
  endMessage: v.optional(v.string()),
  styleVariant: v.union(
    v.literal("portal"),
    v.literal("minimal"),
    v.literal("featured"),
    v.literal("editorial"),
  ),
  width: v.union(
    v.literal("full"),
    v.literal("container"),
    v.literal("narrow"),
  ),
  borderRadius: v.optional(v.number()),
  shadow: v.boolean(),
  backgroundColor: v.optional(v.string()),
  accentColor: v.optional(v.string()),
  buttonColor: v.optional(v.string()),
  resultStyle: v.union(
    v.literal("bars"),
    v.literal("compact"),
    v.literal("cards"),
  ),
  answerCardStyle: v.union(
    v.literal("soft"),
    v.literal("outline"),
    v.literal("solid"),
  ),
  voteButtonLabel: v.optional(v.string()),
  afterVoteLabel: v.optional(v.string()),
  resultsLabel: v.optional(v.string()),
  closedLabel: v.optional(v.string()),
  repeatVoteError: v.optional(v.string()),
  showBelowArticleWhenNoShortcode: v.boolean(),
});

export const articleBydgoszczanieValidator = v.object({
  displayName: v.optional(v.string()),
  aboutHero: v.optional(v.string()),
  portraitUrl: v.optional(v.string()),
  storyTitle: v.optional(v.string()),
  storyDescription: v.optional(v.string()),
  gallery: v.optional(v.array(v.string())),
});

export const quizAnswerValidator = v.object({
  id: v.string(),
  label: v.string(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  color: v.optional(v.string()),
  isCorrect: v.optional(v.boolean()),
  points: v.optional(v.number()),
  resultKey: v.optional(v.string()),
});

export const quizQuestionValidator = v.object({
  id: v.string(),
  question: v.string(),
  description: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  answerType: v.union(
    v.literal("single"),
    v.literal("multiple"),
    v.literal("image"),
    v.literal("yes_no"),
    v.literal("choices"),
  ),
  maxSelections: v.optional(v.number()),
  answers: v.array(quizAnswerValidator),
});

export const quizResultValidator = v.object({
  id: v.string(),
  key: v.string(),
  title: v.string(),
  description: v.string(),
  imageUrl: v.optional(v.string()),
  ctaLabel: v.optional(v.string()),
  ctaUrl: v.optional(v.string()),
  minScore: v.optional(v.number()),
  maxScore: v.optional(v.number()),
  minPercent: v.optional(v.number()),
  maxPercent: v.optional(v.number()),
});

export const articleQuizValidator = v.object({
  enabled: v.boolean(),
  quizId: v.string(),
  status: v.union(
    v.literal("active"),
    v.literal("draft"),
    v.literal("hidden"),
    v.literal("template"),
    v.literal("archived"),
    v.literal("preview"),
  ),
  type: v.union(
    v.literal("single"),
    v.literal("multiple"),
    v.literal("image"),
    v.literal("personality"),
    v.literal("scored"),
    v.literal("yes_no"),
    v.literal("choices"),
  ),
  title: v.string(),
  description: v.optional(v.string()),
  badgeLabel: v.optional(v.string()),
  subtitle: v.optional(v.string()),
  intro: v.optional(v.string()),
  startButtonLabel: v.optional(v.string()),
  showQuestionNumbers: v.boolean(),
  showProgress: v.boolean(),
  showQuestionCount: v.boolean(),
  randomizeQuestions: v.boolean(),
  randomizeAnswers: v.boolean(),
  allowBack: v.boolean(),
  singlePage: v.boolean(),
  autoAdvance: v.boolean(),
  showResultImmediately: v.boolean(),
  questions: v.array(quizQuestionValidator),
  results: v.array(quizResultValidator),
  styleVariant: v.union(
    v.literal("lifestyle"),
    v.literal("editorial"),
    v.literal("magazine"),
    v.literal("news"),
    v.literal("soft"),
    v.literal("urban"),
  ),
  answerCardStyle: v.union(
    v.literal("soft"),
    v.literal("outline"),
    v.literal("solid"),
    v.literal("glass"),
  ),
  width: v.union(
    v.literal("narrow"),
    v.literal("container"),
    v.literal("full"),
  ),
  layout: v.union(
    v.literal("column"),
    v.literal("grid"),
    v.literal("two_column"),
    v.literal("full_width"),
  ),
  borderRadius: v.optional(v.number()),
  shadow: v.boolean(),
  accentColor: v.optional(v.string()),
  buttonColor: v.optional(v.string()),
  backgroundColor: v.optional(v.string()),
  progressStyle: v.union(
    v.literal("line"),
    v.literal("steps"),
    v.literal("minimal"),
  ),
  headerStyle: v.union(
    v.literal("classic"),
    v.literal("hero"),
    v.literal("split"),
  ),
  resultStyle: v.union(
    v.literal("card"),
    v.literal("editorial"),
    v.literal("minimal"),
  ),
  headerImageUrl: v.optional(v.string()),
  headerGradient: v.optional(v.string()),
  showCoverImage: v.boolean(),
  showBadge: v.boolean(),
  isPublic: v.boolean(),
  adminPreview: v.boolean(),
});

export const interviewParticipantValidator = v.object({
  id: v.string(),
  name: v.string(),
  role: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  bio: v.optional(v.string()),
  color: v.optional(v.string()),
  shortLabel: v.optional(v.string()),
  isHost: v.optional(v.boolean()),
});

export const interviewBlockValidator = v.object({
  id: v.string(),
  type: v.union(
    v.literal("question"),
    v.literal("answer"),
    v.literal("commentary"),
    v.literal("heading"),
    v.literal("quote"),
    v.literal("teaser"),
    v.literal("info_box"),
  ),
  content: v.string(),
  title: v.optional(v.string()),
  speakerId: v.optional(v.string()),
  hidden: v.optional(v.boolean()),
});

export const articleInterviewValidator = v.object({
  enabled: v.boolean(),
  status: v.union(
    v.literal("active"),
    v.literal("draft"),
    v.literal("hidden"),
  ),
  intro: v.optional(v.string()),
  participants: v.array(interviewParticipantValidator),
  blocks: v.array(interviewBlockValidator),
  styleVariant: v.union(
    v.literal("classic"),
    v.literal("magazine"),
    v.literal("portal"),
    v.literal("minimal"),
    v.literal("lifestyle"),
  ),
  questionStyle: v.union(
    v.literal("accent"),
    v.literal("boxed"),
    v.literal("inline"),
  ),
  answerStyle: v.union(
    v.literal("plain"),
    v.literal("boxed"),
    v.literal("bubble"),
  ),
  speakerLabelStyle: v.union(
    v.literal("pill"),
    v.literal("minimal"),
    v.literal("editorial"),
  ),
  width: v.union(
    v.literal("narrow"),
    v.literal("container"),
    v.literal("wide"),
  ),
  showSeparators: v.boolean(),
  quoteStyle: v.union(
    v.literal("accent"),
    v.literal("magazine"),
    v.literal("minimal"),
  ),
  showBioPanel: v.boolean(),
});

export const analysisMetricValidator = v.object({
  id: v.string(),
  label: v.string(),
  value: v.string(),
  note: v.optional(v.string()),
});

export const analysisBlockValidator = v.object({
  id: v.string(),
  type: v.union(
    v.literal("argument"),
    v.literal("counterargument"),
    v.literal("chart"),
    v.literal("data_box"),
    v.literal("expert_quote"),
    v.literal("partial_conclusion"),
    v.literal("sources"),
    v.literal("recommendations"),
  ),
  title: v.optional(v.string()),
  content: v.string(),
  value: v.optional(v.string()),
  sourceLabel: v.optional(v.string()),
  hidden: v.optional(v.boolean()),
});

export const articleAnalysisValidator = v.object({
  enabled: v.boolean(),
  thesis: v.optional(v.string()),
  summary: v.optional(v.string()),
  expertLevel: v.union(
    v.literal("podstawowy"),
    v.literal("średni"),
    v.literal("zaawansowany"),
    v.literal("ekspercki"),
  ),
  mainQuestion: v.optional(v.string()),
  context: v.optional(v.string()),
  arguments: v.array(v.string()),
  counterarguments: v.array(v.string()),
  sources: v.array(v.string()),
  bibliography: v.optional(v.string()),
  conclusions: v.optional(v.string()),
  recommendations: v.optional(v.string()),
  metrics: v.array(analysisMetricValidator),
  blocks: v.array(analysisBlockValidator),
  styleVariant: v.union(
    v.literal("expert"),
    v.literal("economic"),
    v.literal("political"),
    v.literal("report"),
    v.literal("minimal"),
  ),
});

export const reportCharacterValidator = v.object({
  id: v.string(),
  name: v.string(),
  role: v.optional(v.string()),
  bio: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  isPrimary: v.optional(v.boolean()),
});

export const reportPlaceValidator = v.object({
  id: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
});

export const reportBlockValidator = v.object({
  id: v.string(),
  type: v.union(
    v.literal("scene"),
    v.literal("place_description"),
    v.literal("hero_quote"),
    v.literal("reporter_note"),
    v.literal("turning_point"),
    v.literal("timeline"),
    v.literal("context_box"),
    v.literal("gallery"),
  ),
  title: v.optional(v.string()),
  content: v.string(),
  imageUrl: v.optional(v.string()),
  extra: v.optional(v.string()),
  hidden: v.optional(v.boolean()),
});

export const articleReportValidator = v.object({
  enabled: v.boolean(),
  intro: v.optional(v.string()),
  mainHero: v.optional(v.string()),
  characters: v.array(reportCharacterValidator),
  places: v.array(reportPlaceValidator),
  eventPeriod: v.optional(v.string()),
  tone: v.union(
    v.literal("spokojny"),
    v.literal("emocjonalny"),
    v.literal("surowy"),
    v.literal("lokalny"),
    v.literal("immersyjny"),
  ),
  theme: v.optional(v.string()),
  whatToKnow: v.optional(v.string()),
  materials: v.array(v.string()),
  ending: v.optional(v.string()),
  blocks: v.array(reportBlockValidator),
  styleVariant: v.union(
    v.literal("classic"),
    v.literal("magazine"),
    v.literal("field"),
    v.literal("human"),
    v.literal("visual"),
  ),
});

export const opinionBlockValidator = v.object({
  id: v.string(),
  type: v.union(
    v.literal("argument"),
    v.literal("counterpoint"),
    v.literal("lead_quote"),
    v.literal("author_note"),
    v.literal("summary"),
  ),
  title: v.optional(v.string()),
  content: v.string(),
  hidden: v.optional(v.boolean()),
});

export const articleOpinionValidator = v.object({
  enabled: v.boolean(),
  thesis: v.optional(v.string()),
  position: v.optional(v.string()),
  authorNote: v.optional(v.string()),
  authorBio: v.optional(v.string()),
  leadQuote: v.optional(v.string()),
  counterpoint: v.optional(v.string()),
  closingPoint: v.optional(v.string()),
  arguments: v.array(v.string()),
  blocks: v.array(opinionBlockValidator),
  styleVariant: v.union(
    v.literal("classic"),
    v.literal("premium"),
    v.literal("polemics"),
    v.literal("column"),
    v.literal("news"),
  ),
});

export const dialogParticipantValidator = v.object({
  id: v.string(),
  name: v.string(),
  role: v.optional(v.string()),
  color: v.optional(v.string()),
});

export const dialogBlockValidator = v.object({
  id: v.string(),
  type: v.union(
    v.literal("speaker_a"),
    v.literal("speaker_b"),
    v.literal("speaker_c"),
    v.literal("narrator"),
    v.literal("highlight_quote"),
    v.literal("editor_note"),
  ),
  speakerId: v.optional(v.string()),
  content: v.string(),
  title: v.optional(v.string()),
  hidden: v.optional(v.boolean()),
});

export const articleDialogValidator = v.object({
  enabled: v.boolean(),
  description: v.optional(v.string()),
  context: v.optional(v.string()),
  conversationStyle: v.union(
    v.literal("swobodny"),
    v.literal("dynamiczny"),
    v.literal("formalny"),
    v.literal("emocjonalny"),
    v.literal("miejski"),
  ),
  place: v.optional(v.string()),
  ending: v.optional(v.string()),
  participants: v.array(dialogParticipantValidator),
  blocks: v.array(dialogBlockValidator),
});

export const articleAnnouncementValidator = v.object({
  enabled: v.boolean(),
  noticeType: v.optional(v.string()),
  priority: v.union(
    v.literal("niski"),
    v.literal("standard"),
    v.literal("wazny"),
    v.literal("pilny"),
  ),
  validUntil: v.optional(v.string()),
  institution: v.optional(v.string()),
  noticeStatus: v.union(
    v.literal("aktywny"),
    v.literal("archiwalny"),
    v.literal("zakonczony"),
    v.literal("obowiazujacy"),
  ),
  ctaLabel: v.optional(v.string()),
  ctaUrl: v.optional(v.string()),
  mustKnow: v.optional(v.string()),
  styleVariant: v.union(
    v.literal("neutral"),
    v.literal("alert"),
    v.literal("official"),
    v.literal("info"),
    v.literal("local"),
  ),
});

export const articleSponsoredValidator = v.object({
  enabled: v.boolean(),
  sponsorLabel: v.optional(v.string()),
  partnerName: v.optional(v.string()),
  partnerLogo: v.optional(v.string()),
  partnerUrl: v.optional(v.string()),
  partnerDescription: v.optional(v.string()),
  partnerCtaLabel: v.optional(v.string()),
  partnerCtaUrl: v.optional(v.string()),
  sponsorBoxTitle: v.optional(v.string()),
  sponsorDisclaimer: v.optional(v.string()),
  contactOffer: v.optional(v.string()),
  sectionPlacement: v.union(
    v.literal("start"),
    v.literal("end"),
  ),
  styleVariant: v.union(
    v.literal("classic"),
    v.literal("premium"),
    v.literal("lifestyle"),
    v.literal("business"),
    v.literal("magazine"),
  ),
});

// SPORT CATEGORY STRUCTURES
export const sportTeamValidator = v.object({
  id: v.string(),
  name: v.string(),
  shortName: v.optional(v.string()),
  logo: v.optional(v.string()),
  color: v.optional(v.string()),
  type: v.union(
    v.literal("home"),
    v.literal("away"),
  ),
});

export const sportPlayerValidator = v.object({
  id: v.string(),
  name: v.string(),
  number: v.optional(v.string()),
  position: v.optional(v.string()),
  rating: v.optional(v.number()),
});

export const sportMatchStatValidator = v.object({
  label: v.string(),
  homeValue: v.string(),
  awayValue: v.string(),
});

export const articleSportValidator = v.object({
  enabled: v.boolean(),
  sportType: v.union(
    v.literal("pilka_nozna"),
    v.literal("zuzel"),
    v.literal("siatkowka"),
    v.literal("inne"),
  ),
  isMatchReport: v.optional(v.boolean()),
  matchDate: v.optional(v.string()),
  matchLocation: v.optional(v.string()),
  league: v.optional(v.string()),
  round: v.optional(v.string()),
  homeTeam: v.optional(sportTeamValidator),
  awayTeam: v.optional(sportTeamValidator),
  homeScore: v.optional(v.string()),
  awayScore: v.optional(v.string()),
  matchStatus: v.optional(v.union(
    v.literal("zaplanowany"),
    v.literal("trwa"),
    v.literal("zakonczony"),
    v.literal("odwolany"),
  )),
  homeLineup: v.optional(v.array(sportPlayerValidator)),
  awayLineup: v.optional(v.array(sportPlayerValidator)),
  matchStats: v.optional(v.array(sportMatchStatValidator)),
  scorers: v.optional(v.array(v.string())),
  yellowCards: v.optional(v.array(v.string())),
  redCards: v.optional(v.array(v.string())),
  matchHighlights: v.optional(v.array(v.string())),
  leagueTableUrl: v.optional(v.string()),
  teamIds: v.optional(v.array(v.string())),
  playerIds: v.optional(v.array(v.string())),
  leagueId: v.optional(v.string()),
  seasonId: v.optional(v.string()),
  tableId: v.optional(v.string()),
  eventId: v.optional(v.string()),
  styleVariant: v.union(
    v.literal("dynamic"),
    v.literal("modern"),
    v.literal("classic"),
  ),
});

// POLITYKA CATEGORY STRUCTURES
export const politicianValidator = v.object({
  id: v.string(),
  fullName: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  photo: v.optional(v.string()),
  party: v.optional(v.string()),
  position: v.optional(v.string()),
  bio: v.optional(v.string()),
  facebookUrl: v.optional(v.string()),
  twitterUrl: v.optional(v.string()),
  websiteUrl: v.optional(v.string()),
});

export const politicalEventValidator = v.object({
  id: v.string(),
  date: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  type: v.optional(v.union(
    v.literal("wypowiedz"),
    v.literal("decyzja"),
    v.literal("glosowanie"),
    v.literal("inne"),
  )),
});

export const articlePoliticsValidator = v.object({
  enabled: v.boolean(),
  politicians: v.optional(v.array(politicianValidator)),
  mainPoliticianId: v.optional(v.string()),
  politicalContext: v.optional(v.string()),
  parties: v.optional(v.array(v.string())),
  party: v.optional(v.string()),
  topic: v.optional(v.string()),
  timeline: v.optional(v.array(politicalEventValidator)),
  relatedLegislation: v.optional(v.string()),
  politicianIds: v.optional(v.array(v.string())),
  groupIds: v.optional(v.array(v.string())),
  positionIds: v.optional(v.array(v.string())),
  materialTypeId: v.optional(v.string()),
  eventIds: v.optional(v.array(v.string())),
  styleVariant: v.union(
    v.literal("editorial"),
    v.literal("news"),
    v.literal("analysis"),
  ),
});

// INWESTYCJE CATEGORY STRUCTURES
export const investmentPhaseValidator = v.object({
  id: v.string(),
  date: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  status: v.union(
    v.literal("completed"),
    v.literal("current"),
    v.literal("upcoming"),
  ),
});

export const articleInvestmentValidator = v.object({
  enabled: v.boolean(),
  projectName: v.string(),
  projectStatus: v.union(
    v.literal("planowana"),
    v.literal("w_trakcie"),
    v.literal("zakonczona"),
    v.literal("wstrzymana"),
  ),
  location: v.optional(v.string()),
  district: v.optional(v.string()),
  linkedInvestmentId: v.optional(v.string()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  estimatedEndDate: v.optional(v.string()),
  budget: v.optional(v.string()),
  contractor: v.optional(v.string()),
  investor: v.optional(v.string()),
  progressPercent: v.optional(v.number()),
  timeline: v.optional(v.array(investmentPhaseValidator)),
  mapUrl: v.optional(v.string()),
  beforeImages: v.optional(v.array(v.string())),
  afterImages: v.optional(v.array(v.string())),
  impactDescription: v.optional(v.string()),
  investmentIds: v.optional(v.array(v.string())),
  contractorIds: v.optional(v.array(v.string())),
  locationIds: v.optional(v.array(v.string())),
  statusIds: v.optional(v.array(v.string())),
  phaseIds: v.optional(v.array(v.string())),
  typeIds: v.optional(v.array(v.string())),
  styleVariant: v.union(
    v.literal("technical"),
    v.literal("visual"),
    v.literal("report"),
  ),
});

// NASZE DZIAŁANIA CATEGORY STRUCTURES
export const actionPartnerValidator = v.object({
  id: v.string(),
  name: v.string(),
  logo: v.optional(v.string()),
  url: v.optional(v.string()),
});

export const actionMilestoneValidator = v.object({
  id: v.string(),
  date: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
});

export const articleOurActionsValidator = v.object({
  enabled: v.boolean(),
  actionType: v.union(
    v.literal("akcja"),
    v.literal("projekt"),
    v.literal("kampania"),
    v.literal("wspolpraca"),
  ),
  actionStatus: v.union(
    v.literal("aktywna"),
    v.literal("zakonczona"),
    v.literal("planowana"),
  ),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  partners: v.optional(v.array(actionPartnerValidator)),
  milestones: v.optional(v.array(actionMilestoneValidator)),
  results: v.optional(v.string()),
  participants: v.optional(v.string()),
  impact: v.optional(v.string()),
  gallery: v.optional(v.array(v.string())),
  ctaLabel: v.optional(v.string()),
  ctaUrl: v.optional(v.string()),
  videoUrl: v.optional(v.string()),
  partnerIds: v.optional(v.array(v.string())),
  projectIds: v.optional(v.array(v.string())),
  campaignIds: v.optional(v.array(v.string())),
  actionTypeId: v.optional(v.string()),
  resultIds: v.optional(v.array(v.string())),
  styleVariant: v.union(
    v.literal("storytelling"),
    v.literal("brand"),
    v.literal("impact"),
  ),
});

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      username: v.optional(v.string()),
      usernameLowercase: v.optional(v.string()),
      slug: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      passwordHash: v.optional(v.string()),
      passwordUpdatedAt: v.optional(v.number()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      subtitle: v.optional(v.string()),
      status: v.optional(v.string()),
      description: v.optional(v.string()),
      contactEmail: v.optional(v.string()),
      contactPhone: v.optional(v.string()),
      facebookUrl: v.optional(v.string()),
      instagramUrl: v.optional(v.string()),
      twitterUrl: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      isLoveBydgoszczTeam: v.optional(v.boolean()),
    })
      .index("email", ["email"])
      .index("name", ["name"])
      .index("slug", ["slug"])
      .index("usernameLowercase", ["usernameLowercase"]),

    articles: defineTable({
      title: v.string(),
      excerpt: v.string(),
      content: v.string(),
      category: categoryValidator,
      imageUrl: v.optional(v.string()),
      imageAuthor: v.optional(v.string()),
      author: v.string(),
      authorUserId: v.optional(v.id("users")),
      coauthor: v.optional(v.string()),
      coauthorUserId: v.optional(v.id("users")),
      publishedAt: v.number(),
      featured: v.optional(v.boolean()),
      isPatronage: v.optional(v.boolean()),
      tags: v.optional(v.array(v.string())),
      hideInReels: v.optional(v.boolean()),
      skipHomepage: v.optional(v.boolean()),
      likes: v.optional(v.number()),
      personName: v.optional(v.string()),
      bydgoszczanie: v.optional(articleBydgoszczanieValidator),
      sourceName: v.optional(v.string()),
      sourceUrl: v.optional(v.string()),
      expertQuote: v.optional(v.string()),
      slug: v.optional(v.string()),
      // Article labels
      labelUrgent: v.optional(v.boolean()),
      labelImportant: v.optional(v.boolean()),
      labelOurNews: v.optional(v.boolean()),
      labelMustKnow: v.optional(v.boolean()),
      labelAuthorArticle: v.optional(v.boolean()),
      label18Plus: v.optional(v.boolean()),
      labelDepresja: v.optional(v.boolean()),
      // Article footer / bibliography
      bibliography: v.optional(v.string()),
      sources: v.optional(v.string()),
      footerInfo: v.optional(v.string()),
      sourceFromContact: v.optional(v.string()),
      // Article type and template
      articleType: v.optional(v.union(
        v.literal("news"),
        v.literal("interview"),
        v.literal("dialog"),
        v.literal("report"),
        v.literal("analysis"),
        v.literal("press_release"),
        v.literal("opinion"),
        v.literal("sponsored"),
        v.literal("quiz"),
      )),
      articleTemplate: v.optional(v.string()),
      status: v.optional(v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("scheduled"),
        v.literal("archived"),
        v.literal("template"),
        v.literal("preview"),
      )),
      scheduledAt: v.optional(v.number()),
      layout: v.optional(v.union(
        v.literal("standard"),
        v.literal("wide"),
        v.literal("fullwidth"),
        v.literal("magazine"),
        v.literal("minimal"),
        v.literal("hero"),
      )),
      partnerName: v.optional(v.string()),
      partnerUrl: v.optional(v.string()),
      partnerLogoUrl: v.optional(v.string()),
      partnerLabel: v.optional(v.string()),
      seoTitle: v.optional(v.string()),
      seoDescription: v.optional(v.string()),
      allowComments: v.optional(v.boolean()),
      showUpdates: v.optional(v.boolean()),
      graphicsLayout: v.optional(v.string()),
      categoryLayout: v.optional(v.string()),
      articleElements: v.optional(v.array(v.object({
        id: v.string(),
        label: v.string(),
        icon: v.string(),
        enabled: v.boolean(),
        locked: v.boolean(),
      }))),
      coauthor2: v.optional(v.string()),
      coauthor3: v.optional(v.string()),
      corrector: v.optional(v.string()),
      publisher: v.optional(v.string()),
      updatedAt: v.optional(v.number()),
      authorFooterStyle: v.optional(v.union(
        v.literal("graphic"),
        v.literal("business"),
        v.literal("none"),
        v.literal("classic"),
      )),
      poll: v.optional(articlePollValidator),
      quiz: v.optional(articleQuizValidator),
      interview: v.optional(articleInterviewValidator),
      analysis: v.optional(articleAnalysisValidator),
      report: v.optional(articleReportValidator),
      opinion: v.optional(articleOpinionValidator),
      dialog: v.optional(articleDialogValidator),
      announcement: v.optional(articleAnnouncementValidator),
      sponsored: v.optional(articleSponsoredValidator),
      sport: v.optional(articleSportValidator),
      politics: v.optional(articlePoliticsValidator),
      investment: v.optional(articleInvestmentValidator),
      ourActions: v.optional(articleOurActionsValidator),
    })
      .index("by_category", ["category"])
      .index("by_featured", ["featured"])
      .index("by_publishedAt", ["publishedAt"])
      .index("by_author", ["author"])
      .index("by_isPatronage", ["isPatronage"])
      .index("by_status", ["status"])
      .index("by_slug", ["slug"])
      .searchIndex("search_title", { searchField: "title" }),

    article_updates: defineTable({
      articleId: v.id("articles"),
      title: v.string(),
      content: v.string(),
      author: v.string(),
      publishedAt: v.number(),
    }).index("by_article", ["articleId"]),

    article_interview_blocks: defineTable({
      articleId: v.id("articles"),
      order: v.number(),
      type: v.union(
        v.literal("question"),
        v.literal("answer"),
        v.literal("commentary"),
        v.literal("heading"),
        v.literal("quote"),
        v.literal("teaser"),
        v.literal("info_box"),
      ),
      content: v.string(),
      title: v.optional(v.string()),
      speakerId: v.optional(v.string()),
      hidden: v.optional(v.boolean()),
    })
      .index("by_article", ["articleId"])
      .index("by_article_order", ["articleId", "order"]),

    article_poll_votes: defineTable({
      articleId: v.id("articles"),
      pollId: v.string(),
      userId: v.optional(v.id("users")),
      voterKey: v.string(),
      selections: v.optional(v.array(v.string())),
      rating: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("by_article_poll", ["articleId", "pollId"])
      .index("by_poll_voter", ["pollId", "voterKey"])
      .index("by_poll_user", ["pollId", "userId"]),

    events: defineTable({
      title: v.string(),
      description: v.string(),
      category: categoryValidator,
      imageUrl: v.optional(v.string()),
      location: v.string(),
      startDate: v.number(),
      endDate: v.optional(v.number()),
      price: v.optional(v.string()),
      organizer: v.optional(v.string()),
      featured: v.optional(v.boolean()),
    })
      .index("by_category", ["category"])
      .index("by_startDate", ["startDate"])
      .index("by_featured", ["featured"])
      .searchIndex("search_title", { searchField: "title" }),

    newsletter: defineTable({
      email: v.string(),
      subscribedAt: v.number(),
    }).index("by_email", ["email"]),

    comments: defineTable({
      targetId: v.string(),
      targetType: v.string(),
      authorName: v.string(),
      content: v.string(),
      createdAt: v.number(),
      likes: v.number(),
      status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
      parentId: v.optional(v.id("comments")),
    }).index("by_target", ["targetId", "targetType"])
      .index("by_parent", ["parentId"]),

    stories: defineTable({
      title: v.string(),
      coverImage: v.string(),
      author: v.string(),
      items: v.array(
        v.object({
          type: v.union(v.literal("image"), v.literal("video"), v.literal("facebook_reel")),
          url: v.string(),
          duration: v.optional(v.number()),
          text: v.optional(v.string()),
          link: v.optional(v.string()),
        })
      ),
      isActive: v.boolean(),
      createdAt: v.number(),
    }).index("by_isActive", ["isActive"]),

    reels: defineTable({
      title: v.string(),
      description: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      author: v.optional(v.string()),
      category: v.optional(categoryValidator),
      sourceType: v.union(
        v.literal("upload"),
        v.literal("link"),
        v.literal("facebook"),
        v.literal("instagram"),
        v.literal("youtube"),
      ),
      videoUrl: v.string(),
      embedUrl: v.optional(v.string()),
      likes: v.optional(v.number()),
      views: v.optional(v.number()),
      isActive: v.boolean(),
      showInStories: v.optional(v.boolean()),
      publishedAt: v.number(),
    })
      .index("by_isActive", ["isActive"])
      .index("by_category", ["category"])
      .index("by_publishedAt", ["publishedAt"]),

    settings: defineTable({
      portalName: v.string(),
      seoDescription: v.string(),
      contactEmail: v.string(),
      contactPhone: v.string(),
      contactAddress: v.string(),
      footerDescription: v.optional(v.string()),
      footerLocationLine1: v.optional(v.string()),
      footerLocationLine2: v.optional(v.string()),
      footerBottomNote: v.optional(v.string()),
      facebookUrl: v.string(),
      instagramUrl: v.string(),
      youtubeUrl: v.string(),
      twitterUrl: v.string(),
      r2Enabled: v.optional(v.boolean()),
      r2AccountId: v.optional(v.string()),
      r2AccessKeyId: v.optional(v.string()),
      r2SecretAccessKey: v.optional(v.string()),
      r2BucketName: v.optional(v.string()),
      r2PublicBaseUrl: v.optional(v.string()),
      mediaMaxWidth: v.optional(v.number()),
      mediaQuality: v.optional(v.number()),
      mediaConvertToWebp: v.optional(v.boolean()),
    }),

    ai_chat_settings: defineTable({
      providerLabel: v.optional(v.string()),
      baseUrl: v.string(),
      apiKey: v.optional(v.string()),
      model: v.string(),
      systemPrompt: v.optional(v.string()),
      isEnabled: v.boolean(),
      updatedAt: v.number(),
      updatedBy: v.optional(v.id("users")),
    }),

    ai_chat_sessions: defineTable({
      title: v.string(),
      userId: v.optional(v.id("users")),
      contextArticleId: v.optional(v.id("articles")),
      createdAt: v.number(),
      updatedAt: v.number(),
      lastMessagePreview: v.optional(v.string()),
    })
      .index("by_updatedAt", ["updatedAt"])
      .index("by_user_updatedAt", ["userId", "updatedAt"]),

    ai_chat_messages: defineTable({
      sessionId: v.id("ai_chat_sessions"),
      role: v.union(
        v.literal("user"),
        v.literal("assistant"),
        v.literal("system"),
      ),
      content: v.string(),
      createdAt: v.number(),
    }).index("by_session", ["sessionId"]),

    category_settings: defineTable({
      key: v.string(),
      label: v.string(),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      icon: v.optional(v.string()),
      type: v.optional(v.union(v.literal("basic"), v.literal("advanced"))),
      routeSlug: v.optional(v.string()),
      subcategories: v.optional(v.array(v.object({
        key: v.string(),
        label: v.string(),
        description: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
      }))),
      order: v.number(),
      isActive: v.boolean(),
      isDefault: v.optional(v.boolean()),
    }).index("by_key", ["key"]).index("by_order", ["order"]),

    category_entities: defineTable({
      categoryKey: v.string(),
      entityType: v.string(),
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      icon: v.optional(v.string()),
      parentId: v.optional(v.id("category_entities")),
      externalRef: v.optional(v.string()),
      metadata: v.optional(v.string()),
      isActive: v.boolean(),
      order: v.optional(v.number()),
    })
      .index("by_slug", ["slug"])
      .index("by_category", ["categoryKey"])
      .index("by_entity_type", ["entityType"])
      .index("by_category_entity_type", ["categoryKey", "entityType"])
      .searchIndex("search_name", { searchField: "name" }),

    gtfs_routes: defineTable({
      route_id: v.string(),
      route_short_name: v.string(),
      route_long_name: v.string(),
      route_type: v.string(),
      last_seen: v.optional(v.number()),
    }).index("by_route_id", ["route_id"]).index("by_last_seen", ["last_seen"]),

    gtfs_stops: defineTable({
      stop_id: v.string(),
      stop_name: v.string(),
      stop_lat: v.string(),
      stop_lon: v.string(),
      last_seen: v.optional(v.number()),
    }).index("by_stop_id", ["stop_id"]).index("by_last_seen", ["last_seen"]),

    gtfs_route_details: defineTable({
      route_id: v.string(),
      directions: v.array(v.object({
        direction_id: v.string(),
        headsign: v.string(),
        stops: v.array(v.object({
          stop_id: v.string(),
          stop_name: v.string(),
        }))
      })),
      last_seen: v.optional(v.number()),
    }).index("by_route_id", ["route_id"]).index("by_last_seen", ["last_seen"]),

    gtfs_stop_departures: defineTable({
      stop_id: v.string(),
      departures: v.array(v.object({
        route_id: v.string(),
        route_short_name: v.string(),
        route_type: v.string(),
        service_id: v.string(),
        departure_time: v.string(),
        trip_headsign: v.string(),
        direction_id: v.string(),
      })),
      last_seen: v.optional(v.number()),
    }).index("by_stop_id", ["stop_id"]).index("by_last_seen", ["last_seen"]),

    gtfs_calendar: defineTable({
      date: v.string(),
      active_services: v.array(v.string()),
      last_seen: v.optional(v.number()),
    }).index("by_date", ["date"]).index("by_last_seen", ["last_seen"]),

    gtfs_metadata: defineTable({
      last_update: v.string(),
    }),

    ad_campaigns: defineTable({
      name: v.string(),
      partnerId: v.optional(v.string()),
      description: v.optional(v.string()),
      startDate: v.number(),
      endDate: v.number(),
      budget: v.optional(v.number()),
      status: v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("planned"),
        v.literal("finished"),
        v.literal("paused"),
        v.literal("archived")
      ),
      priority: v.optional(v.number()),
      viewLimit: v.optional(v.number()),
      clickLimit: v.optional(v.number()),
      placementIds: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
    }).index("by_status", ["status"]),

    ad_creatives: defineTable({
      name: v.string(),
      type: v.string(),
      content: v.optional(v.string()),
      targetUrl: v.optional(v.string()),
      campaignId: v.optional(v.id("ad_campaigns")),
      placements: v.optional(v.array(v.string())),
      views: v.optional(v.number()),
      clicks: v.optional(v.number()),
      isActive: v.boolean(),
      desktopImageUrl: v.optional(v.string()),
      mobileImageUrl: v.optional(v.string()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
    }),

    ad_placements: defineTable({
      name: v.string(),
      systemName: v.optional(v.string()),
      description: v.optional(v.string()),
      dimensions: v.optional(v.string()),
      maxAds: v.optional(v.number()),
      type: v.optional(v.string()),
      location: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      rotationEnabled: v.optional(v.boolean()),
    })
      .index("by_systemName", ["systemName"]),

    ad_partners: defineTable({
      name: v.string(),
      logoUrl: v.optional(v.string()),
      website: v.optional(v.string()),
      contactEmail: v.optional(v.string()),
      contactPhone: v.optional(v.string()),
      contactPerson: v.optional(v.string()),
      description: v.optional(v.string()),
      cooperationScope: v.optional(v.string()),
      status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("prospect"))),
      type: v.optional(v.union(v.literal("strategic"), v.literal("local"), v.literal("media"), v.literal("sponsor"), v.literal("advertiser"))),
      notes: v.optional(v.string()),
      showInSlider: v.optional(v.boolean()),
      sliderOrder: v.optional(v.number()),
      category: v.optional(v.string()),
    }),

    ad_inquiries: defineTable({
      companyName: v.string(),
      contactPerson: v.optional(v.string()),
      email: v.string(),
      phone: v.optional(v.string()),
      adType: v.optional(v.string()),
      budget: v.optional(v.string()),
      message: v.string(),
      status: v.union(
        v.literal("new"),
        v.literal("in_progress"),
        v.literal("offer_sent"),
        v.literal("finished"),
        v.literal("rejected")
      ),
      createdAt: v.number(),
      partnerId: v.optional(v.string()),
      notes: v.optional(v.string()),
    }).index("by_status", ["status"]),

    ad_graphics: defineTable({
      name: v.string(),
      size: v.number(),
      type: v.string(),
      storageId: v.id("_storage"),
      url: v.string(),
      createdAt: v.number(),
      campaignId: v.optional(v.string()),
      partnerId: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),

    media_assets: defineTable({
      name: v.string(),
      originalFileName: v.optional(v.string()),
      url: v.string(),
      storageProvider: v.union(v.literal("r2"), v.literal("convex")),
      mediaType: v.union(v.literal("image"), v.literal("video"), v.literal("document")),
      sourceKind: v.union(v.literal("article"), v.literal("story"), v.literal("event")),
      sourceEntityId: v.optional(v.string()),
      folder: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      mimeType: v.optional(v.string()),
      size: v.optional(v.number()),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
      lastUsedAt: v.optional(v.number()),
    })
      .index("by_createdAt", ["createdAt"])
      .index("by_folder", ["folder"])
      .index("by_sourceKind", ["sourceKind"])
      .index("by_url", ["url"]),

    ad_settings: defineTable({
      isModuleEnabled: v.boolean(),
      autoRotation: v.boolean(),
      notificationEmail: v.string(),
      defaultAdSizes: v.optional(v.array(v.string())),
      adTypes: v.optional(v.array(v.string())),
      maxEmissionsPerDay: v.optional(v.number()),
    }),

    ad_pricing: defineTable({
      name: v.string(),
      price: v.string(),
      unit: v.string(),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      isPromotion: v.optional(v.boolean()),
      validUntil: v.optional(v.number()),
    }),

    obituaries: defineTable({
      type: v.union(v.literal("nekrolog"), v.literal("wspomnienie"), v.literal("pozegnanie")),
      firstName: v.string(),
      lastName: v.string(),
      age: v.optional(v.string()),
      image: v.optional(v.string()),
      birthDate: v.optional(v.string()),
      deathDate: v.optional(v.string()),
      city: v.optional(v.string()),
      profession: v.optional(v.string()),
      shortDescription: v.optional(v.string()),
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      funeralDate: v.optional(v.string()),
      funeralTime: v.optional(v.string()),
      funeralPlace: v.optional(v.string()),
      cemeteryPlace: v.optional(v.string()),
      submitterName: v.optional(v.string()),
      submitterEmail: v.optional(v.string()),
      submitterPhone: v.optional(v.string()),
      submitterRelation: v.optional(v.string()),
      status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
      featured: v.optional(v.boolean()),
      createdAt: v.number(),
      publishedAt: v.optional(v.number()),
      slug: v.string(),
    })
      .index("by_status", ["status"])
      .index("by_slug", ["slug"])
      .index("by_type", ["type"])
      .index("by_status_and_type", ["status", "type"])
      .searchIndex("search_name", { searchField: "lastName", filterFields: ["status", "type"] }),

    updates: defineTable({
      title: v.string(),
      description: v.optional(v.string()),
      mediaUrl: v.optional(v.string()),
      mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
      linkUrl: v.optional(v.string()),
      linkLabel: v.optional(v.string()),
      location: v.optional(v.string()),
      category: v.optional(categoryValidator),
      publishedAt: v.number(),
      author: v.optional(v.string()),
    })
      .index("by_publishedAt", ["publishedAt"])
      .index("by_category", ["category"]),

    politicians: defineTable({
      fullName: v.string(),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      slug: v.string(),
      photo: v.optional(v.string()),
      party: v.optional(v.string()),
      position: v.optional(v.string()),
      bio: v.optional(v.string()),
      facebookUrl: v.optional(v.string()),
      twitterUrl: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    })
      .index("by_slug", ["slug"])
      .index("by_party", ["party"])
      .searchIndex("search_name", { searchField: "fullName" }),

    sport_teams: defineTable({
      name: v.string(),
      shortName: v.optional(v.string()),
      slug: v.string(),
      logo: v.optional(v.string()),
      primaryColor: v.optional(v.string()),
      secondaryColor: v.optional(v.string()),
      sportType: v.union(
        v.literal("pilka_nozna"),
        v.literal("zuzel"),
        v.literal("siatkowka"),
        v.literal("inne"),
      ),
      league: v.optional(v.string()),
      city: v.optional(v.string()),
      stadium: v.optional(v.string()),
      founded: v.optional(v.string()),
      website: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    })
      .index("by_slug", ["slug"])
      .index("by_sportType", ["sportType"])
      .searchIndex("search_name", { searchField: "name" }),

    sport_players: defineTable({
      fullName: v.string(),
      slug: v.string(),
      teamId: v.optional(v.id("sport_teams")),
      teamName: v.optional(v.string()),
      sportType: v.union(
        v.literal("pilka_nozna"),
        v.literal("zuzel"),
        v.literal("siatkowka"),
        v.literal("inne"),
      ),
      number: v.optional(v.string()),
      position: v.optional(v.string()),
      photo: v.optional(v.string()),
      bio: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    })
      .index("by_slug", ["slug"])
      .index("by_team", ["teamId"])
      .index("by_sportType", ["sportType"])
      .searchIndex("search_name", { searchField: "fullName" }),

    investments: defineTable({
      projectName: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      projectStatus: v.union(
        v.literal("planowana"),
        v.literal("w_trakcie"),
        v.literal("zakonczona"),
        v.literal("wstrzymana"),
      ),
      location: v.optional(v.string()),
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
      budget: v.optional(v.string()),
      contractor: v.optional(v.string()),
      investor: v.optional(v.string()),
      progressPercent: v.optional(v.number()),
      mainImageUrl: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    })
      .index("by_slug", ["slug"])
      .index("by_status", ["projectStatus"])
      .searchIndex("search_name", { searchField: "projectName" }),

    // Category hero display config — which items show in category hero and in what order
    category_hero_config: defineTable({
      categoryKey: v.string(),
      itemId: v.string(), // ID of politician/team/investment
      itemType: v.string(), // "politician" | "sport_team" | "investment"
      order: v.number(),
      isVisible: v.boolean(),
    })
      .index("by_category", ["categoryKey"])
      .index("by_category_and_type", ["categoryKey", "itemType"]),

    // Match results — quick-create sport results without full articles
    match_results: defineTable({
      homeTeamId: v.optional(v.string()),
      homeTeamName: v.string(),
      homeTeamLogo: v.optional(v.string()),
      awayTeamId: v.optional(v.string()),
      awayTeamName: v.string(),
      awayTeamLogo: v.optional(v.string()),
      homeScore: v.string(),
      awayScore: v.string(),
      matchDate: v.string(),
      league: v.optional(v.string()),
      round: v.optional(v.string()),
      sportType: v.union(
        v.literal("pilka_nozna"),
        v.literal("zuzel"),
        v.literal("siatkowka"),
        v.literal("inne"),
      ),
      matchStatus: v.union(
        v.literal("zaplanowany"),
        v.literal("trwa"),
        v.literal("zakonczony"),
        v.literal("odwolany"),
      ),
      notes: v.optional(v.string()),
      linkedArticleId: v.optional(v.string()),
    })
      .index("by_matchDate", ["matchDate"])
      .index("by_sportType", ["sportType"]),

    // Menu items — configurable navigation structure
    menu_items: defineTable({
      label: v.string(),
      path: v.string(),
      icon: v.string(), // lucide icon name as string
      tooltip: v.optional(v.string()),
      order: v.number(),
      isActive: v.boolean(),
      placement: v.union(
        v.literal("main"),      // visible in main nav bar
        v.literal("more"),      // in "Więcej" dropdown
        v.literal("kontakt"),   // in "Kontakt" dropdown
      ),
      type: v.union(
        v.literal("internal_link"),
        v.literal("category_link"),
        v.literal("dropdown_group"),
        v.literal("external_link"),
      ),
      parentId: v.optional(v.id("menu_items")), // for nested/child items
      showWhenScrolled: v.optional(v.boolean()), // show in compact scrolled nav
    })
      .index("by_placement", ["placement"])
      .index("by_order", ["order"])
      .index("by_parent", ["parentId"]),

    // Static/informational pages (like WordPress pages)
    pages: defineTable({
      title: v.string(),
      slug: v.string(),
      excerpt: v.optional(v.string()),
      content: v.optional(v.string()),
      status: v.union(v.literal("draft"), v.literal("published")),
      pageType: v.union(
        v.literal("standard"),
        v.literal("contact"),
        v.literal("legal"),
        v.literal("about"),
        v.literal("editorial"),
      ),
      isVisibleInMenu: v.boolean(),
      isVisibleInFooter: v.boolean(),
      order: v.number(),
      seoTitle: v.optional(v.string()),
      seoDescription: v.optional(v.string()),
      heroImage: v.optional(v.string()),
      updatedAt: v.optional(v.number()),
      isDeleted: v.optional(v.boolean()),
      deletedAt: v.optional(v.number()),
      // Scheduled publishing
      publishAt: v.optional(v.number()),
      // Archiving
      archivedAt: v.optional(v.number()),
      // Extended SEO
      canonicalUrl: v.optional(v.string()),
      robots: v.optional(v.string()),
      ogTitle: v.optional(v.string()),
      ogDescription: v.optional(v.string()),
      ogImage: v.optional(v.string()),
    })
      .index("by_slug", ["slug"])
      .index("by_status", ["status"])
      .index("by_order", ["order"]),

    page_versions: defineTable({
      pageId: v.id("pages"),
      title: v.string(),
      slug: v.string(),
      excerpt: v.optional(v.string()),
      content: v.optional(v.string()),
      status: v.union(v.literal("draft"), v.literal("published")),
      pageType: v.union(
        v.literal("standard"),
        v.literal("contact"),
        v.literal("legal"),
        v.literal("about"),
        v.literal("editorial"),
      ),
      isVisibleInMenu: v.boolean(),
      isVisibleInFooter: v.boolean(),
      order: v.number(),
      seoTitle: v.optional(v.string()),
      seoDescription: v.optional(v.string()),
      heroImage: v.optional(v.string()),
      source: v.union(
        v.literal("manual"),
        v.literal("rollback"),
        v.literal("restore"),
        v.literal("hard_delete"),
        v.literal("archive"),
        v.literal("duplicate"),
      ),
      createdAt: v.number(),
      createdById: v.optional(v.id("users")),
      restoredFromVersionId: v.optional(v.id("page_versions")),
      isDeleted: v.optional(v.boolean()),
      deletedAt: v.optional(v.number()),
      // Extended SEO in versions
      canonicalUrl: v.optional(v.string()),
      robots: v.optional(v.string()),
      ogTitle: v.optional(v.string()),
      ogDescription: v.optional(v.string()),
      ogImage: v.optional(v.string()),
      // Scheduled publishing in versions
      publishAt: v.optional(v.number()),
      // Archiving in versions
      archivedAt: v.optional(v.number()),
    }).index("by_pageId_and_createdAt", ["pageId", "createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;