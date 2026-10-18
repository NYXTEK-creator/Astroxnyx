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
            { name: 'fita', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 'none' },
            { name: 'flora', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: 'none' }
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
            { name: 'fita', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' },
            { name: 'flora', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: 'none' }
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
            { name: 'fita', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' },
            { name: 'flora', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: 'none' }
        ], 4)
    },
    "erect": {
        "level": 12,
        "coins": 1400,
        "exp": 1000,
        "value": 2,
        firstTime: ["leafyx", '4 naturegems'],
        reward: ["magmo", "hydro", "5 firegems"],
        "inventory": createRandomInventory([
            { name: 'leafyx', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'shrubi', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'briar', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'nightbloom', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'thornshade', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'shrubi', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'ova', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'flori', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' },
            { name: 'fysi', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: 'none' }
        ], 6)
    },
    "nightmare": {
        "level": 14,
        "coins": 2100,
        "exp": 1500,
        "value": 2,
        firstTime: ["flambo", '5 naturegems'],
        reward: ["zyth", "yang", "6 firegems"],
        "inventory": createRandomInventory([
            { name: 'leafyx', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'shrubi', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'briar', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'nightbloom', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'thornshade', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'shrubi', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'ova', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'flori', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' },
            { name: 'fysi', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: 'none' }
        ], 6)
    }
}