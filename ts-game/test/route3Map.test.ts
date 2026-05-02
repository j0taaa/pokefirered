import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute3Map,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route3MapJson from '../src/world/maps/route3.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 3 compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route3MapJson).toEqual(exportMap('Route3'));
  });

  test('loads Route 3 into the runtime tile map shape', () => {
    const exportedRoute3 = exportMap('Route3');
    const map = loadRoute3Map();

    expect(map.id).toBe(exportedRoute3.id);
    expect(map.width).toBe(exportedRoute3.width);
    expect(map.height).toBe(exportedRoute3.height);
    expect(map.tileSize).toBe(exportedRoute3.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedRoute3.collisionRows));
    expect(map.connections).toEqual(exportedRoute3.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedRoute3.encounterRows));
    expect(map.wildEncounters).toEqual(exportedRoute3.wildEncounters);
    expect(map.triggers).toEqual(exportedRoute3.triggers);
    expect(map.visual).toEqual(exportedRoute3.visual);
    expect(map.npcs).toEqual(exportedRoute3.npcs);
    expect(map.hiddenItems).toEqual(exportedRoute3.hiddenItems);
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = route3MapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Route 3 event parity', () => {
    const compactSource = parseCompactMapSource(route3MapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(route3MapJson.metadata.connections);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.encounterTiles?.filter((tile) => tile === 'L')).toHaveLength(117);
    expect(map.triggers).toMatchObject([
      {
        id: 'Route3_EventScript_RouteSign',
        x: 72,
        y: 11,
        activation: 'interact',
        scriptId: 'Route3_EventScript_RouteSign',
        facing: 'any',
        once: false
      },
      {
        id: 'FLAG_HIDDEN_ITEM_ROUTE3_ORAN_BERRY.hiddenItem',
        x: 26,
        y: 9,
        activation: 'interact',
        scriptId: 'FLAG_HIDDEN_ITEM_ROUTE3_ORAN_BERRY.hiddenItem',
        facing: 'any',
        once: true,
        conditions: [
          {
            flag: 'FLAG_HIDDEN_ITEM_ROUTE3_ORAN_BERRY',
            flagState: false
          }
        ]
      }
    ]);
    expect(map.hiddenItems).toEqual([
      {
        x: 26,
        y: 9,
        elevation: 3,
        item: 'ITEM_ORAN_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE3_ORAN_BERRY',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(9);
    expect(map.npcs[0]).toEqual({
      id: 'Route3_ObjectEvent_Youngster',
      x: 70,
      y: 13,
      graphicsId: 'OBJ_EVENT_GFX_YOUNGSTER',
      movementType: 'MOVEMENT_TYPE_LOOK_AROUND',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'Route3_EventScript_Youngster',
      flag: '0'
    });
    expect(map.npcs.filter((npc) => npc.trainerType === 'TRAINER_TYPE_NORMAL')).toEqual([
      {
        id: 'Route3_ObjectEvent_Robin',
        x: 40,
        y: 11,
        graphicsId: 'OBJ_EVENT_GFX_LASS',
        movementType: 'MOVEMENT_TYPE_WANDER_UP_AND_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 3,
        scriptId: 'Route3_EventScript_Robin',
        flag: '0'
      },
      {
        id: 'Route3_ObjectEvent_James',
        x: 32,
        y: 6,
        graphicsId: 'OBJ_EVENT_GFX_BUG_CATCHER',
        movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 4,
        scriptId: 'Route3_EventScript_James',
        flag: '0'
      },
      {
        id: 'Route3_ObjectEvent_Sally',
        x: 30,
        y: 3,
        graphicsId: 'OBJ_EVENT_GFX_LASS',
        movementType: 'MOVEMENT_TYPE_FACE_LEFT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 5,
        scriptId: 'Route3_EventScript_Sally',
        flag: '0'
      },
      {
        id: 'Route3_ObjectEvent_Greg',
        x: 25,
        y: 4,
        graphicsId: 'OBJ_EVENT_GFX_BUG_CATCHER',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 2,
        scriptId: 'Route3_EventScript_Greg',
        flag: '0'
      },
      {
        id: 'Route3_ObjectEvent_Calvin',
        x: 29,
        y: 10,
        graphicsId: 'OBJ_EVENT_GFX_YOUNGSTER',
        movementType: 'MOVEMENT_TYPE_FACE_LEFT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 5,
        scriptId: 'Route3_EventScript_Calvin',
        flag: '0'
      },
      {
        id: 'Route3_ObjectEvent_Janice',
        x: 19,
        y: 9,
        graphicsId: 'OBJ_EVENT_GFX_LASS',
        movementType: 'MOVEMENT_TYPE_FACE_LEFT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 5,
        scriptId: 'Route3_EventScript_Janice',
        flag: '0'
      },
      {
        id: 'Route3_ObjectEvent_Colton',
        x: 12,
        y: 6,
        graphicsId: 'OBJ_EVENT_GFX_BUG_CATCHER',
        movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 3,
        scriptId: 'Route3_EventScript_Colton',
        flag: '0'
      },
      {
        id: 'Route3_ObjectEvent_Ben',
        x: 17,
        y: 4,
        graphicsId: 'OBJ_EVENT_GFX_YOUNGSTER',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 2,
        scriptId: 'Route3_EventScript_Ben',
        flag: '0'
      }
    ]);
  });
});
