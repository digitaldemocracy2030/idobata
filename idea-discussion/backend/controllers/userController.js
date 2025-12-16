import path from "node:path";
import User from "../models/User.js";
import { createStorageService } from "../services/storage/storageServiceFactory.js";
import { generateRandomDisplayName } from "../utils/displayNameGenerator.js";

const storageService = createStorageService("local", {
  baseUrl: process.env.API_BASE_URL || "http://localhost:3000",
});

// Default avatars served statically by the frontend (Vite public/ directory)
// Place six images under: frontend/public/images/avatars/
// Example names: avatar1.png ... avatar6.png (extensions can vary)
const DEFAULT_AVATARS = [
  "/images/avatars/avatar1.png",
  "/images/avatars/avatar2.png",
  "/images/avatars/avatar3.png",
  "/images/avatars/avatar4.png",
  "/images/avatars/avatar5.png",
  "/images/avatars/avatar6.png",
];

function pickRandomDefaultAvatar() {
  const idx = Math.floor(Math.random() * DEFAULT_AVATARS.length);
  return DEFAULT_AVATARS[idx];
}

const inMemoryUsers = new Map();

/**
 * Get user from database or in-memory store
 * @param {string} userId - User ID
 * @returns {Object} User object
 */
export const getUser = async (userId) => {
  try {
    let user = await User.findOne({ userId });
    if (user) return user;

    const defaultDisplayName = generateRandomDisplayName();
    user = new User({
      userId,
      displayName: defaultDisplayName,
      // Store a frontend-served static path for default avatars
      profileImagePath: pickRandomDefaultAvatar(),
    });
    await user.save();
    return user;
  } catch (error) {
    console.warn("MongoDB not available, using in-memory store");
  }

  if (!inMemoryUsers.has(userId)) {
    const defaultDisplayName = generateRandomDisplayName();
    inMemoryUsers.set(userId, {
      userId,
      displayName: defaultDisplayName,
      profileImagePath: pickRandomDefaultAvatar(),
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

    // Resolve profile image URL correctly for both uploaded files and static frontend assets
    const resolveProfileImageUrl = (value) => {
      if (!value) return null;
      // Already a full URL
      if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"))) {
        return value;
      }
      // Static asset served by frontend (e.g., /images/avatars/xxx.png)
      if (typeof value === "string" && value.startsWith("/images/")) {
        return value;
      }
      // Fallback to uploaded-file URL (served by backend /uploads)
      return storageService.getFileUrl(value);
    };

    return res.status(200).json({
      displayName: user.displayName,
      profileImagePath: resolveProfileImageUrl(user.profileImagePath),
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

    // Only delete previous file if it was an uploaded file managed by this server
    const uploadsDir = path.join(process.cwd(), "uploads/profile-images");
    if (
      user.profileImagePath &&
      typeof user.profileImagePath === "string" &&
      user.profileImagePath.startsWith(uploadsDir)
    ) {
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
