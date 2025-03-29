import { Game } from './Game.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    // Create and start game
    const game = new Game(canvas);
    game.start();
}); 