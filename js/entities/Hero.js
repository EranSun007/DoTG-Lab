import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { GRID_CONFIG } from '../config/GridConfig.js';

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
        
        // Grid movement properties
        this.targetX = this.x;
        this.targetY = this.y;
        this.moving = false;
        this.movementSpeed = GRID_CONFIG.CELL_SIZE * 4; // 4 cells per second
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
        
        // Update position if moving
        if (this.moving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 1) {
                // Reached target
                this.x = this.targetX;
                this.y = this.targetY;
                this.moving = false;
            } else {
                // Move towards target
                const moveDistance = this.movementSpeed * deltaTime;
                const ratio = moveDistance / distance;
                this.x += dx * ratio;
                this.y += dy * ratio;
            }
        }
        
        // Find closest enemy in range
        let target = null;
        let closestDistance = this.range;

        if (Array.isArray(gameState.enemies)) {
            gameState.enemies.forEach(enemy => {
                const dx = enemy.x - (this.x + this.width/2);
                const dy = enemy.y - (this.y + this.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    target = enemy;
                }
            });
        }

        // Attack if target found and cooldown is ready
        if (target && currentTime - this.lastAttackTime >= 1 / this.attackSpeed) {
            this.attack(target);
            this.lastAttackTime = currentTime;
        }

        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update(deltaTime, gameState);
            return projectile.isAlive();
        });
    }

    moveToCell(gridX, gridY) {
        const newX = gridX * GRID_CONFIG.CELL_SIZE;
        const newY = gridY * GRID_CONFIG.CELL_SIZE;
        
        // Check if the target cell is within grid bounds
        if (newX >= 0 && newX < GRID_CONFIG.GRID_WIDTH * GRID_CONFIG.CELL_SIZE &&
            newY >= 0 && newY < GRID_CONFIG.GRID_HEIGHT * GRID_CONFIG.CELL_SIZE) {
            this.targetX = newX;
            this.targetY = newY;
            this.moving = true;
        }
    }

    attack(target) {
        if (!target) return;

        const projectile = new Projectile({
            x: this.x + this.width/2,
            y: this.y + this.height/2,
            width: 8,
            speed: 300,
            damage: this.damage,
            target: target
        });

        this.projectiles.push(projectile);
    }
} 