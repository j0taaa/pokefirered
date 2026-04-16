import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute2Map,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route2MapJson from '../src/world/maps/route2.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 2 compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route2MapJson).toEqual(exportMap('Route2'));
  });

  test('loads Route 2 into the runtime tile map shape', () => {
    const exportedRoute2 = exportMap('Route2');
    const map = loadRoute2Map();

    expect(map.id).toBe(exportedRoute2.id);
    expect(map.width).toBe(exportedRoute2.width);
    expect(map.height).toBe(exportedRoute2.height);
    expect(map.tileSize).toBe(exportedRoute2.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedRoute2.collisionRows));
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedRoute2.encounterRows));
    expect(map.triggers).toEqual(exportedRoute2.triggers);
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = route2MapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles from compact rows', () => {
    const compactSource = parseCompactMapSource(route2MapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.encounterTiles?.filter((tile) => tile === 'L')).toHaveLength(84);
  });
});
