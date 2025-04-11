import { GameConstants } from './GameConstants.js';

export const UIConfig = {
    // Health bar settings
    HEALTH_BAR: {
        HEIGHT: GameConstants.HEALTH_BAR_HEIGHT,
        OFFSET: GameConstants.HEALTH_BAR_OFFSET,
        THRESHOLDS: {
            HIGH: GameConstants.HEALTH_THRESHOLD_HIGH,
            LOW: GameConstants.HEALTH_THRESHOLD_LOW
        },
        COLORS: GameConstants.HEALTH_BAR_COLORS
    },

    // Range indicator settings
    RANGE_INDICATOR: {
        COLORS: GameConstants.RANGE_INDICATOR_COLORS
    },

    // Animation durations
    ANIMATIONS: {
        ERROR_DISPLAY: GameConstants.ERROR_DISPLAY_DURATION,
        DAMAGE_FLASH: GameConstants.DAMAGE_FLASH_DURATION,
        BUTTON_FLASH: GameConstants.BUTTON_FLASH_DURATION
    },

    // Error display settings
    ERROR_DISPLAY: {
        BACKGROUND: GameConstants.ERROR_BACKGROUND_COLOR,
        Z_INDEX: GameConstants.DEBUG_PANEL_Z_INDEX
    }
}; 