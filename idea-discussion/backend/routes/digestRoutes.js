import express from 'express';
import { getDigestDrafts } from '../controllers/digestController.js';

const router = express.Router();

router.get('/', getDigestDrafts);


export default router;
