import { Debug } from '../utils/Debug.js';
import { UILabels } from '../config/UILabels.js';

export class Renderer {
    constructor(canvas, assetLoader) {
        this.canvas = canvas;
        this.ctx = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : canvas;
        this.assetLoader = assetLoader;
        
        // Initialize default rendering options
        this.debug = false;
        this.showGrid = false;
        this.showColliders = false;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        // Draw background tiles
        const backgroundTile = this.assetLoader.get('BACKGROUND_TILE');
        if (backgroundTile) {
            const tileSize = 32;
            for (let x = 0; x < this.canvas.width; x += tileSize) {
                for (let y = 0; y < this.canvas.height; y += tileSize) {
                    this.ctx.drawImage(backgroundTile, x, y, tileSize, tileSize);
                }
            }
        } else {
            // Fallback: Draw a solid color background
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            Debug.warn('Background tile asset not found, using fallback color');
        }

        // Draw path
        const pathImage = this.assetLoader.get('PATH');
        if (pathImage) {
            // Define a single horizontal path
            const pathWidth = 64; // Standard path width
            const pathY = (this.canvas.height - pathWidth) / 2; // Center vertically
            const pathSegments = [
                // Single horizontal line across the screen
                { x: 0, y: pathY, width: this.canvas.width, height: pathWidth }
            ];

            pathSegments.forEach(segment => {
                // Calculate number of tiles needed in each direction
                const tileSize = 64; // Base tile size
                const tilesX = Math.ceil(segment.width / tileSize);
                const tilesY = Math.ceil(segment.height / tileSize);
                
                // Draw tiles to fill the segment
                for (let tx = 0; tx < tilesX; tx++) {
                    for (let ty = 0; ty < tilesY; ty++) {
                        // Calculate the size of this specific tile (handle edge cases)
                        const tileWidth = Math.min(tileSize, segment.width - (tx * tileSize));
                        const tileHeight = Math.min(tileSize, segment.height - (ty * tileSize));
                        
                        // Calculate position for this tile
                        const tileX = segment.x + (tx * tileSize);
                        const tileY = segment.y + (ty * tileSize);
                        
                        // Draw the tile
                        this.ctx.drawImage(
                            pathImage,
                            0, 0, pathImage.width, pathImage.height, // Source rectangle
                            tileX, tileY, tileWidth, tileHeight // Destination rectangle
                        );
                    }
                }
            });
        } else {
            // Fallback: Draw a solid color path
            const pathWidth = 64;
            const pathY = (this.canvas.height - pathWidth) / 2;
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(0, pathY, this.canvas.width, pathWidth);
            Debug.warn('Path asset not found, using fallback color');
        }
    }

    drawAll(entities) {
        if (!Array.isArray(entities)) return;
        entities.forEach(entity => this.drawEntity(entity));
    }

    drawEntity(entity) {
        if (!entity || typeof entity.getDrawData !== 'function') {
            Debug.warn('Invalid entity passed to drawEntity:', entity);
            return;
        }

        const drawData = entity.getDrawData();
        if (!drawData) {
            Debug.warn('No drawData for entity:', entity);
            return;
        }

        this.ctx.save();

        // Draw health bar for enemies first (before any transformations)
        if (drawData.type.startsWith('ENEMY_') && typeof drawData.health === 'number' && typeof drawData.maxHealth === 'number') {
            const healthBarWidth = drawData.width;
            const healthBarHeight = 6;
            const healthBarY = drawData.y - healthBarHeight - 4;

            // Health bar background (red)
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            this.ctx.fillRect(drawData.x, healthBarY, healthBarWidth, healthBarHeight);

            // Health bar fill (green)
            const healthPercentage = Math.max(0, Math.min(1, drawData.health / drawData.maxHealth));
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
            this.ctx.fillRect(drawData.x, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);

            // Health bar border
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(drawData.x, healthBarY, healthBarWidth, healthBarHeight);
        }

        // Draw range indicator for towers
        if (drawData.type.startsWith('TOWER_') && drawData.range) {
            this.ctx.beginPath();
            this.ctx.arc(
                drawData.x + drawData.width / 2,
                drawData.y + drawData.height / 2,
                drawData.range,
                0,
                Math.PI * 2
            );
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.stroke();
        }

        // Draw the entity sprite or fallback shape
        const sprite = this.assetLoader.get(drawData.type);
        if (sprite) {
            // Center the sprite
            const centerX = drawData.x + drawData.width / 2;
            const centerY = drawData.y + drawData.height / 2;
            this.ctx.translate(centerX, centerY);
            
            this.ctx.drawImage(
                sprite,
                -drawData.width / 2,
                -drawData.height / 2,
                drawData.width,
                drawData.height
            );
        } else {
            // Fallback to colored rectangle
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(drawData.x, drawData.y, drawData.width, drawData.height);
        }

        this.ctx.restore();
    }

    drawGrid() {
        if (!this.showGrid) return;

        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';

        // Draw vertical lines
        for (let x = 0; x <= this.canvas.width; x += 32) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }

        // Draw horizontal lines
        for (let y = 0; y <= this.canvas.height; y += 32) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }

        this.ctx.stroke();
    }

    drawColliders(entities) {
        if (!Array.isArray(entities)) return;

        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        entities.forEach(entity => {
            const drawData = entity.getDrawData();
            if (drawData) {
                this.ctx.strokeRect(drawData.x, drawData.y, drawData.width, drawData.height);
            }
        });
    }

    drawDebugOverlay(gameState) {
        if (!gameState.debug) return;

        this.ctx.save();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';

        let y = 20;
        const debugState = gameState.debugMenu.getDebugState();
        const mousePos = gameState.input.getMousePosition();

        if (debugState.showFPS) {
            const fps = Math.round(1000 / gameState.deltaTime);
            this.ctx.fillText(`FPS: ${fps}`, 10, y);
            y += 20;
        }

        if (debugState.showEntityCount) {
            this.ctx.fillText(`Mouse: (${Math.round(mousePos.x)}, ${Math.round(mousePos.y)})`, 10, y);
            y += 20;
            this.ctx.fillText(`Wave: ${gameState.currentWave}`, 10, y);
            y += 20;
            this.ctx.fillText(`Gold: ${gameState.gold}`, 10, y);
            y += 20;
            this.ctx.fillText(`Lives: ${gameState.lives}`, 10, y);
            y += 20;
            this.ctx.fillText(`Hero HP: ${gameState.hero.health}/${gameState.hero.maxHealth}`, 10, y);
        }

        this.ctx.restore();
    }
} 