import { blood } from './blood.js';
import { angel } from './angel.js';
import { dark } from './dark.js';
import { dew } from './dew.js';
import { demon } from './demon.js';
import { duality_dark } from './duality_dark.js';
import { duality_light } from './duality_light.js';
import { electric } from './electric.js';
import { fire } from './fire.js';
import { flower } from './flower.js';
import { lava } from './lava.js';
import { light } from './light.js';
import { nature } from './nature.js';
import { plasma } from './plasma.js';
import { psychic } from './psychic.js';
import { solar } from './solar.js';
import { steam } from './steam.js';
import { water } from './water.js';
import { vine } from './vine.js';

export const typesByName = new Map([
    ['angel', angel], ['blood', blood], ['dark', dark], ['dew', dew], ['demon', demon],
    ['duality_dark', duality_dark], ['duality_light', duality_light],
    ['electric', electric], ['fire', fire], ['flower', flower], ['lava', lava],
    ['light', light], ['nature', nature], ['plasma', plasma],
    ['psychic', psychic], ['solar', solar], ['steam', steam], ['vine', vine],
    ['water', water]
]);
