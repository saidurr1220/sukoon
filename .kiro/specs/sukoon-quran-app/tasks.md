# Implementation Plan

- [x] 1. Set up project structure and core configuration
  - Initialize Next.js 14 project with TypeScript and App Router
  - Configure Tailwind CSS with custom theme for Sukoon branding
  - Set up Prisma with Neon PostgreSQL connection
  - Configure environment variables and create .env.example
  - Install and configure required dependencies (Framer Motion, Resend, etc.)
  - _Requirements: 4.1, 4.4, 5.5_

- [x] 2. Create database schema and seed data
  - [x] 2.1 Implement Prisma schema models
    - Define Verse, Translation, Translator, Mood, MoodVerse, Subscriber, and SendLog models
    - Set up proper relationships and constraints
    - Configure unique indexes and foreign keys
    - _Requirements: 6.2, 6.4_

  - [x] 2.2 Create database migration and seed scripts
    - Generate initial Prisma migration
    - Create seed script with sample moods (Happy, Sad, Angry, Anxious, Depressed, Grateful)
    - Add sample verses with Arabic text and translations
    - Populate MoodVerse relationships with weights
    - _Requirements: 1.1, 2.3, 6.1_

  - [x] 2.3 Write database validation tests
    - Test model relationships and constraints
    - Validate unique indexes and foreign key constraints
    - Test seed data integrity
    - _Requirements: 6.5_

- [x] 3. Implement LLM integration system
  - [x] 3.1 Create prompt management system
    - Set up prompt files (system.md, picker.md, daily.md)
    - Implement prompt loading and validation utilities
    - Create LLM client wrapper with error handling
    - _Requirements: 2.1, 2.2, 6.1_

  - [x] 3.2 Build verse selection server action
    - Implement mood-based candidate retrieval from database
    - Create server action that calls LLM with verse IDs only
    - Add response validation and fallback mechanisms
    - Return complete verse data from database after selection
    - _Requirements: 2.1, 2.2, 6.1, 6.5_

  - [x] 3.3 Write LLM integration tests
    - Test prompt loading and validation
    - Mock LLM responses and test selection logic
    - Validate that no Qur'an text is sent to LLM
    - Test fallback mechanisms for LLM failures
    - _Requirements: 2.1, 2.2, 6.5_

- [-] 4. Create core UI components
  - [x] 4.1 Build MoodChips component
    - Create accessible mood selection buttons with proper ARIA labels
    - Implement mood colors (amber, red, blue, violet, slate, green)
    - Add haptic feedback for supported devices
    - Ensure 44px minimum touch target size
    - _Requirements: 1.1, 4.4, 5.4_

  - [x] 4.2 Implement VerseCard component
    - Create RTL-aware Arabic text display with Amiri/Scheherazade fonts
    - Add translation display with proper typography
    - Include Surah:Ayah reference and translator attribution
    - Add audio play button with loading states
    - _Requirements: 1.3, 1.4, 1.5, 2.4, 5.3_

  - [x] 4.3 Build PopupSubscribe component
    - Create modal popup with email input field
    - Implement form validation and submission
    - Add loading states and success/error messages
    - Ensure keyboard accessibility and focus management
    - _Requirements: 3.1, 3.2, 5.2_

  - [x] 4.4 Write component unit tests
    - Test MoodChips interaction and accessibility
    - Test VerseCard RTL rendering and audio controls
    - Test PopupSubscribe form validation and submission
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Implement jar reveal animation system
  - [x] 5.1 Create SVG assets and HeroJar component
    - Set up SVG assets (JarBody.svg, JarLid.svg, PaperSlip.svg)
    - Build HeroJar component with animation state management
    - Implement idle, chipSelected, lidOpening, slipRising, cardUnfold states
    - _Requirements: 4.2, 4.3_

  - [x] 5.2 Build animation sequence with Framer Motion
    - Implement lid rotation (12-15°) and translation (-6px Y)
    - Create paper slip rising animation (-40px Y, 1.06 scale)
    - Add clip-path reveal effect for card unfold
    - Ensure total animation duration ≤ 800ms
    - _Requirements: 4.2, 4.3_

  - [x] 5.3 Add reduced motion support
    - Detect prefers-reduced-motion preference
    - Implement fallback animations (0-50ms duration, no rotation)
    - Maintain functionality while respecting accessibility
    - _Requirements: 4.3, 5.1_

  - [x] 5.4 Write animation performance tests
    - Test animation timing and performance
    - Validate reduced motion fallbacks
    - Test animation state transitions
    - _Requirements: 4.2, 4.3, 5.1_

- [x] 6. Build email subscription system
  - [x] 6.1 Create subscription API routes
    - Implement POST /api/subscribe endpoint
    - Add email validation and duplicate checking

    - Create confirmation token generation and email sending
    - Build GET /api/confirm endpoint for email confirmation
    - _Requirements: 3.2, 3.3_

  - [x] 6.2 Implement daily email cron job
    - Create POST /api/cron/daily endpoint for Vercel Cron

    - Query active confirmed subscribers
    - Build verse selection logic excluding recent sends (30 days)
    - Integrate with LLM daily prompt for verse selection
    - _Requirements: 3.4, 6.3_

  - [x] 6.3 Build email template system
    - Create HTML email template with RTL Arabic support
    - Include translation, attribution, and audio links
    - Add one-click unsubscribe functionality
    - Implement Surah:Ayah subject line formatting
    - _Requirements: 3.4, 3.5, 1.4, 1.5_

  - [x] 6.4 Write email system tests
    - Test double opt-in flow
    - Test daily email selection and sending
    - Test unsubscribe functionality
    - Validate email template rendering
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 6.3_

- [x] 7. Implement main application flow
  - [x] 7.1 Create landing page with mood selection
    - Build responsive landing page layout
    - Integrate HeroJar animation with MoodChips
    - Handle mood selection and verse loading states
    - Add error boundaries and fallback UI
    - _Requirements: 1.1, 1.2, 4.1, 4.4_

  - [x] 7.2 Connect verse selection to UI
    - Wire mood selection to verse selection server action
    - Handle animation completion and verse card display
    - Implement loading states and error handling
    - Add subscription popup trigger after verse reading
    - _Requirements: 1.2, 1.3, 3.1, 6.1_

  - [x] 7.3 Add PWA configuration
    - Configure Next.js PWA plugin

    - Create app manifest with icons and splash screens
    - Implement basic offline functionality
    - Add service worker for caching strategies
    - _Requirements: 4.4, 5.5_

  - [x] 7.4 Write integration tests
    - Test complete mood selection to verse display flow
    - Test subscription popup and email confirmation
    - Test PWA functionality and offline behavior
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 4.4_

- [x] 8. Add accessibility and performance optimizations
  - [x] 8.1 Implement accessibility features
    - Add proper ARIA labels and roles
    - Ensure keyboard navigation support
    - Implement focus management for modals
    - Add screen reader support for Arabic content
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 8.2 Optimize performance and bundle size
    - Implement code splitting and lazy loading
    - Optimize font loading for Arabic typography
    - Add image optimization for SVG assets
    - Configure caching strategies for API routes
    - _Requirements: 4.1, 4.4, 5.5_

  - [x] 8.3 Add content safety disclaimer
    - Create disclaimer component about not being tafsir/fiqh
    - Add proper attribution for translations and audio
    - Include licensing information in footer
    - _Requirements: 2.4, 2.5_

  - [x] 8.4 Write accessibility tests
    - Test keyboard navigation and focus management
    - Validate RTL text rendering and screen reader support
    - Test color contrast ratios
    - Run Lighthouse accessibility audits
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9. Final integration and deployment preparation
  - [x] 9.1 Set up production environment configuration
    - Configure Vercel deployment settings
    - Set up Neon PostgreSQL production database
    - Configure Resend API for production email sending
    - Set up Vercel Cron for daily email scheduling
    - _Requirements: 3.4, 6.2, 6.4_

  - [x] 9.2 Run comprehensive testing suite
    - Execute all unit and integration tests
    - Perform end-to-end testing on mobile devices
    - Validate Lighthouse scores (≥90 for PWA, Performance, Accessibility)
    - Test email delivery and unsubscribe functionality
    - _Requirements: 5.5, 3.4, 3.5_

  - [x] 9.3 Create deployment documentation
    - Write setup and deployment instructions
    - Document environment variable configuration
    - Create troubleshooting guide for common issues
    - _Requirements: 6.5_
