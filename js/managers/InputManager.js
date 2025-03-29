export class InputManager {
    constructor() {
        this.keys = new Set();
        this.mousePosition = { x: 0, y: 0 };
        this.mouseButtons = new Set();
        this.clickedButtons = new Set();
        this.keyStates = new Map();
    }

    init(canvas) {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.key);
            this.keyStates.set(e.key, performance.now());
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
            this.keyStates.delete(e.key);
        });

        // Mouse input
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mousePosition = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        });

        canvas.addEventListener('mousedown', (e) => {
            this.mouseButtons.add(e.button);
            this.clickedButtons.add(e.button);
        });

        canvas.addEventListener('mouseup', (e) => {
            this.mouseButtons.delete(e.button);
        });
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

    getDebugInfo() {
        return {
            pressedKeys: Array.from(this.keys),
            mousePosition: this.mousePosition,
            pressedButtons: Array.from(this.mouseButtons)
        };
    }
} 