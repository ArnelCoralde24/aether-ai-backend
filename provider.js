import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function queryAIModel(prompt, modelChoice = "gemini-2.5-flash") {
    if (!ai) {
        return {
            source: "offline_fallback",
            message: "AI Backend API key not configured. Running on robust local offline brain.",
            goal: "explore",
            actions: [{ type: "wander" }]
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: modelChoice,
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        return JSON.parse(response.text());
    } catch (error) {
        console.error("[Backend Error] Model query failed, falling back to local logic:", error);
        return {
            source: "error_fallback",
            message: "I am having trouble connecting to the cloud brain, switching to offline survival mode.",
            goal: "survive",
            actions: [{ type: "defend" }]
        };
    }
}