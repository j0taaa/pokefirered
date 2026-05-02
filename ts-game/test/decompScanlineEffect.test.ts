import { describe, expect, test } from 'vitest';
import { createTaskRuntime, runTasks } from '../src/game/decompTask';
import {
  CopyValue16Bit,
  CopyValue32Bit,
  GenerateWave,
  REG_ADDR_BG0HOFS,
  SCANLINE_EFFECT_DMACNT_16BIT,
  SCANLINE_EFFECT_DMACNT_32BIT,
  SCANLINE_EFFECT_REG_BG1HOFS,
  ScanlineEffect_Clear,
  ScanlineEffect_InitHBlankDmaTransfer,
  ScanlineEffect_InitWave,
  ScanlineEffect_SetParams,
  ScanlineEffect_Stop,
  TASK_FUNC_UPDATE_WAVE_PER_FRAME,
  TaskFunc_UpdateWavePerFrame,
  createScanlineEffectRuntime,
  gSineTable,
  generateWave,
  scanlineEffectClear,
  scanlineEffectInitHBlankDmaTransfer,
  scanlineEffectInitWave,
  scanlineEffectSetParams,
  scanlineEffectStop
} from '../src/game/decompScanlineEffect';

describe('decomp scanline_effect', () => {
  test('clear resets buffers and state fields', () => {
    const tasks = createTaskRuntime();
    const runtime = createScanlineEffectRuntime(tasks);
    runtime.regBuffers[0][5] = 123;
    runtime.effect.state = 2;
    runtime.effect.waveTaskId = 3;

    scanlineEffectClear(runtime);

    expect(runtime.regBuffers[0][5]).toBe(0);
    expect(runtime.effect).toMatchObject({
      dmaSrcBuffers: [null, null],
      dmaDest: null,
      dmaControl: 0,
      srcBuffer: 0,
      state: 0,
      waveTaskId: 0xff
    });
  });

  test('set params and init hblank DMA copy first scanline and swap source buffer', () => {
    const tasks = createTaskRuntime();
    const runtime = createScanlineEffectRuntime(tasks);
    runtime.regBuffers[0][0] = 0x1234;

    scanlineEffectSetParams(runtime, {
      dmaDest: 0x4000010,
      dmaControl: SCANLINE_EFFECT_DMACNT_16BIT,
      initState: 1,
      unused9: 7
    });
    scanlineEffectInitHBlankDmaTransfer(runtime);

    expect(runtime.dmaStoppedChannels).toEqual([0]);
    expect(runtime.dmaTransfers[0]).toEqual({
      channel: 0,
      src: 1,
      dest: 0x4000010,
      control: SCANLINE_EFFECT_DMACNT_16BIT
    });
    expect(runtime.registers.get(0x4000010)).toBe(0x1234);
    expect(runtime.effect.srcBuffer).toBe(1);

    runtime.regBuffers[1][0] = 0x5678;
    runtime.regBuffers[1][1] = 0x9abc;
    scanlineEffectSetParams(runtime, {
      dmaDest: 0x4000020,
      dmaControl: SCANLINE_EFFECT_DMACNT_32BIT,
      initState: 1,
      unused9: 0
    });
    runtime.effect.srcBuffer = 1;
    scanlineEffectInitHBlankDmaTransfer(runtime);
    expect(runtime.registers.get(0x4000020)).toBe(0x9abc5678);
  });

  test('state 3 stops DMA and schedules wave task stop on next task frame', () => {
    const tasks = createTaskRuntime();
    const runtime = createScanlineEffectRuntime(tasks);
    const taskId = scanlineEffectInitWave(runtime, 1, 3, 8, 16, 0, 0, false);
    runtime.effect.state = 3;

    scanlineEffectInitHBlankDmaTransfer(runtime);
    expect(runtime.effect.state).toBe(0);
    expect(runtime.shouldStopWaveTask).toBe(true);

    runTasks(tasks);
    expect(tasks.tasks[taskId].isActive).toBe(false);
    expect(runtime.effect.waveTaskId).toBe(0xff);
  });

  test('wave generation, task data, and per-frame update match the C wave logic', () => {
    const tasks = createTaskRuntime();
    const runtime = createScanlineEffectRuntime(tasks);
    runtime.battleBgOffsets.bg1X = 5;

    const taskId = scanlineEffectInitWave(runtime, 2, 6, 8, 32, 1, SCANLINE_EFFECT_REG_BG1HOFS, true);

    expect(taskId).toBe(0);
    expect(tasks.tasks[taskId].func).toBe(TASK_FUNC_UPDATE_WAVE_PER_FRAME);
    expect(runtime.effect.dmaDest).toBe(REG_ADDR_BG0HOFS + SCANLINE_EFFECT_REG_BG1HOFS);
    expect(tasks.tasks[taskId].data.slice(0, 8)).toEqual([2, 6, 32, 0, 1, 1, 4, 1]);
    expect(gSineTable[64]).toBe(256);

    const generated = Array.from({ length: 256 }, () => 0);
    generateWave(generated, 8, 32, 4);
    expect(generated[0]).toBe(0);
    expect(generated[8]).toBe(32);

    runTasks(tasks);
    expect(tasks.tasks[taskId].data[4]).toBe(0);
    expect(runtime.regBuffers[0].slice(2, 6)).toEqual([5, 11, 17, 22]);

    runTasks(tasks);
    expect(tasks.tasks[taskId].data[3]).toBe(1);
    expect(tasks.tasks[taskId].data[4]).toBe(1);
    expect(runtime.regBuffers[0].slice(2, 6)).toEqual([5, 11, 17, 22]);
  });

  test('stop destroys an active wave task immediately', () => {
    const tasks = createTaskRuntime();
    const runtime = createScanlineEffectRuntime(tasks);
    const taskId = scanlineEffectInitWave(runtime, 0, 2, 4, 10, 0, 0, false);

    scanlineEffectStop(runtime);

    expect(runtime.effect.state).toBe(0);
    expect(runtime.effect.waveTaskId).toBe(0xff);
    expect(tasks.tasks[taskId].isActive).toBe(false);
    expect(runtime.dmaStoppedChannels).toContain(0);
  });

  test('exact C-name scanline helpers preserve DMA, copy, task, and wave behavior', () => {
    const tasks = createTaskRuntime();
    const runtime = createScanlineEffectRuntime(tasks);

    runtime.regBuffers[0][0] = 0x1357;
    runtime.regBuffers[1][0] = 0x2468;
    runtime.regBuffers[1][1] = 0xace0;
    ScanlineEffect_SetParams(runtime, {
      dmaDest: 0x4000014,
      dmaControl: SCANLINE_EFFECT_DMACNT_16BIT,
      initState: 1,
      unused9: 3
    });
    CopyValue16Bit(runtime);
    expect(runtime.registers.get(0x4000014)).toBe(0x1357);
    expect(runtime.effect.unused16).toBe(3);
    expect(runtime.effect.unused17).toBe(3);

    runtime.effect.srcBuffer = 1;
    ScanlineEffect_SetParams(runtime, {
      dmaDest: 0x4000020,
      dmaControl: SCANLINE_EFFECT_DMACNT_32BIT,
      initState: 1,
      unused9: 0
    });
    runtime.effect.srcBuffer = 1;
    CopyValue32Bit(runtime);
    expect(runtime.registers.get(0x4000020)).toBe(0xace02468);

    ScanlineEffect_InitHBlankDmaTransfer(runtime);
    expect(runtime.dmaTransfers.at(-1)).toEqual({
      channel: 0,
      src: 2,
      dest: 0x4000020,
      control: SCANLINE_EFFECT_DMACNT_32BIT
    });

    const generated = Array.from({ length: 256 }, () => 0);
    GenerateWave(generated, 8, 32, 0);
    expect(generated[0]).toBe(0);
    expect(generated[8]).toBe(32);

    ScanlineEffect_Clear(runtime);
    const taskId = ScanlineEffect_InitWave(runtime, 2, 6, 8, 32, 1, SCANLINE_EFFECT_REG_BG1HOFS, true);
    runtime.battleBgOffsets.bg1X = 5;
    TaskFunc_UpdateWavePerFrame(runtime, taskId);
    expect(runtime.taskRuntime.tasks[taskId].data.slice(0, 8)).toEqual([2, 6, 32, 0, 0, 1, 4, 1]);
    expect(runtime.regBuffers[0].slice(2, 6)).toEqual([5, 11, 17, 22]);

    ScanlineEffect_Stop(runtime);
    expect(runtime.effect.state).toBe(0);
    expect(runtime.effect.waveTaskId).toBe(0xff);
    expect(tasks.tasks[taskId].isActive).toBe(false);
  });
});
