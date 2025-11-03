"use server";

import { selectVerseForMood, getFallbackVerse, type VerseWithTranslation } from "@/lib/verse-selection";

/**
 * Server actions for verse selection
 * These are called from client components
 */

export interface VerseSelectionResult {
    success: boolean;
    verse?: VerseWithTranslation;
    error?: string;
}

/**
 * Server action to select a verse based on user's mood
 * @param mood - The mood slug (e.g., "happy", "sad", "anxious")
 * @param recentlyShown - Optional array of recently shown verse IDs
 * @returns Result with verse data or error
 */
export async function selectVerseByMood(
    mood: string,
    recentlyShown: string[] = []
): Promise<VerseSelectionResult> {
    try {
        // Validate mood input
        const validMoods = ["happy", "sad", "angry", "anxious", "depressed", "grateful"];
        if (!validMoods.includes(mood.toLowerCase())) {
            return {
                success: false,
                error: `Invalid mood: ${mood}. Must be one of: ${validMoods.join(", ")}`,
            };
        }

        // Select verse using LLM
        const verse = await selectVerseForMood(mood.toLowerCase(), recentlyShown);

        return {
            success: true,
            verse,
        };
    } catch (error) {
        console.error("Verse selection error:", error);

        // Try fallback verse
        try {
            const fallbackVerse = await getFallbackVerse();
            return {
                success: true,
                verse: fallbackVerse,
            };
        } catch (fallbackError) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to select verse",
            };
        }
    }
}

/**
 * Server action to get a specific verse by ID
 * Used for testing or direct verse retrieval
 * @param verseId - The verse ID (e.g., "2:255")
 * @returns Result with verse data or error
 */
export async function getVerseByIdAction(
    verseId: string
): Promise<VerseSelectionResult> {
    try {
        const { getVerseById } = await import("@/lib/verse-selection");
        const verse = await getVerseById(verseId);

        if (!verse) {
            return {
                success: false,
                error: `Verse not found: ${verseId}`,
            };
        }

        return {
            success: true,
            verse,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get verse",
        };
    }
}
