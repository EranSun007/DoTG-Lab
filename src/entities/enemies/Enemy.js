import { Entity } from '../base/Entity.js';
import { GameConstants } from '../../config/GameConstants.js';
import { GRID_CONFIG } from '../../config/GridConfig.js'; // Import grid config
import { Debug } from '../../utils/Debug.js'; // Import Debug

/**
 * @class Enemy
 * @extends Entity
 * @description Enemy entity that follows paths and damages the player
 */
export class Enemy extends Entity {
    /**
     * @constructor
     * @param {Object} data - Enemy initialization data
     * @param {string} data.type - Enemy type
     * @param {number} data.speed - Movement speed
     * @param {number} data.value - Gold value when defeated
     * @param {number} data.health - Hit points
     * @param {Object} data.gridManager - Reference to the grid manager
     * @param {Object} data.pathfinder - Reference to the pathfinding system
     * @param {number} data.goalX - Goal X position in world coordinates
     * @param {number} data.goalY - Goal Y position in world coordinates
     */
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

        // Track retry attempts (avoid infinite loops)
        this.pathfindingAttempts = (this.pathfindingAttempts || 0) + 1;
        const maxRetries = 5;
        
        if (this.pathfindingAttempts > maxRetries) {
            // Only log this once when we exceed retries
            if (this.pathfindingAttempts === maxRetries + 1) {
                Debug.warn(`Enemy ${this.id} exceeded max pathfinding retries. Using fallback path.`);
            }
            
            // Create a simple fallback path toward goal
            this.createFallbackPath();
            
            // Set a timeout to try again after some time
            if (this.pathRetryTimeout) {
                clearTimeout(this.pathRetryTimeout);
            }
            
            this.pathRetryTimeout = setTimeout(() => {
                // Reset attempts after a cooldown
                this.pathfindingAttempts = 0;
                this.initializePath();
            }, 3000);
            
            return;
        }

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

        // Only log detailed path attempts periodically
        if (this.pathfindingAttempts === 1 || this.pathfindingAttempts % 5 === 0) {
            Debug.log(`Finding path for ${this.id} from [${clampedStartGridX},${clampedStartGridY}] to [${clampedGoalGridX},${clampedGoalGridY}]`);
        }

        this.path = this.pathfinder.findPath(clampedStartGridX, clampedStartGridY, clampedGoalGridX, clampedGoalGridY);

        if (this.path && this.path.length > 0) {
            this.currentPathIndex = 0;
            this.targetPoint = this.path[this.currentPathIndex];
            this.pathfindingAttempts = 0; // Reset counter on success
            Debug.log(`Path found for ${this.id} with ${this.path.length} points.`);
        } else {
            // Only log failures occasionally
            if (this.pathfindingAttempts === 1 || this.pathfindingAttempts % 5 === 0) {
                Debug.warn(`No path found for enemy ${this.id}. It might be stuck or goal is unreachable.`);
            }
            
            // Try to find a path to a different nearby goal
            if (this.pathfindingAttempts <= 2) {
                // Add some jitter to the goal position to find a nearby alternative
                const jitterAmount = GRID_CONFIG.CELL_SIZE * this.pathfindingAttempts;
                this.goalX += (Math.random() * 2 - 1) * jitterAmount;
                this.goalY += (Math.random() * 2 - 1) * jitterAmount;
                
                // Ensure the new goal is within bounds
                this.goalX = Math.max(0, Math.min(this.goalX, GRID_CONFIG.GRID_WIDTH * GRID_CONFIG.CELL_SIZE));
                this.goalY = Math.max(0, Math.min(this.goalY, GRID_CONFIG.GRID_HEIGHT * GRID_CONFIG.CELL_SIZE));
                
                // Clear any existing retry timeout
                if (this.pathRetryTimeout) {
                    clearTimeout(this.pathRetryTimeout);
                }
                
                this.pathRetryTimeout = setTimeout(() => this.initializePath(), 300);
            } else {
                this.createFallbackPath(); // Create a simple fallback path
            }
        }
    }
    
    /**
     * Create a simple fallback path when pathfinding fails
     */
    createFallbackPath() {
        // Create a direct line to the goal (assuming no walls)
        this.path = [];
        
        // This is a simplified path just to make the enemy move
        const steps = 10;
        const dx = (this.goalX - this.x) / steps;
        const dy = (this.goalY - this.y) / steps;
        
        for (let i = 0; i <= steps; i++) {
            this.path.push({
                x: this.x + dx * i,
                y: this.y + dy * i
            });
        }
        
        this.currentPathIndex = 0;
        this.targetPoint = this.path[this.currentPathIndex];
        Debug.log(`Using fallback path for enemy ${this.id}`);
    }

    /**
     * Check if the current path is blocked by an obstacle
     * @returns {boolean}
     */
    isPathBlocked() {
        if (!this.path || !this.targetPoint) return false;

        // Check if the next target point is blocked
        const targetGridX = Math.floor(this.targetPoint.x / GRID_CONFIG.CELL_SIZE);
        const targetGridY = Math.floor(this.targetPoint.y / GRID_CONFIG.CELL_SIZE);

        return !this.gridManager.isCellWalkable(targetGridX, targetGridY);
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
        
        return drawData;
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }

    update(deltaTime, gameState) {
        // If no path or path complete, try to initialize or check goal
        if (!this.path || this.currentPathIndex >= this.path.length || !this.targetPoint) {
            const goalDistance = Math.hypot(this.goalX - this.x, this.goalY - this.y);
            if (goalDistance < GRID_CONFIG.CELL_SIZE) {
                Debug.log(`Enemy ${this.id} reached goal.`);
                this.health = 0;
            } else {
                // Throttle path recalculation to avoid spam
                const now = Date.now();
                if (!this.lastPathRecalcTime || now - this.lastPathRecalcTime > 1000) {
                    this.initializePath();
                    this.lastPathRecalcTime = now;
                }
            }
            return;
        }

        // Check if current path is blocked (but don't check every frame to improve performance)
        const now = Date.now();
        if (!this.lastPathBlockCheck || now - this.lastPathBlockCheck > 500) {
            this.lastPathBlockCheck = now;
            
            if (this.isPathBlocked()) {
                Debug.log(`Path blocked for enemy ${this.id}, recalculating...`);
                // Reset pathfinding attempts when a previously valid path becomes blocked
                this.pathfindingAttempts = 0;
                this.initializePath();
                return;
            }
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
                // Only log occasionally to reduce spam
                if (this.currentPathIndex % 5 === 0) {
                    Debug.log(`Enemy ${this.id} moving to path point ${this.currentPathIndex}:`, this.targetPoint);
                }
            } else {
                Debug.log(`Enemy ${this.id} reached end of path.`);
                this.targetPoint = null;
            }
        }
    }

    /**
     * Sync the entity's state from serialized data
     * @param {Object} state - The serialized state
     */
    syncState(state) {
        Object.assign(this, state);
        
        // If this entity was created via sync without a gridManager/pathfinder,
        // ensure we don't try to initialize a path
        if (!this.gridManager || !this.pathfinder) {
            this.path = state.path || null;
            this.currentPathIndex = state.currentPathIndex || 0;
            this.targetPoint = state.targetPoint || null;
            Debug.log('Enemy syncState: path data copied from state without re-initialization');
        }
    }

    /**
     * Clean up any timeouts when the enemy is destroyed
     */
    destroy() {
        if (this.pathRetryTimeout) {
            clearTimeout(this.pathRetryTimeout);
        }
        super.destroy();
    }
} 