import { order as floralOrder } from '../../data/floral/order.js';
import { issac } from '../../data/floral/opponents/issac.js?v=7';
import { lucas } from '../../data/floral/opponents/lucas.js?v=7';
import { lucy } from '../../data/floral/opponents/lucy.js?v=7';
import { order as coralOrder } from '../../data/coral/order.js';
import { liam } from '../../data/coral/opponents/liam.js?v=7';
import { lorah } from '../../data/coral/opponents/lorah.js?v=7';
import { marie } from '../../data/coral/opponents/marie.js?v=7';
import { zach } from '../../data/coral/opponents/zach.js?v=7';
import renderCharacter from '../utils/renderCharacter.js?v=21';
import { parseRewardChoice } from './rewardChoices.js?v=1';
import {
    getCoralDefeatedCount,
    getFloralDefeatedCount,
    isCoralOpponentUnlocked,
    isCoralStageUnlocked,
    isFloralOpponentUnlocked
} from './progression.js?v=3';

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
    }
};
const difficulties = [
    { key: 'easy', label: 'Easy' },
    { key: 'normal', label: 'Normal' },
    { key: 'hard', label: 'Hard' }
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

function createOpponentCard(stageId, opponentId, opponent, isUnlocked) {
    const card = document.createElement('article');
    card.className = 'opponent-card';

    const header = document.createElement('header');
    header.className = 'opponent-card-heading';

    const name = document.createElement('h3');
    name.textContent = opponent.name;

    const type = document.createElement('span');
    type.className = 'opponent-type';
    type.textContent = opponent.data.type;

    header.append(name, type);

    const details = document.createElement('div');
    details.className = 'opponent-difficulties';
    for (const difficulty of difficulties) {
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
    const stageButton = document.querySelector(`#${stageId}Btn`);
    const stageDialog = document.querySelector(`#${stageId === 'floral' ? 'sideDiv' : 'sideDiv2'}`);
    const closeButton = stageDialog?.querySelector('.stage-dialog-close');
    const opponentList = stageDialog?.querySelector('.opponent-list');
    const opponentCount = stageDialog?.querySelector('.opponent-count');
    const progressCount = document.querySelector(`#${stageId}-stage-progress-count`);
    const progressFill = document.querySelector(`#${stageId}-stage-progress-fill`);
    const stageLockMessage = stageId === 'coral'
        ? document.querySelector('#coral-unlock-message')
        : null;
    const difficultyButtons = [...(stageDialog?.querySelectorAll('.difficulty-button') ?? [])];

    if (!(stageButton instanceof HTMLButtonElement) ||
        !(stageDialog instanceof HTMLDialogElement) ||
        !(closeButton instanceof HTMLButtonElement) ||
        !(opponentList instanceof HTMLElement) ||
        !(opponentCount instanceof HTMLElement) ||
        !(progressCount instanceof HTMLElement) ||
        !(progressFill instanceof HTMLElement) ||
        (stageId === 'coral' && !(stageLockMessage instanceof HTMLElement)) ||
        difficultyButtons.length !== difficulties.length ||
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
    const totalBattles = opponents.length * difficulties.length;
    const defeatedCount = stage.defeatedCount();
    const stageUnlocked = stage.isStageUnlocked?.() ?? true;
    progressCount.textContent = `${defeatedCount} / ${totalBattles}`;
    progressFill.style.width = `${(defeatedCount / totalBattles) * 100}%`;
    if (stageId === 'coral') {
        stageButton.disabled = !stageUnlocked;
        stageLockMessage.hidden = stageUnlocked;
    }
    opponentCount.textContent = String(opponents.length);
    opponentList.append(...opponents.map(opponent =>
        createOpponentCard(stageId, opponent.id, opponent, stage.isUnlocked)
    ));

    function showDifficulty(difficultyKey) {
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

    showDifficulty('easy');
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

    stageButton.addEventListener('click', () => {
        stageDialog.showModal();
        stageButton.setAttribute('aria-expanded', 'true');
    });

    function resetStageDialogState() {
        stageButton.setAttribute('aria-expanded', 'false');
        stageButton.focus();
    }

    closeButton.addEventListener('click', () => {
        stageDialog.close();
        resetStageDialogState();
    });

    stageDialog.addEventListener('close', resetStageDialogState);
}

initializeStage('floral');
initializeStage('coral');
