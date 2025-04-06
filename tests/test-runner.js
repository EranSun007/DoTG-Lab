import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnemyManager } from '../js/managers/EnemyManager.js';
import { EnemySpawner } from '../js/managers/EnemySpawner.js';
import { EnemyController } from '../js/managers/EnemyController.js';
import { createMockEnemy } from './test-utils/helpers.js';
import { WaveConfig } from '../js/config/WaveConfig.js';

describe('Enemy System Integration Tests', () => {
    let enemyManager;
    let mockEnemy;

    beforeEach(() => {
        enemyManager = new EnemyManager();
        mockEnemy = createMockEnemy('basic');
    });

    afterEach(() => {
        enemyManager.destroy();
    });

    describe('EnemyManager Integration', () => {
        it('should properly initialize all components', () => {
            expect(enemyManager.spawner).toBeInstanceOf(EnemySpawner);
            expect(enemyManager.controller).toBeInstanceOf(EnemyController);
        });

        it('should handle wave progression correctly', () => {
            const waveNumber = 1;
            enemyManager.startWave(waveNumber);
            
            // Verify wave started
            expect(enemyManager.spawner.currentWave).toBeDefined();
            expect(enemyManager.spawner.currentWave.number).toBe(waveNumber);

            // Spawn all enemies in wave
            const waveConfig = WaveConfig[waveNumber - 1];
            for (let i = 0; i < waveConfig.totalEnemies; i++) {
                enemyManager.update(16.67, {});
            }

            // Verify all enemies were spawned and added to controller
            expect(enemyManager.spawner.isWaveComplete()).toBe(true);
            expect(enemyManager.controller.getAll().length).toBe(waveConfig.totalEnemies);
        });

        it('should handle wave completion callback', () => {
            const onWaveComplete = vi.fn();
            enemyManager.onWaveComplete = onWaveComplete;

            const waveNumber = 1;
            enemyManager.startWave(waveNumber);
            
            // Spawn and kill all enemies
            const waveConfig = WaveConfig[waveNumber - 1];
            for (let i = 0; i < waveConfig.totalEnemies; i++) {
                const enemy = createMockEnemy('basic', { health: 0 });
                enemyManager.controller.addEnemy(enemy);
            }

            enemyManager.update(16.67, {});
            expect(onWaveComplete).toHaveBeenCalled();
        });
    });

    describe('State Management Integration', () => {
        it('should properly serialize and deserialize state', () => {
            // Set up initial state
            const waveNumber = 1;
            enemyManager.startWave(waveNumber);
            
            // Spawn some enemies
            for (let i = 0; i < 3; i++) {
                enemyManager.update(16.67, {});
            }

            // Get current state
            const state = enemyManager.getState();

            // Create new manager and restore state
            const newManager = new EnemyManager();
            newManager.syncState(state);

            // Verify state was restored correctly
            expect(newManager.spawner.getState()).toEqual(enemyManager.spawner.getState());
            expect(newManager.controller.getState()).toEqual(enemyManager.controller.getState());
        });
    });

    describe('Performance Tests', () => {
        it('should handle large numbers of enemies efficiently', () => {
            const startTime = performance.now();
            
            // Spawn 100 enemies
            for (let i = 0; i < 100; i++) {
                const enemy = createMockEnemy('basic');
                enemyManager.controller.addEnemy(enemy);
            }

            // Update all enemies
            enemyManager.update(16.67, {});

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should complete within 16ms (one frame at 60fps)
            expect(duration).toBeLessThan(16);
        });
    });
}); 