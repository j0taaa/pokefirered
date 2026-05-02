import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  BlitMenuInfoIcon,
  ChangeListMenuCoords,
  ChangeListMenuPals,
  COPYWIN_GFX,
  COPYWIN_MAP,
  DPAD_DOWN,
  DPAD_RIGHT,
  DoMysteryGiftListMenu,
  L_BUTTON,
  LIST_MENU_C_TRANSLATION_UNIT,
  LISTFIELD_CURSORPAL,
  LISTFIELD_FILLVALUE,
  LISTFIELD_MAXSHOWED,
  LISTFIELD_MOVECURSORFUNC,
  LISTFIELD_WINDOWID,
  LIST_CANCEL,
  LIST_HEADER,
  LIST_MULTIPLE_SCROLL_DPAD,
  LIST_MULTIPLE_SCROLL_L_R,
  LIST_NOTHING_CHOSEN,
  ListMenuChangeSelection,
  ListMenuGetCurrentItemArrayId,
  ListMenuGetScrollAndRow,
  ListMenuGetTemplateField,
  ListMenuGetYCoordForPrintingArrowCursor,
  ListMenuInit,
  ListMenuInitInRect,
  ListMenuLoadStdPalAt,
  ListMenuOverrideSetColors,
  ListMenuPrint,
  ListMenuSetTemplateField,
  ListMenuScroll,
  ListMenuTestInput,
  ListMenuUpdateSelectedRowIndexAndScrollOffset,
  ListMenuDefaultCursorMoveFunc,
  ListMenuDummyTask,
  ListMenu_DrawMonIconGraphics,
  ListMenu_LoadMonIconPalette,
  ListMenu_ProcessInput,
  MENU_INFO_ICON_CAUGHT,
  MENU_INFO_ICON_POWER,
  PLTT_SIZE_4BPP,
  RedrawListMenu,
  SE_SELECT,
  TYPE_ROCK,
  createListMenuRuntime,
  createListMenuTemplate,
  DestroyListMenuTask
} from '../src/game/decompListMenu';

const items = [
  { label: 'HEADER', index: LIST_HEADER },
  { label: 'ONE', index: 1 },
  { label: 'TWO', index: 2 },
  { label: 'HEADER2', index: LIST_HEADER },
  { label: 'THREE', index: 3 },
  { label: 'FOUR', index: 4 }
];

describe('decomp list_menu.c parity', () => {
  test('exports exact list_menu.c dummy task as a no-op', () => {
    expect(LIST_MENU_C_TRANSLATION_UNIT).toBe('src/list_menu.c');
    const runtime = createListMenuRuntime();
    runtime.operations.push('before');
    ListMenuDummyTask(runtime, 3);
    expect(runtime.operations).toEqual(['before']);
    expect(runtime.tasks).toEqual([]);
  });

  test('ListMenuInit clamps maxShowed, stores override defaults, prints entries/cursor, and calls selection callback on init', () => {
    const runtime = createListMenuRuntime();
    runtime.windows.set(7, { left: 2, top: 3, width: 12, height: 8, removed: false });
    const template = createListMenuTemplate(items, {
      windowId: 7,
      maxShowed: 9,
      item_X: 9,
      header_X: 1,
      cursor_X: 0,
      upText_Y: 2,
      cursorPal: 4,
      fillValue: 5,
      cursorShadowPal: 6,
      itemVerticalPadding: 1
    });

    const taskId = ListMenuInit(runtime, template, 0, 1);
    const list = runtime.tasks[taskId]!.data;

    expect(list.template.maxShowed).toBe(items.length);
    expect(runtime.gListMenuOverride).toMatchObject({ cursorPal: 4, fillValue: 5, cursorShadowPal: 6, enabled: false });
    expect(runtime.operations).toContain(`FillWindowPixelBuffer:7:5`);
    expect(runtime.operations).toContain(`PutWindowTilemap:7`);
    expect(runtime.operations).toContain(`CopyWindowToVram:7:${COPYWIN_GFX}`);
    expect(runtime.textPrints.map((print) => print.text).slice(0, 3)).toEqual(['HEADER', 'ONE', 'TWO']);
    expect(runtime.textPrints.some((print) => print.text === '▶')).toBe(true);
    expect(runtime.selectionCallbacks[0]).toEqual({ itemIndex: 1, onInit: true });
  });

  test('ListMenu_ProcessInput returns selected/cancel and routes dpad plus multiple-scroll keys', () => {
    const runtime = createListMenuRuntime();
    runtime.windows.set(0, { left: 0, top: 0, width: 10, height: 8, removed: false });
    const template = createListMenuTemplate(items, { maxShowed: 3, scrollMultiple: LIST_MULTIPLE_SCROLL_DPAD });
    const taskId = ListMenuInit(runtime, template, 0, 1);

    runtime.joyNew = A_BUTTON;
    expect(ListMenu_ProcessInput(runtime, taskId)).toBe(1);

    runtime.joyNew = B_BUTTON;
    expect(ListMenu_ProcessInput(runtime, taskId)).toBe(LIST_CANCEL);

    runtime.joyNew = 0;
    runtime.newAndRepeatedKeys = DPAD_DOWN;
    expect(ListMenu_ProcessInput(runtime, taskId)).toBe(LIST_NOTHING_CHOSEN);
    expect(ListMenuGetScrollAndRow(runtime, taskId)).toEqual({ cursorPos: 0, itemsAbove: 2 });

    runtime.newAndRepeatedKeys = DPAD_RIGHT;
    ListMenu_ProcessInput(runtime, taskId);
    expect(ListMenuGetCurrentItemArrayId(runtime, taskId)).toBe(5);

    const lr = createListMenuRuntime();
    lr.windows.set(0, { left: 0, top: 0, width: 10, height: 8, removed: false });
    const lrTask = ListMenuInit(lr, createListMenuTemplate(items, { maxShowed: 3, scrollMultiple: LIST_MULTIPLE_SCROLL_L_R }), 1, 1);
    lr.newAndRepeatedKeys = L_BUTTON;
    ListMenu_ProcessInput(lr, lrTask);
    expect(ListMenuGetScrollAndRow(lr, lrTask).itemsAbove).toBeLessThanOrEqual(1);
  });

  test('ListMenuUpdateSelectedRowIndexAndScrollOffset preserves FireRed return codes around headers and edges', () => {
    const runtime = createListMenuRuntime();
    const taskId = ListMenuInit(runtime, createListMenuTemplate(items, { maxShowed: 3 }), 0, 1);
    const list = runtime.tasks[taskId]!.data;

    expect(ListMenuUpdateSelectedRowIndexAndScrollOffset(list, true)).toBe(1);
    expect(list.itemsAbove).toBe(2);
    expect(ListMenuUpdateSelectedRowIndexAndScrollOffset(list, true)).toBe(2);
    expect(list.cursorPos).toBe(1);
    expect(list.itemsAbove).toBe(2);

    list.cursorPos = 0;
    list.itemsAbove = 0;
    expect(ListMenuUpdateSelectedRowIndexAndScrollOffset(list, false)).toBe(0);
  });

  test('ListMenuChangeSelection erases cursor, skips headers, scrolls when ret includes 2, and returns true only for no movement', () => {
    const runtime = createListMenuRuntime();
    runtime.windows.set(0, { left: 0, top: 0, width: 10, height: 8, removed: false });
    const taskId = ListMenuInit(runtime, createListMenuTemplate(items, { maxShowed: 3, cursorKind: 0 }), 0, 1);
    const list = runtime.tasks[taskId]!.data;

    expect(ListMenuChangeSelection(runtime, list, true, 1, true)).toBe(false);
    expect(list.itemsAbove).toBe(2);
    expect(runtime.operations.some((operation) => operation.startsWith('FillWindowPixelRect'))).toBe(true);
    expect(runtime.selectionCallbacks.at(-1)).toEqual({ itemIndex: 2, onInit: false });

    expect(ListMenuChangeSelection(runtime, list, true, 2, true)).toBe(false);
    ListMenuScroll(runtime, list, 1, true);
    expect(runtime.operations.some((operation) => operation.startsWith('ScrollWindow'))).toBe(true);

    list.cursorPos = 0;
    list.itemsAbove = 0;
    expect(ListMenuChangeSelection(runtime, list, true, 1, false)).toBe(true);
  });

  test('cursor object kinds create/update/remove object cursor state with C coordinates', () => {
    const runtime = createListMenuRuntime();
    runtime.windows.set(3, { left: 4, top: 5, width: 9, height: 7, removed: false });
    const taskId = ListMenuInit(runtime, createListMenuTemplate(items, { windowId: 3, maxShowed: 3, cursorKind: 2, upText_Y: 2 }), 0, 1);
    const list = runtime.tasks[taskId]!.data;
    const cursor = runtime.cursorObjects.get(list.taskId)!;

    expect(cursor.rowWidth).toBe(9 * 8 + 2);
    expect(cursor.rowHeight).toBe(14);
    expect(cursor.x).toBe(31);
    expect(cursor.y).toBe(53);
    expect(cursor.priority).toBe(0);

    const out: { cursorPos?: number; itemsAbove?: number } = {};
    DestroyListMenuTask(runtime, taskId, out);
    expect(out).toEqual({ cursorPos: 0, itemsAbove: 1 });
    expect(runtime.cursorObjects.get(list.taskId)?.removed).toBe(true);
    expect(runtime.tasks[taskId]).toBeNull();
  });

  test('Mystery Gift list menu follows state 0 setup, state 1 selection cleanup, and state 2 teardown', () => {
    const runtime = createListMenuRuntime();
    const template = createListMenuTemplate([{ label: 'Gift', index: 42 }], { maxShowed: 1 });

    expect(DoMysteryGiftListMenu(runtime, { id: 5, width: 8, height: 4 }, template, 2, 100, 32)).toBe(LIST_NOTHING_CHOSEN);
    expect(runtime.mysteryGiftLinkMenu.state).toBe(1);
    expect(runtime.operations).toContain('LoadUserWindowGfx:5:100:32');
    expect(runtime.operations).toContain('DrawTextBorderOuter:5:100:2');

    runtime.joyNew = A_BUTTON;
    expect(DoMysteryGiftListMenu(runtime, {}, template, 2, 100, 32)).toBe(LIST_NOTHING_CHOSEN);
    expect(runtime.mysteryGiftLinkMenu.currItemId).toBe(42);
    expect(runtime.operations).toContain('ClearStdWindowAndFrame:5:false');
    expect(runtime.operations).toContain(`CopyWindowToVram:5:${COPYWIN_MAP}`);

    runtime.joyNew = 0;
    expect(DoMysteryGiftListMenu(runtime, {}, template, 2, 100, 32)).toBe(42);
    expect(runtime.mysteryGiftLinkMenu.state).toBe(0);
    expect(runtime.windows.get(5)?.removed).toBe(true);

    const cancel = createListMenuRuntime();
    DoMysteryGiftListMenu(cancel, { id: 6 }, template, 0, 0, 0);
    cancel.joyNew = B_BUTTON;
    DoMysteryGiftListMenu(cancel, {}, template, 0, 0, 0);
    expect(cancel.mysteryGiftLinkMenu.currItemId).toBe(LIST_CANCEL);
    expect(cancel.operations).toContain('ClearWindowTilemap:6');
  });

  test('rect init, redraw, test input, y coord, palette/coords, override print, and template fields mirror helpers', () => {
    const runtime = createListMenuRuntime();
    runtime.windows.set(2, { left: 1, top: 2, width: 8, height: 6, removed: false });
    const template = createListMenuTemplate(items, { windowId: 2, maxShowed: 3, upText_Y: 1, itemVerticalPadding: 2 });
    const taskId = ListMenuInitInRect(runtime, template, [{ x: 1, y: 2, width: 3, height: 4, palNum: 5 }, { x: 0, y: 0, width: 0, height: 0, palNum: 0xff }], 0, 1);

    expect(runtime.operations).toContain('PutWindowRectTilemapOverridePalette:2:1:2:3:4:5');
    expect(ListMenuGetYCoordForPrintingArrowCursor(runtime, taskId)).toBe(15);
    expect(ListMenuTestInput(runtime, template, 0, 1, DPAD_DOWN)).toMatchObject({ result: LIST_NOTHING_CHOSEN, itemsAbove: 2 });

    ChangeListMenuPals(runtime, taskId, 7, 8, 9);
    expect(ListMenuGetTemplateField(runtime, taskId, LISTFIELD_CURSORPAL)).toBe(7);
    expect(ListMenuGetTemplateField(runtime, taskId, LISTFIELD_FILLVALUE)).toBe(8);
    ChangeListMenuCoords(runtime, taskId, 6, 7);
    expect(runtime.windows.get(2)).toMatchObject({ left: 6, top: 7 });

    ListMenuSetTemplateField(runtime, taskId, LISTFIELD_MAXSHOWED, 2);
    ListMenuSetTemplateField(runtime, taskId, LISTFIELD_WINDOWID, 2);
    expect(ListMenuGetTemplateField(runtime, taskId, LISTFIELD_MAXSHOWED)).toBe(2);
    const fn = () => {};
    ListMenuSetTemplateField(runtime, taskId, LISTFIELD_MOVECURSORFUNC, fn);
    expect(ListMenuGetTemplateField(runtime, taskId, LISTFIELD_MOVECURSORFUNC)).toBe(fn);

    RedrawListMenu(runtime, taskId);
    expect(runtime.operations.at(-1)).toBe(`CopyWindowToVram:2:${COPYWIN_GFX}`);

    ListMenuOverrideSetColors(runtime, 1, 2, 3);
    ListMenuPrint(runtime, runtime.tasks[taskId]!.data, 'OVERRIDE', 4, 5);
    expect(runtime.textPrints.at(-1)).toMatchObject({ text: 'OVERRIDE', colors: [2, 1, 3] });
    expect(runtime.gListMenuOverride.enabled).toBe(false);
  });

  test('default cursor sound, icon palette/graphics, standard palettes, and menu info icon blits preserve side effects', () => {
    const runtime = createListMenuRuntime();

    ListMenuDefaultCursorMoveFunc(runtime, 1, true);
    expect(runtime.lastSound).toBeNull();
    ListMenuDefaultCursorMoveFunc(runtime, 1, false);
    expect(runtime.lastSound).toBe(SE_SELECT);

    ListMenu_LoadMonIconPalette(runtime, 48, 25);
    expect(runtime.loadedPalettes.at(-1)).toEqual({ source: 'MonIconPalette:25', palOffset: 48, size: PLTT_SIZE_4BPP });
    ListMenu_DrawMonIconGraphics(runtime, 3, 25, 1234, 8, 9);
    expect(runtime.blits.at(-1)).toMatchObject({ kind: 'bitmap', windowId: 3, source: 'MonIcon:25:1234:1', width: 32, height: 32 });
    ListMenuLoadStdPalAt(runtime, 80, 1);
    expect(runtime.loadedPalettes.at(-1)?.source).toBe('gMenuInfoElements2_Pal');
    BlitMenuInfoIcon(runtime, 4, TYPE_ROCK + 1, 10, 11);
    expect(runtime.blits.at(-1)).toMatchObject({ kind: 'bitmapRect', source: `gMenuInfoElements_Gfx:${0x44 * 32}`, width: 32, height: 12 });
    BlitMenuInfoIcon(runtime, 4, MENU_INFO_ICON_POWER, 12, 13);
    expect(runtime.blits.at(-1)).toMatchObject({ width: 40, height: 12 });
    BlitMenuInfoIcon(runtime, 4, MENU_INFO_ICON_CAUGHT, 1, 2);
    expect(runtime.blits.at(-1)).toMatchObject({ width: 12, height: 12 });
  });
});
