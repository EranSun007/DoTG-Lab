import { Debug } from '../utils/Debug.js';

/**
 * Manages user input and event handling
 */
export class InputManager {
    constructor(canvas, renderer) {
        this.canvas = canvas;
        this.renderer = renderer;
        this.keys = new Set();
        this.previousKeys = new Set(); // Track previous key states
        this.mouseScreenPosition = { x: 0, y: 0 };
        this.isMousePressed = false;
        this.lastMousePressed = false; // Track previous state for click detection
        this.debug = false; // Disable excessive key checking logs
        
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

        Debug.log('InputManager initialized');
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
        this.mouseScreenPosition = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    handleMouseDown(event) {
        console.log('Mouse down event');
        this.isMousePressed = true;
    }

    handleMouseUp(event) {
        console.log('Mouse up event');
        this.isMousePressed = false;
    }

    isKeyDown(key) {
        const isDown = this.keys.has(key.toLowerCase());
        if (this.debug) {
            console.log('Checking key:', key.toLowerCase(), 'is down:', isDown);
        }
        return isDown;
    }

    isKeyJustPressed(key) {
        const currentKey = key.toLowerCase();
        const wasPressed = this.previousKeys.has(currentKey);
        const isPressed = this.keys.has(currentKey);
        return isPressed && !wasPressed;
    }

    getMousePosition() {
        if (this.renderer && this.renderer.camera) {
            return this.renderer.camera.screenToWorld(
                this.mouseScreenPosition.x,
                this.mouseScreenPosition.y
            );
        }
        Debug.warn('Renderer or camera not available for mouse position conversion.');
        return this.mouseScreenPosition;
    }

    getMouseScreenPosition() {
        return this.mouseScreenPosition;
    }

    isMousePressed() {
        return this.isMousePressed;
    }

    update() {
        // Update previous keys state
        this.previousKeys = new Set(this.keys);
        
        // Update any input state that needs to be updated every frame
        if (this.isMousePressed) {
            const worldPos = this.getMousePosition(); 
            console.log('Mouse is currently pressed at world coordinates:', worldPos);
        }
    }

    /**
     * Clean up and destroy the manager
     */
    destroy() {
        // Remove all event listeners
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);

        // Clear state
        this.keys.clear();
        this.keys = null;
        this.mouseScreenPosition = { x: 0, y: 0 };
        this.isMousePressed = false;
        this.previousKeys.clear();

        Debug.log('InputManager destroyed');
    }
} 