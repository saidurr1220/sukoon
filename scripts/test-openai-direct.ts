/**
 * Direct OpenAI API test
 */

// Dotenv not needed - Next.js loads .env automatically

async function testOpenAI() {
    console.log("🧪 Testing OpenAI API directly...\n");

    // Load from environment variable
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.log("❌ OPENAI_API_KEY not found in environment");
        return;
    }

    console.log(`✅ API Key found: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 4)}\n`);

    try {
        console.log("📡 Making API call...\n");

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant.",
                    },
                    {
                        role: "user",
                        content: "Say 'Hello from OpenAI!' in JSON format with a 'message' field.",
                    },
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 100,
            }),
        });

        console.log(`Response status: ${response.status}\n`);

        if (!response.ok) {
            const errorText = await response.text();
            console.log("❌ API Error:");
            console.log(errorText);
            return;
        }

        const data = await response.json();
        console.log("✅ API Response:");
        console.log(JSON.stringify(data, null, 2));

        const message = JSON.parse(data.choices[0].message.content);
        console.log("\n✅ Parsed message:", message);

        console.log("\n🎉 OpenAI API is working correctly!");
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testOpenAI();
