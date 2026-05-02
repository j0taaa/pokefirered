import type { StorageLike } from './saveData';

export const CLEAR_SAVE_DATA_TEXT = {
  confirm: 'Clear all save data areas?',
  clearing: 'Clearing data...\nPlease wait.'
} as const;

export interface ClearSaveDataOperationResult {
  ok: boolean;
  summary: string;
}

export const clearSaveDataInStorage = (
  storage: StorageLike,
  key: string
): ClearSaveDataOperationResult => {
  if (typeof storage.removeItem === 'function') {
    storage.removeItem(key);
  } else {
    storage.setItem(key, '');
  }

  return {
    ok: true,
    summary: CLEAR_SAVE_DATA_TEXT.clearing
  };
};

export const MENU_B_PRESSED = -1;
export const MENU_NOTHING_CHOSEN = -2;
export const PALETTES_ALL = 0xffff;
export const RGB_BLACK = 0x0000;
export const RGB_WHITEALPHA = 0x7fff;

export interface ClearSaveDataStruct {
  unk0: number;
  unk1: number;
  unk2: number;
}

export interface ClearSaveDataTask {
  func: (runtime: ClearSaveDataScreenRuntime, taskId: number) => void;
}

export interface ClearSaveDataScreenRuntime {
  sClearSaveDataState: ClearSaveDataStruct | null;
  tasks: Map<number, ClearSaveDataTask>;
  nextTaskId: number;
  mainCallback2: ((runtime: ClearSaveDataScreenRuntime) => void) | null;
  vBlankCallback: ((runtime: ClearSaveDataScreenRuntime) => void) | null;
  paletteFade: { active: boolean };
  menuInputs: number[];
  log: string[];
  clearSaveData: () => void;
  softReset: () => void;
}

export const createClearSaveDataScreenRuntime = (
  overrides: Partial<Pick<ClearSaveDataScreenRuntime, 'clearSaveData' | 'softReset' | 'menuInputs'>> = {}
): ClearSaveDataScreenRuntime => ({
  sClearSaveDataState: null,
  tasks: new Map(),
  nextTaskId: 0,
  mainCallback2: null,
  vBlankCallback: null,
  paletteFade: { active: false },
  menuInputs: [...(overrides.menuInputs ?? [])],
  log: [],
  clearSaveData: overrides.clearSaveData ?? (() => undefined),
  softReset: overrides.softReset ?? (() => undefined)
});

const createTask = (
  runtime: ClearSaveDataScreenRuntime,
  func: (runtime: ClearSaveDataScreenRuntime, taskId: number) => void
): number => {
  const taskId = runtime.nextTaskId;
  runtime.nextTaskId += 1;
  runtime.tasks.set(taskId, { func });
  return taskId;
};

const destroyTask = (runtime: ClearSaveDataScreenRuntime, taskId: number): void => {
  runtime.tasks.delete(taskId);
};

const runTasks = (runtime: ClearSaveDataScreenRuntime): void => {
  for (const [taskId, task] of [...runtime.tasks]) {
    task.func(runtime, taskId);
  }
};

const beginNormalPaletteFade = (
  runtime: ClearSaveDataScreenRuntime,
  selectedPalettes: number,
  delay: number,
  startY: number,
  targetY: number,
  color: number
): void => {
  runtime.paletteFade.active = startY !== targetY;
  runtime.log.push(`BeginNormalPaletteFade:${selectedPalettes}:${delay}:${startY}:${targetY}:${color}`);
};

const setVBlankCallback = (
  runtime: ClearSaveDataScreenRuntime,
  callback: ((runtime: ClearSaveDataScreenRuntime) => void) | null
): void => {
  runtime.vBlankCallback = callback;
  runtime.log.push(callback ? 'SetVBlankCallback:VBlankCB_WaitYesNo' : 'SetVBlankCallback:NULL');
};

const setMainCallback2 = (
  runtime: ClearSaveDataScreenRuntime,
  callback: (runtime: ClearSaveDataScreenRuntime) => void
): void => {
  runtime.mainCallback2 = callback;
  runtime.log.push('SetMainCallback2:CB2_RunClearSaveDataScreen');
};

const menuProcessInputNoWrapClearOnChoose = (runtime: ClearSaveDataScreenRuntime): number =>
  runtime.menuInputs.length > 0 ? runtime.menuInputs.shift() ?? MENU_NOTHING_CHOSEN : MENU_NOTHING_CHOSEN;

export function CB2_RunClearSaveDataScreen(runtime: ClearSaveDataScreenRuntime): void {
  runTasks(runtime);
  runtime.log.push('AnimateSprites');
  runtime.log.push('BuildOamBuffer');
  runtime.log.push('UpdatePaletteFade');
}

export function VBlankCB_WaitYesNo(runtime: ClearSaveDataScreenRuntime): void {
  runtime.log.push('LoadOam');
  runtime.log.push('ProcessSpriteCopyRequests');
  runtime.log.push('TransferPlttBuffer');
}

export function CB2_SaveClearScreen_Init(runtime: ClearSaveDataScreenRuntime): void {
  runtime.sClearSaveDataState = { unk0: 0, unk1: 0, unk2: 0 };
  CB2_Sub_SaveClearScreen_Init(runtime);
  createTask(runtime, Task_DrawClearSaveDataScreen);
  setMainCallback2(runtime, CB2_RunClearSaveDataScreen);
}

export function Task_DrawClearSaveDataScreen(runtime: ClearSaveDataScreenRuntime, taskId: number): void {
  const state = runtime.sClearSaveDataState;
  if (!state) {
    return;
  }

  switch (state.unk1) {
    case 0:
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      break;
    case 1:
      if (runtime.paletteFade.active) {
        return;
      }
      setVBlankCallback(runtime, null);
      break;
    case 2:
      SaveClearScreen_GpuInit(runtime);
      break;
    case 3:
      runtime.log.push('LoadStdWindowGfx:0:1:15');
      runtime.log.push('LoadStdWindowGfx:1:1:15');
      break;
    case 4:
      runtime.log.push('DrawStdFrameWithCustomTileAndPalette:1:TRUE:1:15');
      runtime.log.push(`AddTextPrinterParameterized4:1:${CLEAR_SAVE_DATA_TEXT.confirm}`);
      runtime.log.push('CopyWindowToVram:1:COPYWIN_GFX');
      break;
    case 5:
      runtime.log.push('CreateYesNoMenu');
      runtime.log.push('CopyBgTilemapBufferToVram:0');
      break;
    default:
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 16, 0, RGB_WHITEALPHA);
      setVBlankCallback(runtime, VBlankCB_WaitYesNo);
      runtime.tasks.set(taskId, { func: Task_HandleYesNoMenu });
      break;
  }
  state.unk1 += 1;
}

export function Task_HandleYesNoMenu(runtime: ClearSaveDataScreenRuntime, taskId: number): void {
  const state = runtime.sClearSaveDataState;
  if (!state) {
    return;
  }

  if (state.unk0 === 0) {
    switch (menuProcessInputNoWrapClearOnChoose(runtime)) {
      case MENU_B_PRESSED:
      case 1:
        runtime.log.push('PlaySE:SE_SELECT');
        break;
      case 0:
        runtime.log.push('PlaySE:SE_SELECT');
        runtime.log.push('FillWindowPixelBuffer:1:PIXEL_FILL(1)');
        runtime.log.push(`AddTextPrinterParameterized4:1:${CLEAR_SAVE_DATA_TEXT.clearing}`);
        runtime.log.push('CopyWindowToVram:1:COPYWIN_FULL');
        runtime.clearSaveData();
        break;
      case MENU_NOTHING_CHOSEN:
      default:
        return;
    }
    state.unk0 += 1;
  } else {
    Task_CleanUpAndSoftReset(runtime, taskId);
  }
}

export function Task_CleanUpAndSoftReset(runtime: ClearSaveDataScreenRuntime, taskId: number): void {
  const state = runtime.sClearSaveDataState;
  if (!state) {
    return;
  }

  switch (state.unk2) {
    case 0:
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB_WHITEALPHA);
      state.unk2 += 1;
      break;
    case 1:
      if (!runtime.paletteFade.active) {
        runtime.log.push('DestroyYesNoMenu');
        destroyTask(runtime, taskId);
        runtime.log.push('FreeAllWindowBuffers');
        runtime.sClearSaveDataState = null;
        runtime.softReset();
      }
      break;
  }
}

export function CB2_Sub_SaveClearScreen_Init(runtime: ClearSaveDataScreenRuntime): void {
  runtime.log.push('ResetSpriteData');
  runtime.log.push('ResetPaletteFade');
  runtime.log.push('ResetTasks');
  runtime.tasks.clear();
}

export function SaveClearScreen_GpuInit(runtime: ClearSaveDataScreenRuntime): void {
  runtime.log.push('DmaClearLarge16:VRAM');
  runtime.log.push('DmaClear32:OAM');
  runtime.log.push('DmaClear16:PLTT');
  runtime.log.push('SetGpuReg:DISPCNT:0');
  runtime.log.push('SetGpuReg:BLDY:0');
  runtime.log.push('ResetBgsAndClearDma3BusyFlags:FALSE');
  runtime.log.push('InitBgsFromTemplates');
  runtime.log.push('ChangeBgX:0:0');
  runtime.log.push('ChangeBgY:0:0');
  runtime.log.push('ChangeBgX:1:0');
  runtime.log.push('ChangeBgY:1:0');
  runtime.log.push('ChangeBgX:2:0');
  runtime.log.push('ChangeBgY:2:0');
  runtime.log.push('ChangeBgX:3:0');
  runtime.log.push('ChangeBgY:3:0');
  runtime.log.push('InitWindows');
  runtime.log.push('DeactivateAllTextPrinters');
  runtime.log.push('SetGpuReg:DISPCNT:MODE_0|OBJ_1D_MAP|OBJ_ON');
  runtime.log.push('ShowBg:0');
}
