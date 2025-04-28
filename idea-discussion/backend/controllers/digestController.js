import mongoose from "mongoose";
import DigestDraft from "../models/DigestDraft.js";
import SharpQuestion from "../models/SharpQuestion.js";

export const getDigestDraftsByTheme = async (req, res) => {
  const { themeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(themeId)) {
    return res.status(400).json({ message: "Invalid theme ID format" });
  }

  try {
    const questions = await SharpQuestion.find({ themeId });
    const questionIds = questions.map((q) => q._id);

    const drafts = await DigestDraft.find({ questionId: { $in: questionIds } })
      .sort({ createdAt: -1 })
      .populate("questionId", "questionText")
      .populate("policyDraftId", "title");

    res.status(200).json(drafts);
  } catch (error) {
    console.error(`Error fetching digest drafts for theme ${themeId}:`, error);
    res.status(500).json({
      message: "Failed to fetch digest drafts for theme",
      error: error.message,
    });
  }
};
