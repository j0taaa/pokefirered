import { describe, expect, test } from 'vitest';
import {
  DEX_AREA_ALTERING_CAVE,
  DEX_AREA_BERRY_FOREST,
  DEX_AREA_ROUTE_20,
  DEX_AREA_SAFFRON_CITY
} from '../src/game/decompPokedexAreaMarkers';
import { SPECIES_BULBASAUR, SPECIES_ENTEI, SPECIES_RAIKOU } from '../src/game/decompRoamer';
import {
  FISH_WILD_COUNT,
  LAND_WILD_COUNT,
  MAPSEC_ALTERING_CAVE,
  MAPSEC_BERRY_FOREST,
  MAPSEC_ROUTE_12,
  MAPSEC_ROUTE_20,
  MAPSEC_UNDERGROUND_PATH,
  SPECIES_SQUIRTLE,
  VAR_ALTERING_CAVE_WILD_SET,
  FindDexAreaByMapSec,
  GetMapSecIdFromWildMonHeader,
  GetRoamerIndex,
  GetRoamerPokedexAreaMarkers,
  GetSpeciesPokedexAreaMarkers,
  IsSpeciesInEncounterTable,
  IsSpeciesOnMap,
  createWildPokemonAreaRuntime,
  dexAreasKanto,
  findDexAreaByMapSec,
  getRoamerIndex,
  getRoamerPokedexAreaMarkers,
  getSpeciesPokedexAreaMarkers,
  isSpeciesInEncounterTable,
  isSpeciesOnMap,
  seviiDexAreas,
  varSet,
  type WildPokemonHeader,
  type WildPokemonInfo
} from '../src/game/decompWildPokemonArea';

const info = (species: readonly number[]): WildPokemonInfo => ({
  wildPokemon: species.map((s) => ({ species: s }))
});

const header = (
  mapGroup: number,
  mapNum: number,
  partial: Partial<WildPokemonHeader>
): WildPokemonHeader => ({
  mapGroup,
  mapNum,
  landMonsInfo: null,
  waterMonsInfo: null,
  rockSmashMonsInfo: null,
  fishingMonsInfo: null,
  ...partial
});

describe('decomp wild_pokemon_area', () => {
  test('FindDexAreaByMapSec returns the matching dex area and advances the table index', () => {
    const first = findDexAreaByMapSec(MAPSEC_ROUTE_20, dexAreasKanto, 0);
    expect(first).toEqual({ found: true, dexArea: DEX_AREA_ROUTE_20, nextIndex: 33 });

    const missing = findDexAreaByMapSec(MAPSEC_ROUTE_20, dexAreasKanto, first.found ? first.nextIndex : 0);
    expect(missing).toEqual({ found: false });

    expect(seviiDexAreas[2]).toContainEqual([MAPSEC_BERRY_FOREST, DEX_AREA_BERRY_FOREST]);
  });

  test('IsSpeciesInEncounterTable scans only the requested count', () => {
    const encounters = info([1, 2, 3, 4]);

    expect(isSpeciesInEncounterTable(encounters, 3, 3)).toBe(true);
    expect(isSpeciesInEncounterTable(encounters, 4, 3)).toBe(false);
    expect(isSpeciesInEncounterTable(null, 1, LAND_WILD_COUNT)).toBe(false);
  });

  test('IsSpeciesOnMap preserves the vanilla fishing table count bug', () => {
    const fishingSpecies = Array.from({ length: LAND_WILD_COUNT }, (_, i) => 100 + i);
    const data = header(1, 1, { fishingMonsInfo: info(fishingSpecies) });

    expect(FISH_WILD_COUNT).toBe(10);
    expect(isSpeciesOnMap(data, 109)).toBe(true);
    expect(isSpeciesOnMap(data, 111)).toBe(true);
  });

  test('GetSpeciesPokedexAreaMarkers emits Kanto markers and gated Sevii markers', () => {
    const runtime = createWildPokemonAreaRuntime();
    runtime.wildMonHeaders = [
      header(3, 12, { landMonsInfo: info([25]) }),
      header(1, 109, { landMonsInfo: info([25]) }),
      header(1, 31, { waterMonsInfo: info([25]) })
    ];
    runtime.mapSectionByLocation = {
      '3:12': MAPSEC_ROUTE_12,
      '1:109': MAPSEC_BERRY_FOREST,
      '1:31': MAPSEC_UNDERGROUND_PATH
    };

    expect(getSpeciesPokedexAreaMarkers(runtime, 25).map((s) => [s.x, s.y])).toEqual([
      [106, 25],
      [92, 24]
    ]);

    runtime.unlockedSeviiAreas = 1 << 2;
    expect(getSpeciesPokedexAreaMarkers(runtime, 25).map((s) => [s.x, s.y])).toEqual([
      [106, 25],
      [5, 52],
      [92, 24]
    ]);
  });

  test('GetSpeciesPokedexAreaMarkers selects the active Altering Cave table only', () => {
    const runtime = createWildPokemonAreaRuntime();
    runtime.unlockedSeviiAreas = 1 << 5;
    runtime.wildMonHeaders = [
      header(2, 1, { landMonsInfo: info([33]) }),
      header(2, 2, { landMonsInfo: info([33]) }),
      header(2, 3, { landMonsInfo: info([33]) })
    ];
    runtime.mapSectionByLocation = {
      '2:1': MAPSEC_ALTERING_CAVE,
      '2:2': MAPSEC_ALTERING_CAVE,
      '2:3': MAPSEC_ALTERING_CAVE
    };

    varSet(runtime, VAR_ALTERING_CAVE_WILD_SET, 1);
    expect(getSpeciesPokedexAreaMarkers(runtime, 33).map((s) => [s.x, s.y])).toEqual([[69, 73]]);

    varSet(runtime, VAR_ALTERING_CAVE_WILD_SET, 99);
    expect(getSpeciesPokedexAreaMarkers(runtime, 33).map((s) => [s.x, s.y])).toEqual([[69, 73]]);
    expect(DEX_AREA_ALTERING_CAVE).toBe(76);
  });

  test('roamer markers require matching roamer species and matching player starter', () => {
    const runtime = createWildPokemonAreaRuntime();
    runtime.starterSpecies = SPECIES_BULBASAUR;
    runtime.roamerLocationMapSectionId = MAPSEC_ROUTE_20;

    expect(getRoamerIndex(SPECIES_ENTEI)).toBe(0);
    expect(getRoamerIndex(SPECIES_RAIKOU)).toBe(2);
    expect(getRoamerPokedexAreaMarkers(runtime, SPECIES_ENTEI).map((s) => [s.x, s.y])).toEqual([[55, 58]]);
    expect(getRoamerPokedexAreaMarkers(runtime, SPECIES_RAIKOU)).toEqual([]);

    runtime.starterSpecies = SPECIES_SQUIRTLE;
    expect(getSpeciesPokedexAreaMarkers(runtime, SPECIES_RAIKOU).map((s) => [s.x, s.y])).toEqual([[55, 58]]);
  });

  test('special Kanto map sections map to their decomp dex display areas', () => {
    const result = findDexAreaByMapSec(MAPSEC_UNDERGROUND_PATH, dexAreasKanto, 0);
    expect(result).toEqual({ found: true, dexArea: DEX_AREA_SAFFRON_CITY, nextIndex: 42 });
  });

  test('exact C-name helpers dispatch through the same area marker logic', () => {
    const runtime = createWildPokemonAreaRuntime();
    runtime.wildMonHeaders = [
      header(1, 1, { landMonsInfo: info([25]) }),
      header(2, 2, { fishingMonsInfo: info(Array.from({ length: LAND_WILD_COUNT }, (_, i) => 100 + i)) })
    ];
    runtime.mapSectionByLocation = {
      '1:1': MAPSEC_ROUTE_20,
      '2:2': MAPSEC_UNDERGROUND_PATH
    };
    runtime.starterSpecies = SPECIES_BULBASAUR;
    runtime.roamerLocationMapSectionId = MAPSEC_ROUTE_20;

    expect(FindDexAreaByMapSec(MAPSEC_ROUTE_20, dexAreasKanto, 0)).toEqual({ found: true, dexArea: DEX_AREA_ROUTE_20, nextIndex: 33 });
    expect(GetMapSecIdFromWildMonHeader(runtime, runtime.wildMonHeaders[0])).toBe(MAPSEC_ROUTE_20);
    expect(IsSpeciesInEncounterTable(runtime.wildMonHeaders[0].landMonsInfo, 25, LAND_WILD_COUNT)).toBe(true);
    expect(IsSpeciesOnMap(runtime.wildMonHeaders[1], 111)).toBe(true);
    expect(GetRoamerIndex(SPECIES_ENTEI)).toBe(0);
    expect(GetRoamerPokedexAreaMarkers(runtime, SPECIES_ENTEI).map((s) => [s.x, s.y])).toEqual([[55, 58]]);
    expect(GetSpeciesPokedexAreaMarkers(runtime, 25).map((s) => [s.x, s.y])).toEqual([[55, 58]]);
  });
});
