import { Entity } from './Entity.js';
import { ProjectileConfig } from '../config/ProjectileConfig.js';
import { GameConstants } from '../config/GameConstants.js';
import { Debug } from '../utils/Debug.js';
import { TowerConfig } from '../config/TowerConfig.js';

export class Tower extends Entity {
    constructor(data) {
        super(data);
        // Fallback to the first available tower config if specific type or 'ranged' is missing
        const firstKey = Object.keys(TowerConfig)[0];
        const config = TowerConfig[data.type] || TowerConfig.ranged || TowerConfig[firstKey] || {};

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
        this.sprite = data.sprite || config.sprite || 'TOWER_BASIC'; // Use configured sprite or buffer default

        // Operational States
        this.states = data.states || config.states || [
            { name: "Standard", angle: 360, range: this.range, attackSpeed: this.attackSpeed, damage: this.damage }
        ];
        this.activeStateIndex = data.activeStateIndex !== undefined ? data.activeStateIndex : 0;
        this.targetAngle = data.targetAngle !== undefined ? data.targetAngle : 0; // In radians

        // Apply initial state stats
        this.applyActiveState();
    }

    applyActiveState() {
        const state = this.states[this.activeStateIndex];
        if (!state) return;

        this.shootingAngle = state.angle; // In degrees
        this.range = state.range;
        this.attackSpeed = state.attackSpeed;
        this.damage = state.damage;
    }

    setState(index) {
        if (index >= 0 && index < this.states.length) {
            this.activeStateIndex = index;
            this.applyActiveState();
        }
    }

    setTargetAngle(angle) {
        this.targetAngle = angle;
    }

    getAssetType() {
        return this.sprite;
    }

    getDrawData() {
        return {
            type: this.getAssetType(),
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation || 0,
            range: this.range,
            shootingAngle: this.shootingAngle,
            targetAngle: this.targetAngle
        };
    }

    findNearestEnemy(enemies) {
        let nearest = null;
        let minDistance = this.range;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        enemies.forEach(enemy => {
            const dx = enemy.x - centerX;
            const dy = enemy.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                // Check if within shooting angle
                if (this.shootingAngle < 360) {
                    const angleToEnemy = Math.atan2(dy, dx);
                    let diff = angleToEnemy - this.targetAngle;

                    // Normalize diff to [-PI, PI]
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;

                    const shootingAngleRad = (this.shootingAngle * Math.PI) / 180;
                    if (Math.abs(diff) > shootingAngleRad / 2) {
                        return; // Outside the arc
                    }
                }

                minDistance = distance;
                nearest = enemy;
            }
        });

        return nearest;
    }

    attack(target, projectileManager) {
        if (!target) return;

        // Update rotation to face target (even if targetAngle is fixed, the sprite might rotate)
        const dx = target.x - (this.x + this.width / 2);
        const dy = target.y - (this.y + this.height / 2);
        this.rotation = Math.atan2(dy, dx);

        // If no ProjectileManager is provided, do direct damage
        if (!projectileManager) {
            // Check cooldown for direct damage
            if (this.cooldown > 0) return;

            target.health -= this.damage;
            this.lastAttackTime = Date.now();
            this.cooldown = 1 / this.attackSpeed; // Convert to seconds
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
        this.cooldown = 1 / this.attackSpeed; // Convert to seconds
    }

    update(deltaTime, gameState) {
        // Update cooldown (deltaTime is in seconds)
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

        // Also upgrade state values if we want them to scale
        this.states.forEach(state => {
            state.range *= 1.2;
            state.damage *= 1.3;
            state.attackSpeed *= 1.1;
        });

        this.applyActiveState();
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
            level: this.level,
            states: JSON.parse(JSON.stringify(this.states)),
            activeStateIndex: this.activeStateIndex,
            targetAngle: this.targetAngle
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
        this.states = state.states;
        this.activeStateIndex = state.activeStateIndex !== undefined ? state.activeStateIndex : 0;
        this.targetAngle = state.targetAngle !== undefined ? state.targetAngle : 0;
        this.applyActiveState();
    }
} 