# LLM Setup Guide

## Current Status

The system is working with **weighted random fallback** when LLM is not configured. This ensures variety in verse selection even without an API key.

## To Enable LLM-Powered Selection

### Option 1: OpenAI (Recommended)

1. Get API key from: https://platform.openai.com/api-keys
2. Add to `.env`:

```env
OPENAI_API_KEY="sk-your_actual_key_here"
```

3. Restart dev server

**Cost**: ~$0.0001 per selection (very cheap with gpt-4o-mini)

### Option 2: Anthropic Claude

1. Get API key from: https://console.anthropic.com/
2. Add to `.env`:

```env
ANTHROPIC_API_KEY="sk-ant-your_actual_key_here"
```

3. Update `src/lib/llm-client.ts` to use Claude API
4. Restart dev server

**Cost**: Similar to OpenAI

## How It Works

### With LLM (Optimal)

```
User selects mood
    ↓
System gets contextual candidates (time, behavior, etc.)
    ↓
LLM analyzes candidates and picks best match
    ↓
Returns most appropriate verse
```

### Without LLM (Current - Still Good!)

```
User selects mood
    ↓
System gets contextual candidates (time, behavior, etc.)
    ↓
Weighted random selection from top candidates
    ↓
Returns contextually appropriate verse
```

## Testing LLM Integration

Once you add the API key, test with:

```bash
npx tsx scripts/test-llm-selection.ts
```

## Fallback Behavior

The system gracefully falls back to weighted random if:

- No API key configured
- API key invalid
- API rate limit reached
- Network error

This ensures the app **always works** even without LLM.

## Cost Estimation

With gpt-4o-mini:

- Per selection: ~$0.0001
- 1000 selections: ~$0.10
- 10,000 selections: ~$1.00

Very affordable for production use!

## Current Configuration

File: `src/lib/llm-client.ts`

```typescript
{
  model: "gpt-4o-mini",  // Fast and cheap
  maxTokens: 500,         // Enough for selection
  temperature: 0.7,       // Balanced creativity
}
```

## Monitoring

Check logs for:

- `"LLM selection failed, using weighted random fallback"` - No API key or error
- Successful LLM calls will be silent

## Production Recommendations

1. **Always set API key** for best results
2. **Monitor costs** via OpenAI dashboard
3. **Set rate limits** to prevent abuse
4. **Cache selections** for same context (future enhancement)

## Alternative: Local LLM

For privacy/cost concerns, you can use:

- Ollama (local)
- LM Studio (local)
- Llama 3 (self-hosted)

Update `src/lib/llm-client.ts` to point to local endpoint.
