import { Entity } from './Entity.js';

export class Projectile extends Entity {
    constructor(data) {
        super(data);
        this.speed = data.speed || 10;
        this.damage = data.damage || 10;
        this.target = data.target;
        this.color = data.color || 'yellow';
        this.maxDistance = 1000; // Maximum distance before despawning
        this.distanceTraveled = 0;
        this.hasHit = false; // Track if projectile has hit something
    }

    /**
     * @param {number} deltaTime
     * @param {Object} gameState - Current game state
     */
    update(deltaTime, gameState) {
        if (!this.target || !this.target.isAlive()) return false;
        if (this.hasHit) return false;

        // Calculate direction to target
        const dx = this.target.x + this.target.width/2 - this.x;
        const dy = this.target.y + this.target.height/2 - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Move towards target
        if (distance > 5) {  // Changed from 1 to 5 for better collision
            const moveDistance = this.speed * deltaTime * 60;
            this.x += (dx / distance) * moveDistance;
            this.y += (dy / distance) * moveDistance;
            this.distanceTraveled += moveDistance;
            return true;
        } else {
            // Hit target
            this.target.health -= this.damage;
            this.hasHit = true; // Mark as hit
            console.log(`Projectile hit target for ${this.damage} damage! Target health: ${this.target.health}`);
            return false; // Signal to remove projectile
        }
    }

    /**
     * Check if the projectile should still exist
     * @returns {boolean} Whether the projectile is still alive
     */
    isAlive() {
        return !this.hasHit && this.distanceTraveled < this.maxDistance;
    }

    draw(ctx) {
        if (this.hasHit) return; // Don't draw if already hit

        // Draw projectile trail
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.moveTo(this.x - this.speed/2, this.y);
        ctx.lineTo(this.x + this.speed/2, this.y);
        ctx.stroke();

        // Draw projectile
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
} 