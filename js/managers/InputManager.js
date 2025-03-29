export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = new Set();
        this.mousePosition = { x: 0, y: 0 };
        this.isMousePressed = false;
        
        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        
        // Add event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        canvas.addEventListener('mousemove', this.handleMouseMove);
        canvas.addEventListener('mousedown', this.handleMouseDown);
        canvas.addEventListener('mouseup', this.handleMouseUp);
    }

    handleKeyDown(event) {
        this.keys.add(event.key.toLowerCase());
        console.log('Key pressed:', event.key.toLowerCase());
        console.log('Current keys:', Array.from(this.keys));
    }

    handleKeyUp(event) {
        this.keys.delete(event.key.toLowerCase());
        console.log('Key released:', event.key.toLowerCase());
        console.log('Current keys:', Array.from(this.keys));
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    handleMouseDown(event) {
        this.isMousePressed = true;
    }

    handleMouseUp(event) {
        this.isMousePressed = false;
    }

    isKeyDown(key) {
        const isDown = this.keys.has(key.toLowerCase());
        if (isDown) {
            console.log('Checking key:', key.toLowerCase(), 'is down:', isDown);
        }
        return isDown;
    }

    getMousePosition() {
        return this.mousePosition;
    }

    update() {
        // Update any input state that needs to be updated every frame
    }

    cleanup() {
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    }
} 