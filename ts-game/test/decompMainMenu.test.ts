import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  CB2_InitMainMenu,
  CB2_InitMainMenu_2,
  CB2_MainMenu,
  COPYWIN_FULL,
  createMainMenuRuntime,
  DPAD_DOWN,
  DPAD_UP,
  FEMALE,
  FLAG_BADGE01_GET,
  FLAG_SYS_POKEDEX_GET,
  HandleMenuInput,
  MAIN_MENU_C_TRANSLATION_UNIT,
  MAIN_MENU_CONTINUE,
  MAIN_MENU_MYSTERYGIFT,
  MAIN_MENU_NEWGAME,
  MAIN_MENU_WINDOW_CONTINUE,
  MAIN_MENU_WINDOW_ERROR,
  MAIN_MENU_WINDOW_MYSTERYGIFT,
  MAIN_MENU_WINDOW_NEWGAME_ONLY,
  MainMenu_DrawWindow,
  MainMenu_EraseWindow,
  MainMenuGpuInit,
  MoveWindowByMenuTypeAndCursorPos,
  PrintBadgeCount,
  PrintContinueStats,
  PrintDexCount,
  PrintMessageOnWindow4,
  PrintPlayTime,
  PrintPlayerName,
  SAVE_STATUS_EMPTY,
  SAVE_STATUS_ERROR,
  SAVE_STATUS_INVALID,
  SAVE_STATUS_NO_FLASH,
  SAVE_STATUS_OK,
  sWindowTemplate,
  Task_ExecuteMainMenuSelection,
  Task_HandleMenuInput,
  Task_MysteryGiftError,
  Task_PrintMainMenuText,
  Task_ReturnToTileScreen,
  Task_SaveErrorStatus_RunPrinterThenWaitButton,
  Task_SetWin0BldRegsAndCheckSaveFile,
  Task_SetWin0BldRegsNoSaveFileCheck,
  Task_UpdateVisualSelection,
  Task_WaitDma3AndFadeIn,
  Task_WaitFadeAndPrintMainMenuText,
  VBlankCB_MainMenu
} from '../src/game/decompMainMenu';

describe('decomp main_menu.c parity', () => {
  test('CB2 callbacks and GPU init reset display state, install main callback, and create first task', () => {
    const runtime = createMainMenuRuntime();
    expect(MainMenuGpuInit(runtime, 7)).toBe(false);
    expect(runtime.mainCallback2).toBe('CB2_MainMenu');
    expect(runtime.vblankCallback).toBe(null);
    expect(runtime.tasks).toHaveLength(1);
    expect(runtime.tasks[0]).toMatchObject({
      func: 'Task_SetWin0BldRegsAndCheckSaveFile',
      priority: 0,
      destroyed: false
    });
    expect(runtime.tasks[0].data[1]).toBe(0);
    expect(runtime.tasks[0].data[8]).toBe(7);
    expect(runtime.gpuRegs.get('DISPCNT')).toBe(0x5000);
    expect(runtime.operations).toContain('ResetTasks');

    CB2_MainMenu(runtime);
    expect(runtime.operations.slice(-4)).toEqual(['RunTasks', 'AnimateSprites', 'BuildOamBuffer', 'UpdatePaletteFade']);
    VBlankCB_MainMenu(runtime);
    expect(runtime.operations.slice(-3)).toEqual(['LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer']);

    const initRuntime = createMainMenuRuntime();
    CB2_InitMainMenu(initRuntime);
    expect(initRuntime.tasks[0].data[8]).toBe(1);

    const initRuntime2 = createMainMenuRuntime();
    expect(MAIN_MENU_C_TRANSLATION_UNIT).toBe('src/main_menu.c');
    CB2_InitMainMenu_2(initRuntime2);
    expect(initRuntime2.tasks[0].data[8]).toBe(1);
  });

  test('save status task selects menu type and error flow exactly', () => {
    const ok = createMainMenuRuntime();
    MainMenuGpuInit(ok, 1);
    ok.saveFileStatus = SAVE_STATUS_OK;
    ok.mysteryGiftEnabled = true;
    Task_SetWin0BldRegsAndCheckSaveFile(ok, 0);
    expect(ok.tasks[0].data[0]).toBe(MAIN_MENU_MYSTERYGIFT);
    expect(ok.tasks[0].func).toBe('Task_SetWin0BldRegsNoSaveFileCheck');
    expect(ok.operations).toContain('LoadBgTiles:0:userFrame:0:0x120:0x1B1');

    const empty = createMainMenuRuntime();
    MainMenuGpuInit(empty, 1);
    empty.saveFileStatus = SAVE_STATUS_EMPTY;
    Task_SetWin0BldRegsAndCheckSaveFile(empty, 0);
    expect(empty.tasks[0].data[0]).toBe(MAIN_MENU_NEWGAME);
    expect(empty.tasks[0].func).toBe('Task_SetWin0BldRegsNoSaveFileCheck');

    const invalid = createMainMenuRuntime();
    MainMenuGpuInit(invalid, 1);
    invalid.saveFileStatus = SAVE_STATUS_INVALID;
    Task_SetWin0BldRegsAndCheckSaveFile(invalid, 0);
    expect(invalid.tasks[0].data[0]).toBe(MAIN_MENU_NEWGAME);
    expect(invalid.tasks[0].func).toBe('Task_SaveErrorStatus_RunPrinterThenWaitButton');
    expect(invalid.operations).toContain('LoadStdWindowGfx:0:0x1B1:2:bg0');
    expect(invalid.operations.some((op) => op.includes('The save file has been deleted.'))).toBe(true);

    const error = createMainMenuRuntime();
    MainMenuGpuInit(error, 1);
    error.saveFileStatus = SAVE_STATUS_ERROR;
    error.mysteryGiftEnabled = false;
    Task_SetWin0BldRegsAndCheckSaveFile(error, 0);
    expect(error.tasks[0].data[0]).toBe(MAIN_MENU_CONTINUE);
    expect(error.operations.some((op) => op.includes('The save file is corrupted.'))).toBe(true);
    error.mysteryGiftEnabled = true;
    Task_SetWin0BldRegsAndCheckSaveFile(error, 0);
    expect(error.tasks[0].data[0]).toBe(MAIN_MENU_MYSTERYGIFT);

    const noFlash = createMainMenuRuntime();
    MainMenuGpuInit(noFlash, 1);
    noFlash.saveFileStatus = SAVE_STATUS_NO_FLASH;
    Task_SetWin0BldRegsAndCheckSaveFile(noFlash, 0);
    expect(noFlash.tasks[0].data[0]).toBe(MAIN_MENU_NEWGAME);
    expect(noFlash.operations.some((op) => op.includes('1M sub-circuit'))).toBe(true);
  });

  test('save-error wait task only advances after fade, printer idle, and A press', () => {
    const runtime = createMainMenuRuntime();
    MainMenuGpuInit(runtime, 1);
    runtime.tasks[0].data[0] = MAIN_MENU_CONTINUE;
    runtime.tasks[0].func = 'Task_SaveErrorStatus_RunPrinterThenWaitButton';
    runtime.textPrinterActive.add(MAIN_MENU_WINDOW_ERROR);
    runtime.newKeys = A_BUTTON;
    Task_SaveErrorStatus_RunPrinterThenWaitButton(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_SaveErrorStatus_RunPrinterThenWaitButton');
    runtime.textPrinterActive.clear();
    Task_SaveErrorStatus_RunPrinterThenWaitButton(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_PrintMainMenuText');
    expect(runtime.operations).toContain(`ClearWindowTilemap:${MAIN_MENU_WINDOW_ERROR}`);

    const newGame = createMainMenuRuntime();
    MainMenuGpuInit(newGame, 1);
    newGame.tasks[0].data[0] = MAIN_MENU_NEWGAME;
    newGame.newKeys = A_BUTTON;
    Task_SaveErrorStatus_RunPrinterThenWaitButton(newGame, 0);
    expect(newGame.tasks[0].func).toBe('Task_SetWin0BldRegsNoSaveFileCheck');
  });

  test('no-save-file-check routes new game directly, and continue/mystery gift through text print wait', () => {
    const runtime = createMainMenuRuntime();
    MainMenuGpuInit(runtime, 1);
    runtime.tasks[0].data[0] = MAIN_MENU_NEWGAME;
    Task_SetWin0BldRegsNoSaveFileCheck(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_ExecuteMainMenuSelection');
    runtime.tasks[0].data[0] = MAIN_MENU_CONTINUE;
    Task_SetWin0BldRegsNoSaveFileCheck(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_WaitFadeAndPrintMainMenuText');
    runtime.paletteFadeActive = true;
    runtime.tasks[0].func = 'Task_WaitFadeAndPrintMainMenuText';
    Task_WaitFadeAndPrintMainMenuText(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_WaitFadeAndPrintMainMenuText');
  });

  test('print main menu text draws each menu type and continue stats using exact windows', () => {
    const runtime = createMainMenuRuntime();
    MainMenuGpuInit(runtime, 1);
    runtime.saveBlock2.playerGender = FEMALE;
    runtime.saveBlock2.playerName = 'RED';
    runtime.saveBlock2.playTimeHours = 12;
    runtime.saveBlock2.playTimeMinutes = 5;
    runtime.flags.add(FLAG_SYS_POKEDEX_GET);
    runtime.kantoDexCount = 42;
    runtime.flags.add(FLAG_BADGE01_GET);
    runtime.flags.add(FLAG_BADGE01_GET + 3);

    runtime.tasks[0].data[0] = MAIN_MENU_CONTINUE;
    Task_PrintMainMenuText(runtime, 0);
    expect(runtime.operations).toContain('LoadPalette:playerGender:21631');
    expect(runtime.operations).toContain(`AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:FONT_NORMAL:2:2:10,11,12:-1:CONTINUE`);
    expect(runtime.operations).toContain(`AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:FONT_NORMAL:62:18:10,1,12:-1:RED`);
    expect(runtime.operations).toContain(`AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:FONT_NORMAL:62:34:10,1,12:-1:12:05`);
    expect(runtime.operations).toContain(`AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:FONT_NORMAL:62:50:10,1,12:-1:42`);
    expect(runtime.operations).toContain(`AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_CONTINUE}:FONT_NORMAL:62:66:10,1,12:-1:2`);
    expect(runtime.tasks[0].func).toBe('Task_WaitDma3AndFadeIn');

    const mg = createMainMenuRuntime();
    MainMenuGpuInit(mg, 1);
    mg.tasks[0].data[0] = MAIN_MENU_MYSTERYGIFT;
    Task_PrintMainMenuText(mg, 0);
    expect(mg.tasks[0].data[10]).toBe(1);
    expect(mg.operations).toContain(`AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_MYSTERYGIFT}:FONT_NORMAL:2:2:10,11,12:-1:MYSTERY GIFT`);

    const newOnly = createMainMenuRuntime();
    MainMenuGpuInit(newOnly, 1);
    newOnly.tasks[0].data[0] = MAIN_MENU_NEWGAME;
    Task_PrintMainMenuText(newOnly, 0);
    expect(newOnly.operations).toContain(`CopyWindowToVram:${MAIN_MENU_WINDOW_NEWGAME_ONLY}:${COPYWIN_FULL}`);
  });

  test('DMA/fade and visual-selection tasks preserve state transitions', () => {
    const runtime = createMainMenuRuntime();
    MainMenuGpuInit(runtime, 1);
    runtime.waitDma3Result = -1;
    Task_WaitDma3AndFadeIn(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_SetWin0BldRegsAndCheckSaveFile');
    runtime.waitDma3Result = 0;
    Task_WaitDma3AndFadeIn(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_UpdateVisualSelection');
    expect(runtime.vblankCallback).toBe('VBlankCB_MainMenu');
    runtime.tasks[0].data[0] = MAIN_MENU_MYSTERYGIFT;
    runtime.tasks[0].data[1] = 2;
    Task_UpdateVisualSelection(runtime, 0);
    expect(runtime.gpuRegs.get('WIN0V')).toBe(0x829e);
    expect(runtime.tasks[0].func).toBe('Task_HandleMenuInput');
  });

  test('menu input handles A/B side effects and bounded cursor movement', () => {
    const runtime = createMainMenuRuntime();
    MainMenuGpuInit(runtime, 1);
    runtime.tasks[0].data[0] = MAIN_MENU_MYSTERYGIFT;
    runtime.newKeys = DPAD_DOWN;
    expect(HandleMenuInput(runtime, 0)).toBe(true);
    expect(runtime.tasks[0].data[1]).toBe(1);
    expect(HandleMenuInput(runtime, 0)).toBe(true);
    expect(runtime.tasks[0].data[1]).toBe(2);
    expect(HandleMenuInput(runtime, 0)).toBe(false);
    runtime.newKeys = DPAD_UP;
    expect(HandleMenuInput(runtime, 0)).toBe(true);
    expect(runtime.tasks[0].data[1]).toBe(1);

    runtime.newKeys = A_BUTTON;
    expect(HandleMenuInput(runtime, 0)).toBe(false);
    expect(runtime.tasks[0].func).toBe('Task_ExecuteMainMenuSelection');
    expect(runtime.operations).toContain('IsWirelessAdapterConnected');

    runtime.tasks[0].func = 'Task_HandleMenuInput';
    runtime.newKeys = B_BUTTON;
    HandleMenuInput(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_ReturnToTileScreen');
    expect(runtime.gpuRegs.get('WIN0H')).toBe(0x00f0);
    expect(runtime.gpuRegs.get('WIN0V')).toBe(0x00a0);

    runtime.tasks[0].func = 'Task_HandleMenuInput';
    runtime.paletteFadeActive = false;
    runtime.newKeys = DPAD_UP;
    runtime.tasks[0].data[1] = 1;
    Task_HandleMenuInput(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_UpdateVisualSelection');
  });

  test('main menu selection dispatches new game, continue, mystery gift, and wireless-error branches', () => {
    const newGame = createMainMenuRuntime();
    MainMenuGpuInit(newGame, 1);
    newGame.tasks[0].data[0] = MAIN_MENU_NEWGAME;
    Task_ExecuteMainMenuSelection(newGame, 0);
    expect(newGame.exitStairsMovementDisabled).toBe(false);
    expect(newGame.tasks[0].destroyed).toBe(true);
    expect(newGame.operations).toContain('StartNewGameScene');

    const cont = createMainMenuRuntime();
    MainMenuGpuInit(cont, 1);
    cont.tasks[0].data[0] = MAIN_MENU_CONTINUE;
    cont.tasks[0].data[1] = 0;
    Task_ExecuteMainMenuSelection(cont, 0);
    expect(cont.operations).toContain('TryStartQuestLogPlayback:0');

    const mg = createMainMenuRuntime();
    MainMenuGpuInit(mg, 1);
    mg.tasks[0].data[0] = MAIN_MENU_MYSTERYGIFT;
    mg.tasks[0].data[1] = 2;
    Task_ExecuteMainMenuSelection(mg, 0);
    expect(mg.mainCallback2).toBe('CB2_InitMysteryGift');
    expect(mg.helpSystemEnabled).toBe(false);
    expect(mg.tasks[0].destroyed).toBe(true);

    const noWireless = createMainMenuRuntime();
    MainMenuGpuInit(noWireless, 1);
    noWireless.tasks[0].data[0] = MAIN_MENU_MYSTERYGIFT;
    noWireless.tasks[0].data[1] = 2;
    noWireless.wirelessAdapterConnected = false;
    Task_ExecuteMainMenuSelection(noWireless, 0);
    expect(noWireless.tasks[0].func).toBe('Task_MysteryGiftError');
    expect(noWireless.tasks[0].destroyed).toBe(false);
  });

  test('mystery gift error task walks state 0-3 and returns to title on A/B', () => {
    const runtime = createMainMenuRuntime();
    MainMenuGpuInit(runtime, 1);
    runtime.tasks[0].func = 'Task_MysteryGiftError';
    runtime.tasks[0].data[10] = 1;
    Task_MysteryGiftError(runtime, 0);
    expect(runtime.tasks[0].data[9]).toBe(1);
    expect(runtime.operations.some((op) => op.includes('Wireless Adapter'))).toBe(true);
    Task_MysteryGiftError(runtime, 0);
    expect(runtime.tasks[0].data[9]).toBe(2);
    Task_MysteryGiftError(runtime, 0);
    expect(runtime.tasks[0].data[9]).toBe(3);
    runtime.newKeys = B_BUTTON;
    Task_MysteryGiftError(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_ReturnToTileScreen');
    Task_ReturnToTileScreen(runtime, 0);
    expect(runtime.mainCallback2).toBe('CB2_InitTitleScreen');
    expect(runtime.tasks[0].destroyed).toBe(true);
  });

  test('WIN0 selection ranges match menu type and cursor position', () => {
    const runtime = createMainMenuRuntime();
    MoveWindowByMenuTypeAndCursorPos(runtime, MAIN_MENU_NEWGAME, 0);
    expect(runtime.gpuRegs.get('WIN0H')).toBe(0x12de);
    expect(runtime.gpuRegs.get('WIN0V')).toBe(0x021e);
    MoveWindowByMenuTypeAndCursorPos(runtime, MAIN_MENU_CONTINUE, 0);
    expect(runtime.gpuRegs.get('WIN0V')).toBe(0x025e);
    MoveWindowByMenuTypeAndCursorPos(runtime, MAIN_MENU_CONTINUE, 1);
    expect(runtime.gpuRegs.get('WIN0V')).toBe(0x627e);
    MoveWindowByMenuTypeAndCursorPos(runtime, MAIN_MENU_MYSTERYGIFT, 2);
    expect(runtime.gpuRegs.get('WIN0V')).toBe(0x829e);
  });

  test('message window and frame helpers emit the exact border and erase fill calls', () => {
    const runtime = createMainMenuRuntime();
    PrintMessageOnWindow4(runtime, 'Hello');
    expect(runtime.operations).toContain(`AddTextPrinterParameterized3:${MAIN_MENU_WINDOW_ERROR}:FONT_NORMAL:0:2:10,11,12:2:Hello`);
    expect(runtime.gpuRegs.get('WIN0H')).toBe(0x13dd);
    expect(runtime.gpuRegs.get('WIN0V')).toBe(0x739d);

    const draw = createMainMenuRuntime();
    MainMenu_DrawWindow(draw, sWindowTemplate[MAIN_MENU_WINDOW_CONTINUE]);
    expect(draw.operations.slice(0, 8)).toEqual([
      'FillBgTilemapBufferRect:0:433:2:0:1:1:2',
      'FillBgTilemapBufferRect:0:434:3:0:24:10:2',
      'FillBgTilemapBufferRect:0:435:27:0:1:1:2',
      'FillBgTilemapBufferRect:0:436:2:1:1:10:2',
      'FillBgTilemapBufferRect:0:438:27:1:1:10:2',
      'FillBgTilemapBufferRect:0:439:2:11:1:1:2',
      'FillBgTilemapBufferRect:0:440:3:11:24:1:2',
      'FillBgTilemapBufferRect:0:441:27:11:1:1:2'
    ]);
    expect(draw.operations.at(-1)).toBe('CopyBgTilemapBufferToVram:0');

    const erase = createMainMenuRuntime();
    MainMenu_EraseWindow(erase, sWindowTemplate[MAIN_MENU_WINDOW_ERROR]);
    expect(erase.operations[0]).toBe('FillBgTilemapBufferRect:0:0:2:14:28:20:2');
  });

  test('individual stat helpers preserve label/value coordinates and optional dex branch', () => {
    const runtime = createMainMenuRuntime();
    runtime.saveBlock2.playerName = 'LEAFNAME';
    runtime.saveBlock2.playTimeHours = 999;
    runtime.saveBlock2.playTimeMinutes = 7;
    runtime.nationalPokedexEnabled = true;
    runtime.nationalDexCount = 151;
    runtime.flags.add(FLAG_BADGE01_GET + 7);

    PrintPlayerName(runtime);
    PrintPlayTime(runtime);
    PrintDexCount(runtime);
    expect(runtime.operations.some((op) => op.includes('POKéDEX'))).toBe(false);
    runtime.flags.add(FLAG_SYS_POKEDEX_GET);
    PrintDexCount(runtime);
    PrintBadgeCount(runtime);
    PrintContinueStats(runtime);

    expect(runtime.operations).toContain('AddTextPrinterParameterized3:1:FONT_NORMAL:62:18:10,1,12:-1:LEAFNAM');
    expect(runtime.operations).toContain('AddTextPrinterParameterized3:1:FONT_NORMAL:62:34:10,1,12:-1:999:07');
    expect(runtime.operations).toContain('AddTextPrinterParameterized3:1:FONT_NORMAL:62:50:10,1,12:-1:151');
    expect(runtime.operations).toContain('AddTextPrinterParameterized3:1:FONT_NORMAL:62:66:10,1,12:-1:1');
  });
});
