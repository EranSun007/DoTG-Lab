export function getStateDiff(prevState, nextState) {
    const diff = {
        timestamp: nextState.time,
        changes: {}
    };

    // Compare primitive values
    for (const key in nextState) {
        if (typeof nextState[key] !== 'object') {
            if (prevState[key] !== nextState[key]) {
                diff.changes[key] = nextState[key];
            }
        }
    }

    // Compare entities by ID
    const entityDiffs = {
        added: [],
        removed: [],
        modified: []
    };

    // Track modified entities
    nextState.enemies.forEach(enemy => {
        const prevEnemy = prevState.enemies.find(e => e.id === enemy.id);
        if (!prevEnemy) {
            entityDiffs.added.push(enemy);
        } else if (JSON.stringify(prevEnemy) !== JSON.stringify(enemy)) {
            entityDiffs.modified.push(enemy);
        }
    });

    // Track removed entities
    prevState.enemies.forEach(enemy => {
        if (!nextState.enemies.find(e => e.id === enemy.id)) {
            entityDiffs.removed.push(enemy.id);
        }
    });

    if (entityDiffs.added.length || entityDiffs.removed.length || entityDiffs.modified.length) {
        diff.changes.entities = entityDiffs;
    }

    return diff;
} 