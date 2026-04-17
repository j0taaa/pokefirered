import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute8Map,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route8MapJson from '../src/world/maps/route8.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 8 compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route8MapJson).toEqual(exportMap('Route8'));
  });

  test('loads Route 8 into the runtime tile map shape', () => {
    const exported = exportMap('Route8');
    const map = loadRoute8Map();

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
    const baseSource = route8MapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Route 8 event parity', () => {
    const compactSource = parseCompactMapSource(route8MapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(route8MapJson.metadata.connections);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toHaveLength(4);
    expect(map.triggers[0]).toEqual({
      id: 'Route8_EventScript_UndergroundPathSign',
      x: 16,
      y: 5,
      activation: 'interact',
      scriptId: 'Route8_EventScript_UndergroundPathSign',
      facing: 'any',
      once: false
    });
    expect(map.hiddenItems).toHaveLength(3);
    expect(map.hiddenItems).toEqual([
      {
        x: 42,
        y: 10,
        elevation: 3,
        item: 'ITEM_RAWST_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE8_RAWST_BERRY',
        underfoot: false
      },
      {
        x: 38,
        y: 11,
        elevation: 3,
        item: 'ITEM_LUM_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE8_LUM_BERRY',
        underfoot: false
      },
      {
        x: 42,
        y: 15,
        elevation: 3,
        item: 'ITEM_LEPPA_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE8_LEPPA_BERRY',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(15);
    const trainers = map.npcs.filter((n) => n.trainerType === 'TRAINER_TYPE_NORMAL');
    expect(trainers).toHaveLength(13);
    expect(map.npcs.filter((n) => n.graphicsId === 'OBJ_EVENT_GFX_CUT_TREE')).toHaveLength(2);
  });
});
