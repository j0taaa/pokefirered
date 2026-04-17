import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadCinnabarIslandMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import cinnabarIslandMapJson from '../src/world/maps/cinnabarIsland.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Cinnabar Island compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(cinnabarIslandMapJson).toEqual(exportMap('CinnabarIsland'));
  });

  test('loads Cinnabar Island into the runtime tile map shape', () => {
    const exported = exportMap('CinnabarIsland');
    const map = loadCinnabarIslandMap();

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
    const baseSource = cinnabarIslandMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);
  });

  test('derives encounter tiles and keeps Cinnabar Island event parity', () => {
    const compactSource = parseCompactMapSource(cinnabarIslandMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual(cinnabarIslandMapJson.metadata.connections);
    expect(map.connections).toEqual([
      { map: 'MAP_ROUTE21_SOUTH', offset: 0, direction: 'up' },
      { map: 'MAP_ROUTE20', offset: 0, direction: 'right' }
    ]);
    expect(map.encounterTiles?.length).toBe(compactSource.width * compactSource.height);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.encounterTiles?.filter((tile) => tile === 'W')).toHaveLength(180);
    expect(map.encounterTiles?.filter((tile) => tile === 'L')).toHaveLength(0);
    expect(map.triggers).toEqual([
      {
        id: 'CinnabarIsland_EventScript_GymDoorLocked',
        x: 20,
        y: 5,
        activation: 'step',
        scriptId: 'CinnabarIsland_EventScript_GymDoorLocked',
        facing: 'any',
        once: false,
        conditionVar: 'VAR_TEMP_1',
        conditionEquals: 0
      },
      {
        id: 'CinnabarIsland_EventScript_IslandSign',
        x: 12,
        y: 3,
        activation: 'interact',
        scriptId: 'CinnabarIsland_EventScript_IslandSign',
        facing: 'any',
        once: false
      },
      {
        id: 'CinnabarIsland_EventScript_PokemonLabSign',
        x: 9,
        y: 9,
        activation: 'interact',
        scriptId: 'CinnabarIsland_EventScript_PokemonLabSign',
        facing: 'any',
        once: false
      },
      {
        id: 'CinnabarIsland_EventScript_GymSign',
        x: 22,
        y: 5,
        activation: 'interact',
        scriptId: 'CinnabarIsland_EventScript_GymSign',
        facing: 'any',
        once: false
      },
      {
        id: 'CinnabarIsland_EventScript_PokemonLabSign',
        x: 10,
        y: 9,
        activation: 'interact',
        scriptId: 'CinnabarIsland_EventScript_PokemonLabSign',
        facing: 'any',
        once: false
      }
    ]);
    expect(map.hiddenItems).toEqual([]);
    expect(map.npcs).toEqual([
      {
        id: 'CinnabarIsland_ObjectEvent_Woman',
        x: 14,
        y: 6,
        graphicsId: 'OBJ_EVENT_GFX_WOMAN_2',
        movementType: 'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'CinnabarIsland_EventScript_Woman',
        flag: '0'
      },
      {
        id: 'CinnabarIsland_ObjectEvent_OldMan',
        x: 11,
        y: 11,
        graphicsId: 'OBJ_EVENT_GFX_OLD_MAN_1',
        movementType: 'MOVEMENT_TYPE_LOOK_AROUND',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'CinnabarIsland_EventScript_OldMan',
        flag: '0'
      },
      {
        id: 'LOCALID_CINNABAR_BILL',
        x: 20,
        y: 7,
        graphicsId: 'OBJ_EVENT_GFX_BILL',
        movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: '0x0',
        flag: 'FLAG_HIDE_CINNABAR_BILL'
      },
      {
        id: 'LOCALID_CINNABAR_SEAGALLOP',
        x: 23,
        y: 7,
        graphicsId: 'OBJ_EVENT_GFX_SEAGALLOP',
        movementType: 'MOVEMENT_TYPE_FACE_LEFT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: '0x0',
        flag: 'FLAG_HIDE_CINNABAR_SEAGALLOP'
      }
    ]);
    expect(map.warps).toEqual([
      { x: 8, y: 3, elevation: 0, destMap: 'MAP_POKEMON_MANSION_1F', destWarpId: 1 },
      { x: 20, y: 4, elevation: 0, destMap: 'MAP_CINNABAR_ISLAND_GYM', destWarpId: 1 },
      { x: 8, y: 9, elevation: 0, destMap: 'MAP_CINNABAR_ISLAND_POKEMON_LAB_ENTRANCE', destWarpId: 1 },
      { x: 14, y: 11, elevation: 0, destMap: 'MAP_CINNABAR_ISLAND_POKEMON_CENTER_1F', destWarpId: 0 },
      { x: 19, y: 11, elevation: 0, destMap: 'MAP_CINNABAR_ISLAND_MART', destWarpId: 1 }
    ]);
  });
});
