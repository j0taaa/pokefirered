import {
  ITEM_ENIGMA_BERRY,
  POCKET_BERRY_POUCH,
  POCKET_TM_CASE
} from './decompItem';
import {
  gText_BoxFull,
  gText_CantDismountBike,
  gText_CoinCase,
  gText_OakForbidsUseOfItemHere,
  gText_PlayedPokeFlute,
  gText_PlayedPokeFluteCatchy,
  gText_PokeFluteAwakenedMon,
  gText_PowderQty,
  gText_PlayerUsedVar2,
  gText_RepelEffectsLingered,
  gText_UsedVar2WildLured,
  gText_UsedVar2WildRepelled,
  gText_WontHaveEffect
} from './decompStrings';

export const ITEM_AWAKENING = 17;
export const ITEM_BLACK_FLUTE = 42;
export const ITEM_WHITE_FLUTE = 43;

export const ITEM_TYPE_PARTY_MENU = 1;
export const ITEM_TYPE_FIELD = 2;
export const ITEM_TYPE_UNUSED = 3;
export const ITEM_TYPE_BAG_MENU = 4;

export const FONT_NORMAL = 0;
export const FONT_MALE = 1;
export const VAR_REPEL_STEP_COUNT = 0x4020;
export const FLAG_SYS_ON_CYCLING_ROAD = 0x810;
export const FLAG_SYS_WHITE_FLUTE_ACTIVE = 0x834;
export const FLAG_SYS_BLACK_FLUTE_ACTIVE = 0x835;
export const PLAYER_AVATAR_FLAG_MACH_BIKE = 1 << 1;
export const PLAYER_AVATAR_FLAG_ACRO_BIKE = 1 << 2;
export const PLAYER_AVATAR_FLAG_SURFING = 1 << 3;
export const PLAYER_AVATAR_FLAG_UNDERWATER = 1 << 4;
export const MAP_TYPE_ROUTE = 1;
export const MAP_TYPE_TOWN = 2;
export const MAP_TYPE_CITY = 3;
export const MAP_GROUP_VIRIDIAN_FOREST = 1;
export const MAP_NUM_VIRIDIAN_FOREST = 0;
export const MAP_NUM_MT_EMBER_EXTERIOR = 1;
export const MAP_NUM_THREE_ISLAND_BERRY_FOREST = 2;
export const MAP_NUM_SIX_ISLAND_PATTERN_BUSH = 3;
export const BATTLE_TYPE_TRAINER = 1;
export const QL_EVENT_USED_ITEM = 1;

export const ITEM_EFFECT_X_ITEM = 0;
export const ITEM_EFFECT_RAISE_LEVEL = 1;
export const ITEM_EFFECT_HEAL_HP = 2;
export const ITEM_EFFECT_CURE_POISON = 3;
export const ITEM_EFFECT_CURE_SLEEP = 4;
export const ITEM_EFFECT_CURE_BURN = 5;
export const ITEM_EFFECT_CURE_FREEZE = 6;
export const ITEM_EFFECT_CURE_PARALYSIS = 7;
export const ITEM_EFFECT_CURE_CONFUSION = 8;
export const ITEM_EFFECT_CURE_INFATUATION = 9;
export const ITEM_EFFECT_SACRED_ASH = 10;
export const ITEM_EFFECT_CURE_ALL_STATUS = 11;
export const ITEM_EFFECT_ATK_EV = 12;
export const ITEM_EFFECT_HP_EV = 13;
export const ITEM_EFFECT_SPATK_EV = 14;
export const ITEM_EFFECT_SPDEF_EV = 15;
export const ITEM_EFFECT_SPEED_EV = 16;
export const ITEM_EFFECT_DEF_EV = 17;
export const ITEM_EFFECT_PP_UP = 19;
export const ITEM_EFFECT_PP_MAX = 20;
export const ITEM_EFFECT_HEAL_PP = 21;
export const ITEM_EFFECT_NONE = 22;

export const sUnused = [
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x13, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x40, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x04, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x43, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x21, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x40, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x40, 0x02, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x21, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x01, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x34, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x23, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x10, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x1f, 0x00, 0xe0, 0x03, 0x00, 0x7c, 0xff, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
] as const;

export type ItemUseTaskFunc =
  | 'Task_ReturnToBagFromContextMenu'
  | 'Task_ItemUse_CloseMessageBoxAndReturnToField'
  | 'Task_ItemUseWaitForFade'
  | 'Task_WaitFadeIn_CallItemUseOnFieldCB'
  | 'Task_PlayPokeFlute'
  | 'Task_DisplayPokeFluteMessage'
  | 'ItemUseOnFieldCB_Itemfinder'
  | 'Task_InitTMCaseFromField'
  | 'Task_InitBerryPouchFromField'
  | 'Task_InitTeachyTvFromField'
  | 'Task_UseRepel'
  | 'Task_UsedBlackWhiteFlute'
  | 'Task_UseDigEscapeRopeOnField'
  | 'Task_UseTownMapFromField'
  | 'Task_UseFameCheckerFromField'
  | 'Task_VsSeeker_0'
  | 'Task_BattleUse_StatBooster_DelayAndPrint'
  | 'Task_BattleUse_StatBooster_WaitButton_ReturnToBattle'
  | 'ItemMenu_StartFadeToExitCallback'
  | 'Task_BerryPouch_DestroyDialogueWindowAndRefreshListMenu';

export type ItemUseCallback =
  | 'ItemUseCB_Medicine'
  | 'ItemUseCB_TryRestorePP'
  | 'ItemUseCB_PPUp'
  | 'ItemUseCB_RareCandy'
  | 'ItemUseCB_EvolutionStone'
  | 'ItemUseCB_SacredAsh'
  | 'ItemUseCB_MedicineStep';

export interface ItemUseTask {
  data: number[];
  func: ItemUseTaskFunc | null;
  destroyed: boolean;
}

export interface ItemUsePokemon {
  species?: number;
  itemEffectFailsByItem?: Record<number, boolean>;
}

export interface ItemUseRuntime {
  tasks: ItemUseTask[];
  specialVarItemId: number;
  itemTypes: Record<number, number>;
  itemPockets: Record<number, number>;
  itemFieldFuncs: Record<number, string>;
  itemSecondaryIds: Record<number, number>;
  itemHoldEffectParams: Record<number, number>;
  itemEffectTypes: Record<number, number>;
  itemNames: Record<number, string>;
  playerParty: ItemUsePokemon[];
  battlerPartyIndexes: number[];
  battlerInMenuId: number;
  battleTypeFlags: number;
  storageFull: boolean;
  mapHeader: { allowEscaping: boolean; regionMapSectionId: number; mapType: number };
  location: { mapGroup: number; mapNum: number };
  vars: Record<number, number>;
  flags: Set<number>;
  metatile: {
    verticalRail: Set<number>;
    horizontalRail: Set<number>;
    isolatedVerticalRail: Set<number>;
    isolatedHorizontalRail: Set<number>;
    waterfall: Set<number>;
    surfable: Set<number>;
    bridge: Set<number>;
  };
  frontTile: { behavior: number; collision: number };
  destTileBehavior: number;
  facingSurfableFishableWater: boolean;
  avatarFlags: number;
  bikingAllowed: boolean;
  bikingDisallowedByPlayer: boolean;
  weatherNotFadingIn: boolean;
  paletteFadeActive: boolean;
  sePlaying: boolean;
  fanfareDone: boolean;
  pressedA: boolean;
  pressedB: boolean;
  coins: number;
  berryPowder: number;
  fieldCallback: string | null;
  fieldCallback2: string | null;
  itemUseOnFieldCB: string | null;
  itemUseCB: ItemUseCallback | null;
  itemMenuExitCallback: string | null;
  berryPouchExitCallback: string | null;
  gStringVar1: string;
  gStringVar2: string;
  gStringVar4: string;
  objectEventsFrozen: boolean;
  fieldControlsLocked: boolean;
  exitStairsMovementDisabled: boolean;
  removedItems: Array<{ itemId: number; quantity: number }>;
  questLogEvents: Array<{ eventId: number; itemId: number; itemParam: number; species: number }>;
  messages: Array<{ where: 'bag' | 'field' | 'berryPouch'; taskId: number; fontId: number; text: string; nextFunc: ItemUseTaskFunc | string }>;
  operations: string[];
}

export const createItemUseRuntime = (overrides: Partial<ItemUseRuntime> = {}): ItemUseRuntime => {
  const { mapHeader, location, ...rest } = overrides;
  return {
  tasks: [],
  specialVarItemId: 0,
  itemTypes: {},
  itemPockets: {},
  itemFieldFuncs: {},
  itemSecondaryIds: {},
  itemHoldEffectParams: {},
  itemEffectTypes: {},
  itemNames: {},
  playerParty: [],
  battlerPartyIndexes: [0],
  battlerInMenuId: 0,
  battleTypeFlags: 0,
  storageFull: false,
  mapHeader: { allowEscaping: false, regionMapSectionId: 0xffff, mapType: MAP_TYPE_ROUTE, ...mapHeader },
  location: { mapGroup: 0, mapNum: 0, ...location },
  vars: {},
  flags: new Set<number>(),
  metatile: {
    verticalRail: new Set<number>(),
    horizontalRail: new Set<number>(),
    isolatedVerticalRail: new Set<number>(),
    isolatedHorizontalRail: new Set<number>(),
    waterfall: new Set<number>(),
    surfable: new Set<number>(),
    bridge: new Set<number>()
  },
  frontTile: { behavior: 0, collision: 0 },
  destTileBehavior: 0,
  facingSurfableFishableWater: false,
  avatarFlags: 0,
  bikingAllowed: true,
  bikingDisallowedByPlayer: false,
  weatherNotFadingIn: true,
  paletteFadeActive: false,
  sePlaying: false,
  fanfareDone: false,
  pressedA: false,
  pressedB: false,
  coins: 0,
  berryPowder: 0,
  fieldCallback: null,
  fieldCallback2: null,
  itemUseOnFieldCB: null,
  itemUseCB: null,
  itemMenuExitCallback: null,
  berryPouchExitCallback: null,
  gStringVar1: '',
  gStringVar2: '',
  gStringVar4: '',
  objectEventsFrozen: false,
  fieldControlsLocked: false,
  exitStairsMovementDisabled: true,
  removedItems: [],
  questLogEvents: [],
  messages: [],
  operations: [],
  ...rest
  };
};

export const createItemUseTask = (runtime: ItemUseRuntime, data: Partial<Record<number, number>> = {}): number => {
  const taskId = runtime.tasks.length;
  const task: ItemUseTask = { data: Array.from({ length: 16 }, () => 0), func: null, destroyed: false };
  for (const [key, value] of Object.entries(data)) {
    task.data[Number(key)] = value ?? 0;
  }
  runtime.tasks.push(task);
  return taskId;
};

const task = (runtime: ItemUseRuntime, taskId: number): ItemUseTask => runtime.tasks[taskId];
const itemIdGetType = (runtime: ItemUseRuntime, itemId: number): number => runtime.itemTypes[itemId] ?? ITEM_TYPE_UNUSED;
const getPocketByItemId = (runtime: ItemUseRuntime, itemId: number): number => runtime.itemPockets[itemId] ?? 0;
const itemIdGetFieldFunc = (runtime: ItemUseRuntime, itemId: number): string => runtime.itemFieldFuncs[itemId] ?? '';
const itemIdGetSecondaryId = (runtime: ItemUseRuntime, itemId: number): number => runtime.itemSecondaryIds[itemId] ?? 0;
const itemIdGetHoldEffectParam = (runtime: ItemUseRuntime, itemId: number): number => runtime.itemHoldEffectParams[itemId] ?? 0;
const getItemEffectType = (runtime: ItemUseRuntime, itemId: number): number => runtime.itemEffectTypes[itemId] ?? -1;
const copyItemName = (runtime: ItemUseRuntime, itemId: number): string => runtime.itemNames[itemId] ?? `ITEM_${itemId}`;
const testPlayerAvatarFlags = (runtime: ItemUseRuntime, flags: number): boolean => (runtime.avatarFlags & flags) !== 0;
const expand = (runtime: ItemUseRuntime, source: string): string =>
  source.replaceAll('{STR_VAR_1}', runtime.gStringVar1).replaceAll('{STR_VAR_2}', runtime.gStringVar2);

const displayItemMessageInBag = (runtime: ItemUseRuntime, taskId: number, fontId: number, text: string, nextFunc: ItemUseTaskFunc | string): void => {
  runtime.messages.push({ where: 'bag', taskId, fontId, text, nextFunc });
};

const displayItemMessageOnField = (runtime: ItemUseRuntime, taskId: number, fontId: number, text: string, nextFunc: ItemUseTaskFunc | string): void => {
  runtime.messages.push({ where: 'field', taskId, fontId, text, nextFunc });
};

const displayItemMessageInBerryPouch = (runtime: ItemUseRuntime, taskId: number, fontId: number, text: string, nextFunc: ItemUseTaskFunc): void => {
  runtime.messages.push({ where: 'berryPouch', taskId, fontId, text, nextFunc });
};

const destroyTask = (runtime: ItemUseRuntime, taskId: number): void => { task(runtime, taskId).destroyed = true; };
const removeBagItem = (runtime: ItemUseRuntime, itemId: number, quantity: number): void => { runtime.removedItems.push({ itemId, quantity }); };
const fadeInFromBlack = (runtime: ItemUseRuntime): void => { runtime.operations.push('FadeInFromBlack'); };
const fadeScreenToBlack = (runtime: ItemUseRuntime): void => { runtime.operations.push('FadeScreen(FADE_TO_BLACK, 0)'); };
const stopPokemonLeagueLightingEffectTask = (runtime: ItemUseRuntime): void => { runtime.operations.push('StopPokemonLeagueLightingEffectTask'); };
const cleanupOverworldWindowsAndTilemaps = (runtime: ItemUseRuntime): void => { runtime.operations.push('CleanupOverworldWindowsAndTilemaps'); };
const bagBeginCloseWin0Animation = (runtime: ItemUseRuntime): void => { runtime.operations.push('Bag_BeginCloseWin0Animation'); };
const itemMenuStartFadeToExitCallback = (runtime: ItemUseRuntime, taskId: number): void => { runtime.operations.push(`ItemMenu_StartFadeToExitCallback(${taskId})`); };
const berryPouchStartFadeToExitCallback = (runtime: ItemUseRuntime, taskId: number): void => { runtime.operations.push(`BerryPouch_StartFadeToExitCallback(${taskId})`); };
const clearFieldLocks = (runtime: ItemUseRuntime): void => {
  runtime.objectEventsFrozen = false;
  runtime.fieldControlsLocked = false;
};

const sExitCallbackByItemType = ['CB2_ShowPartyMenuForItemUse', 'CB2_ReturnToField', null, null] as const;

export const setUpItemUseCallback = (runtime: ItemUseRuntime, taskId: number): void => {
  const itemType = runtime.specialVarItemId === ITEM_ENIGMA_BERRY
    ? task(runtime, taskId).data[4] - 1
    : itemIdGetType(runtime, runtime.specialVarItemId) - 1;
  const exitCallback = sExitCallbackByItemType[itemType] ?? null;
  if (getPocketByItemId(runtime, runtime.specialVarItemId) === POCKET_BERRY_POUCH) {
    runtime.berryPouchExitCallback = exitCallback;
    berryPouchStartFadeToExitCallback(runtime, taskId);
  } else {
    runtime.itemMenuExitCallback = exitCallback;
    if (itemType === ITEM_TYPE_FIELD - 1) {
      bagBeginCloseWin0Animation(runtime);
    }
    itemMenuStartFadeToExitCallback(runtime, taskId);
  }
};

export const setUpItemUseOnFieldCallback = (runtime: ItemUseRuntime, taskId: number): void => {
  if (task(runtime, taskId).data[3] !== 1) {
    runtime.fieldCallback = 'FieldCB_FadeInFromBlack';
    setUpItemUseCallback(runtime, taskId);
  } else {
    callItemUseOnFieldCallback(runtime, taskId);
  }
};

export const fieldCBFadeInFromBlack = (runtime: ItemUseRuntime): void => {
  fadeInFromBlack(runtime);
  const taskId = createItemUseTask(runtime);
  task(runtime, taskId).func = 'Task_WaitFadeIn_CallItemUseOnFieldCB';
};

export const taskWaitFadeInCallItemUseOnFieldCB = (runtime: ItemUseRuntime, taskId: number): void => {
  if (runtime.weatherNotFadingIn) {
    callItemUseOnFieldCallback(runtime, taskId);
  }
};

export const displayItemMessageInCurrentContext = (runtime: ItemUseRuntime, taskId: number, inField: boolean, fontId: number, str: string): void => {
  runtime.gStringVar4 = expand(runtime, str);
  if (!inField) {
    displayItemMessageInBag(runtime, taskId, fontId, runtime.gStringVar4, 'Task_ReturnToBagFromContextMenu');
  } else {
    displayItemMessageOnField(runtime, taskId, fontId, runtime.gStringVar4, 'Task_ItemUse_CloseMessageBoxAndReturnToField');
  }
};

export const printNotTheTimeToUseThat = (runtime: ItemUseRuntime, taskId: number, inField: boolean): void => {
  displayItemMessageInCurrentContext(runtime, taskId, inField, FONT_MALE, gText_OakForbidsUseOfItemHere);
};

export const taskItemUseCloseMessageBoxAndReturnToField = (runtime: ItemUseRuntime, taskId: number): void => {
  runtime.operations.push('ClearDialogWindowAndFrame(0, 1)');
  destroyTask(runtime, taskId);
  clearFieldLocks(runtime);
};

export const checkIfItemIsTMHMOrEvolutionStone = (runtime: ItemUseRuntime, itemId: number): number => {
  if (getPocketByItemId(runtime, itemId) === POCKET_TM_CASE) {
    return 1;
  }
  if (itemIdGetFieldFunc(runtime, itemId) === 'FieldUseFunc_EvoItem') {
    return 2;
  }
  return 0;
};

export const setFieldCallback2ForItemUse = (runtime: ItemUseRuntime): void => { runtime.fieldCallback2 = 'FieldCB2_UseItemFromField'; };

export const fieldCB2UseItemFromField = (runtime: ItemUseRuntime): boolean => {
  runtime.objectEventsFrozen = true;
  runtime.fieldControlsLocked = true;
  fadeInFromBlack(runtime);
  const taskId = createItemUseTask(runtime);
  task(runtime, taskId).func = 'Task_ItemUseWaitForFade';
  runtime.exitStairsMovementDisabled = false;
  return true;
};

export const taskItemUseWaitForFade = (runtime: ItemUseRuntime, taskId: number): void => {
  if (runtime.weatherNotFadingIn) {
    clearFieldLocks(runtime);
    destroyTask(runtime, taskId);
  }
};

export const fieldUseFuncMail = (runtime: ItemUseRuntime, taskId: number): void => {
  runtime.itemMenuExitCallback = 'CB2_CheckMail';
  itemMenuStartFadeToExitCallback(runtime, taskId);
};

export const cb2CheckMail = (runtime: ItemUseRuntime): void => {
  runtime.operations.push(`ReadMail(${runtime.specialVarItemId}, CB2_BagMenuFromStartMenu, FALSE)`);
};

export const fieldUseFuncBike = (runtime: ItemUseRuntime, taskId: number): void => {
  const behavior = runtime.destTileBehavior;
  if (
    runtime.flags.has(FLAG_SYS_ON_CYCLING_ROAD)
    || runtime.metatile.verticalRail.has(behavior)
    || runtime.metatile.horizontalRail.has(behavior)
    || runtime.metatile.isolatedVerticalRail.has(behavior)
    || runtime.metatile.isolatedHorizontalRail.has(behavior)
  ) {
    displayItemMessageInCurrentContext(runtime, taskId, task(runtime, taskId).data[3] !== 0, FONT_NORMAL, gText_CantDismountBike);
  } else if (runtime.bikingAllowed && !runtime.bikingDisallowedByPlayer) {
    runtime.itemUseOnFieldCB = 'ItemUseOnFieldCB_Bicycle';
    setUpItemUseOnFieldCallback(runtime, taskId);
  } else {
    printNotTheTimeToUseThat(runtime, taskId, task(runtime, taskId).data[3] !== 0);
  }
};

export const itemUseOnFieldCBBicycle = (runtime: ItemUseRuntime, taskId: number): void => {
  if (!testPlayerAvatarFlags(runtime, PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE)) {
    runtime.operations.push('PlaySE(SE_BIKE_BELL)');
  }
  runtime.avatarFlags ^= PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE;
  runtime.operations.push('GetOnOffBike(PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE)');
  clearFieldLocks(runtime);
  destroyTask(runtime, taskId);
};

export const canFish = (runtime: ItemUseRuntime): boolean => {
  const behavior = runtime.frontTile.behavior;
  if (runtime.metatile.waterfall.has(behavior)) {
    return false;
  }
  if (testPlayerAvatarFlags(runtime, PLAYER_AVATAR_FLAG_UNDERWATER)) {
    return false;
  }
  if (!testPlayerAvatarFlags(runtime, PLAYER_AVATAR_FLAG_SURFING)) {
    if (runtime.facingSurfableFishableWater) {
      return true;
    }
  } else {
    if (runtime.metatile.surfable.has(behavior) && runtime.frontTile.collision === 0) {
      return true;
    }
    if (runtime.metatile.bridge.has(behavior)) {
      return true;
    }
  }
  return false;
};

export const fieldUseFuncRod = (runtime: ItemUseRuntime, taskId: number): void => {
  if (canFish(runtime)) {
    runtime.itemUseOnFieldCB = 'ItemUseOnFieldCB_Rod';
    setUpItemUseOnFieldCallback(runtime, taskId);
  } else {
    printNotTheTimeToUseThat(runtime, taskId, task(runtime, taskId).data[3] !== 0);
  }
};

export const itemUseOnFieldCBRod = (runtime: ItemUseRuntime, taskId: number): void => {
  runtime.operations.push(`StartFishing(${itemIdGetSecondaryId(runtime, runtime.specialVarItemId)})`);
  destroyTask(runtime, taskId);
};

export const itemUseOutOfBattleItemfinder = (runtime: ItemUseRuntime, taskId: number): void => {
  runtime.operations.push('IncrementGameStat(GAME_STAT_USED_ITEMFINDER)');
  runtime.itemUseOnFieldCB = 'ItemUseOnFieldCB_Itemfinder';
  setUpItemUseOnFieldCallback(runtime, taskId);
};

export const fieldUseFuncCoinCase = (runtime: ItemUseRuntime, taskId: number): void => {
  runtime.gStringVar1 = String(runtime.coins);
  runtime.gStringVar4 = expand(runtime, gText_CoinCase);
  itemUseSetQuestLogEvent(runtime, QL_EVENT_USED_ITEM, null, runtime.specialVarItemId, 0xffff);
  if (task(runtime, taskId).data[3] === 0) displayItemMessageInBag(runtime, taskId, FONT_NORMAL, runtime.gStringVar4, 'Task_ReturnToBagFromContextMenu');
  else displayItemMessageOnField(runtime, taskId, FONT_NORMAL, runtime.gStringVar4, 'Task_ItemUse_CloseMessageBoxAndReturnToField');
};

export const fieldUseFuncPowderJar = (runtime: ItemUseRuntime, taskId: number): void => {
  runtime.gStringVar1 = String(runtime.berryPowder);
  runtime.gStringVar4 = expand(runtime, gText_PowderQty);
  itemUseSetQuestLogEvent(runtime, QL_EVENT_USED_ITEM, null, runtime.specialVarItemId, 0xffff);
  if (task(runtime, taskId).data[3] === 0) displayItemMessageInBag(runtime, taskId, FONT_NORMAL, runtime.gStringVar4, 'Task_ReturnToBagFromContextMenu');
  else displayItemMessageOnField(runtime, taskId, FONT_NORMAL, runtime.gStringVar4, 'Task_ItemUse_CloseMessageBoxAndReturnToField');
};

const executeTableBasedItemEffect = (_runtime: ItemUseRuntime, pokemon: ItemUsePokemon, itemId: number): boolean =>
  pokemon.itemEffectFailsByItem?.[itemId] ?? true;

export const fieldUseFuncPokeFlute = (runtime: ItemUseRuntime, taskId: number): void => {
  let wokeSomeoneUp = false;
  for (let i = 0; i < runtime.playerParty.length; i += 1) {
    if (!executeTableBasedItemEffect(runtime, runtime.playerParty[i], ITEM_AWAKENING)) {
      wokeSomeoneUp = true;
    }
  }
  if (wokeSomeoneUp) {
    itemUseSetQuestLogEvent(runtime, QL_EVENT_USED_ITEM, null, runtime.specialVarItemId, 0xffff);
    if (task(runtime, taskId).data[3] === 0) displayItemMessageInBag(runtime, taskId, FONT_NORMAL, gText_PlayedPokeFlute, 'Task_PlayPokeFlute');
    else displayItemMessageOnField(runtime, taskId, FONT_NORMAL, gText_PlayedPokeFlute, 'Task_PlayPokeFlute');
  } else if (task(runtime, taskId).data[3] === 0) {
    displayItemMessageInBag(runtime, taskId, FONT_NORMAL, gText_PlayedPokeFluteCatchy, 'Task_ReturnToBagFromContextMenu');
  } else {
    displayItemMessageOnField(runtime, taskId, FONT_NORMAL, gText_PlayedPokeFluteCatchy, 'Task_ItemUse_CloseMessageBoxAndReturnToField');
  }
};

export const taskPlayPokeFlute = (runtime: ItemUseRuntime, taskId: number): void => {
  runtime.operations.push('PlayFanfareByFanfareNum(FANFARE_POKE_FLUTE)');
  task(runtime, taskId).func = 'Task_DisplayPokeFluteMessage';
};

export const taskDisplayPokeFluteMessage = (runtime: ItemUseRuntime, taskId: number): void => {
  if (runtime.fanfareDone) {
    if (task(runtime, taskId).data[3] === 0) displayItemMessageInBag(runtime, taskId, FONT_NORMAL, gText_PokeFluteAwakenedMon, 'Task_ReturnToBagFromContextMenu');
    else displayItemMessageOnField(runtime, taskId, FONT_NORMAL, gText_PokeFluteAwakenedMon, 'Task_ItemUse_CloseMessageBoxAndReturnToField');
  }
};

const doSetUpItemUseCallback = (runtime: ItemUseRuntime, taskId: number): void => setUpItemUseCallback(runtime, taskId);

export const fieldUseFuncMedicine = (runtime: ItemUseRuntime, taskId: number): void => { runtime.itemUseCB = 'ItemUseCB_Medicine'; doSetUpItemUseCallback(runtime, taskId); };
export const fieldUseFuncEther = (runtime: ItemUseRuntime, taskId: number): void => { runtime.itemUseCB = 'ItemUseCB_TryRestorePP'; doSetUpItemUseCallback(runtime, taskId); };
export const fieldUseFuncPpUp = (runtime: ItemUseRuntime, taskId: number): void => { runtime.itemUseCB = 'ItemUseCB_PPUp'; doSetUpItemUseCallback(runtime, taskId); };
export const fieldUseFuncRareCandy = (runtime: ItemUseRuntime, taskId: number): void => { runtime.itemUseCB = 'ItemUseCB_RareCandy'; doSetUpItemUseCallback(runtime, taskId); };
export const fieldUseFuncEvoItem = (runtime: ItemUseRuntime, taskId: number): void => { runtime.itemUseCB = 'ItemUseCB_EvolutionStone'; doSetUpItemUseCallback(runtime, taskId); };
export const fieldUseFuncSacredAsh = (runtime: ItemUseRuntime, taskId: number): void => { runtime.itemUseCB = 'ItemUseCB_SacredAsh'; setUpItemUseCallback(runtime, taskId); };

export const fieldUseFuncTmCase = (runtime: ItemUseRuntime, taskId: number): void => {
  if (task(runtime, taskId).data[3] === 0) {
    runtime.itemMenuExitCallback = 'InitTMCaseFromBag';
    itemMenuStartFadeToExitCallback(runtime, taskId);
  } else {
    stopPokemonLeagueLightingEffectTask(runtime);
    fadeScreenToBlack(runtime);
    task(runtime, taskId).func = 'Task_InitTMCaseFromField';
  }
};

export const initTMCaseFromBag = (runtime: ItemUseRuntime): void => { runtime.operations.push('InitTMCase(TMCASE_FIELD, CB2_BagMenuFromStartMenu, FALSE)'); };

export const taskInitTMCaseFromField = (runtime: ItemUseRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) {
    cleanupOverworldWindowsAndTilemaps(runtime);
    setFieldCallback2ForItemUse(runtime);
    runtime.operations.push('InitTMCase(TMCASE_FIELD, CB2_ReturnToField, TRUE)');
    destroyTask(runtime, taskId);
  }
};

export const fieldUseFuncBerryPouch = (runtime: ItemUseRuntime, taskId: number): void => {
  if (task(runtime, taskId).data[3] === 0) {
    runtime.itemMenuExitCallback = 'InitBerryPouchFromBag';
    itemMenuStartFadeToExitCallback(runtime, taskId);
  } else {
    stopPokemonLeagueLightingEffectTask(runtime);
    fadeScreenToBlack(runtime);
    task(runtime, taskId).func = 'Task_InitBerryPouchFromField';
  }
};

export const initBerryPouchFromBag = (runtime: ItemUseRuntime): void => { runtime.operations.push('InitBerryPouch(BERRYPOUCH_FROMFIELD, CB2_BagMenuFromStartMenu, 0)'); };

export const taskInitBerryPouchFromField = (runtime: ItemUseRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) {
    cleanupOverworldWindowsAndTilemaps(runtime);
    setFieldCallback2ForItemUse(runtime);
    runtime.operations.push('InitBerryPouch(BERRYPOUCH_FROMFIELD, CB2_ReturnToField, 1)');
    destroyTask(runtime, taskId);
  }
};

export const battleUseFuncBerryPouch = (runtime: ItemUseRuntime, taskId: number): void => {
  runtime.itemMenuExitCallback = 'InitBerryPouchFromBattle';
  itemMenuStartFadeToExitCallback(runtime, taskId);
};

export const initBerryPouchFromBattle = (runtime: ItemUseRuntime): void => { runtime.operations.push('InitBerryPouch(BERRYPOUCH_FROMBATTLE, CB2_BagMenuFromBattle, 0)'); };

export const fieldUseFuncTeachyTv = (runtime: ItemUseRuntime, taskId: number): void => {
  itemUseSetQuestLogEvent(runtime, QL_EVENT_USED_ITEM, null, runtime.specialVarItemId, 0xffff);
  if (task(runtime, taskId).data[3] === 0) {
    runtime.itemMenuExitCallback = 'InitTeachyTvFromBag';
    itemMenuStartFadeToExitCallback(runtime, taskId);
  } else {
    stopPokemonLeagueLightingEffectTask(runtime);
    fadeScreenToBlack(runtime);
    task(runtime, taskId).func = 'Task_InitTeachyTvFromField';
  }
};

export const initTeachyTvFromBag = (runtime: ItemUseRuntime): void => { runtime.operations.push('InitTeachyTvController(0, CB2_BagMenuFromStartMenu)'); };

export const taskInitTeachyTvFromField = (runtime: ItemUseRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) {
    cleanupOverworldWindowsAndTilemaps(runtime);
    setFieldCallback2ForItemUse(runtime);
    runtime.operations.push('InitTeachyTvController(0, CB2_ReturnToField)');
    destroyTask(runtime, taskId);
  }
};

export const fieldUseFuncRepel = (runtime: ItemUseRuntime, taskId: number): void => {
  if ((runtime.vars[VAR_REPEL_STEP_COUNT] ?? 0) === 0) {
    runtime.operations.push('PlaySE(SE_REPEL)');
    task(runtime, taskId).func = 'Task_UseRepel';
  } else {
    displayItemMessageInBag(runtime, taskId, FONT_NORMAL, gText_RepelEffectsLingered, 'Task_ReturnToBagFromContextMenu');
  }
};

export const taskUseRepel = (runtime: ItemUseRuntime, taskId: number): void => {
  if (!runtime.sePlaying) {
    itemUseSetQuestLogEvent(runtime, QL_EVENT_USED_ITEM, null, runtime.specialVarItemId, 0xffff);
    runtime.vars[VAR_REPEL_STEP_COUNT] = itemIdGetHoldEffectParam(runtime, runtime.specialVarItemId);
    removeUsedItem(runtime);
    displayItemMessageInBag(runtime, taskId, FONT_NORMAL, runtime.gStringVar4, 'Task_ReturnToBagFromContextMenu');
  }
};

export const removeUsedItem = (runtime: ItemUseRuntime): void => {
  removeBagItem(runtime, runtime.specialVarItemId, 1);
  runtime.operations.push(`Pocket_CalculateNItemsAndMaxShowed(${getPocketByItemId(runtime, runtime.specialVarItemId)})`);
  runtime.operations.push(`PocketCalculateInitialCursorPosAndItemsAbove(${getPocketByItemId(runtime, runtime.specialVarItemId)})`);
  runtime.gStringVar2 = copyItemName(runtime, runtime.specialVarItemId);
  runtime.gStringVar4 = expand(runtime, gText_PlayerUsedVar2);
};

export const fieldUseFuncBlackWhiteFlute = (runtime: ItemUseRuntime, taskId: number): void => {
  itemUseSetQuestLogEvent(runtime, QL_EVENT_USED_ITEM, null, runtime.specialVarItemId, 0xffff);
  if (runtime.specialVarItemId === ITEM_WHITE_FLUTE) {
    runtime.flags.add(FLAG_SYS_WHITE_FLUTE_ACTIVE);
    runtime.flags.delete(FLAG_SYS_BLACK_FLUTE_ACTIVE);
    runtime.gStringVar2 = copyItemName(runtime, runtime.specialVarItemId);
    runtime.gStringVar4 = expand(runtime, gText_UsedVar2WildLured);
    task(runtime, taskId).func = 'Task_UsedBlackWhiteFlute';
    task(runtime, taskId).data[8] = 0;
  } else if (runtime.specialVarItemId === ITEM_BLACK_FLUTE) {
    runtime.flags.add(FLAG_SYS_BLACK_FLUTE_ACTIVE);
    runtime.flags.delete(FLAG_SYS_WHITE_FLUTE_ACTIVE);
    runtime.gStringVar2 = copyItemName(runtime, runtime.specialVarItemId);
    runtime.gStringVar4 = expand(runtime, gText_UsedVar2WildRepelled);
    task(runtime, taskId).func = 'Task_UsedBlackWhiteFlute';
    task(runtime, taskId).data[8] = 0;
  }
};

export const taskUsedBlackWhiteFlute = (runtime: ItemUseRuntime, taskId: number): void => {
  task(runtime, taskId).data[8] += 1;
  if (task(runtime, taskId).data[8] > 7) {
    runtime.operations.push('PlaySE(SE_GLASS_FLUTE)');
    displayItemMessageInBag(runtime, taskId, FONT_NORMAL, runtime.gStringVar4, 'Task_ReturnToBagFromContextMenu');
  }
};

export const canUseEscapeRopeOnCurrMap = (runtime: ItemUseRuntime): boolean => runtime.mapHeader.allowEscaping;

export const itemUseOutOfBattleEscapeRope = (runtime: ItemUseRuntime, taskId: number): void => {
  if (canUseEscapeRopeOnCurrMap(runtime)) {
    itemUseSetQuestLogEvent(runtime, QL_EVENT_USED_ITEM, null, runtime.specialVarItemId, runtime.mapHeader.regionMapSectionId);
    runtime.itemUseOnFieldCB = 'ItemUseOnFieldCB_EscapeRope';
    setUpItemUseOnFieldCallback(runtime, taskId);
  } else {
    printNotTheTimeToUseThat(runtime, taskId, task(runtime, taskId).data[3] !== 0);
  }
};

export const itemUseOnFieldCBEscapeRope = (runtime: ItemUseRuntime, taskId: number): void => {
  runtime.operations.push('Overworld_ResetStateAfterDigEscRope');
  removeUsedItem(runtime);
  task(runtime, taskId).data[0] = 0;
  displayItemMessageOnField(runtime, taskId, FONT_NORMAL, runtime.gStringVar4, 'Task_UseDigEscapeRopeOnField');
};

export const taskUseDigEscapeRopeOnField = (runtime: ItemUseRuntime, taskId: number): void => {
  runtime.operations.push('ResetInitialPlayerAvatarState');
  runtime.operations.push('StartEscapeRopeFieldEffect');
  destroyTask(runtime, taskId);
};

export const fieldUseFuncTownMap = (runtime: ItemUseRuntime, taskId: number): void => {
  if (task(runtime, taskId).data[3] === 0) {
    runtime.itemMenuExitCallback = 'UseTownMapFromBag';
    itemMenuStartFadeToExitCallback(runtime, taskId);
  } else {
    stopPokemonLeagueLightingEffectTask(runtime);
    fadeScreenToBlack(runtime);
    task(runtime, taskId).func = 'Task_UseTownMapFromField';
  }
};

export const useTownMapFromBag = (runtime: ItemUseRuntime): void => { runtime.operations.push('InitRegionMapWithExitCB(REGIONMAP_TYPE_NORMAL, CB2_BagMenuFromStartMenu)'); };

export const taskUseTownMapFromField = (runtime: ItemUseRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) {
    cleanupOverworldWindowsAndTilemaps(runtime);
    setFieldCallback2ForItemUse(runtime);
    runtime.operations.push('InitRegionMapWithExitCB(REGIONMAP_TYPE_NORMAL, CB2_ReturnToField)');
    destroyTask(runtime, taskId);
  }
};

export const fieldUseFuncFameChecker = (runtime: ItemUseRuntime, taskId: number): void => {
  itemUseSetQuestLogEvent(runtime, QL_EVENT_USED_ITEM, null, runtime.specialVarItemId, 0xffff);
  if (task(runtime, taskId).data[3] === 0) {
    runtime.itemMenuExitCallback = 'UseFameCheckerFromBag';
    itemMenuStartFadeToExitCallback(runtime, taskId);
  } else {
    stopPokemonLeagueLightingEffectTask(runtime);
    fadeScreenToBlack(runtime);
    task(runtime, taskId).func = 'Task_UseFameCheckerFromField';
  }
};

export const useFameCheckerFromBag = (runtime: ItemUseRuntime): void => { runtime.operations.push('UseFameChecker(CB2_BagMenuFromStartMenu)'); };

export const taskUseFameCheckerFromField = (runtime: ItemUseRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) {
    cleanupOverworldWindowsAndTilemaps(runtime);
    setFieldCallback2ForItemUse(runtime);
    runtime.operations.push('UseFameChecker(CB2_ReturnToField)');
    destroyTask(runtime, taskId);
  }
};

export const fieldUseFuncVsSeeker = (runtime: ItemUseRuntime, taskId: number): void => {
  const badMapType = runtime.mapHeader.mapType !== MAP_TYPE_ROUTE && runtime.mapHeader.mapType !== MAP_TYPE_TOWN && runtime.mapHeader.mapType !== MAP_TYPE_CITY;
  const badForestMap = runtime.location.mapGroup === MAP_GROUP_VIRIDIAN_FOREST
    && (
      runtime.location.mapNum === MAP_NUM_VIRIDIAN_FOREST
      || runtime.location.mapNum === MAP_NUM_MT_EMBER_EXTERIOR
      || runtime.location.mapNum === MAP_NUM_THREE_ISLAND_BERRY_FOREST
      || runtime.location.mapNum === MAP_NUM_SIX_ISLAND_PATTERN_BUSH
    );
  if (badMapType || badForestMap) {
    printNotTheTimeToUseThat(runtime, taskId, task(runtime, taskId).data[3] !== 0);
  } else {
    runtime.itemUseOnFieldCB = 'Task_VsSeeker_0';
    setUpItemUseOnFieldCallback(runtime, taskId);
  }
};

export const taskItemUseCloseMessageBoxAndReturnToFieldVsSeeker = taskItemUseCloseMessageBoxAndReturnToField;

export const battleUseFuncPokeBallEtc = (runtime: ItemUseRuntime, taskId: number): void => {
  if (!runtime.storageFull) {
    removeBagItem(runtime, runtime.specialVarItemId, 1);
    bagBeginCloseWin0Animation(runtime);
    itemMenuStartFadeToExitCallback(runtime, taskId);
  } else {
    displayItemMessageInBag(runtime, taskId, FONT_NORMAL, gText_BoxFull, 'Task_ReturnToBagFromContextMenu');
  }
};

export const battleUseFuncPokeFlute = (runtime: ItemUseRuntime, taskId: number): void => {
  bagBeginCloseWin0Animation(runtime);
  itemMenuStartFadeToExitCallback(runtime, taskId);
};

export const battleUseFuncStatBooster = (runtime: ItemUseRuntime, taskId: number): void => {
  const partyIndex = runtime.battlerPartyIndexes[runtime.battlerInMenuId];
  if (executeTableBasedItemEffect(runtime, runtime.playerParty[partyIndex] ?? {}, runtime.specialVarItemId)) {
    displayItemMessageInBag(runtime, taskId, FONT_NORMAL, gText_WontHaveEffect, 'Task_ReturnToBagFromContextMenu');
  } else {
    task(runtime, taskId).data[8] = 0;
    task(runtime, taskId).func = 'Task_BattleUse_StatBooster_DelayAndPrint';
  }
};

export const taskBattleUseStatBoosterDelayAndPrint = (runtime: ItemUseRuntime, taskId: number): void => {
  task(runtime, taskId).data[8] += 1;
  if (task(runtime, taskId).data[8] > 7) {
    const itemId = runtime.specialVarItemId;
    runtime.operations.push('PlaySE(SE_USE_ITEM)');
    removeBagItem(runtime, itemId, 1);
    displayItemMessageInBag(runtime, taskId, FONT_NORMAL, `Battle_PrintStatBoosterEffectMessage(${itemId})`, 'Task_BattleUse_StatBooster_WaitButton_ReturnToBattle');
  }
};

export const taskBattleUseStatBoosterWaitButtonReturnToBattle = (runtime: ItemUseRuntime, taskId: number): void => {
  if (runtime.pressedA || runtime.pressedB) {
    bagBeginCloseWin0Animation(runtime);
    itemMenuStartFadeToExitCallback(runtime, taskId);
  }
};

const itemUseSwitchToPartyMenuInBattle = (runtime: ItemUseRuntime, taskId: number): void => {
  if (getPocketByItemId(runtime, runtime.specialVarItemId) === POCKET_BERRY_POUCH) {
    runtime.berryPouchExitCallback = 'EnterPartyFromItemMenuInBattle';
    berryPouchStartFadeToExitCallback(runtime, taskId);
  } else {
    runtime.itemMenuExitCallback = 'EnterPartyFromItemMenuInBattle';
    itemMenuStartFadeToExitCallback(runtime, taskId);
  }
};

export const battleUseFuncMedicine = (runtime: ItemUseRuntime, taskId: number): void => { runtime.itemUseCB = 'ItemUseCB_MedicineStep'; itemUseSwitchToPartyMenuInBattle(runtime, taskId); };
export const battleUseFuncSacredAsh = (runtime: ItemUseRuntime, taskId: number): void => { runtime.itemUseCB = 'ItemUseCB_SacredAsh'; itemUseSwitchToPartyMenuInBattle(runtime, taskId); };
export const battleUseFuncEther = (runtime: ItemUseRuntime, taskId: number): void => { runtime.itemUseCB = 'ItemUseCB_TryRestorePP'; itemUseSwitchToPartyMenuInBattle(runtime, taskId); };

export const battleUseFuncPokeDoll = (runtime: ItemUseRuntime, taskId: number): void => {
  if ((runtime.battleTypeFlags & BATTLE_TYPE_TRAINER) === 0) {
    removeUsedItem(runtime);
    itemUseSetQuestLogEvent(runtime, QL_EVENT_USED_ITEM, null, runtime.specialVarItemId, 0xffff);
    displayItemMessageInBag(runtime, taskId, FONT_NORMAL, runtime.gStringVar4, 'ItemMenu_StartFadeToExitCallback');
  } else {
    printNotTheTimeToUseThat(runtime, taskId, false);
  }
};

const fieldMedicineEffects = new Set([
  ITEM_EFFECT_HEAL_HP,
  ITEM_EFFECT_CURE_POISON,
  ITEM_EFFECT_CURE_SLEEP,
  ITEM_EFFECT_CURE_BURN,
  ITEM_EFFECT_CURE_FREEZE,
  ITEM_EFFECT_CURE_PARALYSIS,
  ITEM_EFFECT_CURE_ALL_STATUS,
  ITEM_EFFECT_ATK_EV,
  ITEM_EFFECT_HP_EV,
  ITEM_EFFECT_SPATK_EV,
  ITEM_EFFECT_SPDEF_EV,
  ITEM_EFFECT_SPEED_EV,
  ITEM_EFFECT_DEF_EV
]);

const battleMedicineEffects = new Set([
  ITEM_EFFECT_HEAL_HP,
  ITEM_EFFECT_CURE_POISON,
  ITEM_EFFECT_CURE_SLEEP,
  ITEM_EFFECT_CURE_BURN,
  ITEM_EFFECT_CURE_FREEZE,
  ITEM_EFFECT_CURE_PARALYSIS,
  ITEM_EFFECT_CURE_CONFUSION,
  ITEM_EFFECT_CURE_INFATUATION,
  ITEM_EFFECT_CURE_ALL_STATUS
]);

export const itemUseOutOfBattleEnigmaBerry = (runtime: ItemUseRuntime, taskId: number): void => {
  const effect = getItemEffectType(runtime, runtime.specialVarItemId);
  if (fieldMedicineEffects.has(effect)) {
    task(runtime, taskId).data[4] = 1;
    fieldUseFuncMedicine(runtime, taskId);
  } else if (effect === ITEM_EFFECT_SACRED_ASH) {
    task(runtime, taskId).data[4] = 1;
    fieldUseFuncSacredAsh(runtime, taskId);
  } else if (effect === ITEM_EFFECT_RAISE_LEVEL) {
    task(runtime, taskId).data[4] = 1;
    fieldUseFuncRareCandy(runtime, taskId);
  } else if (effect === ITEM_EFFECT_PP_UP || effect === ITEM_EFFECT_PP_MAX) {
    task(runtime, taskId).data[4] = 1;
    fieldUseFuncPpUp(runtime, taskId);
  } else if (effect === ITEM_EFFECT_HEAL_PP) {
    task(runtime, taskId).data[4] = 1;
    fieldUseFuncEther(runtime, taskId);
  } else {
    task(runtime, taskId).data[4] = 4;
    fieldUseFuncOakStopsYou(runtime, taskId);
  }
};

export const itemUseInBattleEnigmaBerry = (runtime: ItemUseRuntime, taskId: number): void => {
  const effect = getItemEffectType(runtime, runtime.specialVarItemId);
  if (effect === ITEM_EFFECT_X_ITEM) {
    battleUseFuncStatBooster(runtime, taskId);
  } else if (battleMedicineEffects.has(effect)) {
    battleUseFuncMedicine(runtime, taskId);
  } else if (effect === ITEM_EFFECT_HEAL_PP) {
    battleUseFuncEther(runtime, taskId);
  } else {
    fieldUseFuncOakStopsYou(runtime, taskId);
  }
};

export const fieldUseFuncOakStopsYou = (runtime: ItemUseRuntime, taskId: number): void => {
  if (getPocketByItemId(runtime, runtime.specialVarItemId) === POCKET_BERRY_POUCH) {
    runtime.gStringVar4 = expand(runtime, gText_OakForbidsUseOfItemHere);
    displayItemMessageInBerryPouch(runtime, taskId, FONT_MALE, runtime.gStringVar4, 'Task_BerryPouch_DestroyDialogueWindowAndRefreshListMenu');
  } else {
    printNotTheTimeToUseThat(runtime, taskId, task(runtime, taskId).data[3] !== 0);
  }
};

export const itemUseSetQuestLogEvent = (
  runtime: ItemUseRuntime,
  eventId: number,
  pokemon: ItemUsePokemon | null,
  itemId: number,
  param: number
): void => {
  runtime.questLogEvents.push({
    eventId,
    itemId,
    itemParam: param,
    species: pokemon?.species ?? 0xffff
  });
};

const callItemUseOnFieldCallback = (runtime: ItemUseRuntime, taskId: number): void => {
  switch (runtime.itemUseOnFieldCB) {
    case 'ItemUseOnFieldCB_Bicycle':
      itemUseOnFieldCBBicycle(runtime, taskId);
      break;
    case 'ItemUseOnFieldCB_Rod':
      itemUseOnFieldCBRod(runtime, taskId);
      break;
    case 'ItemUseOnFieldCB_EscapeRope':
      itemUseOnFieldCBEscapeRope(runtime, taskId);
      break;
    case 'ItemUseOnFieldCB_Itemfinder':
    case 'Task_VsSeeker_0':
      task(runtime, taskId).func = runtime.itemUseOnFieldCB;
      break;
  }
};

export const SetUpItemUseCallback = setUpItemUseCallback;
export const SetUpItemUseOnFieldCallback = setUpItemUseOnFieldCallback;
export const FieldCB_FadeInFromBlack = fieldCBFadeInFromBlack;
export const Task_WaitFadeIn_CallItemUseOnFieldCB = taskWaitFadeInCallItemUseOnFieldCB;
export const DisplayItemMessageInCurrentContext = displayItemMessageInCurrentContext;
export const PrintNotTheTimeToUseThat = printNotTheTimeToUseThat;
export const Task_ItemUse_CloseMessageBoxAndReturnToField = taskItemUseCloseMessageBoxAndReturnToField;
export const CheckIfItemIsTMHMOrEvolutionStone = checkIfItemIsTMHMOrEvolutionStone;
export const SetFieldCallback2ForItemUse = setFieldCallback2ForItemUse;
export const FieldCB2_UseItemFromField = fieldCB2UseItemFromField;
export const Task_ItemUseWaitForFade = taskItemUseWaitForFade;
export const FieldUseFunc_Mail = fieldUseFuncMail;
export const CB2_CheckMail = cb2CheckMail;
export const FieldUseFunc_Bike = fieldUseFuncBike;
export const ItemUseOnFieldCB_Bicycle = itemUseOnFieldCBBicycle;
export const FieldUseFunc_Rod = fieldUseFuncRod;
export const CanFish = canFish;
export const ItemUseOnFieldCB_Rod = itemUseOnFieldCBRod;
export const ItemUseOutOfBattle_Itemfinder = itemUseOutOfBattleItemfinder;
export const FieldUseFunc_CoinCase = fieldUseFuncCoinCase;
export const FieldUseFunc_PowderJar = fieldUseFuncPowderJar;
export const FieldUseFunc_PokeFlute = fieldUseFuncPokeFlute;
export const Task_PlayPokeFlute = taskPlayPokeFlute;
export const Task_DisplayPokeFluteMessage = taskDisplayPokeFluteMessage;
export const DoSetUpItemUseCallback = doSetUpItemUseCallback;
export const FieldUseFunc_Medicine = fieldUseFuncMedicine;
export const FieldUseFunc_Ether = fieldUseFuncEther;
export const FieldUseFunc_PpUp = fieldUseFuncPpUp;
export const FieldUseFunc_RareCandy = fieldUseFuncRareCandy;
export const FieldUseFunc_EvoItem = fieldUseFuncEvoItem;
export const FieldUseFunc_SacredAsh = fieldUseFuncSacredAsh;
export const FieldUseFunc_TmCase = fieldUseFuncTmCase;
export const InitTMCaseFromBag = initTMCaseFromBag;
export const Task_InitTMCaseFromField = taskInitTMCaseFromField;
export const FieldUseFunc_BerryPouch = fieldUseFuncBerryPouch;
export const InitBerryPouchFromBag = initBerryPouchFromBag;
export const Task_InitBerryPouchFromField = taskInitBerryPouchFromField;
export const BattleUseFunc_BerryPouch = battleUseFuncBerryPouch;
export const InitBerryPouchFromBattle = initBerryPouchFromBattle;
export const FieldUseFunc_TeachyTv = fieldUseFuncTeachyTv;
export const InitTeachyTvFromBag = initTeachyTvFromBag;
export const Task_InitTeachyTvFromField = taskInitTeachyTvFromField;
export const FieldUseFunc_Repel = fieldUseFuncRepel;
export const Task_UseRepel = taskUseRepel;
export const RemoveUsedItem = removeUsedItem;
export const FieldUseFunc_BlackWhiteFlute = fieldUseFuncBlackWhiteFlute;
export const Task_UsedBlackWhiteFlute = taskUsedBlackWhiteFlute;
export const CanUseEscapeRopeOnCurrMap = canUseEscapeRopeOnCurrMap;
export const ItemUseOutOfBattle_EscapeRope = itemUseOutOfBattleEscapeRope;
export const ItemUseOnFieldCB_EscapeRope = itemUseOnFieldCBEscapeRope;
export const Task_UseDigEscapeRopeOnField = taskUseDigEscapeRopeOnField;
export const FieldUseFunc_TownMap = fieldUseFuncTownMap;
export const UseTownMapFromBag = useTownMapFromBag;
export const Task_UseTownMapFromField = taskUseTownMapFromField;
export const FieldUseFunc_FameChecker = fieldUseFuncFameChecker;
export const UseFameCheckerFromBag = useFameCheckerFromBag;
export const Task_UseFameCheckerFromField = taskUseFameCheckerFromField;
export const FieldUseFunc_VsSeeker = fieldUseFuncVsSeeker;
export const Task_ItemUse_CloseMessageBoxAndReturnToField_VsSeeker = taskItemUseCloseMessageBoxAndReturnToFieldVsSeeker;
export const BattleUseFunc_PokeBallEtc = battleUseFuncPokeBallEtc;
export const BattleUseFunc_PokeFlute = battleUseFuncPokeFlute;
export const BattleUseFunc_StatBooster = battleUseFuncStatBooster;
export const Task_BattleUse_StatBooster_DelayAndPrint = taskBattleUseStatBoosterDelayAndPrint;
export const Task_BattleUse_StatBooster_WaitButton_ReturnToBattle = taskBattleUseStatBoosterWaitButtonReturnToBattle;
export const ItemUse_SwitchToPartyMenuInBattle = itemUseSwitchToPartyMenuInBattle;
export const BattleUseFunc_Medicine = battleUseFuncMedicine;
export const BattleUseFunc_SacredAsh = battleUseFuncSacredAsh;
export const BattleUseFunc_Ether = battleUseFuncEther;
export const BattleUseFunc_PokeDoll = battleUseFuncPokeDoll;
export const ItemUseOutOfBattle_EnigmaBerry = itemUseOutOfBattleEnigmaBerry;
export const ItemUseInBattle_EnigmaBerry = itemUseInBattleEnigmaBerry;
export const FieldUseFunc_OakStopsYou = fieldUseFuncOakStopsYou;
export const ItemUse_SetQuestLogEvent = itemUseSetQuestLogEvent;
