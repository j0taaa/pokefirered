import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import { runStepTriggersAtPlayerTile, tryRunFacingTrigger } from '../src/game/triggers';
import { createDialogueState } from '../src/game/interaction';
import { createScriptRuntimeState, type ScriptHandler } from '../src/game/scripts';
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
});
