import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Sport players management
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sport_players")
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(500);
  },
});

export const byTeam = query({
  args: { teamId: v.id("sport_teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sport_players")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const byIds = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    const items = await Promise.all(
      args.ids.map(async (id) => {
        const normalizedId = ctx.db.normalizeId("sport_players", id);
        return normalizedId ? await ctx.db.get(normalizedId) : null;
      }),
    );

    return items.filter(Boolean);
  },
});

export const save = mutation({
  args: {
    id: v.optional(v.id("sport_players")),
    fullName: v.string(),
    slug: v.string(),
    teamId: v.optional(v.id("sport_teams")),
    teamName: v.optional(v.string()),
    sportType: v.union(
      v.literal("pilka_nozna"),
      v.literal("zuzel"),
      v.literal("siatkowka"),
      v.literal("inne"),
    ),
    number: v.optional(v.string()),
    position: v.optional(v.string()),
    photo: v.optional(v.string()),
    bio: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("sport_players", data);
  },
});

export const remove = mutation({
  args: { id: v.id("sport_players") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seedSportPlayers = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("sport_players").take(1);
    if (existing.length > 0) return { skipped: true, message: "Sport players already seeded" };

    // Get team IDs for linking
    const zawisza = await ctx.db.query("sport_teams").withIndex("by_slug", q => q.eq("slug", "zawisza-bydgoszcz")).first();
    const sparta = await ctx.db.query("sport_teams").withIndex("by_slug", q => q.eq("slug", "sparta-bydgoszcz")).first();
    const luczniczka = await ctx.db.query("sport_teams").withIndex("by_slug", q => q.eq("slug", "luczniczka-bydgoszcz")).first();
    const chemik = await ctx.db.query("sport_teams").withIndex("by_slug", q => q.eq("slug", "chemik-bydgoszcz")).first();

    const players = [
      // Zawisza Bydgoszcz - piłka nożna
      { fullName: "Marcin Lewandowski", slug: "marcin-lewandowski", teamId: zawisza?._id, teamName: "Zawisza Bydgoszcz", sportType: "pilka_nozna" as const, number: "1", position: "Bramkarz", photo: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face", bio: "Doświadczony bramkarz Zawiszy Bydgoszcz. Kapitan drużyny od 2021 roku.", isActive: true },
      { fullName: "Adam Kowalski", slug: "adam-kowalski", teamId: zawisza?._id, teamName: "Zawisza Bydgoszcz", sportType: "pilka_nozna" as const, number: "10", position: "Napastnik", photo: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face", bio: "Najlepszy strzelec Zawiszy. Wychowanek klubu, w pierwszym składzie od 2019 roku.", isActive: true },
      { fullName: "Paweł Nowak", slug: "pawel-nowak", teamId: zawisza?._id, teamName: "Zawisza Bydgoszcz", sportType: "pilka_nozna" as const, number: "7", position: "Pomocnik", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face", bio: "Kreatywny pomocnik, odpowiedzialny za rozgrywanie akcji ofensywnych.", isActive: true },
      { fullName: "Tomasz Wiśniewski", slug: "tomasz-wisniewski", teamId: zawisza?._id, teamName: "Zawisza Bydgoszcz", sportType: "pilka_nozna" as const, number: "4", position: "Obrońca", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face", bio: "Solidny obrońca, lider defensywy Zawiszy.", isActive: true },
      { fullName: "Krzysztof Zając", slug: "krzysztof-zajac", teamId: zawisza?._id, teamName: "Zawisza Bydgoszcz", sportType: "pilka_nozna" as const, number: "9", position: "Napastnik", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", bio: "Szybki napastnik, specjalista od gry jeden na jeden.", isActive: true },
      // Chemik Bydgoszcz - piłka nożna
      { fullName: "Piotr Malinowski", slug: "piotr-malinowski", teamId: chemik?._id, teamName: "Chemik Bydgoszcz", sportType: "pilka_nozna" as const, number: "1", position: "Bramkarz", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face", bio: "Bramkarz Chemika Bydgoszcz, znany z pewnych interwencji.", isActive: true },
      { fullName: "Michał Dąbrowski", slug: "michal-dabrowski", teamId: chemik?._id, teamName: "Chemik Bydgoszcz", sportType: "pilka_nozna" as const, number: "11", position: "Skrzydłowy", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face", bio: "Szybki skrzydłowy, groźny przy stałych fragmentach gry.", isActive: true },
      // Sparta Bydgoszcz - żużel
      { fullName: "Bartosz Zmarzlik", slug: "bartosz-zmarzlik", teamId: sparta?._id, teamName: "Sparta Bydgoszcz", sportType: "zuzel" as const, number: "1", position: "Zawodnik żużlowy", photo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=face", bio: "Wielokrotny mistrz świata na żużlu. Lider Sparty Bydgoszcz.", isActive: true },
      { fullName: "Janusz Kołodziej", slug: "janusz-kolodziej", teamId: sparta?._id, teamName: "Sparta Bydgoszcz", sportType: "zuzel" as const, number: "5", position: "Zawodnik żużlowy", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face", bio: "Doświadczony zawodnik żużlowy, wieloletni reprezentant Polski.", isActive: true },
      { fullName: "Patryk Dudek", slug: "patryk-dudek", teamId: sparta?._id, teamName: "Sparta Bydgoszcz", sportType: "zuzel" as const, number: "7", position: "Zawodnik żużlowy", photo: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face", bio: "Młody talent żużlowy, wychowanek bydgoskiego żużla.", isActive: true },
      // Łuczniczka Bydgoszcz - siatkówka
      { fullName: "Karol Kłos", slug: "karol-klos", teamId: luczniczka?._id, teamName: "Łuczniczka Bydgoszcz", sportType: "siatkowka" as const, number: "9", position: "Środkowy", photo: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face", bio: "Reprezentant Polski w siatkówce. Jeden z najlepszych środkowych w PlusLidze.", isActive: true },
      { fullName: "Maciej Muzaj", slug: "maciej-muzaj", teamId: luczniczka?._id, teamName: "Łuczniczka Bydgoszcz", sportType: "siatkowka" as const, number: "14", position: "Przyjmujący", photo: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face", bio: "Skuteczny przyjmujący, kluczowy zawodnik Łuczniczki.", isActive: true },
      { fullName: "Grzegorz Łomacz", slug: "grzegorz-lomacz", teamId: luczniczka?._id, teamName: "Łuczniczka Bydgoszcz", sportType: "siatkowka" as const, number: "6", position: "Rozgrywający", photo: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=400&fit=crop&crop=face", bio: "Rozgrywający Łuczniczki, znany z precyzyjnych zagrań.", isActive: true },
    ];

    for (const player of players) {
      await ctx.db.insert("sport_players", player);
    }

    return { success: true, count: players.length };
  },
});