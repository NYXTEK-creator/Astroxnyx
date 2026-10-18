import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const lorah = {
    type: 'electric',
    easy: {
        level: 6,
        coins: 507,
        exp: 348,
        value: 3,
        firstTime: 'eli',
        reward: ['kera', 'nora', '3 darkgems'],
        inventory: createRandomInventory([
            { name: 'eli', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'kera', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' }
        ], 5)
    },
    normal: {
        level: 7,
        coins: 863,
        exp: 594,
        value: 4,
        firstTime: 'flori',
        reward: ['eli', 'flora', '3 naturegems'],
        inventory: createRandomInventory([
            { name: 'eli', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'kera', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'electro', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 1 },
        ], 5)
    },
    hard: {
        level: 9,
        coins: 1208,
        exp: 829,
        value: 5,
        firstTime: ['electro', '3 lightgems'],
        reward: ['ember', 'aqua', '4 electricgems'],
        inventory: createRandomInventory([
            { name: 'eli', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 1 },
            { name: 'kera', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 1 },
            { name: 'electro', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 'none' },
        ], 5)
    }
};
