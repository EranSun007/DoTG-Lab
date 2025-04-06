import { GRID_CONFIG, TERRAIN_TYPES } from '../config/GridConfig.js';

export class GridManager {
    constructor() {
        this.cells = [];
        this.hoveredCell = null;
        this.initializeGrid();
    }

    initializeGrid() {
        for (let y = 0; y < GRID_CONFIG.GRID_HEIGHT; y++) {
            this.cells[y] = [];
            for (let x = 0; x < GRID_CONFIG.GRID_WIDTH; x++) {
                this.cells[y][x] = {
                    x,
                    y,
                    terrainType: TERRAIN_TYPES.EMPTY,
                    occupied: false,
                    entity: null
                };
            }
        }
    }

    getCellFromScreenPosition(screenX, screenY) {
        const gridX = Math.floor(screenX / GRID_CONFIG.CELL_SIZE);
        const gridY = Math.floor(screenY / GRID_CONFIG.CELL_SIZE);
        
        if (this.isValidCell(gridX, gridY)) {
            return this.cells[gridY][gridX];
        }
        return null;
    }

    getScreenPositionFromCell(cell) {
        return {
            x: cell.x * GRID_CONFIG.CELL_SIZE,
            y: cell.y * GRID_CONFIG.CELL_SIZE
        };
    }

    isValidCell(x, y) {
        return x >= 0 && x < GRID_CONFIG.GRID_WIDTH &&
               y >= 0 && y < GRID_CONFIG.GRID_HEIGHT;
    }

    setCellTerrain(x, y, terrainType) {
        if (this.isValidCell(x, y)) {
            this.cells[y][x].terrainType = terrainType;
        }
    }

    setCellOccupied(x, y, entity) {
        if (this.isValidCell(x, y)) {
            this.cells[y][x].occupied = true;
            this.cells[y][x].entity = entity;
        }
    }

    clearCell(x, y) {
        if (this.isValidCell(x, y)) {
            this.cells[y][x].occupied = false;
            this.cells[y][x].entity = null;
        }
    }

    updateHoveredCell(screenX, screenY) {
        this.hoveredCell = this.getCellFromScreenPosition(screenX, screenY);
    }

    draw(ctx) {
        // Draw grid lines
        ctx.strokeStyle = GRID_CONFIG.LINE_COLOR;
        ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= GRID_CONFIG.GRID_WIDTH; x++) {
            ctx.beginPath();
            ctx.moveTo(x * GRID_CONFIG.CELL_SIZE, 0);
            ctx.lineTo(x * GRID_CONFIG.CELL_SIZE, GRID_CONFIG.GRID_HEIGHT * GRID_CONFIG.CELL_SIZE);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= GRID_CONFIG.GRID_HEIGHT; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * GRID_CONFIG.CELL_SIZE);
            ctx.lineTo(GRID_CONFIG.GRID_WIDTH * GRID_CONFIG.CELL_SIZE, y * GRID_CONFIG.CELL_SIZE);
            ctx.stroke();
        }

        // Draw hover effect
        if (this.hoveredCell) {
            const pos = this.getScreenPositionFromCell(this.hoveredCell);
            ctx.fillStyle = GRID_CONFIG.HOVER_COLOR;
            ctx.fillRect(
                pos.x,
                pos.y,
                GRID_CONFIG.CELL_SIZE,
                GRID_CONFIG.CELL_SIZE
            );
        }
    }
} 