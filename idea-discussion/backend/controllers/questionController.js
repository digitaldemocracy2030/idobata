import mongoose from "mongoose";
import Problem from "../models/Problem.js";
import QuestionLink from "../models/QuestionLink.js";
import SharpQuestion from "../models/SharpQuestion.js";
import Solution from "../models/Solution.js";
import { getVisualReport as getQuestionVisualReport } from "../services/questionVisualReportGenerator.js";
import { generateDigestDraft } from "../workers/digestGenerator.js";
import { generatePolicyDraft } from "../workers/policyGenerator.js";
import { generateVisualReport } from "../workers/visualReportGenerator.js";

// GET /api/themes/:themeId/questions/:questionId/details - 特定の質問の詳細を取得
export const getQuestionDetails = async (req, res) => {
  const { questionId, themeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ message: "Invalid question ID format" });
  }

  try {
    const question = await SharpQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Find links related to this question
    const links = await QuestionLink.find({ questionId: questionId });

    // Separate problem and solution links
    const problemLinks = links.filter(
      (link) => link.linkedItemType === "problem"
    );
    const solutionLinks = links.filter(
      (link) => link.linkedItemType === "solution"
    );

    // Extract IDs
    const problemIds = problemLinks.map((link) => link.linkedItemId);
    const solutionIds = solutionLinks.map((link) => link.linkedItemId);

    // Fetch related problems and solutions
    // Using lean() for potentially better performance if we don't need Mongoose documents
    const relatedProblemsData = await Problem.find({
      _id: { $in: problemIds },
    }).lean();
    const relatedSolutionsData = await Solution.find({
      _id: { $in: solutionIds },
    }).lean();

    // Combine with relevanceScore and sort by relevanceScore
    const relatedProblems = relatedProblemsData
      .map((problem) => {
        const link = problemLinks.find(
          (link) => link.linkedItemId.toString() === problem._id.toString()
        );
        return {
          ...problem,
          relevanceScore: link?.relevanceScore || 0,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    const relatedSolutions = relatedSolutionsData
      .map((solution) => {
        const link = solutionLinks.find(
          (link) => link.linkedItemId.toString() === solution._id.toString()
        );
        return {
          ...solution,
          relevanceScore: link?.relevanceScore || 0,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    const voteCount = question.voteCount || 0;

    const debateData = {
      axes: [
        {
          title: "支援の方向性",
          options: [
            {
              label: "個人の能力開発支援",
              description: "個人のスキルアップや能力開発を支援する政策を重視",
            },
            {
              label: "雇用環境の整備",
              description: "企業側の採用・雇用制度を改革する政策を重視",
            },
          ],
        },
        {
          title: "支援の対象",
          options: [
            {
              label: "新卒・若年層全般",
              description: "新卒者を含む若年層全体を対象とした支援策",
            },
            {
              label: "特定のニーズを持つ若者",
              description: "困難を抱える若者や特定のニーズを持つ若者に焦点",
            },
          ],
        },
      ],
      agreementPoints: [
        "現状の新卒一括採用に問題がある点",
        "キャリア教育の強化が必要な点",
        "若者のキャリア形成に関する不安が大きい点",
      ],
      disagreementPoints: [
        "国の介入度合い（市場主導 vs 政府主導）",
        "支援の優先順位（教育改革 vs 雇用制度改革）",
        "地方と都市部の格差への対応策",
      ],
    };

    const reportExample = {
      introduction:
        "若者の雇用とキャリア形成に関する市民の意見を集約した結果、以下のような課題が浮かび上がりました。これらの課題に対して、政策立案者は具体的な対応を検討すべきです。",
      issues: [
        {
          title: "1. 新卒一括採用システムの見直し",
          description:
            "現行の新卒一括採用システムは若者のキャリア選択の幅を狭め、多様な才能や適性を活かしにくくしています。通年採用や複数回採用の導入、中途採用の強化などの改革が求められています。",
        },
        {
          title: "2. 実践的なキャリア教育の充実",
          description:
            "学校教育と実社会のギャップを埋めるため、早期からの職業体験やインターンシップ、社会人メンターとの交流など、実践的なキャリア教育の充実が必要です。",
        },
        {
          title: "3. 若者の非正規雇用問題への対応",
          description:
            "若者の非正規雇用の増加は将来の不安定さにつながります。正規雇用への転換支援や、非正規でも安定したキャリア形成が可能な制度設計が求められています。",
        },
      ],
    };
    
    const visualReport = await getQuestionVisualReport(questionId);

    res.status(200).json({
      question: {
        ...question.toObject(),
        voteCount,
      },
      relatedProblems,
      relatedSolutions,
      debateData,
      reportExample,
      visualReport: visualReport ? visualReport.overallAnalysis : null,
    });
  } catch (error) {
    console.error(`Error fetching details for question ${questionId}:`, error);
    res.status(500).json({
      message: "Error fetching question details",
      error: error.message,
    });
  }
};

// POST /api/themes/:themeId/questions/:questionId/generate-policy - ポリシードラフト生成
export const triggerPolicyGeneration = async (req, res) => {
  const { questionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ message: "Invalid question ID format" });
  }

  try {
    // Check if the question exists (optional but good practice)
    const question = await SharpQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Trigger the generation asynchronously (using setTimeout for simplicity)
    // In production, use a proper job queue (BullMQ, Agenda, etc.)
    setTimeout(() => {
      generatePolicyDraft(questionId).catch((err) => {
        console.error(
          `[API Trigger] Error during background policy generation for ${questionId}:`,
          err
        );
      });
    }, 0);

    console.log(
      `[API Trigger] Policy generation triggered for questionId: ${questionId}`
    );
    res.status(202).json({
      message: `Policy draft generation started for question ${questionId}`,
    });
  } catch (error) {
    console.error(
      `Error triggering policy generation for question ${questionId}:`,
      error
    );
    res.status(500).json({
      message: "Error triggering policy generation",
      error: error.message,
    });
  }
};

// POST /api/themes/:themeId/questions/:questionId/generate-digest - ダイジェストドラフト生成
export const triggerDigestGeneration = async (req, res) => {
  const { questionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ message: "Invalid question ID format" });
  }

  try {
    // Check if the question exists (optional but good practice)
    const question = await SharpQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Trigger the generation asynchronously (using setTimeout for simplicity)
    // In production, use a proper job queue (BullMQ, Agenda, etc.)
    setTimeout(() => {
      generateDigestDraft(questionId).catch((err) => {
        console.error(
          `[API Trigger] Error during background digest generation for ${questionId}:`,
          err
        );
      });
    }, 0);

    console.log(
      `[API Trigger] Digest generation triggered for questionId: ${questionId}`
    );
    res.status(202).json({
      message: `Digest draft generation started for question ${questionId}`,
    });
  } catch (error) {
    console.error(
      `Error triggering digest generation for question ${questionId}:`,
      error
    );
    res.status(500).json({
      message: "Error triggering digest generation",
      error: error.message,
    });
  }
};

// POST /api/themes/:themeId/questions/:questionId/generate-visual-report - ビジュアルレポートドラフト生成
export const triggerVisualReportGeneration = async (req, res) => {
  const { questionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ message: "Invalid question ID format" });
  }

  try {
    // Check if the question exists
    const question = await SharpQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Trigger the generation asynchronously (using setTimeout for simplicity)
    // In production, use a proper job queue (BullMQ, Agenda, etc.)
    setTimeout(() => {
      generateVisualReport(questionId).catch((err) => {
        console.error(
          `[API Trigger] Error during background visual report generation for ${questionId}:`,
          err
        );
      });
    }, 0);

    console.log(
      `[API Trigger] Visual report generation triggered for questionId: ${questionId}`
    );
    res.status(202).json({
      message: `Visual report generation started for question ${questionId}`,
    });
  } catch (error) {
    console.error(
      `Error triggering visual report generation for question ${questionId}:`,
      error
    );
    res.status(500).json({
      message: "Error triggering visual report generation",
      error: error.message,
    });
  }
};

// GET /api/themes/:themeId/questions/:questionId/visual-report - ビジュアルレポート取得
export const getVisualReport = async (req, res) => {
  const { questionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ message: "Invalid question ID format" });
  }

  try {
    const visualReport = await getQuestionVisualReport(questionId);
    
    if (!visualReport) {
      return res.status(404).json({ message: "Visual report not found" });
    }
    
    res.status(200).json(visualReport);
  } catch (error) {
    console.error(
      `Error getting visual report for question ${questionId}:`,
      error
    );
    res.status(500).json({
      message: "Error getting visual report",
      error: error.message,
    });
  }
};

// GET /api/themes/:themeId/questions - 特定テーマの質問を取得
export const getQuestionsByTheme = async (req, res) => {
  const { themeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(themeId)) {
    return res.status(400).json({ message: "Invalid theme ID format" });
  }

  try {
    const questions = await SharpQuestion.find({ themeId }).sort({
      createdAt: -1,
    });
    res.status(200).json(questions);
  } catch (error) {
    console.error(`Error fetching questions for theme ${themeId}:`, error);
    res.status(500).json({
      message: "Error fetching theme questions",
      error: error.message,
    });
  }
};
