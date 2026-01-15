import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  matters: defineTable({
    userId: v.string(),
    title: v.string(),
    type: v.string(), // e.g., "dispute", "legal", "personal"
    status: v.string(), // "active", "closed", "on-hold"
    priority: v.string(), // "low", "medium", "high"
    tags: v.array(v.string()),
    counterparty: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  events: defineTable({
    userId: v.string(),
    matterId: v.id("matters"),
    type: v.string(), // "meeting", "call", "note", "task", "email", "doc_sent"
    content: v.string(),
    participants: v.optional(v.array(v.string())),
    aiStatus: v.string(), // "pending", "processing", "done", "failed"
    aiResults: v.optional(v.object({
      minutes: v.optional(v.string()),
      summary: v.optional(v.string()),
      actionItems: v.optional(v.array(v.string())),
      emailDraft: v.optional(v.object({
        subject: v.string(),
        body: v.string(),
        to: v.optional(v.string()),
      })),
    })),
    timestamp: v.number(), // Date.now()
    emailSent: v.optional(v.boolean()),
  }).index("by_matterId", ["matterId"]),

  attachments: defineTable({
    userId: v.string(),
    matterId: v.id("matters"),
    eventId: v.optional(v.id("events")),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(), // mime type
    extractedText: v.optional(v.string()),
  })
    .index("by_matterId", ["matterId"])
    .index("by_storageId", ["storageId"]),

  outbox: defineTable({
    userId: v.string(),
    matterId: v.id("matters"),
    subject: v.string(),
    body: v.string(),
    to: v.string(),
    status: v.string(), // "draft", "queued", "sent", "failed"
    error: v.optional(v.string()),
    providerMessageId: v.optional(v.string()),
    sentAt: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  userSettings: defineTable({
    userId: v.string(),
    workEmail: v.string(),
    autoAI: v.boolean(),
    autoOCR: v.boolean(),
    googleRefreshToken: v.optional(v.union(v.string(), v.null())),
    googleAccessToken: v.optional(v.union(v.string(), v.null())),
    googleTokenExpiresAt: v.optional(v.union(v.number(), v.null())),
  }).index("by_userId", ["userId"]),
});
