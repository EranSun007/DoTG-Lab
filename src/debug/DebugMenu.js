export class DebugMenu {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.createDebugPanel();
    }

    createDebugPanel() {
        // Create debug panel container
        this.panel = document.createElement('div');
        this.panel.className = 'debug-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            display: none;
        `;

        // Create debug controls
        this.controls = {
            showGrid: this.createCheckbox('Show Grid', false),
            showColliders: this.createCheckbox('Show Colliders', false),
            showFPS: this.createCheckbox('Show FPS', true),
            showEntityCount: this.createCheckbox('Show Entity Count', true),
            speedMultiplier: this.createSlider('Game Speed', 0.1, 2, 1, 0.1),
            spawnRate: this.createSlider('Spawn Rate', 0.1, 2, 1, 0.1)
        };

        // Add controls to panel
        Object.values(this.controls).forEach(control => {
            this.panel.appendChild(control);
        });

        // Add panel to document
        document.body.appendChild(this.panel);

        // Bind keyboard shortcuts
        this.bindKeyboardShortcuts();
    }

    createCheckbox(label, defaultValue) {
        const container = document.createElement('div');
        container.style.marginBottom = '5px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = defaultValue;
        checkbox.id = `debug-${label.toLowerCase().replace(/\s+/g, '-')}`;

        const labelElement = document.createElement('label');
        labelElement.htmlFor = checkbox.id;
        labelElement.textContent = label;

        container.appendChild(checkbox);
        container.appendChild(labelElement);
        return container;
    }

    createSlider(label, min, max, defaultValue, step) {
        const container = document.createElement('div');
        container.style.marginBottom = '5px';

        const labelElement = document.createElement('label');
        labelElement.textContent = label;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = defaultValue;
        slider.id = `debug-${label.toLowerCase().replace(/\s+/g, '-')}`;

        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = defaultValue;

        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
            this.updateGameSettings();
        });

        container.appendChild(labelElement);
        container.appendChild(slider);
        container.appendChild(valueDisplay);
        return container;
    }

    bindKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Toggle debug panel with Alt+D
            if (e.altKey && e.key.toLowerCase() === 'd') {
                this.toggleVisibility();
            }
            // Toggle pause with Space
            if (e.key === ' ') {
                this.game.paused = !this.game.paused;
                console.log(`Game ${this.game.paused ? 'paused' : 'resumed'}`);
            }
            // Toggle slow motion with Alt+S
            if (e.altKey && e.key.toLowerCase() === 's') {
                const speedSlider = this.controls.speedMultiplier.querySelector('input');
                speedSlider.value = speedSlider.value === '1' ? '0.5' : '1';
                this.updateGameSettings();
            }
        });
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.panel.style.display = this.isVisible ? 'block' : 'none';
        console.log(`Debug panel ${this.isVisible ? 'shown' : 'hidden'}`);
    }

    updateGameSettings() {
        const settings = {
            showGrid: this.controls.showGrid.querySelector('input').checked,
            showColliders: this.controls.showColliders.querySelector('input').checked,
            showFPS: this.controls.showFPS.querySelector('input').checked,
            showEntityCount: this.controls.showEntityCount.querySelector('input').checked,
            speedMultiplier: parseFloat(this.controls.speedMultiplier.querySelector('input').value),
            spawnRate: parseFloat(this.controls.spawnRate.querySelector('input').value)
        };

        // Update game settings
        this.game.debug = true; // Keep debug mode enabled while panel is visible
        this.game.speedMultiplier = settings.speedMultiplier;
        // Add any other game settings updates here
    }

    getDebugState() {
        return {
            showGrid: this.controls.showGrid.querySelector('input').checked,
            showColliders: this.controls.showColliders.querySelector('input').checked,
            showFPS: this.controls.showFPS.querySelector('input').checked,
            showEntityCount: this.controls.showEntityCount.querySelector('input').checked,
            speedMultiplier: parseFloat(this.controls.speedMultiplier.querySelector('input').value),
            spawnRate: parseFloat(this.controls.spawnRate.querySelector('input').value)
        };
    }
} 