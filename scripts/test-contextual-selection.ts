/**
 * Test script for contextual ayat selection
 * Run with: npx tsx scripts/test-contextual-selection.ts
 */

import {
    getTimeOfDay,
    getContextualFactors,
    calculateContextualWeights,
    getContextualThemes
} from "../src/lib/contextual-ayat-selector";

async function testTimeOfDay() {
    console.log("\n=== Testing Time of Day Detection ===");

    const testCases = [
        { hour: 5, expected: "fajr" },
        { hour: 10, expected: "morning" },
        { hour: 14, expected: "noon" },
        { hour: 17, expected: "afternoon" },
        { hour: 19, expected: "maghrib" },
        { hour: 22, expected: "night" },
    ];

    for (const { hour, expected } of testCases) {
        const result = getTimeOfDay(hour);
        const status = result === expected ? "✅" : "❌";
        console.log(`${status} Hour ${hour}: ${result} (expected: ${expected})`);
    }
}

async function testContextualFactors() {
    console.log("\n=== Testing Contextual Factors ===");

    const mood = "anxious";
    const timezone = "Asia/Dhaka";

    const context = await getContextualFactors(mood, undefined, timezone);

    console.log("Current Context:");
    console.log(`  Time of Day: ${context.timeOfDay}`);
    console.log(`  Day of Week: ${context.dayOfWeek}`);
    console.log(`  Is Jummah: ${context.isJummah}`);
    console.log(`  Is Ramadan: ${context.isRamadan}`);
    console.log(`  Current Mood: ${context.currentMood}`);
    console.log(`  Timezone: ${context.timezone}`);
    console.log(`  Consecutive Same Mood: ${context.consecutiveSameMood}`);
}

async function testContextualWeights() {
    console.log("\n=== Testing Contextual Weights ===");

    // Test morning context
    const morningContext = await getContextualFactors("grateful", undefined, "Asia/Dhaka");
    // Override time for testing
    morningContext.timeOfDay = "morning";

    const morningWeights = calculateContextualWeights(morningContext);
    console.log("\nMorning Weights:");
    console.log(morningWeights);

    // Test Jummah context
    const jummahContext = await getContextualFactors("grateful", undefined, "Asia/Dhaka");
    jummahContext.isJummah = true;

    const jummahWeights = calculateContextualWeights(jummahContext);
    console.log("\nJummah Weights:");
    console.log(jummahWeights);

    // Test consecutive same mood
    const repeatContext = await getContextualFactors("anxious", undefined, "Asia/Dhaka");
    repeatContext.consecutiveSameMood = 4;

    const repeatWeights = calculateContextualWeights(repeatContext);
    console.log("\nConsecutive Same Mood (4x) Weights:");
    console.log(repeatWeights);
}

async function testContextualThemes() {
    console.log("\n=== Testing Contextual Themes ===");

    // Morning themes
    const morningContext = await getContextualFactors("happy", undefined, "Asia/Dhaka");
    morningContext.timeOfDay = "morning";
    const morningThemes = getContextualThemes(morningContext);
    console.log("\nMorning Themes:", morningThemes);

    // Jummah themes
    const jummahContext = await getContextualFactors("grateful", undefined, "Asia/Dhaka");
    jummahContext.isJummah = true;
    const jummahThemes = getContextualThemes(jummahContext);
    console.log("\nJummah Themes:", jummahThemes);

    // Night themes
    const nightContext = await getContextualFactors("anxious", undefined, "Asia/Dhaka");
    nightContext.timeOfDay = "night";
    const nightThemes = getContextualThemes(nightContext);
    console.log("\nNight Themes:", nightThemes);
}

async function testTimezoneDetection() {
    console.log("\n=== Testing Timezone Detection ===");

    const timezones = [
        "Asia/Dhaka",
        "America/New_York",
        "Europe/London",
        "Asia/Tokyo",
    ];

    for (const tz of timezones) {
        const now = new Date();
        const userTime = new Date(now.toLocaleString("en-US", { timeZone: tz }));
        const hour = userTime.getHours();
        const timeOfDay = getTimeOfDay(hour);

        console.log(`\n${tz}:`);
        console.log(`  Local Hour: ${hour}`);
        console.log(`  Time of Day: ${timeOfDay}`);
    }
}

async function runAllTests() {
    console.log("🧪 Starting Contextual Selection Tests...\n");

    try {
        await testTimeOfDay();
        await testContextualFactors();
        await testContextualWeights();
        await testContextualThemes();
        await testTimezoneDetection();

        console.log("\n✅ All tests completed!");
    } catch (error) {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    }
}

// Run tests
runAllTests();
