import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute21SouthMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route21SouthMapJson from '../src/world/maps/route21South.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 21 South compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route21SouthMapJson).toEqual(exportMap('Route21_South'));
  });

  test('loads Route 21 South into the runtime tile map shape', () => {
    const exportedRoute21South = exportMap('Route21_South');
    const map = loadRoute21SouthMap();

    expect(map.id).toBe(exportedRoute21South.id);
    expect(map.width).toBe(exportedRoute21South.width);
    expect(map.height).toBe(exportedRoute21South.height);
    expect(map.tileSize).toBe(exportedRoute21South.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedRoute21South.collisionRows));
    expect(map.connections).toEqual(exportedRoute21South.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedRoute21South.encounterRows));
    expect(map.wildEncounters).toEqual(exportedRoute21South.wildEncounters);
    expect(map.triggers).toEqual(exportedRoute21South.triggers);
    expect(map.visual).toEqual(exportedRoute21South.visual);
    expect(map.npcs).toEqual(exportedRoute21South.npcs);
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = route21SouthMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Route 21 South event parity', () => {
    const compactSource = parseCompactMapSource(route21SouthMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(route21SouthMapJson.metadata.connections);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.encounterTiles?.filter((tile) => tile === 'W').length).toBeGreaterThan(0);
    expect(map.triggers).toMatchObject([]);
    expect(map.npcs).toHaveLength(5);
    expect(map.npcs[0]).toEqual({
      id: 'Route21_South_ObjectEvent_Claude',
      x: 11,
      y: 8,
      graphicsId: 'OBJ_EVENT_GFX_FISHER',
      movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NORMAL',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'Route21_South_EventScript_Claude',
      flag: '0'
    });
    expect(map.npcs.at(-1)).toEqual({
      id: 'Route21_South_ObjectEvent_Roland',
      x: 10,
      y: 29,
      graphicsId: 'OBJ_EVENT_GFX_SWIMMER_M_WATER',
      movementType: 'MOVEMENT_TYPE_WANDER_AROUND',
      movementRangeX: 2,
      movementRangeY: 2,
      trainerType: 'TRAINER_TYPE_NORMAL',
      trainerSightOrBerryTreeId: 4,
      scriptId: 'Route21_South_EventScript_Roland',
      flag: '0'
    });
  });
});
