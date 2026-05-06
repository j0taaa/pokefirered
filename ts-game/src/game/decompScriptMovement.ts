export const OBJECT_EVENTS_COUNT = 16;
export const NUM_TASK_DATA = 16;
export const TAIL_SENTINEL = 0xff;
export const LOCALID_PLAYER = 0xff;
export const MOVEMENT_ACTION_STEP_END = 0xfe;

export interface ScriptMovementObjectEvent {
  id: number;
  localId: number;
  mapNum: number;
  mapGroup: number;
  heldMovementActive: boolean;
  clearHeldMovementIfFinishedResult: boolean;
  heldMovementActionId: number | null;
  heldMovementRemainingFrames: number;
  frozen: boolean;
  setHeldMovementFailures: Set<number>;
  heldMovements: number[];
}

export interface ScriptMovementTask {
  data: number[];
  destroyed: boolean;
}

export interface ScriptMovementRuntime {
  objectEvents: ScriptMovementObjectEvent[];
  tasks: ScriptMovementTask[];
  movementScripts: Array<number[] | null>;
  movementScriptOffsets: number[];
}

export const createScriptMovementRuntime = (): ScriptMovementRuntime => ({
  objectEvents: [],
  tasks: [],
  movementScripts: Array.from({ length: OBJECT_EVENTS_COUNT }, () => null),
  movementScriptOffsets: Array.from({ length: OBJECT_EVENTS_COUNT }, () => 0)
});

export const createMovementObjectEvent = (
  id: number,
  localId: number,
  mapNum = 0,
  mapGroup = 0
): ScriptMovementObjectEvent => ({
  id,
  localId,
  mapNum,
  mapGroup,
  heldMovementActive: false,
  clearHeldMovementIfFinishedResult: true,
  heldMovementActionId: null,
  heldMovementRemainingFrames: 0,
  frozen: false,
  setHeldMovementFailures: new Set(),
  heldMovements: []
});

const bit = (index: number): number => 1 << index;

const getMovementObjectByte = (
  task: ScriptMovementTask,
  moveScrId: number
): number => {
  const dataIndex = 1 + Math.trunc(moveScrId / 2);
  const word = task.data[dataIndex] & 0xffff;
  return moveScrId % 2 === 0 ? word & 0xff : (word >> 8) & 0xff;
};

const setMovementObjectByte = (
  task: ScriptMovementTask,
  moveScrId: number,
  objEventId: number
): void => {
  const dataIndex = 1 + Math.trunc(moveScrId / 2);
  const word = task.data[dataIndex] & 0xffff;
  if (moveScrId % 2 === 0) {
    task.data[dataIndex] = (word & 0xff00) | (objEventId & 0xff);
  } else {
    task.data[dataIndex] = (word & 0x00ff) | ((objEventId & 0xff) << 8);
  }
};

const findTaskId = (runtime: ScriptMovementRuntime): number => {
  const id = runtime.tasks.findIndex((task) => !task.destroyed);
  return id === -1 ? TAIL_SENTINEL : id;
};

const createTask = (runtime: ScriptMovementRuntime): number => {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: NUM_TASK_DATA }, () => 0), destroyed: false });
  return taskId;
};

const tryGetObjectEventIdByLocalIdAndMap = (
  runtime: ScriptMovementRuntime,
  localId: number,
  mapNum: number,
  mapGroup: number
): number | null => {
  const found = runtime.objectEvents.find((object) =>
    object.localId === localId && object.mapNum === mapNum && object.mapGroup === mapGroup
  );
  return found ? found.id : null;
};

export const scriptMovementStartObjectMovementScript = (
  runtime: ScriptMovementRuntime,
  localId: number,
  mapNum: number,
  mapGroup: number,
  movementScript: number[]
): boolean => {
  const objEventId = tryGetObjectEventIdByLocalIdAndMap(runtime, localId, mapNum, mapGroup);
  if (objEventId === null) {
    return true;
  }

  if (findTaskId(runtime) === TAIL_SENTINEL) {
    scriptMovementStartMoveObjects(runtime, 50);
  }
  return scriptMovementTryAddNewMovement(runtime, getMoveObjectsTaskId(runtime), objEventId, movementScript);
};

export const scriptMovementIsObjectMovementFinished = (
  runtime: ScriptMovementRuntime,
  localId: number,
  mapNum: number,
  mapGroup: number
): boolean => {
  const objEventId = tryGetObjectEventIdByLocalIdAndMap(runtime, localId, mapNum, mapGroup);
  if (objEventId === null) {
    return true;
  }
  const taskId = getMoveObjectsTaskId(runtime);
  const moveScrId = getMovementScriptIdFromObjectEventId(runtime, taskId, objEventId);
  if (moveScrId === OBJECT_EVENTS_COUNT) {
    return true;
  }
  return isMovementScriptFinished(runtime, taskId, moveScrId);
};

export const scriptMovementUnfreezeObjectEvents = (
  runtime: ScriptMovementRuntime
): void => {
  const taskId = getMoveObjectsTaskId(runtime);
  if (taskId !== TAIL_SENTINEL) {
    scriptMovementUnfreezeActiveObjects(runtime, taskId);
    runtime.tasks[taskId].destroyed = true;
  }
};

export const scriptMovementStartMoveObjects = (
  runtime: ScriptMovementRuntime,
  _priority: number
): number => {
  const taskId = createTask(runtime);
  for (let i = 1; i < NUM_TASK_DATA; i += 1) {
    runtime.tasks[taskId].data[i] = -1;
  }
  return taskId;
};

export const getMoveObjectsTaskId = (runtime: ScriptMovementRuntime): number => findTaskId(runtime);

export const scriptMovementTryAddNewMovement = (
  runtime: ScriptMovementRuntime,
  taskId: number,
  objEventId: number,
  movementScript: number[]
): boolean => {
  let moveScrId = getMovementScriptIdFromObjectEventId(runtime, taskId, objEventId);
  if (moveScrId !== OBJECT_EVENTS_COUNT) {
    if (isMovementScriptFinished(runtime, taskId, moveScrId) === false) {
      return true;
    }
    scriptMovementAddNewMovement(runtime, taskId, moveScrId, objEventId, movementScript);
    return false;
  }
  moveScrId = getMovementScriptIdFromObjectEventId(runtime, taskId, LOCALID_PLAYER);
  if (moveScrId === OBJECT_EVENTS_COUNT) {
    return true;
  }
  scriptMovementAddNewMovement(runtime, taskId, moveScrId, objEventId, movementScript);
  return false;
};

export const getMovementScriptIdFromObjectEventId = (
  runtime: ScriptMovementRuntime,
  taskId: number,
  objEventId: number
): number => {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i += 1) {
    if (getMovementObjectByte(runtime.tasks[taskId], i) === objEventId) {
      return i;
    }
  }
  return OBJECT_EVENTS_COUNT;
};

export const loadObjectEventIdPtrFromMovementScript = (
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number
): { value: number } => ({
  get value(): number {
    return getMovementObjectByte(runtime.tasks[taskId], moveScrId);
  },
  set value(objEventId: number) {
    setMovementObjectByte(runtime.tasks[taskId], moveScrId, objEventId);
  }
});

export const setObjectEventIdAtMovementScript = (
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number,
  objEventId: number
): void => {
  setMovementObjectByte(runtime.tasks[taskId], moveScrId, objEventId);
};

export const loadObjectEventIdFromMovementScript = (
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number
): number => getMovementObjectByte(runtime.tasks[taskId], moveScrId);

export const clearMovementScriptFinished = (
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number
): void => {
  runtime.tasks[taskId].data[0] &= ~bit(moveScrId);
};

export const setMovementScriptFinished = (
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number
): void => {
  runtime.tasks[taskId].data[0] |= bit(moveScrId);
};

export const isMovementScriptFinished = (
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number
): boolean => ((runtime.tasks[taskId].data[0] & bit(moveScrId)) !== 0);

export const hasUnfinishedScriptMovement = (runtime: ScriptMovementRuntime): boolean =>
  runtime.tasks.some((task, taskId) => {
    if (task.destroyed) {
      return false;
    }
    for (let moveScrId = 0; moveScrId < OBJECT_EVENTS_COUNT; moveScrId += 1) {
      if (getMovementObjectByte(task, moveScrId) !== 0xff && !isMovementScriptFinished(runtime, taskId, moveScrId)) {
        return true;
      }
    }
    return false;
  });

export const setMovementScript = (
  runtime: ScriptMovementRuntime,
  moveScrId: number,
  movementScript: number[]
): void => {
  runtime.movementScripts[moveScrId] = movementScript;
  runtime.movementScriptOffsets[moveScrId] = 0;
};

export const getMovementScript = (
  runtime: ScriptMovementRuntime,
  moveScrId: number
): number[] | null => runtime.movementScripts[moveScrId];

const getCurrentMovementAction = (
  runtime: ScriptMovementRuntime,
  moveScrId: number
): number => runtime.movementScripts[moveScrId]?.[runtime.movementScriptOffsets[moveScrId]] ?? MOVEMENT_ACTION_STEP_END;

export const getHeldMovementDurationFrames = (actionId: number): number => {
  if (actionId >= 0x00 && actionId <= 0x07) return 1;
  if (actionId >= 0x08 && actionId <= 0x0b) return 31;
  if (actionId >= 0x0c && actionId <= 0x0f) return 23;
  if (actionId >= 0x10 && actionId <= 0x13) return 16;
  if (actionId >= 0x14 && actionId <= 0x17) return 32;
  if (actionId >= 0x18 && actionId <= 0x1c) return 1 << (actionId - 0x18);
  if (actionId >= 0x1d && actionId <= 0x20) return 8;
  if (actionId >= 0x21 && actionId <= 0x24) return 32;
  if (actionId >= 0x25 && actionId <= 0x28) return 16;
  if (actionId >= 0x29 && actionId <= 0x2c) return 8;
  if (actionId >= 0x2d && actionId <= 0x30) return 4;
  if (actionId >= 0x31 && actionId <= 0x34) return 6;
  if (actionId >= 0x35 && actionId <= 0x38) return 4;
  if (actionId >= 0x39 && actionId <= 0x3c) return 2;
  if (actionId >= 0x3d && actionId <= 0x40) return 8;
  if (actionId >= 0x41 && actionId <= 0x44) return 11;
  if (actionId >= 0x46 && actionId <= 0x49) return 32;
  if (actionId >= 0x4e && actionId <= 0x55) return 16;
  if (actionId >= 0x70 && actionId <= 0x7b) return 1;
  if (actionId >= 0x7c && actionId <= 0x83) return 16;
  if (actionId >= 0x84 && actionId <= 0x87) return 32;
  if (actionId >= 0x88 && actionId <= 0x8b) return 8;
  if (actionId >= 0x8c && actionId <= 0x93) return 6;
  if (actionId >= 0x94 && actionId <= 0x97) return 1;
  if (actionId >= 0x9b && actionId <= 0x9e) return 160;
  if (actionId >= 0xa0 && actionId <= 0xa3) return 8;
  if (actionId >= 0xa6 && actionId <= 0xa9) return 32;
  return 1;
};

const clearHeldMovementIfFinished = (objectEvent: ScriptMovementObjectEvent): boolean => {
  if (!objectEvent.heldMovementActive) {
    return true;
  }
  if (!objectEvent.clearHeldMovementIfFinishedResult) {
    return false;
  }

  objectEvent.heldMovementRemainingFrames -= 1;
  if (objectEvent.heldMovementRemainingFrames > 0) {
    return false;
  }

  objectEvent.heldMovementActive = false;
  objectEvent.heldMovementActionId = null;
  objectEvent.heldMovementRemainingFrames = 0;
  return true;
};

export const scriptMovementAddNewMovement = (
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number,
  objEventId: number,
  movementScript: number[]
): void => {
  clearMovementScriptFinished(runtime, taskId, moveScrId);
  setMovementScript(runtime, moveScrId, movementScript);
  setObjectEventIdAtMovementScript(runtime, taskId, moveScrId, objEventId);
};

export const scriptMovementUnfreezeActiveObjects = (
  runtime: ScriptMovementRuntime,
  taskId: number
): void => {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i += 1) {
    const objEventId = getMovementObjectByte(runtime.tasks[taskId], i);
    if (objEventId !== 0xff) {
      runtime.objectEvents[objEventId].frozen = false;
    }
  }
};

export const scriptMovementMoveObjects = (
  runtime: ScriptMovementRuntime,
  taskId: number
): void => {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i += 1) {
    const objEventId = loadObjectEventIdFromMovementScript(runtime, taskId, i);
    if (objEventId !== 0xff) {
      scriptMovementTakeStep(runtime, taskId, i, objEventId);
    }
  }
};

export const scriptMovementTakeStep = (
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number,
  objEventId: number
): void => {
  const objectEvent = runtime.objectEvents[objEventId];
  if (isMovementScriptFinished(runtime, taskId, moveScrId) === true) {
    return;
  }
  if (objectEvent.heldMovementActive && !clearHeldMovementIfFinished(objectEvent)) {
    return;
  }

  const nextMoveActionId = getCurrentMovementAction(runtime, moveScrId);
  if (nextMoveActionId === MOVEMENT_ACTION_STEP_END) {
    setMovementScriptFinished(runtime, taskId, moveScrId);
    objectEvent.frozen = true;
  } else if (!objectEvent.setHeldMovementFailures.has(nextMoveActionId)) {
    objectEvent.heldMovements.push(nextMoveActionId);
    objectEvent.heldMovementActive = true;
    objectEvent.heldMovementActionId = nextMoveActionId;
    objectEvent.heldMovementRemainingFrames = getHeldMovementDurationFrames(nextMoveActionId);
    runtime.movementScriptOffsets[moveScrId] += 1;
  }
};

export function ScriptMovement_StartObjectMovementScript(
  runtime: ScriptMovementRuntime,
  localId: number,
  mapNum: number,
  mapGroup: number,
  movementScript: number[]
): boolean {
  return scriptMovementStartObjectMovementScript(runtime, localId, mapNum, mapGroup, movementScript);
}

export function ScriptMovement_IsObjectMovementFinished(
  runtime: ScriptMovementRuntime,
  localId: number,
  mapNum: number,
  mapGroup: number
): boolean {
  return scriptMovementIsObjectMovementFinished(runtime, localId, mapNum, mapGroup);
}

export function ScriptMovement_UnfreezeObjectEvents(runtime: ScriptMovementRuntime): void {
  scriptMovementUnfreezeObjectEvents(runtime);
}

export function ScriptMovement_StartMoveObjects(runtime: ScriptMovementRuntime, priority: number): number {
  return scriptMovementStartMoveObjects(runtime, priority);
}

export function GetMoveObjectsTaskId(runtime: ScriptMovementRuntime): number {
  return getMoveObjectsTaskId(runtime);
}

export function ScriptMovement_TryAddNewMovement(
  runtime: ScriptMovementRuntime,
  taskId: number,
  objEventId: number,
  movementScript: number[]
): boolean {
  return scriptMovementTryAddNewMovement(runtime, taskId, objEventId, movementScript);
}

export function GetMovementScriptIdFromObjectEventId(
  runtime: ScriptMovementRuntime,
  taskId: number,
  objEventId: number
): number {
  return getMovementScriptIdFromObjectEventId(runtime, taskId, objEventId);
}

export function LoadObjectEventIdPtrFromMovementScript(
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number
): { value: number } {
  return loadObjectEventIdPtrFromMovementScript(runtime, taskId, moveScrId);
}

export function SetObjectEventIdAtMovementScript(
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number,
  objEventId: number
): void {
  setObjectEventIdAtMovementScript(runtime, taskId, moveScrId, objEventId);
}

export function LoadObjectEventIdFromMovementScript(
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number
): number {
  return loadObjectEventIdFromMovementScript(runtime, taskId, moveScrId);
}

export function ClearMovementScriptFinished(
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number
): void {
  clearMovementScriptFinished(runtime, taskId, moveScrId);
}

export function SetMovementScriptFinished(
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number
): void {
  setMovementScriptFinished(runtime, taskId, moveScrId);
}

export function IsMovementScriptFinished(
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number
): boolean {
  return isMovementScriptFinished(runtime, taskId, moveScrId);
}

export const HasUnfinishedScriptMovement = hasUnfinishedScriptMovement;

export function SetMovementScript(
  runtime: ScriptMovementRuntime,
  moveScrId: number,
  movementScript: number[]
): void {
  setMovementScript(runtime, moveScrId, movementScript);
}

export const GetMovementScript = getMovementScript;

export function ScriptMovement_AddNewMovement(
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number,
  objEventId: number,
  movementScript: number[]
): void {
  scriptMovementAddNewMovement(runtime, taskId, moveScrId, objEventId, movementScript);
}

export function ScriptMovement_UnfreezeActiveObjects(
  runtime: ScriptMovementRuntime,
  taskId: number
): void {
  scriptMovementUnfreezeActiveObjects(runtime, taskId);
}

export function ScriptMovement_MoveObjects(runtime: ScriptMovementRuntime, taskId: number): void {
  scriptMovementMoveObjects(runtime, taskId);
}

export function ScriptMovement_TakeStep(
  runtime: ScriptMovementRuntime,
  taskId: number,
  moveScrId: number,
  objEventId: number
): void {
  scriptMovementTakeStep(runtime, taskId, moveScrId, objEventId);
}
