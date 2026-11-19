import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { queryAIModel } from "./provider.js";
import { validateActions } from "./action_validator.js";
import { saveShortTermMemory, getShortTermMemory } from "./memory.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.post("/api/aether/brain", async (req, res) => {
    try {
        const { entityId, playerMessage, worldState, selectedModel } = req.body;

        // Save incoming context to short-term memory
        saveShortTermMemory(entityId, worldState);

        const promptText = `
        You are Aether, an autonomous AI player teammate in Minecraft Bedrock.
        Current World State: ${JSON.stringify(worldState)}
        Player Message/Command: "${playerMessage || 'None'}"
        
        Respond ONLY in valid JSON format matching this schema:
        {
            "message": "Short dialogue response to the player",
            "goal": "current_goal_name",
            "actions": [{"type": "attack|follow|wander|mine|defend|collect|return_home", "target": "optional"}]
        }
        `;

        // Ipasa ang selectedModel (Gemini, Grok, o OpenRouter model string) papunta sa provider router
        const modelResult = await queryAIModel(promptText, selectedModel || "gemini-2.5-flash");
        
        // Kunin ang data mula sa naging tagumpay na AI model
        let aiResponse = modelResult.data;

        // Validate actions for absolute security
        aiResponse.actions = validateActions(aiResponse);

        res.json({
            success: true,
            source: modelResult.source,
            data: aiResponse
        });
    } catch (error) {
        console.error("Server endpoint error:", error);
        res.status(500).json({ success: false, error: "Internal backend error" });
    }
});

app.listen(PORT, () => {
    console.log(`[Aether AI Backend] Server running securely on port ${PORT}`);
});