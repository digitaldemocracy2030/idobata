import OpenAI from "openai";
import { logger } from "../../utils/logger.js";
import { LLMClient } from "./LLMClient.js";

export class OpenRouterLLMClient implements LLMClient {
  private openai: OpenAI;

  /**
   * Creates a new OpenRouterLLMClient
   * @param apiKey The OpenRouter API key
   * @param model The model to use (defaults to Gemini Pro)
   */
  constructor(
    private apiKey: string,
    private model = "google/gemini-2.5-pro-preview-03-25"
  ) {
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: this.apiKey,
    });
  }

  /**
   * Completes a prompt using the configured model via OpenRouter
   * @param prompt The prompt to complete
   * @returns The completion text
   */
  async complete(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error("No completion choices returned");
      }

      return response.choices[0].message.content || "";
    } catch (error) {
      logger.error(`Error completing prompt with OpenRouter: ${error}`);
      throw error;
    }
  }
}
