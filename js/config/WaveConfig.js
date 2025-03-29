export const WaveConfig = [
    {
        waveNumber: 1,
        enemies: [
            { type: 'basic', count: 4, delay: 2 }
        ],
        reward: 50,
        description: 'First wave - Basic enemies'
    },
    {
        waveNumber: 2,
        enemies: [
            { type: 'basic', count: 6, delay: 1.5 },
            { type: 'fast', count: 2, delay: 3 }
        ],
        reward: 75,
        description: 'Second wave - Mix of basic and fast enemies'
    },
    {
        waveNumber: 3,
        enemies: [
            { type: 'basic', count: 8, delay: 1.2 },
            { type: 'fast', count: 4, delay: 2 },
            { type: 'tank', count: 1, delay: 4 }
        ],
        reward: 100,
        description: 'Third wave - All enemy types'
    }
]; 