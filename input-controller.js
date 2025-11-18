class InputController {
    constructor(actionsToBind = null, target = null) {
        this.plugins = [];
        this.actions = {};
        this._enabled = true
        this._focused = true;

        this.pressedKeyboardKeys = [];

        this._keydownBindedHandler = this._keydownHandler.bind(this);
        this._keyupBindedHandler = this._keyupHandler.bind(this);

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
        this._focused = val;
    }

    _keydownHandler(event) {
        if (this.enabled && this.focused) {
            const key = event.keyCode;
            for (const actionName in this.actions) {
                const action = this.actions[actionName];
                if (action.keys.includes(key) && action.enabled) {
                    if (!this.pressedKeyboardKeys.includes(key)) this.pressedKeyboardKeys.push(key);

                    if (action.enabled && !action.active) {
                        target.dispatchEvent(new CustomEvent(this.ACTION_ACTIVATED, { detail: actionName }))
                    }

                    action.active = true;
                }
            }
        }
    }

    _keyupHandler(event) {
        if (this.enabled && this.focused) {
            const key = event.keyCode;
            for (const actionName in this.actions) {
                const action = this.actions[actionName];

                if (action.keys.includes(key) && action.enabled) {
                    this.pressedKeyboardKeys.splice(this.pressedKeyboardKeys.indexOf(key), 1);

                    let allKeysUp = true;

                    for (const key of action.keys) {
                        if (this.pressedKeyboardKeys.includes(key)) allKeysUp = false;
                    }

                    if (allKeysUp)
                        action.active = false;

                    if (action.enabled && !action.active) {
                        target.dispatchEvent(new CustomEvent(this.ACTION_DEACTIVATED, { detail: actionName }))
                    }
                }
            }
        }
    }

    _deactivateAllActions() {
        for (const actionName in this.actions) {
            if (this.actions[actionName].active) {
                this.actions[actionName].active = false;
                target.dispatchEvent(new CustomEvent(this.ACTION_DEACTIVATED, { detail: actionName }))
            }
        }
    }

    _bindPluginInputs() {
        for (const plugin of this.plugins) {
            plugin.controlInput(this.target, this.actions);
        }
    }

    _unbindPluginInputs() {
        for (const plugin of this.plugins) {
            plugin.unbindControlInput();
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
            action.activeBy = null;
        }

        this._unbindPluginInputs();
        this._bindPluginInputs();
    }

    enableAction(actionName) {
        if (this.actions[actionName]) {
            this.actions[actionName].enabled = true;
        }
    }

    disableAction(actionName) {
        if (this.actions) {
            this.actions[actionName].enabled = false;
            this.actions[actionName].active = false;
        }
    }

    attach(target, dontEnable = false) {
        this.enabled = !dontEnable;
        this.focused = true;
        this.target = target;

        this._bindPluginInputs();

        // this.target.addEventListener("keydown", this._keydownBindedHandler);

        // this.target.addEventListener("keyup", this._keyupBindedHandler);
    }

    detach() {
        // this.target.removeEventListener("keydown", this._keydownBindedHandler);
        // this.target.removeEventListener("keyup", this._keyupBindedHandler);

        this._unbindPluginInputs();

        this.target = null;
        this.enabled = false;
        this.focused = false;
    }

    isActionActive(action) {
        if (this.actions[action]) {
            return this.actions[action].active;
        }
    }

    isKeyPressed(keyCode) {
        return this.pressedKeyboardKeys.includes(keyCode);
    }

    addPlugin(plugin) {
        this.plugins.push(plugin);
    }

    updateActionsState(actionName, pluginName, actionState) {
        const action = this.actions[actionName];

        if (!action.active && actionState) {
            action.activeBy = pluginName;
            action.active = true;
            if (action.enabled) {
                this.target.dispatchEvent(new CustomEvent(controller.ACTION_ACTIVATED, { detail: actionName }))
            }
        } else {
            if (action.activeBy === pluginName && !actionState) {
                action.activeBy = null;
                action.active = false;
                if (action.enabled) {
                    this.target.dispatchEvent(new CustomEvent(controller.ACTION_DEACTIVATED, { detail: actionName }))
                }
            }
        }
    }
}