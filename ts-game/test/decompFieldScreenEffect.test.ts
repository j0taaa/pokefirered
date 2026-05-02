import { describe, expect, test } from 'vitest';
import {
  DIR_NORTH,
  DIR_WIPE_IN,
  DIR_WIPE_OUT,
  DISPLAY_WIDTH,
  BarnDoorWipeLoadGpuRegs,
  BarnDoorWipeSaveGpuRegs,
  EventScript_AfterWhiteOutHeal,
  EventScript_AfterWhiteOutMomHeal,
  FieldCB_RushInjuredPokemonToCenter,
  FuncIsActiveTask,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_WIN0H,
  REG_OFFSET_WIN1H,
  SetFlashScanlineEffectWindowBoundaries,
  Task_BarnDoorWipe,
  Task_BarnDoorWipeChild,
  Task_RushInjuredPokemonToCenter,
  Task_WaitForFlashUpdate,
  UpdateFlashLevelEffect,
  WriteFlashScanlineEffectBuffer,
  AnimateFlash,
  CreateTask,
  DoInwardBarnDoorFade,
  DoOutwardBarnDoorWipe,
  PrintWhiteOutRecoveryMessage,
  Script_FadeOutMapMusic,
  StartUpdateFlashLevelEffect,
  StartWaitForFlashUpdate,
  WARP_ID_NONE,
  WonderLikeEnterStep,
  WonderLikeExitStep,
  createFieldScreenEffectRuntime,
  sFlashLevelToRadius
} from '../src/game/decompFieldScreenEffect';

describe('decomp field screen effect', () => {
  test('SetFlashScanlineEffectWindowBoundaries matches the C circle approximation and clamps edges', () => {
    const dest = new Uint16Array(240).fill(0xffff);

    SetFlashScanlineEffectWindowBoundaries(dest, 5, 5, 3);

    expect(dest[5]).toBe((2 << 8) | 8);
    expect(dest[2]).toBe((2 << 8) | 8);
    expect(dest[8]).toBe((2 << 8) | 8);

    const edge = new Uint16Array(240).fill(0);
    SetFlashScanlineEffectWindowBoundaries(edge, 1, 1, 10);
    expect(edge[1] >> 8).toBe(0);
    expect(edge[1] & 0xff).toBe(11);
  });

  test('flash update task alternates draw states, advances radius, and clears scanline effect when requested', () => {
    const runtime = createFieldScreenEffectRuntime();
    const taskId = StartUpdateFlashLevelEffect(runtime, 120, 80, 24, 28, true, 2);

    UpdateFlashLevelEffect(runtime, taskId);
    expect(runtime.tasks[taskId].data[0]).toBe(1);
    UpdateFlashLevelEffect(runtime, taskId);
    expect(runtime.tasks[taskId].data[3]).toBe(26);
    UpdateFlashLevelEffect(runtime, taskId);
    UpdateFlashLevelEffect(runtime, taskId);
    UpdateFlashLevelEffect(runtime, taskId);
    UpdateFlashLevelEffect(runtime, taskId);
    expect(runtime.scanlineEffect.stopped).toBe(true);
    expect(runtime.tasks[taskId].data[0]).toBe(2);
    UpdateFlashLevelEffect(runtime, taskId);
    expect(runtime.scanlineEffect.cleared).toBe(true);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('AnimateFlash starts update and waiter tasks, using flash-level radius table and locking controls', () => {
    const runtime = createFieldScreenEffectRuntime({ flashLevel: 1 });

    AnimateFlash(runtime, 0);

    expect(runtime.tasks[0].func).toBe(UpdateFlashLevelEffect);
    expect(runtime.tasks[0].data[3]).toBe(sFlashLevelToRadius[1]);
    expect(runtime.tasks[0].data[4]).toBe(sFlashLevelToRadius[0]);
    expect(runtime.tasks[0].data[6]).toBe(1);
    expect(runtime.tasks[1].func).toBe(Task_WaitForFlashUpdate);
    expect(runtime.playerFieldControlsLocked).toBe(1);
  });

  test('WriteFlashScanlineEffectBuffer writes both scanline buffers only for nonzero flash levels', () => {
    const runtime = createFieldScreenEffectRuntime();

    WriteFlashScanlineEffectBuffer(runtime, 2);
    expect([...runtime.scanlineEffectRegBuffers[1]]).toEqual([...runtime.scanlineEffectRegBuffers[0]]);

    const before = [...runtime.scanlineEffectRegBuffers[0]];
    WriteFlashScanlineEffectBuffer(runtime, 0);
    expect([...runtime.scanlineEffectRegBuffers[0]]).toEqual(before);
  });

  test('flash waiter and map-music fade tasks re-enable script only after their active work is gone', () => {
    const runtime = createFieldScreenEffectRuntime();
    const flashTask = CreateTask(runtime, UpdateFlashLevelEffect, 80);
    StartWaitForFlashUpdate(runtime);

    runtime.tasks[1].func(runtime, 1);
    expect(runtime.scriptEnabledCount).toBe(0);
    runtime.tasks[flashTask].destroyed = true;
    runtime.tasks[1].func(runtime, 1);
    expect(runtime.scriptEnabledCount).toBe(1);

    Script_FadeOutMapMusic(runtime);
    const fadeTask = runtime.tasks[2];
    expect(runtime.mapMusicFadeOuts).toBe(1);
    fadeTask.func(runtime, fadeTask.id);
    expect(runtime.scriptEnabledCount).toBe(1);
    runtime.bgMusicStopped = true;
    fadeTask.func(runtime, fadeTask.id);
    expect(runtime.scriptEnabledCount).toBe(2);
    expect(fadeTask.destroyed).toBe(true);
  });

  test('barn-door wipe parent saves/restores registers and child follows inward/outward offsets', () => {
    const runtime = createFieldScreenEffectRuntime({ gpuRegs: { [REG_OFFSET_DISPCNT]: 7 } });
    DoInwardBarnDoorFade(runtime);
    const parentId = 0;

    Task_BarnDoorWipe(runtime, parentId);
    expect(runtime.gpuRegs[REG_OFFSET_DISPCNT] & (1 << 13)).not.toBe(0);
    expect(runtime.tasks[parentId].data[9]).toBe(1);
    Task_BarnDoorWipe(runtime, parentId);
    expect(FuncIsActiveTask(runtime, Task_BarnDoorWipeChild)).toBe(true);
    const childId = 1;
    Task_BarnDoorWipeChild(runtime, childId);
    expect(runtime.gpuRegs[REG_OFFSET_WIN0H]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_WIN1H]).toBe(((DISPLAY_WIDTH & 0xff) << 8) | (DISPLAY_WIDTH & 0xff));

    runtime.tasks[childId].data[0] = DISPLAY_WIDTH / 2 + 1;
    Task_BarnDoorWipeChild(runtime, childId);
    expect(runtime.tasks[childId].destroyed).toBe(true);
    Task_BarnDoorWipe(runtime, parentId);
    Task_BarnDoorWipe(runtime, parentId);
    expect(runtime.tasks[parentId].destroyed).toBe(true);
    expect(runtime.gpuRegs[REG_OFFSET_DISPCNT]).toBe(7);

    runtime.gpuRegs[REG_OFFSET_DISPCNT] = 0x1234;
    BarnDoorWipeSaveGpuRegs(runtime, parentId);
    runtime.gpuRegs[REG_OFFSET_DISPCNT] = 0;
    BarnDoorWipeLoadGpuRegs(runtime, parentId);
    expect(runtime.gpuRegs[REG_OFFSET_DISPCNT]).toBe(0x1234);

    const outward = createFieldScreenEffectRuntime();
    DoOutwardBarnDoorWipe(outward);
    expect(outward.tasks[0].data[10]).toBe(DIR_WIPE_OUT);
    outward.tasks[0].data[9] = 1;
    outward.tasks[0].func(outward, 0);
    outward.tasks[1].func(outward, 1);
    expect(outward.gpuRegs[REG_OFFSET_WIN0H]).toBe(((0 & 0xff) << 8) | (120 & 0xff));
    expect(outward.gpuRegs[REG_OFFSET_WIN1H]).toBe(((120 & 0xff) << 8) | (DISPLAY_WIDTH & 0xff));
    expect(outward.tasks[0].data[10]).toBe(DIR_WIPE_OUT);
    expect(runtime.tasks[parentId].data[10]).toBe(DIR_WIPE_IN);
  });

  test('whiteout message printer uses task print state and completes when printer is inactive', () => {
    const runtime = createFieldScreenEffectRuntime();
    const taskId = CreateTask(runtime, Task_RushInjuredPokemonToCenter, 10);
    runtime.tasks[taskId].data[1] = 0;
    runtime.windows[0] = { id: 0, template: {}, removed: false, text: '' };

    expect(PrintWhiteOutRecoveryMessage(runtime, taskId, 'hello', 2, 8)).toBe(false);
    expect(runtime.windows[0].text).toBe('2,8:hello');
    runtime.textPrinterActive[0] = false;
    expect(PrintWhiteOutRecoveryMessage(runtime, taskId, 'hello', 2, 8)).toBe(true);
    expect(runtime.tasks[taskId].data[2]).toBe(0);
  });

  test('whiteout task branches to Pokemon Center or home scripts based on last heal location', () => {
    const runtime = createFieldScreenEffectRuntime();
    FieldCB_RushInjuredPokemonToCenter(runtime);
    const task = runtime.tasks[0];

    task.func(runtime, 0);
    expect(task.data[0]).toBe(1);
    task.func(runtime, 0);
    runtime.textPrinterActive[task.data[1]] = false;
    task.func(runtime, 0);
    expect(runtime.playerObjectTurnDirections).toEqual([DIR_NORTH]);
    task.func(runtime, 0);
    runtime.fieldFadeFinished = true;
    task.func(runtime, 0);
    expect(runtime.setupScripts).toEqual([EventScript_AfterWhiteOutHeal]);

    const home = createFieldScreenEffectRuntime();
    home.saveBlock1.lastHealLocation = { ...home.healLocations[1], warpId: WARP_ID_NONE };
    FieldCB_RushInjuredPokemonToCenter(home);
    home.tasks[0].func(home, 0);
    expect(home.tasks[0].data[0]).toBe(4);
    home.tasks[0].func(home, 0);
    home.textPrinterActive[home.tasks[0].data[1]] = false;
    home.tasks[0].func(home, 0);
    home.tasks[0].func(home, 0);
    home.fieldFadeFinished = true;
    home.tasks[0].func(home, 0);
    expect(home.setupScripts).toEqual([EventScript_AfterWhiteOutMomHeal]);
  });

  test('wonder-like enter/exit helper steps preserve palette fade waits and top-menu/checkerboard side effects', () => {
    const runtime = createFieldScreenEffectRuntime({ paletteFadeActiveFrames: 1, giftIsFromEReader: true });

    expect(WonderLikeEnterStep(runtime, 0)).toBe(0);
    expect(WonderLikeEnterStep(runtime, 1)).toBe(0);
    expect(runtime.bgYChanges).toHaveLength(0);
    expect(WonderLikeEnterStep(runtime, 1)).toBe(0);
    expect(runtime.bgYChanges).toHaveLength(4);

    expect(WonderLikeExitStep(runtime, 5, true)).toBe(0);
    expect(runtime.mysteryGiftTopMenuPrints).toEqual([{ giftIsFromEReader: true, useCancel: true }]);
    expect(WonderLikeExitStep(runtime, 6, false)).toBe(0);
    expect(runtime.checkerboardDraws).toBe(1);
  });
});
