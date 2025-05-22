import { logger } from "../../utils/logger.js";
import { LLMClient } from "../llm/LLMClient.js";
import { ContextualResearch } from "./ContextualResearch.js";

/**
 * Service for performing contextual research using multiple LLMs
 */
export class ContextualResearchService {
  /**
   * Creates a new ContextualResearchService
   * @param researchLLMClients Array of LLM clients to use for research
   * @param synthesisLLMClient LLM client to use for synthesizing results
   */
  constructor(
    private researchLLMClients: LLMClient[],
    private synthesisLLMClient: LLMClient
  ) {
    if (researchLLMClients.length === 0) {
      throw new Error("At least one research LLM client is required");
    }
  }

  /**
   * Executes contextual research on the provided message
   * @param message The message to research
   * @returns A promise that resolves to a ContextualResearch object
   */
  async execute(message: string): Promise<ContextualResearch> {
    try {
      logger.info(
        `Starting contextual research for message: ${message.substring(0, 50)}...`
      );

      const researchPromises = this.researchLLMClients.map((client) =>
        client.complete(
          `Please research and verify the following statement, providing evidence for or against it: "${message}"`
        )
      );

      const rawResponses = await Promise.all(researchPromises);

      logger.info(`Received ${rawResponses.length} research responses`);

      const synthesisPrompt = this.createSynthesisPrompt(message, rawResponses);
      const synthesizedResult =
        await this.synthesisLLMClient.complete(synthesisPrompt);

      logger.info("Synthesized research results");

      return new ContextualResearch(synthesizedResult, rawResponses);
    } catch (error) {
      logger.error(`Error executing contextual research: ${error}`);
      throw error;
    }
  }

  /**
   * Creates a prompt for synthesizing research results
   * @param originalMessage The original message that was researched
   * @param researchResults Array of research results from different LLMs
   * @returns A synthesis prompt
   */
  private createSynthesisPrompt(
    originalMessage: string,
    researchResults: string[]
  ): string {
    return `
I need you to synthesize multiple research results about the following statement:

"${originalMessage}"

Here are the research results from different sources:

${researchResults.map((result, index) => `Source ${index + 1}:\n${result}\n`).join("\n")}

Please analyze these research results and provide a comprehensive synthesis that:
1. Evaluates the factual accuracy of the original statement
2. Identifies areas of agreement and disagreement between sources
3. Provides a final assessment of the statement's validity
4. Cites specific evidence from the research results

Your synthesis should be well-structured, balanced, and focused on the evidence provided.
`;
  }
}
