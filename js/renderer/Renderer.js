import { Debug } from '../utils/Debug.js';
import { UILabels } from '../config/UILabels.js';
import { GameConstants } from '../config/GameConstants.js';

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
            const pathWidth = GameConstants.PATH_WIDTH;
            const pathY = (this.canvas.height - pathWidth) / 2;
            const pathSegments = [
                { x: 0, y: pathY, width: this.canvas.width, height: pathWidth }
            ];

            pathSegments.forEach(segment => {
                const tileSize = 64;
                const tilesX = Math.ceil(segment.width / tileSize);
                const tilesY = Math.ceil(segment.height / tileSize);

                for (let x = 0; x < tilesX; x++) {
                    for (let y = 0; y < tilesY; y++) {
                        const drawX = segment.x + x * tileSize;
                        const drawY = segment.y + y * tileSize;
                        this.ctx.drawImage(pathImage, drawX, drawY, tileSize, tileSize);
                    }
                }
            });
        } else {
            // Fallback: Draw a solid color path
            const pathWidth = GameConstants.PATH_WIDTH;
            const pathY = (this.canvas.height - pathWidth) / 2;
            this.ctx.fillStyle = '#3a3a3a';
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

        // Get sprite from asset loader
        const sprite = this.assetLoader.get(drawData.type);
        
        if (sprite) {
            // Draw sprite
            this.ctx.drawImage(
                sprite,
                drawData.x,
                drawData.y,
                drawData.width,
                drawData.height
            );
        } else {
            // Fallback: Draw colored rectangle
            this.ctx.fillStyle = this.getFallbackColor(drawData.type);
            this.ctx.fillRect(
                drawData.x,
                drawData.y,
                drawData.width,
                drawData.height
            );
        }

        // Draw range indicator if entity has range
        if (drawData.range) {
            this.drawRangeIndicator(drawData);
        }

        // Draw health bar if entity has health
        if (drawData.health !== undefined && drawData.maxHealth !== undefined) {
            this.drawHealthBar(drawData);
        }

        this.ctx.restore();
    }

    drawSprite(sprite, x, y, width, height) {
        if (!sprite) return;
        this.ctx.drawImage(sprite, x, y, width, height);
    }

    batchDraw(entities) {
        if (!Array.isArray(entities)) return;

        // Group entities by type for batch rendering
        const entityGroups = {};
        entities.forEach(entity => {
            if (!entity || typeof entity.getDrawData !== 'function') return;
            
            const drawData = entity.getDrawData();
            if (!drawData) return;

            const type = drawData.type;
            if (!entityGroups[type]) {
                entityGroups[type] = [];
            }
            entityGroups[type].push(drawData);
        });

        // Draw each group
        Object.entries(entityGroups).forEach(([type, group]) => {
            const sprite = this.assetLoader.get(type);
            
            this.ctx.save();
            
            if (sprite) {
                group.forEach(drawData => {
                    this.ctx.drawImage(sprite, drawData.x, drawData.y, drawData.width, drawData.height);
                });
            } else {
                // Fallback for missing sprites
                const color = this.getFallbackColor(type);
                this.ctx.fillStyle = color;
                group.forEach(drawData => {
                    this.ctx.fillRect(drawData.x, drawData.y, drawData.width, drawData.height);
                });
            }
            
            this.ctx.restore();
        });
    }

    drawRangeIndicator(drawData) {
        this.ctx.beginPath();
        this.ctx.arc(
            drawData.x + drawData.width / 2,
            drawData.y + drawData.height / 2,
            drawData.range,
            0,
            Math.PI * 2
        );
        
        // Get the appropriate color based on entity type
        const colorKey = drawData.type.startsWith('TOWER_') ? 'TOWER' : 
                        drawData.type.startsWith('HERO_') ? 'HERO' : 'TOWER';
        
        this.ctx.fillStyle = GameConstants.RANGE_INDICATOR_COLORS[`${colorKey}_FILL`];
        this.ctx.fill();
        this.ctx.strokeStyle = GameConstants.RANGE_INDICATOR_COLORS[colorKey];
        this.ctx.stroke();
    }

    drawHealthBar(drawData) {
        const barWidth = drawData.width;
        const barHeight = GameConstants.HEALTH_BAR_HEIGHT;
        const barX = drawData.x;
        const barY = drawData.y - GameConstants.HEALTH_BAR_OFFSET;

        // Draw background
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Draw health
        const healthPercent = drawData.health / drawData.maxHealth;
        let healthColor = GameConstants.HEALTH_BAR_COLORS.HIGH;
        if (healthPercent <= GameConstants.HEALTH_THRESHOLD_LOW) {
            healthColor = GameConstants.HEALTH_BAR_COLORS.LOW;
        } else if (healthPercent <= GameConstants.HEALTH_THRESHOLD_HIGH) {
            healthColor = GameConstants.HEALTH_BAR_COLORS.MEDIUM;
        }

        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }

    getFallbackColor(type) {
        const colors = {
            TOWER: '#3498db',
            ENEMY: '#e74c3c',
            HERO: '#2ecc71',
            PROJECTILE: '#f1c40f'
        };
        return colors[type] || '#95a5a6';
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
            if (!entity || typeof entity.getDrawData !== 'function') return;
            
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