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
        this.id = data.id || crypto.randomUUID();
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.width = data.width || 32;
        this.height = data.height || 32;
        this.health = data.health;
        this.maxHealth = data.maxHealth || this.health;
        this.rotation = data.rotation || 0;
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
        // For entities with health, check health > 0
        if (this.health !== undefined) {
            return this.health > 0;
        }
        // For projectiles, check if they've hit their target
        if (this.hasHitTarget !== undefined) {
            return !this.hasHitTarget;
        }
        // For towers (which don't have health yet), always return true
        return true;
    }

    /**
     * Get the entity's current state for serialization
     * @returns {Object}
     */
    getState() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            health: this.health,
            maxHealth: this.maxHealth,
            rotation: this.rotation
        };
    }

    /**
     * Sync the entity's state from serialized data
     * @param {Object} state - The serialized state
     */
    syncState(state) {
        Object.assign(this, state);
    }

    /**
     * Get data needed for rendering
     * @returns {Object}
     */
    getDrawData() {
        return {
            type: this.getAssetType(),
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation
        };
    }

    /**
     * Get the asset type for rendering
     * @returns {string}
     */
    getAssetType() {
        return 'ENTITY_BASE';
    }
} 