import { mockCanvas } from '../setup.js';
import { Tower } from '../../js/entities/Tower.js';

/**
 * Creates a mock game state for testing
 * @returns {Object} Mock game state
 */
export function createMockGameState() {
  return {
    gold: 100,
    lives: 3,
    waveNumber: 1,
    isWaveActive: false,
    selectedTowerType: null,
    waveInProgress: false,
    canStartWave: true,
    isPaused: false,
    speedMultiplier: 1,
    debug: false,
    deltaTime: 16.67, // ~60fps
  };
}

/**
 * Creates a mock entity with basic properties
 * @param {string} type - Entity type
 * @param {Object} props - Additional properties
 * @returns {Object} Mock entity
 */
export function createMockEntity(type, props = {}) {
  return {
    id: crypto.randomUUID(),
    type,
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    getDrawData: () => ({
      type,
      x: props.x || 0,
      y: props.y || 0,
      width: props.width || 32,
      height: props.height || 32,
      ...props
    }),
    ...props,
  };
}

/**
 * Creates a mock tower entity
 * @param {string} type - Tower type
 * @param {Object} props - Additional properties
 * @returns {Tower} Mock tower
 */
export function createMockTower(type, props = {}) {
  const tower = new Tower({
    type,
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    ...props,
  });

  // Override getDrawData if provided in props
  if (props.getDrawData) {
    tower.getDrawData = props.getDrawData;
  }

  return tower;
}

/**
 * Creates a mock enemy entity
 * @param {string} type - Enemy type
 * @param {Object} props - Additional properties
 * @returns {Object} Mock enemy
 */
export function createMockEnemy(type, props = {}) {
  const enemy = createMockEntity('enemy', {
    type,
    health: 100,
    maxHealth: 100,
    speed: 1,
    getDrawData: () => ({
      type: `ENEMY_${type.toUpperCase()}`,
      x: props.x || 0,
      y: props.y || 0,
      width: props.width || 32,
      height: props.height || 32,
      health: props.health || 100,
      maxHealth: props.maxHealth || 100,
      ...props
    }),
    ...props,
  });

  // Add a basic update method for testing movement
  enemy.update = function(deltaTime, gameState) {
    // Simple movement for testing - just increment x/y slightly
    // A real implementation would use pathfinding
    this.x += (this.speed || 1) * deltaTime * 0.1;
    this.y += (this.speed || 1) * deltaTime * 0.05;
  };

  // Add isAlive method for testing removal
  enemy.isAlive = function() {
    return this.health > 0;
  };

  return enemy;
}

/**
 * Creates a mock projectile entity
 * @param {Object} props - Additional properties
 * @returns {Object} Mock projectile
 */
export function createMockProjectile(props = {}) {
  return createMockEntity('projectile', {
    damage: 10,
    speed: 5,
    targetId: null,
    ...props,
  });
}

/**
 * Creates a mock hero entity
 * @param {Object} props - Additional properties
 * @returns {Object} Mock hero
 */
export function createMockHero(props = {}) {
  return createMockEntity('hero', {
    health: 100,
    maxHealth: 100,
    damage: 20,
    attackSpeed: 1,
    lastAttackTime: 0,
    ...props,
  });
}

/**
 * Creates a mock game instance for testing
 * @returns {Object} Mock game instance
 */
export function createMockGame() {
  return {
    canvas: mockCanvas,
    state: createMockGameState(),
    entities: new Map(),
    start: vi.fn(),
    stop: vi.fn(),
    update: vi.fn(),
    draw: vi.fn(),
    getState: vi.fn().mockReturnValue(createMockGameState()),
    syncState: vi.fn(),
  };
} 