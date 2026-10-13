import { order as floralOrder } from '../../data/floral/order.js';
import { order as coralOrder } from '../../data/coral/order.js';

const FLORAL_DEFEATED_KEY = 'fusion-floral-defeated-opponents';
const CORAL_DEFEATED_KEY = 'fusion-coral-defeated-opponents';
const difficulties = ['easy', 'normal', 'hard'];

function getCompletedBattles(order, storageKey, stageName) {
    const savedProgress = window.localStorage.getItem(storageKey);
    if (savedProgress === null) {
        return new Set();
    }

    const savedBattles = JSON.parse(savedProgress);
    if (!Array.isArray(savedBattles) ||
        !savedBattles.every(battle => {
            if (typeof battle !== 'string') {
                return false;
            }
            const [opponentId, difficulty, extra] = battle.split(':');
            return extra === undefined &&
                order.includes(opponentId) &&
                (difficulty === undefined || difficulties.includes(difficulty));
        })) {
        throw new Error(`Saved ${stageName} progress is invalid.`);
    }

    const completedBattles = new Set(savedBattles.map(battle =>
        battle.includes(':') ? battle : `${battle}:easy`
    ));
    if (completedBattles.size !== savedBattles.length) {
        throw new Error(`Saved ${stageName} progress contains duplicate battles.`);
    }

    return completedBattles;
}

function getDefeatedCount(order, storageKey, stageName) {
    return getCompletedBattles(order, storageKey, stageName).size;
}

function isOpponentUnlocked(order, storageKey, stageName, opponentId, difficulty) {
    const opponentIndex = order.indexOf(opponentId);
    if (opponentIndex === -1) {
        throw new TypeError(`Unknown ${stageName} opponent: "${opponentId}".`);
    }
    if (!difficulties.includes(difficulty)) {
        throw new TypeError(`Unknown ${stageName} difficulty: "${difficulty}".`);
    }
    if (opponentIndex === 0) {
        return true;
    }

    const previousOpponentId = order[opponentIndex - 1];
    return getCompletedBattles(order, storageKey, stageName)
        .has(`${previousOpponentId}:${difficulty}`);
}

function recordVictory(order, storageKey, stageName, opponentId, difficulty) {
    if (!order.includes(opponentId)) {
        throw new TypeError(`Unknown ${stageName} opponent: "${opponentId}".`);
    }
    if (!difficulties.includes(difficulty)) {
        throw new TypeError(`Unknown ${stageName} difficulty: "${difficulty}".`);
    }

    const completedBattles = getCompletedBattles(order, storageKey, stageName);
    if (!isOpponentUnlocked(order, storageKey, stageName, opponentId, difficulty)) {
        throw new Error(`This ${stageName} opponent is still locked.`);
    }

    completedBattles.add(`${opponentId}:${difficulty}`);
    const orderedBattles = order.flatMap(id =>
        difficulties
            .filter(level => completedBattles.has(`${id}:${level}`))
            .map(level => `${id}:${level}`)
    );
    window.localStorage.setItem(storageKey, JSON.stringify(orderedBattles));
    return completedBattles.size;
}

export function getFloralDefeatedCount() {
    return getDefeatedCount(floralOrder, FLORAL_DEFEATED_KEY, 'Floral Valley');
}

export function isCoralStageUnlocked() {
    const completedBattles = getCompletedBattles(
        floralOrder,
        FLORAL_DEFEATED_KEY,
        'Floral Valley'
    );
    return difficulties.some(difficulty =>
        floralOrder.every(opponentId =>
            completedBattles.has(`${opponentId}:${difficulty}`)
        )
    );
}

export function resetFloralProgress() {
    window.localStorage.removeItem(FLORAL_DEFEATED_KEY);
}

export function isFloralOpponentUnlocked(opponentId, difficulty) {
    return isOpponentUnlocked(
        floralOrder,
        FLORAL_DEFEATED_KEY,
        'Floral Valley',
        opponentId,
        difficulty
    );
}

export function recordFloralVictory(opponentId, difficulty) {
    return recordVictory(
        floralOrder,
        FLORAL_DEFEATED_KEY,
        'Floral Valley',
        opponentId,
        difficulty
    );
}

export function getCoralDefeatedCount() {
    return getDefeatedCount(coralOrder, CORAL_DEFEATED_KEY, 'Coral Hill');
}

export function resetCoralProgress() {
    window.localStorage.removeItem(CORAL_DEFEATED_KEY);
}

export function isCoralOpponentUnlocked(opponentId, difficulty) {
    const opponentUnlocked = isOpponentUnlocked(
        coralOrder,
        CORAL_DEFEATED_KEY,
        'Coral Hill',
        opponentId,
        difficulty
    );
    return isCoralStageUnlocked() && opponentUnlocked;
}

export function recordCoralVictory(opponentId, difficulty) {
    if (!isCoralOpponentUnlocked(opponentId, difficulty)) {
        throw new Error(
            'Coral Hill is locked until you defeat every Floral Valley opponent on one difficulty.'
        );
    }
    return recordVictory(
        coralOrder,
        CORAL_DEFEATED_KEY,
        'Coral Hill',
        opponentId,
        difficulty
    );
}
