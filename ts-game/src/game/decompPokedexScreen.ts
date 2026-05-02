import {
  FLAG_GET_CAUGHT,
  FLAG_GET_SEEN,
  KANTO_DEX_COUNT,
  getKantoPokedexCount,
  getNationalDexNumber,
  getNationalPokedexCount,
  getSetPokedexFlag,
  type DecompPokedexFlagState
} from './decompPokedex';

export const LIST_HEADER = -2;
export const LIST_CANCEL = -1;
export const DEX_MODE_NUMERICAL_KANTO = 0;
export const DEX_MODE_ATOZ = 1;
export const DEX_MODE_TYPE = 2;
export const DEX_MODE_LIGHTEST = 3;
export const DEX_MODE_SMALLEST = 4;
export const DEX_MODE_NUMERICAL_NATIONAL = 5;
export const DEX_CATEGORY_GRASSLAND = 0;
export const DEX_CATEGORY_FOREST = 1;
export const DEX_CATEGORY_WATERS_EDGE = 2;
export const DEX_CATEGORY_SEA = 3;
export const DEX_CATEGORY_CAVE = 4;
export const DEX_CATEGORY_MOUNTAIN = 5;
export const DEX_CATEGORY_ROUGH_TERRAIN = 6;
export const DEX_CATEGORY_URBAN = 7;
export const DEX_CATEGORY_RARE = 8;
export const NATIONAL_DEX_NONE = 0;
export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const START_BUTTON = 0x0008;
export const DPAD_RIGHT = 0x0010;
export const DPAD_LEFT = 0x0020;
export const DPAD_UP = 0x0040;
export const DPAD_DOWN = 0x0080;
export const L_BUTTON = 0x0200;
export const R_BUTTON = 0x0100;

export interface PokedexScreenSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  destroyed: boolean;
}

export interface PokedexScreenRuntime {
  taskId: number;
  state: number;
  data: number[];
  areaMarkersTaskId: number;
  unlockedCategories: number;
  modeSelectInput: number;
  modeSelectItemsAbove: number;
  modeSelectCursorPos: number;
  modeSelectWindowId: number;
  selectionIconWindowId: number;
  dexCountsWindowId: number;
  modeSelectListMenuId: number;
  pageSpecies: number[];
  categoryMonWindowIds: number[];
  categoryMonInfoWindowIds: number[];
  category: number;
  firstPageInCategory: number;
  lastPageInCategory: number;
  pageNum: number;
  numMonsOnPage: number;
  categoryCursorPosInPage: number;
  categoryPageSelectionCursorTimer: number;
  parentOfCategoryMenu: number;
  characteristicMenuInput: number;
  kantoOrderMenuItemsAbove: number;
  kantoOrderMenuCursorPos: number;
  characteristicOrderMenuItemsAbove: number;
  characteristicOrderMenuCursorPos: number;
  nationalOrderMenuItemsAbove: number;
  nationalOrderMenuCursorPos: number;
  numericalOrderWindowId: number;
  orderedListMenuTaskId: number;
  dexOrderId: number;
  orderedDexCount: number;
  windowIds: number[];
  dexSpecies: number;
  scrollArrowsTaskId: number;
  categoryPageCursorTaskId: number;
  modeSelectCursorPosBak: number;
  unlockedSeviiAreas: number;
  numSeenKanto: number;
  numOwnedKanto: number;
  numSeenNational: number;
  numOwnedNational: number;
  nationalDexEnabled: boolean;
  pokedex: DecompPokedexFlagState;
  listItems: Array<{ name: string; id: number; index?: number }>;
  categoryPages: number[][][];
  orderLists: number[][];
  currentListInput: number;
  newKeys: number;
  heldKeys: number;
  paletteFadeActive: boolean;
  mainCallback2: string | null;
  taskFunc: string;
  operations: string[];
  windows: Record<number, { removed: boolean; prints: string[] }>;
  sprites: PokedexScreenSprite[];
}

export const createPokedexScreenRuntime = (overrides: Partial<PokedexScreenRuntime> = {}): PokedexScreenRuntime => ({
  taskId: overrides.taskId ?? 0,
  state: overrides.state ?? 0,
  data: overrides.data ?? [0, 0],
  areaMarkersTaskId: overrides.areaMarkersTaskId ?? -1,
  unlockedCategories: overrides.unlockedCategories ?? 0,
  modeSelectInput: overrides.modeSelectInput ?? 0,
  modeSelectItemsAbove: overrides.modeSelectItemsAbove ?? 1,
  modeSelectCursorPos: overrides.modeSelectCursorPos ?? 0,
  modeSelectWindowId: overrides.modeSelectWindowId ?? -1,
  selectionIconWindowId: overrides.selectionIconWindowId ?? -1,
  dexCountsWindowId: overrides.dexCountsWindowId ?? -1,
  modeSelectListMenuId: overrides.modeSelectListMenuId ?? -1,
  pageSpecies: overrides.pageSpecies ?? [-1, -1, -1, -1],
  categoryMonWindowIds: overrides.categoryMonWindowIds ?? [-1, -1, -1, -1],
  categoryMonInfoWindowIds: overrides.categoryMonInfoWindowIds ?? [-1, -1, -1, -1],
  category: overrides.category ?? 0,
  firstPageInCategory: overrides.firstPageInCategory ?? 0,
  lastPageInCategory: overrides.lastPageInCategory ?? 0,
  pageNum: overrides.pageNum ?? 0,
  numMonsOnPage: overrides.numMonsOnPage ?? 0,
  categoryCursorPosInPage: overrides.categoryCursorPosInPage ?? 0,
  categoryPageSelectionCursorTimer: overrides.categoryPageSelectionCursorTimer ?? 0,
  parentOfCategoryMenu: overrides.parentOfCategoryMenu ?? 0,
  characteristicMenuInput: overrides.characteristicMenuInput ?? 0,
  kantoOrderMenuItemsAbove: overrides.kantoOrderMenuItemsAbove ?? 0,
  kantoOrderMenuCursorPos: overrides.kantoOrderMenuCursorPos ?? 0,
  characteristicOrderMenuItemsAbove: overrides.characteristicOrderMenuItemsAbove ?? 0,
  characteristicOrderMenuCursorPos: overrides.characteristicOrderMenuCursorPos ?? 0,
  nationalOrderMenuItemsAbove: overrides.nationalOrderMenuItemsAbove ?? 0,
  nationalOrderMenuCursorPos: overrides.nationalOrderMenuCursorPos ?? 0,
  numericalOrderWindowId: overrides.numericalOrderWindowId ?? -1,
  orderedListMenuTaskId: overrides.orderedListMenuTaskId ?? -1,
  dexOrderId: overrides.dexOrderId ?? 0,
  orderedDexCount: overrides.orderedDexCount ?? 0,
  windowIds: overrides.windowIds ?? Array.from({ length: 16 }, () => -1),
  dexSpecies: overrides.dexSpecies ?? 1,
  scrollArrowsTaskId: overrides.scrollArrowsTaskId ?? -1,
  categoryPageCursorTaskId: overrides.categoryPageCursorTaskId ?? -1,
  modeSelectCursorPosBak: overrides.modeSelectCursorPosBak ?? 0,
  unlockedSeviiAreas: overrides.unlockedSeviiAreas ?? 0,
  numSeenKanto: overrides.numSeenKanto ?? 0,
  numOwnedKanto: overrides.numOwnedKanto ?? 0,
  numSeenNational: overrides.numSeenNational ?? 0,
  numOwnedNational: overrides.numOwnedNational ?? 0,
  nationalDexEnabled: overrides.nationalDexEnabled ?? false,
  pokedex: overrides.pokedex ?? { pokedex: { seenSpecies: [], caughtSpecies: [] } },
  listItems: overrides.listItems ?? [],
  categoryPages: overrides.categoryPages ?? [
    [[1, 2, 3, 4]], [[10]], [[20]], [[30]], [[40]], [[50]], [[60]], [[70]], [[80]]
  ],
  orderLists: overrides.orderLists ?? [[1, 2, 3], [3, 2, 1], [1, 3, 2], [2, 1, 3], [2, 3, 1], [1, 2, 3, 4]],
  currentListInput: overrides.currentListInput ?? 0,
  newKeys: overrides.newKeys ?? 0,
  heldKeys: overrides.heldKeys ?? 0,
  paletteFadeActive: overrides.paletteFadeActive ?? false,
  mainCallback2: overrides.mainCallback2 ?? null,
  taskFunc: overrides.taskFunc ?? 'Task_PokedexScreen',
  operations: overrides.operations ?? [],
  windows: overrides.windows ?? {},
  sprites: overrides.sprites ?? [],
  ...overrides
});

const op = (runtime: PokedexScreenRuntime, name: string): void => {
  runtime.operations.push(name);
};

const setTask = (runtime: PokedexScreenRuntime, taskFunc: string): void => {
  runtime.taskFunc = taskFunc;
  runtime.state = 0;
};

export const VBlankCB = (runtime: PokedexScreenRuntime): void => {
  op(runtime, 'LoadOam');
  op(runtime, 'ProcessSpriteCopyRequests');
  op(runtime, 'TransferPlttBuffer');
};

export const CB2_PokedexScreen = (runtime: PokedexScreenRuntime): void => {
  op(runtime, 'RunTasks');
  op(runtime, 'AnimateSprites');
  op(runtime, 'BuildOamBuffer');
  op(runtime, 'UpdatePaletteFade');
};

export const DexScreen_LoadResources = (runtime: PokedexScreenRuntime): boolean => {
  op(runtime, 'DexScreen_LoadResources');
  runtime.numSeenKanto = DexScreen_GetDexCount(runtime, FLAG_GET_SEEN, false);
  runtime.numOwnedKanto = DexScreen_GetDexCount(runtime, FLAG_GET_CAUGHT, false);
  runtime.numSeenNational = DexScreen_GetDexCount(runtime, FLAG_GET_SEEN, true);
  runtime.numOwnedNational = DexScreen_GetDexCount(runtime, FLAG_GET_CAUGHT, true);
  return true;
};

export const CB2_OpenPokedexFromStartMenu = (runtime: PokedexScreenRuntime): void => {
  runtime.mainCallback2 = 'CB2_PokedexScreen';
  runtime.taskFunc = 'Task_PokedexScreen';
  runtime.state = 0;
  DexScreen_LoadResources(runtime);
};

export const DoClosePokedex = (runtime: PokedexScreenRuntime): void => {
  runtime.paletteFadeActive = true;
  runtime.taskFunc = 'CB2_ClosePokedex';
};

export const CB2_ClosePokedex = (runtime: PokedexScreenRuntime): void => {
  if (!runtime.paletteFadeActive)
    runtime.mainCallback2 = 'CB2_ReturnToFieldWithOpenMenu';
};

export const Task_PokedexScreen = (runtime: PokedexScreenRuntime): void => {
  switch (runtime.state) {
    case 0:
      DexScreen_InitGfxForTopMenu(runtime);
      runtime.state++;
      break;
    case 1:
      if (runtime.currentListInput === LIST_CANCEL || (runtime.newKeys & B_BUTTON))
        DoClosePokedex(runtime);
      else if (runtime.currentListInput >= 0) {
        runtime.modeSelectInput = runtime.currentListInput;
        setTask(runtime, runtime.currentListInput <= DEX_MODE_NUMERICAL_NATIONAL ? 'Task_DexScreen_NumericalOrder' : 'Task_DexScreen_CategorySubmenu');
      }
      break;
  }
};

export const DexScreen_InitGfxForTopMenu = (runtime: PokedexScreenRuntime): void => {
  runtime.modeSelectWindowId = 0;
  runtime.selectionIconWindowId = 1;
  runtime.dexCountsWindowId = 2;
  op(runtime, 'DexScreen_InitGfxForTopMenu');
};

export const MoveCursorFunc_DexModeSelect = (runtime: PokedexScreenRuntime, itemIndex: number, onInit: boolean): void => {
  if (!onInit)
    op(runtime, 'PlaySE:SE_SELECT');
  runtime.modeSelectCursorPos = itemIndex;
};

export const ItemPrintFunc_DexModeSelect = (runtime: PokedexScreenRuntime, windowId: number, itemId: number, y: number): void => {
  DexScreen_AddTextPrinterParameterized(runtime, windowId, 0, `mode:${itemId}`, 12, y, itemId === LIST_HEADER ? 1 : 0);
};

export const Task_DexScreen_NumericalOrder = (runtime: PokedexScreenRuntime): void => {
  if (runtime.state === 0) {
    DexScreen_InitGfxForNumericalOrderList(runtime);
    runtime.state++;
  } else if (runtime.state === 1) {
    if (runtime.currentListInput === LIST_CANCEL || (runtime.newKeys & B_BUTTON))
      setTask(runtime, 'Task_PokedexScreen');
    else if (runtime.currentListInput > 0) {
      runtime.dexSpecies = runtime.currentListInput;
      setTask(runtime, 'Task_DexScreen_ShowMonPage');
    }
  }
};

export const DexScreen_InitGfxForNumericalOrderList = (runtime: PokedexScreenRuntime): void => {
  runtime.dexOrderId = runtime.modeSelectInput;
  runtime.orderedDexCount = DexScreen_CountMonsInOrderedList(runtime, runtime.dexOrderId);
  DexScreen_InitListMenuForOrderedList(runtime, runtime.dexOrderId);
};

export const Task_DexScreen_CharacteristicOrder = (runtime: PokedexScreenRuntime): void => {
  if (runtime.state === 0) {
    DexScreen_CreateCharacteristicListMenu(runtime);
    runtime.state++;
  } else if (runtime.state === 1 && (runtime.currentListInput === LIST_CANCEL || (runtime.newKeys & B_BUTTON))) {
    setTask(runtime, 'Task_PokedexScreen');
  }
};

export const DexScreen_CreateCharacteristicListMenu = (runtime: PokedexScreenRuntime): void => {
  runtime.characteristicMenuInput = runtime.currentListInput;
  op(runtime, 'DexScreen_CreateCharacteristicListMenu');
};

export const DexScreen_CountMonsInOrderedList = (runtime: PokedexScreenRuntime, orderIdx: number): number => {
  const list = runtime.orderLists[orderIdx] ?? [];
  return list.filter((species) => DexScreen_CanShowMonInDex(runtime, species)).length;
};

export const DexScreen_InitListMenuForOrderedList = (runtime: PokedexScreenRuntime, order: number): void => {
  runtime.listItems = (runtime.orderLists[order] ?? []).map((species) => ({
    name: `SPECIES_${species}`,
    id: species,
    index: species | (DexScreen_CanShowMonInDex(runtime, species) ? 1 << 16 : 0)
  }));
  runtime.orderedListMenuTaskId = 0;
};

const pokedexOrderCursorRefs = (
  runtime: PokedexScreenRuntime
): { getCursor: () => number; setCursor: (value: number) => void; getItemsAbove: () => number; setItemsAbove: (value: number) => void } => {
  switch (runtime.dexOrderId) {
    default:
    case DEX_MODE_NUMERICAL_KANTO:
      return {
        getCursor: () => runtime.kantoOrderMenuCursorPos,
        setCursor: (value) => { runtime.kantoOrderMenuCursorPos = value & 0xffff; },
        getItemsAbove: () => runtime.kantoOrderMenuItemsAbove,
        setItemsAbove: (value) => { runtime.kantoOrderMenuItemsAbove = value & 0xffff; }
      };
    case DEX_MODE_ATOZ:
    case DEX_MODE_TYPE:
    case DEX_MODE_LIGHTEST:
    case DEX_MODE_SMALLEST:
      return {
        getCursor: () => runtime.characteristicOrderMenuCursorPos,
        setCursor: (value) => { runtime.characteristicOrderMenuCursorPos = value & 0xffff; },
        getItemsAbove: () => runtime.characteristicOrderMenuItemsAbove,
        setItemsAbove: (value) => { runtime.characteristicOrderMenuItemsAbove = value & 0xffff; }
      };
    case DEX_MODE_NUMERICAL_NATIONAL:
      return {
        getCursor: () => runtime.nationalOrderMenuCursorPos,
        setCursor: (value) => { runtime.nationalOrderMenuCursorPos = value & 0xffff; },
        getItemsAbove: () => runtime.nationalOrderMenuItemsAbove,
        setItemsAbove: (value) => { runtime.nationalOrderMenuItemsAbove = value & 0xffff; }
      };
  }
};

const dexListItemIndex = (runtime: PokedexScreenRuntime, selectedIndex: number): number =>
  runtime.listItems[selectedIndex]?.index ?? runtime.listItems[selectedIndex]?.id ?? 0;

export const DexScreen_TryScrollMonsVertical = (runtime: PokedexScreenRuntime, direction: number): boolean => {
  const refs = pokedexOrderCursorRefs(runtime);
  let selectedIndex = refs.getCursor() + refs.getItemsAbove();

  if (direction) {
    if (selectedIndex === 0) return false;
    selectedIndex--;
    while (selectedIndex >= 0) {
      if (((dexListItemIndex(runtime, selectedIndex) >> 16) & 1) !== 0) break;
      selectedIndex--;
    }
    if (selectedIndex < 0) return false;
  } else {
    if (selectedIndex === runtime.orderedDexCount - 1) return false;
    selectedIndex++;
    while (selectedIndex < runtime.orderedDexCount) {
      if (((dexListItemIndex(runtime, selectedIndex) >> 16) & 1) !== 0) break;
      selectedIndex++;
    }
    if (selectedIndex >= runtime.orderedDexCount) return false;
  }

  runtime.characteristicMenuInput = dexListItemIndex(runtime, selectedIndex);
  if (runtime.orderedDexCount > 9) {
    if (selectedIndex < 4) {
      refs.setCursor(0);
      refs.setItemsAbove(selectedIndex);
    } else if (selectedIndex >= runtime.orderedDexCount - 4) {
      refs.setCursor(runtime.orderedDexCount - 9);
      refs.setItemsAbove(selectedIndex + 9 - runtime.orderedDexCount);
    } else {
      refs.setCursor(selectedIndex - 4);
      refs.setItemsAbove(4);
    }
  } else {
    refs.setCursor(0);
    refs.setItemsAbove(selectedIndex);
  }
  return true;
};

export const DexScreen_DestroyDexOrderListMenu = (runtime: PokedexScreenRuntime, order: number): void => {
  runtime.listItems = [];
  op(runtime, `DexScreen_DestroyDexOrderListMenu:${order}`);
};

export const DexScreen_CreateDexOrderScrollArrows = (runtime: PokedexScreenRuntime): number => {
  runtime.scrollArrowsTaskId = 0;
  return runtime.scrollArrowsTaskId;
};

export const ItemPrintFunc_OrderedListMenu = (runtime: PokedexScreenRuntime, windowId: number, itemId: number, y: number): void => {
  DexScreen_PrintMonDexNo(runtime, windowId, 0, itemId, 0, y);
};

export const Task_DexScreen_CategorySubmenu = (runtime: PokedexScreenRuntime): void => {
  if (runtime.state === 0) {
    runtime.category = runtime.modeSelectInput;
    const limits = DexScreen_GetPageLimitsForCategory(runtime, runtime.category);
    runtime.firstPageInCategory = limits >> 4;
    runtime.lastPageInCategory = limits & 0xf;
    runtime.pageNum = runtime.firstPageInCategory;
    DexScreen_CreateCategoryListGfx(runtime, false);
    runtime.state++;
  } else if (runtime.state === 1) {
    if (runtime.newKeys & B_BUTTON)
      setTask(runtime, 'Task_PokedexScreen');
    else if (runtime.newKeys & A_BUTTON)
      setTask(runtime, 'Task_DexScreen_ShowMonPage');
  }
};

export const DexScreen_CreateCategoryMenuScrollArrows = (runtime: PokedexScreenRuntime): number => {
  runtime.scrollArrowsTaskId = 1;
  return 1;
};

export const DexScreen_InputHandler_GetShoulderInput = (runtime: PokedexScreenRuntime): number => {
  if (runtime.heldKeys & L_BUTTON)
    return -1;
  if (runtime.heldKeys & R_BUTTON)
    return 1;
  return 0;
};

export const Task_DexScreen_ShowMonPage = (runtime: PokedexScreenRuntime): void => {
  if (runtime.state === 0) {
    DexScreen_DrawMonDexPage(runtime, false);
    runtime.state++;
  } else if (runtime.state === 1) {
    if (runtime.newKeys & B_BUTTON) {
      RemoveDexPageWindows(runtime);
      setTask(runtime, 'Task_DexScreen_NumericalOrder');
    } else if (runtime.newKeys & START_BUTTON) {
      DexScreen_InputHandler_StartToCry(runtime);
    }
  }
};

export const DexScreen_RemoveWindow = (runtime: PokedexScreenRuntime, windowIdRef: { value: number }): void => {
  if (windowIdRef.value !== -1) {
    runtime.windows[windowIdRef.value] = { ...(runtime.windows[windowIdRef.value] ?? { prints: [] }), removed: true };
    windowIdRef.value = -1;
  }
};

export const DexScreen_AddTextPrinterParameterized = (
  runtime: PokedexScreenRuntime,
  windowId: number,
  _fontId: number,
  str: string,
  x: number,
  y: number,
  colorIdx: number
): void => {
  runtime.windows[windowId] ??= { removed: false, prints: [] };
  runtime.windows[windowId].prints.push(`${x},${y},${colorIdx}:${str}`);
};

export const DexScreen_PrintNum3LeadingZeroes = (runtime: PokedexScreenRuntime, windowId: number, fontId: number, num: number, x: number, y: number, colorIdx: number): void => {
  DexScreen_AddTextPrinterParameterized(runtime, windowId, fontId, String(num).padStart(3, '0'), x, y, colorIdx);
};

export const DexScreen_PrintNum3RightAlign = (runtime: PokedexScreenRuntime, windowId: number, fontId: number, num: number, x: number, y: number, colorIdx: number): void => {
  DexScreen_AddTextPrinterParameterized(runtime, windowId, fontId, String(num).padStart(3, ' '), x, y, colorIdx);
};

export const DexScreen_GetDefaultPersonality = (species: number): number => (species * 0x12345) >>> 0;

export const DexScreen_LoadMonPicInWindow = (runtime: PokedexScreenRuntime, windowId: number, species: number, personality: number): void => {
  op(runtime, `DexScreen_LoadMonPicInWindow:${windowId}:${species}:${personality}`);
};

export const DexScreen_PrintMonDexNo = (runtime: PokedexScreenRuntime, windowId: number, fontId: number, species: number, x: number, y: number): void => {
  const dexNum = typeof species === 'number' ? species : getNationalDexNumber(String(species)) ?? 0;
  DexScreen_PrintNum3LeadingZeroes(runtime, windowId, fontId, dexNum, x, y, 0);
};

export const DexScreen_GetSetPokedexFlag = (runtime: PokedexScreenRuntime, nationalDexNo: number, caseId: number): number =>
  getSetPokedexFlag(runtime.pokedex, nationalDexNo, caseId);

export const DexScreen_GetDexCount = (runtime: PokedexScreenRuntime, caseId: number, whichDex: boolean): number =>
  whichDex ? getNationalPokedexCount(runtime.pokedex, caseId) : getKantoPokedexCount(runtime.pokedex, caseId);

export const DexScreen_PrintControlInfo = (runtime: PokedexScreenRuntime, src: string): void => {
  op(runtime, `DexScreen_PrintControlInfo:${src}`);
};

export const DexScreen_DrawMonPicInCategoryPage = (runtime: PokedexScreenRuntime, species: number, slot: number): void => {
  runtime.pageSpecies[slot] = species;
};

export const DexScreen_DestroyCategoryPageMonIconAndInfoWindows = (runtime: PokedexScreenRuntime): void => {
  runtime.categoryMonWindowIds.fill(-1);
  runtime.categoryMonInfoWindowIds.fill(-1);
};

export const DexScreen_PrintCategoryPageNumbers = (runtime: PokedexScreenRuntime): void => {
  op(runtime, `DexScreen_PrintCategoryPageNumbers:${runtime.pageNum}`);
};

export const DexScreen_CreateCategoryListGfx = (runtime: PokedexScreenRuntime, justRegistered: boolean): boolean => {
  DexScreen_CreateCategoryPageSpeciesList(runtime, runtime.category, runtime.pageNum);
  if (justRegistered)
    op(runtime, 'DexScreen_CreateCategoryListGfx:justRegistered');
  return true;
};

export const DexScreen_CreateCategoryPageSelectionCursor = (runtime: PokedexScreenRuntime, cursorPos: number): void => {
  runtime.categoryCursorPosInPage = cursorPos;
  runtime.categoryPageCursorTaskId = 0;
};

export const DexScreen_UpdateCategoryPageCursorObject = (runtime: PokedexScreenRuntime, _taskId: number, cursorPos: number, numMonsInPage: number): void => {
  runtime.categoryCursorPosInPage = Math.min(cursorPos, Math.max(0, numMonsInPage - 1));
  runtime.categoryPageSelectionCursorTimer++;
};

export const DexPage_TileBuffer_CopyCol = (runtime: PokedexScreenRuntime, dst: number[], src: number[], col: number): void => {
  dst[col] = src[col] ?? 0;
  op(runtime, `DexPage_TileBuffer_CopyCol:${col}`);
};

export const DexPage_TileBuffer_FillCol = (runtime: PokedexScreenRuntime, dst: number[], col: number, value: number): void => {
  dst[col] = value;
  op(runtime, `DexPage_TileBuffer_FillCol:${col}:${value}`);
};

export const DexScreen_TurnCategoryPage_BgEffect = (runtime: PokedexScreenRuntime, direction: number): void => {
  op(runtime, `DexScreen_TurnCategoryPage_BgEffect:${direction}`);
};

export const DexScreen_FlipCategoryPageInDirection = (runtime: PokedexScreenRuntime, direction: number): boolean => {
  const next = runtime.pageNum + (direction ? 1 : -1);
  if (next < runtime.firstPageInCategory || next > runtime.lastPageInCategory)
    return false;
  runtime.pageNum = next;
  DexScreen_TurnCategoryPage_BgEffect(runtime, direction);
  return true;
};

export const DexScreen_DexPageZoomEffectFrame = (runtime: PokedexScreenRuntime, bg: number, scale: number): void => {
  op(runtime, `DexScreen_DexPageZoomEffectFrame:${bg}:${scale}`);
};

export const DexScreen_PrintMonCategory = (runtime: PokedexScreenRuntime, category: string): void => {
  DexScreen_AddTextPrinterParameterized(runtime, 0, 0, category, 0, 0, 0);
};

export const DexScreen_PrintMonHeight = (runtime: PokedexScreenRuntime, height: number): void => {
  DexScreen_AddTextPrinterParameterized(runtime, 0, 0, String(height), 0, 0, 0);
};

export const DexScreen_PrintMonWeight = (runtime: PokedexScreenRuntime, weight: number): void => {
  DexScreen_AddTextPrinterParameterized(runtime, 0, 0, String(weight), 0, 0, 0);
};

export const DexScreen_PrintMonFlavorText = (runtime: PokedexScreenRuntime, text: string): void => {
  DexScreen_AddTextPrinterParameterized(runtime, 0, 0, text, 0, 0, 0);
};

export const DexScreen_DrawMonFootprint = (runtime: PokedexScreenRuntime, species: number): void => {
  op(runtime, `DexScreen_DrawMonFootprint:${species}`);
};

export const DexScreen_DrawMonDexPage = (runtime: PokedexScreenRuntime, justRegistered: boolean): number => {
  DexScreen_LoadMonPicInWindow(runtime, 0, runtime.dexSpecies, DexScreen_GetDefaultPersonality(runtime.dexSpecies));
  DexScreen_DrawMonFootprint(runtime, runtime.dexSpecies);
  if (justRegistered)
    op(runtime, 'DexScreen_DrawMonDexPage:justRegistered');
  return 0;
};

export const RemoveDexPageWindows = (runtime: PokedexScreenRuntime): number => {
  runtime.windowIds.fill(-1);
  return 0;
};

export const DexScreen_DrawMonAreaPage = (runtime: PokedexScreenRuntime): number => {
  runtime.areaMarkersTaskId = 0;
  op(runtime, `DexScreen_DrawMonAreaPage:${runtime.dexSpecies}`);
  return 0;
};

export const DexScreen_DestroyAreaScreenResources = (runtime: PokedexScreenRuntime): number => {
  runtime.areaMarkersTaskId = -1;
  return 0;
};

export const DexScreen_CanShowMonInDex = (runtime: PokedexScreenRuntime, species: number): boolean =>
  species <= KANTO_DEX_COUNT || runtime.nationalDexEnabled;

export const DexScreen_IsPageUnlocked = (runtime: PokedexScreenRuntime, category: number, pageNum: number): boolean =>
  (runtime.unlockedCategories & (1 << category)) !== 0 && pageNum < (runtime.categoryPages[category]?.length ?? 0);

export const DexScreen_IsCategoryUnlocked = (runtime: PokedexScreenRuntime, category: number): boolean =>
  (runtime.unlockedCategories & (1 << category)) !== 0;

export const DexScreen_CreateCategoryPageSpeciesList = (runtime: PokedexScreenRuntime, category: number, pageNum: number): void => {
  const page = runtime.categoryPages[category]?.[pageNum] ?? [];
  runtime.numMonsOnPage = page.length;
  runtime.pageSpecies = [...page, -1, -1, -1].slice(0, 4);
};

export const DexScreen_GetPageLimitsForCategory = (runtime: PokedexScreenRuntime, category: number): number => {
  const pages = runtime.categoryPages[category]?.length ?? 0;
  return pages === 0 ? 0 : ((0 << 4) | (pages - 1));
};

export const DexScreen_LookUpCategoryBySpecies = (runtime: PokedexScreenRuntime, species: number): boolean => {
  for (let category = 0; category < runtime.categoryPages.length; category++) {
    for (let page = 0; page < (runtime.categoryPages[category]?.length ?? 0); page++) {
      if (runtime.categoryPages[category]?.[page]?.includes(species)) {
        runtime.category = category;
        runtime.pageNum = page;
        runtime.categoryCursorPosInPage = runtime.categoryPages[category][page].indexOf(species);
        return true;
      }
    }
  }
  return false;
};

export const DexScreen_PageNumberToRenderablePages = (_runtime: PokedexScreenRuntime, page: number): number =>
  page * 2;

export const DexScreen_InputHandler_StartToCry = (runtime: PokedexScreenRuntime): void => {
  op(runtime, `PlayCry:${runtime.dexSpecies}`);
};

export const DexScreen_RegisterMonToPokedex = (runtime: PokedexScreenRuntime, species: number): void => {
  const dexNo = species;
  DexScreen_GetSetPokedexFlag(runtime, dexNo, 2);
  runtime.dexSpecies = species;
};

export const Task_DexScreen_RegisterNonKantoMonBeforeNationalDex = (runtime: PokedexScreenRuntime): void => {
  runtime.nationalDexEnabled = false;
  DexScreen_RegisterMonToPokedex(runtime, runtime.dexSpecies);
  setTask(runtime, 'Task_DexScreen_ShowMonPage');
};

export const Task_DexScreen_RegisterMonToPokedex = (runtime: PokedexScreenRuntime): void => {
  DexScreen_RegisterMonToPokedex(runtime, runtime.dexSpecies);
  setTask(runtime, 'Task_DexScreen_ShowMonPage');
};

export const DexScreen_PrintStringWithAlignment = (runtime: PokedexScreenRuntime, str: string, mode: number): void => {
  const x = mode === 1 ? Math.trunc(str.length / 2) : mode === 2 ? str.length : 0;
  DexScreen_AddTextPrinterParameterized(runtime, 0, 0, str, x, 0, mode);
};
