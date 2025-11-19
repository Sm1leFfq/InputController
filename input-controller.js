class InputController {
    constructor(actionsToBind = null, target = null) {
        this.plugins = [];
        this.actions = {};
        this._enabled = false
        this._focused = true;

        this._pluginEventsHandler = (event) => {
            this._updateActionsState(event.detail.actionName, event.detail.pluginName, event.detail.actionState);
        };

        if (actionsToBind) this.bindActions(actionsToBind);

        if (target) {
            this.attach(target);
        }

        window.addEventListener("focus", () => { this.focused = true; })
        window.addEventListener("blur", () => { this.focused = false; })
    }

    get ACTION_ACTIVATED() {
        return "input-controller:action-activated";
    }

    get ACTION_DEACTIVATED() {
        return "input-controller:action-deactivated";
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(val) {
        this._deactivateAllActions();
        this._enabled = val;
    }

    get focused() {
        return this._focused;
    }

    set focused(val) {
        this._deactivateAllActions();
        this._focused = val;
    }

    _deactivateAllActions() {
        for (const actionName in this.actions) {
            if (this.actions[actionName].active) {
                this.actions[actionName].active = false;
                this.actions[actionName].activeBy = [];
                target.dispatchEvent(new CustomEvent(this.ACTION_DEACTIVATED, { detail: actionName }));
            }
        }
    }

    _bindPluginsInputs() {
        if (this.target) {
            for (const plugin of this.plugins) {
                if (!plugin.binded) {
                    plugin.instance.controlInput(this.target, this.actions);
                } else {
                    plugin.instance.unbindControlInput();
                    plugin.instance.controlInput(this.target, this.actions);
                }
                plugin.binded = true;
            }

            this.target.addEventListener("updateActionStateRequest", this._pluginEventsHandler)
        }
    }

    _unbindPluginsInputs() {
        if (this.target) {
            for (const plugin of this.plugins) {
                if (plugin.binded) {
                    plugin.instance.unbindControlInput();
                    plugin.binded = false;
                }
            }

            this.target.removeEventListener("updateActionStateRequest", this._pluginEventsHandler)
        }
    }

    _updateActionsState(actionName, pluginName, actionState) {
        const action = this.actions[actionName];

        if (this.enabled && this.focused) {
            if (actionState) {
                if (!action.activeBy.includes(pluginName)) {
                    if (action.enabled) {
                        action.activeBy.push(pluginName);
                        if (!action.active) {
                            this.target.dispatchEvent(new CustomEvent(controller.ACTION_ACTIVATED, { detail: actionName }));
                        }

                        action.active = true;
                    }
                }
            } else {
                action.activeBy.splice(action.activeBy.indexOf(pluginName), 1)

                if (action.activeBy.length === 0) {
                    action.active = false;

                    if (action.enabled) {
                        this.target.dispatchEvent(new CustomEvent(controller.ACTION_DEACTIVATED, { detail: actionName }));
                    }
                }
            }
        }

    }

    bindActions(actionsToBind) {
        this.actions = {...this.actions, ...actionsToBind };

        for (const actionName in this.actions) {
            const action = this.actions[actionName];
            action.active = false;
            if ("enabled" in action) {
                continue;
            } else {
                action.enabled = true;
            }
            action.activeBy = [];
        }

        this._bindPluginsInputs();
    }

    enableAction(actionName) {
        if (this.actions[actionName]) {
            this.actions[actionName].enabled = true;
        }
    }

    disableAction(actionName) {
        if (this.actions[actionName]) {
            this.actions[actionName].enabled = false;
            this.actions[actionName].active = false;
            this.actions[actionName].activeBy = [];

            this.target.dispatchEvent(new CustomEvent(controller.ACTION_DEACTIVATED, { detail: actionName }))
        }
    }

    attach(target, dontEnable = false) {
        this.enabled = !dontEnable;
        this.focused = true;
        this.target = target;

        this._bindPluginsInputs();
    }

    detach() {
        this._unbindPluginsInputs();

        this.target = null;
        this.enabled = false;
        this.focused = false;
    }

    isActionActive(action) {
        if (this.actions[action]) {
            return this.actions[action].active;
        }
    }

    addPlugin(plugin) {
        this.plugins.push({ instance: plugin, binded: false });
        this._bindPluginsInputs();
    }
}