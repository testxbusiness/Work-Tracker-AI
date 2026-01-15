import { v } from "convex/values";
import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";

export const create = mutation({
    args: {
        matterId: v.id("matters"),
        type: v.string(),
        content: v.string(),
        participants: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }
        const userId = identity.subject;
        const matter = await ctx.db.get(args.matterId);
        if (!matter || matter.userId !== userId) {
            throw new Error("Unauthorized");
        }
        return await ctx.db.insert("events", {
            ...args,
            userId,
            aiStatus: "pending",
            timestamp: Date.now(),
        });
    },
});

export const listByMatter = query({
    args: { matterId: v.id("matters") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }
        const userId = identity.subject;
        const matter = await ctx.db.get(args.matterId);
        if (!matter || matter.userId !== userId) {
            return [];
        }
        return await ctx.db
            .query("events")
            .withIndex("by_matterId", (q) => q.eq("matterId", args.matterId))
            .order("desc")
            .collect();
    },
});

export const updateAIStatus = internalMutation({
    args: {
        id: v.id("events"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { aiStatus: args.status });
    },
});

export const updateAIResults = internalMutation({
    args: {
        id: v.id("events"),
        results: v.object({
            minutes: v.optional(v.string()),
            summary: v.optional(v.string()),
            actionItems: v.optional(v.array(v.string())),
            emailDraft: v.optional(v.object({
                subject: v.string(),
                body: v.string(),
                to: v.optional(v.string()),
            })),
        }),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            aiResults: args.results,
            aiStatus: "done",
        });
    },
});
export const getInternal = internalQuery({
    args: { id: v.id("events") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const remove = mutation({
    args: { id: v.id("events") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const event = await ctx.db.get(args.id);
        if (!event || event.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        // Dissociate attachments
        const attachments = await ctx.db
            .query("attachments")
            .withIndex("by_matterId", (q) => q.eq("matterId", event.matterId))
            .collect();

        for (const attachment of attachments) {
            if (attachment.eventId === args.id) {
                await ctx.db.patch(attachment._id, { eventId: undefined });
            }
        }

        await ctx.db.delete(args.id);
    },
});

export const update = mutation({
    args: {
        id: v.id("events"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const event = await ctx.db.get(args.id);
        if (!event || event.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        // If content changes, we reset AI status so it can be re-run if needed
        // or just update it. Let's just update and keep AI status.
        await ctx.db.patch(args.id, {
            content: args.content,
            // Optional: reset AI if the user wants fresh analysis
            aiStatus: "pending"
        });
    },
});

export const markEmailSent = mutation({
    args: { id: v.id("events") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const event = await ctx.db.get(args.id);
        if (!event || event.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, { emailSent: true });
    },
});
