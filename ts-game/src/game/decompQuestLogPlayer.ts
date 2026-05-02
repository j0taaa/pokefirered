export const QL_PLAYER_GFX_NORMAL = 0;
export const QL_PLAYER_GFX_BIKE = 1;
export const QL_PLAYER_GFX_FISH = 2;
export const QL_PLAYER_GFX_SURF = 3;
export const QL_PLAYER_GFX_STOP_SURF_S = 4;
export const QL_PLAYER_GFX_STOP_SURF_N = 5;
export const QL_PLAYER_GFX_STOP_SURF_W = 6;
export const QL_PLAYER_GFX_STOP_SURF_E = 7;
export const QL_PLAYER_GFX_VSSEEKER = 8;
export const QL_PLAYER_GFX_NONE = 0xff;

export const QL_PLAYBACK_STATE_STOPPED = 0;
export const QL_PLAYBACK_STATE_RUNNING = 1;
export const QL_PLAYBACK_STATE_RECORDING = 2;
export const QL_PLAYBACK_STATE_ACTION_END = 3;
export const QL_PLAYBACK_STATE_RECORDING_NO_DELAY = 4;

export const PLAYER_AVATAR_FLAG_ON_FOOT = 1 << 0;
export const PLAYER_AVATAR_FLAG_MACH_BIKE = 1 << 1;
export const PLAYER_AVATAR_FLAG_ACRO_BIKE = 1 << 2;
export const PLAYER_AVATAR_FLAG_SURFING = 1 << 3;

export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;

export const FLDEFF_SURF_BLOB = 8;
export const FLDEFF_USE_VS_SEEKER = 65;
export const BOB_PLAYER_AND_MON = 1;

export const PLAYER_AVATAR_GFX_NORMAL = 0;
export const PLAYER_AVATAR_GFX_BIKE = 1;
export const PLAYER_AVATAR_GFX_RIDE = 2;
export const PLAYER_AVATAR_GFX_FISH = 3;

export interface QuestLogPlayerSprite {
  animIndex: number;
  animEnded: boolean;
  x2: number;
  y2: number;
}

export interface QuestLogPlayerObjectEvent {
  graphicsId: number;
  movementDirection: number;
  facingDirection: number;
  currentCoords: { x: number; y: number };
  sprite: QuestLogPlayerSprite;
  enableAnim: boolean;
  heldMovementCleared: boolean;
  fieldEffectSpriteId: number | null;
}

export interface QuestLogPlayerTask {
  kind: 'fish' | 'vsSeeker';
  priority: number;
  data: number[];
  destroyed: boolean;
}

export interface QuestLogPlayerRuntimeState {
  questLogPlaybackState: number;
  playerAvatar: {
    objectEventId: number;
    flags: number;
    preventStep: boolean;
  };
  objectEvents: QuestLogPlayerObjectEvent[];
  tasks: QuestLogPlayerTask[];
  recordedTransitions: number[];
  lockedControls: boolean;
  unfreezeObjectEventsCount: number;
  bikeClearStateCalls: Array<[number, number]>;
  fieldEffectArguments: number[];
  startedFieldEffects: number[];
  activeFieldEffects: Set<number>;
  surfBlobBobStates: Array<{ fieldEffectId: number; bobState: number }>;
  stopSurfingDirections: number[];
  playerFacingDirection: number;
}

export const createQuestLogPlayerRuntimeState = (): QuestLogPlayerRuntimeState => ({
  questLogPlaybackState: QL_PLAYBACK_STATE_STOPPED,
  playerAvatar: {
    objectEventId: 0,
    flags: PLAYER_AVATAR_FLAG_ON_FOOT,
    preventStep: false
  },
  objectEvents: [
    {
      graphicsId: PLAYER_AVATAR_GFX_NORMAL,
      movementDirection: DIR_SOUTH,
      facingDirection: DIR_SOUTH,
      currentCoords: { x: 0, y: 0 },
      sprite: {
        animIndex: 0,
        animEnded: false,
        x2: 0,
        y2: 0
      },
      enableAnim: false,
      heldMovementCleared: false,
      fieldEffectSpriteId: null
    }
  ],
  tasks: [],
  recordedTransitions: [],
  lockedControls: false,
  unfreezeObjectEventsCount: 0,
  bikeClearStateCalls: [],
  fieldEffectArguments: [],
  startedFieldEffects: [],
  activeFieldEffects: new Set(),
  surfBlobBobStates: [],
  stopSurfingDirections: [],
  playerFacingDirection: DIR_SOUTH
});

const playerObjectEvent = (
  runtime: QuestLogPlayerRuntimeState
): QuestLogPlayerObjectEvent => runtime.objectEvents[runtime.playerAvatar.objectEventId];

const getPlayerAvatarGraphicsIdByStateId = (stateId: number): number => stateId;

export const qlSetObjectGraphicsId = (
  objectEvent: QuestLogPlayerObjectEvent,
  graphicsId: number
): void => {
  objectEvent.graphicsId = graphicsId & 0xff;
};

const objectEventTurn = (
  objectEvent: QuestLogPlayerObjectEvent,
  direction: number
): void => {
  objectEvent.facingDirection = direction & 0xff;
};

const setPlayerAvatarStateMask = (
  runtime: QuestLogPlayerRuntimeState,
  mask: number
): void => {
  runtime.playerAvatar.flags = mask;
};

const bikeClearState = (
  runtime: QuestLogPlayerRuntimeState,
  x: number,
  y: number
): void => {
  runtime.bikeClearStateCalls.push([x, y]);
};

const createTask = (
  runtime: QuestLogPlayerRuntimeState,
  kind: QuestLogPlayerTask['kind'],
  priority: number
): number => {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({
    kind,
    priority,
    data: Array.from({ length: 16 }, () => 0),
    destroyed: false
  });
  return taskId;
};

const destroyTask = (runtime: QuestLogPlayerRuntimeState, taskId: number): void => {
  runtime.tasks[taskId].destroyed = true;
};

const lockPlayerFieldControls = (runtime: QuestLogPlayerRuntimeState): void => {
  runtime.lockedControls = true;
};

const unlockPlayerFieldControls = (runtime: QuestLogPlayerRuntimeState): void => {
  runtime.lockedControls = false;
};

const fieldEffectStart = (
  runtime: QuestLogPlayerRuntimeState,
  fieldEffect: number
): number => {
  runtime.startedFieldEffects.push(fieldEffect);
  runtime.activeFieldEffects.add(fieldEffect);
  return runtime.startedFieldEffects.length - 1;
};

const fieldEffectActiveListContains = (
  runtime: QuestLogPlayerRuntimeState,
  fieldEffect: number
): boolean => runtime.activeFieldEffects.has(fieldEffect);

const setSurfBlobBobState = (
  runtime: QuestLogPlayerRuntimeState,
  fieldEffectId: number,
  bobState: number
): void => {
  runtime.surfBlobBobStates.push({ fieldEffectId, bobState });
};

const getFishingDirectionAnimNum = (direction: number): number => direction;

const getFishingNoCatchDirectionAnimNum = (direction: number): number => 4 + direction;

const startSpriteAnim = (
  sprite: QuestLogPlayerSprite,
  animIndex: number
): void => {
  sprite.animIndex = animIndex & 0xff;
  sprite.animEnded = false;
};

const alignFishingAnimationFrames = (sprite: QuestLogPlayerSprite): void => {
  sprite.x2 = sprite.x2 | 0;
  sprite.y2 = sprite.y2 | 0;
};

const objectEventClearHeldMovementIfActive = (
  objectEvent: QuestLogPlayerObjectEvent
): void => {
  objectEvent.heldMovementCleared = true;
};

export const questLogUpdatePlayerSprite = (
  runtime: QuestLogPlayerRuntimeState,
  state: number
): void => {
  const transitions = [
    qlGfxTransitionNormal,
    qlGfxTransitionBike,
    qlGfxTransitionFish,
    qlGfxTransitionStartSurf,
    qlGfxTransitionStopSurfSouth,
    qlGfxTransitionStopSurfNorth,
    qlGfxTransitionStopSurfWest,
    qlGfxTransitionStopSurfEast,
    qlGfxTransitionVSSeeker
  ] as const;

  if (state < transitions.length) {
    transitions[state](runtime);
  }
};

export const questLogTryRecordPlayerAvatarGfxTransition = (
  runtime: QuestLogPlayerRuntimeState,
  state: number
): boolean => {
  if (runtime.questLogPlaybackState === QL_PLAYBACK_STATE_RECORDING) {
    runtime.recordedTransitions.push(state & 0xff);
    return true;
  }

  return false;
};

export const questLogCallUpdatePlayerSprite = questLogUpdatePlayerSprite;

export const qlGfxTransitionNormal = (runtime: QuestLogPlayerRuntimeState): void => {
  const objectEvent = playerObjectEvent(runtime);
  qlSetObjectGraphicsId(objectEvent, getPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_GFX_NORMAL));
  objectEventTurn(objectEvent, objectEvent.movementDirection);
  setPlayerAvatarStateMask(runtime, PLAYER_AVATAR_FLAG_ON_FOOT);
};

export const qlGfxTransitionBike = (runtime: QuestLogPlayerRuntimeState): void => {
  const objectEvent = playerObjectEvent(runtime);
  qlSetObjectGraphicsId(objectEvent, getPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_GFX_BIKE));
  objectEventTurn(objectEvent, objectEvent.movementDirection);
  setPlayerAvatarStateMask(runtime, PLAYER_AVATAR_FLAG_MACH_BIKE);
  bikeClearState(runtime, 0, 0);
};

export const qlGfxTransitionFish = (runtime: QuestLogPlayerRuntimeState): void => {
  const objectEvent = playerObjectEvent(runtime);
  const sprite = objectEvent.sprite;

  if (
    runtime.questLogPlaybackState === QL_PLAYBACK_STATE_RUNNING ||
    runtime.questLogPlaybackState === QL_PLAYBACK_STATE_ACTION_END
  ) {
    lockPlayerFieldControls(runtime);
    runtime.playerAvatar.preventStep = true;
    const taskId = createTask(runtime, 'fish', 0xff);
    runtime.tasks[taskId].data[0] = 0;
  } else {
    qlSetObjectGraphicsId(objectEvent, getPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_GFX_FISH));
    startSpriteAnim(sprite, getFishingDirectionAnimNum(objectEvent.facingDirection));
  }
};

export const taskQlFishMovement = (
  runtime: QuestLogPlayerRuntimeState,
  taskId: number
): void => {
  const objectEvent = playerObjectEvent(runtime);
  const sprite = objectEvent.sprite;
  const task = runtime.tasks[taskId];

  switch (task.data[0]) {
    case 0:
      objectEventClearHeldMovementIfActive(objectEvent);
      objectEvent.enableAnim = true;
      qlSetObjectGraphicsId(objectEvent, getPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_GFX_FISH));
      startSpriteAnim(sprite, getFishingDirectionAnimNum(objectEvent.facingDirection));
      task.data[0] += 1;
      task.data[1] = 0;
      break;
    case 1:
      alignFishingAnimationFrames(sprite);
      if (task.data[1] < 60) {
        task.data[1] += 1;
      } else {
        task.data[0] += 1;
      }
      break;
    case 2:
      startSpriteAnim(sprite, getFishingNoCatchDirectionAnimNum(runtime.playerFacingDirection));
      task.data[0] += 1;
      break;
    case 3:
      alignFishingAnimationFrames(sprite);
      if (sprite.animEnded) {
        if ((runtime.playerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING) === 0) {
          qlSetObjectGraphicsId(objectEvent, getPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_GFX_NORMAL));
        } else {
          qlSetObjectGraphicsId(objectEvent, getPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_GFX_RIDE));
        }

        objectEventTurn(objectEvent, objectEvent.movementDirection);
        sprite.x2 = 0;
        sprite.y2 = 0;
        unlockPlayerFieldControls(runtime);
        destroyTask(runtime, taskId);
      }
      break;
  }
};

export const qlGfxTransitionStartSurf = (runtime: QuestLogPlayerRuntimeState): void => {
  const objectEvent = playerObjectEvent(runtime);

  if ((runtime.playerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING) === 0) {
    qlSetObjectGraphicsId(objectEvent, getPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_GFX_RIDE));
    objectEventTurn(objectEvent, objectEvent.movementDirection);
    setPlayerAvatarStateMask(runtime, PLAYER_AVATAR_FLAG_SURFING);
    runtime.fieldEffectArguments[0] = objectEvent.currentCoords.x;
    runtime.fieldEffectArguments[1] = objectEvent.currentCoords.y;
    runtime.fieldEffectArguments[2] = runtime.playerAvatar.objectEventId;
    const fieldEffectId = fieldEffectStart(runtime, FLDEFF_SURF_BLOB);
    objectEvent.fieldEffectSpriteId = fieldEffectId;
    setSurfBlobBobState(runtime, fieldEffectId, BOB_PLAYER_AND_MON);
  }
};

export const qlGfxTransitionVSSeeker = (runtime: QuestLogPlayerRuntimeState): void => {
  fieldEffectStart(runtime, FLDEFF_USE_VS_SEEKER);
  createTask(runtime, 'vsSeeker', 0x00);
};

export const taskQlVSSeekerMovement = (
  runtime: QuestLogPlayerRuntimeState,
  taskId: number
): void => {
  if (!fieldEffectActiveListContains(runtime, FLDEFF_USE_VS_SEEKER)) {
    runtime.unfreezeObjectEventsCount += 1;
    unlockPlayerFieldControls(runtime);
    destroyTask(runtime, taskId);
  }
};

const createStopSurfingTaskNoMusicChange = (
  runtime: QuestLogPlayerRuntimeState,
  direction: number
): void => {
  runtime.stopSurfingDirections.push(direction);
};

export const qlGfxTransitionStopSurfSouth = (runtime: QuestLogPlayerRuntimeState): void => {
  createStopSurfingTaskNoMusicChange(runtime, DIR_SOUTH);
};

export const qlGfxTransitionStopSurfNorth = (runtime: QuestLogPlayerRuntimeState): void => {
  createStopSurfingTaskNoMusicChange(runtime, DIR_NORTH);
};

export const qlGfxTransitionStopSurfWest = (runtime: QuestLogPlayerRuntimeState): void => {
  createStopSurfingTaskNoMusicChange(runtime, DIR_WEST);
};

export const qlGfxTransitionStopSurfEast = (runtime: QuestLogPlayerRuntimeState): void => {
  createStopSurfingTaskNoMusicChange(runtime, DIR_EAST);
};

export function QuestLogUpdatePlayerSprite(runtime: QuestLogPlayerRuntimeState, state: number): void {
  questLogUpdatePlayerSprite(runtime, state);
}

export function QuestLogTryRecordPlayerAvatarGfxTransition(runtime: QuestLogPlayerRuntimeState, state: number): boolean {
  return questLogTryRecordPlayerAvatarGfxTransition(runtime, state);
}

export function QuestLogCallUpdatePlayerSprite(runtime: QuestLogPlayerRuntimeState, state: number): void {
  questLogCallUpdatePlayerSprite(runtime, state);
}

export function QL_GfxTransition_Normal(runtime: QuestLogPlayerRuntimeState): void {
  qlGfxTransitionNormal(runtime);
}

export function QL_GfxTransition_Bike(runtime: QuestLogPlayerRuntimeState): void {
  qlGfxTransitionBike(runtime);
}

export function QL_GfxTransition_Fish(runtime: QuestLogPlayerRuntimeState): void {
  qlGfxTransitionFish(runtime);
}

export function Task_QLFishMovement(runtime: QuestLogPlayerRuntimeState, taskId: number): void {
  taskQlFishMovement(runtime, taskId);
}

export function QL_GfxTransition_StartSurf(runtime: QuestLogPlayerRuntimeState): void {
  qlGfxTransitionStartSurf(runtime);
}

export function QL_GfxTransition_VSSeeker(runtime: QuestLogPlayerRuntimeState): void {
  qlGfxTransitionVSSeeker(runtime);
}

export function Task_QLVSSeekerMovement(runtime: QuestLogPlayerRuntimeState, taskId: number): void {
  taskQlVSSeekerMovement(runtime, taskId);
}

export function QL_SetObjectGraphicsId(objectEvent: QuestLogPlayerObjectEvent, graphicsId: number): void {
  qlSetObjectGraphicsId(objectEvent, graphicsId);
}

export function QL_GfxTransition_StopSurfSouth(runtime: QuestLogPlayerRuntimeState): void {
  qlGfxTransitionStopSurfSouth(runtime);
}

export function QL_GfxTransition_StopSurfNorth(runtime: QuestLogPlayerRuntimeState): void {
  qlGfxTransitionStopSurfNorth(runtime);
}

export function QL_GfxTransition_StopSurfWest(runtime: QuestLogPlayerRuntimeState): void {
  qlGfxTransitionStopSurfWest(runtime);
}

export function QL_GfxTransition_StopSurfEast(runtime: QuestLogPlayerRuntimeState): void {
  qlGfxTransitionStopSurfEast(runtime);
}
