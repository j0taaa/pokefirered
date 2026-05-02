export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
export const TRUE = true;
export const FALSE = false;
export const TASK_NONE = 0xff;

export const sFlashLevelToRadius = [200, 72, 56, 40, 24] as const;
export const gMaxFlashLevel = sFlashLevelToRadius.length - 1;

export const REG_OFFSET_DISPCNT = 'DISPCNT';
export const REG_OFFSET_WININ = 'WININ';
export const REG_OFFSET_WINOUT = 'WINOUT';
export const REG_OFFSET_BLDCNT = 'BLDCNT';
export const REG_OFFSET_BLDALPHA = 'BLDALPHA';
export const REG_OFFSET_WIN0H = 'WIN0H';
export const REG_OFFSET_WIN0V = 'WIN0V';
export const REG_OFFSET_WIN1H = 'WIN1H';
export const REG_OFFSET_WIN1V = 'WIN1V';

export const DISPCNT_WIN0_ON = 1 << 13;
export const DISPCNT_WIN1_ON = 1 << 14;
export const WINOUT_WIN01_BG_ALL = 0x1f;
export const WINOUT_WIN01_OBJ = 0x10;
export const WINOUT_WIN01_CLR = 0x20;

export const DIR_WIPE_IN = 0;
export const DIR_WIPE_OUT = 1;
export const DIR_NORTH = 2;
export const WARP_ID_NONE = 0x7f;
export const HEAL_LOCATION_PALLET_TOWN = 1;

export type FieldScreenTaskFunc = (runtime: FieldScreenEffectRuntime, taskId: number) => void;

export interface FieldScreenTask {
  id: number;
  func: FieldScreenTaskFunc;
  priority: number;
  data: number[];
  destroyed: boolean;
}

export interface HealLocation {
  mapGroup: number;
  mapNum: number;
  warpId: number;
  x: number;
  y: number;
}

export interface FieldScreenEffectRuntime {
  scanlineEffectRegBuffers: [Uint16Array, Uint16Array];
  scanlineEffect: { srcBuffer: 0 | 1; stopped: boolean; cleared: boolean };
  tasks: FieldScreenTask[];
  nextTaskId: number;
  flashLevel: number;
  scriptEnabledCount: number;
  playerFieldControlsLocked: number;
  bgMusicStopped: boolean;
  mapMusicFadeOuts: number;
  gpuRegs: Record<string, number>;
  gpuRegWrites: Array<{ reg: string; value: number }>;
  windows: Array<{ id: number; template: unknown; removed: boolean; text: string }>;
  nextWindowId: number;
  textPrinterActive: Record<number, boolean>;
  expandedText: string;
  textPrinterRuns: number;
  saveBlock1: { lastHealLocation: HealLocation };
  healLocations: Record<number, HealLocation>;
  playerObjectTurnDirections: number[];
  paletteBgFadedBlackCount: number;
  fadeInFromBlackCount: number;
  fieldFadeFinished: boolean;
  setupScripts: string[];
  mysteryGiftTopMenuPrints: Array<{ giftIsFromEReader: boolean; useCancel: boolean }>;
  checkerboardDraws: number;
  bgYChanges: Array<{ bg: number; value: number; op: string }>;
  bgFills: Array<{ bg: number; value: number; x: number; y: number; width: number; height: number }>;
  bgCopies: number[];
  bgShown: number[];
  bgHidden: number[];
  paletteFades: Array<{ palettes: number; delay: number; start: number; end: number; color: number }>;
  paletteFadeActiveFrames: number;
  tempTileDataBusyFrames: number;
  decompressedTileData: Array<{ bg: number; source: unknown; size: number; offset: number; mode: number }>;
  scrollArrowPairs: Array<{ id: number; scrollOffsetRef: { value: number }; removed: boolean }>;
  nextScrollArrowTaskId: number;
  giftIsFromEReader: boolean;
}

export const WIN_RANGE = (min: number, max: number): number => ((min & 0xff) << 8) | (max & 0xff);

export const createFieldScreenEffectRuntime = (
  overrides: Partial<FieldScreenEffectRuntime> = {}
): FieldScreenEffectRuntime => ({
  scanlineEffectRegBuffers: overrides.scanlineEffectRegBuffers ?? [new Uint16Array(240), new Uint16Array(240)],
  scanlineEffect: overrides.scanlineEffect ?? { srcBuffer: 0, stopped: false, cleared: false },
  tasks: overrides.tasks ?? [],
  nextTaskId: overrides.nextTaskId ?? 0,
  flashLevel: overrides.flashLevel ?? 0,
  scriptEnabledCount: overrides.scriptEnabledCount ?? 0,
  playerFieldControlsLocked: overrides.playerFieldControlsLocked ?? 0,
  bgMusicStopped: overrides.bgMusicStopped ?? false,
  mapMusicFadeOuts: overrides.mapMusicFadeOuts ?? 0,
  gpuRegs: overrides.gpuRegs ?? {},
  gpuRegWrites: overrides.gpuRegWrites ?? [],
  windows: overrides.windows ?? [],
  nextWindowId: overrides.nextWindowId ?? 0,
  textPrinterActive: overrides.textPrinterActive ?? {},
  expandedText: overrides.expandedText ?? '',
  textPrinterRuns: overrides.textPrinterRuns ?? 0,
  saveBlock1: overrides.saveBlock1 ?? {
    lastHealLocation: { mapGroup: 0, mapNum: 0, warpId: 0, x: 0, y: 0 }
  },
  healLocations: overrides.healLocations ?? {
    [HEAL_LOCATION_PALLET_TOWN]: { mapGroup: 4, mapNum: 1, warpId: WARP_ID_NONE, x: 5, y: 6 }
  },
  playerObjectTurnDirections: overrides.playerObjectTurnDirections ?? [],
  paletteBgFadedBlackCount: overrides.paletteBgFadedBlackCount ?? 0,
  fadeInFromBlackCount: overrides.fadeInFromBlackCount ?? 0,
  fieldFadeFinished: overrides.fieldFadeFinished ?? false,
  setupScripts: overrides.setupScripts ?? [],
  mysteryGiftTopMenuPrints: overrides.mysteryGiftTopMenuPrints ?? [],
  checkerboardDraws: overrides.checkerboardDraws ?? 0,
  bgYChanges: overrides.bgYChanges ?? [],
  bgFills: overrides.bgFills ?? [],
  bgCopies: overrides.bgCopies ?? [],
  bgShown: overrides.bgShown ?? [],
  bgHidden: overrides.bgHidden ?? [],
  paletteFades: overrides.paletteFades ?? [],
  paletteFadeActiveFrames: overrides.paletteFadeActiveFrames ?? 0,
  tempTileDataBusyFrames: overrides.tempTileDataBusyFrames ?? 0,
  decompressedTileData: overrides.decompressedTileData ?? [],
  scrollArrowPairs: overrides.scrollArrowPairs ?? [],
  nextScrollArrowTaskId: overrides.nextScrollArrowTaskId ?? 0,
  giftIsFromEReader: overrides.giftIsFromEReader ?? false
});

export const SetFlashScanlineEffectWindowBoundary = (
  dest: Uint16Array,
  y: number,
  left: number,
  right: number
): void => {
  if (y <= 160 && y >= 0) {
    let clampedLeft = left;
    let clampedRight = right;
    if (clampedLeft < 0) clampedLeft = 0;
    if (clampedLeft > 255) clampedLeft = 255;
    if (clampedRight < 0) clampedRight = 0;
    if (clampedRight > 255) clampedRight = 255;
    dest[y] = ((clampedLeft & 0xff) << 8) | (clampedRight & 0xff);
  }
};

export const SetFlashScanlineEffectWindowBoundaries = (
  dest: Uint16Array,
  centerX: number,
  centerY: number,
  radius: number
): void => {
  let xy = radius;
  let error = radius;
  let yx = 0;
  while (xy >= yx) {
    SetFlashScanlineEffectWindowBoundary(dest, centerY - yx, centerX - xy, centerX + xy);
    SetFlashScanlineEffectWindowBoundary(dest, centerY + yx, centerX - xy, centerX + xy);
    SetFlashScanlineEffectWindowBoundary(dest, centerY - xy, centerX - yx, centerX + yx);
    SetFlashScanlineEffectWindowBoundary(dest, centerY + xy, centerX - yx, centerX + yx);
    error -= (yx * 2) - 1;
    yx += 1;
    if (error < 0) {
      error += 2 * (xy - 1);
      xy -= 1;
    }
  }
};

export const CreateTask = (
  runtime: FieldScreenEffectRuntime,
  func: FieldScreenTaskFunc,
  priority: number
): number => {
  const id = runtime.nextTaskId++;
  runtime.tasks[id] = { id, func, priority, data: Array(16).fill(0), destroyed: false };
  return id;
};

export const DestroyTask = (runtime: FieldScreenEffectRuntime, taskId: number): void => {
  runtime.tasks[taskId].destroyed = true;
};

export const FuncIsActiveTask = (
  runtime: FieldScreenEffectRuntime,
  func: FieldScreenTaskFunc
): boolean => runtime.tasks.some((task) => task && !task.destroyed && task.func === func);

export const FindTaskIdByFunc = (
  runtime: FieldScreenEffectRuntime,
  func: FieldScreenTaskFunc
): number => runtime.tasks.find((task) => task && !task.destroyed && task.func === func)?.id ?? TASK_NONE;

const setGpuReg = (runtime: FieldScreenEffectRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value & 0xffff;
  runtime.gpuRegWrites.push({ reg, value: value & 0xffff });
};

const setGpuRegBits = (runtime: FieldScreenEffectRuntime, reg: string, value: number): void => {
  setGpuReg(runtime, reg, (runtime.gpuRegs[reg] ?? 0) | value);
};

const clearGpuRegBits = (runtime: FieldScreenEffectRuntime, reg: string, value: number): void => {
  setGpuReg(runtime, reg, (runtime.gpuRegs[reg] ?? 0) & ~value);
};

export const ScanlineEffect_Stop = (runtime: FieldScreenEffectRuntime): void => {
  runtime.scanlineEffect.stopped = true;
};

export const ScanlineEffect_Clear = (runtime: FieldScreenEffectRuntime): void => {
  runtime.scanlineEffect.cleared = true;
};

export const UpdateFlashLevelEffect: FieldScreenTaskFunc = (runtime, taskId) => {
  const data = runtime.tasks[taskId].data;
  switch (data[0]) {
    case 0:
      SetFlashScanlineEffectWindowBoundaries(runtime.scanlineEffectRegBuffers[runtime.scanlineEffect.srcBuffer], data[1], data[2], data[3]);
      data[0] = 1;
      break;
    case 1:
      SetFlashScanlineEffectWindowBoundaries(runtime.scanlineEffectRegBuffers[runtime.scanlineEffect.srcBuffer], data[1], data[2], data[3]);
      data[0] = 0;
      data[3] += data[5];
      if (data[3] > data[4]) {
        if (data[6] === 1) {
          ScanlineEffect_Stop(runtime);
          data[0] = 2;
        } else {
          DestroyTask(runtime, taskId);
        }
      }
      break;
    case 2:
      ScanlineEffect_Clear(runtime);
      DestroyTask(runtime, taskId);
      break;
  }
};

export const Task_WaitForFlashUpdate: FieldScreenTaskFunc = (runtime, taskId) => {
  if (!FuncIsActiveTask(runtime, UpdateFlashLevelEffect)) {
    runtime.scriptEnabledCount += 1;
    DestroyTask(runtime, taskId);
  }
};

export const StartWaitForFlashUpdate = (runtime: FieldScreenEffectRuntime): void => {
  if (!FuncIsActiveTask(runtime, Task_WaitForFlashUpdate)) {
    CreateTask(runtime, Task_WaitForFlashUpdate, 80);
  }
};

export const StartUpdateFlashLevelEffect = (
  runtime: FieldScreenEffectRuntime,
  centerX: number,
  centerY: number,
  initialFlashRadius: number,
  destFlashRadius: number,
  clearScanlineEffect: boolean,
  delta: number
): number => {
  const taskId = CreateTask(runtime, UpdateFlashLevelEffect, 80);
  const data = runtime.tasks[taskId].data;
  data[3] = initialFlashRadius;
  data[4] = destFlashRadius;
  data[1] = centerX;
  data[2] = centerY;
  data[6] = clearScanlineEffect ? 1 : 0;
  data[5] = initialFlashRadius < destFlashRadius ? delta : -delta;
  return taskId;
};

export const AnimateFlash = (runtime: FieldScreenEffectRuntime, newFlashLevel: number): void => {
  const curFlashLevel = runtime.flashLevel;
  const fullBrightness = newFlashLevel === 0;
  StartUpdateFlashLevelEffect(runtime, DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2, sFlashLevelToRadius[curFlashLevel], sFlashLevelToRadius[newFlashLevel], fullBrightness, 2);
  StartWaitForFlashUpdate(runtime);
  runtime.playerFieldControlsLocked += 1;
};

export const WriteFlashScanlineEffectBuffer = (
  runtime: FieldScreenEffectRuntime,
  flashLevel: number
): void => {
  if (flashLevel) {
    SetFlashScanlineEffectWindowBoundaries(runtime.scanlineEffectRegBuffers[0], 120, 80, sFlashLevelToRadius[flashLevel]);
    runtime.scanlineEffectRegBuffers[1].set(runtime.scanlineEffectRegBuffers[0]);
  }
};

export const Task_EnableScriptAfterMusicFade: FieldScreenTaskFunc = (runtime, taskId) => {
  if (runtime.bgMusicStopped === TRUE) {
    DestroyTask(runtime, taskId);
    runtime.scriptEnabledCount += 1;
  }
};

export const Script_FadeOutMapMusic = (runtime: FieldScreenEffectRuntime): void => {
  runtime.mapMusicFadeOuts += 1;
  CreateTask(runtime, Task_EnableScriptAfterMusicFade, 80);
};

export const DoInwardBarnDoorFade = (runtime: FieldScreenEffectRuntime): void => {
  const taskId = CreateTask(runtime, Task_BarnDoorWipe, 80);
  runtime.tasks[taskId].data[10] = DIR_WIPE_IN;
};

export const DoOutwardBarnDoorWipe = (runtime: FieldScreenEffectRuntime): void => {
  const taskId = CreateTask(runtime, Task_BarnDoorWipe, 80);
  runtime.tasks[taskId].data[10] = DIR_WIPE_OUT;
};

export const BarnDoorWipeSaveGpuRegs = (runtime: FieldScreenEffectRuntime, taskId: number): void => {
  const data = runtime.tasks[taskId].data;
  data[0] = runtime.gpuRegs[REG_OFFSET_DISPCNT] ?? 0;
  data[1] = runtime.gpuRegs[REG_OFFSET_WININ] ?? 0;
  data[2] = runtime.gpuRegs[REG_OFFSET_WINOUT] ?? 0;
  data[3] = runtime.gpuRegs[REG_OFFSET_BLDCNT] ?? 0;
  data[4] = runtime.gpuRegs[REG_OFFSET_BLDALPHA] ?? 0;
  data[5] = runtime.gpuRegs[REG_OFFSET_WIN0H] ?? 0;
  data[6] = runtime.gpuRegs[REG_OFFSET_WIN0V] ?? 0;
  data[7] = runtime.gpuRegs[REG_OFFSET_WIN1H] ?? 0;
  data[8] = runtime.gpuRegs[REG_OFFSET_WIN1V] ?? 0;
};

export const BarnDoorWipeLoadGpuRegs = (runtime: FieldScreenEffectRuntime, taskId: number): void => {
  const data = runtime.tasks[taskId].data;
  setGpuReg(runtime, REG_OFFSET_DISPCNT, data[0]);
  setGpuReg(runtime, REG_OFFSET_WININ, data[1]);
  setGpuReg(runtime, REG_OFFSET_WINOUT, data[2]);
  setGpuReg(runtime, REG_OFFSET_BLDCNT, data[3]);
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, data[4]);
  setGpuReg(runtime, REG_OFFSET_WIN0H, data[5]);
  setGpuReg(runtime, REG_OFFSET_WIN0V, data[6]);
  setGpuReg(runtime, REG_OFFSET_WIN1H, data[7]);
  setGpuReg(runtime, REG_OFFSET_WIN1V, data[8]);
};

export const Task_BarnDoorWipe: FieldScreenTaskFunc = (runtime, taskId) => {
  const data = runtime.tasks[taskId].data;
  switch (data[9]) {
    case 0:
      BarnDoorWipeSaveGpuRegs(runtime, taskId);
      setGpuRegBits(runtime, REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON);
      setGpuRegBits(runtime, REG_OFFSET_DISPCNT, DISPCNT_WIN1_ON);
      if (data[10] === DIR_WIPE_IN) {
        setGpuReg(runtime, REG_OFFSET_WIN0H, WIN_RANGE(0, 0));
        setGpuReg(runtime, REG_OFFSET_WIN1H, WIN_RANGE(DISPLAY_WIDTH, 255));
        setGpuReg(runtime, REG_OFFSET_WIN0V, WIN_RANGE(0, 255));
        setGpuReg(runtime, REG_OFFSET_WIN1V, WIN_RANGE(0, 255));
      } else {
        setGpuReg(runtime, REG_OFFSET_WIN0H, WIN_RANGE(0, DISPLAY_WIDTH / 2));
        setGpuReg(runtime, REG_OFFSET_WIN0V, WIN_RANGE(0, 255));
        setGpuReg(runtime, REG_OFFSET_WIN1H, WIN_RANGE(DISPLAY_WIDTH / 2, 255));
        setGpuReg(runtime, REG_OFFSET_WIN1V, WIN_RANGE(0, 255));
      }
      setGpuReg(runtime, REG_OFFSET_WININ, 0);
      setGpuReg(runtime, REG_OFFSET_WINOUT, WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ | WINOUT_WIN01_CLR);
      data[9] = 1;
      break;
    case 1:
      CreateTask(runtime, Task_BarnDoorWipeChild, 80);
      data[9] = 2;
      break;
    case 2:
      if (!FuncIsActiveTask(runtime, Task_BarnDoorWipeChild)) {
        data[9] = 3;
      }
      break;
    case 3:
      BarnDoorWipeLoadGpuRegs(runtime, taskId);
      DestroyTask(runtime, taskId);
      break;
  }
};

export const Task_BarnDoorWipeChild: FieldScreenTaskFunc = (runtime, taskId) => {
  const data = runtime.tasks[taskId].data;
  const parentTaskId = FindTaskIdByFunc(runtime, Task_BarnDoorWipe);
  const parent = runtime.tasks[parentTaskId];
  let lhs: number;
  let rhs: number;
  if (parent.data[10] === DIR_WIPE_IN) {
    lhs = data[0];
    rhs = DISPLAY_WIDTH - data[0];
    if (lhs > DISPLAY_WIDTH / 2) {
      DestroyTask(runtime, taskId);
      return;
    }
  } else {
    lhs = DISPLAY_WIDTH / 2 - data[0];
    rhs = DISPLAY_WIDTH / 2 + data[0];
    if (lhs < 0) {
      DestroyTask(runtime, taskId);
      return;
    }
  }
  setGpuReg(runtime, REG_OFFSET_WIN0H, WIN_RANGE(0, lhs));
  setGpuReg(runtime, REG_OFFSET_WIN1H, WIN_RANGE(rhs, DISPLAY_WIDTH));
  if (lhs < 90) {
    data[0] += 4;
  } else {
    data[0] += 2;
  }
};

const addWindow = (runtime: FieldScreenEffectRuntime, template: unknown): number => {
  const id = runtime.nextWindowId++;
  runtime.windows[id] = { id, template, removed: false, text: '' };
  return id;
};

const removeWindow = (runtime: FieldScreenEffectRuntime, id: number): void => {
  runtime.windows[id].removed = true;
};

export const PrintWhiteOutRecoveryMessage = (
  runtime: FieldScreenEffectRuntime,
  taskId: number,
  text: string,
  x: number,
  y: number
): boolean => {
  const task = runtime.tasks[taskId];
  const windowId = task.data[1];
  switch (task.data[2]) {
    case 0:
      runtime.expandedText = text;
      runtime.windows[windowId].text = `${x},${y}:${text}`;
      runtime.textPrinterActive[windowId] = true;
      task.data[2] = 1;
      break;
    case 1:
      runtime.textPrinterRuns += 1;
      if (!runtime.textPrinterActive[windowId]) {
        task.data[2] = 0;
        return true;
      }
      break;
  }
  return false;
};

export const EventScript_AfterWhiteOutHeal = 'EventScript_AfterWhiteOutHeal';
export const EventScript_AfterWhiteOutMomHeal = 'EventScript_AfterWhiteOutMomHeal';

export const Task_RushInjuredPokemonToCenter: FieldScreenTaskFunc = (runtime, taskId) => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0: {
      const windowId = addWindow(runtime, { whiteout: true });
      task.data[1] = windowId;
      const loc = runtime.healLocations[HEAL_LOCATION_PALLET_TOWN];
      const last = runtime.saveBlock1.lastHealLocation;
      task.data[0] = last.mapGroup === loc.mapGroup
        && last.mapNum === loc.mapNum
        && last.warpId === WARP_ID_NONE
        && last.x === loc.x
        && last.y === loc.y
        ? 4
        : 1;
      break;
    }
    case 1:
      if (PrintWhiteOutRecoveryMessage(runtime, taskId, 'gText_PlayerScurriedToCenter', 2, 8)) {
        runtime.playerObjectTurnDirections.push(DIR_NORTH);
        task.data[0] += 1;
      }
      break;
    case 4:
      if (PrintWhiteOutRecoveryMessage(runtime, taskId, 'gText_PlayerScurriedBackHome', 2, 8)) {
        runtime.playerObjectTurnDirections.push(DIR_NORTH);
        task.data[0] += 1;
      }
      break;
    case 2:
    case 5:
      removeWindow(runtime, task.data[1]);
      runtime.paletteBgFadedBlackCount += 1;
      runtime.fadeInFromBlackCount += 1;
      task.data[0] += 1;
      break;
    case 3:
      if (runtime.fieldFadeFinished === TRUE) {
        DestroyTask(runtime, taskId);
        runtime.setupScripts.push(EventScript_AfterWhiteOutHeal);
      }
      break;
    case 6:
      if (runtime.fieldFadeFinished === TRUE) {
        DestroyTask(runtime, taskId);
        runtime.setupScripts.push(EventScript_AfterWhiteOutMomHeal);
      }
      break;
  }
};

export const FieldCB_RushInjuredPokemonToCenter = (runtime: FieldScreenEffectRuntime): void => {
  runtime.playerFieldControlsLocked += 1;
  runtime.paletteBgFadedBlackCount += 1;
  const taskId = CreateTask(runtime, Task_RushInjuredPokemonToCenter, 10);
  runtime.tasks[taskId].data[0] = 0;
};

const beginNormalPaletteFade = (
  runtime: FieldScreenEffectRuntime,
  palettes: number,
  delay: number,
  start: number,
  end: number,
  color: number
): void => {
  runtime.paletteFades.push({ palettes, delay, start, end, color });
};

const updatePaletteFade = (runtime: FieldScreenEffectRuntime): boolean => {
  if (runtime.paletteFadeActiveFrames > 0) {
    runtime.paletteFadeActiveFrames -= 1;
    return true;
  }
  return false;
};

export const FreeTempTileDataBuffersIfPossible = (runtime: FieldScreenEffectRuntime): boolean => {
  if (runtime.tempTileDataBusyFrames > 0) {
    runtime.tempTileDataBusyFrames -= 1;
    return true;
  }
  return false;
};

export const WonderLikeAddScrollIndicatorArrowPair = (
  runtime: FieldScreenEffectRuntime,
  scrollOffsetRef: { value: number }
): number => {
  const id = runtime.nextScrollArrowTaskId++;
  runtime.scrollArrowPairs.push({ id, scrollOffsetRef, removed: false });
  return id;
};

export const WonderLikeRemoveScrollIndicatorArrowPair = (
  runtime: FieldScreenEffectRuntime,
  id: number
): void => {
  const pair = runtime.scrollArrowPairs.find((entry) => entry.id === id);
  if (pair) pair.removed = true;
};

export const WonderLikeEnterStep = (runtime: FieldScreenEffectRuntime, state: number): number => {
  switch (state) {
    case 0:
      beginNormalPaletteFade(runtime, 0xffff, 0, 0, 16, 0);
      break;
    case 1:
      if (updatePaletteFade(runtime)) return 0;
      for (let bg = 0; bg < 4; bg += 1) runtime.bgYChanges.push({ bg, value: 0, op: 'set' });
      setGpuReg(runtime, REG_OFFSET_WIN0H, WIN_RANGE(0, DISPLAY_WIDTH));
      setGpuReg(runtime, REG_OFFSET_WIN0V, WIN_RANGE(26, 152));
      setGpuRegBits(runtime, REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON);
      break;
    default:
      return 1;
  }
  return 0;
};

export const WonderLikeExitStep = (
  runtime: FieldScreenEffectRuntime,
  state: number,
  useCancel: boolean
): number => {
  switch (state) {
    case 0:
      beginNormalPaletteFade(runtime, 0xffff, 0, 0, 16, 0);
      break;
    case 1:
      if (updatePaletteFade(runtime)) return 0;
      runtime.bgYChanges.push({ bg: 2, value: 0, op: 'set' });
      setGpuReg(runtime, REG_OFFSET_WIN0H, 0);
      setGpuReg(runtime, REG_OFFSET_WIN0V, 0);
      clearGpuRegBits(runtime, REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON);
      break;
    case 5:
      runtime.mysteryGiftTopMenuPrints.push({ giftIsFromEReader: runtime.giftIsFromEReader, useCancel });
      break;
    case 6:
      runtime.checkerboardDraws += 1;
      beginNormalPaletteFade(runtime, 0xffff, 0, 16, 0, 0);
      break;
    default:
      if (updatePaletteFade(runtime)) return 0;
      return 1;
  }
  return 0;
};
