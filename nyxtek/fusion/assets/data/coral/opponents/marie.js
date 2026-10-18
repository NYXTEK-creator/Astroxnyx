import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const marie = {
    type: 'light',
    easy: {
        level: 6,
        coins: 423,
        exp: 290,
        value: 3,
        firstTime: 'lumi',
        reward: ['astri', 'mari', '2 lightgems'],
        inventory: createRandomInventory([
            { name: 'astri', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'lumi', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
        ], 5)
    },
    normal: {
        level: 7,
        coins: 722,
        exp: 493,
        value: 4,
        firstTime: 'astri',
        reward: ['lumi', 'flora', '3 lightgems'],
        inventory: createRandomInventory([
            { name: 'astri', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'lumi', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'siri', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 1 },
        ], 5)
    },
    hard: {
        level: 9,
        coins: 1011,
        exp: 691,
        value: 5,
        firstTime: 'solare',
        reward: ['ember', 'nora', '4 lightgems'],
        inventory: createRandomInventory([
            { name: 'astri', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 1 },
            { name: 'lumi', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 1 },
            { name: 'siri', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 'none' },
        ], 5)
    }
};
