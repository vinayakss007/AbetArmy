import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: duration,
      requestId: req.requestId,
      userId: req.user?.userId,
    };

    if (res.statusCode >= 400) {
      logger.warn(logData, 'request completed');
    } else {
      logger.info(logData, 'request completed');
    }
  });

  next();
};
