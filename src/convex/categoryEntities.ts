import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Category entities management
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("category_entities").take(500);
  },
});

export const byCategory = query({
  args: { categoryKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("category_entities")
      .withIndex("by_category", (q) => q.eq("categoryKey", args.categoryKey))
      .take(200);
  },
});

export const byCategoryAndType = query({
  args: { categoryKey: v.string(), entityType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("category_entities")
      .withIndex("by_category_entity_type", (q) => q.eq("categoryKey", args.categoryKey).eq("entityType", args.entityType))
      .take(100);
  },
});

export const byIds = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    const items = await Promise.all(
      args.ids.map(async (id) => {
        const normalizedId = ctx.db.normalizeId("category_entities", id);
        return normalizedId ? await ctx.db.get(normalizedId) : null;
      }),
    );
    return items.filter(Boolean);
  },
});

export const save = mutation({
  args: {
    id: v.optional(v.id("category_entities")),
    categoryKey: v.string(),
    entityType: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentId: v.optional(v.id("category_entities")),
    externalRef: v.optional(v.string()),
    metadata: v.optional(v.string()),
    isActive: v.boolean(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("category_entities", data);
  },
});

export const remove = mutation({
  args: { id: v.id("category_entities") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seedCategoryEntities = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("category_entities").take(1);
    if (existing.length > 0) return { skipped: true, message: "Category entities already seeded" };

    const entities: Array<{
      categoryKey: string; entityType: string; name: string; slug: string;
      description?: string; color?: string; isActive: boolean; order: number;
    }> = [
      // ── SPORT: Ligi ──────────────────────────────────────────────────────────
      { categoryKey: "sport", entityType: "sport_league", name: "PKO BP Ekstraklasa", slug: "ekstraklasa", description: "Najwyższa klasa rozgrywkowa piłki nożnej w Polsce", color: "#1a56db", isActive: true, order: 1 },
      { categoryKey: "sport", entityType: "sport_league", name: "I liga piłkarska", slug: "i-liga", description: "Druga klasa rozgrywkowa piłki nożnej", color: "#3b82f6", isActive: true, order: 2 },
      { categoryKey: "sport", entityType: "sport_league", name: "IV liga kujawsko-pomorska", slug: "iv-liga-kujawsko-pomorska", description: "Regionalna liga piłkarska", color: "#60a5fa", isActive: true, order: 3 },
      { categoryKey: "sport", entityType: "sport_league", name: "PGE Ekstraliga Żużlowa", slug: "pge-ekstraliga-zuzel", description: "Najwyższa klasa rozgrywkowa żużla w Polsce", color: "#f59e0b", isActive: true, order: 4 },
      { categoryKey: "sport", entityType: "sport_league", name: "1. Liga Żużlowa", slug: "1-liga-zuzel", description: "Druga klasa rozgrywkowa żużla", color: "#fbbf24", isActive: true, order: 5 },
      { categoryKey: "sport", entityType: "sport_league", name: "PlusLiga Siatkówka", slug: "plusliga", description: "Najwyższa klasa rozgrywkowa siatkówki mężczyzn", color: "#10b981", isActive: true, order: 6 },
      // ── SPORT: Sezony ────────────────────────────────────────────────────────
      { categoryKey: "sport", entityType: "sport_season", name: "Sezon 2024/2025", slug: "sezon-2024-2025", description: "Aktualny sezon rozgrywkowy", color: "#6366f1", isActive: true, order: 1 },
      { categoryKey: "sport", entityType: "sport_season", name: "Sezon 2023/2024", slug: "sezon-2023-2024", description: "Poprzedni sezon rozgrywkowy", color: "#8b5cf6", isActive: true, order: 2 },
      { categoryKey: "sport", entityType: "sport_season", name: "Sezon 2022/2023", slug: "sezon-2022-2023", color: "#a78bfa", isActive: true, order: 3 },
      // ── SPORT: Tabele ────────────────────────────────────────────────────────
      { categoryKey: "sport", entityType: "sport_table", name: "Tabela Ekstraklasy 2024/25", slug: "tabela-ekstraklasy-2024-25", color: "#1a56db", isActive: true, order: 1 },
      { categoryKey: "sport", entityType: "sport_table", name: "Tabela IV ligi kuj.-pom.", slug: "tabela-iv-ligi-kuj-pom", color: "#3b82f6", isActive: true, order: 2 },
      { categoryKey: "sport", entityType: "sport_table", name: "Tabela PGE Ekstraligi Żużlowej", slug: "tabela-pge-ekstraligi", color: "#f59e0b", isActive: true, order: 3 },
      // ── SPORT: Wydarzenia ────────────────────────────────────────────────────
      { categoryKey: "sport", entityType: "sport_event", name: "Zawisza vs Lech Poznań", slug: "zawisza-vs-lech-2024", description: "15. kolejka PKO Ekstraklasy", color: "#ef4444", isActive: true, order: 1 },
      { categoryKey: "sport", entityType: "sport_event", name: "Sparta vs Falubaz Zielona Góra", slug: "sparta-vs-falubaz-2024", description: "Finał PGE Ekstraligi", color: "#f59e0b", isActive: true, order: 2 },
      { categoryKey: "sport", entityType: "sport_event", name: "Łuczniczka vs Jastrzębski Węgiel", slug: "luczniczka-vs-jastrzebski-2024", description: "Mecz PlusLigi", color: "#10b981", isActive: true, order: 3 },

      // ── POLITYKA: Ugrupowania ────────────────────────────────────────────────
      { categoryKey: "polityka", entityType: "political_group", name: "Koalicja Obywatelska", slug: "koalicja-obywatelska", description: "Centrolewicowa koalicja partii politycznych", color: "#f97316", isActive: true, order: 1 },
      { categoryKey: "polityka", entityType: "political_group", name: "Prawo i Sprawiedliwość", slug: "prawo-i-sprawiedliwosc", description: "Prawicowa partia polityczna", color: "#1d4ed8", isActive: true, order: 2 },
      { categoryKey: "polityka", entityType: "political_group", name: "Trzecia Droga", slug: "trzecia-droga", description: "Koalicja PSL i Polski 2050", color: "#16a34a", isActive: true, order: 3 },
      { categoryKey: "polityka", entityType: "political_group", name: "Lewica", slug: "lewica", description: "Koalicja lewicowych partii", color: "#dc2626", isActive: true, order: 4 },
      { categoryKey: "polityka", entityType: "political_group", name: "Konfederacja", slug: "konfederacja", description: "Prawicowo-wolnościowa koalicja", color: "#7c3aed", isActive: true, order: 5 },
      { categoryKey: "polityka", entityType: "political_group", name: "Rada Miasta Bydgoszczy", slug: "rada-miasta-bydgoszczy", description: "Organ stanowiący samorządu miejskiego", color: "#0f766e", isActive: true, order: 6 },
      // ── POLITYKA: Stanowiska ─────────────────────────────────────────────────
      { categoryKey: "polityka", entityType: "political_position", name: "Prezydent Miasta", slug: "prezydent-miasta", color: "#1a56db", isActive: true, order: 1 },
      { categoryKey: "polityka", entityType: "political_position", name: "Zastępca Prezydenta", slug: "zastepca-prezydenta", color: "#3b82f6", isActive: true, order: 2 },
      { categoryKey: "polityka", entityType: "political_position", name: "Przewodniczący Rady Miasta", slug: "przewodniczacy-rady-miasta", color: "#6366f1", isActive: true, order: 3 },
      { categoryKey: "polityka", entityType: "political_position", name: "Radny Miejski", slug: "radny-miejski", color: "#8b5cf6", isActive: true, order: 4 },
      { categoryKey: "polityka", entityType: "political_position", name: "Poseł na Sejm RP", slug: "posel-na-sejm", color: "#a21caf", isActive: true, order: 5 },
      { categoryKey: "polityka", entityType: "political_position", name: "Senator RP", slug: "senator-rp", color: "#be185d", isActive: true, order: 6 },
      { categoryKey: "polityka", entityType: "political_position", name: "Marszałek Województwa", slug: "marszalek-wojewodztwa", color: "#0f766e", isActive: true, order: 7 },
      // ── POLITYKA: Typy materiałów ────────────────────────────────────────────
      { categoryKey: "polityka", entityType: "political_material_type", name: "Wywiad", slug: "wywiad", color: "#0369a1", isActive: true, order: 1 },
      { categoryKey: "polityka", entityType: "political_material_type", name: "Analiza", slug: "analiza", color: "#0f766e", isActive: true, order: 2 },
      { categoryKey: "polityka", entityType: "political_material_type", name: "Komentarz", slug: "komentarz", color: "#7c3aed", isActive: true, order: 3 },
      { categoryKey: "polityka", entityType: "political_material_type", name: "Relacja z sesji", slug: "relacja-z-sesji", color: "#b45309", isActive: true, order: 4 },
      { categoryKey: "polityka", entityType: "political_material_type", name: "Konferencja prasowa", slug: "konferencja-prasowa", color: "#1d4ed8", isActive: true, order: 5 },
      // ── POLITYKA: Wydarzenia ─────────────────────────────────────────────────
      { categoryKey: "polityka", entityType: "political_event", name: "Sesja Rady Miasta — marzec 2025", slug: "sesja-rady-miasta-marzec-2025", description: "Głosowanie nad budżetem inwestycyjnym", color: "#1a56db", isActive: true, order: 1 },
      { categoryKey: "polityka", entityType: "political_event", name: "Konferencja prasowa Prezydenta", slug: "konferencja-prezydenta-2025", description: "Ogłoszenie planu inwestycji transportowych", color: "#0f766e", isActive: true, order: 2 },
      { categoryKey: "polityka", entityType: "political_event", name: "Wybory samorządowe 2024", slug: "wybory-samorzadowe-2024", description: "Wyniki wyborów samorządowych w Bydgoszczy", color: "#dc2626", isActive: true, order: 3 },

      // ── INWESTYCJE: Wykonawcy ────────────────────────────────────────────────
      { categoryKey: "inwestycje", entityType: "investment_contractor", name: "Budimex S.A.", slug: "budimex", description: "Jedna z największych firm budowlanych w Polsce", color: "#f97316", isActive: true, order: 1 },
      { categoryKey: "inwestycje", entityType: "investment_contractor", name: "Strabag Sp. z o.o.", slug: "strabag", description: "Austriacki koncern budowlany", color: "#1d4ed8", isActive: true, order: 2 },
      { categoryKey: "inwestycje", entityType: "investment_contractor", name: "Mota-Engil Polska", slug: "mota-engil", description: "Portugalska firma budowlana działająca w Polsce", color: "#16a34a", isActive: true, order: 3 },
      { categoryKey: "inwestycje", entityType: "investment_contractor", name: "Torpol S.A.", slug: "torpol", description: "Specjalista od infrastruktury kolejowej", color: "#0f766e", isActive: true, order: 4 },
      { categoryKey: "inwestycje", entityType: "investment_contractor", name: "Mosty Sp. z o.o.", slug: "mosty", description: "Specjalista od budowy i remontów mostów", color: "#7c3aed", isActive: true, order: 5 },
      { categoryKey: "inwestycje", entityType: "investment_contractor", name: "Skanska S.A.", slug: "skanska", description: "Szwedzki koncern budowlany", color: "#dc2626", isActive: true, order: 6 },
      // ── INWESTYCJE: Lokalizacje ──────────────────────────────────────────────
      { categoryKey: "inwestycje", entityType: "investment_location", name: "Śródmieście", slug: "srodmiescie", color: "#1a56db", isActive: true, order: 1 },
      { categoryKey: "inwestycje", entityType: "investment_location", name: "Fordon", slug: "fordon", color: "#3b82f6", isActive: true, order: 2 },
      { categoryKey: "inwestycje", entityType: "investment_location", name: "Bielawy", slug: "bielawy", color: "#60a5fa", isActive: true, order: 3 },
      { categoryKey: "inwestycje", entityType: "investment_location", name: "Wyżyny", slug: "wyzyny", color: "#93c5fd", isActive: true, order: 4 },
      { categoryKey: "inwestycje", entityType: "investment_location", name: "Szwederowo", slug: "szwederowo", color: "#6366f1", isActive: true, order: 5 },
      { categoryKey: "inwestycje", entityType: "investment_location", name: "Okole", slug: "okole", color: "#8b5cf6", isActive: true, order: 6 },
      { categoryKey: "inwestycje", entityType: "investment_location", name: "Centrum", slug: "centrum", color: "#0f766e", isActive: true, order: 7 },
      // ── INWESTYCJE: Typy ─────────────────────────────────────────────────────
      { categoryKey: "inwestycje", entityType: "investment_type", name: "Infrastruktura drogowa", slug: "infrastruktura-drogowa", color: "#f59e0b", isActive: true, order: 1 },
      { categoryKey: "inwestycje", entityType: "investment_type", name: "Transport publiczny", slug: "transport-publiczny", color: "#10b981", isActive: true, order: 2 },
      { categoryKey: "inwestycje", entityType: "investment_type", name: "Rewitalizacja", slug: "rewitalizacja", color: "#6366f1", isActive: true, order: 3 },
      { categoryKey: "inwestycje", entityType: "investment_type", name: "Ochrona zdrowia", slug: "ochrona-zdrowia", color: "#ef4444", isActive: true, order: 4 },
      { categoryKey: "inwestycje", entityType: "investment_type", name: "Edukacja", slug: "edukacja", color: "#3b82f6", isActive: true, order: 5 },
      { categoryKey: "inwestycje", entityType: "investment_type", name: "Zieleń miejska", slug: "zielen-miejska", color: "#16a34a", isActive: true, order: 6 },
      { categoryKey: "inwestycje", entityType: "investment_type", name: "Mosty i wiadukty", slug: "mosty-i-wiadukty", color: "#7c3aed", isActive: true, order: 7 },
      // ── INWESTYCJE: Statusy ──────────────────────────────────────────────────
      { categoryKey: "inwestycje", entityType: "investment_status", name: "Planowana", slug: "planowana", description: "Inwestycja w fazie planowania i projektowania", color: "#3b82f6", isActive: true, order: 1 },
      { categoryKey: "inwestycje", entityType: "investment_status", name: "W trakcie realizacji", slug: "w-trakcie", description: "Prace budowlane w toku", color: "#f59e0b", isActive: true, order: 2 },
      { categoryKey: "inwestycje", entityType: "investment_status", name: "Zakończona", slug: "zakonczona", description: "Inwestycja zrealizowana i oddana do użytku", color: "#10b981", isActive: true, order: 3 },
      { categoryKey: "inwestycje", entityType: "investment_status", name: "Wstrzymana", slug: "wstrzymana", description: "Realizacja tymczasowo wstrzymana", color: "#ef4444", isActive: true, order: 4 },
      // ── INWESTYCJE: Etapy ────────────────────────────────────────────────────
      { categoryKey: "inwestycje", entityType: "investment_phase", name: "Dokumentacja projektowa", slug: "dokumentacja-projektowa", color: "#6366f1", isActive: true, order: 1 },
      { categoryKey: "inwestycje", entityType: "investment_phase", name: "Przetarg", slug: "przetarg", color: "#8b5cf6", isActive: true, order: 2 },
      { categoryKey: "inwestycje", entityType: "investment_phase", name: "Prace przygotowawcze", slug: "prace-przygotowawcze", color: "#f59e0b", isActive: true, order: 3 },
      { categoryKey: "inwestycje", entityType: "investment_phase", name: "Roboty budowlane", slug: "roboty-budowlane", color: "#f97316", isActive: true, order: 4 },
      { categoryKey: "inwestycje", entityType: "investment_phase", name: "Odbiór techniczny", slug: "odbior-techniczny", color: "#10b981", isActive: true, order: 5 },
      { categoryKey: "inwestycje", entityType: "investment_phase", name: "Oddanie do użytku", slug: "oddanie-do-uzytku", color: "#16a34a", isActive: true, order: 6 },
    ];

    for (const entity of entities) {
      await ctx.db.insert("category_entities", entity);
    }

    return { success: true, count: entities.length };
  },
});