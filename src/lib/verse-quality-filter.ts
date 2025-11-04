/**
 * LLM-powered verse quality filtering
 * Filters verses based on meaning, relevance, and spiritual value
 */

import { getLLMClient } from "./llm-client";

export interface VerseQualityScore {
    verseId: string;
    isRelevant: boolean;
    qualityScore: number; // 0-10
    reason: string;
    themes: string[];
}

/**
 * Use LLM to evaluate verse quality and relevance
 * Checks if verse contains:
 * - Allah's direct speech to believers
 * - Promises, mercy, forgiveness
 * - Personal connection and relevance
 * - Complete, meaningful message
 */
export async function evaluateVerseQuality(
    verseId: string,
    arabicText: string,
    translation: string
): Promise<VerseQualityScore> {
    try {
        const llmClient = getLLMClient();
        await llmClient.initialize();

        const prompt = `Evaluate this Quranic verse for daily spiritual reflection.

Verse ID: ${verseId}
Arabic: ${arabicText}
Bengali Translation: ${translation}

Criteria for HIGH quality (score 8-10):
- Allah speaking directly to believers ("O you who believe", "My servants", etc.)
- Promises of mercy, forgiveness, reward
- Personal, relatable guidance
- Complete, standalone message
- Themes: hope, comfort, patience, gratitude, trust in Allah

Criteria for MEDIUM quality (score 5-7):
- General wisdom or guidance
- Historical narrative with clear lesson
- Encouragement or warning
- Reasonably complete message

Criteria for LOW quality (score 0-4):
- Fragment without context
- Legal/technical details
- Battle/punishment descriptions
- Requires extensive background
- Too short or incomplete

Respond in JSON format:
{
  "isRelevant": true/false,
  "qualityScore": 0-10,
  "reason": "brief explanation",
  "themes": ["theme1", "theme2"]
}`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are an Islamic scholar helping select meaningful Quranic verses for daily reflection. Focus on verses that provide comfort, hope, and personal guidance.",
                    },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
                temperature: 0.3,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            throw new Error(`LLM API error: ${response.status}`);
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return {
            verseId,
            isRelevant: result.isRelevant,
            qualityScore: result.qualityScore,
            reason: result.reason,
            themes: result.themes || [],
        };
    } catch (error) {
        console.error(`Failed to evaluate verse ${verseId}:`, error);
        // Fallback: basic heuristic
        return {
            verseId,
            isRelevant: true,
            qualityScore: 5,
            reason: "Fallback evaluation",
            themes: [],
        };
    }
}

/**
 * Batch evaluate multiple verses
 */
export async function batchEvaluateVerses(
    verses: Array<{ id: string; arabicText: string; translation: string }>
): Promise<VerseQualityScore[]> {
    const results: VerseQualityScore[] = [];

    // Evaluate in batches to avoid rate limits
    for (const verse of verses.slice(0, 10)) {
        // Limit to top 10 candidates
        const score = await evaluateVerseQuality(
            verse.id,
            verse.arabicText,
            verse.translation
        );
        results.push(score);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
}

/**
 * Quick heuristic check without LLM (for fallback)
 */
export function quickQualityCheck(arabicText: string, translation: string): number {
    let score = 5; // Base score

    const wordCount = arabicText.split(/\s+/).length;

    // Length check
    if (wordCount >= 15 && wordCount <= 50) {
        score += 2;
    } else if (wordCount < 10) {
        score -= 3;
    }

    // Check for positive keywords in translation
    const positiveKeywords = [
        "আল্লাহ",
        "রহমত",
        "ক্ষমা",
        "প্রশান্তি",
        "সাহায্য",
        "পুরস্কার",
        "জান্নাত",
        "দয়া",
        "করুণা",
        "আশা",
    ];

    const translationLower = translation.toLowerCase();
    const keywordMatches = positiveKeywords.filter((kw) =>
        translationLower.includes(kw.toLowerCase())
    ).length;

    score += keywordMatches * 0.5;

    // Check for direct address
    if (
        translation.includes("হে") ||
        translation.includes("তোমরা") ||
        translation.includes("তোমাদের")
    ) {
        score += 1;
    }

    return Math.min(10, Math.max(0, score));
}
