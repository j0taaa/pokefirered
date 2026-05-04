import { vec2, type Vec2 } from '../core/vec2';
import type { MapConnectionSource } from '../world/mapSource';
import {
  CONNECTION_INVALID,
  GetMapBorderIdAt,
  isDirectionallyPassable,
  MapGridGetCollisionAt,
  MapGridGetElevationAt,
  MapGridGetMetatileTerrainAt,
  MapGridGetMetatileBehaviorAt,
  type TileDirection,
  type TileMap
} from '../world/tileMap';
import { TestMetatileAttributeBit } from './decompMetatileBehavior';

const MB_POND_WATER = 0x10;
const MB_FAST_WATER = 0x11;
const MB_DEEP_WATER = 0x12;
const MB_WATERFALL = 0x13;
const MB_OCEAN_WATER = 0x15;
const MB_UNUSED_WATER = 0x1a;
const MB_CYCLING_ROAD_WATER = 0x1b;
const MB_EASTWARD_CURRENT = 0x50;
const MB_WESTWARD_CURRENT = 0x51;
const MB_NORTHWARD_CURRENT = 0x52;
const MB_SOUTHWARD_CURRENT = 0x53;
const MB_JUMP_EAST = 0x38;
const MB_JUMP_WEST = 0x39;
const MB_JUMP_NORTH = 0x3a;
const MB_JUMP_SOUTH = 0x3b;
const MB_CAVE_DOOR = 0x60;
const MB_FALL_WARP = 0x66;
const MB_UP_RIGHT_STAIR_WARP = 0x6c;
const MB_UP_LEFT_STAIR_WARP = 0x6d;
const MB_DOWN_RIGHT_STAIR_WARP = 0x6e;
const MB_DOWN_LEFT_STAIR_WARP = 0x6f;
const PUSHABLE_BOULDER_GFX = 'OBJ_EVENT_GFX_PUSHABLE_BOULDER';
const TILE_TERRAIN_WATER = 2;

export type AvatarMode = 'normal' | 'surfing' | 'underwater' | 'machBike' | 'acroBike';

export type CollisionResult =
  | 'none'
  | 'impassable'
  | 'outsideRange'
  | 'elevationMismatch'
  | 'objectEvent'
  | 'ledgeJump'
  | 'stopSurfing'
  | 'pushedBoulder'
  | 'directionalStairWarp'
  | 'wheelieHop'
  | 'isolatedVerticalRail'
  | 'isolatedHorizontalRail'
  | 'verticalRail'
  | 'horizontalRail';

export interface FieldRuntimeObject {
  id: string;
  currentTile: Vec2;
  previousTile: Vec2;
  facing: TileDirection;
  initialTile: Vec2;
  movementRangeX: number;
  movementRangeY: number;
  currentElevation: number;
  previousElevation: number;
  trackedByCamera: boolean;
  avatarMode: AvatarMode;
  graphicsId?: string;
  strengthActive?: boolean;
}

export interface ResolvedStepTarget {
  map: TileMap;
  tile: Vec2;
  viaConnection: boolean;
  connection?: MapConnectionSource;
}

export interface FieldCollisionEvaluation {
  result: CollisionResult;
  target: ResolvedStepTarget | null;
  movementTarget?: ResolvedStepTarget | null;
  blockingObject?: FieldRuntimeObject;
}

export interface EvaluateFieldCollisionParams {
  map: TileMap;
  object: FieldRuntimeObject;
  direction: TileDirection;
  objects?: readonly FieldRuntimeObject[];
  loadMapById?: (mapId: string) => TileMap | null;
}

export const COLLISION_FLAG_OUTSIDE_RANGE = 1;
export const COLLISION_FLAG_IMPASSABLE = 2;
export const COLLISION_FLAG_ELEVATION_MISMATCH = 4;
export const COLLISION_FLAG_OBJECT_EVENT = 8;

const SURFABLE_BEHAVIORS = new Set<number>([
  MB_POND_WATER,
  MB_FAST_WATER,
  MB_DEEP_WATER,
  MB_WATERFALL,
  MB_OCEAN_WATER,
  MB_UNUSED_WATER,
  MB_CYCLING_ROAD_WATER,
  MB_EASTWARD_CURRENT,
  MB_WESTWARD_CURRENT,
  MB_NORTHWARD_CURRENT,
  MB_SOUTHWARD_CURRENT
]);

export const getDirectionVector = (direction: TileDirection): Vec2 => {
  switch (direction) {
    case 'up':
      return vec2(0, -1);
    case 'down':
      return vec2(0, 1);
    case 'left':
      return vec2(-1, 0);
    case 'right':
      return vec2(1, 0);
  }
};

const doesObjectElevationMatch = (object: FieldRuntimeObject, elevation: number): boolean => {
  if (object.currentElevation !== 0 && elevation !== 0 && object.currentElevation !== elevation) {
    return false;
  }

  return true;
};

const getDirectionalStairWarpBehavior = (
  behavior: number | null,
  direction: TileDirection
): boolean => {
  if (behavior === null) {
    return false;
  }

  switch (direction) {
    case 'left':
      return behavior === MB_UP_LEFT_STAIR_WARP || behavior === MB_DOWN_LEFT_STAIR_WARP;
    case 'right':
      return behavior === MB_UP_RIGHT_STAIR_WARP || behavior === MB_DOWN_RIGHT_STAIR_WARP;
    default:
      return false;
  }
};

export const MetatileBehavior_IsJumpEast = (behavior: number | null): boolean => behavior === MB_JUMP_EAST;
export const MetatileBehavior_IsJumpWest = (behavior: number | null): boolean => behavior === MB_JUMP_WEST;
export const MetatileBehavior_IsJumpNorth = (behavior: number | null): boolean => behavior === MB_JUMP_NORTH;
export const MetatileBehavior_IsJumpSouth = (behavior: number | null): boolean => behavior === MB_JUMP_SOUTH;
export const MetatileBehavior_IsNonAnimDoor = (behavior: number | null): boolean => behavior === MB_CAVE_DOOR;
export const MetatileBehavior_IsWaterfall = (behavior: number | null): boolean => behavior === MB_WATERFALL;
export const MetatileBehavior_IsSurfable = (behavior: number | null): boolean =>
  behavior !== null && SURFABLE_BEHAVIORS.has(behavior);
export const MetatileBehavior_IsSurfableAndNotWaterfall = (behavior: number | null): boolean =>
  MetatileBehavior_IsSurfable(behavior) && !MetatileBehavior_IsWaterfall(behavior);
export const MetatileBehavior_IsBridge = (_behavior: number | null): boolean => false;
export const MetatileBehavior_IsWater = (behavior: number | null): boolean =>
  behavior !== null
  && (
    (behavior >= MB_POND_WATER && behavior <= MB_DEEP_WATER)
    || behavior === MB_OCEAN_WATER
    || (behavior >= MB_EASTWARD_CURRENT && behavior <= MB_SOUTHWARD_CURRENT)
  );

export const MetatileAtCoordsIsWaterTile = (map: TileMap, tileX: number, tileY: number): boolean =>
  TestMetatileAttributeBit(MapGridGetMetatileTerrainAt(map, tileX, tileY), TILE_TERRAIN_WATER);

export const MetatileBehavior_IsBumpySlope = (_behavior: number | null): boolean => false;
export const MetatileBehavior_IsIsolatedVerticalRail = (_behavior: number | null): boolean => false;
export const MetatileBehavior_IsIsolatedHorizontalRail = (_behavior: number | null): boolean => false;
export const MetatileBehavior_IsVerticalRail = (_behavior: number | null): boolean => false;
export const MetatileBehavior_IsHorizontalRail = (_behavior: number | null): boolean => false;

export const checkAcroBikeCollision = (behavior: number | null): CollisionResult | null => {
  if (MetatileBehavior_IsBumpySlope(behavior)) {
    return 'wheelieHop';
  }

  if (MetatileBehavior_IsIsolatedVerticalRail(behavior)) {
    return 'isolatedVerticalRail';
  }

  if (MetatileBehavior_IsIsolatedHorizontalRail(behavior)) {
    return 'isolatedHorizontalRail';
  }

  if (MetatileBehavior_IsVerticalRail(behavior)) {
    return 'verticalRail';
  }

  if (MetatileBehavior_IsHorizontalRail(behavior)) {
    return 'horizontalRail';
  }

  return null;
};

const isElevationMismatchAt = (elevation: number, map: TileMap, tile: Vec2): boolean => {
  if (elevation === 0) {
    return false;
  }

  const mapElevation = MapGridGetElevationAt(map, tile.x, tile.y);
  if (mapElevation === 0 || mapElevation === 15) {
    return false;
  }

  return mapElevation !== elevation;
};

const areElevationsCompatible = (left: number, right: number): boolean => {
  if (left === 0 || right === 0) {
    return true;
  }

  return left === right;
};

export const ObjectEventDoesElevationMatch = (object: FieldRuntimeObject, elevation: number): boolean =>
  doesObjectElevationMatch(object, elevation);

export const GetObjectEventIdByPosition = (
  objects: readonly FieldRuntimeObject[],
  tile: Vec2,
  elevation: number
): string | null => {
  const object = objects.find((candidate) =>
    candidate.currentTile.x === tile.x
    && candidate.currentTile.y === tile.y
    && ObjectEventDoesElevationMatch(candidate, elevation)
  );

  return object?.id ?? null;
};

export const GetObjectEventIdByXY = (
  objects: readonly FieldRuntimeObject[],
  tile: Vec2
): string | null => {
  const object = objects.find((candidate) =>
    candidate.currentTile.x === tile.x
    && candidate.currentTile.y === tile.y
  );

  return object?.id ?? null;
};

const isOutsideMovementRange = (
  object: FieldRuntimeObject,
  target: ResolvedStepTarget,
  currentMap: TileMap
): boolean => {
  if (target.map.id !== currentMap.id) {
    return false;
  }

  if (object.movementRangeX !== 0) {
    const left = object.initialTile.x - object.movementRangeX;
    const right = object.initialTile.x + object.movementRangeX;
    if (target.tile.x < left || target.tile.x > right) {
      return true;
    }
  }

  if (object.movementRangeY !== 0) {
    const top = object.initialTile.y - object.movementRangeY;
    const bottom = object.initialTile.y + object.movementRangeY;
    if (target.tile.y < top || target.tile.y > bottom) {
      return true;
    }
  }

  return false;
};

const findBlockingObject = (
  object: FieldRuntimeObject,
  target: ResolvedStepTarget,
  objects: readonly FieldRuntimeObject[]
): FieldRuntimeObject | undefined =>
  objects.find((candidate) =>
    candidate.id !== object.id
    && areElevationsCompatible(object.currentElevation, candidate.currentElevation)
    && (
      (candidate.currentTile.x === target.tile.x && candidate.currentTile.y === target.tile.y)
      || (candidate.previousTile.x === target.tile.x && candidate.previousTile.y === target.tile.y)
    )
  );

export const CanStopSurfing = (
  object: FieldRuntimeObject,
  target: ResolvedStepTarget,
  objects: readonly FieldRuntimeObject[]
): boolean =>
  object.avatarMode === 'surfing'
  && MapGridGetElevationAt(target.map, target.tile.x, target.tile.y) === 3
  && GetObjectEventIdByPosition(objects, target.tile, 3) === null;

const isPushableBoulder = (object: FieldRuntimeObject | undefined): object is FieldRuntimeObject =>
  object?.graphicsId === PUSHABLE_BOULDER_GFX;

const resolveConnectionTargetTile = (
  map: TileMap,
  currentTile: Vec2,
  direction: TileDirection,
  loadMapById?: (mapId: string) => TileMap | null
): ResolvedStepTarget | null => {
  const delta = getDirectionVector(direction);
  const directTile = vec2(currentTile.x + delta.x, currentTile.y + delta.y);
  if (
    directTile.x >= 0
    && directTile.y >= 0
    && directTile.x < map.width
    && directTile.y < map.height
  ) {
    return { map, tile: directTile, viaConnection: false };
  }

  const connection = map.connections.find((entry) => entry.direction === direction);
  if (!connection || !loadMapById) {
    return null;
  }

  const destinationMap = loadMapById(connection.map);
  if (!destinationMap) {
    throw new Error(`Invalid map connection: ${map.id} ${direction} connection references unloaded map ${connection.map}.`);
  }

  const destinationTile = vec2(currentTile.x, currentTile.y);
  switch (direction) {
    case 'up':
      destinationTile.x = currentTile.x - connection.offset;
      destinationTile.y = destinationMap.height - 1;
      break;
    case 'down':
      destinationTile.x = currentTile.x - connection.offset;
      destinationTile.y = 0;
      break;
    case 'left':
      destinationTile.x = destinationMap.width - 1;
      destinationTile.y = currentTile.y - connection.offset;
      break;
    case 'right':
      destinationTile.x = 0;
      destinationTile.y = currentTile.y - connection.offset;
      break;
  }

  if (
    destinationTile.x < 0
    || destinationTile.y < 0
    || destinationTile.x >= destinationMap.width
    || destinationTile.y >= destinationMap.height
  ) {
    return null;
  }

  return {
    map: destinationMap,
    tile: destinationTile,
    viaConnection: true,
    connection
  };
};

export const resolveStepTarget = (
  map: TileMap,
  currentTile: Vec2,
  direction: TileDirection,
  loadMapById?: (mapId: string) => TileMap | null
): ResolvedStepTarget | null => resolveConnectionTargetTile(map, currentTile, direction, loadMapById);

const canCameraMoveInDirection = (
  map: TileMap,
  currentTile: Vec2,
  direction: TileDirection,
  loadMapById?: (mapId: string) => TileMap | null
): boolean => resolveStepTarget(map, currentTile, direction, loadMapById) !== null;

const tryPushBoulder = (
  map: TileMap,
  target: ResolvedStepTarget,
  direction: TileDirection,
  objects: readonly FieldRuntimeObject[],
  loadMapById?: (mapId: string) => TileMap | null
): FieldRuntimeObject | null => {
  const blockingObjectId = GetObjectEventIdByXY(objects, target.tile);
  const blockingObject = blockingObjectId
    ? objects.find((object) => object.id === blockingObjectId)
    : undefined;
  if (!isPushableBoulder(blockingObject)) {
    return null;
  }
  const boulderTarget = resolveStepTarget(map, blockingObject.currentTile, direction, loadMapById);
  if (!boulderTarget || boulderTarget.map.id !== map.id) {
    return null;
  }

  const nextBehavior = MapGridGetMetatileBehaviorAt(map, boulderTarget.tile.x, boulderTarget.tile.y);
  if (nextBehavior === MB_FALL_WARP) {
    return blockingObject;
  }

  if (MetatileBehavior_IsNonAnimDoor(nextBehavior)) {
    return null;
  }

  const boulderCollision = getCollisionAtCoords(
    map,
    blockingObject,
    direction,
    boulderTarget,
    objects,
    loadMapById
  );
  return boulderCollision.result === 'none' ? blockingObject : null;
};

export const GetLedgeJumpDirection = (
  map: TileMap,
  tile: Vec2,
  direction: TileDirection | null
): TileDirection | null => {
  if (direction === null) {
    return null;
  }

  const behavior = MapGridGetMetatileBehaviorAt(map, tile.x, tile.y);
  switch (direction) {
    case 'down':
      return MetatileBehavior_IsJumpSouth(behavior) ? 'down' : null;
    case 'up':
      return MetatileBehavior_IsJumpNorth(behavior) ? 'up' : null;
    case 'left':
      return MetatileBehavior_IsJumpWest(behavior) ? 'left' : null;
    case 'right':
      return MetatileBehavior_IsJumpEast(behavior) ? 'right' : null;
  }
};

export const ShouldJumpLedge = (map: TileMap, tile: Vec2, direction: TileDirection): boolean =>
  GetLedgeJumpDirection(map, tile, direction) !== null;

export const getCollisionAtCoords = (
  map: TileMap,
  object: FieldRuntimeObject,
  direction: TileDirection,
  target: ResolvedStepTarget,
  objects: readonly FieldRuntimeObject[],
  loadMapById?: (mapId: string) => TileMap | null
): FieldCollisionEvaluation => {
  if (isOutsideMovementRange(object, target, map)) {
    return { result: 'outsideRange', target };
  }

  const directionVector = getDirectionVector(direction);
  const targetBorderId = GetMapBorderIdAt(
    map,
    object.currentTile.x + directionVector.x,
    object.currentTile.y + directionVector.y
  );
  const currentBehavior = MapGridGetMetatileBehaviorAt(map, object.currentTile.x, object.currentTile.y);
  const targetBehavior = MapGridGetMetatileBehaviorAt(target.map, target.tile.x, target.tile.y);
  if (
    MapGridGetCollisionAt(target.map, target.tile.x, target.tile.y) !== 0
    || targetBorderId === CONNECTION_INVALID
    || !isDirectionallyPassable(currentBehavior, targetBehavior, direction)
  ) {
    return { result: 'impassable', target };
  }

  if (object.trackedByCamera && !canCameraMoveInDirection(map, object.currentTile, direction, loadMapById)) {
    return { result: 'impassable', target };
  }

  if (isElevationMismatchAt(object.currentElevation, target.map, target.tile)) {
    return { result: 'elevationMismatch', target };
  }

  const blockingObject = findBlockingObject(object, target, objects);
  if (blockingObject) {
    return { result: 'objectEvent', target, blockingObject };
  }

  return { result: 'none', target };
};

export const evaluateBaseFieldCollision = getCollisionAtCoords;

export const getCollisionFlagsAtCoords = (
  map: TileMap,
  object: FieldRuntimeObject,
  direction: TileDirection,
  target: ResolvedStepTarget | null,
  objects: readonly FieldRuntimeObject[],
  loadMapById?: (mapId: string) => TileMap | null
): number => {
  let flags = 0;

  if (target && isOutsideMovementRange(object, target, map)) {
    flags |= COLLISION_FLAG_OUTSIDE_RANGE;
  }

  const directionVector = getDirectionVector(direction);
  const targetBorderId = GetMapBorderIdAt(
    map,
    object.currentTile.x + directionVector.x,
    object.currentTile.y + directionVector.y
  );
  const currentBehavior = MapGridGetMetatileBehaviorAt(map, object.currentTile.x, object.currentTile.y);
  const targetBehavior = target
    ? MapGridGetMetatileBehaviorAt(target.map, target.tile.x, target.tile.y)
    : null;
  if (
    !target
    || MapGridGetCollisionAt(target.map, target.tile.x, target.tile.y) !== 0
    || targetBorderId === CONNECTION_INVALID
    || !isDirectionallyPassable(currentBehavior, targetBehavior, direction)
    || (object.trackedByCamera && !canCameraMoveInDirection(map, object.currentTile, direction, loadMapById))
  ) {
    flags |= COLLISION_FLAG_IMPASSABLE;
  }

  if (target && isElevationMismatchAt(object.currentElevation, target.map, target.tile)) {
    flags |= COLLISION_FLAG_ELEVATION_MISMATCH;
  }

  if (target && findBlockingObject(object, target, objects)) {
    flags |= COLLISION_FLAG_OBJECT_EVENT;
  }

  return flags;
};

export const checkForObjectEventCollision = (
  map: TileMap,
  object: FieldRuntimeObject,
  direction: TileDirection,
  target: ResolvedStepTarget | null,
  metatileBehavior: number | null,
  objects: readonly FieldRuntimeObject[] = [],
  loadMapById?: (mapId: string) => TileMap | null
): FieldCollisionEvaluation => {
  if (!target) {
    return { result: 'impassable', target: null, movementTarget: null };
  }

  const collision = getCollisionAtCoords(map, object, direction, target, objects, loadMapById);
  if (collision.result === 'elevationMismatch' && CanStopSurfing(object, target, objects)) {
    return { result: 'stopSurfing', target, movementTarget: target };
  }

  if (ShouldJumpLedge(target.map, target.tile, direction)) {
    return {
      result: 'ledgeJump',
      target,
      movementTarget: resolveStepTarget(target.map, target.tile, direction, loadMapById) ?? target
    };
  }

  const pushedBoulder = collision.result === 'objectEvent' && object.strengthActive
    ? tryPushBoulder(map, target, direction, objects, loadMapById)
    : null;
  if (pushedBoulder) {
    return {
      result: 'pushedBoulder',
      target,
      movementTarget: null,
      blockingObject: pushedBoulder
    };
  }

  if (collision.result === 'none') {
    const acroCollision = checkAcroBikeCollision(metatileBehavior);
    if (acroCollision) {
      return { result: acroCollision, target, movementTarget: null };
    }
  }

  return {
    ...collision,
    movementTarget: collision.result === 'none' ? target : null
  };
};

export const checkForPlayerAvatarCollision = ({
  map,
  object,
  direction,
  objects = [],
  loadMapById
}: EvaluateFieldCollisionParams): FieldCollisionEvaluation => {
  const currentBehavior = MapGridGetMetatileBehaviorAt(map, object.currentTile.x, object.currentTile.y);
  const target = resolveStepTarget(map, object.currentTile, direction, loadMapById);

  if (getDirectionalStairWarpBehavior(currentBehavior, direction)) {
    return { result: 'directionalStairWarp', target, movementTarget: null };
  }

  const targetBehavior = target
    ? MapGridGetMetatileBehaviorAt(target.map, target.tile.x, target.tile.y)
    : null;
  return checkForObjectEventCollision(
    map,
    object,
    direction,
    target,
    targetBehavior,
    objects,
    loadMapById
  );
};

export const evaluateFieldCollision = (params: EvaluateFieldCollisionParams): FieldCollisionEvaluation =>
  checkForPlayerAvatarCollision(params);

export const isSurfableMetatileBehavior = (behavior: number | null): boolean =>
  MetatileBehavior_IsSurfable(behavior);
