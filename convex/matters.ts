import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
    args: {
        title: v.string(),
        type: v.string(),
        status: v.string(),
        priority: v.string(),
        tags: v.array(v.string()),
        counterparty: v.optional(v.string()),
        internalNotes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }
        const userId = identity.subject;
        return await ctx.db.insert("matters", {
            ...args,
            userId,
        });
    },
});

export const list = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }
        const userId = identity.subject;
        return await ctx.db
            .query("matters")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
    },
});

export const get = query({
    args: { id: v.id("matters") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        const matter = await ctx.db.get(args.id);
        if (!matter || matter.userId !== identity.subject) {
            return null;
        }
        return matter;
    },
});

export const remove = mutation({
    args: { id: v.id("matters") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const matter = await ctx.db.get(args.id);
        if (!matter || matter.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        // 1. Delete associated events
        const events = await ctx.db
            .query("events")
            .withIndex("by_matterId", (q) => q.eq("matterId", args.id))
            .collect();
        for (const event of events) {
            await ctx.db.delete(event._id);
        }

        // 2. Delete associated attachments and their files
        const attachments = await ctx.db
            .query("attachments")
            .withIndex("by_matterId", (q) => q.eq("matterId", args.id))
            .collect();
        for (const attachment of attachments) {
            await ctx.storage.delete(attachment.storageId);
            await ctx.db.delete(attachment._id);
        }

        // 3. Delete associated outbox items
        const outboxItems = await ctx.db
            .query("outbox")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject)) // Outbox is indexed by userId
            .collect();
        // Filter outbox items by matterId in memory since it's not the primary index here
        // (Though in a real production app we might add a by_matterId index to outbox too)
        for (const item of outboxItems) {
            if (item.matterId === args.id) {
                await ctx.db.delete(item._id);
            }
        }

        // 4. Finally delete the matter
        await ctx.db.delete(args.id);
    },
});
