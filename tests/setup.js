import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock AssetLoader globally
vi.mock('../js/utils/AssetLoader.js', () => ({
    AssetLoader: vi.fn().mockImplementation(() => ({
        load: vi.fn(() => Promise.resolve()),
        getAsset: vi.fn((key) => {
            // Basic mock: return a simple object for image assets
            if (key && typeof key === 'string' && (key.includes('IMAGE') || key.includes('SPRITE') || key.includes('TILE'))) {
                return { width: 32, height: 32, isMockAsset: true };
            }
            return null;
        }),
        get: vi.fn((key) => { // Alias for getAsset if used
             if (key && typeof key === 'string' && (key.includes('IMAGE') || key.includes('SPRITE') || key.includes('TILE'))) {
                return { width: 32, height: 32, isMockAsset: true };
            }
            return null;
        }),
    })),
}));

// Mock canvas context
const mockContext = {
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  drawImage: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
  createLinearGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn(),
  }),
};

// Mock canvas element
const mockCanvas = {
  getContext: vi.fn().mockReturnValue(mockContext),
  width: 800,
  height: 600,
  // Mock addEventListener/removeEventListener for canvas if needed by InputManager
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 800, height: 600 }))
};

// Mock performance.now() as it might be used directly
if (typeof window !== 'undefined') {
    window.performance = window.performance || {};
    window.performance.now = vi.fn(() => Date.now()); // Use Date.now() or a fixed increment
} else {
    // Define performance globally if window doesn't exist initially (less ideal)
    global.performance = {
        now: vi.fn(() => Date.now())
    };
}

// Keep Mock Image if needed for asset loading simulation
global.Image = vi.fn().mockImplementation(() => ({
  src: '',
  onload: null,
  onerror: null,
  width: 32,
  height: 32,
}));

// Mock asset loader (Can be removed if AssetLoader is mocked per-test or via vi.mock)
/*
const mockAssetLoader = {
  get: vi.fn().mockImplementation((key) => {
    if (key.startsWith('TOWER_') || key.startsWith('ENEMY_') || key === 'BACKGROUND_TILE' || key === 'PATH') {
      return {
        width: 32,
        height: 32,
        drawImage: vi.fn()
      };
    }
    return null;
  })
};
*/

// Export mock objects for use in tests (Optional, maybe prefer imports)
export { mockContext, mockCanvas }; 