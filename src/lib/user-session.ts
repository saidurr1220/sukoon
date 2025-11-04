"use server";

import { prisma } from "./prisma";
import { cookies } from "next/headers";

/**
 * User session tracking for personalized ayat selection
 * Tracks user behavior without requiring authentication
 */

const SESSION_COOKIE_NAME = "sukoon_session";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Get or create user session ID
 */
export async function getOrCreateSessionId(): Promise<string> {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
        // Generate new session ID
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Set cookie (will be set in response)
        cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
            maxAge: SESSION_DURATION / 1000,
            httpOnly: true,
            sameSite: "lax",
            path: "/",
        });
    }

    return sessionId;
}

/**
 * Track verse selection in user session
 */
export async function trackVerseSelection(
    sessionId: string,
    mood: string,
    verseId: string,
    timezone: string = "Asia/Dhaka",
    userAgent?: string
): Promise<void> {
    try {
        await prisma.userSession.create({
            data: {
                sessionId,
                selectedMood: mood,
                verseId,
                timezone,
                userAgent,
            },
        });
    } catch (error) {
        console.error("Failed to track verse selection:", error);
        // Don't throw - tracking failure shouldn't break user experience
    }
}

/**
 * Get user's recent mood selections
 */
export async function getRecentMoods(
    sessionId: string,
    limit: number = 10
): Promise<string[]> {
    try {
        const sessions = await prisma.userSession.findMany({
            where: { sessionId },
            orderBy: { createdAt: "desc" },
            take: limit,
            select: { selectedMood: true },
        });

        return sessions.map((s) => s.selectedMood);
    } catch (error) {
        console.error("Failed to get recent moods:", error);
        return [];
    }
}

/**
 * Get verses recently shown to user
 */
export async function getRecentlyShownVerses(
    sessionId: string,
    limit: number = 20
): Promise<string[]> {
    try {
        const sessions = await prisma.userSession.findMany({
            where: { sessionId },
            orderBy: { createdAt: "desc" },
            take: limit,
            select: { verseId: true },
        });

        return sessions.map((s) => s.verseId);
    } catch (error) {
        console.error("Failed to get recently shown verses:", error);
        return [];
    }
}

/**
 * Get consecutive same mood count
 */
export async function getConsecutiveSameMoodCount(
    sessionId: string,
    currentMood: string
): Promise<number> {
    try {
        const recentSessions = await prisma.userSession.findMany({
            where: { sessionId },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { selectedMood: true },
        });

        let count = 0;
        for (const session of recentSessions) {
            if (session.selectedMood === currentMood) {
                count++;
            } else {
                break; // Stop at first different mood
            }
        }

        return count;
    } catch (error) {
        console.error("Failed to get consecutive mood count:", error);
        return 0;
    }
}

/**
 * Get user's timezone from session history
 */
export async function getUserTimezone(sessionId: string): Promise<string> {
    try {
        const lastSession = await prisma.userSession.findFirst({
            where: { sessionId },
            orderBy: { createdAt: "desc" },
            select: { timezone: true },
        });

        return lastSession?.timezone || "Asia/Dhaka";
    } catch (error) {
        console.error("Failed to get user timezone:", error);
        return "Asia/Dhaka";
    }
}

/**
 * Clean up old session data (older than 90 days)
 * Should be called periodically via cron
 */
export async function cleanupOldSessions(): Promise<number> {
    try {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const result = await prisma.userSession.deleteMany({
            where: {
                createdAt: {
                    lt: ninetyDaysAgo,
                },
            },
        });

        return result.count;
    } catch (error) {
        console.error("Failed to cleanup old sessions:", error);
        return 0;
    }
}
