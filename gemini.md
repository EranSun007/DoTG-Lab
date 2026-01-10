# Death of the Gods (DoTG) - Project Analysis

## 🎯 Project Essence
DoTG is a Tower Defense Proof of Concept (POC) built with **Vanilla JavaScript (ES6+)** using an **Object-Oriented Programming (OOP)** approach. It focuses on engineering best practices, scalability, and future multiplayer readiness.

## 🏗️ Core Architecture
The project follows a modular architecture with a clear separation of concerns:

- **Managers**: Central controllers for specific systems (Entities, UI, Input, Grid).
- **Entities**: Data-driven game objects (Tower, Enemy, Hero, Projectile) inheriting from a base `Entity` class.
- **Renderer**: An abstraction layer for all canvas-based drawing logic, decoupled from game logic.
- **Config**: Data files that drive game balance and content without hardcoding stats in logic.

---

## 🧩 Key Modules & Data Flow

### 1. `Game.js` (The Heart)
- **Game Loop**: Time-delta-based (`deltaTime`) loop using `requestAnimationFrame`.
- **Lifecycle**: Handles initialization, asset loading, wave management, and state updates.
- **GameState**: A unified object passed to all `update` calls, containing references to all managers and current game metrics.

### 2. `Renderer.js` (The Eyes)
- **Decoupling**: Entities provide "Draw Data" (`getDrawData()`), and the Renderer interprets it.
- **Asset Fallbacks**: Implements shape-based rendering if images fail to load.
- **Debug Overlays**: Built-in support for grid, colliders, FPS, and entity stats.

### 3. Manager Architecture
- **`EnemyManager` / `TowerManager`**: Handle collection updates, collision detection filters, and entity lifecycle (spawn/removal).
- **`UIManager`**: The **ONLY** module allowed to touch the DOM. Synchronizes game state with HTML elements.
- **`InputManager`**: Abstracts raw events into a clean API (`isKeyDown`, `isMousePressed`).
- **`GridManager`**: Manages the tile-based placement system and cell highlights.

---

## 💾 State & Serialization
DoTG is designed for multiplayer and replays:
- **Unique IDs**: Every entity is assigned a `crypto.randomUUID()`.
- **Serialization**: Every component implements `getState()` and `syncState()`.
- **Global State**: `Game.getState()` can capture the entire world for network sync or save files.

---

## 🛠️ Development Patterns

### Adding New Content
- **New Tower**: Add entry to `TowerConfig.js` + `AssetConfig.js` + asset file. Code handles the rest.
- **New Enemy**: Add entry to `EnemyConfig.js` + `AssetConfig.js` + asset file + updated `WaveConfig.js`.

### Combat & Logic
- **Projectiles**: Managed via `ProjectileManager`, usually owned by a Tower or Hero.
- **Collision**: Primarily bounding box/radius-based, configured in `GameConstants.js`.

---

## 📈 Technical Observations & Roadmap
- **Potential Debt**: The `Game.js` file is becoming quite large (~670 lines). Some logic (like wave spawning) could potentially be moved to a dedicated `WaveManager`.
- **Optimization**: Current collision checking is $O(n^2)$ within managers. For very high entity counts, a spatial hash or quadtree might be needed.
- **Hero Movement**: Hero uses a grid-based movement pattern (`moveToCell`), while enemies use continuous pathing. This creates an interesting hybrid feel.
