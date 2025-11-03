# Sukoon - Troubleshooting Guide

This guide helps diagnose and resolve common issues with the Sukoon application.

## Table of Contents

1. [Database Issues](#database-issues)
2. [Email Delivery Issues](#email-delivery-issues)
3. [Cron Job Issues](#cron-job-issues)
4. [Build and Deployment Issues](#build-and-deployment-issues)
5. [Performance Issues](#performance-issues)
6. [Animation Issues](#animation-issues)
7. [Authentication and Security Issues](#authentication-and-security-issues)
8. [LLM Integration Issues](#llm-integration-issues)

---

## Database Issues

### Issue: Can't reach database server

**Error Message**:

```
Can't reach database server at `[host]:5432`
```

**Possible Causes**:

1. Database URL is incorrect
2. Database is not running
3. Network connectivity issues
4. SSL mode misconfigured

**Solutions**:

1. **Verify DATABASE_URL**:

   ```bash
   # Check environment variable
   echo $DATABASE_URL
   ```

   - Ensure it includes `-pooler` in hostname for pooled connection
   - Verify `sslmode=require` is present

2. **Check Neon Dashboard**:
   - Go to https://console.neon.tech
   - Verify database is active (not suspended)
   - Check connection details match your environment variables

3. **Test Connection**:

   ```bash
   npx prisma db pull
   ```

   - Should succeed if connection is working

4. **Verify SSL Mode**:
   - Neon requires `sslmode=require`
   - Check connection string format:
     ```
     postgresql://user:password@host-pooler.neon.tech/database?sslmode=require
     ```

---

### Issue: Migration failed

**Error Message**:

```
Migration failed: [error details]
```

**Possible Causes**:

1. Using pooled connection for migrations
2. DIRECT_URL not set
3. Schema conflicts

**Solutions**:

1. **Use Direct Connection**:
   - Migrations require `DIRECT_URL` (without `-pooler`)
   - Verify `DIRECT_URL` is set in environment variables

2. **Check Schema**:

   ```bash
   npx prisma validate
   ```

   - Validates schema syntax

3. **Reset Database** (Development Only):

   ```bash
   npx prisma migrate reset
   npm run db:seed
   ```

   - ⚠️ WARNING: This deletes all data

4. **Deploy Migration**:
   ```bash
   npx prisma migrate deploy
   ```

   - Use for production deployments

---

### Issue: Prisma Client not generated

**Error Message**:

```
Cannot find module '@prisma/client'
```

**Solutions**:

1. **Generate Prisma Client**:

   ```bash
   npx prisma generate
   ```

2. **Rebuild Application**:

   ```bash
   npm run build
   ```

3. **Verify Installation**:
   ```bash
   npm install @prisma/client
   ```

---

## Email Delivery Issues

### Issue: Emails not being sent

**Error Message**:

```
Invalid API key
```

**Possible Causes**:

1. RESEND_API_KEY is incorrect
2. API key doesn't have sending permissions
3. Domain not verified (production)

**Solutions**:

1. **Verify API Key**:
   - Go to Resend Dashboard → API Keys
   - Ensure key has "Sending access" permission
   - Copy key exactly (starts with `re_`)

2. **Check Environment Variable**:

   ```bash
   # In Vercel Dashboard
   Project Settings → Environment Variables → RESEND_API_KEY
   ```

3. **Verify Domain** (Production):
   - Go to Resend Dashboard → Domains
   - Ensure domain is verified (green checkmark)
   - Check DNS records (SPF, DKIM, DMARC)

4. **Test Email Sending**:
   ```bash
   # Use subscription flow to test
   # Or check Resend logs for errors
   ```

---

### Issue: Emails going to spam

**Possible Causes**:

1. Domain not verified
2. Missing SPF/DKIM/DMARC records
3. Poor email reputation

**Solutions**:

1. **Verify Domain**:
   - Add domain in Resend Dashboard
   - Add all required DNS records
   - Wait 24-48 hours for verification

2. **Check DNS Records**:
   - Use MXToolbox.com to verify:
     - SPF record
     - DKIM record
     - DMARC record

3. **Improve Email Content**:
   - Avoid spam trigger words
   - Include unsubscribe link (already implemented)
   - Use proper HTML formatting

4. **Monitor Reputation**:
   - Check Resend Dashboard for bounce rates
   - Monitor spam complaints
   - Remove invalid email addresses

---

### Issue: Confirmation emails not received

**Possible Causes**:

1. Email in spam folder
2. Email address typo
3. Email service delay

**Solutions**:

1. **Check Spam Folder**:
   - Ask user to check spam/junk folder
   - Add sender to safe senders list

2. **Verify Email Address**:
   - Check database for subscriber record
   - Verify email address is correct

3. **Check Resend Logs**:
   - Go to Resend Dashboard → Logs
   - Look for delivery status
   - Check for bounce or rejection

4. **Resend Confirmation**:
   - Delete subscriber record
   - Re-subscribe with correct email

---

## Cron Job Issues

### Issue: Cron job not running

**Possible Causes**:

1. Cron jobs not available on plan
2. vercel.json misconfigured
3. Cron job disabled

**Solutions**:

1. **Check Vercel Plan**:
   - Cron jobs require Pro plan or higher
   - Upgrade if on Hobby plan

2. **Verify vercel.json**:

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

   - Must be in repository root
   - Commit and push changes

3. **Check Cron Status**:
   - Go to Vercel Dashboard → Project → Settings → Cron Jobs
   - Verify cron job is listed and enabled

4. **Redeploy**:
   - Redeploy application after vercel.json changes
   - Cron jobs are configured during deployment

---

### Issue: Cron job returns 401 Unauthorized

**Error Message**:

```
{"success": false, "error": "Unauthorized"}
```

**Possible Causes**:

1. CRON_SECRET not set
2. Vercel not sending Authorization header
3. CRON_SECRET mismatch

**Solutions**:

1. **Set CRON_SECRET**:

   ```bash
   # Generate secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   - Add to Vercel environment variables

2. **Verify Environment Variable**:
   - Go to Vercel Dashboard → Environment Variables
   - Ensure CRON_SECRET is set for Production

3. **Redeploy**:
   - Redeploy after adding environment variable

4. **Manual Test**:
   ```bash
   curl -X POST https://your-domain.com/api/cron/daily \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

---

### Issue: Cron job times out

**Error Message**:

```
Function execution timed out
```

**Possible Causes**:

1. Too many subscribers
2. Slow database queries
3. Email sending delays

**Solutions**:

1. **Optimize Database Queries**:
   - Add indexes to frequently queried fields
   - Use pagination for large subscriber lists

2. **Batch Email Sending**:
   - Process subscribers in batches
   - Add delays between batches if needed

3. **Increase Timeout** (Pro Plan):
   - Go to Vercel Dashboard → Functions
   - Increase max duration (up to 5 minutes on Pro)

4. **Monitor Execution Time**:
   - Check Vercel logs for execution duration
   - Optimize slow operations

---

## Build and Deployment Issues

### Issue: Build fails on Vercel

**Error Message**:

```
Build failed with exit code 1
```

**Possible Causes**:

1. TypeScript errors
2. Missing dependencies
3. Environment variables not set

**Solutions**:

1. **Check Build Logs**:
   - Go to Vercel Dashboard → Deployments → [Failed Deployment]
   - Review build logs for specific errors

2. **Test Build Locally**:

   ```bash
   npm run build
   ```

   - Fix any errors that appear

3. **Verify Dependencies**:

   ```bash
   npm install
   ```

   - Ensure all dependencies are in package.json

4. **Check Environment Variables**:
   - Verify all required variables are set in Vercel
   - `NEXT_PUBLIC_*` variables must be set at build time

---

### Issue: Environment variables not found

**Error Message**:

```
Environment variable [NAME] is not defined
```

**Solutions**:

1. **Set in Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add missing variable
   - Select correct environment (Production/Preview/Development)

2. **Redeploy**:
   - Redeploy after adding environment variables
   - `NEXT_PUBLIC_*` variables require redeployment

3. **Check Variable Names**:
   - Variable names are case-sensitive
   - Verify spelling matches exactly

---

### Issue: Deployment succeeds but app doesn't work

**Possible Causes**:

1. Database not migrated
2. Environment variables incorrect
3. Runtime errors

**Solutions**:

1. **Check Runtime Logs**:
   - Go to Vercel Dashboard → Logs
   - Filter by time period
   - Look for error messages

2. **Verify Database**:

   ```bash
   # Pull environment variables
   vercel env pull .env.production

   # Run migration
   npx prisma migrate deploy
   ```

3. **Test Endpoints**:

   ```bash
   # Test API endpoints
   curl https://your-domain.com/api/health
   ```

4. **Check Browser Console**:
   - Open browser DevTools
   - Look for JavaScript errors
   - Check Network tab for failed requests

---

## Performance Issues

### Issue: Slow page load times

**Symptoms**:

- Pages take > 3 seconds to load
- Poor Lighthouse scores

**Solutions**:

1. **Optimize Images**:
   - Use WebP format
   - Proper image sizing
   - Lazy loading

2. **Reduce JavaScript Bundle**:

   ```bash
   # Analyze bundle size
   npm run build
   ```

   - Remove unused dependencies
   - Use dynamic imports

3. **Enable Caching**:
   - Add cache headers to API routes
   - Use Vercel Edge Caching

4. **Optimize Fonts**:
   - Use font-display: swap
   - Preload critical fonts
   - Subset fonts if possible

---

### Issue: High database query times

**Symptoms**:

- Slow API responses
- Database connection timeouts

**Solutions**:

1. **Add Indexes**:

   ```prisma
   @@index([field_name])
   ```

   - Add indexes to frequently queried fields

2. **Optimize Queries**:
   - Use `select` to limit returned fields
   - Avoid N+1 queries
   - Use `include` efficiently

3. **Enable Connection Pooling**:
   - Use pooled connection (DATABASE_URL with `-pooler`)
   - Adjust pool size in Neon if needed

4. **Monitor Query Performance**:
   - Check Neon dashboard for slow queries
   - Use Prisma query logging

---

## Animation Issues

### Issue: Animations are choppy

**Symptoms**:

- Jar animation stutters
- Frame drops during animation

**Solutions**:

1. **Check Device Performance**:
   - Test on different devices
   - Low-end devices may struggle

2. **Optimize Animation Properties**:
   - Use only transform and opacity
   - Avoid animating layout properties
   - Already implemented in HeroJar component

3. **Reduce Animation Complexity**:
   - Simplify SVG paths
   - Reduce number of animated elements

4. **Enable Hardware Acceleration**:
   - Use `will-change: transform` (already implemented)
   - Ensure GPU acceleration is enabled

---

### Issue: Reduced motion not working

**Symptoms**:

- Animations still play with prefers-reduced-motion enabled

**Solutions**:

1. **Check Browser Settings**:
   - Windows: Settings → Accessibility → Visual effects → Animation effects
   - macOS: System Preferences → Accessibility → Display → Reduce motion
   - Browser: Check browser-specific settings

2. **Verify Implementation**:
   - Check HeroJar component
   - Ensure reduced motion fallbacks are implemented

3. **Test Detection**:
   ```javascript
   const prefersReducedMotion = window.matchMedia(
     "(prefers-reduced-motion: reduce)"
   ).matches;
   console.log("Reduced motion:", prefersReducedMotion);
   ```

---

## Authentication and Security Issues

### Issue: Unsubscribe links not working

**Error Message**:

```
Invalid token
```

**Possible Causes**:

1. UNSUBSCRIBE_SECRET not set
2. Token expired or tampered
3. Token format incorrect

**Solutions**:

1. **Set UNSUBSCRIBE_SECRET**:

   ```bash
   # Generate secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   - Add to Vercel environment variables

2. **Verify Token Generation**:
   - Check email template
   - Ensure token is generated correctly

3. **Check Token Validation**:
   - Review unsubscribe API route
   - Verify HMAC validation logic

---

### Issue: CORS errors

**Error Message**:

```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solutions**:

1. **Add CORS Headers**:

   ```typescript
   // In API route
   headers: {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
   }
   ```

2. **Use Same Origin**:
   - Ensure API calls use same domain
   - Use relative URLs: `/api/...`

3. **Configure Next.js**:
   ```javascript
   // next.config.js
   async headers() {
     return [
       {
         source: '/api/:path*',
         headers: [
           { key: 'Access-Control-Allow-Origin', value: '*' },
         ],
       },
     ];
   }
   ```

---

## LLM Integration Issues

### Issue: No LLM provider configured

**Error Message**:

```
No LLM provider configured
```

**Solutions**:

1. **Set API Key**:
   - Set either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
   - Add to Vercel environment variables

2. **Verify API Key Format**:
   - OpenAI: `sk-...`
   - Anthropic: `sk-ant-...`

3. **Test API Key**:
   ```bash
   # Test OpenAI
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

---

### Issue: LLM API rate limit exceeded

**Error Message**:

```
Rate limit exceeded
```

**Solutions**:

1. **Check API Usage**:
   - Review API dashboard for usage
   - Verify you haven't exceeded quota

2. **Implement Retry Logic**:
   - Already implemented in llm-client.ts
   - Exponential backoff for rate limits

3. **Upgrade API Plan**:
   - Increase rate limits by upgrading plan

4. **Implement Caching**:
   - Cache verse selections
   - Reduce API calls

---

### Issue: LLM returns invalid response

**Error Message**:

```
Invalid response format
```

**Solutions**:

1. **Check Prompt**:
   - Verify prompt files are correct
   - Ensure JSON format is specified

2. **Validate Response**:
   - Check response validation logic
   - Review error logs for details

3. **Use Fallback**:
   - Fallback mechanism already implemented
   - Returns default verse if LLM fails

---

## Getting Help

### Check Logs

**Vercel Logs**:

```
Vercel Dashboard → Your Project → Logs
```

- Filter by time period
- Search for specific errors
- Check function execution times

**Neon Logs**:

```
Neon Console → Your Project → Monitoring
```

- Check query performance
- Monitor connection count
- Review slow queries

**Resend Logs**:

```
Resend Dashboard → Logs
```

- Check email delivery status
- Review bounce rates
- Monitor API usage

### Debug Mode

Enable debug logging:

```bash
# Add to environment variables
DEBUG=true
NODE_ENV=development
```

### Contact Support

- **Vercel Support**: https://vercel.com/support
- **Neon Support**: https://neon.tech/docs/introduction/support
- **Resend Support**: support@resend.com
- **Project Issues**: [Your GitHub Issues URL]

---

## Common Error Codes

| Code  | Description                 | Solution                       |
| ----- | --------------------------- | ------------------------------ |
| P1001 | Can't reach database        | Check DATABASE_URL and network |
| P2002 | Unique constraint violation | Check for duplicate data       |
| P2025 | Record not found            | Verify record exists           |
| 401   | Unauthorized                | Check authentication tokens    |
| 429   | Rate limit exceeded         | Reduce request frequency       |
| 500   | Internal server error       | Check server logs              |
| 503   | Service unavailable         | Check service status           |

---

**Last Updated**: [Date]
**Maintained By**: [Team/Person]
