import { GameConstants } from '../config/GameConstants.js';
import { UILabels } from '../config/UILabels.js';

export class Debug {
    static isEnabled = GameConstants.DEBUG_MODE;
    static showGrid = GameConstants.SHOW_GRID;
    static showColliders = GameConstants.SHOW_COLLIDERS;
    static logs = [];
    static maxLogs = 100;

    static log(message, ...args) {
        if (!this.isEnabled) return;
        
        const log = {
            timestamp: performance.now(),
            message,
            args
        };
        
        this.logs.push(log);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        console.log(`[DEBUG] ${message}`, ...args);
    }

    static warn(message, ...args) {
        if (!this.isEnabled) return;
        console.warn(`[DEBUG] ${message}`, ...args);
    }

    static error(message, ...args) {
        // Always log errors, even in production
        console.error(`[ERROR] ${message}`, ...args);
    }

    static clear() {
        this.logs = [];
        if (this.isEnabled) {
            console.clear();
        }
    }

    static enable() {
        this.isEnabled = true;
        this.log(UILabels.DEBUG.GAME_START);
    }

    static disable() {
        this.log(UILabels.DEBUG.GAME_STOP);
        this.isEnabled = false;
        this.clear();
    }

    static toggleGrid() {
        this.showGrid = !this.showGrid;
        this.log(`Grid display ${this.showGrid ? 'enabled' : 'disabled'}`);
    }

    static toggleColliders() {
        this.showColliders = !this.showColliders;
        this.log(`Collider display ${this.showColliders ? 'enabled' : 'disabled'}`);
    }

    static getState() {
        return {
            isEnabled: this.isEnabled,
            showGrid: this.showGrid,
            showColliders: this.showColliders,
            logCount: this.logs.length
        };
    }

    static syncState(state) {
        this.isEnabled = state.isEnabled;
        this.showGrid = state.showGrid;
        this.showColliders = state.showColliders;
    }
} 