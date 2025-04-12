/**
 * Base class for all UI components
 * Provides common functionality for UI elements
 */
export class UIComponent {
    /**
     * @param {Object} options - Component configuration
     * @param {string} options.id - Unique identifier for the component
     * @param {HTMLElement} options.container - Container element for the component
     */
    constructor({ id, container }) {
        this.id = id;
        this.container = container;
        this.isVisible = true;
        this.eventListeners = new Map();
        this.children = new Map();
    }

    /**
     * Initialize the component
     * Should be overridden by child classes
     */
    init() {
        // Override in child classes
    }

    /**
     * Update the component's state
     * @param {Object} state - New state data
     */
    update(state) {
        // Override in child classes
    }

    /**
     * Show the component
     */
    show() {
        this.isVisible = true;
        this.container.style.display = '';
    }

    /**
     * Hide the component
     */
    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
    }

    /**
     * Add a child component
     * @param {UIComponent} component - Child component to add
     */
    addChild(component) {
        this.children.set(component.id, component);
    }

    /**
     * Remove a child component
     * @param {string} id - ID of child component to remove
     */
    removeChild(id) {
        const child = this.children.get(id);
        if (child) {
            child.destroy();
            this.children.delete(id);
        }
    }

    /**
     * Add an event listener to the component
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    addEventListener(event, handler) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(handler);
        this.container.addEventListener(event, handler);
    }

    /**
     * Remove an event listener from the component
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    removeEventListener(event, handler) {
        const handlers = this.eventListeners.get(event);
        if (handlers) {
            handlers.delete(handler);
            this.container.removeEventListener(event, handler);
        }
    }

    /**
     * Emit a custom event from this component
     * @param {string} event - Event name
     * @param {Object} detail - Event details
     */
    emit(event, detail = {}) {
        const customEvent = new CustomEvent(event, {
            bubbles: true,
            detail
        });
        this.container.dispatchEvent(customEvent);
    }

    /**
     * Clean up the component
     * Remove event listeners and destroy children
     */
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach((handlers, event) => {
            handlers.forEach(handler => {
                this.container.removeEventListener(event, handler);
            });
        });
        this.eventListeners.clear();

        // Destroy all children
        this.children.forEach(child => child.destroy());
        this.children.clear();

        // Remove from DOM if needed
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
} 