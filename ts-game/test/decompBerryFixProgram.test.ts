import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  BERRY_FIX_PROGRAM_SIZE,
  DISPCNT_BG0_ON,
  MULTIBOOT_HEADER_SIZE,
  SCENE_BEGIN,
  SCENE_ENSURE_CONNECT,
  SCENE_FOLLOW_INSTRUCT,
  SCENE_TRANSMIT_FAILED,
  SCENE_TRANSMITTING,
  SCENE_TURN_OFF_POWER,
  STATE_BEGIN,
  STATE_CONNECT,
  STATE_EXIT,
  STATE_FAILED,
  STATE_INIT_MULTIBOOT,
  STATE_MULTIBOOT,
  STATE_RETRY,
  STATE_SUCCEEDED,
  STATE_TRANSMIT,
  STATE_TURN_OFF_POWER,
  CB2_BerryFix,
  CB2_InitBerryFixProgram,
  SetScene,
  Task_BerryFixMain,
  cb2InitBerryFixProgram,
  createBerryFixRuntime,
  taskBerryFixMain
} from '../src/game/decompBerryFixProgram';

describe('decompBerryFixProgram', () => {
  test('CB2_InitBerryFixProgram resets hardware-facing state and creates the main task', () => {
    const runtime = createBerryFixRuntime();
    const taskId = CB2_InitBerryFixProgram(runtime);

    expect(runtime.disabledInterrupts).toEqual([0xffff]);
    expect(runtime.enabledInterrupts).toEqual([1]);
    expect(runtime.soundVSyncOff).toBe(true);
    expect(runtime.dmaFills).toEqual([
      { channel: 3, value: 0, dest: 'VRAM', size: 0x18000 },
      { channel: 3, value: 0, dest: 'PLTT', size: 0x400 }
    ]);
    expect(runtime.spriteDataReset).toBe(true);
    expect(runtime.tasksReset).toBe(true);
    expect(runtime.scanlineEffectStopped).toBe(true);
    expect(runtime.helpSystemEnabled).toBe(false);
    expect(runtime.mainCallback2).toBe('CB2_BerryFix');
    expect(runtime.tasks[taskId].data[0]).toBe(STATE_BEGIN);
  });

  test('SetScene clears registers, decompresses scene graphics, copies palette, and enables BG0', () => {
    const runtime = createBerryFixRuntime();
    SetScene(runtime, SCENE_BEGIN);

    expect(runtime.scenes).toEqual([SCENE_BEGIN]);
    expect(runtime.decompressions).toEqual([
      { source: 'gBerryFixWindow_Gfx', dest: 'BG_CHAR_ADDR(0)' },
      { source: 'gBerryFixWindow_Tilemap', dest: 'BG_SCREEN_ADDR(31)' }
    ]);
    expect(runtime.paletteCopies).toEqual([
      { source: 'gBerryFixWindow_Pal', dest: 'BG_PLTT', size: 0x200 }
    ]);
    expect(runtime.regBG0CNT).toBe(31 << 8);
    expect(runtime.regDISPCNT).toBe(DISPCNT_BG0_ON);
  });

  test('CB2_BerryFix runs active tasks and exact C-name task entry matches the state machine', () => {
    const runtime = createBerryFixRuntime();
    const taskId = cb2InitBerryFixProgram(runtime);

    CB2_BerryFix(runtime);
    expect(runtime.scenes).toEqual([SCENE_BEGIN]);
    expect(runtime.tasks[taskId].data[0]).toBe(STATE_CONNECT);

    runtime.newKeys = A_BUTTON;
    Task_BerryFixMain(runtime, taskId);
    expect(runtime.scenes.at(-1)).toBe(SCENE_ENSURE_CONNECT);
    expect(runtime.tasks[taskId].data[0]).toBe(STATE_TURN_OFF_POWER);
  });

  test('main task advances through button-gated begin/connect/power and initializes multiboot', () => {
    const runtime = createBerryFixRuntime();
    const taskId = cb2InitBerryFixProgram(runtime);

    taskBerryFixMain(runtime, taskId);
    expect(runtime.scenes).toEqual([SCENE_BEGIN]);
    expect(runtime.tasks[taskId].data[0]).toBe(STATE_CONNECT);

    runtime.newKeys = A_BUTTON;
    taskBerryFixMain(runtime, taskId);
    expect(runtime.scenes.at(-1)).toBe(SCENE_ENSURE_CONNECT);
    expect(runtime.tasks[taskId].data[0]).toBe(STATE_TURN_OFF_POWER);

    taskBerryFixMain(runtime, taskId);
    expect(runtime.scenes.at(-1)).toBe(SCENE_TURN_OFF_POWER);
    expect(runtime.tasks[taskId].data[0]).toBe(STATE_INIT_MULTIBOOT);

    taskBerryFixMain(runtime, taskId);
    expect(runtime.multibootStart).toBe(0);
    expect(runtime.multibootSize).toBe(BERRY_FIX_PROGRAM_SIZE);
    expect(runtime.multiBootInitCount).toBe(1);
    expect(runtime.tasks[taskId].data[0]).toBe(STATE_MULTIBOOT);
  });

  test('multiboot waits 181 stable frames before starting transfer, otherwise resets timer and polls', () => {
    const runtime = createBerryFixRuntime();
    const taskId = cb2InitBerryFixProgram(runtime);
    runtime.tasks[taskId].data[0] = STATE_MULTIBOOT;
    runtime.tasks[taskId].data[1] = 180;
    runtime.multibootSize = BERRY_FIX_PROGRAM_SIZE;
    runtime.multibootParam.probe_count = 0;
    runtime.multibootParam.response_bit = 2;
    runtime.multibootParam.client_bit = 2;

    taskBerryFixMain(runtime, taskId);
    expect(runtime.scenes.at(-1)).toBe(SCENE_TRANSMITTING);
    expect(runtime.multiBootStartMasterCalls).toEqual([{
      start: MULTIBOOT_HEADER_SIZE,
      size: BERRY_FIX_PROGRAM_SIZE - MULTIBOOT_HEADER_SIZE,
      paletteData: 4,
      clientBit: 1
    }]);
    expect(runtime.tasks[taskId].data[0]).toBe(STATE_TRANSMIT);

    const resetRuntime = createBerryFixRuntime();
    const resetTaskId = cb2InitBerryFixProgram(resetRuntime);
    resetRuntime.tasks[resetTaskId].data[0] = STATE_MULTIBOOT;
    resetRuntime.tasks[resetTaskId].data[1] = 20;
    resetRuntime.multibootParam.client_bit = 0;
    resetRuntime.multiBootMainResults = [7];
    taskBerryFixMain(resetRuntime, resetTaskId);
    expect(resetRuntime.tasks[resetTaskId].data[1]).toBe(0);
    expect(resetRuntime.multibootStatus).toBe(7);
  });

  test('transmit success, failure, retry, and exit states match C transitions', () => {
    const runtime = createBerryFixRuntime();
    const taskId = cb2InitBerryFixProgram(runtime);
    runtime.tasks[taskId].data[0] = STATE_TRANSMIT;
    runtime.multibootParam.client_bit = 2;
    runtime.multiBootComplete = true;
    taskBerryFixMain(runtime, taskId);
    expect(runtime.scenes.at(-1)).toBe(SCENE_FOLLOW_INSTRUCT);
    expect(runtime.tasks[taskId].data[0]).toBe(STATE_SUCCEEDED);

    taskBerryFixMain(runtime, taskId);
    expect(runtime.tasks[taskId].data[0]).toBe(STATE_EXIT);
    runtime.newKeys = A_BUTTON;
    taskBerryFixMain(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.softReset).toBe(true);

    const failedRuntime = createBerryFixRuntime();
    const failedTaskId = cb2InitBerryFixProgram(failedRuntime);
    failedRuntime.tasks[failedTaskId].data[0] = STATE_TRANSMIT;
    failedRuntime.multibootParam.client_bit = 0;
    taskBerryFixMain(failedRuntime, failedTaskId);
    expect(failedRuntime.tasks[failedTaskId].data[0]).toBe(STATE_FAILED);
    taskBerryFixMain(failedRuntime, failedTaskId);
    expect(failedRuntime.scenes.at(-1)).toBe(SCENE_TRANSMIT_FAILED);
    expect(failedRuntime.tasks[failedTaskId].data[0]).toBe(STATE_RETRY);
    failedRuntime.newKeys = A_BUTTON;
    taskBerryFixMain(failedRuntime, failedTaskId);
    expect(failedRuntime.tasks[failedTaskId].data[0]).toBe(STATE_BEGIN);
  });
});
