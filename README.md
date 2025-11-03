# Sukoon - Find Peace Through Qur'an

A mobile-first Progressive Web Application that provides users with carefully selected Qur'an verses based on their emotional state, featuring a unique jar reveal animation and optional daily email subscriptions.

## Features

- 🎯 **Mood-based verse selection** - Choose from 6 emotional states
- 🏺 **Beautiful jar animation** - Smooth reveal animation with accessibility support
- 📧 **Daily email subscriptions** - Optional double opt-in email service
- 📱 **Mobile-first PWA** - Optimized for mobile devices with offline support
- ♿ **Fully accessible** - WCAG compliant with RTL Arabic text support
- 🔒 **Content authenticity** - No AI generation of Qur'an text, only selection

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Animation**: Framer Motion with SVG assets
- **Database**: Prisma ORM with Neon PostgreSQL
- **Email**: Resend API with double opt-in flow
- **Deployment**: Vercel with Cron jobs

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Neon PostgreSQL database
- Resend API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd sukoon-quran-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `DIRECT_URL` - Your Neon PostgreSQL direct connection string
- `RESEND_API_KEY` - Your Resend API key

4. Generate Prisma client:

```bash
npm run db:generate
```

5. Push database schema:

```bash
npm run db:push
```

6. Seed the database (when seed script is ready):

```bash
npm run db:seed
```

7. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/                 # Utility functions and configurations
├── types/               # TypeScript type definitions
└── styles/              # Global styles

prisma/
├── schema.prisma        # Database schema
└── seed.ts             # Database seeding script

prompts/                 # LLM prompt templates
├── system.md           # Core safety instructions
├── picker.md           # Mood-based selection logic
└── daily.md            # Daily newsletter selection
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run all tests
- `npm run test:llm` - Run LLM integration tests
- `npm run test:components` - Run component tests
- `npm run test:email` - Run email system tests
- `npm run test:integration` - Run integration tests
- `npm run test:pwa` - Run PWA tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:validate` - Validate database schema

## Documentation

Comprehensive documentation is available in the following files:

### Deployment & Configuration

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide for Vercel, Neon, and Resend
- **[VERCEL_SETUP.md](VERCEL_SETUP.md)** - Step-by-step Vercel configuration checklist
- **[ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)** - Detailed environment variable documentation

### Testing & Quality

- **[TESTING.md](TESTING.md)** - Comprehensive testing guide and procedures
- **[TEST_RESULTS.md](TEST_RESULTS.md)** - Latest test results and coverage summary

### Troubleshooting

- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions

### Quick Links

- [Environment Setup](#installation) - Get started with local development
- [Production Deployment](DEPLOYMENT.md#production-environment-setup) - Deploy to production
- [Running Tests](TESTING.md#running-tests) - Test the application
- [Common Issues](TROUBLESHOOTING.md) - Troubleshoot problems

## Requirements Compliance

This project implements the following key requirements:

- **Mobile-first design** (Req 4.1) - Optimized for screens ≥390px
- **Accessibility** (Req 5.1-5.5) - WCAG compliant with proper contrast and keyboard navigation
- **Content authenticity** (Req 2.1-2.5) - No AI generation of Qur'an text
- **Performance** (Req 4.2-4.4) - Optimized animations and PWA capabilities
- **Email system** (Req 3.1-3.5) - Double opt-in with daily sending

## Production Deployment

For production deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

Quick checklist:

1. Set up Neon PostgreSQL database
2. Configure Resend email service
3. Set environment variables in Vercel
4. Deploy to Vercel
5. Run database migrations
6. Verify cron job configuration

## Testing

Run the test suite:

```bash
npm test
```

For detailed testing procedures, see [TESTING.md](TESTING.md).

## Troubleshooting

If you encounter issues, check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common problems and solutions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Please read our contributing guidelines before submitting pull requests.

## Support

For support:

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Open an issue on GitHub
- Contact the development team
