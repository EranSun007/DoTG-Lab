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

    drawBackground(levelConfig) {
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

        if (!levelConfig || !levelConfig.path) return;

        // Draw path
        const pathImage = this.assetLoader.get('PATH');
        const pathWidth = GameConstants.PATH_WIDTH || 64;
        const path = levelConfig.path;

        if (pathImage) {
            // Draw path using segments
            for (let i = 0; i < path.length - 1; i++) {
                const p1 = path[i];
                const p2 = path[i + 1];

                // Calculate distance and angle between points
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                this.ctx.save();
                this.ctx.translate(p1.x, p1.y);
                this.ctx.rotate(angle);

                // Draw tiled path along the segment
                const tileSize = 64;
                const tilesX = Math.ceil(distance / tileSize);

                for (let x = 0; x < tilesX; x++) {
                    const drawX = x * tileSize;
                    const drawY = -pathWidth / 2;
                    // Draw each path piece
                    this.ctx.drawImage(pathImage, drawX, drawY, tileSize, pathWidth);
                }
                this.ctx.restore();
            }
        } else {
            // Fallback: Draw solid color line segments
            this.ctx.strokeStyle = '#3a3a3a';
            this.ctx.lineWidth = pathWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                this.ctx.lineTo(path[i].x, path[i].y);
            }
            this.ctx.stroke();
            Debug.warn('Path asset not found, using fallback color');
        }

        // Draw start and end icons last
        this.drawPathIcons(path);
    }

    drawPathIcons(path) {
        if (!path || path.length < 2) return;

        const startPoint = path[0];
        const endPoint = path[path.length - 1];
        const iconSize = 48;

        const homeIcon = this.assetLoader.get('HOME_ICON');
        const flagIcon = this.assetLoader.get('FLAG_ICON');

        if (homeIcon) {
            this.ctx.drawImage(
                homeIcon,
                startPoint.x - iconSize / 2,
                startPoint.y - iconSize / 2,
                iconSize,
                iconSize
            );
        }

        if (flagIcon) {
            this.ctx.drawImage(
                flagIcon,
                endPoint.x - iconSize / 2,
                endPoint.y - iconSize / 2,
                iconSize,
                iconSize
            );
        }
    }

    drawPathMarkers(path, isEditing) {
        if (!path || path.length === 0) return;

        this.ctx.save();

        // 1. Draw connecting dashed line
        if (path.length > 1) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = isEditing ? 'rgba(0, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([10, 5]);

            this.ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                this.ctx.lineTo(path[i].x, path[i].y);
            }
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // 2. Draw markers for each point
        path.forEach((point, index) => {
            const isHome = index === 0;
            const isEnd = index === path.length - 1;
            const radius = isEditing ? 15 : 10;

            // Marker circle
            this.ctx.beginPath();
            if (isHome) {
                this.ctx.fillStyle = '#2ecc71'; // Green
            } else if (isEnd) {
                this.ctx.fillStyle = '#e74c3c'; // Red
            } else {
                this.ctx.fillStyle = '#f1c40f'; // Yellow
            }

            this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Label
            this.ctx.fillStyle = 'black';
            this.ctx.font = `bold ${radius}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(index + 1, point.x, point.y);

            // Coordinates (only if editing)
            if (isEditing) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = '10px Arial';
                this.ctx.fillText(`(${point.x}, ${point.y})`, point.x, point.y + radius + 12);
            }
        });

        this.ctx.restore();
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
        const centerX = drawData.x + drawData.width / 2;
        const centerY = drawData.y + drawData.height / 2;
        const radius = drawData.range;
        const shootingAngle = drawData.shootingAngle || 360;
        const targetAngle = drawData.targetAngle || 0;

        this.ctx.beginPath();

        if (shootingAngle >= 360) {
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        } else {
            const halfAngleRad = (shootingAngle * Math.PI) / 180 / 2;
            const startAngle = targetAngle - halfAngleRad;
            const endAngle = targetAngle + halfAngleRad;

            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
        }

        // Get the appropriate color based on entity type
        const colorKey = drawData.type.startsWith('TOWER_') ? 'TOWER' :
            drawData.type.startsWith('HERO_') ? 'HERO' : 'TOWER';

        this.ctx.fillStyle = GameConstants.RANGE_INDICATOR_COLORS[`${colorKey}_FILL`];
        this.ctx.fill();
        this.ctx.strokeStyle = GameConstants.RANGE_INDICATOR_COLORS[colorKey];
        this.ctx.stroke();

        // Draw center line for partial arcs
        if (shootingAngle < 360) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(
                centerX + Math.cos(targetAngle) * radius,
                centerY + Math.sin(targetAngle) * radius
            );
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
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