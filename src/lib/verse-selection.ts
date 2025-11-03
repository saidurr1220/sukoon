"use server";

import { prisma } from "./prisma";
import { getLLMClient } from "./llm-client";
import { loadPrompt } from "./prompts";

/**
 * Verse selection utilities for mood-based retrieval
 * Implements content safety: only verse IDs sent to LLM, full data from database
 */

export interface VerseWithTranslation {
    id: string;
    surah: number;
    ayah: number;
    arabicText: string;
    audioUrl: string | null;
    translation: string;
    translatorName: string;
}

export interface MoodCandidate {
    verse_id: string;
    weight: number;
}

/**
 * Get candidate verses for a specific mood from database
 * @param moodSlug - The mood slug (e.g., "happy", "sad", "anxious")
 * @returns Array of verse IDs with weights
 */
export async function getMoodCandidates(
    moodSlug: string
): Promise<MoodCandidate[]> {
    try {
        const mood = await prisma.mood.findUnique({
            where: { slug: moodSlug },
            include: {
                moodVerses: {
                    include: {
                        verse: true,
                    },
                    orderBy: {
                        weight: "desc",
                    },
                },
            },
        });

        if (!mood) {
            throw new Error(`Mood not found: ${moodSlug}`);
        }

        if (mood.moodVerses.length === 0) {
            throw new Error(`No verses found for mood: ${moodSlug}`);
        }

        return mood.moodVerses.map((mv) => ({
            verse_id: mv.verse.id,
            weight: mv.weight,
        }));
    } catch (error) {
        throw new Error(
            `Failed to get mood candidates: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

/**
 * Get full verse data from database by verse ID
 * @param verseId - The verse ID (e.g., "2:255")
 * @param language - The translation language (default: "bn" for Bengali)
 * @returns Complete verse with translation
 */
export async function getVerseById(
    verseId: string,
    language: string = "bn"
): Promise<VerseWithTranslation | null> {
    try {
        const verse = await prisma.verse.findUnique({
            where: { id: verseId },
            include: {
                translations: {
                    where: { language },
                    include: {
                        translator: true,
                    },
                    take: 1,
                },
            },
        });

        if (!verse) {
            return null;
        }

        if (verse.translations.length === 0) {
            throw new Error(`No translation found for verse ${verseId} in language ${language}`);
        }

        const translation = verse.translations[0];

        return {
            id: verse.id,
            surah: verse.surah,
            ayah: verse.ayah,
            arabicText: verse.arabicText,
            audioUrl: verse.audioUrl,
            translation: translation.text,
            translatorName: translation.translator.name,
        };
    } catch (error) {
        throw new Error(
            `Failed to get verse: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

/**
 * Select a verse using LLM based on mood
 * @param moodSlug - The mood slug
 * @param recentlyShown - Array of recently shown verse IDs to avoid
 * @returns Selected verse with full data from database
 */
export async function selectVerseForMood(
    moodSlug: string,
    recentlyShown: string[] = []
): Promise<VerseWithTranslation> {
    try {
        // Get candidate verses from database (only IDs and weights)
        const candidates = await getMoodCandidates(moodSlug);

        if (candidates.length === 0) {
            throw new Error(`No candidates available for mood: ${moodSlug}`);
        }

        // Prepare input for LLM (only verse IDs, no Qur'an text)
        const llmInput = {
            requested_moods: [moodSlug],
            k: 1,
            candidates: candidates.map((c) => ({
                verse_id: c.verse_id,
                moods: [moodSlug],
                weight: c.weight,
            })),
            recently_shown: recentlyShown,
        };

        let selectedVerseId: string;

        try {
            // Call LLM with verse IDs only
            const llmClient = getLLMClient();
            const pickerPrompt = await loadPrompt("picker");
            const response = await llmClient.selectVerseForMood(pickerPrompt, llmInput);

            if (!response.picked || response.picked.length === 0) {
                throw new Error("LLM returned no selections");
            }

            selectedVerseId = response.picked[0].verse_id;

            // Validate that selected verse is in candidates
            if (!candidates.some((c) => c.verse_id === selectedVerseId)) {
                throw new Error(`LLM selected invalid verse ID: ${selectedVerseId}`);
            }
        } catch (llmError) {
            // Fallback: select highest weighted verse not in recently shown
            console.error("LLM selection failed, using fallback:", llmError);

            const availableCandidates = candidates.filter(
                (c) => !recentlyShown.includes(c.verse_id)
            );

            if (availableCandidates.length === 0) {
                // If all were recently shown, just use the highest weighted
                selectedVerseId = candidates[0].verse_id;
            } else {
                selectedVerseId = availableCandidates[0].verse_id;
            }
        }

        // Retrieve complete verse data from database
        const verse = await getVerseById(selectedVerseId);

        if (!verse) {
            throw new Error(`Selected verse not found in database: ${selectedVerseId}`);
        }

        return verse;
    } catch (error) {
        throw new Error(
            `Verse selection failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

/**
 * Get a random verse as fallback when mood selection fails
 * @returns A random verse with translation
 */
export async function getFallbackVerse(): Promise<VerseWithTranslation> {
    try {
        // Get a well-known comforting verse as fallback (2:286 - Allah does not burden a soul)
        const fallbackVerseId = "2:286";
        const verse = await getVerseById(fallbackVerseId);

        if (!verse) {
            throw new Error("Fallback verse not found in database");
        }

        return verse;
    } catch (error) {
        throw new Error(
            `Fallback verse retrieval failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}
