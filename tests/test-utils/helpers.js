import { mockCanvas } from '../setup.js';

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
    ...props,
  };
}

/**
 * Creates a mock tower entity
 * @param {string} type - Tower type
 * @param {Object} props - Additional properties
 * @returns {Object} Mock tower
 */
export function createMockTower(type, props = {}) {
  return createMockEntity('tower', {
    type,
    range: 100,
    damage: 10,
    attackSpeed: 1,
    lastAttackTime: 0,
    ...props,
  });
}

/**
 * Creates a mock enemy entity
 * @param {string} type - Enemy type
 * @param {Object} props - Additional properties
 * @returns {Object} Mock enemy
 */
export function createMockEnemy(type, props = {}) {
  return createMockEntity('enemy', {
    type,
    health: 100,
    maxHealth: 100,
    speed: 1,
    ...props,
  });
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