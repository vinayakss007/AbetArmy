import http from 'http';
import app from './app';
import pool from './config/database';
import { initializeWebSocket } from './websocket';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);

async function start(): Promise<void> {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('Database connected successfully');

    // Create HTTP server and attach WebSocket
    const server = http.createServer(app);
    initializeWebSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
