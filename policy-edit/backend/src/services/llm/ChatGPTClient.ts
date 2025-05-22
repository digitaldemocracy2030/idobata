import OpenAI from "openai";
import { logger } from "../../utils/logger.js";
import { LLMClient } from "./LLMClient.js";

/**
 * ChatGPT (OpenAI) models client implementation
 */
export class ChatGPTClient implements LLMClient {
  private openai: OpenAI;

  /**
   * Creates a new ChatGPTClient
   * @param apiKey The OpenAI API key
   * @param model The model to use (defaults to gpt-3.5-turbo)
   */
  constructor(
    private apiKey: string,
    private model = "gpt-3.5-turbo"
  ) {
    this.openai = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  /**
   * Completes a prompt using OpenAI's models
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
      logger.error(`Error completing prompt with OpenAI: ${error}`);
      throw error;
    }
  }
}
