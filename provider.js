import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();


const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;


const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openrouter = openRouterApiKey ? new OpenAI({ 
    apiKey: openRouterApiKey, 
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "https://github.com/ArnelCoralde24/AetherAI", 
        "X-Title": "Aether AI Player"
    }
}) : null;


const FREE_OPENROUTER_MODELS = [
    "meta-llama/llama-3.1-8b-instruct:free",
    "google/gemma-2-9b-it:free",
    "mistralai/mistral-7b-instruct:free"
];

export async function queryAIModel(prompt, preferredModel = "gemini-2.5-flash") {
    
    
    if (ai) {
        try {
            console.log("[AI Auto-Router] Sinusubukan ang Google Gemini (Free)...");
            const response = await ai.models.generateContent({
                model: preferredModel.includes("gemini") ? preferredModel : "gemini-2.5-flash",
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            return {
                source: "gemini_free",
                data: JSON.parse(response.text())
            };
        } catch (geminiError) {
            console.warn("[AI Auto-Router] ⚠️ Nagka-issue ang Gemini, naghahanap ng libreng OpenRouter backup...", geminiError.message);
        }
    }

    
    if (openrouter) {
        for (const freeModel of FREE_OPENROUTER_MODELS) {
            try {
                console.log(`[AI Auto-Router] Sinusubukan ang libreng OpenRouter model: ${freeModel}...`);
                const completion = await openrouter.chat.completions.create({
                    model: freeModel,
                    messages: [
                        { role: "system", content: "You are Aether, an autonomous AI player teammate in Minecraft Bedrock. Respond strictly in valid JSON format." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }
                });
                return {
                    source: `openrouter_${freeModel.split('/')[1].split(':')[0]}`,
                    data: JSON.parse(completion.choices[0].message.content)
                };
            } catch (modelError) {
                console.warn(`[AI Auto-Router] ⚠️ Nabigo ang ${freeModel}, sinusubukan ang susunod na libreng modelo...`);
            }
        }
    }

    
    return {
        source: "offline_fallback",
        data: {
            message: "Walang internet o offline ang mga libreng AI, nag-switch ako sa local offline survival mode.",
            goal: "survive",
            actions: [{ type: "defend" }]
        }
    };
}