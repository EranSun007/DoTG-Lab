import { Tower } from '../entities/towers/Tower.js';
import { Debug } from '../utils/Debug.js';

/**
 * Manages all tower entities in the game
 */
export class TowerManager {
    constructor() {
        /** @type {Map<string, Tower>} */
        this.towers = new Map();
    }

    /**
     * Add a new tower to the manager
     * @param {Object} data - Tower initialization data
     * @returns {Tower} The created tower
     */
    addEntity(data) {
        const tower = new Tower(data);
        this.towers.set(tower.id, tower);
        return tower;
    }

    /**
     * Remove a tower by ID
     * @param {string} id - The ID of the tower to remove
     */
    removeEntity(id) {
        this.towers.delete(id);
    }

    /**
     * Update all towers
     * @param {number} dt - Delta time
     * @param {Object} gameState - Current game state
     */
    updateAll(dt, gameState) {
        for (const tower of this.towers.values()) {
            tower.update(dt, gameState);
        }
    }

    /**
     * Draw all towers
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawAll(ctx) {
        for (const tower of this.towers.values()) {
            tower.draw(ctx);
        }
    }

    /**
     * Get all towers
     * @returns {Tower[]} Array of all towers
     */
    getAll() {
        return Array.from(this.towers.values());
    }

    /**
     * Get tower by ID
     * @param {string} id - Tower ID
     * @returns {Tower|null} The tower or null if not found
     */
    getById(id) {
        return this.towers.get(id) || null;
    }

    /**
     * Get the current state of all towers
     * @returns {Array} Array of tower states
     */
    getState() {
        return this.towers.map(tower => tower.getState());
    }

    /**
     * Sync tower states from serialized data
     * @param {Array} states - Array of tower states
     */
    syncState(states) {
        this.clear();
        states.forEach(state => {
            const tower = new Tower(state);
            this.towers.set(tower.id, tower);
        });
    }

    /**
     * Clear all towers
     */
    clear() {
        this.towers.clear();
        Debug.log('TowerManager cleared');
    }

    /**
     * Clean up and destroy the manager
     */
    destroy() {
        this.clear();
        this.towers = null;
        Debug.log('TowerManager destroyed');
    }
} 