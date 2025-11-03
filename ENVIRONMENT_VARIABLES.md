# Environment Variables Configuration

This document describes all environment variables used in the Sukoon application, their purpose, and how to configure them.

## Required Variables

### Database Configuration

#### `DATABASE_URL`

- **Required**: Yes
- **Type**: Connection String
- **Description**: PostgreSQL connection string for application queries (pooled connection)
- **Format**: `postgresql://[user]:[password]@[host]-pooler.neon.tech/[database]?sslmode=require`
- **Example**: `postgresql://neondb_owner:password123@ep-cool-sound-123456-pooler.us-east-1.aws.neon.tech/sukoon?sslmode=require`
- **Where to Get**: Neon Console → Connection Details → Pooled Connection
- **Used By**: Prisma Client for all database queries

#### `DIRECT_URL`

- **Required**: Yes (for migrations)
- **Type**: Connection String
- **Description**: PostgreSQL direct connection string for Prisma migrations
- **Format**: `postgresql://[user]:[password]@[host].neon.tech/[database]?sslmode=require`
- **Example**: `postgresql://neondb_owner:password123@ep-cool-sound-123456.us-east-1.aws.neon.tech/sukoon?sslmode=require`
- **Where to Get**: Neon Console → Connection Details → Direct Connection
- **Used By**: Prisma migrations and schema operations

**Important**: The difference between `DATABASE_URL` and `DIRECT_URL`:

- `DATABASE_URL` uses `-pooler` in the hostname for connection pooling
- `DIRECT_URL` connects directly to the database without pooling
- Always use pooled connection for application, direct for migrations

### Email Service Configuration

#### `RESEND_API_KEY`

- **Required**: Yes
- **Type**: API Key
- **Description**: Resend API key for sending emails
- **Format**: `re_[alphanumeric_string]`
- **Example**: `re_hXQLwcZH_NmZk63HBKJhVxWx2ikEnfVve`
- **Where to Get**: Resend Dashboard → API Keys → Create API Key
- **Used By**: Email sending functions in `src/lib/email-templates.ts`
- **Permissions**: Requires "Sending access" permission

### Application Configuration

#### `NEXT_PUBLIC_APP_NAME`

- **Required**: Yes
- **Type**: String
- **Description**: Application name displayed in UI and emails
- **Default**: `Sukoon`
- **Example**: `Sukoon`
- **Used By**: UI components, email templates, PWA manifest

#### `NEXT_PUBLIC_APP_URL`

- **Required**: Yes
- **Type**: URL
- **Description**: Full URL of the application (used for links in emails)
- **Format**: `https://[domain]` or `http://localhost:3000` (development)
- **Example Production**: `https://sukoon.vercel.app`
- **Example Development**: `http://localhost:3000`
- **Used By**: Email templates (confirmation links, unsubscribe links)

**Important**: Must be updated when deploying to production or using custom domain

## Security Variables

### `CRON_SECRET`

- **Required**: Highly Recommended for Production
- **Type**: Random String (32+ characters)
- **Description**: Secret token to authenticate cron job requests
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
- **How to Generate**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Used By**: `/api/cron/daily` endpoint to verify authorized requests
- **Security**: Without this, anyone could trigger the daily email cron job

**Usage in Cron Request**:

```bash
curl -X POST https://your-domain.com/api/cron/daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### `UNSUBSCRIBE_SECRET`

- **Required**: Highly Recommended for Production
- **Type**: Random String (32+ characters)
- **Description**: Secret key for signing unsubscribe tokens
- **Example**: `z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1`
- **How to Generate**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Used By**: Email unsubscribe functionality to prevent token tampering
- **Security**: Ensures unsubscribe links cannot be forged

## Optional Variables

### LLM Configuration

#### `OPENAI_API_KEY`

- **Required**: No (if using OpenAI for verse selection)
- **Type**: API Key
- **Description**: OpenAI API key for GPT models
- **Format**: `sk-[alphanumeric_string]`
- **Example**: `sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`
- **Where to Get**: OpenAI Platform → API Keys
- **Used By**: LLM client in `src/lib/llm-client.ts`
- **Models**: GPT-4, GPT-3.5-turbo

#### `ANTHROPIC_API_KEY`

- **Required**: No (if using Anthropic for verse selection)
- **Type**: API Key
- **Description**: Anthropic API key for Claude models
- **Format**: `sk-ant-[alphanumeric_string]`
- **Example**: `sk-ant-api03-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`
- **Where to Get**: Anthropic Console → API Keys
- **Used By**: LLM client in `src/lib/llm-client.ts`
- **Models**: Claude 3 Opus, Claude 3 Sonnet

**Note**: Configure at least one LLM provider for verse selection to work

## Environment-Specific Configuration

### Development Environment

Create a `.env` file in the project root:

```bash
# Database (can use development database)
DATABASE_URL="postgresql://user:password@localhost:5432/sukoon_dev?sslmode=require"
DIRECT_URL="postgresql://user:password@localhost:5432/sukoon_dev?sslmode=require"

# Email (use Resend test mode)
RESEND_API_KEY="re_test_key_here"

# Application
NEXT_PUBLIC_APP_NAME="Sukoon (Dev)"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Security (optional in development)
# CRON_SECRET="dev_secret_not_for_production"
# UNSUBSCRIBE_SECRET="dev_secret_not_for_production"

# LLM (optional)
OPENAI_API_KEY="sk-your_dev_key_here"
```

### Production Environment

Configure in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Database (production Neon database)
DATABASE_URL="postgresql://user:password@host-pooler.neon.tech/sukoon?sslmode=require"
DIRECT_URL="postgresql://user:password@host.neon.tech/sukoon?sslmode=require"

# Email (production Resend with verified domain)
RESEND_API_KEY="re_production_key_here"

# Application
NEXT_PUBLIC_APP_NAME="Sukoon"
NEXT_PUBLIC_APP_URL="https://sukoon.vercel.app"

# Security (REQUIRED in production)
CRON_SECRET="[64-character-random-hex-string]"
UNSUBSCRIBE_SECRET="[64-character-random-hex-string]"

# LLM
OPENAI_API_KEY="sk-your_production_key_here"
```

## Validation and Testing

### Verify Environment Variables

Create a test script to verify all required variables are set:

```bash
# Check if required variables are set
node -e "
const required = ['DATABASE_URL', 'DIRECT_URL', 'RESEND_API_KEY', 'NEXT_PUBLIC_APP_NAME', 'NEXT_PUBLIC_APP_URL'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error('Missing required environment variables:', missing);
  process.exit(1);
}
console.log('All required environment variables are set ✓');
"
```

### Test Database Connection

```bash
npx prisma db pull
```

Expected: Schema pulled successfully

### Test Email Service

Create a test endpoint or use the subscription flow to verify Resend is working.

### Test Cron Authentication

```bash
# Should fail without secret
curl -X POST https://your-domain.com/api/cron/daily

# Should succeed with secret
curl -X POST https://your-domain.com/api/cron/daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Security Best Practices

### 1. Never Commit Secrets

- Add `.env` to `.gitignore` (already configured)
- Use `.env.example` for documentation only
- Never commit actual API keys or secrets

### 2. Rotate Secrets Regularly

- Rotate `CRON_SECRET` and `UNSUBSCRIBE_SECRET` every 90 days
- Update API keys if compromised
- Use different secrets for development and production

### 3. Limit Access

- Only give production environment access to necessary team members
- Use Vercel's team permissions to control access
- Monitor access logs for suspicious activity

### 4. Use Environment-Specific Values

- Never use production credentials in development
- Use separate databases for dev/staging/production
- Use Resend test mode in development

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

- **Check**: Verify `DATABASE_URL` is correct
- **Check**: Ensure IP is whitelisted in Neon (if applicable)
- **Check**: Verify SSL mode is set to `require`

**Error**: `Migration failed`

- **Check**: Verify `DIRECT_URL` is set and correct
- **Check**: Use direct connection (without `-pooler`) for migrations

### Email Sending Issues

**Error**: `Invalid API key`

- **Check**: Verify `RESEND_API_KEY` is correct
- **Check**: Ensure API key has "Sending access" permission

**Error**: `Domain not verified`

- **Check**: Verify domain in Resend dashboard
- **Check**: Ensure DNS records are properly configured

### Cron Job Issues

**Error**: `Unauthorized` when cron runs

- **Check**: Verify `CRON_SECRET` is set in Vercel
- **Check**: Ensure Vercel Cron is sending the correct Authorization header

**Error**: Cron job not running

- **Check**: Verify `vercel.json` cron configuration
- **Check**: Check Vercel Dashboard → Cron Jobs for status

### LLM Issues

**Error**: `No LLM provider configured`

- **Check**: Set either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- **Check**: Verify API key format is correct

## Migration Guide

### From Development to Production

1. **Export Development Data** (if needed):

   ```bash
   npx prisma db pull
   ```

2. **Set Production Variables** in Vercel Dashboard

3. **Run Production Migration**:

   ```bash
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

4. **Seed Production Database**:

   ```bash
   npm run db:seed
   ```

5. **Verify Application**:
   - Test mood selection
   - Test email subscription
   - Test cron job manually

### Updating Environment Variables

1. **Update in Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Edit the variable
   - Select environments (Production, Preview, Development)

2. **Redeploy** (if needed):
   - Some variables require redeployment
   - `NEXT_PUBLIC_*` variables always require redeployment
   - Server-side variables are updated immediately

3. **Verify Changes**:
   - Check application logs
   - Test affected functionality

---

**Last Updated**: [Date]
**Maintained By**: [Team/Person]
