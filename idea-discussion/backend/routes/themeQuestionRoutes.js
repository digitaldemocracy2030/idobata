import express from "express";
import {
  getQuestionDetails,
  getQuestionsByTheme,
  getVisualReport,
  triggerDigestGeneration,
  triggerPolicyGeneration,
  triggerReportGeneration,
  triggerVisualReportGeneration,
} from "../controllers/questionController.js";

const router = express.Router({ mergeParams: true });

router.get("/", getQuestionsByTheme);

router.get("/:questionId/details", getQuestionDetails);

router.post("/:questionId/generate-policy", triggerPolicyGeneration);

router.post("/:questionId/generate-digest", triggerDigestGeneration);

router.post(
  "/:questionId/generate-visual-report",
  triggerVisualReportGeneration
);
router.post("/:questionId/generate-report", triggerReportGeneration);

router.get("/:questionId/visual-report", getVisualReport);

export default router;
