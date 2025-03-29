import { Game } from './Game.js';
import { UIManager } from './managers/UIManager.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
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

    // Create canvas
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Game canvas not found!');
        return;
    }

    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 600;

    // Create and start game
    const game = new Game(canvas, uiManager);
    game.start();

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
}); 