import {
  TASK_NONE,
  TaskRuntime,
  createTask,
  destroyTask,
  registerTaskCallback
} from './decompTask';

export const SCANLINE_EFFECT_DMACNT_16BIT = 0xa2600001;
export const SCANLINE_EFFECT_DMACNT_32BIT = 0xa6600001;
export const REG_ADDR_BG0HOFS = 0x04000010;

export const SCANLINE_EFFECT_REG_BG0HOFS = 0;
export const SCANLINE_EFFECT_REG_BG0VOFS = 2;
export const SCANLINE_EFFECT_REG_BG1HOFS = 4;
export const SCANLINE_EFFECT_REG_BG1VOFS = 6;
export const SCANLINE_EFFECT_REG_BG2HOFS = 8;
export const SCANLINE_EFFECT_REG_BG2VOFS = 10;
export const SCANLINE_EFFECT_REG_BG3HOFS = 12;
export const SCANLINE_EFFECT_REG_BG3VOFS = 14;

export const TASK_FUNC_UPDATE_WAVE_PER_FRAME = 'TaskFunc_UpdateWavePerFrame';

export interface ScanlineEffectParams {
  dmaDest: number;
  dmaControl: number;
  initState: number;
  unused9: number;
}

export interface ScanlineEffectState {
  dmaSrcBuffers: (number | null)[];
  dmaDest: number | null;
  dmaControl: number;
  srcBuffer: number;
  state: number;
  unused16: number;
  unused17: number;
  waveTaskId: number;
  setFirstScanlineReg: 'CopyValue16Bit' | 'CopyValue32Bit';
}

export interface ScanlineEffectRuntime {
  taskRuntime: TaskRuntime;
  regBuffers: number[][];
  effect: ScanlineEffectState;
  shouldStopWaveTask: boolean;
  dmaStoppedChannels: number[];
  dmaTransfers: { channel: number; src: number | null; dest: number | null; control: number }[];
  registers: Map<number, number>;
  battleBgOffsets: {
    bg0X: number;
    bg0Y: number;
    bg1X: number;
    bg1Y: number;
    bg2X: number;
    bg2Y: number;
    bg3X: number;
    bg3Y: number;
  };
}

const emptyEffect = (): ScanlineEffectState => ({
  dmaSrcBuffers: [null, null],
  dmaDest: null,
  dmaControl: 0,
  srcBuffer: 0,
  state: 0,
  unused16: 0,
  unused17: 0,
  waveTaskId: TASK_NONE,
  setFirstScanlineReg: 'CopyValue16Bit'
});

export const createScanlineEffectRuntime = (taskRuntime: TaskRuntime): ScanlineEffectRuntime => {
  const runtime: ScanlineEffectRuntime = {
    taskRuntime,
    regBuffers: [
      Array.from({ length: 0x3c0 }, () => 0),
      Array.from({ length: 0x3c0 }, () => 0)
    ],
    effect: emptyEffect(),
    shouldStopWaveTask: false,
    dmaStoppedChannels: [],
    dmaTransfers: [],
    registers: new Map(),
    battleBgOffsets: {
      bg0X: 0,
      bg0Y: 0,
      bg1X: 0,
      bg1Y: 0,
      bg2X: 0,
      bg2Y: 0,
      bg3X: 0,
      bg3Y: 0
    }
  };
  registerTaskCallback(taskRuntime, TASK_FUNC_UPDATE_WAVE_PER_FRAME, (taskId) =>
    taskFuncUpdateWavePerFrame(runtime, taskId)
  );
  return runtime;
};

const u16 = (value: number): number => value & 0xffff;

const dmaStop = (runtime: ScanlineEffectRuntime, channel: number): void => {
  runtime.dmaStoppedChannels.push(channel);
};

const dmaSet = (
  runtime: ScanlineEffectRuntime,
  channel: number,
  src: number | null,
  dest: number | null,
  control: number
): void => {
  runtime.dmaTransfers.push({ channel, src, dest, control });
};

export const scanlineEffectStop = (runtime: ScanlineEffectRuntime): void => {
  runtime.effect.state = 0;
  dmaStop(runtime, 0);
  if (runtime.effect.waveTaskId !== TASK_NONE) {
    destroyTask(runtime.taskRuntime, runtime.effect.waveTaskId);
    runtime.effect.waveTaskId = TASK_NONE;
  }
};

export const scanlineEffectClear = (runtime: ScanlineEffectRuntime): void => {
  for (const buffer of runtime.regBuffers) {
    buffer.fill(0);
  }
  runtime.effect.dmaSrcBuffers[0] = null;
  runtime.effect.dmaSrcBuffers[1] = null;
  runtime.effect.dmaDest = null;
  runtime.effect.dmaControl = 0;
  runtime.effect.srcBuffer = 0;
  runtime.effect.state = 0;
  runtime.effect.unused16 = 0;
  runtime.effect.unused17 = 0;
  runtime.effect.waveTaskId = TASK_NONE;
};

export const scanlineEffectSetParams = (
  runtime: ScanlineEffectRuntime,
  params: ScanlineEffectParams
): void => {
  if (params.dmaControl === SCANLINE_EFFECT_DMACNT_16BIT) {
    runtime.effect.dmaSrcBuffers[0] = 1;
    runtime.effect.dmaSrcBuffers[1] = 1;
    runtime.effect.setFirstScanlineReg = 'CopyValue16Bit';
  } else {
    runtime.effect.dmaSrcBuffers[0] = 2;
    runtime.effect.dmaSrcBuffers[1] = 2;
    runtime.effect.setFirstScanlineReg = 'CopyValue32Bit';
  }

  runtime.effect.dmaControl = params.dmaControl;
  runtime.effect.dmaDest = params.dmaDest;
  runtime.effect.state = params.initState;
  runtime.effect.unused16 = params.unused9;
  runtime.effect.unused17 = params.unused9;
};

export const scanlineEffectInitHBlankDmaTransfer = (runtime: ScanlineEffectRuntime): void => {
  if (runtime.effect.state === 0) {
    return;
  }
  if (runtime.effect.state === 3) {
    runtime.effect.state = 0;
    dmaStop(runtime, 0);
    runtime.shouldStopWaveTask = true;
    return;
  }

  dmaStop(runtime, 0);
  dmaSet(
    runtime,
    0,
    runtime.effect.dmaSrcBuffers[runtime.effect.srcBuffer],
    runtime.effect.dmaDest,
    runtime.effect.dmaControl
  );
  if (runtime.effect.setFirstScanlineReg === 'CopyValue16Bit') {
    copyValue16Bit(runtime);
  } else {
    copyValue32Bit(runtime);
  }
  runtime.effect.srcBuffer ^= 1;
};

const copyValue16Bit = (runtime: ScanlineEffectRuntime): void => {
  if (runtime.effect.dmaDest !== null) {
    runtime.registers.set(runtime.effect.dmaDest, u16(runtime.regBuffers[runtime.effect.srcBuffer][0]));
  }
};

const copyValue32Bit = (runtime: ScanlineEffectRuntime): void => {
  if (runtime.effect.dmaDest !== null) {
    const value =
      (runtime.regBuffers[runtime.effect.srcBuffer][0] & 0xffff) |
      ((runtime.regBuffers[runtime.effect.srcBuffer][1] & 0xffff) << 16);
    runtime.registers.set(runtime.effect.dmaDest, value >>> 0);
  }
};

const taskData = {
  startLine: 0,
  endLine: 1,
  waveLength: 2,
  srcBufferOffset: 3,
  framesUntilMove: 4,
  delayInterval: 5,
  regOffset: 6,
  applyBattleBgOffsets: 7
} as const;

const getBattleBgOffset = (runtime: ScanlineEffectRuntime, regOffset: number): number => {
  switch (regOffset) {
    case SCANLINE_EFFECT_REG_BG0HOFS:
      return runtime.battleBgOffsets.bg0X;
    case SCANLINE_EFFECT_REG_BG0VOFS:
      return runtime.battleBgOffsets.bg0Y;
    case SCANLINE_EFFECT_REG_BG1HOFS:
      return runtime.battleBgOffsets.bg1X;
    case SCANLINE_EFFECT_REG_BG1VOFS:
      return runtime.battleBgOffsets.bg1Y;
    case SCANLINE_EFFECT_REG_BG2HOFS:
      return runtime.battleBgOffsets.bg2X;
    case SCANLINE_EFFECT_REG_BG2VOFS:
      return runtime.battleBgOffsets.bg2Y;
    case SCANLINE_EFFECT_REG_BG3HOFS:
      return runtime.battleBgOffsets.bg3X;
    case SCANLINE_EFFECT_REG_BG3VOFS:
      return runtime.battleBgOffsets.bg3Y;
    default:
      return 0;
  }
};

export const taskFuncUpdateWavePerFrame = (
  runtime: ScanlineEffectRuntime,
  taskId: number
): void => {
  const task = runtime.taskRuntime.tasks[taskId];
  let value = 0;
  let offset: number;

  if (runtime.shouldStopWaveTask) {
    destroyTask(runtime.taskRuntime, taskId);
    runtime.effect.waveTaskId = TASK_NONE;
  } else {
    if (task.data[taskData.applyBattleBgOffsets]) {
      value = getBattleBgOffset(runtime, task.data[taskData.regOffset]);
    }
    if (task.data[taskData.framesUntilMove] !== 0) {
      task.data[taskData.framesUntilMove] -= 1;
      offset = task.data[taskData.srcBufferOffset] + 320;
      for (let i = task.data[taskData.startLine]; i < task.data[taskData.endLine]; i += 1) {
        runtime.regBuffers[runtime.effect.srcBuffer][i] = u16(runtime.regBuffers[0][offset] + value);
        offset += 1;
      }
    } else {
      task.data[taskData.framesUntilMove] = task.data[taskData.delayInterval];
      offset = task.data[taskData.srcBufferOffset] + 320;
      for (let i = task.data[taskData.startLine]; i < task.data[taskData.endLine]; i += 1) {
        runtime.regBuffers[runtime.effect.srcBuffer][i] = u16(runtime.regBuffers[0][offset] + value);
        offset += 1;
      }
      task.data[taskData.srcBufferOffset] += 1;
      if (task.data[taskData.srcBufferOffset] === task.data[taskData.waveLength]) {
        task.data[taskData.srcBufferOffset] = 0;
      }
    }
  }
};

export const gSineTable: number[] = Array.from({ length: 320 }, (_unused, i) =>
  Math.round(Math.sin((i * Math.PI) / 128) * 256)
);

export const generateWave = (
  buffer: number[],
  frequency: number,
  amplitude: number,
  _unused: number
): void => {
  let i = 0;
  let theta = 0;
  while (i < 256) {
    buffer[i] = Math.trunc((gSineTable[theta] * amplitude) / 256);
    theta = (theta + frequency) & 0xff;
    i += 1;
  }
};

export const scanlineEffectInitWave = (
  runtime: ScanlineEffectRuntime,
  startLine: number,
  endLine: number,
  frequency: number,
  amplitude: number,
  delayInterval: number,
  regOffset: number,
  applyBattleBgOffsets: boolean
): number => {
  scanlineEffectClear(runtime);

  scanlineEffectSetParams(runtime, {
    dmaDest: REG_ADDR_BG0HOFS + regOffset,
    dmaControl: SCANLINE_EFFECT_DMACNT_16BIT,
    initState: 1,
    unused9: 0
  });

  const taskId = createTask(runtime.taskRuntime, TASK_FUNC_UPDATE_WAVE_PER_FRAME, 0);
  const data = runtime.taskRuntime.tasks[taskId].data;
  data[taskData.startLine] = startLine & 0xff;
  data[taskData.endLine] = endLine & 0xff;
  data[taskData.waveLength] = Math.trunc(256 / (frequency & 0xff));
  data[taskData.srcBufferOffset] = 0;
  data[taskData.framesUntilMove] = delayInterval & 0xff;
  data[taskData.delayInterval] = delayInterval & 0xff;
  data[taskData.regOffset] = regOffset & 0xff;
  data[taskData.applyBattleBgOffsets] = applyBattleBgOffsets ? 1 : 0;

  runtime.effect.waveTaskId = taskId;
  runtime.shouldStopWaveTask = false;

  const wave = Array.from({ length: 256 }, () => 0);
  generateWave(wave, frequency & 0xff, amplitude & 0xff, (endLine - startLine) & 0xff);
  for (let i = 0; i < 256; i += 1) {
    runtime.regBuffers[0][320 + i] = u16(wave[i]);
  }

  let offset = 320;
  for (let i = startLine; i < endLine; i += 1) {
    runtime.regBuffers[0][i] = runtime.regBuffers[0][offset];
    runtime.regBuffers[1][i] = runtime.regBuffers[0][offset];
    offset += 1;
  }

  return taskId;
};

export function ScanlineEffect_Stop(runtime: ScanlineEffectRuntime): void {
  scanlineEffectStop(runtime);
}

export function ScanlineEffect_Clear(runtime: ScanlineEffectRuntime): void {
  scanlineEffectClear(runtime);
}

export function ScanlineEffect_SetParams(
  runtime: ScanlineEffectRuntime,
  params: ScanlineEffectParams
): void {
  scanlineEffectSetParams(runtime, params);
}

export function ScanlineEffect_InitHBlankDmaTransfer(runtime: ScanlineEffectRuntime): void {
  scanlineEffectInitHBlankDmaTransfer(runtime);
}

export function CopyValue16Bit(runtime: ScanlineEffectRuntime): void {
  copyValue16Bit(runtime);
}

export function CopyValue32Bit(runtime: ScanlineEffectRuntime): void {
  copyValue32Bit(runtime);
}

export function TaskFunc_UpdateWavePerFrame(runtime: ScanlineEffectRuntime, taskId: number): void {
  taskFuncUpdateWavePerFrame(runtime, taskId);
}

export function GenerateWave(
  buffer: number[],
  frequency: number,
  amplitude: number,
  unused: number
): void {
  generateWave(buffer, frequency, amplitude, unused);
}

export function ScanlineEffect_InitWave(
  runtime: ScanlineEffectRuntime,
  startLine: number,
  endLine: number,
  frequency: number,
  amplitude: number,
  delayInterval: number,
  regOffset: number,
  applyBattleBgOffsets: boolean
): number {
  return scanlineEffectInitWave(
    runtime,
    startLine,
    endLine,
    frequency,
    amplitude,
    delayInterval,
    regOffset,
    applyBattleBgOffsets
  );
}
