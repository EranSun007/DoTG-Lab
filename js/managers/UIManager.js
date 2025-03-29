export class UIManager {
    constructor() {
        // UI Elements
        this.goldDisplay = null;
        this.livesDisplay = null;
        this.waveNumberDisplay = null;
        this.startWaveButton = null;
        this.towerButtons = {
            ranged: null,
            aoe: null
        };

        // Event Handlers
        this.towerButtonHandlers = {};
        this.startWaveHandler = null;

        // Visual Feedback
        this.flashTimeout = null;
        this.isDebugMode = false;
    }

    // Initialize UI elements
    init(elements) {
        this.goldDisplay = elements.goldDisplay;
        this.livesDisplay = elements.livesDisplay;
        this.waveNumberDisplay = elements.waveNumberDisplay;
        this.startWaveButton = elements.startWaveButton;
        this.towerButtons.ranged = elements.towerButtons.ranged;
        this.towerButtons.aoe = elements.towerButtons.aoe;

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
                console.log(`Debug mode ${this.isDebugMode ? 'enabled' : 'disabled'}`);
            }
        });
    }

    // Set up event listeners for buttons
    setupEventListeners() {
        if (this.startWaveButton) {
            this.startWaveButton.addEventListener('click', () => {
                if (this.startWaveHandler) {
                    this.startWaveHandler();
                    this.flashButton(this.startWaveButton, 'clicked');
                }
            });
        }

        if (this.towerButtons.ranged) {
            this.towerButtons.ranged.addEventListener('click', () => {
                if (this.towerButtonHandlers.ranged) {
                    this.towerButtonHandlers.ranged();
                    this.flashButton(this.towerButtons.ranged, 'selected');
                }
            });
        }

        if (this.towerButtons.aoe) {
            this.towerButtons.aoe.addEventListener('click', () => {
                if (this.towerButtonHandlers.aoe) {
                    this.towerButtonHandlers.aoe();
                    this.flashButton(this.towerButtons.aoe, 'selected');
                }
            });
        }
    }

    // Visual feedback methods
    flashButton(button, className) {
        if (!button) return;
        
        button.classList.add(className);
        setTimeout(() => button.classList.remove(className), 200);
    }

    flashDamage(element) {
        if (!element) return;
        
        element.classList.add('damage-flash');
        setTimeout(() => element.classList.remove('damage-flash'), 500);
    }

    // Update UI state methods with visual feedback
    updateGold(amount) {
        if (this.goldDisplay) {
            const oldAmount = parseInt(this.goldDisplay.textContent.split(': ')[1]) || 0;
            this.goldDisplay.textContent = `Gold: ${amount}`;
            
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
            this.livesDisplay.textContent = `Lives: ${count}`;
            
            // Visual feedback for life changes
            if (count < oldCount) {
                this.flashDamage(this.livesDisplay);
            }
        }
    }

    updateWaveNumber(number) {
        if (this.waveNumberDisplay) {
            const oldNumber = parseInt(this.waveNumberDisplay.textContent.split(': ')[1]) || 0;
            this.waveNumberDisplay.textContent = `Wave: ${number}`;
            
            // Visual feedback for wave changes
            if (number > oldNumber) {
                this.flashButton(this.waveNumberDisplay, 'wave-increase');
            }
        }
    }

    toggleStartWaveButton(enabled) {
        if (this.startWaveButton) {
            this.startWaveButton.disabled = !enabled;
            this.startWaveButton.classList.toggle('disabled', !enabled);
        }
    }

    setSelectedTower(type) {
        // Update visual state of tower buttons
        Object.entries(this.towerButtons).forEach(([towerType, button]) => {
            if (button) {
                button.classList.toggle('selected', towerType === type);
                button.classList.toggle('disabled', false); // Re-enable when selecting
            }
        });
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
        console.group('UI State Debug');
        console.log('Current State:', state);
        console.log('Button States:', {
            startWave: this.startWaveButton?.disabled ? 'disabled' : 'enabled',
            rangedTower: this.towerButtons.ranged?.classList.toString(),
            aoeTower: this.towerButtons.aoe?.classList.toString()
        });
        console.groupEnd();
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

        // Validate state in debug mode
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
            console.warn('UI State Validation Issues:', issues);
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
        // Create error element if it doesn't exist
        let errorElement = document.getElementById('errorMessage');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'errorMessage';
            errorElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 5px;
                z-index: 1000;
            `;
            document.body.appendChild(errorElement);
        }

        // Show error message
        errorElement.textContent = message;

        // Hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
} 