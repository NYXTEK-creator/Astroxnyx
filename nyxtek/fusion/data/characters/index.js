import { aquaChar } from './aqua.js';
import { astriChar } from './astri.js';
import { deweyChar } from './dewey.js';
import { demoniChar } from './demoni.js';
import { eliChar } from './eli.js';
import { electroChar } from './electro.js';
import { fitaChar } from './fita.js';
import { floriChar } from './flori.js';
import { flambaeChar } from './flambae.js';
import { floraChar } from './flora.js';
import { keraChar } from './kera.js';
import { lumiChar } from './lumi.js';
import { emberChar } from './ember.js';
import { mariChar } from './mari.js';
import { necroChar } from './necro.js';
import { noraChar } from './nora.js';
import { solareChar } from './solare.js';
import { psyChar } from './psy.js';
import { hemoChar } from './hemo.js';
import { lavaeChar } from './lavae.js';
import { hydroChar } from './hydro.js';
import { zythChar } from './zyth.js';
import { yinChar } from './yin.js';
import { yangChar } from './yang.js';
import { plasmiChar } from './plasmi.js';
import { devoChar } from './devo.js';
import { swampaChar } from './swampa.js';
import { ovaChar } from './ova.js';
import { aimaChar } from './aima.js';
import { magmoChar } from './magmo.js';
import { ioniChar } from './ioni.js';
import { helioChar } from './helio.js';
import { gassyChar } from './gassy.js';
import { hollyChar } from './holly.js';
import { magiChar } from './magi.js';
import { angiChar } from './angi.js';
import { flamboChar } from './flambo.js';
import { fysiChar } from './fysi.js';
import { vaporaChar } from './vapora.js';
import { siriChar } from './siri.js';
import { blazoChar } from './blazo.js';
import { blaziriChar } from './blaziri.js';
import { pheoChar } from './pheo.js';
import { leafiChar } from './leafi.js';
import { leafyxChar } from './leafyx.js';
import { shrubiChar } from './shrubi.js';
import { liquiChar } from './liqui.js';
import { riveraChar } from './rivera.js';
import { marineChar } from './marine.js';
import { zappitChar } from './zappit.js';
import { umbrinChar } from './umbrin.js';
import { glintChar } from './glint.js';
import { voltinChar } from './voltin.js';
import { shadewispChar } from './shadewisp.js';
import { rayletChar } from './raylet.js';
import { rappitChar } from './rappit.js';
import { umbraChar } from './umbra.js';
import { aurenChar } from './auren.js';
import { cindraChar } from './cindra.js';
import { pyrelChar } from './pyrel.js';
import { thornshadeChar } from './thornshade.js';
import { briarChar } from './briar.js';
import { nightbloomChar } from './nightbloom.js';
export const charactersByName = new Map([
    aquaChar, astriChar, deweyChar, demoniChar, eliChar, electroChar, fitaChar,
    floriChar, flambaeChar, floraChar, keraChar, lumiChar, emberChar, mariChar,
    necroChar, noraChar, solareChar, psyChar, hemoChar, lavaeChar, hydroChar,
    zythChar, yinChar, yangChar, plasmiChar, devoChar, swampaChar, ovaChar,
    aimaChar, magmoChar, ioniChar, helioChar, gassyChar, flamboChar, fysiChar,
    vaporaChar, siriChar, hollyChar, magiChar, angiChar, blazoChar, blaziriChar,
    pheoChar, leafiChar, leafyxChar, shrubiChar, liquiChar, riveraChar,
    marineChar, zappitChar, umbrinChar, glintChar, voltinChar,
    shadewispChar, rayletChar, rappitChar, umbraChar, aurenChar, cindraChar,
    pyrelChar, thornshadeChar, briarChar, nightbloomChar

].map(character => [character.charName.toLowerCase(), character]));

export function getCharacterByName(name) {
    return typeof name === 'string'
        ? charactersByName.get(name.toLowerCase())
        : undefined;
}
