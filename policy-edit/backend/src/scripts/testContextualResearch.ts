import { OPENROUTER_API_KEY } from "../config.js";
import { OpenRouterLLMClient } from "../services/llm/OpenRouterLLMClient.js";
import { ContextualResearchService } from "../services/research/ContextualResearchService.js";
import { logger } from "../utils/logger.js";

async function testContextualResearch() {
  if (!OPENROUTER_API_KEY) {
    logger.error("OPENROUTER_API_KEY is not set");
    process.exit(1);
  }

  const researchLLM1 = new OpenRouterLLMClient(
    OPENROUTER_API_KEY,
    "google/gemini-2.5-pro-preview-03-25"
  );

  const researchLLM2 = new OpenRouterLLMClient(
    OPENROUTER_API_KEY,
    "anthropic/claude-3-5-sonnet-20240620"
  );

  const synthesisLLM = new OpenRouterLLMClient(
    OPENROUTER_API_KEY,
    "anthropic/claude-3-opus-20240229"
  );

  const researchService = new ContextualResearchService(
    [researchLLM1, researchLLM2],
    synthesisLLM
  );

  const testStatements = [
    "The Earth is flat.",
    "Drinking lemon water every morning boosts your immune system.",
    "The Great Wall of China is visible from space with the naked eye.",
  ];

  for (const statement of testStatements) {
    logger.info(`Researching: "${statement}"`);

    try {
      const result = await researchService.execute(statement);

      logger.info("Research complete!");
      logger.info("Synthesized result:");
      logger.info(result.resultMessage);

      logger.info("\nRaw responses:");
      result.rawResponses?.forEach((response, index) => {
        logger.info(`\nLLM ${index + 1} response:`);
        logger.info(response);
      });

      logger.info("\n-----------------------------------\n");
    } catch (error) {
      logger.error(`Error researching statement: ${error}`);
    }
  }
}

testContextualResearch().catch((error) => {
  logger.error("Unhandled error:", error);
  process.exit(1);
});
