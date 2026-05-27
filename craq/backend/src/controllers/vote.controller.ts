import { Request, Response, NextFunction } from 'express';
import voteService from '../services/vote.service';

export class VoteController {
  async vote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { targetType, targetId, value } = req.body;
      const result = await voteService.vote(userId, targetType, targetId, value);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getVotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetType = req.params.targetType as string;
      const targetId = req.params.targetId as string;
      const votes = await voteService.getVotes(targetType, targetId);
      res.json(votes);
    } catch (error) {
      next(error);
    }
  }
}

export default new VoteController();
