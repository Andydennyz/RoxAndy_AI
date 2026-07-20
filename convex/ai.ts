/* eslint-disable @typescript-eslint/no-explicit-any */
"use node";
import { action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import OpenAI from "openai";

// Gateway abstraction — add new gateways here by adding a new case
type Message = { role: "user" | "assistant" | "system"; content: string };

type GatewayConfig = {
  baseURL: string;
  apiKeyEnvVar: string;
  defaultModel?: string;
};

const GATEWAY_CONFIGS: Record<string, GatewayConfig> = {
  openrouter: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKeyEnvVar: "OPENROUTER_API_KEY",
  },
  nvidia: {
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKeyEnvVar: "NVIDIA_API_KEY",
  },
};

// Model ID → gateway model string mapping
const MODEL_STRINGS: Record<string, { gateway: string; modelString: string }> = {
  "openrouter-gpt4o": { gateway: "openrouter", modelString: "openai/gpt-4o" },
  "openrouter-gemini-pro": { gateway: "openrouter", modelString: "google/gemini-pro-1.5" },
  "openrouter-deepseek": { gateway: "openrouter", modelString: "deepseek/deepseek-r1" },
  "openrouter-claude": { gateway: "openrouter", modelString: "anthropic/claude-3.5-sonnet" },
  "nvidia-llama3-70b": { gateway: "nvidia", modelString: "meta/llama-3.1-70b-instruct" },
  "nvidia-mistral-7b": { gateway: "nvidia", modelString: "mistralai/mistral-7b-instruct-v0.3" },
  "nvidia-deepseek-r1": { gateway: "nvidia", modelString: "deepseek-ai/deepseek-r1" },
};

async function getStoredApiKey(ctx: any, gatewayConfig: GatewayConfig): Promise<string | undefined> {
  const apiKey = process.env[gatewayConfig.apiKeyEnvVar];
  if (apiKey) return apiKey;

  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return undefined;

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (!user) return undefined;

  if (gatewayConfig.apiKeyEnvVar === "OPENROUTER_API_KEY") {
    return user.openrouterApiKey;
  }
  if (gatewayConfig.apiKeyEnvVar === "NVIDIA_API_KEY") {
    return user.nvidiaApiKey;
  }

  return undefined;
}

async function callGateway(
  ctx: any,
  modelId: string,
  messages: Message[]
): Promise<string> {
  const modelEntry = MODEL_STRINGS[modelId];
  if (!modelEntry) {
    throw new ConvexError({ message: `Unknown model: ${modelId}`, code: "BAD_REQUEST" });
  }

  const gatewayConfig = GATEWAY_CONFIGS[modelEntry.gateway];
  if (!gatewayConfig) {
    throw new ConvexError({ message: `Unknown gateway: ${modelEntry.gateway}`, code: "BAD_REQUEST" });
  }

  const apiKey = await getStoredApiKey(ctx, gatewayConfig);
  if (!apiKey) {
    throw new ConvexError({
      message: `API key not configured for gateway ${modelEntry.gateway}. Please add the ${gatewayConfig.apiKeyEnvVar} secret in the Secrets tab or in your account settings.`,
      code: "BAD_REQUEST",
    });
  }

  const client = new OpenAI({
    baseURL: gatewayConfig.baseURL,
    apiKey,
    defaultHeaders:
      modelEntry.gateway === "openrouter"
        ? {
            "HTTP-Referer": "https://roxandyai.app",
            "X-Title": "RoxAndyAI",
          }
        : undefined,
  });

  const completion = await client.chat.completions.create({
    model: modelEntry.modelString,
    messages,
    max_tokens: 4096,
  });

  return completion.choices[0]?.message?.content ?? "";
}

export const chat = action({
  args: {
    conversationId: v.id("conversations"),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
      })
    ),
    modelId: v.string(),
    assistantMessageId: v.id("messages"),
  },
  handler: async (ctx: any, args: any): Promise<string> => {
    const response = await callGateway(ctx, args.modelId, args.messages);
    return response;
  },
});
