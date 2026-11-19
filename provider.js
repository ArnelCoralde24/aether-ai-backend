import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

const grokApiKey = process.env.GROK_API_KEY;
const grok = grokApiKey
  ? new OpenAI({
      apiKey: grokApiKey,
      baseURL: "https://api.x.ai/v1"
    })
  : null;

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openrouter = openRouterApiKey
  ? new OpenAI({
      apiKey: openRouterApiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/ArnelCoralde24/AetherAI",
        "X-Title": "Aether AI Player"
      }
    })
  : null;

const FREE_OPENROUTER_MODELS = [
  "openrouter/free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "google/gemma-2-9b-it:free",
  "mistralai/mistral-7b-instruct:free"
];

function buildProviderOrder(preferred = "gemini") {
  const normalized = String(preferred).toLowerCase();
  const all = ["gemini", "grok", "openrouter"];
  if (!all.includes(normalized)) return all;
  return [normalized, ...all.filter((p) => p !== normalized)];
}

export async function queryAIModel(prompt, preferredModel = "gemini-2.5-flash", preferredProvider = "gemini") {
  const order = buildProviderOrder(preferredProvider);

  for (const providerName of order) {
    if (providerName === "gemini" && ai) {
      try {
        const response = await ai.models.generateContent({
          model: preferredModel && preferredModel.includes("gemini") ? preferredModel : "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        const rawText = typeof response.text === "function" ? response.text() : response.text;
        return {
          source: "gemini_api",
          data: JSON.parse(rawText)
        };
      } catch (geminiError) {
        console.warn("[AI Auto-Router] Gemini error, trying next provider...", geminiError.message);
      }
    }

    if (providerName === "grok" && grok) {
      try {
        const completion = await grok.chat.completions.create({
          model: preferredModel && preferredModel.includes("grok") ? preferredModel : "grok-3-mini",
          messages: [
            {
              role: "system",
              content: "You are Aether, an autonomous AI player teammate in Minecraft Bedrock. Respond strictly in valid JSON format."
            },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        });
        return {
          source: "grok_api",
          data: JSON.parse(completion.choices[0].message.content)
        };
      } catch (grokError) {
        console.warn("[AI Auto-Router] Grok error, trying next provider...", grokError.message);
      }
    }

    if (providerName === "openrouter" && openrouter) {
      const modelsToTry =
        preferredModel && !preferredModel.includes("gemini") && !preferredModel.includes("grok")
          ? [preferredModel, ...FREE_OPENROUTER_MODELS]
          : FREE_OPENROUTER_MODELS;

      for (const modelName of modelsToTry) {
        try {
          const completion = await openrouter.chat.completions.create({
            model: modelName,
            messages: [
              {
                role: "system",
                content: "You are Aether, an autonomous AI player teammate in Minecraft Bedrock. Respond strictly in valid JSON format."
              },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
          });
          return {
            source: `openrouter_${modelName.split("/").pop().split(":")[0]}`,
            data: JSON.parse(completion.choices[0].message.content)
          };
        } catch (modelError) {
          console.warn(`[AI Auto-Router] OpenRouter model ${modelName} failed, trying next...`);
        }
      }
    }
  }

  return {
    source: "offline_fallback",
    data: {
      message: "Walang koneksyon sa cloud AI ngayon, nag-switch ako sa local survival mode.",
      goal: "survive",
      actions: [{ type: "defend" }]
    }
  };
}