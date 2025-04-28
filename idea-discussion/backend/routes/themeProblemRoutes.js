import express from 'express';
import { getProblemsByTheme } from '../controllers/adminController.js';

const router = express.Router({ mergeParams: true });

router.get('/', getProblemsByTheme);

export default router;
