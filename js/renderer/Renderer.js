import { Debug } from '../utils/Debug.js';
import { UILabels } from '../config/UILabels.js';

export class Renderer {
    constructor(ctx, assetLoader) {
        this.ctx = ctx;
        this.assetLoader = assetLoader;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    drawBackground() {
        // Draw background tiles
        const backgroundTile = this.assetLoader.get('BACKGROUND_TILE');
        if (backgroundTile) {
            const tileSize = 32;
            for (let x = 0; x < this.ctx.canvas.width; x += tileSize) {
                for (let y = 0; y < this.ctx.canvas.height; y += tileSize) {
                    this.ctx.drawImage(backgroundTile, x, y, tileSize, tileSize);
                }
            }
        } else {
            // Fallback: Draw a solid color background
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            Debug.warn('Background tile asset not found, using fallback color');
        }

        // Draw path
        const pathImage = this.assetLoader.get('PATH');
        if (pathImage) {
            // Define a single horizontal path
            const pathWidth = 64; // Standard path width
            const pathY = (this.ctx.canvas.height - pathWidth) / 2; // Center vertically
            const pathSegments = [
                // Single horizontal line across the screen
                { x: 0, y: pathY, width: this.ctx.canvas.width, height: pathWidth }
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
            Debug.warn('Path asset not found');
        }
    }

    drawAll(entities) {
        if (!Array.isArray(entities)) return;
        entities.forEach(entity => this.drawEntity(entity));
    }

    /**
     * Draw an entity on the canvas
     * @param {Entity} entity - The entity to draw
     */
    drawEntity(entity) {
        // First draw the sprite using getDrawData
        const drawData = entity.getDrawData();
        const assetKey = drawData.type;

        try {
            const sprite = this.assetLoader.get(assetKey);
            if (sprite) {
                this.drawSprite(sprite, drawData);
            } else {
                // Fallback to debug shape
                this.drawDebugShape(drawData);
                Debug.warn(`${UILabels.DEBUG.ASSET_LOAD_FAIL}${assetKey}, using debug shape`);
            }
        } catch (error) {
            // Fallback to debug shape on any error
            this.drawDebugShape(drawData);
            Debug.error(`Error drawing entity: ${error.message}, using debug shape`);
        }

        // Draw projectiles if the entity has any
        if (entity.projectiles) {
            entity.projectiles.forEach(projectile => this.drawEntity(projectile));
        }

        // Then draw any additional visual elements (like range indicators)
        if (entity.draw) {
            entity.draw(this.ctx);
        }
    }

    /**
     * Draw a debug shape for an entity
     * @param {Object} drawData - The entity's draw data
     */
    drawDebugShape(drawData) {
        this.ctx.save();
        this.ctx.translate(drawData.x + drawData.width/2, drawData.y + drawData.height/2);
        this.ctx.rotate(drawData.rotation);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(-drawData.width/2, -drawData.height/2, drawData.width, drawData.height);
        this.ctx.restore();
    }

    drawShape(drawData) {
        const { type, x, y, width, height, color, rotation = 0 } = drawData;
        
        this.ctx.save();
        this.ctx.translate(x + width/2, y + height/2);
        this.ctx.rotate(rotation);
        
        switch (type) {
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, width/2, 0, Math.PI * 2);
                this.ctx.fillStyle = color;
                this.ctx.fill();
                break;
            case 'rectangle':
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-width/2, -height/2, width, height);
                break;
            case 'triangle':
                this.ctx.beginPath();
                this.ctx.moveTo(0, -height/2);
                this.ctx.lineTo(width/2, height/2);
                this.ctx.lineTo(-width/2, height/2);
                this.ctx.closePath();
                this.ctx.fillStyle = color;
                this.ctx.fill();
                break;
        }
        
        this.ctx.restore();
    }

    drawDebugOverlay(gameState) {
        if (!gameState.debug) return;

        this.ctx.save();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';

        const debugState = gameState.debugMenu.getDebugState();
        let y = 20;

        // Draw FPS if enabled
        if (debugState.showFPS) {
            this.ctx.fillText(`FPS: ${Math.round(1000 / gameState.deltaTime)}`, 10, y);
            y += 20;
        }

        // Draw entity counts if enabled
        if (debugState.showEntityCount) {
            this.ctx.fillText(`Enemies: ${gameState.enemies.length}`, 10, y);
            y += 20;
            this.ctx.fillText(`Towers: ${gameState.towers.length}`, 10, y);
            y += 20;
        }

        // Draw mouse position
        const mousePos = gameState.input.getMousePosition();
        this.ctx.fillText(`Mouse: (${Math.round(mousePos.x)}, ${Math.round(mousePos.y)})`, 10, y);
        y += 20;

        // Draw game state
        this.ctx.fillText(`Gold: ${gameState.gold}`, 10, y);
        y += 20;
        this.ctx.fillText(`Lives: ${gameState.lives}`, 10, y);
        y += 20;
        this.ctx.fillText(`Wave: ${gameState.currentWave}`, 10, y);
        y += 20;

        // Draw hero stats if hero exists
        if (gameState.hero) {
            this.ctx.fillText(`Hero HP: ${gameState.hero.health}/${gameState.hero.maxHealth}`, 10, y);
            y += 20;
            this.ctx.fillText(`Hero Range: ${gameState.hero.range}`, 10, y);
            y += 20;
            this.ctx.fillText(`Hero Damage: ${gameState.hero.damage}`, 10, y);
            y += 20;
        }

        // Draw game speed
        this.ctx.fillText(`Speed: ${gameState.speedMultiplier}x`, 10, y);
        y += 20;

        // Draw game state flags
        this.ctx.fillText(`Paused: ${gameState.paused ? 'Yes' : 'No'}`, 10, y);
        y += 20;
        this.ctx.fillText(`Wave in Progress: ${gameState.waveInProgress ? 'Yes' : 'No'}`, 10, y);
        y += 20;
        this.ctx.fillText(`Can Start Wave: ${gameState.canStartWave ? 'Yes' : 'No'}`, 10, y);

        this.ctx.restore();
    }

    drawGrid() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        const tileSize = 32; // Match GameConstants.TILE_SIZE
        for (let x = 0; x < this.ctx.canvas.width; x += tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.ctx.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.ctx.canvas.height; y += tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.ctx.canvas.width, y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawColliders(entities) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.lineWidth = 1;

        entities.forEach(entity => {
            const { x, y, width, height } = entity;
            this.ctx.strokeRect(x, y, width, height);
        });

        this.ctx.restore();
    }

    /**
     * Draw a sprite with proper transformations
     * @param {Image} sprite - The sprite image to draw
     * @param {Object} drawData - The entity's draw data
     */
    drawSprite(sprite, drawData) {
        const { x, y, width, height, rotation = 0, range, health, maxHealth } = drawData;

        // Draw range circle for towers and hero
        if (range) {
            this.ctx.beginPath();
            // Use different colors for hero and tower ranges
            if (drawData.type === 'HERO') {
                this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
            } else {
                this.ctx.strokeStyle = 'rgba(0, 150, 255, 0.2)';
                this.ctx.fillStyle = 'rgba(0, 150, 255, 0.1)';
            }
            this.ctx.arc(x + width/2, y + height/2, range, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }

        // Special handling for projectiles to add drop shadow
        if (drawData.type === 'PROJECTILE_ARROW') {
            this.ctx.save();
            // Draw shadow
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 5;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
            
            this.ctx.translate(x + width/2, y + height/2);
            this.ctx.rotate(rotation);
            this.ctx.drawImage(sprite, -width/2, -height/2, width, height);
            
            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            this.ctx.restore();
            return;
        }

        // Draw health bar for enemies
        if (drawData.type === 'ENEMY_SCORPION' && health !== undefined && maxHealth !== undefined) {
            // Draw health bar background
            const barWidth = width;
            const barHeight = 4;
            const barY = y - 8; // Position above enemy
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(x, barY, barWidth, barHeight);

            // Draw health bar
            const healthWidth = (health / maxHealth) * barWidth;
            this.ctx.fillStyle = health > maxHealth * 0.5 ? 'green' : 
                               health > maxHealth * 0.25 ? 'yellow' : 'red';
            this.ctx.fillRect(x, barY, healthWidth, barHeight);

            // Draw health bar border
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, barY, barWidth, barHeight);
        }

        // Normal drawing for other entities
        this.ctx.save();
        this.ctx.translate(x + width/2, y + height/2);
        this.ctx.rotate(rotation);
        this.ctx.drawImage(sprite, -width/2, -height/2, width, height);
        this.ctx.restore();
    }
} 