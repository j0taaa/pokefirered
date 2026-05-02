import { vec2, type Vec2 } from '../core/vec2';
import {
  getCollisionAtCoords,
  resolveStepTarget,
  type FieldCollisionEvaluation,
  type FieldRuntimeObject
} from './fieldCollision';
import { getCollisionTilePosition, MapGridGetElevationAt, type TileMap } from '../world/tileMap';
import type { PlayerState } from './player';
import { getPlayerRuntimeObject } from './player';
import { getDecompMovementDirectionFacings } from './decompObjectEventMovementTypeTables';

export interface NpcPathPoint {
  x: number;
  y: number;
}

export interface NpcState {
  id: string;
  position: Vec2;
  path: NpcPathPoint[];
  pathIndex: number;
  facing: 'up' | 'down' | 'left' | 'right';
  initialFacing?: 'up' | 'down' | 'left' | 'right';
  moving: boolean;
  animationTime?: number;
  idleDurationSeconds: number;
  idleTimeRemaining: number;
  graphicsId?: string;
  movementType?: string;
  interactScriptId?: string;
  flag?: string;
  itemId?: string;
  dialogueLines: string[];
  dialogueIndex: number;
  initialTile?: Vec2;
  currentTile?: Vec2;
  previousTile?: Vec2;
  movementRangeX?: number;
  movementRangeY?: number;
  currentElevation?: number;
  previousElevation?: number;
  active?: boolean;
  invisible?: boolean;
  fixedPriority?: boolean;
  facingLocked?: boolean;
  movementDirection?: 'up' | 'down' | 'left' | 'right';
  previousMovementDirection?: 'up' | 'down' | 'left' | 'right';
  movementDelayFrames?: number;
  lastMovementActionId?: number;
  lastStartedMovementActionId?: number;
  animationDisabled?: boolean;
  activeEmote?: string;
  affineAnimInitialized?: boolean;
  renderPriority?: number;
  renderSubpriority?: number;
  stepTarget?: Vec2;
  stepDirection?: 'up' | 'down' | 'left' | 'right';
  directionSequenceIndex?: number;
}

export const getObjectEventHiddenFlag = (npcId: string): string => `__object_hidden__.${npcId}`;

export const hideObjectEvent = (flags: Set<string>, npcId: string): void => {
  flags.add(getObjectEventHiddenFlag(npcId));
};

export const showObjectEvent = (flags: Set<string>, npcId: string): void => {
  flags.delete(getObjectEventHiddenFlag(npcId));
};

export const removeObjectEvent = (flags: Set<string>, npc: NpcState): void => {
  if (npc.flag && npc.flag !== '0') {
    flags.add(npc.flag);
  }
  npc.active = false;
  npc.moving = false;
  npc.animationTime = 0;
  delete npc.stepTarget;
  delete npc.stepDirection;
};

export const addObjectEvent = (flags: Set<string>, npc: NpcState): void => {
  showObjectEvent(flags, npc.id);
  npc.active = true;
  npc.invisible = false;
  npc.moving = false;
  npc.animationTime = 0;
  delete npc.stepTarget;
  delete npc.stepDirection;
};

export const setObjectEventInvisibility = (npc: NpcState, invisible: boolean): void => {
  npc.invisible = invisible;
};

const NPC_SPEED = 24;
const ARRIVAL_EPSILON = 0.75;
const STEP_EPSILON = 0.001;
const MEDIUM_MOVEMENT_DELAYS_SECONDS = [32 / 60, 64 / 60, 96 / 60, 128 / 60] as const;
const SHORT_MOVEMENT_DELAYS_SECONDS = [32 / 60, 48 / 60, 64 / 60, 80 / 60] as const;
const WALK_IN_PLACE_NORMAL_SECONDS = 16 / 60;
const ELEVATION_TO_RENDER_PRIORITY = [2, 2, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 0, 2] as const;

type NpcDirection = NpcState['facing'];

const getRenderPriorityForElevation = (elevation?: number): number => {
  if (Number.isInteger(elevation)) {
    const normalizedElevation = elevation as number;
    if (normalizedElevation >= 0 && normalizedElevation < ELEVATION_TO_RENDER_PRIORITY.length) {
      return ELEVATION_TO_RENDER_PRIORITY[normalizedElevation];
    }
  }

  return ELEVATION_TO_RENDER_PRIORITY[3];
};

export const setNpcFixedSubpriority = (npc: NpcState, subpriority: number): void => {
  npc.fixedPriority = true;
  npc.renderPriority = getRenderPriorityForElevation(npc.previousElevation ?? npc.currentElevation);
  npc.renderSubpriority = subpriority;
};

export const resetNpcFixedSubpriority = (npc: NpcState): void => {
  npc.fixedPriority = false;
  delete npc.renderPriority;
  delete npc.renderSubpriority;
};

const ensureNpcCollisionState = (npc: NpcState, map: TileMap): void => {
  const tile = getCollisionTilePosition(npc.position, map.tileSize);
  npc.initialTile ??= vec2(tile.x, tile.y);
  if (
    !npc.currentTile
    || !npc.previousTile
    || (
      !npc.stepTarget
      && (npc.currentTile.x !== tile.x || npc.currentTile.y !== tile.y)
    )
  ) {
    npc.currentTile = vec2(tile.x, tile.y);
    npc.previousTile = vec2(tile.x, tile.y);
    npc.currentElevation = MapGridGetElevationAt(map, tile.x, tile.y);
    npc.previousElevation = npc.currentElevation;
  }
  npc.movementRangeX ??= 0;
  npc.movementRangeY ??= 0;
  npc.currentElevation ??= MapGridGetElevationAt(map, npc.currentTile.x, npc.currentTile.y);
  npc.previousElevation ??= npc.currentElevation;
};

const updateNpcCollisionStateForPosition = (npc: NpcState, map: TileMap): void => {
  const tile = getCollisionTilePosition(npc.position, map.tileSize);
  npc.currentTile = vec2(tile.x, tile.y);
  npc.previousTile = vec2(tile.x, tile.y);
  npc.currentElevation = MapGridGetElevationAt(map, tile.x, tile.y);
  npc.previousElevation = npc.currentElevation;
};

const decompDirections = (tableName: string): readonly NpcDirection[] =>
  getDecompMovementDirectionFacings(tableName);

const STANDARD_DIRECTIONS = decompDirections('gStandardDirections');
const UP_AND_DOWN_DIRECTIONS = decompDirections('gUpAndDownDirections');
const LEFT_AND_RIGHT_DIRECTIONS = decompDirections('gLeftAndRightDirections');

const FACE_DIRECTION_CHOICES: Record<string, readonly NpcDirection[]> = {
  MOVEMENT_TYPE_LOOK_AROUND: STANDARD_DIRECTIONS,
  MOVEMENT_TYPE_FACE_DOWN_AND_UP: UP_AND_DOWN_DIRECTIONS,
  MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT: LEFT_AND_RIGHT_DIRECTIONS,
  MOVEMENT_TYPE_FACE_UP_AND_LEFT: decompDirections('gUpAndLeftDirections'),
  MOVEMENT_TYPE_FACE_UP_AND_RIGHT: decompDirections('gUpAndRightDirections'),
  MOVEMENT_TYPE_FACE_DOWN_AND_LEFT: decompDirections('gDownAndLeftDirections'),
  MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT: decompDirections('gDownAndRightDirections'),
  MOVEMENT_TYPE_FACE_DOWN_UP_AND_LEFT: decompDirections('gDownUpAndLeftDirections'),
  MOVEMENT_TYPE_FACE_DOWN_UP_AND_RIGHT: decompDirections('gDownUpAndRightDirections'),
  MOVEMENT_TYPE_FACE_UP_LEFT_AND_RIGHT: decompDirections('gUpLeftAndRightDirections'),
  MOVEMENT_TYPE_FACE_DOWN_LEFT_AND_RIGHT: decompDirections('gDownLeftAndRightDirections')
};

const WALK_SEQUENCE_DIRECTIONS: Record<string, readonly NpcDirection[]> = {
  MOVEMENT_TYPE_WALK_SEQUENCE_UP_RIGHT_LEFT_DOWN: decompDirections('gUpRightLeftDownDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_LEFT_DOWN_UP: decompDirections('gRightLeftDownUpDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_UP_RIGHT_LEFT: decompDirections('gDownUpRightLeftDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_DOWN_UP_RIGHT: decompDirections('gLeftDownUpRightDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_RIGHT_DOWN: decompDirections('gUpLeftRightDownDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_RIGHT_DOWN_UP: decompDirections('gLeftRightDownUpDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_UP_LEFT_RIGHT: decompDirections('gDownUpLeftRightDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_DOWN_UP_LEFT: decompDirections('gRightDownUpLeftDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_DOWN_RIGHT: decompDirections('gLeftUpDownRightDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_UP_DOWN_RIGHT_LEFT: decompDirections('gUpDownRightLeftDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_LEFT_UP_DOWN: decompDirections('gRightLeftUpDownDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_RIGHT_LEFT_UP: decompDirections('gDownRightLeftUpDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_UP_DOWN_LEFT: decompDirections('gRightUpDownLeftDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_UP_DOWN_LEFT_RIGHT: decompDirections('gUpDownLeftRightDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_RIGHT_UP_DOWN: decompDirections('gLeftRightUpDownDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_LEFT_RIGHT_UP: decompDirections('gDownLeftRightUpDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_DOWN_RIGHT: decompDirections('gUpLeftDownRightDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_RIGHT_UP_LEFT: decompDirections('gDownRightUpLeftDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_DOWN_RIGHT_UP: decompDirections('gLeftDownRightUpDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_UP_LEFT_DOWN: decompDirections('gRightUpLeftDownDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_UP_RIGHT_DOWN_LEFT: decompDirections('gUpRightDownLeftDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_LEFT_UP_RIGHT: decompDirections('gDownLeftUpRightDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_RIGHT_DOWN: decompDirections('gLeftUpRightDownDirections'),
  MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_DOWN_LEFT_UP: decompDirections('gRightDownLeftUpDirections')
};

const RANGED_MOVEMENT_TYPES = new Set<string>([
  'MOVEMENT_TYPE_WANDER_AROUND',
  'MOVEMENT_TYPE_WANDER_UP_AND_DOWN',
  'MOVEMENT_TYPE_WANDER_DOWN_AND_UP',
  'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT',
  'MOVEMENT_TYPE_WANDER_RIGHT_AND_LEFT',
  'MOVEMENT_TYPE_WALK_UP_AND_DOWN',
  'MOVEMENT_TYPE_WALK_DOWN_AND_UP',
  'MOVEMENT_TYPE_WALK_LEFT_AND_RIGHT',
  'MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT',
  ...Object.keys(WALK_SEQUENCE_DIRECTIONS),
  'MOVEMENT_TYPE_WANDER_AROUND_SLOWER'
]);

export const SUPPORTED_NPC_MOVEMENT_TYPES = new Set<string>([
  'MOVEMENT_TYPE_NONE',
  'MOVEMENT_TYPE_LOOK_AROUND',
  'MOVEMENT_TYPE_WANDER_AROUND',
  'MOVEMENT_TYPE_WANDER_UP_AND_DOWN',
  'MOVEMENT_TYPE_WANDER_DOWN_AND_UP',
  'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT',
  'MOVEMENT_TYPE_WANDER_RIGHT_AND_LEFT',
  'MOVEMENT_TYPE_FACE_UP',
  'MOVEMENT_TYPE_FACE_DOWN',
  'MOVEMENT_TYPE_FACE_LEFT',
  'MOVEMENT_TYPE_FACE_RIGHT',
  ...Object.keys(FACE_DIRECTION_CHOICES),
  'MOVEMENT_TYPE_WALK_UP_AND_DOWN',
  'MOVEMENT_TYPE_WALK_DOWN_AND_UP',
  'MOVEMENT_TYPE_WALK_LEFT_AND_RIGHT',
  'MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT',
  ...Object.keys(WALK_SEQUENCE_DIRECTIONS),
  'MOVEMENT_TYPE_INVISIBLE',
  'MOVEMENT_TYPE_WANDER_AROUND_SLOWER'
]);

const facingFromMovementType = (movementType?: string): NpcDirection => {
  switch (movementType) {
    case 'MOVEMENT_TYPE_FACE_UP':
    case 'MOVEMENT_TYPE_WANDER_UP_AND_DOWN':
    case 'MOVEMENT_TYPE_WALK_UP_AND_DOWN':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_UP_RIGHT_LEFT_DOWN':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_RIGHT_DOWN':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_UP_DOWN_RIGHT_LEFT':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_UP_DOWN_LEFT_RIGHT':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_DOWN_RIGHT':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_UP_RIGHT_DOWN_LEFT':
    case 'MOVEMENT_TYPE_FACE_UP_AND_LEFT':
    case 'MOVEMENT_TYPE_FACE_UP_AND_RIGHT':
    case 'MOVEMENT_TYPE_FACE_UP_LEFT_AND_RIGHT':
      return 'up';
    case 'MOVEMENT_TYPE_FACE_LEFT':
    case 'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT':
    case 'MOVEMENT_TYPE_WALK_LEFT_AND_RIGHT':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_DOWN_UP_RIGHT':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_RIGHT_DOWN_UP':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_DOWN_RIGHT':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_RIGHT_UP_DOWN':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_DOWN_RIGHT_UP':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_RIGHT_DOWN':
    case 'MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT':
      return 'left';
    case 'MOVEMENT_TYPE_FACE_RIGHT':
    case 'MOVEMENT_TYPE_WANDER_RIGHT_AND_LEFT':
    case 'MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_LEFT_DOWN_UP':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_DOWN_UP_LEFT':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_LEFT_UP_DOWN':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_UP_DOWN_LEFT':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_UP_LEFT_DOWN':
    case 'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_DOWN_LEFT_UP':
      return 'right';
    case 'MOVEMENT_TYPE_FACE_DOWN':
    default:
      return 'down';
  }
};

const inferItemIdFromScript = (scriptId?: string, graphicsId?: string): string | undefined => {
  if (graphicsId !== 'OBJ_EVENT_GFX_ITEM_BALL' || !scriptId) {
    return undefined;
  }

  const match = scriptId.match(/_EventScript_Item([A-Za-z0-9]+)/u);
  if (!match) {
    return undefined;
  }

  return `ITEM_${match[1]
    .replace(/([A-Z]+)([A-Z][a-z])/gu, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/gu, '$1_$2')
    .toUpperCase()}`;
};

export const createPrototypeNpcs = (): NpcState[] => [
  {
    id: 'npc-lass-01',
    position: vec2(6 * 16, 5 * 16),
    path: [
      { x: 6 * 16, y: 5 * 16 },
      { x: 8 * 16, y: 5 * 16 },
      { x: 8 * 16, y: 7 * 16 },
      { x: 6 * 16, y: 7 * 16 }
    ],
    pathIndex: 1,
    facing: 'right',
    initialFacing: 'right',
    moving: false,
    animationTime: 0,
    idleDurationSeconds: 0.35,
    idleTimeRemaining: 0,
    dialogueLines: [],
    dialogueIndex: 0,
    initialTile: vec2(6, 5),
    currentTile: vec2(6, 5),
    previousTile: vec2(6, 5),
    movementRangeX: 0,
    movementRangeY: 0,
    currentElevation: 0,
    previousElevation: 0,
    graphicsId: 'OBJ_EVENT_GFX_LASS',
    interactScriptId: 'object.npc-lass-01.interact'
  },
  {
    id: 'npc-bugcatcher-01',
    position: vec2(3 * 16, 8 * 16),
    path: [
      { x: 3 * 16, y: 8 * 16 },
      { x: 5 * 16, y: 8 * 16 }
    ],
    pathIndex: 1,
    facing: 'right',
    initialFacing: 'right',
    moving: false,
    animationTime: 0,
    idleDurationSeconds: 0.5,
    idleTimeRemaining: 0,
    dialogueLines: [],
    dialogueIndex: 0,
    initialTile: vec2(3, 8),
    currentTile: vec2(3, 8),
    previousTile: vec2(3, 8),
    movementRangeX: 0,
    movementRangeY: 0,
    currentElevation: 0,
    previousElevation: 0,
    graphicsId: 'OBJ_EVENT_GFX_BUG_CATCHER',
    interactScriptId: 'object.npc-bugcatcher-01.interact'
  }
];

export const createMapNpcs = (map: TileMap): NpcState[] =>
  map.npcs.map((npc) => {
    const tile = vec2(npc.x, npc.y);
    const elevation = MapGridGetElevationAt(map, tile.x, tile.y);

    const facing = facingFromMovementType(npc.movementType);
    const movementRangeX = RANGED_MOVEMENT_TYPES.has(npc.movementType) && npc.movementRangeX === 0
      ? 1
      : npc.movementRangeX;
    const movementRangeY = RANGED_MOVEMENT_TYPES.has(npc.movementType) && npc.movementRangeY === 0
      ? 1
      : npc.movementRangeY;

    return {
      id: npc.id,
      position: vec2(npc.x * map.tileSize, npc.y * map.tileSize),
      path: [],
      pathIndex: 0,
      facing,
      initialFacing: facing,
      moving: false,
      animationTime: 0,
      idleDurationSeconds: 0.3,
      idleTimeRemaining: 0,
      graphicsId: npc.graphicsId,
      movementType: npc.movementType,
      interactScriptId: npc.scriptId,
      flag: npc.flag,
      itemId: inferItemIdFromScript(npc.scriptId, npc.graphicsId),
      dialogueLines: [],
      dialogueIndex: 0,
      initialTile: tile,
      currentTile: vec2(tile.x, tile.y),
      previousTile: vec2(tile.x, tile.y),
      movementRangeX,
      movementRangeY,
      currentElevation: elevation,
      previousElevation: elevation,
      invisible: npc.movementType === 'MOVEMENT_TYPE_INVISIBLE',
      directionSequenceIndex: 0
    };
  });

export const isNpcVisible = (npc: NpcState, flags: ReadonlySet<string>): boolean => {
  if (npc.active === false || npc.invisible || flags.has(getObjectEventHiddenFlag(npc.id))) {
    return false;
  }

  if (npc.active === true) {
    return true;
  }

  return !npc.flag || npc.flag === '0' || !flags.has(npc.flag);
};

export const trySpawnObjectEvents = (npcs: NpcState[], flags: Set<string>): void => {
  for (const npc of npcs) {
    if (
      npc.active === false
      && npc.flag
      && npc.flag !== '0'
      && !flags.has(npc.flag)
      && !flags.has(getObjectEventHiddenFlag(npc.id))
    ) {
      addObjectEvent(flags, npc);
    }
  }
};

const updateFacing = (npc: NpcState, dx: number, dy: number): void => {
  if (Math.abs(dx) >= Math.abs(dy)) {
    npc.facing = dx >= 0 ? 'right' : 'left';
    return;
  }

  npc.facing = dy >= 0 ? 'down' : 'up';
};

const getCommittedElevation = (map: TileMap, tile: Vec2, fallback: number): number => {
  const elevation = MapGridGetElevationAt(map, tile.x, tile.y);
  return elevation === 0 || elevation === 15 ? fallback : elevation;
};

const snapNpcToStepTarget = (npc: NpcState, map: TileMap): void => {
  if (!npc.stepTarget) {
    delete npc.stepDirection;
    return;
  }

  npc.position = vec2(npc.stepTarget.x, npc.stepTarget.y);
  delete npc.stepTarget;
  delete npc.stepDirection;
  updateNpcCollisionStateForPosition(npc, map);
};

const advanceNpcStep = (npc: NpcState, map: TileMap, distance: number): number => {
  if (!npc.stepTarget) {
    return distance;
  }

  const dx = npc.stepTarget.x - npc.position.x;
  const dy = npc.stepTarget.y - npc.position.y;
  const remaining = Math.hypot(dx, dy);

  if (remaining <= STEP_EPSILON) {
    snapNpcToStepTarget(npc, map);
    return distance;
  }

  const traveled = Math.min(distance, remaining);
  npc.position = vec2(
    npc.position.x + (dx / remaining) * traveled,
    npc.position.y + (dy / remaining) * traveled
  );

  if (traveled + STEP_EPSILON >= remaining) {
    snapNpcToStepTarget(npc, map);
  }

  return distance - traveled;
};

const isNpcCollisionBlocking = (collision: FieldCollisionEvaluation): boolean => collision.result !== 'none';

const choose = <T>(values: readonly T[], random: () => number): T =>
  values[Math.trunc(random() * values.length) % values.length];

const getNpcObjectsForCollision = (
  npcs: NpcState[],
  map: TileMap,
  player: PlayerState | null,
  visibilityFlags: ReadonlySet<string>
): FieldRuntimeObject[] => {
  const playerObject = player ? getPlayerRuntimeObject(player, map) : null;
  return [
    ...npcs
      .filter((candidate) => isNpcVisible(candidate, visibilityFlags))
      .map((candidate) => getNpcRuntimeObject(candidate, map)),
    ...(playerObject ? [playerObject] : [])
  ];
};

const tryStartNpcStep = (
  npc: NpcState,
  map: TileMap,
  direction: NpcDirection,
  objects: readonly FieldRuntimeObject[]
): FieldCollisionEvaluation => {
  npc.facing = direction;
  const npcObject = getNpcRuntimeObject(npc, map);
  const target = resolveStepTarget(map, npcObject.currentTile, direction);
  const collision = !target
    ? { result: 'impassable' as const, target: null }
    : getCollisionAtCoords(map, npcObject, direction, target, objects);

  if (!collision.target || collision.target.map.id !== map.id || isNpcCollisionBlocking(collision)) {
    return collision;
  }

  const currentTile = npc.currentTile!;
  npc.previousTile = vec2(currentTile.x, currentTile.y);
  npc.currentTile = vec2(collision.target.tile.x, collision.target.tile.y);
  npc.previousElevation = npc.currentElevation ?? MapGridGetElevationAt(map, currentTile.x, currentTile.y);
  npc.currentElevation = getCommittedElevation(map, collision.target.tile, npc.previousElevation);
  npc.stepDirection = direction;
  npc.stepTarget = vec2(collision.target.tile.x * map.tileSize, collision.target.tile.y * map.tileSize);
  return collision;
};

const stepNpcMotion = (npc: NpcState, map: TileMap, dtSeconds: number): void => {
  const speed = npc.movementType === 'MOVEMENT_TYPE_WANDER_AROUND_SLOWER'
    ? NPC_SPEED / 2
    : NPC_SPEED;
  advanceNpcStep(npc, map, speed * dtSeconds);
  if (npc.stepTarget) {
    npc.moving = true;
    npc.animationTime = (npc.animationTime ?? 0) + dtSeconds;
  } else {
    npc.moving = false;
    npc.animationTime = 0;
  }
};

const getWanderDirections = (movementType: string): readonly NpcDirection[] | null => {
  switch (movementType) {
    case 'MOVEMENT_TYPE_WANDER_AROUND':
    case 'MOVEMENT_TYPE_WANDER_AROUND_SLOWER':
      return STANDARD_DIRECTIONS;
    case 'MOVEMENT_TYPE_WANDER_UP_AND_DOWN':
    case 'MOVEMENT_TYPE_WANDER_DOWN_AND_UP':
      return UP_AND_DOWN_DIRECTIONS;
    case 'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT':
    case 'MOVEMENT_TYPE_WANDER_RIGHT_AND_LEFT':
      return LEFT_AND_RIGHT_DIRECTIONS;
    default:
      return null;
  }
};

const getBackAndForthDirection = (npc: NpcState): NpcDirection | null => {
  const initialDirection = facingFromMovementType(npc.movementType);
  if (!npc.movementType?.startsWith('MOVEMENT_TYPE_WALK_') || WALK_SEQUENCE_DIRECTIONS[npc.movementType]) {
    return null;
  }

  if ((npc.directionSequenceIndex ?? 0) === 0) {
    return initialDirection;
  }

  switch (initialDirection) {
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

const sameTile = (left: Vec2 | undefined, right: Vec2 | undefined): boolean =>
  !!left && !!right && left.x === right.x && left.y === right.y;

const getFaceMovementDelayOptions = (movementType: string): readonly number[] =>
  movementType === 'MOVEMENT_TYPE_FACE_DOWN_AND_UP' || movementType === 'MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT'
    ? MEDIUM_MOVEMENT_DELAYS_SECONDS
    : SHORT_MOVEMENT_DELAYS_SECONDS;

const maybeSkipReturnedAxisInSequence = (
  npc: NpcState,
  route: readonly NpcDirection[]
): void => {
  const index = npc.directionSequenceIndex ?? 0;
  if (index === 3 && sameTile(npc.initialTile, npc.currentTile)) {
    npc.directionSequenceIndex = 0;
    return;
  }

  const current = npc.currentTile;
  const initial = npc.initialTile;
  if (!current || !initial) {
    return;
  }

  const direction = route[index];
  if ((direction === 'left' || direction === 'right') && current.x === initial.x) {
    npc.directionSequenceIndex = Math.min(3, index + 1);
  } else if ((direction === 'up' || direction === 'down') && current.y === initial.y) {
    npc.directionSequenceIndex = Math.min(3, index + 1);
  }
};

const stepAutonomousNpc = (
  npc: NpcState,
  npcs: NpcState[],
  map: TileMap,
  dtSeconds: number,
  player: PlayerState | null,
  visibilityFlags: ReadonlySet<string>,
  random: () => number
): void => {
  if (npc.stepTarget) {
    stepNpcMotion(npc, map, dtSeconds);
    return;
  }

  const movementType = npc.movementType;
  if (!movementType || movementType === 'MOVEMENT_TYPE_NONE' || movementType.startsWith('MOVEMENT_TYPE_FACE_')) {
    const directions = movementType ? FACE_DIRECTION_CHOICES[movementType] : undefined;
    if (!directions) {
      npc.moving = false;
      npc.animationTime = 0;
      return;
    }

    if (npc.idleTimeRemaining > 0) {
      npc.idleTimeRemaining = Math.max(0, npc.idleTimeRemaining - dtSeconds);
      npc.moving = false;
      npc.animationTime = 0;
      return;
    }

    npc.facing = choose(directions, random);
    npc.idleTimeRemaining = choose(getFaceMovementDelayOptions(movementType ?? ''), random);
    npc.moving = false;
    npc.animationTime = 0;
    return;
  }

  if (!movementType) {
    npc.moving = false;
    npc.animationTime = 0;
    return;
  }

  if (movementType === 'MOVEMENT_TYPE_LOOK_AROUND') {
    if (npc.idleTimeRemaining > 0) {
      npc.idleTimeRemaining = Math.max(0, npc.idleTimeRemaining - dtSeconds);
      npc.moving = false;
      npc.animationTime = 0;
      return;
    }

    npc.facing = choose(STANDARD_DIRECTIONS, random);
    npc.idleTimeRemaining = choose(MEDIUM_MOVEMENT_DELAYS_SECONDS, random);
    npc.moving = false;
    npc.animationTime = 0;
    return;
  }

  const objects = getNpcObjectsForCollision(npcs, map, player, visibilityFlags);
  const wanderDirections = getWanderDirections(movementType);
  if (wanderDirections) {
    if (npc.idleTimeRemaining > 0) {
      npc.idleTimeRemaining = Math.max(0, npc.idleTimeRemaining - dtSeconds);
      npc.moving = false;
      npc.animationTime = 0;
      return;
    }

    const direction = choose(wanderDirections, random);
    const collision = tryStartNpcStep(npc, map, direction, objects);
    if (isNpcCollisionBlocking(collision)) {
      npc.idleTimeRemaining = choose(MEDIUM_MOVEMENT_DELAYS_SECONDS, random);
      npc.moving = false;
      npc.animationTime = 0;
      return;
    }

    stepNpcMotion(npc, map, dtSeconds);
    return;
  }

  const walkSequence = WALK_SEQUENCE_DIRECTIONS[movementType];
  if (walkSequence) {
    maybeSkipReturnedAxisInSequence(npc, walkSequence);
    let direction = walkSequence[npc.directionSequenceIndex ?? 0];
    let collision = tryStartNpcStep(npc, map, direction, objects);
    if (collision.result === 'outsideRange') {
      npc.directionSequenceIndex = Math.min(3, (npc.directionSequenceIndex ?? 0) + 1);
      direction = walkSequence[npc.directionSequenceIndex ?? 0];
      collision = tryStartNpcStep(npc, map, direction, objects);
    }

    if (isNpcCollisionBlocking(collision)) {
      npc.idleTimeRemaining = WALK_IN_PLACE_NORMAL_SECONDS;
      npc.moving = false;
      npc.animationTime = 0;
      return;
    }

    stepNpcMotion(npc, map, dtSeconds);
    return;
  }

  const backAndForthDirection = getBackAndForthDirection(npc);
  if (backAndForthDirection) {
    if ((npc.directionSequenceIndex ?? 0) !== 0 && sameTile(npc.initialTile, npc.currentTile)) {
      npc.directionSequenceIndex = 0;
    }

    let direction = getBackAndForthDirection(npc)!;
    let collision = tryStartNpcStep(npc, map, direction, objects);
    if (collision.result === 'outsideRange') {
      npc.directionSequenceIndex = (npc.directionSequenceIndex ?? 0) + 1;
      direction = getBackAndForthDirection(npc)!;
      collision = tryStartNpcStep(npc, map, direction, objects);
    }

    if (isNpcCollisionBlocking(collision)) {
      npc.idleTimeRemaining = WALK_IN_PLACE_NORMAL_SECONDS;
      npc.moving = false;
      npc.animationTime = 0;
      return;
    }

    stepNpcMotion(npc, map, dtSeconds);
    return;
  }

  npc.moving = false;
  npc.animationTime = 0;
};

export const getNpcRuntimeObject = (npc: NpcState, map: TileMap): FieldRuntimeObject => {
  ensureNpcCollisionState(npc, map);

  return {
    id: npc.id,
    currentTile: vec2(npc.currentTile!.x, npc.currentTile!.y),
    previousTile: vec2(npc.previousTile!.x, npc.previousTile!.y),
    facing: npc.facing,
    initialTile: vec2(npc.initialTile!.x, npc.initialTile!.y),
    movementRangeX: npc.movementRangeX ?? 0,
    movementRangeY: npc.movementRangeY ?? 0,
    currentElevation: npc.currentElevation ?? 0,
    previousElevation: npc.previousElevation ?? npc.currentElevation ?? 0,
    trackedByCamera: false,
    avatarMode: 'normal',
    graphicsId: npc.graphicsId
  };
};

export const stepNpcs = (
  npcs: NpcState[],
  map: TileMap,
  dtSeconds: number,
  player: PlayerState | null = null,
  frozenNpcIds: ReadonlySet<string> = new Set(),
  visibilityFlags: ReadonlySet<string> = new Set(),
  random: () => number = Math.random
): NpcState[] => {
  for (const npc of npcs) {
    ensureNpcCollisionState(npc, map);

    if (!isNpcVisible(npc, visibilityFlags)) {
      npc.moving = false;
      npc.animationTime = 0;
      continue;
    }

    if (frozenNpcIds.has(npc.id)) {
      npc.moving = false;
      npc.animationTime = 0;
      continue;
    }

    if (npc.path.length === 0) {
      stepAutonomousNpc(npc, npcs, map, dtSeconds, player, visibilityFlags, random);
      continue;
    }

    if (npc.idleTimeRemaining > 0) {
      npc.idleTimeRemaining = Math.max(0, npc.idleTimeRemaining - dtSeconds);
      npc.moving = false;
      npc.animationTime = 0;
      continue;
    }

    const target = npc.path[npc.pathIndex];
    const dx = target.x - npc.position.x;
    const dy = target.y - npc.position.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= ARRIVAL_EPSILON) {
      npc.position = vec2(target.x, target.y);
      updateNpcCollisionStateForPosition(npc, map);
      npc.pathIndex = (npc.pathIndex + 1) % npc.path.length;
      npc.idleTimeRemaining = npc.idleDurationSeconds;
      npc.moving = false;
      npc.animationTime = 0;
      continue;
    }

    if (!npc.stepTarget) {
      updateFacing(npc, dx, dy);
      const collision = tryStartNpcStep(
        npc,
        map,
        npc.facing,
        getNpcObjectsForCollision(npcs, map, player, visibilityFlags)
      );

      if (!collision.target || collision.target.map.id !== map.id || isNpcCollisionBlocking(collision)) {
        npc.moving = false;
        npc.animationTime = 0;
        npc.idleTimeRemaining = Math.max(npc.idleTimeRemaining, 0.2);
        continue;
      }

    }

    stepNpcMotion(npc, map, dtSeconds);
  }

  return npcs;
};

export const collidesWithNpcs = (
  probePosition: Vec2,
  npcs: NpcState[],
  radius = 10
): boolean => {
  for (const npc of npcs) {
    const dx = npc.position.x - probePosition.x;
    const dy = npc.position.y - probePosition.y;
    if (Math.hypot(dx, dy) <= radius) {
      return true;
    }
  }

  return false;
};

export const collidesWithNpcsAtTile = (
  tile: Vec2,
  npcs: NpcState[],
  tileSize: number
): boolean => {
  for (const npc of npcs) {
    const npcTile = npc.currentTile ?? getCollisionTilePosition(npc.position, tileSize);
    if (npcTile.x === tile.x && npcTile.y === tile.y) {
      return true;
    }
  }

  return false;
};

export const setNpcTilePosition = (npc: NpcState, map: TileMap, tile: Vec2): void => {
  npc.position = vec2(tile.x * map.tileSize, tile.y * map.tileSize);
  npc.currentTile = vec2(tile.x, tile.y);
  npc.previousTile = vec2(tile.x, tile.y);
  npc.currentElevation = MapGridGetElevationAt(map, tile.x, tile.y);
  npc.previousElevation = npc.currentElevation;
  delete npc.stepTarget;
  delete npc.stepDirection;
  npc.moving = false;
  npc.animationTime = 0;
};
