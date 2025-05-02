import path from "node:path";
import User from "../models/User.js";
import { createStorageService } from "../services/storage/storageServiceFactory.js";

const storageService = createStorageService("local", {
  baseUrl: process.env.API_BASE_URL || "http://localhost:3001",
});

/**
 * Get user information by userId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    let user = await User.findOne({ userId });

    if (!user) {
      user = new User({ userId });
      await user.save();
    }

    return res.status(200).json({
      displayName: user.displayName,
      profileImagePath: user.profileImagePath
        ? storageService.getFileUrl(user.profileImagePath)
        : null,
    });
  } catch (error) {
    console.error("Error getting user info:", error);
    return res.status(500).json({
      error: "Failed to get user information",
    });
  }
};

/**
 * Update user display name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUserDisplayName = async (req, res) => {
  try {
    const { userId } = req.params;
    const { displayName } = req.body;

    if (!displayName) {
      return res.status(400).json({
        error: "Display name is required",
      });
    }

    let user = await User.findOne({ userId });

    if (!user) {
      user = new User({ userId, displayName });
    } else {
      user.displayName = displayName;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Display name updated successfully",
    });
  } catch (error) {
    console.error("Error updating display name:", error);
    return res.status(500).json({
      error: "Failed to update display name",
    });
  }
};

/**
 * Upload profile image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadProfileImage = async (req, res) => {
  try {
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    let user = await User.findOne({ userId });

    if (!user) {
      user = new User({ userId });
    }

    if (user.profileImagePath) {
      await storageService.deleteFile(user.profileImagePath);
    }

    const uploadDir = path.join(process.cwd(), "uploads/profile-images");
    const filePath = await storageService.saveFile(file, uploadDir);

    user.profileImagePath = filePath;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImageUrl: storageService.getFileUrl(filePath),
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return res.status(500).json({
      error: "Failed to upload profile image",
    });
  }
};
