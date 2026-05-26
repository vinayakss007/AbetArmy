import { Request, Response, NextFunction } from 'express';
import toolService from '../services/tool.service';

export class ToolController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tool = await toolService.create(req.body);
      res.status(201).json(tool);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, search } = req.query;
      const tools = await toolService.list(category as string | undefined, {
        search: search as string | undefined,
      });
      res.json(tools);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tool = await toolService.getById(req.params.id as string);
      res.json(tool);
    } catch (error) {
      next(error);
    }
  }

  async addReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { rating, content } = req.body;
      const review = await toolService.addReview(req.params.id as string, userId, rating, content || null);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await toolService.getReviews(req.params.id as string);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }
}

export default new ToolController();
