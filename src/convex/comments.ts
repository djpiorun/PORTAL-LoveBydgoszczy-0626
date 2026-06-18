import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    targetId: v.string(),
    targetType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType)
      )
      .order("desc")
      .take(200);
  },
});

export const create = mutation({
  args: {
    targetId: v.string(),
    targetType: v.string(),
    authorName: v.string(),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    // Basic rate limit: max 1 comment per 15s per targetId (anti-spam)
    const THROTTLE_MS = 15_000;
    const recent = await ctx.db
      .query("comments")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType)
      )
      .order("desc")
      .take(1);
    if (recent.length > 0 && Date.now() - recent[0].createdAt < THROTTLE_MS) {
      throw new Error("Zbyt wiele komentarzy. Poczekaj chwilę przed dodaniem kolejnego.");
    }

    // Basic content validation
    const content = args.content.trim();
    if (!content || content.length < 2) throw new Error("Komentarz jest za krótki.");
    if (content.length > 2000) throw new Error("Komentarz jest za długi (max 2000 znaków).");
    const authorName = args.authorName.trim();
    if (!authorName || authorName.length < 2) throw new Error("Podaj imię lub pseudonim.");

    return await ctx.db.insert("comments", {
      targetId: args.targetId,
      targetType: args.targetType,
      authorName,
      content,
      createdAt: Date.now(),
      likes: 0,
      status: "approved",
      parentId: args.parentId,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("comments"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const like = mutation({
  args: {
    id: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (comment) {
      await ctx.db.patch(args.id, { likes: comment.likes + 1 });
    }
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("comments").order("desc").take(100);
  },
});

export const remove = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

export const countByTarget = query({
  args: {
    targetId: v.string(),
    targetType: v.string(),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType)
      )
      .take(1000);
    return comments.filter(c => c.status === "approved").length;
  },
});