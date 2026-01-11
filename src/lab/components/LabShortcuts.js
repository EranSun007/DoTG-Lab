/**
 * Keyboard shortcuts system for God Lab
 * Handles global shortcuts, context-aware shortcuts, and help overlay
 */

import { showToast } from './LabToast.js';

export class LabShortcuts {
    constructor(labManager) {
        this.labManager = labManager;
        this.shortcuts = new Map();
        this.helpVisible = false;
        this.init();
    }

    init() {
        // Register global keyboard handler
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Register default shortcuts
        this.registerShortcuts();
    }

    registerShortcuts() {
        // Navigation shortcuts (Tab + 1-7)
        this.register('Tab+1', 'Jump to Towers', () => this.labManager.switchTab('Towers'));
        this.register('Tab+2', 'Jump to Enemies', () => this.labManager.switchTab('Enemies'));
        this.register('Tab+3', 'Jump to Hero', () => this.labManager.switchTab('Hero'));
        this.register('Tab+4', 'Jump to Waves', () => this.labManager.switchTab('Waves'));
        this.register('Tab+5', 'Jump to Map', () => this.labManager.switchTab('Map'));
        this.register('Tab+6', 'Jump to Global', () => this.labManager.switchTab('Global'));
        this.register('Tab+7', 'Jump to Lab', () => this.labManager.switchTab('Lab'));

        // Action shortcuts
        this.register('Ctrl+T', 'Test Now (restart game)', () => {
            if (window.game) {
                window.game.restart();
                showToast({
                    message: 'Testing...',
                    detail: 'Game restarted with current config',
                    type: 'info'
                });
            }
        });

        this.register('Cmd+T', 'Test Now (restart game)', () => {
            if (window.game) {
                window.game.restart();
                showToast({
                    message: 'Testing...',
                    detail: 'Game restarted with current config',
                    type: 'info'
                });
            }
        });

        this.register('Ctrl+R', 'Restart game', () => {
            if (window.game) {
                window.game.restart();
                showToast({ message: 'Game Restarted', type: 'info' });
            }
        });

        this.register('Cmd+R', 'Restart game', () => {
            if (window.game) {
                window.game.restart();
                showToast({ message: 'Game Restarted', type: 'info' });
            }
        });

        this.register('Ctrl+Z', 'Undo last change', () => {
            if (this.labManager.history) {
                this.labManager.history.undo();
            }
        });

        this.register('Cmd+Z', 'Undo last change', () => {
            if (this.labManager.history) {
                this.labManager.history.undo();
            }
        });

        // Help overlay
        this.register('?', 'Show keyboard shortcuts', () => this.toggleHelp());
        this.register('Escape', 'Close panel/help', () => {
            if (this.helpVisible) {
                this.toggleHelp();
            } else {
                const panel = document.getElementById('creator-panel');
                if (panel && !panel.classList.contains('collapsed')) {
                    panel.classList.add('collapsed');
                    document.getElementById('lab-toggle').textContent = '🧪';
                }
            }
        });
    }

    register(key, description, callback) {
        this.shortcuts.set(key, { description, callback });
    }

    handleKeyDown(event) {
        // Don't trigger shortcuts when typing in inputs
        const target = event.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            // Allow Escape to work in inputs
            if (event.key === 'Escape') {
                target.blur();
            }
            return;
        }

        // Build shortcut key string
        const modifiers = [];
        if (event.ctrlKey) modifiers.push('Ctrl');
        if (event.metaKey) modifiers.push('Cmd');
        if (event.shiftKey) modifiers.push('Shift');
        if (event.altKey) modifiers.push('Alt');

        // Add main key
        let key = event.key;
        if (key === ' ') key = 'Space';
        if (key.length === 1) key = key.toUpperCase();

        const shortcutKey = modifiers.length > 0
            ? `${modifiers.join('+')}+${key}`
            : key;

        // Check if we have a handler for this shortcut
        const shortcut = this.shortcuts.get(shortcutKey);
        if (shortcut) {
            event.preventDefault();
            shortcut.callback();
        }
    }

    toggleHelp() {
        if (this.helpVisible) {
            this.hideHelp();
        } else {
            this.showHelp();
        }
    }

    showHelp() {
        this.helpVisible = true;

        // Create help overlay
        const overlay = document.createElement('div');
        overlay.id = 'lab-help-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.8)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.backdropFilter = 'blur(5px)';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';

        // Create help panel
        const panel = document.createElement('div');
        panel.style.background = '#1a1a1a';
        panel.style.border = '2px solid #44ff44';
        panel.style.borderRadius = '8px';
        panel.style.padding = '30px';
        panel.style.maxWidth = '600px';
        panel.style.maxHeight = '80vh';
        panel.style.overflowY = 'auto';
        panel.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5)';

        // Title
        const title = document.createElement('h2');
        title.textContent = '⌨️ Keyboard Shortcuts';
        title.style.margin = '0 0 20px 0';
        title.style.color = '#44ff44';
        title.style.fontSize = '24px';
        title.style.fontWeight = 'bold';
        panel.appendChild(title);

        // Group shortcuts by category
        const categories = {
            'Navigation': ['Tab+1', 'Tab+2', 'Tab+3', 'Tab+4', 'Tab+5', 'Tab+6', 'Tab+7'],
            'Actions': ['Ctrl+T', 'Cmd+T', 'Ctrl+R', 'Cmd+R', 'Ctrl+Z', 'Cmd+Z'],
            'Interface': ['?', 'Escape']
        };

        Object.entries(categories).forEach(([category, keys]) => {
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category;
            categoryTitle.style.marginTop = '20px';
            categoryTitle.style.marginBottom = '10px';
            categoryTitle.style.color = '#888';
            categoryTitle.style.fontSize = '14px';
            categoryTitle.style.fontWeight = 'bold';
            categoryTitle.style.textTransform = 'uppercase';
            panel.appendChild(categoryTitle);

            keys.forEach(key => {
                const shortcut = this.shortcuts.get(key);
                if (shortcut) {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.justifyContent = 'space-between';
                    row.style.alignItems = 'center';
                    row.style.padding = '8px 0';
                    row.style.borderBottom = '1px solid #333';

                    const keyEl = document.createElement('code');
                    keyEl.textContent = key;
                    keyEl.style.background = '#333';
                    keyEl.style.padding = '4px 8px';
                    keyEl.style.borderRadius = '3px';
                    keyEl.style.color = '#44ff44';
                    keyEl.style.fontSize = '12px';
                    keyEl.style.fontWeight = 'bold';

                    const descEl = document.createElement('span');
                    descEl.textContent = shortcut.description;
                    descEl.style.color = '#aaa';
                    descEl.style.fontSize = '13px';

                    row.appendChild(keyEl);
                    row.appendChild(descEl);
                    panel.appendChild(row);
                }
            });
        });

        // Close instruction
        const closeText = document.createElement('div');
        closeText.textContent = 'Press ? or Esc to close';
        closeText.style.marginTop = '20px';
        closeText.style.textAlign = 'center';
        closeText.style.color = '#666';
        closeText.style.fontSize = '12px';
        closeText.style.fontStyle = 'italic';
        panel.appendChild(closeText);

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });

        // Click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hideHelp();
            }
        });
    }

    hideHelp() {
        this.helpVisible = false;
        const overlay = document.getElementById('lab-help-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }
}
