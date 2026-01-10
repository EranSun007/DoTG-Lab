import { GridConfig, TERRAIN_TYPES } from '../config/GridConfig.js';

export class GridManager {
    constructor() {
        this.cells = [];
        this.hoveredCell = null;
        this.initializeGrid();
    }

    initializeGrid() {
        for (let y = 0; y < GridConfig.GRID_HEIGHT; y++) {
            this.cells[y] = [];
            for (let x = 0; x < GridConfig.GRID_WIDTH; x++) {
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
        const gridX = Math.floor(screenX / GridConfig.CELL_SIZE);
        const gridY = Math.floor(screenY / GridConfig.CELL_SIZE);

        if (this.isValidCell(gridX, gridY)) {
            return this.cells[gridY][gridX];
        }
        return null;
    }

    getScreenPositionFromCell(cell) {
        return {
            x: cell.x * GridConfig.CELL_SIZE,
            y: cell.y * GridConfig.CELL_SIZE
        };
    }

    isValidCell(x, y) {
        return x >= 0 && x < GridConfig.GRID_WIDTH &&
            y >= 0 && y < GridConfig.GRID_HEIGHT;
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
        ctx.strokeStyle = GridConfig.LINE_COLOR;
        ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= GridConfig.GRID_WIDTH; x++) {
            ctx.beginPath();
            ctx.moveTo(x * GridConfig.CELL_SIZE, 0);
            ctx.lineTo(x * GridConfig.CELL_SIZE, GridConfig.GRID_HEIGHT * GridConfig.CELL_SIZE);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= GridConfig.GRID_HEIGHT; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * GridConfig.CELL_SIZE);
            ctx.lineTo(GridConfig.GRID_WIDTH * GridConfig.CELL_SIZE, y * GridConfig.CELL_SIZE);
            ctx.stroke();
        }

        // Draw hover effect
        if (this.hoveredCell) {
            const pos = this.getScreenPositionFromCell(this.hoveredCell);
            ctx.fillStyle = GridConfig.HOVER_COLOR;
            ctx.fillRect(
                pos.x,
                pos.y,
                GridConfig.CELL_SIZE,
                GridConfig.CELL_SIZE
            );
        }
    }
} 