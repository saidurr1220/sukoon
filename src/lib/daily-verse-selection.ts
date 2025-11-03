"use server";

import { prisma } from "./prisma";
import { getLLMClient } from "./llm-client";
import { loadPrompt } from "./prompts";
import { getVerseById, type VerseWithTranslation } from "./verse-selection";

/**
 * Get all verses that haven't been sent to a subscriber in the last 30 days
 * @param subscriberId - The subscriber ID
 * @returns Array of verse IDs available for sending
 */
export async function getAvailableVersesForSubscriber(
    subscriberId: string
): Promise<string[]> {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get all verses sent to this subscriber in the last 30 days
        const recentSends = await prisma.sendLog.findMany({
            where: {
                subscriberId,
                sentAt: {
                    gte: thirtyDaysAgo,
                },
            },
            select: {
                verseId: true,
            },
        });

        const recentVerseIds = recentSends.map((log) => log.verseId);

        // Get all verses from database
        const allVerses = await prisma.verse.findMany({
            select: {
                id: true,
            },
        });

        // Filter out recently sent verses
        const availableVerses = allVerses
            .filter((verse) => !recentVerseIds.includes(verse.id))
            .map((verse) => verse.id);

        return availableVerses;
    } catch (error) {
        throw new Error(
            `Failed to get available verses: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

/**
 * Select a verse for daily email using LLM
 * @param subscriberId - The subscriber ID
 * @param language - The translation language (default: "en")
 * @returns Selected verse with full data
 */
export async function selectDailyVerse(
    subscriberId: string,
    language: string = "en"
): Promise<VerseWithTranslation> {
    try {
        // Get available verses (excluding those sent in last 30 days)
        const availableVerseIds = await getAvailableVersesForSubscriber(subscriberId);

        if (availableVerseIds.length === 0) {
            throw new Error("No available verses for subscriber");
        }

        // Get recent send history for context
        const recentSends = await prisma.sendLog.findMany({
            where: { subscriberId },
            orderBy: { sentAt: "desc" },
            take: 10,
            select: { verseId: true },
        });

        const sendHistory = recentSends.map((log) => log.verseId);

        // Prepare input for LLM (only verse IDs, no Qur'an text)
        // For daily selection, we use a simplified pool with equal weights
        const pool = availableVerseIds.slice(0, 50).map((verseId) => ({
            verse_id: verseId,
            weight: 0.8,
        }));

        const llmInput = {
            pool,
            send_history: sendHistory,
            fallback: "2:286",
        };

        let selectedVerseId: string;

        try {
            // Call LLM with verse IDs only
            const llmClient = getLLMClient();
            const dailyPrompt = await loadPrompt("daily");
            const response = await llmClient.selectDailyVerse(dailyPrompt, llmInput);

            if (!response.picked) {
                throw new Error("LLM returned no selection");
            }

            selectedVerseId = response.picked;

            // Validate that selected verse is available
            if (!availableVerseIds.includes(selectedVerseId)) {
                throw new Error(`LLM selected unavailable verse ID: ${selectedVerseId}`);
            }
        } catch (llmError) {
            // Fallback: select random verse from available pool
            console.error("LLM daily selection failed, using fallback:", llmError);
            const randomIndex = Math.floor(Math.random() * availableVerseIds.length);
            selectedVerseId = availableVerseIds[randomIndex];
        }

        // Retrieve complete verse data from database
        const verse = await getVerseById(selectedVerseId, language);

        if (!verse) {
            throw new Error(`Selected verse not found in database: ${selectedVerseId}`);
        }

        return verse;
    } catch (error) {
        throw new Error(
            `Daily verse selection failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

/**
 * Get all active confirmed subscribers ready for daily email
 * @returns Array of subscribers
 */
export async function getActiveSubscribers() {
    try {
        const subscribers = await prisma.subscriber.findMany({
            where: {
                active: true,
                confirmedAt: {
                    not: null,
                },
            },
            select: {
                id: true,
                email: true,
                locale: true,
            },
        });

        return subscribers;
    } catch (error) {
        throw new Error(
            `Failed to get active subscribers: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

/**
 * Log a verse send to a subscriber
 * @param subscriberId - The subscriber ID
 * @param verseId - The verse ID
 */
export async function logVerseSend(
    subscriberId: string,
    verseId: string
): Promise<void> {
    try {
        await prisma.$transaction(async (tx) => {
            // Create send log
            await tx.sendLog.create({
                data: {
                    subscriberId,
                    verseId,
                    sentAt: new Date(),
                },
            });

            // Update subscriber's lastSentAt
            await tx.subscriber.update({
                where: { id: subscriberId },
                data: { lastSentAt: new Date() },
            });
        });
    } catch (error) {
        throw new Error(
            `Failed to log verse send: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}
