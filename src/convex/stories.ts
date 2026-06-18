import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .order("desc")
      .take(15);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stories").order("desc").take(50);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    coverImage: v.string(),
    author: v.string(),
    isActive: v.boolean(),
    items: v.array(
      v.object({
        type: v.union(v.literal("image"), v.literal("video"), v.literal("facebook_reel")),
        url: v.string(),
        duration: v.optional(v.number()),
        text: v.optional(v.string()),
        link: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stories", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("stories"),
    title: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    author: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    items: v.optional(
      v.array(
        v.object({
          type: v.union(v.literal("image"), v.literal("video"), v.literal("facebook_reel")),
          url: v.string(),
          duration: v.optional(v.number()),
          text: v.optional(v.string()),
          link: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("stories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
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

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("stories").take(1);
    if (existing.length > 0) return;

    const now = Date.now();

    const stories = [
      {
        title: "Nowa Kawiarnia",
        coverImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80",
        author: "Smaki Bydgoszczy",
        isActive: true,
        createdAt: now,
        items: [
          {
            type: "image" as const,
            url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
            duration: 5,
            text: "Otwarcie nowej kawiarni w centrum!",
          },
          {
            type: "image" as const,
            url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80",
            duration: 5,
            text: "Pyszna kawa i ciasta.",
          }
        ]
      },
      {
        title: "Koncert nad Brdą",
        coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80",
        author: "Kultura Bydgoszcz",
        isActive: true,
        createdAt: now - 3600000,
        items: [
          {
            type: "image" as const,
            url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
            duration: 5,
            text: "Tłumy na wczorajszym koncercie!",
          }
        ]
      },
      {
        title: "Wyspa Młyńska",
        coverImage: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80",
        author: "Miasto Bydgoszcz",
        isActive: true,
        createdAt: now - 7200000,
        items: [
          {
            type: "image" as const,
            url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80",
            duration: 5,
            text: "Piękny zachód słońca na Wyspie Młyńskiej.",
          }
        ]
      },
      {
        title: "Biznes Mixer",
        coverImage: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=400&q=80",
        author: "Biznes Bydgoszcz",
        isActive: true,
        createdAt: now - 10000000,
        items: [
          {
            type: "image" as const,
            url: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&q=80",
            duration: 5,
            text: "Spotkanie lokalnych przedsiębiorców.",
          }
        ]
      }
    ];

    for (const story of stories) {
      await ctx.db.insert("stories", story);
    }
  },
});