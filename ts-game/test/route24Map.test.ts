import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute24Map,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route24MapJson from '../src/world/maps/route24.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Route 24 compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route24MapJson).toEqual(exportMap('Route24'));
  });

  test('loads Route 24 into the runtime tile map shape', () => {
    const exportedRoute24 = exportMap('Route24');
    const map = loadRoute24Map();

    expect(map.id).toBe(exportedRoute24.id);
    expect(map.width).toBe(exportedRoute24.width);
    expect(map.height).toBe(exportedRoute24.height);
    expect(map.tileSize).toBe(exportedRoute24.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedRoute24.collisionRows));
    expect(map.connections).toEqual(exportedRoute24.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedRoute24.encounterRows));
    expect(map.wildEncounters).toEqual(exportedRoute24.wildEncounters);
    expect(map.triggers).toEqual(exportedRoute24.triggers);
    expect(map.visual).toEqual(exportedRoute24.visual);
    expect(map.npcs).toEqual(exportedRoute24.npcs);
    expect(map.hiddenItems).toEqual(exportedRoute24.hiddenItems);
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = route24MapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Route 24 event parity', () => {
    const compactSource = parseCompactMapSource(route24MapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(route24MapJson.metadata.connections);
    expect(map.connections).toEqual([
      { map: 'MAP_CERULEAN_CITY', offset: -12, direction: 'down' },
      { map: 'MAP_ROUTE25', offset: 0, direction: 'right' }
    ]);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toMatchObject([
      {
        id: 'Route24_EventScript_RocketTriggerLeft',
        x: 10,
        y: 15,
        activation: 'step',
        scriptId: 'Route24_EventScript_RocketTriggerLeft',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_ROUTE24',
        conditionEquals: 0
      },
      {
        id: 'Route24_EventScript_RocketTriggerRight',
        x: 11,
        y: 15,
        activation: 'step',
        scriptId: 'Route24_EventScript_RocketTriggerRight',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_ROUTE24',
        conditionEquals: 0
      },
      {
        id: 'FLAG_HIDDEN_ITEM_ROUTE24_PECHA_BERRY.hiddenItem',
        x: 19,
        y: 4,
        activation: 'interact',
        scriptId: 'FLAG_HIDDEN_ITEM_ROUTE24_PECHA_BERRY.hiddenItem',
        facing: 'any',
        once: true,
        conditions: [
          {
            flag: 'FLAG_HIDDEN_ITEM_ROUTE24_PECHA_BERRY',
            flagState: false
          }
        ]
      }
    ]);
    expect(map.hiddenItems).toEqual([
      {
        x: 19,
        y: 4,
        elevation: 3,
        item: 'ITEM_PECHA_BERRY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_ROUTE24_PECHA_BERRY',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(8);
    expect(map.npcs[0]).toEqual({
      id: 'LOCALID_ROUTE24_ROCKET',
      x: 12,
      y: 15,
      graphicsId: 'OBJ_EVENT_GFX_MAN',
      movementType: 'MOVEMENT_TYPE_FACE_LEFT',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'Route24_EventScript_Rocket',
      flag: 'FLAG_HIDE_NUGGET_BRIDGE_ROCKET'
    });
    expect(map.npcs.filter((npc) => npc.trainerType === 'TRAINER_TYPE_NORMAL')).toEqual([
      {
        id: 'Route24_ObjectEvent_Ethan',
        x: 12,
        y: 19,
        graphicsId: 'OBJ_EVENT_GFX_CAMPER',
        movementType: 'MOVEMENT_TYPE_FACE_LEFT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 2,
        scriptId: 'Route24_EventScript_Ethan',
        flag: '0'
      },
      {
        id: 'Route24_ObjectEvent_Reli',
        x: 10,
        y: 22,
        graphicsId: 'OBJ_EVENT_GFX_LASS',
        movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 2,
        scriptId: 'Route24_EventScript_Reli',
        flag: '0'
      },
      {
        id: 'Route24_ObjectEvent_Timmy',
        x: 12,
        y: 25,
        graphicsId: 'OBJ_EVENT_GFX_YOUNGSTER',
        movementType: 'MOVEMENT_TYPE_FACE_LEFT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 2,
        scriptId: 'Route24_EventScript_Timmy',
        flag: '0'
      },
      {
        id: 'Route24_ObjectEvent_Ali',
        x: 10,
        y: 28,
        graphicsId: 'OBJ_EVENT_GFX_LASS',
        movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 2,
        scriptId: 'Route24_EventScript_Ali',
        flag: '0'
      },
      {
        id: 'Route24_ObjectEvent_Cale',
        x: 12,
        y: 31,
        graphicsId: 'OBJ_EVENT_GFX_BUG_CATCHER',
        movementType: 'MOVEMENT_TYPE_FACE_LEFT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 2,
        scriptId: 'Route24_EventScript_Cale',
        flag: '0'
      },
      {
        id: 'Route24_ObjectEvent_Shane',
        x: 5,
        y: 21,
        graphicsId: 'OBJ_EVENT_GFX_CAMPER',
        movementType: 'MOVEMENT_TYPE_FACE_UP',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NORMAL',
        trainerSightOrBerryTreeId: 5,
        scriptId: 'Route24_EventScript_Shane',
        flag: '0'
      }
    ]);
    expect(map.npcs.find((npc) => npc.id === 'Route24_ObjectEvent_ItemTM45')).toEqual({
      id: 'Route24_ObjectEvent_ItemTM45',
      x: 11,
      y: 4,
      graphicsId: 'OBJ_EVENT_GFX_ITEM_BALL',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'Route24_EventScript_ItemTM45',
      flag: 'FLAG_HIDE_ROUTE24_TM45'
    });
  });
});
