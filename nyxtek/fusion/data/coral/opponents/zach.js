import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const zach = {
    type: 'fire',
    easy: {
        level: 6,
        coins: 354,
        exp: 242,
        value: 3,
        firstTime: 'ember',
        reward: ['flambae', 'aqua', '2 firegems'],
        inventory: createRandomInventory([
            { name: 'flambae', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'ember', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
        ], 5)
    },
    normal: {
        level: 7,
        coins: 602,
        exp: 411,
        value: 4,
        firstTime: 'flambae',
        reward: ['ember', 'eli', '3 firegems'],
        inventory: createRandomInventory([
            { name: 'flambae', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'ember', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'flambo', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 1},
        ], 5)
    },
    hard: {
        level: 8,
        coins: 842,
        exp: 576,
        value: 5,
        firstTime: 'demoni',
        reward: ['flambae', 'lumi', '4 firegems'],
        inventory: createRandomInventory([
            { name: 'flambae', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 1 },
            { name: 'ember', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 1 },
            { name: 'flambo', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 'none'},
        ], 5)
    }
};
