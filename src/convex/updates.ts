import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { categoryValidator } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("updates")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(args.limit ?? 10);
  },
});

export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    category: v.optional(categoryValidator),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("updates")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("updates")
      .withIndex("by_publishedAt")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    linkUrl: v.optional(v.string()),
    linkLabel: v.optional(v.string()),
    location: v.optional(v.string()),
    category: v.optional(categoryValidator),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");

    return await ctx.db.insert("updates", {
      ...args,
      publishedAt: args.publishedAt ?? Date.now(),
      author: user.name || user.email || "Admin",
    });
  },
});

export const remove = mutation({
  args: { id: v.id("updates") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("updates"),
    title: v.string(),
    description: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    linkUrl: v.optional(v.string()),
    linkLabel: v.optional(v.string()),
    location: v.optional(v.string()),
    category: v.optional(categoryValidator),
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