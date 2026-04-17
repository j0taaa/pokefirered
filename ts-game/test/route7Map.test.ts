import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute7Map,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route7MapJson from '../src/world/maps/route7.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 7 compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route7MapJson).toEqual(exportMap('Route7'));
  });

  test('loads Route 7 into the runtime tile map shape', () => {
    const exported = exportMap('Route7');
    const map = loadRoute7Map();

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
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = route7MapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Route 7 event parity', () => {
    const compactSource = parseCompactMapSource(route7MapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(route7MapJson.metadata.connections);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toHaveLength(2);
    expect(map.triggers[0]).toEqual({
      id: 'Route7_EventScript_UndergroundPathSign',
      x: 5,
      y: 14,
      activation: 'interact',
      scriptId: 'Route7_EventScript_UndergroundPathSign',
      facing: 'any',
      once: false
    });
    expect(map.hiddenItems).toEqual([
      {
        x: 16,
        y: 15,
        elevation: 3,
        item: 'ITEM_WEPEAR_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE7_WEPEAR_BERRY',
        underfoot: false
      }
    ]);
    expect(map.npcs).toEqual([]);
  });
});
