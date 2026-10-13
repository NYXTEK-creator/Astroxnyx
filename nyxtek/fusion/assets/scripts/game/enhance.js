import {
    completeCardEnhancement,
    getElementalStones,
    getInventoryCards,
    getStorageCards
} from './saves.js?v=20';
import renderCharacter from '../utils/renderCharacter.js?v=20';
import { initializeCardDetails } from '../utils/cardDetails.js?v=2';

initializeCardDetails();

const rankValues = ['bronze', 'silver', 'gold'];
const healingSpecialTypes = new Set([
    'self-heal', 'rand-heal', 'aoe-heal'
]);
const damageReductionSpecialTypes = new Set(['reduce-rand', 'aoe-purify']);
const stoneDisplays = Object.fromEntries(
    ['fire', 'water', 'nature', 'electric', 'dark', 'light'].map(type => [
        type,
        document.querySelector(`#enhance-${type}-stones`)
    ])
);
const cardSelection = document.querySelector('#enhanceCards');
const deck = document.querySelector('#enhance-deck');
const storage = document.querySelector('#enhance-storage');
const preview = document.querySelector('#enhance-preview');
const starChoices = document.querySelector('#enhance-star-choices');
const errorMessage = document.querySelector('#enhance-error');
const confirmButton = document.querySelector('#enhance-confirm');
const changesPanel = document.querySelector('#enhanceChanges');

if (!(cardSelection instanceof HTMLElement) ||
    !(deck instanceof HTMLElement) ||
    !(storage instanceof HTMLElement) ||
    !(preview instanceof HTMLElement) ||
    !(starChoices instanceof HTMLElement) ||
    !(errorMessage instanceof HTMLElement) ||
    !(confirmButton instanceof HTMLButtonElement) ||
    !(changesPanel instanceof HTMLElement) ||
    Object.values(stoneDisplays).some(display => !(display instanceof HTMLElement))) {
    throw new Error('Could not find the card enhancement interface.');
}

function updateStoneBalances() {
    const balances = getElementalStones();
    for (const [type, display] of Object.entries(stoneDisplays)) {
        if (!(display instanceof HTMLElement)) {
            throw new Error(`Could not find the ${type} stone balance display.`);
        }
        display.textContent = balances[type].toLocaleString();
    }
}

async function renderCards(cards, container, collection) {
    if (cards.length === 0) {
        const message = document.createElement('p');
        message.className = 'enhance-empty';
        message.textContent = 'No cards here yet.';
        container.append(message);
        return;
    }
    for (const ownedCard of cards) {
        const card = await renderCharacter(
            ownedCard.name,
            container,
            {
                level: ownedCard.level,
                experience: ownedCard.experience,
                enhancement: ownedCard.enhancement,
                starRanks: ownedCard.starRanks
            }
        );
        card.dataset.cardId = ownedCard.id;
        card.dataset.collection = collection;
    }
}

const collectionCards = [
    renderCards(getInventoryCards(), deck, 'inventory'),
    renderCards(getStorageCards(), storage, 'storage')
];
await Promise.all(collectionCards);
updateStoneBalances();
window.addEventListener('storage', event => {
    if (event.key === 'fusion-currencies') {
        updateStoneBalances();
        updateEnhancementPreview();
    }
});

let selectedCard = null;
let selectedStarIndex = 0;
let draggedCard = null;
let dragPreview = null;
let activeDropZone = null;
let activePointerId = null;
let pointerOffsetX = 0;
let pointerOffsetY = 0;

function getSourceZone(card) {
    return card.dataset.collection === 'inventory' ? deck : storage;
}

function createSummaryLine(text, className = '') {
    const line = document.createElement('p');
    line.textContent = text;
    if (className) {
        line.className = className;
    }
    return line;
}

function updateEnhancementPreview() {
    errorMessage.textContent = '';
    preview.replaceChildren();
    starChoices.replaceChildren();
    const card = cardSelection.querySelector('[data-card-id]');
    if (!(card instanceof HTMLElement)) {
        selectedCard = null;
        confirmButton.disabled = true;
        return null;
    }
    if (selectedCard !== card) {
        const initialRanks = JSON.parse(card.dataset.starRanks ?? '[]');
        selectedStarIndex = Math.max(
            0,
            initialRanks.findIndex(rank => rank !== 'gold')
        );
    }
    selectedCard = card;

    const starRanks = JSON.parse(card.dataset.starRanks ?? '[]');
    const enhancement = Number(card.dataset.enhancement ?? 0);
    if (starRanks.length !== Number(card.dataset.rating) ||
        !starRanks.every(rank => rankValues.includes(rank)) ||
        !Number.isSafeInteger(enhancement) || enhancement < 0) {
        throw new Error('The selected card has invalid enhancement data.');
    }
    if (selectedStarIndex >= starRanks.length) {
        selectedStarIndex = 0;
    }
    for (const [index, rank] of starRanks.entries()) {
        const choice = document.createElement('button');
        choice.type = 'button';
        choice.className = 'enhance-star-choice';
        choice.textContent = `Star ${index + 1}: ${formatRank(rank)}`;
        choice.setAttribute('aria-pressed', String(index === selectedStarIndex));
        choice.disabled = rank === 'gold';
        choice.addEventListener('click', () => {
            selectedStarIndex = index;
            updateEnhancementPreview();
        });
        starChoices.append(choice);
    }
    const currentRankIndex = rankValues.indexOf(starRanks[selectedStarIndex]);
    const element = card.dataset.mainType;
    const balances = getElementalStones();
    const isMaxRank = starRanks.every(rank => rank === 'gold');
    if (currentRankIndex >= rankValues.length - 1 && !isMaxRank) {
        selectedStarIndex = starRanks.findIndex(rank => rank !== 'gold');
        return updateEnhancementPreview();
    }
    const stoneCost = currentRankIndex === 0 ? 4 : 6;
    const availableStones = element ? balances[element] : undefined;
    const canAfford = typeof availableStones === 'number' &&
        availableStones >= stoneCost;

    if (isMaxRank) {
        preview.append(
            createSummaryLine('All stars are already Gold rank.')
        );
        confirmButton.textContent = 'Max Rank';
        confirmButton.disabled = true;
        return null;
    }

    const nextRank = rankValues[currentRankIndex + 1];
    const nextStarRanks = [...starRanks];
    nextStarRanks[selectedStarIndex] = nextRank;
    const levelMultiplier = 1 + (Number(card.dataset.level) - 1) * 0.05;
    const currentMultiplier = levelMultiplier * (1 + enhancement * 0.125);
    const nextMultiplier = levelMultiplier * (1 + (enhancement + 1) * 0.125);
    const currentDamage = Math.round(Number(card.dataset.baseDamage) * currentMultiplier);
    const nextDamage = Math.round(Number(card.dataset.baseDamage) * nextMultiplier);
    const currentHealth = Math.round(Number(card.dataset.baseHealth) * currentMultiplier);
    const nextHealth = Math.round(Number(card.dataset.baseHealth) * nextMultiplier);
    preview.append(
        createSummaryLine(
            `Star ${selectedStarIndex + 1}: ${formatRank(starRanks[selectedStarIndex])} → ${formatRank(nextRank)}`,
            'enhance-rank-change'
        ),
        createSummaryLine(`Damage: ${currentDamage} → ${nextDamage}`),
        createSummaryLine(`Health: ${currentHealth} → ${nextHealth}`),
        createSummaryLine(`${stoneCost} ${element ?? 'element'} stones required`, 'enhance-cost')
    );

    confirmButton.textContent = `Enhance to ${nextRank[0].toUpperCase()}${nextRank.slice(1)}`;
    confirmButton.disabled = !canAfford;
    if (typeof availableStones !== 'number') {
        errorMessage.textContent = 'This card has an unknown elemental type.';
    } else if (!canAfford) {
        errorMessage.textContent =
            `You need ${stoneCost} ${element} stones; you have ${availableStones}.`;
    }

    const specialEffectLabel = healingSpecialTypes.has(card.dataset.specialType ?? '')
        ? 'Special healing'
        : damageReductionSpecialTypes.has(card.dataset.specialType ?? '')
            ? 'Damage reduction'
            : 'Special damage';
    const currentSpecial = Math.round(
        Number(card.dataset.baseSpecialDamage) * currentMultiplier
    );
    const nextSpecial = Math.round(
        Number(card.dataset.baseSpecialDamage) * nextMultiplier
    );
    preview.append(createSummaryLine(
        `${specialEffectLabel}: ${Math.abs(currentSpecial)} → ${Math.abs(nextSpecial)}`
    ));

    return {
        card,
        starIndex: selectedStarIndex,
        currentRankIndex,
        nextRank,
        nextEnhancement: enhancement + 1,
        nextStarRanks,
        nextDamage,
        nextHealth,
        nextSpecial,
        stoneCost,
        element
    };
}

confirmButton.addEventListener('click', async () => {
    const enhancement = updateEnhancementPreview();
    if (!enhancement || confirmButton.disabled) {
        return;
    }
    confirmButton.disabled = true;
    try {
        await completeCardEnhancement(
            enhancement.card.dataset.cardId ?? '',
            enhancement.starIndex
        );
        try {
            await playEnhancementAnimation(enhancement);
        } catch (error) {
            console.error('Enhancement was saved, but its animation could not play.', error);
        }
        window.location.reload();
    } catch (error) {
        errorMessage.textContent = error instanceof Error
            ? error.message
            : 'Could not enhance this card.';
        confirmButton.disabled = false;
    }
});

function finishCardDrag(dropZone) {
    if (draggedCard) {
        if (dropZone === cardSelection) {
            if (selectedCard && selectedCard !== draggedCard) {
                getSourceZone(selectedCard).append(selectedCard);
            }
            cardSelection.append(draggedCard);
        } else {
            getSourceZone(draggedCard).append(draggedCard);
        }
    }
    draggedCard?.classList.remove('is-dragging');
    dragPreview?.remove();
    draggedCard = null;
    dragPreview = null;
    activeDropZone?.classList.remove('drag-over');
    activeDropZone = null;
    activePointerId = null;
    updateEnhancementPreview();
}

document.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !(event.target instanceof Element)) {
        return;
    }
    const card = event.target.closest('[data-character-name]');
    if (!(card instanceof HTMLElement) ||
        !card.closest('#enhance-deck, #enhance-storage, #enhanceCards')) {
        return;
    }

    event.preventDefault();
    draggedCard = card;
    const dragClone = card.cloneNode(true);
    if (dragClone instanceof HTMLElement) {
        dragClone.removeAttribute('draggable');
        dragClone.classList.remove('is-dragging');
        dragClone.style.position = 'fixed';
        dragClone.style.left = `${event.clientX}px`;
        dragClone.style.top = `${event.clientY}px`;
        dragClone.style.width = `${card.offsetWidth}px`;
        dragClone.style.height = `${card.offsetHeight}px`;
        dragClone.style.opacity = '1';
        dragClone.style.pointerEvents = 'none';
        dragClone.style.zIndex = '10000';
        dragClone.style.transform = 'translate(-50%, -50%) scale(1.04)';
        dragClone.style.filter = 'drop-shadow(0 0 14px #8df1ee)';
        document.body.append(dragClone);
        dragPreview = dragClone;
        const bounds = card.getBoundingClientRect();
        pointerOffsetX = event.clientX - bounds.left;
        pointerOffsetY = event.clientY - bounds.top;
    }
    card.classList.add('is-dragging');
    activePointerId = event.pointerId;
});

document.addEventListener('pointermove', event => {
    if (activePointerId !== event.pointerId || !dragPreview) {
        return;
    }
    event.preventDefault();
    dragPreview.style.left =
        `${event.clientX - pointerOffsetX + dragPreview.offsetWidth / 2}px`;
    dragPreview.style.top =
        `${event.clientY - pointerOffsetY + dragPreview.offsetHeight / 2}px`;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const dropZone = target instanceof Element
        ? target.closest('[data-drop-zone]')
        : null;
    if (dropZone !== activeDropZone) {
        activeDropZone?.classList.remove('drag-over');
        activeDropZone = dropZone instanceof HTMLElement ? dropZone : null;
        activeDropZone?.classList.add('drag-over');
    }
});

document.addEventListener('pointerup', event => {
    if (activePointerId !== event.pointerId) {
        return;
    }
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const dropZone = target instanceof Element
        ? target.closest('[data-drop-zone]')
        : null;
    finishCardDrag(dropZone instanceof HTMLElement ? dropZone : null);
});

document.addEventListener('pointercancel', event => {
    if (activePointerId === event.pointerId) {
        finishCardDrag(null);
    }
});

function formatRank(rank) {
    return `${rank[0].toUpperCase()}${rank.slice(1)}`;
}

async function playEnhancementAnimation(enhancement) {
    const dialog = document.createElement('dialog');
    dialog.className = 'card-level-up-dialog';
    dialog.setAttribute('aria-labelledby', 'enhance-animation-title');
    const content = document.createElement('div');
    content.className = 'card-level-up-content';
    const heading = document.createElement('h2');
    heading.id = 'enhance-animation-title';
    heading.textContent = 'Card Enhanced!';

    const card = enhancement.card.cloneNode(true);
    if (!(card instanceof HTMLElement)) {
        throw new Error('Could not create the enhanced card preview.');
    }
    card.classList.remove('is-dragging');
    card.classList.add('level-up-card');
    card.removeAttribute('data-card-id');
    card.dataset.enhancement = String(enhancement.nextEnhancement);
    card.dataset.starRanks = JSON.stringify(enhancement.nextStarRanks);
    card.dataset.rank = enhancement.nextStarRanks[0];
    card.dataset.attackDamage = String(enhancement.nextDamage);
    card.dataset.currentHealth = String(enhancement.nextHealth);
    card.dataset.maxHealth = String(enhancement.nextHealth);
    card.dataset.specialDamage = String(enhancement.nextSpecial);
    const damageStat = card.querySelector('.damageStat');
    const damageValue = damageStat?.querySelector('span');
    const healthStat = card.querySelector('.healthStat');
    const healthValue = healthStat?.querySelector('span');
    if (!(damageStat instanceof HTMLElement) ||
        !(damageValue instanceof HTMLElement) ||
        !(healthStat instanceof HTMLElement) ||
        !(healthValue instanceof HTMLElement)) {
        throw new Error('The enhanced card preview is missing its combat stats.');
    }
    damageValue.textContent = String(enhancement.nextDamage);
    healthValue.textContent = String(enhancement.nextHealth);
    damageStat.setAttribute(
        'aria-label',
        `damage: ${enhancement.nextDamage}`
    );
    healthStat.setAttribute(
        'aria-label',
        `health: ${enhancement.nextHealth}`
    );
    const rankStars = card.querySelector('.rankStars');
    if (!(rankStars instanceof HTMLElement)) {
        throw new Error('The enhanced card preview is missing its rank display.');
    }
    rankStars.setAttribute('aria-label', enhancement.nextStarRanks
        .map(rank => `${rank} rank`)
        .join(', '));
    for (const [index, rankImage] of [...rankStars.querySelectorAll('img')].entries()) {
        rankImage.src = new URL(
            `../../images/ranks/${enhancement.nextStarRanks[index]}.png`,
            import.meta.url
        ).href;
    }

    const summary = document.createElement('p');
    summary.textContent =
        `Star ${enhancement.starIndex + 1}: ` +
        `${formatRank(rankValues[enhancement.currentRankIndex])} → ${formatRank(enhancement.nextRank)}`;
    const continueButton = document.createElement('button');
    continueButton.className = 'button training-confirm';
    continueButton.type = 'button';
    continueButton.textContent = 'Continue';
    content.append(heading, card, summary, continueButton);
    dialog.append(content);
    document.body.append(dialog);
    dialog.addEventListener('cancel', event => event.preventDefault());
    dialog.showModal();
    continueButton.focus();
    await new Promise(resolve => {
        continueButton.addEventListener('click', resolve, { once: true });
    });
    dialog.close();
    dialog.remove();
}
