import { GameConstants } from '../config/GameConstants.js';
import { WaveConfig } from '../config/WaveConfig.js';
import { Debug } from '../utils/Debug.js';

/**
 * Manages the core game state including resources, wave status, and entity states
 */
export class GameState {
    constructor() {
        // Core game state
        this.gold = GameConstants.INITIAL_GOLD;
        this.lives = GameConstants.INITIAL_LIVES;
        this.currentWave = 1;
        this.canStartWave = true;
        this.waveInProgress = false;
        this.selectedTowerType = null;

        // Debug state
        this.debug = false;
        this.speedMultiplier = 1;
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
     * Start a new wave
     * @returns {boolean} True if wave was started successfully
     */
    startWave() {
        if (this.waveInProgress || !this.canStartWave) {
            return false;
        }

        const waveConfig = this.getCurrentWaveConfig();
        if (!waveConfig) {
            return false;
        }

        this.waveInProgress = true;
        this.canStartWave = false;
        return true;
    }

    /**
     * Complete the current wave
     * @param {boolean} success - Whether the wave was completed successfully
     */
    completeWave(success = true) {
        this.waveInProgress = false;
        this.canStartWave = true;

        if (success) {
            const waveConfig = this.getCurrentWaveConfig();
            if (waveConfig) {
                this.gold += waveConfig.reward;
            }
            this.currentWave++;
        }
    }

    /**
     * Modify the player's gold amount
     * @param {number} amount - Amount to add (positive) or subtract (negative)
     * @returns {boolean} True if the operation was successful
     */
    modifyGold(amount) {
        const newGold = this.gold + amount;
        if (newGold < 0) {
            return false;
        }
        this.gold = newGold;
        return true;
    }

    /**
     * Modify the player's lives
     * @param {number} amount - Amount to add (positive) or subtract (negative)
     * @returns {boolean} True if player is still alive
     */
    modifyLives(amount) {
        this.lives += amount;
        return this.lives > 0;
    }

    /**
     * Select a tower type for placement
     * @param {string|null} type - Tower type or null to deselect
     */
    selectTowerType(type) {
        this.selectedTowerType = type;
    }

    /**
     * Get the complete game state for serialization
     * @returns {Object} The complete game state
     */
    getState() {
        return {
            gold: this.gold,
            lives: this.lives,
            currentWave: this.currentWave,
            canStartWave: this.canStartWave,
            waveInProgress: this.waveInProgress,
            selectedTowerType: this.selectedTowerType,
            debug: this.debug,
            speedMultiplier: this.speedMultiplier
        };
    }

    /**
     * Sync game state from serialized data
     * @param {Object} state - The serialized game state
     */
    syncState(state) {
        Object.assign(this, state);
    }

    /**
     * Reset the game state to initial values
     */
    reset() {
        this.gold = GameConstants.INITIAL_GOLD;
        this.lives = GameConstants.INITIAL_LIVES;
        this.currentWave = 1;
        this.canStartWave = true;
        this.waveInProgress = false;
        this.selectedTowerType = null;
        Debug.log('Game state reset to initial values');
    }
} 