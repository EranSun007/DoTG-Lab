import { GameConstants } from '../config/GameConstants.js';
import { UIConfig } from '../config/UIConfig.js';
import { UILabels } from '../config/UILabels.js';
import { Debug } from '../utils/Debug.js';

/**
 * @class UIManager
 * @description Manages UI elements, event handlers, and DOM interactions
 * Centralizes all DOM manipulation to keep game logic clean
 */
export class UIManager {
    /**
     * @constructor
     * @description Initialize the UI manager with empty references
     */
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

        // Set up event listeners
        this.setupEventListeners();

        // Add debug mode toggle
        this.setupDebugMode();
    }

    createTowerButtons(towerConfig, onSelectHandler, assetLoader = null) {
        const container = document.getElementById('tower-controls');
        if (!container) return;

        // Save start button if it exists in container
        const startBtn = document.getElementById('start-wave-button');

        container.innerHTML = '';
        if (startBtn) {
            container.appendChild(startBtn);
        }

        this.towerButtonHandlers.select = onSelectHandler;
        this.towerButtons.clear();

        Object.keys(towerConfig).forEach(type => {
            const config = towerConfig[type];
            const btn = document.createElement('button');
            btn.className = 'tower-btn';
            btn.dataset.type = type;
            btn.style.display = 'flex';
            btn.style.flexDirection = 'column';
            btn.style.alignItems = 'center';
            btn.style.padding = '8px 12px';
            btn.style.minWidth = '80px';

            // Add sprite image if assetLoader is available
            const spriteKey = config.sprite;
            if (spriteKey && assetLoader) {
                const spriteImg = assetLoader.get(spriteKey);
                if (spriteImg) {
                    const img = document.createElement('img');
                    img.src = spriteImg.src;
                    img.style.width = '32px';
                    img.style.height = '32px';
                    img.style.display = 'block';
                    img.style.marginBottom = '4px';
                    btn.appendChild(img);
                }
            }

            // Add tower name
            const nameSpan = document.createElement('span');
            nameSpan.textContent = config.name;
            nameSpan.style.display = 'block';
            nameSpan.style.fontSize = '11px';
            nameSpan.style.textAlign = 'center';
            btn.appendChild(nameSpan);

            // Add cost display
            const costSpan = document.createElement('span');
            costSpan.textContent = `${config.cost}💰`;
            costSpan.style.display = 'block';
            costSpan.style.fontSize = '10px';
            costSpan.style.opacity = '0.7';
            costSpan.style.marginTop = '2px';
            btn.appendChild(costSpan);

            btn.onclick = () => {
                onSelectHandler(type);
            };

            container.appendChild(btn);
            this.towerButtons.set(type, btn);
        });
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

    showTowerInfo(tower, callbacks = {}) {
        let infoPanel = document.getElementById('tower-info-panel');
        if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.id = 'tower-info-panel';
            infoPanel.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #444;
                width: 250px;
                z-index: 1000;
                font-family: Arial, sans-serif;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
            `;
            document.body.appendChild(infoPanel);
        }

        const upgradeCost = Math.floor(tower.cost * 1.5 * tower.level);
        const sellValue = Math.floor(tower.cost * 0.7 * tower.level); // Simplistic sell value for now

        infoPanel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #444; padding-bottom:10px; margin-bottom:10px;">
                <h3 style="margin:0; color:${tower.color || '#44ff44'};">${tower.type.toUpperCase()} LVL ${tower.level}</h3>
                <button id="close-panel" style="background:none; border:none; color:#888; cursor:pointer; font-size:16px;">✖</button>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-bottom:15px; font-size:14px;">
                <div>Damage: <span style="color:#ff8888">${Math.round(tower.damage)}</span></div>
                <div>Range: <span style="color:#8888ff">${Math.round(tower.range)}</span></div>
                <div>Speed: <span style="color:#ffff88">${tower.attackSpeed.toFixed(1)}/s</span></div>
                <div>Kills: <span style="color:#ffffff">${tower.kills || 0}</span></div>
            </div>

            <div style="margin-bottom:15px;">
                <strong style="font-size:12px; color:#aaa;">OPERATIONAL MODES</strong>
                <div id="state-buttons" style="display:flex; flex-direction:column; gap:5px; margin-top:5px;"></div>
            </div>

            <div style="display:flex; gap:10px; margin-top:15px;">
                <button id="upgrade-btn" style="flex:1; padding:8px; background:#4444ff; color:white; border:none; border-radius:4px; cursor:pointer;">
                    Upgrade (${upgradeCost}g)
                </button>
                <button id="sell-btn" style="flex:1; padding:8px; background:#ff4444; color:white; border:none; border-radius:4px; cursor:pointer;">
                    Sell (${sellValue}g)
                </button>
            </div>
            
            <p style="font-size:10px; color:#888; margin-top:10px; text-align:center;">Hold ALT + Click to set direction</p>
        `;

        // Close Button
        infoPanel.querySelector('#close-panel').onclick = () => {
            if (callbacks.onClose) callbacks.onClose();
            this.hideTowerInfo();
        };

        // State Buttons
        const stateContainer = infoPanel.querySelector('#state-buttons');
        tower.states.forEach((state, index) => {
            const btn = document.createElement('button');
            btn.textContent = state.name;
            btn.style.cssText = `
                padding: 6px;
                background: ${index === tower.activeStateIndex ? '#4444ff' : '#222'};
                color: ${index === tower.activeStateIndex ? 'white' : '#aaa'};
                border: 1px solid #444;
                border-radius: 4px;
                cursor: pointer;
                text-align: left;
                font-size: 12px;
                transition: all 0.2s;
            `;
            btn.onmouseover = () => btn.style.background = index === tower.activeStateIndex ? '#5555ff' : '#333';
            btn.onmouseout = () => btn.style.background = index === tower.activeStateIndex ? '#4444ff' : '#222';
            btn.onclick = () => {
                tower.setState(index);
                this.showTowerInfo(tower, callbacks); // Refresh panel to show active state
            };
            stateContainer.appendChild(btn);
        });

        // ACTION BUTTONS HANDLERS
        const upgradeBtn = infoPanel.querySelector('#upgrade-btn');
        const sellBtn = infoPanel.querySelector('#sell-btn');

        if (callbacks.canUpgrade && !callbacks.canUpgrade(upgradeCost)) {
            upgradeBtn.disabled = true;
            upgradeBtn.style.opacity = '0.5';
            upgradeBtn.style.cursor = 'not-allowed';
            upgradeBtn.textContent = `Need ${upgradeCost}g`;
        } else {
            upgradeBtn.onclick = () => {
                if (callbacks.onUpgrade) callbacks.onUpgrade(tower);
            };
        }

        sellBtn.onclick = () => {
            if (callbacks.onSell) callbacks.onSell(tower);
        };

        infoPanel.style.display = 'block';
    }

    hideTowerInfo() {
        const infoPanel = document.getElementById('tower-info-panel');
        if (infoPanel) {
            infoPanel.style.display = 'none';
        }
    }
} 