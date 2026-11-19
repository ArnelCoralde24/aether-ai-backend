const shortTermMemory = new Map();

export function saveShortTermMemory(entityId, stateData) {
    shortTermMemory.set(entityId, {
        ...stateData,
        timestamp: Date.now()
    });
}

export function getShortTermMemory(entityId) {
    return shortTermMemory.get(entityId) || null;
}