import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { articleAnalysisValidator, articleAnnouncementValidator, articleBydgoszczanieValidator, articleDialogValidator, articleInterviewValidator, articleInvestmentValidator, articleOpinionValidator, articleOurActionsValidator, articlePollValidator, articlePoliticsValidator, articleQuizValidator, articleReportValidator, articleSportValidator, articleSponsoredValidator, categoryValidator } from "./schema";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const ARTICLE_TITLE_MAX_LENGTH = 120;

function normalizeArticleTitle(title: string) {
  const normalized = title.trim().replace(/\s+/g, " ");
  if (!normalized) {
    throw new Error("Tytuł artykułu jest wymagany.");
  }
  if (normalized.length > ARTICLE_TITLE_MAX_LENGTH) {
    throw new Error(`Tytuł artykułu może mieć maksymalnie ${ARTICLE_TITLE_MAX_LENGTH} znaków.`);
  }
  return normalized;
}

function isPublicArticle(article: { status?: string; publishedAt: number; articleType?: string; quiz?: { enabled?: boolean; isPublic?: boolean; status?: string }; interview?: { enabled?: boolean; status?: string }; analysis?: { enabled?: boolean }; report?: { enabled?: boolean }; opinion?: { enabled?: boolean }; dialog?: { enabled?: boolean }; announcement?: { enabled?: boolean }; sponsored?: { enabled?: boolean } }) {
  const articleVisible = article.status === undefined
    || article.status === "published"
    || (article.status === "scheduled" && article.publishedAt <= Date.now());

  if (!articleVisible) return false;
  if (article.articleType === "quiz") {
    return !!article.quiz?.enabled
      && article.quiz.isPublic !== false
      && article.quiz.status !== "draft"
      && article.quiz.status !== "hidden"
      && article.quiz.status !== "template"
      && article.quiz.status !== "archived"
      && article.quiz.status !== "preview";
  }
  if (article.articleType === "interview") {
    return !!article.interview?.enabled
      && article.interview.status !== "hidden";
  }
  if (article.articleType === "analysis") {
    return article.analysis?.enabled !== false;
  }
  if (article.articleType === "report") {
    return article.report?.enabled !== false;
  }
  if (article.articleType === "opinion") {
    return article.opinion?.enabled !== false;
  }
  if (article.articleType === "dialog") {
    return article.dialog?.enabled !== false;
  }
  if (article.articleType === "press_release") {
    return article.announcement?.enabled !== false;
  }
  if (article.articleType === "sponsored") {
    return article.sponsored?.enabled !== false;
  }

  return true;
}

function buildArticleSlug(title: string) {
  const normalized = title
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => ({ ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.slice(0, 72).replace(/-+$/g, "") || "artykul";
}

async function hydrateInterviewBlocks(ctx: any, article: any) {
  if (!article || article.articleType !== "interview") return article;

  const blocks = await ctx.db
    .query("article_interview_blocks")
    .withIndex("by_article_order", (q: any) => q.eq("articleId", article._id))
    .order("asc")
    .collect();

  return {
    ...article,
    interview: article.interview
      ? {
          ...article.interview,
          blocks: blocks.map((block: any) => ({
            id: `${article._id}-${block.order}`,
            type: block.type,
            content: block.content,
            title: block.title,
            speakerId: block.speakerId,
            hidden: block.hidden,
          })),
        }
      : article.interview,
  };
}

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const normalizedId = ctx.db.normalizeId("articles", args.id);
    if (!normalizedId) return null;
    const article = await ctx.db.get(normalizedId);
    if (!article || !isPublicArticle(article)) return null;
    return await hydrateInterviewBlocks(ctx, article);
  },
});

export const getForSitemap = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(1000);
    return articles
      .filter(isPublicArticle)
      .map((a) => ({
        slug: a.slug || null,
        title: a.title,
        publishedAt: a.publishedAt,
        updatedAt: (a as any).updatedAt ?? null,
      }));
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withSearchIndex("search_title", (q) => q.search("title", args.query))
      .take(10);
  },
});

export const list = query({
  args: {
    category: v.optional(categoryValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 10, 50);
    let articles;
    if (args.category) {
      articles = await ctx.db
        .query("articles")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(limit);
    } else {
      articles = await ctx.db
        .query("articles")
        .withIndex("by_publishedAt")
        .order("desc")
        .take(limit);
    }
    // Only join author images if authorUserId is present - avoid N+1 for articles without it
    const userIds = [...new Set(articles.map(a => a.authorUserId).filter(Boolean))];
    const userMap = new Map<string, string>();
    for (const uid of userIds) {
      const user = await ctx.db.get(uid as any);
      const userImage = (user as any)?.image;
      if (userImage) userMap.set(uid as string, userImage);
    }
    return articles.map(article => {
      if (article.authorUserId && userMap.has(article.authorUserId as string)) {
        return { ...article, authorImageUrl: userMap.get(article.authorUserId as string) };
      }
      return article;
    });
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .order("desc")
      .take(20);
    return articles.filter(isPublicArticle).slice(0, 5);
  },
});

export const getLatest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 6;
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(limit * 3);
    return articles.filter(isPublicArticle).slice(0, limit);
  },
});

export const getPatronages = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_isPatronage", (q) => q.eq("isPatronage", true))
      .order("desc")
      .take(limit * 3);
    return articles.filter(isPublicArticle).slice(0, limit);
  },
});

export const getReels = query({
  args: { 
    limit: v.optional(v.number()),
    category: v.optional(categoryValidator)
  },
  handler: async (ctx, args) => {
    let articles;
    if (args.category) {
      articles = await ctx.db
        .query("articles")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(args.limit ?? 50);
    } else {
      articles = await ctx.db
        .query("articles")
        .withIndex("by_publishedAt")
        .order("desc")
        .take(args.limit ?? 50);
    }
    return articles.filter(a => !a.hideInReels && isPublicArticle(a));
  },
});

export const listPaginated = query({
  args: {
    category: v.optional(categoryValidator),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (args.category) {
      const result = await ctx.db
        .query("articles")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .paginate(args.paginationOpts);
      return { ...result, page: result.page.filter(isPublicArticle) };
    }
    const result = await ctx.db
      .query("articles")
      .withIndex("by_publishedAt")
      .order("desc")
      .paginate(args.paginationOpts);
    return { ...result, page: result.page.filter(isPublicArticle) };
  },
});

export const getByAuthor = query({
  args: {
    author: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_author", (q) => q.eq("author", args.author))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").order("desc").take(200);
    return await Promise.all(articles.map((article) => hydrateInterviewBlocks(ctx, article)));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (article && isPublicArticle(article)) {
      return await hydrateInterviewBlocks(ctx, article);
    }

    // Legacy fallback - limit to 500 instead of 2000
    const legacyArticles = await ctx.db
      .query("articles")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(500);
    const legacyArticle = legacyArticles.find((entry) => buildArticleSlug(entry.title) === args.slug);

    if (!legacyArticle || !isPublicArticle(legacyArticle)) return null;
    return await hydrateInterviewBlocks(ctx, legacyArticle);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: categoryValidator,
    imageUrl: v.optional(v.string()),
    imageAuthor: v.optional(v.string()),
    author: v.string(),
    coauthor: v.optional(v.string()),
    coauthor2: v.optional(v.string()),
    coauthor3: v.optional(v.string()),
    publishedAt: v.number(),
    featured: v.optional(v.boolean()),
    isPatronage: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    hideInReels: v.optional(v.boolean()),
    personName: v.optional(v.string()),
    bydgoszczanie: v.optional(articleBydgoszczanieValidator),
    sourceName: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    expertQuote: v.optional(v.string()),
    slug: v.optional(v.string()),
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
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("scheduled"),
      v.literal("archived"),
      v.literal("template"),
      v.literal("preview"),
    )),
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
    labelUrgent: v.optional(v.boolean()),
    labelImportant: v.optional(v.boolean()),
    labelOurNews: v.optional(v.boolean()),
    labelMustKnow: v.optional(v.boolean()),
    labelAuthorArticle: v.optional(v.boolean()),
    label18Plus: v.optional(v.boolean()),
    labelDepresja: v.optional(v.boolean()),
    labelBeingUpdated: v.optional(v.boolean()),
    bibliography: v.optional(v.string()),
    sources: v.optional(v.string()),
    footerInfo: v.optional(v.string()),
    sourceFromContact: v.optional(v.string()),
    skipHomepage: v.optional(v.boolean()),
    sport: v.optional(articleSportValidator),
    politics: v.optional(articlePoliticsValidator),
    investment: v.optional(articleInvestmentValidator),
    ourActions: v.optional(articleOurActionsValidator),
    graphicsLayout: v.optional(v.string()),
    categoryLayout: v.optional(v.string()),
    authorFooterStyle: v.optional(v.union(
      v.literal("graphic"),
      v.literal("business"),
      v.literal("classic"),
      v.literal("none"),
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
    corrector: v.optional(v.string()),
    publisher: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
    articleElements: v.optional(v.array(v.object({
      id: v.string(),
      label: v.string(),
      icon: v.string(),
      enabled: v.boolean(),
      locked: v.boolean(),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");

    const normalizedTitle = normalizeArticleTitle(args.title);

    let slug = args.slug;
    if (!slug && normalizedTitle) {
      slug = buildArticleSlug(normalizedTitle);
      let counter = 2;
      let candidateSlug = slug!;
      while (true) {
        const existing = await ctx.db.query("articles").withIndex("by_slug", (q) => q.eq("slug", candidateSlug)).unique();
        if (!existing) { slug = candidateSlug; break; }
        candidateSlug = `${slug}-${counter}`;
        counter++;
      }
    }

    const articleId = await ctx.db.insert("articles", { ...args, title: normalizedTitle, slug });

    if (args.status === "published" || args.status === undefined) {
      await ctx.db.insert("updates", {
        title: `Nowa Publikacja: ${normalizedTitle}`,
        description: args.excerpt,
        linkUrl: `/${slug || articleId}`,
        linkLabel: "Czytaj",
        category: args.category,
        publishedAt: Date.now(),
        author: args.author,
      });
    }

    return articleId;
  },
});

export const update = mutation({
  args: {
    id: v.id("articles"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(categoryValidator),
    imageUrl: v.optional(v.string()),
    imageAuthor: v.optional(v.string()),
    author: v.optional(v.string()),
    coauthor: v.optional(v.string()),
    coauthor2: v.optional(v.string()),
    coauthor3: v.optional(v.string()),
    corrector: v.optional(v.string()),
    publisher: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    isPatronage: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    hideInReels: v.optional(v.boolean()),
    likes: v.optional(v.number()),
    personName: v.optional(v.string()),
    bydgoszczanie: v.optional(articleBydgoszczanieValidator),
    sourceName: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    expertQuote: v.optional(v.string()),
    slug: v.optional(v.string()),
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
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("scheduled"),
      v.literal("archived"),
      v.literal("template"),
      v.literal("preview"),
    )),
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
    labelUrgent: v.optional(v.boolean()),
    labelImportant: v.optional(v.boolean()),
    labelOurNews: v.optional(v.boolean()),
    labelMustKnow: v.optional(v.boolean()),
    labelAuthorArticle: v.optional(v.boolean()),
    label18Plus: v.optional(v.boolean()),
    labelDepresja: v.optional(v.boolean()),
    labelBeingUpdated: v.optional(v.boolean()),
    bibliography: v.optional(v.string()),
    sources: v.optional(v.string()),
    footerInfo: v.optional(v.string()),
    sourceFromContact: v.optional(v.string()),
    skipHomepage: v.optional(v.boolean()),
    sport: v.optional(articleSportValidator),
    politics: v.optional(articlePoliticsValidator),
    investment: v.optional(articleInvestmentValidator),
    ourActions: v.optional(articleOurActionsValidator),
    graphicsLayout: v.optional(v.string()),
    categoryLayout: v.optional(v.string()),
    authorFooterStyle: v.optional(v.union(
      v.literal("graphic"),
      v.literal("business"),
      v.literal("classic"),
      v.literal("none"),
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
    updatedAt: v.optional(v.number()),
    articleElements: v.optional(v.array(v.object({
      id: v.string(),
      label: v.string(),
      icon: v.string(),
      enabled: v.boolean(),
      locked: v.boolean(),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    const { id, ...updates } = args;

    // Validate slug uniqueness if slug is being changed
    if (typeof updates.slug === "string" && updates.slug.trim()) {
      const existing = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug!))
        .first();
      if (existing && existing._id !== id) {
        throw new Error(`Slug "${updates.slug}" jest już zajęty przez inny artykuł.`);
      }
    }

    const nextUpdates = {
      ...updates,
      ...(typeof updates.title === "string" ? { title: normalizeArticleTitle(updates.title) } : {}),
    };

    await ctx.db.patch(id, nextUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    const blocks = await ctx.db
      .query("article_interview_blocks")
      .withIndex("by_article", (q) => q.eq("articleId", args.id))
      .collect();
    for (const block of blocks) {
      await ctx.db.delete(block._id);
    }
    await ctx.db.delete(args.id);
  },
});

export const clearInterviewBlocks = mutation({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");

    const blocks = await ctx.db
      .query("article_interview_blocks")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect();

    for (const block of blocks) {
      await ctx.db.delete(block._id);
    }
  },
});

export const addInterviewBlocksBatch = mutation({
  args: {
    articleId: v.id("articles"),
    startOrder: v.number(),
    blocks: v.array(v.object({
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
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");

    for (let index = 0; index < args.blocks.length; index += 1) {
      const block = args.blocks[index];
      await ctx.db.insert("article_interview_blocks", {
        articleId: args.articleId,
        order: args.startOrder + index,
        type: block.type,
        content: block.content,
        title: block.title,
        speakerId: block.speakerId,
        hidden: block.hidden,
      });
    }
  },
});

export const updateLike = mutation({
  args: { id: v.id("articles"), isLiked: v.boolean() },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) return;
    const currentLikes = article.likes ?? 0;
    const newLikes = args.isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    await ctx.db.patch(args.id, { likes: newLikes });
  }
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getUpdates = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("article_updates")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .order("desc")
      .take(50);
  },
});

export const addUpdate = mutation({
  args: {
    articleId: v.id("articles"),
    title: v.string(),
    content: v.string(),
    author: v.string(),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    return await ctx.db.insert("article_updates", {
      ...args,
      publishedAt: args.publishedAt ?? Date.now(),
    });
  },
});

export const updateArticleUpdate = mutation({
  args: {
    id: v.id("article_updates"),
    content: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

function getPollState(article: any) {
  const poll = article?.poll;
  if (!poll || !poll.enabled || poll.status === "hidden") return { poll, isAvailable: false, isClosed: true };

  const now = Date.now();
  const isBeforeStart = poll.startDate && poll.startDate > now;
  const isAfterEnd = poll.endDate && poll.endDate < now;
  const isClosed = poll.status === "closed" || (poll.autoCloseAfterEnd && !!poll.endDate && isAfterEnd);

  return {
    poll,
    isAvailable: !isBeforeStart && !isClosed,
    isClosed,
  };
}

export const getPollResults = query({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article?.poll?.enabled) return null;

    const votes = await ctx.db
      .query("article_poll_votes")
      .withIndex("by_article_poll", (q) => q.eq("articleId", args.articleId).eq("pollId", article.poll!.pollId))
      .collect();

    const optionVotes = new Map<string, number>();
    let ratingSum = 0;
    let ratingCount = 0;

    for (const vote of votes) {
      for (const selection of vote.selections ?? []) {
        optionVotes.set(selection, (optionVotes.get(selection) ?? 0) + 1);
      }
      if (typeof vote.rating === "number") {
        ratingSum += vote.rating;
        ratingCount += 1;
      }
    }

    const totalVotes = votes.length;
    const optionResults = article.poll.options.map((option: any) => {
      const votesCount = optionVotes.get(option.id) ?? 0;
      const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
      return {
        ...option,
        votes: votesCount,
        percentage,
      };
    });

    const winner = optionResults.reduce<{ id?: string; votes: number }>((current, option) => {
      if (option.votes > current.votes) {
        return { id: option.id, votes: option.votes };
      }
      return current;
    }, { votes: -1 });

    return {
      totalVotes,
      optionResults,
      averageRating: ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(1)) : null,
      winnerId: winner.id,
      isClosed: getPollState(article).isClosed,
      poll: article.poll,
    };
  },
});

export const submitPollVote = mutation({
  args: {
    articleId: v.id("articles"),
    voterKey: v.string(),
    selections: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article?.poll?.enabled) {
      return {
        ok: false as const,
        code: "poll_unavailable" as const,
        message: "Ankieta nie jest dostępna",
      };
    }

    const { poll, isAvailable, isClosed } = getPollState(article);
    if (!poll) {
      return {
        ok: false as const,
        code: "missing_poll" as const,
        message: "Brak ankiety",
      };
    }
    if (isClosed) {
      return {
        ok: false as const,
        code: "poll_closed" as const,
        message: poll.closedLabel || poll.endMessage || "Ankieta została zakończona",
      };
    }
    if (!isAvailable) {
      return {
        ok: false as const,
        code: "poll_inactive" as const,
        message: "Ankieta nie jest jeszcze aktywna",
      };
    }

    const userId = await getAuthUserId(ctx);
    if (poll.requireLogin && !userId) {
      return {
        ok: false as const,
        code: "login_required" as const,
        message: "Głosowanie wymaga zalogowania",
      };
    }
    if (!poll.allowAnonymous && !userId) {
      return {
        ok: false as const,
        code: "anonymous_disabled" as const,
        message: "Głosowanie anonimowe jest wyłączone",
      };
    }

    const selectionIds = args.selections ?? [];
    const validOptionIds = new Set(poll.options.map((option: any) => option.id));

    if (poll.type === "scale") {
      if (typeof args.rating !== "number") {
        return {
          ok: false as const,
          code: "missing_rating" as const,
          message: "Wybierz ocenę",
        };
      }
      const min = poll.scaleMin ?? 1;
      const max = poll.scaleMax ?? 5;
      if (args.rating < min || args.rating > max) {
        return {
          ok: false as const,
          code: "rating_out_of_range" as const,
          message: "Ocena jest poza zakresem",
        };
      }
    } else {
      if (selectionIds.length === 0) {
        return {
          ok: false as const,
          code: "missing_selection" as const,
          message: "Wybierz odpowiedź",
        };
      }
      if (selectionIds.some((selectionId) => !validOptionIds.has(selectionId))) {
        return {
          ok: false as const,
          code: "invalid_selection" as const,
          message: "Wybrano nieprawidłową odpowiedź",
        };
      }
      if ((poll.type === "single" || poll.type === "duel") && selectionIds.length !== 1) {
        return {
          ok: false as const,
          code: "single_selection_required" as const,
          message: "Możesz wybrać tylko jedną odpowiedź",
        };
      }
      if (poll.type === "multiple") {
        const maxSelections = poll.maxSelections ?? 2;
        if (selectionIds.length > maxSelections) {
          return {
            ok: false as const,
            code: "too_many_selections" as const,
            message: `Możesz wybrać maksymalnie ${maxSelections} odpowiedzi`,
          };
        }
      }
    }

    let existingVote = null as any;
    if (poll.voteLimitMode === "single_user" && userId) {
      existingVote = await ctx.db
        .query("article_poll_votes")
        .withIndex("by_poll_user", (q) => q.eq("pollId", poll.pollId).eq("userId", userId))
        .first();
    } else if (poll.voteLimitMode !== "none") {
      existingVote = await ctx.db
        .query("article_poll_votes")
        .withIndex("by_poll_voter", (q) => q.eq("pollId", poll.pollId).eq("voterKey", args.voterKey))
        .first();
    }

    if (existingVote) {
      if (poll.voteLimitMode === "revote_after_time") {
        const retryAfter = (poll.revoteAfterHours ?? 24) * 60 * 60 * 1000;
        if (existingVote.createdAt + retryAfter > Date.now()) {
          return {
            ok: false as const,
            code: "revote_blocked" as const,
            message: poll.repeatVoteError || "Możesz zagłosować ponownie później",
          };
        }
      } else if (poll.voteLimitMode !== "none") {
        return {
          ok: false as const,
          code: "already_voted" as const,
          message: poll.repeatVoteError || "Ten głos został już oddany",
        };
      }

      await ctx.db.patch(existingVote._id, {
        selections: poll.type === "scale" ? undefined : selectionIds,
        rating: poll.type === "scale" ? args.rating : undefined,
        createdAt: Date.now(),
      });
      return {
        ok: true as const,
        code: "vote_updated" as const,
        voteId: existingVote._id,
      };
    }

    const voteId = await ctx.db.insert("article_poll_votes", {
      articleId: args.articleId,
      pollId: poll.pollId,
      userId: userId ?? undefined,
      voterKey: args.voterKey,
      selections: poll.type === "scale" ? undefined : selectionIds,
      rating: poll.type === "scale" ? args.rating : undefined,
      createdAt: Date.now(),
    });
    return {
      ok: true as const,
      code: "vote_saved" as const,
      voteId,
    };
  },
});

export const removeUpdate = mutation({
  args: { id: v.id("article_updates") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

export const backfillSlugs = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const articles = await ctx.db.query("articles").take(1000);
    let count = 0;
    for (const article of articles) {
      if (!article.slug) {
        let slug = buildArticleSlug(article.title);
        let counter = 2;
        let candidateSlug = slug;
        while (true) {
          const existing = await ctx.db.query("articles").withIndex("by_slug", (q) => q.eq("slug", candidateSlug)).first();
          if (!existing || existing._id === article._id) { slug = candidateSlug; break; }
          candidateSlug = `${slug}-${counter}`;
          counter++;
        }
        await ctx.db.patch(article._id, { slug });
        count++;
      }
    }
    return { updated: count };
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("articles").take(1);
    if (existing.length > 0) return;

    const now = Date.now();
    const day = 86400000;

    const articles = [
      {
        title: "Kompozytor, który uratował Filharmonię",
        excerpt: "Poznaj historię bydgoskiego kompozytora, którego twórczość przyciągnęła tłumy do lokalnej filharmonii i odmieniła jej losy.",
        content: "Pawbeats, a właściwie Marcin Pawłowski, to bydgoski kompozytor i producent muzyczny, który swoimi innowacyjnymi projektami łączącymi muzykę klasyczną z rozrywkową, przyciągnął nową publiczność do Filharmonii Pomorskiej.",
        category: "bydgoszczanie" as const,
        imageUrl: "https://images.unsplash.com/photo-1516280440502-65f536af1200?w=800&q=80",
        author: "Redakcja Love Bydgoszcz",
        publishedAt: now - 12 * 3600000,
        featured: true,
        tags: ["muzyka", "wywiad", "sylwetki"],
        personName: "Pawbeats",
      },
      {
        title: "Bydgoszcz w czołówce polskich miast smart city",
        excerpt: "Miasto inwestuje w nowoczesne technologie zarządzania ruchem i infrastrukturą miejską.",
        content: "Bydgoszcz konsekwentnie realizuje strategię smart city, wdrażając inteligentne systemy zarządzania ruchem, oświetlenie LED oraz platformy cyfrowe dla mieszkańców.",
        category: "miasto" as const,
        imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
        author: "Redakcja Love Bydgoszcz",
        publishedAt: now - day,
        featured: true,
        isPatronage: true,
        tags: ["smart city", "technologia", "inwestycje"],
      },
      {
        title: "Festiwal Muzyczny nad Brdą – program ogłoszony!",
        excerpt: "Największy letni festiwal muzyczny w Bydgoszczy powraca z gwiazdorską obsadą.",
        content: "Tegoroczna edycja Festiwalu Muzycznego nad Brdą zapowiada się wyjątkowo. Na scenie pojawią się artyści z całej Polski i Europy.",
        category: "rozrywka" as const,
        imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
        author: "Kultura Bydgoszcz",
        publishedAt: now - 2 * day,
        featured: true,
        isPatronage: true,
        tags: ["festiwal", "muzyka", "lato"],
      },
      {
        title: "Opera Nova – nowy sezon artystyczny",
        excerpt: "Bydgoska Opera Nova otwiera nowy sezon z ambitnymi premierami i gośćmi z zagranicy.",
        content: "Opera Nova w Bydgoszczy przygotowała wyjątkowy program na nowy sezon. Widzowie mogą spodziewać się premier operowych, baletowych i koncertów symfonicznych.",
        category: "kultura" as const,
        imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80",
        author: "Kultura Bydgoszcz",
        publishedAt: now - 3 * day,
        featured: false,
        tags: ["opera", "kultura", "teatr"],
      },
      {
        title: "Nowe centrum biznesowe przy ul. Fordońskiej",
        excerpt: "Kolejna inwestycja biurowa zmienia oblicze bydgoskiego rynku nieruchomości komercyjnych.",
        content: "Przy ulicy Fordońskiej powstaje nowoczesne centrum biznesowe klasy A, które zaoferuje ponad 15 000 m² powierzchni biurowej.",
        category: "biznes" as const,
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
        author: "Biznes Bydgoszcz",
        publishedAt: now - 4 * day,
        featured: false,
        tags: ["biznes", "nieruchomości", "inwestycje"],
      },
      {
        title: "Najlepsze restauracje w Bydgoszczy 2024",
        excerpt: "Przewodnik po najciekawszych miejscach kulinarnych w mieście – od tradycyjnej kuchni po fusion.",
        content: "Bydgoszcz ma coraz bogatszą scenę gastronomiczną. Prezentujemy ranking najlepszych restauracji, które warto odwiedzić w tym roku.",
        category: "gastronomia" as const,
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
        author: "Smaki Bydgoszczy",
        publishedAt: now - 5 * day,
        featured: true,
        tags: ["restauracje", "jedzenie", "przewodnik"],
      },
      {
        title: "Rewitalizacja Wyspy Młyńskiej zakończona",
        excerpt: "Historyczna Wyspa Młyńska odzyskała dawny blask po gruntownej rewitalizacji.",
        content: "Wyspa Młyńska, jedno z najpiękniejszych miejsc w Bydgoszczy, przeszła kompleksową rewitalizację. Nowe ścieżki, oświetlenie i zieleń przyciągają mieszkańców i turystów.",
        category: "miasto" as const,
        imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80",
        author: "Redakcja Love Bydgoszcz",
        publishedAt: now - 6 * day,
        featured: false,
        tags: ["rewitalizacja", "wyspa", "turystyka"],
      },
      {
        title: "Kawiarnie z klimatem – odkryj ukryte perełki",
        excerpt: "Bydgoszcz ma wiele urokliwych kawiarni, które warto odwiedzić w wolny weekend.",
        content: "Od klimatycznych kamienic Starego Miasta po nowoczesne lokale przy Brdzie – bydgoskie kawiarnie oferują wyjątkowe doświadczenia.",
        category: "gastronomia" as const,
        imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
        author: "Smaki Bydgoszczy",
        publishedAt: now - 7 * day,
        featured: false,
        tags: ["kawiarnie", "kawa", "weekend"],
      },
      {
        title: "Muzeum Okręgowe – nowa wystawa stała",
        excerpt: "Muzeum Okręgowe im. Leona Wyczółkowskiego otwiera nową wystawę poświęconą historii Bydgoszczy.",
        content: "Nowa wystawa stała w Muzeum Okręgowym prezentuje historię Bydgoszczy od średniowiecza do współczesności w nowoczesnej, multimedialnej formie.",
        category: "kultura" as const,
        imageUrl: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80",
        author: "Kultura Bydgoszcz",
        publishedAt: now - 8 * day,
        featured: false,
        tags: ["muzeum", "historia", "wystawa"],
      },
    ];

    for (const article of articles) {
      await ctx.db.insert("articles", article);
    }
  },
});

export const fixPatronageData = mutation({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").order("desc").take(10);
    // Set first 3 articles as patronage
    for (let i = 0; i < 3; i++) {
      if (articles[i]) {
        await ctx.db.patch(articles[i]._id, { isPatronage: true });
      }
    }
  }
});

export const seedBydgoszczanie = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const day = 86400000;

    const articles = [
      {
        title: "Mistrzyni olimpijska wraca do rodzinnego miasta",
        excerpt: "Po latach sukcesów na arenach międzynarodowych, wybitna wioślarka postanowiła założyć fundację wspierającą młode talenty w Bydgoszczy.",
        content: "Magdalena Fularczyk-Kozłowska, złota medalistka z Rio de Janeiro, ogłosiła start nowego projektu. Jej fundacja będzie pomagać młodym sportowcom z regionu w rozwijaniu ich pasji i kariery.",
        category: "bydgoszczanie" as const,
        imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80",
        author: "Redakcja Love Bydgoszcz",
        publishedAt: now - 1 * day,
        featured: true,
        tags: ["sport", "wioślarstwo", "fundacja"],
        personName: "Magdalena Fularczyk-Kozłowska",
      },
      {
        title: "Twórca globalnego hitu gamingowego",
        excerpt: "Poznaj historię programisty z Bydgoszczy, którego gra niezależna podbiła serca graczy na całym świecie.",
        content: "Michał Staniszewski, założyciel małego studia deweloperskiego w Bydgoszczy, stworzył grę, która w zaledwie miesiąc sprzedała się w milionie egzemplarzy. W wywiadzie opowiada o trudnych początkach i drodze na szczyt.",
        category: "bydgoszczanie" as const,
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
        author: "Redakcja Love Bydgoszcz",
        publishedAt: now - 2 * day,
        featured: false,
        tags: ["gamedev", "technologie", "sukces"],
        personName: "Michał Staniszewski",
      },
      {
        title: "Kulinarna rewolucja na bydgoskim Śródmieściu",
        excerpt: "Młody szef kuchni po powrocie z Francji otwiera restaurację, która redefiniuje lokalne smaki.",
        content: "Jan Kowalski, po latach pracy w paryskich restauracjach z gwiazdkami Michelin, postanowił wrócić do Bydgoszczy. Jego nowe bistro łączy francuskie techniki z kujawskimi produktami.",
        category: "bydgoszczanie" as const,
        imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
        author: "Smaki Bydgoszczy",
        publishedAt: now - 3 * day,
        featured: true,
        tags: ["gastronomia", "kuchnia", "biznes"],
        personName: "Jan Kowalski",
      },
      {
        title: "Innowatorka w dziedzinie medycyny",
        excerpt: "Bydgoska badaczka opracowała nowatorską metodę wczesnego wykrywania chorób neurodegeneracyjnych.",
        content: "Dr Anna Nowak z Uniwersytetu Mikołaja Kopernika w Bydgoszczy opublikowała przełomowe badania. Jej zespół stworzył algorytm AI, który analizuje skany mózgu z niespotykaną dotąd precyzją.",
        category: "bydgoszczanie" as const,
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80",
        author: "Medyczna Bydgoszcz",
        publishedAt: now - 4 * day,
        featured: false,
        tags: ["medycyna", "nauka", "innowacje"],
        personName: "Dr Anna Nowak",
      },
      {
        title: "Artysta, który ożywia miejskie mury",
        excerpt: "Jego murale stały się nieodłącznym elementem krajobrazu Bydgoszczy. Kim jest tajemniczy twórca?",
        content: "Piotr 'Mural' Wiśniewski od lat tworzy wielkoformatowe obrazy na bydgoskich budynkach. Jego najnowsze dzieło na ulicy Gdańskiej przyciąga tłumy turystów i mieszkańców.",
        category: "bydgoszczanie" as const,
        imageUrl: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&q=80",
        author: "Kultura Bydgoszcz",
        publishedAt: now - 5 * day,
        featured: true,
        tags: ["sztuka", "street art", "kultura"],
        personName: "Piotr Wiśniewski",
      },
      {
        title: "Od lokalnego warsztatu do międzynarodowej marki",
        excerpt: "Historia bydgoskiego rzemieślnika, którego meble zdobią wnętrza w całej Europie.",
        content: "Tomasz Lewandowski zaczynał w małym garażu na Fordonie. Dziś jego firma zatrudnia ponad 100 osób i eksportuje unikalne, ręcznie robione meble do 20 krajów.",
        category: "bydgoszczanie" as const,
        imageUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80",
        author: "Biznes Bydgoszcz",
        publishedAt: now - 6 * day,
        featured: false,
        tags: ["biznes", "rzemiosło", "sukces"],
        personName: "Tomasz Lewandowski",
      },
      {
        title: "Głos młodego pokolenia aktywistów",
        excerpt: "Licealistka z Bydgoszczy organizuje największe w regionie akcje ekologiczne.",
        content: "Zuzanna Kamińska, 18-letnia uczennica jednego z bydgoskich liceów, udowadnia, że wiek nie ma znaczenia, gdy chce się zmieniać świat. Jej inicjatywa 'Czysta Brda' zgromadziła tysiące wolontariuszy.",
        category: "bydgoszczanie" as const,
        imageUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80",
        author: "Redakcja Love Bydgoszcz",
        publishedAt: now - 7 * day,
        featured: false,
        tags: ["ekologia", "aktywizm", "młodzież"],
        personName: "Zuzanna Kamińska",
      },
      {
        title: "Wizjoner bydgoskiej architektury",
        excerpt: "Architekt, którego projekty zmieniają oblicze nowoczesnej Bydgoszczy.",
        content: "Marek Dąbrowski jest głównym projektantem kilku najbardziej rozpoznawalnych nowych budynków w mieście. W wywiadzie opowiada o swojej wizji zrównoważonego rozwoju urbanistycznego.",
        category: "bydgoszczanie" as const,
        imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
        author: "Miasto Bydgoszcz",
        publishedAt: now - 8 * day,
        featured: true,
        tags: ["architektura", "urbanistyka", "rozwój"],
        personName: "Marek Dąbrowski",
      },
      {
        title: "Mistrzyni fotografii portretowej",
        excerpt: "Jej zdjęcia bydgoszczan zdobywają nagrody na prestiżowych konkursach międzynarodowych.",
        content: "Katarzyna Wójcik potrafi uchwycić duszę człowieka na jednym zdjęciu. Jej najnowsza wystawa 'Twarze Bydgoszczy' w Młynach Rothera bije rekordy popularności.",
        category: "bydgoszczanie" as const,
        imageUrl: "https://images.unsplash.com/photo-1554046920-90dc20695352?w=800&q=80",
        author: "Kultura Bydgoszcz",
        publishedAt: now - 9 * day,
        featured: false,
        tags: ["fotografia", "sztuka", "wystawa"],
        personName: "Katarzyna Wójcik",
      },
      {
        title: "Pionier edukacji technologicznej",
        excerpt: "Nauczyciel z Bydgoszczy stworzył darmową platformę do nauki programowania dla dzieci.",
        content: "Adam Zieliński wierzy, że każde dziecko powinno mieć szansę na naukę kodowania. Jego platforma 'Koduj z Bydgoszczą' jest używana w szkołach w całej Polsce.",
        category: "bydgoszczanie" as const,
        imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
        author: "Redakcja Love Bydgoszcz",
        publishedAt: now - 10 * day,
        featured: false,
        tags: ["edukacja", "technologie", "IT"],
        personName: "Adam Zieliński",
      }
    ];

    for (const article of articles) {
      await ctx.db.insert("articles", article);
    }
  }
});

export const backfillBydgoszczanieProfiles = mutation({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_category", (q) => q.eq("category", "bydgoszczanie"))
      .collect();

    const portraitFallbacks = [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80",
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=800&q=80",
    ];

    const galleryFallbacks = [
      [
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&q=80",
      ],
      [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80",
      ],
      [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80",
      ],
      [
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",
        "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&q=80",
      ],
      [
        "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&q=80",
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80",
      ],
    ];

    const asHtml = (value?: string, fallback?: string) => {
      const source = (value || fallback || "").trim();
      if (!source) return undefined;
      return source
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => `<p>${paragraph}</p>`)
        .join("");
    };

    for (let index = 0; index < articles.length; index += 1) {
      const article = articles[index];
      const portraitUrl = article.bydgoszczanie?.portraitUrl || portraitFallbacks[index % portraitFallbacks.length];
      const fallbackGallery = galleryFallbacks[index % galleryFallbacks.length];
      const gallery = [
        article.imageUrl,
        ...fallbackGallery,
      ].filter(Boolean) as string[];

      await ctx.db.patch(article._id, {
        personName: article.personName || article.bydgoszczanie?.displayName || article.title.split(":")[0],
        bydgoszczanie: {
          displayName: article.bydgoszczanie?.displayName || article.personName || article.title.split(":")[0],
          portraitUrl,
          aboutHero: article.bydgoszczanie?.aboutHero || asHtml(
            article.excerpt,
            "To bohater z Bydgoszczy, ktory wyroznia sie pasja, konsekwencja i wlasna droga. W tej sekcji pokazujemy, kim jest, czym sie zajmuje i dlaczego warto poznac jego historie."
          ),
          storyTitle: article.bydgoszczanie?.storyTitle || "Ciekawostki, osiagniecia i kontekst",
          storyDescription: article.bydgoszczanie?.storyDescription || asHtml(
            article.content,
            "Tutaj pojawia sie dodatkowy kontekst: osiagniecia, wazne etapy drogi, ciekawostki i najwazniejsze momenty z zycia bohatera."
          ),
          gallery: article.bydgoszczanie?.gallery?.length ? article.bydgoszczanie.gallery : gallery,
        },
      });
    }

    return { updated: articles.length };
  },
});

export const listForLanding = query({
  args: {},
  handler: async (ctx) => {
    // Fetch recent articles across all categories in one pass
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(200);

    const publicArticles = articles.filter(isPublicArticle);

    // Group by category, keep top 10 per category
    const byCategory: Record<string, typeof publicArticles> = {};
    for (const a of publicArticles) {
      if (!a.category) continue;
      if (!byCategory[a.category]) byCategory[a.category] = [];
      if (byCategory[a.category].length < 10) byCategory[a.category].push(a);
    }

    // Batch author image lookups
    const userIds = [...new Set(publicArticles.map(a => a.authorUserId).filter(Boolean))];
    const userMap = new Map<string, string>();
    for (const uid of userIds) {
      const user = await ctx.db.get(uid as any);
      const img = (user as any)?.image;
      if (img) userMap.set(uid as string, img);
    }

    // Attach author images
    const withImages: Record<string, typeof publicArticles> = {};
    for (const [cat, arts] of Object.entries(byCategory)) {
      withImages[cat] = arts.map(a => {
        if (a.authorUserId && userMap.has(a.authorUserId as string)) {
          return { ...a, authorImageUrl: userMap.get(a.authorUserId as string) };
        }
        return a;
      });
    }

    return withImages;
  },
});