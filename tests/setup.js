import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
};

// Mock window
global.window = {
  ...global.window,
  performance: {
    now: vi.fn().mockReturnValue(0),
  },
  requestAnimationFrame: vi.fn().mockReturnValue(0),
  cancelAnimationFrame: vi.fn(),
};

// Mock document
global.document = {
  ...global.document,
  createElement: vi.fn().mockImplementation((tagName) => {
    if (tagName === 'canvas') return mockCanvas;
    return {};
  }),
};

// Mock Image
global.Image = vi.fn().mockImplementation(() => ({
  src: '',
  onload: null,
  onerror: null,
  width: 32,
  height: 32,
}));

// Export mock objects for use in tests
export { mockContext, mockCanvas }; 