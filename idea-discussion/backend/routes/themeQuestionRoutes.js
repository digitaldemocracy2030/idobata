import express from "express";
import {
  getQuestionDetails,
  getQuestionsByTheme,
  triggerDigestGeneration,
  triggerPolicyGeneration,
  triggerReportGeneration,
} from "../controllers/questionController.js";

const router = express.Router({ mergeParams: true });

router.get("/", getQuestionsByTheme);

router.get("/:questionId/details", getQuestionDetails);

router.post("/:questionId/generate-policy", triggerPolicyGeneration);

router.post("/:questionId/generate-digest", triggerDigestGeneration);

router.post("/:questionId/generate-report", triggerReportGeneration);

export default router;
