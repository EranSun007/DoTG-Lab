import { EnemyManager } from './managers/EnemyManager.js';
import { TowerManager } from './managers/TowerManager.js';
import { ProjectileManager } from './managers/ProjectileManager.js';
import { GridManager } from './managers/GridManager.js';
import { Hero } from './entities/Hero.js';
import { TowerConfig } from './config/TowerConfig.js';
import { EnemyConfig } from './config/EnemyConfig.js';
import { WaveConfig } from './config/WaveConfig.js';
import { GameConstants } from './config/GameConstants.js';
import { InputManager } from './managers/InputManager.js';
import { Renderer } from './renderer/Renderer.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { AssetConfig } from './config/AssetConfig.js';
import { HeroConfig } from './config/HeroConfig.js';
import { UIManager } from './managers/UIManager.js';
import { DebugMenu } from './debug/DebugMenu.js';
import { Debug } from './utils/Debug.js';
import { UILabels } from './config/UILabels.js';
import { GridConfig } from './config/GridConfig.js';
import { LevelConfig } from './config/LevelConfig.js';


export class Game {
    constructor(canvas, uiManager) {
        this.canvas = canvas;
        this.uiManager = uiManager;
        this.setup();
    }

    setup() {
        this.ctx = this.canvas.getContext('2d');
        this.assetLoader = new AssetLoader();
        this.renderer = new Renderer(this.canvas, this.assetLoader);
        this.inputManager = new InputManager(this.canvas);
        this.enemyManager = new EnemyManager();
        this.towerManager = new TowerManager();
        this.projectileManager = new ProjectileManager();
        this.gridManager = new GridManager();
        this.debugMenu = new DebugMenu(this);

        // Initialize hero at center of canvas
        this.hero = new Hero({
            x: this.canvas.width / 2 - 24,
            y: this.canvas.height / 2 - 24,
            width: 48,
            height: 48,
            health: HeroConfig.health,
            speed: HeroConfig.speed,
            range: HeroConfig.range,
            damage: HeroConfig.damage,
            attackSpeed: HeroConfig.attackSpeed
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
        if (!this.currentLevel) this.currentLevel = 1;
        this.currentWave = 1;
        this.canStartWave = true;
        this.selectedTowerType = null;
        this.waveInProgress = false;
        this.isEditingPath = false;
        this.pathEditType = 'append'; // 'home', 'end', 'append'
    }

    async initialize() {
        try {
            Debug.log('Game initialization started');

            // Load all game assets
            Debug.log('Loading assets...');
            await this.assetLoader.load(AssetConfig);
            Debug.log('Assets loaded successfully');

            // Initialize game state
            Debug.log('Initializing game state...');
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
            Debug.log(UILabels.DEBUG.GAME_START);
            this.start();

            Debug.log('Game initialization completed');
        } catch (error) {
            Debug.error('Failed to initialize game:', error);
            // Show error in loading overlay instead of hiding it
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                const content = loadingOverlay.querySelector('.loading-content');
                if (content) {
                    content.innerHTML = UILabels.ERRORS.GAME_START_FAIL;
                } else {
                    loadingOverlay.textContent = UILabels.ERRORS.GAME_START_FAIL;
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

        // Initialize tower buttons dynamically
        this.uiManager.createTowerButtons(TowerConfig, (type) => this.selectTower(type));
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
     * Place a tower at the specified coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    placeTowerAt(x, y) {
        if (!this.selectedTowerType) {
            Debug.log('Cannot place tower: No tower selected');
            return;
        }

        const towerConfig = TowerConfig[this.selectedTowerType];
        if (!towerConfig) {
            Debug.log('Cannot place tower: Invalid tower type');
            return;
        }

        // Check if player can afford the tower
        if (this.gold < towerConfig.cost) {
            Debug.log('Cannot place tower: Not enough gold');
            return;
        }

        // Check if placement is valid (not on path)
        const levelConfig = LevelConfig[this.currentLevel];
        const path = levelConfig.path;
        const pathWidth = 64; // Standard path width

        // Check distance to each path segment
        for (let i = 0; i < path.length - 1; i++) {
            const p1 = path[i];
            const p2 = path[i + 1];
            const dist = this.getPointToSegmentDistance(x, y, p1.x, p1.y, p2.x, p2.y);
            if (dist < pathWidth / 2 + 10) { // Added some margin
                Debug.log('Cannot place tower: Invalid location (on path)');
                return;
            }
        }

        // Create tower at specified position with all config properties
        const towerData = {
            type: this.selectedTowerType, // Critical: Missing type caused crash
            x: x - 20, // Center the tower on the mouse position
            y: y - 20,
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
            splashDamage: towerConfig.splashDamage,
            projectileType: towerConfig.projectileType
        };

        // Create the tower
        const tower = this.towerManager.addEntity(towerData);

        // Verify tower was created
        if (!tower) {
            Debug.error('Failed to create tower!');
            return;
        }

        // Deduct gold
        this.gold -= towerConfig.cost;
        this.uiManager.updateGold(this.gold);

        // Reset selection
        this.selectedTowerType = null;
        this.uiManager.setSelectedTower(null);
        console.log('Tower placed successfully!');
    }

    /**
     * Calculate distance from point (px, py) to line segment (x1, y1) - (x2, y2)
     */
    getPointToSegmentDistance(px, py, x1, y1, x2, y2) {
        const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
        if (l2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.sqrt((px - (x1 + t * (x2 - x1))) ** 2 + (py - (y1 + t * (y2 - y1))) ** 2);
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
        const levelConfig = LevelConfig[this.currentLevel];
        const path = levelConfig.path;

        waveConfig.enemies.forEach(enemyGroup => {
            const enemyConfig = EnemyConfig[enemyGroup.type];
            if (enemyConfig) {
                for (let i = 0; i < enemyGroup.count; i++) {
                    // Calculate staggered spawn positions
                    const spawnOffset = i * 100; // Space enemies apart
                    this.enemyManager.addEnemy({
                        x: path[0].x - spawnOffset, // Start off-screen from first path point
                        y: path[0].y,
                        width: enemyConfig.width,
                        height: enemyConfig.height,
                        health: enemyConfig.health,
                        speed: enemyConfig.speed,
                        type: enemyGroup.type,
                        value: enemyConfig.value,
                        path: path
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
     * Get the current game state for serialization
     * @returns {Object} The complete game state
     */
    getState() {
        return {
            time: this.lastTime,
            gold: this.gold,
            lives: this.lives,
            currentWave: this.currentWave,
            canStartWave: this.canStartWave,
            waveInProgress: this.waveInProgress,
            paused: this.paused,
            speedMultiplier: this.speedMultiplier,
            hero: this.hero?.getState(),
            enemies: this.enemyManager.getAll().map(enemy => enemy.getState()),
            towers: this.towerManager.getAll().map(tower => tower.getState()),
            projectiles: this.projectileManager.getState(),
            selectedTowerType: this.selectedTowerType
        };
    }

    /**
     * Sync game state from serialized data
     * @param {Object} state - The serialized game state
     */
    syncState(state) {
        // Core game state
        this.gold = state.gold;
        this.lives = state.lives;
        this.currentWave = state.currentWave;
        this.canStartWave = state.canStartWave;
        this.waveInProgress = state.waveInProgress;
        this.paused = state.paused;
        this.speedMultiplier = state.speedMultiplier;
        this.selectedTowerType = state.selectedTowerType;

        // Sync hero if exists
        if (state.hero) {
            if (!this.hero) {
                this.hero = new Hero(state.hero);
                this.entities.set(this.hero.id, this.hero);
            } else {
                this.hero.syncState(state.hero);
            }
        }

        // Sync managers
        this.enemyManager.syncState(state.enemies);
        this.towerManager.syncState(state.towers);
        this.projectileManager.syncState(state.projectiles);

        // Update UI
        this.uiManager.updateGold(this.gold);
        this.uiManager.updateLives(this.lives);
        this.uiManager.updateWaveNumber(this.currentWave);
        this.uiManager.toggleStartWaveButton(this.canStartWave);
        if (this.selectedTowerType) {
            this.uiManager.setSelectedTower(this.selectedTowerType);
        }
    }

    /**
     * Load a complete game state (for testing/debugging)
     * @param {Object} state - The complete game state to load
     */
    loadState(state) {
        // Clear existing state
        this.entities.clear();
        this.enemyManager.clear();
        this.towerManager.clear();
        this.projectileManager.clear();
        this.hero = null;

        // Load new state
        this.syncState(state);
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        if (this.paused) return;

        // Apply speed multiplier to delta time
        const adjustedDeltaTime = deltaTime * this.speedMultiplier;

        // Handle debug hotkeys
        if (this.debug) {
            if (this.inputManager.isKeyJustPressed('s') && this.inputManager.isKeyDown('alt')) {
                const state = this.getState();
                Debug.log('Current Game State:', state);
            }
        }

        // Update hovered cell based on mouse position
        let mousePos = this.inputManager.getMousePosition();
        this.gridManager.updateHoveredCell(mousePos.x, mousePos.y);

        // Create game state once
        const gameState = {
            deltaTime: adjustedDeltaTime,
            input: this.inputManager,
            enemies: this.enemyManager.getAll(),
            towers: this.towerManager.getAll(),
            hero: this.hero,
            gold: this.gold,
            lives: this.lives,
            currentWave: this.currentWave,
            canStartWave: this.canStartWave,
            projectileManager: this.projectileManager,
            selectedTower: this.selectedTower
        };

        // Update all entities
        this.entities.forEach(entity => {
            entity.update(adjustedDeltaTime, gameState);
        });

        // Update managers
        this.enemyManager.update(adjustedDeltaTime, gameState);
        this.towerManager.updateAll(adjustedDeltaTime, gameState);
        this.projectileManager.updateAll(adjustedDeltaTime, gameState);


        // Update UI elements
        this.uiManager.updateGold(this.gold);
        this.uiManager.updateLives(this.lives);
        this.uiManager.updateWaveNumber(this.currentWave);
        this.uiManager.toggleStartWaveButton(this.canStartWave);

        // Handle tower selection and placement
        mousePos = this.inputManager.getMousePosition();

        if (this.inputManager.isMouseClicked()) {
            if (this.isEditingPath) {
                // Path editing mode
                const levelConfig = LevelConfig[this.currentLevel];
                if (levelConfig) {
                    if (!levelConfig.path) levelConfig.path = [];

                    const point = { x: Math.round(mousePos.x), y: Math.round(mousePos.y) };

                    if (this.pathEditType === 'home') {
                        if (levelConfig.path.length > 0) {
                            levelConfig.path[0] = point;
                        } else {
                            levelConfig.path.push(point);
                        }
                    } else if (this.pathEditType === 'end') {
                        if (levelConfig.path.length > 1) {
                            levelConfig.path[levelConfig.path.length - 1] = point;
                        } else {
                            levelConfig.path.push(point);
                        }
                    } else if (this.pathEditType === 'append') {
                        levelConfig.path.push(point);
                    }
                    console.log(`Path ${this.pathEditType} point set:`, point);
                }
            } else if (this.selectedTowerType) {
                // Placement mode
                console.log('Attempting tower placement:', {
                    selectedType: this.selectedTowerType,
                    mousePos: mousePos,
                    gold: this.gold
                });
                this.placeTowerAt(mousePos.x, mousePos.y);
            } else {
                // Selection mode
                const clickedTower = this.towerManager.getAll().find(tower => {
                    return mousePos.x >= tower.x && mousePos.x <= tower.x + tower.width &&
                        mousePos.y >= tower.y && mousePos.y <= tower.y + tower.height;
                });

                if (clickedTower) {
                    this.selectedTower = clickedTower;
                    this.uiManager.showTowerInfo(clickedTower, this.getTowerCallbacks(clickedTower));
                } else {
                    // Clicking empty space might deselect
                    // Only deselect if not clicking some UI
                    // this.selectedTower = null;
                    // this.uiManager.hideTowerInfo();
                }
            }
        }

        // Handle setting target direction for selected tower
        // We use Alt + Click or maybe a specific key to rotate
        if (this.selectedTower && this.inputManager.isKeyDown('alt') && this.inputManager.isMousePressed) {
            const dx = mousePos.x - (this.selectedTower.x + this.selectedTower.width / 2);
            const dy = mousePos.y - (this.selectedTower.y + this.selectedTower.height / 2);
            this.selectedTower.setTargetAngle(Math.atan2(dy, dx));
        }

        // Update hero movement if exists
        if (this.hero) {
            this.handleHeroMovement(adjustedDeltaTime);
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
                this.enemyManager.removeEnemy(enemy.id);
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
                Debug.log('Game Over!');
            }
        }

        // Check if wave is complete
        if (this.waveInProgress && this.enemyManager.getAll().length === 0) {
            this.waveInProgress = false;
            this.canStartWave = true;
            this.uiManager.toggleStartWaveButton(true);

            // Reward for completing the wave (currentWave was already incremented in startWave)
            const completedWaveIndex = this.currentWave - 2;
            const waveConfig = WaveConfig[completedWaveIndex];
            if (waveConfig) {
                this.gold += waveConfig.reward;
                this.uiManager.updateGold(this.gold);
            }

            // Check for level progression
            if (this.currentWave > WaveConfig.length) {
                this.currentLevel++;
                this.currentWave = 1; // Reset to first wave of new level
                Debug.log(`Advancing to level ${this.currentLevel}`);

                if (!LevelConfig[this.currentLevel]) {
                    this.currentLevel = 1; // Cycle back to level 1
                    Debug.log('All levels completed! Cycling back...');
                }
            }
        }
        // Update input manager at the end of frame to maintain state for next frame
        this.inputManager.update();
    }

    getTowerCallbacks(tower) {
        return {
            onClose: () => {
                this.selectedTower = null;
            },
            canUpgrade: (cost) => {
                return this.gold >= cost;
            },
            onUpgrade: (t) => {
                const cost = Math.floor(t.cost * 1.5 * t.level);
                if (this.gold >= cost) {
                    this.gold -= cost;
                    t.upgrade();
                    this.uiManager.updateGold(this.gold);
                    // Refresh UI with updated stats and costs
                    this.uiManager.showTowerInfo(t, this.getTowerCallbacks(t));
                }
            },
            onSell: (t) => {
                const refund = Math.floor(t.cost * 0.7 * t.level);
                this.gold += refund;
                this.towerManager.removeEntity(t.id);
                this.uiManager.updateGold(this.gold);
                this.uiManager.hideTowerInfo();
                this.selectedTower = null;
            }
        };
    }

    /**
     * Handle hero movement with delta time
     * @param {number} deltaTime - Time since last update in seconds
     */
    handleHeroMovement(deltaTime) {
        // Get input state
        const left = this.inputManager.isKeyDown('ArrowLeft') || this.inputManager.isKeyDown('a');
        const right = this.inputManager.isKeyDown('ArrowRight') || this.inputManager.isKeyDown('d');
        const up = this.inputManager.isKeyDown('ArrowUp') || this.inputManager.isKeyDown('w');
        const down = this.inputManager.isKeyDown('ArrowDown') || this.inputManager.isKeyDown('s');

        // Only process movement if hero is not currently moving
        if (!this.hero.moving) {
            // Get current grid position
            const currentGridX = Math.floor(this.hero.x / GridConfig.CELL_SIZE);
            const currentGridY = Math.floor(this.hero.y / GridConfig.CELL_SIZE);

            // Calculate target grid position
            let targetGridX = currentGridX;
            let targetGridY = currentGridY;

            if (left) targetGridX--;
            if (right) targetGridX++;
            if (up) targetGridY--;
            if (down) targetGridY++;

            // Only move if position changed
            if (targetGridX !== currentGridX || targetGridY !== currentGridY) {
                this.hero.moveToCell(targetGridX, targetGridY);
            }
        }
    }

    /**
     * Render game state
     */
    render() {
        // Clear the canvas
        this.renderer.clear();

        // Draw background
        this.renderer.drawBackground(LevelConfig[this.currentLevel]);

        // Draw grid
        this.gridManager.draw(this.ctx);

        // Draw all game entities
        this.renderer.drawAll(this.enemyManager.getAll());
        this.renderer.drawAll(this.towerManager.getAll());

        // Draw projectiles
        this.renderer.drawAll(this.projectileManager.getAll());

        // Draw hero if exists
        if (this.hero) {
            this.renderer.drawEntity(this.hero);
        }

        // Draw colliders if debug mode is enabled
        if (this.debug) {
            const debugState = this.debugMenu.getDebugState();
            if (debugState.showColliders) {
                const allEntities = [
                    ...this.enemyManager.getAll(),
                    ...this.towerManager.getAll(),
                    this.hero
                ].filter(Boolean);
                this.renderer.drawColliders(allEntities);
            }
        }

        // Draw path markers during editing
        if (this.isEditingPath) {
            const levelConfig = LevelConfig[this.currentLevel];
            if (levelConfig && levelConfig.path) {
                this.renderer.drawPathMarkers(levelConfig.path, true);
            }
        }

        // Draw debug overlay if debug mode is enabled
        if (this.debug) {
            this.renderer.drawDebugOverlay(this);
        }
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.isLoading) {
            Debug.warn('Cannot start game while assets are still loading');
            return;
        }

        if (this.isRunning) {
            Debug.warn('Game is already running');
            return;
        }

        Debug.log(UILabels.DEBUG.GAME_START);
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

    /**
     * Log debug message if debug mode is enabled
     * @param {string} message - Message to log
     * @param {...any} args - Additional arguments to log
     */
    logDebug(message, ...args) {
        if (this.debug) {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    }

    /**
     * Clean up and destroy the game instance
     */
    destroy() {
        Debug.log('Destroying game instance...');

        // Stop the game loop
        this.isRunning = false;
        this.isLoading = false;
        this.paused = true;

        // Destroy all managers
        this.enemyManager.destroy();
        this.towerManager.destroy();
        this.projectileManager.destroy();
        this.inputManager.destroy();
        // this.uiManager.destroy(); // Don't destroy UI manager as it's passed from outside and needed for restart

        // Clear all entities
        this.entities.clear();
        this.entities = null;

        // Clear hero reference
        this.hero = null;

        // Clear game state
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gold = 0;
        this.lives = 0;
        this.currentWave = 1;
        this.canStartWave = false;
        this.selectedTowerType = null;
        this.waveInProgress = false;
        this.enemyPositions = null;

        // Clear canvas
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Clear references
        // this.canvas = null; // Don't clear canvas as it's needed for restart
        // this.ctx = null;
        this.assetLoader = null;
        this.renderer = null;
        this.enemyManager = null;
        this.towerManager = null;
        this.projectileManager = null;
        this.inputManager = null;
        // this.uiManager = null;
        this.debugMenu = null;

        Debug.log('Game instance destroyed');
    }

    /**
     * Set game resolution
     * @param {number} width 
     * @param {number} height 
     */
    setResolution(width, height) {
        console.log(`Setting resolution to ${width}x${height}`);
        this.canvas.width = width;
        this.canvas.height = height;

        // Update renderer if it has internal references to canvas size
        if (this.renderer) {
            // The renderer uses this.canvas.width/height directly in most places, 
            // but we might need to reset some cached values if they exist.
        }

        // Re-center hero if needed (optional)
        if (this.hero) {
            // this.hero.x = width / 2 - 24;
            // this.hero.y = height / 2 - 24;
        }

        // Re-initialize path/grid if they depend on canvas size
        // Currently GridConfig.GRID_WIDTH/HEIGHT are constants, 
        // which might lead to the grid not covering the whole canvas or overflowing.
        // For now we just resize the canvas as requested.
    }

    /**
     * Restart the game
     */
    restart() {
        Debug.log('Restarting game...');

        // Destroy current game state
        this.destroy();

        // Reinitialize game
        this.setup();
        this.initialize().catch(error => {
            Debug.error('Failed to restart game:', error);
            this.uiManager.showError(UILabels.ERRORS.GAME_RESTART_FAIL);
        });
    }
} 