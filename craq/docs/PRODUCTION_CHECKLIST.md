# Production Launch Checklist

Use this checklist before deploying Craq to production. Complete each item and check it off.

## Environment & Secrets

- [ ] `NODE_ENV` set to `production`
- [ ] `JWT_SECRET` set to a cryptographically random value (min 32 chars, generate with `openssl rand -base64 48`)
- [ ] `JWT_REFRESH_SECRET` set to a different cryptographically random value
- [ ] `DB_PASSWORD` set to a strong random password (not the default `craq_password`)
- [ ] `MEILI_MASTER_KEY` rotated from default value
- [ ] Google OAuth credentials configured in Google Cloud Console (if using OAuth)
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set (if using OAuth)
- [ ] `GOOGLE_CALLBACK_URL` set to production URL
- [ ] At least one AI provider API key configured (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GROQ_API_KEY)
- [ ] All secrets stored securely (not in version control, use env vars or secrets manager)
- [ ] `.env` file is in `.gitignore` and NOT committed

## Database

- [ ] PostgreSQL 16 instance accessible from the backend
- [ ] Schema initialized (all tables and indexes created)
- [ ] Database user has minimum required privileges (not superuser)
- [ ] Connection pooling configured (`DB_POOL_SIZE` appropriate for instance size)
- [ ] Automated backup schedule configured (daily minimum)
- [ ] Backup restore procedure tested at least once
- [ ] Point-in-time recovery enabled (WAL archiving for self-hosted, built-in for managed)
- [ ] Database not accessible from public internet (private subnet/firewall)
- [ ] Database connection uses SSL in production

## Networking & Security

- [ ] SSL/HTTPS enabled with valid certificate (Let's Encrypt or purchased)
- [ ] Certificate auto-renewal configured (certbot timer or managed)
- [ ] `CORS_ORIGIN` set to exact production frontend URL (not wildcard)
- [ ] Rate limiting configured and tested (default: 100 req/15min per IP)
- [ ] Firewall rules: only ports 80 and 443 exposed to public
- [ ] Database port (5432) NOT exposed publicly
- [ ] Redis port (6379) NOT exposed publicly
- [ ] WebSocket connections require valid JWT token
- [ ] Nginx or load balancer handles TLS termination
- [ ] HTTP redirects to HTTPS

## Infrastructure

- [ ] Redis instance accessible for caching and WebSocket pub/sub
- [ ] Redis not accessible from public internet
- [ ] File upload storage configured (local volume or S3 bucket)
- [ ] Upload directory has correct permissions (read/write, no execute)
- [ ] DNS A records pointing to server IP (frontend domain + API subdomain)
- [ ] Health check monitoring active on `/api/health`
- [ ] Docker containers configured with resource limits (memory, CPU)
- [ ] Container restart policy set to `unless-stopped` or `always`

## Observability

- [ ] Structured JSON logging enabled (`NODE_ENV=production` activates pino)
- [ ] Log aggregation service connected (CloudWatch, Datadog, ELK, Loki)
- [ ] Log retention policy set (minimum 30 days)
- [ ] Error tracking service configured (Sentry recommended)
- [ ] Uptime monitoring on `/api/health` endpoint (every 30-60 seconds)
- [ ] Alerting rules configured:
  - [ ] Backend down (health check fails)
  - [ ] High error rate (5xx responses above threshold)
  - [ ] Database connection pool exhausted
  - [ ] Disk space low (below 20%)
  - [ ] Memory usage high (above 80%)
- [ ] Request correlation IDs flowing through logs (X-Request-ID)

## Performance

- [ ] Frontend built in production mode (`npm run build` in frontend/)
- [ ] Backend compiled to JavaScript (`npm run build` in backend/)
- [ ] Static assets served via CDN (optional but recommended)
- [ ] Gzip/Brotli compression enabled (built-in via compression middleware)
- [ ] Database indexes verified (run `\di` in psql to list all indexes)
- [ ] Connection pool size appropriate for expected concurrency
- [ ] Load testing completed (verify response times under expected load)
- [ ] WebSocket heartbeat interval appropriate (default: 30s)
- [ ] AI request timeout configured (`AI_TIMEOUT`, default: 30000ms)

## Application

- [ ] All backend tests passing (`npm test` in backend/)
- [ ] Backend builds without errors (`npm run build` in backend/)
- [ ] Frontend builds without errors (`npm run build` in frontend/)
- [ ] No npm audit critical/high vulnerabilities
- [ ] Production config validation passes (server starts without config errors)
- [ ] File upload size limit appropriate (default: 10MB)
- [ ] CORS allows only the production frontend origin

## Pre-flight

- [ ] Smoke test completed (register, login, create issue, submit solution, vote)
- [ ] Google OAuth flow tested end-to-end (if configured)
- [ ] AI features tested (categorize, chat) with production API keys
- [ ] WebSocket notifications tested (create solution, verify notification)
- [ ] File upload tested in production environment
- [ ] Search functionality verified
- [ ] Mobile responsiveness verified on actual devices
- [ ] Backup restore tested (restore a backup to verify it works)
- [ ] Rollback plan documented (how to revert to previous version)
- [ ] Team notified of launch window
- [ ] On-call rotation established for first 48 hours post-launch

## Post-Launch (First 24 Hours)

- [ ] Monitor error rates in logging/error tracking
- [ ] Verify no elevated 5xx responses
- [ ] Check database connection pool usage
- [ ] Confirm automated backups are running
- [ ] Review response times for degradation
- [ ] Verify SSL certificate shows correctly in browsers
- [ ] Test all critical paths again from production
