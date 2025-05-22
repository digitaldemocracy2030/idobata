import {
  OPENROUTER_API_KEY,
  RESEARCH_DEFAULT_MODEL,
  SYNTHESIS_DEFAULT_MODEL,
} from "../../config.js";
import { LLMClient } from "./LLMClient.js";
import { OpenRouterLLMClient } from "./OpenRouterLLMClient.js";

/**
 * Creates a research LLM client
 * @param model Optional model to use (defaults to config value)
 * @returns A new LLM client
 */
export function createResearchLLMClient(model?: string): LLMClient {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  return new OpenRouterLLMClient(
    OPENROUTER_API_KEY,
    model || RESEARCH_DEFAULT_MODEL
  );
}

/**
 * Creates a synthesis LLM client
 * @param model Optional model to use (defaults to config value)
 * @returns A new LLM client
 */
export function createSynthesisLLMClient(model?: string): LLMClient {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  return new OpenRouterLLMClient(
    OPENROUTER_API_KEY,
    model || SYNTHESIS_DEFAULT_MODEL
  );
}

/**
 * Creates multiple research LLM clients with different models
 * @param models Array of models to use
 * @returns Array of LLM clients
 */
export function createMultipleResearchLLMClients(
  models: string[]
): LLMClient[] {
  return models.map((model) => createResearchLLMClient(model));
}
