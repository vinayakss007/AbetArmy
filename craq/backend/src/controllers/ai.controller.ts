import { Request, Response, NextFunction } from 'express';
import aiService from '../services/ai.service';

export class AIController {
  async categorize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description } = req.body;
      const result = await aiService.categorizeIssue(title, description);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async similarIssues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description } = req.body;
      const result = await aiService.suggestSimilarIssues(title, description);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async solutionDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
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
      const { comments } = req.body;
      const result = await aiService.summarizeThread(comments);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messages, stream, temperature, maxTokens } = req.body;

      if (stream) {
        // Server-Sent Events for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
          for await (const chunk of aiService.chatStream(messages, {
            temperature,
            maxTokens,
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

      const result = await aiService.chat(messages, { temperature, maxTokens });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AIController();
