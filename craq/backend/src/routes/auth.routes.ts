import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1).max(255),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.get('/me', authenticate, authController.me);

// TODO(MVP): Google OAuth is a stub. To enable, install passport + passport-google-oauth20,
// configure the strategy with GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET, and replace this
// handler with passport.authenticate('google', { scope: ['profile', 'email'] }).
router.get('/google', (_req, res) => {
  res.status(501).json({ message: 'Google OAuth not yet configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' });
});

router.get('/google/callback', authController.googleCallback);

export default router;
