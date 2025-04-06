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
     * @param {number} dt - Delta time
     * @param {Object} gameState - Current game state
     */
    updateAll(dt, gameState) {
        // Spawn new enemies if wave is active
        if (this.currentWave && this.currentWave.enemiesSpawned < this.currentWave.config.count) {
            const spawnInterval = this.currentWave.config.spawnInterval || 1000;
            if (gameState.lastSpawnTime + spawnInterval <= gameState.currentTime) {
                this.spawnEnemy();
                gameState.lastSpawnTime = gameState.currentTime;
            }
        }

        // Update existing enemies
        for (const enemy of this.enemies) {
            enemy.update(dt, gameState);
            
            // Remove dead enemies
            if (enemy.health <= 0) {
                this.removeEnemy(enemy.id);
            }
        }
    }

    /**
     * Spawn a new enemy for the current wave
     */
    spawnEnemy() {
        if (!this.currentWave) return;

        const enemyType = this.currentWave.config.enemyType;
        const path = this.currentWave.config.path;
        const enemy = this.addEnemy({
            type: enemyType,
            path: path,
            pathIndex: 0
        });

        this.currentWave.enemiesSpawned++;
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