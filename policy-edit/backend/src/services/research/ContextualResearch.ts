/**
 * Represents the result of a contextual research operation
 */
export class ContextualResearch {
  /**
   * Creates a new ContextualResearch result
   * @param resultMessage The synthesized research result
   * @param rawResponses Optional array of raw responses from individual LLMs
   */
  constructor(
    public resultMessage: string,
    public rawResponses?: string[]
  ) {}
}
