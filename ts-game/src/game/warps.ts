import type { PlayerState } from './player';
import { getPlayerTilePosition } from './player';
import type { TileMap } from '../world/tileMap';
import { isWalkableAtTile } from '../world/tileMap';
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

const isContiguous = (values: number[]): boolean =>
  values.every((value, index) => index === 0 || value === values[index - 1] + 1);

const resolveWarpArrivalTile = (
  sourceMap: TileMap,
  sourceWarp: WarpSource,
  destinationMap: TileMap,
  destinationWarp: WarpSource,
  arrivalFacing: PlayerState['facing']
): { x: number; y: number } => {
  const matchingWarps = sourceMap.warps
    .filter((warp) =>
      warp.destMap === sourceWarp.destMap
      && warp.destWarpId === sourceWarp.destWarpId
    )
    .sort((left, right) => left.y - right.y || left.x - right.x);

  let arrivalTile = {
    x: destinationWarp.x,
    y: destinationWarp.y
  };

  if (arrivalFacing === 'down') {
    const sameRowWarps = matchingWarps.filter((warp) => warp.y === sourceWarp.y);
    const sortedXs = sameRowWarps.map((warp) => warp.x).sort((left, right) => left - right);
    if (sameRowWarps.length > 1 && isContiguous(sortedXs)) {
      const sourceIndex = sortedXs.indexOf(sourceWarp.x);
      if (sourceIndex !== -1) {
        arrivalTile.x = destinationWarp.x - (sortedXs.length - 1) + sourceIndex;
      }
    }
  } else if (arrivalFacing === 'left' || arrivalFacing === 'right') {
    const sameColumnWarps = matchingWarps.filter((warp) => warp.x === sourceWarp.x);
    const sortedYs = sameColumnWarps.map((warp) => warp.y).sort((left, right) => left - right);
    if (sameColumnWarps.length > 1 && isContiguous(sortedYs)) {
      const sourceIndex = sortedYs.indexOf(sourceWarp.y);
      if (sourceIndex !== -1) {
        arrivalTile.y = destinationWarp.y - (sortedYs.length - 1) + sourceIndex;
      }
    }
  }

  const direction =
    arrivalFacing === 'left'
      ? { x: -1, y: 0 }
      : arrivalFacing === 'right'
        ? { x: 1, y: 0 }
        : arrivalFacing === 'up'
          ? { x: 0, y: -1 }
          : { x: 0, y: 1 };
  const blockedDestinationTile = !isWalkableAtTile(destinationMap, arrivalTile.x, arrivalTile.y);
  const fallbackTile = {
    x: arrivalTile.x + direction.x,
    y: arrivalTile.y + direction.y
  };

  return blockedDestinationTile && isWalkableAtTile(destinationMap, fallbackTile.x, fallbackTile.y)
    ? fallbackTile
    : arrivalTile;
};

const resolveDestinationWarp = (
  sourceMap: TileMap,
  sourceWarp: WarpSource,
  arrivalFacing: PlayerState['facing'],
  loadMapById: (mapId: string) => TileMap | null
): WarpTransition => {
  const destinationMap = loadMapById(sourceWarp.destMap);
  if (!destinationMap) {
    return { status: 'unloaded_map', sourceWarp };
  }

  const destinationWarp = destinationMap.warps[sourceWarp.destWarpId];
  if (!destinationWarp) {
    return { status: 'invalid_warp_id', sourceWarp, destinationMap };
  }

  const playerTile = resolveWarpArrivalTile(sourceMap, sourceWarp, destinationMap, destinationWarp, arrivalFacing);

  return {
    status: 'resolved',
    sourceWarp,
    destinationMap,
    destinationWarp,
    playerPosition: {
      x: playerTile.x * destinationMap.tileSize,
      y: playerTile.y * destinationMap.tileSize
    }
  };
};

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

  return resolveDestinationWarp(map, sourceWarp, player.facing, loadMapById);
};

export const resolveFacingDoorWarpTransition = (
  map: TileMap,
  player: PlayerState,
  attemptedDirection: PlayerState['facing'] | null,
  loadMapById: (mapId: string) => TileMap | null
): WarpTransition => {
  if (attemptedDirection !== 'up' || player.facing !== 'up') {
    return { status: 'none' };
  }

  const playerTile = getPlayerTilePosition(player.position, map.tileSize);
  const targetTile = {
    x: playerTile.x,
    y: playerTile.y - 1
  };
  const sourceWarp = findWarpAtTile(map, targetTile.x, targetTile.y);

  if (!sourceWarp) {
    return { status: 'none' };
  }

  const behavior = getTileBehaviorAt(map, targetTile.x, targetTile.y);
  const blockedDoorstep = !isWalkableAtTile(map, targetTile.x, targetTile.y);
  const matchesDoorWarp =
    behavior === MB_WARP_DOOR
    || (behavior === 0 && blockedDoorstep);

  if (!matchesDoorWarp) {
    return { status: 'not_activatable', sourceWarp };
  }

  return resolveDestinationWarp(map, sourceWarp, player.facing, loadMapById);
};
