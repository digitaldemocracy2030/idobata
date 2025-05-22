import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { logger } from "../../utils/logger.js";
import { LLMClient } from "./LLMClient.js";

/**
 * Gemini (Google) models client implementation
 */
export class GeminiClient implements LLMClient {
  private genAI: GoogleGenerativeAI;
  private safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  /**
   * Creates a new GeminiClient
   * @param apiKey The Google API key
   * @param model The model to use (defaults to gemini-2.5-pro-preview-03-25)
   */
  constructor(
    private apiKey: string,
    private model = "gemini-2.5-pro-preview-03-25"
  ) {
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  /**
   * Completes a prompt using Google's Gemini models
   * @param prompt The prompt to complete
   * @returns The completion text
   */
  async complete(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.model,
        safetySettings: this.safetySettings,
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error("No completion text returned");
      }

      return text;
    } catch (error) {
      logger.error(`Error completing prompt with Gemini: ${error}`);
      throw error;
    }
  }
}
