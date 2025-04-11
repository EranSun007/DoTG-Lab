import { Enemy } from '../entities/enemies/Enemy.js';
import { EnemyConfig } from '../config/EnemyConfig.js';
import { Debug } from '../utils/Debug.js';
import { WaveConfig } from '../config/WaveConfig.js';

/**
 * Manages all enemy entities in the game
 */
export class EnemyManager {
    constructor() {
        /** @type {Map<string, Enemy>} */
        this.enemies = new Map();
        /** @type {number} */
        this.idCounter = 0;
        /** @type {Object|null} */
        this.currentWave = null;
    }

    /**
     * Add a new enemy to the manager
     * @param {Object} data - Enemy initialization data
     * @returns {Enemy} The created enemy
     */
    addEnemy(data) {
        // Get configuration for the enemy type
        const config = EnemyConfig[data.type] || EnemyConfig.basic; // Fallback to basic
        if (!config) {
            Debug.warn(`Enemy config not found for type: ${data.type}. Using basic.`);
        }

        // Merge provided data with config defaults
        const enemyData = {
            id: `enemy_${this.idCounter++}`,
            x: data.x !== undefined ? data.x : -50, // Default spawn X off-screen left
            y: data.y !== undefined ? data.y : 300, // Default spawn Y centered
            width: data.width || config.width || 32,
            height: data.height || config.height || 32,
            health: data.health || config.health || 100,
            speed: data.speed || config.speed || 1,
            value: data.value || config.value || 10,
            type: data.type || 'basic',
            gridManager: data.gridManager, // Expect gridManager to be passed in
            pathfinder: data.pathfinder,   // Expect pathfinder to be passed in
            goalX: data.goalX !== undefined ? data.goalX : 800, // Default goal: right edge
            goalY: data.goalY !== undefined ? data.goalY : 300, // Default goal: Y-center
        };

        if (!enemyData.gridManager || !enemyData.pathfinder) {
            Debug.error('EnemyManager.addEnemy is missing gridManager or pathfinder in passed data!');
            return null;
        }

        const enemy = new Enemy(enemyData);
        this.enemies.set(enemy.id, enemy);
        Debug.log('Added enemy:', enemy.id, 'Type:', enemy.type);
        return enemy;
    }

    /**
     * Remove an enemy by ID
     * @param {string} id - The ID of the enemy to remove
     */
    removeEnemy(id) {
        if (this.enemies.has(id)) {
            this.enemies.delete(id);
            Debug.log('Removed enemy:', id);
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
            enemiesSpawned: 0
        };
        this.clear();
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
            
            // Check if we should spawn a new enemy
            if (this.currentWave.enemiesSpawned < waveConfig.totalEnemies) {
                const timeSinceLastSpawn = performance.now() / 1000 - (this.currentWave.lastSpawnTime || 0);
                if (timeSinceLastSpawn >= waveConfig.spawnInterval) {
                    this.spawnEnemy();
                    this.currentWave.lastSpawnTime = performance.now() / 1000;
                    this.currentWave.enemiesSpawned++;
                }
            }
            
            // Check if wave is complete
            Debug.log(`Checking wave completion: spawned=${this.currentWave.enemiesSpawned}, total=${waveConfig.totalEnemies}, enemiesLeft=${this.enemies.size}`);
            if (this.currentWave.enemiesSpawned >= waveConfig.totalEnemies && 
                this.enemies.size === 0) {
                Debug.log(`Wave completion condition MET.`);
                Debug.log(`Wave ${this.currentWave.number} completed.`);
                this.currentWave = null;
                gameState.waveInProgress = false;
                gameState.canStartWave = true;
            }
        }

        // Update all enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, gameState);
            if (!enemy.isAlive()) {
                // Remove dead enemies during update
                // const enemyConfig = WaveConfig[gameState.currentWave].enemyTypes[enemy.type] || 
                //                   WaveConfig[gameState.currentWave].enemyTypes.basic;
                // gameState.gold += enemyConfig.value; // Gold reward logic removed - belongs in Game.js
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
        
        const enemy = new Enemy({
            type: enemyType,
            health: enemyConfig.health,
            speed: enemyConfig.speed,
            value: enemyConfig.value,
            path: waveConfig.path
        });

        this.enemies.set(enemy.id, enemy);
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
     * @param {Object} [dependencies] - Optional dependencies for testing
     * @param {Object} [dependencies.gridManager] - GridManager for path finding
     * @param {Object} [dependencies.pathfinder] - Pathfinder for finding paths
     */
    syncState(states, dependencies = {}) {
        this.clear();
        if (Array.isArray(states)) {
            states.forEach(state => {
                // Create an enemy from state data
                // Use provided dependencies for testing if available
                const enemyData = { 
                    ...state,
                    gridManager: dependencies.gridManager || state.gridManager,
                    pathfinder: dependencies.pathfinder || state.pathfinder
                };
                
                // For tests, we can handle missing dependencies
                try {
                    const enemy = new Enemy(enemyData); 
                    this.enemies.set(enemy.id, enemy);
                } catch (error) {
                    Debug.warn(`Failed to create enemy during syncState: ${error.message}`);
                    // In test environments, try to create a minimal enemy
                    if (!enemyData.gridManager || !enemyData.pathfinder) {
                        // Create enemy and rely on syncState override
                        const minimalEnemy = new Enemy({
                            id: state.id,
                            x: state.x,
                            y: state.y,
                            type: state.type || 'basic',
                            health: state.health || 100,
                            // Add minimal required properties
                            gridManager: {}, // Empty object instead of null
                            pathfinder: {}
                        });
                        // Override properties from state
                        minimalEnemy.syncState(state);
                        this.enemies.set(minimalEnemy.id, minimalEnemy);
                    }
                }
            });
        }
    }

    /**
     * Clear all enemies
     */
    clear() {
        this.enemies.clear();
        this.idCounter = 0;
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