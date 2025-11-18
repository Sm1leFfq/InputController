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
    controller.bindActions({ "jump": { keys: [32] } });
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
        this.target = null;
        this.pressedKeyboardKeys = []

        this._keydownHandler = null;
        this._keyupHandler = null;
    }

    _keydown(event, actions) {
        if (controller.enabled && controller.focused) {
            const key = event.keyCode;
            for (const actionName in actions) {
                const action = actions[actionName];
                if (action.keys.includes(key) && action.enabled) {
                    if (!this.pressedKeyboardKeys.includes(key)) this.pressedKeyboardKeys.push(key);

                    if (action.enabled && !action.active) {
                        this.target.dispatchEvent(new CustomEvent(controller.ACTION_ACTIVATED, { detail: actionName }))
                    }

                    action.active = true;
                }
            }
        }
    }

    _keyup(event, actions) {
        if (controller.enabled && controller.focused) {
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
                        action.active = false;

                    if (action.enabled && !action.active) {
                        this.target.dispatchEvent(new CustomEvent(controller.ACTION_DEACTIVATED, { detail: actionName }))
                    }
                }
            }
        }
    }

    controlInput(target, actions) {
        this._keydownHandler = (event) => { this._keydown(event, actions) }
        this._keyupHandler = (event) => { this._keyup(event, actions) }

        this.target = target;

        this.target.addEventListener("keydown", this._keydownHandler);
        this.target.addEventListener("keyup", this._keyupHandler);
    }

    unbindControlInput() {
        target.removeEventListener("keydown", this._keydownHandler);
        target.removeEventListener("keyup", this._keyupHandler);
    }
}

const plugin = new KeyboardPlugin();

// controller.addPlugin(plugin);