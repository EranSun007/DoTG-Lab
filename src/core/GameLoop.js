/**
 * Handles the core game loop functionality including frame timing and update/render cycle
 */
export class GameLoop {
    /**
     * @param {Object} options - Configuration options
     * @param {number} options.maxDelta - Maximum allowed delta time in seconds
     * @param {Function} options.update - Update callback function
     * @param {Function} options.render - Render callback function
     */
    constructor({ maxDelta = 0.05, update, render }) {
        this.maxDelta = maxDelta;
        this.update = update;
        this.render = render;
        
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.speedMultiplier = 1;
        this.paused = false;
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.isRunning) {
            console.warn('Game loop is already running');
            return;
        }
        
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(() => this.loop());
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Set the game speed multiplier
     * @param {number} multiplier - Speed multiplier (1 = normal speed)
     */
    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
    }

    /**
     * Set the pause state
     * @param {boolean} paused - Whether the game should be paused
     */
    setPaused(paused) {
        this.paused = paused;
    }

    /**
     * The main game loop function
     * @private
     */
    loop() {
        if (!this.isRunning) {
            return;
        }
        
        const currentTime = performance.now();
        this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, this.maxDelta);
        this.lastTime = currentTime;

        if (!this.paused) {
            // Apply speed multiplier to delta time
            const adjustedDeltaTime = this.deltaTime * this.speedMultiplier;
            
            // Run update and render callbacks
            this.update(adjustedDeltaTime);
            this.render();
        }

        requestAnimationFrame(() => this.loop());
    }

    /**
     * Get the current delta time
     * @returns {number} Delta time in seconds
     */
    getDeltaTime() {
        return this.deltaTime;
    }

    /**
     * Get the current game speed multiplier
     * @returns {number} Speed multiplier
     */
    getSpeedMultiplier() {
        return this.speedMultiplier;
    }

    /**
     * Check if the game is paused
     * @returns {boolean} True if paused
     */
    isPaused() {
        return this.paused;
    }
} 