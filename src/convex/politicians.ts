import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const politicians = await ctx.db
      .query("politicians")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return politicians;
  },
});

export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const politician = await ctx.db
      .query("politicians")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return politician;
  },
});

export const byParty = query({
  args: { party: v.string() },
  handler: async (ctx, args) => {
    const politicians = await ctx.db
      .query("politicians")
      .withIndex("by_party", (q) => q.eq("party", args.party))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return politicians;
  },
});

export const byIds = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    const items = await Promise.all(
      args.ids.map(async (id) => {
        const normalizedId = ctx.db.normalizeId("politicians", id);
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
      .query("politicians")
      .withSearchIndex("search_name", (q) => q.search("fullName", args.searchTerm))
      .take(20);

    return results;
  },
});

export const save = mutation({
  args: {
    id: v.optional(v.id("politicians")),
    fullName: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    slug: v.string(),
    photo: v.optional(v.string()),
    party: v.optional(v.string()),
    position: v.optional(v.string()),
    bio: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("politicians", data);
  },
});

export const remove = mutation({
  args: { id: v.id("politicians") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seedPoliticians = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("politicians").take(1);
    if (existing.length > 0) return { skipped: true, message: "Politicians already seeded" };

    const politicians = [
      {
        fullName: "Rafał Bruski",
        firstName: "Rafał",
        lastName: "Bruski",
        slug: "rafal-bruski",
        photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
        party: "Koalicja Obywatelska",
        position: "Prezydent Bydgoszczy",
        bio: "Prezydent miasta Bydgoszczy od 2014 roku. Wcześniej poseł na Sejm RP. Absolwent Wydziału Prawa i Administracji UMK w Toruniu. Inicjator wielu kluczowych inwestycji miejskich.",
        facebookUrl: "https://facebook.com",
        websiteUrl: "https://bydgoszcz.pl",
        isActive: true,
      },
      {
        fullName: "Anna Mackiewicz",
        firstName: "Anna",
        lastName: "Mackiewicz",
        slug: "anna-mackiewicz",
        photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
        party: "Koalicja Obywatelska",
        position: "Przewodnicząca Rady Miasta",
        bio: "Przewodnicząca Rady Miasta Bydgoszczy. Aktywistka społeczna, zaangażowana w projekty ekologiczne i edukacyjne. Radna od 2018 roku.",
        facebookUrl: "https://facebook.com",
        isActive: true,
      },
      {
        fullName: "Tomasz Latos",
        firstName: "Tomasz",
        lastName: "Latos",
        slug: "tomasz-latos",
        photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        party: "Prawo i Sprawiedliwość",
        position: "Poseł na Sejm RP",
        bio: "Poseł na Sejm RP z okręgu bydgoskiego. Lekarz z zawodu, specjalista chirurgii. Wieloletni działacz partyjny i samorządowy.",
        facebookUrl: "https://facebook.com",
        websiteUrl: "https://sejm.gov.pl",
        isActive: true,
      },
      {
        fullName: "Krzysztof Kowalski",
        firstName: "Krzysztof",
        lastName: "Kowalski",
        slug: "krzysztof-kowalski",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        party: "Prawo i Sprawiedliwość",
        position: "Radny Miejski",
        bio: "Radny Rady Miasta Bydgoszczy. Przedsiębiorca, działacz społeczny. Zaangażowany w sprawy bezpieczeństwa i infrastruktury miejskiej.",
        isActive: true,
      },
      {
        fullName: "Magdalena Wróblewska",
        firstName: "Magdalena",
        lastName: "Wróblewska",
        slug: "magdalena-wroblewska",
        photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
        party: "Trzecia Droga",
        position: "Radna Miejska",
        bio: "Radna Rady Miasta Bydgoszczy z ramienia Trzeciej Drogi. Nauczycielka akademicka, specjalistka ds. polityki społecznej i edukacji.",
        facebookUrl: "https://facebook.com",
        isActive: true,
      },
      {
        fullName: "Piotr Nowicki",
        firstName: "Piotr",
        lastName: "Nowicki",
        slug: "piotr-nowicki",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        party: "Lewica",
        position: "Radny Miejski",
        bio: "Radny Rady Miasta Bydgoszczy z ramienia Lewicy. Działacz związkowy, zaangażowany w sprawy pracownicze i politykę mieszkaniową.",
        facebookUrl: "https://facebook.com",
        isActive: true,
      },
      {
        fullName: "Beata Adamczyk",
        firstName: "Beata",
        lastName: "Adamczyk",
        slug: "beata-adamczyk",
        photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        party: "Koalicja Obywatelska",
        position: "Zastępca Prezydenta",
        bio: "Zastępca Prezydenta Bydgoszczy ds. kultury i sportu. Absolwentka kulturoznawstwa, wieloletnia dyrektorka instytucji kultury.",
        websiteUrl: "https://bydgoszcz.pl",
        isActive: true,
      },
      {
        fullName: "Marek Wiśniewski",
        firstName: "Marek",
        lastName: "Wiśniewski",
        slug: "marek-wisniewski",
        photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
        party: "Trzecia Droga",
        position: "Poseł na Sejm RP",
        bio: "Poseł na Sejm RP z okręgu bydgoskiego. Ekonomista, były dyrektor regionalnego oddziału banku. Specjalizuje się w polityce gospodarczej.",
        facebookUrl: "https://facebook.com",
        websiteUrl: "https://sejm.gov.pl",
        isActive: true,
      },
    ];

    for (const politician of politicians) {
      await ctx.db.insert("politicians", politician);
    }

    return { success: true, count: politicians.length };
  },
});
