import { Debug } from '../utils/Debug.js';
import { UILabels } from '../config/UILabels.js';
import { GameConstants } from '../config/GameConstants.js';
import { Camera } from './Camera.js';

/**
 * @class Renderer
 * @description Handles all canvas rendering operations
 * Centralizes drawing logic and provides consistent rendering API
 */
export class Renderer {
    /**
     * @constructor
     * @param {HTMLCanvasElement} canvas - The canvas element to render to
     * @param {AssetLoader} assetLoader - Asset loader for sprites and images
     */
    constructor(canvas, assetLoader) {
        this.canvas = canvas;
        this.ctx = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : canvas;
        this.assetLoader = assetLoader;
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        
        // Initialize default rendering options
        this.debug = false;
        this.showGrid = false;
        this.showColliders = false;
    }

    setCameraTarget(target) {
        this.camera.setTarget(target);
    }

    render(gameState, deltaTime) {
        if (!gameState) return;

        this.camera.update(deltaTime);

        this.clear();

        this.ctx.save();
        this.camera.applyTransform(this.ctx);

        this.drawWorldBackground();
        this.drawPath();
        this.drawGrid();

        // Draw obstacles (world-based)
        this.drawObstacles(gameState.obstacles);

        // Draw game entities (already in world coordinates)
        this.drawAll(gameState.enemies);
        this.drawAll(gameState.towers);
        this.drawAll(gameState.projectiles);
        if (gameState.hero) {
            this.drawEntity(gameState.hero);
        }
        
        if (this.showColliders) {
            const allEntities = [
                ...(gameState.enemies || []),
                ...(gameState.towers || []),
                ...(gameState.projectiles || []),
                ...(gameState.hero ? [gameState.hero] : [])
            ];
            this.drawColliders(allEntities);
        }

        this.ctx.restore();

        // --- Screen Space Drawing (After Camera Transform is Restored) ---
        // Draw UI elements and Debug overlay which should be fixed on screen
        if (gameState.debug) {
            this.drawDebugOverlay(gameState);
        }
        // Future: Draw UI elements here (e.g., HUD, menus)
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawWorldBackground() {
        const backgroundTile = this.assetLoader.get('BACKGROUND_TILE');
        const tileSize = 32; // Assuming square tiles

        if (backgroundTile) {
            // Calculate the start and end tile indices based on camera view
            const startX = Math.floor(this.camera.x / tileSize) * tileSize;
            const startY = Math.floor(this.camera.y / tileSize) * tileSize;
            // Draw slightly larger than the camera view to avoid gaps at edges
            const endX = Math.ceil((this.camera.x + this.camera.width) / tileSize) * tileSize;
            const endY = Math.ceil((this.camera.y + this.camera.height) / tileSize) * tileSize;

            this.ctx.fillStyle = this.ctx.createPattern(backgroundTile, 'repeat');
            // Fill the visible rectangle area with the pattern
            // Note: Using fillRect with pattern is often more efficient for large tiled areas
            // However, if specific tile drawing logic is needed, a loop is fine.
            this.ctx.fillRect(startX, startY, endX - startX, endY - startY);

            // // Alternative: Loop-based drawing (keep if pattern fill doesn't work as expected)
            // for (let x = startX; x < endX; x += tileSize) {
            //     for (let y = startY; y < endY; y += tileSize) {
            //         this.ctx.drawImage(backgroundTile, x, y, tileSize, tileSize);
            //     }
            // }
        } else {
            // Fallback: Draw a solid color background covering the camera view
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(this.camera.x, this.camera.y, this.camera.width, this.camera.height);
            Debug.warn('Background tile asset not found, using fallback color');
        }
    }

    drawPath() {
        const pathImage = this.assetLoader.get('PATH');
        const pathWidth = GameConstants.PATH_WIDTH;
        // Use the constant for world Y position
        const pathY = GameConstants.PATH_WORLD_Y;
        // Define path bounds in world coordinates (needs a proper map width ideally)
        const pathWorldStartX = -1000; // Arbitrarily large negative start
        const pathWorldEndX = 2000;   // Arbitrarily large positive end
        const pathWorldWidth = pathWorldEndX - pathWorldStartX;

        if (pathImage) {
             const tileSize = 64; // Use the path tile size
             const pattern = this.ctx.createPattern(pathImage, 'repeat-x'); // Repeat horizontally

            if (pattern) {
                this.ctx.fillStyle = pattern;
                 // Apply translation for the pattern start relative to path segment start
                 this.ctx.save();
                 this.ctx.translate(pathWorldStartX, pathY);
                 this.ctx.fillRect(0, 0, pathWorldWidth, pathWidth); 
                 this.ctx.restore();
             } else {
                 Debug.warn('Failed to create pattern for path image. Drawing tile by tile.');
                 this.drawPathFallback(pathWorldStartX, pathY, pathWorldWidth, pathWidth);
             }
        } else {
            // Fallback: Draw a solid color path in world coordinates
            this.drawPathFallback(pathWorldStartX, pathY, pathWorldWidth, pathWidth);
        }
    }
    
    // Helper for drawing path without pattern/image asset
    drawPathFallback(worldX, worldY, worldWidth, pathHeight) {
        this.ctx.fillStyle = '#3a3a3a';
        this.ctx.fillRect(worldX, worldY, worldWidth, pathHeight);
        Debug.warn('Path asset not found, using fallback color');
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

        // Check if it's animated data
        if (drawData.animationSheet && drawData.sourceX !== undefined && drawData.sourceY !== undefined) {
            const spriteSheet = this.assetLoader.get(drawData.animationSheet);
            
            if (spriteSheet && spriteSheet.complete && spriteSheet.naturalWidth > 0) {
                // Handle horizontal flipping
                if (drawData.flipHorizontal) {
                    this.ctx.translate(drawData.x + drawData.width, drawData.y); // Move pivot to right edge
                    this.ctx.scale(-1, 1);
                    // Draw image with adjusted destination x for flipped context
                    this.ctx.drawImage(
                        spriteSheet,
                        drawData.sourceX,
                        drawData.sourceY,
                        drawData.sourceWidth,
                        drawData.sourceHeight,
                        0, // Draw at the translated origin (which is now the right edge)
                        0,
                        drawData.width,
                        drawData.height
                    );
                } else {
                    // Draw normally (no flip)
                    this.ctx.drawImage(
                        spriteSheet,
                        drawData.sourceX,
                        drawData.sourceY,
                        drawData.sourceWidth,
                        drawData.sourceHeight,
                        drawData.x,
                        drawData.y,
                        drawData.width,
                        drawData.height
                    );
                }
            } else {
                Debug.warn(`Fallback triggered! Spritesheet invalid or missing. Key: ${drawData.animationSheet}`);
                this.drawFallbackRect(drawData);
            }
        } else {
            // --- Original Static Sprite Drawing Logic ---
            const sprite = this.assetLoader.get(drawData.type);
            
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                this.ctx.drawImage(
                    sprite,
                    drawData.x,
                    drawData.y,
                    drawData.width,
                    drawData.height
                );
            } else {
                Debug.warn(`Fallback triggered for static! Sprite invalid or missing. Type: ${drawData.type}`);
                this.drawFallbackRect(drawData);
            }
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

    // Helper for fallback drawing
    drawFallbackRect(drawData) {
        this.ctx.fillStyle = this.getFallbackColor(drawData.type);
        this.ctx.fillRect(
            drawData.x,
            drawData.y,
            drawData.width,
            drawData.height
        );
    }

    getFallbackColor(type) {
        // Ensure HERO type uses the correct color
        const baseType = type.startsWith('HERO') ? 'HERO' :
                         type.startsWith('TOWER') ? 'TOWER' :
                         type.startsWith('ENEMY') ? 'ENEMY' :
                         type.startsWith('PROJECTILE') ? 'PROJECTILE' : type;

        const colors = {
            TOWER: '#3498db',
            ENEMY: '#e74c3c',
            HERO: '#2ecc71',
            PROJECTILE: '#f1c40f',
            default: '#95a5a6' // Added a default color
        };
        // Use baseType here and provide default
        return colors[baseType] || colors.default;
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

    worldToScreen(worldX, worldY) {
        return this.camera.worldToScreen(worldX, worldY);
    }

    // Method to draw static obstacles
    drawObstacles(obstacles) {
        if (!Array.isArray(obstacles)) return;

        obstacles.forEach(obstacle => {
            // Simple rectangle drawing for now, assuming obstacles have x, y, width, height, color
            if (obstacle.color) {
                this.ctx.fillStyle = obstacle.color;
            } else {
                this.ctx.fillStyle = '#555'; // Default obstacle color
            }
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Optional: Add border or texture based on obstacle.type later
        });
    }
} 