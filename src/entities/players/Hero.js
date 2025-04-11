import { Entity } from '../base/Entity.js';
import { Projectile } from '../projectiles/Projectile.js';
import { GRID_CONFIG } from '../../config/GridConfig.js';
import { ANIMATION_CONFIG } from '../../config/AnimationConfig.js';

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

        // Animation properties
        this.animationState = 'IDLE'; // 'IDLE', 'WALK'
        this.animationConfig = ANIMATION_CONFIG.HERO;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.directionX = 1; // 1 for right, -1 for left
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
     * @param {number} deltaTime
     * @param {Object} gameState - Current game state containing enemies, towers, and hero
     */
    update(deltaTime, gameState) {
        const currentTime = performance.now() / 1000;
        let dx = 0; // Track movement delta for direction/animation state

        // Update position if moving
        if (this.moving) {
            const currentDx = this.targetX - this.x;
            const currentDy = this.targetY - this.y;
            dx = currentDx; // Store dx for direction check
            const distance = Math.sqrt(currentDx * currentDx + currentDy * currentDy);

            if (distance < 1) {
                // Reached target
                this.x = this.targetX;
                this.y = this.targetY;
                this.moving = false;
                this.animationState = 'IDLE'; // Change animation to IDLE
                this.currentFrame = 0; // Reset frame
                this.frameTimer = 0;
            } else {
                // Move towards target
                const moveDistance = this.movementSpeed * deltaTime;
                const ratio = moveDistance / distance;
                this.x += currentDx * ratio;
                this.y += currentDy * ratio;
                this.animationState = 'WALK'; // Change animation to WALK

                // Update direction based on horizontal movement
                if (Math.abs(currentDx) > 0.1) { // Add tolerance
                    this.directionX = Math.sign(currentDx);
                }
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
        const newX = gridX * GRID_CONFIG.CELL_SIZE;
        const newY = gridY * GRID_CONFIG.CELL_SIZE;
        
        // Check if the target cell is within grid bounds
        if (newX >= 0 && newX < GRID_CONFIG.GRID_WIDTH * GRID_CONFIG.CELL_SIZE &&
            newY >= 0 && newY < GRID_CONFIG.GRID_HEIGHT * GRID_CONFIG.CELL_SIZE) {
            
            // Don't start moving if already at the target cell
            if (this.x === newX && this.y === newY) {
                this.moving = false;
                return;
            }

            this.targetX = newX;
            this.targetY = newY;
            this.moving = true;
            // No need to set animationState here, update() handles it
        }
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