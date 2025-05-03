import mongoose from "mongoose";
import Problem from "../models/Problem.js";
import QuestionLink from "../models/QuestionLink.js";
import QuestionVisualReport from "../models/QuestionVisualReport.js";
import SharpQuestion from "../models/SharpQuestion.js";
import Solution from "../models/Solution.js";
import { callLLM } from "./llmService.js";

export async function getVisualReport(questionId) {
  return QuestionVisualReport.findOne({
    questionId: new mongoose.Types.ObjectId(questionId),
  });
}

export async function generateQuestionVisualReport(questionId, forceRegenerate = false) {
  try {
    console.log(`[VisualReportGenerator] Starting visual report generation for questionId: ${questionId}`);
    
    if (!forceRegenerate) {
      const existingReport = await getVisualReport(questionId);
      if (existingReport) {
        console.log(`[VisualReportGenerator] Using existing visual report for question ${questionId}`);
        return existingReport;
      }
    }
    
    const question = await SharpQuestion.findById(questionId);
    if (!question) {
      console.error(`[VisualReportGenerator] SharpQuestion not found for id: ${questionId}`);
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
      `[VisualReportGenerator] Found ${problemStatements.length} related problems and ${solutionStatements.length} related solutions, sorted by relevance.`
    );
    
    const markdownContent = `
# ${question.questionText}

## 課題点
${problemStatements.map((statement, index) => `${index + 1}. ${statement}`).join('\n')}

## 解決策
${solutionStatements.map((statement, index) => `${index + 1}. ${statement}`).join('\n')}
`;
    
    const visualPrompt = `
# グラフィックレコーディング風インフォグラフィック変換プロンプト

## 目的
  以下の内容を、超一流デザイナーが作成したような、日本語で完璧なグラフィックレコーディング風のHTMLインフォグラフィックに変換してください。情報設計とビジュアルデザインの両面で最高水準を目指します
  手書き風の図形やアイコンを活用して内容を視覚的に表現します。
## デザイン仕様
### 1. カラースキーム

  <palette>
  <color name='青-1' rgb='0A2463' r='10' g='36' b='99' />
  <color name='青-2' rgb='1E5EF3' r='30' g='94' b='243' />
  <color name='青-3' rgb='00A8E8' r='0' g='168' b='232' />
  <color name='青-4' rgb='38B6FF' r='56' g='182' b='255' />
  <color name='青-5' rgb='8CDBFF' r='140' g='219' b='255' />
  </palette>

### 2. グラフィックレコーディング要素
- 左上から右へ、上から下へと情報を順次配置
- 日本語の手書き風フォントの使用（Zen Maru Gothic）
- 手描き風の囲み線、矢印、バナー、吹き出し
- テキストと視覚要素（アイコン、シンプルな図形）の組み合わせ
- キーワードの強調（色付き下線、マーカー効果）
- 関連する概念を線や矢印で接続
- 絵文字やアイコンを効果的に配置（✏️📌📝🔍📊など）
### 3. タイポグラフィ
  - タイトル：48px、グラデーション効果、太字
  - サブタイトル：28px、#475569
  - セクション見出し：32px、#1e40af、アイコン付き
  - 本文：24px、#334155、行間1.6
  - フォント指定：
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic&display=swap');
    </style>

### 4. レイアウト
  - ヘッダー：右上に小さく日付/出典。その下に、左揃えタイトル。
  - 1カラム構成：幅100%の単一カラム
  - カード型コンポーネント：白背景、角丸16px、微細シャドウ
  - セクション間の余白を広めに取り、階層構造を明確に
  - 適切にグラスモーフィズムを活用
  - コンテンツの最大幅は600pxで中央揃え
  - 余白を十分に取り、読みやすさを重視

## グラフィックレコーディング表現技法
- テキストと視覚要素のバランスを重視
- キーワードを囲み線や色で強調
- 簡易的なアイコンや図形で概念を視覚化
- 数値データは簡潔なグラフや図表で表現
- 接続線や矢印で情報間の関係性を明示
- 余白を効果的に活用して視認性を確保
## 全体的な指針
- 読み手が自然に視線を移動できる配置
- 情報の階層と関連性を視覚的に明確化
- 視覚的な記憶に残るデザイン
- 遠くからでも見やすいデザイン
- フッターに出典情報を明記
- 複雑すぎる構造はCSSが壊れる可能性があるため避ける
- 単に原文のキーワードだけ書いても意味が分からないため、誰にでも伝わるような分かりやすい表現に書き換えて説明する

## 変換する文章/記事
${markdownContent}
---
レスポンスは完全なHTML+CSSコードのみを返してください。`;
    
    console.log(`[VisualReportGenerator] Calling LLM to generate visual report...`);
    const completion = await callLLM(
      [{ role: "user", content: visualPrompt }],
      false,
      "anthropic/claude-3-sonnet"
    );
    
    if (!completion) {
      throw new Error("Failed to generate visual report");
    }
    
    const overallAnalysis = completion.replace(/^```html|```$/g, "").trim();
    
    const visualReport = new QuestionVisualReport({
      questionId: question._id,
      questionText: question.questionText,
      overallAnalysis,
      sourceProblemIds: problemIds,
      sourceSolutionIds: solutionIds,
      version: 1,
    });
    
    await QuestionVisualReport.findOneAndUpdate(
      { questionId: question._id },
      visualReport.toObject(),
      { upsert: true, new: true }
    );
    
    console.log(`[VisualReportGenerator] Successfully saved visual report for questionId: ${questionId}`);
    
    return visualReport;
  } catch (error) {
    console.error(`[VisualReportGenerator] Error generating visual report for questionId ${questionId}:`, error);
    throw error;
  }
}
