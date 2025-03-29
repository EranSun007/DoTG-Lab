export class Tower extends Entity {
    constructor(data) {
        super(data);
        this.range = data.range || 200;
        this.attackSpeed = data.attackSpeed || 1; // attacks per second
        this.lastAttackTime = 0;
        this.attackCooldown = 1 / this.attackSpeed;
    }

    update(deltaTime, gameState) {
        // Update attack cooldown
        this.lastAttackTime += deltaTime;

        // Check for targets and attack if cooldown is ready
        if (this.lastAttackTime >= this.attackCooldown) {
            const target = this.findTarget(gameState.enemies);
            if (target) {
                this.attack(target);
                this.lastAttackTime = 0;
            }
        }

        // Update projectiles with delta time
        this.updateProjectiles(deltaTime, gameState);
    }
} 