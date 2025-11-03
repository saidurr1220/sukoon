# Sukoon - API Documentation

This document describes all API endpoints and server actions available in the Sukoon application.

## Table of Contents

1. [Server Actions](#server-actions)
2. [API Routes](#api-routes)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)

---

## Server Actions

Server actions are Next.js server-side functions that can be called directly from client components.

### `selectVerseByMood`

Selects a verse based on the user's mood.

**Location**: `src/app/actions/verse-actions.ts`

**Parameters**:

```typescript
{
  mood: string; // One of: "happy", "sad", "angry", "anxious", "depressed", "grateful"
}
```

**Returns**:

```typescript
{
  success: boolean
  verse?: {
    id: string              // Format: "surah:ayah" (e.g., "2:286")
    surahNumber: number
    ayahNumber: number
    arabicText: string
    translation: string
    translatorName: string
    audioUrl: string | null
  }
  error?: string
}
```

**Example Usage**:

```typescript
import { selectVerseByMood } from "@/app/actions/verse-actions";

const result = await selectVerseByMood("happy");
if (result.success) {
  console.log(result.verse);
}
```

**Error Responses**:

- `Invalid mood selected` - Mood parameter is not one of the valid options
- `Verse selection failed: [details]` - LLM or database error

---

### `subscribeToDaily`

Creates a new email subscription with double opt-in.

**Location**: `src/app/actions/subscription-actions.ts`

**Parameters**:

```typescript
{
  email: string; // Valid email address
}
```

**Returns**:

```typescript
{
  success: boolean
  message?: string
  error?: string
}
```

**Example Usage**:

```typescript
import { subscribeToDaily } from "@/app/actions/subscription-actions";

const result = await subscribeToDaily("user@example.com");
if (result.success) {
  console.log("Confirmation email sent");
}
```

**Error Responses**:

- `Invalid email address` - Email format is invalid
- `Email already subscribed` - Email is already in the system
- `Failed to send confirmation email` - Email service error

---

## API Routes

### POST `/api/subscribe`

Creates a new email subscription.

**Request Body**:

```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Confirmation email sent. Please check your inbox."
}
```

**Response** (400 Bad Request):

```json
{
  "success": false,
  "error": "Invalid email address"
}
```

**Response** (409 Conflict):

```json
{
  "success": false,
  "error": "Email already subscribed"
}
```

**Response** (500 Internal Server Error):

```json
{
  "success": false,
  "error": "Failed to send confirmation email"
}
```

**Example**:

```bash
curl -X POST https://your-domain.com/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

---

### GET `/api/confirm`

Confirms an email subscription.

**Query Parameters**:

- `token` (required): Confirmation token from email

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Email confirmed successfully"
}
```

**Response** (400 Bad Request):

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Response** (404 Not Found):

```json
{
  "success": false,
  "error": "Subscriber not found"
}
```

**Example**:

```bash
curl https://your-domain.com/api/confirm?token=abc123def456
```

**User Flow**:

1. User subscribes via `/api/subscribe`
2. Receives email with confirmation link
3. Clicks link: `https://your-domain.com/api/confirm?token=abc123`
4. Subscription is confirmed

---

### GET `/api/unsubscribe`

Unsubscribes an email from daily emails.

**Query Parameters**:

- `email` (required): Email address to unsubscribe
- `token` (required): Signed token for verification

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Successfully unsubscribed"
}
```

**Response** (400 Bad Request):

```json
{
  "success": false,
  "error": "Invalid token"
}
```

**Response** (404 Not Found):

```json
{
  "success": false,
  "error": "Email not found"
}
```

**Example**:

```bash
curl "https://your-domain.com/api/unsubscribe?email=user@example.com&token=signed_token"
```

**Security**:

- Token is HMAC-signed using `UNSUBSCRIBE_SECRET`
- Prevents unauthorized unsubscriptions
- Token includes email address to prevent tampering

---

### POST `/api/cron/daily`

Sends daily emails to all confirmed subscribers.

**Authentication**: Requires `Authorization: Bearer [CRON_SECRET]` header

**Request Headers**:

```
Authorization: Bearer your_cron_secret_here
Content-Type: application/json
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Daily emails processed",
  "sent": 42,
  "failed": 0,
  "total": 42
}
```

**Response** (200 OK with errors):

```json
{
  "success": true,
  "message": "Daily emails processed",
  "sent": 40,
  "failed": 2,
  "total": 42,
  "errors": [
    "user1@example.com: Email delivery failed",
    "user2@example.com: Invalid email address"
  ]
}
```

**Response** (401 Unauthorized):

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Response** (500 Internal Server Error):

```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Example**:

```bash
curl -X POST https://your-domain.com/api/cron/daily \
  -H "Authorization: Bearer your_cron_secret_here" \
  -H "Content-Type: application/json"
```

**Scheduled Execution**:

- Runs daily at 6:00 AM UTC via Vercel Cron
- Configured in `vercel.json`
- Can be manually triggered for testing

**Process**:

1. Retrieves all active, confirmed subscribers
2. For each subscriber:
   - Selects a verse (excluding verses sent in last 30 days)
   - Sends email with verse
   - Logs the send in database
3. Returns summary of sent/failed emails

---

### GET `/api/cron/daily` (Development Only)

Allows testing the cron job in development without POST request.

**Note**: Only available when `NODE_ENV !== "production"`

**Response**: Same as POST endpoint

**Example**:

```bash
# Development only
curl http://localhost:3000/api/cron/daily
```

---

## Authentication

### Cron Job Authentication

The `/api/cron/daily` endpoint requires authentication to prevent unauthorized access.

**Setup**:

1. Generate a secure secret:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Set `CRON_SECRET` environment variable

3. Include in request header:
   ```
   Authorization: Bearer your_cron_secret_here
   ```

**Security Considerations**:

- Use a strong, random secret (32+ characters)
- Never commit the secret to version control
- Rotate the secret periodically (every 90 days)
- Different secrets for development and production

### Unsubscribe Token Authentication

Unsubscribe links include a signed token to prevent unauthorized unsubscriptions.

**Token Generation**:

```typescript
import crypto from "crypto";

const token = crypto
  .createHmac("sha256", process.env.UNSUBSCRIBE_SECRET!)
  .update(email)
  .digest("hex");
```

**Token Verification**:

```typescript
const expectedToken = crypto
  .createHmac("sha256", process.env.UNSUBSCRIBE_SECRET!)
  .update(email)
  .digest("hex");

if (token !== expectedToken) {
  throw new Error("Invalid token");
}
```

---

## Error Handling

### Standard Error Response Format

All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning               | Usage                             |
| ---- | --------------------- | --------------------------------- |
| 200  | OK                    | Request succeeded                 |
| 400  | Bad Request           | Invalid input (validation error)  |
| 401  | Unauthorized          | Missing or invalid authentication |
| 404  | Not Found             | Resource not found                |
| 409  | Conflict              | Resource already exists           |
| 429  | Too Many Requests     | Rate limit exceeded               |
| 500  | Internal Server Error | Server-side error                 |

### Error Types

#### Validation Errors (400)

```json
{
  "success": false,
  "error": "Invalid email address"
}
```

#### Authentication Errors (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

#### Not Found Errors (404)

```json
{
  "success": false,
  "error": "Subscriber not found"
}
```

#### Conflict Errors (409)

```json
{
  "success": false,
  "error": "Email already subscribed"
}
```

#### Server Errors (500)

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

### Current Implementation

Rate limiting is not currently implemented but should be added for production.

### Recommended Limits

| Endpoint           | Limit       | Window             |
| ------------------ | ----------- | ------------------ |
| `/api/subscribe`   | 5 requests  | 1 hour per IP      |
| `/api/confirm`     | 10 requests | 1 hour per IP      |
| `/api/unsubscribe` | 10 requests | 1 hour per IP      |
| `/api/cron/daily`  | N/A         | Authenticated only |

### Implementation Suggestion

Use Vercel Edge Config or Upstash Redis for rate limiting:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  // Handle request...
}
```

---

## Data Models

### Verse

```typescript
interface Verse {
  id: string; // Format: "surah:ayah"
  surahNumber: number; // 1-114
  ayahNumber: number; // Varies by surah
  arabicText: string; // Arabic Qur'an text
  translation: string; // English translation
  translatorName: string; // Translator attribution
  audioUrl: string | null; // Optional audio URL
}
```

### Subscriber

```typescript
interface Subscriber {
  id: string;
  email: string;
  confirmedAt: Date | null; // null until confirmed
  locale: string; // Default: "en"
  lastSentAt: Date | null; // Last email sent date
  active: boolean; // Subscription status
  createdAt: Date;
}
```

### SendLog

```typescript
interface SendLog {
  id: string;
  subscriberId: string;
  verseId: string;
  sentAt: Date;
}
```

---

## Webhooks

### Future Implementation

Consider adding webhooks for:

- Email delivery status (via Resend)
- Bounce notifications
- Spam complaints
- Unsubscribe events

---

## API Versioning

### Current Version

All endpoints are currently unversioned (v1 implicit).

### Future Versioning

If breaking changes are needed, use URL versioning:

- `/api/v1/subscribe`
- `/api/v2/subscribe`

---

## Testing

### Test Endpoints Locally

```bash
# Subscribe
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Confirm (use token from email)
curl http://localhost:3000/api/confirm?token=abc123

# Unsubscribe (use token from email)
curl "http://localhost:3000/api/unsubscribe?email=test@example.com&token=xyz789"

# Cron (development only)
curl http://localhost:3000/api/cron/daily
```

### Test with Postman

Import this collection:

```json
{
  "info": {
    "name": "Sukoon API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Subscribe",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/subscribe",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@example.com\"}"
        }
      }
    }
  ]
}
```

---

## Support

For API support:

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Open an issue on GitHub
- Contact the development team

---

**Last Updated**: [Date]
**API Version**: 1.0
**Maintained By**: [Team/Person]
