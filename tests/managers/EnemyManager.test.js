import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockEnemy, createMockGameState } from '../test-utils/helpers.js';
import { EnemyManager } from '../../js/managers/EnemyManager.js';
import { WaveConfig } from '../../js/config/WaveConfig.js';

describe('EnemyManager', () => {
  let manager;
  let gameState;

  beforeEach(() => {
    gameState = createMockGameState();
    manager = new EnemyManager();
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
      expect(manager.currentWaveNumber).toBe(waveNumber);
    });

    it('should spawn enemies according to wave config', () => {
      const waveNumber = 1;
      manager.startWave(waveNumber);
      const waveConfig = WaveConfig[waveNumber];
      
      // Spawn all enemies in the wave
      for (let i = 0; i < waveConfig.totalEnemies; i++) {
        manager.spawnEnemy();
      }

      expect(manager.enemies).toHaveLength(waveConfig.totalEnemies);
    });
  });

  describe('enemy management', () => {
    it('should add and remove enemies', () => {
      const enemy = createMockEnemy('basic');
      manager.addEnemy(enemy);
      expect(manager.enemies).toHaveLength(1);

      manager.removeEnemy(enemy.id);
      expect(manager.enemies).toHaveLength(0);
    });

    it('should update all enemies', () => {
      // Create mock enemies with the simple update method
      const enemy1 = createMockEnemy('basic', { id: 'e1', x: 0, y: 0 });
      const enemy2 = createMockEnemy('basic', { id: 'e2', x: 100, y: 100 });
      // Directly add the mocks to the manager's array
      manager.enemies.push(enemy1);
      manager.enemies.push(enemy2);

      const deltaTime = 16.67; // ~60fps
      manager.update(deltaTime);

      // Check the enemies *within* the manager after update
      const updatedEnemy1 = manager.getById(enemy1.id);
      const updatedEnemy2 = manager.getById(enemy2.id);
      expect(updatedEnemy1.x).not.toBe(0);
      expect(updatedEnemy2.x).not.toBe(100);
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
      manager.startWave(1);
      manager.spawnEnemy();
      expect(manager.enemies).toHaveLength(1);
      const enemy = manager.enemies[0];
      expect(enemy.path).toBeDefined();
      expect(enemy.currentPathIndex).toBe(0);
    });

    it('should update enemy position along path', () => {
      // Create a mock enemy and add it directly
      const enemy = createMockEnemy('basic', { id: 'ep1' });
      manager.enemies.push(enemy);
      const initialX = enemy.x;
      const initialY = enemy.y;

      manager.update(16.67);
      // Check the enemy *within* the manager after update
      const updatedEnemy = manager.getById(enemy.id);
      expect(updatedEnemy.x).not.toBe(initialX);
      expect(updatedEnemy.y).not.toBe(initialY);
    });
  });

  describe('wave completion', () => {
    it('should detect wave completion', () => {
      const waveNumber = 1;
      manager.startWave(waveNumber);
      // Get config the same way the manager does
      const waveConfig = WaveConfig.find(w => w.waveNumber === waveNumber);
      
      // Simulate all enemies being removed (killed or reached end) BEFORE update
      manager.enemies = []; 

      manager.update(16.67);
      expect(manager.currentWave).toBeNull();
    });

    it('should handle wave completion callback', () => {
      // Ensure gameState has the properties the manager updates
      gameState.waveInProgress = true; 
      gameState.canStartWave = false;

      const waveNumber = 1;
      manager.startWave(waveNumber);
      const waveConfig = WaveConfig[waveNumber];
      
      // Spawn all enemies for the wave
      for (let i = 0; i < waveConfig.totalEnemies; i++) {
        manager.spawnEnemy();
      }

      // Simulate all enemies being removed (killed or reached end) BEFORE update
      manager.enemies = []; 

      // Manually set spawned count to meet completion condition
      manager.currentWave.enemiesSpawned = manager.currentWave.config.totalEnemies;
      manager.update(16.67, gameState);

      // Check gameState changes 
      expect(gameState.waveInProgress).toBe(false);
      expect(gameState.canStartWave).toBe(true);
    });
  });

  describe('state management', () => {
    it('should serialize state correctly', () => {
      manager.startWave(1);
      manager.spawnEnemy(); // Add some state
      const state = manager.getState();

      // Check the structure of the returned state object
      expect(state).toMatchObject({
        enemies: expect.any(Array),
        currentWave: expect.any(Object), // or null if wave wasn't active
        currentWaveNumber: expect.any(Number),
        lastSpawnTime: expect.any(Number)
      });
      // Check that enemies array contains enemy states
      if (state.enemies.length > 0) { 
        expect(state.enemies[0]).toHaveProperty('id');
        expect(state.enemies[0]).toHaveProperty('health');
      }
    });

    it('should restore state correctly', () => {
      const state = manager.getState();
      const newManager = new EnemyManager();
      newManager.syncState(state);
      expect(newManager.getState()).toEqual(state);
    });
  });
}); 