/**
 * Test LLM verse selection
 * Run with: npx tsx scripts/test-llm-selection.ts
 */

import { getLLMClient } from "../src/lib/llm-client";
import { loadPrompt } from "../src/lib/prompts";

async function testLLMConnection() {
    console.log("🧪 Testing LLM Connection...\n");

    // Check if API key is set
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.log("❌ OPENAI_API_KEY not set in .env");
        console.log("\nTo enable LLM:");
        console.log("1. Get API key from: https://platform.openai.com/api-keys");
        console.log("2. Add to .env: OPENAI_API_KEY=\"sk-your_key_here\"");
        console.log("3. Restart dev server\n");
        console.log("ℹ️  System will use weighted random fallback (still works well!)\n");
        return false;
    }

    console.log("✅ API key found");
    console.log(`   Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

    // Test LLM call
    try {
        console.log("📡 Testing LLM API call...\n");

        const llmClient = getLLMClient();
        const pickerPrompt = await loadPrompt("picker");

        const testInput = {
            requested_moods: ["anxious"],
            k: 1,
            candidates: [
                { verse_id: "2:286", moods: ["anxious"], weight: 0.9 },
                { verse_id: "94:5", moods: ["anxious"], weight: 0.85 },
                { verse_id: "13:28", moods: ["anxious"], weight: 0.8 },
            ],
            recently_shown: [],
            context: {
                time_of_day: "morning",
                is_jummah: false,
                is_ramadan: false,
            },
        };

        const response = await llmClient.selectVerseForMood(pickerPrompt, testInput);

        console.log("✅ LLM call successful!");
        console.log("\nResponse:");
        console.log(JSON.stringify(response, null, 2));
        console.log("\n✅ LLM is working correctly!\n");

        return true;
    } catch (error) {
        console.error("❌ LLM call failed:");
        console.error(error instanceof Error ? error.message : error);
        console.log("\nℹ️  System will use weighted random fallback\n");
        return false;
    }
}

async function runTest() {
    const isWorking = await testLLMConnection();

    if (isWorking) {
        console.log("🎉 LLM integration is fully functional!");
        console.log("   Verse selection will use AI-powered matching\n");
    } else {
        console.log("⚠️  LLM not configured");
        console.log("   Verse selection will use weighted random (still good!)\n");
    }
}

runTest();
