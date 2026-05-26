import { Router } from 'express';
import solutionController from '../controllers/solution.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createSolutionSchema = z.object({
  body: z.object({
    content: z.string().min(1),
    images: z.array(z.string()).optional(),
  }),
});

const acceptSolutionSchema = z.object({
  body: z.object({
    issueId: z.string().uuid(),
  }),
});

// Nested under /issues/:issueId/solutions
router.post('/issues/:issueId/solutions', authenticate, validate(createSolutionSchema), solutionController.create);
router.get('/issues/:issueId/solutions', optionalAuth, solutionController.getByIssue);

// Direct solution routes
router.put('/solutions/:id', authenticate, solutionController.update);
router.delete('/solutions/:id', authenticate, solutionController.delete);
router.post('/solutions/:id/accept', authenticate, validate(acceptSolutionSchema), solutionController.accept);

export default router;
