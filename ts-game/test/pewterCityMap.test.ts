import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadPewterCityMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import pewterCityMapJson from '../src/world/maps/pewterCity.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Pewter City compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(pewterCityMapJson).toEqual(exportMap('PewterCity'));
  });

  test('loads Pewter City into the runtime tile map shape', () => {
    const exportedPewterCity = exportMap('PewterCity');
    const map = loadPewterCityMap();

    expect(map.id).toBe(exportedPewterCity.id);
    expect(map.width).toBe(exportedPewterCity.width);
    expect(map.height).toBe(exportedPewterCity.height);
    expect(map.tileSize).toBe(exportedPewterCity.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedPewterCity.collisionRows));
    expect(map.connections).toEqual(exportedPewterCity.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedPewterCity.encounterRows));
    expect(map.wildEncounters).toEqual(exportedPewterCity.wildEncounters);
    expect(map.triggers).toEqual(exportedPewterCity.triggers);
    expect(map.visual).toEqual(exportedPewterCity.visual);
    expect(map.npcs).toEqual(exportedPewterCity.npcs);
    expect(map.hiddenItems).toEqual(exportedPewterCity.hiddenItems);
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = pewterCityMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Pewter City event parity', () => {
    const compactSource = parseCompactMapSource(pewterCityMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(pewterCityMapJson.metadata.connections);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.encounterTiles?.filter((tile) => tile === 'L')).toHaveLength(0);
    expect(map.triggers).toHaveLength(13);
    expect(map.hiddenItems).toEqual([
      {
        x: 6,
        y: 3,
        elevation: 3,
        item: 'ITEM_POKE_BALL',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_PEWTER_CITY_POKE_BALL',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(7);
    expect(map.npcs[0]).toEqual({
      id: 'PewterCity_ObjectEvent_Lass',
      x: 6,
      y: 15,
      graphicsId: 'OBJ_EVENT_GFX_LASS',
      movementType: 'MOVEMENT_TYPE_LOOK_AROUND',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'PewterCity_EventScript_Lass',
      flag: '0'
    });
    expect(map.npcs.at(-1)).toEqual({
      id: 'LOCALID_PEWTER_AIDE',
      x: 46,
      y: 20,
      graphicsId: 'OBJ_EVENT_GFX_SCIENTIST',
      movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'PewterCity_EventScript_RunningShoesAide',
      flag: 'FLAG_HIDE_PEWTER_CITY_RUNNING_SHOES_GUY'
    });
  });
});
