import type { Vec2 } from '../core/vec2';
import { loadPrototypeRouteMap, type EncounterType, type NpcSource, type TriggerZone } from './mapSource';

export interface TileMap {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  walkable: boolean[];
  encounterTypes: EncounterType[];
  metatileBehaviors: number[];
  triggers: TriggerZone[];
  npcs: NpcSource[];
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

export const getEncounterTypeAtPixel = (map: TileMap, pos: Vec2): EncounterType => {
  const tileX = Math.floor(pos.x / map.tileSize);
  const tileY = Math.floor(pos.y / map.tileSize);

  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return 'none';
  }

  return map.encounterTypes[tileY * map.width + tileX] ?? 'none';
};

export const isLandEncounterAtPixel = (map: TileMap, pos: Vec2): boolean =>
  getEncounterTypeAtPixel(map, pos) === 'land';

export const getMetatileBehaviorAtPixel = (map: TileMap, pos: Vec2): number => {
  const tileX = Math.floor(pos.x / map.tileSize);
  const tileY = Math.floor(pos.y / map.tileSize);

  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return 0;
  }

  return map.metatileBehaviors[tileY * map.width + tileX] ?? 0;
};

const MB_IMPASSABLE_EAST = 0x30;
const MB_IMPASSABLE_WEST = 0x31;
const MB_IMPASSABLE_NORTH = 0x32;
const MB_IMPASSABLE_SOUTH = 0x33;
const MB_IMPASSABLE_NORTHEAST = 0x34;
const MB_IMPASSABLE_NORTHWEST = 0x35;
const MB_IMPASSABLE_SOUTHEAST = 0x36;
const MB_IMPASSABLE_SOUTHWEST = 0x37;
const MB_JUMP_EAST = 0x38;
const MB_JUMP_WEST = 0x39;
const MB_JUMP_NORTH = 0x3a;
const MB_JUMP_SOUTH = 0x3b;

export type MovementDirection = 'up' | 'down' | 'left' | 'right';

export const isMetatileDirectionBlocked = (
  behavior: number,
  direction: MovementDirection
): boolean => {
  switch (direction) {
    case 'up':
      return behavior === MB_IMPASSABLE_NORTH
        || behavior === MB_IMPASSABLE_NORTHEAST
        || behavior === MB_IMPASSABLE_NORTHWEST;
    case 'down':
      return behavior === MB_IMPASSABLE_SOUTH
        || behavior === MB_IMPASSABLE_SOUTHEAST
        || behavior === MB_IMPASSABLE_SOUTHWEST;
    case 'left':
      return behavior === MB_IMPASSABLE_WEST
        || behavior === MB_IMPASSABLE_NORTHWEST
        || behavior === MB_IMPASSABLE_SOUTHWEST;
    case 'right':
      return behavior === MB_IMPASSABLE_EAST
        || behavior === MB_IMPASSABLE_NORTHEAST
        || behavior === MB_IMPASSABLE_SOUTHEAST;
  }
};

export const isJumpMetatileBehavior = (
  behavior: number,
  direction: MovementDirection
): boolean => {
  switch (direction) {
    case 'up':
      return behavior === MB_JUMP_NORTH;
    case 'down':
      return behavior === MB_JUMP_SOUTH;
    case 'left':
      return behavior === MB_JUMP_WEST;
    case 'right':
      return behavior === MB_JUMP_EAST;
  }
};

const oppositeDirection = (direction: MovementDirection): MovementDirection => {
  switch (direction) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
};

export const isDirectionalMoveBlocked = (
  map: TileMap,
  from: Vec2,
  to: Vec2,
  direction: MovementDirection
): boolean => {
  const fromTileX = Math.floor(from.x / map.tileSize);
  const fromTileY = Math.floor(from.y / map.tileSize);
  const toTileX = Math.floor(to.x / map.tileSize);
  const toTileY = Math.floor(to.y / map.tileSize);

  if (fromTileX === toTileX && fromTileY === toTileY) {
    return false;
  }

  const fromBehavior = getMetatileBehaviorAtPixel(map, from);
  const toBehavior = getMetatileBehaviorAtPixel(map, to);
  return isMetatileDirectionBlocked(fromBehavior, oppositeDirection(direction))
    || isMetatileDirectionBlocked(toBehavior, direction);
};
