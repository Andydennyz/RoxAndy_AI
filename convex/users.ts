/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

export const updateCurrentUser = mutation({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: identity.name,
        email: identity.email,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name,
      email: identity.email,
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
  },
});

export const updateSettings = mutation({
  args: {
    displayName: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    defaultModel: v.optional(v.string()),
    defaultGateway: v.optional(v.string()),
    openrouterApiKey: v.optional(v.string()),
    nvidiaApiKey: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return null;

    const patch: any = {
      displayName: args.displayName,
      systemPrompt: args.systemPrompt,
      defaultModel: args.defaultModel,
      defaultGateway: args.defaultGateway,
    };
    if (args.openrouterApiKey) {
      patch.openrouterApiKey = args.openrouterApiKey;
    }
    if (args.nvidiaApiKey) {
      patch.nvidiaApiKey = args.nvidiaApiKey;
    }

    await ctx.db.patch(user._id, patch);

    return user._id;
  },
});

// Check which API keys are currently set in environment secrets or user settings
export const checkApiKeyStatus = action({
  args: {},
  handler: async (ctx: any): Promise<{ openrouter: boolean; nvidia: boolean }> => {
    const envStatus = {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      nvidia: !!process.env.NVIDIA_API_KEY,
    };

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return envStatus;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    return {
      openrouter: envStatus.openrouter || !!user?.openrouterApiKey,
      nvidia: envStatus.nvidia || !!user?.nvidiaApiKey,
    };
  },
});
