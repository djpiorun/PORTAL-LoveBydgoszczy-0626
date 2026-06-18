import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { categoryValidator } from "./schema";

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Brak dostępu");
  const user = await ctx.db.get(userId);
  if (!user || (user.role !== "admin" && user.role !== "member")) throw new Error("Brak dostępu");
  return user;
}

export const list = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(categoryValidator),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 50);
    if (args.category) {
      return await ctx.db
        .query("reels")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(limit);
    }
    return await ctx.db
      .query("reels")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .order("desc")
      .take(limit);
  },
});

export const listActive = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 10, 20);
    return await ctx.db
      .query("reels")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .order("desc")
      .take(limit);
  },
});

export const listForStories = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("reels")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .order("desc")
      .take(50);
    return active.filter((r) => r.showInStories === true).slice(0, 10);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("reels").order("desc").take(100);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    author: v.optional(v.string()),
    category: v.optional(categoryValidator),
    sourceType: v.union(
      v.literal("upload"),
      v.literal("link"),
      v.literal("facebook"),
      v.literal("instagram"),
      v.literal("youtube"),
    ),
    videoUrl: v.string(),
    embedUrl: v.optional(v.string()),
    isActive: v.boolean(),
    showInStories: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("reels", {
      ...args,
      likes: 0,
      views: 0,
      publishedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("reels"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    author: v.optional(v.string()),
    category: v.optional(categoryValidator),
    sourceType: v.optional(v.union(
      v.literal("upload"),
      v.literal("link"),
      v.literal("facebook"),
      v.literal("instagram"),
      v.literal("youtube"),
    )),
    videoUrl: v.optional(v.string()),
    embedUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    showInStories: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("reels") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const toggleLike = mutation({
  args: { id: v.id("reels"), isLiked: v.boolean() },
  handler: async (ctx, args) => {
    const reel = await ctx.db.get(args.id);
    if (!reel) return;
    const current = reel.likes ?? 0;
    await ctx.db.patch(args.id, {
      likes: args.isLiked ? current + 1 : Math.max(0, current - 1),
    });
  },
});

export const incrementViews = mutation({
  args: { id: v.id("reels") },
  handler: async (ctx, args) => {
    const reel = await ctx.db.get(args.id);
    if (!reel) return;
    await ctx.db.patch(args.id, { views: (reel.views ?? 0) + 1 });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("reels").take(1);
    if (existing.length > 0) return { skipped: true };

    const now = Date.now();
    const reelsData = [
      {
        title: "Bydgoszcz nocą — spacer po Starym Mieście",
        description: "Magiczna atmosfera bydgoskiego Starego Miasta po zmroku. Klimatyczne uliczki i oświetlone zabytki.",
        coverImage: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80",
        author: "Love Bydgoszcz",
        category: "miasto" as const,
        sourceType: "link" as const,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        isActive: true,
        likes: 142,
        views: 1820,
        publishedAt: now - 1000 * 60 * 60 * 2,
      },
      {
        title: "Koncert na Wyspie Młyńskiej — niesamowite widowisko!",
        description: "Letni koncert plenerowy przyciągnął tysiące bydgoszczan. Muzyka, taniec i świetna zabawa.",
        coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80",
        author: "Kultura Bydgoszcz",
        category: "kultura" as const,
        sourceType: "link" as const,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        isActive: true,
        likes: 89,
        views: 1240,
        publishedAt: now - 1000 * 60 * 60 * 5,
      },
      {
        title: "Nowa restauracja w centrum — recenzja",
        description: "Odwiedziliśmy najnowsze miejsce gastronomiczne w Bydgoszczy. Czy warto? Sprawdź!",
        coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
        author: "Smaki Bydgoszczy",
        category: "gastronomia" as const,
        sourceType: "link" as const,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        isActive: true,
        likes: 67,
        views: 890,
        publishedAt: now - 1000 * 60 * 60 * 8,
      },
      {
        title: "Zawisza Bydgoszcz — trening przed meczem",
        description: "Zaglądamy za kulisy przygotowań drużyny Zawiszy do ważnego meczu sezonu.",
        coverImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80",
        author: "Sport Bydgoszcz",
        category: "sport" as const,
        sourceType: "link" as const,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        isActive: true,
        likes: 203,
        views: 2650,
        publishedAt: now - 1000 * 60 * 60 * 12,
      },
      {
        title: "Startup z Bydgoszczy podbija rynek",
        description: "Młodzi przedsiębiorcy z Bydgoszczy stworzyli aplikację, która zdobywa uznanie w całej Polsce.",
        coverImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&q=80",
        author: "Biznes Bydgoszcz",
        category: "biznes" as const,
        sourceType: "link" as const,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        isActive: true,
        likes: 54,
        views: 720,
        publishedAt: now - 1000 * 60 * 60 * 18,
      },
      {
        title: "Nowy szpital w Bydgoszczy — otwarcie",
        description: "Nowoczesny oddział kardiologiczny otworzył swoje podwoje. Najnowszy sprzęt i wykwalifikowany personel.",
        coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80",
        author: "Medyczna Bydgoszcz",
        category: "medyczna" as const,
        sourceType: "link" as const,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        isActive: true,
        likes: 38,
        views: 510,
        publishedAt: now - 1000 * 60 * 60 * 24,
      },
      {
        title: "Festiwal Rozrywki — relacja z imprezy",
        description: "Największy festiwal rozrywkowy w historii Bydgoszczy. Trzy dni muzyki, sztuki i zabawy.",
        coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80",
        author: "Rozrywka Bydgoszcz",
        category: "rozrywka" as const,
        sourceType: "link" as const,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        isActive: true,
        likes: 176,
        views: 2100,
        publishedAt: now - 1000 * 60 * 60 * 30,
      },
      {
        title: "Bydgoszczanin roku — poznaj laureata",
        description: "Wywiad z tegorocznym laureatem tytułu Bydgoszczanin Roku. Inspirująca historia sukcesu.",
        coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        author: "Love Bydgoszcz",
        category: "bydgoszczanie" as const,
        sourceType: "link" as const,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        isActive: true,
        likes: 91,
        views: 1350,
        publishedAt: now - 1000 * 60 * 60 * 36,
      },
      {
        title: "Nowa inwestycja przy ul. Gdańskiej",
        description: "Wielka przebudowa centrum Bydgoszczy nabiera tempa. Co zmieni się w okolicach ul. Gdańskiej?",
        coverImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80",
        author: "Inwestycje Bydgoszcz",
        category: "inwestycje" as const,
        sourceType: "link" as const,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        isActive: true,
        likes: 45,
        views: 680,
        publishedAt: now - 1000 * 60 * 60 * 48,
      },
      {
        title: "Sesja Rady Miasta — najważniejsze decyzje",
        description: "Relacja z ostatniej sesji Rady Miasta Bydgoszczy. Jakie decyzje zapadły i co to oznacza dla mieszkańców?",
        coverImage: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&q=80",
        author: "Polityka Bydgoszcz",
        category: "polityka" as const,
        sourceType: "link" as const,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        isActive: true,
        likes: 29,
        views: 430,
        publishedAt: now - 1000 * 60 * 60 * 60,
      },
    ];

    for (const reel of reelsData) {
      await ctx.db.insert("reels", reel);
    }

    return { seeded: reelsData.length };
  },
});