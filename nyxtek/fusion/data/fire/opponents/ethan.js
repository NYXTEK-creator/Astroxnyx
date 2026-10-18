import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const ethan = {
    type: 'dark',
    easy: {
        level: 11,
        coins: 1040,
        exp: 710,
        value: 3,
        firstTime: 'vapora',
        reward: ['mari', 'ember', '2 watergems'],
        inventory: createRandomInventory([
            { name: 'zyth', minLevel: 5, maxLevel: 7, minCards: 0, maxCards: 'none' },
            { name: 'umbra', minLevel: 5, maxLevel: 7, minCards: 0, maxCards: 'none' },
            { name: 'umbrin', minLevel: 5, maxLevel: 7, minCards: 0, maxCards: 'none' }
        ], 6)
    },
    normal: {
        level: 12,
        coins: 1767,
        exp: 1207,
        value: 4,
        firstTime: ['plasmi', '3 naturegems'],
        reward: ['flora', 'blazo', '3 electricgems'],
        inventory: createRandomInventory([
            { name: 'zyth', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'umbra', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'umbrin', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' }
        ], 6)
    },
    hard: {
        level: 14,
        coins: 2474,
        exp: 1690,
        value: 5,
        firstTime: ['fysi', '3 darkgems'],
        reward: ['leafyx', 'solare', '4 firegems'],
        inventory: createRandomInventory([
            { name: 'zyth', minLevel: 13, maxLevel: 15, minCards: 0, maxCards: 'none' },
            { name: 'umbra', minLevel: 13, maxLevel: 15, minCards: 0, maxCards: 'none' },
            { name: 'umbrin', minLevel: 13, maxLevel: 15, minCards: 0, maxCards: 'none' }
        ], 6)
    }
};
