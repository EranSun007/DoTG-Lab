import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockContext, mockCanvas } from '../setup.js';
import { createMockEntity, createMockTower, createMockEnemy } from '../test-utils/helpers.js';
import { Renderer } from '../../js/renderer/Renderer.js';

describe('Renderer', () => {
  let renderer;

  beforeEach(() => {
    renderer = new Renderer(mockCanvas);
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with canvas context', () => {
      expect(renderer.ctx).toBe(mockContext);
      expect(renderer.canvas).toBe(mockCanvas);
    });

    it('should set default rendering options', () => {
      expect(renderer.debug).toBe(false);
      expect(renderer.showGrid).toBe(false);
      expect(renderer.showColliders).toBe(false);
    });
  });

  describe('drawing methods', () => {
    it('should clear canvas', () => {
      renderer.clear();
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, mockCanvas.width, mockCanvas.height);
    });

    it('should draw entity with correct position and size', () => {
      const entity = createMockEntity('test', { x: 100, y: 100, width: 32, height: 32 });
      renderer.drawEntity(entity);
      
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.translate).toHaveBeenCalledWith(100, 100);
      expect(mockContext.fillRect).toHaveBeenCalledWith(-16, -16, 32, 32);
      expect(mockContext.restore).toHaveBeenCalled();
    });

    it('should draw tower with range indicator', () => {
      const tower = createMockTower('ranged', { x: 100, y: 100 });
      renderer.drawEntity(tower);
      
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.arc).toHaveBeenCalledWith(0, 0, tower.range, 0, Math.PI * 2);
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should draw enemy with health bar', () => {
      const enemy = createMockEnemy('basic', { x: 100, y: 100, health: 75 });
      renderer.drawEntity(enemy);
      
      // Check health bar drawing
      expect(mockContext.fillRect).toHaveBeenCalledWith(-16, -20, 32, 4); // Background
      expect(mockContext.fillRect).toHaveBeenCalledWith(-16, -20, 24, 4); // Health bar
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
    });

    it('should draw colliders when enabled', () => {
      renderer.showColliders = true;
      const entity = createMockEntity('test');
      renderer.drawEntity(entity);
      
      expect(mockContext.strokeStyle).toBe('rgba(255, 0, 0, 0.5)');
      expect(mockContext.strokeRect).toHaveBeenCalled();
    });

    it('should draw debug overlay', () => {
      renderer.drawDebugOverlay({
        fps: 60,
        mouseX: 100,
        mouseY: 100,
        waveNumber: 1,
        entityCount: 5
      });

      expect(mockContext.fillStyle).toBe('white');
      expect(mockContext.fillText).toHaveBeenCalledWith('FPS: 60', 10, 20);
      expect(mockContext.fillText).toHaveBeenCalledWith('Mouse: (100, 100)', 10, 40);
      expect(mockContext.fillText).toHaveBeenCalledWith('Wave: 1', 10, 60);
      expect(mockContext.fillText).toHaveBeenCalledWith('Entities: 5', 10, 80);
    });
  });

  describe('sprite rendering', () => {
    it('should draw sprite when available', () => {
      const entity = createMockEntity('test', { sprite: 'test-sprite' });
      renderer.drawEntity(entity);
      
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('should fallback to shape when sprite is missing', () => {
      const entity = createMockEntity('test', { sprite: 'missing-sprite' });
      renderer.drawEntity(entity);
      
      expect(mockContext.drawImage).not.toHaveBeenCalled();
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe('batch rendering', () => {
    it('should draw multiple entities efficiently', () => {
      const entities = [
        createMockEntity('test1'),
        createMockEntity('test2'),
        createMockEntity('test3')
      ];

      renderer.drawAll(entities);
      
      expect(mockContext.save).toHaveBeenCalledTimes(3);
      expect(mockContext.restore).toHaveBeenCalledTimes(3);
    });
  });
}); 