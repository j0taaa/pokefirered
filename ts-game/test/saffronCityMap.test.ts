import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadSaffronCityMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import saffronCityMapJson from '../src/world/maps/saffronCity.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Saffron City compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(saffronCityMapJson).toEqual(exportMap('SaffronCity'));
  });

  test('loads Saffron City into the runtime tile map shape', () => {
    const exported = exportMap('SaffronCity');
    const map = loadSaffronCityMap();

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
    expect(map.warps).toEqual(exported.warps);
  });

  test('validates compact row dimensions and tile markers', () => {
    const baseSource = saffronCityMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Saffron City event parity', () => {
    const compactSource = parseCompactMapSource(saffronCityMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(saffronCityMapJson.metadata.connections);
    expect(map.connections).toEqual([
      { map: 'MAP_ROUTE5', offset: 0, direction: 'up' },
      { map: 'MAP_ROUTE6', offset: 12, direction: 'down' },
      { map: 'MAP_ROUTE7', offset: 10, direction: 'left' },
      { map: 'MAP_ROUTE8', offset: 10, direction: 'right' }
    ]);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.encounterTiles?.filter((tile) => tile === 'L')).toHaveLength(21);
    expect(map.encounterTiles?.filter((tile) => tile === 'W')).toHaveLength(0);
    expect(map.triggers).toEqual([
      {
        id: 'SaffronCity_EventScript_CitySign',
        x: 29,
        y: 14,
        activation: 'interact',
        scriptId: 'SaffronCity_EventScript_CitySign',
        facing: 'any',
        once: false
      },
      {
        id: 'SaffronCity_EventScript_DojoSign',
        x: 42,
        y: 14,
        activation: 'interact',
        scriptId: 'SaffronCity_EventScript_DojoSign',
        facing: 'any',
        once: false
      },
      {
        id: 'SaffronCity_EventScript_SilphProductSign',
        x: 13,
        y: 25,
        activation: 'interact',
        scriptId: 'SaffronCity_EventScript_SilphProductSign',
        facing: 'any',
        once: false
      },
      {
        id: 'SaffronCity_EventScript_TrainerTips2',
        x: 18,
        y: 30,
        activation: 'interact',
        scriptId: 'SaffronCity_EventScript_TrainerTips2',
        facing: 'any',
        once: false
      },
      {
        id: 'SaffronCity_EventScript_SilphCoSign',
        x: 29,
        y: 31,
        activation: 'interact',
        scriptId: 'SaffronCity_EventScript_SilphCoSign',
        facing: 'any',
        once: false
      },
      {
        id: 'SaffronCity_EventScript_TrainerTips1',
        x: 54,
        y: 25,
        activation: 'interact',
        scriptId: 'SaffronCity_EventScript_TrainerTips1',
        facing: 'any',
        once: false
      },
      {
        id: 'SaffronCity_EventScript_GymSign',
        x: 50,
        y: 14,
        activation: 'interact',
        scriptId: 'SaffronCity_EventScript_GymSign',
        facing: 'any',
        once: false
      },
      {
        id: 'SaffronCity_EventScript_MrPsychicsHouseSign',
        x: 40,
        y: 38,
        activation: 'interact',
        scriptId: 'SaffronCity_EventScript_MrPsychicsHouseSign',
        facing: 'any',
        once: false
      },
      {
        id: 'SaffronCity_EventScript_TrainerFanClubSign',
        x: 49,
        y: 22,
        activation: 'interact',
        scriptId: 'SaffronCity_EventScript_TrainerFanClubSign',
        facing: 'any',
        once: false
      }
    ]);
    expect(map.hiddenItems).toEqual([]);
    expect(map.npcs).toHaveLength(15);
    expect(map.npcs?.find((npc) => npc.id === 'LOCALID_SAFFRON_DOOR_GUARD_GRUNT')).toEqual({
      id: 'LOCALID_SAFFRON_DOOR_GUARD_GRUNT',
      x: 34,
      y: 31,
      graphicsId: 'OBJ_EVENT_GFX_ROCKET_M',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'SaffronCity_EventScript_DoorGuardGrunt',
      flag: 'FLAG_HIDE_SAFFRON_ROCKETS'
    });
    expect(map.npcs?.find((npc) => npc.id === 'SaffronCity_ObjectEvent_Pidgeot')).toEqual({
      id: 'SaffronCity_ObjectEvent_Pidgeot',
      x: 45,
      y: 22,
      graphicsId: 'OBJ_EVENT_GFX_PIDGEOT',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'SaffronCity_EventScript_Pidgeot',
      flag: 'FLAG_HIDE_SAFFRON_CIVILIANS'
    });
    expect(map.npcs?.find((npc) => npc.id === 'SaffronCity_ObjectEvent_CrushGirl')).toEqual({
      id: 'SaffronCity_ObjectEvent_CrushGirl',
      x: 47,
      y: 24,
      graphicsId: 'OBJ_EVENT_GFX_CRUSH_GIRL',
      movementType: 'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'SaffronCity_EventScript_CrushGirl',
      flag: 'FLAG_HIDE_POSTGAME_GOSSIPERS'
    });
    expect(map.warps).toHaveLength(15);
    expect(map.warps?.[0]).toEqual({
      x: 33,
      y: 30,
      elevation: 0,
      destMap: 'MAP_SILPH_CO_1F',
      destWarpId: 1
    });
    expect(map.warps?.slice(8, 14)).toEqual([
      { x: 8, y: 27, elevation: 3, destMap: 'MAP_ROUTE7_EAST_ENTRANCE', destWarpId: 2 },
      { x: 34, y: 5, elevation: 3, destMap: 'MAP_ROUTE5_SOUTH_ENTRANCE', destWarpId: 2 },
      { x: 58, y: 27, elevation: 3, destMap: 'MAP_ROUTE8_WEST_ENTRANCE', destWarpId: 1 },
      { x: 34, y: 46, elevation: 3, destMap: 'MAP_ROUTE6_NORTH_ENTRANCE', destWarpId: 0 },
      { x: 35, y: 46, elevation: 3, destMap: 'MAP_ROUTE6_NORTH_ENTRANCE', destWarpId: 0 },
      { x: 35, y: 5, elevation: 3, destMap: 'MAP_ROUTE5_SOUTH_ENTRANCE', destWarpId: 2 }
    ]);
    expect(map.warps?.at(-1)).toEqual({
      x: 47,
      y: 21,
      elevation: 0,
      destMap: 'MAP_SAFFRON_CITY_POKEMON_TRAINER_FAN_CLUB',
      destWarpId: 0
    });
  });
});
