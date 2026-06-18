import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const getObituaries = query({
  args: {
    paginationOpts: paginationOptsValidator,
    type: v.optional(v.union(v.literal("nekrolog"), v.literal("wspomnienie"), v.literal("pozegnanie"))),
    city: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.searchQuery) {
      return await ctx.db
        .query("obituaries")
        .withSearchIndex("search_name", (q) => {
          let sq = q.search("lastName", args.searchQuery as string).eq("status", "approved");
          if (args.type) {
            sq = sq.eq("type", args.type as "nekrolog" | "wspomnienie" | "pozegnanie");
          }
          return sq;
        })
        .paginate(args.paginationOpts);
    }

    if (args.type) {
      const type = args.type;
      return await ctx.db
        .query("obituaries")
        .withIndex("by_status_and_type", (q) => q.eq("status", "approved").eq("type", type))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("obituaries")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getObituaryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("obituaries")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const submitObituary = mutation({
  args: {
    type: v.union(v.literal("nekrolog"), v.literal("wspomnienie"), v.literal("pozegnanie")),
    firstName: v.string(),
    lastName: v.string(),
    age: v.optional(v.string()),
    image: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    deathDate: v.optional(v.string()),
    city: v.optional(v.string()),
    profession: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    funeralDate: v.optional(v.string()),
    funeralTime: v.optional(v.string()),
    funeralPlace: v.optional(v.string()),
    cemeteryPlace: v.optional(v.string()),
    submitterName: v.optional(v.string()),
    submitterEmail: v.optional(v.string()),
    submitterPhone: v.optional(v.string()),
    submitterRelation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slugBase = [args.firstName, args.lastName].join(" ").trim() || args.title?.trim() || args.type;
    const slug = `${slugBase.toLowerCase()}-${Date.now()}`.replace(/[^a-z0-9-]/g, '-');
    
    return await ctx.db.insert("obituaries", {
      ...args,
      content: args.content?.trim() || "",
      status: "pending",
      createdAt: Date.now(),
      slug,
    });
  },
});

export const getAdminObituaries = query({
  handler: async (ctx) => {
    return await ctx.db.query("obituaries").order("desc").take(100);
  },
});

export const updateObituaryStatus = mutation({
  args: {
    id: v.id("obituaries"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const update: any = { status: args.status };
    if (args.status === "approved") {
      update.publishedAt = Date.now();
    }
    return await ctx.db.patch(args.id, update);
  },
});

export const updateObituary = mutation({
  args: {
    id: v.id("obituaries"),
    type: v.union(v.literal("nekrolog"), v.literal("wspomnienie"), v.literal("pozegnanie")),
    firstName: v.string(),
    lastName: v.string(),
    age: v.optional(v.string()),
    image: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    deathDate: v.optional(v.string()),
    city: v.optional(v.string()),
    profession: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    funeralDate: v.optional(v.string()),
    funeralTime: v.optional(v.string()),
    funeralPlace: v.optional(v.string()),
    cemeteryPlace: v.optional(v.string()),
    submitterName: v.optional(v.string()),
    submitterEmail: v.optional(v.string()),
    submitterPhone: v.optional(v.string()),
    submitterRelation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, {
      ...rest,
      content: rest.content?.trim() || "",
    });
  },
});

export const deleteObituary = mutation({
  args: { id: v.id("obituaries") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
