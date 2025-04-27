import express from 'express';
import { triggerQuestionGenerationByTheme } from '../controllers/adminController.js';

const router = express.Router({ mergeParams: true });

router.post('/', triggerQuestionGenerationByTheme);

export default router;
