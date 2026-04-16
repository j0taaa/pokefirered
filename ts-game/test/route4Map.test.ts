import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute4Map,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route4MapJson from '../src/world/maps/route4.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 4 compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route4MapJson).toEqual(exportMap('Route4'));
  });

  test('loads Route 4 into the runtime tile map shape', () => {
    const exportedRoute4 = exportMap('Route4');
    const map = loadRoute4Map();

    expect(map.id).toBe(exportedRoute4.id);
    expect(map.width).toBe(exportedRoute4.width);
    expect(map.height).toBe(exportedRoute4.height);
    expect(map.tileSize).toBe(exportedRoute4.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedRoute4.collisionRows));
    expect(map.connections).toEqual(exportedRoute4.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedRoute4.encounterRows));
    expect(map.wildEncounters).toEqual(exportedRoute4.wildEncounters);
    expect(map.triggers).toEqual(exportedRoute4.triggers);
    expect(map.visual).toEqual(exportedRoute4.visual);
    expect(map.npcs).toEqual(exportedRoute4.npcs);
    expect(map.hiddenItems).toEqual(exportedRoute4.hiddenItems);
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = route4MapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Route 4 event parity', () => {
    const compactSource = parseCompactMapSource(route4MapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(route4MapJson.metadata.connections);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.encounterTiles?.filter((tile) => tile === 'L')).toHaveLength(84);
    expect(map.triggers).toEqual([
      {
        id: 'Route4_EventScript_MtMoonSign',
        x: 18,
        y: 7,
        activation: 'interact',
        scriptId: 'Route4_EventScript_MtMoonSign',
        facing: 'any',
        once: false
      },
      {
        id: 'Route4_EventScript_RouteSign',
        x: 34,
        y: 7,
        activation: 'interact',
        scriptId: 'Route4_EventScript_RouteSign',
        facing: 'any',
        once: false
      },
      {
        id: 'FLAG_HIDDEN_ITEM_ROUTE4_GREAT_BALL.hiddenItem',
        x: 43,
        y: 2,
        activation: 'interact',
        scriptId: 'FLAG_HIDDEN_ITEM_ROUTE4_GREAT_BALL.hiddenItem',
        facing: 'any',
        once: true,
        conditions: [
          {
            flag: 'FLAG_HIDDEN_ITEM_ROUTE4_GREAT_BALL',
            flagState: false
          }
        ]
      },
      {
        id: 'FLAG_HIDDEN_ITEM_ROUTE4_PERSIM_BERRY.hiddenItem',
        x: 5,
        y: 4,
        activation: 'interact',
        scriptId: 'FLAG_HIDDEN_ITEM_ROUTE4_PERSIM_BERRY.hiddenItem',
        facing: 'any',
        once: true,
        conditions: [
          {
            flag: 'FLAG_HIDDEN_ITEM_ROUTE4_PERSIM_BERRY',
            flagState: false
          }
        ]
      },
      {
        id: 'FLAG_HIDDEN_ITEM_ROUTE4_RAZZ_BERRY.hiddenItem',
        x: 67,
        y: 17,
        activation: 'interact',
        scriptId: 'FLAG_HIDDEN_ITEM_ROUTE4_RAZZ_BERRY.hiddenItem',
        facing: 'any',
        once: true,
        conditions: [
          {
            flag: 'FLAG_HIDDEN_ITEM_ROUTE4_RAZZ_BERRY',
            flagState: false
          }
        ]
      }
    ]);
    expect(map.hiddenItems).toEqual([
      {
        x: 43,
        y: 2,
        elevation: 3,
        item: 'ITEM_GREAT_BALL',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE4_GREAT_BALL',
        underfoot: false
      },
      {
        x: 5,
        y: 4,
        elevation: 3,
        item: 'ITEM_PERSIM_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE4_PERSIM_BERRY',
        underfoot: false
      },
      {
        x: 67,
        y: 17,
        elevation: 3,
        item: 'ITEM_RAZZ_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE4_RAZZ_BERRY',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(6);
    expect(map.npcs[0]).toEqual({
      id: 'Route4_ObjectEvent_Woman',
      x: 9,
      y: 8,
      graphicsId: 'OBJ_EVENT_GFX_WOMAN_1',
      movementType: 'MOVEMENT_TYPE_WANDER_AROUND',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'Route4_EventScript_Woman',
      flag: '0'
    });
    expect(map.npcs.filter((npc) => npc.trainerType === 'TRAINER_TYPE_NORMAL')).toEqual([
      {
        id: 'Route4_ObjectEvent_Crissy',
        x: 75,
        y: 3,
        graphicsId: 'OBJ_EVENT_GFX_LASS',
        movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 4,
        scriptId: 'Route4_EventScript_Crissy',
        flag: '0'
      }
    ]);
    expect(map.npcs.filter((npc) => npc.graphicsId === 'OBJ_EVENT_GFX_BLACK_BELT')).toEqual([
      {
        id: 'Route4_ObjectEvent_MegaPunchTutor',
        x: 47,
        y: 3,
        graphicsId: 'OBJ_EVENT_GFX_BLACK_BELT',
        movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'Route4_EventScript_MegaPunchTutor',
        flag: '0'
      },
      {
        id: 'Route4_ObjectEvent_MegaKickTutor',
        x: 50,
        y: 3,
        graphicsId: 'OBJ_EVENT_GFX_BLACK_BELT',
        movementType: 'MOVEMENT_TYPE_FACE_LEFT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'Route4_EventScript_MegaKickTutor',
        flag: '0'
      }
    ]);
    expect(map.npcs.find((npc) => npc.id === 'Route4_ObjectEvent_ItemTM05')).toEqual({
      id: 'Route4_ObjectEvent_ItemTM05',
      x: 67,
      y: 5,
      graphicsId: 'OBJ_EVENT_GFX_ITEM_BALL',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'Route4_EventScript_ItemTM05',
      flag: 'FLAG_HIDE_ROUTE4_TM05'
    });
  });
});
