# Sukoon - Production Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] All features implemented per requirements
- [ ] Documentation updated

### Database Preparation

- [ ] Neon PostgreSQL production database created
- [ ] Connection strings obtained (pooled and direct)
- [ ] Database schema validated (`npx prisma validate`)
- [ ] Seed data prepared (`prisma/seed.ts`)

### Email Service Setup

- [ ] Resend account created
- [ ] Production domain added and verified
- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] API key generated with sending permissions
- [ ] Email templates tested

### Environment Variables

- [ ] All required variables documented
- [ ] Secure secrets generated (`CRON_SECRET`, `UNSUBSCRIBE_SECRET`)
- [ ] LLM API key obtained (OpenAI or Anthropic)
- [ ] Production URLs configured
- [ ] Variables ready to add to Vercel

### Security

- [ ] Secrets are strong and random (32+ characters)
- [ ] No secrets committed to repository
- [ ] `.env` in `.gitignore`
- [ ] HTTPS will be enabled (automatic with Vercel)
- [ ] CRON_SECRET configured for endpoint protection

---

## Vercel Deployment

### 1. Project Setup

- [ ] Repository connected to Vercel
- [ ] Correct branch selected (main/master)
- [ ] Framework preset: Next.js
- [ ] Build settings configured

### 2. Environment Variables

Add all variables in Vercel Dashboard → Environment Variables:

**Required**:

- [ ] `DATABASE_URL` (pooled connection)
- [ ] `DIRECT_URL` (direct connection)
- [ ] `RESEND_API_KEY`
- [ ] `NEXT_PUBLIC_APP_NAME`
- [ ] `NEXT_PUBLIC_APP_URL` (production URL)
- [ ] `CRON_SECRET`
- [ ] `UNSUBSCRIBE_SECRET`

**Optional**:

- [ ] `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`

### 3. Initial Deployment

- [ ] Deploy to Vercel
- [ ] Deployment succeeds
- [ ] Note deployment URL
- [ ] Update `NEXT_PUBLIC_APP_URL` if needed
- [ ] Redeploy if URL changed

### 4. Database Migration

```bash
# Install Vercel CLI
npm install -g vercel

# Link to project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database
npm run db:seed
```

- [ ] Migration completed successfully
- [ ] Database seeded with initial data
- [ ] Verify data in Neon dashboard

### 5. Cron Job Configuration

- [ ] Go to Vercel Dashboard → Cron Jobs
- [ ] Verify cron job listed: `/api/cron/daily` at `0 6 * * *`
- [ ] Cron job is enabled
- [ ] Manually test cron job:
  ```bash
  curl -X POST https://your-domain.vercel.app/api/cron/daily \
    -H "Authorization: Bearer YOUR_CRON_SECRET"
  ```
- [ ] Cron job executes successfully

### 6. Domain Configuration (Optional)

- [ ] Custom domain added in Vercel
- [ ] DNS configured
- [ ] SSL certificate provisioned
- [ ] Domain verified and active
- [ ] `NEXT_PUBLIC_APP_URL` updated to custom domain
- [ ] Application redeployed

---

## Post-Deployment Verification

### Functional Testing

#### 1. Mood Selection Flow

- [ ] Visit production URL
- [ ] All 6 mood chips display
- [ ] Click each mood chip
- [ ] Jar animation plays smoothly
- [ ] Verse card displays correctly
- [ ] Arabic text renders properly (RTL)
- [ ] Translation is readable
- [ ] Surah:Ayah reference is correct

#### 2. Email Subscription

- [ ] Subscribe with test email
- [ ] Confirmation email received (< 2 minutes)
- [ ] Email formatting is correct
- [ ] Confirmation link works
- [ ] Success message displays
- [ ] Subscriber confirmed in database

#### 3. Daily Email

- [ ] Wait for scheduled run (6:00 AM UTC) OR manually trigger
- [ ] Email received by confirmed subscribers
- [ ] Email content correct:
  - [ ] Arabic text (RTL)
  - [ ] Translation
  - [ ] Surah:Ayah in subject
  - [ ] Translator attribution
  - [ ] Unsubscribe link
- [ ] Unsubscribe link works
- [ ] Unsubscribe confirmation displays

#### 4. Mobile Testing

Test on actual devices:

- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet (iPad/Android)

Verify:

- [ ] Responsive layout (390px - 1024px)
- [ ] Touch interactions work
- [ ] Animations smooth
- [ ] Text readable
- [ ] No horizontal scrolling

#### 5. Accessibility

- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible (test with VoiceOver/TalkBack)
- [ ] Reduced motion respected
- [ ] Color contrast sufficient (4.5:1)
- [ ] Touch targets ≥44px

### Performance Testing

#### Lighthouse Audit

Run on production URL:

- [ ] Performance: ≥90
- [ ] Accessibility: ≥90
- [ ] Best Practices: ≥90
- [ ] SEO: ≥90
- [ ] PWA: ≥90

#### Core Web Vitals

- [ ] First Contentful Paint (FCP): < 1.8s
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] Time to Interactive (TTI): < 3.8s
- [ ] Total Blocking Time (TBT): < 200ms
- [ ] Cumulative Layout Shift (CLS): < 0.1

### Security Testing

#### Endpoint Security

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Cron endpoint protected (401 without secret)
- [ ] Unsubscribe tokens validated
- [ ] No sensitive data in client-side code
- [ ] Environment variables not exposed

#### Test Unauthorized Access

```bash
# Should return 401
curl -X POST https://your-domain.com/api/cron/daily

# Should return 200
curl -X POST https://your-domain.com/api/cron/daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

- [ ] Unauthorized requests rejected
- [ ] Authorized requests succeed

---

## Monitoring Setup

### Vercel Monitoring

- [ ] Enable Vercel Analytics
- [ ] Enable Speed Insights
- [ ] Set up deployment notifications
- [ ] Configure error alerts
- [ ] Set up Slack/Discord integration (optional)

### Database Monitoring

- [ ] Monitor Neon dashboard:
  - [ ] Connection count
  - [ ] Query performance
  - [ ] Storage usage
  - [ ] Active queries

### Email Monitoring

- [ ] Monitor Resend dashboard:
  - [ ] Delivery rates
  - [ ] Bounce rates
  - [ ] Spam complaints
  - [ ] API usage

### Cron Job Monitoring

- [ ] Check Vercel logs for cron execution
- [ ] Set up alerts for cron failures
- [ ] Monitor email delivery after cron runs

---

## Documentation

### Update Documentation

- [ ] Update README.md with production URL
- [ ] Document any production-specific configurations
- [ ] Update DEPLOYMENT.md with actual deployment date
- [ ] Add team contact information
- [ ] Document any known issues or limitations

### Team Communication

- [ ] Notify team of deployment
- [ ] Share production URL
- [ ] Share monitoring dashboard access
- [ ] Document on-call procedures
- [ ] Schedule post-deployment review

---

## Rollback Plan

### If Issues Occur

#### Immediate Rollback

1. [ ] Go to Vercel Dashboard → Deployments
2. [ ] Find last working deployment
3. [ ] Click "..." → "Promote to Production"
4. [ ] Verify rollback successful
5. [ ] Notify team

#### Database Rollback (if needed)

1. [ ] Contact Neon support for point-in-time recovery
2. [ ] Restore to pre-deployment state
3. [ ] Verify data integrity
4. [ ] Re-run migrations if needed

#### Communication

- [ ] Notify users of issues (if applicable)
- [ ] Update status page (if available)
- [ ] Document incident for post-mortem

---

## Post-Deployment Tasks

### First 24 Hours

- [ ] Monitor error logs continuously
- [ ] Check cron job execution (6:00 AM UTC)
- [ ] Verify email delivery rates
- [ ] Monitor performance metrics
- [ ] Check user feedback/reports

### First Week

- [ ] Review Lighthouse scores daily
- [ ] Monitor database performance
- [ ] Check email deliverability
- [ ] Review error rates
- [ ] Gather user feedback

### First Month

- [ ] Analyze usage patterns
- [ ] Review performance trends
- [ ] Optimize based on real data
- [ ] Plan improvements
- [ ] Schedule maintenance

---

## Maintenance Schedule

### Daily

- [ ] Check Vercel logs for errors
- [ ] Monitor cron job execution
- [ ] Review email delivery rates

### Weekly

- [ ] Review performance metrics
- [ ] Check database storage usage
- [ ] Analyze error trends
- [ ] Update dependencies (if needed)

### Monthly

- [ ] Run full test suite
- [ ] Update dependencies (`npm update`)
- [ ] Review security advisories
- [ ] Audit database for cleanup
- [ ] Review and optimize queries

### Quarterly

- [ ] Rotate secrets (`CRON_SECRET`, `UNSUBSCRIBE_SECRET`)
- [ ] Review and update documentation
- [ ] Conduct security audit
- [ ] Review scaling needs
- [ ] Plan feature updates

---

## Success Criteria

Deployment is considered successful when:

- [ ] All functional tests pass
- [ ] Lighthouse scores ≥90
- [ ] No critical errors in logs
- [ ] Email delivery rate >95%
- [ ] Cron job executes successfully
- [ ] Mobile experience is smooth
- [ ] Accessibility requirements met
- [ ] Security tests pass
- [ ] Monitoring is active
- [ ] Team is notified and trained

---

## Emergency Contacts

Document your emergency contacts:

- **DevOps Lead**: [Name, Contact]
- **Database Admin**: [Name, Contact]
- **Email Service**: support@resend.com
- **Vercel Support**: https://vercel.com/support
- **Neon Support**: https://neon.tech/docs/introduction/support
- **On-Call Engineer**: [Name, Contact]

---

## Resources

- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Vercel Setup**: [VERCEL_SETUP.md](VERCEL_SETUP.md)
- **Environment Variables**: [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)
- **Testing Guide**: [TESTING.md](TESTING.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **API Documentation**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## Sign-Off

**Deployment Completed By**: **********\_********** Date: **\_**

**Verified By**: **********\_********** Date: **\_**

**Production URL**: **********\_**********

**Deployment Notes**:

---

---

---

---

**Last Updated**: [Date]
**Version**: 1.0
