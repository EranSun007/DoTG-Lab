export const GridConfig = {
    CELL_SIZE: 32,
    GRID_WIDTH: 40,
    GRID_HEIGHT: 23,
    LINE_COLOR: 'rgba(255, 255, 255, 0.1)',
    HOVER_COLOR: 'rgba(255, 255, 255, 0.2)',
    DEBUG_TEXT_COLOR: 'white',
    DEBUG_TEXT_SIZE: 12,
    DEBUG_TEXT_OFFSET: 5
};

// Export with alternative name for compatibility
export const GRID_CONFIG = GridConfig;

export const TERRAIN_TYPES = {
    EMPTY: 'empty',
    PATH: 'path',
    BLOCKED: 'blocked',
    TOWER: 'tower',
    HERO: 'hero'
}; 