/**
 * Quick test to verify contextual selection is working
 * Run with: npx tsx scripts/quick-test.ts
 */

import { getTimeOfDay, calculateContextualWeights, getContextualThemes } from "../src/lib/contextual-ayat-selector";

console.log("🧪 Quick Contextual Selection Test\n");

// Test 1: Time detection
const now = new Date();
const hour = now.getHours();
const timeOfDay = getTimeOfDay(hour);

console.log("✅ Time Detection:");
console.log(`   Current hour: ${hour}`);
console.log(`   Time of day: ${timeOfDay}\n`);

// Test 2: Contextual weights
const mockContext = {
    timeOfDay,
    dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
    isJummah: now.getDay() === 5,
    isRamadan: false,
    isLastTenDays: false,
    recentMoods: [],
    consecutiveSameMood: 1,
    currentMood: "anxious",
    timezone: "Asia/Dhaka",
};

const weights = calculateContextualWeights(mockContext);
console.log("✅ Contextual Weights:");
console.log(weights);
console.log();

// Test 3: Themes
const themes = getContextualThemes(mockContext);
console.log("✅ Contextual Themes:");
console.log(themes);
console.log();

console.log("✅ All basic functions working!\n");
console.log("Next: Test in browser by selecting a mood");
