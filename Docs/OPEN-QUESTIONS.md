# Open Design Questions

> Active decisions needed before/during implementation

---

## 1. Player Experience & Onboarding

### Complexity Pacing
- [ ] Map 5-mission tutorial sequence introducing mechanics incrementally
- [ ] Design class-based remote command abilities (ranges, cooldowns)
- [ ] Specify signal item mechanics (types, rarity, limitations)
- [ ] Create companion command preset system

---

## 2. Strategic Gameplay Balance

### Hero Management
- [ ] Define balance: hero combat vs. tower management time split
- [ ] Design scouting vs. defending strategic tension
- [ ] Risk/reward mechanics for resource gathering away from defenses
- [ ] Hero movement speed and travel abilities (teleport scrolls, speed boosts)

### Companion Tower Mechanics
- [ ] Create detailed stat sheets for 3 sample tower types
- [ ] Define exact mechanics for firing modes (Default/Berserker/Sniper)
- [ ] Design targeting algorithms for 4 preference modes
- [ ] Establish line of sight rules for terrain/elevation

### Resource Economy
- [ ] Define in-battle resource types and acquisition
- [ ] Establish costs: deployment, abilities, mid-battle upgrades
- [ ] Design progression economy (permanent improvements)
- [ ] Create resource flow diagram

---

## 3. Enemy Intelligence Systems

### Arch-Enemy Implementation
- [ ] Outline 3 distinct villain AI personalities
- [ ] Define concrete adaptation mechanisms with thresholds
- [ ] Design nemesis progression ("memory" of player strategies)
- [ ] Create villain decision tree flowchart

### Enemy Behaviors
- [ ] Define tower targeting logic for specialized enemies
- [ ] Design dynamic pathfinding algorithm
- [ ] Outline coordination behaviors between enemy types
- [ ] Create wave compositions for early/mid/late game

### Balance Parameters
- [ ] Establish visibility ranges per companion type
- [ ] Define communication ranges and limitations
- [ ] Set enemy detection/adaptation timing
- [ ] Create difficulty scaling metrics

---

## 4. Technical Feasibility

### AI Implementation
- [ ] Research existing adaptive AI in TD games
- [ ] Identify technical limitations for arch-enemy system
- [ ] Create simplified villain AI prototype
- [ ] Define fallback behaviors if complex AI too costly

### Performance
- [ ] Estimate processing for multiple AI decision trees
- [ ] Identify fog of war rendering bottlenecks
- [ ] Research pathfinding with destructible environments
- [ ] Determine companion/ability scalability limits

### Interface Complexity
- [ ] List all required UI elements
- [ ] Design mockups for complex screens
- [ ] Create UI element priority hierarchy
- [ ] Identify information overload points

---

## 5. Unique Selling Point Refinement

### No God View Perspective
- [ ] Create scenarios highlighting limited info tension
- [ ] Design rewarding scouting mechanics
- [ ] Refine alert system (meaningful but not overwhelming)
- [ ] Design flow states balancing challenge vs. frustration

### Party-Based Tower Defense
- [ ] Define companion relationship/attachment mechanics
- [ ] Design specialization paths encouraging diverse compositions
- [ ] Create sample companion backstories and personalities
- [ ] Design visual customization options

### D&D Integration
- [ ] Map D&D classes to tower defense roles
- [ ] Adapt D&D progression to TD mechanics
- [ ] Design companion abilities based on D&D spells
- [ ] Create D&D-inspired campaign narrative framework

---

## 6. Player Retention

### Progression Design
- [ ] Define XP and leveling mechanics
- [ ] Create skill tree mockup for one hero class
- [ ] Design companion upgrade system with permanent choices
- [ ] Map full progression curve (early → endgame)

### Social Features
- [ ] Design companion borrowing system
- [ ] Outline guild mechanics
- [ ] Create competitive elements (non-PvP)
- [ ] Design strategy sharing mechanisms

### Replayability
- [ ] Design randomization factors for waves/behavior
- [ ] Create challenge modes with unique constraints
- [ ] Design endless mode with scaling difficulty
- [ ] Outline post-campaign content

---

## 7. Production Planning

### MVP Definition
- [ ] Identify minimum feature set for core concept demo
- [ ] Define scope for playable prototype
- [ ] Create prioritized feature list
- [ ] Establish success criteria for validation

### Resource Requirements
- [ ] Estimate dev time for core systems
- [ ] Identify specialized skills needed
- [ ] Create high-level timeline with milestones
- [ ] Outline QA requirements

### Risk Mitigation
- [ ] Identify highest-risk features
- [ ] Design fallback options for challenging features
- [ ] Create contingency plans for scope reduction
- [ ] Design testing methodologies for complex systems

---

## 8. Monetization (If Applicable)

- [ ] Evaluate business models (premium/F2P/subscription)
- [ ] Identify monetizable elements that don't affect balance
- [ ] Design cosmetic customization options
- [ ] Outline expansion content for post-launch

---

## Priority Legend
- 🔴 **Critical** - Blocks development
- 🟡 **Important** - Affects core experience  
- 🟢 **Nice-to-have** - Can defer to later
