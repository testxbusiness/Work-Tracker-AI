import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

export const getInternal = internalQuery({
    args: { id: v.id("outbox") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const list = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        return await ctx.db
            .query("outbox")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();
    },
});

export const updateStatus = internalMutation({
    args: {
        id: v.id("outbox"),
        status: v.string(),
        error: v.optional(v.string()),
        providerMessageId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
            sentAt: updates.status === "sent" ? Date.now() : undefined,
        });
    },
});

export const create = mutation({
    args: {
        matterId: v.id("matters"),
        subject: v.string(),
        body: v.string(),
        to: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        // Verify matter ownership
        const matter = await ctx.db.get(args.matterId);
        if (!matter || matter.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        return await ctx.db.insert("outbox", {
            matterId: args.matterId,
            subject: args.subject,
            body: args.body,
            to: args.to,
            userId: identity.subject,
            status: "queued",
        });
    },
});
