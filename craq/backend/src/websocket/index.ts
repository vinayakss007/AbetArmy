import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types';
import notificationService from '../services/notification.service';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export function initializeWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  notificationService.setServer(wss);

  wss.on('connection', (ws: AuthenticatedSocket, req) => {
    // Authenticate via token in query string
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Authentication required');
      return;
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
      ws.userId = payload.userId;
      ws.isAlive = true;

      notificationService.addClient(payload.userId, ws);

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (data) => {
        // Handle ping/pong for keep-alive
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch {
          // Ignore invalid messages
        }
      });

      // Send connection confirmation
      ws.send(
        JSON.stringify({
          type: 'connected',
          payload: { userId: payload.userId },
        })
      );
    } catch {
      ws.close(4001, 'Invalid token');
    }
  });

  // Heartbeat interval to detect broken connections
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const socket = ws as AuthenticatedSocket;
      if (socket.isAlive === false) {
        socket.terminate();
        return;
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  return wss;
}

export default initializeWebSocket;
