import { describe, expect, it } from 'vitest';
import {
  ANIM_FIELD_MOVE,
  ANIM_HOOKED_POKEMON_EAST,
  ANIM_PUT_AWAY_ROD_SOUTH,
  ANIM_VS_SEEKER,
  A_BUTTON,
  B_BUTTON,
  BOB_MON_ONLY,
  CancelPlayerForcedMovement,
  COLLISION_DIRECTIONAL_STAIR_WARP,
  COLLISION_ELEVATION_MISMATCH,
  COLLISION_LEDGE_JUMP,
  COLLISION_NONE,
  COLLISION_OBJECT_EVENT,
  COLLISION_PUSHED_BOULDER,
  COLLISION_STOP_SURFING,
  ClearPlayerAvatarInfo,
  DIR_EAST,
  DIR_NONE,
  DIR_NORTH,
  DIR_SOUTH,
  DIR_WEST,
  DoPlayerAvatarTransition,
  DoForcedMovement,
  DoPlayerMatJump,
  DoPlayerMatSpin,
  FEMALE,
  FISHING_GOT_BITE,
  FISHING_GOT_AWAY,
  FISHING_NO_BITE,
  FISHING_ON_HOOK,
  FISHING_SHOW_RESULT,
  FISHING_START_ROUND,
  Fishing1,
  Fishing10,
  Fishing11,
  Fishing12,
  Fishing13,
  Fishing14,
  Fishing15,
  Fishing16,
  Fishing2,
  Fishing3,
  Fishing5,
  Fishing6,
  Fishing7,
  Fishing8,
  Fishing9,
  GetPlayerAvatarFlags,
  GetPlayerAvatarGenderByGraphicsId,
  GetPlayerAvatarGraphicsIdByCurrentState,
  GetPlayerAvatarGraphicsIdByStateId,
  GetPlayerAvatarGraphicsIdByStateIdAndGender,
  GetPlayerAvatarObjectId,
  GetPlayerAvatarStateTransitionByGraphicsId,
  GetPlayerAvatarVsSeekerGfxId,
  GetFaceDirectionMovementAction,
  GetPlayerFacingDirection,
  GetPlayerMovementDirection,
  GetPlayerRunMovementAction,
  GetRSAvatarGraphicsIdByGender,
  GetRivalAvatarGraphicsIdByStateIdAndGender,
  GetAcroWheelieFaceDirectionMovementAction,
  GetAcroWheelieMoveMovementAction,
  GetJumpInPlaceTurnAroundMovementAction,
  GetJumpInPlaceMovementAction,
  GetJumpSpecialWithEffectMovementAction,
  GetOppositeDirection,
  GetWalkFastMovementAction,
  GetWalkInPlaceNormalMovementAction,
  GetWalkInPlaceSlowMovementAction,
  GetWalkNormalMovementAction,
  GetWalkSlowerMovementAction,
  GetWalkInPlaceFastMovementAction,
  GetXYCoordsOneStepInFrontOfPlayer,
  HandleEnforcedLookDirectionOnPlayerStopMoving,
  InitPlayerAvatar,
  IsPlayerNotUsingAcroBikeOnBumpySlope,
  IsPlayerSurfingNorth,
  MALE,
  MOVE_SURF,
  MOVEMENT_ACTION_PLAYER_RUN_LEFT,
  MOVEMENT_ACTION_PLAYER_RUN_RIGHT,
  MOVEMENT_ACTION_PLAYER_RUN_UP,
  MOVEMENT_ACTION_PLAYER_RUN_UP_SLOW,
  MOVEMENT_ACTION_SHAKE_HEAD_OR_WALK_IN_PLACE,
  MOVEMENT_ACTION_SPIN_RIGHT,
  MOVEMENT_ACTION_WALK_FAST_RIGHT,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT,
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_LEFT,
  MOVEMENT_ACTION_WALK_NORMAL_DOWN,
  MOVEMENT_ACTION_WALK_NORMAL_RIGHT,
  MOVEMENT_ACTION_WALK_NORMAL_UP,
  MOVEMENT_ACTION_WALK_SLOWER_DOWN,
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN,
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_UP,
  MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT_LEFT,
  MOVEMENT_ACTION_DELAY_4,
  MOVEMENT_ACTION_NONE,
  MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_LEFT,
  MoveCoords,
  MovePlayerToMapCoords,
  OBJ_EVENT_GFX_GREEN_BIKE,
  OBJ_EVENT_GFX_GREEN_FIELD_MOVE,
  OBJ_EVENT_GFX_GREEN_FISH,
  OBJ_EVENT_GFX_GREEN_NORMAL,
  OBJ_EVENT_GFX_GREEN_SURF,
  OBJ_EVENT_GFX_GREEN_VS_SEEKER,
  OBJ_EVENT_GFX_GREEN_VS_SEEKER_BIKE,
  OBJ_EVENT_GFX_RED_BIKE,
  OBJ_EVENT_GFX_RED_FIELD_MOVE,
  OBJ_EVENT_GFX_RED_FISH,
  OBJ_EVENT_GFX_RED_NORMAL,
  OBJ_EVENT_GFX_RED_SURF,
  OBJ_EVENT_GFX_RED_VS_SEEKER,
  OBJ_EVENT_GFX_RED_VS_SEEKER_BIKE,
  OBJ_EVENT_GFX_RS_BRENDAN,
  OBJ_EVENT_GFX_RS_MAY,
  PARTY_SIZE,
  PLAYER_AVATAR_FLAG_ACRO_BIKE,
  PLAYER_AVATAR_FLAG_CONTROLLABLE,
  PLAYER_AVATAR_FLAG_DASH,
  PLAYER_AVATAR_FLAG_FORCED,
  PLAYER_AVATAR_FLAG_MACH_BIKE,
  PLAYER_AVATAR_FLAG_ON_FOOT,
  PLAYER_AVATAR_FLAG_SURFING,
  PLAYER_AVATAR_GFX_BIKE,
  PLAYER_AVATAR_GFX_FIELD_MOVE,
  PLAYER_AVATAR_GFX_FISH,
  PLAYER_AVATAR_GFX_NORMAL,
  PLAYER_AVATAR_GFX_RIDE,
  PLAYER_AVATAR_GFX_VSSEEKER,
  PartyHasMonWithSurf,
  PlayerAcroPopWheelie,
  PlayerAcroTurnJump,
  PlayerAcroWheelieCollide,
  PlayerAcroWheelieMove,
  PlayerEndWheelie,
  PlayerFaceDirection,
  PlayerForceSetHeldMovement,
  PlayerGoSpin,
  PlayerGetCopyableMovement,
  PlayerJumpLedge,
  PlayerIdleWheelie,
  PlayerLedgeHoppingWheelie,
  PlayerMovingHoppingWheelie,
  PlayerNotOnBikeCollide,
  PlayerOnBikeCollide,
  PlayCollisionSoundIfNotFacingWarp,
  PlayerRun,
  PlayerAvatarTransition_Bike,
  PlayerAvatar_DoSecretBaseMatJump,
  PlayerAvatar_DoSecretBaseMatSpin,
  PlayerAvatar_SecretBaseMatSpinStep1,
  PlayerAvatar_SecretBaseMatSpinStep2,
  PlayerAvatar_SecretBaseMatSpinStep3,
  PlayerAvatarTransition_Normal,
  PlayerAvatarTransition_ReturnToField,
  PlayerAvatarTransition_Surfing,
  PlayerGetDestCoords,
  PlayerGetElevation,
  PlayerCheckIfAnimFinishedOrInactive,
  PlayerAnimIsMultiFrameStationary,
  PlayerAnimIsMultiFrameStationaryAndStateNotTurning,
  PlayerSetAnimId,
  PlayerSetCopyableMovement,
  PlayerShakeHeadOrWalkInPlace,
  PlayerStandingHoppingWheelie,
  PlayerStartWheelie,
  PlayerTurnInPlace,
  PlayerWalkFast,
  PlayerWalkNormal,
  QL_PLAYER_GFX_BIKE,
  QL_PLAYER_GFX_FISH,
  QL_PLAYER_GFX_NORMAL,
  QL_PLAYER_GFX_SURF,
  QL_TryRecordPlayerStepWithDuration0,
  SetPlayerAvatarTransitionFlags,
  SetPlayerAvatarExtraStateTransition,
  SetPlayerAvatarStateMask,
  SetPlayerInvisibility,
  SE_LEDGE,
  SE_BIKE_HOP,
  SE_WALL_HIT,
  SE_WARP_IN,
  SE_M_STRENGTH,
  SPECIES_NONE,
  StartPlayerAvatarFishAnim,
  StartPlayerAvatarSummonMonForFieldMoveAnim,
  StartPlayerAvatarVsSeekerAnim,
  StartFishing,
  StopPlayerAvatar,
  CreateStopSurfingTask,
  CreateStopSurfingTask_NoMusicChange,
  Task_Fishing,
  Task_StopSurfingInit,
  Task_WaitStopSurfing,
  T_TILE_CENTER,
  T_TILE_TRANSITION,
  T_NOT_MOVING,
  TestPlayerAvatarFlags,
  NOT_MOVING,
  createFieldObjectEvent,
  createFieldTask,
  createFieldPlayerAvatarRuntime,
  ObjectEventClearHeldMovementIfFinished,
  ForcedMovement_None,
  ForcedMovement_SlideEast,
  ForcedMovement_SpinRight,
  GetTeleportSavedFacingDirection,
  OBJ_EVENT_GFX_PUSHABLE_BOULDER,
  OBJECT_EVENTS_COUNT,
  PlayerNotOnBikeMoving,
  SavePlayerFacingDirectionForTeleport,
  StartTeleportInPlayerAnim,
  StartTeleportWarpOutPlayerAnim,
  Task_TeleportWarpInPlayerAnim,
  Task_TeleportWarpOutPlayerAnim,
  Task_BumpBoulder,
  TryDoMetatileBehaviorForcedMovement,
  TryInterruptObjectEventSpecialAnim,
  UpdatePlayerAvatarTransitionState,
  WaitTeleportInPlayerAnim,
  WaitTeleportWarpOutPlayerAnim,
  CheckForObjectEventCollision,
  IsPlayerFacingSurfableFishableWater,
  SeafoamIslandsB4F_CurrentDumpsPlayerOnLand,
  QL_PLAYBACK_STATE_RUNNING,
  CheckForPlayerAvatarCollision,
  CheckMovementInputNotOnBike,
  player_get_pos_including_state_based_drift,
  player_step
} from '../src/game/decompFieldPlayerAvatar';

describe('decompFieldPlayerAvatar', () => {
  it('MoveCoords and player coordinate helpers copy the C direction behavior', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [
        createFieldObjectEvent({
          currentCoords: { x: 10, y: 20 },
          facingDirection: DIR_WEST,
          movementDirection: DIR_EAST,
          previousElevation: 3
        })
      ]
    });

    const coords = { x: 4, y: 4 };
    MoveCoords(DIR_SOUTH, coords);
    MoveCoords(DIR_EAST, coords);
    expect(coords).toEqual({ x: 5, y: 5 });
    expect(GetXYCoordsOneStepInFrontOfPlayer(runtime)).toEqual({ x: 9, y: 20 });
    expect(PlayerGetDestCoords(runtime)).toEqual({ x: 10, y: 20 });
    expect(GetPlayerFacingDirection(runtime)).toBe(DIR_WEST);
    expect(GetPlayerMovementDirection(runtime)).toBe(DIR_EAST);
    expect(PlayerGetElevation(runtime)).toBe(3);

    MovePlayerToMapCoords(runtime, 7, 8);
    expect(PlayerGetDestCoords(runtime)).toEqual({ x: 7, y: 8 });
  });

  it('player_get_pos_including_state_based_drift returns drift only for unfinished held walk/run actions', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [
        createFieldObjectEvent({
          currentCoords: { x: 12, y: 14 },
          heldMovementActive: true,
          heldMovementFinished: false,
          movementActionId: MOVEMENT_ACTION_WALK_NORMAL_DOWN,
          spriteId: 0
        })
      ],
      gSprites: [{ data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 }]
    });

    expect(player_get_pos_including_state_based_drift(runtime)).toEqual({ result: 1, x: 12, y: 15 });
    runtime.gObjectEvents[0].movementActionId = MOVEMENT_ACTION_WALK_NORMAL_UP;
    expect(player_get_pos_including_state_based_drift(runtime)).toEqual({ result: 1, x: 12, y: 13 });
    runtime.gObjectEvents[0].movementActionId = MOVEMENT_ACTION_PLAYER_RUN_LEFT;
    expect(player_get_pos_including_state_based_drift(runtime)).toEqual({ result: 1, x: 11, y: 14 });
    runtime.gObjectEvents[0].movementActionId = MOVEMENT_ACTION_PLAYER_RUN_RIGHT;
    expect(player_get_pos_including_state_based_drift(runtime)).toEqual({ result: 1, x: 13, y: 14 });

    runtime.gSprites[0].data[2] = 1;
    expect(player_get_pos_including_state_based_drift(runtime)).toEqual({ result: 0, x: -1, y: -1 });
    runtime.gSprites[0].data[2] = 0;
    runtime.gObjectEvents[0].heldMovementFinished = true;
    expect(player_get_pos_including_state_based_drift(runtime)).toEqual({ result: 0, x: -1, y: -1 });
  });

  it('state mask and flag helpers preserve only dash/forced/controllable before ORing new state', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: {
        flags: PLAYER_AVATAR_FLAG_DASH | PLAYER_AVATAR_FLAG_FORCED | PLAYER_AVATAR_FLAG_CONTROLLABLE | PLAYER_AVATAR_FLAG_SURFING,
        spriteId: 19,
        objectEventId: 0,
        gender: FEMALE,
        transitionFlags: 0,
        runningState: NOT_MOVING,
        tileTransitionState: T_NOT_MOVING,
        preventStep: false
      }
    });

    SetPlayerAvatarStateMask(runtime, PLAYER_AVATAR_FLAG_MACH_BIKE);

    expect(GetPlayerAvatarFlags(runtime)).toBe(
      PLAYER_AVATAR_FLAG_DASH | PLAYER_AVATAR_FLAG_FORCED | PLAYER_AVATAR_FLAG_CONTROLLABLE | PLAYER_AVATAR_FLAG_MACH_BIKE
    );
    expect(TestPlayerAvatarFlags(runtime, PLAYER_AVATAR_FLAG_FORCED | PLAYER_AVATAR_FLAG_SURFING)).toBe(PLAYER_AVATAR_FLAG_FORCED);
    expect(GetPlayerAvatarObjectId(runtime)).toBe(19);

    ClearPlayerAvatarInfo(runtime);
    expect(runtime.gPlayerAvatar).toMatchObject({ flags: 0, spriteId: 0, objectEventId: 0, gender: MALE, transitionFlags: 0 });
  });

  it('ForcedMovement_None and CancelPlayerForcedMovement clear forced state only when set', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: {
        flags: PLAYER_AVATAR_FLAG_FORCED | PLAYER_AVATAR_FLAG_DASH,
        spriteId: 0,
        objectEventId: 0,
        gender: MALE,
        transitionFlags: 0,
        runningState: NOT_MOVING,
        tileTransitionState: T_NOT_MOVING,
        preventStep: false
      },
      gObjectEvents: [
        createFieldObjectEvent({
          facingDirection: DIR_EAST,
          facingDirectionLocked: true,
          enableAnim: false
        })
      ]
    });

    expect(ForcedMovement_None(runtime)).toBe(false);
    expect(runtime.gPlayerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_DASH);
    expect(runtime.gObjectEvents[0]).toMatchObject({ facingDirectionLocked: false, enableAnim: true, facingDirection: DIR_EAST });
    expect(runtime.operations).toEqual([`SetObjectEventDirection:${DIR_EAST}`]);

    runtime.operations = [];
    CancelPlayerForcedMovement(runtime);
    expect(runtime.operations).toEqual([]);
  });

  it('forced movement table, sliding, spin, and collision branches follow C ordering', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: {
        flags: 0,
        spriteId: 0,
        objectEventId: 0,
        gender: MALE,
        transitionFlags: 0,
        runningState: NOT_MOVING,
        tileTransitionState: T_NOT_MOVING,
        preventStep: false
      },
      gObjectEvents: [
        createFieldObjectEvent({
          currentMetatileBehavior: 77,
          movementDirection: DIR_SOUTH,
          spriteId: 0
        })
      ],
      metatileBehavior: {
        isSlideEast: (behavior) => behavior === 77,
        isSpinRight: (behavior) => behavior === 88
      }
    });

    expect(TryDoMetatileBehaviorForcedMovement(runtime)).toBe(true);
    expect(runtime.gPlayerAvatar.lastSpinTile).toBe(77);
    expect(runtime.gPlayerAvatar.runningState).toBe(2);
    expect(runtime.gObjectEvents[0]).toMatchObject({ disableAnim: true, facingDirectionLocked: true });
    expect(runtime.operations).toContain(`ObjectEventSetHeldMovement:${MOVEMENT_ACTION_WALK_FAST_RIGHT}`);

    runtime.operations = [];
    runtime.gObjectEvents[0].currentMetatileBehavior = 88;
    expect(ForcedMovement_SpinRight(runtime)).toBe(true);
    expect(runtime.operations[0]).toBe('PlaySE:144');
    expect(runtime.operations).toContain(`ObjectEventSetHeldMovement:${MOVEMENT_ACTION_SPIN_RIGHT}`);

    runtime.operations = [];
    expect(ForcedMovement_SlideEast(runtime)).toBe(true);
    expect(runtime.gObjectEvents[0].facingDirectionLocked).toBe(true);

    const blocked = createFieldPlayerAvatarRuntime({
      getCollisionAtCoords: () => COLLISION_OBJECT_EVENT
    });
    expect(DoForcedMovement(blocked, DIR_EAST, PlayerWalkNormal)).toBe(0);
    expect(blocked.gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_FORCED).toBe(0);
  });

  it('object/player collision ports stop-surfing, ledge, boulder, directional stair, and acro-bike checks', () => {
    const stopSurfing = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: createFieldPlayerAvatarRuntime().gPlayerAvatar,
      getCollisionAtCoords: () => COLLISION_ELEVATION_MISMATCH,
      mapGridGetElevationAt: () => 3,
      getObjectEventIdByPosition: () => OBJECT_EVENTS_COUNT
    });
    stopSurfing.gPlayerAvatar.flags = PLAYER_AVATAR_FLAG_SURFING;
    expect(CheckForObjectEventCollision(stopSurfing, stopSurfing.gObjectEvents[0], 1, 2, DIR_NORTH, 0)).toBe(COLLISION_STOP_SURFING);
    expect(stopSurfing.operations).toContain('LockPlayerFieldControls');

    const ledge = createFieldPlayerAvatarRuntime({
      getLedgeJumpDirection: () => DIR_SOUTH
    });
    expect(CheckForObjectEventCollision(ledge, ledge.gObjectEvents[0], 1, 2, DIR_SOUTH, 0)).toBe(COLLISION_LEDGE_JUMP);
    expect(ledge.operations).toContain('IncrementGameStat:GAME_STAT_JUMPED_DOWN_LEDGES');

    const boulder = createFieldPlayerAvatarRuntime({
      flagUseStrength: true,
      gObjectEvents: [
        createFieldObjectEvent({ spriteId: 0 }),
        createFieldObjectEvent({ graphicsId: OBJ_EVENT_GFX_PUSHABLE_BOULDER, currentCoords: { x: 5, y: 5 }, spriteId: 0 })
      ],
      getCollisionAtCoords: (objectEvent) =>
        objectEvent.graphicsId === OBJ_EVENT_GFX_PUSHABLE_BOULDER ? COLLISION_NONE : COLLISION_OBJECT_EVENT,
      getObjectEventIdByXY: () => 1
    });
    expect(CheckForObjectEventCollision(boulder, boulder.gObjectEvents[0], 4, 5, DIR_EAST, 0)).toBe(COLLISION_PUSHED_BOULDER);
    expect(boulder.operations).toContain(`StartStrengthAnim:1:${DIR_EAST}`);

    const player = createFieldPlayerAvatarRuntime({
      mapGridGetMetatileBehaviorAt: () => 44,
      metatileBehavior: {
        isDirectionalStairWarp: (behavior, direction) => behavior === 44 && direction === DIR_WEST,
        isBumpySlope: (behavior) => behavior === 55
      }
    });
    expect(CheckForPlayerAvatarCollision(player, DIR_WEST)).toBe(COLLISION_DIRECTIONAL_STAIR_WARP);
    player.metatileBehavior.isDirectionalStairWarp = () => false;
    player.mapGridGetMetatileBehaviorAt = () => 55;
    expect(CheckForPlayerAvatarCollision(player, DIR_EAST)).not.toBe(COLLISION_NONE);
  });

  it('boulder task, water-facing, Seafoam current, and transition state helpers match C branches', () => {
    const boulder = createFieldPlayerAvatarRuntime({
      gObjectEvents: [
        createFieldObjectEvent({ spriteId: 0, movementOverridden: false, heldMovementFinished: true }),
        createFieldObjectEvent({
          graphicsId: OBJ_EVENT_GFX_PUSHABLE_BOULDER,
          currentCoords: { x: 8, y: 9 },
          previousElevation: 2,
          spriteId: 1,
          movementOverridden: false,
          heldMovementFinished: true
        })
      ],
      gSprites: [
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0, oamPriority: 3 },
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0, oamPriority: 1 }
      ]
    });
    const task = createFieldTask(boulder, 'Task_BumpBoulder');
    task.data[1] = 1;
    task.data[2] = DIR_EAST;
    Task_BumpBoulder(boulder, task);
    expect(boulder.gPlayerAvatar.preventStep).toBe(true);
    Task_BumpBoulder(boulder, task);
    expect(boulder.gFieldEffectArguments).toEqual([8, 9, 2, 1]);
    expect(boulder.operations).toContain(`PlaySE:${SE_M_STRENGTH}`);
    boulder.gObjectEvents[0].heldMovementFinished = true;
    boulder.gObjectEvents[1].heldMovementFinished = true;
    Task_BumpBoulder(boulder, task);
    expect(task.destroyed).toBe(true);
    expect(boulder.gPlayerAvatar.preventStep).toBe(false);

    const water = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: { ...createFieldPlayerAvatarRuntime().gPlayerAvatar, flags: PLAYER_AVATAR_FLAG_SURFING },
      gObjectEvents: [createFieldObjectEvent({ currentCoords: { x: 3, y: 4 }, facingDirection: DIR_NORTH, previousElevation: 3 })],
      getCollisionAtCoords: () => COLLISION_ELEVATION_MISMATCH,
      metatileAtCoordsIsWaterTile: (x, y) => x === 3 && y === 3
    });
    expect(IsPlayerFacingSurfableFishableWater(water)).toBe(true);

    const seafoam = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: { ...createFieldPlayerAvatarRuntime().gPlayerAvatar, flags: PLAYER_AVATAR_FLAG_SURFING },
      gObjectEvents: [createFieldObjectEvent({ fieldEffectSpriteId: 0 })]
    });
    SeafoamIslandsB4F_CurrentDumpsPlayerOnLand(seafoam);
    expect(seafoam.operations).toContain('QuestLogRecordPlayerAvatarGfxTransitionWithDuration:SURF_DISMOUNT_NORTH:16');
    const playback = createFieldPlayerAvatarRuntime({ questLogPlaybackState: QL_PLAYBACK_STATE_RUNNING });
    SeafoamIslandsB4F_CurrentDumpsPlayerOnLand(playback);
    expect(playback.operations).toEqual([]);

    const transition = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: { ...createFieldPlayerAvatarRuntime().gPlayerAvatar, runningState: NOT_MOVING },
      gObjectEvents: [createFieldObjectEvent({
        movementOverridden: true,
        heldMovementActive: true,
        heldMovementFinished: false,
        movementActionId: MOVEMENT_ACTION_WALK_NORMAL_UP
      })]
    });
    expect(PlayerCheckIfAnimFinishedOrInactive(transition)).toBe(0);
    expect(PlayerAnimIsMultiFrameStationary(transition)).toBe(false);
    UpdatePlayerAvatarTransitionState(transition);
    expect(transition.gPlayerAvatar.tileTransitionState).toBe(T_TILE_TRANSITION);
    transition.gObjectEvents[0].movementActionId = MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT;
    transition.gObjectEvents[0].heldMovementFinished = true;
    expect(PlayerAnimIsMultiFrameStationaryAndStateNotTurning(transition)).toBe(true);
    UpdatePlayerAvatarTransitionState(transition);
    expect(transition.gPlayerAvatar.tileTransitionState).toBe(T_NOT_MOVING);
    transition.gPlayerAvatar.runningState = 1;
    UpdatePlayerAvatarTransitionState(transition);
    expect(transition.gPlayerAvatar.tileTransitionState).toBe(T_TILE_CENTER);
  });

  it('StopPlayerAvatar clears strange bits, preserves facing direction, and runs bike side effects only on bikes', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: {
        flags: PLAYER_AVATAR_FLAG_DASH | PLAYER_AVATAR_FLAG_MACH_BIKE,
        spriteId: 0,
        objectEventId: 0,
        gender: MALE,
        transitionFlags: 0,
        runningState: NOT_MOVING,
        tileTransitionState: T_NOT_MOVING,
        preventStep: false
      },
      gObjectEvents: [
        createFieldObjectEvent({
          facingDirection: DIR_NORTH,
          inanimate: true,
          disableAnim: true,
          facingDirectionLocked: true
        })
      ]
    });

    StopPlayerAvatar(runtime);
    expect(runtime.gPlayerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_MACH_BIKE);
    expect(runtime.gObjectEvents[0]).toMatchObject({
      inanimate: false,
      disableAnim: false,
      facingDirectionLocked: false,
      facingDirection: DIR_NORTH
    });
    expect(runtime.operations).toEqual([
      `SetObjectEventDirection:${DIR_NORTH}`,
      'Bike_HandleBumpySlopeJump',
      'Bike_UpdateBikeCounterSpeed:0'
    ]);

    runtime.operations = [];
    runtime.gPlayerAvatar.flags = PLAYER_AVATAR_FLAG_DASH;
    StopPlayerAvatar(runtime);
    expect(runtime.gPlayerAvatar.flags).toBe(0);
    expect(runtime.operations).toEqual([`SetObjectEventDirection:${DIR_NORTH}`]);
  });

  it('non-bike input, interrupt handling, and player_step match the C control flow', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      flagBDash: true,
      playerIsMovingOnRockStairs: (direction) => direction === DIR_NORTH,
      gObjectEvents: [createFieldObjectEvent({ movementDirection: DIR_SOUTH, spriteId: 0 })]
    });

    expect(CheckMovementInputNotOnBike(runtime, DIR_NONE)).toBe(0);
    expect(runtime.gPlayerAvatar.runningState).toBe(NOT_MOVING);
    expect(CheckMovementInputNotOnBike(runtime, DIR_EAST)).toBe(1);
    expect(CheckMovementInputNotOnBike(runtime, DIR_SOUTH)).toBe(2);

    PlayerNotOnBikeMoving(runtime, DIR_NORTH, B_BUTTON);
    expect(runtime.operations).toContain(`ObjectEventSetHeldMovement:${MOVEMENT_ACTION_PLAYER_RUN_UP_SLOW}`);
    expect(runtime.gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_DASH).toBe(PLAYER_AVATAR_FLAG_DASH);

    const interrupt = createFieldPlayerAvatarRuntime({
      gObjectEvents: [
        createFieldObjectEvent({
          movementOverridden: true,
          heldMovementActive: true,
          heldMovementFinished: false,
          movementActionId: MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_LEFT,
          movementDirection: DIR_SOUTH
        })
      ]
    });
    expect(TryInterruptObjectEventSpecialAnim(interrupt, interrupt.gObjectEvents[0], DIR_EAST)).toBe(false);
    expect(interrupt.gObjectEvents[0].heldMovementActive).toBe(false);

    const stepped = createFieldPlayerAvatarRuntime({
      flagBDash: false,
      gObjectEvents: [createFieldObjectEvent({ movementDirection: DIR_EAST, spriteId: 0 })]
    });
    player_step(stepped, DIR_EAST, 0, 0);
    expect(stepped.gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_CONTROLLABLE).toBe(0);
    expect(stepped.operations).toContain(`ObjectEventSetHeldMovement:${MOVEMENT_ACTION_WALK_NORMAL_RIGHT}`);
  });

  it('teleport warp out/in tasks preserve saved facing, priority, y motion, and wait helpers', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [createFieldObjectEvent({ facingDirection: DIR_SOUTH, movementDirection: DIR_SOUTH, spriteId: 0 })],
      gSprites: [{ data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0, y: 32, oamPriority: 3, subpriority: 4 }]
    });

    SavePlayerFacingDirectionForTeleport(runtime, DIR_NONE);
    expect(GetTeleportSavedFacingDirection(runtime)).toBe(DIR_SOUTH);
    SavePlayerFacingDirectionForTeleport(runtime, DIR_WEST);
    expect(GetTeleportSavedFacingDirection(runtime)).toBe(DIR_WEST);

    const out = StartTeleportWarpOutPlayerAnim(runtime);
    expect(WaitTeleportWarpOutPlayerAnim(runtime)).toBe(true);
    expect(runtime.teleportSavedFacingDirection).toBe(DIR_SOUTH);
    expect(runtime.gObjectEvents[0].fixedPriority).toBe(true);
    for (let i = 0; i < 80 && out.data[0] !== 2; i += 1)
      Task_TeleportWarpOutPlayerAnim(runtime, out);
    expect(out.data[0]).toBe(2);
    Task_TeleportWarpOutPlayerAnim(runtime, out);
    expect(out.destroyed).toBe(true);
    expect(WaitTeleportWarpOutPlayerAnim(runtime)).toBe(false);

    runtime.gSprites[0].y = 20;
    runtime.gSprites[0].y2 = 0;
    runtime.gSprites[0].oamPriority = 3;
    runtime.gSprites[0].subpriority = 4;
    runtime.teleportSavedFacingDirection = DIR_WEST;
    const warpIn = StartTeleportInPlayerAnim(runtime);
    expect(WaitTeleportInPlayerAnim(runtime)).toBe(true);
    expect(runtime.gSprites[0]).toMatchObject({ oamPriority: 1, subpriority: 0 });
    warpIn.data[0] = 3;
    runtime.gObjectEvents[0].facingDirection = DIR_WEST;
    runtime.gObjectEvents[0].heldMovementActive = true;
    runtime.gObjectEvents[0].heldMovementFinished = true;
    Task_TeleportWarpInPlayerAnim(runtime, warpIn);
    expect(runtime.gObjectEvents[0].fixedPriority).toBe(false);
    expect(runtime.gSprites[0]).toMatchObject({ oamPriority: 3, subpriority: 4 });
    expect(warpIn.destroyed).toBe(true);
  });

  it('movement action lookup helpers clamp invalid directions to DIR_NONE like dirn_to_anim', () => {
    expect(GetWalkSlowerMovementAction(99)).toBe(MOVEMENT_ACTION_WALK_SLOWER_DOWN);
    expect(GetWalkNormalMovementAction(DIR_NORTH)).toBe(MOVEMENT_ACTION_WALK_NORMAL_UP);
    expect(GetWalkNormalMovementAction(DIR_EAST)).toBe(MOVEMENT_ACTION_WALK_NORMAL_RIGHT);
    expect(GetWalkFastMovementAction(DIR_EAST)).toBe(MOVEMENT_ACTION_WALK_FAST_RIGHT);
    expect(GetPlayerRunMovementAction(DIR_NORTH)).toBe(MOVEMENT_ACTION_PLAYER_RUN_UP);
    expect(GetWalkInPlaceFastMovementAction(DIR_WEST)).toBe(MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT);
  });

  it('PlayerSetAnimId sets copyable movement, held movement, sprite state, and quest-log step unless overridden', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [
        createFieldObjectEvent({
          spriteId: 0,
          playerCopyableMovement: 9,
          movementActionId: 0xff,
          heldMovementActive: false,
          heldMovementFinished: true
        })
      ],
      gSprites: [{ data: [0, 0, 7], animNum: 0, invisible: false, x2: 0, y2: 0 }]
    });

    PlayerSetCopyableMovement(runtime, 4);
    expect(PlayerGetCopyableMovement(runtime)).toBe(4);

    PlayerSetAnimId(runtime, MOVEMENT_ACTION_WALK_NORMAL_RIGHT, 2);
    expect(PlayerGetCopyableMovement(runtime)).toBe(2);
    expect(runtime.gObjectEvents[0]).toMatchObject({
      movementActionId: MOVEMENT_ACTION_WALK_NORMAL_RIGHT,
      heldMovementActive: true,
      heldMovementFinished: false
    });
    expect(runtime.gSprites[0].data[2]).toBe(0);
    expect(runtime.operations).toEqual([
      `ObjectEventSetHeldMovement:${MOVEMENT_ACTION_WALK_NORMAL_RIGHT}`,
      `QuestLogRecordPlayerStep:${MOVEMENT_ACTION_WALK_NORMAL_RIGHT}`
    ]);

    runtime.operations = [];
    runtime.gObjectEvents[0].movementOverridden = true;
    PlayerSetAnimId(runtime, MOVEMENT_ACTION_WALK_NORMAL_UP, 1);
    expect(runtime.gObjectEvents[0].movementActionId).toBe(MOVEMENT_ACTION_WALK_NORMAL_RIGHT);
    expect(runtime.operations).toEqual([]);
  });

  it('PlayerForceSetHeldMovement and public movement wrappers use exact C movement actions and copyable values', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [createFieldObjectEvent({ spriteId: 0 })],
      gSprites: [{ data: [0, 0, 5], animNum: 0, invisible: false, x2: 0, y2: 0 }]
    });

    PlayerForceSetHeldMovement(runtime, MOVEMENT_ACTION_WALK_NORMAL_DOWN);
    expect(runtime.gObjectEvents[0]).toMatchObject({
      movementActionId: MOVEMENT_ACTION_WALK_NORMAL_DOWN,
      heldMovementActive: true,
      heldMovementFinished: false
    });
    expect(runtime.gSprites[0].data[2]).toBe(0);

    runtime.operations = [];
    PlayerWalkNormal(runtime, DIR_EAST);
    PlayerRun(runtime, DIR_WEST);
    PlayerWalkFast(runtime, DIR_EAST);
    PlayerFaceDirection(runtime, DIR_NORTH);
    PlayerTurnInPlace(runtime, DIR_WEST);
    PlayerJumpLedge(runtime, DIR_SOUTH);
    PlayerShakeHeadOrWalkInPlace(runtime);

    expect(runtime.operations).toEqual([
      `ObjectEventSetHeldMovement:${MOVEMENT_ACTION_WALK_NORMAL_RIGHT}`,
      `QuestLogRecordPlayerStep:${MOVEMENT_ACTION_WALK_NORMAL_RIGHT}`,
      `ObjectEventSetHeldMovement:${MOVEMENT_ACTION_PLAYER_RUN_LEFT}`,
      `QuestLogRecordPlayerStep:${MOVEMENT_ACTION_PLAYER_RUN_LEFT}`,
      `ObjectEventSetHeldMovement:${MOVEMENT_ACTION_WALK_FAST_RIGHT}`,
      `QuestLogRecordPlayerStep:${MOVEMENT_ACTION_WALK_FAST_RIGHT}`,
      'ObjectEventSetHeldMovement:1',
      'QuestLogRecordPlayerStep:1',
      `ObjectEventSetHeldMovement:${MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT}`,
      `QuestLogRecordPlayerStep:${MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT}`,
      `PlaySE:${SE_LEDGE}`,
      'ObjectEventSetHeldMovement:20',
      'QuestLogRecordPlayerStep:20',
      `ObjectEventSetHeldMovement:${MOVEMENT_ACTION_SHAKE_HEAD_OR_WALK_IN_PLACE}`,
      `QuestLogRecordPlayerStep:${MOVEMENT_ACTION_SHAKE_HEAD_OR_WALK_IN_PLACE}`
    ]);
    expect(PlayerGetCopyableMovement(runtime)).toBe(0);
  });

  it('PlayCollisionSoundIfNotFacingWarp skips arrow, stair, and north door warps before wall-hit sound', () => {
    const metatileBehavior = {
      isSouthArrowWarp: (behavior: number) => behavior === 10,
      isNorthArrowWarp: (behavior: number) => behavior === 11,
      isWestArrowWarp: (behavior: number) => behavior === 12,
      isEastArrowWarp: (behavior: number) => behavior === 13,
      isDirectionalUpLeftStairWarp: (behavior: number) => behavior === 20,
      isDirectionalDownLeftStairWarp: (behavior: number) => behavior === 21,
      isDirectionalUpRightStairWarp: (behavior: number) => behavior === 22,
      isDirectionalDownRightStairWarp: (behavior: number) => behavior === 23,
      isWarpDoor: (behavior: number) => behavior === 30,
      isBumpySlope: () => false
    };
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [
        createFieldObjectEvent({
          currentCoords: { x: 5, y: 6 },
          currentMetatileBehavior: 10
        })
      ],
      mapGridGetMetatileBehaviorAt: (x, y) => (x === 5 && y === 5 ? 30 : 0),
      metatileBehavior
    });

    PlayCollisionSoundIfNotFacingWarp(runtime, DIR_SOUTH);
    expect(runtime.operations).toEqual([]);

    runtime.gObjectEvents[0].currentMetatileBehavior = 20;
    PlayCollisionSoundIfNotFacingWarp(runtime, DIR_WEST);
    expect(runtime.operations).toEqual([]);

    runtime.gObjectEvents[0].currentMetatileBehavior = 22;
    PlayCollisionSoundIfNotFacingWarp(runtime, DIR_EAST);
    expect(runtime.operations).toEqual([]);

    runtime.gObjectEvents[0].currentMetatileBehavior = 0;
    PlayCollisionSoundIfNotFacingWarp(runtime, DIR_NORTH);
    expect(runtime.operations).toEqual([]);

    PlayCollisionSoundIfNotFacingWarp(runtime, DIR_EAST);
    expect(runtime.operations).toEqual([`PlaySE:${SE_WALL_HIT}`]);
  });

  it('bike/non-bike collide wrappers play wall hit first then set exact walk-in-place action', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [createFieldObjectEvent({ spriteId: 0 })],
      gSprites: [{ data: [0, 0, 4], animNum: 0, invisible: false, x2: 0, y2: 0 }]
    });

    PlayerOnBikeCollide(runtime, DIR_EAST);
    PlayerNotOnBikeCollide(runtime, DIR_NORTH);

    expect(runtime.operations).toEqual([
      `PlaySE:${SE_WALL_HIT}`,
      `ObjectEventSetHeldMovement:${GetWalkInPlaceNormalMovementAction(DIR_EAST)}`,
      `QuestLogRecordPlayerStep:${GetWalkInPlaceNormalMovementAction(DIR_EAST)}`,
      `PlaySE:${SE_WALL_HIT}`,
      `ObjectEventSetHeldMovement:${GetWalkInPlaceSlowMovementAction(DIR_NORTH)}`,
      `QuestLogRecordPlayerStep:${GetWalkInPlaceSlowMovementAction(DIR_NORTH)}`
    ]);
    expect(PlayerGetCopyableMovement(runtime)).toBe(2);
  });

  it('enforced look direction and spin respect tile center/not-moving and bumpy acro-bike guard', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: {
        flags: 0,
        spriteId: 0,
        objectEventId: 0,
        gender: MALE,
        transitionFlags: 0,
        runningState: NOT_MOVING,
        tileTransitionState: T_TILE_CENTER,
        preventStep: false
      },
      gObjectEvents: [
        createFieldObjectEvent({
          spriteId: 0,
          facingDirection: DIR_WEST,
          currentMetatileBehavior: 99
        })
      ],
      gSprites: [{ data: [0, 0, 6], animNum: 0, invisible: false, x2: 0, y2: 0 }],
      metatileBehavior: {
        isSouthArrowWarp: () => false,
        isNorthArrowWarp: () => false,
        isWestArrowWarp: () => false,
        isEastArrowWarp: () => false,
        isDirectionalUpLeftStairWarp: () => false,
        isDirectionalDownLeftStairWarp: () => false,
        isDirectionalUpRightStairWarp: () => false,
        isDirectionalDownRightStairWarp: () => false,
        isWarpDoor: () => false,
        isBumpySlope: (behavior: number) => behavior === 99
      }
    });

    HandleEnforcedLookDirectionOnPlayerStopMoving(runtime);
    expect(runtime.gObjectEvents[0].movementActionId).toBe(2);

    runtime.operations = [];
    runtime.gPlayerAvatar.flags = PLAYER_AVATAR_FLAG_ACRO_BIKE;
    expect(IsPlayerNotUsingAcroBikeOnBumpySlope(runtime)).toBe(false);
    HandleEnforcedLookDirectionOnPlayerStopMoving(runtime);
    expect(runtime.operations).toEqual([]);

    runtime.gPlayerAvatar.flags = 0;
    runtime.gPlayerAvatar.tileTransitionState = T_TILE_TRANSITION;
    HandleEnforcedLookDirectionOnPlayerStopMoving(runtime);
    expect(runtime.operations).toEqual([]);

    runtime.gPlayerAvatar.tileTransitionState = T_NOT_MOVING;
    PlayerGoSpin(runtime, DIR_NORTH);
    expect(runtime.operations).toEqual([
      `ObjectEventSetHeldMovement:${0x95}`,
      `QuestLogRecordPlayerStep:${0x95}`
    ]);
    expect(PlayerGetCopyableMovement(runtime)).toBe(3);
  });

  it('acro-bike movement action lookup helpers preserve direction tables and DIR_NONE fallback', () => {
    expect(GetAcroWheelieFaceDirectionMovementAction(99)).toBe(MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN);
    expect(GetAcroWheelieFaceDirectionMovementAction(DIR_EAST)).toBe(MOVEMENT_ACTION_ACRO_WHEELIE_FACE_RIGHT);
    expect(GetAcroWheelieMoveMovementAction(DIR_NORTH)).toBe(MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_UP);
    expect(GetJumpInPlaceTurnAroundMovementAction(DIR_WEST)).toBe(MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT_LEFT);
  });

  it('acro-bike wrappers use exact movement actions, copyable values, and sound order', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [createFieldObjectEvent({ spriteId: 0 })],
      gSprites: [{ data: [0, 0, 9], animNum: 0, invisible: false, x2: 0, y2: 0 }]
    });

    PlayerIdleWheelie(runtime, DIR_EAST);
    PlayerStartWheelie(runtime, DIR_NORTH);
    PlayerEndWheelie(runtime, DIR_WEST);
    PlayerStandingHoppingWheelie(runtime, DIR_SOUTH);
    PlayerMovingHoppingWheelie(runtime, DIR_NORTH);
    PlayerLedgeHoppingWheelie(runtime, DIR_WEST);
    PlayerAcroTurnJump(runtime, DIR_EAST);
    PlayerAcroWheelieCollide(runtime, DIR_NORTH);
    PlayerAcroPopWheelie(runtime, DIR_WEST);
    PlayerAcroWheelieMove(runtime, DIR_EAST);

    expect(runtime.operations).toEqual([
      'ObjectEventSetHeldMovement:115',
      'QuestLogRecordPlayerStep:115',
      'ObjectEventSetHeldMovement:117',
      'QuestLogRecordPlayerStep:117',
      'ObjectEventSetHeldMovement:122',
      'QuestLogRecordPlayerStep:122',
      `PlaySE:${SE_BIKE_HOP}`,
      'ObjectEventSetHeldMovement:124',
      'QuestLogRecordPlayerStep:124',
      `PlaySE:${SE_BIKE_HOP}`,
      'ObjectEventSetHeldMovement:129',
      'QuestLogRecordPlayerStep:129',
      `PlaySE:${SE_BIKE_HOP}`,
      'ObjectEventSetHeldMovement:134',
      'QuestLogRecordPlayerStep:134',
      `PlaySE:${SE_BIKE_HOP}`,
      'ObjectEventSetHeldMovement:88',
      'QuestLogRecordPlayerStep:88',
      `PlaySE:${SE_WALL_HIT}`,
      'ObjectEventSetHeldMovement:137',
      'QuestLogRecordPlayerStep:137',
      'ObjectEventSetHeldMovement:142',
      'QuestLogRecordPlayerStep:142',
      'ObjectEventSetHeldMovement:147',
      'QuestLogRecordPlayerStep:147'
    ]);
    expect(PlayerGetCopyableMovement(runtime)).toBe(2);
  });

  it('held movement clear and quest-log duration0 helper mirror ObjectEvent movement status branches', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [createFieldObjectEvent({ spriteId: 0, heldMovementActive: false })],
      gSprites: [{ data: [0, 7, 8], animNum: 0, invisible: false, x2: 0, y2: 0 }]
    });
    const object = runtime.gObjectEvents[0];

    expect(ObjectEventClearHeldMovementIfFinished(runtime, object)).toBe(16);
    object.heldMovementActive = true;
    object.heldMovementFinished = false;
    expect(ObjectEventClearHeldMovementIfFinished(runtime, object)).toBe(0);
    object.heldMovementFinished = true;
    object.movementActionId = MOVEMENT_ACTION_WALK_NORMAL_DOWN;
    expect(ObjectEventClearHeldMovementIfFinished(runtime, object)).toBe(1);
    expect(object).toMatchObject({ movementActionId: MOVEMENT_ACTION_NONE, heldMovementActive: false, heldMovementFinished: false });
    expect(runtime.gSprites[0].data.slice(1, 3)).toEqual([0, 0]);

    QL_TryRecordPlayerStepWithDuration0(runtime, object, MOVEMENT_ACTION_WALK_NORMAL_UP);
    expect(object).toMatchObject({ movementActionId: MOVEMENT_ACTION_WALK_NORMAL_UP, heldMovementActive: true, heldMovementFinished: false });
    expect(runtime.operations).toEqual([
      `ObjectEventSetHeldMovement:${MOVEMENT_ACTION_WALK_NORMAL_UP}`,
      `QuestLogRecordPlayerStepWithDuration:${MOVEMENT_ACTION_WALK_NORMAL_UP}:0`
    ]);
  });

  it('secret base mat jump prevents steps, plays ledge sound on completed movement, and finishes after two hops', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [createFieldObjectEvent({ spriteId: 0, facingDirection: DIR_EAST, heldMovementActive: true, heldMovementFinished: false })],
      gSprites: [{ data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 }]
    });
    const task = createFieldTask(runtime, 'DoPlayerAvatarSecretBaseMatJump');

    expect(PlayerAvatar_DoSecretBaseMatJump(runtime, task, runtime.gObjectEvents[0])).toBe(false);
    expect(runtime.gPlayerAvatar.preventStep).toBe(true);
    expect(task.data[1]).toBe(0);

    runtime.gObjectEvents[0].heldMovementFinished = true;
    PlayerAvatar_DoSecretBaseMatJump(runtime, task, runtime.gObjectEvents[0]);
    expect(task.data[1]).toBe(1);
    expect(task.destroyed).toBe(false);
    expect(runtime.operations).toEqual([
      `PlaySE:${SE_LEDGE}`,
      `ObjectEventSetHeldMovement:${GetJumpInPlaceMovementAction(DIR_EAST)}`,
      `QuestLogRecordPlayerStepWithDuration:${GetJumpInPlaceMovementAction(DIR_EAST)}:0`
    ]);

    runtime.gObjectEvents[0].heldMovementFinished = true;
    PlayerAvatar_DoSecretBaseMatJump(runtime, task, runtime.gObjectEvents[0]);
    expect(task.data[1]).toBe(2);
    expect(runtime.gPlayerAvatar.preventStep).toBe(false);
    expect(runtime.gPlayerAvatar.transitionFlags).toBe(PLAYER_AVATAR_FLAG_CONTROLLABLE);
    expect(task.destroyed).toBe(true);

    const created = DoPlayerMatJump(createFieldPlayerAvatarRuntime());
    expect(created.func).toBe('DoPlayerAvatarSecretBaseMatJump');
  });

  it('secret base mat spin step functions preserve task data transitions, delays, unlock, and destroy', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [createFieldObjectEvent({ spriteId: 0, movementDirection: DIR_SOUTH, facingDirection: DIR_NORTH })],
      gSprites: [{ data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 }]
    });
    const task = createFieldTask(runtime, 'PlayerAvatar_DoSecretBaseMatSpin');

    PlayerAvatar_DoSecretBaseMatSpin(runtime, task);
    expect(task.data.slice(0, 3)).toEqual([2, DIR_SOUTH, 0]);
    expect(runtime.gPlayerAvatar.preventStep).toBe(true);
    expect(runtime.operations).toEqual([
      'LockPlayerFieldControls',
      `PlaySE:${SE_WARP_IN}`,
      'ObjectEventSetHeldMovement:2',
      'QuestLogRecordPlayerStepWithDuration:2:0'
    ]);

    runtime.operations = [];
    runtime.gObjectEvents[0].movementDirection = DIR_WEST;
    runtime.gObjectEvents[0].heldMovementFinished = true;
    task.data[0] = 1;
    task.data[1] = DIR_SOUTH;
    task.data[2] = 4;
    PlayerAvatar_SecretBaseMatSpinStep1(runtime, task, runtime.gObjectEvents[0]);
    expect(task.data[0]).toBe(3);
    expect(task.data[2]).toBe(4);
    expect(runtime.operations).toEqual([
      'ObjectEventSetHeldMovement:1',
      'QuestLogRecordPlayerStepWithDuration:1:0'
    ]);

    runtime.operations = [];
    runtime.gObjectEvents[0].heldMovementFinished = true;
    task.data[0] = 2;
    task.data[2] = 3;
    PlayerAvatar_SecretBaseMatSpinStep2(runtime, task, runtime.gObjectEvents[0]);
    expect(task.data[0]).toBe(1);
    expect(runtime.operations).toEqual([
      `ObjectEventSetHeldMovement:${MOVEMENT_ACTION_DELAY_4}`,
      `QuestLogRecordPlayerStepWithDuration:${MOVEMENT_ACTION_DELAY_4}:0`
    ]);

    runtime.operations = [];
    runtime.gObjectEvents[0].heldMovementFinished = true;
    task.data[1] = DIR_EAST;
    PlayerAvatar_SecretBaseMatSpinStep3(runtime, task, runtime.gObjectEvents[0]);
    expect(runtime.operations).toEqual([
      `ObjectEventSetHeldMovement:${GetWalkSlowerMovementAction(GetOppositeDirection(DIR_EAST))}`,
      `QuestLogRecordPlayerStepWithDuration:${GetWalkSlowerMovementAction(GetOppositeDirection(DIR_EAST))}:0`,
      'UnlockPlayerFieldControls'
    ]);
    expect(runtime.gPlayerAvatar.preventStep).toBe(false);
    expect(task.destroyed).toBe(true);

    const created = DoPlayerMatSpin(createFieldPlayerAvatarRuntime());
    expect(created.func).toBe('PlayerAvatar_DoSecretBaseMatSpin');
  });

  it('stop surfing setup clears surf flag, optionally changes music, and initializes jump-special movement', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: {
        flags: PLAYER_AVATAR_FLAG_SURFING,
        spriteId: 0,
        objectEventId: 0,
        gender: FEMALE,
        transitionFlags: 0,
        runningState: NOT_MOVING,
        tileTransitionState: T_NOT_MOVING,
        preventStep: false
      },
      gObjectEvents: [
        createFieldObjectEvent({
          spriteId: 0,
          fieldEffectSpriteId: 1
        })
      ],
      gSprites: [
        { data: [0, 0, 7], animNum: 0, invisible: false, x2: 0, y2: 0 },
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 }
      ]
    });

    const task = CreateStopSurfingTask(runtime, DIR_WEST);

    expect(runtime.gPlayerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_ON_FOOT);
    expect(runtime.gPlayerAvatar.preventStep).toBe(true);
    expect(task.data[0]).toBe(DIR_WEST);
    expect(task.func).toBe('Task_WaitStopSurfing');
    expect(GetJumpSpecialWithEffectMovementAction(DIR_WEST)).toBe(MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_LEFT);
    expect(runtime.gObjectEvents[0].movementActionId).toBe(MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_LEFT);
    expect(runtime.operations).toEqual([
      'LockPlayerFieldControls',
      'FreezeObjectEvents',
      'Overworld_ClearSavedMusic',
      'Overworld_ChangeMusicToDefault',
      `SetSurfBlob_BobState:1:${BOB_MON_ONLY}`,
      `ObjectEventSetHeldMovement:${MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_LEFT}`,
      `QuestLogRecordPlayerStepWithDuration:${MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_LEFT}:0`
    ]);

    const noMusic = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: { ...runtime.gPlayerAvatar, flags: PLAYER_AVATAR_FLAG_SURFING, preventStep: false },
      gObjectEvents: [createFieldObjectEvent({ spriteId: 0, fieldEffectSpriteId: 1 })],
      gSprites: [
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 },
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 }
      ]
    });
    CreateStopSurfingTask_NoMusicChange(noMusic, DIR_NORTH);
    expect(noMusic.operations.slice(0, 2)).toEqual(['LockPlayerFieldControls', 'FreezeObjectEvents']);
    expect(noMusic.operations).not.toContain('Overworld_ClearSavedMusic');
    expect(noMusic.operations).not.toContain('Overworld_ChangeMusicToDefault');
  });

  it('Task_StopSurfingInit waits while overridden movement is unfinished, then enters wait state', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [
        createFieldObjectEvent({
          spriteId: 0,
          fieldEffectSpriteId: 1,
          movementOverridden: true,
          heldMovementActive: true,
          heldMovementFinished: false
        })
      ],
      gSprites: [
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 },
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 }
      ]
    });
    const task = createFieldTask(runtime, 'Task_StopSurfingInit');
    task.data[0] = DIR_SOUTH;

    Task_StopSurfingInit(runtime, task);
    expect(task.func).toBe('Task_StopSurfingInit');
    expect(runtime.operations).toEqual([]);

    runtime.gObjectEvents[0].heldMovementFinished = true;
    runtime.gObjectEvents[0].movementOverridden = false;
    Task_StopSurfingInit(runtime, task);
    expect(task.func).toBe('Task_WaitStopSurfing');
    expect(runtime.operations).toEqual([
      `SetSurfBlob_BobState:1:${BOB_MON_ONLY}`,
      `ObjectEventSetHeldMovement:${GetJumpSpecialWithEffectMovementAction(DIR_SOUTH)}`,
      `QuestLogRecordPlayerStepWithDuration:${GetJumpSpecialWithEffectMovementAction(DIR_SOUTH)}:0`
    ]);
  });

  it('Task_WaitStopSurfing restores graphics, faces player, unlocks, destroys blob/task, and sets help context', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: {
        flags: PLAYER_AVATAR_FLAG_ON_FOOT,
        spriteId: 0,
        objectEventId: 0,
        gender: FEMALE,
        transitionFlags: 0,
        runningState: NOT_MOVING,
        tileTransitionState: T_NOT_MOVING,
        preventStep: true
      },
      gObjectEvents: [
        createFieldObjectEvent({
          spriteId: 0,
          fieldEffectSpriteId: 1,
          facingDirection: DIR_EAST,
          graphicsId: OBJ_EVENT_GFX_GREEN_SURF,
          heldMovementActive: true,
          heldMovementFinished: false
        })
      ],
      gSprites: [
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 },
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 }
      ]
    });
    const task = createFieldTask(runtime, 'Task_WaitStopSurfing');

    Task_WaitStopSurfing(runtime, task);
    expect(task.destroyed).toBe(false);
    expect(runtime.operations).toEqual([]);

    runtime.gObjectEvents[0].heldMovementFinished = true;
    Task_WaitStopSurfing(runtime, task);
    expect(runtime.gObjectEvents[0].graphicsId).toBe(OBJ_EVENT_GFX_GREEN_NORMAL);
    expect(runtime.gPlayerAvatar.preventStep).toBe(false);
    expect(runtime.gSprites[1].destroyed).toBe(true);
    expect(task.destroyed).toBe(true);
    expect(runtime.operations).toEqual([
      `ObjectEventSetGraphicsId:${OBJ_EVENT_GFX_GREEN_NORMAL}`,
      `ObjectEventSetHeldMovement:${GetFaceDirectionMovementAction(DIR_EAST)}`,
      `QuestLogRecordPlayerStepWithDuration:${GetFaceDirectionMovementAction(DIR_EAST)}:0`,
      'UnlockPlayerFieldControls',
      'UnfreezeObjectEvents',
      'DestroySprite:1',
      'SetHelpContextForMap'
    ]);
  });

  it('StartFishing creates a fishing task, runs Fishing1, and records successful quest-log fish action', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      questLogFishActionSuccessful: true
    });

    const task = StartFishing(runtime, 2);

    expect(task.func).toBe('Task_Fishing');
    expect(task.data[0]).toBe(1);
    expect(task.data[15]).toBe(2);
    expect(runtime.gPlayerAvatar.preventStep).toBe(true);
    expect(runtime.operations).toEqual([
      'LockPlayerFieldControls',
      `QuestLogTryRecordPlayerAvatarGfxTransition:${QL_PLAYER_GFX_FISH}`,
      'QL_AfterRecordFishActionSuccessful'
    ]);
  });

  it('Fishing1 and Fishing2 preserve task data, random min rounds, player gfx, held clear, and fish anim side effects', () => {
    const randoms = [5];
    const runtime = createFieldPlayerAvatarRuntime({
      random: () => randoms.shift() ?? 0,
      gPlayerAvatar: {
        flags: 0,
        spriteId: 0,
        objectEventId: 0,
        gender: MALE,
        transitionFlags: 0,
        runningState: NOT_MOVING,
        tileTransitionState: T_NOT_MOVING,
        preventStep: false
      },
      gObjectEvents: [
        createFieldObjectEvent({
          spriteId: 0,
          graphicsId: OBJ_EVENT_GFX_RED_BIKE,
          enableAnim: false,
          heldMovementActive: true,
          heldMovementFinished: false,
          movementActionId: MOVEMENT_ACTION_WALK_NORMAL_DOWN
        })
      ],
      gSprites: [{ data: [0, 7, 8], animNum: 0, invisible: false, x2: 0, y2: 0 }]
    });
    const task = createFieldTask(runtime, 'Task_Fishing');
    task.data[15] = 2;

    expect(Fishing1(runtime, task)).toBe(false);
    expect(task.data[0]).toBe(1);
    expect(runtime.gPlayerAvatar.preventStep).toBe(true);

    expect(Fishing2(runtime, task)).toBe(false);
    expect(task.data[0]).toBe(2);
    expect(task.data[12]).toBe(0);
    expect(task.data[13]).toBe(1 + (5 % 6));
    expect(task.data[14]).toBe(OBJ_EVENT_GFX_RED_BIKE);
    expect(runtime.gObjectEvents[0]).toMatchObject({
      enableAnim: true,
      heldMovementActive: false,
      heldMovementFinished: false,
      movementActionId: MOVEMENT_ACTION_NONE
    });
    expect(runtime.gSprites[0].data.slice(1, 3)).toEqual([0, 0]);
    expect(runtime.operations).toEqual([
      'LockPlayerFieldControls',
      `QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_FISH}`
    ]);
  });

  it('Fishing3 waits 60 frames while aligning animation before advancing', () => {
    const runtime = createFieldPlayerAvatarRuntime();
    const task = createFieldTask(runtime, 'Task_Fishing');
    task.data[0] = 2;

    for (let i = 0; i < 59; i++)
      Fishing3(runtime, task);
    expect(task.data[0]).toBe(2);
    expect(task.data[1]).toBe(59);

    Fishing3(runtime, task);
    expect(task.data[0]).toBe(FISHING_START_ROUND);
    expect(task.data[1]).toBe(60);
    expect(runtime.operations).toHaveLength(60);
    expect(runtime.operations.every((entry) => entry === 'AlignFishingAnimationFrames')).toBe(true);
  });

  it('Fishing4 initializes dot round from random and immediately falls through to Fishing5 in Task_Fishing', () => {
    const runtime = createFieldPlayerAvatarRuntime({ random: () => 9 });
    const task = createFieldTask(runtime, 'Task_Fishing');
    task.data[0] = FISHING_START_ROUND;
    task.data[1] = 99;
    task.data[2] = 7;
    task.data[12] = 0;

    Task_Fishing(runtime, task);

    expect(task.data[0]).toBe(4);
    expect(task.data[1]).toBe(1);
    expect(task.data[2]).toBe(0);
    expect(task.data[3]).toBe(10);
    expect(runtime.operations).toEqual([
      'LoadMessageBoxAndFrameGfx:0:true',
      'AlignFishingAnimationFrames'
    ]);
  });

  it('Fishing5 prints dots every 20 frames, then advances one or two steps based on rounds played', () => {
    const runtime = createFieldPlayerAvatarRuntime();
    const task = createFieldTask(runtime, 'Task_Fishing');
    task.data[0] = 4;
    task.data[2] = 0;
    task.data[3] = 2;
    task.data[12] = 0;

    for (let i = 0; i < 20; i++)
      Fishing5(runtime, task);
    expect(task.data[1]).toBe(0);
    expect(task.data[2]).toBe(1);
    expect(task.data[0]).toBe(4);
    expect(runtime.operations.at(-1)).toBe('AddTextPrinterParameterized:0:FONT_NORMAL:dot:0:1:0');

    for (let i = 0; i < 20; i++)
      Fishing5(runtime, task);
    expect(task.data[2]).toBe(2);
    expect(task.data[0]).toBe(4);

    for (let i = 0; i < 20; i++)
      Fishing5(runtime, task);
    expect(task.data[0]).toBe(5);
    expect(task.data[12]).toBe(1);

    task.data[0] = 4;
    task.data[1] = 19;
    task.data[2] = 1;
    task.data[3] = 1;
    Fishing5(runtime, task);
    expect(task.data[0]).toBe(6);
    expect(task.data[12]).toBe(2);
  });

  it('Fishing6 advances to no-bite when the map has no fishing mons or Random is odd', () => {
    const noMonsRuntime = createFieldPlayerAvatarRuntime({ doesCurrentMapHaveFishingMons: false });
    const noMonsTask = createFieldTask(noMonsRuntime, 'Task_Fishing');
    noMonsTask.data[0] = 5;

    expect(Fishing6(noMonsRuntime, noMonsTask)).toBe(true);
    expect(noMonsTask.data[0]).toBe(FISHING_NO_BITE);
    expect(noMonsRuntime.operations).toEqual(['AlignFishingAnimationFrames']);

    const oddRandomRuntime = createFieldPlayerAvatarRuntime({ random: () => 1 });
    const oddRandomTask = createFieldTask(oddRandomRuntime, 'Task_Fishing');
    oddRandomTask.data[0] = 5;

    expect(Fishing6(oddRandomRuntime, oddRandomTask)).toBe(true);
    expect(oddRandomTask.data[0]).toBe(FISHING_NO_BITE);
    expect(oddRandomRuntime.operations).toEqual(['AlignFishingAnimationFrames']);
  });

  it('Fishing6 starts the hooked-pokemon animation and Fishing7 jumps to the on-hook text state on bite', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      random: () => 2,
      gObjectEvents: [createFieldObjectEvent({ facingDirection: DIR_EAST })]
    });
    const task = createFieldTask(runtime, 'Task_Fishing');
    task.data[0] = 5;

    expect(Fishing6(runtime, task)).toBe(true);
    expect(task.data[0]).toBe(FISHING_GOT_BITE);
    expect(runtime.gSprites[0].animNum).toBe(ANIM_HOOKED_POKEMON_EAST);
    expect(runtime.operations).toEqual([
      'AlignFishingAnimationFrames',
      `StartSpriteAnim:${ANIM_HOOKED_POKEMON_EAST}`
    ]);

    expect(Fishing7(runtime, task)).toBe(false);
    expect(task.data[0]).toBe(FISHING_ON_HOOK);
  });

  it('Fishing8 waits for A or the rod-specific timeout before advancing', () => {
    const runtime = createFieldPlayerAvatarRuntime();
    const task = createFieldTask(runtime, 'Task_Fishing');
    task.data[0] = 7;
    task.data[15] = 1;

    for (let i = 0; i < 31; i++)
      Fishing8(runtime, task);
    expect(task.data[0]).toBe(7);
    expect(task.data[1]).toBe(31);

    runtime.newKeys = A_BUTTON;
    Fishing8(runtime, task);
    expect(task.data[0]).toBe(8);

    const timeoutTask = createFieldTask(runtime, 'Task_Fishing');
    timeoutTask.data[0] = 7;
    timeoutTask.data[15] = 2;
    timeoutTask.data[1] = 29;
    runtime.newKeys = 0;
    Fishing8(runtime, timeoutTask);
    expect(timeoutTask.data[0]).toBe(FISHING_GOT_AWAY);
  });

  it('Fishing9 repeats the dot round until minimum rounds or rod probability allows progress', () => {
    const runtime = createFieldPlayerAvatarRuntime({ random: () => 9 });
    const task = createFieldTask(runtime, 'Task_Fishing');
    task.data[0] = 8;
    task.data[12] = 1;
    task.data[13] = 2;
    task.data[15] = 1;

    Fishing9(runtime, task);
    expect(task.data[0]).toBe(FISHING_START_ROUND);

    task.data[0] = 8;
    task.data[12] = 1;
    task.data[13] = 1;
    Fishing9(runtime, task);
    expect(task.data[0]).toBe(FISHING_START_ROUND);

    task.data[0] = 8;
    task.data[12] = 2;
    Fishing9(runtime, task);
    expect(task.data[0]).toBe(9);
  });

  it('Fishing10 and Fishing11 show on-hook text, restore player graphics, and start the encounter', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: {
        flags: PLAYER_AVATAR_FLAG_SURFING,
        spriteId: 0,
        objectEventId: 0,
        gender: MALE,
        transitionFlags: 0,
        runningState: NOT_MOVING,
        tileTransitionState: T_NOT_MOVING,
        preventStep: true
      },
      gObjectEvents: [
        createFieldObjectEvent({
          graphicsId: OBJ_EVENT_GFX_RED_FISH,
          movementDirection: DIR_WEST,
          fieldEffectSpriteId: 1
        })
      ],
      gSprites: [
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 6, y2: 7 },
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 8, y2: 9 }
      ]
    });
    const task = createFieldTask(runtime, 'Task_Fishing');
    task.data[0] = 9;
    task.data[14] = OBJ_EVENT_GFX_RED_NORMAL;
    task.data[15] = 2;

    Fishing10(runtime, task);
    expect(task.data[0]).toBe(10);
    expect(task.data[1]).toBe(0);

    Fishing11(runtime, task);
    expect(task.data[1]).toBe(1);
    expect(runtime.gObjectEvents[0]).toMatchObject({
      graphicsId: OBJ_EVENT_GFX_RED_NORMAL,
      facingDirection: DIR_WEST
    });
    expect(runtime.gSprites[0]).toMatchObject({ x2: 0, y2: 0 });
    expect(runtime.gSprites[1]).toMatchObject({ x2: 0, y2: 0 });
    expect(task.destroyed).toBe(false);

    Fishing11(runtime, task);
    expect(runtime.gPlayerAvatar.preventStep).toBe(false);
    expect(runtime.fishingWildEncounterRod).toBe(2);
    expect(task.destroyed).toBe(true);
    expect(runtime.operations).toContain('FishingWildEncounter:2');
  });

  it('Fishing12 through Fishing16 show no-catch results, restore the avatar after anim end, and cleanup', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [createFieldObjectEvent({ facingDirection: DIR_SOUTH, movementDirection: DIR_NORTH })]
    });
    const task = createFieldTask(runtime, 'Task_Fishing');
    task.data[0] = FISHING_NO_BITE;
    task.data[14] = OBJ_EVENT_GFX_GREEN_NORMAL;

    expect(Fishing12(runtime, task)).toBe(true);
    expect(task.data[0]).toBe(FISHING_SHOW_RESULT);
    expect(runtime.gSprites[0].animNum).toBe(ANIM_PUT_AWAY_ROD_SOUTH);

    task.data[0] = FISHING_GOT_AWAY;
    expect(Fishing13(runtime, task)).toBe(true);
    expect(task.data[0]).toBe(FISHING_SHOW_RESULT);

    expect(Fishing14(runtime, task)).toBe(false);
    expect(task.data[0]).toBe(14);

    runtime.gSprites[0].animEnded = false;
    Fishing15(runtime, task);
    expect(task.data[0]).toBe(14);

    runtime.gSprites[0].animEnded = true;
    Fishing15(runtime, task);
    expect(task.data[0]).toBe(15);
    expect(runtime.gObjectEvents[0]).toMatchObject({
      graphicsId: OBJ_EVENT_GFX_GREEN_NORMAL,
      facingDirection: DIR_NORTH
    });

    Fishing16(runtime, task);
    expect(runtime.gPlayerAvatar.preventStep).toBe(false);
    expect(task.destroyed).toBe(true);
    expect(runtime.operations.slice(-5)).toEqual([
      'RunTextPrinters',
      'IsTextPrinterActive:0',
      'UnlockPlayerFieldControls',
      'UnfreezeObjectEvents',
      'ClearDialogWindowAndFrame:0:true'
    ]);
  });

  it('graphics lookup tables exactly match field_player_avatar.c', () => {
    expect(GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_NORMAL, MALE)).toBe(OBJ_EVENT_GFX_RED_NORMAL);
    expect(GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_NORMAL, FEMALE)).toBe(OBJ_EVENT_GFX_GREEN_NORMAL);
    expect(GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_BIKE, MALE)).toBe(OBJ_EVENT_GFX_RED_BIKE);
    expect(GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_BIKE, FEMALE)).toBe(OBJ_EVENT_GFX_GREEN_BIKE);
    expect(GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_RIDE, MALE)).toBe(OBJ_EVENT_GFX_RED_SURF);
    expect(GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_RIDE, FEMALE)).toBe(OBJ_EVENT_GFX_GREEN_SURF);
    expect(GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_FIELD_MOVE, MALE)).toBe(OBJ_EVENT_GFX_RED_FIELD_MOVE);
    expect(GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_FIELD_MOVE, FEMALE)).toBe(OBJ_EVENT_GFX_GREEN_FIELD_MOVE);
    expect(GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_FISH, MALE)).toBe(OBJ_EVENT_GFX_RED_FISH);
    expect(GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_FISH, FEMALE)).toBe(OBJ_EVENT_GFX_GREEN_FISH);
    expect(GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_VSSEEKER, MALE)).toBe(OBJ_EVENT_GFX_RED_VS_SEEKER);
    expect(GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_VSSEEKER, FEMALE)).toBe(OBJ_EVENT_GFX_GREEN_VS_SEEKER);
    expect(GetRivalAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_FISH, FEMALE)).toBe(OBJ_EVENT_GFX_GREEN_FISH);
    expect(GetRSAvatarGraphicsIdByGender(MALE)).toBe(OBJ_EVENT_GFX_RS_BRENDAN);
    expect(GetRSAvatarGraphicsIdByGender(FEMALE)).toBe(OBJ_EVENT_GFX_RS_MAY);
  });

  it('gender by graphics id returns female only for the five C cases, defaulting to male', () => {
    expect(GetPlayerAvatarGenderByGraphicsId(OBJ_EVENT_GFX_GREEN_NORMAL)).toBe(FEMALE);
    expect(GetPlayerAvatarGenderByGraphicsId(OBJ_EVENT_GFX_GREEN_BIKE)).toBe(FEMALE);
    expect(GetPlayerAvatarGenderByGraphicsId(OBJ_EVENT_GFX_GREEN_SURF)).toBe(FEMALE);
    expect(GetPlayerAvatarGenderByGraphicsId(OBJ_EVENT_GFX_GREEN_FIELD_MOVE)).toBe(FEMALE);
    expect(GetPlayerAvatarGenderByGraphicsId(OBJ_EVENT_GFX_GREEN_FISH)).toBe(FEMALE);
    expect(GetPlayerAvatarGenderByGraphicsId(OBJ_EVENT_GFX_GREEN_VS_SEEKER)).toBe(MALE);
    expect(GetPlayerAvatarGenderByGraphicsId(255)).toBe(MALE);
  });

  it('state transition table and current-state lookup preserve order and fallbacks', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: {
        flags: PLAYER_AVATAR_FLAG_SURFING | PLAYER_AVATAR_FLAG_MACH_BIKE,
        spriteId: 0,
        objectEventId: 0,
        gender: FEMALE,
        transitionFlags: 0,
        runningState: NOT_MOVING,
        tileTransitionState: T_NOT_MOVING,
        preventStep: false
      }
    });

    expect(GetPlayerAvatarStateTransitionByGraphicsId(OBJ_EVENT_GFX_GREEN_BIKE, FEMALE)).toBe(PLAYER_AVATAR_FLAG_MACH_BIKE);
    expect(GetPlayerAvatarStateTransitionByGraphicsId(OBJ_EVENT_GFX_RED_SURF, MALE)).toBe(PLAYER_AVATAR_FLAG_SURFING);
    expect(GetPlayerAvatarStateTransitionByGraphicsId(OBJ_EVENT_GFX_RED_FIELD_MOVE, MALE)).toBe(PLAYER_AVATAR_FLAG_ON_FOOT);
    expect(GetPlayerAvatarGraphicsIdByCurrentState(runtime)).toBe(OBJ_EVENT_GFX_GREEN_BIKE);
    expect(GetPlayerAvatarGraphicsIdByStateId(runtime, PLAYER_AVATAR_GFX_RIDE)).toBe(OBJ_EVENT_GFX_GREEN_SURF);

    runtime.gPlayerAvatar.flags = PLAYER_AVATAR_FLAG_ACRO_BIKE;
    expect(GetPlayerAvatarGraphicsIdByCurrentState(runtime)).toBe(0);

    SetPlayerAvatarExtraStateTransition(runtime, OBJ_EVENT_GFX_GREEN_SURF, PLAYER_AVATAR_FLAG_CONTROLLABLE);
    expect(runtime.gPlayerAvatar.transitionFlags).toBe(0);
    expect(runtime.gPlayerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_ACRO_BIKE | PLAYER_AVATAR_FLAG_CONTROLLABLE);
    expect(runtime.operations).toEqual([
      `QuestLogTryRecordPlayerAvatarGfxTransition:${QL_PLAYER_GFX_SURF}`,
      `QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_SURF}`
    ]);
  });

  it('surf helpers stop at empty party slots and ignore surf while already surfing', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: {
        flags: 0,
        spriteId: 0,
        objectEventId: 0,
        gender: MALE,
        transitionFlags: 0,
        runningState: NOT_MOVING,
        tileTransitionState: T_NOT_MOVING,
        preventStep: false
      },
      gObjectEvents: [
        createFieldObjectEvent({
          movementDirection: DIR_NORTH
        })
      ],
      gPlayerParty: [
        { species: 1, moves: [1, 2, 3, 4] },
        { species: SPECIES_NONE, moves: [MOVE_SURF] },
        { species: 2, moves: [MOVE_SURF] }
      ]
    });

    expect(PARTY_SIZE).toBe(6);
    expect(PartyHasMonWithSurf(runtime)).toBe(false);
    runtime.gPlayerParty[1] = { species: 25, moves: [MOVE_SURF] };
    expect(PartyHasMonWithSurf(runtime)).toBe(true);
    expect(IsPlayerSurfingNorth(runtime)).toBe(false);

    runtime.gPlayerAvatar.flags = PLAYER_AVATAR_FLAG_SURFING;
    expect(PartyHasMonWithSurf(runtime)).toBe(false);
    expect(IsPlayerSurfingNorth(runtime)).toBe(true);
  });

  it('runs transition flags immediately, in bit order, clears them, and records C side effects', () => {
    const runtime = createFieldPlayerAvatarRuntime();

    PlayerAvatarTransition_Normal(runtime);
    PlayerAvatarTransition_Bike(runtime);
    PlayerAvatarTransition_Surfing(runtime);
    PlayerAvatarTransition_ReturnToField(runtime);
    expect(runtime.operations).toEqual([
      `QuestLogTryRecordPlayerAvatarGfxTransition:${QL_PLAYER_GFX_NORMAL}`,
      `QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_NORMAL}`,
      `QuestLogTryRecordPlayerAvatarGfxTransition:${QL_PLAYER_GFX_BIKE}`,
      `QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_BIKE}`,
      'BikeClearState:0:0',
      `QuestLogTryRecordPlayerAvatarGfxTransition:${QL_PLAYER_GFX_SURF}`,
      `QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_SURF}`
    ]);
    expect(runtime.gPlayerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_CONTROLLABLE);

    runtime.operations = [];
    runtime.gPlayerAvatar.flags = 0;
    SetPlayerAvatarTransitionFlags(
      runtime,
      PLAYER_AVATAR_FLAG_ON_FOOT | PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_SURFING | PLAYER_AVATAR_FLAG_CONTROLLABLE
    );
    expect(runtime.gPlayerAvatar.transitionFlags).toBe(0);
    expect(runtime.gPlayerAvatar.flags).toBe(PLAYER_AVATAR_FLAG_CONTROLLABLE);
    expect(runtime.operations).toEqual([
      `QuestLogTryRecordPlayerAvatarGfxTransition:${QL_PLAYER_GFX_NORMAL}`,
      `QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_NORMAL}`,
      `QuestLogTryRecordPlayerAvatarGfxTransition:${QL_PLAYER_GFX_BIKE}`,
      `QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_BIKE}`,
      'BikeClearState:0:0',
      `QuestLogTryRecordPlayerAvatarGfxTransition:${QL_PLAYER_GFX_SURF}`,
      `QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_SURF}`
    ]);

    runtime.gPlayerAvatar.transitionFlags = PLAYER_AVATAR_FLAG_FORCED | PLAYER_AVATAR_FLAG_DASH;
    runtime.operations = [];
    DoPlayerAvatarTransition(runtime);
    expect(runtime.gPlayerAvatar.transitionFlags).toBe(0);
    expect(runtime.operations).toEqual([]);
  });

  it('initializes player avatar and adjacent graphics helpers like field_player_avatar.c', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gObjectEvents: [],
      gSprites: []
    });

    InitPlayerAvatar(runtime, 20, 30, DIR_WEST, FEMALE);
    expect(runtime.gPlayerAvatar).toMatchObject({
      flags: PLAYER_AVATAR_FLAG_CONTROLLABLE | PLAYER_AVATAR_FLAG_ON_FOOT,
      spriteId: 0,
      objectEventId: 0,
      gender: FEMALE,
      transitionFlags: 0,
      runningState: NOT_MOVING,
      tileTransitionState: T_NOT_MOVING
    });
    expect(runtime.gObjectEvents[0]).toMatchObject({
      currentCoords: { x: 13, y: 23 },
      facingDirection: DIR_WEST,
      movementDirection: DIR_WEST,
      graphicsId: OBJ_EVENT_GFX_GREEN_NORMAL,
      isPlayer: true,
      warpArrowSpriteId: 1,
      spriteId: 0
    });

    StartPlayerAvatarSummonMonForFieldMoveAnim(runtime);
    expect(runtime.gObjectEvents[0].graphicsId).toBe(OBJ_EVENT_GFX_GREEN_FIELD_MOVE);
    expect(runtime.gSprites[0].animNum).toBe(ANIM_FIELD_MOVE);

    expect(GetPlayerAvatarVsSeekerGfxId(runtime)).toBe(OBJ_EVENT_GFX_GREEN_VS_SEEKER);
    runtime.gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_MACH_BIKE;
    expect(GetPlayerAvatarVsSeekerGfxId(runtime)).toBe(OBJ_EVENT_GFX_GREEN_VS_SEEKER_BIKE);
    StartPlayerAvatarVsSeekerAnim(runtime);
    expect(runtime.gObjectEvents[0].graphicsId).toBe(OBJ_EVENT_GFX_GREEN_VS_SEEKER_BIKE);
    expect(runtime.gSprites[0].animNum).toBe(ANIM_VS_SEEKER);

    runtime.gPlayerAvatar.gender = MALE;
    expect(GetPlayerAvatarVsSeekerGfxId(runtime)).toBe(OBJ_EVENT_GFX_RED_VS_SEEKER_BIKE);
  });

  it('sets player invisibility, surf blob invisibility, and fish quest-log sprite update side effects', () => {
    const runtime = createFieldPlayerAvatarRuntime({
      gPlayerAvatar: {
        flags: PLAYER_AVATAR_FLAG_SURFING,
        spriteId: 0,
        objectEventId: 0,
        gender: MALE,
        transitionFlags: 0,
        runningState: NOT_MOVING,
        tileTransitionState: T_NOT_MOVING,
        preventStep: false
      },
      gObjectEvents: [
        createFieldObjectEvent({
          fieldEffectSpriteId: 1
        })
      ],
      gSprites: [
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 },
        { data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 }
      ]
    });

    SetPlayerInvisibility(runtime, true);
    expect(runtime.gObjectEvents[0].invisible).toBe(true);
    expect(runtime.gSprites[1].invisible).toBe(true);

    runtime.gPlayerAvatar.flags = 0;
    SetPlayerInvisibility(runtime, false);
    expect(runtime.gObjectEvents[0].invisible).toBe(false);
    expect(runtime.gSprites[1].invisible).toBe(true);

    StartPlayerAvatarFishAnim(runtime);
    expect(runtime.operations).toEqual([`QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_FISH}`]);
  });
});
