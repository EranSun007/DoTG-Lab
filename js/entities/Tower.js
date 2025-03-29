import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { Enemy } from './Enemy.js';

export class Tower extends Entity {
    constructor(data) {
        super(data);
        this.range = data.range;
        this.damage = data.damage;
        this.attackSpeed = data.attackSpeed;
        this.lastAttackTime = 0;
        this.target = null;
        this.rotation = 0;
        this.projectiles = [];
        this.color = data.color;
        this.splashRadius = data.splashRadius;
        this.splashDamage = data.splashDamage;
        this.projectileSpeed = data.projectileSpeed;
        this.projectileSize = data.projectileSize;
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
            width: this.projectileSize,
            height: this.projectileSize,
            speed: this.projectileSpeed,
            damage: this.damage,
            target: this.target,
            color: this.color,
            splashRadius: this.splashRadius,
            splashDamage: this.splashDamage
        });

        this.projectiles.push(projectile);
    }

    draw(ctx) {
        // Draw tower base
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw direction indicator
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, -4, this.width/2, 8);
        ctx.restore();

        // Draw range indicator
        ctx.strokeStyle = `${this.color}40`;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.range, 0, Math.PI * 2);
        ctx.stroke();

        // Draw projectiles
        this.projectiles.forEach(projectile => projectile.draw(ctx));
    }
} 