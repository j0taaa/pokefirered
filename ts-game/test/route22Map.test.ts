import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute22Map,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route22MapJson from '../src/world/maps/route22.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 22 compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route22MapJson).toEqual(exportMap('Route22'));
  });

  test('loads Route 22 into the runtime tile map shape', () => {
    const exportedRoute22 = exportMap('Route22');
    const map = loadRoute22Map();

    expect(map.id).toBe(exportedRoute22.id);
    expect(map.width).toBe(exportedRoute22.width);
    expect(map.height).toBe(exportedRoute22.height);
    expect(map.tileSize).toBe(exportedRoute22.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedRoute22.collisionRows));
    expect(map.connections).toEqual(exportedRoute22.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedRoute22.encounterRows));
    expect(map.wildEncounters).toEqual(exportedRoute22.wildEncounters);
    expect(map.triggers).toEqual(exportedRoute22.triggers);
    expect(map.visual).toEqual(exportedRoute22.visual);
    expect(map.npcs).toEqual(exportedRoute22.npcs);
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = route22MapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Route 22 event parity', () => {
    const compactSource = parseCompactMapSource(route22MapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(route22MapJson.metadata.connections);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.encounterTiles?.filter((tile) => tile === 'L').length).toBeGreaterThan(0);
    expect(map.triggers).toHaveLength(7);
    expect(map.npcs).toEqual([
      {
        id: 'LOCALID_ROUTE22_RIVAL',
        x: 25,
        y: 4,
        graphicsId: 'OBJ_EVENT_GFX_BLUE',
        movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: '0x0',
        flag: 'FLAG_HIDE_ROUTE_22_RIVAL'
      }
    ]);
  });
});
