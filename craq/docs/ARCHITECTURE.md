# System Architecture

## Overview

Craq is a full-stack collaborative platform built with TypeScript across the entire stack. It uses a service-oriented backend architecture with real-time WebSocket capabilities, multi-provider AI integration, and a modern React frontend.

## System Diagram

```
+-------------------+         +-------------------+
|                   |         |                   |
|   Browser Client  | <-----> |  Next.js Frontend |
|   (React 18 SPA)  |  HTTP   |  (App Router SSR) |
|                   |         |  Port 3000        |
+-------------------+         +--------+----------+
                                       |
                              HTTP/REST | (NEXT_PUBLIC_API_URL)
                                       |
                              +--------v----------+
                              |                   |
                              |  Express API      |
                              |  Port 4000        |
                              |                   |
                              +--+----+----+---+--+
                                 |    |    |   |
                    +------------+    |    |   +-------------+
                    |                 |    |                  |
           +-------v-------+  +------v-+  +------v-------+  |
           |               |  |        |  |              |  |
           |  PostgreSQL   |  | Redis  |  | AI Providers |  |
           |  Port 5432    |  | 6379   |  | (Multiple)   |  |
           |               |  |        |  |              |  |
           +---------------+  +--------+  +--------------+  |
                                                            |
                                              +-------------v--+
                                              |                |
                                              |  WebSocket     |
                                              |  /ws           |
                                              |                |
                                              +----------------+
```

## Data Flow

### User Submits an Issue

1. Browser sends POST /api/issues with title, description, and optional metadata
2. Express validates the request body against a Zod schema (middleware/validate.ts)
3. Auth middleware extracts and verifies the JWT from the Authorization header
4. Issue controller calls issue.service.ts which runs INSERT via parameterized pool.query
5. Optionally, the AI categorization endpoint is called to auto-tag the issue
6. WebSocket broadcast notifies connected clients of the new issue
7. Response (201) returns the created issue object to the client

### AI Categorization Flow

1. Client sends POST /api/ai/categorize with {title, description}
2. AI service reads the configured providers from ai.config.ts
3. Providers are tried in fallback order (AI_FALLBACK_ORDER)
4. First successful provider response is returned with provider name
5. If all providers fail after retries, a 503 error is returned

### Voting Flow

1. User sends POST /api/votes with {targetType, targetId, value}
2. Service checks for existing vote (UNIQUE constraint on user_id + target_type + target_id)
3. Vote is inserted and target's upvotes/downvotes counter is updated
4. If a milestone is reached (e.g., 10, 50, 100 upvotes), a WebSocket notification fires

## Service Layer Architecture

The backend follows a strict layered pattern:

```
Routes (route definitions + middleware binding)
    |
    v
Controllers (request parsing, response formatting)
    |
    v
Services (business logic, orchestration)
    |
    v
Database Pool (pg Pool with parameterized queries)
```

### Routes Layer

- Define HTTP method and path
- Attach middleware: `authenticate`, `optionalAuth`, `validate(schema)`
- Delegate to controller functions

### Controllers Layer

- Extract parameters from req.params, req.body, req.query
- Call service methods
- Format and send HTTP responses
- Handle errors with try/catch and next()

### Services Layer

- Contain all business logic
- Execute database queries via the shared pool
- Throw errors using createError(message, statusCode, code)
- No direct access to req/res objects

### Database Layer

- Single shared pool from config/database.ts
- All queries use parameterized $1, $2 syntax for SQL injection prevention
- Connection pooling with configurable DB_POOL_SIZE (default: 20)

## WebSocket Notification System

### Connection

1. Client connects to `ws://host:4000/ws?token=<JWT_ACCESS_TOKEN>`
2. Server verifies the JWT token
3. On success, client is added to NotificationService's client map (keyed by userId)
4. Server sends `{type: "connected", payload: {userId}}` confirmation
5. Invalid/missing tokens result in close code 4001

### Heartbeat

- Server pings all clients every 30 seconds
- Clients that don't respond with pong are terminated
- Client-side can send `{type: "ping"}` and receive `{type: "pong"}`

### Event Types

| Event | Trigger | Target |
|-------|---------|--------|
| `new_solution` | Solution submitted to an issue | Issue author |
| `solution_accepted` | Solution marked as accepted | Solution author |
| `new_comment` | Comment posted on issue/solution | Parent author |
| `upvote_milestone` | Target reaches vote milestone | Target author |

### Targeted vs Broadcast

- Events with `targetUserIds` are sent only to those specific users
- Events without target IDs are broadcast to all connected clients

## Multi-Provider AI Gateway

### Architecture

The AI gateway supports multiple providers with automatic fallback:

```
Request -> AI Service -> Try Provider 1 -> Success? Return
                      |                 -> Fail? Try Provider 2
                      |                                      -> Fail? Try Provider 3
                      |                                                           -> All fail? 503
```

### Provider Configuration

Providers are auto-discovered from environment variables in `ai.config.ts`:

| Provider | Detection | Default Model |
|----------|-----------|---------------|
| OpenAI | OPENAI_API_KEY set | gpt-4o-mini |
| Anthropic | ANTHROPIC_API_KEY set | claude-3-haiku-20240307 |
| Groq | GROQ_API_KEY set | llama-3.1-70b-versatile |
| Ollama | OLLAMA_BASE_URL set | llama3 |
| Custom | AI_COMPATIBLE_API_KEY set | configurable |

### Fallback Chain

Default order: openai > anthropic > groq > ollama > custom

Override with: `AI_FALLBACK_ORDER=anthropic,openai,groq,ollama`

### Retry Logic

- Each provider is tried up to `AI_MAX_RETRIES` times (default: 2)
- Timeout per request: `AI_TIMEOUT` ms (default: 30000)
- On failure, the next provider in the fallback order is attempted

### Streaming Support

The `/api/ai/chat` endpoint supports streaming responses via Server-Sent Events when `stream: true` is passed in the request body.

## Authentication Flow

### Registration

1. POST /api/auth/register with {email, password, name}
2. Check email uniqueness
3. Hash password with bcrypt (12 rounds)
4. Insert user record
5. Generate JWT access token (expires in JWT_EXPIRES_IN, default 1h)
6. Generate JWT refresh token (expires in JWT_REFRESH_EXPIRES_IN, default 7d)
7. Return user profile + both tokens

### Login

1. POST /api/auth/login with {email, password}
2. Look up user by email
3. Compare password with bcrypt
4. Generate new token pair
5. Return user profile + tokens

### Token Refresh

1. POST /api/auth/refresh with {token: refreshToken}
2. Verify refresh token signature
3. Look up user
4. Generate new token pair (both access and refresh)
5. Old refresh token is implicitly invalidated by rotation

### Google OAuth

1. GET /api/auth/google redirects to Google consent screen
2. Google redirects back to /api/auth/google/callback
3. If google_id matches existing user, log them in
4. If email matches but no google_id, link the Google account
5. Otherwise, create a new user
6. Return tokens via redirect to frontend

### Token Verification (Middleware)

- `authenticate`: requires valid JWT in Authorization: Bearer header, attaches userId to req
- `optionalAuth`: same as authenticate but does not reject if token is missing

## Database Schema Overview

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| users | User accounts | id, email, password_hash, name, google_id, reputation_score |
| issues | Business problems | id, author_id, title, description, category, status, upvotes |
| solutions | Proposed solutions | id, issue_id, author_id, content, is_accepted, upvotes |
| comments | Threaded comments | id, parent_type, parent_id, author_id, content |
| votes | Up/downvotes | id, user_id, target_type, target_id, value (-1 or 1) |
| tools | Business tools directory | id, name, description, url, category |
| tool_reviews | Tool ratings | id, tool_id, user_id, rating (1-5), content |
| tags | Tag definitions | id, name, type |
| issue_tags | Issue-tag junction | issue_id, tag_id |

### Key Relationships

- issues.author_id -> users.id (CASCADE)
- solutions.issue_id -> issues.id (CASCADE)
- solutions.author_id -> users.id (CASCADE)
- issues.accepted_solution_id -> solutions.id (SET NULL)
- comments.author_id -> users.id (CASCADE)
- votes.user_id -> users.id (CASCADE)
- tool_reviews.tool_id -> tools.id (CASCADE)
- issue_tags -> issues.id, tags.id (CASCADE)

### Indexes

Performance indexes on: issues(author_id, status, category, industry, created_at), solutions(issue_id, author_id), comments(parent_type+parent_id), votes(target_type+target_id), users(email, google_id).

## Technology Choices

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Runtime | Node.js 22 | Latest LTS, native TypeScript support improvements |
| Backend Framework | Express | Mature, minimal, large middleware ecosystem |
| Frontend Framework | Next.js 14 | App Router SSR/SSG, React Server Components, file-based routing |
| Language | TypeScript (strict) | Type safety across full stack, better DX |
| Database | PostgreSQL 16 | ACID compliance, JSON support, full-text search, mature |
| Cache | Redis 7 | Sub-ms latency, pub/sub capable, session store |
| Search | Meilisearch | Typo-tolerant, fast indexing (provisioned, not yet connected) |
| AI | Multi-provider | Vendor independence, cost optimization, fallback resilience |
| Auth | JWT + Google OAuth | Stateless auth for horizontal scaling, social login convenience |
| Real-time | WebSocket (ws) | Low-latency bidirectional, native Node.js support |
| Validation | Zod | Runtime type checking matching TypeScript types |
| State (FE) | Zustand | Minimal boilerplate, TypeScript-first, no providers |
| Styling | Tailwind CSS | Utility-first, no CSS-in-JS runtime cost |
| Testing | Jest | Standard, good mocking, ts-jest integration |
| Containerization | Docker + Compose | Reproducible environments, single-command deployment |
| Logging | pino (structured) | High-performance JSON logging for production |
