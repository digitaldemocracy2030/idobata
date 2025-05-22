import { describe, expect, it } from "vitest";
import { LLMClient } from "../llm/LLMClient.js";
import { ContextualResearch } from "./ContextualResearch.js";
import { ContextualResearchService } from "./ContextualResearchService.js";

class MockLLMClient implements LLMClient {
  constructor(private response: string) {}

  async complete(_prompt: string): Promise<string> {
    return this.response;
  }
}

describe("ContextualResearchService", () => {
  it("should throw an error if no research LLM clients are provided", () => {
    const synthesisLLM = new MockLLMClient("synthesis result");

    expect(() => {
      new ContextualResearchService([], synthesisLLM);
    }).toThrow("At least one research LLM client is required");
  });

  it("should execute research and return synthesized results", async () => {
    const researchLLM1 = new MockLLMClient("Research result 1");
    const researchLLM2 = new MockLLMClient("Research result 2");
    const synthesisLLM = new MockLLMClient("Synthesized research result");

    const service = new ContextualResearchService(
      [researchLLM1, researchLLM2],
      synthesisLLM
    );

    const result = await service.execute("Test message");

    expect(result).toBeInstanceOf(ContextualResearch);
    expect(result.resultMessage).toBe("Synthesized research result");
    expect(result.rawResponses).toHaveLength(2);
    expect(result.rawResponses).toContain("Research result 1");
    expect(result.rawResponses).toContain("Research result 2");
  });
});
