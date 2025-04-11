import { Debug } from '../utils/Debug.js';
import { UILabels } from '../config/UILabels.js';

export class AssetLoader {
    constructor() {
        this.assets = new Map();
    }

    static getAssetType(type) {
        switch (type) {
            case 'TOWER_ARCHER':
                return 'tower_basic.png';
            case 'TOWER_MAGE':
                return 'tower_basic.png';
            case 'TOWER_CANNON':
                return 'tower_basic.png';
            case 'ENEMY_SCORPION':
                return 'enemy_scorpion.png';
            case 'PROJECTILE_ARROW':
                return 'projectile_arrow.png';
            case 'PROJECTILE_FIREBALL':
                return 'projectile_fireball.png';
            case 'PROJECTILE_CANNONBALL':
                return 'projectile_cannonball.png';
            case 'HERO':
                return 'hero.png';
            case 'HERO_IDLE_SHEET':
                return 'hero_idle_sheet.png';
            case 'HERO_WALK_SHEET':
                return 'hero_walk_sheet.png';
            case 'PATH':
                return 'path.png';
            case 'BACKGROUND_TILE':
                return 'background_tile.png';
            default:
                Debug.warn(`Unknown asset type: ${type}`);
                return null;
        }
    }

    async preloadAssets() {
        const assets = [
            'TOWER_ARCHER',
            'TOWER_MAGE',
            'TOWER_CANNON',
            'ENEMY_SCORPION',
            'PROJECTILE_ARROW',
            'PROJECTILE_FIREBALL',
            'PROJECTILE_CANNONBALL',
            'HERO',
            'HERO_IDLE_SHEET',
            'HERO_WALK_SHEET',
            'PATH',
            'BACKGROUND_TILE'
        ];

        const loadPromises = assets.map(assetType => {
            console.log(`[AssetLoader Map] Processing type: ${assetType}`);
            const assetPath = AssetLoader.getAssetType(assetType);
            if (!assetPath) {
                console.warn(`[AssetLoader Map] No path for type: ${assetType}, skipping load.`);
                Debug.warn(`${UILabels.DEBUG.ASSET_LOAD_FAIL}${assetType} - No path found`);
                return Promise.resolve();
            }
            
            const fullPath = `assets/${assetPath}`;
            console.log(`[AssetLoader Map] Calculated path for ${assetType}: ${fullPath}`);

            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    Debug.log(`${UILabels.DEBUG.ASSET_LOADED}${assetType} from ${assetPath}`);
                    this.assets.set(assetType, img);
                    resolve();
                };
                img.onerror = (error) => {
                    Debug.error(`${UILabels.DEBUG.ASSET_LOAD_FAIL}${assetType} from ${assetPath}`, error);
                    reject(new Error(`Failed to load asset: ${assetType}`));
                };
                
                console.log(`[AssetLoader Map] Setting img.src for ${assetType} to: ${fullPath}`);
                img.src = fullPath;
            });
        });

        try {
            await Promise.all(loadPromises);
            console.log('[AssetLoader] preloadAssets FINISHED. Keys in this.assets:', Array.from(this.assets.keys()));
            Debug.log('All assets loaded successfully. Available assets:', Array.from(this.assets.keys()));
        } catch (error) {
            Debug.error('Error loading assets:', error);
            throw error;
        }
    }

    get(type) {
        console.log(`[AssetLoader] Trying to get: ${type}`);
        const asset = this.assets.get(type);
        if (!asset) {
            console.error(`[AssetLoader] FAILED to get: ${type}`);
            Debug.warn(`${UILabels.DEBUG.ASSET_LOAD_FAIL}${type}`);
        } else {
            console.log(`[AssetLoader] SUCCESS getting: ${type}`, 
                `src: ${asset.src}, width: ${asset.naturalWidth}, height: ${asset.naturalHeight}, complete: ${asset.complete}`
            );
            if (!asset.complete || asset.naturalWidth === 0) {
                console.warn(`[AssetLoader] Asset ${type} image might not be fully loaded or has 0 width!`);
            }
        }
        return asset;
    }
} 