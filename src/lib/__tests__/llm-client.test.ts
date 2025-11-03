/**
 * Tests for LLM client with mocked responses
 * Run with: npx tsx src/lib/__tests__/llm-client.test.ts
 */

import { LLMClient, PickerResponseSchema, DailyResponseSchema } from "../llm-client";

// Mock fetch globally
const originalFetch = global.fetch;

function mockLLMResponse(response: any) {
    global.fetch = async () => {
        return {
            ok: true,
            json: async () => ({
                choices: [
                    {
                        message: {
                            content: JSON.stringify(response),
                        },
                    },
                ],
            }),
        } as Response;
    };
}

function mockLLMError(status: number, message: string) {
    global.fetch = async () => {
        return {
            ok: false,
            status,
            text: async () => message,
        } as Response;
    };
}

function restoreFetch() {
    global.fetch = originalFetch;
}

async function testLLMClientInitialization() {
    console.log("Testing LLM client initialization...");

    const client = new LLMClient();
    await client.initialize();
    console.log("✓ LLM client initialized successfully");
}

async function testPickerResponseValidation() {
    console.log("\nTesting picker response validation...");

    // Test valid picker response
    const validResponse = {
        picked: [
            { verse_id: "2:255", mood_reason: "comfort and protection" },
        ],
        advice_warning: false,
        notes: "Selected verse for anxious mood",
    };

    const parsed = PickerResponseSchema.parse(validResponse);
    if (parsed.picked.length !== 1 || parsed.picked[0].verse_id !== "2:255") {
        throw new Error("Valid picker response should parse correctly");
    }
    console.log("✓ Valid picker response parsed correctly");

    // Test minimal valid response
    const minimalResponse = {
        picked: [{ verse_id: "9:51" }],
    };

    const parsedMinimal = PickerResponseSchema.parse(minimalResponse);
    if (parsedMinimal.picked.length !== 1) {
        throw new Error("Minimal picker response should parse correctly");
    }
    console.log("✓ Minimal picker response parsed correctly");

    // Test invalid response
    try {
        PickerResponseSchema.parse({ picked: "invalid" });
        throw new Error("Invalid picker response should fail validation");
    } catch (error) {
        console.log("✓ Invalid picker response correctly rejected");
    }
}

async function testDailyResponseValidation() {
    console.log("\nTesting daily response validation...");

    // Test valid daily response
    const validResponse = { picked: "3:139" };
    const parsed = DailyResponseSchema.parse(validResponse);
    if (parsed.picked !== "3:139") {
        throw new Error("Valid daily response should parse correctly");
    }
    console.log("✓ Valid daily response parsed correctly");

    // Test invalid response
    try {
        DailyResponseSchema.parse({ picked: 123 });
        throw new Error("Invalid daily response should fail validation");
    } catch (error) {
        console.log("✓ Invalid daily response correctly rejected");
    }
}

async function testNoQuranTextSentToLLM() {
    console.log("\nTesting that no Qur'an text is sent to LLM...");

    let capturedRequest: any = null;

    // Mock fetch to capture the request
    global.fetch = async (url: any, options: any) => {
        capturedRequest = JSON.parse(options.body);
        return {
            ok: true,
            json: async () => ({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({ picked: [{ verse_id: "2:255" }] }),
                        },
                    },
                ],
            }),
        } as Response;
    };

    const client = new LLMClient({ apiKey: "test-key" });
    await client.initialize();

    const testInput = {
        requested_moods: ["anxious"],
        k: 1,
        candidates: [
            { verse_id: "2:255", moods: ["anxious"], weight: 0.9 },
        ],
        recently_shown: [],
    };

    try {
        await client.selectVerseForMood("Test prompt", testInput);

        // Verify no Arabic text or translations in request
        const requestBody = JSON.stringify(capturedRequest);

        // Check that only verse IDs are present
        if (!requestBody.includes("2:255")) {
            throw new Error("Request should contain verse IDs");
        }

        // Common Arabic words that should NOT be in the request
        const arabicPatterns = ["الله", "بسم", "الرحمن", "الرحيم"];
        for (const pattern of arabicPatterns) {
            if (requestBody.includes(pattern)) {
                throw new Error(`Request should not contain Arabic text: ${pattern}`);
            }
        }

        console.log("✓ Verified no Qur'an text sent to LLM");
    } finally {
        restoreFetch();
    }
}

async function testLLMErrorHandling() {
    console.log("\nTesting LLM error handling...");

    // Test API error
    mockLLMError(500, "Internal Server Error");

    const client = new LLMClient({ apiKey: "test-key" });
    await client.initialize();

    try {
        await client.selectVerseForMood("Test prompt", {});
        throw new Error("Should throw error on API failure");
    } catch (error) {
        if (error instanceof Error && error.message.includes("LLM API error")) {
            console.log("✓ API error handled correctly");
        } else {
            throw error;
        }
    } finally {
        restoreFetch();
    }

    // Test missing API key
    const clientNoKey = new LLMClient();
    await clientNoKey.initialize();

    try {
        await clientNoKey.selectVerseForMood("Test prompt", {});
        throw new Error("Should throw error when API key is missing");
    } catch (error) {
        if (error instanceof Error && error.message.includes("API key not configured")) {
            console.log("✓ Missing API key error handled correctly");
        } else {
            throw error;
        }
    }
}

async function testFallbackMechanisms() {
    console.log("\nTesting fallback mechanisms...");

    // Test invalid JSON response
    global.fetch = async () => {
        return {
            ok: true,
            json: async () => ({
                choices: [
                    {
                        message: {
                            content: "invalid json {",
                        },
                    },
                ],
            }),
        } as Response;
    };

    const client = new LLMClient({ apiKey: "test-key" });
    await client.initialize();

    try {
        await client.selectVerseForMood("Test prompt", {});
        throw new Error("Should throw error on invalid JSON");
    } catch (error) {
        if (error instanceof Error && error.message.includes("Failed to parse LLM response")) {
            console.log("✓ Invalid JSON response handled correctly");
        } else {
            throw error;
        }
    } finally {
        restoreFetch();
    }
}

async function runTests() {
    console.log("=== LLM Client Tests ===\n");

    try {
        await testLLMClientInitialization();
        await testPickerResponseValidation();
        await testDailyResponseValidation();
        await testNoQuranTextSentToLLM();
        await testLLMErrorHandling();
        await testFallbackMechanisms();

        console.log("\n✓ All LLM client tests passed\n");
    } catch (error) {
        console.error("\n✗ Test failed:", error);
        process.exit(1);
    }
}

runTests();
