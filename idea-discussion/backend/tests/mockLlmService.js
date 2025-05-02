/**
 * Mock implementation of the LLM service for testing
 */

/**
 * Mock implementation of callLLM that returns predefined responses
 * @param {Array} messages - Array of message objects with role and content properties
 * @param {boolean} jsonOutput - Whether to request JSON output from the LLM
 * @param {string} model - The model ID to use
 * @returns {string|Object} - Returns predefined response
 */
export function mockCallLLM(messages, jsonOutput = false, model = "mock-model") {
  console.log("Using mock LLM service");
  
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.content.includes("extract")) {
    return jsonOutput
      ? {
          problems: [
            {
              statement: "テスト課題",
              description: "テスト課題の説明",
            },
          ],
          solutions: [
            {
              statement: "テスト解決策",
              description: "テスト解決策の説明",
            },
          ],
        }
      : "Extracted 1 problem and 1 solution.";
  }
  
  return jsonOutput
    ? { response: "This is a mock response" }
    : "This is a mock response";
}

export const MOCK_MODELS = {
  "mock-model": "mock-model",
};
