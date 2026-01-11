import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockContext, mockCanvas, mockAssetLoader } from '../setup.js';
import { createMockEntity, createMockTower, createMockEnemy } from '../test-utils/helpers.js';
import { Renderer } from '../../src/rendering/Renderer.js';
import { AssetLoader } from '../../src/utils/AssetLoader.js';
import { GameConstants } from '../../src/config/GameConstants.js';

vi.mock('../../js/utils/AssetLoader.js');

describe('Renderer', () => {
  let renderer;
  let mockAssetLoaderInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAssetLoaderInstance = new AssetLoader();
    renderer = new Renderer(mockCanvas, mockAssetLoaderInstance);
  });

  describe('initialization', () => {
    it('should initialize with canvas context', () => {
      expect(renderer.canvas).toBe(mockCanvas);
      expect(renderer.ctx).toBe(mockContext);
      expect(renderer.assetLoader).toBe(mockAssetLoaderInstance);
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('should set default rendering options', () => {
      expect(renderer.debug).toBe(false);
      expect(renderer.showGrid).toBe(false);
      expect(renderer.showColliders).toBe(false);
    });
  });

  describe('main render method', () => {
    let mockGameState;

    beforeEach(() => {
      // Basic gameState for rendering tests
      mockGameState = {
          debug: false,
          hero: { id: 'h1', getDrawData: () => ({ type: 'HERO', x: 10, y: 10, width: 30, height: 30 }) },
          enemies: [
              { id: 'e1', getDrawData: () => ({ type: 'ENEMY', x: 50, y: 50, width: 20, height: 20 }) }
          ],
          towers: [],
          projectiles: [],
          obstacles: [
              { x: 100, y: 100, width: 50, height: 50, color: 'gray' }
          ],
          // Add mocks for properties used by drawDebugOverlay
          debugMenu: {
              getDebugState: vi.fn(() => ({ showFPS: true, /* other flags */ })) // Mock the state object it returns
          },
          input: {
              getMousePosition: vi.fn(() => ({ x: 1, y: 1 })), // Mock mouse position
              // Add other input methods if drawDebugOverlay uses them
          },
          deltaTime: 0.016, // Mock deltaTime if needed by overlay
          currentWave: 1, // Mock wave number if needed
          lives: 3, // Mock lives if needed
          gold: 100 // Mock gold if needed
      };
      // Spy on internal draw methods
      vi.spyOn(renderer, 'clear');
      vi.spyOn(renderer, 'drawWorldBackground');
      vi.spyOn(renderer, 'drawPath');
      vi.spyOn(renderer, 'drawGrid');
      vi.spyOn(renderer, 'drawObstacles');
      vi.spyOn(renderer, 'drawAll');
      vi.spyOn(renderer, 'drawEntity');
      vi.spyOn(renderer.camera, 'update');
      vi.spyOn(renderer.camera, 'applyTransform');
    });

    it('should call camera update and applyTransform', () => {
        renderer.render(mockGameState, 0.016);
        expect(renderer.camera.update).toHaveBeenCalledWith(0.016);
        expect(renderer.camera.applyTransform).toHaveBeenCalled();
    });

    it('should call core drawing methods in order', () => {
      renderer.render(mockGameState, 0.016);
      expect(renderer.clear).toHaveBeenCalledOnce();
      // Check calls inside the save/restore block
      expect(renderer.drawWorldBackground).toHaveBeenCalledOnce();
      expect(renderer.drawPath).toHaveBeenCalledOnce();
      expect(renderer.drawGrid).toHaveBeenCalledOnce();
      expect(renderer.drawObstacles).toHaveBeenCalledWith(mockGameState.obstacles);
      expect(renderer.drawAll).toHaveBeenCalledWith(mockGameState.enemies);
      expect(renderer.drawAll).toHaveBeenCalledWith(mockGameState.towers);
      expect(renderer.drawAll).toHaveBeenCalledWith(mockGameState.projectiles);
      expect(renderer.drawEntity).toHaveBeenCalledWith(mockGameState.hero);
    });

     it('should call drawDebugOverlay only when debug is true', () => {
          vi.spyOn(renderer, 'drawDebugOverlay');
          mockGameState.debug = true;
          renderer.render(mockGameState, 0.016);
          expect(renderer.drawDebugOverlay).toHaveBeenCalled();
          
          renderer.drawDebugOverlay.mockClear();
          mockGameState.debug = false;
          renderer.render(mockGameState, 0.016);
          expect(renderer.drawDebugOverlay).not.toHaveBeenCalled();
      });
  });

  describe('drawing methods', () => {
    it('should clear canvas', () => {
      renderer.clear();
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, mockCanvas.width, mockCanvas.height);
    });

    it('should draw entity using drawImage when asset exists', () => {
      const entity = {
        getDrawData: () => ({
          type: 'ENEMY_BASIC',
          x: 100,
          y: 100,
          width: 32,
          height: 32,
        }),
      };
      
      // Mock a complete image with naturalWidth > 0
      const mockImage = { 
        width: 32, 
        height: 32, 
        isMockAsset: true, 
        complete: true, 
        naturalWidth: 32 
      };
      mockAssetLoaderInstance.get.mockReturnValue(mockImage);

      renderer.drawEntity(entity);
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.translate).not.toHaveBeenCalled();
      expect(mockContext.drawImage).toHaveBeenCalledWith(
        expect.objectContaining({ isMockAsset: true }),
        100, 100, 32, 32
      );
      expect(mockContext.fillRect).not.toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
    });

    it('should draw entity using fillRect when asset is missing', () => {
      const entity = {
        getDrawData: () => ({
          type: 'ENEMY_UNKNOWN',
          x: 150,
          y: 150,
          width: 40,
          height: 40,
        }),
      };
      mockAssetLoaderInstance.get.mockReturnValue(null);

      renderer.drawEntity(entity);
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.drawImage).not.toHaveBeenCalled();
      expect(mockContext.fillRect).toHaveBeenCalledWith(150, 150, 40, 40);
      expect(mockContext.fillStyle).toBe(renderer.getFallbackColor('ENEMY_UNKNOWN'));
      expect(mockContext.restore).toHaveBeenCalled();
    });

    it('should draw tower with range indicator', () => {
      const tower = {
        getDrawData: () => ({
          type: 'TOWER_RANGED',
          x: 100,
          y: 100,
          width: 32,
          height: 32,
          range: 150,
        }),
      };
      mockAssetLoaderInstance.get.mockReturnValue({ width: 32, height: 32 });

      renderer.drawEntity(tower);
      expect(mockContext.beginPath).toHaveBeenCalledTimes(1);
      expect(mockContext.arc).toHaveBeenCalledWith(100 + 16, 100 + 16, 150, 0, Math.PI * 2);
      expect(mockContext.fill).toHaveBeenCalledTimes(1);
      expect(mockContext.stroke).toHaveBeenCalledTimes(1);
    });

    it('should draw enemy with health bar', () => {
      const enemy = {
        getDrawData: () => ({
          type: 'ENEMY_BASIC',
          x: 200,
          y: 200,
          width: 40,
          height: 40,
          health: 75,
          maxHealth: 100,
        }),
      };
      mockAssetLoaderInstance.get.mockReturnValue(null);

      renderer.drawEntity(enemy);
      expect(mockContext.fillRect).toHaveBeenCalledTimes(3);

      const healthBarY = 200 - GameConstants.HEALTH_BAR_OFFSET;
      const healthPercent = 0.75;
      const bgCall = mockContext.fillRect.mock.calls.find(call => call[1] === healthBarY && call[2] === 40);
      const healthCall = mockContext.fillRect.mock.calls.find(call => call[1] === healthBarY && call[2] === 40 * healthPercent);

      expect(bgCall).toBeDefined();
      expect(healthCall).toBeDefined();
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
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should draw colliders when enabled', () => {
      renderer.showColliders = true;
      const entities = [{ getDrawData: () => ({ x: 10, y: 10, width: 10, height: 10 }) }];
      renderer.drawColliders(entities);
      
      expect(mockContext.strokeRect).toHaveBeenCalledWith(10, 10, 10, 10);
    });

    it('should draw debug overlay with game state', () => {
      const gameState = {
        deltaTime: 0.016,
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
      const entity = { getDrawData: () => ({ type: 'HERO', x: 50, y: 50, width: 30, height: 30 }) };
      const mockSprite = { 
        width: 30, 
        height: 30, 
        isMockAsset: true, 
        complete: true, 
        naturalWidth: 30 
      };
      mockAssetLoaderInstance.get.mockReturnValue(mockSprite);

      renderer.drawEntity(entity);
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockSprite, 50, 50, 30, 30);
      expect(mockContext.fillRect).not.toHaveBeenCalled();
    });

    it('should fallback to debug shape when sprite is missing', () => {
      const entity = { getDrawData: () => ({ type: 'HERO_MISSING', x: 60, y: 60, width: 35, height: 35 }) };
      mockAssetLoaderInstance.get.mockReturnValue(null);

      renderer.drawEntity(entity);
      expect(mockContext.drawImage).not.toHaveBeenCalled();
      expect(mockContext.fillRect).toHaveBeenCalledWith(60, 60, 35, 35);
      expect(mockContext.fillStyle).toBe(renderer.getFallbackColor('HERO_MISSING'));
    });
  });

  describe('batch rendering', () => {
    it('should call drawEntity for multiple entities via drawAll', () => {
      const entities = [
        { getDrawData: () => ({ type: 'E1', x: 1, y: 1, width: 10, height: 10 }) },
        { getDrawData: () => ({ type: 'E2', x: 2, y: 2, width: 10, height: 10 }) },
      ];
      const drawEntitySpy = vi.spyOn(renderer, 'drawEntity');

      renderer.drawAll(entities);

      expect(drawEntitySpy).toHaveBeenCalledTimes(entities.length);
      expect(drawEntitySpy).toHaveBeenCalledWith(entities[0]);
      expect(drawEntitySpy).toHaveBeenCalledWith(entities[1]);

      drawEntitySpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle entity without getDrawData', () => {
      const badEntity = { x: 0, y: 0 };
      renderer.drawEntity(badEntity);
      expect(mockContext.drawImage).not.toHaveBeenCalled();
      expect(mockContext.fillRect).not.toHaveBeenCalled();
    });

    it('should handle null drawData', () => {
      const entity = { getDrawData: () => null };
      renderer.drawEntity(entity);
      expect(mockContext.drawImage).not.toHaveBeenCalled();
      expect(mockContext.fillRect).not.toHaveBeenCalled();
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