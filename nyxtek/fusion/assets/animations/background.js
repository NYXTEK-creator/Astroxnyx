const stageQuery = new URLSearchParams(window.location.search).get('stage');
const difficultyQuery = new URLSearchParams(window.location.search).get('difficulty');
const isErectBattle = difficultyQuery === 'erect' || difficultyQuery === 'nightmare';
if (isErectBattle) {
    const erectBackground = new URL(
        '../images/backgrounds/defaulterect.png',
        import.meta.url
    ).href;
    document.documentElement.dataset.difficulty = difficultyQuery;
    document.documentElement.style.backgroundImage = `url("${erectBackground}")`;
    document.documentElement.style.backgroundPosition = 'center';
    document.documentElement.style.backgroundRepeat = 'no-repeat';
    document.documentElement.style.backgroundSize = 'cover';
}
const validStageIds = ['default', 'floral', 'coral', 'fire'];

function getCurrentStageId() {
    if (!stageQuery && document.body.classList.contains('adventure-page')) {
        return 'default';
    }
    const requestedStageId = stageQuery ?? document.body.dataset.stage;
    return validStageIds.includes(requestedStageId) ? requestedStageId : 'default';
}

let stageId = getCurrentStageId();
const fallingObjectSourcesByStage = {
    default: [
        new URL('../images/backgrounds/leaf.png', import.meta.url).href,
        new URL('../images/backgrounds/leaf2.png', import.meta.url).href
    ],
    floral: [
        new URL('../images/backgrounds/leaf.png', import.meta.url).href,
        new URL('../images/backgrounds/leaf2.png', import.meta.url).href
    ],
    coral: [new URL('../images/backgrounds/water2.png', import.meta.url).href],
    fire: [
        new URL('../images/backgrounds/flame1.png', import.meta.url).href,
        new URL('../images/backgrounds/flame2.png', import.meta.url).href
    ]
};
function getStateKey(stage) {
    if (isErectBattle) {
        return `fusion-background-erect-${stage}`;
    }
    return stage === 'coral'
        ? 'fusion-background-water'
        : stage === 'fire'
            ? 'fusion-background-fire'
            : 'fusion-background-leaves';
}

function getFallingObjectSources(stage) {
    if (isErectBattle) {
        return [
            new URL('../images/backgrounds/leaf1erect.png', import.meta.url).href,
            new URL('../images/backgrounds/leaf2erect.png', import.meta.url).href
        ];
    }
    return fallingObjectSourcesByStage[stage] ?? fallingObjectSourcesByStage.default;
}

function randomBetween(minimum, maximum) {
    return minimum + Math.random() * (maximum - minimum);
}

function loadAnimationState(stage) {
    try {
        const serializedState = sessionStorage.getItem(getStateKey(stage));
        if (!serializedState) {
            return null;
        }

        const state = JSON.parse(serializedState);
        if (!Array.isArray(state.leaves) || !Number.isFinite(state.nextSpawnAt)) {
            throw new Error('Saved background animation state is invalid.');
        }
        return state;
    } catch (error) {
        console.error('Background animation state could not be restored.', error);
        return null;
    }
}

async function startLeafFall() {
    const sourcesToLoad = getFallingObjectSources(stageId);
    await Promise.all(sourcesToLoad.map(async source => {
        const image = new Image();
        image.src = source;
        await image.decode();
    }));

    const layer = document.createElement('div');
    layer.className = 'background-leaves';
    layer.setAttribute('aria-hidden', 'true');
    document.body.prepend(layer);

    stageId = getCurrentStageId();
    const animationState = loadAnimationState(stageId);
    const stageSources = getFallingObjectSources(stageId);
    const activeLeaves = new Map();
    let nextSpawnAt = animationState?.nextSpawnAt ??
        Date.now() + randomBetween(450, 1500);
    let spawnTimer = 0;

    function createLeaf(leafState) {
        const leaf = document.createElement('img');
        const leafStage = leafState.stageId ?? stageId;
        const isCoralStage = leafStage === 'coral';
        const horizontalDrift = leafState.horizontalDrift ?? 0;
        const transformAt = (x, y, rotation) => isCoralStage
            ? `translate(${x}px, ${y}px)`
            : `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
        leaf.src = leafState.source;
        leaf.alt = '';
        leaf.draggable = false;
        leaf.style.width = `${leafState.width}px`;
        leaf.style.left = `${leafState.left}px`;
        leaf.style.top = `${leafState.top}px`;
        layer.append(leaf);

        const rotationAtFadeIn = leafState.startRotation +
            (leafState.endRotation - leafState.startRotation) * 0.12;
        const animation = leaf.animate([
            {
                transform: transformAt(0, 0, leafState.startRotation),
                opacity: 0
            },
            {
                transform: transformAt(
                    horizontalDrift * 0.12,
                    leafState.fallDistance * 0.12,
                    rotationAtFadeIn
                ),
                opacity: 1,
                offset: 0.12
            },
            {
                transform: transformAt(
                    horizontalDrift,
                    leafState.fallDistance,
                    leafState.endRotation
                ),
                opacity: 0.9
            }
        ], {
            duration: leafState.duration,
            easing: 'linear'
        });

        activeLeaves.set(leaf, leafState);
        animation.onfinish = () => {
            activeLeaves.delete(leaf);
            leaf.remove();
        };

        const elapsed = Date.now() - leafState.startedAt;
        if (elapsed >= leafState.duration) {
            activeLeaves.delete(leaf);
            leaf.remove();
        } else {
            animation.currentTime = Math.max(0, elapsed);
        }
    }

    function spawnLeaf() {
        const isCoralStage = stageId === 'coral';
        const isFireStage = stageId === 'fire';
        const width = isCoralStage
            ? randomBetween(32, 60)
            : isFireStage
                ? randomBetween(38, 68)
                : randomBetween(44, 88);
        const startRotation = isCoralStage ? 0 : randomBetween(0, 360);
        const now = Date.now();
        createLeaf({
            stageId,
            source: stageSources[
                Math.floor(Math.random() * stageSources.length)
            ],
            width,
            left: randomBetween(-width / 2, window.innerWidth - width / 2),
            top: -width,
            duration: randomBetween(5000, 9000),
            startRotation,
            endRotation: isCoralStage
                ? 0
                : startRotation + randomBetween(-180, 180),
            fallDistance: window.innerHeight + width * 2,
            horizontalDrift: 0,
            startedAt: now
        });
    }

    for (const leafState of animationState?.leaves ?? []) {
        if ((leafState.stageId === undefined || leafState.stageId === stageId) &&
            stageSources.includes(leafState.source) &&
            Number.isFinite(leafState.startedAt) &&
            Number.isFinite(leafState.duration) &&
            Number.isFinite(leafState.width) &&
            Number.isFinite(leafState.left) &&
            Number.isFinite(leafState.top) &&
            Number.isFinite(leafState.fallDistance) &&
            Number.isFinite(leafState.horizontalDrift ?? 0) &&
            Number.isFinite(leafState.startRotation) &&
            Number.isFinite(leafState.endRotation)) {
            createLeaf(leafState);
        }
    }

    const motionAllowed = !window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;
    function scheduleNextLeaf() {
        spawnTimer = window.setTimeout(() => {
            spawnLeaf();
            nextSpawnAt = Date.now() + randomBetween(450, 1500);
            scheduleNextLeaf();
        }, Math.max(0, nextSpawnAt - Date.now()));
    }
    if (motionAllowed) {
        scheduleNextLeaf();
    }

    window.addEventListener('pagehide', () => {
        try {
            sessionStorage.setItem(getStateKey(stageId), JSON.stringify({
                nextSpawnAt,
                leaves: [...activeLeaves.values()]
            }));
        } catch (error) {
            console.error('Background animation state could not be saved.', error);
        }
    });
}

startLeafFall().catch(error => {
    console.error('Background leaves could not be loaded.', error);
});
