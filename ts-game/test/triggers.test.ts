import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import { runStepTriggersAtPlayerTile, tryRunFacingTrigger } from '../src/game/triggers';
import { createDialogueState } from '../src/game/interaction';
import { createScriptRuntimeState, setScriptFlag, type ScriptHandler } from '../src/game/scripts';
import type { PlayerState } from '../src/game/player';

const player: PlayerState = {
  position: vec2(3 * 16, 3 * 16),
  facing: 'right',
  moving: false,
  animationTime: 0
};

describe('trigger execution', () => {
  test('runs facing trigger for tile in front of player', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const registry: Record<string, ScriptHandler> = {
      hi: ({ dialogue: d }) => {
        d.active = true;
        d.speakerId = 'system';
        d.text = 'hello';
      }
    };

    const didRun = tryRunFacingTrigger([
      { id: 'a', x: 4, y: 3, activation: 'interact', scriptId: 'hi', facing: 'any', once: false }
    ], player, 16, { player, dialogue, runtime, scriptRegistry: registry });

    expect(didRun).toBe(true);
    expect(dialogue.text).toBe('hello');
  });

  test('runs one-shot step trigger only once', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const registry: Record<string, ScriptHandler> = {
      step: ({ runtime: r }) => {
        r.vars.counter = (r.vars.counter ?? 0) + 1;
      }
    };

    const trigger = {
      id: 'step-once',
      x: 3,
      y: 3,
      activation: 'step' as const,
      scriptId: 'step',
      facing: 'any' as const,
      once: true
    };

    runStepTriggersAtPlayerTile([trigger], player, 16, { player, dialogue, runtime, scriptRegistry: registry });
    runStepTriggersAtPlayerTile([trigger], player, 16, { player, dialogue, runtime, scriptRegistry: registry });

    expect(runtime.vars.counter).toBe(1);
  });

  test('supports extended var and flag conditions', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    runtime.vars.progress = 3;
    const registry: Record<string, ScriptHandler> = {
      gated: ({ runtime: r }) => {
        r.vars.didRun = 1;
      }
    };
    const trigger = {
      id: 'extended-condition',
      x: 3,
      y: 3,
      activation: 'step' as const,
      scriptId: 'gated',
      facing: 'any' as const,
      once: false,
      conditions: [
        { var: 'progress', op: 'gte' as const, value: 2 },
        { flag: 'cutscene.done', flagState: false }
      ]
    };

    runStepTriggersAtPlayerTile([trigger], player, 16, { player, dialogue, runtime, scriptRegistry: registry });
    expect(runtime.vars.didRun).toBe(1);

    setScriptFlag(runtime, 'cutscene.done');
    runtime.vars.didRun = 0;
    runStepTriggersAtPlayerTile([trigger], player, 16, { player, dialogue, runtime, scriptRegistry: registry });
    expect(runtime.vars.didRun).toBe(0);
  });

  test('collects hidden items through decomp-style hidden-item triggers', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const trigger = {
      id: 'FLAG_HIDDEN_ITEM_TEST_PEARL.hiddenItem',
      x: 4,
      y: 3,
      activation: 'interact' as const,
      scriptId: 'FLAG_HIDDEN_ITEM_TEST_PEARL.hiddenItem',
      facing: 'any' as const,
      once: true,
      conditions: [{ flag: 'FLAG_HIDDEN_ITEM_TEST_PEARL', flagState: false }]
    };

    const didRun = tryRunFacingTrigger([trigger], player, 16, {
      player,
      dialogue,
      runtime,
      hiddenItems: [{
        x: 4,
        y: 3,
        item: 'ITEM_PEARL',
        flag: 'FLAG_HIDDEN_ITEM_TEST_PEARL',
        quantity: 1,
        elevation: 0,
        underfoot: false
      }]
    });

    expect(didRun).toBe(true);
    expect(dialogue.text).toContain('Obtained PEARL');
    expect(runtime.flags.has('FLAG_HIDDEN_ITEM_TEST_PEARL')).toBe(true);
    expect(runtime.bag.pockets.items).toEqual([{ itemId: 'ITEM_PEARL', quantity: 1 }]);
  });
});
