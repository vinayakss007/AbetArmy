import http from 'http';
import app from './app';
import pool from './config/database';
import redisClient, { connectRedis } from './config/redis';
import { initializeWebSocket } from './websocket';
import { setupGracefulShutdown } from './utils/gracefulShutdown';
import { validateProductionConfig } from './config/production';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);

async function start(): Promise<void> {
  try {
    // Validate production configuration
    validateProductionConfig();

    // Test database connection
    await pool.query('SELECT 1');
    console.log('Database connected successfully');

    // Connect Redis
    await connectRedis();

    // Create HTTP server and attach WebSocket
    const server = http.createServer(app);
    initializeWebSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Setup graceful shutdown
    setupGracefulShutdown(server, pool, redisClient as any);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
