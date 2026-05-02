import { createDecompRng, nextDecompRandom, type DecompRngState } from './decompRandom';

export const MAX_HIDDEN_ITEMS_PER_GROUP = 8;
export const NO_ITEM = 0xff;
export const FLAG_HIDDEN_ITEMS_START = 1000;
export const VAR_RENEWABLE_ITEM_STEP_COUNTER = 0x4023;
export const RENEWABLE_ITEM_STEP_COUNTER_CAP = 1500;

const mapGroup = (map: number): number => map >> 8;
const mapNum = (map: number): number => map & 0xff;
const map = (num: number, group: number): number => num | (group << 8);

export const MAP_MT_MOON_B1F = map(2, 1);
export const MAP_UNDERGROUND_PATH_NORTH_SOUTH_TUNNEL = map(31, 1);
export const MAP_UNDERGROUND_PATH_EAST_WEST_TUNNEL = map(34, 1);
export const MAP_THREE_ISLAND_BERRY_FOREST = map(109, 1);
export const MAP_FOUR_ISLAND = map(15, 3);
export const MAP_ROUTE20 = map(38, 3);
export const MAP_ROUTE21_NORTH = map(39, 3);
export const MAP_ONE_ISLAND_TREASURE_BEACH = map(46, 3);
export const MAP_THREE_ISLAND_BOND_BRIDGE = map(48, 3);
export const MAP_FIVE_ISLAND_RESORT_GORGEOUS = map(54, 3);
export const MAP_FIVE_ISLAND_MEMORIAL_PILLAR = map(57, 3);
export const MAP_SIX_ISLAND_OUTCAST_ISLAND = map(58, 3);
export const MAP_SIX_ISLAND_GREEN_PATH = map(59, 3);
export const MAP_SEVEN_ISLAND_TRAINER_TOWER = map(62, 3);
export const MAP_SEVEN_ISLAND_TANOBY_RUINS = map(65, 3);

export interface RenewableHiddenItemData {
  mapGroup: number;
  mapNum: number;
  rare: readonly number[];
  uncommon: readonly number[];
  common: readonly number[];
}

export interface RenewableHiddenItemsRuntime {
  flags: Set<number>;
  vars: Map<number, number>;
  location: {
    mapGroup: number;
    mapNum: number;
  };
  rng: DecompRngState;
  randomOverride?: () => number;
}

const hiddenItemFlag = (hiddenId: number): number => FLAG_HIDDEN_ITEMS_START + hiddenId;
const items = (values: readonly number[]): readonly number[] => {
  if (values.length > MAX_HIDDEN_ITEMS_PER_GROUP) {
    throw new Error('renewable hidden item group cannot exceed 8 entries');
  }
  return [
    ...values,
    ...Array.from({ length: MAX_HIDDEN_ITEMS_PER_GROUP - values.length }, () => NO_ITEM)
  ];
};

const renewableEntry = (
  mapId: number,
  rare: readonly number[],
  uncommon: readonly number[],
  common: readonly number[]
): RenewableHiddenItemData => ({
  mapGroup: mapGroup(mapId),
  mapNum: mapNum(mapId),
  rare: items(rare),
  uncommon: items(uncommon),
  common: items(common)
});

export const renewableHiddenItems: readonly RenewableHiddenItemData[] = [
  renewableEntry(MAP_ROUTE20, [], [153], []),
  renewableEntry(MAP_ROUTE21_NORTH, [], [154], []),
  renewableEntry(MAP_UNDERGROUND_PATH_NORTH_SOUTH_TUNNEL, [76], [70, 71, 72, 73, 74, 75], []),
  renewableEntry(MAP_UNDERGROUND_PATH_EAST_WEST_TUNNEL, [83], [77, 78, 79, 80, 81, 82], []),
  renewableEntry(MAP_SEVEN_ISLAND_TANOBY_RUINS, [64, 65, 66, 67], [], []),
  renewableEntry(MAP_MT_MOON_B1F, [84, 85, 86, 87, 88, 89], [84, 85, 86], []),
  renewableEntry(MAP_THREE_ISLAND_BERRY_FOREST, [91, 93, 94, 95, 99, 100, 101, 102], [91, 93, 94, 95, 99, 100, 101], [90, 92, 96, 97, 98]),
  renewableEntry(MAP_ONE_ISLAND_TREASURE_BEACH, [107, 108, 109, 110], [103, 104, 105, 106, 107, 108], [107, 108]),
  renewableEntry(MAP_THREE_ISLAND_BOND_BRIDGE, [], [166, 167], []),
  renewableEntry(MAP_FOUR_ISLAND, [], [168], [169]),
  renewableEntry(MAP_FIVE_ISLAND_MEMORIAL_PILLAR, [170], [], []),
  renewableEntry(MAP_FIVE_ISLAND_RESORT_GORGEOUS, [174, 176], [175, 177], []),
  renewableEntry(MAP_SIX_ISLAND_OUTCAST_ISLAND, [178, 179], [], []),
  renewableEntry(MAP_SIX_ISLAND_GREEN_PATH, [], [], [180]),
  renewableEntry(MAP_SEVEN_ISLAND_TRAINER_TOWER, [185], [186], [])
];

export const createRenewableHiddenItemsRuntime = (
  seed = 0,
  mapId = 0
): RenewableHiddenItemsRuntime => ({
  flags: new Set(),
  vars: new Map(),
  location: {
    mapGroup: mapGroup(mapId),
    mapNum: mapNum(mapId)
  },
  rng: createDecompRng(seed)
});

export const setRenewableHiddenItemsLocation = (
  runtime: RenewableHiddenItemsRuntime,
  mapId: number
): void => {
  runtime.location.mapGroup = mapGroup(mapId);
  runtime.location.mapNum = mapNum(mapId);
};

export const flagSet = (runtime: RenewableHiddenItemsRuntime, flag: number): void => {
  runtime.flags.add(flag);
};

export const flagClear = (runtime: RenewableHiddenItemsRuntime, flag: number): void => {
  runtime.flags.delete(flag);
};

export const varGet = (runtime: RenewableHiddenItemsRuntime, variable: number): number =>
  runtime.vars.get(variable) ?? 0;

export const varSet = (
  runtime: RenewableHiddenItemsRuntime,
  variable: number,
  value: number
): void => {
  runtime.vars.set(variable, value & 0xffff);
};

const random = (runtime: RenewableHiddenItemsRuntime): number =>
  runtime.randomOverride?.() ?? nextDecompRandom(runtime.rng);

export const setAllRenewableItemFlags = (runtime: RenewableHiddenItemsRuntime): void => {
  for (let i = 0; i < renewableHiddenItems.length; i += 1) {
    const rare = renewableHiddenItems[i].rare;
    const uncommon = renewableHiddenItems[i].uncommon;
    const common = renewableHiddenItems[i].common;
    for (let j = 0; j < MAX_HIDDEN_ITEMS_PER_GROUP; j += 1) {
      if (rare[j] !== NO_ITEM) {
        flagSet(runtime, hiddenItemFlag(rare[j]));
      }
      if (uncommon[j] !== NO_ITEM) {
        flagSet(runtime, hiddenItemFlag(uncommon[j]));
      }
      if (common[j] !== NO_ITEM) {
        flagSet(runtime, hiddenItemFlag(common[j]));
      }
    }
  }
};

export const incrementRenewableHiddenItemStepCounter = (
  runtime: RenewableHiddenItemsRuntime
): void => {
  const value = varGet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER);
  if (value < RENEWABLE_ITEM_STEP_COUNTER_CAP) {
    varSet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER, value + 1);
  }
};

export const tryRegenerateRenewableHiddenItems = (
  runtime: RenewableHiddenItemsRuntime
): void => {
  let foundMap = 0xff;
  for (let i = 0; i < renewableHiddenItems.length; i += 1) {
    if (
      renewableHiddenItems[i].mapGroup === runtime.location.mapGroup
      && renewableHiddenItems[i].mapNum === runtime.location.mapNum
    ) {
      foundMap = i;
    }
  }

  if (foundMap === 0xff) {
    return;
  }
  if (varGet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER) >= RENEWABLE_ITEM_STEP_COUNTER_CAP) {
    varSet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER, 0);
    setAllRenewableItemFlags(runtime);
    sampleRenewableItemFlags(runtime);
  }
};

export const sampleRenewableItemFlags = (runtime: RenewableHiddenItemsRuntime): void => {
  for (let i = 0; i < renewableHiddenItems.length; i += 1) {
    const rval = random(runtime) % 100;
    let flags: readonly number[];
    if (rval >= 90) {
      flags = renewableHiddenItems[i].rare;
    } else if (rval >= 60) {
      flags = renewableHiddenItems[i].uncommon;
    } else {
      flags = renewableHiddenItems[i].common;
    }
    for (let j = 0; j < MAX_HIDDEN_ITEMS_PER_GROUP; j += 1) {
      if (flags[j] !== NO_ITEM) {
        flagClear(runtime, hiddenItemFlag(flags[j]));
      }
    }
  }
};

export const getHiddenItemFlag = hiddenItemFlag;
export function SetAllRenewableItemFlags(runtime: RenewableHiddenItemsRuntime): void { setAllRenewableItemFlags(runtime); }
export function IncrementRenewableHiddenItemStepCounter(runtime: RenewableHiddenItemsRuntime): void { incrementRenewableHiddenItemStepCounter(runtime); }
export function TryRegenerateRenewableHiddenItems(runtime: RenewableHiddenItemsRuntime): void { tryRegenerateRenewableHiddenItems(runtime); }
export function SampleRenewableItemFlags(runtime: RenewableHiddenItemsRuntime): void { sampleRenewableItemFlags(runtime); }
