import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const liam = {
    type: 'dark',
    easy: {
        level: 5,
        coins: 295,
        exp: 220,
        value: 3,
        firstTime: 'nora',
        reward: ['lumi', 'eli', '2 darkgems'],
        inventory: createRandomInventory([
            { name: 'necro', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'nora', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' }
        ], 5)
    },
    normal: {
        level: 5,
        coins: 501,
        exp: 352,
        value: 4,
        firstTime: 'necro',
        reward: ['nora', 'magmo', '3 darkgems'],
        inventory: createRandomInventory([
            { name: 'necro', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'nora', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'hemo', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 1 }
        ], 5)

    },
    hard: {
        level: 6,
        coins: 701,
        exp: 493,
        value: 5,
        firstTime: 'aqua',
        reward: ['necro', 'astri', '4 darkgems'],
        inventory: createRandomInventory([
            { name: 'necro', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'nora', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'hemo', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 'none' }
        ], 5)
    }
};