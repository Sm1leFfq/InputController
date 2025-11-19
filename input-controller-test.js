const target = document.getElementById("test")

const actionsNames = ["left", "right", "up", "down", "jump"]

const actionsToBind = {
    "left": {
        keys: [37, 65]
    },
    "right": {
        keys: [39, 68]
    },
    "up": {
        keys: [38, 87]
    },
    "down": {
        keys: [40, 83]
    }
}

const controller = new InputController(actionsToBind);

target.addEventListener(controller.ACTION_ACTIVATED, (event) => {
    console.log(controller.ACTION_ACTIVATED, event.detail);
})

target.addEventListener(controller.ACTION_DEACTIVATED, (event) => {
    console.log(controller.ACTION_DEACTIVATED, event.detail);
})

const attachButton = document.getElementById("attachButton");
const detachButton = document.getElementById("detachButton");
const activateButton = document.getElementById("activateButton");
const deactivateButton = document.getElementById("deactivateButton");
const bindButton = document.getElementById("bindButton");

attachButton.onclick = () => {
    controller.attach(target);
    target.focus();
}

detachButton.onclick = () => {
    controller.detach();
    target.focus();
}

activateButton.onclick = () => {
    controller.enableAction("jump");
    target.focus();
}

deactivateButton.onclick = () => {
    controller.disableAction("jump");
    target.focus();
}

bindButton.onclick = () => {
    controller.bindActions({ "jump": { keys: [32, 0] } });
    target.focus();
}

function interact() {
    for (const actionName of actionsNames) {
        if (controller.isActionActive(actionName)) {

            let marginLeft = parseInt(target.style.marginLeft);
            let marginTop = parseInt(target.style.marginTop);

            switch (actionName) {
                case "left":
                    if (marginLeft >= 2) target.style.marginLeft = marginLeft - 2 + "px";
                    break;

                case "right":
                    target.style.marginLeft = marginLeft + 2 + "px";
                    break;

                case "up":
                    if (marginTop >= 2) target.style.marginTop = marginTop - 2 + "px";
                    break;

                case "down":
                    target.style.marginTop = marginTop + 2 + "px";
                    break;

                case "jump":
                    target.style.backgroundColor = "#000"
                    break;
                default:
                    break;
            }
        } else if (actionName === "jump") {
            target.style.backgroundColor = "red";
        }
    }
}

setInterval(interact, 1000 / 60);

class KeyboardPlugin {
    constructor() {
        this.name = "keyboard";
        this.target = null;
        this.pressedKeyboardKeys = [];
        this.eventName = "updateActionStateRequest";

        this._keydownHandler = null;
        this._keyupHandler = null;
        this._controlsBinded = false;
    }

    _keydown(event, actions) {
        const key = event.keyCode;
        for (const actionName in actions) {
            const action = actions[actionName];
            if (action.keys.includes(key) && action.enabled) {
                if (!this.pressedKeyboardKeys.includes(key)) this.pressedKeyboardKeys.push(key);

                this.target.dispatchEvent(new CustomEvent(this.eventName, {
                    detail: {
                        actionName,
                        pluginName: this.name,
                        actionState: true
                    }
                }))
            }
        }

    }

    _keyup(event, actions) {
        const key = event.keyCode;
        for (const actionName in actions) {
            const action = actions[actionName];

            if (action.keys.includes(key) && action.enabled) {
                this.pressedKeyboardKeys.splice(this.pressedKeyboardKeys.indexOf(key), 1);

                let allKeysUp = true;

                for (const key of action.keys) {
                    if (this.pressedKeyboardKeys.includes(key)) allKeysUp = false;
                }

                if (allKeysUp)
                    this.target.dispatchEvent(new CustomEvent(this.eventName, {
                        detail: {
                            actionName,
                            pluginName: this.name,
                            actionState: false
                        }
                    }))

            }
        }

    }

    controlInput(target, actions) {
        this._keydownHandler = (event) => { this._keydown(event, actions) }
        this._keyupHandler = (event) => { this._keyup(event, actions) }

        this.target = target;

        this.target.addEventListener("keydown", this._keydownHandler);
        this.target.addEventListener("keyup", this._keyupHandler);

        this._controlsBinded = true;
    }

    unbindControlInput() {
        if (this._controlsBinded) {
            this.target.removeEventListener("keydown", this._keydownHandler);
            this.target.removeEventListener("keyup", this._keyupHandler);

            this._controlsBinded = false;
        }
    }
}

class MousePlugin {
    constructor() {
        this.name = "mouse";
        this.target = null;
        this.eventName = "updateActionStateRequest";

        this.pressedMouseKeys = [];

        this._mousedownHandler = null;
        this._mouseupHandler = null;
        this._controlsBinded = false;
    }

    _mousedown(event, actions) {
        const key = event.button;
        for (const actionName in actions) {
            const action = actions[actionName];
            if (action.keys.includes(key) && action.enabled) {
                if (!this.pressedMouseKeys.includes(key)) this.pressedMouseKeys.push(key);

                this.target.dispatchEvent(new CustomEvent(this.eventName, {
                    detail: {
                        actionName,
                        pluginName: this.name,
                        actionState: true
                    }
                }))
            }

        }
    }

    _mouseup(event, actions) {
        const key = event.button;
        for (const actionName in actions) {
            const action = actions[actionName];

            if (action.keys.includes(key) && action.enabled) {
                this.pressedMouseKeys.splice(this.pressedMouseKeys.indexOf(key), 1);

                let allKeysUp = true;

                for (const key of action.keys) {
                    if (this.pressedMouseKeys.includes(key)) allKeysUp = false;
                }

                if (allKeysUp)
                    this.target.dispatchEvent(new CustomEvent(this.eventName, {
                        detail: {
                            actionName,
                            pluginName: this.name,
                            actionState: false
                        }
                    }))
            }

        }
    }

    controlInput(target, actions) {
        this._mousedownHandler = (event) => { this._mousedown(event, actions) }
        this._mouseupHandler = (event) => { this._mouseup(event, actions) }

        this.target = target;

        this.target.addEventListener("mousedown", this._mousedownHandler);
        this.target.addEventListener("mouseup", this._mouseupHandler);

        this._controlsBinded = true;
    };

    unbindControlInput() {
        if (this._controlsBinded) {
            this.target.removeEventListener("mousedown", this._mousedownHandler);
            this.target.removeEventListener("mouseup", this._mouseupHandler);

            this._controlsBinded = false;
        }
    };
}

const keyboard = new KeyboardPlugin();
const mouse = new MousePlugin();

controller.addPlugin(keyboard);
controller.addPlugin(mouse);