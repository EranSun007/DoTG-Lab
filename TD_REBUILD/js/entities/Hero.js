import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';

export class Hero extends Entity {
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
        this.rotation = 0;
    }

    /**
     * @param {number} deltaTime
     * @param {Object} gameState - Current game state containing enemies, towers, and hero
     */
    update(deltaTime, gameState) {
        // Find closest enemy in range
        let target = null;
        let closestDistance = this.range;

        // Use enemies directly from gameState
        gameState.enemies.forEach(enemy => {
            const dx = enemy.x - (this.x + this.width/2);
            const dy = enemy.y - (this.y + this.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDistance) {
                closestDistance = distance;
                target = enemy;
            }
        });

        // Update rotation to face target
        if (target) {
            const dx = target.x - (this.x + this.width/2);
            const dy = target.y - (this.y + this.height/2);
            this.rotation = Math.atan2(dy, dx);

            // Auto-attack if enemy in range
            const currentTime = performance.now();
            if (currentTime - this.lastAttackTime > 1000 / this.attackSpeed) {
                this.attack(target);
                this.lastAttackTime = currentTime;
            }
        }

        // Update projectiles
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update(deltaTime, gameState);
            return projectile.isAlive();
        });
    }

    attack(target) {
        if (!target) return;

        const projectile = new Projectile({
            x: this.x + this.width/2,
            y: this.y + this.height/2,
            width: 8,
            height: 8,
            speed: 5,
            damage: this.damage,
            target: target,
            color: 'lime'
        });

        this.projectiles.push(projectile);
    }

    draw(ctx) {
        // Draw hero base
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw direction indicator
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = 'lightgreen';
        ctx.fillRect(0, -4, this.width/2, 8);
        ctx.restore();

        // Draw range indicator
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.range, 0, Math.PI * 2);
        ctx.stroke();

        // Draw projectiles
        this.projectiles.forEach(projectile => projectile.draw(ctx));
    }
} 