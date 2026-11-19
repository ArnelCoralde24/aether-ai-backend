const ALLOWED_ACTIONS = ["attack", "follow", "wander", "mine", "defend", "collect", "return_home"];

export function validateActions(actionPlan) {
    if (!actionPlan || !Array.isArray(actionPlan.actions)) {
        return [{ type: "wander" }];
    }

    const validActions = actionPlan.actions
        .filter((action) => action && typeof action.type === "string" && ALLOWED_ACTIONS.includes(action.type.toLowerCase()))
        .map((action) => ({
            type: action.type.toLowerCase(),
            ...(action.target ? { target: String(action.target) } : {})
        }));

    return validActions.length > 0 ? validActions : [{ type: "wander" }];
}