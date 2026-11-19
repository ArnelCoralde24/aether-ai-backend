const ALLOWED_ACTIONS = ["attack", "follow", "wander", "mine", "defend", "collect", "return_home"];

export function validateActions(actionPlan) {
    if (!actionPlan || !Array.isArray(actionPlan.actions)) {
        return [{ type: "wander" }];
    }

    return actionPlan.actions.filter(action => {
        if (!action || typeof action.type !== "string") return false;
        return ALLOWED_ACTIONS.includes(action.type.toLowerCase());
    });
}