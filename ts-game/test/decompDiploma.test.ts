import { describe, expect, test } from 'vitest';
import {
  BG_DIPLOMA,
  BG_TEXT,
  CB2_DIPLOMA,
  CB2_RETURN_TO_FIELD_FROM_DIPLOMA,
  CB2_Diploma,
  CB2_ShowDiploma,
  DiplomaInitScreen,
  DiplomaLoadGfx,
  DiplomaPrintText,
  DiplomaReset,
  FANFARE_OBTAIN_BADGE,
  Task_DiplomaExit,
  Task_DiplomaInit,
  Task_HandleDiplomaInput,
  VBLANK_CB_DIPLOMA,
  VBlankCB_Diploma,
  cb2Diploma,
  cb2ShowDiploma,
  createDiplomaRuntime,
  diplomaInitScreen,
  diplomaLoadGfx,
  diplomaPrintText,
  diplomaReset,
  taskDiplomaExit,
  taskDiplomaInit,
  taskHandleDiplomaInput,
  vblankCbDiploma
} from '../src/game/decompDiploma';

describe('decomp diploma', () => {
  test('CB2_ShowDiploma allocates state, resets runtime, creates init task, and installs callback', () => {
    const runtime = createDiplomaRuntime();

    cb2ShowDiploma(runtime);

    expect(runtime.diploma).toMatchObject({ mainState: 0, gfxState: 0, initState: 0 });
    expect(runtime.diploma?.tilemapBuffer).toHaveLength(0x800);
    expect(runtime.tasks).toEqual([{ func: 'Task_DiplomaInit', priority: 0, destroyed: false }]);
    expect(runtime.callbacks.main).toBe(CB2_DIPLOMA);
    expect(runtime.resetLog).toContain('ScanlineEffect_Stop');
  });

  test('CB2_Diploma and VBlankCB_Diploma record the same frame operations', () => {
    const runtime = createDiplomaRuntime();

    cb2Diploma(runtime);
    vblankCbDiploma(runtime);

    expect(runtime.resetLog).toEqual([
      'RunTasks',
      'AnimateSprites',
      'BuildOamBuffer',
      'UpdatePaletteFade',
      'LoadOam',
      'ProcessSpriteCopyRequests',
      'TransferPlttBuffer'
    ]);
  });

  test('DiplomaInitScreen mirrors BG/window/GPU setup', () => {
    const runtime = createDiplomaRuntime();
    runtime.diploma = {
      mainState: 0,
      gfxState: 0,
      initState: 0,
      tilemapBuffer: []
    };

    diplomaInitScreen(runtime);

    expect(runtime.gpuRegs.DISPCNT).toBe(0x1000);
    expect(runtime.bgX).toMatchObject({ 0: 0, 1: 0, 2: 0, 3: 0 });
    expect(runtime.bgY).toMatchObject({ 0: 0, 1: 0, 2: 0, 3: 0 });
    expect(runtime.windowTemplates[0]).toMatchObject({ bg: BG_TEXT, tilemapTop: 2, width: 29, height: 16 });
    expect(runtime.shownBgs).toEqual([BG_TEXT, BG_DIPLOMA]);
    expect(runtime.bgFills).toHaveLength(2);
  });

  test('DiplomaLoadGfx follows gfxState and waits while temp tile data is busy', () => {
    const runtime = createDiplomaRuntime();
    runtime.diploma = {
      mainState: 0,
      gfxState: 0,
      initState: 0,
      tilemapBuffer: []
    };

    expect(diplomaLoadGfx(runtime)).toBe(false);
    expect(diplomaLoadGfx(runtime)).toBe(false);
    runtime.tempTileDataBusy = true;
    expect(diplomaLoadGfx(runtime)).toBe(false);
    expect(runtime.diploma.gfxState).toBe(2);
    runtime.tempTileDataBusy = false;
    expect(diplomaLoadGfx(runtime)).toBe(false);
    expect(diplomaLoadGfx(runtime)).toBe(true);
    expect(runtime.paletteLoads).toEqual([{ source: 'sDiplomaPal', paletteId: 0, size: 16 }]);
  });

  test('DiplomaPrintText expands player/name dex placeholders and places three text printers', () => {
    const runtime = createDiplomaRuntime();
    runtime.playerName = 'LEAF';
    runtime.hasAllMons = true;

    diplomaPrintText(runtime);

    expect(runtime.windowFills).toEqual([{ windowId: 0, value: 0 }]);
    expect(runtime.textPrints.map((print) => print.text)).toEqual([
      'PLAYER: LEAF',
      'This document is issued in\nrecognition of your magnificent\nachievement - the completion of\nthe NATIONAL POKeDEX.',
      'GAME FREAK'
    ]);
    expect(runtime.textPrints[0].y).toBe(4);
    expect(runtime.textPrints[1].y).toBe(30);
    expect(runtime.textPrints[2].x).toBe(120);
    expect(runtime.windowTilemaps).toEqual([0]);
  });

  test('Task_DiplomaInit advances through init states and waits on load/fade just like C', () => {
    const runtime = createDiplomaRuntime();
    runtime.hasAllMons = true;
    cb2ShowDiploma(runtime);

    taskDiplomaInit(runtime, 0);
    expect(runtime.callbacks.vblank).toBeNull();
    taskDiplomaInit(runtime, 0);
    expect(runtime.windowTemplates).toHaveLength(1);
    taskDiplomaInit(runtime, 0);
    expect(runtime.diploma?.initState).toBe(2);
    taskDiplomaInit(runtime, 0);
    taskDiplomaInit(runtime, 0);
    taskDiplomaInit(runtime, 0);
    expect(runtime.diploma?.initState).toBe(3);
    taskDiplomaInit(runtime, 0);
    expect(runtime.tilemapCopies).toEqual([{ bg: BG_DIPLOMA, source: 'sDiplomaTilemap', a: 0, b: 0 }]);
    taskDiplomaInit(runtime, 0);
    expect(runtime.gpuRegs.BG1HOFS).toBe(0x100);
    taskDiplomaInit(runtime, 0);
    expect(runtime.textPrints).toHaveLength(3);
    taskDiplomaInit(runtime, 0);
    expect(runtime.bgCopies).toEqual([BG_TEXT, BG_DIPLOMA]);
    taskDiplomaInit(runtime, 0);
    expect(runtime.paletteFadeActive).toBe(true);
    taskDiplomaInit(runtime, 0);
    expect(runtime.callbacks.vblank).toBe(VBLANK_CB_DIPLOMA);
    taskDiplomaInit(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_DiplomaInit');
    runtime.paletteFadeActive = false;
    taskDiplomaInit(runtime, 0);
    expect(runtime.fanfares).toEqual([FANFARE_OBTAIN_BADGE]);
    expect(runtime.tasks[0].func).toBe('Task_HandleDiplomaInput');
  });

  test('Task_HandleDiplomaInput waits for fanfare, A button, fade completion, then returns to field', () => {
    const runtime = createDiplomaRuntime();
    cb2ShowDiploma(runtime);
    runtime.tasks[0].func = 'Task_HandleDiplomaInput';

    taskHandleDiplomaInput(runtime, 0, { fanfareDone: false });
    expect(runtime.diploma?.mainState).toBe(0);
    taskHandleDiplomaInput(runtime, 0, { fanfareDone: true });
    expect(runtime.diploma?.mainState).toBe(1);
    taskHandleDiplomaInput(runtime, 0, { aButtonNew: true });
    expect(runtime.paletteFadeActive).toBe(true);
    expect(runtime.diploma?.mainState).toBe(2);
    taskHandleDiplomaInput(runtime, 0);
    expect(runtime.diploma).not.toBeNull();
    runtime.paletteFadeActive = false;
    taskHandleDiplomaInput(runtime, 0);
    expect(runtime.diploma).toBeNull();
    expect(runtime.tasks[0].destroyed).toBe(true);
    expect(runtime.freedWindowBuffers).toBe(true);
    expect(runtime.callbacks.main).toBe(CB2_RETURN_TO_FIELD_FROM_DIPLOMA);
  });

  test('DiplomaReset and Task_DiplomaExit preserve their direct side effects', () => {
    const runtime = createDiplomaRuntime();
    cb2ShowDiploma(runtime);
    diplomaReset(runtime);
    expect(runtime.tasks).toEqual([]);
    expect(runtime.resetLog.slice(-5)).toEqual([
      'ResetSpriteData',
      'ResetPaletteFade',
      'FreeAllSpritePalettes',
      'ResetTasks',
      'ScanlineEffect_Stop'
    ]);

    cb2ShowDiploma(runtime);
    runtime.paletteFadeActive = true;
    taskDiplomaExit(runtime, 0);
    expect(runtime.diploma).not.toBeNull();
    runtime.paletteFadeActive = false;
    taskDiplomaExit(runtime, 0);
    expect(runtime.callbacks.main).toBe(CB2_RETURN_TO_FIELD_FROM_DIPLOMA);
  });

  test('exact C-name diploma exports preserve setup, graphics, text, frame, input, and exit behavior', () => {
    const runtime = createDiplomaRuntime();
    runtime.hasAllMons = true;
    runtime.playerName = 'RED';

    CB2_ShowDiploma(runtime);
    expect(runtime.diploma).toMatchObject({ mainState: 0, gfxState: 0, initState: 0 });
    expect(runtime.tasks[0]).toMatchObject({ func: 'Task_DiplomaInit', priority: 0, destroyed: false });
    expect(runtime.callbacks.main).toBe(CB2_DIPLOMA);

    CB2_Diploma(runtime);
    VBlankCB_Diploma(runtime);
    expect(runtime.resetLog.slice(-7)).toEqual([
      'RunTasks',
      'AnimateSprites',
      'BuildOamBuffer',
      'UpdatePaletteFade',
      'LoadOam',
      'ProcessSpriteCopyRequests',
      'TransferPlttBuffer'
    ]);

    DiplomaInitScreen(runtime);
    expect(runtime.shownBgs.slice(-2)).toEqual([BG_TEXT, BG_DIPLOMA]);
    expect(runtime.gpuRegs.DISPCNT).toBe(0x1000);

    runtime.diploma!.gfxState = 0;
    expect(DiplomaLoadGfx(runtime)).toBe(false);
    expect(DiplomaLoadGfx(runtime)).toBe(false);
    runtime.tempTileDataBusy = true;
    expect(DiplomaLoadGfx(runtime)).toBe(false);
    runtime.tempTileDataBusy = false;
    expect(DiplomaLoadGfx(runtime)).toBe(false);
    expect(DiplomaLoadGfx(runtime)).toBe(true);
    expect(runtime.paletteLoads.at(-1)).toEqual({ source: 'sDiplomaPal', paletteId: 0, size: 16 });

    DiplomaPrintText(runtime);
    expect(runtime.textPrints.slice(-3).map((print) => print.text)).toEqual([
      'PLAYER: RED',
      'This document is issued in\nrecognition of your magnificent\nachievement - the completion of\nthe NATIONAL POKeDEX.',
      'GAME FREAK'
    ]);

    DiplomaReset(runtime);
    expect(runtime.tasks).toEqual([]);
    CB2_ShowDiploma(runtime);
    Task_DiplomaInit(runtime, 0);
    expect(runtime.callbacks.vblank).toBeNull();

    runtime.tasks[0].func = 'Task_HandleDiplomaInput';
    Task_HandleDiplomaInput(runtime, 0, { fanfareDone: true });
    expect(runtime.diploma?.mainState).toBe(1);
    Task_HandleDiplomaInput(runtime, 0, { aButtonNew: true });
    expect(runtime.diploma?.mainState).toBe(2);
    runtime.paletteFadeActive = false;
    Task_HandleDiplomaInput(runtime, 0);
    expect(runtime.callbacks.main).toBe(CB2_RETURN_TO_FIELD_FROM_DIPLOMA);

    CB2_ShowDiploma(runtime);
    runtime.paletteFadeActive = false;
    Task_DiplomaExit(runtime, 0);
    expect(runtime.diploma).toBeNull();
    expect(runtime.tasks[0].destroyed).toBe(true);
  });
});
