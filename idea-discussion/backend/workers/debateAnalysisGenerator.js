import { generateDebateAnalysis } from "../services/debateAnalysisGenerator.js";

export async function generateDebateAnalysisTask(questionId) {
  try {
    console.log(
      `[Worker] Starting debate analysis generation for questionId: ${questionId}`
    );

    const result = await generateDebateAnalysis(questionId);

    console.log(
      `[Worker] Successfully completed debate analysis generation for questionId: ${questionId}`
    );

    return result;
  } catch (error) {
    console.error(
      `[Worker] Error during debate analysis generation for questionId ${questionId}:`,
      error
    );
    throw error;
  }
}
