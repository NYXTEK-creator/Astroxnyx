import upperCase from './uppercase.js';
import {
    getCardMaxEnhancement,
    getCardMaxLevel,
    getCardStarRanks
} from './cardProgression.js?v=7';
import { getCardExperienceForLevel } from '../game/saves.js?v=20';

export default async function renderCharacter(
    name,
    target = document.querySelector('#card-container'),
    {
        level: levelOverride,
        experience: experienceOverride = 0,
        enhancement: enhancementOverride = 0,
        starRanks: starRanksOverride
    } = {}
) {
    if (typeof name !== 'string' || !/^[a-z][a-z0-9-]*$/i.test(name.trim())) {
        throw new TypeError('Character name must be a valid character data filename.');
    }

    const characterName = name.trim().toLowerCase();
    if (!(target instanceof Element)) {
        throw new Error('Could not find a target element for the character card.');
    }

    const characterDataModule =
        await import(`../../data/characters/${characterName}.js?v=2`);
    const character = characterDataModule[`${characterName}Char`];

    if (!character || typeof character.charName !== 'string' ||
        typeof character.charType !== 'string') {
        throw new Error(`Character data for "${characterName}" is missing or invalid.`);
    }

    if (!/^[a-z][a-z0-9-]*$/i.test(character.charType)) {
        throw new Error(`Character type for "${characterName}" is invalid.`);
    }

    const typeName = character.charType.toLowerCase();
    const enhancementType = character.mainType ?? typeName;
    if (typeof enhancementType !== 'string' ||
        !/^[a-z][a-z0-9-]*$/i.test(enhancementType)) {
        throw new Error(`Enhancement type for "${characterName}" is invalid.`);
    }
    const rankNum = character.rating;
    if (!Number.isSafeInteger(enhancementOverride) ||
        enhancementOverride < 0 ||
        enhancementOverride > getCardMaxEnhancement(characterName)) {
        throw new Error(`Enhancement rank for "${characterName}" is invalid.`);
    }
    const rankValues = ['bronze', 'silver', 'gold'];
    const baseRankIndex = rankValues.indexOf(character.value);
    if (!Number.isInteger(rankNum) || rankNum < 1 || rankNum > 5 ||
        baseRankIndex === -1) {
        throw new Error(`Rank data for "${characterName}" is invalid.`);
    }
    const starRanks = getCardStarRanks(
        characterName,
        enhancementOverride,
        starRanksOverride
    );
    if (!Number.isFinite(character.damage) || !Number.isFinite(character.health)) {
        throw new Error(`Combat stats for "${characterName}" are invalid.`);
    }
    const cardLevel = levelOverride ?? character.level;
    if (!Number.isSafeInteger(cardLevel) || cardLevel < 1 ||
        cardLevel > getCardMaxLevel(characterName)) {
        throw new Error(
            `Card level for "${characterName}" must be between 1 and ${getCardMaxLevel(characterName)}.`
        );
    }
    if (!Number.isSafeInteger(experienceOverride) || experienceOverride < 0 ||
        experienceOverride >= getCardExperienceForLevel(cardLevel)) {
        throw new Error(`Card experience for "${characterName}" is invalid.`);
    }
    const levelMultiplier = 1 + (cardLevel - 1) * 0.05;
    const enhancementMultiplier = 1 + enhancementOverride * 0.125;
    const statMultiplier = levelMultiplier * enhancementMultiplier;
    const damage = Math.round(character.damage * statMultiplier);
    const health = Math.round(character.health * statMultiplier);
    const special = character.special;
    const specialType = String(special?.type).toLowerCase();
    const specialTypes = [
        'aoe', 'direct', 'rand', 'scorch',
        'self-heal', 'rand-heal', 'aoe-heal', 'aoe-purify', 'reduce-rand'
    ];
    if (!special || !Number.isInteger(special.charge) ||
        special.charge < 1 || special.charge > 5 ||
        !specialTypes.includes(specialType) ||
        !Number.isFinite(special.damage) ||
        ([
            'self-heal', 'rand-heal', 'aoe-heal', 'aoe-purify', 'reduce-rand'
        ].includes(specialType)
            ? special.damage > 0
            : special.damage < 0)) {
        throw new Error(`Special charge data for "${characterName}" is invalid.`);
    }
    const specialDamage = Math.round(special.damage * statMultiplier);
    if (!Number.isSafeInteger(damage) || damage < 0 ||
        !Number.isSafeInteger(health) || health < 1 ||
        !Number.isSafeInteger(specialDamage)) {
        throw new RangeError(`Scaled combat stats for "${characterName}" are out of range.`);
    }

    const typeDataModule = await import(`../../data/types/${typeName}.js`);
    const type = typeDataModule[typeName];

    if (!type || typeof type.emoji !== 'string' ||
        typeof type['color-empty'] !== 'string' ||
        typeof type['color-full'] !== 'string') {
        throw new Error(`Type data for "${typeName}" is missing or invalid.`);
    }
    const mainTypeDataModule = enhancementType.toLowerCase() === typeName
        ? typeDataModule
        : await import(`../../data/types/${enhancementType.toLowerCase()}.js`);
    const mainTypeData = mainTypeDataModule[enhancementType.toLowerCase()];
    if (!mainTypeData || typeof mainTypeData.strength !== 'string' ||
        typeof mainTypeData.weakness !== 'string') {
        throw new Error(
            `Combat type data for "${enhancementType.toLowerCase()}" is missing or invalid.`
        );
    }

    const card = document.createElement('div');
    card.className = `${typeName}Card`;
    if (!target.closest('.battle-hand-card, .battle-slot')) {
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${character.charName} card details`);
    }
    card.dataset.characterName = characterName;
    card.dataset.characterType = typeName;
    card.dataset.mainType = enhancementType.toLowerCase();
    card.dataset.experience = String(experienceOverride);
    card.dataset.level = String(cardLevel);
    card.dataset.enhancement = String(enhancementOverride);
    card.dataset.starRanks = JSON.stringify(starRanks);
    card.dataset.rating = String(rankNum);
    card.dataset.rank = starRanks[0];
    card.dataset.baseDamage = String(character.damage);
    card.dataset.baseHealth = String(character.health);
    card.dataset.baseSpecialDamage = String(special.damage);
    card.dataset.typeStrength = mainTypeData.strength;
    card.dataset.typeWeakness = mainTypeData.weakness;
    card.dataset.attackDamage = String(damage);
    card.dataset.currentHealth = String(health);
    card.dataset.maxHealth = String(health);
    card.dataset.specialType = specialType;
    card.dataset.specialName = typeof special.name === 'string' ? special.name : '';
    card.dataset.specialDamage = String(specialDamage);
    card.dataset.specialCharge = String(special.charge);

    const title = document.createElement('p');
    title.className = 'cardText';
    title.textContent = upperCase(character.charName);

    const cardHeader = document.createElement('div');
    cardHeader.className = 'cardHeader';

    const levelBadge = document.createElement('span');
    levelBadge.className = 'cardLevel';
    levelBadge.textContent = `Lv. ${cardLevel}`;
    levelBadge.setAttribute('aria-label', `Level ${cardLevel}`);
    cardHeader.append(title, levelBadge);

    const emoji = document.createElement('p');
    emoji.className = typeName === 'dark' ? 'emoji darkEmoji' : 'emoji';
    emoji.textContent = type.emoji;

    const rankStars = document.createElement('div');
    rankStars.className = 'rankStars';
    rankStars.setAttribute('role', 'img');
    rankStars.setAttribute(
        'aria-label',
        `${starRanks.map(rank => `${rank} rank`).join(', ')}`
    );

    for (let starIndex = 0; starIndex < rankNum; starIndex += 1) {
        const rank = document.createElement('img');
        rank.src = new URL(
            `../../images/ranks/${starRanks[starIndex]}.png`,
            import.meta.url
        ).href;
        rank.alt = '';
        rank.setAttribute('aria-hidden', 'true');
        rankStars.append(rank);
    }

    const damageStat = createCardStat('damage', damage);
    const healthStat = createCardStat('health', health);
    const chargeBar = createChargeBar(special, type, specialDamage);

    card.append(rankStars, cardHeader, emoji, damageStat, healthStat, chargeBar);
    target.append(card);
    fitCardTitle(title);
    return card;
}

export function fitCardTitle(title) {
    title.style.removeProperty('font-size');
    let fontSize = Number.parseFloat(window.getComputedStyle(title).fontSize);
    for (let attempt = 0; attempt < 8 && title.scrollWidth > title.clientWidth; attempt += 1) {
        fontSize *= title.clientWidth / title.scrollWidth;
        title.style.fontSize = `${fontSize}px`;
    }
}

function createChargeBar(special, type, specialDamage) {
    const specialStat = document.createElement('div');
    specialStat.className = 'specialStat';

    const chargeBar = document.createElement('div');
    chargeBar.className = 'chargeBar';
    chargeBar.setAttribute('role', 'img');
    const specialType = String(special.type).toLowerCase();
    const effectLabel = ['self-heal', 'rand-heal', 'aoe-heal']
        .includes(specialType)
        ? `${Math.abs(specialDamage)} healing`
        : ['reduce-rand', 'aoe-purify'].includes(specialType)
            ? `${Math.abs(specialDamage)} damage reduction`
            : `${specialDamage} special damage`;
    chargeBar.setAttribute(
        'aria-label',
        `${special.charge} empty special charge${special.charge === 1 ? '' : 's'}, ${effectLabel}`
    );

    for (let chargeIndex = 0; chargeIndex < special.charge; chargeIndex += 1) {
        const segment = document.createElement('span');
        segment.className = 'chargeSegment';
        segment.style.setProperty('--charge-empty-color', type['color-empty']);
        segment.style.setProperty('--charge-fill-color', type['color-full']);
        chargeBar.append(segment);
    }

    specialStat.append(chargeBar);
    return specialStat;
}

function createCardStat(statName, value) {
    const stat = document.createElement('div');
    stat.className = `cardStat ${statName}Stat`;
    stat.setAttribute('role', 'img');
    stat.setAttribute('aria-label', `${statName}: ${value}`);

    const icon = document.createElement('img');
    icon.src = new URL(`../../images/icons/${statName}.png`, import.meta.url).href;
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');

    const number = document.createElement('span');
    number.textContent = String(value);

    stat.append(icon, number);
    return stat;
}
