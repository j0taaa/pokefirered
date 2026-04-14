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
  run: false,
  interact: false,
  interactPressed: false
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

  test('interaction toggles open dialogue closed on next press', () => {
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
});
