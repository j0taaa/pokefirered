export const PLAYER_SPEED_STANDING = 0;
export const PLAYER_SPEED_NORMAL = 1;
export const PLAYER_SPEED_FAST = 2;
export const PLAYER_SPEED_FASTER = 3;
export const PLAYER_SPEED_FASTEST = 4;

export const BIKE_TRANS_FACE_DIRECTION = 0;
export const BIKE_TRANS_TURNING = 1;
export const BIKE_TRANS_MOVE = 2;
export const BIKE_TRANS_DOWNHILL = 3;
export const BIKE_TRANS_UPHILL = 4;

export const BIKE_STATE_NORMAL = 0;
export const BIKE_STATE_TURNING = 1;
export const BIKE_STATE_SLOPE = 2;

export const DIR_NONE = 0;
export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;

export const B_BUTTON = 0x0002;
export const MAP_TYPE_INDOOR = 8;
export const MUS_CYCLING = 263;

export const PLAYER_AVATAR_FLAG_ON_FOOT = 1 << 0;
export const PLAYER_AVATAR_FLAG_MACH_BIKE = 1 << 1;
export const PLAYER_AVATAR_FLAG_ACRO_BIKE = 1 << 2;
export const PLAYER_AVATAR_FLAG_SURFING = 1 << 3;
export const PLAYER_AVATAR_FLAG_UNDERWATER = 1 << 4;
export const PLAYER_AVATAR_FLAG_DASH = 1 << 7;

export const NOT_MOVING = 0;
export const TURN_DIRECTION = 1;
export const MOVING = 2;

export const COLLISION_NONE = 0;
export const COLLISION_OUTSIDE_RANGE = 1;
export const COLLISION_IMPASSABLE = 2;
export const COLLISION_ELEVATION_MISMATCH = 3;
export const COLLISION_OBJECT_EVENT = 4;
export const COLLISION_STOP_SURFING = 5;
export const COLLISION_LEDGE_JUMP = 6;
export const COLLISION_PUSHED_BOULDER = 7;
export const COLLISION_DIRECTIONAL_STAIR_WARP = 8;
export const COLLISION_WHEELIE_HOP = 9;
export const COLLISION_ISOLATED_VERTICAL_RAIL = 10;
export const COLLISION_ISOLATED_HORIZONTAL_RAIL = 11;
export const COLLISION_VERTICAL_RAIL = 12;
export const COLLISION_HORIZONTAL_RAIL = 13;
export const COLLISION_COUNT = 14;

export interface BikeObjectEvent {
  currentMetatileBehavior: number;
  movementDirection: number;
  currentCoords: { x: number; y: number };
}

export interface BikePlayerAvatar {
  objectEventId: number;
  acroBikeState: number;
  bikeFrameCounter: number;
  runningState: number;
  newDirBackup: number;
  bikeSpeed: number;
  flags: number;
  directionHistory: number;
  abStartSelectHistory: number;
  lastSpinTile: number;
  dirTimerHistory: number[];
}

export interface BikeRuntime {
  gPlayerAvatar: BikePlayerAvatar;
  gObjectEvents: BikeObjectEvent[];
  gMapHeader: { mapType: number; allowRunning: boolean };
  gBikeCameraAheadPanback: boolean;
  playerMovementDirection: number;
  playerDestCoords: { x: number; y: number };
  playerElevation: number;
  mapBehaviors: Record<string, number>;
  objectCollision: Record<string, number>;
  rockStairDirections: Set<number>;
  musicCanOverrideCycling: boolean;
  savedMusic: number | null;
  actions: Array<{ action: string; direction?: number; flags?: number; music?: number }>;
  metatile: {
    cyclingRoadPullDown: Set<number>;
    crackedIce: Set<number>;
    runningDisallowed: Set<number>;
    fortreeBridge: Set<number>;
    isolatedVerticalRail: Set<number>;
    verticalRail: Set<number>;
    isolatedHorizontalRail: Set<number>;
    horizontalRail: Set<number>;
    bumpySlope: Set<number>;
  };
}

export interface BikeHistoryInputInfo {
  dirHistoryMatch: number;
  abStartSelectHistoryMatch: number;
  dirHistoryMask: number;
  abStartSelectHistoryMask: number;
  dirTimerHistoryList: readonly number[];
  abStartSelectHistoryList: readonly number[];
  direction: number;
}

export const sAcroBikeJumpTimerList = [4, 0] as const;
export const sAcroBikeTricksList: readonly BikeHistoryInputInfo[] = [
  { dirHistoryMatch: DIR_SOUTH, abStartSelectHistoryMatch: B_BUTTON, dirHistoryMask: 0xf, abStartSelectHistoryMask: 0xf, dirTimerHistoryList: sAcroBikeJumpTimerList, abStartSelectHistoryList: sAcroBikeJumpTimerList, direction: DIR_SOUTH },
  { dirHistoryMatch: DIR_NORTH, abStartSelectHistoryMatch: B_BUTTON, dirHistoryMask: 0xf, abStartSelectHistoryMask: 0xf, dirTimerHistoryList: sAcroBikeJumpTimerList, abStartSelectHistoryList: sAcroBikeJumpTimerList, direction: DIR_NORTH },
  { dirHistoryMatch: DIR_WEST, abStartSelectHistoryMatch: B_BUTTON, dirHistoryMask: 0xf, abStartSelectHistoryMask: 0xf, dirTimerHistoryList: sAcroBikeJumpTimerList, abStartSelectHistoryList: sAcroBikeJumpTimerList, direction: DIR_WEST },
  { dirHistoryMatch: DIR_EAST, abStartSelectHistoryMatch: B_BUTTON, dirHistoryMask: 0xf, abStartSelectHistoryMask: 0xf, dirTimerHistoryList: sAcroBikeJumpTimerList, abStartSelectHistoryList: sAcroBikeJumpTimerList, direction: DIR_EAST }
];

export const createBikeRuntime = (): BikeRuntime => ({
  gPlayerAvatar: {
    objectEventId: 0,
    acroBikeState: BIKE_STATE_NORMAL,
    bikeFrameCounter: 0,
    runningState: NOT_MOVING,
    newDirBackup: 0,
    bikeSpeed: PLAYER_SPEED_STANDING,
    flags: PLAYER_AVATAR_FLAG_ON_FOOT,
    directionHistory: 0,
    abStartSelectHistory: 0,
    lastSpinTile: 0,
    dirTimerHistory: [0, 0, 0, 0]
  },
  gObjectEvents: [
    { currentMetatileBehavior: 0, movementDirection: DIR_SOUTH, currentCoords: { x: 5, y: 5 } }
  ],
  gMapHeader: { mapType: 0, allowRunning: true },
  gBikeCameraAheadPanback: false,
  playerMovementDirection: DIR_SOUTH,
  playerDestCoords: { x: 5, y: 5 },
  playerElevation: 1,
  mapBehaviors: {},
  objectCollision: {},
  rockStairDirections: new Set(),
  musicCanOverrideCycling: true,
  savedMusic: null,
  actions: [],
  metatile: {
    cyclingRoadPullDown: new Set(),
    crackedIce: new Set(),
    runningDisallowed: new Set(),
    fortreeBridge: new Set(),
    isolatedVerticalRail: new Set(),
    verticalRail: new Set(),
    isolatedHorizontalRail: new Set(),
    horizontalRail: new Set(),
    bumpySlope: new Set()
  }
});

const joyHeld = (heldKeys: number, button: number): boolean => (heldKeys & button) !== 0;
const playerObj = (runtime: BikeRuntime): BikeObjectEvent => runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
const coordKey = (x: number, y: number): string => `${x},${y}`;

const moveCoords = (direction: number, coords: { x: number; y: number }): void => {
  switch (direction) {
    case DIR_SOUTH: coords.y += 1; break;
    case DIR_NORTH: coords.y -= 1; break;
    case DIR_WEST: coords.x -= 1; break;
    case DIR_EAST: coords.x += 1; break;
  }
};

const mapGridGetMetatileBehaviorAt = (runtime: BikeRuntime, x: number, y: number): number =>
  runtime.mapBehaviors[coordKey(x, y)] ?? 0;

const checkForObjectEventCollision = (
  runtime: BikeRuntime,
  _playerObjEvent: BikeObjectEvent,
  x: number,
  y: number,
  direction: number,
  _metatileBehavior: number
): number => runtime.objectCollision[`${x},${y},${direction}`] ?? COLLISION_NONE;

const metatileBehaviorIsCyclingRoadPullDownTile = (runtime: BikeRuntime, behavior: number): boolean => runtime.metatile.cyclingRoadPullDown.has(behavior);
const metatileBehaviorIsCrackedIce = (runtime: BikeRuntime, behavior: number): boolean => runtime.metatile.crackedIce.has(behavior);
const metatileBehaviorIsRunningDisallowed = (runtime: BikeRuntime, behavior: number): boolean => runtime.metatile.runningDisallowed.has(behavior);
const metatileBehaviorIsFortreeBridge = (runtime: BikeRuntime, behavior: number): boolean => runtime.metatile.fortreeBridge.has(behavior);
const metatileBehaviorIsIsolatedVerticalRail = (runtime: BikeRuntime, behavior: number): boolean => runtime.metatile.isolatedVerticalRail.has(behavior);
const metatileBehaviorIsVerticalRail = (runtime: BikeRuntime, behavior: number): boolean => runtime.metatile.verticalRail.has(behavior);
const metatileBehaviorIsIsolatedHorizontalRail = (runtime: BikeRuntime, behavior: number): boolean => runtime.metatile.isolatedHorizontalRail.has(behavior);
const metatileBehaviorIsHorizontalRail = (runtime: BikeRuntime, behavior: number): boolean => runtime.metatile.horizontalRail.has(behavior);
const metatileBehaviorIsBumpySlope = (runtime: BikeRuntime, behavior: number): boolean => runtime.metatile.bumpySlope.has(behavior);

const getPlayerMovementDirection = (runtime: BikeRuntime): number => runtime.playerMovementDirection;
const playerGetElevation = (runtime: BikeRuntime): number => runtime.playerElevation;
const playerGetDestCoords = (runtime: BikeRuntime): { x: number; y: number } => ({ ...runtime.playerDestCoords });
const testPlayerAvatarFlags = (runtime: BikeRuntime, flags: number): boolean => (runtime.gPlayerAvatar.flags & flags) !== 0;
const playerIsMovingOnRockStairs = (runtime: BikeRuntime, direction: number): boolean => runtime.rockStairDirections.has(direction);

const playerFaceDirection = (runtime: BikeRuntime, direction: number): void => {
  runtime.actions.push({ action: 'PlayerFaceDirection', direction });
  playerObj(runtime).movementDirection = direction;
};
const playerJumpLedge = (runtime: BikeRuntime, direction: number): void => { runtime.actions.push({ action: 'PlayerJumpLedge', direction }); };
const playerOnBikeCollide = (runtime: BikeRuntime, direction: number): void => { runtime.actions.push({ action: 'PlayerOnBikeCollide', direction }); };
const playerWalkFast = (runtime: BikeRuntime, direction: number): void => { runtime.actions.push({ action: 'PlayerWalkFast', direction }); };
const playerRideWaterCurrent = (runtime: BikeRuntime, direction: number): void => { runtime.actions.push({ action: 'PlayerRideWaterCurrent', direction }); };
const playerWalkFaster = (runtime: BikeRuntime, direction: number): void => { runtime.actions.push({ action: 'PlayerWalkFaster', direction }); };
const playerWalkNormal = (runtime: BikeRuntime, direction: number): void => { runtime.actions.push({ action: 'PlayerWalkNormal', direction }); };
const playerUseAcroBikeOnBumpySlope = (runtime: BikeRuntime, direction: number): void => { runtime.actions.push({ action: 'PlayerUseAcroBikeOnBumpySlope', direction }); };

const setPlayerAvatarTransitionFlags = (runtime: BikeRuntime, flags: number): void => {
  runtime.gPlayerAvatar.flags = flags;
  runtime.actions.push({ action: 'SetPlayerAvatarTransitionFlags', flags });
};
const overworldClearSavedMusic = (runtime: BikeRuntime): void => { runtime.savedMusic = null; runtime.actions.push({ action: 'Overworld_ClearSavedMusic' }); };
const overworldPlaySpecialMapMusic = (runtime: BikeRuntime): void => { runtime.actions.push({ action: 'Overworld_PlaySpecialMapMusic' }); };
const overworldMusicCanOverrideMapMusic = (runtime: BikeRuntime, music: number): boolean => {
  runtime.actions.push({ action: 'Overworld_MusicCanOverrideMapMusic', music });
  return runtime.musicCanOverrideCycling;
};
const overworldSetSavedMusic = (runtime: BikeRuntime, music: number): void => { runtime.savedMusic = music; runtime.actions.push({ action: 'Overworld_SetSavedMusic', music }); };
const overworldChangeMusicTo = (runtime: BikeRuntime, music: number): void => { runtime.actions.push({ action: 'Overworld_ChangeMusicTo', music }); };

const bikeTransitions = [
  (runtime: BikeRuntime, direction: number) => bikeTransitionFaceDirection(runtime, direction),
  (runtime: BikeRuntime, direction: number) => bikeTransitionTurnDirection(runtime, direction),
  (runtime: BikeRuntime, direction: number) => bikeTransitionMoveDirection(runtime, direction),
  (runtime: BikeRuntime, direction: number) => bikeTransitionDownhill(runtime, direction),
  (runtime: BikeRuntime, direction: number) => bikeTransitionUphill(runtime, direction)
] as const;

export const movePlayerOnBike = (runtime: BikeRuntime, direction: number, newKeys: number, heldKeys: number): void => {
  const directionRef = { value: direction };
  const transition = getBikeTransitionId(runtime, directionRef, newKeys, heldKeys);
  bikeTransitions[transition](runtime, directionRef.value);
};

export const getBikeTransitionId = (runtime: BikeRuntime, direction: { value: number }, newKeys: number, heldKeys: number): number => {
  switch (runtime.gPlayerAvatar.acroBikeState) {
    case BIKE_STATE_TURNING:
      return bikeInputHandlerTurning(runtime, direction, newKeys, heldKeys);
    case BIKE_STATE_SLOPE:
      return bikeInputHandlerSlope(runtime, direction, newKeys, heldKeys);
    default:
      return bikeInputHandlerNormal(runtime, direction, newKeys, heldKeys);
  }
};

export const bikeInputHandlerNormal = (runtime: BikeRuntime, directionRef: { value: number }, _newKeys: number, heldKeys: number): number => {
  const objectEvent = playerObj(runtime);
  const direction = getPlayerMovementDirection(runtime);

  runtime.gPlayerAvatar.bikeFrameCounter = 0;
  if (metatileBehaviorIsCyclingRoadPullDownTile(runtime, objectEvent.currentMetatileBehavior)) {
    if (!joyHeld(heldKeys, B_BUTTON)) {
      runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_SLOPE;
      runtime.gPlayerAvatar.runningState = MOVING;
      if (directionRef.value < DIR_NORTH) return BIKE_TRANS_DOWNHILL;
      return BIKE_TRANS_UPHILL;
    }
    if (directionRef.value !== DIR_NONE) {
      runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_SLOPE;
      runtime.gPlayerAvatar.runningState = MOVING;
      return BIKE_TRANS_UPHILL;
    }
  }
  if (directionRef.value === DIR_NONE) {
    directionRef.value = direction;
    runtime.gPlayerAvatar.runningState = NOT_MOVING;
    return BIKE_TRANS_FACE_DIRECTION;
  }
  if (directionRef.value !== direction && runtime.gPlayerAvatar.runningState !== MOVING) {
    runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_TURNING;
    runtime.gPlayerAvatar.newDirBackup = directionRef.value;
    runtime.gPlayerAvatar.runningState = NOT_MOVING;
    return getBikeTransitionId(runtime, directionRef, _newKeys, heldKeys);
  }
  runtime.gPlayerAvatar.runningState = MOVING;
  return BIKE_TRANS_MOVE;
};

export const bikeInputHandlerTurning = (runtime: BikeRuntime, directionRef: { value: number }, _newKeys: number, _heldKeys: number): number => {
  directionRef.value = runtime.gPlayerAvatar.newDirBackup;
  runtime.gPlayerAvatar.runningState = TURN_DIRECTION;
  runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_NORMAL;
  bikeSetBikeStill(runtime);
  return BIKE_TRANS_TURNING;
};

export const bikeInputHandlerSlope = (runtime: BikeRuntime, directionRef: { value: number }, newKeys: number, heldKeys: number): number => {
  const direction = getPlayerMovementDirection(runtime);
  const objectEvent = playerObj(runtime);
  if (metatileBehaviorIsCyclingRoadPullDownTile(runtime, objectEvent.currentMetatileBehavior)) {
    if (directionRef.value !== direction) {
      runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_TURNING;
      runtime.gPlayerAvatar.newDirBackup = directionRef.value;
      runtime.gPlayerAvatar.runningState = NOT_MOVING;
      return getBikeTransitionId(runtime, directionRef, newKeys, heldKeys);
    }
    runtime.gPlayerAvatar.runningState = MOVING;
    runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_SLOPE;
    if (directionRef.value < DIR_NORTH) return BIKE_TRANS_DOWNHILL;
    return BIKE_TRANS_UPHILL;
  }
  runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_NORMAL;
  if (directionRef.value === DIR_NONE) {
    directionRef.value = direction;
    runtime.gPlayerAvatar.runningState = NOT_MOVING;
    return BIKE_TRANS_FACE_DIRECTION;
  }
  runtime.gPlayerAvatar.runningState = MOVING;
  return BIKE_TRANS_MOVE;
};

export const bikeTransitionFaceDirection = (runtime: BikeRuntime, direction: number): void => {
  playerFaceDirection(runtime, direction);
};

export const bikeTransitionTurnDirection = (runtime: BikeRuntime, direction: number): void => {
  const objectEvent = playerObj(runtime);
  let finalDirection = direction;
  if (!canBikeFaceDirectionOnRail(runtime, direction, objectEvent.currentMetatileBehavior)) {
    finalDirection = objectEvent.movementDirection;
  }
  playerFaceDirection(runtime, finalDirection);
};

export const bikeTransitionMoveDirection = (runtime: BikeRuntime, direction: number): void => {
  const objectEvent = playerObj(runtime);
  if (!canBikeFaceDirectionOnRail(runtime, direction, objectEvent.currentMetatileBehavior)) {
    bikeTransitionFaceDirection(runtime, objectEvent.movementDirection);
  } else {
    const collision = getBikeCollision(runtime, direction);
    if (collision > COLLISION_NONE && collision <= COLLISION_ISOLATED_HORIZONTAL_RAIL) {
      if (collision === COLLISION_LEDGE_JUMP) {
        playerJumpLedge(runtime, direction);
      } else if (collision !== COLLISION_STOP_SURFING
        && collision !== COLLISION_LEDGE_JUMP
        && collision !== COLLISION_PUSHED_BOULDER
        && collision !== COLLISION_DIRECTIONAL_STAIR_WARP) {
        playerOnBikeCollide(runtime, direction);
      }
    } else if (collision === COLLISION_COUNT) {
      playerWalkFast(runtime, direction);
    } else if (playerIsMovingOnRockStairs(runtime, direction)) {
      playerWalkFast(runtime, direction);
    } else {
      playerRideWaterCurrent(runtime, direction);
    }
  }
};

export const bikeTransitionDownhill = (runtime: BikeRuntime, _v: number): void => {
  const collision = getBikeCollision(runtime, DIR_SOUTH);
  if (collision === COLLISION_NONE) {
    playerWalkFaster(runtime, DIR_SOUTH);
  } else if (collision === COLLISION_LEDGE_JUMP) {
    playerJumpLedge(runtime, DIR_SOUTH);
  }
};

export const bikeTransitionUphill = (runtime: BikeRuntime, direction: number): void => {
  if (getBikeCollision(runtime, direction) === COLLISION_NONE) {
    playerWalkNormal(runtime, direction);
  }
};

export const getBikeCollision = (runtime: BikeRuntime, direction: number): number => {
  const objectEvent = playerObj(runtime);
  const coords = { x: objectEvent.currentCoords.x, y: objectEvent.currentCoords.y };
  moveCoords(direction, coords);
  const behavior = mapGridGetMetatileBehaviorAt(runtime, coords.x, coords.y);
  return getBikeCollisionAt(runtime, objectEvent, coords.x, coords.y, direction, behavior);
};

export const getBikeCollisionAt = (runtime: BikeRuntime, objectEvent: BikeObjectEvent, x: number, y: number, direction: number, behavior: number): number => {
  let retVal = checkForObjectEventCollision(runtime, objectEvent, x, y, direction, behavior);
  if (retVal <= COLLISION_OBJECT_EVENT) {
    if (metatileBehaviorIsCrackedIce(runtime, behavior)) return COLLISION_COUNT;
    if (retVal === COLLISION_NONE && metatileBehaviorForbidsBiking(runtime, behavior)) {
      retVal = COLLISION_IMPASSABLE;
    }
  }
  return retVal;
};

export const rsIsRunningDisallowed = (runtime: BikeRuntime, behavior: number): boolean => {
  if (metatileBehaviorForbidsBiking(runtime, behavior)) return true;
  if (runtime.gMapHeader.mapType !== MAP_TYPE_INDOOR) return false;
  return true;
};

export const isRunningDisallowed = (runtime: BikeRuntime, behavior: number): boolean => {
  if (!runtime.gMapHeader.allowRunning) return true;
  if (metatileBehaviorForbidsBiking(runtime, behavior) !== true) return false;
  return true;
};

export const metatileBehaviorForbidsBiking = (runtime: BikeRuntime, behavior: number): boolean => {
  if (metatileBehaviorIsRunningDisallowed(runtime, behavior)) return true;
  if (!metatileBehaviorIsFortreeBridge(runtime, behavior)) return false;
  if (playerGetElevation(runtime) & 1) return false;
  return true;
};

export const canBikeFaceDirectionOnRail = (runtime: BikeRuntime, direction: number, behavior: number): boolean => {
  if (direction === DIR_EAST || direction === DIR_WEST) {
    if (metatileBehaviorIsIsolatedVerticalRail(runtime, behavior) || metatileBehaviorIsVerticalRail(runtime, behavior)) return false;
  } else if (metatileBehaviorIsIsolatedHorizontalRail(runtime, behavior) || metatileBehaviorIsHorizontalRail(runtime, behavior)) {
    return false;
  }
  return true;
};

export const isBikingDisallowedByPlayer = (runtime: BikeRuntime): boolean => {
  if ((runtime.gPlayerAvatar.flags & (PLAYER_AVATAR_FLAG_UNDERWATER | PLAYER_AVATAR_FLAG_SURFING)) === 0) {
    const coords = playerGetDestCoords(runtime);
    const behavior = mapGridGetMetatileBehaviorAt(runtime, coords.x, coords.y);
    if (!metatileBehaviorForbidsBiking(runtime, behavior)) return false;
  }
  return true;
};

export const isPlayerNotUsingAcroBikeOnBumpySlope = (runtime: BikeRuntime): boolean => {
  if (testPlayerAvatarFlags(runtime, PLAYER_AVATAR_FLAG_ACRO_BIKE)) {
    if (metatileBehaviorIsBumpySlope(runtime, playerObj(runtime).currentMetatileBehavior)) return false;
  }
  return true;
};

export const getOnOffBike = (runtime: BikeRuntime, flags: number): void => {
  runtime.gBikeCameraAheadPanback = false;
  if (runtime.gPlayerAvatar.flags & (PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE)) {
    setPlayerAvatarTransitionFlags(runtime, PLAYER_AVATAR_FLAG_ON_FOOT);
    overworldClearSavedMusic(runtime);
    overworldPlaySpecialMapMusic(runtime);
  } else {
    setPlayerAvatarTransitionFlags(runtime, flags);
    if (overworldMusicCanOverrideMapMusic(runtime, MUS_CYCLING)) {
      overworldSetSavedMusic(runtime, MUS_CYCLING);
      overworldChangeMusicTo(runtime, MUS_CYCLING);
    }
  }
};

export const bikeClearState = (runtime: BikeRuntime, directionHistory: number, abStartSelectHistory: number): void => {
  runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_NORMAL;
  runtime.gPlayerAvatar.newDirBackup = 0;
  runtime.gPlayerAvatar.bikeFrameCounter = 0;
  runtime.gPlayerAvatar.bikeSpeed = PLAYER_SPEED_STANDING;
  runtime.gPlayerAvatar.directionHistory = directionHistory;
  runtime.gPlayerAvatar.abStartSelectHistory = abStartSelectHistory;
  runtime.gPlayerAvatar.lastSpinTile = 0;
  for (let i = 0; i < runtime.gPlayerAvatar.dirTimerHistory.length; i += 1) {
    runtime.gPlayerAvatar.dirTimerHistory[i] = 0;
  }
};

export const bikeUpdateBikeCounterSpeed = (runtime: BikeRuntime, counter: number): void => {
  runtime.gPlayerAvatar.bikeFrameCounter = counter;
  runtime.gPlayerAvatar.bikeSpeed = counter + (runtime.gPlayerAvatar.bikeFrameCounter >> 1);
};

export const bikeSetBikeStill = (runtime: BikeRuntime): void => {
  runtime.gPlayerAvatar.bikeFrameCounter = 0;
  runtime.gPlayerAvatar.bikeSpeed = PLAYER_SPEED_STANDING;
};

export const getPlayerSpeed = (runtime: BikeRuntime): number => {
  const machBikeSpeeds = [PLAYER_SPEED_NORMAL, PLAYER_SPEED_FAST, PLAYER_SPEED_FASTEST];
  if (runtime.gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_MACH_BIKE) {
    return machBikeSpeeds[runtime.gPlayerAvatar.bikeFrameCounter];
  }
  if (runtime.gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_ACRO_BIKE) return PLAYER_SPEED_FASTER;
  if (runtime.gPlayerAvatar.flags & (PLAYER_AVATAR_FLAG_SURFING | PLAYER_AVATAR_FLAG_DASH)) return PLAYER_SPEED_FAST;
  return PLAYER_SPEED_NORMAL;
};

export const bikeHandleBumpySlopeJump = (runtime: BikeRuntime): void => {
  if (runtime.gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_ACRO_BIKE) {
    const coords = playerGetDestCoords(runtime);
    const behavior = mapGridGetMetatileBehaviorAt(runtime, coords.x, coords.y);
    if (metatileBehaviorIsBumpySlope(runtime, behavior)) {
      runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_SLOPE;
      playerUseAcroBikeOnBumpySlope(runtime, getPlayerMovementDirection(runtime));
    }
  }
};

export const MovePlayerOnBike = movePlayerOnBike;
export const GetBikeTransitionId = getBikeTransitionId;
export const BikeInputHandler_Normal = bikeInputHandlerNormal;
export const BikeInputHandler_Turning = bikeInputHandlerTurning;
export const BikeInputHandler_Slope = bikeInputHandlerSlope;
export const BikeTransition_FaceDirection = bikeTransitionFaceDirection;
export const BikeTransition_TurnDirection = bikeTransitionTurnDirection;
export const BikeTransition_MoveDirection = bikeTransitionMoveDirection;
export const BikeTransition_Downhill = bikeTransitionDownhill;
export const BikeTransition_Uphill = bikeTransitionUphill;
export const GetBikeCollision = getBikeCollision;
export const GetBikeCollisionAt = getBikeCollisionAt;
export const RS_IsRunningDisallowed = rsIsRunningDisallowed;
export const IsRunningDisallowed = isRunningDisallowed;
export const MetatileBehaviorForbidsBiking = metatileBehaviorForbidsBiking;
export const CanBikeFaceDirectionOnRail = canBikeFaceDirectionOnRail;
export const IsBikingDisallowedByPlayer = isBikingDisallowedByPlayer;
export const IsPlayerNotUsingAcroBikeOnBumpySlope =
  isPlayerNotUsingAcroBikeOnBumpySlope;
export const GetOnOffBike = getOnOffBike;
export const BikeClearState = bikeClearState;
export const Bike_UpdateBikeCounterSpeed = bikeUpdateBikeCounterSpeed;
export const Bike_SetBikeStill = bikeSetBikeStill;
export const GetPlayerSpeed = getPlayerSpeed;
export const Bike_HandleBumpySlopeJump = bikeHandleBumpySlopeJump;
