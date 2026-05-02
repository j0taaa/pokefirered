import { FLAG_SYS_BLACK_FLUTE_ACTIVE, FLAG_SYS_WHITE_FLUTE_ACTIVE, SYS_FLAGS } from './decompEventData';
import { GOOD_ROD, OLD_ROD, SUPER_ROD, type FishingRod } from './decompFishing';
import { MetatileBehavior_IsBridge } from './decompMetatileBehavior';
import { PLAYER_AVATAR_FLAG_ACRO_BIKE, PLAYER_AVATAR_FLAG_MACH_BIKE, PLAYER_AVATAR_FLAG_SURFING } from './playerAvatarTransition';
import { RAND_MULT } from './decompRandom';

export { FLAG_SYS_BLACK_FLUTE_ACTIVE, FLAG_SYS_WHITE_FLUTE_ACTIVE } from './decompEventData';
export { PLAYER_AVATAR_FLAG_ACRO_BIKE, PLAYER_AVATAR_FLAG_MACH_BIKE, PLAYER_AVATAR_FLAG_SURFING } from './playerAvatarTransition';

export const MAX_ENCOUNTER_RATE = 1600;
export const HEADER_NONE = 0xffff;
export const LAND_WILD_COUNT = 12;
export const WATER_WILD_COUNT = 5;
export const ROCK_WILD_COUNT = 5;
export const FISH_WILD_COUNT = 10;
export const NUM_ALTERING_CAVE_TABLES = 9;
export const PARTY_SIZE = 6;
export const NUM_NATURES = 25;
export const NUM_UNOWN_FORMS = 28;

export const VAR_REPEL_STEP_COUNT = 0x4020;
export const VAR_ALTERING_CAVE_WILD_SET = 0x4024;
export const FLAG_SYS_UNLOCKED_TANOBY_RUINS = SYS_FLAGS + 0x49;
export const ITEM_CLEANSE_TAG = 190;
export const ABILITY_STENCH = 1;
export const ABILITY_ILLUMINATE = 35;
export const SPECIES_NONE = 0;
export const SPECIES_UNOWN = 201;
export const GAME_STAT_FISHING_CAPTURES = 'GAME_STAT_FISHING_CAPTURES';
export const QL_STATE_PLAYBACK = 1;

export const MAP_UNDEFINED_GROUP = 0xff;
export const MAP_SIX_ISLAND_ALTERING_CAVE_GROUP = 6;
export const MAP_SIX_ISLAND_ALTERING_CAVE_NUM = 40;
export const MAP_SEVEN_ISLAND_TANOBY_RUINS_GROUP = 7;
export const MAP_SEVEN_ISLAND_TANOBY_RUINS_MONEAN_CHAMBER_NUM = 50;
export const MAP_SEVEN_ISLAND_TANOBY_RUINS_LIPTOO_CHAMBER_NUM = 51;
export const MAP_SEVEN_ISLAND_TANOBY_RUINS_WEEPTH_CHAMBER_NUM = 52;
export const MAP_SEVEN_ISLAND_TANOBY_RUINS_DILFORD_CHAMBER_NUM = 53;
export const MAP_SEVEN_ISLAND_TANOBY_RUINS_SCUFIB_CHAMBER_NUM = 54;
export const MAP_SEVEN_ISLAND_TANOBY_RUINS_RIXY_CHAMBER_NUM = 55;
export const MAP_SEVEN_ISLAND_TANOBY_RUINS_VIAPOIS_CHAMBER_NUM = 56;

export const METATILE_ATTRIBUTE_BEHAVIOR = 0;
export const METATILE_ATTRIBUTE_ENCOUNTER_TYPE = 4;
export const METATILE_ATTRIBUTES_ALL = 255;
export const TILE_ENCOUNTER_NONE = 0;
export const TILE_ENCOUNTER_LAND = 1;
export const TILE_ENCOUNTER_WATER = 2;

export const WILD_AREA_LAND = 1;
export const WILD_AREA_WATER = 2;
export const WILD_AREA_ROCKS = 3;
export const WILD_AREA_FISHING = 4;
export const WILD_CHECK_REPEL = 0x1;
export const WILD_CHECK_KEEN_EYE = 0x2;

const ISO_RANDOMIZE2_ADD = 12345;
const METATILE_ATTR_MASKS = [0x000001ff, 0x00003e00, 0x0003c000, 0x00fc0000, 0x07000000, 0x18000000, 0x60000000, 0x80000000] as const;
const METATILE_ATTR_SHIFTS = [0, 9, 14, 18, 24, 27, 29, 31] as const;
const TANOBY_CHAMBER_MAP_NUMS = new Set([
  MAP_SEVEN_ISLAND_TANOBY_RUINS_MONEAN_CHAMBER_NUM,
  MAP_SEVEN_ISLAND_TANOBY_RUINS_LIPTOO_CHAMBER_NUM,
  MAP_SEVEN_ISLAND_TANOBY_RUINS_WEEPTH_CHAMBER_NUM,
  MAP_SEVEN_ISLAND_TANOBY_RUINS_DILFORD_CHAMBER_NUM,
  MAP_SEVEN_ISLAND_TANOBY_RUINS_SCUFIB_CHAMBER_NUM,
  MAP_SEVEN_ISLAND_TANOBY_RUINS_RIXY_CHAMBER_NUM,
  MAP_SEVEN_ISLAND_TANOBY_RUINS_VIAPOIS_CHAMBER_NUM
]);

export const sUnownLetterSlots = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27],
  [2, 2, 2, 3, 3, 3, 7, 7, 7, 20, 20, 14],
  [13, 13, 13, 13, 18, 18, 18, 18, 8, 8, 4, 4],
  [15, 15, 11, 11, 9, 9, 17, 17, 17, 16, 16, 16],
  [24, 24, 19, 19, 6, 6, 6, 5, 5, 5, 10, 10],
  [21, 21, 21, 22, 22, 22, 23, 23, 12, 12, 1, 1],
  [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26]
] as const;

export type SpeciesId = number | string;

export interface WildPokemon {
  minLevel: number;
  maxLevel: number;
  species: SpeciesId;
}

export interface WildPokemonInfo {
  encounterRate: number;
  wildPokemon: WildPokemon[];
}

export interface WildPokemonHeader {
  mapGroup: number;
  mapNum: number;
  landMonsInfo?: WildPokemonInfo | null;
  waterMonsInfo?: WildPokemonInfo | null;
  rockSmashMonsInfo?: WildPokemonInfo | null;
  fishingMonsInfo?: WildPokemonInfo | null;
}

export interface PartyMon {
  hp: number;
  level: number;
  isEgg?: boolean;
  sanityIsEgg?: boolean;
  ability?: number;
  heldItem?: number;
}

export interface GeneratedMon {
  species: SpeciesId;
  level: number;
  slot: number;
  nature?: number;
  personality?: number;
}

export interface WildEncounterData {
  rngState: number;
  prevMetatileBehavior: number;
  encounterRateBuff: number;
  stepsSinceLastEncounter: number;
  abilityEffect: number;
  leadMonHeldItem: number;
}

export interface WildEncounterRuntime {
  sWildEncounterData: WildEncounterData;
  sWildEncountersDisabled: boolean;
  randomQueue: number[];
  wildMonHeaders: WildPokemonHeader[];
  saveBlock1: {
    location: { mapGroup: number; mapNum: number };
    roamer: { level: number };
  };
  vars: Map<number, number>;
  flags: Set<number>;
  playerAvatarFlags: number;
  playerParty: PartyMon[];
  enemyParty: GeneratedMon[];
  mapGridAttributes: Map<string, number>;
  playerDestCoords: { x: number; y: number };
  specialVarResult: boolean;
  questLogState: number;
  inUnionRoom: boolean;
  tryStartRoamerEncounterResult: boolean;
  operations: string[];
  gameStats: Map<string, number>;
  metatileBehaviorIsBridge?: (behavior: number) => boolean;
}

export const createWildEncounterRuntime = (headers: WildPokemonHeader[] = []): WildEncounterRuntime => ({
  sWildEncounterData: {
    rngState: 0,
    prevMetatileBehavior: 0,
    encounterRateBuff: 0,
    stepsSinceLastEncounter: 0,
    abilityEffect: 0,
    leadMonHeldItem: 0
  },
  sWildEncountersDisabled: false,
  randomQueue: [],
  wildMonHeaders: [...headers, { mapGroup: MAP_UNDEFINED_GROUP, mapNum: 0 }],
  saveBlock1: { location: { mapGroup: 1, mapNum: 1 }, roamer: { level: 5 } },
  vars: new Map(),
  flags: new Set(),
  playerAvatarFlags: 0,
  playerParty: [],
  enemyParty: [],
  mapGridAttributes: new Map(),
  playerDestCoords: { x: 0, y: 0 },
  specialVarResult: false,
  questLogState: 0,
  inUnionRoom: false,
  tryStartRoamerEncounterResult: false,
  operations: [],
  gameStats: new Map()
});

const trunc = (value: number): number => Math.trunc(value);
const u16 = (value: number): number => value & 0xffff;
const nextRandom = (runtime: WildEncounterRuntime): number => {
  const value = runtime.randomQueue.shift();
  if (value === undefined) {
    throw new Error('Random queue exhausted');
  }
  return u16(value);
};

export const varGet = (runtime: WildEncounterRuntime, variable: number): number =>
  runtime.vars.get(variable) ?? (variable < 0x4000 ? u16(variable) : 0);

export const varSet = (runtime: WildEncounterRuntime, variable: number, value: number): void => {
  runtime.vars.set(variable, u16(value));
};

export const flagGet = (runtime: WildEncounterRuntime, flag: number): boolean => runtime.flags.has(flag);
export const flagSet = (runtime: WildEncounterRuntime, flag: number): void => {
  runtime.flags.add(flag);
};

export const makeMetatileAttrs = (behavior: number, encounterType: number): number =>
  ((behavior & 0x1ff) | ((encounterType & 0x7) << 24)) >>> 0;

export const ExtractMetatileAttribute = (attributes: number, attributeType: number): number => {
  if (attributeType >= METATILE_ATTR_MASKS.length) {
    return attributes >>> 0;
  }
  return ((attributes >>> 0) & METATILE_ATTR_MASKS[attributeType]) >>> METATILE_ATTR_SHIFTS[attributeType];
};

export const mapGridSetMetatileAttributesAt = (runtime: WildEncounterRuntime, x: number, y: number, attributes: number): void => {
  runtime.mapGridAttributes.set(`${x},${y}`, attributes >>> 0);
};

export const MapGridGetMetatileAttributeAt = (
  runtime: WildEncounterRuntime,
  x: number,
  y: number,
  attributeType: number
): number => ExtractMetatileAttribute(runtime.mapGridAttributes.get(`${x},${y}`) ?? 0, attributeType);

export const DisableWildEncounters = (runtime: WildEncounterRuntime, state: boolean): void => {
  runtime.sWildEncountersDisabled = state;
};

export const ChooseWildMonIndex_Land = (runtime: WildEncounterRuntime): number => {
  const rand = nextRandom(runtime) % 100;
  if (rand < 20) return 0;
  if (rand >= 20 && rand < 40) return 1;
  if (rand >= 40 && rand < 50) return 2;
  if (rand >= 50 && rand < 60) return 3;
  if (rand >= 60 && rand < 70) return 4;
  if (rand >= 70 && rand < 80) return 5;
  if (rand >= 80 && rand < 85) return 6;
  if (rand >= 85 && rand < 90) return 7;
  if (rand >= 90 && rand < 94) return 8;
  if (rand >= 94 && rand < 98) return 9;
  if (rand >= 98 && rand < 99) return 10;
  return 11;
};

export const ChooseWildMonIndex_WaterRock = (runtime: WildEncounterRuntime): number => {
  const rand = nextRandom(runtime) % 100;
  if (rand < 60) return 0;
  if (rand >= 60 && rand < 90) return 1;
  if (rand >= 90 && rand < 95) return 2;
  if (rand >= 95 && rand < 99) return 3;
  return 4;
};

export const ChooseWildMonIndex_Fishing = (runtime: WildEncounterRuntime, rod: FishingRod): number => {
  const rand = nextRandom(runtime) % 100;
  let wildMonIndex = 0;
  switch (rod) {
    case OLD_ROD:
      if (rand < 70) wildMonIndex = 0;
      else wildMonIndex = 1;
      break;
    case GOOD_ROD:
      if (rand < 60) wildMonIndex = 2;
      if (rand >= 60 && rand < 80) wildMonIndex = 3;
      if (rand >= 80 && rand < 100) wildMonIndex = 4;
      break;
    case SUPER_ROD:
      if (rand < 40) wildMonIndex = 5;
      if (rand >= 40 && rand < 80) wildMonIndex = 6;
      if (rand >= 80 && rand < 95) wildMonIndex = 7;
      if (rand >= 95 && rand < 99) wildMonIndex = 8;
      if (rand >= 99 && rand < 100) wildMonIndex = 9;
      break;
  }
  return wildMonIndex;
};

export const ChooseWildMonLevel = (runtime: WildEncounterRuntime, info: WildPokemon): number => {
  let lo: number;
  let hi: number;
  if (info.maxLevel >= info.minLevel) {
    lo = info.minLevel;
    hi = info.maxLevel;
  } else {
    lo = info.maxLevel;
    hi = info.minLevel;
  }
  const mod = hi - lo + 1;
  return lo + (nextRandom(runtime) % mod);
};

export const UnlockedTanobyOrAreNotInTanoby = (runtime: WildEncounterRuntime): boolean => {
  if (flagGet(runtime, FLAG_SYS_UNLOCKED_TANOBY_RUINS)) return true;
  if (runtime.saveBlock1.location.mapGroup !== MAP_SEVEN_ISLAND_TANOBY_RUINS_GROUP) return true;
  if (!TANOBY_CHAMBER_MAP_NUMS.has(runtime.saveBlock1.location.mapNum)) return true;
  return false;
};

export const GetCurrentMapWildMonHeaderId = (runtime: WildEncounterRuntime): number => {
  for (let i = 0; ; i += 1) {
    const wildHeader = runtime.wildMonHeaders[i];
    if (!wildHeader || wildHeader.mapGroup === MAP_UNDEFINED_GROUP) break;
    if (wildHeader.mapGroup === runtime.saveBlock1.location.mapGroup
      && wildHeader.mapNum === runtime.saveBlock1.location.mapNum) {
      if (runtime.saveBlock1.location.mapGroup === MAP_SIX_ISLAND_ALTERING_CAVE_GROUP
        && runtime.saveBlock1.location.mapNum === MAP_SIX_ISLAND_ALTERING_CAVE_NUM) {
        let alteringCaveId = varGet(runtime, VAR_ALTERING_CAVE_WILD_SET);
        if (alteringCaveId >= NUM_ALTERING_CAVE_TABLES) {
          alteringCaveId = 0;
        }
        i += alteringCaveId;
      }
      if (!UnlockedTanobyOrAreNotInTanoby(runtime)) break;
      return i;
    }
  }
  return HEADER_NONE;
};

export const GetUnownLetterByPersonalityLoByte = (personality: number): number =>
  ((((personality >>> 0) & 0x03000000) >>> 18)
    | (((personality >>> 0) & 0x00030000) >>> 12)
    | (((personality >>> 0) & 0x00000300) >>> 6)
    | (((personality >>> 0) & 0x00000003) >>> 0)) % NUM_UNOWN_FORMS;

export const GenerateUnownPersonalityByLetter = (runtime: WildEncounterRuntime, letter: number): number => {
  let personality: number;
  do {
    personality = ((nextRandom(runtime) << 16) | nextRandom(runtime)) >>> 0;
  } while (GetUnownLetterByPersonalityLoByte(personality) !== letter);
  return personality;
};

export const GenerateWildMon = (runtime: WildEncounterRuntime, species: SpeciesId, level: number, slot: number): void => {
  runtime.enemyParty = [];
  if (species !== SPECIES_UNOWN) {
    runtime.enemyParty[0] = { species, level, slot, nature: nextRandom(runtime) % NUM_NATURES };
  } else {
    const chamber = runtime.saveBlock1.location.mapNum - MAP_SEVEN_ISLAND_TANOBY_RUINS_MONEAN_CHAMBER_NUM;
    const personality = GenerateUnownPersonalityByLetter(runtime, sUnownLetterSlots[chamber][slot]);
    runtime.enemyParty[0] = { species, level, slot, personality };
  }
};

export const IsWildLevelAllowedByRepel = (runtime: WildEncounterRuntime, wildLevel: number): boolean => {
  if (!varGet(runtime, VAR_REPEL_STEP_COUNT)) return true;
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    const mon = runtime.playerParty[i];
    if (mon && mon.hp && !mon.isEgg) {
      return wildLevel >= mon.level;
    }
  }
  return false;
};

export const TryGenerateWildMon = (runtime: WildEncounterRuntime, info: WildPokemonInfo, area: number, flags: number): boolean => {
  let slot = 0;
  switch (area) {
    case WILD_AREA_LAND:
      slot = ChooseWildMonIndex_Land(runtime);
      break;
    case WILD_AREA_WATER:
    case WILD_AREA_ROCKS:
      slot = ChooseWildMonIndex_WaterRock(runtime);
      break;
  }
  const level = ChooseWildMonLevel(runtime, info.wildPokemon[slot]);
  if (flags === WILD_CHECK_REPEL && !IsWildLevelAllowedByRepel(runtime, level)) {
    return false;
  }
  GenerateWildMon(runtime, info.wildPokemon[slot].species, level, slot);
  return true;
};

export const GenerateFishingEncounter = (runtime: WildEncounterRuntime, info: WildPokemonInfo, rod: FishingRod): SpeciesId => {
  const slot = ChooseWildMonIndex_Fishing(runtime, rod);
  const level = ChooseWildMonLevel(runtime, info.wildPokemon[slot]);
  GenerateWildMon(runtime, info.wildPokemon[slot].species, level, slot);
  return info.wildPokemon[slot].species;
};

export const WildEncounterRandom = (runtime: WildEncounterRuntime): number => {
  runtime.sWildEncounterData.rngState = (Math.imul(RAND_MULT, runtime.sWildEncounterData.rngState >>> 0) + ISO_RANDOMIZE2_ADD) >>> 0;
  return runtime.sWildEncounterData.rngState >>> 16;
};

export const DoWildEncounterRateDiceRoll = (runtime: WildEncounterRuntime, encounterRate: number): boolean =>
  WildEncounterRandom(runtime) % MAX_ENCOUNTER_RATE < encounterRate;

export const GetFluteEncounterRateModType = (runtime: WildEncounterRuntime): number => {
  if (flagGet(runtime, FLAG_SYS_WHITE_FLUTE_ACTIVE)) return 1;
  if (flagGet(runtime, FLAG_SYS_BLACK_FLUTE_ACTIVE)) return 2;
  return 0;
};

export const ApplyFluteEncounterRateMod = (runtime: WildEncounterRuntime, encounterRate: number): number => {
  switch (GetFluteEncounterRateModType(runtime)) {
    case 1:
      return encounterRate + trunc(encounterRate / 2);
    case 2:
      return trunc(encounterRate / 2);
    default:
      return encounterRate;
  }
};

export const IsLeadMonHoldingCleanseTag = (runtime: WildEncounterRuntime): boolean =>
  runtime.sWildEncounterData.leadMonHeldItem === ITEM_CLEANSE_TAG;

export const ApplyCleanseTagEncounterRateMod = (runtime: WildEncounterRuntime, encounterRate: number): number =>
  IsLeadMonHoldingCleanseTag(runtime) ? trunc(encounterRate * 2 / 3) : encounterRate;

export const DoWildEncounterRateTest = (runtime: WildEncounterRuntime, encounterRate: number, ignoreAbility: boolean): boolean => {
  let rate = encounterRate * 16;
  if (runtime.playerAvatarFlags & (PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE)) {
    rate = trunc(rate * 80 / 100);
  }
  rate += trunc(runtime.sWildEncounterData.encounterRateBuff * 16 / 200);
  rate = ApplyFluteEncounterRateMod(runtime, rate);
  rate = ApplyCleanseTagEncounterRateMod(runtime, rate);
  if (!ignoreAbility) {
    switch (runtime.sWildEncounterData.abilityEffect) {
      case 1:
        rate = trunc(rate / 2);
        break;
      case 2:
        rate *= 2;
        break;
    }
  }
  if (rate > MAX_ENCOUNTER_RATE) {
    rate = MAX_ENCOUNTER_RATE;
  }
  return DoWildEncounterRateDiceRoll(runtime, rate);
};

export const GetAbilityEncounterRateModType = (runtime: WildEncounterRuntime): number => {
  runtime.sWildEncounterData.abilityEffect = 0;
  const mon = runtime.playerParty[0];
  if (!mon?.sanityIsEgg) {
    const ability = mon?.ability ?? 0;
    if (ability === ABILITY_STENCH) runtime.sWildEncounterData.abilityEffect = 1;
    else if (ability === ABILITY_ILLUMINATE) runtime.sWildEncounterData.abilityEffect = 2;
  }
  return runtime.sWildEncounterData.abilityEffect;
};

export const DoGlobalWildEncounterDiceRoll = (runtime: WildEncounterRuntime): boolean =>
  (nextRandom(runtime) % 100) < 60;

const TryStartRoamerEncounter = (runtime: WildEncounterRuntime): boolean => runtime.tryStartRoamerEncounterResult;
const StartRoamerBattle = (runtime: WildEncounterRuntime): void => {
  runtime.operations.push('StartRoamerBattle');
};
const StartWildBattle = (runtime: WildEncounterRuntime): void => {
  runtime.operations.push('StartWildBattle');
};
export const AddToWildEncounterRateBuff = (runtime: WildEncounterRuntime, encounterRate: number): void => {
  if (varGet(runtime, VAR_REPEL_STEP_COUNT) === 0) {
    runtime.sWildEncounterData.encounterRateBuff = u16(runtime.sWildEncounterData.encounterRateBuff + encounterRate);
  } else {
    runtime.sWildEncounterData.encounterRateBuff = 0;
  }
};

export const StandardWildEncounter = (runtime: WildEncounterRuntime, currMetatileAttrs: number, previousMetatileBehavior: number): boolean => {
  if (runtime.sWildEncountersDisabled === true) return false;
  const headerId = GetCurrentMapWildMonHeaderId(runtime);
  if (headerId !== HEADER_NONE) {
    const behavior = ExtractMetatileAttribute(currMetatileAttrs, METATILE_ATTRIBUTE_BEHAVIOR);
    if (ExtractMetatileAttribute(currMetatileAttrs, METATILE_ATTRIBUTE_ENCOUNTER_TYPE) === TILE_ENCOUNTER_LAND) {
      const info = runtime.wildMonHeaders[headerId].landMonsInfo;
      if (info == null) return false;
      if (previousMetatileBehavior !== behavior && !DoGlobalWildEncounterDiceRoll(runtime)) return false;
      if (DoWildEncounterRateTest(runtime, info.encounterRate, false) !== true) {
        AddToWildEncounterRateBuff(runtime, info.encounterRate);
        return false;
      } else if (TryStartRoamerEncounter(runtime) === true) {
        if (!IsWildLevelAllowedByRepel(runtime, runtime.saveBlock1.roamer.level)) return false;
        StartRoamerBattle(runtime);
        return true;
      } else if (TryGenerateWildMon(runtime, info, WILD_AREA_LAND, WILD_CHECK_REPEL) === true) {
        StartWildBattle(runtime);
        return true;
      } else {
        AddToWildEncounterRateBuff(runtime, info.encounterRate);
      }
    } else if (ExtractMetatileAttribute(currMetatileAttrs, METATILE_ATTRIBUTE_ENCOUNTER_TYPE) === TILE_ENCOUNTER_WATER
      || ((runtime.playerAvatarFlags & PLAYER_AVATAR_FLAG_SURFING)
        && (runtime.metatileBehaviorIsBridge ?? MetatileBehavior_IsBridge)(behavior) === true)) {
      const info = runtime.wildMonHeaders[headerId].waterMonsInfo;
      if (info == null) return false;
      if (previousMetatileBehavior !== behavior && !DoGlobalWildEncounterDiceRoll(runtime)) return false;
      if (DoWildEncounterRateTest(runtime, info.encounterRate, false) !== true) {
        AddToWildEncounterRateBuff(runtime, info.encounterRate);
        return false;
      }
      if (TryStartRoamerEncounter(runtime) === true) {
        if (!IsWildLevelAllowedByRepel(runtime, runtime.saveBlock1.roamer.level)) return false;
        StartRoamerBattle(runtime);
        return true;
      } else if (TryGenerateWildMon(runtime, info, WILD_AREA_WATER, WILD_CHECK_REPEL) === true) {
        StartWildBattle(runtime);
        return true;
      } else {
        AddToWildEncounterRateBuff(runtime, info.encounterRate);
      }
    }
  }
  return false;
};

export const RockSmashWildEncounter = (runtime: WildEncounterRuntime): void => {
  const headerIdx = GetCurrentMapWildMonHeaderId(runtime);
  if (headerIdx === HEADER_NONE) runtime.specialVarResult = false;
  else if (runtime.wildMonHeaders[headerIdx].rockSmashMonsInfo == null) runtime.specialVarResult = false;
  else if (DoWildEncounterRateTest(runtime, runtime.wildMonHeaders[headerIdx].rockSmashMonsInfo.encounterRate, true) !== true) runtime.specialVarResult = false;
  else if (TryGenerateWildMon(runtime, runtime.wildMonHeaders[headerIdx].rockSmashMonsInfo, WILD_AREA_ROCKS, WILD_CHECK_REPEL) === true) {
    StartWildBattle(runtime);
    runtime.specialVarResult = true;
  } else {
    runtime.specialVarResult = false;
  }
};

export const SweetScentWildEncounter = (runtime: WildEncounterRuntime): boolean => {
  const { x, y } = runtime.playerDestCoords;
  const headerId = GetCurrentMapWildMonHeaderId(runtime);
  if (headerId !== HEADER_NONE) {
    if (MapGridGetMetatileAttributeAt(runtime, x, y, METATILE_ATTRIBUTE_ENCOUNTER_TYPE) === TILE_ENCOUNTER_LAND) {
      if (TryStartRoamerEncounter(runtime) === true) {
        StartRoamerBattle(runtime);
        return true;
      }
      const info = runtime.wildMonHeaders[headerId].landMonsInfo;
      if (info == null) return false;
      TryGenerateWildMon(runtime, info, WILD_AREA_LAND, 0);
      StartWildBattle(runtime);
      return true;
    }
    if (MapGridGetMetatileAttributeAt(runtime, x, y, METATILE_ATTRIBUTE_ENCOUNTER_TYPE) === TILE_ENCOUNTER_WATER) {
      if (TryStartRoamerEncounter(runtime) === true) {
        StartRoamerBattle(runtime);
        return true;
      }
      const info = runtime.wildMonHeaders[headerId].waterMonsInfo;
      if (info == null) return false;
      TryGenerateWildMon(runtime, info, WILD_AREA_WATER, 0);
      StartWildBattle(runtime);
      return true;
    }
  }
  return false;
};

export const DoesCurrentMapHaveFishingMons = (runtime: WildEncounterRuntime): boolean => {
  const headerIdx = GetCurrentMapWildMonHeaderId(runtime);
  if (headerIdx === HEADER_NONE) return false;
  if (runtime.wildMonHeaders[headerIdx].fishingMonsInfo == null) return false;
  return true;
};

export const FishingWildEncounter = (runtime: WildEncounterRuntime, rod: FishingRod): void => {
  const info = runtime.wildMonHeaders[GetCurrentMapWildMonHeaderId(runtime)].fishingMonsInfo;
  if (info == null) throw new Error('FishingWildEncounter called without fishing mons');
  GenerateFishingEncounter(runtime, info, rod);
  runtime.gameStats.set(GAME_STAT_FISHING_CAPTURES, (runtime.gameStats.get(GAME_STAT_FISHING_CAPTURES) ?? 0) + 1);
  StartWildBattle(runtime);
};

export const GetLocalWildMon = (runtime: WildEncounterRuntime): { species: SpeciesId; isWaterMon: boolean } => {
  let isWaterMon = false;
  const headerId = GetCurrentMapWildMonHeaderId(runtime);
  if (headerId === HEADER_NONE) return { species: SPECIES_NONE, isWaterMon };
  const landMonsInfo = runtime.wildMonHeaders[headerId].landMonsInfo;
  const waterMonsInfo = runtime.wildMonHeaders[headerId].waterMonsInfo;
  if (landMonsInfo == null && waterMonsInfo == null) return { species: SPECIES_NONE, isWaterMon };
  if (landMonsInfo != null && waterMonsInfo == null) return { species: landMonsInfo.wildPokemon[ChooseWildMonIndex_Land(runtime)].species, isWaterMon };
  if (landMonsInfo == null && waterMonsInfo != null) {
    isWaterMon = true;
    return { species: waterMonsInfo.wildPokemon[ChooseWildMonIndex_WaterRock(runtime)].species, isWaterMon };
  }
  if ((nextRandom(runtime) % 100) < 80) {
    return { species: landMonsInfo!.wildPokemon[ChooseWildMonIndex_Land(runtime)].species, isWaterMon };
  }
  isWaterMon = true;
  return { species: waterMonsInfo!.wildPokemon[ChooseWildMonIndex_WaterRock(runtime)].species, isWaterMon };
};

export const GetLocalWaterMon = (runtime: WildEncounterRuntime): SpeciesId => {
  const headerId = GetCurrentMapWildMonHeaderId(runtime);
  if (headerId !== HEADER_NONE) {
    const waterMonsInfo = runtime.wildMonHeaders[headerId].waterMonsInfo;
    if (waterMonsInfo) {
      return waterMonsInfo.wildPokemon[ChooseWildMonIndex_WaterRock(runtime)].species;
    }
  }
  return SPECIES_NONE;
};

export const UpdateRepelCounter = (runtime: WildEncounterRuntime): boolean => {
  if (runtime.inUnionRoom === true) return false;
  if (runtime.questLogState === QL_STATE_PLAYBACK) return false;
  let steps = varGet(runtime, VAR_REPEL_STEP_COUNT);
  if (steps !== 0) {
    steps -= 1;
    varSet(runtime, VAR_REPEL_STEP_COUNT, steps);
    if (steps === 0) {
      runtime.operations.push('EventScript_RepelWoreOff');
      return true;
    }
  }
  return false;
};

export const SeedWildEncounterRng = (runtime: WildEncounterRuntime, seed: number): void => {
  runtime.sWildEncounterData.rngState = u16(seed);
  ResetEncounterRateModifiers(runtime);
};

export const GetMapBaseEncounterCooldown = (runtime: WildEncounterRuntime, encounterType: number): number => {
  const headerIdx = GetCurrentMapWildMonHeaderId(runtime);
  if (headerIdx === HEADER_NONE) return 0xff;
  if (encounterType === TILE_ENCOUNTER_LAND) {
    const info = runtime.wildMonHeaders[headerIdx].landMonsInfo;
    if (info == null) return 0xff;
    if (info.encounterRate >= 80) return 0;
    if (info.encounterRate < 10) return 8;
    return 8 - trunc(info.encounterRate / 10);
  }
  if (encounterType === TILE_ENCOUNTER_WATER) {
    const info = runtime.wildMonHeaders[headerIdx].waterMonsInfo;
    if (info == null) return 0xff;
    if (info.encounterRate >= 80) return 0;
    if (info.encounterRate < 10) return 8;
    return 8 - trunc(info.encounterRate / 10);
  }
  return 0xff;
};

export const ResetEncounterRateModifiers = (runtime: WildEncounterRuntime): void => {
  runtime.sWildEncounterData.encounterRateBuff = 0;
  runtime.sWildEncounterData.stepsSinceLastEncounter = 0;
};

export const HandleWildEncounterCooldown = (runtime: WildEncounterRuntime, currMetatileAttrs: number): boolean => {
  const encounterType = ExtractMetatileAttribute(currMetatileAttrs, METATILE_ATTRIBUTE_ENCOUNTER_TYPE);
  if (encounterType === TILE_ENCOUNTER_NONE) return false;
  let minSteps = GetMapBaseEncounterCooldown(runtime, encounterType);
  if (minSteps === 0xff) return false;
  minSteps *= 256;
  let encRate = 5 * 256;
  switch (GetFluteEncounterRateModType(runtime)) {
    case 1:
      minSteps -= trunc(minSteps / 2);
      encRate += trunc(encRate / 2);
      break;
    case 2:
      minSteps *= 2;
      encRate = trunc(encRate / 2);
      break;
  }
  runtime.sWildEncounterData.leadMonHeldItem = runtime.playerParty[0]?.heldItem ?? 0;
  if (IsLeadMonHoldingCleanseTag(runtime) === true) {
    minSteps += trunc(minSteps / 3);
    encRate -= trunc(encRate / 3);
  }
  switch (GetAbilityEncounterRateModType(runtime)) {
    case 1:
      minSteps *= 2;
      encRate = trunc(encRate / 2);
      break;
    case 2:
      minSteps = trunc(minSteps / 2);
      encRate *= 2;
      break;
  }
  minSteps = trunc(minSteps / 256);
  encRate = trunc(encRate / 256);
  if (runtime.sWildEncounterData.stepsSinceLastEncounter >= minSteps) return true;
  runtime.sWildEncounterData.stepsSinceLastEncounter += 1;
  if ((nextRandom(runtime) % 100) < encRate) return true;
  return false;
};

export const TryStandardWildEncounter = (runtime: WildEncounterRuntime, currMetatileAttrs: number): boolean => {
  const behavior = ExtractMetatileAttribute(currMetatileAttrs, METATILE_ATTRIBUTE_BEHAVIOR);
  if (!HandleWildEncounterCooldown(runtime, currMetatileAttrs)) {
    runtime.sWildEncounterData.prevMetatileBehavior = behavior;
    return false;
  }
  if (StandardWildEncounter(runtime, currMetatileAttrs, runtime.sWildEncounterData.prevMetatileBehavior) === true) {
    runtime.sWildEncounterData.encounterRateBuff = 0;
    runtime.sWildEncounterData.stepsSinceLastEncounter = 0;
    runtime.sWildEncounterData.prevMetatileBehavior = behavior;
    return true;
  }
  runtime.sWildEncounterData.prevMetatileBehavior = behavior;
  return false;
};
