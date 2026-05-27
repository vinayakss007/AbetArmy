# Development Guide

## Prerequisites

- **Node.js 22+** (check with `node --version`)
- **Docker and Docker Compose** (for PostgreSQL, Redis, Meilisearch)
- **npm** (comes with Node.js)
- **Git**

## Local Setup

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd craq
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

The default `.env` values work for local development. No changes needed unless you want AI features (set at least one API key).

### 3. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Start Infrastructure Services

```bash
cd ..  # back to craq/
docker compose up postgres redis meilisearch -d
```

Wait for PostgreSQL to be healthy:

```bash
docker compose exec postgres pg_isready -U craq -d craq_db
```

### 5. Initialize Database

```bash
cd backend
npm run db:init
```

This runs the schema.sql file to create all tables and indexes.

### 6. Start Development Servers

In separate terminals:

```bash
# Terminal 1 - Backend (port 4000)
cd backend && npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend && npm run dev
```

### 7. Verify

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/health
- Meilisearch: http://localhost:7700

---

## Project Structure

```
craq/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis, AI provider configuration
│   │   ├── controllers/     # Request handlers (parse input, call service, send response)
│   │   ├── db/              # SQL schema and initialization script
│   │   ├── middleware/      # Auth, validation, error handling, logging
│   │   ├── routes/          # Route definitions with middleware bindings
│   │   ├── services/        # Business logic (database queries, orchestration)
│   │   ├── types/           # TypeScript interfaces and type definitions
│   │   ├── utils/           # Shared utilities (graceful shutdown, etc.)
│   │   ├── websocket/       # WebSocket server initialization and auth
│   │   ├── app.ts           # Express app setup (middleware, routes)
│   │   └── server.ts        # Server entry point (start, connect DB/Redis)
│   ├── tests/               # Jest test files
│   ├── Dockerfile           # Multi-stage production build
│   ├── jest.config.ts       # Jest configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages and layouts
│   │   ├── components/      # Reusable React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API client, utilities
│   │   ├── stores/          # Zustand state stores
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   ├── Dockerfile           # Multi-stage production build
│   └── package.json
├── docs/                    # Documentation (this directory)
├── scripts/                 # Operational scripts
├── docker-compose.yml       # Full-stack orchestration
└── .env.example             # Environment variable template
```

---

## Coding Standards

### TypeScript

- Strict mode enabled (`"strict": true` in tsconfig)
- Explicit return types on exported functions
- Use interfaces for data shapes, types for unions/intersections
- No `any` unless absolutely necessary (prefer `unknown`)

### Backend Patterns

**Service Layer Pattern:**

```typescript
// routes/example.routes.ts - Define routes and attach middleware
router.get('/', optionalAuth, controller.list);
router.post('/', authenticate, validate(createSchema), controller.create);

// controllers/example.controller.ts - Parse request, call service, format response
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await exampleService.create(req.body, req.userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// services/example.service.ts - Business logic and database queries
export class ExampleService {
  async create(data: CreateInput, userId: string) {
    const result = await pool.query(
      'INSERT INTO examples (id, user_id, title) VALUES ($1, $2, $3) RETURNING *',
      [uuidv4(), userId, data.title]
    );
    return result.rows[0];
  }
}
```

**Error Handling:**

```typescript
import { createError } from '../middleware/errorHandler';

// Throw structured errors - caught by errorHandler middleware
throw createError('Resource not found', 404, 'NOT_FOUND');
throw createError('Email already registered', 409, 'EMAIL_EXISTS');
```

**Input Validation:**

```typescript
import { z } from 'zod';
import { validate } from '../middleware/validate';

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(500),
    description: z.string().min(1),
    category: z.string().optional(),
  }),
});

router.post('/', authenticate, validate(createSchema), controller.create);
```

**Database Queries:**

```typescript
// Always use parameterized queries ($1, $2, etc.) - NEVER interpolate user input
const result = await pool.query(
  'SELECT * FROM issues WHERE category = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3',
  [category, status, limit]
);
```

### Frontend Patterns

- Next.js App Router with file-based routing
- Zustand for client-side state management
- Tailwind CSS for styling (utility-first)
- lucide-react for icons
- API calls through centralized `lib/api.ts` client

---

## Adding a New Feature

Follow this checklist when adding a new backend feature:

### 1. Define Types (if needed)

```typescript
// src/types/index.ts
export interface Widget {
  id: string;
  name: string;
  created_at: string;
}
```

### 2. Create Service

```typescript
// src/services/widget.service.ts
import pool from '../config/database';
import { createError } from '../middleware/errorHandler';

export class WidgetService {
  async list() { /* ... */ }
  async create(data: any, userId: string) { /* ... */ }
  async getById(id: string) { /* ... */ }
}

export default new WidgetService();
```

### 3. Create Controller

```typescript
// src/controllers/widget.controller.ts
import { Request, Response, NextFunction } from 'express';
import widgetService from '../services/widget.service';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const widgets = await widgetService.list();
    res.json(widgets);
  } catch (error) {
    next(error);
  }
};
```

### 4. Create Routes

```typescript
// src/routes/widget.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/widget.controller';

const router = Router();
router.get('/', controller.list);
router.post('/', authenticate, controller.create);

export default router;
```

### 5. Register Routes in app.ts

```typescript
import widgetRoutes from './routes/widget.routes';
app.use('/api/widgets', widgetRoutes);
```

### 6. Add Database Schema (if needed)

Add table definition to `src/db/schema.sql` and run `npm run db:init`.

### 7. Write Tests

See the testing section below.

---

## Testing

### How Tests Work

Backend tests use Jest with `ts-jest`. The database pool is mocked so tests run without a live PostgreSQL instance.

```typescript
// tests/widget.test.ts
import request from 'supertest';
import app from '../src/app';

// Mock the database pool
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  totalCount: 5,
  idleCount: 5,
  waitingCount: 0,
}));

const mockPool = require('../src/config/database');

describe('GET /api/widgets', () => {
  it('returns widget list', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: '1', name: 'Test Widget' }],
    });

    const response = await request(app).get('/api/widgets');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});
```

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npx jest tests/widget.test.ts

# Run with coverage
npx jest --coverage
```

### Writing New Tests

1. Create `tests/<feature>.test.ts`
2. Mock the database pool at the top
3. Mock any external services (Redis, AI providers)
4. Test each endpoint: success cases, validation errors, auth failures, edge cases
5. Use `beforeEach` to reset mocks: `jest.clearAllMocks()`

---

## Debugging

### Structured Logs

In development, logs are human-readable. In production, they are structured JSON (pino).

Key log fields:
- `reqId` - Request correlation ID (for tracing a request through the system)
- `method`, `url` - HTTP method and path
- `statusCode`, `responseTime` - Response details
- `userId` - Authenticated user (if applicable)

### Common Debugging Steps

1. Check backend logs: `docker compose logs -f backend`
2. Check database: `docker compose exec postgres psql -U craq -d craq_db`
3. Check Redis: `docker compose exec redis redis-cli`
4. Test an endpoint: `curl -v http://localhost:4000/api/health`

### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["src/server.ts"],
      "cwd": "${workspaceFolder}/backend",
      "env": { "NODE_ENV": "development" },
      "sourceMaps": true
    }
  ]
}
```

---

## Git Workflow

1. Create a feature branch: `git checkout -b feat/widget-system`
2. Make changes following the coding standards above
3. Run tests: `cd backend && npm test`
4. Run builds: `npm run build` in both backend/ and frontend/
5. Commit with type prefix: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
6. Push and open a pull request
7. Ensure CI passes before merging

### Commit Message Format

```
feat: add widget CRUD endpoints
fix: handle null avatar_url in user profile
chore: update dependencies
docs: add API documentation for votes
refactor: extract validation into shared middleware
```
