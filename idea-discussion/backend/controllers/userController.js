import path from "node:path";
import User from "../models/User.js";
import { createStorageService } from "../services/storage/storageServiceFactory.js";

const storageService = createStorageService("local", {
  baseUrl: process.env.API_BASE_URL || "http://localhost:3000",
});

const inMemoryUsers = new Map();

/**
 * Get user from database or in-memory store
 * @param {string} userId - User ID
 * @returns {Object} User object
 */
const getUser = async (userId) => {
  try {
    const user = await User.findOne({ userId });
    if (user) return user;
  } catch (error) {
    console.warn("MongoDB not available, using in-memory store");
  }

  if (!inMemoryUsers.has(userId)) {
    inMemoryUsers.set(userId, {
      userId,
      displayName: null,
      profileImagePath: null,
    });
  }
  
  return inMemoryUsers.get(userId);
};

/**
 * Save user to database or in-memory store
 * @param {Object} user - User object
 */
const saveUser = async (user) => {
  try {
    if (user.save) {
      await user.save();
      return;
    }
  } catch (error) {
    console.warn("MongoDB not available, using in-memory store");
  }

  inMemoryUsers.set(user.userId, user);
};

/**
 * Get user information by userId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await getUser(userId);

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

    const user = await getUser(userId);
    user.displayName = displayName;
    await saveUser(user);

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
    console.log("Upload request:", {
      params: req.params,
      file: req.file,
      body: req.body,
    });

    if (!file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const user = await getUser(userId);

    if (user.profileImagePath) {
      await storageService.deleteFile(user.profileImagePath);
    }

    const uploadDir = path.join(process.cwd(), "uploads/profile-images");
    const filePath = await storageService.saveFile(file, uploadDir);

    user.profileImagePath = filePath;
    await saveUser(user);

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
