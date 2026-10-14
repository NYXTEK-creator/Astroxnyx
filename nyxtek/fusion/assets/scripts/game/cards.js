import {
    completeCardTraining,
    getCardExperienceForLevel,
    getDiscoveredCards,
    getInventoryCards,
    getInventoryCapacity,
    getCoins,
    getPlayerLevel,
    getPlayerName,
    getStorageCards,
    moveCardToCollection
} from './saves.js?v=21';
import renderCharacter from '../utils/renderCharacter.js?v=21';
import { getCardMaxLevel } from '../utils/cardProgression.js?v=10';
import { initializeCardDetails } from '../utils/cardDetails.js?v=3';

initializeCardDetails();

const trainCoinAmount = document.querySelector('#train-coin-amount');
if (trainCoinAmount instanceof HTMLElement) {
    const updateTrainCoins = () => {
        trainCoinAmount.textContent = getCoins().toLocaleString();
    };

    updateTrainCoins();
    window.addEventListener('storage', event => {
        if (event.key === 'fusion-currencies') {
            updateTrainCoins();
        }
    });
}

export default async function loadInventory() {
    const container = document.querySelector('#card-container');

    if (!(container instanceof Element)) {
        throw new Error('Could not find the "#card-container" element.');
    }

    const playerName = document.querySelector('#player-name');
    if (playerName) {
        playerName.textContent = getPlayerName();
    }

    const inventory = getInventoryCards();
    const playerLevel = getPlayerLevel();
    const capacity = getInventoryCapacity(playerLevel);
    if (inventory.length > capacity) {
        throw new Error('Saved inventory exceeds the capacity unlocked for this player level.');
    }

    container.replaceChildren();
    for (const ownedCard of inventory) {
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
    }

    for (let slotIndex = inventory.length; slotIndex < capacity; slotIndex += 1) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'emptyCard inventory-slot inventory-empty';
        emptyCard.setAttribute('aria-label', 'Empty inventory slot');

        const icon = document.createElement('img');
        icon.src = new URL('../../images/icons/plus.png', import.meta.url).href;
        icon.alt = '';
        icon.setAttribute('aria-hidden', 'true');

        emptyCard.append(icon);
        container.append(emptyCard);
    }

    for (let slotIndex = capacity; slotIndex < 15; slotIndex += 1) {
        const unlockLevel = (slotIndex - 3) * 5;
        const lockedCard = document.createElement('div');
        lockedCard.className = 'emptyCard inventory-slot inventory-locked';
        lockedCard.setAttribute('aria-label', `Inventory slot unlocks at level ${unlockLevel}`);

        const icon = document.createElement('img');
        icon.src = new URL('../../images/icons/locked.png', import.meta.url).href;
        icon.alt = '';
        icon.setAttribute('aria-hidden', 'true');

        const unlockText = document.createElement('span');
        unlockText.textContent = `Unlocks at level ${unlockLevel}`;

        lockedCard.append(icon, unlockText);
        container.append(lockedCard);
    }
}

if (document.querySelector('#card-container')) {
    loadInventory().catch(error => {
        console.error('Could not load the player deck.', error);
    });
}

async function loadCardBook() {
    const container = document.querySelector('#book-container');
    if (!(container instanceof HTMLElement)) {
        throw new Error('Could not find the card book display.');
    }

    const discoveredCards = new Set(getDiscoveredCards());
    const characterNames = [
        'aqua', 'astri', 'demoni', 'dewey', 'eli', 'fita', 'flambae',
        'flora', 'flori', 'hemo', 'kera', 'lavae', 'lumi', 'magmo',
        'mari', 'necro', 'nora', 'solare', 'volti'
    ];
    container.replaceChildren();
    for (const name of characterNames) {
        if (discoveredCards.has(name)) {
            await renderCharacter(name, container);
            continue;
        }

        const emptyCard = document.createElement('div');
        emptyCard.className = 'book-undiscovered-card';
        emptyCard.setAttribute('aria-label', 'Undiscovered card');
        emptyCard.setAttribute('role', 'img');
        container.append(emptyCard);
    }
}

if (document.querySelector('#book-container')) {
    loadCardBook().catch(error => {
        console.error('Could not load the card book.', error);
    });
}

async function loadDeckEditor() {
    const editButton = document.querySelector('#edit-deck');
    const deckEditor = document.querySelector('#deck-editor');
    const cardContainer = document.querySelector('#card-container');
    const deckCards = document.querySelector('#deck-edit-cards');
    const storageCards = document.querySelector('#storage-edit-cards');
    const deckCount = document.querySelector('#deck-edit-count');
    const storageCount = document.querySelector('#storage-edit-count');
    if (!(editButton instanceof HTMLButtonElement) ||
        !(deckEditor instanceof HTMLElement) ||
        !(cardContainer instanceof HTMLElement) ||
        !(deckCards instanceof HTMLElement) ||
        !(storageCards instanceof HTMLElement) ||
        !(deckCount instanceof HTMLElement) ||
        !(storageCount instanceof HTMLElement)) {
        throw new Error('Could not find all deck editing elements.');
    }

    const capacity = getInventoryCapacity(getPlayerLevel());
    const editorError = document.createElement('p');
    editorError.className = 'deck-editor-error';
    editorError.setAttribute('role', 'alert');
    deckEditor.prepend(editorError);

    async function renderEditorCollection(cards, container, destination) {
        container.replaceChildren();
        if (cards.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'deck-editor-empty';
            emptyMessage.textContent = 'No cards here yet.';
            container.append(emptyMessage);
            return;
        }

        for (const ownedCard of cards) {
            const cardEntry = document.createElement('article');
            cardEntry.className = 'deck-edit-card';
            cardEntry.dataset.cardId = ownedCard.id;
            cardEntry.dataset.collection = destination;
            cardEntry.draggable = true;
            await renderCharacter(
                ownedCard.name,
                cardEntry,
                {
                    level: ownedCard.level,
                    experience: ownedCard.experience,
                    enhancement: ownedCard.enhancement,
                    starRanks: ownedCard.starRanks
                }
            );
            container.append(cardEntry);
        }
    }

    async function renderDeckEditorCollections() {
        const inventory = getInventoryCards();
        const storage = getStorageCards();
        deckCount.textContent = `${inventory.length} / ${capacity}`;
        storageCount.textContent = String(storage.length);
        await Promise.all([
            renderEditorCollection(inventory, deckCards, 'inventory'),
            renderEditorCollection(storage, storageCards, 'storage')
        ]);
    }

    document.addEventListener('dragstart', event => {
        if (!(event.target instanceof Element)) {
            return;
        }
        const cardEntry = event.target.closest('.deck-edit-card');
        if (!(cardEntry instanceof HTMLElement) ||
            !deckEditor.contains(cardEntry)) {
            return;
        }
        event.dataTransfer?.setData('text/plain', cardEntry.dataset.cardId ?? '');
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
        }
        cardEntry.classList.add('is-dragging');
    });

    document.addEventListener('dragend', event => {
        if (event.target instanceof Element) {
            event.target.closest('.deck-edit-card')?.classList.remove('is-dragging');
        }
        deckCards.classList.remove('drag-over');
        storageCards.classList.remove('drag-over');
    });

    deckEditor.addEventListener('dragover', event => {
        if (!(event.target instanceof Element)) {
            return;
        }
        const cardList = event.target.closest('.deck-edit-card-list');
        if (cardList instanceof HTMLElement) {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'move';
            }
            cardList.classList.add('drag-over');
        }
    });

    deckEditor.addEventListener('dragleave', event => {
        if (!(event.target instanceof Element)) {
            return;
        }
        const cardList = event.target.closest('.deck-edit-card-list');
        if (cardList instanceof HTMLElement &&
            !cardList.contains(event.relatedTarget)) {
            cardList.classList.remove('drag-over');
        }
    });

    deckEditor.addEventListener('drop', event => {
        if (!(event.target instanceof Element)) {
            return;
        }
        const cardList = event.target.closest('.deck-edit-card-list');
        const destination = cardList?.id === 'deck-edit-cards'
            ? 'inventory'
            : cardList?.id === 'storage-edit-cards'
                ? 'storage'
                : null;
        const cardId = event.dataTransfer?.getData('text/plain');
        if (!(cardList instanceof HTMLElement) || !destination || !cardId) {
            return;
        }
        event.preventDefault();
        cardList.classList.remove('drag-over');
        editorError.textContent = '';
        try {
            moveCardToCollection(cardId, destination, capacity);
            renderDeckEditorCollections()
                .then(() => loadInventory())
                .catch(error => {
                    editorError.textContent = error instanceof Error
                        ? error.message
                        : 'Could not refresh the deck.';
                });
        } catch (error) {
            editorError.textContent = error instanceof Error
                ? error.message
                : 'Could not update the deck.';
        }
    });

    editButton.addEventListener('click', async () => {
        const editing = editButton.getAttribute('aria-expanded') !== 'true';
        editorError.textContent = '';
        if (editing) {
            try {
                await renderDeckEditorCollections();
            } catch (error) {
                editorError.textContent = error instanceof Error
                    ? error.message
                    : 'Could not load the deck editor.';
                return;
            }
        }
        editButton.setAttribute('aria-expanded', String(editing));
        editButton.textContent = editing ? 'Done Editing' : 'Edit Deck';
        cardContainer.hidden = editing;
        deckEditor.hidden = !editing;
    });
}

if (document.querySelector('#edit-deck')) {
    loadDeckEditor().catch(error => {
        console.error('Could not initialize deck editing.', error);
    });
}

async function loadStorage() {
    const container = document.querySelector('#storage');
    const deckContainer = document.querySelector('#training-deck');

    if (!(container instanceof HTMLElement) ||
        !(deckContainer instanceof HTMLElement)) {
        throw new Error('Could not find the training card collection displays.');
    }

    for (const [ownedCards, target, collection] of [
        [getInventoryCards(), deckContainer, 'inventory'],
        [getStorageCards(), container, 'storage']
    ]) {
        for (const ownedCard of ownedCards) {
            const card = await renderCharacter(
                ownedCard.name,
                target,
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

    setupTrainingCardDragAndDrop();
}

function setupTrainingCardDragAndDrop() {
    const trainCards = document.querySelector('#trainCards');
    const sacrificeCards = document.querySelector('#sacrificeCards');
    const storage = document.querySelector('#storage');
    const deck = document.querySelector('#training-deck');
    const changes = document.querySelector('#changes');
    if (!(trainCards instanceof HTMLElement) ||
        !(sacrificeCards instanceof HTMLElement) ||
        !(storage instanceof HTMLElement) ||
        !(deck instanceof HTMLElement) ||
        !(changes instanceof HTMLElement)) {
        return;
    }

    const preview = document.createElement('div');
    preview.className = 'training-preview';
    const errorMessage = document.createElement('p');
    errorMessage.className = 'training-error';
    errorMessage.setAttribute('role', 'alert');
    const confirmButton = document.createElement('button');
    confirmButton.className = 'button training-confirm';
    confirmButton.type = 'button';
    confirmButton.textContent = 'Confirm Training';
    changes.replaceChildren(preview, errorMessage, confirmButton);

    function updateTrainingPreview() {
        errorMessage.textContent = '';
        const targetCards = [...trainCards.querySelectorAll('[data-card-id]')];
        const sacrificeCardElements =
            [...sacrificeCards.querySelectorAll('[data-card-id]')];
        if (targetCards.length !== 1 || sacrificeCardElements.length === 0) {
            preview.replaceChildren();
            confirmButton.disabled = true;
            return null;
        }

        const target = targetCards[0];
        const targetLevel = Number(target.dataset.level);
        const targetExperience = Number(target.dataset.experience);
        const maximumLevel = getCardMaxLevel(target.dataset.characterName ?? '');
        if (targetLevel >= maximumLevel) {
            preview.replaceChildren(
                createTrainingSummary(`This card has reached its maximum level (${maximumLevel}).`)
            );
            confirmButton.disabled = true;
            return null;
        }
        const enhancementMultiplier =
            1 + Number(target.dataset.enhancement ?? 0) * 0.125;
        const trainingTotals = sacrificeCardElements.reduce((totals, card) => {
            const level = Number(card.dataset.level);
            const maxExperience = getCardExperienceForLevel(level);
            totals.experience += Math.ceil(maxExperience * 1.5);
            totals.coins += Math.ceil(maxExperience * 1.0625);
            return totals;
        }, { experience: 0, coins: 0 });
        if (!Number.isSafeInteger(trainingTotals.experience) ||
            !Number.isSafeInteger(trainingTotals.coins)) {
            throw new RangeError('Sacrificed card experience exceeds the supported range.');
        }
        let newLevel = targetLevel;
        let newExperience = targetExperience + trainingTotals.experience;
        while (newLevel < maximumLevel &&
            newExperience >= getCardExperienceForLevel(newLevel)) {
            const requirement = getCardExperienceForLevel(newLevel);
            newExperience -= requirement;
            newLevel += 1;
            if (!Number.isSafeInteger(newLevel)) {
                throw new RangeError('Trained card level exceeds the supported range.');
            }
        }
        let experienceCapacity = 0;
        for (let level = targetLevel; level < maximumLevel; level += 1) {
            experienceCapacity += getCardExperienceForLevel(level);
        }
        const effectiveExperienceGained = Math.min(
            trainingTotals.experience,
            experienceCapacity - targetExperience
        );
        if (newLevel === maximumLevel) {
            newExperience = 0;
        }

        const coinCost = trainingTotals.coins;
        const damageBefore = Math.round(
            Number(target.dataset.baseDamage) *
                (1 + (targetLevel - 1) * 0.05) * enhancementMultiplier
        );
        const healthBefore = Math.round(
            Number(target.dataset.baseHealth) *
                (1 + (targetLevel - 1) * 0.05) * enhancementMultiplier
        );
        const damageAfter = Math.round(
            Number(target.dataset.baseDamage) *
                (1 + (newLevel - 1) * 0.05) * enhancementMultiplier
        );
        const healthAfter = Math.round(
            Number(target.dataset.baseHealth) *
                (1 + (newLevel - 1) * 0.05) * enhancementMultiplier
        );
        const availableCoins = getCoins();
        const specialEffect = target.dataset.specialType;
        const specialEffectLabel = ['self-heal', 'rand-heal', 'aoe-heal']
            .includes(specialEffect)
            ? 'Special healing'
            : ['reduce-rand', 'aoe-purify'].includes(specialEffect ?? '')
                ? 'Damage reduction'
                : 'Special damage';
        const specialValue = Number(target.dataset.specialDamage);
        const specialBefore = ['self-heal', 'rand-heal', 'aoe-heal',
            'aoe-purify', 'reduce-rand'].includes(specialEffect ?? '')
            ? Math.abs(specialValue)
            : specialValue;
        const specialAfter = ['self-heal', 'rand-heal', 'aoe-heal',
            'aoe-purify', 'reduce-rand'].includes(specialEffect ?? '')
            ? Math.abs(Math.round(
                Number(target.dataset.baseSpecialDamage) *
                    (1 + (newLevel - 1) * 0.05) * enhancementMultiplier
            ))
            : Math.round(
                Number(target.dataset.baseSpecialDamage) *
                    (1 + (newLevel - 1) * 0.05) * enhancementMultiplier
            );
        preview.replaceChildren(
            createTrainingSummary(
                `EXP gained: ${effectiveExperienceGained}`,
                `Level: ${targetLevel} → ${newLevel}`,
                newLevel === maximumLevel
                    ? `Level cap: ${maximumLevel}`
                    : `EXP progress: ${newExperience} / ${getCardExperienceForLevel(newLevel)}`,
                `Damage: ${damageBefore} → ${damageAfter} (${formatStatChange(damageAfter - damageBefore)})`,
                `Health: ${healthBefore} → ${healthAfter} (${formatStatChange(healthAfter - healthBefore)})`,
                `${specialEffectLabel}: ${specialBefore} → ${specialAfter}`,
                `Training cost: ${coinCost.toLocaleString()} coins`
            )
        );
        confirmButton.disabled = availableCoins < coinCost;
        if (confirmButton.disabled) {
            errorMessage.textContent = 'Not enough coins to train this card.';
        }
        return {
            target,
            sacrificeCards: sacrificeCardElements,
            startingLevel: targetLevel,
            startingExperience: targetExperience,
            experienceGained: effectiveExperienceGained,
            newLevel,
            newExperience,
            coinCost
        };
    }

    confirmButton.addEventListener('click', async () => {
        const training = updateTrainingPreview();
        if (!training || confirmButton.disabled) {
            return;
        }
        confirmButton.disabled = true;
        try {
            completeCardTraining(
                training.target.dataset.cardId,
                training.sacrificeCards.map(card => card.dataset.cardId),
                training.newLevel,
                training.newExperience,
                training.coinCost
            );
        } catch (error) {
            errorMessage.textContent = error instanceof Error
                ? error.message
                : 'Could not complete training.';
            confirmButton.disabled = false;
            return;
        }

        try {
            await playTrainingAnimation(training);
        } catch (error) {
            console.error('Training was saved, but its animation could not play.', error);
        }
        window.location.reload();
    });

    let draggedCard = null;
    let dragPreview = null;
    let activeDropZone = null;
    let activePointerId = null;
    let pointerOffsetX = 0;
    let pointerOffsetY = 0;

    function getCardSourceZone(card) {
        return card.dataset.collection === 'inventory' ? deck : storage;
    }

    function finishCardDrag(dropZone) {
        if (draggedCard && dropZone instanceof HTMLElement) {
            if (dropZone === trainCards) {
                for (const existingCard of trainCards.querySelectorAll('[data-card-id]')) {
                    if (existingCard !== draggedCard) {
                        getCardSourceZone(existingCard).append(existingCard);
                    }
                }
            }
            dropZone.append(draggedCard);
        }
        draggedCard?.classList.remove('is-dragging');
        dragPreview?.remove();
        draggedCard = null;
        dragPreview = null;
        activeDropZone?.classList.remove('drag-over');
        activeDropZone = null;
        activePointerId = null;
        updateTrainingPreview();
    }

    document.addEventListener('pointerdown', event => {
        if (event.button !== 0 || !(event.target instanceof Element)) {
            return;
        }
        const card = event.target.closest('[data-character-name]');
        if (!(card instanceof HTMLElement) ||
            !card.closest('#training-deck, #storage, #trainCards, #sacrificeCards')) {
            return;
        }

        event.preventDefault();
        draggedCard = card;
        const preview = card.cloneNode(true);
        if (preview instanceof HTMLElement) {
            preview.removeAttribute('draggable');
            preview.classList.remove('is-dragging');
            preview.style.position = 'fixed';
            preview.style.left = `${event.clientX}px`;
            preview.style.top = `${event.clientY}px`;
            preview.style.width = `${card.offsetWidth}px`;
            preview.style.height = `${card.offsetHeight}px`;
            preview.style.opacity = '1';
            preview.style.pointerEvents = 'none';
            preview.style.zIndex = '10000';
            preview.style.transform = 'translate(-50%, -50%) scale(1.04)';
            preview.style.filter = 'drop-shadow(0 0 14px #8df1ee)';
            document.body.append(preview);
            dragPreview = preview;
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

    updateTrainingPreview();
}

function createTrainingSummary(...messages) {
    const summary = document.createElement('div');
    for (const message of messages) {
        const line = document.createElement('p');
        line.textContent = message;
        summary.append(line);
    }
    return summary;
}

function formatStatChange(change) {
    return change > 0 ? `+${change}` : String(change);
}

async function playTrainingAnimation(training) {
    const dialog = document.createElement('dialog');
    dialog.className = 'card-level-up-dialog';
    dialog.setAttribute('aria-labelledby', 'card-level-up-title');
    const content = document.createElement('div');
    content.className = 'card-level-up-content';
    const heading = document.createElement('h2');
    heading.id = 'card-level-up-title';
    heading.textContent = training.newLevel > training.startingLevel
        ? 'Card Level Up!'
        : 'Card Trained!';

    const card = training.target.cloneNode(true);
    if (!(card instanceof HTMLElement)) {
        throw new Error('Could not create the trained card preview.');
    }
    card.classList.remove('is-dragging');
    card.classList.add('level-up-card');
    card.removeAttribute('data-card-id');
    card.querySelector('.storage-card-status')?.remove();

    const experienceLabel = document.createElement('p');
    experienceLabel.className = 'level-up-experience-label';
    const progressTrack = document.createElement('div');
    progressTrack.className = 'level-up-progress-track';
    progressTrack.setAttribute('role', 'progressbar');
    progressTrack.setAttribute('aria-label', 'Card experience progress');
    const progressFill = document.createElement('span');
    progressFill.className = 'level-up-progress-fill';
    progressTrack.append(progressFill);

    const statSummary = document.createElement('div');
    statSummary.className = 'level-up-stat-summary';
    const damageLine = document.createElement('p');
    const healthLine = document.createElement('p');
    statSummary.append(damageLine, healthLine);
    const continueButton = document.createElement('button');
    continueButton.className = 'button training-confirm';
    continueButton.type = 'button';
    continueButton.textContent = 'Continue';
    continueButton.hidden = true;

    content.append(heading, card, experienceLabel, progressTrack, statSummary, continueButton);
    dialog.append(content);
    document.body.append(dialog);
    dialog.addEventListener('cancel', event => event.preventDefault());
    dialog.showModal();

    const levelBadge = card.querySelector('.cardLevel');
    const damageValue = card.querySelector('.damageStat span');
    const healthValue = card.querySelector('.healthStat span');
    if (!(levelBadge instanceof HTMLElement) ||
        !(damageValue instanceof HTMLElement) ||
        !(healthValue instanceof HTMLElement)) {
        dialog.close();
        dialog.remove();
        throw new Error('The trained card preview is missing its level or stats.');
    }

    const baseDamage = Number(training.target.dataset.baseDamage);
    const baseHealth = Number(training.target.dataset.baseHealth);
    const baseSpecialDamage = Number(training.target.dataset.baseSpecialDamage);
    const enhancementMultiplier =
        1 + Number(training.target.dataset.enhancement ?? 0) * 0.125;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 1
        : 650;
    let currentLevel = training.startingLevel;
    let currentExperience = training.startingExperience;
    let remainingExperience = training.experienceGained;

    function updateStats(level) {
        const initialDamage = Math.round(
            baseDamage * (1 + (training.startingLevel - 1) * 0.05) *
                enhancementMultiplier
        );
        const initialHealth = Math.round(
            baseHealth * (1 + (training.startingLevel - 1) * 0.05) *
                enhancementMultiplier
        );
        const multiplier = (1 + (level - 1) * 0.05) * enhancementMultiplier;
        const damage = Math.round(baseDamage * multiplier);
        const health = Math.round(baseHealth * multiplier);
        const specialDamage = Math.round(baseSpecialDamage * multiplier);
        damageValue.textContent = String(damage);
        damageValue.parentElement?.setAttribute('aria-label', `damage: ${damage}`);
        healthValue.textContent = String(health);
        healthValue.parentElement?.setAttribute('aria-label', `health: ${health}`);
        card.dataset.level = String(level);
        card.dataset.attackDamage = String(damage);
        card.dataset.maxHealth = String(health);
        card.dataset.currentHealth = String(health);
        card.dataset.specialDamage = String(specialDamage);
        const chargeBar = card.querySelector('.chargeBar');
        const specialType = card.dataset.specialType;
        if (chargeBar instanceof HTMLElement) {
            const effectLabel = ['self-heal', 'rand-heal', 'aoe-heal']
                .includes(specialType ?? '')
                ? `${Math.abs(specialDamage)} healing`
                : ['reduce-rand', 'aoe-purify'].includes(specialType ?? '')
                    ? `${Math.abs(specialDamage)} damage reduction`
                    : `${specialDamage} special damage`;
            const charges = card.querySelectorAll('.chargeSegment').length;
            chargeBar.setAttribute(
                'aria-label',
                `${charges} empty special charge${charges === 1 ? '' : 's'}, ${effectLabel}`
            );
        }
        levelBadge.textContent = `Lv. ${level}`;
        levelBadge.setAttribute('aria-label', `Level ${level}`);
        damageLine.textContent =
            `Damage: ${initialDamage} → ${damage} (${formatStatChange(damage - initialDamage)})`;
        healthLine.textContent =
            `Health: ${initialHealth} → ${health} (${formatStatChange(health - initialHealth)})`;
    }

    updateStats(currentLevel);
    while (remainingExperience > 0) {
        const requirement = getCardExperienceForLevel(currentLevel);
        const gainedThisLevel = Math.min(
            remainingExperience,
            requirement - currentExperience
        );
        const startProgress = currentExperience / requirement * 100;
        const endProgress =
            (currentExperience + gainedThisLevel) / requirement * 100;
        progressTrack.setAttribute('aria-valuemin', '0');
        progressTrack.setAttribute('aria-valuemax', String(requirement));
        progressTrack.setAttribute('aria-valuenow', String(currentExperience));
        experienceLabel.textContent =
            `Level ${currentLevel} EXP: ${currentExperience} / ${requirement}`;
        progressFill.style.width = `${startProgress}%`;
        progressFill.getBoundingClientRect();
        requestAnimationFrame(() => {
            progressFill.style.width = `${endProgress}%`;
        });
        await new Promise(resolve => window.setTimeout(resolve, duration));
        currentExperience += gainedThisLevel;
        remainingExperience -= gainedThisLevel;
        progressTrack.setAttribute('aria-valuenow', String(currentExperience));

        if (currentExperience === requirement) {
            currentLevel += 1;
            currentExperience = 0;
            heading.textContent = 'Card Level Up!';
            updateStats(currentLevel);
            progressFill.style.width = '0%';
            progressTrack.setAttribute('aria-valuenow', '0');
        }
    }

    const maximumLevel = getCardMaxLevel(training.target.dataset.characterName ?? '');
    experienceLabel.textContent = currentLevel === maximumLevel
        ? `Maximum level reached: ${maximumLevel}`
        : `Level ${currentLevel} EXP: ${currentExperience} / ${getCardExperienceForLevel(currentLevel)}`;
    progressTrack.setAttribute(
        'aria-valuemax',
        String(getCardExperienceForLevel(currentLevel))
    );
    progressTrack.setAttribute('aria-valuenow', String(currentExperience));
    updateStats(currentLevel);
    continueButton.hidden = false;
    continueButton.focus();
    await new Promise(resolve => {
        continueButton.addEventListener('click', resolve, { once: true });
    });
    dialog.close();
    dialog.remove();
}

if (document.querySelector('#storage')) {
    loadStorage().catch(error => {
        console.error('Could not load saved cards.', error);
    });
}
