const stageScroller = document.querySelector('#adventureDiv');
const previousButton = document.querySelector('#previous-stage');
const nextButton = document.querySelector('#next-stage');

for (const [stageId, dialogId] of [
    ['floral', 'sideDiv'],
    ['coral', 'sideDiv2'],
    ['fire', 'sideDiv3']
]) {
    const stageButton = document.querySelector(`#${stageId}Btn`);
    const stageDialog = document.querySelector(`#${dialogId}`);
    const closeButton = stageDialog?.querySelector('.stage-dialog-close');

    if (!(stageButton instanceof HTMLButtonElement) ||
        !(stageDialog instanceof HTMLDialogElement) ||
        !(closeButton instanceof HTMLButtonElement)) {
        continue;
    }

    stageButton.addEventListener('click', () => {
        if (!stageDialog.open) {
            stageDialog.showModal();
        }
        stageButton.setAttribute('aria-expanded', 'true');
    });
    closeButton.addEventListener('click', () => stageDialog.close());
    stageDialog.addEventListener('close', () => {
        stageButton.setAttribute('aria-expanded', 'false');
        stageButton.focus();
    });
}

if (stageScroller instanceof HTMLElement &&
    previousButton instanceof HTMLButtonElement &&
    nextButton instanceof HTMLButtonElement) {
    const stages = [...stageScroller.querySelectorAll(
        ':scope > .floral-stage, :scope > .coral-stage, :scope > .fire-stage'
    )];

    function getCurrentStageIndex() {
        const scrollerCenter = stageScroller.getBoundingClientRect().left +
            stageScroller.clientWidth / 2;
        return stages.reduce((closestIndex, stage, index) => {
            const stageCenter = stage.getBoundingClientRect().left +
                stage.getBoundingClientRect().width / 2;
            const closestCenter = stages[closestIndex].getBoundingClientRect().left +
                stages[closestIndex].getBoundingClientRect().width / 2;
            return Math.abs(stageCenter - scrollerCenter) <
                Math.abs(closestCenter - scrollerCenter)
                ? index
                : closestIndex;
        }, 0);
    }

    function updateNavigation() {
        const currentIndex = getCurrentStageIndex();
        document.body.dataset.stage = stages[currentIndex]?.dataset.stage ?? 'floral';
        previousButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === stages.length - 1;
    }

    function scrollStage(direction) {
        const nextIndex = Math.max(
            0,
            Math.min(stages.length - 1, getCurrentStageIndex() + direction)
        );
        stages[nextIndex]?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
            block: 'nearest',
            inline: 'center'
        });
        window.setTimeout(updateNavigation, 350);
    }

    previousButton.addEventListener('click', () => scrollStage(-1));
    nextButton.addEventListener('click', () => scrollStage(1));
    stageScroller.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateNavigation);
    }, { passive: true });
    window.addEventListener('resize', updateNavigation);
    updateNavigation();
}
