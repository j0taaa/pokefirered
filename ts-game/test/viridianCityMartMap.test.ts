import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadViridianCityMartMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import viridianCityMartMapJson from '../src/world/maps/viridianCityMart.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Viridian City Mart compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(viridianCityMartMapJson).toEqual(JSON.parse(JSON.stringify(exportMap('ViridianCity_Mart'))));
  });

  test('loads Viridian City Mart into the runtime tile map shape', () => {
    const exported = exportMap('ViridianCity_Mart');
    const map = loadViridianCityMartMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.tileSize).toBe(exported.tileSize);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.connections).toEqual([]);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exported.encounterRows));
    expect(map.wildEncounters).toEqual(undefined);
    expect(map.triggers).toMatchObject([]);
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.hiddenItems).toEqual([]);
    expect(map.warps).toEqual(exported.warps);
  });

  test('validates compact rows and preserves npc and warp parity', () => {
    const baseSource = viridianCityMartMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(viridianCityMartMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toMatchObject([]);
    expect(map.hiddenItems).toEqual([]);
    expect(map.warps).toEqual([
      { x: 3, y: 7, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 4 },
      { x: 4, y: 7, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 4 },
      { x: 5, y: 7, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 4 }
    ]);
    expect(map.npcs).toEqual([
      {
        id: 'LOCALID_VIRIDIAN_MART_CLERK',
        x: 2,
        y: 3,
        graphicsId: 'OBJ_EVENT_GFX_CLERK',
        movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'ViridianCity_Mart_EventScript_Clerk',
        flag: '0'
      },
      {
        id: 'ViridianCity_Mart_ObjectEvent_Youngster',
        x: 6,
        y: 2,
        graphicsId: 'OBJ_EVENT_GFX_YOUNGSTER',
        movementType: 'MOVEMENT_TYPE_WANDER_AROUND',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'ViridianCity_Mart_EventScript_Youngster',
        flag: '0'
      },
      {
        id: 'ViridianCity_Mart_ObjectEvent_Woman',
        x: 9,
        y: 5,
        graphicsId: 'OBJ_EVENT_GFX_WOMAN_1',
        movementType: 'MOVEMENT_TYPE_WANDER_UP_AND_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'ViridianCity_Mart_EventScript_Woman',
        flag: '0'
      }
    ]);
  });
});
