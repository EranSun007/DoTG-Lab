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
            case 'PATH':
                return 'path.png';
            case 'BACKGROUND_TILE':
                return 'background_tile.png';
            default:
                console.warn(`Unknown asset type: ${type}`);
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
            'PATH',
            'BACKGROUND_TILE'
        ];

        const loadPromises = assets.map(assetType => {
            const assetPath = AssetLoader.getAssetType(assetType);
            if (!assetPath) {
                console.warn(`No asset path found for type: ${assetType}`);
                return Promise.resolve();
            }

            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    console.log(`Loaded asset: ${assetType} from ${assetPath}`); // More detailed log
                    this.assets.set(assetType, img);
                    resolve();
                };
                img.onerror = (error) => {
                    console.error(`Failed to load asset: ${assetType} from ${assetPath}`, error); // More detailed error
                    reject(new Error(`Failed to load asset: ${assetType}`));
                };
                const fullPath = `assets/images/${assetPath}`;
                console.log(`Attempting to load asset: ${assetType} from ${fullPath}`); // Log the full path
                img.src = fullPath;
            });
        });

        try {
            await Promise.all(loadPromises);
            console.log('All assets loaded successfully. Available assets:', Array.from(this.assets.keys())); // Log available assets
        } catch (error) {
            console.error('Error loading assets:', error);
            throw error;
        }
    }

    get(type) {
        return this.assets.get(type);
    }
} 