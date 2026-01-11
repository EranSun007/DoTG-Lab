import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockGameState } from '../test-utils/helpers.js';
import { EnemyManager } from '../../src/managers/EnemyManager.js';
import { Enemy } from '../../js/entities/Enemy.js';
import { WaveConfig } from '../../js/config/WaveConfig.js';

// Mock dependencies needed by EnemyManager and Enemy
const mockGridManager = {
    isCellWalkable: vi.fn(() => true),
    isValidCell: vi.fn(() => true),
    // Add other methods if needed
};
const mockPathfinder = {
    findPath: vi.fn((startX, startY, endX, endY) => {
        // Return a simple mock path for most tests
        return [{ x: startX * 32 + 16, y: startY * 32 + 16 }, { x: endX * 32 + 16, y: endY * 32 + 16 }];
    })
};

// Helper to create data for addEnemy
function createEnemyData(type = 'basic', overrides = {}) {
    const defaults = {
        type: type,
        x: 0,
        y: 300,
        goalX: 800,
        goalY: 300,
        gridManager: mockGridManager,
        pathfinder: mockPathfinder,
    };
    return { ...defaults, ...overrides };
}

describe('EnemyManager', () => {
  let manager;
  let gameState;

  beforeEach(() => {
    gameState = createMockGameState();
    manager = new EnemyManager();
    // Clear mocks before each test
    vi.clearAllMocks();
    mockGridManager.isCellWalkable.mockClear();
    mockGridManager.isValidCell.mockClear();
    mockPathfinder.findPath.mockClear();
  });

  describe('enemy management', () => {
    it('should add and remove enemies', () => {
      const enemyData = createEnemyData('basic');
      const enemy = manager.addEnemy(enemyData);
      
      expect(enemy).toBeInstanceOf(Enemy);
      expect(manager.getAll()).toHaveLength(1);
      expect(manager.getById(enemy.id)).toBe(enemy);

      const removed = manager.removeEnemy(enemy.id);
      expect(removed).toBe(true);
      expect(manager.getAll()).toHaveLength(0);
      expect(manager.getById(enemy.id)).toBeUndefined();
    });

    it('should update all enemies and remove dead ones', () => {
      // Add two enemies
      const enemyData1 = createEnemyData('basic', { x: 0, y: 300 });
      const enemyData2 = createEnemyData('fast', { x: -50, y: 300 });
      const enemy1 = manager.addEnemy(enemyData1);
      const enemy2 = manager.addEnemy(enemyData2);

      // Mock the update method on the *actual* enemy instances
      vi.spyOn(enemy1, 'update');
      vi.spyOn(enemy2, 'update');
      // Mock isAlive - make enemy2 dead
      vi.spyOn(enemy1, 'isAlive').mockReturnValue(true);
      vi.spyOn(enemy2, 'isAlive').mockReturnValue(false);

      expect(manager.getAll()).toHaveLength(2);

      const deltaTime = 0.016;
      // Pass a gameState that includes mocks if needed by Enemy.update
      const mockGs = { ...createMockGameState(), gridManager: mockGridManager, pathfinder: mockPathfinder }; 
      manager.update(deltaTime, mockGs);

      // Check update was called
      expect(enemy1.update).toHaveBeenCalledWith(deltaTime, mockGs);
      expect(enemy2.update).toHaveBeenCalledWith(deltaTime, mockGs);

      // Check dead enemy was removed
      expect(manager.getAll()).toHaveLength(1);
      expect(manager.getById(enemy1.id)).toBe(enemy1);
      expect(manager.getById(enemy2.id)).toBeUndefined();
    });

    // Add test for getById when enemy doesn't exist
    it('getById should return undefined for non-existent id', () => {
        expect(manager.getById('nonexistent_id')).toBeUndefined();
    });

    // Add test for removeEnemy when id doesn't exist
     it('removeEnemy should return false for non-existent id', () => {
        expect(manager.removeEnemy('nonexistent_id')).toBe(false);
    });
  });

  describe('path management', () => {
    it('should request path from pathfinder when adding enemy', () => {
      const enemyData = createEnemyData('basic');
      const enemy = manager.addEnemy(enemyData);

      expect(enemy).not.toBeNull();
      // Check that the pathfinder was called with expected grid coordinates
      const cellSize = 32; // Assuming GRID_CONFIG.CELL_SIZE = 32 for test
      const startGridX = Math.floor(enemyData.x / cellSize);
      const startGridY = Math.floor(enemyData.y / cellSize);
      const endGridX = Math.floor(enemyData.goalX / cellSize);
      const endGridY = Math.floor(enemyData.goalY / cellSize);
      expect(mockPathfinder.findPath).toHaveBeenCalledWith(startGridX, startGridY, endGridX, endGridY);

      // Check that the enemy instance received a path (or null if pathfinder mock returns null)
      expect(enemy.path).toBeDefined(); // Path property should exist

      // Check if the mock path was assigned (depends on the mockPathfinder implementation)
      const mockReturnedPath = mockPathfinder.findPath(startGridX, startGridY, endGridX, endGridY);
      if (mockReturnedPath !== null) {
           expect(enemy.path).toEqual(mockReturnedPath);
           expect(enemy.targetPoint).toEqual(enemy.path[0]); // Should target first point
      } else {
           expect(enemy.path).toBeNull();
           expect(enemy.targetPoint).toBeNull();
      }

      expect(enemy.currentPathIndex).toBe(0);
    });
  });

  describe('state management', () => {
    it('should serialize state correctly', () => {
      manager.addEnemy(createEnemyData('basic')); // Add some state
      manager.addEnemy(createEnemyData('fast'));
      const state = manager.getState(); // Should be just Array<EnemyState>

      expect(state).toBeInstanceOf(Array);
      expect(state.length).toBe(2);

      // Check that enemies array contains enemy states
      if (state.length > 0) {
        expect(state[0]).toHaveProperty('id');
        expect(state[0]).toHaveProperty('health');
        expect(state[0]).toHaveProperty('x');
        expect(state[0]).toHaveProperty('y');
        // Check other properties serialized by Enemy.getState()
      }
    });

    it('should restore state correctly', () => {
      const enemyData1 = createEnemyData('basic', { id: 'test_e1' });
      const enemyData2 = createEnemyData('fast', { id: 'test_e2' });
      manager.addEnemy(enemyData1);
      manager.addEnemy(enemyData2);

      const originalState = manager.getState();

      const newManager = new EnemyManager();
      // Pass dependencies to syncState for the test environment
      newManager.syncState(originalState, {
        gridManager: mockGridManager,
        pathfinder: mockPathfinder
      });

      const restoredState = newManager.getState();

      // Basic check: same number of enemies with same IDs and types
      expect(restoredState.length).toBe(originalState.length);
      expect(restoredState[0].id).toBe(originalState[0].id);
      expect(restoredState[1].id).toBe(originalState[1].id);
      expect(restoredState[0].type).toBe(originalState[0].type);
      expect(restoredState[1].type).toBe(originalState[1].type);
      // Add more specific property checks if needed
    });
  });
}); 