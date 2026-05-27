import { Request, Response, NextFunction } from 'express';
import issueService from '../services/issue.service';
import { createError } from '../middleware/errorHandler';

export class IssueController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const issue = await issueService.create(userId, req.body);
      res.status(201).json(issue);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, industry, stage, type, status, tags, trending, recent, page, limit } = req.query;

      const filters = {
        category: category as string | undefined,
        industry: industry as string | undefined,
        stage: stage as string | undefined,
        type: type as string | undefined,
        status: status as string | undefined,
        tags: tags ? (tags as string).split(',') : undefined,
        trending: trending === 'true',
        recent: recent === 'true',
      };

      const pagination = {
        page: parseInt(page as string, 10) || 1,
        limit: Math.min(parseInt(limit as string, 10) || 20, 100),
      };

      const result = await issueService.list(filters, pagination);
      res.json({
        issues: result.issues,
        total: result.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(result.total / pagination.limit),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const issue = await issueService.getById(req.params.id as string);
      res.json(issue);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const issue = await issueService.getById(req.params.id as string);

      if (issue.author_id !== userId) {
        throw createError('You can only edit your own issues', 403, 'FORBIDDEN');
      }

      const updated = await issueService.update(req.params.id as string, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const issue = await issueService.getById(req.params.id as string);

      if (issue.author_id !== userId) {
        throw createError('You can only delete your own issues', 403, 'FORBIDDEN');
      }

      await issueService.delete(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async solve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const issue = await issueService.getById(req.params.id as string);

      if (issue.author_id !== userId) {
        throw createError('Only the issue author can mark it as solved', 403, 'FORBIDDEN');
      }

      const { solutionId } = req.body;
      const updated = await issueService.markSolved(req.params.id as string, solutionId);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
}

export default new IssueController();
