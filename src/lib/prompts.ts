import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Prompt management utilities for loading and validating LLM prompts
 * Ensures content safety by never exposing Qur'an text to LLM
 */

export type PromptType = "system" | "picker" | "daily";

const PROMPTS_DIR = join(process.cwd(), "prompts");

/**
 * Load a prompt file from the prompts directory
 * @param type - The type of prompt to load
 * @returns The prompt content as a string
 * @throws Error if prompt file cannot be read
 */
export async function loadPrompt(type: PromptType): Promise<string> {
    try {
        const filePath = join(PROMPTS_DIR, `${type}.md`);
        const content = await readFile(filePath, "utf-8");

        if (!content || content.trim().length === 0) {
            throw new Error(`Prompt file ${type}.md is empty`);
        }

        return content.trim();
    } catch (error) {
        throw new Error(
            `Failed to load prompt ${type}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

/**
 * Load all prompts required for verse selection
 * @returns Object containing all prompt contents
 */
export async function loadAllPrompts(): Promise<{
    system: string;
    picker: string;
    daily: string;
}> {
    const [system, picker, daily] = await Promise.all([
        loadPrompt("system"),
        loadPrompt("picker"),
        loadPrompt("daily"),
    ]);

    return { system, picker, daily };
}

/**
 * Validate that prompts contain required safety instructions
 * @param systemPrompt - The system prompt to validate
 * @returns true if valid, throws error otherwise
 */
export function validateSystemPrompt(systemPrompt: string): boolean {
    const requiredPhrases = [
        "verse_id",
        "never generate",
        "json",
    ];

    const lowerPrompt = systemPrompt.toLowerCase();

    for (const phrase of requiredPhrases) {
        if (!lowerPrompt.includes(phrase.toLowerCase())) {
            throw new Error(
                `System prompt missing required safety phrase: "${phrase}"`
            );
        }
    }

    return true;
}
