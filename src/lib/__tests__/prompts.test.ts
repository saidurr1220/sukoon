/**
 * Tests for prompt loading and validation
 * Run with: npx tsx src/lib/__tests__/prompts.test.ts
 */

import { loadPrompt, loadAllPrompts, validateSystemPrompt } from "../prompts";

async function testPromptLoading() {
    console.log("Testing prompt loading...");

    // Test individual prompt loading
    const systemPrompt = await loadPrompt("system");
    if (!systemPrompt || systemPrompt.length === 0) {
        throw new Error("System prompt should not be empty");
    }
    console.log("✓ System prompt loaded successfully");

    const pickerPrompt = await loadPrompt("picker");
    if (!pickerPrompt || pickerPrompt.length === 0) {
        throw new Error("Picker prompt should not be empty");
    }
    console.log("✓ Picker prompt loaded successfully");

    const dailyPrompt = await loadPrompt("daily");
    if (!dailyPrompt || dailyPrompt.length === 0) {
        throw new Error("Daily prompt should not be empty");
    }
    console.log("✓ Daily prompt loaded successfully");

    // Test loading all prompts
    const allPrompts = await loadAllPrompts();
    if (!allPrompts.system || !allPrompts.picker || !allPrompts.daily) {
        throw new Error("All prompts should be loaded");
    }
    console.log("✓ All prompts loaded successfully");
}

async function testPromptValidation() {
    console.log("\nTesting prompt validation...");

    const systemPrompt = await loadPrompt("system");

    // Test valid system prompt
    const isValid = validateSystemPrompt(systemPrompt);
    if (!isValid) {
        throw new Error("Valid system prompt should pass validation");
    }
    console.log("✓ System prompt validation passed");

    // Test that prompt contains safety phrases
    const lowerPrompt = systemPrompt.toLowerCase();
    if (!lowerPrompt.includes("verse_id")) {
        throw new Error("System prompt must contain 'verse_id'");
    }
    if (!lowerPrompt.includes("never generate")) {
        throw new Error("System prompt must contain 'never generate'");
    }
    if (!lowerPrompt.includes("json")) {
        throw new Error("System prompt must contain 'json'");
    }
    console.log("✓ System prompt contains required safety phrases");

    // Test invalid prompt
    try {
        validateSystemPrompt("This is an invalid prompt");
        throw new Error("Invalid prompt should fail validation");
    } catch (error) {
        if (error instanceof Error && error.message.includes("missing required safety phrase")) {
            console.log("✓ Invalid prompt correctly rejected");
        } else {
            throw error;
        }
    }
}

async function testErrorHandling() {
    console.log("\nTesting error handling...");

    // Test loading non-existent prompt
    try {
        await loadPrompt("nonexistent" as any);
        throw new Error("Should throw error for non-existent prompt");
    } catch (error) {
        if (error instanceof Error && error.message.includes("Failed to load prompt")) {
            console.log("✓ Non-existent prompt error handled correctly");
        } else {
            throw error;
        }
    }
}

async function runTests() {
    console.log("=== Prompt Tests ===\n");

    try {
        await testPromptLoading();
        await testPromptValidation();
        await testErrorHandling();

        console.log("\n✓ All prompt tests passed\n");
    } catch (error) {
        console.error("\n✗ Test failed:", error);
        process.exit(1);
    }
}

runTests();
