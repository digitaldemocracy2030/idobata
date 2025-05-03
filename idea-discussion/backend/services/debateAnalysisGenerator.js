import mongoose from "mongoose";
import Problem from "../models/Problem.js";
import QuestionLink from "../models/QuestionLink.js";
import DebateAnalysis from "../models/DebateAnalysis.js";
import SharpQuestion from "../models/SharpQuestion.js";
import Solution from "../models/Solution.js";
import { RECOMMENDED_MODELS, callLLM } from "./llmService.js";

export async function getDebateAnalysis(questionId) {
  return DebateAnalysis.findOne({
    questionId: new mongoose.Types.ObjectId(questionId),
  }).sort({ version: -1 });
}

export async function generateDebateAnalysis(questionId) {
  try {
    console.log(
      `[DebateAnalysisGenerator] Starting debate analysis generation for questionId: ${questionId}`
    );

    const question = await SharpQuestion.findById(questionId);
    if (!question) {
      console.error(
        `[DebateAnalysisGenerator] SharpQuestion not found for id: ${questionId}`
      );
      throw new Error("Question not found");
    }

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
      `[DebateAnalysisGenerator] Found ${problemStatements.length} related problems and ${solutionStatements.length} related solutions, sorted by relevance.`
    );

    const markdownContent = `
# ${question.questionText}

## 課題点
${problemStatements.map((statement, index) => `${index + 1}. ${statement}`).join("\n")}

## 解決策
${solutionStatements.map((statement, index) => `${index + 1}. ${statement}`).join("\n")}
`;

    const debatePrompt = `
# 論点分析プロンプト

## 目的
以下の課題点と解決策を分析し、主要な論点と対立軸、および合意形成の状況を抽出してください。

## 分析内容
1. 主要な論点と対立軸:
   - 議論における主要な論点を特定し、それぞれの論点における対立する視点や選択肢を明らかにしてください。
   - それぞれの対立軸について、簡潔なタイトルと対立する選択肢（各選択肢には短いラベルと説明文）を提供してください。
   - 3つ以内の重要な対立軸に絞ってください。

2. 合意形成の状況:
   - 合意点: 大多数の意見が一致している点や、広く受け入れられている考え方を特定してください。(3-5項目)
   - 対立点: 意見が分かれている点や、解決されていない論争点を特定してください。(3-5項目)

## 出力形式
JSON形式で以下の構造に従って結果を出力してください:

\`\`\`json
{
  "axes": [
    {
      "title": "対立軸のタイトル",
      "options": [
        {
          "label": "選択肢1のラベル",
          "description": "選択肢1の説明"
        },
        {
          "label": "選択肢2のラベル",
          "description": "選択肢2の説明"
        }
      ]
    }
  ],
  "agreementPoints": [
    "合意点1",
    "合意点2",
    "合意点3"
  ],
  "disagreementPoints": [
    "対立点1",
    "対立点2",
    "対立点3"
  ]
}
\`\`\`

## 入力テキスト
${markdownContent}
---

日本語でJSONのみを返してください。JSONの前後にバッククォートやコメントは不要です。`;

    console.log(
      "[DebateAnalysisGenerator] Calling LLM to generate debate analysis..."
    );
    const completion = await callLLM(
      [{ role: "user", content: debatePrompt }],
      true,
      RECOMMENDED_MODELS["gemini-pro"]
    );

    if (!completion) {
      throw new Error("Failed to generate debate analysis");
    }

    const latestAnalysis = await DebateAnalysis.findOne({
      questionId: question._id,
    }).sort({ version: -1 }); // Sort by version descending to get the highest

    const nextVersion = latestAnalysis ? latestAnalysis.version + 1 : 1; // Calculate next version

    const newDebateAnalysis = new DebateAnalysis({
      questionId: question._id,
      questionText: question.questionText,
      axes: completion.axes || [],
      agreementPoints: completion.agreementPoints || [],
      disagreementPoints: completion.disagreementPoints || [],
      sourceProblemIds: problemIds,
      sourceSolutionIds: solutionIds,
      version: nextVersion, // Use the calculated next version
    });

    await newDebateAnalysis.save();

    console.log(
      `[DebateAnalysisGenerator] Successfully saved new debate analysis (version ${nextVersion}) for questionId: ${questionId}`
    );

    return newDebateAnalysis; // Return the newly created analysis
  } catch (error) {
    console.error(
      `[DebateAnalysisGenerator] Error generating debate analysis for questionId ${questionId}:`,
      error
    );
    throw error;
  }
}
