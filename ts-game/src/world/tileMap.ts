import type { Vec2 } from '../core/vec2';
import {
  loadPrototypeRouteMap,
  loadPewterCityMap,
  loadRoute2Map,
  loadRoute3Map,
  loadRoute2ViridianForestNorthEntranceMap,
  loadRoute2ViridianForestSouthEntranceMap,
  loadRoute21NorthMap,
  loadRoute22Map,
  loadViridianCityMap,
  type MapHiddenItemSource,
  type MapConnectionSource,
  type MapNpcSource,
  type MapVisualSource,
  type TriggerZone,
  type WildEncounters
} from './mapSource';

export interface TileMap {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  walkable: boolean[];
  connections: MapConnectionSource[];
  encounterTiles?: string[];
  wildEncounters?: WildEncounters;
  triggers: TriggerZone[];
  visual?: MapVisualSource;
  npcs: MapNpcSource[];
  hiddenItems?: MapHiddenItemSource[];
}

export const createPrototypeRouteMap = (): TileMap => loadPrototypeRouteMap();

export const createPewterCityMap = (): TileMap => loadPewterCityMap();

export const createRoute2Map = (): TileMap => loadRoute2Map();

export const createRoute3Map = (): TileMap => loadRoute3Map();

export const createRoute2ViridianForestNorthEntranceMap = (): TileMap =>
  loadRoute2ViridianForestNorthEntranceMap();

export const createRoute2ViridianForestSouthEntranceMap = (): TileMap =>
  loadRoute2ViridianForestSouthEntranceMap();

export const createRoute21NorthMap = (): TileMap => loadRoute21NorthMap();

export const createRoute22Map = (): TileMap => loadRoute22Map();

export const createViridianCityMap = (): TileMap => loadViridianCityMap();

export const isWalkableAtTile = (map: TileMap, tileX: number, tileY: number): boolean => {
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return false;
  }

  return map.walkable[tileY * map.width + tileX];
};

export const isWalkableAtPixel = (map: TileMap, pos: Vec2): boolean => {
  const tileX = Math.floor(pos.x / map.tileSize);
  const tileY = Math.floor(pos.y / map.tileSize);

  return isWalkableAtTile(map, tileX, tileY);
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
