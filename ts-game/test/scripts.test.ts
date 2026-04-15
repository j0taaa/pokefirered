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
});
