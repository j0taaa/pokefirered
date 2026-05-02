export const LIST_NOTHING_CHOSEN = -1;
export const LIST_CANCEL = -2;
export const LIST_HEADER = -3;
export const LIST_MENU_C_TRANSLATION_UNIT = 'src/list_menu.c';

export const LIST_NO_MULTIPLE_SCROLL = 0;
export const LIST_MULTIPLE_SCROLL_DPAD = 1;
export const LIST_MULTIPLE_SCROLL_L_R = 2;

export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const DPAD_UP = 1 << 6;
export const DPAD_DOWN = 1 << 7;
export const DPAD_LEFT = 1 << 5;
export const DPAD_RIGHT = 1 << 4;
export const L_BUTTON = 1 << 9;
export const R_BUTTON = 1 << 8;

export const TAIL_SENTINEL = 0xff;
export const COPYWIN_GFX = 2;
export const COPYWIN_MAP = 1;
export const TEXT_SKIP_DRAW = 0xff;
export const WINDOW_TILEMAP_LEFT = 'WINDOW_TILEMAP_LEFT';
export const WINDOW_TILEMAP_TOP = 'WINDOW_TILEMAP_TOP';
export const WINDOW_WIDTH = 'WINDOW_WIDTH';
export const WINDOW_HEIGHT = 'WINDOW_HEIGHT';
export const FONTATTR_MAX_LETTER_HEIGHT = 'FONTATTR_MAX_LETTER_HEIGHT';
export const SE_SELECT = 'SE_SELECT';

export const LISTFIELD_MOVECURSORFUNC = 0;
export const LISTFIELD_MOVECURSORFUNC2 = 1;
export const LISTFIELD_TOTALITEMS = 2;
export const LISTFIELD_MAXSHOWED = 3;
export const LISTFIELD_WINDOWID = 4;
export const LISTFIELD_HEADERX = 5;
export const LISTFIELD_ITEMX = 6;
export const LISTFIELD_CURSORX = 7;
export const LISTFIELD_UPTEXTY = 8;
export const LISTFIELD_CURSORPAL = 9;
export const LISTFIELD_FILLVALUE = 10;
export const LISTFIELD_CURSORSHADOWPAL = 11;
export const LISTFIELD_LETTERSPACING = 12;
export const LISTFIELD_ITEMVERTICALPADDING = 13;
export const LISTFIELD_SCROLLMULTIPLE = 14;
export const LISTFIELD_FONTID = 15;
export const LISTFIELD_CURSORKIND = 16;

export const MENU_INFO_ICON_CAUGHT = 0;
export const MENU_INFO_ICON_TYPE = 19;
export const MENU_INFO_ICON_POWER = 20;
export const MENU_INFO_ICON_ACCURACY = 21;
export const MENU_INFO_ICON_PP = 22;
export const MENU_INFO_ICON_EFFECT = 23;
export const TYPE_NORMAL = 0;
export const TYPE_ROCK = 5;
export const PLTT_SIZE_4BPP = 32;
export const TILE_SIZE_4BPP = 32;

export interface ListMenuItem {
  label: string;
  index: number;
}

export interface ListMenuTemplate {
  items: ListMenuItem[];
  moveCursorFunc: ((itemIndex: number, onInit: boolean, list: ListMenu) => void) | null;
  itemPrintFunc: ((windowId: number, itemId: number, y: number) => void) | null;
  totalItems: number;
  maxShowed: number;
  windowId: number;
  header_X: number;
  item_X: number;
  cursor_X: number;
  upText_Y: number;
  cursorPal: number;
  fillValue: number;
  cursorShadowPal: number;
  lettersSpacing: number;
  itemVerticalPadding: number;
  scrollMultiple: number;
  fontId: number;
  cursorKind: number;
}

export interface ListMenu {
  template: ListMenuTemplate;
  cursorPos: number;
  itemsAbove: number;
  unk_1C: number;
  unk_1D: number;
  taskId: number;
  unk_1F: number;
}

export interface ListMenuTask {
  func: 'ListMenuDummyTask' | 'DestroyTask';
  data: ListMenu;
  destroyed: boolean;
}

export interface WindowTemplate {
  id?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

export interface ListMenuWindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
  palNum: number;
}

export interface CursorStruct {
  left: number;
  top: number;
  rowWidth: number;
  rowHeight: number;
  tileTag: number;
  palTag: number;
  palNum: number;
}

export interface ListMenuOverride {
  cursorPal: number;
  fillValue: number;
  cursorShadowPal: number;
  lettersSpacing: number;
  field_2_2: number;
  fontId: number;
  enabled: boolean;
}

export interface MysteryGiftLinkMenuStruct {
  currItemId: number;
  state: number;
  windowId: number;
  listTaskId: number;
}

export interface MoveMenuInfoIcon {
  width: number;
  height: number;
  offset: number;
}

export interface ListMenuRuntime {
  tasks: Array<ListMenuTask | null>;
  windows: Map<number, { left: number; top: number; width: number; height: number; removed: boolean }>;
  nextWindowId: number;
  nextCursorObjectId: number;
  cursorObjects: Map<number, CursorStruct & { kind: number; x: number; y: number; priority: number; removed: boolean }>;
  joyNew: number;
  newAndRepeatedKeys: number;
  gListMenuOverride: ListMenuOverride;
  gMultiuseListMenuTemplate: ListMenuTemplate | null;
  mysteryGiftLinkMenu: MysteryGiftLinkMenuStruct;
  fontMaxLetterHeights: Record<number, number>;
  menuCursorDimensions: Record<number, { width: number; height: number }>;
  operations: string[];
  textPrints: Array<{ windowId: number; fontId: number; x: number; y: number; lettersSpacing: number; colors: number[]; text: string }>;
  selectionCallbacks: Array<{ itemIndex: number; onInit: boolean }>;
  loadedPalettes: Array<{ source: string; palOffset: number; size: number }>;
  blits: Array<{ kind: string; windowId: number; source: string; x: number; y: number; width: number; height: number }>;
  lastSound: string | null;
}

export const sMenuInfoIcons: Record<number, MoveMenuInfoIcon> = {
  [MENU_INFO_ICON_CAUGHT]: { width: 12, height: 12, offset: 0x00 },
  [TYPE_NORMAL + 1]: { width: 32, height: 12, offset: 0x20 },
  [TYPE_ROCK + 1]: { width: 32, height: 12, offset: 0x44 },
  [MENU_INFO_ICON_TYPE]: { width: 40, height: 12, offset: 0xa8 },
  [MENU_INFO_ICON_POWER]: { width: 40, height: 12, offset: 0xc0 },
  [MENU_INFO_ICON_ACCURACY]: { width: 40, height: 12, offset: 0xc8 },
  [MENU_INFO_ICON_PP]: { width: 40, height: 12, offset: 0xe0 },
  [MENU_INFO_ICON_EFFECT]: { width: 40, height: 12, offset: 0xe8 }
};

export const createListMenuRuntime = (): ListMenuRuntime => ({
  tasks: [],
  windows: new Map(),
  nextWindowId: 0,
  nextCursorObjectId: 0,
  cursorObjects: new Map(),
  joyNew: 0,
  newAndRepeatedKeys: 0,
  gListMenuOverride: { cursorPal: 0, fillValue: 0, cursorShadowPal: 0, lettersSpacing: 0, field_2_2: 0, fontId: 0, enabled: false },
  gMultiuseListMenuTemplate: null,
  mysteryGiftLinkMenu: { currItemId: 0, state: 0, windowId: 0, listTaskId: 0 },
  fontMaxLetterHeights: { 0: 12, 1: 10 },
  menuCursorDimensions: { 0: { width: 8, height: 12 }, 1: { width: 8, height: 12 } },
  operations: [],
  textPrints: [],
  selectionCallbacks: [],
  loadedPalettes: [],
  blits: [],
  lastSound: null
});

export function ListMenuDummyTask(_runtime: ListMenuRuntime, _taskId: number): void {}

export const createListMenuTemplate = (items: ListMenuItem[], partial: Partial<ListMenuTemplate> = {}): ListMenuTemplate => ({
  items,
  moveCursorFunc: null,
  itemPrintFunc: null,
  totalItems: items.length,
  maxShowed: items.length,
  windowId: 0,
  header_X: 0,
  item_X: 8,
  cursor_X: 0,
  upText_Y: 0,
  cursorPal: 1,
  fillValue: 0,
  cursorShadowPal: 2,
  lettersSpacing: 0,
  itemVerticalPadding: 0,
  scrollMultiple: LIST_NO_MULTIPLE_SCROLL,
  fontId: 0,
  cursorKind: 0,
  ...partial
});

export function DoMysteryGiftListMenu(
  runtime: ListMenuRuntime,
  windowTemplate: WindowTemplate,
  listMenuTemplate: ListMenuTemplate,
  arg2: number,
  tileNum: number,
  palOffset: number
): number {
  const menu = runtime.mysteryGiftLinkMenu;
  switch (menu.state) {
    case 0:
    default:
      menu.windowId = AddWindow(runtime, windowTemplate);
      switch (arg2) {
        case 2:
          LoadUserWindowGfx(runtime, menu.windowId, tileNum, palOffset);
        case 1:
          DrawTextBorderOuter(runtime, menu.windowId, tileNum, Math.trunc(palOffset / 16));
          break;
      }
      runtime.gMultiuseListMenuTemplate = { ...listMenuTemplate, windowId: menu.windowId };
      menu.listTaskId = ListMenuInit(runtime, runtime.gMultiuseListMenuTemplate, 0, 0);
      CopyWindowToVram(runtime, menu.windowId, COPYWIN_MAP);
      menu.state = 1;
      break;
    case 1:
      menu.currItemId = ListMenu_ProcessInput(runtime, menu.listTaskId);
      if (JOY_NEW(runtime, A_BUTTON)) {
        menu.state = 2;
      }
      if (JOY_NEW(runtime, B_BUTTON)) {
        menu.currItemId = LIST_CANCEL;
        menu.state = 2;
      }
      if (menu.state === 2) {
        if (!arg2) {
          ClearWindowTilemap(runtime, menu.windowId);
        } else {
          switch (arg2) {
            case 0:
              ClearStdWindowAndFrame(runtime, menu.windowId, false);
              break;
            case 2:
            case 1:
              ClearStdWindowAndFrame(runtime, menu.windowId, false);
              break;
          }
        }
        CopyWindowToVram(runtime, menu.windowId, COPYWIN_MAP);
      }
      break;
    case 2:
      DestroyListMenuTask(runtime, menu.listTaskId);
      RemoveWindow(runtime, menu.windowId);
      menu.state = 0;
      return menu.currItemId;
  }
  return LIST_NOTHING_CHOSEN;
}

export function ListMenuInit(runtime: ListMenuRuntime, listMenuTemplate: ListMenuTemplate, cursorPos: number, itemsAbove: number): number {
  const taskId = ListMenuInitInternal(runtime, listMenuTemplate, cursorPos, itemsAbove);
  PutWindowTilemap(runtime, listMenuTemplate.windowId);
  CopyWindowToVram(runtime, listMenuTemplate.windowId, COPYWIN_GFX);
  return taskId;
}

export function ListMenuInitInRect(
  runtime: ListMenuRuntime,
  listMenuTemplate: ListMenuTemplate,
  rect: ListMenuWindowRect[],
  cursorPos: number,
  itemsAbove: number
): number {
  const taskId = ListMenuInitInternal(runtime, listMenuTemplate, cursorPos, itemsAbove);
  for (let i = 0; rect[i]?.palNum !== 0xff; i++) {
    const row = rect[i]!;
    PutWindowRectTilemapOverridePalette(runtime, listMenuTemplate.windowId, row.x, row.y, row.width, row.height, row.palNum);
  }
  CopyWindowToVram(runtime, listMenuTemplate.windowId, COPYWIN_GFX);
  return taskId;
}

export function ListMenu_ProcessInput(runtime: ListMenuRuntime, listTaskId: number): number {
  const list = runtime.tasks[listTaskId]!.data;
  if (JOY_NEW(runtime, A_BUTTON)) {
    return list.template.items[list.cursorPos + list.itemsAbove]!.index;
  }
  if (JOY_NEW(runtime, B_BUTTON)) {
    return LIST_CANCEL;
  }
  if (runtime.newAndRepeatedKeys & DPAD_UP) {
    ListMenuChangeSelection(runtime, list, true, 1, false);
    return LIST_NOTHING_CHOSEN;
  }
  if (runtime.newAndRepeatedKeys & DPAD_DOWN) {
    ListMenuChangeSelection(runtime, list, true, 1, true);
    return LIST_NOTHING_CHOSEN;
  }

  let leftButton = false;
  let rightButton = false;
  switch (list.template.scrollMultiple) {
    case LIST_NO_MULTIPLE_SCROLL:
    default:
      leftButton = false;
      rightButton = false;
      break;
    case LIST_MULTIPLE_SCROLL_DPAD:
      leftButton = (runtime.newAndRepeatedKeys & DPAD_LEFT) !== 0;
      rightButton = (runtime.newAndRepeatedKeys & DPAD_RIGHT) !== 0;
      break;
    case LIST_MULTIPLE_SCROLL_L_R:
      leftButton = (runtime.newAndRepeatedKeys & L_BUTTON) !== 0;
      rightButton = (runtime.newAndRepeatedKeys & R_BUTTON) !== 0;
      break;
  }
  if (leftButton) {
    ListMenuChangeSelection(runtime, list, true, list.template.maxShowed, false);
  } else if (rightButton) {
    ListMenuChangeSelection(runtime, list, true, list.template.maxShowed, true);
  }
  return LIST_NOTHING_CHOSEN;
}

export function DestroyListMenuTask(
  runtime: ListMenuRuntime,
  listTaskId: number,
  out?: { cursorPos?: number; itemsAbove?: number }
): void {
  const list = runtime.tasks[listTaskId]!.data;
  if (out) {
    out.cursorPos = list.cursorPos;
    out.itemsAbove = list.itemsAbove;
  }
  if (list.taskId !== TAIL_SENTINEL) {
    ListMenuRemoveCursorObject(runtime, list.taskId, list.template.cursorKind - 2);
  }
  DestroyTask(runtime, listTaskId);
}

export function RedrawListMenu(runtime: ListMenuRuntime, listTaskId: number): void {
  const list = runtime.tasks[listTaskId]!.data;
  FillWindowPixelBuffer(runtime, list.template.windowId, PIXEL_FILL(list.template.fillValue));
  ListMenuPrintEntries(runtime, list, list.cursorPos, 0, list.template.maxShowed);
  ListMenuDrawCursor(runtime, list);
  CopyWindowToVram(runtime, list.template.windowId, COPYWIN_GFX);
}

export function ChangeListMenuPals(runtime: ListMenuRuntime, listTaskId: number, cursorPal: number, fillValue: number, cursorShadowPal: number): void {
  const list = runtime.tasks[listTaskId]!.data;
  list.template.cursorPal = cursorPal;
  list.template.fillValue = fillValue;
  list.template.cursorShadowPal = cursorShadowPal;
}

export function ChangeListMenuCoords(runtime: ListMenuRuntime, listTaskId: number, x: number, y: number): void {
  const list = runtime.tasks[listTaskId]!.data;
  SetWindowAttribute(runtime, list.template.windowId, WINDOW_TILEMAP_LEFT, x);
  SetWindowAttribute(runtime, list.template.windowId, WINDOW_TILEMAP_TOP, y);
}

export function ListMenuTestInput(
  runtime: ListMenuRuntime,
  template: ListMenuTemplate,
  cursorPos: number,
  itemsAbove: number,
  keys: number
): { result: number; cursorPos: number; itemsAbove: number } {
  const list: ListMenu = { template: { ...template }, cursorPos, itemsAbove, unk_1C: 0, unk_1D: 0, taskId: TAIL_SENTINEL, unk_1F: 0 };
  if (keys === DPAD_UP) {
    ListMenuChangeSelection(runtime, list, false, 1, false);
  }
  if (keys === DPAD_DOWN) {
    ListMenuChangeSelection(runtime, list, false, 1, true);
  }
  return { result: LIST_NOTHING_CHOSEN, cursorPos: list.cursorPos, itemsAbove: list.itemsAbove };
}

export function ListMenuGetCurrentItemArrayId(runtime: ListMenuRuntime, listTaskId: number): number {
  const list = runtime.tasks[listTaskId]!.data;
  return list.cursorPos + list.itemsAbove;
}

export function ListMenuGetScrollAndRow(runtime: ListMenuRuntime, listTaskId: number): { cursorPos: number; itemsAbove: number } {
  const list = runtime.tasks[listTaskId]!.data;
  return { cursorPos: list.cursorPos, itemsAbove: list.itemsAbove };
}

export function ListMenuGetYCoordForPrintingArrowCursor(runtime: ListMenuRuntime, listTaskId: number): number {
  const list = runtime.tasks[listTaskId]!.data;
  const yMultiplier = GetFontAttribute(runtime, list.template.fontId, FONTATTR_MAX_LETTER_HEIGHT) + list.template.itemVerticalPadding;
  return list.itemsAbove * yMultiplier + list.template.upText_Y;
}

export function ListMenuInitInternal(runtime: ListMenuRuntime, listMenuTemplate: ListMenuTemplate, cursorPos: number, itemsAbove: number): number {
  const list: ListMenu = {
    template: { ...listMenuTemplate },
    cursorPos,
    itemsAbove,
    unk_1C: 0,
    unk_1D: 0,
    taskId: TAIL_SENTINEL,
    unk_1F: 0
  };
  const listTaskId = CreateTask(runtime, list);
  runtime.gListMenuOverride.cursorPal = list.template.cursorPal;
  runtime.gListMenuOverride.fillValue = list.template.fillValue;
  runtime.gListMenuOverride.cursorShadowPal = list.template.cursorShadowPal;
  runtime.gListMenuOverride.lettersSpacing = list.template.lettersSpacing;
  runtime.gListMenuOverride.fontId = list.template.fontId;
  runtime.gListMenuOverride.enabled = false;
  if (list.template.totalItems < list.template.maxShowed) {
    list.template.maxShowed = list.template.totalItems;
  }
  FillWindowPixelBuffer(runtime, list.template.windowId, PIXEL_FILL(list.template.fillValue));
  ListMenuPrintEntries(runtime, list, list.cursorPos, 0, list.template.maxShowed);
  ListMenuDrawCursor(runtime, list);
  ListMenuCallSelectionChangedCallback(runtime, list, true);
  return listTaskId;
}

export function ListMenuPrint(runtime: ListMenuRuntime, list: ListMenu, str: string, x: number, y: number): void {
  const colors = [0, 0, 0];
  if (runtime.gListMenuOverride.enabled) {
    colors[0] = runtime.gListMenuOverride.fillValue;
    colors[1] = runtime.gListMenuOverride.cursorPal;
    colors[2] = runtime.gListMenuOverride.cursorShadowPal;
    AddTextPrinterParameterized4(runtime, list.template.windowId, runtime.gListMenuOverride.fontId, x, y, runtime.gListMenuOverride.lettersSpacing, colors, str);
    runtime.gListMenuOverride.enabled = false;
  } else {
    colors[0] = list.template.fillValue;
    colors[1] = list.template.cursorPal;
    colors[2] = list.template.cursorShadowPal;
    AddTextPrinterParameterized4(runtime, list.template.windowId, list.template.fontId, x, y, list.template.lettersSpacing, colors, str);
  }
}

export function ListMenuPrintEntries(runtime: ListMenuRuntime, list: ListMenu, startIndex: number, yOffset: number, count: number): void {
  const yMultiplier = GetFontAttribute(runtime, list.template.fontId, FONTATTR_MAX_LETTER_HEIGHT) + list.template.itemVerticalPadding;
  for (let i = 0; i < count; i++) {
    const item = list.template.items[startIndex]!;
    const x = item.index !== LIST_HEADER ? list.template.item_X : list.template.header_X;
    const y = (yOffset + i) * yMultiplier + list.template.upText_Y;
    if (list.template.itemPrintFunc !== null) {
      list.template.itemPrintFunc(list.template.windowId, item.index, y);
    }
    ListMenuPrint(runtime, list, item.label, x, y);
    startIndex++;
  }
}

export function ListMenuDrawCursor(runtime: ListMenuRuntime, list: ListMenu): void {
  const yMultiplier = GetFontAttribute(runtime, list.template.fontId, FONTATTR_MAX_LETTER_HEIGHT) + list.template.itemVerticalPadding;
  const x = list.template.cursor_X;
  const y = list.itemsAbove * yMultiplier + list.template.upText_Y;
  switch (list.template.cursorKind) {
    case 0:
      ListMenuPrint(runtime, list, '▶', x, y);
      break;
    case 1:
      break;
    case 2:
      if (list.taskId === TAIL_SENTINEL) list.taskId = ListMenuAddCursorObject(runtime, list, 0);
      ListMenuUpdateCursorObject(runtime, list.taskId, GetWindowAttribute(runtime, list.template.windowId, WINDOW_TILEMAP_LEFT) * 8 - 1, GetWindowAttribute(runtime, list.template.windowId, WINDOW_TILEMAP_TOP) * 8 + y - 1, 0);
      break;
    case 3:
      if (list.taskId === TAIL_SENTINEL) list.taskId = ListMenuAddCursorObject(runtime, list, 1);
      ListMenuUpdateCursorObject(runtime, list.taskId, GetWindowAttribute(runtime, list.template.windowId, WINDOW_TILEMAP_LEFT) * 8 + x, GetWindowAttribute(runtime, list.template.windowId, WINDOW_TILEMAP_TOP) * 8 + y, 1);
      break;
  }
}

export function ListMenuAddCursorObject(runtime: ListMenuRuntime, list: ListMenu, cursorKind: number): number {
  const cursor: CursorStruct = {
    left: 0,
    top: 160,
    rowWidth: GetWindowAttribute(runtime, list.template.windowId, WINDOW_WIDTH) * 8 + 2,
    rowHeight: GetFontAttribute(runtime, list.template.fontId, FONTATTR_MAX_LETTER_HEIGHT) + 2,
    tileTag: 0x4000,
    palTag: -1,
    palNum: 15
  };
  return ListMenuAddCursorObjectInternal(runtime, cursor, cursorKind);
}

export function ListMenuErasePrintedCursor(runtime: ListMenuRuntime, list: ListMenu, itemsAbove: number): void {
  if (list.template.cursorKind === 0) {
    const yMultiplier = GetFontAttribute(runtime, list.template.fontId, FONTATTR_MAX_LETTER_HEIGHT) + list.template.itemVerticalPadding;
    const width = GetMenuCursorDimensionByFont(runtime, list.template.fontId, 0);
    const height = GetMenuCursorDimensionByFont(runtime, list.template.fontId, 1);
    FillWindowPixelRect(runtime, list.template.windowId, PIXEL_FILL(list.template.fillValue), list.template.cursor_X, itemsAbove * yMultiplier + list.template.upText_Y, width, height);
  }
}

export function ListMenuUpdateSelectedRowIndexAndScrollOffset(list: ListMenu, movingDown: boolean): number {
  let itemsAbove = list.itemsAbove;
  const cursorPos = list.cursorPos;
  let newRow: number;
  let newScroll: number;
  if (!movingDown) {
    newRow = list.template.maxShowed === 1 ? 0 : list.template.maxShowed - (Math.trunc(list.template.maxShowed / 2) + (list.template.maxShowed % 2)) - 1;
    if (cursorPos === 0) {
      while (itemsAbove !== 0) {
        itemsAbove--;
        if (list.template.items[cursorPos + itemsAbove]!.index !== LIST_HEADER) {
          list.itemsAbove = itemsAbove;
          return 1;
        }
      }
      return 0;
    }
    while (itemsAbove > newRow) {
      itemsAbove--;
      if (list.template.items[cursorPos + itemsAbove]!.index !== LIST_HEADER) {
        list.itemsAbove = itemsAbove;
        return 1;
      }
    }
    newScroll = cursorPos - 1;
  } else {
    newRow = list.template.maxShowed === 1 ? 0 : Math.trunc(list.template.maxShowed / 2) + (list.template.maxShowed % 2);
    if (cursorPos === list.template.totalItems - list.template.maxShowed) {
      while (itemsAbove < list.template.maxShowed - 1) {
        itemsAbove++;
        if (list.template.items[cursorPos + itemsAbove]!.index !== LIST_HEADER) {
          list.itemsAbove = itemsAbove;
          return 1;
        }
      }
      return 0;
    }
    while (itemsAbove < newRow) {
      itemsAbove++;
      if (list.template.items[cursorPos + itemsAbove]!.index !== LIST_HEADER) {
        list.itemsAbove = itemsAbove;
        return 1;
      }
    }
    newScroll = cursorPos + 1;
  }
  list.itemsAbove = newRow;
  list.cursorPos = newScroll;
  return 2;
}

export function ListMenuScroll(runtime: ListMenuRuntime, list: ListMenu, count: number, movingDown: boolean): void {
  if (count >= list.template.maxShowed) {
    FillWindowPixelBuffer(runtime, list.template.windowId, PIXEL_FILL(list.template.fillValue));
    ListMenuPrintEntries(runtime, list, list.cursorPos, 0, list.template.maxShowed);
  } else {
    const yMultiplier = GetFontAttribute(runtime, list.template.fontId, FONTATTR_MAX_LETTER_HEIGHT) + list.template.itemVerticalPadding;
    if (!movingDown) {
      ScrollWindow(runtime, list.template.windowId, 1, count * yMultiplier, PIXEL_FILL(list.template.fillValue));
      ListMenuPrintEntries(runtime, list, list.cursorPos, 0, count);
      const y = list.template.maxShowed * yMultiplier + list.template.upText_Y;
      const width = GetWindowAttribute(runtime, list.template.windowId, WINDOW_WIDTH) * 8;
      const height = GetWindowAttribute(runtime, list.template.windowId, WINDOW_HEIGHT) * 8 - y;
      FillWindowPixelRect(runtime, list.template.windowId, PIXEL_FILL(list.template.fillValue), 0, y, width, height);
    } else {
      ScrollWindow(runtime, list.template.windowId, 0, count * yMultiplier, PIXEL_FILL(list.template.fillValue));
      ListMenuPrintEntries(runtime, list, list.cursorPos + (list.template.maxShowed - count), list.template.maxShowed - count, count);
      const width = GetWindowAttribute(runtime, list.template.windowId, WINDOW_WIDTH) * 8;
      FillWindowPixelRect(runtime, list.template.windowId, PIXEL_FILL(list.template.fillValue), 0, 0, width, list.template.upText_Y);
    }
  }
}

export function ListMenuChangeSelection(runtime: ListMenuRuntime, list: ListMenu, updateCursorAndCallCallback: boolean, count: number, movingDown: boolean): boolean {
  const oldSelectedRow = list.itemsAbove;
  let cursorCount = 0;
  let selectionChange = 0;
  for (let i = 0; i < count; i++) {
    do {
      const ret = ListMenuUpdateSelectedRowIndexAndScrollOffset(list, movingDown);
      selectionChange |= ret;
      if (ret !== 2) break;
      cursorCount++;
    } while (list.template.items[list.cursorPos + list.itemsAbove]!.index === LIST_HEADER);
  }
  if (updateCursorAndCallCallback) {
    switch (selectionChange) {
      case 0:
      default:
        return true;
      case 1:
        ListMenuErasePrintedCursor(runtime, list, oldSelectedRow);
        ListMenuDrawCursor(runtime, list);
        ListMenuCallSelectionChangedCallback(runtime, list, false);
        CopyWindowToVram(runtime, list.template.windowId, COPYWIN_GFX);
        break;
      case 2:
      case 3:
        ListMenuErasePrintedCursor(runtime, list, oldSelectedRow);
        ListMenuScroll(runtime, list, cursorCount, movingDown);
        ListMenuDrawCursor(runtime, list);
        ListMenuCallSelectionChangedCallback(runtime, list, false);
        CopyWindowToVram(runtime, list.template.windowId, COPYWIN_GFX);
        break;
    }
  }
  return false;
}

export function ListMenuCallSelectionChangedCallback(runtime: ListMenuRuntime, list: ListMenu, onInit: boolean): void {
  if (list.template.moveCursorFunc !== null) {
    list.template.moveCursorFunc(list.template.items[list.cursorPos + list.itemsAbove]!.index, onInit, list);
  }
  runtime.selectionCallbacks.push({ itemIndex: list.template.items[list.cursorPos + list.itemsAbove]!.index, onInit });
}

export function ListMenuOverrideSetColors(runtime: ListMenuRuntime, cursorPal: number, fillValue: number, cursorShadowPal: number): void {
  runtime.gListMenuOverride.cursorPal = cursorPal;
  runtime.gListMenuOverride.fillValue = fillValue;
  runtime.gListMenuOverride.cursorShadowPal = cursorShadowPal;
  runtime.gListMenuOverride.enabled = true;
}

export function ListMenuDefaultCursorMoveFunc(runtime: ListMenuRuntime, _itemIndex: number, onInit: boolean): void {
  if (!onInit) {
    PlaySE(runtime, SE_SELECT);
  }
}

export function ListMenuGetTemplateField(runtime: ListMenuRuntime, taskId: number, field: number): number | Function | null {
  const data = runtime.tasks[taskId]!.data;
  switch (field) {
    case LISTFIELD_MOVECURSORFUNC:
    case LISTFIELD_MOVECURSORFUNC2: return data.template.moveCursorFunc;
    case LISTFIELD_TOTALITEMS: return data.template.totalItems;
    case LISTFIELD_MAXSHOWED: return data.template.maxShowed;
    case LISTFIELD_WINDOWID: return data.template.windowId;
    case LISTFIELD_HEADERX: return data.template.header_X;
    case LISTFIELD_ITEMX: return data.template.item_X;
    case LISTFIELD_CURSORX: return data.template.cursor_X;
    case LISTFIELD_UPTEXTY: return data.template.upText_Y;
    case LISTFIELD_CURSORPAL: return data.template.cursorPal;
    case LISTFIELD_FILLVALUE: return data.template.fillValue;
    case LISTFIELD_CURSORSHADOWPAL: return data.template.cursorShadowPal;
    case LISTFIELD_LETTERSPACING: return data.template.lettersSpacing;
    case LISTFIELD_ITEMVERTICALPADDING: return data.template.itemVerticalPadding;
    case LISTFIELD_SCROLLMULTIPLE: return data.template.scrollMultiple;
    case LISTFIELD_FONTID: return data.template.fontId;
    case LISTFIELD_CURSORKIND: return data.template.cursorKind;
    default: return -1;
  }
}

export function ListMenuSetTemplateField(runtime: ListMenuRuntime, taskId: number, field: number, value: number | ListMenuTemplate['moveCursorFunc']): void {
  const data = runtime.tasks[taskId]!.data;
  switch (field) {
    case LISTFIELD_MOVECURSORFUNC:
    case LISTFIELD_MOVECURSORFUNC2: data.template.moveCursorFunc = value as ListMenuTemplate['moveCursorFunc']; break;
    case LISTFIELD_TOTALITEMS: data.template.totalItems = value as number; break;
    case LISTFIELD_MAXSHOWED: data.template.maxShowed = value as number; break;
    case LISTFIELD_WINDOWID: data.template.windowId = value as number; break;
    case LISTFIELD_HEADERX: data.template.header_X = value as number; break;
    case LISTFIELD_ITEMX: data.template.item_X = value as number; break;
    case LISTFIELD_CURSORX: data.template.cursor_X = value as number; break;
    case LISTFIELD_UPTEXTY: data.template.upText_Y = value as number; break;
    case LISTFIELD_CURSORPAL: data.template.cursorPal = value as number; break;
    case LISTFIELD_FILLVALUE: data.template.fillValue = value as number; break;
    case LISTFIELD_CURSORSHADOWPAL: data.template.cursorShadowPal = value as number; break;
    case LISTFIELD_LETTERSPACING: data.template.lettersSpacing = value as number; break;
    case LISTFIELD_ITEMVERTICALPADDING: data.template.itemVerticalPadding = value as number; break;
    case LISTFIELD_SCROLLMULTIPLE: data.template.scrollMultiple = value as number; break;
    case LISTFIELD_FONTID: data.template.fontId = value as number; break;
    case LISTFIELD_CURSORKIND: data.template.cursorKind = value as number; break;
  }
}

export function ListMenu_LoadMonIconPalette(runtime: ListMenuRuntime, palOffset: number, speciesId: number): void {
  LoadPalette(runtime, `MonIconPalette:${speciesId}`, palOffset, PLTT_SIZE_4BPP);
}

export function ListMenu_DrawMonIconGraphics(runtime: ListMenuRuntime, windowId: number, speciesId: number, personality: number, x: number, y: number): void {
  BlitBitmapToWindow(runtime, windowId, `MonIcon:${speciesId}:${personality}:1`, x, y, 32, 32);
}

export function ListMenuLoadStdPalAt(runtime: ListMenuRuntime, palOffset: number, palId: number): void {
  LoadPalette(runtime, palId === 1 ? 'gMenuInfoElements2_Pal' : 'gMenuInfoElements1_Pal', palOffset, PLTT_SIZE_4BPP);
}

export function BlitMenuInfoIcon(runtime: ListMenuRuntime, windowId: number, iconId: number, x: number, y: number): void {
  const icon = sMenuInfoIcons[iconId] ?? sMenuInfoIcons[MENU_INFO_ICON_CAUGHT]!;
  BlitBitmapRectToWindow(runtime, windowId, `gMenuInfoElements_Gfx:${icon.offset * TILE_SIZE_4BPP}`, x, y, icon.width, icon.height);
}

const JOY_NEW = (runtime: ListMenuRuntime, key: number): boolean => (runtime.joyNew & key) !== 0;
const PIXEL_FILL = (value: number): number => value;

const CreateTask = (runtime: ListMenuRuntime, list: ListMenu): number => {
  const task: ListMenuTask = { func: 'ListMenuDummyTask', data: list, destroyed: false };
  const slot = runtime.tasks.findIndex((candidate) => candidate === null);
  if (slot >= 0) {
    runtime.tasks[slot] = task;
    return slot;
  }
  runtime.tasks.push(task);
  return runtime.tasks.length - 1;
};
const DestroyTask = (runtime: ListMenuRuntime, taskId: number): void => {
  if (runtime.tasks[taskId]) runtime.tasks[taskId]!.destroyed = true;
  runtime.tasks[taskId] = null;
};

const AddWindow = (runtime: ListMenuRuntime, template: WindowTemplate): number => {
  const id = template.id ?? runtime.nextWindowId++;
  runtime.windows.set(id, { left: template.left ?? 0, top: template.top ?? 0, width: template.width ?? 10, height: template.height ?? 10, removed: false });
  runtime.operations.push(`AddWindow:${id}`);
  return id;
};
const RemoveWindow = (runtime: ListMenuRuntime, windowId: number): void => {
  const win = runtime.windows.get(windowId);
  if (win) win.removed = true;
  runtime.operations.push(`RemoveWindow:${windowId}`);
};
const GetWindowAttribute = (runtime: ListMenuRuntime, windowId: number, attr: string): number => {
  const win = runtime.windows.get(windowId) ?? { left: 0, top: 0, width: 10, height: 10 };
  if (attr === WINDOW_TILEMAP_LEFT) return win.left;
  if (attr === WINDOW_TILEMAP_TOP) return win.top;
  if (attr === WINDOW_WIDTH) return win.width;
  if (attr === WINDOW_HEIGHT) return win.height;
  return 0;
};
const SetWindowAttribute = (runtime: ListMenuRuntime, windowId: number, attr: string, value: number): void => {
  const win = runtime.windows.get(windowId) ?? { left: 0, top: 0, width: 10, height: 10, removed: false };
  if (attr === WINDOW_TILEMAP_LEFT) win.left = value;
  if (attr === WINDOW_TILEMAP_TOP) win.top = value;
  runtime.windows.set(windowId, win);
};
const GetFontAttribute = (runtime: ListMenuRuntime, fontId: number, attr: string): number =>
  attr === FONTATTR_MAX_LETTER_HEIGHT ? runtime.fontMaxLetterHeights[fontId] ?? 12 : 0;
const GetMenuCursorDimensionByFont = (runtime: ListMenuRuntime, fontId: number, dimension: number): number =>
  dimension === 0 ? runtime.menuCursorDimensions[fontId]?.width ?? 8 : runtime.menuCursorDimensions[fontId]?.height ?? 12;

const op = (runtime: ListMenuRuntime, value: string): void => { runtime.operations.push(value); };
const LoadUserWindowGfx = (runtime: ListMenuRuntime, windowId: number, tileNum: number, palOffset: number): void => op(runtime, `LoadUserWindowGfx:${windowId}:${tileNum}:${palOffset}`);
const DrawTextBorderOuter = (runtime: ListMenuRuntime, windowId: number, tileNum: number, pal: number): void => op(runtime, `DrawTextBorderOuter:${windowId}:${tileNum}:${pal}`);
const CopyWindowToVram = (runtime: ListMenuRuntime, windowId: number, mode: number): void => op(runtime, `CopyWindowToVram:${windowId}:${mode}`);
const ClearWindowTilemap = (runtime: ListMenuRuntime, windowId: number): void => op(runtime, `ClearWindowTilemap:${windowId}`);
const ClearStdWindowAndFrame = (runtime: ListMenuRuntime, windowId: number, copy: boolean): void => op(runtime, `ClearStdWindowAndFrame:${windowId}:${copy}`);
const PutWindowTilemap = (runtime: ListMenuRuntime, windowId: number): void => op(runtime, `PutWindowTilemap:${windowId}`);
const PutWindowRectTilemapOverridePalette = (runtime: ListMenuRuntime, windowId: number, x: number, y: number, width: number, height: number, pal: number): void => op(runtime, `PutWindowRectTilemapOverridePalette:${windowId}:${x}:${y}:${width}:${height}:${pal}`);
const FillWindowPixelBuffer = (runtime: ListMenuRuntime, windowId: number, fill: number): void => op(runtime, `FillWindowPixelBuffer:${windowId}:${fill}`);
const FillWindowPixelRect = (runtime: ListMenuRuntime, windowId: number, fill: number, x: number, y: number, width: number, height: number): void => op(runtime, `FillWindowPixelRect:${windowId}:${fill}:${x}:${y}:${width}:${height}`);
const ScrollWindow = (runtime: ListMenuRuntime, windowId: number, direction: number, distance: number, fill: number): void => op(runtime, `ScrollWindow:${windowId}:${direction}:${distance}:${fill}`);
const AddTextPrinterParameterized4 = (runtime: ListMenuRuntime, windowId: number, fontId: number, x: number, y: number, lettersSpacing: number, colors: number[], text: string): void => {
  runtime.textPrints.push({ windowId, fontId, x, y, lettersSpacing, colors: [...colors], text });
};
const ListMenuAddCursorObjectInternal = (runtime: ListMenuRuntime, cursor: CursorStruct, kind: number): number => {
  const id = runtime.nextCursorObjectId++;
  runtime.cursorObjects.set(id, { ...cursor, kind, x: cursor.left, y: cursor.top, priority: 0, removed: false });
  return id;
};
const ListMenuUpdateCursorObject = (runtime: ListMenuRuntime, id: number, x: number, y: number, priority: number): void => {
  const cursor = runtime.cursorObjects.get(id);
  if (cursor) Object.assign(cursor, { x, y, priority });
};
const ListMenuRemoveCursorObject = (runtime: ListMenuRuntime, id: number, _kind: number): void => {
  const cursor = runtime.cursorObjects.get(id);
  if (cursor) cursor.removed = true;
};
const PlaySE = (runtime: ListMenuRuntime, sound: string): void => { runtime.lastSound = sound; };
const LoadPalette = (runtime: ListMenuRuntime, source: string, palOffset: number, size: number): void => {
  runtime.loadedPalettes.push({ source, palOffset, size });
};
const BlitBitmapToWindow = (runtime: ListMenuRuntime, windowId: number, source: string, x: number, y: number, width: number, height: number): void => {
  runtime.blits.push({ kind: 'bitmap', windowId, source, x, y, width, height });
};
const BlitBitmapRectToWindow = (runtime: ListMenuRuntime, windowId: number, source: string, x: number, y: number, width: number, height: number): void => {
  runtime.blits.push({ kind: 'bitmapRect', windowId, source, x, y, width, height });
};
