import { Entity } from './Entity.js';
import { ProjectileConfig } from '../config/ProjectileConfig.js';
import { GameConstants } from '../config/GameConstants.js';
import { Debug } from '../utils/Debug.js';

export class Tower extends Entity {
    constructor(data) {
        super(data);
        this.range = data.range || 200;
        this.damage = data.damage || 20;
        this.attackSpeed = data.attackSpeed || 1;
        this.projectileSpeed = data.projectileSpeed || 300;
        this.projectileSize = data.projectileSize || 10;
        this.color = data.color || '#00ff00';
        this.splashRadius = data.splashRadius || 0;
        this.splashDamage = data.splashDamage || 0;
        this.lastAttackTime = 0;
        this.cooldown = 0;
        this.projectileType = data.projectileType || 'ARROW';
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
            rotation: this.rotation || 0,
            range: this.range
        };
    }

    findNearestEnemy(enemies) {
        let nearest = null;
        let minDistance = this.range;

        enemies.forEach(enemy => {
            const dx = enemy.x - (this.x + this.width / 2);
            const dy = enemy.y - (this.y + this.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });

        return nearest;
    }

    attack(target, projectileManager) {
        if (!projectileManager) {
            Debug.error('Cannot create projectile: ProjectileManager not available');
            return;
        }

        // Create and fire projectile using ProjectileManager
        projectileManager.createProjectile(
            this.projectileType,
            this.x + this.width / 2,
            this.y + this.height / 2,
            target,
            this
        );
    }

    update(deltaTime, gameState) {
        // Update cooldown
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }

        // Find and attack nearest enemy in range
        if (this.cooldown <= 0) {
            const nearestEnemy = this.findNearestEnemy(gameState.enemies);
            if (nearestEnemy) {
                this.attack(nearestEnemy, gameState.projectileManager);
                this.cooldown = 1 / this.attackSpeed;
            }
        }
    }

    getState() {
        return {
            ...super.getState(),
            range: this.range,
            damage: this.damage,
            attackSpeed: this.attackSpeed,
            projectileSpeed: this.projectileSpeed,
            projectileSize: this.projectileSize,
            color: this.color,
            splashRadius: this.splashRadius,
            splashDamage: this.splashDamage,
            projectileType: this.projectileType
        };
    }

    syncState(state) {
        super.syncState(state);
        this.range = state.range;
        this.damage = state.damage;
        this.attackSpeed = state.attackSpeed;
        this.projectileSpeed = state.projectileSpeed;
        this.projectileSize = state.projectileSize;
        this.color = state.color;
        this.splashRadius = state.splashRadius;
        this.splashDamage = state.splashDamage;
        this.projectileType = state.projectileType;
    }
} 