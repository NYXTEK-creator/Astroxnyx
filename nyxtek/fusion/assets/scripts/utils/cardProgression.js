import { aquaChar } from '../../data/characters/aqua.js';
import { astriChar } from '../../data/characters/astri.js';
import { eliChar } from '../../data/characters/eli.js';
import { fitaChar } from '../../data/characters/fita.js';
import { floriChar } from '../../data/characters/flori.js';
import { flambaeChar } from '../../data/characters/flambae.js';
import { floraChar } from '../../data/characters/flora.js';
import { keraChar } from '../../data/characters/kera.js';
import { lumiChar } from '../../data/characters/lumi.js';
import { emberChar } from '../../data/characters/ember.js';
import { mariChar } from '../../data/characters/mari.js';
import { necroChar } from '../../data/characters/necro.js';
import { noraChar } from '../../data/characters/nora.js';
import { deweyChar } from '../../data/characters/dewey.js';
import { demoniChar } from '../../data/characters/demoni.js';
import { solareChar } from '../../data/characters/solare.js';
import { psyChar } from '../../data/characters/psy.js';
import { hemoChar } from '../../data/characters/hemo.js';
import { lavaeChar } from '../../data/characters/lavae.js';
import { hydroChar } from '../../data/characters/hydro.js';
import { electroChar } from '../../data/characters/electro.js';
import { zythChar } from '../../data/characters/zyth.js';
import { yinChar } from '../../data/characters/yin.js';
import { yangChar } from '../../data/characters/yang.js';
import { plasmiChar } from '../../data/characters/plasmi.js';
import { devoChar } from '../../data/characters/devo.js';
import { swampaChar } from '../../data/characters/swampa.js';
import { ovaChar } from '../../data/characters/ova.js';
import { aimaChar } from '../../data/characters/aima.js';
import { magmoChar } from '../../data/characters/magmo.js';
import { ioniChar } from '../../data/characters/ioni.js';
import { helioChar } from '../../data/characters/helio.js';
import { gassyChar } from '../../data/characters/gassy.js';
import { magiChar } from '../../data/characters/magi.js';
import { hollyChar } from '../../data/characters/holly.js';
import { angiChar } from '../../data/characters/angi.js';
import { blazoChar } from '../../data/characters/blazo.js';
import { blaziriChar } from '../../data/characters/blaziri.js';
import { pheoChar } from '../../data/characters/pheo.js';
import { leafiChar } from '../../data/characters/leafi.js';
import { leafyxChar } from '../../data/characters/leafyx.js';
import { shrubiChar } from '../../data/characters/shrubi.js'
import { flamboChar } from '../../data/characters/flambo.js';
import { fysiChar } from '../../data/characters/fysi.js';
import { vaporaChar } from '../../data/characters/vapora.js';
import { siriChar } from '../../data/characters/siri.js';
import { rappitChar } from '../../data/characters/rappit.js';
import { umbraChar } from '../../data/characters/umbra.js';
import { aurenChar } from '../../data/characters/auren.js';
import { cindraChar } from '../../data/characters/cindra.js';
import { pyrelChar } from '../../data/characters/pyrel.js';
import { liquiChar } from '../../data/characters/liqui.js';
import { riveraChar } from '../../data/characters/rivera.js';
import { marineChar } from '../../data/characters/marine.js';
import { zappitChar } from '../../data/characters/zappit.js';
import { umbrinChar } from '../../data/characters/umbrin.js';
import { glintChar } from '../../data/characters/glint.js';
import { voltinChar } from '../../data/characters/voltin.js';
import { shadewispChar } from '../../data/characters/shadewisp.js';
import { rayletChar } from '../../data/characters/raylet.js';
import { thornshadeChar } from '../../data/characters/thornshade.js';
import { briarChar } from '../../data/characters/briar.js';
import { nightbloomChar } from '../../data/characters/nightbloom.js';
const characterRatings = new Map([
    aquaChar, astriChar, eliChar, fitaChar, floriChar, flambaeChar, floraChar,
    keraChar, lumiChar, emberChar, mariChar, necroChar, noraChar, deweyChar,
    demoniChar, solareChar, psyChar, hemoChar, lavaeChar, hydroChar, hollyChar,
    electroChar, zythChar, yinChar, yangChar, plasmiChar, devoChar, swampaChar,
     ovaChar, aimaChar, magmoChar, ioniChar, helioChar, gassyChar, magiChar,
     angiChar,  blazoChar, blaziriChar, pheoChar, leafiChar, leafyxChar, shrubiChar,
    liquiChar, riveraChar, marineChar, zappitChar, umbrinChar, glintChar,
    voltinChar, shadewispChar, rayletChar, flamboChar, fysiChar, vaporaChar,
    siriChar, rappitChar, umbraChar, aurenChar, cindraChar, pyrelChar,
    thornshadeChar, briarChar, nightbloomChar
].map(character => [character.charName, character.rating]));

const characters = [
    aquaChar, astriChar, eliChar, fitaChar, floriChar, flambaeChar, floraChar,
    keraChar, lumiChar, emberChar, mariChar, necroChar, noraChar, deweyChar,
    demoniChar, solareChar, psyChar, hemoChar, lavaeChar, hydroChar, hollyChar,
    electroChar, zythChar, yinChar, yangChar, plasmiChar, devoChar, swampaChar,
     ovaChar, aimaChar, magmoChar, ioniChar, helioChar, gassyChar, magiChar,
     angiChar,  blazoChar, blaziriChar, pheoChar, leafiChar, leafyxChar, shrubiChar,
    liquiChar, riveraChar, marineChar, zappitChar, umbrinChar, glintChar,
    voltinChar, shadewispChar, rayletChar, flamboChar, fysiChar, vaporaChar,
    siriChar, rappitChar, umbraChar, aurenChar, cindraChar, pyrelChar,
    thornshadeChar, briarChar, nightbloomChar
];
export const characterNames = characters.map(
    character => character.charName.toLowerCase()
);
const charactersByName = new Map(
    characters.map(character => [character.charName.toLowerCase(), character])
);
const rankValues = ['bronze', 'silver', 'gold'];

export function registerCharacter(character, characterName = character?.charName) {
    if (!character || typeof character !== 'object' ||
        typeof characterName !== 'string' ||
        !/^[a-z][a-z0-9-]*$/i.test(characterName)) {
        throw new TypeError('Character data cannot be registered.');
    }

    const normalizedName = characterName.toLowerCase();
    if (!characters.includes(character)) {
        characters.push(character);
    }
    charactersByName.set(normalizedName, character);
    characterRatings.set(normalizedName, character.rating);
    if (!characterNames.includes(normalizedName)) {
        characterNames.push(normalizedName);
    }

    const canonicalName = typeof character.charName === 'string'
        ? character.charName.toLowerCase()
        : '';
    if (/^[a-z][a-z0-9-]*$/i.test(canonicalName) &&
        (!charactersByName.has(canonicalName) ||
            charactersByName.get(canonicalName) === character)) {
        charactersByName.set(canonicalName, character);
        characterRatings.set(canonicalName, character.rating);
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
