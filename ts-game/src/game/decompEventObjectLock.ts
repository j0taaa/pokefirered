import type { NpcState } from './npc';
import type { PlayerState } from './player';

export interface EventObjectLockTaskState {
  kind: 'waitPlayer' | 'waitPlayerAndSelected';
  playerFinished: boolean;
  selectedFinished: boolean;
}

export interface EventObjectLockState {
  frozenObjectEventIds: Set<string>;
  selectedObjectEventId: string | null;
  task: EventObjectLockTaskState | null;
  enforcedLookDirectionCount: number;
  scriptMovementUnfreezeCount: number;
  objectEventsUnfreezeCount: number;
}

export const createEventObjectLockState = (): EventObjectLockState => ({
  frozenObjectEventIds: new Set<string>(),
  selectedObjectEventId: null,
  task: null,
  enforcedLookDirectionCount: 0,
  scriptMovementUnfreezeCount: 0,
  objectEventsUnfreezeCount: 0
});

export const setSelectedObjectEvent = (
  lockState: EventObjectLockState,
  objectEventId: string | null
): void => {
  lockState.selectedObjectEventId = objectEventId;
};

const stopPlayerAvatar = (player: PlayerState | undefined): void => {
  if (!player) {
    return;
  }

  player.moving = false;
  player.animationTime = 0;
  delete player.stepTarget;
  delete player.stepDirection;
  delete player.stepSpeed;
};

const stopObjectEvent = (npc: NpcState | undefined): void => {
  if (!npc) {
    return;
  }

  npc.moving = false;
  npc.animationTime = 0;
  delete npc.stepTarget;
  delete npc.stepDirection;
};

const handleEnforcedLookDirectionOnPlayerStopMoving = (
  lockState: EventObjectLockState
): void => {
  lockState.enforcedLookDirectionCount += 1;
};

const getSelectedObjectEvent = (
  lockState: EventObjectLockState,
  npcs: readonly NpcState[]
): NpcState | undefined =>
  lockState.selectedObjectEventId
    ? npcs.find((npc) => npc.id === lockState.selectedObjectEventId)
    : undefined;

const freezeObjectEvents = (
  lockState: EventObjectLockState,
  npcs: readonly NpcState[]
): void => {
  lockState.frozenObjectEventIds.clear();
  for (const npc of npcs) {
    lockState.frozenObjectEventIds.add(npc.id);
  }
};

const freezeObjectEventsExceptOne = (
  lockState: EventObjectLockState,
  npcs: readonly NpcState[]
): void => {
  lockState.frozenObjectEventIds.clear();
  for (const npc of npcs) {
    if (npc.id !== lockState.selectedObjectEventId) {
      lockState.frozenObjectEventIds.add(npc.id);
    }
  }
};

const freezeObjectEvent = (
  lockState: EventObjectLockState,
  objectEventId: string | null
): void => {
  if (!objectEventId) {
    return;
  }

  lockState.frozenObjectEventIds.add(objectEventId);
};

const unfreezeObjectEvents = (lockState: EventObjectLockState): void => {
  lockState.frozenObjectEventIds.clear();
  lockState.objectEventsUnfreezeCount += 1;
};

const scriptMovementUnfreezeObjectEvents = (lockState: EventObjectLockState): void => {
  lockState.scriptMovementUnfreezeCount += 1;
};

export const walkrunIsStandingStill = (player: PlayerState | undefined): boolean => {
  if (!player) {
    return true;
  }
  if (player.avatarTileTransitionState) {
    return player.avatarTileTransitionState !== 'tileTransition';
  }
  return !player.moving && !player.stepTarget;
};

export const taskWaitPlayerStopMoving = (
  lockState: EventObjectLockState,
  player: PlayerState | undefined
): void => {
  if (walkrunIsStandingStill(player)) {
    handleEnforcedLookDirectionOnPlayerStopMoving(lockState);
    lockState.task = null;
  }
};

export const freezeObjectsWaitForPlayer = (
  lockState: EventObjectLockState,
  npcs: readonly NpcState[]
): void => {
  freezeObjectEvents(lockState, npcs);
  lockState.task = {
    kind: 'waitPlayer',
    playerFinished: false,
    selectedFinished: false
  };
};

export const freezeObjectsWaitForPlayerAndSelected = (
  lockState: EventObjectLockState,
  npcs: readonly NpcState[]
): void => {
  freezeObjectEventsExceptOne(lockState, npcs);
  lockState.task = {
    kind: 'waitPlayerAndSelected',
    playerFinished: false,
    selectedFinished: false
  };

  const selectedObjectEvent = getSelectedObjectEvent(lockState, npcs);
  if (!selectedObjectEvent || !selectedObjectEvent.moving) {
    stopObjectEvent(selectedObjectEvent);
    freezeObjectEvent(lockState, selectedObjectEvent?.id ?? null);
    lockState.task.selectedFinished = true;
  }
};

export const tickEventObjectLock = (
  lockState: EventObjectLockState,
  player: PlayerState | undefined,
  npcs: readonly NpcState[]
): void => {
  const task = lockState.task;
  if (!task) {
    return;
  }

  if (!task.playerFinished && walkrunIsStandingStill(player)) {
    handleEnforcedLookDirectionOnPlayerStopMoving(lockState);
    task.playerFinished = true;
  }

  if (task.kind === 'waitPlayer') {
    if (task.playerFinished) {
      lockState.task = null;
    }
    return;
  }

  if (!task.selectedFinished) {
    const selectedObjectEvent = getSelectedObjectEvent(lockState, npcs);
    if (!selectedObjectEvent || !selectedObjectEvent.moving) {
      stopObjectEvent(selectedObjectEvent);
      freezeObjectEvent(lockState, selectedObjectEvent?.id ?? null);
      task.selectedFinished = true;
    }
  }

  if (task.playerFinished && task.selectedFinished) {
    lockState.task = null;
  }
};

export const taskWaitPlayerAndTargetNpcStopMoving = (
  lockState: EventObjectLockState,
  player: PlayerState | undefined,
  npcs: readonly NpcState[]
): void => {
  const task = lockState.task;
  if (!task || task.kind !== 'waitPlayerAndSelected') {
    return;
  }

  if (!task.playerFinished && walkrunIsStandingStill(player)) {
    handleEnforcedLookDirectionOnPlayerStopMoving(lockState);
    task.playerFinished = true;
  }

  if (!task.selectedFinished) {
    const selectedObjectEvent = getSelectedObjectEvent(lockState, npcs);
    if (!selectedObjectEvent || !selectedObjectEvent.moving) {
      stopObjectEvent(selectedObjectEvent);
      freezeObjectEvent(lockState, selectedObjectEvent?.id ?? null);
      task.selectedFinished = true;
    }
  }

  if (task.playerFinished && task.selectedFinished) {
    lockState.task = null;
  }
};

export const isFreezePlayerFinished = (
  lockState: EventObjectLockState,
  player: PlayerState | undefined
): boolean => {
  if (lockState.task?.kind === 'waitPlayer') {
    return false;
  }

  stopPlayerAvatar(player);
  return true;
};

export const isFreezeSelectedObjectAndPlayerFinished = (
  lockState: EventObjectLockState,
  player: PlayerState | undefined
): boolean => {
  if (lockState.task?.kind === 'waitPlayerAndSelected') {
    return false;
  }

  stopPlayerAvatar(player);
  return true;
};

export const clearPlayerHeldMovementAndUnfreezeObjectEvents = (
  lockState: EventObjectLockState,
  player: PlayerState | undefined
): void => {
  stopPlayerAvatar(player);
  lockState.task = null;
  scriptMovementUnfreezeObjectEvents(lockState);
  unfreezeObjectEvents(lockState);
};

export const unlockPlayerAndSelectedObject = (
  lockState: EventObjectLockState,
  player: PlayerState | undefined,
  npcs: readonly NpcState[]
): void => {
  stopObjectEvent(getSelectedObjectEvent(lockState, npcs));
  clearPlayerHeldMovementAndUnfreezeObjectEvents(lockState, player);
};

const getFacingOppositePlayer = (
  playerFacing: PlayerState['facing'] | undefined
): NpcState['facing'] | null => {
  switch (playerFacing) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    default:
      return null;
  }
};

export const scriptFacePlayer = (
  lockState: EventObjectLockState,
  player: PlayerState | undefined,
  npcs: readonly NpcState[]
): void => {
  const selectedObjectEvent = getSelectedObjectEvent(lockState, npcs);
  const facing = getFacingOppositePlayer(player?.facing);
  if (!selectedObjectEvent || !facing) {
    return;
  }

  selectedObjectEvent.facing = facing;
};

export const scriptClearHeldMovement = (
  lockState: EventObjectLockState,
  npcs: readonly NpcState[]
): void => {
  stopObjectEvent(getSelectedObjectEvent(lockState, npcs));
};

export function walkrun_is_standing_still(player: PlayerState | undefined): boolean {
  return walkrunIsStandingStill(player);
}

export function Task_WaitPlayerStopMoving(
  lockState: EventObjectLockState,
  player: PlayerState | undefined
): void {
  taskWaitPlayerStopMoving(lockState, player);
}

export function IsFreezePlayerFinished(
  lockState: EventObjectLockState,
  player: PlayerState | undefined
): boolean {
  return isFreezePlayerFinished(lockState, player);
}

export function FreezeObjects_WaitForPlayer(
  lockState: EventObjectLockState,
  npcs: readonly NpcState[]
): void {
  freezeObjectsWaitForPlayer(lockState, npcs);
}

export function Task_WaitPlayerAndTargetNPCStopMoving(
  lockState: EventObjectLockState,
  player: PlayerState | undefined,
  npcs: readonly NpcState[]
): void {
  taskWaitPlayerAndTargetNpcStopMoving(lockState, player, npcs);
}

export function IsFreezeSelectedObjectAndPlayerFinished(
  lockState: EventObjectLockState,
  player: PlayerState | undefined
): boolean {
  return isFreezeSelectedObjectAndPlayerFinished(lockState, player);
}

export function FreezeObjects_WaitForPlayerAndSelected(
  lockState: EventObjectLockState,
  npcs: readonly NpcState[]
): void {
  freezeObjectsWaitForPlayerAndSelected(lockState, npcs);
}

export function ClearPlayerHeldMovementAndUnfreezeObjectEvents(
  lockState: EventObjectLockState,
  player: PlayerState | undefined
): void {
  clearPlayerHeldMovementAndUnfreezeObjectEvents(lockState, player);
}

export function UnionRoom_UnlockPlayerAndChatPartner(
  lockState: EventObjectLockState,
  player: PlayerState | undefined,
  npcs: readonly NpcState[]
): void {
  unlockPlayerAndSelectedObject(lockState, player, npcs);
}

export function Script_FacePlayer(
  lockState: EventObjectLockState,
  player: PlayerState | undefined,
  npcs: readonly NpcState[]
): void {
  scriptFacePlayer(lockState, player, npcs);
}

export function Script_ClearHeldMovement(
  lockState: EventObjectLockState,
  npcs: readonly NpcState[]
): void {
  scriptClearHeldMovement(lockState, npcs);
}
