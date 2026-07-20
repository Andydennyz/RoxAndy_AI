/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

async function requireUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError({ message: "Not authenticated", code: "UNAUTHENTICATED" });

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user) throw new ConvexError({ message: "User not found", code: "NOT_FOUND" });
  return user;
}

export const list = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const get = query({
  args: { id: v.id("conversations") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const conv = await ctx.db.get(args.id);
    if (!conv) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user || conv.userId !== user._id) return null;

    return conv;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    model: v.string(),
    gateway: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requireUser(ctx);
    return await ctx.db.insert("conversations", {
      userId: user._id,
      title: args.title,
      model: args.model,
      gateway: args.gateway,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateTitle = mutation({
  args: { id: v.id("conversations"), title: v.string() },
  handler: async (ctx: any, args: any) => {
    const user = await requireUser(ctx);
    const conv = await ctx.db.get(args.id);
    if (!conv || conv.userId !== user._id) throw new ConvexError({ message: "Not found", code: "NOT_FOUND" });
    await ctx.db.patch(args.id, { title: args.title, updatedAt: new Date().toISOString() });
  },
});

export const updateModel = mutation({
  args: { id: v.id("conversations"), model: v.string(), gateway: v.string() },
  handler: async (ctx: any, args: any) => {
    const user = await requireUser(ctx);
    const conv = await ctx.db.get(args.id);
    if (!conv || conv.userId !== user._id) throw new ConvexError({ message: "Not found", code: "NOT_FOUND" });
    await ctx.db.patch(args.id, { model: args.model, gateway: args.gateway });
  },
});

export const remove = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx: any, args: any) => {
    const user = await requireUser(ctx);
    const conv = await ctx.db.get(args.id);
    if (!conv || conv.userId !== user._id) throw new ConvexError({ message: "Not found", code: "NOT_FOUND" });

    // Delete all messages
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q: any) => q.eq("conversationId", args.id))
      .collect();
    for (const msg of msgs) await ctx.db.delete(msg._id);

    await ctx.db.delete(args.id);
  },
});
