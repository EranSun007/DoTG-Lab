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

        // === MOUSE STATE (current frame) ===
        this.mousePressed = false;              // Is mouse currently down?
        this.previousMousePressed = false;       // Was mouse down last frame?

        // === DERIVED STATES (computed from current + previous) ===
        this.mouseJustPressed = false;           // Just pressed this frame (false→true)
        this.mouseJustReleased = false;          // Just released this frame (true→false)

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

        // DEBUG: Test if events are firing at all
        canvas.addEventListener('click', (e) => {
            console.log('[InputManager] CLICK EVENT FIRED!', e.clientX, e.clientY);
        });

        Debug.log('InputManager initialized');
        console.log('[InputManager] Canvas element:', canvas);
        console.log('[InputManager] Canvas dimensions:', canvas.width, 'x', canvas.height);
    }

    handleKeyDown(event) {
        this.keys.add(event.key.toLowerCase());
    }

    handleKeyUp(event) {
        this.keys.delete(event.key.toLowerCase());
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseScreenPosition = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    handleMouseDown(event) {
        this.mousePressed = true;
    }

    handleMouseUp(event) {
        this.mousePressed = false;
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

    update() {
        // 1. Snapshot previous state FIRST
        this.previousMousePressed = this.mousePressed;
        this.previousKeys = new Set(this.keys);

        // 2. Compute derived states from current + previous
        this.mouseJustPressed = this.mousePressed && !this.previousMousePressed;
        this.mouseJustReleased = !this.mousePressed && this.previousMousePressed;

        // 3. Don't reset flags - they'll be overwritten next frame
    }

    /**
     * Query current mouse state
     * @returns {boolean} True if mouse is currently pressed
     */
    isMouseDown() {
        return this.mousePressed;
    }

    /**
     * Query current mouse state
     * @returns {boolean} True if mouse is currently not pressed
     */
    isMouseUp() {
        return !this.mousePressed;
    }

    /**
     * Query mouse state transition
     * @returns {boolean} True if mouse was just pressed this frame
     */
    wasMouseJustPressed() {
        return this.mouseJustPressed;
    }

    /**
     * Query mouse state transition
     * @returns {boolean} True if mouse was just released this frame
     */
    wasMouseJustReleased() {
        return this.mouseJustReleased;
    }

    /**
     * Get mouse position in world coordinates
     * @returns {{x: number, y: number}} World coordinates
     */
    getMouseWorldPosition() {
        return this.getMousePosition();
    }

    /**
     * Log current mouse state for debugging
     */
    logState() {
        const worldPos = this.getMousePosition();
        Debug.log('Mouse State:', {
            pressed: this.mousePressed,
            previousPressed: this.previousMousePressed,
            justPressed: this.mouseJustPressed,
            justReleased: this.mouseJustReleased,
            worldPos: `(${worldPos.x.toFixed(0)}, ${worldPos.y.toFixed(0)})`,
            screenPos: `(${this.mouseScreenPosition.x.toFixed(0)}, ${this.mouseScreenPosition.y.toFixed(0)})`
        });
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
        this.mousePressed = false;
        this.previousMousePressed = false;
        this.mouseJustPressed = false;
        this.mouseJustReleased = false;
        this.previousKeys.clear();

        Debug.log('InputManager destroyed');
    }
} 