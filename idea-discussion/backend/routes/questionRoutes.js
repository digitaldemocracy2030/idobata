import express from 'express';
import { getAllQuestions, getQuestionsByTheme, getQuestionDetails, triggerPolicyGeneration, triggerDigestGeneration } from '../controllers/questionController.js';

const router = express.Router();

// GET /api/questions - すべての質問を取得（非推奨）
router.get('/', getAllQuestions);

// GET /api/questions/theme/:themeId - 特定テーマの質問のみ取得
router.get('/theme/:themeId', getQuestionsByTheme);

// GET /api/questions/:questionId/details - 特定の質問の詳細を取得
router.get('/:questionId/details', getQuestionDetails);

// POST /api/questions/:questionId/generate-policy - ポリシードラフト生成
router.post('/:questionId/generate-policy', triggerPolicyGeneration);

// POST /api/questions/:questionId/generate-digest - ダイジェストドラフト生成
router.post('/:questionId/generate-digest', triggerDigestGeneration);

export default router;
