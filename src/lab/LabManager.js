import { TowerConfig } from '../config/TowerConfig.js';
import { EnemyConfig } from '../config/EnemyConfig.js';
import { WaveConfig } from '../config/WaveConfig.js';
import { GameConstants } from '../config/GameConstants.js';
import { HeroConfig } from '../config/HeroConfig.js';
import { GridConfig } from '../config/GridConfig.js';
import { LevelConfig } from '../config/LevelConfig.js';
import { createLabInput } from './components/LabInput.js';
import { createLabSection, generatePreview } from './components/LabSection.js';
import { showToast, showSuccess, showError } from './components/LabToast.js';
import { LabShortcuts } from './components/LabShortcuts.js';
import { LabHistory } from './utils/LabHistory.js';

export class LabManager {
    constructor(game) {
        this.game = game;
        this.panel = document.getElementById('lab-controls');
        this.configs = {
            'TowerConfig': TowerConfig,
            'EnemyConfig': EnemyConfig,
            'WaveConfig': WaveConfig,
            'HeroConfig': HeroConfig,
            'GridConfig': GridConfig,
            'LevelConfig': LevelConfig
        };

        // Test Mode state
        this.testMode = false;
        this.autoSave = false;

        // Initialize keyboard shortcuts
        this.shortcuts = new LabShortcuts(this);

        // Initialize history tracking
        this.history = new LabHistory(this);

        this.init();
        this.createLoadingOverlay();
    }

    createLoadingOverlay() {
        const creatorPanel = document.getElementById('creator-panel');
        if (!creatorPanel) return;

        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'lab-loading-overlay';

        const spinner = document.createElement('div');
        spinner.className = 'spinner';

        this.loadingOverlay.appendChild(spinner);
        creatorPanel.appendChild(this.loadingOverlay);
    }

    init() {
        this.renderTabs();
        this.renderStickyActions();
        this.renderTowerTab(); // Default view
    }

    renderStickyActions() {
        const panelContent = document.querySelector('.panel-content');
        if (!panelContent) return;

        // Remove existing sticky actions if any
        const existing = document.getElementById('sticky-actions');
        if (existing) existing.remove();

        // Create sticky action bar
        this.stickyActions = document.createElement('div');
        this.stickyActions.id = 'sticky-actions';
        this.stickyActions.style.position = 'fixed';
        this.stickyActions.style.bottom = '0';
        this.stickyActions.style.right = '0';
        this.stickyActions.style.width = '350px';
        this.stickyActions.style.padding = '15px 20px';
        this.stickyActions.style.background = 'rgba(26, 26, 26, 0.98)';
        this.stickyActions.style.borderTop = '2px solid #44ff44';
        this.stickyActions.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.5)';
        this.stickyActions.style.zIndex = '1500';
        this.stickyActions.style.backdropFilter = 'blur(10px)';
        this.stickyActions.style.display = 'none'; // Hidden by default
        this.stickyActions.style.transition = 'all 0.3s ease';

        // Test Now button
        const testNowBtn = document.createElement('button');
        testNowBtn.textContent = '⚡ Test Now (Ctrl+T)';
        testNowBtn.className = 'lab-btn lab-btn-success';
        testNowBtn.style.width = '100%';
        testNowBtn.style.padding = '12px';
        testNowBtn.style.fontSize = '14px';
        testNowBtn.style.fontWeight = 'bold';
        testNowBtn.onclick = () => {
            if (window.game) {
                window.game.restart();
                showToast({
                    message: 'Testing...',
                    detail: 'Game restarted with current config',
                    type: 'info'
                });
            }
        };

        this.stickyActions.appendChild(testNowBtn);
        document.body.appendChild(this.stickyActions);

        // Update visibility based on test mode
        this.updateStickyActions();
    }

    updateStickyActions() {
        if (this.stickyActions) {
            this.stickyActions.style.display = this.testMode ? 'block' : 'none';
        }
    }

    renderTabs() {
        if (!this.panel) return;
        this.panel.innerHTML = '';

        const restartBtn = document.createElement('button');
        restartBtn.textContent = '🔄 Restart Game';
        restartBtn.className = 'lab-btn lab-btn-primary';
        restartBtn.style.width = '100%';
        restartBtn.style.padding = '10px';
        restartBtn.style.marginBottom = '15px';
        restartBtn.onclick = () => {
            if (window.game) {
                window.game.restart();
                this.showToast('Game Restarted');
            }
        };
        this.panel.appendChild(restartBtn);

        // Test Mode Toggle
        const testModeContainer = document.createElement('div');
        testModeContainer.style.marginBottom = '15px';
        testModeContainer.style.padding = '10px';
        testModeContainer.style.background = '#222';
        testModeContainer.style.borderRadius = '4px';
        testModeContainer.style.border = '1px solid #333';

        const testModeHeader = document.createElement('div');
        testModeHeader.style.display = 'flex';
        testModeHeader.style.justifyContent = 'space-between';
        testModeHeader.style.alignItems = 'center';
        testModeHeader.style.marginBottom = '8px';

        const testModeLabel = document.createElement('div');
        testModeLabel.textContent = 'Test Mode:';
        testModeLabel.style.fontSize = '12px';
        testModeLabel.style.color = '#888';
        testModeLabel.style.fontWeight = 'bold';

        const testModeToggle = document.createElement('button');
        testModeToggle.textContent = this.testMode ? 'ON' : 'OFF';
        testModeToggle.className = 'lab-btn lab-btn-small';
        testModeToggle.style.background = this.testMode ? '#44ff44' : '#666';
        testModeToggle.style.color = this.testMode ? 'black' : 'white';
        testModeToggle.style.padding = '4px 12px';
        testModeToggle.style.minWidth = '50px';

        testModeToggle.onclick = () => {
            this.testMode = !this.testMode;
            showToast({
                message: `Test Mode ${this.testMode ? 'Enabled' : 'Disabled'}`,
                type: this.testMode ? 'success' : 'info'
            });
            // Update sticky actions visibility
            this.updateStickyActions();
            // Re-render to show/hide inline Test Now button
            this.renderTabs();
            this.switchTab(this.currentTab || 'Towers');
        };

        testModeHeader.appendChild(testModeLabel);
        testModeHeader.appendChild(testModeToggle);
        testModeContainer.appendChild(testModeHeader);

        // Test Now button (shown when test mode is on)
        if (this.testMode) {
            const testNowBtn = document.createElement('button');
            testNowBtn.textContent = '⚡ Test Now (Ctrl+T)';
            testNowBtn.className = 'lab-btn lab-btn-success';
            testNowBtn.style.width = '100%';
            testNowBtn.style.padding = '8px';
            testNowBtn.style.fontSize = '11px';
            testNowBtn.onclick = () => {
                if (window.game) {
                    window.game.restart();
                    showToast({
                        message: 'Testing...',
                        detail: 'Game restarted with current config',
                        type: 'info'
                    });
                }
            };
            testModeContainer.appendChild(testNowBtn);
        }

        this.panel.appendChild(testModeContainer);

        // Navigation Dropdown
        const navContainer = document.createElement('div');
        navContainer.style.marginBottom = '20px';

        const navLabel = document.createElement('div');
        navLabel.textContent = 'Select Protocol Section:';
        navLabel.style.fontSize = '12px';
        navLabel.style.color = '#888';
        navLabel.style.marginBottom = '8px';
        navContainer.appendChild(navLabel);

        const select = document.createElement('select');
        select.id = 'lab-section-select';
        select.style.width = '100%';
        select.style.padding = '10px';
        select.style.background = '#333';
        select.style.color = '#44ff44';
        select.style.border = '1px solid #444';
        select.style.borderRadius = '4px';
        select.style.cursor = 'pointer';
        select.style.fontSize = '14px';
        select.style.fontWeight = 'bold';

        const sections = ['Towers', 'Enemies', 'Hero', 'Waves', 'Map', 'Global', 'Lab'];
        sections.forEach(section => {
            const opt = document.createElement('option');
            opt.value = section;
            opt.textContent = `🔬 ${section}`;
            select.appendChild(opt);
        });

        select.onchange = (e) => this.switchTab(e.target.value);
        navContainer.appendChild(select);
        this.panel.appendChild(navContainer);

        // Toggle logic
        const toggleBtn = document.getElementById('lab-toggle');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                const parentPanel = document.getElementById('creator-panel');
                parentPanel.classList.toggle('collapsed');
                toggleBtn.textContent = parentPanel.classList.contains('collapsed') ? '🧪' : '✖';
            };
        }

        this.contentContainer = document.createElement('div');
        this.panel.appendChild(this.contentContainer);
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        this.contentContainer.innerHTML = '';
        if (tabName === 'Towers') this.renderTowerTab();
        if (tabName === 'Enemies') this.renderEnemyTab();
        if (tabName === 'Hero') this.renderHeroTab();
        if (tabName === 'Waves') this.renderWaveTab();
        if (tabName === 'Map') this.renderMapTab();
        if (tabName === 'Global') this.renderGlobalTab();
        if (tabName === 'Lab') this.renderLabTab();
    }

    renderMapTab() {
        this.contentContainer.innerHTML = '';
        const gridSection = this.createSection('GRID SETTINGS');

        this.createInput(gridSection, 'Cell Size', GridConfig.CELL_SIZE, (val) => {
            GridConfig.CELL_SIZE = parseInt(val);
            this.saveConfig('GridConfig', GridConfig);
        });

        this.createInput(gridSection, 'Grid Width', GridConfig.GRID_WIDTH, (val) => {
            GridConfig.GRID_WIDTH = parseInt(val);
            this.saveConfig('GridConfig', GridConfig);
        });

        this.createInput(gridSection, 'Grid Height', GridConfig.GRID_HEIGHT, (val) => {
            GridConfig.GRID_HEIGHT = parseInt(val);
            this.saveConfig('GridConfig', GridConfig);
        });

        this.contentContainer.appendChild(gridSection);

        const levelSection = this.createSection('LEVEL SETTINGS');

        this.createInput(levelSection, 'Initial Gold', GameConstants.INITIAL_GOLD, (val) => {
            GameConstants.INITIAL_GOLD = parseInt(val);
        });

        this.createInput(levelSection, 'Initial Lives', GameConstants.INITIAL_LIVES, (val) => {
            GameConstants.INITIAL_LIVES = parseInt(val);
        });

        this.createInput(levelSection, 'Path Width', GameConstants.PATH_WIDTH, (val) => {
            GameConstants.PATH_WIDTH = parseInt(val);
        });

        this.createInput(levelSection, 'Current Level', this.game.currentLevel, (val) => {
            const level = parseInt(val);
            if (LevelConfig[level]) {
                this.game.currentLevel = level;
                this.game.currentWave = 1; // Reset waves
                this.game.restart();
                this.showToast(`Switched to Level ${level}`);
            } else {
                this.showToast('Level not defined', true);
            }
        });

        this.contentContainer.appendChild(levelSection);

        const pathSection = this.createSection('PATH SETTINGS');
        const level = LevelConfig[this.game.currentLevel];

        const mainBtnRow = document.createElement('div');
        mainBtnRow.style.display = 'flex';
        mainBtnRow.style.gap = '10px';
        mainBtnRow.style.marginBottom = '15px';

        const editBtn = document.createElement('button');
        editBtn.textContent = this.game.isEditingPath ? '🛑 Stop Editing' : '🛤 Edit Path';
        editBtn.style.flex = '1';
        editBtn.style.padding = '10px';
        editBtn.style.background = this.game.isEditingPath ? '#ff4444' : '#4444ff';
        editBtn.style.color = 'white';
        editBtn.style.border = 'none';
        editBtn.style.borderRadius = '4px';
        editBtn.style.cursor = 'pointer';
        editBtn.style.fontWeight = 'bold';
        editBtn.onclick = () => {
            this.game.isEditingPath = !this.game.isEditingPath;
            this.renderMapTab(); // Re-render to show sub-buttons
            if (!this.game.isEditingPath) {
                this.saveConfig('LevelConfig', LevelConfig);
                this.showToast('Path Saved');
            }
        };

        const clearBtn = document.createElement('button');
        clearBtn.textContent = '🗑 Clear';
        clearBtn.style.padding = '10px';
        clearBtn.style.background = '#666';
        clearBtn.style.color = 'white';
        clearBtn.style.border = 'none';
        clearBtn.style.borderRadius = '4px';
        clearBtn.style.cursor = 'pointer';
        clearBtn.onclick = () => {
            if (confirm('Clear entire path?')) {
                LevelConfig[this.game.currentLevel].path = [];
                this.saveConfig('LevelConfig', LevelConfig);
                this.renderMapTab();
            }
        };

        mainBtnRow.appendChild(editBtn);
        mainBtnRow.appendChild(clearBtn);
        pathSection.appendChild(mainBtnRow);

        // Sub-buttons for specific points
        if (this.game.isEditingPath) {
            const subBtnRow = document.createElement('div');
            subBtnRow.style.display = 'grid';
            subBtnRow.style.gridTemplateColumns = '1fr 1fr 1fr';
            subBtnRow.style.gap = '5px';
            subBtnRow.style.marginBottom = '15px';

            const modes = [
                { id: 'home', label: '📍 Home', color: '#ffaa44' },
                { id: 'append', label: '➕ Point', color: '#44ffaa' },
                { id: 'end', label: '🏁 End', color: '#ff44aa' }
            ];

            modes.forEach(mode => {
                const btn = document.createElement('button');
                btn.textContent = mode.label;
                btn.style.padding = '8px 5px';
                btn.style.fontSize = '12px';
                btn.style.background = this.game.pathEditType === mode.id ? mode.color : '#333';
                btn.style.color = this.game.pathEditType === mode.id ? 'black' : 'white';
                btn.style.border = '1px solid ' + mode.color;
                btn.style.borderRadius = '4px';
                btn.style.cursor = 'pointer';
                btn.onclick = () => {
                    this.game.pathEditType = mode.id;
                    this.renderMapTab();
                };
                subBtnRow.appendChild(btn);
            });
            pathSection.appendChild(subBtnRow);
        }

        if (level && level.path && level.path.length > 0) {
            // Path points list view
            const pathList = document.createElement('div');
            pathList.style.marginTop = '15px';

            const listTitle = document.createElement('div');
            listTitle.textContent = 'Path Points:';
            listTitle.style.fontSize = '11px';
            listTitle.style.color = '#888';
            listTitle.style.marginBottom = '8px';
            listTitle.style.fontWeight = 'bold';
            pathList.appendChild(listTitle);

            level.path.forEach((point, index) => {
                const pointRow = document.createElement('div');
                pointRow.className = 'lab-path-point-row';

                // Icon and coordinates
                const info = document.createElement('div');
                info.style.flex = '1';
                info.style.display = 'flex';
                info.style.alignItems = 'center';
                info.style.gap = '8px';

                const icon = document.createElement('span');
                icon.style.fontSize = '14px';
                if (index === 0) icon.textContent = '🏠';
                else if (index === level.path.length - 1) icon.textContent = '🚩';
                else icon.textContent = '•';

                const coords = document.createElement('span');
                coords.textContent = `(${point.x}, ${point.y})`;
                coords.className = 'lab-info-text';

                info.appendChild(icon);
                info.appendChild(coords);

                // Action buttons
                const actions = document.createElement('div');
                actions.style.display = 'flex';
                actions.style.gap = '4px';

                // Remove button
                const removeBtn = document.createElement('button');
                removeBtn.textContent = '✖';
                removeBtn.style.padding = '2px 6px';
                removeBtn.style.fontSize = '10px';
                removeBtn.style.background = '#ff4444';
                removeBtn.style.color = 'white';
                removeBtn.style.border = 'none';
                removeBtn.style.borderRadius = '3px';
                removeBtn.style.cursor = 'pointer';
                removeBtn.onclick = () => {
                    level.path.splice(index, 1);
                    this.saveConfig('LevelConfig', LevelConfig);
                    this.renderMapTab();
                };

                actions.appendChild(removeBtn);
                pointRow.appendChild(info);
                pointRow.appendChild(actions);
                pathList.appendChild(pointRow);
            });

            // Quick actions row
            const quickActions = document.createElement('div');
            quickActions.className = 'lab-quick-actions';

            const copyBtn = document.createElement('button');
            copyBtn.textContent = '📋 Copy Path';
            copyBtn.className = 'lab-btn lab-btn-small';
            copyBtn.style.flex = '1';
            copyBtn.style.background = '#333';
            copyBtn.style.color = '#44aaff';
            copyBtn.style.border = '1px solid #444';
            copyBtn.onclick = () => {
                const pathJson = JSON.stringify(level.path, null, 2);
                navigator.clipboard.writeText(pathJson);
                showToast({ message: 'Path copied to clipboard', type: 'success' });
            };

            const reverseBtn = document.createElement('button');
            reverseBtn.textContent = '🔄 Reverse';
            reverseBtn.className = 'lab-btn lab-btn-small';
            reverseBtn.style.flex = '1';
            reverseBtn.style.background = '#333';
            reverseBtn.style.color = '#ffaa44';
            reverseBtn.style.border = '1px solid #444';
            reverseBtn.onclick = () => {
                level.path.reverse();
                this.saveConfig('LevelConfig', LevelConfig);
                this.renderMapTab();
                showToast({ message: 'Path reversed', type: 'info' });
            };

            quickActions.appendChild(copyBtn);
            quickActions.appendChild(reverseBtn);
            pathList.appendChild(quickActions);

            pathSection.appendChild(pathList);
        }
        this.contentContainer.appendChild(pathSection);

        this.renderLevelsSection();
    }

    async renderLevelsSection() {
        const wrapper = this.createSection('LEVEL MANAGER');

        // Level List
        const listContainer = document.createElement('div');
        listContainer.style.marginBottom = '15px';

        const label = document.createElement('div');
        label.textContent = 'Saved Levels:';
        label.style.fontSize = '12px';
        label.style.marginBottom = '5px';
        listContainer.appendChild(label);

        const select = document.createElement('select');
        select.style.width = '100%';
        select.style.padding = '8px';
        select.style.background = '#333';
        select.style.color = 'white';
        select.style.border = '1px solid #444';
        select.style.marginBottom = '10px';
        listContainer.appendChild(select);

        // Fetch levels
        try {
            const response = await fetch('/api/levels');
            const levels = await response.json();
            select.innerHTML = '';
            if (levels.length === 0) {
                const opt = document.createElement('option');
                opt.textContent = '-- No Saved Levels --';
                select.appendChild(opt);
            } else {
                levels.forEach(level => {
                    const opt = document.createElement('option');
                    opt.value = level;
                    opt.textContent = level;
                    select.appendChild(opt);
                });
            }
        } catch (e) {
            console.error('Failed to load levels', e);
        }

        // Action Buttons Row
        const actionRow = document.createElement('div');
        actionRow.style.display = 'flex';
        actionRow.style.gap = '10px';
        actionRow.style.marginBottom = '15px';

        const loadBtn = document.createElement('button');
        loadBtn.textContent = '📂 Load';
        loadBtn.style.flex = '1';
        loadBtn.style.padding = '8px';
        loadBtn.style.background = '#4444ff';
        loadBtn.style.color = 'white';
        loadBtn.style.border = 'none';
        loadBtn.style.borderRadius = '4px';
        loadBtn.style.cursor = 'pointer';
        loadBtn.onclick = async () => {
            const levelName = select.value;
            if (!levelName || levelName.startsWith('--')) return;
            await this.loadLevel(levelName);
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑 Delete';
        deleteBtn.style.flex = '1';
        deleteBtn.style.padding = '8px';
        deleteBtn.style.background = '#ff4444';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '4px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.onclick = async () => {
            const levelName = select.value;
            if (!levelName || levelName.startsWith('--')) return;
            if (confirm(`Delete level "${levelName}"?`)) {
                await this.deleteLevel(levelName);
                this.renderMapTab(); // Refresh to update list
            }
        };

        actionRow.appendChild(loadBtn);
        actionRow.appendChild(deleteBtn);
        listContainer.appendChild(actionRow);
        wrapper.appendChild(listContainer);

        // Save New Level Section
        const saveContainer = document.createElement('div');
        saveContainer.style.borderTop = '1px solid #444';
        saveContainer.style.paddingTop = '15px';

        const nameInput = document.createElement('input');
        nameInput.placeholder = 'New Level Name';
        nameInput.style.width = '100%';
        nameInput.style.padding = '8px';
        nameInput.style.background = '#333';
        nameInput.style.color = 'white';
        nameInput.style.border = '1px solid #444';
        nameInput.style.marginBottom = '10px';
        saveContainer.appendChild(nameInput);

        const saveBtn = document.createElement('button');
        saveBtn.textContent = '💾 Save Current State';
        saveBtn.style.width = '100%';
        saveBtn.style.padding = '10px';
        saveBtn.style.background = '#44ff44';
        saveBtn.style.color = 'black';
        saveBtn.style.border = 'none';
        saveBtn.style.borderRadius = '4px';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.fontWeight = 'bold';
        saveBtn.onclick = async () => {
            const name = nameInput.value.trim();
            if (!name) {
                this.showToast('Enter a level name!', true);
                return;
            }
            await this.saveLevel(name);
            this.renderMapTab(); // Refresh
        };
        saveContainer.appendChild(saveBtn);
        wrapper.appendChild(saveContainer);

        this.contentContainer.appendChild(wrapper);
    }

    async loadLevel(name) {
        try {
            this.loadingOverlay?.classList.add('visible');
            const response = await fetch(`/api/levels/${name}`);
            const data = await response.json();

            // Apply config
            if (data.WaveConfig) Object.assign(WaveConfig, data.WaveConfig);
            if (data.GridConfig) Object.assign(GridConfig, data.GridConfig);
            if (data.GameConstants) Object.assign(GameConstants, data.GameConstants);

            // Re-save to persist as "current" config
            await this.saveConfig('WaveConfig', WaveConfig);
            await this.saveConfig('GridConfig', GridConfig);

            this.showToast(`Loaded Level: ${name}`);
            if (window.game) window.game.restart();
        } catch (e) {
            console.error('Load failed', e);
            this.showToast('Load Failed', true);
        } finally {
            this.loadingOverlay?.classList.remove('visible');
        }
    }

    async saveLevel(name) {
        try {
            this.loadingOverlay?.classList.add('visible');
            const levelData = {
                WaveConfig: WaveConfig,
                GridConfig: GridConfig,
                GameConstants: {
                    INITIAL_GOLD: GameConstants.INITIAL_GOLD,
                    INITIAL_LIVES: GameConstants.INITIAL_LIVES,
                    PATH_WIDTH: GameConstants.PATH_WIDTH
                },
                timestamp: Date.now()
            };

            const response = await fetch('/api/levels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, data: levelData })
            });
            const result = await response.json();

            if (result.success) {
                this.showToast(`Saved Level: ${name}`);
            } else {
                throw new Error(result.error);
            }
        } catch (e) {
            console.error('Save failed', e);
            this.showToast(e.message || 'Save Failed', true);
        } finally {
            this.loadingOverlay?.classList.remove('visible');
        }
    }

    async deleteLevel(name) {
        try {
            this.loadingOverlay?.classList.add('visible');
            await fetch(`/api/levels/${name}`, { method: 'DELETE' });
            this.showToast(`Deleted: ${name}`);
        } catch (e) {
            console.error('Delete failed', e);
            this.showToast('Delete Failed', true);
        } finally {
            this.loadingOverlay?.classList.remove('visible');
        }
    }

    renderHeroTab() {
        this.contentContainer.innerHTML = '';
        const wrapper = this.createSection('HERO');

        this.createInput(wrapper, 'Health', HeroConfig.health, (val) => {
            HeroConfig.health = parseFloat(val);
            if (this.game.hero) this.game.hero.health = HeroConfig.health;
            this.saveConfig('HeroConfig', HeroConfig);
        });

        this.createInput(wrapper, 'Speed', HeroConfig.speed, (val) => {
            HeroConfig.speed = parseFloat(val);
            if (this.game.hero) this.game.hero.speed = HeroConfig.speed;
            this.saveConfig('HeroConfig', HeroConfig);
        });

        this.createInput(wrapper, 'Range', HeroConfig.range, (val) => {
            HeroConfig.range = parseFloat(val);
            if (this.game.hero) this.game.hero.range = HeroConfig.range;
            this.saveConfig('HeroConfig', HeroConfig);
        });

        this.createInput(wrapper, 'Damage', HeroConfig.damage, (val) => {
            HeroConfig.damage = parseFloat(val);
            if (this.game.hero) this.game.hero.damage = HeroConfig.damage;
            this.saveConfig('HeroConfig', HeroConfig);
        });

        this.createInput(wrapper, 'Attack Cooldown', HeroConfig.attackSpeed, (val) => {
            HeroConfig.attackSpeed = parseFloat(val);
            if (this.game.hero) this.game.hero.attackSpeed = HeroConfig.attackSpeed;
            this.saveConfig('HeroConfig', HeroConfig);
        });

        this.contentContainer.appendChild(wrapper);
    }

    renderWaveTab() {
        // Clear content container safely
        while (this.contentContainer.firstChild) {
            this.contentContainer.removeChild(this.contentContainer.firstChild);
        }

        WaveConfig.forEach((wave, index) => {
            // Generate preview showing enemy types and counts
            const enemySummary = wave.enemies.map(e => `${e.type}×${e.count}`).join(' + ');
            const preview = `${wave.enemies.length} groups: ${enemySummary} | Reward: ${wave.reward}`;

            const wrapper = this.createSection(`WAVE ${wave.waveNumber}`, preview);

            this.createInput(wrapper, 'Reward', wave.reward, (val) => {
                wave.reward = parseInt(val);
                this.saveConfig('WaveConfig', WaveConfig);
            });

            // Enemy Groups
            wave.enemies.forEach((enemyGroup, groupIndex) => {
                const groupContainer = document.createElement('div');
                groupContainer.style.borderLeft = '2px solid #555';
                groupContainer.style.paddingLeft = '10px';
                groupContainer.style.marginTop = '10px';
                groupContainer.style.marginBottom = '10px';

                // Header with Remove Button
                const header = document.createElement('div');
                header.style.display = 'flex';
                header.style.justifyContent = 'space-between';
                header.style.alignItems = 'center';

                const groupTitle = document.createElement('div');
                groupTitle.textContent = `${enemyGroup.type.toUpperCase()}`;
                groupTitle.style.fontSize = '12px';
                groupTitle.style.color = '#aaa';
                groupTitle.style.fontWeight = 'bold';

                const removeBtn = document.createElement('button');
                removeBtn.textContent = '✖';
                removeBtn.style.padding = '2px 6px';
                removeBtn.style.fontSize = '10px';
                removeBtn.style.background = '#ff4444';
                removeBtn.style.border = 'none';
                removeBtn.style.borderRadius = '3px';
                removeBtn.style.color = 'white';
                removeBtn.style.cursor = 'pointer';
                removeBtn.onclick = () => {
                    wave.enemies.splice(groupIndex, 1);
                    this.saveConfig('WaveConfig', WaveConfig);
                    this.renderWaveTab(); // Re-render to show changes
                };

                header.appendChild(groupTitle);
                header.appendChild(removeBtn);
                groupContainer.appendChild(header);

                this.createInput(groupContainer, 'Count', enemyGroup.count, (val) => {
                    enemyGroup.count = parseInt(val);
                    this.saveConfig('WaveConfig', WaveConfig);
                });

                this.createInput(groupContainer, 'Delay', enemyGroup.delay, (val) => {
                    enemyGroup.delay = parseFloat(val);
                    this.saveConfig('WaveConfig', WaveConfig);
                });

                wrapper.appendChild(groupContainer);
            });

            // Quick-Add Enemy Grid
            const quickAddSection = document.createElement('div');
            quickAddSection.className = 'lab-section-container';

            const quickAddLabel = document.createElement('div');
            quickAddLabel.textContent = 'Quick Add Enemy Types:';
            quickAddLabel.className = 'lab-info-text lab-font-bold';
            quickAddLabel.style.marginBottom = '8px';
            quickAddSection.appendChild(quickAddLabel);

            const quickAddGrid = document.createElement('div');
            quickAddGrid.className = 'lab-quick-add-grid';

            // Create quick-add button for each enemy type
            Object.keys(EnemyConfig).forEach(type => {
                const enemyBtn = document.createElement('button');
                enemyBtn.className = 'lab-quick-add-btn';

                const enemyName = document.createElement('div');
                enemyName.textContent = type.toUpperCase();
                enemyName.style.fontSize = '11px';
                enemyName.style.fontWeight = 'bold';

                const enemyCount = document.createElement('div');
                enemyCount.textContent = '(5)';
                enemyCount.style.fontSize = '9px';
                enemyCount.style.opacity = '0.7';
                enemyCount.style.marginTop = '2px';

                enemyBtn.appendChild(enemyName);
                enemyBtn.appendChild(enemyCount);

                enemyBtn.onclick = () => {
                    wave.enemies.push({
                        type: type,
                        count: 5,
                        delay: 1.5
                    });
                    this.saveConfig('WaveConfig', WaveConfig);
                    this.renderWaveTab();
                    showToast({
                        message: 'Enemy Added',
                        detail: `${type.toUpperCase()} x5 added to Wave ${wave.waveNumber}`,
                        type: 'success'
                    });
                };

                quickAddGrid.appendChild(enemyBtn);
            });

            quickAddSection.appendChild(quickAddGrid);
            wrapper.appendChild(quickAddSection);

            this.contentContainer.appendChild(wrapper);
        });
    }

    renderLabTab() {
        this.contentContainer.innerHTML = '';
        const wrapper = this.createSection('Lab Settings');

        // Resolution Picker
        const resLabel = document.createElement('div');
        resLabel.textContent = 'Resolution';
        resLabel.style.fontSize = '12px';
        resLabel.style.marginBottom = '5px';
        wrapper.appendChild(resLabel);

        const select = document.createElement('select');
        select.style.width = '100%';
        select.style.padding = '8px';
        select.style.background = '#333';
        select.style.color = 'white';
        select.style.border = '1px solid #444';
        select.style.borderRadius = '4px';
        select.style.marginBottom = '15px';

        const resolutions = [
            { label: '800 x 600', w: 800, h: 600 },
            { label: '1024 x 768', w: 1024, h: 768 },
            { label: '1280 x 720 (HD)', w: 1280, h: 720 },
            { label: '1440 x 900', w: 1440, h: 900 },
            { label: '1920 x 1080 (FHD)', w: 1920, h: 1080 }
        ];

        resolutions.forEach(res => {
            const opt = document.createElement('option');
            opt.value = `${res.w}x${res.h}`;
            opt.textContent = res.label;
            if (res.w === this.game.canvas.width && res.h === this.game.canvas.height) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });

        select.onchange = (e) => {
            const [w, h] = e.target.value.split('x').map(Number);
            this.game.setResolution(w, h);
            this.showToast(`Resolution: ${w}x${h}`);
        };

        wrapper.appendChild(select);
        this.contentContainer.appendChild(wrapper);
    }

    createSearchFilter(onFilter) {
        const container = document.createElement('div');
        container.style.marginBottom = '15px';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '🔍 Filter items...';
        searchInput.className = 'lab-input';
        searchInput.style.width = '100%';
        searchInput.style.padding = '10px';
        searchInput.style.fontSize = '13px';

        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                onFilter(e.target.value.toLowerCase());
            }, 300);
        });

        container.appendChild(searchInput);
        return container;
    }

    renderTowerTab() {
        this.renderCollectionTab('TowerConfig', TowerConfig, {
            name: "New Tower",
            description: "A new tower",
            cost: 50,
            range: 100,
            attackSpeed: 1.0,
            damage: 10,
            projectileSpeed: 200,
            projectileSize: 5,
            color: "#ffffff",
            sprite: "tower_basic.png",
            projectileType: "ARROW"
        });
    }

    renderEnemyTab() {
        this.renderCollectionTab('EnemyConfig', EnemyConfig, {
            name: "New Enemy",
            description: "A new enemy",
            health: 100,
            speed: 1.0,
            width: 30,
            height: 30,
            value: 10,
            color: "#ff0000"
        });
    }

    renderCollectionTab(configName, configObj, defaultTemplate) {
        // Clear content safely
        while (this.contentContainer.firstChild) {
            this.contentContainer.removeChild(this.contentContainer.firstChild);
        }

        // Add search filter
        const searchFilter = this.createSearchFilter((query) => {
            // Re-render with filter
            this.renderCollectionTabWithFilter(configName, configObj, defaultTemplate, query);
        });
        this.contentContainer.appendChild(searchFilter);

        // Render items
        this.renderCollectionTabWithFilter(configName, configObj, defaultTemplate, '');
    }

    renderCollectionTabWithFilter(configName, configObj, defaultTemplate, filterQuery = '') {
        // Remove existing items (but keep search input)
        const existingItems = this.contentContainer.querySelectorAll('.lab-section, .lab-add-btn');
        existingItems.forEach(item => item.remove());

        // Add New Item Button
        const addBtn = document.createElement('button');
        addBtn.className = 'lab-add-btn';
        addBtn.textContent = '+ Add New Item';
        addBtn.style.width = '100%';
        addBtn.style.padding = '10px';
        addBtn.style.marginBottom = '15px';
        addBtn.style.background = '#4444ff';
        addBtn.style.color = 'white';
        addBtn.style.border = 'none';
        addBtn.style.borderRadius = '4px';
        addBtn.style.cursor = 'pointer';
        addBtn.style.fontWeight = 'bold';
        addBtn.onclick = () => {
            const newId = this.generateId(configObj, 'item');
            configObj[newId] = JSON.parse(JSON.stringify(defaultTemplate));
            this.saveConfig(configName, configObj);
            this.switchTab(this.currentTab); // Refresh
        };
        this.contentContainer.appendChild(addBtn);

        // Filter items
        const filteredKeys = Object.keys(configObj).filter(key => {
            if (!filterQuery) return true;
            const data = configObj[key];
            // Match against key name or item name
            return key.toLowerCase().includes(filterQuery) ||
                   (data.name && data.name.toLowerCase().includes(filterQuery));
        });

        // Show match count if filtering
        if (filterQuery) {
            const matchInfo = document.createElement('div');
            matchInfo.style.fontSize = '11px';
            matchInfo.style.color = '#888';
            matchInfo.style.marginBottom = '10px';
            matchInfo.style.textAlign = 'center';
            matchInfo.textContent = `Showing ${filteredKeys.length} of ${Object.keys(configObj).length} items`;
            this.contentContainer.appendChild(matchInfo);
        }

        filteredKeys.forEach(key => {
            const data = configObj[key];

            // Generate preview based on config type
            let previewKeys = [];
            if (configName === 'TowerConfig') {
                previewKeys = ['damage', 'range', 'attackSpeed', 'cost'];
            } else if (configName === 'EnemyConfig') {
                previewKeys = ['health', 'speed', 'value'];
            }
            const preview = generatePreview(data, previewKeys);

            const wrapper = this.createSection(key.toUpperCase(), preview);

            // Helper to update preview when values change
            const updatePreview = () => {
                const newPreview = generatePreview(data, previewKeys);
                wrapper.setPreview(newPreview);
            };

            // Header Actions (ID Rename & Delete)
            const headerActions = document.createElement('div');
            headerActions.style.marginBottom = '15px';
            headerActions.style.padding = '10px';
            headerActions.style.background = '#222';
            headerActions.style.borderRadius = '4px';

            // ID Rename
            const idRow = document.createElement('div');
            idRow.style.display = 'flex';
            idRow.style.justifyContent = 'space-between';
            idRow.style.alignItems = 'center';
            idRow.style.marginBottom = '10px';

            const idLabel = document.createElement('label');
            idLabel.textContent = 'ID (Key):';
            idLabel.style.fontSize = '12px';
            idLabel.style.color = '#aaa';

            const idInput = document.createElement('input');
            idInput.value = key;
            idInput.style.background = '#444';
            idInput.style.color = '#fff';
            idInput.style.border = '1px solid #555';
            idInput.style.padding = '4px';
            idInput.style.width = '120px';

            const renameBtn = document.createElement('button');
            renameBtn.textContent = 'Rename ID';
            renameBtn.style.marginLeft = '5px';
            renameBtn.style.fontSize = '10px';
            renameBtn.style.cursor = 'pointer';
            renameBtn.onclick = () => {
                const newKey = idInput.value.trim();
                if (newKey && newKey !== key) {
                    if (configObj[newKey]) {
                        this.showToast('ID already exists!', true);
                        return;
                    }
                    // Rename key: assign to new key, delete old key
                    configObj[newKey] = configObj[key];
                    delete configObj[key];
                    this.saveConfig(configName, configObj);
                    this.switchTab(this.currentTab);
                }
            };

            idRow.appendChild(idLabel);
            const inputContainer = document.createElement('div');
            inputContainer.appendChild(idInput);
            inputContainer.appendChild(renameBtn);
            idRow.appendChild(inputContainer);
            headerActions.appendChild(idRow);

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑 DELETE ITEM';
            deleteBtn.style.width = '100%';
            deleteBtn.style.padding = '5px';
            deleteBtn.style.background = '#ff4444';
            deleteBtn.style.color = 'white';
            deleteBtn.style.border = 'none';
            deleteBtn.style.borderRadius = '3px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.fontSize = '11px';
            deleteBtn.onclick = () => {
                if (confirm(`Are you sure you want to delete "${key}"?`)) {
                    delete configObj[key];
                    this.saveConfig(configName, configObj);
                    this.switchTab(this.currentTab);
                }
            };
            headerActions.appendChild(deleteBtn);

            wrapper.appendChild(headerActions);

            // Dynamic Properties
            // We'll iterate over keys in the data object to generate inputs
            // prioritizing known keys for better formatting

            // Name
            if (data.name !== undefined) {
                this.createInput(wrapper, 'Display Name', data.name, (val) => {
                    data.name = val;
                    this.saveConfig(configName, configObj);
                }, 'text');
            }

            const numericKeys = ['cost', 'range', 'damage', 'health', 'speed', 'width', 'height', 'value', 'attackSpeed', 'projectileSpeed', 'projectileSize', 'splashRadius', 'splashDamage'];

            numericKeys.forEach(prop => {
                if (data[prop] !== undefined) {
                    const oldValue = data[prop];
                    this.createInput(wrapper, prop.charAt(0).toUpperCase() + prop.slice(1), data[prop], (val) => {
                        const newValue = parseFloat(val);
                        // Record change to history
                        this.history.record({
                            type: configName.replace('Config', '').toLowerCase(),
                            id: key,
                            property: prop,
                            oldValue: oldValue,
                            newValue: newValue,
                            configName: configName,
                            description: `${key}.${prop}: ${oldValue}→${newValue}`
                        });
                        data[prop] = newValue;
                        updatePreview(); // Update section preview
                        this.saveConfig(configName, configObj);
                    });
                }
            });

            // Color
            if (data.color !== undefined) {
                this.createInput(wrapper, 'Color', data.color, (val) => {
                    data.color = val;
                    this.saveConfig(configName, configObj);
                }, 'text');
            }

            // Description
            if (data.description !== undefined) {
                this.createInput(wrapper, 'Description', data.description, (val) => {
                    data.description = val;
                    this.saveConfig(configName, configObj);
                }, 'text');
            }

            // Projectile Type
            if (data.projectileType !== undefined) {
                this.createInput(wrapper, 'Projectile Type', data.projectileType, (val) => {
                    data.projectileType = val;
                    this.saveConfig(configName, configObj);
                }, 'text');
            }

            // States (Operational Modes)
            if (data.states !== undefined) {
                this.renderStatesEditor(wrapper, data.states, () => {
                    this.saveConfig(configName, configObj);
                });
            }

            this.contentContainer.appendChild(wrapper);
        });
    }

    generateId(obj, prefix) {
        let i = 1;
        while (obj[`${prefix}_${i}`]) {
            i++;
        }
        return `${prefix}_${i}`;
    }

    renderGlobalTab() {
        // Clear content safely
        while (this.contentContainer.firstChild) {
            this.contentContainer.removeChild(this.contentContainer.firstChild);
        }

        const wrapper = this.createSection('Game Constants');

        this.createInput(wrapper, 'Starting Gold', GameConstants.INITIAL_GOLD, (val) => {
            GameConstants.INITIAL_GOLD = parseInt(val);
            // Constants might not be auto-savable nicely if they are individual exports
            // For now, we update runtime only or skip saving constants
            // this.saveConfig('GameConstants', GameConstants);
        });

        this.contentContainer.appendChild(wrapper);

        // Add history panel
        const historyContainer = this.history.getHistoryElement();
        this.contentContainer.appendChild(historyContainer);
    }

    createSection(title, preview = '') {
        const section = createLabSection({
            title: title,
            preview: preview,
            startExpanded: false,
            autoCollapseSiblings: true
        });

        // Store reference to content container for backwards compatibility
        // Old code expects to append children to returned element
        // and then append the returned element to contentContainer
        const contentContainer = section.labSection.getContent();

        // Override appendChild to add to content instead of section
        section._originalAppendChild = section.appendChild;
        section.appendChild = (child) => {
            contentContainer.appendChild(child);
        };

        // Attach helper methods
        section.setPreview = section.labSection.setPreview;
        section.getContent = section.labSection.getContent;

        return section; // Return section, not content
    }

    renderStatesEditor(container, states, onUpdate) {
        const section = document.createElement('div');
        section.style.marginTop = '15px';
        section.style.padding = '10px';
        section.style.border = '1px solid #444';
        section.style.borderRadius = '4px';
        section.style.background = '#1a1a1a';

        const label = document.createElement('div');
        label.textContent = 'Operational Modes:';
        label.style.fontSize = '12px';
        label.style.color = '#44ff44';
        label.style.marginBottom = '10px';
        label.style.fontWeight = 'bold';
        section.appendChild(label);

        states.forEach((state, index) => {
            const stateWrapper = document.createElement('div');
            stateWrapper.style.marginBottom = '15px';
            stateWrapper.style.padding = '10px';
            stateWrapper.style.background = '#222';
            stateWrapper.style.borderRadius = '4px';
            stateWrapper.style.position = 'relative';

            // Remove State Button
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '✖';
            removeBtn.style.position = 'absolute';
            removeBtn.style.right = '5px';
            removeBtn.style.top = '5px';
            removeBtn.style.padding = '2px 6px';
            removeBtn.style.fontSize = '10px';
            removeBtn.style.background = '#ff4444';
            removeBtn.style.border = 'none';
            removeBtn.style.borderRadius = '3px';
            removeBtn.style.color = 'white';
            removeBtn.style.cursor = 'pointer';
            removeBtn.onclick = () => {
                states.splice(index, 1);
                onUpdate();
                this.switchTab(this.currentTab);
            };
            stateWrapper.appendChild(removeBtn);

            // Name
            this.createInput(stateWrapper, 'Mode Name', state.name, (val) => {
                state.name = val;
                onUpdate();
            }, 'text');

            // Angle
            this.createInput(stateWrapper, 'Angle (Arc)', state.angle, (val) => {
                state.angle = parseFloat(val);
                onUpdate();
            });

            // Range
            this.createInput(stateWrapper, 'Range', state.range, (val) => {
                state.range = parseFloat(val);
                onUpdate();
            });

            // Damage
            this.createInput(stateWrapper, 'Damage', state.damage, (val) => {
                state.damage = parseFloat(val);
                onUpdate();
            });

            // Attack Speed
            this.createInput(stateWrapper, 'Attack Speed', state.attackSpeed, (val) => {
                state.attackSpeed = parseFloat(val);
                onUpdate();
            });

            section.appendChild(stateWrapper);
        });

        // Add State Button
        const addStateBtn = document.createElement('button');
        addStateBtn.textContent = '+ Add Operational Mode';
        addStateBtn.style.width = '100%';
        addStateBtn.style.padding = '5px';
        addStateBtn.style.fontSize = '11px';
        addStateBtn.style.background = '#4444ff';
        addStateBtn.style.color = 'white';
        addStateBtn.style.border = 'none';
        addStateBtn.style.borderRadius = '3px';
        addStateBtn.style.cursor = 'pointer';
        addStateBtn.onclick = () => {
            states.push({
                name: "New Mode",
                angle: 360,
                range: 100,
                attackSpeed: 1,
                damage: 10
            });
            onUpdate();
            this.switchTab(this.currentTab);
        };
        section.appendChild(addStateBtn);

        container.appendChild(section);
    }

    createInput(parent, label, value, onChange, type = 'number', step = 1) {
        // For text fields (color, description, etc.), create simple text input
        if (type === 'text') {
            const container = document.createElement('div');
            container.className = 'lab-input-container';
            container.style.marginBottom = '12px';

            const labelEl = document.createElement('label');
            labelEl.textContent = label;
            labelEl.className = 'lab-input-label';
            labelEl.style.display = 'block';
            labelEl.style.marginBottom = '5px';
            labelEl.style.fontSize = '12px';
            labelEl.style.color = '#ffffff';
            container.appendChild(labelEl);

            // Special handling for color inputs
            const labelLower = label.toLowerCase();
            if (labelLower.includes('color')) {
                const colorContainer = document.createElement('div');
                colorContainer.style.display = 'flex';
                colorContainer.style.gap = '8px';
                colorContainer.style.alignItems = 'center';

                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.value = value || '#ffffff';
                colorInput.className = 'lab-input';
                colorInput.style.width = '60px';
                colorInput.style.height = '36px';
                colorInput.style.cursor = 'pointer';
                colorInput.style.padding = '2px';

                const textInput = document.createElement('input');
                textInput.type = 'text';
                textInput.value = value || '#ffffff';
                textInput.className = 'lab-input';
                textInput.style.flex = '1';
                textInput.style.fontFamily = 'monospace';

                // Sync color picker and text input
                colorInput.addEventListener('change', (e) => {
                    textInput.value = e.target.value;
                    onChange(e.target.value);
                });

                textInput.addEventListener('change', (e) => {
                    // Validate hex color
                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                        colorInput.value = e.target.value;
                        onChange(e.target.value);
                    }
                });

                colorContainer.appendChild(colorInput);
                colorContainer.appendChild(textInput);
                container.appendChild(colorContainer);
            } else if (labelLower.includes('description')) {
                // Text area for descriptions
                const textarea = document.createElement('textarea');
                textarea.value = value || '';
                textarea.className = 'lab-input';
                textarea.style.width = '100%';
                textarea.style.minHeight = '60px';
                textarea.style.resize = 'vertical';
                textarea.style.fontFamily = 'inherit';
                textarea.addEventListener('change', (e) => onChange(e.target.value));
                container.appendChild(textarea);
            } else {
                // Regular text input
                const input = document.createElement('input');
                input.type = 'text';
                input.value = value || '';
                input.className = 'lab-input';
                input.style.width = '100%';
                input.addEventListener('change', (e) => onChange(e.target.value));
                container.appendChild(input);
            }

            parent.appendChild(container);
            return;
        }

        // For numeric fields, use enhanced input with +/- buttons
        const labelLower = label.toLowerCase();
        let propertyType = 'number';

        if (labelLower.includes('damage')) propertyType = 'damage';
        else if (labelLower.includes('range')) propertyType = 'range';
        else if (labelLower.includes('speed') && labelLower.includes('attack')) propertyType = 'attackSpeed';
        else if (labelLower.includes('speed')) propertyType = 'speed';
        else if (labelLower.includes('cost')) propertyType = 'cost';
        else if (labelLower.includes('health')) propertyType = 'health';
        else if (labelLower.includes('angle')) propertyType = 'angle';
        else if (labelLower.includes('projectile') && labelLower.includes('speed')) propertyType = 'projectileSpeed';

        const inputElement = createLabInput({
            label: label,
            value: value,
            onChange: onChange,
            type: propertyType,
            step: step
        });

        parent.appendChild(inputElement);
    }

    async saveConfig(fileName, data) {
        try {
            // Add saving animation to panel
            const panel = document.getElementById('creator-panel');
            if (panel) {
                panel.classList.add('lab-saving');
            }

            // Show loading state
            if (this.loadingOverlay) {
                this.loadingOverlay.classList.add('visible');
            }

            const startTime = Date.now();
            console.log(`Saving ${fileName}...`);

            const response = await fetch('/api/save-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    file: fileName,
                    data: data
                })
            });
            const result = await response.json();
            console.log(result.message);

            // Ensure loading is visible for at least 500ms for visual persistence
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 500 - elapsed);

            await new Promise(resolve => setTimeout(resolve, remaining));

            // Visual feedback with changed indicator
            this.showToast('Saved ✓');

            // Add green highlight animation to saved section
            this.highlightRecentChanges();
        } catch (error) {
            console.error('Failed to save config:', error);
            this.showToast('Save Error!', true);

            // Add error animation to panel
            const panel = document.getElementById('creator-panel');
            if (panel) {
                panel.classList.add('lab-error');
                setTimeout(() => panel.classList.remove('lab-error'), 500);
            }
        } finally {
            if (this.loadingOverlay) {
                this.loadingOverlay.classList.remove('visible');
            }

            // Remove saving animation
            const panel = document.getElementById('creator-panel');
            if (panel) {
                setTimeout(() => panel.classList.remove('lab-saving'), 500);
            }
        }
    }

    highlightRecentChanges() {
        // Find all recently changed inputs and highlight them
        const inputs = this.contentContainer.querySelectorAll('.lab-input');
        inputs.forEach(input => {
            if (input.dataset.recentlyChanged === 'true') {
                input.classList.add('lab-changed');
                setTimeout(() => {
                    input.classList.remove('lab-changed');
                    delete input.dataset.recentlyChanged;
                }, 1000);
            }
        });
    }

    showToast(msg, isError = false) {
        showToast({
            message: msg,
            type: isError ? 'error' : 'success',
            duration: 2000
        });
    }
}
