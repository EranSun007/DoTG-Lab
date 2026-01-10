import { TowerConfig } from '../config/TowerConfig.js';
import { EnemyConfig } from '../config/EnemyConfig.js';
import { WaveConfig } from '../config/WaveConfig.js';
import { GameConstants } from '../config/GameConstants.js';
import { HeroConfig } from '../config/HeroConfig.js';
import { GridConfig } from '../config/GridConfig.js';

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
        };

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
        this.renderTowerTab(); // Default view
    }

    renderTabs() {
        if (!this.panel) return;
        this.panel.innerHTML = '';

        const restartBtn = document.createElement('button');
        restartBtn.textContent = '🔄 Restart Game';
        restartBtn.style.width = '100%';
        restartBtn.style.padding = '10px';
        restartBtn.style.marginBottom = '15px';
        restartBtn.style.background = '#4444ff';
        restartBtn.style.color = 'white';
        restartBtn.style.border = 'none';
        restartBtn.style.borderRadius = '4px';
        restartBtn.style.cursor = 'pointer';
        restartBtn.style.fontWeight = 'bold';
        restartBtn.onclick = () => {
            if (window.game) {
                window.game.restart();
                this.showToast('Game Restarted');
            }
        };
        this.panel.appendChild(restartBtn);

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

        this.contentContainer.appendChild(levelSection);

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
        WaveConfig.forEach((wave, index) => {
            const wrapper = this.createSection(`WAVE ${wave.waveNumber}`);

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

            // Add Enemy Section
            const addContainer = document.createElement('div');
            addContainer.style.marginTop = '15px';
            addContainer.style.display = 'flex';
            addContainer.style.gap = '5px';

            const typeSelect = document.createElement('select');
            typeSelect.style.flex = '1';
            typeSelect.style.background = '#333';
            typeSelect.style.color = 'white';
            typeSelect.style.border = '1px solid #444';
            typeSelect.style.padding = '5px';

            Object.keys(EnemyConfig).forEach(type => {
                const opt = document.createElement('option');
                opt.value = type;
                opt.textContent = type.toUpperCase();
                typeSelect.appendChild(opt);
            });

            const addBtn = document.createElement('button');
            addBtn.textContent = '+ Add Enemy';
            addBtn.style.background = '#44ff44';
            addBtn.style.color = 'black';
            addBtn.style.border = 'none';
            addBtn.style.padding = '5px 10px';
            addBtn.style.borderRadius = '3px';
            addBtn.style.cursor = 'pointer';
            addBtn.style.fontSize = '12px';
            addBtn.style.fontWeight = 'bold';

            addBtn.onclick = () => {
                const type = typeSelect.value;
                wave.enemies.push({
                    type: type,
                    count: 5,
                    delay: 1.5
                });
                this.saveConfig('WaveConfig', WaveConfig);
                this.renderWaveTab();
            };

            addContainer.appendChild(typeSelect);
            addContainer.appendChild(addBtn);
            wrapper.appendChild(addContainer);

            this.contentContainer.appendChild(wrapper);
        });
    }

    renderLabTab() {
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
        // Add New Item Button
        const addBtn = document.createElement('button');
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

        Object.keys(configObj).forEach(key => {
            const data = configObj[key];
            const wrapper = this.createSection(key.toUpperCase());

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
                    this.createInput(wrapper, prop.charAt(0).toUpperCase() + prop.slice(1), data[prop], (val) => {
                        data[prop] = parseFloat(val);
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
        const wrapper = this.createSection('Game Constants');

        this.createInput(wrapper, 'Starting Gold', GameConstants.INITIAL_GOLD, (val) => {
            GameConstants.INITIAL_GOLD = parseInt(val);
            // Constants might not be auto-savable nicely if they are individual exports
            // For now, we update runtime only or skip saving constants
            // this.saveConfig('GameConstants', GameConstants);
        });

        this.contentContainer.appendChild(wrapper);
    }

    createSection(title) {
        const div = document.createElement('div');
        div.style.background = '#2a2a2a';
        div.style.padding = '10px';
        div.style.marginBottom = '10px';
        div.style.borderRadius = '5px';
        div.style.transition = 'all 0.2s ease';

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.cursor = 'pointer';
        header.style.marginBottom = '10px';
        header.style.userSelect = 'none';

        const h3 = document.createElement('h3');
        h3.textContent = title;
        h3.style.margin = '0';
        h3.style.fontSize = '14px';
        h3.style.color = '#888';

        const arrow = document.createElement('span');
        arrow.textContent = '▼';
        arrow.style.color = '#888';
        arrow.style.fontSize = '12px';
        arrow.style.transition = 'transform 0.2s ease';

        header.appendChild(h3);
        header.appendChild(arrow);
        div.appendChild(header);

        let isCollapsed = false;

        header.onclick = () => {
            isCollapsed = !isCollapsed;
            arrow.style.transform = isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';

            // Toggle visibility of all other children
            Array.from(div.children).forEach(child => {
                if (child !== header) {
                    child.style.display = isCollapsed ? 'none' : 'block';
                    // Restore flex for some containers if needed, but block is safe fallback for most
                    // For the specific layout in sections, they are usually block-level or flex rows
                    // We might need to handle specific display types if 'block' breaks layout.
                    // Given createInput uses flex divs, 'block' on the wrapper might be fine?
                    // createInput creates a 'row' div which is flex.
                    // setting display='block' on a flex div restores it? No, it sets it to block.
                    // Re-setting to '' usually restores original/css value.
                    if (!isCollapsed) {
                        child.style.display = '';
                    }
                }
            });
        };

        return div;
    }

    createInput(parent, label, value, onChange, type = 'number', step = 1) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.marginBottom = '5px';

        const lbl = document.createElement('label');
        lbl.textContent = label;
        lbl.style.fontSize = '12px';

        const input = document.createElement('input');
        input.type = type;
        input.value = value;
        input.step = step;
        input.style.width = '60px';
        input.style.textAlign = 'right';
        input.style.background = '#333';
        input.style.color = 'white';
        input.style.border = '1px solid #444';

        input.onchange = (e) => onChange(e.target.value);

        row.appendChild(lbl);
        row.appendChild(input);
        parent.appendChild(row);
    }

    async saveConfig(fileName, data) {
        try {
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

            // Visual feedback
            this.showToast('Saved');
        } catch (error) {
            console.error('Failed to save config:', error);
            this.showToast('Save Error!', true);
        } finally {
            if (this.loadingOverlay) {
                this.loadingOverlay.classList.remove('visible');
            }
        }
    }

    showToast(msg, isError = false) {
        const toast = document.createElement('div');
        toast.textContent = msg;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.background = isError ? '#ff4444' : '#44ff44';
        toast.style.color = isError ? 'white' : 'black';
        toast.style.padding = '5px 10px';
        toast.style.borderRadius = '3px';
        toast.style.zIndex = '3000';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
}
