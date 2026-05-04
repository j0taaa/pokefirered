import { describe, expect, test } from 'vitest';
import { getBagQuantity } from '../src/game/bag';
import { createDialogueState } from '../src/game/interaction';
import { createPlayer } from '../src/game/player';
import {
  createScriptRuntimeState,
  getRuntimeMoney,
  getScriptVar,
  isScriptFlagSet,
  prototypeScriptRegistry,
  runScriptById,
  setRuntimeMoney
} from '../src/game/scripts';

describe('Pewter Museum and tutor flows', () => {
  test('museum admission, OLD AMBER, and Seismic Toss update runtime state', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    setRuntimeMoney(runtime, 3000);
    expect(runScriptById('PewterCity_Museum_1F_EventScript_Scientist1', { player, dialogue, runtime }, prototypeScriptRegistry)).toBe(true);
    expect(getRuntimeMoney(runtime)).toBe(2950);
    expect(getScriptVar(runtime, 'VAR_MAP_SCENE_PEWTER_CITY_MUSEUM_1F')).toBe(1);

    expect(runScriptById('PewterCity_Museum_1F_EventScript_OldAmberScientist', { player, dialogue, runtime }, prototypeScriptRegistry)).toBe(true);
    expect(isScriptFlagSet(runtime, 'FLAG_GOT_OLD_AMBER')).toBe(true);
    expect(getBagQuantity(runtime.bag, 'ITEM_OLD_AMBER')).toBe(1);

    runtime.party[0] = { ...runtime.party[0]!, nickname: 'BLAZE', moves: ['SCRATCH'] };
    expect(runScriptById('PewterCity_Museum_1F_EventScript_SeismicTossTutor', { player, dialogue, runtime }, prototypeScriptRegistry)).toBe(true);
    expect(isScriptFlagSet(runtime, 'FLAG_TUTOR_SEISMIC_TOSS')).toBe(true);
    expect(runtime.party[0]?.moves).toContain('SEISMIC TOSS');
  });
});
