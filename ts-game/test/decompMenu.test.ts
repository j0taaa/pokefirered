import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  AddItemMenuActionTextPrinters,
  B_BUTTON,
  ClearDialogWindowAndFrameToTransparent,
  ClearStdWindowAndFrameToTransparent,
  ClearTopBarWindow,
  COPYWIN_FULL,
  CopyTopBarWindowToVram,
  CreateTopBarWindowLoadPalette,
  CreateWindowTemplate,
  CreateYesNoMenu,
  CreateYesNoMenu2,
  createMenuRuntime,
  DestroyTopBarWindow,
  DestroyYesNoMenu,
  DPAD_DOWN,
  DPAD_LEFT,
  DPAD_RIGHT,
  DPAD_UP,
  DrawDialogFrameWithCustomTile,
  DrawDialogFrameWithCustomTileAndPalette,
  DrawStdFrameWithCustomTile,
  DrawStdFrameWithCustomTileAndPalette,
  FONTATTR_COLOR_BACKGROUND,
  FONTATTR_COLOR_FOREGROUND,
  FONTATTR_COLOR_SHADOW,
  FONTATTR_LINE_SPACING,
  FONT_NORMAL,
  FONT_SMALL,
  GetFontAttribute,
  GetMenuCursorDimensionByFont,
  InitMenuDefaultCursorHeight,
  MENU_B_PRESSED,
  MENU_L_PRESSED,
  MENU_NOTHING_CHOSEN,
  MENU_R_PRESSED,
  Menu_GetCursorPos,
  Menu_InitCursorInternal,
  Menu_MoveCursor,
  Menu_MoveCursorNoWrapAround,
  Menu_RedrawCursor,
  Menu_ProcessGridInput_NoSoundLimit,
  Menu_ProcessGridInputRepeat,
  Menu_ProcessGridInputRepeat_NoSoundLimit,
  Menu_ProcessInput,
  Menu_ProcessInput_other,
  Menu_ProcessInputGridLayout,
  Menu_ProcessInputNoWrapAround,
  Menu_ProcessInputNoWrapAround_other,
  Menu_ProcessInputNoWrapClearOnChoose,
  MultichoiceGrid_InitCursor,
  MultichoiceGrid_MoveCursor,
  MultichoiceGrid_MoveCursorIfValid,
  MultichoiceGrid_PrintItems,
  MultichoiceGrid_PrintItemsCustomOrder,
  MultichoiceGrid_RedrawCursor,
  MultichoiceList_PrintItems,
  PrintMenuActionTextsAtTopById,
  PrintMenuTable,
  PrintTextArray,
  SetWindowTemplateFields,
  TopBarWindowPrintString,
  TopBarWindowPrintTwoStrings
} from '../src/game/decompMenu';

const actions = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((text) => ({ text }));

describe('decomp menu.c parity', () => {
  test('exports exact unused C helpers with original menu behavior', () => {
    const runtime = createMenuRuntime();
    const win = SetWindowTemplateFields(1, 5, 6, 8, 4, 3, 0x20);
    runtime.windows.set(2, win);
    runtime.windowPaletteNums.set(2, 11);

    DrawDialogFrameWithCustomTile(runtime, 2, false, 0x120);
    expect(runtime.sPaletteNum).toBe(11);
    expect(runtime.operations[0]).toBe('FillBgTilemapBufferRect:1:288:3:5:1:1:11');

    runtime.operations = [];
    DrawStdFrameWithCustomTile(runtime, 2, false, 0x130);
    expect(runtime.sPaletteNum).toBe(11);
    expect(runtime.operations[0]).toBe('FillBgTilemapBufferRect:1:304:4:5:1:1:11');

    const topBarId = CreateTopBarWindowLoadPalette(runtime, 0, 6, 1, 4, 0x40);
    runtime.operations = [];
    CopyTopBarWindowToVram(runtime);
    expect(runtime.operations).toEqual([`CopyWindowToVram:${topBarId}:3`]);

    const defaultCursor = InitMenuDefaultCursorHeight(runtime, 7, FONT_NORMAL, 1, 2, 3, 1);
    expect(defaultCursor).toBe(1);
    expect(runtime.sMenu.optionHeight).toBe(12);

    runtime.operations = [];
    Menu_MoveCursor(runtime, 0);
    Menu_RedrawCursor(runtime, 0, 2);
    expect(runtime.operations.at(-1)).toBe('AddTextPrinterParameterized:7:2:>:1:26:0:0');

    runtime.operations = [];
    PrintMenuActionTextsAtTopById(runtime, 4, FONT_NORMAL, 10, 3, actions, [2, 0, 1]);
    expect(runtime.operations[0]).toBe('AddTextPrinter:4:2:Three:8:0:0:0:0:0:0:4:255:NULL');

    const createdWindowId = CreateWindowTemplate(runtime, 2, 3, 4, 5, 6, 7, 8);
    expect(runtime.windows.get(createdWindowId)).toMatchObject({ bg: 2, tilemapLeft: 3, tilemapTop: 4, width: 5, height: 6, paletteNum: 7, baseBlock: 8 });

    const second = createMenuRuntime();
    CreateYesNoMenu2(second, win, FONT_NORMAL, 0x200, 9);
    expect(second.sMenu.cursorPos).toBe(0);
    expect(second.operations[1]).toBe('FillBgTilemapBufferRect:1:512:4:5:1:1:9');
  });

  test('dialog and standard frame helpers emit exact tile fill sequences and copy guards', () => {
    const runtime = createMenuRuntime();
    const win = SetWindowTemplateFields(1, 5, 6, 8, 4, 3, 0x20);
    runtime.windows.set(2, win);
    runtime.windowPaletteNums.set(2, 3);

    DrawDialogFrameWithCustomTileAndPalette(runtime, 2, true, 0x100, 7);
    expect(runtime.operations.slice(0, 5)).toEqual([
      'FillBgTilemapBufferRect:1:256:3:5:1:1:7',
      'FillBgTilemapBufferRect:1:257:4:5:1:1:7',
      'FillBgTilemapBufferRect:1:258:5:5:8:1:7',
      'FillBgTilemapBufferRect:1:259:13:5:1:1:7',
      'FillBgTilemapBufferRect:1:260:14:5:1:1:7'
    ]);
    expect(runtime.operations).toContain('FillBgTilemapBufferRect:1:2304:3:10:1:1:7');
    expect(runtime.operations.at(-1)).toBe(`CopyWindowToVram:2:${COPYWIN_FULL}`);

    runtime.operations = [];
    ClearDialogWindowAndFrameToTransparent(runtime, 2, true);
    expect(runtime.operations).toEqual([
      'FillBgTilemapBufferRect:1:0:3:5:12:6:0',
      'FillWindowPixelBuffer:2:0',
      'ClearWindowTilemap:2',
      'CopyWindowToVram:2:3'
    ]);

    runtime.operations = [];
    DrawStdFrameWithCustomTileAndPalette(runtime, 2, false, 0x1b1, 2);
    expect(runtime.operations.slice(0, 8)).toEqual([
      'FillBgTilemapBufferRect:1:433:4:5:1:1:2',
      'FillBgTilemapBufferRect:1:434:5:5:8:1:2',
      'FillBgTilemapBufferRect:1:435:13:5:1:1:2',
      'FillBgTilemapBufferRect:1:436:4:6:1:4:2',
      'FillBgTilemapBufferRect:1:438:13:6:1:4:2',
      'FillBgTilemapBufferRect:1:439:4:10:1:1:2',
      'FillBgTilemapBufferRect:1:440:5:10:8:1:2',
      'FillBgTilemapBufferRect:1:441:13:10:1:1:2'
    ]);
    expect(runtime.operations).not.toContain('CopyWindowToVram:2:3');

    runtime.operations = [];
    ClearStdWindowAndFrameToTransparent(runtime, 2, true);
    expect(runtime.operations[0]).toBe('FillBgTilemapBufferRect:1:0:4:5:10:6:0');
  });

  test('top bar window clamps bg/palette, right-aligns text, and respects destroyed guard', () => {
    const runtime = createMenuRuntime();
    const id = CreateTopBarWindowLoadPalette(runtime, 5, 10, 4, 99, 0x80);
    expect(id).toBe(0);
    expect(runtime.windows.get(id)).toMatchObject({ bg: 0, tilemapLeft: 20, tilemapTop: 4, width: 10, height: 2, paletteNum: 99, baseBlock: 0x80 });
    expect(runtime.operations).toContain('LoadPalette:GetTextWindowPalette(2):15');

    TopBarWindowPrintString(runtime, 'ABC', 0, true);
    expect(runtime.operations).toContain('AddTextPrinterParameterized3:0:0:-35:1:15,1,2:0:ABC');

    TopBarWindowPrintTwoStrings(runtime, 'LEFT', 'RIGHT', true, 0, true);
    expect(runtime.operations).toContain('AddTextPrinterParameterized3:0:0:-45:1:0,1,2:0:RIGHT');
    expect(runtime.operations).toContain('AddTextPrinterParameterized4:0:3:4:1:0:0:0,1,2:0:LEFT');

    ClearTopBarWindow(runtime);
    expect(runtime.operations).toContain('FillWindowPixelBuffer:0:15');
    DestroyTopBarWindow(runtime);
    expect(runtime.sTopBarWindowId).toBe(0xff);
    const count = runtime.operations.length;
    TopBarWindowPrintString(runtime, 'NOOP', 0, true);
    expect(runtime.operations).toHaveLength(count);
  });

  test('vertical cursor init, wrap, no-wrap, A mute, and input variants match C return codes', () => {
    const runtime = createMenuRuntime();
    Menu_InitCursorInternal(runtime, 4, FONT_NORMAL, 2, 3, 12, 3, 99, true);
    expect(Menu_GetCursorPos(runtime)).toBe(0);
    expect(runtime.operations.at(-1)).toBe('AddTextPrinterParameterized:4:2:>:2:3:0:0');

    expect(Menu_MoveCursor(runtime, -1)).toBe(2);
    expect(Menu_MoveCursor(runtime, 1)).toBe(0);
    expect(Menu_MoveCursorNoWrapAround(runtime, -1)).toBe(0);
    expect(Menu_MoveCursorNoWrapAround(runtime, 9)).toBe(2);

    runtime.newKeys = A_BUTTON;
    expect(Menu_ProcessInput(runtime)).toBe(2);
    expect(runtime.operations.some((op) => op === 'PlaySE:SE_SELECT')).toBe(false);
    runtime.sMenu.APressMuted = false;
    expect(Menu_ProcessInput(runtime)).toBe(2);
    expect(runtime.operations).toContain('PlaySE:SE_SELECT');

    runtime.newKeys = B_BUTTON;
    expect(Menu_ProcessInput(runtime)).toBe(MENU_B_PRESSED);
    runtime.newKeys = DPAD_UP;
    expect(Menu_ProcessInput(runtime)).toBe(MENU_NOTHING_CHOSEN);
    expect(Menu_GetCursorPos(runtime)).toBe(1);
    runtime.newKeys = DPAD_DOWN;
    expect(Menu_ProcessInputNoWrapAround(runtime)).toBe(MENU_NOTHING_CHOSEN);
    expect(Menu_GetCursorPos(runtime)).toBe(2);

    runtime.newKeys = 0;
    runtime.repeatedKeys = DPAD_UP;
    expect(Menu_ProcessInput_other(runtime)).toBe(MENU_NOTHING_CHOSEN);
    runtime.repeatedKeys = DPAD_DOWN;
    expect(Menu_ProcessInputNoWrapAround_other(runtime)).toBe(MENU_NOTHING_CHOSEN);
  });

  test('text-list helpers preserve coordinates, font metrics, order arrays, and vram copies', () => {
    const runtime = createMenuRuntime();
    PrintTextArray(runtime, 1, FONT_NORMAL, 3, 4, 9, 2, actions);
    expect(runtime.operations).toContain('AddTextPrinterParameterized:1:2:One:3:4:255:NULL');
    expect(runtime.operations).toContain('AddTextPrinterParameterized:1:2:Two:3:13:255:NULL');
    expect(runtime.operations.at(-1)).toBe('CopyWindowToVram:1:2');

    runtime.operations = [];
    MultichoiceList_PrintItems(runtime, 1, FONT_NORMAL, 3, 4, 9, 2, actions, 1, 2);
    expect(runtime.operations[0]).toBe('AddTextPrinterParameterized5:1:2:One:3:4:255:NULL:1:2');

    runtime.operations = [];
    PrintMenuTable(runtime, 1, FONT_NORMAL, 9, 2, actions);
    expect(runtime.operations[0]).toBe('AddTextPrinterParameterized:1:2:One:8:0:255:NULL');

    runtime.fontAttributes.set(`${FONT_NORMAL}:${FONTATTR_COLOR_FOREGROUND}`, 6);
    runtime.fontAttributes.set(`${FONT_NORMAL}:${FONTATTR_COLOR_BACKGROUND}`, 7);
    runtime.fontAttributes.set(`${FONT_NORMAL}:${FONTATTR_COLOR_SHADOW}`, 8);
    runtime.fontAttributes.set(`${FONT_NORMAL}:${FONTATTR_LINE_SPACING}`, 4);
    runtime.operations = [];
    AddItemMenuActionTextPrinters(runtime, 2, FONT_NORMAL, 5, 6, 1, 10, 3, actions, [2, 0, 1]);
    expect(runtime.operations[0]).toBe('AddTextPrinter:2:2:Three:5:6:6:7:8:0:1:4:255:NULL');
    expect(runtime.operations[1]).toBe('AddTextPrinter:2:2:One:5:16:6:7:8:0:1:4:255:NULL');
    expect(runtime.operations[2]).toBe('AddTextPrinter:2:2:Two:5:26:6:7:8:0:1:4:255:NULL');
  });

  test('window template and yes/no menu creation/destruction keep global ids and cursor cleanup behavior', () => {
    const runtime = createMenuRuntime();
    const template = SetWindowTemplateFields(0, 1, 2, 6, 4, 15, 0x20);
    CreateYesNoMenu(runtime, template, FONT_NORMAL, 2, 3, 0x100, 4, 1);
    expect(runtime.sYesNoWindowId).toBe(0);
    expect(runtime.operations).toContain('AddTextPrinter:0:2:Yes\nNo:10:3:0:0:0:0:0:4:255:NULL');
    expect(Menu_GetCursorPos(runtime)).toBe(1);

    runtime.newKeys = A_BUTTON;
    expect(Menu_ProcessInputNoWrapClearOnChoose(runtime)).toBe(1);
    expect(runtime.operations).toContain('RemoveWindow:0');
    expect(runtime.sYesNoWindowId).toBe(0xff);

    const second = createMenuRuntime();
    CreateYesNoMenu(second, template, FONT_NORMAL, 2, 3, 0x100, 4, 0);
    DestroyYesNoMenu(second);
    expect(second.operations).toContain('ClearWindowTilemap:0');
    expect(second.operations).toContain('RemoveWindow:0');
  });

  test('multichoice grid printing and cursor movement preserve wrap, invalid, and sound branches', () => {
    const runtime = createMenuRuntime();
    MultichoiceGrid_PrintItems(runtime, 3, FONT_NORMAL, 40, 16, 3, 2, actions);
    expect(runtime.operations[0]).toBe('AddTextPrinterParameterized:3:2:One:8:2:255:0');
    expect(runtime.operations[5]).toBe('AddTextPrinterParameterized:3:2:Six:88:18:255:0');
    expect(runtime.operations.at(-1)).toBe('CopyWindowToVram:3:2');

    MultichoiceGrid_InitCursor(runtime, 3, FONT_NORMAL, 1, 2, 40, 3, 2, 5);
    expect(Menu_GetCursorPos(runtime)).toBe(5);
    expect(MultichoiceGrid_MoveCursor(runtime, 1, 0)).toBe(3);
    expect(MultichoiceGrid_MoveCursor(runtime, -1, 0)).toBe(5);
    expect(MultichoiceGrid_MoveCursor(runtime, 0, 1)).toBe(2);
    expect(MultichoiceGrid_MoveCursor(runtime, 0, -1)).toBe(5);

    runtime.sMenu.maxCursorPos = 4;
    runtime.sMenu.cursorPos = 2;
    expect(MultichoiceGrid_MoveCursor(runtime, 0, 1)).toBe(2);
    expect(MultichoiceGrid_MoveCursorIfValid(runtime, 1, 0)).toBe(2);
    expect(MultichoiceGrid_MoveCursorIfValid(runtime, -1, 0)).toBe(1);

    runtime.newKeys = A_BUTTON;
    expect(Menu_ProcessInputGridLayout(runtime)).toBe(1);
    runtime.newKeys = B_BUTTON;
    expect(Menu_ProcessInputGridLayout(runtime)).toBe(MENU_B_PRESSED);
    runtime.newKeys = DPAD_RIGHT;
    expect(Menu_ProcessInputGridLayout(runtime)).toBe(MENU_NOTHING_CHOSEN);
    expect(Menu_GetCursorPos(runtime)).toBe(2);
    runtime.newKeys = 0;
    runtime.lrKeysPressed = MENU_L_PRESSED;
    expect(Menu_ProcessInputGridLayout(runtime)).toBe(MENU_NOTHING_CHOSEN);
    expect(Menu_GetCursorPos(runtime)).toBe(1);
    runtime.lrKeysPressed = MENU_R_PRESSED;
    expect(Menu_ProcessInputGridLayout(runtime)).toBe(MENU_NOTHING_CHOSEN);
    expect(Menu_GetCursorPos(runtime)).toBe(2);
  });

  test('custom-order grid printing and repeat/no-limit grid input mirror unused C helpers', () => {
    const runtime = createMenuRuntime();
    MultichoiceGrid_PrintItemsCustomOrder(runtime, 5, FONT_NORMAL, 40, 16, 3, 2, actions, [5, 4, 3, 2, 1, 0]);
    expect(runtime.operations[0]).toBe('AddTextPrinterParameterized:5:2:Six:8:0:255:0');
    expect(runtime.operations[5]).toBe('AddTextPrinterParameterized:5:2:One:88:16:255:0');
    expect(runtime.operations.at(-1)).toBe('CopyWindowToVram:5:2');

    MultichoiceGrid_InitCursor(runtime, 5, FONT_NORMAL, 1, 2, 40, 3, 2, 0);
    runtime.operations = [];
    MultichoiceGrid_RedrawCursor(runtime, 0, 4);
    expect(runtime.operations).toEqual([
      'FillWindowPixelRect:5:1:1:2:8:12',
      'AddTextPrinterParameterized:5:2:>:41:18:0:0'
    ]);

    runtime.sMenu.maxCursorPos = 4;
    runtime.sMenu.cursorPos = 2;
    runtime.newKeys = DPAD_DOWN;
    expect(Menu_ProcessGridInput_NoSoundLimit(runtime)).toBe(MENU_NOTHING_CHOSEN);
    expect(Menu_GetCursorPos(runtime)).toBe(2);
    expect(runtime.operations).toContain('PlaySE:SE_SELECT');

    runtime.newKeys = 0;
    runtime.repeatedKeys = DPAD_RIGHT;
    expect(Menu_ProcessGridInputRepeat_NoSoundLimit(runtime)).toBe(MENU_NOTHING_CHOSEN);
    expect(Menu_GetCursorPos(runtime)).toBe(0);

    runtime.repeatedKeys = DPAD_LEFT;
    runtime.operations = [];
    expect(Menu_ProcessGridInputRepeat(runtime)).toBe(MENU_NOTHING_CHOSEN);
    expect(Menu_GetCursorPos(runtime)).toBe(0);
    expect(runtime.operations).not.toContain('PlaySE:SE_SELECT');

    expect(Menu_ProcessGridInputRepeat_NoSoundLimit(runtime)).toBe(MENU_NOTHING_CHOSEN);
    expect(Menu_GetCursorPos(runtime)).toBe(2);
    expect(runtime.operations).toContain('PlaySE:SE_SELECT');

    runtime.sMenu.cursorPos = 0;
    runtime.repeatedKeys = DPAD_LEFT;
    runtime.lrKeysPressedAndHeld = 0;
    runtime.operations = [];
    expect(Menu_ProcessGridInputRepeat(runtime)).toBe(MENU_NOTHING_CHOSEN);
    expect(Menu_GetCursorPos(runtime)).toBe(0);
    expect(runtime.operations).not.toContain('PlaySE:SE_SELECT');
  });

  test('font and cursor dimension helpers expose the same attribute selection', () => {
    const runtime = createMenuRuntime();
    expect(GetFontAttribute(runtime, FONT_SMALL, 0)).toBe(5);
    expect(GetMenuCursorDimensionByFont(runtime, FONT_NORMAL, 0)).toBe(8);
    expect(GetMenuCursorDimensionByFont(runtime, FONT_NORMAL, 1)).toBe(12);
  });
});
