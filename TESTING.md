# Sukoon - Testing Guide

This guide covers all testing procedures for the Sukoon application, including unit tests, integration tests, and manual testing procedures.

## Test Suite Overview

The Sukoon application includes comprehensive tests covering:

- **LLM Integration Tests**: Prompt loading, validation, and verse selection
- **Component Tests**: UI components (MoodChips, VerseCard, PopupSubscribe, HeroJar)
- **Email System Tests**: Subscription flow, daily emails, unsubscribe
- **Integration Tests**: End-to-end user flows
- **PWA Tests**: Progressive Web App functionality
- **Accessibility Tests**: WCAG compliance and keyboard navigation
- **Performance Tests**: Lighthouse audits

## Running Tests

### Run All Tests

```bash
npm test
```

This runs all test suites in sequence:

1. LLM tests
2. Component tests
3. Email system tests
4. Integration tests
5. PWA tests

### Run Individual Test Suites

```bash
# LLM integration tests
npm run test:llm

# Component tests
npm run test:components

# Email system tests
npm run test:email

# Integration tests
npm run test:integration

# PWA tests
npm run test:pwa
```

### Run Specific Test File

```bash
# Run a specific test file
npx tsx src/lib/__tests__/prompts.test.ts
```

## Test Coverage

### 1. LLM Integration Tests

**Location**: `src/lib/__tests__/`

**Files**:

- `prompts.test.ts` - Prompt loading and validation
- `llm-client.test.ts` - LLM client and verse selection

**What's Tested**:

- ✅ Prompt file loading from `prompts/` directory
- ✅ Prompt validation and error handling
- ✅ LLM client initialization
- ✅ Verse selection logic
- ✅ Response validation
- ✅ Fallback mechanisms
- ✅ No Qur'an text sent to LLM (only verse IDs)

**Requirements Covered**: 2.1, 2.2, 6.1, 6.5

### 2. Component Tests

**Location**: `src/components/__tests__/`

**Files**:

- `MoodChips.test.tsx` - Mood selection component
- `VerseCard.test.tsx` - Verse display component
- `PopupSubscribe.test.tsx` - Subscription popup
- `HeroJar.test.tsx` - Jar animation component

**What's Tested**:

- ✅ Component rendering
- ✅ User interactions (clicks, form submissions)
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ RTL text rendering for Arabic
- ✅ Animation state transitions
- ✅ Form validation
- ✅ Error handling

**Requirements Covered**: 1.1, 1.3, 1.4, 1.5, 3.1, 3.2, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4

### 3. Email System Tests

**Location**: `src/lib/__tests__/`

**File**: `email-system.test.ts`

**What's Tested**:

- ✅ Email subscription flow
- ✅ Double opt-in confirmation
- ✅ Daily email selection logic
- ✅ Email template rendering
- ✅ Unsubscribe functionality
- ✅ Duplicate prevention (30-day rule)
- ✅ Database transaction integrity

**Requirements Covered**: 3.2, 3.3, 3.4, 3.5, 6.3

### 4. Integration Tests

**Location**: `src/app/__tests__/`

**File**: `integration.test.ts`

**What's Tested**:

- ✅ Complete mood selection to verse display flow
- ✅ Subscription popup trigger
- ✅ Email confirmation flow
- ✅ Error boundaries and fallback UI
- ✅ Loading states
- ✅ Animation completion

**Requirements Covered**: 1.1, 1.2, 1.3, 3.1, 3.2, 4.4

### 5. PWA Tests

**Location**: `src/app/__tests__/`

**File**: `pwa.test.ts`

**What's Tested**:

- ✅ PWA manifest configuration
- ✅ Service worker registration
- ✅ Offline functionality
- ✅ Caching strategies
- ✅ Install prompt

**Requirements Covered**: 4.4, 5.5

## Manual Testing Procedures

### Pre-Deployment Testing

#### 1. Mood Selection Flow

**Steps**:

1. Open the application
2. Verify 6 mood chips are displayed (Happy, Sad, Angry, Anxious, Depressed, Grateful)
3. Click each mood chip
4. Verify jar animation plays smoothly
5. Verify verse card appears after animation
6. Check Arabic text is displayed correctly (RTL)
7. Verify translation is readable
8. Check Surah:Ayah reference is correct
9. Test audio button (if implemented)

**Expected Results**:

- ✅ All mood chips are clickable
- ✅ Animation completes in ≤800ms
- ✅ Verse card displays correctly
- ✅ Arabic text is RTL and properly formatted
- ✅ No layout issues on mobile (390px width)

**Requirements**: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2

#### 2. Email Subscription Flow

**Steps**:

1. Read a verse completely
2. Verify subscription popup appears
3. Enter a test email address
4. Submit the form
5. Check email inbox for confirmation
6. Click confirmation link
7. Verify success message
8. Check database for confirmed subscriber

**Expected Results**:

- ✅ Popup appears after reading verse
- ✅ Form validation works (invalid emails rejected)
- ✅ Confirmation email received within 1 minute
- ✅ Confirmation link works
- ✅ Subscriber marked as confirmed in database

**Requirements**: 3.1, 3.2, 3.3

#### 3. Daily Email Testing

**Steps**:

1. Manually trigger cron job:
   ```bash
   curl -X POST https://your-domain.com/api/cron/daily \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
2. Check response for success
3. Verify email received
4. Check email content:
   - Arabic text (RTL)
   - Translation
   - Surah:Ayah in subject
   - Translator attribution
   - Unsubscribe link
5. Click unsubscribe link
6. Verify unsubscribe confirmation

**Expected Results**:

- ✅ Cron job executes successfully
- ✅ Email received within 2 minutes
- ✅ Email content is correctly formatted
- ✅ Arabic text displays correctly in email client
- ✅ Unsubscribe link works
- ✅ No duplicate verses sent within 30 days

**Requirements**: 3.4, 3.5, 6.3

#### 4. Accessibility Testing

**Steps**:

1. Test keyboard navigation:
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Test Enter/Space to activate buttons
2. Test with screen reader (NVDA/JAWS/VoiceOver):
   - Verify ARIA labels are read correctly
   - Check Arabic text is announced properly
   - Test form labels and error messages
3. Test reduced motion:
   - Enable prefers-reduced-motion in browser
   - Verify animations are reduced/disabled
   - Check functionality still works
4. Test color contrast:
   - Use browser DevTools or contrast checker
   - Verify all text meets 4.5:1 ratio
5. Test touch targets:
   - Verify all buttons are ≥44px
   - Test on actual mobile device

**Expected Results**:

- ✅ All elements are keyboard accessible
- ✅ Focus indicators are visible
- ✅ Screen reader announces content correctly
- ✅ Reduced motion preference is respected
- ✅ Color contrast meets WCAG AA standards
- ✅ Touch targets are appropriately sized

**Requirements**: 5.1, 5.2, 5.3, 5.4

#### 5. Mobile Device Testing

**Devices to Test**:

- iPhone (Safari)
- Android phone (Chrome)
- Tablet (iPad/Android)

**Steps**:

1. Test on actual devices (not just emulators)
2. Verify responsive layout (390px - 1024px)
3. Test portrait and landscape orientations
4. Check animation performance
5. Test touch interactions
6. Verify haptic feedback (if supported)
7. Test PWA installation
8. Test offline functionality

**Expected Results**:

- ✅ Layout adapts to all screen sizes
- ✅ Animations are smooth (60fps)
- ✅ Touch interactions work correctly
- ✅ PWA can be installed
- ✅ Basic functionality works offline

**Requirements**: 4.1, 4.2, 4.3, 4.4, 5.5

### Performance Testing

#### Lighthouse Audit

**Steps**:

1. Open production URL in Chrome
2. Open DevTools (F12)
3. Go to Lighthouse tab
4. Select:
   - Device: Mobile
   - Categories: All
   - Mode: Navigation
5. Click "Analyze page load"
6. Review results

**Target Scores** (all ≥90):

- ✅ Performance: ≥90
- ✅ Accessibility: ≥90
- ✅ Best Practices: ≥90
- ✅ SEO: ≥90
- ✅ PWA: ≥90

**Common Issues and Fixes**:

**Performance < 90**:

- Optimize images (use WebP, proper sizing)
- Reduce JavaScript bundle size
- Enable caching headers
- Optimize font loading

**Accessibility < 90**:

- Add missing ARIA labels
- Fix color contrast issues
- Ensure proper heading hierarchy
- Add alt text to images

**PWA < 90**:

- Verify manifest.json is correct
- Check service worker registration
- Ensure HTTPS is enabled
- Add offline fallback page

**Requirements**: 5.5

#### Performance Metrics

**Target Metrics**:

- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Total Blocking Time (TBT): < 200ms
- Cumulative Layout Shift (CLS): < 0.1

**How to Measure**:

1. Use Chrome DevTools → Performance tab
2. Record page load
3. Analyze metrics
4. Identify bottlenecks

### Security Testing

#### 1. CRON_SECRET Protection

**Test**:

```bash
# Should fail (401 Unauthorized)
curl -X POST https://your-domain.com/api/cron/daily

# Should succeed (200 OK)
curl -X POST https://your-domain.com/api/cron/daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected**: Unauthorized requests are rejected

#### 2. Unsubscribe Token Validation

**Test**:

1. Get a valid unsubscribe link from an email
2. Modify the token parameter
3. Try to unsubscribe with invalid token

**Expected**: Invalid tokens are rejected

#### 3. SQL Injection Prevention

**Test**:

1. Try SQL injection in email field:
   - `test@example.com'; DROP TABLE subscribers; --`
2. Try in mood selection (if exposed)

**Expected**: All inputs are sanitized, no SQL injection possible

#### 4. XSS Prevention

**Test**:

1. Try XSS in email field:
   - `<script>alert('xss')</script>@example.com`
2. Check if script executes

**Expected**: All inputs are escaped, no XSS possible

## Continuous Integration Testing

### GitHub Actions (Optional)

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

## Test Data Management

### Development Database

**Seed Data**:

- 6 moods (Happy, Sad, Angry, Anxious, Depressed, Grateful)
- 20-30 sample verses with translations
- Sample mood-verse relationships with weights

**Reset Database**:

```bash
npx prisma migrate reset
npm run db:seed
```

### Test Email Addresses

Use these patterns for testing:

- `test+sukoon1@yourdomain.com`
- `test+sukoon2@yourdomain.com`
- `test+sukoon3@yourdomain.com`

Gmail ignores `+` suffixes, so all emails go to `test@yourdomain.com`

## Troubleshooting Test Failures

### Database Connection Errors

**Error**: `Can't reach database server`

**Solutions**:

1. Check `DATABASE_URL` in `.env`
2. Verify database is running
3. Check network connectivity
4. Verify SSL mode is correct

### LLM API Errors

**Error**: `No LLM provider configured`

**Solutions**:

1. Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
2. Verify API key is valid
3. Check API quota/limits

### Email Sending Errors

**Error**: `Invalid API key`

**Solutions**:

1. Verify `RESEND_API_KEY` in `.env`
2. Check API key permissions
3. Verify domain is verified (production)

### Component Test Failures

**Error**: `Element not found`

**Solutions**:

1. Check component is rendering
2. Verify test selectors are correct
3. Check for async rendering issues
4. Add proper wait conditions

## Test Maintenance

### When to Update Tests

- ✅ When adding new features
- ✅ When fixing bugs
- ✅ When refactoring code
- ✅ When requirements change
- ✅ When tests become flaky

### Test Quality Guidelines

- Tests should be deterministic (no random failures)
- Tests should be isolated (no dependencies between tests)
- Tests should be fast (< 5 seconds per test file)
- Tests should be readable (clear test names and assertions)
- Tests should cover edge cases and error conditions

## Reporting Issues

When reporting test failures, include:

1. **Test name**: Which test failed
2. **Error message**: Full error output
3. **Environment**: OS, Node version, browser
4. **Steps to reproduce**: How to trigger the failure
5. **Expected vs Actual**: What should happen vs what happened
6. **Screenshots/Logs**: Visual evidence if applicable

---

**Last Updated**: [Date]
**Maintained By**: [Team/Person]
