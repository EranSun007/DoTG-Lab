import { GameConstants } from './GameConstants.js';

export const ProjectileConfig = {
    ARROW: {
        speed: GameConstants.PROJECTILE_SPEED,
        size: GameConstants.PROJECTILE_SIZE,
        damage: 20,
        splashRadius: 0,
        splashDamage: 0,
        assetType: 'PROJECTILE_ARROW'
    },
    FIREBALL: {
        speed: GameConstants.PROJECTILE_SPEED * 0.8,
        size: GameConstants.PROJECTILE_SIZE * 1.5,
        damage: 15,
        splashRadius: 30,
        splashDamage: 8,
        assetType: 'PROJECTILE_FIREBALL'
    },
    CANNONBALL: {
        speed: GameConstants.PROJECTILE_SPEED * 0.6,
        size: GameConstants.PROJECTILE_SIZE * 2,
        damage: 40,
        splashRadius: 40,
        splashDamage: 20,
        assetType: 'PROJECTILE_CANNONBALL'
    }
}; 