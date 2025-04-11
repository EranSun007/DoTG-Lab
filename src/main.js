import { Game } from './core/Game.js';
import { UIManager } from './ui/UIManager.js';
import { GameConstants } from './config/GameConstants.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('DOM loaded, initializing game...');
        
        // Initialize UI Manager
        const uiManager = new UIManager();
        uiManager.init({
            goldDisplay: document.getElementById('gold-display'),
            livesDisplay: document.getElementById('lives-display'),
            waveNumberDisplay: document.getElementById('wave-number-display'),
            startWaveButton: document.getElementById('start-wave-button'),
            towerButtons: {
                ranged: document.getElementById('select-tower-ranged'),
                aoe: document.getElementById('select-tower-aoe')
            }
        });

        // Get canvas element
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }

        // Set canvas size
        canvas.width = GameConstants.CANVAS_WIDTH;
        canvas.height = GameConstants.CANVAS_HEIGHT;

        // Create and initialize game
        console.log('Creating game instance...');
        const game = new Game(canvas, uiManager);
        
        // Store game instance for debugging
        window.game = game;
        canvas.__game = game;
        
        console.log('Starting game initialization...');
        await game.initialize().catch(error => {
            console.error('Game initialization failed:', error);
            throw error;
        });
        
        console.log('Game initialization successful');

        // Bind UI event handlers
        uiManager.bindTowerButtons({
            ranged: () => game.selectTower('ranged'),
            aoe: () => game.selectTower('aoe')
        });

        uiManager.bindStartWave(() => game.startWave());

        // Initial UI state
        uiManager.updateGold(game.gold);
        uiManager.updateLives(game.lives);
        uiManager.updateWaveNumber(game.currentWave);
        uiManager.toggleStartWaveButton(game.canStartWave);
        
        console.log('Game setup complete');
    } catch (error) {
        console.error('Failed to start game:', error);
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.textContent = 'Failed to start game. Please refresh the page.';
            loadingOverlay.style.backgroundColor = '#660000';
        }
    }
}); 