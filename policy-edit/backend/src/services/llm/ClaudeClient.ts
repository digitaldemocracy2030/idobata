import Anthropic from "@anthropic-ai/sdk";
import { logger } from "../../utils/logger.js";
import { LLMClient } from "./LLMClient.js";

/**
 * Claude (Anthropic) models client implementation
 */
export class ClaudeClient implements LLMClient {
  private anthropic: Anthropic;

  /**
   * Creates a new ClaudeClient
   * @param apiKey The Anthropic API key
   * @param model The model to use (defaults to claude-3-opus-20240229)
   */
  constructor(
    private apiKey: string,
    private model = "claude-3-opus-20240229"
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.apiKey,
    });
  }

  /**
   * Completes a prompt using Anthropic's Claude models
   * @param prompt The prompt to complete
   * @returns The completion text
   */
  async complete(prompt: string): Promise<string> {
    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      if (!message.content || message.content.length === 0) {
        throw new Error("No completion content returned");
      }

      const textContent = message.content
        .filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("");

      if (!textContent) {
        throw new Error("No text content in the response");
      }

      return textContent;
    } catch (error) {
      logger.error(`Error completing prompt with Claude: ${error}`);
      throw error;
    }
  }
}
