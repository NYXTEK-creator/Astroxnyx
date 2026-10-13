import { level as levelConfig } from '../../data/game/level.js';
import {
    findFusionResult,
    getCardEnhancementTotal,
    getCardMaxEnhancement,
    getCardMaxLevel,
    getCardStarRanks,
    getFusionStarRanks
} from '../utils/cardProgression.js?v=7';
import { parseRewardChoice } from './rewardChoices.js?v=1';

const PROFILE_KEY = 'fusion-profile';
const PLAYER_NAMES_KEY = 'fusion-player-names';
const INVENTORY_KEY = 'fusion-inventory';
const PLAYER_NAME_KEY = 'fusion-player-name';
const CURRENCY_KEY = 'fusion-currencies';
const STORAGE_KEY = 'fusion-storage';
const ELEMENTAL_STONES = ['fire', 'water', 'nature', 'electric', 'dark', 'light'];
const BATTLE_DIFFICULTIES = ['easy', 'normal', 'hard'];

export function getExperienceForLevel(level) {
    if (!Number.isSafeInteger(level) || level < 1) {
        throw new TypeError('Player level must be a positive safe integer.');
    }

    const experience = level !== 1 ? Math.ceil(5.8534 * level ** 2 + 105 * level - 90.2256): 100;
    if (!Number.isSafeInteger(experience) || experience < 1) {
        throw new RangeError('The experience requirement exceeds the supported range.');
    }
    return experience;
}

export function getCardExperienceForLevel(level) {
    if (!Number.isSafeInteger(level) || level < 1) {
        throw new TypeError('Card level must be a positive safe integer.');
    }

    const experience = level ** 2 + 13 * level + 86;
    if (!Number.isSafeInteger(experience) || experience < 1) {
        throw new RangeError('The card experience requirement exceeds the supported range.');
    }
    return experience;
}

function createOwnedCard(name) {
    if (typeof name !== 'string' || !/^[a-z][a-z0-9-]*$/i.test(name)) {
        throw new Error('Saved card name is invalid.');
    }
    return {
        id: window.crypto.randomUUID(),
        name: name.toLowerCase(),
        level: 1,
        experience: 0,
        enhancement: 0
    };
}

function isOwnedCard(card) {
    return Boolean(
        card &&
        typeof card === 'object' &&
        typeof card.id === 'string' &&
        card.id.length > 0 &&
        typeof card.name === 'string' &&
        /^[a-z][a-z0-9-]*$/i.test(card.name) &&
        Number.isSafeInteger(card.level) &&
        card.level >= 1 &&
        Number.isSafeInteger(card.experience) &&
        card.experience >= 0 &&
        card.experience < getCardExperienceForLevel(card.level) &&
        (card.enhancement === undefined ||
            (Number.isSafeInteger(card.enhancement) &&
                card.enhancement >= 0 &&
                card.enhancement <= getCardMaxEnhancement(card.name)))
    );
}

function normalizeOwnedCards(cards, label) {
    if (!Array.isArray(cards)) {
        throw new Error(`${label} is invalid.`);
    }

    let migrated = false;
    const normalizedCards = cards.map(card => {
        if (typeof card === 'string') {
            migrated = true;
            return createOwnedCard(card);
        }
        if (!isOwnedCard(card)) {
            throw new Error(`${label} is invalid.`);
        }
        if (card.level > getCardMaxLevel(card.name)) {
            card.level = getCardMaxLevel(card.name);
            card.experience = 0;
            migrated = true;
        }
        if (card.level === getCardMaxLevel(card.name) && card.experience !== 0) {
            card.experience = 0;
            migrated = true;
        }
        if (card.enhancement === undefined) {
            migrated = true;
        }
        if (card.starRanks !== undefined) {
            const rankTotal = getCardEnhancementTotal(card.name, card.starRanks);
            if (card.enhancement !== undefined && card.enhancement !== rankTotal) {
                throw new Error(`${label} contains inconsistent card star ranks.`);
            }
            if (card.enhancement === undefined) {
                card.enhancement = rankTotal;
                migrated = true;
            }
        } else {
            card.enhancement ??= 0;
        }
        return { ...card };
    });

    const cardIds = normalizedCards.map(card => card.id);
    if (new Set(cardIds).size !== cardIds.length) {
        throw new Error(`${label} contains duplicate card IDs.`);
    }
    return { cards: normalizedCards, migrated };
}

export function resetPlayerAccount() {
    for (const key of [
        PROFILE_KEY,
        PLAYER_NAMES_KEY,
        INVENTORY_KEY,
        PLAYER_NAME_KEY,
        CURRENCY_KEY,
        STORAGE_KEY
    ]) {
        window.localStorage.removeItem(key);
    }
}

function createEmptyCurrencies() {
    return {
        coins: 0,
        gems: 0,
        stones: Object.fromEntries(ELEMENTAL_STONES.map(type => [type, 0]))
    };
}

function readCurrencies() {
    const savedCurrencies = window.localStorage.getItem(CURRENCY_KEY);
    if (savedCurrencies === null) {
        const currencies = createEmptyCurrencies();
        window.localStorage.setItem(CURRENCY_KEY, JSON.stringify(currencies));
        return currencies;
    }

    const currencies = JSON.parse(savedCurrencies);
    if (!currencies || typeof currencies !== 'object' ||
        !Number.isSafeInteger(currencies.coins) || currencies.coins < 0 ||
        !Number.isSafeInteger(currencies.gems) || currencies.gems < 0 ||
        !currencies.stones || typeof currencies.stones !== 'object' ||
        ELEMENTAL_STONES.some(type =>
            !Number.isSafeInteger(currencies.stones[type]) || currencies.stones[type] < 0
        )) {
        throw new Error('Saved currency balances are invalid.');
    }

    return {
        coins: currencies.coins,
        gems: currencies.gems,
        stones: Object.fromEntries(
            ELEMENTAL_STONES.map(type => [type, currencies.stones[type]])
        )
    };
}

function saveCurrencies(currencies) {
    window.localStorage.setItem(CURRENCY_KEY, JSON.stringify(currencies));
}

function validateCurrencyAmount(amount) {
    if (!Number.isSafeInteger(amount) || amount < 1) {
        throw new TypeError('Currency amount must be a positive safe integer.');
    }
}

function addCurrencyBalance(key, amount) {
    validateCurrencyAmount(amount);
    const currencies = readCurrencies();
    const newBalance = currencies[key] + amount;
    if (!Number.isSafeInteger(newBalance)) {
        throw new RangeError('Currency balance would exceed the maximum supported amount.');
    }
    currencies[key] = newBalance;
    saveCurrencies(currencies);
    return newBalance;
}

export function getCurrencies() {
    const currencies = readCurrencies();
    return {
        coins: currencies.coins,
        gems: currencies.gems,
        stones: { ...currencies.stones }
    };
}

export function getCoins() {
    return readCurrencies().coins;
}

export function addCoins(amount) {
    return addCurrencyBalance('coins', amount);
}

export function getGems() {
    return readCurrencies().gems;
}

export function addGems(amount) {
    return addCurrencyBalance('gems', amount);
}

export function getElementalStones() {
    return { ...readCurrencies().stones };
}

export function getElementalStone(type) {
    if (!ELEMENTAL_STONES.includes(type)) {
        throw new TypeError(`Unknown elemental stone type: "${type}".`);
    }
    return readCurrencies().stones[type];
}

export function addElementalStones(type, amount) {
    if (!ELEMENTAL_STONES.includes(type)) {
        throw new TypeError(`Unknown elemental stone type: "${type}".`);
    }
    validateCurrencyAmount(amount);
    const currencies = readCurrencies();
    const newBalance = currencies.stones[type] + amount;
    if (!Number.isSafeInteger(newBalance)) {
        throw new RangeError('Elemental stone balance would exceed the maximum supported amount.');
    }
    currencies.stones[type] = newBalance;
    saveCurrencies(currencies);
    return newBalance;
}

export function tradeCurrencies(
    sourceCurrency,
    sourceAmount,
    targetCurrency,
    targetAmount
) {
    const isValidCurrency = currency =>
        currency === 'coins' || currency === 'gems' ||
        ELEMENTAL_STONES.includes(currency);
    if (!isValidCurrency(sourceCurrency) || !isValidCurrency(targetCurrency) ||
        sourceCurrency === targetCurrency) {
        throw new TypeError('Currency trade selection is invalid.');
    }
    validateCurrencyAmount(sourceAmount);
    validateCurrencyAmount(targetAmount);

    const currencies = readCurrencies();
    const getBalance = currency =>
        currency === 'coins' || currency === 'gems'
            ? currencies[currency]
            : currencies.stones[currency];
    if (getBalance(sourceCurrency) < sourceAmount) {
        throw new RangeError(`Not enough ${sourceCurrency} for this trade.`);
    }
    const nextTargetBalance = getBalance(targetCurrency) + targetAmount;
    if (!Number.isSafeInteger(nextTargetBalance)) {
        throw new RangeError(
            `${targetCurrency} balance would exceed the maximum supported amount.`
        );
    }

    const setBalance = (currency, balance) => {
        if (currency === 'coins' || currency === 'gems') {
            currencies[currency] = balance;
        } else {
            currencies.stones[currency] = balance;
        }
    };
    setBalance(sourceCurrency, getBalance(sourceCurrency) - sourceAmount);
    setBalance(targetCurrency, nextTargetBalance);

    const previousCurrencies = window.localStorage.getItem(CURRENCY_KEY);
    try {
        saveCurrencies(currencies);
    } catch (error) {
        try {
            if (previousCurrencies === null) {
                window.localStorage.removeItem(CURRENCY_KEY);
            } else {
                window.localStorage.setItem(CURRENCY_KEY, previousCurrencies);
            }
        } catch (rollbackError) {
            console.error('Could not restore the previous currency balances.', rollbackError);
        }
        throw new Error('Could not save the currency trade.', { cause: error });
    }

    return getCurrencies();
}

function getPlayerProgress() {
    const savedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (savedProfile === null) {
        return { level: levelConfig.value, experience: levelConfig.exp };
    }

    const profile = JSON.parse(savedProfile);
    let needsSave = false;

    if (profile.level === undefined) {
        profile.level = levelConfig.value;
        needsSave = true;
    } else if (!Number.isInteger(profile.level) || profile.level < 1) {
        throw new Error('Saved player level is invalid.');
    }

    if (profile.experience === undefined) {
        profile.experience = levelConfig.exp;
        needsSave = true;
    } else if (!Number.isSafeInteger(profile.experience) || profile.experience < 0) {
        throw new Error('Saved player experience is invalid.');
    }

    while (profile.experience >= getExperienceForLevel(profile.level)) {
        profile.experience -= getExperienceForLevel(profile.level);
        profile.level += 1;
        if (!Number.isSafeInteger(profile.level)) {
            throw new Error('Saved player level is invalid.');
        }
        needsSave = true;
    }

    if (needsSave) {
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }

    return { level: profile.level, experience: profile.experience };
}

const starterInventories = {
    fire: ['flambae', 'flambae', 'magmo', 'magmo'],
    water: ['mari', 'mari', 'aqua', 'aqua'],
    nature: ['flora', 'flora', 'fita', 'fita'],
    electric: ['eli', 'eli', 'kera', 'kera'],
    dark: ['necro', 'necro', 'nora', 'nora'],
    light: ['lumi', 'lumi', 'astri', 'astri']
};
function getRegisteredNames() {
    const savedNames = window.localStorage.getItem(PLAYER_NAMES_KEY);
    const names = savedNames === null ? [] : JSON.parse(savedNames);

    if (!Array.isArray(names) || !names.every(name => typeof name === 'string')) {
        throw new Error('Saved player names are invalid.');
    }

    const savedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (savedProfile !== null) {
        const profile = JSON.parse(savedProfile);
        if (typeof profile.playerName === 'string' && profile.playerName.trim()) {
            names.push(profile.playerName.trim());
        }
    }

    return names;
}

export function isPlayerNameTaken(playerName) {
    if (typeof playerName !== 'string' || !playerName.trim()) {
        return false;
    }

    const normalizedName = playerName.trim().toLocaleLowerCase();
    return getRegisteredNames().some(
        name => name.trim().toLocaleLowerCase() === normalizedName
    );
}

export function saveStarterInventory(type, playerName) {
    const inventory = starterInventories[type];

    if (!inventory) {
        throw new TypeError(`Unknown starter type: "${type}".`);
    }

    if (typeof playerName !== 'string' || !playerName.trim()) {
        throw new TypeError('Player name must not be empty.');
    }

    const normalizedPlayerName = playerName.trim();
    const registeredNames = getRegisteredNames();
    if (registeredNames.some(
        name => name.trim().toLocaleLowerCase() === normalizedPlayerName.toLocaleLowerCase()
    )) {
        return false;
    }

    const profile = {
        type,
        playerName: normalizedPlayerName,
        inventory,
        level: levelConfig.value,
        experience: levelConfig.exp
    };
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    registeredNames.push(normalizedPlayerName);
    window.localStorage.setItem(PLAYER_NAMES_KEY, JSON.stringify(registeredNames));
    window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    window.localStorage.setItem(PLAYER_NAME_KEY, normalizedPlayerName);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cards: [],
        firstTimeRewards: [],
        completedFirstTimeRewards: [],
        discoveredCards: [...new Set(inventory.map(name => name.toLowerCase()))]
    }));
    saveCurrencies(createEmptyCurrencies());
    return true;
}

export function hasSavedProfile() {
    const savedProfile = window.localStorage.getItem(PROFILE_KEY);

    if (savedProfile === null) {
        return false;
    }

    const profile = JSON.parse(savedProfile);
    return Boolean(
        profile &&
        typeof profile.type === 'string' &&
        typeof profile.playerName === 'string' &&
        profile.playerName.trim() &&
        Array.isArray(profile.inventory) &&
        profile.inventory.length > 0 &&
        profile.inventory.every(card =>
            typeof card === 'string' || isOwnedCard(card)
        )
    );
}

function readInventoryCards() {
    const savedProfile = window.localStorage.getItem(PROFILE_KEY);

    if (savedProfile !== null) {
        const profile = JSON.parse(savedProfile);
        const normalized = normalizeOwnedCards(profile.inventory, 'Saved inventory');
        if (normalized.migrated) {
            profile.inventory = normalized.cards;
            window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        }
        return normalized.cards;
    }

    const savedInventory = window.localStorage.getItem(INVENTORY_KEY);
    if (savedInventory === null) {
        return [];
    }

    const normalized = normalizeOwnedCards(
        JSON.parse(savedInventory),
        'Saved inventory'
    );
    if (normalized.migrated) {
        window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(normalized.cards));
    }
    return normalized.cards;
}

export function getInventoryCards() {
    return readInventoryCards().map(card => ({ ...card }));
}

export function getInventory() {
    return readInventoryCards().map(card => card.name);
}

function readStorage() {
    const savedStorage = window.localStorage.getItem(STORAGE_KEY);
    if (savedStorage === null) {
        return {
            cards: [],
            firstTimeRewards: [],
            completedFirstTimeRewards: [],
            discoveredCards: []
        };
    }

    const storage = JSON.parse(savedStorage);
    if (!storage || typeof storage !== 'object' ||
        !Array.isArray(storage.firstTimeRewards) ||
        !storage.firstTimeRewards.every(reward => typeof reward === 'string') ||
        (storage.discoveredCards !== undefined &&
            (!Array.isArray(storage.discoveredCards) ||
                !storage.discoveredCards.every(name =>
                    typeof name === 'string' && /^[a-z][a-z0-9-]*$/i.test(name)
                ))) ||
        (storage.completedFirstTimeRewards !== undefined &&
            (!Array.isArray(storage.completedFirstTimeRewards) ||
                !storage.completedFirstTimeRewards.every(reward => typeof reward === 'string')))) {
        throw new Error('Saved card storage is invalid.');
    }
    const normalized = normalizeOwnedCards(storage.cards, 'Saved card storage');
    const discoveredCards = new Set(
        (storage.discoveredCards ?? []).map(name => name.toLowerCase())
    );
    for (const card of normalized.cards) {
        discoveredCards.add(card.name.toLowerCase());
    }
    const result = {
        ...storage,
        cards: normalized.cards,
        completedFirstTimeRewards: storage.completedFirstTimeRewards ?? [],
        discoveredCards: [...discoveredCards]
    };
    if (normalized.migrated || storage.discoveredCards === undefined ||
        result.discoveredCards.length !== storage.discoveredCards.length) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    }
    return result;
}

export function getDiscoveredCards() {
    const storage = readStorage();
    const discoveredCards = new Set(storage.discoveredCards);
    for (const card of readInventoryCards()) {
        discoveredCards.add(card.name.toLowerCase());
    }
    if (discoveredCards.size !== storage.discoveredCards.length) {
        storage.discoveredCards = [...discoveredCards];
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    }
    return [...discoveredCards];
}

export function getStorageCards() {
    return readStorage().cards.map(card => ({ ...card }));
}

export function getStorage() {
    return readStorage().cards.map(card => card.name);
}

export function moveCardToCollection(cardId, destination, capacity) {
    if (typeof cardId !== 'string' || !cardId ||
        !['inventory', 'storage'].includes(destination)) {
        throw new TypeError('Deck edit selection is invalid.');
    }
    if (!Number.isSafeInteger(capacity) || capacity < 1) {
        throw new TypeError('Deck capacity is invalid.');
    }

    const inventory = readInventoryCards();
    const storage = readStorage();
    const inventoryIndex = inventory.findIndex(card => card.id === cardId);
    const storageIndex = storage.cards.findIndex(card => card.id === cardId);
    if ((inventoryIndex !== -1) === (storageIndex !== -1)) {
        throw new Error('The selected card could not be uniquely found.');
    }

    if (destination === 'inventory' && storageIndex !== -1) {
        if (inventory.length >= capacity) {
            throw new RangeError('The deck is already at its card capacity.');
        }
        inventory.push(storage.cards.splice(storageIndex, 1)[0]);
    } else if (destination === 'storage' && inventoryIndex !== -1) {
        if (inventory.length <= 1) {
            throw new RangeError('The deck must keep at least one card.');
        }
        storage.cards.push(inventory.splice(inventoryIndex, 1)[0]);
    } else {
        return;
    }

    const updates = [];
    const savedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (savedProfile !== null) {
        const profile = JSON.parse(savedProfile);
        profile.inventory = inventory;
        updates.push([PROFILE_KEY, JSON.stringify(profile)]);
    } else {
        const savedInventory = window.localStorage.getItem(INVENTORY_KEY);
        if (savedInventory !== null) {
            updates.push([INVENTORY_KEY, JSON.stringify(inventory)]);
        }
    }
    updates.push([STORAGE_KEY, JSON.stringify(storage)]);

    const originals = updates.map(([key]) => [
        key,
        window.localStorage.getItem(key)
    ]);
    try {
        for (const [key, value] of updates) {
            window.localStorage.setItem(key, value);
        }
    } catch (error) {
        for (const [key, value] of originals) {
            try {
                if (value === null) {
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(key, value);
                }
            } catch (rollbackError) {
                console.error(`Could not restore saved data for "${key}".`, rollbackError);
            }
        }
        throw new Error('Could not save the deck changes.', { cause: error });
    }
}

export function addCardToStorage(name) {
    if (typeof name !== 'string' || !/^[a-z][a-z0-9-]*$/i.test(name)) {
        throw new TypeError('Storage card name must be a valid character identifier.');
    }

    const storage = readStorage();
    storage.cards.push(createOwnedCard(name));
    storage.discoveredCards = [...new Set([...storage.discoveredCards, name.toLowerCase()])];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

export function purchaseCardFromShop(name, cost, currencyType = 'coins') {
    if (typeof name !== 'string' || !/^[a-z][a-z0-9-]*$/i.test(name)) {
        throw new TypeError('Shop card name must be a valid character identifier.');
    }
    if (currencyType !== 'coins' && currencyType !== 'gems' &&
        !ELEMENTAL_STONES.includes(currencyType)) {
        throw new TypeError('Shop purchase currency must be coins, gems, or an elemental stone.');
    }
    validateCurrencyAmount(cost);

    const storage = readStorage();
    const currencies = readCurrencies();
    const balance = currencyType === 'coins' || currencyType === 'gems'
        ? currencies[currencyType]
        : currencies.stones[currencyType];
    if (balance < cost) {
        const currencyName = ELEMENTAL_STONES.includes(currencyType)
            ? `${currencyType} stones`
            : currencyType;
        throw new RangeError(`Not enough ${currencyName} to purchase this card.`);
    }

    const card = createOwnedCard(name);
    storage.cards.push(card);
    storage.discoveredCards = [
        ...new Set([...storage.discoveredCards, name.toLowerCase()])
    ];
    if (currencyType === 'coins' || currencyType === 'gems') {
        currencies[currencyType] -= cost;
    } else {
        currencies.stones[currencyType] -= cost;
    }

    const updates = [
        [STORAGE_KEY, JSON.stringify(storage)],
        [CURRENCY_KEY, JSON.stringify(currencies)]
    ];
    const originals = updates.map(([key]) => [
        key,
        window.localStorage.getItem(key)
    ]);
    try {
        for (const [key, value] of updates) {
            window.localStorage.setItem(key, value);
        }
    } catch (error) {
        for (const [key, value] of originals) {
            try {
                if (value === null) {
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(key, value);
                }
            } catch (rollbackError) {
                console.error(`Could not restore saved data for "${key}".`, rollbackError);
            }
        }
        throw new Error('Could not complete the shop purchase.', { cause: error });
    }
    return card;
}

export function sellCard(cardId) {
    if (typeof cardId !== 'string' || !cardId) {
        throw new TypeError('Card sale selection is invalid.');
    }

    const inventory = readInventoryCards();
    const storage = readStorage();
    const inventoryIndex = inventory.findIndex(card => card.id === cardId);
    const storageIndex = storage.cards.findIndex(card => card.id === cardId);
    if ((inventoryIndex !== -1) === (storageIndex !== -1)) {
        throw new Error('The selected card could not be uniquely found.');
    }
    if (inventoryIndex !== -1 && inventory.length <= 1) {
        throw new RangeError('The deck must keep at least one card.');
    }

    const collection = inventoryIndex !== -1 ? 'inventory' : 'storage';
    const card = inventoryIndex !== -1
        ? inventory.splice(inventoryIndex, 1)[0]
        : storage.cards.splice(storageIndex, 1)[0];
    const coinReward = Math.round(getCardExperienceForLevel(card.level) * 1.5);
    const currencies = readCurrencies();
    currencies.coins += coinReward;
    if (!Number.isSafeInteger(currencies.coins)) {
        throw new RangeError('The sale would exceed the maximum coin balance.');
    }

    const updates = [];
    const savedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (savedProfile !== null) {
        const profile = JSON.parse(savedProfile);
        profile.inventory = inventory;
        updates.push([PROFILE_KEY, JSON.stringify(profile)]);
    } else {
        const savedInventory = window.localStorage.getItem(INVENTORY_KEY);
        if (savedInventory !== null) {
            updates.push([INVENTORY_KEY, JSON.stringify(inventory)]);
        }
    }
    updates.push(
        [STORAGE_KEY, JSON.stringify(storage)],
        [CURRENCY_KEY, JSON.stringify(currencies)]
    );

    const originals = updates.map(([key]) => [
        key,
        window.localStorage.getItem(key)
    ]);
    try {
        for (const [key, value] of updates) {
            window.localStorage.setItem(key, value);
        }
    } catch (error) {
        for (const [key, value] of originals) {
            try {
                if (value === null) {
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(key, value);
                }
            } catch (rollbackError) {
                console.error(`Could not restore saved data for "${key}".`, rollbackError);
            }
        }
        throw new Error('Could not save the card sale.', { cause: error });
    }
    return { name: card.name, coins: coinReward, collection };
}

export function claimFirstTimeReward(stageId, opponentId, difficulty, rewards) {
    for (const [label, value] of [['stage', stageId], ['opponent', opponentId]]) {
        if (typeof value !== 'string' || !/^[a-z][a-z0-9-]*$/i.test(value)) {
            throw new TypeError(`First-time reward ${label} is invalid.`);
        }
    }
    if (!BATTLE_DIFFICULTIES.includes(difficulty)) {
        throw new TypeError('First-time reward difficulty is invalid.');
    }
    const rewardChoices = Array.isArray(rewards) ? rewards : [rewards];
    if (rewardChoices.length === 0) {
        throw new TypeError('At least one first-time reward is required.');
    }
    const parsedRewards = rewardChoices.map(parseRewardChoice);

    const storage = readStorage();
    const rewardId =
        `${stageId.toLowerCase()}:${opponentId.toLowerCase()}:${difficulty}`;
    if (storage.firstTimeRewards.includes(rewardId)) {
        return false;
    }

    const currencies = readCurrencies();
    const discoveredCards = new Set(storage.discoveredCards);
    for (const reward of parsedRewards) {
        if (reward.type === 'card') {
            storage.cards.push(createOwnedCard(reward.name));
            discoveredCards.add(reward.name);
        } else {
            const newBalance = currencies.stones[reward.element] + reward.amount;
            if (!Number.isSafeInteger(newBalance)) {
                throw new RangeError(
                    `The ${reward.element} gem balance would exceed the supported amount.`
                );
            }
            currencies.stones[reward.element] = newBalance;
        }
    }
    storage.firstTimeRewards.push(rewardId);
    storage.discoveredCards = [...discoveredCards];

    const updates = [
        [STORAGE_KEY, JSON.stringify(storage)],
        [CURRENCY_KEY, JSON.stringify(currencies)]
    ];
    const originals = updates.map(([key]) => [
        key,
        window.localStorage.getItem(key)
    ]);
    try {
        for (const [key, value] of updates) {
            window.localStorage.setItem(key, value);
        }
    } catch (error) {
        for (const [key, value] of originals) {
            try {
                if (value === null) {
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(key, value);
                }
            } catch (rollbackError) {
                console.error(`Could not restore saved data for "${key}".`, rollbackError);
            }
        }
        throw new Error('Could not save the first-time rewards.', { cause: error });
    }
    return true;
}

export function hasPendingFirstTimeReward(stageId, opponentId, difficulty) {
    for (const [label, value] of [['stage', stageId], ['opponent', opponentId]]) {
        if (typeof value !== 'string' || !/^[a-z][a-z0-9-]*$/i.test(value)) {
            throw new TypeError(`First-time reward ${label} is invalid.`);
        }
    }
    if (!BATTLE_DIFFICULTIES.includes(difficulty)) {
        throw new TypeError('First-time reward difficulty is invalid.');
    }

    const storage = readStorage();
    const rewardId =
        `${stageId.toLowerCase()}:${opponentId.toLowerCase()}:${difficulty}`;
    return storage.firstTimeRewards.includes(rewardId) &&
        !storage.completedFirstTimeRewards.includes(rewardId);
}

export function completeFirstTimeReward(stageId, opponentId, difficulty) {
    for (const [label, value] of [['stage', stageId], ['opponent', opponentId]]) {
        if (typeof value !== 'string' || !/^[a-z][a-z0-9-]*$/i.test(value)) {
            throw new TypeError(`First-time reward ${label} is invalid.`);
        }
    }
    if (!BATTLE_DIFFICULTIES.includes(difficulty)) {
        throw new TypeError('First-time reward difficulty is invalid.');
    }

    const storage = readStorage();
    const rewardId =
        `${stageId.toLowerCase()}:${opponentId.toLowerCase()}:${difficulty}`;
    if (!storage.firstTimeRewards.includes(rewardId)) {
        throw new Error('Cannot complete an unclaimed first-time reward.');
    }
    if (storage.completedFirstTimeRewards.includes(rewardId)) {
        return;
    }

    storage.completedFirstTimeRewards.push(rewardId);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

export function completeCardTraining(
    targetCardId,
    sacrificeCardIds,
    targetLevel,
    targetExperience,
    coinCost
) {
    if (typeof targetCardId !== 'string' || !targetCardId ||
        !Array.isArray(sacrificeCardIds) || sacrificeCardIds.length === 0 ||
        sacrificeCardIds.some(id => typeof id !== 'string' || !id) ||
        new Set(sacrificeCardIds).size !== sacrificeCardIds.length ||
        sacrificeCardIds.includes(targetCardId)) {
        throw new TypeError('Training card selection is invalid.');
    }
    if (!Number.isSafeInteger(targetLevel) || targetLevel < 1 ||
        !Number.isSafeInteger(targetExperience) || targetExperience < 0 ||
        targetExperience >= getCardExperienceForLevel(targetLevel)) {
        throw new TypeError('Trained card experience is invalid.');
    }
    validateCurrencyAmount(coinCost);

    const inventory = readInventoryCards();
    const storage = readStorage();
    const findCard = id => {
        const inventoryIndex = inventory.findIndex(card => card.id === id);
        const storageIndex = storage.cards.findIndex(card => card.id === id);
        if (inventoryIndex !== -1 && storageIndex !== -1) {
            throw new Error('A card ID is duplicated across saved collections.');
        }
        if (inventoryIndex !== -1) {
            return { card: inventory[inventoryIndex], collection: inventory };
        }
        if (storageIndex !== -1) {
            return { card: storage.cards[storageIndex], collection: storage.cards };
        }
        throw new Error('A selected training card could not be found in saved collections.');
    };

    const target = findCard(targetCardId);
    const sacrifices = sacrificeCardIds.map(findCard);
    const inventorySacrificeCount = sacrifices.filter(
        sacrifice => sacrifice.collection === inventory
    ).length;
    if (inventory.length - inventorySacrificeCount < 1) {
        throw new RangeError('Training must leave at least one card in the deck.');
    }
    if (targetLevel < target.card.level) {
        throw new RangeError('Training cannot lower a card level.');
    }
    if (target.card.level >= getCardMaxLevel(target.card.name)) {
        throw new RangeError('This card has already reached its maximum level.');
    }
    if (targetLevel > getCardMaxLevel(target.card.name) ||
        (targetLevel === getCardMaxLevel(target.card.name) && targetExperience !== 0)) {
        throw new RangeError('Training cannot exceed this card’s maximum level.');
    }
    target.card.level = targetLevel;
    target.card.experience = targetExperience;
    for (const sacrifice of sacrifices) {
        const index = sacrifice.collection.findIndex(
            card => card.id === sacrifice.card.id
        );
        sacrifice.collection.splice(index, 1);
    }

    const currencies = readCurrencies();
    if (currencies.coins < coinCost) {
        throw new RangeError('Not enough coins to train this card.');
    }
    currencies.coins -= coinCost;

    const updates = [];
    const savedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (savedProfile !== null) {
        const profile = JSON.parse(savedProfile);
        profile.inventory = inventory;
        updates.push([PROFILE_KEY, JSON.stringify(profile)]);
    } else {
        const savedInventory = window.localStorage.getItem(INVENTORY_KEY);
        if (savedInventory !== null) {
            updates.push([INVENTORY_KEY, JSON.stringify(inventory)]);
        }
    }
    updates.push(
        [STORAGE_KEY, JSON.stringify(storage)],
        [CURRENCY_KEY, JSON.stringify(currencies)]
    );

    const originals = updates.map(([key]) => [
        key,
        window.localStorage.getItem(key)
    ]);
    try {
        for (const [key, value] of updates) {
            window.localStorage.setItem(key, value);
        }
    } catch (error) {
        for (const [key, value] of originals) {
            try {
                if (value === null) {
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(key, value);
                }
            } catch (rollbackError) {
                console.error(`Could not restore saved data for "${key}".`, rollbackError);
            }
        }
        throw new Error('Could not save the training result.', { cause: error });
    }
}

export async function completeCardEnhancement(cardId, starIndex) {
    if (typeof cardId !== 'string' || !cardId ||
        !Number.isSafeInteger(starIndex) || starIndex < 0) {
        throw new TypeError('Enhancement card selection is invalid.');
    }

    const inventory = readInventoryCards();
    const storage = readStorage();
    const inventoryCard = inventory.find(card => card.id === cardId);
    const storageCard = storage.cards.find(card => card.id === cardId);
    if (inventoryCard && storageCard) {
        throw new Error('A card ID is duplicated across saved collections.');
    }
    const target = inventoryCard ?? storageCard;
    if (!target) {
        throw new Error('The selected enhancement card could not be found.');
    }
    const characterModule = await import(`../../data/characters/${target.name}.js`);
    const character = characterModule[`${target.name}Char`];
    const enhancementType = character?.mainType ?? character?.charType;
    const element = typeof enhancementType === 'string'
        ? enhancementType.toLowerCase()
        : undefined;
    const rankValues = ['bronze', 'silver', 'gold'];
    if (!ELEMENTAL_STONES.includes(element)) {
        throw new Error(`Element data for "${target.name}" is missing or invalid.`);
    }
    const starRanks = getCardStarRanks(
        target.name,
        target.enhancement,
        target.starRanks
    );
    if (starIndex >= starRanks.length) {
        throw new RangeError('The selected card star does not exist.');
    }
    const currentRankIndex = rankValues.indexOf(starRanks[starIndex]);
    if (currentRankIndex >= rankValues.length - 1) {
        throw new RangeError('This card star has already reached Gold rank.');
    }
    const stoneCost = currentRankIndex === 0 ? 4 : 6;
    const currencies = readCurrencies();
    if (currencies.stones[element] < stoneCost) {
        throw new RangeError(`Not enough ${element} stones to enhance this card.`);
    }

    starRanks[starIndex] = rankValues[currentRankIndex + 1];
    target.starRanks = starRanks;
    target.enhancement = getCardEnhancementTotal(target.name, starRanks);
    currencies.stones[element] -= stoneCost;

    const updates = [];
    const savedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (savedProfile !== null) {
        const profile = JSON.parse(savedProfile);
        profile.inventory = inventory;
        updates.push([PROFILE_KEY, JSON.stringify(profile)]);
    } else {
        const savedInventory = window.localStorage.getItem(INVENTORY_KEY);
        if (savedInventory !== null) {
            updates.push([INVENTORY_KEY, JSON.stringify(inventory)]);
        }
    }
    updates.push(
        [STORAGE_KEY, JSON.stringify(storage)],
        [CURRENCY_KEY, JSON.stringify(currencies)]
    );

    const originals = updates.map(([key]) => [
        key,
        window.localStorage.getItem(key)
    ]);
    try {
        for (const [key, value] of updates) {
            window.localStorage.setItem(key, value);
        }
    } catch (error) {
        for (const [key, value] of originals) {
            try {
                if (value === null) {
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(key, value);
                }
            } catch (rollbackError) {
                console.error(`Could not restore saved data for "${key}".`, rollbackError);
            }
        }
        throw new Error('Could not save the enhancement result.', { cause: error });
    }
}

export function completeCardFusion(firstCardId, secondCardId, resultName, coinCost) {
    if (typeof firstCardId !== 'string' || !firstCardId ||
        typeof secondCardId !== 'string' || !secondCardId ||
        firstCardId === secondCardId ||
        typeof resultName !== 'string' || !/^[a-z][a-z0-9-]*$/i.test(resultName)) {
        throw new TypeError('Fusion card selection is invalid.');
    }
    validateCurrencyAmount(coinCost);

    const inventory = readInventoryCards();
    const firstIndex = inventory.findIndex(card => card.id === firstCardId);
    const secondIndex = inventory.findIndex(card => card.id === secondCardId);
    if (firstIndex === -1 || secondIndex === -1) {
        throw new Error('Both fusion cards must be in the deck.');
    }
    const firstCard = inventory[firstIndex];
    const secondCard = inventory[secondIndex];
    if (firstCard.level !== getCardMaxLevel(firstCard.name) ||
        firstCard.experience !== 0 ||
        secondCard.level !== getCardMaxLevel(secondCard.name) ||
        secondCard.experience !== 0) {
        throw new RangeError('Both fusion cards must be at their maximum level.');
    }
    const result = findFusionResult(firstCard.name, secondCard.name);
    if (!result || result.charName.toLowerCase() !== resultName.toLowerCase()) {
        throw new Error('These cards do not have a configured fusion result.');
    }
    if (result.rating !== 2) {
        throw new Error('Fusion results must have exactly two rank stars.');
    }
    const starRanks = getFusionStarRanks(firstCard, secondCard);
    const expectedCost =
        getCardExperienceForLevel(getCardMaxLevel(firstCard.name)) +
        getCardExperienceForLevel(getCardMaxLevel(secondCard.name));
    if (coinCost !== expectedCost) {
        throw new Error('The fusion coin cost is invalid.');
    }

    const currencies = readCurrencies();
    if (currencies.coins < coinCost) {
        throw new RangeError('Not enough coins to fuse these cards.');
    }
    inventory.splice(Math.max(firstIndex, secondIndex), 1);
    inventory.splice(Math.min(firstIndex, secondIndex), 1);
    const fusedCard = createOwnedCard(result.charName);
    fusedCard.starRanks = starRanks;
    fusedCard.enhancement = getCardEnhancementTotal(result.charName, starRanks);
    inventory.push(fusedCard);
    currencies.coins -= coinCost;

    const storage = readStorage();
    storage.discoveredCards = [
        ...new Set([...storage.discoveredCards, result.charName.toLowerCase()])
    ];
    const updates = [];
    const savedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (savedProfile !== null) {
        const profile = JSON.parse(savedProfile);
        profile.inventory = inventory;
        updates.push([PROFILE_KEY, JSON.stringify(profile)]);
    } else {
        const savedInventory = window.localStorage.getItem(INVENTORY_KEY);
        if (savedInventory !== null) {
            updates.push([INVENTORY_KEY, JSON.stringify(inventory)]);
        }
    }
    updates.push(
        [STORAGE_KEY, JSON.stringify(storage)],
        [CURRENCY_KEY, JSON.stringify(currencies)]
    );

    const originals = updates.map(([key]) => [
        key,
        window.localStorage.getItem(key)
    ]);
    try {
        for (const [key, value] of updates) {
            window.localStorage.setItem(key, value);
        }
    } catch (error) {
        for (const [key, value] of originals) {
            try {
                if (value === null) {
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(key, value);
                }
            } catch (rollbackError) {
                console.error(`Could not restore saved data for "${key}".`, rollbackError);
            }
        }
        throw new Error('Could not save the fusion result.', { cause: error });
    }
}

export function getInventoryCapacity(level = getPlayerLevel()) {
    if (!Number.isSafeInteger(level) || level < 1) {
        throw new TypeError('Player level must be a positive safe integer.');
    }

    return Math.min(15, 4 + Math.floor(level / 5));
}

export function getPlayerName() {
    const savedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (savedProfile !== null) {
        const profile = JSON.parse(savedProfile);
        if (typeof profile.playerName !== 'string') {
            throw new Error('Saved player name is invalid.');
        }
        return profile.playerName;
    }

    return window.localStorage.getItem(PLAYER_NAME_KEY) ?? '';
}

export function getPlayerType() {
    const savedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (savedProfile === null) {
        return '';
    }

    const profile = JSON.parse(savedProfile);
    if (typeof profile.type !== 'string') {
        throw new Error('Saved player type is invalid.');
    }
    return profile.type;
}

export function getPlayerLevel() {
    return getPlayerProgress().level;
}

export function getPlayerExperience() {
    return getPlayerProgress().experience;
}

export function addPlayerExperience(amount) {
    if (!Number.isSafeInteger(amount) || amount < 1) {
        throw new TypeError('Experience amount must be a positive safe integer.');
    }

    const savedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (savedProfile === null) {
        throw new Error('Cannot add experience without a saved profile.');
    }

    const progress = getPlayerProgress();
    const profile = JSON.parse(window.localStorage.getItem(PROFILE_KEY));
    const totalExperience = progress.experience + amount;
    if (!Number.isSafeInteger(totalExperience)) {
        throw new RangeError('Experience would exceed the maximum supported amount.');
    }
    let level = progress.level;
    let experience = totalExperience;
    let levelUpCoins = 0;
    let levelUpGems = 0;
    while (experience >= getExperienceForLevel(level)) {
        experience -= getExperienceForLevel(level);
        level += 1;
        if (!Number.isSafeInteger(level)) {
            throw new RangeError('Experience would exceed the maximum player level.');
        }
        const levelsGained = level - 2;
        levelUpCoins += 150 + Math.max(0, levelsGained) * 250;
        levelUpGems += 10 + Math.max(0, levelsGained) * 2;
    }

    profile.level = level;
    profile.experience = experience;
    const currencies = readCurrencies();
    currencies.coins += levelUpCoins;
    currencies.gems += levelUpGems;
    if (!Number.isSafeInteger(currencies.coins) ||
        !Number.isSafeInteger(currencies.gems)) {
        throw new RangeError('Level-up rewards would exceed the maximum currency balance.');
    }

    const originals = [
        [PROFILE_KEY, window.localStorage.getItem(PROFILE_KEY)],
        [CURRENCY_KEY, window.localStorage.getItem(CURRENCY_KEY)]
    ];
    try {
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        saveCurrencies(currencies);
    } catch (error) {
        for (const [key, value] of originals) {
            try {
                if (value === null) {
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(key, value);
                }
            } catch (rollbackError) {
                console.error(`Could not restore saved data for "${key}".`, rollbackError);
            }
        }
        throw new Error('Could not save player level-up rewards.', { cause: error });
    }
    return {
        level,
        experience: profile.experience,
        levelUpRewards: { coins: levelUpCoins, gems: levelUpGems }
    };
}

export function getProfileImage() {
    const savedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (savedProfile === null) {
        return null;
    }

    const profile = JSON.parse(savedProfile);
    if (profile.profileImage !== undefined &&
        (typeof profile.profileImage !== 'string' ||
            !profile.profileImage.startsWith('data:image/'))) {
        throw new Error('Saved profile picture is invalid.');
    }
    return profile.profileImage ?? null;
}

export function saveProfileImage(profileImage) {
    if (typeof profileImage !== 'string' || !profileImage.startsWith('data:image/')) {
        throw new TypeError('Profile picture must be an image data URL.');
    }

    const savedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (savedProfile === null) {
        throw new Error('Cannot save a profile picture without a saved profile.');
    }

    const profile = JSON.parse(savedProfile);
    profile.profileImage = profileImage;
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
