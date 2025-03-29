/**
 * AssetLoader handles asynchronous loading and caching of game assets
 */
export class AssetLoader {
    constructor() {
        this.assets = new Map();
        this.isLoading = false;
    }

    /**
     * Loads multiple assets from a key: URL map
     * @param {Object.<string, string>} assetMap - Map of asset keys to their URLs
     * @returns {Promise<void>} Resolves when all assets are loaded
     */
    async load(assetMap) {
        this.isLoading = true;
        const entries = Object.entries(assetMap);
        
        try {
            await Promise.all(
                entries.map(([key, url]) =>
                    new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => {
                            this.assets.set(key, img);
                            resolve();
                        };
                        img.onerror = () => reject(`Failed to load asset: ${url}`);
                        img.src = url;
                    })
                )
            );
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Retrieves a loaded asset by its key
     * @param {string} key - The asset key
     * @returns {HTMLImageElement|null} The loaded image or null if not found
     */
    get(key) {
        return this.assets.get(key) || null;
    }

    /**
     * Checks if an asset exists
     * @param {string} key - The asset key
     * @returns {boolean} Whether the asset exists
     */
    has(key) {
        return this.assets.has(key);
    }
} 