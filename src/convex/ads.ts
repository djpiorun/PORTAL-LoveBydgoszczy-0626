import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── CAMPAIGNS ───────────────────────────────────────────────────────────────

export const getCampaigns = query({
  handler: async (ctx) => {
    return await ctx.db.query("ad_campaigns").order("desc").take(100);
  },
});

export const createCampaign = mutation({
  args: {
    name: v.string(),
    partnerId: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    budget: v.optional(v.number()),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("planned"),
      v.literal("finished"),
      v.literal("paused"),
      v.literal("archived")
    ),
    priority: v.optional(v.number()),
    viewLimit: v.optional(v.number()),
    clickLimit: v.optional(v.number()),
    placementIds: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ad_campaigns", args);
  },
});

export const updateCampaign = mutation({
  args: {
    id: v.id("ad_campaigns"),
    name: v.optional(v.string()),
    partnerId: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    budget: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("planned"),
      v.literal("finished"),
      v.literal("paused"),
      v.literal("archived")
    )),
    priority: v.optional(v.number()),
    viewLimit: v.optional(v.number()),
    clickLimit: v.optional(v.number()),
    placementIds: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const deleteCampaign = mutation({
  args: { id: v.id("ad_campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// ─── CREATIVES ────────────────────────────────────────────────────────────────

export const getCreatives = query({
  handler: async (ctx) => {
    return await ctx.db.query("ad_creatives").order("desc").take(100);
  },
});

export const createCreative = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    content: v.optional(v.string()),
    targetUrl: v.optional(v.string()),
    campaignId: v.optional(v.id("ad_campaigns")),
    placements: v.optional(v.array(v.string())),
    isActive: v.boolean(),
    desktopImageUrl: v.optional(v.string()),
    mobileImageUrl: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ad_creatives", { ...args, views: 0, clicks: 0 });
  },
});

export const updateCreative = mutation({
  args: {
    id: v.id("ad_creatives"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    content: v.optional(v.string()),
    targetUrl: v.optional(v.string()),
    campaignId: v.optional(v.id("ad_campaigns")),
    placements: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    desktopImageUrl: v.optional(v.string()),
    mobileImageUrl: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const deleteCreative = mutation({
  args: { id: v.id("ad_creatives") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// ─── PARTNERS ─────────────────────────────────────────────────────────────────

export const getPartners = query({
  handler: async (ctx) => {
    return await ctx.db.query("ad_partners").order("desc").take(100);
  },
});

export const createPartner = mutation({
  args: {
    name: v.string(),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    description: v.optional(v.string()),
    cooperationScope: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("prospect"))),
    type: v.optional(v.union(v.literal("strategic"), v.literal("local"), v.literal("media"), v.literal("sponsor"), v.literal("advertiser"))),
    notes: v.optional(v.string()),
    showInSlider: v.optional(v.boolean()),
    sliderOrder: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ad_partners", args);
  },
});

export const updatePartner = mutation({
  args: {
    id: v.id("ad_partners"),
    name: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    description: v.optional(v.string()),
    cooperationScope: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("prospect"))),
    type: v.optional(v.union(v.literal("strategic"), v.literal("local"), v.literal("media"), v.literal("sponsor"), v.literal("advertiser"))),
    notes: v.optional(v.string()),
    showInSlider: v.optional(v.boolean()),
    sliderOrder: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const deletePartner = mutation({
  args: { id: v.id("ad_partners") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// ─── INQUIRIES ────────────────────────────────────────────────────────────────

export const getInquiries = query({
  handler: async (ctx) => {
    return await ctx.db.query("ad_inquiries").order("desc").take(100);
  },
});

export const createInquiry = mutation({
  args: {
    companyName: v.string(),
    contactPerson: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    adType: v.optional(v.string()),
    budget: v.optional(v.string()),
    message: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("in_progress"),
      v.literal("offer_sent"),
      v.literal("finished"),
      v.literal("rejected")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ad_inquiries", { ...args, createdAt: Date.now() });
  },
});

export const updateInquiry = mutation({
  args: {
    id: v.id("ad_inquiries"),
    status: v.optional(v.union(
      v.literal("new"),
      v.literal("in_progress"),
      v.literal("offer_sent"),
      v.literal("finished"),
      v.literal("rejected")
    )),
    notes: v.optional(v.string()),
    partnerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const updateInquiryStatus = mutation({
  args: {
    id: v.id("ad_inquiries"),
    status: v.union(
      v.literal("new"),
      v.literal("in_progress"),
      v.literal("offer_sent"),
      v.literal("finished"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteInquiry = mutation({
  args: { id: v.id("ad_inquiries") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// ─── PLACEMENTS ───────────────────────────────────────────────────────────────

export const getPlacements = query({
  handler: async (ctx) => {
    return await ctx.db.query("ad_placements").order("desc").take(100);
  },
});

export const createPlacement = mutation({
  args: {
    name: v.string(),
    systemName: v.optional(v.string()),
    description: v.optional(v.string()),
    dimensions: v.optional(v.string()),
    maxAds: v.optional(v.number()),
    type: v.optional(v.string()),
    location: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    rotationEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ad_placements", args);
  },
});

export const updatePlacement = mutation({
  args: {
    id: v.id("ad_placements"),
    name: v.optional(v.string()),
    systemName: v.optional(v.string()),
    description: v.optional(v.string()),
    dimensions: v.optional(v.string()),
    maxAds: v.optional(v.number()),
    type: v.optional(v.string()),
    location: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    rotationEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const deletePlacement = mutation({
  args: { id: v.id("ad_placements") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

export const getDashboardStats = query({
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("ad_campaigns").take(100);
    const creatives = await ctx.db.query("ad_creatives").take(100);
    const partners = await ctx.db.query("ad_partners").take(100);
    const placements = await ctx.db.query("ad_placements").take(100);

    const activeCampaigns = campaigns.filter(c => c.status === "active").length;
    const plannedCampaigns = campaigns.filter(c => c.status === "planned").length;
    const activeCreatives = creatives.filter(c => c.isActive).length;
    const activePartners = partners.filter(p => p.status === "active").length;
    const totalViews = creatives.reduce((sum, c) => sum + (c.views || 0), 0);
    const totalClicks = creatives.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.0";
    const estimatedRevenue = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);

    const topCampaigns = campaigns
      .map(c => {
        const campaignCreatives = creatives.filter(cr => cr.campaignId === c._id);
        const views = campaignCreatives.reduce((sum, cr) => sum + (cr.views || 0), 0);
        const clicks = campaignCreatives.reduce((sum, cr) => sum + (cr.clicks || 0), 0);
        const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";
        const partner = partners.find(p => p._id === c.partnerId);
        return { ...c, views, clicks, ctr, partnerName: partner?.name || "Nieznany" };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const endingSoon = campaigns
      .filter(c => c.status === "active" && c.endDate > Date.now())
      .sort((a, b) => a.endDate - b.endDate)
      .slice(0, 5)
      .map(c => ({
        ...c,
        daysLeft: Math.ceil((c.endDate - Date.now()) / (1000 * 60 * 60 * 24))
      }));

    const placementOccupancy = placements.map(p => {
      const assignedCreatives = creatives.filter(c => c.placements?.includes(p._id));
      return {
        ...p,
        used: assignedCreatives.length,
        available: Math.max(0, (p.maxAds || 1) - assignedCreatives.length),
      };
    });

    return {
      activeCampaigns,
      plannedCampaigns,
      activeCreatives,
      activePartners,
      totalViews,
      totalClicks,
      avgCtr,
      estimatedRevenue,
      topCampaigns,
      endingSoon,
      placementOccupancy,
    };
  }
});

// ─── GRAPHICS ─────────────────────────────────────────────────────────────────

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveGraphic = mutation({
  args: {
    name: v.string(),
    size: v.number(),
    type: v.string(),
    storageId: v.id("_storage"),
    campaignId: v.optional(v.string()),
    partnerId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("File not found");

    return await ctx.db.insert("ad_graphics", {
      name: args.name,
      size: args.size,
      type: args.type,
      storageId: args.storageId,
      url,
      createdAt: Date.now(),
      campaignId: args.campaignId,
      partnerId: args.partnerId,
      tags: args.tags,
    });
  },
});

export const getGraphics = query({
  handler: async (ctx) => {
    return await ctx.db.query("ad_graphics").order("desc").take(100);
  },
});

export const deleteGraphic = mutation({
  args: { id: v.id("ad_graphics"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.id);
  },
});

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

export const getSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("ad_settings").first();
    if (!settings) {
      return {
        isModuleEnabled: true,
        autoRotation: true,
        notificationEmail: "reklama@lovebydgoszcz.pl",
        defaultAdSizes: ["1140x200", "300x250", "728x90", "320x50"],
        adTypes: ["banner", "sponsored_article", "popup", "slider", "text", "html"],
        maxEmissionsPerDay: 0,
      };
    }
    return settings;
  },
});

export const updateSettings = mutation({
  args: {
    isModuleEnabled: v.boolean(),
    autoRotation: v.boolean(),
    notificationEmail: v.string(),
    defaultAdSizes: v.optional(v.array(v.string())),
    adTypes: v.optional(v.array(v.string())),
    maxEmissionsPerDay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("ad_settings").first();
    if (settings) {
      return await ctx.db.patch(settings._id, args);
    } else {
      return await ctx.db.insert("ad_settings", args);
    }
  },
});

// ─── PRICING ──────────────────────────────────────────────────────────────────

export const getPricing = query({
  handler: async (ctx) => {
    return await ctx.db.query("ad_pricing").order("desc").take(100);
  },
});

export const createPricing = mutation({
  args: {
    name: v.string(),
    price: v.string(),
    unit: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    isPromotion: v.optional(v.boolean()),
    validUntil: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ad_pricing", args);
  },
});

export const updatePricing = mutation({
  args: {
    id: v.id("ad_pricing"),
    name: v.optional(v.string()),
    price: v.optional(v.string()),
    unit: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    isPromotion: v.optional(v.boolean()),
    validUntil: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const deletePricing = mutation({
  args: { id: v.id("ad_pricing") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// ─── SEED ─────────────────────────────────────────────────────────────────────

export const seedAds = mutation({
  handler: async (ctx) => {
    const partner1 = await ctx.db.insert("ad_partners", {
      name: "Kino Helios",
      website: "https://helios.pl",
      contactEmail: "reklama@helios.pl",
      contactPhone: "123 456 789",
      contactPerson: "Anna Kowalska",
      description: "Sieć kin w Polsce",
      status: "active",
      type: "advertiser",
      showInSlider: true,
      sliderOrder: 1,
    });

    const partner2 = await ctx.db.insert("ad_partners", {
      name: "Restauracja Sowa",
      website: "https://sowa.pl",
      contactEmail: "kontakt@sowa.pl",
      contactPhone: "987 654 321",
      contactPerson: "Jan Nowak",
      status: "active",
      type: "local",
      showInSlider: true,
      sliderOrder: 2,
    });

    const partner3 = await ctx.db.insert("ad_partners", {
      name: "Urząd Miasta Bydgoszcz",
      website: "https://bydgoszcz.pl",
      contactEmail: "media@bydgoszcz.pl",
      status: "active",
      type: "strategic",
      showInSlider: true,
      sliderOrder: 0,
    });

    const placement1 = await ctx.db.insert("ad_placements", {
      name: "Strona Główna - Top Banner",
      systemName: "home_top_banner",
      dimensions: "1140x200",
      maxAds: 3,
      description: "Główny baner na górze strony",
      type: "banner",
      location: "Strona główna",
      isActive: true,
      rotationEnabled: true,
    });

    const placement2 = await ctx.db.insert("ad_placements", {
      name: "Pasek Boczny - Kwadrat",
      systemName: "sidebar_square",
      dimensions: "300x250",
      maxAds: 5,
      type: "banner",
      location: "Sidebar",
      isActive: true,
      rotationEnabled: true,
    });

    await ctx.db.insert("ad_placements", {
      name: "Pod artykułem",
      systemName: "below_article",
      dimensions: "728x90",
      maxAds: 2,
      type: "banner",
      location: "Strona artykułu",
      isActive: true,
      rotationEnabled: false,
    });

    const campaign1 = await ctx.db.insert("ad_campaigns", {
      name: "Wiosenna Promocja Kina",
      partnerId: partner1,
      description: "Kampania promująca wiosenne premiery filmowe",
      startDate: Date.now() - 1000 * 60 * 60 * 24 * 5,
      endDate: Date.now() + 1000 * 60 * 60 * 24 * 10,
      budget: 1500,
      status: "active",
      priority: 1,
    });

    const campaign2 = await ctx.db.insert("ad_campaigns", {
      name: "Nowe Menu Sowa",
      partnerId: partner2,
      description: "Promocja nowego menu wiosennego",
      startDate: Date.now() + 1000 * 60 * 60 * 24 * 2,
      endDate: Date.now() + 1000 * 60 * 60 * 24 * 30,
      budget: 800,
      status: "planned",
      priority: 2,
    });

    await ctx.db.insert("ad_campaigns", {
      name: "Bydgoszcz - Miasto Możliwości",
      partnerId: partner3,
      description: "Kampania promocyjna miasta",
      startDate: Date.now() - 1000 * 60 * 60 * 24 * 30,
      endDate: Date.now() + 1000 * 60 * 60 * 24 * 60,
      budget: 5000,
      status: "active",
      priority: 0,
    });

    await ctx.db.insert("ad_creatives", {
      name: "Baner Helios Wiosna",
      type: "banner",
      targetUrl: "https://helios.pl/wiosna",
      campaignId: campaign1,
      placements: [placement1],
      views: 12500,
      clicks: 340,
      isActive: true,
    });

    await ctx.db.insert("ad_creatives", {
      name: "Artykuł Sponsorowany - Premiery",
      type: "sponsored_article",
      targetUrl: "/artykul/premiery-wiosna",
      campaignId: campaign1,
      views: 5000,
      clicks: 120,
      isActive: true,
    });

    await ctx.db.insert("ad_creatives", {
      name: "Kwadrat Sowa",
      type: "banner",
      targetUrl: "https://sowa.pl/menu",
      campaignId: campaign2,
      placements: [placement2],
      views: 0,
      clicks: 0,
      isActive: false,
    });

    await ctx.db.insert("ad_inquiries", {
      companyName: "Lokalny Browar",
      contactPerson: "Marek Piwny",
      email: "kontakt@browar.bydgoszcz.pl",
      phone: "555 444 333",
      adType: "banner",
      budget: "2000 PLN",
      message: "Dzień dobry, jesteśmy zainteresowani reklamą na stronie głównej przez miesiąc.",
      status: "new",
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
    });

    await ctx.db.insert("ad_inquiries", {
      companyName: "Sklep Sportowy",
      contactPerson: "Tomasz Biegacz",
      email: "sklep@sport.pl",
      adType: "sponsored_article",
      message: "Proszę o wycenę artykułu sponsorowanego o nowej kolekcji rowerów.",
      status: "in_progress",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    });

    await ctx.db.insert("ad_inquiries", {
      companyName: "Hotel Brda",
      contactPerson: "Katarzyna Hotelowa",
      email: "marketing@hotelbrda.pl",
      phone: "52 123 456",
      adType: "banner",
      budget: "3000 PLN",
      message: "Interesuje nas długoterminowa współpraca reklamowa.",
      status: "offer_sent",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    });

    await ctx.db.insert("ad_pricing", {
      name: "Artykuł sponsorowany",
      price: "500 zł",
      unit: "za publikację",
      description: "Publikacja na stronie głównej przez 7 dni",
      category: "content",
    });

    await ctx.db.insert("ad_pricing", {
      name: "Baner Główny (Top)",
      price: "1200 zł",
      unit: "za miesiąc",
      description: "Rotacja max 3 reklamy, wymiary 1140x200",
      category: "banner",
    });

    await ctx.db.insert("ad_pricing", {
      name: "Baner Boczny (Kwadrat)",
      price: "800 zł",
      unit: "za miesiąc",
      description: "Rotacja max 5 reklam, wymiary 300x250",
      category: "banner",
    });

    await ctx.db.insert("ad_pricing", {
      name: "Pakiet Premium",
      price: "2500 zł",
      unit: "za miesiąc",
      description: "Artykuł + Baner Główny + Post FB",
      category: "package",
    });

    await ctx.db.insert("ad_pricing", {
      name: "Logotyp w stopce",
      price: "300 zł",
      unit: "za miesiąc",
      description: "Logotyp partnera w stopce portalu",
      category: "logo",
    });
  }
});

export const createPortalDemoAds = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const placements = await ctx.db.query("ad_placements").take(100);
    const creatives = await ctx.db.query("ad_creatives").take(200);
    const partners = await ctx.db.query("ad_partners").take(100);
    const campaigns = await ctx.db.query("ad_campaigns").take(100);

    const ensurePlacement = async (systemName: string, data: {
      name: string;
      dimensions: string;
      description: string;
      type: string;
      location: string;
      maxAds: number;
    }) => {
      const existing = placements.find((placement) => placement.systemName === systemName);
      if (existing) return existing._id;
      return await ctx.db.insert("ad_placements", {
        systemName,
        name: data.name,
        dimensions: data.dimensions,
        description: data.description,
        type: data.type,
        location: data.location,
        maxAds: data.maxAds,
        isActive: true,
        rotationEnabled: true,
      });
    };

    const homeTopPlacement = await ensurePlacement("home_top_banner", {
      name: "Strona Główna - Top Banner",
      dimensions: "1140x200",
      description: "Duży baner pod nawigacją na stronie głównej",
      type: "banner",
      location: "Strona główna",
      maxAds: 3,
    });
    const sidebarPlacement = await ensurePlacement("sidebar_square", {
      name: "Sidebar - Square",
      dimensions: "300x250",
      description: "Kwadratowa reklama w prawym sidebarze",
      type: "banner",
      location: "Sidebar",
      maxAds: 5,
    });
    const articlePlacement = await ensurePlacement("below_article", {
      name: "Pod artykułem",
      dimensions: "728x90",
      description: "Emisja reklamy pomiędzy treścią a stopką autora",
      type: "banner",
      location: "Artykuł",
      maxAds: 2,
    });

    const ensurePartner = async (name: string, data: {
      website: string;
      logoUrl: string;
      contactEmail?: string;
      description?: string;
      type: "local" | "strategic" | "media" | "sponsor" | "advertiser";
      sliderOrder: number;
    }) => {
      const existing = partners.find((partner) => partner.name === name);
      if (existing) {
        await ctx.db.patch(existing._id, {
          website: data.website,
          logoUrl: data.logoUrl,
          contactEmail: data.contactEmail,
          description: data.description,
          status: "active",
          showInSlider: true,
          sliderOrder: data.sliderOrder,
          type: data.type,
        });
        return existing._id;
      }
      return await ctx.db.insert("ad_partners", {
        name,
        website: data.website,
        logoUrl: data.logoUrl,
        contactEmail: data.contactEmail,
        description: data.description,
        status: "active",
        showInSlider: true,
        sliderOrder: data.sliderOrder,
        type: data.type,
      });
    };

    const partnerIds = {
      helios: await ensurePartner("Kino Helios", {
        website: "https://helios.pl",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Helios_logo.svg/320px-Helios_logo.svg.png",
        contactEmail: "reklama@helios.pl",
        description: "Premiery filmowe i wydarzenia specjalne.",
        type: "advertiser",
        sliderOrder: 1,
      }),
      sowa: await ensurePartner("Restauracja Sowa", {
        website: "https://sowa.pl",
        logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=420&q=80",
        contactEmail: "kontakt@sowa.pl",
        description: "Kuchnia, spotkania i sezonowe menu.",
        type: "local",
        sliderOrder: 2,
      }),
      opera: await ensurePartner("Opera Nova", {
        website: "https://operanova.pl",
        logoUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=420&q=80",
        contactEmail: "partnerzy@operanova.pl",
        description: "Wydarzenia kulturalne i premiery sezonu.",
        type: "strategic",
        sliderOrder: 0,
      }),
    };

    const ensureCampaign = async (name: string, partnerId: any, priority: number) => {
      const existing = campaigns.find((campaign) => campaign.name === name);
      if (existing) {
        await ctx.db.patch(existing._id, {
          partnerId,
          status: "active",
          startDate: now - 1000 * 60 * 60 * 24,
          endDate: now + 1000 * 60 * 60 * 24 * 60,
          priority,
        });
        return existing._id;
      }
      return await ctx.db.insert("ad_campaigns", {
        name,
        partnerId,
        description: "Kampania demonstracyjna widoczna w publicznym portalu.",
        startDate: now - 1000 * 60 * 60 * 24,
        endDate: now + 1000 * 60 * 60 * 24 * 60,
        budget: 0,
        status: "active",
        priority,
      });
    };

    const campaignIds = {
      helios: await ensureCampaign("Demo - Helios Top Banner", partnerIds.helios, 0),
      sowa: await ensureCampaign("Demo - Sowa Sidebar", partnerIds.sowa, 1),
      opera: await ensureCampaign("Demo - Opera Artykul", partnerIds.opera, 2),
    };

    const demoCreatives = [
      {
        name: "Demo Top Banner - Helios",
        type: "banner",
        campaignId: campaignIds.helios,
        placements: [homeTopPlacement],
        targetUrl: "https://helios.pl",
        desktopImageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80",
        mobileImageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
        content: "Premiery tygodnia i seanse specjalne w Bydgoszczy",
        tags: ["demo_public_ad", "home_top_banner"],
      },
      {
        name: "Demo Sidebar - Restauracja Sowa",
        type: "banner",
        campaignId: campaignIds.sowa,
        placements: [sidebarPlacement],
        targetUrl: "https://sowa.pl",
        desktopImageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
        mobileImageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
        content: "Kolacje, śniadania i spotkania w centrum miasta",
        tags: ["demo_public_ad", "sidebar_square"],
      },
      {
        name: "Demo Pod Artykulem - Opera Nova",
        type: "banner",
        campaignId: campaignIds.opera,
        placements: [articlePlacement],
        targetUrl: "https://operanova.pl",
        desktopImageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1400&q=80",
        mobileImageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80",
        content: "Repertuar i wydarzenia sezonu",
        tags: ["demo_public_ad", "below_article"],
      },
    ];

    let created = 0;
    let updated = 0;

    for (const demoCreative of demoCreatives) {
      const existing = creatives.find((creative) => creative.name === demoCreative.name);
      if (existing) {
        await ctx.db.patch(existing._id, {
          type: demoCreative.type,
          campaignId: demoCreative.campaignId,
          placements: demoCreative.placements,
          targetUrl: demoCreative.targetUrl,
          desktopImageUrl: demoCreative.desktopImageUrl,
          mobileImageUrl: demoCreative.mobileImageUrl,
          content: demoCreative.content,
          tags: demoCreative.tags,
          isActive: true,
          startDate: now - 1000 * 60 * 60,
          endDate: now + 1000 * 60 * 60 * 24 * 60,
        });
        updated += 1;
      } else {
        await ctx.db.insert("ad_creatives", {
          ...demoCreative,
          isActive: true,
          startDate: now - 1000 * 60 * 60,
          endDate: now + 1000 * 60 * 60 * 24 * 60,
          views: 0,
          clicks: 0,
        });
        created += 1;
      }
    }

    return { created, updated };
  },
});

// ─── AD SERVING ───────────────────────────────────────────────────────────────

export const getAdsByPlacement = query({
  args: { placementSystemName: v.string() },
  handler: async (ctx, args) => {
    // Use index for O(1) placement lookup
    const placement = await ctx.db
      .query("ad_placements")
      .withIndex("by_systemName", q => q.eq("systemName", args.placementSystemName))
      .first();
    if (!placement || !placement.isActive) return [];

    const now = Date.now();

    // Get only active creatives - limit scan
    const allCreatives = await ctx.db.query("ad_creatives").take(50);
    const eligible = allCreatives.filter(c => {
      if (!c.isActive) return false;
      if (!c.placements?.includes(placement._id)) return false;
      if (c.startDate && c.startDate > now) return false;
      if (c.endDate && c.endDate < now) return false;
      return true;
    });

    // Batch campaign lookups instead of N+1
    const campaignIds = [...new Set(eligible.map(c => c.campaignId).filter(Boolean))];
    const campaignMap = new Map<string, any>();
    for (const cid of campaignIds) {
      const campaign = await ctx.db.get(cid as any);
      if (campaign) campaignMap.set(cid as string, campaign);
    }

    const result = eligible.filter(creative => {
      if (!creative.campaignId) return true;
      const campaign = campaignMap.get(creative.campaignId as string);
      if (!campaign || campaign.status !== "active") return false;
      if (campaign.endDate < now) return false;
      if (campaign.startDate > now) return false;
      return true;
    });

    return result.slice(0, placement.maxAds || 5);
  },
});

export const trackImpression = mutation({
  args: { creativeId: v.id("ad_creatives") },
  handler: async (ctx, args) => {
    const creative = await ctx.db.get(args.creativeId);
    if (!creative) return;
    await ctx.db.patch(args.creativeId, { views: (creative.views || 0) + 1 });
  },
});

export const trackClick = mutation({
  args: { creativeId: v.id("ad_creatives") },
  handler: async (ctx, args) => {
    const creative = await ctx.db.get(args.creativeId);
    if (!creative) return;
    await ctx.db.patch(args.creativeId, { clicks: (creative.clicks || 0) + 1 });
  },
});

export const getPartnerLogos = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const partners = await ctx.db.query("ad_partners").take(args.limit || 20);
    return partners.filter(p => p.showInSlider && p.status === "active")
      .sort((a, b) => (a.sliderOrder || 99) - (b.sliderOrder || 99));
  },
});