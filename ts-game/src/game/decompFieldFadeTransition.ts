import { RGB_BLACK, RGB_WHITE, PLTT_SIZE } from './decompPalette';

export const FADE_FROM_BLACK = 0;
export const FADE_TO_BLACK = 1;
export const FADE_FROM_WHITE = 2;
export const FADE_TO_WHITE = 3;

export const MAP_TYPE_NONE = 0;
export const MAP_TYPE_TOWN = 1;
export const MAP_TYPE_CITY = 2;
export const MAP_TYPE_ROUTE = 3;
export const MAP_TYPE_UNDERGROUND = 4;
export const MAP_TYPE_UNDERWATER = 5;
export const MAP_TYPE_OCEAN_ROUTE = 6;
export const MAP_TYPE_UNKNOWN = 7;
export const MAP_TYPE_INDOOR = 8;
export const MAP_TYPE_SECRET_BASE = 9;

export const MPS_TYPE_CAVE = 'MPS_TYPE_CAVE';
export const SE_EXIT = 9;
export const SE_WARP_IN = 39;
export const SE_WARP_OUT = 40;

export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;
export const LOCALID_PLAYER = 255;
export const MOVEMENT_ACTION_WALK_NORMAL_DOWN = 0x10;
export const MOVEMENT_ACTION_WALK_NORMAL_UP = 0x11;

export type FieldFadeTaskFunc = (runtime: FieldFadeTransitionRuntime, taskId: number) => void;

export interface FieldFadeTask {
  id: number;
  func: FieldFadeTaskFunc;
  priority: number;
  data: number[];
  isActive: boolean;
}

export interface FieldFadeObjectEvent {
  id: number;
  heldMovement?: number | string;
  heldMovementFinished: boolean;
  movementOverridden: boolean;
}

export interface FieldFadeSprite {
  x2: number;
  y2: number;
  oam: { priority: number };
}

export interface FieldFadeMapHeader {
  mapType: number;
  regionMapSectionId: number;
}

export interface FieldFadeTransitionRuntime {
  gPlttBufferFaded: Uint16Array;
  gPaletteFade: { active: boolean };
  tasks: FieldFadeTask[];
  nextTaskId: number;
  operations: string[];
  gMapHeader: FieldFadeMapHeader;
  destinationWarpMapHeader: FieldFadeMapHeader;
  lastUsedWarpMapType: number;
  currentMapType: number;
  playerDestCoords: { x: number; y: number };
  metatileBehaviorAtDest: number;
  mapPreviewSections: Set<number>;
  weatherNotFadingIn: boolean;
  forestMapPreviewRunning: boolean;
  bgMusicStopped: boolean;
  linkTaskFinished: boolean;
  receivedRemoteLinkPlayers: boolean;
  fieldCallback: string | null;
  mainCallback2: string | null;
  gExitStairsMovementDisabled: boolean;
  playerFieldControlsLocked: number;
  playerInvisible: boolean;
  objectEventsFrozen: boolean;
  playerFacingDirection: number;
  playerAvatar: { objectEventId: number; spriteId: number };
  objectEvents: FieldFadeObjectEvent[];
  sprites: FieldFadeSprite[];
  walkrunStandingStill: boolean;
  doorAnimationRunning: boolean;
  nextDoorTaskResult: number;
  teleportInAnimWaiting: boolean;
  teleportWarpOutAnimWaiting: boolean;
  reestablishCableClubLinkDuration: number;
  doorSoundEffect: number;
}

const signed16 = (value: number): number => (value << 16) >> 16;

const transitionTypes: Array<{ fromType: number; toType: number; isEnter: boolean; isExit: boolean }> = [
  MAP_TYPE_TOWN,
  MAP_TYPE_CITY,
  MAP_TYPE_ROUTE,
  MAP_TYPE_UNDERWATER,
  MAP_TYPE_OCEAN_ROUTE,
  MAP_TYPE_UNKNOWN,
  MAP_TYPE_INDOOR,
  MAP_TYPE_SECRET_BASE
].flatMap((fromType) => [
  { fromType, toType: MAP_TYPE_UNDERGROUND, isEnter: true, isExit: false },
  { fromType: MAP_TYPE_UNDERGROUND, toType: fromType, isEnter: false, isExit: true }
]);

export const createFieldFadeTransitionRuntime = (
  overrides: Partial<FieldFadeTransitionRuntime> = {}
): FieldFadeTransitionRuntime => {
  const runtime: FieldFadeTransitionRuntime = {
    gPlttBufferFaded: overrides.gPlttBufferFaded ?? new Uint16Array(PLTT_SIZE / 2),
    gPaletteFade: overrides.gPaletteFade ?? { active: false },
    tasks: overrides.tasks ?? [],
    nextTaskId: overrides.nextTaskId ?? 0,
    operations: overrides.operations ?? [],
    gMapHeader: overrides.gMapHeader ?? { mapType: MAP_TYPE_TOWN, regionMapSectionId: 1 },
    destinationWarpMapHeader: overrides.destinationWarpMapHeader ?? { mapType: MAP_TYPE_TOWN, regionMapSectionId: 1 },
    lastUsedWarpMapType: overrides.lastUsedWarpMapType ?? MAP_TYPE_TOWN,
    currentMapType: overrides.currentMapType ?? MAP_TYPE_TOWN,
    playerDestCoords: overrides.playerDestCoords ?? { x: 0, y: 0 },
    metatileBehaviorAtDest: overrides.metatileBehaviorAtDest ?? 0,
    mapPreviewSections: overrides.mapPreviewSections ?? new Set<number>(),
    weatherNotFadingIn: overrides.weatherNotFadingIn ?? true,
    forestMapPreviewRunning: overrides.forestMapPreviewRunning ?? true,
    bgMusicStopped: overrides.bgMusicStopped ?? true,
    linkTaskFinished: overrides.linkTaskFinished ?? true,
    receivedRemoteLinkPlayers: overrides.receivedRemoteLinkPlayers ?? false,
    fieldCallback: overrides.fieldCallback ?? null,
    mainCallback2: overrides.mainCallback2 ?? null,
    gExitStairsMovementDisabled: overrides.gExitStairsMovementDisabled ?? false,
    playerFieldControlsLocked: overrides.playerFieldControlsLocked ?? 0,
    playerInvisible: overrides.playerInvisible ?? false,
    objectEventsFrozen: overrides.objectEventsFrozen ?? false,
    playerFacingDirection: overrides.playerFacingDirection ?? DIR_SOUTH,
    playerAvatar: overrides.playerAvatar ?? { objectEventId: 0, spriteId: 0 },
    objectEvents: overrides.objectEvents ?? [{ id: 0, heldMovementFinished: true, movementOverridden: false }],
    sprites: overrides.sprites ?? [{ x2: 0, y2: 0, oam: { priority: 0 } }],
    walkrunStandingStill: overrides.walkrunStandingStill ?? true,
    doorAnimationRunning: overrides.doorAnimationRunning ?? false,
    nextDoorTaskResult: overrides.nextDoorTaskResult ?? -1,
    teleportInAnimWaiting: overrides.teleportInAnimWaiting ?? false,
    teleportWarpOutAnimWaiting: overrides.teleportWarpOutAnimWaiting ?? false,
    reestablishCableClubLinkDuration: overrides.reestablishCableClubLinkDuration ?? 0,
    doorSoundEffect: overrides.doorSoundEffect ?? SE_EXIT
  };
  return runtime;
};

const log = (runtime: FieldFadeTransitionRuntime, op: string): void => {
  runtime.operations.push(op);
};

export const CreateTask = (runtime: FieldFadeTransitionRuntime, func: FieldFadeTaskFunc, priority: number): number => {
  const id = runtime.nextTaskId++;
  runtime.tasks[id] = { id, func, priority, data: Array(16).fill(0), isActive: true };
  log(runtime, `CreateTask:${func.name}:${priority}:${id}`);
  return id;
};

export const DestroyTask = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  if (runtime.tasks[taskId]) {
    runtime.tasks[taskId].isActive = false;
  }
  log(runtime, `DestroyTask:${taskId}`);
};

export const RunTask = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task?.isActive) {
    task.func(runtime, taskId);
  }
};

export const FuncIsActiveTask = (runtime: FieldFadeTransitionRuntime, func: FieldFadeTaskFunc): boolean =>
  runtime.tasks.some((task) => task?.isActive === true && task.func === func);

export const palette_bg_faded_fill_white = (runtime: FieldFadeTransitionRuntime): void => {
  runtime.gPlttBufferFaded.fill(RGB_WHITE);
  log(runtime, 'CpuFastFill16:RGB_WHITE:gPlttBufferFaded:PLTT_SIZE');
};

export const palette_bg_faded_fill_black = (runtime: FieldFadeTransitionRuntime): void => {
  runtime.gPlttBufferFaded.fill(RGB_BLACK);
  log(runtime, 'CpuFastFill16:RGB_BLACK:gPlttBufferFaded:PLTT_SIZE');
};

export const MapTransitionIsEnter = (fromType: number, toType: number): boolean =>
  transitionTypes.some((entry) => entry.fromType === fromType && entry.toType === toType && entry.isEnter);

export const MapTransitionIsExit = (fromType: number, toType: number): boolean =>
  transitionTypes.some((entry) => entry.fromType === fromType && entry.toType === toType && entry.isExit);

export const FadeScreen = (runtime: FieldFadeTransitionRuntime, mode: number, delay: number): void => {
  runtime.gPaletteFade.active = mode === FADE_TO_BLACK || mode === FADE_TO_WHITE;
  log(runtime, `FadeScreen:${mode}:${delay}`);
};

export const WarpFadeInScreen = (runtime: FieldFadeTransitionRuntime): void => {
  switch (MapTransitionIsExit(runtime.lastUsedWarpMapType, runtime.currentMapType)) {
    case false:
      palette_bg_faded_fill_black(runtime);
      FadeScreen(runtime, FADE_FROM_BLACK, 0);
      palette_bg_faded_fill_black(runtime);
      break;
    case true:
      palette_bg_faded_fill_white(runtime);
      FadeScreen(runtime, FADE_FROM_WHITE, 0);
      palette_bg_faded_fill_white(runtime);
      break;
  }
};

export const WarpFadeInScreenWithDelay = (runtime: FieldFadeTransitionRuntime): void => {
  switch (MapTransitionIsExit(runtime.lastUsedWarpMapType, runtime.currentMapType)) {
    case false:
      palette_bg_faded_fill_black(runtime);
      FadeScreen(runtime, FADE_FROM_BLACK, 3);
      palette_bg_faded_fill_black(runtime);
      break;
    case true:
      palette_bg_faded_fill_white(runtime);
      FadeScreen(runtime, FADE_FROM_WHITE, 3);
      palette_bg_faded_fill_white(runtime);
      break;
  }
};

export const FadeInFromBlack = (runtime: FieldFadeTransitionRuntime): void => {
  palette_bg_faded_fill_black(runtime);
  FadeScreen(runtime, FADE_FROM_BLACK, 0);
  palette_bg_faded_fill_black(runtime);
};

export const MapHasPreviewScreen = (
  runtime: FieldFadeTransitionRuntime,
  regionMapSectionId: number,
  mpsType: string
): boolean => {
  log(runtime, `MapHasPreviewScreen:${regionMapSectionId}:${mpsType}`);
  return runtime.mapPreviewSections.has(regionMapSectionId);
};

export const WarpFadeOutScreen = (runtime: FieldFadeTransitionRuntime): void => {
  const header = runtime.destinationWarpMapHeader;
  if (
    header.regionMapSectionId !== runtime.gMapHeader.regionMapSectionId &&
    MapHasPreviewScreen(runtime, header.regionMapSectionId, MPS_TYPE_CAVE)
  ) {
    FadeScreen(runtime, FADE_TO_BLACK, 0);
  } else {
    switch (MapTransitionIsEnter(runtime.currentMapType, header.mapType)) {
      case false:
        FadeScreen(runtime, FADE_TO_BLACK, 0);
        break;
      case true:
        FadeScreen(runtime, FADE_TO_WHITE, 0);
        break;
    }
  }
};

export const WarpFadeOutScreenWithDelay = (runtime: FieldFadeTransitionRuntime): void => {
  switch (MapTransitionIsEnter(runtime.currentMapType, runtime.destinationWarpMapHeader.mapType)) {
    case false:
      FadeScreen(runtime, FADE_TO_BLACK, 3);
      break;
    case true:
      FadeScreen(runtime, FADE_TO_WHITE, 3);
      break;
  }
};

export const SetPlayerInvisibility = (runtime: FieldFadeTransitionRuntime, invisible: boolean): void => {
  runtime.playerInvisible = invisible;
  log(runtime, `SetPlayerInvisibility:${invisible}`);
};

export const SetPlayerVisibility = (runtime: FieldFadeTransitionRuntime, visible: boolean): void => {
  SetPlayerInvisibility(runtime, !visible);
};

export const LockPlayerFieldControls = (runtime: FieldFadeTransitionRuntime): void => {
  runtime.playerFieldControlsLocked++;
  log(runtime, 'LockPlayerFieldControls');
};

export const UnlockPlayerFieldControls = (runtime: FieldFadeTransitionRuntime): void => {
  runtime.playerFieldControlsLocked = Math.max(0, runtime.playerFieldControlsLocked - 1);
  log(runtime, 'UnlockPlayerFieldControls');
};

export const Overworld_PlaySpecialMapMusic = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'Overworld_PlaySpecialMapMusic');
export const QuestLog_DrawPreviouslyOnQuestHeaderIfInPlaybackMode = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'QuestLog_DrawPreviouslyOnQuestHeaderIfInPlaybackMode');
export const ScriptContext_Enable = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'ScriptContext_Enable');
export const TryFadeOutOldMapMusic = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'TryFadeOutOldMapMusic');
export const PlayRainStoppingSoundEffect = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'PlayRainStoppingSoundEffect');
export const PlaySE = (runtime: FieldFadeTransitionRuntime, se: number): void => log(runtime, `PlaySE:${se}`);
export const WarpIntoMap = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'WarpIntoMap');
export const SetMainCallback2 = (runtime: FieldFadeTransitionRuntime, callback: string): void => {
  runtime.mainCallback2 = callback;
  log(runtime, `SetMainCallback2:${callback}`);
};
export const ClearLinkCallback_2 = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'ClearLinkCallback_2');
export const SetCloseLinkCallback = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'SetCloseLinkCallback');
export const SetLinkStandbyCallback = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'SetLinkStandbyCallback');
export const StartSendingKeysToLink = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'StartSendingKeysToLink');
export const SetUpReturnToStartMenu = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'SetUpReturnToStartMenu');
export const StartEscalatorWarp = (runtime: FieldFadeTransitionRuntime, metatileBehavior: number, priority: number): void => log(runtime, `StartEscalatorWarp:${metatileBehavior}:${priority}`);
export const StartLavaridgeGymB1FWarp = (runtime: FieldFadeTransitionRuntime, priority: number): void => log(runtime, `StartLavaridgeGymB1FWarp:${priority}`);
export const StartLavaridgeGym1FWarp = (runtime: FieldFadeTransitionRuntime, priority: number): void => log(runtime, `StartLavaridgeGym1FWarp:${priority}`);
export const DoOutwardBarnDoorWipe = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'DoOutwardBarnDoorWipe');
export const CameraObjectReset1 = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'CameraObjectReset1');
export const CameraObjectReset2 = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'CameraObjectReset2');

export const IsWeatherNotFadingIn = (runtime: FieldFadeTransitionRuntime): boolean => runtime.weatherNotFadingIn;
export const ForestMapPreviewScreenIsRunning = (runtime: FieldFadeTransitionRuntime): boolean => runtime.forestMapPreviewRunning;
export const BGMusicStopped = (runtime: FieldFadeTransitionRuntime): boolean => runtime.bgMusicStopped;
export const IsLinkTaskFinished = (runtime: FieldFadeTransitionRuntime): boolean => runtime.linkTaskFinished;

export const FieldFadeTransitionBackgroundEffectIsFinished = (runtime: FieldFadeTransitionRuntime): boolean => {
  if (IsWeatherNotFadingIn(runtime) === true && ForestMapPreviewScreenIsRunning(runtime)) {
    return true;
  }
  return false;
};

export const WaitWarpFadeOutScreen = (runtime: FieldFadeTransitionRuntime): boolean => runtime.gPaletteFade.active;

const getPlayerObj = (runtime: FieldFadeTransitionRuntime): FieldFadeObjectEvent => runtime.objectEvents[runtime.playerAvatar.objectEventId];
const getPlayerSpr = (runtime: FieldFadeTransitionRuntime): FieldFadeSprite => runtime.sprites[runtime.playerAvatar.spriteId];

export const FreezeObjectEvents = (runtime: FieldFadeTransitionRuntime): void => {
  runtime.objectEventsFrozen = true;
  log(runtime, 'FreezeObjectEvents');
};

export const UnfreezeObjectEvents = (runtime: FieldFadeTransitionRuntime): void => {
  runtime.objectEventsFrozen = false;
  log(runtime, 'UnfreezeObjectEvents');
};

export const ClearPlayerHeldMovementAndUnfreezeObjectEvents = (runtime: FieldFadeTransitionRuntime): void => {
  getPlayerObj(runtime).heldMovement = undefined;
  UnfreezeObjectEvents(runtime);
  log(runtime, 'ClearPlayerHeldMovementAndUnfreezeObjectEvents');
};

export const PlayerGetDestCoords = (runtime: FieldFadeTransitionRuntime): { x: number; y: number } => ({
  x: runtime.playerDestCoords.x,
  y: runtime.playerDestCoords.y
});

export const MapGridGetMetatileBehaviorAt = (runtime: FieldFadeTransitionRuntime, _x: number, _y: number): number =>
  runtime.metatileBehaviorAtDest;

export const MetatileBehavior_IsWarpDoor_2 = (behavior: number): boolean => behavior === 1;
export const MetatileBehavior_IsNonAnimDoor = (behavior: number): boolean => behavior === 2;
export const MetatileBehavior_IsDirectionalStairWarp = (behavior: number): boolean => behavior >= 3 && behavior <= 6;
export const MetatileBehavior_IsDirectionalUpRightStairWarp = (behavior: number): boolean => behavior === 3;
export const MetatileBehavior_IsDirectionalUpLeftStairWarp = (behavior: number): boolean => behavior === 4;
export const MetatileBehavior_IsDirectionalDownRightStairWarp = (behavior: number): boolean => behavior === 5;
export const MetatileBehavior_IsDirectionalDownLeftStairWarp = (behavior: number): boolean => behavior === 6;

export const GetObjectEventIdByLocalIdAndMap = (
  runtime: FieldFadeTransitionRuntime,
  localId: number,
  mapNum: number,
  mapGroup: number
): number => {
  log(runtime, `GetObjectEventIdByLocalIdAndMap:${localId}:${mapNum}:${mapGroup}`);
  return runtime.playerAvatar.objectEventId;
};

export const ObjectEventSetHeldMovement = (runtime: FieldFadeTransitionRuntime, obj: FieldFadeObjectEvent, movement: number | string): void => {
  obj.heldMovement = movement;
  obj.heldMovementFinished = false;
  obj.movementOverridden = true;
  log(runtime, `ObjectEventSetHeldMovement:${obj.id}:${movement}`);
};

export const ObjectEventForceSetHeldMovement = (runtime: FieldFadeTransitionRuntime, obj: FieldFadeObjectEvent, movement: number | string): void => {
  obj.heldMovement = movement;
  obj.heldMovementFinished = false;
  obj.movementOverridden = true;
  log(runtime, `ObjectEventForceSetHeldMovement:${obj.id}:${movement}`);
};

export const ObjectEventClearHeldMovementIfFinished = (runtime: FieldFadeTransitionRuntime, obj: FieldFadeObjectEvent): boolean => {
  log(runtime, `ObjectEventClearHeldMovementIfFinished:${obj.id}`);
  if (obj.heldMovementFinished) {
    obj.heldMovement = undefined;
    obj.movementOverridden = false;
    return true;
  }
  return false;
};

export const ObjectEventClearHeldMovementIfActive = (runtime: FieldFadeTransitionRuntime, obj: FieldFadeObjectEvent): void => {
  obj.heldMovement = undefined;
  obj.movementOverridden = false;
  log(runtime, `ObjectEventClearHeldMovementIfActive:${obj.id}`);
};

export const ObjectEventIsMovementOverridden = (_runtime: FieldFadeTransitionRuntime, obj: FieldFadeObjectEvent): boolean =>
  obj.movementOverridden;

export const walkrun_is_standing_still = (runtime: FieldFadeTransitionRuntime): boolean => runtime.walkrunStandingStill;
export const FieldSetDoorOpened = (runtime: FieldFadeTransitionRuntime, x: number, y: number): void => log(runtime, `FieldSetDoorOpened:${x}:${y}`);
export const GetDoorSoundEffect = (runtime: FieldFadeTransitionRuntime, x: number, y: number): number => {
  log(runtime, `GetDoorSoundEffect:${x}:${y}`);
  return runtime.doorSoundEffect;
};
export const FieldAnimateDoorOpen = (runtime: FieldFadeTransitionRuntime, x: number, y: number): number => {
  log(runtime, `FieldAnimateDoorOpen:${x}:${y}`);
  return runtime.nextDoorTaskResult;
};
export const FieldAnimateDoorClose = (runtime: FieldFadeTransitionRuntime, x: number, y: number): number => {
  log(runtime, `FieldAnimateDoorClose:${x}:${y}`);
  return runtime.nextDoorTaskResult;
};
export const FieldIsDoorAnimationRunning = (runtime: FieldFadeTransitionRuntime): boolean => runtime.doorAnimationRunning;
export const StartTeleportInPlayerAnim = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'StartTeleportInPlayerAnim');
export const WaitTeleportInPlayerAnim = (runtime: FieldFadeTransitionRuntime): boolean => runtime.teleportInAnimWaiting;
export const StartTeleportWarpOutPlayerAnim = (runtime: FieldFadeTransitionRuntime): void => log(runtime, 'StartTeleportWarpOutPlayerAnim');
export const WaitTeleportWarpOutPlayerAnim = (runtime: FieldFadeTransitionRuntime): boolean => runtime.teleportWarpOutAnimWaiting;
export const GetPlayerFacingDirection = (runtime: FieldFadeTransitionRuntime): number => runtime.playerFacingDirection;
export const GetWalkNormalMovementAction = (direction: number): string => `GetWalkNormalMovementAction:${direction}`;
export const GetWalkInPlaceNormalMovementAction = (direction: number): string => `GetWalkInPlaceNormalMovementAction:${direction}`;
export const GetWalkInPlaceFastMovementAction = (direction: number): string => `GetWalkInPlaceFastMovementAction:${direction}`;

export const CreateTask_ReestablishCableClubLink = (runtime: FieldFadeTransitionRuntime): number => {
  const taskId = CreateTask(runtime, Task_DummyCountdown, 10);
  runtime.tasks[taskId].data[0] = runtime.reestablishCableClubLinkDuration;
  return taskId;
};

export const Task_DummyCountdown = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task.data[0] > 0) {
    task.data[0]--;
  } else {
    DestroyTask(runtime, taskId);
  }
};

export const Task_ContinueScriptUnionRoom = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  if (FieldFadeTransitionBackgroundEffectIsFinished(runtime) === true) {
    DestroyTask(runtime, taskId);
  }
};

export const FieldCB_ContinueScriptUnionRoom = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  Overworld_PlaySpecialMapMusic(runtime);
  FadeInFromBlack(runtime);
  CreateTask(runtime, Task_ContinueScriptUnionRoom, 10);
};

export const Task_ContinueScript = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  if (FieldFadeTransitionBackgroundEffectIsFinished(runtime) === true) {
    DestroyTask(runtime, taskId);
    ScriptContext_Enable(runtime);
  }
};

export const FieldCB_ContinueScriptHandleMusic = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  Overworld_PlaySpecialMapMusic(runtime);
  FadeInFromBlack(runtime);
  CreateTask(runtime, Task_ContinueScript, 10);
};

export const FieldCB_ContinueScript = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  FadeInFromBlack(runtime);
  CreateTask(runtime, Task_ContinueScript, 10);
};

export const Task_ReturnToFieldCableLink = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      task.data[1] = CreateTask_ReestablishCableClubLink(runtime);
      task.data[0]++;
      break;
    case 1:
      if (runtime.tasks[task.data[1]].isActive !== true) {
        WarpFadeInScreen(runtime);
        task.data[0]++;
      }
      break;
    case 2:
      if (FieldFadeTransitionBackgroundEffectIsFinished(runtime) === true) {
        UnlockPlayerFieldControls(runtime);
        DestroyTask(runtime, taskId);
      }
      break;
  }
};

export const FieldCB_ReturnToFieldCableLink = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  Overworld_PlaySpecialMapMusic(runtime);
  palette_bg_faded_fill_black(runtime);
  CreateTask(runtime, Task_ReturnToFieldCableLink, 10);
};

export const Task_ReturnToFieldRecordMixing = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      if (!IsLinkTaskFinished(runtime)) break;
      SetLinkStandbyCallback(runtime);
      task.data[0]++;
      break;
    case 1:
      if (IsLinkTaskFinished(runtime)) {
        WarpFadeInScreen(runtime);
        task.data[0]++;
      }
      break;
    case 2:
      if (FieldFadeTransitionBackgroundEffectIsFinished(runtime) === true) {
        StartSendingKeysToLink(runtime);
        UnlockPlayerFieldControls(runtime);
        DestroyTask(runtime, taskId);
      }
      break;
  }
};

export const FieldCB_ReturnToFieldWirelessLink = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  Overworld_PlaySpecialMapMusic(runtime);
  palette_bg_faded_fill_black(runtime);
  CreateTask(runtime, Task_ReturnToFieldRecordMixing, 10);
};

export const ExitWarpFadeInScreen = (runtime: FieldFadeTransitionRuntime, playerNotMoving: boolean): void => {
  if (!playerNotMoving) {
    WarpFadeInScreen(runtime);
  } else {
    FadeInFromBlack(runtime);
  }
};

export const SetUpWarpExitTask = (runtime: FieldFadeTransitionRuntime, playerNotMoving: boolean): void => {
  const { x, y } = PlayerGetDestCoords(runtime);
  const metatileBehavior = MapGridGetMetatileBehaviorAt(runtime, x, y);
  let func: FieldFadeTaskFunc;
  if (MetatileBehavior_IsWarpDoor_2(metatileBehavior) === true) {
    func = Task_ExitDoor;
    switch (MapTransitionIsExit(runtime.lastUsedWarpMapType, runtime.currentMapType)) {
      case false:
        palette_bg_faded_fill_black(runtime);
        break;
      case true:
        palette_bg_faded_fill_white(runtime);
        break;
    }
  } else {
    ExitWarpFadeInScreen(runtime, playerNotMoving);
    if (MetatileBehavior_IsNonAnimDoor(metatileBehavior) === true) {
      func = Task_ExitNonAnimDoor;
    } else if (MetatileBehavior_IsDirectionalStairWarp(metatileBehavior) === true) {
      const tmp = runtime.gExitStairsMovementDisabled;
      func = Task_ExitNonDoor;
      if (!tmp) {
        func = Task_ExitStairs;
      }
    } else {
      func = Task_ExitNonDoor;
    }
  }
  runtime.gExitStairsMovementDisabled = false;
  CreateTask(runtime, func, 10);
};

export const FieldCB_DefaultWarpExit = (runtime: FieldFadeTransitionRuntime): void => {
  Overworld_PlaySpecialMapMusic(runtime);
  QuestLog_DrawPreviouslyOnQuestHeaderIfInPlaybackMode(runtime);
  SetUpWarpExitTask(runtime, false);
  LockPlayerFieldControls(runtime);
};

export const FieldCB_WarpExitFadeFromBlack = (runtime: FieldFadeTransitionRuntime): void => {
  Overworld_PlaySpecialMapMusic(runtime);
  QuestLog_DrawPreviouslyOnQuestHeaderIfInPlaybackMode(runtime);
  SetUpWarpExitTask(runtime, true);
  LockPlayerFieldControls(runtime);
};

export const FieldCB_TeleportWarpIn = (runtime: FieldFadeTransitionRuntime): void => {
  Overworld_PlaySpecialMapMusic(runtime);
  WarpFadeInScreen(runtime);
  QuestLog_DrawPreviouslyOnQuestHeaderIfInPlaybackMode(runtime);
  PlaySE(runtime, SE_WARP_OUT);
  CreateTask(runtime, Task_TeleportWarpIn, 10);
  LockPlayerFieldControls(runtime);
};

export const Task_ExitDoor = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task.data[0] === 0) {
    task.data[0] = 5;
  }
  switch (task.data[0]) {
    case 0:
      SetPlayerVisibility(runtime, false);
      FreezeObjectEvents(runtime);
      {
        const { x, y } = PlayerGetDestCoords(runtime);
        task.data[2] = x;
        task.data[3] = y;
        FieldSetDoorOpened(runtime, x, y);
      }
      task.data[0] = 1;
      break;
    case 5:
      SetPlayerVisibility(runtime, false);
      FreezeObjectEvents(runtime);
      DoOutwardBarnDoorWipe(runtime);
      WarpFadeInScreenWithDelay(runtime);
      task.data[0] = 6;
      break;
    case 6:
      task.data[15]++;
      if (task.data[15] === 25) {
        const { x, y } = PlayerGetDestCoords(runtime);
        task.data[2] = x;
        task.data[3] = y;
        PlaySE(runtime, GetDoorSoundEffect(runtime, x, y));
        FieldAnimateDoorOpen(runtime, x, y);
        task.data[0] = 7;
      }
      break;
    case 7:
      if (!FieldIsDoorAnimationRunning(runtime)) {
        const { x, y } = PlayerGetDestCoords(runtime);
        task.data[12] = x;
        task.data[13] = y;
        SetPlayerVisibility(runtime, true);
        ObjectEventSetHeldMovement(runtime, getPlayerObj(runtime), MOVEMENT_ACTION_WALK_NORMAL_DOWN);
        task.data[0] = 8;
      }
      break;
    case 8:
      task.data[14]++;
      if (task.data[14] === 14) {
        FieldAnimateDoorClose(runtime, task.data[12], task.data[13]);
        task.data[0] = 9;
      }
      break;
    case 9:
      if (
        FieldFadeTransitionBackgroundEffectIsFinished(runtime) &&
        walkrun_is_standing_still(runtime) &&
        !FieldIsDoorAnimationRunning(runtime) &&
        !FuncIsActiveTask(runtime, Task_BarnDoorWipe)
      ) {
        ObjectEventClearHeldMovementIfFinished(runtime, getPlayerObj(runtime));
        task.data[0] = 4;
      }
      break;
    case 1:
      if (FieldFadeTransitionBackgroundEffectIsFinished(runtime)) {
        SetPlayerVisibility(runtime, true);
        ObjectEventSetHeldMovement(runtime, getPlayerObj(runtime), MOVEMENT_ACTION_WALK_NORMAL_DOWN);
        task.data[0] = 2;
      }
      break;
    case 2:
      if (walkrun_is_standing_still(runtime)) {
        task.data[1] = FieldAnimateDoorClose(runtime, task.data[2], task.data[3]);
        ObjectEventClearHeldMovementIfFinished(runtime, getPlayerObj(runtime));
        task.data[0] = 3;
      }
      break;
    case 3:
      if (task.data[1] < 0 || runtime.tasks[task.data[1]].isActive !== true) {
        task.data[0] = 4;
      }
      break;
    case 4:
      UnfreezeObjectEvents(runtime);
      UnlockPlayerFieldControls(runtime);
      DestroyTask(runtime, taskId);
      break;
  }
};

export const Task_BarnDoorWipe = (_runtime: FieldFadeTransitionRuntime, _taskId: number): void => {};

export const Task_ExitNonAnimDoor = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0: {
      SetPlayerVisibility(runtime, false);
      FreezeObjectEvents(runtime);
      const { x, y } = PlayerGetDestCoords(runtime);
      task.data[2] = x;
      task.data[3] = y;
      task.data[0] = 1;
      break;
    }
    case 1:
      if (FieldFadeTransitionBackgroundEffectIsFinished(runtime)) {
        SetPlayerVisibility(runtime, true);
        ObjectEventSetHeldMovement(runtime, getPlayerObj(runtime), GetWalkNormalMovementAction(GetPlayerFacingDirection(runtime)));
        task.data[0] = 2;
      }
      break;
    case 2:
      if (walkrun_is_standing_still(runtime)) {
        task.data[0] = 3;
      }
      break;
    case 3:
      UnfreezeObjectEvents(runtime);
      UnlockPlayerFieldControls(runtime);
      DestroyTask(runtime, taskId);
      break;
  }
};

export const Task_ExitNonDoor = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      FreezeObjectEvents(runtime);
      LockPlayerFieldControls(runtime);
      task.data[0]++;
      break;
    case 1:
      if (FieldFadeTransitionBackgroundEffectIsFinished(runtime)) {
        UnfreezeObjectEvents(runtime);
        UnlockPlayerFieldControls(runtime);
        DestroyTask(runtime, taskId);
      }
      break;
  }
};

export const Task_TeleportWarpIn = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      FreezeObjectEvents(runtime);
      LockPlayerFieldControls(runtime);
      StartTeleportInPlayerAnim(runtime);
      task.data[0]++;
      break;
    case 1:
      if (FieldFadeTransitionBackgroundEffectIsFinished(runtime) && WaitTeleportInPlayerAnim(runtime) !== true) {
        UnfreezeObjectEvents(runtime);
        UnlockPlayerFieldControls(runtime);
        DestroyTask(runtime, taskId);
      }
      break;
  }
};

export const Task_StartMenuHandleInput = (_runtime: FieldFadeTransitionRuntime, _taskId: number): void => {};

export const Task_WaitFadeAndCreateStartMenuTask = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  if (FieldFadeTransitionBackgroundEffectIsFinished(runtime) === true) {
    DestroyTask(runtime, taskId);
    CreateTask(runtime, Task_StartMenuHandleInput, 80);
  }
};

export const FadeTransition_FadeInOnReturnToStartMenu = (runtime: FieldFadeTransitionRuntime): void => {
  FadeInFromBlack(runtime);
  CreateTask(runtime, Task_WaitFadeAndCreateStartMenuTask, 80);
  LockPlayerFieldControls(runtime);
};

export const FieldCB_ReturnToFieldOpenStartMenu = (runtime: FieldFadeTransitionRuntime): boolean => {
  SetUpReturnToStartMenu(runtime);
  return false;
};

export const Task_SafariZoneRanOutOfBalls = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  if (FieldFadeTransitionBackgroundEffectIsFinished(runtime) === true) {
    UnlockPlayerFieldControls(runtime);
    DestroyTask(runtime, taskId);
    ClearPlayerHeldMovementAndUnfreezeObjectEvents(runtime);
  }
};

export const FieldCB_SafariZoneRanOutOfBalls = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  Overworld_PlaySpecialMapMusic(runtime);
  FadeInFromBlack(runtime);
  CreateTask(runtime, Task_SafariZoneRanOutOfBalls, 10);
};

export const DoWarp = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  TryFadeOutOldMapMusic(runtime);
  WarpFadeOutScreen(runtime);
  PlayRainStoppingSoundEffect(runtime);
  PlaySE(runtime, SE_EXIT);
  runtime.fieldCallback = 'FieldCB_DefaultWarpExit';
  CreateTask(runtime, Task_Teleport2Warp, 10);
};

export const DoDiveWarp = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  TryFadeOutOldMapMusic(runtime);
  WarpFadeOutScreen(runtime);
  PlayRainStoppingSoundEffect(runtime);
  runtime.fieldCallback = 'FieldCB_DefaultWarpExit';
  CreateTask(runtime, Task_Teleport2Warp, 10);
};

export const DoStairWarp = (runtime: FieldFadeTransitionRuntime, metatileBehavior: number, delay: number): void => {
  const taskId = CreateTask(runtime, Task_StairWarp, 10);
  runtime.tasks[taskId].data[1] = signed16(metatileBehavior);
  runtime.tasks[taskId].data[15] = signed16(delay);
  Task_StairWarp(runtime, taskId);
};

export const DoDoorWarp = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  runtime.fieldCallback = 'FieldCB_DefaultWarpExit';
  CreateTask(runtime, Task_DoorWarp, 10);
};

export const DoTeleport2Warp = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  CreateTask(runtime, Task_Teleport2Warp, 10);
  runtime.fieldCallback = 'FieldCB_TeleportWarpIn';
};

export const DoUnionRoomWarp = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  runtime.fieldCallback = 'FieldCB_DefaultWarpExit';
  CreateTask(runtime, Task_TeleportWarp, 10);
};

export const DoFallWarp = (runtime: FieldFadeTransitionRuntime): void => {
  DoDiveWarp(runtime);
  runtime.fieldCallback = 'FieldCB_FallWarpExit';
};

export const DoEscalatorWarp = (runtime: FieldFadeTransitionRuntime, metatileBehavior: number): void => {
  LockPlayerFieldControls(runtime);
  StartEscalatorWarp(runtime, metatileBehavior, 10);
};

export const DoLavaridgeGymB1FWarp = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  StartLavaridgeGymB1FWarp(runtime, 10);
};

export const DoLavaridgeGym1FWarp = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  StartLavaridgeGym1FWarp(runtime, 10);
};

export const DoTeleportWarp = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  TryFadeOutOldMapMusic(runtime);
  CreateTask(runtime, Task_TeleportWarp, 10);
  runtime.fieldCallback = 'FieldCB_TeleportWarpIn';
};

export const DoPortholeWarp = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  WarpFadeOutScreen(runtime);
  CreateTask(runtime, Task_Teleport2Warp, 10);
  runtime.fieldCallback = 'FieldCB_ShowPortholeView';
};

export const Task_CableClubWarp = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      LockPlayerFieldControls(runtime);
      task.data[0]++;
      break;
    case 1:
      if (!WaitWarpFadeOutScreen(runtime) && BGMusicStopped(runtime)) {
        task.data[0]++;
      }
      break;
    case 2:
      WarpIntoMap(runtime);
      SetMainCallback2(runtime, 'CB2_ReturnToFieldCableClub');
      DestroyTask(runtime, taskId);
      break;
  }
};

export const DoCableClubWarp = (runtime: FieldFadeTransitionRuntime): void => {
  LockPlayerFieldControls(runtime);
  TryFadeOutOldMapMusic(runtime);
  WarpFadeOutScreen(runtime);
  PlaySE(runtime, SE_EXIT);
  CreateTask(runtime, Task_CableClubWarp, 10);
};

export const Task_ReturnFromLinkRoomWarp = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const data = runtime.tasks[taskId].data;
  switch (data[0]) {
    case 0:
      ClearLinkCallback_2(runtime);
      FadeScreen(runtime, FADE_TO_BLACK, 0);
      TryFadeOutOldMapMusic(runtime);
      PlaySE(runtime, SE_EXIT);
      data[0]++;
      break;
    case 1:
      if (!WaitWarpFadeOutScreen(runtime) && BGMusicStopped(runtime)) {
        SetCloseLinkCallback(runtime);
        data[0]++;
      }
      break;
    case 2:
      if (!runtime.receivedRemoteLinkPlayers) {
        WarpIntoMap(runtime);
        SetMainCallback2(runtime, 'CB2_LoadMap');
        DestroyTask(runtime, taskId);
      }
      break;
  }
};

export const ReturnFromLinkRoom = (runtime: FieldFadeTransitionRuntime): void => {
  CreateTask(runtime, Task_ReturnFromLinkRoomWarp, 10);
};

export const Task_Teleport2Warp = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      FreezeObjectEvents(runtime);
      LockPlayerFieldControls(runtime);
      task.data[0]++;
      break;
    case 1:
      if (!WaitWarpFadeOutScreen(runtime) && BGMusicStopped(runtime)) {
        task.data[0]++;
      }
      break;
    case 2:
      WarpIntoMap(runtime);
      SetMainCallback2(runtime, 'CB2_LoadMap');
      DestroyTask(runtime, taskId);
      break;
  }
};

export const Task_TeleportWarp = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      FreezeObjectEvents(runtime);
      LockPlayerFieldControls(runtime);
      PlaySE(runtime, SE_WARP_IN);
      StartTeleportWarpOutPlayerAnim(runtime);
      task.data[0]++;
      break;
    case 1:
      if (!WaitTeleportWarpOutPlayerAnim(runtime)) {
        WarpFadeOutScreen(runtime);
        task.data[0]++;
      }
      break;
    case 2:
      if (!WaitWarpFadeOutScreen(runtime) && BGMusicStopped(runtime)) {
        task.data[0]++;
      }
      break;
    case 3:
      WarpIntoMap(runtime);
      SetMainCallback2(runtime, 'CB2_LoadMap');
      DestroyTask(runtime, taskId);
      break;
  }
};

export const Task_DoorWarp = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0: {
      FreezeObjectEvents(runtime);
      const { x, y } = PlayerGetDestCoords(runtime);
      task.data[2] = x;
      task.data[3] = y;
      PlaySE(runtime, GetDoorSoundEffect(runtime, x, y - 1));
      task.data[1] = FieldAnimateDoorOpen(runtime, x, y - 1);
      task.data[0] = 1;
      break;
    }
    case 1:
      if (task.data[1] < 0 || runtime.tasks[task.data[1]].isActive !== true) {
        ObjectEventClearHeldMovementIfActive(runtime, getPlayerObj(runtime));
        ObjectEventSetHeldMovement(runtime, getPlayerObj(runtime), MOVEMENT_ACTION_WALK_NORMAL_UP);
        task.data[0] = 2;
      }
      break;
    case 2:
      if (walkrun_is_standing_still(runtime)) {
        task.data[1] = FieldAnimateDoorClose(runtime, task.data[2], task.data[3] - 1);
        ObjectEventClearHeldMovementIfFinished(runtime, getPlayerObj(runtime));
        SetPlayerVisibility(runtime, false);
        task.data[0] = 3;
      }
      break;
    case 3:
      if (task.data[1] < 0 || runtime.tasks[task.data[1]].isActive !== true) {
        task.data[0] = 4;
      }
      break;
    case 4:
      TryFadeOutOldMapMusic(runtime);
      WarpFadeOutScreen(runtime);
      PlayRainStoppingSoundEffect(runtime);
      task.data[0] = 0;
      task.func = Task_Teleport2Warp;
      break;
    case 5:
      TryFadeOutOldMapMusic(runtime);
      PlayRainStoppingSoundEffect(runtime);
      task.data[0] = 0;
      task.func = Task_Teleport2Warp;
      break;
  }
};

export const GetStairsMovementDirection = (metatileBehavior: number): { x: number; y: number } => {
  if (MetatileBehavior_IsDirectionalUpRightStairWarp(metatileBehavior)) return { x: 16, y: -10 };
  if (MetatileBehavior_IsDirectionalUpLeftStairWarp(metatileBehavior)) return { x: -17, y: -10 };
  if (MetatileBehavior_IsDirectionalDownRightStairWarp(metatileBehavior)) return { x: 17, y: 3 };
  if (MetatileBehavior_IsDirectionalDownLeftStairWarp(metatileBehavior)) return { x: -17, y: 3 };
  return { x: 0, y: 0 };
};

export const ForceStairsMovement = (runtime: FieldFadeTransitionRuntime, metatileBehavior: number): { x: number; y: number } => {
  ObjectEventForceSetHeldMovement(runtime, getPlayerObj(runtime), GetWalkInPlaceNormalMovementAction(GetPlayerFacingDirection(runtime)));
  return GetStairsMovementDirection(metatileBehavior);
};

export const UpdateStairsMovement = (
  runtime: FieldFadeTransitionRuntime,
  speedX: number,
  speedY: number,
  data: number[],
  offsetXIndex: number,
  offsetYIndex: number,
  timerIndex: number
): void => {
  if (speedY > 0 || data[timerIndex] > 6) {
    data[offsetYIndex] = signed16(data[offsetYIndex] + speedY);
  }
  data[offsetXIndex] = signed16(data[offsetXIndex] + speedX);
  data[timerIndex] = signed16(data[timerIndex] + 1);
  getPlayerSpr(runtime).x2 = data[offsetXIndex] >> 5;
  getPlayerSpr(runtime).y2 = data[offsetYIndex] >> 5;
  if (getPlayerObj(runtime).heldMovementFinished) {
    ObjectEventForceSetHeldMovement(runtime, getPlayerObj(runtime), GetWalkInPlaceNormalMovementAction(GetPlayerFacingDirection(runtime)));
  }
};

export const Task_StairWarp = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const data = runtime.tasks[taskId].data;
  const playerObj = getPlayerObj(runtime);
  const playerSpr = getPlayerSpr(runtime);
  switch (data[0]) {
    case 0:
      LockPlayerFieldControls(runtime);
      FreezeObjectEvents(runtime);
      CameraObjectReset2(runtime);
      data[0]++;
      break;
    case 1:
      if (!ObjectEventIsMovementOverridden(runtime, playerObj) || ObjectEventClearHeldMovementIfFinished(runtime, playerObj)) {
        if (data[15] !== 0) {
          data[15]--;
        } else {
          TryFadeOutOldMapMusic(runtime);
          PlayRainStoppingSoundEffect(runtime);
          playerSpr.oam.priority = 1;
          const movement = ForceStairsMovement(runtime, data[1]);
          data[2] = movement.x;
          data[3] = movement.y;
          PlaySE(runtime, SE_EXIT);
          data[0]++;
        }
      }
      break;
    case 2:
      UpdateStairsMovement(runtime, data[2], data[3], data, 4, 5, 6);
      data[15]++;
      if (data[15] >= 12) {
        WarpFadeOutScreen(runtime);
        data[0]++;
      }
      break;
    case 3:
      UpdateStairsMovement(runtime, data[2], data[3], data, 4, 5, 6);
      if (!WaitWarpFadeOutScreen(runtime) && BGMusicStopped(runtime)) {
        data[0]++;
      }
      break;
    default:
      runtime.fieldCallback = 'FieldCB_DefaultWarpExit';
      WarpIntoMap(runtime);
      SetMainCallback2(runtime, 'CB2_LoadMap');
      DestroyTask(runtime, taskId);
      break;
  }
};

export const Task_ExitStairs = (runtime: FieldFadeTransitionRuntime, taskId: number): void => {
  const data = runtime.tasks[taskId].data;
  switch (data[0]) {
    default:
      if (FieldFadeTransitionBackgroundEffectIsFinished(runtime) === true) {
        CameraObjectReset1(runtime);
        UnlockPlayerFieldControls(runtime);
        DestroyTask(runtime, taskId);
      }
      break;
    case 0:
      Overworld_PlaySpecialMapMusic(runtime);
      WarpFadeInScreen(runtime);
      LockPlayerFieldControls(runtime);
      ExitStairsMovement(runtime, data, 1, 2, 3, 4, 5);
      data[0]++;
      break;
    case 1:
      if (!WaitStairExitMovementFinished(runtime, data, 1, 2, 3, 4, 5)) {
        data[0]++;
      }
      break;
  }
};

export const ExitStairsMovement = (
  runtime: FieldFadeTransitionRuntime,
  data: number[],
  speedXIndex: number,
  speedYIndex: number,
  offsetXIndex: number,
  offsetYIndex: number,
  timerIndex: number
): void => {
  const { x, y } = PlayerGetDestCoords(runtime);
  const metatileBehavior = MapGridGetMetatileBehaviorAt(runtime, x, y);
  const direction =
    MetatileBehavior_IsDirectionalDownRightStairWarp(metatileBehavior) ||
    MetatileBehavior_IsDirectionalUpRightStairWarp(metatileBehavior)
      ? DIR_WEST
      : DIR_EAST;
  ObjectEventForceSetHeldMovement(runtime, getPlayerObj(runtime), GetWalkInPlaceFastMovementAction(direction));
  const movement = GetStairsMovementDirection(metatileBehavior);
  data[speedXIndex] = movement.x;
  data[speedYIndex] = movement.y;
  data[offsetXIndex] = signed16(data[speedXIndex] * 16);
  data[offsetYIndex] = signed16(data[speedYIndex] * 16);
  data[timerIndex] = 16;
  getPlayerSpr(runtime).x2 = data[offsetXIndex] >> 5;
  getPlayerSpr(runtime).y2 = data[offsetYIndex] >> 5;
  data[speedXIndex] = signed16(data[speedXIndex] * -1);
  data[speedYIndex] = signed16(data[speedYIndex] * -1);
};

export const WaitStairExitMovementFinished = (
  runtime: FieldFadeTransitionRuntime,
  data: number[],
  speedXIndex: number,
  speedYIndex: number,
  offsetXIndex: number,
  offsetYIndex: number,
  timerIndex: number
): boolean => {
  const sprite = getPlayerSpr(runtime);
  if (data[timerIndex] !== 0) {
    data[offsetXIndex] = signed16(data[offsetXIndex] + data[speedXIndex]);
    data[offsetYIndex] = signed16(data[offsetYIndex] + data[speedYIndex]);
    sprite.x2 = data[offsetXIndex] >> 5;
    sprite.y2 = data[offsetYIndex] >> 5;
    data[timerIndex]--;
    return true;
  }
  sprite.x2 = 0;
  sprite.y2 = 0;
  return false;
};
