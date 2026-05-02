import { vec2, type Vec2 } from '../core/vec2';
import type { CoordEventWeatherId } from './decompCoordEventWeather';
import {
  loadPrototypeRouteMap,
  loadCeruleanCityMap,
  loadPewterCityMap,
  loadRoute2Map,
  loadRoute24Map,
  loadRoute25Map,
  loadRoute3Map,
  loadRoute4Map,
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
  type WarpSource,
  type WildEncounters
} from './mapSource';

export interface TileMap {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  regionMapSection?: string;
  mapType?: string;
  allowRunning?: boolean;
  allowEscaping?: boolean;
  coordEventWeather?: CoordEventWeatherId;
  walkable: boolean[];
  collisionValues?: number[];
  elevations?: number[];
  terrainTypes?: number[];
  tileBehaviors?: number[];
  connections: MapConnectionSource[];
  encounterTiles?: string[];
  wildEncounters?: WildEncounters;
  battleScene?: string;
  triggers: TriggerZone[];
  visual?: MapVisualSource;
  npcs: MapNpcSource[];
  hiddenItems?: MapHiddenItemSource[];
  warps: WarpSource[];
}

export type TileDirection = 'up' | 'down' | 'left' | 'right';
export type MapBorderId = TileDirection | 'none' | 'invalid';

export const CONNECTION_NONE: MapBorderId = 'none';
export const CONNECTION_INVALID: MapBorderId = 'invalid';

export const createPrototypeRouteMap = (): TileMap => loadPrototypeRouteMap();

export const createCeruleanCityMap = (): TileMap => loadCeruleanCityMap();

export const createPewterCityMap = (): TileMap => loadPewterCityMap();

export const createRoute2Map = (): TileMap => loadRoute2Map();

export const createRoute24Map = (): TileMap => loadRoute24Map();

export const createRoute25Map = (): TileMap => loadRoute25Map();

export const createRoute3Map = (): TileMap => loadRoute3Map();

export const createRoute4Map = (): TileMap => loadRoute4Map();

export const createRoute2ViridianForestNorthEntranceMap = (): TileMap =>
  loadRoute2ViridianForestNorthEntranceMap();

export const createRoute2ViridianForestSouthEntranceMap = (): TileMap =>
  loadRoute2ViridianForestSouthEntranceMap();

export const createRoute21NorthMap = (): TileMap => loadRoute21NorthMap();

export const createRoute22Map = (): TileMap => loadRoute22Map();

export const createViridianCityMap = (): TileMap => loadViridianCityMap();

export const getTileIndex = (map: TileMap, tileX: number, tileY: number): number | null => {
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return null;
  }

  return tileY * map.width + tileX;
};

export const GetMapBorderIdAt = (map: TileMap, tileX: number, tileY: number): MapBorderId => {
  if (tileX >= 0 && tileY >= 0 && tileX < map.width && tileY < map.height) {
    return CONNECTION_NONE;
  }

  if (tileX >= map.width) {
    return map.connections.some((connection) => connection.direction === 'right')
      ? 'right'
      : CONNECTION_INVALID;
  }

  if (tileX < 0) {
    return map.connections.some((connection) => connection.direction === 'left')
      ? 'left'
      : CONNECTION_INVALID;
  }

  if (tileY >= map.height) {
    return map.connections.some((connection) => connection.direction === 'down')
      ? 'down'
      : CONNECTION_INVALID;
  }

  if (tileY < 0) {
    return map.connections.some((connection) => connection.direction === 'up')
      ? 'up'
      : CONNECTION_INVALID;
  }

  return CONNECTION_INVALID;
};

export const getCollisionValueAtTile = (map: TileMap, tileX: number, tileY: number): number => {
  const tileIndex = getTileIndex(map, tileX, tileY);
  if (tileIndex === null) {
    return 1;
  }

  if (map.collisionValues) {
    return map.collisionValues[tileIndex] ?? 0;
  }

  return map.walkable[tileIndex] ? 0 : 1;
};

export const MapGridGetCollisionAt = (map: TileMap, tileX: number, tileY: number): number =>
  getCollisionValueAtTile(map, tileX, tileY);

export const mapGridGetCollisionAt = (map: TileMap, tileX: number, tileY: number): number =>
  MapGridGetCollisionAt(map, tileX, tileY);

export const isWalkableAtTile = (map: TileMap, tileX: number, tileY: number): boolean => {
  const tileIndex = getTileIndex(map, tileX, tileY);
  if (tileIndex === null) {
    return false;
  }

  return getCollisionValueAtTile(map, tileX, tileY) === 0;
};

export const getCollisionTilePosition = (position: Vec2, tileSize: number): Vec2 =>
  vec2(
    Math.floor((position.x + 8) / tileSize),
    Math.floor((position.y + 12) / tileSize)
  );

export const getTileBehaviorAtTile = (map: TileMap, tileX: number, tileY: number): number | null => {
  const tileIndex = getTileIndex(map, tileX, tileY);
  if (!map.tileBehaviors || tileIndex === null) {
    return null;
  }

  return map.tileBehaviors[tileIndex] ?? null;
};

export const MapGridGetMetatileBehaviorAt = (
  map: TileMap,
  tileX: number,
  tileY: number
): number | null => getTileBehaviorAtTile(map, tileX, tileY);

export const mapGridGetMetatileBehaviorAt = (
  map: TileMap,
  tileX: number,
  tileY: number
): number | null => MapGridGetMetatileBehaviorAt(map, tileX, tileY);

export const getElevationAtTile = (map: TileMap, tileX: number, tileY: number): number => {
  const tileIndex = getTileIndex(map, tileX, tileY);
  if (!map.elevations || tileIndex === null) {
    return 0;
  }

  return map.elevations[tileIndex] ?? 0;
};

export const MapGridGetElevationAt = (map: TileMap, tileX: number, tileY: number): number =>
  getElevationAtTile(map, tileX, tileY);

export const mapGridGetElevationAt = (map: TileMap, tileX: number, tileY: number): number =>
  MapGridGetElevationAt(map, tileX, tileY);

export const getMetatileTerrainAtTile = (map: TileMap, tileX: number, tileY: number): number => {
  const tileIndex = getTileIndex(map, tileX, tileY);
  if (!map.terrainTypes || tileIndex === null) {
    return 0;
  }

  return map.terrainTypes[tileIndex] ?? 0;
};

export const MapGridGetMetatileTerrainAt = (map: TileMap, tileX: number, tileY: number): number =>
  getMetatileTerrainAtTile(map, tileX, tileY);

export const mapGridGetMetatileTerrainAt = (map: TileMap, tileX: number, tileY: number): number =>
  MapGridGetMetatileTerrainAt(map, tileX, tileY);

const MB_IMPASSABLE_EAST = 0x30;
const MB_IMPASSABLE_WEST = 0x31;
const MB_IMPASSABLE_NORTH = 0x32;
const MB_IMPASSABLE_SOUTH = 0x33;
const MB_IMPASSABLE_NORTHEAST = 0x34;
const MB_IMPASSABLE_NORTHWEST = 0x35;
const MB_IMPASSABLE_SOUTHEAST = 0x36;
const MB_IMPASSABLE_SOUTHWEST = 0x37;

const isEastBlocked = (behavior: number | null): boolean =>
  behavior === MB_IMPASSABLE_EAST
  || behavior === MB_IMPASSABLE_NORTHEAST
  || behavior === MB_IMPASSABLE_SOUTHEAST;

const isWestBlocked = (behavior: number | null): boolean =>
  behavior === MB_IMPASSABLE_WEST
  || behavior === MB_IMPASSABLE_NORTHWEST
  || behavior === MB_IMPASSABLE_SOUTHWEST;

const isNorthBlocked = (behavior: number | null): boolean =>
  behavior === MB_IMPASSABLE_NORTH
  || behavior === MB_IMPASSABLE_NORTHEAST
  || behavior === MB_IMPASSABLE_NORTHWEST;

const isSouthBlocked = (behavior: number | null): boolean =>
  behavior === MB_IMPASSABLE_SOUTH
  || behavior === MB_IMPASSABLE_SOUTHEAST
  || behavior === MB_IMPASSABLE_SOUTHWEST;

export const isDirectionallyPassable = (
  currentBehavior: number | null,
  targetBehavior: number | null,
  direction: TileDirection
): boolean => {
  switch (direction) {
    case 'up':
      return !isNorthBlocked(currentBehavior) && !isSouthBlocked(targetBehavior);
    case 'down':
      return !isSouthBlocked(currentBehavior) && !isNorthBlocked(targetBehavior);
    case 'left':
      return !isWestBlocked(currentBehavior) && !isEastBlocked(targetBehavior);
    case 'right':
      return !isEastBlocked(currentBehavior) && !isWestBlocked(targetBehavior);
  }
};

export const canMoveBetweenTiles = (
  map: TileMap,
  currentTile: Vec2,
  targetTile: Vec2,
  direction: TileDirection
): boolean => {
  if (currentTile.x === targetTile.x && currentTile.y === targetTile.y) {
    return true;
  }

  if (!isWalkableAtTile(map, targetTile.x, targetTile.y)) {
    return false;
  }

  return isDirectionallyPassable(
    getTileBehaviorAtTile(map, currentTile.x, currentTile.y),
    getTileBehaviorAtTile(map, targetTile.x, targetTile.y),
    direction
  );
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

export const hasWaterEncounterAtPixel = (map: TileMap, pos: Vec2): boolean =>
  getEncounterTileAtPixel(map, pos) === 'W';
