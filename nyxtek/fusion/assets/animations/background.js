const stageId = new URLSearchParams(window.location.search).get('stage');
const fallingObjectSources = stageId === 'coral'
    ? [new URL('../images/backgrounds/water2.png', import.meta.url).href]
    : [
        new URL('../images/backgrounds/leaf.png', import.meta.url).href,
        new URL('../images/backgrounds/leaf2.png', import.meta.url).href
    ];
const stateKey = stageId === 'coral'
    ? 'fusion-background-water'
    : 'fusion-background-leaves';

function randomBetween(minimum, maximum) {
    return minimum + Math.random() * (maximum - minimum);
}

function loadAnimationState() {
    try {
        const serializedState = sessionStorage.getItem(stateKey);
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
    const loadedFallingObjects = await Promise.all(fallingObjectSources.map(async source => {
        const image = new Image();
        image.src = source;
        await image.decode();
        return source;
    }));

    const layer = document.createElement('div');
    layer.className = 'background-leaves';
    layer.setAttribute('aria-hidden', 'true');
    document.body.prepend(layer);

    const animationState = loadAnimationState();
    const activeLeaves = new Map();

    function createLeaf(leafState) {
        const leaf = document.createElement('img');
        const horizontalDrift = leafState.horizontalDrift ?? 0;
        const transformAt = (x, y, rotation) => stageId === 'coral'
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
        const width = stageId === 'coral'
            ? randomBetween(32, 60)
            : randomBetween(44, 88);
        const startRotation = stageId === 'coral' ? 0 : randomBetween(0, 360);
        const now = Date.now();
        createLeaf({
            source: loadedFallingObjects[
                Math.floor(Math.random() * loadedFallingObjects.length)
            ],
            width,
            left: randomBetween(-width / 2, window.innerWidth - width / 2),
            top: -width,
            duration: randomBetween(5000, 9000),
            startRotation,
            endRotation: stageId === 'coral'
                ? 0
                : startRotation + randomBetween(-180, 180),
            fallDistance: window.innerHeight + width * 2,
            horizontalDrift: 0,
            startedAt: now
        });
    }

    let nextSpawnAt = animationState?.nextSpawnAt ?? Date.now() + randomBetween(450, 1500);
    for (const leafState of animationState?.leaves ?? []) {
        if (loadedFallingObjects.includes(leafState.source) &&
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

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        function scheduleNextLeaf() {
            window.setTimeout(() => {
                spawnLeaf();
                nextSpawnAt = Date.now() + randomBetween(450, 1500);
                scheduleNextLeaf();
            }, Math.max(0, nextSpawnAt - Date.now()));
        }
        scheduleNextLeaf();
    }

    window.addEventListener('pagehide', () => {
        try {
            sessionStorage.setItem(stateKey, JSON.stringify({
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
