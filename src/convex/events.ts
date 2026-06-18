import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { categoryValidator } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
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
    const limit = args.limit ?? 10;
    const now = Date.now();
    if (args.category) {
      const events = await ctx.db
        .query("events")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("asc")
        .take(50);
      return events.filter((e) => e.startDate >= now - 86400000).slice(0, limit);
    }
    const events = await ctx.db
      .query("events")
      .withIndex("by_startDate")
      .order("asc")
      .take(50);
    return events.filter((e) => e.startDate >= now - 86400000).slice(0, limit);
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .order("asc")
      .take(4);
  },
});

export const getUpcoming = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const events = await ctx.db
      .query("events")
      .withIndex("by_startDate")
      .order("asc")
      .take(50);
    return events.filter((e) => e.startDate >= now - 86400000).slice(0, args.limit ?? 6);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").order("desc").take(100);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("events").take(1);
    if (existing.length > 0) return;

    const now = Date.now();
    const day = 86400000;

    const events = [
      {
        title: "Festiwal Muzyczny nad Brdą",
        description: "Trzy dni muzyki na żywo nad brzegiem Brdy. Artyści z całej Polski i Europy.",
        category: "rozrywka" as const,
        imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
        location: "Bulwar Brdy, Bydgoszcz",
        startDate: now + 5 * day,
        endDate: now + 7 * day,
        price: "od 49 zł",
        organizer: "Miasto Bydgoszcz",
        featured: true,
      },
      {
        title: "Konferencja Innowacje w Biznesie",
        description: "Spotkanie liderów biznesu z regionu kujawsko-pomorskiego. Networking i prelekcje.",
        category: "biznes" as const,
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        location: "Hotel Brda, ul. Dworcowa 94",
        startDate: now + 3 * day,
        price: "299 zł",
        organizer: "Izba Gospodarcza",
        featured: true,
      },
      {
        title: "Noc Muzeów 2024",
        description: "Bezpłatne zwiedzanie bydgoskich muzeów i galerii przez całą noc.",
        category: "kultura" as const,
        imageUrl: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80",
        location: "Centrum Bydgoszczy",
        startDate: now + 10 * day,
        price: "Bezpłatnie",
        organizer: "Muzeum Okręgowe",
        featured: true,
      },
      {
        title: "Targi Gastronomiczne Smaki Bydgoszczy",
        description: "Degustacje, warsztaty kulinarne i prezentacje lokalnych producentów żywności.",
        category: "gastronomia" as const,
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
        location: "Hala Łuczniczka",
        startDate: now + 14 * day,
        endDate: now + 15 * day,
        price: "od 15 zł",
        organizer: "Stowarzyszenie Kucharzy",
        featured: false,
      },
      {
        title: "Maraton Bydgoski",
        description: "Coroczny maraton ulicami Bydgoszczy. Trasy dla biegaczy wszystkich poziomów.",
        category: "miasto" as const,
        imageUrl: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80",
        location: "Start: Plac Wolności",
        startDate: now + 20 * day,
        price: "od 80 zł",
        organizer: "Bydgoszcz Sport",
        featured: false,
      },
      {
        title: "Premiera: Carmen – Opera Nova",
        description: "Spektakularna inscenizacja opery Bizeta w wykonaniu solistów z całej Europy.",
        category: "kultura" as const,
        imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80",
        location: "Opera Nova, ul. Paderewskiego 1",
        startDate: now + 8 * day,
        price: "od 60 zł",
        organizer: "Opera Nova",
        featured: true,
      },
    ];

    for (const event of events) {
      await ctx.db.insert("events", event);
    }
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    imageUrl: v.optional(v.string()),
    location: v.string(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    price: v.optional(v.string()),
    organizer: v.optional(v.string()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    return await ctx.db.insert("events", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(categoryValidator),
    imageUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    price: v.optional(v.string()),
    organizer: v.optional(v.string()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getFileUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});