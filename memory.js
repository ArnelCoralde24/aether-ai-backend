const shortTermMemory = new Map();
const MAX_HISTORY_PER_ENTITY = 10;

export function saveShortTermMemory(entityId, stateData) {
    const key = entityId || "default_aether";
    const existing = shortTermMemory.get(key) || { history: [] };
    const entry = {
        ...(stateData && typeof stateData === "object" ? stateData : {}),
        timestamp: Date.now()
    };

    const updatedHistory = [...existing.history, entry].slice(-MAX_HISTORY_PER_ENTITY);

    shortTermMemory.set(key, {
        latest: entry,
        history: updatedHistory,
        timestamp: entry.timestamp
    });
}

export function getShortTermMemory(entityId) {
    const key = entityId || "default_aether";
    const record = shortTermMemory.get(key);
    return record ? record.history : [];
}

export function clearOldMemory(maxAgeMs = 1000 * 60 * 60) {
    const now = Date.now();
    for (const [key, value] of shortTermMemory.entries()) {
        if (!value.timestamp || now - value.timestamp > maxAgeMs) {
            shortTermMemory.delete(key);
        }
    }
}