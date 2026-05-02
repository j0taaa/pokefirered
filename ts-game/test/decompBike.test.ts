import { describe, expect, test } from 'vitest';
import {
  B_BUTTON,
  BIKE_STATE_NORMAL,
  BIKE_STATE_SLOPE,
  BIKE_STATE_TURNING,
  BIKE_TRANS_DOWNHILL,
  BIKE_TRANS_FACE_DIRECTION,
  BIKE_TRANS_MOVE,
  BIKE_TRANS_TURNING,
  BIKE_TRANS_UPHILL,
  BikeClearState,
  BikeInputHandler_Normal,
  BikeInputHandler_Slope,
  BikeInputHandler_Turning,
  BikeTransition_Downhill,
  BikeTransition_FaceDirection,
  BikeTransition_MoveDirection,
  BikeTransition_TurnDirection,
  BikeTransition_Uphill,
  Bike_HandleBumpySlopeJump,
  Bike_SetBikeStill,
  Bike_UpdateBikeCounterSpeed,
  CanBikeFaceDirectionOnRail,
  COLLISION_COUNT,
  COLLISION_IMPASSABLE,
  COLLISION_ISOLATED_HORIZONTAL_RAIL,
  COLLISION_LEDGE_JUMP,
  COLLISION_NONE,
  COLLISION_OBJECT_EVENT,
  DIR_EAST,
  DIR_NONE,
  DIR_NORTH,
  DIR_SOUTH,
  DIR_WEST,
  GetBikeCollision,
  GetBikeCollisionAt,
  GetBikeTransitionId,
  GetOnOffBike,
  GetPlayerSpeed,
  IsBikingDisallowedByPlayer,
  IsPlayerNotUsingAcroBikeOnBumpySlope,
  IsRunningDisallowed,
  MAP_TYPE_INDOOR,
  MetatileBehaviorForbidsBiking,
  MOVING,
  MUS_CYCLING,
  NOT_MOVING,
  PLAYER_AVATAR_FLAG_ACRO_BIKE,
  PLAYER_AVATAR_FLAG_DASH,
  PLAYER_AVATAR_FLAG_MACH_BIKE,
  PLAYER_AVATAR_FLAG_ON_FOOT,
  PLAYER_AVATAR_FLAG_SURFING,
  PLAYER_SPEED_FAST,
  PLAYER_SPEED_FASTER,
  PLAYER_SPEED_FASTEST,
  PLAYER_SPEED_NORMAL,
  PLAYER_SPEED_STANDING,
  MovePlayerOnBike,
  RS_IsRunningDisallowed,
  TURN_DIRECTION,
  bikeClearState,
  bikeSetBikeStill,
  bikeTransitionFaceDirection,
  getBikeCollision,
  bikeHandleBumpySlopeJump,
  bikeInputHandlerNormal,
  bikeInputHandlerSlope,
  bikeInputHandlerTurning,
  bikeTransitionDownhill,
  bikeTransitionMoveDirection,
  bikeTransitionTurnDirection,
  bikeTransitionUphill,
  bikeUpdateBikeCounterSpeed,
  canBikeFaceDirectionOnRail,
  createBikeRuntime,
  getBikeCollisionAt,
  getBikeTransitionId,
  getOnOffBike,
  getPlayerSpeed,
  isBikingDisallowedByPlayer,
  isPlayerNotUsingAcroBikeOnBumpySlope,
  isRunningDisallowed,
  metatileBehaviorForbidsBiking,
  movePlayerOnBike,
  rsIsRunningDisallowed,
  sAcroBikeJumpTimerList,
  sAcroBikeTricksList
} from '../src/game/decompBike';

describe('decomp bike', () => {
  test('exports exact C function names for bike helpers and transitions', () => {
    expect(MovePlayerOnBike).toBe(movePlayerOnBike);
    expect(GetBikeTransitionId).toBe(getBikeTransitionId);
    expect(BikeInputHandler_Normal).toBe(bikeInputHandlerNormal);
    expect(BikeInputHandler_Turning).toBe(bikeInputHandlerTurning);
    expect(BikeInputHandler_Slope).toBe(bikeInputHandlerSlope);
    expect(BikeTransition_FaceDirection).toBe(bikeTransitionFaceDirection);
    expect(BikeTransition_TurnDirection).toBe(bikeTransitionTurnDirection);
    expect(BikeTransition_MoveDirection).toBe(bikeTransitionMoveDirection);
    expect(BikeTransition_Downhill).toBe(bikeTransitionDownhill);
    expect(BikeTransition_Uphill).toBe(bikeTransitionUphill);
    expect(GetBikeCollision).toBe(getBikeCollision);
    expect(GetBikeCollisionAt).toBe(getBikeCollisionAt);
    expect(RS_IsRunningDisallowed).toBe(rsIsRunningDisallowed);
    expect(IsRunningDisallowed).toBe(isRunningDisallowed);
    expect(MetatileBehaviorForbidsBiking).toBe(metatileBehaviorForbidsBiking);
    expect(CanBikeFaceDirectionOnRail).toBe(canBikeFaceDirectionOnRail);
    expect(IsBikingDisallowedByPlayer).toBe(isBikingDisallowedByPlayer);
    expect(IsPlayerNotUsingAcroBikeOnBumpySlope).toBe(
      isPlayerNotUsingAcroBikeOnBumpySlope
    );
    expect(GetOnOffBike).toBe(getOnOffBike);
    expect(BikeClearState).toBe(bikeClearState);
    expect(Bike_UpdateBikeCounterSpeed).toBe(bikeUpdateBikeCounterSpeed);
    expect(Bike_SetBikeStill).toBe(bikeSetBikeStill);
    expect(GetPlayerSpeed).toBe(getPlayerSpeed);
    expect(Bike_HandleBumpySlopeJump).toBe(bikeHandleBumpySlopeJump);
  });

  test('normal input handler matches slope, face, turn, and move branches', () => {
    const runtime = createBikeRuntime();
    runtime.gObjectEvents[0].currentMetatileBehavior = 7;
    runtime.metatile.cyclingRoadPullDown.add(7);
    let direction = { value: DIR_NONE };
    expect(bikeInputHandlerNormal(runtime, direction, 0, 0)).toBe(BIKE_TRANS_DOWNHILL);
    expect(runtime.gPlayerAvatar).toMatchObject({ acroBikeState: BIKE_STATE_SLOPE, runningState: MOVING });

    runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_NORMAL;
    direction = { value: DIR_NORTH };
    expect(bikeInputHandlerNormal(runtime, direction, 0, B_BUTTON)).toBe(BIKE_TRANS_UPHILL);

    runtime.gObjectEvents[0].currentMetatileBehavior = 0;
    runtime.playerMovementDirection = DIR_WEST;
    direction = { value: DIR_NONE };
    expect(bikeInputHandlerNormal(runtime, direction, 0, 0)).toBe(BIKE_TRANS_FACE_DIRECTION);
    expect(direction.value).toBe(DIR_WEST);
    expect(runtime.gPlayerAvatar.runningState).toBe(NOT_MOVING);

    direction = { value: DIR_EAST };
    runtime.gPlayerAvatar.runningState = NOT_MOVING;
    expect(bikeInputHandlerNormal(runtime, direction, 0, 0)).toBe(BIKE_TRANS_TURNING);
    expect(direction.value).toBe(DIR_EAST);
    expect(runtime.gPlayerAvatar.acroBikeState).toBe(BIKE_STATE_NORMAL);
    expect(runtime.gPlayerAvatar.runningState).toBe(TURN_DIRECTION);

    runtime.gPlayerAvatar.runningState = MOVING;
    direction = { value: DIR_EAST };
    expect(bikeInputHandlerNormal(runtime, direction, 0, 0)).toBe(BIKE_TRANS_MOVE);
  });

  test('turning and slope handlers recurse through the same C transition logic', () => {
    const runtime = createBikeRuntime();
    runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_TURNING;
    runtime.gPlayerAvatar.newDirBackup = DIR_NORTH;
    runtime.gPlayerAvatar.bikeFrameCounter = 2;
    runtime.gPlayerAvatar.bikeSpeed = PLAYER_SPEED_FASTEST;
    const turningDirection = { value: DIR_SOUTH };
    expect(bikeInputHandlerTurning(runtime, turningDirection, 0, 0)).toBe(BIKE_TRANS_TURNING);
    expect(turningDirection.value).toBe(DIR_NORTH);
    expect(runtime.gPlayerAvatar.bikeSpeed).toBe(PLAYER_SPEED_STANDING);

    runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_SLOPE;
    runtime.gObjectEvents[0].currentMetatileBehavior = 3;
    runtime.metatile.cyclingRoadPullDown.add(3);
    runtime.playerMovementDirection = DIR_SOUTH;
    const slopeDirection = { value: DIR_NORTH };
    expect(bikeInputHandlerSlope(runtime, slopeDirection, 0, 0)).toBe(BIKE_TRANS_TURNING);
    expect(slopeDirection.value).toBe(DIR_NORTH);

    runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_SLOPE;
    runtime.playerMovementDirection = DIR_SOUTH;
    expect(bikeInputHandlerSlope(runtime, { value: DIR_SOUTH }, 0, 0)).toBe(BIKE_TRANS_DOWNHILL);

    runtime.gObjectEvents[0].currentMetatileBehavior = 0;
    expect(bikeInputHandlerSlope(runtime, { value: DIR_EAST }, 0, 0)).toBe(BIKE_TRANS_MOVE);
  });

  test('MovePlayerOnBike dispatches transition table output into player actions', () => {
    const runtime = createBikeRuntime();
    runtime.playerMovementDirection = DIR_EAST;
    movePlayerOnBike(runtime, DIR_NONE, 0, 0);
    expect(runtime.actions).toEqual([{ action: 'PlayerFaceDirection', direction: DIR_EAST }]);

    const direction = { value: DIR_NONE };
    expect(getBikeTransitionId(runtime, direction, 0, 0)).toBe(BIKE_TRANS_FACE_DIRECTION);
    expect(direction.value).toBe(DIR_EAST);
  });

  test('rail facing and movement transitions preserve collision branches', () => {
    const runtime = createBikeRuntime();
    runtime.gObjectEvents[0].currentMetatileBehavior = 12;
    runtime.gObjectEvents[0].movementDirection = DIR_SOUTH;
    runtime.metatile.verticalRail.add(12);

    expect(canBikeFaceDirectionOnRail(runtime, DIR_EAST, 12)).toBe(false);
    bikeTransitionTurnDirection(runtime, DIR_EAST);
    expect(runtime.actions.at(-1)).toEqual({ action: 'PlayerFaceDirection', direction: DIR_SOUTH });

    runtime.gObjectEvents[0].currentMetatileBehavior = 0;
    runtime.gObjectEvents[0].currentCoords = { x: 5, y: 5 };
    runtime.objectCollision['6,5,4'] = COLLISION_LEDGE_JUMP;
    bikeTransitionMoveDirection(runtime, DIR_EAST);
    expect(runtime.actions.at(-1)).toEqual({ action: 'PlayerJumpLedge', direction: DIR_EAST });

    runtime.objectCollision['6,5,4'] = COLLISION_ISOLATED_HORIZONTAL_RAIL;
    bikeTransitionMoveDirection(runtime, DIR_EAST);
    expect(runtime.actions.at(-1)).toEqual({ action: 'PlayerOnBikeCollide', direction: DIR_EAST });

    runtime.objectCollision['6,5,4'] = COLLISION_COUNT;
    bikeTransitionMoveDirection(runtime, DIR_EAST);
    expect(runtime.actions.at(-1)).toEqual({ action: 'PlayerWalkFast', direction: DIR_EAST });

    runtime.objectCollision['6,5,4'] = COLLISION_NONE;
    runtime.rockStairDirections.add(DIR_EAST);
    bikeTransitionMoveDirection(runtime, DIR_EAST);
    expect(runtime.actions.at(-1)).toEqual({ action: 'PlayerWalkFast', direction: DIR_EAST });
  });

  test('downhill, uphill, and collision helper mirror C collision handling', () => {
    const runtime = createBikeRuntime();
    runtime.gObjectEvents[0].currentCoords = { x: 5, y: 5 };
    bikeTransitionDownhill(runtime, 99);
    expect(runtime.actions.at(-1)).toEqual({ action: 'PlayerWalkFaster', direction: DIR_SOUTH });

    runtime.objectCollision['5,6,1'] = COLLISION_LEDGE_JUMP;
    bikeTransitionDownhill(runtime, 99);
    expect(runtime.actions.at(-1)).toEqual({ action: 'PlayerJumpLedge', direction: DIR_SOUTH });

    runtime.objectCollision['5,4,2'] = COLLISION_NONE;
    bikeTransitionUphill(runtime, DIR_NORTH);
    expect(runtime.actions.at(-1)).toEqual({ action: 'PlayerWalkNormal', direction: DIR_NORTH });

    runtime.metatile.crackedIce.add(21);
    expect(getBikeCollisionAt(runtime, runtime.gObjectEvents[0], 1, 1, DIR_SOUTH, 21)).toBe(COLLISION_COUNT);
    runtime.metatile.runningDisallowed.add(22);
    expect(getBikeCollisionAt(runtime, runtime.gObjectEvents[0], 1, 1, DIR_SOUTH, 22)).toBe(COLLISION_IMPASSABLE);
    runtime.objectCollision['1,1,1'] = COLLISION_OBJECT_EVENT;
    expect(getBikeCollisionAt(runtime, runtime.gObjectEvents[0], 1, 1, DIR_SOUTH, 22)).toBe(COLLISION_OBJECT_EVENT);
  });

  test('running and biking disallow helpers handle indoor, allowRunning, bridge elevation, surf, and underwater flags', () => {
    const runtime = createBikeRuntime();
    runtime.metatile.runningDisallowed.add(30);
    expect(rsIsRunningDisallowed(runtime, 30)).toBe(true);
    runtime.gMapHeader.mapType = MAP_TYPE_INDOOR;
    expect(rsIsRunningDisallowed(runtime, 0)).toBe(true);
    runtime.gMapHeader.mapType = 0;
    expect(rsIsRunningDisallowed(runtime, 0)).toBe(false);

    runtime.gMapHeader.allowRunning = false;
    expect(isRunningDisallowed(runtime, 0)).toBe(true);
    runtime.gMapHeader.allowRunning = true;
    expect(isRunningDisallowed(runtime, 30)).toBe(true);

    runtime.metatile.fortreeBridge.add(40);
    runtime.playerElevation = 1;
    expect(metatileBehaviorForbidsBiking(runtime, 40)).toBe(false);
    runtime.playerElevation = 0;
    expect(metatileBehaviorForbidsBiking(runtime, 40)).toBe(true);

    runtime.playerDestCoords = { x: 2, y: 2 };
    runtime.mapBehaviors['2,2'] = 0;
    expect(isBikingDisallowedByPlayer(runtime)).toBe(false);
    runtime.gPlayerAvatar.flags = PLAYER_AVATAR_FLAG_SURFING;
    expect(isBikingDisallowedByPlayer(runtime)).toBe(true);
  });

  test('GetOnOffBike toggles avatar flags and music side effects exactly', () => {
    const runtime = createBikeRuntime();
    getOnOffBike(runtime, PLAYER_AVATAR_FLAG_MACH_BIKE);
    expect(runtime.gPlayerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_MACH_BIKE);
    expect(runtime.savedMusic).toBe(MUS_CYCLING);
    expect(runtime.actions.map((entry) => entry.action)).toEqual([
      'SetPlayerAvatarTransitionFlags',
      'Overworld_MusicCanOverrideMapMusic',
      'Overworld_SetSavedMusic',
      'Overworld_ChangeMusicTo'
    ]);

    runtime.actions = [];
    getOnOffBike(runtime, PLAYER_AVATAR_FLAG_MACH_BIKE);
    expect(runtime.gPlayerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_ON_FOOT);
    expect(runtime.actions.map((entry) => entry.action)).toEqual([
      'SetPlayerAvatarTransitionFlags',
      'Overworld_ClearSavedMusic',
      'Overworld_PlaySpecialMapMusic'
    ]);
  });

  test('bike state, speed, bumpy slope, and leftover acro trick data preserve source behavior', () => {
    const runtime = createBikeRuntime();
    runtime.gPlayerAvatar.acroBikeState = BIKE_STATE_SLOPE;
    runtime.gPlayerAvatar.newDirBackup = DIR_WEST;
    runtime.gPlayerAvatar.bikeFrameCounter = 2;
    runtime.gPlayerAvatar.bikeSpeed = PLAYER_SPEED_FASTEST;
    runtime.gPlayerAvatar.lastSpinTile = 99;
    runtime.gPlayerAvatar.dirTimerHistory = [1, 2, 3, 4];
    bikeClearState(runtime, 0x1234, 0x5678);
    expect(runtime.gPlayerAvatar).toMatchObject({
      acroBikeState: BIKE_STATE_NORMAL,
      newDirBackup: 0,
      bikeFrameCounter: 0,
      bikeSpeed: PLAYER_SPEED_STANDING,
      directionHistory: 0x1234,
      abStartSelectHistory: 0x5678,
      lastSpinTile: 0
    });
    expect(runtime.gPlayerAvatar.dirTimerHistory).toEqual([0, 0, 0, 0]);

    bikeUpdateBikeCounterSpeed(runtime, 2);
    expect(runtime.gPlayerAvatar.bikeSpeed).toBe(3);
    runtime.gPlayerAvatar.flags = PLAYER_AVATAR_FLAG_MACH_BIKE;
    expect(getPlayerSpeed(runtime)).toBe(PLAYER_SPEED_FASTEST);
    runtime.gPlayerAvatar.flags = PLAYER_AVATAR_FLAG_ACRO_BIKE;
    expect(getPlayerSpeed(runtime)).toBe(PLAYER_SPEED_FASTER);
    runtime.gPlayerAvatar.flags = PLAYER_AVATAR_FLAG_DASH;
    expect(getPlayerSpeed(runtime)).toBe(PLAYER_SPEED_FAST);
    runtime.gPlayerAvatar.flags = PLAYER_AVATAR_FLAG_ON_FOOT;
    expect(getPlayerSpeed(runtime)).toBe(PLAYER_SPEED_NORMAL);

    runtime.gPlayerAvatar.flags = PLAYER_AVATAR_FLAG_ACRO_BIKE;
    runtime.gObjectEvents[0].currentMetatileBehavior = 77;
    runtime.metatile.bumpySlope.add(77);
    expect(isPlayerNotUsingAcroBikeOnBumpySlope(runtime)).toBe(false);
    runtime.playerDestCoords = { x: 4, y: 4 };
    runtime.mapBehaviors['4,4'] = 77;
    runtime.playerMovementDirection = DIR_NORTH;
    bikeHandleBumpySlopeJump(runtime);
    expect(runtime.gPlayerAvatar.acroBikeState).toBe(BIKE_STATE_SLOPE);
    expect(runtime.actions.at(-1)).toEqual({ action: 'PlayerUseAcroBikeOnBumpySlope', direction: DIR_NORTH });

    expect(sAcroBikeJumpTimerList).toEqual([4, 0]);
    expect(sAcroBikeTricksList.map((entry) => entry.direction)).toEqual([DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST]);
    expect(sAcroBikeTricksList.every((entry) => entry.dirHistoryMask === 0xf && entry.abStartSelectHistoryMatch === B_BUTTON)).toBe(true);
  });
});
