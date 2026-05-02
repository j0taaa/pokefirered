import { describe, expect, test } from 'vitest';
import { createTaskRuntime, findTaskIdByFunc, runTasks } from '../src/game/decompTask';
import {
  ActivatePerStepCallback,
  AshGrassPerStepCallback,
  CrackedFloorPerStepCallback,
  DummyPerStepCallback,
  IcefallCaveIcePerStepCallback,
  MAP_OFFSET,
  MB_ASH_GRASS,
  MB_CRACKED_FLOOR,
  MB_CRACKED_ICE,
  MB_THIN_ICE,
  METATILE_FALLARBOR_ASH_GRASS,
  METATILE_FALLARBOR_NORMAL_GRASS,
  METATILE_LAVARIDGE_NORMAL_GRASS,
  METATILE_PACIFIDLOG_SKY_PILLAR_CRACKED_FLOOR_HOLE,
  METATILE_RS_CAVE_CRACKED_FLOOR,
  METATILE_RS_CAVE_CRACKED_FLOOR_HOLE,
  METATILE_SEAFOAM_ISLANDS_CRACKED_ICE,
  METATILE_SEAFOAM_ISLANDS_ICE_HOLE,
  PLAYER_SPEED_FASTEST,
  SE_ICE_BREAK,
  SE_ICE_CRACK,
  SetCrackedFloorHoleMetatile,
  SetIcefallCaveCrackedIceMetatiles,
  SetUpFieldTasks,
  STEP_CB_ASH,
  STEP_CB_CRACKED_FLOOR,
  STEP_CB_DUMMY,
  STEP_CB_ICE,
  TASK_RUN_PER_STEP_CALLBACK,
  TASK_RUN_TIME_BASED_EVENTS,
  Task_RunPerStepCallback,
  Task_RunTimeBasedEvents,
  VAR_ICE_STEP_COUNT,
  VAR_TEMP_1,
  MarkIcePuzzleCoordVisited,
  ResetFieldTasksArgs,
  activatePerStepCallback,
  ashGrassPerStepCallback,
  crackedFloorPerStepCallback,
  createFieldTasksRuntime,
  getMetatileIdAt,
  icefallCaveIcePerStepCallback,
  markIcePuzzleCoordVisited,
  registerFieldTaskCallbacks,
  resetFieldTasksArgs,
  setIcefallCaveCrackedIceMetatiles,
  setMetatileBehaviorAt,
  setMetatileIdAtForTest,
  setUpFieldTasks
} from '../src/game/decompFieldTasks';

const makeRuntime = () => {
  const taskRuntime = createTaskRuntime();
  const runtime = createFieldTasksRuntime(taskRuntime);
  registerFieldTaskCallbacks(runtime);
  return runtime;
};

const perStepTaskId = (runtime: ReturnType<typeof makeRuntime>): number =>
  findTaskIdByFunc(runtime.taskRuntime, TASK_RUN_PER_STEP_CALLBACK);

describe('decomp field_tasks', () => {
  test('SetUpFieldTasks creates persistent tasks once and ActivatePerStepCallback resets args', () => {
    const runtime = makeRuntime();
    setUpFieldTasks(runtime);
    setUpFieldTasks(runtime);

    const perStepId = perStepTaskId(runtime);
    const timeTaskId = findTaskIdByFunc(runtime.taskRuntime, TASK_RUN_TIME_BASED_EVENTS);
    expect(perStepId).not.toBe(0xff);
    expect(timeTaskId).not.toBe(0xff);
    expect(runtime.taskRuntime.tasks.filter((task) => task.isActive)).toHaveLength(2);
    expect(runtime.taskRuntime.tasks[perStepId].data[0]).toBe(STEP_CB_DUMMY);

    runtime.taskRuntime.tasks[perStepId].data[4] = 99;
    activatePerStepCallback(runtime, STEP_CB_ICE);
    expect(runtime.taskRuntime.tasks[perStepId].data[0]).toBe(STEP_CB_ICE);
    expect(runtime.taskRuntime.tasks[perStepId].data[4]).toBe(0);

    activatePerStepCallback(runtime, 99);
    expect(runtime.taskRuntime.tasks[perStepId].data[0]).toBe(STEP_CB_DUMMY);
  });

  test('Task_RunTimeBasedEvents updates ambient cries only when allowed and reset clears state', () => {
    const runtime = makeRuntime();
    setUpFieldTasks(runtime);
    const timeTaskId = findTaskIdByFunc(runtime.taskRuntime, TASK_RUN_TIME_BASED_EVENTS);

    runTasks(runtime.taskRuntime);
    expect(runtime.ambientCryLog).toEqual([{ state: 0, delay: 0 }]);
    expect(runtime.taskRuntime.tasks[timeTaskId].data[2]).toBe(1);

    runtime.playerFieldControlsLocked = true;
    runTasks(runtime.taskRuntime);
    expect(runtime.ambientCryLog).toHaveLength(1);

    runtime.playerFieldControlsLocked = false;
    runtime.questLogPlaybackState = true;
    runTasks(runtime.taskRuntime);
    expect(runtime.ambientCryLog).toHaveLength(1);

    runtime.taskRuntime.tasks[timeTaskId].data[1] = 7;
    runtime.taskRuntime.tasks[timeTaskId].data[2] = 8;
    resetFieldTasksArgs(runtime);
    expect(runtime.taskRuntime.tasks[timeTaskId].data.slice(1, 3)).toEqual([0, 0]);
  });

  test('SetIcefallCaveCrackedIceMetatiles restores flagged ice puzzle coordinates', () => {
    const runtime = makeRuntime();
    markIcePuzzleCoordVisited(runtime, 8 + MAP_OFFSET, 3 + MAP_OFFSET);
    markIcePuzzleCoordVisited(runtime, 15 + MAP_OFFSET, 5 + MAP_OFFSET);

    setIcefallCaveCrackedIceMetatiles(runtime);
    expect(runtime.metatileSetLog).toEqual([
      { x: 15, y: 10, metatileId: METATILE_SEAFOAM_ISLANDS_CRACKED_ICE },
      { x: 22, y: 12, metatileId: METATILE_SEAFOAM_ISLANDS_CRACKED_ICE }
    ]);
  });

  test('IcefallCaveIcePerStepCallback cracks thin ice after the four-frame delay', () => {
    const runtime = makeRuntime();
    setUpFieldTasks(runtime);
    activatePerStepCallback(runtime, STEP_CB_ICE);
    const taskId = perStepTaskId(runtime);

    runtime.playerDestCoords = { x: 0, y: 0 };
    icefallCaveIcePerStepCallback(runtime, taskId);
    expect(runtime.taskRuntime.tasks[taskId].data.slice(1, 4)).toEqual([1, 0, 0]);

    runtime.playerDestCoords = { x: 8 + MAP_OFFSET, y: 3 + MAP_OFFSET };
    setMetatileBehaviorAt(runtime, runtime.playerDestCoords.x, runtime.playerDestCoords.y, MB_THIN_ICE);
    icefallCaveIcePerStepCallback(runtime, taskId);
    expect(runtime.flags.has(1)).toBe(true);
    expect(runtime.taskRuntime.tasks[taskId].data.slice(1, 7)).toEqual([2, 15, 10, 15, 10, 4]);

    for (let i = 0; i < 4; i += 1) {
      icefallCaveIcePerStepCallback(runtime, taskId);
    }
    expect(runtime.taskRuntime.tasks[taskId].data[6]).toBe(0);
    icefallCaveIcePerStepCallback(runtime, taskId);
    expect(runtime.seLog).toEqual([SE_ICE_CRACK]);
    expect(getMetatileIdAt(runtime, 15, 10)).toBe(METATILE_SEAFOAM_ISLANDS_CRACKED_ICE);
    expect(runtime.drawLog).toEqual([{ x: 15, y: 10 }]);
    expect(runtime.taskRuntime.tasks[taskId].data[1]).toBe(1);
  });

  test('IcefallCaveIcePerStepCallback breaks cracked ice and sets VAR_TEMP_1', () => {
    const runtime = makeRuntime();
    setUpFieldTasks(runtime);
    activatePerStepCallback(runtime, STEP_CB_ICE);
    const taskId = perStepTaskId(runtime);

    icefallCaveIcePerStepCallback(runtime, taskId);
    runtime.playerDestCoords = { x: 12, y: 13 };
    setMetatileBehaviorAt(runtime, 12, 13, MB_CRACKED_ICE);
    icefallCaveIcePerStepCallback(runtime, taskId);
    for (let i = 0; i < 5; i += 1) {
      icefallCaveIcePerStepCallback(runtime, taskId);
    }

    expect(runtime.seLog).toEqual([SE_ICE_BREAK]);
    expect(getMetatileIdAt(runtime, 12, 13)).toBe(METATILE_SEAFOAM_ISLANDS_ICE_HOLE);
    expect(runtime.vars[VAR_TEMP_1]).toBe(1);
  });

  test('AshGrassPerStepCallback starts the matching ash field effect after movement', () => {
    const runtime = makeRuntime();
    setUpFieldTasks(runtime);
    activatePerStepCallback(runtime, STEP_CB_ASH);
    const taskId = perStepTaskId(runtime);

    runtime.playerDestCoords = { x: 3, y: 4 };
    setMetatileBehaviorAt(runtime, 3, 4, MB_ASH_GRASS);
    setMetatileIdAtForTest(runtime, 3, 4, METATILE_FALLARBOR_ASH_GRASS);
    ashGrassPerStepCallback(runtime, taskId);
    expect(runtime.ashEffects).toEqual([
      { x: 3, y: 4, metatileId: METATILE_FALLARBOR_NORMAL_GRASS, duration: 4 }
    ]);

    runtime.playerDestCoords = { x: 4, y: 4 };
    setMetatileBehaviorAt(runtime, 4, 4, MB_ASH_GRASS);
    setMetatileIdAtForTest(runtime, 4, 4, 0);
    ashGrassPerStepCallback(runtime, taskId);
    expect(runtime.ashEffects.at(-1)).toEqual({
      x: 4,
      y: 4,
      metatileId: METATILE_LAVARIDGE_NORMAL_GRASS,
      duration: 4
    });
  });

  test('CrackedFloorPerStepCallback queues up to two delayed floor holes', () => {
    const runtime = makeRuntime();
    setUpFieldTasks(runtime);
    activatePerStepCallback(runtime, STEP_CB_CRACKED_FLOOR);
    const taskId = perStepTaskId(runtime);
    runtime.playerSpeed = PLAYER_SPEED_FASTEST - 1;

    runtime.playerDestCoords = { x: 7, y: 8 };
    setMetatileBehaviorAt(runtime, 7, 8, MB_CRACKED_FLOOR);
    setMetatileIdAtForTest(runtime, 7, 8, METATILE_RS_CAVE_CRACKED_FLOOR);
    crackedFloorPerStepCallback(runtime, taskId);
    expect(runtime.vars[VAR_ICE_STEP_COUNT]).toBe(0);
    expect(runtime.taskRuntime.tasks[taskId].data.slice(4, 7)).toEqual([3, 7, 8]);

    runtime.playerSpeed = PLAYER_SPEED_FASTEST;
    runtime.playerDestCoords = { x: 8, y: 8 };
    setMetatileBehaviorAt(runtime, 8, 8, MB_CRACKED_FLOOR);
    setMetatileIdAtForTest(runtime, 8, 8, 0);
    crackedFloorPerStepCallback(runtime, taskId);
    expect(runtime.taskRuntime.tasks[taskId].data.slice(4, 10)).toEqual([2, 7, 8, 3, 8, 8]);

    crackedFloorPerStepCallback(runtime, taskId);
    crackedFloorPerStepCallback(runtime, taskId);
    expect(getMetatileIdAt(runtime, 7, 8)).toBe(METATILE_RS_CAVE_CRACKED_FLOOR_HOLE);
    crackedFloorPerStepCallback(runtime, taskId);
    expect(getMetatileIdAt(runtime, 8, 8)).toBe(METATILE_PACIFIDLOG_SKY_PILLAR_CRACKED_FLOOR_HOLE);
    expect(runtime.drawLog).toEqual([
      { x: 7, y: 8 },
      { x: 8, y: 8 }
    ]);
  });

  test('exact C-name exports dispatch the same field task callbacks and helpers', () => {
    const runtime = makeRuntime();
    SetUpFieldTasks(runtime);
    const perStepId = perStepTaskId(runtime);
    const timeTaskId = findTaskIdByFunc(runtime.taskRuntime, TASK_RUN_TIME_BASED_EVENTS);

    ActivatePerStepCallback(runtime, STEP_CB_ICE);
    expect(runtime.taskRuntime.tasks[perStepId].data[0]).toBe(STEP_CB_ICE);
    Task_RunTimeBasedEvents(runtime, timeTaskId);
    expect(runtime.ambientCryLog).toEqual([{ state: 0, delay: 0 }]);
    ResetFieldTasksArgs(runtime);
    expect(runtime.taskRuntime.tasks[timeTaskId].data.slice(1, 3)).toEqual([0, 0]);

    runtime.playerDestCoords = { x: 0, y: 0 };
    Task_RunPerStepCallback(runtime, perStepId);
    expect(runtime.taskRuntime.tasks[perStepId].data.slice(1, 4)).toEqual([1, 0, 0]);
    MarkIcePuzzleCoordVisited(runtime, 8 + MAP_OFFSET, 3 + MAP_OFFSET);
    SetIcefallCaveCrackedIceMetatiles(runtime);
    expect(getMetatileIdAt(runtime, 15, 10)).toBe(METATILE_SEAFOAM_ISLANDS_CRACKED_ICE);

    DummyPerStepCallback(runtime, perStepId);
    runtime.playerDestCoords = { x: 2, y: 3 };
    setMetatileBehaviorAt(runtime, 2, 3, MB_THIN_ICE);
    IcefallCaveIcePerStepCallback(runtime, perStepId);
    expect(runtime.taskRuntime.tasks[perStepId].data[1]).toBe(2);

    ActivatePerStepCallback(runtime, STEP_CB_ASH);
    runtime.playerDestCoords = { x: 4, y: 5 };
    setMetatileBehaviorAt(runtime, 4, 5, MB_ASH_GRASS);
    setMetatileIdAtForTest(runtime, 4, 5, METATILE_FALLARBOR_ASH_GRASS);
    AshGrassPerStepCallback(runtime, perStepId);
    expect(runtime.ashEffects.at(-1)).toEqual({ x: 4, y: 5, metatileId: METATILE_FALLARBOR_NORMAL_GRASS, duration: 4 });

    setMetatileIdAtForTest(runtime, 6, 7, METATILE_RS_CAVE_CRACKED_FLOOR);
    SetCrackedFloorHoleMetatile(runtime, 6, 7);
    expect(getMetatileIdAt(runtime, 6, 7)).toBe(METATILE_RS_CAVE_CRACKED_FLOOR_HOLE);

    ActivatePerStepCallback(runtime, STEP_CB_CRACKED_FLOOR);
    runtime.playerDestCoords = { x: 8, y: 9 };
    setMetatileBehaviorAt(runtime, 8, 9, MB_CRACKED_FLOOR);
    CrackedFloorPerStepCallback(runtime, perStepId);
    expect(runtime.taskRuntime.tasks[perStepId].data.slice(4, 7)).toEqual([3, 8, 9]);
  });
});
