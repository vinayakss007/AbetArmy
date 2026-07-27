# Modular AI Agent Fleet Platform

## A Sellable Enterprise-Grade Agent Orchestration Platform

### Overview
A fully configurable AI agent platform where each agent can be customized: 
- **LLM usage control**: From full LLM to rule-based logic
- **Tool permissions**: Granular control over which tools agents can access
- **Data scopes**: Controlled access to data sources
- **Agent types**: Support for multiple legitimate business use cases

### Key Features

#### Core Platform
- ✅ Agent orchestration dashboard + fleet management
- ✅ Per-agent config: LLM budget/tokens, tool permissions, data scopes
- ✅ Pluggable framework adapters (LangChain, LlamaIndex, raw API, etc.)
- ✅ Multi-tenancy with API keys, usage metering & billing hooks
- ✅ Observability: logs, traces, cost tracking, analytics
- ✅ Rate limiting, guardrails, and audit trails

#### Supported Agent Types
1. **Conversational agents** - Customer support, FAQ, internal helpdesk
2. **Compliant web crawlers/scrapers** - Respect robots.txt, rate limits, ToS
3. **Monitoring agents** - Uptime, health checks, alerting, log analysis
4. **Transactional/workflow agents** - Booking, order processing, RPA
5. **Data & research agents** - Summarization, enrichment, reporting
6. **Game/entertainment NPCs** - In-app interactive agents

### Architecture

```
backend/          # FastAPI backend with Python
├── app/
│   ├── api/      # REST API endpoints
│   ├── core/     # Core business logic
│   ├── models/   # Database models
│   ├── agents/   # Agent implementations
│   └── services/ # Background services

frontend/         # React + TypeScript dashboard
├── src/
│   ├── components/
│   ├── pages/
│   └── types/

database/         # Database migrations & schemas
docker/           # Docker configurations
docs/             # Documentation
examples/         # Example agent configurations
```

### Tech Stack
- **Backend**: Python (FastAPI) with PostgreSQL, Redis
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: PostgreSQL + SQLAlchemy ORM
- **Message Queue**: Redis (Celery for async tasks)
- **AI/ML**: LangChain, OpenAI/Anthropic APIs, Local LLMs
- **Deployment**: Docker, Kubernetes, AWS/GCP/Azure ready

### Getting Started
```bash
# Clone repository
git clone <repo-url>

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

# Run development servers
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2: Frontend  
cd frontend && npm start

# Terminal 3: Worker
cd backend && celery -A app.celery_app worker --loglevel=info
```

### Business Model
- **Free Tier**: Up to 10 agents, limited features
- **Pro Tier**: Unlimited agents, advanced features
- **Enterprise Tier**: Custom integrations, dedicated support
- **Usage-based billing**: Pay per agent, per API call, or per hour

### License
Proprietary - Commercial use requires license