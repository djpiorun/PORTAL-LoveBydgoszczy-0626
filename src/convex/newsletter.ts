import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) {
      return { success: false, message: "Ten adres email jest już zapisany." };
    }
    await ctx.db.insert("newsletter", {
      email: args.email,
      subscribedAt: Date.now(),
    });
    return { success: true, message: "Dziękujemy za subskrypcję!" };
  },
});
