export type MainCallback = string | null;
export type TaskFuncName = keyof typeof taskHandlers;

export interface ItemSlot {
  itemId: number;
  quantity: number;
}

export interface ItemDefinition {
  name: string;
  description: string;
  price: number;
  importance: number;
  type: number;
  fieldFunc: string | null;
  battleFunc: string | null;
  battleUsage: boolean;
  mail: boolean;
}

export interface BagMenuState {
  location: number;
  bagCallback: MainCallback;
  pocket: number;
  bagOpen: boolean;
  itemsAbove: number[];
  cursorPos: number[];
}

export interface BagMenuAlloc {
  exitCB: MainCallback;
  itemOriginalLocation: number;
  pocketSwitchMode: number;
  itemMenuIcon: number;
  inhibitItemDescriptionPrint: boolean;
  contextMenuSelectedItem: number;
  pocketScrollArrowsTask: number;
  pocketSwitchArrowsTask: number;
  nItems: number[];
  maxShowed: number[];
  data: number[];
}

export interface BagTask {
  func: TaskFuncName | null;
  followupFunc: TaskFuncName | null;
  data: number[];
  destroyed: boolean;
}

export interface BagInput {
  a: boolean;
  b: boolean;
  select: boolean;
  left: boolean;
  right: boolean;
  l: boolean;
  r: boolean;
  listInput: number;
  menuInput: number;
  quantityDelta: number;
}

export interface ListMenuTemplateModel {
  items: Array<{ label: string; index: number }>;
  totalItems: number;
  maxShowed: number;
  pocket: number;
}

export interface ItemMenuRuntime {
  gBagMenuState: BagMenuState;
  sBagMenuDisplay: BagMenuAlloc | null;
  sBagBgTilemapBuffer: number[] | null;
  sListMenuItems: Array<{ label: string; index: number }> | null;
  sListMenuItemStrings: string[] | null;
  sContextMenuItemsBuffer: number[];
  sContextMenuItemsPtr: number[];
  sContextMenuNumItems: number;
  sBackupPlayerBag: BagSlots | null;
  gSpecialVar_ItemId: number;
  gMain: { state: number; newKeys: number; newAndRepeatedKeys: number };
  gPaletteFade: { active: boolean; bufferTransferDisabled: boolean };
  gSaveBlock1Ptr: { registeredItem: number; money: number; bagPocket_Items: ItemSlot[]; bagPocket_KeyItems: ItemSlot[]; bagPocket_PokeBalls: ItemSlot[] };
  gSaveBlock2Ptr: { playerGender: number };
  gBagPockets: Array<{ itemSlots: ItemSlot[]; capacity: number }>;
  gMultiuseListMenuTemplate: ListMenuTemplateModel;
  gTasks: BagTask[];
  input: BagInput;
  operations: string[];
  itemDefinitions: Map<number, ItemDefinition>;
  partyCount: number;
  pcCanStoreItems: boolean;
  inUnionRoom: boolean;
  linkActive: boolean;
  overworldLinkBusy: boolean;
  playerAvatarFlags: number;
  tempTileDataBusy: boolean;
  nextTaskId: number;
  nextArrowTaskId: number;
  listCursor: Record<number, { cursorPos: number; itemsAbove: number }>;
}

interface BagSlots {
  bagPocket_Items: ItemSlot[];
  bagPocket_KeyItems: ItemSlot[];
  bagPocket_PokeBalls: ItemSlot[];
  itemsAbove: number[];
  cursorPos: number[];
  registeredItem: number;
  pocket: number;
}

export const ITEM_NONE = 0;
export const ITEM_TM_CASE = 1001;
export const ITEM_BERRY_POUCH = 1002;
export const ITEM_BICYCLE = 1003;
export const ITEM_POTION = 13;
export const ITEM_ANTIDOTE = 14;
export const ITEM_POKE_BALL = 4;
export const ITEM_GREAT_BALL = 3;
export const ITEM_NEST_BALL = 9;
export const ITEM_TEACHY_TV = 1004;
export const ITEMS_COUNT = 0xffff;

export const BAG_ITEMS_COUNT = 42;
export const BAG_KEYITEMS_COUNT = 30;
export const BAG_POKEBALLS_COUNT = 13;
export const NUM_BAG_POCKETS_NO_CASES = 3;
export const POCKET_ITEMS = 1;
export const POCKET_KEY_ITEMS = 2;
export const POCKET_POKE_BALLS = 3;
export const OPEN_BAG_ITEMS = 0;
export const OPEN_BAG_KEYITEMS = 1;
export const OPEN_BAG_POKEBALLS = 2;
export const OPEN_BAG_LAST = 0xff;

export const ITEMMENULOCATION_FIELD = 0;
export const ITEMMENULOCATION_PARTY = 1;
export const ITEMMENULOCATION_SHOP = 2;
export const ITEMMENULOCATION_ITEMPC = 3;
export const ITEMMENULOCATION_PCBOX = 4;
export const ITEMMENULOCATION_BATTLE = 5;
export const ITEMMENULOCATION_OLD_MAN = 6;
export const ITEMMENULOCATION_TTVSCR_REGISTER = 7;
export const ITEMMENULOCATION_TTVSCR_TMS = 8;
export const ITEMMENULOCATION_TTVSCR_STATUS = 9;
export const ITEMMENULOCATION_TTVSCR_CATCHING = 10;
export const ITEMMENULOCATION_LAST = 0xff;

export const ITEMMENUACTION_USE = 0;
export const ITEMMENUACTION_TOSS = 1;
export const ITEMMENUACTION_REGISTER = 2;
export const ITEMMENUACTION_GIVE = 3;
export const ITEMMENUACTION_CANCEL = 4;
export const ITEMMENUACTION_BATTLE_USE = 5;
export const ITEMMENUACTION_CHECK = 6;
export const ITEMMENUACTION_OPEN = 7;
export const ITEMMENUACTION_OPEN_BERRIES = 8;
export const ITEMMENUACTION_WALK = 9;
export const ITEMMENUACTION_DESELECT = 10;
export const ITEMMENUACTION_DUMMY = 11;

export const ITEM_TYPE_PARTY_MENU = 1;
export const PLAYER_AVATAR_FLAG_ACRO_BIKE = 1;
export const PLAYER_AVATAR_FLAG_MACH_BIKE = 2;
export const TASK_NONE = 0xff;
export const LIST_NOTHING_CHOSEN = -2;
export const LIST_CANCEL = -1;
export const MALE = 0;
export const FEMALE = 1;
export const FONT_NORMAL = 0;
export const FONT_SMALL = 1;
export const SE_SELECT = 5;
export const SE_BAG_CURSOR = 34;
export const SE_BAG_POCKET = 35;
export const SE_SHOP = 36;

const LIST_TILES_HEIGHT = 12;
const SHRT_MAX = 32767;

const sContextMenuItems_Field = [
  [ITEMMENUACTION_USE, ITEMMENUACTION_GIVE, ITEMMENUACTION_TOSS, ITEMMENUACTION_CANCEL],
  [ITEMMENUACTION_USE, ITEMMENUACTION_REGISTER, ITEMMENUACTION_CANCEL, ITEMMENUACTION_DUMMY],
  [ITEMMENUACTION_GIVE, ITEMMENUACTION_TOSS, ITEMMENUACTION_CANCEL, ITEMMENUACTION_DUMMY]
];
const sContextMenuItems_CheckGiveTossCancel = [ITEMMENUACTION_CHECK, ITEMMENUACTION_GIVE, ITEMMENUACTION_TOSS, ITEMMENUACTION_CANCEL];
const sContextMenuItems_GiveIfNotKeyItemPocket = [[ITEMMENUACTION_GIVE, ITEMMENUACTION_CANCEL], [ITEMMENUACTION_CANCEL, ITEMMENUACTION_DUMMY], [ITEMMENUACTION_GIVE, ITEMMENUACTION_CANCEL]];
const sContextMenuItems_Open = [ITEMMENUACTION_OPEN, ITEMMENUACTION_CANCEL];
const sContextMenuItems_BattleUse = [ITEMMENUACTION_BATTLE_USE, ITEMMENUACTION_CANCEL];
const sContextMenuItems_Cancel = [ITEMMENUACTION_CANCEL, ITEMMENUACTION_DUMMY];

const makeSlots = (count: number): ItemSlot[] => Array.from({ length: count }, () => ({ itemId: ITEM_NONE, quantity: 0 }));
const cloneSlots = (slots: ItemSlot[]): ItemSlot[] => slots.map((s) => ({ itemId: s.itemId, quantity: s.quantity }));
const makeTask = (func: TaskFuncName | null): BagTask => ({ func, followupFunc: null, data: Array.from({ length: 16 }, () => 0), destroyed: false });
const makeInput = (): BagInput => ({ a: false, b: false, select: false, left: false, right: false, l: false, r: false, listInput: LIST_NOTHING_CHOSEN, menuInput: LIST_NOTHING_CHOSEN, quantityDelta: 0 });

let activeRuntime: ItemMenuRuntime | null = null;
const requireRuntime = (runtime?: ItemMenuRuntime): ItemMenuRuntime => {
  const resolved = runtime ?? activeRuntime;
  if (resolved === null) throw new Error('item menu runtime is not active');
  return resolved;
};
const display = (runtime: ItemMenuRuntime): BagMenuAlloc => {
  if (runtime.sBagMenuDisplay === null) throw new Error('bag menu display is not allocated');
  return runtime.sBagMenuDisplay;
};
const task = (runtime: ItemMenuRuntime, taskId: number): BagTask => runtime.gTasks[taskId] ?? (runtime.gTasks[taskId] = makeTask(null));
const op = (runtime: ItemMenuRuntime, name: string): void => { runtime.operations.push(name); };
const setTaskFunc = (runtime: ItemMenuRuntime, taskId: number, name: TaskFuncName): void => { task(runtime, taskId).func = name; };
const playSE = (runtime: ItemMenuRuntime, se: number): void => op(runtime, `PlaySE:${se}`);
const compaction = (slots: ItemSlot[]): void => {
  const filled = slots.filter((s) => s.itemId !== ITEM_NONE && s.quantity > 0);
  slots.splice(0, slots.length, ...filled, ...makeSlots(slots.length - filled.length));
};
const currentPocketSlots = (runtime: ItemMenuRuntime): ItemSlot[] => runtime.gBagPockets[runtime.gBagMenuState.pocket].itemSlots;
const getDefinition = (runtime: ItemMenuRuntime, itemId: number): ItemDefinition => runtime.itemDefinitions.get(itemId) ?? { name: itemId === ITEMS_COUNT ? 'CANCEL' : `ITEM_${itemId}`, description: `Description ${itemId}`, price: 0, importance: 0, type: 0, fieldFunc: itemId === ITEM_NONE ? null : `FieldFunc_${itemId}`, battleFunc: itemId === ITEM_NONE ? null : `BattleFunc_${itemId}`, battleUsage: false, mail: false };
const itemName = (runtime: ItemMenuRuntime, itemId: number): string => getDefinition(runtime, itemId).name;
const bagGetItemIdByPocketPosition = (runtime: ItemMenuRuntime, pocket: number, pos: number): number => runtime.gBagPockets[pocket - 1]?.itemSlots[pos]?.itemId ?? ITEM_NONE;
const bagGetQuantityByPocketPosition = (runtime: ItemMenuRuntime, pocket: number, pos: number): number => runtime.gBagPockets[pocket - 1]?.itemSlots[pos]?.quantity ?? 0;
const removeBagItem = (runtime: ItemMenuRuntime, itemId: number, qty: number): boolean => {
  for (const pocket of runtime.gBagPockets) {
    const slot = pocket.itemSlots.find((s) => s.itemId === itemId);
    if (slot && slot.quantity >= qty) {
      slot.quantity -= qty;
      if (slot.quantity === 0) slot.itemId = ITEM_NONE;
      compaction(pocket.itemSlots);
      return true;
    }
  }
  return false;
};
const addBagItem = (runtime: ItemMenuRuntime, itemId: number, qty: number): boolean => {
  const pocketIndex = itemId === ITEM_POKE_BALL || itemId === ITEM_GREAT_BALL || itemId === ITEM_NEST_BALL ? OPEN_BAG_POKEBALLS : itemId >= 1000 ? OPEN_BAG_KEYITEMS : OPEN_BAG_ITEMS;
  const slots = runtime.gBagPockets[pocketIndex].itemSlots;
  const existing = slots.find((s) => s.itemId === itemId);
  if (existing) { existing.quantity += qty; return true; }
  const empty = slots.find((s) => s.itemId === ITEM_NONE);
  if (!empty) return false;
  empty.itemId = itemId;
  empty.quantity = qty;
  return true;
};
const clearItemSlots = (slots: ItemSlot[]): void => { for (const slot of slots) { slot.itemId = ITEM_NONE; slot.quantity = 0; } };
const selectedIndex = (runtime: ItemMenuRuntime, pocket = runtime.gBagMenuState.pocket): number => runtime.gBagMenuState.cursorPos[pocket] + runtime.gBagMenuState.itemsAbove[pocket];
const setListCursor = (runtime: ItemMenuRuntime, listId: number, cursorPos: number, itemsAbove: number): void => { runtime.listCursor[listId] = { cursorPos, itemsAbove }; };
const getListCursor = (runtime: ItemMenuRuntime, listId: number): { cursorPos: number; itemsAbove: number } => runtime.listCursor[listId] ?? { cursorPos: runtime.gBagMenuState.cursorPos[runtime.gBagMenuState.pocket], itemsAbove: runtime.gBagMenuState.itemsAbove[runtime.gBagMenuState.pocket] };
const listMenuInit = (runtime: ItemMenuRuntime, cursorPos: number, itemsAbove: number): number => {
  const id = runtime.nextTaskId++ + 1000;
  setListCursor(runtime, id, cursorPos, itemsAbove);
  op(runtime, `ListMenuInit:${cursorPos}:${itemsAbove}`);
  return id;
};
const listMenuProcessInput = (runtime: ItemMenuRuntime, listId: number): number => {
  const input = runtime.input.listInput;
  const c = getListCursor(runtime, listId);
  if (input >= 0) c.cursorPos = Math.max(0, input - c.itemsAbove);
  runtime.listCursor[listId] = c;
  return input;
};
const listMenuGetScrollAndRow = (runtime: ItemMenuRuntime, listId: number): { cursorPos: number; itemsAbove: number } => getListCursor(runtime, listId);
const destroyListMenuTask = (runtime: ItemMenuRuntime, listId: number): void => { delete runtime.listCursor[listId]; op(runtime, `DestroyListMenuTask:${listId}`); };
const createTask = (runtime: ItemMenuRuntime, func: TaskFuncName): number => {
  const id = runtime.gTasks.findIndex((t) => t.destroyed);
  const taskId = id >= 0 ? id : runtime.gTasks.length;
  runtime.gTasks[taskId] = makeTask(func);
  op(runtime, `CreateTask:${func}:${taskId}`);
  return taskId;
};
const destroyTask = (runtime: ItemMenuRuntime, taskId: number): void => { task(runtime, taskId).destroyed = true; task(runtime, taskId).func = null; op(runtime, `DestroyTask:${taskId}`); };
const beginFade = (runtime: ItemMenuRuntime): void => { runtime.gPaletteFade.active = true; op(runtime, 'BeginNormalPaletteFade'); };
const menuInput = (runtime: ItemMenuRuntime): number => runtime.input.menuInput;
const adjustQuantity = (runtime: ItemMenuRuntime, current: number, max: number): number => Math.min(max, Math.max(1, current + runtime.input.quantityDelta));
const resetBagPockets = (runtime: ItemMenuRuntime): void => {
  runtime.gSaveBlock1Ptr.bagPocket_Items = makeSlots(BAG_ITEMS_COUNT);
  runtime.gSaveBlock1Ptr.bagPocket_KeyItems = makeSlots(BAG_KEYITEMS_COUNT);
  runtime.gSaveBlock1Ptr.bagPocket_PokeBalls = makeSlots(BAG_POKEBALLS_COUNT);
  runtime.gBagPockets = [
    { itemSlots: runtime.gSaveBlock1Ptr.bagPocket_Items, capacity: BAG_ITEMS_COUNT },
    { itemSlots: runtime.gSaveBlock1Ptr.bagPocket_KeyItems, capacity: BAG_KEYITEMS_COUNT },
    { itemSlots: runtime.gSaveBlock1Ptr.bagPocket_PokeBalls, capacity: BAG_POKEBALLS_COUNT }
  ];
};

export function createItemMenuRuntime(): ItemMenuRuntime {
  const runtime: ItemMenuRuntime = {
    gBagMenuState: { location: ITEMMENULOCATION_FIELD, bagCallback: null, pocket: OPEN_BAG_ITEMS, bagOpen: false, itemsAbove: [0, 0, 0], cursorPos: [0, 0, 0] },
    sBagMenuDisplay: null,
    sBagBgTilemapBuffer: null,
    sListMenuItems: null,
    sListMenuItemStrings: null,
    sContextMenuItemsBuffer: [0, 0, 0, 0],
    sContextMenuItemsPtr: [],
    sContextMenuNumItems: 0,
    sBackupPlayerBag: null,
    gSpecialVar_ItemId: ITEM_NONE,
    gMain: { state: 0, newKeys: 0, newAndRepeatedKeys: 0 },
    gPaletteFade: { active: false, bufferTransferDisabled: false },
    gSaveBlock1Ptr: { registeredItem: ITEM_NONE, money: 0, bagPocket_Items: makeSlots(BAG_ITEMS_COUNT), bagPocket_KeyItems: makeSlots(BAG_KEYITEMS_COUNT), bagPocket_PokeBalls: makeSlots(BAG_POKEBALLS_COUNT) },
    gSaveBlock2Ptr: { playerGender: MALE },
    gBagPockets: [],
    gMultiuseListMenuTemplate: { items: [], totalItems: 0, maxShowed: 0, pocket: 0 },
    gTasks: [],
    input: makeInput(),
    operations: [],
    itemDefinitions: new Map(),
    partyCount: 1,
    pcCanStoreItems: true,
    inUnionRoom: false,
    linkActive: false,
    overworldLinkBusy: false,
    playerAvatarFlags: 0,
    tempTileDataBusy: false,
    nextTaskId: 0,
    nextArrowTaskId: 0,
    listCursor: {}
  };
  resetBagPockets(runtime);
  activeRuntime = runtime;
  return runtime;
}

export function defineItem(runtime: ItemMenuRuntime, itemId: number, def: Partial<ItemDefinition>): void {
  runtime.itemDefinitions.set(itemId, { name: `ITEM_${itemId}`, description: `Description ${itemId}`, price: 0, importance: 0, type: 0, fieldFunc: `FieldFunc_${itemId}`, battleFunc: `BattleFunc_${itemId}`, battleUsage: false, mail: false, ...def });
}

export function GoToBagMenu(location: number, pocket: number, bagCallback: MainCallback, runtime = requireRuntime()): void { NullBagMenuBufferPtrs(runtime); runtime.sBagMenuDisplay = { exitCB: null, itemOriginalLocation: 0xff, pocketSwitchMode: location === ITEMMENULOCATION_ITEMPC ? 1 : location === ITEMMENULOCATION_OLD_MAN ? 2 : 0, itemMenuIcon: 0, inhibitItemDescriptionPrint: false, contextMenuSelectedItem: 0, pocketScrollArrowsTask: TASK_NONE, pocketSwitchArrowsTask: TASK_NONE, nItems: [0, 0, 0], maxShowed: [0, 0, 0], data: [0, 0, 0, 0] }; if (location !== ITEMMENULOCATION_LAST) runtime.gBagMenuState.location = location; if (bagCallback !== null) runtime.gBagMenuState.bagCallback = bagCallback; if ([OPEN_BAG_ITEMS, OPEN_BAG_KEYITEMS, OPEN_BAG_POKEBALLS].includes(pocket)) runtime.gBagMenuState.pocket = pocket; runtime.gSpecialVar_ItemId = ITEM_NONE; runtime.gMain.state = 0; op(runtime, 'SetMainCallback2:CB2_OpenBagMenu'); }
export function CB2_BagMenuFromStartMenu(runtime = requireRuntime()): void { GoToBagMenu(ITEMMENULOCATION_FIELD, OPEN_BAG_LAST, 'CB2_ReturnToFieldWithOpenMenu', runtime); }
export function CB2_BagMenuFromBattle(runtime = requireRuntime()): void { GoToBagMenu(ITEMMENULOCATION_BATTLE, OPEN_BAG_LAST, 'SetCB2ToReshowScreenAfterMenu2', runtime); }
export function CB2_BagMenuRun(runtime = requireRuntime()): void { op(runtime, 'RunTasks'); op(runtime, 'AnimateSprites'); op(runtime, 'BuildOamBuffer'); op(runtime, 'DoScheduledBgTilemapCopiesToVram'); op(runtime, 'UpdatePaletteFade'); }
export function VBlankCB_BagMenuRun(runtime = requireRuntime()): void { op(runtime, 'LoadOam'); op(runtime, 'ProcessSpriteCopyRequests'); op(runtime, 'TransferPlttBuffer'); }
export function CB2_OpenBagMenu(runtime = requireRuntime()): void { while (!runtime.overworldLinkBusy && !runtime.linkActive) if (LoadBagMenuGraphics(runtime)) break; }
export function LoadBagMenuGraphics(runtime = requireRuntime()): boolean { const d = display(runtime); switch (runtime.gMain.state) { case 0: op(runtime, 'SetVBlankHBlankCallbacksToNull'); runtime.gMain.state++; break; case 1: op(runtime, 'ScanlineEffect_Stop'); runtime.gMain.state++; break; case 2: op(runtime, 'FreeAllSpritePalettes'); runtime.gMain.state++; break; case 3: runtime.gPaletteFade.bufferTransferDisabled = true; runtime.gMain.state++; break; case 4: op(runtime, 'ResetSpriteData'); runtime.gMain.state++; break; case 5: op(runtime, 'ResetItemMenuIconState'); runtime.gMain.state++; break; case 6: if (!runtime.linkActive) op(runtime, 'ResetTasks'); runtime.gMain.state++; break; case 7: if (BagMenuInitBgsAndAllocTilemapBuffer(runtime)) { d.data[0] = 0; runtime.gMain.state++; } else { FadeOutOfBagMenu(runtime); return true; } break; case 8: if (DoLoadBagGraphics(runtime)) runtime.gMain.state++; break; case 9: op(runtime, 'InitBagWindows'); runtime.gMain.state++; break; case 10: All_CalculateNItemsAndMaxShowed(runtime); CalculateInitialCursorPosAndItemsAbove(runtime); UpdatePocketScrollPositions(runtime); runtime.gMain.state++; break; case 11: if (!TryAllocListMenuBuffers(runtime)) { FadeOutOfBagMenu(runtime); return true; } runtime.gMain.state++; break; case 12: Bag_BuildListMenuTemplate(runtime.gBagMenuState.pocket, runtime); runtime.gMain.state++; break; case 13: runtime.gBagMenuState.location !== ITEMMENULOCATION_ITEMPC ? PrintBagPocketName(runtime) : op(runtime, 'BagDrawDepositItemTextBox'); runtime.gMain.state++; break; case 14: { const taskId = CreateBagInputHandlerTask(runtime.gBagMenuState.location, runtime); task(runtime, taskId).data[0] = listMenuInit(runtime, runtime.gBagMenuState.cursorPos[runtime.gBagMenuState.pocket], runtime.gBagMenuState.itemsAbove[runtime.gBagMenuState.pocket]); task(runtime, taskId).data[3] = 0; task(runtime, taskId).data[8] = 0; runtime.gMain.state++; break; } case 15: op(runtime, `CreateBagSprite:${runtime.gBagMenuState.pocket}`); runtime.gMain.state++; break; case 16: CreatePocketScrollArrowPair(runtime); CreatePocketSwitchArrowPair(runtime); runtime.gMain.state++; break; case 17: op(runtime, 'CreateSwapLine'); runtime.gMain.state++; break; case 18: ShowBagOrBeginWin0OpenTask(runtime); runtime.gMain.state++; break; case 19: op(runtime, runtime.gBagMenuState.location === ITEMMENULOCATION_ITEMPC ? 'SetHelpContext:PLAYERS_PC_ITEMS' : 'SetHelpContext:BAG'); runtime.gPaletteFade.bufferTransferDisabled = false; runtime.gMain.state++; break; default: op(runtime, 'SetVBlankCallback:VBlankCB_BagMenuRun'); op(runtime, 'SetMainCallback2:CB2_BagMenuRun'); return true; } return false; }
export function FadeOutOfBagMenu(runtime = requireRuntime()): void { beginFade(runtime); createTask(runtime, 'Task_WaitFadeOutOfBagMenu'); op(runtime, 'SetVBlankCallback:VBlankCB_BagMenuRun'); op(runtime, 'SetMainCallback2:CB2_BagMenuRun'); }
export function Task_WaitFadeOutOfBagMenu(taskId: number, runtime = requireRuntime()): void { if (!runtime.gPaletteFade.active) { op(runtime, `SetMainCallback2:${runtime.gBagMenuState.bagCallback ?? 'NULL'}`); DestroyBagMenuResources(runtime); destroyTask(runtime, taskId); } }
export function NullBagMenuBufferPtrs(runtime = requireRuntime()): void { runtime.sBagMenuDisplay = null; runtime.sBagBgTilemapBuffer = null; runtime.sListMenuItems = null; runtime.sListMenuItemStrings = null; }
export function BagMenuInitBgsAndAllocTilemapBuffer(runtime = requireRuntime()): boolean { runtime.sBagBgTilemapBuffer = Array.from({ length: 0x800 }, () => 0); op(runtime, 'BagMenuInitBgsAndAllocTilemapBuffer'); return true; }
export function DoLoadBagGraphics(runtime = requireRuntime()): boolean { const d = display(runtime); switch (d.data[0]) { case 0: op(runtime, 'ResetTempTileDataBuffers'); d.data[0]++; break; case 1: if (!runtime.tempTileDataBusy) { op(runtime, runtime.gBagMenuState.location !== ITEMMENULOCATION_ITEMPC ? 'LZDecompressWram:gBagBg_Tilemap' : 'LZDecompressWram:gBagBg_ItemPC_Tilemap'); d.data[0]++; } break; case 2: op(runtime, BagIsTutorial(runtime) || runtime.gSaveBlock2Ptr.playerGender === MALE ? 'LoadPalette:male' : 'LoadPalette:female'); d.data[0]++; break; case 3: op(runtime, BagIsTutorial(runtime) || runtime.gSaveBlock2Ptr.playerGender === MALE ? 'LoadBagMale' : 'LoadBagFemale'); d.data[0]++; break; case 4: op(runtime, 'LoadBagPalette'); d.data[0]++; break; case 5: op(runtime, 'LoadBagSwapSpriteSheet'); d.data[0]++; break; default: op(runtime, 'LoadBagSwapSpritePalette'); d.data[0] = 0; return true; } return false; }
export function CreateBagInputHandlerTask(location: number, runtime = requireRuntime()): number { if (location === ITEMMENULOCATION_OLD_MAN) return createTask(runtime, 'Task_Bag_OldManTutorial'); if (location === ITEMMENULOCATION_TTVSCR_REGISTER) return createTask(runtime, 'Task_Bag_TeachyTvRegister'); if (location === ITEMMENULOCATION_TTVSCR_TMS) return createTask(runtime, 'Task_Bag_TeachyTvTMs'); if (location === ITEMMENULOCATION_TTVSCR_STATUS) return createTask(runtime, 'Task_Bag_TeachyTvStatus'); if (location === ITEMMENULOCATION_TTVSCR_CATCHING) return createTask(runtime, 'Task_Bag_TeachyTvCatching'); return createTask(runtime, 'Task_BagMenu_HandleInput'); }
export function TryAllocListMenuBuffers(runtime = requireRuntime()): boolean { runtime.sListMenuItems = []; runtime.sListMenuItemStrings = []; return true; }
export function Bag_BuildListMenuTemplate(pocket: number, runtime = requireRuntime()): void { const d = display(runtime); const pocketData = runtime.gBagPockets[pocket]; const items: Array<{ label: string; index: number }> = []; const strings: string[] = []; for (let i = 0; i < d.nItems[pocket]; i += 1) { const label = BagListMenuGetItemNameColored([], pocketData.itemSlots[i].itemId, runtime); strings[i] = label; items[i] = { label, index: i }; } strings[d.nItems[pocket]] = 'regular:CANCEL'; items[d.nItems[pocket]] = { label: strings[d.nItems[pocket]], index: d.nItems[pocket] }; runtime.sListMenuItemStrings = strings; runtime.sListMenuItems = items; runtime.gMultiuseListMenuTemplate = { items, totalItems: d.nItems[pocket] + 1, maxShowed: d.maxShowed[pocket], pocket }; }
export function BagListMenuGetItemNameColored(_dest: number[] | string[], itemId: number, runtime = requireRuntime()): string { return `${itemId === ITEM_TM_CASE || itemId === ITEM_BERRY_POUCH ? 'blue' : 'regular'}:${itemName(runtime, itemId)}`; }
export function BagListMenuMoveCursorFunc(itemIndex: number, onInit: boolean, _list: unknown, runtime = requireRuntime()): void { const d = display(runtime); if (!onInit) { playSE(runtime, SE_BAG_CURSOR); op(runtime, 'ShakeBagSprite'); } if (d.itemOriginalLocation === 0xff) { op(runtime, `DestroyItemMenuIcon:${d.itemMenuIcon ^ 1}`); op(runtime, `CreateItemMenuIcon:${d.nItems[runtime.gBagMenuState.pocket] !== itemIndex ? bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, itemIndex) : ITEMS_COUNT}:${d.itemMenuIcon}`); d.itemMenuIcon ^= 1; if (!d.inhibitItemDescriptionPrint) PrintItemDescriptionOnMessageWindow(itemIndex, runtime); } }
export function BagListMenuItemPrintFunc(windowId: number, itemId: number, y: number, runtime = requireRuntime()): void { const d = display(runtime); if (d.itemOriginalLocation !== 0xff) bag_menu_print_cursor(y, d.itemOriginalLocation === itemId ? 2 : 0xff, runtime); if (itemId !== -2 && d.nItems[runtime.gBagMenuState.pocket] !== itemId) { const bagItemId = bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, itemId); const qty = bagGetQuantityByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, itemId); if (runtime.gBagMenuState.pocket !== POCKET_KEY_ITEMS - 1 && getDefinition(runtime, bagItemId).importance === 0) op(runtime, `PrintQty:${windowId}:${qty}:${y}`); else if (runtime.gSaveBlock1Ptr.registeredItem !== ITEM_NONE && runtime.gSaveBlock1Ptr.registeredItem === bagItemId) op(runtime, `BlitSelectButton:${windowId}:${y}`); } }
export function bag_menu_print_cursor_(taskId: number, colorIdx: number, runtime = requireRuntime()): void { bag_menu_print_cursor(taskId, colorIdx, runtime); }
export function bag_menu_print_cursor(y: number, colorIdx: number, runtime = requireRuntime()): void { op(runtime, colorIdx === 0xff ? `ClearCursor:${y}` : `PrintCursor:${y}:${colorIdx}`); }
export function PrintBagPocketName(runtime = requireRuntime()): void { op(runtime, `PrintBagPocketName:${runtime.gBagMenuState.pocket}`); }
export function PrintItemDescriptionOnMessageWindow(itemIndex: number, runtime = requireRuntime()): void { const d = display(runtime); const desc = itemIndex !== d.nItems[runtime.gBagMenuState.pocket] ? getDefinition(runtime, bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, itemIndex)).description : 'Close Bag'; op(runtime, `PrintDescription:${desc}`); }
export function CreatePocketScrollArrowPair(runtime = requireRuntime()): void { const d = display(runtime); d.pocketScrollArrowsTask = runtime.nextArrowTaskId++; op(runtime, `CreatePocketScrollArrowPair:${d.pocketScrollArrowsTask}`); }
export function CreatePocketSwitchArrowPair(runtime = requireRuntime()): void { const d = display(runtime); if (d.pocketSwitchMode !== 1) { d.pocketSwitchArrowsTask = runtime.nextArrowTaskId++; op(runtime, `CreatePocketSwitchArrowPair:${d.pocketSwitchArrowsTask}`); } }
export function CreatePocketScrollArrowPair_SellQuantity(runtime = requireRuntime()): void { const d = display(runtime); d.contextMenuSelectedItem = 1; d.pocketScrollArrowsTask = runtime.nextArrowTaskId++; op(runtime, 'CreatePocketScrollArrowPair_SellQuantity'); }
export function CreateArrowPair_QuantitySelect(runtime = requireRuntime()): void { const d = display(runtime); d.contextMenuSelectedItem = 1; d.pocketScrollArrowsTask = runtime.nextArrowTaskId++; op(runtime, 'CreateArrowPair_QuantitySelect'); }
export function BagDestroyPocketScrollArrowPair(runtime = requireRuntime()): void { const d = display(runtime); if (d.pocketScrollArrowsTask !== TASK_NONE) { op(runtime, `RemoveScrollIndicatorArrowPair:${d.pocketScrollArrowsTask}`); d.pocketScrollArrowsTask = TASK_NONE; } BagDestroyPocketSwitchArrowPair(runtime); }
export function BagDestroyPocketSwitchArrowPair(runtime = requireRuntime()): void { const d = display(runtime); if (d.pocketSwitchArrowsTask !== TASK_NONE) { op(runtime, `RemoveScrollIndicatorArrowPair:${d.pocketSwitchArrowsTask}`); d.pocketSwitchArrowsTask = TASK_NONE; } }
export function ResetBagCursorPositions(runtime = requireRuntime()): void { runtime.gBagMenuState.pocket = POCKET_ITEMS - 1; runtime.gBagMenuState.bagOpen = false; runtime.gBagMenuState.itemsAbove.fill(0); runtime.gBagMenuState.cursorPos.fill(0); }
export function PocketCalculateInitialCursorPosAndItemsAbove(pocketId: number, runtime = requireRuntime()): void { const d = display(runtime); if (runtime.gBagMenuState.cursorPos[pocketId] !== 0 && runtime.gBagMenuState.cursorPos[pocketId] + d.maxShowed[pocketId] > d.nItems[pocketId] + 1) runtime.gBagMenuState.cursorPos[pocketId] = d.nItems[pocketId] + 1 - d.maxShowed[pocketId]; if (runtime.gBagMenuState.cursorPos[pocketId] + runtime.gBagMenuState.itemsAbove[pocketId] >= d.nItems[pocketId] + 1) runtime.gBagMenuState.itemsAbove[pocketId] = d.nItems[pocketId] + 1 < 2 ? 0 : d.nItems[pocketId]; }
export function CalculateInitialCursorPosAndItemsAbove(runtime = requireRuntime()): void { for (let i = 0; i < NUM_BAG_POCKETS_NO_CASES; i += 1) PocketCalculateInitialCursorPosAndItemsAbove(i, runtime); }
export function UpdatePocketScrollPositions(runtime = requireRuntime()): void { const d = display(runtime); for (let i = 0; i < NUM_BAG_POCKETS_NO_CASES; i += 1) if (runtime.gBagMenuState.itemsAbove[i] > 3) for (let j = 0; j <= runtime.gBagMenuState.itemsAbove[i] - 3; runtime.gBagMenuState.itemsAbove[i] -= 1, runtime.gBagMenuState.cursorPos[i] += 1, j += 1) if (runtime.gBagMenuState.cursorPos[i] + d.maxShowed[i] === d.nItems[i] + 1) break; }
export function DestroyBagMenuResources(runtime = requireRuntime()): void { runtime.sBagMenuDisplay = null; runtime.sBagBgTilemapBuffer = null; runtime.sListMenuItems = null; runtime.sListMenuItemStrings = null; op(runtime, 'FreeAllWindowBuffers'); }
export function ItemMenu_StartFadeToExitCallback(taskId: number, runtime = requireRuntime()): void { beginFade(runtime); setTaskFunc(runtime, taskId, 'Task_ItemMenu_WaitFadeAndSwitchToExitCallback'); }
export function Task_ItemMenu_WaitFadeAndSwitchToExitCallback(taskId: number, runtime = requireRuntime()): void { if (!runtime.gPaletteFade.active) { const t = task(runtime, taskId); destroyListMenuTask(runtime, t.data[0]); op(runtime, `SetMainCallback2:${display(runtime).exitCB ?? runtime.gBagMenuState.bagCallback ?? 'NULL'}`); BagDestroyPocketScrollArrowPair(runtime); DestroyBagMenuResources(runtime); destroyTask(runtime, taskId); } }
export function ShowBagOrBeginWin0OpenTask(runtime = requireRuntime()): void { op(runtime, 'BeginNormalPaletteFade:open'); if (!runtime.gBagMenuState.bagOpen) { const id = createTask(runtime, 'Task_AnimateWin0v'); task(runtime, id).data[0] = 192; task(runtime, id).data[1] = -16; runtime.gBagMenuState.bagOpen = true; } }
export function Bag_BeginCloseWin0Animation(runtime = requireRuntime()): void { const id = createTask(runtime, 'Task_AnimateWin0v'); task(runtime, id).data[0] = -16; task(runtime, id).data[1] = 16; runtime.gBagMenuState.bagOpen = false; }
export function CB2_SetUpReshowBattleScreenAfterMenu(runtime = requireRuntime()): void { runtime.gBagMenuState.bagOpen = false; }
export function Task_AnimateWin0v(taskId: number, runtime = requireRuntime()): void { const data = task(runtime, taskId).data; data[0] += data[1]; op(runtime, `SetWin0V:${data[0] > 160 ? 160 : data[0]}`); if ((data[1] === 16 && data[0] === 160) || (data[1] === -16 && data[0] === 0)) destroyTask(runtime, taskId); }
export function MoveItemSlotInList(itemSlots_: ItemSlot[], from: number, to_: number): void { const itemSlots = itemSlots_; let to = to_; if (from !== to) { const firstSlot = { ...itemSlots[from] }; if (to > from) { to -= 1; for (let i = from, count = to; i < count; i += 1) itemSlots[i] = itemSlots[i + 1]; } else { for (let i = from, count = to; i > count; i -= 1) itemSlots[i] = itemSlots[i - 1]; } itemSlots[to] = firstSlot; } }
export function Pocket_CalculateNItemsAndMaxShowed(pocketId: number, runtime = requireRuntime()): void { const d = display(runtime); const pocket = runtime.gBagPockets[pocketId]; compaction(pocket.itemSlots); d.nItems[pocketId] = 0; for (let i = 0; i < pocket.capacity; i += 1) { if (pocket.itemSlots[i].itemId === ITEM_NONE) break; d.nItems[pocketId] += 1; } d.maxShowed[pocketId] = d.nItems[pocketId] + 1 > 6 ? 6 : d.nItems[pocketId] + 1; }
export function All_CalculateNItemsAndMaxShowed(runtime = requireRuntime()): void { for (let i = 0; i < NUM_BAG_POCKETS_NO_CASES; i += 1) Pocket_CalculateNItemsAndMaxShowed(i, runtime); }
export function DisplayItemMessageInBag(taskId: number, fontId: number, string: string, followUpFunc: TaskFuncName, runtime = requireRuntime()): void { task(runtime, taskId).data[10] = 5; op(runtime, `DisplayMessage:${fontId}:${string}`); setTaskFunc(runtime, taskId, followUpFunc); }
export function ItemMenu_SetExitCallback(cb: MainCallback, runtime = requireRuntime()): void { display(runtime).exitCB = cb; }
export function GetSelectedItemIndex(pocket: number, runtime = requireRuntime()): number { return selectedIndex(runtime, pocket); }
export function Task_BagMenu_HandleInput(taskId: number, runtime = requireRuntime()): void { if (runtime.gPaletteFade.active || runtime.overworldLinkBusy) return; const t = task(runtime, taskId); const pocketSwitch = ProcessPocketSwitchInput(taskId, runtime.gBagMenuState.pocket, runtime); if (pocketSwitch === 1) { SwitchPockets(taskId, -1, false, runtime); return; } if (pocketSwitch === 2) { SwitchPockets(taskId, 1, false, runtime); return; } if (runtime.input.select && runtime.gBagMenuState.location === ITEMMENULOCATION_FIELD) { const c = listMenuGetScrollAndRow(runtime, t.data[0]); if (c.cursorPos + c.itemsAbove !== display(runtime).nItems[runtime.gBagMenuState.pocket]) { playSE(runtime, SE_SELECT); BeginMovingItemInPocket(taskId, c.cursorPos + c.itemsAbove, runtime); return; } } const input = listMenuProcessInput(runtime, t.data[0]); const c = listMenuGetScrollAndRow(runtime, t.data[0]); runtime.gBagMenuState.cursorPos[runtime.gBagMenuState.pocket] = c.cursorPos; runtime.gBagMenuState.itemsAbove[runtime.gBagMenuState.pocket] = c.itemsAbove; if (input === LIST_NOTHING_CHOSEN) return; playSE(runtime, SE_SELECT); if (input === LIST_CANCEL || input === display(runtime).nItems[runtime.gBagMenuState.pocket]) { runtime.gSpecialVar_ItemId = ITEM_NONE; Bag_BeginCloseWin0Animation(runtime); setTaskFunc(runtime, taskId, 'ItemMenu_StartFadeToExitCallback'); } else { BagDestroyPocketScrollArrowPair(runtime); bag_menu_print_cursor_(t.data[0], 2, runtime); t.data[1] = input; t.data[2] = bagGetQuantityByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, input); runtime.gSpecialVar_ItemId = bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, input); setTaskFunc(runtime, taskId, 'Task_ItemContextMenuByLocation'); } }
export function Task_ItemContextMenuByLocation(taskId: number, runtime = requireRuntime()): void { Bag_FillMessageBoxWithPalette(1, runtime); const handlers: Record<number, TaskFuncName | null> = { [ITEMMENULOCATION_FIELD]: 'Task_ItemContext_FieldOrBattle', [ITEMMENULOCATION_PARTY]: 'Task_ItemContext_FieldGive', [ITEMMENULOCATION_SHOP]: 'Task_ItemContext_Sell', [ITEMMENULOCATION_ITEMPC]: 'Task_ItemContext_Deposit', [ITEMMENULOCATION_PCBOX]: 'Task_ItemContext_PcBoxGive', [ITEMMENULOCATION_BATTLE]: 'Task_ItemContext_FieldOrBattle', [ITEMMENULOCATION_OLD_MAN]: null }; const h = handlers[runtime.gBagMenuState.location]; if (h) taskHandlers[h](taskId, runtime); }
export function Task_RedrawArrowsAndReturnToBagMenuSelect(taskId: number, runtime = requireRuntime()): void { Bag_FillMessageBoxWithPalette(0, runtime); CreatePocketScrollArrowPair(runtime); CreatePocketSwitchArrowPair(runtime); setTaskFunc(runtime, taskId, 'Task_BagMenu_HandleInput'); }
export function Bag_FillMessageBoxWithPalette(a0: number, runtime = requireRuntime()): void { op(runtime, `Bag_FillMessageBoxWithPalette:${a0}`); }
export function ProcessPocketSwitchInput(_taskId: number, pocketId: number, runtime = requireRuntime()): number { if (display(runtime).pocketSwitchMode !== 0) return 0; if (runtime.input.left || runtime.input.l) { if (pocketId === POCKET_ITEMS - 1) return 0; playSE(runtime, SE_BAG_POCKET); return 1; } if (runtime.input.right || runtime.input.r) { if (pocketId >= POCKET_POKE_BALLS - 1) return 0; playSE(runtime, SE_BAG_POCKET); return 2; } return 0; }
export function SwitchPockets(taskId: number, direction: number, a2: boolean, runtime = requireRuntime()): void { const t = task(runtime, taskId); t.data[13] = 0; t.data[12] = 0; t.data[11] = direction; if (!a2) { destroyListMenuTask(runtime, t.data[0]); BagDestroyPocketScrollArrowPair(runtime); } op(runtime, `SetBagVisualPocketId:${runtime.gBagMenuState.pocket + direction}`); t.followupFunc = t.func; setTaskFunc(runtime, taskId, 'Task_AnimateSwitchPockets'); }
export function Task_AnimateSwitchPockets(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); if (t.data[13] === 0) { if (t.data[12] !== SHRT_MAX) { t.data[12] += 1; DrawItemListRow(t.data[12], runtime); if (t.data[12] === LIST_TILES_HEIGHT) t.data[12] = SHRT_MAX; } if (t.data[12] === SHRT_MAX) t.data[13] += 1; } else { runtime.gBagMenuState.pocket += t.data[11]; PrintBagPocketName(runtime); Bag_BuildListMenuTemplate(runtime.gBagMenuState.pocket, runtime); t.data[0] = listMenuInit(runtime, runtime.gBagMenuState.cursorPos[runtime.gBagMenuState.pocket], runtime.gBagMenuState.itemsAbove[runtime.gBagMenuState.pocket]); CreatePocketScrollArrowPair(runtime); CreatePocketSwitchArrowPair(runtime); t.func = t.followupFunc; } }
export function BeginMovingItemInPocket(taskId: number, itemIndex: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); const c = listMenuGetScrollAndRow(runtime, t.data[0]); t.data[1] = itemIndex; display(runtime).itemOriginalLocation = itemIndex; op(runtime, `WhereShould:${itemName(runtime, bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, t.data[1]))}`); op(runtime, `UpdateSwapLinePos:${c.cursorPos}:${c.itemsAbove}`); BagDestroyPocketSwitchArrowPair(runtime); bag_menu_print_cursor_(t.data[0], 2, runtime); setTaskFunc(runtime, taskId, 'Task_MoveItemInPocket_HandleInput'); }
export function Task_MoveItemInPocket_HandleInput(taskId: number, runtime = requireRuntime()): void { if (runtime.overworldLinkBusy) return; const t = task(runtime, taskId); const input = listMenuProcessInput(runtime, t.data[0]); const c = listMenuGetScrollAndRow(runtime, t.data[0]); runtime.gBagMenuState.cursorPos[runtime.gBagMenuState.pocket] = c.cursorPos; runtime.gBagMenuState.itemsAbove[runtime.gBagMenuState.pocket] = c.itemsAbove; if (runtime.input.select) { playSE(runtime, SE_SELECT); display(runtime).itemOriginalLocation = 0xff; ExecuteMoveItemInPocket(taskId, c.cursorPos + c.itemsAbove, runtime); return; } if (input === LIST_NOTHING_CHOSEN) return; playSE(runtime, SE_SELECT); display(runtime).itemOriginalLocation = 0xff; if (input === LIST_CANCEL) AbortMovingItemInPocket(taskId, c.cursorPos + c.itemsAbove, runtime); else ExecuteMoveItemInPocket(taskId, input, runtime); }
export function ExecuteMoveItemInPocket(taskId: number, itemIndex: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); if (t.data[1] === itemIndex || t.data[1] === itemIndex - 1) { AbortMovingItemInPocket(taskId, itemIndex, runtime); } else { MoveItemSlotInList(currentPocketSlots(runtime), t.data[1], itemIndex); destroyListMenuTask(runtime, t.data[0]); if (t.data[1] < itemIndex) runtime.gBagMenuState.itemsAbove[runtime.gBagMenuState.pocket] -= 1; Bag_BuildListMenuTemplate(runtime.gBagMenuState.pocket, runtime); t.data[0] = listMenuInit(runtime, runtime.gBagMenuState.cursorPos[runtime.gBagMenuState.pocket], runtime.gBagMenuState.itemsAbove[runtime.gBagMenuState.pocket]); CreatePocketSwitchArrowPair(runtime); setTaskFunc(runtime, taskId, 'Task_BagMenu_HandleInput'); } }
export function AbortMovingItemInPocket(taskId: number, itemIndex: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); destroyListMenuTask(runtime, t.data[0]); if (t.data[1] < itemIndex) runtime.gBagMenuState.itemsAbove[runtime.gBagMenuState.pocket] -= 1; Bag_BuildListMenuTemplate(runtime.gBagMenuState.pocket, runtime); t.data[0] = listMenuInit(runtime, runtime.gBagMenuState.cursorPos[runtime.gBagMenuState.pocket], runtime.gBagMenuState.itemsAbove[runtime.gBagMenuState.pocket]); CreatePocketSwitchArrowPair(runtime); setTaskFunc(runtime, taskId, 'Task_BagMenu_HandleInput'); }
export function InitQuantityToTossOrDeposit(cursorPos: number, str: string, runtime = requireRuntime()): void { op(runtime, `InitQuantity:${cursorPos}:${str}:${itemName(runtime, bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, cursorPos))}`); CreateArrowPair_QuantitySelect(runtime); }
export function UpdateQuantityToTossOrDeposit(value: number, ndigits: number, runtime = requireRuntime()): void { op(runtime, `UpdateQuantity:${value}:${ndigits}`); }
export function DrawItemListRow(row: number, runtime = requireRuntime()): void { op(runtime, `DrawItemListRow:${row}`); }
export function OpenContextMenu(taskId: number, runtime = requireRuntime()): void { const itemId = runtime.gSpecialVar_ItemId; if (runtime.gBagMenuState.location === ITEMMENULOCATION_BATTLE || runtime.gBagMenuState.location === ITEMMENULOCATION_TTVSCR_STATUS) { if (itemId === ITEM_BERRY_POUCH) { runtime.sContextMenuItemsBuffer[0] = ITEMMENUACTION_OPEN_BERRIES; runtime.sContextMenuItemsBuffer[1] = ITEMMENUACTION_CANCEL; runtime.sContextMenuItemsPtr = runtime.sContextMenuItemsBuffer; runtime.sContextMenuNumItems = 2; } else if (getDefinition(runtime, itemId).battleUsage) { runtime.sContextMenuItemsPtr = sContextMenuItems_BattleUse; runtime.sContextMenuNumItems = 2; } else { runtime.sContextMenuItemsPtr = sContextMenuItems_Cancel; runtime.sContextMenuNumItems = 1; } } else if (runtime.gBagMenuState.location === ITEMMENULOCATION_OLD_MAN || runtime.gBagMenuState.location === ITEMMENULOCATION_TTVSCR_CATCHING) { runtime.sContextMenuItemsPtr = sContextMenuItems_BattleUse; runtime.sContextMenuNumItems = 2; } else if (runtime.linkActive || runtime.inUnionRoom) { if (itemId === ITEM_TM_CASE || itemId === ITEM_BERRY_POUCH) { runtime.sContextMenuItemsPtr = sContextMenuItems_Open; runtime.sContextMenuNumItems = 2; } else { runtime.sContextMenuNumItems = runtime.gBagMenuState.pocket === POCKET_KEY_ITEMS - 1 ? 1 : 2; runtime.sContextMenuItemsPtr = sContextMenuItems_GiveIfNotKeyItemPocket[runtime.gBagMenuState.pocket]; } } else { switch (runtime.gBagMenuState.pocket) { case OPEN_BAG_ITEMS: runtime.sContextMenuNumItems = 4; runtime.sContextMenuItemsPtr = getDefinition(runtime, itemId).mail ? sContextMenuItems_CheckGiveTossCancel : sContextMenuItems_Field[runtime.gBagMenuState.pocket]; break; case OPEN_BAG_KEYITEMS: runtime.sContextMenuItemsPtr = runtime.sContextMenuItemsBuffer; runtime.sContextMenuNumItems = 3; runtime.sContextMenuItemsBuffer[2] = ITEMMENUACTION_CANCEL; runtime.sContextMenuItemsBuffer[1] = runtime.gSaveBlock1Ptr.registeredItem === itemId ? ITEMMENUACTION_DESELECT : ITEMMENUACTION_REGISTER; runtime.sContextMenuItemsBuffer[0] = itemId === ITEM_TM_CASE || itemId === ITEM_BERRY_POUCH ? ITEMMENUACTION_OPEN : itemId === ITEM_BICYCLE && (runtime.playerAvatarFlags & (PLAYER_AVATAR_FLAG_ACRO_BIKE | PLAYER_AVATAR_FLAG_MACH_BIKE)) ? ITEMMENUACTION_WALK : ITEMMENUACTION_USE; break; case OPEN_BAG_POKEBALLS: runtime.sContextMenuItemsPtr = sContextMenuItems_Field[runtime.gBagMenuState.pocket]; runtime.sContextMenuNumItems = 3; break; } } op(runtime, `OpenContextMenu:${taskId}:${runtime.sContextMenuItemsPtr.slice(0, runtime.sContextMenuNumItems).join(',')}`); }
export function Task_ItemContext_FieldOrBattle(taskId: number, runtime = requireRuntime()): void { OpenContextMenu(taskId, runtime); setTaskFunc(runtime, taskId, 'Task_FieldItemContextMenuHandleInput'); }
export function Task_FieldItemContextMenuHandleInput(taskId: number, runtime = requireRuntime()): void { if (runtime.overworldLinkBusy) return; const input = menuInput(runtime); if (input === -1) { playSE(runtime, SE_SELECT); Task_ItemMenuAction_Cancel(taskId, runtime); } else if (input !== -2) { playSE(runtime, SE_SELECT); runContextAction(runtime.sContextMenuItemsPtr[input], taskId, runtime); } }
const runContextAction = (action: number, taskId: number, runtime: ItemMenuRuntime): void => { ([Task_ItemMenuAction_Use, Task_ItemMenuAction_Toss, Task_ItemMenuAction_ToggleSelect, Task_ItemMenuAction_Give, Task_ItemMenuAction_Cancel, Task_ItemMenuAction_BattleUse, Task_ItemMenuAction_Use, Task_ItemMenuAction_Use, Task_ItemMenuAction_BattleUse, Task_ItemMenuAction_Use, Task_ItemMenuAction_ToggleSelect, Task_ItemMenuAction_Cancel][action] ?? Task_ItemMenuAction_Cancel)(taskId, runtime); };
export function Task_ItemMenuAction_Use(taskId: number, runtime = requireRuntime()): void { const def = getDefinition(runtime, runtime.gSpecialVar_ItemId); if (def.fieldFunc !== null) { if (runtime.partyCount === 0 && def.type === ITEM_TYPE_PARTY_MENU) Task_PrintThereIsNoPokemon(taskId, runtime); else { op(runtime, `FieldFunc:${def.fieldFunc}:${taskId}`); setTaskFunc(runtime, taskId, 'Task_ReturnToBagFromContextMenu'); } } }
export function Task_ItemMenuAction_Toss(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); t.data[8] = 1; if (t.data[2] === 1) Task_ConfirmTossItems(taskId, runtime); else { InitQuantityToTossOrDeposit(t.data[1], 'TossOutHowMany', runtime); setTaskFunc(runtime, taskId, 'Task_SelectQuantityToToss'); } }
export function Task_ConfirmTossItems(taskId: number, runtime = requireRuntime()): void { op(runtime, `ConfirmToss:${task(runtime, taskId).data[8]}`); setTaskFunc(runtime, taskId, 'Task_TossItem_Yes'); }
export function Task_TossItem_No(taskId: number, runtime = requireRuntime()): void { bag_menu_print_cursor_(task(runtime, taskId).data[0], 1, runtime); Task_RedrawArrowsAndReturnToBagMenuSelect(taskId, runtime); }
export function Task_SelectQuantityToToss(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); const next = adjustQuantity(runtime, t.data[8], t.data[2]); if (next !== t.data[8]) { t.data[8] = next; UpdateQuantityToTossOrDeposit(t.data[8], 3, runtime); } else if (runtime.input.a) { playSE(runtime, SE_SELECT); BagDestroyPocketScrollArrowPair(runtime); Task_ConfirmTossItems(taskId, runtime); } else if (runtime.input.b) { playSE(runtime, SE_SELECT); BagDestroyPocketScrollArrowPair(runtime); Task_RedrawArrowsAndReturnToBagMenuSelect(taskId, runtime); } }
export function Task_TossItem_Yes(taskId: number, runtime = requireRuntime()): void { op(runtime, `ThrewAway:${runtime.gSpecialVar_ItemId}:${task(runtime, taskId).data[8]}`); setTaskFunc(runtime, taskId, 'Task_WaitAB_RedrawAndReturnToBag'); }
export function Task_WaitAB_RedrawAndReturnToBag(taskId: number, runtime = requireRuntime()): void { if (runtime.input.a || runtime.input.b) { playSE(runtime, SE_SELECT); removeBagItem(runtime, runtime.gSpecialVar_ItemId, task(runtime, taskId).data[8]); Pocket_CalculateNItemsAndMaxShowed(runtime.gBagMenuState.pocket, runtime); PocketCalculateInitialCursorPosAndItemsAbove(runtime.gBagMenuState.pocket, runtime); Bag_BuildListMenuTemplate(runtime.gBagMenuState.pocket, runtime); task(runtime, taskId).data[0] = listMenuInit(runtime, runtime.gBagMenuState.cursorPos[runtime.gBagMenuState.pocket], runtime.gBagMenuState.itemsAbove[runtime.gBagMenuState.pocket]); Task_RedrawArrowsAndReturnToBagMenuSelect(taskId, runtime); } }
export function Task_ItemMenuAction_ToggleSelect(taskId: number, runtime = requireRuntime()): void { const itemId = bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, task(runtime, taskId).data[1]); runtime.gSaveBlock1Ptr.registeredItem = runtime.gSaveBlock1Ptr.registeredItem === itemId ? ITEM_NONE : itemId; Bag_BuildListMenuTemplate(runtime.gBagMenuState.pocket, runtime); Task_ItemMenuAction_Cancel(taskId, runtime); }
export function Task_ItemMenuAction_Give(taskId: number, runtime = requireRuntime()): void { const itemId = bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, task(runtime, taskId).data[1]); if (!IsWritingMailAllowed(itemId, runtime)) DisplayItemMessageInBag(taskId, FONT_NORMAL, 'CantWriteMailHere', 'Task_WaitAButtonAndCloseContextMenu', runtime); else if (getDefinition(runtime, itemId).importance === 0) { if (runtime.partyCount === 0) Task_PrintThereIsNoPokemon(taskId, runtime); else { display(runtime).exitCB = 'CB2_ChooseMonToGiveItem'; setTaskFunc(runtime, taskId, 'ItemMenu_StartFadeToExitCallback'); } } else Task_PrintItemCantBeHeld(taskId, runtime); }
export function Task_PrintThereIsNoPokemon(taskId: number, runtime = requireRuntime()): void { DisplayItemMessageInBag(taskId, FONT_NORMAL, 'ThereIsNoPokemon', 'Task_WaitAButtonAndCloseContextMenu', runtime); }
export function Task_PrintItemCantBeHeld(taskId: number, runtime = requireRuntime()): void { DisplayItemMessageInBag(taskId, FONT_NORMAL, `${itemName(runtime, runtime.gSpecialVar_ItemId)}CantBeHeld`, 'Task_WaitAButtonAndCloseContextMenu', runtime); }
export function Task_WaitAButtonAndCloseContextMenu(taskId: number, runtime = requireRuntime()): void { if (runtime.input.a) { playSE(runtime, SE_SELECT); Task_ReturnToBagFromContextMenu(taskId, runtime); } }
export function Task_ReturnToBagFromContextMenu(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); destroyListMenuTask(runtime, t.data[0]); Pocket_CalculateNItemsAndMaxShowed(runtime.gBagMenuState.pocket, runtime); PocketCalculateInitialCursorPosAndItemsAbove(runtime.gBagMenuState.pocket, runtime); Bag_BuildListMenuTemplate(runtime.gBagMenuState.pocket, runtime); t.data[0] = listMenuInit(runtime, runtime.gBagMenuState.cursorPos[runtime.gBagMenuState.pocket], runtime.gBagMenuState.itemsAbove[runtime.gBagMenuState.pocket]); bag_menu_print_cursor_(t.data[0], 1, runtime); Task_RedrawArrowsAndReturnToBagMenuSelect(taskId, runtime); }
export function Task_UnusedReturnToBag(taskId: number, runtime = requireRuntime()): void { const c = listMenuGetScrollAndRow(runtime, task(runtime, taskId).data[0]); PrintItemDescriptionOnMessageWindow(c.cursorPos + c.itemsAbove, runtime); bag_menu_print_cursor_(task(runtime, taskId).data[0], 1, runtime); Task_RedrawArrowsAndReturnToBagMenuSelect(taskId, runtime); }
export function Task_ItemMenuAction_Cancel(taskId: number, runtime = requireRuntime()): void { bag_menu_print_cursor_(task(runtime, taskId).data[0], 1, runtime); Task_RedrawArrowsAndReturnToBagMenuSelect(taskId, runtime); }
export function Task_ItemMenuAction_BattleUse(taskId: number, runtime = requireRuntime()): void { const def = getDefinition(runtime, runtime.gSpecialVar_ItemId); if (def.battleFunc !== null) { op(runtime, `BattleFunc:${def.battleFunc}:${taskId}`); setTaskFunc(runtime, taskId, 'Task_ReturnToBagFromContextMenu'); } }
export function Task_ItemContext_FieldGive(taskId: number, runtime = requireRuntime()): void { const itemId = bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, task(runtime, taskId).data[1]); if (!IsWritingMailAllowed(itemId, runtime)) DisplayItemMessageInBag(taskId, FONT_NORMAL, 'CantWriteMailHere', 'Task_WaitAButtonAndCloseContextMenu', runtime); else if (itemId === ITEM_TM_CASE) { ItemMenu_SetExitCallback('GoToTMCase_Give', runtime); ItemMenu_StartFadeToExitCallback(taskId, runtime); } else if (itemId === ITEM_BERRY_POUCH) { ItemMenu_SetExitCallback('GoToBerryPouch_Give', runtime); ItemMenu_StartFadeToExitCallback(taskId, runtime); } else if (runtime.gBagMenuState.pocket !== POCKET_KEY_ITEMS - 1 && getDefinition(runtime, itemId).importance === 0) { Bag_BeginCloseWin0Animation(runtime); setTaskFunc(runtime, taskId, 'ItemMenu_StartFadeToExitCallback'); } else Task_PrintItemCantBeHeld(taskId, runtime); }
export function GoToTMCase_Give(runtime = requireRuntime()): void { op(runtime, 'InitTMCase:TMCASE_GIVE_PARTY:ReturnToBagMenuFromSubmenu_Give'); }
export function GoToBerryPouch_Give(runtime = requireRuntime()): void { op(runtime, 'InitBerryPouch:BERRYPOUCH_FROMPARTYGIVE:ReturnToBagMenuFromSubmenu_Give'); }
export function ReturnToBagMenuFromSubmenu_Give(runtime = requireRuntime()): void { op(runtime, 'CB2_SelectBagItemToGive'); }
export function Task_ItemContext_PcBoxGive(taskId: number, runtime = requireRuntime()): void { const itemId = bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, task(runtime, taskId).data[1]); if (getDefinition(runtime, itemId).mail) DisplayItemMessageInBag(taskId, FONT_NORMAL, 'CantWriteMailHere', 'Task_WaitAButtonAndCloseContextMenu', runtime); else if (itemId === ITEM_TM_CASE) { ItemMenu_SetExitCallback('GoToTMCase_PCBox', runtime); ItemMenu_StartFadeToExitCallback(taskId, runtime); } else if (itemId === ITEM_BERRY_POUCH) { ItemMenu_SetExitCallback('GoToBerryPouch_PCBox', runtime); ItemMenu_StartFadeToExitCallback(taskId, runtime); } else if (runtime.gBagMenuState.pocket !== POCKET_KEY_ITEMS - 1 && getDefinition(runtime, itemId).importance === 0) { Bag_BeginCloseWin0Animation(runtime); setTaskFunc(runtime, taskId, 'ItemMenu_StartFadeToExitCallback'); } else Task_PrintItemCantBeHeld(taskId, runtime); }
export function GoToTMCase_PCBox(runtime = requireRuntime()): void { op(runtime, 'InitTMCase:TMCASE_GIVE_PC:ReturnToBagMenuFromSubmenu_PCBox'); }
export function GoToBerryPouch_PCBox(runtime = requireRuntime()): void { op(runtime, 'InitBerryPouch:BERRYPOUCH_FROMPOKEMONSTORAGEPC:ReturnToBagMenuFromSubmenu_PCBox'); }
export function ReturnToBagMenuFromSubmenu_PCBox(runtime = requireRuntime()): void { GoToBagMenu(ITEMMENULOCATION_PCBOX, OPEN_BAG_LAST, 'CB2_ReturnToPokeStorage', runtime); }
export function Task_ItemContext_Sell(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); if (runtime.gSpecialVar_ItemId === ITEM_TM_CASE) { ItemMenu_SetExitCallback('GoToTMCase_Sell', runtime); ItemMenu_StartFadeToExitCallback(taskId, runtime); } else if (runtime.gSpecialVar_ItemId === ITEM_BERRY_POUCH) { ItemMenu_SetExitCallback('GoToBerryPouch_Sell', runtime); ItemMenu_StartFadeToExitCallback(taskId, runtime); } else if (getDefinition(runtime, runtime.gSpecialVar_ItemId).price === 0) DisplayItemMessageInBag(taskId, FONT_NORMAL, 'OhNoICantBuyThat', 'Task_ReturnToBagFromContextMenu', runtime); else { t.data[8] = 1; if (t.data[2] === 1) Task_PrintSaleConfirmationText(taskId, runtime); else { if (t.data[2] > 99) t.data[2] = 99; DisplayItemMessageInBag(taskId, FONT_NORMAL, 'HowManyWouldYouLikeToSell', 'Task_InitSaleQuantitySelectInterface', runtime); } } }
export function GoToTMCase_Sell(runtime = requireRuntime()): void { op(runtime, 'InitTMCase:TMCASE_SELL:ReturnToBagMenuFromSubmenu_Sell'); }
export function GoToBerryPouch_Sell(runtime = requireRuntime()): void { op(runtime, 'InitBerryPouch:BERRYPOUCH_FROMMARTSELL:ReturnToBagMenuFromSubmenu_Sell'); }
export function ReturnToBagMenuFromSubmenu_Sell(runtime = requireRuntime()): void { GoToBagMenu(ITEMMENULOCATION_SHOP, OPEN_BAG_LAST, 'CB2_ReturnToField', runtime); }
export function Task_PrintSaleConfirmationText(taskId: number, runtime = requireRuntime()): void { const amount = Math.trunc(getDefinition(runtime, bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, task(runtime, taskId).data[1])).price / 2) * task(runtime, taskId).data[8]; DisplayItemMessageInBag(taskId, FONT_NORMAL, `ICanPay:${amount}`, 'Task_ShowSellYesNoMenu', runtime); }
export function Task_ShowSellYesNoMenu(taskId: number, runtime = requireRuntime()): void { setTaskFunc(runtime, taskId, 'Task_SellItem_Yes'); op(runtime, 'BagCreateYesNoMenuTopRight'); }
export function Task_SellItem_No(taskId: number, runtime = requireRuntime()): void { bag_menu_print_cursor_(task(runtime, taskId).data[0], 1, runtime); Task_RedrawArrowsAndReturnToBagMenuSelect(taskId, runtime); }
export function Task_InitSaleQuantitySelectInterface(taskId: number, runtime = requireRuntime()): void { UpdateSalePriceDisplay(Math.trunc(getDefinition(runtime, bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, task(runtime, taskId).data[1])).price / 2) * task(runtime, taskId).data[8], runtime); CreatePocketScrollArrowPair_SellQuantity(runtime); setTaskFunc(runtime, taskId, 'Task_SelectQuantityToSell'); }
export function UpdateSalePriceDisplay(amount: number, runtime = requireRuntime()): void { op(runtime, `UpdateSalePriceDisplay:${amount}`); }
export function Task_SelectQuantityToSell(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); const next = adjustQuantity(runtime, t.data[8], t.data[2]); if (next !== t.data[8]) { t.data[8] = next; UpdateQuantityToTossOrDeposit(t.data[8], 2, runtime); UpdateSalePriceDisplay(Math.trunc(getDefinition(runtime, bagGetItemIdByPocketPosition(runtime, runtime.gBagMenuState.pocket + 1, t.data[1])).price / 2) * t.data[8], runtime); } else if (runtime.input.a) { playSE(runtime, SE_SELECT); BagDestroyPocketScrollArrowPair(runtime); Task_PrintSaleConfirmationText(taskId, runtime); } else if (runtime.input.b) { playSE(runtime, SE_SELECT); BagDestroyPocketScrollArrowPair(runtime); Task_RedrawArrowsAndReturnToBagMenuSelect(taskId, runtime); } }
export function Task_SellItem_Yes(taskId: number, runtime = requireRuntime()): void { const amount = Math.trunc(getDefinition(runtime, runtime.gSpecialVar_ItemId).price / 2) * task(runtime, taskId).data[8]; DisplayItemMessageInBag(taskId, FONT_NORMAL, `TurnedOver:${amount}`, 'Task_FinalizeSaleToShop', runtime); }
export function Task_FinalizeSaleToShop(taskId: number, runtime = requireRuntime()): void { playSE(runtime, SE_SHOP); const amount = Math.trunc(getDefinition(runtime, runtime.gSpecialVar_ItemId).price / 2) * task(runtime, taskId).data[8]; removeBagItem(runtime, runtime.gSpecialVar_ItemId, task(runtime, taskId).data[8]); runtime.gSaveBlock1Ptr.money += amount; op(runtime, `RecordItemTransaction:${runtime.gSpecialVar_ItemId}:${task(runtime, taskId).data[8]}`); Pocket_CalculateNItemsAndMaxShowed(runtime.gBagMenuState.pocket, runtime); PocketCalculateInitialCursorPosAndItemsAbove(runtime.gBagMenuState.pocket, runtime); display(runtime).inhibitItemDescriptionPrint = true; Bag_BuildListMenuTemplate(runtime.gBagMenuState.pocket, runtime); setTaskFunc(runtime, taskId, 'Task_WaitPressAB_AfterSell'); }
export function Task_WaitPressAB_AfterSell(taskId: number, runtime = requireRuntime()): void { if (runtime.input.a || runtime.input.b) { playSE(runtime, SE_SELECT); display(runtime).inhibitItemDescriptionPrint = false; Task_ReturnToBagFromContextMenu(taskId, runtime); } }
export function Task_ItemContext_Deposit(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); t.data[8] = 1; if (t.data[2] === 1) Task_TryDoItemDeposit(taskId, runtime); else { InitQuantityToTossOrDeposit(t.data[1], 'DepositHowMany', runtime); setTaskFunc(runtime, taskId, 'Task_SelectQuantityToDeposit'); } }
export function Task_SelectQuantityToDeposit(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); const next = adjustQuantity(runtime, t.data[8], t.data[2]); if (next !== t.data[8]) { t.data[8] = next; UpdateQuantityToTossOrDeposit(t.data[8], 3, runtime); } else if (runtime.input.a) { playSE(runtime, SE_SELECT); BagDestroyPocketScrollArrowPair(runtime); Task_TryDoItemDeposit(taskId, runtime); } else if (runtime.input.b) { playSE(runtime, SE_SELECT); BagDestroyPocketScrollArrowPair(runtime); Task_RedrawArrowsAndReturnToBagMenuSelect(taskId, runtime); } }
export function Task_TryDoItemDeposit(taskId: number, runtime = requireRuntime()): void { if (runtime.pcCanStoreItems) { op(runtime, `ItemUse_SetQuestLogEvent:DEPOSITED:${runtime.gSpecialVar_ItemId}`); setTaskFunc(runtime, taskId, 'Task_WaitAB_RedrawAndReturnToBag'); } else DisplayItemMessageInBag(taskId, FONT_NORMAL, 'NoRoomToStoreItems', 'Task_WaitAButtonAndCloseContextMenu', runtime); }
export function UseRegisteredKeyItemOnField(runtime = requireRuntime()): boolean { if (runtime.inUnionRoom) return false; op(runtime, 'DismissMapNamePopup'); if (runtime.gSaveBlock1Ptr.registeredItem !== ITEM_NONE) { const has = runtime.gBagPockets.some((p) => p.itemSlots.some((s) => s.itemId === runtime.gSaveBlock1Ptr.registeredItem && s.quantity >= 1)); if (has) { runtime.gSpecialVar_ItemId = runtime.gSaveBlock1Ptr.registeredItem; const id = createTask(runtime, 'Task_ReturnToBagFromContextMenu'); task(runtime, id).data[3] = 1; op(runtime, `CreateRegisteredItemTask:${runtime.gSpecialVar_ItemId}`); return true; } runtime.gSaveBlock1Ptr.registeredItem = ITEM_NONE; } op(runtime, 'ScriptContext_SetupScript:EventScript_BagItemCanBeRegistered'); return true; }
export function BagIsTutorial(runtime = requireRuntime()): boolean { return [ITEMMENULOCATION_OLD_MAN, ITEMMENULOCATION_TTVSCR_CATCHING, ITEMMENULOCATION_TTVSCR_STATUS, ITEMMENULOCATION_TTVSCR_REGISTER, ITEMMENULOCATION_TTVSCR_TMS].includes(runtime.gBagMenuState.location); }
export function BackUpPlayerBag(runtime = requireRuntime()): void { runtime.sBackupPlayerBag = { bagPocket_Items: cloneSlots(runtime.gSaveBlock1Ptr.bagPocket_Items), bagPocket_KeyItems: cloneSlots(runtime.gSaveBlock1Ptr.bagPocket_KeyItems), bagPocket_PokeBalls: cloneSlots(runtime.gSaveBlock1Ptr.bagPocket_PokeBalls), registeredItem: runtime.gSaveBlock1Ptr.registeredItem, pocket: runtime.gBagMenuState.pocket, itemsAbove: [...runtime.gBagMenuState.itemsAbove], cursorPos: [...runtime.gBagMenuState.cursorPos] }; clearItemSlots(runtime.gSaveBlock1Ptr.bagPocket_Items); clearItemSlots(runtime.gSaveBlock1Ptr.bagPocket_KeyItems); clearItemSlots(runtime.gSaveBlock1Ptr.bagPocket_PokeBalls); runtime.gSaveBlock1Ptr.registeredItem = ITEM_NONE; ResetBagCursorPositions(runtime); }
export function RestorePlayerBag(runtime = requireRuntime()): void { const b = runtime.sBackupPlayerBag; if (!b) return; runtime.gSaveBlock1Ptr.bagPocket_Items.splice(0, runtime.gSaveBlock1Ptr.bagPocket_Items.length, ...cloneSlots(b.bagPocket_Items)); runtime.gSaveBlock1Ptr.bagPocket_KeyItems.splice(0, runtime.gSaveBlock1Ptr.bagPocket_KeyItems.length, ...cloneSlots(b.bagPocket_KeyItems)); runtime.gSaveBlock1Ptr.bagPocket_PokeBalls.splice(0, runtime.gSaveBlock1Ptr.bagPocket_PokeBalls.length, ...cloneSlots(b.bagPocket_PokeBalls)); runtime.gSaveBlock1Ptr.registeredItem = b.registeredItem; runtime.gBagMenuState.pocket = b.pocket; runtime.gBagMenuState.itemsAbove = [...b.itemsAbove]; runtime.gBagMenuState.cursorPos = [...b.cursorPos]; runtime.sBackupPlayerBag = null; }
export function InitOldManBag(runtime = requireRuntime()): void { BackUpPlayerBag(runtime); addBagItem(runtime, ITEM_POTION, 1); addBagItem(runtime, ITEM_POKE_BALL, 1); GoToBagMenu(ITEMMENULOCATION_OLD_MAN, OPEN_BAG_ITEMS, 'SetCB2ToReshowScreenAfterMenu2', runtime); }
export function Task_Bag_OldManTutorial(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); if (!runtime.gPaletteFade.active) { if (t.data[8] === 102 || t.data[8] === 204) SwitchPockets(taskId, 1, false, runtime); else if (t.data[8] === 306) { runtime.gSpecialVar_ItemId = ITEM_POKE_BALL; OpenContextMenu(taskId, runtime); } else if (t.data[8] === 408) { destroyListMenuTask(runtime, t.data[0]); RestorePlayerBag(runtime); Bag_BeginCloseWin0Animation(runtime); setTaskFunc(runtime, taskId, 'Task_Pokedude_FadeFromBag'); return; } t.data[8] += 1; } }
export function Task_Pokedude_FadeFromBag(taskId: number, runtime = requireRuntime()): void { beginFade(runtime); setTaskFunc(runtime, taskId, 'Task_Pokedude_WaitFadeAndExitBag'); }
export function Task_Pokedude_WaitFadeAndExitBag(taskId: number, runtime = requireRuntime()): void { if (!runtime.gPaletteFade.active) { op(runtime, `SetMainCallback2:${display(runtime).exitCB ?? runtime.gBagMenuState.bagCallback ?? 'NULL'}`); BagDestroyPocketScrollArrowPair(runtime); DestroyBagMenuResources(runtime); destroyTask(runtime, taskId); } }
export function InitPokedudeBag(a0: number, runtime = requireRuntime()): void { BackUpPlayerBag(runtime); addBagItem(runtime, ITEM_POTION, 1); addBagItem(runtime, ITEM_ANTIDOTE, 1); addBagItem(runtime, ITEM_TEACHY_TV, 1); addBagItem(runtime, ITEM_TM_CASE, 1); addBagItem(runtime, ITEM_POKE_BALL, 5); addBagItem(runtime, ITEM_GREAT_BALL, 1); addBagItem(runtime, ITEM_NEST_BALL, 1); const cb2 = a0 === 7 || a0 === 8 ? 'SetCB2ToReshowScreenAfterMenu2' : 'CB2_ReturnToTeachyTV'; const location = a0 === 7 ? ITEMMENULOCATION_TTVSCR_STATUS : a0 === 8 ? ITEMMENULOCATION_TTVSCR_CATCHING : a0; GoToBagMenu(location, OPEN_BAG_ITEMS, cb2, runtime); }
export function Task_BButtonInterruptTeachyTv(taskId: number, runtime = requireRuntime()): boolean { if (runtime.input.b) { RestorePlayerBag(runtime); op(runtime, 'SetTeachyTvControllerModeToResume'); display(runtime).exitCB = 'CB2_ReturnToTeachyTV'; setTaskFunc(runtime, taskId, 'Task_Pokedude_FadeFromBag'); return true; } return false; }
export function Task_Bag_TeachyTvRegister(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); if (!runtime.gPaletteFade.active && !Task_BButtonInterruptTeachyTv(taskId, runtime)) { if (t.data[8] === 102) SwitchPockets(taskId, 1, false, runtime); else if (t.data[8] === 204) { runtime.gSpecialVar_ItemId = ITEM_TEACHY_TV; OpenContextMenu(taskId, runtime); } else if (t.data[8] === 408) runtime.gSaveBlock1Ptr.registeredItem = runtime.gSpecialVar_ItemId; else if (t.data[8] === 714) { destroyListMenuTask(runtime, t.data[0]); RestorePlayerBag(runtime); Bag_BeginCloseWin0Animation(runtime); setTaskFunc(runtime, taskId, 'Task_Pokedude_FadeFromBag'); return; } t.data[8] += 1; } }
export function Task_Bag_TeachyTvCatching(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); if (!runtime.gPaletteFade.active) { if (Task_BButtonInterruptTeachyTv(taskId, runtime)) return; if (t.data[8] === 102 || t.data[8] === 204) SwitchPockets(taskId, 1, false, runtime); else if (t.data[8] === 714) { runtime.gSpecialVar_ItemId = ITEM_POKE_BALL; OpenContextMenu(taskId, runtime); } else if (t.data[8] === 816) { destroyListMenuTask(runtime, t.data[0]); RestorePlayerBag(runtime); Bag_BeginCloseWin0Animation(runtime); setTaskFunc(runtime, taskId, 'Task_Pokedude_FadeFromBag'); return; } t.data[8] += 1; } }
export function Task_Bag_TeachyTvStatus(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); if (!runtime.gPaletteFade.active) { if (Task_BButtonInterruptTeachyTv(taskId, runtime)) return; if (t.data[8] === 204) { runtime.gSpecialVar_ItemId = ITEM_ANTIDOTE; OpenContextMenu(taskId, runtime); } else if (t.data[8] === 306) { RestorePlayerBag(runtime); ItemMenu_SetExitCallback('Pokedude_ChooseMonForInBattleItem', runtime); setTaskFunc(runtime, taskId, 'Task_Pokedude_FadeFromBag'); return; } t.data[8] += 1; } }
export function Task_Bag_TeachyTvTMs(taskId: number, runtime = requireRuntime()): void { const t = task(runtime, taskId); if (!runtime.gPaletteFade.active && !Task_BButtonInterruptTeachyTv(taskId, runtime)) { if (t.data[8] === 102) SwitchPockets(taskId, 1, false, runtime); else if (t.data[8] === 306) { runtime.gSpecialVar_ItemId = ITEM_TM_CASE; OpenContextMenu(taskId, runtime); } else if (t.data[8] === 408) { RestorePlayerBag(runtime); display(runtime).exitCB = 'Pokedude_InitTMCase'; setTaskFunc(runtime, taskId, 'Task_Pokedude_FadeFromBag'); return; } t.data[8] += 1; } }

export function IsWritingMailAllowed(itemId: number, runtime = requireRuntime()): boolean { return !getDefinition(runtime, itemId).mail; }

export const taskHandlers = {
  Task_WaitFadeOutOfBagMenu,
  Task_ItemMenu_WaitFadeAndSwitchToExitCallback,
  Task_AnimateWin0v,
  ItemMenu_StartFadeToExitCallback,
  Task_BagMenu_HandleInput,
  Task_ItemContextMenuByLocation,
  Task_RedrawArrowsAndReturnToBagMenuSelect,
  Task_AnimateSwitchPockets,
  Task_MoveItemInPocket_HandleInput,
  Task_ItemContext_FieldOrBattle,
  Task_FieldItemContextMenuHandleInput,
  Task_ItemMenuAction_Use,
  Task_ItemMenuAction_Toss,
  Task_ConfirmTossItems,
  Task_TossItem_No,
  Task_SelectQuantityToToss,
  Task_TossItem_Yes,
  Task_WaitAB_RedrawAndReturnToBag,
  Task_ItemMenuAction_ToggleSelect,
  Task_ItemMenuAction_Give,
  Task_PrintThereIsNoPokemon,
  Task_PrintItemCantBeHeld,
  Task_WaitAButtonAndCloseContextMenu,
  Task_ReturnToBagFromContextMenu,
  Task_UnusedReturnToBag,
  Task_ItemMenuAction_Cancel,
  Task_ItemMenuAction_BattleUse,
  Task_ItemContext_FieldGive,
  Task_ItemContext_PcBoxGive,
  Task_ItemContext_Sell,
  Task_PrintSaleConfirmationText,
  Task_ShowSellYesNoMenu,
  Task_SellItem_No,
  Task_InitSaleQuantitySelectInterface,
  Task_SelectQuantityToSell,
  Task_SellItem_Yes,
  Task_FinalizeSaleToShop,
  Task_WaitPressAB_AfterSell,
  Task_ItemContext_Deposit,
  Task_SelectQuantityToDeposit,
  Task_TryDoItemDeposit,
  Task_Bag_OldManTutorial,
  Task_Pokedude_FadeFromBag,
  Task_Pokedude_WaitFadeAndExitBag,
  Task_Bag_TeachyTvRegister,
  Task_Bag_TeachyTvCatching,
  Task_Bag_TeachyTvStatus,
  Task_Bag_TeachyTvTMs
};
