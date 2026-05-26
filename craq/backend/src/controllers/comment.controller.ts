import { Request, Response, NextFunction } from 'express';
import commentService from '../services/comment.service';
import { createError } from '../middleware/errorHandler';

export class CommentController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { parentType, parentId, content } = req.body;
      const comment = await commentService.create(parentType, parentId, userId, content);
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async getByParent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentType = req.params.parentType as string;
      const parentId = req.params.parentId as string;
      const comments = await commentService.getByParent(parentType, parentId);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const comment = await commentService.getById(req.params.id as string);

      if (comment.author_id !== userId) {
        throw createError('You can only edit your own comments', 403, 'FORBIDDEN');
      }

      const { content } = req.body;
      const updated = await commentService.update(req.params.id as string, content);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const comment = await commentService.getById(req.params.id as string);

      if (comment.author_id !== userId) {
        throw createError('You can only delete your own comments', 403, 'FORBIDDEN');
      }

      await commentService.delete(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new CommentController();
