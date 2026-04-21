import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import { createDialogueState, stepInteraction } from '../src/game/interaction';
import type { NpcState } from '../src/game/npc';
import type { PlayerState } from '../src/game/player';
import { createScriptRuntimeState, type ScriptHandler } from '../src/game/scripts';

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

const createTestNpc = (): NpcState => ({
  id: 'npc-test',
  position: vec2(4 * 16, 3 * 16),
  path: [{ x: 4 * 16, y: 3 * 16 }],
  pathIndex: 0,
  facing: 'left',
  moving: false,
  idleDurationSeconds: 0,
  idleTimeRemaining: 0,
  dialogueLines: ['Hello!', 'Second line'],
  dialogueIndex: 0
});

const createTestPlayer = (): PlayerState => ({
  position: vec2(3 * 16, 3 * 16),
  facing: 'right',
  moving: false,
  animationTime: 0
});

describe('interaction stepping', () => {
  test('opens dialogue with NPC directly in front and turns npc to face player', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const npc = createTestNpc();

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.text).toBe('Hello!');
    expect(dialogue.speakerId).toBe(npc.id);
    expect(npc.facing).toBe('left');
    expect(npc.dialogueIndex).toBe(1);
  });

  test('interaction advances dialogue and then closes on final press', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const npc = createTestNpc();

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16
    );
    expect(dialogue.active).toBe(true);
    expect(dialogue.text).toBe('Hello!');

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16
    );
    expect(dialogue.active).toBe(false);
    expect(dialogue.text).toBe('');
    expect(dialogue.speakerId).toBe(null);
    expect(dialogue.queue.length).toBe(0);
  });

  test('runs scripted npc interaction when script id is provided', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const npc = {
      ...createTestNpc(),
      interactScriptId: 'object.npc-test.interact',
      dialogueLines: ['Fallback text should not run']
    };
    const registry: Record<string, ScriptHandler> = {
      'object.npc-test.interact': ({ dialogue: d }) => {
        d.active = true;
        d.speakerId = 'npc-test';
        d.text = 'Scripted hello';
        d.queue = ['Scripted hello', 'Scripted bye'];
        d.queueIndex = 0;
      }
    };

    expect(dialogue.active).toBe(false);
    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime,
      registry
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.text).toBe('Scripted hello');
    expect(runtime.lastScriptId).toBe('object.npc-test.interact');
  });

  test('falls back to simple decomp dialogue for npc scripts without a custom handler', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const npc = {
      ...createTestNpc(),
      interactScriptId: 'Route2_ViridianForest_NorthEntrance_EventScript_Youngster',
      dialogueLines: []
    };

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.speakerId).toBe(npc.id);
    expect(dialogue.queue[0]).toContain('Many POK');
    expect(dialogue.queue[1]).toContain('persistent');
    expect(runtime.lastScriptId).toBe('Route2_ViridianForest_NorthEntrance_EventScript_Youngster');
  });

  test('can talk to an npc across a counter tile like FireRed object interactions', () => {
    const dialogue = createDialogueState();
    const player: PlayerState = {
      position: vec2(4 * 16, 4 * 16),
      facing: 'up',
      moving: false,
      animationTime: 0
    };
    const npc: NpcState = {
      ...createTestNpc(),
      position: vec2(4 * 16, 2 * 16),
      dialogueLines: ['Counter hello']
    };
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    tileBehaviors[3 * 8 + 4] = 0x80;

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      undefined,
      undefined,
      [],
      8,
      tileBehaviors
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.text).toBe('Counter hello');
    expect(dialogue.speakerId).toBe(npc.id);
  });

  test('runs original yes-no notebook flow from the decomp scripts', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const npc = {
      ...createTestNpc(),
      interactScriptId: 'ViridianCity_School_EventScript_Notebook',
      dialogueLines: []
    };

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );

    expect(dialogue.queue[0]).toContain("Let's check out the notebook.");

    for (let i = 0; i < 5; i += 1) {
      stepInteraction(
        dialogue,
        { ...neutralInput, interact: true, interactPressed: true },
        player,
        [npc],
        16,
        [],
        runtime
      );
    }

    expect(dialogue.text).toBe('Turn the page?');
    expect(dialogue.choice?.options).toEqual(['YES', 'NO']);

    stepInteraction(
      dialogue,
      { ...neutralInput, down: true, downPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );
    expect(dialogue.choice?.selectedIndex).toBe(1);

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );

    expect(dialogue.active).toBe(false);
    expect(dialogue.scriptSession).toBeNull();
  });

  test('runs original multichoice blackboard flow from the decomp scripts', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const npc = {
      ...createTestNpc(),
      interactScriptId: 'ViridianCity_School_EventScript_Blackboard',
      dialogueLines: []
    };

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );
    expect(dialogue.text).toContain('STATUS problems');

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );
    expect(dialogue.text).toBe('Which topic do you want to read?');
    expect(dialogue.choice?.options).toEqual(['SLP', 'PSN', 'PAR', 'BRN', 'FRZ', 'EXIT']);
    expect(dialogue.choice?.columns).toBe(3);

    stepInteraction(
      dialogue,
      { ...neutralInput, down: true, downPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );
    stepInteraction(
      dialogue,
      { ...neutralInput, right: true, rightPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );
    expect(dialogue.choice?.selectedIndex).toBe(4);

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );

    expect(dialogue.text).toContain('A frozen POK');
    expect(runtime.lastScriptId).toBe('ViridianCity_School_EventScript_Blackboard');
  });

  test('runs facing trigger when there is no npc in front', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const registry: Record<string, ScriptHandler> = {
      'sign.test': ({ dialogue: d }) => {
        d.active = true;
        d.speakerId = 'sign';
        d.text = 'Sign text';
      }
    };

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [],
      16,
      [{
        id: 't1',
        activation: 'interact',
        x: 4,
        y: 3,
        scriptId: 'sign.test',
        facing: 'any',
        once: false
      }],
      runtime,
      registry
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.speakerId).toBe('sign');
    expect(dialogue.text).toBe('Sign text');
    expect(runtime.lastScriptId).toBe('sign.test');
  });

  test('collects an item-ball npc into the shared bag and sets its hide flag', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const npc = {
      ...createTestNpc(),
      graphicsId: 'OBJ_EVENT_GFX_ITEM_BALL',
      itemId: 'ITEM_POTION',
      flag: 'FLAG_HIDE_TEST_POTION',
      dialogueLines: []
    };

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.text).toContain('Obtained POTION');
    expect(runtime.flags.has('FLAG_HIDE_TEST_POTION')).toBe(true);
    expect(runtime.bag.pockets.items).toEqual([{ itemId: 'ITEM_POTION', quantity: 1 }]);
  });
});
