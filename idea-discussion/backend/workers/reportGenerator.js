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
        content: `あなたはAIアシスタントです。中心的な問い（「私たちはどのようにして...できるか？」）、関連する問題点のリスト、そして市民からの意見を通じて特定された潜在的な解決策のリストに基づいて、市民意見レポート例を作成する任務を負っています。

市民意見レポート例は、以下の形式で出力してください：

1. 導入部（introduction）: 市民からの意見を集約したことを示し、以下のような内容を簡潔に述べるテキスト。200文字程度。

2. 課題リスト（issues）: 3つの主要な課題を含み、それぞれに次の要素を持つ：
   - title: 課題の短いタイトル（例: "1. 新卒一括採用システムの見直し"）
   - description: その課題の詳細な説明。150文字程度。

レスポンスは次のJSON形式で提供してください：
{
  "introduction": "（導入部のテキスト）",
  "issues": [
    {
      "title": "1. （最初の課題のタイトル）",
      "description": "（最初の課題の説明）"
    },
    {
      "title": "2. （2番目の課題のタイトル）",
      "description": "（2番目の課題の説明）"
    },
    {
      "title": "3. （3番目の課題のタイトル）",
      "description": "（3番目の課題の説明）"
    }
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
    ); // Request JSON output with specific model

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

    let reportExample = await ReportExample.findOne({ questionId: questionId });
    
    if (reportExample) {
      reportExample.introduction = llmResponse.introduction;
      reportExample.issues = llmResponse.issues;
      reportExample.version += 1;
    } else {
      reportExample = new ReportExample({
        questionId: questionId,
        introduction: llmResponse.introduction,
        issues: llmResponse.issues,
        version: 1,
      });
    }

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
