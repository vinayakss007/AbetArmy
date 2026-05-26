import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getProfile(req.params.id as string);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateProfile(req.params.id as string, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async getReputation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reputation = await userService.getReputation(req.params.id as string);
      res.json(reputation);
    } catch (error) {
      next(error);
    }
  }

  async getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activity = await userService.getActivity(req.params.id as string);
      res.json(activity);
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = req.query;
      if (!q) {
        res.status(400).json({ error: 'Search query required' });
        return;
      }
      const users = await userService.searchUsers(q as string);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
