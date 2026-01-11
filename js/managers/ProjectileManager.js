import { Projectile } from '../entities/Projectile.js';
import { ProjectileConfig } from '../config/ProjectileConfig.js';
import { Debug } from '../utils/Debug.js';

export class ProjectileManager {
    constructor() {
        this.projectiles = new Map();
    }

    createProjectile(type, x, y, target, source) {
        const config = ProjectileConfig[type];
        if (!config) {
            Debug.warn(`Invalid projectile type: ${type}`);
            return null;
        }

        const projectile = new Projectile({
            x,
            y,
            width: config.size,
            height: config.size,
            speed: config.speed,
            damage: source.damage,
            splashRadius: source.splashRadius || 0,
            splashDamage: source.splashDamage || 0,
            target,
            source,
            type,
            assetType: config.assetType
        });

        this.projectiles.set(projectile.id, projectile);
        return projectile;
    }

    updateAll(deltaTime, gameState) {
        for (const projectile of this.projectiles.values()) {
            projectile.update(deltaTime, gameState);
            if (!projectile.isAlive()) {
                this.projectiles.delete(projectile.id);
            }
        }
    }

    drawAll(ctx) {
        for (const projectile of this.projectiles.values()) {
            projectile.draw(ctx);
        }
    }

    getAll() {
        return Array.from(this.projectiles.values());
    }

    getProjectilesBySource(sourceId) {
        return Array.from(this.projectiles.values())
            .filter(projectile => projectile.source.id === sourceId);
    }

    clear() {
        this.projectiles.clear();
        Debug.log('ProjectileManager cleared');
    }

    getState() {
        return Array.from(this.projectiles.values()).map(projectile => projectile.getState());
    }

    syncState(states) {
        this.clear();
        states.forEach(state => {
            const projectile = new Projectile(state);
            this.projectiles.set(projectile.id, projectile);
        });
    }

    /**
     * Clean up and destroy the manager
     */
    destroy() {
        this.clear();
        this.projectiles = null;
        Debug.log('ProjectileManager destroyed');
    }
} 