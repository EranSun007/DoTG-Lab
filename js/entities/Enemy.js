export class Enemy extends Entity {
    constructor(data) {
        super(data);
        this.speed = data.speed || 100; // pixels per second
        this.health = data.health || 100;
    }

    update(deltaTime, gameState) {
        // Example: Move right with frame-independent speed
        this.x += this.speed * deltaTime;
        
        // Future: Add path following, AI behavior, etc.
    }
} 