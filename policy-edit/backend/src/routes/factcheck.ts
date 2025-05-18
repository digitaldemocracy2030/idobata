import express from "express";
import { createFactCheckUseCase } from "../services/factcheck/factcheckFactory.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prUrl, credential } = req.body;

    if (!prUrl || typeof prUrl !== "string") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PR_URL",
          message:
            "PRのURLが正しくありません。'https://github.com/owner/repo/pull/数字' の形式で指定してください。",
        },
      });
    }

    if (!credential || typeof credential !== "string") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIAL",
          message: "認証情報が正しくありません。",
        },
      });
    }

    const factCheckUseCase = createFactCheckUseCase();
    const result = await factCheckUseCase.execute({ prUrl, credential });

    return res.json(result);
  } catch (error) {
    logger.error("Error processing factcheck request:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "ファクトチェック処理中にエラーが発生しました。",
      },
    });
  }
});

export default router;
