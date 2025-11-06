"use server";

import { prisma } from "./prisma";
import { MoodType } from "@/types";

interface TimeContext {
    hour: number;
    isJummah: boolean;
    isRamadan: boolean;
    isPrayerTime: boolean;
    timeOfDay: "morning" | "afternoon" | "evening" | "night";
}

interface SmartVerseSelection {
    id: string;
    surah: number;
    ayah: number;
    arabicText: string;
    translation: string;
    translatorName: string;
    audioUrl: string | null;
    timeContext: "morning" | "afternoon" | "evening" | "night" | "prayer";
    priority: number;
}

/**
 * Get time context from timezone
 */
function getTimeContext(timezone: string): TimeContext {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false,
        weekday: "long",
        month: "numeric",
    });

    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "12");
    const weekday = parts.find((p) => p.type === "weekday")?.value || "";
    const month = parseInt(parts.find((p) => p.type === "month")?.value || "1");

    // Determine time of day
    let timeOfDay: "morning" | "afternoon" | "evening" | "night";
    if (hour >= 5 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 20) timeOfDay = "evening";
    else timeOfDay = "night";

    // Check if Jummah (Friday)
    const isJummah = weekday === "Friday";

    // Check if Ramadan (approximate - 9th Islamic month)
    // This is simplified - in production, use proper Islamic calendar
    const isRamadan = false; // TODO: Implement proper Islamic calendar check

    // Check if prayer time (approximate)
    const prayerTimes = [5, 6, 13, 14, 16, 17, 19, 20]; // Fajr, Dhuhr, Asr, Maghrib, Isha
    const isPrayerTime = prayerTimes.includes(hour);

    return {
        hour,
        isJummah,
        isRamadan,
        isPrayerTime,
        timeOfDay,
    };
}

/**
 * Calculate priority score for a verse based on context
 */
function calculatePriority(
    verse: any,
    context: TimeContext,
    mood: MoodType
): number {
    let priority = 50; // Base priority

    // Time-based adjustments
    if (context.timeOfDay === "morning") {
        // Morning: Verses about hope, new beginnings, gratitude
        if (mood === "grateful" || mood === "happy") priority += 20;
        if (verse.surah === 93 || verse.surah === 94) priority += 15; // Surah Duha, Inshirah
    } else if (context.timeOfDay === "night") {
        // Night: Verses about peace, forgiveness, reflection
        if (mood === "anxious" || mood === "sad" || mood === "depressed") priority += 20;
        if (verse.surah === 2 && verse.ayah === 186) priority += 15; // Allah is near
    } else if (context.timeOfDay === "afternoon") {
        // Afternoon: Verses about patience, perseverance
        if (mood === "angry" || mood === "anxious") priority += 15;
    }

    // Prayer time boost
    if (context.isPrayerTime) {
        priority += 10;
        if (verse.surah === 2 && verse.ayah === 186) priority += 10; // Dua verse
    }

    // Jummah boost
    if (context.isJummah) {
        priority += 15;
        if (verse.surah === 62) priority += 10; // Surah Jummah
    }

    // Ramadan boost
    if (context.isRamadan) {
        priority += 20;
        if (verse.surah === 2 && verse.ayah === 185) priority += 15; // Ramadan verse
    }

    // Asian cultural context (evening family time, late night reflection)
    if (context.hour >= 20 && context.hour <= 23) {
        // Late evening - family, reflection time
        if (mood === "grateful" || mood === "happy") priority += 10;
    }

    // Very late night (1-4 AM) - deep reflection, seeking forgiveness
    if (context.hour >= 1 && context.hour <= 4) {
        if (mood === "depressed" || mood === "anxious") priority += 15;
        if (verse.surah === 39 && verse.ayah === 53) priority += 20; // Don't despair
    }

    // Verse length preference (not too short, not too long)
    const translationLength = verse.translations[0]?.text.length || 0;
    if (translationLength >= 80 && translationLength <= 300) {
        priority += 10; // Perfect length
    } else if (translationLength < 50 || translationLength > 400) {
        priority -= 15; // Too short or too long
    }

    return Math.max(0, Math.min(100, priority)); // Clamp between 0-100
}

/**
 * Get smart verse selections for a mood
 */
export async function getSmartVerseSelections(
    mood: MoodType,
    timezone: string = "Asia/Dhaka",
    count: number = 25
): Promise<SmartVerseSelection[]> {
    try {
        const context = getTimeContext(timezone);

        // Get mood candidates
        const moodData = await prisma.mood.findUnique({
            where: { slug: mood },
            include: {
                moodVerses: {
                    include: {
                        verse: {
                            include: {
                                translations: {
                                    where: { language: "bn" },
                                    include: { translator: true },
                                },
                            },
                        },
                    },
                    orderBy: { weight: "desc" },
                    take: 50, // Get more than needed for filtering
                },
            },
        });

        if (!moodData || moodData.moodVerses.length === 0) {
            throw new Error(`No verses found for mood: ${mood}`);
        }

        // Calculate priorities and filter
        const versesWithPriority = moodData.moodVerses
            .map((mv) => {
                const verse = mv.verse;
                const translation = verse.translations[0];

                if (!translation) return null;

                const priority = calculatePriority(verse, context, mood);

                // Determine time context label
                let timeContext = context.timeOfDay;
                if (context.isPrayerTime) timeContext = "prayer";

                return {
                    id: verse.id,
                    surah: verse.surah,
                    ayah: verse.ayah,
                    arabicText: verse.arabicText,
                    translation: translation.text,
                    translatorName: translation.translator.name,
                    audioUrl: verse.audioUrl,
                    timeContext,
                    priority,
                };
            })
            .filter((v): v is SmartVerseSelection => v !== null)
            .filter((v) => {
                // Filter out very short verses (less than 40 chars)
                // and very long verses (more than 400 chars)
                const length = v.translation.length;
                return length >= 40 && length <= 400;
            })
            .sort((a, b) => b.priority - a.priority)
            .slice(0, count);

        console.log(`[Smart Selection] ${mood} at ${context.timeOfDay}: ${versesWithPriority.length} verses`);
        console.log(`[Smart Selection] Top 3 priorities:`, versesWithPriority.slice(0, 3).map(v => `${v.id}(${v.priority})`));

        return versesWithPriority;
    } catch (error) {
        console.error("Smart verse selection error:", error);
        throw new Error(
            `Failed to get smart verse selections: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}
