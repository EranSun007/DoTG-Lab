# DEATH OF THE GODS: TOWER DEFENSE IN THE AGE OF AI
## Unified Design Document

> **Status:** Active Design Reference  
> **Last Updated:** January 2026  

---

## 🎮 CORE CONCEPT EVOLUTION

### No God View Perspective
**Death of the Gods** rejects the traditional omniscient perspective of tower defense games in favor of an immersive, limited-information approach:

- **Fog of War:** Map visibility is limited to areas currently observed by the hero or companion towers
- **Direct Command Requirement:** Hero must physically interact with companions to modify their behavior and settings
- **Communication Methods:**
  - **Physical Proximity:** Hero must reach the companion to issue new commands
  - **Class-Based Communication:** Special abilities allow remote command (e.g., druid's hawk messenger, psionic's mental link)
  - **Signal Items:** Consumable items that allow one-time remote commands
- **Strategic Uncertainty:** Enemy movements outside vision range remain unknown, creating tension and requiring proactive scouting

### Party-Based Tower Defense
The game reimagines the tower defense genre by implementing a party-based system where players bring their persistent hero and companion NPCs into each battle. Rather than building generic defensive structures, players strategically position their companions as "living towers" across the battlefield.

### Hero & Companion System
- **Hero-Centric Gameplay:** Each player controls a main hero character (based on D&D classes) who serves as both the commander and an active combatant
- **Companion Collection:** Heroes gradually build a roster of NPC companions through story progression, quest rewards, and treasure discoveries
- **Living Towers:** Companions can be positioned as stationary defensive units, each with unique abilities based on their class and specialization
- **Dynamic Party Management:** Players must strategically decide whether to keep companions mobile for resource gathering/scouting or position them as defensive units

---

## ⚔️ GAMEPLAY MECHANICS

### Tactical Tower Customization

**Area of Effect Control:**
- **Default Mode:** 180-degree line of fire, balanced range and damage
- **Berserker Mode:** 360-degree coverage with reduced range and potential friendly fire damage
- **Sniper Mode:** 30-degree field with extended range, slower firing rate, and increased damage/critical hit chance

**Target Selection Preferences:**
- **First Contact:** Tower focuses on the closest enemy, dealing maximum damage until elimination before switching targets
- **Selective Targeting:** Tower identifies and prioritizes the most powerful enemies first
- **Nemesis Targeting:** Tower intelligently targets enemies most vulnerable to its damage type
- **Manual Override:** Hero can temporarily direct tower focus during critical moments

**Line of Sight Mechanics:**
- Environmental features create strategic blind spots for tower placement
- Elevated terrain provides extended range but may have visibility limitations
- Destructible environment elements can dynamically alter line of sight during battle
- Special abilities can temporarily reveal hidden areas or bypass line of sight restrictions

### Progression System
- **Hero Journey:** Players begin with only their hero character, facing simple challenges that teach core mechanics
- **Companion Acquisition:** Through progression, heroes discover, rescue, or recruit companions with specialized abilities
- **Non-Linear Advancement:** Each companion has multiple potential upgrade paths that permanently affect their defensive capabilities
- **Skill Trees:** Both heroes and companions feature branching skill trees inspired by D&D character development

### Deployment Strategy

**Companion Roles:**
- **Offensive Towers:** Direct damage dealers (mages, archers, artillery specialists)
- **Support Towers:** Buffers and healers (clerics, bards, artificers)
- **Tactical Towers:** Lane controllers and debuffers (druids, enchanters, trapsmiths)

### Battle Progression
1. **Preparation Phase:** Review companion roster and plan initial positioning
2. **Early Waves:** Hero leads combat while gradually positioning companions as defensive units
3. **Mid-Battle Development:** Unlock temporary upgrades and reposition companions as needed
4. **Crisis Management:** Make tactical decisions about companion redeployment during overwhelming attacks

---

## 📚 KNOWLEDGE & INFORMATION SYSTEMS

### Bestiary System
- **Enemy Documentation:** Encountered enemy types are automatically recorded with basic information
- **Knowledge Expansion:** Additional data about weaknesses, behaviors, and tactics is gathered through repeated encounters
- **Tactical Analysis:** Bestiary provides strategic recommendations based on collected intelligence
- **In-Game Reference:** Players can access the bestiary during battles to inform decision-making

### Sensory Notification System

**Visual Threat Indicators:**
| Level | Color | Meaning |
|-------|-------|---------|
| No Threat | None | Situation normal |
| Code Yellow | Yellow | Enemies in area, not engaging |
| Code Orange | Orange | Enemies heading toward position |
| Code Red | Red | Active combat, taking damage |

### Fog of War UI Elements

**Three Visual States:**
- **Currently Visible Areas:** Full detail, regular view where the hero is currently present
- **Previously Visited Areas:** A "memory" or sketch-like representation - like a hand-drawn map
- **Unknown Areas:** Suggestive scribblings that hint at what might be there

---

## 😈 INTELLIGENT ADVERSARY SYSTEM

### Arch-Enemy Concept
- **Villain AI Director:** Each adventure features an intelligent opponent who actively counters player strategies
- **Dynamic Wave Composition:** Total number of enemies is predetermined, but composition and deployment are decided by the villain AI
- **Adaptive Response:** Enemy commander observes player tactics and deploys appropriate counters
- **Personality Types:** Different villain AIs have unique strategic preferences and tactical signatures

### Strategic Counter-Play
- **Resource Denial:** Villain targets player resource nodes to limit economic growth
- **Tower Targeting:** Enemy identifies and neutralizes critical defensive positions
- **Formation Adaptation:** Enemy units adjust formations based on player's defensive setup
- **Progressive Learning:** Villain effectiveness increases with repeated player encounters

### Meta-Narrative Structure
- **Nemesis System:** Recurring villains who escape defeat return with enhanced abilities
- **Rival Development:** As player heroes grow stronger, so do their primary antagonists
- **Personal Vendettas:** Enemies may target specific companions that defeated them previously

---

## 🧠 ADVANCED ENEMY AI SYSTEMS

### Smart Enemy Behaviors

**Tower Targeting:**
- Advanced enemies prioritize attacking companion-towers rather than rushing the base
- Specialized enemies focus on destroying key defensive positions

**Dynamic Pathfinding:**
- Tactical enemies can identify and create shortcuts through destructible terrain
- Path diversification causes enemies to split forces and attack from multiple angles

**Strategic Coordination:**
- Commander units deploy lesser monsters as shields before revealing themselves
- Enemy waves feature coordinated compositions with roles (tanks, DPS, support)
- "Learning" behaviors where repeated use of the same strategy becomes less effective

---

## 🎓 COMPLEXITY CURVE

1. **Individual Hero Mastery (Early Game)** - Basic combat, movement, resource management
2. **Companion Introduction (Early-Mid)** - First 1-2 companions, direct commands
3. **Squad Coordination (Mid Game)** - 3-4 companions, AI personalities emerge
4. **Multi-Squad Tactics (Mid-Late)** - Multiple groups, remote commands
5. **Advanced Combat (Throughout)** - Combos, spells, crafting, multiclass

---

## 🔄 GAMEPLAY LOOP

1. **Adventure Selection:** Choose mission based on available heroes and companions
2. **Party Configuration:** Select companions and review upgrade options
3. **Battle Execution:** Deploy companions strategically while actively controlling hero
4. **Reward Collection:** Gain experience, new companions, and upgrade materials
5. **Character Development:** Invest in hero and companion progression paths
6. **Repeat:** Take on more challenging adventures with enhanced party

---

## 📖 Related Documents

- [ROADMAP.md](./ROADMAP.md) - Implementation plan and task tracking
- [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) - Remaining design decisions
- [VERIFICATION.md](./VERIFICATION.md) - Design verification checklist
- [diagrams/](./diagrams/) - Visual system diagrams
