export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Time management
        this.lastTime = 0;
        this.deltaTime = 0;
        this.speedMultiplier = 1;
        this.MAX_DELTA = 0.05; // Cap at 50ms (20 FPS minimum)
        
        // Game state
        this.paused = false;
        this.enemyManager = new EnemyManager();
        this.towerManager = new TowerManager();
        this.hero = null;
        
        // Input handling
        this.input = new InputManager();
        this.setupInputHandlers();
    }

    /**
     * Start the game loop
     */
    start() {
        this.lastTime = performance.now();
        this.paused = false;
        this.init();
        this.input.init(this.canvas);
        this.loop(this.lastTime);
    }

    /**
     * Main game loop
     * @param {number} currentTime - Current timestamp from requestAnimationFrame
     */
    loop(currentTime) {
        // Calculate delta time in seconds
        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Protect against large time steps
        deltaTime = Math.min(deltaTime, this.MAX_DELTA);

        // Apply speed multiplier (for debug/testing)
        deltaTime *= this.speedMultiplier;

        // Update and render if not paused
        if (!this.paused) {
            this.update(deltaTime);
            this.render();
        }

        // Schedule next frame
        requestAnimationFrame(time => this.loop(time));
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        const gameState = {
            deltaTime,
            input: this.input,
            enemies: this.enemyManager.getAll(),
            towers: this.towerManager.getAll(),
            hero: this.hero
        };

        // Update all managers
        this.enemyManager.updateAll(deltaTime, gameState);
        this.towerManager.updateAll(deltaTime, gameState);

        // Update hero if exists
        if (this.hero) {
            this.hero.update(deltaTime, gameState);
            this.handleHeroMovement(deltaTime);
        }

        if (this.debug) {
            console.log('Input State:', this.input.getDebugInfo());
        }
    }

    /**
     * Handle hero movement with delta time
     * @param {number} deltaTime - Time since last update in seconds
     */
    handleHeroMovement(deltaTime) {
        if (this.input.isKeyDown('ArrowLeft')) {
            this.hero.x -= HERO_SPEED * deltaTime;
        }
    }

    /**
     * Render game state
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render all entities
        this.enemyManager.drawAll(this.ctx);
        this.towerManager.drawAll(this.ctx);
        if (this.hero) {
            this.hero.draw(this.ctx);
        }
    }

    // ... rest of the class implementation
} 