import express from 'express';
import { getAllQuestions, getQuestionDetails, triggerPolicyGeneration, triggerDigestGeneration } from '../controllers/questionController.js'; // Import the new controller

const router = express.Router();

// GET /api/questions - Fetch all sharp questions
router.get('/', getAllQuestions);

// GET /api/questions/:questionId/details - Fetch details for a specific question
router.get('/:questionId/details', getQuestionDetails);

// POST /api/questions/:questionId/generate-policy - Trigger policy draft generation
router.post('/:questionId/generate-policy', triggerPolicyGeneration);

// POST /api/questions/:questionId/generate-digest - Trigger digest draft generation
router.post('/:questionId/generate-digest', triggerDigestGeneration);

export default router;
