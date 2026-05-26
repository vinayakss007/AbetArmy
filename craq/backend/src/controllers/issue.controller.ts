import { Request, Response, NextFunction } from 'express';
import issueService from '../services/issue.service';

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
      res.json(result);
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
      const issue = await issueService.update(req.params.id as string, req.body);
      res.json(issue);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await issueService.delete(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async solve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { solutionId } = req.body;
      const issue = await issueService.markSolved(req.params.id as string, solutionId);
      res.json(issue);
    } catch (error) {
      next(error);
    }
  }
}

export default new IssueController();
