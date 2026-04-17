import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadViridianCityPokemonCenter1FMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import viridianCityPokemonCenter1FMapJson from '../src/world/maps/viridianCityPokemonCenter1F.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Viridian City Pokemon Center 1F compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(viridianCityPokemonCenter1FMapJson).toEqual(exportMap('ViridianCity_PokemonCenter_1F'));
  });

  test('loads Viridian City Pokemon Center 1F into the runtime tile map shape', () => {
    const exported = exportMap('ViridianCity_PokemonCenter_1F');
    const map = loadViridianCityPokemonCenter1FMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.tileSize).toBe(exported.tileSize);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.connections).toEqual([]);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exported.encounterRows));
    expect(map.wildEncounters).toEqual(undefined);
    expect(map.triggers).toEqual([]);
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.hiddenItems).toEqual([]);
    expect(map.warps).toEqual(exported.warps);
  });

  test('validates compact rows and preserves nurse, NPC, and warp parity', () => {
    const baseSource = viridianCityPokemonCenter1FMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(viridianCityPokemonCenter1FMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toEqual([]);
    expect(map.hiddenItems).toEqual([]);
    expect(map.warps).toEqual([
      { x: 6, y: 8, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 0 },
      { x: 7, y: 8, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 0 },
      { x: 8, y: 8, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 0 },
      { x: 1, y: 6, elevation: 4, destMap: 'MAP_VIRIDIAN_CITY_POKEMON_CENTER_2F', destWarpId: 0 }
    ]);
    expect(map.npcs).toEqual([
      {
        id: 'LOCALID_VIRIDIAN_NURSE',
        x: 7,
        y: 2,
        graphicsId: 'OBJ_EVENT_GFX_NURSE',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'ViridianCity_PokemonCenter_1F_EventScript_Nurse',
        flag: '0'
      },
      {
        id: 'ViridianCity_PokemonCenter_1F_ObjectEvent_Gentleman',
        x: 12,
        y: 5,
        graphicsId: 'OBJ_EVENT_GFX_GENTLEMAN',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'ViridianCity_PokemonCenter_1F_EventScript_Gentleman',
        flag: '0'
      },
      {
        id: 'ViridianCity_PokemonCenter_1F_ObjectEvent_Boy',
        x: 4,
        y: 7,
        graphicsId: 'OBJ_EVENT_GFX_BOY',
        movementType: 'MOVEMENT_TYPE_LOOK_AROUND',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'ViridianCity_PokemonCenter_1F_EventScript_Boy',
        flag: '0'
      },
      {
        id: 'ViridianCity_PokemonCenter_1F_ObjectEvent_Youngster',
        x: 2,
        y: 3,
        graphicsId: 'OBJ_EVENT_GFX_YOUNGSTER',
        movementType: 'MOVEMENT_TYPE_WANDER_AROUND',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'ViridianCity_PokemonCenter_1F_EventScript_Youngster',
        flag: '0'
      }
    ]);
  });
});
