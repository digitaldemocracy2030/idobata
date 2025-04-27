import express from 'express';
import { handleNewMessageByTheme, getThreadExtractionsByTheme, getThreadMessagesByTheme } from '../controllers/chatController.js';

const router = express.Router({ mergeParams: true });

router.post('/messages', handleNewMessageByTheme);

router.get('/threads/:threadId/extractions', getThreadExtractionsByTheme);

router.get('/threads/:threadId/messages', getThreadMessagesByTheme);

export default router;
