export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawEntity(entity) {
        if (!entity || !entity.draw) return;
        entity.draw(this.ctx);
    }

    drawAll(entities) {
        if (!Array.isArray(entities)) return;
        entities.forEach(entity => this.drawEntity(entity));
    }

    drawRangeCircle(x, y, radius, color, alpha = 0.2) {
        this.ctx.save();
        this.ctx.strokeStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawDirectionIndicator(x, y, angle, length, color) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, -4, length, 8);
        this.ctx.restore();
    }

    drawDebugOverlay(gameState) {
        if (!gameState.debug) return;

        this.ctx.save();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';

        // Draw FPS
        this.ctx.fillText(`FPS: ${Math.round(1000 / gameState.deltaTime)}`, 10, 20);

        // Draw mouse position
        const mousePos = gameState.input.getMousePosition();
        this.ctx.fillText(`Mouse: (${Math.round(mousePos.x)}, ${Math.round(mousePos.y)})`, 10, 40);

        // Draw entity counts
        this.ctx.fillText(`Enemies: ${gameState.enemies.length}`, 10, 60);
        this.ctx.fillText(`Towers: ${gameState.towers.length}`, 10, 80);

        this.ctx.restore();
    }
} 