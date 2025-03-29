import { Entity } from './Entity.js';

export class Enemy extends Entity {
    constructor(data) {
        super(data);
        this.speed = data.speed || 1;
        this.path = data.path || [
            { x: 0, y: 300 },    // Start from left
            { x: 400, y: 300 }, // Move to center
            { x: 800, y: 300 }  // End at right
        ];
        this.currentPathIndex = 0;
        this.targetPoint = this.path[0];
    }

    /**
     * @param {number} deltaTime
     * @param {GameState} gameState
     */
    update(deltaTime, gameState) {
        // Calculate direction to target
        const dx = this.targetPoint.x - this.x;
        const dy = this.targetPoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Move towards target
        if (distance > 1) {
            this.x += (dx / distance) * this.speed * deltaTime * 60;
            this.y += (dy / distance) * this.speed * deltaTime * 60;
        } else {
            // Reached current target, move to next point
            this.currentPathIndex = (this.currentPathIndex + 1) % this.path.length;
            this.targetPoint = this.path[this.currentPathIndex];
        }
    }

    draw(ctx) {
        // Draw enemy
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw path (for debugging)
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        ctx.stroke();
    }
} 