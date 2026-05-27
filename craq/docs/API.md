# API Reference

Base URL: `http://localhost:4000`

All endpoints are prefixed with `/api`. Authenticated endpoints require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "message": "Description of what went wrong",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common HTTP status codes:
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Health Check

### GET /api/health

Check service status. No authentication required.

```bash
curl http://localhost:4000/api/health
```

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 3600.5,
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1048576
  },
  "pool": {
    "totalCount": 20,
    "idleCount": 18,
    "waitingCount": 0
  }
}
```

---

## Authentication

### POST /api/auth/register

Create a new user account.

**Auth required:** No

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "Jane Smith"
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| password | string | Yes | Minimum 6 characters |
| name | string | Yes | Display name |

**Response (201):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "Jane Smith",
    "avatar_url": null,
    "bio": null,
    "industry": null,
    "stage": null,
    "role": "user",
    "skills": null,
    "reputation_score": 0,
    "google_id": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**
- `409` - Email already registered (`EMAIL_EXISTS`)

---

### POST /api/auth/login

Sign in with email and password.

**Auth required:** No

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Registered email |
| password | string | Yes | Account password |

**Response (200):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "Jane Smith",
    "role": "user",
    "reputation_score": 42,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**
- `401` - Invalid email or password (`INVALID_CREDENTIALS`)
- `401` - Account uses Google sign-in (`GOOGLE_ACCOUNT`)

---

### POST /api/auth/refresh

Exchange a refresh token for a new token pair.

**Auth required:** No

```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Valid refresh token |

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
- `401` - Invalid refresh token (`INVALID_REFRESH_TOKEN`)
- `404` - User not found (`USER_NOT_FOUND`)

---

### GET /api/auth/google

Initiate Google OAuth flow. Redirects to Google consent screen.

**Auth required:** No

```bash
curl -L http://localhost:4000/api/auth/google
```

---

### GET /api/auth/google/callback

Google OAuth callback handler. Returns tokens via redirect.

**Auth required:** No

This endpoint is called by Google after user consent. It creates or links the user account and redirects to the frontend with tokens.

---

## Issues

### GET /api/issues

List issues with optional filtering and pagination.

**Auth required:** No

```bash
curl "http://localhost:4000/api/issues?page=1&limit=20&category=marketing&status=open"
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| category | string | - | Filter by category |
| industry | string | - | Filter by industry |
| stage | string | - | Filter by business stage |
| type | string | - | Filter by issue type |
| status | string | - | Filter by status (open, solved, closed) |
| tags | string | - | Filter by tags (comma-separated) |
| trending | boolean | - | Sort by vote count |
| recent | boolean | - | Sort by creation date desc |

**Response (200):**

```json
{
  "issues": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "author_id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "How to scale customer acquisition in SaaS?",
      "description": "We are struggling with CAC...",
      "images": [],
      "category": "growth",
      "tags": ["saas", "marketing", "acquisition"],
      "status": "open",
      "industry": "technology",
      "stage": "growth",
      "type": "strategy",
      "upvotes": 15,
      "downvotes": 2,
      "accepted_solution_id": null,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "author_name": "Jane Smith"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

### POST /api/issues

Create a new issue.

**Auth required:** Yes

```bash
curl -X POST http://localhost:4000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "How to reduce customer churn in B2B SaaS?",
    "description": "Our monthly churn rate is 5% and we need strategies to improve retention.",
    "category": "retention",
    "tags": ["saas", "churn", "b2b"],
    "industry": "technology",
    "stage": "growth",
    "type": "strategy"
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Issue title (max 500 chars) |
| description | string | Yes | Detailed description |
| images | string[] | No | Array of image URLs |
| category | string | No | Issue category |
| tags | string[] | No | Tags for the issue |
| industry | string | No | Related industry |
| stage | string | No | Business stage |
| type | string | No | Issue type |

**Response (201):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "author_id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "How to reduce customer churn in B2B SaaS?",
  "description": "Our monthly churn rate is 5%...",
  "images": [],
  "category": "retention",
  "tags": ["saas", "churn", "b2b"],
  "status": "open",
  "industry": "technology",
  "stage": "growth",
  "type": "strategy",
  "upvotes": 0,
  "downvotes": 0,
  "accepted_solution_id": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

---

### GET /api/issues/:id

Get a single issue by ID.

**Auth required:** No

```bash
curl http://localhost:4000/api/issues/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**

Returns the full issue object (same structure as in list response).

**Error Responses:**
- `404` - Issue not found (`NOT_FOUND`)

---

### PUT /api/issues/:id

Update an issue. Only the issue author can update.

**Auth required:** Yes

```bash
curl -X PUT http://localhost:4000/api/issues/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Updated title",
    "description": "Updated description",
    "category": "operations"
  }'
```

**Request Body:** Any subset of issue fields (title, description, images, category, tags, industry, stage, type).

**Response (200):** Returns the updated issue object.

**Error Responses:**
- `403` - Not the issue author
- `404` - Issue not found

---

### DELETE /api/issues/:id

Delete an issue. Only the issue author can delete.

**Auth required:** Yes

```bash
curl -X DELETE http://localhost:4000/api/issues/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <token>"
```

**Response:** `204 No Content`

**Error Responses:**
- `403` - Not the issue author
- `404` - Issue not found

---

### POST /api/issues/:id/solve

Mark a solution as accepted for this issue. Only the issue author can accept solutions.

**Auth required:** Yes

```bash
curl -X POST http://localhost:4000/api/issues/550e8400-e29b-41d4-a716-446655440000/solve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "solutionId": "770e8400-e29b-41d4-a716-446655440000"
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| solutionId | string (UUID) | Yes | ID of the solution to accept |

**Response (200):** Returns the updated issue with `accepted_solution_id` set and `status: "solved"`.

---

## Solutions

### GET /api/solutions/issue/:issueId

List all solutions for a specific issue.

**Auth required:** No

```bash
curl http://localhost:4000/api/solutions/issue/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "issue_id": "550e8400-e29b-41d4-a716-446655440000",
    "author_id": "880e8400-e29b-41d4-a716-446655440000",
    "content": "Here is a proven retention strategy...",
    "images": [],
    "upvotes": 8,
    "downvotes": 1,
    "is_accepted": false,
    "created_at": "2024-01-15T12:00:00.000Z",
    "updated_at": "2024-01-15T12:00:00.000Z",
    "author_name": "John Doe"
  }
]
```

---

### POST /api/solutions

Submit a new solution to an issue.

**Auth required:** Yes

```bash
curl -X POST http://localhost:4000/api/solutions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "issueId": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Based on my experience, you should implement a customer health score..."
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| issueId | string (UUID) | Yes | ID of the issue |
| content | string | Yes | Solution content |
| images | string[] | No | Supporting images |

**Response (201):** Returns the created solution object.

---

### PUT /api/solutions/:id

Update a solution. Only the solution author can update.

**Auth required:** Yes

```bash
curl -X PUT http://localhost:4000/api/solutions/770e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "content": "Updated solution content with more detail..."
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | No | Updated content |
| images | string[] | No | Updated images |

**Response (200):** Returns the updated solution object.

---

### DELETE /api/solutions/:id

Delete a solution. Only the solution author can delete.

**Auth required:** Yes

```bash
curl -X DELETE http://localhost:4000/api/solutions/770e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <token>"
```

**Response:** `204 No Content`

---

## Votes

### POST /api/votes

Cast an upvote or downvote on an issue or solution.

**Auth required:** Yes

```bash
curl -X POST http://localhost:4000/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "targetType": "issue",
    "targetId": "550e8400-e29b-41d4-a716-446655440000",
    "value": 1
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| targetType | string | Yes | "issue" or "solution" |
| targetId | string (UUID) | Yes | ID of the target |
| value | number | Yes | 1 (upvote) or -1 (downvote) |

**Response (201):**

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "user_id": "660e8400-e29b-41d4-a716-446655440000",
  "target_type": "issue",
  "target_id": "550e8400-e29b-41d4-a716-446655440000",
  "value": 1,
  "created_at": "2024-01-15T14:00:00.000Z"
}
```

**Error Responses:**
- `409` - Already voted on this target

---

### DELETE /api/votes/:id

Remove a vote.

**Auth required:** Yes

```bash
curl -X DELETE http://localhost:4000/api/votes/990e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <token>"
```

**Response:** `204 No Content`

---

## Comments

### GET /api/comments/issue/:issueId

List all comments for an issue.

**Auth required:** No

```bash
curl http://localhost:4000/api/comments/issue/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**

```json
[
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440000",
    "parent_type": "issue",
    "parent_id": "550e8400-e29b-41d4-a716-446655440000",
    "author_id": "880e8400-e29b-41d4-a716-446655440000",
    "content": "Have you considered implementing NPS surveys?",
    "created_at": "2024-01-15T15:00:00.000Z",
    "updated_at": "2024-01-15T15:00:00.000Z",
    "author_name": "John Doe"
  }
]
```

---

### POST /api/comments

Add a comment to an issue or solution.

**Auth required:** Yes

```bash
curl -X POST http://localhost:4000/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "parentType": "issue",
    "parentId": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Great question! I had the same issue last quarter."
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| parentType | string | Yes | "issue" or "solution" |
| parentId | string (UUID) | Yes | ID of the parent |
| content | string | Yes | Comment text |

**Response (201):** Returns the created comment object.

---

### DELETE /api/comments/:id

Delete a comment. Only the comment author can delete.

**Auth required:** Yes

```bash
curl -X DELETE http://localhost:4000/api/comments/aa0e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <token>"
```

**Response:** `204 No Content`

---

## AI

All AI endpoints require authentication and use the multi-provider gateway with automatic fallback.

### POST /api/ai/categorize

Auto-categorize an issue based on its title and description.

**Auth required:** Yes

```bash
curl -X POST http://localhost:4000/api/ai/categorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "How to scale customer acquisition in SaaS?",
    "description": "We are a B2B SaaS company struggling with CAC..."
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Issue title |
| description | string | Yes | Issue description |

**Response (200):**

```json
{
  "category": "growth",
  "tags": ["saas", "customer-acquisition", "b2b", "marketing"],
  "provider": "openai"
}
```

---

### POST /api/ai/similar-issues

Find issues similar to a given title and description.

**Auth required:** Yes

```bash
curl -X POST http://localhost:4000/api/ai/similar-issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Reducing churn rate",
    "description": "Monthly churn is too high for our SaaS product"
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Issue title |
| description | string | Yes | Issue description |

**Response (200):**

```json
{
  "suggestions": [
    "How to improve customer retention in B2B SaaS",
    "Strategies for reducing monthly churn below 3%",
    "Building a customer success team to prevent churn"
  ],
  "provider": "openai"
}
```

---

### POST /api/ai/solution-draft

Generate an AI-drafted solution for an issue.

**Auth required:** Yes

```bash
curl -X POST http://localhost:4000/api/ai/solution-draft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "How to reduce customer churn?",
    "description": "Our B2B SaaS has 5% monthly churn...",
    "category": "retention"
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Issue title |
| description | string | Yes | Issue description |
| category | string | No | Issue category for context |

**Response (200):**

```json
{
  "draft": "Here are several strategies to reduce churn in your B2B SaaS:\n\n1. **Implement a Customer Health Score**...",
  "provider": "openai"
}
```

---

### POST /api/ai/summarize

Summarize a thread of comments.

**Auth required:** Yes

```bash
curl -X POST http://localhost:4000/api/ai/summarize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "comments": [
      "I think the main issue is onboarding",
      "Agreed, our time-to-value is too long",
      "We should implement guided tours",
      "Has anyone tried Pendo for this?"
    ]
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| comments | string[] | Yes | Array of comment texts |

**Response (200):**

```json
{
  "summary": "The discussion identifies onboarding as the primary churn driver, with consensus that time-to-value needs improvement. Suggested solutions include guided product tours, with Pendo mentioned as a potential tool.",
  "provider": "anthropic"
}
```

---

### POST /api/ai/chat

General-purpose AI chat with optional streaming.

**Auth required:** Yes

```bash
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "messages": [
      {"role": "user", "content": "What are the best practices for reducing SaaS churn?"}
    ],
    "stream": false,
    "temperature": 0.7,
    "maxTokens": 1000
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| messages | array | Yes | Chat messages [{role, content}] |
| stream | boolean | No | Enable SSE streaming (default: false) |
| temperature | number | No | Creativity (0-2, default: 0.7) |
| maxTokens | number | No | Max response length |

**Response (200) - Non-streaming:**

```json
{
  "content": "Here are the key best practices for reducing SaaS churn:\n\n1. **Improve Onboarding**...",
  "provider": "openai",
  "model": "gpt-4o-mini"
}
```

**Response (200) - Streaming:** Server-Sent Events with chunked content.

---

## Search

### GET /api/search

Full-text search across issues.

**Auth required:** No

```bash
curl "http://localhost:4000/api/search?q=customer+churn&category=retention&status=open"
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query |
| category | string | No | Filter by category |
| industry | string | No | Filter by industry |
| status | string | No | Filter by status |

**Response (200):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "How to reduce customer churn in B2B SaaS?",
    "description": "Our monthly churn rate is 5%...",
    "category": "retention",
    "status": "open",
    "upvotes": 15,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

---

## Tools

### GET /api/tools

List business tools in the directory.

**Auth required:** No

```bash
curl http://localhost:4000/api/tools
```

**Response (200):**

```json
[
  {
    "id": "bb0e8400-e29b-41d4-a716-446655440000",
    "name": "HubSpot",
    "description": "CRM and marketing automation platform",
    "url": "https://hubspot.com",
    "category": "marketing",
    "linked_issue_types": ["acquisition", "retention"],
    "created_at": "2024-01-10T08:00:00.000Z",
    "updated_at": "2024-01-10T08:00:00.000Z"
  }
]
```

---

### POST /api/tools

Add a new tool to the directory.

**Auth required:** Yes

```bash
curl -X POST http://localhost:4000/api/tools \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Intercom",
    "description": "Customer messaging platform for onboarding and support",
    "url": "https://intercom.com",
    "category": "support",
    "linked_issue_types": ["retention", "onboarding"]
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Tool name |
| description | string | No | Tool description |
| url | string | No | Tool website URL |
| category | string | No | Tool category |
| linked_issue_types | string[] | No | Related issue types |

**Response (201):** Returns the created tool object.

---

## Users

### GET /api/users/me

Get the current authenticated user's profile.

**Auth required:** Yes

```bash
curl http://localhost:4000/api/users/me \
  -H "Authorization: Bearer <token>"
```

**Response (200):**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "Jane Smith",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "Startup founder focused on B2B SaaS growth",
  "industry": "technology",
  "stage": "growth",
  "role": "user",
  "skills": ["marketing", "product", "analytics"],
  "reputation_score": 142,
  "google_id": null,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

---

### PUT /api/users/me

Update the current user's profile.

**Auth required:** Yes

```bash
curl -X PUT http://localhost:4000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Jane Smith",
    "bio": "Startup founder building the next big thing",
    "industry": "technology",
    "stage": "scaling",
    "skills": ["marketing", "product", "data"]
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Display name |
| bio | string | No | User biography |
| industry | string | No | User's industry |
| stage | string | No | Business stage |
| skills | string[] | No | User skills |

**Response (200):** Returns the updated user profile.

---

## Upload

### POST /api/upload

Upload a file (images, documents).

**Auth required:** Yes

```bash
curl -X POST http://localhost:4000/api/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@./screenshot.png"
```

**Request:** Multipart form-data with a `file` field.

**Response (200):**

```json
{
  "url": "/uploads/1705312200000-screenshot.png",
  "filename": "1705312200000-screenshot.png"
}
```

**Error Responses:**
- `400` - No file uploaded
- `413` - File too large (max 10MB)

---

## Rate Limiting

All endpoints are rate limited to **100 requests per 15 minutes** per IP address. When exceeded:

**Response (429):**

```json
{
  "error": {
    "message": "Too many requests, please try again later.",
    "code": "RATE_LIMITED"
  }
}
```

Rate limit headers are included in all responses:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in window
- `RateLimit-Reset`: Time when the window resets (Unix timestamp)
