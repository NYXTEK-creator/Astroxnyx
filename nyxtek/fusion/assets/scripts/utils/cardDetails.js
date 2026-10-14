import {
    getCardExperienceForLevel,
    getCoins,
    getInventoryCapacity,
    getInventoryCards,
    getPlayerLevel,
    getStorageCards,
    sellCard
} from '../game/saves.js';

const effectLabels = {
    aoe: 'Area attack',
    direct: 'Direct attack',
    rand: 'Random target',
    scorch: 'Scorch',
    'self-heal': 'Self heal',
    'rand-heal': 'Random ally heal',
    'aoe-heal': 'Area heal',
    'aoe-purify': 'Area opponent damage reduction',
    'reduce-rand': 'Random enemy damage reduction'
};

export function initializeCardDetails() {
    const dialog = document.createElement('dialog');
    dialog.className = 'card-details-dialog';
    dialog.setAttribute('aria-labelledby', 'card-details-title');
    dialog.innerHTML = `
        <section class="card-details-panel">
            <button class="card-details-close" type="button" aria-label="Close card details">×</button>
            <h2 id="card-details-title"></h2>
            <dl class="card-details-list">
                <div><dt>Special attack</dt><dd data-detail="name"></dd></div>
                <div><dt>Attack type</dt><dd data-detail="effect"></dd></div>
                <div><dt>Amount</dt><dd data-detail="amount"></dd></div>
                <div><dt>Charge</dt><dd data-detail="charge"></dd></div>
                <div><dt>Element</dt><dd data-detail="type"></dd></div>
            </dl>
            <p class="card-sale-message" role="status" aria-live="polite"></p>
            <button class="card-sell-button" type="button" hidden></button>
        </section>
    `;
    document.body.append(dialog);

    const panel = dialog.querySelector('.card-details-panel');
    const title = dialog.querySelector('#card-details-title');
    const closeButton = dialog.querySelector('.card-details-close');
    const nameValue = dialog.querySelector('[data-detail="name"]');
    const effectValue = dialog.querySelector('[data-detail="effect"]');
    const amountValue = dialog.querySelector('[data-detail="amount"]');
    const chargeValue = dialog.querySelector('[data-detail="charge"]');
    const typeValue = dialog.querySelector('[data-detail="type"]');
    const sellButton = dialog.querySelector('.card-sell-button');
    const saleMessage = dialog.querySelector('.card-sale-message');
    if (!(panel instanceof HTMLElement) || !(title instanceof HTMLElement) ||
        !(closeButton instanceof HTMLButtonElement) ||
        !(nameValue instanceof HTMLElement) || !(effectValue instanceof HTMLElement) ||
        !(amountValue instanceof HTMLElement) || !(chargeValue instanceof HTMLElement) ||
        !(typeValue instanceof HTMLElement) ||
        !(sellButton instanceof HTMLButtonElement) ||
        !(saleMessage instanceof HTMLElement)) {
        throw new Error('Could not create the card details dialog.');
    }

    let returnFocusTarget = null;
    let selectedCard = null;
    let selectedCardId = null;
    function showCardDetails(card) {
        const specialType = card.dataset.specialType;
        const specialDamage = Number(card.dataset.specialDamage);
        const charge = Number(card.dataset.specialCharge);
        const elementType = card.dataset.characterType;
        if (!specialType || !Number.isFinite(specialDamage) ||
            !Number.isInteger(charge) || !elementType) {
            throw new Error('A card is missing special attack details.');
        }

        const readableType = specialType.replaceAll('-', ' ');
        const isHealing = ['self-heal', 'rand-heal', 'aoe-heal']
            .includes(specialType);
        const amountLabel = ['reduce-rand', 'aoe-purify'].includes(specialType)
            ? `${Math.abs(specialDamage)} damage reduction`
            : isHealing
                ? `${Math.abs(specialDamage)} healing`
                : `${Math.abs(specialDamage)} damage`;
        const characterName = card.dataset.characterName ?? 'Card';
        title.textContent = `${characterName.charAt(0).toUpperCase()}${characterName.slice(1)}`;
        nameValue.textContent = card.dataset.specialName || effectLabels[specialType] ||
            'Special attack';
        effectValue.textContent = effectLabels[specialType] || readableType;
        amountValue.textContent = amountLabel;
        chargeValue.textContent = `${charge} charge${charge === 1 ? '' : 's'}`;
        typeValue.textContent = `${elementType.charAt(0).toUpperCase()}${elementType.slice(1)}`;
        panel.style.backgroundImage = window.getComputedStyle(card).backgroundImage;
        returnFocusTarget = card;
        const editorEntry = card.closest('.deck-edit-card');
        const isOwnedCollectionCard = Boolean(
            card.closest('#card-container, #deck-editor, #training-deck, #storage')
        );
        const cardOwner = typeof card.dataset.cardId === 'string'
            ? card
            : editorEntry;
        selectedCard = isOwnedCollectionCard &&
            cardOwner instanceof HTMLElement &&
            typeof cardOwner.dataset.cardId === 'string'
            ? card
            : null;
        selectedCardId = selectedCard
            ? cardOwner.dataset.cardId
            : null;
        saleMessage.textContent = '';
        sellButton.hidden = selectedCard === null;
        if (selectedCard) {
            const cardLevel = Number(selectedCard.dataset.level);
            if (!Number.isSafeInteger(cardLevel) || cardLevel < 1) {
                throw new Error('The selected card has an invalid level.');
            }
            const salePrice = Math.round(getCardExperienceForLevel(cardLevel) * 1.5);
            sellButton.textContent = `Sell card for ${salePrice.toLocaleString()} coins`;
        }

        if (!dialog.open) {
            dialog.showModal();
        }
        closeButton.focus();
    }

    document.addEventListener('click', event => {
        if (!(event.target instanceof Element)) {
            return;
        }
        const card = event.target.closest('[data-special-type][data-special-damage]');
        if (card instanceof HTMLElement) {
            showCardDetails(card);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }
        if (!(event.target instanceof Element)) {
            return;
        }
        const card = event.target.closest('[data-special-type][data-special-damage]') ??
            (event.target.closest('.battle-hand-card')
                ?.querySelector('[data-special-type][data-special-damage]') ?? null);
        if (card instanceof HTMLElement) {
            event.preventDefault();
            showCardDetails(card);
        }
    });

    closeButton.addEventListener('click', () => dialog.close());
    sellButton.addEventListener('click', () => {
        if (!selectedCard || !selectedCardId) {
            throw new Error('No owned deck card is selected for sale.');
        }
        try {
            const sale = sellCard(selectedCardId);
            const inventoryCardContainer = selectedCard.closest('#card-container');
            const editorEntry = selectedCard.closest('.deck-edit-card');
            const cardToRemove = editorEntry ?? selectedCard;
            if (inventoryCardContainer) {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'emptyCard inventory-slot inventory-empty';
                emptySlot.setAttribute('aria-label', 'Empty inventory slot');
                cardToRemove.replaceWith(emptySlot);
            } else {
                cardToRemove.remove();
            }
            const deckCount = document.querySelector('#deck-edit-count');
            const storageCount = document.querySelector('#storage-edit-count');
            if (deckCount instanceof HTMLElement) {
                deckCount.textContent =
                    `${getInventoryCards().length} / ${getInventoryCapacity(getPlayerLevel())}`;
            }
            if (storageCount instanceof HTMLElement) {
                storageCount.textContent = String(getStorageCards().length);
            }
            const trainCoinAmount = document.querySelector('#train-coin-amount');
            if (trainCoinAmount instanceof HTMLElement) {
                trainCoinAmount.textContent = getCoins().toLocaleString();
            }
            saleMessage.textContent =
                `${sale.name} sold for ${sale.coins.toLocaleString()} coins.`;
            selectedCard = null;
            selectedCardId = null;
            sellButton.hidden = true;
        } catch (error) {
            if (error instanceof RangeError &&
                error.message === 'The deck must keep at least one card.') {
                saleMessage.textContent = error.message;
                return;
            }
            console.error('Could not sell the selected card.', error);
            saleMessage.textContent = 'The card could not be sold.';
        }
    });
    dialog.addEventListener('click', event => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
    dialog.addEventListener('close', () => {
        if (returnFocusTarget instanceof HTMLElement && returnFocusTarget.isConnected) {
            returnFocusTarget.focus();
        }
    });
}
