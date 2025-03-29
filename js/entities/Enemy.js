import { Entity } from './Entity.js';

export class Enemy extends Entity {
    constructor(data) {
        super(data);
        this.type = data.type || 'basic'; // Default to basic enemy type instead of scorpion
        this.speed = data.speed || 1;
        this.value = data.value || 10;
        this.health = data.health || 100;
        this.maxHealth = this.health;
        this.rotation = 0;
        this.path = data.path || [
            { x: 0, y: 300 },    // Start from left
            { x: 800, y: 300 }   // End at right
        ];
        this.currentPathIndex = 0;
        this.targetPoint = this.path[0];
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
        return {
            type: this.getAssetType(),
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation,
            health: this.health,
            maxHealth: this.maxHealth
        };
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }

    update(deltaTime, gameState) {
        // Move towards target point
        const dx = this.targetPoint.x - this.x;
        const dy = this.targetPoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Update rotation to face movement direction
        this.rotation = Math.atan2(dy, dx);

        if (distance > 0) {
            const moveX = (dx / distance) * this.speed * deltaTime * 60;
            const moveY = (dy / distance) * this.speed * deltaTime * 60;
            this.x += moveX;
            this.y += moveY;
        }

        // Check if reached current target point
        if (distance < 5) {
            this.currentPathIndex++;
            if (this.currentPathIndex < this.path.length) {
                this.targetPoint = this.path[this.currentPathIndex];
            }
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

    isAlive() {
        return this.health > 0;
    }
} 