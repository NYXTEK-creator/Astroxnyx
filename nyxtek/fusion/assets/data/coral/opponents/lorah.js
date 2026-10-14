import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const lorah = {
    type: 'electric',
    easy: {
        level: 5,
        coins: 347,
        exp: 272,
        value: 3,
        firstTime: 'eli',
        reward: ['kera', 'nora', '3 darkgems'],
        inventory: createRandomInventory([
            { name: 'eli', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'kera', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'volti', minLevel: 1, maxLevel: 2, minCards: 1, maxCards: 1 }
        ], 5)
    },
    normal: {
        level: 5,
        coins: 590,
        exp: 462,
        value: 4,
        firstTime: 'demoni',
        reward: ['eli', 'flora', '3 naturegems'],
        inventory: createRandomInventory([
            { name: 'eli', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'kera', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'volti', minLevel: 1, maxLevel: 2, minCards: 1, maxCards: 1 }
        ], 5)
    },
    hard: {
        level: 6,
        coins: 825,
        exp: 647,
        value: 5,
        firstTime: ['volti', '3 lightgems'],
        reward: ['ember', 'aqua', '4 electricgems'],
        inventory: createRandomInventory([
            { name: 'eli', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'kera', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'volti', minLevel: 1, maxLevel: 2, minCards: 1, maxCards: 'none' }
        ], 5)
    }
};
