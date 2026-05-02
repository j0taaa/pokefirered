import {
  TaskRuntime,
  createTask,
  destroyTask,
  registerTaskCallback
} from './decompTask';

export const MAPGRID_METATILE_ID_MASK = 0x03ff;
export const MAPGRID_COLLISION_MASK = 0x0c00;

export const METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_NORMAL = 0x2d0;
export const METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION1 = 0x30a;
export const METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION2 = 0x308;
export const METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_NORMAL = 0x2d8;
export const METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_TRANSITION1 = 0x312;
export const METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_TRANSITION2 = 0x310;
export const METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_RAIL_NORMAL = 0x2d1;
export const METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_RAIL_TRANSITION1 = 0x30b;
export const METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_RAIL_TRANSITION2 = 0x309;
export const METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NORMAL = 0x2d9;
export const METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_TRANSITION1 = 0x313;
export const METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_TRANSITION2 = 0x311;
export const METATILE_POKEMON_CENTER_ESCALATOR_TOP_NEXT_RAIL_NORMAL = 0x2eb;
export const METATILE_POKEMON_CENTER_ESCALATOR_TOP_NEXT_RAIL_TRANSITION1 = 0x31e;
export const METATILE_POKEMON_CENTER_ESCALATOR_TOP_NEXT_RAIL_TRANSITION2 = 0x31c;
export const METATILE_POKEMON_CENTER_ESCALATOR_TOP_NEXT_NORMAL = 0x2e3;
export const METATILE_POKEMON_CENTER_ESCALATOR_TOP_NEXT_TRANSITION1 = 0x316;
export const METATILE_POKEMON_CENTER_ESCALATOR_TOP_NEXT_TRANSITION2 = 0x314;
export const METATILE_POKEMON_CENTER_ESCALATOR_TOP_NORMAL = 0x2e4;
export const METATILE_POKEMON_CENTER_ESCALATOR_TOP_TRANSITION1 = 0x317;
export const METATILE_POKEMON_CENTER_ESCALATOR_TOP_TRANSITION2 = 0x315;
export const METATILE_SEA_COTTAGE_TELEPORTER_CABLEBALL_BOTTOM = 0x2ba;
export const METATILE_SEA_COTTAGE_TELEPORTER_CABLEBALL_TOP = 0x2b9;
export const METATILE_SEA_COTTAGE_TELEPORTER_CABLE_BOTTOM = 0x2b4;
export const METATILE_SEA_COTTAGE_TELEPORTER_CABLE_TOP = 0x285;
export const METATILE_SEA_COTTAGE_TELEPORTER_DOOR = 0x296;
export const METATILE_SEA_COTTAGE_TELEPORTER_DOOR_FULL_GLOWING = 0x2b8;
export const METATILE_SEA_COTTAGE_TELEPORTER_DOOR_HALF_GLOWING = 0x2b7;
export const METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_GREEN = 0x28a;
export const METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_RED = 0x2b6;
export const METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_YELLOW = 0x2b5;

export const TASK_DRAW_ESCALATOR = 'Task_DrawEscalator';
export const TASK_DRAW_TELEPORTER_HOUSING = 'Task_DrawTeleporterHousing';
export const TASK_DRAW_TELEPORTER_CABLE = 'Task_DrawTeleporterCable';

const ESCALATOR_STAGES = 3;
const LAST_ESCALATOR_STAGE = ESCALATOR_STAGES - 1;

const escalatorMetatilesBottomNextRail = [
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION2,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION1,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_NORMAL
];

const escalatorMetatilesBottomRail = [
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_RAIL_TRANSITION2,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_RAIL_TRANSITION1,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_RAIL_NORMAL
];

const escalatorMetatilesBottomNext = [
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_TRANSITION2,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_TRANSITION1,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_NORMAL
];

const escalatorMetatilesBottom = [
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_TRANSITION2,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_TRANSITION1,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NORMAL
];

const escalatorMetatilesTopNext = [
  METATILE_POKEMON_CENTER_ESCALATOR_TOP_NEXT_NORMAL,
  METATILE_POKEMON_CENTER_ESCALATOR_TOP_NEXT_TRANSITION1,
  METATILE_POKEMON_CENTER_ESCALATOR_TOP_NEXT_TRANSITION2
];

const escalatorMetatilesTop = [
  METATILE_POKEMON_CENTER_ESCALATOR_TOP_NORMAL,
  METATILE_POKEMON_CENTER_ESCALATOR_TOP_TRANSITION1,
  METATILE_POKEMON_CENTER_ESCALATOR_TOP_TRANSITION2
];

const escalatorMetatilesTopNextRail = [
  METATILE_POKEMON_CENTER_ESCALATOR_TOP_NEXT_RAIL_NORMAL,
  METATILE_POKEMON_CENTER_ESCALATOR_TOP_NEXT_RAIL_TRANSITION1,
  METATILE_POKEMON_CENTER_ESCALATOR_TOP_NEXT_RAIL_TRANSITION2
];

export interface SpecialFieldAnimRuntime {
  taskRuntime: TaskRuntime;
  escalatorTaskId: number;
  playerDestCoords: { x: number; y: number };
  specialVar0x8004: number;
  metatileIds: Map<string, number>;
  metatileSetLog: Array<{ x: number; y: number; metatileId: number }>;
  drawLog: Array<{ x: number; y: number }>;
  drawWholeMapViewCount: number;
}

const key = (x: number, y: number): string => `${x},${y}`;

const taskData = (runtime: SpecialFieldAnimRuntime, taskId: number): number[] =>
  runtime.taskRuntime.tasks[taskId].data;

export const createSpecialFieldAnimRuntime = (
  taskRuntime: TaskRuntime
): SpecialFieldAnimRuntime => ({
  taskRuntime,
  escalatorTaskId: 0,
  playerDestCoords: { x: 0, y: 0 },
  specialVar0x8004: 0,
  metatileIds: new Map(),
  metatileSetLog: [],
  drawLog: [],
  drawWholeMapViewCount: 0
});

export const registerSpecialFieldAnimCallbacks = (
  runtime: SpecialFieldAnimRuntime
): void => {
  registerTaskCallback(runtime.taskRuntime, TASK_DRAW_ESCALATOR, (taskId) =>
    taskDrawEscalator(runtime, taskId)
  );
  registerTaskCallback(runtime.taskRuntime, TASK_DRAW_TELEPORTER_HOUSING, (taskId) =>
    taskDrawTeleporterHousing(runtime, taskId)
  );
  registerTaskCallback(runtime.taskRuntime, TASK_DRAW_TELEPORTER_CABLE, (taskId) =>
    taskDrawTeleporterCable(runtime, taskId)
  );
};

export const setRawMapGridMetatileIdAt = (
  runtime: SpecialFieldAnimRuntime,
  x: number,
  y: number,
  metatileId: number
): void => {
  runtime.metatileIds.set(key(x, y), metatileId);
};

export const mapGridGetMetatileIdAt = (
  runtime: SpecialFieldAnimRuntime,
  x: number,
  y: number
): number => (runtime.metatileIds.get(key(x, y)) ?? 0) & MAPGRID_METATILE_ID_MASK;

export const mapGridGetRawMetatileIdAt = (
  runtime: SpecialFieldAnimRuntime,
  x: number,
  y: number
): number => runtime.metatileIds.get(key(x, y)) ?? 0;

const mapGridSetMetatileIdAt = (
  runtime: SpecialFieldAnimRuntime,
  x: number,
  y: number,
  metatileId: number
): void => {
  runtime.metatileIds.set(key(x, y), metatileId);
  runtime.metatileSetLog.push({ x, y, metatileId });
};

const currentMapDrawMetatileAt = (
  runtime: SpecialFieldAnimRuntime,
  x: number,
  y: number
): void => {
  runtime.drawLog.push({ x, y });
};

const drawWholeMapView = (runtime: SpecialFieldAnimRuntime): void => {
  runtime.drawWholeMapViewCount += 1;
};

const setEscalatorMetatile = (
  runtime: SpecialFieldAnimRuntime,
  taskId: number,
  metatileIds: number[],
  metatileMasks: number
): void => {
  const data = taskData(runtime, taskId);
  const x = data[4] - 1;
  const y = data[5] - 1;
  const transitionStage = data[1];

  if (!data[2]) {
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        const id = mapGridGetMetatileIdAt(runtime, x + j, y + i);

        if (metatileIds[transitionStage] === id) {
          if (transitionStage !== LAST_ESCALATOR_STAGE) {
            mapGridSetMetatileIdAt(
              runtime,
              x + j,
              y + i,
              metatileMasks | metatileIds[transitionStage + 1]
            );
          } else {
            mapGridSetMetatileIdAt(runtime, x + j, y + i, metatileMasks | metatileIds[0]);
          }
        }
      }
    }
  } else {
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        const id = mapGridGetMetatileIdAt(runtime, x + j, y + i);

        if (metatileIds[LAST_ESCALATOR_STAGE - transitionStage] === id) {
          if (transitionStage !== LAST_ESCALATOR_STAGE) {
            mapGridSetMetatileIdAt(
              runtime,
              x + j,
              y + i,
              metatileMasks | metatileIds[1 - transitionStage]
            );
          } else {
            mapGridSetMetatileIdAt(
              runtime,
              x + j,
              y + i,
              metatileMasks | metatileIds[LAST_ESCALATOR_STAGE]
            );
          }
        }
      }
    }
  }
};

export const taskDrawEscalator = (
  runtime: SpecialFieldAnimRuntime,
  taskId: number
): void => {
  const data = taskData(runtime, taskId);
  data[3] = 1;

  switch (data[0]) {
    case 0:
      setEscalatorMetatile(runtime, taskId, escalatorMetatilesBottomNextRail, 0);
      break;
    case 1:
      setEscalatorMetatile(runtime, taskId, escalatorMetatilesBottomRail, 0);
      break;
    case 2:
      setEscalatorMetatile(
        runtime,
        taskId,
        escalatorMetatilesBottomNext,
        MAPGRID_COLLISION_MASK
      );
      break;
    case 3:
      setEscalatorMetatile(runtime, taskId, escalatorMetatilesBottom, 0);
      break;
    case 4:
      setEscalatorMetatile(runtime, taskId, escalatorMetatilesTopNext, MAPGRID_COLLISION_MASK);
      break;
    case 5:
      setEscalatorMetatile(runtime, taskId, escalatorMetatilesTop, 0);
      break;
    case 6:
      setEscalatorMetatile(runtime, taskId, escalatorMetatilesTopNextRail, 0);
      break;
  }

  data[0] = (data[0] + 1) & 7;
  const state = data[0] & 7;
  if (state === 0) {
    drawWholeMapView(runtime);
    data[1] = (data[1] + 1) % ESCALATOR_STAGES;
    data[3] = 0;
  }
};

const createEscalatorTask = (
  runtime: SpecialFieldAnimRuntime,
  goingUp: boolean
): number => {
  const taskId = createTask(runtime.taskRuntime, TASK_DRAW_ESCALATOR, 0);
  const data = taskData(runtime, taskId);
  data[4] = runtime.playerDestCoords.x;
  data[5] = runtime.playerDestCoords.y;
  data[0] = 0;
  data[1] = 0;
  data[2] = goingUp ? 1 : 0;
  taskDrawEscalator(runtime, taskId);
  return taskId;
};

export const startEscalator = (
  runtime: SpecialFieldAnimRuntime,
  goingUp: boolean
): void => {
  runtime.escalatorTaskId = createEscalatorTask(runtime, goingUp);
};

export const stopEscalator = (runtime: SpecialFieldAnimRuntime): void => {
  destroyTask(runtime.taskRuntime, runtime.escalatorTaskId);
};

export const isEscalatorMoving = (runtime: SpecialFieldAnimRuntime): boolean => {
  const data = taskData(runtime, runtime.escalatorTaskId);
  if (data[3] === 0) {
    if (data[1] !== LAST_ESCALATOR_STAGE) {
      return true;
    }
    return false;
  }
  return true;
};

export const animateTeleporterHousing = (runtime: SpecialFieldAnimRuntime): number => {
  const taskId = createTask(runtime.taskRuntime, TASK_DRAW_TELEPORTER_HOUSING, 0);
  const data = taskData(runtime, taskId);
  data[0] = 0;
  data[1] = 0;
  data[2] = runtime.playerDestCoords.x;
  data[3] = runtime.playerDestCoords.y;

  if (runtime.specialVar0x8004 === 0) {
    data[2] += 6;
    data[3] -= 5;
  } else {
    data[2] -= 1;
    data[3] -= 5;
  }
  return taskId;
};

export const taskDrawTeleporterHousing = (
  runtime: SpecialFieldAnimRuntime,
  taskId: number
): void => {
  const data = taskData(runtime, taskId);

  if (data[0] === 0) {
    if ((data[1] & 1) === 0) {
      mapGridSetMetatileIdAt(
        runtime,
        data[2],
        data[3],
        METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_YELLOW | MAPGRID_COLLISION_MASK
      );
      mapGridSetMetatileIdAt(
        runtime,
        data[2],
        data[3] + 2,
        METATILE_SEA_COTTAGE_TELEPORTER_DOOR_HALF_GLOWING | MAPGRID_COLLISION_MASK
      );
    } else {
      mapGridSetMetatileIdAt(
        runtime,
        data[2],
        data[3],
        METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_RED | MAPGRID_COLLISION_MASK
      );
      mapGridSetMetatileIdAt(
        runtime,
        data[2],
        data[3] + 2,
        METATILE_SEA_COTTAGE_TELEPORTER_DOOR_FULL_GLOWING | MAPGRID_COLLISION_MASK
      );
    }
    currentMapDrawMetatileAt(runtime, data[2], data[3]);
    currentMapDrawMetatileAt(runtime, data[2], data[3] + 2);
  }

  data[0] += 1;
  if (data[0] !== 16) {
    return;
  }

  data[0] = 0;
  data[1] += 1;
  if (data[1] !== 13) {
    return;
  }

  mapGridSetMetatileIdAt(
    runtime,
    data[2],
    data[3],
    METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_GREEN | MAPGRID_COLLISION_MASK
  );
  mapGridSetMetatileIdAt(
    runtime,
    data[2],
    data[3] + 2,
    METATILE_SEA_COTTAGE_TELEPORTER_DOOR | MAPGRID_COLLISION_MASK
  );
  currentMapDrawMetatileAt(runtime, data[2], data[3]);
  currentMapDrawMetatileAt(runtime, data[2], data[3] + 2);
  destroyTask(runtime.taskRuntime, taskId);
};

export const animateTeleporterCable = (runtime: SpecialFieldAnimRuntime): number => {
  const taskId = createTask(runtime.taskRuntime, TASK_DRAW_TELEPORTER_CABLE, 0);
  const data = taskData(runtime, taskId);
  data[0] = 0;
  data[1] = 0;
  data[2] = runtime.playerDestCoords.x;
  data[3] = runtime.playerDestCoords.y;
  data[2] += 4;
  data[3] -= 5;
  return taskId;
};

export const taskDrawTeleporterCable = (
  runtime: SpecialFieldAnimRuntime,
  taskId: number
): void => {
  const data = taskData(runtime, taskId);

  if (data[0] === 0) {
    if (data[1] !== 0) {
      mapGridSetMetatileIdAt(
        runtime,
        data[2],
        data[3],
        METATILE_SEA_COTTAGE_TELEPORTER_CABLE_TOP | MAPGRID_COLLISION_MASK
      );
      mapGridSetMetatileIdAt(
        runtime,
        data[2],
        data[3] + 1,
        METATILE_SEA_COTTAGE_TELEPORTER_CABLE_BOTTOM | MAPGRID_COLLISION_MASK
      );
      currentMapDrawMetatileAt(runtime, data[2], data[3]);
      currentMapDrawMetatileAt(runtime, data[2], data[3] + 1);

      if (data[1] === 4) {
        destroyTask(runtime.taskRuntime, taskId);
        return;
      }

      data[2] -= 1;
    }

    mapGridSetMetatileIdAt(
      runtime,
      data[2],
      data[3],
      METATILE_SEA_COTTAGE_TELEPORTER_CABLEBALL_TOP | MAPGRID_COLLISION_MASK
    );
    mapGridSetMetatileIdAt(
      runtime,
      data[2],
      data[3] + 1,
      METATILE_SEA_COTTAGE_TELEPORTER_CABLEBALL_BOTTOM | MAPGRID_COLLISION_MASK
    );
    currentMapDrawMetatileAt(runtime, data[2], data[3]);
    currentMapDrawMetatileAt(runtime, data[2], data[3] + 1);
  }

  data[0] += 1;
  if (data[0] === 4) {
    data[0] = 0;
    data[1] += 1;
  }
};

export function SetEscalatorMetatile(
  runtime: SpecialFieldAnimRuntime,
  taskId: number,
  metatileIds: number[],
  metatileMasks: number
): void {
  setEscalatorMetatile(runtime, taskId, metatileIds, metatileMasks);
}

export function Task_DrawEscalator(
  runtime: SpecialFieldAnimRuntime,
  taskId: number
): void {
  taskDrawEscalator(runtime, taskId);
}

export function CreateEscalatorTask(
  runtime: SpecialFieldAnimRuntime,
  goingUp: boolean
): number {
  return createEscalatorTask(runtime, goingUp);
}

export function StartEscalator(
  runtime: SpecialFieldAnimRuntime,
  goingUp: boolean
): void {
  startEscalator(runtime, goingUp);
}

export function StopEscalator(runtime: SpecialFieldAnimRuntime): void {
  stopEscalator(runtime);
}

export function IsEscalatorMoving(runtime: SpecialFieldAnimRuntime): boolean {
  return isEscalatorMoving(runtime);
}

export function AnimateTeleporterHousing(runtime: SpecialFieldAnimRuntime): number {
  return animateTeleporterHousing(runtime);
}

export function Task_DrawTeleporterHousing(
  runtime: SpecialFieldAnimRuntime,
  taskId: number
): void {
  taskDrawTeleporterHousing(runtime, taskId);
}

export function AnimateTeleporterCable(runtime: SpecialFieldAnimRuntime): number {
  return animateTeleporterCable(runtime);
}

export function Task_DrawTeleporterCable(
  runtime: SpecialFieldAnimRuntime,
  taskId: number
): void {
  taskDrawTeleporterCable(runtime, taskId);
}
