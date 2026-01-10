# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Death of the Gods" is a tower defense game built with Vanilla JavaScript and ES6 modules, following OOP architecture. The project is designed for browser deployment with future multiplayer capability in mind.

## Running the Project

### Development Server
Since this is a static HTML/JS project, use a simple HTTP server:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Testing
```bash
npm test                    # Run all tests with Vitest
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report
npm run coverage            # Generate custom coverage report
npm run test:performance    # Run performance tests only
npm run test:integration    # Run integration tests only
```

## Architecture

### Core Design Patterns

**Manager Pattern**: Entity collections are managed by specialized managers (`EnemyManager`, `TowerManager`, `ProjectileManager`, `UIManager`, `InputManager`). Managers expose clean APIs for lifecycle management and are responsible for their entity collections.

**Entity System**: All game objects inherit from the base `Entity` class. Entities use data-driven initialization and implement `update(deltaTime, gameState)`, `getState()`, and `syncState()` for multiplayer/replay readiness.

**Config-Driven Design**: All game balancing and content lives in `js/config/` files. Never hardcode stats, waves, or entity properties in game logic. Use `TowerConfig`, `EnemyConfig`, `WaveConfig`, `ProjectileConfig`, etc.

**Renderer Abstraction**: All drawing logic is centralized in `Renderer.js`. Entities provide draw data via `getDrawData()` pattern. Renderer handles sprites, shapes, debug overlays, and canvas state management.

**State Serialization**: The entire game state can be serialized/deserialized. Every component implements `getState()` and `syncState()` for future multiplayer, replay, and save/load systems. Entity IDs use `crypto.randomUUID()` for network safety.

### Key Architecture Rules

1. **No DOM Access Outside UIManager**: All DOM interactions go through `UIManager`. Game logic never touches DOM directly.

2. **No Hardcoded Stats**: Entity properties, wave composition, and game constants must live in config files, not in class logic.

3. **Entity Lifecycle**: All entities extend `Entity` base class and implement `update()`, `draw()`, `isAlive()`, `getState()`, `syncState()`.

4. **Input Abstraction**: Never access raw input events. Use `InputManager` APIs: `isKeyDown()`, `getMousePosition()`, `isMousePressed()`.

5. **Asset Fallbacks**: Renderer must check for asset presence before drawing. Always provide shape-based fallback rendering if images fail to load.

### Game Loop

The game uses a time-delta-based loop:
- `deltaTime` calculated via `performance.now()` and capped to prevent logic explosions
- All movement and cooldowns scaled by `deltaTime`
- Clear separation of `update()` (logic) and `draw()` (rendering)
- Supports pause mode and speed multiplier for debugging

### State Management

**GameState Object**: Passed through all `update()` calls to share data between systems:
```javascript
{
  enemies: Map,
  towers: Map,
  hero: Object,
  projectiles: Map,
  deltaTime: number,
  input: InputManager
}
```

**Serialization**: Use `Game.getState()` to capture full game state. Debug hotkey `Alt+S` logs current state to console.

## Debug Tools

### Keyboard Shortcuts
- `Alt+D`: Toggle debug panel
- `Alt+S`: Log current game state to console
- `Space`: Pause/resume game
- `Alt+Shift+S`: Toggle slow motion

### Debug Features
- Grid overlay for positioning
- Collider visualization
- FPS counter and performance metrics
- Runtime game speed adjustment
- Spawn rate tuning
- Entity count display

Enable debug mode: `window.game.debug = true`

## File Organization

```
js/
├── main.js                 # Bootstrap and initialization
├── game/Game.js            # Core game loop and state
├── entities/               # Entity classes (Entity, Tower, Enemy, Hero, Projectile)
├── managers/               # System controllers (EnemyManager, TowerManager, etc.)
├── renderer/               # Rendering abstraction (Renderer, AssetLoader)
├── config/                 # Data-driven configs (no logic here)
├── utils/                  # Utilities (Debug, StateDiff, StateValidator)
└── debug/                  # Debug tools (DebugMenu)
```

## Adding New Content

### New Tower Type
1. Add config to `js/config/TowerConfig.js`
2. Add asset key to `js/config/AssetConfig.js`
3. Add corresponding image to `assets/`
4. No code changes needed - renderer and managers handle it

### New Enemy Type
1. Add config to `js/config/EnemyConfig.js`
2. Add asset key to `js/config/AssetConfig.js`
3. Update `WaveConfig.js` to include in waves
4. Add corresponding image to `assets/`

### New Wave
Edit `js/config/WaveConfig.js` to add wave composition. Format:
```javascript
{
  enemies: [
    { type: 'basic', count: 10, interval: 1.0 }
  ],
  goldReward: 50
}
```

## Testing Architecture

Tests use Vitest with jsdom environment. Setup file (`tests/setup.js`) provides mocks for:
- Canvas 2D context
- `window.performance` and `requestAnimationFrame`
- `Image` objects
- Asset loader

Test structure mirrors source structure (`tests/entities/`, `tests/managers/`, etc.).

## Important Technical Details

**Asset Loading**: Game waits for all assets to load before starting. `AssetLoader` uses Promise-based loading with timeout handling. Loading overlay shows progress.

**Collision Detection**: Uses basic bounding box collision. Collision threshold defined in `GameConstants.COLLISION_THRESHOLD`.

**Projectile System**: Projectiles are entities managed by their owner (tower or hero). Cleaned up automatically when `isAlive()` returns false.

**Grid System**: Optional grid overlay for tile-based positioning. Grid size defined in `GridConfig.js`.

## Multiplayer Readiness

The architecture is prepared for multiplayer:
- All entities have unique IDs (`crypto.randomUUID()`)
- Complete state serialization via `getState()`
- State synchronization via `syncState()`
- Config-driven design enables easy network sync
- Manager pattern isolates entity collections for server authority

## Common Patterns

**Creating a new entity**:
```javascript
const enemy = new Enemy({
  x: 100,
  y: 100,
  type: 'basic'  // References EnemyConfig
});
```

**Manager usage**:
```javascript
enemyManager.addEntity(enemy);
enemyManager.updateAll(deltaTime, gameState);
enemyManager.drawAll(renderer);
```

**Rendering pattern**:
```javascript
getDrawData() {
  return {
    type: this.getAssetType(),
    x: this.x,
    y: this.y,
    width: this.width,
    height: this.height,
    rotation: this.rotation
  };
}
```
