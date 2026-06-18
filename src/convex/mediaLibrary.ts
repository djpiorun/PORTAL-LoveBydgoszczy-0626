import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const sourceKindValidator = v.union(
  v.literal("article"),
  v.literal("story"),
  v.literal("event"),
);

const mediaTypeValidator = v.union(
  v.literal("image"),
  v.literal("video"),
  v.literal("document"),
);

const storageProviderValidator = v.union(
  v.literal("r2"),
  v.literal("convex"),
);

function normalizeFolder(folder?: string) {
  return folder?.trim() || undefined;
}

function normalizeTags(tags?: string[]) {
  if (!tags?.length) return undefined;
  const normalized = Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
  return normalized.length ? normalized : undefined;
}

export const saveAsset = mutation({
  args: {
    name: v.string(),
    originalFileName: v.optional(v.string()),
    url: v.string(),
    storageProvider: storageProviderValidator,
    mediaType: mediaTypeValidator,
    sourceKind: sourceKindValidator,
    sourceEntityId: v.optional(v.string()),
    folder: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    mimeType: v.optional(v.string()),
    size: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    const now = Date.now();
    const existing = await ctx.db
      .query("media_assets")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();

    const patch = {
      name: args.name,
      originalFileName: args.originalFileName,
      url: args.url,
      storageProvider: args.storageProvider,
      mediaType: args.mediaType,
      sourceKind: args.sourceKind,
      sourceEntityId: args.sourceEntityId,
      folder: normalizeFolder(args.folder),
      tags: normalizeTags(args.tags),
      mimeType: args.mimeType,
      size: args.size,
      width: args.width,
      height: args.height,
      updatedAt: now,
      lastUsedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("media_assets", {
      ...patch,
      createdAt: now,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("media_assets").withIndex("by_createdAt").order("desc").collect();
  },
});

export const getFolders = query({
  args: {},
  handler: async (ctx) => {
    const assets = await ctx.db.query("media_assets").collect();
    return Array.from(
      new Set(
        assets
          .map((asset) => asset.folder?.trim())
          .filter((folder): folder is string => !!folder),
      ),
    ).sort((a, b) => a.localeCompare(b, "pl"));
  },
});

export const updateAsset = mutation({
  args: {
    id: v.id("media_assets"),
    folder: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    sourceEntityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, {
      folder: normalizeFolder(args.folder),
      tags: normalizeTags(args.tags),
      sourceEntityId: args.sourceEntityId,
      updatedAt: Date.now(),
    });
  },
});