import { Enemy } from '../entities/enemies/Enemy.js';
import { Debug } from '../utils/Debug.js';
import { WaveConfig } from '../config/WaveConfig.js';

/**
 * Manages all enemy entities in the game
 */
export class EnemyManager {
    constructor(gridManager, pathfinder) {
        /** @type {Map<string, Enemy>} */
        this.enemies = new Map();
        /** @type {Object|null} */
        this.currentWave = null;
        this.gridManager = gridManager;
        this.pathfinder = pathfinder;
    }

    /**
     * Add a new enemy to the manager
     * @param {Object} data - Enemy initialization data
     * @returns {Enemy} The created enemy
     */
    addEnemy(data) {
        // Support both passed-in and constructor-provided dependencies
        const enemyData = {
            ...data,
            gridManager: data.gridManager || this.gridManager,
            pathfinder: data.pathfinder || this.pathfinder
        };

        if (!enemyData.gridManager || !enemyData.pathfinder) {
            Debug.error('EnemyManager.addEnemy is missing gridManager or pathfinder!');
            return null;
        }

        const enemy = new Enemy(enemyData);
        this.enemies.set(enemy.id, enemy);
        return enemy;
    }

    /**
     * Remove an enemy by ID
     * @param {string} id - The ID of the enemy to remove
     */
    removeEnemy(id) {
        if (this.enemies.has(id)) {
            this.enemies.delete(id);
            return true;
        }
        return false;
    }

    /**
     * Start a new wave
     * @param {number} waveNumber - The wave number to start
     */
    startWave(waveNumber) {
        this.currentWave = {
            number: waveNumber,
            config: WaveConfig[waveNumber],
            enemiesSpawned: 0,
            lastSpawnTime: 0
        };
        // We don't necessarily want to clear old enemies if they're still alive
        // but typically a wave starts when previous ones are cleared.
    }

    /**
     * Update all enemies and wave state
     * @param {number} deltaTime - Time since last update in seconds
     * @param {Object} gameState - Current game state
     */
    update(deltaTime, gameState) {
        // Update wave state if active
        if (this.currentWave) {
            const waveConfig = this.currentWave.config;
            const currentTime = performance.now() / 1000;
            
            // Check if we should spawn a new enemy
            if (this.currentWave.enemiesSpawned < waveConfig.totalEnemies) {
                if (currentTime - this.currentWave.lastSpawnTime >= waveConfig.spawnInterval) {
                    this.spawnEnemy();
                    this.currentWave.lastSpawnTime = currentTime;
                    this.currentWave.enemiesSpawned++;
                }
            }
            
            // Check if wave is complete
            if (this.currentWave.enemiesSpawned >= waveConfig.totalEnemies && 
                this.enemies.size === 0) {
                this.currentWave = null;
                gameState.waveInProgress = false;
                gameState.canStartWave = true;
                // Game class handles gold/wave increments usually
            }
        }

        // Update all enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, gameState);
            if (enemy.health <= 0) {
                this.removeEnemy(enemy.id);
            }
        });
    }

    /**
     * Spawn a new enemy based on current wave configuration
     */
    spawnEnemy() {
        if (!this.currentWave) return;

        const waveConfig = this.currentWave.config;
        const enemyType = this.getRandomEnemyType(waveConfig.enemyTypes);
        const enemyConfig = waveConfig.enemyTypes[enemyType];
        
        this.addEnemy({
            type: enemyType,
            health: enemyConfig.health,
            speed: enemyConfig.speed,
            value: enemyConfig.value,
            // Goal coordinates (usually right side of screen)
            goalX: 800,
            goalY: 300
        });
    }

    /**
     * Get a random enemy type based on spawn weights
     * @param {Object} enemyTypes - Enemy type configurations
     * @returns {string} Selected enemy type
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
        this.enemies.forEach(enemy => {
            enemy.draw(ctx);
        });
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
        return this.enemies.get(id);
    }

    /**
     * Get the current state of all enemies
     * @returns {Array} Array of enemy states
     */
    getState() {
        return this.getAll().map(enemy => enemy.getState());
    }

    /**
     * Sync enemy states from serialized data
     * @param {Array} states - Array of enemy states
     */
    syncState(states) {
        this.clear();
        if (Array.isArray(states)) {
            states.forEach(state => {
                this.addEnemy(state);
            });
        }
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
        this.currentWave = null;
        Debug.log('EnemyManager destroyed');
    }
}
