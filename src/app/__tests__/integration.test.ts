/**
 * Integration tests for main application flow
 * Run with: npx tsx src/app/__tests__/integration.test.ts
 */

import { selectVerseByMood } from "../actions/verse-actions";

async function testMoodToVerseFlow() {
    console.log("\n=== Testing Mood Selection to Verse Display Flow ===\n");

    const moods = ["happy", "sad", "angry", "anxious", "depressed", "grateful"];

    for (const mood of moods) {
        console.log(`Testing mood: ${mood}`);

        const result = await selectVerseByMood(mood);

        if (!result.success) {
            throw new Error(`Failed to select verse for mood ${mood}: ${result.error}`);
        }

        if (!result.verse) {
            throw new Error(`No verse returned for mood ${mood}`);
        }

        // Validate verse structure
        if (!result.verse.id || !result.verse.surah || !result.verse.ayah) {
            throw new Error(`Invalid verse structure for mood ${mood}`);
        }

        if (!result.verse.arabicText || result.verse.arabicText.length === 0) {
            throw new Error(`Missing Arabic text for mood ${mood}`);
        }

        if (!result.verse.translations || result.verse.translations.length === 0) {
            throw new Error(`Missing translations for mood ${mood}`);
        }

        console.log(`✓ Successfully selected verse ${result.verse.surah}:${result.verse.ayah} for ${mood}`);
    }

    console.log("\n✓ All mood selections completed successfully\n");
}

async function testInvalidMood() {
    console.log("=== Testing Invalid Mood Handling ===\n");

    const result = await selectVerseByMood("invalid_mood");

    if (result.success) {
        throw new Error("Should have failed with invalid mood");
    }

    if (!result.error || !result.error.includes("Invalid mood")) {
        throw new Error("Should return proper error message for invalid mood");
    }

    console.log("✓ Invalid mood properly rejected\n");
}

async function testSubscriptionAPI() {
    console.log("=== Testing Subscription API ===\n");

    // Test invalid email
    const invalidEmailResponse = await fetch("http://localhost:3000/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "invalid-email" }),
    });

    const invalidData = await invalidEmailResponse.json();

    if (invalidData.success) {
        throw new Error("Should reject invalid email format");
    }

    console.log("✓ Invalid email properly rejected");

    // Test missing email
    const missingEmailResponse = await fetch("http://localhost:3000/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    });

    const missingData = await missingEmailResponse.json();

    if (missingData.success) {
        throw new Error("Should reject missing email");
    }

    console.log("✓ Missing email properly rejected\n");
}

async function testVerseDataIntegrity() {
    console.log("=== Testing Verse Data Integrity ===\n");

    const result = await selectVerseByMood("happy");

    if (!result.success || !result.verse) {
        throw new Error("Failed to get verse for integrity test");
    }

    const verse = result.verse;

    // Check that Arabic text is RTL and contains Arabic characters
    const arabicRegex = /[\u0600-\u06FF]/;
    if (!arabicRegex.test(verse.arabicText)) {
        throw new Error("Arabic text does not contain Arabic characters");
    }

    console.log("✓ Arabic text contains valid Arabic characters");

    // Check translation exists and is not empty
    if (!verse.translations[0].text || verse.translations[0].text.length === 0) {
        throw new Error("Translation text is empty");
    }

    console.log("✓ Translation text is present");

    // Check translator attribution
    if (!verse.translations[0].translator || !verse.translations[0].translator.name) {
        throw new Error("Translator attribution is missing");
    }

    console.log("✓ Translator attribution is present");

    // Check verse reference format
    if (verse.surah < 1 || verse.surah > 114) {
        throw new Error(`Invalid surah number: ${verse.surah}`);
    }

    if (verse.ayah < 1) {
        throw new Error(`Invalid ayah number: ${verse.ayah}`);
    }

    console.log(`✓ Verse reference ${verse.surah}:${verse.ayah} is valid\n`);
}

async function runAllTests() {
    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║     Sukoon Integration Tests                       ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    try {
        await testMoodToVerseFlow();
        await testInvalidMood();
        await testVerseDataIntegrity();

        // Note: Subscription API test requires server to be running
        console.log("⚠ Subscription API tests require server to be running");
        console.log("  Run 'npm run dev' and then test manually or with E2E tools\n");

        console.log("╔════════════════════════════════════════════════════╗");
        console.log("║     ✓ All Integration Tests Passed                ║");
        console.log("╚════════════════════════════════════════════════════╝\n");
    } catch (error) {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

export { testMoodToVerseFlow, testInvalidMood, testSubscriptionAPI, testVerseDataIntegrity };
