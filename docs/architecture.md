# Death of the Gods: Tower Defense - Architecture

## Overview
This document outlines the architecture of the "Death of the Gods" tower defense game.
The game is built using Vanilla JavaScript with ES6 modules and follows an Object-Oriented Programming (OOP) approach.

## Directory Structure
```
/
├── index.html                # Main HTML entry point
├── assets/                   # Game assets (images, sprites, audio)
├── src/                      # Source code
│   ├── main.js               # Entry point
│   ├── core/                 # Core game systems
│   │   └── Game.js           # Main game controller
│   ├── config/               # Configuration files
│   ├── entities/             # Game entities
│   │   ├── base/             # Base entity classes
│   │   ├── players/          # Player-controlled entities
│   │   ├── enemies/          # Enemy entities
│   │   ├── towers/           # Tower entities
│   │   └── projectiles/      # Projectile entities
│   ├── managers/             # System managers
│   ├── rendering/            # Rendering system
│   ├── ui/                   # UI system
│   ├── utils/                # Utility functions
│   └── debug/                # Debug tools
└── docs/                     # Documentation
```

## Core Systems

### Entity System
- All game objects extend the base `Entity` class
- Entities implement `update()`, `draw()`, and `getState()` methods
- State serialization for network/replay via `getState()` and `syncState()`

### Manager Pattern
- Each subsystem has a dedicated manager class
- Managers handle entity creation, updates, and lifecycle
- Managers communicate via the central `gameState` object

### Grid and Pathfinding System
- `GridManager` maintains a 2D grid representing the game world
- Grid cells track terrain types (EMPTY, BLOCKED, TOWER, HERO)
- `Pathfinder` implements A* algorithm for enemy navigation
- Dynamic obstacle system allows Hero to block enemy paths
- Enemies recalculate paths when blocked by the moving Hero
- Clear position tracking with `updateGridPosition()` and cleanup

### Rendering System
- Decoupled rendering via `Renderer` class
- Entities provide their visual data via `getDrawData()`
- Support for sprites, animations, and fallback rendering

### Configuration System
- Game configuration driven by data files in `config/`
- Entity properties, game constants, and UI text defined in configs
- Designed for future JSON import/export

### Input System
- Input handling abstracted via `InputManager`
- Support for keyboard, mouse, and future input methods
- Clean API for querying input state

### UI System
- DOM manipulation contained in `UIManager`
- No direct DOM access from game logic
- Event binding and state syncing via clean APIs

## Future Improvements
- Extract game loop logic from Game.js
- Implement proper state management pattern
- Consider component-based architecture
- Improve asset loading and management
- Add multiplayer support 