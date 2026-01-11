/**
 * Undo/Redo system for God Lab
 * Tracks last 10 changes and allows reverting them
 * Stores diffs instead of full snapshots for performance
 */

import { showToast } from '../components/LabToast.js';

export class LabHistory {
    constructor(labManager) {
        this.labManager = labManager;
        this.history = [];
        this.maxHistory = 10;
    }

    /**
     * Record a change to history
     * @param {Object} change - Change object
     * @param {string} change.type - Type of change ('tower', 'enemy', 'wave', etc.)
     * @param {string} change.id - ID of changed item
     * @param {string} change.property - Property that changed
     * @param {any} change.oldValue - Previous value
     * @param {any} change.newValue - New value
     * @param {string} change.configName - Config file name
     * @param {string} change.description - Human-readable description
     */
    record(change) {
        // Add timestamp
        change.timestamp = Date.now();

        // Add to history
        this.history.unshift(change);

        // Keep only last 10 changes
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }

        // Update history UI if visible
        this.updateHistoryUI();
    }

    /**
     * Undo the most recent change
     */
    undo() {
        if (this.history.length === 0) {
            showToast({
                message: 'Nothing to undo',
                type: 'info',
                duration: 1500
            });
            return;
        }

        const change = this.history.shift();
        this.applyUndo(change);

        showToast({
            message: 'Undone',
            detail: change.description,
            type: 'info',
            duration: 2000
        });

        // Update history UI
        this.updateHistoryUI();
    }

    /**
     * Apply an undo operation
     * @param {Object} change - Change to undo
     */
    applyUndo(change) {
        const config = this.labManager.configs[change.configName];
        if (!config) return;

        // Navigate to the changed item
        const item = change.id ? config[change.id] : config;
        if (!item) return;

        // Restore old value
        if (change.property) {
            item[change.property] = change.oldValue;
        } else if (change.type === 'delete') {
            // Restore deleted item
            config[change.id] = change.oldValue;
        } else if (change.type === 'create') {
            // Remove created item
            delete config[change.id];
        }

        // Save config
        this.labManager.saveConfig(change.configName, config);

        // Refresh UI if on the relevant tab
        this.refreshRelevantTab(change);
    }

    /**
     * Refresh the tab related to the change
     * @param {Object} change - Change object
     */
    refreshRelevantTab(change) {
        const tabMap = {
            'TowerConfig': 'Towers',
            'EnemyConfig': 'Enemies',
            'WaveConfig': 'Waves',
            'HeroConfig': 'Hero',
            'GridConfig': 'Map',
            'LevelConfig': 'Map'
        };

        const tab = tabMap[change.configName];
        if (tab && this.labManager.currentTab === tab) {
            this.labManager.switchTab(tab);
        }
    }

    /**
     * Format time ago
     * @param {number} timestamp - Timestamp in ms
     * @returns {string} Formatted time
     */
    formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    /**
     * Get history as HTML element for display
     * @returns {HTMLElement} History list element
     */
    getHistoryElement() {
        const container = document.createElement('div');
        container.id = 'lab-history-list';
        container.style.marginTop = '15px';
        container.style.padding = '12px';
        container.style.background = '#222';
        container.style.borderRadius = '4px';
        container.style.border = '1px solid #333';

        const title = document.createElement('div');
        title.textContent = 'Recent Changes';
        title.style.fontSize = '12px';
        title.style.color = '#888';
        title.style.marginBottom = '10px';
        title.style.fontWeight = 'bold';
        title.style.textTransform = 'uppercase';
        container.appendChild(title);

        if (this.history.length === 0) {
            const empty = document.createElement('div');
            empty.textContent = 'No changes yet';
            empty.style.color = '#666';
            empty.style.fontSize = '11px';
            empty.style.fontStyle = 'italic';
            empty.style.padding = '8px 0';
            container.appendChild(empty);
            return container;
        }

        this.history.forEach((change, index) => {
            const row = document.createElement('div');
            row.className = 'lab-history-row';

            const info = document.createElement('div');
            info.style.flex = '1';
            info.style.marginRight = '10px';

            const desc = document.createElement('div');
            desc.textContent = change.description;
            desc.style.color = '#aaa';
            desc.style.fontSize = '11px';
            info.appendChild(desc);

            const time = document.createElement('div');
            time.textContent = this.formatTimeAgo(change.timestamp);
            time.style.color = '#666';
            time.style.fontSize = '10px';
            time.style.marginTop = '2px';
            info.appendChild(time);

            const undoBtn = document.createElement('button');
            undoBtn.textContent = 'Undo';
            undoBtn.className = 'lab-btn lab-btn-small';
            undoBtn.style.background = '#333';
            undoBtn.style.color = '#44aaff';
            undoBtn.style.border = '1px solid #444';
            undoBtn.style.fontSize = '10px';
            undoBtn.style.padding = '4px 8px';
            undoBtn.style.cursor = 'pointer';
            undoBtn.onclick = () => {
                // Remove this change and all changes after it
                const changesToUndo = this.history.splice(0, index + 1);
                changesToUndo.reverse().forEach(c => this.applyUndo(c));
                showToast({
                    message: `Undone ${changesToUndo.length} change${changesToUndo.length > 1 ? 's' : ''}`,
                    type: 'info'
                });
            };

            row.appendChild(info);
            row.appendChild(undoBtn);
            container.appendChild(row);
        });

        return container;
    }

    /**
     * Update history UI if it exists
     */
    updateHistoryUI() {
        const existing = document.getElementById('lab-history-list');
        if (existing) {
            const parent = existing.parentElement;
            existing.remove();
            parent.appendChild(this.getHistoryElement());
        }
    }

    /**
     * Clear all history
     */
    clear() {
        this.history = [];
        this.updateHistoryUI();
    }
}
