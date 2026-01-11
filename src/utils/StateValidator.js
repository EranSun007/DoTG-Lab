export const GameStateSchema = {
    required: ['gold', 'lives', 'currentWave', 'enemies', 'towers'],
    properties: {
        gold: { type: 'number', minimum: 0 },
        lives: { type: 'number', minimum: 0 },
        currentWave: { type: 'number', minimum: 1 },
        enemies: { type: 'array', items: { type: 'object' } },
        towers: { type: 'array', items: { type: 'object' } },
        hero: { type: 'object', nullable: true }
    }
};

export function validateGameState(state) {
    const errors = [];
    
    // Check required properties
    GameStateSchema.required.forEach(prop => {
        if (!(prop in state)) {
            errors.push(`Missing required property: ${prop}`);
        }
    });

    // Validate property types and constraints
    Object.entries(GameStateSchema.properties).forEach(([key, schema]) => {
        if (key in state) {
            const value = state[key];
            if (schema.type === 'number' && typeof value !== 'number') {
                errors.push(`${key} must be a number`);
            }
            if (schema.minimum !== undefined && value < schema.minimum) {
                errors.push(`${key} must be >= ${schema.minimum}`);
            }
            if (schema.type === 'array' && !Array.isArray(value)) {
                errors.push(`${key} must be an array`);
            }
        }
    });

    return errors;
} 