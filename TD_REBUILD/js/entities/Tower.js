import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { Enemy } from './Enemy.js';

export class Tower extends Entity {
    constructor(data) {
        super(data);
        this.range = data.range || 100;
        this.damage = data.damage || 10;
        this.attackSpeed = data.attackSpeed || 1;
        this.lastAttackTime = 0;
        this.target = null;
        this.rotation = 0;
        this.projectiles = [];
    }

    /**
     * @param {number} deltaTime
     * @param {Object} gameState - Current game state containing enemies, towers, and hero
     */
    update(deltaTime, gameState) {
        // Find closest enemy in range
        this.target = null;
        let closestDistance = this.range;

        // Use enemies directly from gameState
        gameState.enemies.forEach(enemy => {
            const dx = enemy.x - (this.x + this.width/2);
            const dy = enemy.y - (this.y + this.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDistance) {
                closestDistance = distance;
                this.target = enemy;
            }
        });

        // Update rotation to face target
        if (this.target) {
            const dx = this.target.x - (this.x + this.width/2);
            const dy = this.target.y - (this.y + this.height/2);
            this.rotation = Math.atan2(dy, dx);

            // Attack if cooldown is ready
            const currentTime = performance.now();
            if (currentTime - this.lastAttackTime > 1000 / this.attackSpeed) {
                this.attack();
                this.lastAttackTime = currentTime;
            }
        }

        // Update projectiles
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update(deltaTime, gameState);
            return projectile.isAlive();
        });
    }

    attack() {
        if (!this.target) return;

        const projectile = new Projectile({
            x: this.x + this.width/2,
            y: this.y + this.height/2,
            width: 8,
            height: 8,
            speed: 5,
            damage: this.damage,
            target: this.target
        });

        this.projectiles.push(projectile);
    }

    draw(ctx) {
        // Draw tower base
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw tower barrel
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = 'darkblue';
        ctx.fillRect(0, -4, this.width/2, 8);
        ctx.restore();

        // Draw range indicator
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.range, 0, Math.PI * 2);
        ctx.stroke();

        // Draw projectiles
        this.projectiles.forEach(projectile => projectile.draw(ctx));
    }
} 