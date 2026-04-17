import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadLavenderTownMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import lavenderTownMapJson from '../src/world/maps/lavenderTown.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Lavender Town compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(lavenderTownMapJson).toEqual(exportMap('LavenderTown'));
  });

  test('loads Lavender Town into the runtime tile map shape', () => {
    const exported = exportMap('LavenderTown');
    const map = loadLavenderTownMap();

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
    const baseSource = lavenderTownMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Lavender Town event parity', () => {
    const compactSource = parseCompactMapSource(lavenderTownMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(lavenderTownMapJson.metadata.connections);
    expect(map.connections).toEqual([
      { map: 'MAP_ROUTE10', offset: 0, direction: 'up' },
      { map: 'MAP_ROUTE12', offset: 0, direction: 'down' },
      { map: 'MAP_ROUTE8', offset: 0, direction: 'left' }
    ]);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.encounterTiles?.filter((tile) => tile === 'L')).toHaveLength(0);
    expect(map.encounterTiles?.filter((tile) => tile === 'W')).toHaveLength(12);
    expect(map.triggers).toEqual([
      {
        id: 'LavenderTown_EventScript_SilphScopeNotice',
        x: 12,
        y: 4,
        activation: 'interact',
        scriptId: 'LavenderTown_EventScript_SilphScopeNotice',
        facing: 'any',
        once: false
      },
      {
        id: 'LavenderTown_EventScript_TownSign',
        x: 15,
        y: 11,
        activation: 'interact',
        scriptId: 'LavenderTown_EventScript_TownSign',
        facing: 'any',
        once: false
      },
      {
        id: 'LavenderTown_EventScript_PokemonTowerSign',
        x: 21,
        y: 7,
        activation: 'interact',
        scriptId: 'LavenderTown_EventScript_PokemonTowerSign',
        facing: 'any',
        once: false
      },
      {
        id: 'LavenderTown_EventScript_VolunteerHouseSign',
        x: 7,
        y: 11,
        activation: 'interact',
        scriptId: 'LavenderTown_EventScript_VolunteerHouseSign',
        facing: 'any',
        once: false
      }
    ]);
    expect(map.hiddenItems).toEqual([]);
    expect(map.npcs).toEqual([
      {
        id: 'LavenderTown_ObjectEvent_LittleGirl',
        x: 19,
        y: 10,
        graphicsId: 'OBJ_EVENT_GFX_LITTLE_GIRL',
        movementType: 'MOVEMENT_TYPE_WANDER_AROUND',
        movementRangeX: 2,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'LavenderTown_EventScript_LittleGirl',
        flag: '0'
      },
      {
        id: 'LavenderTown_ObjectEvent_WorkerM',
        x: 12,
        y: 12,
        graphicsId: 'OBJ_EVENT_GFX_WORKER_M',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'LavenderTown_EventScript_WorkerM',
        flag: '0'
      },
      {
        id: 'LavenderTown_ObjectEvent_Boy',
        x: 10,
        y: 7,
        graphicsId: 'OBJ_EVENT_GFX_BOY',
        movementType: 'MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'LavenderTown_EventScript_Boy',
        flag: '0'
      }
    ]);
    expect(map.warps).toEqual([
      { x: 18, y: 6, elevation: 0, destMap: 'MAP_POKEMON_TOWER_1F', destWarpId: 1 },
      { x: 6, y: 5, elevation: 0, destMap: 'MAP_LAVENDER_TOWN_POKEMON_CENTER_1F', destWarpId: 1 },
      { x: 10, y: 11, elevation: 0, destMap: 'MAP_LAVENDER_TOWN_VOLUNTEER_POKEMON_HOUSE', destWarpId: 1 },
      { x: 5, y: 16, elevation: 0, destMap: 'MAP_LAVENDER_TOWN_HOUSE1', destWarpId: 1 },
      { x: 10, y: 16, elevation: 0, destMap: 'MAP_LAVENDER_TOWN_HOUSE2', destWarpId: 1 },
      { x: 20, y: 15, elevation: 0, destMap: 'MAP_LAVENDER_TOWN_MART', destWarpId: 1 }
    ]);
  });
});
