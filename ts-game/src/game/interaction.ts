import type { InputSnapshot } from '../input/inputState';
import { vec2, type Vec2 } from '../core/vec2';
import type { NpcState } from './npc';
import type { PlayerState } from './player';
import type { TriggerZone } from '../world/mapSource';
import type { ScriptHandler, ScriptRuntimeState } from './scripts';
import { runScriptById } from './scripts';
import { tryRunFacingTrigger } from './triggers';

export interface DialogueState {
  active: boolean;
  speakerId: string | null;
  text: string;
  queue: string[];
  queueIndex: number;
}

export const createDialogueState = (): DialogueState => ({
  active: false,
  speakerId: null,
  text: '',
  queue: [],
  queueIndex: 0
});

export const openDialogueSequence = (
  dialogue: DialogueState,
  speakerId: string,
  lines: string[]
): void => {
  if (lines.length === 0) {
    dialogue.active = false;
    dialogue.speakerId = null;
    dialogue.text = '';
    dialogue.queue = [];
    dialogue.queueIndex = 0;
    return;
  }

  dialogue.active = true;
  dialogue.speakerId = speakerId;
  dialogue.queue = [...lines];
  dialogue.queueIndex = 0;
  dialogue.text = dialogue.queue[0];
};

export const closeDialogue = (dialogue: DialogueState): void => {
  dialogue.active = false;
  dialogue.speakerId = null;
  dialogue.text = '';
  dialogue.queue = [];
  dialogue.queueIndex = 0;
};

export const advanceDialogue = (dialogue: DialogueState): void => {
  if (!dialogue.active) {
    return;
  }

  const nextIndex = dialogue.queueIndex + 1;
  if (nextIndex >= dialogue.queue.length) {
    closeDialogue(dialogue);
    return;
  }

  dialogue.queueIndex = nextIndex;
  dialogue.text = dialogue.queue[nextIndex];
};

const facingVector = (facing: PlayerState['facing']): Vec2 => {
  switch (facing) {
    case 'up':
      return vec2(0, -1);
    case 'down':
      return vec2(0, 1);
    case 'left':
      return vec2(-1, 0);
    case 'right':
      return vec2(1, 0);
  }
};

const oppositeFacing = (facing: PlayerState['facing']): PlayerState['facing'] => {
  switch (facing) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
};

const toInteractionTile = (position: Vec2, tileSize: number): Vec2 =>
  vec2(
    Math.floor((position.x + 8) / tileSize),
    Math.floor((position.y + 12) / tileSize)
  );

const findNpcInFront = (
  player: PlayerState,
  npcs: NpcState[],
  tileSize: number
): NpcState | null => {
  const playerTile = toInteractionTile(player.position, tileSize);
  const direction = facingVector(player.facing);
  const targetTile = vec2(playerTile.x + direction.x, playerTile.y + direction.y);

  for (const npc of npcs) {
    const npcTile = toInteractionTile(npc.position, tileSize);
    if (npcTile.x === targetTile.x && npcTile.y === targetTile.y) {
      return npc;
    }
  }

  return null;
};

export const stepInteraction = (
  dialogue: DialogueState,
  input: InputSnapshot,
  player: PlayerState,
  npcs: NpcState[],
  tileSize: number,
  triggers: TriggerZone[] = [],
  runtime?: ScriptRuntimeState,
  scriptRegistry?: Record<string, ScriptHandler>
): DialogueState => {
  if (!input.interactPressed) {
    return dialogue;
  }

  if (dialogue.active) {
    // Mirrors the A-button message flow in the original field engine:
    // while a text printer is active, interaction advances message state before
    // returning to normal object-event processing.
    advanceDialogue(dialogue);
    return dialogue;
  }

  // Matches field_control_avatar.c interaction priority:
  // object events first, then background/facing triggers.
  const npc = findNpcInFront(player, npcs, tileSize);
  if (npc) {
    npc.facing = oppositeFacing(player.facing);
    npc.moving = false;
    npc.idleTimeRemaining = Math.max(npc.idleTimeRemaining, 0.2);

    if (runtime && npc.interactScriptId) {
      const ran = runScriptById(
        npc.interactScriptId,
        {
          player,
          dialogue,
          runtime
        },
        scriptRegistry
      );
      if (ran) {
        return dialogue;
      }
    }

    if (npc.dialogueLines.length > 0) {
      const line = npc.dialogueLines[npc.dialogueIndex % npc.dialogueLines.length];
      npc.dialogueIndex = (npc.dialogueIndex + 1) % npc.dialogueLines.length;

      openDialogueSequence(dialogue, npc.id, [line]);
    }
    return dialogue;
  }

  if (runtime) {
    tryRunFacingTrigger(triggers, player, tileSize, {
      player,
      dialogue,
      runtime,
      scriptRegistry
    });
  }

  return dialogue;
};
