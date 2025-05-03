import { generateQuestionVisualReport } from "../services/questionVisualReportGenerator.js";

async function generateVisualReport(questionId) {
  console.log(
    `[VisualReportWorker] Starting visual report generation for questionId: ${questionId}`
  );
  try {
    await generateQuestionVisualReport(questionId);
    console.log(
      `[VisualReportWorker] Successfully generated visual report for questionId: ${questionId}`
    );
  } catch (error) {
    console.error(
      `[VisualReportWorker] Error during visual report generation for ${questionId}:`,
      error
    );
  }
}

export { generateVisualReport };
