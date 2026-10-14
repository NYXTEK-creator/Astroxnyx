import { aquaChar } from '../../data/characters/aqua.js';
import { astriChar } from '../../data/characters/astri.js';
import { demoniChar } from '../../data/characters/demoni.js';
import { deweyChar } from '../../data/characters/dewey.js';
import { eliChar } from '../../data/characters/eli.js';
import { fitaChar } from '../../data/characters/fita.js';
import { flambaeChar } from '../../data/characters/flambae.js';
import { floraChar } from '../../data/characters/flora.js';
import { floriChar } from '../../data/characters/flori.js';
import { hemoChar } from '../../data/characters/hemo.js';
import { keraChar } from '../../data/characters/kera.js';
import { lavaeChar } from '../../data/characters/lavae.js';
import { lumiChar } from '../../data/characters/lumi.js';
import { emberChar } from '../../data/characters/ember.js';
import { mariChar } from '../../data/characters/mari.js';
import { necroChar } from '../../data/characters/necro.js';
import { noraChar } from '../../data/characters/nora.js';
import { solareChar } from '../../data/characters/solare.js';
import { voltiChar } from '../../data/characters/volti.js';

const charactersByName = new Map([
    aquaChar, astriChar, demoniChar, deweyChar, eliChar, fitaChar,
    flambaeChar, floraChar, floriChar, hemoChar, keraChar, lavaeChar,
    lumiChar, emberChar, mariChar, necroChar, noraChar, solareChar, voltiChar
].map(character => [character.charName.toLowerCase(), character]));

export function createRandomInventory(possibleCards, count) {
    if (!Number.isSafeInteger(count) || count < 1) {
        throw new RangeError('Opponent inventory count must be a positive safe integer.');
    }
    if (!Array.isArray(possibleCards) || possibleCards.length === 0) {
        throw new TypeError('Opponent possible cards must be a non-empty array.');
    }

    const candidates = possibleCards.map(candidate => {
        if (!candidate || typeof candidate !== 'object' ||
            typeof candidate.name !== 'string') {
            throw new TypeError(
                'Each opponent card must specify a name and level range.'
            );
        }
        const character = charactersByName.get(candidate.name.toLowerCase());
        if (!character) {
            throw new Error(`Unknown opponent card: "${candidate.name}".`);
        }
        if (!Number.isSafeInteger(candidate.minLevel) || candidate.minLevel < 1 ||
            !Number.isSafeInteger(candidate.maxLevel) ||
            candidate.maxLevel < candidate.minLevel ||
            candidate.maxLevel > character.rating * 10) {
            throw new RangeError(
                `Opponent level range for "${candidate.name}" is invalid.`
            );
        }
        const minCards = candidate.minCards === undefined ? 0 : candidate.minCards;
        const maxCards = candidate.maxCards === 'none'
            ? count
            : candidate.maxCards === undefined ? count : candidate.maxCards;
        if (!Number.isSafeInteger(minCards) || minCards < 0 ||
            !Number.isSafeInteger(maxCards) || maxCards < minCards ||
            maxCards > count) {
            throw new RangeError(
                `Opponent card count range for "${candidate.name}" is invalid.`
            );
        }
        return {
            name: character.charName,
            minLevel: candidate.minLevel,
            maxLevel: candidate.maxLevel,
            minCards,
            maxCards
        };
    });

    const minimumCardCount = candidates.reduce(
        (total, candidate) => total + candidate.minCards,
        0
    );
    const maximumCardCount = candidates.reduce(
        (total, candidate) => total + candidate.maxCards,
        0
    );
    if (minimumCardCount > count || maximumCardCount < count) {
        throw new RangeError(
            'Opponent card count ranges cannot produce the requested inventory size.'
        );
    }

    const inventory = [];
    const cardCounts = new Map(candidates.map(candidate => [candidate, 0]));
    const addCard = candidate => {
        inventory.push({
            name: candidate.name,
            level: candidate.minLevel +
                Math.floor(Math.random() * (candidate.maxLevel - candidate.minLevel + 1))
        });
        cardCounts.set(candidate, cardCounts.get(candidate) + 1);
    };
    for (const candidate of candidates) {
        for (let index = 0; index < candidate.minCards; index += 1) {
            addCard(candidate);
        }
    }
    while (inventory.length < count) {
        const eligibleCandidates = candidates.filter(candidate =>
            cardCounts.get(candidate) < candidate.maxCards
        );
        const candidate =
            eligibleCandidates[Math.floor(Math.random() * eligibleCandidates.length)];
        addCard(candidate);
    }

    for (let index = inventory.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [inventory[index], inventory[swapIndex]] =
            [inventory[swapIndex], inventory[index]];
    }
    return inventory;
}
