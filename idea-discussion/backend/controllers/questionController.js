import mongoose from "mongoose";
import Like from "../models/Like.js";
import Problem from "../models/Problem.js";
import QuestionLink from "../models/QuestionLink.js";
import ReportExample from "../models/ReportExample.js";
import SharpQuestion from "../models/SharpQuestion.js";
import Solution from "../models/Solution.js";
import { getDebateAnalysis } from "../services/debateAnalysisGenerator.js";
import { getVisualReport as getQuestionVisualReport } from "../services/questionVisualReportGenerator.js";
import { generateDebateAnalysisTask } from "../workers/debateAnalysisGenerator.js";
import { generateDigestDraft } from "../workers/digestGenerator.js";
import { generatePolicyDraft } from "../workers/policyGenerator.js";
import { generateReportExample } from "../workers/reportGenerator.js";
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

    const voteCount = await Like.countDocuments({ targetId: questionId, targetType: "question" });

    const reportExample = await ReportExample.findOne({
      questionId: questionId,
    })
      .sort({ version: -1 })
      .lean();

    const visualReport = await getQuestionVisualReport(questionId);

    const debateData = await getDebateAnalysis(questionId);

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

// POST /api/themes/:themeId/questions/:questionId/generate-debate-analysis - 論点まとめ生成
export const triggerDebateAnalysisGeneration = async (req, res) => {
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
      generateDebateAnalysisTask(questionId).catch((err) => {
        console.error(
          `[API Trigger] Error during background debate analysis generation for ${questionId}:`,
          err
        );
      });
    }, 0);

    console.log(
      `[API Trigger] Debate analysis generation triggered for questionId: ${questionId}`
    );
    res.status(202).json({
      message: `Debate analysis generation started for question ${questionId}`,
    });
  } catch (error) {
    console.error(
      `Error triggering debate analysis generation for question ${questionId}:`,
      error
    );
    res.status(500).json({
      message: "Error triggering debate analysis generation",
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

// POST /api/themes/:themeId/questions/:questionId/generate-report - レポート例生成
export const triggerReportGeneration = async (req, res) => {
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
      generateReportExample(questionId).catch((err) => {
        console.error(
          `[API Trigger] Error during background report generation for ${questionId}:`,
          err
        );
      });
    }, 0);

    console.log(
      `[API Trigger] Report generation triggered for questionId: ${questionId}`
    );
    res.status(202).json({
      message: `Report example generation started for question ${questionId}`,
    });
  } catch (error) {
    console.error(
      `Error triggering report generation for question ${questionId}:`,
      error
    );
    res.status(500).json({
      message: "Error triggering report generation",
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
