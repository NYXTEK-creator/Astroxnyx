export function parseRewardChoice(reward) {
    if (typeof reward !== 'string') {
        throw new TypeError('Opponent reward choices must be strings.');
    }
    if (/^[a-z][a-z0-9-]*$/i.test(reward)) {
        return { type: 'card', name: reward.toLowerCase() };
    }

    const gemReward = /^([1-9]\d*)\s+(fire|water|nature|electric|dark|light)gems?$/i
        .exec(reward.trim());
    if (!gemReward) {
        throw new Error(`Opponent reward choice "${reward}" is invalid.`);
    }
    const amount = Number(gemReward[1]);
    if (!Number.isSafeInteger(amount)) {
        throw new RangeError(`Opponent reward choice "${reward}" is out of range.`);
    }
    return {
        type: 'gem',
        element: gemReward[2].toLowerCase(),
        amount
    };
}
