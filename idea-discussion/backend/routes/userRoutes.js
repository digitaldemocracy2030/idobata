import express from "express";
import { getUserInfo, updateUserDisplayName } from "../controllers/userController.js";

const router = express.Router();

router.get('/:userId', getUserInfo);

router.put('/:userId', updateUserDisplayName);

export default router;
