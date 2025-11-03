# Integration Tests

This directory contains integration tests for the Sukoon application.

## Running Tests

### All Integration Tests

```bash
npm run test:integration
```

### PWA Tests

```bash
npm run test:pwa
```

### All Tests (including unit tests)

```bash
npm test
```

## Test Coverage

### Integration Tests (`integration.test.ts`)

- **Mood to Verse Flow**: Tests complete flow from mood selection to verse display
- **Invalid Mood Handling**: Validates error handling for invalid mood inputs
- **Verse Data Integrity**: Ensures verse data contains valid Arabic text, translations, and attributions
- **Subscription API**: Tests email validation and subscription endpoints (requires server running)

### PWA Tests (`pwa.test.ts`)

- **Manifest Configuration**: Validates manifest.json structure and required fields
- **PWA Setup**: Checks next-pwa configuration in next.config.js
- **Offline Support**: Verifies offline fallback page exists
- **Meta Tags**: Validates PWA-related meta tags in layout

## Manual Testing Recommendations

### Complete User Flow

1. Start the development server: `npm run dev`
2. Open http://localhost:3000
3. Select a mood chip
4. Verify jar animation plays smoothly
5. Verify verse card displays with Arabic text and translation
6. Test audio playback (if available)
7. Wait for subscription popup to appear
8. Test email subscription flow

### PWA Testing

1. Build the production app: `npm run build`
2. Start production server: `npm start`
3. Open Chrome DevTools > Application > Manifest
4. Verify manifest loads correctly
5. Test "Add to Home Screen" functionality
6. Run Lighthouse audit (target PWA score ≥90)
7. Test offline behavior:
   - Go offline in DevTools
   - Navigate to /offline
   - Verify offline page displays

### Accessibility Testing

1. Test keyboard navigation (Tab, Enter, Escape)
2. Test with screen reader
3. Verify color contrast ratios
4. Test with reduced motion preference enabled
5. Verify touch targets are ≥44px

## Notes

- Integration tests require database connection (ensure `.env` is configured)
- Subscription API tests require the development server to be running
- PWA functionality is disabled in development mode by default
