import ChatThread from "../models/ChatThread.js";
import Like from "../models/Like.js";
import QuestionLink from "../models/QuestionLink.js";
import SharpQuestion from "../models/SharpQuestion.js";
import Theme from "../models/Theme.js";

/**
 * Get latest themes and questions for the top page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTopPageData = async (req, res) => {
  try {
    const themes = await Theme.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(3);

    const questions = await SharpQuestion.find()
      .sort({ createdAt: -1 })
      .limit(3);

    const enhancedThemes = await Promise.all(
      themes.map(async (theme) => {
        const keyQuestionCount = await SharpQuestion.countDocuments({
          themeId: theme._id,
        });

        const commentCount = await ChatThread.countDocuments({
          themeId: theme._id,
        });

        return {
          _id: theme._id,
          title: theme.title,
          description: theme.description || "",
          slug: theme.slug,
          keyQuestionCount,
          commentCount,
        };
      })
    );

    const enhancedQuestions = await Promise.all(
      questions.map(async (question) => {
        const questionId = question._id;

        const issueCount = await QuestionLink.countDocuments({
          questionId,
          linkedItemType: "problem",
        });

        const solutionCount = await QuestionLink.countDocuments({
          questionId,
          linkedItemType: "solution",
        });

        const likeCount = await Like.countDocuments({
          targetId: questionId,
          targetType: "question",
        });

        return {
          ...question.toObject(),
          issueCount,
          solutionCount,
          likeCount,
        };
      })
    );

    return res.status(200).json({
      latestThemes: enhancedThemes,
      latestQuestions: enhancedQuestions,
    });
  } catch (error) {
    console.error("Error fetching top page data:", error);
    return res.status(500).json({
      message: "Error fetching top page data",
      error: error.message,
    });
  }
};
