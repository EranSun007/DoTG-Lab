import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Game } from '../../js/Game.js';
import { Hero } from '../../js/entities/Hero.js';
import { Tower } from '../../js/entities/Tower.js';
import { InputManager } from '../../js/managers/InputManager.js';
import { TowerConfig } from '../../js/config/TowerConfig.js'; // Needed for tower creation

// Mock dependencies
const mockCanvas = {
    width: 800,
    height: 600,
    getContext: vi.fn(() => ({
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        strokeRect: vi.fn(), // Needed for debug bounds drawing
        fillText: vi.fn(), // Needed for debug overlay
    })),
    getBoundingClientRect: vi.fn(() => ({ // Needed for input manager offset calc
        left: 0,
        top: 0,
        width: 800,
        height: 600,
    })),
     addEventListener: vi.fn(), // Needed for game init
     removeEventListener: vi.fn(),
};

const mockUIManager = {
    bindTowerButtons: vi.fn(),
    bindControlButtons: vi.fn(),
    updateGold: vi.fn(),
    updateLives: vi.fn(),
    updateWave: vi.fn(),
    updateGameSpeed: vi.fn(),
    setStartWaveButtonEnabled: vi.fn(),
    flashMessage: vi.fn(),
    setSelectedTower: vi.fn(),
    setPaused: vi.fn(),
    showGameOver: vi.fn(),
     updateWaveNumber: vi.fn(),
     toggleStartWaveButton: vi.fn(),
};

// Mock Debug utility if it causes issues during tests (e.g., DOM manipulation)
vi.mock('../../js/utils/Debug.js', () => ({
    Debug: {
        log: vi.fn(), // console.log,
        warn: vi.fn(), // console.warn,
        error: vi.fn(), // console.error,
        init: vi.fn(),
        toggle: vi.fn(),
        update: vi.fn(),
        getState: vi.fn(() => ({})), // Provide default state if needed
    }
}));


describe('Game Collision Detection', () => {
    let game;
    let mockInputManager;

    beforeEach(() => {
        // Reset mocks if needed (might not be necessary with vi.fn() default behavior)
        vi.clearAllMocks();

        game = new Game(mockCanvas, mockUIManager);

        // Create a mock InputManager instance
        // We need to mock the internal state/methods used by handleHeroMovement
        mockInputManager = {
            _keysDown: new Set(),
            _keysJustPressed: new Set(),
            isKeyDown: vi.fn((key) => mockInputManager._keysDown.has(key)),
            getMousePosition: vi.fn(() => ({ x: 0, y: 0 })), // Default mouse pos
            update: vi.fn(), // Needs to exist but does nothing in mock
        };
        game.inputManager = mockInputManager; // Replace the real InputManager

        // Set a default hero position for tests
        game.hero.x = 100;
        game.hero.y = 100;
        game.hero.speed = 100; // Use a predictable speed (pixels per second)
        game.speedMultiplier = 1; // Ensure default speed

        // Clear default obstacles and towers for controlled testing
        game.obstacles = [];
        game.towerManager.towers.clear();
    });

    // --- isColliding Tests ---
    describe('isColliding Utility', () => {
        it('should return true for overlapping rectangles', () => {
            const rect1 = { x: 10, y: 10, width: 50, height: 50 };
            const rect2 = { x: 40, y: 40, width: 50, height: 50 };
            expect(game.isColliding(rect1, rect2)).toBe(true);
        });

        it('should return true for touching rectangles', () => {
            const rect1 = { x: 10, y: 10, width: 50, height: 50 };
            const rect2 = { x: 60, y: 10, width: 50, height: 50 }; // Touching on right edge
            expect(game.isColliding(rect1, rect2)).toBe(true);
        });

         it('should return true when one rectangle is inside another', () => {
            const rect1 = { x: 10, y: 10, width: 100, height: 100 };
            const rect2 = { x: 20, y: 20, width: 50, height: 50 };
            expect(game.isColliding(rect1, rect2)).toBe(true);
            expect(game.isColliding(rect2, rect1)).toBe(true);
        });

        it('should return false for non-overlapping rectangles', () => {
            const rect1 = { x: 10, y: 10, width: 50, height: 50 };
            const rect2 = { x: 70, y: 70, width: 50, height: 50 };
            expect(game.isColliding(rect1, rect2)).toBe(false);
        });

        it('should return false if one rect is null or undefined', () => {
             const rect1 = { x: 10, y: 10, width: 50, height: 50 };
             expect(game.isColliding(rect1, null)).toBe(false);
             expect(game.isColliding(null, rect1)).toBe(false);
             expect(game.isColliding(undefined, rect1)).toBe(false);
        });
    });

    // --- handleHeroMovement Tests ---
    describe('handleHeroMovement Collision', () => {
        const fixedDeltaTime = 0.1; // 100ms delta time for predictable movement

        it('should stop hero at left canvas boundary', () => {
            game.hero.x = 10;
            game.hero.y = 100;
            mockInputManager._keysDown.add('ArrowLeft');
            game.handleHeroMovement(fixedDeltaTime);
            // Expected movement = speed * deltaTime = 100 * 0.1 = 10
            // Hero starts at 10, wants to move -10 to 0. Should stop exactly at 0.
            expect(game.hero.x).toBe(0);
            expect(game.hero.y).toBe(100); // Y should not change
        });

        it('should stop hero at right canvas boundary', () => {
            game.hero.x = mockCanvas.width - game.hero.width - 10; // 10px from right edge
            game.hero.y = 100;
             mockInputManager._keysDown.add('ArrowRight');
             game.handleHeroMovement(fixedDeltaTime);
             // Expected move = 10. Wants to move to right_edge - 10 + 10 = right_edge
             // Should stop exactly at right_edge - width
             expect(game.hero.x).toBe(mockCanvas.width - game.hero.width);
             expect(game.hero.y).toBe(100);
        });

        it('should stop hero at top canvas boundary', () => {
            game.hero.x = 100;
            game.hero.y = 10;
            mockInputManager._keysDown.add('ArrowUp');
             game.handleHeroMovement(fixedDeltaTime);
             expect(game.hero.x).toBe(100);
             expect(game.hero.y).toBe(0);
        });

         it('should stop hero at bottom canvas boundary', () => {
            game.hero.x = 100;
            game.hero.y = mockCanvas.height - game.hero.height - 10; // 10px from bottom edge
             mockInputManager._keysDown.add('ArrowDown');
             game.handleHeroMovement(fixedDeltaTime);
             expect(game.hero.x).toBe(100);
             expect(game.hero.y).toBe(mockCanvas.height - game.hero.height);
         });

        it('should stop hero when moving right into a static obstacle', () => {
            game.hero.x = 100;
            game.hero.y = 100;
            const obstacle = { x: 150, y: 90, width: 50, height: 70 }; // Obstacle to the right
            game.obstacles.push(obstacle);
            mockInputManager._keysDown.add('ArrowRight');
            game.handleHeroMovement(fixedDeltaTime);
            // Expected move = 10. Hero width = 48.
            // Hero wants to move from 100 to 110. Obstacle starts at 150.
            // Collision happens when hero.x + hero.width > obstacle.x
            // In this case, 100 + 48 = 148 initially.
            // Potential X = 110. 110 + 48 = 158. This IS > 150. Collision.
            // Expected final position: obstacle.x - hero.width = 150 - 48 = 102
            expect(game.hero.x).toBeCloseTo(obstacle.x - game.hero.width); // Use toBeCloseTo for potential float issues
            expect(game.hero.y).toBe(100); // Y should not change
        });

         it('should stop hero when moving left into a static obstacle', () => {
            const obstacle = { x: 50, y: 90, width: 50, height: 70 }; // Obstacle to the left
            game.obstacles.push(obstacle);
             game.hero.x = obstacle.x + obstacle.width + 10; // Start 10px right of obstacle
             game.hero.y = 100;
             mockInputManager._keysDown.add('ArrowLeft');
             game.handleHeroMovement(fixedDeltaTime);
            // Expected move = -10. Obstacle ends at 50+50=100. Hero starts at 110.
            // Potential X = 100. Collision happens when hero.x < obstacle.x + obstacle.width
            // 100 < 100 is false, but the logic adjusts to touch exactly.
             // Expected final position: obstacle.x + obstacle.width = 50 + 50 = 100
             expect(game.hero.x).toBeCloseTo(obstacle.x + obstacle.width);
             expect(game.hero.y).toBe(100);
         });

         it('should stop hero when moving down into a static obstacle', () => {
            game.hero.x = 100;
            game.hero.y = 100;
            const obstacle = { x: 90, y: 150, width: 70, height: 50 }; // Obstacle below
            game.obstacles.push(obstacle);
            mockInputManager._keysDown.add('ArrowDown');
            game.handleHeroMovement(fixedDeltaTime);
            // Expected move = 10. Hero height = 48.
            // Potential Y = 110. Collision: 110 + 48 > 150. Yes (158 > 150).
            // Expected final Y: obstacle.y - hero.height = 150 - 48 = 102
            expect(game.hero.x).toBe(100);
            expect(game.hero.y).toBeCloseTo(obstacle.y - game.hero.height);
         });

          it('should stop hero when moving up into a static obstacle', () => {
            const obstacle = { x: 90, y: 50, width: 70, height: 50 }; // Obstacle above
            game.obstacles.push(obstacle);
             game.hero.x = 100;
             game.hero.y = obstacle.y + obstacle.height + 10; // Start 10px below obstacle
             mockInputManager._keysDown.add('ArrowUp');
             game.handleHeroMovement(fixedDeltaTime);
             // Expected move = -10. Obstacle ends at 50+50=100. Hero starts at 110.
             // Potential Y = 100. Collision: 100 < 100 is false, but adjusted to touch.
             // Expected final Y: obstacle.y + obstacle.height = 50 + 50 = 100
             expect(game.hero.x).toBe(100);
             expect(game.hero.y).toBeCloseTo(obstacle.y + obstacle.height);
          });

          it('should stop hero when moving right into a tower', () => {
             game.hero.x = 100;
             game.hero.y = 100;
             // TowerConfig needed for tower creation even if properties overridden
             const towerData = { ...TowerConfig.ranged, x: 150, y: 90, width: 40, height: 40 };
             const tower = game.towerManager.addEntity(towerData);
             mockInputManager._keysDown.add('ArrowRight');
             game.handleHeroMovement(fixedDeltaTime);
             // Expected move = 10. Hero width = 48. Tower starts at 150.
             // Potential X = 110. Collision: 110 + 48 > 150. Yes.
             // Expected final X: tower.x - hero.width = 150 - 48 = 102
             expect(game.hero.x).toBeCloseTo(tower.x - game.hero.width);
             expect(game.hero.y).toBe(100);
         });

        // --- Sliding Tests ---
         it('should slide down along a vertical wall when moving right and down', () => {
            game.hero.x = 100;
            game.hero.y = 100;
             // Tall vertical obstacle to the right
             const obstacle = { x: 150, y: 50, width: 20, height: 150 };
             game.obstacles.push(obstacle);
             mockInputManager._keysDown.add('ArrowRight');
             mockInputManager._keysDown.add('ArrowDown');
             game.handleHeroMovement(fixedDeltaTime);

            // Expected normalized move amount per axis (approx)
            const moveAmount = game.hero.speed * fixedDeltaTime; // 100 * 0.1 = 10
            const diagMove = moveAmount / Math.sqrt(2); // ~7.07

             // X movement should be blocked by the wall at obstacle.x - hero.width = 150 - 48 = 102
             expect(game.hero.x).toBeCloseTo(obstacle.x - game.hero.width);
             // Y movement should be allowed (no collision on Y axis initially)
             // Initial Y = 100. Potential Y = 100 + diagMove = ~107.07
             expect(game.hero.y).toBeCloseTo(100 + diagMove);
         });

          it('should slide right along a horizontal wall when moving right and down', () => {
            game.hero.x = 100;
            game.hero.y = 100;
              // Wide horizontal obstacle below
              const obstacle = { x: 50, y: 150, width: 150, height: 20 };
              game.obstacles.push(obstacle);
              mockInputManager._keysDown.add('ArrowRight');
              mockInputManager._keysDown.add('ArrowDown');
              game.handleHeroMovement(fixedDeltaTime);

             const moveAmount = game.hero.speed * fixedDeltaTime;
             const diagMove = moveAmount / Math.sqrt(2); // ~7.07

              // X movement should be allowed
              expect(game.hero.x).toBeCloseTo(100 + diagMove);
              // Y movement should be blocked by the obstacle at obstacle.y - hero.height = 150 - 48 = 102
              expect(game.hero.y).toBeCloseTo(obstacle.y - game.hero.height);
          });

    });

     // --- Hero.getBounds Test ---
     describe('Hero.getBounds', () => {
         it('should return the correct bounds object', () => {
             const hero = new Hero({ x: 50, y: 60, width: 32, height: 32 });
             const bounds = hero.getBounds();
             expect(bounds).toEqual({ x: 50, y: 60, width: 32, height: 32 });
         });
     });
}); 