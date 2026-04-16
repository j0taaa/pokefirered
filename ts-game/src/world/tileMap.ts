import type { Vec2 } from '../core/vec2';
import { loadPrototypeRouteMap, loadRoute2Map, type TriggerZone } from './mapSource';

export interface TileMap {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  walkable: boolean[];
  encounterTiles?: string[];
  triggers: TriggerZone[];
}

export const createPrototypeRouteMap = (): TileMap => loadPrototypeRouteMap();

export const createRoute2Map = (): TileMap => loadRoute2Map();

export const isWalkableAtPixel = (map: TileMap, pos: Vec2): boolean => {
  const tileX = Math.floor(pos.x / map.tileSize);
  const tileY = Math.floor(pos.y / map.tileSize);

  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return false;
  }

  return map.walkable[tileY * map.width + tileX];
};

export const getEncounterTileAtPixel = (map: TileMap, pos: Vec2): string | undefined => {
  if (!map.encounterTiles) {
    return undefined;
  }

  const tileX = Math.floor(pos.x / map.tileSize);
  const tileY = Math.floor(pos.y / map.tileSize);

  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return undefined;
  }

  return map.encounterTiles[tileY * map.width + tileX];
};

export const hasLandEncounterAtPixel = (map: TileMap, pos: Vec2): boolean =>
  getEncounterTileAtPixel(map, pos) === 'L';
