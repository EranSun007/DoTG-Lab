import { UIComponent } from './UIComponent.js';
import { UILabels } from '../../config/UILabels.js';

/**
 * Handles menu screens and overlays
 * @extends UIComponent
 */
export class MenuUI extends UIComponent {
    /**
     * @param {Object} options - Component configuration
     * @param {HTMLElement} options.container - Container element
     * @param {Object} options.elements - References to UI elements
     */
    constructor({ container, elements }) {
        super({ id: 'menu-ui', container });
        
        this.elements = elements;
        
        // Bind event handlers
        this.onPauseClick = this.onPauseClick.bind(this);
        this.onResumeClick = this.onResumeClick.bind(this);
        this.onRestartClick = this.onRestartClick.bind(this);
    }

    /**
     * Initialize the menu UI
     */
    init() {
        // Initialize pause button
        if (this.elements.pauseButton) {
            this.elements.pauseButton.addEventListener('click', this.onPauseClick);
        }

        // Initialize resume button
        if (this.elements.resumeButton) {
            this.elements.resumeButton.addEventListener('click', this.onResumeClick);
        }

        // Initialize restart button
        if (this.elements.restartButton) {
            this.elements.restartButton.addEventListener('click', this.onRestartClick);
        }

        // Hide pause menu initially
        this.hidePauseMenu();
    }

    /**
     * Show the pause menu
     */
    showPauseMenu() {
        if (this.elements.pauseMenu) {
            this.elements.pauseMenu.style.display = 'flex';
        }
    }

    /**
     * Hide the pause menu
     */
    hidePauseMenu() {
        if (this.elements.pauseMenu) {
            this.elements.pauseMenu.style.display = 'none';
        }
    }

    /**
     * Show the game over screen
     * @param {Object} stats - Final game statistics
     */
    showGameOver(stats) {
        if (this.elements.gameOverScreen) {
            // Update stats display
            if (this.elements.finalScore) {
                this.elements.finalScore.textContent = `${UILabels.SCORE}: ${stats.score}`;
            }
            if (this.elements.wavesCompleted) {
                this.elements.wavesCompleted.textContent = `${UILabels.WAVES_COMPLETED}: ${stats.wavesCompleted}`;
            }
            
            this.elements.gameOverScreen.style.display = 'flex';
        }
    }

    /**
     * Hide the game over screen
     */
    hideGameOver() {
        if (this.elements.gameOverScreen) {
            this.elements.gameOverScreen.style.display = 'none';
        }
    }

    /**
     * Handle pause button click
     * @private
     */
    onPauseClick() {
        this.showPauseMenu();
        this.emit('pause');
    }

    /**
     * Handle resume button click
     * @private
     */
    onResumeClick() {
        this.hidePauseMenu();
        this.emit('resume');
    }

    /**
     * Handle restart button click
     * @private
     */
    onRestartClick() {
        this.hideGameOver();
        this.hidePauseMenu();
        this.emit('restart');
    }

    /**
     * Clean up the menu UI
     */
    destroy() {
        // Remove button event listeners
        if (this.elements.pauseButton) {
            this.elements.pauseButton.removeEventListener('click', this.onPauseClick);
        }
        if (this.elements.resumeButton) {
            this.elements.resumeButton.removeEventListener('click', this.onResumeClick);
        }
        if (this.elements.restartButton) {
            this.elements.restartButton.removeEventListener('click', this.onRestartClick);
        }

        super.destroy();
    }
} 