import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const kris = {
    type: 'water',
    easy: {
        level: 10,
        coins: 501,
        exp: 342,
        value: 3,
        firstTime: 'raylet',
        reward: ['voltin', 'blazo', '2 firegems'],
        inventory: createRandomInventory([
            { name: 'aqua', minLevel: 8, maxLevel: 10, minCards: 0, maxCards: 'none' },
            { name: 'mari', minLevel: 8, maxLevel: 10, minCards: 0, maxCards: 'none' },
            { name: 'liqui', minLevel: 8, maxLevel: 10, minCards: 0, maxCards: 'none' },
            { name: 'hydro', minLevel: 1, maxLevel: 3, minCards: 0, maxCards: 'none' },
            { name: 'rivera', minLevel: 1, maxLevel: 3, minCards: 0, maxCards: 'none' },
            { name: 'marine', minLevel: 1, maxLevel: 3, minCards: 0, maxCards: 'none' }
        ], 6)
    },
    normal: {
        level: 12,
        coins: 852,
        exp: 581,
        value: 4,
        firstTime: 'flora',
        reward: ['liqui', 'necro', '3 watergems'],
        inventory: createRandomInventory([
            { name: 'hydro', minLevel: 5, maxLevel: 8, minCards: 0, maxCards: 'none' },
            { name: 'rivera', minLevel: 5, maxLevel: 8, minCards: 0, maxCards: 'none' },
            { name: 'marine', minLevel: 5, maxLevel: 8, minCards: 0, maxCards: 'none' }
        ], 6)
    },
    hard: {
        level: 13,
        coins: 1192,
        exp: 813,
        value: 5,
        firstTime: ['angi', '3 firegems'],
        reward: ['flambae', 'fita', '4 naturegems'],
        inventory: createRandomInventory([
            { name: 'hydro', minLevel: 10, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'rivera', minLevel: 10, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'marine', minLevel: 10, maxLevel: 13, minCards: 0, maxCards: 'none' }
        ], 6)
    }
};
