import { describe, expect, test } from 'vitest';
import {
  AddTextPrinterDiffStyle,
  AddTextPrinterForMessage,
  AddTextPrinterParameterized2,
  AddTextPrinterWithCustomSpeedForMessage,
  ClearDialogWindowAndFrame,
  ClearScheduledBgCopiesToVram,
  ClearStdWindowAndFrame,
  CopyDecompressedTileDataToVram,
  CopyToBufferFromBgTilemap,
  CreateStartMenuWindow,
  DLG_WINDOW_BASE_TILE_NUM,
  DLG_WINDOW_PALETTE_NUM,
  DecompressAndCopyTileDataToVram,
  DecompressAndCopyTileDataToVram2,
  DecompressAndLoadBgGfxUsingHeap,
  DecompressAndLoadBgGfxUsingHeap2,
  DestroyHelpMessageWindow_,
  DisplayItemMessageOnField,
  DisplayYesNoMenuDefaultNo,
  DisplayYesNoMenuDefaultYes,
  DoScheduledBgTilemapCopiesToVram,
  DrawDialogueFrame,
  DrawHelpMessageWindowWithText,
  DrawStdWindowFrame,
  EraseFieldMessageBox,
  FONTATTR_COLOR_SHADOW,
  FONTATTR_LETTER_SPACING,
  FONTATTR_LINE_SPACING,
  FONTATTR_MAX_LETTER_HEIGHT,
  FONTATTR_MAX_LETTER_WIDTH,
  FONT_BRAILLE,
  FONT_FEMALE,
  FONT_MALE,
  FONT_NORMAL,
  FONT_SMALL,
  FreeAllOverworldWindowBuffers,
  FreeTempTileDataBuffersIfPossible,
  GetDlgWindowBaseTileNum,
  GetFontAttribute,
  GetMenuCursorDimensionByFont,
  GetStartMenuWindowId,
  GetStdMenuPalette,
  GetStdPalColor,
  GetStdWindowBaseTileNum,
  GetTextSpeedSetting,
  InitStandardTextBoxWindows,
  InitTextBoxGfxAndPrinters,
  LoadMessageBoxAndFrameGfx,
  LoadSignpostWindowFrameGfx,
  LoadStdWindowFrameGfx,
  Menu_LoadStdPal,
  Menu_LoadStdPalAt,
  NPC_TEXT_COLOR_FEMALE,
  NPC_TEXT_COLOR_MALE,
  OPTIONS_TEXT_SPEED_FAST,
  OPTIONS_TEXT_SPEED_MID,
  QL_STATE_PLAYBACK,
  RemoveStartMenuWindow,
  ResetBgPositions,
  ResetTempTileDataBuffers,
  RunTextPrinters_CheckPrinter0Active,
  ScheduleBgCopyTilemapToVram,
  SetBgTilemapPalette,
  SetDefaultFontsPointer,
  SetStdWindowBorderStyle,
  STD_WINDOW_BASE_TILE_NUM,
  STD_WINDOW_PALETTE_NUM,
  TEXT_COLOR_BLUE,
  TEXT_COLOR_DARK_GRAY,
  TEXT_COLOR_LIGHT_GRAY,
  TEXT_COLOR_RED,
  TEXT_COLOR_WHITE,
  TaskFreeBufAfterCopyingTileDataToVram,
  WindowFunc_ClearDialogWindowAndFrame,
  WindowFunc_ClearStdWindowAndFrame,
  WindowFunc_DrawDialogueFrame,
  WindowFunc_DrawStandardFrame,
  createNewMenuRuntime
} from '../src/game/decompNewMenuHelpers';

const compressed = (size: number): number[] => [0x10, size & 0xff, (size >> 8) & 0xff, (size >> 16) & 0xff, 1, 2, 3];

describe('decomp new_menu_helpers.c parity', () => {
  test('scheduled bg copies are independent slots and clear after copy in 0..3 order', () => {
    const runtime = createNewMenuRuntime();
    runtime.scheduledBgCopiesToVram = [true, true, true, true];
    ClearScheduledBgCopiesToVram(runtime);
    expect(runtime.scheduledBgCopiesToVram).toEqual([false, false, false, false]);

    ScheduleBgCopyTilemapToVram(runtime, 2);
    ScheduleBgCopyTilemapToVram(runtime, 0);
    expect(runtime.scheduledBgCopiesToVram).toEqual([true, false, true, false]);
    runtime.operations = [];
    DoScheduledBgTilemapCopiesToVram(runtime);
    expect(runtime.operations).toEqual(['CopyBgTilemapBufferToVram:0', 'CopyBgTilemapBufferToVram:2']);
    expect(runtime.scheduledBgCopiesToVram).toEqual([false, false, false, false]);
  });

  test('temp tile buffers reset/free only when DMA manager is idle', () => {
    const runtime = createNewMenuRuntime();
    const ptr = DecompressAndCopyTileDataToVram(runtime, 1, compressed(12), 0, 4, 0)!;
    expect(ptr.sizeOut).toBe(12);
    expect(runtime.tileCopies[0]).toMatchObject({ kind: 'tiles', bgId: 1, size: 12, offset: 4 });
    expect(runtime.tempTileDataBufferCursor).toBe(1);

    runtime.dma3Busy = true;
    expect(FreeTempTileDataBuffersIfPossible(runtime)).toBe(true);
    expect(ptr.freed).toBe(false);
    runtime.dma3Busy = false;
    expect(FreeTempTileDataBuffersIfPossible(runtime)).toBe(false);
    expect(ptr.freed).toBe(true);
    expect(runtime.tempTileDataBufferCursor).toBe(0);

    runtime.tempTileDataBuffers[0] = ptr;
    runtime.tempTileDataBufferCursor = 1;
    ResetTempTileDataBuffers(runtime);
    expect(runtime.tempTileDataBuffers.every((buf) => buf === null)).toBe(true);
    expect(runtime.tempTileDataBufferCursor).toBe(0);
  });

  test('decompress variants size and mode exactly like C, including heap task delayed free', () => {
    const runtime = createNewMenuRuntime();
    const ptr = DecompressAndCopyTileDataToVram2(runtime, 2, compressed(80), 32, 9, 1)!;
    expect(runtime.tileCopies.at(-1)).toMatchObject({ kind: 'tilemap', bgId: 2, size: 32, offset: 9 });

    expect(CopyDecompressedTileDataToVram(runtime, 3, ptr, 7, 11, 0)).toBe(runtime.tileCopies.at(-1)!.requestId);
    expect(runtime.tileCopies.at(-1)).toMatchObject({ kind: 'tiles', bgId: 3, size: 7, offset: 11 });

    const taskId = DecompressAndLoadBgGfxUsingHeap(runtime, 0, compressed(21), 0, 5, 0)!;
    expect(runtime.tasks[taskId]?.data[0]).toBeGreaterThan(0);
    runtime.waitDmaBusyRequests.add(runtime.tasks[taskId]!.data[0]);
    TaskFreeBufAfterCopyingTileDataToVram(runtime, taskId);
    expect(runtime.tasks[taskId]).not.toBeNull();
    runtime.waitDmaBusyRequests.clear();
    const taskPtr = runtime.tasks[taskId]!.wordArgs[1];
    TaskFreeBufAfterCopyingTileDataToVram(runtime, taskId);
    expect(taskPtr.freed).toBe(true);
    expect(runtime.tasks[taskId]).toBeNull();

    const taskId2 = DecompressAndLoadBgGfxUsingHeap2(runtime, 1, compressed(100), 40, 6, 1)!;
    expect(runtime.tileCopies.find((copy) => copy.requestId === runtime.tasks[taskId2]?.data[0])).toMatchObject({ kind: 'tilemap', size: 40 });
  });

  test('tilemap palette/copy and bg position reset follow nested loop order', () => {
    const runtime = createNewMenuRuntime();
    runtime.bgTilemapBuffers[1]![2 * 32 + 3] = 0xf123;
    runtime.bgTilemapBuffers[1]![2 * 32 + 4] = 0x0456;
    runtime.bgTilemapBuffers[1]![3 * 32 + 3] = 0x0abc;
    SetBgTilemapPalette(runtime, 1, 3, 2, 2, 2, 9);
    expect(runtime.bgTilemapBuffers[1]![2 * 32 + 3]).toBe(0x9123);
    expect(runtime.bgTilemapBuffers[1]![2 * 32 + 4]).toBe(0x9456);
    expect(CopyToBufferFromBgTilemap(runtime, 1, 3, 2, 2, 2)).toEqual([0x9123, 0x9456, 0x9abc, 0x9000]);

    ResetBgPositions(runtime);
    expect(runtime.operations.filter((op) => op.startsWith('ChangeBgX'))).toHaveLength(4);
    expect(runtime.operations.filter((op) => op.startsWith('ChangeBgY'))).toHaveLength(4);
  });

  test('window/text initialization and printers preserve C defaults and text speed correction', () => {
    const runtime = createNewMenuRuntime();
    InitStandardTextBoxWindows(runtime);
    expect(runtime.startMenuWindowId).toBe(0xff);
    expect(runtime.operations).toContain('InitWindows:1');

    InitTextBoxGfxAndPrinters(runtime);
    expect(runtime.operations).toContain('DeactivateAllTextPrinters');

    runtime.textPrinterActive0 = true;
    expect(RunTextPrinters_CheckPrinter0Active(runtime)).toBe(1);

    runtime.saveBlock2.optionsTextSpeed = 99;
    expect(GetTextSpeedSetting(runtime)).toBe(4);
    expect(runtime.saveBlock2.optionsTextSpeed).toBe(OPTIONS_TEXT_SPEED_MID);
    runtime.saveBlock2.optionsTextSpeed = OPTIONS_TEXT_SPEED_FAST;
    expect(GetTextSpeedSetting(runtime)).toBe(1);
    expect(GetStdMenuPalette()).toBe('gStandardMenuPalette');

    const printerId = AddTextPrinterParameterized2(runtime, 4, FONT_SMALL, 'Hello', 8, 'cb', 7, 8, 9);
    expect(printerId).toBe(runtime.printers.length - 1);
    expect(runtime.printers.at(-1)?.template).toMatchObject({ currentChar: 'Hello', windowId: 4, x: 0, y: 1, letterSpacing: 1, fgColor: 7, bgColor: 8, shadowColor: 9 });
    expect(runtime.textFlags.useAlternateDownArrow).toBe(0);
  });

  test('message text printer helpers choose male/female/neutral fonts and colors', () => {
    const runtime = createNewMenuRuntime();
    runtime.stringVar4 = 'NPC';
    runtime.npcTextColor = NPC_TEXT_COLOR_MALE;
    AddTextPrinterDiffStyle(runtime, true);
    expect(runtime.textFlags.canABSpeedUpPrint).toBe(true);
    expect(runtime.printers.at(-1)?.template).toMatchObject({ fontId: FONT_MALE, fgColor: TEXT_COLOR_BLUE, bgColor: TEXT_COLOR_WHITE, shadowColor: TEXT_COLOR_LIGHT_GRAY });

    runtime.npcTextColor = NPC_TEXT_COLOR_FEMALE;
    AddTextPrinterDiffStyle(runtime, false);
    expect(runtime.printers.at(-1)?.template).toMatchObject({ fontId: FONT_FEMALE, fgColor: TEXT_COLOR_RED });

    AddTextPrinterForMessage(runtime, true);
    expect(runtime.printers.at(-1)?.template).toMatchObject({ fontId: FONT_NORMAL, fgColor: TEXT_COLOR_DARK_GRAY });
    AddTextPrinterWithCustomSpeedForMessage(runtime, false, 17);
    expect(runtime.printers.at(-1)?.speed).toBe(17);
  });

  test('LoadStdWindowFrameGfx and frame wrappers branch for quest log playback and copy flags', () => {
    const runtime = createNewMenuRuntime();
    LoadStdWindowFrameGfx(runtime);
    expect(runtime.palettes.at(-1)).toMatchObject({ source: 'gStandardMenuPalette', offset: STD_WINDOW_PALETTE_NUM * 16, size: 20 });
    expect(runtime.operations).toContain(`LoadMenuMessageWindowGfx:0:${DLG_WINDOW_BASE_TILE_NUM}:${DLG_WINDOW_PALETTE_NUM * 16}`);

    const ql = createNewMenuRuntime();
    ql.questLogState = QL_STATE_PLAYBACK;
    LoadStdWindowFrameGfx(ql);
    expect(ql.textFlags.autoScroll).toBe(1);
    expect(ql.operations).toContain(`LoadQuestLogWindowTiles:0:${DLG_WINDOW_BASE_TILE_NUM}`);

    runtime.windows.set(1, { bg: 0, tilemapLeft: 4, tilemapTop: 5, width: 6, height: 3, paletteNum: 9, baseBlock: 0 });
    DrawStdWindowFrame(runtime, 1, true);
    expect(runtime.operations).toContain('FillBgTilemapBufferRect:0:532:3:4:1:1:14');
    expect(runtime.operations).toContain('CopyWindowToVram:1:3');
    DrawDialogueFrame(runtime, 1, false);
    expect(runtime.operations.some((op) => op.includes(`${DLG_WINDOW_BASE_TILE_NUM}:2:4:1:1:15`))).toBe(true);

    ql.windows.set(1, { bg: 0, tilemapLeft: 4, tilemapTop: 5, width: 6, height: 3, paletteNum: 9, baseBlock: 0 });
    ClearDialogWindowAndFrame(ql, 1, true);
    expect(ql.operations).toContain('CommitQuestLogWindow1');
    ClearStdWindowAndFrame(runtime, 1, false);
    expect(runtime.operations).toContain('ClearWindowTilemap:1');
  });

  test('raw window funcs emit standard/dialog/signpost/clear tile fill patterns', () => {
    const runtime = createNewMenuRuntime();
    WindowFunc_DrawStandardFrame(runtime, 0, 2, 3, 4, 2);
    expect(runtime.operations[0]).toBe(`FillBgTilemapBufferRect:0:${STD_WINDOW_BASE_TILE_NUM}:1:2:1:1:${STD_WINDOW_PALETTE_NUM}`);
    expect(runtime.operations).toContain(`FillBgTilemapBufferRect:0:${STD_WINDOW_BASE_TILE_NUM + 8}:6:5:1:1:${STD_WINDOW_PALETTE_NUM}`);

    const dialog = createNewMenuRuntime();
    WindowFunc_DrawDialogueFrame(dialog, 0, 4, 6, 5, 4);
    expect(dialog.operations).toHaveLength(26);
    expect(dialog.operations[13]).toContain(`${DLG_WINDOW_BASE_TILE_NUM + 0x400 + 10}`);

    const sign = createNewMenuRuntime();
    sign.signpost = true;
    WindowFunc_DrawDialogueFrame(sign, 0, 4, 6, 5, 4);
    expect(sign.operations[13]).toContain(`${DLG_WINDOW_BASE_TILE_NUM + 0x400 + 5}`);

    const clear = createNewMenuRuntime();
    WindowFunc_ClearStdWindowAndFrame(clear, 0, 4, 5, 6, 3);
    expect(clear.operations[0]).toBe(`FillBgTilemapBufferRect:0:0:3:4:8:5:${STD_WINDOW_PALETTE_NUM}`);
    WindowFunc_ClearDialogWindowAndFrame(clear, 0, 4, 5, 6, 3);
    expect(clear.operations[1]).toBe(`FillBgTilemapBufferRect:0:0:2:4:10:5:${STD_WINDOW_PALETTE_NUM}`);
  });

  test('misc window/menu helpers preserve side effects, singleton start menu, palettes, font tables, and base tiles', () => {
    const runtime = createNewMenuRuntime();
    EraseFieldMessageBox(runtime, true);
    expect(runtime.operations).toContain('CopyBgTilemapBufferToVram:0');
    SetStdWindowBorderStyle(runtime, 2, true);
    expect(runtime.operations.at(-1)).toBe(`DrawStdFrameWithCustomTileAndPalette:2:true:${STD_WINDOW_BASE_TILE_NUM}:${STD_WINDOW_PALETTE_NUM}`);

    LoadMessageBoxAndFrameGfx(runtime, 3, false);
    expect(runtime.operations).toContain(`DrawDialogFrameWithCustomTileAndPalette:3:false:${DLG_WINDOW_BASE_TILE_NUM}:${DLG_WINDOW_PALETTE_NUM}`);
    Menu_LoadStdPal(runtime);
    Menu_LoadStdPalAt(runtime, 88);
    expect(runtime.palettes.at(-2)).toMatchObject({ offset: STD_WINDOW_PALETTE_NUM * 16 });
    expect(runtime.palettes.at(-1)).toMatchObject({ offset: 88 });
    expect(GetStdPalColor(99)).toBe(0);
    expect(GetStdPalColor(7)).toBe(7);

    DisplayItemMessageOnField(runtime, 9, FONT_NORMAL, 'Item!', 'After');
    expect(runtime.operations.some((op) => op.startsWith('DisplayMessageAndContinueTask:9'))).toBe(true);
    DisplayYesNoMenuDefaultYes(runtime);
    DisplayYesNoMenuDefaultNo(runtime);
    expect(runtime.operations.at(-2)?.endsWith(':0')).toBe(true);
    expect(runtime.operations.at(-1)?.endsWith(':1')).toBe(true);

    InitStandardTextBoxWindows(runtime);
    const first = CreateStartMenuWindow(runtime, 4);
    const second = CreateStartMenuWindow(runtime, 9);
    expect(first).toBe(second);
    expect(GetStartMenuWindowId(runtime)).toBe(first);
    RemoveStartMenuWindow(runtime);
    expect(GetStartMenuWindowId(runtime)).toBe(0xff);

    expect(GetDlgWindowBaseTileNum()).toBe(DLG_WINDOW_BASE_TILE_NUM);
    expect(GetStdWindowBaseTileNum()).toBe(STD_WINDOW_BASE_TILE_NUM);
    DrawHelpMessageWindowWithText(runtime, 'Help');
    DestroyHelpMessageWindow_(runtime);
    LoadSignpostWindowFrameGfx(runtime);
    SetDefaultFontsPointer(runtime);
    expect(runtime.operations).toContain('DestroyHelpMessageWindow:2');
    expect(runtime.operations).toContain('SetFontsPointer:gFontInfos');

    expect(GetFontAttribute(FONT_NORMAL, FONTATTR_MAX_LETTER_WIDTH)).toBe(10);
    expect(GetFontAttribute(FONT_NORMAL, FONTATTR_MAX_LETTER_HEIGHT)).toBe(14);
    expect(GetFontAttribute(FONT_NORMAL, FONTATTR_LETTER_SPACING)).toBe(1);
    expect(GetFontAttribute(FONT_BRAILLE, FONTATTR_LINE_SPACING)).toBe(2);
    expect(GetFontAttribute(FONT_NORMAL, FONTATTR_COLOR_SHADOW)).toBe(3);
    expect(GetMenuCursorDimensionByFont(FONT_BRAILLE, 1)).toBe(16);

    FreeAllOverworldWindowBuffers(runtime);
    expect(runtime.windows.size).toBe(0);
  });
});
