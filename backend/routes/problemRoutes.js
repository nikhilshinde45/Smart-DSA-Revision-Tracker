import express from 'express';
import {
  addProblem,
  getProblems,
  getProblem,
  deleteProblem,
  toggleBookmark,
} from '../controllers/problemController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes are protected

router.route('/').post(addProblem).get(getProblems);
router.route('/:id').get(getProblem).delete(deleteProblem);
router.put('/:id/bookmark', toggleBookmark);

export default router;
