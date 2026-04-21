import type { InputSnapshot } from '../input/inputState';
import { vec2, type Vec2 } from '../core/vec2';
import type { NpcState } from './npc';
import type { PlayerState } from './player';
import type { TriggerZone } from '../world/mapSource';
import type { MapHiddenItemSource } from '../world/mapSource';
import { addBagItem, getBagPocketByItemId, getBagPocketLabel, getItemDefinition } from './bag';
import type { ScriptHandler, ScriptRuntimeState } from './scripts';
import { runScriptById, setScriptFlag } from './scripts';
import type { DialogueChoiceState, FieldScriptSessionState } from './decompFieldDialogue';
import { stepDecompFieldDialogue } from './decompFieldDialogue';
import { tryRunFacingTrigger } from './triggers';

export interface DialogueState {
  active: boolean;
  speakerId: string | null;
  text: string;
  queue: string[];
  queueIndex: number;
  choice: DialogueChoiceState | null;
  scriptSession: FieldScriptSessionState | null;
}

const MB_COUNTER = 0x80;

export const createDialogueState = (): DialogueState => ({
  active: false,
  speakerId: null,
  text: '',
  queue: [],
  queueIndex: 0,
  choice: null,
  scriptSession: null
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
  dialogue.choice = null;
  dialogue.scriptSession = null;
};

export const closeDialogue = (dialogue: DialogueState): void => {
  dialogue.active = false;
  dialogue.speakerId = null;
  dialogue.text = '';
  dialogue.queue = [];
  dialogue.queueIndex = 0;
  dialogue.choice = null;
  dialogue.scriptSession = null;
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

const getTileBehavior = (
  tileBehaviors: number[] | undefined,
  mapWidth: number | undefined,
  tile: Vec2
): number | null => {
  if (!tileBehaviors || !mapWidth || tile.x < 0 || tile.y < 0) {
    return null;
  }

  const index = tile.y * mapWidth + tile.x;
  return index >= 0 && index < tileBehaviors.length ? tileBehaviors[index] : null;
};

const findNpcInFront = (
  player: PlayerState,
  npcs: NpcState[],
  tileSize: number,
  mapWidth?: number,
  tileBehaviors?: number[]
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

  if (getTileBehavior(tileBehaviors, mapWidth, targetTile) !== MB_COUNTER) {
    return null;
  }

  const counterFarTile = vec2(targetTile.x + direction.x, targetTile.y + direction.y);
  for (const npc of npcs) {
    const npcTile = toInteractionTile(npc.position, tileSize);
    if (npcTile.x === counterFarTile.x && npcTile.y === counterFarTile.y) {
      return npc;
    }
  }

  return null;
};

const tryCollectNpcItem = (
  npc: NpcState,
  dialogue: DialogueState,
  runtime: ScriptRuntimeState
): boolean => {
  if (!npc.itemId) {
    return false;
  }

  const item = getItemDefinition(npc.itemId);
  const ok = addBagItem(runtime.bag, npc.itemId, 1);
  if (!ok) {
    openDialogueSequence(dialogue, 'system', ['Too bad! The BAG is full...']);
    runtime.lastScriptId = `item.obtain.failed.${npc.itemId.toLowerCase()}`;
    return true;
  }

  if (npc.flag && npc.flag !== '0') {
    setScriptFlag(runtime, npc.flag);
  }

  const pocketLabel = getBagPocketLabel(getBagPocketByItemId(npc.itemId) ?? 'items');
  openDialogueSequence(dialogue, 'system', [
    `Obtained ${item.name}!`,
    `${item.name} was put away in the ${pocketLabel}.`
  ]);
  runtime.lastScriptId = `item.obtain.${npc.itemId.toLowerCase()}`;
  return true;
};

export const stepInteraction = (
  dialogue: DialogueState,
  input: InputSnapshot,
  player: PlayerState,
  npcs: NpcState[],
  tileSize: number,
  triggers: TriggerZone[] = [],
  runtime?: ScriptRuntimeState,
  scriptRegistry?: Record<string, ScriptHandler>,
  hiddenItems: MapHiddenItemSource[] = [],
  mapWidth?: number,
  tileBehaviors?: number[]
): DialogueState => {
  if (dialogue.active) {
    if (runtime && stepDecompFieldDialogue(dialogue, input, runtime, player)) {
      return dialogue;
    }

    if (!input.interactPressed && !input.cancelPressed) {
      return dialogue;
    }

    // Mirrors the A-button message flow in the original field engine:
    // while a text printer is active, interaction advances message state before
    // returning to normal object-event processing.
    advanceDialogue(dialogue);
    return dialogue;
  }

  if (!input.interactPressed) {
    return dialogue;
  }

  // Matches field_control_avatar.c interaction priority:
  // object events first, then background/facing triggers.
  const npc = findNpcInFront(player, npcs, tileSize, mapWidth, tileBehaviors);
  if (npc) {
    npc.facing = oppositeFacing(player.facing);
    npc.moving = false;
    npc.idleTimeRemaining = Math.max(npc.idleTimeRemaining, 0.2);

    if (runtime && tryCollectNpcItem(npc, dialogue, runtime)) {
      return dialogue;
    }

    if (runtime && npc.interactScriptId) {
      const ran = runScriptById(
        npc.interactScriptId,
        {
          player,
          dialogue,
          runtime,
          speakerId: npc.id
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
      scriptRegistry,
      hiddenItems
    });
  }

  return dialogue;
};
