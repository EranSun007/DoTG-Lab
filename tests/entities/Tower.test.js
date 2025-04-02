import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockTower, createMockEnemy, createMockGameState } from '../test-utils/helpers.js';
import { Tower } from '../../js/entities/Tower.js';
import { TowerConfig } from '../../js/config/TowerConfig.js';

describe('Tower', () => {
  let tower;
  let gameState;

  beforeEach(() => {
    gameState = createMockGameState();
    tower = new Tower({ x: 0, y: 0, type: 'ranged' });
  });

  describe('initialization', () => {
    it('should initialize with correct stats from config', () => {
      expect(tower.range).toBe(TowerConfig.ranged.range);
      expect(tower.damage).toBe(TowerConfig.ranged.damage);
      expect(tower.attackSpeed).toBe(TowerConfig.ranged.attackSpeed);
      expect(tower.cost).toBe(TowerConfig.ranged.cost);
    });

    it('should have unique ID', () => {
      expect(tower.id).toBeDefined();
      expect(typeof tower.id).toBe('string');
      expect(tower.id.length).toBeGreaterThan(0);
    });
  });

  describe('targeting', () => {
    it('should find nearest enemy in range', () => {
      const enemy1 = createMockEnemy('basic', { x: 50, y: 50 });
      const enemy2 = createMockEnemy('basic', { x: 150, y: 150 });
      const enemies = [enemy1, enemy2];

      const target = tower.findTarget(enemies);
      expect(target).toBe(enemy1);
    });

    it('should return null when no enemies in range', () => {
      const enemy = createMockEnemy('basic', { x: 200, y: 200 });
      const target = tower.findTarget([enemy]);
      expect(target).toBeNull();
    });
  });

  describe('attack behavior', () => {
    it('should attack when cooldown is ready', () => {
      const enemy = createMockEnemy('basic', { x: 50, y: 50 });
      const initialHealth = enemy.health;

      tower.attack(enemy);
      expect(enemy.health).toBe(initialHealth - tower.damage);
    });

    it('should respect attack cooldown', () => {
      const enemy = createMockEnemy('basic', { x: 50, y: 50 });
      const initialHealth = enemy.health;

      tower.attack(enemy);
      tower.attack(enemy);
      expect(enemy.health).toBe(initialHealth - tower.damage);
    });
  });

  describe('state management', () => {
    it('should serialize state correctly', () => {
      const state = tower.getState();
      expect(state).toMatchObject({
        id: tower.id,
        type: 'tower',
        x: tower.x,
        y: tower.y,
        range: tower.range,
        damage: tower.damage,
        attackSpeed: tower.attackSpeed,
        lastAttackTime: tower.lastAttackTime,
      });
    });

    it('should restore state correctly', () => {
      const state = tower.getState();
      const newTower = new Tower({ x: 0, y: 0, type: 'ranged' });
      newTower.syncState(state);
      expect(newTower.getState()).toEqual(state);
    });
  });

  describe('upgrade behavior', () => {
    it('should upgrade stats correctly', () => {
      const initialDamage = tower.damage;
      const initialRange = tower.range;
      const initialAttackSpeed = tower.attackSpeed;

      tower.upgrade();
      expect(tower.damage).toBeGreaterThan(initialDamage);
      expect(tower.range).toBeGreaterThan(initialRange);
      expect(tower.attackSpeed).toBeGreaterThan(initialAttackSpeed);
    });

    it('should track upgrade level', () => {
      expect(tower.level).toBe(1);
      tower.upgrade();
      expect(tower.level).toBe(2);
    });
  });
}); 