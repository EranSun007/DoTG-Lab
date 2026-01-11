import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Game } from '../../src/core/Game.js';
import { Hero } from '../../src/entities/players/Hero.js';
import { Tower } from '../../src/entities/towers/Tower.js';
import { InputManager } from '../../src/managers/InputManager.js';
import { TowerConfig } from '../../src/config/TowerConfig.js'; // Needed for tower creation
import { GRID_CONFIG } from '../../src/config/GridConfig.js'; // Import for grid calculations

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


describe('Game Logic', () => { // Renamed top-level describe
    let game;
    let mockInputManager;

    beforeEach(() => {
        vi.clearAllMocks();

        game = new Game(mockCanvas, mockUIManager);

        // Mock InputManager
        mockInputManager = {
            _keysDown: new Set(),
            isKeyDown: vi.fn((key) => mockInputManager._keysDown.has(key)),
            getMousePosition: vi.fn(() => ({ x: 0, y: 0 })),
            update: vi.fn(),
        };
        game.inputManager = mockInputManager;

        // Mock GridManager methods used by handleHeroMovement
        game.gridManager = {
             // ... (keep other GridManager methods if needed by other parts of Game)
             cells: [], // Add basic structure if needed
             initializeGrid: vi.fn(), // Mock initialization
             getCellFromScreenPosition: vi.fn((x, y) => {
                const gridX = Math.floor(x / GRID_CONFIG.CELL_SIZE);
                const gridY = Math.floor(y / GRID_CONFIG.CELL_SIZE);
                 if (gridX >= 0 && gridX < GRID_CONFIG.GRID_WIDTH && gridY >= 0 && gridY < GRID_CONFIG.GRID_HEIGHT) {
                    return { x: gridX, y: gridY }; // Return mock cell data
                 }
                 return null;
             }),
             getScreenPositionFromCell: vi.fn(cell => ({ x: cell.x * GRID_CONFIG.CELL_SIZE, y: cell.y * GRID_CONFIG.CELL_SIZE })),
             isValidCell: vi.fn((x, y) => x >= 0 && x < GRID_CONFIG.GRID_WIDTH && y >= 0 && y < GRID_CONFIG.GRID_HEIGHT),
             isCellWalkable: vi.fn(() => true), // Default to walkable
             setCellTerrain: vi.fn(),
             setCellOccupied: vi.fn(),
             clearCell: vi.fn(),
             updateHoveredCell: vi.fn(),
             draw: vi.fn(),
        };

        // Mock Hero methods related to movement state
        // Spy on moveToCell to check if it's called
        vi.spyOn(game.hero, 'moveToCell');
        // Allow setting initial state
        game.hero.moving = false;
        game.hero.x = 3 * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2; // Start roughly at cell [3, 3]
        game.hero.y = 3 * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2;
        game.hero.targetX = game.hero.x;
        game.hero.targetY = game.hero.y;


        // Clear default obstacles for controlled testing
        game.obstacles = [];
    });

    // --- isColliding Tests (Keep as is) ---
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

    // --- Grid Movement Tests ---
    describe('handleHeroMovement (Grid-Based)', () => {
        const deltaTime = 0.1; // deltaTime isn't directly used for initiating move, but pass it
        let initialGridX, initialGridY;

        beforeEach(() => {
            // Recalculate initial grid cell based on potentially modified hero position
            initialGridX = Math.floor(game.hero.x / GRID_CONFIG.CELL_SIZE);
            initialGridY = Math.floor(game.hero.y / GRID_CONFIG.CELL_SIZE);
            game.hero.moving = false; // Ensure hero starts stationary
            game.hero.moveToCell.mockClear(); // Clear spy calls
        });

        it('should not call moveToCell if no input is pressed', () => {
            game.handleHeroMovement(deltaTime);
            expect(game.hero.moveToCell).not.toHaveBeenCalled();
        });

        it('should not call moveToCell if hero is already moving', () => {
            game.hero.moving = true;
            mockInputManager._keysDown.add('ArrowRight');
            game.handleHeroMovement(deltaTime);
            expect(game.hero.moveToCell).not.toHaveBeenCalled();
        });

        it('should call moveToCell with correct target when moving right into walkable cell', () => {
            const targetX = initialGridX + 1;
            const targetY = initialGridY;
            game.gridManager.isCellWalkable.mockReturnValue(true); // Ensure target is walkable
            mockInputManager._keysDown.add('ArrowRight');

            game.handleHeroMovement(deltaTime);

            expect(game.gridManager.isCellWalkable).toHaveBeenCalledWith(targetX, targetY);
            expect(game.hero.moveToCell).toHaveBeenCalledTimes(1);
            expect(game.hero.moveToCell).toHaveBeenCalledWith(targetX, targetY);
        });

        it('should call moveToCell with correct target when moving left into walkable cell', () => {
            const targetX = initialGridX - 1;
            const targetY = initialGridY;
            game.gridManager.isCellWalkable.mockReturnValue(true);
            mockInputManager._keysDown.add('ArrowLeft');
            game.handleHeroMovement(deltaTime);
            expect(game.gridManager.isCellWalkable).toHaveBeenCalledWith(targetX, targetY);
            expect(game.hero.moveToCell).toHaveBeenCalledWith(targetX, targetY);
        });

         it('should call moveToCell with correct target when moving up into walkable cell', () => {
            const targetX = initialGridX;
            const targetY = initialGridY - 1;
            game.gridManager.isCellWalkable.mockReturnValue(true);
            mockInputManager._keysDown.add('ArrowUp');
            game.handleHeroMovement(deltaTime);
            expect(game.gridManager.isCellWalkable).toHaveBeenCalledWith(targetX, targetY);
            expect(game.hero.moveToCell).toHaveBeenCalledWith(targetX, targetY);
        });

         it('should call moveToCell with correct target when moving down into walkable cell', () => {
            const targetX = initialGridX;
            const targetY = initialGridY + 1;
            game.gridManager.isCellWalkable.mockReturnValue(true);
            mockInputManager._keysDown.add('ArrowDown');
            game.handleHeroMovement(deltaTime);
            expect(game.gridManager.isCellWalkable).toHaveBeenCalledWith(targetX, targetY);
            expect(game.hero.moveToCell).toHaveBeenCalledWith(targetX, targetY);
        });

        it('should NOT call moveToCell if target cell is blocked by GridManager', () => {
            const targetX = initialGridX + 1;
            const targetY = initialGridY;
            game.gridManager.isCellWalkable.mockReturnValue(false); // Mock cell as unwalkable
            mockInputManager._keysDown.add('ArrowRight');

            game.handleHeroMovement(deltaTime);

            expect(game.gridManager.isCellWalkable).toHaveBeenCalledWith(targetX, targetY);
            expect(game.hero.moveToCell).not.toHaveBeenCalled();
        });

        it('should NOT call moveToCell if target cell is blocked by a static obstacle', () => {
            const targetX = initialGridX + 1;
            const targetY = initialGridY;
            const targetCellScreenX = targetX * GRID_CONFIG.CELL_SIZE;
            const targetCellScreenY = targetY * GRID_CONFIG.CELL_SIZE;

            // Add an obstacle that overlaps the target cell
            game.obstacles.push({
                x: targetCellScreenX + 5, // Slightly inside the target cell
                y: targetCellScreenY + 5,
                width: GRID_CONFIG.CELL_SIZE, height: GRID_CONFIG.CELL_SIZE,
                type: 'wall'
            });

            game.gridManager.isCellWalkable.mockReturnValue(true); // Grid says it's walkable
            mockInputManager._keysDown.add('ArrowRight');

            game.handleHeroMovement(deltaTime);

            expect(game.gridManager.isCellWalkable).toHaveBeenCalledWith(targetX, targetY);
            // isColliding check inside handleHeroMovement should prevent the call
            expect(game.hero.moveToCell).not.toHaveBeenCalled();
        });

        it('should NOT call moveToCell if target cell is outside grid bounds', () => {
            // Position hero near the left edge
            game.hero.x = 0 + GRID_CONFIG.CELL_SIZE / 2;
            game.hero.y = 3 * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2;
            initialGridX = 0;
            initialGridY = 3;
            const targetX = -1; // Target outside bounds
            const targetY = initialGridY;

            // Make gridManager correctly report invalid cell as unwalkable
            game.gridManager.isCellWalkable.mockImplementation((x, y) => {
                if (!game.gridManager.isValidCell(x,y)) return false;
                return true; // Other cells are walkable
            });

            mockInputManager._keysDown.add('ArrowLeft');
            game.handleHeroMovement(deltaTime);

            expect(game.gridManager.isCellWalkable).toHaveBeenCalledWith(targetX, targetY);
            expect(game.hero.moveToCell).not.toHaveBeenCalled();
        });
    });

    // --- Smooth AABB Movement Tests (Can be removed or kept for reference) ---
    /*
    describe('handleHeroMovement Collision (Smooth AABB - DEPRECATED)', () => {
       // ... (old smooth movement tests) ...
    });
    */

    // --- Hero.getBounds Test (Keep as is) ---
    describe('Hero.getBounds', () => {
        it('should return the correct bounds object', () => {
            const hero = new Hero({ x: 50, y: 60, width: 32, height: 32 });
            const bounds = hero.getBounds();
            expect(bounds).toEqual({ x: 50, y: 60, width: 32, height: 32 });
        });
    });
}); 