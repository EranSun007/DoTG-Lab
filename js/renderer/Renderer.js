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
            // Fallback: Draw a simple path with rectangles
            this.ctx.fillStyle = '#4a4a4a';
            const pathWidth = 64;
            const pathY = (this.ctx.canvas.height - pathWidth) / 2; // Center vertically
            const pathSegments = [
                { x: 0, y: pathY, width: this.ctx.canvas.width, height: pathWidth }
            ];
            pathSegments.forEach(segment => {
                this.ctx.fillRect(segment.x, segment.y, segment.width, segment.height);
            });
        }
    }

    drawAll(entities) {
        if (!Array.isArray(entities)) return;
        entities.forEach(entity => this.drawEntity(entity));
    }

    drawEntity(entity) {
        const drawData = entity.getDrawData();
        if (!drawData) return;

        const { type, x, y, width, height, rotation = 0, range, color, health, maxHealth } = drawData;
        const asset = this.assetLoader.get(type);
        
        // Draw range circle for towers and hero
        if (range) {
            this.ctx.beginPath();
            // Use different colors for hero and tower ranges
            if (type === 'HERO') {
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
        
        if (!asset) {
            // Fallback to shape drawing if asset not found
            this.drawShape(drawData);
            return;
        }

        // Special handling for projectiles to add drop shadow
        if (type === 'PROJECTILE_ARROW') {
            this.ctx.save();
            // Draw shadow
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 5;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
            
            this.ctx.translate(x + width/2, y + height/2);
            this.ctx.rotate(rotation);
            this.ctx.drawImage(asset, -width/2, -height/2, width, height);
            
            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            this.ctx.restore();
            return;
        }

        // Draw health bar for enemies
        if (type === 'ENEMY_SCORPION' && health !== undefined && maxHealth !== undefined) {
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
        this.ctx.drawImage(asset, -width/2, -height/2, width, height);
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

    drawDebugOverlay(fps, entityCount) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`FPS: ${fps}`, 10, 20);
        this.ctx.fillText(`Entities: ${entityCount}`, 10, 35);
    }
} 