import { Router } from 'express';
import voteController from '../controllers/vote.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const voteSchema = z.object({
  body: z.object({
    targetType: z.enum(['issue', 'solution']),
    targetId: z.string().uuid(),
    value: z.number().refine((v) => v === 1 || v === -1),
  }),
});

router.post('/', authenticate, validate(voteSchema), voteController.vote);
router.get('/:targetType/:targetId', voteController.getVotes);

export default router;
