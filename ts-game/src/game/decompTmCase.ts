import {
  BAG_TMHM_COUNT,
  ITEM_HM01,
  ITEM_NONE,
  ItemId_GetDescription,
  ItemId_GetImportance,
  ItemId_GetPrice,
  POCKET_TM_CASE,
  type ItemSlot
} from './decompItem';
import { gItems } from './decompItems';
import { getDecompBattleMove, type DecompBattleMove } from './decompBattleData';
import { getMoveName } from './decompMoveNames';
import {
  gText_FontNormal,
  gText_FontSmall,
  gText_NumberClear01,
  gText_ThreeHyphens,
  gText_TMCaseWillBePutAway,
  gText_TimesStrVar1
} from './decompStrings';

export const TMCASE_FIELD = 0;
export const TMCASE_GIVE_PARTY = 1;
export const TMCASE_SELL = 2;
export const TMCASE_GIVE_PC = 3;
export const TMCASE_POKEDUDE = 4;
export const TMCASE_REOPENING = 5;
export const TMCASE_KEEP_PREV = 0xff;

export const WIN_LIST = 0;
export const WIN_DESCRIPTION = 1;
export const WIN_SELECTED_MSG = 2;
export const WIN_TITLE = 3;
export const WIN_MOVE_INFO_LABELS = 4;
export const WIN_MOVE_INFO = 5;
export const WIN_MESSAGE = 6;
export const WIN_SELL_QUANTITY = 7;
export const WIN_MONEY = 8;

export const ACTION_USE = 0;
export const ACTION_GIVE = 1;
export const ACTION_EXIT = 2;

export const MENU_B_PRESSED = -1;
export const MENU_NOTHING_CHOSEN = -2;
export const LIST_NOTHING_CHOSEN = -1;
export const COLOR_LIGHT = 0;
export const COLOR_DARK = 1;
export const COLOR_CURSOR_SELECTED = 2;
export const COLOR_MOVE_INFO = 3;
export const COLOR_CURSOR_ERASE = 0xff;

export const DISC_BASE_X = 41;
export const DISC_BASE_Y = 46;
export const DISC_CASE_DISTANCE = 20;
export const DISC_Y_MOVE = 10;
export const TAG_DISC = 400;
export const DISC_HIDDEN = 0xff;
export const ANIM_TM = 0;
export const ANIM_HM = 1;

export const ITEM_TM01 = 289;
export const ITEM_TM03 = ITEM_TM01 + 2;
export const ITEM_TM09 = ITEM_TM01 + 8;
export const ITEM_TM35 = ITEM_TM01 + 34;
export const ITEM_TM50 = 338;
export const ITEM_HM08 = 346;
export const NUM_TECHNICAL_MACHINES = 50;
export const NUM_HIDDEN_MACHINES = 8;
export const NUMBER_OF_MON_TYPES = 18;
export const NUM_DISC_COLORS = (NUMBER_OF_MON_TYPES - 1) * 16;

export const LIST_CANCEL = -2;
export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const SELECT_BUTTON = 0x0004;
export const SE_SELECT = 5;
export const SE_SHOP = 248;
export const QL_EVENT_SOLD_ITEM = 38;
export const QL_EVENT_USED_POKEMART = 36;
export const TASK_NONE = 0xff;
export const WINDOW_NONE = 0xff;
export const POKEDUDE_INPUT_DELAY = 101;

export interface TMCaseStaticResources {
  menuType: number;
  allowSelectClose: number | boolean;
  selectedRow: number;
  scrollOffset: number;
  exitCallback?: string | null;
}

export interface TMCaseDynamicResources {
  maxTMsShown: number;
  numTMs: number;
  currItem: number;
  menuActionIndices: number[];
  numMenuActions: number;
  seqId?: number;
  scrollArrowsTaskId?: number;
  discSpriteId?: number;
}

export interface TMCaseListMenuItem {
  label: string;
  index: number;
}

export interface TMCaseMoveInfo {
  itemId: number;
  moveId: string | null;
  typeIcon: number | null;
  power: string;
  accuracy: string;
  pp: string;
}

export interface TMCaseDiscSprite {
  x: number;
  y: number;
  y2: number;
  anim: number;
  itemId: number;
  state: number;
  callback: 'dummy' | 'swap';
}

export interface TMCaseTask {
  func: string;
  data: number[];
}

export interface TMCaseRuntime {
  staticResources: TMCaseStaticResources;
  dynamicResources: TMCaseDynamicResources & { nextScreenCallback: string | null; contextMenuWindowId: number };
  task: TMCaseTask;
  slots: ItemSlot[];
  gSpecialVar_ItemId: number;
  gItemUseCB: string | null;
  playerPartyCount: number;
  money: number;
  paletteFadeActive: boolean;
  overworldLinkBusy: boolean;
  linkActive: boolean;
  inUnionRoom: boolean;
  newKeys: number;
  listInput: number;
  contextInput: number;
  quantityAdjustResult: 0 | 1;
  operations: string[];
  playedSoundEffects: number[];
  itemTransactions: Array<{ itemId: number; quantity: number; type: number }>;
  mainState: number;
  mainCallback2: string | null;
  vblankCallback: string | null;
  textFlagsAutoScroll: boolean;
  setupBlocked: boolean;
  listMenuItems: TMCaseListMenuItem[];
  discSprite: TMCaseDiscSprite | null;
  textPrinterActive: boolean;
  teachyTvResumeMode: boolean;
  pokedudeBagBackup: {
    slots: ItemSlot[];
    selectedRow: number;
    scrollOffset: number;
  } | null;
}

const menuActionIndicesField = [ACTION_USE, ACTION_GIVE, ACTION_EXIT];
const menuActionIndicesUnionRoom = [ACTION_GIVE, ACTION_EXIT];

const typeToCIndex: Record<DecompBattleMove['type'], number> = {
  normal: 0,
  fighting: 1,
  flying: 2,
  poison: 3,
  ground: 4,
  rock: 5,
  bug: 6,
  ghost: 7,
  steel: 8,
  fire: 10,
  water: 11,
  grass: 12,
  electric: 13,
  psychic: 14,
  ice: 15,
  dragon: 16,
  dark: 17
};

export const sMenuActionIndices_Field = menuActionIndicesField.slice();
export const sMenuActionIndices_UnionRoom = menuActionIndicesUnionRoom.slice();

export const createTMCaseRuntime = (overrides: Partial<TMCaseRuntime> = {}): TMCaseRuntime => ({
  staticResources: { menuType: TMCASE_FIELD, allowSelectClose: true, selectedRow: 0, scrollOffset: 0, exitCallback: null },
  dynamicResources: {
    maxTMsShown: 0,
    numTMs: 0,
    currItem: ITEM_NONE,
    menuActionIndices: [],
    numMenuActions: 0,
    seqId: 0,
    scrollArrowsTaskId: TASK_NONE,
    discSpriteId: DISC_HIDDEN,
    nextScreenCallback: null,
    contextMenuWindowId: WINDOW_NONE
  },
  task: { func: 'Task_HandleListInput', data: Array.from({ length: 16 }, () => 0) },
  slots: [],
  gSpecialVar_ItemId: ITEM_NONE,
  gItemUseCB: null,
  playerPartyCount: 0,
  money: 0,
  paletteFadeActive: false,
  overworldLinkBusy: false,
  linkActive: false,
  inUnionRoom: false,
  newKeys: 0,
  listInput: LIST_NOTHING_CHOSEN,
  contextInput: MENU_NOTHING_CHOSEN,
  quantityAdjustResult: 0,
  operations: [],
  playedSoundEffects: [],
  itemTransactions: [],
  mainState: 0,
  mainCallback2: null,
  vblankCallback: null,
  textFlagsAutoScroll: true,
  setupBlocked: false,
  listMenuItems: [],
  discSprite: null,
  textPrinterActive: false,
  teachyTvResumeMode: false,
  pokedudeBagBackup: null,
  ...overrides
});

const playSE = (runtime: TMCaseRuntime, soundEffect: number): void => {
  runtime.playedSoundEffects.push(soundEffect);
};

const op = (runtime: TMCaseRuntime, name: string): void => {
  runtime.operations.push(name);
};

const beginFadeOutFromTMCase = (runtime: TMCaseRuntime): void => {
  runtime.task.func = 'Task_FadeOutAndCloseTMCase';
  op(runtime, 'Task_BeginFadeOutFromTMCase');
};

export const ResetBufferPointers_NoFree = (runtime: TMCaseRuntime): void => {
  runtime.dynamicResources = {
    maxTMsShown: 0,
    numTMs: 0,
    currItem: ITEM_NONE,
    menuActionIndices: [],
    numMenuActions: 0,
    seqId: 0,
    scrollArrowsTaskId: TASK_NONE,
    discSpriteId: DISC_HIDDEN,
    nextScreenCallback: null,
    contextMenuWindowId: WINDOW_NONE
  };
  runtime.listMenuItems = [];
  runtime.discSprite = null;
  op(runtime, 'ResetBufferPointers_NoFree');
};

export const InitTMCase = (
  runtime: TMCaseRuntime,
  type: number,
  exitCallback: string | null,
  allowSelectClose: number | boolean
): void => {
  ResetBufferPointers_NoFree(runtime);
  if (type !== TMCASE_REOPENING)
    runtime.staticResources.menuType = type;
  if (exitCallback !== null)
    runtime.staticResources.exitCallback = exitCallback;
  if (exitCallback !== null)
    runtime.dynamicResources.nextScreenCallback = null;
  if (allowSelectClose !== TMCASE_KEEP_PREV)
    runtime.staticResources.allowSelectClose = allowSelectClose;
  runtime.textFlagsAutoScroll = false;
  runtime.mainCallback2 = 'CB2_SetUpTMCaseUI_Blocking';
  if (exitCallback !== null)
    op(runtime, `SetExitCallback:${exitCallback}`);
  op(runtime, 'SetMainCallback2:CB2_SetUpTMCaseUI_Blocking');
};

export const CB2_Idle = (runtime: TMCaseRuntime): void => {
  op(runtime, 'RunTasks');
  op(runtime, 'AnimateSprites');
  op(runtime, 'BuildOamBuffer');
  op(runtime, 'DoScheduledBgTilemapCopiesToVram');
  op(runtime, 'UpdatePaletteFade');
};

export const VBlankCB_Idle = (runtime: TMCaseRuntime): void => {
  op(runtime, 'LoadOam');
  op(runtime, 'ProcessSpriteCopyRequests');
  op(runtime, 'TransferPlttBuffer');
};

export const LoadBGTemplates = (runtime: TMCaseRuntime): void => {
  op(runtime, 'ResetAllBgsCoordinatesAndBgCntRegs');
  op(runtime, 'AllocZeroed:sTilemapBuffer:0x800');
  op(runtime, 'ResetBgsAndClearDma3BusyFlags');
  op(runtime, 'InitBgsFromTemplates');
  op(runtime, 'SetBgTilemapBuffer:2');
  op(runtime, 'ScheduleBgCopyTilemapToVram:1');
  op(runtime, 'ScheduleBgCopyTilemapToVram:2');
  op(runtime, 'SetGpuReg:DISPCNT');
  op(runtime, 'SetGpuReg:BLDCNT');
  op(runtime, 'ShowBg:0');
  op(runtime, 'ShowBg:1');
  op(runtime, 'ShowBg:2');
};

export const LoadDiscTypePalettes = (runtime: TMCaseRuntime): void => {
  op(runtime, `Alloc:sTMSpritePaletteBuffer:${NUM_DISC_COLORS}`);
  op(runtime, 'LZDecompressWram:gTMCaseDiscTypes1_Pal');
  op(runtime, 'LZDecompressWram:gTMCaseDiscTypes2_Pal');
  op(runtime, 'LoadSpritePalette:TAG_DISC');
};

export const HandleLoadTMCaseGraphicsAndPalettes = (runtime: TMCaseRuntime): boolean => {
  switch (runtime.dynamicResources.seqId ?? 0) {
    case 0:
      op(runtime, 'ResetTempTileDataBuffers');
      op(runtime, 'DecompressAndCopyTileDataToVram:gTMCase_Gfx');
      runtime.dynamicResources.seqId = 1;
      break;
    case 1:
      op(runtime, 'FreeTempTileDataBuffersIfPossible');
      op(runtime, 'LZDecompressWram:gTMCaseMenu_Tilemap');
      runtime.dynamicResources.seqId = 2;
      break;
    case 2:
      op(runtime, 'LZDecompressWram:gTMCase_Tilemap');
      runtime.dynamicResources.seqId = 3;
      break;
    case 3:
      op(runtime, 'LoadCompressedPalette:gTMCaseMenu_Pal');
      runtime.dynamicResources.seqId = 4;
      break;
    case 4:
      op(runtime, 'LoadCompressedSpriteSheet:sSpriteSheet_Disc');
      runtime.dynamicResources.seqId = 5;
      break;
    default:
      LoadDiscTypePalettes(runtime);
      runtime.dynamicResources.seqId = 0;
      return true;
  }

  return false;
};

const bagGetItemIdByPocketPosition = (runtime: TMCaseRuntime, index: number): number =>
  runtime.slots[index]?.itemId ?? ITEM_NONE;

const bagGetQuantityByPocketPosition = (runtime: TMCaseRuntime, index: number): number =>
  runtime.slots[index]?.quantity ?? 0;

export const sTMSpritePaletteOffsetByType: number[] = (() => {
  const offsets = Array.from({ length: NUMBER_OF_MON_TYPES }, () => 0);
  offsets[0] = 0x000;
  offsets[10] = 0x010;
  offsets[11] = 0x020;
  offsets[12] = 0x030;
  offsets[13] = 0x040;
  offsets[5] = 0x050;
  offsets[4] = 0x060;
  offsets[15] = 0x070;
  offsets[2] = 0x080;
  offsets[1] = 0x090;
  offsets[7] = 0x0a0;
  offsets[6] = 0x0b0;
  offsets[3] = 0x0c0;
  offsets[14] = 0x0d0;
  offsets[8] = 0x0e0;
  offsets[17] = 0x0f0;
  offsets[16] = 0x100;
  return offsets;
})();

export const isTMCaseHM = (itemId: number): boolean => ItemId_GetImportance(itemId) !== 0;

const normalizeItemMoveId = (moveId: string): string => {
  if (moveId.startsWith('MOVE_')) return moveId;
  return `MOVE_${moveId.replace(/([a-z0-9])([A-Z])/gu, '$1_$2').toUpperCase()}`;
};

export const ItemIdToBattleMoveId = (itemId: number): string | null =>
  gItems[itemId]?.moveId ? normalizeItemMoveId(gItems[itemId].moveId) : null;

const decimalStringN = (
  value: number,
  mode: 'leadingZeros' | 'rightAlign' | 'leftAlign',
  width: number
): string => {
  const text = String(Math.trunc(value));
  if (mode === 'leadingZeros') return text.padStart(width, '0').slice(-width);
  if (mode === 'rightAlign') return text.padStart(width, ' ');
  return text.padEnd(width, ' ');
};

export const GetTMNumberAndMoveString = (itemId: number): string => {
  const moveId = ItemIdToBattleMoveId(itemId);
  const moveName = moveId ? getMoveName(moveId) ?? moveId.replace(/^MOVE_/u, '') : '';

  if (itemId >= ITEM_HM01) {
    return `${gText_FontSmall}{CLEAR_TO 18}${gText_NumberClear01}${decimalStringN(
      itemId - ITEM_HM01 + 1,
      'leadingZeros',
      1
    )} ${gText_FontNormal}${moveName}`;
  }

  return `${gText_FontSmall}${gText_NumberClear01}${decimalStringN(
    itemId - ITEM_TM01 + 1,
    'leadingZeros',
    2
  )} ${gText_FontNormal}${moveName}`;
};

export const compactTMCaseSlots = (slots: ItemSlot[], capacity = slots.length): ItemSlot[] => {
  const compacted = slots
    .slice(0, capacity)
    .filter((slot) => slot.itemId !== ITEM_NONE && slot.quantity !== 0)
    .map((slot) => ({ ...slot }));
  while (compacted.length < capacity) {
    compacted.push({ itemId: ITEM_NONE, quantity: 0 });
  }
  return compacted;
};

export const TMCaseSetup_GetTMCount = (
  slots: ItemSlot[],
  capacity = BAG_TMHM_COUNT
): { slots: ItemSlot[]; numTMs: number; maxTMsShown: number } => {
  const compacted = compactTMCaseSlots(slots, capacity);
  let numTMs = 0;
  for (let i = 0; i < capacity; i += 1) {
    if ((compacted[i]?.itemId ?? ITEM_NONE) === ITEM_NONE) break;
    numTMs += 1;
  }
  return {
    slots: compacted,
    numTMs,
    maxTMsShown: Math.min(numTMs + 1, 5)
  };
};

export const TMCaseSetup_InitListMenuPositions = (
  staticResources: TMCaseStaticResources,
  dynamicResources: Pick<TMCaseDynamicResources, 'numTMs' | 'maxTMsShown'>
): TMCaseStaticResources => {
  const next = { ...staticResources };
  if (next.scrollOffset !== 0) {
    if (next.scrollOffset + dynamicResources.maxTMsShown > dynamicResources.numTMs + 1) {
      next.scrollOffset = dynamicResources.numTMs + 1 - dynamicResources.maxTMsShown;
    }
  }
  if (next.scrollOffset + next.selectedRow >= dynamicResources.numTMs + 1) {
    if (dynamicResources.numTMs + 1 < 2) {
      next.selectedRow = 0;
    } else {
      next.selectedRow = dynamicResources.numTMs;
    }
  }
  return next;
};

export const TMCaseSetup_UpdateVisualMenuOffset = (
  staticResources: TMCaseStaticResources,
  dynamicResources: Pick<TMCaseDynamicResources, 'numTMs' | 'maxTMsShown'>
): TMCaseStaticResources => {
  const next = { ...staticResources };
  if (next.selectedRow > 3) {
    for (
      let i = 0;
      i <= next.selectedRow - 3 && next.scrollOffset + dynamicResources.maxTMsShown !== dynamicResources.numTMs + 1;
      i += 1
    ) {
      next.selectedRow -= 1;
      next.scrollOffset += 1;
    }
  }
  return next;
};

export const InitTMCaseListMenuItems = (slots: ItemSlot[], numTMs: number): TMCaseListMenuItem[] => {
  const items: TMCaseListMenuItem[] = [];
  for (let i = 0; i < numTMs; i += 1) {
    items.push({
      label: GetTMNumberAndMoveString(slots[i]?.itemId ?? ITEM_NONE),
      index: i
    });
  }
  items.push({ label: 'Close', index: LIST_CANCEL });
  return items;
};

export const CreateTMCaseListMenuBuffers = (runtime: TMCaseRuntime): void => {
  op(runtime, `Alloc:sListMenuItemsBuffer:${runtime.dynamicResources.numTMs + 1}`);
  op(runtime, `Alloc:sListMenuStringsBuffer:${runtime.dynamicResources.numTMs}`);
};

export const InitTMCaseListMenuItemsForRuntime = (runtime: TMCaseRuntime): void => {
  runtime.listMenuItems = InitTMCaseListMenuItems(runtime.slots, runtime.dynamicResources.numTMs);
  op(runtime, 'InitTMCaseListMenuItems');
};

export const List_MoveCursorFunc = (runtime: TMCaseRuntime, itemIndex: number, onInit: boolean): void => {
  const itemId = itemIndex === LIST_CANCEL ? ITEM_NONE : bagGetItemIdByPocketPosition(runtime, itemIndex);
  if (onInit !== true) {
    playSE(runtime, SE_SELECT);
    if (runtime.discSprite !== null)
      runtime.discSprite = SwapDisc(runtime.discSprite, itemId);
    op(runtime, `SwapDisc:${itemId}`);
  }
  op(runtime, `PrintDescription:${PrintDescription(runtime.slots, itemIndex)}`);
  op(runtime, `PrintMoveInfo:${itemId}`);
};

export const List_ItemPrintFunc = (slots: ItemSlot[], itemIndex: number): string | null => {
  if (itemIndex === LIST_CANCEL) return null;
  const slot = slots[itemIndex];
  if (!slot) return null;
  if (!isTMCaseHM(slot.itemId)) {
    return gText_TimesStrVar1.replace('{STR_VAR_1}', decimalStringN(slot.quantity, 'rightAlign', 3));
  }
  return 'HM_TILE';
};

export const PrintDescription = (slots: ItemSlot[], itemIndex: number): string =>
  itemIndex !== LIST_CANCEL
    ? ItemId_GetDescription(slots[itemIndex]?.itemId ?? ITEM_NONE)
    : gText_TMCaseWillBePutAway;

export const PrintMoveInfo = (itemId: number): TMCaseMoveInfo => {
  const moveId = ItemIdToBattleMoveId(itemId);
  const move = moveId ? getDecompBattleMove(moveId) : null;
  if (itemId === ITEM_NONE || !move) {
    return {
      itemId,
      moveId: null,
      typeIcon: null,
      power: gText_ThreeHyphens,
      accuracy: gText_ThreeHyphens,
      pp: gText_ThreeHyphens
    };
  }

  return {
    itemId,
    moveId,
    typeIcon: typeToCIndex[move.type] + 1,
    power: move.power < 2 ? gText_ThreeHyphens : decimalStringN(move.power, 'rightAlign', 3),
    accuracy: move.accuracy === 0 ? gText_ThreeHyphens : decimalStringN(move.accuracy, 'rightAlign', 3),
    pp: decimalStringN(move.pp, 'rightAlign', 3)
  };
};

export const InitWindowTemplatesAndPals = (runtime: TMCaseRuntime): void => {
  op(runtime, 'InitWindows:sWindowTemplates');
  op(runtime, 'DeactivateAllTextPrinters');
  op(runtime, 'LoadUserWindowGfx');
  op(runtime, 'LoadMenuMessageWindowGfx');
  op(runtime, 'LoadStdWindowGfx');
  op(runtime, 'LoadPalette:gStandardMenuPalette:15');
  op(runtime, 'LoadPalette:gStandardMenuPalette:10');
  op(runtime, 'LoadPalette:sPal3Override:15');
  op(runtime, 'LoadPalette:sPal3Override:13');
  op(runtime, 'ListMenuLoadStdPalAt:12');
  for (let i = 0; i < 9; i += 1)
    op(runtime, `FillWindowPixelBuffer:${i}`);
  op(runtime, 'PutWindowTilemap:WIN_LIST');
  op(runtime, 'PutWindowTilemap:WIN_DESCRIPTION');
  op(runtime, 'PutWindowTilemap:WIN_TITLE');
  op(runtime, 'PutWindowTilemap:WIN_MOVE_INFO_LABELS');
  op(runtime, 'PutWindowTilemap:WIN_MOVE_INFO');
  op(runtime, 'ScheduleBgCopyTilemapToVram:0');
};

export const TMCase_Print = (
  runtime: TMCaseRuntime,
  windowId: number,
  fontId: number | string,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
  lineSpacing: number,
  speed: number,
  colorIdx: number
): void => {
  op(runtime, `TMCase_Print:${windowId}:${fontId}:${text}:${x}:${y}:${letterSpacing}:${lineSpacing}:${speed}:${colorIdx}`);
};

export const TMCase_SetWindowBorder1 = (runtime: TMCaseRuntime, windowId: number): void => {
  op(runtime, `TMCase_SetWindowBorder1:${windowId}`);
};

export const TMCase_SetWindowBorder2 = (runtime: TMCaseRuntime, windowId: number): void => {
  op(runtime, `TMCase_SetWindowBorder2:${windowId}`);
};

export const PrintMessageWithFollowupTask = (
  runtime: TMCaseRuntime,
  fontId: number | string,
  text: string,
  func: string | null
): void => {
  op(runtime, `PrintMessageWithFollowupTask:${fontId}:${text}:${func ?? 'NULL'}`);
  runtime.textPrinterActive = true;
  if (func !== null)
    runtime.task.func = func;
  op(runtime, 'ScheduleBgCopyTilemapToVram:1');
};

export const PrintTitle = (runtime: TMCaseRuntime): void => {
  op(runtime, 'PrintTitle:TM CASE');
};

export const DrawMoveInfoLabels = (runtime: TMCaseRuntime): void => {
  op(runtime, 'BlitMenuInfoIcon:TYPE');
  op(runtime, 'BlitMenuInfoIcon:POWER');
  op(runtime, 'BlitMenuInfoIcon:ACCURACY');
  op(runtime, 'BlitMenuInfoIcon:PP');
  op(runtime, 'CopyWindowToVram:WIN_MOVE_INFO_LABELS');
};

export const SetDescriptionWindowShade = (runtime: TMCaseRuntime, shade: number): void => {
  op(runtime, `SetDescriptionWindowShade:${shade}`);
  op(runtime, 'ScheduleBgCopyTilemapToVram:2');
};

export const PrintListCursorAtRow = (runtime: TMCaseRuntime, y: number, colorIdx: number): void => {
  if (colorIdx === COLOR_CURSOR_ERASE) {
    op(runtime, `EraseListCursorAtRow:${y}`);
    op(runtime, 'CopyWindowToVram:WIN_LIST');
  } else {
    TMCase_Print(runtime, WIN_LIST, 'FONT_NORMAL', 'gText_SelectorArrow2', 0, y, 0, 0, 0, colorIdx);
  }
};

export const PrintListCursor = (runtime: TMCaseRuntime, colorIdx: number): void => {
  PrintListCursorAtRow(runtime, runtime.staticResources.selectedRow * 16 + 2, colorIdx);
};

export const PlaceHMTileInWindow = (runtime: TMCaseRuntime, windowId: number, x: number, y: number): void => {
  op(runtime, `PlaceHMTileInWindow:${windowId}:${x}:${y}`);
};

export const PrintPlayersMoney = (runtime: TMCaseRuntime): void => {
  op(runtime, `PrintPlayersMoney:${runtime.money}`);
};

export const HandleCreateYesNoMenu = (runtime: TMCaseRuntime): void => {
  op(runtime, 'CreateYesNoMenuWithCallbacks:sYesNoFuncTable');
};

export const AddContextMenu = (runtime: TMCaseRuntime, windowIndex: number): number => {
  if (runtime.dynamicResources.contextMenuWindowId === WINDOW_NONE) {
    runtime.dynamicResources.contextMenuWindowId = windowIndex;
    TMCase_SetWindowBorder1(runtime, windowIndex);
    op(runtime, 'ScheduleBgCopyTilemapToVram:0');
  }
  return runtime.dynamicResources.contextMenuWindowId;
};

export const RemoveContextMenu = (runtime: TMCaseRuntime): void => {
  op(runtime, 'RemoveContextMenu');
  runtime.dynamicResources.contextMenuWindowId = WINDOW_NONE;
};

export const CreateListScrollArrows = (runtime: TMCaseRuntime): void => {
  runtime.dynamicResources.scrollArrowsTaskId = 0;
  op(runtime, `CreateListScrollArrows:${runtime.dynamicResources.numTMs - runtime.dynamicResources.maxTMsShown + 1}`);
};

export const CreateQuantityScrollArrows = (runtime: TMCaseRuntime): void => {
  runtime.dynamicResources.currItem = 1;
  runtime.dynamicResources.scrollArrowsTaskId = 0;
  op(runtime, 'CreateQuantityScrollArrows');
};

export const RemoveScrollArrows = (runtime: TMCaseRuntime): void => {
  if (runtime.dynamicResources.scrollArrowsTaskId !== TASK_NONE) {
    op(runtime, 'RemoveScrollArrows');
    runtime.dynamicResources.scrollArrowsTaskId = TASK_NONE;
  }
};

export const ResetTMCaseCursorPos = (runtime: TMCaseRuntime): void => {
  runtime.staticResources.selectedRow = 0;
  runtime.staticResources.scrollOffset = 0;
};

export const DestroyTMCaseBuffers = (runtime: TMCaseRuntime): void => {
  op(runtime, 'DestroyTMCaseBuffers');
  runtime.listMenuItems = [];
  runtime.discSprite = null;
};

export const Task_BeginFadeOutFromTMCase = beginFadeOutFromTMCase;

export const Task_FadeOutAndCloseTMCase = (runtime: TMCaseRuntime): void => {
  if (!runtime.paletteFadeActive) {
    op(runtime, 'DestroyListMenuTask');
    runtime.mainCallback2 = runtime.dynamicResources.nextScreenCallback ?? runtime.staticResources.exitCallback ?? runtime.mainCallback2;
    if (runtime.mainCallback2 !== null)
      op(runtime, `SetMainCallback2:${runtime.mainCallback2}`);
    RemoveScrollArrows(runtime);
    DestroyTMCaseBuffers(runtime);
    op(runtime, 'DestroyTask');
  }
};

export const selectTMCaseMenuActionIndices = (linkActive: boolean, inUnionRoom: boolean): number[] =>
  !linkActive && !inUnionRoom ? menuActionIndicesField.slice() : menuActionIndicesUnionRoom.slice();

export const calculateTmSaleAmount = (itemId: number, quantity: number): number =>
  Math.trunc(ItemId_GetPrice(itemId) / 2) * quantity;

export const clampTMCaseSaleQuantityOwned = (quantityOwned: number): number =>
  quantityOwned > 99 ? 99 : quantityOwned;

export const SetDiscSpriteAnim = (tmIdx: number): number =>
  tmIdx >= NUM_TECHNICAL_MACHINES ? ANIM_HM : ANIM_TM;

export const SetDiscSpritePosition = (tmIdx: number): Pick<TMCaseDiscSprite, 'x' | 'y' | 'y2'> => {
  if (tmIdx === DISC_HIDDEN) {
    return {
      x: 27,
      y: 54,
      y2: DISC_CASE_DISTANCE
    };
  }

  const normalizedTmIdx = tmIdx >= NUM_TECHNICAL_MACHINES
    ? tmIdx - NUM_TECHNICAL_MACHINES
    : tmIdx + NUM_HIDDEN_MACHINES;
  return {
    x: DISC_BASE_X - Math.trunc((14 * normalizedTmIdx) / (NUM_TECHNICAL_MACHINES + NUM_HIDDEN_MACHINES)),
    y: DISC_BASE_Y + Math.trunc((8 * normalizedTmIdx) / (NUM_TECHNICAL_MACHINES + NUM_HIDDEN_MACHINES)),
    y2: 0
  };
};

export const CreateDiscSprite = (itemId: number): TMCaseDiscSprite => {
  if (itemId === ITEM_NONE) {
    return {
      ...SetDiscSpritePosition(DISC_HIDDEN),
      anim: ANIM_TM,
      itemId,
      state: 0,
      callback: 'dummy'
    };
  }
  const tmIdx = itemId - ITEM_TM01;
  return {
    ...SetDiscSpritePosition(tmIdx),
    anim: SetDiscSpriteAnim(tmIdx),
    itemId,
    state: 0,
    callback: 'dummy'
  };
};

export const TintDiscpriteByType = (runtime: TMCaseRuntime, type: number): void => {
  op(runtime, `TintDiscpriteByType:${type}`);
  if (runtime.staticResources.menuType === TMCASE_POKEDUDE)
    op(runtime, 'BlendPalettes:Disc:4:RGB_BLACK');
};

export const DoSetUpTMCaseUI = (runtime: TMCaseRuntime): boolean => {
  switch (runtime.mainState) {
    case 0:
      runtime.vblankCallback = null;
      op(runtime, 'SetVBlankHBlankCallbacksToNull');
      op(runtime, 'ClearScheduledBgCopiesToVram');
      runtime.mainState++;
      break;
    case 1:
      op(runtime, 'ScanlineEffect_Stop');
      runtime.mainState++;
      break;
    case 2:
      op(runtime, 'FreeAllSpritePalettes');
      runtime.mainState++;
      break;
    case 3:
      op(runtime, 'ResetPaletteFade');
      runtime.mainState++;
      break;
    case 4:
      op(runtime, 'ResetSpriteData');
      runtime.mainState++;
      break;
    case 5:
      op(runtime, 'ResetTasks');
      runtime.mainState++;
      break;
    case 6:
      LoadBGTemplates(runtime);
      runtime.dynamicResources.seqId = 0;
      runtime.mainState++;
      break;
    case 7:
      InitWindowTemplatesAndPals(runtime);
      runtime.mainState++;
      break;
    case 8:
      if (HandleLoadTMCaseGraphicsAndPalettes(runtime))
        runtime.mainState++;
      break;
    case 9:
      runtime.slots = compactTMCaseSlots(runtime.slots, runtime.slots.length);
      op(runtime, 'SortPocketAndPlaceHMsFirst');
      runtime.mainState++;
      break;
    case 10: {
      const setup = TMCaseSetup_GetTMCount(runtime.slots, runtime.slots.length);
      runtime.slots = setup.slots;
      runtime.dynamicResources.numTMs = setup.numTMs;
      runtime.dynamicResources.maxTMsShown = setup.maxTMsShown;
      runtime.staticResources = TMCaseSetup_InitListMenuPositions(runtime.staticResources, runtime.dynamicResources);
      runtime.staticResources = TMCaseSetup_UpdateVisualMenuOffset(runtime.staticResources, runtime.dynamicResources);
      runtime.mainState++;
      break;
    }
    case 11:
      DrawMoveInfoLabels(runtime);
      runtime.mainState++;
      break;
    case 12:
      CreateTMCaseListMenuBuffers(runtime);
      InitTMCaseListMenuItemsForRuntime(runtime);
      runtime.mainState++;
      break;
    case 13:
      PrintTitle(runtime);
      runtime.mainState++;
      break;
    case 14:
      runtime.task.func = runtime.staticResources.menuType === TMCASE_POKEDUDE ? 'Task_Pokedude_Start' : 'Task_HandleListInput';
      runtime.task.data[0] = 0;
      op(runtime, `ListMenuInit:${runtime.staticResources.scrollOffset}:${runtime.staticResources.selectedRow}`);
      runtime.mainState++;
      break;
    case 15:
      CreateListScrollArrows(runtime);
      runtime.mainState++;
      break;
    case 16:
      runtime.dynamicResources.discSpriteId = 0;
      runtime.discSprite = CreateDiscSprite(bagGetItemIdByPocketPosition(
        runtime,
        runtime.staticResources.scrollOffset + runtime.staticResources.selectedRow
      ));
      runtime.mainState++;
      break;
    case 17:
      op(runtime, 'BlendPalettes:PALETTES_ALL:16:0');
      runtime.mainState++;
      break;
    case 18:
      op(runtime, 'BeginNormalPaletteFade:PALETTES_ALL:16:0:RGB_BLACK');
      runtime.mainState++;
      break;
    default:
      runtime.vblankCallback = 'VBlankCB_Idle';
      runtime.mainCallback2 = 'CB2_Idle';
      op(runtime, 'SetVBlankCallback:VBlankCB_Idle');
      op(runtime, 'SetMainCallback2:CB2_Idle');
      return true;
  }

  return false;
};

export const CB2_SetUpTMCaseUI_Blocking = (runtime: TMCaseRuntime): void => {
  while (true) {
    if (runtime.overworldLinkBusy === true) {
      runtime.setupBlocked = true;
      break;
    }
    if (DoSetUpTMCaseUI(runtime))
      break;
    if (runtime.linkActive === true) {
      runtime.setupBlocked = true;
      break;
    }
  }
};

export const SwapDisc = (sprite: TMCaseDiscSprite, itemId: number): TMCaseDiscSprite => ({
  ...sprite,
  itemId,
  state: 0,
  callback: 'swap'
});

export const SpriteCB_SwapDisc = (sprite: TMCaseDiscSprite): TMCaseDiscSprite => {
  if (sprite.state === 0) {
    if (sprite.y2 >= DISC_CASE_DISTANCE) {
      if (sprite.itemId !== ITEM_NONE) {
        const tmIdx = sprite.itemId - ITEM_TM01;
        return {
          ...sprite,
          ...SetDiscSpritePosition(tmIdx),
          anim: SetDiscSpriteAnim(tmIdx),
          itemId: tmIdx,
          state: 1
        };
      }
      return { ...sprite, callback: 'dummy' };
    }
    return { ...sprite, y2: sprite.y2 + DISC_Y_MOVE };
  }

  if (sprite.state === 1) {
    if (sprite.y2 <= 0) {
      return { ...sprite, callback: 'dummy' };
    }
    return { ...sprite, y2: sprite.y2 - DISC_Y_MOVE };
  }

  return sprite;
};

export const getTMCasePocketIndex = (): number => POCKET_TM_CASE - 1;

export const Task_HandleListInput = (runtime: TMCaseRuntime): void => {
  if (!runtime.paletteFadeActive) {
    if (runtime.overworldLinkBusy !== true) {
      const input = runtime.listInput;
      if ((runtime.newKeys & SELECT_BUTTON) !== 0 && runtime.staticResources.allowSelectClose === true) {
        playSE(runtime, SE_SELECT);
        runtime.gSpecialVar_ItemId = ITEM_NONE;
        beginFadeOutFromTMCase(runtime);
      } else {
        switch (input) {
          case LIST_NOTHING_CHOSEN:
            break;
          case LIST_CANCEL:
            playSE(runtime, SE_SELECT);
            runtime.gSpecialVar_ItemId = ITEM_NONE;
            beginFadeOutFromTMCase(runtime);
            break;
          default:
            playSE(runtime, SE_SELECT);
            op(runtime, 'SetDescriptionWindowShade:1');
            op(runtime, 'RemoveScrollArrows');
            op(runtime, 'PrintListCursor:COLOR_CURSOR_SELECTED');
            runtime.task.data[1] = input;
            runtime.task.data[2] = bagGetQuantityByPocketPosition(runtime, input);
            runtime.gSpecialVar_ItemId = bagGetItemIdByPocketPosition(runtime, input);
            runtime.task.func = ['Task_SelectedTMHM_Field', 'Task_SelectedTMHM_GiveParty', 'Task_SelectedTMHM_Sell', 'Task_SelectedTMHM_GivePC'][runtime.staticResources.menuType] ?? 'Task_SelectedTMHM_Field';
            break;
        }
      }
    }
  }
};

export const ReturnToList = (runtime: TMCaseRuntime): void => {
  op(runtime, 'SetDescriptionWindowShade:0');
  op(runtime, 'CreateListScrollArrows');
  runtime.task.func = 'Task_HandleListInput';
};

export const Task_SelectedTMHM_Field = (runtime: TMCaseRuntime): void => {
  op(runtime, 'TMCase_SetWindowBorder2:WIN_SELECTED_MSG');
  runtime.dynamicResources.menuActionIndices = selectTMCaseMenuActionIndices(runtime.linkActive, runtime.inUnionRoom);
  runtime.dynamicResources.numMenuActions = runtime.dynamicResources.menuActionIndices.length;
  runtime.dynamicResources.contextMenuWindowId =
    runtime.dynamicResources.numMenuActions === menuActionIndicesField.length ? 0 : 1;
  op(runtime, `AddContextMenu:${runtime.dynamicResources.contextMenuWindowId}`);
  op(runtime, `Selected:${GetTMNumberAndMoveString(runtime.gSpecialVar_ItemId)}`);
  if (isTMCaseHM(runtime.gSpecialVar_ItemId))
    op(runtime, 'PlaceHMTileInWindow');
  runtime.task.func = 'Task_ContextMenu_HandleInput';
};

export const Task_ContextMenu_HandleInput = (runtime: TMCaseRuntime): void => {
  if (runtime.overworldLinkBusy !== true) {
    const input = runtime.contextInput;
    switch (input) {
      case MENU_B_PRESSED:
        playSE(runtime, SE_SELECT);
        runTMCaseAction(runtime, runtime.dynamicResources.menuActionIndices[runtime.dynamicResources.numMenuActions - 1]);
        break;
      case MENU_NOTHING_CHOSEN:
        break;
      default:
        playSE(runtime, SE_SELECT);
        runTMCaseAction(runtime, runtime.dynamicResources.menuActionIndices[input]);
        break;
    }
  }
};

export const runTMCaseAction = (runtime: TMCaseRuntime, action: number): void => {
  switch (action) {
    case ACTION_USE:
      Action_Use(runtime);
      break;
    case ACTION_GIVE:
      Action_Give(runtime);
      break;
    case ACTION_EXIT:
      Action_Exit(runtime);
      break;
  }
};

export const Action_Use = (runtime: TMCaseRuntime): void => {
  op(runtime, 'RemoveContextMenu');
  if (runtime.playerPartyCount === 0) {
    PrintError_ThereIsNoPokemon(runtime);
  } else {
    runtime.gItemUseCB = 'ItemUseCB_TMHM';
    runtime.dynamicResources.nextScreenCallback = 'CB2_ShowPartyMenuForItemUse';
    beginFadeOutFromTMCase(runtime);
  }
};

export const Action_Give = (runtime: TMCaseRuntime): void => {
  const itemId = bagGetItemIdByPocketPosition(runtime, runtime.task.data[1]);
  op(runtime, 'RemoveContextMenu');
  if (!isTMCaseHM(itemId)) {
    if (runtime.playerPartyCount === 0)
      PrintError_ThereIsNoPokemon(runtime);
    else {
      runtime.dynamicResources.nextScreenCallback = 'CB2_ChooseMonToGiveItem';
      beginFadeOutFromTMCase(runtime);
    }
  } else {
    PrintError_ItemCantBeHeld(runtime);
  }
};

export const PrintError_ThereIsNoPokemon = (runtime: TMCaseRuntime): void => {
  op(runtime, 'PrintError_ThereIsNoPokemon');
  runtime.task.func = 'Task_WaitButtonAfterErrorPrint';
};

export const PrintError_ItemCantBeHeld = (runtime: TMCaseRuntime): void => {
  op(runtime, 'PrintError_ItemCantBeHeld');
  runtime.task.func = 'Task_WaitButtonAfterErrorPrint';
};

export const Task_WaitButtonAfterErrorPrint = (runtime: TMCaseRuntime): void => {
  if ((runtime.newKeys & A_BUTTON) !== 0) {
    playSE(runtime, SE_SELECT);
    CloseMessageAndReturnToList(runtime);
  }
};

export const CloseMessageAndReturnToList = (runtime: TMCaseRuntime): void => {
  op(runtime, 'DestroyListMenuTask');
  op(runtime, 'ListMenuInit');
  op(runtime, 'PrintListCursor:COLOR_DARK');
  ReturnToList(runtime);
};

export const Action_Exit = (runtime: TMCaseRuntime): void => {
  op(runtime, 'RemoveContextMenu');
  op(runtime, 'PrintListCursor:COLOR_DARK');
  ReturnToList(runtime);
};

export const Task_SelectedTMHM_GiveParty = (runtime: TMCaseRuntime): void => {
  if (!isTMCaseHM(bagGetItemIdByPocketPosition(runtime, runtime.task.data[1]))) {
    runtime.dynamicResources.nextScreenCallback = 'CB2_GiveHoldItem';
    beginFadeOutFromTMCase(runtime);
  } else {
    PrintError_ItemCantBeHeld(runtime);
  }
};

export const Task_SelectedTMHM_GivePC = (runtime: TMCaseRuntime): void => {
  if (!isTMCaseHM(bagGetItemIdByPocketPosition(runtime, runtime.task.data[1]))) {
    runtime.dynamicResources.nextScreenCallback = 'CB2_ReturnToPokeStorage';
    beginFadeOutFromTMCase(runtime);
  } else {
    PrintError_ItemCantBeHeld(runtime);
  }
};

export const Task_SelectedTMHM_Sell = (runtime: TMCaseRuntime): void => {
  if (ItemId_GetPrice(runtime.gSpecialVar_ItemId) === 0) {
    op(runtime, 'PrintMessage:OhNoICantBuyThat');
    runtime.task.func = 'CloseMessageAndReturnToList';
  } else {
    runtime.task.data[8] = 1;
    if (runtime.task.data[2] === 1) {
      op(runtime, 'PrintPlayersMoney');
      Task_AskConfirmSaleWithAmount(runtime);
    } else {
      if (runtime.task.data[2] > 99)
        runtime.task.data[2] = 99;
      op(runtime, 'PrintMessage:HowManyWouldYouLikeToSell');
      runtime.task.func = 'Task_InitQuantitySelectUI';
    }
  }
};

export const Task_AskConfirmSaleWithAmount = (runtime: TMCaseRuntime): void => {
  const amount = calculateTmSaleAmount(bagGetItemIdByPocketPosition(runtime, runtime.task.data[1]), runtime.task.data[8]);
  op(runtime, `PrintMessage:ICanPayThisMuch:${amount}`);
  runtime.task.func = 'Task_PlaceYesNoBox';
};

export const Task_PlaceYesNoBox = (runtime: TMCaseRuntime): void => {
  HandleCreateYesNoMenu(runtime);
};

export const Task_SaleOfTMsCanceled = (runtime: TMCaseRuntime): void => {
  op(runtime, 'ClearSaleWindows');
  op(runtime, 'PrintListCursor:COLOR_DARK');
  ReturnToList(runtime);
};

export const Task_InitQuantitySelectUI = (runtime: TMCaseRuntime): void => {
  op(runtime, 'TMCase_SetWindowBorder1:WIN_SELL_QUANTITY');
  SellTM_PrintQuantityAndSalePrice(runtime, 1, calculateTmSaleAmount(bagGetItemIdByPocketPosition(runtime, runtime.task.data[1]), runtime.task.data[8]));
  op(runtime, 'PrintPlayersMoney');
  op(runtime, 'CreateQuantityScrollArrows');
  runtime.task.func = 'Task_QuantitySelect_HandleInput';
};

export const SellTM_PrintQuantityAndSalePrice = (runtime: TMCaseRuntime, quantity: number, amount: number): void => {
  op(runtime, `SellTM_PrintQuantityAndSalePrice:${decimalStringN(quantity, 'leadingZeros', 2)}:${amount}`);
};

export const Task_QuantitySelect_HandleInput = (runtime: TMCaseRuntime): void => {
  if (runtime.quantityAdjustResult === 1) {
    SellTM_PrintQuantityAndSalePrice(runtime, runtime.task.data[8], calculateTmSaleAmount(bagGetItemIdByPocketPosition(runtime, runtime.task.data[1]), runtime.task.data[8]));
  } else if ((runtime.newKeys & A_BUTTON) !== 0) {
    playSE(runtime, SE_SELECT);
    op(runtime, 'ClearQuantityWindow');
    op(runtime, 'RemoveScrollArrows');
    Task_AskConfirmSaleWithAmount(runtime);
  } else if ((runtime.newKeys & B_BUTTON) !== 0) {
    playSE(runtime, SE_SELECT);
    op(runtime, 'ClearQuantityMoneyMessageWindows');
    op(runtime, 'RemoveScrollArrows');
    op(runtime, 'PrintListCursor:COLOR_DARK');
    ReturnToList(runtime);
  }
};

export const Task_PrintSaleConfirmedText = (runtime: TMCaseRuntime): void => {
  const amount = calculateTmSaleAmount(bagGetItemIdByPocketPosition(runtime, runtime.task.data[1]), runtime.task.data[8]);
  op(runtime, `PrintMessage:TurnedOverItemsWorthYen:${amount}`);
  runtime.task.func = 'Task_DoSaleOfTMs';
};

export const Task_DoSaleOfTMs = (runtime: TMCaseRuntime): void => {
  const amount = calculateTmSaleAmount(runtime.gSpecialVar_ItemId, runtime.task.data[8]);
  playSE(runtime, SE_SHOP);
  const slot = runtime.slots[runtime.task.data[1]];
  if (slot)
    slot.quantity = Math.max(0, slot.quantity - runtime.task.data[8]);
  runtime.money += amount;
  runtime.itemTransactions.push({
    itemId: runtime.gSpecialVar_ItemId,
    quantity: runtime.task.data[8],
    type: QL_EVENT_SOLD_ITEM - QL_EVENT_USED_POKEMART
  });
  op(runtime, 'DestroyListMenuTask');
  const setup = TMCaseSetup_GetTMCount(runtime.slots, runtime.slots.length);
  runtime.slots = setup.slots;
  runtime.dynamicResources.numTMs = setup.numTMs;
  runtime.dynamicResources.maxTMsShown = setup.maxTMsShown;
  runtime.staticResources = TMCaseSetup_InitListMenuPositions(runtime.staticResources, runtime.dynamicResources);
  op(runtime, 'InitTMCaseListMenuItems');
  op(runtime, 'ListMenuInit');
  op(runtime, 'PrintListCursor:COLOR_CURSOR_SELECTED');
  runtime.task.func = 'Task_AfterSale_ReturnToList';
};

export const Task_AfterSale_ReturnToList = (runtime: TMCaseRuntime): void => {
  if ((runtime.newKeys & (A_BUTTON | B_BUTTON)) !== 0) {
    playSE(runtime, SE_SELECT);
    CloseMessageAndReturnToList(runtime);
  }
};

export const Pokedude_InitTMCase = (runtime: TMCaseRuntime): void => {
  runtime.pokedudeBagBackup = {
    slots: runtime.slots.map((slot) => ({ ...slot })),
    selectedRow: runtime.staticResources.selectedRow,
    scrollOffset: runtime.staticResources.scrollOffset
  };
  runtime.slots = [
    { itemId: ITEM_TM01, quantity: 1 },
    { itemId: ITEM_TM03, quantity: 1 },
    { itemId: ITEM_TM09, quantity: 1 },
    { itemId: ITEM_TM35, quantity: 1 }
  ];
  ResetTMCaseCursorPos(runtime);
  op(runtime, 'Pokedude_BackUpBag');
  op(runtime, 'Pokedude_ClearBag');
  op(runtime, 'Pokedude_AddBagItem:ITEM_TM01');
  op(runtime, 'Pokedude_AddBagItem:ITEM_TM03');
  op(runtime, 'Pokedude_AddBagItem:ITEM_TM09');
  op(runtime, 'Pokedude_AddBagItem:ITEM_TM35');
  InitTMCase(runtime, TMCASE_POKEDUDE, 'CB2_ReturnToTeachyTV', false);
};

export const Task_Pokedude_Start = (runtime: TMCaseRuntime): void => {
  if (!runtime.paletteFadeActive) {
    runtime.task.data[8] = 0;
    runtime.task.data[9] = 0;
    runtime.task.func = 'Task_Pokedude_Run';
  }
};

export const Task_Pokedude_Run = (runtime: TMCaseRuntime): void => {
  if ((runtime.newKeys & B_BUTTON) !== 0 && runtime.task.data[8] < 21) {
    runtime.task.data[8] = 21;
    runtime.teachyTvResumeMode = true;
    op(runtime, 'SetTeachyTvControllerModeToResume');
  }

  switch (runtime.task.data[8]) {
    case 0:
      op(runtime, 'BeginNormalPaletteFade:0xFFFF8405:4:0:6:0');
      op(runtime, 'SetDescriptionWindowShade:1');
      runtime.task.data[8]++;
      break;
    case 1:
    case 11:
      if (!runtime.paletteFadeActive) {
        runtime.task.data[9]++;
        if (runtime.task.data[9] > POKEDUDE_INPUT_DELAY) {
          runtime.task.data[9] = 0;
          runtime.task.data[8]++;
        }
      }
      break;
    case 2:
    case 3:
    case 4:
    case 12:
    case 13:
    case 14:
      if (runtime.task.data[9] === 0)
        op(runtime, 'ListMenu_ProcessInput:DPAD_DOWN');
      runtime.task.data[9]++;
      if (runtime.task.data[9] > POKEDUDE_INPUT_DELAY) {
        runtime.task.data[9] = 0;
        runtime.task.data[8]++;
      }
      break;
    case 5:
    case 6:
    case 7:
    case 15:
    case 16:
    case 17:
      if (runtime.task.data[9] === 0)
        op(runtime, 'ListMenu_ProcessInput:DPAD_UP');
      runtime.task.data[9]++;
      if (runtime.task.data[9] > POKEDUDE_INPUT_DELAY) {
        runtime.task.data[9] = 0;
        runtime.task.data[8]++;
      }
      break;
    case 8:
      op(runtime, 'SetDescriptionWindowShade:1');
      PrintMessageWithFollowupTask(runtime, 'FONT_MALE', 'gPokedudeText_TMTypes', null);
      runtime.task.func = 'Task_Pokedude_Run';
      runtime.task.data[8]++;
      break;
    case 9:
    case 19:
      op(runtime, 'RunTextPrinters');
      if (!runtime.textPrinterActive)
        runtime.task.data[8]++;
      break;
    case 10:
      if ((runtime.newKeys & (A_BUTTON | B_BUTTON)) !== 0) {
        op(runtime, 'SetDescriptionWindowShade:0');
        op(runtime, 'BeginNormalPaletteFade:0x00000400:0:6:0:0');
        op(runtime, 'ClearDialogWindowAndFrameToTransparent:WIN_MESSAGE');
        op(runtime, 'ScheduleBgCopyTilemapToVram:1');
        runtime.task.data[8]++;
      }
      break;
    case 18:
      op(runtime, 'SetDescriptionWindowShade:1');
      PrintMessageWithFollowupTask(runtime, 'FONT_MALE', 'gPokedudeText_ReadTMDescription', null);
      runtime.task.func = 'Task_Pokedude_Run';
      runtime.task.data[8]++;
      break;
    case 20:
      if ((runtime.newKeys & (A_BUTTON | B_BUTTON)) !== 0)
        runtime.task.data[8]++;
      break;
    case 21:
      if (!runtime.paletteFadeActive) {
        if (runtime.pokedudeBagBackup !== null) {
          runtime.slots = runtime.pokedudeBagBackup.slots.map((slot) => ({ ...slot }));
          runtime.staticResources.selectedRow = runtime.pokedudeBagBackup.selectedRow;
          runtime.staticResources.scrollOffset = runtime.pokedudeBagBackup.scrollOffset;
          runtime.pokedudeBagBackup = null;
        }
        op(runtime, 'DestroyListMenuTask');
        op(runtime, 'CpuFastCopy:gPlttBufferFaded:gPlttBufferUnfaded');
        op(runtime, 'CB2_SetUpReshowBattleScreenAfterMenu');
        op(runtime, 'BeginNormalPaletteFade:PALETTES_ALL:-2:0:16:0');
        runtime.task.data[8]++;
      }
      break;
    default:
      if (!runtime.paletteFadeActive) {
        runtime.mainCallback2 = runtime.staticResources.exitCallback ?? runtime.dynamicResources.nextScreenCallback;
        if (runtime.mainCallback2 !== null)
          op(runtime, `SetMainCallback2:${runtime.mainCallback2}`);
        RemoveScrollArrows(runtime);
        DestroyTMCaseBuffers(runtime);
        op(runtime, 'DestroyTask');
      }
      break;
  }
};
