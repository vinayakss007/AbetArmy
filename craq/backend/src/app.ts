import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import issueRoutes from './routes/issue.routes';
import solutionRoutes from './routes/solution.routes';
import voteRoutes from './routes/vote.routes';
import commentRoutes from './routes/comment.routes';
import toolRoutes from './routes/tool.routes';
import userRoutes from './routes/user.routes';
import searchRoutes from './routes/search.routes';
import aiRoutes from './routes/ai.routes';
import uploadRoutes from './routes/upload.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { compressionMiddleware } from './middleware/compression';
import { requestLogger } from './middleware/requestLogger';
import pool from './config/database';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Request ID and compression
app.use(requestId);
app.use(compressionMiddleware);
app.use(requestLogger);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check - both paths for Docker Compose compatibility
const healthHandler = (_req: express.Request, res: express.Response) => {
  const { version } = require('../package.json');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pool: {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    },
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api', solutionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
