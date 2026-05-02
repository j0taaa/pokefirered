import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  CHAR_KEYPAD_ICON,
  CHAR_NEWLINE,
  CHAR_SPACE,
  createHelpSystemUtilRuntime,
  DPAD_DOWN,
  DPAD_RIGHT,
  DPAD_UP,
  EOS,
  EXT_CTRL_CODE_BEGIN,
  EXT_CTRL_CODE_CLEAR_TO,
  FONT_NORMAL,
  FONTATTR_MAX_LETTER_HEIGHT,
  GetFontAttribute,
  getHelpSystemTile,
  HelpSystem_FillPanel1,
  HelpSystem_GetMenuInput,
  HelpSystem_InitListMenuController,
  HelpSystem_PrintQuestionAndAnswerPair,
  HelpSystem_PrintTextRightAlign_Row52,
  HelpSystem_PrintTopicMouseoverDescription,
  HelpSystem_SetInputDelay,
  HelpSystemRenderText,
  HS_BufferFillMapWithTile1FF,
  HS_DrawBgTilemapRect,
  HS_SetMainWindowBgBrightness,
  HS_ShowOrHideControlsGuideInTopRight,
  HS_ShowOrHideHeaderAndFooterLines_Darker,
  HS_ShowOrHideHeaderAndFooterLines_Lighter,
  HS_ShowOrHideHeaderLine_Darker_FooterStyle,
  HS_ShowOrHideMainWindowText,
  HS_ShowOrHideScrollArrows,
  HS_ShowOrHideToplevelTooltipWindow,
  HS_ShowOrHideVerticalBlackBarsAlongSides,
  HS_ShowOrHideWordHELPinTopLeft,
  HS_UpdateMenuScrollArrows,
  L_BUTTON,
  MoveCursor,
  OPTIONS_BUTTON_MODE_HELP,
  PLACEHOLDER_BEGIN,
  PLACEHOLDER_ID_PLAYER,
  PLACEHOLDER_ID_STRING_VAR_1,
  REG_OFFSET_BG0CNT,
  REG_OFFSET_BG0HOFS,
  REG_OFFSET_BG0VOFS,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_DISPCNT,
  RestoreCallbacks,
  RestoreGPURegs,
  RestoreMapTextColors,
  RestoreMapTiles,
  R_BUTTON,
  RunHelpSystemCallback,
  SaveCallbacks,
  SaveMapGPURegs,
  SaveMapTextColors,
  SaveMapTiles,
  SE_SELECT,
  SetGpuReg,
  TryMoveCursor1,
  type HelpSystemListMenu,
  type ListMenuItem
} from '../src/game/decompHelpSystemUtil';

const items = (count: number): ListMenuItem[] =>
  Array.from({ length: count }, (_, i) => ({ label: `Item${i}`, index: 100 + i }));

const menu = (count: number, maxShowed = 7): HelpSystemListMenu => ({
  sub: {
    items: items(count),
    totalItems: count,
    maxShowed,
    left: 2,
    top: 3
  },
  itemsAbove: 0,
  cursorPos: 0,
  state: 9
});

describe('decomp help_system_util.c parity', () => {
  test('tilemap rect helpers write halfwords at gDecompressionBuffer + 0x3800 and commit', () => {
    const runtime = createHelpSystemUtilRuntime();
    HS_DrawBgTilemapRect(runtime, 0x120, 2, 3, 3, 2, 1);
    expect(getHelpSystemTile(runtime, 2, 3)).toBe(0x120);
    expect(getHelpSystemTile(runtime, 3, 3)).toBe(0x121);
    expect(getHelpSystemTile(runtime, 4, 3)).toBe(0x122);
    expect(getHelpSystemTile(runtime, 2, 4)).toBe(0x123);
    expect(runtime.operations.at(-1)).toBe('RequestDma3Copy:gDecompressionBuffer:BG_CHAR_ADDR(3):0x4000');

    HS_BufferFillMapWithTile1FF(runtime);
    expect(getHelpSystemTile(runtime, 0, 0)).toBe(0x1ff);
    expect(getHelpSystemTile(runtime, 29, 19)).toBe(0x1ff);
  });

  test('show/hide window helpers preserve exact tile ids, rectangles, and increments', () => {
    const runtime = createHelpSystemUtilRuntime();
    HS_ShowOrHideWordHELPinTopLeft(runtime, 1);
    expect(getHelpSystemTile(runtime, 1, 0)).toBe(0x1e8);
    expect(getHelpSystemTile(runtime, 7, 1)).toBe(0x1f5);
    HS_ShowOrHideControlsGuideInTopRight(runtime, 1);
    expect(getHelpSystemTile(runtime, 13, 0)).toBe(0x1a0);
    HS_ShowOrHideMainWindowText(runtime, 1);
    expect(getHelpSystemTile(runtime, 2, 3)).toBe(0);
    expect(getHelpSystemTile(runtime, 27, 18)).toBe(415);
    HS_SetMainWindowBgBrightness(runtime, 1);
    expect(getHelpSystemTile(runtime, 1, 3)).toBe(0x1fa);
    HS_ShowOrHideToplevelTooltipWindow(runtime, 1);
    expect(getHelpSystemTile(runtime, 2, 14)).toBe(0x11e);
    HS_ShowOrHideHeaderAndFooterLines_Lighter(runtime, 1);
    expect(getHelpSystemTile(runtime, 1, 2)).toBe(0x1f7);
    expect(getHelpSystemTile(runtime, 1, 19)).toBe(0x1f8);
    HS_ShowOrHideHeaderAndFooterLines_Darker(runtime, 1);
    expect(getHelpSystemTile(runtime, 1, 2)).toBe(0x1fb);
    expect(getHelpSystemTile(runtime, 1, 19)).toBe(0x1fc);
    HS_ShowOrHideVerticalBlackBarsAlongSides(runtime, 1);
    expect(getHelpSystemTile(runtime, 0, 0)).toBe(0x1f9);
    expect(getHelpSystemTile(runtime, 29, 19)).toBe(0x1f9);
    HS_ShowOrHideHeaderLine_Darker_FooterStyle(runtime, 1);
    expect(getHelpSystemTile(runtime, 1, 5)).toBe(0x1fc);
    HS_ShowOrHideScrollArrows(runtime, 0, 1);
    expect(getHelpSystemTile(runtime, 28, 3)).toBe(0x1fe);
    HS_ShowOrHideScrollArrows(runtime, 1, 1);
    expect(getHelpSystemTile(runtime, 28, 18)).toBe(0x1fd);
  });

  test('save/restore callbacks, GPU regs, map tiles, and text colors mirror state copying order', () => {
    const runtime = createHelpSystemUtilRuntime();
    runtime.main.vblankCallback = 'vblank';
    runtime.main.hblankCallback = 'hblank';
    runtime.bgCharBlock3[7] = 0xab;
    runtime.textColor = [1, 2, 3];
    SetGpuReg(runtime, REG_OFFSET_DISPCNT, 11);
    SetGpuReg(runtime, REG_OFFSET_BG0CNT, 22);
    SetGpuReg(runtime, REG_OFFSET_BG0HOFS, 33);
    SetGpuReg(runtime, REG_OFFSET_BG0VOFS, 44);
    SetGpuReg(runtime, REG_OFFSET_BLDCNT, 55);

    SaveCallbacks(runtime);
    expect(runtime.main).toEqual({ vblankCallback: null, hblankCallback: null });
    SaveMapGPURegs(runtime);
    SaveMapTiles(runtime);
    SaveMapTextColors(runtime);

    runtime.main = { vblankCallback: 'other', hblankCallback: 'other' };
    runtime.bgCharBlock3[7] = 0;
    runtime.textColor = [9, 9, 9];
    RestoreCallbacks(runtime);
    RestoreMapTiles(runtime);
    RestoreMapTextColors(runtime);
    RestoreGPURegs(runtime);

    expect(runtime.main).toEqual({ vblankCallback: 'vblank', hblankCallback: 'hblank' });
    expect(runtime.bgCharBlock3[7]).toBe(0xab);
    expect(runtime.textColor).toEqual([1, 2, 3]);
    expect(runtime.gpuRegs.get(REG_OFFSET_DISPCNT)).toBe(11);
  });

  test('text parser advances like C for spaces, newlines, placeholders, control clear-to, and keypad icons', () => {
    const runtime = createHelpSystemUtilRuntime();
    runtime.glyphInfo = { width: 6, height: 8 };
    runtime.playerName = ['A'.charCodeAt(0), 'B'.charCodeAt(0), EOS];
    runtime.keypadIconWidth.set(3, 9);
    runtime.keypadIconTileOffset.set(3, 4);

    HelpSystemRenderText(runtime, FONT_NORMAL, 0, [
      'X'.charCodeAt(0),
      CHAR_SPACE,
      PLACEHOLDER_BEGIN,
      PLACEHOLDER_ID_PLAYER,
      CHAR_NEWLINE,
      PLACEHOLDER_BEGIN,
      PLACEHOLDER_ID_STRING_VAR_1,
      EXT_CTRL_CODE_BEGIN,
      EXT_CTRL_CODE_CLEAR_TO,
      80,
      CHAR_KEYPAD_ICON,
      3,
      EOS
    ], 10, 5, 26, 16);

    expect(runtime.operations).toContain('DecompressGlyph_Normal:88');
    expect(runtime.operations).toContain('DecompressGlyph_Normal:65');
    expect(runtime.operations).toContain('DecompressGlyph_Normal:66');
    expect(runtime.operations).toContain('DecompressGlyph_Normal:83');
    expect(runtime.operations).toContain('FillBitmapRect4Bit:52:14:38:12');
    expect(runtime.operations).toContain('BlitKeypadIcon:4:90:14');
  });

  test('panel and print helpers fill the same buffer ranges and use the same text coordinates', () => {
    const runtime = createHelpSystemUtilRuntime();
    HelpSystem_FillPanel1(runtime);
    expect(runtime.gDecompressionBuffer[0]).toBe(0xff);
    expect(runtime.gDecompressionBuffer[0x33ff]).toBe(0xff);
    HelpSystem_PrintTextRightAlign_Row52(runtime, 'AB');
    expect(runtime.printedText.at(-1)).toMatchObject({ fontId: 0, x: 112, y: 2, width: 16, height: 2 });
    HelpSystem_PrintQuestionAndAnswerPair(runtime, 'Q', 'A');
    expect(runtime.gDecompressionBuffer[0]).toBe(0xee);
    expect(runtime.gDecompressionBuffer[1]).toBe(0xee);
    HelpSystem_PrintTopicMouseoverDescription(runtime, 'Desc');
    expect(runtime.gDecompressionBuffer[0x23c0]).toBe(0x11);
    expect(runtime.gDecompressionBuffer[0x23c1]).toBe(0x11);
  });

  test('list menu init clamps maxShowed and prints visible labels plus cursor like C', () => {
    const runtime = createHelpSystemUtilRuntime();
    runtime.fontMaxLetterHeight.set(FONT_NORMAL, 10);
    HelpSystem_InitListMenuController(runtime, menu(3, 7), 0, 1);
    expect(runtime.gHelpSystemListMenu.sub.maxShowed).toBe(3);
    expect(runtime.gHelpSystemListMenu.itemsAbove).toBe(0);
    expect(runtime.gHelpSystemListMenu.cursorPos).toBe(1);
    expect(runtime.gHelpSystemListMenu.state).toBe(0);
    expect(runtime.printedText.some((entry) => entry.text === 'Item0' && entry.x === 10 && entry.y === 3)).toBe(true);
    expect(runtime.printedText.some((entry) => entry.text === '>' && entry.x === 2 && entry.y === 14)).toBe(true);
  });

  test('menu input handles delay, A/B/LR, dpad repeat, return codes, and select sounds', () => {
    const runtime = createHelpSystemUtilRuntime();
    HelpSystem_InitListMenuController(runtime, menu(10, 7), 0, 0);
    HelpSystem_SetInputDelay(runtime, 1);
    expect(HelpSystem_GetMenuInput(runtime)).toBe(-1);
    expect(runtime.sDelayTimer).toBe(0);
    runtime.newKeys = A_BUTTON;
    expect(HelpSystem_GetMenuInput(runtime)).toBe(100);
    expect(runtime.operations).toContain(`PlaySE:${SE_SELECT}`);
    runtime.newKeys = B_BUTTON;
    expect(HelpSystem_GetMenuInput(runtime)).toBe(-2);
    runtime.newKeys = L_BUTTON | R_BUTTON;
    expect(HelpSystem_GetMenuInput(runtime)).toBe(-6);
    runtime.newKeys = 0;
    runtime.repeatedKeys = DPAD_DOWN;
    expect(HelpSystem_GetMenuInput(runtime)).toBe(-5);
    runtime.repeatedKeys = DPAD_UP;
    expect(HelpSystem_GetMenuInput(runtime)).toBe(-4);
    runtime.repeatedKeys = DPAD_RIGHT;
    expect(HelpSystem_GetMenuInput(runtime)).toBe(-5);
  });

  test('cursor midpoint math and redraw branches follow TryMoveCursor1 and MoveCursor exactly', () => {
    const runtime = createHelpSystemUtilRuntime();
    HelpSystem_InitListMenuController(runtime, menu(10, 7), 0, 3);
    expect(TryMoveCursor1(runtime, 0)).toBe(1);
    expect(runtime.gHelpSystemListMenu.cursorPos).toBe(2);
    expect(TryMoveCursor1(runtime, 0)).toBe(1);
    expect(runtime.gHelpSystemListMenu.cursorPos).toBe(1);
    expect(TryMoveCursor1(runtime, 0)).toBe(1);
    expect(runtime.gHelpSystemListMenu.cursorPos).toBe(0);
    expect(TryMoveCursor1(runtime, 0)).toBe(0);
    runtime.gHelpSystemListMenu.itemsAbove = 1;
    runtime.gHelpSystemListMenu.cursorPos = 2;
    expect(TryMoveCursor1(runtime, 0)).toBe(2);
    expect(runtime.gHelpSystemListMenu.itemsAbove).toBe(0);

    runtime.gHelpSystemListMenu.itemsAbove = 0;
    runtime.gHelpSystemListMenu.cursorPos = 4;
    expect(TryMoveCursor1(runtime, 1)).toBe(2);
    expect(runtime.gHelpSystemListMenu.itemsAbove).toBe(1);
    runtime.gHelpSystemListMenu.itemsAbove = 3;
    runtime.gHelpSystemListMenu.cursorPos = 5;
    expect(TryMoveCursor1(runtime, 1)).toBe(1);
    expect(runtime.gHelpSystemListMenu.cursorPos).toBe(6);
    expect(TryMoveCursor1(runtime, 1)).toBe(0);

    runtime.gHelpSystemListMenu.itemsAbove = 0;
    runtime.gHelpSystemListMenu.cursorPos = 0;
    runtime.getHelpSystemMenuLevelResult = 1;
    expect(MoveCursor(runtime, 7, 1)).toBe(false);
    expect(runtime.sDelayTimer).toBe(2);
    expect(runtime.operations).toContain('HelpSystem_PrintTopicLabel');
  });

  test('scroll arrow updater hides both first, then shows bottom/top/both according to C branches', () => {
    const runtime = createHelpSystemUtilRuntime();
    HelpSystem_InitListMenuController(runtime, menu(10, 7), 0, 0);
    HS_UpdateMenuScrollArrows(runtime);
    expect(getHelpSystemTile(runtime, 28, 18)).toBe(0x1fd);
    runtime.gHelpSystemListMenu.itemsAbove = 3;
    runtime.gHelpSystemListMenu.cursorPos = 0;
    HS_UpdateMenuScrollArrows(runtime);
    expect(getHelpSystemTile(runtime, 28, 3)).toBe(0x1fe);
    runtime.gHelpSystemListMenu.itemsAbove = 1;
    runtime.gHelpSystemListMenu.cursorPos = 3;
    HS_UpdateMenuScrollArrows(runtime);
    expect(getHelpSystemTile(runtime, 28, 3)).toBe(0x1fe);
    expect(getHelpSystemTile(runtime, 28, 18)).toBe(0x1fd);
  });

  test('RunHelpSystemCallback preserves open, setup, running, and restore state transitions', () => {
    const runtime = createHelpSystemUtilRuntime();
    runtime.optionsButtonMode = OPTIONS_BUTTON_MODE_HELP;
    runtime.gHelpSystemEnabled = true;
    runtime.newKeys = R_BUTTON;
    expect(RunHelpSystemCallback(runtime)).toBe(1);
    expect(runtime.sInHelpSystem).toBe(true);
    expect(runtime.operations).toContain('m4aMPlayVolumeControl:BGM:0x80');
    runtime.newKeys = 0;
    expect(RunHelpSystemCallback(runtime)).toBe(2);
    expect(RunHelpSystemCallback(runtime)).toBe(3);
    expect(RunHelpSystemCallback(runtime)).toBe(4);
    expect(runtime.operations).toContain('HelpSystemSubroutine_WelcomeEndGotoMenu');
    expect(RunHelpSystemCallback(runtime)).toBe(5);
    runtime.runHelpMenuSubroutineResult = true;
    expect(RunHelpSystemCallback(runtime)).toBe(5);
    runtime.runHelpMenuSubroutineResult = false;
    expect(RunHelpSystemCallback(runtime)).toBe(6);
    expect(RunHelpSystemCallback(runtime)).toBe(7);
    expect(RunHelpSystemCallback(runtime)).toBe(8);
    expect(RunHelpSystemCallback(runtime)).toBe(0);
    expect(runtime.sInHelpSystem).toBe(false);

    const blocked = createHelpSystemUtilRuntime();
    blocked.gHelpSystemEnabled = true;
    blocked.gHelpSystemToggleWithRButtonDisabled = true;
    blocked.newKeys = R_BUTTON;
    expect(RunHelpSystemCallback(blocked)).toBe(0);
    blocked.newKeys = L_BUTTON;
    blocked.helpSystemIsSinglePlayerResult = false;
    expect(RunHelpSystemCallback(blocked)).toBe(0);
    expect(blocked.operations).toContain('PlaySE:SE_HELP_ERROR');
  });

  test('font attribute helper returns C-style max letter heights', () => {
    const runtime = createHelpSystemUtilRuntime();
    runtime.fontMaxLetterHeight.set(FONT_NORMAL, 12);
    expect(GetFontAttribute(runtime, FONT_NORMAL, FONTATTR_MAX_LETTER_HEIGHT)).toBe(12);
  });
});
