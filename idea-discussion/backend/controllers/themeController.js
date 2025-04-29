import mongoose from "mongoose";
import ChatThread from "../models/ChatThread.js";
import SharpQuestion from "../models/SharpQuestion.js";
import Theme from "../models/Theme.js";

export const getAllThemes = async (req, res) => {
  try {
    // 基本的なテーマ情報を取得
    const themes = await Theme.find({ isActive: true }).sort({ createdAt: -1 });

    // 拡張されたテーマ情報を格納する配列
    const enhancedThemes = [];

    // 各テーマについて関連データを取得
    for (const theme of themes) {
      // キークエスチョン数をカウント
      const keyQuestionCount = await SharpQuestion.countDocuments({
        themeId: theme._id,
      });

      // コメント数をカウント（ChatThreadのドキュメント数をカウント）
      const commentCount = await ChatThread.countDocuments({
        themeId: theme._id,
      });

      // 拡張されたテーマ情報を追加
      enhancedThemes.push({
        _id: theme._id,
        id: theme._id, // フロントエンドの互換性のため
        title: theme.title,
        description: theme.description || "",
        slug: theme.slug,
        keyQuestionCount,
        commentCount,
      });
    }

    return res.status(200).json(enhancedThemes);
  } catch (error) {
    console.error("Error fetching all themes:", error);
    return res
      .status(500)
      .json({ message: "Error fetching themes", error: error.message });
  }
};

export const getThemeById = async (req, res) => {
  const { themeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(themeId)) {
    return res.status(400).json({ message: "Invalid theme ID format" });
  }

  try {
    const theme = await Theme.findById(themeId);
    if (!theme) {
      return res.status(404).json({ message: "Theme not found" });
    }
    return res.status(200).json(theme);
  } catch (error) {
    console.error(`Error fetching theme ${themeId}:`, error);
    return res
      .status(500)
      .json({ message: "Error fetching theme", error: error.message });
  }
};

export const createTheme = async (req, res) => {
  const { title, description, slug, isActive } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ message: "Title and slug are required" });
  }

  try {
    const existingTheme = await Theme.findOne({ slug });
    if (existingTheme) {
      return res
        .status(400)
        .json({ message: "A theme with this slug already exists" });
    }

    const theme = new Theme({
      title,
      description,
      slug,
      isActive: isActive !== undefined ? isActive : true,
    });

    const savedTheme = await theme.save();
    return res.status(201).json(savedTheme);
  } catch (error) {
    console.error("Error creating theme:", error);
    return res
      .status(500)
      .json({ message: "Error creating theme", error: error.message });
  }
};

export const updateTheme = async (req, res) => {
  const { themeId } = req.params;
  const { title, description, slug, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(themeId)) {
    return res.status(400).json({ message: "Invalid theme ID format" });
  }

  try {
    const theme = await Theme.findById(themeId);
    if (!theme) {
      return res.status(404).json({ message: "Theme not found" });
    }

    if (slug && slug !== theme.slug) {
      const existingTheme = await Theme.findOne({ slug });
      if (existingTheme && existingTheme._id.toString() !== themeId) {
        return res
          .status(400)
          .json({ message: "A theme with this slug already exists" });
      }
    }

    const updatedTheme = await Theme.findByIdAndUpdate(
      themeId,
      {
        title: title || theme.title,
        description:
          description !== undefined ? description : theme.description,
        slug: slug || theme.slug,
        isActive: isActive !== undefined ? isActive : theme.isActive,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedTheme);
  } catch (error) {
    console.error(`Error updating theme ${themeId}:`, error);
    return res
      .status(500)
      .json({ message: "Error updating theme", error: error.message });
  }
};

export const deleteTheme = async (req, res) => {
  const { themeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(themeId)) {
    return res.status(400).json({ message: "Invalid theme ID format" });
  }

  try {
    const theme = await Theme.findById(themeId);
    if (!theme) {
      return res.status(404).json({ message: "Theme not found" });
    }

    await Theme.findByIdAndDelete(themeId);
    return res.status(200).json({ message: "Theme deleted successfully" });
  } catch (error) {
    console.error(`Error deleting theme ${themeId}:`, error);
    return res
      .status(500)
      .json({ message: "Error deleting theme", error: error.message });
  }
};
