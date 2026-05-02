import itemPcSource from '../../../src/item_pc.c?raw';
import {
  A_BUTTON,
  B_BUTTON,
  DPAD_DOWN,
  DPAD_UP,
  FONT_NORMAL,
  FONT_SMALL,
  MENU_B_PRESSED,
  MENU_NOTHING_CHOSEN,
  SE_SELECT
} from './decompMenu';
import {
  AddBagItem,
  GetPcItemQuantity,
  ITEM_NONE,
  ITEMS_COUNT,
  ItemId_GetDescription,
  ItemId_GetName,
  ItemId_GetPocket,
  ItemPcCompaction,
  PC_ITEMS_COUNT,
  POCKET_TM_CASE,
  RemovePCItem,
  type ItemRuntime,
  type ItemSlot
} from './decompItem';
import { adjustQuantityAccordingToDPadInput } from './decompMenuHelpers';

export const QL_EVENT_WITHDREW_ITEM_PC = 'QL_EVENT_WITHDREW_ITEM_PC';
export const ITEM_PC_MOVE_MODE_NONE = 0xff;
export const ITEM_PC_SCROLL_ARROW_NONE = 0xff;
export const LIST_CANCEL = -2;

export interface ItemPcResources {
  savedCallback: string | null;
  moveModeOrigPos: number;
  itemMenuIconSlot: number;
  maxShowed: number;
  nItems: number;
  scrollIndicatorArrowPairId: number;
  withdrawQuantitySubmenuCursorPos: number;
  data: number[];
}

export interface ItemPcStaticResources {
  savedCallback: string | null;
  scroll: number;
  row: number;
  initialized: number;
}

export interface ItemPcTask {
  id: number;
  func: ItemPcTaskFunc;
  data: number[];
  destroyed: boolean;
}

export type ItemPcTaskFunc =
  | 'Task_ItemPcMain'
  | 'Task_ItemPcTurnOff1'
  | 'Task_ItemPcTurnOff2'
  | 'Task_ItemPcWaitFadeAndBail'
  | 'Task_ItemPcMoveItemModeRun'
  | 'Task_ItemPcSubmenuInit'
  | 'Task_ItemPcSubmenuRun'
  | 'Task_ItemPcWithdraw'
  | 'Task_ItemPcHandleWithdrawMultiple'
  | 'Task_ItemPcWaitButtonAndFinishWithdrawMultiple'
  | 'Task_ItemPcWaitButtonWithdrawMultipleFailed'
  | 'Task_ItemPcCleanUpWithdraw'
  | 'Task_ItemPcGive'
  | 'gTask_ItemPcWaitButtonAndExitSubmenu'
  | 'Task_ItemPcCancel';

export interface ItemPcWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface ItemPcListMenuTemplate {
  totalItems: number;
  windowId: number;
  header_X: number;
  item_X: number;
  cursor_X: number;
  lettersSpacing: number;
  itemVerticalPadding: number;
  upText_Y: number;
  maxShowed: number;
  fontId: number;
  cursorPal: number;
  fillValue: number;
  cursorShadowPal: number;
  scrollMultiple: number;
  cursorKind: number;
  items: Array<{ label: string; index: number }>;
}

export interface ItemPcRuntime {
  itemRuntime: ItemRuntime;
  gMainState: number;
  sStateDataPtr: ItemPcResources | null;
  sBg1TilemapBufferAllocated: boolean;
  sListMenuItemsAllocated: boolean;
  sUnusedStringAllocationAllocated: boolean;
  sListMenuState: ItemPcStaticResources;
  sSubmenuWindowIds: number[];
  gMultiuseListMenuTemplate: ItemPcListMenuTemplate;
  tasks: ItemPcTask[];
  windows: Map<number, ItemPcWindowTemplate>;
  nextWindowId: number;
  listMenuTaskDestroyed: boolean;
  nextListMenuId: number;
  activeListMenuId: number;
  paletteFadeActive: boolean;
  pcScreenEffectTurnOnRunning: boolean;
  pcScreenEffectTurnOffRunning: boolean;
  linkActive: boolean;
  overworldLinkBusy: boolean;
  partyCount: number;
  newKeys: number;
  nextListInput: number;
  mainCallback2: string | null;
  vblankCallback: string | null;
  partyMenuBagItem: number;
  operations: string[];
}

export const sBgTemplates = parseBgTemplates(itemPcSource);
export const sWindowTemplates = parseWindowTemplates(itemPcSource, 'sWindowTemplates');
export const sSubwindowTemplates = parseWindowTemplates(itemPcSource, 'sSubwindowTemplates');
export const sItemPcSubmenuOptions = [
  { text: 'gText_Withdraw', func: 'Task_ItemPcWithdraw' },
  { text: 'gOtherText_Give', func: 'Task_ItemPcGive' },
  { text: 'gFameCheckerText_Cancel', func: 'Task_ItemPcCancel' }
] as const;
export const sTextColors = parseTextColors(itemPcSource);

export const createItemPcRuntime = (itemRuntime: ItemRuntime): ItemPcRuntime => ({
  itemRuntime,
  gMainState: 0,
  sStateDataPtr: null,
  sBg1TilemapBufferAllocated: false,
  sListMenuItemsAllocated: false,
  sUnusedStringAllocationAllocated: false,
  sListMenuState: { savedCallback: null, scroll: 0, row: 0, initialized: 0 },
  sSubmenuWindowIds: [ITEM_PC_SCROLL_ARROW_NONE, ITEM_PC_SCROLL_ARROW_NONE, ITEM_PC_SCROLL_ARROW_NONE],
  gMultiuseListMenuTemplate: emptyListMenuTemplate(),
  tasks: [],
  windows: new Map(),
  nextWindowId: 0,
  listMenuTaskDestroyed: false,
  nextListMenuId: 0,
  activeListMenuId: 0,
  paletteFadeActive: false,
  pcScreenEffectTurnOnRunning: false,
  pcScreenEffectTurnOffRunning: false,
  linkActive: false,
  overworldLinkBusy: false,
  partyCount: 0,
  newKeys: 0,
  nextListInput: MENU_NOTHING_CHOSEN,
  mainCallback2: null,
  vblankCallback: null,
  partyMenuBagItem: ITEM_NONE,
  operations: []
});

export function ItemPc_Init(runtime: ItemPcRuntime, kind: number, callback: string): void {
  if (kind >= 2) {
    SetMainCallback2(runtime, callback);
    return;
  }
  runtime.sStateDataPtr = {
    savedCallback: null,
    moveModeOrigPos: ITEM_PC_MOVE_MODE_NONE,
    itemMenuIconSlot: 0,
    maxShowed: 0,
    nItems: 0,
    scrollIndicatorArrowPairId: ITEM_PC_SCROLL_ARROW_NONE,
    withdrawQuantitySubmenuCursorPos: 0,
    data: [0, 0, 0]
  };
  if (kind !== 1) {
    runtime.sListMenuState.savedCallback = callback;
    runtime.sListMenuState.scroll = 0;
    runtime.sListMenuState.row = 0;
  }
  SetMainCallback2(runtime, 'ItemPc_RunSetup');
}

export function ItemPc_RunSetup(runtime: ItemPcRuntime): void {
  while (true) {
    if (ItemPc_DoGfxSetup(runtime) === true) break;
    if (runtime.linkActive === true) break;
  }
}

export function ItemPc_DoGfxSetup(runtime: ItemPcRuntime): boolean {
  const state = mustState(runtime);
  switch (runtime.gMainState) {
    case 0:
      runtime.operations.push('SetVBlankHBlankCallbacksToNull');
      runtime.operations.push('ClearScheduledBgCopiesToVram');
      runtime.gMainState += 1;
      break;
    case 1:
      runtime.operations.push('ScanlineEffect_Stop');
      runtime.gMainState += 1;
      break;
    case 2:
      runtime.operations.push('FreeAllSpritePalettes');
      runtime.gMainState += 1;
      break;
    case 3:
      runtime.operations.push('ResetPaletteFade');
      runtime.gMainState += 1;
      break;
    case 4:
      runtime.operations.push('ResetSpriteData');
      runtime.gMainState += 1;
      break;
    case 5:
      runtime.operations.push('ResetItemMenuIconState');
      runtime.gMainState += 1;
      break;
    case 6:
      runtime.operations.push('ResetTasks');
      runtime.gMainState += 1;
      break;
    case 7:
      if (ItemPc_InitBgs(runtime)) {
        state.data[0] = 0;
        runtime.gMainState += 1;
      } else {
        ItemPc_FadeAndBail(runtime);
        return true;
      }
      break;
    case 8:
      if (ItemPc_LoadGraphics(runtime) === true) runtime.gMainState += 1;
      break;
    case 9:
      ItemPc_InitWindows(runtime);
      runtime.gMainState += 1;
      break;
    case 10:
      ItemPc_CountPcItems(runtime);
      ItemPc_SetCursorPosition(runtime);
      ItemPc_SetScrollPosition(runtime);
      runtime.gMainState += 1;
      break;
    case 11:
      if (ItemPc_AllocateResourcesForListMenu(runtime)) {
        runtime.gMainState += 1;
      } else {
        ItemPc_FadeAndBail(runtime);
        return true;
      }
      break;
    case 12:
      ItemPc_BuildListMenuTemplate(runtime);
      runtime.gMainState += 1;
      break;
    case 13:
      ItemPc_PrintWithdrawItem(runtime);
      runtime.gMainState += 1;
      break;
    case 14:
      runtime.operations.push('CreateSwapLine');
      runtime.gMainState += 1;
      break;
    case 15: {
      const taskId = CreateTask(runtime, 'Task_ItemPcMain');
      runtime.tasks[taskId].data[0] = ListMenuInit(runtime, runtime.sListMenuState.scroll, runtime.sListMenuState.row);
      runtime.gMainState += 1;
      break;
    }
    case 16:
      ItemPc_PlaceTopMenuScrollIndicatorArrows(runtime);
      runtime.gMainState += 1;
      break;
    case 17:
      runtime.operations.push('SetHelpContext:HELPCONTEXT_PLAYERS_PC_ITEMS');
      runtime.gMainState += 1;
      break;
    case 18:
      if (runtime.sListMenuState.initialized === 1) runtime.operations.push('BlendPalettes:PALETTES_ALL:16:RGB_BLACK');
      runtime.gMainState += 1;
      break;
    case 19:
      if (runtime.sListMenuState.initialized === 1) {
        runtime.operations.push('BeginNormalPaletteFade:PALETTES_ALL:0:16:0:RGB_BLACK');
      } else {
        BeginPCScreenEffect_TurnOn(runtime);
        ItemPc_SetInitializedFlag(runtime, true);
        PlaySE(runtime, 'SE_PC_LOGIN');
      }
      runtime.gMainState += 1;
      break;
    case 20:
      if (runtime.overworldLinkBusy !== true) runtime.gMainState += 1;
      break;
    default:
      SetVBlankCallback(runtime, 'ItemPc_VBlankCB');
      SetMainCallback2(runtime, 'ItemPc_MainCB');
      return true;
  }
  return false;
}

export function ItemPc_FadeAndBail(runtime: ItemPcRuntime): void {
  runtime.operations.push('BeginNormalPaletteFade:PALETTES_ALL:0:0:16:RGB_BLACK');
  CreateTask(runtime, 'Task_ItemPcWaitFadeAndBail');
  SetVBlankCallback(runtime, 'ItemPc_VBlankCB');
  SetMainCallback2(runtime, 'ItemPc_MainCB');
}

export function ItemPc_MainCB(runtime: ItemPcRuntime): void {
  runtime.operations.push('RunTasks');
  runtime.operations.push('AnimateSprites');
  runtime.operations.push('BuildOamBuffer');
  runtime.operations.push('DoScheduledBgTilemapCopiesToVram');
  runtime.operations.push('UpdatePaletteFade');
}

export function ItemPc_VBlankCB(runtime: ItemPcRuntime): void {
  runtime.operations.push('LoadOam');
  runtime.operations.push('ProcessSpriteCopyRequests');
  runtime.operations.push('TransferPlttBuffer');
}

export function Task_ItemPcWaitFadeAndBail(runtime: ItemPcRuntime, taskId: number): void {
  if (!runtime.paletteFadeActive) {
    SetMainCallback2(runtime, runtime.sListMenuState.savedCallback);
    ItemPc_FreeResources(runtime);
    DestroyTask(runtime, taskId);
  }
}

export function ItemPc_InitBgs(runtime: ItemPcRuntime): boolean {
  runtime.operations.push('ResetAllBgsCoordinatesAndBgCntRegs');
  runtime.sBg1TilemapBufferAllocated = true;
  runtime.operations.push('memset:sBg1TilemapBuffer:0:0x800');
  runtime.operations.push(`InitBgsFromTemplates:${sBgTemplates.length}`);
  runtime.operations.push('SetBgTilemapBuffer:1:sBg1TilemapBuffer');
  runtime.operations.push('ScheduleBgCopyTilemapToVram:1');
  runtime.operations.push('SetGpuReg:REG_OFFSET_DISPCNT:DISPCNT_OBJ_1D_MAP|DISPCNT_OBJ_ON');
  runtime.operations.push('SetGpuReg:REG_OFFSET_BLDCNT:0');
  runtime.operations.push('ShowBg:0');
  runtime.operations.push('ShowBg:1');
  return true;
}

export function ItemPc_LoadGraphics(runtime: ItemPcRuntime): boolean {
  const state = mustState(runtime);
  switch (state.data[0]) {
    case 0:
      runtime.operations.push('ResetTempTileDataBuffers');
      runtime.operations.push('DecompressAndCopyTileDataToVram:1:gItemPcTiles:0:0:0');
      state.data[0] += 1;
      break;
    case 1:
      runtime.operations.push('LZDecompressWram:gItemPcTilemap:sBg1TilemapBuffer');
      state.data[0] += 1;
      break;
    case 2:
      runtime.operations.push('LoadCompressedPalette:gItemPcBgPals:BG_PLTT_ID(0):3*PLTT_SIZE_4BPP');
      state.data[0] += 1;
      break;
    case 3:
      runtime.operations.push('LoadCompressedSpriteSheet:gBagSwapSpriteSheet');
      state.data[0] += 1;
      break;
    default:
      runtime.operations.push('LoadCompressedSpritePalette:gBagSwapSpritePalette');
      state.data[0] = 0;
      return true;
  }
  return false;
}

export function ItemPc_AllocateResourcesForListMenu(runtime: ItemPcRuntime): boolean {
  runtime.sListMenuItemsAllocated = true;
  runtime.sUnusedStringAllocationAllocated = true;
  return true;
}

export function ItemPc_BuildListMenuTemplate(runtime: ItemPcRuntime): void {
  const state = mustState(runtime);
  const items: Array<{ label: string; index: number }> = [];
  for (let i = 0; i < state.nItems; i += 1) {
    items.push({ label: ItemId_GetName(ItemPc_GetItemIdBySlotId(runtime, i)), index: i });
  }
  items.push({ label: 'gFameCheckerText_Cancel', index: LIST_CANCEL });
  runtime.gMultiuseListMenuTemplate = {
    items,
    totalItems: state.nItems + 1,
    windowId: 0,
    header_X: 0,
    item_X: 9,
    cursor_X: 1,
    lettersSpacing: 1,
    itemVerticalPadding: 2,
    upText_Y: 2,
    maxShowed: state.maxShowed,
    fontId: FONT_NORMAL,
    cursorPal: 2,
    fillValue: 0,
    cursorShadowPal: 3,
    scrollMultiple: 0,
    cursorKind: 0
  };
}

export function ItemPc_MoveCursorFunc(runtime: ItemPcRuntime, itemIndex: number, onInit: boolean): void {
  const state = mustState(runtime);
  if (onInit !== true) PlaySE(runtime, SE_SELECT);
  if (state.moveModeOrigPos === ITEM_PC_MOVE_MODE_NONE) {
    runtime.operations.push(`DestroyItemMenuIcon:${state.itemMenuIconSlot ^ 1}`);
    let desc: string;
    if (itemIndex !== LIST_CANCEL) {
      const itemId = ItemPc_GetItemIdBySlotId(runtime, itemIndex);
      runtime.operations.push(`CreateItemMenuIcon:${itemId}:${state.itemMenuIconSlot}`);
      desc = ItemId_GetPocket(itemId) === POCKET_TM_CASE ? `MoveName:${itemId}` : ItemId_GetDescription(itemId);
    } else {
      runtime.operations.push(`CreateItemMenuIcon:${ITEMS_COUNT}:${state.itemMenuIconSlot}`);
      desc = 'gText_ReturnToPC';
    }
    state.itemMenuIconSlot ^= 1;
    runtime.operations.push('FillWindowPixelBuffer:1:0');
    ItemPc_AddTextPrinterParameterized(runtime, 1, FONT_NORMAL, desc, 0, 3, 2, 0, 0, 3);
  }
}

export function ItemPc_ItemPrintFunc(runtime: ItemPcRuntime, windowId: number, itemId: number, y: number): void {
  const state = mustState(runtime);
  if (state.moveModeOrigPos !== ITEM_PC_MOVE_MODE_NONE) {
    if (state.moveModeOrigPos === itemId) ItemPc_PrintOrRemoveCursorAt(runtime, y, 2);
    else ItemPc_PrintOrRemoveCursorAt(runtime, y, ITEM_PC_MOVE_MODE_NONE);
  }
  if (itemId !== LIST_CANCEL) {
    const quantity = ItemPc_GetItemQuantityBySlotId(runtime, itemId);
    ItemPc_AddTextPrinterParameterized(runtime, windowId, FONT_SMALL, `x${quantity.toString().padStart(3, ' ')}`, 110, y, 0, 0, 0xff, 1);
  }
}

export function ItemPc_PrintOrRemoveCursor(runtime: ItemPcRuntime, _listMenuId: number, colorIdx: number): void {
  ItemPc_PrintOrRemoveCursorAt(runtime, ListMenuGetYCoordForPrintingArrowCursor(runtime), colorIdx);
}

export function ItemPc_PrintOrRemoveCursorAt(runtime: ItemPcRuntime, y: number, colorIdx: number): void {
  if (colorIdx === ITEM_PC_MOVE_MODE_NONE) runtime.operations.push(`FillWindowPixelRect:0:0:0:${y}:8:12`);
  else ItemPc_AddTextPrinterParameterized(runtime, 0, FONT_NORMAL, 'gText_SelectorArrow2', 0, y, 0, 0, 0, colorIdx);
}

export function ItemPc_PrintWithdrawItem(runtime: ItemPcRuntime): void {
  ItemPc_AddTextPrinterParameterized(runtime, 2, FONT_SMALL, 'gText_WithdrawItem', 0, 1, 0, 1, 0, 0);
}

export function ItemPc_PlaceTopMenuScrollIndicatorArrows(runtime: ItemPcRuntime): void {
  const state = mustState(runtime);
  state.scrollIndicatorArrowPairId = 0;
  runtime.operations.push(`AddScrollIndicatorArrowPairParameterized:2:128:8:104:${state.nItems - state.maxShowed + 1}:110:110:sListMenuState.scroll`);
}

export function ItemPc_PlaceWithdrawQuantityScrollIndicatorArrows(runtime: ItemPcRuntime): void {
  const state = mustState(runtime);
  state.withdrawQuantitySubmenuCursorPos = 1;
  state.scrollIndicatorArrowPairId = 0;
  runtime.operations.push('AddScrollIndicatorArrowPairParameterized:2:212:120:152:2:110:110:withdrawQuantitySubmenuCursorPos');
}

export function ItemPc_RemoveScrollIndicatorArrowPair(runtime: ItemPcRuntime): void {
  const state = mustState(runtime);
  if (state.scrollIndicatorArrowPairId !== ITEM_PC_SCROLL_ARROW_NONE) {
    runtime.operations.push(`RemoveScrollIndicatorArrowPair:${state.scrollIndicatorArrowPairId}`);
    state.scrollIndicatorArrowPairId = ITEM_PC_SCROLL_ARROW_NONE;
  }
}

export function ItemPc_SetCursorPosition(runtime: ItemPcRuntime): void {
  const state = mustState(runtime);
  if (runtime.sListMenuState.scroll !== 0 && runtime.sListMenuState.scroll + state.maxShowed > state.nItems + 1) {
    runtime.sListMenuState.scroll = (state.nItems + 1) - state.maxShowed;
  }
  if (runtime.sListMenuState.scroll + runtime.sListMenuState.row >= state.nItems + 1) {
    if (state.nItems + 1 < 2) runtime.sListMenuState.row = 0;
    else runtime.sListMenuState.row = state.nItems;
  }
}

export function ItemPc_FreeResources(runtime: ItemPcRuntime): void {
  runtime.sStateDataPtr = null;
  runtime.sBg1TilemapBufferAllocated = false;
  runtime.sListMenuItemsAllocated = false;
  runtime.sUnusedStringAllocationAllocated = false;
  runtime.operations.push('FreeAllWindowBuffers');
}

export function Task_ItemPcTurnOff1(runtime: ItemPcRuntime, taskId: number): void {
  if (runtime.sListMenuState.initialized === 1) {
    runtime.operations.push('BeginNormalPaletteFade:PALETTES_ALL:0:0:16:RGB_BLACK');
  } else {
    BeginPCScreenEffect_TurnOff(runtime);
    PlaySE(runtime, 'SE_PC_OFF');
  }
  runtime.tasks[taskId].func = 'Task_ItemPcTurnOff2';
}

export function Task_ItemPcTurnOff2(runtime: ItemPcRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (!runtime.paletteFadeActive && !runtime.pcScreenEffectTurnOffRunning) {
    DestroyListMenuTask(runtime, data[0]);
    SetMainCallback2(runtime, mustState(runtime).savedCallback ?? runtime.sListMenuState.savedCallback);
    ItemPc_RemoveScrollIndicatorArrowPair(runtime);
    ItemPc_FreeResources(runtime);
    DestroyTask(runtime, taskId);
  }
}

export function ItemPc_GetCursorPosition(runtime: ItemPcRuntime): number {
  return runtime.sListMenuState.scroll + runtime.sListMenuState.row;
}

export function ItemPc_GetItemIdBySlotId(runtime: ItemPcRuntime, idx: number): number {
  return runtime.itemRuntime.gSaveBlock1Ptr.pcItems[idx]?.itemId ?? ITEM_NONE;
}

export function ItemPc_GetItemQuantityBySlotId(runtime: ItemPcRuntime, idx: number): number {
  return GetPcItemQuantity(runtime.itemRuntime, runtime.itemRuntime.gSaveBlock1Ptr.pcItems[idx]);
}

export function ItemPc_CountPcItems(runtime: ItemPcRuntime): void {
  const state = mustState(runtime);
  ItemPcCompaction(runtime.itemRuntime);
  state.nItems = 0;
  for (let i = 0; i < PC_ITEMS_COUNT; state.nItems += 1, i += 1) {
    if (runtime.itemRuntime.gSaveBlock1Ptr.pcItems[i].itemId === ITEM_NONE) break;
  }
  state.maxShowed = state.nItems + 1 <= 6 ? state.nItems + 1 : 6;
}

export function ItemPc_SetScrollPosition(runtime: ItemPcRuntime): void {
  const state = mustState(runtime);
  if (runtime.sListMenuState.row > 3) {
    for (let i = 0; i <= runtime.sListMenuState.row - 3; runtime.sListMenuState.row -= 1, runtime.sListMenuState.scroll += 1, i += 1) {
      if (runtime.sListMenuState.scroll + state.maxShowed === state.nItems + 1) break;
    }
  }
}

export function ItemPc_SetMessageWindowPalette(runtime: ItemPcRuntime, palIdx: number): void {
  runtime.operations.push(`SetBgTilemapPalette:1:0:14:30:6:${palIdx + 1}`);
  runtime.operations.push('ScheduleBgCopyTilemapToVram:1');
}

export function ItemPc_SetInitializedFlag(runtime: ItemPcRuntime, flag: boolean): void {
  runtime.sListMenuState.initialized = flag ? 1 : 0;
}

export function Task_ItemPcMain(runtime: ItemPcRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (!runtime.paletteFadeActive && !runtime.pcScreenEffectTurnOnRunning) {
    if ((runtime.newKeys & (1 << 2)) !== 0) {
      if (runtime.sListMenuState.scroll + runtime.sListMenuState.row !== mustState(runtime).nItems) {
        PlaySE(runtime, SE_SELECT);
        ItemPc_MoveItemModeInit(runtime, taskId, runtime.sListMenuState.scroll + runtime.sListMenuState.row);
        return;
      }
    }
    const input = ListMenu_ProcessInput(runtime);
    data[0] = runtime.activeListMenuId;
    switch (input) {
      case MENU_NOTHING_CHOSEN:
        break;
      case LIST_CANCEL:
        PlaySE(runtime, SE_SELECT);
        ItemPc_SetInitializedFlag(runtime, false);
        runtime.tasks[taskId].func = 'Task_ItemPcTurnOff1';
        break;
      default:
        PlaySE(runtime, SE_SELECT);
        ItemPc_SetMessageWindowPalette(runtime, 1);
        ItemPc_RemoveScrollIndicatorArrowPair(runtime);
        data[1] = input;
        data[2] = ItemPc_GetItemQuantityBySlotId(runtime, input);
        ItemPc_PrintOrRemoveCursor(runtime, data[0], 2);
        runtime.tasks[taskId].func = 'Task_ItemPcSubmenuInit';
        break;
    }
  }
}

export function ItemPc_ReturnFromSubmenu(runtime: ItemPcRuntime, taskId: number): void {
  ItemPc_SetMessageWindowPalette(runtime, 0);
  ItemPc_PlaceTopMenuScrollIndicatorArrows(runtime);
  runtime.tasks[taskId].func = 'Task_ItemPcMain';
}

export function ItemPc_MoveItemModeInit(runtime: ItemPcRuntime, taskId: number, pos: number): void {
  const state = mustState(runtime);
  const data = runtime.tasks[taskId].data;
  runtime.gMultiuseListMenuTemplate.cursorKind = 1;
  data[1] = pos;
  state.moveModeOrigPos = pos;
  runtime.operations.push(`StringExpandPlaceholders:gOtherText_WhereShouldTheStrVar1BePlaced:${ItemId_GetName(ItemPc_GetItemIdBySlotId(runtime, data[1]))}`);
  runtime.operations.push('FillWindowPixelBuffer:1:0');
  ItemPc_AddTextPrinterParameterized(runtime, 1, FONT_NORMAL, 'gOtherText_WhereShouldTheStrVar1BePlaced', 0, 3, 2, 3, 0, 0);
  runtime.operations.push(`UpdateSwapLinePos:-32:${ListMenuGetYCoordForPrintingArrowCursor(runtime)}`);
  runtime.operations.push('SetSwapLineInvisibility:false');
  ItemPc_PrintOrRemoveCursor(runtime, data[0], 2);
  runtime.tasks[taskId].func = 'Task_ItemPcMoveItemModeRun';
}

export function Task_ItemPcMoveItemModeRun(runtime: ItemPcRuntime, taskId: number): void {
  ListMenu_ProcessInput(runtime);
  runtime.operations.push(`UpdateSwapLinePos:-32:${ListMenuGetYCoordForPrintingArrowCursor(runtime)}`);
  if ((runtime.newKeys & (A_BUTTON | (1 << 2))) !== 0) {
    PlaySE(runtime, SE_SELECT);
    mustState(runtime).moveModeOrigPos = ITEM_PC_MOVE_MODE_NONE;
    ItemPc_InsertItemIntoNewSlot(runtime, taskId, runtime.sListMenuState.scroll + runtime.sListMenuState.row);
  } else if ((runtime.newKeys & B_BUTTON) !== 0) {
    PlaySE(runtime, SE_SELECT);
    mustState(runtime).moveModeOrigPos = ITEM_PC_MOVE_MODE_NONE;
    ItemPc_MoveItemModeCancel(runtime, taskId, runtime.sListMenuState.scroll + runtime.sListMenuState.row);
  }
}

export function ItemPc_InsertItemIntoNewSlot(runtime: ItemPcRuntime, taskId: number, pos: number): void {
  const data = runtime.tasks[taskId].data;
  if (data[1] === pos || data[1] === pos - 1) {
    ItemPc_MoveItemModeCancel(runtime, taskId, pos);
  } else {
    MoveItemSlotInList(runtime.itemRuntime.gSaveBlock1Ptr.pcItems, data[1], pos);
    DestroyListMenuTask(runtime, data[0]);
    if (data[1] < pos) runtime.sListMenuState.row -= 1;
    ItemPc_BuildListMenuTemplate(runtime);
    data[0] = ListMenuInit(runtime, runtime.sListMenuState.scroll, runtime.sListMenuState.row);
    runtime.operations.push('SetSwapLineInvisibility:true');
    runtime.tasks[taskId].func = 'Task_ItemPcMain';
  }
}

export function ItemPc_MoveItemModeCancel(runtime: ItemPcRuntime, taskId: number, pos: number): void {
  const data = runtime.tasks[taskId].data;
  DestroyListMenuTask(runtime, data[0]);
  if (data[1] < pos) runtime.sListMenuState.row -= 1;
  ItemPc_BuildListMenuTemplate(runtime);
  data[0] = ListMenuInit(runtime, runtime.sListMenuState.scroll, runtime.sListMenuState.row);
  runtime.operations.push('SetSwapLineInvisibility:true');
  runtime.tasks[taskId].func = 'Task_ItemPcMain';
}

export function Task_ItemPcSubmenuInit(runtime: ItemPcRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  ItemPc_SetBorderStyleOnWindow(runtime, 4);
  const windowId = ItemPc_GetOrCreateSubwindow(runtime, 0);
  runtime.operations.push('PrintTextArray:4:FONT_NORMAL:8:2:14:3:sItemPcSubmenuOptions');
  runtime.operations.push('Menu_InitCursor:4:FONT_NORMAL:0:2:14:3:0');
  ItemPc_AddTextPrinterParameterized(runtime, windowId, FONT_NORMAL, `Selected:${ItemPc_GetItemIdBySlotId(runtime, data[1])}`, 0, 2, 1, 0, 0, 1);
  runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
  runtime.tasks[taskId].func = 'Task_ItemPcSubmenuRun';
}

export function Task_ItemPcSubmenuRun(runtime: ItemPcRuntime, taskId: number): void {
  const input = Menu_ProcessInputNoWrapAround(runtime);
  switch (input) {
    case MENU_B_PRESSED:
      PlaySE(runtime, SE_SELECT);
      Task_ItemPcCancel(runtime, taskId);
      break;
    case MENU_NOTHING_CHOSEN:
      break;
    case 0:
      PlaySE(runtime, SE_SELECT);
      Task_ItemPcWithdraw(runtime, taskId);
      break;
    case 1:
      PlaySE(runtime, SE_SELECT);
      Task_ItemPcGive(runtime, taskId);
      break;
    default:
      PlaySE(runtime, SE_SELECT);
      Task_ItemPcCancel(runtime, taskId);
      break;
  }
}

export function Task_ItemPcWithdraw(runtime: ItemPcRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  runtime.operations.push('ClearStdWindowAndFrameToTransparent:4:false');
  ItemPc_DestroySubwindow(runtime, 0);
  runtime.operations.push('ClearWindowTilemap:4');
  data[8] = 1;
  if (ItemPc_GetItemQuantityBySlotId(runtime, data[1]) === 1) {
    runtime.operations.push('PutWindowTilemap:0');
    runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
    ItemPc_DoWithdraw(runtime, taskId);
  } else {
    runtime.operations.push('PutWindowTilemap:0');
    ItemPc_WithdrawMultipleInitWindow(runtime, data[1]);
    ItemPc_PlaceWithdrawQuantityScrollIndicatorArrows(runtime);
    runtime.tasks[taskId].func = 'Task_ItemPcHandleWithdrawMultiple';
  }
}

export function ItemPc_DoWithdraw(runtime: ItemPcRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  const itemId = ItemPc_GetItemIdBySlotId(runtime, data[1]);
  if (AddBagItem(runtime.itemRuntime, itemId, data[8]) === true) {
    runtime.operations.push(`${QL_EVENT_WITHDREW_ITEM_PC}:${itemId}`);
    const windowId = ItemPc_GetOrCreateSubwindow(runtime, 2);
    runtime.operations.push(`AddTextPrinterParameterized:${windowId}:gText_WithdrewQuantItem:${itemId}:${data[8]}`);
    runtime.tasks[taskId].func = 'Task_ItemPcWaitButtonAndFinishWithdrawMultiple';
  } else {
    const windowId = ItemPc_GetOrCreateSubwindow(runtime, 2);
    runtime.operations.push(`AddTextPrinterParameterized:${windowId}:gText_NoMoreRoomInBag`);
    runtime.tasks[taskId].func = 'Task_ItemPcWaitButtonWithdrawMultipleFailed';
  }
}

export function Task_ItemPcWaitButtonAndFinishWithdrawMultiple(runtime: ItemPcRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if ((runtime.newKeys & (A_BUTTON | B_BUTTON)) !== 0) {
    PlaySE(runtime, SE_SELECT);
    const itemId = ItemPc_GetItemIdBySlotId(runtime, data[1]);
    RemovePCItem(runtime.itemRuntime, itemId, data[8]);
    ItemPcCompaction(runtime.itemRuntime);
    Task_ItemPcCleanUpWithdraw(runtime, taskId);
  }
}

export function Task_ItemPcWaitButtonWithdrawMultipleFailed(runtime: ItemPcRuntime, taskId: number): void {
  if ((runtime.newKeys & (A_BUTTON | B_BUTTON)) !== 0) {
    PlaySE(runtime, SE_SELECT);
    Task_ItemPcCleanUpWithdraw(runtime, taskId);
  }
}

export function Task_ItemPcCleanUpWithdraw(runtime: ItemPcRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  ItemPc_DestroySubwindow(runtime, 2);
  runtime.operations.push('PutWindowTilemap:1');
  DestroyListMenuTask(runtime, data[0]);
  ItemPc_CountPcItems(runtime);
  ItemPc_SetCursorPosition(runtime);
  ItemPc_BuildListMenuTemplate(runtime);
  data[0] = ListMenuInit(runtime, runtime.sListMenuState.scroll, runtime.sListMenuState.row);
  runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
  ItemPc_ReturnFromSubmenu(runtime, taskId);
}

export function ItemPc_WithdrawMultipleInitWindow(runtime: ItemPcRuntime, slotId: number): void {
  const itemId = ItemPc_GetItemIdBySlotId(runtime, slotId);
  runtime.operations.push(`AddTextPrinterParameterized:${ItemPc_GetOrCreateSubwindow(runtime, 1)}:gText_WithdrawHowMany:${itemId}`);
  ItemPc_SetBorderStyleOnWindow(runtime, 3);
  ItemPc_AddTextPrinterParameterized(runtime, 3, FONT_SMALL, 'x001', 8, 10, 1, 0, 0, 1);
  runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
}

export function UpdateWithdrawQuantityDisplay(runtime: ItemPcRuntime, quantity: number): void {
  runtime.operations.push('FillWindowPixelRect:3:PIXEL_FILL(1):10:10:28:12');
  ItemPc_AddTextPrinterParameterized(runtime, 3, FONT_SMALL, `x${quantity.toString().padStart(3, '0')}`, 8, 10, 1, 0, 0, 1);
}

export function Task_ItemPcHandleWithdrawMultiple(runtime: ItemPcRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (adjustQuantityAccordingToDPadInputAdapter(runtime, data, 8, data[2]) === true) {
    UpdateWithdrawQuantityDisplay(runtime, data[8]);
  } else if ((runtime.newKeys & A_BUTTON) !== 0) {
    PlaySE(runtime, SE_SELECT);
    ItemPc_DestroySubwindow(runtime, 1);
    runtime.operations.push('ClearWindowTilemap:3');
    runtime.operations.push('PutWindowTilemap:0');
    ItemPc_PrintOrRemoveCursor(runtime, data[0], 1);
    runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
    ItemPc_RemoveScrollIndicatorArrowPair(runtime);
    ItemPc_DoWithdraw(runtime, taskId);
  } else if ((runtime.newKeys & B_BUTTON) !== 0) {
    PlaySE(runtime, SE_SELECT);
    runtime.operations.push('ClearStdWindowAndFrameToTransparent:3:false');
    ItemPc_DestroySubwindow(runtime, 1);
    runtime.operations.push('ClearWindowTilemap:3');
    runtime.operations.push('PutWindowTilemap:0');
    runtime.operations.push('PutWindowTilemap:1');
    ItemPc_PrintOrRemoveCursor(runtime, data[0], 1);
    runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
    ItemPc_RemoveScrollIndicatorArrowPair(runtime);
    ItemPc_ReturnFromSubmenu(runtime, taskId);
  }
}

export function Task_ItemPcGive(runtime: ItemPcRuntime, taskId: number): void {
  if (runtime.partyCount === 0) {
    runtime.operations.push('ClearStdWindowAndFrameToTransparent:4:false');
    ItemPc_DestroySubwindow(runtime, 0);
    runtime.operations.push('ClearWindowTilemap:4');
    runtime.operations.push('PutWindowTilemap:0');
    ItemPc_PrintOnWindow5WithContinueTask(runtime, taskId, 'gText_ThereIsNoPokemon', 'gTask_ItemPcWaitButtonAndExitSubmenu');
  } else {
    mustState(runtime).savedCallback = 'ItemPc_CB2_SwitchToPartyMenu';
    Task_ItemPcTurnOff1(runtime, taskId);
  }
}

export function ItemPc_CB2_SwitchToPartyMenu(runtime: ItemPcRuntime): void {
  runtime.operations.push('InitPartyMenu:0:0:6:0:6:Task_HandleChooseMonInput:ItemPc_CB2_ReturnFromPartyMenu');
  runtime.partyMenuBagItem = ItemPc_GetItemIdBySlotId(runtime, ItemPc_GetCursorPosition(runtime));
}

export function ItemPc_CB2_ReturnFromPartyMenu(runtime: ItemPcRuntime): void {
  ItemPc_Init(runtime, 1, '');
}

export function gTask_ItemPcWaitButtonAndExitSubmenu(runtime: ItemPcRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if ((runtime.newKeys & A_BUTTON) !== 0) {
    PlaySE(runtime, SE_SELECT);
    runtime.operations.push('ClearDialogWindowAndFrameToTransparent:5:false');
    runtime.operations.push('ClearWindowTilemap:5');
    runtime.operations.push('PutWindowTilemap:1');
    ItemPc_PrintOrRemoveCursor(runtime, data[0], 1);
    runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
    ItemPc_ReturnFromSubmenu(runtime, taskId);
  }
}

export function Task_ItemPcCancel(runtime: ItemPcRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  runtime.operations.push('ClearStdWindowAndFrameToTransparent:4:false');
  ItemPc_DestroySubwindow(runtime, 0);
  runtime.operations.push('ClearWindowTilemap:4');
  runtime.operations.push('PutWindowTilemap:0');
  runtime.operations.push('PutWindowTilemap:1');
  ItemPc_PrintOrRemoveCursor(runtime, data[0], 1);
  runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
  ItemPc_ReturnFromSubmenu(runtime, taskId);
}

export function ItemPc_InitWindows(runtime: ItemPcRuntime): void {
  runtime.operations.push('InitWindows:sWindowTemplates');
  runtime.operations.push('DeactivateAllTextPrinters');
  runtime.operations.push('LoadUserWindowGfx:0:0x3C0:BG_PLTT_ID(14)');
  runtime.operations.push('LoadStdWindowGfx:0:0x3A3:BG_PLTT_ID(12)');
  runtime.operations.push('LoadMenuMessageWindowGfx:0:0x3AC:BG_PLTT_ID(11)');
  runtime.operations.push('LoadPalette:GetTextWindowPalette(2):BG_PLTT_ID(13):PLTT_SIZE_4BPP');
  runtime.operations.push('LoadPalette:gStandardMenuPalette:BG_PLTT_ID(15):PLTT_SIZE_4BPP');
  for (let i = 0; i < 3; i += 1) {
    runtime.operations.push(`FillWindowPixelBuffer:${i}:0`);
    runtime.operations.push(`PutWindowTilemap:${i}`);
  }
  runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
  runtime.sSubmenuWindowIds = [ITEM_PC_SCROLL_ARROW_NONE, ITEM_PC_SCROLL_ARROW_NONE, ITEM_PC_SCROLL_ARROW_NONE];
}

export function ItemPc_AddTextPrinterParameterized(runtime: ItemPcRuntime, windowId: number, fontId: number, str: string, x: number, y: number, letterSpacing: number, lineSpacing: number, speed: number, colorIdx: number): void {
  runtime.operations.push(`AddTextPrinterParameterized4:${windowId}:${fontId}:${x}:${y}:${letterSpacing}:${lineSpacing}:${sTextColors[colorIdx]?.join(',') ?? ''}:${speed}:${str}`);
}

export function unused_ItemPc_AddTextPrinterParameterized(runtime: ItemPcRuntime, windowId: number, str: string, x: number, y: number, letterSpacing: number, lineSpacing: number, speed: number): void {
  runtime.operations.push(`AddTextPrinter:${windowId}:FONT_NORMAL_COPY_2:${x}:${y}:${x}:${y}:2:0:3:${letterSpacing}:base:${lineSpacing}:base:${speed}:${str}`);
}

export function ItemPc_SetBorderStyleOnWindow(runtime: ItemPcRuntime, windowId: number): void {
  runtime.operations.push(`DrawStdFrameWithCustomTileAndPalette:${windowId}:false:0x3C0:14`);
}

export function ItemPc_GetOrCreateSubwindow(runtime: ItemPcRuntime, idx: number): number {
  if (runtime.sSubmenuWindowIds[idx] === ITEM_PC_SCROLL_ARROW_NONE) {
    const id = AddWindow(runtime, sSubwindowTemplates[idx]);
    runtime.sSubmenuWindowIds[idx] = id;
    runtime.operations.push(`DrawStdFrameWithCustomTileAndPalette:${id}:true:0x3A3:12`);
  }
  return runtime.sSubmenuWindowIds[idx];
}

export function ItemPc_DestroySubwindow(runtime: ItemPcRuntime, idx: number): void {
  const id = runtime.sSubmenuWindowIds[idx];
  runtime.operations.push(`ClearStdWindowAndFrameToTransparent:${id}:false`);
  runtime.operations.push(`ClearWindowTilemap:${id}`);
  RemoveWindow(runtime, id);
  runtime.sSubmenuWindowIds[idx] = ITEM_PC_SCROLL_ARROW_NONE;
}

export function ItemPc_GetSubwindow(runtime: ItemPcRuntime, idx: number): number {
  return runtime.sSubmenuWindowIds[idx];
}

export function ItemPc_PrintOnWindow5WithContinueTask(runtime: ItemPcRuntime, taskId: number, str: string, taskFunc: ItemPcTaskFunc): void {
  runtime.operations.push(`DisplayMessageAndContinueTask:${taskId}:5:0x3AC:0x0B:${FONT_NORMAL}:GetTextSpeedSetting:${str}:${taskFunc}`);
  runtime.tasks[taskId].func = taskFunc;
  runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
}

export function tickItemPcTask(runtime: ItemPcRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) return;
  switch (task.func) {
    case 'Task_ItemPcMain': Task_ItemPcMain(runtime, taskId); break;
    case 'Task_ItemPcTurnOff1': Task_ItemPcTurnOff1(runtime, taskId); break;
    case 'Task_ItemPcTurnOff2': Task_ItemPcTurnOff2(runtime, taskId); break;
    case 'Task_ItemPcWaitFadeAndBail': Task_ItemPcWaitFadeAndBail(runtime, taskId); break;
    case 'Task_ItemPcMoveItemModeRun': Task_ItemPcMoveItemModeRun(runtime, taskId); break;
    case 'Task_ItemPcSubmenuInit': Task_ItemPcSubmenuInit(runtime, taskId); break;
    case 'Task_ItemPcSubmenuRun': Task_ItemPcSubmenuRun(runtime, taskId); break;
    case 'Task_ItemPcWithdraw': Task_ItemPcWithdraw(runtime, taskId); break;
    case 'Task_ItemPcHandleWithdrawMultiple': Task_ItemPcHandleWithdrawMultiple(runtime, taskId); break;
    case 'Task_ItemPcWaitButtonAndFinishWithdrawMultiple': Task_ItemPcWaitButtonAndFinishWithdrawMultiple(runtime, taskId); break;
    case 'Task_ItemPcWaitButtonWithdrawMultipleFailed': Task_ItemPcWaitButtonWithdrawMultipleFailed(runtime, taskId); break;
    case 'Task_ItemPcCleanUpWithdraw': Task_ItemPcCleanUpWithdraw(runtime, taskId); break;
    case 'Task_ItemPcGive': Task_ItemPcGive(runtime, taskId); break;
    case 'gTask_ItemPcWaitButtonAndExitSubmenu': gTask_ItemPcWaitButtonAndExitSubmenu(runtime, taskId); break;
    case 'Task_ItemPcCancel': Task_ItemPcCancel(runtime, taskId); break;
  }
}

export function MoveItemSlotInList(itemSlots: ItemSlot[], from: number, to_: number): void {
  let to = to_;
  if (from !== to) {
    const firstSlot = { ...itemSlots[from] };
    if (to > from) {
      to -= 1;
      for (let i = from, count = to; i < count; i += 1) itemSlots[i] = { ...itemSlots[i + 1] };
    } else {
      for (let i = from, count = to; i > count; i -= 1) itemSlots[i] = { ...itemSlots[i - 1] };
    }
    itemSlots[to] = firstSlot;
  }
}

function emptyListMenuTemplate(): ItemPcListMenuTemplate {
  return {
    totalItems: 0,
    windowId: 0,
    header_X: 0,
    item_X: 0,
    cursor_X: 0,
    lettersSpacing: 0,
    itemVerticalPadding: 0,
    upText_Y: 0,
    maxShowed: 0,
    fontId: FONT_NORMAL,
    cursorPal: 0,
    fillValue: 0,
    cursorShadowPal: 0,
    scrollMultiple: 0,
    cursorKind: 0,
    items: []
  };
}

function mustState(runtime: ItemPcRuntime): ItemPcResources {
  if (!runtime.sStateDataPtr) throw new Error('ItemPc state not initialized');
  return runtime.sStateDataPtr;
}

function CreateTask(runtime: ItemPcRuntime, func: ItemPcTaskFunc): number {
  const id = runtime.tasks.length;
  runtime.tasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.operations.push(`CreateTask:${id}:${func}:0`);
  return id;
}

function DestroyTask(runtime: ItemPcRuntime, taskId: number): void {
  runtime.tasks[taskId].destroyed = true;
  runtime.operations.push(`DestroyTask:${taskId}`);
}

function ListMenuInit(runtime: ItemPcRuntime, scroll: number, row: number): number {
  runtime.sListMenuState.scroll = scroll;
  runtime.sListMenuState.row = row;
  runtime.activeListMenuId = runtime.nextListMenuId;
  runtime.nextListMenuId += 1;
  runtime.operations.push(`ListMenuInit:${runtime.activeListMenuId}:${scroll}:${row}`);
  return runtime.activeListMenuId;
}

function DestroyListMenuTask(runtime: ItemPcRuntime, listMenuId: number): void {
  runtime.listMenuTaskDestroyed = true;
  runtime.operations.push(`DestroyListMenuTask:${listMenuId}:${runtime.sListMenuState.scroll}:${runtime.sListMenuState.row}`);
}

function ListMenu_ProcessInput(runtime: ItemPcRuntime): number {
  const input = runtime.nextListInput;
  runtime.nextListInput = MENU_NOTHING_CHOSEN;
  return input;
}

function ListMenuGetYCoordForPrintingArrowCursor(runtime: ItemPcRuntime): number {
  return 2 + runtime.sListMenuState.row * 16;
}

function Menu_ProcessInputNoWrapAround(runtime: ItemPcRuntime): number {
  if ((runtime.newKeys & A_BUTTON) !== 0) return 0;
  if ((runtime.newKeys & B_BUTTON) !== 0) return MENU_B_PRESSED;
  if ((runtime.newKeys & DPAD_UP) !== 0) return MENU_NOTHING_CHOSEN;
  if ((runtime.newKeys & DPAD_DOWN) !== 0) return MENU_NOTHING_CHOSEN;
  return MENU_NOTHING_CHOSEN;
}

function adjustQuantityAccordingToDPadInputAdapter(runtime: ItemPcRuntime, data: number[], index: number, max: number): boolean {
  const before = data[index];
  const adjusted = adjustQuantityAccordingToDPadInput(data[index], max, {
    upPressed: (runtime.newKeys & DPAD_UP) !== 0,
    downPressed: (runtime.newKeys & DPAD_DOWN) !== 0,
    leftPressed: false,
    rightPressed: false
  });
  data[index] = adjusted.quantity;
  return adjusted.quantity !== before;
}

function AddWindow(runtime: ItemPcRuntime, template: ItemPcWindowTemplate): number {
  const id = runtime.nextWindowId;
  runtime.nextWindowId += 1;
  runtime.windows.set(id, template);
  runtime.operations.push(`AddWindow:${id}:${template.bg}:${template.tilemapLeft}:${template.tilemapTop}:${template.width}:${template.height}:${template.paletteNum}:${template.baseBlock}`);
  return id;
}

function RemoveWindow(runtime: ItemPcRuntime, windowId: number): void {
  runtime.windows.delete(windowId);
  runtime.operations.push(`RemoveWindow:${windowId}`);
}

function PlaySE(runtime: ItemPcRuntime, se: string): void {
  runtime.operations.push(`PlaySE:${se}`);
}

function BeginPCScreenEffect_TurnOn(runtime: ItemPcRuntime): void {
  runtime.pcScreenEffectTurnOnRunning = true;
  runtime.operations.push('BeginPCScreenEffect_TurnOn:0:0:0');
}

function BeginPCScreenEffect_TurnOff(runtime: ItemPcRuntime): void {
  runtime.pcScreenEffectTurnOffRunning = true;
  runtime.operations.push('BeginPCScreenEffect_TurnOff:0:0:0');
}

function SetMainCallback2(runtime: ItemPcRuntime, callback: string | null): void {
  runtime.mainCallback2 = callback;
  runtime.operations.push(`SetMainCallback2:${callback ?? 'NULL'}`);
}

function SetVBlankCallback(runtime: ItemPcRuntime, callback: string | null): void {
  runtime.vblankCallback = callback;
  runtime.operations.push(`SetVBlankCallback:${callback ?? 'NULL'}`);
}

function parseBgTemplates(source: string): Array<{ bg: number; charBaseIndex: number; mapBaseIndex: number; priority: number }> {
  const body = source.match(/static const struct BgTemplate sBgTemplates\[2\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\.bg = (\d+),\s*\.charBaseIndex = (\d+),\s*\.mapBaseIndex = (\d+),\s*\.priority = (\d+)/gu)]
    .map(([, bg, charBaseIndex, mapBaseIndex, priority]) => ({
      bg: Number.parseInt(bg, 10),
      charBaseIndex: Number.parseInt(charBaseIndex, 10),
      mapBaseIndex: Number.parseInt(mapBaseIndex, 10),
      priority: Number.parseInt(priority, 10)
    }));
}

function parseWindowTemplates(source: string, symbol: string): ItemPcWindowTemplate[] {
  const body = source.match(new RegExp(`static const struct WindowTemplate ${symbol}\\[\\] = \\{([\\s\\S]*?)\\n\\};`, 'u'))?.[1] ?? '';
  return [...body.matchAll(/\.bg = (\d+),\s*\.tilemapLeft = (\d+),\s*\.tilemapTop = (\d+),\s*\.width = (\d+),\s*\.height = (\d+),\s*\.paletteNum = (\d+),\s*\.baseBlock = (0x[0-9a-fA-F]+)/gu)]
    .map(([, bg, tilemapLeft, tilemapTop, width, height, paletteNum, baseBlock]) => ({
      bg: Number.parseInt(bg, 10),
      tilemapLeft: Number.parseInt(tilemapLeft, 10),
      tilemapTop: Number.parseInt(tilemapTop, 10),
      width: Number.parseInt(width, 10),
      height: Number.parseInt(height, 10),
      paletteNum: Number.parseInt(paletteNum, 10),
      baseBlock: Number.parseInt(baseBlock, 16)
    }));
}

function parseTextColors(source: string): readonly (readonly string[])[] {
  const body = source.match(/static const u8 sTextColors\[\]\[3\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\{\s*([^}]+)\s*\}/gu)].map(([, row]) => row.split(',').map((part) => part.trim()));
}
