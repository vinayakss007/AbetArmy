import { Request, Response, NextFunction } from 'express';
import searchService from '../services/search.service';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, type, industry, tags, status } = req.query;

      if (!q) {
        res.status(400).json({ error: 'Search query (q) is required' });
        return;
      }

      const filters = {
        type: type as string | undefined,
        industry: industry as string | undefined,
        tags: tags ? (tags as string).split(',') : undefined,
        status: status as string | undefined,
      };

      const results = await searchService.search(q as string, filters);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }
}

export default new SearchController();
