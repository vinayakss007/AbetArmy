import { Router } from 'express';
import commentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

export const createCommentSchema = z.object({
  body: z.object({
    parentType: z.enum(['issue', 'solution', 'comment']),
    parentId: z.string().uuid(),
    content: z.string().min(1),
  }),
});

const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1),
  }),
});

router.post('/', authenticate, validate(createCommentSchema), commentController.create);
router.get('/:parentType/:parentId', commentController.getByParent);
router.put('/:id', authenticate, validate(updateCommentSchema), commentController.update);
router.delete('/:id', authenticate, commentController.delete);

export default router;
