import { Entity } from '../base/Entity.js';
import { Projectile } from '../projectiles/Projectile.js';
import { GRID_CONFIG } from '../../config/GridConfig.js';
import { ANIMATION_CONFIG } from '../../config/AnimationConfig.js';
import { TERRAIN_TYPES } from '../../config/GridConfig.js';
import { Debug } from '../../utils/Debug.js';

/**
 * @class Hero
 * @extends Entity
 * @description Player-controlled entity with movement, combat abilities, and animations
 */
export class Hero extends Entity {
    /**
     * @constructor
     * @param {Object} data - Hero initialization data
     * @param {number} data.speed - Movement speed
     * @param {number} data.range - Attack range
     * @param {number} data.damage - Attack damage
     * @param {number} data.attackSpeed - Attacks per second
     * @param {Object} data.gridManager - Reference to the grid manager
     */
    constructor(data) {
        super(data);
        this.speed = data.speed || 2;
        this.abilities = data.abilities || [];
        this.level = data.level || 1;
        this.experience = data.experience || 0;
        this.range = data.range || 120;
        this.damage = data.damage || 15;
        this.attackSpeed = data.attackSpeed || 2;
        this.lastAttackTime = 0;
        this.projectiles = [];
        
        // Grid movement properties
        this.targetX = this.x;
        this.targetY = this.y;
        this.moving = false;
        this.movementSpeed = GRID_CONFIG.CELL_SIZE * 4; // 4 cells per second
        this.gridManager = data.gridManager; // Store reference to grid manager

        // Animation properties
        this.animationState = 'IDLE'; // 'IDLE', 'WALK'
        this.animationConfig = ANIMATION_CONFIG.HERO;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.directionX = 1; // 1 for right, -1 for left

        // Initialize hero's position in grid
        if (this.gridManager) {
            this.updateGridPosition();
        }
    }

    getAssetType() {
        return 'HERO';
    }

    getDrawData() {
        const currentAnim = this.animationConfig[this.animationState];
        if (!currentAnim) {
            console.error(`Invalid animation state: ${this.animationState}`);
            // Fallback to original non-animated draw data
            return {
                type: this.getAssetType(), // Fallback type
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                range: this.range
            };
        }

        // Ensure currentFrame is within bounds
        const safeFrame = Math.min(this.currentFrame, currentAnim.frames.length - 1);
        const frameIndex = currentAnim.frames[safeFrame];
        
        // Check for valid frameIndex
        if (frameIndex === undefined) {
            console.error(`Invalid frame index: ${safeFrame} for animation ${this.animationState}`);
            return {
                type: this.getAssetType(),
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                range: this.range
            };
        }
        
        const sx = frameIndex * currentAnim.frameWidth;
        const sy = 0; // Assuming horizontal spritesheet for now

        return {
            type: this.getAssetType(), // Still useful maybe for some logic?
            animationSheet: currentAnim.assetKey, // Key for the spritesheet
            x: this.x,
            y: this.y,
            width: this.width, // Destination width
            height: this.height, // Destination height
            sourceX: sx,
            sourceY: sy,
            sourceWidth: currentAnim.frameWidth,
            sourceHeight: currentAnim.frameHeight,
            flipHorizontal: this.directionX === -1, // Flip if facing left
            range: this.range // Keep range if needed for rendering indicators
        };
    }

    /**
     * Get the bounding box of the hero.
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Updates the grid with the hero's position
     */
    updateGridPosition() {
        if (!this.gridManager) return;

        const gridX = Math.floor(this.x / GRID_CONFIG.CELL_SIZE);
        const gridY = Math.floor(this.y / GRID_CONFIG.CELL_SIZE);
        
        // Nothing to do if position is invalid
        if (!this.gridManager.isValidCell(gridX, gridY)) return;
        
        // Clear previous position if different from current
        if (this.gridX !== undefined && this.gridY !== undefined) {
            // Only clear previous if it's different from current
            if (this.gridX !== gridX || this.gridY !== gridY) {
                this.gridManager.setCellTerrain(this.gridX, this.gridY, TERRAIN_TYPES.EMPTY);
            }
        }
        
        // Update current position references
        this.gridX = gridX;
        this.gridY = gridY;
        
        // Mark current position - use HERO type instead of BLOCKED to differentiate
        this.gridManager.setCellTerrain(gridX, gridY, TERRAIN_TYPES.HERO, this);
    }

    /**
     * Scan around the hero and clear any BLOCKED cells that shouldn't be blocked
     * This helps prevent invisible walls from persisting
     */
    clearStuckCells() {
        if (!this.gridManager) return;
        
        // Get current grid position
        const currentGridX = Math.floor(this.x / GRID_CONFIG.CELL_SIZE);
        const currentGridY = Math.floor(this.y / GRID_CONFIG.CELL_SIZE);
        
        // Define the checking area (an even wider area)
        const scanRadius = 8; // Increased radius for very thorough cleanup
        
        // Check for any permanently blocked cells
        let clearedCells = 0;
        
        // Scan around the hero
        for (let y = Math.max(0, currentGridY - scanRadius); y <= Math.min(GRID_CONFIG.GRID_HEIGHT - 1, currentGridY + scanRadius); y++) {
            for (let x = Math.max(0, currentGridX - scanRadius); x <= Math.min(GRID_CONFIG.GRID_WIDTH - 1, currentGridX + scanRadius); x++) {
                // Skip current hero cell
                if (x === currentGridX && y === currentGridY) continue;
                
                // Get the cell from grid manager - ensure it exists
                if (!this.gridManager.cells[y] || !this.gridManager.cells[y][x]) continue;
                
                const cell = this.gridManager.cells[y][x];
                
                // If cell is BLOCKED but doesn't have any entity occupying it,
                // it might be a "stuck" cell from previous hero movement
                if (cell.terrainType === TERRAIN_TYPES.BLOCKED && !cell.occupied) {
                    // Clear the cell
                    this.gridManager.setCellTerrain(x, y, TERRAIN_TYPES.EMPTY);
                    clearedCells++;
                }
            }
        }
        
        // Debug logging if cells were cleared (but rate-limited)
        if (clearedCells > 0) {
            // Only log once every few seconds to avoid spam
            const now = Date.now();
            if (!this.lastClearedLog || now - this.lastClearedLog > 5000) {
                Debug.log(`Hero cleared ${clearedCells} blocked cells`);
                this.lastClearedLog = now;
            }
        }
        
        // Make sure the hero's current cell is correctly marked as blocked
        this.gridManager.setCellTerrain(currentGridX, currentGridY, TERRAIN_TYPES.BLOCKED);
    }

    /**
     * @param {number} deltaTime
     * @param {Object} gameState - Current game state containing enemies, towers, and hero
     */
    update(deltaTime, gameState) {
        const currentTime = performance.now() / 1000;
        let dx = 0; // Track movement delta for direction/animation state

        // Clear stuck cells periodically (approx once per second)
        if (this.gridManager && Math.floor(currentTime) !== this.lastClearTime) {
            this.clearStuckCells();
            this.lastClearTime = Math.floor(currentTime);
        }

        // Update position if moving
        if (this.moving) {
            const currentDx = this.targetX - this.x;
            const currentDy = this.targetY - this.y;
            dx = currentDx; // Store dx for direction check
            const distance = Math.sqrt(currentDx * currentDx + currentDy * currentDy);

            // Update animation state when moving
            this.animationState = 'WALK';

            if (distance < 1) {
                // Reached target
                this.x = this.targetX;
                this.y = this.targetY;
                this.moving = false;
                this.animationState = 'IDLE'; // Change animation to IDLE
                this.currentFrame = 0; // Reset frame
                this.frameTimer = 0;
            } else {
                // Calculate the next position
                const moveDistance = this.movementSpeed * deltaTime;
                const ratio = moveDistance / distance;
                const nextX = this.x + currentDx * ratio;
                const nextY = this.y + currentDy * ratio;
                
                // Check if next position is valid (not inside an obstacle)
                const nextGridX = Math.floor(nextX / GRID_CONFIG.CELL_SIZE);
                const nextGridY = Math.floor(nextY / GRID_CONFIG.CELL_SIZE);
                const currentGridX = Math.floor(this.x / GRID_CONFIG.CELL_SIZE);
                const currentGridY = Math.floor(this.y / GRID_CONFIG.CELL_SIZE);
                
                // Always move if staying in same cell
                const movingWithinSameCell = (nextGridX === currentGridX && nextGridY === currentGridY);
                
                // If moving to new cell, check if it's our target (which should be walkable)
                const movingToTargetCell = (nextGridX === Math.floor(this.targetX / GRID_CONFIG.CELL_SIZE) && 
                                           nextGridY === Math.floor(this.targetY / GRID_CONFIG.CELL_SIZE));
                
                // Move if we're staying in the same cell OR moving to our valid target
                if (movingWithinSameCell || movingToTargetCell || 
                    !this.gridManager || this.gridManager.isCellWalkable(nextGridX, nextGridY)) {
                    this.x = nextX;
                    this.y = nextY;
                    
                    // Update direction based on horizontal movement
                    if (Math.abs(currentDx) > 0.1) { // Add tolerance
                        this.directionX = Math.sign(currentDx);
                    }
                } else {
                    // Hit an obstacle during movement, try to slide along it
                    // This allows diagonal movement to slide along walls
                    
                    // Try horizontal movement only
                    const nextXOnly = this.x + currentDx * ratio;
                    const nextXGridX = Math.floor(nextXOnly / GRID_CONFIG.CELL_SIZE);
                    if (nextXGridX !== currentGridX && this.gridManager.isCellWalkable(nextXGridX, currentGridY)) {
                        this.x = nextXOnly;
                        // Update direction
                        this.directionX = Math.sign(currentDx);
                    } 
                    // Try vertical movement only
                    else {
                        const nextYOnly = this.y + currentDy * ratio;
                        const nextYGridY = Math.floor(nextYOnly / GRID_CONFIG.CELL_SIZE);
                        if (nextYGridY !== currentGridY && this.gridManager.isCellWalkable(currentGridX, nextYGridY)) {
                            this.y = nextYOnly;
                        } else {
                            // Can't move at all, stop
                            this.moving = false;
                            this.animationState = 'IDLE';
                            this.currentFrame = 0;
                            this.frameTimer = 0;
                            Debug.log(`Hero blocked at [${nextGridX}, ${nextGridY}]`);
                        }
                    }
                }
            }

            // Update grid position after movement
            if (this.gridManager) {
                this.updateGridPosition();
            }
        } else {
            // Ensure idle state if not moving
            if (this.animationState !== 'IDLE') {
                this.animationState = 'IDLE';
                this.currentFrame = 0;
                this.frameTimer = 0;
            }
        }

        // --- Update Animation Frame ---
        const currentAnimData = this.animationConfig[this.animationState];
        if (currentAnimData) {
            this.frameTimer += deltaTime;
            const frameDuration = 1 / currentAnimData.frameRate;
            
            // Check if it's time to advance to the next frame
            if (this.frameTimer >= frameDuration) {
                // Reset timer, keeping remainder for smoother animation
                this.frameTimer = this.frameTimer % frameDuration;
                
                // Move to next frame, ensuring we don't exceed frame count
                this.currentFrame = (this.currentFrame + 1) % currentAnimData.frames.length;
            }
        }
        // --- End Animation Update ---

        // Find closest enemy in range
        let target = null;
        let closestDistance = this.range;

        if (Array.isArray(gameState.enemies)) {
            gameState.enemies.forEach(enemy => {
                const dx = enemy.x - (this.x + this.width/2);
                const dy = enemy.y - (this.y + this.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    target = enemy;
                }
            });
        }

        // Attack if target found and cooldown is ready
        if (target && currentTime - this.lastAttackTime >= 1 / this.attackSpeed) {
            this.attack(target);
            this.lastAttackTime = currentTime;
        }

        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update(deltaTime, gameState);
            return projectile.isAlive();
        });
    }

    moveToCell(gridX, gridY) {
        // Special handling for tests - if no gridManager is provided, allow movement without validation
        if (!this.gridManager) {
            const newX = gridX * GRID_CONFIG.CELL_SIZE;
            const newY = gridY * GRID_CONFIG.CELL_SIZE;
            
            // Don't start moving if already at the target cell
            if (Math.floor(this.x / GRID_CONFIG.CELL_SIZE) === gridX && 
                Math.floor(this.y / GRID_CONFIG.CELL_SIZE) === gridY) {
                this.moving = false;
                return;
            }
            
            this.targetX = newX;
            this.targetY = newY;
            this.moving = true;
            return;
        }
        
        // Check if the target cell is in bounds
        if (!this.gridManager.isValidCell(gridX, gridY)) {
            return; // Don't attempt to move outside the grid
        }
        
        // Get current grid position
        const currentGridX = Math.floor(this.x / GRID_CONFIG.CELL_SIZE);
        const currentGridY = Math.floor(this.y / GRID_CONFIG.CELL_SIZE);
        
        // Don't start moving if already at the target cell
        if (currentGridX === gridX && currentGridY === gridY) {
            this.moving = false;
            return;
        }
        
        // Temporarily mark current position as empty to check if target is walkable
        if (this.gridManager.isValidCell(currentGridX, currentGridY)) {
            // Save original state to restore if needed
            const originalCellState = {
                terrainType: this.gridManager.cells[currentGridY][currentGridX].terrainType,
                occupied: this.gridManager.cells[currentGridY][currentGridX].occupied,
                entity: this.gridManager.cells[currentGridY][currentGridX].entity
            };
            
            // Temporarily mark current position as empty
            this.gridManager.setCellTerrain(currentGridX, currentGridY, TERRAIN_TYPES.EMPTY);
            
            // Check if target cell is walkable now that we've cleared our position
            const isTargetWalkable = this.gridManager.isCellWalkable(gridX, gridY);
            
            // Restore original state of our current cell
            this.gridManager.cells[currentGridY][currentGridX].terrainType = originalCellState.terrainType;
            this.gridManager.cells[currentGridY][currentGridX].occupied = originalCellState.occupied;
            this.gridManager.cells[currentGridY][currentGridX].entity = originalCellState.entity;
            
            // Don't move if target is unwalkable (but not due to current position)
            if (!isTargetWalkable) {
                Debug.log(`Cannot move to unwalkable cell [${gridX}, ${gridY}]`);
                return;
            }
        }
        
        // We can move to the target cell
        const newX = gridX * GRID_CONFIG.CELL_SIZE;
        const newY = gridY * GRID_CONFIG.CELL_SIZE;
        
        // Clear current position before moving
        if (this.gridManager.isValidCell(currentGridX, currentGridY)) {
            this.gridManager.setCellTerrain(currentGridX, currentGridY, TERRAIN_TYPES.EMPTY);
        }
        
        this.targetX = newX;
        this.targetY = newY;
        this.moving = true;
    }

    attack(target) {
        if (!target) return;

        const projectile = new Projectile({
            x: this.x + this.width/2,
            y: this.y + this.height/2,
            width: 8,
            speed: 300,
            damage: this.damage,
            target: target
        });

        this.projectiles.push(projectile);
    }
} 