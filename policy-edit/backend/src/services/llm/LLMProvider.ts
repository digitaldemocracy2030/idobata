/**
 * Enumeration of supported LLM providers
 */
export enum LLMProvider {
  OPENAI = "openai",
  GOOGLE = "google",
  ANTHROPIC = "anthropic",
  OPENROUTER = "openrouter",
}

/**
 * Gets the provider from a model identifier
 * @param model The model identifier
 * @returns The provider or undefined if not recognized
 */
export function getProviderFromModel(model: string): LLMProvider | undefined {
  if (model.startsWith("gpt-") || model.includes("openai/")) {
    return LLMProvider.OPENAI;
  }
  if (model.startsWith("gemini-") || model.includes("google/")) {
    return LLMProvider.GOOGLE;
  }
  if (model.startsWith("claude-") || model.includes("anthropic/")) {
    return LLMProvider.ANTHROPIC;
  }
  return undefined;
}

/**
 * Normalizes a model identifier by removing the provider prefix if present
 * @param model The model identifier
 * @returns The normalized model identifier
 */
export function normalizeModelId(model: string): string {
  const parts = model.split("/");
  return parts.length > 1 ? parts[1] : model;
}
