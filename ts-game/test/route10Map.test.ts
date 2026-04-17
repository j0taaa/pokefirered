import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute10Map,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route10MapJson from '../src/world/maps/route10.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 10 compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route10MapJson).toEqual(exportMap('Route10'));
  });

  test('loads Route 10 into the runtime tile map shape', () => {
    const exported = exportMap('Route10');
    const map = loadRoute10Map();

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
    const baseSource = route10MapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Route 10 event parity', () => {
    const compactSource = parseCompactMapSource(route10MapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(route10MapJson.metadata.connections);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toHaveLength(8);
    expect(map.triggers[0]).toEqual({
      id: 'Route10_EventScript_SouthRockTunnelSign',
      x: 15,
      y: 59,
      activation: 'interact',
      scriptId: 'Route10_EventScript_SouthRockTunnelSign',
      facing: 'any',
      once: false
    });
    expect(map.hiddenItems).toHaveLength(5);
    expect(map.hiddenItems).toEqual([
      {
        x: 10,
        y: 19,
        elevation: 0,
        item: 'ITEM_SUPER_POTION',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE10_SUPER_POTION',
        underfoot: false
      },
      {
        x: 12,
        y: 40,
        elevation: 3,
        item: 'ITEM_MAX_ETHER',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE10_MAX_ETHER',
        underfoot: false
      },
      {
        x: 6,
        y: 26,
        elevation: 3,
        item: 'ITEM_CHERI_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE10_CHERI_BERRY',
        underfoot: false
      },
      {
        x: 17,
        y: 29,
        elevation: 3,
        item: 'ITEM_PERSIM_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE10_PERSIM_BERRY',
        underfoot: false
      },
      {
        x: 20,
        y: 57,
        elevation: 3,
        item: 'ITEM_NANAB_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE10_NANAB_BERRY',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(10);
    const trainers = map.npcs.filter((n) => n.trainerType === 'TRAINER_TYPE_NORMAL');
    expect(trainers).toHaveLength(6);
    expect(map.npcs.filter((n) => n.graphicsId === 'OBJ_EVENT_GFX_CUT_TREE')).toHaveLength(4);
  });
});
