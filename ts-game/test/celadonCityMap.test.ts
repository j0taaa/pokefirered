import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadCeladonCityMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import celadonCityMapJson from '../src/world/maps/celadonCity.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Celadon City compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(celadonCityMapJson).toEqual(exportMap('CeladonCity'));
  });

  test('loads Celadon City into the runtime tile map shape', () => {
    const exported = exportMap('CeladonCity');
    const map = loadCeladonCityMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.tileSize).toBe(exported.tileSize);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.connections).toEqual(exported.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exported.encounterRows));
    expect(map.wildEncounters).toEqual(exported.wildEncounters);
    expect(map.triggers).toEqual(exported.triggers);
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.hiddenItems).toEqual(exported.hiddenItems);
    expect(map.warps).toEqual(exported.warps);
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = celadonCityMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Celadon City event parity', () => {
    const compactSource = parseCompactMapSource(celadonCityMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(celadonCityMapJson.metadata.connections);
    expect(map.connections).toEqual([
      { map: 'MAP_ROUTE16', offset: 10, direction: 'left' },
      { map: 'MAP_ROUTE7', offset: 10, direction: 'right' }
    ]);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toHaveLength(9);
    expect(map.triggers?.slice(0, 4)).toMatchObject([
      {
        id: 'CeladonCity_EventScript_TrainerTips2',
        x: 45,
        y: 23,
        activation: 'interact',
        scriptId: 'CeladonCity_EventScript_TrainerTips2',
        facing: 'any',
        once: false
      },
      {
        id: 'CeladonCity_EventScript_PrizeExchangeSign',
        x: 38,
        y: 23,
        activation: 'interact',
        scriptId: 'CeladonCity_EventScript_PrizeExchangeSign',
        facing: 'any',
        once: false
      },
      {
        id: 'CeladonCity_EventScript_GameCornerSign',
        x: 33,
        y: 23,
        activation: 'interact',
        scriptId: 'CeladonCity_EventScript_GameCornerSign',
        facing: 'any',
        once: false
      },
      {
        id: 'CeladonCity_EventScript_CitySign',
        x: 22,
        y: 18,
        activation: 'interact',
        scriptId: 'CeladonCity_EventScript_CitySign',
        facing: 'any',
        once: false
      }
    ]);
    expect(map.hiddenItems).toEqual([
      {
        x: 55,
        y: 20,
        elevation: 3,
        item: 'ITEM_PP_UP',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_CELADON_CITY_PP_UP',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(14);
    expect(map.npcs?.find((npc) => npc.id === 'CeladonCity_ObjectEvent_RocketGrunt1')).toEqual({
      id: 'CeladonCity_ObjectEvent_RocketGrunt1',
      x: 48,
      y: 15,
      graphicsId: 'OBJ_EVENT_GFX_ROCKET_M',
      movementType: 'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT',
      movementRangeX: 4,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'CeladonCity_EventScript_RocketGrunt1',
      flag: 'FLAG_HIDE_CELADON_ROCKETS'
    });
    expect(map.npcs?.find((npc) => npc.id === 'LOCALID_CELADON_POLIWRATH')).toEqual({
      id: 'LOCALID_CELADON_POLIWRATH',
      x: 36,
      y: 14,
      graphicsId: 'OBJ_EVENT_GFX_POLIWRATH',
      movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'CeladonCity_EventScript_Poliwrath',
      flag: '0'
    });
    expect(map.npcs?.filter((npc) => npc.graphicsId === 'OBJ_EVENT_GFX_CUT_TREE')).toEqual([
      {
        id: 'LOCALID_CELADON_BORDER_TREE',
        x: 52,
        y: 22,
        graphicsId: 'OBJ_EVENT_GFX_CUT_TREE',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'EventScript_CutTree',
        flag: 'FLAG_TEMP_14'
      },
      {
        id: 'CeladonCity_ObjectEvent_11',
        x: 40,
        y: 35,
        graphicsId: 'OBJ_EVENT_GFX_CUT_TREE',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'EventScript_CutTree',
        flag: 'FLAG_TEMP_13'
      }
    ]);
    expect(map.warps).toHaveLength(13);
    expect(map.warps?.[0]).toEqual({
      x: 34,
      y: 21,
      elevation: 0,
      destMap: 'MAP_CELADON_CITY_GAME_CORNER',
      destWarpId: 0
    });
    expect(map.warps?.at(-1)).toEqual({
      x: 31,
      y: 5,
      elevation: 0,
      destMap: 'MAP_CELADON_CITY_CONDOMINIUMS_1F',
      destWarpId: 5
    });
  });
});
