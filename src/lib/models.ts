// Model registry — add new gateways and models here
export type Gateway = {
  id: string;
  name: string;
  description: string;
};

export type AIModel = {
  id: string;
  name: string;
  description: string;
  gateway: string;
  // The actual model string sent to the gateway API
  modelString: string;
  contextLength?: number;
};

export const GATEWAYS: Gateway[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Access hundreds of models via OpenRouter",
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    description: "NVIDIA's optimized inference platform",
  },
];

export const MODELS: AIModel[] = [
  // OpenRouter models
  {
    id: "openrouter-gpt4o",
    name: "GPT-4o",
    description: "OpenAI's most capable model",
    gateway: "openrouter",
    modelString: "openai/gpt-4o",
    contextLength: 128000,
  },
  {
    id: "openrouter-gemini-pro",
    name: "Gemini 1.5 Pro",
    description: "Google's advanced multimodal model",
    gateway: "openrouter",
    modelString: "google/gemini-pro-1.5",
    contextLength: 1000000,
  },
  {
    id: "openrouter-deepseek",
    name: "DeepSeek R1",
    description: "DeepSeek's powerful reasoning model",
    gateway: "openrouter",
    modelString: "deepseek/deepseek-r1",
    contextLength: 65536,
  },
  {
    id: "openrouter-claude",
    name: "Claude 3.5 Sonnet",
    description: "Anthropic's most intelligent model",
    gateway: "openrouter",
    modelString: "anthropic/claude-3.5-sonnet",
    contextLength: 200000,
  },
  // NVIDIA NIM models
  {
    id: "nvidia-llama3-70b",
    name: "Llama 3.1 70B",
    description: "Meta's powerful open-source model via NVIDIA",
    gateway: "nvidia",
    modelString: "meta/llama-3.1-70b-instruct",
    contextLength: 128000,
  },
  {
    id: "nvidia-mistral-7b",
    name: "Mistral 7B Instruct",
    description: "Efficient and capable open-source model",
    gateway: "nvidia",
    modelString: "mistralai/mistral-7b-instruct-v0.3",
    contextLength: 32768,
  },
  {
    id: "nvidia-deepseek-r1",
    name: "DeepSeek R1 (NVIDIA)",
    description: "DeepSeek's reasoning model via NVIDIA NIM",
    gateway: "nvidia",
    modelString: "deepseek-ai/deepseek-r1",
    contextLength: 65536,
  },
];

export const DEFAULT_MODEL = MODELS[0];
export const DEFAULT_GATEWAY = GATEWAYS[0];

export function getModel(modelId: string): AIModel {
  return MODELS.find((m) => m.id === modelId) ?? DEFAULT_MODEL;
}

export function getGateway(gatewayId: string): Gateway {
  return GATEWAYS.find((g) => g.id === gatewayId) ?? DEFAULT_GATEWAY;
}

export function getModelsByGateway(gatewayId: string): AIModel[] {
  return MODELS.filter((m) => m.gateway === gatewayId);
}
