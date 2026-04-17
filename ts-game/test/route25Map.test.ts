import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute25Map,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route25MapJson from '../src/world/maps/route25.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 25 compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route25MapJson).toEqual(exportMap('Route25'));
  });

  test('loads Route 25 into the runtime tile map shape', () => {
    const exportedRoute25 = exportMap('Route25');
    const map = loadRoute25Map();

    expect(map.id).toBe(exportedRoute25.id);
    expect(map.width).toBe(exportedRoute25.width);
    expect(map.height).toBe(exportedRoute25.height);
    expect(map.tileSize).toBe(exportedRoute25.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedRoute25.collisionRows));
    expect(map.connections).toEqual(exportedRoute25.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedRoute25.encounterRows));
    expect(map.wildEncounters).toEqual(exportedRoute25.wildEncounters);
    expect(map.triggers).toEqual(exportedRoute25.triggers);
    expect(map.visual).toEqual(exportedRoute25.visual);
    expect(map.npcs).toEqual(exportedRoute25.npcs);
    expect(map.hiddenItems).toEqual(exportedRoute25.hiddenItems);
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = route25MapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Route 25 event parity', () => {
    const compactSource = parseCompactMapSource(route25MapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(route25MapJson.metadata.connections);
    expect(map.connections).toEqual([
      { map: 'MAP_ROUTE24', offset: 0, direction: 'left' }
    ]);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toEqual([
      {
        id: 'Route25_EventScript_SeaCottageSign',
        x: 48,
        y: 4,
        activation: 'interact',
        scriptId: 'Route25_EventScript_SeaCottageSign',
        facing: 'any',
        once: false
      },
      {
        id: 'FLAG_HIDDEN_ITEM_ROUTE25_ELIXIR.hiddenItem',
        x: 14,
        y: 2,
        activation: 'interact',
        scriptId: 'FLAG_HIDDEN_ITEM_ROUTE25_ELIXIR.hiddenItem',
        facing: 'any',
        once: true,
        conditions: [{ flag: 'FLAG_HIDDEN_ITEM_ROUTE25_ELIXIR', flagState: false }]
      },
      {
        id: 'FLAG_HIDDEN_ITEM_ROUTE25_ETHER.hiddenItem',
        x: 58,
        y: 6,
        activation: 'interact',
        scriptId: 'FLAG_HIDDEN_ITEM_ROUTE25_ETHER.hiddenItem',
        facing: 'any',
        once: true,
        conditions: [{ flag: 'FLAG_HIDDEN_ITEM_ROUTE25_ETHER', flagState: false }]
      },
      {
        id: 'FLAG_HIDDEN_ITEM_ROUTE25_ORAN_BERRY.hiddenItem',
        x: 33,
        y: 8,
        activation: 'interact',
        scriptId: 'FLAG_HIDDEN_ITEM_ROUTE25_ORAN_BERRY.hiddenItem',
        facing: 'any',
        once: true,
        conditions: [{ flag: 'FLAG_HIDDEN_ITEM_ROUTE25_ORAN_BERRY', flagState: false }]
      },
      {
        id: 'FLAG_HIDDEN_ITEM_ROUTE25_BLUK_BERRY.hiddenItem',
        x: 40,
        y: 3,
        activation: 'interact',
        scriptId: 'FLAG_HIDDEN_ITEM_ROUTE25_BLUK_BERRY.hiddenItem',
        facing: 'any',
        once: true,
        conditions: [{ flag: 'FLAG_HIDDEN_ITEM_ROUTE25_BLUK_BERRY', flagState: false }]
      }
    ]);
    expect(route25MapJson.warps).toEqual([
      {
        x: 51,
        y: 4,
        elevation: 0,
        destMap: 'MAP_ROUTE25_SEA_COTTAGE',
        destWarpId: 1
      }
    ]);
    expect(map.hiddenItems).toEqual([
      {
        x: 14,
        y: 2,
        elevation: 3,
        item: 'ITEM_ELIXIR',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE25_ELIXIR',
        underfoot: false
      },
      {
        x: 58,
        y: 6,
        elevation: 3,
        item: 'ITEM_ETHER',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE25_ETHER',
        underfoot: false
      },
      {
        x: 33,
        y: 8,
        elevation: 3,
        item: 'ITEM_ORAN_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE25_ORAN_BERRY',
        underfoot: false
      },
      {
        x: 40,
        y: 3,
        elevation: 3,
        item: 'ITEM_BLUK_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE25_BLUK_BERRY',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(13);
    expect(map.npcs.slice(0, 9).every((npc) => npc.trainerType === 'TRAINER_TYPE_NORMAL')).toBe(true);
    expect(map.npcs[0]).toEqual({
      id: 'Route25_ObjectEvent_Franklin',
      x: 11,
      y: 4,
      graphicsId: 'OBJ_EVENT_GFX_HIKER',
      movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NORMAL',
      trainerSightOrBerryTreeId: 4,
      scriptId: 'Route25_EventScript_Franklin',
      flag: '0'
    });
    expect(map.npcs.find((npc) => npc.id === 'Route25_ObjectEvent_Chad')).toEqual({
      id: 'Route25_ObjectEvent_Chad',
      x: 36,
      y: 4,
      graphicsId: 'OBJ_EVENT_GFX_YOUNGSTER',
      movementType: 'MOVEMENT_TYPE_WALK_DOWN_AND_UP',
      movementRangeX: 1,
      movementRangeY: 3,
      trainerType: 'TRAINER_TYPE_NORMAL',
      trainerSightOrBerryTreeId: 2,
      scriptId: 'Route25_EventScript_Chad',
      flag: '0'
    });
    expect(map.npcs.find((npc) => npc.id === 'Route25_ObjectEvent_ItemTM43')).toEqual({
      id: 'Route25_ObjectEvent_ItemTM43',
      x: 26,
      y: 2,
      graphicsId: 'OBJ_EVENT_GFX_ITEM_BALL',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'Route25_EventScript_ItemTM43',
      flag: 'FLAG_HIDE_ROUTE25_TM43'
    });
    expect(map.npcs.find((npc) => npc.id === 'Route25_ObjectEvent_11')).toEqual({
      id: 'Route25_ObjectEvent_11',
      x: 30,
      y: 3,
      graphicsId: 'OBJ_EVENT_GFX_CUT_TREE',
      movementType: 'MOVEMENT_TYPE_LOOK_AROUND',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'EventScript_CutTree',
      flag: 'FLAG_TEMP_12'
    });
    expect(map.npcs.at(-1)).toEqual({
      id: 'Route25_ObjectEvent_Man',
      x: 49,
      y: 11,
      graphicsId: 'OBJ_EVENT_GFX_MAN',
      movementType: 'MOVEMENT_TYPE_FACE_LEFT',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'Route25_EventScript_Man',
      flag: '0'
    });
  });
});
