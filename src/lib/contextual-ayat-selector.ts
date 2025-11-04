import { prisma } from "./prisma";

/**
 * Contextual Ayat Selection System
 * Selects ayat based on time, date, user behavior, and Islamic calendar context
 */

export interface ContextualFactors {
    // Time-based
    timeOfDay: "fajr" | "morning" | "noon" | "afternoon" | "maghrib" | "night";
    dayOfWeek: string;
    isJummah: boolean;

    // Islamic calendar
    islamicMonth?: string;
    isRamadan: boolean;
    isLastTenDays: boolean;

    // User behavior
    userId?: string;
    recentMoods: string[];
    consecutiveSameMood: number;
    lastVisitTime?: Date;

    // Current context
    currentMood: string;
    timezone: string;
}

/**
 * Get time of day based on hour
 */
export function getTimeOfDay(hour: number): ContextualFactors["timeOfDay"] {
    if (hour >= 4 && hour < 6) return "fajr";
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 15) return "noon";
    if (hour >= 15 && hour < 18) return "afternoon";
    if (hour >= 18 && hour < 20) return "maghrib";
    return "night";
}

/**
 * Get contextual factors from current time and user data
 */
export async function getContextualFactors(
    mood: string,
    userId?: string,
    timezone: string = "Asia/Dhaka"
): Promise<ContextualFactors> {
    const now = new Date();
    const userTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));

    const hour = userTime.getHours();
    const dayOfWeek = userTime.toLocaleDateString("en-US", { weekday: "long" });
    const isJummah = dayOfWeek === "Friday";

    // Get Islamic date (simplified - you can use a proper Islamic calendar library)
    const month = userTime.getMonth() + 1;
    const isRamadan = false; // TODO: Implement proper Islamic calendar check

    // Get user behavior data
    let recentMoods: string[] = [];
    let consecutiveSameMood = 1;
    let lastVisitTime: Date | undefined;

    if (userId) {
        try {
            const { getRecentMoods, getConsecutiveSameMoodCount } = await import("./user-session");

            recentMoods = await getRecentMoods(userId, 10);
            consecutiveSameMood = await getConsecutiveSameMoodCount(userId, mood);

            // Get last visit from session data
            const sessions = await prisma.userSession.findFirst({
                where: { sessionId: userId },
                orderBy: { createdAt: "desc" },
                select: { createdAt: true },
            });

            lastVisitTime = sessions?.createdAt;
        } catch (error) {
            console.error("Failed to get user behavior data:", error);
        }
    }

    return {
        timeOfDay: getTimeOfDay(hour),
        dayOfWeek,
        isJummah,
        isRamadan,
        isLastTenDays: false,
        userId,
        recentMoods,
        consecutiveSameMood,
        lastVisitTime,
        currentMood: mood,
        timezone,
    };
}

/**
 * Calculate contextual weights for verse selection
 * Returns weight multipliers based on context
 */
export function calculateContextualWeights(
    context: ContextualFactors
): Record<string, number> {
    const weights: Record<string, number> = {};

    // Time-based weights
    switch (context.timeOfDay) {
        case "fajr":
        case "morning":
            // Morning: gratitude, hope, fresh start themes
            weights.grateful = 1.5;
            weights.hopeful = 1.4;
            weights.motivated = 1.3;
            break;

        case "noon":
        case "afternoon":
            // Midday: patience, perseverance, strength
            weights.patient = 1.4;
            weights.strong = 1.3;
            weights.focused = 1.3;
            break;

        case "maghrib":
            // Evening: reflection, gratitude, peace
            weights.grateful = 1.5;
            weights.peaceful = 1.4;
            weights.reflective = 1.3;
            break;

        case "night":
            // Night: comfort, peace, hope for tomorrow
            weights.peaceful = 1.5;
            weights.comforted = 1.4;
            weights.hopeful = 1.3;
            break;
    }

    // Jummah special weights
    if (context.isJummah) {
        weights.grateful = (weights.grateful || 1.0) * 1.3;
        weights.blessed = 1.5;
        weights.community = 1.4;
    }

    // Ramadan special weights
    if (context.isRamadan) {
        weights.patient = (weights.patient || 1.0) * 1.4;
        weights.grateful = (weights.grateful || 1.0) * 1.4;
        weights.spiritual = 1.5;

        if (context.isLastTenDays) {
            weights.hopeful = (weights.hopeful || 1.0) * 1.5;
            weights.seeking = 1.6;
        }
    }

    // Consecutive same mood - diversify
    if (context.consecutiveSameMood > 2) {
        // Reduce weight of current mood, encourage variety
        weights[`diverse_${context.currentMood}`] = 1.4;
    }

    return weights;
}

/**
 * Get theme tags for current context
 * These help select more relevant verses
 */
export function getContextualThemes(context: ContextualFactors): string[] {
    const themes: string[] = [];

    // Time-based themes
    switch (context.timeOfDay) {
        case "fajr":
        case "morning":
            themes.push("new_beginning", "gratitude", "hope", "energy");
            break;
        case "noon":
        case "afternoon":
            themes.push("perseverance", "patience", "strength", "work");
            break;
        case "maghrib":
            themes.push("reflection", "gratitude", "peace", "family");
            break;
        case "night":
            themes.push("rest", "peace", "comfort", "tomorrow");
            break;
    }

    // Day-based themes
    if (context.isJummah) {
        themes.push("jummah", "blessing", "community", "worship");
    }

    // Islamic calendar themes
    if (context.isRamadan) {
        themes.push("ramadan", "fasting", "patience", "reward");
        if (context.isLastTenDays) {
            themes.push("laylatul_qadr", "seeking", "forgiveness");
        }
    }

    // Behavioral themes
    if (context.consecutiveSameMood > 2) {
        themes.push("variety", "new_perspective");
    }

    return themes;
}

/**
 * Select verses with contextual intelligence
 */
export async function selectContextualVerse(
    mood: string,
    userId?: string,
    timezone: string = "Asia/Dhaka",
    recentlyShown: string[] = []
): Promise<string[]> {
    // Get contextual factors
    const context = await getContextualFactors(mood, userId, timezone);

    // Get contextual weights and themes
    const weights = calculateContextualWeights(context);
    const themes = getContextualThemes(context);

    // Optimized query - get top weighted verses only
    const moodVerses = await prisma.moodVerse.findMany({
        where: {
            mood: {
                slug: mood.toLowerCase(),
            },
            verseId: {
                notIn: recentlyShown.slice(0, 5), // Only check last 5 to speed up
            },
        },
        include: {
            verse: {
                select: {
                    id: true,
                    surah: true,
                    ayah: true,
                    arabicText: true,
                },
            },
        },
        orderBy: {
            weight: "desc",
        },
        take: 20, // Reduced from 50 for speed
    });

    if (moodVerses.length === 0) {
        throw new Error(`No verses found for mood: ${mood}`);
    }

    console.log(`[Contextual] Found ${moodVerses.length} verses for mood: ${mood}`);
    console.log(`[Contextual] Time: ${context.timeOfDay}, Jummah: ${context.isJummah}`);

    // Apply contextual scoring
    const scoredVerses = moodVerses.map((mv) => {
        let score = mv.weight; // Base weight from mood_verses table

        // Apply contextual multipliers
        // This is simplified - in production, you'd have verse metadata/tags

        // Time-based scoring
        const verseNumber = mv.verse.ayah;
        const surahNumber = mv.verse.surah;

        // High-quality verses - Allah's direct speech, promises, mercy, forgiveness
        // These verses have personal connection and complete messages
        const highQualityVerses = [
            "94:5",
            "94:6", // With hardship comes ease
            "13:28", // Hearts find peace in remembrance
            "2:186", // Allah is near, answers prayers
            "2:286", // Allah does not burden beyond capacity
            "3:139", // Do not lose hope
            "39:53", // Do not despair of Allah's mercy
            "65:3", // Allah provides from unexpected sources
            "2:153", // Allah is with the patient
            "2:152", // Remember Me, I will remember you
            "3:173", // Allah is sufficient for us
            "29:69", // Allah is with those who do good
            "41:30", // Angels descend with comfort
            "16:97", // Good life for believers
        ];

        if (highQualityVerses.includes(mv.verse.id)) {
            score *= 2.5; // Very strong bonus for high-quality verses
        }

        // Use LLM for quality check if available (async, so we'll do basic check here)
        // Check for positive keywords in Arabic that indicate direct speech or promises
        const hasDirectSpeech =
            mv.verse.arabicText.includes("يَا") || // O (direct address)
            mv.verse.arabicText.includes("إِنَّ") || // Indeed/Verily
            mv.verse.arabicText.includes("قُلْ"); // Say

        if (hasDirectSpeech) {
            score *= 1.3; // Bonus for direct speech
        }

        // Time-based contextual scoring
        if (context.timeOfDay === "morning" && [93, 94].includes(surahNumber)) {
            score *= 1.5; // Surah Ad-Duha, Ash-Sharh for morning hope
        }

        if (context.timeOfDay === "night" && [112, 113, 114].includes(surahNumber)) {
            score *= 1.4; // Last 3 surahs for night protection
        }

        if (context.isJummah && surahNumber === 62) {
            score *= 1.6; // Surah Al-Jumu'ah on Friday
        }

        // Avoid very early or very late surahs that might be too complex
        // Focus on middle surahs (10-50) which often have clear, standalone messages
        if (surahNumber >= 10 && surahNumber <= 50) {
            score *= 1.2; // Bonus for middle surahs with clear messages
        }

        // Length preference - prefer readable verses (15-60 words ideal for mobile)
        // Following specification: short enough for mobile card, long enough for meaning
        const wordCount = mv.verse.arabicText.split(/\s+/).length;

        if (wordCount >= 15 && wordCount <= 40) {
            score *= 2.0; // Ideal length for mobile card - strong bonus
        } else if (wordCount >= 10 && wordCount < 15) {
            score *= 1.2; // Acceptable but slightly short
        } else if (wordCount > 40 && wordCount <= 60) {
            score *= 1.3; // Still good but getting longer
        } else if (wordCount < 10) {
            score *= 0.2; // Too short - heavy penalty (avoid fragments)
        } else if (wordCount > 80) {
            score *= 0.4; // Too long for mobile card
        }

        // Diversity bonus - prefer verses not shown recently
        const daysSinceShown = recentlyShown.length;
        if (daysSinceShown > 5) {
            score *= 1.2;
        }

        return {
            verseId: mv.verseId,
            score,
            context: {
                timeOfDay: context.timeOfDay,
                themes,
            },
        };
    });

    // Sort by score and return top candidates
    scoredVerses.sort((a, b) => b.score - a.score);

    const topCandidates = scoredVerses.slice(0, 10);
    console.log(`[Contextual] Top 3 candidates:`, topCandidates.slice(0, 3).map(v => ({
        id: v.verseId,
        score: v.score.toFixed(2)
    })));

    return topCandidates.map((v) => v.verseId);
}
