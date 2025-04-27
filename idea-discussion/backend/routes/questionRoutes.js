import express from 'express';
import { getAllQuestions } from '../controllers/questionController.js';

const router = express.Router();

// GET /api/questions - すべての質問を取得（非推奨 - 削除予定）
router.get('/', getAllQuestions);


export default router;
