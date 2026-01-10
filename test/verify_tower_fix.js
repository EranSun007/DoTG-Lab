
// Minimal mock setup to run Game logic in Node
class MockCanvas {
    constructor() {
        this.width = 800;
        this.height = 600;
        this.context = {
            clearRect: () => { },
            drawImage: () => { },
            save: () => { },
            restore: () => { },
            translate: () => { },
            rotate: () => { },
            beginPath: () => { },
            arc: () => { },
            fill: () => { },
            stroke: () => { },
            moveTo: () => { },
            lineTo: () => { },
            measureText: () => ({ width: 0 }),
            fillText: () => { }
        };
    }
    getContext() { return this.context; }
    getBoundingClientRect() { return { left: 0, top: 0 }; }
    addEventListener() { }
    removeEventListener() { }
}

const mockCanvas = new MockCanvas();

// Mock DOM elements
global.document = {
    getElementById: () => ({
        getContext: () => mockCanvas.context,
        addEventListener: () => { },
        appendChild: () => { },
        style: {}
    }),
    createElement: () => ({
        style: {},
        appendChild: () => { },
        addEventListener: () => { }
    }),
    body: {
        appendChild: () => { }
    }
};
global.window = {
    addEventListener: () => { }
};
global.Image = class { constructor() { this.src = ''; this.onload = () => { }; } };

// Mock UIManager
class MockUIManager {
    constructor() {
        this.towerButtons = new Map();
    }
    init() { }
    bindTowerButtons() { }
    bindStartWave() { }
    updateGold() { }
    updateLives() { }
    updateWaveNumber() { }
    toggleStartWaveButton() { }
    setSelectedTower(type) {
        console.log(`[TEST] UI: Selected tower type ${type}`);
    }
    createTowerButtons(config, handler) {
        // Simulate creating buttons and registering handler
        this.selectHandler = handler;
        console.log(`[TEST] UI: Created buttons for ${Object.keys(config).join(', ')}`);
    }
    showError(msg) { console.error(`[TEST] UI Error: ${msg}`); }
}

// Import Game and dependencies using dynamic import
async function runTest() {
    console.log('[TEST] Starting Tower Placement Verification...');

    try {
        const { Game } = await import('../js/Game.js');
        const { TowerConfig } = await import('../js/config/TowerConfig.js');

        const uiManager = new MockUIManager();
        const game = new Game(mockCanvas, uiManager);

        // Initialize game to set up dependencies
        game.setup();
        game.init();

        // Step 1: Check if "Big" tower exists in config
        if (!TowerConfig['Big']) {
            throw new Error('TowerConfig missing expected "Big" tower type');
        }
        console.log('[TEST] "Big" tower found in config.');

        // Step 2: Select Tower
        console.log('[TEST] Selecting "Big" tower...');
        game.selectTower('Big');

        if (game.selectedTowerType !== 'Big') {
            throw new Error(`Selection failed. Expected "Big", got "${game.selectedTowerType}"`);
        }
        console.log('[TEST] Tower selected successfully.');

        // Step 3: Attempt Place Tower
        const initialTowerCount = game.towerManager.getAll().length;
        const placeX = 100;
        const placeY = 100; // specific coords valid for placement

        console.log(`[TEST] Placing tower at (${placeX}, ${placeY})...`);
        game.placeTowerAt(placeX, placeY);

        const finalTowerCount = game.towerManager.getAll().length;
        const placedTower = game.towerManager.getAll()[0];

        // Step 4: Verification
        if (finalTowerCount !== initialTowerCount + 1) {
            throw new Error('Tower count did not increase. Placement failed.');
        }

        if (!placedTower) {
            throw new Error('Placed tower object is null.');
        }

        if (placedTower.type !== 'Big') {
            throw new Error(`Placed tower has wrong type. Expected "Big", got "${placedTower.type}"`);
        }

        console.log('[TEST] Tower placed successfully!');
        console.log('[TEST] Tower details:', {
            type: placedTower.type,
            level: placedTower.level,
            range: placedTower.range,
            damage: placedTower.damage
        });

        console.log('[TEST] VERIFICATION PASSED ✅');

    } catch (error) {
        console.error('[TEST] VERIFICATION FAILED ❌');
        console.error(error);
        process.exit(1);
    }
}

runTest();
