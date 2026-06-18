import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

const ARTICLE_TYPE_VALUES = [
  "news",
  "interview",
  "dialog",
  "report",
  "analysis",
  "press_release",
  "opinion",
  "sponsored",
  "quiz",
] as const;

const ARTICLE_STATUS_VALUES = [
  "draft",
  "published",
  "scheduled",
  "archived",
  "template",
  "preview",
] as const;

const ARTICLE_LAYOUT_VALUES = [
  "standard",
  "wide",
  "fullwidth",
  "magazine",
  "minimal",
  "hero",
] as const;

const AUTHOR_FOOTER_STYLE_VALUES = [
  "graphic",
  "business",
  "classic",
  "none",
] as const;

type ChatOperation = {
  type: "create_article" | "update_article";
  articleId?: string;
  fields: Record<string, unknown>;
};

const adminChatApi: any = (api as any).adminChat;

function defaultSettings() {
  return {
    providerLabel: "OpenAI / Codex",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    model: "gpt-4.1-mini",
    systemPrompt:
      "Jestes agentem redakcyjnym portalu Love Bydgoszcz. Tworz czytelne szkice artykulow, aktualizujesz istniejace materialy i dbasz o strukture redakcyjna. Gdy potrzebna jest operacja na artykule, zwracaj konkretne polecenia w JSON.",
    isEnabled: false,
  };
}

async function requireEditor(ctx: { db: any; auth?: any }) {
  const userId = await getAuthUserId(ctx as any);
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await ctx.db.get(userId);
  if (!user || (user.role !== "admin" && user.role !== "member")) {
    throw new Error("Unauthorized");
  }

  return { userId, user };
}

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => ({ ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.slice(0, 72).replace(/-+$/g, "") || "artykul";
}

async function generateUniqueSlug(ctx: any, desired: string) {
  const base = slugify(desired || "nowy-artykul") || "nowy-artykul";
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await ctx.db.query("articles").withIndex("by_slug", (q: any) => q.eq("slug", candidate)).unique();
    if (!existing) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

function normalizeCategory(value: unknown) {
  return typeof value === "string" && ["miasto", "rozrywka", "kultura", "biznes", "gastronomia", "bydgoszczanie", "medyczna"].includes(value)
    ? (value as InferCategory)
    : "miasto";
}

type InferCategory =
  | "miasto"
  | "rozrywka"
  | "kultura"
  | "biznes"
  | "gastronomia"
  | "bydgoszczanie"
  | "medyczna";

function normalizeEnum<T extends readonly string[]>(value: unknown, allowed: T, fallback: T[number]) {
  return typeof value === "string" && allowed.includes(value) ? (value as T[number]) : fallback;
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function toBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeOptionalEnum<T extends readonly string[]>(value: unknown, allowed: T) {
  return typeof value === "string" && allowed.includes(value) ? (value as T[number]) : undefined;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildArticlePayload(fields: Record<string, unknown>, fallbackAuthor: string) {
  const content = typeof fields.content === "string" && fields.content.trim()
    ? fields.content.trim()
    : "<p>Nowy szkic artykulu przygotowany przez agenta redakcyjnego.</p>";
  const title = typeof fields.title === "string" && fields.title.trim() ? fields.title.trim() : "Nowy szkic artykulu";
  const excerptCandidate = typeof fields.excerpt === "string" ? fields.excerpt.trim() : "";
  const excerpt = excerptCandidate || stripHtml(content).slice(0, 220);
  const publishedAt = toNumber(fields.publishedAt) ?? Date.now();

  return {
    title,
    excerpt,
    content,
    category: normalizeCategory(fields.category),
    author: typeof fields.author === "string" && fields.author.trim() ? fields.author.trim() : fallbackAuthor,
    coauthor: typeof fields.coauthor === "string" ? fields.coauthor.trim() : undefined,
    coauthor2: typeof fields.coauthor2 === "string" ? fields.coauthor2.trim() : undefined,
    coauthor3: typeof fields.coauthor3 === "string" ? fields.coauthor3.trim() : undefined,
    corrector: typeof fields.corrector === "string" ? fields.corrector.trim() : undefined,
    publisher: typeof fields.publisher === "string" ? fields.publisher.trim() : undefined,
    publishedAt,
    featured: toBoolean(fields.featured),
    isPatronage: toBoolean(fields.isPatronage),
    tags: toStringArray(fields.tags),
    hideInReels: toBoolean(fields.hideInReels),
    personName: typeof fields.personName === "string" ? fields.personName.trim() : undefined,
    sourceName: typeof fields.sourceName === "string" ? fields.sourceName.trim() : undefined,
    sourceUrl: typeof fields.sourceUrl === "string" ? fields.sourceUrl.trim() : undefined,
    expertQuote: typeof fields.expertQuote === "string" ? fields.expertQuote.trim() : undefined,
    slug: typeof fields.slug === "string" ? fields.slug.trim() : undefined,
    articleType: normalizeEnum(fields.articleType, ARTICLE_TYPE_VALUES, "news"),
    status: normalizeEnum(fields.status, ARTICLE_STATUS_VALUES, publishedAt > Date.now() ? "scheduled" : "draft"),
    layout: normalizeEnum(fields.layout, ARTICLE_LAYOUT_VALUES, "standard"),
    partnerName: typeof fields.partnerName === "string" ? fields.partnerName.trim() : undefined,
    partnerUrl: typeof fields.partnerUrl === "string" ? fields.partnerUrl.trim() : undefined,
    partnerLogoUrl: typeof fields.partnerLogoUrl === "string" ? fields.partnerLogoUrl.trim() : undefined,
    partnerLabel: typeof fields.partnerLabel === "string" ? fields.partnerLabel.trim() : undefined,
    seoTitle: typeof fields.seoTitle === "string" ? fields.seoTitle.trim() : undefined,
    seoDescription: typeof fields.seoDescription === "string" ? fields.seoDescription.trim() : undefined,
    allowComments: typeof fields.allowComments === "boolean" ? fields.allowComments : true,
    showUpdates: typeof fields.showUpdates === "boolean" ? fields.showUpdates : false,
    labelUrgent: toBoolean(fields.labelUrgent),
    labelImportant: toBoolean(fields.labelImportant),
    labelOurNews: toBoolean(fields.labelOurNews),
    labelMustKnow: toBoolean(fields.labelMustKnow),
    labelAuthorArticle: toBoolean(fields.labelAuthorArticle),
    label18Plus: toBoolean(fields.label18Plus),
    bibliography: typeof fields.bibliography === "string" ? fields.bibliography.trim() : undefined,
    sources: typeof fields.sources === "string" ? fields.sources.trim() : undefined,
    footerInfo: typeof fields.footerInfo === "string" ? fields.footerInfo.trim() : undefined,
    sourceFromContact: typeof fields.sourceFromContact === "string" ? fields.sourceFromContact.trim() : undefined,
    skipHomepage: toBoolean(fields.skipHomepage),
    graphicsLayout: typeof fields.graphicsLayout === "string" ? fields.graphicsLayout : undefined,
    categoryLayout: typeof fields.categoryLayout === "string" ? fields.categoryLayout : undefined,
    authorFooterStyle: normalizeOptionalEnum(fields.authorFooterStyle, AUTHOR_FOOTER_STYLE_VALUES),
    updatedAt: toNumber(fields.updatedAt),
    imageUrl: typeof fields.imageUrl === "string" ? fields.imageUrl.trim() : undefined,
  };
}

function extractJson(content: string) {
  const fenced = content.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return content.slice(firstBrace, lastBrace + 1);
  }

  return content.trim();
}

function normalizeOperations(raw: unknown): ChatOperation[] {
  if (!Array.isArray(raw)) return [];

  const operations: ChatOperation[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as Record<string, unknown>;
    if (candidate.type !== "create_article" && candidate.type !== "update_article") continue;
    operations.push({
      type: candidate.type,
      articleId: typeof candidate.articleId === "string" ? candidate.articleId : undefined,
      fields: candidate.fields && typeof candidate.fields === "object" ? (candidate.fields as Record<string, unknown>) : {},
    });
  }
  return operations;
}

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireEditor(ctx);
    const existing = await ctx.db.query("ai_chat_settings").first();
    return existing ?? {
      _id: undefined,
      ...defaultSettings(),
      updatedAt: 0,
      updatedBy: undefined,
    };
  },
});

export const saveSettings = mutation({
  args: {
    providerLabel: v.optional(v.string()),
    baseUrl: v.string(),
    apiKey: v.optional(v.string()),
    model: v.string(),
    systemPrompt: v.optional(v.string()),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireEditor(ctx);
    const existing = await ctx.db.query("ai_chat_settings").first();
    const payload = {
      providerLabel: args.providerLabel,
      baseUrl: args.baseUrl,
      apiKey: args.apiKey,
      model: args.model,
      systemPrompt: args.systemPrompt,
      isEnabled: args.isEnabled,
      updatedAt: Date.now(),
      updatedBy: userId,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("ai_chat_settings", payload);
  },
});

export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireEditor(ctx);
    return await ctx.db
      .query("ai_chat_sessions")
      .withIndex("by_user_updatedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const createSession = mutation({
  args: {
    title: v.optional(v.string()),
    contextArticleId: v.optional(v.id("articles")),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireEditor(ctx);
    const now = Date.now();
    return await ctx.db.insert("ai_chat_sessions", {
      title: args.title?.trim() || "Nowa rozmowa",
      userId,
      contextArticleId: args.contextArticleId,
      createdAt: now,
      updatedAt: now,
      lastMessagePreview: "",
    });
  },
});

export const getMessages = query({
  args: { sessionId: v.id("ai_chat_sessions") },
  handler: async (ctx, args) => {
    const { userId } = await requireEditor(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    return await ctx.db
      .query("ai_chat_messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const getRecentArticles = query({
  args: {},
  handler: async (ctx) => {
    await requireEditor(ctx);
    return await ctx.db
      .query("articles")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(100);
  },
});

export const addSystemMessage = mutation({
  args: {
    sessionId: v.id("ai_chat_sessions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireEditor(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    const now = Date.now();
    await ctx.db.insert("ai_chat_messages", {
      sessionId: args.sessionId,
      role: "system",
      content: args.content,
      createdAt: now,
    });

    await ctx.db.patch(args.sessionId, {
      updatedAt: now,
      lastMessagePreview: args.content.slice(0, 180),
    });
  },
});

export const applyOperations = mutation({
  args: {
    sessionId: v.id("ai_chat_sessions"),
    operationsJson: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireEditor(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    const rawOperations = JSON.parse(args.operationsJson);
    const operations = normalizeOperations(rawOperations);
    const results: Array<{ type: string; articleId?: string; slug?: string; title?: string; status: string }> = [];

    for (const operation of operations) {
      if (operation.type === "create_article") {
        const payload = buildArticlePayload(operation.fields, user.name || user.email || "Admin");
        const slug = await generateUniqueSlug(ctx, payload.slug || payload.title);
        const articleId = await ctx.db.insert("articles", { ...payload, slug });
        results.push({
          type: operation.type,
          articleId,
          slug,
          title: payload.title,
          status: payload.status,
        });
        continue;
      }

      if (operation.type === "update_article" && operation.articleId) {
        const normalizedId = ctx.db.normalizeId("articles", operation.articleId);
        if (!normalizedId) {
          results.push({ type: operation.type, articleId: operation.articleId, status: "not_found" });
          continue;
        }

        const existing = await ctx.db.get(normalizedId);
        if (!existing) {
          results.push({ type: operation.type, articleId: operation.articleId, status: "not_found" });
          continue;
        }

        const fields = buildArticlePayload({ ...existing, ...operation.fields }, existing.author || user.name || "Admin");
        const patch: Record<string, unknown> = {
          ...operation.fields,
          title: fields.title,
          excerpt: fields.excerpt,
          content: fields.content,
          category: fields.category,
          author: fields.author,
          publishedAt: fields.publishedAt,
          articleType: fields.articleType,
          status: fields.status,
          layout: fields.layout,
          tags: fields.tags,
          updatedAt: Date.now(),
        };

        const desiredSlug = typeof operation.fields.slug === "string" ? operation.fields.slug : undefined;
        if (desiredSlug && desiredSlug !== existing.slug) {
          patch.slug = await generateUniqueSlug(ctx, desiredSlug);
        }

        const passthroughFields = [
          "coauthor",
          "coauthor2",
          "coauthor3",
          "corrector",
          "publisher",
          "featured",
          "isPatronage",
          "hideInReels",
          "personName",
          "sourceName",
          "sourceUrl",
          "expertQuote",
          "partnerName",
          "partnerUrl",
          "partnerLogoUrl",
          "partnerLabel",
          "seoTitle",
          "seoDescription",
          "allowComments",
          "showUpdates",
          "labelUrgent",
          "labelImportant",
          "labelOurNews",
          "labelMustKnow",
          "labelAuthorArticle",
          "label18Plus",
          "bibliography",
          "sources",
          "footerInfo",
          "sourceFromContact",
          "skipHomepage",
          "graphicsLayout",
          "categoryLayout",
          "authorFooterStyle",
          "imageUrl",
        ] as const;

        for (const key of passthroughFields) {
          if (key in operation.fields) {
            patch[key] = operation.fields[key];
          }
        }

        await ctx.db.patch(normalizedId, patch);
        results.push({
          type: operation.type,
          articleId: normalizedId,
          slug: typeof patch.slug === "string" ? patch.slug : existing.slug,
          title: typeof patch.title === "string" ? patch.title : existing.title,
          status: typeof patch.status === "string" ? patch.status : existing.status || "draft",
        });
      }
    }

    if (results.length > 0) {
      const summary = results
        .map((result) => {
          if (result.status === "not_found") {
            return `Nie znaleziono artykulu ${result.articleId}.`;
          }
          const label = result.type === "create_article" ? "Utworzono szkic" : "Zaktualizowano artykul";
          return `${label}: ${result.title || result.slug || result.articleId}`;
        })
        .join(" ");

      const now = Date.now();
      await ctx.db.insert("ai_chat_messages", {
        sessionId: args.sessionId,
        role: "system",
        content: summary,
        createdAt: now,
      });
      await ctx.db.patch(args.sessionId, {
        updatedAt: now,
        lastMessagePreview: summary.slice(0, 180),
      });
    }

    return results;
  },
});

export const sendMessage = action({
  args: {
    sessionId: v.id("ai_chat_sessions"),
    message: v.string(),
    contextArticleId: v.optional(v.id("articles")),
  },
  handler: async (ctx, args): Promise<any> => {
    const settings: any = await ctx.runQuery(adminChatApi.getSettings, {});
    if (!settings.isEnabled || !settings.apiKey || !settings.baseUrl || !settings.model) {
      return {
        reply: "Najpierw skonfiguruj polaczenie z modelem w ustawieniach chatu.",
        operations: [],
      };
    }

    const sessionMessages = await ctx.runQuery(adminChatApi.getMessages, { sessionId: args.sessionId });
    const recentArticles = await ctx.runQuery(adminChatApi.getRecentArticles, {});
    const contextArticle = args.contextArticleId
      ? recentArticles.find((article: any) => article._id === args.contextArticleId)
      : null;

    const instruction = [
      settings.systemPrompt || defaultSettings().systemPrompt,
      "Mozesz pomagac redakcji tworzyc i aktualizowac artykuly.",
      "Jesli chcesz wykonac operacje, zwroc tylko JSON w formacie:",
      '{ "reply": "tekst dla redaktora", "operations": [ { "type": "create_article", "fields": { ... } }, { "type": "update_article", "articleId": "..." , "fields": { ... } } ] }',
      "Dozwolone operacje: create_article, update_article.",
      "Dozwolone pola article fields: title, excerpt, content, category, author, coauthor, coauthor2, coauthor3, corrector, publisher, tags, articleType, status, layout, slug, imageUrl, sourceName, sourceUrl, seoTitle, seoDescription, graphicsLayout, categoryLayout, featured, isPatronage, allowComments, showUpdates, bibliography, sources, footerInfo, partnerName, partnerUrl, partnerLogoUrl, partnerLabel, labelUrgent, labelImportant, labelOurNews, labelMustKnow, labelAuthorArticle, label18Plus.",
      "content powinno byc gotowym HTML artykulu, nie markdownem.",
      "excerpt powinien byc krotkim leadem.",
      "Jesli nie potrzeba zmian w bazie, zwroc pusta tablice operations.",
      `Dostepne kategorie: ${["miasto", "rozrywka", "kultura", "biznes", "gastronomia", "bydgoszczanie", "medyczna"].join(", ")}.`,
      `Dostepne typy artykulu: ${ARTICLE_TYPE_VALUES.join(", ")}.`,
    ].join("\n");

    const messages = [
      { role: "system", content: instruction },
      {
        role: "system",
        content: `Ostatnie artykuly w systemie: ${JSON.stringify(
          recentArticles.slice(0, 30).map((article: any) => ({
            id: article._id,
            title: article.title,
            slug: article.slug,
            category: article.category,
            articleType: article.articleType || "news",
            status: article.status || "published",
          })),
        )}`,
      },
      ...(contextArticle
        ? [{
            role: "system",
            content: `Aktywny kontekst artykulu: ${JSON.stringify({
              id: contextArticle._id,
              title: contextArticle.title,
              slug: contextArticle.slug,
              excerpt: contextArticle.excerpt,
              category: contextArticle.category,
              articleType: contextArticle.articleType || "news",
              status: contextArticle.status || "published",
              content: contextArticle.content,
            })}`,
          }]
        : []),
      ...sessionMessages.slice(-12).map((message: any) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.role === "system" ? `[SYSTEM] ${message.content}` : message.content,
      })),
      { role: "user", content: args.message },
    ];

    const baseUrl: string = settings.baseUrl.replace(/\/+$/, "");
    const response: Response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        temperature: 0.2,
        messages,
      }),
    });

    if (!response.ok) {
      const text: string = await response.text();
      return {
        reply: `Polaczenie z modelem nie powiodlo sie: ${text.slice(0, 240)}`,
        operations: [],
      };
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const content = typeof rawContent === "string"
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent.map((item: any) => item?.text ?? "").join("\n")
        : "";

    let parsed: { reply?: string; operations?: unknown } = {};
    try {
      parsed = JSON.parse(extractJson(content));
    } catch {
      parsed = { reply: content, operations: [] };
    }

    const reply = typeof parsed.reply === "string" && parsed.reply.trim()
      ? parsed.reply.trim()
      : "Przygotowalem odpowiedz, ale model nie zwrocil czytelnego pola reply.";
    const operations = normalizeOperations(parsed.operations);

    await ctx.runMutation(adminChatApi._storeConversationTurn, {
      sessionId: args.sessionId,
      userMessage: args.message,
      assistantMessage: reply,
    });

    return {
      reply,
      operations,
      createdAt: Date.now(),
    };
  },
});

export const _storeConversationTurn = mutation({
  args: {
    sessionId: v.id("ai_chat_sessions"),
    userMessage: v.string(),
    assistantMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireEditor(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    const now = Date.now();
    await ctx.db.insert("ai_chat_messages", {
      sessionId: args.sessionId,
      role: "user",
      content: args.userMessage,
      createdAt: now,
    });
    await ctx.db.insert("ai_chat_messages", {
      sessionId: args.sessionId,
      role: "assistant",
      content: args.assistantMessage,
      createdAt: now + 1,
    });
    await ctx.db.patch(args.sessionId, {
      updatedAt: now + 1,
      lastMessagePreview: args.assistantMessage.slice(0, 180),
      title: session.title === "Nowa rozmowa" ? args.userMessage.slice(0, 48) : session.title,
    });
  },
});
