import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';

export class Tower extends Entity {
    constructor(data) {
        super(data);
        this.range = data.range || 150;
        this.damage = data.damage || 20;
        this.attackSpeed = data.attackSpeed || 1;
        this.projectileSpeed = data.projectileSpeed || 300;
        this.projectileSize = data.projectileSize || 8;
        this.color = data.color || '#ff0000';
        this.splashRadius = data.splashRadius || 0;
        this.splashDamage = data.splashDamage || 0;
        this.lastAttackTime = 0;
        this.projectiles = [];
    }

    getAssetType() {
        return 'TOWER_BASIC';
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

    update(deltaTime, gameState) {
        const currentTime = performance.now() / 1000;
        
        // Check if enough time has passed since last attack
        if (currentTime - this.lastAttackTime >= 1 / this.attackSpeed) {
            // Find nearest enemy in range
            const nearestEnemy = this.findNearestEnemy(gameState.enemies);
            
            if (nearestEnemy) {
                // Create and fire projectile
                this.projectiles.push(new Projectile({
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2,
                    width: this.projectileSize,
                    height: this.projectileSize,
                    speed: this.projectileSpeed,
                    damage: this.damage,
                    splashRadius: this.splashRadius,
                    splashDamage: this.splashDamage,
                    target: nearestEnemy
                }));
                
                this.lastAttackTime = currentTime;
            }
        }
        
        // Update projectiles
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update(deltaTime, gameState);
            return !projectile.hasHitTarget;
        });
    }

    findNearestEnemy(enemies) {
        let nearest = null;
        let minDistance = this.range;
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });
        
        return nearest;
    }

    isAlive() {
        return true; // Towers don't have health yet
    }

    draw(ctx) {
        // Draw tower base
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw range indicator
        ctx.strokeStyle = `${this.color}40`;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.range, 0, Math.PI * 2);
        ctx.stroke();

        // Draw projectiles
        this.projectiles.forEach(projectile => projectile.draw(ctx));
    }
} 