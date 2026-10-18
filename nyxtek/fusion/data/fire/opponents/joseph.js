import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const joseph = {
    type: 'electric',
    easy: {
        level: 10,
        coins: 601,
        exp: 410,
        value: 3,
        firstTime: 'leafi',
        reward: ['ember', 'mari', '2 electricgems'],
        inventory: createRandomInventory([
            { name: 'electro', minLevel: 3, maxLevel: 5, minCards: 0, maxCards: 'none' },
            { name: 'rappit', minLevel: 3, maxLevel: 5, minCards: 0, maxCards: 'none' },
            { name: 'zappit', minLevel: 3, maxLevel: 5, minCards: 0, maxCards: 'none' }
        ], 6)
    },
    normal: {
        level: 12,
        coins: 590,
        exp: 594,
        value: 4,
        firstTime: 'ember',
        reward: ['voltin', 'shadewisp', '3 darkgems'],
        inventory: createRandomInventory([
            { name: 'electro', minLevel: 8, maxLevel: 10, minCards: 0, maxCards: 'none' },
            { name: 'rappit', minLevel: 8, maxLevel: 10, minCards: 0, maxCards: 'none' },
            { name: 'zappit', minLevel: 8, maxLevel: 10, minCards: 0, maxCards: 'none' }
        ], 6)
    },
    hard: {
        level: 13,
        coins: 825,
        exp: 829,
        value: 5,
        firstTime: ['ioni', '3 electricgems'],
        reward: ['liqui', 'lumi', '4 lightgems'],
        inventory: createRandomInventory([
            { name: 'electro', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'rappit', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'zappit', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' }
        ], 6)
    }
};
