import { EnemyManager } from './managers/EnemyManager.js';
import { TowerManager } from './managers/TowerManager.js';
import { Hero } from './entities/Hero.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = 0;
        this.keys = new Set(); // Track pressed keys
        
        // Initialize managers
        this.enemyManager = new EnemyManager();
        this.towerManager = new TowerManager();
        
        // Hero as singleton
        this.hero = null;
        
        this.setupInputHandlers();
    }

    setupInputHandlers() {
        window.addEventListener('keydown', (e) => this.keys.add(e.key));
        window.addEventListener('keyup', (e) => this.keys.delete(e.key));
    }

    /**
     * Initialize the game
     */
    init() {
        // Create tower
        this.towerManager.addEntity({
            x: 400,
            y: 300,
            width: 40,
            height: 40,
            health: 100,
            range: 200,
            damage: 10,
            attackSpeed: 2
        });

        // Create enemy
        this.enemyManager.addEntity({
            x: 0,
            y: 300,
            width: 30,
            height: 30,
            health: 100,
            speed: 1.5
        });

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
    }

    /**
     * Update game state
     * @param {number} currentTime - Current timestamp
     */
    update(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        const gameState = {
            enemies: this.enemyManager.getAll(),
            towers: this.towerManager.getAll(),
            hero: this.hero,
            deltaTime
        };

        // Update all entities
        this.enemyManager.updateAll(deltaTime, gameState);
        this.towerManager.updateAll(deltaTime, gameState);
        if (this.hero) {
            this.hero.update(deltaTime, gameState);
        }

        // Handle hero movement
        if (this.hero) {
            const speed = 5;
            if (this.keys.has('ArrowLeft')) this.hero.x -= speed;
            if (this.keys.has('ArrowRight')) this.hero.x += speed;
            if (this.keys.has('ArrowUp')) this.hero.y -= speed;
            if (this.keys.has('ArrowDown')) this.hero.y += speed;
        }

        // Remove dead entities
        this.enemyManager.getAll().forEach(enemy => {
            if (!enemy.isAlive()) {
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
        }
    }

    /**
     * Render game state
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all entities
        this.enemyManager.drawAll(this.ctx);
        this.towerManager.drawAll(this.ctx);
        if (this.hero) {
            this.hero.draw(this.ctx);
        }
    }

    /**
     * Game loop
     * @param {number} currentTime - Current timestamp
     */
    gameLoop(currentTime) {
        this.update(currentTime);
        this.render();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Start the game
     */
    start() {
        this.init();
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
} 