import { Entity } from '../base/Entity.js';
import { GameConstants } from '../../config/GameConstants.js';

/**
 * @class Projectile
 * @extends Entity
 * @description Projectile entity fired by towers and heroes to damage enemies
 */
export class Projectile extends Entity {
    /**
     * @constructor
     * @param {Object} data - Projectile initialization data
     * @param {number} data.speed - Movement speed
     * @param {number} data.damage - Damage on hit
     * @param {Object} data.target - Target entity to track
     * @param {number} data.splashRadius - Area of effect radius
     * @param {number} data.splashDamage - Area damage amount
     */
    constructor(data) {
        super(data);
        this.speed = data.speed || 300;
        this.damage = data.damage || 20;
        this.target = data.target;
        this.splashRadius = data.splashRadius || 0;
        this.splashDamage = data.splashDamage || 0;
        this.hasHitTarget = false;
        this.rotation = 0;
    }

    getAssetType() {
        return 'PROJECTILE_ARROW';
    }

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

    update(deltaTime, gameState) {
        if (!this.target || this.hasHitTarget) return;

        // Calculate direction to target
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Update rotation to face target
        this.rotation = Math.atan2(dy, dx);

        // Move towards target
        if (distance > 0) {
            const moveX = (dx / distance) * this.speed * deltaTime;
            const moveY = (dy / distance) * this.speed * deltaTime;
            this.x += moveX;
            this.y += moveY;
        }

        // Check for collision with target
        if (distance < GameConstants.COLLISION_THRESHOLD) {
            if (this.target.takeDamage) {
                this.target.takeDamage(this.damage);
                this.hasHitTarget = true;
            }
        }
    }

    isAlive() {
        return !this.hasHitTarget;
    }
} 