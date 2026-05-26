import { Request, Response, NextFunction } from 'express';
import uploadService from '../services/upload.service';

export class UploadController {
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const result = await uploadService.uploadImage({
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = req.params.key as string;
      await uploadService.deleteImage(key);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();
