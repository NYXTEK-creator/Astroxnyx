import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const isaiah = {
    type: 'light',
    easy: {
        level: 11,
        coins: 866,
        exp: 591,
        value: 3,
        firstTime: 'kera',
        reward: ['eli', 'ember', '2 naturegems'],
        inventory: createRandomInventory([
            { name: 'siri', minLevel: 5, maxLevel: 7, minCards: 0, maxCards: 'none' },
            { name: 'auren', minLevel: 5, maxLevel: 7, minCards: 0, maxCards: 'none' },
            { name: 'glint', minLevel: 5, maxLevel: 7, minCards: 0, maxCards: 'none' },
        ], 6)
    },
    normal: {
        level: 12,
        coins: 1472,
        exp: 1005,
        value: 4,
        firstTime: ['gassy', '3 electricgems'],
        reward: ['fita', 'necro', '3 watergems'],
        inventory: createRandomInventory([
            { name: 'siri', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'auren', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'glint', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' }
        ], 6)
    },
    hard: {
        level: 14,
        coins: 2062,
        exp: 1408,
        value: 5,
        firstTime: ['lavae', '3 firegems'],
        reward: ['voltin', 'mari', '4 lightgems'],
        inventory: createRandomInventory([
            { name: 'siri', minLevel: 13, maxLevel: 15, minCards: 0, maxCards: 'none' },
            { name: 'auren', minLevel: 13, maxLevel: 15, minCards: 0, maxCards: 'none' },
            { name: 'glint', minLevel: 13, maxLevel: 15, minCards: 0, maxCards: 'none' }
        ], 6)
    }
};
