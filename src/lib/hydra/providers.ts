export type Protocol = "openai" | "anthropic" | "google";

export type ProviderDef = {
  id: string;
  name: string;
  protocol: Protocol;
  baseUrl: string;
  envKey: string;
  models: { id: string; label: string }[];
  builtin: boolean;
};

export const BUILTIN_PROVIDERS: ProviderDef[] = [
  {
    id: "xai",
    name: "xAI",
    protocol: "openai",
    baseUrl: "https://api.x.ai/v1",
    envKey: "XAI_API_KEY",
    models: [
      { id: "grok-4.6", label: "Grok 4.6" },
      { id: "grok-4.5", label: "Grok 4.5" },
      { id: "grok-4", label: "Grok 4" },
      { id: "grok-3", label: "Grok 3" },
    ],
    builtin: true,
  },
  {
    id: "openai",
    name: "OpenAI",
    protocol: "openai",
    baseUrl: "https://api.openai.com/v1",
    envKey: "OPENAI_API_KEY",
    models: [
      { id: "gpt-4.1", label: "GPT-4.1" },
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
      { id: "o4-mini", label: "o4-mini" },
    ],
    builtin: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    protocol: "anthropic",
    baseUrl: "https://api.anthropic.com",
    envKey: "ANTHROPIC_API_KEY",
    models: [
      { id: "claude-opus-4-5", label: "Claude Opus 4.5" },
      { id: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
      { id: "claude-sonnet-4", label: "Claude Sonnet 4" },
    ],
    builtin: true,
  },
  {
    id: "google",
    name: "Google",
    protocol: "google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    envKey: "GOOGLE_API_KEY",
    models: [
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    ],
    builtin: true,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    protocol: "openai",
    baseUrl: "https://openrouter.ai/api/v1",
    envKey: "OPENROUTER_API_KEY",
    models: [
      { id: "x-ai/grok-4.6", label: "Grok 4.6 via OR" },
      { id: "anthropic/claude-sonnet-4.5", label: "Sonnet 4.5 via OR" },
      { id: "openai/gpt-4.1", label: "GPT-4.1 via OR" },
      { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro via OR" },
    ],
    builtin: true,
  },
  {
    id: "groq",
    name: "Groq",
    protocol: "openai",
    baseUrl: "https://api.groq.com/openai/v1",
    envKey: "GROQ_API_KEY",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
      { id: "qwen/qwen3-32b", label: "Qwen3 32B" },
    ],
    builtin: true,
  },
  {
    id: "mistral",
    name: "Mistral",
    protocol: "openai",
    baseUrl: "https://api.mistral.ai/v1",
    envKey: "MISTRAL_API_KEY",
    models: [
      { id: "mistral-large-latest", label: "Mistral Large" },
      { id: "mistral-small-latest", label: "Mistral Small" },
    ],
    builtin: true,
  },
  {
    id: "together",
    name: "Together",
    protocol: "openai",
    baseUrl: "https://api.together.xyz/v1",
    envKey: "TOGETHER_API_KEY",
    models: [
      { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", label: "Llama 3.3 70B Turbo" },
      { id: "deepseek-ai/DeepSeek-V3", label: "DeepSeek V3" },
    ],
    builtin: true,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    protocol: "openai",
    baseUrl: "https://api.deepseek.com/v1",
    envKey: "DEEPSEEK_API_KEY",
    models: [
      { id: "deepseek-chat", label: "DeepSeek Chat" },
      { id: "deepseek-reasoner", label: "DeepSeek Reasoner" },
    ],
    builtin: true,
  },
  {
    id: "fireworks",
    name: "Fireworks",
    protocol: "openai",
    baseUrl: "https://api.fireworks.ai/inference/v1",
    envKey: "FIREWORKS_API_KEY",
    models: [
      { id: "accounts/fireworks/models/llama-v3p3-70b-instruct", label: "Llama 3.3 70B" },
      { id: "accounts/fireworks/models/deepseek-v3", label: "DeepSeek V3" },
    ],
    builtin: true,
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    protocol: "openai",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    envKey: "NVIDIA_API_KEY",
    models: [
      { id: "meta/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
      { id: "deepseek-ai/deepseek-v3.1", label: "DeepSeek V3.1" },
    ],
    builtin: true,
  },
  {
    id: "ollama",
    name: "Ollama",
    protocol: "openai",
    baseUrl: "http://127.0.0.1:11434/v1",
    envKey: "",
    models: [
      { id: "llama3.3", label: "llama3.3" },
      { id: "qwen3", label: "qwen3" },
      { id: "deepseek-r1", label: "deepseek-r1" },
    ],
    builtin: true,
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    protocol: "openai",
    baseUrl: "http://127.0.0.1:1234/v1",
    envKey: "",
    models: [{ id: "local-model", label: "Loaded model" }],
    builtin: true,
  },
];

export type ActiveTarget = {
  providerId: string;
  name: string;
  protocol: Protocol;
  baseUrl: string;
  model: string;
  apiKey: string;
  envKey: string;
};

export function envFor(provider: ProviderDef | { envKey: string }) {
  return provider.envKey;
}
