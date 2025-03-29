update(deltaTime) {
    // Update all entities
    this.entities.forEach(entity => {
        if (entity.update) {
            entity.update(deltaTime, {
                enemies: this.enemies,
                towers: this.towers,
                hero: this.hero
            });
        }
    });

    // Update hero's projectiles
    if (this.hero && this.hero.projectiles) {
        this.hero.projectiles.forEach(projectile => {
            projectile.update(deltaTime, {
                enemies: this.enemies,
                towers: this.towers,
                hero: this.hero
            });
        });
    }

    // Update towers' projectiles
    this.towers.forEach(tower => {
        if (tower.projectiles) {
            tower.projectiles.forEach(projectile => {
                projectile.update(deltaTime, {
                    enemies: this.enemies,
                    towers: this.towers,
                    hero: this.hero
                });
            });
        }
    });

    // Clean up dead enemies and projectiles
    this.enemies = this.enemies.filter(enemy => enemy.isAlive());
    this.towers.forEach(tower => {
        if (tower.projectiles) {
            tower.projectiles = tower.projectiles.filter(projectile => projectile.isAlive());
        }
    });
    if (this.hero && this.hero.projectiles) {
        this.hero.projectiles = this.hero.projectiles.filter(projectile => projectile.isAlive());
    }

    // Spawn new enemies if needed
    this.spawnEnemy();
}

draw() {
    this.renderer.clear();
    this.renderer.drawBackground();

    // Draw all entities
    const allEntities = [
        ...this.enemies,
        ...this.towers,
        this.hero,
        ...(this.hero ? this.hero.projectiles : []),
        ...this.towers.flatMap(tower => tower.projectiles || [])
    ];
    this.renderer.drawAll(allEntities);

    // Draw UI
    this.uiManager.draw(this.ctx);
} 