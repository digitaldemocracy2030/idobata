export interface LLMClient {
  /**
   * Completes a prompt using an LLM
   * @param prompt The prompt to complete
   * @returns A promise that resolves to the completion text
   */
  complete(prompt: string): Promise<string>;
}
