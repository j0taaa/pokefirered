import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute21NorthMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route21NorthMapJson from '../src/world/maps/route21North.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 21 North compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route21NorthMapJson).toEqual(exportMap('Route21_North'));
  });

  test('loads Route 21 North into the runtime tile map shape', () => {
    const exportedRoute21North = exportMap('Route21_North');
    const map = loadRoute21NorthMap();

    expect(map.id).toBe(exportedRoute21North.id);
    expect(map.width).toBe(exportedRoute21North.width);
    expect(map.height).toBe(exportedRoute21North.height);
    expect(map.tileSize).toBe(exportedRoute21North.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedRoute21North.collisionRows));
    expect(map.connections).toEqual(exportedRoute21North.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedRoute21North.encounterRows));
    expect(map.wildEncounters).toEqual(exportedRoute21North.wildEncounters);
    expect(map.triggers).toEqual(exportedRoute21North.triggers);
    expect(map.visual).toEqual(exportedRoute21North.visual);
    expect(map.npcs).toEqual(exportedRoute21North.npcs);
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = route21NorthMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Route 21 North event parity', () => {
    const compactSource = parseCompactMapSource(route21NorthMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(route21NorthMapJson.metadata.connections);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.encounterTiles?.filter((tile) => tile === 'L').length).toBeGreaterThan(0);
    expect(map.triggers).toEqual([
      {
        id: 'FLAG_HIDDEN_ITEM_ROUTE21_NORTH_PEARL.hiddenItem',
        x: 17,
        y: 42,
        activation: 'interact',
        scriptId: 'FLAG_HIDDEN_ITEM_ROUTE21_NORTH_PEARL.hiddenItem',
        facing: 'any',
        once: true,
        conditions: [{ flag: 'FLAG_HIDDEN_ITEM_ROUTE21_NORTH_PEARL', flagState: false }]
      }
    ]);
    expect(map.npcs).toHaveLength(5);
    expect(map.npcs[0]).toEqual({
      id: 'Route21_North_ObjectEvent_Ronald',
      x: 7,
      y: 27,
      graphicsId: 'OBJ_EVENT_GFX_FISHER',
      movementType: 'MOVEMENT_TYPE_FACE_UP',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NORMAL',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'Route21_North_EventScript_Ronald',
      flag: '0'
    });
    expect(map.npcs.at(-1)).toEqual({
      id: 'Route21_North_ObjectEvent_Ian',
      x: 15,
      y: 35,
      graphicsId: 'OBJ_EVENT_GFX_TUBER_M_WATER',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NORMAL',
      trainerSightOrBerryTreeId: 1,
      scriptId: 'Route21_North_EventScript_Ian',
      flag: '0'
    });
  });
});
