import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const matthew = {
    type: 'fire',
    easy: {
        level: 10,
        coins: 722,
        exp: 493,
        value: 3,
        firstTime: 'liqui',
        reward: ['nora', 'astri', '2 darkgems'],
        inventory: createRandomInventory([
            { name: 'flambo', minLevel: 3, maxLevel: 5, minCards: 0, maxCards: 'none' },
            { name: 'pheo', minLevel: 3, maxLevel: 5, minCards: 0, maxCards: 'none' },
            { name: 'blaziri', minLevel: 3, maxLevel: 5, minCards: 0, maxCards: 'none' },
            { name: 'pyrel', minLevel: 3, maxLevel: 5, minCards: 0, maxCards: 'none' },
            { name: 'cindra', minLevel: 3, maxLevel: 5, minCards: 0, maxCards: 'none' }
        ], 6)
    },
    normal: {
        level: 12,
        coins: 1227,
        exp: 838,
        value: 4,
        firstTime: ['magi', '3 watergems'],
        reward: ['flambae', 'eli', '3 naturegems'],
        inventory: createRandomInventory([
            { name: 'flambo', minLevel: 8, maxLevel: 10, minCards: 0, maxCards: 'none' },
            { name: 'pheo', minLevel: 8, maxLevel: 10, minCards: 0, maxCards: 'none' },
            { name: 'blaziri', minLevel: 8, maxLevel: 10, minCards: 0, maxCards: 'none' },
            { name: 'pyrel', minLevel: 8, maxLevel: 10, minCards: 0, maxCards: 'none' },
            { name: 'cindra', minLevel: 8, maxLevel: 10, minCards: 0, maxCards: 'none' }
        ], 6)
    },
    hard: {
        level: 13,
        coins: 1718,
        exp: 1173,
        value: 5,
        firstTime: ['holly', '4 lightgems'],
        reward: ['liqui', 'fita', '4 firegems'],
        inventory: createRandomInventory([
            { name: 'flambo', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'pheo', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'blaziri', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'pyrel', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'cindra', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' }
        ], 6)
    }
};
