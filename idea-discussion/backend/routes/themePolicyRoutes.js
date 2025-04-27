import express from 'express';
import { getPolicyDraftsByTheme } from '../controllers/policyController.js';

const router = express.Router({ mergeParams: true });

router.get('/', getPolicyDraftsByTheme);

export default router;
