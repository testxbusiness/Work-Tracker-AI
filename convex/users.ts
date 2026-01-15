import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

export const get = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        return await ctx.db
            .query("userSettings")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();
    },
});

export const getInternal = internalQuery({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("userSettings")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
    },
});

export const update = mutation({
    args: {
        workEmail: v.string(),
        autoAI: v.boolean(),
        autoOCR: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const existing = await ctx.db
            .query("userSettings")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, args);
        } else {
            await ctx.db.insert("userSettings", {
                userId: identity.subject,
                ...args,
            });
        }
    },
});
