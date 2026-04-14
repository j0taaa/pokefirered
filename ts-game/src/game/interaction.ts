import type { InputSnapshot } from '../input/inputState';
import { vec2, type Vec2 } from '../core/vec2';
import type { NpcState } from './npc';
import type { PlayerState } from './player';

export interface DialogueState {
  active: boolean;
  speakerId: string | null;
  text: string;
}

export const createDialogueState = (): DialogueState => ({
  active: false,
  speakerId: null,
  text: ''
});

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
  tileSize: number
): DialogueState => {
  if (!input.interactPressed) {
    return dialogue;
  }

  if (dialogue.active) {
    dialogue.active = false;
    dialogue.speakerId = null;
    dialogue.text = '';
    return dialogue;
  }

  const npc = findNpcInFront(player, npcs, tileSize);
  if (!npc || npc.dialogueLines.length === 0) {
    return dialogue;
  }

  // Matches the original field script behavior where the selected NPC turns to
  // face opposite the player's facing direction (Script_FacePlayer).
  npc.facing = oppositeFacing(player.facing);
  npc.moving = false;
  npc.idleTimeRemaining = Math.max(npc.idleTimeRemaining, 0.2);

  const line = npc.dialogueLines[npc.dialogueIndex % npc.dialogueLines.length];
  npc.dialogueIndex = (npc.dialogueIndex + 1) % npc.dialogueLines.length;

  dialogue.active = true;
  dialogue.speakerId = npc.id;
  dialogue.text = line;
  return dialogue;
};
