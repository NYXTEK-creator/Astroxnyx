import {
    getCoins,
    getElementalStones,
    getGems,
    getPlayerLevel,
    purchaseCardFromShop,
    tradeCurrencies
} from './saves.js?v=24';
import renderCharacter from '../utils/renderCharacter.js?v=21';
import {
    getCardNamesByRating,
    getCardNamesByType
} from '../utils/cardProgression.js?v=10';

const SHOP_CARD_COST = 800;
const SHOP_CARD_GEM_COST = 30;
const ELEMENTAL_STONE_CARD_COST = 10;
const coinAmount = document.querySelector('#coin-amount');
const gemAmount = document.querySelector('#gem-amount');
const coinBox = document.querySelector('#coinbox');
const gemBox = document.querySelector('#gembox');
const elementalStoneBoxes = new Map(
    [...document.querySelectorAll('[data-stone-type]')].map(button => [
        button.dataset.stoneType,
        button
    ])
);
const purchaseMessage = document.querySelector('#shop-purchase-message');
const cardDialog = document.querySelector('#shop-card-dialog');
const closeCardDialog = cardDialog?.querySelector('.shop-dialog-close');
const cardResult = document.querySelector('#shop-card-result');
const shopTab = document.querySelector('#shop-tab');
const tradingTab = document.querySelector('#trading-tab');
const shopView = document.querySelector('#shop-view');
const tradingView = document.querySelector('#trading-view');
const stoneTradeType = document.querySelector('#stone-trade-type');
const tradeMessage = document.querySelector('#trade-message');
const tradeButtons = {
    coinToGem: document.querySelector('#trade-coins-for-gem'),
    gemToCoin: document.querySelector('#trade-gem-for-coins'),
    coinToStone: document.querySelector('#trade-coins-for-stone'),
    gemsToStone: document.querySelector('#trade-gems-for-stone'),
    stoneToGems: document.querySelector('#trade-stone-for-gems')
};
const stoneBalances = {
    fire: document.querySelector('#fire-gem-amount'),
    water: document.querySelector('#water-gem-amount'),
    nature: document.querySelector('#nature-gem-amount'),
    electric: document.querySelector('#electric-gem-amount'),
    dark: document.querySelector('#dark-gem-amount'),
    light: document.querySelector('#light-gem-amount')
};

if (!(coinAmount instanceof HTMLElement)) {
    throw new Error('Could not find the Shop coin balance display.');
}
if (!(gemAmount instanceof HTMLElement)) {
    throw new Error('Could not find the Shop gem balance display.');
}
if (!(coinBox instanceof HTMLButtonElement) ||
    !(gemBox instanceof HTMLButtonElement) ||
    !(purchaseMessage instanceof HTMLElement) ||
    !(cardDialog instanceof HTMLDialogElement) ||
    !(closeCardDialog instanceof HTMLButtonElement) ||
    !(cardResult instanceof HTMLElement)) {
    throw new Error('Could not find the Shop card purchase controls.');
}
if (!(shopTab instanceof HTMLButtonElement) ||
    !(tradingTab instanceof HTMLButtonElement) ||
    !(shopView instanceof HTMLElement) ||
    !(tradingView instanceof HTMLElement) ||
    !(stoneTradeType instanceof HTMLSelectElement) ||
    !(tradeMessage instanceof HTMLElement) ||
    Object.values(tradeButtons).some(button => !(button instanceof HTMLButtonElement))) {
    throw new Error('Could not find the shop trading controls.');
}
if (elementalStoneBoxes.size !== 6 ||
    [...elementalStoneBoxes.entries()].some(([type, button]) =>
        !['fire', 'water', 'nature', 'electric', 'dark', 'light'].includes(type) ||
        !(button instanceof HTMLButtonElement)
    )) {
    throw new Error('Could not find all six elemental stone card offers.');
}
if (Object.values(stoneBalances).some(balance => !(balance instanceof HTMLElement))) {
    throw new Error('Could not find all elemental gem balance displays.');
}

function updateBalances() {
    coinAmount.textContent = getCoins().toLocaleString();
    gemAmount.textContent = getGems().toLocaleString();
    const stones = getElementalStones();
    for (const [type, amount] of Object.entries(stones)) {
        const display = stoneBalances[type];
        if (!(display instanceof HTMLElement)) {
            throw new Error(`Could not find the ${type} gem balance display.`);
        }
        display.textContent = amount.toLocaleString();
    }
    coinBox.disabled = getCoins() < SHOP_CARD_COST;
    gemBox.disabled = getGems() < SHOP_CARD_GEM_COST;
    for (const [type, button] of elementalStoneBoxes) {
        button.disabled = stones[type] < ELEMENTAL_STONE_CARD_COST;
    }
    updateTradeControls();
}

function updateTradeControls() {
    const selectedStone = stoneTradeType.value;
    const stones = getElementalStones();
    tradeButtons.coinToGem.disabled = getCoins() < 100;
    tradeButtons.gemToCoin.disabled = getGems() < 1;
    tradeButtons.coinToStone.disabled = getCoins() < 200;
    tradeButtons.gemsToStone.disabled = getGems() < 2;
    tradeButtons.stoneToGems.disabled =
        !ELEMENTAL_STONE_TYPES.includes(selectedStone) || stones[selectedStone] < 1;
}

const ELEMENTAL_STONE_TYPES = ['fire', 'water', 'nature', 'electric', 'dark', 'light'];

function showView(viewName) {
    const showShop = viewName === 'shop';
    shopView.hidden = !showShop;
    tradingView.hidden = showShop;
    shopTab.setAttribute('aria-pressed', String(showShop));
    tradingTab.setAttribute('aria-pressed', String(!showShop));
    if (showShop) {
        shopTab.focus();
    } else {
        tradingTab.focus();
    }
}

function handleTrade(sourceCurrency, sourceAmount, targetCurrency, targetAmount, description) {
    tradeMessage.textContent = '';
    try {
        tradeCurrencies(sourceCurrency, sourceAmount, targetCurrency, targetAmount);
        updateBalances();
        tradeMessage.textContent = description;
    } catch (error) {
        if (error instanceof RangeError &&
            error.message === `Not enough ${sourceCurrency} for this trade.`) {
            tradeMessage.textContent = `Not enough ${sourceCurrency} to make that trade.`;
            return;
        }
        console.error('Could not complete the currency trade.', error);
        tradeMessage.textContent = 'The trade could not be completed.';
    }
}

function getRatingTwoChance(level) {
    if (level < 5) {
        return 0.1;
    }
    if (level < 10) {
        return 0.25;
    }
    if (level < 15) {
        return 0.5;
    }
    if (level <= 20) {
        return 0.75;
    }
    return 1;
}

function getGemRatingTwoChance(level) {
    return level <= 5 ? 0.75 : 1;
}

function getRandomItem(items) {
    if (items.length === 0) {
        throw new Error('No cards are configured for the selected rating.');
    }
    return items[Math.floor(Math.random() * items.length)];
}

async function buyRandomCard(currencyType, elementType = null) {
    const isElementalStone = elementType !== null;
    const button = isElementalStone
        ? elementalStoneBoxes.get(elementType)
        : currencyType === 'coins' ? coinBox : gemBox;
    const cost = isElementalStone
        ? ELEMENTAL_STONE_CARD_COST
        : currencyType === 'coins' ? SHOP_CARD_COST : SHOP_CARD_GEM_COST;
    if (!(button instanceof HTMLButtonElement)) {
        throw new Error('Could not find the selected random card offer.');
    }
    button.disabled = true;
    purchaseMessage.textContent = '';
    cardResult.replaceChildren();

    try {
        const playerLevel = getPlayerLevel();
        const ratingTwoChance = isElementalStone
            ? getRatingTwoChance(playerLevel)
            : currencyType === 'coins'
                ? getRatingTwoChance(playerLevel)
                : getGemRatingTwoChance(playerLevel);
        const rating = Math.random() < ratingTwoChance ? 2 : 1;
        const cardPool = isElementalStone
            ? getCardNamesByType(elementType).filter(
                name => getCardNamesByRating(rating).includes(name)
            )
            : getCardNamesByRating(rating);
        const cardName = getRandomItem(cardPool);
        const ownedCard = purchaseCardFromShop(
            cardName,
            cost,
            isElementalStone ? elementType : currencyType
        );
        updateBalances();

        const resultHeading = document.createElement('p');
        resultHeading.className = 'shop-purchase-result-heading';
        resultHeading.textContent = `You got ${cardName.toUpperCase()}!`;
        const cardTarget = document.createElement('div');
        cardTarget.className = 'shop-purchase-card';
        cardResult.append(resultHeading, cardTarget);
        try {
            await renderCharacter(
                ownedCard.name,
                cardTarget,
                {
                    level: ownedCard.level,
                    experience: ownedCard.experience,
                    enhancement: ownedCard.enhancement,
                    starRanks: ownedCard.starRanks
                }
            );
        } catch (error) {
            console.error('Could not render the purchased card.', error);
            purchaseMessage.textContent =
                `Purchase saved, but ${cardName} could not be displayed.`;
        }
        cardDialog.showModal();
    } catch (error) {
        const insufficientCurrency = isElementalStone
            ? `Not enough ${elementType} stones to purchase this card.`
            : `Not enough ${currencyType} to purchase this card.`;
        if (error instanceof RangeError && error.message === insufficientCurrency) {
            purchaseMessage.textContent = isElementalStone
                ? `You need 10 ${elementType} stones to buy an elemental card.`
                : currencyType === 'coins'
                    ? 'You need 800 coins to buy a card.'
                    : 'You need 30 gems to buy a card.';
        } else {
            console.error('Could not complete the shop card purchase.', error);
            purchaseMessage.textContent = 'The purchase could not be completed.';
        }
    } finally {
        updateBalances();
    }
}

closeCardDialog.addEventListener('click', () => {
    cardDialog.close();
});

shopTab.addEventListener('click', () => showView('shop'));
tradingTab.addEventListener('click', () => showView('trading'));
stoneTradeType.addEventListener('change', updateTradeControls);
tradeButtons.coinToGem.addEventListener('click', () => {
    handleTrade('coins', 100, 'gems', 1, 'Traded 100 coins for 1 gem.');
});
tradeButtons.gemToCoin.addEventListener('click', () => {
    handleTrade('gems', 1, 'coins', 100, 'Traded 1 gem for 100 coins.');
});
tradeButtons.coinToStone.addEventListener('click', () => {
    const type = stoneTradeType.value;
    handleTrade('coins', 200, type, 1, `Traded 200 coins for 1 ${type} stone.`);
});
tradeButtons.gemsToStone.addEventListener('click', () => {
    const type = stoneTradeType.value;
    handleTrade('gems', 2, type, 1, `Traded 2 gems for 1 ${type} stone.`);
});
tradeButtons.stoneToGems.addEventListener('click', () => {
    const type = stoneTradeType.value;
    handleTrade(type, 1, 'gems', 2, `Traded 1 ${type} stone for 2 gems.`);
});

coinBox.addEventListener('click', () => {
    buyRandomCard('coins').catch(error => {
        console.error('Unexpected error during the shop card purchase.', error);
        purchaseMessage.textContent = 'The purchase could not be completed.';
        updateBalances();
    });
});

gemBox.addEventListener('click', () => {
    buyRandomCard('gems').catch(error => {
        console.error('Unexpected error during the shop card purchase.', error);
        purchaseMessage.textContent = 'The purchase could not be completed.';
        updateBalances();
    });
});

for (const [elementType, button] of elementalStoneBoxes) {
    button.addEventListener('click', () => {
        buyRandomCard(elementType, elementType).catch(error => {
            console.error(
                `Unexpected error during the ${elementType} card purchase.`,
                error
            );
            purchaseMessage.textContent = 'The purchase could not be completed.';
            updateBalances();
        });
    });
}

updateBalances();
window.addEventListener('storage', event => {
    if (event.key === 'fusion-currencies') {
        updateBalances();
    }
});
