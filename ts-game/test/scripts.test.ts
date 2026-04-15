import { describe, expect, test } from 'vitest';
import {
  addScriptVar,
  addBagItem,
  checkBagHasSpace,
  clearScriptFlag,
  createScriptRuntimeState,
  getScriptVar,
  isScriptFlagSet,
  prototypeScriptRegistry,
  runScriptById,
  setScriptFlag,
  setScriptVar
} from '../src/game/scripts';
import { createDialogueState } from '../src/game/interaction';
import { createPlayer } from '../src/game/player';

describe('script runtime helpers', () => {
  test('supports var reads/writes and increments', () => {
    const runtime = createScriptRuntimeState();
    expect(getScriptVar(runtime, 'counter')).toBe(0);
    expect(runtime.saveCounter).toBe(0);

    setScriptVar(runtime, 'counter', 5);
    expect(getScriptVar(runtime, 'counter')).toBe(5);

    const next = addScriptVar(runtime, 'counter', 3);
    expect(next).toBe(8);
    expect(getScriptVar(runtime, 'counter')).toBe(8);
  });

  test('supports setting and clearing script flags', () => {
    const runtime = createScriptRuntimeState();
    expect(isScriptFlagSet(runtime, 'story.route-warning')).toBe(false);

    setScriptFlag(runtime, 'story.route-warning');
    expect(isScriptFlagSet(runtime, 'story.route-warning')).toBe(true);

    clearScriptFlag(runtime, 'story.route-warning');
    expect(isScriptFlagSet(runtime, 'story.route-warning')).toBe(false);
  });

  test('mirrors FRLG bag item stack space checks for route gifts', () => {
    const runtime = createScriptRuntimeState();

    expect(checkBagHasSpace(runtime, 'ITEM_POTION', 1)).toBe(true);
    expect(addBagItem(runtime, 'ITEM_POTION', 1)).toBe(true);
    expect(runtime.bag.items.ITEM_POTION).toBe(1);

    runtime.bag.items.ITEM_POTION = 999;
    expect(checkBagHasSpace(runtime, 'ITEM_POTION', 1)).toBe(false);
    expect(addBagItem(runtime, 'ITEM_POTION', 1)).toBe(false);
  });

  test('supports object-event style flag/var branching in npc scripts', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('object.npc-lass-01.interact', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(isScriptFlagSet(runtime, 'npc.lass01.introSeen')).toBe(true);
    expect(dialogue.text).toContain('The grass rustles');

    runtime.vars.routeWarningSeen = 2;
    runScriptById('object.npc-lass-01.interact', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue[1]).toContain('eastern wind');
  });

  test('Route 1 mart clerk gives one Potion then follows flag branch', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('Route1_EventScript_MartClerk', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(runtime.bag.items.ITEM_POTION).toBe(1);
    expect(isScriptFlagSet(runtime, 'FLAG_GOT_POTION_ON_ROUTE_1')).toBe(true);
    expect(dialogue.queue.at(-1)).toContain('POTION');

    runScriptById('Route1_EventScript_MartClerk', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(runtime.bag.items.ITEM_POTION).toBe(1);
    expect(dialogue.text).toContain('POKE BALLS');
  });

  test('Pallet Town sign scripts mirror original text and side effects', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('PalletTown_EventScript_TownSign', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.text).toBe('PALLET TOWN');
    expect(dialogue.queue[1]).toContain('Shades of your journey');

    runScriptById('PalletTown_EventScript_PlayersHouseSign', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.text).toBe("PLAYER's house");

    runScriptById('PalletTown_EventScript_TrainerTips', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.text).toBe('TRAINER TIPS');
    expect(dialogue.queue[1]).toContain('Press START');
    expect(getScriptVar(runtime, 'VAR_MAP_SCENE_PALLET_TOWN_SIGN_LADY')).toBe(1);
  });

  test('Pallet Town NPC scripts follow the original branch cues', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('PalletTown_EventScript_FatMan', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.text).toContain('Technology is incredible');

    runScriptById('PalletTown_EventScript_SignLady', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.text).toContain('Hmm');

    setScriptVar(runtime, 'VAR_MAP_SCENE_PALLET_TOWN_SIGN_LADY', 2);
    runScriptById('PalletTown_EventScript_SignLady', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.text).toContain('raising POKEMON');
  });

  test('Pallet Town coord scripts update original scene variables and flags', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('PalletTown_EventScript_OakTriggerRight', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(getScriptVar(runtime, 'VAR_TEMP_1')).toBe(1);
    expect(getScriptVar(runtime, 'VAR_MAP_SCENE_PALLET_TOWN_OAK')).toBe(1);
    expect(isScriptFlagSet(runtime, 'FLAG_HIDE_OAK_IN_PALLET_TOWN')).toBe(true);
    expect(dialogue.text).toContain('OAK');

    setScriptVar(runtime, 'VAR_TEMP_2', 1);
    runScriptById('PalletTown_EventScript_SignLadyTrigger', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(getScriptVar(runtime, 'VAR_MAP_SCENE_PALLET_TOWN_SIGN_LADY')).toBe(1);
    expect(isScriptFlagSet(runtime, 'FLAG_OPENED_START_MENU')).toBe(true);
    expect(dialogue.queue.at(-1)).toContain('Press START');
  });

  test('Viridian City sign and NPC scripts mirror original branch cues', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('ViridianCity_EventScript_CitySign', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.text).toBe('VIRIDIAN CITY');
    expect(dialogue.queue[1]).toContain('Eternally Green');

    runScriptById('ViridianCity_EventScript_TrainerTips2', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.text).toBe('TRAINER TIPS');
    expect(dialogue.queue[1]).toContain('POWER POINTS');

    runScriptById('ViridianCity_EventScript_Woman', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.text).toContain('Grandpa');

    setScriptVar(runtime, 'VAR_MAP_SCENE_VIRIDIAN_CITY_OLD_MAN', 2);
    runScriptById('ViridianCity_EventScript_Woman', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.text).toContain('PEWTER CITY');
  });

  test('Viridian City old man tutorial script updates scene and gives Teachy TV', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    setScriptVar(runtime, 'VAR_MAP_SCENE_VIRIDIAN_CITY_OLD_MAN', 1);
    runScriptById('ViridianCity_EventScript_TutorialOldMan', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(getScriptVar(runtime, 'VAR_MAP_SCENE_VIRIDIAN_CITY_OLD_MAN')).toBe(2);
    expect(runtime.bag.items.ITEM_TEACHY_TV).toBe(1);
    expect(dialogue.queue).toContain('PLAYER received the TEACHY TV.');
  });

  test('Viridian City item ball follows finditem flag and bag branches', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('ViridianCity_EventScript_ItemPotion', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(runtime.bag.items.ITEM_POTION).toBe(1);
    expect(isScriptFlagSet(runtime, 'FLAG_HIDE_VIRIDIAN_CITY_POTION')).toBe(true);
    expect(dialogue.text).toContain('POTION');

    runScriptById('ViridianCity_EventScript_ItemPotion', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(runtime.bag.items.ITEM_POTION).toBe(1);
    expect(dialogue.text).toContain('nothing');
  });
});
