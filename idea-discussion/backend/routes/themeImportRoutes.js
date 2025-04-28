import express from 'express';
import { importGenericDataByTheme } from '../controllers/importController.js';

const router = express.Router({ mergeParams: true });

router.post('/generic', importGenericDataByTheme);

export default router;
