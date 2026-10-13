import {
    completeCardFusion,
    getCardExperienceForLevel,
    getCoins,
    getInventoryCards,
    getPlayerName
} from './saves.js?v=20';
import renderCharacter from '../utils/renderCharacter.js?v=20';
import {
    findFusionResult,
    getCardEnhancementTotal,
    getCardMaxLevel,
    getFusionStarRanks
} from '../utils/cardProgression.js?v=7';

const firstSlot = document.querySelector('#fuse-first-card');
const secondSlot = document.querySelector('#fuse-second-card');
const resultSlot = document.querySelector('#fuse-result-card');
const availableCardsContainer = document.querySelector('#fuse-available');
const costText = document.querySelector('#fuse-cost');
const balanceText = document.querySelector('#fuse-coins');
const statusText = document.querySelector('#fuse-status');
const fuseButton = document.querySelector('#fuse-confirm');
const clearFirstButton = document.querySelector('#fuse-clear-first');
const clearSecondButton = document.querySelector('#fuse-clear-second');
const playerName = document.querySelector('#player-name');

if (!(firstSlot instanceof HTMLElement) || !(secondSlot instanceof HTMLElement) ||
    !(resultSlot instanceof HTMLElement) ||
    !(availableCardsContainer instanceof HTMLElement) ||
    !(costText instanceof HTMLElement) || !(balanceText instanceof HTMLElement) ||
    !(statusText instanceof HTMLElement) ||
    !(fuseButton instanceof HTMLButtonElement) ||
    !(clearFirstButton instanceof HTMLButtonElement) ||
    !(clearSecondButton instanceof HTMLButtonElement)) {
    throw new Error('Could not find the card fusion controls.');
}

if (playerName instanceof HTMLElement) {
    playerName.textContent = getPlayerName();
}

let inventory = [];
let firstCardId = null;
let secondCardId = null;
let fusionResult = null;
let fusionCost = 0;

function getOwnedCard(cardId) {
    return inventory.find(card => card.id === cardId) ?? null;
}

async function renderSelectedCard(slot, card) {
    slot.replaceChildren();
    if (!card) {
        return;
    }
    const preview = await renderCharacter(
        card.name,
        slot,
        {
            level: card.level,
            experience: card.experience,
            enhancement: card.enhancement,
            starRanks: card.starRanks
        }
    );
    preview.removeAttribute('role');
    preview.removeAttribute('tabindex');
    preview.removeAttribute('aria-label');
}

function getFusionCost(firstCard, secondCard) {
    return getCardExperienceForLevel(getCardMaxLevel(firstCard.name)) +
        getCardExperienceForLevel(getCardMaxLevel(secondCard.name));
}

async function updateFusionPreview() {
    const firstCard = getOwnedCard(firstCardId);
    const secondCard = getOwnedCard(secondCardId);
    await Promise.all([
        renderSelectedCard(firstSlot, firstCard),
        renderSelectedCard(secondSlot, secondCard)
    ]);
    clearFirstButton.disabled = !firstCard;
    clearSecondButton.disabled = !secondCard;
    resultSlot.replaceChildren();
    fusionResult = null;
    fusionCost = 0;
    fuseButton.disabled = true;

    if (!firstCard || !secondCard) {
        costText.textContent = '';
        return;
    }

    fusionCost = getFusionCost(firstCard, secondCard);
    costText.textContent = `Fusion cost: ${fusionCost.toLocaleString()} coins`;
    fusionResult = findFusionResult(firstCard.name, secondCard.name);
    if (!fusionResult) {
        const noResult = document.createElement('p');
        noResult.textContent = 'These cards do not have a configured fusion.';
        resultSlot.append(noResult);
        statusText.textContent = '';
        return;
    }

    const resultStarRanks = getFusionStarRanks(firstCard, secondCard);
    const resultPreview = await renderCharacter(
        fusionResult.charName,
        resultSlot,
        {
            starRanks: resultStarRanks,
            enhancement: getCardEnhancementTotal(
                fusionResult.charName,
                resultStarRanks
            )
        }
    );
    resultPreview.removeAttribute('role');
    resultPreview.removeAttribute('tabindex');
    resultPreview.removeAttribute('aria-label');
    statusText.textContent = getCoins() < fusionCost
        ? 'You do not have enough coins to fuse these cards.'
        : '';
    fuseButton.disabled = getCoins() < fusionCost;
}

async function renderAvailableCards() {
    inventory = getInventoryCards();
    availableCardsContainer.replaceChildren();
    const maxLevelCards = inventory.filter(card =>
        card.level === getCardMaxLevel(card.name) && card.experience === 0
    );

    if (maxLevelCards.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'fuse-empty-message';
        emptyMessage.textContent = 'You do not have any maximum-level cards in your deck yet.';
        availableCardsContainer.append(emptyMessage);
        return;
    }

    for (const ownedCard of maxLevelCards) {
        const card = await renderCharacter(
            ownedCard.name,
            availableCardsContainer,
            {
                level: ownedCard.level,
                experience: ownedCard.experience,
                enhancement: ownedCard.enhancement,
                starRanks: ownedCard.starRanks
            }
        );
        card.dataset.cardId = ownedCard.id;
        card.classList.add('fuse-available-card');
        card.setAttribute('role', 'button');
        card.tabIndex = 0;
        card.setAttribute(
            'aria-label',
            `Select level ${ownedCard.level} ${ownedCard.name} for fusion`
        );
        card.addEventListener('click', () => selectCard(ownedCard.id));
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectCard(ownedCard.id);
            }
        });
    }
    updateAvailableCardStates();
}

function updateCoinBalance() {
    balanceText.textContent = `Coins: ${getCoins().toLocaleString()}`;
}

function updateAvailableCardStates() {
    for (const card of availableCardsContainer.querySelectorAll('[data-card-id]')) {
        const selected = card.dataset.cardId === firstCardId ||
            card.dataset.cardId === secondCardId;
        card.classList.toggle('fuse-card-selected', selected);
        card.setAttribute('aria-pressed', String(selected));
    }
}

function selectCard(cardId) {
    statusText.textContent = '';
    if (cardId === firstCardId || cardId === secondCardId) {
        statusText.textContent = 'That card is already selected.';
        return;
    }
    if (!firstCardId) {
        firstCardId = cardId;
    } else if (!secondCardId) {
        secondCardId = cardId;
    } else {
        statusText.textContent = 'Clear a selected card before choosing another.';
        return;
    }
    updateAvailableCardStates();
    updateFusionPreview().catch(error => {
        console.error('Could not update the fusion preview.', error);
        statusText.textContent = 'Could not display this fusion.';
    });
}

clearFirstButton.addEventListener('click', () => {
    firstCardId = null;
    statusText.textContent = '';
    updateAvailableCardStates();
    updateFusionPreview().catch(error => {
        console.error('Could not update the fusion preview.', error);
        statusText.textContent = 'Could not display this fusion.';
    });
});

clearSecondButton.addEventListener('click', () => {
    secondCardId = null;
    statusText.textContent = '';
    updateAvailableCardStates();
    updateFusionPreview().catch(error => {
        console.error('Could not update the fusion preview.', error);
        statusText.textContent = 'Could not display this fusion.';
    });
});

fuseButton.addEventListener('click', async () => {
    if (!firstCardId || !secondCardId || !fusionResult || fuseButton.disabled) {
        return;
    }
    fuseButton.disabled = true;
    statusText.textContent = '';
    const fusedCardName = fusionResult.charName;
    try {
        completeCardFusion(firstCardId, secondCardId, fusedCardName, fusionCost);
        firstCardId = null;
        secondCardId = null;
        updateCoinBalance();
        await renderAvailableCards();
        await updateFusionPreview();
        statusText.textContent = `${fusedCardName} was added to your deck.`;
    } catch (error) {
        console.error('Could not complete the card fusion.', error);
        statusText.textContent = error instanceof Error
            ? error.message
            : 'Could not complete the fusion.';
        fuseButton.disabled = false;
    }
});

renderAvailableCards().catch(error => {
    console.error('Could not load maximum-level cards for fusion.', error);
    statusText.textContent = 'Could not load cards for fusion.';
});
updateCoinBalance();
