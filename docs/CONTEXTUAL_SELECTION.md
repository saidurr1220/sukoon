# Contextual Ayat Selection System

## Overview

Sukoon এখন একটি intelligent contextual ayat selection system ব্যবহার করে যা শুধুমাত্র mood এর উপর নির্ভর করে না, বরং user এর context (time, date, behavior) অনুযায়ী সবচেয়ে relevant ayat select করে।

## Features

### 1. Time-Based Selection

- **Fajr/Morning (4 AM - 12 PM)**: Gratitude, hope, fresh start themes
- **Noon/Afternoon (12 PM - 6 PM)**: Patience, perseverance, strength
- **Maghrib (6 PM - 8 PM)**: Reflection, gratitude, peace
- **Night (8 PM - 4 AM)**: Comfort, peace, hope for tomorrow

### 2. Day-Based Selection

- **Jummah (Friday)**: Special emphasis on Jummah-related ayat, blessings, community
- **Regular Days**: Standard contextual selection

### 3. Islamic Calendar Integration

- **Ramadan**: Patience, fasting, reward themes
- **Last 10 Days of Ramadan**: Laylatul Qadr, seeking, forgiveness
- **Other Special Days**: Can be extended for Eid, Hajj season, etc.

### 4. User Behavior Tracking

- **Session Tracking**: Anonymous session-based tracking (no authentication required)
- **Recently Shown Verses**: Avoids showing same ayat repeatedly
- **Mood History**: Tracks user's recent mood selections
- **Consecutive Same Mood**: If user selects same mood 3+ times, system diversifies selection

### 5. Timezone Support

- Automatically detects user's timezone
- Calculates time-of-day based on user's local time
- Stores timezone preference for future visits

## How It Works

### Selection Flow

```
User selects mood
    ↓
System detects timezone & time
    ↓
Get user's session history
    ↓
Calculate contextual factors:
  - Time of day
  - Day of week (Jummah?)
  - Islamic calendar context
  - User behavior patterns
    ↓
Apply contextual weights to verses
    ↓
Filter top candidates
    ↓
LLM selects best match
    ↓
Track selection in session
    ↓
Display ayat to user
```

### Database Schema

#### UserSession Table

```prisma
model UserSession {
  id              String   @id @default(cuid())
  sessionId       String   @unique
  selectedMood    String
  verseId         String
  timezone        String   @default("Asia/Dhaka")
  userAgent       String?
  createdAt       DateTime @default(now())
}
```

#### VerseMetadata Table (Future Enhancement)

```prisma
model VerseMetadata {
  id          String   @id @default(cuid())
  verseId     String   @unique
  themes      String[] // morning, evening, patience, etc.
  timeContext String[] // fajr, morning, night, etc.
  occasions   String[] // jummah, ramadan, eid, etc.
  updatedAt   DateTime @updatedAt
}
```

## Contextual Weights

### Time-Based Multipliers

- Morning gratitude: 1.5x
- Evening reflection: 1.4x
- Night comfort: 1.5x
- Jummah blessing: 1.3x additional

### Behavioral Multipliers

- Consecutive same mood (3+): Diversity bonus 1.4x
- Recently shown (5+ days ago): Freshness bonus 1.2x

### Special Occasions

- Ramadan: Patience 1.4x, Gratitude 1.4x
- Last 10 days: Hope 1.5x, Seeking 1.6x

## Privacy & Data

### What We Track

- Anonymous session ID (cookie-based)
- Selected moods
- Shown verses
- Timezone
- User agent (for analytics)

### What We DON'T Track

- Personal information
- IP addresses
- Email (unless subscribed)
- Location beyond timezone

### Data Retention

- Session data kept for 90 days
- Automatic cleanup via cron job
- No cross-device tracking

## API Usage

### Select Verse with Context

```typescript
import { selectVerseByMood } from "@/app/actions/verse-actions";

// Automatically uses session tracking and timezone detection
const result = await selectVerseByMood("anxious");

// Or provide timezone explicitly
const result = await selectVerseByMood("anxious", "America/New_York");
```

### Get User Session Data

```typescript
import {
  getRecentMoods,
  getRecentlyShownVerses,
  getConsecutiveSameMoodCount,
} from "@/lib/user-session";

const sessionId = await getOrCreateSessionId();
const recentMoods = await getRecentMoods(sessionId, 10);
const recentVerses = await getRecentlyShownVerses(sessionId, 20);
const sameCount = await getConsecutiveSameMoodCount(sessionId, "anxious");
```

## Future Enhancements

### 1. Verse Metadata System

- Tag verses with themes, times, occasions
- More precise contextual matching
- Community-driven tagging

### 2. Islamic Calendar Integration

- Use proper Hijri calendar library
- Automatic Ramadan detection
- Special occasion handling (Eid, Hajj, etc.)

### 3. Advanced Personalization

- Learning from user preferences
- Favorite verses
- Reading time patterns
- Mood transition patterns

### 4. Multi-language Context

- Language-specific contextual factors
- Cultural considerations
- Regional Islamic practices

### 5. Analytics Dashboard

- Popular times for each mood
- Most impactful verses
- User engagement patterns
- A/B testing for selection algorithms

## Testing

### Test Different Times

```typescript
// Mock different times of day
const contexts = [
  { hour: 5, expected: "fajr" },
  { hour: 10, expected: "morning" },
  { hour: 14, expected: "noon" },
  { hour: 19, expected: "maghrib" },
  { hour: 22, expected: "night" },
];

for (const { hour, expected } of contexts) {
  const timeOfDay = getTimeOfDay(hour);
  console.assert(timeOfDay === expected);
}
```

### Test Contextual Selection

```typescript
// Test that same mood gives different verses
const mood = "anxious";
const verse1 = await selectVerseByMood(mood);
const verse2 = await selectVerseByMood(mood);
const verse3 = await selectVerseByMood(mood);

// Should be different (with high probability)
console.assert(verse1.id !== verse2.id || verse2.id !== verse3.id);
```

## Performance Considerations

### Caching

- Session data cached in cookies
- Timezone cached per session
- Recently shown verses cached

### Database Queries

- Indexed on sessionId and createdAt
- Efficient filtering of recent verses
- Batch operations for cleanup

### LLM Calls

- Only top candidates sent to LLM
- Fallback to weighted random if LLM fails
- Contextual pre-filtering reduces LLM load

## Maintenance

### Cleanup Old Sessions

```typescript
// Run via cron job (weekly recommended)
import { cleanupOldSessions } from "@/lib/user-session";

const deletedCount = await cleanupOldSessions();
console.log(`Cleaned up ${deletedCount} old sessions`);
```

### Monitor Session Growth

```sql
-- Check session table size
SELECT COUNT(*) FROM user_sessions;

-- Check sessions by date
SELECT DATE(created_at), COUNT(*)
FROM user_sessions
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC
LIMIT 30;
```

## Configuration

### Environment Variables

```env
# No additional env vars needed
# Uses existing DATABASE_URL and DIRECT_URL
```

### Default Settings

- Default timezone: `Asia/Dhaka`
- Session duration: 30 days
- Cleanup threshold: 90 days
- Recently shown limit: 20 verses
- Mood history limit: 10 selections

## Troubleshooting

### Issue: Same verse showing repeatedly

**Solution**: Check if session tracking is working. Clear cookies and try again.

### Issue: Wrong time-based selection

**Solution**: Verify timezone detection. Check browser timezone settings.

### Issue: Session data not persisting

**Solution**: Check cookie settings. Ensure cookies are enabled.

### Issue: Performance degradation

**Solution**: Run cleanup job. Check database indexes. Monitor session table size.

## Contributing

To improve contextual selection:

1. Add verse metadata tags
2. Refine contextual weights
3. Add new contextual factors
4. Improve Islamic calendar integration
5. Test with different user patterns

---

**Note**: This system respects user privacy while providing personalized experience. All tracking is anonymous and session-based.
