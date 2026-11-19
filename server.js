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

app.get("/api/aether/brain", (req, res) => {
    res.json({
        success: true,
        companion: "Aether",
        providers: ["gemini", "grok", "openrouter"]
    });
});

app.post("/api/aether/brain", async (req, res) => {
    try {
        const { entityId, playerMessage, worldState, selectedModel, provider } = req.body;

        saveShortTermMemory(entityId, worldState);
        const recentMemory = getShortTermMemory ? getShortTermMemory(entityId) : null;

        const promptText = `
        You are Aether, an autonomous AI player teammate in Minecraft Bedrock.
        Current World State: ${JSON.stringify(worldState || {})}
        Recent Memory: ${JSON.stringify(recentMemory || [])}
        Player Message/Command: "${playerMessage || "None"}"

        Respond ONLY in valid JSON format matching this schema:
        {
            "message": "Short dialogue response to the player",
            "goal": "current_goal_name",
            "actions": [{"type": "attack|follow|wander|mine|defend|collect|return_home", "target": "optional"}]
        }
        `;

        const modelResult = await queryAIModel(
            promptText,
            selectedModel || "gemini-2.5-flash",
            provider || "gemini"
        );

        let aiResponse = modelResult?.data || {
            message: "Handa na ako, tuloy lang tayo sa laro.",
            goal: "follow",
            actions: [{ type: "follow" }]
        };

        aiResponse.actions = validateActions(aiResponse);

        res.json({
            success: true,
            source: modelResult?.source || "fallback",
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