import {
  CLAUDE_DEFAULT_MODEL,
  GEMINI_DEFAULT_MODEL,
  OPENAI_DEFAULT_MODEL,
  OPENROUTER_API_KEY,
  RESEARCH_DEFAULT_MODEL,
  SYNTHESIS_DEFAULT_MODEL,
} from "../../config.js";
import { ChatGPTClient } from "./ChatGPTClient.js";
import { ClaudeClient } from "./ClaudeClient.js";
import { GeminiClient } from "./GeminiClient.js";
import { LLMClient } from "./LLMClient.js";
import {
  LLMProvider,
  getProviderFromModel,
  normalizeModelId,
} from "./LLMProvider.js";
import { OpenRouterLLMClient } from "./OpenRouterLLMClient.js";

/**
 * Creates an LLM client for the specified model
 * @param model The model to use (can include provider prefix)
 * @returns A new LLM client
 */
export function createLLMClient(model: string): LLMClient {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const provider = getProviderFromModel(model);
  const normalizedModel = normalizeModelId(model);

  switch (provider) {
    case LLMProvider.OPENAI:
      return new ChatGPTClient(OPENROUTER_API_KEY, normalizedModel);
    case LLMProvider.GOOGLE:
      return new GeminiClient(OPENROUTER_API_KEY, normalizedModel);
    case LLMProvider.ANTHROPIC:
      return new ClaudeClient(OPENROUTER_API_KEY, normalizedModel);
    default:
      return new OpenRouterLLMClient(OPENROUTER_API_KEY, model);
  }
}

/**
 * Creates a research LLM client
 * @param model Optional model to use (defaults to config value)
 * @returns A new LLM client
 */
export function createResearchLLMClient(model?: string): LLMClient {
  return createLLMClient(model || RESEARCH_DEFAULT_MODEL);
}

/**
 * Creates a synthesis LLM client
 * @param model Optional model to use (defaults to config value)
 * @returns A new LLM client
 */
export function createSynthesisLLMClient(model?: string): LLMClient {
  return createLLMClient(model || SYNTHESIS_DEFAULT_MODEL);
}

/**
 * Creates multiple research LLM clients with different models
 * @param models Array of models to use
 * @returns Array of LLM clients
 */
export function createMultipleResearchLLMClients(
  models: string[]
): LLMClient[] {
  return models.map((model) => createLLMClient(model));
}

/**
 * Creates a ChatGPT client
 * @param model Optional model to use (defaults to config value)
 * @returns A new ChatGPT client
 */
export function createChatGPTClient(model?: string): ChatGPTClient {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return new ChatGPTClient(OPENROUTER_API_KEY, model || OPENAI_DEFAULT_MODEL);
}

/**
 * Creates a Gemini client
 * @param model Optional model to use (defaults to config value)
 * @returns A new Gemini client
 */
export function createGeminiClient(model?: string): GeminiClient {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return new GeminiClient(OPENROUTER_API_KEY, model || GEMINI_DEFAULT_MODEL);
}

/**
 * Creates a Claude client
 * @param model Optional model to use (defaults to config value)
 * @returns A new Claude client
 */
export function createClaudeClient(model?: string): ClaudeClient {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return new ClaudeClient(OPENROUTER_API_KEY, model || CLAUDE_DEFAULT_MODEL);
}
