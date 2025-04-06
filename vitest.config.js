import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.js',
        '**/*.config.js',
        '**/*.d.ts'
      ],
      include: [
        'js/**/*.js'
      ],
      all: true,
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
}); 