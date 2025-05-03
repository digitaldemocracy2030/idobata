import mongoose from "mongoose";
import Problem from "../models/Problem.js";
import QuestionLink from "../models/QuestionLink.js";
import ReportExample from "../models/ReportExample.js";
import SharpQuestion from "../models/SharpQuestion.js";
import Solution from "../models/Solution.js";
import { callLLM } from "../services/llmService.js";

async function generateReportExample(questionId) {
  console.log(
    `[ReportGenerator] Starting report example generation for questionId: ${questionId}`
  );
  try {
    const question = await SharpQuestion.findById(questionId);
    if (!question) {
      console.error(
        `[ReportGenerator] SharpQuestion not found for id: ${questionId}`
      );
      return;
    }
    console.log(`[ReportGenerator] Found question: "${question.questionText}"`);

    const links = await QuestionLink.find({ questionId: questionId });

    const problemLinks = links.filter(
      (link) => link.linkedItemType === "problem"
    );
    const solutionLinks = links.filter(
      (link) => link.linkedItemType === "solution"
    );

    problemLinks.sort(
      (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)
    );
    solutionLinks.sort(
      (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)
    );

    const problemIds = problemLinks.map((link) => link.linkedItemId);
    const solutionIds = solutionLinks.map((link) => link.linkedItemId);

    const problems = await Problem.find({ _id: { $in: problemIds } });
    const solutions = await Solution.find({ _id: { $in: solutionIds } });

    const sortedProblems = problemIds
      .map((id) => problems.find((p) => p._id.toString() === id.toString()))
      .filter(Boolean);

    const sortedSolutions = solutionIds
      .map((id) => solutions.find((s) => s._id.toString() === id.toString()))
      .filter(Boolean);

    const problemStatements = sortedProblems.map((p) => p.statement);
    const solutionStatements = sortedSolutions.map((s) => s.statement);

    console.log(
      `[ReportGenerator] Found ${problemStatements.length} related problems and ${solutionStatements.length} related solutions, sorted by relevance.`
    );

    const messages = [
      {
        role: "system",
        content: `問い「${question.questionText}」について、市民からの意見を通じて特定された問題点とその潜在的な解決策を含むレポートを作成してください。

レポートは、以下の形式で出力してください：

1. 導入部（introduction）: 意見を集約したことを示し200文字程度で集まった意見の要点を記してください

2. 課題リスト（issues）: 主要な問題点を網羅的に含むリストであり、以下の情報からなる
- title: 問題の内容を説明する短いタイトル
- description: その課題の詳細な説明。100〜400文字程度。

レスポンスは次のJSON形式で提供してください：
{
  "introduction":,
  "issues": [
    {
      "title":,
      "description":
    },
    {
      "title":,
      "description":
    },
    ...
  ]
}

JSON構造外に他のテキストや説明を含めないでください。`,
      },
      {
        role: "user",
        content: `Generate a report example for the following question:
Question: ${question.questionText}

Related Problems (sorted by relevance - higher items are more relevant to the question):
${problemStatements.length > 0 ? problemStatements.map((p) => `- ${p}`).join("\n") : "- None provided"}

Related Solutions (sorted by relevance - higher items are more relevant to the question):
${solutionStatements.length > 0 ? solutionStatements.map((s) => `- ${s}`).join("\n") : "- None provided"}

Please provide the output as a JSON object with "introduction" and "issues" keys as described. When considering the problems and solutions, prioritize those listed at the top as they are more relevant to the question.`,
      },
    ];

    console.log("[ReportGenerator] Calling LLM to generate report example...");
    const llmResponse = await callLLM(
      messages,
      true,
      "google/gemini-2.5-pro-preview-03-25"
    );

    if (
      !llmResponse ||
      typeof llmResponse !== "object" ||
      !llmResponse.introduction ||
      !Array.isArray(llmResponse.issues) ||
      llmResponse.issues.length === 0
    ) {
      console.error(
        "[ReportGenerator] Failed to get valid JSON response from LLM:",
        llmResponse
      );
      throw new Error(
        "Invalid response format from LLM for report example generation."
      );
    }

    console.log(
      `[ReportGenerator] LLM generated report example with ${llmResponse.issues.length} issues`
    );

    // レポートは上書きせずに版を重ねて残しておく
    const latestReportExample = await ReportExample.findOne({
      questionId: questionId,
    }).sort({ version: -1 });
    const nextVersion = latestReportExample
      ? latestReportExample.version + 1
      : 1;

    const reportExample = new ReportExample({
      questionId: questionId,
      introduction: llmResponse.introduction,
      issues: llmResponse.issues,
      version: nextVersion,
    });

    await reportExample.save();
    console.log(
      `[ReportGenerator] Successfully saved report example with ID: ${reportExample._id}`
    );
  } catch (error) {
    console.error(
      `[ReportGenerator] Error generating report example for questionId ${questionId}:`,
      error
    );
  }
}

export { generateReportExample };
