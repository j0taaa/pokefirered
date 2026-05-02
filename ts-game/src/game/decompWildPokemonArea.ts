import {
  DEX_AREA_ALTERING_CAVE,
  DEX_AREA_BERRY_FOREST,
  DEX_AREA_BOND_BRIDGE,
  DEX_AREA_CAPE_BRINK,
  DEX_AREA_CANYON_ENTRANCE,
  DEX_AREA_CELADON_CITY,
  DEX_AREA_CERULEAN_CAVE,
  DEX_AREA_CERULEAN_CITY,
  DEX_AREA_CINNABAR_ISLAND,
  DEX_AREA_DIGLETTS_CAVE,
  DEX_AREA_DOTTED_HOLE,
  DEX_AREA_FIVE_ISLAND,
  DEX_AREA_FIVE_ISLE_MEADOW,
  DEX_AREA_FOUR_ISLAND,
  DEX_AREA_FUCHSIA_CITY,
  DEX_AREA_GREEN_PATH,
  DEX_AREA_ICEFALL_CAVE,
  DEX_AREA_INDIGO_PLATEAU,
  DEX_AREA_KINDLE_ROAD,
  DEX_AREA_LAVENDER_TOWN,
  DEX_AREA_LOST_CAVE,
  DEX_AREA_MEMORIAL_PILLAR,
  DEX_AREA_MT_EMBER,
  DEX_AREA_MT_MOON,
  DEX_AREA_NONE,
  DEX_AREA_ONE_ISLAND,
  DEX_AREA_OUTCAST_ISLAND,
  DEX_AREA_PALLET_TOWN,
  DEX_AREA_PATTERN_BUSH,
  DEX_AREA_PEWTER_CITY,
  DEX_AREA_POKEMON_MANSION,
  DEX_AREA_POKEMON_TOWER,
  DEX_AREA_POWER_PLANT,
  DEX_AREA_RESORT_GORGEOUS,
  DEX_AREA_ROCK_TUNNEL,
  DEX_AREA_ROUTE_1,
  DEX_AREA_ROUTE_10,
  DEX_AREA_ROUTE_11,
  DEX_AREA_ROUTE_12,
  DEX_AREA_ROUTE_13,
  DEX_AREA_ROUTE_14,
  DEX_AREA_ROUTE_15,
  DEX_AREA_ROUTE_16,
  DEX_AREA_ROUTE_17,
  DEX_AREA_ROUTE_18,
  DEX_AREA_ROUTE_19,
  DEX_AREA_ROUTE_2,
  DEX_AREA_ROUTE_20,
  DEX_AREA_ROUTE_21,
  DEX_AREA_ROUTE_22,
  DEX_AREA_ROUTE_23,
  DEX_AREA_ROUTE_24,
  DEX_AREA_ROUTE_25,
  DEX_AREA_ROUTE_3,
  DEX_AREA_ROUTE_4,
  DEX_AREA_ROUTE_5,
  DEX_AREA_ROUTE_6,
  DEX_AREA_ROUTE_7,
  DEX_AREA_ROUTE_8,
  DEX_AREA_ROUTE_9,
  DEX_AREA_RUIN_VALLEY,
  DEX_AREA_SAFARI_ZONE,
  DEX_AREA_SAFFRON_CITY,
  DEX_AREA_SEAFOAM_ISLANDS,
  DEX_AREA_SEVAULT_CANYON,
  DEX_AREA_TANOBY_CHAMBER,
  DEX_AREA_TANOBY_RUINS,
  DEX_AREA_THREE_ISLAND,
  DEX_AREA_THREE_ISLE_PATH,
  DEX_AREA_TRAINER_TOWER,
  DEX_AREA_TREASURE_BEACH,
  DEX_AREA_TWO_ISLAND,
  DEX_AREA_VERMILION_CITY,
  DEX_AREA_VICTORY_ROAD,
  DEX_AREA_VIRIDIAN_CITY,
  DEX_AREA_VIRIDIAN_FOREST,
  DEX_AREA_WATER_LABYRINTH,
  DEX_AREA_WATER_PATH,
  getAreaMarkerSubsprite,
  type PokedexAreaMarkerSubsprite
} from './decompPokedexAreaMarkers';
import {
  SPECIES_BULBASAUR,
  SPECIES_CHARMANDER,
  SPECIES_ENTEI,
  SPECIES_RAIKOU,
  SPECIES_SUICUNE
} from './decompRoamer';

export const LAND_WILD_COUNT = 12;
export const WATER_WILD_COUNT = 5;
export const ROCK_WILD_COUNT = 5;
export const FISH_WILD_COUNT = 10;
export const NUM_ALTERING_CAVE_TABLES = 9;
export const VAR_ALTERING_CAVE_WILD_SET = 0x4024;

export const SPECIES_SQUIRTLE = 7;

export const MAPSEC_PALLET_TOWN = 88;
export const MAPSEC_VIRIDIAN_CITY = 89;
export const MAPSEC_PEWTER_CITY = 90;
export const MAPSEC_CERULEAN_CITY = 91;
export const MAPSEC_LAVENDER_TOWN = 92;
export const MAPSEC_VERMILION_CITY = 93;
export const MAPSEC_CELADON_CITY = 94;
export const MAPSEC_FUCHSIA_CITY = 95;
export const MAPSEC_CINNABAR_ISLAND = 96;
export const MAPSEC_INDIGO_PLATEAU = 97;
export const MAPSEC_SAFFRON_CITY = 98;
export const MAPSEC_ROUTE_4_POKECENTER = 99;
export const MAPSEC_ROUTE_10_POKECENTER = 100;
export const MAPSEC_ROUTE_1 = 101;
export const MAPSEC_ROUTE_2 = 102;
export const MAPSEC_ROUTE_3 = 103;
export const MAPSEC_ROUTE_4 = 104;
export const MAPSEC_ROUTE_5 = 105;
export const MAPSEC_ROUTE_6 = 106;
export const MAPSEC_ROUTE_7 = 107;
export const MAPSEC_ROUTE_8 = 108;
export const MAPSEC_ROUTE_9 = 109;
export const MAPSEC_ROUTE_10 = 110;
export const MAPSEC_ROUTE_11 = 111;
export const MAPSEC_ROUTE_12 = 112;
export const MAPSEC_ROUTE_13 = 113;
export const MAPSEC_ROUTE_14 = 114;
export const MAPSEC_ROUTE_15 = 115;
export const MAPSEC_ROUTE_16 = 116;
export const MAPSEC_ROUTE_17 = 117;
export const MAPSEC_ROUTE_18 = 118;
export const MAPSEC_ROUTE_19 = 119;
export const MAPSEC_ROUTE_20 = 120;
export const MAPSEC_ROUTE_21 = 121;
export const MAPSEC_ROUTE_22 = 122;
export const MAPSEC_ROUTE_23 = 123;
export const MAPSEC_ROUTE_24 = 124;
export const MAPSEC_ROUTE_25 = 125;
export const MAPSEC_VIRIDIAN_FOREST = 126;
export const MAPSEC_MT_MOON = 127;
export const MAPSEC_S_S_ANNE = 128;
export const MAPSEC_UNDERGROUND_PATH = 129;
export const MAPSEC_UNDERGROUND_PATH_2 = 130;
export const MAPSEC_DIGLETTS_CAVE = 131;
export const MAPSEC_KANTO_VICTORY_ROAD = 132;
export const MAPSEC_ROCKET_HIDEOUT = 133;
export const MAPSEC_SILPH_CO = 134;
export const MAPSEC_POKEMON_MANSION = 135;
export const MAPSEC_KANTO_SAFARI_ZONE = 136;
export const MAPSEC_POKEMON_LEAGUE = 137;
export const MAPSEC_ROCK_TUNNEL = 138;
export const MAPSEC_SEAFOAM_ISLANDS = 139;
export const MAPSEC_POKEMON_TOWER = 140;
export const MAPSEC_CERULEAN_CAVE = 141;
export const MAPSEC_POWER_PLANT = 142;
export const MAPSEC_ONE_ISLAND = 143;
export const MAPSEC_TWO_ISLAND = 144;
export const MAPSEC_THREE_ISLAND = 145;
export const MAPSEC_FOUR_ISLAND = 146;
export const MAPSEC_FIVE_ISLAND = 147;
export const MAPSEC_KINDLE_ROAD = 150;
export const MAPSEC_TREASURE_BEACH = 151;
export const MAPSEC_CAPE_BRINK = 152;
export const MAPSEC_BOND_BRIDGE = 153;
export const MAPSEC_THREE_ISLE_PORT = 154;
export const MAPSEC_RESORT_GORGEOUS = 159;
export const MAPSEC_WATER_LABYRINTH = 160;
export const MAPSEC_FIVE_ISLE_MEADOW = 161;
export const MAPSEC_MEMORIAL_PILLAR = 162;
export const MAPSEC_OUTCAST_ISLAND = 163;
export const MAPSEC_GREEN_PATH = 164;
export const MAPSEC_WATER_PATH = 165;
export const MAPSEC_RUIN_VALLEY = 166;
export const MAPSEC_TRAINER_TOWER = 167;
export const MAPSEC_CANYON_ENTRANCE = 168;
export const MAPSEC_SEVAULT_CANYON = 169;
export const MAPSEC_TANOBY_RUINS = 170;
export const MAPSEC_MT_EMBER = 175;
export const MAPSEC_BERRY_FOREST = 176;
export const MAPSEC_ICEFALL_CAVE = 177;
export const MAPSEC_ROCKET_WAREHOUSE = 178;
export const MAPSEC_DOTTED_HOLE = 180;
export const MAPSEC_LOST_CAVE = 181;
export const MAPSEC_PATTERN_BUSH = 182;
export const MAPSEC_ALTERING_CAVE = 183;
export const MAPSEC_THREE_ISLE_PATH = 185;
export const MAPSEC_MONEAN_CHAMBER = 189;
export const MAPSEC_LIPTOO_CHAMBER = 190;
export const MAPSEC_WEEPTH_CHAMBER = 191;
export const MAPSEC_DILFORD_CHAMBER = 192;
export const MAPSEC_SCUFIB_CHAMBER = 193;
export const MAPSEC_RIXY_CHAMBER = 194;
export const MAPSEC_VIAPOIS_CHAMBER = 195;

export interface WildPokemon {
  species: number;
  minLevel?: number;
  maxLevel?: number;
}

export interface WildPokemonInfo {
  wildPokemon: readonly WildPokemon[];
}

export interface WildPokemonHeader {
  mapGroup: number;
  mapNum: number;
  landMonsInfo: WildPokemonInfo | null;
  waterMonsInfo: WildPokemonInfo | null;
  rockSmashMonsInfo: WildPokemonInfo | null;
  fishingMonsInfo: WildPokemonInfo | null;
}

export interface WildPokemonAreaRuntime {
  wildMonHeaders: readonly WildPokemonHeader[];
  mapSectionByLocation: Record<string, number>;
  unlockedSeviiAreas: number;
  vars: Map<number, number>;
  starterSpecies: number;
  roamerLocationMapSectionId: number;
}

type DexAreaPair = readonly [number, number];

export const dexAreasKanto: readonly DexAreaPair[] = [
  [MAPSEC_PALLET_TOWN, DEX_AREA_PALLET_TOWN],
  [MAPSEC_VIRIDIAN_CITY, DEX_AREA_VIRIDIAN_CITY],
  [MAPSEC_PEWTER_CITY, DEX_AREA_PEWTER_CITY],
  [MAPSEC_CERULEAN_CITY, DEX_AREA_CERULEAN_CITY],
  [MAPSEC_LAVENDER_TOWN, DEX_AREA_LAVENDER_TOWN],
  [MAPSEC_VERMILION_CITY, DEX_AREA_VERMILION_CITY],
  [MAPSEC_CELADON_CITY, DEX_AREA_CELADON_CITY],
  [MAPSEC_FUCHSIA_CITY, DEX_AREA_FUCHSIA_CITY],
  [MAPSEC_CINNABAR_ISLAND, DEX_AREA_CINNABAR_ISLAND],
  [MAPSEC_INDIGO_PLATEAU, DEX_AREA_INDIGO_PLATEAU],
  [MAPSEC_SAFFRON_CITY, DEX_AREA_SAFFRON_CITY],
  [MAPSEC_ROUTE_4_POKECENTER, DEX_AREA_ROUTE_4],
  [MAPSEC_ROUTE_10_POKECENTER, DEX_AREA_ROUTE_10],
  [MAPSEC_ROUTE_1, DEX_AREA_ROUTE_1],
  [MAPSEC_ROUTE_2, DEX_AREA_ROUTE_2],
  [MAPSEC_ROUTE_3, DEX_AREA_ROUTE_3],
  [MAPSEC_ROUTE_4, DEX_AREA_ROUTE_4],
  [MAPSEC_ROUTE_5, DEX_AREA_ROUTE_5],
  [MAPSEC_ROUTE_6, DEX_AREA_ROUTE_6],
  [MAPSEC_ROUTE_7, DEX_AREA_ROUTE_7],
  [MAPSEC_ROUTE_8, DEX_AREA_ROUTE_8],
  [MAPSEC_ROUTE_9, DEX_AREA_ROUTE_9],
  [MAPSEC_ROUTE_10, DEX_AREA_ROUTE_10],
  [MAPSEC_ROUTE_11, DEX_AREA_ROUTE_11],
  [MAPSEC_ROUTE_12, DEX_AREA_ROUTE_12],
  [MAPSEC_ROUTE_13, DEX_AREA_ROUTE_13],
  [MAPSEC_ROUTE_14, DEX_AREA_ROUTE_14],
  [MAPSEC_ROUTE_15, DEX_AREA_ROUTE_15],
  [MAPSEC_ROUTE_16, DEX_AREA_ROUTE_16],
  [MAPSEC_ROUTE_17, DEX_AREA_ROUTE_17],
  [MAPSEC_ROUTE_18, DEX_AREA_ROUTE_18],
  [MAPSEC_ROUTE_19, DEX_AREA_ROUTE_19],
  [MAPSEC_ROUTE_20, DEX_AREA_ROUTE_20],
  [MAPSEC_ROUTE_21, DEX_AREA_ROUTE_21],
  [MAPSEC_ROUTE_22, DEX_AREA_ROUTE_22],
  [MAPSEC_ROUTE_23, DEX_AREA_ROUTE_23],
  [MAPSEC_ROUTE_24, DEX_AREA_ROUTE_24],
  [MAPSEC_ROUTE_25, DEX_AREA_ROUTE_25],
  [MAPSEC_VIRIDIAN_FOREST, DEX_AREA_VIRIDIAN_FOREST],
  [MAPSEC_MT_MOON, DEX_AREA_MT_MOON],
  [MAPSEC_S_S_ANNE, DEX_AREA_VERMILION_CITY],
  [MAPSEC_UNDERGROUND_PATH, DEX_AREA_SAFFRON_CITY],
  [MAPSEC_UNDERGROUND_PATH_2, DEX_AREA_SAFFRON_CITY],
  [MAPSEC_DIGLETTS_CAVE, DEX_AREA_DIGLETTS_CAVE],
  [MAPSEC_KANTO_VICTORY_ROAD, DEX_AREA_VICTORY_ROAD],
  [MAPSEC_ROCKET_HIDEOUT, DEX_AREA_CELADON_CITY],
  [MAPSEC_SILPH_CO, DEX_AREA_SAFFRON_CITY],
  [MAPSEC_POKEMON_MANSION, DEX_AREA_POKEMON_MANSION],
  [MAPSEC_KANTO_SAFARI_ZONE, DEX_AREA_SAFARI_ZONE],
  [MAPSEC_POKEMON_LEAGUE, DEX_AREA_VICTORY_ROAD],
  [MAPSEC_ROCK_TUNNEL, DEX_AREA_ROCK_TUNNEL],
  [MAPSEC_SEAFOAM_ISLANDS, DEX_AREA_SEAFOAM_ISLANDS],
  [MAPSEC_POKEMON_TOWER, DEX_AREA_POKEMON_TOWER],
  [MAPSEC_CERULEAN_CAVE, DEX_AREA_CERULEAN_CAVE],
  [MAPSEC_POWER_PLANT, DEX_AREA_POWER_PLANT]
];

export const seviiDexAreas: readonly (readonly DexAreaPair[])[] = [
  [[MAPSEC_KINDLE_ROAD, DEX_AREA_KINDLE_ROAD], [MAPSEC_TREASURE_BEACH, DEX_AREA_TREASURE_BEACH], [MAPSEC_ONE_ISLAND, DEX_AREA_ONE_ISLAND], [MAPSEC_MT_EMBER, DEX_AREA_MT_EMBER]],
  [[MAPSEC_CAPE_BRINK, DEX_AREA_CAPE_BRINK], [MAPSEC_TWO_ISLAND, DEX_AREA_TWO_ISLAND]],
  [[MAPSEC_BOND_BRIDGE, DEX_AREA_BOND_BRIDGE], [MAPSEC_THREE_ISLE_PORT, DEX_AREA_THREE_ISLE_PATH], [MAPSEC_THREE_ISLAND, DEX_AREA_THREE_ISLAND], [MAPSEC_BERRY_FOREST, DEX_AREA_BERRY_FOREST], [MAPSEC_THREE_ISLE_PATH, DEX_AREA_THREE_ISLE_PATH]],
  [[MAPSEC_FOUR_ISLAND, DEX_AREA_FOUR_ISLAND], [MAPSEC_ICEFALL_CAVE, DEX_AREA_ICEFALL_CAVE]],
  [[MAPSEC_RESORT_GORGEOUS, DEX_AREA_RESORT_GORGEOUS], [MAPSEC_WATER_LABYRINTH, DEX_AREA_WATER_LABYRINTH], [MAPSEC_FIVE_ISLE_MEADOW, DEX_AREA_FIVE_ISLE_MEADOW], [MAPSEC_MEMORIAL_PILLAR, DEX_AREA_MEMORIAL_PILLAR], [MAPSEC_FIVE_ISLAND, DEX_AREA_FIVE_ISLAND], [MAPSEC_ROCKET_WAREHOUSE, DEX_AREA_FIVE_ISLE_MEADOW], [MAPSEC_LOST_CAVE, DEX_AREA_LOST_CAVE]],
  [[MAPSEC_OUTCAST_ISLAND, DEX_AREA_OUTCAST_ISLAND], [MAPSEC_GREEN_PATH, DEX_AREA_GREEN_PATH], [MAPSEC_WATER_PATH, DEX_AREA_WATER_PATH], [MAPSEC_RUIN_VALLEY, DEX_AREA_RUIN_VALLEY], [MAPSEC_DOTTED_HOLE, DEX_AREA_DOTTED_HOLE], [MAPSEC_PATTERN_BUSH, DEX_AREA_PATTERN_BUSH], [MAPSEC_ALTERING_CAVE, DEX_AREA_ALTERING_CAVE]],
  [[MAPSEC_TRAINER_TOWER, DEX_AREA_TRAINER_TOWER], [MAPSEC_CANYON_ENTRANCE, DEX_AREA_CANYON_ENTRANCE], [MAPSEC_SEVAULT_CANYON, DEX_AREA_SEVAULT_CANYON], [MAPSEC_TANOBY_RUINS, DEX_AREA_TANOBY_RUINS], [MAPSEC_MONEAN_CHAMBER, DEX_AREA_TANOBY_CHAMBER], [MAPSEC_LIPTOO_CHAMBER, DEX_AREA_TANOBY_CHAMBER], [MAPSEC_WEEPTH_CHAMBER, DEX_AREA_TANOBY_CHAMBER], [MAPSEC_DILFORD_CHAMBER, DEX_AREA_TANOBY_CHAMBER], [MAPSEC_SCUFIB_CHAMBER, DEX_AREA_TANOBY_CHAMBER], [MAPSEC_RIXY_CHAMBER, DEX_AREA_TANOBY_CHAMBER], [MAPSEC_VIAPOIS_CHAMBER, DEX_AREA_TANOBY_CHAMBER]]
];

const roamerPairs: readonly { roamer: number; starter: number }[] = [
  { roamer: SPECIES_ENTEI, starter: SPECIES_BULBASAUR },
  { roamer: SPECIES_SUICUNE, starter: SPECIES_CHARMANDER },
  { roamer: SPECIES_RAIKOU, starter: SPECIES_SQUIRTLE }
];

export const createWildPokemonAreaRuntime = (): WildPokemonAreaRuntime => ({
  wildMonHeaders: [],
  mapSectionByLocation: {},
  unlockedSeviiAreas: 0,
  vars: new Map(),
  starterSpecies: 0,
  roamerLocationMapSectionId: DEX_AREA_NONE
});

export const varGet = (runtime: WildPokemonAreaRuntime, variable: number): number =>
  runtime.vars.get(variable) ?? 0;

export const varSet = (
  runtime: WildPokemonAreaRuntime,
  variable: number,
  value: number
): void => {
  runtime.vars.set(variable, value & 0xffff);
};

export const findDexAreaByMapSec = (
  mapSecId: number,
  table: readonly DexAreaPair[],
  startIndex: number
): { found: true; dexArea: number; nextIndex: number } | { found: false } => {
  for (let i = startIndex; i < table.length; i += 1) {
    if (table[i][0] === mapSecId) {
      return { found: true, dexArea: table[i][1], nextIndex: i + 1 };
    }
  }
  return { found: false };
};

export function FindDexAreaByMapSec(
  mapSecId: number,
  table: readonly DexAreaPair[],
  startIndex: number
): { found: true; dexArea: number; nextIndex: number } | { found: false } {
  return findDexAreaByMapSec(mapSecId, table, startIndex);
}

export const isSpeciesInEncounterTable = (
  info: WildPokemonInfo | null,
  species: number,
  count: number
): boolean => {
  if (info !== null) {
    for (let i = 0; i < count; i += 1) {
      if (info.wildPokemon[i]?.species === species) {
        return true;
      }
    }
  }
  return false;
};

export function IsSpeciesInEncounterTable(
  info: WildPokemonInfo | null,
  species: number,
  count: number
): boolean {
  return isSpeciesInEncounterTable(info, species, count);
}

export const isSpeciesOnMap = (data: WildPokemonHeader, species: number): boolean => {
  if (isSpeciesInEncounterTable(data.landMonsInfo, species, LAND_WILD_COUNT)) {
    return true;
  }
  if (isSpeciesInEncounterTable(data.waterMonsInfo, species, WATER_WILD_COUNT)) {
    return true;
  }
  if (isSpeciesInEncounterTable(data.fishingMonsInfo, species, LAND_WILD_COUNT)) {
    return true;
  }
  if (isSpeciesInEncounterTable(data.rockSmashMonsInfo, species, ROCK_WILD_COUNT)) {
    return true;
  }
  return false;
};

export function IsSpeciesOnMap(data: WildPokemonHeader, species: number): boolean {
  return isSpeciesOnMap(data, species);
}

export const getMapSecIdFromWildMonHeader = (
  runtime: WildPokemonAreaRuntime,
  header: WildPokemonHeader
): number => runtime.mapSectionByLocation[`${header.mapGroup}:${header.mapNum}`] ?? DEX_AREA_NONE;

export function GetMapSecIdFromWildMonHeader(
  runtime: WildPokemonAreaRuntime,
  header: WildPokemonHeader
): number {
  return getMapSecIdFromWildMonHeader(runtime, header);
}

export const getRoamerIndex = (species: number): number => {
  for (let i = 0; i < roamerPairs.length; i += 1) {
    if (roamerPairs[i].roamer === species) {
      return i;
    }
  }
  return -1;
};

export function GetRoamerIndex(species: number): number {
  return getRoamerIndex(species);
}

const pushAreaMarkersForMapSec = (
  mapSecId: number,
  table: readonly DexAreaPair[],
  out: PokedexAreaMarkerSubsprite[]
): void => {
  let tableIndex = 0;
  while (true) {
    const result = findDexAreaByMapSec(mapSecId, table, tableIndex);
    if (!result.found) {
      return;
    }
    tableIndex = result.nextIndex;
    if (result.dexArea !== DEX_AREA_NONE) {
      out.push(getAreaMarkerSubsprite(result.dexArea));
    }
  }
};

export const getRoamerPokedexAreaMarkers = (
  runtime: WildPokemonAreaRuntime,
  species: number
): PokedexAreaMarkerSubsprite[] => {
  const roamerIdx = getRoamerIndex(species);
  if (roamerIdx < 0) {
    return [];
  }
  if (roamerPairs[roamerIdx].starter !== runtime.starterSpecies) {
    return [];
  }

  const out: PokedexAreaMarkerSubsprite[] = [];
  const result = findDexAreaByMapSec(runtime.roamerLocationMapSectionId, dexAreasKanto, 0);
  if (result.found && result.dexArea !== DEX_AREA_NONE) {
    out.push(getAreaMarkerSubsprite(result.dexArea));
  }
  return out;
};

export function GetRoamerPokedexAreaMarkers(
  runtime: WildPokemonAreaRuntime,
  species: number
): PokedexAreaMarkerSubsprite[] {
  return getRoamerPokedexAreaMarkers(runtime, species);
}

export const getSpeciesPokedexAreaMarkers = (
  runtime: WildPokemonAreaRuntime,
  species: number
): PokedexAreaMarkerSubsprite[] => {
  if (getRoamerIndex(species) >= 0) {
    return getRoamerPokedexAreaMarkers(runtime, species);
  }

  const seviiAreas = runtime.unlockedSeviiAreas;
  let alteringCaveCount = 0;
  let alteringCaveNum = varGet(runtime, VAR_ALTERING_CAVE_WILD_SET);
  if (alteringCaveNum >= NUM_ALTERING_CAVE_TABLES) {
    alteringCaveNum = 0;
  }

  const out: PokedexAreaMarkerSubsprite[] = [];
  for (let i = 0; i < runtime.wildMonHeaders.length; i += 1) {
    const header = runtime.wildMonHeaders[i];
    const mapSecId = getMapSecIdFromWildMonHeader(runtime, header);
    if (mapSecId === MAPSEC_ALTERING_CAVE) {
      alteringCaveCount += 1;
      if (alteringCaveNum !== alteringCaveCount - 1) {
        continue;
      }
    }

    if (isSpeciesOnMap(header, species)) {
      pushAreaMarkersForMapSec(mapSecId, dexAreasKanto, out);
      for (let j = 0; j < seviiDexAreas.length; j += 1) {
        if (((seviiAreas >> j) & 1) !== 0) {
          pushAreaMarkersForMapSec(mapSecId, seviiDexAreas[j], out);
        }
      }
    }
  }
  return out;
};

export function GetSpeciesPokedexAreaMarkers(
  runtime: WildPokemonAreaRuntime,
  species: number
): PokedexAreaMarkerSubsprite[] {
  return getSpeciesPokedexAreaMarkers(runtime, species);
}
