import express from 'express';
import { getTodayRevisions, updateRevision } from '../controllers/revisionController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/today', getTodayRevisions);
router.put('/:id', updateRevision);

export default router;
