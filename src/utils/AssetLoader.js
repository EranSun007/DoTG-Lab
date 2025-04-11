import { GameConstants } from '../config/GameConstants.js';

/**
 * AssetLoader handles asynchronous loading and caching of game assets
 */
export class AssetLoader {
    constructor() {
        this.assets = new Map();
        this.loadingStatus = new Map();
        this.debug = false;
    }

    /**
     * Loads multiple assets from a key: URL map
     * @param {Object.<string, string>} assetConfig - Map of asset keys to their paths
     * @returns {Promise<void>} Resolves when all assets are loaded
     */
    async load(assetConfig) {
        if (this.debug) {
            console.log('Starting asset loading...', Object.keys(assetConfig));
        }
        
        const loadPromises = Object.entries(assetConfig).map(([key, path]) => {
            if (this.debug) {
                console.log(`Loading asset: ${key} from path: ${path}`);
            }
            this.loadingStatus.set(key, 'loading');
            
            return new Promise((resolve, reject) => {
                const img = new Image();
                
                const timeoutId = setTimeout(() => {
                    this.loadingStatus.set(key, 'timeout');
                    reject(new Error(`Timeout loading asset: ${path}`));
                }, GameConstants.ASSET_LOAD_TIMEOUT);
                
                img.onload = () => {
                    clearTimeout(timeoutId);
                    if (this.debug) {
                        console.log(`Successfully loaded asset: ${key}`);
                    }
                    this.assets.set(key, img);
                    this.loadingStatus.set(key, 'loaded');
                    resolve();
                };
                
                img.onerror = (error) => {
                    clearTimeout(timeoutId);
                    console.error(`Failed to load asset: ${key} from path: ${path}`, error);
                    this.loadingStatus.set(key, 'error');
                    reject(new Error(`Failed to load asset: ${path}`));
                };

                // Add crossOrigin attribute for CORS support
                img.crossOrigin = 'anonymous';
                
                // Start loading the image
                try {
                    img.src = path;
                } catch (error) {
                    clearTimeout(timeoutId);
                    console.error(`Error setting src for asset: ${key}`, error);
                    this.loadingStatus.set(key, 'error');
                    reject(error);
                }
            });
        });

        try {
            await Promise.all(loadPromises);
            if (this.debug) {
                console.log('All assets loaded successfully:', 
                    Array.from(this.loadingStatus.entries())
                        .map(([key, status]) => `${key}: ${status}`)
                        .join(', ')
                );
            }
        } catch (error) {
            console.error('Failed to load assets:', error);
            console.error('Loading status:', 
                Array.from(this.loadingStatus.entries())
                    .map(([key, status]) => `${key}: ${status}`)
                    .join(', ')
            );
            throw error;
        }
    }

    /**
     * Retrieves a loaded asset by its key
     * @param {string} key - The asset key
     * @returns {HTMLImageElement|null} The loaded image or null if not found
     */
    get(key) {
        const asset = this.assets.get(key);
        if (!asset && this.debug) {
            console.warn(`Asset not found: ${key}`);
        }
        return asset;
    }

    /**
     * Checks if an asset exists
     * @param {string} key - The asset key
     * @returns {boolean} Whether the asset exists
     */
    has(key) {
        return this.assets.has(key);
    }

    /**
     * Gets the loading status of an asset
     * @param {string} key - The asset key
     * @returns {string} The loading status ('loading', 'loaded', 'error', 'timeout', or 'unknown')
     */
    getStatus(key) {
        return this.loadingStatus.get(key) || 'unknown';
    }

    /**
     * Gets the loading status of all assets
     * @returns {Object} Map of asset keys to their loading status
     */
    getAllStatus() {
        return Object.fromEntries(this.loadingStatus);
    }
} 