import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute6Map,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route6MapJson from '../src/world/maps/route6.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 6 compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route6MapJson).toEqual(exportMap('Route6'));
  });

  test('loads Route 6 into the runtime tile map shape', () => {
    const exported = exportMap('Route6');
    const map = loadRoute6Map();

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
    const baseSource = route6MapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Route 6 event parity', () => {
    const compactSource = parseCompactMapSource(route6MapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(route6MapJson.metadata.connections);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toHaveLength(3);
    expect(map.triggers[0]).toEqual({
      id: 'Route6_EventScript_UndergroundPathSign',
      x: 21,
      y: 15,
      activation: 'interact',
      scriptId: 'Route6_EventScript_UndergroundPathSign',
      facing: 'any',
      once: false
    });
    expect(map.hiddenItems).toEqual([
      {
        x: 5,
        y: 5,
        elevation: 3,
        item: 'ITEM_SITRUS_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE6_SITRUS_BERRY',
        underfoot: false
      },
      {
        x: 19,
        y: 5,
        elevation: 3,
        item: 'ITEM_RARE_CANDY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE6_RARE_CANDY',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(6);
    const trainers = map.npcs.filter((n) => n.trainerType === 'TRAINER_TYPE_NORMAL');
    expect(trainers).toHaveLength(6);
    expect(trainers[0]).toEqual({
      id: 'Route6_ObjectEvent_Keigo',
      x: 3,
      y: 16,
      graphicsId: 'OBJ_EVENT_GFX_BUG_CATCHER',
      movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NORMAL',
      trainerSightOrBerryTreeId: 5,
      scriptId: 'Route6_EventScript_Keigo',
      flag: '0'
    });
  });
});
