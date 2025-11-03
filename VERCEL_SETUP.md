# Vercel Deployment Setup Checklist

This checklist ensures all Vercel configuration is properly set up for the Sukoon application.

## Pre-Deployment Checklist

- [ ] Git repository is connected to Vercel
- [ ] Neon PostgreSQL database is created and configured
- [ ] Resend API key is generated and domain is verified
- [ ] All environment variables are documented
- [ ] Local build succeeds (`npm run build`)
- [ ] All tests pass (`npm test`)

## Vercel Project Configuration

### 1. Import Project

- [ ] Go to https://vercel.com/new
- [ ] Select your Git provider (GitHub, GitLab, Bitbucket)
- [ ] Import the Sukoon repository
- [ ] Select the correct branch (main/master)

### 2. Build & Development Settings

Configure in Project Settings → General:

- [ ] **Framework Preset**: Next.js
- [ ] **Build Command**: `npm run build` (default)
- [ ] **Output Directory**: `.next` (default)
- [ ] **Install Command**: `npm install` (default)
- [ ] **Development Command**: `npm run dev` (default)
- [ ] **Node.js Version**: 18.x or higher

### 3. Root Directory

- [ ] **Root Directory**: `.` (project root)
- [ ] Leave blank if repository root contains the Next.js app

### 4. Environment Variables

Go to Project Settings → Environment Variables and add all variables from `.env.example`:

#### Required Variables (Production)

- [ ] `DATABASE_URL` - Neon pooled connection string
- [ ] `DIRECT_URL` - Neon direct connection string
- [ ] `RESEND_API_KEY` - Resend API key
- [ ] `NEXT_PUBLIC_APP_NAME` - "Sukoon"
- [ ] `NEXT_PUBLIC_APP_URL` - Your production URL
- [ ] `CRON_SECRET` - Generated secure random string
- [ ] `UNSUBSCRIBE_SECRET` - Generated secure random string

#### Optional Variables (Production)

- [ ] `OPENAI_API_KEY` - If using OpenAI
- [ ] `ANTHROPIC_API_KEY` - If using Anthropic

#### Environment Selection

For each variable, select which environments it applies to:

- [ ] **Production** - Always select for production deployment
- [ ] **Preview** - Select for preview deployments (optional)
- [ ] **Development** - Select for local development (optional)

### 5. Cron Jobs Configuration

The cron job is configured in `vercel.json`. Verify in Vercel Dashboard:

- [ ] Go to Project Settings → Cron Jobs
- [ ] Verify cron job is listed:
  - **Path**: `/api/cron/daily`
  - **Schedule**: `0 6 * * *` (6:00 AM UTC daily)
  - **Status**: Enabled
- [ ] Cron jobs are only available on Pro plans and above

**Note**: If you don't see the Cron Jobs section, you may need to upgrade your Vercel plan.

### 6. Domains Configuration

#### Default Vercel Domain

- [ ] Note your default domain: `your-project.vercel.app`
- [ ] Update `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Redeploy to apply changes

#### Custom Domain (Optional)

- [ ] Go to Project Settings → Domains
- [ ] Click "Add Domain"
- [ ] Enter your custom domain (e.g., `sukoon.app`)
- [ ] Follow DNS configuration instructions:
  - [ ] Add A record or CNAME record as instructed
  - [ ] Wait for DNS propagation (up to 48 hours)
  - [ ] Verify domain is active
- [ ] Update `NEXT_PUBLIC_APP_URL` to custom domain
- [ ] Redeploy application

### 7. Git Integration

Configure in Project Settings → Git:

- [ ] **Production Branch**: `main` or `master`
- [ ] **Ignored Build Step**: Leave empty (build on every push)
- [ ] **Auto-deploy**: Enabled for production branch
- [ ] **Preview Deployments**: Enabled for pull requests (optional)

### 8. Functions Configuration

Configure in Project Settings → Functions:

- [ ] **Region**: Select closest to your users (e.g., `iad1` for US East)
- [ ] **Max Duration**: 10s (default, sufficient for most operations)
- [ ] **Memory**: 1024 MB (default)

**Note**: Cron jobs can run up to 5 minutes on Pro plans.

### 9. Security Headers

The application should include security headers. Verify in `next.config.js`:

- [ ] Content Security Policy (CSP)
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Referrer-Policy

### 10. Analytics (Optional)

Enable Vercel Analytics for monitoring:

- [ ] Go to Project Settings → Analytics
- [ ] Enable Web Analytics
- [ ] Enable Speed Insights (optional)

## Post-Deployment Configuration

### 1. Database Setup

After first deployment, set up the database:

```bash
# Install Vercel CLI
npm install -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run database migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed the database
npm run db:seed
```

- [ ] Database migration completed successfully
- [ ] Prisma client generated
- [ ] Database seeded with initial data

### 2. Verify Deployment

- [ ] Visit your production URL
- [ ] Test mood selection flow
- [ ] Verify jar animation works
- [ ] Test verse card display
- [ ] Check Arabic text rendering (RTL)
- [ ] Test on mobile device

### 3. Test Email Functionality

- [ ] Subscribe with a test email
- [ ] Receive confirmation email
- [ ] Click confirmation link
- [ ] Verify subscription is confirmed in database
- [ ] Test unsubscribe link

### 4. Test Cron Job

Manually trigger the cron job to verify it works:

```bash
curl -X POST https://your-domain.vercel.app/api/cron/daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

- [ ] Cron job executes successfully
- [ ] Email is sent to confirmed subscribers
- [ ] Check Vercel logs for execution details

### 5. Monitor First Scheduled Run

- [ ] Wait for first scheduled run at 6:00 AM UTC
- [ ] Check Vercel Dashboard → Logs
- [ ] Filter by `/api/cron/daily`
- [ ] Verify successful execution
- [ ] Check email delivery in Resend dashboard

### 6. Performance Audit

Run Lighthouse audit:

- [ ] Open production URL in Chrome
- [ ] Open DevTools → Lighthouse
- [ ] Run audit for Mobile
- [ ] Verify scores:
  - [ ] Performance: ≥90
  - [ ] Accessibility: ≥90
  - [ ] Best Practices: ≥90
  - [ ] SEO: ≥90
  - [ ] PWA: ≥90

### 7. Security Verification

- [ ] Verify HTTPS is working
- [ ] Check SSL certificate is valid
- [ ] Test CRON_SECRET protection (unauthorized request should fail)
- [ ] Verify unsubscribe tokens are signed correctly

## Monitoring Setup

### 1. Vercel Dashboard Monitoring

Set up monitoring in Vercel Dashboard:

- [ ] Enable email notifications for deployment failures
- [ ] Set up Slack/Discord integration (optional)
- [ ] Configure error alerts

### 2. Log Monitoring

- [ ] Regularly check Vercel Logs for errors
- [ ] Set up log filters for critical endpoints:
  - `/api/cron/daily`
  - `/api/subscribe`
  - `/api/confirm`
  - `/api/unsubscribe`

### 3. Database Monitoring

- [ ] Monitor Neon dashboard for:
  - Connection count
  - Query performance
  - Storage usage
  - Active queries

### 4. Email Monitoring

- [ ] Monitor Resend dashboard for:
  - Delivery rates
  - Bounce rates
  - Spam complaints
  - API usage

## Troubleshooting

### Build Failures

**Issue**: Build fails on Vercel

- [ ] Check build logs in Vercel Dashboard
- [ ] Verify all dependencies are in `package.json`
- [ ] Ensure `npm run build` works locally
- [ ] Check for TypeScript errors

**Issue**: Environment variables not found during build

- [ ] Verify variables are set in Vercel Dashboard
- [ ] Check variable names match exactly (case-sensitive)
- [ ] Ensure `NEXT_PUBLIC_*` variables are set for build time

### Runtime Errors

**Issue**: Database connection fails

- [ ] Verify `DATABASE_URL` is correct in Vercel
- [ ] Check Neon database is running
- [ ] Verify IP whitelisting (if applicable)

**Issue**: Email sending fails

- [ ] Verify `RESEND_API_KEY` is correct
- [ ] Check Resend dashboard for errors
- [ ] Verify domain is verified (for production)

**Issue**: Cron job not running

- [ ] Verify `vercel.json` is in repository root
- [ ] Check Vercel plan supports cron jobs (Pro+)
- [ ] Verify cron job is enabled in dashboard
- [ ] Check cron job logs for errors

### Performance Issues

**Issue**: Slow response times

- [ ] Check database query performance in Neon
- [ ] Verify function region is close to database
- [ ] Consider enabling caching
- [ ] Optimize database indexes

**Issue**: High memory usage

- [ ] Check function memory usage in Vercel logs
- [ ] Optimize database queries
- [ ] Consider increasing function memory limit

## Rollback Procedure

If deployment causes issues:

1. **Immediate Rollback**:
   - [ ] Go to Vercel Dashboard → Deployments
   - [ ] Find last working deployment
   - [ ] Click "..." → "Promote to Production"

2. **Verify Rollback**:
   - [ ] Test critical functionality
   - [ ] Check error logs
   - [ ] Monitor for 1-2 hours

3. **Investigate Issue**:
   - [ ] Review deployment logs
   - [ ] Check for breaking changes
   - [ ] Test fix locally before redeploying

## Maintenance Schedule

### Daily

- [ ] Check Vercel logs for errors
- [ ] Monitor cron job execution
- [ ] Check email delivery rates

### Weekly

- [ ] Review performance metrics
- [ ] Check database storage usage
- [ ] Review error trends

### Monthly

- [ ] Update dependencies (`npm update`)
- [ ] Review and rotate secrets (if needed)
- [ ] Audit database for cleanup opportunities
- [ ] Review Lighthouse scores

### Quarterly

- [ ] Rotate `CRON_SECRET` and `UNSUBSCRIBE_SECRET`
- [ ] Review and update documentation
- [ ] Audit security practices
- [ ] Review scaling needs

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Neon Documentation**: https://neon.tech/docs
- **Resend Documentation**: https://resend.com/docs
- **Next.js Documentation**: https://nextjs.org/docs

---

**Deployment Date**: [Date]
**Deployed By**: [Name]
**Production URL**: [URL]
**Last Updated**: [Date]
