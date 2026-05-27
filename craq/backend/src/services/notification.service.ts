import { WebSocketServer, WebSocket } from 'ws';

export interface NotificationEvent {
  type: string;
  payload: Record<string, unknown>;
  targetUserIds?: string[];
}

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
}

export class NotificationService {
  private clients: Map<string, ConnectedClient[]> = new Map();
  private wss: WebSocketServer | null = null;

  setServer(wss: WebSocketServer): void {
    this.wss = wss;
  }

  addClient(userId: string, ws: WebSocket): void {
    const existing = this.clients.get(userId) || [];
    existing.push({ ws, userId });
    this.clients.set(userId, existing);

    ws.on('close', () => {
      this.removeClient(userId, ws);
    });
  }

  removeClient(userId: string, ws: WebSocket): void {
    const existing = this.clients.get(userId) || [];
    const filtered = existing.filter((c) => c.ws !== ws);
    if (filtered.length === 0) {
      this.clients.delete(userId);
    } else {
      this.clients.set(userId, filtered);
    }
  }

  broadcast(event: NotificationEvent): void {
    const message = JSON.stringify(event);

    if (event.targetUserIds && event.targetUserIds.length > 0) {
      // Send to specific users
      for (const userId of event.targetUserIds) {
        const clients = this.clients.get(userId) || [];
        for (const client of clients) {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(message);
          }
        }
      }
    } else {
      // Broadcast to all connected clients
      if (this.wss) {
        this.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
    }
  }

  notifyNewSolution(issueAuthorId: string, issueId: string, solutionId: string): void {
    this.broadcast({
      type: 'new_solution',
      payload: { issueId, solutionId },
      targetUserIds: [issueAuthorId],
    });
  }

  notifySolutionAccepted(solutionAuthorId: string, issueId: string, solutionId: string): void {
    this.broadcast({
      type: 'solution_accepted',
      payload: { issueId, solutionId },
      targetUserIds: [solutionAuthorId],
    });
  }

  notifyNewComment(targetUserId: string, parentType: string, parentId: string, commentId: string): void {
    this.broadcast({
      type: 'new_comment',
      payload: { parentType, parentId, commentId },
      targetUserIds: [targetUserId],
    });
  }

  notifyUpvoteMilestone(userId: string, targetType: string, targetId: string, milestone: number): void {
    this.broadcast({
      type: 'upvote_milestone',
      payload: { targetType, targetId, milestone },
      targetUserIds: [userId],
    });
  }
}

export default new NotificationService();
