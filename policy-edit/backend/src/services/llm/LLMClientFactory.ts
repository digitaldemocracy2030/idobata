import {
  OPENROUTER_API_KEY,
  RESEARCH_DEFAULT_MODEL,
  SYNTHESIS_DEFAULT_MODEL,
} from "../../config.js";
import { LLMClient } from "./LLMClient.js";
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

  return new OpenRouterLLMClient(OPENROUTER_API_KEY, model);
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
