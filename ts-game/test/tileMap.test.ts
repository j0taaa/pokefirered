import { describe, expect, test } from 'vitest';
import {
  createPrototypeRouteMap,
  CONNECTION_INVALID,
  CONNECTION_NONE,
  GetMapBorderIdAt,
  hasLandEncounterAtPixel,
  hasWaterEncounterAtPixel,
  isWalkableAtPixel,
  MapGridGetCollisionAt,
  MapGridGetElevationAt,
  MapGridGetMetatileBehaviorAt,
  type TileMap
} from '../src/world/tileMap';

describe('tile map collision probes', () => {
  test('blocks the outer border tiles', () => {
    const map = createPrototypeRouteMap();

    expect(isWalkableAtPixel(map, { x: 0, y: 0 })).toBe(false);
    expect(isWalkableAtPixel(map, { x: 19 * 16 + 2, y: 10 * 16 + 2 })).toBe(false);
  });

  test('permits the intentional hedge gap', () => {
    const map = createPrototypeRouteMap();

    expect(isWalkableAtPixel(map, { x: 10 * 16 + 8, y: 5 * 16 + 8 })).toBe(true);
  });

  test('does not report land encounters on maps without encounter markers', () => {
    const map = createPrototypeRouteMap();

    expect(hasLandEncounterAtPixel(map, { x: 10 * 16 + 8, y: 5 * 16 + 8 })).toBe(false);
  });

  test('separates land and water encounter markers like the decomp encounter attribute', () => {
    const map: TileMap = {
      id: 'ENCOUNTER_MARKER_TEST',
      width: 2,
      height: 1,
      tileSize: 16,
      walkable: [true, true],
      encounterTiles: ['L', 'W'],
      connections: [],
      triggers: [],
      npcs: [],
      warps: []
    };

    expect(hasLandEncounterAtPixel(map, { x: 8, y: 8 })).toBe(true);
    expect(hasWaterEncounterAtPixel(map, { x: 8, y: 8 })).toBe(false);
    expect(hasLandEncounterAtPixel(map, { x: 24, y: 8 })).toBe(false);
    expect(hasWaterEncounterAtPixel(map, { x: 24, y: 8 })).toBe(true);
  });

  test('decomp-named MapGrid accessors preserve collision, behavior, and elevation defaults', () => {
    const map: TileMap = {
      id: 'MAP_GRID_TEST',
      width: 2,
      height: 2,
      tileSize: 16,
      walkable: [true, false, true, true],
      collisionValues: [0, 1, 2, 0],
      tileBehaviors: [0x10, 0x20, 0x30, 0x40],
      elevations: [0, 1, 2, 15],
      connections: [],
      triggers: [],
      npcs: [],
      warps: []
    };

    expect(MapGridGetCollisionAt(map, 1, 0)).toBe(1);
    expect(MapGridGetCollisionAt(map, 0, 1)).toBe(2);
    expect(MapGridGetCollisionAt(map, -1, 0)).toBe(1);
    expect(MapGridGetMetatileBehaviorAt(map, 1, 1)).toBe(0x40);
    expect(MapGridGetMetatileBehaviorAt(map, 3, 3)).toBeNull();
    expect(MapGridGetElevationAt(map, 1, 1)).toBe(15);
    expect(MapGridGetElevationAt(map, 3, 3)).toBe(0);
  });

  test('GetMapBorderIdAt mirrors connected and invalid edge lookup', () => {
    const map: TileMap = {
      id: 'MAP_BORDER_TEST',
      width: 2,
      height: 2,
      tileSize: 16,
      walkable: [true, true, true, true],
      connections: [
        { map: 'MAP_RIGHT', offset: 0, direction: 'right' },
        { map: 'MAP_UP', offset: 0, direction: 'up' }
      ],
      triggers: [],
      npcs: [],
      warps: []
    };

    expect(GetMapBorderIdAt(map, 1, 1)).toBe(CONNECTION_NONE);
    expect(GetMapBorderIdAt(map, 2, 1)).toBe('right');
    expect(GetMapBorderIdAt(map, 1, -1)).toBe('up');
    expect(GetMapBorderIdAt(map, -1, 1)).toBe(CONNECTION_INVALID);
    expect(GetMapBorderIdAt(map, 1, 2)).toBe(CONNECTION_INVALID);
  });
});
