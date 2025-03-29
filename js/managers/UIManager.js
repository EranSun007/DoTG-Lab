import { GameConstants } from '../config/GameConstants.js';
import { UIConfig } from '../config/UIConfig.js';
import { UILabels } from '../config/UILabels.js';
import { Debug } from '../utils/Debug.js';

/**
 * Manages UI elements and event handlers
 */
export class UIManager {
    constructor() {
        // UI Elements
        this.goldDisplay = null;
        this.livesDisplay = null;
        this.waveNumberDisplay = null;
        this.startWaveButton = null;
        this.towerButtons = new Map();

        // Event Handlers
        this.towerButtonHandlers = {};
        this.startWaveHandler = null;

        // Visual Feedback
        this.flashTimeout = null;
        this.isDebugMode = false;

        this.debug = false;
        this.elements = new Map();
        this.eventHandlers = new Map();
        Debug.log('UIManager initialized');
    }

    /**
     * Add a UI element
     * @param {string} id - Element ID
     * @param {HTMLElement} element - UI element
     */
    addElement(id, element) {
        this.elements.set(id, element);
    }

    /**
     * Remove a UI element
     * @param {string} id - Element ID
     */
    removeElement(id) {
        const element = this.elements.get(id);
        if (element) {
            // Remove any event handlers for this element
            const handlers = this.eventHandlers.get(id);
            if (handlers) {
                handlers.forEach(({ type, handler }) => {
                    element.removeEventListener(type, handler);
                });
                this.eventHandlers.delete(id);
            }
            // Remove the element from DOM if it's attached
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.elements.delete(id);
        }
    }

    /**
     * Add an event handler to a UI element
     * @param {string} elementId - Element ID
     * @param {string} eventType - Event type (e.g., 'click')
     * @param {Function} handler - Event handler function
     */
    addEventHandler(elementId, eventType, handler) {
        const element = this.elements.get(elementId);
        if (element) {
            element.addEventListener(eventType, handler);
            
            // Store handler for cleanup
            if (!this.eventHandlers.has(elementId)) {
                this.eventHandlers.set(elementId, []);
            }
            this.eventHandlers.get(elementId).push({ type: eventType, handler });
        }
    }

    /**
     * Remove all event handlers for a UI element
     * @param {string} elementId - Element ID
     */
    removeEventHandlers(elementId) {
        const element = this.elements.get(elementId);
        const handlers = this.eventHandlers.get(elementId);
        
        if (element && handlers) {
            handlers.forEach(({ type, handler }) => {
                element.removeEventListener(type, handler);
            });
            this.eventHandlers.delete(elementId);
        }
    }

    /**
     * Show a UI element
     * @param {string} id - Element ID
     */
    showElement(id) {
        const element = this.elements.get(id);
        if (element) {
            element.style.display = '';
        }
    }

    /**
     * Hide a UI element
     * @param {string} id - Element ID
     */
    hideElement(id) {
        const element = this.elements.get(id);
        if (element) {
            element.style.display = 'none';
        }
    }

    /**
     * Update UI element text content
     * @param {string} id - Element ID
     * @param {string} text - New text content
     */
    updateText(id, text) {
        const element = this.elements.get(id);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Clear all UI elements and event handlers
     */
    clear() {
        // Remove all event handlers
        this.eventHandlers.forEach((handlers, elementId) => {
            this.removeEventHandlers(elementId);
        });

        // Remove all elements
        this.elements.forEach((element, id) => {
            this.removeElement(id);
        });

        Debug.log('UIManager cleared');
    }

    /**
     * Clean up and destroy the manager
     */
    destroy() {
        this.clear();
        this.elements = null;
        this.eventHandlers = null;
        Debug.log('UIManager destroyed');
    }

    // Initialize UI elements
    init(elements) {
        this.goldDisplay = elements.goldDisplay;
        this.livesDisplay = elements.livesDisplay;
        this.waveNumberDisplay = elements.waveNumberDisplay;
        this.startWaveButton = elements.startWaveButton;
        this.towerButtons.set('ranged', elements.towerButtons.ranged);
        this.towerButtons.set('aoe', elements.towerButtons.aoe);

        // Set up event listeners
        this.setupEventListeners();

        // Add debug mode toggle
        this.setupDebugMode();
    }

    // Set up debug mode
    setupDebugMode() {
        // Toggle debug mode with Alt+D
        window.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 'd') {
                this.isDebugMode = !this.isDebugMode;
                Debug.log(`Debug mode ${this.isDebugMode ? 'enabled' : 'disabled'}`);
            }
        });
    }

    // Set up event listeners
    setupEventListeners() {
        // Tower button click handlers
        this.towerButtons.forEach((button, type) => {
            button.addEventListener('click', () => {
                if (this.towerButtonHandlers[type]) {
                    this.towerButtonHandlers[type]();
                }
            });
        });

        // Start wave button click handler
        if (this.startWaveButton) {
            this.startWaveButton.addEventListener('click', () => {
                if (this.startWaveHandler) {
                    this.startWaveHandler();
                }
            });
        }
    }

    // Visual feedback methods
    flashButton(button, className) {
        if (!button) return;
        
        button.classList.add(className);
        setTimeout(() => button.classList.remove(className), UIConfig.ANIMATIONS.BUTTON_FLASH);
    }

    flashDamage(element) {
        if (!element) return;
        
        element.classList.add('damage-flash');
        setTimeout(() => element.classList.remove('damage-flash'), UIConfig.ANIMATIONS.DAMAGE_FLASH);
    }

    // Update UI state methods with visual feedback
    updateGold(amount) {
        if (this.goldDisplay) {
            const oldAmount = parseInt(this.goldDisplay.textContent.split(': ')[1]) || 0;
            this.goldDisplay.textContent = `${UILabels.STATUS.GOLD}${amount}`;
            
            // Visual feedback for gold changes
            if (amount > oldAmount) {
                this.flashButton(this.goldDisplay, 'gold-increase');
            } else if (amount < oldAmount) {
                this.flashButton(this.goldDisplay, 'gold-decrease');
            }
        }
    }

    updateLives(count) {
        if (this.livesDisplay) {
            const oldCount = parseInt(this.livesDisplay.textContent.split(': ')[1]) || 0;
            this.livesDisplay.textContent = `${UILabels.STATUS.LIVES}${count}`;
            
            // Visual feedback for life changes
            if (count < oldCount) {
                this.flashDamage(this.livesDisplay);
            }
        }
    }

    updateWaveNumber(wave) {
        if (this.waveNumberDisplay) {
            this.waveNumberDisplay.textContent = `${UILabels.STATUS.WAVE}${wave}`;
        }
    }

    setSelectedTower(type) {
        // Remove selected class from all buttons
        this.towerButtons.forEach(button => {
            button.classList.remove('selected');
        });

        // Add selected class to specified button
        if (type && this.towerButtons.has(type)) {
            this.towerButtons.get(type).classList.add('selected');
        }
    }

    toggleStartWaveButton(enabled) {
        if (this.startWaveButton) {
            this.startWaveButton.disabled = !enabled;
            this.startWaveButton.classList.toggle('disabled', !enabled);
            this.startWaveButton.textContent = UILabels.BUTTONS.START_WAVE;
        }
    }

    // Bind event handlers
    bindTowerButtons(handlers) {
        this.towerButtonHandlers = handlers;
    }

    bindStartWave(handler) {
        this.startWaveHandler = handler;
    }

    // Debug methods
    logUIState() {
        if (!this.isDebugMode) return;
        
        const state = this.getState();
        Debug.log('UI State Debug', {
            currentState: state,
            buttonStates: {
                startWave: this.startWaveButton?.disabled ? 'disabled' : 'enabled',
                rangedTower: this.towerButtons.get('ranged')?.classList.toString(),
                aoeTower: this.towerButtons.get('aoe')?.classList.toString()
            }
        });
    }

    // Get current UI state with validation
    getState() {
        const state = {
            gold: this.goldDisplay ? parseInt(this.goldDisplay.textContent.split(': ')[1]) : 0,
            lives: this.livesDisplay ? parseInt(this.livesDisplay.textContent.split(': ')[1]) : 0,
            waveNumber: this.waveNumberDisplay ? parseInt(this.waveNumberDisplay.textContent.split(': ')[1]) : 0,
            startWaveEnabled: this.startWaveButton ? !this.startWaveButton.disabled : false,
            selectedTower: Object.entries(this.towerButtons)
                .find(([_, button]) => button?.classList.contains('selected'))?.[0] || null
        };

        if (this.isDebugMode) {
            this.validateState(state);
        }

        return state;
    }

    // Validate UI state
    validateState(state) {
        const issues = [];
        
        if (state.gold < 0) issues.push('Gold cannot be negative');
        if (state.lives < 0) issues.push('Lives cannot be negative');
        if (state.waveNumber < 1) issues.push('Wave number must be at least 1');
        
        if (issues.length > 0) {
            Debug.log('UI State Validation Issues:', issues);
        }
    }

    // Sync UI state from external source with validation
    syncState(state) {
        // Validate incoming state
        if (this.isDebugMode) {
            this.validateState(state);
        }

        // Update UI elements
        this.updateGold(state.gold);
        this.updateLives(state.lives);
        this.updateWaveNumber(state.waveNumber);
        this.toggleStartWaveButton(state.startWaveEnabled);
        
        if (state.selectedTower) {
            this.setSelectedTower(state.selectedTower);
        }

        // Log state after sync in debug mode
        if (this.isDebugMode) {
            this.logUIState();
        }
    }

    showError(message) {
        let errorElement = document.getElementById('errorMessage');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'errorMessage';
            errorElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: ${UIConfig.ERROR_DISPLAY.BACKGROUND};
                color: white;
                padding: 20px;
                border-radius: 5px;
                z-index: ${UIConfig.ERROR_DISPLAY.Z_INDEX};
            `;
            document.body.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';

        setTimeout(() => {
            errorElement.style.display = 'none';
        }, UIConfig.ANIMATIONS.ERROR_DISPLAY);
    }
} 