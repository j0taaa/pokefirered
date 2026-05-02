import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute9Map,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route9MapJson from '../src/world/maps/route9.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 9 compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route9MapJson).toEqual(exportMap('Route9'));
  });

  test('loads Route 9 into the runtime tile map shape', () => {
    const exported = exportMap('Route9');
    const map = loadRoute9Map();

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
    const baseSource = route9MapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Route 9 event parity', () => {
    const compactSource = parseCompactMapSource(route9MapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(route9MapJson.metadata.connections);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toHaveLength(4);
    expect(map.triggers[0]).toMatchObject({
      id: 'Route9_EventScript_RouteSign',
      x: 29,
      y: 7,
      activation: 'interact',
      scriptId: 'Route9_EventScript_RouteSign',
      facing: 'any',
      once: false
    });
    expect(map.hiddenItems).toHaveLength(3);
    expect(map.hiddenItems).toEqual([
      {
        x: 15,
        y: 7,
        elevation: 0,
        item: 'ITEM_ETHER',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE9_ETHER',
        underfoot: false
      },
      {
        x: 63,
        y: 2,
        elevation: 3,
        item: 'ITEM_RARE_CANDY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE9_RARE_CANDY',
        underfoot: false
      },
      {
        x: 48,
        y: 2,
        elevation: 3,
        item: 'ITEM_CHESTO_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE9_CHESTO_BERRY',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(12);
    const trainers = map.npcs.filter((n) => n.trainerType === 'TRAINER_TYPE_NORMAL');
    expect(trainers).toHaveLength(9);
    expect(map.npcs.find((n) => n.id === 'Route9_ObjectEvent_ItemTM40')).toEqual({
      id: 'Route9_ObjectEvent_ItemTM40',
      x: 12,
      y: 17,
      graphicsId: 'OBJ_EVENT_GFX_ITEM_BALL',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'Route9_EventScript_ItemTM40',
      flag: 'FLAG_HIDE_ROUTE9_TM40'
    });
    expect(map.npcs.find((n) => n.id === 'Route9_ObjectEvent_ItemBurnHeal')).toEqual({
      id: 'Route9_ObjectEvent_ItemBurnHeal',
      x: 65,
      y: 17,
      graphicsId: 'OBJ_EVENT_GFX_ITEM_BALL',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'Route9_EventScript_ItemBurnHeal',
      flag: 'FLAG_HIDE_ROUTE9_BURN_HEAL'
    });
  });
});
