export const ANIMATION_CONFIG = {
    HERO: {
        IDLE: {
            assetKey: 'HERO_IDLE_SHEET',
            frameWidth: 32,
            frameHeight: 32,
            frameCount: 4,
            frameRate: 5,
            frames: [0, 1, 2, 3]
        },
        WALK: {
            assetKey: 'HERO_WALK_SHEET',
            frameWidth: 32,
            frameHeight: 32,
            frameCount: 4,
            frameRate: 8,
            frames: [0, 1, 2, 3]
        }
        // Add other animations like ATTACK, HURT etc. later
    }
    // Add configurations for other entities (enemies, etc.) here
}; 