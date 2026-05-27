# Security Documentation

This document describes the security measures implemented in the Craq platform.

## Authentication System

### JWT Access Tokens

- Signed with HS256 (HMAC-SHA256) using `JWT_SECRET`
- Default expiration: 1 hour (`JWT_EXPIRES_IN`)
- Contains payload: `{ userId, email, role }`
- Sent in `Authorization: Bearer <token>` header
- Stateless verification (no database lookup required)

### JWT Refresh Tokens

- Signed with a separate secret (`JWT_REFRESH_SECRET`)
- Default expiration: 7 days (`JWT_REFRESH_EXPIRES_IN`)
- Contains payload: `{ userId }` (minimal claims)
- Used to obtain new access+refresh token pairs
- Implements token rotation (new refresh token on each use)

### Token Security

- Access and refresh tokens use different signing secrets
- Production startup validates that secrets are not set to known default values
- Known unsafe defaults that trigger startup failure:
  - `dev-secret-key`
  - `dev-refresh-secret-key`
  - `change-me-in-production`

### Google OAuth 2.0

- Uses Passport.js with the Google OAuth2 strategy
- Supports account linking (existing email users can connect their Google account)
- Google tokens are not stored; only the Google ID is persisted for future logins
- OAuth callback URL must be explicitly configured

## Password Security

- Passwords are hashed with **bcrypt** using **12 salt rounds**
- Plain-text passwords are never stored or logged
- Minimum password length enforced via Zod validation
- Accounts created via Google OAuth have no password_hash (cannot login with email/password unless one is set)

## Rate Limiting

Global rate limiting is applied to all endpoints:

```
Window: 15 minutes
Max requests: 100 per IP
Headers: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
```

Configuration via `express-rate-limit`:
- Uses `standardHeaders: true` (returns rate info in standard headers)
- Uses `legacyHeaders: false` (no X-RateLimit-* headers)

When rate limited, the server returns HTTP 429 with a retry-after header.

## Security Headers

The application uses **helmet** middleware which sets the following headers:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME-type sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 0 | Disable browser XSS filter (CSP preferred) |
| Strict-Transport-Security | max-age=15552000 | Force HTTPS (when behind TLS) |
| X-Download-Options | noopen | Prevent IE from executing downloads |
| X-Permitted-Cross-Domain-Policies | none | Restrict Flash/PDF cross-domain |
| Content-Security-Policy | default-src 'self' | Restrict resource loading |
| Referrer-Policy | no-referrer | Prevent referrer leakage |

## CORS Policy

Cross-Origin Resource Sharing is configured to allow only the frontend origin:

```typescript
cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
})
```

- Only the configured `CORS_ORIGIN` can make cross-origin requests
- Credentials (cookies, authorization headers) are allowed
- Set `CORS_ORIGIN` to your production frontend URL

## Input Validation

All API endpoints validate input using **Zod** schemas:

```typescript
const createIssueSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(500),
    description: z.string().min(1),
    category: z.string().optional(),
    // ...
  }),
});

router.post('/', authenticate, validate(createIssueSchema), controller.create);
```

The `validate` middleware:
1. Parses the request against the Zod schema
2. Returns 400 with detailed error messages on failure
3. Strips unknown fields (no unexpected data reaches the service layer)

## SQL Injection Prevention

All database queries use **parameterized queries** with PostgreSQL's `$1, $2, ...` syntax:

```typescript
// SAFE - parameterized
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// NEVER done - string interpolation
// const result = await pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

The `pg` library handles proper escaping of all parameter values. No raw SQL string concatenation is used anywhere in the codebase.

## XSS Prevention

### Backend

- `Content-Type: application/json` on all API responses (browsers won't render as HTML)
- `X-Content-Type-Options: nosniff` prevents MIME-sniffing
- Input validation rejects or sanitizes potentially dangerous content
- No server-side HTML rendering with user content

### Frontend

- React automatically escapes content rendered in JSX
- No use of `dangerouslySetInnerHTML` with user-supplied content
- Content-Security-Policy header restricts inline scripts

## CSRF Considerations

The application uses a token-based SPA architecture which is inherently resistant to CSRF:

- Authentication is via `Authorization: Bearer` header (not cookies)
- Browsers do not automatically attach custom headers to cross-origin requests
- CORS restricts which origins can make requests with credentials
- No cookie-based session is used

## File Upload Security

- File size limited to 10MB (`express.json({ limit: '10mb' })`)
- Uploads stored in a dedicated `/uploads` directory
- Files served statically with no execution permissions
- Filename sanitization (timestamp prefix prevents path traversal)

## Production Secret Management

### Startup Validation

The `config/production.ts` module validates configuration at startup when `NODE_ENV=production`:

- `JWT_SECRET` must be set and not a known default
- `JWT_REFRESH_SECRET` must be set and not a known default
- `DB_HOST` must be configured
- `REDIS_URL` must be configured

If any validation fails, the server exits immediately with an error message.

### Secret Generation

Generate cryptographically secure secrets:

```bash
# Generate a 48-byte random secret (base64 encoded)
openssl rand -base64 48

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### Best Practices

- Never commit secrets to version control
- Use different secrets for each environment (dev, staging, prod)
- Use environment variables or a secrets manager (AWS Secrets Manager, Vault)
- Rotate secrets periodically (especially after team member departures)
- Never log token values (the request logger excludes Authorization headers)

## WebSocket Security

- WebSocket connections require a valid JWT token in the query string (`?token=<jwt>`)
- Connections without a token or with an invalid token are immediately closed (code 4001)
- Each connection is authenticated and associated with a userId
- Heartbeat mechanism terminates stale connections (30-second interval)
- Messages from clients are validated (only known types are processed)

## OWASP Top 10 Compliance

| # | Vulnerability | Mitigation |
|---|---------------|------------|
| A01 | Broken Access Control | JWT auth on protected routes, ownership checks on CRUD |
| A02 | Cryptographic Failures | bcrypt for passwords, JWT with HMAC-SHA256, HTTPS enforced |
| A03 | Injection | Parameterized SQL queries, Zod input validation |
| A04 | Insecure Design | Service layer separation, principle of least privilege |
| A05 | Security Misconfiguration | Helmet headers, production config validation, no defaults |
| A06 | Vulnerable Components | npm audit, dependency updates, minimal dependencies |
| A07 | Auth Failures | Rate limiting on auth endpoints, bcrypt, token rotation |
| A08 | Data Integrity Failures | Input validation, no deserialization of untrusted data |
| A09 | Logging Failures | Structured logging with request IDs, no sensitive data in logs |
| A10 | SSRF | No user-controlled outbound requests (AI keys are server-side) |

## Security Audit Checklist

- [ ] Run `npm audit` and resolve critical/high vulnerabilities
- [ ] Verify all secrets are non-default in production
- [ ] Confirm CORS_ORIGIN is set to the exact production domain
- [ ] Test rate limiting is active (hit endpoint 100+ times)
- [ ] Verify database is not publicly accessible
- [ ] Confirm file uploads directory has no execute permissions
- [ ] Check that error messages do not leak stack traces in production
- [ ] Verify WebSocket rejects connections without valid tokens
- [ ] Test that users cannot modify/delete other users' resources
- [ ] Confirm refresh token rotation is working correctly
