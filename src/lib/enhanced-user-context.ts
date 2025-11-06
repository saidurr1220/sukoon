"use server";

import { headers } from "next/headers";

export interface EnhancedUserContext {
    // Time-based
    timezone: string;
    hour: number;
    minute: number;
    dayOfWeek: string;
    isWeekend: boolean;
    timeOfDay: "dawn" | "morning" | "noon" | "afternoon" | "evening" | "night" | "lateNight";

    // Islamic calendar
    isJummah: boolean;
    isPrayerTime: boolean;
    likelyPrayerName?: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
    isRamadan: boolean;

    // Device & Browser
    deviceType: "mobile" | "tablet" | "desktop";
    browser: string;
    os: string;
    language: string;

    // User behavior patterns (inferred)
    sessionTime: "first" | "returning";
    likelyActivity: "waking" | "working" | "break" | "evening_family" | "night_reflection" | "sleep_prep";

    // Cultural context (Asian/Bengali specific)
    culturalContext: {
        isMealTime: boolean;
        isWorkHours: boolean;
        isFamilyTime: boolean;
        isPersonalTime: boolean;
    };
}

/**
 * Get comprehensive user context from browser and environment
 */
export async function getEnhancedUserContext(timezone?: string): Promise<EnhancedUserContext> {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const acceptLanguage = headersList.get("accept-language") || "bn";

    // Detect timezone
    const tz = timezone || "Asia/Dhaka";

    // Get current time in user's timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        minute: "numeric",
        hour12: false,
        weekday: "long",
        month: "numeric",
        day: "numeric",
    });

    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "12");
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
    const weekday = parts.find((p) => p.type === "weekday")?.value || "";

    // Determine time of day (more granular)
    let timeOfDay: EnhancedUserContext["timeOfDay"];
    if (hour >= 4 && hour < 6) timeOfDay = "dawn";
    else if (hour >= 6 && hour < 11) timeOfDay = "morning";
    else if (hour >= 11 && hour < 13) timeOfDay = "noon";
    else if (hour >= 13 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 20) timeOfDay = "evening";
    else if (hour >= 20 && hour < 24) timeOfDay = "night";
    else timeOfDay = "lateNight";

    // Islamic context
    const isJummah = weekday === "Friday";
    const { isPrayerTime, likelyPrayerName } = detectPrayerTime(hour, minute);
    const isRamadan = false; // TODO: Implement proper Islamic calendar

    // Device detection
    const deviceType = detectDeviceType(userAgent);
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);

    // Language
    const language = acceptLanguage.split(",")[0].split("-")[0];

    // Session detection (simplified)
    const sessionTime: "first" | "returning" = "returning"; // Would need cookies/storage

    // Infer likely activity based on time and day
    const likelyActivity = inferActivity(hour, weekday, timeOfDay);

    // Cultural context (Asian/Bengali specific)
    const culturalContext = getCulturalContext(hour, weekday, timeOfDay);

    return {
        timezone: tz,
        hour,
        minute,
        dayOfWeek: weekday,
        isWeekend: weekday === "Friday" || weekday === "Saturday",
        timeOfDay,
        isJummah,
        isPrayerTime,
        likelyPrayerName,
        isRamadan,
        deviceType,
        browser,
        os,
        language,
        sessionTime,
        likelyActivity,
        culturalContext,
    };
}

/**
 * Detect if it's prayer time (approximate)
 */
function detectPrayerTime(hour: number, minute: number): {
    isPrayerTime: boolean;
    likelyPrayerName?: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
} {
    // Approximate prayer times for Bangladesh (varies by season)
    const prayerTimes = [
        { name: "fajr" as const, start: 4, end: 6 },
        { name: "dhuhr" as const, start: 12, end: 14 },
        { name: "asr" as const, start: 15, end: 17 },
        { name: "maghrib" as const, start: 17, end: 19 },
        { name: "isha" as const, start: 19, end: 21 },
    ];

    for (const prayer of prayerTimes) {
        if (hour >= prayer.start && hour < prayer.end) {
            // Within 30 minutes of prayer time
            return { isPrayerTime: true, likelyPrayerName: prayer.name };
        }
    }

    return { isPrayerTime: false };
}

/**
 * Detect device type from user agent
 */
function detectDeviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
    if (/mobile/i.test(userAgent)) return "mobile";
    if (/tablet|ipad/i.test(userAgent)) return "tablet";
    return "desktop";
}

/**
 * Detect browser from user agent
 */
function detectBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return "chrome";
    if (/firefox/i.test(userAgent)) return "firefox";
    if (/safari/i.test(userAgent)) return "safari";
    if (/edge/i.test(userAgent)) return "edge";
    return "unknown";
}

/**
 * Detect OS from user agent
 */
function detectOS(userAgent: string): string {
    if (/android/i.test(userAgent)) return "android";
    if (/iphone|ipad/i.test(userAgent)) return "ios";
    if (/windows/i.test(userAgent)) return "windows";
    if (/mac/i.test(userAgent)) return "macos";
    if (/linux/i.test(userAgent)) return "linux";
    return "unknown";
}

/**
 * Infer likely user activity based on time
 */
function inferActivity(
    hour: number,
    weekday: string,
    timeOfDay: string
): EnhancedUserContext["likelyActivity"] {
    const isWeekday = !["Friday", "Saturday"].includes(weekday);

    if (hour >= 4 && hour < 7) return "waking";
    if (hour >= 7 && hour < 12 && isWeekday) return "working";
    if (hour >= 12 && hour < 14) return "break";
    if (hour >= 14 && hour < 17 && isWeekday) return "working";
    if (hour >= 17 && hour < 21) return "evening_family";
    if (hour >= 21 && hour < 24) return "night_reflection";
    if (hour >= 0 && hour < 4) return "sleep_prep";

    return "evening_family";
}

/**
 * Get cultural context (Asian/Bengali specific)
 */
function getCulturalContext(
    hour: number,
    weekday: string,
    timeOfDay: string
): EnhancedUserContext["culturalContext"] {
    const isWeekday = !["Friday", "Saturday"].includes(weekday);

    return {
        // Meal times in Bangladesh: Breakfast 7-9, Lunch 1-3, Dinner 8-10
        isMealTime:
            (hour >= 7 && hour < 9) ||
            (hour >= 13 && hour < 15) ||
            (hour >= 20 && hour < 22),

        // Work hours: 9 AM - 6 PM on weekdays
        isWorkHours: isWeekday && hour >= 9 && hour < 18,

        // Family time: Evening 6-10 PM
        isFamilyTime: hour >= 18 && hour < 22,

        // Personal reflection time: Late night 10 PM - 2 AM
        isPersonalTime: hour >= 22 || hour < 2,
    };
}
