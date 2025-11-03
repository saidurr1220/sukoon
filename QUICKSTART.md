# Sukoon - Quick Start Guide

Get the Sukoon application running locally in under 10 minutes.

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18 or higher installed
- ✅ npm or yarn package manager
- ✅ Git installed
- ✅ A code editor (VS Code recommended)

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd sukoon-quran-app

# Install dependencies
npm install
```

## Step 2: Set Up Environment Variables (3 minutes)

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and add your credentials:

### Required for Basic Functionality

```bash
# Database (get from Neon Console)
DATABASE_URL="postgresql://user:password@host-pooler.neon.tech/sukoon?sslmode=require"
DIRECT_URL="postgresql://user:password@host.neon.tech/sukoon?sslmode=require"

# Email Service (get from Resend Dashboard)
RESEND_API_KEY="re_your_api_key_here"

# Application
NEXT_PUBLIC_APP_NAME="Sukoon"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Optional (for LLM features)

```bash
# Add ONE of these for verse selection
OPENAI_API_KEY="sk-your_openai_key_here"
# OR
ANTHROPIC_API_KEY="sk-ant-your_anthropic_key_here"
```

### Don't Have Credentials Yet?

**Neon PostgreSQL** (Free):

1. Go to https://console.neon.tech
2. Sign up and create a project
3. Copy connection strings

**Resend Email** (Free tier available):

1. Go to https://resend.com
2. Sign up and verify email
3. Create API key

**OpenAI** (Optional):

1. Go to https://platform.openai.com
2. Create account and add payment method
3. Generate API key

## Step 3: Set Up Database (2 minutes)

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

Expected output:

```
✓ Prisma client generated
✓ Database schema pushed
✓ Database seeded with 6 moods and sample verses
```

## Step 4: Start Development Server (1 minute)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

You should see:

- 6 mood chips (Happy, Sad, Angry, Anxious, Depressed, Grateful)
- Jar animation in the center
- Clean, mobile-first design

## Step 5: Test the Application (2 minutes)

### Test Mood Selection

1. Click any mood chip
2. Watch the jar animation (lid opens, paper slip rises)
3. See a verse card with:
   - Arabic text (right-to-left)
   - English translation
   - Surah:Ayah reference

### Test Email Subscription

1. Read a verse completely
2. Subscription popup should appear
3. Enter your email
4. Check inbox for confirmation email
5. Click confirmation link

### Test Cron Job (Optional)

```bash
# Manually trigger daily email
curl -X POST http://localhost:3000/api/cron/daily
```

## Verify Installation

Run the test suite to ensure everything is working:

```bash
npm test
```

Expected results:

- ✅ LLM Integration Tests: PASSED
- ✅ Component Tests: PASSED
- ⚠️ Email System Tests: PARTIAL (some require database)
- ⚠️ Integration Tests: May require database connection

## Common Issues

### Database Connection Failed

**Error**: `Can't reach database server`

**Solution**:

1. Verify `DATABASE_URL` in `.env`
2. Check Neon database is active
3. Ensure `sslmode=require` is in connection string

### Email Not Sending

**Error**: `Invalid API key`

**Solution**:

1. Verify `RESEND_API_KEY` in `.env`
2. Check API key has "Sending access" permission
3. Restart development server

### Build Errors

**Error**: `Cannot find module '@prisma/client'`

**Solution**:

```bash
npm run db:generate
npm run build
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:

```bash
# Use different port
PORT=3001 npm run dev
```

## Next Steps

### Development

- **Read the Code**: Start with `src/app/page.tsx` for the main page
- **Explore Components**: Check `src/components/` for UI components
- **Review API Routes**: Look at `src/app/api/` for backend logic
- **Check Database Schema**: See `prisma/schema.prisma`

### Testing

- **Run Tests**: `npm test`
- **Test Individual Suites**: `npm run test:components`
- **Read Testing Guide**: See [TESTING.md](TESTING.md)

### Deployment

- **Deploy to Vercel**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Configure Production**: See [VERCEL_SETUP.md](VERCEL_SETUP.md)
- **Environment Variables**: See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)

## Project Structure

```
sukoon-quran-app/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Main landing page
│   │   ├── api/          # API routes
│   │   └── actions/      # Server actions
│   ├── components/       # React components
│   │   ├── MoodChips.tsx
│   │   ├── VerseCard.tsx
│   │   ├── PopupSubscribe.tsx
│   │   └── HeroJar.tsx
│   ├── lib/              # Utility functions
│   │   ├── prisma.ts     # Database client
│   │   ├── llm-client.ts # LLM integration
│   │   └── email-templates.ts
│   └── types/            # TypeScript types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── prompts/              # LLM prompts
│   ├── system.md
│   ├── picker.md
│   └── daily.md
├── public/               # Static assets
│   ├── JarBody.svg
│   ├── JarLid.svg
│   └── PaperSlip.svg
└── Documentation files
```

## Development Workflow

### Making Changes

1. **Create a branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**:
   - Edit files in `src/`
   - Hot reload will update automatically

3. **Test changes**:

   ```bash
   npm test
   npm run build
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

### Database Changes

1. **Edit schema**:

   ```bash
   # Edit prisma/schema.prisma
   ```

2. **Create migration**:

   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

3. **Generate client**:
   ```bash
   npm run db:generate
   ```

### Adding New Components

1. Create component in `src/components/`
2. Add tests in `src/components/__tests__/`
3. Import and use in pages

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm test                 # Run all tests
npm run test:llm         # Test LLM integration
npm run test:components  # Test components

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:seed          # Seed database
npm run db:validate      # Validate schema

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types
```

## Getting Help

- **Documentation**: Check the docs in the repository
- **Troubleshooting**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Issues**: Open an issue on GitHub
- **Community**: Join our Discord/Slack (if available)

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Vercel Docs**: https://vercel.com/docs

---

**Ready to build?** Start by exploring the code and making your first change!

**Questions?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or open an issue.

**Last Updated**: [Date]
