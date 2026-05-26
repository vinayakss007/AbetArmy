import { Router } from 'express';
import toolController from '../controllers/tool.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createToolSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    url: z.string().url().optional(),
    category: z.string().optional(),
    linked_issue_types: z.array(z.string()).optional(),
  }),
});

const addReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    content: z.string().optional(),
  }),
});

router.post('/', authenticate, validate(createToolSchema), toolController.create);
router.get('/', toolController.list);
router.get('/:id', toolController.getById);
router.post('/:id/reviews', authenticate, validate(addReviewSchema), toolController.addReview);
router.get('/:id/reviews', toolController.getReviews);

export default router;
