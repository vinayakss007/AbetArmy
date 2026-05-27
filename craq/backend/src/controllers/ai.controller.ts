import { Request, Response, NextFunction } from 'express';
import aiService from '../services/ai.service';
import { createError } from '../middleware/errorHandler';

// Per-user rate limiting for AI chat endpoints
const userRequestCounts = new Map<string, { count: number; resetAt: number }>();
const AI_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AI_RATE_LIMIT_MAX_REQUESTS = 20; // 20 AI requests per 15 min per user

// Maximum tokens cap to prevent cost overruns
const MAX_TOKENS_CAP = 4096;

function checkAIRateLimit(userId: string): void {
  const now = Date.now();
  const entry = userRequestCounts.get(userId);

  if (!entry || now > entry.resetAt) {
    userRequestCounts.set(userId, { count: 1, resetAt: now + AI_RATE_LIMIT_WINDOW_MS });
    return;
  }

  if (entry.count >= AI_RATE_LIMIT_MAX_REQUESTS) {
    throw createError(
      'AI rate limit exceeded. Please try again later.',
      429,
      'AI_RATE_LIMIT_EXCEEDED'
    );
  }

  entry.count++;
}

export class AIController {
  async categorize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      checkAIRateLimit(req.user!.userId);
      const { title, description } = req.body;
      const result = await aiService.categorizeIssue(title, description);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async similarIssues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      checkAIRateLimit(req.user!.userId);
      const { title, description } = req.body;
      const result = await aiService.suggestSimilarIssues(title, description);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async solutionDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      checkAIRateLimit(req.user!.userId);
      const { title, description, category } = req.body;
      const result = await aiService.generateSolutionDraft({
        title,
        description,
        category,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async summarize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      checkAIRateLimit(req.user!.userId);
      const { comments } = req.body;
      const result = await aiService.summarizeThread(comments);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      checkAIRateLimit(req.user!.userId);

      const { messages, stream, temperature, maxTokens } = req.body;

      // Strip user-supplied system messages to prevent prompt injection.
      // The platform controls the system prompt for the AI assistant.
      const sanitizedMessages = messages.filter(
        (m: { role: string }) => m.role !== 'system'
      );

      // Enforce maxTokens cap to prevent cost overruns
      const cappedMaxTokens = maxTokens
        ? Math.min(maxTokens, MAX_TOKENS_CAP)
        : MAX_TOKENS_CAP;

      if (stream) {
        // Server-Sent Events for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
          for await (const chunk of aiService.chatStream(sanitizedMessages, {
            temperature,
            maxTokens: cappedMaxTokens,
          })) {
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          }
          res.write('data: [DONE]\n\n');
          res.end();
        } catch (error) {
          res.write(
            `data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`
          );
          res.end();
        }
        return;
      }

      const result = await aiService.chat(sanitizedMessages, {
        temperature,
        maxTokens: cappedMaxTokens,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AIController();
