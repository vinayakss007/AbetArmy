import http from 'http';
import { Pool } from 'pg';
import { RedisClientType } from 'redis';
import logger from './logger';

const SHUTDOWN_TIMEOUT = 10000;

export function setupGracefulShutdown(
  server: http.Server,
  pool: Pool,
  redisClient: RedisClientType<any, any, any>
): void {
  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, 'Graceful shutdown starting');

    const forceExit = setTimeout(() => {
      logger.error('Shutdown timed out, forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);

    try {
      await new Promise<void>((resolve) => {
        server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });

      await pool.end();
      logger.info('Database pool closed');

      if (redisClient.isOpen) {
        await redisClient.quit();
        logger.info('Redis client disconnected');
      }

      clearTimeout(forceExit);
      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error({ error }, 'Error during shutdown');
      clearTimeout(forceExit);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
