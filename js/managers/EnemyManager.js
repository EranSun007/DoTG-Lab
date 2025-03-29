import { Enemy } from '../entities/Enemy.js';
import { Debug } from '../utils/Debug.js';

/**
 * Manages all enemy entities in the game
 */
export class EnemyManager {
    constructor() {
        /** @type {Map<string, Enemy>} */
        this.enemies = new Map();
    }

    /**
     * Add a new enemy to the manager
     * @param {Object} data - Enemy initialization data
     * @returns {Enemy} The created enemy
     */
    addEntity(data) {
        const enemy = new Enemy(data);
        this.enemies.set(enemy.id, enemy);
        return enemy;
    }

    /**
     * Remove an enemy by ID
     * @param {string} id - The ID of the enemy to remove
     */
    removeEntity(id) {
        this.enemies.delete(id);
    }

    /**
     * Update all enemies
     * @param {number} dt - Delta time
     * @param {Object} gameState - Current game state
     */
    updateAll(dt, gameState) {
        for (const enemy of this.enemies.values()) {
            enemy.update(dt, gameState);
        }
    }

    /**
     * Draw all enemies
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawAll(ctx) {
        for (const enemy of this.enemies.values()) {
            enemy.draw(ctx);
        }
    }

    /**
     * Get all enemies
     * @returns {Enemy[]} Array of all enemies
     */
    getAll() {
        return Array.from(this.enemies.values());
    }

    /**
     * Get enemy by ID
     * @param {string} id - Enemy ID
     * @returns {Enemy|null} The enemy or null if not found
     */
    getById(id) {
        return this.enemies.get(id) || null;
    }

    /**
     * Get the current state of all enemies
     * @returns {Array} Array of enemy states
     */
    getState() {
        return this.enemies.map(enemy => enemy.getState());
    }

    /**
     * Sync enemy states from serialized data
     * @param {Array} states - Array of enemy states
     */
    syncState(states) {
        this.clear();
        states.forEach(state => {
            const enemy = new Enemy(state);
            this.enemies.set(enemy.id, enemy);
        });
    }

    /**
     * Clear all enemies
     */
    clear() {
        this.enemies.clear();
        Debug.log('EnemyManager cleared');
    }

    /**
     * Clean up and destroy the manager
     */
    destroy() {
        this.clear();
        this.enemies = null;
        Debug.log('EnemyManager destroyed');
    }
} 