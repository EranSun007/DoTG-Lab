import { Entity } from './Entity.js';
import { GameConstants } from '../config/GameConstants.js';
import { GRID_CONFIG } from '../config/GridConfig.js'; // Import grid config
import { Debug } from '../utils/Debug.js'; // Import Debug

export class Enemy extends Entity {
    constructor(data) {
        super(data);
        this.type = data.type || 'basic';
        this.speed = data.speed || 1;
        this.value = data.value || 10;
        this.health = data.health || 100;
        this.maxHealth = this.health;
        this.rotation = 0;
        
        // Pathfinding related
        this.path = null; // Will hold the calculated path (array of {x, y} world coords)
        this.currentPathIndex = 0;
        this.targetPoint = null; // Current point in the path we are moving towards
        this.gridManager = data.gridManager; // Expect gridManager from constructor data
        this.pathfinder = data.pathfinder;   // Expect pathfinder from constructor data
        this.goalX = data.goalX; // Expect goal world X from constructor data
        this.goalY = data.goalY; // Expect goal world Y from constructor data

        if (!this.gridManager || !this.pathfinder) {
            Debug.error('Enemy constructor missing gridManager or pathfinder!');
        } else {
             this.initializePath();
        }
        
        // Debug log for enemy initialization
        Debug.log('Enemy created:', {
            type: this.type,
            health: this.health,
            maxHealth: this.maxHealth,
            startPos: { x: this.x, y: this.y },
            goalPos: { x: this.goalX, y: this.goalY }
        });
    }

    initializePath() {
        if (!this.gridManager || !this.pathfinder) return;

        // Convert world start/goal to grid coordinates
        const startGridX = Math.floor(this.x / GRID_CONFIG.CELL_SIZE);
        const startGridY = Math.floor(this.y / GRID_CONFIG.CELL_SIZE);
        const goalGridX = Math.floor(this.goalX / GRID_CONFIG.CELL_SIZE);
        const goalGridY = Math.floor(this.goalY / GRID_CONFIG.CELL_SIZE);

        // Ensure start/goal are within grid bounds
         const clampedStartGridX = Math.max(0, Math.min(startGridX, GRID_CONFIG.GRID_WIDTH - 1));
         const clampedStartGridY = Math.max(0, Math.min(startGridY, GRID_CONFIG.GRID_HEIGHT - 1));
         const clampedGoalGridX = Math.max(0, Math.min(goalGridX, GRID_CONFIG.GRID_WIDTH - 1));
         const clampedGoalGridY = Math.max(0, Math.min(goalGridY, GRID_CONFIG.GRID_HEIGHT - 1));

        Debug.log(`Finding path for ${this.id} from [${clampedStartGridX},${clampedStartGridY}] to [${clampedGoalGridX},${clampedGoalGridY}]`);

        this.path = this.pathfinder.findPath(clampedStartGridX, clampedStartGridY, clampedGoalGridX, clampedGoalGridY);

        if (this.path && this.path.length > 0) {
            this.currentPathIndex = 0;
            this.targetPoint = this.path[this.currentPathIndex];
            Debug.log(`Path found for ${this.id} with ${this.path.length} points.`);
        } else {
            Debug.warn(`No path found for enemy ${this.id}. It might be stuck or goal is unreachable.`);
            this.path = null; // Ensure path is null if none found
            this.targetPoint = null;
            // Decide behavior: stay put, self-destruct, find nearest point?
            // For now, it will just sit there.
        }
    }

    getAssetType() {
        // Map enemy types to asset types
        const assetMap = {
            'basic': 'ENEMY_SCORPION',
            'fast': 'ENEMY_SCORPION',
            'tank': 'ENEMY_SCORPION'
        };
        return assetMap[this.type] || 'ENEMY_SCORPION';
    }

    getDrawData() {
        const drawData = {
            type: this.getAssetType(),
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation,
            health: this.health,
            maxHealth: this.maxHealth
        };
        
        // Debug log for draw data
        console.log('Enemy getDrawData:', drawData);
        return drawData;
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }

    update(deltaTime, gameState) {
        // If no path or path complete, do nothing (or maybe self-destruct?)
        if (!this.path || this.currentPathIndex >= this.path.length || !this.targetPoint) {
            // Potential logic: Check if goal reached (approximate)
             const goalDistance = Math.hypot(this.goalX - this.x, this.goalY - this.y);
             if (goalDistance < GRID_CONFIG.CELL_SIZE) { // Close enough to goal
                 Debug.log(`Enemy ${this.id} reached goal.`);
                 this.health = 0; // Mark as dead to be removed by manager
             }
            return; 
        }

        // Move towards current target point in the path
        const dx = this.targetPoint.x - this.x;
        const dy = this.targetPoint.y - this.y;
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
        
        // Update rotation to face movement direction
        this.rotation = Math.atan2(dy, dx);

        if (distanceToTarget > 0) {
            const moveX = (dx / distanceToTarget) * this.speed * deltaTime * GameConstants.MOVEMENT_SPEED_MULTIPLIER;
            const moveY = (dy / distanceToTarget) * this.speed * deltaTime * GameConstants.MOVEMENT_SPEED_MULTIPLIER;
            
            // Prevent overshooting the target point
            if (distanceToTarget > Math.hypot(moveX, moveY)) {
                this.x += moveX;
                this.y += moveY;
            } else {
                this.x = this.targetPoint.x;
                this.y = this.targetPoint.y;
            }
        }

        // Check if reached current target point (or very close)
        if (distanceToTarget < GameConstants.COLLISION_THRESHOLD) {
            this.currentPathIndex++;
            if (this.currentPathIndex < this.path.length) {
                this.targetPoint = this.path[this.currentPathIndex];
                 Debug.log(`Enemy ${this.id} moving to path point ${this.currentPathIndex}:`, this.targetPoint);
            } else {
                 Debug.log(`Enemy ${this.id} reached end of path.`);
                 this.targetPoint = null; // Reached end of path
                 // Now it will check proximity to goalX, goalY in the next update
            }
        }
    }
} 