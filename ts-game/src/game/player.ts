import type { InputSnapshot } from '../input/inputState';
import { vec2, type Vec2 } from '../core/vec2';
import {
  evaluateFieldCollision,
  MetatileBehavior_IsHorizontalRail,
  MetatileBehavior_IsIsolatedHorizontalRail,
  MetatileBehavior_IsIsolatedVerticalRail,
  MetatileBehavior_IsVerticalRail,
  type AvatarMode,
  type FieldCollisionEvaluation,
  type FieldRuntimeObject
} from './fieldCollision';
import {
  getCollisionTilePosition,
  MapGridGetElevationAt,
  MapGridGetMetatileBehaviorAt,
  type TileMap
} from '../world/tileMap';

type PlayerRunningState = 'notMoving' | 'turnDirection' | 'moving';
type PlayerNotOnBikeMovementInput = 'notMoving' | 'turningInPlace' | 'moving';
type PlayerNotOnBikeMovementAction = 'walkNormal' | 'walkSlow' | 'run' | 'runSlow' | 'surf';
type PlayerBikeState = 'normal' | 'turning' | 'slope';
type BikeTransitionKind = 'face' | 'turn' | 'move' | 'downhill' | 'uphill';

interface BikeTransition {
  kind: BikeTransitionKind;
  direction: PlayerState['facing'];
}

interface ForcedMovementInstruction {
  direction: PlayerState['facing'];
  speed: number;
}

interface PlayerNotOnBikeMovingResult {
  action: PlayerNotOnBikeMovementAction;
  speed: number;
}

export interface PlayerState {
  position: Vec2;
  facing: 'up' | 'down' | 'left' | 'right';
  moving: boolean;
  animationTime: number;
  avatarMode?: AvatarMode;
  avatarFlags?: number;
  avatarTransitionFlags?: number;
  avatarGraphicsMode?: 'normal' | 'bike' | 'surf' | 'underwater' | 'fieldMove' | 'fish' | 'vsSeeker';
  avatarObjectGraphicsId?: string;
  avatarQuestLogTransitions?: number[];
  avatarTileTransitionState?: 'notMoving' | 'tileTransition' | 'tileCenter';
  avatarGender?: 'male' | 'female';
  avatarPreventStep?: boolean;
  runningState?: PlayerRunningState;
  bikeState?: PlayerBikeState;
  bikeFrameCounter?: 0 | 1 | 2;
  bikeSpeed?: PlayerSpeed;
  bikeNewDirectionBackup?: 'up' | 'down' | 'left' | 'right' | null;
  bikeDirectionHistory?: number;
  bikeAbStartSelectHistory?: number;
  bikeDirTimerHistory?: number[];
  bikeLastSpinTile?: number;
  currentTile?: Vec2;
  previousTile?: Vec2;
  currentElevation?: number;
  previousElevation?: number;
  stepTarget?: Vec2;
  stepDirection?: 'up' | 'down' | 'left' | 'right';
  stepSpeed?: number;
  stepForcedMovement?: boolean;
  walkAnimationPhase?: 0 | 1;
  nextWalkAnimationPhase?: 0 | 1;
  lastMovementDirection?: 'up' | 'down' | 'left' | 'right';
  forcedSpinBehavior?: number;
  controllable?: boolean;
  facingLocked?: boolean;
  movementDirection?: 'up' | 'down' | 'left' | 'right';
  previousMovementDirection?: 'up' | 'down' | 'left' | 'right';
  movementDelayFrames?: number;
  lastMovementActionId?: number;
  lastStartedMovementActionId?: number;
  animationDisabled?: boolean;
  activeEmote?: string;
  affineAnimInitialized?: boolean;
}

export interface StepPlayerResult {
  attemptedDirection: PlayerState['facing'] | null;
  collision: FieldCollisionEvaluation | null;
  enteredNewTile: boolean;
  forcedMovement: boolean;
  connectionTransition: FieldCollisionEvaluation | null;
}

export interface FieldInputGateContext {
  fieldControlsLocked?: boolean;
  pendingForcedMovement?: boolean;
  dialogueActive?: boolean;
  scriptSessionActive?: boolean;
  startMenuBlocking?: boolean;
  battleBlocking?: boolean;
}

export const shouldRunNormalStepSideEffects = (result: StepPlayerResult): boolean =>
  result.enteredNewTile && !result.forcedMovement;

const MB_RUNNING_DISALLOWED = 0x0a;
const MB_ICE = 0x23;
const MB_CRACKED_ICE = 0x27;
const MB_ROCK_STAIRS = 0x2a;
const MB_CYCLING_ROAD_PULL_DOWN = 0xd0;
const MB_CYCLING_ROAD_PULL_DOWN_GRASS = 0xd1;
const MB_WALK_EAST = 0x40;
const MB_WALK_WEST = 0x41;
const MB_WALK_NORTH = 0x42;
const MB_WALK_SOUTH = 0x43;
const MB_SLIDE_EAST = 0x44;
const MB_SLIDE_WEST = 0x45;
const MB_SLIDE_NORTH = 0x46;
const MB_SLIDE_SOUTH = 0x47;
const MB_TRICK_HOUSE_PUZZLE_8_FLOOR = 0x48;
const MB_EASTWARD_CURRENT = 0x50;
const MB_WESTWARD_CURRENT = 0x51;
const MB_NORTHWARD_CURRENT = 0x52;
const MB_SOUTHWARD_CURRENT = 0x53;
const MB_SPIN_RIGHT = 0x54;
const MB_SPIN_LEFT = 0x55;
const MB_SPIN_UP = 0x56;
const MB_SPIN_DOWN = 0x57;
const MB_STOP_SPINNING = 0x58;
const MB_WATERFALL = 0x13;
const FIELD_FRAMES_PER_SECOND = 60;
const NORMAL_SPEED = 16 / (16 / FIELD_FRAMES_PER_SECOND);
const SLOW_SPEED = 16 / (24 / FIELD_FRAMES_PER_SECOND);
const FAST_SPEED = 16 / (8 / FIELD_FRAMES_PER_SECOND);
const RUN_SLOW_SPEED = 16 / (11 / FIELD_FRAMES_PER_SECOND);
const FAST_2_SPEED = 16 / (6 / FIELD_FRAMES_PER_SECOND);
const FASTER_SPEED = 16 / (4 / FIELD_FRAMES_PER_SECOND);
const FASTEST_SPEED = 16 / (2 / FIELD_FRAMES_PER_SECOND);
const MACH_BIKE_SPEEDS: readonly [number, number, number] = [
  NORMAL_SPEED,
  FAST_SPEED,
  FASTEST_SPEED
];
const PLAYER_STEP_EPSILON = 0.001;

export const PLAYER_SPEED_STANDING = 0;
export const PLAYER_SPEED_NORMAL = 1;
export const PLAYER_SPEED_FAST = 2;
export const PLAYER_SPEED_FASTER = 3;
export const PLAYER_SPEED_FASTEST = 4;

export type PlayerSpeed =
  | typeof PLAYER_SPEED_STANDING
  | typeof PLAYER_SPEED_NORMAL
  | typeof PLAYER_SPEED_FAST
  | typeof PLAYER_SPEED_FASTER
  | typeof PLAYER_SPEED_FASTEST;

const createInitialTile = (): Vec2 => vec2(3, 3);

export const createPlayer = (): PlayerState => ({
  position: vec2(3 * 16, 3 * 16),
  facing: 'down',
  moving: false,
  animationTime: 0,
  avatarMode: 'normal',
  runningState: 'notMoving',
  bikeState: 'normal',
  bikeFrameCounter: 0,
  bikeSpeed: PLAYER_SPEED_STANDING,
  bikeNewDirectionBackup: null,
  bikeDirectionHistory: 0,
  bikeAbStartSelectHistory: 0,
  bikeDirTimerHistory: [0, 0, 0, 0],
  bikeLastSpinTile: 0,
  nextWalkAnimationPhase: 0,
  currentTile: createInitialTile(),
  previousTile: createInitialTile(),
  currentElevation: 0,
  previousElevation: 0,
  controllable: true
});

export const getPlayerTilePosition = (position: Vec2, tileSize: number): Vec2 =>
  getCollisionTilePosition(position, tileSize);

const clearPlayerStep = (state: PlayerState): void => {
  delete state.stepTarget;
  delete state.stepDirection;
  delete state.stepSpeed;
  delete state.stepForcedMovement;
  delete state.walkAnimationPhase;
};

const clearForcedMovementState = (state: PlayerState): void => {
  delete state.forcedSpinBehavior;
};

export const bikeClearState = (
  state: PlayerState,
  directionHistory = 0,
  abStartSelectHistory = 0
): void => {
  state.bikeState = 'normal';
  state.bikeNewDirectionBackup = null;
  state.bikeFrameCounter = 0;
  state.bikeSpeed = PLAYER_SPEED_STANDING;
  state.bikeDirectionHistory = directionHistory;
  state.bikeAbStartSelectHistory = abStartSelectHistory;
  state.bikeLastSpinTile = 0;
  state.bikeDirTimerHistory = [0, 0, 0, 0];
};

const bikeSetStill = (state: PlayerState): void => {
  state.bikeFrameCounter = 0;
  state.bikeSpeed = PLAYER_SPEED_STANDING;
};

export const bikeUpdateBikeCounterSpeed = (state: PlayerState, counter: 0 | 1 | 2): void => {
  state.bikeFrameCounter = counter;
  state.bikeSpeed = (counter + (counter >> 1)) as PlayerSpeed;
};

const ensurePlayerCollisionState = (state: PlayerState, map: TileMap): void => {
  const tile = getPlayerTilePosition(state.position, map.tileSize);
  state.avatarMode ??= 'normal';
  state.runningState ??= 'notMoving';
  state.bikeState ??= 'normal';
  state.bikeFrameCounter ??= 0;
  state.bikeSpeed ??= PLAYER_SPEED_STANDING;
  state.bikeNewDirectionBackup ??= null;
  state.bikeDirectionHistory ??= 0;
  state.bikeAbStartSelectHistory ??= 0;
  state.bikeDirTimerHistory ??= [0, 0, 0, 0];
  state.bikeLastSpinTile ??= 0;
  state.controllable ??= true;
  if (
    !state.currentTile
    || !state.previousTile
    || (
      !state.stepTarget
      && (state.currentTile.x !== tile.x || state.currentTile.y !== tile.y)
    )
  ) {
    state.currentTile = vec2(tile.x, tile.y);
    state.previousTile = vec2(tile.x, tile.y);
    state.currentElevation = MapGridGetElevationAt(map, tile.x, tile.y);
    state.previousElevation = state.currentElevation;
    return;
  }

  state.currentElevation ??= MapGridGetElevationAt(map, state.currentTile.x, state.currentTile.y);
  state.previousElevation ??= state.currentElevation;
};

const updatePlayerCollisionStateForPosition = (state: PlayerState, map: TileMap): void => {
  const tile = getPlayerTilePosition(state.position, map.tileSize);
  state.currentTile = vec2(tile.x, tile.y);
  state.previousTile = vec2(tile.x, tile.y);
  state.currentElevation = MapGridGetElevationAt(map, tile.x, tile.y);
  state.previousElevation = state.currentElevation;
};

const getCommittedElevation = (map: TileMap, tile: Vec2, fallback: number): number => {
  const elevation = MapGridGetElevationAt(map, tile.x, tile.y);
  return elevation === 0 || elevation === 15 ? fallback : elevation;
};

const snapPlayerToStepTarget = (state: PlayerState, map: TileMap): void => {
  if (!state.stepTarget) {
    clearPlayerStep(state);
    return;
  }

  state.position = vec2(state.stepTarget.x, state.stepTarget.y);
  clearPlayerStep(state);
  updatePlayerCollisionStateForPosition(state, map);
};

const isBlockingCollision = (collision: FieldCollisionEvaluation): boolean => collision.result !== 'none';

const startPlayerStep = (
  state: PlayerState,
  map: TileMap,
  facing: PlayerState['facing'],
  speed: number,
  collision: FieldCollisionEvaluation,
  forcedMovement = false
): boolean => {
  const movementTarget = collision.movementTarget ?? collision.target;
  if (!movementTarget || movementTarget.map.id !== map.id || isBlockingCollision(collision)) {
    return false;
  }

  const currentTile = state.currentTile ?? getPlayerTilePosition(state.position, map.tileSize);
  state.previousTile = vec2(currentTile.x, currentTile.y);
  state.currentTile = vec2(movementTarget.tile.x, movementTarget.tile.y);
  state.previousElevation = state.currentElevation ?? MapGridGetElevationAt(map, currentTile.x, currentTile.y);
  state.currentElevation = getCommittedElevation(map, movementTarget.tile, state.previousElevation);
  state.controllable = false;

  state.stepTarget = vec2(movementTarget.tile.x * map.tileSize, movementTarget.tile.y * map.tileSize);
  state.stepDirection = facing;
  state.stepSpeed = speed;
  state.stepForcedMovement = forcedMovement;
  state.lastMovementDirection = facing;
  if (speed === NORMAL_SPEED) {
    const phase = state.nextWalkAnimationPhase ?? 0;
    state.walkAnimationPhase = phase;
    state.nextWalkAnimationPhase = phase === 0 ? 1 : 0;
  } else {
    delete state.walkAnimationPhase;
  }
  return true;
};

const advancePlayerStep = (state: PlayerState, map: TileMap, distance: number): number => {
  if (!state.stepTarget) {
    return distance;
  }

  const dx = state.stepTarget.x - state.position.x;
  const dy = state.stepTarget.y - state.position.y;
  const remaining = Math.hypot(dx, dy);

  if (remaining <= PLAYER_STEP_EPSILON) {
    snapPlayerToStepTarget(state, map);
    return distance;
  }

  const traveled = Math.min(distance, remaining);
  state.position = vec2(
    state.position.x + (dx / remaining) * traveled,
    state.position.y + (dy / remaining) * traveled
  );

  if (traveled + PLAYER_STEP_EPSILON >= remaining) {
    snapPlayerToStepTarget(state, map);
  }

  return distance - traveled;
};

export const clearPlayerMovement = (state: PlayerState, map?: TileMap): PlayerState => {
  clearPlayerStep(state);
  clearForcedMovementState(state);
  state.moving = false;
  state.animationTime = 0;
  state.runningState = 'notMoving';
  state.nextWalkAnimationPhase = 0;
  state.controllable = true;
  if (map) {
    updatePlayerCollisionStateForPosition(state, map);
  } else {
    delete state.currentTile;
    delete state.previousTile;
    delete state.currentElevation;
    delete state.previousElevation;
  }
  return state;
};

export const getPlayerSpeed = (state: PlayerState): PlayerSpeed => {
  if (state.avatarMode === 'machBike') {
    switch (state.bikeFrameCounter ?? 0) {
      case 2:
        return PLAYER_SPEED_FASTEST;
      case 1:
        return PLAYER_SPEED_FAST;
      default:
        return PLAYER_SPEED_NORMAL;
    }
  }

  if (state.avatarMode === 'acroBike') {
    return PLAYER_SPEED_FASTER;
  }

  if (state.avatarMode === 'surfing' || (state.avatarFlags !== undefined && (state.avatarFlags & (1 << 7)) !== 0)) {
    return PLAYER_SPEED_FAST;
  }

  return PLAYER_SPEED_NORMAL;
};

export const canProcessFieldButtons = (state: PlayerState): boolean =>
  !state.stepTarget
  && !state.moving
  && (state.runningState ?? 'notMoving') !== 'moving'
  && getPlayerSpeed(state) !== PLAYER_SPEED_FASTEST;

export const canProcessStartMenuInput = (
  state: PlayerState,
  context: FieldInputGateContext = {}
): boolean =>
  canProcessFieldButtons(state)
  && context.fieldControlsLocked !== true
  && context.pendingForcedMovement !== true
  && context.dialogueActive !== true
  && context.scriptSessionActive !== true
  && context.battleBlocking !== true;

export const canProcessFieldInteractionInput = (
  state: PlayerState,
  context: FieldInputGateContext = {}
): boolean =>
  canProcessStartMenuInput(state, context)
  && context.startMenuBlocking !== true;

export const canProcessPlayerMovementInput = (
  state: PlayerState,
  context: FieldInputGateContext = {}
): boolean =>
  canProcessFieldInteractionInput(state, context);

export const getForcedMovementInstruction = (
  state: PlayerState,
  map: TileMap
): ForcedMovementInstruction | null => {
  ensurePlayerCollisionState(state, map);
  if (state.stepTarget) {
    return null;
  }

  const behavior = state.currentTile
    ? MapGridGetMetatileBehaviorAt(map, state.currentTile.x, state.currentTile.y)
    : null;

  if (state.forcedSpinBehavior !== undefined) {
    if (behavior === MB_STOP_SPINNING) {
      clearForcedMovementState(state);
      return null;
    }
    if (
      behavior === MB_SPIN_RIGHT
      || behavior === MB_SPIN_LEFT
      || behavior === MB_SPIN_UP
      || behavior === MB_SPIN_DOWN
    ) {
      state.forcedSpinBehavior = behavior;
    }

    switch (state.forcedSpinBehavior) {
      case MB_SPIN_RIGHT:
        return { direction: 'right', speed: NORMAL_SPEED };
      case MB_SPIN_LEFT:
        return { direction: 'left', speed: NORMAL_SPEED };
      case MB_SPIN_UP:
        return { direction: 'up', speed: NORMAL_SPEED };
      case MB_SPIN_DOWN:
        return { direction: 'down', speed: NORMAL_SPEED };
      default:
        clearForcedMovementState(state);
        return null;
    }
  }

  if (state.controllable !== false) {
    clearForcedMovementState(state);
    return null;
  }

  switch (behavior) {
    case MB_TRICK_HOUSE_PUZZLE_8_FLOOR:
    case MB_ICE:
      return { direction: state.stepDirection ?? state.lastMovementDirection ?? state.facing, speed: FAST_SPEED };
    case MB_WALK_EAST:
      return { direction: 'right', speed: NORMAL_SPEED };
    case MB_WALK_WEST:
      return { direction: 'left', speed: NORMAL_SPEED };
    case MB_WALK_NORTH:
      return { direction: 'up', speed: NORMAL_SPEED };
    case MB_WALK_SOUTH:
      return { direction: 'down', speed: NORMAL_SPEED };
    case MB_SLIDE_EAST:
      return { direction: 'right', speed: FAST_SPEED };
    case MB_SLIDE_WEST:
      return { direction: 'left', speed: FAST_SPEED };
    case MB_SLIDE_NORTH:
      return { direction: 'up', speed: FAST_SPEED };
    case MB_SLIDE_SOUTH:
      return { direction: 'down', speed: FAST_SPEED };
    case MB_EASTWARD_CURRENT:
      return { direction: 'right', speed: FAST_SPEED };
    case MB_WESTWARD_CURRENT:
      return { direction: 'left', speed: FAST_SPEED };
    case MB_NORTHWARD_CURRENT:
      return { direction: 'up', speed: FAST_SPEED };
    case MB_SOUTHWARD_CURRENT:
    case MB_WATERFALL:
      return { direction: 'down', speed: FAST_SPEED };
    case MB_SPIN_RIGHT:
      state.forcedSpinBehavior = behavior;
      return { direction: 'right', speed: NORMAL_SPEED };
    case MB_SPIN_LEFT:
      state.forcedSpinBehavior = behavior;
      return { direction: 'left', speed: NORMAL_SPEED };
    case MB_SPIN_UP:
      state.forcedSpinBehavior = behavior;
      return { direction: 'up', speed: NORMAL_SPEED };
    case MB_SPIN_DOWN:
      state.forcedSpinBehavior = behavior;
      return { direction: 'down', speed: NORMAL_SPEED };
    default:
      state.controllable = true;
      return null;
  }
};

export const hasPendingForcedMovement = (state: PlayerState, map: TileMap): boolean =>
  getForcedMovementInstruction(state, map) !== null;

const isCyclingRoadPullDownTile = (behavior: number | null): boolean =>
  behavior === MB_CYCLING_ROAD_PULL_DOWN || behavior === MB_CYCLING_ROAD_PULL_DOWN_GRASS;

const isRunningDisallowed = (map: TileMap, behavior: number | null): boolean =>
  map.allowRunning === false || behavior === MB_RUNNING_DISALLOWED;

export const metatileBehaviorForbidsBiking = (
  behavior: number | null,
  playerElevation = 0
): boolean => {
  if (behavior === MB_RUNNING_DISALLOWED) {
    return true;
  }

  // FireRed's Fortree bridge predicate is a stub, but keep the elevation branch shape here.
  const isFortreeBridge = false;
  if (!isFortreeBridge) {
    return false;
  }

  return (playerElevation & 1) === 0;
};

export const isBikingDisallowedByPlayer = (state: PlayerState, map: TileMap): boolean => {
  ensurePlayerCollisionState(state, map);
  if (state.avatarMode === 'underwater' || state.avatarMode === 'surfing') {
    return true;
  }

  const tile = state.stepTarget
    ? getPlayerTilePosition(state.stepTarget, map.tileSize)
    : state.currentTile!;
  const behavior = MapGridGetMetatileBehaviorAt(map, tile.x, tile.y);
  return metatileBehaviorForbidsBiking(behavior, state.currentElevation ?? 0);
};

export const canBikeFaceDirectionOnRail = (
  direction: PlayerState['facing'],
  behavior: number | null
): boolean => {
  if (direction === 'left' || direction === 'right') {
    return !MetatileBehavior_IsIsolatedVerticalRail(behavior)
      && !MetatileBehavior_IsVerticalRail(behavior);
  }

  return !MetatileBehavior_IsIsolatedHorizontalRail(behavior)
    && !MetatileBehavior_IsHorizontalRail(behavior);
};

const isBikeAvatar = (avatarMode: AvatarMode | undefined): boolean =>
  avatarMode === 'machBike' || avatarMode === 'acroBike';

export const resolveInputDirection = (input: InputSnapshot): PlayerState['facing'] | null => {
  const direction = vec2();

  if (input.left) direction.x -= 1;
  if (input.right) direction.x += 1;
  if (input.up) direction.y -= 1;
  if (input.down) direction.y += 1;

  if (direction.x === 0 && direction.y === 0) {
    return null;
  }

  if (Math.abs(direction.x) > Math.abs(direction.y)) {
    return direction.x > 0 ? 'right' : 'left';
  }

  return direction.y > 0 ? 'down' : 'up';
};

export const checkMovementInputNotOnBike = (
  state: PlayerState,
  direction: PlayerState['facing'] | null
): PlayerNotOnBikeMovementInput => {
  if (direction === null) {
    state.runningState = 'notMoving';
    return 'notMoving';
  }

  if (direction !== state.facing && (state.runningState ?? 'notMoving') !== 'moving') {
    state.runningState = 'turnDirection';
    return 'turningInPlace';
  }

  state.runningState = 'moving';
  return 'moving';
};

export const playerNotOnBikeNotMoving = (state: PlayerState): void => {
  state.runningState = 'notMoving';
  state.moving = false;
  state.animationTime = 0;
  state.nextWalkAnimationPhase = 0;
};

export const playerNotOnBikeTurningInPlace = (
  state: PlayerState,
  direction: PlayerState['facing']
): void => {
  state.facing = direction;
  state.runningState = 'turnDirection';
  state.moving = false;
  state.animationTime = 0;
  state.nextWalkAnimationPhase = 0;
};

export const playerIsMovingOnRockStairs = (
  state: PlayerState,
  map: TileMap,
  direction: PlayerState['facing']
): boolean => {
  ensurePlayerCollisionState(state, map);
  const currentTile = state.currentTile!;

  switch (direction) {
    case 'up':
      return MapGridGetMetatileBehaviorAt(map, currentTile.x, currentTile.y) === MB_ROCK_STAIRS;
    case 'down':
      return MapGridGetMetatileBehaviorAt(map, currentTile.x, currentTile.y + 1) === MB_ROCK_STAIRS;
    case 'left':
    case 'right':
      return false;
  }
};

export const playerNotOnBikeMoving = (
  state: PlayerState,
  map: TileMap,
  input: InputSnapshot,
  currentBehavior: number | null,
  direction: PlayerState['facing']
): PlayerNotOnBikeMovingResult => {
  if (state.avatarMode === 'surfing') {
    return { action: 'surf', speed: FAST_SPEED };
  }

  const onRockStairs = playerIsMovingOnRockStairs(state, map, direction);
  if (input.run && !isRunningDisallowed(map, currentBehavior)) {
    return onRockStairs
      ? { action: 'runSlow', speed: RUN_SLOW_SPEED }
      : { action: 'run', speed: FAST_SPEED };
  }

  return onRockStairs
    ? { action: 'walkSlow', speed: SLOW_SPEED }
    : { action: 'walkNormal', speed: NORMAL_SPEED };
};

const resolveBikeTransition = (
  state: PlayerState,
  input: InputSnapshot,
  currentBehavior: number | null
): BikeTransition => {
  const attemptedDirection = resolveInputDirection(input);
  const currentDirection = state.facing;

  if (state.bikeState === 'turning') {
    const backupDirection = state.bikeNewDirectionBackup ?? currentDirection;
    state.runningState = 'turnDirection';
    state.bikeState = 'normal';
    bikeSetStill(state);
    return { kind: 'turn', direction: backupDirection };
  }

  if (state.bikeState === 'slope') {
    if (isCyclingRoadPullDownTile(currentBehavior)) {
      if (attemptedDirection && attemptedDirection !== currentDirection) {
        state.bikeState = 'turning';
        state.bikeNewDirectionBackup = attemptedDirection;
        state.runningState = 'turnDirection';
        return resolveBikeTransition(state, input, currentBehavior);
      }

      state.runningState = 'moving';
      return attemptedDirection === null || attemptedDirection === 'down'
        ? { kind: 'downhill', direction: 'down' }
        : { kind: 'uphill', direction: attemptedDirection };
    }

    state.bikeState = 'normal';
    if (!attemptedDirection) {
      state.runningState = 'notMoving';
      return { kind: 'face', direction: currentDirection };
    }

    state.runningState = 'moving';
    return { kind: 'move', direction: attemptedDirection };
  }

  state.bikeFrameCounter = 0;
  if (isCyclingRoadPullDownTile(currentBehavior)) {
    if (!input.run) {
      state.bikeState = 'slope';
      state.runningState = 'moving';
      return attemptedDirection === null || attemptedDirection === 'down'
        ? { kind: 'downhill', direction: 'down' }
        : { kind: 'uphill', direction: attemptedDirection };
    }

    if (attemptedDirection) {
      state.bikeState = 'slope';
      state.runningState = 'moving';
      return { kind: 'uphill', direction: attemptedDirection };
    }
  }

  if (!attemptedDirection) {
    state.runningState = 'notMoving';
    return { kind: 'face', direction: currentDirection };
  }

  if (attemptedDirection !== currentDirection && (state.runningState ?? 'notMoving') !== 'moving') {
    state.bikeState = 'turning';
    state.bikeNewDirectionBackup = attemptedDirection;
    state.runningState = 'turnDirection';
    return resolveBikeTransition(state, input, currentBehavior);
  }

  state.runningState = 'moving';
  return { kind: 'move', direction: attemptedDirection };
};

const getBikeCollisionBehavior = (
  collision: FieldCollisionEvaluation,
  direction: PlayerState['facing'],
  map: TileMap,
  state: PlayerState
): number | null => {
  if (collision.target) {
    return MapGridGetMetatileBehaviorAt(collision.target.map, collision.target.tile.x, collision.target.tile.y);
  }

  const currentTile = state.currentTile ?? getPlayerTilePosition(state.position, map.tileSize);
  switch (direction) {
    case 'up':
      return MapGridGetMetatileBehaviorAt(map, currentTile.x, currentTile.y - 1);
    case 'down':
      return MapGridGetMetatileBehaviorAt(map, currentTile.x, currentTile.y + 1);
    case 'left':
      return MapGridGetMetatileBehaviorAt(map, currentTile.x - 1, currentTile.y);
    case 'right':
      return MapGridGetMetatileBehaviorAt(map, currentTile.x + 1, currentTile.y);
  }
};

const applyBikeCollisionRules = (
  state: PlayerState,
  map: TileMap,
  direction: PlayerState['facing'],
  collision: FieldCollisionEvaluation
): { collision: FieldCollisionEvaluation; collisionCount: boolean } => {
  const behavior = getBikeCollisionBehavior(collision, direction, map, state);
  if (
    collision.result === 'none'
    || collision.result === 'outsideRange'
    || collision.result === 'impassable'
    || collision.result === 'elevationMismatch'
    || collision.result === 'objectEvent'
  ) {
    if (behavior === MB_CRACKED_ICE) {
      return {
        collision: {
          ...collision,
          result: 'none',
          movementTarget: collision.target
        },
        collisionCount: true
      };
    }

    if (collision.result === 'none' && metatileBehaviorForbidsBiking(behavior, state.currentElevation ?? 0)) {
      return {
        collision: { ...collision, result: 'impassable', movementTarget: null },
        collisionCount: false
      };
    }
  }

  return { collision, collisionCount: false };
};

const getStepSpeed = (
  state: PlayerState,
  map: TileMap,
  input: InputSnapshot,
  currentBehavior: number | null,
  attemptedDirection: PlayerState['facing'],
  previousFacing: PlayerState['facing'],
  previousRunningState: PlayerRunningState,
  bikeTransitionKind?: BikeTransitionKind
): number => {
  if (bikeTransitionKind) {
    switch (bikeTransitionKind) {
      case 'uphill':
        return NORMAL_SPEED;
      case 'downhill':
        return FASTER_SPEED;
      case 'move':
        return FAST_2_SPEED;
      case 'face':
      case 'turn':
        return NORMAL_SPEED;
    }
  }

  switch (state.avatarMode) {
    case 'machBike': {
      const nextCounter = previousRunningState === 'moving' && previousFacing === attemptedDirection
        ? Math.min(2, (state.bikeFrameCounter ?? 0) + 1)
        : 0;
      bikeUpdateBikeCounterSpeed(state, nextCounter as 0 | 1 | 2);
      return MACH_BIKE_SPEEDS[nextCounter];
    }
    case 'acroBike':
      bikeClearState(state);
      return FASTER_SPEED;
    case 'surfing':
      bikeClearState(state);
      return FAST_SPEED;
    case 'normal':
    default:
      bikeClearState(state);
      return playerNotOnBikeMoving(state, map, input, currentBehavior, attemptedDirection).speed;
  }
};

export const getPlayerRuntimeObject = (state: PlayerState, map: TileMap): FieldRuntimeObject => {
  ensurePlayerCollisionState(state, map);

  return {
    id: 'player',
    currentTile: vec2(state.currentTile!.x, state.currentTile!.y),
    previousTile: vec2(state.previousTile!.x, state.previousTile!.y),
    facing: state.facing,
    initialTile: vec2(state.currentTile!.x, state.currentTile!.y),
    movementRangeX: 0,
    movementRangeY: 0,
    currentElevation: state.currentElevation ?? 0,
    previousElevation: state.previousElevation ?? state.currentElevation ?? 0,
    trackedByCamera: true,
    avatarMode: state.avatarMode ?? 'normal'
  };
};

const evaluateFallbackCollision = (
  state: PlayerState,
  map: TileMap,
  direction: PlayerState['facing']
): FieldCollisionEvaluation => {
  ensurePlayerCollisionState(state, map);
  return evaluateFieldCollision({
    map,
    object: getPlayerRuntimeObject(state, map),
    direction
  });
};

export const stepPlayer = (
  state: PlayerState,
  input: InputSnapshot,
  map: TileMap,
  dtSeconds: number,
  evaluateCollision?: (direction: PlayerState['facing']) => FieldCollisionEvaluation
): StepPlayerResult => {
  ensurePlayerCollisionState(state, map);
  const startPixelTile = getPlayerTilePosition(state.position, map.tileSize);
  let collision: FieldCollisionEvaluation | null = null;
  let connectionTransition: FieldCollisionEvaluation | null = null;
  let attemptedDirection: PlayerState['facing'] | null = null;
  let bikeTransition: BikeTransition | null = null;
  let forcedMovement: ForcedMovementInstruction | null = null;
  let resultForcedMovement = state.stepForcedMovement === true;
  let appliedFrameSpeed = state.stepSpeed !== undefined;
  let remainingDistance = dtSeconds * (state.stepSpeed ?? NORMAL_SPEED);

  while (remainingDistance > PLAYER_STEP_EPSILON) {
    if (!state.stepTarget || !state.stepDirection || !state.stepSpeed) {
      const currentBehavior = state.currentTile
        ? MapGridGetMetatileBehaviorAt(map, state.currentTile.x, state.currentTile.y)
        : null;
      bikeTransition = null;
      forcedMovement = getForcedMovementInstruction(state, map);
      if (forcedMovement) {
        attemptedDirection = forcedMovement.direction;
      } else if (isBikeAvatar(state.avatarMode)) {
        bikeTransition = resolveBikeTransition(state, input, currentBehavior);
        attemptedDirection = bikeTransition.kind === 'face' ? null : bikeTransition.direction;
        if (bikeTransition.kind === 'face' || bikeTransition.kind === 'turn') {
          state.facing = canBikeFaceDirectionOnRail(bikeTransition.direction, currentBehavior)
            ? bikeTransition.direction
            : state.facing;
          state.moving = false;
          state.animationTime = 0;
          return {
            attemptedDirection,
            collision,
            enteredNewTile: false,
            forcedMovement: resultForcedMovement,
            connectionTransition
          };
        }
      } else {
        attemptedDirection = resolveInputDirection(input);
      }
      if (!attemptedDirection) {
        bikeClearState(state);
        playerNotOnBikeNotMoving(state);
        return {
          attemptedDirection,
          collision,
          enteredNewTile: false,
          forcedMovement: resultForcedMovement,
          connectionTransition
        };
      }

      const previousFacing = state.facing;
      const previousRunningState = state.runningState ?? 'notMoving';
      if (!forcedMovement && !bikeTransition) {
        const movementInput = checkMovementInputNotOnBike(state, attemptedDirection);
        if (movementInput === 'turningInPlace') {
          playerNotOnBikeTurningInPlace(state, attemptedDirection);
          bikeClearState(state);
          return {
            attemptedDirection,
            collision,
            enteredNewTile: false,
            forcedMovement: resultForcedMovement,
            connectionTransition
          };
        }
      }

      state.facing = attemptedDirection;
      resultForcedMovement = forcedMovement !== null;
      collision = evaluateCollision?.(attemptedDirection) ?? evaluateFallbackCollision(state, map, attemptedDirection);
      let bikeCollisionCount = false;
      if (bikeTransition) {
        const currentBikeBehavior = MapGridGetMetatileBehaviorAt(map, state.previousTile?.x ?? state.currentTile!.x, state.previousTile?.y ?? state.currentTile!.y);
        if (!canBikeFaceDirectionOnRail(attemptedDirection, currentBikeBehavior)) {
          state.facing = previousFacing;
          state.moving = false;
          return {
            attemptedDirection,
            collision,
            enteredNewTile: false,
            forcedMovement: resultForcedMovement,
            connectionTransition
          };
        }

        const bikeCollision = applyBikeCollisionRules(state, map, attemptedDirection, collision);
        collision = bikeCollision.collision;
        bikeCollisionCount = bikeCollision.collisionCount;
      }

      if (collision.target?.map.id !== map.id && !isBlockingCollision(collision)) {
        state.runningState = bikeTransition
          ? state.runningState ?? 'notMoving'
          : 'notMoving';
        clearPlayerMovement(state, map);
        connectionTransition = collision;
        return {
          attemptedDirection,
          collision,
          enteredNewTile: false,
          forcedMovement: resultForcedMovement,
          connectionTransition
        };
      }

      const stepSpeed = getStepSpeed(
        state,
        map,
        input,
        currentBehavior,
        attemptedDirection,
        previousFacing,
        previousRunningState,
        bikeTransition?.kind
      );
      const movementSpeed = forcedMovement?.speed ?? (bikeCollisionCount ? FAST_SPEED : stepSpeed);
      if (!startPlayerStep(state, map, attemptedDirection, movementSpeed, collision, resultForcedMovement)) {
        bikeClearState(state);
        clearPlayerMovement(state, map);
        return {
          attemptedDirection,
          collision,
          enteredNewTile: false,
          forcedMovement: resultForcedMovement,
          connectionTransition
        };
      }
      if (!appliedFrameSpeed) {
        remainingDistance = dtSeconds * movementSpeed;
        appliedFrameSpeed = true;
      }
      state.runningState = 'moving';
    }

    const hadStepTarget = state.stepTarget !== undefined;
    remainingDistance = advancePlayerStep(state, map, remainingDistance);
    if (state.stepTarget) {
      break;
    }
    if (hadStepTarget) {
      break;
    }
  }

  if (!state.stepTarget) {
    state.moving = false;
    state.animationTime = 0;
    state.runningState = 'notMoving';
  } else {
    state.moving = true;
    state.animationTime += dtSeconds;
  }

  const endPixelTile = getPlayerTilePosition(state.position, map.tileSize);
  return {
    attemptedDirection,
    collision,
    enteredNewTile: startPixelTile.x !== endPixelTile.x || startPixelTile.y !== endPixelTile.y,
    forcedMovement: resultForcedMovement,
    connectionTransition
  };
};
