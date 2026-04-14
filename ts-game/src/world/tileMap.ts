import type { Vec2 } from '../core/vec2';
import { loadPrototypeRouteMap } from './mapSource';

export interface TileMap {
  width: number;
  height: number;
  tileSize: number;
  walkable: boolean[];
}

export const createPrototypeRouteMap = (): TileMap => loadPrototypeRouteMap();

export const isWalkableAtPixel = (map: TileMap, pos: Vec2): boolean => {
  const tileX = Math.floor(pos.x / map.tileSize);
  const tileY = Math.floor(pos.y / map.tileSize);

  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return false;
  }

  return map.walkable[tileY * map.width + tileX];
};
