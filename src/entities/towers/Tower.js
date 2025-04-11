import { Entity } from '../base/Entity.js';
import { ProjectileConfig } from '../../config/ProjectileConfig.js';
import { GameConstants } from '../../config/GameConstants.js';
import { Debug } from '../../utils/Debug.js';
import { TowerConfig } from '../../config/TowerConfig.js';

/**
 * @class Tower
 * @extends Entity
 * @description Defensive structure that attacks enemies within range
 */
export class Tower extends Entity {
    /**
     * @constructor
     * @param {Object} data - Tower initialization data
     * @param {string} data.type - Tower type from TowerConfig
     * @param {number} data.range - Attack range
     * @param {number} data.damage - Damage per hit
     * @param {number} data.attackSpeed - Attacks per second
     * @param {number} data.cost - Gold cost to build
     */
    constructor(data) {
        super(data);
        const config = TowerConfig[data.type] || TowerConfig.ranged;
        
        this.type = data.type || 'ranged';
        this.range = data.range || config.range;
        this.damage = data.damage || config.damage;
        this.attackSpeed = data.attackSpeed || config.attackSpeed;
        this.projectileSpeed = data.projectileSpeed || config.projectileSpeed;
        this.projectileSize = data.projectileSize || config.projectileSize;
        this.color = data.color || config.color;
        this.splashRadius = data.splashRadius || config.splashRadius || 0;
        this.splashDamage = data.splashDamage || config.splashDamage || 0;
        this.lastAttackTime = 0;
        this.cooldown = 0;
        this.projectileType = data.projectileType || config.projectileType;
        this.level = 1;
        this.cost = data.cost || config.cost;
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
        if (this.cooldown > 0) return;
        
        if (!target) return;
        
        // If no ProjectileManager is provided, do direct damage
        if (!projectileManager) {
            target.health -= this.damage;
            this.lastAttackTime = Date.now();
            this.cooldown = 1000 / this.attackSpeed; // Convert to milliseconds
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

        this.lastAttackTime = Date.now();
        this.cooldown = 1000 / this.attackSpeed; // Convert to milliseconds
    }

    update(deltaTime, gameState) {
        // Update cooldown (deltaTime is in milliseconds)
        if (this.cooldown > 0) {
            this.cooldown = Math.max(0, this.cooldown - deltaTime);
        }

        // Find and attack nearest enemy in range, but only if not on cooldown
        if (this.cooldown <= 0) {
            const nearestEnemy = this.findNearestEnemy(gameState.enemies);
            if (nearestEnemy) {
                this.attack(nearestEnemy, gameState.projectileManager);
            }
        }
    }

    findTarget(enemies) {
        return this.findNearestEnemy(enemies);
    }

    upgrade() {
        this.level++;
        this.range *= 1.2;
        this.damage *= 1.3;
        this.attackSpeed *= 1.1;
    }

    getState() {
        return {
            ...super.getState(),
            type: 'tower',
            range: this.range,
            damage: this.damage,
            attackSpeed: this.attackSpeed,
            projectileSpeed: this.projectileSpeed,
            projectileSize: this.projectileSize,
            color: this.color,
            splashRadius: this.splashRadius,
            splashDamage: this.splashDamage,
            projectileType: this.projectileType,
            lastAttackTime: this.lastAttackTime,
            level: this.level
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
        this.lastAttackTime = state.lastAttackTime;
        this.level = state.level;
    }
} 