import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadCeruleanCityMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import ceruleanCityMapJson from '../src/world/maps/ceruleanCity.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Cerulean City compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(ceruleanCityMapJson).toEqual(exportMap('CeruleanCity'));
  });

  test('loads Cerulean City into the runtime tile map shape', () => {
    const exportedCeruleanCity = exportMap('CeruleanCity');
    const map = loadCeruleanCityMap();

    expect(map.id).toBe(exportedCeruleanCity.id);
    expect(map.width).toBe(exportedCeruleanCity.width);
    expect(map.height).toBe(exportedCeruleanCity.height);
    expect(map.tileSize).toBe(exportedCeruleanCity.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedCeruleanCity.collisionRows));
    expect(map.connections).toEqual(exportedCeruleanCity.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedCeruleanCity.encounterRows));
    expect(map.wildEncounters).toEqual(exportedCeruleanCity.wildEncounters);
    expect(map.triggers).toEqual(exportedCeruleanCity.triggers);
    expect(map.visual).toEqual(exportedCeruleanCity.visual);
    expect(map.npcs).toEqual(exportedCeruleanCity.npcs);
    expect(map.hiddenItems).toEqual(exportedCeruleanCity.hiddenItems);
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = ceruleanCityMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Cerulean City event parity', () => {
    const compactSource = parseCompactMapSource(ceruleanCityMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(ceruleanCityMapJson.metadata.connections);
    expect(map.connections).toEqual([
      { map: 'MAP_ROUTE24', offset: 12, direction: 'up' },
      { map: 'MAP_ROUTE5', offset: 0, direction: 'down' },
      { map: 'MAP_ROUTE4', offset: 10, direction: 'left' },
      { map: 'MAP_ROUTE9', offset: 10, direction: 'right' }
    ]);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.encounterTiles?.filter((tile) => tile === 'L')).toHaveLength(0);
    expect(map.triggers).toHaveLength(13);
    expect(map.triggers?.slice(0, 5)).toMatchObject([
      {
        id: 'CeruleanCity_EventScript_RivalTriggerLeft',
        x: 22,
        y: 6,
        activation: 'step',
        scriptId: 'CeruleanCity_EventScript_RivalTriggerLeft',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_CERULEAN_CITY_RIVAL',
        conditionEquals: 0
      },
      {
        id: 'CeruleanCity_EventScript_RivalTriggerMid',
        x: 23,
        y: 6,
        activation: 'step',
        scriptId: 'CeruleanCity_EventScript_RivalTriggerMid',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_CERULEAN_CITY_RIVAL',
        conditionEquals: 0
      },
      {
        id: 'CeruleanCity_EventScript_RivalTriggerRight',
        x: 24,
        y: 6,
        activation: 'step',
        scriptId: 'CeruleanCity_EventScript_RivalTriggerRight',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_CERULEAN_CITY_RIVAL',
        conditionEquals: 0
      },
      {
        id: 'CeruleanCity_EventScript_GruntTriggerTop',
        x: 33,
        y: 5,
        activation: 'step',
        scriptId: 'CeruleanCity_EventScript_GruntTriggerTop',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_CERULEAN_CITY_ROCKET',
        conditionEquals: 0
      },
      {
        id: 'CeruleanCity_EventScript_GruntTriggerBottom',
        x: 33,
        y: 7,
        activation: 'step',
        scriptId: 'CeruleanCity_EventScript_GruntTriggerBottom',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_MAP_SCENE_CERULEAN_CITY_ROCKET',
        conditionEquals: 0
      }
    ]);
    expect(map.hiddenItems).toEqual([
      {
        x: 18,
        y: 7,
        elevation: 3,
        item: 'ITEM_RARE_CANDY',
        quantity: 1,
        flag: 'FLAG_HIDDEN_ITEM_CERULEAN_CITY_RARE_CANDY',
        underfoot: false
      }
    ]);
    expect(map.npcs).toHaveLength(11);
    expect(map.npcs[0]).toEqual({
      id: 'LOCALID_CERULEAN_POLICEMAN',
      x: 31,
      y: 12,
      graphicsId: 'OBJ_EVENT_GFX_POLICEMAN',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'CeruleanCity_EventScript_Policeman',
      flag: '0'
    });
    expect(map.npcs.find((npc) => npc.id === 'LOCALID_CERULEAN_GRUNT')).toEqual({
      id: 'LOCALID_CERULEAN_GRUNT',
      x: 33,
      y: 6,
      graphicsId: 'OBJ_EVENT_GFX_ROCKET_M',
      movementType: 'MOVEMENT_TYPE_LOOK_AROUND',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'CeruleanCity_EventScript_Grunt',
      flag: 'FLAG_HIDE_CERULEAN_ROCKET'
    });
    expect(map.npcs.find((npc) => npc.id === 'LOCALID_CERULEAN_RIVAL')).toEqual({
      id: 'LOCALID_CERULEAN_RIVAL',
      x: 22,
      y: 0,
      graphicsId: 'OBJ_EVENT_GFX_BLUE',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: '0x0',
      flag: 'FLAG_HIDE_CERULEAN_RIVAL'
    });
    expect(map.npcs.at(-1)).toEqual({
      id: 'LOCALID_CERULEAN_CAVE_GUARD',
      x: 1,
      y: 13,
      graphicsId: 'OBJ_EVENT_GFX_COOLTRAINER_M',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'CeruleanCity_EventScript_CeruleanCaveGuard',
      flag: 'FLAG_HIDE_CERULEAN_CAVE_GUARD'
    });
  });
});
