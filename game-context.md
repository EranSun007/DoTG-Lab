# Game Context: Death of the Gods (Tower Defense POC)

## Overview
This is a scalable, multiplayer-ready tower defense game built from scratch using Vanilla JavaScript, ES6 Modules, and an Object-Oriented Programming (OOP) architecture. The game is designed for browser deployment as a POC, with future flexibility to evolve into more advanced platforms or multiplayer gameplay. All content is kept generic during initial implementation, focusing solely on engineering best practices.

---

## Folder Structure
```
TD_REBUILD/
├── index.html
├── assets/                    # Game sprites and images
├── js/
│   ├── main.js                # Game bootstrap
│   ├── Game.js                # Core lifecycle and game loop
│   ├── config/                # Game data and constants
│   │   ├── GameConstants.js
│   │   ├── TowerConfig.js
│   │   ├── EnemyConfig.js
│   │   └── WaveConfig.js
│   ├── entities/              # Game objects
│   │   ├── Entity.js
│   │   ├── Enemy.js
│   │   ├── Tower.js
│   │   └── Hero.js
│   ├── managers/              # System logic controllers
│   │   ├── EnemyManager.js
│   │   ├── TowerManager.js
│   │   ├── UIManager.js
│   │   └── InputManager.js
│   └── renderer/              # Rendering pipeline
│       └── Renderer.js
└── game-context.md            # This file
```

---

## ✅ Tip 1: Entity & Class Architecture — Completed
- Implemented a shared `Entity` base class with `update()` and `draw()`
- Subclasses `Tower`, `Enemy`, and `Hero` extend `Entity`
- Clean polymorphism enables generic handling of all entities
- Standardized update signature: `update(deltaTime, gameState)`
- Entities stored in a unified `Map` within `Game`
- Entities use `getDrawData()` pattern to decouple visuals from logic

### Architecture Improvements:
- Unified all entities into a single `Map` in the `Game` class for flexible iteration.
- Standardized `update(deltaTime, gameState)` method signature across all entities.
- Constructors use data-driven initialization for future multiplayer sync.
- Each entity includes `getState()` and uses `crypto.randomUUID()` for network-friendly IDs.
- Added `@typedef` JSDoc for entity data objects (`EntityData`, `GameState`).
- Type-safe entity filtering via `getEntitiesByType()` helper method.

---

## ✅ Tip 2: Manager Pattern — Completed
- Introduced `EnemyManager` and `TowerManager`
- Each manager manages its own entity collection internally
- Exposes clean API: `addEntity()`, `removeEntity()`, `updateAll()`, `drawAll()`
- Managers communicate via `gameState` object
- Hero is managed as a singleton in `Game`
- Ready for multiplayer serialization via `getState()` / `syncState()`

### Architecture Improvements:
- Decoupled entity collections from the core game class
- Centralized logic for lifecycle and collision detection
- Manager methods allow flexible iteration and serialization
- Managers are future-ready for syncing with server or replay systems

---

## ✅ Tip 3: Game Loop & Delta Time — Completed
- Clean `start()` / `loop()` pattern using `requestAnimationFrame`
- `deltaTime` calculated using `performance.now()` and capped to `MAX_DELTA_TIME`
- Game logic, movement, and cooldowns scaled using `deltaTime`
- Pause mode and `speedMultiplier` implemented for testing/debug

### Architecture Improvements:
- Stable time-delta-based game loop ensures cross-device consistency
- Capped frame jumps prevent logic explosions on inactive tabs
- Flexible `Game.debug` and `speedMultiplier` toggles support testing
- Clean separation of `update()` and `render()` logic

---

## ✅ Tip 4: Input System Abstraction — Completed
- `InputManager` centralizes keyboard and mouse input
- Exposes API: `isKeyDown()`, `getMousePosition()`, `isMousePressed()`, `update()`
- Inputs injected via `gameState` for entity-level access
- Future-proofed with placeholders for touch/gamepad support
- Dev console logging enabled via `Game.debug = true`

### Architecture Improvements:
- Removed input event clutter from `Game.js`
- Unified key/mouse input abstraction for all game layers
- Game logic now queries clean APIs instead of raw events
- Built-in extensibility for gamepad and rebinding

---

## ✅ Tip 5: Renderer Abstraction — Completed
- `Renderer` encapsulates all canvas drawing logic
- Methods: `clear()`, `drawEntity()`, `drawAll()`, `drawDebugOverlay()`
- Canvas state safely handled with `save()`/`restore()`
- Entities provide draw data; visuals are fully handled in `Renderer`
- Debug overlay displays FPS, entity count, and mouse position

### Architecture Improvements:
- Game visuals centralized in one module
- Replaced primitive fill logic with composable drawing routines
- Renderer supports sprite, shape, and debug overlays cleanly
- Layer-ready and modular for future shaders or particles

---

## ✅ Tip 6: UI State Sync via UIManager — Completed
- `UIManager` handles all DOM interactions
- API: `updateGold()`, `updateLives()`, `updateWaveNumber()`, `toggleStartWaveButton()`, `setSelectedTower()`, `bind*()`
- DOM references passed into UIManager (not queried inside)
- No DOM access exists outside `UIManager`
- Game UI accurately reflects internal game state

### Architecture Improvements:
- DOM handling removed from game logic
- Centralized and testable UI system
- Event bindings exposed as clean functions
- Prepared for dynamic UI (tooltips, upgrade trees, etc.)

---

## ✅ Tip 7: Config-Driven Architecture — Completed
- Game logic driven by data in `config/` folder:
  - `TowerConfig.js`: Stats per tower type
  - `EnemyConfig.js`: Stats per enemy type
  - `WaveConfig.js`: Structured wave composition
  - `GameConstants.js`: Canvas size, lives, gold, etc.
- Replaces all hardcoded logic for towers/enemies/waves
- Uses consistent access patterns (e.g., `TowerConfig[type]`)
- Designed for future JSON import/export (level editors, balance tools)

### Architecture Improvements:
- All balancing separated from code
- Enables live tuning or designer-driven editing
- Allows level/wave editors with JSON structure
- Provides strict config access via defined keys

---

## ✅ Tip 8: Asset Loading & Game Start Lifecycle — Completed
- Created `AssetLoader` to load and cache image assets asynchronously
- Assets stored in a `Map` via key-lookup (`AssetLoader.get(key)`)
- Game lifecycle uses states: `isLoading`, `isRunning`
- Game loop only begins after all assets are ready
- Renderer receives and draws sprites using `drawImage()`
- Logs or UI messages indicate loading status

### Architecture Improvements:
- Async-safe game boot sequence
- Clear separation of game logic and asset dependencies
- Reusable asset lookup logic across entities and renderer
- Game won’t start until fully prepared (prevents partial states)

---

## Design Philosophy
- OOP-first with modular manager/controller classes
- Generic engineering-first architecture, content-neutral until final phase
- Each system designed for multiplayer, testing, and extensibility
- All logic and rendering abstracted through clean APIs
- Game state passed through `gameState` object for clear data flow

---

## Multiplayer/Editor Ready Architecture
- All entities and managers support `getState()` and `syncState()`
- GameConfig files support future JSON serialization
- Architecture is ready for plug-in systems: AI pathing, networking, modding

---

