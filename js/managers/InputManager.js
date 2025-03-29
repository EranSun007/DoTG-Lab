export class InputManager {
    constructor() {
        this.keys = new Set();
        this.mousePosition = { x: 0, y: 0 };
        this.mouseButtons = new Set();
        this.clickedButtons = new Set();
        this.keyStates = new Map();
        this.touchState = null;  // Future touch support
        this.gamepadState = null;  // Future gamepad support
    }

    init(canvas) {
        // All event listeners centralized here
        window.addEventListener('keydown', (e) => this.keys.add(e.key));
        window.addEventListener('keyup', (e) => this.keys.delete(e.key));
        // ... mouse listeners
    }

    isKeyDown(key) {
        return this.keys.has(key);
    }

    getKeyDuration(key) {
        const startTime = this.keyStates.get(key);
        return startTime ? (performance.now() - startTime) / 1000 : 0;
    }

    getMousePosition() {
        return { ...this.mousePosition };
    }

    isMousePressed(button) {
        return this.mouseButtons.has(button);
    }

    isMouseClicked(button) {
        return this.clickedButtons.has(button);
    }

    update() {
        // Clear single-frame clicks
        this.clickedButtons.clear();
    }

    // Example of extensible interface
    isActionPressed(action) {
        // Could check multiple input sources
        return this.isKeyDown(this.keyBindings[action]) ||
               this.isGamepadButtonPressed(this.gamepadBindings[action]);
    }

    getDebugInfo() {
        return {
            pressedKeys: Array.from(this.keys),
            mousePosition: this.mousePosition,
            pressedButtons: Array.from(this.mouseButtons)
        };
    }
} 