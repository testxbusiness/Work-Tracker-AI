import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";

export const getInternal = internalQuery({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("attachments")
            .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
            .unique();
    },
});

export const saveAttachment = mutation({
    args: {
        matterId: v.id("matters"),
        eventId: v.optional(v.id("events")),
        storageId: v.id("_storage"),
        fileName: v.string(),
        fileType: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const matter = await ctx.db.get(args.matterId);
        if (!matter || matter.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        if (args.eventId) {
            const event = await ctx.db.get(args.eventId);
            if (!event || event.matterId !== args.matterId || event.userId !== identity.subject) {
                throw new Error("Unauthorized: Event does not belong to this matter or user");
            }
        }

        return await ctx.db.insert("attachments", {
            ...args,
            userId: identity.subject,
        });
    },
});

export const listByMatter = query({
    args: { matterId: v.id("matters") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const matter = await ctx.db.get(args.matterId);
        if (!matter || matter.userId !== identity.subject) {
            return [];
        }

        return await ctx.db
            .query("attachments")
            .withIndex("by_matterId", (q) => q.eq("matterId", args.matterId))
            .collect();
    },
});

export const getUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        // Verify that this attachment belongs to the user
        const attachment = await ctx.db
            .query("attachments")
            .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
            .unique();

        if (!attachment || attachment.userId !== identity.subject) {
            return null;
        }

        return await ctx.storage.getUrl(args.storageId);
    },
});
