import { createRandomInventory } from '../../../scripts/utils/randomInventory.js?v=4';

export const marie = {
    type: 'light',
    easy: {
        level: 5,
        coins: 325,
        exp: 255,
        value: 3,
        firstTime: 'lumi',
        reward: ['astri', 'mari', '2 lightgems'],
        inventory: createRandomInventory([
            { name: 'astri', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'lumi', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'solare', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 1 },
        ], 5)
    },
    normal: {
        level: 5,
        coins: 520,
        exp: 434,
        value: 4,
        firstTime: 'astri',
        reward: ['lumi', 'flora', '3 lightgems'],
        inventory: createRandomInventory([
            { name: 'astri', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'lumi', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'solare', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 1 },
        ], 5)
    },
    hard: {
        level: 6,
        coins: 728,
        exp: 607,
        value: 5,
        firstTime: 'solare',
        reward: ['hemo', 'nora', '4 lightgems'],
        inventory: createRandomInventory([
            { name: 'astri', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'lumi', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'solare', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 'none' },
        ], 5)
    }
};
