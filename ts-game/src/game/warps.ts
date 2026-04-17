import type { PlayerState } from './player';
import { getPlayerTilePosition } from './player';
import type { TileMap } from '../world/tileMap';
import type { WarpSource } from '../world/mapSource';

const MB_CAVE_DOOR = 0x60;
const MB_LADDER = 0x61;
const MB_EAST_ARROW_WARP = 0x62;
const MB_WEST_ARROW_WARP = 0x63;
const MB_NORTH_ARROW_WARP = 0x64;
const MB_SOUTH_ARROW_WARP = 0x65;
const MB_FALL_WARP = 0x66;
const MB_REGULAR_WARP = 0x67;
const MB_LAVARIDGE_1F_WARP = 0x68;
const MB_WARP_DOOR = 0x69;
const MB_UP_ESCALATOR = 0x6a;
const MB_DOWN_ESCALATOR = 0x6b;
const MB_UP_RIGHT_STAIR_WARP = 0x6c;
const MB_UP_LEFT_STAIR_WARP = 0x6d;
const MB_DOWN_RIGHT_STAIR_WARP = 0x6e;
const MB_DOWN_LEFT_STAIR_WARP = 0x6f;
const MB_UNION_ROOM_WARP = 0x71;

export type WarpResolutionStatus = 'none' | 'resolved' | 'unloaded_map' | 'invalid_warp_id' | 'not_activatable';

export interface WarpTransition {
  status: WarpResolutionStatus;
  sourceWarp?: WarpSource;
  destinationMap?: TileMap;
  destinationWarp?: WarpSource;
  playerPosition?: { x: number; y: number };
}

const getTileBehaviorAt = (map: TileMap, tileX: number, tileY: number): number | null => {
  if (!map.tileBehaviors || tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return null;
  }

  return map.tileBehaviors[tileY * map.width + tileX] ?? null;
};

export const findWarpAtTile = (map: TileMap, tileX: number, tileY: number, elevation = 0): WarpSource | null =>
  map.warps.find((warp) =>
    warp.x === tileX
    && warp.y === tileY
    && (warp.elevation === elevation || warp.elevation === 0 || elevation === 0)
  ) ?? null;

export const isWarpMetatileBehavior = (behavior: number): boolean => (
  behavior === MB_WARP_DOOR
  || behavior === MB_LADDER
  || (behavior >= MB_UP_ESCALATOR && behavior <= MB_DOWN_ESCALATOR)
  || behavior === MB_CAVE_DOOR
  || behavior === MB_LAVARIDGE_1F_WARP
  || behavior === MB_REGULAR_WARP
  || behavior === MB_FALL_WARP
  || behavior === MB_UNION_ROOM_WARP
);

const isDirectionalStairWarpMetatileBehavior = (
  behavior: number,
  direction: PlayerState['facing']
): boolean => {
  switch (direction) {
    case 'left':
      return behavior === MB_UP_LEFT_STAIR_WARP || behavior === MB_DOWN_LEFT_STAIR_WARP;
    case 'right':
      return behavior === MB_UP_RIGHT_STAIR_WARP || behavior === MB_DOWN_RIGHT_STAIR_WARP;
    default:
      return false;
  }
};

export const isArrowWarpMetatileBehavior = (behavior: number, direction: PlayerState['facing']): boolean => {
  switch (direction) {
    case 'up':
      return behavior === MB_NORTH_ARROW_WARP;
    case 'down':
      return behavior === MB_SOUTH_ARROW_WARP;
    case 'left':
      return behavior === MB_WEST_ARROW_WARP;
    case 'right':
      return behavior === MB_EAST_ARROW_WARP;
  }
};

const isActivatableWarpTile = (
  behavior: number | null,
  direction: PlayerState['facing'],
  hasWarpEvent: boolean
): boolean => {
  if (behavior === null) {
    return false;
  }

  if (hasWarpEvent && behavior === 0) {
    return true;
  }

  return isWarpMetatileBehavior(behavior)
    || isDirectionalStairWarpMetatileBehavior(behavior, direction)
    || isArrowWarpMetatileBehavior(behavior, direction);
};

export const resolveWarpTransition = (
  map: TileMap,
  player: PlayerState,
  loadMapById: (mapId: string) => TileMap | null
): WarpTransition => {
  const playerTile = getPlayerTilePosition(player.position, map.tileSize);
  const sourceWarp = findWarpAtTile(map, playerTile.x, playerTile.y);
  if (!sourceWarp) {
    return { status: 'none' };
  }

  const behavior = getTileBehaviorAt(map, playerTile.x, playerTile.y);
  if (!isActivatableWarpTile(behavior, player.facing, true)) {
    return { status: 'not_activatable', sourceWarp };
  }

  const destinationMap = loadMapById(sourceWarp.destMap);
  if (!destinationMap) {
    return { status: 'unloaded_map', sourceWarp };
  }

  const destinationWarp = destinationMap.warps[sourceWarp.destWarpId];
  if (!destinationWarp) {
    return { status: 'invalid_warp_id', sourceWarp, destinationMap };
  }

  return {
    status: 'resolved',
    sourceWarp,
    destinationMap,
    destinationWarp,
    playerPosition: {
      x: destinationWarp.x * destinationMap.tileSize,
      y: destinationWarp.y * destinationMap.tileSize
    }
  };
};
