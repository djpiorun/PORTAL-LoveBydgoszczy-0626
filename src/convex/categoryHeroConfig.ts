import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByCategory = query({
  args: { categoryKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("category_hero_config")
      .withIndex("by_category", (q) => q.eq("categoryKey", args.categoryKey))
      .collect();
  },
});

export const save = mutation({
  args: {
    id: v.optional(v.id("category_hero_config")),
    categoryKey: v.string(),
    itemId: v.string(),
    itemType: v.string(),
    order: v.number(),
    isVisible: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("category_hero_config", data);
  },
});

export const remove = mutation({
  args: { id: v.id("category_hero_config") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const upsertForCategory = mutation({
  args: {
    categoryKey: v.string(),
    itemType: v.string(),
    items: v.array(v.object({
      itemId: v.string(),
      order: v.number(),
      isVisible: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    // Remove existing config for this category+type
    const existing = await ctx.db
      .query("category_hero_config")
      .withIndex("by_category_and_type", (q) =>
        q.eq("categoryKey", args.categoryKey).eq("itemType", args.itemType)
      )
      .collect();
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }
    // Insert new config
    for (const item of args.items) {
      await ctx.db.insert("category_hero_config", {
        categoryKey: args.categoryKey,
        itemType: args.itemType,
        itemId: item.itemId,
        order: item.order,
        isVisible: item.isVisible,
      });
    }
    return { success: true, count: args.items.length };
  },
});
