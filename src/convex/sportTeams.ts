import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db
      .query("sport_teams")
      .take(100);

    return teams.filter((team) => team.isActive !== false);
  },
});

export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("sport_teams")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return team;
  },
});

export const bySportType = query({
  args: { sportType: v.union(
    v.literal("pilka_nozna"),
    v.literal("zuzel"),
    v.literal("siatkowka"),
    v.literal("inne"),
  ) },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("sport_teams")
      .withIndex("by_sportType", (q) => q.eq("sportType", args.sportType))
      .take(100);

    return teams.filter((team) => team.isActive !== false);
  },
});

export const byIds = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    const items = await Promise.all(
      args.ids.map(async (id) => {
        const normalizedId = ctx.db.normalizeId("sport_teams", id);
        return normalizedId ? await ctx.db.get(normalizedId) : null;
      }),
    );

    return items.filter(Boolean);
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchTerm || args.searchTerm.length < 2) {
      return [];
    }

    const results = await ctx.db
      .query("sport_teams")
      .withSearchIndex("search_name", (q) => q.search("name", args.searchTerm))
      .take(20);

    return results.filter((team) => team.isActive !== false);
  },
});

export const save = mutation({
  args: {
    id: v.optional(v.id("sport_teams")),
    name: v.string(),
    shortName: v.optional(v.string()),
    slug: v.string(),
    logo: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    sportType: v.union(
      v.literal("pilka_nozna"),
      v.literal("zuzel"),
      v.literal("siatkowka"),
      v.literal("inne"),
    ),
    league: v.optional(v.string()),
    city: v.optional(v.string()),
    stadium: v.optional(v.string()),
    founded: v.optional(v.string()),
    website: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("sport_teams", data);
  },
});

export const remove = mutation({
  args: { id: v.id("sport_teams") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seedSportTeams = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("sport_teams").take(1);
    if (existing.length > 0) return { skipped: true, message: "Sport teams already seeded" };

    const teams = [
      {
        name: "Zawisza Bydgoszcz",
        shortName: "ZAW",
        slug: "zawisza-bydgoszcz",
        sportType: "pilka_nozna" as const,
        league: "IV liga",
        city: "Bydgoszcz",
        stadium: "Stadion Zawiszy",
        website: "https://zawisza.bydgoszcz.pl",
        isActive: true,
      },
      {
        name: "Chemik Bydgoszcz",
        shortName: "CHE",
        slug: "chemik-bydgoszcz",
        sportType: "pilka_nozna" as const,
        league: "IV liga",
        city: "Bydgoszcz",
        stadium: "Stadion Chemika",
        isActive: true,
      },
      {
        name: "Sparta Bydgoszcz",
        shortName: "SPA",
        slug: "sparta-bydgoszcz",
        sportType: "zuzel" as const,
        league: "PGE Ekstraliga",
        city: "Bydgoszcz",
        stadium: "Stadion Polonii",
        website: "https://sparta.bydgoszcz.pl",
        isActive: true,
      },
      {
        name: "Polonia Bydgoszcz",
        shortName: "POL",
        slug: "polonia-bydgoszcz",
        sportType: "zuzel" as const,
        league: "1. Liga Żużlowa",
        city: "Bydgoszcz",
        stadium: "Stadion Polonii",
        isActive: true,
      },
      {
        name: "Łuczniczka Bydgoszcz",
        shortName: "ŁUC",
        slug: "luczniczka-bydgoszcz",
        sportType: "siatkowka" as const,
        league: "PlusLiga",
        city: "Bydgoszcz",
        stadium: "Hala Łuczniczka",
        website: "https://luczniczka.pl",
        isActive: true,
      },
    ];

    for (const team of teams) {
      await ctx.db.insert("sport_teams", team);
    }

    return { success: true, count: teams.length };
  },
});