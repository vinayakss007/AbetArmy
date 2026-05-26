# Craq

> Crack any business problem

Craq is a full-stack collaborative platform for identifying, discussing, and solving business problems. It combines community-driven issue tracking with AI-powered solution generation to help teams break through challenges.

## Features

- **Issue Tracking** - Create, categorize, and track business problems with rich descriptions
- **Solution Proposals** - Submit and discuss potential solutions to problems
- **AI-Powered Assistance** - Multi-provider AI gateway for categorization, solution drafting, summarization, and chat
- **Voting System** - Community-driven prioritization through upvotes/downvotes
- **Real-time Updates** - WebSocket notifications for live collaboration
- **Full-text Search** - Powered by Meilisearch for fast, relevant results
- **User Profiles** - Track contributions, reputation, and expertise
- **File Uploads** - Attach supporting documents and images
- **Google OAuth** - Simple sign-in alongside email/password authentication
- **Business Tools Directory** - Curated collection of tools organized by category

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend | Express.js, TypeScript, Node.js 22 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Search | Meilisearch |
| AI | OpenAI, Anthropic, Groq, Ollama (multi-provider) |
| Auth | JWT + Google OAuth 2.0 (Passport.js) |
| Real-time | WebSocket (ws) |

## Project Structure

```
craq/
├── backend/                # Express API server
│   ├── src/
│   │   ├── config/         # Database, Redis, AI configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── db/             # Schema and initialization
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript type definitions
│   │   ├── websocket/      # WebSocket server
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── tests/              # Jest test files
│   ├── Dockerfile          # Multi-stage Docker build
│   └── package.json
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API client
│   │   ├── store/          # Zustand state management
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   ├── Dockerfile          # Multi-stage Docker build
│   └── package.json
├── docker-compose.yml      # Full-stack orchestration
├── .env.example            # Environment variable template
└── README.md               # This file
```

## Quick Start with Docker Compose

1. **Clone the repository and navigate to the project:**
   ```bash
   cd craq
   ```

2. **Create your environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env`** with your configuration (at minimum, set `JWT_SECRET` and `JWT_REFRESH_SECRET` for production).

4. **Start all services:**
   ```bash
   docker compose up --build
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Meilisearch Dashboard: http://localhost:7700

6. **Stop all services:**
   ```bash
   docker compose down
   ```

## Local Development Setup

### Prerequisites

- Node.js 22+
- Docker and Docker Compose (for PostgreSQL, Redis, Meilisearch)

### Start Infrastructure Services

```bash
cd craq
docker compose up postgres redis meilisearch -d
```

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run build
npm run db:init    # Initialize database schema
npm run dev        # Start with hot reload on port 4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # Start on port 3000
```

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Environment Variables

See [`.env.example`](.env.example) for a complete list. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `4000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_USER` / `DB_PASSWORD` | Database credentials | `craq` / `craq_password` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for signing access tokens | (change in production) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | (optional) |
| `MEILI_HOST` | Meilisearch URL | `http://localhost:7700` |
| `OPENAI_API_KEY` | OpenAI API key | (optional) |
| `ANTHROPIC_API_KEY` | Anthropic API key | (optional) |
| `GROQ_API_KEY` | Groq API key | (optional) |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `NEXT_PUBLIC_API_URL` | API URL for frontend | `http://localhost:4000` |

## API Documentation

All API endpoints are prefixed with `/api`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |

### Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/issues` | List all issues |
| POST | `/api/issues` | Create new issue |
| GET | `/api/issues/:id` | Get issue details |
| PUT | `/api/issues/:id` | Update issue |
| DELETE | `/api/issues/:id` | Delete issue |

### Solutions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/solutions/issue/:issueId` | List solutions for an issue |
| POST | `/api/solutions` | Submit a solution |
| PUT | `/api/solutions/:id` | Update a solution |
| DELETE | `/api/solutions/:id` | Delete a solution |

### Votes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/votes` | Cast a vote |
| DELETE | `/api/votes/:id` | Remove a vote |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/issue/:issueId` | List comments |
| POST | `/api/comments` | Add a comment |
| DELETE | `/api/comments/:id` | Delete a comment |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/categorize` | Auto-categorize an issue |
| POST | `/api/ai/similar-issues` | Find similar issues |
| POST | `/api/ai/solution-draft` | Generate solution draft |
| POST | `/api/ai/summarize` | Summarize comments |
| POST | `/api/ai/chat` | General AI chat |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Full-text search |

### Tools
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tools` | List business tools |
| POST | `/api/tools` | Add a tool |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update profile |

### Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload a file |

## AI Configuration Guide

Craq supports multiple AI providers with automatic fallback. Configure one or more providers to enable AI features.

### OpenAI

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Set in `.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Optional: customize the model with `OPENAI_MODEL` (default: `gpt-4o-mini`)

### Anthropic

1. Get an API key from [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Set in `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Optional: customize the model with `ANTHROPIC_MODEL` (default: `claude-3-haiku-20240307`)

### Groq

1. Get an API key from [Groq Console](https://console.groq.com/keys)
2. Set in `.env`:
   ```
   GROQ_API_KEY=gsk_...
   ```
3. Optional: customize the model with `GROQ_MODEL` (default: `llama-3.1-70b-versatile`)

### Ollama (Local Models)

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model:
   ```bash
   ollama pull llama3
   ```
3. Set in `.env`:
   ```
   OLLAMA_BASE_URL=http://localhost:11434
   ```
4. Optional: customize the model with `OLLAMA_MODEL` (default: `llama3`)

### Provider Fallback

The AI gateway automatically falls back to the next available provider if one fails. Default order: OpenAI > Anthropic > Groq > Ollama.

Customize the fallback order:
```
AI_FALLBACK_ORDER=anthropic,openai,groq,ollama
```

## License

Private - All rights reserved.
