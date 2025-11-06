# Gemini AI Setup Guide

This guide explains how to enable Gemini AI for smart, mood-based verse selection in Sukoon.

## Why Gemini?

Gemini AI provides:

- **Smart Mood Matching**: Understands verse content and matches it with user's emotional state
- **Context Awareness**: Considers time of day, special days (Jummah), and Ramadan
- **Better Variety**: Avoids showing the same verses repeatedly
- **Longer, Meaningful Verses**: Selects complete, contextually rich verses instead of fragments
- **Free Tier**: Google provides generous free tier for Gemini API

## Setup Steps

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (starts with `AIza...`)

### 2. Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key (e.g., `AIzaSyCqf-apLTBO6sA9fo4MXoDVPtyQIkVqqzo`)
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**

### 3. Redeploy

After adding the environment variable, trigger a new deployment:

- Go to **Deployments** tab
- Click the three dots on the latest deployment
- Select **Redeploy**

## How It Works

### Without Gemini (Current Fallback)

- Uses weighted random selection
- Limited mood matching
- May show short, incomplete verses
- No context awareness

### With Gemini (Enabled)

```typescript
// Gemini analyzes:
{
  "mood": "anxious",
  "context": {
    "time_of_day": "night",
    "is_jummah": false,
    "is_ramadan": false
  },
  "candidates": [
    { "verse_id": "2:186", "weight": 0.95 },
    { "verse_id": "13:28", "weight": 0.93 },
    // ... more verses
  ],
  "recently_shown": ["3:139", "94:5-6"]
}

// Returns:
{
  "picked": [{
    "verse_id": "2:186",
    "mood_reason": "This verse emphasizes Allah's closeness and responsiveness to prayers, providing comfort for anxiety"
  }]
}
```

## Verse Selection Improvements

### Merged Verses

Short verses that don't make sense alone are now merged:

- **Before**: "কষ্টের সাথেই স্বস্তি আছে।" (incomplete)
- **After**: "কষ্টের সাথেই স্বস্তি আছে, নিঃসন্দেহে কষ্টের সাথেই স্বস্তি আছে।" (94:5-6, complete)

### Comprehensive Mood Mappings

Each mood now has 7-8 carefully selected verses:

**Anxious** (উদ্বিগ্ন):

- 2:186 - Allah is near, answers prayers
- 13:28 - Hearts find peace in remembrance
- 94:5-6 - With hardship comes ease
- 65:3 - Allah provides from unexpected sources
- And more...

**Sad** (দুঃখিত):

- 94:5-6 - With hardship comes ease
- 39:53 - Don't despair of Allah's mercy
- 2:186 - Allah is near
- And more...

**Depressed** (বিষণ্ণ):

- 39:53 - Allah forgives all sins
- 94:5-6 - With hardship comes ease
- 16:97 - Good life for believers
- And more...

**Angry** (রাগান্বিত):

- 3:134 - Control anger, forgive
- 25:63 - Servants of Rahman walk humbly
- 41:34-35 - Repel evil with good
- And more...

**Happy** (খুশি):

- 16:97 - Good life for believers
- 55:13 - Which favors will you deny?
- 14:7 - If grateful, Allah increases
- And more...

**Grateful** (কৃতজ্ঞ):

- 14:7 - If grateful, Allah increases
- 55:13 - Which favors will you deny?
- 93:11 - Proclaim Allah's blessings
- And more...

## Testing

After setup, test the mood selection:

1. Visit your app
2. Select different moods
3. Verify you're getting:
   - Longer, complete verses
   - Verses that match the mood
   - Variety (not repeating same verses)

## Monitoring

Check Gemini API usage:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. View API key usage and quotas

## Troubleshooting

### Verses still seem random

- Check Vercel logs for LLM errors
- Verify `GEMINI_API_KEY` is set correctly
- Ensure you redeployed after adding the key

### API quota exceeded

- Gemini free tier: 60 requests per minute
- If exceeded, app falls back to weighted random selection
- Consider upgrading to paid tier for higher limits

### Verses still incomplete

- Run the merge script: `npx tsx scripts/merge-short-verses.ts`
- Run the mood mapping script: `npx tsx scripts/add-comprehensive-mood-verses.ts`
- These scripts have already been run in the database

## Cost

**Gemini 1.5 Flash** (used by Sukoon):

- **Free Tier**: 15 requests per minute, 1,500 requests per day
- **Paid Tier**: $0.075 per 1M input tokens, $0.30 per 1M output tokens
- **Typical Usage**: ~100-200 tokens per request
- **Estimated Cost**: Essentially free for most apps

## Support

For issues or questions:

- Check Vercel deployment logs
- Review `src/lib/llm-client.ts` for implementation
- See `src/lib/verse-selection.ts` for usage

---

**Note**: The app works without Gemini API key (falls back to weighted random), but Gemini provides significantly better verse selection.
