# Database Setup

This directory contains the Prisma schema, migrations, and seed data for the Sukoon Quran App.

## Prerequisites

- PostgreSQL database (Neon recommended)
- Environment variables configured in `.env`:
  - `DATABASE_URL`: Pooled connection URL for runtime
  - `DIRECT_URL`: Direct connection URL for migrations

## Setup Instructions

### 1. Generate Prisma Client

```bash
npm run db:generate
```

### 2. Apply Migrations

To apply the database schema to your database:

```bash
npx prisma migrate deploy
```

Or for development (creates migration if needed):

```bash
npx prisma migrate dev
```

### 3. Seed the Database

To populate the database with sample data:

```bash
npm run db:seed
```

This will create:

- 2 translators (Sahih International, Dr. Mustafa Khattab)
- 6 moods (Happy, Sad, Angry, Anxious, Depressed, Grateful)
- 8 sample verses with Arabic text and English translations
- Mood-verse relationships with weights for verse selection

## Database Schema

The schema includes the following models:

- **Verse**: Qur'an verses with Arabic text and metadata
- **Translation**: Verse translations in different languages
- **Translator**: Translation sources and attribution
- **Mood**: Emotional states for verse selection
- **MoodVerse**: Weighted relationships between moods and verses
- **Subscriber**: Email subscribers for daily ayah
- **SendLog**: Audit log of sent emails

## Validation

To validate database integrity and relationships:

```bash
npm run db:validate
```

This will test:

- Model relationships and foreign key constraints
- Unique indexes (surah:ayah, mood slugs, subscriber emails)
- Seed data integrity (moods, verses, translators)
- MoodVerse weight validity (0-1 range)

## Development Commands

```bash
# Open Prisma Studio to view/edit data
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Push schema changes without migration
npm run db:push
```

## Notes

- The seed script uses `upsert` operations, so it's safe to run multiple times
- Verse IDs follow the format `{surah}:{ayah}` (e.g., "2:186")
- All relationships use CASCADE delete for data integrity
- The schema enforces unique constraints on critical fields
