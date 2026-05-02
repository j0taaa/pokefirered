export const BERRYPOUCH_FROMFIELD = 0;
export const BERRYPOUCH_FROMPARTY = 1;
export const BERRYPOUCH_FROMMART = 2;
export const BERRYPOUCH_FROMPOKEMONPC = 3;
export const BERRYPOUCH_FROMBATTLE = 4;
export const BERRYPOUCH_FROMBERRYCRUSH = 5;
export const BERRYPOUCH_NA = 0xff;

export const BP_ACTION_USE = 0;
export const BP_ACTION_TOSS = 1;
export const BP_ACTION_GIVE = 2;
export const BP_ACTION_EXIT = 3;
export const BP_ACTION_DUMMY = 4;

export const ITEM_NONE = 0;
export const ITEMS_COUNT = 0xffff;
export const FIRST_BERRY_INDEX = 133;
export const NUM_BERRIES = 43;
export const POCKET_BERRY_POUCH = 4;
export const LIST_CANCEL = -2;
export const LIST_NOTHING_CHOSEN = -1;
export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const SELECT_BUTTON = 1 << 2;
export const DPAD_UP = 1 << 3;
export const DPAD_DOWN = 1 << 4;
export const DPAD_LEFT = 1 << 5;
export const DPAD_RIGHT = 1 << 6;

export interface BerryPouchWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface BerryPouchBgTemplate {
  bg: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  screenSize: number;
  paletteMode: number;
  priority: number;
  baseTile: number;
}

export interface BerryPouchItemSlot {
  itemId: number;
  quantity: number;
}

export interface BerryPouchTask {
  id: number;
  func: BerryPouchTaskFunc;
  data: number[];
  destroyed: boolean;
}

export type BerryPouchTaskFunc =
  | 'Task_BerryPouchMain'
  | 'Task_NormalContextMenu'
  | 'Task_NormalContextMenu_HandleInput'
  | 'Task_BerryPouchFadeToExitCallback'
  | 'Task_AbortBerryPouchLoading_WaitFade'
  | 'Task_Toss_SelectMultiple'
  | 'Task_WaitButtonThenTossBerries'
  | 'Task_WaitButtonBeforeDialogueWindowDestruction'
  | 'Task_BerryPouch_DestroyDialogueWindowAndRefreshListMenu'
  | 'Task_ContextMenu_FromPartyGiveMenu'
  | 'Task_ContextMenu_Sell'
  | 'Task_ContextMenu_FromPokemonPC'
  | 'Task_Sell_PrintSelectMultipleUI'
  | 'Task_Sell_SelectMultiple'
  | 'Task_SellMultiple_CreateYesNoMenu'
  | 'Task_SellBerries_PlaySfxAndRemoveBerries'
  | 'Task_SellBerries_WaitButton'
  | 'BerryPouch_StartFadeToExitCallback'
  | 'FieldUseFunc_OakStopsYou'
  | 'Task_NoOp';

export type BerryPouchCallback =
  | 'CB2_InitBerryPouch'
  | 'CB2_BerryPouchIdle'
  | 'VBlankCB_BerryPouchIdle'
  | 'CB2_ChooseMonToGiveItem'
  | 'CB2_GiveHoldItem'
  | 'CB2_ReturnToPokeStorage'
  | string
  | null;

export interface BerryPouchResources {
  exitCallback: BerryPouchCallback;
  indicatorOffset: number;
  indicatorTaskId: number;
  listMenuNumItems: number;
  listMenuMaxShowed: number;
  itemMenuIconId: number;
  bg1TilemapBuffer: number[];
  data: number[];
}

export interface BerryPouchStaticContext {
  savedCallback: BerryPouchCallback;
  type: number;
  allowSelect: number;
  unused_06: number;
  listMenuSelectedRow: number;
  listMenuScrollOffset: number;
}

export interface BerryPouchListMenuItem {
  label: string;
  index: number;
}

export interface BerryPouchListMenuTemplate {
  items: BerryPouchListMenuItem[];
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
  moveCursorFunc: 'BerryPouchMoveCursorFunc';
  itemPrintFunc: 'BerryPouchItemPrintFunc';
  cursorKind: number;
  scrollMultiple: number;
}

export interface BerryPouchSprite {
  id: number;
  x: number;
  y: number;
  affineAnim: number;
  affineAnimEnded: boolean;
  callback: 'SpriteCallbackDummy' | 'SpriteCB_BerryPouchWaitWobbleAnim';
}

export interface BerryPouchRuntime {
  allocResourcesSucceeds: boolean;
  allocListItemsSucceeds: boolean;
  allocListStrbufSucceeds: boolean;
  sResources: BerryPouchResources | null;
  sStaticCnt: BerryPouchStaticContext;
  sListMenuItems: BerryPouchListMenuItem[] | null;
  sListMenuStrbuf: string[] | null;
  sContextMenuOptions: number[] | null;
  sContextMenuNumOptions: number;
  sVariableWindowIds: number[];
  sBerryPouchSpriteId: number;
  gMainState: number;
  gPaletteFadeActive: boolean;
  gSpecialVar_ItemId: number;
  gTextFlagsAutoScroll: boolean;
  mainCallback: BerryPouchCallback;
  vblankCallback: BerryPouchCallback;
  savedCallbackFallback: BerryPouchCallback;
  playerGender: 'MALE' | 'FEMALE';
  linkActive: boolean;
  overworldLinkBusy: boolean;
  unionRoom: boolean;
  partyCount: number;
  money: number;
  bagPocket: BerryPouchItemSlot[];
  itemNames: Map<number, string>;
  itemDescriptions: Map<number, string>;
  itemPrices: Map<number, number>;
  itemHoldingAllowed: Set<number>;
  itemTypes: Map<number, string>;
  itemFieldFuncs: Map<number, BerryPouchTaskFunc>;
  itemBattleFuncs: Map<number, BerryPouchTaskFunc | null>;
  listMenuTemplate: BerryPouchListMenuTemplate | null;
  listMenuSelections: number[];
  menuInputs: number[];
  pressedButtons: number;
  nextWindowId: number;
  nextTaskId: number;
  nextListTaskId: number;
  nextIndicatorTaskId: number;
  nextSpriteId: number;
  tasks: BerryPouchTask[];
  sprites: BerryPouchSprite[];
  operations: string[];
  messages: Array<{ taskId: number; fontId: number; text: string; followUpFunc: BerryPouchTaskFunc }>;
  textPrints: Array<{ windowId: number; fontId: number; text: string; x: number; y: number; colorIdx: number }>;
}

export const sBgTemplates: readonly BerryPouchBgTemplate[] = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0x000 },
  { bg: 1, charBaseIndex: 3, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0x000 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0x000 }
];

export const sBerryPouchContextMenuTasks: readonly BerryPouchTaskFunc[] = [
  'Task_NormalContextMenu',
  'Task_ContextMenu_FromPartyGiveMenu',
  'Task_ContextMenu_Sell',
  'Task_ContextMenu_FromPokemonPC',
  'Task_NormalContextMenu'
];

export const sOptions_UseGiveTossExit = [BP_ACTION_USE, BP_ACTION_GIVE, BP_ACTION_TOSS, BP_ACTION_EXIT] as const;
export const sOptions_GiveExit = [BP_ACTION_GIVE, BP_ACTION_EXIT, BP_ACTION_DUMMY, BP_ACTION_DUMMY] as const;
export const sOptions_Exit = [BP_ACTION_EXIT, BP_ACTION_DUMMY, BP_ACTION_DUMMY, BP_ACTION_DUMMY] as const;
export const sOptions_UseToss_Exit = [BP_ACTION_USE, BP_ACTION_TOSS, BP_ACTION_EXIT, BP_ACTION_DUMMY] as const;
export const sTextColors = [[0, 1, 2], [0, 2, 3], [0, 3, 2]] as const;

export const sWindowTemplates_Main: readonly BerryPouchWindowTemplate[] = [
  { bg: 0, tilemapLeft: 11, tilemapTop: 1, width: 18, height: 14, paletteNum: 15, baseBlock: 0x027 },
  { bg: 0, tilemapLeft: 5, tilemapTop: 16, width: 25, height: 4, paletteNum: 15, baseBlock: 0x123 },
  { bg: 2, tilemapLeft: 1, tilemapTop: 1, width: 9, height: 2, paletteNum: 15, baseBlock: 0x187 }
];

export const sWindowTemplates_Variable: readonly BerryPouchWindowTemplate[] = [
  { bg: 2, tilemapLeft: 24, tilemapTop: 15, width: 5, height: 4, paletteNum: 15, baseBlock: 0x1d1 },
  { bg: 2, tilemapLeft: 17, tilemapTop: 9, width: 12, height: 4, paletteNum: 15, baseBlock: 0x1d1 },
  { bg: 2, tilemapLeft: 1, tilemapTop: 1, width: 8, height: 3, paletteNum: 12, baseBlock: 0x201 },
  { bg: 2, tilemapLeft: 23, tilemapTop: 15, width: 6, height: 4, paletteNum: 15, baseBlock: 0x219 },
  { bg: 2, tilemapLeft: 21, tilemapTop: 9, width: 6, height: 4, paletteNum: 15, baseBlock: 0x219 },
  { bg: 2, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 15, baseBlock: 0x231 },
  { bg: 2, tilemapLeft: 6, tilemapTop: 15, width: 14, height: 4, paletteNum: 12, baseBlock: 0x231 },
  { bg: 2, tilemapLeft: 6, tilemapTop: 15, width: 15, height: 4, paletteNum: 12, baseBlock: 0x269 },
  { bg: 2, tilemapLeft: 6, tilemapTop: 15, width: 16, height: 4, paletteNum: 12, baseBlock: 0x2a5 },
  { bg: 2, tilemapLeft: 6, tilemapTop: 15, width: 23, height: 4, paletteNum: 12, baseBlock: 0x2e5 },
  { bg: 2, tilemapLeft: 22, tilemapTop: 17, width: 7, height: 2, paletteNum: 15, baseBlock: 0x199 },
  { bg: 2, tilemapLeft: 22, tilemapTop: 15, width: 7, height: 4, paletteNum: 15, baseBlock: 0x199 },
  { bg: 2, tilemapLeft: 22, tilemapTop: 13, width: 7, height: 6, paletteNum: 15, baseBlock: 0x199 },
  { bg: 2, tilemapLeft: 22, tilemapTop: 11, width: 7, height: 8, paletteNum: 15, baseBlock: 0x199 }
];

const makeResources = (): BerryPouchResources => ({
  exitCallback: null,
  indicatorOffset: 0,
  indicatorTaskId: 0xff,
  listMenuNumItems: 0,
  listMenuMaxShowed: 0,
  itemMenuIconId: 0,
  bg1TilemapBuffer: Array.from({ length: 0x800 }, () => 0),
  data: [0, 0, 0, 0]
});

export const createBerryPouchRuntime = (overrides: Partial<BerryPouchRuntime> = {}): BerryPouchRuntime => {
  const runtime: BerryPouchRuntime = {
    allocResourcesSucceeds: true,
    allocListItemsSucceeds: true,
    allocListStrbufSucceeds: true,
    sResources: null,
    sStaticCnt: { savedCallback: null, type: BERRYPOUCH_FROMFIELD, allowSelect: 0, unused_06: 0, listMenuSelectedRow: 0, listMenuScrollOffset: 0 },
    sListMenuItems: null,
    sListMenuStrbuf: null,
    sContextMenuOptions: null,
    sContextMenuNumOptions: 0,
    sVariableWindowIds: Array.from({ length: 14 }, () => 0xff),
    sBerryPouchSpriteId: 0,
    gMainState: 0,
    gPaletteFadeActive: false,
    gSpecialVar_ItemId: ITEM_NONE,
    gTextFlagsAutoScroll: true,
    mainCallback: null,
    vblankCallback: null,
    savedCallbackFallback: null,
    playerGender: 'MALE',
    linkActive: false,
    overworldLinkBusy: false,
    unionRoom: false,
    partyCount: 1,
    money: 0,
    bagPocket: [],
    itemNames: new Map(),
    itemDescriptions: new Map(),
    itemPrices: new Map(),
    itemHoldingAllowed: new Set(),
    itemTypes: new Map(),
    itemFieldFuncs: new Map(),
    itemBattleFuncs: new Map(),
    listMenuTemplate: null,
    listMenuSelections: [],
    menuInputs: [],
    pressedButtons: 0,
    nextWindowId: 3,
    nextTaskId: 0,
    nextListTaskId: 0,
    nextIndicatorTaskId: 0,
    nextSpriteId: 0,
    tasks: [],
    sprites: [],
    operations: [],
    messages: [],
    textPrints: []
  };
  return Object.assign(runtime, overrides);
};

const resources = (runtime: BerryPouchRuntime): BerryPouchResources => {
  if (runtime.sResources === null) {
    throw new Error('sResources is NULL');
  }
  return runtime.sResources;
};

const task = (runtime: BerryPouchRuntime, taskId: number): BerryPouchTask => {
  const found = runtime.tasks.find((entry) => entry.id === taskId && !entry.destroyed);
  if (found === undefined) {
    throw new Error(`Task ${taskId} does not exist`);
  }
  return found;
};

const createTask = (runtime: BerryPouchRuntime, func: BerryPouchTaskFunc): number => {
  const id = runtime.nextTaskId++;
  runtime.tasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.operations.push(`CreateTask(${func})`);
  return id;
};

const destroyTask = (runtime: BerryPouchRuntime, taskId: number): void => {
  task(runtime, taskId).destroyed = true;
  runtime.operations.push(`DestroyTask(${taskId})`);
};

const consumeButton = (runtime: BerryPouchRuntime, button: number): boolean => {
  if ((runtime.pressedButtons & button) === 0) {
    return false;
  }
  runtime.pressedButtons &= ~button;
  return true;
};

const compactBagPocket = (runtime: BerryPouchRuntime): void => {
  const filled = runtime.bagPocket
    .filter((slot) => slot.itemId !== ITEM_NONE && slot.quantity > 0)
    .sort((left, right) => left.itemId - right.itemId);
  runtime.bagPocket.splice(0, runtime.bagPocket.length, ...filled);
};

const itemName = (runtime: BerryPouchRuntime, itemId: number): string => runtime.itemNames.get(itemId) ?? `ITEM${itemId}`;
const itemDescription = (runtime: BerryPouchRuntime, itemId: number): string => runtime.itemDescriptions.get(itemId) ?? `Description(${itemId})`;
const itemPrice = (runtime: BerryPouchRuntime, itemId: number): number => runtime.itemPrices.get(itemId) ?? 0;
const isHoldingAllowed = (runtime: BerryPouchRuntime, itemId: number): boolean => runtime.itemHoldingAllowed.has(itemId);
const bagGetItemIdByPocketPosition = (runtime: BerryPouchRuntime, position: number): number => runtime.bagPocket[position]?.itemId ?? ITEM_NONE;
const bagGetQuantityByPocketPosition = (runtime: BerryPouchRuntime, position: number): number => runtime.bagPocket[position]?.quantity ?? 0;

export const InitBerryPouch = (
  runtime: BerryPouchRuntime,
  type: number,
  savedCallback: BerryPouchCallback,
  allowSelect: number
): void => {
  if (!runtime.allocResourcesSucceeds) {
    runtime.mainCallback = savedCallback;
    return;
  }
  runtime.sResources = makeResources();
  if (type !== BERRYPOUCH_NA) {
    runtime.sStaticCnt.type = type;
  }
  if (allowSelect !== 0xff) {
    runtime.sStaticCnt.allowSelect = allowSelect;
  }
  if (savedCallback !== null) {
    runtime.sStaticCnt.savedCallback = savedCallback;
  }
  runtime.gTextFlagsAutoScroll = false;
  runtime.gSpecialVar_ItemId = ITEM_NONE;
  runtime.mainCallback = 'CB2_InitBerryPouch';
};

export const CB2_InitBerryPouch = (runtime: BerryPouchRuntime): void => {
  while (true) {
    if (runtime.overworldLinkBusy) {
      break;
    }
    if (RunBerryPouchInit(runtime)) {
      break;
    }
    if (runtime.linkActive) {
      break;
    }
  }
};

export const RunBerryPouchInit = (runtime: BerryPouchRuntime): boolean => {
  const res = resources(runtime);
  switch (runtime.gMainState) {
    case 0:
      runtime.operations.push('SetVBlankHBlankCallbacksToNull', 'ClearScheduledBgCopiesToVram');
      runtime.gMainState++;
      break;
    case 1:
      runtime.operations.push('ScanlineEffect_Stop');
      runtime.gMainState++;
      break;
    case 2:
      runtime.operations.push('FreeAllSpritePalettes');
      runtime.gMainState++;
      break;
    case 3:
      runtime.operations.push('ResetPaletteFade');
      runtime.gMainState++;
      break;
    case 4:
      runtime.operations.push('ResetSpriteData');
      runtime.gMainState++;
      break;
    case 5:
      runtime.operations.push('ResetItemMenuIconState');
      runtime.gMainState++;
      break;
    case 6:
      if (!runtime.linkActive) {
        runtime.tasks = [];
        runtime.operations.push('ResetTasks');
      }
      runtime.gMainState++;
      break;
    case 7:
      BerryPouchInitBgs(runtime);
      res.data[0] = 0;
      runtime.gMainState++;
      break;
    case 8:
      if (BerryPouchLoadGfx(runtime)) {
        runtime.gMainState++;
      }
      break;
    case 9:
      BerryPouchInitWindows(runtime);
      runtime.gMainState++;
      break;
    case 10:
      SortAndCountBerries(runtime);
      SanitizeListMenuSelectionParams(runtime);
      UpdateListMenuScrollOffset(runtime);
      runtime.gMainState++;
      break;
    case 11:
      if (!AllocateListMenuBuffers(runtime)) {
        AbortBerryPouchLoading(runtime);
        return true;
      }
      runtime.gMainState++;
      break;
    case 12:
      SetUpListMenuTemplate(runtime);
      runtime.gMainState++;
      break;
    case 13:
      PrintBerryPouchHeaderCentered(runtime);
      runtime.gMainState++;
      break;
    case 14: {
      const taskId = createTask(runtime, 'Task_BerryPouchMain');
      const entry = task(runtime, taskId);
      entry.data[0] = ListMenuInit(runtime);
      entry.data[8] = 0;
      runtime.gMainState++;
      break;
    }
    case 15:
      CreateBerryPouchSprite(runtime);
      runtime.gMainState++;
      break;
    case 16:
      CreateScrollIndicatorArrows_BerryPouchList(runtime);
      runtime.gMainState++;
      break;
    case 17:
      runtime.operations.push('BlendPalettes(PALETTES_ALL,16,RGB_BLACK)');
      runtime.gMainState++;
      break;
    case 18:
      runtime.operations.push('BeginNormalPaletteFade(PALETTES_ALL,-2,16,0,RGB_BLACK)');
      runtime.gMainState++;
      break;
    default:
      runtime.vblankCallback = 'VBlankCB_BerryPouchIdle';
      runtime.mainCallback = 'CB2_BerryPouchIdle';
      return true;
  }
  return false;
};

export const AbortBerryPouchLoading = (runtime: BerryPouchRuntime): void => {
  runtime.operations.push('BeginNormalPaletteFade(PALETTES_ALL,-2,0,16,RGB_BLACK)');
  createTask(runtime, 'Task_AbortBerryPouchLoading_WaitFade');
  runtime.vblankCallback = 'VBlankCB_BerryPouchIdle';
  runtime.mainCallback = 'CB2_BerryPouchIdle';
};

export const CB2_BerryPouchIdle = (runtime: BerryPouchRuntime): void => {
  for (const entry of runtime.tasks) {
    if (!entry.destroyed) {
      dispatchBerryPouchTask(runtime, entry.id);
    }
  }
  runtime.operations.push(
    'AnimateSprites',
    'BuildOamBuffer',
    'DoScheduledBgTilemapCopiesToVram',
    'UpdatePaletteFade'
  );
};

export const VBlankCB_BerryPouchIdle = (runtime: BerryPouchRuntime): void => {
  runtime.operations.push('LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer');
};

export const Task_AbortBerryPouchLoading_WaitFade = (runtime: BerryPouchRuntime, taskId: number): void => {
  if (!runtime.gPaletteFadeActive) {
    runtime.mainCallback = runtime.sStaticCnt.savedCallback;
    BerryPouch_DestroyResources(runtime);
    destroyTask(runtime, taskId);
  }
};

export const BerryPouchInitBgs = (runtime: BerryPouchRuntime): void => {
  const res = resources(runtime);
  res.bg1TilemapBuffer.fill(0);
  runtime.operations.push(
    'ResetAllBgsCoordinatesAndBgCntRegs',
    'ResetBgsAndClearDma3BusyFlags(FALSE)',
    `InitBgsFromTemplates(${sBgTemplates.length})`,
    'SetBgTilemapBuffer(1)',
    'ScheduleBgCopyTilemapToVram(1)',
    'SetGpuReg(REG_OFFSET_BLDCNT,0)',
    'SetGpuReg(REG_OFFSET_DISPCNT,DISPCNT_MODE_0|DISPCNT_OBJ_1D_MAP|DISPCNT_OBJ_ON)',
    'ShowBg(0)',
    'ShowBg(1)',
    'ShowBg(2)'
  );
};

export const BerryPouchLoadGfx = (runtime: BerryPouchRuntime): boolean => {
  const res = resources(runtime);
  switch (res.data[0]) {
    case 0:
      runtime.operations.push('ResetTempTileDataBuffers', 'DecompressAndCopyTileDataToVram(1,gBerryPouchBgGfx,0,0,0)');
      res.data[0]++;
      break;
    case 1:
      runtime.operations.push('FreeTempTileDataBuffersIfPossible', 'LZDecompressWram(gBerryPouchBg1Tilemap,bg1TilemapBuffer)');
      res.data[0]++;
      break;
    case 2:
      runtime.operations.push('LoadCompressedPalette(gBerryPouchBgPals)');
      if (runtime.playerGender !== 'MALE') {
        runtime.operations.push('LoadCompressedPalette(gBerryPouchBgPal0FemaleOverride)');
      }
      res.data[0]++;
      break;
    case 3:
      runtime.operations.push('LoadCompressedSpriteSheet(sBerryPouchSpriteSheet)');
      res.data[0]++;
      break;
    default:
      runtime.operations.push('LoadCompressedSpritePalette(sBerryPouchSpritePal)');
      res.data[0] = 0;
      return true;
  }
  return false;
};

export const AllocateListMenuBuffers = (runtime: BerryPouchRuntime): boolean => {
  if (!runtime.allocListItemsSucceeds) {
    return false;
  }
  runtime.sListMenuItems = Array.from({ length: NUM_BERRIES }, () => ({ label: '', index: 0 }));
  if (!runtime.allocListStrbufSucceeds) {
    return false;
  }
  runtime.sListMenuStrbuf = Array.from({ length: resources(runtime).listMenuNumItems }, () => '');
  return true;
};

export const SetUpListMenuTemplate = (runtime: BerryPouchRuntime): void => {
  const res = resources(runtime);
  const items: BerryPouchListMenuItem[] = [];
  const strbuf: string[] = [];
  for (let i = 0; i < res.listMenuNumItems; i++) {
    const label = GetBerryNameAndIndexForMenu(runtime, runtime.bagPocket[i]?.itemId ?? ITEM_NONE);
    strbuf[i] = label;
    items[i] = { label, index: i };
  }
  items[res.listMenuNumItems] = { label: 'Close', index: res.listMenuNumItems };
  runtime.sListMenuItems = items;
  runtime.sListMenuStrbuf = strbuf;
  runtime.listMenuTemplate = {
    items,
    totalItems: runtime.sStaticCnt.type !== BERRYPOUCH_FROMBERRYCRUSH ? res.listMenuNumItems + 1 : res.listMenuNumItems,
    windowId: 0,
    header_X: 0,
    item_X: 9,
    cursor_X: 1,
    lettersSpacing: 0,
    itemVerticalPadding: 2,
    upText_Y: 2,
    maxShowed: res.listMenuMaxShowed,
    fontId: 1,
    cursorPal: 2,
    fillValue: 0,
    cursorShadowPal: 3,
    moveCursorFunc: 'BerryPouchMoveCursorFunc',
    itemPrintFunc: 'BerryPouchItemPrintFunc',
    cursorKind: 0,
    scrollMultiple: 0
  };
};

export const GetBerryNameAndIndexForMenu = (runtime: BerryPouchRuntime, itemId: number): string => {
  const index = Math.max(0, itemId - FIRST_BERRY_INDEX + 1).toString().padStart(2, '0');
  return `{FONT_SMALL}{NO_CLEAR}${index} {FONT_NORMAL}${itemName(runtime, itemId)}`;
};

export const CopySelectedListMenuItemName = (runtime: BerryPouchRuntime, itemIdx: number): string => runtime.sListMenuStrbuf?.[itemIdx] ?? '';

export const BerryPouchMoveCursorFunc = (runtime: BerryPouchRuntime, itemIndex: number, onInit: boolean): void => {
  const res = resources(runtime);
  if (onInit !== true) {
    runtime.operations.push('PlaySE(SE_BAG_CURSOR)');
    StartBerryPouchSpriteWobbleAnim(runtime);
  }
  runtime.operations.push(`DestroyItemMenuIcon(${res.itemMenuIconId ^ 1})`);
  if (res.listMenuNumItems !== itemIndex) {
    runtime.operations.push(`CreateBerryPouchItemIcon(${bagGetItemIdByPocketPosition(runtime, itemIndex)},${res.itemMenuIconId})`);
  } else {
    runtime.operations.push(`CreateBerryPouchItemIcon(${ITEMS_COUNT},${res.itemMenuIconId})`);
  }
  res.itemMenuIconId ^= 1;
  PrintSelectedBerryDescription(runtime, itemIndex);
};

export const BerryPouchItemPrintFunc = (runtime: BerryPouchRuntime, windowId: number, itemId: number, y: number): void => {
  if (itemId !== LIST_CANCEL && resources(runtime).listMenuNumItems !== itemId) {
    const quantity = bagGetQuantityByPocketPosition(runtime, itemId);
    BerryPouchPrint(runtime, windowId, 0, `×${quantity.toString().padStart(3, ' ')}`, 110, y, 0, 0, 0xff, 1);
  }
};

export const BerryPouchSetArrowCursorFromListMenu = (runtime: BerryPouchRuntime, listTaskId: number, colorIdx: number): void => {
  BerryPouchSetArrowCursorAt(runtime, listTaskId, colorIdx);
};

export const BerryPouchSetArrowCursorAt = (runtime: BerryPouchRuntime, y: number, colorIdx: number): void => {
  runtime.operations.push(colorIdx === 0xff ? `ClearArrowCursorAt(${y})` : `PrintArrowCursorAt(${y},${colorIdx})`);
};

export const PrintSelectedBerryDescription = (runtime: BerryPouchRuntime, itemIdx: number): void => {
  const text = itemIdx !== resources(runtime).listMenuNumItems
    ? itemDescription(runtime, bagGetItemIdByPocketPosition(runtime, itemIdx))
    : 'The BERRY POUCH will be\nput away.';
  runtime.operations.push('FillWindowPixelBuffer(1,0)');
  BerryPouchPrint(runtime, 1, 1, text, 0, 2, 2, 0, 0, 0);
};

export const SetDescriptionWindowBorderPalette = (runtime: BerryPouchRuntime, pal: number): void => {
  runtime.operations.push(`SetBgTilemapPalette(1,0,16,30,4,${pal + 1})`, 'ScheduleBgCopyTilemapToVram(1)');
};

export const CreateScrollIndicatorArrows_BerryPouchList = (runtime: BerryPouchRuntime): void => {
  const res = resources(runtime);
  const max = runtime.sStaticCnt.type !== BERRYPOUCH_FROMBERRYCRUSH
    ? res.listMenuNumItems - res.listMenuMaxShowed + 1
    : res.listMenuNumItems - res.listMenuMaxShowed;
  res.indicatorTaskId = runtime.nextIndicatorTaskId++;
  runtime.operations.push(`AddScrollIndicatorArrowPairParameterized(2,160,8,120,${max},110,110,listMenuScrollOffset)`);
};

export const CreateScrollIndicatorArrows_TossQuantity = (runtime: BerryPouchRuntime): void => {
  const res = resources(runtime);
  res.indicatorOffset = 1;
  res.indicatorTaskId = runtime.nextIndicatorTaskId++;
  runtime.operations.push('AddScrollIndicatorArrowPairParameterized(2,212,120,152,2,110,110,indicatorOffset)');
};

export const CreateScrollIndicatorArrows_SellQuantity = (runtime: BerryPouchRuntime): void => {
  const res = resources(runtime);
  res.indicatorOffset = 1;
  res.indicatorTaskId = runtime.nextIndicatorTaskId++;
  runtime.operations.push('AddScrollIndicatorArrowPairParameterized(2,152,72,104,2,110,110,indicatorOffset)');
};

export const DestroyScrollIndicatorArrows = (runtime: BerryPouchRuntime): void => {
  const res = resources(runtime);
  if (res.indicatorTaskId !== 0xff) {
    runtime.operations.push(`RemoveScrollIndicatorArrowPair(${res.indicatorTaskId})`);
    res.indicatorTaskId = 0xff;
  }
};

export const PrintBerryPouchHeaderCentered = (runtime: BerryPouchRuntime): void => {
  BerryPouchPrint(runtime, 2, 2, 'BERRY POUCH', Math.floor((72 - 'BERRY POUCH'.length * 8) / 2), 1, 0, 0, 0, 0);
};

export const BerryPouch_CursorResetToTop = (runtime: BerryPouchRuntime): void => {
  runtime.sStaticCnt.listMenuSelectedRow = 0;
  runtime.sStaticCnt.listMenuScrollOffset = 0;
};

export const SanitizeListMenuSelectionParams = (runtime: BerryPouchRuntime): void => {
  const res = resources(runtime);
  const r2 = runtime.sStaticCnt.type !== BERRYPOUCH_FROMBERRYCRUSH ? res.listMenuNumItems + 1 : res.listMenuNumItems;
  if (runtime.sStaticCnt.listMenuScrollOffset !== 0 && runtime.sStaticCnt.listMenuScrollOffset + res.listMenuMaxShowed > r2) {
    runtime.sStaticCnt.listMenuScrollOffset = r2 - res.listMenuMaxShowed;
  }
  if (runtime.sStaticCnt.listMenuScrollOffset + runtime.sStaticCnt.listMenuSelectedRow >= r2) {
    runtime.sStaticCnt.listMenuSelectedRow = r2 === 0 || r2 === 1 ? 0 : r2 - 1;
  }
};

export const UpdateListMenuScrollOffset = (runtime: BerryPouchRuntime): void => {
  const res = resources(runtime);
  const lim = runtime.sStaticCnt.type !== BERRYPOUCH_FROMBERRYCRUSH ? res.listMenuNumItems + 1 : res.listMenuNumItems;
  if (runtime.sStaticCnt.listMenuSelectedRow > 4) {
    for (let i = 0; i <= runtime.sStaticCnt.listMenuSelectedRow - 4; runtime.sStaticCnt.listMenuSelectedRow--, runtime.sStaticCnt.listMenuScrollOffset++, i++) {
      if (runtime.sStaticCnt.listMenuScrollOffset + res.listMenuMaxShowed === lim) {
        break;
      }
    }
  }
};

export const BerryPouch_DestroyResources = (runtime: BerryPouchRuntime): void => {
  runtime.sResources = null;
  runtime.sListMenuItems = null;
  runtime.sListMenuStrbuf = null;
  runtime.operations.push('FreeAllWindowBuffers');
};

export const BerryPouch_StartFadeToExitCallback = (runtime: BerryPouchRuntime, taskId: number): void => {
  runtime.operations.push('BeginNormalPaletteFade(PALETTES_ALL,-2,0,16,RGB_BLACK)');
  task(runtime, taskId).func = 'Task_BerryPouchFadeToExitCallback';
};

export const Task_BerryPouchFadeToExitCallback = (runtime: BerryPouchRuntime, taskId: number): void => {
  if (!runtime.gPaletteFadeActive) {
    const entry = task(runtime, taskId);
    runtime.sStaticCnt.listMenuScrollOffset = entry.data[0] >= 0 ? runtime.sStaticCnt.listMenuScrollOffset : runtime.sStaticCnt.listMenuScrollOffset;
    runtime.operations.push(`DestroyListMenuTask(${entry.data[0]})`);
    runtime.mainCallback = resources(runtime).exitCallback ?? runtime.sStaticCnt.savedCallback;
    DestroyScrollIndicatorArrows(runtime);
    BerryPouch_DestroyResources(runtime);
    destroyTask(runtime, taskId);
  }
};

export const SortAndCountBerries = (runtime: BerryPouchRuntime): void => {
  const res = resources(runtime);
  compactBagPocket(runtime);
  res.listMenuNumItems = 0;
  for (let i = 0; i < runtime.bagPocket.length; i++) {
    if (runtime.bagPocket[i]?.itemId === ITEM_NONE) {
      break;
    }
    res.listMenuNumItems++;
  }
  const shown = runtime.sStaticCnt.type !== BERRYPOUCH_FROMBERRYCRUSH ? res.listMenuNumItems + 1 : res.listMenuNumItems;
  res.listMenuMaxShowed = shown > 7 ? 7 : shown;
};

export const BerryPouch_SetExitCallback = (runtime: BerryPouchRuntime, callback: BerryPouchCallback): void => {
  resources(runtime).exitCallback = callback;
};

export const InitTossQuantitySelectUI = (runtime: BerryPouchRuntime, taskId: number, text: string): void => {
  const entry = task(runtime, taskId);
  const windowId = GetOrCreateVariableWindow(runtime, 8);
  BerryPouchPrint(runtime, windowId, 1, text.replace('{STR_VAR_1}', CopySelectedListMenuItemName(runtime, entry.data[1])), 0, 2, 1, 2, 0, 1);
  const windowId2 = GetOrCreateVariableWindow(runtime, 0);
  BerryPouchPrint(runtime, windowId2, 0, '×001', 4, 10, 1, 0, 0, 1);
};

export const PrintxQuantityOnWindow = (runtime: BerryPouchRuntime, whichWindow: number, quantity: number, ndigits: number): void => {
  const windowId = GetVariableWindowId(runtime, whichWindow);
  runtime.operations.push(`FillWindowPixelBuffer(${windowId},1)`);
  BerryPouchPrint(runtime, windowId, 0, `×${quantity.toString().padStart(ndigits, '0')}`, 4, 10, 1, 0, 0, 1);
};

export const Task_BerryPouchMain = (runtime: BerryPouchRuntime, taskId: number): void => {
  if (runtime.gPaletteFadeActive || runtime.overworldLinkBusy) {
    return;
  }
  const entry = task(runtime, taskId);
  const menuInput = ListMenu_ProcessInput(runtime);
  ListMenuGetScrollAndRow(runtime);
  if (consumeButton(runtime, SELECT_BUTTON) && runtime.sStaticCnt.allowSelect === 1) {
    runtime.operations.push('PlaySE(SE_SELECT)');
    runtime.gSpecialVar_ItemId = 0;
    BerryPouch_StartFadeToExitCallback(runtime, taskId);
    return;
  }
  switch (menuInput) {
    case LIST_NOTHING_CHOSEN:
      return;
    case LIST_CANCEL:
      if (runtime.sStaticCnt.type !== BERRYPOUCH_FROMBERRYCRUSH) {
        runtime.operations.push('PlaySE(SE_SELECT)');
        runtime.gSpecialVar_ItemId = 0;
        BerryPouch_StartFadeToExitCallback(runtime, taskId);
      }
      break;
    default:
      runtime.operations.push('PlaySE(SE_SELECT)');
      if (runtime.sStaticCnt.type === BERRYPOUCH_FROMBERRYCRUSH) {
        runtime.gSpecialVar_ItemId = bagGetItemIdByPocketPosition(runtime, menuInput);
        BerryPouch_StartFadeToExitCallback(runtime, taskId);
      } else if (menuInput === resources(runtime).listMenuNumItems) {
        runtime.gSpecialVar_ItemId = 0;
        BerryPouch_StartFadeToExitCallback(runtime, taskId);
      } else {
        DestroyScrollIndicatorArrows(runtime);
        SetDescriptionWindowBorderPalette(runtime, 1);
        BerryPouchSetArrowCursorFromListMenu(runtime, entry.data[0], 2);
        entry.data[1] = menuInput;
        entry.data[2] = bagGetQuantityByPocketPosition(runtime, menuInput);
        runtime.gSpecialVar_ItemId = bagGetItemIdByPocketPosition(runtime, menuInput);
        entry.func = sBerryPouchContextMenuTasks[runtime.sStaticCnt.type] ?? 'Task_NormalContextMenu';
      }
      break;
  }
};

export const Task_CleanUpAndReturnToMain = (runtime: BerryPouchRuntime, taskId: number): void => {
  SetDescriptionWindowBorderPalette(runtime, 0);
  CreateScrollIndicatorArrows_BerryPouchList(runtime);
  task(runtime, taskId).func = 'Task_BerryPouchMain';
};

export const CreateNormalContextMenu = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  if (runtime.sStaticCnt.type === BERRYPOUCH_FROMBATTLE) {
    runtime.sContextMenuOptions = [...sOptions_UseToss_Exit];
    runtime.sContextMenuNumOptions = 3;
  } else if (runtime.linkActive || runtime.unionRoom) {
    if (!isHoldingAllowed(runtime, runtime.gSpecialVar_ItemId)) {
      runtime.sContextMenuOptions = [...sOptions_Exit];
      runtime.sContextMenuNumOptions = 1;
    } else {
      runtime.sContextMenuOptions = [...sOptions_GiveExit];
      runtime.sContextMenuNumOptions = 2;
    }
  } else {
    runtime.sContextMenuOptions = [...sOptions_UseGiveTossExit];
    runtime.sContextMenuNumOptions = 4;
  }
  GetOrCreateVariableWindow(runtime, runtime.sContextMenuNumOptions + 9);
  runtime.operations.push(`AddItemMenuActionTextPrinters(${runtime.sContextMenuNumOptions})`, 'Menu_InitCursor');
  const windowId2 = GetOrCreateVariableWindow(runtime, 6);
  BerryPouchPrint(runtime, windowId2, 1, `${CopySelectedListMenuItemName(runtime, entry.data[1])} is selected.`, 0, 2, 1, 2, 0, 1);
};

export const Task_NormalContextMenu = (runtime: BerryPouchRuntime, taskId: number): void => {
  CreateNormalContextMenu(runtime, taskId);
  task(runtime, taskId).func = 'Task_NormalContextMenu_HandleInput';
};

export const Task_NormalContextMenu_HandleInput = (runtime: BerryPouchRuntime, taskId: number): void => {
  if (runtime.overworldLinkBusy) {
    return;
  }
  const input = Menu_ProcessInputNoWrapAround(runtime);
  switch (input) {
    case LIST_CANCEL:
      break;
    case LIST_NOTHING_CHOSEN:
      runtime.operations.push('PlaySE(SE_SELECT)');
      Task_BerryPouch_Exit(runtime, taskId);
      break;
    default: {
      runtime.operations.push('PlaySE(SE_SELECT)');
      const action = runtime.sContextMenuOptions?.[input] ?? BP_ACTION_DUMMY;
      runContextAction(runtime, taskId, action);
      break;
    }
  }
};

const runContextAction = (runtime: BerryPouchRuntime, taskId: number, action: number): void => {
  if (action === BP_ACTION_USE) Task_BerryPouch_Use(runtime, taskId);
  else if (action === BP_ACTION_TOSS) Task_BerryPouch_Toss(runtime, taskId);
  else if (action === BP_ACTION_GIVE) Task_BerryPouch_Give(runtime, taskId);
  else if (action === BP_ACTION_EXIT) Task_BerryPouch_Exit(runtime, taskId);
};

export const Task_BerryPouch_Use = (runtime: BerryPouchRuntime, taskId: number): void => {
  DestroyVariableWindow(runtime, runtime.sContextMenuNumOptions + 9);
  DestroyVariableWindow(runtime, 6);
  runtime.operations.push('PutWindowTilemap(0)', 'PutWindowTilemap(1)', 'ScheduleBgCopyTilemapToVram(0)', 'ScheduleBgCopyTilemapToVram(2)');
  if (runtime.sStaticCnt.type === BERRYPOUCH_FROMBATTLE) {
    const battleFunc = runtime.itemBattleFuncs.get(runtime.gSpecialVar_ItemId) ?? null;
    task(runtime, taskId).func = battleFunc ?? 'Task_NoOp';
    if (battleFunc === null) {
      runtime.operations.push('FieldUseFunc_OakStopsYou');
    }
  } else if (runtime.partyCount === 0 && runtime.itemTypes.get(runtime.gSpecialVar_ItemId) === 'ITEM_TYPE_PARTY_MENU') {
    Task_Give_PrintThereIsNoPokemon(runtime, taskId);
  } else {
    task(runtime, taskId).func = runtime.itemFieldFuncs.get(runtime.gSpecialVar_ItemId) ?? 'Task_NoOp';
  }
};

export const Task_BerryPouch_Toss = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  runtime.operations.push(`ClearWindowTilemap(${GetVariableWindowId(runtime, runtime.sContextMenuNumOptions + 9)})`, `ClearWindowTilemap(${GetVariableWindowId(runtime, 6)})`);
  DestroyVariableWindow(runtime, runtime.sContextMenuNumOptions + 9);
  DestroyVariableWindow(runtime, 6);
  runtime.operations.push('PutWindowTilemap(0)');
  entry.data[8] = 1;
  if (entry.data[2] === 1) {
    Task_AskTossMultiple(runtime, taskId);
  } else {
    InitTossQuantitySelectUI(runtime, taskId, 'Toss out how many {STR_VAR_1}s?');
    CreateScrollIndicatorArrows_TossQuantity(runtime);
    entry.func = 'Task_Toss_SelectMultiple';
  }
};

export const Task_AskTossMultiple = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  BerryPouchPrint(runtime, GetOrCreateVariableWindow(runtime, 7), 1, `Throw away ${entry.data[8]} of this item?`, 0, 2, 1, 2, 0, 1);
  CreateYesNoMenuWin3(runtime, taskId, 'Task_TossYes,Task_TossNo');
};

export const CreateYesNoMenuWin3 = (runtime: BerryPouchRuntime, taskId: number, ptrs: string): void => {
  runtime.operations.push(`CreateYesNoMenuWithCallbacks(${taskId},sWindowTemplates_Variable[3],FONT_NORMAL,0,2,0x001,14,${ptrs})`);
};

export const Task_TossNo = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  DestroyVariableWindow(runtime, 7);
  runtime.operations.push('PutWindowTilemap(1)', 'PutWindowTilemap(0)', 'ScheduleBgCopyTilemapToVram(0)', 'ScheduleBgCopyTilemapToVram(2)');
  BerryPouchSetArrowCursorFromListMenu(runtime, entry.data[0], 1);
  Task_CleanUpAndReturnToMain(runtime, taskId);
};

export const Task_Toss_SelectMultiple = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  if (AdjustQuantityAccordingToDPadInput(runtime, entry.data, 8, entry.data[2])) {
    PrintxQuantityOnWindow(runtime, 0, entry.data[8], 3);
  } else if (consumeButton(runtime, A_BUTTON)) {
    runtime.operations.push('PlaySE(SE_SELECT)', `ClearWindowTilemap(${GetVariableWindowId(runtime, 8)})`);
    DestroyVariableWindow(runtime, 8);
    DestroyVariableWindow(runtime, 0);
    runtime.operations.push('ScheduleBgCopyTilemapToVram(0)', 'ScheduleBgCopyTilemapToVram(2)');
    DestroyScrollIndicatorArrows(runtime);
    Task_AskTossMultiple(runtime, taskId);
  } else if (consumeButton(runtime, B_BUTTON)) {
    runtime.operations.push('PlaySE(SE_SELECT)');
    DestroyVariableWindow(runtime, 8);
    DestroyVariableWindow(runtime, 0);
    runtime.operations.push('PutWindowTilemap(0)', 'PutWindowTilemap(1)', 'ScheduleBgCopyTilemapToVram(0)', 'ScheduleBgCopyTilemapToVram(2)');
    BerryPouchSetArrowCursorFromListMenu(runtime, entry.data[0], 1);
    DestroyScrollIndicatorArrows(runtime);
    Task_CleanUpAndReturnToMain(runtime, taskId);
  }
};

export const Task_TossYes = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  DestroyVariableWindow(runtime, 7);
  BerryPouchPrint(runtime, GetOrCreateVariableWindow(runtime, 9), 1, `Threw away ${entry.data[8]} ${CopySelectedListMenuItemName(runtime, entry.data[1])}s.`, 0, 2, 1, 2, 0, 1);
  entry.func = 'Task_WaitButtonThenTossBerries';
};

export const Task_WaitButtonThenTossBerries = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  if (consumeButton(runtime, A_BUTTON) || consumeButton(runtime, B_BUTTON)) {
    runtime.operations.push('PlaySE(SE_SELECT)');
    RemoveBagItem(runtime, runtime.gSpecialVar_ItemId, entry.data[8]);
    DestroyVariableWindow(runtime, 9);
    runtime.operations.push(`DestroyListMenuTask(${entry.data[0]})`);
    SortAndCountBerries(runtime);
    SanitizeListMenuSelectionParams(runtime);
    SetUpListMenuTemplate(runtime);
    entry.data[0] = ListMenuInit(runtime);
    runtime.operations.push('PutWindowTilemap(1)', 'ScheduleBgCopyTilemapToVram(0)');
    BerryPouchSetArrowCursorFromListMenu(runtime, entry.data[0], 1);
    Task_CleanUpAndReturnToMain(runtime, taskId);
  }
};

export const Task_BerryPouch_Give = (runtime: BerryPouchRuntime, taskId: number): void => {
  DestroyVariableWindow(runtime, runtime.sContextMenuNumOptions + 9);
  DestroyVariableWindow(runtime, 6);
  runtime.operations.push('PutWindowTilemap(0)', 'PutWindowTilemap(1)', 'ScheduleBgCopyTilemapToVram(0)', 'ScheduleBgCopyTilemapToVram(2)');
  if (runtime.partyCount === 0) {
    Task_Give_PrintThereIsNoPokemon(runtime, taskId);
  } else {
    resources(runtime).exitCallback = 'CB2_ChooseMonToGiveItem';
    task(runtime, taskId).func = 'BerryPouch_StartFadeToExitCallback';
  }
};

export const Task_Give_PrintThereIsNoPokemon = (runtime: BerryPouchRuntime, taskId: number): void => {
  DisplayItemMessageInBerryPouch(runtime, taskId, 1, 'There is no POKéMON.', 'Task_WaitButtonBeforeDialogueWindowDestruction');
};

export const Task_WaitButtonBeforeDialogueWindowDestruction = (runtime: BerryPouchRuntime, taskId: number): void => {
  if (consumeButton(runtime, A_BUTTON)) {
    runtime.operations.push('PlaySE(SE_SELECT)');
    Task_BerryPouch_DestroyDialogueWindowAndRefreshListMenu(runtime, taskId);
  }
};

export const Task_BerryPouch_DestroyDialogueWindowAndRefreshListMenu = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  TryDestroyVariableWindow(runtime, 5);
  runtime.operations.push(`DestroyListMenuTask(${entry.data[0]})`);
  SortAndCountBerries(runtime);
  SanitizeListMenuSelectionParams(runtime);
  SetUpListMenuTemplate(runtime);
  entry.data[0] = ListMenuInit(runtime);
  runtime.operations.push('ScheduleBgCopyTilemapToVram(0)');
  BerryPouchSetArrowCursorFromListMenu(runtime, entry.data[0], 1);
  Task_CleanUpAndReturnToMain(runtime, taskId);
};

export const Task_BerryPouch_Exit = (runtime: BerryPouchRuntime, taskId: number): void => {
  DestroyVariableWindow(runtime, runtime.sContextMenuNumOptions + 9);
  DestroyVariableWindow(runtime, 6);
  runtime.operations.push('PutWindowTilemap(0)', 'PutWindowTilemap(1)', 'ScheduleBgCopyTilemapToVram(0)', 'ScheduleBgCopyTilemapToVram(2)');
  BerryPouchSetArrowCursorFromListMenu(runtime, task(runtime, taskId).data[0], 1);
  Task_CleanUpAndReturnToMain(runtime, taskId);
};

export const Task_ContextMenu_FromPartyGiveMenu = (runtime: BerryPouchRuntime, taskId: number): void => {
  const itemId = bagGetItemIdByPocketPosition(runtime, task(runtime, taskId).data[1]);
  if (!isHoldingAllowed(runtime, itemId)) {
    DisplayItemMessageInBerryPouch(runtime, taskId, 1, `${itemName(runtime, itemId)} can't be held here.`, 'Task_WaitButtonBeforeDialogueWindowDestruction');
  } else {
    resources(runtime).exitCallback = 'CB2_GiveHoldItem';
    task(runtime, taskId).func = 'BerryPouch_StartFadeToExitCallback';
  }
};

export const Task_ContextMenu_FromPokemonPC = (runtime: BerryPouchRuntime, taskId: number): void => {
  resources(runtime).exitCallback = 'CB2_ReturnToPokeStorage';
  task(runtime, taskId).func = 'BerryPouch_StartFadeToExitCallback';
};

export const Task_ContextMenu_Sell = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  if (itemPrice(runtime, runtime.gSpecialVar_ItemId) === 0) {
    DisplayItemMessageInBerryPouch(runtime, taskId, 1, 'Oh, no. I can’t buy that.', 'Task_BerryPouch_DestroyDialogueWindowAndRefreshListMenu');
  } else {
    entry.data[8] = 1;
    if (entry.data[2] === 1) {
      PrintMoneyInWin2(runtime);
      Task_AskSellMultiple(runtime, taskId);
    } else {
      if (entry.data[2] > 99) {
        entry.data[2] = 99;
      }
      DisplayItemMessageInBerryPouch(runtime, taskId, 1, 'How many would you like to sell?', 'Task_Sell_PrintSelectMultipleUI');
    }
  }
};

export const Task_AskSellMultiple = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  const price = Math.trunc(itemPrice(runtime, bagGetItemIdByPocketPosition(runtime, entry.data[1])) / 2) * entry.data[8];
  DisplayItemMessageInBerryPouch(runtime, taskId, 1, `I can pay ¥${price}. Would that be okay?`, 'Task_SellMultiple_CreateYesNoMenu');
};

export const Task_SellMultiple_CreateYesNoMenu = (runtime: BerryPouchRuntime, taskId: number): void => {
  CreateYesNoMenuWin4(runtime, taskId, 'Task_SellYes,Task_SellNo');
};

export const CreateYesNoMenuWin4 = (runtime: BerryPouchRuntime, taskId: number, ptrs: string): void => {
  runtime.operations.push(`CreateYesNoMenuWithCallbacks(${taskId},sWindowTemplates_Variable[4],FONT_NORMAL,0,2,0x001,14,${ptrs})`);
};

export const Task_SellNo = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  DestroyVariableWindow(runtime, 2);
  TryDestroyVariableWindow(runtime, 5);
  runtime.operations.push('PutWindowTilemap(2)', 'PutWindowTilemap(0)', 'PutWindowTilemap(1)', 'ScheduleBgCopyTilemapToVram(0)');
  BerryPouchSetArrowCursorFromListMenu(runtime, entry.data[0], 1);
  Task_CleanUpAndReturnToMain(runtime, taskId);
};

export const Task_Sell_PrintSelectMultipleUI = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  const windowId = GetOrCreateVariableWindow(runtime, 1);
  BerryPouchPrint(runtime, windowId, 0, '×01', 4, 10, 1, 0, 0xff, 1);
  SellMultiple_UpdateSellPriceDisplay(runtime, Math.trunc(itemPrice(runtime, bagGetItemIdByPocketPosition(runtime, entry.data[1])) / 2) * entry.data[8]);
  PrintMoneyInWin2(runtime);
  CreateScrollIndicatorArrows_SellQuantity(runtime);
  entry.func = 'Task_Sell_SelectMultiple';
};

export const SellMultiple_UpdateSellPriceDisplay = (runtime: BerryPouchRuntime, price: number): void => {
  runtime.operations.push(`PrintMoneyAmount(${GetVariableWindowId(runtime, 1)},56,10,${price},0)`);
};

export const Task_Sell_SelectMultiple = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  if (AdjustQuantityAccordingToDPadInput(runtime, entry.data, 8, entry.data[2])) {
    PrintxQuantityOnWindow(runtime, 1, entry.data[8], 2);
    SellMultiple_UpdateSellPriceDisplay(runtime, Math.trunc(itemPrice(runtime, bagGetItemIdByPocketPosition(runtime, entry.data[1])) / 2) * entry.data[8]);
  } else if (consumeButton(runtime, A_BUTTON)) {
    runtime.operations.push('PlaySE(SE_SELECT)');
    DestroyVariableWindow(runtime, 1);
    runtime.operations.push('PutWindowTilemap(0)', 'ScheduleBgCopyTilemapToVram(0)');
    DestroyScrollIndicatorArrows(runtime);
    Task_AskSellMultiple(runtime, taskId);
  } else if (consumeButton(runtime, B_BUTTON)) {
    runtime.operations.push('PlaySE(SE_SELECT)');
    DestroyVariableWindow(runtime, 1);
    DestroyVariableWindow(runtime, 2);
    TryDestroyVariableWindow(runtime, 5);
    runtime.operations.push('PutWindowTilemap(2)', 'PutWindowTilemap(0)', 'PutWindowTilemap(1)', 'ScheduleBgCopyTilemapToVram(0)');
    DestroyScrollIndicatorArrows(runtime);
    BerryPouchSetArrowCursorFromListMenu(runtime, entry.data[0], 1);
    Task_CleanUpAndReturnToMain(runtime, taskId);
  }
};

export const Task_SellYes = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  const price = Math.trunc(itemPrice(runtime, bagGetItemIdByPocketPosition(runtime, entry.data[1])) / 2) * entry.data[8];
  runtime.operations.push('PutWindowTilemap(0)', 'ScheduleBgCopyTilemapToVram(0)');
  DisplayItemMessageInBerryPouch(runtime, taskId, 1, `Turned over items worth ¥${price}.`, 'Task_SellBerries_PlaySfxAndRemoveBerries');
};

export const Task_SellBerries_PlaySfxAndRemoveBerries = (runtime: BerryPouchRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  const price = Math.trunc(itemPrice(runtime, runtime.gSpecialVar_ItemId) / 2) * entry.data[8];
  runtime.operations.push('PlaySE(SE_SHOP)');
  RemoveBagItem(runtime, runtime.gSpecialVar_ItemId, entry.data[8]);
  runtime.money += price;
  runtime.operations.push(`RecordItemTransaction(${runtime.gSpecialVar_ItemId},${entry.data[8]},QL_EVENT_SOLD_ITEM-QL_EVENT_USED_POKEMART)`, `DestroyListMenuTask(${entry.data[0]})`);
  SortAndCountBerries(runtime);
  SanitizeListMenuSelectionParams(runtime);
  SetUpListMenuTemplate(runtime);
  entry.data[0] = ListMenuInit(runtime);
  BerryPouchSetArrowCursorFromListMenu(runtime, entry.data[0], 2);
  runtime.operations.push(`PrintMoneyAmountInMoneyBox(${GetVariableWindowId(runtime, 2)},${runtime.money},0)`);
  entry.func = 'Task_SellBerries_WaitButton';
};

export const Task_SellBerries_WaitButton = (runtime: BerryPouchRuntime, taskId: number): void => {
  if (consumeButton(runtime, A_BUTTON) || consumeButton(runtime, B_BUTTON)) {
    runtime.operations.push('PlaySE(SE_SELECT)');
    DestroyVariableWindow(runtime, 2);
    runtime.operations.push('PutWindowTilemap(2)');
    Task_BerryPouch_DestroyDialogueWindowAndRefreshListMenu(runtime, taskId);
  }
};

export const BerryPouchInitWindows = (runtime: BerryPouchRuntime): void => {
  runtime.operations.push('InitWindows(sWindowTemplates_Main)', 'DeactivateAllTextPrinters', 'LoadUserWindowGfx(0,0x001,BG_PLTT_ID(14))', 'LoadMenuMessageWindowGfx(0,0x013,BG_PLTT_ID(13))', 'LoadStdWindowGfx(0,0x00A,BG_PLTT_ID(12))', 'LoadPalette(gStandardMenuPalette,BG_PLTT_ID(15))');
  for (let i = 0; i < 3; i++) {
    runtime.operations.push(`FillWindowPixelBuffer(${i},0)`, `PutWindowTilemap(${i})`);
  }
  runtime.operations.push('ScheduleBgCopyTilemapToVram(0)', 'ScheduleBgCopyTilemapToVram(2)');
  runtime.sVariableWindowIds.fill(0xff);
};

export const BerryPouchPrint = (
  runtime: BerryPouchRuntime,
  windowId: number,
  fontId: number,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
  lineSpacing: number,
  speed: number,
  colorIdx: number
): void => {
  void letterSpacing;
  void lineSpacing;
  void speed;
  runtime.textPrints.push({ windowId, fontId, text, x, y, colorIdx });
};

export const GetOrCreateVariableWindow = (runtime: BerryPouchRuntime, winIdx: number): number => {
  let retval = runtime.sVariableWindowIds[winIdx] ?? 0xff;
  if (retval === 0xff) {
    retval = runtime.nextWindowId++;
    runtime.sVariableWindowIds[winIdx] = retval;
    if (winIdx === 2 || winIdx === 6 || winIdx === 7 || winIdx === 8 || winIdx === 9) {
      runtime.operations.push(`DrawStdFrameWithCustomTileAndPalette(${retval},FALSE,0x00A,12)`);
    } else {
      runtime.operations.push(`DrawStdFrameWithCustomTileAndPalette(${retval},FALSE,0x001,14)`);
    }
    runtime.operations.push('ScheduleBgCopyTilemapToVram(2)');
  }
  return retval;
};

export const VariableWindowSetAltFrameTileAndPalette = (runtime: BerryPouchRuntime, winIdx: number): void => {
  runtime.operations.push(`DrawStdFrameWithCustomTileAndPalette(${runtime.sVariableWindowIds[winIdx]},FALSE,0x001,14)`);
};

export const DestroyVariableWindow = (runtime: BerryPouchRuntime, winIdx: number): void => {
  const windowId = runtime.sVariableWindowIds[winIdx];
  runtime.operations.push(`ClearStdWindowAndFrameToTransparent(${windowId},FALSE)`, `ClearWindowTilemap(${windowId})`, `RemoveWindow(${windowId})`, 'ScheduleBgCopyTilemapToVram(2)');
  runtime.sVariableWindowIds[winIdx] = 0xff;
};

export const TryDestroyVariableWindow = (runtime: BerryPouchRuntime, winIdx: number): void => {
  if (runtime.sVariableWindowIds[winIdx] !== 0xff) {
    const windowId = runtime.sVariableWindowIds[winIdx];
    runtime.operations.push(`ClearDialogWindowAndFrameToTransparent(${windowId},FALSE)`, `ClearWindowTilemap(${windowId})`, `RemoveWindow(${windowId})`, 'PutWindowTilemap(1)', 'ScheduleBgCopyTilemapToVram(0)', 'ScheduleBgCopyTilemapToVram(2)');
    runtime.sVariableWindowIds[winIdx] = 0xff;
  }
};

export const GetVariableWindowId = (runtime: BerryPouchRuntime, winIdx: number): number => runtime.sVariableWindowIds[winIdx] ?? 0xff;

export const DisplayItemMessageInBerryPouch = (
  runtime: BerryPouchRuntime,
  taskId: number,
  fontId: number,
  text: string,
  followUpFunc: BerryPouchTaskFunc
): void => {
  if (runtime.sVariableWindowIds[5] === 0xff) {
    runtime.sVariableWindowIds[5] = runtime.nextWindowId++;
  }
  runtime.messages.push({ taskId, fontId, text, followUpFunc });
  runtime.operations.push(`DisplayMessageAndContinueTask(${taskId},${runtime.sVariableWindowIds[5]},0x013,0xD,${fontId},GetTextSpeedSetting,${followUpFunc})`, 'ScheduleBgCopyTilemapToVram(2)');
};

export const PrintMoneyInWin2 = (runtime: BerryPouchRuntime): void => {
  runtime.operations.push(`PrintMoneyAmountInMoneyBoxWithBorder(${GetOrCreateVariableWindow(runtime, 2)},0x00A,0xC,${runtime.money})`);
};

export const CreateBerryPouchSprite = (runtime: BerryPouchRuntime): void => {
  const id = runtime.nextSpriteId++;
  runtime.sBerryPouchSpriteId = id;
  runtime.sprites.push({ id, x: 40, y: 76, affineAnim: 0, affineAnimEnded: true, callback: 'SpriteCallbackDummy' });
  runtime.operations.push('CreateSprite(sSpriteTemplate_BerryPouch,40,76,0)');
};

export const StartBerryPouchSpriteWobbleAnim = (runtime: BerryPouchRuntime): void => {
  const sprite = runtime.sprites.find((entry) => entry.id === runtime.sBerryPouchSpriteId);
  if (sprite?.affineAnimEnded) {
    sprite.affineAnim = 1;
    sprite.affineAnimEnded = false;
    sprite.callback = 'SpriteCB_BerryPouchWaitWobbleAnim';
    runtime.operations.push('StartSpriteAffineAnim(1)');
  }
};

export const SpriteCB_BerryPouchWaitWobbleAnim = (runtime: BerryPouchRuntime, spriteId: number): void => {
  const sprite = runtime.sprites.find((entry) => entry.id === spriteId);
  if (sprite?.affineAnimEnded) {
    sprite.affineAnim = 0;
    sprite.callback = 'SpriteCallbackDummy';
    runtime.operations.push('StartSpriteAffineAnim(0)');
  }
};

export const dispatchBerryPouchTask = (runtime: BerryPouchRuntime, taskId: number): void => {
  const func = task(runtime, taskId).func;
  if (func === 'Task_BerryPouchMain') Task_BerryPouchMain(runtime, taskId);
  else if (func === 'Task_NormalContextMenu') Task_NormalContextMenu(runtime, taskId);
  else if (func === 'Task_NormalContextMenu_HandleInput') Task_NormalContextMenu_HandleInput(runtime, taskId);
  else if (func === 'Task_BerryPouchFadeToExitCallback') Task_BerryPouchFadeToExitCallback(runtime, taskId);
  else if (func === 'Task_AbortBerryPouchLoading_WaitFade') Task_AbortBerryPouchLoading_WaitFade(runtime, taskId);
  else if (func === 'Task_Toss_SelectMultiple') Task_Toss_SelectMultiple(runtime, taskId);
  else if (func === 'Task_WaitButtonThenTossBerries') Task_WaitButtonThenTossBerries(runtime, taskId);
  else if (func === 'Task_WaitButtonBeforeDialogueWindowDestruction') Task_WaitButtonBeforeDialogueWindowDestruction(runtime, taskId);
  else if (func === 'Task_BerryPouch_DestroyDialogueWindowAndRefreshListMenu') Task_BerryPouch_DestroyDialogueWindowAndRefreshListMenu(runtime, taskId);
  else if (func === 'Task_ContextMenu_FromPartyGiveMenu') Task_ContextMenu_FromPartyGiveMenu(runtime, taskId);
  else if (func === 'Task_ContextMenu_Sell') Task_ContextMenu_Sell(runtime, taskId);
  else if (func === 'Task_ContextMenu_FromPokemonPC') Task_ContextMenu_FromPokemonPC(runtime, taskId);
  else if (func === 'Task_Sell_PrintSelectMultipleUI') Task_Sell_PrintSelectMultipleUI(runtime, taskId);
  else if (func === 'Task_Sell_SelectMultiple') Task_Sell_SelectMultiple(runtime, taskId);
  else if (func === 'Task_SellMultiple_CreateYesNoMenu') Task_SellMultiple_CreateYesNoMenu(runtime, taskId);
  else if (func === 'Task_SellBerries_PlaySfxAndRemoveBerries') Task_SellBerries_PlaySfxAndRemoveBerries(runtime, taskId);
  else if (func === 'Task_SellBerries_WaitButton') Task_SellBerries_WaitButton(runtime, taskId);
  else if (func === 'BerryPouch_StartFadeToExitCallback') BerryPouch_StartFadeToExitCallback(runtime, taskId);
};

const ListMenuInit = (runtime: BerryPouchRuntime): number => {
  const id = runtime.nextListTaskId++;
  runtime.operations.push(`ListMenuInit(${runtime.sStaticCnt.listMenuScrollOffset},${runtime.sStaticCnt.listMenuSelectedRow})`);
  return id;
};

const ListMenu_ProcessInput = (runtime: BerryPouchRuntime): number => runtime.listMenuSelections.shift() ?? LIST_NOTHING_CHOSEN;
const Menu_ProcessInputNoWrapAround = (runtime: BerryPouchRuntime): number => runtime.menuInputs.shift() ?? LIST_CANCEL;
const ListMenuGetScrollAndRow = (runtime: BerryPouchRuntime): void => {
  runtime.operations.push('ListMenuGetScrollAndRow');
};

const AdjustQuantityAccordingToDPadInput = (runtime: BerryPouchRuntime, data: number[], index: number, max: number): boolean => {
  let delta = 0;
  if (consumeButton(runtime, DPAD_UP)) delta = 1;
  else if (consumeButton(runtime, DPAD_DOWN)) delta = -1;
  else if (consumeButton(runtime, DPAD_RIGHT)) delta = 10;
  else if (consumeButton(runtime, DPAD_LEFT)) delta = -10;
  if (delta === 0) {
    return false;
  }
  data[index] += delta;
  while (data[index] < 1) data[index] += max;
  while (data[index] > max) data[index] -= max;
  runtime.operations.push(`AdjustQuantityAccordingToDPadInput(${data[index]},${max})`);
  return true;
};

const RemoveBagItem = (runtime: BerryPouchRuntime, itemId: number, quantity: number): void => {
  const slot = runtime.bagPocket.find((entry) => entry.itemId === itemId);
  if (slot !== undefined) {
    slot.quantity -= quantity;
    if (slot.quantity <= 0) {
      slot.itemId = ITEM_NONE;
      slot.quantity = 0;
    }
  }
  runtime.operations.push(`RemoveBagItem(${itemId},${quantity})`);
};
