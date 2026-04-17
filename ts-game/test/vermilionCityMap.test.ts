import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadVermilionCityMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import vermilionCityMapJson from '../src/world/maps/vermilionCity.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Vermilion City compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(vermilionCityMapJson).toEqual(exportMap('VermilionCity'));
  });

  test('loads Vermilion City into the runtime tile map shape', () => {
    const exported = exportMap('VermilionCity');
    const map = loadVermilionCityMap();

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
    const baseSource = vermilionCityMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Vermilion City event parity', () => {
    const compactSource = parseCompactMapSource(vermilionCityMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(vermilionCityMapJson.metadata.connections);
    expect(map.connections).toEqual([
      { map: 'MAP_ROUTE6', offset: 12, direction: 'up' },
      { map: 'MAP_ROUTE11', offset: 10, direction: 'right' }
    ]);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toHaveLength(10);
    expect(map.triggers?.slice(0, 4)).toEqual([
      {
        id: 'VermilionCity_EventScript_CheckTicketLeft',
        x: 22,
        y: 33,
        activation: 'step',
        scriptId: 'VermilionCity_EventScript_CheckTicketLeft',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_VERMILION_CITY_TICKET_CHECK_TRIGGER',
        conditionEquals: 0
      },
      {
        id: 'VermilionCity_EventScript_CheckTicketRight',
        x: 23,
        y: 33,
        activation: 'step',
        scriptId: 'VermilionCity_EventScript_CheckTicketRight',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_VERMILION_CITY_TICKET_CHECK_TRIGGER',
        conditionEquals: 0
      },
      {
        id: 'VermilionCity_EventScript_ExitedTicketCheck',
        x: 22,
        y: 32,
        activation: 'step',
        scriptId: 'VermilionCity_EventScript_ExitedTicketCheck',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_TEMP_1',
        conditionEquals: 0
      },
      {
        id: 'VermilionCity_EventScript_ExitedTicketCheck',
        x: 23,
        y: 32,
        activation: 'step',
        scriptId: 'VermilionCity_EventScript_ExitedTicketCheck',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_TEMP_1',
        conditionEquals: 0
      }
    ]);
    expect(map.hiddenItems).toEqual([
      {
        x: 14,
        y: 11,
        elevation: 3,
        item: 'ITEM_MAX_ETHER',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_VERMILION_CITY_MAX_ETHER',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(8);
    expect(map.npcs[0]).toEqual({
      id: 'VermilionCity_ObjectEvent_Woman',
      x: 22,
      y: 11,
      graphicsId: 'OBJ_EVENT_GFX_WOMAN_1',
      movementType: 'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT',
      movementRangeX: 4,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'VermilionCity_EventScript_Woman',
      flag: '0'
    });
    expect(map.npcs.find((npc) => npc.id === 'LOCALID_VERMILION_FERRY_SAILOR')).toEqual({
      id: 'LOCALID_VERMILION_FERRY_SAILOR',
      x: 24,
      y: 33,
      graphicsId: 'OBJ_EVENT_GFX_SAILOR',
      movementType: 'MOVEMENT_TYPE_FACE_UP',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'VermilionCity_EventScript_FerrySailor',
      flag: '0'
    });
    expect(map.npcs.find((npc) => npc.graphicsId === 'OBJ_EVENT_GFX_MACHOP')).toEqual({
      id: 'VermilionCity_ObjectEvent_Machop',
      x: 35,
      y: 11,
      graphicsId: 'OBJ_EVENT_GFX_MACHOP',
      movementType: 'MOVEMENT_TYPE_WANDER_AROUND',
      movementRangeX: 2,
      movementRangeY: 2,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'VermilionCity_EventScript_Machop',
      flag: '0'
    });
    expect(map.npcs.find((npc) => npc.graphicsId === 'OBJ_EVENT_GFX_CUT_TREE')).toEqual({
      id: 'VermilionCity_ObjectEvent_7',
      x: 19,
      y: 24,
      graphicsId: 'OBJ_EVENT_GFX_CUT_TREE',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'EventScript_CutTree',
      flag: 'FLAG_TEMP_12'
    });
    expect(map.npcs.find((npc) => npc.graphicsId === 'OBJ_EVENT_GFX_SCIENTIST')).toEqual({
      id: 'VermilionCity_ObjectEvent_OaksAide',
      x: 25,
      y: 7,
      graphicsId: 'OBJ_EVENT_GFX_SCIENTIST',
      movementType: 'MOVEMENT_TYPE_LOOK_AROUND',
      movementRangeX: 4,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'VermilionCity_EventScript_OaksAide',
      flag: 'FLAG_HIDE_VERMILION_CITY_OAKS_AIDE'
    });
  });
});
