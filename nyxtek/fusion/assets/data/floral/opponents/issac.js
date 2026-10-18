import { createRandomInventory } from '../../../scripts/utils/randomInventory.js';

export const issac = {
    "type": "fire",
    "easy": {
        "level": 2,
        "coins": 201,
        "exp": 162,
        "value": 2,
        firstTime: "flambae",
        reward: ["ember", "fita", "2 firegems"],
        "inventory": createRandomInventory([
            { name: 'flambae', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: "none"},
            { name: 'ember', minLevel: 1, maxLevel: 3, minCards: 1, maxCards: "none" }
        ], 4)
    },
    "normal": {
        "level": 3,
        "coins": 342,
        "exp": 275,
        "value": 2,
        firstTime: "kera",
        reward: ["flambae", "eli", "3 firegems"],
        "inventory": createRandomInventory([
            { name: 'flambae', minLevel: 5, maxLevel: 7, minCards: 1, maxCards: "none"},
            { name: 'ember', minLevel: 5, maxLevel: 7, minCards: 1,  maxCards: "none" },
        ], 4)
    },
    "hard": {
        "level": 5,
        "coins": 478,
        "exp": 385,
        "value": 2,
        firstTime: "dewey",
        reward: ["ember", "aqua", "4 firegems"],
        "inventory": createRandomInventory([
            { name: 'flambae', minLevel: 8, maxLevel: 10, minCards: 1, maxCards: "none"},
            { name: 'ember', minLevel: 8, maxLevel: 10, minCards: 1,  maxCards: "none" },
            { name: 'flambo', minLevel: 1, maxLevel: 2, minCards: 1,  maxCards: 1 },
        ], 4)
    },
    "erect": {
        "level": 13,
        "coins": 2016,
        "exp": 1440,
        "value": 2,
        firstTime: ["psy", "4 firegems"],
        reward: ["magmo", "umbra", "5 lightgems"],
        "inventory": createRandomInventory([
            { name: 'flambo', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: "none"},
            { name: 'magmo', minLevel: 9, maxLevel: 11, minCards: 0,  maxCards: "none" },
            { name: 'cindra', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: "none"},
            { name: 'pyrel', minLevel: 9, maxLevel: 11, minCards: 0,  maxCards: "none" },
            { name: 'pheo', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: "none"},
            { name: 'blaziri', minLevel: 9, maxLevel: 11, minCards: 0,  maxCards: "none" },
            { name: 'lavae', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: "none"},
            { name: 'solare', minLevel: 9, maxLevel: 11, minCards: 0,  maxCards: "none" },
            { name: 'helio', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: "none"},
            { name: 'devo', minLevel: 9, maxLevel: 11, minCards: 0,  maxCards: "none" },
            { name: 'demoni', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: "none"},
            { name: 'ioni', minLevel: 9, maxLevel: 11, minCards: 0, maxCards: "none"},
            { name: 'plasmi', minLevel: 9, maxLevel: 11, minCards: 0,  maxCards: "none" }
        ], 6)
    },
    "nightmare": {
        "level": 15,
        "coins": 3024,
        "exp": 2160,
        "value": 2,
        firstTime: ["helio", "5 firegems"],
        reward: ["aima", "zappit", "6 lightgems"],
        "inventory": createRandomInventory([
            { name: 'flambo', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: "none"},
            { name: 'magmo', minLevel: 11, maxLevel: 13, minCards: 0,  maxCards: "none" },
            { name: 'cindra', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: "none"},
            { name: 'pyrel', minLevel: 11, maxLevel: 13, minCards: 0,  maxCards: "none" },
            { name: 'pheo', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: "none"},
            { name: 'blaziri', minLevel: 11, maxLevel: 13, minCards: 0,  maxCards: "none" },
            { name: 'lavae', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: "none"},
            { name: 'solare', minLevel: 11, maxLevel: 13, minCards: 0,  maxCards: "none" },
            { name: 'helio', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: "none"},
            { name: 'devo', minLevel: 11, maxLevel: 13, minCards: 0,  maxCards: "none" },
            { name: 'demoni', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: "none"},
            { name: 'ioni', minLevel: 11, maxLevel: 13, minCards: 0, maxCards: "none"},
            { name: 'plasmi', minLevel: 11, maxLevel: 13, minCards: 0,  maxCards: "none" }
        ], 7)
    }
}