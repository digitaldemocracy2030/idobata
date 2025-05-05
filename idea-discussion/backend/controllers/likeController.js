import mongoose from "mongoose";
import Like from "../models/Like.js";

// TODO: 認証基盤が入ったら認証対応
export const toggleLike = async (req, res) => {
  const { userId } = req.body;
  const { targetId, targetType } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ message: "Invalid target ID format" });
  }

  try {
    const existingLike = await Like.findOne({
      userId,
      targetId,
      targetType,
    });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);

      const count = await Like.countDocuments({ targetId, targetType });

      return res.status(200).json({
        liked: false,
        count,
      });
    }

    await Like.create({
      userId,
      targetId,
      targetType,
    });

    const count = await Like.countDocuments({ targetId, targetType });

    return res.status(201).json({
      liked: true,
      count,
    });
  } catch (error) {
    console.error(`Error toggling like for ${targetType} ${targetId}:`, error);
    res.status(500).json({
      message: "Error toggling like status",
      error: error.message,
    });
  }
};

// TODO: 認証基盤が入ったら認証対応
export const getLikeStatus = async (req, res) => {
  const { userId } = req.query;
  const { targetId, targetType } = req.params;

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ message: "Invalid target ID format" });
  }

  try {
    const count = await Like.countDocuments({ targetId, targetType });

    let liked = false;
    if (userId) {
      const userLike = await Like.findOne({
        userId,
        targetId,
        targetType,
      });
      liked = !!userLike;
    }

    res.status(200).json({
      liked,
      count,
    });
  } catch (error) {
    console.error(
      `Error getting like status for ${targetType} ${targetId}:`,
      error
    );
    res.status(500).json({
      message: "Error getting like status",
      error: error.message,
    });
  }
};
