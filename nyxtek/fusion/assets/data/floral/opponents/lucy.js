import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const lucy = {
    "type": "water",
    "easy": {
        "level": 1,
        "coins": 168,
        "exp": 135,
        "value": 2,
        firstTime: "mari",
        reward: ["aqua", "flora", "2 watergems"],
        "inventory": createRandomInventory([
            { name: 'aqua', minLevel: 1, maxLevel: 1, minCards: 1, maxCards: 'none' },
            { name: 'mari', minLevel: 1, maxLevel: 1, minCards: 1, maxCards: 'none' }
        ], 3)
    },
    "normal": {
        "level": 1,
        "coins": 286,
        "exp": 216,
        "value": 3,
        firstTime: "aqua",
        reward: ["mari", "lumi", "3 watergems"],
        "inventory": createRandomInventory([
            { name: 'aqua', minLevel: 1, maxLevel: 1, minCards: 1, maxCards: 'none' },
            { name: 'mari', minLevel: 1, maxLevel: 1, minCards: 1, maxCards: 'none' }
        ], 4)
    },
    "hard": {
        "level": 2,
        "coins": 400,
        "exp": 302,
        "value": 4,
        firstTime: "eli",
        reward: ["aqua", "nora", "4 watergems"],
        "inventory": createRandomInventory([
            { name: 'aqua', minLevel: 1, maxLevel: 2, minCards: 1, maxCards: 'none' },
            { name: 'mari', minLevel: 1, maxLevel: 2, minCards: 1, maxCards: 'none' }
        ], 4)
    }
}