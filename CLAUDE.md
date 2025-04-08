# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Test Commands
- Run all tests: `npm test` or `vitest`
- Run specific test: `npm test -- path/to/file.test.js`
- Run tests with pattern: `npm test -- --testNamePattern="Pattern"`
- Performance tests: `npm run test:performance`
- Integration tests: `npm run test:integration`
- Generate coverage: `npm run test:coverage`
- HTML coverage report: `npm run coverage:html`

## Code Style Guidelines
- JS modules with ES6 import/export syntax
- 4-space indentation, single quotes, semicolons required
- PascalCase for class names, camelCase for methods/variables
- Clear JSDoc comments for classes and methods
- Follow OOP paradigm with inheritance from base classes
- Config values in dedicated config/ files
- Tests organized with describe/it blocks using vitest
- 80% minimum test coverage for statements/branches/functions
- Clear structure: entities/, managers/, utils/, config/, renderer/
- Avoid direct DOM manipulation outside Renderer
- Follow existing patterns for error handling and state management