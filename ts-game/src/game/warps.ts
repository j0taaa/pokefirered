import type { PlayerState } from './player';
import { getPlayerTilePosition } from './player';
import type { TileMap } from '../world/tileMap';
import { isWalkableAtTile, MapGridGetElevationAt, MapGridGetMetatileBehaviorAt } from '../world/tileMap';
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
export type WarpEffect =
  | 'warp'
  | 'door'
  | 'stair'
  | 'escalator'
  | 'lavaridgeB1F'
  | 'lavaridge1F'
  | 'teleport'
  | 'unionRoom'
  | 'fall';

export interface WarpTransition {
  status: WarpResolutionStatus;
  sourceWarp?: WarpSource;
  destinationMap?: TileMap;
  destinationWarp?: WarpSource;
  playerPosition?: { x: number; y: number };
  effect?: WarpEffect;
  behavior?: number;
  delayFrames?: number;
  resetInitialPlayerAvatarState?: boolean;
}

export interface DynamicWarpDestination {
  mapId: string;
  warpId: number;
  x: number;
  y: number;
}

export interface WarpActivationOptions {
  allowArrowWarp?: boolean;
  allowDirectionalStairWarp?: boolean;
}

export interface WarpEffectInfo {
  effect: WarpEffect;
  behavior: number;
  delayFrames?: number;
  resetInitialPlayerAvatarState?: boolean;
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
  loadMapById: (mapId: string) => TileMap | null,
  dynamicWarp?: DynamicWarpDestination | null
): WarpTransition => {
  if (sourceWarp.destWarpId === 255 && dynamicWarp) {
    const dynamicDestinationMap = loadMapById(dynamicWarp.mapId);
    if (!dynamicDestinationMap) {
      return { status: 'unloaded_map', sourceWarp };
    }

    const destinationWarp: WarpSource = {
      x: dynamicWarp.x,
      y: dynamicWarp.y,
      elevation: 0,
      destMap: sourceMap.id,
      destWarpId: dynamicWarp.warpId
    };

    return {
      status: 'resolved',
      sourceWarp,
      destinationMap: dynamicDestinationMap,
      destinationWarp,
      playerPosition: {
        x: dynamicWarp.x * dynamicDestinationMap.tileSize,
        y: dynamicWarp.y * dynamicDestinationMap.tileSize
      }
    };
  }

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

export const findWarpAtTile = (map: TileMap, tileX: number, tileY: number, elevation = 0): WarpSource | null =>
  map.warps.find((warp) =>
    warp.x === tileX
    && warp.y === tileY
    && (warp.elevation === elevation || warp.elevation === 0)
  ) ?? null;

export const MetatileBehavior_IsWarpDoor = (behavior: number): boolean => behavior === MB_WARP_DOOR;
export const MetatileBehavior_IsLadder = (behavior: number): boolean => behavior === MB_LADDER;
export const MetatileBehavior_IsEscalator = (behavior: number): boolean =>
  behavior >= MB_UP_ESCALATOR && behavior <= MB_DOWN_ESCALATOR;
export const MetatileBehavior_IsNonAnimDoor = (behavior: number): boolean => behavior === MB_CAVE_DOOR;
export const MetatileBehavior_IsLavaridgeB1FWarp = (_behavior: number): boolean => false;
export const MetatileBehavior_IsLavaridge1FWarp = (behavior: number): boolean =>
  behavior === MB_LAVARIDGE_1F_WARP;
export const MetatileBehavior_IsWarpPad = (behavior: number): boolean => behavior === MB_REGULAR_WARP;
export const MetatileBehavior_IsFallWarp = (behavior: number): boolean => behavior === MB_FALL_WARP;
export const MetatileBehavior_IsUnionRoomWarp = (behavior: number): boolean => behavior === MB_UNION_ROOM_WARP;

export const IsWarpMetatileBehavior = (behavior: number): boolean => (
  MetatileBehavior_IsWarpDoor(behavior)
  || MetatileBehavior_IsLadder(behavior)
  || MetatileBehavior_IsEscalator(behavior)
  || MetatileBehavior_IsNonAnimDoor(behavior)
  || MetatileBehavior_IsLavaridgeB1FWarp(behavior)
  || MetatileBehavior_IsLavaridge1FWarp(behavior)
  || MetatileBehavior_IsWarpPad(behavior)
  || MetatileBehavior_IsFallWarp(behavior)
  || MetatileBehavior_IsUnionRoomWarp(behavior)
);

export const isWarpMetatileBehavior = IsWarpMetatileBehavior;

export const IsDirectionalStairWarpMetatileBehavior = (
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

export const isDirectionalStairWarpMetatileBehavior = IsDirectionalStairWarpMetatileBehavior;

export const IsArrowWarpMetatileBehavior = (behavior: number, direction: PlayerState['facing']): boolean => {
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

export const isArrowWarpMetatileBehavior = IsArrowWarpMetatileBehavior;

const isBikeAvatarMode = (avatarMode: PlayerState['avatarMode']): boolean =>
  avatarMode === 'machBike' || avatarMode === 'acroBike';

export const getWarpEffectForBehavior = (
  behavior: number,
  direction: PlayerState['facing'],
  avatarMode: PlayerState['avatarMode'] = 'normal'
): WarpEffectInfo => {
  if (IsDirectionalStairWarpMetatileBehavior(behavior, direction)) {
    return {
      effect: 'stair',
      behavior,
      delayFrames: isBikeAvatarMode(avatarMode) ? 12 : 0
    };
  }

  if (MetatileBehavior_IsEscalator(behavior)) {
    return { effect: 'escalator', behavior };
  }

  if (MetatileBehavior_IsLavaridgeB1FWarp(behavior)) {
    return { effect: 'lavaridgeB1F', behavior };
  }

  if (MetatileBehavior_IsLavaridge1FWarp(behavior)) {
    return { effect: 'lavaridge1F', behavior };
  }

  if (MetatileBehavior_IsWarpPad(behavior)) {
    return { effect: 'teleport', behavior };
  }

  if (MetatileBehavior_IsUnionRoomWarp(behavior)) {
    return { effect: 'unionRoom', behavior };
  }

  if (MetatileBehavior_IsFallWarp(behavior)) {
    return {
      effect: 'fall',
      behavior,
      resetInitialPlayerAvatarState: true
    };
  }

  return { effect: 'warp', behavior };
};

const shouldAttachWarpEffect = (effect: WarpEffect): boolean =>
  effect !== 'warp';

const withWarpEffect = (transition: WarpTransition, effectInfo: WarpEffectInfo): WarpTransition => {
  if (transition.status !== 'resolved' || !shouldAttachWarpEffect(effectInfo.effect)) {
    return transition;
  }

  return {
    ...transition,
    ...effectInfo
  };
};

const isActivatableWarpTile = (
  behavior: number | null,
  direction: PlayerState['facing'],
  options: WarpActivationOptions = {}
): boolean => {
  if (behavior === null) {
    return false;
  }

  const allowArrowWarp = options.allowArrowWarp ?? true;
  const allowDirectionalStairWarp = options.allowDirectionalStairWarp ?? true;

  return IsWarpMetatileBehavior(behavior)
    || (allowDirectionalStairWarp && IsDirectionalStairWarpMetatileBehavior(behavior, direction))
    || (allowArrowWarp && IsArrowWarpMetatileBehavior(behavior, direction));
};

export const GetPlayerCurMetatileBehavior = (map: TileMap, player: PlayerState): number | null => {
  const playerTile = getPlayerTilePosition(player.position, map.tileSize);
  return MapGridGetMetatileBehaviorAt(map, playerTile.x, playerTile.y);
};

export const GetInFrontOfPlayerPosition = (
  map: TileMap,
  player: PlayerState
): { x: number; y: number; elevation: number } => {
  const playerTile = getPlayerTilePosition(player.position, map.tileSize);
  const frontTile = {
    x: player.facing === 'left' ? playerTile.x - 1 : player.facing === 'right' ? playerTile.x + 1 : playerTile.x,
    y: player.facing === 'up' ? playerTile.y - 1 : player.facing === 'down' ? playerTile.y + 1 : playerTile.y
  };
  const playerElevation = MapGridGetElevationAt(map, playerTile.x, playerTile.y);

  return {
    ...frontTile,
    elevation: playerElevation !== 0 ? playerElevation : 0
  };
};

export const resolveWarpTransition = (
  map: TileMap,
  player: PlayerState,
  loadMapById: (mapId: string) => TileMap | null,
  dynamicWarp?: DynamicWarpDestination | null,
  options: WarpActivationOptions = {}
): WarpTransition => {
  const playerTile = getPlayerTilePosition(player.position, map.tileSize);
  const playerElevation = MapGridGetElevationAt(map, playerTile.x, playerTile.y);
  const sourceWarp = findWarpAtTile(map, playerTile.x, playerTile.y, playerElevation);
  if (!sourceWarp) {
    return { status: 'none' };
  }

  const behavior = GetPlayerCurMetatileBehavior(map, player);
  if (!isActivatableWarpTile(behavior, player.facing, options)) {
    return { status: 'not_activatable', sourceWarp };
  }

  const transition = resolveDestinationWarp(map, sourceWarp, player.facing, loadMapById, dynamicWarp);
  return behavior === null
    ? transition
    : withWarpEffect(transition, getWarpEffectForBehavior(behavior, player.facing, player.avatarMode));
};

export const resolveArrowWarpTransition = (
  map: TileMap,
  player: PlayerState,
  heldDirection: PlayerState['facing'] | null,
  loadMapById: (mapId: string) => TileMap | null,
  dynamicWarp?: DynamicWarpDestination | null
): WarpTransition => {
  if (!heldDirection || heldDirection !== player.facing) {
    return { status: 'none' };
  }

  const playerTile = getPlayerTilePosition(player.position, map.tileSize);
  const playerElevation = MapGridGetElevationAt(map, playerTile.x, playerTile.y);
  const sourceWarp = findWarpAtTile(map, playerTile.x, playerTile.y, playerElevation);
  if (!sourceWarp) {
    return { status: 'none' };
  }

  const behavior = GetPlayerCurMetatileBehavior(map, player);
  if (behavior === null || !IsArrowWarpMetatileBehavior(behavior, player.facing)) {
    return { status: 'not_activatable', sourceWarp };
  }

  return resolveDestinationWarp(map, sourceWarp, player.facing, loadMapById, dynamicWarp);
};

export const resolveFacingDoorWarpTransition = (
  map: TileMap,
  player: PlayerState,
  attemptedDirection: PlayerState['facing'] | null,
  loadMapById: (mapId: string) => TileMap | null,
  dynamicWarp?: DynamicWarpDestination | null
): WarpTransition => {
  if (attemptedDirection !== 'up' || player.facing !== 'up') {
    return { status: 'none' };
  }

  const targetTile = GetInFrontOfPlayerPosition(map, player);
  const sourceWarp = findWarpAtTile(map, targetTile.x, targetTile.y, targetTile.elevation);

  if (!sourceWarp) {
    return { status: 'none' };
  }

  const behavior = MapGridGetMetatileBehaviorAt(map, targetTile.x, targetTile.y);
  const matchesDoorWarp = behavior !== null && MetatileBehavior_IsWarpDoor(behavior);

  if (!matchesDoorWarp) {
    return { status: 'not_activatable', sourceWarp };
  }

  return withWarpEffect(
    resolveDestinationWarp(map, sourceWarp, player.facing, loadMapById, dynamicWarp),
    { effect: 'door', behavior }
  );
};
