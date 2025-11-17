class InputController {
    constructor(actionsToBind = null, target = null) {
        this.actions = {};
        this.enabled = true;
        this.focused = true;

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

    ACTION_ACTIVATED = "input-controller:action-activated";
    ACTION_DEACTIVATED = "input-controller:action-deactivated";

    _keydownHandler(event) {
        if (this.enabled) {
            const key = event.keyCode;
            for (const actionName in this.actions) {
                const action = this.actions[actionName];
                if (action.keys.includes(key) && !action.active) {
                    action.active = true;

                    this.pressedKeyboardKeys.push(key);

                    if (action.enabled) {
                        target.dispatchEvent(new CustomEvent(this.ACTION_ACTIVATED, { detail: actionName }))
                    }
                }
            }
        }

    }

    _keyupHandler(event) {
        if (this.enabled) {
            const key = event.keyCode;
            for (const actionName in this.actions) {
                const action = this.actions[actionName];

                if (action.keys.includes(key)) {
                    this.pressedKeyboardKeys.splice(this.pressedKeyboardKeys.indexOf(key), 1);

                    action.active = false;

                    if (action.enabled) {
                        target.dispatchEvent(new CustomEvent(this.ACTION_DEACTIVATED, { detail: actionName }))
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
        }
    }

    enableAction(actionName) {
        if (this.actions[actionName]) {
            this.actions[actionName].enabled = true;
        }
    }

    disableAction(actionName) {
        if (this.actions) {
            this.actions[actionName].enabled = false;
        }
    }

    attach(target, dontEnable = false) {
        this.enabled = !dontEnable;
        this.focused = true;
        this.target = target;

        this.target.addEventListener("keydown", this._keydownBindedHandler);

        this.target.addEventListener("keyup", this._keyupBindedHandler);
    }

    detach() {
        this.target.removeEventListener("keydown", this._keydownBindedHandler);
        this.target.removeEventListener("keyup", this._keyupBindedHandler);

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
}