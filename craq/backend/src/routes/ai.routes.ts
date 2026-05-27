import { Router } from 'express';
import aiController from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const categorizeSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});

const similarIssuesSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});

const solutionDraftSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.string().optional(),
  }),
});

const summarizeSchema = z.object({
  body: z.object({
    comments: z.array(z.string().max(5000)).min(1).max(100),
  }),
});

const chatSchema = z.object({
  body: z.object({
    messages: z.array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string().max(10000),
      })
    ).min(1).max(50),
    stream: z.boolean().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(4096).optional(),
  }),
});

router.post('/categorize', authenticate, validate(categorizeSchema), aiController.categorize);
router.post('/similar-issues', authenticate, validate(similarIssuesSchema), aiController.similarIssues);
router.post('/solution-draft', authenticate, validate(solutionDraftSchema), aiController.solutionDraft);
router.post('/summarize', authenticate, validate(summarizeSchema), aiController.summarize);
router.post('/chat', authenticate, validate(chatSchema), aiController.chat);

export default router;
