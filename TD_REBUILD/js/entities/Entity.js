/**
 * @typedef {Object} EntityData
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} width - Entity width
 * @property {number} height - Entity height
 * @property {number} health - Entity health
 * @property {string} [id] - Optional entity ID for network sync
 */

/**
 * @typedef {Object} GameState
 * @property {Map<string, Entity>} entities - All game entities
 * @property {number} deltaTime - Time since last update
 */

/**
 * Base class for all game entities
 * Provides common functionality and properties for all game objects
 */
export class Entity {
    /**
     * @param {EntityData} data - Entity initialization data
     */
    constructor(data) {
        this.x = data.x;
        this.y = data.y;
        this.width = data.width;
        this.height = data.height;
        this.health = data.health;
        this.id = data.id || crypto.randomUUID();
        this.sprite = null; // Will be set by child classes
    }

    /**
     * Update entity state
     * @param {number} deltaTime - Time since last update
     * @param {GameState} gameState - Current game state
     */
    update(deltaTime, gameState) {
        // Base implementation - to be overridden by child classes
    }

    /**
     * Draw entity on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // To be implemented by child classes
    }

    /**
     * Check if entity is alive
     * @returns {boolean}
     */
    isAlive() {
        return this.health > 0;
    }

    /**
     * Get entity state for network sync
     * @returns {Object}
     */
    getState() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            health: this.health
        };
    }
} 