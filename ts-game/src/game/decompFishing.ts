import { vec2 } from '../core/vec2';
import {
  MapGridGetCollisionAt,
  MapGridGetMetatileBehaviorAt,
  type TileMap
} from '../world/tileMap';
import type { DialogueState } from './interaction';
import { openDialogueSequence } from './interaction';
import {
  evaluateBaseFieldCollision,
  getDirectionVector,
  MetatileAtCoordsIsWaterTile,
  MetatileBehavior_IsBridge,
  MetatileBehavior_IsSurfable,
  MetatileBehavior_IsWaterfall,
  resolveStepTarget
} from './fieldCollision';
import { getPlayerRuntimeObject, type PlayerState } from './player';
import {
  getPlayerAvatarFlags,
  PLAYER_AVATAR_FLAG_SURFING,
  PLAYER_AVATAR_FLAG_UNDERWATER
} from './playerAvatarTransition';
import type { ScriptRuntimeState } from './scripts';

export const OLD_ROD = 0;
export const GOOD_ROD = 1;
export const SUPER_ROD = 2;

export type FishingRod = typeof OLD_ROD | typeof GOOD_ROD | typeof SUPER_ROD;

export interface FishingTaskState {
  active: boolean;
  step: number;
  rod: FishingRod;
  roundsPlayed: number;
  minRoundsRequired: number;
  playerGraphicsMode: PlayerState['avatarGraphicsMode'];
}

export const getFishingRodSecondaryId = (itemId: string): FishingRod | null => {
  switch (itemId) {
    case 'ITEM_OLD_ROD':
      return OLD_ROD;
    case 'ITEM_GOOD_ROD':
      return GOOD_ROD;
    case 'ITEM_SUPER_ROD':
      return SUPER_ROD;
    default:
      return null;
  }
};

const getTileOneStepInFrontOfPlayer = (player: PlayerState): { x: number; y: number } => {
  const currentTile = player.currentTile
    ?? vec2(Math.floor((player.position.x + 8) / 16), Math.floor((player.position.y + 12) / 16));
  const direction = getDirectionVector(player.facing);
  return vec2(currentTile.x + direction.x, currentTile.y + direction.y);
};

export const isPlayerFacingSurfableFishableWater = (
  player: PlayerState,
  map: TileMap
): boolean => {
  const playerObject = getPlayerRuntimeObject(player, map);
  const target = resolveStepTarget(map, playerObject.currentTile, player.facing);
  if (!target) {
    return false;
  }

  const collision = evaluateBaseFieldCollision(map, playerObject, player.facing, target, []);
  return collision.result === 'elevationMismatch'
    && (player.currentElevation ?? 0) === 3
    && MetatileAtCoordsIsWaterTile(target.map, target.tile.x, target.tile.y);
};

export const canFish = (
  player: PlayerState,
  map: TileMap
): boolean => {
  const frontTile = getTileOneStepInFrontOfPlayer(player);
  const behavior = MapGridGetMetatileBehaviorAt(map, frontTile.x, frontTile.y);
  if (MetatileBehavior_IsWaterfall(behavior)) {
    return false;
  }

  const flags = getPlayerAvatarFlags(player);
  if (flags & PLAYER_AVATAR_FLAG_UNDERWATER) {
    return false;
  }

  if (!(flags & PLAYER_AVATAR_FLAG_SURFING)) {
    return isPlayerFacingSurfableFishableWater(player, map);
  }

  if (MetatileBehavior_IsSurfable(behavior) && MapGridGetCollisionAt(map, frontTile.x, frontTile.y) === 0) {
    return true;
  }

  return MetatileBehavior_IsBridge(behavior);
};

export const startFishing = (
  runtime: ScriptRuntimeState,
  player: PlayerState,
  rod: FishingRod
): FishingTaskState => {
  const task: FishingTaskState = {
    active: true,
    step: 0,
    rod,
    roundsPlayed: 0,
    minRoundsRequired: 0,
    playerGraphicsMode: player.avatarGraphicsMode ?? 'normal'
  };

  runtime.fieldEffects.fishing = task;
  player.controllable = false;
  player.avatarPreventStep = true;
  player.avatarGraphicsMode = 'fish';
  runtime.lastScriptId = 'fieldEffect.fishing.start';
  return task;
};

export const fieldUseFuncRod = (
  runtime: ScriptRuntimeState,
  player: PlayerState,
  map: TileMap,
  rod: FishingRod,
  dialogue?: DialogueState
): boolean => {
  if (!canFish(player, map)) {
    runtime.lastScriptId = 'item.rod.notTheTime';
    if (dialogue) {
      openDialogueSequence(dialogue, 'system', ["OAK: This isn't the time to use that!"]);
    }
    return false;
  }

  startFishing(runtime, player, rod);
  return true;
};
