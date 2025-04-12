import { GridManager } from '../../src/managers/GridManager.js';
import { GRID_CONFIG, TERRAIN_TYPES } from '../../js/config/GridConfig.js';
import { createMockEntity } from '../test-utils/helpers.js';
import { mockCanvas, mockContext } from '../setup.js';

describe('GridManager', () => {
    let gridManager;
    let mockEntity;

    beforeEach(() => {
        gridManager = new GridManager();
        mockEntity = createMockEntity('test');
        // Reset mock context
        mockContext.fillRect.mockClear();
        mockContext.stroke.mockClear();
    });

    test('should initialize grid with correct dimensions', () => {
        expect(gridManager.cells.length).toBe(GRID_CONFIG.GRID_HEIGHT);
        expect(gridManager.cells[0].length).toBe(GRID_CONFIG.GRID_WIDTH);
    });

    test('should initialize cells with correct properties', () => {
        const cell = gridManager.cells[0][0];
        expect(cell.x).toBe(0);
        expect(cell.y).toBe(0);
        expect(cell.terrainType).toBe(TERRAIN_TYPES.EMPTY);
        expect(cell.occupied).toBe(false);
        expect(cell.entity).toBe(null);
    });

    test('should convert screen position to grid cell', () => {
        const cell = gridManager.getCellFromScreenPosition(32, 32);
        expect(cell.x).toBe(1);
        expect(cell.y).toBe(1);
    });

    test('should return null for invalid screen positions', () => {
        const cell = gridManager.getCellFromScreenPosition(-1, -1);
        expect(cell).toBe(null);
    });

    test('should convert grid cell to screen position', () => {
        const cell = gridManager.cells[1][1];
        const pos = gridManager.getScreenPositionFromCell(cell);
        expect(pos.x).toBe(32);
        expect(pos.y).toBe(32);
    });

    test('should validate cell coordinates', () => {
        expect(gridManager.isValidCell(0, 0)).toBe(true);
        expect(gridManager.isValidCell(-1, 0)).toBe(false);
        expect(gridManager.isValidCell(GRID_CONFIG.GRID_WIDTH, 0)).toBe(false);
        expect(gridManager.isValidCell(0, -1)).toBe(false);
        expect(gridManager.isValidCell(0, GRID_CONFIG.GRID_HEIGHT)).toBe(false);
    });

    test('should set cell terrain type', () => {
        gridManager.setCellTerrain(0, 0, TERRAIN_TYPES.PATH);
        expect(gridManager.cells[0][0].terrainType).toBe(TERRAIN_TYPES.PATH);
    });

    test('should not set terrain type for invalid cells', () => {
        gridManager.setCellTerrain(-1, -1, TERRAIN_TYPES.PATH);
        // Should not throw error
    });

    test('should set cell occupied status', () => {
        gridManager.setCellOccupied(0, 0, mockEntity);
        expect(gridManager.cells[0][0].occupied).toBe(true);
        expect(gridManager.cells[0][0].entity).toBe(mockEntity);
    });

    test('should clear cell occupied status', () => {
        gridManager.setCellOccupied(0, 0, mockEntity);
        gridManager.clearCell(0, 0);
        expect(gridManager.cells[0][0].occupied).toBe(false);
        expect(gridManager.cells[0][0].entity).toBe(null);
    });

    test('should update hovered cell based on mouse position', () => {
        gridManager.updateHoveredCell(32, 32);
        expect(gridManager.hoveredCell.x).toBe(1);
        expect(gridManager.hoveredCell.y).toBe(1);
    });

    test('should draw grid lines', () => {
        gridManager.draw(mockContext);
        
        // Check total number of lines (vertical + horizontal)
        const totalLines = (GRID_CONFIG.GRID_WIDTH + 1) + (GRID_CONFIG.GRID_HEIGHT + 1);
        expect(mockContext.beginPath).toHaveBeenCalledTimes(totalLines);
        
        // Check first vertical line
        expect(mockContext.moveTo).toHaveBeenCalledWith(0, 0);
        expect(mockContext.lineTo).toHaveBeenCalledWith(0, GRID_CONFIG.GRID_HEIGHT * GRID_CONFIG.CELL_SIZE);
        
        // Check first horizontal line
        expect(mockContext.moveTo).toHaveBeenCalledWith(0, 0);
        expect(mockContext.lineTo).toHaveBeenCalledWith(GRID_CONFIG.GRID_WIDTH * GRID_CONFIG.CELL_SIZE, 0);
    });

    test('should draw hover effect when cell is hovered', () => {
        gridManager.updateHoveredCell(32, 32);
        gridManager.draw(mockContext);
        
        expect(mockContext.fillRect).toHaveBeenCalledWith(
            32,
            32,
            GRID_CONFIG.CELL_SIZE,
            GRID_CONFIG.CELL_SIZE
        );
    });
}); 