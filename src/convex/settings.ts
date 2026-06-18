import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const categorySubitemValidator = v.object({
  key: v.string(),
  label: v.string(),
  description: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
});

type CategoryDef = {
  value: string;
  label: string;
  color: string;
  type: "basic" | "advanced";
  routeSlug?: string;
  description?: string;
  subcategories?: Array<{ key: string; label: string; description?: string; isActive?: boolean }>;
};

const CATEGORY_DEFINITIONS: CategoryDef[] = [
  { value: "miasto", label: "Miasto", color: "#3b82f6", type: "basic", description: "Wiadomości miejskie i lokalne wydarzenia" },
  { value: "rozrywka", label: "Rozrywka", color: "#8b5cf6", type: "basic", description: "Koncerty, wydarzenia i lifestyle" },
  { value: "kultura", label: "Kultura", color: "#f59e0b", type: "basic", description: "Sztuka, teatr i dziedzictwo miasta" },
  { value: "biznes", label: "Biznes", color: "#10b981", type: "basic", description: "Gospodarka i przedsiębiorczość" },
  { value: "gastronomia", label: "Gastronomia", color: "#f97316", type: "basic", description: "Restauracje, kawiarnie i lokalne smaki" },
  { value: "bydgoszczanie", label: "Bydgoszczanie", color: "#f43f5e", type: "basic", description: "Historie mieszkańców i sylwetki" },
  { value: "medyczna", label: "Medyczna Bydgoszcz", color: "#14b8a6", type: "basic", description: "Zdrowie, medycyna i profilaktyka" },
  {
    value: "sport",
    label: "Sport",
    color: "#2563eb",
    type: "advanced",
    description: "Rozbudowana kategoria z dyscyplinami, drużynami i relacjami meczowymi",
    subcategories: [
      { key: "pilka_nozna", label: "Piłka nożna", isActive: true },
      { key: "siatkowka", label: "Siatkówka", isActive: true },
      { key: "zuzel", label: "Żużel", isActive: true },
      { key: "inne", label: "Inne", isActive: true },
    ],
  },
  {
    value: "polityka",
    label: "Polityka",
    color: "#475569",
    type: "advanced",
    description: "Kategoria z ugrupowaniami, politykami i osią wydarzeń",
    subcategories: [
      { key: "koalicja_obywatelska", label: "Koalicja Obywatelska", isActive: true },
      { key: "prawo_i_sprawiedliwosc", label: "Prawo i Sprawiedliwość", isActive: true },
      { key: "trzecia_droga", label: "Trzecia Droga", isActive: true },
      { key: "lewica", label: "Lewica", isActive: true },
    ],
  },
  {
    value: "inwestycje",
    label: "Inwestycje",
    color: "#d97706",
    type: "advanced",
    description: "Kategoria z projektami, statusami i monitoringiem realizacji",
    subcategories: [
      { key: "planowana", label: "Planowana", isActive: true },
      { key: "w_trakcie", label: "W trakcie", isActive: true },
      { key: "zakonczona", label: "Zakończona", isActive: true },
      { key: "wstrzymana", label: "Wstrzymana", isActive: true },
    ],
  },
  {
    value: "nasze_dzialania",
    label: "Nasze Działania",
    color: "#db2777",
    type: "advanced",
    routeSlug: "nasze-dzialania",
    description: "Kategoria redakcyjna z akcjami, projektami i współpracami",
    subcategories: [
      { key: "akcja", label: "Akcja", isActive: true },
      { key: "projekt", label: "Projekt", isActive: true },
      { key: "kampania", label: "Kampania", isActive: true },
      { key: "wspolpraca", label: "Współpraca", isActive: true },
    ],
  },
];

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("settings").first();
  },
});

export const save = mutation({
  args: {
    portalName: v.string(),
    seoDescription: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    contactAddress: v.string(),
    footerDescription: v.optional(v.string()),
    footerLocationLine1: v.optional(v.string()),
    footerLocationLine2: v.optional(v.string()),
    footerBottomNote: v.optional(v.string()),
    facebookUrl: v.string(),
    instagramUrl: v.string(),
    youtubeUrl: v.string(),
    twitterUrl: v.string(),
    r2Enabled: v.optional(v.boolean()),
    r2AccountId: v.optional(v.string()),
    r2AccessKeyId: v.optional(v.string()),
    r2SecretAccessKey: v.optional(v.string()),
    r2BucketName: v.optional(v.string()),
    r2PublicBaseUrl: v.optional(v.string()),
    mediaMaxWidth: v.optional(v.number()),
    mediaQuality: v.optional(v.number()),
    mediaConvertToWebp: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    const existing = await ctx.db.query("settings").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("settings", args);
    }
  },
});

export const getMediaConfig = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return {
      r2Enabled: !!settings?.r2Enabled,
      mediaMaxWidth: settings?.mediaMaxWidth ?? 1600,
      mediaQuality: settings?.mediaQuality ?? 82,
      mediaConvertToWebp: settings?.mediaConvertToWebp ?? true,
    };
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("category_settings").withIndex("by_order").take(50);
    if (categories.length === 0) {
      return CATEGORY_DEFINITIONS.map((category, index) => ({
        key: category.value,
        label: category.label,
        description: category.description,
        color: category.color,
        type: category.type,
        routeSlug: category.routeSlug,
        subcategories: category.subcategories,
        order: index + 1,
        isActive: true,
        isDefault: true,
      }));
    }
    const dbKeys = new Set(categories.map((c) => c.key));
    const missing = CATEGORY_DEFINITIONS
      .filter((def) => !dbKeys.has(def.value))
      .map((def, i) => ({
        key: def.value,
        label: def.label,
        description: def.description,
        color: def.color,
        type: def.type,
        routeSlug: def.routeSlug,
        subcategories: def.subcategories,
        order: categories.length + i + 1,
        isActive: true,
        isDefault: true,
      }));
    return [...categories, ...missing];
  },
});

export const saveCategory = mutation({
  args: {
    id: v.optional(v.id("category_settings")),
    key: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    type: v.optional(v.union(v.literal("basic"), v.literal("advanced"))),
    routeSlug: v.optional(v.string()),
    subcategories: v.optional(v.array(categorySubitemValidator)),
    order: v.number(),
    isActive: v.boolean(),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
    } else {
      await ctx.db.insert("category_settings", data);
    }
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("category_settings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

export const seedDefaultCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    const existing = await ctx.db.query("category_settings").take(50);
    const existingKeys = new Set(existing.map((c) => c.key));
    const defaults = CATEGORY_DEFINITIONS.map((category, index) => ({
      key: category.value,
      label: category.label,
      description: category.description,
      color: category.color,
      type: category.type,
      routeSlug: category.routeSlug,
      subcategories: category.subcategories,
      order: index + 1,
      isActive: true,
      isDefault: true,
    }));
    let added = 0;
    for (const cat of defaults) {
      if (!existingKeys.has(cat.key)) {
        await ctx.db.insert("category_settings", cat);
        added++;
      }
    }
    return { added, total: defaults.length };
  },
});

export const getFooterData = query({
  args: {},
  handler: async (ctx) => {
    const [settings, pages] = await Promise.all([
      ctx.db.query("settings").first(),
      ctx.db.query("pages").withIndex("by_order").order("asc").take(50),
    ]);
    const footerPages = pages.filter(
      (p) => !p.deletedAt && !p.archivedAt && p.status === "published" && p.isVisibleInFooter
    );
    return { settings, footerPages };
  },
});