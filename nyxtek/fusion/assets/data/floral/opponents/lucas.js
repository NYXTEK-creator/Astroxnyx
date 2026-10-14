import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const lucas = {
    "type": "nature",
    "easy": {
        "level": 1,
        "coins": 144,
        "exp": 113,
        "value": 2,
        firstTime: "flora",
        reward: ["fita", "mari", "1 naturegems"],
        "inventory": createRandomInventory([
            { name: 'fita', minLevel: 1, maxLevel: 1, minCards: 1, maxCards: 'none' },
            { name: 'flora', minLevel: 1, maxLevel: 1, minCards: 1, maxCards: 'none' }
        ], 2)
    },
    "normal": {
        "level": 1,
        "coins": 241,
        "exp": 180,
        "value": 2,
        firstTime: "fita",
        reward: ["flora", "aqua", "2 naturegems"],
        "inventory": createRandomInventory([
            { name: 'fita', minLevel: 1, maxLevel: 1, minCards: 1, maxCards: 'none' },
            { name: 'flora', minLevel: 1, maxLevel: 1, minCards: 1, maxCards: 'none' }
        ], 4)
    },
    "hard": {
        "level": 2,
        "coins": 339,
        "exp": 246,
        "value": 2,
        firstTime: "lumi",
        reward: ["fita", "eli", "2 naturegems"],
        "inventory": createRandomInventory([
            { name: 'fita', minLevel: 1, maxLevel: 2, minCards: 1, maxCards: 'none' },
            { name: 'flora', minLevel: 1, maxLevel: 2, minCards: 1, maxCards: 'none' }
        ], 4)
    }
}