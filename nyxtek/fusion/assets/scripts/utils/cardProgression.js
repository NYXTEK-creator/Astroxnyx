import { aquaChar } from '../../data/characters/aqua.js';
import { astriChar } from '../../data/characters/astri.js';
import { eliChar } from '../../data/characters/eli.js';
import { fitaChar } from '../../data/characters/fita.js';
import { floriChar } from '../../data/characters/flori.js';
import { flambaeChar } from '../../data/characters/flambae.js';
import { floraChar } from '../../data/characters/flora.js';
import { keraChar } from '../../data/characters/kera.js';
import { lumiChar } from '../../data/characters/lumi.js';
import { magmoChar } from '../../data/characters/magmo.js';
import { mariChar } from '../../data/characters/mari.js';
import { necroChar } from '../../data/characters/necro.js';
import { noraChar } from '../../data/characters/nora.js';
import { deweyChar } from '../../data/characters/dewey.js';
import { demoniChar } from '../../data/characters/demoni.js';
import { solareChar } from '../../data/characters/solare.js';
import { voltiChar } from '../../data/characters/volti.js';
import { hemoChar } from '../../data/characters/hemo.js';
import { lavaeChar } from '../../data/characters/lavae.js';

const characterRatings = new Map([
    aquaChar, astriChar, eliChar, fitaChar, floriChar, flambaeChar, floraChar,
    keraChar, lumiChar, magmoChar, mariChar, necroChar, noraChar, deweyChar,
    demoniChar, solareChar, voltiChar, hemoChar, lavaeChar
].map(character => [character.charName, character.rating]));

const characters = [
    aquaChar, astriChar, eliChar, fitaChar, floriChar, flambaeChar, floraChar,
    keraChar, lumiChar, magmoChar, mariChar, necroChar, noraChar, deweyChar,
    demoniChar, solareChar, voltiChar, hemoChar, lavaeChar
];
const charactersByName = new Map(
    characters.map(character => [character.charName.toLowerCase(), character])
);
const rankValues = ['bronze', 'silver', 'gold'];

export function registerCharacter(character) {
    if (!character || typeof character.charName !== 'string' ||
        !/^[a-z][a-z0-9-]*$/i.test(character.charName) ||
        !Number.isSafeInteger(character.rating) || character.rating < 1 ||
        !rankValues.includes(character.value)) {
        throw new TypeError('Character progression data is invalid.');
    }

    const characterName = character.charName.toLowerCase();
    characterRatings.set(characterName, character.rating);
    charactersByName.set(characterName, character);
    if (!characters.some(entry => entry.charName.toLowerCase() === characterName)) {
        characters.push(character);
    }
}

export function getCardNamesByRating(rating) {
    if (!Number.isSafeInteger(rating) || rating < 1) {
        throw new TypeError('Card rating must be a positive safe integer.');
    }
    return characters
        .filter(character => character.rating === rating)
        .map(character => character.charName.toLowerCase());
}

export function getCardNamesByType(type) {
    if (typeof type !== 'string' || !/^[a-z][a-z0-9-]*$/i.test(type)) {
        throw new TypeError('Card type must be a valid type name.');
    }
    const normalizedType = type.toLowerCase();
    return characters
        .filter(character =>
            character.mainType?.toLowerCase() === normalizedType ||
            character.charType.toLowerCase() === normalizedType
        )
        .map(character => character.charName.toLowerCase());
}

export function getCardMaxEnhancement(characterName) {
    if (typeof characterName !== 'string') {
        throw new TypeError('Card name must be a string.');
    }
    const character = charactersByName.get(characterName.toLowerCase());
    const baseRankIndex = rankValues.indexOf(character?.value);
    if (!character || baseRankIndex < 0) {
        throw new Error(`Card rank for "${characterName}" is missing or invalid.`);
    }
    return character.rating * (rankValues.length - 1 - baseRankIndex);
}

export function getCardStarRanks(
    characterName,
    enhancement = 0,
    savedStarRanks
) {
    if (typeof characterName !== 'string') {
        throw new TypeError('Card name must be a string.');
    }
    const character = charactersByName.get(characterName.toLowerCase());
    const baseRankIndex = rankValues.indexOf(character?.value);
    if (!character || baseRankIndex < 0) {
        throw new Error(`Card rank for "${characterName}" is missing or invalid.`);
    }
    if (savedStarRanks !== undefined) {
        if (!Array.isArray(savedStarRanks) ||
            savedStarRanks.length !== character.rating ||
            !savedStarRanks.every(rank => rankValues.includes(rank))) {
            throw new Error(`Card star ranks for "${characterName}" are invalid.`);
        }
        return [...savedStarRanks];
    }
    if (!Number.isSafeInteger(enhancement) ||
        enhancement < 0 || enhancement > getCardMaxEnhancement(characterName)) {
        throw new Error(`Card enhancement for "${characterName}" is invalid.`);
    }
    const rankIndex = baseRankIndex + enhancement;
    if (rankIndex >= rankValues.length) {
        throw new Error(`Card enhancement for "${characterName}" exceeds Gold rank.`);
    }
    return Array(character.rating).fill(rankValues[rankIndex]);
}

export function getCardEnhancementTotal(characterName, starRanks) {
    if (typeof characterName !== 'string') {
        throw new TypeError('Card name must be a string.');
    }
    const character = charactersByName.get(characterName.toLowerCase());
    const baseRankIndex = rankValues.indexOf(character?.value);
    if (!character || baseRankIndex < 0 ||
        !Array.isArray(starRanks) ||
        starRanks.length !== character.rating ||
        !starRanks.every(rank => rankValues.includes(rank))) {
        throw new Error(`Card star ranks for "${characterName}" are invalid.`);
    }
    const enhancement = starRanks.reduce(
        (total, rank) => total + rankValues.indexOf(rank) - baseRankIndex,
        0
    );
    if (enhancement < 0 || enhancement > getCardMaxEnhancement(characterName)) {
        throw new Error(`Card star ranks for "${characterName}" are invalid.`);
    }
    return enhancement;
}

export function getFusionStarRanks(firstCard, secondCard) {
    const firstRanks = getCardStarRanks(
        firstCard.name,
        firstCard.enhancement,
        firstCard.starRanks
    );
    const secondRanks = getCardStarRanks(
        secondCard.name,
        secondCard.enhancement,
        secondCard.starRanks
    );
    const highestRank = ranks => ranks.reduce(
        (highest, rank) =>
            rankValues.indexOf(rank) > rankValues.indexOf(highest) ? rank : highest,
        rankValues[0]
    );
    return [highestRank(firstRanks), highestRank(secondRanks)];
}

export function getCardMaxLevel(characterName) {
    if (typeof characterName !== 'string') {
        throw new TypeError('Card name must be a string.');
    }
    const rating = characterRatings.get(characterName.toLowerCase());
    if (!Number.isSafeInteger(rating) || rating < 1) {
        throw new Error(`Card rating for "${characterName}" is missing or invalid.`);
    }
    return rating * 10;
}

export function findFusionResult(firstName, secondName) {
    if (typeof firstName !== 'string' || typeof secondName !== 'string') {
        throw new TypeError('Fusion card names must be strings.');
    }
    const first = charactersByName.get(firstName.toLowerCase());
    const second = charactersByName.get(secondName.toLowerCase());
    if (!first || !second) {
        throw new Error('A fusion component does not exist.');
    }

    const recipe = [first.charName.toLowerCase(), second.charName.toLowerCase()].sort();
    for (const [resultName, partnerName] of Object.entries(first.possibleFusions ?? {})) {
        if (partnerName.toLowerCase() !== second.charName.toLowerCase()) {
            continue;
        }
        const result = charactersByName.get(resultName.toLowerCase());
        if (!result || !Array.isArray(result.fusion) ||
            result.fusion.length !== 2 ||
            [...result.fusion].map(name => name.toLowerCase()).sort()
                .some((name, index) => name !== recipe[index])) {
            continue;
        }
        return result;
    }
    return null;
}
