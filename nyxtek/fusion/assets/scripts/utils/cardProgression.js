const rankValues = ['bronze', 'silver', 'gold'];
const characterDirectoryUrl =
    'https://api.github.com/repos/NYXTEK-creator/Astroxnyx/contents/nyxtek/fusion/assets/data/characters?ref=main';
const characterCacheKey = 'fusion-character-files';
const characterCacheDuration = 30_000;

async function loadCharacterNames() {
    let cachedNames;
    try {
        const cached = JSON.parse(sessionStorage.getItem(characterCacheKey) ?? 'null');
        if (Array.isArray(cached?.names) && Number.isFinite(cached.savedAt)) {
            cachedNames = cached.names.filter(name =>
                typeof name === 'string' && /^[a-z][a-z0-9-]*$/i.test(name)
            );
            if (Date.now() - cached.savedAt < characterCacheDuration) {
                return cachedNames;
            }
        }
    } catch {
        cachedNames = undefined;
    }

    try {
        const response = await fetch(characterDirectoryUrl, {
            headers: { Accept: 'application/vnd.github+json' }
        });
        if (!response.ok) {
            throw new Error(`Character directory request failed (${response.status}).`);
        }

        const entries = await response.json();
        if (!Array.isArray(entries)) {
            throw new Error('Character directory response was invalid.');
        }

        const characterNames = entries
            .filter(entry => entry.type === 'file' && /^[a-z][a-z0-9-]*\.js$/i.test(entry.name))
            .map(entry => entry.name.replace(/\.js$/i, ''))
            .sort((first, second) => first.localeCompare(second));
        if (characterNames.length === 0) {
            throw new Error('No character modules were found.');
        }

        try {
            sessionStorage.setItem(characterCacheKey, JSON.stringify({
                names: characterNames,
                savedAt: Date.now()
            }));
        } catch {
            // Storage can be disabled without preventing character loading.
        }
        return characterNames;
    } catch (error) {
        if (cachedNames?.length) {
            console.warn('Using cached character files because discovery failed.', error);
            return cachedNames;
        }
        throw error;
    }
}

export const characterNames = await loadCharacterNames();
const characters = [];
const characterRatings = new Map();
const charactersByName = new Map();

const characterModules = await Promise.all(characterNames.map(async characterName => {
    try {
        return await import(`../../data/characters/${characterName}.js`);
    } catch (error) {
        console.error(`Could not load character data for "${characterName}".`, error);
        return null;
    }
}));

for (let index = 0; index < characterModules.length; index += 1) {
    const characterModule = characterModules[index];
    const character = Object.values(characterModule ?? {}).find(value =>
        value && typeof value === 'object' && typeof value.charName === 'string'
    );
    if (!character) {
        continue;
    }

    const characterName = characterNames[index].toLowerCase();
    characters.push(character);
    charactersByName.set(characterName, character);
    if (Number.isSafeInteger(character.rating) && character.rating > 0) {
        characterRatings.set(characterName, character.rating);
    }
}

export function getCharacterByName(characterName) {
    if (typeof characterName !== 'string') {
        throw new TypeError('Character name must be a string.');
    }
    return charactersByName.get(characterName.toLowerCase());
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
