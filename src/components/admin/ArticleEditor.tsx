import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
  FileText, Mic, BarChart2, Newspaper, Lightbulb, DollarSign,
  Image, Quote, Minus, Bold, Italic, Link2, List, Hash,
  Settings, Tag, Globe, BookOpen, Plus, Trash2,
  Save, ArrowLeft, Upload, Clock,
  CheckCircle, Archive, Send, Code, User,
  AlertTriangle, Info, Star, Zap, PenTool, ShieldCheck, BookmarkPlus, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight,
  Eye, Users, Underline, AlignLeft, AlignCenter, AlignRight,
  ListOrdered, Strikethrough, Undo, Redo, Type,
  Palette, Layout, Database, MoreHorizontal, SlidersHorizontal,
  ExternalLink, MessageSquare, Link, Copy, Check,
  Heading1, Heading2, Heading3, Table, Video, MapPin,
  Columns, AlignJustify, Maximize2, BookMarked, Newspaper as NewsIcon,
  GripVertical, ImageIcon, AlignVerticalJustifyStart, AlignVerticalJustifyEnd, LayoutGrid, Layers,
  Monitor, Smartphone, Tablet, PanelLeft, PanelRight, PanelTop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import AuthorFooterCard from "@/components/AuthorFooterCard";
import { uploadMediaAsset } from "@/lib/media-upload";
import MediaLibraryPicker from "@/components/admin/MediaLibraryPicker";

// Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExtension from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { CATEGORIES, LAYOUTS, GRAPHICS_LAYOUTS, CATEGORY_LAYOUTS } from "@/components/admin/article-editor/config/categories";
import { ARTICLE_TYPES, STATUS_OPTIONS, RIGHT_TABS, BOTTOM_TABS } from "@/components/admin/article-editor/config/articleTypes";
import { CONTENT_BLOCKS, CONTENT_BLOCK_GROUPS, DEFAULT_ARTICLE_ELEMENTS } from "@/components/admin/article-editor/config/contentBlocks";
import BlockCanvas from "@/components/admin/article-editor/blocks/BlockCanvas";
import type { ArticleContentBlock } from "@/components/admin/article-editor/types/articleEditorTypes";
import type { ArticleElement } from "@/components/admin/article-editor/types/articleEditorTypes";
import ArticleElementsManager from "@/components/admin/article-editor/blocks/ArticleElementsManager";
import LayoutTab from "@/components/admin/article-editor/panels/LayoutTab";
import TiptapEditor, { WysiwygToolbar } from "@/components/admin/article-editor/blocks/TiptapEditor";
import EditorTopBar from "@/components/admin/article-editor/panels/EditorTopBar";
import EditorRightPanel from "@/components/admin/article-editor/panels/EditorRightPanel";
import BlockInsertModal, { BLOCK_MODAL_TYPES } from "@/components/admin/article-editor/blocks/BlockInsertModal";
import AuthorAutocomplete from "@/components/admin/article-editor/helpers/AuthorAutocomplete";
import CollapsibleSection from "@/components/admin/article-editor/helpers/CollapsibleSection";
import NativeSelect from "@/components/admin/article-editor/helpers/NativeSelect";
import { RelationSingleSelect, RelationMultiSelect } from "@/components/admin/article-editor/helpers/RelationSelects";
import CategoryPicker from "@/components/admin/article-editor/helpers/CategoryPicker";
import ArticleTypePicker from "@/components/admin/article-editor/helpers/ArticleTypePicker";
import {
  PollEditor, QuizEditor, InterviewEditor, AnalysisEditor, ReportEditor,
  OpinionEditor, DialogEditor, AnnouncementEditor, SponsoredEditor,
} from "@/components/admin/article-editor/blocks/DomainEditors";
import {
  createDefaultPoll, createDefaultQuiz, createDefaultInterview,
  createDefaultAnalysis, createDefaultReport, createDefaultOpinion,
  createDefaultDialog, createDefaultAnnouncement, createDefaultSponsored,
  createDefaultBydgoszczanie, createDefaultSport, createDefaultPolitics,
  createDefaultInvestment, createDefaultOurActions,
  generateSlug, normalizeInterviewDraft,
} from "@/components/admin/article-editor/helpers/articleDefaults";
import SourcesTab from "@/components/admin/article-editor/panels/SourcesTab";
import AppearanceTab from "@/components/admin/article-editor/panels/AppearanceTab";
import AdditionalTab from "@/components/admin/article-editor/panels/AdditionalTab";
// ArticleElementsManager moved to blocks/ArticleElementsManager.tsx
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _ArticleElementsManager_REMOVED({ elements, onChange }: { elements: ArticleElement[]; onChange: (els: ArticleElement[]) => void }) { return null; }
type ArticleType = {
  _id?: Id<"articles">;
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
  labelDepresja?: boolean;
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

type PublicationUpdateDraft = {
  id?: Id<"article_updates">;
  content: string;
  publishedAt: number;
};

type ArticleBydgoszczanieDraft = {
  displayName?: string;
  aboutHero?: string;
  portraitUrl?: string;
  storyTitle?: string;
  storyDescription?: string;
  gallery?: string[];
};

type SportTeamDraft = {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  color?: string;
  type: "home" | "away";
};

type SportPlayerDraft = {
  id: string;
  name: string;
  number?: string;
  position?: string;
  rating?: number;
};

type SportMatchStatDraft = {
  label: string;
  homeValue: string;
  awayValue: string;
};

type ArticleSportDraft = {
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

type ArticlePoliticsDraft = {
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

type ArticleInvestmentDraft = {
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

type ArticleOurActionsDraft = {
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

type PollOptionDraft = {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  color?: string;
};

type ArticlePollDraft = {
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

type QuizAnswerDraft = {
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

type QuizQuestionDraft = {
  id: string;
  question: string;
  description?: string;
  imageUrl?: string;
  answerType: "single" | "multiple" | "image" | "yes_no" | "choices";
  maxSelections?: number;
  answers: QuizAnswerDraft[];
};

type QuizResultDraft = {
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

type ArticleQuizDraft = {
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

type InterviewParticipantDraft = {
  id: string;
  name: string;
  role?: string;
  imageUrl?: string;
  bio?: string;
  color?: string;
  shortLabel?: string;
  isHost?: boolean;
};

type InterviewBlockDraft = {
  id: string;
  type: "question" | "answer" | "commentary" | "heading" | "quote" | "teaser" | "info_box";
  content: string;
  title?: string;
  speakerId?: string;
  hidden?: boolean;
};

type ArticleInterviewDraft = {
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

type AnalysisMetricDraft = {
  id: string;
  label: string;
  value: string;
  note?: string;
};

type AnalysisBlockDraft = {
  id: string;
  type: "argument" | "counterargument" | "chart" | "data_box" | "expert_quote" | "partial_conclusion" | "sources" | "recommendations";
  title?: string;
  content: string;
  value?: string;
  sourceLabel?: string;
  hidden?: boolean;
};

type ArticleAnalysisDraft = {
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

type ReportCharacterDraft = {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  imageUrl?: string;
  isPrimary?: boolean;
};

type ReportPlaceDraft = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

type ReportBlockDraft = {
  id: string;
  type: "scene" | "place_description" | "hero_quote" | "reporter_note" | "turning_point" | "timeline" | "context_box" | "gallery";
  title?: string;
  content: string;
  imageUrl?: string;
  extra?: string;
  hidden?: boolean;
};

type ArticleReportDraft = {
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

type OpinionBlockDraft = {
  id: string;
  type: "argument" | "counterpoint" | "lead_quote" | "author_note" | "summary";
  title?: string;
  content: string;
  hidden?: boolean;
};

type ArticleOpinionDraft = {
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

type DialogParticipantDraft = {
  id: string;
  name: string;
  role?: string;
  color?: string;
};

type DialogBlockDraft = {
  id: string;
  type: "speaker_a" | "speaker_b" | "speaker_c" | "narrator" | "highlight_quote" | "editor_note";
  speakerId?: string;
  content: string;
  title?: string;
  hidden?: boolean;
};

type ArticleDialogDraft = {
  enabled: boolean;
  description?: string;
  context?: string;
  conversationStyle: "swobodny" | "dynamiczny" | "formalny" | "emocjonalny" | "miejski";
  place?: string;
  ending?: string;
  participants: DialogParticipantDraft[];
  blocks: DialogBlockDraft[];
};

type ArticleAnnouncementDraft = {
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

type ArticleSponsoredDraft = {
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

interface ArticleEditorProps {
  article?: ArticleType;
  onSave?: (id: Id<"articles">) => void;
  onCancel?: () => void;
}

export default function ArticleEditor({ article, onSave, onCancel }: ArticleEditorProps) {
  const createArticle = useMutation(api.articles.create);
  const updateArticle = useMutation(api.articles.update);
  const addUpdate = useMutation(api.articles.addUpdate);
  const updateArticleUpdate = useMutation(api.articles.updateArticleUpdate);
  const removeUpdate = useMutation(api.articles.removeUpdate);
  const clearInterviewBlocks = useMutation((api as any).articles.clearInterviewBlocks);
  const addInterviewBlocksBatch = useMutation((api as any).articles.addInterviewBlocksBatch);
  const generateUploadUrl = useMutation(api.articles.generateUploadUrl);
  const getFileUrl = useMutation(api.articles.getFileUrl);
  const createR2UploadUrl = useAction((api as any).media.createUploadUrl);
  const saveMediaAsset = useMutation((api as any).mediaLibrary.saveAsset);

  const updates = useQuery(api.articles.getUpdates, article?._id ? { articleId: article._id } : "skip");
  const currentUser = useQuery(api.users.currentUser);
  const dbCategories = useQuery(api.settings.getCategories);
  const sportTeams = useQuery(api.sportTeams.list) as any[] | undefined;
  const sportPlayers = useQuery(api.sportPlayers.list) as any[] | undefined;
  const politiciansDirectory = useQuery(api.politicians.list) as any[] | undefined;
  const investmentsDirectory = useQuery(api.investments.list) as any[] | undefined;
  const politicsEntities = useQuery(api.categoryEntities.byCategory, { categoryKey: "polityka" }) as any[] | undefined;
  const sportEntities = useQuery(api.categoryEntities.byCategory, { categoryKey: "sport" }) as any[] | undefined;
  const investmentEntities = useQuery(api.categoryEntities.byCategory, { categoryKey: "inwestycje" }) as any[] | undefined;
  const actionsEntities = useQuery(api.categoryEntities.byCategory, { categoryKey: "nasze_dzialania" }) as any[] | undefined;
  const mediaConfig = useQuery(api.settings.getMediaConfig, {}) as any;

  const [form, setForm] = useState<ArticleType>({
    title: article?.title ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "",
    category: article?.category ?? "miasto",
    imageUrl: article?.imageUrl ?? "",
    imageAuthor: (article as any)?.imageAuthor ?? "",
    author: article?.author ?? "",
    coauthor: article?.coauthor ?? "",
    coauthor2: article?.coauthor2 ?? "",
    coauthor3: article?.coauthor3 ?? "",
    corrector: article?.corrector ?? "",
    publisher: article?.publisher ?? "",
    publishedAt: article?.publishedAt ?? Date.now(),
    updatedAt: article?.updatedAt,
    featured: article?.featured ?? false,
    isPatronage: article?.isPatronage ?? false,
    tags: article?.tags ?? [],
    hideInReels: article?.hideInReels ?? false,
    skipHomepage: article?.skipHomepage ?? false,
    personName: article?.personName ?? "",
    bydgoszczanie: (article as any)?.bydgoszczanie ?? {
      ...createDefaultBydgoszczanie(),
      displayName: article?.personName ?? "",
    },
    sport: (article as any)?.sport ?? createDefaultSport(),
    politics: (article as any)?.politics ?? createDefaultPolitics(),
    investment: (article as any)?.investment ?? createDefaultInvestment(),
    ourActions: (article as any)?.ourActions ?? createDefaultOurActions(),
    sourceName: article?.sourceName ?? "",
    sourceUrl: article?.sourceUrl ?? "",
    expertQuote: article?.expertQuote ?? "",
    slug: article?.slug ?? "",
    articleType: article?.articleType ?? "news",
    status: article?.status ?? "draft",
    layout: article?.layout ?? "standard",
    partnerName: article?.partnerName ?? "",
    partnerUrl: article?.partnerUrl ?? "",
    partnerLogoUrl: article?.partnerLogoUrl ?? "",
    partnerLabel: article?.partnerLabel ?? "",
    seoTitle: article?.seoTitle ?? "",
    seoDescription: article?.seoDescription ?? "",
    allowComments: article?.allowComments ?? true,
    showUpdates: article?.showUpdates ?? false,
    labelUrgent: article?.labelUrgent ?? false,
    labelImportant: article?.labelImportant ?? false,
    labelOurNews: article?.labelOurNews ?? false,
    labelMustKnow: article?.labelMustKnow ?? false,
    labelAuthorArticle: article?.labelAuthorArticle ?? false,
    label18Plus: article?.label18Plus ?? false,
    labelDepresja: article?.labelDepresja ?? false,
    labelBeingUpdated: article?.labelBeingUpdated ?? false,
    bibliography: article?.bibliography ?? "",
    sources: article?.sources ?? "",
    footerInfo: article?.footerInfo ?? "",
    sourceFromContact: article?.sourceFromContact ?? "",
    graphicsLayout: article?.graphicsLayout ?? "default",
    categoryLayout: article?.categoryLayout ?? "default",
    authorFooterStyle: article?.authorFooterStyle ?? "graphic",
    articleElements: article?.articleElements ?? DEFAULT_ARTICLE_ELEMENTS,
    poll: article?.poll ?? createDefaultPoll(),
    quiz: article?.quiz ?? createDefaultQuiz(),
    interview: article?.interview ?? createDefaultInterview(),
    analysis: article?.analysis ?? createDefaultAnalysis(),
    report: article?.report ?? createDefaultReport(),
    opinion: article?.opinion ?? createDefaultOpinion(),
    dialog: article?.dialog ?? createDefaultDialog(),
    announcement: article?.announcement ?? createDefaultAnnouncement(),
    sponsored: article?.sponsored ?? createDefaultSponsored(),
  });

  const [tagInput, setTagInput] = useState("");
  const [showCoauthor, setShowCoauthor] = useState(!!(article?.coauthor && article.coauthor.trim()));
  const [showCoauthor2, setShowCoauthor2] = useState(!!(article?.coauthor2 && article.coauthor2.trim()));
  const [showCoauthor3, setShowCoauthor3] = useState(!!(article?.coauthor3 && article.coauthor3.trim()));
  const [showCorrector, setShowCorrector] = useState(!!(article?.corrector && article.corrector.trim()));
  const [showPublisher, setShowPublisher] = useState(!!(article?.publisher && article.publisher.trim()));
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [isPortraitUploading, setIsPortraitUploading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isPortraitMediaPickerOpen, setIsPortraitMediaPickerOpen] = useState(false);
  const [isGalleryMediaPickerOpen, setIsGalleryMediaPickerOpen] = useState(false);
  const [isPartnerLogoMediaPickerOpen, setIsPartnerLogoMediaPickerOpen] = useState(false);
  const [rightTab, setRightTab] = useState("basic");
  const [bottomTab, setBottomTab] = useState("settings");
  const [bottomCollapsed, setBottomCollapsed] = useState(true);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [publicationUpdates, setPublicationUpdates] = useState<PublicationUpdateDraft[]>([]);
  const [editorMode, setEditorMode] = useState<"visual" | "html" | "preview" | "blocks">("blocks");
  const [contentBlocks, setContentBlocks] = useState<ArticleContentBlock[]>([]);
  const [htmlContent, setHtmlContent] = useState(article?.content ?? "");
  const [slugCopied, setSlugCopied] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!article?.slug);
  const [blocksDropdownOpen, setBlocksDropdownOpen] = useState(false);
  const [blockSearch, setBlockSearch] = useState("");
  const [urlInputModal, setUrlInputModal] = useState<{ type: string; label: string; resolve: (url: string | null) => void } | null>(null);
  const [urlInputValue, setUrlInputValue] = useState("");
  const [blockInsertModal, setBlockInsertModal] = useState<{ type: string } | null>(null);
  const bottomPanelRef = useRef<HTMLElement | null>(null);
  const publicationUpdatesRef = useRef<HTMLDivElement | null>(null);
  const [showUpdateDateField, setShowUpdateDateField] = useState(!!article?.updatedAt);

  // Dirty state tracking
  const initialFormRef = useRef<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const articleId = article?._id;
  const DRAFT_KEY = `article_draft_${articleId ?? "new"}`;

  // Fields excluded from dirty comparison (auto-filled by useEffect, not user-edited)
  const getDirtySnapshot = (f: ArticleType) => {
    const { seoTitle: _st, seoDescription: _sd, ...rest } = f as any;
    return JSON.stringify(rest);
  };

  // Reset baseline when article changes (navigating between articles)
  useEffect(() => {
    // Delay by one tick to let auto-fill effects (seoTitle/seoDescription) settle
    const timer = setTimeout(() => {
      initialFormRef.current = getDirtySnapshot(form);
      setIsDirty(false);
      setShowDraftRecovery(false);
    }, 50);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  // Track dirty state (exclude auto-filled fields)
  useEffect(() => {
    if (initialFormRef.current === "") return;
    setIsDirty(getDirtySnapshot(form) !== initialFormRef.current);
  }, [form]);

  // localStorage draft recovery — check on mount / article change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      // Only show recovery if it's meaningfully different from current form
      if (getDirtySnapshot(parsed) !== getDirtySnapshot(form)) {
        setShowDraftRecovery(true);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  // localStorage draft save every 30s when dirty
  useEffect(() => {
    if (!isDirty) return;
    const interval = setInterval(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty, form, DRAFT_KEY]);

  // beforeunload guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const set = (key: keyof ArticleType, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
    // Clear validation error for this field when user edits it
    if (validationErrors.has(key)) {
      setValidationErrors(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };
  const updateBydgoszczanie = (patch: Partial<ArticleBydgoszczanieDraft>) =>
    setForm((current) => ({
      ...current,
      bydgoszczanie: {
        ...(current.bydgoszczanie ?? createDefaultBydgoszczanie()),
        ...patch,
      },
    }));
  const updateSport = (patch: Partial<ArticleSportDraft>) =>
    setForm((current) => ({
      ...current,
      sport: {
        ...(current.sport ?? createDefaultSport()),
        ...patch,
      },
    }));
  const updatePolitics = (patch: Partial<ArticlePoliticsDraft>) =>
    setForm((current) => ({
      ...current,
      politics: {
        ...(current.politics ?? createDefaultPolitics()),
        ...patch,
      },
    }));
  const updateInvestment = (patch: Partial<ArticleInvestmentDraft>) =>
    setForm((current) => ({
      ...current,
      investment: {
        ...(current.investment ?? createDefaultInvestment()),
        ...patch,
      },
    }));
  const updateOurActions = (patch: Partial<ArticleOurActionsDraft>) =>
    setForm((current) => ({
      ...current,
      ourActions: {
        ...(current.ourActions ?? createDefaultOurActions()),
        ...patch,
      },
    }));

  const categoryOptions = useMemo(() => {
    const activeCategories = dbCategories?.filter((category) => category.isActive !== false) ?? [];
    const staticMap = new Map(CATEGORIES.map((category) => [category.value, category]));
    const mapped = activeCategories
      .map((category) => {
        const fallback = staticMap.get(category.key);
        if (!fallback) return null;
        return {
          ...fallback,
          label: category.label || fallback.label,
        };
      })
      .filter(Boolean) as typeof CATEGORIES;

    if (mapped.length === 0) {
      return CATEGORIES;
    }

    if (!mapped.some((category) => category.value === form.category)) {
      const current = staticMap.get(form.category);
      if (current) {
        mapped.push(current);
      }
    }

    return mapped;
  }, [dbCategories, form.category]);

  const sportEntityOptions = useMemo(() => ({
    leagues: (sportEntities ?? []).filter((entity) => entity.entityType === "sport_league").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    seasons: (sportEntities ?? []).filter((entity) => entity.entityType === "sport_season").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    tables: (sportEntities ?? []).filter((entity) => entity.entityType === "sport_table").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    events: (sportEntities ?? []).filter((entity) => entity.entityType === "sport_event").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
  }), [sportEntities]);

  const politicsEntityOptions = useMemo(() => ({
    groups: (politicsEntities ?? []).filter((entity) => entity.entityType === "political_group").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    positions: (politicsEntities ?? []).filter((entity) => entity.entityType === "political_position").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    materialTypes: (politicsEntities ?? []).filter((entity) => entity.entityType === "political_material_type").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    events: (politicsEntities ?? []).filter((entity) => entity.entityType === "political_event").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
  }), [politicsEntities]);

  const investmentEntityOptions = useMemo(() => ({
    investments: (investmentsDirectory ?? []).map((inv: any) => ({ id: inv._id, label: inv.projectName, description: [inv.projectStatus, inv.location].filter(Boolean).join(" • ") })),
    contractors: (investmentEntities ?? []).filter((entity) => entity.entityType === "investment_contractor").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    locations: (investmentEntities ?? []).filter((entity) => entity.entityType === "investment_location").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    statuses: (investmentEntities ?? []).filter((entity) => entity.entityType === "investment_status").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    phases: (investmentEntities ?? []).filter((entity) => entity.entityType === "investment_phase").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    types: (investmentEntities ?? []).filter((entity) => entity.entityType === "investment_type").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
  }), [investmentEntities, investmentsDirectory]);

  const actionEntityOptions = useMemo(() => ({
    partners: (actionsEntities ?? []).filter((entity) => entity.entityType === "action_partner").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    projects: (actionsEntities ?? []).filter((entity) => entity.entityType === "action_project").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    campaigns: (actionsEntities ?? []).filter((entity) => entity.entityType === "action_campaign").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    actionTypes: (actionsEntities ?? []).filter((entity) => entity.entityType === "action_type").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
    results: (actionsEntities ?? []).filter((entity) => entity.entityType === "action_result").map((entity) => ({ id: entity._id, label: entity.name, description: entity.description })),
  }), [actionsEntities]);

  const sportTeamOptions = useMemo(
    () => (sportTeams ?? []).map((team) => ({ id: team._id, label: team.name, description: [team.sportType, team.league].filter(Boolean).join(" • ") })),
    [sportTeams],
  );
  const sportPlayerOptions = useMemo(
    () => (sportPlayers ?? []).map((player) => ({ id: player._id, label: player.fullName, description: [player.teamName, player.position].filter(Boolean).join(" • ") })),
    [sportPlayers],
  );
  const politicianOptions = useMemo(
    () => (politiciansDirectory ?? []).map((politician) => ({ id: politician._id, label: politician.fullName, description: [politician.party, politician.position].filter(Boolean).join(" • ") })),
    [politiciansDirectory],
  );

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && form.title) {
      set("slug", generateSlug(form.title));
    }
  }, [form.title, slugManuallyEdited]);

  useEffect(() => {
    if (form.category !== "bydgoszczanie") return;
    const displayName = form.bydgoszczanie?.displayName?.trim() ?? "";
    if (displayName === (form.personName ?? "").trim()) return;
    set("personName", displayName);
  }, [form.category, form.bydgoszczanie?.displayName]);

  // Auto-assign logged-in user as author for new articles
  useEffect(() => {
    if (!article && currentUser?.name && !form.author) {
      set("author", currentUser.name);
    }
  }, [currentUser, article]);

  useEffect(() => {
    if (updates) {
      setPublicationUpdates(
        [...updates]
          .sort((a, b) => a.publishedAt - b.publishedAt)
          .map((update) => ({
            id: update._id,
            content: update.content,
            publishedAt: update.publishedAt,
          }))
      );
    }
  }, [updates]);

  // Track whether SEO fields have been manually edited
  const seoManuallyEdited = useRef({ title: false, description: false });

  useEffect(() => {
    const plainContent = form.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const autoDescription = (form.excerpt.trim() || plainContent).slice(0, 160);
    setForm((current) => {
      const updates: Partial<typeof current> = {};
      // Only auto-fill seoTitle if not manually edited and currently matches old title or is empty
      if (!seoManuallyEdited.current.title) {
        updates.seoTitle = current.title;
      }
      // Only auto-fill seoDescription if not manually edited
      if (!seoManuallyEdited.current.description) {
        updates.seoDescription = autoDescription;
      }
      if (Object.keys(updates).length === 0) return current;
      // Skip update if values are already the same
      if (
        (!('seoTitle' in updates) || current.seoTitle === updates.seoTitle) &&
        (!('seoDescription' in updates) || current.seoDescription === updates.seoDescription)
      ) {
        return current;
      }
      return { ...current, ...updates };
    });
  }, [form.title, form.excerpt, form.content]);

  useEffect(() => {
    if (form.articleType === "quiz") {
      setForm((current) => {
        if (current.quiz?.enabled && current.quiz.title) return current;
        return {
          ...current,
          quiz: {
            ...(current.quiz ?? createDefaultQuiz()),
            enabled: true,
            title: current.quiz?.title || current.title,
            description: current.quiz?.description || current.excerpt,
          },
        };
      });
    }
  }, [form.articleType, form.title, form.excerpt]);

  useEffect(() => {
    if (form.articleType === "interview") {
      setForm((current) => {
        if (current.interview?.enabled) return current;
        return {
          ...current,
          interview: {
            ...(current.interview ?? createDefaultInterview()),
            enabled: true,
          },
        };
      });
    }
  }, [form.articleType]);

  useEffect(() => {
    if (form.articleType === "analysis") {
      setForm((current) => {
        if (current.analysis?.enabled) return current;
        return {
          ...current,
          analysis: {
            ...(current.analysis ?? createDefaultAnalysis()),
            enabled: true,
          },
        };
      });
    }
  }, [form.articleType]);

  useEffect(() => {
    if (form.articleType === "report") {
      setForm((current) => {
        if (current.report?.enabled) return current;
        return {
          ...current,
          report: {
            ...(current.report ?? createDefaultReport()),
            enabled: true,
          },
        };
      });
    }
  }, [form.articleType]);

  useEffect(() => {
    if (form.articleType === "opinion") {
      setForm((current) => {
        if (current.opinion?.enabled) return current;
        return {
          ...current,
          opinion: {
            ...(current.opinion ?? createDefaultOpinion()),
            enabled: true,
          },
        };
      });
    }
  }, [form.articleType]);

  useEffect(() => {
    if (form.articleType === "dialog") {
      setForm((current) => {
        if (current.dialog?.enabled) return current;
        return {
          ...current,
          dialog: {
            ...(current.dialog ?? createDefaultDialog()),
            enabled: true,
          },
        };
      });
    }
  }, [form.articleType]);

  useEffect(() => {
    if (form.articleType === "press_release") {
      setForm((current) => {
        if (current.announcement?.enabled) return current;
        return {
          ...current,
          announcement: {
            ...(current.announcement ?? createDefaultAnnouncement()),
            enabled: true,
          },
        };
      });
    }
  }, [form.articleType]);

  useEffect(() => {
    if (form.articleType === "sponsored") {
      setForm((current) => {
        if (current.sponsored?.enabled) return current;
        return {
          ...current,
          sponsored: {
            ...(current.sponsored ?? createDefaultSponsored()),
            enabled: true,
          },
        };
      });
    }
  }, [form.articleType]);

  useEffect(() => {
    if (form.publishedAt > Date.now()) {
      // Future date: always treat as scheduled (even if currently published)
      if (form.status !== "scheduled") {
        set("status", "scheduled");
      }
      return;
    }

    // Past/now date: if was scheduled, revert to appropriate status
    if (form.status === "scheduled") {
      set("status", article?.status === "published" ? "published" : "draft");
    }
  }, [form.publishedAt]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: false }),
      TextStyle,
      Placeholder.configure({ placeholder: "Zacznij pisać treść artykułu..." }),
    ],
    content: article?.content ?? "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setForm(f => ({ ...f, content: html }));
      setHtmlContent(html);
    },
  });

  const bydgoszczanieAboutEditor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      LinkExtension.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Opisz bohatera: kim jest, czym sie zajmuje, skad pochodzi, co go wyroznia..." }),
    ],
    content: form.bydgoszczanie?.aboutHero ?? "",
    onUpdate: ({ editor }) => updateBydgoszczanie({ aboutHero: editor.getHTML() }),
  });

  const bydgoszczanieStoryEditor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      LinkExtension.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Dodaj ciekawostki, osiagniecia, biografie lub inna dodatkowa sekcje..." }),
    ],
    content: form.bydgoszczanie?.storyDescription ?? "",
    onUpdate: ({ editor }) => updateBydgoszczanie({ storyDescription: editor.getHTML() }),
  });

  const handleHtmlChange = useCallback((val: string) => {
    setHtmlContent(val);
    setForm(f => ({ ...f, content: val }));
  }, []);

  const syncHtmlToEditor = useCallback(() => {
    if (editor && htmlContent !== editor.getHTML()) {
      editor.commands.setContent(htmlContent);
    }
  }, [editor, htmlContent]);

  useEffect(() => {
    const nextContent = form.bydgoszczanie?.aboutHero ?? "";
    if (bydgoszczanieAboutEditor && bydgoszczanieAboutEditor.getHTML() !== nextContent) {
      bydgoszczanieAboutEditor.commands.setContent(nextContent || "<p></p>");
    }
  }, [bydgoszczanieAboutEditor, form.bydgoszczanie?.aboutHero]);

  useEffect(() => {
    const nextContent = form.bydgoszczanie?.storyDescription ?? "";
    if (bydgoszczanieStoryEditor && bydgoszczanieStoryEditor.getHTML() !== nextContent) {
      bydgoszczanieStoryEditor.commands.setContent(nextContent || "<p></p>");
    }
  }, [bydgoszczanieStoryEditor, form.bydgoszczanie?.storyDescription]);

  const wordCount = form.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const isQuizArticle = form.articleType === "quiz";
  const isInterviewArticle = form.articleType === "interview";
  const isAnalysisArticle = form.articleType === "analysis";
  const isReportArticle = form.articleType === "report";
  const isOpinionArticle = form.articleType === "opinion";
  const isDialogArticle = form.articleType === "dialog";
  const isAnnouncementArticle = form.articleType === "press_release";
  const isSponsoredArticle = form.articleType === "sponsored";
  const isBydgoszczanieCategory = form.category === "bydgoszczanie";
  const isSportCategory = form.category === "sport";
  const isPoliticsCategory = form.category === "polityka";
  const isInvestmentCategory = form.category === "inwestycje";
  const isOurActionsCategory = form.category === "nasze_dzialania";
  const now = Date.now();
  const isFuturePublication = form.publishedAt > now;
  const activeLabelsCount = [
    form.labelUrgent,
    form.labelImportant,
    form.labelOurNews,
    form.labelMustKnow,
    form.labelAuthorArticle,
    form.label18Plus,
    form.labelDepresja,
    form.labelBeingUpdated,
  ].filter(Boolean).length;

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !form.tags?.includes(tag)) set("tags", [...(form.tags ?? []), tag]);
    setTagInput("");
  };
  const removeTag = (tag: string) => set("tags", form.tags?.filter(t => t !== tag) ?? []);
  const addPublicationUpdateDraft = () => {
    set("showUpdates", true);
    setBottomCollapsed(false);
    setBottomTab("additional");
    setPublicationUpdates((items) => [
      ...items,
      {
        content: "",
        publishedAt: Date.now(),
      },
    ]);
    requestAnimationFrame(() => {
      publicationUpdatesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };
  const togglePublicationUpdates = () => {
    const nextValue = !form.showUpdates;
    set("showUpdates", nextValue);
    if (nextValue && publicationUpdates.length === 0) {
      setPublicationUpdates([{ content: "", publishedAt: Date.now() }]);
    }
    if (nextValue) {
      setBottomCollapsed(false);
      setBottomTab("additional");
      requestAnimationFrame(() => {
        publicationUpdatesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };
  const updatePublicationUpdateDraft = (index: number, patch: Partial<PublicationUpdateDraft>) => {
    setPublicationUpdates((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };
  const removePublicationUpdateDraft = async (index: number) => {
    const target = publicationUpdates[index];
    if (target?.id) {
      await removeUpdate({ id: target.id });
      return;
    }
    setPublicationUpdates((items) => items.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const upload = await uploadMediaAsset({
        file,
        kind: "article",
        mediaConfig,
        createR2Upload: createR2UploadUrl,
        fallbackGenerateUploadUrl: generateUploadUrl,
        fallbackGetFileUrl: getFileUrl,
      });
      await saveMediaAsset({
        name: upload.file.name,
        originalFileName: file.name,
        url: upload.url,
        storageProvider: upload.storageProvider,
        mediaType: "image",
        sourceKind: "article",
        folder: form.category ? `Artykuly / ${form.category}` : "Artykuly / glowny",
        mimeType: upload.file.type,
        size: upload.file.size,
        width: upload.width,
        height: upload.height,
      });
      if (upload.url) set("imageUrl", upload.url);
      if (upload.storageProvider === "r2") {
        toast.success("Zdjecie przeslane do Cloudflare R2");
      } else {
        toast.warning("R2 nie odpowiedzialo. Uzyto zapasowego storage Convex.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Błąd przesyłania zdjęcia");
    } finally {
      e.target.value = "";
      setIsUploading(false);
    }
  };

  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsPortraitUploading(true);
    try {
      const upload = await uploadMediaAsset({
        file,
        kind: "article",
        mediaConfig,
        createR2Upload: createR2UploadUrl,
        fallbackGenerateUploadUrl: generateUploadUrl,
        fallbackGetFileUrl: getFileUrl,
      });
      await saveMediaAsset({
        name: upload.file.name,
        originalFileName: file.name,
        url: upload.url,
        storageProvider: upload.storageProvider,
        mediaType: "image",
        sourceKind: "article",
        folder: "Artykuly / Bydgoszczanie / portrety",
        mimeType: upload.file.type,
        size: upload.file.size,
        width: upload.width,
        height: upload.height,
      });
      if (upload.url) updateBydgoszczanie({ portraitUrl: upload.url });
      if (upload.storageProvider === "r2") {
        toast.success("Portret bohatera przeslany do Cloudflare R2");
      } else {
        toast.warning("R2 nie odpowiedzialo. Uzyto zapasowego storage Convex.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Blad przesylania portretu");
    } finally {
      e.target.value = "";
      setIsPortraitUploading(false);
    }
  };

  const handleBydgoszczanieGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setIsGalleryUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const upload = await uploadMediaAsset({
          file,
          kind: "article",
          mediaConfig,
          createR2Upload: createR2UploadUrl,
          fallbackGenerateUploadUrl: generateUploadUrl,
          fallbackGetFileUrl: getFileUrl,
        });
        await saveMediaAsset({
          name: upload.file.name,
          originalFileName: file.name,
          url: upload.url,
          storageProvider: upload.storageProvider,
          mediaType: "image",
          sourceKind: "article",
          folder: "Artykuly / Bydgoszczanie / galeria",
          mimeType: upload.file.type,
          size: upload.file.size,
          width: upload.width,
          height: upload.height,
        });
        if (upload.url) uploadedUrls.push(upload.url);
      }
      if (uploadedUrls.length) {
        updateBydgoszczanie({
          gallery: [...(form.bydgoszczanie?.gallery ?? []), ...uploadedUrls],
        });
        toast.success(uploadedUrls.length === 1 ? "Zdjecie dodane do galerii" : `Dodano ${uploadedUrls.length} zdjec do galerii`);
      }
    } catch (error: any) {
      toast.error(error?.message || "Blad przesylania galerii");
    } finally {
      e.target.value = "";
      setIsGalleryUploading(false);
    }
  };

  const handleSave = async (statusOverride?: string) => {
    const normalizedInterviewDraft = isInterviewArticle ? normalizeInterviewDraft(form.interview) : undefined;
    const errors = new Set<string>();
    const errorMessages: string[] = [];

    if (!form.title.trim()) { errors.add("title"); errorMessages.push("Tytuł jest wymagany"); }
    if (!form.excerpt.trim()) { errors.add("excerpt"); errorMessages.push("Lead jest wymagany"); }
    if (!isQuizArticle && !isInterviewArticle && !isAnalysisArticle && !isReportArticle && !isOpinionArticle && !isDialogArticle && !isAnnouncementArticle && !isSponsoredArticle && editorMode !== "blocks" && (!form.content.trim() || form.content === "<p></p>")) { errors.add("content"); errorMessages.push("Treść jest wymagana"); }
    if (!form.author.trim()) { errors.add("author"); errorMessages.push("Autor jest wymagany"); }
    if (isBydgoszczanieCategory && !form.bydgoszczanie?.displayName?.trim()) { errors.add("bydgoszczanie"); errorMessages.push("Podaj imię i nazwisko bohatera"); }
    if (isSportCategory && !form.sport?.sportType) { errors.add("sport"); errorMessages.push("Wybierz dyscyplinę sportową"); }
    if (isInvestmentCategory && !form.investment?.projectName?.trim()) { errors.add("investment"); errorMessages.push("Podaj nazwę projektu inwestycji"); }
    if (isQuizArticle) {
      if (!form.quiz?.title.trim()) { errors.add("quiz_title"); errorMessages.push("Tytuł quizu jest wymagany"); }
      if (!form.quiz?.questions.length) { errors.add("quiz_questions"); errorMessages.push("Quiz musi mieć przynajmniej jedno pytanie"); }
      if (form.quiz?.questions.some((question) => !question.question.trim() || question.answers.length < 2)) {
        errors.add("quiz_questions"); errorMessages.push("Każde pytanie quizu musi mieć treść i minimum 2 odpowiedzi");
      }
    }
    if (isInterviewArticle) {
      if (!normalizedInterviewDraft?.participants.length) { errors.add("interview_participants"); errorMessages.push("Wywiad musi mieć przynajmniej jednego rozmówcę"); }
      if (!normalizedInterviewDraft?.blocks.length) { errors.add("interview_blocks"); errorMessages.push("Wywiad musi mieć przynajmniej jeden blok rozmowy"); }
    }
    if (isAnalysisArticle) {
      if (!form.analysis?.thesis?.trim() && !form.analysis?.mainQuestion?.trim()) {
        errors.add("analysis_thesis"); errorMessages.push("Analiza musi mieć tezę albo główne pytanie");
      }
      if (!form.analysis?.arguments.some((item) => item.trim()) && !form.analysis?.blocks.some((block) => block.content.trim())) {
        errors.add("analysis_arguments"); errorMessages.push("Analiza musi zawierać przynajmniej jeden argument lub blok");
      }
    }
    if (isReportArticle) {
      if (!form.report?.intro?.trim()) { errors.add("report_intro"); errorMessages.push("Reportaż musi mieć intro"); }
      if (!form.report?.blocks.some((block) => block.content.trim())) {
        errors.add("report_blocks"); errorMessages.push("Reportaż musi mieć przynajmniej jedną scenę");
      }
    }
    if (isOpinionArticle) {
      if (!form.opinion?.thesis?.trim()) { errors.add("opinion_thesis"); errorMessages.push("Opinia musi mieć tezę autora"); }
      if (!form.opinion?.arguments.some((item) => item.trim()) && !form.opinion?.blocks.some((block) => block.content.trim())) {
        errors.add("opinion_arguments"); errorMessages.push("Opinia musi mieć przynajmniej jeden argument lub blok");
      }
    }
    if (isDialogArticle) {
      if (!form.dialog?.participants.length || !form.dialog.blocks.some((block) => block.content.trim())) {
        errors.add("dialog"); errorMessages.push("Dialog musi mieć uczestników i przynajmniej jedną wypowiedź");
      }
    }
    if (isAnnouncementArticle) {
      if (!form.announcement?.institution?.trim()) { errors.add("announcement_institution"); errorMessages.push("Komunikat musi mieć instytucję lub źródło"); }
    }
    if (isSponsoredArticle) {
      if (!form.sponsored?.partnerName?.trim()) { errors.add("sponsored_partner"); errorMessages.push("Materiał sponsorowany musi mieć nazwę partnera"); }
    }

    if (errors.size > 0) {
      setValidationErrors(errors);
      errorMessages.forEach((msg) => toast.error(msg));
      return;
    }
    setValidationErrors(new Set());
    setSaving(true);
    try {
      const queuedUpdates = publicationUpdates.filter((item) => item.content.trim());
      // Guard: if saving as "published" but date is in the future, treat as "scheduled"
      const rawStatus = statusOverride ?? form.status ?? "draft";
      const finalStatus = (rawStatus === "published" && form.publishedAt > Date.now() ? "scheduled" : rawStatus) as any;
      const normalizedQuiz = isQuizArticle && form.quiz && (form.quiz.enabled || form.quiz.title.trim())
        ? {
            ...form.quiz,
            enabled: true,
            status: finalStatus === "published" || finalStatus === "scheduled"
              ? "active"
              : form.quiz.status,
          }
        : undefined;
      const normalizedInterview = isInterviewArticle && normalizedInterviewDraft && (normalizedInterviewDraft.enabled || normalizedInterviewDraft.blocks.length > 0)
        ? {
            ...normalizedInterviewDraft,
            blocks: [],
            enabled: true,
            status: finalStatus === "published" || finalStatus === "scheduled"
              ? "active"
              : normalizedInterviewDraft.status,
          }
        : undefined;
      const normalizedBydgoszczanie = isBydgoszczanieCategory && form.bydgoszczanie && (
        form.bydgoszczanie.displayName?.trim()
        || form.bydgoszczanie.aboutHero?.trim()
        || form.bydgoszczanie.portraitUrl?.trim()
        || form.bydgoszczanie.storyTitle?.trim()
        || form.bydgoszczanie.storyDescription?.trim()
        || form.bydgoszczanie.gallery?.length
      ) ? {
        displayName: form.bydgoszczanie.displayName?.trim() || undefined,
        aboutHero: form.bydgoszczanie.aboutHero?.trim() || undefined,
        portraitUrl: form.bydgoszczanie.portraitUrl?.trim() || undefined,
        storyTitle: form.bydgoszczanie.storyTitle?.trim() || undefined,
        storyDescription: form.bydgoszczanie.storyDescription?.trim() || undefined,
        gallery: form.bydgoszczanie.gallery?.filter((item) => item.trim()) || undefined,
      } : undefined;
      const normalizedSport = isSportCategory && form.sport ? {
        ...form.sport,
        teamIds: form.sport.teamIds?.filter(Boolean) || undefined,
        playerIds: form.sport.playerIds?.filter(Boolean) || undefined,
        leagueId: form.sport.leagueId || undefined,
        seasonId: form.sport.seasonId || undefined,
        tableId: form.sport.tableId || undefined,
        eventId: form.sport.eventId || undefined,
        matchDate: form.sport.matchDate?.trim() || undefined,
        matchLocation: form.sport.matchLocation?.trim() || undefined,
        league: form.sport.league?.trim() || undefined,
        round: form.sport.round?.trim() || undefined,
        leagueTableUrl: form.sport.leagueTableUrl?.trim() || undefined,
        homeScore: form.sport.homeScore?.trim() || undefined,
        awayScore: form.sport.awayScore?.trim() || undefined,
        scorers: form.sport.scorers?.filter(Boolean).length ? form.sport.scorers.filter(Boolean) : undefined,
        yellowCards: form.sport.yellowCards?.filter(Boolean).length ? form.sport.yellowCards.filter(Boolean) : undefined,
        redCards: form.sport.redCards?.filter(Boolean).length ? form.sport.redCards.filter(Boolean) : undefined,
        matchHighlights: form.sport.matchHighlights?.filter(Boolean).length ? form.sport.matchHighlights.filter(Boolean) : undefined,
        homeLineup: form.sport.homeLineup?.filter((p) => p.name?.trim()).length ? form.sport.homeLineup.filter((p) => p.name?.trim()) : undefined,
        awayLineup: form.sport.awayLineup?.filter((p) => p.name?.trim()).length ? form.sport.awayLineup.filter((p) => p.name?.trim()) : undefined,
        matchStats: form.sport.matchStats?.filter((s) => s.label?.trim()).length ? form.sport.matchStats.filter((s) => s.label?.trim()) : undefined,
      } : undefined;
      const normalizedPoliticalTimeline = [
        ...politicsEntityOptions.events
          .filter((item) => (form.politics?.eventIds ?? []).includes(item.id))
          .map((item) => ({ id: item.id, date: new Date().toISOString(), title: item.label, description: item.description ?? "", type: "inne" as const })),
        ...(form.politics?.timeline?.filter((item) => item.title?.trim()).map((item) => ({ ...item, description: item.description ?? "", type: item.type ?? "inne" })) ?? []),
      ];
      const normalizedPoliticalParties = politicsEntityOptions.groups
        .filter((item) => (form.politics?.groupIds ?? []).includes(item.id))
        .map((item) => item.label)
        .filter(Boolean);
      const normalizedRelatedPoliticians = (politiciansDirectory ?? [])
        .filter((item) => (form.politics?.politicianIds ?? []).includes(item._id))
        .map((item) => ({
          id: item._id,
          fullName: item.fullName,
          firstName: item.firstName,
          lastName: item.lastName,
          photo: item.photo,
          party: item.party,
          position: item.position,
          bio: item.bio,
          facebookUrl: item.facebookUrl,
          twitterUrl: item.twitterUrl,
          websiteUrl: item.websiteUrl,
        }));
      const normalizedActionPartners = actionEntityOptions.partners
        .filter((item) => (form.ourActions?.partnerIds ?? []).includes(item.id))
        .map((item) => ({ id: item.id, name: item.label, url: undefined, logo: undefined }));
      const normalizedPolitics = isPoliticsCategory && form.politics ? {
        ...form.politics,
        politicianIds: form.politics.politicianIds?.filter(Boolean) || undefined,
        groupIds: form.politics.groupIds?.filter(Boolean) || undefined,
        positionIds: form.politics.positionIds?.filter(Boolean) || undefined,
        materialTypeId: form.politics.materialTypeId?.trim() || undefined,
        eventIds: form.politics.eventIds?.filter(Boolean) || undefined,
        politicalContext: form.politics.politicalContext?.trim() || undefined,
        parties: normalizedPoliticalParties.length ? normalizedPoliticalParties : undefined,
        topic: form.politics.topic?.trim() || undefined,
        timeline: normalizedPoliticalTimeline.length ? normalizedPoliticalTimeline : undefined,
        relatedLegislation: form.politics.relatedLegislation?.trim() || undefined,
        politicians: normalizedRelatedPoliticians.length ? normalizedRelatedPoliticians : undefined,
        mainPoliticianId: form.politics.mainPoliticianId?.trim() || undefined,
        party: form.politics.party?.trim() || undefined,
      } : undefined;
      const normalizedInvestment = isInvestmentCategory && form.investment ? {
        ...form.investment,
        investmentIds: form.investment.investmentIds?.filter(Boolean) || undefined,
        contractorIds: form.investment.contractorIds?.filter(Boolean) || undefined,
        locationIds: form.investment.locationIds?.filter(Boolean) || undefined,
        statusIds: form.investment.statusIds?.filter(Boolean) || undefined,
        phaseIds: form.investment.phaseIds?.filter(Boolean) || undefined,
        typeIds: form.investment.typeIds?.filter(Boolean) || undefined,
        projectName: form.investment.projectName.trim(),
        location: form.investment.location?.trim() || undefined,
        startDate: form.investment.startDate?.trim() || undefined,
        endDate: form.investment.endDate?.trim() || undefined,
        estimatedEndDate: form.investment.estimatedEndDate?.trim() || undefined,
        budget: form.investment.budget?.trim() || undefined,
        contractor: form.investment.contractor?.trim() || undefined,
        investor: form.investment.investor?.trim() || undefined,
        mapUrl: form.investment.mapUrl?.trim() || undefined,
        impactDescription: form.investment.impactDescription?.trim() || undefined,
        timeline: form.investment.timeline?.filter((item) => item.title?.trim()) || undefined,
        beforeImages: form.investment.beforeImages?.filter(Boolean) || undefined,
        afterImages: form.investment.afterImages?.filter(Boolean) || undefined,
        district: form.investment.district?.trim() || undefined,
        linkedInvestmentId: form.investment.linkedInvestmentId?.trim() || undefined,
      } : undefined;
      const normalizedOurActions = isOurActionsCategory && form.ourActions ? {
        ...form.ourActions,
        partnerIds: form.ourActions.partnerIds?.filter(Boolean) || undefined,
        projectIds: form.ourActions.projectIds?.filter(Boolean) || undefined,
        campaignIds: form.ourActions.campaignIds?.filter(Boolean) || undefined,
        actionTypeId: form.ourActions.actionTypeId?.trim() || undefined,
        resultIds: form.ourActions.resultIds?.filter(Boolean) || undefined,
        startDate: form.ourActions.startDate?.trim() || undefined,
        endDate: form.ourActions.endDate?.trim() || undefined,
        results: form.ourActions.results?.trim() || undefined,
        participants: form.ourActions.participants?.trim() || undefined,
        impact: form.ourActions.impact?.trim() || undefined,
        ctaLabel: form.ourActions.ctaLabel?.trim() || undefined,
        ctaUrl: form.ourActions.ctaUrl?.trim() || undefined,
        videoUrl: form.ourActions.videoUrl?.trim() || undefined,
        partners: normalizedActionPartners.length ? normalizedActionPartners : undefined,
        milestones: form.ourActions.milestones?.filter((item) => item.title?.trim()) || undefined,
        gallery: form.ourActions.gallery?.filter(Boolean) || undefined,
      } : undefined;
      const normalizedContent = isInterviewArticle ? "<p>[interview]</p>"
        : isAnalysisArticle ? (form.content.trim() && form.content !== "<p></p>" ? form.content : "<p>[analysis]</p>")
        : isReportArticle ? (form.content.trim() && form.content !== "<p></p>" ? form.content : "<p>[report]</p>")
        : isOpinionArticle ? (form.content.trim() && form.content !== "<p></p>" ? form.content : "<p>[opinion]</p>")
        : isDialogArticle ? (form.content.trim() && form.content !== "<p></p>" ? form.content : "<p>[dialog]</p>")
        : isAnnouncementArticle ? (form.content.trim() && form.content !== "<p></p>" ? form.content : "<p>[announcement]</p>")
        : isSponsoredArticle ? (form.content.trim() && form.content !== "<p></p>" ? form.content : "<p>[sponsored]</p>")
        : isQuizArticle ? (form.content.trim() && form.content !== "<p></p>" ? form.content : "<p>[quiz]</p>")
        : form.content;
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: normalizedContent,
        author: form.author,
        publishedAt: form.publishedAt,
        status: finalStatus,
        category: form.category as any,
        articleType: form.articleType as any,
        layout: form.layout as any,
        featured: form.featured,
        isPatronage: form.isPatronage,
        tags: form.tags?.length ? form.tags : undefined,
        hideInReels: form.hideInReels,
        skipHomepage: form.skipHomepage,
        imageUrl: form.imageUrl || undefined,
        imageAuthor: form.imageAuthor || undefined,
        coauthor: form.coauthor || undefined,
        coauthor2: form.coauthor2 || undefined,
        coauthor3: form.coauthor3 || undefined,
        corrector: form.corrector || undefined,
        publisher: form.publisher || undefined,
        updatedAt: form.updatedAt || undefined,
        personName: (isBydgoszczanieCategory ? normalizedBydgoszczanie?.displayName : form.personName)?.trim() || undefined,
        bydgoszczanie: normalizedBydgoszczanie,
        sport: normalizedSport,
        politics: normalizedPolitics,
        investment: normalizedInvestment,
        ourActions: normalizedOurActions,
        sourceName: form.sourceName || undefined,
        sourceUrl: form.sourceUrl || undefined,
        expertQuote: form.expertQuote || undefined,
        slug: form.slug || undefined,
        partnerName: form.partnerName || undefined,
        partnerUrl: form.partnerUrl || undefined,
        partnerLogoUrl: form.partnerLogoUrl || undefined,
        partnerLabel: form.partnerLabel || undefined,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        allowComments: form.allowComments,
        showUpdates: form.showUpdates,
        labelUrgent: form.labelUrgent,
        labelImportant: form.labelImportant,
        labelOurNews: form.labelOurNews,
        labelMustKnow: form.labelMustKnow,
        labelAuthorArticle: form.labelAuthorArticle,
        label18Plus: form.label18Plus,
        labelDepresja: form.labelDepresja,
        labelBeingUpdated: form.labelBeingUpdated,
        bibliography: form.bibliography || undefined,
        sources: form.sources || undefined,
        footerInfo: form.footerInfo || undefined,
        sourceFromContact: form.sourceFromContact || undefined,
        graphicsLayout: form.graphicsLayout || undefined,
        categoryLayout: form.categoryLayout || undefined,
        authorFooterStyle: form.authorFooterStyle || undefined,
        articleElements: form.articleElements?.length ? form.articleElements : undefined,
        poll: form.poll && (form.poll.enabled || form.poll.title.trim()) ? form.poll : undefined,
        quiz: normalizedQuiz,
        interview: normalizedInterview,
        analysis: isAnalysisArticle && form.analysis && (
          form.analysis.enabled
          || !!form.analysis.thesis?.trim()
          || !!form.analysis.mainQuestion?.trim()
          || form.analysis.blocks.length > 0
        ) ? form.analysis : undefined,
        report: isReportArticle && form.report && (
          form.report.enabled
          || !!form.report.intro?.trim()
          || form.report.blocks.length > 0
        ) ? form.report : undefined,
        opinion: isOpinionArticle && form.opinion && (
          form.opinion.enabled
          || !!form.opinion.thesis?.trim()
          || form.opinion.blocks.length > 0
        ) ? form.opinion : undefined,
        dialog: isDialogArticle && form.dialog && (
          form.dialog.enabled
          || !!form.dialog.description?.trim()
          || form.dialog.blocks.length > 0
        ) ? form.dialog : undefined,
        announcement: isAnnouncementArticle && form.announcement && (
          form.announcement.enabled
          || !!form.announcement.institution?.trim()
        ) ? form.announcement : undefined,
        sponsored: isSponsoredArticle && form.sponsored && (
          form.sponsored.enabled
          || !!form.sponsored.partnerName?.trim()
        ) ? form.sponsored : undefined,
      };
      let targetArticleId = article?._id;

      if (targetArticleId) {
        await updateArticle({ id: targetArticleId, ...payload });
        toast.success("Artykuł zaktualizowany");
      } else {
        const id = await createArticle(payload);
        targetArticleId = id;
        toast.success("Artykuł zapisany");
      }

      if (targetArticleId && queuedUpdates.length > 0) {
        for (let index = 0; index < queuedUpdates.length; index += 1) {
          const updateItem = queuedUpdates[index];
          if (updateItem.id) {
            await updateArticleUpdate({
              id: updateItem.id,
              content: updateItem.content.trim(),
              publishedAt: updateItem.publishedAt,
            });
          } else {
            await addUpdate({
              articleId: targetArticleId,
              title: `Aktualizacja ${index + 1}`,
              content: updateItem.content.trim(),
              author: form.author,
              publishedAt: updateItem.publishedAt,
            });
          }
        }
      }

      if (targetArticleId && isInterviewArticle && normalizedInterviewDraft) {
        await clearInterviewBlocks({ articleId: targetArticleId });
        const blocks = normalizedInterviewDraft.blocks.map(({ type, content, title, speakerId, hidden }: { type: string; content: string; title?: string; speakerId?: string; hidden?: boolean }) => ({
          type,
          content,
          title,
          speakerId,
          hidden,
        }));
        const batchSize = 20;
        for (let index = 0; index < blocks.length; index += batchSize) {
          await addInterviewBlocksBatch({
            articleId: targetArticleId,
            startOrder: index,
            blocks: blocks.slice(index, index + batchSize),
          });
        }
      }

      // Clear localStorage draft and reset dirty state after successful save
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      initialFormRef.current = JSON.stringify(form);
      setIsDirty(false);
      onSave?.(targetArticleId!);
    } catch (err: any) { toast.error(err.message ?? "Błąd zapisu"); }
    finally { setSaving(false); }
  };

  const copySlugUrl = () => {
    const url = `${window.location.origin}/${form.slug || article?._id}`;
    navigator.clipboard.writeText(url);
    setSlugCopied(true);
    setTimeout(() => setSlugCopied(false), 2000);
    toast.success("Link skopiowany");
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === form.status) ?? STATUS_OPTIONS[0];
  const StatusIcon = currentStatus.icon;

  const [extraSources, setExtraSources] = useState<Array<{ name: string; url: string }>>(
    article?.sourceFromContact ? (() => { try { return JSON.parse(article.sourceFromContact); } catch { return []; } })() : []
  );

  const addExtraSource = () => setExtraSources(s => [...s, { name: "", url: "" }]);
  const updateExtraSource = (i: number, field: "name" | "url", val: string) => {
    const updated = extraSources.map((src, idx) => idx === i ? { ...src, [field]: val } : src);
    setExtraSources(updated);
    set("sourceFromContact", JSON.stringify(updated));
  };
  const removeExtraSource = (i: number) => {
    const updated = extraSources.filter((_, idx) => idx !== i);
    setExtraSources(updated);
    set("sourceFromContact", JSON.stringify(updated));
  };

  const insertBlock = async (type: string) => {
    if (!editor) return;
    setBlocksDropdownOpen(false);
    switch (type) {
      case "separator":
        editor.chain().focus().insertContent(`<hr class="article-divider" />`).run();
        break;
      case "separator_label":
        editor.chain().focus().insertContent(`<div class="article-divider-label"><span>Kontynuacja</span></div>`).run();
        break;
      case "quote":
        setBlocksDropdownOpen(false);
        setBlockInsertModal({ type: "quote" });
        return;
      case "pullquote_large":
        setBlocksDropdownOpen(false);
        setBlockInsertModal({ type: "pullquote_large" });
        return;
      case "list":
        editor.chain().focus().insertContent(`<ul><li>Pierwszy ważny punkt dla czytelnika</li><li>Drugi punkt z konkretem lub liczbą</li><li>Trzeci punkt podsumowujący</li></ul>`).run();
        break;
      case "orderedlist":
        editor.chain().focus().insertContent(`<ol><li>Pierwszy etap wydarzeń</li><li>Drugi etap z rozwinięciem</li><li>Trzeci etap i finał</li></ol>`).run();
        break;
      case "checklist":
        editor.chain().focus().insertContent(`<div class="article-checklist"><ul><li>Sprawdź pierwszy warunek lub krok</li><li>Zweryfikuj drugi element listy</li><li>Potwierdź trzeci punkt</li></ul></div>`).run();
        break;
      case "h2":
        editor.chain().focus().insertContent(`<h2>Nowa sekcja artykułu</h2><p>Krótki akapit wprowadzający do sekcji.</p>`).run();
        break;
      case "h3":
        editor.chain().focus().insertContent(`<h3>Śródtytuł rozwijający temat</h3><p>Treść rozwijająca konkretny wątek.</p>`).run();
        break;
      case "bold":
        editor.chain().focus().insertContent(`<p class="article-highlight"><strong>Najważniejsza informacja:</strong> wpisz tutaj zdanie, które ma być mocno wyróżnione i zwrócić uwagę czytelnika.</p>`).run();
        break;
      case "code":
        editor.chain().focus().insertContent(`<pre class="article-code"><code>// fragment kodu lub osadzona instrukcja
const wynik = "przyklad";</code></pre>`).run();
        break;
      case "expertquote":
        setBlocksDropdownOpen(false);
        setBlockInsertModal({ type: "expertquote" });
        return;
      case "info_box":
        setBlocksDropdownOpen(false);
        setBlockInsertModal({ type: "info_box" });
        return;
      case "official_note":
        editor.chain().focus().insertContent(`<aside class="article-official-note"><strong>Stanowisko instytucji</strong><p>W tym miejscu wstaw komunikat urzędu, rzecznika lub partnera wydarzenia.</p></aside>`).run();
        break;
      case "key_points":
        setBlocksDropdownOpen(false);
        setBlockInsertModal({ type: "key_points" });
        return;
      case "timeline":
        editor.chain().focus().insertContent(`<section class="article-timeline"><div class="timeline-item"><strong>08:00</strong><p>Początek wydarzeń lub pierwszy komunikat.</p></div><div class="timeline-item"><strong>11:30</strong><p>Najważniejszy zwrot akcji lub decyzja.</p></div><div class="timeline-item"><strong>15:00</strong><p>Stan obecny i co dalej.</p></div></section>`).run();
        break;
      case "stats_grid":
        editor.chain().focus().insertContent(`<section class="article-stats-grid"><div><strong>12</strong><span>dni prac</span></div><div><strong>3,2 mln</strong><span>wartość inwestycji</span></div><div><strong>7</strong><span>nowych miejsc</span></div></section>`).run();
        break;
      case "faq":
        setBlocksDropdownOpen(false);
        setBlockInsertModal({ type: "faq" });
        return;
      case "pros_cons":
        setBlocksDropdownOpen(false);
        setBlockInsertModal({ type: "pros_cons" });
        return;
      case "alert":
        setBlocksDropdownOpen(false);
        setBlockInsertModal({ type: "alert" });
        return;
      case "context_box":
        setBlocksDropdownOpen(false);
        setBlockInsertModal({ type: "context_box" });
        return;
      case "numbers":
        editor.chain().focus().insertContent(`<section class="article-numbers"><div><strong>1 200</strong><span>mieszkańców dotkniętych</span></div><div><strong>48 h</strong><span>czas reakcji służb</span></div><div><strong>3</strong><span>podjęte decyzje</span></div><div><strong>2026</strong><span>rok realizacji</span></div></section>`).run();
        break;
      case "cta":
        setBlocksDropdownOpen(false);
        setBlockInsertModal({ type: "cta" });
        return;
      case "readmore":
        setBlocksDropdownOpen(false);
        setBlockInsertModal({ type: "readmore" });
        return;
      case "image": {
        const url = await new Promise<string | null>(resolve => setUrlInputModal({ type: "image", label: "URL zdjęcia", resolve }));
        if (url) {
          editor.chain().focus().insertContent(`<figure class="article-media"><img src="${url}" alt="Zdjęcie do artykułu" /><figcaption>Podpis zdjęcia lub źródło fotografii.</figcaption></figure>`).run();
        }
        break;
      }
      case "image_wide": {
        const url = await new Promise<string | null>(resolve => setUrlInputModal({ type: "image_wide", label: "URL zdjęcia (pełna szerokość)", resolve }));
        if (url) {
          editor.chain().focus().insertContent(`<figure class="article-media article-media--wide"><img src="${url}" alt="Zdjęcie do artykułu" /><figcaption>Podpis zdjęcia lub źródło fotografii.</figcaption></figure>`).run();
        }
        break;
      }
      case "link": {
        const url = await new Promise<string | null>(resolve => setUrlInputModal({ type: "link", label: "URL linku", resolve }));
        if (url) editor.chain().focus().insertContent(`<p><a class="article-inline-link" href="${url}" target="_blank" rel="noreferrer">Przejdź do źródła lub materiału powiązanego</a></p>`).run();
        break;
      }
      case "table_info":
        editor.chain().focus().insertContent(`<table class="article-data-table"><thead><tr><th>Zakres</th><th>Dane</th></tr></thead><tbody><tr><td><strong>Lokalizacja</strong></td><td>Bydgoszcz</td></tr><tr><td><strong>Termin</strong></td><td>16 marca 2026</td></tr><tr><td><strong>Status</strong></td><td>W toku</td></tr></tbody></table>`).run();
        break;
      case "embed_video": {
        const url = await new Promise<string | null>(resolve => setUrlInputModal({ type: "embed_video", label: "URL wideo (YouTube lub Vimeo)", resolve }));
        if (url) {
          let embedUrl = url;
          const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
          if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
          const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
          if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
          editor.chain().focus().insertContent(`<div class="article-embed-video"><iframe src="${embedUrl}" frameborder="0" allowfullscreen loading="lazy" title="Wideo"></iframe></div>`).run();
        }
        break;
      }
    }
  };

  return (
    <>
    <div className="flex flex-col h-full bg-background">
      {/* Top Bar */}
      <EditorTopBar
        title={form.title}
        slug={form.slug}
        articleId={article?._id}
        status={form.status ?? "draft"}
        saving={saving}
        wordCount={wordCount}
        readTime={readTime}
        publishedAt={form.publishedAt}
        isDirty={isDirty}
        onCancel={() => {
          if (isDirty && !window.confirm("Masz niezapisane zmiany. Czy na pewno chcesz wyjść?")) return;
          try { localStorage.removeItem(DRAFT_KEY); } catch {}
          onCancel?.();
        }}
        onSave={handleSave}
      />

      {/* Draft recovery banner */}
      {showDraftRecovery && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-3 text-sm">
          <span className="text-amber-700 font-medium">Znaleziono lokalny szkic z poprzedniej sesji.</span>
          <button
            type="button"
            onClick={() => {
              try {
                const saved = localStorage.getItem(DRAFT_KEY);
                if (saved) {
                  const parsed = JSON.parse(saved);
                  setForm(parsed);
                  toast.success("Szkic przywrócony");
                }
              } catch {}
              setShowDraftRecovery(false);
            }}
            className="text-amber-800 font-semibold underline hover:no-underline"
          >
            Przywróć
          </button>
          <button
            type="button"
            onClick={() => {
              try { localStorage.removeItem(DRAFT_KEY); } catch {}
              setShowDraftRecovery(false);
            }}
            className="text-amber-600 hover:text-amber-800"
          >
            Odrzuć
          </button>
        </div>
      )}

      {/* Main Layout — WordPress-style: BlockCanvas is the primary surface */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 min-h-0 w-full overflow-hidden">
          {/* Center: BlockCanvas fills full height, or domain editors in scrollable wrapper */}
          {isQuizArticle || isInterviewArticle || isAnalysisArticle || isReportArticle || isOpinionArticle || isDialogArticle || isAnnouncementArticle || isSponsoredArticle ? (
            <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
              <div className="max-w-4xl mx-auto px-6 py-6">
                {/* Common article header for domain-type articles */}
                <div className="mb-6 rounded-[28px] border border-border bg-background p-5 shadow-sm space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Tytuł artykułu *</label>
                    <Input
                      value={form.title}
                      onChange={(e) => { set("title", e.target.value); setValidationErrors((prev) => { const next = new Set(prev); next.delete("title"); return next; }); }}
                      placeholder="Wpisz tytuł artykułu..."
                      className={`text-lg font-bold ${validationErrors.has("title") ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Slug (URL)</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">/</span>
                      <Input
                        value={form.slug ?? ""}
                        onChange={(e) => { setSlugManuallyEdited(true); set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-")); }}
                        placeholder="slug-artykulu"
                        className="h-8 text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Zdjęcie główne</label>
                      <div className="flex gap-2">
                        <Input
                          value={form.imageUrl ?? ""}
                          onChange={(e) => set("imageUrl", e.target.value)}
                          placeholder="URL zdjęcia głównego"
                          className="h-8 text-sm flex-1"
                        />
                        <Button type="button" variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => setIsMediaPickerOpen(true)}>
                          Biblioteka
                        </Button>
                      </div>
                      {form.imageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-border h-32">
                          <img src={form.imageUrl} alt="Podgląd" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Autor zdjęcia</label>
                      <Input
                        value={form.imageAuthor ?? ""}
                        onChange={(e) => set("imageAuthor", e.target.value)}
                        placeholder="Autor zdjęcia..."
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Lead (opis) *</label>
                    <Textarea
                      value={form.excerpt}
                      onChange={(e) => { set("excerpt", e.target.value); setValidationErrors((prev) => { const next = new Set(prev); next.delete("excerpt"); return next; }); }}
                      placeholder="Krótki opis artykułu wyświetlany w listach i SEO..."
                      className={`min-h-[80px] resize-none text-sm ${validationErrors.has("excerpt") ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    />
                  </div>
                </div>

                {/* Domain-specific editor */}
                {isQuizArticle ? (
                  <QuizEditor quiz={form.quiz ?? createDefaultQuiz()} articleTitle={form.title} articleLead={form.excerpt} onChange={(next: any) => set("quiz", next)} />
                ) : isInterviewArticle ? (
                  <InterviewEditor interview={form.interview ?? createDefaultInterview()} onChange={(next: any) => set("interview", next)} />
                ) : isAnalysisArticle ? (
                  <AnalysisEditor analysis={form.analysis ?? createDefaultAnalysis()} onChange={(next: any) => set("analysis", next)} />
                ) : isReportArticle ? (
                  <ReportEditor report={form.report ?? createDefaultReport()} onChange={(next: any) => set("report", next)} />
                ) : isOpinionArticle ? (
                  <OpinionEditor opinion={form.opinion ?? createDefaultOpinion()} onChange={(next: any) => set("opinion", next)} />
                ) : isDialogArticle ? (
                  <DialogEditor dialog={form.dialog ?? createDefaultDialog()} onChange={(next: any) => set("dialog", next)} />
                ) : isAnnouncementArticle ? (
                  <AnnouncementEditor announcement={form.announcement ?? createDefaultAnnouncement()} onChange={(next: any) => set("announcement", next)} />
                ) : (
                  <SponsoredEditor sponsored={form.sponsored ?? createDefaultSponsored()} onChange={(next: any) => set("sponsored", next)} />
                )}

                {/* === Inline modules: Publication Updates & Poll (toggled from bottom panel) === */}
                {form.showUpdates && (
                  <div ref={publicationUpdatesRef} className="mb-6 rounded-[28px] border border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/10 p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-400">📝 Aktualizacje publikacji</p>
                      <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => { set("showUpdates", false); }}>Wyłącz</Button>
                    </div>
                    {publicationUpdates.map((update, index) => (
                      <div key={update.id ?? `draft-${index}`} className="rounded-xl border border-blue-200 bg-white dark:bg-blue-950/20 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Aktualizacja {index + 1}</p>
                          <div className="flex items-center gap-1.5">
                            <input type="datetime-local" value={new Date(update.publishedAt).toISOString().slice(0, 16)} onChange={e => updatePublicationUpdateDraft(index, { publishedAt: new Date(e.target.value).getTime() })} className="h-7 text-[11px] rounded-md border border-input bg-background px-2 py-0.5" />
                            <button type="button" onClick={() => removePublicationUpdateDraft(index)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-100 hover:text-red-600 text-muted-foreground transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <Textarea value={update.content} onChange={e => updatePublicationUpdateDraft(index, { content: e.target.value })} placeholder="Treść aktualizacji..." className="min-h-[80px] resize-none text-sm" />
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addPublicationUpdateDraft} className="w-full justify-center"><Plus className="w-4 h-4 mr-1.5" />Dodaj kolejną aktualizację</Button>
                  </div>
                )}

                {(form.poll?.enabled || form.poll?.title) && form.poll && (
                  <div className="mb-6 rounded-[28px] border border-primary/20 bg-primary/5 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-primary">📊 Ankieta</p>
                      <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary" onClick={() => set("poll", { ...form.poll!, enabled: false })}>Wyłącz</Button>
                    </div>
                    <PollEditor poll={form.poll} articleContent={form.content} onChange={(next: any) => set("poll", next)} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 min-w-0 flex flex-col overflow-y-auto overflow-x-hidden">
              <BlockCanvas
                blocks={contentBlocks}
                onChange={setContentBlocks}
                content={form.content}
                onContentChange={(html) => set("content", html)}
                articleHeader={{
                  title: form.title,
                  slug: form.slug ?? "",
                  imageUrl: form.imageUrl ?? "",
                  imageAuthor: form.imageAuthor ?? "",
                  excerpt: form.excerpt,
                  onTitleChange: (v) => set("title", v),
                  onSlugChange: (v) => { setSlugManuallyEdited(true); set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-")); },
                  onImageUrlChange: (v) => set("imageUrl", v),
                  onImageAuthorChange: (v) => set("imageAuthor", v),
                  onExcerptChange: (v) => set("excerpt", v),
                  onOpenMediaLibrary: () => setIsMediaPickerOpen(true),
                  onImageUpload: handleImageUpload,
                  isUploading,
                }}
              />

              {/* === Inline modules: Publication Updates & Poll (toggled from bottom panel) === */}
              <div className="max-w-4xl mx-auto w-full px-6 pb-6">
                {form.showUpdates && (
                  <div ref={publicationUpdatesRef} className="mb-6 rounded-[28px] border border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/10 p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-400">📝 Aktualizacje publikacji</p>
                      <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => { set("showUpdates", false); }}>Wyłącz</Button>
                    </div>
                    {publicationUpdates.map((update, index) => (
                      <div key={update.id ?? `draft-${index}`} className="rounded-xl border border-blue-200 bg-white dark:bg-blue-950/20 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Aktualizacja {index + 1}</p>
                          <div className="flex items-center gap-1.5">
                            <input type="datetime-local" value={new Date(update.publishedAt).toISOString().slice(0, 16)} onChange={e => updatePublicationUpdateDraft(index, { publishedAt: new Date(e.target.value).getTime() })} className="h-7 text-[11px] rounded-md border border-input bg-background px-2 py-0.5" />
                            <button type="button" onClick={() => removePublicationUpdateDraft(index)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-100 hover:text-red-600 text-muted-foreground transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <Textarea value={update.content} onChange={e => updatePublicationUpdateDraft(index, { content: e.target.value })} placeholder="Treść aktualizacji..." className="min-h-[80px] resize-none text-sm" />
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addPublicationUpdateDraft} className="w-full justify-center"><Plus className="w-4 h-4 mr-1.5" />Dodaj kolejną aktualizację</Button>
                  </div>
                )}

                {(form.poll?.enabled || form.poll?.title) && form.poll && (
                  <div className="mb-6 rounded-[28px] border border-primary/20 bg-primary/5 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-primary">📊 Ankieta</p>
                      <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary" onClick={() => set("poll", { ...form.poll!, enabled: false })}>Wyłącz</Button>
                    </div>
                    <PollEditor poll={form.poll} articleContent={form.content} onChange={(next: any) => set("poll", next)} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Sidebar */}
          <EditorRightPanel
            form={form}
            set={set}
            article={article}
            now={now}
            categoryOptions={categoryOptions}
            rightTab={rightTab}
            setRightTab={setRightTab}
            rightCollapsed={rightCollapsed}
            setRightCollapsed={setRightCollapsed}
            showCoauthor={showCoauthor}
            setShowCoauthor={setShowCoauthor}
            showCoauthor2={showCoauthor2}
            setShowCoauthor2={setShowCoauthor2}
            showCoauthor3={showCoauthor3}
            setShowCoauthor3={setShowCoauthor3}
            tagInput={tagInput}
            setTagInput={setTagInput}
            addTag={addTag}
            removeTag={removeTag}
            isFuturePublication={isFuturePublication}
            showUpdateDateField={showUpdateDateField}
            setShowUpdateDateField={setShowUpdateDateField}
          />
        </div>

        <section ref={bottomPanelRef} className="flex-shrink-0 border-t border-border bg-muted/10">
          <div className="flex items-center border-b border-border bg-background/80 backdrop-blur-sm w-full px-4 py-2.5 gap-2">
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max gap-1">
                {BOTTOM_TABS.map((tab, i) => {
                  const tabColors = [
                    { active: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", dot: "bg-blue-500" },
                    { active: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400", dot: "bg-purple-500" },
                    { active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", dot: "bg-emerald-500" },
                    { active: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", dot: "bg-amber-500" },
                    { active: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400", dot: "bg-rose-500" },
                  ];
                  const color = tabColors[i % tabColors.length];
                  const isActive = bottomTab === tab.id && !bottomCollapsed;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => { setBottomTab(tab.id); setBottomCollapsed(false); }}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        isActive ? color.active : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? color.dot : "bg-muted-foreground/40"}`} />
                      <tab.icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBottomCollapsed(c => !c)}
              className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title={bottomCollapsed ? "Rozwiń panel" : "Zwiń panel"}
            >
              {bottomCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {!bottomCollapsed && <div className="p-4 max-h-[40vh] overflow-y-auto">
                {bottomTab === "settings" && (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr]">
                    <div className="space-y-4">
                      <CollapsibleSection title="Podstawowe ustawienia publikacji" defaultOpen={true}>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <Label className="text-xs mb-1.5 block">Kategoria</Label>
                            <CategoryPicker value={form.category} onChange={v => set("category", v)} options={categoryOptions} />
                          </div>
                          <div>
                            <Label className="text-xs mb-1.5 block">Typ artykułu</Label>
                            <ArticleTypePicker value={form.articleType ?? "news"} onChange={v => set("articleType", v)} />
                          </div>
                          <div>
                            <Label className="text-xs mb-1.5 block">Data i Godzina Publikacji</Label>
                            <input
                              type="datetime-local"
                              value={new Date(form.publishedAt).toISOString().slice(0, 16)}
                              onChange={e => set("publishedAt", new Date(e.target.value).getTime())}
                              className="h-9 text-sm w-full rounded-md border border-input bg-background px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            {isFuturePublication && (
                              <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-[11px] font-semibold text-blue-700">
                                Zaplanowana publikacja
                              </div>
                            )}
                            <div className="mt-3">
                              <Label className="text-xs mb-1.5 block">Data aktualizacji artykułu</Label>
                              {!article?._id && (
                                <div className="rounded-xl border border-dashed border-border bg-muted/10 px-3 py-3 text-[11px] text-muted-foreground">
                                  Pole pojawia się po zapisaniu artykułu i służy do dodania drugiej daty aktualizacji.
                                </div>
                              )}
                              {article?._id && !showUpdateDateField && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    set("updatedAt", Date.now());
                                    setShowUpdateDateField(true);
                                  }}
                                  className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  Aktualizacja daty publikacji
                                </button>
                              )}
                              {article?._id && showUpdateDateField && (
                                <div className="rounded-xl border border-border bg-muted/20 p-3">
                                  <input
                                    type="datetime-local"
                                    value={new Date(form.updatedAt ?? Date.now()).toISOString().slice(0, 16)}
                                    onChange={e => set("updatedAt", new Date(e.target.value).getTime())}
                                    className="h-9 text-sm w-full rounded-md border border-input bg-background px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs mb-1.5 block">Status publikacji</Label>
                            <div className="rounded-xl border border-border bg-muted/10 px-3 py-3 text-xs text-muted-foreground">
                              {isFuturePublication ? "Artykuł zostanie opublikowany zgodnie z ustawionym terminem." : "Publikacja korzysta z ustawionej daty i godziny artykułu."}
                            </div>
                          </div>
                        </div>
                      </CollapsibleSection>

                      {(isSportCategory || isPoliticsCategory || isInvestmentCategory || isOurActionsCategory) && (
                        <CollapsibleSection title="Rozszerzenia kategorii" defaultOpen={true}>
                          <div className="space-y-6">

                            {/* ── SPORT ── */}
                            {isSportCategory && (
                              <div className="space-y-5">

                                {/* A. Podstawy wydarzenia */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">A. Podstawy wydarzenia</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Dyscyplina</Label>
                                      <select value={form.sport?.sportType ?? "pilka_nozna"} onChange={e => updateSport({ sportType: e.target.value as ArticleSportDraft["sportType"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="pilka_nozna">Piłka nożna</option>
                                        <option value="siatkowka">Siatkówka</option>
                                        <option value="zuzel">Żużel</option>
                                        <option value="inne">Inne</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Status meczu / wydarzenia</Label>
                                      <select value={form.sport?.matchStatus ?? "zaplanowany"} onChange={e => updateSport({ matchStatus: e.target.value as ArticleSportDraft["matchStatus"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="zaplanowany">Zaplanowany</option>
                                        <option value="trwa">Trwa</option>
                                        <option value="zakonczony">Zakończony</option>
                                        <option value="odwolany">Odwołany</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Liga / rozgrywki</Label>
                                      <RelationSingleSelect value={form.sport?.leagueId} onChange={(value) => updateSport({ leagueId: value, league: sportEntityOptions.leagues.find((item) => item.id === value)?.label ?? form.sport?.league })} options={sportEntityOptions.leagues} placeholder="Wybierz ligę" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Sezon</Label>
                                      <RelationSingleSelect value={form.sport?.seasonId} onChange={(value) => updateSport({ seasonId: value })} options={sportEntityOptions.seasons} placeholder="Wybierz sezon" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Wydarzenie / mecz</Label>
                                      <RelationSingleSelect value={form.sport?.eventId} onChange={(value) => updateSport({ eventId: value })} options={sportEntityOptions.events} placeholder="Wybierz wydarzenie" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Tabela / ranking</Label>
                                      <RelationSingleSelect value={form.sport?.tableId} onChange={(value) => updateSport({ tableId: value })} options={sportEntityOptions.tables} placeholder="Wybierz tabelę" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Kolejka / etap</Label>
                                      <Input value={form.sport?.round ?? ""} onChange={e => updateSport({ round: e.target.value })} placeholder="np. 12. kolejka" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Data wydarzenia</Label>
                                      <Input value={form.sport?.matchDate ?? ""} onChange={e => updateSport({ matchDate: e.target.value })} placeholder="np. 2025-03-15" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Miejsce</Label>
                                      <Input value={form.sport?.matchLocation ?? ""} onChange={e => updateSport({ matchLocation: e.target.value })} placeholder="np. Stadion Zawisza" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Nazwa ligi (wyświetlana)</Label>
                                      <Input value={form.sport?.league ?? ""} onChange={e => updateSport({ league: e.target.value })} placeholder="np. Ekstraliga" className="h-9 text-sm" />
                                    </div>
                                  </div>
                                </div>

                                {/* B. Drużyny i wynik */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">B. Drużyny i wynik</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Gospodarz</Label>
                                      <RelationSingleSelect value={form.sport?.homeTeam?.id ?? ""} onChange={(value) => {
                                        const team = sportTeams?.find((item) => item._id === value);
                                        const existingTeamIds = new Set(form.sport?.teamIds ?? []);
                                        if (value) existingTeamIds.add(value);
                                        updateSport({ teamIds: Array.from(existingTeamIds), homeTeam: team ? { id: team._id, name: team.name, shortName: team.shortName, logo: team.logo, color: team.primaryColor, type: "home" } : undefined });
                                      }} options={sportTeamOptions} placeholder="Wybierz drużynę" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Gość</Label>
                                      <RelationSingleSelect value={form.sport?.awayTeam?.id ?? ""} onChange={(value) => {
                                        const team = sportTeams?.find((item) => item._id === value);
                                        const existingTeamIds = new Set(form.sport?.teamIds ?? []);
                                        if (value) existingTeamIds.add(value);
                                        updateSport({ teamIds: Array.from(existingTeamIds), awayTeam: team ? { id: team._id, name: team.name, shortName: team.shortName, logo: team.logo, color: team.primaryColor, type: "away" } : undefined });
                                      }} options={sportTeamOptions} placeholder="Wybierz drużynę" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Wynik gospodarzy</Label>
                                      <Input value={form.sport?.homeScore ?? ""} onChange={e => updateSport({ homeScore: e.target.value })} placeholder="np. 2" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Wynik gości</Label>
                                      <Input value={form.sport?.awayScore ?? ""} onChange={e => updateSport({ awayScore: e.target.value })} placeholder="np. 1" className="h-9 text-sm" />
                                    </div>
                                  </div>
                                </div>

                                {/* C. Relacje sportowe */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">C. Relacje sportowe</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <RelationMultiSelect label="Powiązane drużyny" values={form.sport?.teamIds ?? []} onChange={(next) => updateSport({ teamIds: next })} options={sportTeamOptions} placeholder="Szukaj drużyny" />
                                    <RelationMultiSelect label="Powiązani zawodnicy" values={form.sport?.playerIds ?? []} onChange={(next) => updateSport({ playerIds: next })} options={sportPlayerOptions} placeholder="Szukaj zawodnika" />
                                  </div>
                                </div>

                                {/* D. Bloki redakcyjne */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">D. Bloki redakcyjne</p>
                                  <div className="space-y-3">
                                    {/* Strzelcy */}
                                    <div>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-xs">Strzelcy / autorzy punktów</Label>
                                        <button type="button" onClick={() => updateSport({ scorers: [...(form.sport?.scorers ?? []), ""] })} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Dodaj</button>
                                      </div>
                                      {(form.sport?.scorers ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak strzelców</p>}
                                      {(form.sport?.scorers ?? []).map((scorer, idx) => (
                                        <div key={idx} className="flex gap-1.5 mb-1.5">
                                          <Input value={scorer} onChange={e => { const next = [...(form.sport?.scorers ?? [])]; next[idx] = e.target.value; updateSport({ scorers: next }); }} placeholder="np. Jan Kowalski 45'" className="h-8 text-sm flex-1" />
                                          <button type="button" onClick={() => { const next = (form.sport?.scorers ?? []).filter((_, i) => i !== idx); updateSport({ scorers: next.length ? next : undefined }); }} className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      ))}
                                    </div>
                                    {/* Żółte kartki */}
                                    <div>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-xs">Żółte kartki</Label>
                                        <button type="button" onClick={() => updateSport({ yellowCards: [...(form.sport?.yellowCards ?? []), ""] })} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Dodaj</button>
                                      </div>
                                      {(form.sport?.yellowCards ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak</p>}
                                      {(form.sport?.yellowCards ?? []).map((card, idx) => (
                                        <div key={idx} className="flex gap-1.5 mb-1.5">
                                          <Input value={card} onChange={e => { const next = [...(form.sport?.yellowCards ?? [])]; next[idx] = e.target.value; updateSport({ yellowCards: next }); }} placeholder="np. Jan Kowalski 67'" className="h-8 text-sm flex-1" />
                                          <button type="button" onClick={() => { const next = (form.sport?.yellowCards ?? []).filter((_, i) => i !== idx); updateSport({ yellowCards: next.length ? next : undefined }); }} className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      ))}
                                    </div>
                                    {/* Czerwone kartki */}
                                    <div>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-xs">Czerwone kartki</Label>
                                        <button type="button" onClick={() => updateSport({ redCards: [...(form.sport?.redCards ?? []), ""] })} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Dodaj</button>
                                      </div>
                                      {(form.sport?.redCards ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak</p>}
                                      {(form.sport?.redCards ?? []).map((card, idx) => (
                                        <div key={idx} className="flex gap-1.5 mb-1.5">
                                          <Input value={card} onChange={e => { const next = [...(form.sport?.redCards ?? [])]; next[idx] = e.target.value; updateSport({ redCards: next }); }} placeholder="np. Piotr Nowak 80'" className="h-8 text-sm flex-1" />
                                          <button type="button" onClick={() => { const next = (form.sport?.redCards ?? []).filter((_, i) => i !== idx); updateSport({ redCards: next.length ? next : undefined }); }} className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      ))}
                                    </div>
                                    {/* Highlights */}
                                    <div>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-xs">Skrót / highlights (linki)</Label>
                                        <button type="button" onClick={() => updateSport({ matchHighlights: [...(form.sport?.matchHighlights ?? []), ""] })} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Dodaj</button>
                                      </div>
                                      {(form.sport?.matchHighlights ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak linków</p>}
                                      {(form.sport?.matchHighlights ?? []).map((url, idx) => (
                                        <div key={idx} className="flex gap-1.5 mb-1.5">
                                          <Input value={url} onChange={e => { const next = [...(form.sport?.matchHighlights ?? [])]; next[idx] = e.target.value; updateSport({ matchHighlights: next }); }} placeholder="https://youtube.com/..." className="h-8 text-sm flex-1" />
                                          <button type="button" onClick={() => { const next = (form.sport?.matchHighlights ?? []).filter((_, i) => i !== idx); updateSport({ matchHighlights: next.length ? next : undefined }); }} className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      ))}
                                    </div>
                                    {/* Tabela URL */}
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Link do tabeli / rankingu</Label>
                                      <Input value={form.sport?.leagueTableUrl ?? ""} onChange={e => updateSport({ leagueTableUrl: e.target.value })} placeholder="https://..." className="h-9 text-sm" />
                                    </div>
                                    {/* Skład gospodarzy */}
                                    <div>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-xs">Skład gospodarzy</Label>
                                        <button type="button" onClick={() => updateSport({ homeLineup: [...(form.sport?.homeLineup ?? []), { id: crypto.randomUUID(), name: "", number: "", position: undefined }] })} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Dodaj</button>
                                      </div>
                                      {(form.sport?.homeLineup ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak zawodników</p>}
                                      {(form.sport?.homeLineup ?? []).map((player, idx) => (
                                        <div key={player.id ?? idx} className="flex gap-1.5 mb-1.5 items-center">
                                          <Input value={player.number ?? ""} onChange={e => { const next = [...(form.sport?.homeLineup ?? [])]; next[idx] = { ...next[idx], number: e.target.value || undefined }; updateSport({ homeLineup: next }); }} placeholder="#" className="h-8 text-sm w-14 flex-shrink-0" />
                                          <Input value={player.name} onChange={e => { const next = [...(form.sport?.homeLineup ?? [])]; next[idx] = { ...next[idx], name: e.target.value }; updateSport({ homeLineup: next }); }} placeholder="Imię i nazwisko" className="h-8 text-sm flex-1" />
                                          <Input value={player.position ?? ""} onChange={e => { const next = [...(form.sport?.homeLineup ?? [])]; next[idx] = { ...next[idx], position: e.target.value || undefined }; updateSport({ homeLineup: next }); }} placeholder="Pozycja" className="h-8 text-sm w-24 flex-shrink-0" />
                                          <button type="button" onClick={() => { const next = (form.sport?.homeLineup ?? []).filter((_, i) => i !== idx); updateSport({ homeLineup: next.length ? next : undefined }); }} className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      ))}
                                    </div>
                                    {/* Skład gości */}
                                    <div>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-xs">Skład gości</Label>
                                        <button type="button" onClick={() => updateSport({ awayLineup: [...(form.sport?.awayLineup ?? []), { id: crypto.randomUUID(), name: "", number: "", position: undefined }] })} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Dodaj</button>
                                      </div>
                                      {(form.sport?.awayLineup ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak zawodników</p>}
                                      {(form.sport?.awayLineup ?? []).map((player, idx) => (
                                        <div key={player.id ?? idx} className="flex gap-1.5 mb-1.5 items-center">
                                          <Input value={player.number ?? ""} onChange={e => { const next = [...(form.sport?.awayLineup ?? [])]; next[idx] = { ...next[idx], number: e.target.value || undefined }; updateSport({ awayLineup: next }); }} placeholder="#" className="h-8 text-sm w-14 flex-shrink-0" />
                                          <Input value={player.name} onChange={e => { const next = [...(form.sport?.awayLineup ?? [])]; next[idx] = { ...next[idx], name: e.target.value }; updateSport({ awayLineup: next }); }} placeholder="Imię i nazwisko" className="h-8 text-sm flex-1" />
                                          <Input value={player.position ?? ""} onChange={e => { const next = [...(form.sport?.awayLineup ?? [])]; next[idx] = { ...next[idx], position: e.target.value || undefined }; updateSport({ awayLineup: next }); }} placeholder="Pozycja" className="h-8 text-sm w-24 flex-shrink-0" />
                                          <button type="button" onClick={() => { const next = (form.sport?.awayLineup ?? []).filter((_, i) => i !== idx); updateSport({ awayLineup: next.length ? next : undefined }); }} className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      ))}
                                    </div>
                                    {/* Statystyki meczu */}
                                    <div>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-xs">Statystyki meczu</Label>
                                        <button type="button" onClick={() => updateSport({ matchStats: [...(form.sport?.matchStats ?? []), { label: "", homeValue: "", awayValue: "" }] })} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Dodaj</button>
                                      </div>
                                      {(form.sport?.matchStats ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak statystyk</p>}
                                      {(form.sport?.matchStats ?? []).map((stat, idx) => (
                                        <div key={idx} className="flex gap-1.5 mb-1.5 items-center">
                                          <Input value={stat.label} onChange={e => { const next = [...(form.sport?.matchStats ?? [])]; next[idx] = { ...next[idx], label: e.target.value }; updateSport({ matchStats: next }); }} placeholder="Statystyka (np. Posiadanie piłki)" className="h-8 text-sm flex-1" />
                                          <Input value={stat.homeValue} onChange={e => { const next = [...(form.sport?.matchStats ?? [])]; next[idx] = { ...next[idx], homeValue: e.target.value }; updateSport({ matchStats: next }); }} placeholder="Gosp." className="h-8 text-sm w-20 flex-shrink-0" />
                                          <Input value={stat.awayValue} onChange={e => { const next = [...(form.sport?.matchStats ?? [])]; next[idx] = { ...next[idx], awayValue: e.target.value }; updateSport({ matchStats: next }); }} placeholder="Gość" className="h-8 text-sm w-20 flex-shrink-0" />
                                          <button type="button" onClick={() => { const next = (form.sport?.matchStats ?? []).filter((_, i) => i !== idx); updateSport({ matchStats: next.length ? next : undefined }); }} className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── POLITYKA ── */}
                            {isPoliticsCategory && (
                              <div className="space-y-5">

                                {/* A. Klasyfikacja */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">A. Klasyfikacja</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                      <Label className="text-xs mb-1.5 block">Temat</Label>
                                      <Input value={form.politics?.topic ?? ""} onChange={e => updatePolitics({ topic: e.target.value })} placeholder="Temat polityczny" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Główne ugrupowanie / partia</Label>
                                      <Input value={form.politics?.party ?? ""} onChange={e => updatePolitics({ party: e.target.value })} placeholder="np. PiS, KO, TD..." className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Typ materiału</Label>
                                      <RelationSingleSelect value={form.politics?.materialTypeId} onChange={(value) => updatePolitics({ materialTypeId: value })} options={politicsEntityOptions.materialTypes} placeholder="Wybierz typ materiału" />
                                    </div>
                                  </div>
                                </div>

                                {/* B. Kontekst redakcyjny */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">B. Kontekst redakcyjny</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                      <Label className="text-xs mb-1.5 block">Kontekst polityczny</Label>
                                      <Textarea value={form.politics?.politicalContext ?? ""} onChange={e => updatePolitics({ politicalContext: e.target.value })} placeholder="Opisz kontekst polityczny artykułu..." className="min-h-[90px] resize-none text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label className="text-xs mb-1.5 block">Powiązana uchwała / ustawa / sprawa</Label>
                                      <Input value={form.politics?.relatedLegislation ?? ""} onChange={e => updatePolitics({ relatedLegislation: e.target.value })} placeholder="np. Uchwała nr 123/2025..." className="h-9 text-sm" />
                                    </div>
                                  </div>
                                </div>

                                {/* C. Relacje polityczne */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">C. Relacje polityczne</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                      <Label className="text-xs mb-1.5 block">Główny polityk</Label>
                                      <RelationSingleSelect value={form.politics?.mainPoliticianId} onChange={(value) => {
                                        const uniqueIds = new Set(form.politics?.politicianIds ?? []);
                                        if (value) uniqueIds.add(value);
                                        updatePolitics({ mainPoliticianId: value, politicianIds: Array.from(uniqueIds) });
                                      }} options={politicianOptions} placeholder="Wybierz polityka" />
                                    </div>
                                    <RelationMultiSelect label="Politycy powiązani" values={form.politics?.politicianIds ?? []} onChange={(next) => updatePolitics({ politicianIds: next })} options={politicianOptions} placeholder="Szukaj polityka" />
                                    <RelationMultiSelect label="Ugrupowania" values={form.politics?.groupIds ?? []} onChange={(next) => updatePolitics({ groupIds: next })} options={politicsEntityOptions.groups} placeholder="Szukaj ugrupowania" />
                                    <RelationMultiSelect label="Stanowiska" values={form.politics?.positionIds ?? []} onChange={(next) => updatePolitics({ positionIds: next })} options={politicsEntityOptions.positions} placeholder="Szukaj stanowiska" />
                                    <RelationMultiSelect label="Wydarzenia (słownik)" values={form.politics?.eventIds ?? []} onChange={(next) => updatePolitics({ eventIds: next })} options={politicsEntityOptions.events} placeholder="Szukaj wydarzenia" />
                                  </div>
                                </div>

                                {/* D. Timeline sprawy */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">D. Timeline sprawy</p>
                                  <div className="space-y-2">
                                    {(form.politics?.timeline ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak wpisów w timeline</p>}
                                    {(form.politics?.timeline ?? []).map((item, idx) => (
                                      <div key={item.id} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-medium text-muted-foreground">Wpis #{idx + 1}</span>
                                          <button type="button" onClick={() => { const next = (form.politics?.timeline ?? []).filter((_, i) => i !== idx); updatePolitics({ timeline: next.length ? next : undefined }); }} className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                        <div className="grid gap-2 md:grid-cols-2">
                                          <Input value={item.date} onChange={e => { const next = [...(form.politics?.timeline ?? [])]; next[idx] = { ...next[idx], date: e.target.value }; updatePolitics({ timeline: next }); }} placeholder="Data (np. 2025-01-15)" className="h-8 text-xs" />
                                          <select value={item.type ?? "inne"} onChange={e => { const next = [...(form.politics?.timeline ?? [])]; next[idx] = { ...next[idx], type: e.target.value as "wypowiedz" | "decyzja" | "glosowanie" | "inne" }; updatePolitics({ timeline: next }); }} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                                            <option value="wypowiedz">Wypowiedź</option>
                                            <option value="decyzja">Decyzja</option>
                                            <option value="glosowanie">Głosowanie</option>
                                            <option value="inne">Inne</option>
                                          </select>
                                          <Input value={item.title} onChange={e => { const next = [...(form.politics?.timeline ?? [])]; next[idx] = { ...next[idx], title: e.target.value }; updatePolitics({ timeline: next }); }} placeholder="Tytuł wpisu" className="h-8 text-xs md:col-span-2" />
                                          <Textarea value={item.description ?? ""} onChange={e => { const next = [...(form.politics?.timeline ?? [])]; next[idx] = { ...next[idx], description: e.target.value }; updatePolitics({ timeline: next }); }} placeholder="Opis (opcjonalnie)" className="min-h-[60px] resize-none text-xs md:col-span-2" />
                                        </div>
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => { const newItem = { id: `tl-${Date.now()}`, date: "", title: "", description: "", type: "inne" as const }; updatePolitics({ timeline: [...(form.politics?.timeline ?? []), newItem] }); }} className="w-full h-8 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5">
                                      <Plus className="w-3 h-3" /> Dodaj wpis do timeline
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── INWESTYCJE ── */}
                            {isInvestmentCategory && (
                              <div className="space-y-5">

                                {/* A. Podstawy inwestycji */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">A. Podstawy inwestycji</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                      <Label className="text-xs mb-1.5 block">Nazwa inwestycji</Label>
                                      <Input value={form.investment?.projectName ?? ""} onChange={e => updateInvestment({ projectName: e.target.value })} placeholder="Pełna nazwa inwestycji" className="h-9 text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label className="text-xs mb-1.5 block">Główna inwestycja z bazy</Label>
                                      <RelationSingleSelect value={form.investment?.linkedInvestmentId} onChange={(value) => updateInvestment({ linkedInvestmentId: value })} options={investmentEntityOptions.investments} placeholder="Wybierz główną inwestycję" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Status inwestycji</Label>
                                      <select value={form.investment?.projectStatus ?? "planowana"} onChange={e => updateInvestment({ projectStatus: e.target.value as ArticleInvestmentDraft["projectStatus"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="planowana">Planowana</option>
                                        <option value="w_trakcie">W trakcie</option>
                                        <option value="zakonczona">Zakończona</option>
                                        <option value="wstrzymana">Wstrzymana</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Dzielnica</Label>
                                      <Input value={form.investment?.district ?? ""} onChange={e => updateInvestment({ district: e.target.value })} placeholder="np. Śródmieście" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Lokalizacja</Label>
                                      <Input value={form.investment?.location ?? ""} onChange={e => updateInvestment({ location: e.target.value })} placeholder="Adres / opis lokalizacji" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Inwestor / deweloper</Label>
                                      <Input value={form.investment?.investor ?? ""} onChange={e => updateInvestment({ investor: e.target.value })} placeholder="np. Miasto Bydgoszcz" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Wykonawca</Label>
                                      <Input value={form.investment?.contractor ?? ""} onChange={e => updateInvestment({ contractor: e.target.value })} placeholder="Firma wykonawcza" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Link do mapy</Label>
                                      <Input value={form.investment?.mapUrl ?? ""} onChange={e => updateInvestment({ mapUrl: e.target.value })} placeholder="https://..." className="h-9 text-sm" />
                                    </div>
                                  </div>
                                </div>

                                {/* B. Parametry */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">B. Parametry</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Budżet / koszt</Label>
                                      <Input value={form.investment?.budget ?? ""} onChange={e => updateInvestment({ budget: e.target.value })} placeholder="np. 12 mln zł" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Postęp (%)</Label>
                                      <Input type="number" min={0} max={100} value={String(form.investment?.progressPercent ?? 0)} onChange={e => updateInvestment({ progressPercent: Number(e.target.value) || 0 })} placeholder="0–100" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Data startu</Label>
                                      <Input value={form.investment?.startDate ?? ""} onChange={e => updateInvestment({ startDate: e.target.value })} placeholder="np. 2024-03-01" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Planowany koniec</Label>
                                      <Input value={form.investment?.estimatedEndDate ?? ""} onChange={e => updateInvestment({ estimatedEndDate: e.target.value })} placeholder="np. 2025-12-31" className="h-9 text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label className="text-xs mb-1.5 block">Wpływ inwestycji</Label>
                                      <Textarea value={form.investment?.impactDescription ?? ""} onChange={e => updateInvestment({ impactDescription: e.target.value })} placeholder="Opisz wpływ inwestycji na miasto / mieszkańców..." className="min-h-[80px] resize-none text-sm" />
                                    </div>
                                  </div>
                                </div>

                                {/* C. Relacje słownikowe */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">C. Relacje słownikowe</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <RelationMultiSelect label="Inwestycje powiązane" values={form.investment?.investmentIds ?? []} onChange={(next) => updateInvestment({ investmentIds: next })} options={investmentEntityOptions.investments} placeholder="Szukaj inwestycji" />
                                    <RelationMultiSelect label="Wykonawcy" values={form.investment?.contractorIds ?? []} onChange={(next) => updateInvestment({ contractorIds: next })} options={investmentEntityOptions.contractors} placeholder="Szukaj wykonawcy" />
                                    <RelationMultiSelect label="Lokalizacje" values={form.investment?.locationIds ?? []} onChange={(next) => updateInvestment({ locationIds: next })} options={investmentEntityOptions.locations} placeholder="Szukaj lokalizacji" />
                                    <RelationMultiSelect label="Typy inwestycji" values={form.investment?.typeIds ?? []} onChange={(next) => updateInvestment({ typeIds: next })} options={investmentEntityOptions.types} placeholder="Szukaj typu" />
                                    <RelationMultiSelect label="Etapy" values={form.investment?.phaseIds ?? []} onChange={(next) => updateInvestment({ phaseIds: next })} options={investmentEntityOptions.phases} placeholder="Szukaj etapu" />
                                    <RelationMultiSelect label="Statusy" values={form.investment?.statusIds ?? []} onChange={(next) => updateInvestment({ statusIds: next })} options={investmentEntityOptions.statuses} placeholder="Szukaj statusu" />
                                  </div>
                                </div>

                                {/* D. Timeline inwestycji */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">D. Harmonogram / timeline</p>
                                  <div className="space-y-2">
                                    {(form.investment?.timeline ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak wpisów w harmonogramie</p>}
                                    {(form.investment?.timeline ?? []).map((item, idx) => (
                                      <div key={item.id} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-medium text-muted-foreground">Etap #{idx + 1}</span>
                                          <button type="button" onClick={() => { const next = (form.investment?.timeline ?? []).filter((_, i) => i !== idx); updateInvestment({ timeline: next.length ? next : undefined }); }} className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                        <div className="grid gap-2 md:grid-cols-2">
                                          <Input value={item.date} onChange={e => { const next = [...(form.investment?.timeline ?? [])]; next[idx] = { ...next[idx], date: e.target.value }; updateInvestment({ timeline: next }); }} placeholder="Data (np. 2025-06-01)" className="h-8 text-xs" />
                                          <select value={item.status} onChange={e => { const next = [...(form.investment?.timeline ?? [])]; next[idx] = { ...next[idx], status: e.target.value as "completed" | "current" | "upcoming" }; updateInvestment({ timeline: next }); }} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                                            <option value="completed">Zakończony</option>
                                            <option value="current">W trakcie</option>
                                            <option value="upcoming">Planowany</option>
                                          </select>
                                          <Input value={item.title} onChange={e => { const next = [...(form.investment?.timeline ?? [])]; next[idx] = { ...next[idx], title: e.target.value }; updateInvestment({ timeline: next }); }} placeholder="Tytuł etapu" className="h-8 text-xs md:col-span-2" />
                                          <Textarea value={item.description ?? ""} onChange={e => { const next = [...(form.investment?.timeline ?? [])]; next[idx] = { ...next[idx], description: e.target.value }; updateInvestment({ timeline: next }); }} placeholder="Opis etapu (opcjonalnie)" className="min-h-[60px] resize-none text-xs md:col-span-2" />
                                        </div>
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => { const newItem = { id: `inv-tl-${Date.now()}`, date: "", title: "", description: "", status: "upcoming" as const }; updateInvestment({ timeline: [...(form.investment?.timeline ?? []), newItem] }); }} className="w-full h-8 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5">
                                      <Plus className="w-3 h-3" /> Dodaj etap harmonogramu
                                    </button>
                                  </div>
                                </div>

                                {/* E. Materiały wizualne */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">E. Materiały wizualne (przed / po)</p>
                                  <div className="space-y-3">
                                    {/* Zdjęcia przed */}
                                    <div>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-xs">Zdjęcia — stan przed</Label>
                                        <button type="button" onClick={() => updateInvestment({ beforeImages: [...(form.investment?.beforeImages ?? []), ""] })} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Dodaj URL</button>
                                      </div>
                                      {(form.investment?.beforeImages ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak zdjęć</p>}
                                      {(form.investment?.beforeImages ?? []).map((url, idx) => (
                                        <div key={idx} className="flex gap-1.5 mb-1.5">
                                          <Input value={url} onChange={e => { const next = [...(form.investment?.beforeImages ?? [])]; next[idx] = e.target.value; updateInvestment({ beforeImages: next }); }} placeholder="https://... (URL zdjęcia)" className="h-8 text-sm flex-1" />
                                          <button type="button" onClick={() => { const next = (form.investment?.beforeImages ?? []).filter((_, i) => i !== idx); updateInvestment({ beforeImages: next.length ? next : undefined }); }} className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      ))}
                                    </div>
                                    {/* Zdjęcia po */}
                                    <div>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-xs">Zdjęcia — stan po</Label>
                                        <button type="button" onClick={() => updateInvestment({ afterImages: [...(form.investment?.afterImages ?? []), ""] })} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Dodaj URL</button>
                                      </div>
                                      {(form.investment?.afterImages ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak zdjęć</p>}
                                      {(form.investment?.afterImages ?? []).map((url, idx) => (
                                        <div key={idx} className="flex gap-1.5 mb-1.5">
                                          <Input value={url} onChange={e => { const next = [...(form.investment?.afterImages ?? [])]; next[idx] = e.target.value; updateInvestment({ afterImages: next }); }} placeholder="https://... (URL zdjęcia)" className="h-8 text-sm flex-1" />
                                          <button type="button" onClick={() => { const next = (form.investment?.afterImages ?? []).filter((_, i) => i !== idx); updateInvestment({ afterImages: next.length ? next : undefined }); }} className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── NASZE DZIAŁANIA ── */}
                            {isOurActionsCategory && (
                              <div className="space-y-5">

                                {/* A. Klasyfikacja */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">A. Klasyfikacja</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Typ działania</Label>
                                      <select value={form.ourActions?.actionType ?? "akcja"} onChange={e => updateOurActions({ actionType: e.target.value as ArticleOurActionsDraft["actionType"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="akcja">Akcja</option>
                                        <option value="projekt">Projekt</option>
                                        <option value="kampania">Kampania</option>
                                        <option value="wspolpraca">Współpraca</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Status działania</Label>
                                      <select value={form.ourActions?.actionStatus ?? "aktywna"} onChange={e => updateOurActions({ actionStatus: e.target.value as ArticleOurActionsDraft["actionStatus"] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="aktywna">Aktywna</option>
                                        <option value="planowana">Planowana</option>
                                        <option value="zakonczona">Zakończona</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Typ działania z bazy</Label>
                                      <RelationSingleSelect value={form.ourActions?.actionTypeId} onChange={(value) => updateOurActions({ actionTypeId: value })} options={actionEntityOptions.actionTypes} placeholder="Wybierz typ działania" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Data startu</Label>
                                      <Input value={form.ourActions?.startDate ?? ""} onChange={e => updateOurActions({ startDate: e.target.value })} placeholder="np. 2025-01-01" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Data zakończenia</Label>
                                      <Input value={form.ourActions?.endDate ?? ""} onChange={e => updateOurActions({ endDate: e.target.value })} placeholder="np. 2025-06-30" className="h-9 text-sm" />
                                    </div>
                                  </div>
                                </div>

                                {/* B. Dane redakcyjne */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">B. Dane redakcyjne</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                      <Label className="text-xs mb-1.5 block">Uczestnicy / skala</Label>
                                      <Input value={form.ourActions?.participants ?? ""} onChange={e => updateOurActions({ participants: e.target.value })} placeholder="np. 500 uczestników, 20 szkół" className="h-9 text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label className="text-xs mb-1.5 block">Rezultaty działań</Label>
                                      <Textarea value={form.ourActions?.results ?? ""} onChange={e => updateOurActions({ results: e.target.value })} placeholder="Opisz osiągnięte rezultaty..." className="min-h-[80px] resize-none text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label className="text-xs mb-1.5 block">Wpływ / efekt społeczny</Label>
                                      <Textarea value={form.ourActions?.impact ?? ""} onChange={e => updateOurActions({ impact: e.target.value })} placeholder="Opisz wpływ na społeczność..." className="min-h-[80px] resize-none text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Tekst CTA</Label>
                                      <Input value={form.ourActions?.ctaLabel ?? ""} onChange={e => updateOurActions({ ctaLabel: e.target.value })} placeholder="np. Dołącz do akcji" className="h-9 text-sm" />
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1.5 block">Link CTA</Label>
                                      <Input value={form.ourActions?.ctaUrl ?? ""} onChange={e => updateOurActions({ ctaUrl: e.target.value })} placeholder="https://..." className="h-9 text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label className="text-xs mb-1.5 block">Link do wideo / embed</Label>
                                      <Input value={form.ourActions?.videoUrl ?? ""} onChange={e => updateOurActions({ videoUrl: e.target.value })} placeholder="https://youtube.com/..." className="h-9 text-sm" />
                                    </div>
                                  </div>
                                </div>

                                {/* C. Relacje */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">C. Relacje</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <RelationMultiSelect label="Partnerzy" values={form.ourActions?.partnerIds ?? []} onChange={(next) => updateOurActions({ partnerIds: next })} options={actionEntityOptions.partners} placeholder="Szukaj partnera" />
                                    <RelationMultiSelect label="Projekty" values={form.ourActions?.projectIds ?? []} onChange={(next) => updateOurActions({ projectIds: next })} options={actionEntityOptions.projects} placeholder="Szukaj projektu" />
                                    <RelationMultiSelect label="Kampanie" values={form.ourActions?.campaignIds ?? []} onChange={(next) => updateOurActions({ campaignIds: next })} options={actionEntityOptions.campaigns} placeholder="Szukaj kampanii" />
                                    <RelationMultiSelect label="Wyniki / efekty" values={form.ourActions?.resultIds ?? []} onChange={(next) => updateOurActions({ resultIds: next })} options={actionEntityOptions.results} placeholder="Szukaj efektu" />
                                  </div>
                                </div>

                                {/* D. Milestones */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">D. Milestones / kamienie milowe</p>
                                  <div className="space-y-2">
                                    {(form.ourActions?.milestones ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak kamieni milowych</p>}
                                    {(form.ourActions?.milestones ?? []).map((item, idx) => (
                                      <div key={item.id} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-medium text-muted-foreground">Milestone #{idx + 1}</span>
                                          <button type="button" onClick={() => { const next = (form.ourActions?.milestones ?? []).filter((_, i) => i !== idx); updateOurActions({ milestones: next.length ? next : undefined }); }} className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                        <div className="grid gap-2 md:grid-cols-2">
                                          <Input value={item.date} onChange={e => { const next = [...(form.ourActions?.milestones ?? [])]; next[idx] = { ...next[idx], date: e.target.value }; updateOurActions({ milestones: next }); }} placeholder="Data" className="h-8 text-xs" />
                                          <Input value={item.title} onChange={e => { const next = [...(form.ourActions?.milestones ?? [])]; next[idx] = { ...next[idx], title: e.target.value }; updateOurActions({ milestones: next }); }} placeholder="Tytuł" className="h-8 text-xs" />
                                          <Textarea value={item.description ?? ""} onChange={e => { const next = [...(form.ourActions?.milestones ?? [])]; next[idx] = { ...next[idx], description: e.target.value }; updateOurActions({ milestones: next }); }} placeholder="Opis (opcjonalnie)" className="min-h-[60px] resize-none text-xs md:col-span-2" />
                                          <Input value={item.imageUrl ?? ""} onChange={e => { const next = [...(form.ourActions?.milestones ?? [])]; next[idx] = { ...next[idx], imageUrl: e.target.value }; updateOurActions({ milestones: next }); }} placeholder="URL zdjęcia (opcjonalnie)" className="h-8 text-xs md:col-span-2" />
                                        </div>
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => { const newItem = { id: `ms-${Date.now()}`, date: "", title: "", description: "", imageUrl: "" }; updateOurActions({ milestones: [...(form.ourActions?.milestones ?? []), newItem] }); }} className="w-full h-8 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5">
                                      <Plus className="w-3 h-3" /> Dodaj milestone
                                    </button>
                                  </div>
                                </div>

                                {/* E. Galeria */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 border-b border-border pb-1">E. Galeria</p>
                                  <div className="space-y-2">
                                    {(form.ourActions?.gallery ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">Brak zdjęć w galerii</p>}
                                    {(form.ourActions?.gallery ?? []).map((url, idx) => (
                                      <div key={idx} className="flex gap-1.5">
                                        <Input value={url} onChange={e => { const next = [...(form.ourActions?.gallery ?? [])]; next[idx] = e.target.value; updateOurActions({ gallery: next }); }} placeholder="URL zdjęcia" className="h-8 text-sm flex-1" />
                                        <button type="button" onClick={() => { const next = (form.ourActions?.gallery ?? []).filter((_, i) => i !== idx); updateOurActions({ gallery: next.length ? next : undefined }); }} className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => updateOurActions({ gallery: [...(form.ourActions?.gallery ?? []), ""] })} className="w-full h-8 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5">
                                      <Plus className="w-3 h-3" /> Dodaj zdjęcie do galerii
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        </CollapsibleSection>
                      )}

                      <CollapsibleSection title="Zespół redakcyjny" defaultOpen={true}>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <Label className="text-xs mb-1.5 block">Autor</Label>
                            <AuthorAutocomplete value={form.author} onChange={v => set("author", v)} />
                          </div>
                          <div>
                            <Label className="text-xs mb-1.5 block">Współautor</Label>
                            {showCoauthor ? (
                              <div className="flex gap-1">
                                <AuthorAutocomplete value={form.coauthor ?? ""} onChange={v => set("coauthor", v)} placeholder="Współautor (opcjonalnie)" />
                                <button type="button" onClick={() => { setShowCoauthor(false); setShowCoauthor2(false); setShowCoauthor3(false); set("coauthor", ""); set("coauthor2", ""); set("coauthor3", ""); }}
                                  className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-red-100 hover:text-red-600 text-muted-foreground transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => setShowCoauthor(true)}
                                className="w-full h-9 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" /> Dodaj współautora
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Kolejni współautorzy</Label>
                          </div>

                          {showCoauthor2 ? (
                            <div className="flex gap-1">
                              <AuthorAutocomplete value={form.coauthor2 ?? ""} onChange={v => set("coauthor2", v)} placeholder="Współautor 2 (opcjonalnie)" />
                              <button type="button" onClick={() => { setShowCoauthor2(false); setShowCoauthor3(false); set("coauthor2", ""); set("coauthor3", ""); }}
                                className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-red-100 hover:text-red-600 text-muted-foreground transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => setShowCoauthor2(true)}
                              className="w-full h-9 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" /> Dodaj współautora 2
                            </button>
                          )}

                          {showCoauthor2 && (showCoauthor3 ? (
                            <div className="flex gap-1">
                              <AuthorAutocomplete value={form.coauthor3 ?? ""} onChange={v => set("coauthor3", v)} placeholder="Współautor 3 (opcjonalnie)" />
                              <button type="button" onClick={() => { setShowCoauthor3(false); set("coauthor3", ""); }}
                                className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-red-100 hover:text-red-600 text-muted-foreground transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => setShowCoauthor3(true)}
                              className="w-full h-9 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" /> Dodaj współautora 3
                            </button>
                          ))}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {!showCorrector && (
                            <button type="button" onClick={() => setShowCorrector(true)} className="text-[11px] text-muted-foreground transition-colors hover:text-foreground">
                              Korekta
                            </button>
                          )}
                          {!showPublisher && (
                            <button type="button" onClick={() => setShowPublisher(true)} className="text-[11px] text-muted-foreground transition-colors hover:text-foreground">
                              Wydawca
                            </button>
                          )}
                        </div>

                        {showCorrector && (
                          <div className="mt-2">
                            <Label className="text-xs mb-1.5 block">Korektor</Label>
                            <AuthorAutocomplete value={form.corrector ?? ""} onChange={v => set("corrector", v)} placeholder="Korektor (opcjonalnie)" />
                          </div>
                        )}

                        {showPublisher && (
                          <div className="mt-2">
                            <Label className="text-xs mb-1.5 block">Wydawca</Label>
                            <AuthorAutocomplete value={form.publisher ?? ""} onChange={v => set("publisher", v)} placeholder="Wydawca (opcjonalnie)" />
                          </div>
                        )}
                      </CollapsibleSection>

                      <CollapsibleSection title="SEO i Meta Dane" defaultOpen={false}>
                        <div className="space-y-3">
                          {/* SEO Preview Snippet */}
                          <div className="rounded-xl border border-border bg-muted/20 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Podgląd w wyszukiwarce</p>
                            <div className="space-y-0.5">
                              <p className="text-[13px] font-semibold text-blue-600 truncate leading-snug">
                                {form.seoTitle || form.title || "Tytuł artykułu"}
                              </p>
                              <p className="text-[11px] text-green-700 truncate">
                                lovebydgoszcz.pl/{form.slug || "artykul"}
                              </p>
                              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                {form.seoDescription || form.excerpt || "Opis artykułu pojawi się tutaj..."}
                              </p>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <Label className="text-xs">Tytuł SEO</Label>
                              {seoManuallyEdited.current.title && (
                                <button type="button" onClick={() => { seoManuallyEdited.current.title = false; set("seoTitle", form.title); }} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                                  ↺ Przywróć auto
                                </button>
                              )}
                            </div>
                            <Input
                              value={form.seoTitle ?? ""}
                              onChange={e => { seoManuallyEdited.current.title = true; set("seoTitle", e.target.value); }}
                              placeholder="Tytuł dla wyszukiwarek..."
                              className="h-9 text-sm"
                            />
                            <p className={`text-xs mt-1 ${(form.seoTitle ?? "").length > 60 ? "text-orange-500" : "text-muted-foreground"}`}>
                              {(form.seoTitle ?? "").length}/60 znaków
                              {seoManuallyEdited.current.title && <span className="ml-2 text-blue-500">· ręczny</span>}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <Label className="text-xs">Opis SEO</Label>
                              {seoManuallyEdited.current.description && (
                                <button type="button" onClick={() => { seoManuallyEdited.current.description = false; const plain = form.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(); set("seoDescription", (form.excerpt.trim() || plain).slice(0, 160)); }} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                                  ↺ Przywróć auto
                                </button>
                              )}
                            </div>
                            <Textarea
                              value={form.seoDescription ?? ""}
                              onChange={e => { seoManuallyEdited.current.description = true; set("seoDescription", e.target.value); }}
                              placeholder="Opis dla wyszukiwarek..."
                              className="min-h-[70px] resize-none text-sm"
                            />
                            <p className={`text-xs mt-1 ${(form.seoDescription ?? "").length > 160 ? "text-orange-500" : "text-muted-foreground"}`}>
                              {(form.seoDescription ?? "").length}/160 znaków
                              {seoManuallyEdited.current.description && <span className="ml-2 text-blue-500">· ręczny</span>}
                            </p>
                          </div>
                        </div>
                      </CollapsibleSection>
                    </div>

                    <div className="space-y-4">
                      <CollapsibleSection title="Etykiety i wyróżnienia" defaultOpen={true} badge={activeLabelsCount > 0 ? String(activeLabelsCount) : undefined}>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { key: "labelUrgent", label: "PILNE", color: "bg-red-100 text-red-700 border-red-200" },
                              { key: "labelImportant", label: "WAŻNE", color: "bg-orange-100 text-orange-700 border-orange-200" },
                              { key: "labelOurNews", label: "NASZA", color: "bg-blue-100 text-blue-700 border-blue-200" },
                              { key: "labelMustKnow", label: "MUSISZ WIEDZIEĆ", color: "bg-purple-100 text-purple-700 border-purple-200" },
                              { key: "labelAuthorArticle", label: "ARTYKUŁ AUTORA", color: "bg-teal-100 text-teal-700 border-teal-200" },
                              { key: "label18Plus", label: "18+", color: "bg-rose-100 text-rose-700 border-rose-200" },
                              { key: "labelDepresja", label: "DEPRESJA", color: "bg-violet-100 text-violet-700 border-violet-200" },
                              { key: "labelBeingUpdated", label: "W TRAKCIE AKTUALIZACJI", color: "bg-amber-100 text-amber-700 border-amber-200" },
                            ].map(({ key, label, color }) => (
                              <button key={key} type="button" onClick={() => set(key as keyof ArticleType, !(form as any)[key])}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border-2 transition-all ${(form as any)[key] ? color + " border-current" : "bg-muted text-muted-foreground border-border hover:border-border/80"}`}
                              >{label}</button>
                            ))}
                          </div>

                          <div className="space-y-2">
                            {[
                              { key: "featured", label: "Wyróżniony artykuł", desc: "Pokaż w sekcji wyróżnionych" },
                              { key: "isPatronage", label: "Patronat medialny", desc: "Dodaj oznaczenie patronatu" },
                            ].map(({ key, label, desc }) => (
                              <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                                <div>
                                  <p className="text-xs font-semibold text-foreground">{label}</p>
                                  <p className="text-xs text-muted-foreground">{desc}</p>
                                </div>
                                <Switch checked={(form as any)[key] ?? false} onCheckedChange={v => set(key as keyof ArticleType, v)} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CollapsibleSection>

                      <CollapsibleSection title="Tagi" defaultOpen={true}>
                        <div className="flex gap-2 mb-2">
                          <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Dodaj tag..." className="h-8 text-sm flex-1" />
                          <Button size="sm" variant="outline" onClick={addTag} className="h-8 px-2"><Plus className="w-3.5 h-3.5" /></Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {form.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs gap-1 cursor-pointer" onClick={() => removeTag(tag)}>#{tag}<span className="text-muted-foreground hover:text-foreground">×</span></Badge>
                          ))}
                        </div>
                      </CollapsibleSection>

                      <CollapsibleSection title="Widoczność i Komentarze" defaultOpen={true}>
                        <div className="space-y-2">
                          {[
                            { key: "hideInReels", label: "Ukryj w Reels", desc: "Artykuł nie pojawi się w sekcji Reels" },
                            { key: "skipHomepage", label: "Pomiń stronę główną", desc: "Nie wyświetlaj na stronie głównej" },
                            { key: "allowComments", label: "Komentarze", desc: "Zezwól na komentarze pod artykułem" },
                            { key: "showUpdates", label: "Pokaż aktualizacje", desc: "Wyświetl sekcję aktualizacji" },
                          ].map(({ key, label, desc }) => (
                            <div key={key} className="flex items-center justify-between gap-3 py-1">
                              <div>
                                <p className="text-xs font-medium">{label}</p>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                              </div>
                              <Switch checked={(form as any)[key] ?? false} onCheckedChange={v => set(key as keyof ArticleType, v)} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>

                      <CollapsibleSection title="Slug / Odnośnik artykułu" defaultOpen={false}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex-shrink-0">/</span>
                            <Input
                              value={form.slug ?? ""}
                              onChange={e => { setSlugManuallyEdited(true); set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-")); }}
                              placeholder="slug-artykulu"
                              className="h-8 text-xs font-mono flex-1"
                            />
                          </div>
                          {article?._id && (
                            <a
                              href={`/${form.slug || article._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs text-primary hover:underline break-all font-mono"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              /{form.slug || article._id}
                            </a>
                          )}
                          <button type="button" onClick={copySlugUrl}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {slugCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            Kopiuj link do artykułu
                          </button>
                        </div>
                      </CollapsibleSection>

                      <CollapsibleSection title="Informacja Stopki" defaultOpen={false}>
                        <Textarea value={form.footerInfo ?? ""} onChange={e => set("footerInfo", e.target.value)} placeholder="Dodatkowe informacje w stopce artykułu..." className="min-h-[70px] resize-none text-sm" />
                      </CollapsibleSection>
                    </div>
                  </div>
                )}

                {bottomTab === "appearance" && (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <CollapsibleSection title="Tożsamość wizualna artykułu" defaultOpen={true}>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <Label className="text-xs mb-1.5 block">Styl stopki autora</Label>
                          <div className="grid gap-2">
                            {[
                              { value: "graphic", label: "Stopka autora", desc: "Nowoczesna karta pod artykułem" },
                              { value: "business", label: "Wizytówkowa", desc: "Formalny układ ekspercki" },
                              { value: "classic", label: "Klasyczna", desc: "Mocniejsza, editorialowa stopka" },
                              { value: "none", label: "Bez stopki", desc: "Ukryj moduł autora" },
                            ].map(opt => {
                              const isSelected = (form.authorFooterStyle ?? "graphic") === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => set("authorFooterStyle", opt.value)}
                                  className={`rounded-xl border p-3 text-left transition-all ${
                                    isSelected ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/30 hover:bg-muted/20"
                                  }`}
                                >
                                  <p className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
                                  <p className="mt-1 text-[11px] text-muted-foreground">{opt.desc}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs mb-1.5 block">Informacja w stopce</Label>
                          <Textarea value={form.footerInfo ?? ""} onChange={e => set("footerInfo", e.target.value)} placeholder="Dodatkowe informacje w stopce artykułu..." className="min-h-[170px] resize-none text-sm" />
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Podgląd stopki autora" defaultOpen={true}>
                      {form.author && (form.authorFooterStyle ?? "graphic") !== "none" ? (
                        <div className="pointer-events-none opacity-95">
                          <AuthorFooterCard
                            authorName={form.author}
                            coauthorName={form.coauthor}
                            coauthor2={form.coauthor2}
                            coauthor3={form.coauthor3}
                            style={form.authorFooterStyle as "graphic" | "business" | "classic" | "none" | undefined}
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-xs text-muted-foreground">
                          Dodaj autora i wybierz styl, aby zobaczyć podgląd stopki.
                        </div>
                      )}
                    </CollapsibleSection>
                  </div>
                )}

                {bottomTab === "layout" && (
                  <LayoutTab form={form} set={set as (key: string, value: unknown) => void} />
                )}

                {bottomTab === "sources" && (
                  <div className="space-y-4">
                    <CollapsibleSection title="Główne źródło" defaultOpen={true}>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs mb-1.5 block">Nazwa źródła</Label>
                          <Input value={form.sourceName ?? ""} onChange={e => set("sourceName", e.target.value)} placeholder="np. Urząd Miasta Bydgoszczy" className="h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs mb-1.5 block">URL źródła</Label>
                          <div className="flex gap-1">
                            <Input value={form.sourceUrl ?? ""} onChange={e => set("sourceUrl", e.target.value)} placeholder="https://..." className="h-9 text-sm flex-1" />
                            {form.sourceUrl && (
                              <a href={form.sourceUrl} target="_blank" rel="noreferrer" className="h-9 w-9 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors flex-shrink-0">
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Dodatkowe źródła" defaultOpen={true} badge={extraSources.length > 0 ? String(extraSources.length) : undefined}>
                      <div className="space-y-2">
                        {extraSources.map((src, i) => (
                          <div key={i} className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Label className="text-xs mb-1 block">Nazwa</Label>
                              <Input value={src.name} onChange={e => updateExtraSource(i, "name", e.target.value)} placeholder="Nazwa źródła" className="h-8 text-sm" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs mb-1 block">URL</Label>
                              <Input value={src.url} onChange={e => updateExtraSource(i, "url", e.target.value)} placeholder="https://..." className="h-8 text-sm" />
                            </div>
                            <button type="button" onClick={() => removeExtraSource(i)} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-red-100 hover:text-red-600 text-muted-foreground transition-colors flex-shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={addExtraSource}
                          className="w-full h-8 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Dodaj źródło
                        </button>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Źródła (tekst)" defaultOpen={false}>
                      <Textarea value={form.sources ?? ""} onChange={e => set("sources", e.target.value)} placeholder="Źródła informacji, skąd brano dane..." className="min-h-[70px] resize-none text-sm" />
                    </CollapsibleSection>

                    <CollapsibleSection title="Bibliografia" defaultOpen={false}>
                      <Textarea value={form.bibliography ?? ""} onChange={e => set("bibliography", e.target.value)} placeholder="Lista źródeł bibliograficznych..." className="min-h-[70px] resize-none text-sm" />
                    </CollapsibleSection>
                  </div>
                )}

                {bottomTab === "additional" && (
                  <div className="grid grid-cols-1 gap-4">
                    {/* Aktualizacja publikacji — toggle only, editing in main editor */}
                    <CollapsibleSection title="Aktualizacja publikacji" defaultOpen={true}>
                      <div className="space-y-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={togglePublicationUpdates}
                          className={`w-full justify-center ${form.showUpdates ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10" : ""}`}
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          {form.showUpdates ? "Aktualizacje publikacji: Włączone ✓" : "Aktualizacje publikacji: Włącz"}
                        </Button>
                        {form.showUpdates && (
                          <p className="text-[11px] text-muted-foreground text-center">Moduł aktualizacji widoczny w edytorze powyżej ↑</p>
                        )}
                      </div>
                    </CollapsibleSection>

                    {/* Ankieta — toggle only, editing in main editor */}
                    <CollapsibleSection title="Ankieta" defaultOpen={true}>
                      <div className="space-y-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const nextPoll = form.poll?.enabled ? { ...form.poll, enabled: false } : { ...(form.poll ?? createDefaultPoll()), enabled: true };
                            set("poll", nextPoll);
                          }}
                          className={`w-full justify-center ${form.poll?.enabled ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10" : ""}`}
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          {form.poll?.enabled ? "Ankieta: Włączona ✓" : "Ankieta: Dodaj"}
                        </Button>
                        {form.poll?.enabled && (
                          <p className="text-[11px] text-muted-foreground text-center">Moduł ankiety widoczny w edytorze powyżej ↑</p>
                        )}
                      </div>
                    </CollapsibleSection>

                    {/* Partner / Sponsor */}
                    <CollapsibleSection title="Partner / Sponsor" defaultOpen={true}>
                      <div className="space-y-3">
                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20 px-4 py-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-2">Karta partnera</p>
                          <p className="text-[11px] leading-relaxed text-muted-foreground mb-3">
                            Wyświetla się nad tytułem artykułu na środku strony. Jeśli dodasz logo, zastąpi ono nazwę.
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input value={form.partnerName ?? ""} onChange={e => set("partnerName", e.target.value)} placeholder="Nazwa partnera" className="h-8 text-sm" />
                            <div className="flex gap-1">
                              <Input value={form.partnerUrl ?? ""} onChange={e => set("partnerUrl", e.target.value)} placeholder="URL partnera" className="h-8 text-sm flex-1" />
                              {form.partnerUrl && (
                                <a href={form.partnerUrl} target="_blank" rel="noreferrer" className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors flex-shrink-0">
                                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                </a>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Input value={form.partnerLogoUrl ?? ""} onChange={e => set("partnerLogoUrl", e.target.value)} placeholder="URL logo partnera" className="h-8 text-sm flex-1" />
                              <Button type="button" variant="outline" size="sm" className="h-8 px-2 text-xs shrink-0" onClick={() => setIsPartnerLogoMediaPickerOpen(true)}>
                                <ImageIcon className="w-3 h-3 mr-1" />Biblioteka
                              </Button>
                            </div>
                            <Input value={form.partnerLabel ?? ""} onChange={e => set("partnerLabel", e.target.value)} placeholder="Etykieta, np. Partner artykułu" className="h-8 text-sm" />
                          </div>
                          {form.partnerLogoUrl && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-border h-16 flex items-center justify-center bg-background">
                              <img src={form.partnerLogoUrl} alt={form.partnerName || "Logo partnera"} className="max-h-14 max-w-[180px] object-contain" />
                            </div>
                          )}
                          {(form.partnerName || form.partnerLogoUrl || form.partnerLabel) && (
                            <div className="mt-3 rounded-2xl border border-border bg-background p-4 text-center">
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground mb-2">
                                {form.partnerLabel || "Partner / Sponsor artykułu"}
                              </p>
                              {form.partnerLogoUrl ? (
                                <img src={form.partnerLogoUrl} alt={form.partnerName || "Partner"} className="mx-auto max-h-12 max-w-[160px] object-contain" title={form.partnerName || undefined} />
                              ) : form.partnerName ? (
                                <p className="text-lg font-black text-foreground">{form.partnerName}</p>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleSection>
                  </div>
                )}
          </div>}
        </section>
      </div>
    </div>

    {/* Block Insert Modal (2.0) */}
    {blockInsertModal && (
      <BlockInsertModal
        blockType={blockInsertModal.type}
        onInsert={(html) => {
          if (editor) editor.chain().focus().insertContent(html).run();
          setBlockInsertModal(null);
        }}
        onClose={() => setBlockInsertModal(null)}
      />
    )}

    {/* Media Library Picker */}
    <MediaLibraryPicker
      open={isMediaPickerOpen}
      onClose={() => setIsMediaPickerOpen(false)}
      onSelect={(asset: any) => {
        if (asset?.url) {
          set("imageUrl", asset.url);
        }
        setIsMediaPickerOpen(false);
      }}
      sourceKind="article"
      accept="image"
      title="Wybierz zdjęcie główne"
    />

    {/* Partner Logo Media Library Picker */}
    <MediaLibraryPicker
      open={isPartnerLogoMediaPickerOpen}
      onClose={() => setIsPartnerLogoMediaPickerOpen(false)}
      onSelect={(asset: any) => {
        if (asset?.url) {
          set("partnerLogoUrl", asset.url);
        }
        setIsPartnerLogoMediaPickerOpen(false);
      }}
      sourceKind="article"
      accept="image"
      title="Wybierz logo partnera"
    />

    {/* URL Input Modal */}
    <AnimatePresence>
      {urlInputModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => { urlInputModal.resolve(null); setUrlInputModal(null); setUrlInputValue(""); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="bg-popover border border-border rounded-2xl shadow-2xl p-5 w-full max-w-sm mx-4"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-sm font-semibold mb-1">{urlInputModal.label}</p>
            <p className="text-xs text-muted-foreground mb-3">Wklej lub wpisz adres URL</p>
            <input
              type="url"
              value={urlInputValue}
              onChange={e => setUrlInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && urlInputValue.trim()) {
                  urlInputModal.resolve(urlInputValue.trim());
                  setUrlInputModal(null);
                  setUrlInputValue("");
                }
                if (e.key === "Escape") {
                  urlInputModal.resolve(null);
                  setUrlInputModal(null);
                  setUrlInputValue("");
                }
              }}
              placeholder="https://..."
              className="w-full h-9 text-sm rounded-lg border border-input bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring mb-3"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { urlInputModal.resolve(null); setUrlInputModal(null); setUrlInputValue(""); }}
                className="h-8 px-3 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >Anuluj</button>
              <button
                type="button"
                onClick={() => {
                  if (urlInputValue.trim()) {
                    urlInputModal.resolve(urlInputValue.trim());
                    setUrlInputModal(null);
                    setUrlInputValue("");
                  }
                }}
                disabled={!urlInputValue.trim()}
                className="h-8 px-4 text-xs rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >Wstaw</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}