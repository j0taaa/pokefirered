import { describe, expect, test } from 'vitest';
import {
  addScriptVar,
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
});
