import { EnemyManager } from './managers/EnemyManager.js';
import { TowerManager } from './managers/TowerManager.js';
import { Hero } from './entities/Hero.js';
import { TowerConfig } from './config/TowerConfig.js';
import { EnemyConfig } from './config/EnemyConfig.js';
import { WaveConfig } from './config/WaveConfig.js';
import { GameConstants } from './config/GameConstants.js';
import { InputManager } from './managers/InputManager.js';
import { Renderer } from './renderer/Renderer.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { AssetConfig } from './config/AssetConfig.js';
import { UIManager } from './managers/UIManager.js';

export class Game {
    constructor(canvas, uiManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.assetLoader = new AssetLoader();
        this.renderer = new Renderer(this.ctx, this.assetLoader);
        this.inputManager = new InputManager(canvas);
        this.enemyManager = new EnemyManager();
        this.towerManager = new TowerManager();
        this.uiManager = uiManager;
        
        // Initialize hero at center of canvas
        this.hero = new Hero({
            x: canvas.width / 2 - 24,
            y: canvas.height / 2 - 24,
            width: 48,
            height: 48,
            health: 200,
            speed: 2,
            range: 120,
            damage: 15,
            attackSpeed: 2
        });
        this.entities = new Map();
        this.entities.set(this.hero.id, this.hero);
        
        this.isLoading = true;
        this.isRunning = false;
        this.lastTime = 0;
        this.debug = false;
        this.speedMultiplier = 1;
        
        // Time management
        this.deltaTime = 0;
        this.MAX_DELTA = 0.05;
        
        // Game state
        this.paused = false;
        this.gold = GameConstants.INITIAL_GOLD;
        this.lives = GameConstants.INITIAL_LIVES;
        this.currentWave = 1;
        this.canStartWave = true;
        this.selectedTowerType = null;
        this.waveInProgress = false;
    }

    async initialize() {
        try {
            console.log('Game initialization started');
            
            // Load all game assets
            console.log('Loading assets...');
            await this.assetLoader.load(AssetConfig);
            console.log('Assets loaded successfully');
            
            // Initialize game state
            console.log('Initializing game state...');
            this.init();
            
            // Hide loading overlay with a slight delay to ensure smooth transition
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                // Add hidden class (triggers transition)
                loadingOverlay.classList.add('hidden');
                
                // Remove from DOM after transition
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 300); // Match the CSS transition duration
            }
            
            // Update loading state and start game
            this.isLoading = false;
            console.log('Starting game loop...');
            this.start();
            
            console.log('Game initialization completed');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            // Show error in loading overlay instead of hiding it
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                const content = loadingOverlay.querySelector('.loading-content');
                if (content) {
                    content.innerHTML = 'Failed to load game assets.<br>Please refresh the page.';
                } else {
                    loadingOverlay.textContent = 'Failed to load game assets. Please refresh the page.';
                }
                loadingOverlay.style.backgroundColor = 'rgba(102, 0, 0, 0.95)';
            }
            throw error;
        }
    }

    /**
     * Initialize the game
     */
    init() {
        // Create 4 enemies in different positions
        const enemyPositions = [
            { x: 0, y: 150 },    // Top path
            { x: 0, y: 300 },    // Middle path
            { x: 0, y: 450 },    // Bottom path
            { x: 100, y: 300 }   // Already on the field
        ];

        // Store enemy positions for later use
        this.enemyPositions = enemyPositions;
        
        // Bind tower selection handlers
        this.uiManager.bindTowerButtons({
            ranged: () => this.selectTower('ranged'),
            aoe: () => this.selectTower('aoe')
        });
    }

    /**
     * Select a tower type for placement
     * @param {string} type - Tower type from TowerConfig
     */
    selectTower(type) {
        const towerConfig = TowerConfig[type];
        if (!towerConfig) return;

        // Check if player can afford the tower
        if (this.gold >= towerConfig.cost) {
            this.selectedTowerType = type;
            this.uiManager.setSelectedTower(type);
            console.log(`Selected ${type} tower`); // Debug log
        } else {
            console.log('Not enough gold!');
        }
    }

    /**
     * Place a tower at the hero's position
     */
    placeTower() {
        if (!this.selectedTowerType || !this.hero) {
            console.log('Cannot place tower: No tower selected or no hero');
            return;
        }

        const towerConfig = TowerConfig[this.selectedTowerType];
        if (!towerConfig) {
            console.log('Cannot place tower: Invalid tower type');
            return;
        }

        // Check if player can afford the tower
        if (this.gold < towerConfig.cost) {
            console.log('Cannot place tower: Not enough gold');
            return;
        }

        // Create tower at hero's position with all config properties
        const towerData = {
            x: this.hero.x,
            y: this.hero.y,
            width: 40,
            height: 40,
            health: 100,
            range: towerConfig.range,
            damage: towerConfig.damage,
            attackSpeed: towerConfig.attackSpeed,
            projectileSpeed: towerConfig.projectileSpeed,
            projectileSize: towerConfig.projectileSize,
            color: towerConfig.color,
            splashRadius: towerConfig.splashRadius,
            splashDamage: towerConfig.splashDamage
        };

        console.log('Creating tower with data:', towerData); // Debug log

        // Create the tower
        const tower = this.towerManager.addEntity(towerData);
        console.log('Tower created:', tower); // Debug log

        // Verify tower was created
        if (!tower) {
            console.error('Failed to create tower!');
            return;
        }

        // Verify tower is in the manager
        const allTowers = this.towerManager.getAll();
        console.log('All towers:', allTowers); // Debug log

        // Deduct gold
        this.gold -= towerConfig.cost;
        this.uiManager.updateGold(this.gold);

        // Reset selection
        this.selectedTowerType = null;
        this.uiManager.setSelectedTower(null);
        console.log('Tower placed successfully!'); // Debug log
    }

    /**
     * Get the current wave configuration
     * @returns {Object|null} The wave config or null if no more waves
     */
    getCurrentWaveConfig() {
        return WaveConfig[this.currentWave - 1] || null;
    }

    /**
     * Check if there are more waves available
     * @returns {boolean}
     */
    hasMoreWaves() {
        return this.currentWave <= WaveConfig.length;
    }

    /**
     * Start a new wave of enemies
     */
    startWave() {
        if (this.waveInProgress || !this.canStartWave) return;
        
        const waveConfig = this.getCurrentWaveConfig();
        if (!waveConfig) return;

        this.waveInProgress = true;
        this.canStartWave = false;
        
        // Create enemies based on wave configuration
        waveConfig.enemies.forEach(enemyGroup => {
            const enemyConfig = EnemyConfig[enemyGroup.type];
            if (enemyConfig) {
                for (let i = 0; i < enemyGroup.count; i++) {
                    // Calculate staggered spawn positions
                    const spawnOffset = i * 100; // Space enemies apart
                    this.enemyManager.addEntity({
                        x: -spawnOffset, // Start off-screen
                        y: this.ctx.canvas.height / 2, // Center vertically
                        width: enemyConfig.width,
                        height: enemyConfig.height,
                        health: enemyConfig.health,
                        speed: enemyConfig.speed,
                        type: enemyGroup.type,
                        value: enemyConfig.value
                    });
                }
            }
        });
        
        // Update UI
        this.uiManager.updateWaveNumber(this.currentWave);
        this.uiManager.toggleStartWaveButton(false);
        this.currentWave++;
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update input state
        this.inputManager.update();

        // Check for spacebar press to place tower
        if (this.inputManager.isKeyDown(' ')) {
            this.placeTower();
        }

        const gameState = {
            deltaTime,
            input: this.inputManager,
            enemies: this.enemyManager.getAll(),
            towers: this.towerManager.getAll(),
            hero: this.hero,
            gold: this.gold,
            lives: this.lives,
            currentWave: this.currentWave,
            canStartWave: this.canStartWave
        };

        // Update all managers
        this.enemyManager.updateAll(deltaTime, gameState);
        this.towerManager.updateAll(deltaTime, gameState);

        // Update hero if exists
        if (this.hero) {
            this.hero.update(deltaTime, gameState);
            this.handleHeroMovement(deltaTime);
        }

        // Remove dead entities and handle rewards
        this.enemyManager.getAll().forEach(enemy => {
            if (!enemy.isAlive()) {
                // Get the correct enemy config based on type
                const enemyConfig = EnemyConfig[enemy.type] || EnemyConfig.basic;
                // Add gold reward
                this.gold += enemyConfig.value;
                this.uiManager.updateGold(this.gold);
                // Remove the enemy
                this.enemyManager.removeEntity(enemy.id);
            }
        });

        this.towerManager.getAll().forEach(tower => {
            if (!tower.isAlive()) {
                this.towerManager.removeEntity(tower.id);
            }
        });

        if (this.hero && !this.hero.isAlive()) {
            this.hero = null;
            this.lives--;
            this.uiManager.updateLives(this.lives);
            
            if (this.lives <= 0) {
                console.log('Game Over!');
            }
        }

        // Check if wave is complete
        if (this.waveInProgress && this.enemyManager.getAll().length === 0) {
            this.waveInProgress = false;
            this.canStartWave = true;
            this.uiManager.toggleStartWaveButton(true);
            
            const waveConfig = this.getCurrentWaveConfig();
            if (waveConfig) {
                this.gold += waveConfig.reward;
                this.uiManager.updateGold(this.gold);
            }
        }

        // Update UI state
        this.uiManager.updateGold(this.gold);
        this.uiManager.updateLives(this.lives);
        this.uiManager.updateWaveNumber(this.currentWave);
        this.uiManager.toggleStartWaveButton(this.canStartWave);
    }

    /**
     * Handle hero movement with delta time
     * @param {number} deltaTime - Time since last update in seconds
     */
    handleHeroMovement(deltaTime) {
        const speed = 400 * deltaTime;
        
        // Get input state
        const left = this.inputManager.isKeyDown('ArrowLeft');
        const right = this.inputManager.isKeyDown('ArrowRight');
        const up = this.inputManager.isKeyDown('ArrowUp');
        const down = this.inputManager.isKeyDown('ArrowDown');

        // Calculate movement
        let dx = 0;
        let dy = 0;

        if (left) dx -= 1;
        if (right) dx += 1;
        if (up) dy -= 1;
        if (down) dy += 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const factor = 1 / Math.sqrt(2);
            dx *= factor;
            dy *= factor;
        }

        // Apply movement
        this.hero.x += dx * speed;
        this.hero.y += dy * speed;

        // Keep hero within canvas bounds
        this.hero.x = Math.max(0, Math.min(this.canvas.width - this.hero.width, this.hero.x));
        this.hero.y = Math.max(0, Math.min(this.canvas.height - this.hero.height, this.hero.y));
    }

    /**
     * Render game state
     */
    render() {
        // Clear the canvas
        this.renderer.clear();
        
        // Draw background
        this.renderer.drawBackground();
        
        // Draw all game entities
        this.renderer.drawAll(this.enemyManager.getAll());
        this.renderer.drawAll(this.towerManager.getAll());
        
        // Draw projectiles from all towers
        this.towerManager.getAll().forEach(tower => {
            this.renderer.drawAll(tower.projectiles);
        });
        
        // Draw hero if exists
        if (this.hero) {
            this.renderer.drawEntity(this.hero);
        }

        // Draw debug overlay if debug mode is enabled
        if (this.debug) {
            const fps = Math.round(1 / this.deltaTime);
            const entityCount = this.entities.size;
            this.renderer.drawDebugOverlay(fps, entityCount);
        }
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.isLoading) {
            console.warn('Cannot start game while assets are still loading');
            return;
        }
        
        if (this.isRunning) {
            console.warn('Game is already running');
            return;
        }
        
        console.log('Game loop starting...');
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(() => this.loop());
    }

    loop() {
        if (!this.isRunning) {
            console.log('Game loop stopped');
            return;
        }
        
        const currentTime = performance.now();
        this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, this.MAX_DELTA);
        this.lastTime = currentTime;

        if (!this.paused) {
            this.update(this.deltaTime);
            this.render();
        }

        requestAnimationFrame(() => this.loop());
    }
} 