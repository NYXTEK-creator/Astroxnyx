import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const issac = {
    "type": "fire",
    "easy": {
        "level": 2,
        "coins": 192,
        "exp": 155,
        "value": 2,
        firstTime: "flambae",
        reward: ["magmo", "fita", "2 firegems"],
        "inventory": createRandomInventory([
            { name: 'flambae', minLevel: 1, maxLevel: 1, minCards: 1, maxCards: "none"},
            { name: 'magmo', minLevel: 1, maxLevel: 1, minCards: 1, maxCards: "none" }
        ], 4)
    },
    "normal": {
        "level": 2,
        "coins": 326,
        "exp": 248,
        "value": 2,
        firstTime: "kera",
        reward: ["flambae", "eli", "3 firegems"],
        "inventory": createRandomInventory([
            { name: 'flambae', minLevel: 3, maxLevel: 5, minCards: 1, maxCards: "none"},
            { name: 'magmo', minLevel: 3, maxLevel: 5, minCards: 1,  maxCards: "none" },
            { name: 'demoni', minLevel: 1, maxLevel: 1, minCards: 1,  maxCards: 1 },
        ], 4)
    },
    "hard": {
        "level": 3,
        "coins": 457,
        "exp": 347,
        "value": 2,
        firstTime: "dewey",
        reward: ["magmo", "aqua", "4 firegems"],
        "inventory": createRandomInventory([
            { name: 'flambae', minLevel: 5, maxLevel: 8, minCards: 1, maxCards: "none"},
            { name: 'magmo', minLevel: 5, maxLevel: 8, minCards: 1,  maxCards: "none" },
            { name: 'demoni', minLevel: 1, maxLevel: 2, minCards: 1,  maxCards: 1 },
        ], 4)
    }
}