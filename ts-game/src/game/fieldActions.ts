import { vec2, type Vec2 } from '../core/vec2';
import type { TileDirection } from '../world/tileMap';
import { MapGridGetMetatileBehaviorAt, type TileMap } from '../world/tileMap';
import type { FieldCollisionEvaluation } from './fieldCollision';
import { resolveStepTarget } from './fieldCollision';
import {
  clearPlayerMovement,
  type PlayerState,
  type StepPlayerResult
} from './player';
import {
  setNpcTilePosition,
  type NpcState
} from './npc';
import {
  PLAYER_AVATAR_FLAG_ON_FOOT,
  setPlayerAvatarTransitionFlags
} from './playerAvatarTransition';

const LEDGE_JUMP_DURATION_SECONDS = 8 / 60;
const STOP_SURFING_DURATION_SECONDS = 16 / 60;
const STRENGTH_PUSH_DURATION_SECONDS = 32 / 60;
const MB_FALL_WARP = 0x66;
const MB_STRENGTH_BUTTON = 0x20;

export const GAME_STAT_JUMPED_DOWN_LEDGES = 'gameStat.GAME_STAT_JUMPED_DOWN_LEDGES';

export type FieldActionKind = 'ledgeJump' | 'stopSurfing' | 'pushedBoulder';

export interface FieldActionRuntime {
  vars: Record<string, number>;
}

export interface FieldActionState {
  kind: FieldActionKind;
  direction: TileDirection;
  collision: FieldCollisionEvaluation;
  elapsedSeconds: number;
  durationSeconds: number;
  playerStartPosition: Vec2;
  playerEndPosition: Vec2;
  forcedMovement?: boolean;
  boulderNpcId?: string;
  boulderStartPosition?: Vec2;
  boulderEndPosition?: Vec2;
}

export interface StepFieldActionResult extends StepPlayerResult {
  completed: boolean;
  strengthButtonTile?: Vec2;
}

const lerp = (start: number, end: number, t: number): number => start + (end - start) * t;

const lerpVec2 = (start: Vec2, end: Vec2, t: number): Vec2 =>
  vec2(
    lerp(start.x, end.x, t),
    lerp(start.y, end.y, t)
  );

export const createFieldAction = (
  map: TileMap,
  player: PlayerState,
  npcs: readonly NpcState[],
  collision: FieldCollisionEvaluation,
  direction: TileDirection,
  loadMapById?: (mapId: string) => TileMap | null,
  forcedMovement = false
): FieldActionState | null => {
  switch (collision.result) {
    case 'ledgeJump': {
      if (!collision.movementTarget || collision.movementTarget.map.id !== map.id) {
        return null;
      }
      return {
        kind: 'ledgeJump',
        direction,
        collision,
        elapsedSeconds: 0,
        durationSeconds: LEDGE_JUMP_DURATION_SECONDS,
        playerStartPosition: vec2(player.position.x, player.position.y),
        playerEndPosition: vec2(
          collision.movementTarget.tile.x * map.tileSize,
          collision.movementTarget.tile.y * map.tileSize
        ),
        forcedMovement
      };
    }
    case 'stopSurfing': {
      if (!collision.target || collision.target.map.id !== map.id) {
        return null;
      }
      setPlayerAvatarTransitionFlags(player, PLAYER_AVATAR_FLAG_ON_FOOT);
      return {
        kind: 'stopSurfing',
        direction,
        collision,
        elapsedSeconds: 0,
        durationSeconds: STOP_SURFING_DURATION_SECONDS,
        playerStartPosition: vec2(player.position.x, player.position.y),
        playerEndPosition: vec2(
          collision.target.tile.x * map.tileSize,
          collision.target.tile.y * map.tileSize
        ),
        forcedMovement
      };
    }
    case 'pushedBoulder': {
      if (!collision.blockingObject) {
        return null;
      }

      const boulderNpc = npcs.find((npc) => npc.id === collision.blockingObject?.id);
      if (!boulderNpc) {
        return null;
      }

      const pushTarget = resolveStepTarget(
        map,
        collision.blockingObject.currentTile,
        direction,
        loadMapById
      );
      if (!pushTarget || pushTarget.map.id !== map.id) {
        return null;
      }

      return {
        kind: 'pushedBoulder',
        direction,
        collision,
        elapsedSeconds: 0,
        durationSeconds: STRENGTH_PUSH_DURATION_SECONDS,
        playerStartPosition: vec2(player.position.x, player.position.y),
        playerEndPosition: vec2(player.position.x, player.position.y),
        forcedMovement,
        boulderNpcId: boulderNpc.id,
        boulderStartPosition: vec2(boulderNpc.position.x, boulderNpc.position.y),
        boulderEndPosition: vec2(
          pushTarget.tile.x * map.tileSize,
          pushTarget.tile.y * map.tileSize
        )
      };
    }
    default:
      return null;
  }
};

export const getFieldActionFrozenNpcIds = (
  action: FieldActionState | null,
  npcs: readonly NpcState[]
): ReadonlySet<string> => {
  if (!action) {
    return new Set();
  }
  switch (action.kind) {
    case 'stopSurfing':
      return new Set(npcs.map((npc) => npc.id));
    case 'pushedBoulder':
      return new Set(action.boulderNpcId ? [action.boulderNpcId] : []);
    default:
      return new Set();
  }
};

export const applyFieldActionStartSideEffects = (
  action: FieldActionState,
  runtime: FieldActionRuntime
): void => {
  if (action.kind === 'ledgeJump') {
    runtime.vars[GAME_STAT_JUMPED_DOWN_LEDGES] = (runtime.vars[GAME_STAT_JUMPED_DOWN_LEDGES] ?? 0) + 1;
  }
};

export const stepFieldAction = (
  action: FieldActionState,
  player: PlayerState,
  npcs: NpcState[],
  map: TileMap,
  dtSeconds: number
): StepFieldActionResult => {
  action.elapsedSeconds = Math.min(action.durationSeconds, action.elapsedSeconds + dtSeconds);
  const progress = action.durationSeconds <= 0 ? 1 : action.elapsedSeconds / action.durationSeconds;
  let strengthButtonTile: Vec2 | undefined;

  player.position = lerpVec2(action.playerStartPosition, action.playerEndPosition, progress);
  player.moving = true;
  player.animationTime += dtSeconds;

  if (action.kind === 'pushedBoulder' && action.boulderNpcId && action.boulderStartPosition && action.boulderEndPosition) {
    const boulderNpc = npcs.find((npc) => npc.id === action.boulderNpcId);
    if (boulderNpc) {
      boulderNpc.position = lerpVec2(action.boulderStartPosition, action.boulderEndPosition, progress);
      boulderNpc.moving = true;
      boulderNpc.animationTime = (boulderNpc.animationTime ?? 0) + dtSeconds;
    }
  }

  if (progress < 1) {
    return {
      attemptedDirection: action.direction,
      collision: action.collision,
      enteredNewTile: false,
      forcedMovement: action.forcedMovement === true,
      connectionTransition: null,
      completed: false
    };
  }

  switch (action.kind) {
    case 'stopSurfing':
          setPlayerAvatarTransitionFlags(player, PLAYER_AVATAR_FLAG_ON_FOOT);
      clearPlayerMovement(player, map);
      break;
    case 'pushedBoulder': {
      const boulderNpc = action.boulderNpcId
        ? npcs.find((npc) => npc.id === action.boulderNpcId)
        : undefined;
      if (boulderNpc && action.boulderEndPosition) {
        const boulderTile = vec2(
          Math.round(action.boulderEndPosition.x / map.tileSize),
          Math.round(action.boulderEndPosition.y / map.tileSize)
        );
        setNpcTilePosition(boulderNpc, map, boulderTile);
        const boulderBehavior = MapGridGetMetatileBehaviorAt(map, boulderTile.x, boulderTile.y);
        if (boulderBehavior === MB_FALL_WARP) {
          boulderNpc.active = false;
          boulderNpc.moving = false;
        } else if (boulderBehavior === MB_STRENGTH_BUTTON) {
          strengthButtonTile = boulderTile;
        }
      }
      clearPlayerMovement(player, map);
      break;
    }
    case 'ledgeJump':
      clearPlayerMovement(player, map);
      break;
  }
  if (action.forcedMovement === true) {
    player.controllable = false;
  }

  return {
    attemptedDirection: action.direction,
    collision: action.collision,
    enteredNewTile: action.kind !== 'pushedBoulder',
    forcedMovement: action.forcedMovement === true,
    connectionTransition: null,
    completed: true,
    strengthButtonTile
  };
};
