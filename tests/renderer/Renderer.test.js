import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockContext, mockCanvas, mockAssetLoader } from '../setup.js';
import { createMockEntity, createMockTower, createMockEnemy } from '../test-utils/helpers.js';
import { Renderer } from '../../js/renderer/Renderer.js';

describe('Renderer', () => {
  let renderer;

  beforeEach(() => {
    vi.clearAllMocks();
    renderer = new Renderer(mockCanvas, mockAssetLoader);
  });

  describe('initialization', () => {
    it('should initialize with canvas context', () => {
      expect(renderer.canvas).toBe(mockCanvas);
      expect(renderer.ctx).toBe(mockContext);
      expect(renderer.assetLoader).toBe(mockAssetLoader);
    });

    it('should set default rendering options', () => {
      expect(renderer.debug).toBe(false);
      expect(renderer.showGrid).toBe(false);
      expect(renderer.showColliders).toBe(false);
    });
  });

  describe('background rendering', () => {
    it('should draw background tiles when assets are available', () => {
      // Mock background tile asset
      mockAssetLoader.get.mockImplementation((key) => {
        if (key === 'BACKGROUND_TILE') {
          return { width: 32, height: 32 };
        }
        return null;
      });

      renderer.drawBackground();
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('should draw fallback background when assets are missing', () => {
      // Mock missing background tile
      mockAssetLoader.get.mockReturnValue(null);

      renderer.drawBackground();
      expect(mockContext.fillStyle).toBe('#2a2a2a');
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, mockCanvas.width, mockCanvas.height);
    });

    it('should draw path tiles when assets are available', () => {
      // Mock path asset
      mockAssetLoader.get.mockImplementation((key) => {
        if (key === 'PATH') {
          return { width: 64, height: 64 };
        }
        return null;
      });

      renderer.drawBackground();
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('should draw fallback path when assets are missing', () => {
      // Mock missing path asset
      mockAssetLoader.get.mockReturnValue(null);

      renderer.drawBackground();
      expect(mockContext.fillStyle).toBe('#3a3a3a');
      const pathWidth = 64;
      const pathY = (mockCanvas.height - pathWidth) / 2;
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, pathY, mockCanvas.width, pathWidth);
    });
  });

  describe('drawing methods', () => {
    it('should clear canvas', () => {
      renderer.clear();
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, mockCanvas.width, mockCanvas.height);
    });

    it('should draw entity with correct position and size', () => {
      const entity = createMockEntity('test', { 
        x: 100, 
        y: 100, 
        width: 32, 
        height: 32,
        getDrawData: () => ({
          type: 'TOWER_TEST',
          x: 100,
          y: 100,
          width: 32,
          height: 32
        })
      });
      
      renderer.drawEntity(entity);
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.translate).toHaveBeenCalledWith(116, 116); // center point (100 + 32/2)
      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
    });

    it('should draw tower with range indicator', () => {
      const tower = createMockTower('ranged', { 
        x: 100, 
        y: 100,
        range: 150,
        getDrawData: () => ({
          type: 'TOWER_RANGED',
          x: 100,
          y: 100,
          width: 32,
          height: 32,
          range: 150
        })
      });
      
      renderer.drawEntity(tower);
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.arc).toHaveBeenCalledWith(116, 116, 150, 0, Math.PI * 2); // center point with range
      expect(mockContext.fill).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should draw enemy with health bar', () => {
      const enemy = createMockEnemy('basic', { 
        x: 100, 
        y: 100, 
        health: 75,
        maxHealth: 100,
        getDrawData: () => ({
          type: 'ENEMY_BASIC',
          x: 100,
          y: 100,
          width: 32,
          height: 32,
          health: 75,
          maxHealth: 100
        })
      });
      
      renderer.drawEntity(enemy);
      expect(mockContext.fillRect).toHaveBeenCalledTimes(2); // background and health bar
      expect(mockContext.strokeRect).toHaveBeenCalled(); // health bar border
    });
  });

  describe('debug rendering', () => {
    beforeEach(() => {
      renderer.debug = true;
    });

    it('should draw grid when enabled', () => {
      renderer.showGrid = true;
      renderer.drawGrid();
      
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.strokeStyle).toBe('rgba(255, 255, 255, 0.1)');
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should draw colliders when enabled', () => {
      const entities = [createMockEntity('test')];
      renderer.drawColliders(entities);
      
      expect(mockContext.strokeStyle).toBe('rgba(255, 0, 0, 0.5)');
      expect(mockContext.strokeRect).toHaveBeenCalled();
    });

    it('should draw debug overlay with game state', () => {
      const gameState = {
        deltaTime: 16.67, // ~60fps
        debug: true,
        debugMenu: {
          getDebugState: () => ({
            showFPS: true,
            showEntityCount: true
          })
        },
        input: {
          getMousePosition: () => ({ x: 100, y: 100 })
        },
        gold: 100,
        lives: 3,
        currentWave: 1,
        hero: {
          health: 100,
          maxHealth: 100,
          range: 120,
          damage: 15
        },
        speedMultiplier: 1,
        paused: false,
        waveInProgress: false,
        canStartWave: true
      };

      renderer.drawDebugOverlay(gameState);
      expect(mockContext.fillStyle).toBe('white');
      expect(mockContext.fillText).toHaveBeenCalled();
    });
  });

  describe('sprite rendering', () => {
    it('should draw sprite when available', () => {
      const entity = createMockEntity('test', {
        getDrawData: () => ({
          type: 'TOWER_TEST',
          x: 100,
          y: 100,
          width: 32,
          height: 32
        })
      });
      
      renderer.drawEntity(entity);
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('should fallback to debug shape when sprite is missing', () => {
      const entity = createMockEntity('test', {
        getDrawData: () => ({
          type: 'MISSING_SPRITE',
          x: 100,
          y: 100,
          width: 32,
          height: 32
        })
      });
      
      renderer.drawEntity(entity);
      expect(mockContext.drawImage).not.toHaveBeenCalled();
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe('batch rendering', () => {
    it('should draw multiple entities efficiently', () => {
      const entities = [
        createMockEntity('test1', {
          getDrawData: () => ({
            type: 'TOWER_TEST',
            x: 0,
            y: 0,
            width: 32,
            height: 32
          })
        }),
        createMockEntity('test2', {
          getDrawData: () => ({
            type: 'ENEMY_TEST',
            x: 32,
            y: 32,
            width: 32,
            height: 32
          })
        })
      ];

      renderer.drawAll(entities);
      expect(mockContext.save).toHaveBeenCalledTimes(2);
      expect(mockContext.restore).toHaveBeenCalledTimes(2);
      expect(mockContext.drawImage).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should handle entity without getDrawData', () => {
      const entity = {};
      renderer.drawEntity(entity);
      expect(mockContext.save).not.toHaveBeenCalled();
    });

    it('should handle null drawData', () => {
      const entity = {
        getDrawData: () => null
      };
      renderer.drawEntity(entity);
      expect(mockContext.save).not.toHaveBeenCalled();
    });

    it('should handle non-array input in drawAll', () => {
      renderer.drawAll(null);
      renderer.drawAll(undefined);
      renderer.drawAll({});
      expect(mockContext.save).not.toHaveBeenCalled();
    });

    it('should handle non-array input in drawColliders', () => {
      renderer.drawColliders(null);
      renderer.drawColliders(undefined);
      renderer.drawColliders({});
      expect(mockContext.strokeRect).not.toHaveBeenCalled();
    });

    it('should handle disabled debug overlay', () => {
      const gameState = {
        debug: false,
        debugMenu: {
          getDebugState: () => ({
            showFPS: true,
            showEntityCount: true
          })
        }
      };
      renderer.drawDebugOverlay(gameState);
      expect(mockContext.fillText).not.toHaveBeenCalled();
    });

    it('should handle disabled debug features', () => {
      const gameState = {
        debug: true,
        debugMenu: {
          getDebugState: () => ({
            showFPS: false,
            showEntityCount: false
          })
        },
        input: {
          getMousePosition: () => ({ x: 0, y: 0 })
        },
        hero: {
          health: 100,
          maxHealth: 100
        }
      };
      renderer.drawDebugOverlay(gameState);
      expect(mockContext.fillText).not.toHaveBeenCalled();
    });
  });
});