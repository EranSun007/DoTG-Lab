import { EnemyManager } from '../managers/EnemyManager.js';
import { TowerManager } from '../managers/TowerManager.js';
import { ProjectileManager } from '../managers/ProjectileManager.js';
import { GridManager } from '../managers/GridManager.js';
import { Hero } from '../entities/players/Hero.js';
import { TowerConfig } from '../config/TowerConfig.js';
import { EnemyConfig } from '../config/EnemyConfig.js';
import { WaveConfig } from '../config/WaveConfig.js';
import { GameConstants } from '../config/GameConstants.js';
import { InputManager } from '../managers/InputManager.js';
import { Renderer } from '../rendering/Renderer.js';
import { AssetLoader } from '../utils/AssetLoader.js';
import { AssetConfig } from '../config/AssetConfig.js';
import { UIManager } from '../ui/UIManager.js';
import { DebugMenu } from '../debug/DebugMenu.js';
import { Debug } from '../utils/Debug.js';
import { UILabels } from '../config/UILabels.js';
import { GRID_CONFIG } from '../config/GridConfig.js';
import { LevelConfig } from '../config/LevelConfig.js';
import { PathEditorV2 } from '../ui/PathEditorV2.js';

/**
 * @class Game
 * @description Main game controller class that manages the game loop, entities, and systems
 */
export class Game {
    constructor(canvas, uiManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.assetLoader = new AssetLoader();
        this.renderer = new Renderer(this.canvas, this.assetLoader);
        this.inputManager = new InputManager(canvas, this.renderer);
        this.enemyManager = new EnemyManager();
        this.towerManager = new TowerManager();
        this.projectileManager = new ProjectileManager();
        this.gridManager = new GridManager();
        this.uiManager = uiManager;
        this.debugMenu = new DebugMenu(this);
        this.pathEditor = new PathEditorV2();

        // Load level configuration
        this.currentLevel = LevelConfig.level1;
        this.obstacles = this.currentLevel.obstacles;

        // Initialize GridManager with static obstacles
        this.gridManager.updateGridWithObstacles(this.obstacles);

        // Test obstacles <-- Remove this duplicate definition if it exists below
        // this.obstacles = [ ... ];
        
        // Initialize hero at center of canvas
        this.hero = new Hero({
            x: GRID_CONFIG.CELL_SIZE * 2, // Start a bit away from the edge
            y: GRID_CONFIG.CELL_SIZE * Math.floor(GRID_CONFIG.GRID_HEIGHT / 2), // Center vertically
            width: GRID_CONFIG.CELL_SIZE,
            height: GRID_CONFIG.CELL_SIZE,
            health: 200,
            speed: 2,
            range: 120,
            damage: 15,
            attackSpeed: 2,
            gridManager: this.gridManager // Pass gridManager to hero
        });
        this.entities = new Map();
        this.entities.set(this.hero.id, this.hero);
        
        this.renderer.setCameraTarget(this.hero);
        
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

        // Create tower buttons dynamically from TowerConfig
        this.uiManager.createTowerButtons(TowerConfig, (type) => this.selectTower(type), this.assetLoader);

        // Bind tower selection handlers (for legacy compatibility)
        this.uiManager.bindTowerButtons({
            ranged: () => this.selectTower('ranged'),
            aoe: () => this.selectTower('aoe')
        });

        // Bind start wave handler
        this.uiManager.bindStartWave(this.startWave.bind(this));

        // Bind path editor UI handlers
        this.initPathEditorUI();
    }

    /**
     * Initialize path editor UI button handlers
     */
    initPathEditorUI() {
        const deleteBtn = document.getElementById('path-delete-selected');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.pathEditor.deleteSelected();
                Debug.log('Deleted selected waypoint');
            });
        }

        const clearBtn = document.getElementById('path-clear-all');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all waypoints?')) {
                    this.pathEditor.clearAll();
                    Debug.log('Cleared all waypoints');
                }
            });
        }

        const exportBtn = document.getElementById('path-export-json');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const pathData = this.pathEditor.exportPath();
                if (pathData) {
                    const jsonString = JSON.stringify(pathData, null, 2);
                    console.log('Exported Path JSON:\n', jsonString);

                    // Copy to clipboard
                    navigator.clipboard.writeText(jsonString).then(() => {
                        alert('Path JSON copied to clipboard!');
                    }).catch(err => {
                        console.error('Failed to copy to clipboard:', err);
                        alert('Path JSON logged to console');
                    });
                }
            });
        }

        const importBtn = document.getElementById('path-import-json');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                const jsonString = prompt('Paste path JSON:');
                if (jsonString) {
                    try {
                        const pathData = JSON.parse(jsonString);
                        this.pathEditor.enable(pathData);
                        Debug.log('Path imported successfully');
                    } catch (err) {
                        Debug.error('Failed to parse path JSON:', err);
                        alert('Invalid JSON format');
                    }
                }
            });
        }

        Debug.log('Path editor UI initialized');
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

        // Check if placement is valid (not on path - using world coordinates)
        const pathTopY = GameConstants.PATH_WORLD_Y;
        const pathBottomY = pathTopY + GameConstants.PATH_WIDTH;
        const towerCenterY = y; // 'y' is already world coordinate from inputManager

        // --- DEBUG LOGGING START ---
        Debug.log('Path Check - Tower Y:', towerCenterY, 'Path Top:', pathTopY, 'Path Bottom:', pathBottomY);
        const isOnPath = towerCenterY >= pathTopY && towerCenterY <= pathBottomY;
        Debug.log('Is click on path?', isOnPath);
        // --- DEBUG LOGGING END ---

        // Approximate check: is the click Y within the path's Y bounds?
        if (isOnPath) {
            Debug.log('Cannot place tower: Invalid location (on path)');
            return;
        }

        // Create tower at specified position with all config properties
        const towerData = {
            type: this.selectedTowerType, // Tower type (e.g., "Big" or "Small")
            x: x - 40, // Center the tower on the mouse position (doubled size)
            y: y - 40,
            width: 80,  // Doubled from 40
            height: 80, // Doubled from 40
            health: 100,
            range: towerConfig.range,
            damage: towerConfig.damage,
            attackSpeed: towerConfig.attackSpeed,
            projectileSpeed: towerConfig.projectileSpeed,
            projectileSize: towerConfig.projectileSize,
            color: towerConfig.color,
            projectileType: towerConfig.projectileType,
            // Optional AOE properties (only for towers like "Small" that have splash damage)
            ...(towerConfig.splashRadius !== undefined && { splashRadius: towerConfig.splashRadius }),
            ...(towerConfig.splashDamage !== undefined && { splashDamage: towerConfig.splashDamage })
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
                // Get path from level config
                const pathName = enemyGroup.pathName || 'main';
                const pathData = this.currentLevel.paths[pathName];

                if (!pathData) {
                    Debug.error(`Path "${pathName}" not found in level config`);
                    return;
                }

                for (let i = 0; i < enemyGroup.count; i++) {
                    // Calculate staggered spawn positions
                    const spawnOffset = i * 100; // Space enemies apart
                    this.enemyManager.addEnemy({
                        x: pathData.waypoints[0].x - spawnOffset, // Start at first waypoint, offset for spacing
                        y: pathData.waypoints[0].y,
                        width: enemyConfig.width,
                        height: enemyConfig.height,
                        health: enemyConfig.health,
                        speed: enemyConfig.speed,
                        type: enemyGroup.type,
                        value: enemyConfig.value,
                        waypoints: pathData.waypoints // Pass waypoints directly to enemy
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
     * Update the game state
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (this.paused) return;

        // Update input manager FIRST - snapshots state before game logic reads it
        this.inputManager.update();

        // Apply speed multiplier to delta time
        const adjustedDeltaTime = deltaTime * this.speedMultiplier;

        // Handle debug hotkeys
        if (this.debug) {
            if (this.inputManager.isKeyJustPressed('s') && this.inputManager.isKeyDown('alt')) {
                const state = this.getState();
                Debug.log('Current Game State:', state);
            }
            // Log mouse state with 'M' key
            if (this.inputManager.isKeyJustPressed('m')) {
                this.inputManager.logState();
            }
        }

        // Handle path editor toggle with 'P' key
        if (this.inputManager.isKeyJustPressed('p')) {
            const toolbar = document.getElementById('path-editor-v2');
            if (this.pathEditor.enabled) {
                this.pathEditor.disable();
                if (toolbar) toolbar.style.display = 'none';
            } else {
                // Load current level's main path for editing
                const pathData = this.currentLevel.paths.main;
                this.pathEditor.enable(pathData);
                if (toolbar) toolbar.style.display = 'block';
            }
            Debug.log(`Path editor ${this.pathEditor.enabled ? 'opened' : 'closed'}`);
        }

        // Ensure obstacles are always properly marked in the grid
        this.gridManager.updateGridWithObstacles(this.obstacles);

        // Update hovered cell based on mouse position
        const mousePos = this.inputManager.getMousePosition();
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
            projectileManager: this.projectileManager
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

        // Handle path editor interactions (higher priority than tower placement)
        if (this.pathEditor.enabled) {
            const mousePos = this.inputManager.getMousePosition();

            // Handle hover
            this.pathEditor.handleHover(mousePos.x, mousePos.y);

            // Handle click
            if (this.inputManager.mouseJustReleased) {
                this.pathEditor.handleClick(mousePos.x, mousePos.y);
                this.pathEditor.handleRelease();
            }

            // Handle drag
            if (this.inputManager.mousePressed && this.pathEditor.selectedWaypoint !== null) {
                this.pathEditor.handleDrag(mousePos.x, mousePos.y);
            }
        }
        // Handle tower placement when mouse button is released (only if path editor is not active)
        else if (this.selectedTowerType && this.inputManager.mouseJustReleased) {
            const mousePos = this.inputManager.getMousePosition();
            this.placeTowerAt(mousePos.x, mousePos.y);
        }

        // Update hero if exists
        if (this.hero) {
            this.hero.update(adjustedDeltaTime, gameState);
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
            
            const waveConfig = this.getCurrentWaveConfig();
            if (waveConfig) {
                this.gold += waveConfig.reward;
                this.uiManager.updateGold(this.gold);
            }
        }
    }

    /**
     * Check for collision between two rectangular objects
     * @param {object} rect1 - { x, y, width, height }
     * @param {object} rect2 - { x, y, width, height }
     * @returns {boolean} True if colliding, false otherwise
     */
    isColliding(rect1, rect2) {
        if (!rect1 || !rect2) return false;
        return (
            rect1.x <= rect2.x + rect2.width &&
            rect1.x + rect1.width >= rect2.x &&
            rect1.y <= rect2.y + rect2.height &&
            rect1.y + rect1.height >= rect2.y
        );
    }

    /**
     * Handle hero movement based on input, checking for grid collisions.
     * @param {number} deltaTime - Time since last frame (used by Hero.update for interpolation)
     */
    handleHeroMovement(deltaTime) {
        if (!this.hero || this.hero.moving) {
            return; // Don't process new movement if already moving to a target cell
        }

        let targetGridX = Math.floor(this.hero.x / GRID_CONFIG.CELL_SIZE);
        let targetGridY = Math.floor(this.hero.y / GRID_CONFIG.CELL_SIZE);
        let tryingToMove = false;
        let direction = '';

        // Calculate target grid cell based on input
        if (this.inputManager.isKeyDown('ArrowUp') || this.inputManager.isKeyDown('KeyW')) {
            targetGridY -= 1;
            tryingToMove = true;
            direction += 'UP ';
        }
        if (this.inputManager.isKeyDown('ArrowDown') || this.inputManager.isKeyDown('KeyS')) {
            targetGridY += 1;
            tryingToMove = true;
            direction += 'DOWN ';
        }
        if (this.inputManager.isKeyDown('ArrowLeft') || this.inputManager.isKeyDown('KeyA')) {
            targetGridX -= 1;
            tryingToMove = true;
            direction += 'LEFT ';
        }
        if (this.inputManager.isKeyDown('ArrowRight') || this.inputManager.isKeyDown('KeyD')) {
            targetGridX += 1;
            tryingToMove = true;
            direction += 'RIGHT ';
        }

        if (!tryingToMove) {
            return; // No movement input
        }

        // Skip collision checks and pass responsibility to Hero.moveToCell
        // This avoids redundant checks and consolidates logic in one place
        this.hero.moveToCell(targetGridX, targetGridY);
    }

    /**
     * Render the game state
     */
    render() {
        // Construct a state object specifically for rendering
        const renderState = {
            debug: this.debug, // Pass debug flag
            debugMenu: this.debugMenu, // Pass debug menu for overlay
            input: this.inputManager, // Pass input for overlay
            hero: this.hero, // Pass the actual hero object
            enemies: this.enemyManager.getAll(), // Pass the array of actual enemy objects
            towers: this.towerManager.getAll(), // Pass the array of actual tower objects
            projectiles: Array.from(this.projectileManager.projectiles.values()), // Correctly get projectiles from the Map
            obstacles: this.obstacles, // Pass obstacles array
            // Include other relevant state needed ONLY for rendering (e.g., debug overlay info)
            gold: this.gold,
            lives: this.lives,
            currentWave: this.currentWave,
            deltaTime: this.deltaTime, // Pass deltaTime for FPS calculation in overlay
            selectedTowerType: this.selectedTowerType, // Pass selected tower type for placement preview
            towerConfig: TowerConfig, // Pass tower config for preview rendering
            pathEditor: this.pathEditor // Pass path editor for visual overlay
        };

        // Pass the rendering-specific state and deltaTime to the renderer
        this.renderer.render(renderState, this.deltaTime);
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

        // Destroy all managers (check for null first)
        if (this.enemyManager) this.enemyManager.destroy();
        if (this.towerManager) this.towerManager.destroy();
        if (this.projectileManager) this.projectileManager.destroy();
        if (this.inputManager) this.inputManager.destroy();
        // Don't destroy uiManager as it's shared with the new game instance

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
        this.canvas = null;
        this.ctx = null;
        this.assetLoader = null;
        this.renderer = null;
        this.enemyManager = null;
        this.towerManager = null;
        this.projectileManager = null;
        this.inputManager = null;
        this.uiManager = null;
        this.debugMenu = null;

        Debug.log('Game instance destroyed');
    }

    /**
     * Restart the game
     */
    restart() {
        Debug.log('Restarting game...');

        try {
            // Stop the game loop
            this.isRunning = false;
            this.paused = true;

            // Reset game state
            this.gold = GameConstants.INITIAL_GOLD;
            this.lives = GameConstants.INITIAL_LIVES;
            this.currentWave = 1;
            this.canStartWave = true;
            this.selectedTowerType = null;
            this.waveInProgress = false;

            // Clear all entities
            this.enemyManager.clear();
            this.towerManager.clear();
            this.projectileManager.clear();
            this.entities.clear();

            // Recreate hero
            this.hero = new Hero({
                x: GRID_CONFIG.CELL_SIZE * 2,
                y: GRID_CONFIG.CELL_SIZE * Math.floor(GRID_CONFIG.GRID_HEIGHT / 2),
                width: GRID_CONFIG.CELL_SIZE,
                height: GRID_CONFIG.CELL_SIZE,
                health: 200,
                speed: 2,
                range: 120,
                damage: 15,
                attackSpeed: 2,
                gridManager: this.gridManager
            });
            this.entities.set(this.hero.id, this.hero);
            this.renderer.setCameraTarget(this.hero);

            // Update UI
            this.uiManager.updateGold(this.gold);
            this.uiManager.updateLives(this.lives);
            this.uiManager.updateWaveNumber(this.currentWave);
            this.uiManager.toggleStartWaveButton(this.canStartWave);

            // Restart game loop
            this.start();

            Debug.log('Game restarted successfully');
        } catch (error) {
            Debug.error('Failed to restart game:', error);
            alert('Failed to restart game: ' + error.message);
        }
    }

    /**
     * Set the game canvas resolution
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     */
    setResolution(width, height) {
        Debug.log(`Setting resolution to ${width}x${height}`);

        // Update canvas dimensions
        this.canvas.width = width;
        this.canvas.height = height;

        // Update renderer with new canvas size
        if (this.renderer) {
            // Renderer camera will automatically adjust to new canvas size on next render
            this.renderer.canvas = this.canvas;
        }

        // Re-render to reflect new dimensions immediately
        if (!this.paused && this.isRunning) {
            this.render();
        }

        Debug.log(`Resolution changed successfully to ${width}x${height}`);
    }
} 