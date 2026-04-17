import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadFuchsiaCityMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import fuchsiaCityMapJson from '../src/world/maps/fuchsiaCity.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Fuchsia City compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(fuchsiaCityMapJson).toEqual(exportMap('FuchsiaCity'));
  });

  test('loads Fuchsia City into the runtime tile map shape', () => {
    const exported = exportMap('FuchsiaCity');
    const map = loadFuchsiaCityMap();

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
    const baseSource = fuchsiaCityMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Fuchsia City event parity', () => {
    const compactSource = parseCompactMapSource(fuchsiaCityMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(fuchsiaCityMapJson.metadata.connections);
    expect(map.connections).toEqual([
      { map: 'MAP_ROUTE19', offset: 12, direction: 'down' },
      { map: 'MAP_ROUTE18', offset: 10, direction: 'left' },
      { map: 'MAP_ROUTE15', offset: 10, direction: 'right' }
    ]);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.encounterTiles?.filter((tile) => tile === 'L')).toHaveLength(3);
    expect(map.encounterTiles?.filter((tile) => tile === 'W')).toHaveLength(78);
    expect(map.triggers).toHaveLength(12);
    expect(map.triggers?.slice(0, 4)).toEqual([
      {
        id: 'FuchsiaCity_EventScript_CitySign',
        x: 31,
        y: 18,
        activation: 'interact',
        scriptId: 'FuchsiaCity_EventScript_CitySign',
        facing: 'any',
        once: false
      },
      {
        id: 'FuchsiaCity_EventScript_SafariZoneSign',
        x: 26,
        y: 18,
        activation: 'interact',
        scriptId: 'FuchsiaCity_EventScript_SafariZoneSign',
        facing: 'any',
        once: false
      },
      {
        id: 'FuchsiaCity_EventScript_GymSign',
        x: 5,
        y: 32,
        activation: 'interact',
        scriptId: 'FuchsiaCity_EventScript_GymSign',
        facing: 'any',
        once: false
      },
      {
        id: 'FuchsiaCity_EventScript_WardensHomeSign',
        x: 31,
        y: 31,
        activation: 'interact',
        scriptId: 'FuchsiaCity_EventScript_WardensHomeSign',
        facing: 'any',
        once: false
      }
    ]);
    expect(map.hiddenItems).toEqual([
      {
        x: 33,
        y: 26,
        elevation: 3,
        item: 'ITEM_MAX_REVIVE',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_FUCHSIA_CITY_MAX_REVIVE',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(16);
    expect(map.npcs?.find((npc) => npc.id === 'FuchsiaCity_ObjectEvent_Erik')).toEqual({
      id: 'FuchsiaCity_ObjectEvent_Erik',
      x: 37,
      y: 17,
      graphicsId: 'OBJ_EVENT_GFX_FAT_MAN',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'FuchsiaCity_EventScript_Erik',
      flag: '0'
    });
    expect(map.npcs?.find((npc) => npc.id === 'FuchsiaCity_ObjectEvent_SubstituteTutor')).toEqual({
      id: 'FuchsiaCity_ObjectEvent_SubstituteTutor',
      x: 15,
      y: 11,
      graphicsId: 'OBJ_EVENT_GFX_BUG_CATCHER',
      movementType: 'MOVEMENT_TYPE_FACE_UP',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'FuchsiaCity_EventScript_SubstituteTutor',
      flag: '0'
    });
    expect(map.npcs?.filter((npc) => npc.graphicsId === 'OBJ_EVENT_GFX_CUT_TREE')).toEqual([
      {
        id: 'FuchsiaCity_ObjectEvent_11',
        x: 30,
        y: 10,
        graphicsId: 'OBJ_EVENT_GFX_CUT_TREE',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'EventScript_CutTree',
        flag: 'FLAG_TEMP_12'
      },
      {
        id: 'FuchsiaCity_ObjectEvent_12',
        x: 21,
        y: 13,
        graphicsId: 'OBJ_EVENT_GFX_CUT_TREE',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'EventScript_CutTree',
        flag: 'FLAG_TEMP_13'
      },
      {
        id: 'FuchsiaCity_ObjectEvent_13',
        x: 32,
        y: 16,
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
        id: 'FuchsiaCity_ObjectEvent_14',
        x: 24,
        y: 22,
        graphicsId: 'OBJ_EVENT_GFX_CUT_TREE',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'EventScript_CutTree',
        flag: 'FLAG_TEMP_15'
      }
    ]);
    expect(map.warps).toHaveLength(11);
    expect(map.warps?.[0]).toEqual({
      x: 24,
      y: 5,
      elevation: 0,
      destMap: 'MAP_FUCHSIA_CITY_SAFARI_ZONE_ENTRANCE',
      destWarpId: 2
    });
    expect(map.warps?.slice(6, 10)).toEqual([
      { x: 25, y: 31, elevation: 3, destMap: 'MAP_FUCHSIA_CITY_POKEMON_CENTER_1F', destWarpId: 1 },
      { x: 38, y: 31, elevation: 0, destMap: 'MAP_FUCHSIA_CITY_HOUSE2', destWarpId: 1 },
      { x: 39, y: 28, elevation: 3, destMap: 'MAP_FUCHSIA_CITY_HOUSE2', destWarpId: 3 },
      { x: 39, y: 29, elevation: 3, destMap: 'MAP_FUCHSIA_CITY_HOUSE2', destWarpId: 3 }
    ]);
    expect(map.warps?.at(-1)).toEqual({
      x: 19,
      y: 31,
      elevation: 0,
      destMap: 'MAP_FUCHSIA_CITY_HOUSE3',
      destWarpId: 0
    });
  });
});
