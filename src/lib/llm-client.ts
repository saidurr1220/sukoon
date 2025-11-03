import { z } from "zod";
import { loadPrompt, validateSystemPrompt } from "./prompts";

/**
 * LLM Client wrapper for verse selection
 * Implements strict content safety protocols - only verse IDs are sent to LLM
 */

// Response schemas for validation
export const PickerResponseSchema = z.object({
    picked: z.array(
        z.object({
            verse_id: z.string(),
            mood_reason: z.string().optional(),
        })
    ),
    advice_warning: z.boolean().optional(),
    notes: z.string().optional(),
});

export const DailyResponseSchema = z.object({
    picked: z.string(),
});

export type PickerResponse = z.infer<typeof PickerResponseSchema>;
export type DailyResponse = z.infer<typeof DailyResponseSchema>;

export interface LLMConfig {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
}

export class LLMClient {
    private config: LLMConfig;
    private systemPrompt: string | null = null;

    constructor(config: LLMConfig = {}) {
        this.config = {
            apiKey: config.apiKey || process.env.OPENAI_API_KEY,
            model: config.model || "gpt-4o-mini",
            maxTokens: config.maxTokens || 500,
            temperature: config.temperature || 0.7,
        };
    }

    /**
     * Initialize the client by loading and validating system prompt
     */
    async initialize(): Promise<void> {
        this.systemPrompt = await loadPrompt("system");
        validateSystemPrompt(this.systemPrompt);
    }

    /**
     * Call LLM for verse selection based on mood
     * @param userPrompt - The picker prompt with verse IDs only
     * @param input - The input data (verse IDs and metadata only)
     * @returns Validated picker response
     */
    async selectVerseForMood(
        userPrompt: string,
        input: unknown
    ): Promise<PickerResponse> {
        if (!this.systemPrompt) {
            await this.initialize();
        }

        try {
            const response = await this.callLLM(
                userPrompt,
                JSON.stringify(input, null, 2)
            );

            return PickerResponseSchema.parse(response);
        } catch (error) {
            throw new Error(
                `LLM verse selection failed: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Call LLM for daily verse selection
     * @param userPrompt - The daily prompt with verse IDs only
     * @param input - The input data (verse IDs and metadata only)
     * @returns Validated daily response
     */
    async selectDailyVerse(
        userPrompt: string,
        input: unknown
    ): Promise<DailyResponse> {
        if (!this.systemPrompt) {
            await this.initialize();
        }

        try {
            const response = await this.callLLM(
                userPrompt,
                JSON.stringify(input, null, 2)
            );

            return DailyResponseSchema.parse(response);
        } catch (error) {
            throw new Error(
                `LLM daily selection failed: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Internal method to call the LLM API
     * @param userPrompt - The user prompt
     * @param inputData - The input data as JSON string
     * @returns Parsed JSON response
     */
    private async callLLM(
        userPrompt: string,
        inputData: string
    ): Promise<unknown> {
        if (!this.config.apiKey) {
            throw new Error(
                "LLM API key not configured. Set OPENAI_API_KEY environment variable."
            );
        }

        const messages = [
            { role: "system", content: this.systemPrompt },
            { role: "user", content: `${userPrompt}\n\nInput:\n${inputData}` },
        ];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                model: this.config.model,
                messages,
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`LLM API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
            throw new Error("Invalid LLM API response structure");
        }

        const content = data.choices[0].message.content;

        try {
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`Failed to parse LLM response as JSON: ${content}`);
        }
    }
}

/**
 * Singleton instance for the LLM client
 */
let llmClientInstance: LLMClient | null = null;

/**
 * Get or create the LLM client instance
 */
export function getLLMClient(): LLMClient {
    if (!llmClientInstance) {
        llmClientInstance = new LLMClient();
    }
    return llmClientInstance;
}
