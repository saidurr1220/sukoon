"use server";

import { selectVerseForMood, getFallbackVerse, type VerseWithTranslation } from "@/lib/verse-selection";
import {
    getOrCreateSessionId,
    trackVerseSelection,
    getRecentlyShownVerses,
    getUserTimezone,
} from "@/lib/user-session";
import { headers } from "next/headers";

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
 * Server action to select a verse based on user's mood with contextual intelligence
 * @param mood - The mood slug (e.g., "happy", "sad", "anxious")
 * @param timezone - User's timezone (optional, will be detected)
 * @returns Result with verse data or error
 */
export async function selectVerseByMood(
    mood: string,
    timezone?: string
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

        // Parallel execution for faster performance
        const [sessionId, recentlyShown] = await Promise.all([
            getOrCreateSessionId(),
            // Get recently shown in parallel
            (async () => {
                const sid = await getOrCreateSessionId();
                return getRecentlyShownVerses(sid, 10); // Reduced from 20
            })(),
        ]);

        // Get user's timezone from session or use provided
        const userTimezone = timezone || "Asia/Dhaka"; // Default instead of query

        // Get user agent for tracking
        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || undefined;

        // Performance tracking
        const startTime = Date.now();
        console.log(`[Verse Selection] Starting - Mood: ${mood}, Recently shown: ${recentlyShown.length} verses`);

        // Select verse using contextual intelligence
        const verse = await selectVerseForMood(
            mood.toLowerCase(),
            recentlyShown,
            sessionId,
            userTimezone
        );

        const duration = Date.now() - startTime;
        console.log(`[Verse Selection] ✅ Selected: ${verse.id} in ${duration}ms`);

        // Track this selection
        await trackVerseSelection(
            sessionId,
            mood.toLowerCase(),
            verse.id,
            userTimezone,
            userAgent
        );

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
