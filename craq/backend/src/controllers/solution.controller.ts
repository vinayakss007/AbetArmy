import { Request, Response, NextFunction } from 'express';
import solutionService from '../services/solution.service';

export class SolutionController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const issueId = req.params.issueId as string;
      const solution = await solutionService.create(issueId, userId, req.body);
      res.status(201).json(solution);
    } catch (error) {
      next(error);
    }
  }

  async getByIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const issueId = req.params.issueId as string;
      const solutions = await solutionService.getByIssue(issueId);
      res.json(solutions);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const solution = await solutionService.update(req.params.id as string, req.body);
      res.json(solution);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await solutionService.delete(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { issueId } = req.body;
      const solution = await solutionService.accept(req.params.id as string, issueId);
      res.json(solution);
    } catch (error) {
      next(error);
    }
  }
}

export default new SolutionController();
