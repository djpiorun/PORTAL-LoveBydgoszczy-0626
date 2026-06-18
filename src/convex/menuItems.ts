import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("menu_items").withIndex("by_order").order("asc").take(50);
  },
});

export const listByPlacement = query({
  args: { placement: v.union(v.literal("main"), v.literal("more"), v.literal("kontakt")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menu_items")
      .withIndex("by_placement", q => q.eq("placement", args.placement))
      .order("asc")
      .take(100);
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("menu_items")),
    label: v.string(),
    path: v.string(),
    icon: v.string(),
    tooltip: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
    placement: v.union(v.literal("main"), v.literal("more"), v.literal("kontakt")),
    type: v.union(
      v.literal("internal_link"),
      v.literal("category_link"),
      v.literal("dropdown_group"),
      v.literal("external_link"),
    ),
    parentId: v.optional(v.id("menu_items")),
    showWhenScrolled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("menu_items", data);
  },
});

export const remove = mutation({
  args: { id: v.id("menu_items") },
  handler: async (ctx, args) => {
    // Also remove children
    const children = await ctx.db
      .query("menu_items")
      .withIndex("by_parent", q => q.eq("parentId", args.id))
      .take(100);
    await Promise.all(children.map(c => ctx.db.delete(c._id)));
    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    items: v.array(v.object({ id: v.id("menu_items"), order: v.number() })),
  },
  handler: async (ctx, args) => {
    await Promise.all(args.items.map(item => ctx.db.patch(item.id, { order: item.order })));
  },
});

export const seedDefault = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("menu_items").take(1);
    if (existing.length > 0) return { seeded: false };

    const defaults = [
      // Main nav — order per requested sequence
      { label: "Wiadomości",      path: "/miasto",          icon: "Newspaper",   tooltip: "Najnowsze miejskie informacje",            order: 1,  isActive: true, placement: "main" as const,    type: "category_link" as const },
      { label: "Rozrywka",        path: "/rozrywka",        icon: "Laugh",       tooltip: "Czas wolny i to, co dzieje się w mieście", order: 2,  isActive: true, placement: "main" as const,    type: "category_link" as const },
      { label: "Kultura",         path: "/kultura",         icon: "Music",       tooltip: "Wydarzenia, sztuka i lokalne życie",        order: 3,  isActive: true, placement: "main" as const,    type: "category_link" as const },
      { label: "Gastronomia",     path: "/gastronomia",     icon: "Utensils",    tooltip: "Kuchnia bydgoska w jednym miejscu",         order: 4,  isActive: true, placement: "main" as const,    type: "category_link" as const },
      { label: "Medycyna",        path: "/medyczna",        icon: "HeartPulse",  tooltip: "Zdrowie i medycyna w mieście",              order: 5,  isActive: true, placement: "main" as const,    type: "category_link" as const },
      { label: "Biznes",          path: "/biznes",          icon: "Briefcase",   tooltip: "Lokalna gospodarka i przedsiębiorczość",    order: 6,  isActive: true, placement: "main" as const,    type: "category_link" as const },
      { label: "Sport",           path: "/sport",           icon: "Trophy",      tooltip: "Miejska kultura sportu i wyniki",           order: 7,  isActive: true, placement: "main" as const,    type: "category_link" as const },
      { label: "Inwestycje",      path: "/inwestycje",      icon: "HardHat",     tooltip: "Rozwój miasta i najważniejsze zmiany",      order: 8,  isActive: true, placement: "main" as const,    type: "category_link" as const },
      { label: "Polityka",        path: "/polityka",        icon: "Building2",   tooltip: "Sprawy miasta, decyzje i ludzie",           order: 9,  isActive: true, placement: "main" as const,    type: "category_link" as const },
      // More dropdown
      { label: "Nasze Działania", path: "/nasze-dzialania", icon: "Target",      tooltip: "To, co robimy lokalnie",                   order: 10, isActive: true, placement: "more" as const,    type: "internal_link" as const },
      { label: "Bydgoszczanie",   path: "/bydgoszczanie",   icon: "Users",       tooltip: "Ludzie i społeczność Bydgoszczy",          order: 11, isActive: true, placement: "more" as const,    type: "category_link" as const },
      { label: "Aktualizacje",    path: "/aktualizacje",    icon: "Bell",        tooltip: "Bieżące aktualizacje portalu",             order: 12, isActive: true, placement: "more" as const,    type: "internal_link" as const },
      { label: "Nekrologi",       path: "/nekrolog",        icon: "Heart",       tooltip: "Strefa Pamięci — nekrologi",               order: 13, isActive: true, placement: "more" as const,    type: "internal_link" as const },
      { label: "Transport",       path: "/rozklad-jazdy",   icon: "TramFront",   tooltip: "Rozkład jazdy MZK Bydgoszcz",             order: 14, isActive: true, placement: "more" as const,    type: "internal_link" as const },
      { label: "Pogoda",          path: "/pogoda",          icon: "CloudSun",    tooltip: "Aktualna pogoda w Bydgoszczy",             order: 15, isActive: true, placement: "more" as const,    type: "internal_link" as const },
      // Kontakt dropdown
      { label: "Nasze Działania", path: "/nasze-dzialania", icon: "Target",      tooltip: "Inicjatywy i projekty redakcji",           order: 16, isActive: true, placement: "kontakt" as const, type: "internal_link" as const },
      { label: "Napisz do nas",   path: "/kontakt",         icon: "Mail",        tooltip: "Formularz kontaktowy",                     order: 17, isActive: true, placement: "kontakt" as const, type: "internal_link" as const },
    ];

    await Promise.all(defaults.map(item => ctx.db.insert("menu_items", item)));
    return { seeded: true };
  },
});

export const getNavData = query({
  args: {},
  handler: async (ctx) => {
    const [menuItems, pages] = await Promise.all([
      ctx.db.query("menu_items").withIndex("by_order").order("asc").take(50),
      ctx.db.query("pages").withIndex("by_order").order("asc").take(50),
    ]);
    const menuPages = pages.filter(
      (p) => !p.deletedAt && !p.archivedAt && p.status === "published" && p.isVisibleInMenu
    );
    return { menuItems, menuPages };
  },
});