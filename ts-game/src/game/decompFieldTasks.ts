import {
  NUM_TASK_DATA,
  TASK_NONE,
  TaskRuntime,
  createTask,
  findTaskIdByFunc,
  funcIsActiveTask,
  registerTaskCallback
} from './decompTask';

export const STEP_CB_DUMMY = 0;
export const STEP_CB_ASH = 1;
export const STEP_CB_FORTREE_BRIDGE = 2;
export const STEP_CB_PACIFIDLOG_BRIDGE = 3;
export const STEP_CB_ICE = 4;
export const STEP_CB_TRUCK = 5;
export const STEP_CB_SECRET_BASE = 6;
export const STEP_CB_CRACKED_FLOOR = 7;

export const MAP_OFFSET = 7;
export const MB_THIN_ICE = 0x26;
export const MB_CRACKED_ICE = 0x27;
export const MB_ASH_GRASS = -1;
export const MB_CRACKED_FLOOR = -2;
export const METATILE_SEAFOAM_ISLANDS_CRACKED_ICE = 0x35a;
export const METATILE_SEAFOAM_ISLANDS_ICE_HOLE = 0x35b;
export const METATILE_FALLARBOR_ASH_GRASS = 0x20a;
export const METATILE_FALLARBOR_NORMAL_GRASS = 0x212;
export const METATILE_LAVARIDGE_NORMAL_GRASS = 0x206;
export const METATILE_PACIFIDLOG_SKY_PILLAR_CRACKED_FLOOR_HOLE = 0x237;
export const METATILE_RS_CAVE_CRACKED_FLOOR = 0x22f;
export const METATILE_RS_CAVE_CRACKED_FLOOR_HOLE = 0x206;
export const SE_ICE_BREAK = 35;
export const SE_ICE_CRACK = 36;
export const VAR_TEMP_1 = 0x4001;
export const VAR_ICE_STEP_COUNT = 0x4030;
export const PLAYER_SPEED_FASTEST = 4;

export const TASK_RUN_PER_STEP_CALLBACK = 'Task_RunPerStepCallback';
export const TASK_RUN_TIME_BASED_EVENTS = 'Task_RunTimeBasedEvents';

export interface FieldTasksRuntime {
  taskRuntime: TaskRuntime;
  playerDestCoords: { x: number; y: number };
  playerFieldControlsLocked: boolean;
  questLogPlaybackState: boolean;
  playerSpeed: number;
  flags: Set<number>;
  vars: Record<number, number>;
  metatileBehaviors: Map<string, number>;
  metatileIds: Map<string, number>;
  seLog: number[];
  drawLog: Array<{ x: number; y: number }>;
  metatileSetLog: Array<{ x: number; y: number; metatileId: number }>;
  ashEffects: Array<{ x: number; y: number; metatileId: number; duration: number }>;
  ambientCryLog: Array<{ state: number; delay: number }>;
}

const icefallCaveIceCoords: Array<[number, number]> = [
  [8, 3],
  [10, 5],
  [15, 5],
  [8, 9],
  [9, 9],
  [16, 9],
  [8, 10],
  [9, 10],
  [8, 14]
];

const key = (x: number, y: number): string => `${x},${y}`;

const data = (runtime: FieldTasksRuntime, taskId: number): number[] =>
  runtime.taskRuntime.tasks[taskId].data;

export const createFieldTasksRuntime = (taskRuntime: TaskRuntime): FieldTasksRuntime => ({
  taskRuntime,
  playerDestCoords: { x: 0, y: 0 },
  playerFieldControlsLocked: false,
  questLogPlaybackState: false,
  playerSpeed: PLAYER_SPEED_FASTEST,
  flags: new Set(),
  vars: {},
  metatileBehaviors: new Map(),
  metatileIds: new Map(),
  seLog: [],
  drawLog: [],
  metatileSetLog: [],
  ashEffects: [],
  ambientCryLog: []
});

export const registerFieldTaskCallbacks = (runtime: FieldTasksRuntime): void => {
  registerTaskCallback(runtime.taskRuntime, TASK_RUN_PER_STEP_CALLBACK, (taskId) =>
    taskRunPerStepCallback(runtime, taskId)
  );
  registerTaskCallback(runtime.taskRuntime, TASK_RUN_TIME_BASED_EVENTS, (taskId) =>
    taskRunTimeBasedEvents(runtime, taskId)
  );
};

export const setMetatileBehaviorAt = (
  runtime: FieldTasksRuntime,
  x: number,
  y: number,
  behavior: number
): void => {
  runtime.metatileBehaviors.set(key(x, y), behavior);
};

export const setMetatileIdAtForTest = (
  runtime: FieldTasksRuntime,
  x: number,
  y: number,
  metatileId: number
): void => {
  runtime.metatileIds.set(key(x, y), metatileId);
};

export const getMetatileIdAt = (runtime: FieldTasksRuntime, x: number, y: number): number =>
  runtime.metatileIds.get(key(x, y)) ?? 0;

const mapGridGetMetatileBehaviorAt = (
  runtime: FieldTasksRuntime,
  x: number,
  y: number
): number => runtime.metatileBehaviors.get(key(x, y)) ?? 0;

const mapGridSetMetatileIdAt = (
  runtime: FieldTasksRuntime,
  x: number,
  y: number,
  metatileId: number
): void => {
  runtime.metatileIds.set(key(x, y), metatileId);
  runtime.metatileSetLog.push({ x, y, metatileId });
};

const currentMapDrawMetatileAt = (runtime: FieldTasksRuntime, x: number, y: number): void => {
  runtime.drawLog.push({ x, y });
};

const playSE = (runtime: FieldTasksRuntime, songId: number): void => {
  runtime.seLog.push(songId);
};

const varSet = (runtime: FieldTasksRuntime, id: number, value: number): void => {
  runtime.vars[id] = value;
};

const flagSet = (runtime: FieldTasksRuntime, id: number): void => {
  runtime.flags.add(id);
};

const flagGet = (runtime: FieldTasksRuntime, id: number): boolean => runtime.flags.has(id);

const metatileBehaviorIsThinIce = (behavior: number): boolean => behavior === MB_THIN_ICE;
const metatileBehaviorIsCrackedIce = (behavior: number): boolean => behavior === MB_CRACKED_ICE;

const metatileBehaviorIsAshGrass = (behavior: number): boolean => behavior === MB_ASH_GRASS;
const metatileBehaviorIsCrackedFloor = (behavior: number): boolean =>
  behavior === MB_CRACKED_FLOOR;

const updateAmbientCry = (runtime: FieldTasksRuntime, taskId: number): void => {
  const taskData = data(runtime, taskId);
  runtime.ambientCryLog.push({ state: taskData[1], delay: taskData[2] });
  taskData[2] += 1;
};

const dummyPerStepCallback = (_runtime: FieldTasksRuntime, _taskId: number): void => {};

const perStepCallbacks = [
  dummyPerStepCallback,
  ashGrassPerStepCallback,
  dummyPerStepCallback,
  dummyPerStepCallback,
  icefallCaveIcePerStepCallback,
  dummyPerStepCallback,
  dummyPerStepCallback,
  crackedFloorPerStepCallback
];

export const taskRunPerStepCallback = (
  runtime: FieldTasksRuntime,
  taskId: number
): void => {
  const idx = data(runtime, taskId)[0];
  perStepCallbacks[idx](runtime, taskId);
};

export const taskRunTimeBasedEvents = (
  runtime: FieldTasksRuntime,
  taskId: number
): void => {
  if (!runtime.playerFieldControlsLocked && !runtime.questLogPlaybackState) {
    updateAmbientCry(runtime, taskId);
  }
};

export const setUpFieldTasks = (runtime: FieldTasksRuntime): void => {
  if (!funcIsActiveTask(runtime.taskRuntime, TASK_RUN_PER_STEP_CALLBACK)) {
    const taskId = createTask(runtime.taskRuntime, TASK_RUN_PER_STEP_CALLBACK, 80);
    data(runtime, taskId)[0] = STEP_CB_DUMMY;
  }

  if (!funcIsActiveTask(runtime.taskRuntime, TASK_RUN_TIME_BASED_EVENTS)) {
    createTask(runtime.taskRuntime, TASK_RUN_TIME_BASED_EVENTS, 80);
  }
};

export const activatePerStepCallback = (
  runtime: FieldTasksRuntime,
  callbackId: number
): void => {
  const taskId = findTaskIdByFunc(runtime.taskRuntime, TASK_RUN_PER_STEP_CALLBACK);
  if (taskId !== TASK_NONE) {
    const taskData = data(runtime, taskId);
    for (let i = 0; i < NUM_TASK_DATA; i += 1) {
      taskData[i] = 0;
    }

    if (callbackId >= perStepCallbacks.length) {
      taskData[0] = STEP_CB_DUMMY;
    } else {
      taskData[0] = callbackId;
    }
  }
};

export const resetFieldTasksArgs = (runtime: FieldTasksRuntime): void => {
  const taskId = findTaskIdByFunc(runtime.taskRuntime, TASK_RUN_TIME_BASED_EVENTS);
  if (taskId !== TASK_NONE) {
    const taskData = data(runtime, taskId);
    taskData[1] = 0;
    taskData[2] = 0;
  }
};

export const markIcePuzzleCoordVisited = (
  runtime: FieldTasksRuntime,
  x: number,
  y: number
): void => {
  for (let i = 0; i < icefallCaveIceCoords.length; i += 1) {
    if (
      icefallCaveIceCoords[i][0] + MAP_OFFSET === x &&
      icefallCaveIceCoords[i][1] + MAP_OFFSET === y
    ) {
      flagSet(runtime, i + 1);
      break;
    }
  }
};

export const setIcefallCaveCrackedIceMetatiles = (
  runtime: FieldTasksRuntime
): void => {
  for (let i = 0; i < icefallCaveIceCoords.length; i += 1) {
    if (flagGet(runtime, i + 1)) {
      const x = icefallCaveIceCoords[i][0] + MAP_OFFSET;
      const y = icefallCaveIceCoords[i][1] + MAP_OFFSET;
      mapGridSetMetatileIdAt(runtime, x, y, METATILE_SEAFOAM_ISLANDS_CRACKED_ICE);
    }
  }
};

export function icefallCaveIcePerStepCallback(
  runtime: FieldTasksRuntime,
  taskId: number
): void {
  const taskData = data(runtime, taskId);
  switch (taskData[1]) {
    case 0:
      taskData[2] = runtime.playerDestCoords.x;
      taskData[3] = runtime.playerDestCoords.y;
      taskData[1] = 1;
      break;
    case 1: {
      const x = runtime.playerDestCoords.x;
      const y = runtime.playerDestCoords.y;
      if (x === taskData[2] && y === taskData[3]) {
        return;
      }

      taskData[2] = x;
      taskData[3] = y;
      const tileBehavior = mapGridGetMetatileBehaviorAt(runtime, x, y);
      if (metatileBehaviorIsThinIce(tileBehavior)) {
        markIcePuzzleCoordVisited(runtime, x, y);
        taskData[6] = 4;
        taskData[1] = 2;
        taskData[4] = x;
        taskData[5] = y;
      } else if (metatileBehaviorIsCrackedIce(tileBehavior)) {
        taskData[6] = 4;
        taskData[1] = 3;
        taskData[4] = x;
        taskData[5] = y;
      }
      break;
    }
    case 2:
      if (taskData[6] !== 0) {
        taskData[6] -= 1;
      } else {
        const x = taskData[4];
        const y = taskData[5];
        playSE(runtime, SE_ICE_CRACK);
        mapGridSetMetatileIdAt(runtime, x, y, METATILE_SEAFOAM_ISLANDS_CRACKED_ICE);
        currentMapDrawMetatileAt(runtime, x, y);
        taskData[1] = 1;
      }
      break;
    case 3:
      if (taskData[6] !== 0) {
        taskData[6] -= 1;
      } else {
        const x = taskData[4];
        const y = taskData[5];
        playSE(runtime, SE_ICE_BREAK);
        mapGridSetMetatileIdAt(runtime, x, y, METATILE_SEAFOAM_ISLANDS_ICE_HOLE);
        currentMapDrawMetatileAt(runtime, x, y);
        varSet(runtime, VAR_TEMP_1, 1);
        taskData[1] = 1;
      }
      break;
  }
}

export function ashGrassPerStepCallback(runtime: FieldTasksRuntime, taskId: number): void {
  const taskData = data(runtime, taskId);
  const x = runtime.playerDestCoords.x;
  const y = runtime.playerDestCoords.y;

  if (x === taskData[1] && y === taskData[2]) {
    return;
  }

  taskData[1] = x;
  taskData[2] = y;
  if (metatileBehaviorIsAshGrass(mapGridGetMetatileBehaviorAt(runtime, x, y))) {
    if (getMetatileIdAt(runtime, x, y) === METATILE_FALLARBOR_ASH_GRASS) {
      runtime.ashEffects.push({
        x,
        y,
        metatileId: METATILE_FALLARBOR_NORMAL_GRASS,
        duration: 4
      });
    } else {
      runtime.ashEffects.push({
        x,
        y,
        metatileId: METATILE_LAVARIDGE_NORMAL_GRASS,
        duration: 4
      });
    }
  }
}

export const setCrackedFloorHoleMetatile = (
  runtime: FieldTasksRuntime,
  x: number,
  y: number
): void => {
  mapGridSetMetatileIdAt(
    runtime,
    x,
    y,
    getMetatileIdAt(runtime, x, y) === METATILE_RS_CAVE_CRACKED_FLOOR
      ? METATILE_RS_CAVE_CRACKED_FLOOR_HOLE
      : METATILE_PACIFIDLOG_SKY_PILLAR_CRACKED_FLOOR_HOLE
  );
  currentMapDrawMetatileAt(runtime, x, y);
};

export function crackedFloorPerStepCallback(
  runtime: FieldTasksRuntime,
  taskId: number
): void {
  const taskData = data(runtime, taskId);
  const x = runtime.playerDestCoords.x;
  const y = runtime.playerDestCoords.y;
  const behavior = mapGridGetMetatileBehaviorAt(runtime, x, y);

  if (taskData[4] !== 0) {
    taskData[4] -= 1;
    if (taskData[4] === 0) {
      setCrackedFloorHoleMetatile(runtime, taskData[5], taskData[6]);
    }
  }

  if (taskData[7] !== 0) {
    taskData[7] -= 1;
    if (taskData[7] === 0) {
      setCrackedFloorHoleMetatile(runtime, taskData[8], taskData[9]);
    }
  }

  if (x === taskData[2] && y === taskData[3]) {
    return;
  }

  taskData[2] = x;
  taskData[3] = y;
  if (metatileBehaviorIsCrackedFloor(behavior)) {
    if (runtime.playerSpeed !== PLAYER_SPEED_FASTEST) {
      varSet(runtime, VAR_ICE_STEP_COUNT, 0);
    }

    if (taskData[4] === 0) {
      taskData[4] = 3;
      taskData[5] = x;
      taskData[6] = y;
    } else if (taskData[7] === 0) {
      taskData[7] = 3;
      taskData[8] = x;
      taskData[9] = y;
    }
  }
}

export function Task_RunPerStepCallback(runtime: FieldTasksRuntime, taskId: number): void {
  taskRunPerStepCallback(runtime, taskId);
}

export function Task_RunTimeBasedEvents(runtime: FieldTasksRuntime, taskId: number): void {
  taskRunTimeBasedEvents(runtime, taskId);
}

export function SetUpFieldTasks(runtime: FieldTasksRuntime): void {
  setUpFieldTasks(runtime);
}

export function ActivatePerStepCallback(runtime: FieldTasksRuntime, callbackId: number): void {
  activatePerStepCallback(runtime, callbackId);
}

export function ResetFieldTasksArgs(runtime: FieldTasksRuntime): void {
  resetFieldTasksArgs(runtime);
}

export function DummyPerStepCallback(runtime: FieldTasksRuntime, taskId: number): void {
  dummyPerStepCallback(runtime, taskId);
}

export function MarkIcePuzzleCoordVisited(runtime: FieldTasksRuntime, x: number, y: number): void {
  markIcePuzzleCoordVisited(runtime, x, y);
}

export function SetIcefallCaveCrackedIceMetatiles(runtime: FieldTasksRuntime): void {
  setIcefallCaveCrackedIceMetatiles(runtime);
}

export function IcefallCaveIcePerStepCallback(runtime: FieldTasksRuntime, taskId: number): void {
  icefallCaveIcePerStepCallback(runtime, taskId);
}

export function AshGrassPerStepCallback(runtime: FieldTasksRuntime, taskId: number): void {
  ashGrassPerStepCallback(runtime, taskId);
}

export function SetCrackedFloorHoleMetatile(runtime: FieldTasksRuntime, x: number, y: number): void {
  setCrackedFloorHoleMetatile(runtime, x, y);
}

export function CrackedFloorPerStepCallback(runtime: FieldTasksRuntime, taskId: number): void {
  crackedFloorPerStepCallback(runtime, taskId);
}
