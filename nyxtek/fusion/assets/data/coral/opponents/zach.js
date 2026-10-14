import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const zach = {
    type: 'fire',
    easy: {
        level: 5,
        coins: 306,
        exp: 237,
        value: 3,
        firstTime: 'magmo',
        reward: ['flambae', 'aqua', '2 firegems'],
        inventory: createRandomInventory([
            { name: 'flambae', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'magmo', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'lavae', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 1}
        ], 5)
    },
    normal: {
        level: 5,
        coins: 490,
        exp: 402,
        value: 4,
        firstTime: 'flambae',
        reward: ['magmo', 'eli', '3 firegems'],
        inventory: createRandomInventory([
            { name: 'flambae', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'magmo', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'lavae', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 1},
            { name: 'demoni', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 1},
        ], 5)
    },
    hard: {
        level: 6,
        coins: 686,
        exp: 564,
        value: 5,
        firstTime: 'flori',
        reward: ['flambae', 'lumi', '4 firegems'],
        inventory: createRandomInventory([
            { name: 'flambae', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'magmo', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'lavae', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 'none'},
            { name: 'demoni', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 'none'},
        ], 5)
    }
};
