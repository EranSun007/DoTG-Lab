import { Enemy } from '../entities/Enemy.js';
import { Debug } from '../utils/Debug.js';
import { WaveConfig } from '../config/WaveConfig.js';

/**
 * Manages all enemy entities in the game
 */
export class EnemyManager {
    constructor() {
        /** @type {Enemy[]} */
        this.enemies = [];
        /** @type {Object|null} */
        this.currentWave = null;
    }

    /**
     * Add a new enemy to the manager
     * @param {Object} data - Enemy initialization data
     * @returns {Enemy} The created enemy
     */
    addEnemy(data) {
        const enemy = new Enemy(data);
        this.enemies.push(enemy);
        return enemy;
    }

    /**
     * Remove an enemy by ID
     * @param {string} id - The ID of the enemy to remove
     */
    removeEnemy(id) {
        this.enemies = this.enemies.filter(enemy => enemy.id !== id);
    }

    /**
     * Start a new wave
     * @param {number} waveNumber - The wave number to start
     */
    startWave(waveNumber) {
        this.currentWave = {
            number: waveNumber,
            config: WaveConfig[waveNumber],
            enemiesSpawned: 0
        };
        this.clear();
    }

    /**
     * Update all enemies
     * @param {number} deltaTime - Time since last update in seconds
     * @param {Object} gameState - Current game state
     */
    update(deltaTime, gameState) {
        // Update all enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, gameState);
        });
    }

    /**
     * Draw all enemies
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    getRandomEnemyType(enemyTypes) {
        const totalWeight = Object.values(enemyTypes).reduce((sum, config) => sum + config.spawnWeight, 0);
        let random = Math.random() * totalWeight;

        for (const [type, config] of Object.entries(enemyTypes)) {
            random -= config.spawnWeight;
            if (random <= 0) return type;
        }

        return 'basic'; // Fallback
    }

    /**
     * Draw all enemies
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawAll(ctx) {
        for (const enemy of this.enemies) {
            enemy.draw(ctx);
        }
    }

    /**
     * Get all enemies
     * @returns {Enemy[]} Array of all enemies
     */
    getAll() {
        return this.enemies;
    }

    /**
     * Get enemy by ID
     * @param {string} id - Enemy ID
     * @returns {Enemy|null} The enemy or null if not found
     */
    getById(id) {
        return this.enemies.find(enemy => enemy.id === id) || null;
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
            this.addEnemy(state);
        });
    }

    /**
     * Clear all enemies
     */
    clear() {
        this.enemies = [];
        Debug.log('EnemyManager cleared');
    }

    /**
     * Clean up and destroy the manager
     */
    destroy() {
        this.clear();
        this.currentWave = null;
        Debug.log('EnemyManager destroyed');
    }
} 