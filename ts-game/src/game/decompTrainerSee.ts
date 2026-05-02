export const OBJECT_EVENTS_COUNT = 16;
export const MAX_SPRITES = 64;

export const DIR_NONE = 0;
export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;

export const TRAINER_TYPE_NONE = 0;
export const TRAINER_TYPE_NORMAL = 1;
export const TRAINER_TYPE_SEE_ALL_DIRECTIONS = 2;
export const TRAINER_TYPE_BURIED = 3;

export const TRAINER_BATTLE_DOUBLE = 4;

export const MOVEMENT_TYPE_FACE_UP = 0x7;
export const MOVEMENT_TYPE_FACE_DOWN = 0x8;
export const MOVEMENT_TYPE_FACE_LEFT = 0x9;
export const MOVEMENT_TYPE_FACE_RIGHT = 0xa;
export const MOVEMENT_TYPE_TREE_DISGUISE = 0x39;
export const MOVEMENT_TYPE_MOUNTAIN_DISGUISE = 0x3a;
export const MOVEMENT_TYPE_BURIED = 0x3f;

export const MOVEMENT_ACTION_FACE_DOWN = 0x0;
export const MOVEMENT_ACTION_FACE_UP = 0x1;
export const MOVEMENT_ACTION_FACE_LEFT = 0x2;
export const MOVEMENT_ACTION_FACE_RIGHT = 0x3;
export const MOVEMENT_ACTION_WALK_NORMAL_DOWN = 0x10;
export const MOVEMENT_ACTION_WALK_NORMAL_UP = 0x11;
export const MOVEMENT_ACTION_WALK_NORMAL_LEFT = 0x12;
export const MOVEMENT_ACTION_WALK_NORMAL_RIGHT = 0x13;
export const MOVEMENT_ACTION_WALK_FAST_DOWN = 0x1d;
export const MOVEMENT_ACTION_WALK_FAST_UP = 0x1e;
export const MOVEMENT_ACTION_WALK_FAST_LEFT = 0x1f;
export const MOVEMENT_ACTION_WALK_FAST_RIGHT = 0x20;
export const MOVEMENT_ACTION_FACE_PLAYER = 0x4a;
export const MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN = 0x52;
export const MOVEMENT_ACTION_JUMP_IN_PLACE_UP = 0x53;
export const MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT = 0x54;
export const MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT = 0x55;
export const MOVEMENT_ACTION_REVEAL_TRAINER = 0x67;

export const FLDEFF_EXCLAMATION_MARK_ICON = 0;
export const FLDEFF_QUESTION_MARK_ICON = 33;
export const FLDEFF_X_ICON = 46;
export const FLDEFF_POP_OUT_OF_ASH = 49;
export const FLDEFF_SMILEY_FACE_ICON = 64;
export const FLDEFF_DOUBLE_EXCL_MARK_ICON = 66;

export const OBJ_EVENT_GFX_YOUNGSTER = 97;
export const LOCALID_CAMERA = 127;

export type TrainerSeeTaskFunc =
  | 'Task_RunTrainerSeeFuncList'
  | 'Task_RevealTrainer_RunTrainerSeeFuncList'
  | 'Task_DestroyTrainerApproachTask'
  | 'custom';

export interface Coords16 {
  x: number;
  y: number;
}

export interface TrainerSeeObjectEvent {
  id: number;
  active: boolean;
  trainerType: number;
  trainerRange_berryTreeId: number;
  facingDirection: number;
  currentCoords: Coords16;
  rangeX: number;
  rangeY: number;
  movementType: number;
  spriteId: number;
  localId: number;
  mapNum: number;
  mapGroup: number;
  invisible: boolean;
  fixedPriority: boolean;
  triggerGroundEffectsOnMove: boolean;
  heldMovement: number | null;
  movementOverridden: boolean;
  heldMovementFinished: boolean;
  templateCoords: Coords16;
}

export interface TrainerSeeSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  animCmdIndex: number;
  animEnded: boolean;
  oam: { priority: number };
  coordOffsetEnabled: number;
  subpriority: number;
  animNum: number | null;
  stoppedFieldEffectId: number | null;
}

export interface TrainerSeeTask {
  func: TrainerSeeTaskFunc;
  data: number[];
  priority: number;
  destroyed: boolean;
  followupFunc: TrainerSeeTaskFunc | null;
}

export interface TrainerSeeRuntime {
  objectEvents: TrainerSeeObjectEvent[];
  sprites: TrainerSeeSprite[];
  tasks: Array<TrainerSeeTask | null>;
  playerAvatar: { objectEventId: number };
  saveBlock1: { pos: Coords16; location: { mapNum: number; mapGroup: number } };
  fieldEffectArguments: number[];
  activeFieldEffects: Set<number>;
  trainerSightDisabled: boolean;
  trainerFlags: Set<number>;
  scriptsByObjectEventId: Map<number, number[]>;
  playerDestCoords: Coords16;
  firstInactiveObjectEventId: number;
  getMonsStateToDoubles: boolean;
  collisionFlagsAtCoords: Map<string, number>;
  collisionAtCoords: Map<string, number>;
  configuredBattles: Array<{ trainerObjId: number; script: number[] }>;
  followedObjectId: number | null;
  playerForcedMovementCanceled: boolean;
  scriptContextEnabled: boolean;
  operations: string[];
}

const tFuncId = 0;
const tTrainerObjId = 1;
const tTrainerRange = 3;
const tOutOfAshSpriteId = 4;
const tData5 = 5;

const sLocalId = 0;
const sMapNum = 1;
const sMapGroup = 2;
const sData3 = 3;
const sData4 = 4;
const sFldEffId = 7;

const directionVectors: Record<number, Coords16> = {
  [DIR_NONE]: { x: 0, y: 0 },
  [DIR_SOUTH]: { x: 0, y: 1 },
  [DIR_NORTH]: { x: 0, y: -1 },
  [DIR_WEST]: { x: -1, y: 0 },
  [DIR_EAST]: { x: 1, y: 0 }
};

const faceDirectionMovementActions: Record<number, number> = {
  [DIR_NONE]: MOVEMENT_ACTION_FACE_DOWN,
  [DIR_SOUTH]: MOVEMENT_ACTION_FACE_DOWN,
  [DIR_NORTH]: MOVEMENT_ACTION_FACE_UP,
  [DIR_WEST]: MOVEMENT_ACTION_FACE_LEFT,
  [DIR_EAST]: MOVEMENT_ACTION_FACE_RIGHT
};

const walkNormalMovementActions: Record<number, number> = {
  [DIR_NONE]: MOVEMENT_ACTION_WALK_NORMAL_DOWN,
  [DIR_SOUTH]: MOVEMENT_ACTION_WALK_NORMAL_DOWN,
  [DIR_NORTH]: MOVEMENT_ACTION_WALK_NORMAL_UP,
  [DIR_WEST]: MOVEMENT_ACTION_WALK_NORMAL_LEFT,
  [DIR_EAST]: MOVEMENT_ACTION_WALK_NORMAL_RIGHT
};

const walkFastMovementActions: Record<number, number> = {
  [DIR_NONE]: MOVEMENT_ACTION_WALK_FAST_DOWN,
  [DIR_SOUTH]: MOVEMENT_ACTION_WALK_FAST_DOWN,
  [DIR_NORTH]: MOVEMENT_ACTION_WALK_FAST_UP,
  [DIR_WEST]: MOVEMENT_ACTION_WALK_FAST_LEFT,
  [DIR_EAST]: MOVEMENT_ACTION_WALK_FAST_RIGHT
};

const jumpInPlaceMovementActions: Record<number, number> = {
  [DIR_NONE]: MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN,
  [DIR_SOUTH]: MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN,
  [DIR_NORTH]: MOVEMENT_ACTION_JUMP_IN_PLACE_UP,
  [DIR_WEST]: MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT,
  [DIR_EAST]: MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT
};

const trainerFacingDirectionMovementTypes: Record<number, number> = {
  [DIR_SOUTH]: MOVEMENT_TYPE_FACE_DOWN,
  [DIR_NORTH]: MOVEMENT_TYPE_FACE_UP,
  [DIR_WEST]: MOVEMENT_TYPE_FACE_LEFT,
  [DIR_EAST]: MOVEMENT_TYPE_FACE_RIGHT
};

export const createTrainerSeeSprite = (): TrainerSeeSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array(8).fill(0),
  animCmdIndex: 0,
  animEnded: false,
  oam: { priority: 1 },
  coordOffsetEnabled: 0,
  subpriority: 0,
  animNum: null,
  stoppedFieldEffectId: null
});

export const createTrainerSeeObjectEvent = (id: number, values: Partial<TrainerSeeObjectEvent> = {}): TrainerSeeObjectEvent => ({
  id,
  active: false,
  trainerType: TRAINER_TYPE_NONE,
  trainerRange_berryTreeId: 0,
  facingDirection: DIR_SOUTH,
  currentCoords: { x: 0, y: 0 },
  rangeX: 0,
  rangeY: 0,
  movementType: MOVEMENT_TYPE_FACE_DOWN,
  spriteId: id,
  localId: id,
  mapNum: 0,
  mapGroup: 0,
  invisible: false,
  fixedPriority: false,
  triggerGroundEffectsOnMove: false,
  heldMovement: null,
  movementOverridden: false,
  heldMovementFinished: true,
  templateCoords: { x: 0, y: 0 },
  ...values
});

export const createTrainerSeeRuntime = (): TrainerSeeRuntime => {
  const objectEvents = Array.from({ length: OBJECT_EVENTS_COUNT }, (_, id) => createTrainerSeeObjectEvent(id));
  const sprites = Array.from({ length: MAX_SPRITES }, () => createTrainerSeeSprite());
  return {
    objectEvents,
    sprites,
    tasks: [],
    playerAvatar: { objectEventId: 0 },
    saveBlock1: { pos: { x: 0, y: 0 }, location: { mapNum: 0, mapGroup: 0 } },
    fieldEffectArguments: Array(8).fill(0),
    activeFieldEffects: new Set(),
    trainerSightDisabled: false,
    trainerFlags: new Set(),
    scriptsByObjectEventId: new Map(),
    playerDestCoords: { x: 0, y: 0 },
    firstInactiveObjectEventId: 0,
    getMonsStateToDoubles: false,
    collisionFlagsAtCoords: new Map(),
    collisionAtCoords: new Map(),
    configuredBattles: [],
    followedObjectId: null,
    playerForcedMovementCanceled: false,
    scriptContextEnabled: false,
    operations: []
  };
};

const keyFor = (objectEvent: TrainerSeeObjectEvent, x: number, y: number, direction: number): string =>
  `${objectEvent.id}:${x}:${y}:${direction}`;

export const setCollisionFlagAtCoords = (
  runtime: TrainerSeeRuntime,
  objectEvent: TrainerSeeObjectEvent,
  x: number,
  y: number,
  direction: number,
  collision: number
): void => {
  runtime.collisionFlagsAtCoords.set(keyFor(objectEvent, x, y, direction), collision);
};

export const setCollisionAtCoords = (
  runtime: TrainerSeeRuntime,
  objectEvent: TrainerSeeObjectEvent,
  x: number,
  y: number,
  direction: number,
  collision: number
): void => {
  runtime.collisionAtCoords.set(keyFor(objectEvent, x, y, direction), collision);
};

export function MoveCoords(direction: number, coords: Coords16): void {
  const vector = directionVectors[direction] ?? directionVectors[DIR_NONE];
  coords.x += vector.x;
  coords.y += vector.y;
}

export function GetTrainerApproachDistanceSouth(
  runtime: TrainerSeeRuntime,
  trainerObj: TrainerSeeObjectEvent,
  range: number,
  x: number,
  y: number
): number {
  if (trainerObj.currentCoords.x === x && y > trainerObj.currentCoords.y && y <= trainerObj.currentCoords.y + range) {
    if (range > 3 && runtime.firstInactiveObjectEventId === OBJECT_EVENTS_COUNT) {
      return 0;
    }
    return y - trainerObj.currentCoords.y;
  }
  return 0;
}

export function GetTrainerApproachDistanceNorth(
  _runtime: TrainerSeeRuntime,
  trainerObj: TrainerSeeObjectEvent,
  range: number,
  x: number,
  y: number
): number {
  if (trainerObj.currentCoords.x === x && y < trainerObj.currentCoords.y && y >= trainerObj.currentCoords.y - range) {
    return trainerObj.currentCoords.y - y;
  }
  return 0;
}

export function GetTrainerApproachDistanceWest(
  _runtime: TrainerSeeRuntime,
  trainerObj: TrainerSeeObjectEvent,
  range: number,
  x: number,
  y: number
): number {
  if (trainerObj.currentCoords.y === y && x < trainerObj.currentCoords.x && x >= trainerObj.currentCoords.x - range) {
    return trainerObj.currentCoords.x - x;
  }
  return 0;
}

export function GetTrainerApproachDistanceEast(
  _runtime: TrainerSeeRuntime,
  trainerObj: TrainerSeeObjectEvent,
  range: number,
  x: number,
  y: number
): number {
  if (trainerObj.currentCoords.y === y && x > trainerObj.currentCoords.x && x <= trainerObj.currentCoords.x + range) {
    return x - trainerObj.currentCoords.x;
  }
  return 0;
}

const directionalApproachDistanceFuncs = [
  GetTrainerApproachDistanceSouth,
  GetTrainerApproachDistanceNorth,
  GetTrainerApproachDistanceWest,
  GetTrainerApproachDistanceEast
];

export function CheckPathBetweenTrainerAndPlayer(
  runtime: TrainerSeeRuntime,
  trainerObj: TrainerSeeObjectEvent,
  approachDistance: number,
  facingDirection: number
): number {
  if (approachDistance === 0) {
    return 0;
  }

  const coords = { x: trainerObj.currentCoords.x, y: trainerObj.currentCoords.y };
  for (let i = 0; i <= approachDistance - 1; i++, MoveCoords(facingDirection, coords)) {
    const collision = runtime.collisionFlagsAtCoords.get(keyFor(trainerObj, coords.x, coords.y, facingDirection)) ?? 0;
    if (collision !== 0 && (collision & ~1) !== 0) {
      return 0;
    }
  }

  const rangeX = trainerObj.rangeX;
  const rangeY = trainerObj.rangeY;
  trainerObj.rangeX = 0;
  trainerObj.rangeY = 0;

  const collision = runtime.collisionAtCoords.get(keyFor(trainerObj, coords.x, coords.y, facingDirection)) ?? 0;

  trainerObj.rangeX = rangeX;
  trainerObj.rangeY = rangeY;
  if (collision === 4) {
    return approachDistance;
  }
  return 0;
}

export function GetTrainerApproachDistance(runtime: TrainerSeeRuntime, trainerObj: TrainerSeeObjectEvent): number {
  const x = runtime.playerDestCoords.x;
  const y = runtime.playerDestCoords.y;

  if (trainerObj.trainerType === TRAINER_TYPE_NORMAL) {
    const approachDistance = directionalApproachDistanceFuncs[trainerObj.facingDirection - 1](
      runtime,
      trainerObj,
      trainerObj.trainerRange_berryTreeId,
      x,
      y
    );
    return CheckPathBetweenTrainerAndPlayer(runtime, trainerObj, approachDistance, trainerObj.facingDirection);
  }

  for (let i = 0; i < 4; i++) {
    const approachDistance = directionalApproachDistanceFuncs[i](
      runtime,
      trainerObj,
      trainerObj.trainerRange_berryTreeId,
      x,
      y
    );
    if (CheckPathBetweenTrainerAndPlayer(runtime, trainerObj, approachDistance, i + 1) !== 0) {
      return approachDistance;
    }
  }
  return 0;
}

export function CheckForTrainersWantingBattle(runtime: TrainerSeeRuntime): boolean {
  if (runtime.trainerSightDisabled === true) {
    return false;
  }

  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    const objectEvent = runtime.objectEvents[i];
    if (
      objectEvent.active &&
      (objectEvent.trainerType === TRAINER_TYPE_NORMAL || objectEvent.trainerType === TRAINER_TYPE_BURIED) &&
      CheckTrainer(runtime, i)
    ) {
      return true;
    }
  }
  return false;
}

export function CheckTrainer(runtime: TrainerSeeRuntime, trainerObjId: number): boolean {
  const script = runtime.scriptsByObjectEventId.get(trainerObjId) ?? [];
  if (runtime.trainerFlags.has(trainerObjId)) {
    return false;
  }

  const approachDistance = GetTrainerApproachDistance(runtime, runtime.objectEvents[trainerObjId]);
  if (approachDistance !== 0) {
    if (script[1] === TRAINER_BATTLE_DOUBLE && runtime.getMonsStateToDoubles) {
      return false;
    }
    runtime.configuredBattles.push({ trainerObjId, script });
    TrainerApproachPlayer(runtime, runtime.objectEvents[trainerObjId], approachDistance - 1);
    return true;
  }
  return false;
}

export function TrainerApproachPlayer(
  runtime: TrainerSeeRuntime,
  trainerObj: TrainerSeeObjectEvent,
  approachDistance: number
): number {
  const taskId = CreateTask(runtime, 'Task_RunTrainerSeeFuncList', 80);
  const task = runtime.tasks[taskId]!;
  task.data[tTrainerObjId] = trainerObj.id;
  task.data[tTrainerRange] = approachDistance;
  return taskId;
}

export function StartTrainerApproachWithFollowupTask(runtime: TrainerSeeRuntime, taskFunc: TrainerSeeTaskFunc): void {
  const taskId = FindTaskIdByFunc(runtime, 'Task_RunTrainerSeeFuncList');
  SetTaskFuncWithFollowupFunc(runtime, taskId, 'Task_RunTrainerSeeFuncList', taskFunc);
  runtime.tasks[taskId]!.data[tFuncId] = 1;
  Task_RunTrainerSeeFuncList(runtime, taskId);
}

export function Task_RunTrainerSeeFuncList(runtime: TrainerSeeRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const trainerObj = runtime.objectEvents[task.data[tTrainerObjId]];

  if (!trainerObj.active) {
    SwitchTaskToFollowupFunc(runtime, taskId);
  } else {
    while (trainerSeeFuncList[task.data[tFuncId]](runtime, taskId, task, trainerObj)) {
      continue;
    }
  }
}

export function TrainerSeeFunc_Dummy(
  _runtime: TrainerSeeRuntime,
  _taskId: number,
  _task: TrainerSeeTask,
  _trainerObj: TrainerSeeObjectEvent
): boolean {
  return false;
}

export function TrainerSeeFunc_StartExclMark(
  runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  trainerObj: TrainerSeeObjectEvent
): boolean {
  if (trainerObj.facingDirection === DIR_SOUTH && task.data[tTrainerRange] > 2) {
    task.data[tFuncId] = 12;
  } else {
    ObjectEventGetLocalIdAndMap(runtime, trainerObj);
    FieldEffectStart(runtime, FLDEFF_EXCLAMATION_MARK_ICON);
    ObjectEventSetHeldMovement(trainerObj, GetFaceDirectionMovementAction(trainerObj.facingDirection));
    task.data[tFuncId]++;
  }
  return true;
}

export function TrainerSeeFunc_WaitExclMark(
  runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  trainerObj: TrainerSeeObjectEvent
): boolean {
  if (FieldEffectActiveListContains(runtime, FLDEFF_EXCLAMATION_MARK_ICON)) {
    return false;
  }

  task.data[tFuncId]++;
  if (trainerObj.movementType === MOVEMENT_TYPE_TREE_DISGUISE || trainerObj.movementType === MOVEMENT_TYPE_MOUNTAIN_DISGUISE) {
    task.data[tFuncId] = 6;
  }
  if (trainerObj.movementType === MOVEMENT_TYPE_BURIED) {
    task.data[tFuncId] = 8;
  }
  return true;
}

export function TrainerSeeFunc_TrainerApproach(
  _runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  trainerObj: TrainerSeeObjectEvent
): boolean {
  if (!ObjectEventIsMovementOverridden(trainerObj) || ObjectEventClearHeldMovementIfFinished(trainerObj)) {
    if (task.data[tTrainerRange] !== 0) {
      ObjectEventSetHeldMovement(trainerObj, GetWalkNormalMovementAction(trainerObj.facingDirection));
      task.data[tTrainerRange]--;
    } else {
      ObjectEventSetHeldMovement(trainerObj, MOVEMENT_ACTION_FACE_PLAYER);
      task.data[tFuncId]++;
    }
  }
  return false;
}

export function TrainerSeeFunc_PrepareToEngage(
  runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  trainerObj: TrainerSeeObjectEvent
): boolean {
  if (ObjectEventIsMovementOverridden(trainerObj) && !ObjectEventClearHeldMovementIfFinished(trainerObj)) {
    return false;
  }

  SetTrainerMovementType(trainerObj, GetTrainerFacingDirectionMovementType(trainerObj.facingDirection));
  OverrideMovementTypeForObjectEvent(trainerObj, GetTrainerFacingDirectionMovementType(trainerObj.facingDirection));
  OverrideTemplateCoordsForObjectEvent(trainerObj);

  const playerObj = runtime.objectEvents[runtime.playerAvatar.objectEventId];
  if (ObjectEventIsMovementOverridden(playerObj) && !ObjectEventClearHeldMovementIfFinished(playerObj)) {
    return false;
  }

  CancelPlayerForcedMovement(runtime);
  task.data[tFuncId]++;
  return false;
}

export function TrainerSeeFunc_End(
  runtime: TrainerSeeRuntime,
  taskId: number,
  _task: TrainerSeeTask,
  _trainerObj: TrainerSeeObjectEvent
): boolean {
  const playerObj = runtime.objectEvents[runtime.playerAvatar.objectEventId];
  if (!ObjectEventIsMovementOverridden(playerObj) || ObjectEventClearHeldMovementIfFinished(playerObj)) {
    SwitchTaskToFollowupFunc(runtime, taskId);
  }
  return false;
}

export function TrainerSeeFunc_BeginRemoveDisguise(
  _runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  trainerObj: TrainerSeeObjectEvent
): boolean {
  if (!ObjectEventIsMovementOverridden(trainerObj) || ObjectEventClearHeldMovementIfFinished(trainerObj)) {
    ObjectEventSetHeldMovement(trainerObj, MOVEMENT_ACTION_REVEAL_TRAINER);
    task.data[tFuncId]++;
  }
  return false;
}

export function TrainerSeeFunc_WaitRemoveDisguise(
  _runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  trainerObj: TrainerSeeObjectEvent
): boolean {
  if (ObjectEventClearHeldMovementIfFinished(trainerObj)) {
    task.data[tFuncId] = 3;
  }
  return false;
}

export function TrainerSeeFunc_TrainerInAshFacesPlayer(
  _runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  trainerObj: TrainerSeeObjectEvent
): boolean {
  if (!ObjectEventIsMovementOverridden(trainerObj) || ObjectEventClearHeldMovementIfFinished(trainerObj)) {
    ObjectEventSetHeldMovement(trainerObj, MOVEMENT_ACTION_FACE_PLAYER);
    task.data[tFuncId]++;
  }
  return false;
}

export function TrainerSeeFunc_BeginJumpOutOfAsh(
  runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  trainerObj: TrainerSeeObjectEvent
): boolean {
  if (ObjectEventCheckHeldMovementStatus(trainerObj)) {
    runtime.fieldEffectArguments[0] = trainerObj.currentCoords.x;
    runtime.fieldEffectArguments[1] = trainerObj.currentCoords.y;
    runtime.fieldEffectArguments[2] = runtime.sprites[trainerObj.spriteId].subpriority - 1;
    runtime.fieldEffectArguments[3] = 2;
    task.data[tOutOfAshSpriteId] = FieldEffectStart(runtime, FLDEFF_POP_OUT_OF_ASH);
    task.data[tFuncId]++;
  }
  return false;
}

export function TrainerSeeFunc_WaitJumpOutOfAsh(
  runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  trainerObj: TrainerSeeObjectEvent
): boolean {
  if (runtime.sprites[task.data[tOutOfAshSpriteId]]?.animCmdIndex === 2) {
    trainerObj.fixedPriority = false;
    trainerObj.triggerGroundEffectsOnMove = true;

    const sprite = runtime.sprites[trainerObj.spriteId];
    sprite.oam.priority = 2;
    ObjectEventClearHeldMovementIfFinished(trainerObj);
    ObjectEventSetHeldMovement(trainerObj, GetJumpInPlaceMovementAction(trainerObj.facingDirection));
    task.data[tFuncId]++;
  }
  return false;
}

export function TrainerSeeFunc_EndJumpOutOfAsh(
  runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  _trainerObj: TrainerSeeObjectEvent
): boolean {
  if (!FieldEffectActiveListContains(runtime, FLDEFF_POP_OUT_OF_ASH)) {
    task.data[tFuncId] = 3;
  }
  return false;
}

export function TrainerSeeFunc_OffscreenAboveTrainerCreateCameraObj(
  runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  _trainerObj: TrainerSeeObjectEvent
): boolean {
  task.data[tData5] = 0;
  const specialObjectId = SpawnSpecialObjectEventParameterized(
    runtime,
    OBJ_EVENT_GFX_YOUNGSTER,
    7,
    LOCALID_CAMERA,
    runtime.saveBlock1.pos.x + 7,
    runtime.saveBlock1.pos.y + 7,
    3
  );
  runtime.objectEvents[specialObjectId].invisible = true;
  CameraObjectSetFollowedObjectId(runtime, runtime.objectEvents[specialObjectId].spriteId);
  task.data[tFuncId]++;
  return false;
}

export function TrainerSeeFunc_OffscreenAboveTrainerCameraObjMoveUp(
  runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  trainerObj: TrainerSeeObjectEvent
): boolean {
  const specialObjectId = TryGetObjectEventIdByLocalIdAndMap(
    runtime,
    LOCALID_CAMERA,
    runtime.saveBlock1.location.mapNum,
    runtime.saveBlock1.location.mapGroup
  );

  if (
    specialObjectId !== null &&
    ObjectEventIsMovementOverridden(runtime.objectEvents[specialObjectId]) &&
    !ObjectEventClearHeldMovementIfFinished(runtime.objectEvents[specialObjectId])
  ) {
    return false;
  }

  if (specialObjectId !== null && task.data[tData5] !== task.data[tTrainerRange] - 1) {
    ObjectEventSetHeldMovement(runtime.objectEvents[specialObjectId], GetWalkFastMovementAction(DIR_NORTH));
    task.data[tData5]++;
  } else {
    ObjectEventGetLocalIdAndMap(runtime, trainerObj);
    FieldEffectStart(runtime, FLDEFF_EXCLAMATION_MARK_ICON);
    task.data[tData5] = 0;
    task.data[tFuncId]++;
  }
  return false;
}

export function TrainerSeeFunc_OffscreenAboveTrainerCameraObjMoveDown(
  runtime: TrainerSeeRuntime,
  _taskId: number,
  task: TrainerSeeTask,
  _trainerObj: TrainerSeeObjectEvent
): boolean {
  const specialObjectId = TryGetObjectEventIdByLocalIdAndMap(
    runtime,
    LOCALID_CAMERA,
    runtime.saveBlock1.location.mapNum,
    runtime.saveBlock1.location.mapGroup
  );

  if (FieldEffectActiveListContains(runtime, FLDEFF_EXCLAMATION_MARK_ICON)) {
    return false;
  }

  if (
    specialObjectId !== null &&
    ObjectEventIsMovementOverridden(runtime.objectEvents[specialObjectId]) &&
    !ObjectEventClearHeldMovementIfFinished(runtime.objectEvents[specialObjectId])
  ) {
    return false;
  }

  if (specialObjectId !== null && task.data[tData5] !== task.data[tTrainerRange] - 1) {
    ObjectEventSetHeldMovement(runtime.objectEvents[specialObjectId], GetWalkFastMovementAction(DIR_SOUTH));
    task.data[tData5]++;
  } else {
    CameraObjectSetFollowedObjectId(runtime, GetPlayerAvatarObjectId(runtime));
    RemoveObjectEventByLocalIdAndMap(
      runtime,
      LOCALID_CAMERA,
      runtime.saveBlock1.location.mapNum,
      runtime.saveBlock1.location.mapGroup
    );
    task.data[tData5] = 0;
    task.data[tFuncId] = 2;
  }
  return false;
}

const trainerSeeFuncList = [
  TrainerSeeFunc_Dummy,
  TrainerSeeFunc_StartExclMark,
  TrainerSeeFunc_WaitExclMark,
  TrainerSeeFunc_TrainerApproach,
  TrainerSeeFunc_PrepareToEngage,
  TrainerSeeFunc_End,
  TrainerSeeFunc_BeginRemoveDisguise,
  TrainerSeeFunc_WaitRemoveDisguise,
  TrainerSeeFunc_TrainerInAshFacesPlayer,
  TrainerSeeFunc_BeginJumpOutOfAsh,
  TrainerSeeFunc_WaitJumpOutOfAsh,
  TrainerSeeFunc_EndJumpOutOfAsh,
  TrainerSeeFunc_OffscreenAboveTrainerCreateCameraObj,
  TrainerSeeFunc_OffscreenAboveTrainerCameraObjMoveUp,
  TrainerSeeFunc_OffscreenAboveTrainerCameraObjMoveDown
];

const trainerSeeFuncList2 = [
  TrainerSeeFunc_TrainerInAshFacesPlayer,
  TrainerSeeFunc_BeginJumpOutOfAsh,
  TrainerSeeFunc_WaitJumpOutOfAsh,
  TrainerSeeFunc_EndJumpOutOfAsh
];

export function Task_RevealTrainer_RunTrainerSeeFuncList(runtime: TrainerSeeRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const trainerObj = runtime.objectEvents[task.data[1]];

  if (!task.data[7]) {
    ObjectEventClearHeldMovement(trainerObj);
    task.data[7]++;
  }
  trainerSeeFuncList2[task.data[0]](runtime, taskId, task, trainerObj);
  if (task.data[0] === 3 && !FieldEffectActiveListContains(runtime, FLDEFF_POP_OUT_OF_ASH)) {
    SetTrainerMovementType(trainerObj, GetTrainerFacingDirectionMovementType(trainerObj.facingDirection));
    OverrideMovementTypeForObjectEvent(trainerObj, GetTrainerFacingDirectionMovementType(trainerObj.facingDirection));
    DestroyTask(runtime, taskId);
  } else {
    trainerObj.heldMovementFinished = false;
  }
}

export function MovementAction_RevealTrainer_RunTrainerSeeFuncList(
  runtime: TrainerSeeRuntime,
  objectEvent: TrainerSeeObjectEvent
): number {
  const taskId = CreateTask(runtime, 'Task_RevealTrainer_RunTrainerSeeFuncList', 0);
  runtime.tasks[taskId]!.data[1] = objectEvent.id;
  return taskId;
}

export function EndTrainerApproach(runtime: TrainerSeeRuntime): void {
  StartTrainerApproachWithFollowupTask(runtime, 'Task_DestroyTrainerApproachTask');
}

export function Task_DestroyTrainerApproachTask(runtime: TrainerSeeRuntime, taskId: number): void {
  DestroyTask(runtime, taskId);
  ScriptContext_Enable(runtime);
}

export function FldEff_ExclamationMarkIcon1(runtime: TrainerSeeRuntime): number {
  const spriteId = CreateSpriteAtEnd(runtime, 0, 0, 0x53);
  if (spriteId !== MAX_SPRITES) {
    SetIconSpriteData(runtime.sprites[spriteId], runtime, FLDEFF_EXCLAMATION_MARK_ICON, 0);
  }
  return 0;
}

export function FldEff_DoubleExclMarkIcon(runtime: TrainerSeeRuntime): number {
  const spriteId = CreateSpriteAtEnd(runtime, 0, 0, 0x52);
  if (spriteId !== MAX_SPRITES) {
    SetIconSpriteData(runtime.sprites[spriteId], runtime, FLDEFF_DOUBLE_EXCL_MARK_ICON, 1);
  }
  return 0;
}

export function FldEff_XIcon(runtime: TrainerSeeRuntime): number {
  const spriteId = CreateSpriteAtEnd(runtime, 0, 0, 0x52);
  if (spriteId !== MAX_SPRITES) {
    SetIconSpriteData(runtime.sprites[spriteId], runtime, FLDEFF_X_ICON, 2);
  }
  return 0;
}

export function FldEff_SmileyFaceIcon(runtime: TrainerSeeRuntime): number {
  const spriteId = CreateSpriteAtEnd(runtime, 0, 0, 0x52);
  if (spriteId !== MAX_SPRITES) {
    SetIconSpriteData(runtime.sprites[spriteId], runtime, FLDEFF_SMILEY_FACE_ICON, 3);
  }
  return 0;
}

export function FldEff_QuestionMarkIcon(runtime: TrainerSeeRuntime): number {
  const spriteId = CreateSpriteAtEnd(runtime, 0, 0, 0x52);
  if (spriteId !== MAX_SPRITES) {
    SetIconSpriteData(runtime.sprites[spriteId], runtime, FLDEFF_QUESTION_MARK_ICON, 4);
  }
  return 0;
}

export function SetIconSpriteData(
  sprite: TrainerSeeSprite,
  runtime: TrainerSeeRuntime,
  fldEffId: number,
  spriteAnimNum: number
): void {
  sprite.oam.priority = 1;
  sprite.coordOffsetEnabled = 1;
  sprite.data[sLocalId] = runtime.fieldEffectArguments[0];
  sprite.data[sMapNum] = runtime.fieldEffectArguments[1];
  sprite.data[sMapGroup] = runtime.fieldEffectArguments[2];
  sprite.data[sData3] = -5;
  sprite.data[sFldEffId] = fldEffId;
  StartSpriteAnim(sprite, spriteAnimNum);
}

export function SpriteCB_TrainerIcons(runtime: TrainerSeeRuntime, sprite: TrainerSeeSprite): void {
  const objEventId = TryGetObjectEventIdByLocalIdAndMap(
    runtime,
    sprite.data[sLocalId],
    sprite.data[sMapNum],
    sprite.data[sMapGroup]
  );

  if (objEventId === null || sprite.animEnded) {
    FieldEffectStop(runtime, sprite, sprite.data[sFldEffId]);
  } else {
    const objEventSprite = runtime.sprites[runtime.objectEvents[objEventId].spriteId];
    sprite.data[sData4] += sprite.data[sData3];
    sprite.x = objEventSprite.x;
    sprite.y = objEventSprite.y - 16;
    sprite.x2 = objEventSprite.x2;
    sprite.y2 = objEventSprite.y2 + sprite.data[sData4];
    if (sprite.data[sData4] !== 0) {
      sprite.data[sData3]++;
    } else {
      sprite.data[sData3] = 0;
    }
  }
}

export function CreateTask(runtime: TrainerSeeRuntime, func: TrainerSeeTaskFunc, priority: number): number {
  const task: TrainerSeeTask = {
    func,
    data: Array(16).fill(0),
    priority,
    destroyed: false,
    followupFunc: null
  };
  const emptySlot = runtime.tasks.findIndex((candidate) => candidate === null);
  if (emptySlot >= 0) {
    runtime.tasks[emptySlot] = task;
    return emptySlot;
  }
  runtime.tasks.push(task);
  return runtime.tasks.length - 1;
}

export function DestroyTask(runtime: TrainerSeeRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
  }
  runtime.tasks[taskId] = null;
}

export function FindTaskIdByFunc(runtime: TrainerSeeRuntime, func: TrainerSeeTaskFunc): number {
  const taskId = runtime.tasks.findIndex((task) => task !== null && task.func === func);
  if (taskId < 0) {
    throw new Error(`Task not found: ${func}`);
  }
  return taskId;
}

export function SetTaskFuncWithFollowupFunc(
  runtime: TrainerSeeRuntime,
  taskId: number,
  func: TrainerSeeTaskFunc,
  followupFunc: TrainerSeeTaskFunc
): void {
  const task = runtime.tasks[taskId]!;
  task.func = func;
  task.followupFunc = followupFunc;
}

export function SwitchTaskToFollowupFunc(runtime: TrainerSeeRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.followupFunc !== null) {
    task.func = task.followupFunc;
  }
}

export function RunTrainerSeeTask(runtime: TrainerSeeRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (task?.func === 'Task_RunTrainerSeeFuncList') {
    Task_RunTrainerSeeFuncList(runtime, taskId);
  } else if (task?.func === 'Task_RevealTrainer_RunTrainerSeeFuncList') {
    Task_RevealTrainer_RunTrainerSeeFuncList(runtime, taskId);
  } else if (task?.func === 'Task_DestroyTrainerApproachTask') {
    Task_DestroyTrainerApproachTask(runtime, taskId);
  }
}

export function ObjectEventSetHeldMovement(objectEvent: TrainerSeeObjectEvent, movementAction: number): void {
  objectEvent.heldMovement = movementAction;
  objectEvent.movementOverridden = true;
  objectEvent.heldMovementFinished = false;
}

export function ObjectEventIsMovementOverridden(objectEvent: TrainerSeeObjectEvent): boolean {
  return objectEvent.movementOverridden;
}

export function ObjectEventClearHeldMovementIfFinished(objectEvent: TrainerSeeObjectEvent): boolean {
  if (objectEvent.heldMovementFinished) {
    objectEvent.heldMovement = null;
    objectEvent.movementOverridden = false;
    return true;
  }
  return false;
}

export function ObjectEventClearHeldMovement(objectEvent: TrainerSeeObjectEvent): void {
  objectEvent.heldMovement = null;
  objectEvent.movementOverridden = false;
  objectEvent.heldMovementFinished = true;
}

export function ObjectEventCheckHeldMovementStatus(objectEvent: TrainerSeeObjectEvent): boolean {
  return objectEvent.heldMovementFinished;
}

export function SetTrainerMovementType(objectEvent: TrainerSeeObjectEvent, movementType: number): void {
  objectEvent.movementType = movementType;
}

export function OverrideMovementTypeForObjectEvent(objectEvent: TrainerSeeObjectEvent, movementType: number): void {
  objectEvent.movementType = movementType;
}

export function OverrideTemplateCoordsForObjectEvent(objectEvent: TrainerSeeObjectEvent): void {
  objectEvent.templateCoords = { x: objectEvent.currentCoords.x, y: objectEvent.currentCoords.y };
}

export function CancelPlayerForcedMovement(runtime: TrainerSeeRuntime): void {
  runtime.playerForcedMovementCanceled = true;
}

export function ScriptContext_Enable(runtime: TrainerSeeRuntime): void {
  runtime.scriptContextEnabled = true;
}

export function FieldEffectStart(runtime: TrainerSeeRuntime, fieldEffectId: number): number {
  runtime.activeFieldEffects.add(fieldEffectId);
  runtime.operations.push(`FieldEffectStart:${fieldEffectId}`);
  return fieldEffectId;
}

export function FieldEffectActiveListContains(runtime: TrainerSeeRuntime, fieldEffectId: number): boolean {
  return runtime.activeFieldEffects.has(fieldEffectId);
}

export function FieldEffectStop(runtime: TrainerSeeRuntime, sprite: TrainerSeeSprite, fieldEffectId: number): void {
  runtime.activeFieldEffects.delete(fieldEffectId);
  sprite.stoppedFieldEffectId = fieldEffectId;
  runtime.operations.push(`FieldEffectStop:${fieldEffectId}`);
}

export function ObjectEventGetLocalIdAndMap(runtime: TrainerSeeRuntime, objectEvent: TrainerSeeObjectEvent): void {
  runtime.fieldEffectArguments[0] = objectEvent.localId;
  runtime.fieldEffectArguments[1] = objectEvent.mapNum;
  runtime.fieldEffectArguments[2] = objectEvent.mapGroup;
}

export function TryGetObjectEventIdByLocalIdAndMap(
  runtime: TrainerSeeRuntime,
  localId: number,
  mapNum: number,
  mapGroup: number
): number | null {
  const objectEvent = runtime.objectEvents.find(
    (candidate) =>
      candidate.active && candidate.localId === localId && candidate.mapNum === mapNum && candidate.mapGroup === mapGroup
  );
  return objectEvent ? objectEvent.id : null;
}

export function SpawnSpecialObjectEventParameterized(
  runtime: TrainerSeeRuntime,
  _graphicsId: number,
  _movementType: number,
  localId: number,
  x: number,
  y: number,
  _z: number
): number {
  const objectEventId = runtime.objectEvents.findIndex((objectEvent) => !objectEvent.active);
  if (objectEventId < 0) {
    return OBJECT_EVENTS_COUNT;
  }
  const spriteId = objectEventId;
  runtime.objectEvents[objectEventId] = createTrainerSeeObjectEvent(objectEventId, {
    active: true,
    localId,
    mapNum: runtime.saveBlock1.location.mapNum,
    mapGroup: runtime.saveBlock1.location.mapGroup,
    currentCoords: { x, y },
    spriteId
  });
  runtime.operations.push(`SpawnSpecialObjectEventParameterized:${objectEventId}:${localId}:${x}:${y}`);
  return objectEventId;
}

export function CameraObjectSetFollowedObjectId(runtime: TrainerSeeRuntime, objectId: number): void {
  runtime.followedObjectId = objectId;
  runtime.operations.push(`CameraObjectSetFollowedObjectId:${objectId}`);
}

export function GetPlayerAvatarObjectId(runtime: TrainerSeeRuntime): number {
  return runtime.objectEvents[runtime.playerAvatar.objectEventId].spriteId;
}

export function RemoveObjectEventByLocalIdAndMap(
  runtime: TrainerSeeRuntime,
  localId: number,
  mapNum: number,
  mapGroup: number
): void {
  const objectEventId = TryGetObjectEventIdByLocalIdAndMap(runtime, localId, mapNum, mapGroup);
  if (objectEventId !== null) {
    runtime.objectEvents[objectEventId].active = false;
  }
  runtime.operations.push(`RemoveObjectEventByLocalIdAndMap:${localId}:${mapNum}:${mapGroup}`);
}

export function CreateSpriteAtEnd(runtime: TrainerSeeRuntime, x: number, y: number, subpriority: number): number {
  const spriteId = runtime.sprites.findIndex((sprite) => sprite.animNum === null && sprite.stoppedFieldEffectId === null);
  if (spriteId < 0) {
    return MAX_SPRITES;
  }
  runtime.sprites[spriteId] = createTrainerSeeSprite();
  runtime.sprites[spriteId].x = x;
  runtime.sprites[spriteId].y = y;
  runtime.sprites[spriteId].subpriority = subpriority;
  return spriteId;
}

export function StartSpriteAnim(sprite: TrainerSeeSprite, spriteAnimNum: number): void {
  sprite.animNum = spriteAnimNum;
}

export function GetFaceDirectionMovementAction(direction: number): number {
  return faceDirectionMovementActions[direction] ?? faceDirectionMovementActions[DIR_NONE];
}

export function GetWalkNormalMovementAction(direction: number): number {
  return walkNormalMovementActions[direction] ?? walkNormalMovementActions[DIR_NONE];
}

export function GetWalkFastMovementAction(direction: number): number {
  return walkFastMovementActions[direction] ?? walkFastMovementActions[DIR_NONE];
}

export function GetJumpInPlaceMovementAction(direction: number): number {
  return jumpInPlaceMovementActions[direction] ?? jumpInPlaceMovementActions[DIR_NONE];
}

export function GetTrainerFacingDirectionMovementType(direction: number): number {
  return trainerFacingDirectionMovementTypes[direction] ?? MOVEMENT_TYPE_FACE_DOWN;
}
