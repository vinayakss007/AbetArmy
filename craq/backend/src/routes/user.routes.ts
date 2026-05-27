import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    bio: z.string().optional(),
    industry: z.string().optional(),
    stage: z.string().optional(),
    skills: z.array(z.string()).optional(),
  }),
});

router.get('/search', userController.searchUsers);
router.get('/:id', userController.getProfile);
router.put('/:id', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.get('/:id/reputation', userController.getReputation);
router.get('/:id/activity', userController.getActivity);

export default router;
