import { describe, expect, test } from 'vitest';
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadViridianCityHouseMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import viridianCityHouseMapJson from '../src/world/maps/viridianCityHouse.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Viridian City House compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(viridianCityHouseMapJson).toEqual(JSON.parse(JSON.stringify(exportMap('ViridianCity_House'))));
  });

  test('loads Viridian City House into the runtime tile map shape', () => {
    const exported = exportMap('ViridianCity_House');
    const map = loadViridianCityHouseMap();

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
    const baseSource = viridianCityHouseMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(viridianCityHouseMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.hiddenItems).toEqual([]);
    expect(map.warps).toEqual([
      { x: 3, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 1 },
      { x: 4, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 1 },
      { x: 5, y: 7, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 1 }
    ]);
  });

  test('has 1 sign trigger for the nickname sign', () => {
    const map = loadViridianCityHouseMap();
    expect(map.triggers).toHaveLength(1);

    expect(map.triggers[0]).toEqual({
      id: 'ViridianCity_House_EventScript_NicknameSign',
      x: 7,
      y: 1,
      activation: 'interact',
      scriptId: 'ViridianCity_House_EventScript_NicknameSign',
      facing: 'any',
      once: false
    });
  });

  test('has 3 NPCs: balding man, little girl, and Speary', () => {
    const map = loadViridianCityHouseMap();
    expect(map.npcs).toHaveLength(3);

    expect(map.npcs[0]).toEqual({
      id: 'ViridianCity_House_ObjectEvent_BaldingMan',
      x: 7,
      y: 4,
      graphicsId: 'OBJ_EVENT_GFX_BALDING_MAN',
      movementType: 'MOVEMENT_TYPE_FACE_LEFT',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'ViridianCity_House_EventScript_BaldingMan',
      flag: '0'
    });

    expect(map.npcs[1]).toEqual({
      id: 'ViridianCity_House_ObjectEvent_LittleGirl',
      x: 2,
      y: 5,
      graphicsId: 'OBJ_EVENT_GFX_LITTLE_GIRL',
      movementType: 'MOVEMENT_TYPE_WANDER_UP_AND_DOWN',
      movementRangeX: 1,
      movementRangeY: 2,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'ViridianCity_House_EventScript_LittleGirl',
      flag: '0'
    });

    expect(map.npcs[2]).toEqual({
      id: 'ViridianCity_House_ObjectEvent_Speary',
      x: 6,
      y: 6,
      graphicsId: 'OBJ_EVENT_GFX_SPEAROW',
      movementType: 'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT',
      movementRangeX: 4,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'ViridianCity_House_EventScript_Speary',
      flag: '0'
    });
  });

  test('indoor map metadata is correct', () => {
    const source = viridianCityHouseMapJson as Record<string, unknown>;
    const metadata = source.metadata as Record<string, unknown>;
    expect(metadata.mapType).toBe('MAP_TYPE_INDOOR');
    expect(metadata.allowCycling).toBe(false);
    expect(metadata.allowRunning).toBe(false);
    expect(metadata.showMapName).toBe(false);
    expect(metadata.music).toBe('MUS_PEWTER');
    expect(metadata.regionMapSection).toBe('MAPSEC_VIRIDIAN_CITY');
  });
});
