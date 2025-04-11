export const GameConstants = {
    // Game settings
    INITIAL_LIVES: 3,
    INITIAL_GOLD: 100,
    GOLD_PER_KILL: 10,
    
    // Canvas and rendering
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TILE_SIZE: 32,
    PATH_WIDTH: 64,
    PATH_WORLD_Y: 600 / 2 - 64 / 2, // Calculated world Y position for the top of the path
    
    // Entity dimensions
    TOWER_SIZE: 40,
    TOWER_OFFSET: 20,
    PROJECTILE_SIZE: 8,
    PROJECTILE_SPEED: 300,
    
    // UI elements
    HEALTH_BAR_HEIGHT: 4,
    HEALTH_BAR_OFFSET: 8,
    HEALTH_THRESHOLD_HIGH: 0.5,
    HEALTH_THRESHOLD_LOW: 0.25,
    
    // Game loop
    MAX_DELTA_TIME: 1/30, // Cap at 30fps for stability
    TARGET_FPS: 60,
    MOVEMENT_SPEED_MULTIPLIER: 60,
    
    // Performance
    MAX_ENTITIES: 1000,
    MAX_PARTICLES: 200,
    
    // Game balance
    WAVE_START_DELAY: 2,
    LIVES_LOST_PENALTY: 1,
    
    // Asset loading
    ASSET_LOAD_TIMEOUT: 5000, // 5 seconds
    
    // UI settings
    ERROR_DISPLAY_DURATION: 5000,
    DAMAGE_FLASH_DURATION: 500,
    BUTTON_FLASH_DURATION: 200,
    
    // Collision and movement
    COLLISION_THRESHOLD: 5,
    
    // Debug settings
    DEBUG_MODE: false,
    SHOW_COLLIDERS: false,
    SHOW_GRID: false,
    DEBUG_PANEL_Z_INDEX: 1000,
    
    // Colors
    ERROR_BACKGROUND_COLOR: 'rgba(255, 0, 0, 0.9)',
    HEALTH_BAR_COLORS: {
        HIGH: 'green',
        MEDIUM: 'yellow',
        LOW: 'red'
    },
    RANGE_INDICATOR_COLORS: {
        TOWER: 'rgba(0, 150, 255, 0.2)',
        TOWER_FILL: 'rgba(0, 150, 255, 0.1)',
        HERO: 'rgba(0, 255, 0, 0.2)',
        HERO_FILL: 'rgba(0, 255, 0, 0.1)'
    }
}; 