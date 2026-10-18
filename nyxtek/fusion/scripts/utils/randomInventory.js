import { aquaChar } from '../../data/characters/aqua.js';
import { astriChar } from '../../data/characters/astri.js';
import { eliChar } from '../../data/characters/eli.js';
import { fitaChar } from '../../data/characters/fita.js';
import { floriChar } from '../../data/characters/flori.js';
import { flambaeChar } from '../../data/characters/flambae.js';
import { flamboChar } from '../../data/characters/flambo.js';
import { floraChar } from '../../data/characters/flora.js';
import { keraChar } from '../../data/characters/kera.js';
import { lumiChar } from '../../data/characters/lumi.js';
import { emberChar } from '../../data/characters/ember.js';
import { mariChar } from '../../data/characters/mari.js';
import { necroChar } from '../../data/characters/necro.js';
import { noraChar } from '../../data/characters/nora.js';
import { deweyChar } from '../../data/characters/dewey.js';
import { demoniChar } from '../../data/characters/demoni.js';
import { solareChar } from '../../data/characters/solare.js';
import { siriChar } from '../../data/characters/siri.js';
import { psyChar } from '../../data/characters/psy.js';
import { hemoChar } from '../../data/characters/hemo.js';
import { lavaeChar } from '../../data/characters/lavae.js';
import { hydroChar } from '../../data/characters/hydro.js';
import { vaporaChar } from '../../data/characters/vapora.js';
import { electroChar } from '../../data/characters/electro.js';
import { zythChar } from '../../data/characters/zyth.js';
import { yinChar } from '../../data/characters/yin.js';
import { yangChar } from '../../data/characters/yang.js';
import { plasmiChar } from '../../data/characters/plasmi.js';
import { devoChar } from '../../data/characters/devo.js';
import { swampaChar } from '../../data/characters/swampa.js';
import { ovaChar } from '../../data/characters/ova.js';
import { aimaChar } from '../../data/characters/aima.js';
import { magmoChar } from '../../data/characters/magmo.js';
import { ioniChar } from '../../data/characters/ioni.js';
import { helioChar } from '../../data/characters/helio.js';
import { gassyChar } from '../../data/characters/gassy.js';
import { magiChar } from '../../data/characters/magi.js';
import { hollyChar } from '../../data/characters/holly.js';
import { angiChar } from '../../data/characters/angi.js';
import { blazoChar } from '../../data/characters/blazo.js';
import { blaziriChar } from '../../data/characters/blaziri.js';
import { pheoChar } from '../../data/characters/pheo.js';
import { leafiChar } from '../../data/characters/leafi.js';
import { leafyxChar } from '../../data/characters/leafyx.js';
import { shrubiChar } from '../../data/characters/shrubi.js'
import { liquiChar } from '../../data/characters/liqui.js';
import { riveraChar } from '../../data/characters/rivera.js';
import { marineChar } from '../../data/characters/marine.js';
import { zappitChar } from '../../data/characters/zappit.js';
import { umbrinChar } from '../../data/characters/umbrin.js';
import { glintChar } from '../../data/characters/glint.js';
import { voltinChar } from '../../data/characters/voltin.js';
import { shadewispChar } from '../../data/characters/shadewisp.js';
import { rayletChar } from '../../data/characters/raylet.js';
import { rappitChar } from '../../data/characters/rappit.js';
import { umbraChar } from '../../data/characters/umbra.js';
import { aurenChar } from '../../data/characters/auren.js';
import { cindraChar } from '../../data/characters/cindra.js';
import { pyrelChar } from '../../data/characters/pyrel.js';
import { fysiChar } from '../../data/characters/fysi.js';
import { thornshadeChar } from '../../data/characters/thornshade.js';
import { briarChar } from '../../data/characters/briar.js';
import { nightbloomChar } from '../../data/characters/nightbloom.js';
const charactersByName = new Map([
    aquaChar, astriChar, demoniChar, deweyChar, eliChar, electroChar, fitaChar,
    devoChar, gassyChar, helioChar, ioniChar, magmoChar, plasmiChar,
    flambaeChar, flamboChar, floraChar, floriChar, hemoChar, keraChar, lavaeChar,
    ovaChar,
    lumiChar, emberChar, mariChar, necroChar, noraChar, solareChar, siriChar,
    zythChar, hydroChar, vaporaChar, blazoChar, blaziriChar, pheoChar, leafiChar, leafyxChar, shrubiChar,
    liquiChar, riveraChar, marineChar, swampaChar, zappitChar, umbrinChar, glintChar,
    voltinChar, shadewispChar, rayletChar, rappitChar, umbraChar, aurenChar,
    cindraChar, pyrelChar, fysiChar, thornshadeChar, briarChar, nightbloomChar
].map(character => [character.charName.toLowerCase(), character]));

export function createRandomInventory(possibleCards, count) {
    if (!Number.isSafeInteger(count) || count < 1) {
        throw new RangeError('Opponent inventory count must be a positive safe integer.');
    }
    if (!Array.isArray(possibleCards) || possibleCards.length === 0) {
        throw new TypeError('Opponent possible cards must be a non-empty array.');
    }

    const candidates = possibleCards.map(candidate => {
        if (!candidate || typeof candidate !== 'object' ||
            typeof candidate.name !== 'string') {
            throw new TypeError(
                'Each opponent card must specify a name and level range.'
            );
        }
        const character = charactersByName.get(candidate.name.toLowerCase());
        if (!character) {
            throw new Error(`Unknown opponent card: "${candidate.name}".`);
        }
        if (!Number.isSafeInteger(candidate.minLevel) || candidate.minLevel < 1 ||
            !Number.isSafeInteger(candidate.maxLevel) ||
            candidate.maxLevel < candidate.minLevel ||
            candidate.maxLevel > character.rating * 10) {
            throw new RangeError(
                `Opponent level range for "${candidate.name}" is invalid.`
            );
        }
        const minCards = candidate.minCards === undefined ||
            (typeof candidate.minCards === 'string' &&
                candidate.minCards.toLowerCase() === 'none')
            ? 0
            : candidate.minCards;
        const maxCards = candidate.maxCards === 'none'
            ? count
            : candidate.maxCards === undefined ? count : candidate.maxCards;
        if (!Number.isSafeInteger(minCards) || minCards < 0 ||
            !Number.isSafeInteger(maxCards) || maxCards < minCards ||
            maxCards > count) {
            throw new RangeError(
                `Opponent card count range for "${candidate.name}" is invalid.`
            );
        }
        return {
            name: character.charName,
            minLevel: candidate.minLevel,
            maxLevel: candidate.maxLevel,
            minCards,
            maxCards
        };
    });

    const minimumCardCount = candidates.reduce(
        (total, candidate) => total + candidate.minCards,
        0
    );
    const maximumCardCount = candidates.reduce(
        (total, candidate) => total + candidate.maxCards,
        0
    );
    if (minimumCardCount > count || maximumCardCount < count) {
        throw new RangeError(
            'Opponent card count ranges cannot produce the requested inventory size.'
        );
    }

    const inventory = [];
    const cardCounts = new Map(candidates.map(candidate => [candidate, 0]));
    const addCard = candidate => {
        inventory.push({
            name: candidate.name,
            level: candidate.minLevel +
                Math.floor(Math.random() * (candidate.maxLevel - candidate.minLevel + 1))
        });
        cardCounts.set(candidate, cardCounts.get(candidate) + 1);
    };
    for (const candidate of candidates) {
        for (let index = 0; index < candidate.minCards; index += 1) {
            addCard(candidate);
        }
    }
    while (inventory.length < count) {
        const eligibleCandidates = candidates.filter(candidate =>
            cardCounts.get(candidate) < candidate.maxCards
        );
        const candidate =
            eligibleCandidates[Math.floor(Math.random() * eligibleCandidates.length)];
        addCard(candidate);
    }

    for (let index = inventory.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [inventory[index], inventory[swapIndex]] =
            [inventory[swapIndex], inventory[index]];
    }
    return inventory;
}
