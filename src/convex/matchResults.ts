import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { sportType: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sportType && args.sportType !== "all") {
      return await ctx.db
        .query("match_results")
        .withIndex("by_sportType", (q) => q.eq("sportType", args.sportType as any))
        .order("desc")
        .take(100);
    }
    return await ctx.db
      .query("match_results")
      .withIndex("by_matchDate")
      .order("desc")
      .take(100);
  },
});

export const recent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("match_results")
      .withIndex("by_matchDate")
      .order("desc")
      .take(20);
  },
});

export const save = mutation({
  args: {
    id: v.optional(v.id("match_results")),
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
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("match_results", data);
  },
});

export const remove = mutation({
  args: { id: v.id("match_results") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
