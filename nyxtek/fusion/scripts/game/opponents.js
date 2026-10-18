import { order as floralOrder } from '../../data/floral/order.js';
import { issac } from '../../data/floral/opponents/issac.js';
import { lucas } from '../../data/floral/opponents/lucas.js';
import { lucy } from '../../data/floral/opponents/lucy.js';
import { order as coralOrder } from '../../data/coral/order.js';
import { order as fireOrder } from '../../data/fire/order.js';
import { liam } from '../../data/coral/opponents/liam.js';
import { lorah } from '../../data/coral/opponents/lorah.js';
import { marie } from '../../data/coral/opponents/marie.js';
import { zach } from '../../data/coral/opponents/zach.js';
import { matthew } from '../../data/fire/opponents/matthew.js';
import { kris } from '../../data/fire/opponents/kris.js'; 
import { joseph } from '../../data/fire/opponents/joseph.js';
import { ethan } from '../../data/fire/opponents/ethan.js';
import { isaiah } from '../../data/fire/opponents/isaiah.js';
import renderCharacter from '../utils/renderCharacter.js';
import { parseRewardChoice } from './rewardChoices.js';
import {
    getCoralDefeatedCount,
    getFloralDefeatedCount,
    isCoralOpponentUnlocked,
    isCoralStageUnlocked,
    getFireDefeatedCount,
    isFireOpponentUnlocked,
    isFireStageUnlocked,
    isFloralOpponentUnlocked,
    completionDifficulties
} from './progression.js';

const opponentData = {
    floral: {
        order: floralOrder,
        defeatedCount: getFloralDefeatedCount,
        isUnlocked: isFloralOpponentUnlocked,
        opponents: {
            issac: { name: 'Issac', data: issac },
            lucas: { name: 'Lucas', data: lucas },
            lucy: { name: 'Lucy', data: lucy }
        }
    },
    coral: {
        order: coralOrder,
        defeatedCount: getCoralDefeatedCount,
        isStageUnlocked: isCoralStageUnlocked,
        isUnlocked: isCoralOpponentUnlocked,
        opponents: {
            liam: { name: 'Liam', data: liam },
            lorah: { name: 'Lorah', data: lorah },
            marie: { name: 'Marie', data: marie },
            zach: { name: 'Zach', data: zach }
        }
    },
    fire: {
        order: fireOrder,
        defeatedCount: getFireDefeatedCount,
        isStageUnlocked: isFireStageUnlocked,
        isUnlocked: isFireOpponentUnlocked,
        opponents: {
            joseph: {name: 'Joseph', data: joseph},
            kris: {name: 'Kris', data: kris},
            matthew: { name: 'Matthew', data: matthew },
            ethan: { name: 'Ethan', data: ethan },
            isaiah: { name: 'Isaiah', data: isaiah }
        }
    }
};
const difficulties = [
    ...completionDifficulties.map(key => ({
        key,
        label: key[0].toUpperCase() + key.slice(1)
    })),
    { key: 'erect', label: 'Erect' },
    { key: 'nightmare', label: 'Nightmare'},
];
const elementalGemIcons = {
    fire: 'firegem.png',
    water: 'watergem.png',
    nature: 'naturegem.png',
    electric: 'lightinggem.png',
    dark: 'darkgem.png',
    light: 'lightgem.png'
};

function createReward(iconName, amount, label) {
    const reward = document.createElement('span');
    reward.className = 'opponent-reward';
    reward.setAttribute('aria-label', `${amount} ${label}`);

    const icon = document.createElement('img');
    icon.src = new URL(`../../images/icons/${iconName}.png`, import.meta.url).href;
    icon.alt = '';

    const value = document.createElement('span');
    value.textContent = String(amount);

    reward.append(icon, value);
    return reward;
}

function createPossibleRewards(titleText, rewardChoices) {
    if (!Array.isArray(rewardChoices)) {
        throw new TypeError('Opponent reward choices must be an array.');
    }

    const panel = document.createElement('div');
    panel.className = 'opponent-possible-rewards';
    const heading = document.createElement('h5');
    heading.textContent = titleText;
    const list = document.createElement('div');
    list.className = rewardChoices.length === 1
        ? 'opponent-possible-reward-list opponent-possible-reward-list-single'
        : 'opponent-possible-reward-list';
    const errorMessage = document.createElement('p');
    errorMessage.className = 'opponent-possible-reward-error';
    errorMessage.setAttribute('role', 'alert');
    panel.append(heading, list, errorMessage);

    for (const rewardChoice of rewardChoices.map(parseRewardChoice)) {
        const item = document.createElement('div');
        item.className = 'opponent-possible-reward';
        if (rewardChoice.type === 'card') {
            const cardPreview = document.createElement('div');
            cardPreview.className = 'opponent-reward-card-preview';
            const cardTarget = document.createElement('div');
            cardTarget.className = 'opponent-reward-card-target';
            cardTarget.dataset.cardName = rewardChoice.name;
            cardPreview.append(cardTarget);

            const name = document.createElement('span');
            name.textContent = rewardChoice.name.toUpperCase();
            item.append(cardPreview, name);
        } else {
            const gemIcon = document.createElement('img');
            gemIcon.className = 'opponent-reward-gem-icon';
            gemIcon.src = new URL(
                `../../images/icons/${elementalGemIcons[rewardChoice.element]}`,
                import.meta.url
            ).href;
            gemIcon.alt = '';
            gemIcon.setAttribute('aria-hidden', 'true');

            const gemAmount = document.createElement('span');
            gemAmount.textContent =
                `${rewardChoice.amount} ${rewardChoice.element} gems`;
            item.append(gemIcon, gemAmount);
        }
        list.append(item);
    }

    return panel;
}

function createDifficultyDetails(stageId, opponentId, opponentName, difficulty, details, isUnlocked) {
    const section = document.createElement('section');
    section.className = 'opponent-difficulty';
    section.dataset.difficulty = difficulty.key;
    section.setAttribute('aria-label', `${difficulty.label} details`);

    const battleRewards = document.createElement('section');
    battleRewards.className = 'opponent-battle-rewards';
    const battleRewardsHeading = document.createElement('h5');
    battleRewardsHeading.textContent = 'Coins & EXP';
    const rewards = document.createElement('div');
    rewards.className = 'opponent-rewards';
    rewards.append(
        createReward('coin', details.coins, 'coins'),
        createReward('exp', details.exp, 'experience')
    );
    battleRewards.append(battleRewardsHeading, rewards);
    const rewardOverview = document.createElement('div');
    rewardOverview.className = 'opponent-reward-overview';
    const firstTimeRewards = details.firstTime === undefined
        ? []
        : Array.isArray(details.firstTime)
            ? details.firstTime
            : [details.firstTime];
    const firstTimeRewardPanel = createPossibleRewards(
        'First-time rewards',
        firstTimeRewards
    );
    firstTimeRewardPanel.classList.add('opponent-first-time-rewards');
    rewardOverview.append(
        battleRewards,
        firstTimeRewardPanel,
        createPossibleRewards('Choose one reward each win', details.reward ?? [])
    );

    const fightButton = document.createElement('button');
    fightButton.className = 'button fight-button';
    fightButton.type = 'button';
    const unlocked = isUnlocked(opponentId, difficulty.key);
    fightButton.disabled = !unlocked;

    if (unlocked) {
        fightButton.textContent = 'Fight';
    } else {
        const lockIcon = document.createElement('img');
        lockIcon.src = new URL('../../images/icons/locked.png', import.meta.url).href;
        lockIcon.alt = '';
        lockIcon.className = 'fight-lock-icon';
        fightButton.setAttribute('aria-label', `${opponentName} locked`);
        fightButton.append(lockIcon, document.createTextNode('Locked'));
    }

    fightButton.addEventListener('click', () => {
        if (fightButton.disabled) {
            return;
        }

        const battleUrl = new URL('../../pages/battle.html', import.meta.url);
        battleUrl.searchParams.set('stage', stageId);
        battleUrl.searchParams.set('opponent', opponentId);
        battleUrl.searchParams.set('difficulty', difficulty.key);
        window.location.assign(battleUrl.href);
    });

    section.append(rewardOverview, fightButton);
    return section;
}

function createOpponentCard(
    stageId,
    opponentId,
    opponent,
    isUnlocked,
    stageDifficulties
) {
    const card = document.createElement('article');
    card.className = 'opponent-card';

    const header = document.createElement('header');
    header.className = 'opponent-card-heading';

    const name = document.createElement('h3');
    name.textContent = opponent.name;
    name.dataset.opponentName = opponent.name;

    const type = document.createElement('span');
    type.className = 'opponent-type';
    type.textContent = opponent.data.type;

    header.append(name, type);

    const details = document.createElement('div');
    details.className = 'opponent-difficulties';
    for (const difficulty of stageDifficulties) {
        details.append(
            createDifficultyDetails(
                stageId,
                opponentId,
                opponent.name,
                difficulty,
                opponent.data[difficulty.key],
                isUnlocked
            )
        );
    }

    card.append(header, details);
    return card;
}

function initializeStage(stageId) {
    const stage = opponentData[stageId];
    const stageDifficulties = difficulties.filter(({ key }) =>
        stage.order.every(opponentId =>
            stage.opponents[opponentId]?.data[key] !== undefined
        )
    );
    const stageButton = document.querySelector(`#${stageId}Btn`);
    const dialogId = {
        floral: 'sideDiv',
        coral: 'sideDiv2',
        fire: 'sideDiv3'
    }[stageId];
    const stageDialog = document.querySelector(`#${dialogId}`);
    const closeButton = stageDialog?.querySelector('.stage-dialog-close');
    const opponentList = stageDialog?.querySelector('.opponent-list');
    const opponentCount = stageDialog?.querySelector('.opponent-count');
    const progressCount = document.querySelector(`#${stageId}-stage-progress-count`);
    const progressFill = document.querySelector(`#${stageId}-stage-progress-fill`);
    const stageLockMessage = stageId === 'floral'
        ? null
        : document.querySelector(`#${stageId}-unlock-message`);
    const difficultyButtons = [...(stageDialog?.querySelectorAll('.difficulty-button') ?? [])];

    if (!(stageButton instanceof HTMLButtonElement) ||
        !(stageDialog instanceof HTMLDialogElement) ||
        !(closeButton instanceof HTMLButtonElement) ||
        !(opponentList instanceof HTMLElement) ||
        !(opponentCount instanceof HTMLElement) ||
        !(progressCount instanceof HTMLElement) ||
        !(progressFill instanceof HTMLElement) ||
        (stageId !== 'floral' && !(stageLockMessage instanceof HTMLElement)) ||
        difficultyButtons.length !== stageDifficulties.length ||
        difficultyButtons.some(button => !(button instanceof HTMLButtonElement))) {
        throw new Error(`Could not find the ${stageId} stage opponent display.`);
    }

    const opponents = stage.order.map(id => {
        const opponent = stage.opponents[id];
        if (!opponent) {
            throw new Error(`No ${stageId} opponent data exists for "${id}".`);
        }
        return { id, ...opponent };
    });
    opponentCount.textContent = String(opponents.length);
    const totalBattles = opponents.length * completionDifficulties.length;
    const defeatedCount = stage.defeatedCount();
    const stageUnlocked = stage.isStageUnlocked?.() ?? true;
    const completion = Math.round((defeatedCount / totalBattles) * 100);
    progressCount.textContent = `${completion}%`;
    progressFill.style.width = `${completion}%`;
    if (stageId !== 'floral') {
        stageLockMessage.hidden = stageUnlocked;
    }
    opponentList.append(...opponents.map(opponent =>
        createOpponentCard(
            stageId,
            opponent.id,
            opponent,
            stage.isUnlocked,
            stageDifficulties
        )
    ));

    function showDifficulty(difficultyKey) {
        const useErectName = difficultyKey === 'erect' || difficultyKey === 'nightmare';
        for (const name of opponentList.querySelectorAll(
            '.opponent-card-heading h3[data-opponent-name]'
        )) {
            const opponentName = name.dataset.opponentName;
            if (opponentName) {
                name.textContent = useErectName
                    ? `${opponentName} Erect`
                    : opponentName;
            }
        }

        for (const button of difficultyButtons) {
            const isSelected = button.dataset.difficulty === difficultyKey;
            button.setAttribute('aria-pressed', String(isSelected));
        }

        for (const details of opponentList.querySelectorAll('.opponent-difficulty')) {
            const isVisible = details.dataset.difficulty === difficultyKey;
            details.hidden = !isVisible;
            if (isVisible) {
                renderPossibleRewardCards(details);
            }
        }
    }

    showDifficulty(stageDifficulties[0].key);
    for (const button of difficultyButtons) {
        button.addEventListener('click', () => showDifficulty(button.dataset.difficulty));
    }

    async function renderPossibleRewardCards(container) {
        const cardTargets = container.querySelectorAll(
            '.opponent-reward-card-target[data-card-name]'
        );
        for (const target of cardTargets) {
            if (!(target instanceof HTMLElement) ||
                target.dataset.rendered === 'true' ||
                target.dataset.rendering === 'true') {
                continue;
            }
            target.dataset.rendering = 'true';
            try {
                await renderCharacter(target.dataset.cardName, target);
                target.dataset.rendered = 'true';
            } catch (error) {
                console.error('Could not render a possible first-time card reward.', error);
                const errorMessage = container.querySelector(
                    '.opponent-possible-reward-error'
                );
                if (errorMessage instanceof HTMLElement) {
                    errorMessage.textContent =
                        'Some possible card rewards could not be displayed.';
                }
            } finally {
                delete target.dataset.rendering;
            }
        }
    }

}

for (const stageId of ['floral', 'coral', 'fire']) {
    try {
        initializeStage(stageId);
    } catch (error) {
        console.error(`Could not initialize the ${stageId} stage.`, error);
    }
}
