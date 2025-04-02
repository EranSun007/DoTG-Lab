import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockEnemy, createMockGameState } from '../test-utils/helpers.js';
import { EnemyManager } from '../../js/managers/EnemyManager.js';
import { WaveConfig } from '../../js/config/WaveConfig.js';

describe('EnemyManager', () => {
  let manager;
  let gameState;

  beforeEach(() => {
    gameState = createMockGameState();
    manager = new EnemyManager(gameState);
  });

  describe('wave management', () => {
    it('should initialize with empty wave', () => {
      expect(manager.currentWave).toBeNull();
      expect(manager.enemies).toHaveLength(0);
    });

    it('should start new wave correctly', () => {
      const waveNumber = 1;
      manager.startWave(waveNumber);
      expect(manager.currentWave).toBeDefined();
      expect(manager.currentWave.number).toBe(waveNumber);
    });

    it('should spawn enemies according to wave config', () => {
      const waveNumber = 1;
      manager.startWave(waveNumber);
      const waveConfig = WaveConfig[waveNumber];
      
      // Spawn all enemies in the wave
      for (let i = 0; i < waveConfig.totalEnemies; i++) {
        manager.spawnNextEnemy();
      }

      expect(manager.enemies).toHaveLength(waveConfig.totalEnemies);
    });
  });

  describe('enemy management', () => {
    it('should add and remove enemies', () => {
      const enemy = createMockEnemy('basic');
      manager.addEnemy(enemy);
      expect(manager.enemies).toContain(enemy);

      manager.removeEnemy(enemy);
      expect(manager.enemies).not.toContain(enemy);
    });

    it('should update all enemies', () => {
      const enemy1 = createMockEnemy('basic', { x: 0, y: 0 });
      const enemy2 = createMockEnemy('basic', { x: 100, y: 100 });
      manager.addEnemy(enemy1);
      manager.addEnemy(enemy2);

      const deltaTime = 16.67; // ~60fps
      manager.update(deltaTime);

      // Verify enemies were updated (position changed)
      expect(enemy1.x).not.toBe(0);
      expect(enemy2.x).not.toBe(100);
    });

    it('should handle enemy death', () => {
      const enemy = createMockEnemy('basic');
      manager.addEnemy(enemy);

      enemy.health = 0;
      manager.update(16.67);

      expect(manager.enemies).not.toContain(enemy);
    });
  });

  describe('path management', () => {
    it('should assign correct path to new enemies', () => {
      const enemy = createMockEnemy('basic');
      manager.addEnemy(enemy);
      expect(enemy.path).toBeDefined();
      expect(enemy.pathIndex).toBe(0);
    });

    it('should update enemy position along path', () => {
      const enemy = createMockEnemy('basic');
      manager.addEnemy(enemy);
      const initialX = enemy.x;
      const initialY = enemy.y;

      manager.update(16.67);
      expect(enemy.x).not.toBe(initialX);
      expect(enemy.y).not.toBe(initialY);
    });
  });

  describe('wave completion', () => {
    it('should detect wave completion', () => {
      const waveNumber = 1;
      manager.startWave(waveNumber);
      const waveConfig = WaveConfig[waveNumber];
      
      // Spawn and kill all enemies
      for (let i = 0; i < waveConfig.totalEnemies; i++) {
        const enemy = createMockEnemy('basic');
        manager.addEnemy(enemy);
        enemy.health = 0;
      }

      manager.update(16.67);
      expect(manager.isWaveComplete()).toBe(true);
    });

    it('should handle wave completion callback', () => {
      const onWaveComplete = vi.fn();
      manager.onWaveComplete = onWaveComplete;

      const waveNumber = 1;
      manager.startWave(waveNumber);
      const waveConfig = WaveConfig[waveNumber];
      
      // Spawn and kill all enemies
      for (let i = 0; i < waveConfig.totalEnemies; i++) {
        const enemy = createMockEnemy('basic');
        manager.addEnemy(enemy);
        enemy.health = 0;
      }

      manager.update(16.67);
      expect(onWaveComplete).toHaveBeenCalled();
    });
  });

  describe('state management', () => {
    it('should serialize state correctly', () => {
      const state = manager.getState();
      expect(state).toMatchObject({
        currentWave: manager.currentWave,
        enemies: expect.any(Array),
      });
    });

    it('should restore state correctly', () => {
      const state = manager.getState();
      const newManager = new EnemyManager(gameState);
      newManager.syncState(state);
      expect(newManager.getState()).toEqual(state);
    });
  });
}); 