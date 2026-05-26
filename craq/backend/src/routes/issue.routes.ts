import { Router } from 'express';
import issueController from '../controllers/issue.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createIssueSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(500),
    description: z.string().min(1),
    images: z.array(z.string()).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    industry: z.string().optional(),
    stage: z.string().optional(),
    type: z.string().optional(),
  }),
});

const solveSchema = z.object({
  body: z.object({
    solutionId: z.string().uuid(),
  }),
});

router.post('/', authenticate, validate(createIssueSchema), issueController.create);
router.get('/', optionalAuth, issueController.list);
router.get('/:id', optionalAuth, issueController.getById);
router.put('/:id', authenticate, issueController.update);
router.delete('/:id', authenticate, issueController.delete);
router.post('/:id/solve', authenticate, validate(solveSchema), issueController.solve);

export default router;
