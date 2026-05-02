import { describe, expect, test } from 'vitest';
import {
  PLAYER_SPEED_FAST,
  PLAYER_SPEED_FASTEST,
  PLAYER_SPEED_FASTER,
  PLAYER_SPEED_NORMAL,
  PLAYER_SPEED_STANDING,
  bikeClearState,
  bikeUpdateBikeCounterSpeed,
  canProcessFieldButtons,
  canProcessFieldInteractionInput,
  canProcessPlayerMovementInput,
  canProcessStartMenuInput,
  checkMovementInputNotOnBike,
  createPlayer,
  getForcedMovementInstruction,
  getPlayerSpeed,
  getPlayerTilePosition,
  hasPendingForcedMovement,
  isBikingDisallowedByPlayer,
  metatileBehaviorForbidsBiking,
  playerIsMovingOnRockStairs,
  playerNotOnBikeMoving,
  playerNotOnBikeNotMoving,
  playerNotOnBikeTurningInPlace,
  shouldRunNormalStepSideEffects,
  stepPlayer
} from '../src/game/player';
import { evaluateFieldCollision } from '../src/game/fieldCollision';
import {
  PLAYER_AVATAR_FLAG_ACRO_BIKE,
  PLAYER_AVATAR_FLAG_CONTROLLABLE,
  PLAYER_AVATAR_FLAG_DASH,
  PLAYER_AVATAR_FLAG_FORCED,
  PLAYER_AVATAR_FLAG_MACH_BIKE,
  PLAYER_AVATAR_FLAG_ON_FOOT,
  PLAYER_AVATAR_FLAG_SURFING,
  PLAYER_AVATAR_FLAG_UNDERWATER,
  forcePlayerOntoMachBike,
  forcePlayerToStartSurfing,
  getAdjustedInitialDirection,
  getAdjustedInitialTransitionFlags,
  getInitialPlayerAvatarState,
  getPlayerAvatarGraphicsIdByCurrentState,
  getPlayerAvatarFlags,
  initPlayerAvatar,
  resetPlayerAvatarState,
  setPlayerAvatarStateMask,
  setPlayerAvatarTransitionFlags
} from '../src/game/playerAvatarTransition';
import { loadViridianCityPokemonCenter1FMap } from '../src/world/mapSource';
import type { TileMap } from '../src/world/tileMap';

const idleInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  upPressed: false,
  downPressed: false,
  leftPressed: false,
  rightPressed: false,
  run: false,
  interact: false,
  interactPressed: false,
  start: false,
  startPressed: false,
  cancel: false,
  cancelPressed: false
};

describe('player stepping', () => {
  const openMap: TileMap = {
    id: 'open-map',
    width: 12,
    height: 12,
    tileSize: 16,
    allowRunning: true,
    walkable: Array.from({ length: 12 * 12 }, () => true),
    connections: [],
    triggers: [],
    npcs: [],
    warps: []
  };

  test('player avatar transitions use decomp-style flag application order', () => {
    const player = createPlayer();

    expect(getPlayerAvatarFlags(player)).toBe(PLAYER_AVATAR_FLAG_ON_FOOT | PLAYER_AVATAR_FLAG_CONTROLLABLE);

    setPlayerAvatarTransitionFlags(player, PLAYER_AVATAR_FLAG_ACRO_BIKE);
    expect(player.avatarMode).toBe('machBike');
    expect(player.avatarGraphicsMode).toBe('bike');
    expect(getPlayerAvatarFlags(player)).toBe(PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_CONTROLLABLE);
    expect(player.avatarTransitionFlags).toBe(0);

    forcePlayerToStartSurfing(player);
    expect(player.avatarMode).toBe('surfing');
    expect(player.avatarGraphicsMode).toBe('surf');
    expect(getPlayerAvatarFlags(player)).toBe(PLAYER_AVATAR_FLAG_SURFING | PLAYER_AVATAR_FLAG_CONTROLLABLE);

    setPlayerAvatarTransitionFlags(player, PLAYER_AVATAR_FLAG_UNDERWATER);
    expect(player.avatarMode).toBe('surfing');
    expect(player.avatarGraphicsMode).toBe('surf');
    expect(getPlayerAvatarFlags(player)).toBe(PLAYER_AVATAR_FLAG_SURFING | PLAYER_AVATAR_FLAG_CONTROLLABLE);

    setPlayerAvatarTransitionFlags(player, PLAYER_AVATAR_FLAG_SURFING);
    forcePlayerOntoMachBike(player);
    expect(player.avatarMode).toBe('surfing');

    resetPlayerAvatarState(player);
    forcePlayerOntoMachBike(player);
    expect(player.avatarMode).toBe('machBike');
    expect(getPlayerAvatarFlags(player)).toBe(PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_CONTROLLABLE);
  });

  test('SetPlayerAvatarStateMask preserves only dash, forced, and controllable bits', () => {
    const player = createPlayer();
    player.avatarFlags = PLAYER_AVATAR_FLAG_SURFING
      | PLAYER_AVATAR_FLAG_DASH
      | PLAYER_AVATAR_FLAG_FORCED
      | PLAYER_AVATAR_FLAG_CONTROLLABLE;

    setPlayerAvatarStateMask(player, PLAYER_AVATAR_FLAG_ON_FOOT);

    expect(getPlayerAvatarFlags(player)).toBe(
      PLAYER_AVATAR_FLAG_ON_FOOT
      | PLAYER_AVATAR_FLAG_DASH
      | PLAYER_AVATAR_FLAG_FORCED
      | PLAYER_AVATAR_FLAG_CONTROLLABLE
    );
    expect(player.avatarMode).toBe('normal');
    expect(player.avatarGraphicsMode).toBe('normal');
  });

  test('initial player avatar state adjusts flags and direction like overworld.c', () => {
    const stored = {
      direction: 'left' as const,
      transitionFlags: PLAYER_AVATAR_FLAG_MACH_BIKE,
      hasDirectionSet: false
    };

    expect(getAdjustedInitialTransitionFlags(stored, 0x12, 'MAP_TYPE_ROUTE')).toBe(PLAYER_AVATAR_FLAG_SURFING);
    expect(getAdjustedInitialTransitionFlags(stored, 0x00, 'MAP_TYPE_ROUTE', { bikingAllowed: false }))
      .toBe(PLAYER_AVATAR_FLAG_ON_FOOT);
    expect(getAdjustedInitialTransitionFlags(stored, 0x00, 'MAP_TYPE_ROUTE'))
      .toBe(PLAYER_AVATAR_FLAG_MACH_BIKE);
    expect(getAdjustedInitialTransitionFlags(stored, 0x00, 'MAP_TYPE_ROUTE', { cruiseMode: true }))
      .toBe(PLAYER_AVATAR_FLAG_ON_FOOT);
    expect(getAdjustedInitialTransitionFlags(stored, 0x12, 'MAP_TYPE_ROUTE', { seafoamSurfable: true }))
      .toBe(PLAYER_AVATAR_FLAG_ON_FOOT);

    expect(getAdjustedInitialDirection(stored, PLAYER_AVATAR_FLAG_ON_FOOT, 0x65, 'MAP_TYPE_ROUTE')).toBe('up');
    expect(getAdjustedInitialDirection(stored, PLAYER_AVATAR_FLAG_ON_FOOT, 0x62, 'MAP_TYPE_ROUTE')).toBe('left');
    expect(getAdjustedInitialDirection(stored, PLAYER_AVATAR_FLAG_ON_FOOT, 0x6c, 'MAP_TYPE_ROUTE')).toBe('left');
    expect(getAdjustedInitialDirection(stored, PLAYER_AVATAR_FLAG_ON_FOOT, 0x6d, 'MAP_TYPE_ROUTE')).toBe('right');

    const surfToUnderwater = {
      direction: 'left' as const,
      transitionFlags: PLAYER_AVATAR_FLAG_SURFING,
      hasDirectionSet: false
    };
    expect(getAdjustedInitialDirection(
      surfToUnderwater,
      PLAYER_AVATAR_FLAG_UNDERWATER,
      0x00,
      'MAP_TYPE_UNDERWATER'
    )).toBe('left');

    expect(getInitialPlayerAvatarState(stored, 0x12, 'MAP_TYPE_ROUTE')).toEqual({
      direction: 'down',
      transitionFlags: PLAYER_AVATAR_FLAG_SURFING,
      hasDirectionSet: false
    });
  });

  test('InitPlayerAvatar clears prior state and installs controllable on-foot graphics by gender', () => {
    const player = createPlayer();
    player.avatarFlags = PLAYER_AVATAR_FLAG_SURFING | PLAYER_AVATAR_FLAG_FORCED;
    player.avatarTransitionFlags = PLAYER_AVATAR_FLAG_MACH_BIKE;
    player.avatarQuestLogTransitions = [99];

    initPlayerAvatar(player, 10, 12, 'left', 'female');

    expect(player.currentTile).toEqual({ x: 3, y: 5 });
    expect(player.previousTile).toEqual({ x: 3, y: 5 });
    expect(player.facing).toBe('left');
    expect(getPlayerAvatarFlags(player)).toBe(PLAYER_AVATAR_FLAG_ON_FOOT | PLAYER_AVATAR_FLAG_CONTROLLABLE);
    expect(getPlayerAvatarGraphicsIdByCurrentState(player)).toBe('OBJ_EVENT_GFX_GREEN_NORMAL');
    expect(player.avatarObjectGraphicsId).toBe('OBJ_EVENT_GFX_GREEN_NORMAL');
    expect(player.avatarTransitionFlags).toBe(0);
  });

  const blockedRowMap: TileMap = {
    id: 'blocked-row',
    width: 12,
    height: 12,
    tileSize: 16,
    allowRunning: true,
    walkable: Array.from({ length: 12 * 12 }, (_, index) => Math.floor(index / 12) !== 5),
    connections: [],
    triggers: [],
    npcs: [],
    warps: []
  };

  const cyclingRoadMap: TileMap = {
    id: 'cycling-road',
    width: 12,
    height: 12,
    tileSize: 16,
    allowRunning: true,
    walkable: Array.from({ length: 12 * 12 }, () => true),
    tileBehaviors: Array.from({ length: 12 * 12 }, () => 0),
    connections: [],
    triggers: [],
    npcs: [],
    warps: []
  };
  cyclingRoadMap.tileBehaviors![3 * cyclingRoadMap.width + 3] = 0xd0;

  const forcedWalkSouthMap: TileMap = {
    ...openMap,
    id: 'forced-walk-south',
    tileBehaviors: Array.from({ length: 12 * 12 }, () => 0)
  };
  forcedWalkSouthMap.tileBehaviors![3 * forcedWalkSouthMap.width + 3] = 0x43;

  const currentMap: TileMap = {
    ...openMap,
    id: 'current-map',
    tileBehaviors: Array.from({ length: 12 * 12 }, () => 0)
  };
  currentMap.tileBehaviors![3 * currentMap.width + 3] = 0x53;

  const iceMap: TileMap = {
    ...openMap,
    id: 'ice-map',
    tileBehaviors: Array.from({ length: 12 * 12 }, () => 0x23)
  };

  const rockStairsMap: TileMap = {
    ...openMap,
    id: 'rock-stairs-map',
    tileBehaviors: Array.from({ length: 12 * 12 }, () => 0)
  };
  rockStairsMap.tileBehaviors![3 * rockStairsMap.width + 3] = 0x2a;
  rockStairsMap.tileBehaviors![4 * rockStairsMap.width + 4] = 0x2a;

  const spinRightMap: TileMap = {
    ...openMap,
    id: 'spin-right-map',
    tileBehaviors: Array.from({ length: 12 * 12 }, () => 0)
  };
  spinRightMap.tileBehaviors![3 * spinRightMap.width + 3] = 0x54;
  spinRightMap.tileBehaviors![3 * spinRightMap.width + 5] = 0x58;

  test('does not move when no direction is pressed', () => {
    const player = createPlayer();
    const startX = player.position.x;

    stepPlayer(player, idleInput, openMap, 1 / 60);

    expect(player.position.x).toBe(startX);
    expect(player.moving).toBe(false);
  });

  test('field buttons are blocked while a movement step is in progress', () => {
    const player = createPlayer();
    player.stepTarget = { x: 4 * 16, y: 3 * 16 };
    player.stepDirection = 'right';
    player.stepSpeed = 54;
    player.moving = true;
    player.runningState = 'moving';

    expect(canProcessFieldButtons(player)).toBe(false);

    player.stepTarget = undefined;
    player.stepDirection = undefined;
    player.stepSpeed = undefined;
    player.moving = false;
    player.runningState = 'notMoving';

    expect(canProcessFieldButtons(player)).toBe(true);
  });

  test('field buttons are blocked at Mach Bike fastest speed like field_control_avatar.c', () => {
    const player = createPlayer();
    player.avatarMode = 'machBike';
    player.bikeFrameCounter = 2;
    player.moving = false;
    player.runningState = 'notMoving';

    expect(canProcessFieldButtons(player)).toBe(false);

    player.bikeFrameCounter = 1;
    expect(canProcessFieldButtons(player)).toBe(true);
  });

  test('field input gates block menu, interaction, and movement during active scripts', () => {
    const player = createPlayer();

    expect(canProcessStartMenuInput(player)).toBe(true);
    expect(canProcessFieldInteractionInput(player)).toBe(true);
    expect(canProcessPlayerMovementInput(player)).toBe(true);

    expect(canProcessStartMenuInput(player, { scriptSessionActive: true })).toBe(false);
    expect(canProcessFieldInteractionInput(player, { dialogueActive: true })).toBe(false);
    expect(canProcessPlayerMovementInput(player, { startMenuBlocking: true })).toBe(false);
    expect(canProcessPlayerMovementInput(player, { fieldControlsLocked: true })).toBe(false);
    expect(canProcessStartMenuInput(player, { pendingForcedMovement: true })).toBe(false);
  });

  test('reports pending forced movement from walk and current tiles', () => {
    const player = createPlayer();
    player.position = { x: 3 * 16, y: 3 * 16 };
    player.controllable = false;

    expect(getForcedMovementInstruction(player, forcedWalkSouthMap)).toEqual({
      direction: 'down',
      speed: 60
    });
    expect(hasPendingForcedMovement(player, forcedWalkSouthMap)).toBe(true);

    expect(getForcedMovementInstruction(player, currentMap)).toEqual({
      direction: 'down',
      speed: 120
    });
    expect(hasPendingForcedMovement(player, currentMap)).toBe(true);
  });

  test('does not force a controllable player merely standing on a forced movement tile', () => {
    const player = createPlayer();
    player.position = { x: 3 * 16, y: 3 * 16 };
    player.controllable = true;

    expect(getForcedMovementInstruction(player, forcedWalkSouthMap)).toBeNull();
    expect(hasPendingForcedMovement(player, forcedWalkSouthMap)).toBe(false);
    expect(player.controllable).toBe(true);
  });

  test('moves right and updates facing direction', () => {
    const player = createPlayer();
    player.facing = 'right';

    const result = stepPlayer(
      player,
      { ...idleInput, right: true },
      openMap,
      1 / 10
    );

    expect(result.forcedMovement).toBe(false);
    expect(player.position.x).toBeGreaterThan(3 * 16);
    expect(player.facing).toBe('right');
    expect(player.moving).toBe(true);
    expect(player.animationTime).toBeGreaterThan(0);
  });

  test('normal walking lands after 16 field frames like NpcTakeStep', () => {
    const player = createPlayer();
    player.facing = 'right';
    player.runningState = 'moving';

    for (let i = 0; i < 15; i += 1) {
      stepPlayer(player, { ...idleInput, right: true }, openMap, 1 / 60);
    }

    expect(player.position.x).toBe(3 * 16 + 15);
    expect(player.stepTarget).toEqual({ x: 4 * 16, y: 3 * 16 });
    expect(player.moving).toBe(true);

    stepPlayer(player, { ...idleInput, right: true }, openMap, 1 / 60);

    expect(player.position.x).toBe(4 * 16);
    expect(player.stepTarget).toBeUndefined();
    expect(player.moving).toBe(false);

    stepPlayer(player, { ...idleInput, right: true }, openMap, 1 / 60);

    expect(player.walkAnimationPhase).toBe(1);
  });

  test('CheckMovementInputNotOnBike mirrors the decomp not-moving, turn, and moving branches', () => {
    const player = createPlayer();
    player.facing = 'down';
    player.runningState = 'notMoving';

    expect(checkMovementInputNotOnBike(player, null)).toBe('notMoving');
    expect(player.runningState).toBe('notMoving');

    expect(checkMovementInputNotOnBike(player, 'left')).toBe('turningInPlace');
    expect(player.runningState).toBe('turnDirection');

    player.facing = 'left';
    player.runningState = 'turnDirection';
    expect(checkMovementInputNotOnBike(player, 'left')).toBe('moving');
    expect(player.runningState).toBe('moving');
  });

  test('not-on-bike branch handlers update player state like their decomp counterparts', () => {
    const player = createPlayer();
    player.moving = true;
    player.animationTime = 1;
    player.runningState = 'moving';

    playerNotOnBikeNotMoving(player);
    expect(player.facing).toBe('down');
    expect(player.runningState).toBe('notMoving');
    expect(player.moving).toBe(false);
    expect(player.animationTime).toBe(0);

    playerNotOnBikeTurningInPlace(player, 'right');
    expect(player.facing).toBe('right');
    expect(player.runningState).toBe('turnDirection');
    expect(player.moving).toBe(false);
  });

  test('PlayerIsMovingOnRockStairs checks current tile north and destination tile south like the decomp', () => {
    const player = createPlayer();
    player.position.x = 3 * 16;
    player.position.y = 3 * 16;
    player.currentTile = { x: 3, y: 3 };
    player.previousTile = { x: 3, y: 3 };

    expect(playerIsMovingOnRockStairs(player, rockStairsMap, 'up')).toBe(true);
    expect(playerIsMovingOnRockStairs(player, rockStairsMap, 'down')).toBe(false);
    expect(playerIsMovingOnRockStairs(player, rockStairsMap, 'left')).toBe(false);

    player.position.x = 4 * 16;
    player.position.y = 3 * 16;
    player.currentTile = { x: 4, y: 3 };
    player.previousTile = { x: 4, y: 3 };
    expect(playerIsMovingOnRockStairs(player, rockStairsMap, 'down')).toBe(true);
  });

  test('PlayerNotOnBikeMoving selects surf, run, and rock-stair slow actions', () => {
    const player = createPlayer();
    player.currentTile = { x: 3, y: 3 };
    player.previousTile = { x: 3, y: 3 };

    expect(playerNotOnBikeMoving(player, openMap, idleInput, 0, 'right')).toEqual({
      action: 'walkNormal',
      speed: 60
    });
    expect(playerNotOnBikeMoving(player, openMap, { ...idleInput, run: true }, 0, 'right')).toEqual({
      action: 'run',
      speed: 120
    });
    expect(playerNotOnBikeMoving(player, rockStairsMap, idleInput, 0, 'up')).toEqual({
      action: 'walkSlow',
      speed: 40
    });
    const runSlow = playerNotOnBikeMoving(player, rockStairsMap, { ...idleInput, run: true }, 0, 'up');
    expect(runSlow.action).toBe('runSlow');
    expect(runSlow.speed).toBeCloseTo(960 / 11);

    player.avatarMode = 'surfing';
    expect(playerNotOnBikeMoving(player, openMap, idleInput, 0, 'right')).toEqual({
      action: 'surf',
      speed: 120
    });
  });

  test('turns in place before walking when changing direction from rest', () => {
    const player = createPlayer();
    player.facing = 'down';

    const result = stepPlayer(
      player,
      { ...idleInput, left: true },
      openMap,
      1 / 10
    );

    expect(result.enteredNewTile).toBe(false);
    expect(player.position).toEqual({ x: 3 * 16, y: 3 * 16 });
    expect(player.facing).toBe('left');
    expect(player.moving).toBe(false);
  });

  test('prevents crossing blocked tiles', () => {
    const player = createPlayer();

    player.position.x = 9 * 16;
    player.position.y = 4.2 * 16;

    for (let i = 0; i < 30; i += 1) {
      stepPlayer(player, { ...idleInput, down: true }, blockedRowMap, 1 / 60);
    }

    expect(player.position.y).toBeLessThan(5 * 16);
    expect(player.moving).toBe(false);
  });

  test('does not nudge into blocked Pokemon Center fixtures', () => {
    const map = loadViridianCityPokemonCenter1FMap();
    const player = createPlayer();
    player.position.x = 11 * 16;
    player.position.y = 2 * 16;

    const startY = player.position.y;
    stepPlayer(player, { ...idleInput, up: true }, map, 1 / 10);

    expect(player.position.y).toBe(startY);
    expect(getPlayerTilePosition(player.position, map.tileSize)).toEqual({ x: 11, y: 2 });

    for (let i = 0; i < 30; i += 1) {
      stepPlayer(player, { ...idleInput, up: true }, map, 1 / 60);
    }

    expect(player.position.y).toBe(startY);
    expect(getPlayerTilePosition(player.position, map.tileSize)).toEqual({ x: 11, y: 2 });
  });

  test('prevents moving into entity collision callback', () => {
    const player = createPlayer();

    const startX = player.position.x;
    stepPlayer(
      player,
      { ...idleInput, right: true },
      openMap,
      1 / 10,
      () => ({
        result: 'objectEvent',
        target: {
          map: openMap,
          tile: { x: 4, y: 3 },
          viaConnection: false
        }
      })
    );

    expect(player.position.x).toBe(startX);
    expect(player.moving).toBe(false);
  });

  test('reports tile transitions only after crossing into the next tile', () => {
    const player = createPlayer();
    const startTile = getPlayerTilePosition(player.position, 16);

    player.position.x += 4;
    const sameTile = getPlayerTilePosition(player.position, 16);
    expect(sameTile).toEqual(startTile);

    player.position.x += 5;
    const nextTile = getPlayerTilePosition(player.position, 16);
    expect(nextTile.x).toBe(startTile.x + 1);
    expect(nextTile.y).toBe(startTile.y);
  });

  test('does not apply a running speed boost on maps that disallow running', () => {
    const indoorMap: TileMap = {
      ...openMap,
      id: 'indoor-map',
      allowRunning: false
    };
    const walkingPlayer = createPlayer();
    const runningPlayer = createPlayer();

    stepPlayer(
      walkingPlayer,
      { ...idleInput, right: true },
      indoorMap,
      1 / 10
    );
    stepPlayer(
      runningPlayer,
      { ...idleInput, right: true, run: true },
      indoorMap,
      1 / 10
    );

    expect(runningPlayer.position.x).toBe(walkingPlayer.position.x);
  });

  test('uses faster movement speeds for surfing and bike avatar states', () => {
    const walkingPlayer = createPlayer();
    const surfingPlayer = createPlayer();
    const acroPlayer = createPlayer();
    const machPlayer = createPlayer();

    surfingPlayer.avatarMode = 'surfing';
    acroPlayer.avatarMode = 'acroBike';
    machPlayer.avatarMode = 'machBike';

    for (const player of [walkingPlayer, surfingPlayer, acroPlayer, machPlayer]) {
      player.facing = 'right';
      player.runningState = 'moving';
    }

    stepPlayer(walkingPlayer, { ...idleInput, right: true }, openMap, 1 / 10);
    stepPlayer(surfingPlayer, { ...idleInput, right: true }, openMap, 1 / 10);
    stepPlayer(acroPlayer, { ...idleInput, right: true }, openMap, 1 / 10);
    stepPlayer(machPlayer, { ...idleInput, right: true }, openMap, 1 / 10);

    expect(surfingPlayer.position.x).toBeGreaterThan(walkingPlayer.position.x);
    expect(acroPlayer.position.x).toBeGreaterThan(surfingPlayer.position.x);
    expect(machPlayer.position.x).toBeGreaterThanOrEqual(surfingPlayer.position.x);
  });

  test('bike avatars turn in place before moving when changing direction from rest', () => {
    const player = createPlayer();
    player.avatarMode = 'machBike';
    player.facing = 'down';

    const result = stepPlayer(
      player,
      { ...idleInput, left: true },
      openMap,
      1 / 10
    );

    expect(result.enteredNewTile).toBe(false);
    expect(player.position).toEqual({ x: 3 * 16, y: 3 * 16 });
    expect(player.facing).toBe('left');
    expect(player.moving).toBe(false);
  });

  test('cycling road downhill forces bike movement south without input like the decomp', () => {
    const player = createPlayer();
    player.avatarMode = 'machBike';
    player.position.x = 3 * 16;
    player.position.y = 3 * 16;
    player.facing = 'down';

    stepPlayer(
      player,
      idleInput,
      cyclingRoadMap,
      1 / 60
    );

    expect(player.position.y).toBeGreaterThan(3 * 16);
    expect(player.facing).toBe('down');
    expect(player.moving).toBe(true);
  });

  test('bike helpers mirror decomp BikeClearState, Bike_UpdateBikeCounterSpeed, and GetPlayerSpeed', () => {
    const player = createPlayer();
    player.avatarMode = 'machBike';
    player.bikeState = 'slope';
    player.bikeNewDirectionBackup = 'left';
    player.bikeLastSpinTile = 0x57;
    player.bikeDirTimerHistory = [4, 3, 2, 1];

    bikeClearState(player, 0x1234, 0x5678);
    expect(player.bikeState).toBe('normal');
    expect(player.bikeNewDirectionBackup).toBeNull();
    expect(player.bikeFrameCounter).toBe(0);
    expect(player.bikeSpeed).toBe(PLAYER_SPEED_STANDING);
    expect(player.bikeDirectionHistory).toBe(0x1234);
    expect(player.bikeAbStartSelectHistory).toBe(0x5678);
    expect(player.bikeLastSpinTile).toBe(0);
    expect(player.bikeDirTimerHistory).toEqual([0, 0, 0, 0]);

    bikeUpdateBikeCounterSpeed(player, 2);
    expect(player.bikeFrameCounter).toBe(2);
    expect(player.bikeSpeed).toBe(3);
    expect(getPlayerSpeed(player)).toBe(PLAYER_SPEED_FASTEST);

    player.avatarMode = 'acroBike';
    expect(getPlayerSpeed(player)).toBe(PLAYER_SPEED_FASTER);
    player.avatarMode = 'normal';
    expect(getPlayerSpeed(player)).toBe(PLAYER_SPEED_NORMAL);
    player.avatarMode = 'surfing';
    expect(getPlayerSpeed(player)).toBe(PLAYER_SPEED_FAST);
  });

  test('bike collision forbids running-disallowed metatiles like GetBikeCollisionAt', () => {
    const map: TileMap = {
      ...openMap,
      id: 'bike-forbidden',
      tileBehaviors: Array.from({ length: 12 * 12 }, () => 0)
    };
    map.tileBehaviors![3 * map.width + 4] = 0x0a;

    const player = createPlayer();
    player.avatarMode = 'machBike';
    player.facing = 'right';
    player.runningState = 'moving';

    const result = stepPlayer(player, { ...idleInput, right: true }, map, 1 / 60);

    expect(metatileBehaviorForbidsBiking(0x0a)).toBe(true);
    expect(result.collision?.result).toBe('impassable');
    expect(player.position).toEqual({ x: 3 * 16, y: 3 * 16 });
    expect(isBikingDisallowedByPlayer(player, map)).toBe(false);
  });

  test('bike collision treats cracked ice as COLLISION_COUNT and moves with WalkFast speed', () => {
    const map: TileMap = {
      ...openMap,
      id: 'bike-cracked-ice',
      walkable: Array.from({ length: 12 * 12 }, () => true),
      collisionValues: Array.from({ length: 12 * 12 }, () => 0),
      tileBehaviors: Array.from({ length: 12 * 12 }, () => 0)
    };
    map.collisionValues![3 * map.width + 4] = 1;
    map.walkable[3 * map.width + 4] = false;
    map.tileBehaviors![3 * map.width + 4] = 0x27;

    const player = createPlayer();
    player.avatarMode = 'machBike';
    player.facing = 'right';
    player.runningState = 'moving';

    const result = stepPlayer(player, { ...idleInput, right: true }, map, 1 / 60);

    expect(result.collision?.result).toBe('none');
    expect(player.stepSpeed).toBe(120);
    expect(player.position.x).toBe(3 * 16 + 2);
  });

  test('regular bike movement uses the decomp RideWaterCurrent action speed for Mach and Acro bikes', () => {
    const mach = createPlayer();
    const acro = createPlayer();
    mach.avatarMode = 'machBike';
    acro.avatarMode = 'acroBike';
    mach.facing = 'right';
    acro.facing = 'right';
    mach.runningState = 'moving';
    acro.runningState = 'moving';

    stepPlayer(mach, { ...idleInput, right: true }, openMap, 1 / 60);
    stepPlayer(acro, { ...idleInput, right: true }, openMap, 1 / 60);

    expect(mach.stepSpeed).toBe(160);
    expect(acro.stepSpeed).toBe(160);
    expect(acro.position.x).toBe(mach.position.x);
  });

  test('forced movement tiles take precedence over manual input', () => {
    const player = createPlayer();
    player.position.x = 3 * 16;
    player.position.y = 3 * 16;
    player.facing = 'left';
    player.controllable = false;

    const result = stepPlayer(
      player,
      { ...idleInput, left: true },
      forcedWalkSouthMap,
      1 / 10
    );

    expect(result.forcedMovement).toBe(true);
    expect(player.position.y).toBeGreaterThan(3 * 16);
    expect(player.position.x).toBe(3 * 16);
    expect(player.facing).toBe('down');
  });

  test('forced movement remains marked until the forced step lands', () => {
    const player = createPlayer();
    player.position.x = 3 * 16;
    player.position.y = 3 * 16;
    player.facing = 'down';
    player.controllable = false;

    let result = stepPlayer(
      player,
      idleInput,
      forcedWalkSouthMap,
      1 / 60
    );

    expect(result.forcedMovement).toBe(true);
    expect(result.enteredNewTile).toBe(false);
    expect(player.stepForcedMovement).toBe(true);

    for (let i = 0; i < 30; i += 1) {
      result = stepPlayer(player, idleInput, forcedWalkSouthMap, 1 / 60);
      if (result.enteredNewTile) {
        break;
      }
    }

    expect(result.forcedMovement).toBe(true);
    expect(result.enteredNewTile).toBe(true);

    for (let i = 0; i < 30 && player.stepForcedMovement; i += 1) {
      stepPlayer(player, idleInput, forcedWalkSouthMap, 1 / 60);
    }

    expect(player.stepForcedMovement).toBeUndefined();
    expect(hasPendingForcedMovement(player, forcedWalkSouthMap)).toBe(false);
    expect(player.controllable).toBe(true);
  });

  test('normal movement onto a forced tile arms the decomp non-controllable forced phase', () => {
    const map: TileMap = {
      ...openMap,
      id: 'normal-step-to-forced-tile',
      tileBehaviors: Array.from({ length: 12 * 12 }, () => 0)
    };
    map.tileBehaviors![3 * map.width + 4] = 0x43;
    const player = createPlayer();
    player.facing = 'right';
    player.runningState = 'moving';

    for (let i = 0; i < 30; i += 1) {
      stepPlayer(player, { ...idleInput, right: true }, map, 1 / 60);
      if (!player.stepTarget && player.currentTile?.x === 4) {
        break;
      }
    }

    expect(player.currentTile).toEqual({ x: 4, y: 3 });
    expect(player.controllable).toBe(false);
    expect(getForcedMovementInstruction(player, map)).toEqual({
      direction: 'down',
      speed: 60
    });
  });

  test('normal step side effects are suppressed for forced movement like FieldGetPlayerInput', () => {
    expect(shouldRunNormalStepSideEffects({
      attemptedDirection: 'down',
      collision: null,
      enteredNewTile: true,
      forcedMovement: false,
      connectionTransition: null
    })).toBe(true);

    expect(shouldRunNormalStepSideEffects({
      attemptedDirection: 'down',
      collision: null,
      enteredNewTile: true,
      forcedMovement: true,
      connectionTransition: null
    })).toBe(false);

    expect(shouldRunNormalStepSideEffects({
      attemptedDirection: 'down',
      collision: null,
      enteredNewTile: false,
      forcedMovement: false,
      connectionTransition: null
    })).toBe(false);
  });

  test('ice and slippery floor continue in the last movement direction', () => {
    const player = createPlayer();
    player.facing = 'down';
    player.lastMovementDirection = 'right';
    player.controllable = false;

    expect(getForcedMovementInstruction(player, iceMap)).toEqual({
      direction: 'right',
      speed: 120
    });
  });

  test('spin tiles keep applying the last spin direction until a stop-spinning tile', () => {
    const player = createPlayer();
    player.position.x = 4 * 16;
    player.position.y = 3 * 16;
    player.currentTile = { x: 4, y: 3 };
    player.previousTile = { x: 4, y: 3 };
    player.forcedSpinBehavior = 0x54;
    expect(getForcedMovementInstruction(player, spinRightMap)).toEqual({
      direction: 'right',
      speed: 60
    });

    for (let i = 0; i < 60; i += 1) {
      stepPlayer(player, idleInput, spinRightMap, 1 / 60);
      if ((player.currentTile?.x ?? 0) >= 5 && !player.stepTarget) {
        break;
      }
    }

    expect(player.currentTile).toEqual({ x: 5, y: 3 });
    expect(getForcedMovementInstruction(player, spinRightMap)).toBeNull();
    expect(player.forcedSpinBehavior).toBeUndefined();
  });

  test('blocked forced spin clears retained spin state instead of keeping the player forced', () => {
    const blockedSpinMap: TileMap = {
      ...openMap,
      id: 'blocked-spin-map',
      collisionValues: Array.from({ length: 12 * 12 }, (_, index) => index === 3 * 12 + 5 ? 1 : 0),
      tileBehaviors: Array.from({ length: 12 * 12 }, () => 0)
    };
    const player = createPlayer();
    player.position.x = 4 * 16;
    player.position.y = 3 * 16;
    player.currentTile = { x: 4, y: 3 };
    player.previousTile = { x: 4, y: 3 };
    player.forcedSpinBehavior = 0x54;

    const result = stepPlayer(player, idleInput, blockedSpinMap, 1 / 10);

    expect(result.forcedMovement).toBe(true);
    expect(result.collision?.result).toBe('impassable');
    expect(player.position).toEqual({ x: 4 * 16, y: 3 * 16 });
    expect(player.forcedSpinBehavior).toBeUndefined();
    expect(player.moving).toBe(false);
  });

  test('returns a connected-map transition instead of blocking valid borders', () => {
    const destinationMap: TileMap = {
      id: 'dest-map',
      width: 4,
      height: 4,
      tileSize: 16,
      walkable: Array.from({ length: 16 }, () => true),
      collisionValues: Array.from({ length: 16 }, () => 0),
      connections: [],
      triggers: [],
      npcs: [],
      warps: []
    };
    const edgeMap: TileMap = {
      id: 'edge-map',
      width: 4,
      height: 4,
      tileSize: 16,
      walkable: Array.from({ length: 16 }, () => true),
      collisionValues: Array.from({ length: 16 }, () => 0),
      connections: [{ map: 'dest-map', offset: 0, direction: 'right' }],
      triggers: [],
      npcs: [],
      warps: []
    };
    const player = createPlayer();
    player.position.x = 3 * 16;
    player.position.y = 1 * 16;
    player.facing = 'right';
    player.runningState = 'moving';

    const result = stepPlayer(
      player,
      { ...idleInput, right: true },
      edgeMap,
      1 / 60,
      (direction) => evaluateFieldCollision({
        map: edgeMap,
        object: {
          id: 'player',
          currentTile: { x: 3, y: 1 },
          previousTile: { x: 3, y: 1 },
          facing: direction,
          initialTile: { x: 3, y: 1 },
          movementRangeX: 0,
          movementRangeY: 0,
          currentElevation: 0,
          previousElevation: 0,
          trackedByCamera: true,
          avatarMode: 'normal'
        },
        direction,
        loadMapById: (mapId) => mapId === 'dest-map' ? destinationMap : null
      })
    );

    expect(result.enteredNewTile).toBe(false);
    expect(result.connectionTransition?.target?.map.id).toBe('dest-map');
    expect(result.connectionTransition?.target?.tile).toEqual({ x: 0, y: 1 });
  });

  test('does not start a normal walk step for ledge collisions', () => {
    const player = createPlayer();
    const startY = player.position.y;

    const result = stepPlayer(
      player,
      { ...idleInput, down: true },
      openMap,
      1 / 10,
      () => ({
        result: 'ledgeJump',
        target: {
          map: openMap,
          tile: { x: 3, y: 4 },
          viaConnection: false
        },
        movementTarget: {
          map: openMap,
          tile: { x: 3, y: 5 },
          viaConnection: false
        }
      })
    );

    expect(result.enteredNewTile).toBe(false);
    expect(player.position.y).toBe(startY);
    expect(player.moving).toBe(false);
  });

  test('does not start a normal walk step for stop surfing collisions', () => {
    const player = createPlayer();
    player.avatarMode = 'surfing';
    const startY = player.position.y;

    const result = stepPlayer(
      player,
      { ...idleInput, down: true },
      openMap,
      1 / 10,
      () => ({
        result: 'stopSurfing',
        target: {
          map: openMap,
          tile: { x: 3, y: 4 },
          viaConnection: false
        },
        movementTarget: {
          map: openMap,
          tile: { x: 3, y: 4 },
          viaConnection: false
        }
      })
    );

    expect(result.enteredNewTile).toBe(false);
    expect(player.position.y).toBe(startY);
    expect(player.moving).toBe(false);
  });
});
