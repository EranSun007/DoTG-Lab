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

    /**
     * Updates the grid based on a list of static obstacles.
     * @param {Array<Object>} obstacles - Array of obstacle objects { x, y, width, height }.
     */
    updateGridWithObstacles(obstacles) {
        if (!Array.isArray(obstacles)) return;

        obstacles.forEach(obstacle => {
            // Calculate the grid cell range covered by the obstacle
            const startCol = Math.floor(obstacle.x / GRID_CONFIG.CELL_SIZE);
            const endCol = Math.ceil((obstacle.x + obstacle.width) / GRID_CONFIG.CELL_SIZE);
            const startRow = Math.floor(obstacle.y / GRID_CONFIG.CELL_SIZE);
            const endRow = Math.ceil((obstacle.y + obstacle.height) / GRID_CONFIG.CELL_SIZE);

            for (let y = startRow; y < endRow; y++) {
                for (let x = startCol; x < endCol; x++) {
                    // Mark the cell as blocked terrain
                    this.setCellTerrain(x, y, TERRAIN_TYPES.BLOCKED);
                }
            }
        });
    }

    /**
     * Checks if a grid cell is valid for movement (walkable terrain, not occupied).
     * @param {number} gridX - The grid column index.
     * @param {number} gridY - The grid row index.
     * @returns {boolean} True if the cell is walkable, false otherwise.
     */
    isCellWalkable(gridX, gridY) {
        if (!this.isValidCell(gridX, gridY)) {
            return false; // Out of bounds
        }

        const cell = this.cells[gridY][gridX];

        // Check terrain type
        if (cell.terrainType === TERRAIN_TYPES.BLOCKED || 
            cell.terrainType === TERRAIN_TYPES.TOWER) { // Add other non-walkable types if needed
            return false;
        }

        // Check if occupied by an entity (redundant if terrainType is TOWER, but good practice)
        if (cell.occupied) {
             // Optionally allow walking if occupied by specific entity types (e.g., pickups)
             // if (cell.entity && cell.entity.allowOverlap) return true;
            return false;
        }

        return true; // Cell is within bounds, walkable terrain, and not occupied
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