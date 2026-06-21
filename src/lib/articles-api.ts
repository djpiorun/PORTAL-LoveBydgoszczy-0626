import { apiFetch } from "@/lib/api-client";

export type Article = {
  id: string;
  _id: string;
  title: string;
  excerpt: string;
  content?: string | null;
  category: string;
  imageUrl?: string | null;
  imageAuthor?: string | null;
  authorImage?: string | null;
  author: string;
  authorUserId?: string | null;
  coauthor?: string | null;
  coauthorUserId?: string | null;
  publishedAt: number;
  updatedAt?: number | null;
  featured?: boolean | null;
  isPatronage?: boolean | null;
  tags?: string[] | null;
  hideInReels?: boolean | null;
  skipHomepage?: boolean | null;
  likes?: number | null;
  personName?: string | null;
  bydgoszczanie?: any;
  sourceName?: string | null;
  sourceUrl?: string | null;
  expertQuote?: string | null;
  slug?: string | null;
  labelUrgent?: boolean | null;
  labelImportant?: boolean | null;
  labelOurNews?: boolean | null;
  labelMustKnow?: boolean | null;
  labelAuthorArticle?: boolean | null;
  label18Plus?: boolean | null;
  labelDepresja?: boolean | null;
  bibliography?: string | null;
  sources?: string | null;
  footerInfo?: string | null;
  sourceFromContact?: string | null;
  articleType?: string | null;
  articleTemplate?: string | null;
  status?: string | null;
  scheduledAt?: string | null;
  layout?: string | null;
  partnerName?: string | null;
  partnerUrl?: string | null;
  partnerLogoUrl?: string | null;
  partnerLabel?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  allowComments?: boolean | null;
  showUpdates?: boolean | null;
  graphicsLayout?: string | null;
  categoryLayout?: string | null;
  articleElements?: any;
  coauthor2?: string | null;
  coauthor3?: string | null;
  corrector?: string | null;
  publisher?: string | null;
  authorFooterStyle?: string | null;
  poll?: any;
  quiz?: any;
  interview?: any;
  analysis?: any;
  report?: any;
  opinion?: any;
  dialog?: any;
  announcement?: any;
  sponsored?: any;
  sport?: any;
  politics?: any;
  investment?: any;
  ourActions?: any;
};

export type ArticleUpdate = {
  id: string;
  content: string;
  publishedAt?: number | null;
};

export type ArticlePollResults = {
  totalVotes: number;
  optionResults: Array<{ id: string; label: string; votes: number; percentage: number; [key: string]: any }>;
  averageRating: number | null;
  winnerId?: string | null;
  isClosed: boolean;
  poll?: any;
};

export type SubmitPollVoteResponse = {
  ok: boolean;
  code: string;
  message?: string;
  voteId?: string;
};

type ArticleQueryParams = {
  category?: string;
  limit?: number;
  perPage?: number;
  page?: number;
  featured?: boolean;
  patronage?: boolean;
  search?: string;
  author?: string;
  paginate?: boolean;
};

const toTimestamp = (value?: string | number | null) => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const unwrapResource = <T>(payload: any): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
};

const normalizeArticle = (data: any): Article => ({
  id: data.id,
  _id: data.id,
  title: data.title,
  excerpt: data.excerpt,
  content: data.content,
  category: data.category,
  imageUrl: data.image_url ?? null,
  imageAuthor: data.image_author ?? null,
  authorImage: data.author_image ?? data.author_image_url ?? data.authorImage ?? null,
  author: data.author,
  authorUserId: data.author_user_id ?? null,
  coauthor: data.coauthor ?? null,
  coauthorUserId: data.coauthor_user_id ?? null,
  publishedAt: toTimestamp(data.published_at),
  updatedAt: data.updated_at || data.updatedAt ? toTimestamp(data.updated_at ?? data.updatedAt) : null,
  featured: data.featured ?? null,
  isPatronage: data.is_patronage ?? null,
  tags: data.tags ?? null,
  hideInReels: data.hide_in_reels ?? null,
  skipHomepage: data.skip_homepage ?? null,
  likes: data.likes ?? null,
  personName: data.person_name ?? null,
  bydgoszczanie: data.bydgoszczanie ?? null,
  sourceName: data.source_name ?? null,
  sourceUrl: data.source_url ?? null,
  expertQuote: data.expert_quote ?? null,
  slug: data.slug ?? null,
  labelUrgent: data.label_urgent ?? null,
  labelImportant: data.label_important ?? null,
  labelOurNews: data.label_our_news ?? null,
  labelMustKnow: data.label_must_know ?? null,
  labelAuthorArticle: data.label_author_article ?? null,
  label18Plus: data.label_18_plus ?? null,
  labelDepresja: data.label_depresja ?? null,
  bibliography: data.bibliography ?? null,
  sources: data.sources ?? null,
  footerInfo: data.footer_info ?? null,
  sourceFromContact: data.source_from_contact ?? null,
  articleType: data.article_type ?? null,
  articleTemplate: data.article_template ?? null,
  status: data.status ?? null,
  scheduledAt: data.scheduled_at ?? null,
  layout: data.layout ?? null,
  partnerName: data.partner_name ?? null,
  partnerUrl: data.partner_url ?? null,
  partnerLogoUrl: data.partner_logo_url ?? null,
  partnerLabel: data.partner_label ?? null,
  seoTitle: data.seo_title ?? null,
  seoDescription: data.seo_description ?? null,
  allowComments: data.allow_comments ?? null,
  showUpdates: data.show_updates ?? null,
  graphicsLayout: data.graphics_layout ?? null,
  categoryLayout: data.category_layout ?? null,
  articleElements: data.article_elements ?? null,
  coauthor2: data.coauthor2 ?? null,
  coauthor3: data.coauthor3 ?? null,
  corrector: data.corrector ?? null,
  publisher: data.publisher ?? null,
  authorFooterStyle: data.author_footer_style ?? null,
  poll: data.poll ?? null,
  quiz: data.quiz ?? null,
  interview: data.interview ?? null,
  analysis: data.analysis ?? null,
  report: data.report ?? null,
  opinion: data.opinion ?? null,
  dialog: data.dialog ?? null,
  announcement: data.announcement ?? null,
  sponsored: data.sponsored ?? null,
  sport: data.sport ?? null,
  politics: data.politics ?? null,
  investment: data.investment ?? null,
  ourActions: data.our_actions ?? null,
});

const buildParams = (params: ArticleQueryParams) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "boolean") {
      if (value) searchParams.set(key, "true");
      return;
    }
    searchParams.set(key, String(value));
  });
  return searchParams.toString();
};

export async function fetchArticles(params: ArticleQueryParams = {}) {
  const query = buildParams(params);
  const payload = await apiFetch<any>(`/articles${query ? `?${query}` : ""}`);
  const data = unwrapResource<any[]>(payload) ?? [];
  return Array.isArray(data) ? data.map(normalizeArticle) : [];
}

export async function fetchPaginatedArticles(params: ArticleQueryParams = {}) {
  const query = buildParams({ ...params, paginate: true });
  const payload = await apiFetch<any>(`/articles${query ? `?${query}` : ""}`);
  const data = unwrapResource<any[]>(payload) ?? [];
  return {
    articles: Array.isArray(data) ? data.map(normalizeArticle) : [],
    meta: payload?.meta ?? null,
    links: payload?.links ?? null,
  };
}

export async function fetchArticleById(id: string) {
  const payload = await apiFetch<any>(`/articles/${id}`);
  return normalizeArticle(unwrapResource(payload));
}

export async function fetchArticleBySlug(slug: string) {
  const payload = await apiFetch<any>(`/articles/slug/${slug}`);
  return normalizeArticle(unwrapResource(payload));
}

export async function fetchArticleUpdates(articleId: string): Promise<ArticleUpdate[]> {
  const payload = await apiFetch<{ data: any[] }>(`/articles/${articleId}/updates`);
  return (payload?.data ?? []).map((update) => ({
    id: update.id,
    content: update.content,
    publishedAt: toTimestamp(update.published_at),
  }));
}

export async function fetchArticlePollResults(articleId: string): Promise<ArticlePollResults | null> {
  return await apiFetch<ArticlePollResults | null>(`/articles/${articleId}/poll-results`);
}

export async function submitArticlePollVote(
  articleId: string,
  payload: { voterKey: string; selections?: string[]; rating?: number },
): Promise<SubmitPollVoteResponse> {
  return await apiFetch<SubmitPollVoteResponse>(`/articles/${articleId}/poll-votes`, {
    method: "POST",
    body: {
      voter_key: payload.voterKey,
      selections: payload.selections,
      rating: payload.rating,
    },
  });
}
