import { UIComponent } from './UIComponent.js';
import { UILabels } from '../../config/UILabels.js';

/**
 * Handles the in-game user interface elements
 * @extends UIComponent
 */
export class GameUI extends UIComponent {
    /**
     * @param {Object} options - Component configuration
     * @param {HTMLElement} options.container - Container element
     * @param {Object} options.elements - References to UI elements
     */
    constructor({ container, elements }) {
        super({ id: 'game-ui', container });
        
        // Store references to UI elements
        this.elements = elements;
        
        // Bind event handlers
        this.onTowerSelect = this.onTowerSelect.bind(this);
        this.onStartWave = this.onStartWave.bind(this);
    }

    /**
     * Initialize the game UI
     */
    init() {
        // Initialize tower selection buttons
        if (this.elements.towerButtons) {
            Object.entries(this.elements.towerButtons).forEach(([type, button]) => {
                button.addEventListener('click', () => this.onTowerSelect(type));
            });
        }

        // Initialize start wave button
        if (this.elements.startWaveButton) {
            this.elements.startWaveButton.addEventListener('click', this.onStartWave);
        }

        // Initialize initial values
        this.updateGold(0);
        this.updateLives(0);
        this.updateWaveNumber(1);
    }

    /**
     * Update the displayed gold amount
     * @param {number} amount - Current gold amount
     */
    updateGold(amount) {
        if (this.elements.goldDisplay) {
            this.elements.goldDisplay.textContent = `${UILabels.GOLD}: ${amount}`;
        }
    }

    /**
     * Update the displayed number of lives
     * @param {number} lives - Current number of lives
     */
    updateLives(lives) {
        if (this.elements.livesDisplay) {
            this.elements.livesDisplay.textContent = `${UILabels.LIVES}: ${lives}`;
        }
    }

    /**
     * Update the displayed wave number
     * @param {number} wave - Current wave number
     */
    updateWaveNumber(wave) {
        if (this.elements.waveDisplay) {
            this.elements.waveDisplay.textContent = `${UILabels.WAVE}: ${wave}`;
        }
    }

    /**
     * Enable/disable the start wave button
     * @param {boolean} enabled - Whether the button should be enabled
     */
    toggleStartWaveButton(enabled) {
        if (this.elements.startWaveButton) {
            this.elements.startWaveButton.disabled = !enabled;
            this.elements.startWaveButton.classList.toggle('disabled', !enabled);
        }
    }

    /**
     * Update the selected tower visual state
     * @param {string|null} type - Selected tower type or null
     */
    setSelectedTower(type) {
        if (this.elements.towerButtons) {
            Object.entries(this.elements.towerButtons).forEach(([towerType, button]) => {
                button.classList.toggle('selected', towerType === type);
            });
        }
    }

    /**
     * Handle tower selection
     * @private
     * @param {string} type - Tower type
     */
    onTowerSelect(type) {
        this.emit('towerSelect', { type });
    }

    /**
     * Handle start wave button click
     * @private
     */
    onStartWave() {
        this.emit('startWave');
    }

    /**
     * Show an error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        if (this.elements.errorDisplay) {
            this.elements.errorDisplay.textContent = message;
            this.elements.errorDisplay.style.display = 'block';
            setTimeout(() => {
                this.elements.errorDisplay.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * Clean up the game UI
     */
    destroy() {
        // Remove tower button event listeners
        if (this.elements.towerButtons) {
            Object.values(this.elements.towerButtons).forEach(button => {
                button.removeEventListener('click', this.onTowerSelect);
            });
        }

        // Remove start wave button event listener
        if (this.elements.startWaveButton) {
            this.elements.startWaveButton.removeEventListener('click', this.onStartWave);
        }

        super.destroy();
    }
} 