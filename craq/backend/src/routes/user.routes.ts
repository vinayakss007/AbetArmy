import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/search', userController.searchUsers);
router.get('/:id', userController.getProfile);
router.put('/:id', authenticate, userController.updateProfile);
router.get('/:id/reputation', userController.getReputation);
router.get('/:id/activity', userController.getActivity);

export default router;
