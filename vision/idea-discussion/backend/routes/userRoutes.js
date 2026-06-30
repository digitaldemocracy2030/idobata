import express from "express";
import {
  getUserInfo,
  updateUserDisplayName,
  uploadProfileImage,
} from "../controllers/userController.js";
import { logRequest, upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/:userId", getUserInfo);

router.put("/:userId", updateUserDisplayName);

router.post(
  "/:userId/profile-image",
  logRequest,
  upload.single("profileImage"),
  uploadProfileImage
);

export default router;
