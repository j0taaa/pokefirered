import type { Vec2 } from '../core/vec2';
import type { TileMap } from '../world/tileMap';

export type FieldMapLayerPass = 'bottom' | 'middle' | 'top';
export type FieldRenderStage =
  | { type: 'sprites'; priority: number }
  | { type: 'map'; pass: FieldMapLayerPass };

const METATILE_LAYER_TYPE_COVERED = 1;
const METATILE_LAYER_TYPE_SPLIT = 2;
const DEFAULT_ELEVATION = 3;
const ELEVATION_TO_PRIORITY = [2, 2, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 0, 2] as const;

export const FIELD_RENDER_ORDER: readonly FieldRenderStage[] = [
  { type: 'sprites', priority: 3 },
  { type: 'map', pass: 'bottom' },
  { type: 'sprites', priority: 2 },
  { type: 'map', pass: 'middle' },
  { type: 'sprites', priority: 1 },
  { type: 'map', pass: 'top' },
  { type: 'sprites', priority: 0 }
] as const;

export const getMetatileLayerPass = (layerType: number, subtileIndex: number): FieldMapLayerPass => {
  const isBottomSubtile = subtileIndex < 4;
  if (layerType === METATILE_LAYER_TYPE_COVERED) {
    return isBottomSubtile ? 'bottom' : 'middle';
  }

  if (layerType === METATILE_LAYER_TYPE_SPLIT) {
    return isBottomSubtile ? 'bottom' : 'top';
  }

  return isBottomSubtile ? 'middle' : 'top';
};

export const getSpritePriorityForElevation = (elevation?: number): number => {
  if (Number.isInteger(elevation)) {
    const normalizedElevation = elevation as number;
    if (normalizedElevation >= 0 && normalizedElevation < ELEVATION_TO_PRIORITY.length) {
      return ELEVATION_TO_PRIORITY[normalizedElevation] ?? ELEVATION_TO_PRIORITY[DEFAULT_ELEVATION];
    }
  }

  return ELEVATION_TO_PRIORITY[DEFAULT_ELEVATION];
};

export const getMapElevationAtTile = (map: TileMap, tileX: number, tileY: number): number => {
  if (!map.elevations || tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return DEFAULT_ELEVATION;
  }

  return map.elevations[tileY * map.width + tileX] ?? DEFAULT_ELEVATION;
};

export const getMapElevationAtPixel = (map: TileMap, pos: Vec2): number =>
  getMapElevationAtTile(
    map,
    Math.floor(pos.x / map.tileSize),
    Math.floor(pos.y / map.tileSize)
  );
