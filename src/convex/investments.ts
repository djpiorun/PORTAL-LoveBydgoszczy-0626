import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const investments = await ctx.db
      .query("investments")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return investments;
  },
});

export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const investment = await ctx.db
      .query("investments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return investment;
  },
});

export const byStatus = query({
  args: { status: v.union(
    v.literal("planowana"),
    v.literal("w_trakcie"),
    v.literal("zakonczona"),
    v.literal("wstrzymana"),
  ) },
  handler: async (ctx, args) => {
    const investments = await ctx.db
      .query("investments")
      .withIndex("by_status", (q) => q.eq("projectStatus", args.status))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return investments;
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchTerm || args.searchTerm.length < 2) {
      return [];
    }

    const results = await ctx.db
      .query("investments")
      .withSearchIndex("search_name", (q) => q.search("projectName", args.searchTerm))
      .take(20);

    return results;
  },
});

export const save = mutation({
  args: {
    id: v.optional(v.id("investments")),
    projectName: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    projectStatus: v.union(
      v.literal("planowana"),
      v.literal("w_trakcie"),
      v.literal("zakonczona"),
      v.literal("wstrzymana"),
    ),
    location: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    budget: v.optional(v.string()),
    contractor: v.optional(v.string()),
    investor: v.optional(v.string()),
    progressPercent: v.optional(v.number()),
    mainImageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("investments", data);
  },
});

export const remove = mutation({
  args: { id: v.id("investments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seedInvestments = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("investments").take(1);
    if (existing.length > 0) return { skipped: true, message: "Investments already seeded" };

    const investments = [
      {
        projectName: "Przebudowa ul. Fordońskiej",
        slug: "przebudowa-ul-fordonskiej",
        description: "Kompleksowa przebudowa ulicy Fordońskiej wraz z infrastrukturą towarzyszącą, ścieżkami rowerowymi i oświetleniem LED.",
        projectStatus: "w_trakcie" as const,
        location: "ul. Fordońska, Bydgoszcz",
        startDate: "2024-03-01",
        endDate: "2025-06-30",
        budget: "45 mln zł",
        contractor: "Budimex S.A.",
        investor: "Miasto Bydgoszcz",
        progressPercent: 42,
        isActive: true,
      },
      {
        projectName: "Nowa linia tramwajowa na Fordon",
        slug: "nowa-linia-tramwajowa-fordon",
        description: "Budowa nowej linii tramwajowej łączącej centrum miasta z dzielnicą Fordon. Projekt obejmuje 8 km nowych torów i 12 przystanków.",
        projectStatus: "planowana" as const,
        location: "Trasa: Centrum – Fordon",
        startDate: "2025-09-01",
        endDate: "2028-12-31",
        budget: "320 mln zł",
        contractor: "W trakcie przetargu",
        investor: "Miasto Bydgoszcz / UE",
        progressPercent: 8,
        isActive: true,
      },
      {
        projectName: "Rewitalizacja Starego Rynku",
        slug: "rewitalizacja-starego-rynku",
        description: "Kompleksowa rewitalizacja Starego Rynku i przyległych ulic. Nowa nawierzchnia, zieleń miejska, fontanna i oświetlenie.",
        projectStatus: "zakonczona" as const,
        location: "Stary Rynek, Bydgoszcz",
        startDate: "2022-04-01",
        endDate: "2023-11-30",
        budget: "18 mln zł",
        contractor: "Strabag Sp. z o.o.",
        investor: "Miasto Bydgoszcz",
        progressPercent: 100,
        isActive: true,
      },
      {
        projectName: "Budowa Centrum Przesiadkowego Bydgoszcz Główna",
        slug: "centrum-przesiadkowe-bydgoszcz-glowna",
        description: "Modernizacja węzła komunikacyjnego przy dworcu głównym. Integracja kolei, tramwajów, autobusów i rowerów miejskich.",
        projectStatus: "w_trakcie" as const,
        location: "Dworzec Bydgoszcz Główna",
        startDate: "2023-10-01",
        endDate: "2026-03-31",
        budget: "85 mln zł",
        contractor: "Konsorcjum Mota-Engil / Torpol",
        investor: "PKP / Miasto Bydgoszcz / UE",
        progressPercent: 65,
        isActive: true,
      },
      {
        projectName: "Rozbudowa Szpitala Miejskiego",
        slug: "rozbudowa-szpitala-miejskiego",
        description: "Budowa nowego skrzydła szpitala miejskiego z oddziałem kardiologicznym i centrum diagnostycznym.",
        projectStatus: "planowana" as const,
        location: "ul. Szpitalna 19, Bydgoszcz",
        startDate: "2026-01-01",
        endDate: "2029-06-30",
        budget: "120 mln zł",
        contractor: "W trakcie przetargu",
        investor: "Miasto Bydgoszcz / NFZ",
        progressPercent: 5,
        isActive: true,
      },
    ];

    for (const investment of investments) {
      await ctx.db.insert("investments", investment);
    }

    return { success: true, count: investments.length };
  },
});