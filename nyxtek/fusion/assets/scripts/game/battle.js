import { order as floralOrder } from '../../data/floral/order.js';
import { issac } from '../../data/floral/opponents/issac.js?v=7';
import { lucas } from '../../data/floral/opponents/lucas.js?v=7';
import { lucy } from '../../data/floral/opponents/lucy.js?v=7';
import { order as coralOrder } from '../../data/coral/order.js';
import { liam } from '../../data/coral/opponents/liam.js?v=7';
import { lorah } from '../../data/coral/opponents/lorah.js?v=7';
import { marie } from '../../data/coral/opponents/marie.js?v=7';
import { zach } from '../../data/coral/opponents/zach.js?v=7';
import { fire } from '../../data/types/fire.js';
import { nature } from '../../data/types/nature.js';
import { water } from '../../data/types/water.js';
import { dark } from '../../data/types/dark.js';
import { electric } from '../../data/types/electric.js';
import { light } from '../../data/types/light.js';
import {
    addCoins,
    addCardToStorage,
    addElementalStones,
    addPlayerExperience,
    claimFirstTimeReward,
    getExperienceForLevel,
    getCoins,
    getGems,
    getInventoryCards,
    getPlayerExperience,
    getPlayerLevel,
    getPlayerName,
    getProfileImage
} from './saves.js?v=23';
import {
    isCoralOpponentUnlocked,
    isFloralOpponentUnlocked,
    recordCoralVictory,
    recordFloralVictory
} from './progression.js?v=3';
import renderCharacter, { fitCardTitle } from '../utils/renderCharacter.js?v=21';

initializeCardDetails();
import { parseRewardChoice } from './rewardChoices.js?v=1';
import { initializeCardDetails } from '../utils/cardDetails.js?v=2';

const opponentData = {
    lucas: { name: 'Lucas', data: lucas },
    lucy: { name: 'Lucy', data: lucy },
    issac: { name: 'Issac', data: issac },
    liam: { name: 'Liam', data: liam },
    lorah: { name: 'Lorah', data: lorah },
    marie: { name: 'Marie', data: marie },
    zach: { name: 'Zach', data: zach }
};
const specialTypes = new Set([
    'aoe', 'direct', 'rand', 'scorch',
    'self-heal', 'rand-heal', 'aoe-heal', 'aoe-purify', 'reduce-rand'
]);
const healingSpecialTypes = new Set([
    'self-heal', 'rand-heal', 'aoe-heal'
]);
const elementalGemIcons = {
    fire: 'firegem.png',
    water: 'watergem.png',
    nature: 'naturegem.png',
    electric: 'lightinggem.png',
    dark: 'darkgem.png',
    light: 'lightgem.png'
};

const stageData = {
    floral: {
        order: floralOrder,
        isUnlocked: isFloralOpponentUnlocked,
        recordVictory: recordFloralVictory
    },
    coral: {
        order: coralOrder,
        isUnlocked: isCoralOpponentUnlocked,
        recordVictory: recordCoralVictory
    }
};

const opponentProfileName = document.querySelector('#opponent-profile-name');
const opponentProfileLevel = document.querySelector('#opponent-profile-level');
const opponentProfileAvatar = document.querySelector('#opponent-avatar');
const battleIntro = document.querySelector('#battle-intro');

if (!(opponentProfileName instanceof HTMLElement) ||
    !(opponentProfileLevel instanceof HTMLElement) ||
    !(opponentProfileAvatar instanceof HTMLElement) ||
    !(battleIntro instanceof HTMLElement)) {
    throw new Error('Could not find the opponent profile display.');
}

const healthStylesheet = document.querySelector('link[href*="/styles/levels.css"]');
if (healthStylesheet instanceof HTMLLinkElement &&
    !healthStylesheet.href.includes('v=59')) {
    const currentHealthStylesheet = document.createElement('link');
    currentHealthStylesheet.rel = 'stylesheet';
    currentHealthStylesheet.href = new URL('../../styles/levels.css?v=60', import.meta.url).href;
    document.head.append(currentHealthStylesheet);
}

function getHealthBar(id, side, label) {
    let bar = document.querySelector(`#${id}`);
    if (!(bar instanceof HTMLElement)) {
        const profile = document.querySelector(side === 'opponent' ? '#opponent-profile' : '#main');
        if (!(profile instanceof HTMLElement)) {
            throw new Error(`Could not find the ${side} profile for its health bar.`);
        }

        bar = document.createElement('div');
        bar.id = id;
        bar.className = `battle-health ${side}-health`;
        bar.setAttribute('role', 'progressbar');
        bar.setAttribute('aria-label', `${label} health`);
        bar.setAttribute('aria-valuemin', '0');
        bar.setAttribute('aria-valuemax', '500');
        bar.setAttribute('aria-valuenow', '500');

        const fill = document.createElement('div');
        fill.id = `${id}-fill`;
        fill.className = 'battle-health-fill';
        const text = document.createElement('span');
        text.id = `${id}-text`;
        text.className = 'battle-health-text';
        bar.append(fill, text);
    }

    const fill = bar.querySelector(`#${id}-fill`);
    const text = bar.querySelector(`#${id}-text`);
    if (!(fill instanceof HTMLElement) || !(text instanceof HTMLElement)) {
        throw new Error(`The ${side} health bar is missing its fill or value display.`);
    }

    const name = document.querySelector(side === 'opponent' ? '#opponent-profile-name' : '#profile');
    if (!(name instanceof HTMLElement)) {
        throw new Error(`Could not find the ${side} name for its health bar.`);
    }
    const wrapperClass = side === 'opponent' ? 'opponent-name-health' : 'player-profile-details';
    let wrapper = name.closest(`.${wrapperClass}`);
    if (!(wrapper instanceof HTMLElement)) {
        wrapper = document.createElement('div');
        wrapper.className = wrapperClass;
        name.before(wrapper);
        wrapper.append(name);
    }
    if (bar.parentElement !== wrapper) {
        wrapper.append(bar);
    }

    return { bar, fill, text };
}

const playerHealthElements = getHealthBar('player-health', 'player', 'Player');
const opponentHealthElements = getHealthBar('opponent-health', 'opponent', 'Opponent');

const query = new URLSearchParams(window.location.search);
const stageId = query.get('stage') ?? 'floral';
const opponentId = query.get('opponent');
const difficulty = query.get('difficulty');
const difficulties = new Set(['easy', 'normal', 'hard']);
const stage = stageData[stageId];

if (!stage || !opponentId || !stage.order.includes(opponentId) ||
    !difficulty || !difficulties.has(difficulty)) {
    throw new Error('The selected battle is invalid.');
}

const opponent = opponentData[opponentId];
if (!opponent) {
    throw new Error(`No opponent data exists for "${opponentId}".`);
}
document.documentElement.dataset.stage = stageId;
document.body.dataset.stage = stageId;
const opponentTypeEmojis = {
    fire: fire.emoji,
    nature: nature.emoji,
    water: water.emoji,
    dark: dark.emoji,
    electric: electric.emoji,
    light: light.emoji
};
const opponentEmoji = opponentTypeEmojis[opponent.data.type];
if (!opponentEmoji) {
    throw new Error(`No emoji is configured for opponent type "${opponent.data.type}".`);
}
opponentProfileName.textContent = opponent.name;
const opponentLevel = opponent.data[difficulty].level;
opponentProfileLevel.textContent = String(opponentLevel);
opponentProfileLevel.setAttribute('aria-label', `Level ${opponentLevel}`);
opponentProfileAvatar.textContent = opponentEmoji;

function getBattleHealthForLevel(level) {
    if (!Number.isSafeInteger(level) || level < 1) {
        throw new TypeError('Battle level must be a positive safe integer.');
    }
    const levelsGained = level - 1;
    const maxHealth = 500 + 50 * levelsGained + 5 * levelsGained * (levelsGained - 1);
    if (!Number.isSafeInteger(maxHealth)) {
        throw new RangeError('Battle health exceeds the supported range.');
    }
    return maxHealth;
}

function shuffleRewardChoices(rewardOptions) {
    const shuffledOptions = [...rewardOptions];
    for (let index = shuffledOptions.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledOptions[index], shuffledOptions[randomIndex]] =
            [shuffledOptions[randomIndex], shuffledOptions[index]];
    }
    return shuffledOptions;
}

function initializeHealthBar(bar, fill, text, level) {
    const maxHealth = getBattleHealthForLevel(level);
    bar.setAttribute('aria-valuemax', String(maxHealth));
    bar.setAttribute('aria-valuenow', String(maxHealth));
    fill.style.width = '100%';
    text.textContent = `${maxHealth}/${maxHealth}`;
}

initializeHealthBar(
    playerHealthElements.bar,
    playerHealthElements.fill,
    playerHealthElements.text,
    getPlayerLevel()
);
initializeHealthBar(
    opponentHealthElements.bar,
    opponentHealthElements.fill,
    opponentHealthElements.text,
    opponentLevel
);

if (!stage.isUnlocked(opponentId, difficulty)) {
    window.location.replace('adventure.html');
    battleIntro.remove();
} else {
    const playerImage = document.querySelector('#battle-intro-player-image');
    const playerName = document.querySelector('#battle-intro-player-name');
    const playerLevel = document.querySelector('#battle-intro-player-level');
    const introOpponentName = document.querySelector('#battle-intro-opponent-name');
    const introOpponentLevel = document.querySelector('#battle-intro-opponent-level');
    const introOpponentType = document.querySelector('#battle-intro-opponent-type');

    if (!(playerImage instanceof HTMLImageElement) ||
        !(playerName instanceof HTMLElement) ||
        !(playerLevel instanceof HTMLElement) ||
        !(introOpponentName instanceof HTMLElement) ||
        !(introOpponentLevel instanceof HTMLElement) ||
        !(introOpponentType instanceof HTMLElement)) {
        throw new Error('Could not find the battle intro profile elements.');
    }

    playerName.textContent = getPlayerName();
    playerLevel.textContent = String(getPlayerLevel());
    playerLevel.setAttribute('aria-label', `Level ${getPlayerLevel()}`);
    playerImage.src = getProfileImage() ?? new URL('../../images/profile.jpg', import.meta.url).href;
    introOpponentName.textContent = opponent.name;
    introOpponentLevel.textContent = String(opponentLevel);
    introOpponentLevel.setAttribute('aria-label', `Level ${opponentLevel}`);
    introOpponentType.textContent = opponentEmoji;

    battleIntro.addEventListener('animationend', event => {
        if (event.target === battleIntro) {
            battleIntro.remove();
        }
    }, { once: true });

    const playerCardsContainer = document.querySelector('#playerCards');
    const opponentCardsContainer = document.querySelector('#opponentCards');
    const playerSlots = [...document.querySelectorAll('#playerCards .battle-slot')];
    const opponentSlots = [...document.querySelectorAll('#opponentCards .battle-slot')];
    const playerHand = document.querySelector('#player-hand');
    const turnStatus = document.querySelector('#battle-turn-status');
    const quitButton = document.querySelector('#battle-quit');
    const quitDialog = document.querySelector('#battle-quit-dialog');
    const quitCancelButton = document.querySelector('#battle-quit-cancel');
    const quitConfirmButton = document.querySelector('#battle-quit-confirm');
    const playerDeck = getInventoryCards();
    const opponentDeck = [...opponent.data[difficulty].inventory];

    if (!(playerCardsContainer instanceof HTMLElement) ||
        !(opponentCardsContainer instanceof HTMLElement) ||
        playerSlots.length === 0 || opponentSlots.length === 0 ||
        !(playerHand instanceof HTMLElement) ||
        !(turnStatus instanceof HTMLElement) ||
        !(quitButton instanceof HTMLButtonElement) ||
        !(quitDialog instanceof HTMLDialogElement) ||
        !(quitCancelButton instanceof HTMLButtonElement) ||
        !(quitConfirmButton instanceof HTMLButtonElement) ||
        playerDeck.length === 0 || opponentDeck.length === 0) {
        throw new Error('Battle cards or card slots are missing.');
    }

    let selectedHandCard = null;
    let nextHandCardId = 0;
    let playerHealth = Number(playerHealthElements.bar.getAttribute('aria-valuemax'));
    let opponentHealth = Number(opponentHealthElements.bar.getAttribute('aria-valuemax'));
    let battleFinished = false;
    let turnLocked = false;

    function getEmptySlot(slots) {
        return slots.filter(slot => !slot.dataset.occupied);
    }

    function getUnit(slot) {
        if (!slot.dataset.occupied) {
            return null;
        }
        const card = slot.firstElementChild;
        if (!(card instanceof HTMLElement)) {
            throw new Error('A battle slot is marked occupied without a card.');
        }
        const attackDamage = Number(card.dataset.attackDamage);
        const currentHealth = Number(card.dataset.currentHealth);
        const maxHealth = Number(card.dataset.maxHealth);
        const specialDamage = Number(card.dataset.specialDamage);
        const damageReduction = Number(card.dataset.damageReduction ?? 0);
        const specialCharge = Number(card.dataset.specialCharge);
        if (!Number.isFinite(attackDamage) || !Number.isFinite(currentHealth) ||
            !Number.isFinite(maxHealth) || !Number.isFinite(specialDamage) ||
            (healingSpecialTypes.has(card.dataset.specialType ?? '') &&
                specialDamage > 0) ||
            (card.dataset.specialType === 'reduce-rand' && specialDamage > 0) ||
            !Number.isFinite(damageReduction) || damageReduction < 0 ||
            !Number.isInteger(specialCharge) || specialCharge < 1 ||
            !specialTypes.has(card.dataset.specialType ?? '')) {
            throw new Error('A battle card has invalid combat data.');
        }
        return {
            card,
            attackDamage,
            currentHealth,
            maxHealth,
            specialDamage,
            damageReduction,
            specialCharge
        };
    }

    function getLivingUnits(slots) {
        return slots.flatMap((slot, index) => {
            const unit = getUnit(slot);
            return unit ? [{ slot, index, ...unit }] : [];
        });
    }

    function selectHandCard(handCard) {
        if (selectedHandCard) {
            selectedHandCard.setAttribute('aria-pressed', 'false');
        }
        selectedHandCard = handCard;
        selectedHandCard.setAttribute('aria-pressed', 'true');
    }

    function updateChargeDisplay(card, charge, maxCharge) {
        const chargeBar = card.querySelector('.chargeBar');
        if (!(chargeBar instanceof HTMLElement)) {
            throw new Error('A battle card is missing its special charge display.');
        }
        const segments = [...chargeBar.querySelectorAll('.chargeSegment')];
        segments.forEach((segment, index) => segment.classList.toggle('filled', index < charge));
        chargeBar.setAttribute(
            'aria-label',
            `${charge} of ${maxCharge} special charges`
        );
    }

    async function depleteChargeDisplay(card, maxCharge) {
        updateChargeDisplay(card, 0, maxCharge);
        const chargeBar = card.querySelector('.chargeBar');
        if (!(chargeBar instanceof HTMLElement)) {
            throw new Error('A battle card is missing its special charge display.');
        }
        const transitions = [...chargeBar.querySelectorAll('.chargeSegment')]
            .flatMap(segment => segment.getAnimations());
        await Promise.all(transitions.map(animation => animation.finished));
    }

    async function animateCardPlacement(card) {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const animation = card.animate([
            { opacity: 0, scale: 0.88, translate: '0 -1.5rem' },
            { opacity: 1, scale: 1.04, translate: '0 0.2rem', offset: 0.72 },
            { opacity: 1, scale: 1, translate: '0 0' }
        ], {
            duration: reducedMotion ? 1 : 420,
            easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)'
        });
        await animation.finished;
        animation.cancel();
    }

    function updateHealthBar(elements, health) {
        const maximumHealth = Number(elements.bar.getAttribute('aria-valuemax'));
        elements.bar.setAttribute('aria-valuenow', String(health));
        elements.fill.style.width = `${(health / maximumHealth) * 100}%`;
        elements.text.textContent = `${health}/${maximumHealth}`;
    }

    async function animateAttack(card, target, isPlayer) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            await new Promise(resolve => window.setTimeout(resolve, 100));
            return;
        }
        const attackerBounds = card.getBoundingClientRect();
        const targetBounds = target.getBoundingClientRect();
        const deltaY = targetBounds.top + targetBounds.height / 2 -
            (attackerBounds.top + attackerBounds.height / 2);
        const attackDistance = Math.min(
            Math.abs(deltaY) * 0.58,
            Math.min(window.innerWidth, window.innerHeight) * 0.28
        ) * 0.75;
        const offsetY = isPlayer ? -attackDistance : attackDistance;
        card.classList.add('battle-attacking');
        try {
            const animation = card.animate([
                { translate: '0 0', scale: 1 },
                {
                    translate: `0 ${offsetY}px`,
                    scale: 1.06,
                    offset: 0.62
                },
                {
                    translate: `0 ${offsetY * 0.8}px`,
                    scale: 0.98,
                    offset: 0.74
                },
                { translate: '0 0', scale: 1 }
            ], {
                duration: 680,
                easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)'
            });
            await animation.finished;
        } finally {
            card.classList.remove('battle-attacking');
        }
    }

    function showHit(card, damage, effectivenessLabel = '', feedbackTarget = card) {
        if (feedbackTarget === card) {
            card.classList.add('battle-damage-visible');
        }
        if (feedbackTarget.classList.contains('battle-slot')) {
            feedbackTarget.classList.add('battle-hit-feedback');
        }
        card.animate([
            { opacity: 1, scale: 1 },
            { opacity: 0.72, scale: 1.04, offset: 0.35 },
            { opacity: 1, scale: 1 }
        ], {
            duration: 420,
            easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)'
        });

        const damageNumber = document.createElement('span');
        damageNumber.className = 'battle-damage-number';
        damageNumber.textContent = `−${damage}`;
        damageNumber.setAttribute('aria-hidden', 'true');
        feedbackTarget.append(damageNumber);
        const cleanupFeedback = () => {
            if (feedbackTarget === card && !card.querySelector('.battle-damage-number')) {
                card.classList.remove('battle-damage-visible');
            }
            if (feedbackTarget.classList.contains('battle-slot') &&
                !feedbackTarget.querySelector('.battle-damage-number, .battle-effectiveness-label')) {
                feedbackTarget.classList.remove('battle-hit-feedback');
            }
        };
        const removeDamageNumber = () => {
            damageNumber.remove();
            cleanupFeedback();
        };
        damageNumber.addEventListener('animationend', () => {
            removeDamageNumber();
        }, { once: true });
        window.setTimeout(() => {
            removeDamageNumber();
        }, 2800);

        if (effectivenessLabel) {
            const label = document.createElement('span');
            label.className = `battle-effectiveness-label ${effectivenessLabel.toLowerCase()}`;
            label.textContent = effectivenessLabel;
            label.setAttribute('aria-hidden', 'true');
            feedbackTarget.append(label);
            const removeLabel = () => {
                label.remove();
                cleanupFeedback();
            };
            label.addEventListener('animationend', removeLabel, { once: true });
            window.setTimeout(removeLabel, 2800);
        }
    }

    async function removeDefeatedCard(slot, card, animate = true) {
        const emptySlot = document.createElement('img');
        emptySlot.src = new URL('../../images/icons/plus.png', import.meta.url).href;
        emptySlot.alt = '';
        if (animate) {
            const isPlayerCard = slot.parentElement === playerCardsContainer;
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            await card.animate([
                { opacity: 1, scale: 1, rotate: '0deg', filter: 'brightness(1) saturate(1)' },
                ...(isPlayerCard && !reducedMotion
                    ? [
                        { opacity: 1, scale: 1.06, rotate: '-5deg', filter: 'brightness(1.8) saturate(0.5)', offset: 0.2 },
                        { opacity: 0.72, scale: 0.78, rotate: '8deg', filter: 'brightness(1) saturate(0)', offset: 0.58 }
                    ]
                    : []),
                { opacity: 0, scale: isPlayerCard ? 0.2 : 0.82, rotate: isPlayerCard ? '18deg' : '0deg', filter: 'brightness(0.6) saturate(0)' }
            ], {
                duration: reducedMotion
                    ? 1
                    : isPlayerCard ? 700 : 360,
                easing: 'cubic-bezier(0.4, 0, 0.8, 0.5)',
                fill: 'forwards'
            }).finished;
        }
        if (slot.firstElementChild === card) {
            card.replaceWith(emptySlot);
            delete slot.dataset.occupied;
            const slotIndex = [...slot.parentElement.children].indexOf(slot) + 1;
            slot.setAttribute(
                'aria-label',
                slot.parentElement === playerCardsContainer
                    ? `Empty card slot ${slotIndex}`
                    : 'Empty opponent card slot'
            );
        }
    }

    function getEffectiveDamage(attacker, target, baseDamage) {
        let multiplier = 1;
        let label = '';
        if (attacker.dataset.typeStrength === target.dataset.characterType) {
            multiplier = 1.25;
            label = 'CRITICAL';
        } else if (attacker.dataset.typeWeakness === target.dataset.characterType) {
            multiplier = 0.8;
            label = 'WEAK';
        }
        return { damage: Math.round(baseDamage * multiplier), label };
    }

    async function animateAoeSpecial(card) {
        await card.animate([
            { filter: 'brightness(1) drop-shadow(0 0 0 transparent)', scale: 1 },
            { filter: 'brightness(1.8) drop-shadow(0 0 1.2rem #ffe56b)', scale: 1.08, offset: 0.45 },
            { filter: 'brightness(1) drop-shadow(0 0 0 transparent)', scale: 1 }
        ], {
            duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 620,
            easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)'
        }).finished;
    }

    async function damageUnit(slot, damage, effectivenessLabel = '', animate = true) {
        const unit = getUnit(slot);
        if (!unit) {
            return;
        }
        const newHealth = Math.max(0, unit.currentHealth - damage);
        unit.card.dataset.currentHealth = String(newHealth);
        const healthValue = unit.card.querySelector('.healthStat span');
        if (!(healthValue instanceof HTMLElement)) {
            throw new Error('A battle card is missing its health value.');
        }
        healthValue.textContent = String(newHealth);
        unit.card.querySelector('.healthStat')?.setAttribute('aria-label', `health: ${newHealth}`);
        if (animate) {
            showHit(unit.card, damage, effectivenessLabel, slot);
        }
        if (effectivenessLabel) {
            unit.card.querySelector('.healthStat')?.setAttribute(
                'aria-label',
                `health: ${newHealth}, ${effectivenessLabel.toLowerCase()} hit for ${damage}`
            );
        }
        if (newHealth === 0) {
            await removeDefeatedCard(slot, unit.card, animate);
        }
    }

    async function healUnit(slot, healing) {
        const unit = getUnit(slot);
        if (!unit) {
            return;
        }
        const restoredHealth = Math.min(healing, unit.maxHealth - unit.currentHealth);
        const healthValue = unit.card.querySelector('.healthStat span');
        const healthStat = unit.card.querySelector('.healthStat');
        if (!(healthValue instanceof HTMLElement) || !(healthStat instanceof HTMLElement)) {
            throw new Error('A battle card is missing its health value.');
        }
        if (restoredHealth > 0) {
            const newHealth = unit.currentHealth + restoredHealth;
            unit.card.dataset.currentHealth = String(newHealth);
            healthValue.textContent = String(newHealth);
            healthStat.setAttribute('aria-label', `health: ${newHealth}`);
        }
        unit.card.classList.add('battle-damage-visible');
        unit.card.animate([
            { filter: 'brightness(1)', scale: 1 },
            { filter: 'brightness(1.65) drop-shadow(0 0 1rem #91ffb0)', scale: 1.04 },
            { filter: 'brightness(1)', scale: 1 }
        ], {
            duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 450,
            easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)'
        });
        const healingNumber = document.createElement('span');
        healingNumber.className = 'battle-heal-number';
        healingNumber.textContent = `+${healing}`;
        healingNumber.setAttribute('aria-hidden', 'true');
        unit.card.append(healingNumber);
        const removeHealingNumber = () => {
            healingNumber.remove();
            if (!unit.card.querySelector('.battle-heal-number')) {
                unit.card.classList.remove('battle-damage-visible');
            }
        };
        healingNumber.addEventListener('animationend', removeHealingNumber, { once: true });
        window.setTimeout(removeHealingNumber, 1800);
    }

    function setDamageReduction(unit, reduction) {
        const maximumReduction = unit.attackDamage;
        const nextReduction = Math.min(maximumReduction, Math.max(0, reduction));
        unit.card.dataset.damageReduction = String(nextReduction);
        unit.damageReduction = nextReduction;
        const damageValue = unit.card.querySelector('.damageStat span');
        const damageStat = unit.card.querySelector('.damageStat');
        if (!(damageValue instanceof HTMLElement) || !(damageStat instanceof HTMLElement)) {
            throw new Error('A battle card is missing its damage display.');
        }
        const remainingDamage = Math.max(0, unit.attackDamage - nextReduction);
        damageValue.textContent = String(remainingDamage);
        damageStat.setAttribute(
            'aria-label',
            nextReduction > 0
                ? `damage: ${remainingDamage}, reduced by ${nextReduction}`
                : `damage: ${remainingDamage}`
        );
    }

    async function damagePlayer(isPlayer, damage) {
        const healthBar = isPlayer ? playerHealthElements.bar : opponentHealthElements.bar;
        if (isPlayer) {
            playerHealth = Math.max(0, playerHealth - damage);
            updateHealthBar(playerHealthElements, playerHealth);
        } else {
            opponentHealth = Math.max(0, opponentHealth - damage);
            updateHealthBar(opponentHealthElements, opponentHealth);
        }
        showHit(healthBar, damage);
        await new Promise(resolve => window.setTimeout(resolve, 270));
    }

    async function performSpecial(unit, defendingSlots, isPlayer) {
        const chargeValue = Number(unit.card.dataset.currentCharge ?? 0);
        if (chargeValue < unit.specialCharge) {
            return false;
        }

        const specialType = unit.card.dataset.specialType;
        const isHealing = healingSpecialTypes.has(specialType);
        const isAreaDebuff = specialType === 'aoe-purify';
        let targets;
        if (specialType === 'direct') {
            const target = defendingSlots[unit.index];
            const targetUnit = target ? getUnit(target) : null;
            if (!target || !targetUnit) {
                return false;
            }
            targets = [{ slot: target, ...targetUnit }];
        } else if (specialType === 'self-heal') {
            targets = [{ slot: unit.slot, ...unit }];
        } else if (specialType === 'aoe-heal') {
            const allySlots = isPlayer ? playerSlots : opponentSlots;
            targets = getLivingUnits(allySlots);
        } else if (specialType === 'rand-heal') {
            const allySlots = isPlayer ? playerSlots : opponentSlots;
            const livingAllies = getLivingUnits(allySlots);
            targets = livingAllies.length > 0
                ? [livingAllies[Math.floor(Math.random() * livingAllies.length)]]
                : [];
        } else {
            targets = getLivingUnits(defendingSlots);
            if (targets.length === 0) {
                return false;
            }
            if (specialType === 'rand' || specialType === 'scorch' ||
                specialType === 'reduce-rand') {
                targets = [targets[Math.floor(Math.random() * targets.length)]];
            }
        }
        if (targets.length === 0) {
            return false;
        }

        unit.card.dataset.currentCharge = '0';
        await depleteChargeDisplay(unit.card, unit.specialCharge);
        const specialDescriptions = {
            aoe: 'uses an AOE attack!',
            direct: 'uses a direct attack!',
            rand: 'attacks a random enemy!',
            scorch: 'scorches a random enemy!',
            'self-heal': 'heals itself!',
            'rand-heal': 'heals a random ally!',
            'aoe-heal': 'heals every allied card!',
            'aoe-purify': 'reduces every opponent’s damage!',
            'reduce-rand': 'reduces a random enemy’s damage!'
        };
        turnStatus.textContent =
            `${unit.card.dataset.characterName} ${specialDescriptions[specialType]}`;
        if (targets.length > 1 || specialType === 'aoe' ||
            specialType === 'aoe-heal' || isAreaDebuff || isHealing) {
            await animateAoeSpecial(unit.card);
        } else {
            await animateAttack(unit.card, targets[0].card, isPlayer);
        }
        if (battleFinished) {
            return true;
        }

        if (isHealing) {
            await Promise.all(targets.map(target =>
                healUnit(target.slot, Math.abs(unit.specialDamage))
            ));
        } else if (specialType === 'reduce-rand' || isAreaDebuff) {
            targets.forEach(target => {
                setDamageReduction(target, target.damageReduction + Math.abs(unit.specialDamage));
            });
        } else {
            await Promise.all(targets.map(async target => {
                const damage = unit.specialDamage;
                const hit = getEffectiveDamage(unit.card, target.card, damage);
                if (hit.label) {
                    turnStatus.textContent =
                        `${unit.card.dataset.characterName} hits ${hit.label.toLowerCase()}!`;
                }
                await damageUnit(target.slot, hit.damage, hit.label);
            }));
        }
        return true;
    }

    async function performCardTurn(slot, defendingSlots, isPlayer) {
        const unit = getUnit(slot);
        if (!unit || battleFinished) {
            return;
        }
        const laneIndex = (isPlayer ? playerSlots : opponentSlots).indexOf(slot);
        if (Number(unit.card.dataset.currentCharge ?? 0) >= unit.specialCharge &&
            await performSpecial({ ...unit, index: laneIndex, slot }, defendingSlots, isPlayer)) {
            return;
        }

        const targetSlot = defendingSlots[laneIndex];
        const target = targetSlot ? getUnit(targetSlot) : null;
        turnStatus.textContent = `${unit.card.dataset.characterName} attacks!`;
        const targetElement = target
            ? target.card
            : isPlayer ? opponentHealthElements.bar : playerHealthElements.bar;
        await animateAttack(unit.card, targetElement, isPlayer);
        if (battleFinished) {
            return;
        }
        const effectiveAttackDamage = Math.max(
            0,
            unit.attackDamage - unit.damageReduction
        );
        if (target) {
            const hit = getEffectiveDamage(unit.card, target.card, effectiveAttackDamage);
            turnStatus.textContent = hit.label
                ? `${unit.card.dataset.characterName} scores a ${hit.label.toLowerCase()} hit!`
                : `${unit.card.dataset.characterName} hits ${target.card.dataset.characterName}!`;
            await damageUnit(targetSlot, hit.damage, hit.label);
        } else {
            await damagePlayer(!isPlayer, effectiveAttackDamage);
        }

        const currentUnit = getUnit(slot);
        if (!currentUnit) {
            return;
        }
        const previousCharge = Number(currentUnit.card.dataset.currentCharge ?? 0);
        const charge = Math.min(currentUnit.specialCharge, previousCharge + 1);
        currentUnit.card.dataset.currentCharge = String(charge);
        updateChargeDisplay(currentUnit.card, charge, currentUnit.specialCharge);
    }

    function sideIsOutOfCards(slots, deck) {
        return getLivingUnits(slots).length === 0 && deck.length === 0;
    }

    function animateRewards(
        rewardCoins,
        rewardExperience,
        startingLevel,
        startingExperience,
        finalLevel,
        finalExperience,
        coinsCounter,
        coinBalance,
        levelCounter,
        experienceCounter,
        experienceTrack,
        experienceFill,
        levelUpMessage,
        startingCoins,
        finalCoins,
        levelUpCoins,
        levelUpGems
    ) {
        const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 0
            : 1200;
        let lastDisplayedLevel = startingLevel;
        const update = progress => {
            const coinsEarned = Math.floor(rewardCoins * progress);
            const experienceEarned = Math.floor(rewardExperience * progress);
            let displayedExperience = startingExperience + experienceEarned;
            let displayedLevel = startingLevel;
            while (displayedExperience >= getExperienceForLevel(displayedLevel)) {
                displayedExperience -= getExperienceForLevel(displayedLevel);
                displayedLevel += 1;
            }
            if (displayedLevel > lastDisplayedLevel) {
                animateBattleElement(levelCounter, 'battle-level-bump');
                lastDisplayedLevel = displayedLevel;
            }
            const experiencePerLevel = getExperienceForLevel(displayedLevel);

            coinsCounter.textContent = `+${coinsEarned.toLocaleString()}`;
            coinBalance.textContent =
                `Total coins: ${(startingCoins + coinsEarned).toLocaleString()}`;
            levelCounter.textContent = `Level ${displayedLevel}`;
            experienceCounter.textContent =
                `${displayedExperience} / ${experiencePerLevel} EXP`;
            experienceTrack.setAttribute('aria-valuemax', String(experiencePerLevel));
            experienceTrack.setAttribute('aria-valuenow', String(displayedExperience));
            experienceFill.style.width =
                `${(displayedExperience / experiencePerLevel) * 100}%`;
        };

        return new Promise(resolve => {
            if (duration === 0) {
                update(1);
                if (finalLevel > startingLevel) {
                    levelUpMessage.textContent =
                        `LEVEL UP! You reached level ${finalLevel}. ` +
                        `+${levelUpCoins.toLocaleString()} coins, ` +
                        `+${levelUpGems.toLocaleString()} gems.`;
                    levelUpMessage.hidden = false;
                }
                resolve();
                return;
            }

            const startTime = performance.now();
            function step(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                update(progress);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                    return;
                }
                if (finalLevel > startingLevel) {
                    levelUpMessage.textContent =
                        `LEVEL UP! You reached level ${finalLevel}. ` +
                        `+${levelUpCoins.toLocaleString()} coins, ` +
                        `+${levelUpGems.toLocaleString()} gems.`;
                    levelUpMessage.hidden = false;
                }
                coinsCounter.textContent = `+${rewardCoins.toLocaleString()}`;
                coinBalance.textContent = `Total coins: ${finalCoins.toLocaleString()}`;
                levelCounter.textContent = `Level ${finalLevel}`;
                const finalExperiencePerLevel = getExperienceForLevel(finalLevel);
                experienceCounter.textContent =
                    `${finalExperience} / ${finalExperiencePerLevel} EXP`;
                experienceTrack.setAttribute(
                    'aria-valuemax',
                    String(finalExperiencePerLevel)
                );
                experienceTrack.setAttribute('aria-valuenow', String(finalExperience));
                experienceFill.style.width =
                    `${(finalExperience / finalExperiencePerLevel) * 100}%`;
                resolve();
            }
            window.requestAnimationFrame(step);
        });
    }

    function animateBattleElement(element, animationClass) {
        element.classList.remove(animationClass);
        void element.offsetWidth;
        element.classList.add(animationClass);
    }

    function finishBattle(outcome) {
        if (battleFinished) {
            return;
        }
        battleFinished = true;
        turnLocked = true;
        quitButton.hidden = true;
        playerHand.hidden = true;
        playerHand.replaceChildren();
        playerCardsContainer.classList.remove('player-turn');
        opponentCardsContainer.classList.remove('opponent-turn');

        const rewardData = opponent.data[difficulty];
        const rewardRate = outcome === 'victory' ? 1 : 0;
        const baseCoins = rewardData.coins;
        const baseExperience = rewardData.exp;
        if (!Number.isSafeInteger(baseCoins) || baseCoins < 0 ||
            !Number.isSafeInteger(baseExperience) || baseExperience < 0) {
            throw new Error('The battle reward data is invalid.');
        }
        const battleCoins = Math.floor(baseCoins * rewardRate);
        const rewardExperience = Math.floor(baseExperience * rewardRate);
        const startingCoins = getCoins();
        const startingGems = getGems();
        const startingLevel = getPlayerLevel();
        const startingExperience = getPlayerExperience();
        const firstTimeRewardData = rewardData.firstTime;
        const firstTimeRewardChoices = firstTimeRewardData === undefined
            ? []
            : Array.isArray(firstTimeRewardData)
                ? firstTimeRewardData
                : [firstTimeRewardData];
        const rewardOptions = rewardData.reward ?? [];
        if (firstTimeRewardChoices.length === 0 && firstTimeRewardData !== undefined) {
            throw new Error('The opponent first-time reward list is empty.');
        }
        if (!Array.isArray(rewardOptions) ||
            (rewardOptions.length > 0 && firstTimeRewardChoices.length === 0)) {
            throw new Error('The opponent first-time reward choices are invalid.');
        }
        const parsedFirstTimeRewards = firstTimeRewardChoices.map(parseRewardChoice);
        const parsedRewardOptions = shuffleRewardChoices(
            rewardOptions.map(parseRewardChoice)
        );
        let firstTimeRewardClaimed = false;
        if (outcome === 'victory') {
            stage.recordVictory(opponentId, difficulty);
            if (parsedFirstTimeRewards.length > 0) {
                firstTimeRewardClaimed = claimFirstTimeReward(
                    stageId,
                    opponentId,
                    difficulty,
                    firstTimeRewardChoices
                );
            }
        }
        const rewardChoiceAvailable =
            outcome === 'victory' && parsedRewardOptions.length > 0;
        const progress = rewardExperience > 0
            ? addPlayerExperience(rewardExperience)
            : {
                level: startingLevel,
                experience: startingExperience,
                levelUpRewards: { coins: 0, gems: 0 }
            };
        if (battleCoins > 0) {
            addCoins(battleCoins);
        }
        const finalCoins = getCoins();
        const finalGems = getGems();
        const rewardCoins = finalCoins - startingCoins;
        const rewardGems = finalGems - startingGems;

        const result = document.createElement('dialog');
        result.className = 'battle-result';
        result.dataset.outcome = outcome;
        result.setAttribute('aria-labelledby', 'battle-result-title');
        const heading = document.createElement('h2');
        heading.id = 'battle-result-title';
        heading.tabIndex = -1;
        heading.textContent = {
            victory: 'Victory!',
            defeat: 'Defeat',
            draw: 'Draw',
            quit: 'Battle Forfeited'
        }[outcome];
        const message = document.createElement('p');
        if (outcome === 'victory') {
            message.textContent = 'You won the battle and earned the full rewards.';
        } else if (outcome === 'quit') {
            message.textContent = 'You forfeited the battle. No rewards were earned.';
        } else if (outcome === 'defeat') {
            message.textContent = 'Your team has been defeated. No rewards were earned.';
        } else if (outcome === 'draw') {
            message.textContent = 'Both teams ran out of cards.';
        } else {
            message.textContent = 'The battle ended without a winner.';
        }

        const rewardsPanel = document.createElement('div');
        rewardsPanel.className = 'battle-result-rewards';
        const coinsEntry = document.createElement('div');
        coinsEntry.className = 'battle-reward-entry';
        const coinsLabel = document.createElement('span');
        coinsLabel.textContent = 'Coins earned';
        const coinsCounter = document.createElement('strong');
        coinsCounter.textContent = '+0';
        coinsCounter.setAttribute('aria-live', 'polite');
        const coinBalance = document.createElement('small');
        coinBalance.textContent = `Total coins: ${startingCoins.toLocaleString()}`;
        coinsEntry.append(coinsLabel, coinsCounter, coinBalance);

        const gemsEntry = document.createElement('div');
        gemsEntry.className = 'battle-reward-entry';
        const gemsLabel = document.createElement('span');
        gemsLabel.textContent = 'Gems earned';
        const gemsCounter = document.createElement('strong');
        gemsCounter.textContent = `+${rewardGems.toLocaleString()}`;
        const gemBalance = document.createElement('small');
        gemBalance.textContent = `Total gems: ${finalGems.toLocaleString()}`;
        gemsEntry.append(gemsLabel, gemsCounter, gemBalance);

        const experienceEntry = document.createElement('div');
        experienceEntry.className = 'battle-reward-entry battle-experience-entry';
        const experienceLabel = document.createElement('span');
        experienceLabel.textContent = 'Player experience';
        const levelCounter = document.createElement('strong');
        levelCounter.textContent = `Level ${startingLevel}`;
        const experienceTrack = document.createElement('div');
        experienceTrack.className = 'battle-experience-track';
        experienceTrack.setAttribute('role', 'progressbar');
        experienceTrack.setAttribute('aria-label', 'Experience to next level');
        experienceTrack.setAttribute('aria-valuemin', '0');
        const startingExperiencePerLevel = getExperienceForLevel(startingLevel);
        experienceTrack.setAttribute(
            'aria-valuemax',
            String(startingExperiencePerLevel)
        );
        experienceTrack.setAttribute('aria-valuenow', String(startingExperience));
        const experienceFill = document.createElement('span');
        experienceFill.className = 'battle-experience-fill';
        experienceFill.style.width =
            `${(startingExperience / startingExperiencePerLevel) * 100}%`;
        experienceTrack.append(experienceFill);
        const experienceCounter = document.createElement('small');
        experienceCounter.textContent =
            `${startingExperience} / ${startingExperiencePerLevel} EXP`;
        const levelUpMessage = document.createElement('strong');
        levelUpMessage.className = 'battle-level-up';
        levelUpMessage.hidden = true;
        if (progress.level > startingLevel) {
            levelUpMessage.textContent = `Potential level up: level ${progress.level}`;
            levelUpMessage.hidden = false;
        } else {
            levelUpMessage.hidden = true;
        }
        experienceEntry.append(
            experienceLabel,
            levelCounter,
            experienceTrack,
            experienceCounter,
            levelUpMessage
        );
        rewardsPanel.append(coinsEntry, gemsEntry, experienceEntry);

        const summaryPanel = document.createElement('section');
        summaryPanel.className = 'battle-result-summary';
        summaryPanel.append(heading, message, rewardsPanel);
        const possibleRewardsHeading = document.createElement('h4');
        possibleRewardsHeading.className = 'battle-possible-rewards-heading';
        possibleRewardsHeading.textContent = 'Possible win rewards';
        const possibleRewardsList = document.createElement('div');
        possibleRewardsList.className = 'battle-possible-rewards';
        const possibleRewardsError = document.createElement('p');
        possibleRewardsError.className = 'battle-reward-error';
        possibleRewardsError.setAttribute('role', 'alert');
        if (rewardChoiceAvailable) {
            summaryPanel.append(
                possibleRewardsHeading,
                possibleRewardsList,
                possibleRewardsError
            );
        }
        const summaryActions = document.createElement('div');
        summaryActions.className = 'battle-result-actions';
        summaryPanel.append(summaryActions);

        const firstTimePanel = document.createElement('section');
        firstTimePanel.className = 'battle-first-time-reward';
        firstTimePanel.hidden = true;
        const firstTimeHeading = document.createElement('h3');
        firstTimeHeading.id = 'battle-first-time-title';
        firstTimeHeading.textContent = 'First-time rewards!';
        const firstTimeRewardsTarget = document.createElement('div');
        firstTimeRewardsTarget.className = 'battle-first-time-rewards';
        const firstTimeNote = document.createElement('p');
        firstTimeNote.className = 'battle-reward-note';
        firstTimeNote.textContent = 'All first-time rewards were saved.';
        firstTimePanel.append(
            firstTimeHeading,
            firstTimeRewardsTarget,
            firstTimeNote
        );

        const firstTimeContinue = document.createElement('button');
        firstTimeContinue.className = 'button';
        firstTimeContinue.type = 'button';
        firstTimeContinue.textContent = parsedRewardOptions.length > 0
            ? 'Choose a reward'
            : 'Return to Adventure';
        const firstTimeActions = document.createElement('div');
        firstTimeActions.className = 'battle-result-actions';
        firstTimeActions.append(firstTimeContinue);
        firstTimePanel.append(firstTimeActions);

        const rewardChoicesPanel = document.createElement('section');
        rewardChoicesPanel.className = 'battle-reward-choices';
        rewardChoicesPanel.hidden = true;
        const rewardChoicesHeading = document.createElement('h3');
        rewardChoicesHeading.id = 'battle-reward-choices-title';
        rewardChoicesHeading.textContent = 'Choose one hidden reward';
        const rewardChoiceGrid = document.createElement('div');
        rewardChoiceGrid.className = 'battle-reward-choice-grid';
        const selectedRewardError = document.createElement('p');
        selectedRewardError.className = 'battle-reward-error';
        selectedRewardError.setAttribute('role', 'alert');
        const selectedRewardPanel = document.createElement('section');
        selectedRewardPanel.className = 'battle-selected-reward';
        selectedRewardPanel.hidden = true;
        const selectedRewardHeading = document.createElement('h3');
        selectedRewardHeading.id = 'battle-selected-reward-title';
        selectedRewardHeading.textContent = 'Reward revealed!';
        const selectedRewardContent = document.createElement('div');
        selectedRewardContent.className = 'battle-selected-reward-content';
        const selectedRewardNote = document.createElement('p');
        selectedRewardNote.className = 'battle-reward-note';
        const selectedReturnActions = document.createElement('div');
        selectedReturnActions.className = 'battle-result-actions';
        const selectedReturnLink = document.createElement('a');
        selectedReturnLink.className = 'button';
        selectedReturnLink.href = 'adventure.html';
        selectedReturnLink.textContent = 'Return to Adventure';
        selectedReturnActions.append(selectedReturnLink);
        selectedRewardPanel.append(
            selectedRewardHeading,
            selectedRewardContent,
            selectedRewardNote,
            selectedReturnActions
        );

        const rewardChoiceButtons = [];
        let possibleRewardsRendered = false;
        async function renderPossibleRewards() {
            if (possibleRewardsRendered) {
                return;
            }
            possibleRewardsRendered = true;

            for (const rewardOption of parsedRewardOptions) {
                const rewardPreview = document.createElement('div');
                rewardPreview.className = 'battle-possible-reward';
                if (rewardOption.type === 'card') {
                    const previewTarget = document.createElement('div');
                    previewTarget.className = 'battle-reward-card-preview';
                    const rewardName = document.createElement('span');
                    rewardName.textContent = rewardOption.name.toUpperCase();
                    rewardPreview.append(previewTarget, rewardName);
                    possibleRewardsList.append(rewardPreview);
                    try {
                        await renderCharacter(rewardOption.name, previewTarget);
                    } catch (error) {
                        console.error('Could not render a possible card reward.', error);
                        possibleRewardsError.textContent =
                            'Some reward previews could not be displayed.';
                    }
                    continue;
                }

                const gemIcon = document.createElement('img');
                gemIcon.className = 'battle-reward-gem-icon';
                gemIcon.src = new URL(
                    `../../images/icons/${elementalGemIcons[rewardOption.element]}`,
                    import.meta.url
                ).href;
                gemIcon.alt = '';
                gemIcon.setAttribute('aria-hidden', 'true');
                const gemAmount = document.createElement('strong');
                gemAmount.textContent =
                    `${rewardOption.amount.toLocaleString()} ${rewardOption.element} gems`;
                rewardPreview.append(gemIcon, gemAmount);
                possibleRewardsList.append(rewardPreview);
            }
        }

        for (const [index, rewardOption] of parsedRewardOptions.entries()) {
            const choiceButton = document.createElement('button');
            choiceButton.className = 'battle-reward-unknown';
            choiceButton.type = 'button';
            choiceButton.textContent = '?';
            choiceButton.setAttribute('aria-label', `Hidden reward ${index + 1}`);
            rewardChoiceButtons.push(choiceButton);
            choiceButton.addEventListener('click', async () => {
                rewardChoiceButtons.forEach(button => {
                    button.disabled = true;
                });
                selectedRewardError.textContent = '';
                selectedRewardContent.replaceChildren();
                let cardRevealTarget = null;

                try {
                    if (rewardOption.type === 'card') {
                        const cardTarget = document.createElement('div');
                        cardTarget.className = 'battle-reward-card-preview';
                        await renderCharacter(rewardOption.name, cardTarget);
                        addCardToStorage(rewardOption.name);
                        selectedRewardContent.append(cardTarget);
                        cardRevealTarget = cardTarget;
                        selectedRewardNote.textContent =
                            `${rewardOption.name.toUpperCase()} was added to storage.`;
                    } else {
                        addElementalStones(rewardOption.element, rewardOption.amount);
                        const gemIcon = document.createElement('img');
                        gemIcon.className = 'battle-reward-gem-icon';
                        gemIcon.src = new URL(
                            `../../images/icons/${elementalGemIcons[rewardOption.element]}`,
                            import.meta.url
                        ).href;
                        gemIcon.alt = '';
                        gemIcon.setAttribute('aria-hidden', 'true');
                        const gemAmount = document.createElement('strong');
                        gemAmount.textContent =
                            `+${rewardOption.amount.toLocaleString()} ${rewardOption.element} gems`;
                        selectedRewardContent.append(gemIcon, gemAmount);
                        selectedRewardNote.textContent = 'Added to your gem balance.';
                    }
                    rewardChoicesPanel.hidden = true;
                    selectedRewardPanel.hidden = false;
                    if (cardRevealTarget) {
                        animateBattleElement(cardRevealTarget, 'battle-card-reveal');
                    }
                    result.setAttribute('aria-labelledby', selectedRewardHeading.id);
                    selectedReturnLink.focus();
                } catch (error) {
                    console.error('Could not award the selected battle reward.', error);
                    selectedRewardError.textContent =
                        'Could not save this reward. Please choose again.';
                    rewardChoiceButtons.forEach(button => {
                        button.disabled = false;
                    });
                }
            });
            rewardChoiceGrid.append(choiceButton);
        }
        rewardChoicesPanel.append(
            rewardChoicesHeading,
            rewardChoiceGrid,
            selectedRewardError
        );

        firstTimeContinue.addEventListener('click', () => {
            if (parsedRewardOptions.length > 0) {
                firstTimePanel.hidden = true;
                rewardChoicesPanel.hidden = false;
                result.setAttribute('aria-labelledby', rewardChoicesHeading.id);
                rewardChoiceButtons[0]?.focus();
                renderPossibleRewards();
                return;
            }
            window.location.href = 'adventure.html';
        });

        const returnLink = document.createElement('a');
        returnLink.className = 'button';
        returnLink.href = 'adventure.html';
        returnLink.textContent = 'Return to Adventure';
        if (firstTimeRewardClaimed || rewardChoiceAvailable) {
            result.append(summaryPanel);
            if (firstTimeRewardClaimed) {
                result.append(firstTimePanel);
            }
            result.append(rewardChoicesPanel, selectedRewardPanel);
        } else {
            const actions = document.createElement('div');
            actions.className = 'battle-result-actions';
            actions.append(returnLink);
            summaryPanel.append(actions);
            result.append(summaryPanel);
        }
        document.body.append(result);
        result.addEventListener('cancel', event => event.preventDefault());
        result.showModal();
        returnLink.focus();
        turnStatus.textContent = heading.textContent;
        if (rewardChoiceAvailable) {
            renderPossibleRewards().catch(error => {
                console.error('Could not render the possible win rewards.', error);
                possibleRewardsError.textContent =
                    'The possible rewards could not be displayed.';
            });
        }

        animateRewards(
            rewardCoins,
            rewardExperience,
            startingLevel,
            startingExperience,
            progress.level,
            progress.experience,
            coinsCounter,
            coinBalance,
            levelCounter,
            experienceCounter,
            experienceTrack,
            experienceFill,
            levelUpMessage,
            startingCoins,
            finalCoins,
            progress.levelUpRewards.coins,
            progress.levelUpRewards.gems
        ).catch(error => {
            console.error('Could not animate the battle rewards.', error);
            coinsCounter.textContent = `+${rewardCoins.toLocaleString()}`;
            coinBalance.textContent = `Total coins: ${finalCoins.toLocaleString()}`;
            levelCounter.textContent = `Level ${progress.level}`;
            const finalExperiencePerLevel = getExperienceForLevel(progress.level);
            experienceCounter.textContent =
                `${progress.experience} / ${finalExperiencePerLevel} EXP`;
            experienceTrack.setAttribute(
                'aria-valuemax',
                String(finalExperiencePerLevel)
            );
            experienceTrack.setAttribute('aria-valuenow', String(progress.experience));
            experienceFill.style.width =
                `${(progress.experience / finalExperiencePerLevel) * 100}%`;
            if (progress.level > startingLevel) {
                levelUpMessage.textContent =
                    `LEVEL UP! You reached level ${progress.level}. ` +
                    `+${progress.levelUpRewards.coins.toLocaleString()} coins, ` +
                    `+${progress.levelUpRewards.gems.toLocaleString()} gems.`;
                levelUpMessage.hidden = false;
            }
        }).finally(async () => {
            if (firstTimeRewardClaimed) {
                summaryPanel.hidden = true;
                firstTimePanel.hidden = false;
                result.setAttribute('aria-labelledby', firstTimeHeading.id);
                firstTimeContinue.focus();
                for (const reward of parsedFirstTimeRewards) {
                    const rewardItem = document.createElement('div');
                    rewardItem.className = 'battle-first-time-reward-item';
                    firstTimeRewardsTarget.append(rewardItem);
                    if (reward.type === 'card') {
                        const cardTarget = document.createElement('div');
                        cardTarget.className = 'battle-first-time-card';
                        rewardItem.append(cardTarget);
                        try {
                            await renderCharacter(reward.name, cardTarget);
                            animateBattleElement(cardTarget, 'battle-card-reveal');
                        } catch (error) {
                            console.error(
                                'Could not render a first-time reward card.',
                                error
                            );
                            firstTimeNote.textContent =
                                'The first-time card reward was saved to storage.';
                        }
                    } else {
                        const gemIcon = document.createElement('img');
                        gemIcon.className = 'battle-reward-gem-icon';
                        gemIcon.src = new URL(
                            `../../images/icons/${elementalGemIcons[reward.element]}`,
                            import.meta.url
                        ).href;
                        gemIcon.alt = '';
                        gemIcon.setAttribute('aria-hidden', 'true');
                        const gemAmount = document.createElement('strong');
                        gemAmount.textContent =
                            `+${reward.amount.toLocaleString()} ${reward.element} gems`;
                        rewardItem.append(gemIcon, gemAmount);
                    }
                }
            } else if (rewardChoiceAvailable) {
                summaryPanel.hidden = true;
                rewardChoicesPanel.hidden = false;
                result.setAttribute('aria-labelledby', rewardChoicesHeading.id);
                rewardChoiceButtons[0]?.focus();
            }
        });
    }

    function checkBattleEnd() {
        const playerOut = playerHealth <= 0 ||
            (getLivingUnits(playerSlots).length === 0 &&
                playerDeck.length === 0 && playerHand.children.length === 0);
        const opponentOut = opponentHealth <= 0 || sideIsOutOfCards(opponentSlots, opponentDeck);
        if (!playerOut && !opponentOut) {
            return false;
        }
        finishBattle(!playerOut && opponentOut
            ? 'victory'
            : playerOut && opponentOut ? 'draw' : 'defeat');
        return true;
    }

    async function resolveBattleRound() {
        turnStatus.textContent = 'Battle round!';
        for (const slot of playerSlots) {
            await performCardTurn(slot, opponentSlots, true);
            if (playerHealth <= 0 || opponentHealth <= 0) {
                break;
            }
        }
        if (playerHealth > 0 && opponentHealth > 0) {
            for (const slot of opponentSlots) {
                await performCardTurn(slot, playerSlots, false);
                if (playerHealth <= 0 || opponentHealth <= 0) {
                    break;
                }
            }
        }
        return checkBattleEnd();
    }

    async function drawPlayerCardToHand() {
        if (playerDeck.length === 0) {
            return false;
        }
        const deckIndex = Math.floor(Math.random() * playerDeck.length);
        const [ownedCard] = playerDeck.splice(deckIndex, 1);
        if (!ownedCard || typeof ownedCard.name !== 'string') {
            throw new Error('The player deck contains an invalid card.');
        }

        const handCard = document.createElement('div');
        handCard.className = 'battle-hand-card';
        handCard.dataset.handCardId = String(nextHandCardId);
        handCard.dataset.characterName = ownedCard.name;
        handCard.dataset.cardId = ownedCard.id;
        handCard.dataset.level = String(ownedCard.level);
        handCard.dataset.experience = String(ownedCard.experience);
        handCard.dataset.enhancement = String(ownedCard.enhancement);
        handCard.setAttribute('role', 'button');
        handCard.setAttribute('aria-label', `${ownedCard.name} card`);
        handCard.setAttribute('aria-pressed', 'false');
        handCard.tabIndex = 0;
        handCard.draggable = true;
        nextHandCardId += 1;

        await renderCharacter(
            ownedCard.name,
            handCard,
            {
                level: ownedCard.level,
                experience: ownedCard.experience,
                enhancement: ownedCard.enhancement,
                starRanks: ownedCard.starRanks
            }
        );
        handCard.addEventListener('click', () => selectHandCard(handCard));
        handCard.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectHandCard(handCard);
            }
        });
        handCard.addEventListener('dragstart', event => {
            selectHandCard(handCard);
            event.dataTransfer?.setData('text/plain', handCard.dataset.handCardId);
        });
        playerHand.append(handCard);
        return true;
    }

    async function beginPlayerTurn() {
        if (battleFinished || checkBattleEnd()) {
            return;
        }
        playerCardsContainer.classList.remove('player-turn');
        selectedHandCard?.setAttribute('aria-pressed', 'false');
        selectedHandCard = null;
        const availableSlots = getEmptySlot(playerSlots).length;
        if (availableSlots === 0) {
            playerHand.hidden = true;
            turnLocked = true;
            turnStatus.textContent = playerDeck.length === 0
                ? 'No cards left to deploy - your deployed cards will keep fighting.'
                : 'No open slots - your deployed cards will keep fighting.';
            window.setTimeout(() => {
                runSafely(
                    () => runOpponentTurn(true),
                    'Could not resolve the battle round.'
                );
            }, 500);
            return;
        }

        while (playerHand.children.length < 3 && playerDeck.length > 0) {
            await drawPlayerCardToHand();
        }
        if (playerHand.children.length === 0) {
            playerHand.hidden = true;
            turnLocked = true;
            turnStatus.textContent = 'No cards left to deploy - your deployed cards will keep fighting.';
            window.setTimeout(() => {
                runSafely(
                    () => runOpponentTurn(true),
                    'Could not resolve the battle round.'
                );
            }, 500);
            return;
        }

        playerHand.hidden = false;
        playerCardsContainer.classList.add('player-turn');
        turnLocked = false;
        turnStatus.textContent = 'Your turn - place a card to begin the battle round.';
    }

    async function runOpponentTurn(resolveRound) {
        if (battleFinished) {
            return;
        }
        turnLocked = true;
        opponentCardsContainer.classList.add('opponent-turn');
        const availableSlots = getEmptySlot(opponentSlots);
        const canDeploy = opponentDeck.length > 0 && availableSlots.length > 0;
        if (canDeploy) {
            const deckIndex = Math.floor(Math.random() * opponentDeck.length);
            const [opponentCard] = opponentDeck.splice(deckIndex, 1);
            if (!opponentCard ||
                typeof opponentCard.name !== 'string' ||
                !Number.isSafeInteger(opponentCard.level) ||
                opponentCard.level < 1) {
                throw new Error('The opponent deck contains an invalid card.');
            }
            const slot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
            slot.replaceChildren();
            const card = await renderCharacter(
                opponentCard.name,
                slot,
                { level: opponentCard.level }
            );
            slot.dataset.occupied = 'true';
            slot.setAttribute(
                'aria-label',
                `Level ${opponentCard.level} ${opponentCard.name} card played by opponent`
            );
            await animateCardPlacement(card);
        }
        opponentCardsContainer.classList.remove('opponent-turn');

        if (!resolveRound) {
            await beginPlayerTurn();
            return;
        }

        if (!await resolveBattleRound()) {
            await beginPlayerTurn();
        }
    }

    async function handlePlayerCardPlayed(slot, handCard) {
        if (battleFinished || turnLocked || !handCard || slot.dataset.occupied) {
            return;
        }
        turnLocked = true;
        const cardName = handCard.dataset.characterName;
        const card = handCard.firstElementChild;
        if (!cardName || !(card instanceof HTMLElement)) {
            throw new Error('The selected battle card is invalid.');
        }

        handCard.remove();
        slot.replaceChildren(card);
        const cardTitle = card.querySelector('.cardText');
        if (!(cardTitle instanceof HTMLElement)) {
            throw new Error('The selected battle card is missing its title.');
        }
        fitCardTitle(cardTitle);
        slot.dataset.occupied = 'true';
        slot.setAttribute('aria-label', `${cardName} card played`);
        await animateCardPlacement(card);
        await drawPlayerCardToHand();
        playerHand.hidden = true;
        playerCardsContainer.classList.remove('player-turn');
        selectedHandCard = null;
        await runOpponentTurn(true);
    }

    function runSafely(operation, errorMessage) {
        operation().catch(error => {
            console.error(errorMessage, error);
            turnStatus.textContent = 'The battle stopped because an error occurred.';
        });
    }

    quitButton.addEventListener('click', () => {
        if (battleFinished) {
            return;
        }
        quitDialog.showModal();
        quitCancelButton.focus();
    });
    quitCancelButton.addEventListener('click', () => {
        quitDialog.close();
        quitButton.focus();
    });
    quitConfirmButton.addEventListener('click', () => {
        if (battleFinished) {
            quitDialog.close();
            return;
        }
        quitDialog.close();
        runSafely(
            async () => finishBattle('quit'),
            'Could not award the battle forfeit rewards.'
        );
    });

    for (const slot of playerSlots) {
        slot.addEventListener('dragover', event => {
            if (!slot.dataset.occupied && !turnLocked) {
                event.preventDefault();
            }
        });
        slot.addEventListener('drop', event => {
            event.preventDefault();
            const handCardId = event.dataTransfer?.getData('text/plain');
            const handCard = [...playerHand.children].find(
                card => card.dataset.handCardId === handCardId
            );
            runSafely(
                () => handlePlayerCardPlayed(slot, handCard),
                'Could not resolve the player battle turn.'
            );
        });
        slot.addEventListener('click', () => {
            runSafely(
                () => handlePlayerCardPlayed(slot, selectedHandCard),
                'Could not resolve the player battle turn.'
            );
        });
        slot.addEventListener('keydown', event => {
            if ((event.key === 'Enter' || event.key === ' ') && selectedHandCard) {
                event.preventDefault();
                runSafely(
                    () => handlePlayerCardPlayed(slot, selectedHandCard),
                    'Could not resolve the player battle turn.'
                );
            }
        });
    }

    const firstTurnIsPlayer = Math.random() < 0.5;
    if (firstTurnIsPlayer) {
        runSafely(beginPlayerTurn, 'Could not load the player battle cards.');
    } else {
        runSafely(
            () => runOpponentTurn(false),
            'Could not load the opponent battle card.'
        );
    }
}
