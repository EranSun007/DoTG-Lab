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
    }

    getAssetType() {
        return 'HERO';
    }

    getDrawData() {
        return {
            type: this.getAssetType(),
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            range: this.range
        };
    }

    /**
     * @param {number} deltaTime
     * @param {Object} gameState - Current game state containing enemies, towers, and hero
     */
    update(deltaTime, gameState) {
        const currentTime = performance.now() / 1000;
        
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

        // Attack if target found and cooldown is ready
        if (target && currentTime - this.lastAttackTime >= 1 / this.attackSpeed) {
            this.attack(target);
            this.lastAttackTime = currentTime;
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
            speed: 300, // Increased speed to match tower projectiles
            damage: this.damage,
            target: target
        });

        this.projectiles.push(projectile);
    }

    draw(ctx) {
        // Draw hero base
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw projectiles
        this.projectiles.forEach(projectile => projectile.draw(ctx));
    }
} 