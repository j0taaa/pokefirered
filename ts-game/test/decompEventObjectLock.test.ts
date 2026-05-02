import { describe, expect, test } from 'vitest';
import {
  ClearPlayerHeldMovementAndUnfreezeObjectEvents,
  FreezeObjects_WaitForPlayer,
  FreezeObjects_WaitForPlayerAndSelected,
  IsFreezePlayerFinished,
  IsFreezeSelectedObjectAndPlayerFinished,
  Script_ClearHeldMovement,
  Script_FacePlayer,
  Task_WaitPlayerAndTargetNPCStopMoving,
  Task_WaitPlayerStopMoving,
  UnionRoom_UnlockPlayerAndChatPartner,
  clearPlayerHeldMovementAndUnfreezeObjectEvents,
  createEventObjectLockState,
  freezeObjectsWaitForPlayerAndSelected,
  isFreezeSelectedObjectAndPlayerFinished,
  scriptFacePlayer,
  setSelectedObjectEvent,
  tickEventObjectLock,
  walkrun_is_standing_still
} from '../src/game/decompEventObjectLock';
import type { NpcState } from '../src/game/npc';
import { createPlayer } from '../src/game/player';

const createNpc = (id: string): NpcState => ({
  id,
  position: { x: 0, y: 0 },
  path: [],
  pathIndex: 0,
  facing: 'down',
  moving: false,
  idleDurationSeconds: 0,
  idleTimeRemaining: 0,
  dialogueLines: [],
  dialogueIndex: 0
});

describe('decompEventObjectLock', () => {
  test('waits for the player and selected object before completing a lock command', () => {
    const lockState = createEventObjectLockState();
    const player = createPlayer();
    player.moving = true;

    const selectedNpc = createNpc('selected');
    selectedNpc.moving = true;
    const bystanderNpc = createNpc('bystander');

    setSelectedObjectEvent(lockState, selectedNpc.id);
    freezeObjectsWaitForPlayerAndSelected(lockState, [selectedNpc, bystanderNpc]);

    expect(lockState.frozenObjectEventIds.has(bystanderNpc.id)).toBe(true);
    expect(lockState.frozenObjectEventIds.has(selectedNpc.id)).toBe(false);
    expect(isFreezeSelectedObjectAndPlayerFinished(lockState, player)).toBe(false);

    selectedNpc.moving = false;
    tickEventObjectLock(lockState, player, [selectedNpc, bystanderNpc]);
    expect(lockState.frozenObjectEventIds.has(selectedNpc.id)).toBe(true);
    expect(isFreezeSelectedObjectAndPlayerFinished(lockState, player)).toBe(false);

    player.moving = false;
    tickEventObjectLock(lockState, player, [selectedNpc, bystanderNpc]);
    expect(isFreezeSelectedObjectAndPlayerFinished(lockState, player)).toBe(true);
    expect(player.moving).toBe(false);
  });

  test('faces the selected object toward the player and clears held movement on release', () => {
    const lockState = createEventObjectLockState();
    const player = createPlayer();
    player.facing = 'left';
    player.moving = true;
    player.stepTarget = { x: 16, y: 16 };
    player.stepDirection = 'left';
    player.stepSpeed = 54;

    const selectedNpc = createNpc('selected');
    selectedNpc.facing = 'down';

    setSelectedObjectEvent(lockState, selectedNpc.id);
    lockState.frozenObjectEventIds.add(selectedNpc.id);

    scriptFacePlayer(lockState, player, [selectedNpc]);
    expect(selectedNpc.facing).toBe('right');

    clearPlayerHeldMovementAndUnfreezeObjectEvents(lockState, player);
    expect(lockState.frozenObjectEventIds.size).toBe(0);
    expect(player.stepTarget).toBeUndefined();
  });

  test('exact C-name exports mirror player wait, selected NPC wait, and unlock helpers', () => {
    const lockState = createEventObjectLockState();
    const player = createPlayer();
    const selectedNpc = createNpc('selected');
    const bystanderNpc = createNpc('bystander');

    player.avatarTileTransitionState = 'tileTransition';
    expect(walkrun_is_standing_still(player)).toBe(false);
    player.avatarTileTransitionState = 'tileCenter';
    expect(walkrun_is_standing_still(player)).toBe(true);

    FreezeObjects_WaitForPlayer(lockState, [selectedNpc, bystanderNpc]);
    expect(lockState.frozenObjectEventIds).toEqual(new Set(['selected', 'bystander']));
    expect(IsFreezePlayerFinished(lockState, player)).toBe(false);

    Task_WaitPlayerStopMoving(lockState, player);
    expect(lockState.task).toBeNull();
    expect(lockState.enforcedLookDirectionCount).toBe(1);
    expect(IsFreezePlayerFinished(lockState, player)).toBe(true);

    setSelectedObjectEvent(lockState, selectedNpc.id);
    selectedNpc.moving = true;
    player.avatarTileTransitionState = 'tileTransition';
    FreezeObjects_WaitForPlayerAndSelected(lockState, [selectedNpc, bystanderNpc]);
    expect(lockState.frozenObjectEventIds.has('bystander')).toBe(true);
    expect(lockState.frozenObjectEventIds.has('selected')).toBe(false);
    expect(IsFreezeSelectedObjectAndPlayerFinished(lockState, player)).toBe(false);

    selectedNpc.moving = false;
    Task_WaitPlayerAndTargetNPCStopMoving(lockState, player, [selectedNpc, bystanderNpc]);
    expect(lockState.frozenObjectEventIds.has('selected')).toBe(true);
    expect(lockState.task?.selectedFinished).toBe(true);
    expect(lockState.task?.playerFinished).toBe(false);

    player.avatarTileTransitionState = 'notMoving';
    Task_WaitPlayerAndTargetNPCStopMoving(lockState, player, [selectedNpc, bystanderNpc]);
    expect(lockState.task).toBeNull();
    expect(lockState.enforcedLookDirectionCount).toBe(2);

    player.facing = 'up';
    selectedNpc.facing = 'left';
    Script_FacePlayer(lockState, player, [selectedNpc]);
    expect(selectedNpc.facing).toBe('down');

    selectedNpc.moving = true;
    Script_ClearHeldMovement(lockState, [selectedNpc]);
    expect(selectedNpc.moving).toBe(false);

    player.moving = true;
    lockState.frozenObjectEventIds.add('selected');
    ClearPlayerHeldMovementAndUnfreezeObjectEvents(lockState, player);
    expect(player.moving).toBe(false);
    expect(lockState.scriptMovementUnfreezeCount).toBe(1);
    expect(lockState.objectEventsUnfreezeCount).toBe(1);
    expect(lockState.frozenObjectEventIds.size).toBe(0);

    selectedNpc.moving = true;
    lockState.frozenObjectEventIds.add('selected');
    UnionRoom_UnlockPlayerAndChatPartner(lockState, player, [selectedNpc]);
    expect(selectedNpc.moving).toBe(false);
    expect(lockState.objectEventsUnfreezeCount).toBe(2);
  });
});
