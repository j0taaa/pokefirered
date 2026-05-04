import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import {
  runStepTriggersAtPlayerTile,
  runStrengthButtonTriggersAtTile,
  tryRunFacingTrigger,
  tryRunWalkIntoSignpostScript
} from '../src/game/triggers';
import { createDialogueState } from '../src/game/interaction';
import { stepDecompFieldDialogue } from '../src/game/decompFieldDialogue';
import { completeFieldTextPrinter } from '../src/game/decompFieldMessageBox';
import { createScriptRuntimeState, setScriptFlag, type ScriptHandler } from '../src/game/scripts';
import type { PlayerState } from '../src/game/player';

const player: PlayerState = {
  position: vec2(3 * 16, 3 * 16),
  facing: 'right',
  moving: false,
  animationTime: 0
};

const neutralInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  upPressed: false,
  downPressed: false,
  leftPressed: false,
  rightPressed: false,
  run: false,
  interact: false,
  interactPressed: false,
  start: false,
  startPressed: false,
  cancel: false,
  cancelPressed: false
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

  test('stops at the first step trigger that starts a script like TryStartCoordEventScript', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const registry: Record<string, ScriptHandler> = {
      first: ({ runtime: r }) => {
        r.vars.first = (r.vars.first ?? 0) + 1;
      },
      second: ({ runtime: r }) => {
        r.vars.second = (r.vars.second ?? 0) + 1;
      }
    };
    const triggers = [
      {
        id: 'first',
        x: 3,
        y: 3,
        activation: 'step' as const,
        scriptId: 'first',
        facing: 'any' as const,
        once: false
      },
      {
        id: 'second',
        x: 3,
        y: 3,
        activation: 'step' as const,
        scriptId: 'second',
        facing: 'any' as const,
        once: false
      }
    ];

    const didRun = runStepTriggersAtPlayerTile(triggers, player, 16, {
      player,
      dialogue,
      runtime,
      scriptRegistry: registry
    });

    expect(didRun).toBe(true);
    expect(runtime.vars.first).toBe(1);
    expect(runtime.vars.second).toBeUndefined();
  });

  test('continues to later step triggers when an earlier match has no runnable script', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const registry: Record<string, ScriptHandler> = {
      second: ({ runtime: r }) => {
        r.vars.second = (r.vars.second ?? 0) + 1;
      }
    };
    const triggers = [
      {
        id: 'missing',
        x: 3,
        y: 3,
        activation: 'step' as const,
        scriptId: 'missing',
        facing: 'any' as const,
        once: false
      },
      {
        id: 'second',
        x: 3,
        y: 3,
        activation: 'step' as const,
        scriptId: 'second',
        facing: 'any' as const,
        once: false
      }
    ];

    const didRun = runStepTriggersAtPlayerTile(triggers, player, 16, {
      player,
      dialogue,
      runtime,
      scriptRegistry: registry
    });

    expect(didRun).toBe(true);
    expect(runtime.vars.second).toBe(1);
  });

  test('runs Strength-button triggers by position without normal coord-event var gating', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    runtime.vars.VAR_MAP_SCENE_VICTORY_ROAD_2F_BOULDER1 = 0;
    const registry: Record<string, ScriptHandler> = {
      floorSwitch: ({ runtime: r }) => {
        r.vars.strengthSwitch = (r.vars.strengthSwitch ?? 0) + 1;
      }
    };

    const didRun = runStrengthButtonTriggersAtTile([
      {
        id: 'victory-road-switch',
        x: 2,
        y: 19,
        activation: 'step',
        scriptId: 'floorSwitch',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_VICTORY_ROAD_2F_BOULDER1',
        conditionEquals: 99
      }
    ], vec2(2, 19), { player, dialogue, runtime, scriptRegistry: registry });

    expect(didRun).toBe(true);
    expect(runtime.vars.strengthSwitch).toBe(1);
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

  test('matches step triggers by elevation with decomp wildcard semantics', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const elevatedPlayer: PlayerState = {
      ...player,
      currentElevation: 3,
      previousElevation: 3
    };
    const registry: Record<string, ScriptHandler> = {
      wrong: ({ runtime: r }) => {
        r.vars.wrong = 1;
      },
      exact: ({ runtime: r }) => {
        r.vars.exact = 1;
      }
    };

    const didRun = runStepTriggersAtPlayerTile([
      {
        id: 'wrong-elevation',
        x: 3,
        y: 3,
        elevation: 2,
        activation: 'step',
        scriptId: 'wrong',
        facing: 'any',
        once: false
      },
      {
        id: 'exact-elevation',
        x: 3,
        y: 3,
        elevation: 3,
        activation: 'step',
        scriptId: 'exact',
        facing: 'any',
        once: false
      }
    ], elevatedPlayer, 16, { player: elevatedPlayer, dialogue, runtime, scriptRegistry: registry });

    expect(didRun).toBe(true);
    expect(runtime.vars.wrong).toBeUndefined();
    expect(runtime.vars.exact).toBe(1);
  });

  test('lets elevation-zero triggers match any player elevation', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const elevatedPlayer: PlayerState = {
      ...player,
      currentElevation: 4,
      previousElevation: 4
    };
    const registry: Record<string, ScriptHandler> = {
      wildcard: ({ runtime: r }) => {
        r.vars.wildcard = 1;
      }
    };

    const didRun = runStepTriggersAtPlayerTile([
      {
        id: 'wildcard-elevation',
        x: 3,
        y: 3,
        elevation: 0,
        activation: 'step',
        scriptId: 'wildcard',
        facing: 'any',
        once: false
      }
    ], elevatedPlayer, 16, { player: elevatedPlayer, dialogue, runtime, scriptRegistry: registry });

    expect(didRun).toBe(true);
    expect(runtime.vars.wildcard).toBe(1);
  });

  test('matches facing triggers by front-position elevation', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const elevatedPlayer: PlayerState = {
      ...player,
      currentElevation: 3,
      previousElevation: 3
    };
    const registry: Record<string, ScriptHandler> = {
      sign: ({ dialogue: d }) => {
        d.active = true;
        d.text = 'elevated sign';
      }
    };

    expect(tryRunFacingTrigger([
      { id: 'wrong', x: 4, y: 3, elevation: 2, activation: 'interact', scriptId: 'sign', facing: 'any', once: false }
    ], elevatedPlayer, 16, { player: elevatedPlayer, dialogue, runtime, scriptRegistry: registry })).toBe(false);

    expect(tryRunFacingTrigger([
      { id: 'right', x: 4, y: 3, elevation: 3, activation: 'interact', scriptId: 'sign', facing: 'any', once: false }
    ], elevatedPlayer, 16, { player: elevatedPlayer, dialogue, runtime, scriptRegistry: registry })).toBe(true);
    expect(dialogue.text).toBe('elevated sign');
  });

  test('uses elevation zero for facing triggers when the player stands on a zero-elevation tile', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const elevatedPlayer: PlayerState = {
      ...player,
      currentElevation: 3,
      previousElevation: 3
    };
    const tileElevations = Array.from({ length: 8 * 8 }, () => 1);
    tileElevations[3 * 8 + 3] = 0;
    const registry: Record<string, ScriptHandler> = {
      sign: ({ dialogue: d }) => {
        d.active = true;
        d.text = 'zero-elevation sign';
      }
    };

    expect(tryRunFacingTrigger([
      { id: 'wrong', x: 4, y: 3, elevation: 3, activation: 'interact', scriptId: 'sign', facing: 'any', once: false }
    ], elevatedPlayer, 16, { player: elevatedPlayer, dialogue, runtime, scriptRegistry: registry }, 8, tileElevations)).toBe(false);

    expect(tryRunFacingTrigger([
      { id: 'right', x: 4, y: 3, elevation: 0, activation: 'interact', scriptId: 'sign', facing: 'any', once: false }
    ], elevatedPlayer, 16, { player: elevatedPlayer, dialogue, runtime, scriptRegistry: registry }, 8, tileElevations)).toBe(true);
    expect(dialogue.text).toBe('zero-elevation sign');
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
    expect(dialogue.text).toContain('found one PEARL');
    expect(runtime.flags.has('FLAG_HIDDEN_ITEM_TEST_PEARL')).toBe(false);
    expect(runtime.bag.pockets.items).toEqual([{ itemId: 'ITEM_PEARL', quantity: 1 }]);

    completeFieldTextPrinter(dialogue.fieldMessageBox);
    for (let i = 0; i < 256 && runtime.fieldAudio.fanfareTaskActive; i += 1) {
      stepDecompFieldDialogue(dialogue, neutralInput, runtime, player);
    }
    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(dialogue.text).toContain('put the PEARL');
    expect(runtime.flags.has('FLAG_HIDDEN_ITEM_TEST_PEARL')).toBe(false);

    completeFieldTextPrinter(dialogue.fieldMessageBox);
    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(runtime.flags.has('FLAG_HIDDEN_ITEM_TEST_PEARL')).toBe(true);
  });

  test('runs Poke Mart and Poke Center sign scripts when walking into signpost metatiles from below', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const northPlayer: PlayerState = {
      position: vec2(3 * 16, 4 * 16),
      facing: 'up',
      moving: false,
      animationTime: 0
    };
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    tileBehaviors[3 * 8 + 3] = 0x88;

    const didRun = tryRunWalkIntoSignpostScript(
      [],
      northPlayer,
      'up',
      16,
      { player: northPlayer, dialogue, runtime },
      8,
      tileBehaviors
    );

    expect(didRun).toBe(true);
    expect(runtime.lastScriptId).toBe('EventScript_PokemartSign');
    expect(dialogue.fieldMessageBox.frame).toBe('signpost');

    const pokecenterDialogue = createDialogueState();
    const pokecenterRuntime = createScriptRuntimeState();
    tileBehaviors[3 * 8 + 3] = 0x87;

    expect(tryRunWalkIntoSignpostScript(
      [],
      northPlayer,
      'up',
      16,
      { player: northPlayer, dialogue: pokecenterDialogue, runtime: pokecenterRuntime },
      8,
      tileBehaviors
    )).toBe(true);
    expect(pokecenterRuntime.lastScriptId).toBe('EventScript_PokecenterSign');
    expect(pokecenterDialogue.fieldMessageBox.frame).toBe('signpost');
  });

  test('runs scripted signpost bg event only for vertical walk-into-signpost movement', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const northPlayer: PlayerState = {
      position: vec2(3 * 16, 4 * 16),
      facing: 'up',
      moving: false,
      animationTime: 0
    };
    const eastPlayer: PlayerState = {
      ...northPlayer,
      facing: 'right'
    };
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    tileBehaviors[3 * 8 + 3] = 0x84;
    tileBehaviors[4 * 8 + 4] = 0x84;
    const registry: Record<string, ScriptHandler> = {
      'sign.walk': ({ dialogue: d }) => {
        d.active = true;
        d.speakerId = 'sign';
        d.text = 'walked into sign';
      }
    };
    const trigger = {
      id: 'scripted-sign',
      x: 3,
      y: 3,
      activation: 'interact' as const,
      scriptId: 'sign.walk',
      facing: 'any' as const,
      once: false
    };

    expect(tryRunWalkIntoSignpostScript(
      [trigger],
      eastPlayer,
      'right',
      16,
      { player: eastPlayer, dialogue, runtime, scriptRegistry: registry },
      8,
      tileBehaviors
    )).toBe(false);
    expect(tryRunWalkIntoSignpostScript(
      [trigger],
      northPlayer,
      'up',
      16,
      { player: northPlayer, dialogue, runtime, scriptRegistry: registry },
      8,
      tileBehaviors
    )).toBe(true);
    expect(dialogue.text).toBe('walked into sign');
  });

  test('does not run walk-into-signpost when held direction differs from facing', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const northPlayer: PlayerState = {
      position: vec2(3 * 16, 4 * 16),
      facing: 'up',
      moving: false,
      animationTime: 0
    };
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    tileBehaviors[3 * 8 + 3] = 0x88;

    const didRun = tryRunWalkIntoSignpostScript(
      [],
      northPlayer,
      'down',
      16,
      { player: northPlayer, dialogue, runtime },
      8,
      tileBehaviors
    );

    expect(didRun).toBe(false);
    expect(runtime.lastScriptId).toBeNull();
  });

  test('does not run walk-into-signpost while horizontal input is held', () => {
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const northPlayer: PlayerState = {
      position: vec2(3 * 16, 4 * 16),
      facing: 'up',
      moving: false,
      animationTime: 0
    };
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    tileBehaviors[3 * 8 + 3] = 0x88;

    const didRun = tryRunWalkIntoSignpostScript(
      [],
      northPlayer,
      'up',
      16,
      { player: northPlayer, dialogue, runtime },
      8,
      tileBehaviors,
      undefined,
      true
    );

    expect(didRun).toBe(false);
    expect(runtime.lastScriptId).toBeNull();
  });
});
