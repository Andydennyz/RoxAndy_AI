import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    // User settings
    displayName: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    defaultModel: v.optional(v.string()),
    defaultGateway: v.optional(v.string()),
    openrouterApiKey: v.optional(v.string()),
    nvidiaApiKey: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    model: v.string(),
    gateway: v.string(),
    updatedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    status: v.optional(v.string()),
  }).index("by_conversation", ["conversationId"]),
});
