import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRoute2ViridianForestSouthEntranceMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import route2ViridianForestSouthEntranceMapJson from '../src/world/maps/route2ViridianForestSouthEntrance.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

const toSerializableExport = (mapName: string) => JSON.parse(JSON.stringify(exportMap(mapName)));

describe('Route 2 Viridian Forest South Entrance compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(route2ViridianForestSouthEntranceMapJson).toEqual(toSerializableExport('Route2_ViridianForest_SouthEntrance'));
  });

  test('loads the south entrance into the runtime tile map shape', () => {
    const exportedMap = exportMap('Route2_ViridianForest_SouthEntrance');
    const map = loadRoute2ViridianForestSouthEntranceMap();

    expect(map.id).toBe(exportedMap.id);
    expect(map.width).toBe(exportedMap.width);
    expect(map.height).toBe(exportedMap.height);
    expect(map.tileSize).toBe(exportedMap.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedMap.collisionRows));
    expect(map.connections).toEqual([]);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedMap.encounterRows));
    expect(map.wildEncounters).toEqual(undefined);
    expect(map.triggers).toEqual(exportedMap.triggers);
    expect(map.visual).toEqual(exportedMap.visual);
    expect(map.npcs).toEqual(exportedMap.npcs);
  });

  test('validates compact row dimensions and preserves south entrance warp/NPC parity', () => {
    const baseSource = route2ViridianForestSouthEntranceMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(route2ViridianForestSouthEntranceMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(route2ViridianForestSouthEntranceMapJson.warps).toEqual([
      { x: 6, y: 10, elevation: 3, destMap: 'MAP_ROUTE2', destWarpId: 2 },
      { x: 7, y: 10, elevation: 3, destMap: 'MAP_ROUTE2', destWarpId: 2 },
      { x: 8, y: 10, elevation: 3, destMap: 'MAP_ROUTE2', destWarpId: 2 },
      { x: 7, y: 1, elevation: 3, destMap: 'MAP_VIRIDIAN_FOREST', destWarpId: 0 }
    ]);
    expect(map.npcs).toEqual([
      {
        id: 'Route2_ViridianForest_SouthEntrance_ObjectEvent_Woman1',
        x: 10,
        y: 6,
        graphicsId: 'OBJ_EVENT_GFX_WOMAN_2',
        movementType: 'MOVEMENT_TYPE_FACE_LEFT',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'Route2_ViridianForest_SouthEntrance_EventScript_Woman1',
        flag: '0'
      },
      {
        id: 'Route2_ViridianForest_SouthEntrance_ObjectEvent_Woman2',
        x: 4,
        y: 7,
        graphicsId: 'OBJ_EVENT_GFX_WOMAN_1',
        movementType: 'MOVEMENT_TYPE_WANDER_AROUND',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'Route2_ViridianForest_SouthEntrance_EventScript_Woman2',
        flag: '0'
      }
    ]);
  });
});
