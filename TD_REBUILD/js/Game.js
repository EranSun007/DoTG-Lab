import { EnemyManager } from './managers/EnemyManager.js';
import { TowerManager } from './managers/TowerManager.js';
import { Hero } from './entities/Hero.js';
import { TowerConfig } from './config/TowerConfig.js';
import { EnemyConfig } from './config/EnemyConfig.js';
import { WaveConfig } from './config/WaveConfig.js';
import { GameConstants } from './config/GameConstants.js';
import { InputManager } from './managers/InputManager.js';
import { Renderer } from './managers/Renderer.js';

export class Game {
    constructor(canvas, uiManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.uiManager = uiManager;
        
        // Time management
        this.lastTime = 0;
        this.deltaTime = 0;
        this.speedMultiplier = 1;
        this.MAX_DELTA = 0.05;
        
        // Game state
        this.paused = false;
        this.gold = GameConstants.INITIAL_GOLD;
        this.lives = GameConstants.INITIAL_LIVES;
        this.currentWave = 1;
        this.canStartWave = true;
        this.selectedTowerType = null;
        this.waveInProgress = false;
        
        // Initialize managers
        this.enemyManager = new EnemyManager();
        this.towerManager = new TowerManager();
        
        // Hero as singleton
        this.hero = null;
        
        // Input handling
        this.input = new InputManager();
        this.input.init(canvas);  // Initialize input manager with canvas

        // Renderer
        this.renderer = new Renderer(canvas);
    }

    /**
     * Initialize the game
     */
    init() {
        // Create hero
        this.hero = new Hero({
            x: 300,
            y: 300,
            width: 40,
            height: 40,
            health: 200,
            range: 150,
            attackSpeed: 3
        });

        // Create 4 enemies in different positions
        const enemyPositions = [
            { x: 0, y: 150 },    // Top path
            { x: 0, y: 300 },    // Middle path
            { x: 0, y: 450 },    // Bottom path
            { x: 100, y: 300 }   // Already on the field
        ];

        enemyPositions.forEach(pos => {
            this.enemyManager.addEntity({
                x: pos.x,
                y: pos.y,
                width: 30,
                height: 30,
                health: 100,
                speed: 1.5
            });
        });

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
        if (!this.canStartWave || this.waveInProgress) {
            console.log('Cannot start wave: Wave already in progress or not ready');
            return;
        }

        const waveConfig = this.getCurrentWaveConfig();
        if (!waveConfig) {
            console.log('No more waves available!');
            return;
        }

        console.log(`Starting wave ${this.currentWave}: ${waveConfig.description}`);
        this.waveInProgress = true;

        // Spawn enemies based on wave config
        waveConfig.enemies.forEach(enemyGroup => {
            const enemyConfig = EnemyConfig[enemyGroup.type];
            if (!enemyConfig) {
                console.error(`Invalid enemy type: ${enemyGroup.type}`);
                return;
            }

            for (let i = 0; i < enemyGroup.count; i++) {
                setTimeout(() => {
                    this.enemyManager.addEntity({
                        ...enemyConfig,
                        x: 0,
                        y: 150 + Math.random() * 300  // Random path
                    });
                }, i * enemyGroup.delay * 1000);
            }
        });

        // Update wave state
        this.currentWave++;
        this.canStartWave = false;
        this.uiManager.updateWaveNumber(this.currentWave);
        this.uiManager.toggleStartWaveButton(false);
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update input state
        this.input.update();

        // Check for spacebar press to place tower
        if (this.input.isKeyDown(' ')) {
            this.placeTower();
        }

        const gameState = {
            deltaTime,
            input: this.input,
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
                this.enemyManager.removeEntity(enemy.id);
                this.gold += EnemyConfig[enemy.type]?.value || 10;
                this.uiManager.updateGold(this.gold);
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
        const speed = 200 * deltaTime; // Adjusted for delta time
        if (this.input.isKeyDown('ArrowLeft')) this.hero.x -= speed;
        if (this.input.isKeyDown('ArrowRight')) this.hero.x += speed;
        if (this.input.isKeyDown('ArrowUp')) this.hero.y -= speed;
        if (this.input.isKeyDown('ArrowDown')) this.hero.y += speed;
    }

    /**
     * Render game state
     */
    render() {
        // Clean rendering through Renderer
        this.renderer.clear();
        this.renderer.drawAll(this.enemyManager.getAll());
        this.renderer.drawAll(this.towerManager.getAll());
        
        if (this.hero) {
            this.renderer.drawEntity(this.hero);
        }
    }

    /**
     * Start the game loop
     */
    start() {
        // Initialize the game
        this.init();
        
        // Start the game loop
        const gameLoop = (currentTime) => {
            // Calculate delta time
            this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, this.MAX_DELTA);
            this.lastTime = currentTime;

            // Update and render if not paused
            if (!this.paused) {
                this.update(this.deltaTime);
                this.render();
            }

            // Request next frame
            requestAnimationFrame(gameLoop);
        };

        // Start the loop
        requestAnimationFrame(gameLoop);
    }
} 