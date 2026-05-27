# Deployment Guide

This guide covers deploying the Craq platform to production environments.

## Prerequisites

- Docker and Docker Compose v2+
- Domain name with DNS access
- SSL certificate (or Let's Encrypt for automated provisioning)
- At minimum: 2 CPU cores, 4GB RAM, 20GB storage

## Docker Compose Deployment (Single Server)

The simplest production deployment uses Docker Compose on a single server.

### 1. Prepare the Server

```bash
# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt-get install docker-compose-plugin
```

### 2. Clone and Configure

```bash
git clone <repository-url>
cd craq

# Create production environment file
cp .env.example .env
```

### 3. Set Production Environment Variables

Edit `.env` with production values:

```bash
# REQUIRED - Change these from defaults
NODE_ENV=production
JWT_SECRET=<generate-with: openssl rand -base64 48>
JWT_REFRESH_SECRET=<generate-with: openssl rand -base64 48>
DB_PASSWORD=<strong-random-password>

# Set your domain
CORS_ORIGIN=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/ws

# Google OAuth (optional)
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback

# AI Providers (at least one recommended)
OPENAI_API_KEY=sk-...
```

### 4. Deploy

```bash
docker compose up --build -d
```

### 5. Verify

```bash
# Check all containers are running
docker compose ps

# Check backend health
curl http://localhost:4000/api/health

# Check logs
docker compose logs -f backend
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | development | Set to `production` for production |
| `PORT` | No | 4000 | Backend server port |
| `DB_HOST` | Yes | localhost | PostgreSQL host (use `postgres` in Docker) |
| `DB_PORT` | No | 5432 | PostgreSQL port |
| `DB_USER` | Yes | craq | Database user |
| `DB_PASSWORD` | Yes | craq_password | Database password (CHANGE IN PRODUCTION) |
| `DB_NAME` | No | craq_db | Database name |
| `DB_POOL_SIZE` | No | 20 | Connection pool size |
| `REDIS_URL` | Yes | redis://localhost:6379 | Redis connection string |
| `JWT_SECRET` | Yes | - | Access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | - | Refresh token signing secret (different from JWT_SECRET) |
| `JWT_EXPIRES_IN` | No | 1h | Access token TTL (e.g., 1h, 30m) |
| `JWT_REFRESH_EXPIRES_IN` | No | 7d | Refresh token TTL (e.g., 7d, 30d) |
| `CORS_ORIGIN` | Yes | http://localhost:3000 | Frontend URL for CORS |
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | - | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | No | - | Google OAuth callback URL |
| `MEILI_HOST` | No | http://localhost:7700 | Meilisearch URL |
| `MEILI_MASTER_KEY` | No | - | Meilisearch master key |
| `OPENAI_API_KEY` | No | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | No | - | Anthropic API key |
| `GROQ_API_KEY` | No | - | Groq API key |
| `OLLAMA_BASE_URL` | No | - | Ollama server URL |
| `AI_FALLBACK_ORDER` | No | openai,anthropic,groq,ollama | Provider priority |
| `AI_MAX_RETRIES` | No | 2 | Retries per provider |
| `AI_TIMEOUT` | No | 30000 | AI request timeout (ms) |
| `NEXT_PUBLIC_API_URL` | Yes | http://localhost:4000 | API URL for frontend |
| `NEXT_PUBLIC_WS_URL` | Yes | ws://localhost:4000/ws | WebSocket URL for frontend |

---

## SSL/HTTPS with Let's Encrypt + Nginx

### Nginx Reverse Proxy Configuration

Create `/etc/nginx/sites-available/craq`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always;

    # File upload limit
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:4000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
```

### Install Certbot and Get Certificates

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

Certbot automatically renews certificates. Verify with:

```bash
sudo certbot renew --dry-run
```

---

## Domain Configuration

1. Create DNS A records pointing to your server IP:
   - `yourdomain.com` -> `YOUR_SERVER_IP`
   - `api.yourdomain.com` -> `YOUR_SERVER_IP`

2. Update environment variables:
   ```bash
   CORS_ORIGIN=https://yourdomain.com
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/ws
   GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
   ```

3. Restart services: `docker compose restart`

---

## Cloud Deployment

### AWS (ECS with Fargate)

1. **Database:** Use Amazon RDS for PostgreSQL 16
   - Enable Multi-AZ for high availability
   - Set up automated backups with 7-day retention
   - Use a private subnet (no public access)

2. **Cache:** Use Amazon ElastiCache for Redis
   - Redis 7.x cluster mode
   - Private subnet only

3. **Backend:** Deploy as ECS Fargate service
   - Use the backend Dockerfile
   - Set environment variables via Secrets Manager
   - Attach an Application Load Balancer (ALB) with SSL

4. **Frontend:** Deploy as ECS Fargate service or use Amplify/Vercel
   - For ECS: use the frontend Dockerfile
   - ALB routes to port 3000

5. **Storage:** Use S3 for file uploads with CloudFront CDN

### GCP (Cloud Run)

1. Push Docker images to Artifact Registry
2. Deploy backend as Cloud Run service
3. Use Cloud SQL for PostgreSQL
4. Use Memorystore for Redis
5. Map custom domain in Cloud Run settings

### DigitalOcean (App Platform)

1. Connect your repository to App Platform
2. Configure as a Docker-based app
3. Use Managed Database for PostgreSQL
4. Use Managed Redis cluster
5. Set environment variables in App settings

---

## Database Backups

### Automated pg_dump Strategy

Create a cron job for daily backups:

```bash
# /etc/cron.d/craq-backup
0 2 * * * root /opt/craq/scripts/backup-db.sh >> /var/log/craq-backup.log 2>&1
```

The backup script (see `scripts/backup-db.sh`) handles:
- Timestamped pg_dump with gzip compression
- Retention of last 7 days (configurable)
- Optional upload to S3

### Point-in-Time Recovery with WAL

For continuous backup with point-in-time recovery:

1. Enable WAL archiving in PostgreSQL:
   ```
   wal_level = replica
   archive_mode = on
   archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'
   ```

2. Take a base backup:
   ```bash
   pg_basebackup -D /backups/base -Ft -z -P
   ```

3. To restore to a specific point:
   ```bash
   # Stop PostgreSQL
   # Restore base backup
   # Set recovery_target_time in recovery.conf
   # Start PostgreSQL
   ```

For managed databases (RDS, Cloud SQL), point-in-time recovery is built-in.

---

## Monitoring

### Health Endpoint

Poll `GET /api/health` every 30 seconds. The response includes:
- Database pool status (total, idle, waiting connections)
- Server uptime
- Memory usage
- Application version

### Structured Log Aggregation

In production (`NODE_ENV=production`), the backend emits structured JSON logs via pino:

```json
{"level":30,"time":1705312200000,"pid":1,"hostname":"craq-backend","reqId":"abc123","msg":"request completed","method":"GET","url":"/api/issues","statusCode":200,"responseTime":45}
```

Aggregate with:
- **AWS:** CloudWatch Logs with JSON filter patterns
- **GCP:** Cloud Logging (auto-parses JSON)
- **Self-hosted:** ELK Stack (Elasticsearch + Logstash + Kibana) or Loki + Grafana

### Uptime Monitoring

Recommended services:
- UptimeRobot (free tier: 50 monitors, 5-min intervals)
- Better Uptime
- Pingdom

Monitor these endpoints:
- `https://api.yourdomain.com/api/health` (backend)
- `https://yourdomain.com` (frontend)

### Error Tracking

Integrate Sentry for error tracking:

```bash
npm install @sentry/node
```

---

## Scaling

### Horizontal Scaling

The backend is stateless (JWT auth, no server sessions), making horizontal scaling straightforward:

1. **Load Balancer:** Place multiple backend instances behind an ALB/nginx
2. **WebSocket Sticky Sessions:** Use Redis pub/sub to broadcast WebSocket events across instances
3. **Database:** Increase `DB_POOL_SIZE` proportionally (total connections = instances * pool_size)

### Database Scaling

- **Read Replicas:** Route read-heavy queries (GET /api/issues, search) to replicas
- **Connection Pooling:** Use PgBouncer for connection multiplexing beyond 100 connections
- **Partitioning:** Partition the votes table by created_at for high-volume deployments

### Redis Scaling

- **Redis Cluster:** For cache-heavy workloads, use Redis Cluster with multiple shards
- **Separate Instances:** Use one Redis for caching, another for WebSocket pub/sub

### CDN

Serve the Next.js frontend static assets via a CDN (CloudFront, Cloudflare) for global performance.
