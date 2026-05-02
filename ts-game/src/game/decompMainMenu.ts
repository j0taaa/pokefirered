export const MAIN_MENU_NEWGAME = 0;
export const MAIN_MENU_CONTINUE = 1;
export const MAIN_MENU_MYSTERYGIFT = 2;

export const MAIN_MENU_WINDOW_NEWGAME_ONLY = 0;
export const MAIN_MENU_WINDOW_CONTINUE = 1;
export const MAIN_MENU_WINDOW_NEWGAME = 2;
export const MAIN_MENU_WINDOW_MYSTERYGIFT = 3;
export const MAIN_MENU_WINDOW_ERROR = 4;
export const MAIN_MENU_WINDOW_COUNT = 5;

export const SAVE_STATUS_EMPTY = 0;
export const SAVE_STATUS_OK = 1;
export const SAVE_STATUS_INVALID = 2;
export const SAVE_STATUS_ERROR = 3;
export const SAVE_STATUS_NO_FLASH = 4;

export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const DPAD_UP = 1 << 6;
export const DPAD_DOWN = 1 << 7;
export const FONT_NORMAL = 'FONT_NORMAL';
export const MALE = 0;
export const FEMALE = 1;
export const MAIN_MENU_C_TRANSLATION_UNIT = 'src/main_menu.c';
export const FLAG_SYS_POKEDEX_GET = 0x829;
export const FLAG_BADGE01_GET = 0x820;
export const FLAG_GET_CAUGHT = 0;
export const RGB_BLACK = 0;
export const PALETTES_ALL = 0xffffffff;
export const COPYWIN_GFX = 2;
export const COPYWIN_FULL = 3;
export const SE_SELECT = 'SE_SELECT';

const tMenuType = 0;
const tCursorPos = 1;
const tUnused8 = 8;
const tMGErrorMsgState = 9;
const tMGErrorType = 10;

export type MainMenuTaskFunc =
  | 'Task_SetWin0BldRegsAndCheckSaveFile'
  | 'Task_SaveErrorStatus_RunPrinterThenWaitButton'
  | 'Task_SetWin0BldRegsNoSaveFileCheck'
  | 'Task_WaitFadeAndPrintMainMenuText'
  | 'Task_PrintMainMenuText'
  | 'Task_WaitDma3AndFadeIn'
  | 'Task_UpdateVisualSelection'
  | 'Task_HandleMenuInput'
  | 'Task_ExecuteMainMenuSelection'
  | 'Task_MysteryGiftError'
  | 'Task_ReturnToTileScreen';

export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface MainMenuTask {
  func: MainMenuTaskFunc;
  data: number[];
  priority: number;
  destroyed: boolean;
}

export interface MainMenuRuntime {
  tasks: MainMenuTask[];
  operations: string[];
  gpuRegs: Map<string, number>;
  paletteFadeActive: boolean;
  saveFileStatus: number;
  mysteryGiftEnabled: boolean;
  wirelessAdapterConnected: boolean;
  textPrinterActive: Set<number>;
  waitDma3Result: number;
  newKeys: number;
  mainCallback2: string | null;
  vblankCallback: string | null;
  exitStairsMovementDisabled: boolean;
  helpSystemEnabled: boolean;
  flags: Set<number>;
  saveBlock2: {
    playerGender: number;
    playerName: string;
    playTimeHours: number;
    playTimeMinutes: number;
    optionsWindowFrameType: number;
  };
  nationalPokedexEnabled: boolean;
  nationalDexCount: number;
  kantoDexCount: number;
  plttBufferUnfaded0: number;
  plttBufferFaded0: number;
}

export const sWindowTemplate: WindowTemplate[] = [
  { bg: 0, tilemapLeft: 3, tilemapTop: 1, width: 24, height: 2, paletteNum: 15, baseBlock: 0x001 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 1, width: 24, height: 10, paletteNum: 15, baseBlock: 0x001 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 13, width: 24, height: 2, paletteNum: 15, baseBlock: 0x0f1 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 17, width: 24, height: 2, paletteNum: 15, baseBlock: 0x121 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 15, width: 24, height: 4, paletteNum: 15, baseBlock: 0x001 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 }
];

export const sMenuCursorYMax = [0, 1, 2] as const;
export const sTextColor1 = [10, 11, 12] as const;
export const sTextColor2 = [10, 1, 12] as const;

export const createMainMenuRuntime = (): MainMenuRuntime => ({
  tasks: [],
  operations: [],
  gpuRegs: new Map(),
  paletteFadeActive: false,
  saveFileStatus: SAVE_STATUS_EMPTY,
  mysteryGiftEnabled: false,
  wirelessAdapterConnected: true,
  textPrinterActive: new Set(),
  waitDma3Result: 0,
  newKeys: 0,
  mainCallback2: null,
  vblankCallback: null,
  exitStairsMovementDisabled: true,
  helpSystemEnabled: true,
  flags: new Set(),
  saveBlock2: {
    playerGender: MALE,
    playerName: 'PLAYER',
    playTimeHours: 0,
    playTimeMinutes: 0,
    optionsWindowFrameType: 0
  },
  nationalPokedexEnabled: false,
  nationalDexCount: 0,
  kantoDexCount: 0,
  plttBufferUnfaded0: 0,
  plttBufferFaded0: 0
});

const record = (runtime: MainMenuRuntime, op: string): void => {
  runtime.operations.push(op);
};
const joyNew = (runtime: MainMenuRuntime, mask: number): boolean => (runtime.newKeys & mask) !== 0;
const winRange = (left: number, right: number): number => ((left & 0xff) << 8) | (right & 0xff);
const rgb = (r: number, g: number, b: number): number => (r & 31) | ((g & 31) << 5) | ((b & 31) << 10);
const task = (runtime: MainMenuRuntime, taskId: number): MainMenuTask => runtime.tasks[taskId];

export const SetGpuReg = (runtime: MainMenuRuntime, reg: string, value: number): void => {
  runtime.gpuRegs.set(reg, value & 0xffff);
  record(runtime, `SetGpuReg:${reg}:${value & 0xffff}`);
};
export const BeginNormalPaletteFade = (runtime: MainMenuRuntime, mask: number, delay: number, start: number, end: number, color: number): void =>
  record(runtime, `BeginNormalPaletteFade:${mask}:${delay}:${start}:${end}:${color}`);
export const PlaySE = (runtime: MainMenuRuntime, song: string): void => record(runtime, `PlaySE:${song}`);
export const ShowBg = (runtime: MainMenuRuntime, bg: number): void => record(runtime, `ShowBg:${bg}`);
export const SetVBlankCallback = (runtime: MainMenuRuntime, callback: string | null): void => {
  runtime.vblankCallback = callback;
  record(runtime, `SetVBlankCallback:${callback ?? 'NULL'}`);
};
export const SetMainCallback2 = (runtime: MainMenuRuntime, callback: string): void => {
  runtime.mainCallback2 = callback;
  record(runtime, `SetMainCallback2:${callback}`);
};
export const CreateTask = (runtime: MainMenuRuntime, func: MainMenuTaskFunc, priority: number): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ func, data: Array(16).fill(0), priority, destroyed: false });
  record(runtime, `CreateTask:${func}:${priority}:${id}`);
  return id;
};
export const DestroyTask = (runtime: MainMenuRuntime, taskId: number): void => {
  task(runtime, taskId).destroyed = true;
  record(runtime, `DestroyTask:${taskId}`);
};

export const CB2_MainMenu = (runtime: MainMenuRuntime): void => {
  record(runtime, 'RunTasks');
  record(runtime, 'AnimateSprites');
  record(runtime, 'BuildOamBuffer');
  record(runtime, 'UpdatePaletteFade');
};

export const VBlankCB_MainMenu = (runtime: MainMenuRuntime): void => {
  record(runtime, 'LoadOam');
  record(runtime, 'ProcessSpriteCopyRequests');
  record(runtime, 'TransferPlttBuffer');
};

export const CB2_InitMainMenu = (runtime: MainMenuRuntime): void => {
  MainMenuGpuInit(runtime, 1);
};

export const CB2_InitMainMenu_2 = (runtime: MainMenuRuntime): void => {
  MainMenuGpuInit(runtime, 1);
};

export const MainMenuGpuInit = (runtime: MainMenuRuntime, a0: number): boolean => {
  SetVBlankCallback(runtime, null);
  ['DISPCNT', 'BG2CNT', 'BG1CNT', 'BG0CNT', 'BG2HOFS', 'BG2VOFS', 'BG1HOFS', 'BG1VOFS', 'BG0HOFS', 'BG0VOFS'].forEach((reg) => SetGpuReg(runtime, reg, 0));
  record(runtime, 'DmaFill16:VRAM');
  record(runtime, 'DmaFill32:OAM');
  record(runtime, 'DmaFill16:PLTT+2');
  record(runtime, 'ScanlineEffect_Stop');
  record(runtime, 'ResetTasks');
  runtime.tasks = [];
  record(runtime, 'ResetSpriteData');
  record(runtime, 'FreeAllSpritePalettes');
  record(runtime, 'ResetPaletteFade');
  record(runtime, 'ResetBgsAndClearDma3BusyFlags:false');
  record(runtime, 'InitBgsFromTemplates:0:1');
  for (let bg = 0; bg < 3; bg += 1) {
    record(runtime, `ChangeBgX:${bg}:0:0`);
    record(runtime, `ChangeBgY:${bg}:0:0`);
  }
  record(runtime, 'InitWindows:sWindowTemplate');
  record(runtime, 'DeactivateAllTextPrinters');
  record(runtime, 'LoadPalette:sBg_Pal:0');
  record(runtime, 'LoadPalette:sTextbox_Pal:15');
  ['WIN0H', 'WIN0V', 'WININ', 'WINOUT', 'BLDCNT', 'BLDALPHA', 'BLDY'].forEach((reg) => SetGpuReg(runtime, reg, 0));
  SetMainCallback2(runtime, 'CB2_MainMenu');
  SetGpuReg(runtime, 'DISPCNT', 0x5000);
  const taskId = CreateTask(runtime, 'Task_SetWin0BldRegsAndCheckSaveFile', 0);
  task(runtime, taskId).data[tCursorPos] = 0;
  task(runtime, taskId).data[tUnused8] = a0;
  return false;
};

export const Task_SetWin0BldRegsAndCheckSaveFile = (runtime: MainMenuRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) {
    setWin0BlendRegs(runtime);
    switch (runtime.saveFileStatus) {
      case SAVE_STATUS_OK:
        LoadUserFrameToBg(runtime, 0);
        task(runtime, taskId).data[tMenuType] = runtime.mysteryGiftEnabled ? MAIN_MENU_MYSTERYGIFT : MAIN_MENU_CONTINUE;
        task(runtime, taskId).func = 'Task_SetWin0BldRegsNoSaveFileCheck';
        break;
      case SAVE_STATUS_INVALID:
        SetStdFrame0OnBg(runtime, 0);
        task(runtime, taskId).data[tMenuType] = MAIN_MENU_NEWGAME;
        PrintSaveErrorStatus(runtime, taskId, 'The save file has been deleted.');
        break;
      case SAVE_STATUS_ERROR:
        SetStdFrame0OnBg(runtime, 0);
        task(runtime, taskId).data[tMenuType] = MAIN_MENU_CONTINUE;
        PrintSaveErrorStatus(runtime, taskId, 'The save file is corrupted.');
        task(runtime, taskId).data[tMenuType] = runtime.mysteryGiftEnabled ? MAIN_MENU_MYSTERYGIFT : MAIN_MENU_CONTINUE;
        break;
      case SAVE_STATUS_NO_FLASH:
        SetStdFrame0OnBg(runtime, 0);
        task(runtime, taskId).data[tMenuType] = MAIN_MENU_NEWGAME;
        PrintSaveErrorStatus(runtime, taskId, 'The 1M sub-circuit board is not installed.');
        break;
      case SAVE_STATUS_EMPTY:
      default:
        LoadUserFrameToBg(runtime, 0);
        task(runtime, taskId).data[tMenuType] = MAIN_MENU_NEWGAME;
        task(runtime, taskId).func = 'Task_SetWin0BldRegsNoSaveFileCheck';
        break;
    }
  }
};

const setWin0BlendRegs = (runtime: MainMenuRuntime): void => {
  SetGpuReg(runtime, 'WIN0H', 0);
  SetGpuReg(runtime, 'WIN0V', 0);
  SetGpuReg(runtime, 'WININ', 0x0001);
  SetGpuReg(runtime, 'WINOUT', 0x0021);
  SetGpuReg(runtime, 'BLDCNT', 0x00ff);
  SetGpuReg(runtime, 'BLDALPHA', 0);
  SetGpuReg(runtime, 'BLDY', 7);
};

export const PrintSaveErrorStatus = (runtime: MainMenuRuntime, taskId: number, str: string): void => {
  PrintMessageOnWindow4(runtime, str);
  task(runtime, taskId).func = 'Task_SaveErrorStatus_RunPrinterThenWaitButton';
  BeginNormalPaletteFade(runtime, PALETTES_ALL, 0, 16, 0, 0xffff);
  ShowBg(runtime, 0);
  SetVBlankCallback(runtime, 'VBlankCB_MainMenu');
};

export const Task_SaveErrorStatus_RunPrinterThenWaitButton = (runtime: MainMenuRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) {
    record(runtime, 'RunTextPrinters');
    if (!runtime.textPrinterActive.has(MAIN_MENU_WINDOW_ERROR) && joyNew(runtime, A_BUTTON)) {
      record(runtime, `ClearWindowTilemap:${MAIN_MENU_WINDOW_ERROR}`);
      MainMenu_EraseWindow(runtime, sWindowTemplate[MAIN_MENU_WINDOW_ERROR]);
      LoadUserFrameToBg(runtime, 0);
      task(runtime, taskId).func = task(runtime, taskId).data[tMenuType] === MAIN_MENU_NEWGAME
        ? 'Task_SetWin0BldRegsNoSaveFileCheck'
        : 'Task_PrintMainMenuText';
    }
  }
};

export const Task_SetWin0BldRegsNoSaveFileCheck = (runtime: MainMenuRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) {
    setWin0BlendRegs(runtime);
    task(runtime, taskId).func = task(runtime, taskId).data[tMenuType] === MAIN_MENU_NEWGAME
      ? 'Task_ExecuteMainMenuSelection'
      : 'Task_WaitFadeAndPrintMainMenuText';
  }
};

export const Task_WaitFadeAndPrintMainMenuText = (runtime: MainMenuRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) Task_PrintMainMenuText(runtime, taskId);
};

export const Task_PrintMainMenuText = (runtime: MainMenuRuntime, taskId: number): void => {
  setWin0BlendRegs(runtime);
  const pal = runtime.saveBlock2.playerGender === MALE ? rgb(4, 16, 31) : rgb(31, 3, 21);
  record(runtime, `LoadPalette:playerGender:${pal}`);
  switch (task(runtime, taskId).data[tMenuType]) {
    case MAIN_MENU_NEWGAME:
    default:
      fillAndPrint(runtime, MAIN_MENU_WINDOW_NEWGAME_ONLY, 'NEW GAME');
      MainMenu_DrawWindow(runtime, sWindowTemplate[MAIN_MENU_WINDOW_NEWGAME_ONLY]);
      putAndCopy(runtime, MAIN_MENU_WINDOW_NEWGAME_ONLY, COPYWIN_FULL);
      break;
    case MAIN_MENU_CONTINUE:
      fillAndPrint(runtime, MAIN_MENU_WINDOW_CONTINUE, 'CONTINUE');
      fillAndPrint(runtime, MAIN_MENU_WINDOW_NEWGAME, 'NEW GAME');
      PrintContinueStats(runtime);
      MainMenu_DrawWindow(runtime, sWindowTemplate[MAIN_MENU_WINDOW_CONTINUE]);
      MainMenu_DrawWindow(runtime, sWindowTemplate[MAIN_MENU_WINDOW_NEWGAME]);
      record(runtime, `PutWindowTilemap:${MAIN_MENU_WINDOW_CONTINUE}`);
      record(runtime, `PutWindowTilemap:${MAIN_MENU_WINDOW_NEWGAME}`);
      record(runtime, `CopyWindowToVram:${MAIN_MENU_WINDOW_CONTINUE}:${COPYWIN_GFX}`);
      record(runtime, `CopyWindowToVram:${MAIN_MENU_WINDOW_NEWGAME}:${COPYWIN_FULL}`);
      break;
    case MAIN_MENU_MYSTERYGIFT:
      fillAndPrint(runtime, MAIN_MENU_WINDOW_CONTINUE, 'CONTINUE');
      fillAndPrint(runtime, MAIN_MENU_WINDOW_NEWGAME, 'NEW GAME');
      record(runtime, `FillWindowPixelBuffer:${MAIN_MENU_WINDOW_MYSTERYGIFT}:10`);
      task(runtime, taskId).data[tMGErrorType] = 1;
      record(runtime, `AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_MYSTERYGIFT}:${FONT_NORMAL}:2:2:${sTextColor1.join(',')}:-1:MYSTERY GIFT`);
      PrintContinueStats(runtime);
      [MAIN_MENU_WINDOW_CONTINUE, MAIN_MENU_WINDOW_NEWGAME, MAIN_MENU_WINDOW_MYSTERYGIFT].forEach((win) => MainMenu_DrawWindow(runtime, sWindowTemplate[win]));
      [MAIN_MENU_WINDOW_CONTINUE, MAIN_MENU_WINDOW_NEWGAME, MAIN_MENU_WINDOW_MYSTERYGIFT].forEach((win) => record(runtime, `PutWindowTilemap:${win}`));
      record(runtime, `CopyWindowToVram:${MAIN_MENU_WINDOW_CONTINUE}:${COPYWIN_GFX}`);
      record(runtime, `CopyWindowToVram:${MAIN_MENU_WINDOW_NEWGAME}:${COPYWIN_GFX}`);
      record(runtime, `CopyWindowToVram:${MAIN_MENU_WINDOW_MYSTERYGIFT}:${COPYWIN_FULL}`);
      break;
  }
  task(runtime, taskId).func = 'Task_WaitDma3AndFadeIn';
};

const fillAndPrint = (runtime: MainMenuRuntime, windowId: number, text: string): void => {
  record(runtime, `FillWindowPixelBuffer:${windowId}:10`);
  record(runtime, `AddTextPrinterParameterized3:${windowId}:${FONT_NORMAL}:2:2:${sTextColor1.join(',')}:-1:${text}`);
};

const putAndCopy = (runtime: MainMenuRuntime, windowId: number, mode: number): void => {
  record(runtime, `PutWindowTilemap:${windowId}`);
  record(runtime, `CopyWindowToVram:${windowId}:${mode}`);
};

export const Task_WaitDma3AndFadeIn = (runtime: MainMenuRuntime, taskId: number): void => {
  if (runtime.waitDma3Result !== -1) {
    task(runtime, taskId).func = 'Task_UpdateVisualSelection';
    BeginNormalPaletteFade(runtime, PALETTES_ALL, 0, 16, 0, 0xffff);
    ShowBg(runtime, 0);
    SetVBlankCallback(runtime, 'VBlankCB_MainMenu');
  }
};

export const Task_UpdateVisualSelection = (runtime: MainMenuRuntime, taskId: number): void => {
  MoveWindowByMenuTypeAndCursorPos(runtime, task(runtime, taskId).data[tMenuType], task(runtime, taskId).data[tCursorPos]);
  task(runtime, taskId).func = 'Task_HandleMenuInput';
};

export const Task_HandleMenuInput = (runtime: MainMenuRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive && HandleMenuInput(runtime, taskId)) {
    task(runtime, taskId).func = 'Task_UpdateVisualSelection';
  }
};

export const Task_ExecuteMainMenuSelection = (runtime: MainMenuRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) {
    let menuAction = MAIN_MENU_NEWGAME;
    switch (task(runtime, taskId).data[tMenuType]) {
      case MAIN_MENU_CONTINUE:
        menuAction = task(runtime, taskId).data[tCursorPos] === 1 ? MAIN_MENU_NEWGAME : MAIN_MENU_CONTINUE;
        break;
      case MAIN_MENU_MYSTERYGIFT:
        switch (task(runtime, taskId).data[tCursorPos]) {
          case 1:
            menuAction = MAIN_MENU_NEWGAME;
            break;
          case 2:
            if (!IsWirelessAdapterConnected(runtime)) {
              SetStdFrame0OnBg(runtime, 0);
              task(runtime, taskId).func = 'Task_MysteryGiftError';
              BeginNormalPaletteFade(runtime, PALETTES_ALL, 0, 16, 0, RGB_BLACK);
              return;
            }
            menuAction = MAIN_MENU_MYSTERYGIFT;
            break;
          case 0:
          default:
            menuAction = MAIN_MENU_CONTINUE;
            break;
        }
        break;
      case MAIN_MENU_NEWGAME:
      default:
        menuAction = MAIN_MENU_NEWGAME;
        break;
    }
    switch (menuAction) {
      case MAIN_MENU_CONTINUE:
        runtime.plttBufferUnfaded0 = RGB_BLACK;
        runtime.plttBufferFaded0 = RGB_BLACK;
        runtime.exitStairsMovementDisabled = false;
        record(runtime, 'FreeAllWindowBuffers');
        record(runtime, `TryStartQuestLogPlayback:${taskId}`);
        break;
      case MAIN_MENU_MYSTERYGIFT:
        SetMainCallback2(runtime, 'CB2_InitMysteryGift');
        runtime.helpSystemEnabled = false;
        record(runtime, 'HelpSystem_Disable');
        record(runtime, 'FreeAllWindowBuffers');
        DestroyTask(runtime, taskId);
        break;
      case MAIN_MENU_NEWGAME:
      default:
        runtime.exitStairsMovementDisabled = false;
        record(runtime, 'FreeAllWindowBuffers');
        DestroyTask(runtime, taskId);
        record(runtime, 'StartNewGameScene');
        break;
    }
  }
};

export const Task_MysteryGiftError = (runtime: MainMenuRuntime, taskId: number): void => {
  switch (task(runtime, taskId).data[tMGErrorMsgState]) {
    case 0:
      record(runtime, 'FillBgTilemapBufferRect_Palette0:0:0:0:0:30:20');
      PrintMessageOnWindow4(runtime, task(runtime, taskId).data[tMGErrorType] === 1 ? 'The Wireless Adapter is not connected.' : 'Mystery Gift cannot be used.');
      task(runtime, taskId).data[tMGErrorMsgState] += 1;
      break;
    case 1:
      if (!runtime.paletteFadeActive) task(runtime, taskId).data[tMGErrorMsgState] += 1;
      break;
    case 2:
      record(runtime, 'RunTextPrinters');
      if (!runtime.textPrinterActive.has(MAIN_MENU_WINDOW_ERROR)) task(runtime, taskId).data[tMGErrorMsgState] += 1;
      break;
    case 3:
      if (joyNew(runtime, A_BUTTON | B_BUTTON)) {
        PlaySE(runtime, SE_SELECT);
        BeginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB_BLACK);
        task(runtime, taskId).func = 'Task_ReturnToTileScreen';
      }
      break;
  }
};

export const Task_ReturnToTileScreen = (runtime: MainMenuRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) {
    SetMainCallback2(runtime, 'CB2_InitTitleScreen');
    DestroyTask(runtime, taskId);
  }
};

export const MoveWindowByMenuTypeAndCursorPos = (runtime: MainMenuRuntime, menuType: number, cursorPos: number): void => {
  let win0vTop: number;
  let win0vBot: number;
  SetGpuReg(runtime, 'WIN0H', winRange(18, 222));
  switch (menuType) {
    case MAIN_MENU_CONTINUE:
    case MAIN_MENU_MYSTERYGIFT:
      switch (cursorPos) {
        case 1:
          win0vTop = 0x60 << 8;
          win0vBot = 0x80;
          break;
        case 2:
          win0vTop = 0x80 << 8;
          win0vBot = 0xa0;
          break;
        case 0:
        default:
          win0vTop = 0x00 << 8;
          win0vBot = 0x60;
          break;
      }
      break;
    case MAIN_MENU_NEWGAME:
    default:
      win0vTop = 0x00 << 8;
      win0vBot = 0x20;
      break;
  }
  SetGpuReg(runtime, 'WIN0V', (win0vTop + (2 << 8)) | (win0vBot - 2));
};

export const HandleMenuInput = (runtime: MainMenuRuntime, taskId: number): boolean => {
  if (joyNew(runtime, A_BUTTON)) {
    PlaySE(runtime, SE_SELECT);
    IsWirelessAdapterConnected(runtime);
    BeginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB_BLACK);
    task(runtime, taskId).func = 'Task_ExecuteMainMenuSelection';
  } else if (joyNew(runtime, B_BUTTON)) {
    PlaySE(runtime, SE_SELECT);
    BeginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB_BLACK);
    SetGpuReg(runtime, 'WIN0H', winRange(0, 240));
    SetGpuReg(runtime, 'WIN0V', winRange(0, 160));
    task(runtime, taskId).func = 'Task_ReturnToTileScreen';
  } else if (joyNew(runtime, DPAD_UP) && task(runtime, taskId).data[tCursorPos] > 0) {
    task(runtime, taskId).data[tCursorPos] -= 1;
    return true;
  } else if (joyNew(runtime, DPAD_DOWN) && task(runtime, taskId).data[tCursorPos] < sMenuCursorYMax[task(runtime, taskId).data[tMenuType]]) {
    task(runtime, taskId).data[tCursorPos] += 1;
    return true;
  }
  return false;
};

export const PrintMessageOnWindow4 = (runtime: MainMenuRuntime, str: string): void => {
  record(runtime, `FillWindowPixelBuffer:${MAIN_MENU_WINDOW_ERROR}:10`);
  MainMenu_DrawWindow(runtime, sWindowTemplate[MAIN_MENU_WINDOW_ERROR]);
  record(runtime, `AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_ERROR}:${FONT_NORMAL}:0:2:${sTextColor1.join(',')}:2:${str}`);
  record(runtime, `PutWindowTilemap:${MAIN_MENU_WINDOW_ERROR}`);
  record(runtime, `CopyWindowToVram:${MAIN_MENU_WINDOW_ERROR}:${COPYWIN_GFX}`);
  SetGpuReg(runtime, 'WIN0H', winRange(19, 221));
  SetGpuReg(runtime, 'WIN0V', winRange(115, 157));
};

export const PrintContinueStats = (runtime: MainMenuRuntime): void => {
  PrintPlayerName(runtime);
  PrintDexCount(runtime);
  PrintPlayTime(runtime);
  PrintBadgeCount(runtime);
};

export const PrintPlayerName = (runtime: MainMenuRuntime): void => {
  record(runtime, `AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:${FONT_NORMAL}:2:18:${sTextColor2.join(',')}:-1:PLAYER`);
  record(runtime, `AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:${FONT_NORMAL}:62:18:${sTextColor2.join(',')}:-1:${runtime.saveBlock2.playerName.slice(0, 7)}`);
};

export const PrintPlayTime = (runtime: MainMenuRuntime): void => {
  record(runtime, `AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:${FONT_NORMAL}:2:34:${sTextColor2.join(',')}:-1:TIME`);
  const time = `${runtime.saveBlock2.playTimeHours}:${String(runtime.saveBlock2.playTimeMinutes).padStart(2, '0')}`;
  record(runtime, `AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:${FONT_NORMAL}:62:34:${sTextColor2.join(',')}:-1:${time}`);
};

export const PrintDexCount = (runtime: MainMenuRuntime): void => {
  if (runtime.flags.has(FLAG_SYS_POKEDEX_GET)) {
    const dexcount = runtime.nationalPokedexEnabled ? runtime.nationalDexCount : runtime.kantoDexCount;
    record(runtime, `AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:${FONT_NORMAL}:2:50:${sTextColor2.join(',')}:-1:POKéDEX`);
    record(runtime, `AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:${FONT_NORMAL}:62:50:${sTextColor2.join(',')}:-1:${dexcount}`);
  }
};

export const PrintBadgeCount = (runtime: MainMenuRuntime): void => {
  let nbadges = 0;
  for (let flagId = FLAG_BADGE01_GET; flagId < FLAG_BADGE01_GET + 8; flagId += 1) {
    if (runtime.flags.has(flagId)) nbadges += 1;
  }
  record(runtime, `AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:${FONT_NORMAL}:2:66:${sTextColor2.join(',')}:-1:BADGES`);
  record(runtime, `AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:${FONT_NORMAL}:62:66:${sTextColor2.join(',')}:-1:${nbadges}`);
};

export const LoadUserFrameToBg = (runtime: MainMenuRuntime, bgId: number): void => {
  record(runtime, `LoadBgTiles:${bgId}:userFrame:${runtime.saveBlock2.optionsWindowFrameType}:0x120:0x1B1`);
  record(runtime, `LoadPalette:userFrame:${runtime.saveBlock2.optionsWindowFrameType}:2`);
  MainMenu_EraseWindow(runtime, sWindowTemplate[MAIN_MENU_WINDOW_ERROR]);
};

export const SetStdFrame0OnBg = (runtime: MainMenuRuntime, bgId: number): void => {
  record(runtime, `LoadStdWindowGfx:${MAIN_MENU_WINDOW_NEWGAME_ONLY}:0x1B1:2:bg${bgId}`);
  MainMenu_EraseWindow(runtime, sWindowTemplate[MAIN_MENU_WINDOW_ERROR]);
};

export const MainMenu_DrawWindow = (runtime: MainMenuRuntime, windowTemplate: WindowTemplate): void => {
  const t = windowTemplate;
  fillBg(runtime, t.bg, 0x1b1, t.tilemapLeft - 1, t.tilemapTop - 1, 1, 1, 2);
  fillBg(runtime, t.bg, 0x1b2, t.tilemapLeft, t.tilemapTop - 1, t.width, t.height, 2);
  fillBg(runtime, t.bg, 0x1b3, t.tilemapLeft + t.width, t.tilemapTop - 1, 1, 1, 2);
  fillBg(runtime, t.bg, 0x1b4, t.tilemapLeft - 1, t.tilemapTop, 1, t.height, 2);
  fillBg(runtime, t.bg, 0x1b6, t.tilemapLeft + t.width, t.tilemapTop, 1, t.height, 2);
  fillBg(runtime, t.bg, 0x1b7, t.tilemapLeft - 1, t.tilemapTop + t.height, 1, 1, 2);
  fillBg(runtime, t.bg, 0x1b8, t.tilemapLeft, t.tilemapTop + t.height, t.width, 1, 2);
  fillBg(runtime, t.bg, 0x1b9, t.tilemapLeft + t.width, t.tilemapTop + t.height, 1, 1, 2);
  record(runtime, `CopyBgTilemapBufferToVram:${t.bg}`);
};

export const MainMenu_EraseWindow = (runtime: MainMenuRuntime, windowTemplate: WindowTemplate): void => {
  const t = windowTemplate;
  fillBg(runtime, t.bg, 0x000, t.tilemapLeft - 1, t.tilemapTop - 1, t.tilemapLeft + t.width + 1, t.tilemapTop + t.height + 1, 2);
  record(runtime, `CopyBgTilemapBufferToVram:${t.bg}`);
};

const fillBg = (runtime: MainMenuRuntime, bg: number, tile: number, left: number, top: number, width: number, height: number, palette: number): void =>
  record(runtime, `FillBgTilemapBufferRect:${bg}:${tile}:${left}:${top}:${width}:${height}:${palette}`);

export const IsWirelessAdapterConnected = (runtime: MainMenuRuntime): boolean => {
  record(runtime, 'IsWirelessAdapterConnected');
  return runtime.wirelessAdapterConnected;
};
