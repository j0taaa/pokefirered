export const WIN_TEXT = 0;
export const WIN_COUNT = 1;
export const BG_TEXT = 0;
export const BG_DIPLOMA = 1;
export const FANFARE_OBTAIN_BADGE = 'FANFARE_OBTAIN_BADGE';
export const CB2_DIPLOMA = 'CB2_Diploma';
export const CB2_RETURN_TO_FIELD_FROM_DIPLOMA = 'CB2_ReturnToFieldFromDiploma';
export const VBLANK_CB_DIPLOMA = 'VBlankCB_Diploma';

export interface DiplomaState {
  mainState: number;
  gfxState: number;
  initState: number;
  tilemapBuffer: number[];
}

export interface DiplomaTask {
  func: 'Task_DiplomaInit' | 'Task_HandleDiplomaInput' | 'Task_DiplomaExit';
  priority: number;
  destroyed: boolean;
}

export interface DiplomaTextPrint {
  windowId: number;
  font: 'FONT_NORMAL';
  x: number;
  y: number;
  colors: readonly [number, number, number];
  speed: number;
  text: string;
}

export interface DiplomaRuntime {
  diploma: DiplomaState | null;
  tasks: DiplomaTask[];
  callbacks: {
    main: string | null;
    vblank: string | null;
  };
  gpuRegs: Record<string, number>;
  bgX: Record<number, number>;
  bgY: Record<number, number>;
  shownBgs: number[];
  windowTemplates: Array<{
    bg: number;
    tilemapLeft: number;
    tilemapTop: number;
    width: number;
    height: number;
    paletteNum: number;
    baseBlock: number;
  }>;
  tilemapCopies: Array<{ bg: number; source: string; a: number; b: number }>;
  bgCopies: number[];
  bgFills: Array<{ bg: number; value: number; left: number; top: number; width: number; height: number }>;
  tileDataOps: string[];
  paletteLoads: Array<{ source: string; paletteId: number; size: number }>;
  textPrints: DiplomaTextPrint[];
  windowFills: Array<{ windowId: number; value: number }>;
  windowTilemaps: number[];
  resetLog: string[];
  fanfares: string[];
  paletteFadeActive: boolean;
  tempTileDataBusy: boolean;
  hasAllMons: boolean;
  playerName: string;
  freedWindowBuffers: boolean;
}

export const sTextColors = [0, 2, 3] as const;
export const gTextDiplomaNational = 'NATIONAL';
export const gTextDiplomaKanto = 'KANTO';
export const gTextDiplomaGameFreak = 'GAME FREAK';
export const gTextDiplomaPlayer = 'PLAYER: {DYNAMIC 0x00}';
export const gTextDiplomaThisDocument = 'This document is issued in\nrecognition of your magnificent\nachievement - the completion of\nthe {DYNAMIC 0x01} POKeDEX.';

export const createDiplomaRuntime = (): DiplomaRuntime => ({
  diploma: null,
  tasks: [],
  callbacks: {
    main: null,
    vblank: null
  },
  gpuRegs: {},
  bgX: {},
  bgY: {},
  shownBgs: [],
  windowTemplates: [],
  tilemapCopies: [],
  bgCopies: [],
  bgFills: [],
  tileDataOps: [],
  paletteLoads: [],
  textPrints: [],
  windowFills: [],
  windowTilemaps: [],
  resetLog: [],
  fanfares: [],
  paletteFadeActive: false,
  tempTileDataBusy: false,
  hasAllMons: false,
  playerName: 'PLAYER',
  freedWindowBuffers: false
});

const createDiplomaState = (): DiplomaState => ({
  mainState: 0,
  gfxState: 0,
  initState: 0,
  tilemapBuffer: Array.from({ length: 0x800 }, () => 0)
});

const setMainCallback2 = (runtime: DiplomaRuntime, callback: string): void => {
  runtime.callbacks.main = callback;
};

const setVBlankCallback = (runtime: DiplomaRuntime, callback: string | null): void => {
  runtime.callbacks.vblank = callback;
};

const createTask = (runtime: DiplomaRuntime, func: DiplomaTask['func'], priority: number): number => {
  runtime.tasks.push({ func, priority, destroyed: false });
  return runtime.tasks.length - 1;
};

export const cb2ShowDiploma = (runtime: DiplomaRuntime): void => {
  runtime.diploma = createDiplomaState();
  diplomaReset(runtime);
  createTask(runtime, 'Task_DiplomaInit', 0);
  setMainCallback2(runtime, CB2_DIPLOMA);
};

export const cb2Diploma = (runtime: DiplomaRuntime): void => {
  runtime.resetLog.push('RunTasks');
  runtime.resetLog.push('AnimateSprites');
  runtime.resetLog.push('BuildOamBuffer');
  runtime.resetLog.push('UpdatePaletteFade');
};

export const vblankCbDiploma = (runtime: DiplomaRuntime): void => {
  runtime.resetLog.push('LoadOam');
  runtime.resetLog.push('ProcessSpriteCopyRequests');
  runtime.resetLog.push('TransferPlttBuffer');
};

export const taskDiplomaInit = (runtime: DiplomaRuntime, taskId: number): void => {
  const diploma = runtime.diploma;
  const task = runtime.tasks[taskId];
  if (!diploma || !task || task.destroyed) {
    return;
  }
  switch (diploma.initState) {
    case 0:
      setVBlankCallback(runtime, null);
      break;
    case 1:
      diplomaInitScreen(runtime);
      break;
    case 2:
      if (!diplomaLoadGfx(runtime)) {
        return;
      }
      break;
    case 3:
      runtime.tilemapCopies.push({ bg: BG_DIPLOMA, source: 'sDiplomaTilemap', a: 0, b: 0 });
      break;
    case 4:
      runtime.gpuRegs.BG1HOFS = runtime.hasAllMons ? 0x100 : 0;
      break;
    case 5:
      diplomaPrintText(runtime);
      break;
    case 6:
      runtime.bgCopies.push(BG_TEXT, BG_DIPLOMA);
      break;
    case 7:
      runtime.paletteFadeActive = true;
      break;
    case 8:
      setVBlankCallback(runtime, VBLANK_CB_DIPLOMA);
      break;
    default:
      if (runtime.paletteFadeActive) {
        return;
      }
      runtime.fanfares.push(FANFARE_OBTAIN_BADGE);
      task.func = 'Task_HandleDiplomaInput';
      break;
  }
  diploma.initState += 1;
};

export const taskHandleDiplomaInput = (
  runtime: DiplomaRuntime,
  taskId: number,
  input: { aButtonNew?: boolean; fanfareDone?: boolean } = {}
): void => {
  const diploma = runtime.diploma;
  const task = runtime.tasks[taskId];
  if (!diploma || !task || task.destroyed) {
    return;
  }
  switch (diploma.mainState) {
    case 0:
      if (input.fanfareDone) {
        diploma.mainState += 1;
      }
      break;
    case 1:
      if (input.aButtonNew) {
        runtime.paletteFadeActive = true;
        diploma.mainState += 1;
      }
      break;
    case 2:
      taskDiplomaExit(runtime, taskId);
      break;
  }
};

export const taskDiplomaExit = (runtime: DiplomaRuntime, taskId: number): void => {
  if (runtime.paletteFadeActive) {
    return;
  }
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
  }
  runtime.freedWindowBuffers = true;
  runtime.diploma = null;
  setMainCallback2(runtime, CB2_RETURN_TO_FIELD_FROM_DIPLOMA);
};

export const diplomaReset = (runtime: DiplomaRuntime): void => {
  runtime.resetLog.push('ResetSpriteData');
  runtime.resetLog.push('ResetPaletteFade');
  runtime.resetLog.push('FreeAllSpritePalettes');
  runtime.tasks = [];
  runtime.resetLog.push('ResetTasks');
  runtime.resetLog.push('ScanlineEffect_Stop');
};

export const diplomaInitScreen = (runtime: DiplomaRuntime): void => {
  runtime.resetLog.push('DmaClearLarge16:VRAM');
  runtime.resetLog.push('DmaClear32:OAM');
  runtime.resetLog.push('DmaClear16:PLTT');
  runtime.gpuRegs.DISPCNT = 0;
  runtime.resetLog.push('ResetBgsAndClearDma3BusyFlags');
  runtime.bgX[0] = 0;
  runtime.bgY[0] = 0;
  runtime.bgX[1] = 0;
  runtime.bgY[1] = 0;
  runtime.bgX[2] = 0;
  runtime.bgY[2] = 0;
  runtime.bgX[3] = 0;
  runtime.bgY[3] = 0;
  runtime.windowTemplates = [{
    bg: BG_TEXT,
    tilemapLeft: 0,
    tilemapTop: 2,
    width: 29,
    height: 16,
    paletteNum: 15,
    baseBlock: 0
  }];
  runtime.resetLog.push('DeactivateAllTextPrinters');
  runtime.gpuRegs.DISPCNT = 0x1000;
  runtime.resetLog.push('SetBgTilemapBuffer:BG_DIPLOMA');
  runtime.shownBgs.push(BG_TEXT, BG_DIPLOMA);
  runtime.bgFills.push({ bg: BG_TEXT, value: 0, left: 0, top: 0, width: 30, height: 20 });
  runtime.bgFills.push({ bg: BG_DIPLOMA, value: 0, left: 0, top: 0, width: 30, height: 20 });
};

export const diplomaLoadGfx = (runtime: DiplomaRuntime): boolean => {
  const diploma = runtime.diploma;
  if (!diploma) {
    return false;
  }
  switch (diploma.gfxState) {
    case 0:
      runtime.tileDataOps.push('ResetTempTileDataBuffers');
      break;
    case 1:
      runtime.tileDataOps.push('DecompressAndCopyTileDataToVram:BG_DIPLOMA:sDiplomaGfx');
      break;
    case 2:
      if (runtime.tempTileDataBusy) {
        return false;
      }
      break;
    case 3:
      runtime.paletteLoads.push({ source: 'sDiplomaPal', paletteId: 0, size: 16 });
      return true;
    default:
      return true;
  }
  diploma.gfxState += 1;
  return false;
};

const expandDiplomaText = (runtime: DiplomaRuntime, text: string): string =>
  text
    .replace('{DYNAMIC 0x00}', runtime.playerName)
    .replace('{DYNAMIC 0x01}', runtime.hasAllMons ? gTextDiplomaNational : gTextDiplomaKanto);

const getStringWidth = (text: string): number => text.length * 6;

export const diplomaPrintText = (runtime: DiplomaRuntime): void => {
  runtime.windowFills.push({ windowId: WIN_TEXT, value: 0 });
  const playerText = expandDiplomaText(runtime, gTextDiplomaPlayer);
  let width = getStringWidth(playerText);
  runtime.textPrints.push({
    windowId: WIN_TEXT,
    font: 'FONT_NORMAL',
    x: 120 - Math.trunc(width / 2),
    y: 4,
    colors: sTextColors,
    speed: 0xff,
    text: playerText
  });
  const documentText = expandDiplomaText(runtime, gTextDiplomaThisDocument);
  width = getStringWidth(documentText);
  runtime.textPrints.push({
    windowId: WIN_TEXT,
    font: 'FONT_NORMAL',
    x: 120 - Math.trunc(width / 2),
    y: 30,
    colors: sTextColors,
    speed: 0xff,
    text: documentText
  });
  runtime.textPrints.push({
    windowId: WIN_TEXT,
    font: 'FONT_NORMAL',
    x: 120,
    y: 105,
    colors: sTextColors,
    speed: 0,
    text: gTextDiplomaGameFreak
  });
  runtime.windowTilemaps.push(WIN_TEXT);
};

export function VBlankCB_Diploma(runtime: DiplomaRuntime): void {
  vblankCbDiploma(runtime);
}

export function CB2_ShowDiploma(runtime: DiplomaRuntime): void {
  cb2ShowDiploma(runtime);
}

export function CB2_Diploma(runtime: DiplomaRuntime): void {
  cb2Diploma(runtime);
}

export function Task_DiplomaInit(runtime: DiplomaRuntime, taskId: number): void {
  taskDiplomaInit(runtime, taskId);
}

export function Task_HandleDiplomaInput(
  runtime: DiplomaRuntime,
  taskId: number,
  input: { aButtonNew?: boolean; fanfareDone?: boolean } = {}
): void {
  taskHandleDiplomaInput(runtime, taskId, input);
}

export function Task_DiplomaExit(runtime: DiplomaRuntime, taskId: number): void {
  taskDiplomaExit(runtime, taskId);
}

export function DiplomaReset(runtime: DiplomaRuntime): void {
  diplomaReset(runtime);
}

export function DiplomaInitScreen(runtime: DiplomaRuntime): void {
  diplomaInitScreen(runtime);
}

export function DiplomaLoadGfx(runtime: DiplomaRuntime): boolean {
  return diplomaLoadGfx(runtime);
}

export function DiplomaPrintText(runtime: DiplomaRuntime): void {
  diplomaPrintText(runtime);
}
