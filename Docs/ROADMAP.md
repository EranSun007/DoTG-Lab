# DEATH OF THE GODS: Implementation Roadmap

> **Total Estimated Duration:** 22-32 weeks  
> **Current Phase:** 1 - Core Gameplay Loop

---

## Phase Overview

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| 1 | Core Gameplay Loop | 4-6 weeks | 🟡 In Progress |
| 2 | Strategic Depth | 4-6 weeks | ❌ Not Started |
| 3 | Information Systems | 3-4 weeks | ❌ Not Started |
| 4 | Villain AI Director | 4-6 weeks | ❌ Not Started |
| 5 | Progression Systems | 3-4 weeks | ❌ Not Started |
| 6 | Polish & Integration | 4-6 weeks | ❌ Not Started |

---

## Phase 1: Core Gameplay Loop (4-6 weeks)

> Focus: Hero-centric gameplay, limited visibility, companion-as-tower system

### 1.1 Hero Implementation (1-2 weeks)

#### 1.1.1 Hero Movement System
- [ ] Square grid-based navigation with 8-directional movement
- [ ] Powers of 2 for grid dimensions (16x16, 32x32, 64x64)
- [ ] Collision detection with terrain and entities
- [ ] Camera tracking focused on hero position
- [ ] Movement animations and feedback

#### 1.1.2 Hero Combat Mechanics
- [ ] Basic attack functionality (melee or ranged)
- [ ] Targeting system for enemy selection
- [ ] Combat feedback (hit effects, damage numbers)
- [ ] Cooldown system for abilities
- [ ] Damage types and resistances system
- [ ] Area of Effect (AoE) damage handling
- [ ] Status effect system (slow, stun, DoT)
- [ ] Line of sight requirements for attacks
- [ ] Resource management system (mana/energy costs)

#### 1.1.3 Hero Class Framework
- [ ] Base hero class with shared functionality
- [ ] **Warrior** - melee combat specialist
- [ ] **Spellcaster** - ranged magical attacks
- [ ] **Artificer** - gadgets, bombs, engineering
- [ ] **Rogue** - stealth, tactical combat, traps
- [ ] **Psionic** - telepathic communication, mind abilities
- [ ] Class-specific ability systems
- [ ] Class selection UI

#### 1.1.4 Resource Collection
- [ ] Economic resources (gold, coins, crystals)
- [ ] Strategic resources (mana, tech components, essences)
- [ ] Environmental resources (wood, stone, metal)
- [ ] Resource nodes on map
- [ ] Collection mechanics for heroes and non-combat companions
- [ ] Resource storage and UI display

#### 1.1.5 Hero Progression System
- [ ] Stage 1: Base hero abilities
- [ ] Stage 2: First companion unlocked
- [ ] Stage 3: Second companion unlocked
- [ ] Stage 4: Non-combat companion unlocked
- [ ] Stage 5: Multiplayer capability
- [ ] Upgrade UI showing progression path

### 1.2 Companion-as-Tower System (2 weeks)

#### 1.2.1 Companion Base Framework
- [ ] Extend Tower class for companion characteristics
- [ ] Persistent identity (name, stats, appearance)
- [ ] Health and status systems
- [ ] Companion selection and management UI

#### 1.2.2 Deployment Mechanics
- [ ] Deployment mode for placing companions
- [ ] Valid placement detection (terrain checks)
- [ ] Placement preview and confirmation
- [ ] Resource cost for deployment

#### 1.2.3 Basic Companion Types
- [ ] Offensive Companion (direct damage dealer)
- [ ] Support Companion (buffs/healing)
- [ ] Tactical Companion (area control)
- [ ] Distinct visual appearance for each type

#### 1.2.4 Companion Behaviors
- [ ] Attack/effect ranges and targeting
- [ ] Special abilities per companion type
- [ ] Companion type interactions (buffs, synergies)
- [ ] Basic AI for autonomous actions

### 1.3 Basic Fog of War (1-2 weeks)

#### 1.3.1 Visibility Data Structure
- [ ] Grid-based visibility map
- [ ] Three visibility states (visible, memory, unknown)
- [ ] Efficient update system for visibility changes
- [ ] Serialization support for visibility state

#### 1.3.2 Visibility Calculation
- [ ] Line-of-sight calculation from hero
- [ ] Companion vision contribution
- [ ] Vision blocking for terrain and obstacles
- [ ] Performance optimization

#### 1.3.3 Fog of War Rendering
- [ ] Visual representation for each visibility state
- [ ] Smooth transitions between states
- [ ] "Memory" visualization for previously seen areas
- [ ] Effects for vision edges and unexplored areas

#### 1.3.4 Strategic Implications
- [ ] Hide enemies in non-visible areas
- [ ] "Last known position" indicators
- [ ] Audio cues for off-screen events
- [ ] Basic alert system for unseen threats

---

## Phase 2: Strategic Depth (4-6 weeks)

### 2.1 Companion Command System (2 weeks)
- [ ] 2.1.1 Direct Command Interface
- [ ] 2.1.2 Firing Mode Implementation (Default/Berserker/Sniper)
- [ ] 2.1.3 Targeting Preference System
- [ ] 2.1.4 Command Presets

### 2.2 Resource and Economy System (1-2 weeks)
- [ ] 2.2.1 Dual Resource Types
- [ ] 2.2.2 Resource Generation
- [ ] 2.2.3 Upgrade Economy
- [ ] 2.2.4 Resource Strategy Elements

### 2.3 Basic Enemy Intelligence (1-2 weeks)
- [ ] 2.3.1 Enhanced Enemy Pathfinding
- [ ] 2.3.2 Tower Targeting Behavior
- [ ] 2.3.3 Enemy Type Variety
- [ ] 2.3.4 Enemy Waves Structure

---

## Phase 3: Information Systems (3-4 weeks)

### 3.1 Bestiary System (1 week)
- [ ] 3.1.1 Enemy Data Collection
- [ ] 3.1.2 Progressive Information Reveal
- [ ] 3.1.3 Bestiary UI
- [ ] 3.1.4 Tactical Recommendations

### 3.2 Communication Network (1-2 weeks)
- [ ] 3.2.1 Range-Limited Commands
- [ ] 3.2.2 Class-Based Communication
- [ ] 3.2.3 Signal Items
- [ ] 3.2.4 Communication Upgrades

### 3.3 Alert System (1 week)
- [ ] 3.3.1 Visual Alert Indicators
- [ ] 3.3.2 Audio Cues
- [ ] 3.3.3 Priority Categorization
- [ ] 3.3.4 Directional Guidance

---

## Phase 4: Villain AI Director (4-6 weeks)

### 4.1 Wave Management Enhancement (1-2 weeks)
- [ ] 4.1.1 Dynamic Wave Composition
- [ ] 4.1.2 Villain Decision Framework
- [ ] 4.1.3 Strategy-Based Adjustments
- [ ] 4.1.4 Wave Pacing Control

### 4.2 Strategy Analysis System (2 weeks)
- [ ] 4.2.1 Player Strategy Detection
- [ ] 4.2.2 Counter-Strategy Selection
- [ ] 4.2.3 Adaptation Mechanics
- [ ] 4.2.4 Villain Memory System

### 4.3 Villain Personalities (1-2 weeks)
- [ ] 4.3.1 Villain AI Profiles
- [ ] 4.3.2 Visual and Narrative Feedback
- [ ] 4.3.3 Nemesis Progression
- [ ] 4.3.4 Boss Encounters

---

## Phase 5: Progression Systems (3-4 weeks)

### 5.1 Hero and Companion Advancement (1-2 weeks)
- [ ] 5.1.1 XP and Leveling System
- [ ] 5.1.2 Skill Trees
- [ ] 5.1.3 Companion Upgrade Paths
- [ ] 5.1.4 Equipment and Items

### 5.2 Campaign Structure (1-2 weeks)
- [ ] 5.2.1 Level Progression
- [ ] 5.2.2 Mission Selection
- [ ] 5.2.3 Narrative Elements
- [ ] 5.2.4 Achievement System

### 5.3 Challenge and Endless Modes (1 week)
- [ ] 5.3.1 Alternative Game Modes
- [ ] 5.3.2 Difficulty Scaling
- [ ] 5.3.3 Special Rule Sets
- [ ] 5.3.4 Leaderboards

---

## Phase 6: Polish and Integration (4-6 weeks)

### 6.1 Visual and Audio Polish (2 weeks)
- [ ] 6.1.1 Visual Feedback Enhancements
- [ ] 6.1.2 Sound Design
- [ ] 6.1.3 Special Effects
- [ ] 6.1.4 Animation Refinement

### 6.2 UI/UX Refinement (1-2 weeks)
- [ ] 6.2.1 Information Presentation
- [ ] 6.2.2 Command Interfaces
- [ ] 6.2.3 Tutorials and Onboarding
- [ ] 6.2.4 Accessibility Features

### 6.3 Performance Optimization (1-2 weeks)
- [ ] 6.3.1 Fog of War Optimization
- [ ] 6.3.2 AI Performance Tuning
- [ ] 6.3.3 Level of Detail Systems
- [ ] 6.3.4 Memory Management

---

## Technical Architecture Notes

### Fog of War Implementation
- Separate grid overlay for visibility tracking
- Three layers: base terrain, dynamic entity, memory
- Only update cells that change visibility state

### Companion Command System
- Extend `InputManager` with new `CommandSystem` class
- Use Command pattern for undo functionality
- Store command history for replay/debugging

### Villain AI Director
- New manager class extending current architecture
- Store player strategy data for analysis
- Pluggable decision-making process

### Performance Considerations
- Profile fog of war calculations regularly
- Use spatial partitioning for visibility
- Implement LOD for distant areas

---

## Status Key
- ✅ Completed
- 🟡 In Progress
- ❌ Not Started
- 🔄 Needs Revision
