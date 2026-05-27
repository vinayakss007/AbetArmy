# Feature Inventory

## Implemented Features

### Issue Tracking

Full CRUD for business problems with rich metadata.

- Create, read, update, delete issues
- Filter by category, industry, stage, type, status, tags
- Pagination with configurable page size
- Trending sort (by vote count)
- Recent sort (by creation date)
- Image attachments support
- Status workflow: open -> solved -> closed

### Solution Proposals

Community-driven solutions to issues.

- Submit solutions to any open issue
- Edit and delete own solutions
- Accept a solution (issue author only, marks issue as "solved")
- Image attachments for visual explanations
- Vote counts displayed per solution

### Community Voting

Democratic prioritization through upvotes and downvotes.

- Upvote (+1) or downvote (-1) on issues and solutions
- One vote per user per target (enforced by unique constraint)
- Remove vote to change stance
- Aggregate counts on issues and solutions
- Milestone notifications (at 10, 50, 100 upvotes)

### Threaded Comments

Discussion threads on issues and solutions.

- Comment on issues or solutions (polymorphic parent)
- Author attribution
- Delete own comments
- Real-time notification to parent author

### AI Categorization

Automatic issue classification using AI.

- Analyzes title and description
- Suggests category and relevant tags
- Uses multi-provider gateway with fallback
- Returns which provider handled the request

### AI Similar Issues

Duplicate detection and related topic suggestions.

- Input: issue title and description
- Output: list of similar issue topics
- Helps users find existing discussions before posting

### AI Solution Drafts

AI-generated solution proposals.

- Input: issue title, description, and optional category
- Output: detailed solution draft
- Users can edit and submit as their own solution

### AI Thread Summarization

Condense long discussions into key points.

- Input: array of comment texts
- Output: concise summary of the discussion
- Useful for catching up on active threads

### AI Chat

General-purpose AI assistant with streaming support.

- Multi-turn conversation (message history)
- Configurable temperature and max tokens
- Server-Sent Events (SSE) streaming mode
- Provider and model info in response

### Full-text Search

PostgreSQL-powered text search across issues.

- Search by keyword across title and description
- Filter results by category, industry, status
- Ranked by relevance
- Note: Meilisearch is provisioned but not yet connected; search uses PostgreSQL tsvector

### File Uploads

Multipart file upload for images and documents.

- Single file upload endpoint
- Multer-based file handling
- Timestamped filenames prevent collisions
- Files served statically from /uploads
- 10MB size limit

### Google OAuth

Social sign-in and account linking.

- Sign in with Google (Passport.js)
- Automatic account creation for new Google users
- Account linking: existing email users can connect Google
- No password required for Google-only accounts

### JWT Authentication

Stateless token-based authentication.

- Access tokens (short-lived, 1 hour default)
- Refresh tokens (long-lived, 7 days default)
- Token rotation on refresh
- Production validation (rejects known-unsafe secrets)
- Both `authenticate` (required) and `optionalAuth` (optional) middleware

### Real-time Notifications

WebSocket-based live updates.

- Token-authenticated WebSocket connections (/ws path)
- Event types: new_solution, solution_accepted, new_comment, upvote_milestone
- Targeted delivery to specific users
- Heartbeat-based connection health monitoring
- Auto-cleanup of disconnected clients

### Business Tools Directory

Curated collection of business tools.

- List tools with category filtering
- Add new tools with description, URL, and linked issue types
- Tool reviews with 1-5 star ratings and text content
- Associate tools with issue categories

### User Profiles

User identity and reputation tracking.

- Display name, avatar, bio
- Industry and business stage
- Skills array
- Reputation score (incremented by votes on contributions)
- Profile editing

### Dark Mode

Theme support for reduced eye strain.

- System preference detection (prefers-color-scheme)
- Manual toggle override
- Persisted preference
- Tailwind CSS dark: variant classes

### Responsive Design

Mobile-first responsive layout.

- Tailwind breakpoints (sm, md, lg, xl)
- Mobile navigation
- Fluid typography and spacing
- Touch-friendly interaction targets

### Error Boundaries

Graceful error handling in the UI.

- Global error boundary (catches unhandled React errors)
- Per-page error boundaries (isolate failures)
- User-friendly error messages
- Error recovery options

### Structured Logging

Production-grade logging with pino.

- JSON format in production
- Request correlation IDs (X-Request-ID header)
- Method, URL, status code, response time per request
- Error logging with stack traces
- No sensitive data in logs (tokens, passwords excluded)

### Graceful Shutdown

Clean server termination.

- SIGTERM and SIGINT signal handling
- Stop accepting new connections
- Drain existing connections
- Close database pool
- Disconnect Redis client
- Exit with code 0 on success

### Request Correlation IDs

Trace requests across the system.

- UUID generated per request (requestId middleware)
- Attached to all log entries
- Returned in X-Request-ID response header
- Enables distributed tracing

### Production Config Validation

Fail-fast on misconfiguration.

- Validates required secrets at startup
- Rejects known-insecure default values
- Checks database and Redis connectivity requirements
- Exits with clear error messages

---

## Planned Features

### Email Notifications

- Transactional emails for key events (new solution, accepted solution)
- Digest emails (weekly summary of activity)
- Configurable notification preferences per user
- Integration with SendGrid or AWS SES

### Analytics Dashboard

- Issue creation trends over time
- Most active categories and industries
- User engagement metrics
- Solution acceptance rates
- AI usage statistics

### Admin Panel

- User management (roles, bans)
- Content moderation (flag/remove issues, solutions, comments)
- System health dashboard
- Configuration management

### Per-User API Rate Limiting

- Rate limits tied to user accounts (not just IP)
- Tiered limits based on user role
- Higher limits for premium/verified users
- Rate limit headers per user

### Webhook Integrations

- Configurable webhooks for events (new issue, solution accepted)
- Support for Slack, Discord, Microsoft Teams
- Custom webhook URLs with secret signing
- Retry logic for failed deliveries

### Meilisearch Integration

- Meilisearch is already provisioned in docker-compose.yml
- Replace PostgreSQL full-text search with Meilisearch
- Typo-tolerant, instant search results
- Faceted filtering
- Search analytics
