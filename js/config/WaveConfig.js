// Placeholder path - Replace with actual path from GridManager later
const defaultPath = [ { x: 0, y: 100 }, { x: 500, y: 100 }, { x: 500, y: 400 } ];

export const WaveConfig = [
    {
        // Wave 1 (Index 0)
        waveNumber: 1,
        enemies: [ // Define specific enemies to spawn
            { type: 'basic', count: 5 }
        ],
        spawnInterval: 1.5, // seconds
        path: defaultPath,
        enemyTypes: { // Keep for reference/potential future use
            basic: { health: 100, speed: 25, value: 5, spawnWeight: 1 }
        },
        reward: 50,
        description: 'First wave - Basic enemies'
    },
    {
        // Wave 2 (Index 1)
        waveNumber: 2,
        enemies: [ // Define specific enemies to spawn
            { type: 'basic', count: 5 },
            { type: 'fast', count: 3 }
        ],
        spawnInterval: 1.2,
        path: defaultPath,
        enemyTypes: { // Keep for reference
            basic: { health: 100, speed: 25, value: 5, spawnWeight: 0.7 },
            fast: { health: 70, speed: 40, value: 8, spawnWeight: 0.3 }
        },
        reward: 75,
        description: 'Second wave - Mix of basic and fast enemies'
    },
    {
        // Wave 3 (Index 2)
        waveNumber: 3,
        enemies: [ // Define specific enemies to spawn
            { type: 'basic', count: 6 },
            { type: 'fast', count: 4 },
            { type: 'tank', count: 2 }
        ],
        spawnInterval: 1.0,
        path: defaultPath,
        enemyTypes: { // Keep for reference
            basic: { health: 120, speed: 25, value: 5, spawnWeight: 0.5 },
            fast: { health: 80, speed: 40, value: 8, spawnWeight: 0.3 },
            tank: { health: 300, speed: 15, value: 15, spawnWeight: 0.2 }
        },
        reward: 100,
        description: 'Third wave - All enemy types'
    }
    // Add more waves as needed
]; 