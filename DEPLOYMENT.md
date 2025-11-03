# Sukoon - Deployment Guide

This guide covers the complete deployment process for the Sukoon Qur'an application to Vercel with Neon PostgreSQL and Resend email service.

## Prerequisites

Before deploying, ensure you have:

- A Vercel account (https://vercel.com)
- A Neon PostgreSQL database (https://neon.tech)
- A Resend API key (https://resend.com)
- Node.js 18+ installed locally
- Git repository connected to Vercel

## Production Environment Setup

### 1. Neon PostgreSQL Database Setup

1. **Create a Neon Project**:
   - Go to https://console.neon.tech
   - Click "Create Project"
   - Name it "sukoon-production"
   - Select a region close to your users (e.g., US East for North America)

2. **Get Connection Strings**:
   - Navigate to your project dashboard
   - Copy the **Pooled Connection** string (for `DATABASE_URL`)
   - Copy the **Direct Connection** string (for `DIRECT_URL`)
   - Format: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

3. **Configure Connection Pooling**:
   - Neon automatically provides connection pooling
   - Use the pooled connection for application queries
   - Use the direct connection for Prisma migrations

### 2. Resend Email Service Setup

1. **Create Resend Account**:
   - Go to https://resend.com
   - Sign up and verify your account

2. **Add and Verify Domain** (Recommended for production):
   - Go to Domains section
   - Add your domain (e.g., sukoon.app)
   - Add the provided DNS records (SPF, DKIM, DMARC)
   - Wait for verification (usually 24-48 hours)

3. **Generate API Key**:
   - Go to API Keys section
   - Create a new API key with "Sending access"
   - Copy the key (starts with `re_`)
   - Store it securely

### 3. Vercel Deployment Configuration

1. **Connect Repository**:
   - Go to https://vercel.com/new
   - Import your Git repository
   - Select the main/master branch

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**:

   Go to Project Settings → Environment Variables and add:

   ```
   # Database Configuration
   DATABASE_URL=postgresql://[user]:[password]@[host]-pooler.neon.tech/[database]?sslmode=require
   DIRECT_URL=postgresql://[user]:[password]@[host].neon.tech/[database]?sslmode=require

   # Email Service
   RESEND_API_KEY=re_your_actual_api_key_here

   # Application Configuration
   NEXT_PUBLIC_APP_NAME=Sukoon
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

   # Security Secrets (generate secure random strings)
   CRON_SECRET=your_secure_random_string_here
   UNSUBSCRIBE_SECRET=your_secure_random_string_for_tokens

   # LLM Configuration (if using OpenAI or Anthropic)
   OPENAI_API_KEY=sk-your_openai_key_here
   # OR
   ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
   ```

   **Important**: Set all variables for "Production" environment

4. **Generate Secure Secrets**:

   Use this command to generate secure random strings:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Run it twice to generate:
   - `CRON_SECRET` - Protects the daily email cron endpoint
   - `UNSUBSCRIBE_SECRET` - Signs unsubscribe tokens

### 4. Database Migration

After deploying to Vercel, run the database migration:

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. **Link to Your Project**:

   ```bash
   vercel link
   ```

3. **Pull Environment Variables**:

   ```bash
   vercel env pull .env.production
   ```

4. **Run Prisma Migration**:

   ```bash
   npx prisma migrate deploy
   ```

5. **Generate Prisma Client**:

   ```bash
   npx prisma generate
   ```

6. **Seed the Database**:
   ```bash
   npm run db:seed
   ```

### 5. Vercel Cron Job Configuration

The cron job is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 6 * * *"
    }
  ]
}
```

This runs daily at 6:00 AM UTC. To change the schedule:

- `0 6 * * *` - 6:00 AM UTC daily
- `0 12 * * *` - 12:00 PM UTC daily
- `0 0 * * *` - Midnight UTC daily

**Verify Cron Setup**:

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. Confirm the cron job is listed and enabled
3. Check the "Last Run" status after the first execution

### 6. Domain Configuration (Optional)

1. **Add Custom Domain**:
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., sukoon.app)
   - Follow DNS configuration instructions

2. **Update Environment Variables**:
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain
   - Redeploy the application

3. **Configure SSL**:
   - Vercel automatically provisions SSL certificates
   - Verify HTTPS is working

## Post-Deployment Verification

### 1. Test Application Functionality

1. **Visit Your Application**:

   ```
   https://your-domain.vercel.app
   ```

2. **Test Mood Selection**:
   - Select a mood chip
   - Verify jar animation plays
   - Confirm verse card displays correctly

3. **Test Arabic Text Rendering**:
   - Verify RTL text direction
   - Check font rendering (Amiri/Scheherazade)
   - Test on mobile devices

### 2. Test Email Subscription Flow

1. **Subscribe with Test Email**:
   - Click subscription popup
   - Enter a test email address
   - Check for confirmation email

2. **Verify Confirmation**:
   - Click confirmation link in email
   - Verify success message

3. **Test Unsubscribe**:
   - Click unsubscribe link in any email
   - Verify unsubscribe confirmation

### 3. Test Daily Cron Job

**Manual Test** (before first scheduled run):

```bash
curl -X POST https://your-domain.vercel.app/api/cron/daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

Expected response:

```json
{
  "success": true,
  "message": "Daily emails processed",
  "sent": 1,
  "failed": 0,
  "total": 1
}
```

**Monitor Cron Execution**:

1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by `/api/cron/daily`
3. Check for successful executions at 6:00 AM UTC

### 4. Run Lighthouse Audit

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit for:
   - Performance (target: ≥90)
   - PWA (target: ≥90)
   - Accessibility (target: ≥90)
   - Best Practices (target: ≥90)

4. Address any issues found

## Monitoring and Maintenance

### 1. Set Up Monitoring

**Vercel Analytics**:

- Enable in Project Settings → Analytics
- Monitor page views, performance metrics

**Error Tracking**:

- Check Vercel Logs regularly
- Set up alerts for 5xx errors

**Database Monitoring**:

- Monitor Neon dashboard for:
  - Connection count
  - Query performance
  - Storage usage

### 2. Email Deliverability

**Monitor Resend Dashboard**:

- Check email delivery rates
- Monitor bounce rates
- Review spam complaints

**DNS Health**:

- Verify SPF, DKIM, DMARC records remain valid
- Use tools like MXToolbox to check email reputation

### 3. Database Maintenance

**Regular Tasks**:

- Monitor database size growth
- Review slow queries in Neon dashboard
- Clean up old SendLog entries (optional)

**Backup Strategy**:

- Neon provides automatic backups
- Consider exporting critical data periodically

### 4. Security Updates

**Regular Updates**:

```bash
npm audit
npm update
```

**Dependency Monitoring**:

- Enable Dependabot on GitHub
- Review and merge security updates promptly

## Scaling Considerations

### When to Scale

Monitor these metrics:

- Database connection count approaching limit
- Email sending rate approaching Resend limits
- Response times increasing
- Error rates increasing

### Scaling Options

**Database**:

- Upgrade Neon plan for more connections
- Enable read replicas for better performance
- Optimize queries with indexes

**Email Service**:

- Upgrade Resend plan for higher sending limits
- Implement email queue for better reliability

**Application**:

- Vercel automatically scales serverless functions
- Consider Edge Functions for better global performance
- Implement caching strategies for frequently accessed data

## Rollback Procedure

If issues occur after deployment:

1. **Instant Rollback**:
   - Go to Vercel Dashboard → Deployments
   - Find the last working deployment
   - Click "..." → "Promote to Production"

2. **Database Rollback** (if needed):
   - Neon provides point-in-time recovery
   - Contact Neon support for assistance

3. **Verify Rollback**:
   - Test critical functionality
   - Check error logs
   - Monitor for a few hours

## Support and Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Neon Documentation**: https://neon.tech/docs
- **Resend Documentation**: https://resend.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs

## Emergency Contacts

Document your emergency contacts:

- DevOps Lead: [contact info]
- Database Admin: [contact info]
- Email Service Support: support@resend.com
- Vercel Support: https://vercel.com/support

---

**Last Updated**: [Date]
**Maintained By**: [Team/Person]
