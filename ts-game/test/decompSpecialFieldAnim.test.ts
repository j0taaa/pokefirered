import { describe, expect, test } from 'vitest';
import { createTaskRuntime, runTasks } from '../src/game/decompTask';
import {
  AnimateTeleporterCable,
  AnimateTeleporterHousing,
  CreateEscalatorTask,
  IsEscalatorMoving,
  MAPGRID_COLLISION_MASK,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_NORMAL,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION1,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION2,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_TRANSITION1,
  METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_TRANSITION2,
  METATILE_SEA_COTTAGE_TELEPORTER_CABLEBALL_BOTTOM,
  METATILE_SEA_COTTAGE_TELEPORTER_CABLEBALL_TOP,
  METATILE_SEA_COTTAGE_TELEPORTER_CABLE_BOTTOM,
  METATILE_SEA_COTTAGE_TELEPORTER_CABLE_TOP,
  METATILE_SEA_COTTAGE_TELEPORTER_DOOR,
  METATILE_SEA_COTTAGE_TELEPORTER_DOOR_FULL_GLOWING,
  METATILE_SEA_COTTAGE_TELEPORTER_DOOR_HALF_GLOWING,
  METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_GREEN,
  METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_RED,
  METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_YELLOW,
  SetEscalatorMetatile,
  StartEscalator,
  StopEscalator,
  Task_DrawEscalator,
  Task_DrawTeleporterCable,
  Task_DrawTeleporterHousing,
  createSpecialFieldAnimRuntime,
  mapGridGetRawMetatileIdAt,
  registerSpecialFieldAnimCallbacks,
  setRawMapGridMetatileIdAt,
  startEscalator,
  isEscalatorMoving,
  stopEscalator,
  animateTeleporterCable,
  animateTeleporterHousing
} from '../src/game/decompSpecialFieldAnim';

const makeRuntime = () => {
  const taskRuntime = createTaskRuntime();
  const runtime = createSpecialFieldAnimRuntime(taskRuntime);
  registerSpecialFieldAnimCallbacks(runtime);
  return runtime;
};

describe('decomp special_field_anim', () => {
  test('StartEscalator creates a task and advances matching down escalator metatiles by stage', () => {
    const runtime = makeRuntime();
    runtime.playerDestCoords = { x: 10, y: 20 };
    setRawMapGridMetatileIdAt(
      runtime,
      9,
      19,
      METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION2
    );
    setRawMapGridMetatileIdAt(
      runtime,
      10,
      19,
      METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_TRANSITION2
    );

    startEscalator(runtime, false);
    expect(runtime.escalatorTaskId).toBe(0);
    expect(mapGridGetRawMetatileIdAt(runtime, 9, 19)).toBe(
      METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION1
    );
    expect(runtime.taskRuntime.tasks[runtime.escalatorTaskId].data.slice(0, 6)).toEqual([
      1,
      0,
      0,
      1,
      10,
      20
    ]);

    runTasks(runtime.taskRuntime);
    runTasks(runtime.taskRuntime);
    expect(mapGridGetRawMetatileIdAt(runtime, 10, 19)).toBe(
      MAPGRID_COLLISION_MASK | METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_TRANSITION1
    );
  });

  test('going-up escalator uses reversed stage selection and reports movement until final stage settles', () => {
    const runtime = makeRuntime();
    runtime.playerDestCoords = { x: 5, y: 6 };
    setRawMapGridMetatileIdAt(runtime, 4, 5, METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_NORMAL);

    startEscalator(runtime, true);
    expect(mapGridGetRawMetatileIdAt(runtime, 4, 5)).toBe(
      METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION1
    );

    for (let i = 0; i < 7; i += 1) {
      runTasks(runtime.taskRuntime);
    }
    expect(runtime.drawWholeMapViewCount).toBe(1);
    expect(isEscalatorMoving(runtime)).toBe(true);

    for (let i = 0; i < 8; i += 1) {
      runTasks(runtime.taskRuntime);
    }
    expect(runtime.drawWholeMapViewCount).toBe(2);
    expect(isEscalatorMoving(runtime)).toBe(false);
    stopEscalator(runtime);
    expect(runtime.taskRuntime.tasks[runtime.escalatorTaskId].isActive).toBe(false);
  });

  test('AnimateTeleporterHousing alternates lights every 16 frames and restores final tiles', () => {
    const runtime = makeRuntime();
    runtime.playerDestCoords = { x: 20, y: 30 };
    const taskId = animateTeleporterHousing(runtime);

    runTasks(runtime.taskRuntime);
    expect(runtime.metatileSetLog.slice(-2)).toEqual([
      {
        x: 26,
        y: 25,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_YELLOW
      },
      {
        x: 26,
        y: 27,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_DOOR_HALF_GLOWING
      }
    ]);

    for (let i = 0; i < 16; i += 1) {
      runTasks(runtime.taskRuntime);
    }
    expect(runtime.metatileSetLog.slice(-2)).toEqual([
      {
        x: 26,
        y: 25,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_RED
      },
      {
        x: 26,
        y: 27,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_DOOR_FULL_GLOWING
      }
    ]);

    for (let i = 0; i < 191; i += 1) {
      runTasks(runtime.taskRuntime);
    }
    expect(runtime.metatileSetLog.slice(-2)).toEqual([
      {
        x: 26,
        y: 25,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_GREEN
      },
      {
        x: 26,
        y: 27,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_DOOR
      }
    ]);
    expect(runtime.taskRuntime.tasks[taskId].isActive).toBe(false);
  });

  test('AnimateTeleporterHousing selects the left teleporter when special var is nonzero', () => {
    const runtime = makeRuntime();
    runtime.specialVar0x8004 = 1;
    runtime.playerDestCoords = { x: 20, y: 30 };
    animateTeleporterHousing(runtime);

    runTasks(runtime.taskRuntime);
    expect(runtime.metatileSetLog[0]).toMatchObject({ x: 19, y: 25 });
    expect(runtime.metatileSetLog[1]).toMatchObject({ x: 19, y: 27 });
  });

  test('AnimateTeleporterCable moves the cable ball left and clears prior tiles before destroy', () => {
    const runtime = makeRuntime();
    runtime.playerDestCoords = { x: 20, y: 30 };
    const taskId = animateTeleporterCable(runtime);

    runTasks(runtime.taskRuntime);
    expect(runtime.metatileSetLog.slice(-2)).toEqual([
      {
        x: 24,
        y: 25,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_CABLEBALL_TOP
      },
      {
        x: 24,
        y: 26,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_CABLEBALL_BOTTOM
      }
    ]);

    for (let i = 0; i < 4; i += 1) {
      runTasks(runtime.taskRuntime);
    }
    expect(runtime.metatileSetLog.slice(-4)).toEqual([
      {
        x: 24,
        y: 25,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_CABLE_TOP
      },
      {
        x: 24,
        y: 26,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_CABLE_BOTTOM
      },
      {
        x: 23,
        y: 25,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_CABLEBALL_TOP
      },
      {
        x: 23,
        y: 26,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_CABLEBALL_BOTTOM
      }
    ]);

    for (let i = 0; i < 12; i += 1) {
      runTasks(runtime.taskRuntime);
    }
    expect(runtime.taskRuntime.tasks[taskId].isActive).toBe(false);
    expect(runtime.metatileSetLog.slice(-2)).toEqual([
      {
        x: 21,
        y: 25,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_CABLE_TOP
      },
      {
        x: 21,
        y: 26,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_CABLE_BOTTOM
      }
    ]);
  });

  test('exact C-name special field animation exports preserve escalator and teleporter task logic', () => {
    const runtime = makeRuntime();
    runtime.playerDestCoords = { x: 12, y: 18 };
    setRawMapGridMetatileIdAt(
      runtime,
      11,
      17,
      METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION2
    );

    const taskId = CreateEscalatorTask(runtime, false);
    expect(taskId).toBe(0);
    expect(mapGridGetRawMetatileIdAt(runtime, 11, 17)).toBe(
      METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION1
    );

    setRawMapGridMetatileIdAt(
      runtime,
      11,
      17,
      METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION2
    );
    SetEscalatorMetatile(runtime, taskId, [
      METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION2,
      METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION1,
      METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_NORMAL
    ], 0);
    expect(mapGridGetRawMetatileIdAt(runtime, 11, 17)).toBe(
      METATILE_POKEMON_CENTER_ESCALATOR_BOTTOM_NEXT_RAIL_TRANSITION1
    );

    Task_DrawEscalator(runtime, taskId);
    expect(runtime.taskRuntime.tasks[taskId].data[3]).toBe(1);

    StartEscalator(runtime, true);
    expect(runtime.escalatorTaskId).toBe(1);
    expect(IsEscalatorMoving(runtime)).toBe(true);
    StopEscalator(runtime);
    expect(runtime.taskRuntime.tasks[runtime.escalatorTaskId].isActive).toBe(false);

    runtime.playerDestCoords = { x: 20, y: 30 };
    const housingTaskId = AnimateTeleporterHousing(runtime);
    Task_DrawTeleporterHousing(runtime, housingTaskId);
    expect(runtime.metatileSetLog.slice(-2)).toEqual([
      {
        x: 26,
        y: 25,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_LIGHT_YELLOW
      },
      {
        x: 26,
        y: 27,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_DOOR_HALF_GLOWING
      }
    ]);

    const cableTaskId = AnimateTeleporterCable(runtime);
    Task_DrawTeleporterCable(runtime, cableTaskId);
    expect(runtime.metatileSetLog.slice(-2)).toEqual([
      {
        x: 24,
        y: 25,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_CABLEBALL_TOP
      },
      {
        x: 24,
        y: 26,
        metatileId: MAPGRID_COLLISION_MASK | METATILE_SEA_COTTAGE_TELEPORTER_CABLEBALL_BOTTOM
      }
    ]);
  });
});
