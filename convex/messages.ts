/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q: any) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

export const add = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      status: args.status,
    });
  },
});

export const updateContent = mutation({
  args: { id: v.id("messages"), content: v.string(), status: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.id, { content: args.content, status: args.status });
  },
});

export const remove = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx: any, args: any) => {
    await ctx.db.delete(args.id);
  },
});
