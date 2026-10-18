import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const lucy = {
    "type": "water",
    "easy": {
        "level": 2,
        "coins": 168,
        "exp": 135,
        "value": 2,
        firstTime: "mari",
        reward: ["aqua", "flora", "2 watergems"],
        "inventory": createRandomInventory([
            { name: 'aqua', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 'none' },
            { name: 'mari', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 'none' }
        ], 3)
    },
    "normal": {
        "level": 3,
        "coins": 286,
        "exp": 229,
        "value": 3,
        firstTime: "aqua",
        reward: ["mari", "lumi", "3 watergems"],
        "inventory": createRandomInventory([
            { name: 'aqua', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'mari', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' }
        ], 4)
    },
    "hard": {
        "level": 4,
        "coins": 400,
        "exp": 321,
        "value": 4,
        firstTime: "eli",
        reward: ["aqua", "nora", "4 watergems"],
        "inventory": createRandomInventory([
            { name: 'aqua', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'mari', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'hydro', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 1 },
        ], 4)
    },
    "erect": {
        "level": 12,
        "coins": 1680,
        "exp": 1200,
        "value": 3,
        firstTime: ["rivera", "4 watergems"],
        reward: ["thornshade", "siri", "5 darkgems"],
        "inventory": createRandomInventory([
            { name: 'hydro', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'rivera', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'marine', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'vapora', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'gassy', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'dewey', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'swampa', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' }
        ], 6)
    },
    "nightmare": {
        "level": 14,
        "coins": 2520,
        "exp": 1800,
        "value": 4,
        firstTime: ["pyrel", "5 watergems"],
        reward: ["holly", "devo", "6 darkgems"],
        "inventory": createRandomInventory([
            { name: 'hydro', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'rivera', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'marine', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'vapora', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'gassy', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'dewey', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'swampa', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' }
        ], 6)
    }
}