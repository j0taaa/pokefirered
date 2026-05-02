import shopSource from '../../../src/shop.c?raw';
import itemsConstantsSource from '../../../include/constants/items.h?raw';
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
  ITEMS_COUNT,
  ITEM_NONE,
  ItemId_GetDescription,
  ItemId_GetName,
  ItemId_GetPocket,
  ItemId_GetPrice,
  POCKET_TM_CASE,
  type ItemRuntime
} from './decompItem';
import { adjustQuantityAccordingToDPadInput } from './decompMenuHelpers';
import { getMoney, isEnoughMoney, removeMoney, type DecompMoneyState } from './decompMoney';

export const MART_TYPE_REGULAR = 0;
export const MART_TYPE_TMHM = 1;
export const MART_TYPE_DECOR = 2;
export const MART_TYPE_DECOR2 = 3;
export const LIST_NOTHING_CHOSEN = -1;
export const LIST_CANCEL = -2;
export const QL_EVENT_BOUGHT_ITEM = 37;
export const QL_EVENT_SOLD_ITEM = 38;
export const QL_EVENT_USED_POKEMART = QL_EVENT_BOUGHT_ITEM - 1;
export const ITEM_DEVON_SCOPE = parseItemConstant('ITEM_DEVON_SCOPE');

export interface ShopData {
  callback: string | null;
  itemList: readonly number[];
  itemPrice: number;
  selectedRow: number;
  scrollOffset: number;
  itemCount: number;
  itemsShowed: number;
  maxQuantity: number;
  martType: number;
  fontId: number;
  itemSlot: number;
  unk16_11: number;
  unk18: number;
}

export interface ShopTask {
  id: number;
  func: ShopTaskFunc;
  data: number[];
  wordArgs: Record<number, string>;
  destroyed: boolean;
}

export type ShopTaskFunc =
  | 'Task_ShopMenu'
  | 'Task_GoToBuyOrSellMenu'
  | 'Task_ReturnToShopMenu'
  | 'Task_BuyMenu'
  | 'Task_BuyHowManyDialogueInit'
  | 'Task_BuyHowManyDialogueHandleInput'
  | 'CreateBuyMenuConfirmPurchaseWindow'
  | 'BuyMenuTryMakePurchase'
  | 'BuyMenuSubtractMoney'
  | 'Task_ReturnToItemListAfterItemPurchase'
  | 'Task_ExitBuyMenu';

export interface ShopListMenuTemplate {
  items: Array<{ label: string; index: number }>;
  totalItems: number;
  windowId: number;
  header_X: number;
  item_X: number;
  cursor_X: number;
  lettersSpacing: number;
  itemVerticalPadding: number;
  upText_Y: number;
  fontId: number;
  fillValue: number;
  cursorPal: number;
  cursorShadowPal: number;
  scrollMultiple: number;
  cursorKind: number;
  maxShowed: number;
}

export interface QuestLogShopHistory {
  logEventId: number;
  lastItemId: number;
  itemQuantity: number;
  totalMoney: number;
  hasMultipleTransactions: boolean;
  mapSec: number;
}

export interface ShopRuntime {
  itemRuntime: ItemRuntime;
  moneyState: DecompMoneyState;
  sShopData: ShopData;
  sShopMenuWindowId: number;
  gShopTilemapBuffer1: number[] | null;
  gShopTilemapBuffer2: number[] | null;
  gShopTilemapBuffer3: number[] | null;
  gShopTilemapBuffer4: number[] | null;
  sShopMenuListMenu: ShopListMenuTemplate['items'] | null;
  sShopMenuItemStrings: string[] | null;
  sHistory: [QuestLogShopHistory, QuestLogShopHistory];
  gMultiuseListMenuTemplate: ShopListMenuTemplate;
  tasks: ShopTask[];
  nextTaskId: number;
  nextListTaskId: number;
  listTaskDestroyed: boolean;
  gMainState: number;
  gPaletteFadeActive: boolean;
  weatherFadingDone: boolean;
  newKeys: number;
  menuCursorPos: number;
  nextMenuInput: number;
  nextListInput: number;
  mainCallback2: string | null;
  vblankCallback: string | null;
  gFieldCallback: string | null;
  scriptContextEnabled: boolean;
  gameStats: Record<string, number>;
  questLogEvents: Array<{ eventId: number; history: QuestLogShopHistory }>;
  objectEvents: Array<{ id: number; x: number; y: number; elevation: number; facingDirection: string; graphicsId: number }>;
  playerFacing: { x: number; y: number };
  playerElevation: number;
  viewportObjectEvents: number[][];
  mapMetatiles: Map<string, { metatile: number; layerType: number; tiles: readonly number[] }>;
  operations: string[];
}

export const sShopMenuActions_BuySellQuit = [
  { text: 'gText_ShopBuy', func: 'Task_HandleShopMenuBuy' },
  { text: 'gText_ShopSell', func: 'Task_HandleShopMenuSell' },
  { text: 'gText_ShopQuit', func: 'Task_HandleShopMenuQuit' }
] as const;
export const sShopMenuWindowTemplate = parseWindowTemplate(shopSource, 'sShopMenuWindowTemplate');
export const sShopBuyMenuBgTemplates = parseBgTemplates(shopSource);

export const createShopRuntime = (itemRuntime: ItemRuntime, moneyState: DecompMoneyState): ShopRuntime => ({
  itemRuntime,
  moneyState,
  sShopData: {
    callback: null,
    itemList: [],
    itemPrice: 0,
    selectedRow: 0,
    scrollOffset: 0,
    itemCount: 0,
    itemsShowed: 0,
    maxQuantity: 0,
    martType: MART_TYPE_REGULAR,
    fontId: 0,
    itemSlot: 0,
    unk16_11: 0,
    unk18: 0
  },
  sShopMenuWindowId: 0,
  gShopTilemapBuffer1: null,
  gShopTilemapBuffer2: null,
  gShopTilemapBuffer3: null,
  gShopTilemapBuffer4: null,
  sShopMenuListMenu: null,
  sShopMenuItemStrings: null,
  sHistory: [emptyHistory(), emptyHistory()],
  gMultiuseListMenuTemplate: emptyListMenuTemplate(),
  tasks: [],
  nextTaskId: 0,
  nextListTaskId: 0,
  listTaskDestroyed: false,
  gMainState: 0,
  gPaletteFadeActive: false,
  weatherFadingDone: true,
  newKeys: 0,
  menuCursorPos: 0,
  nextMenuInput: MENU_NOTHING_CHOSEN,
  nextListInput: LIST_NOTHING_CHOSEN,
  mainCallback2: null,
  vblankCallback: null,
  gFieldCallback: null,
  scriptContextEnabled: false,
  gameStats: {},
  questLogEvents: [],
  objectEvents: [],
  playerFacing: { x: 0, y: 0 },
  playerElevation: 0,
  viewportObjectEvents: Array.from({ length: 16 }, () => [16, 0, 0, 0]),
  mapMetatiles: new Map(),
  operations: []
});

export function CreateShopMenu(runtime: ShopRuntime, martType: number): number {
  runtime.sShopData.martType = GetMartTypeFromItemList(runtime, martType);
  runtime.sShopData.selectedRow = 0;
  runtime.sShopData.fontId = 2;
  runtime.sShopMenuWindowId = AddWindow(runtime, sShopMenuWindowTemplate);
  runtime.operations.push(`SetStdWindowBorderStyle:${runtime.sShopMenuWindowId}:0`);
  runtime.operations.push(`PrintTextArray:${runtime.sShopMenuWindowId}:FONT_NORMAL:8:2:16:3:sShopMenuActions_BuySellQuit`);
  runtime.operations.push(`Menu_InitCursor:${runtime.sShopMenuWindowId}:FONT_NORMAL:0:2:16:3:0`);
  runtime.operations.push(`PutWindowTilemap:${runtime.sShopMenuWindowId}`);
  runtime.operations.push(`CopyWindowToVram:${runtime.sShopMenuWindowId}:COPYWIN_MAP`);
  return CreateTask(runtime, 'Task_ShopMenu');
}

export function GetMartTypeFromItemList(runtime: ShopRuntime, martType: number): number {
  if (martType !== MART_TYPE_REGULAR) return martType;
  for (let i = 0; i < runtime.sShopData.itemCount && runtime.sShopData.itemList[i] !== 0; i += 1) {
    if (ItemId_GetPocket(runtime.sShopData.itemList[i]) === POCKET_TM_CASE) return MART_TYPE_TMHM;
  }
  return MART_TYPE_REGULAR;
}

export function SetShopItemsForSale(runtime: ShopRuntime, items: readonly number[]): void {
  runtime.sShopData.itemList = items;
  runtime.sShopData.itemCount = 0;
  if (runtime.sShopData.itemList[0] === 0) return;
  while (runtime.sShopData.itemList[runtime.sShopData.itemCount]) runtime.sShopData.itemCount += 1;
}

export function SetShopMenuCallback(runtime: ShopRuntime, callback: string): void {
  runtime.sShopData.callback = callback;
}

export function Task_ShopMenu(runtime: ShopRuntime, taskId: number): void {
  const input = Menu_ProcessInputNoWrapAround(runtime);
  switch (input) {
    case MENU_NOTHING_CHOSEN:
      break;
    case MENU_B_PRESSED:
      PlaySE(runtime, SE_SELECT);
      Task_HandleShopMenuQuit(runtime, taskId);
      break;
    default:
      if (runtime.menuCursorPos === 0) Task_HandleShopMenuBuy(runtime, taskId);
      else if (runtime.menuCursorPos === 1) Task_HandleShopMenuSell(runtime, taskId);
      else Task_HandleShopMenuQuit(runtime, taskId);
      break;
  }
}

export function Task_HandleShopMenuBuy(runtime: ShopRuntime, taskId: number): void {
  SetWordTaskArg(runtime, taskId, 0xe, 'CB2_InitBuyMenu');
  FadeScreen(runtime, 'FADE_TO_BLACK', 0);
  runtime.tasks[taskId].func = 'Task_GoToBuyOrSellMenu';
}

export function Task_HandleShopMenuSell(runtime: ShopRuntime, taskId: number): void {
  SetWordTaskArg(runtime, taskId, 0xe, 'CB2_GoToSellMenu');
  FadeScreen(runtime, 'FADE_TO_BLACK', 0);
  runtime.tasks[taskId].func = 'Task_GoToBuyOrSellMenu';
}

export function CB2_GoToSellMenu(runtime: ShopRuntime): void {
  runtime.operations.push('GoToBagMenu:ITEMMENULOCATION_SHOP:OPEN_BAG_LAST:CB2_ReturnToField');
  runtime.gFieldCallback = 'MapPostLoadHook_ReturnToShopMenu';
}

export function Task_HandleShopMenuQuit(runtime: ShopRuntime, taskId: number): void {
  ClearShopMenuWindow(runtime);
  RecordTransactionForQuestLog(runtime);
  DestroyTask(runtime, taskId);
  if (runtime.sShopData.callback === 'ScriptContext_Enable') runtime.scriptContextEnabled = true;
}

export function ClearShopMenuWindow(runtime: ShopRuntime): void {
  runtime.operations.push(`ClearStdWindowAndFrameToTransparent:${runtime.sShopMenuWindowId}:2`);
  runtime.operations.push(`RemoveWindow:${runtime.sShopMenuWindowId}`);
}

export function Task_GoToBuyOrSellMenu(runtime: ShopRuntime, taskId: number): void {
  if (runtime.gPaletteFadeActive) return;
  SetMainCallback2(runtime, runtime.tasks[taskId].wordArgs[0xe]);
  runtime.operations.push('FreeAllWindowBuffers');
  DestroyTask(runtime, taskId);
}

export function MapPostLoadHook_ReturnToShopMenu(runtime: ShopRuntime): void {
  runtime.operations.push('FadeInFromBlack');
  CreateTask(runtime, 'Task_ReturnToShopMenu');
}

export function Task_ReturnToShopMenu(runtime: ShopRuntime, taskId: number): void {
  if (runtime.weatherFadingDone !== true) return;
  runtime.operations.push(`DisplayItemMessageOnField:${taskId}:${GetMartFontId(runtime)}:gText_AnythingElseICanHelp:ShowShopMenuAfterExitingBuyOrSellMenu`);
}

export function ShowShopMenuAfterExitingBuyOrSellMenu(runtime: ShopRuntime, taskId: number): void {
  CreateShopMenu(runtime, runtime.sShopData.martType);
  DestroyTask(runtime, taskId);
}

export function CB2_InitBuyMenu(runtime: ShopRuntime): void {
  switch (runtime.gMainState) {
    case 0:
      [
        'SetVBlankHBlankCallbacksToNull',
        'CpuFastFill:OAM:0x400',
        'ScanlineEffect_Stop',
        'ResetTempTileDataBuffers',
        'FreeAllSpritePalettes',
        'ResetPaletteFade',
        'ResetSpriteData',
        'ResetTasks',
        'ClearScheduledBgCopiesToVram',
        'ResetItemMenuIconState'
      ].forEach((op) => runtime.operations.push(op));
      if (!InitShopData(runtime) || !BuyMenuBuildListMenuTemplate(runtime)) return;
      BuyMenuInitBgs(runtime);
      for (let bg = 0; bg < 4; bg += 1) runtime.operations.push(`FillBgTilemapBufferRect_Palette0:${bg}:0:0:0:0x20:0x20`);
      runtime.operations.push(`BuyMenuInitWindows:${runtime.sShopData.martType}`);
      BuyMenuDecompressBgGraphics(runtime);
      runtime.gMainState += 1;
      break;
    case 1:
      runtime.gMainState += 1;
      break;
    default: {
      runtime.sShopData.selectedRow = 0;
      runtime.sShopData.scrollOffset = 0;
      BuyMenuDrawGraphics(runtime);
      BuyMenuAddScrollIndicatorArrows(runtime);
      const taskId = CreateTask(runtime, 'Task_BuyMenu');
      runtime.tasks[taskId].data[7] = ListMenuInit(runtime, 0, 0);
      runtime.operations.push('BlendPalettes:PALETTES_ALL:0x10:RGB_BLACK');
      runtime.operations.push('BeginNormalPaletteFade:PALETTES_ALL:0:0x10:0:RGB_BLACK');
      SetVBlankCallback(runtime, 'VBlankCB_BuyMenu');
      SetMainCallback2(runtime, 'CB2_BuyMenu');
      break;
    }
  }
}

export function CB2_BuyMenu(runtime: ShopRuntime): void {
  for (const entry of runtime.tasks) {
    if (!entry.destroyed) {
      tickShopTask(runtime, entry.id);
    }
  }
  runtime.operations.push('AnimateSprites', 'BuildOamBuffer', 'UpdatePaletteFade', 'DoScheduledBgTilemapCopiesToVram');
}

export function VBlankCB_BuyMenu(runtime: ShopRuntime): void {
  runtime.operations.push('LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer');
}

export function DebugFunc_PrintPurchaseDetails(_runtime: ShopRuntime, _taskId: number): void {}

export function DebugFunc_PrintShopMenuHistoryBeforeClearMaybe(_runtime: ShopRuntime): void {}

export function InitShopData(runtime: ShopRuntime): boolean {
  runtime.gShopTilemapBuffer1 = Array.from({ length: 0x400 }, () => 0);
  runtime.gShopTilemapBuffer2 = Array.from({ length: 0x400 }, () => 0);
  runtime.gShopTilemapBuffer3 = Array.from({ length: 0x400 }, () => 0);
  runtime.gShopTilemapBuffer4 = Array.from({ length: 0x400 }, () => 0);
  return true;
}

export function BuyMenuInitBgs(runtime: ShopRuntime): void {
  runtime.operations.push('ResetBgsAndClearDma3BusyFlags:0');
  runtime.operations.push(`InitBgsFromTemplates:0:sShopBuyMenuBgTemplates:${sShopBuyMenuBgTemplates.length}`);
  runtime.operations.push('SetBgTilemapBuffer:1:gShopTilemapBuffer2');
  runtime.operations.push('SetBgTilemapBuffer:2:gShopTilemapBuffer4');
  runtime.operations.push('SetBgTilemapBuffer:3:gShopTilemapBuffer3');
  ['BG0HOFS', 'BG0VOFS', 'BG1HOFS', 'BG1VOFS', 'BG2HOFS', 'BG2VOFS', 'BG3HOFS', 'BG3VOFS', 'BLDCNT'].forEach((reg) => runtime.operations.push(`SetGpuReg:REG_OFFSET_${reg}:0`));
  runtime.operations.push('SetGpuReg:REG_OFFSET_DISPCNT:DISPCNT_OBJ_ON|DISPCNT_OBJ_1D_MAP');
  for (let bg = 0; bg < 4; bg += 1) runtime.operations.push(`ShowBg:${bg}`);
}

export function BuyMenuDecompressBgGraphics(runtime: ShopRuntime): void {
  runtime.operations.push('DecompressAndCopyTileDataToVram:1:gBuyMenuFrame_Gfx:0x480:0x3DC:0');
  runtime.operations.push(runtime.sShopData.martType !== MART_TYPE_TMHM ? 'LZDecompressWram:gBuyMenuFrame_Tilemap:gShopTilemapBuffer1' : 'LZDecompressWram:gBuyMenuFrame_TmHmTilemap:gShopTilemapBuffer1');
  runtime.operations.push('LoadPalette:gBuyMenuFrame_Pal[0]:BG_PLTT_ID(11):PLTT_SIZE_4BPP');
  runtime.operations.push('LoadPalette:gBuyMenuFrame_Pal[1]:BG_PLTT_ID(6):PLTT_SIZE_4BPP');
}

export function RecolorItemDescriptionBox(runtime: ShopRuntime, active: boolean): void {
  const paletteNum = active === false ? 0xb : 0x6;
  if (runtime.sShopData.martType !== MART_TYPE_TMHM) runtime.operations.push(`SetBgTilemapPalette:1:0:14:30:6:${paletteNum}`);
  else runtime.operations.push(`SetBgTilemapPalette:1:0:12:30:8:${paletteNum}`);
  runtime.operations.push('ScheduleBgCopyTilemapToVram:1');
}

export function BuyMenuDrawGraphics(runtime: ShopRuntime): void {
  BuyMenuDrawMapView(runtime);
  BuyMenuCopyTilemapData(runtime);
  runtime.operations.push('BuyMenuDrawMoneyBox');
  for (let bg = 0; bg < 4; bg += 1) runtime.operations.push(`ScheduleBgCopyTilemapToVram:${bg}`);
}

export function BuyMenuBuildListMenuTemplate(runtime: ShopRuntime): boolean {
  const items: Array<{ label: string; index: number }> = [];
  const itemStrings: string[] = [];
  for (let i = 0; i < runtime.sShopData.itemCount; i += 1) {
    const item = PokeMartWriteNameAndIdAt(runtime.sShopData.itemList[i]);
    items.push(item);
    itemStrings.push(item.label);
  }
  itemStrings.push('gFameCheckerText_Cancel');
  items.push({ label: 'gFameCheckerText_Cancel', index: LIST_CANCEL });
  const v = runtime.sShopData.martType === MART_TYPE_TMHM ? 5 : 6;
  runtime.gMultiuseListMenuTemplate = {
    items,
    totalItems: runtime.sShopData.itemCount + 1,
    windowId: 4,
    header_X: 0,
    item_X: 9,
    cursor_X: 1,
    lettersSpacing: 0,
    itemVerticalPadding: 2,
    upText_Y: 2,
    fontId: 2,
    fillValue: 0,
    cursorPal: 1,
    cursorShadowPal: 3,
    scrollMultiple: 0,
    cursorKind: 0,
    maxShowed: runtime.sShopData.itemCount + 1 > v ? v : runtime.sShopData.itemCount + 1
  };
  runtime.sShopMenuListMenu = items;
  runtime.sShopMenuItemStrings = itemStrings;
  runtime.sShopData.itemsShowed = runtime.gMultiuseListMenuTemplate.maxShowed;
  return true;
}

export function PokeMartWriteNameAndIdAt(index: number): { label: string; index: number } {
  return { label: ItemId_GetName(index), index };
}

export function BuyMenuPrintItemDescriptionAndShowItemIcon(runtime: ShopRuntime, item: number, onInit: boolean): void {
  if (onInit !== true) PlaySE(runtime, SE_SELECT);
  const description = item !== LIST_CANCEL ? ItemId_GetDescription(item) : 'gText_QuitShopping';
  runtime.operations.push('FillWindowPixelBuffer:5:PIXEL_FILL(0)');
  if (runtime.sShopData.martType !== MART_TYPE_TMHM) {
    runtime.operations.push(`DestroyItemMenuIcon:${runtime.sShopData.itemSlot ^ 1}`);
    runtime.operations.push(`CreateItemMenuIcon:${item !== LIST_CANCEL ? item : ITEMS_COUNT}:${runtime.sShopData.itemSlot}`);
    runtime.sShopData.itemSlot ^= 1;
    BuyMenuPrint(runtime, 5, FONT_NORMAL, description, 0, 3, 2, 1, 0, 0);
  } else {
    runtime.operations.push('FillWindowPixelBuffer:6:PIXEL_FILL(0)');
    LoadTmHmNameInMart(runtime, item);
    BuyMenuPrint(runtime, 5, FONT_NORMAL, description, 2, 3, 1, 0, 0, 0);
  }
}

export function BuyMenuPrintPriceInList(runtime: ShopRuntime, windowId: number, item: number, y: number): void {
  if (item !== LIST_CANCEL) BuyMenuPrint(runtime, windowId, FONT_SMALL, `Pokedollar:${ItemId_GetPrice(item).toString().padStart(4, '0')}`, 0x69, y, 0, 0, 0xff, 1);
}

export function LoadTmHmNameInMart(runtime: ShopRuntime, item: number): void {
  if (item !== LIST_CANCEL) {
    BuyMenuPrint(runtime, 6, FONT_SMALL, `gText_NumberClear01${String(item - ITEM_DEVON_SCOPE).padStart(2, '0')}`, 0, 0, 0, 0, 0xff, 1);
    BuyMenuPrint(runtime, 6, FONT_NORMAL, `MoveName:${item}`, 0, 0x10, 0, 0, 0, 1);
  } else {
    BuyMenuPrint(runtime, 6, FONT_SMALL, 'gText_ThreeHyphens', 0, 0, 0, 0, 0xff, 1);
    BuyMenuPrint(runtime, 6, FONT_NORMAL, 'gText_SevenHyphens', 0, 0x10, 0, 0, 0, 1);
  }
}

export function GetMartFontId(runtime: ShopRuntime): number {
  return runtime.sShopData.fontId;
}

export function BuyMenuPrintCursor(runtime: ShopRuntime, listTaskId: number, color: number): void {
  BuyMenuPrintCursorAtYPosition(runtime, ListMenuGetYCoordForPrintingArrowCursor(runtime, listTaskId), color);
}

export function BuyMenuPrintCursorAtYPosition(runtime: ShopRuntime, y: number, color: number): void {
  if (color === 0xff) runtime.operations.push(`FillWindowPixelRect:4:0:1:${y}:8:12`);
  else BuyMenuPrint(runtime, 4, FONT_NORMAL, 'gText_SelectorArrow2', 1, y, 0, 0, 0, color);
}

export function BuyMenuFreeMemory(runtime: ShopRuntime): void {
  runtime.gShopTilemapBuffer1 = null;
  runtime.gShopTilemapBuffer2 = null;
  runtime.gShopTilemapBuffer3 = null;
  runtime.gShopTilemapBuffer4 = null;
  runtime.sShopMenuListMenu = null;
  runtime.sShopMenuItemStrings = null;
  runtime.operations.push('FreeAllWindowBuffers');
}

export function SetShopExitCallback(runtime: ShopRuntime): void {
  runtime.gFieldCallback = 'MapPostLoadHook_ReturnToShopMenu';
  SetMainCallback2(runtime, 'CB2_ReturnToField');
}

export function BuyMenuAddScrollIndicatorArrows(runtime: ShopRuntime): void {
  const y2 = runtime.sShopData.martType !== MART_TYPE_TMHM ? 104 : 88;
  runtime.sShopData.unk16_11 = 0;
  runtime.operations.push(`AddScrollIndicatorArrowPairParameterized:SCROLL_ARROW_UP:160:8:${y2}:${(runtime.sShopData.itemCount - runtime.sShopData.itemsShowed) + 1}:110:110:sShopData.scrollOffset`);
}

export function BuyQuantityAddScrollIndicatorArrows(runtime: ShopRuntime): void {
  runtime.sShopData.unk18 = 1;
  runtime.sShopData.unk16_11 = 0;
  runtime.operations.push('AddScrollIndicatorArrowPairParameterized:SCROLL_ARROW_UP:0x98:0x48:0x68:2:0x6E:0x6E:sShopData.unk18');
}

export function BuyMenuRemoveScrollIndicatorArrows(runtime: ShopRuntime): void {
  if (runtime.sShopData.unk16_11 === 0x1f) return;
  runtime.operations.push(`RemoveScrollIndicatorArrowPair:${runtime.sShopData.unk16_11}`);
  runtime.sShopData.unk16_11 = 0x1f;
}

export function BuyMenuDrawMapView(runtime: ShopRuntime): void {
  BuyMenuCollectObjectEventData(runtime);
  BuyMenuDrawObjectEvents(runtime);
  BuyMenuDrawMapBg(runtime);
}

export function BuyMenuDrawMapBg(runtime: ShopRuntime): void {
  const startX = runtime.playerFacing.x - 2;
  const startY = runtime.playerFacing.y - 3;
  for (let j = 0; j < 10; j += 1) {
    for (let i = 0; i < 5; i += 1) {
      const meta = runtime.mapMetatiles.get(`${startX + i},${startY + j}`) ?? { metatile: 0, layerType: 0, tiles: [0, 0, 0, 0, 0, 0, 0, 0] };
      BuyMenuDrawMapMetatile(runtime, i, j, meta.tiles, meta.layerType);
    }
  }
}

export function BuyMenuDrawMapMetatile(runtime: ShopRuntime, x: number, y: number, src: readonly number[], metatileLayerType: number): void {
  const offset1 = x * 2;
  const offset2 = y * 64 + 64;
  if (metatileLayerType === 0) {
    BuyMenuDrawMapMetatileLayer(mustBuffer(runtime.gShopTilemapBuffer4), offset1, offset2, src.slice(0, 4));
    BuyMenuDrawMapMetatileLayer(mustBuffer(runtime.gShopTilemapBuffer2), offset1, offset2, src.slice(4, 8));
  } else if (metatileLayerType === 1) {
    BuyMenuDrawMapMetatileLayer(mustBuffer(runtime.gShopTilemapBuffer3), offset1, offset2, src.slice(0, 4));
    BuyMenuDrawMapMetatileLayer(mustBuffer(runtime.gShopTilemapBuffer4), offset1, offset2, src.slice(4, 8));
  } else if (metatileLayerType === 2) {
    BuyMenuDrawMapMetatileLayer(mustBuffer(runtime.gShopTilemapBuffer3), offset1, offset2, src.slice(0, 4));
    BuyMenuDrawMapMetatileLayer(mustBuffer(runtime.gShopTilemapBuffer2), offset1, offset2, src.slice(4, 8));
  }
}

export function BuyMenuDrawMapMetatileLayer(dest: number[], offset1: number, offset2: number, src: readonly number[]): void {
  dest[offset1 + offset2] = src[0];
  dest[offset1 + offset2 + 1] = src[1];
  dest[offset1 + offset2 + 32] = src[2];
  dest[offset1 + offset2 + 33] = src[3];
}

export function BuyMenuCollectObjectEventData(runtime: ShopRuntime): void {
  runtime.viewportObjectEvents.forEach((row) => {
    row[0] = 16;
  });
  let num = 0;
  for (let y = 0; y < 5; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      const obj = runtime.objectEvents.find((event) => event.x === runtime.playerFacing.x - 3 + x && event.y === runtime.playerFacing.y - 2 + y && event.elevation === runtime.playerElevation);
      if (obj) {
        runtime.viewportObjectEvents[num][0] = obj.id;
        runtime.viewportObjectEvents[num][1] = x;
        runtime.viewportObjectEvents[num][2] = y;
        runtime.viewportObjectEvents[num][3] = obj.facingDirection === 'south' ? 0 : obj.facingDirection === 'north' ? 1 : obj.facingDirection === 'west' ? 2 : 3;
        num += 1;
      }
    }
  }
}

export function BuyMenuDrawObjectEvents(runtime: ShopRuntime): void {
  for (const row of runtime.viewportObjectEvents) {
    if (row[0] === 16) continue;
    const obj = runtime.objectEvents.find((event) => event.id === row[0]);
    if (!obj) continue;
    runtime.operations.push(`CreateObjectGraphicsSprite:${obj.graphicsId}:${row[1] * 16 - 8}:${row[2] * 16 + 48 - 16}:2`);
    runtime.operations.push(`StartSpriteAnim:${row[3]}`);
  }
}

export function BuyMenuCopyTilemapData(runtime: ShopRuntime): void {
  const dst = mustBuffer(runtime.gShopTilemapBuffer2);
  const src = mustBuffer(runtime.gShopTilemapBuffer1);
  for (let i = 0; i < 0x400; i += 1) {
    if (src[i] === 0) continue;
    dst[i] = src[i] + 0xb3dc;
  }
}

export function BuyMenuPrintItemQuantityAndPrice(runtime: ShopRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  runtime.operations.push('FillWindowPixelBuffer:3:PIXEL_FILL(1)');
  runtime.operations.push(`PrintMoneyAmount:3:0x36:0xA:${runtime.sShopData.itemPrice}:TEXT_SKIP_DRAW`);
  BuyMenuPrint(runtime, 3, FONT_SMALL, `x${String(data[1]).padStart(2, '0')}`, 2, 0x0a, 0, 0, 0, 1);
}

export function Task_BuyMenu(runtime: ShopRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (!runtime.gPaletteFadeActive) {
    const itemId = ListMenu_ProcessInput(runtime, data[7]);
    switch (itemId) {
      case LIST_NOTHING_CHOSEN:
        break;
      case LIST_CANCEL:
        PlaySE(runtime, SE_SELECT);
        ExitBuyMenu(runtime, taskId);
        break;
      default:
        PlaySE(runtime, SE_SELECT);
        data[5] = itemId;
        runtime.operations.push('ClearWindowTilemap:5');
        BuyMenuRemoveScrollIndicatorArrows(runtime);
        BuyMenuPrintCursor(runtime, data[7], 2);
        RecolorItemDescriptionBox(runtime, true);
        runtime.sShopData.itemPrice = ItemId_GetPrice(itemId);
        if (!isEnoughMoney(runtime.moneyState, runtime.sShopData.itemPrice)) {
          BuyMenuDisplayMessage(runtime, taskId, 'gText_YouDontHaveMoney', 'BuyMenuReturnToItemList');
        } else {
          BuyMenuDisplayMessage(runtime, taskId, 'gText_Var1CertainlyHowMany', 'Task_BuyHowManyDialogueInit');
        }
        break;
    }
  }
}

export function Task_BuyHowManyDialogueInit(runtime: ShopRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  const itemId = data[5];
  runtime.operations.push('BuyMenuQuantityBoxThinBorder:1:0');
  BuyMenuPrint(runtime, 1, FONT_NORMAL, 'gText_InBagVar1', 0, 2, 0, 0, 0, 1);
  data[1] = 1;
  runtime.operations.push('BuyMenuQuantityBoxNormalBorder:3:0');
  BuyMenuPrintItemQuantityAndPrice(runtime, taskId);
  runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
  const maxQuantity = Math.trunc(getMoney(runtime.moneyState) / ItemId_GetPrice(itemId));
  runtime.sShopData.maxQuantity = maxQuantity > 99 ? 99 : maxQuantity;
  if (maxQuantity !== 1) BuyQuantityAddScrollIndicatorArrows(runtime);
  runtime.tasks[taskId].func = 'Task_BuyHowManyDialogueHandleInput';
}

export function Task_BuyHowManyDialogueHandleInput(runtime: ShopRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  const adjusted = adjustQuantityAccordingToDPadInput(data[1], runtime.sShopData.maxQuantity, {
    upPressed: (runtime.newKeys & DPAD_UP) !== 0,
    downPressed: (runtime.newKeys & DPAD_DOWN) !== 0,
    leftPressed: false,
    rightPressed: false
  });
  if (adjusted.changed) {
    data[1] = adjusted.quantity;
    runtime.sShopData.itemPrice = ItemId_GetPrice(data[5]) * data[1];
    BuyMenuPrintItemQuantityAndPrice(runtime, taskId);
  } else if ((runtime.newKeys & A_BUTTON) !== 0) {
    PlaySE(runtime, SE_SELECT);
    BuyMenuRemoveScrollIndicatorArrows(runtime);
    runtime.operations.push('ClearStdWindowAndFrameToTransparent:3:false');
    runtime.operations.push('ClearStdWindowAndFrameToTransparent:1:false');
    runtime.operations.push('ClearWindowTilemap:3');
    runtime.operations.push('ClearWindowTilemap:1');
    runtime.operations.push('PutWindowTilemap:4');
    BuyMenuDisplayMessage(runtime, taskId, 'gText_Var1AndYouWantedVar2', 'CreateBuyMenuConfirmPurchaseWindow');
  } else if ((runtime.newKeys & B_BUTTON) !== 0) {
    PlaySE(runtime, SE_SELECT);
    BuyMenuRemoveScrollIndicatorArrows(runtime);
    runtime.operations.push('ClearStdWindowAndFrameToTransparent:3:false');
    runtime.operations.push('ClearStdWindowAndFrameToTransparent:1:false');
    runtime.operations.push('ClearWindowTilemap:3');
    runtime.operations.push('ClearWindowTilemap:1');
    BuyMenuReturnToItemList(runtime, taskId);
  }
}

export function CreateBuyMenuConfirmPurchaseWindow(runtime: ShopRuntime, taskId: number): void {
  runtime.operations.push(`BuyMenuConfirmPurchase:${taskId}:sShopMenuActions_BuyQuit`);
}

export function BuyMenuTryMakePurchase(runtime: ShopRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  runtime.operations.push('PutWindowTilemap:4');
  if (AddBagItem(runtime.itemRuntime, data[5], data[1]) === true) {
    BuyMenuDisplayMessage(runtime, taskId, 'gText_HereYouGoThankYou', 'BuyMenuSubtractMoney');
    RecordItemTransaction(runtime, data[5], data[1], QL_EVENT_BOUGHT_ITEM - QL_EVENT_USED_POKEMART);
  } else {
    BuyMenuDisplayMessage(runtime, taskId, 'gText_NoMoreRoomForThis', 'BuyMenuReturnToItemList');
  }
}

export function BuyMenuSubtractMoney(runtime: ShopRuntime, taskId: number): void {
  runtime.gameStats.GAME_STAT_SHOPPED = (runtime.gameStats.GAME_STAT_SHOPPED ?? 0) + 1;
  removeMoney(runtime.moneyState, runtime.sShopData.itemPrice);
  PlaySE(runtime, 'SE_SHOP');
  runtime.operations.push(`PrintMoneyAmountInMoneyBox:0:${getMoney(runtime.moneyState)}:0`);
  runtime.tasks[taskId].func = 'Task_ReturnToItemListAfterItemPurchase';
}

export function Task_ReturnToItemListAfterItemPurchase(runtime: ShopRuntime, taskId: number): void {
  if ((runtime.newKeys & (A_BUTTON | B_BUTTON)) !== 0) {
    PlaySE(runtime, SE_SELECT);
    BuyMenuReturnToItemList(runtime, taskId);
  }
}

export function BuyMenuReturnToItemList(runtime: ShopRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  runtime.operations.push('ClearDialogWindowAndFrameToTransparent:2:false');
  BuyMenuPrintCursor(runtime, data[7], 1);
  RecolorItemDescriptionBox(runtime, false);
  runtime.operations.push('PutWindowTilemap:4');
  runtime.operations.push('PutWindowTilemap:5');
  if (runtime.sShopData.martType === MART_TYPE_TMHM) runtime.operations.push('PutWindowTilemap:6');
  runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
  BuyMenuAddScrollIndicatorArrows(runtime);
  runtime.tasks[taskId].func = 'Task_BuyMenu';
}

export function ExitBuyMenu(runtime: ShopRuntime, taskId: number): void {
  runtime.gFieldCallback = 'MapPostLoadHook_ReturnToShopMenu';
  runtime.operations.push('BeginNormalPaletteFade:PALETTES_ALL:0:0:16:RGB_BLACK');
  runtime.tasks[taskId].func = 'Task_ExitBuyMenu';
}

export function Task_ExitBuyMenu(runtime: ShopRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (!runtime.gPaletteFadeActive) {
    DestroyListMenuTask(runtime, data[7]);
    BuyMenuFreeMemory(runtime);
    SetMainCallback2(runtime, 'CB2_ReturnToField');
    DestroyTask(runtime, taskId);
  }
}

export function RecordItemTransaction(runtime: ShopRuntime, itemId: number, quantity: number, logEventId: number): void {
  let history: QuestLogShopHistory;
  if (runtime.sHistory[0].logEventId === logEventId) history = runtime.sHistory[0];
  else if (runtime.sHistory[1].logEventId === logEventId) history = runtime.sHistory[1];
  else {
    history = runtime.sHistory[0].logEventId === 0 ? runtime.sHistory[0] : runtime.sHistory[1];
    history.logEventId = logEventId;
  }
  if (history.lastItemId !== ITEM_NONE) history.hasMultipleTransactions = true;
  history.lastItemId = itemId;
  if (history.itemQuantity < 999) history.itemQuantity = Math.min(999, history.itemQuantity + quantity);
  if (history.totalMoney < 999999) history.totalMoney = Math.min(999999, history.totalMoney + (ItemId_GetPrice(itemId) >> (logEventId - 1)) * quantity);
}

export function RecordTransactionForQuestLog(runtime: ShopRuntime): void {
  for (const history of runtime.sHistory) {
    const eventId = history.logEventId;
    if (eventId !== 0) runtime.questLogEvents.push({ eventId: eventId + QL_EVENT_USED_POKEMART, history: { ...history } });
  }
}

export function CreatePokemartMenu(runtime: ShopRuntime, itemsForSale: readonly number[]): void {
  SetShopItemsForSale(runtime, itemsForSale);
  CreateShopMenu(runtime, MART_TYPE_REGULAR);
  SetShopMenuCallback(runtime, 'ScriptContext_Enable');
  runtime.sHistory = [emptyHistory(), emptyHistory()];
}

export function CreateDecorationShop1Menu(runtime: ShopRuntime, itemsForSale: readonly number[]): void {
  SetShopItemsForSale(runtime, itemsForSale);
  CreateShopMenu(runtime, MART_TYPE_DECOR);
  SetShopMenuCallback(runtime, 'ScriptContext_Enable');
}

export function CreateDecorationShop2Menu(runtime: ShopRuntime, itemsForSale: readonly number[]): void {
  SetShopItemsForSale(runtime, itemsForSale);
  CreateShopMenu(runtime, MART_TYPE_DECOR2);
  SetShopMenuCallback(runtime, 'ScriptContext_Enable');
}

export function tickShopTask(runtime: ShopRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) return;
  switch (task.func) {
    case 'Task_ShopMenu': Task_ShopMenu(runtime, taskId); break;
    case 'Task_GoToBuyOrSellMenu': Task_GoToBuyOrSellMenu(runtime, taskId); break;
    case 'Task_ReturnToShopMenu': Task_ReturnToShopMenu(runtime, taskId); break;
    case 'Task_BuyMenu': Task_BuyMenu(runtime, taskId); break;
    case 'Task_BuyHowManyDialogueInit': Task_BuyHowManyDialogueInit(runtime, taskId); break;
    case 'Task_BuyHowManyDialogueHandleInput': Task_BuyHowManyDialogueHandleInput(runtime, taskId); break;
    case 'CreateBuyMenuConfirmPurchaseWindow': CreateBuyMenuConfirmPurchaseWindow(runtime, taskId); break;
    case 'BuyMenuTryMakePurchase': BuyMenuTryMakePurchase(runtime, taskId); break;
    case 'BuyMenuSubtractMoney': BuyMenuSubtractMoney(runtime, taskId); break;
    case 'Task_ReturnToItemListAfterItemPurchase': Task_ReturnToItemListAfterItemPurchase(runtime, taskId); break;
    case 'Task_ExitBuyMenu': Task_ExitBuyMenu(runtime, taskId); break;
  }
}

function BuyMenuDisplayMessage(runtime: ShopRuntime, taskId: number, text: string, nextFunc: ShopTaskFunc | 'BuyMenuReturnToItemList'): void {
  runtime.operations.push(`BuyMenuDisplayMessage:${taskId}:${text}:${nextFunc}`);
  if (nextFunc !== 'BuyMenuReturnToItemList') runtime.tasks[taskId].func = nextFunc;
}

function BuyMenuPrint(runtime: ShopRuntime, windowId: number, fontId: number, text: string, x: number, y: number, letterSpacing: number, lineSpacing: number, speed: number, colorIdx: number): void {
  runtime.operations.push(`BuyMenuPrint:${windowId}:${fontId}:${text}:${x}:${y}:${letterSpacing}:${lineSpacing}:${speed}:${colorIdx}`);
}

function CreateTask(runtime: ShopRuntime, func: ShopTaskFunc): number {
  const id = runtime.nextTaskId;
  runtime.nextTaskId += 1;
  runtime.tasks[id] = { id, func, data: Array.from({ length: 16 }, () => 0), wordArgs: {}, destroyed: false };
  runtime.operations.push(`CreateTask:${id}:${func}:8`);
  return id;
}

function DestroyTask(runtime: ShopRuntime, taskId: number): void {
  runtime.tasks[taskId].destroyed = true;
  runtime.operations.push(`DestroyTask:${taskId}`);
}

function AddWindow(runtime: ShopRuntime, template: typeof sShopMenuWindowTemplate): number {
  runtime.operations.push(`AddWindow:${template.bg}:${template.tilemapLeft}:${template.tilemapTop}:${template.width}:${template.height}:${template.paletteNum}:${template.baseBlock}`);
  return 0;
}

function Menu_ProcessInputNoWrapAround(runtime: ShopRuntime): number {
  const input = runtime.nextMenuInput;
  runtime.nextMenuInput = MENU_NOTHING_CHOSEN;
  return input;
}

function SetWordTaskArg(runtime: ShopRuntime, taskId: number, arg: number, value: string): void {
  runtime.tasks[taskId].wordArgs[arg] = value;
  runtime.operations.push(`SetWordTaskArg:${taskId}:${arg}:${value}`);
}

function FadeScreen(runtime: ShopRuntime, mode: string, speed: number): void {
  runtime.gPaletteFadeActive = true;
  runtime.operations.push(`FadeScreen:${mode}:${speed}`);
}

function SetMainCallback2(runtime: ShopRuntime, callback: string | undefined): void {
  runtime.mainCallback2 = callback ?? null;
  runtime.operations.push(`SetMainCallback2:${callback ?? 'NULL'}`);
}

function SetVBlankCallback(runtime: ShopRuntime, callback: string): void {
  runtime.vblankCallback = callback;
  runtime.operations.push(`SetVBlankCallback:${callback}`);
}

function PlaySE(runtime: ShopRuntime, se: string): void {
  runtime.operations.push(`PlaySE:${se}`);
}

function ListMenuInit(runtime: ShopRuntime, scroll: number, row: number): number {
  const id = runtime.nextListTaskId;
  runtime.nextListTaskId += 1;
  runtime.sShopData.scrollOffset = scroll;
  runtime.sShopData.selectedRow = row;
  runtime.operations.push(`ListMenuInit:${id}:${scroll}:${row}`);
  return id;
}

function ListMenu_ProcessInput(runtime: ShopRuntime, _listTaskId: number): number {
  const input = runtime.nextListInput;
  runtime.nextListInput = LIST_NOTHING_CHOSEN;
  return input;
}

function ListMenuGetYCoordForPrintingArrowCursor(runtime: ShopRuntime, _listTaskId: number): number {
  return 2 + runtime.sShopData.selectedRow * 16;
}

function DestroyListMenuTask(runtime: ShopRuntime, listTaskId: number): void {
  runtime.listTaskDestroyed = true;
  runtime.operations.push(`DestroyListMenuTask:${listTaskId}`);
}

function mustBuffer(buffer: number[] | null): number[] {
  if (!buffer) throw new Error('Shop tilemap buffer is not allocated');
  return buffer;
}

function emptyHistory(): QuestLogShopHistory {
  return { logEventId: 0, lastItemId: ITEM_NONE, itemQuantity: 0, totalMoney: 0, hasMultipleTransactions: false, mapSec: 0 };
}

function emptyListMenuTemplate(): ShopListMenuTemplate {
  return {
    items: [],
    totalItems: 0,
    windowId: 0,
    header_X: 0,
    item_X: 0,
    cursor_X: 0,
    lettersSpacing: 0,
    itemVerticalPadding: 0,
    upText_Y: 0,
    fontId: FONT_NORMAL,
    fillValue: 0,
    cursorPal: 0,
    cursorShadowPal: 0,
    scrollMultiple: 0,
    cursorKind: 0,
    maxShowed: 0
  };
}

function parseWindowTemplate(source: string, symbol: string) {
  const body = source.match(new RegExp(`static const struct WindowTemplate ${symbol}\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`, 'u'))?.[1] ?? '';
  return {
    bg: Number.parseInt(body.match(/\.bg = (\d+)/u)?.[1] ?? '0', 10),
    tilemapLeft: Number.parseInt(body.match(/\.tilemapLeft = (\d+)/u)?.[1] ?? '0', 10),
    tilemapTop: Number.parseInt(body.match(/\.tilemapTop = (\d+)/u)?.[1] ?? '0', 10),
    width: Number.parseInt(body.match(/\.width = (\d+)/u)?.[1] ?? '0', 10),
    height: Number.parseInt(body.match(/\.height = (\d+)/u)?.[1] ?? '0', 10),
    paletteNum: Number.parseInt(body.match(/\.paletteNum = (\d+)/u)?.[1] ?? '0', 10),
    baseBlock: Number.parseInt(body.match(/\.baseBlock = (\d+)/u)?.[1] ?? '0', 10)
  };
}

function parseBgTemplates(source: string) {
  const body = source.match(/static const struct BgTemplate sShopBuyMenuBgTemplates\[4\]\s*=\s*\{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\.bg = (\d+),\s*\.charBaseIndex = (\d+),\s*\.mapBaseIndex = (\d+),\s*\.screenSize = (\d+),\s*\.paletteMode = (\d+),\s*\.priority = (\d+),\s*\.baseTile = (\d+)/gu)]
    .map(([, bg, charBaseIndex, mapBaseIndex, screenSize, paletteMode, priority, baseTile]) => ({
      bg: Number.parseInt(bg, 10),
      charBaseIndex: Number.parseInt(charBaseIndex, 10),
      mapBaseIndex: Number.parseInt(mapBaseIndex, 10),
      screenSize: Number.parseInt(screenSize, 10),
      paletteMode: Number.parseInt(paletteMode, 10),
      priority: Number.parseInt(priority, 10),
      baseTile: Number.parseInt(baseTile, 10)
    }));
}

function parseItemConstant(name: string): number {
  return Number.parseInt(itemsConstantsSource.match(new RegExp(`#define\\s+${name}\\s+(\\d+)`, 'u'))?.[1] ?? '0', 10);
}
