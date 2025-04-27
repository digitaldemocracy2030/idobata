import express from 'express';
import { getDigestDraftsByTheme } from '../controllers/digestController.js';

const router = express.Router({ mergeParams: true });

router.get('/', getDigestDraftsByTheme);

export default router;
