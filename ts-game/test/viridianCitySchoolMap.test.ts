import { describe, expect, test } from 'vitest';
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadViridianCitySchoolMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import viridianCitySchoolMapJson from '../src/world/maps/viridianCitySchool.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Viridian City School compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(viridianCitySchoolMapJson).toEqual(JSON.parse(JSON.stringify(exportMap('ViridianCity_School'))));
  });

  test('loads Viridian City School into the runtime tile map shape', () => {
    const exported = exportMap('ViridianCity_School');
    const map = loadViridianCitySchoolMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.tileSize).toBe(exported.tileSize);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.connections).toEqual([]);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exported.encounterRows));
    expect(map.wildEncounters).toEqual(undefined);
    expect(map.triggers).toEqual(exported.triggers);
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.hiddenItems).toEqual([]);
    expect(map.warps).toEqual(exported.warps);
  });

  test('validates compact rows and preserves trigger, warp, and npc parity', () => {
    const baseSource = viridianCitySchoolMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(viridianCitySchoolMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.hiddenItems).toEqual([]);
    expect(map.warps).toEqual([
      { x: 3, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 3 },
      { x: 4, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 3 },
      { x: 5, y: 7, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 3 }
    ]);
  });

  test('has 5 sign triggers matching decomp bg_events', () => {
    const map = loadViridianCitySchoolMap();
    expect(map.triggers).toHaveLength(5);

    expect(map.triggers[0]).toEqual({
      id: 'ViridianCity_School_EventScript_Notebook',
      x: 4,
      y: 4,
      activation: 'interact',
      scriptId: 'ViridianCity_School_EventScript_Notebook',
      facing: 'any',
      once: false
    });

    expect(map.triggers.filter(t => t.id === 'ViridianCity_School_EventScript_Blackboard')).toHaveLength(2);
    expect(map.triggers.filter(t => t.id === 'ViridianCity_School_EventScript_PokemonJournal')).toHaveLength(2);
  });

  test('has 2 NPCs: school woman and school lass', () => {
    const map = loadViridianCitySchoolMap();
    expect(map.npcs).toHaveLength(2);

    expect(map.npcs[0]).toEqual({
      id: 'LOCALID_SCHOOL_WOMAN',
      x: 6,
      y: 2,
      graphicsId: 'OBJ_EVENT_GFX_WOMAN_2',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'ViridianCity_School_EventScript_Woman',
      flag: '0'
    });

    expect(map.npcs[1]).toEqual({
      id: 'LOCALID_SCHOOL_LASS',
      x: 4,
      y: 5,
      graphicsId: 'OBJ_EVENT_GFX_LASS',
      movementType: 'MOVEMENT_TYPE_FACE_UP',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'ViridianCity_School_EventScript_Lass',
      flag: '0'
    });
  });

  test('indoor map metadata is correct', () => {
    const map = loadViridianCitySchoolMap();
    expect(map.metadata.mapType).toBe('MAP_TYPE_INDOOR');
    expect(map.metadata.allowCycling).toBe(false);
    expect(map.metadata.allowRunning).toBe(false);
    expect(map.metadata.showMapName).toBe(false);
    expect(map.metadata.music).toBe('MUS_PEWTER');
    expect(map.metadata.regionMapSection).toBe('MAPSEC_VIRIDIAN_CITY');
  });
});
