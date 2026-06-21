export type ArticleElement = {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
  locked: boolean;
};

export type PublicationUpdateDraft = {
  id?: string;
  content: string;
  publishedAt: number;
};

export type ArticleBydgoszczanieDraft = {
  displayName?: string;
  aboutHero?: string;
  portraitUrl?: string;
  storyTitle?: string;
  storyDescription?: string;
  gallery?: string[];
};

export type SportTeamDraft = {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  color?: string;
  type: "home" | "away";
};

export type SportPlayerDraft = {
  id: string;
  name: string;
  number?: string;
  position?: string;
  rating?: number;
};

export type SportMatchStatDraft = {
  label: string;
  homeValue: string;
  awayValue: string;
};

export type ArticleSportDraft = {
  enabled: boolean;
  sportType: "pilka_nozna" | "zuzel" | "siatkowka" | "inne";
  teamIds?: string[];
  playerIds?: string[];
  leagueId?: string;
  seasonId?: string;
  tableId?: string;
  eventId?: string;
  isMatchReport?: boolean;
  matchDate?: string;
  matchLocation?: string;
  league?: string;
  round?: string;
  homeTeam?: SportTeamDraft;
  awayTeam?: SportTeamDraft;
  homeScore?: string;
  awayScore?: string;
  matchStatus?: "zaplanowany" | "trwa" | "zakonczony" | "odwolany";
  homeLineup?: SportPlayerDraft[];
  awayLineup?: SportPlayerDraft[];
  matchStats?: SportMatchStatDraft[];
  scorers?: string[];
  yellowCards?: string[];
  redCards?: string[];
  matchHighlights?: string[];
  leagueTableUrl?: string;
  styleVariant: "dynamic" | "modern" | "classic";
};

export type ArticlePoliticsDraft = {
  enabled: boolean;
  politicianIds?: string[];
  groupIds?: string[];
  positionIds?: string[];
  materialTypeId?: string;
  eventIds?: string[];
  politicians?: Array<{
    id: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    photo?: string;
    party?: string;
    position?: string;
    bio?: string;
    facebookUrl?: string;
    twitterUrl?: string;
    websiteUrl?: string;
  }>;
  mainPoliticianId?: string;
  politicalContext?: string;
  parties?: string[];
  topic?: string;
  timeline?: Array<{
    id: string;
    date: string;
    title: string;
    description?: string;
    type?: "wypowiedz" | "decyzja" | "glosowanie" | "inne";
  }>;
  relatedLegislation?: string;
  party?: string;
  styleVariant: "editorial" | "news" | "analysis";
};

export type ArticleInvestmentDraft = {
  enabled: boolean;
  investmentIds?: string[];
  contractorIds?: string[];
  locationIds?: string[];
  statusIds?: string[];
  phaseIds?: string[];
  typeIds?: string[];
  linkedInvestmentId?: string;
  district?: string;
  projectName: string;
  projectStatus: "planowana" | "w_trakcie" | "zakonczona" | "wstrzymana";
  location?: string;
  startDate?: string;
  endDate?: string;
  estimatedEndDate?: string;
  budget?: string;
  contractor?: string;
  investor?: string;
  progressPercent?: number;
  timeline?: Array<{
    id: string;
    date: string;
    title: string;
    description?: string;
    status: "completed" | "current" | "upcoming";
  }>;
  mapUrl?: string;
  beforeImages?: string[];
  afterImages?: string[];
  impactDescription?: string;
  styleVariant: "technical" | "visual" | "report";
};

export type ArticleOurActionsDraft = {
  enabled: boolean;
  partnerIds?: string[];
  projectIds?: string[];
  campaignIds?: string[];
  actionTypeId?: string;
  resultIds?: string[];
  actionType: "akcja" | "projekt" | "kampania" | "wspolpraca";
  actionStatus: "aktywna" | "zakonczona" | "planowana";
  startDate?: string;
  endDate?: string;
  partners?: Array<{ id: string; name: string; logo?: string; url?: string }>;
  milestones?: Array<{ id: string; date: string; title: string; description?: string; imageUrl?: string }>;
  results?: string;
  participants?: string;
  impact?: string;
  gallery?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  videoUrl?: string;
  styleVariant: "storytelling" | "brand" | "impact";
};

export type PollOptionDraft = {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  color?: string;
};

export type ArticlePollDraft = {
  enabled: boolean;
  pollId: string;
  title: string;
  lead?: string;
  type: "single" | "multiple" | "scale" | "duel";
  status: "active" | "hidden" | "closed";
  options: PollOptionDraft[];
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

export type QuizAnswerDraft = {
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

export type QuizQuestionDraft = {
  id: string;
  question: string;
  description?: string;
  imageUrl?: string;
  answerType: "single" | "multiple" | "image" | "yes_no" | "choices";
  maxSelections?: number;
  answers: QuizAnswerDraft[];
};

export type QuizResultDraft = {
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

export type ArticleQuizDraft = {
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
  questions: QuizQuestionDraft[];
  results: QuizResultDraft[];
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

export type InterviewParticipantDraft = {
  id: string;
  name: string;
  role?: string;
  imageUrl?: string;
  bio?: string;
  color?: string;
  shortLabel?: string;
  isHost?: boolean;
};

export type InterviewBlockDraft = {
  id: string;
  type: "question" | "answer" | "commentary" | "heading" | "quote" | "teaser" | "info_box";
  content: string;
  title?: string;
  speakerId?: string;
  hidden?: boolean;
};

export type ArticleInterviewDraft = {
  enabled: boolean;
  status: "active" | "draft" | "hidden";
  intro?: string;
  participants: InterviewParticipantDraft[];
  blocks: InterviewBlockDraft[];
  styleVariant: "classic" | "magazine" | "portal" | "minimal" | "lifestyle";
  questionStyle: "accent" | "boxed" | "inline";
  answerStyle: "plain" | "boxed" | "bubble";
  speakerLabelStyle: "pill" | "minimal" | "editorial";
  width: "narrow" | "container" | "wide";
  showSeparators: boolean;
  quoteStyle: "accent" | "magazine" | "minimal";
  showBioPanel: boolean;
};

export type AnalysisMetricDraft = {
  id: string;
  label: string;
  value: string;
  note?: string;
};

export type AnalysisBlockDraft = {
  id: string;
  type: "argument" | "counterargument" | "chart" | "data_box" | "expert_quote" | "partial_conclusion" | "sources" | "recommendations";
  title?: string;
  content: string;
  value?: string;
  sourceLabel?: string;
  hidden?: boolean;
};

export type ArticleAnalysisDraft = {
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
  metrics: AnalysisMetricDraft[];
  blocks: AnalysisBlockDraft[];
  styleVariant: "expert" | "economic" | "political" | "report" | "minimal";
};

export type ReportCharacterDraft = {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  imageUrl?: string;
  isPrimary?: boolean;
};

export type ReportPlaceDraft = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

export type ReportBlockDraft = {
  id: string;
  type: "scene" | "place_description" | "hero_quote" | "reporter_note" | "turning_point" | "timeline" | "context_box" | "gallery";
  title?: string;
  content: string;
  imageUrl?: string;
  extra?: string;
  hidden?: boolean;
};

export type ArticleReportDraft = {
  enabled: boolean;
  intro?: string;
  mainHero?: string;
  characters: ReportCharacterDraft[];
  places: ReportPlaceDraft[];
  eventPeriod?: string;
  tone: "spokojny" | "emocjonalny" | "surowy" | "lokalny" | "immersyjny";
  theme?: string;
  whatToKnow?: string;
  materials: string[];
  ending?: string;
  blocks: ReportBlockDraft[];
  styleVariant: "classic" | "magazine" | "field" | "human" | "visual";
};

export type OpinionBlockDraft = {
  id: string;
  type: "argument" | "counterpoint" | "lead_quote" | "author_note" | "summary";
  title?: string;
  content: string;
  hidden?: boolean;
};

export type ArticleOpinionDraft = {
  enabled: boolean;
  thesis?: string;
  position?: string;
  authorNote?: string;
  authorBio?: string;
  leadQuote?: string;
  counterpoint?: string;
  closingPoint?: string;
  arguments: string[];
  blocks: OpinionBlockDraft[];
  styleVariant: "classic" | "premium" | "polemics" | "column" | "news";
};

export type DialogParticipantDraft = {
  id: string;
  name: string;
  role?: string;
  color?: string;
};

export type DialogBlockDraft = {
  id: string;
  type: "speaker_a" | "speaker_b" | "speaker_c" | "narrator" | "highlight_quote" | "editor_note";
  speakerId?: string;
  content: string;
  title?: string;
  hidden?: boolean;
};

export type ArticleDialogDraft = {
  enabled: boolean;
  description?: string;
  context?: string;
  conversationStyle: "swobodny" | "dynamiczny" | "formalny" | "emocjonalny" | "miejski";
  place?: string;
  ending?: string;
  participants: DialogParticipantDraft[];
  blocks: DialogBlockDraft[];
};

export type ArticleAnnouncementDraft = {
  enabled: boolean;
  noticeType?: string;
  priority: "niski" | "standard" | "wazny" | "pilny";
  validUntil?: string;
  institution?: string;
  noticeStatus: "aktywny" | "archiwalny" | "zakonczony" | "obowiazujacy";
  ctaLabel?: string;
  ctaUrl?: string;
  mustKnow?: string;
  styleVariant: "neutral" | "alert" | "official" | "info" | "local";
};

export type ArticleSponsoredDraft = {
  enabled: boolean;
  sponsorLabel?: string;
  partnerName?: string;
  partnerLogo?: string;
  partnerUrl?: string;
  partnerDescription?: string;
  partnerCtaLabel?: string;
  partnerCtaUrl?: string;
  sponsorBoxTitle?: string;
  sponsorDisclaimer?: string;
  contactOffer?: string;
  sectionPlacement: "start" | "end";
  styleVariant: "classic" | "premium" | "lifestyle" | "business" | "magazine";
};

export type ArticleType = {
  _id?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string;
  imageAuthor?: string;
  author: string;
  coauthor?: string;
  coauthor2?: string;
  coauthor3?: string;
  corrector?: string;
  publisher?: string;
  publishedAt: number;
  updatedAt?: number;
  featured?: boolean;
  isPatronage?: boolean;
  tags?: string[];
  hideInReels?: boolean;
  skipHomepage?: boolean;
  personName?: string;
  bydgoszczanie?: ArticleBydgoszczanieDraft;
  sport?: ArticleSportDraft;
  politics?: ArticlePoliticsDraft;
  investment?: ArticleInvestmentDraft;
  ourActions?: ArticleOurActionsDraft;
  sourceName?: string;
  sourceUrl?: string;
  expertQuote?: string;
  slug?: string;
  articleType?: string;
  status?: string;
  layout?: string;
  partnerName?: string;
  partnerUrl?: string;
  partnerLogoUrl?: string;
  partnerLabel?: string;
  seoTitle?: string;
  seoDescription?: string;
  allowComments?: boolean;
  showUpdates?: boolean;
  labelUrgent?: boolean;
  labelImportant?: boolean;
  labelOurNews?: boolean;
  labelMustKnow?: boolean;
  labelAuthorArticle?: boolean;
  label18Plus?: boolean;
  labelBeingUpdated?: boolean;
  bibliography?: string;
  sources?: string;
  footerInfo?: string;
  sourceFromContact?: string;
  graphicsLayout?: string;
  categoryLayout?: string;
  authorFooterStyle?: "graphic" | "business" | "classic" | "none";
  articleElements?: ArticleElement[];
  poll?: ArticlePollDraft;
  quiz?: ArticleQuizDraft;
  interview?: ArticleInterviewDraft;
  analysis?: ArticleAnalysisDraft;
  report?: ArticleReportDraft;
  opinion?: ArticleOpinionDraft;
  dialog?: ArticleDialogDraft;
  announcement?: ArticleAnnouncementDraft;
  sponsored?: ArticleSponsoredDraft;
};

export type BlockSettings = {
  hidden?: boolean;
  align?: "left" | "center" | "right";
  width?: "narrow" | "normal" | "wide" | "full";
};

export type ParagraphBlock = {
  id: string;
  type: "paragraph";
  data: { html: string };
  settings?: BlockSettings;
};

export type HeadingBlock = {
  id: string;
  type: "heading";
  data: { level: 2 | 3 | 4; text: string };
  settings?: BlockSettings;
};

export type LeadBlock = {
  id: string;
  type: "lead";
  data: { text: string };
  settings?: BlockSettings;
};

export type QuoteBlock = {
  id: string;
  type: "quote";
  data: { text: string; author?: string; source?: string };
  settings?: BlockSettings;
};

export type PullQuoteBlock = {
  id: string;
  type: "pullquote";
  data: { text: string; author?: string };
  settings?: BlockSettings;
};

export type ImageBlock = {
  id: string;
  type: "image";
  data: {
    src: string;
    alt?: string;
    caption?: string;
    credit?: string;
    source?: string;
    focalPoint?: { x: number; y: number };
  };
  settings?: BlockSettings & { aspectRatio?: "16/9" | "4/3" | "1/1" | "3/2" };
};

export type GalleryBlock = {
  id: string;
  type: "gallery";
  data: {
    images: Array<{ src: string; alt?: string; caption?: string }>;
    layout?: "grid" | "masonry" | "carousel";
  };
  settings?: BlockSettings;
};

export type VideoEmbedBlock = {
  id: string;
  type: "embed_video";
  data: { url: string; caption?: string };
  settings?: BlockSettings;
};

export type SocialEmbedBlock = {
  id: string;
  type: "social_embed";
  data: { url: string; platform?: "facebook" | "instagram" | "twitter" | "youtube" | "other" };
  settings?: BlockSettings;
};

export type AudioBlock = {
  id: string;
  type: "audio";
  data: { url: string; title?: string; artist?: string };
  settings?: BlockSettings;
};

export type MapEmbedBlock = {
  id: string;
  type: "map_embed";
  data: { url: string; caption?: string };
  settings?: BlockSettings;
};

export type InfoBoxBlock = {
  id: string;
  type: "info_box";
  data: { title?: string; content: string; variant?: "info" | "tip" | "warning" | "success" };
  settings?: BlockSettings;
};

export type AlertBlock = {
  id: string;
  type: "alert";
  data: { title?: string; content: string; variant?: "warning" | "danger" | "info" };
  settings?: BlockSettings;
};

export type KeyPointsBlock = {
  id: string;
  type: "key_points";
  data: { title?: string; points: string[] };
  settings?: BlockSettings;
};

export type ExpertQuoteBlock = {
  id: string;
  type: "expertquote";
  data: { text: string; name: string; role?: string; imageUrl?: string };
  settings?: BlockSettings;
};

export type ContextBoxBlock = {
  id: string;
  type: "context_box";
  data: { title?: string; content: string };
  settings?: BlockSettings;
};

export type FactCheckBlock = {
  id: string;
  type: "fact_check";
  data: { claim: string; verdict: "true" | "false" | "misleading" | "unverified"; explanation?: string };
  settings?: BlockSettings;
};

export type FaqBlock = {
  id: string;
  type: "faq";
  data: { title?: string; items: Array<{ question: string; answer: string }> };
  settings?: BlockSettings;
};

export type ProsConsBlock = {
  id: string;
  type: "pros_cons";
  data: { title?: string; pros: string[]; cons: string[] };
  settings?: BlockSettings;
};

export type TimelineBlock = {
  id: string;
  type: "timeline";
  data: { title?: string; items: Array<{ date: string; title: string; description?: string }> };
  settings?: BlockSettings;
};

export type SourcesListBlock = {
  id: string;
  type: "sources_list";
  data: { title?: string; sources: Array<{ label: string; url?: string }> };
  settings?: BlockSettings;
};

export type ReadMoreBlock = {
  id: string;
  type: "read_more";
  data: { title?: string; articleId?: string; url?: string; label?: string };
  settings?: BlockSettings;
};

export type CtaBlock = {
  id: string;
  type: "cta";
  data: { title: string; description?: string; buttonLabel: string; buttonUrl: string; variant?: "primary" | "secondary" };
  settings?: BlockSettings;
};

export type SeparatorBlock = {
  id: string;
  type: "separator";
  data: { style?: "line" | "dots" | "stars" };
  settings?: BlockSettings;
};

export type CodeBlock = {
  id: string;
  type: "code";
  data: { code: string; language?: string; caption?: string };
  settings?: BlockSettings;
};

export type ListBlock = {
  id: string;
  type: "list";
  data: { items: string[]; ordered?: boolean };
  settings?: BlockSettings;
};

export type StatsGridBlock = {
  id: string;
  type: "stats_grid";
  data: { title?: string; stats: Array<{ label: string; value: string; note?: string }> };
  settings?: BlockSettings;
};

export type PersonCardBlock = {
  id: string;
  type: "person_card";
  data: { name: string; role?: string; bio?: string; imageUrl?: string; links?: Array<{ label: string; url: string }> };
  settings?: BlockSettings;
};

export type NewsletterSignupBlock = {
  id: string;
  type: "newsletter_signup";
  data: { title?: string; description?: string; buttonLabel?: string };
  settings?: BlockSettings;
};

export type LiveUpdateBlock = {
  id: string;
  type: "live_update";
  data: { title?: string; updates: Array<{ time: string; content: string }> };
  settings?: BlockSettings;
};

export type ArticleContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | LeadBlock
  | QuoteBlock
  | PullQuoteBlock
  | ImageBlock
  | GalleryBlock
  | VideoEmbedBlock
  | SocialEmbedBlock
  | AudioBlock
  | MapEmbedBlock
  | InfoBoxBlock
  | AlertBlock
  | KeyPointsBlock
  | ExpertQuoteBlock
  | ContextBoxBlock
  | FactCheckBlock
  | FaqBlock
  | ProsConsBlock
  | TimelineBlock
  | SourcesListBlock
  | ReadMoreBlock
  | CtaBlock
  | SeparatorBlock
  | CodeBlock
  | ListBlock
  | StatsGridBlock
  | PersonCardBlock
  | NewsletterSignupBlock
  | LiveUpdateBlock;

export type ArticleContentBlockType = ArticleContentBlock["type"];

export function createBlock(type: ArticleContentBlockType): ArticleContentBlock {
  const id = `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  switch (type) {
    case "paragraph": return { id, type, data: { html: "" } };
    case "heading": return { id, type, data: { level: 2, text: "" } };
    case "lead": return { id, type, data: { text: "" } };
    case "quote": return { id, type, data: { text: "", author: "" } };
    case "pullquote": return { id, type, data: { text: "", author: "" } };
    case "image": return { id, type, data: { src: "", alt: "", caption: "" } };
    case "gallery": return { id, type, data: { images: [], layout: "grid" } };
    case "embed_video": return { id, type, data: { url: "" } };
    case "social_embed": return { id, type, data: { url: "" } };
    case "audio": return { id, type, data: { url: "" } };
    case "map_embed": return { id, type, data: { url: "" } };
    case "info_box": return { id, type, data: { content: "", variant: "info" } };
    case "alert": return { id, type, data: { content: "", variant: "warning" } };
    case "key_points": return { id, type, data: { points: [""] } };
    case "expertquote": return { id, type, data: { text: "", name: "" } };
    case "context_box": return { id, type, data: { content: "" } };
    case "fact_check": return { id, type, data: { claim: "", verdict: "unverified" } };
    case "faq": return { id, type, data: { items: [{ question: "", answer: "" }] } };
    case "pros_cons": return { id, type, data: { pros: [""], cons: [""] } };
    case "timeline": return { id, type, data: { items: [{ date: "", title: "" }] } };
    case "sources_list": return { id, type, data: { sources: [{ label: "" }] } };
    case "read_more": return { id, type, data: { label: "Czytaj więcej" } };
    case "cta": return { id, type, data: { title: "", buttonLabel: "Kliknij", buttonUrl: "" } };
    case "separator": return { id, type, data: { style: "line" } };
    case "code": return { id, type, data: { code: "" } };
    case "list": return { id, type, data: { items: [""], ordered: false } };
    case "stats_grid": return { id, type, data: { stats: [{ label: "", value: "" }] } };
    case "person_card": return { id, type, data: { name: "" } };
    case "newsletter_signup": return { id, type, data: {} };
    case "live_update": return { id, type, data: { updates: [{ time: "", content: "" }] } };
    default: return { id, type: "paragraph", data: { html: "" } };
  }
}