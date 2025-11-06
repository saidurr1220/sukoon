"use server";

import { prisma } from "./prisma";
import { MoodType } from "@/types";
import { getEnhancedUserContext, EnhancedUserContext } from "./enhanced-user-context";

/**
 * Calculate intelligent priority score based on comprehensive user context
 */
function calculateIntelligentPriority(
    verse: any,
    mood: MoodType,
    context: EnhancedUserContext
): number {
    let priority = 50; // Base priority

    const translation = verse.translations[0]?.text || "";
    const translationLength = translation.length;

    // ============================================
    // 1. TIME OF DAY INTELLIGENCE
    // ============================================

    if (context.timeOfDay === "dawn" || context.timeOfDay === "morning") {
        // Dawn/Morning: Hope, new beginnings, gratitude, energy
        if (mood === "grateful" || mood === "happy") priority += 25;
        if (mood === "depressed" || mood === "sad") priority += 15; // Hope for new day

        // Specific verses for morning
        if (verse.surah === 93) priority += 20; // Surah Duha (Morning light)
        if (verse.surah === 94) priority += 20; // Surah Inshirah (Ease after hardship)
        if (verse.surah === 91 && verse.ayah <= 10) priority += 15; // Surah Shams (Sun)
    }

    else if (context.timeOfDay === "noon") {
        // Noon: Peak energy, work, focus
        if (mood === "anxious") priority += 15; // Calm during busy time
        if (verse.surah === 2 && verse.ayah === 286) priority += 15; // Allah doesn't burden
    }

    else if (context.timeOfDay === "afternoon") {
        // Afternoon: Patience, perseverance, staying strong
        if (mood === "angry" || mood === "anxious") priority += 20;
        if (verse.surah === 103) priority += 15; // Surah Asr (Time)
        if (verse.surah === 3 && verse.ayah === 200) priority += 15; // Be patient
    }

    else if (context.timeOfDay === "evening") {
        // Evening: Reflection, family, gratitude for day
        if (mood === "grateful" || mood === "happy") priority += 20;
        if (context.culturalContext.isFamilyTime) priority += 10;
        if (verse.surah === 55) priority += 15; // Surah Rahman (Blessings)
    }

    else if (context.timeOfDay === "night") {
        // Night: Peace, forgiveness, closeness to Allah
        if (mood === "anxious" || mood === "sad" || mood === "depressed") priority += 25;
        if (verse.surah === 2 && verse.ayah === 186) priority += 20; // Allah is near
        if (verse.surah === 39 && verse.ayah === 53) priority += 20; // Don't despair
        if (verse.surah === 17 && verse.ayah === 79) priority += 15; // Night prayer
    }

    else if (context.timeOfDay === "lateNight") {
        // Late night (12-4 AM): Deep reflection, seeking forgiveness, tahajjud time
        if (mood === "depressed" || mood === "anxious") priority += 30;
        if (verse.surah === 39 && verse.ayah === 53) priority += 25; // Mercy of Allah
        if (verse.surah === 73) priority += 20; // Surah Muzzammil (Night prayer)
        if (verse.surah === 17 && verse.ayah === 79) priority += 20; // Tahajjud
        if (verse.surah === 3 && verse.ayah === 17) priority += 15; // Those who seek forgiveness at dawn
    }

    // ============================================
    // 2. PRAYER TIME INTELLIGENCE
    // ============================================

    if (context.isPrayerTime) {
        priority += 15;

        if (context.likelyPrayerName === "fajr") {
            // Fajr: New beginning, hope
            if (verse.surah === 93 || verse.surah === 94) priority += 20;
        }
        else if (context.likelyPrayerName === "dhuhr") {
            // Dhuhr: Midday, seeking help
            if (verse.surah === 2 && verse.ayah === 186) priority += 15;
        }
        else if (context.likelyPrayerName === "asr") {
            // Asr: Patience, time passing
            if (verse.surah === 103) priority += 20;
        }
        else if (context.likelyPrayerName === "maghrib") {
            // Maghrib: Gratitude for day
            if (mood === "grateful") priority += 20;
            if (verse.surah === 55) priority += 15;
        }
        else if (context.likelyPrayerName === "isha") {
            // Isha: Peace, rest
            if (mood === "anxious" || mood === "sad") priority += 15;
        }

        // Dua verses get extra priority during prayer time
        if (verse.surah === 2 && verse.ayah === 186) priority += 15;
        if (verse.surah === 40 && verse.ayah === 60) priority += 10; // Call upon Me
    }

    // ============================================
    // 3. DAY OF WEEK INTELLIGENCE
    // ============================================

    if (context.isJummah) {
        priority += 20;
        if (verse.surah === 62) priority += 25; // Surah Jummah
        if (verse.surah === 2 && verse.ayah === 186) priority += 15; // Dua acceptance
    }

    if (context.isWeekend) {
        // Weekend: More personal time, reflection
        if (mood === "grateful" || mood === "happy") priority += 10;
    }

    // ============================================
    // 4. CULTURAL CONTEXT (Asian/Bengali)
    // ============================================

    if (context.culturalContext.isFamilyTime) {
        // Family time: Verses about family, relationships, gratitude
        if (mood === "grateful" || mood === "happy") priority += 15;
        if (verse.surah === 31 && verse.ayah >= 14 && verse.ayah <= 19) priority += 15; // Luqman's advice
    }

    if (context.culturalContext.isPersonalTime) {
        // Personal reflection time: Deep, meaningful verses
        if (mood === "depressed" || mood === "anxious" || mood === "sad") priority += 20;
        priority += 10; // Bonus for personal time
    }

    if (context.culturalContext.isWorkHours) {
        // Work hours: Shorter, impactful verses
        if (translationLength < 150) priority += 10;
        if (mood === "anxious" || mood === "angry") priority += 10;
    }

    // ============================================
    // 5. USER ACTIVITY INTELLIGENCE
    // ============================================

    if (context.likelyActivity === "waking") {
        // Just woke up: Energizing, hopeful verses
        if (verse.surah === 93 || verse.surah === 94) priority += 25;
        if (mood === "grateful") priority += 15;
    }

    else if (context.likelyActivity === "working") {
        // Working: Focus, patience, shorter verses
        if (translationLength < 150) priority += 15;
        if (mood === "anxious" || mood === "angry") priority += 15;
    }

    else if (context.likelyActivity === "break") {
        // Break time: Refreshing, moderate length
        if (translationLength >= 100 && translationLength <= 200) priority += 10;
    }

    else if (context.likelyActivity === "evening_family") {
        // Evening with family: Gratitude, peace
        if (mood === "grateful" || mood === "happy") priority += 20;
        if (verse.surah === 55) priority += 15;
    }

    else if (context.likelyActivity === "night_reflection") {
        // Night reflection: Deep, meaningful
        if (mood === "depressed" || mood === "anxious" || mood === "sad") priority += 25;
        if (verse.surah === 39 && verse.ayah === 53) priority += 20;
    }

    else if (context.likelyActivity === "sleep_prep") {
        // Preparing for sleep: Calming, peaceful
        if (mood === "anxious") priority += 25;
        if (verse.surah === 2 && verse.ayah === 186) priority += 15;
    }

    // ============================================
    // 6. DEVICE & CONTEXT
    // ============================================

    if (context.deviceType === "mobile") {
        // Mobile: Prefer shorter verses for easier reading
        if (translationLength < 200) priority += 10;
    }

    // ============================================
    // 7. VERSE LENGTH OPTIMIZATION
    // ============================================

    if (translationLength >= 80 && translationLength <= 250) {
        priority += 15; // Perfect length
    } else if (translationLength >= 50 && translationLength < 80) {
        priority += 5; // Acceptable but short
    } else if (translationLength > 250 && translationLength <= 350) {
        priority += 5; // Acceptable but long
    } else if (translationLength < 50) {
        priority -= 20; // Too short
    } else if (translationLength > 400) {
        priority -= 15; // Too long
    }

    // ============================================
    // 8. MOOD-SPECIFIC VERSE MATCHING
    // ============================================

    // Anxious mood
    if (mood === "anxious") {
        if (verse.surah === 2 && verse.ayah === 186) priority += 20;
        if (verse.surah === 13 && verse.ayah === 28) priority += 20;
        if (verse.surah === 94) priority += 20;
        if (verse.surah === 65 && verse.ayah === 3) priority += 15;
    }

    // Sad mood
    else if (mood === "sad") {
        if (verse.surah === 94) priority += 25;
        if (verse.surah === 39 && verse.ayah === 53) priority += 20;
        if (verse.surah === 2 && verse.ayah === 186) priority += 20;
    }

    // Depressed mood
    else if (mood === "depressed") {
        if (verse.surah === 39 && verse.ayah === 53) priority += 30;
        if (verse.surah === 94) priority += 25;
        if (verse.surah === 2 && verse.ayah === 186) priority += 20;
        if (verse.surah === 16 && verse.ayah === 97) priority += 15;
    }

    // Angry mood
    else if (mood === "angry") {
        if (verse.surah === 3 && verse.ayah === 134) priority += 25;
        if (verse.surah === 25 && verse.ayah === 63) priority += 20;
        if (verse.surah === 41 && (verse.ayah === 34 || verse.ayah === 35)) priority += 20;
    }

    // Happy mood
    else if (mood === "happy") {
        if (verse.surah === 16 && verse.ayah === 97) priority += 25;
        if (verse.surah === 55 && verse.ayah === 13) priority += 20;
        if (verse.surah === 14 && verse.ayah === 7) priority += 20;
    }

    // Grateful mood
    else if (mood === "grateful") {
        if (verse.surah === 14 && verse.ayah === 7) priority += 30;
        if (verse.surah === 55 && verse.ayah === 13) priority += 25;
        if (verse.surah === 93 && verse.ayah === 11) priority += 20;
    }

    // ============================================
    // 9. RAMADAN BOOST
    // ============================================

    if (context.isRamadan) {
        priority += 25;
        if (verse.surah === 2 && verse.ayah === 185) priority += 20;
        if (verse.surah === 97) priority += 20; // Laylatul Qadr
    }

    return Math.max(0, Math.min(100, priority)); // Clamp 0-100
}

/**
 * Select verse with intelligent context-aware prioritization
 */
export async function selectIntelligentVerse(
    mood: MoodType,
    timezone?: string,
    recentlyShown: string[] = []
): Promise<any> {
    try {
        // Get comprehensive user context
        const context = await getEnhancedUserContext(timezone);

        console.log(`[Intelligent Selection] Context:`, {
            time: `${context.hour}:${context.minute}`,
            timeOfDay: context.timeOfDay,
            activity: context.likelyActivity,
            prayer: context.isPrayerTime ? context.likelyPrayerName : "none",
            device: context.deviceType,
        });

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
                    take: 50,
                },
            },
        });

        if (!moodData || moodData.moodVerses.length === 0) {
            throw new Error(`No verses found for mood: ${mood}`);
        }

        // Calculate intelligent priorities
        const versesWithPriority = moodData.moodVerses
            .map((mv) => {
                const verse = mv.verse;
                const translation = verse.translations[0];

                if (!translation) return null;

                const priority = calculateIntelligentPriority(verse, mood, context);

                return {
                    verse,
                    translation,
                    priority,
                };
            })
            .filter((v): v is NonNullable<typeof v> => v !== null)
            .filter((v) => {
                // Filter out recently shown
                if (recentlyShown.includes(v.verse.id)) return false;

                // Filter by length
                const length = v.translation.text.length;
                return length >= 40 && length <= 400;
            })
            .sort((a, b) => b.priority - a.priority);

        if (versesWithPriority.length === 0) {
            throw new Error("No suitable verses found after filtering");
        }

        // Select from top 5 with weighted randomness
        const topVerses = versesWithPriority.slice(0, 5);
        const totalPriority = topVerses.reduce((sum, v) => sum + v.priority, 0);
        let random = Math.random() * totalPriority;

        let selectedVerse = topVerses[0];
        for (const v of topVerses) {
            random -= v.priority;
            if (random <= 0) {
                selectedVerse = v;
                break;
            }
        }

        console.log(`[Intelligent Selection] Selected: ${selectedVerse.verse.id} (priority: ${selectedVerse.priority})`);
        console.log(`[Intelligent Selection] Top 5:`, topVerses.map(v => `${v.verse.id}(${v.priority})`).join(", "));

        return {
            id: selectedVerse.verse.id,
            surah: selectedVerse.verse.surah,
            ayah: selectedVerse.verse.ayah,
            arabicText: selectedVerse.verse.arabicText,
            translation: selectedVerse.translation.text,
            translatorName: selectedVerse.translation.translator.name,
            audioUrl: selectedVerse.verse.audioUrl,
        };
    } catch (error) {
        console.error("Intelligent verse selection error:", error);
        throw error;
    }
}
