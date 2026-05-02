import { vec2, type Vec2 } from '../core/vec2';
import type { TileMap, TileDirection } from '../world/tileMap';
import { MapGridGetCollisionAt } from '../world/tileMap';
import type { NpcState } from './npc';
import { getNpcRuntimeObject, isNpcVisible } from './npc';
import type { PlayerState } from './player';
import { getPlayerRuntimeObject } from './player';
import { getCollisionFlagsAtCoords, getCollisionAtCoords, type FieldRuntimeObject } from './fieldCollision';
import { getDecompTrainerBattleInfoForScript } from './decompFieldDialogue';
import type { ScriptRuntimeState } from './scripts';

const TRAINER_TYPE_NORMAL = 'TRAINER_TYPE_NORMAL';
const TRAINER_TYPE_BURIED = 'TRAINER_TYPE_BURIED';
const COLLISION_MASK = ~1;
const EXCLAMATION_FRAMES = 32;
const TRAINER_APPROACH_PIXELS_PER_SECOND = 24;

type TrainerFacing = TileDirection;

export interface FieldTrainerSeeState {
  trainerId: string;
  phase: 'exclamation' | 'approach' | 'ready';
  direction: TrainerFacing;
  approachDistance: number;
  remainingExclamationFrames: number;
}

export interface TrainerSightMatch {
  npc: NpcState;
  direction: TrainerFacing;
  approachDistance: number;
}

const directionOrder: readonly TrainerFacing[] = ['down', 'up', 'left', 'right'];

const directionVector = (direction: TrainerFacing): Vec2 => {
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

const approachDistanceInDirection = (
  trainerTile: Vec2,
  playerTile: Vec2,
  range: number,
  direction: TrainerFacing
): number => {
  switch (direction) {
    case 'down':
      return trainerTile.x === playerTile.x && playerTile.y > trainerTile.y && playerTile.y <= trainerTile.y + range
        ? playerTile.y - trainerTile.y
        : 0;
    case 'up':
      return trainerTile.x === playerTile.x && playerTile.y < trainerTile.y && playerTile.y >= trainerTile.y - range
        ? trainerTile.y - playerTile.y
        : 0;
    case 'left':
      return trainerTile.y === playerTile.y && playerTile.x < trainerTile.x && playerTile.x >= trainerTile.x - range
        ? trainerTile.x - playerTile.x
        : 0;
    case 'right':
      return trainerTile.y === playerTile.y && playerTile.x > trainerTile.x && playerTile.x <= trainerTile.x + range
        ? playerTile.x - trainerTile.x
        : 0;
  }
};

const objectAtTile = (
  objects: readonly FieldRuntimeObject[],
  tile: Vec2,
  ignoredId: string
): FieldRuntimeObject | undefined =>
  objects.find((object) =>
    object.id !== ignoredId
    && object.currentTile.x === tile.x
    && object.currentTile.y === tile.y
  );

const checkPathBetweenTrainerAndPlayer = (
  map: TileMap,
  trainerObject: FieldRuntimeObject,
  playerObject: FieldRuntimeObject,
  direction: TrainerFacing,
  approachDistance: number,
  objects: readonly FieldRuntimeObject[]
): number => {
  if (approachDistance === 0) {
    return 0;
  }

  const vector = directionVector(direction);
  for (let i = 0; i <= approachDistance - 1; i += 1) {
    const tile = vec2(
      trainerObject.currentTile.x + vector.x * i,
      trainerObject.currentTile.y + vector.y * i
    );
    if (MapGridGetCollisionAt(map, tile.x, tile.y) !== 0) {
      return 0;
    }

    const blockingObject = objectAtTile(objects, tile, trainerObject.id);
    if (blockingObject && blockingObject.id !== playerObject.id) {
      return 0;
    }

    const probeObject = { ...trainerObject, currentTile: tile, previousTile: tile };
    const flags = getCollisionFlagsAtCoords(
      map,
      probeObject,
      direction,
      { map, tile, viaConnection: false },
      objects.filter((object) => object.id !== playerObject.id)
    );
    if (flags !== 0 && (flags & COLLISION_MASK) !== 0) {
      return 0;
    }
  }

  const playerTile = vec2(
    trainerObject.currentTile.x + vector.x * approachDistance,
    trainerObject.currentTile.y + vector.y * approachDistance
  );
  const finalProbe = {
    ...trainerObject,
    currentTile: playerTile,
    previousTile: playerTile,
    movementRangeX: 0,
    movementRangeY: 0
  };
  const finalCollision = getCollisionAtCoords(
    map,
    finalProbe,
    direction,
    { map, tile: playerTile, viaConnection: false },
    objects
  );

  return finalCollision.result === 'objectEvent' && finalCollision.blockingObject?.id === playerObject.id
    ? approachDistance
    : 0;
};

const getTrainerApproachDistance = (
  map: TileMap,
  npc: NpcState,
  playerObject: FieldRuntimeObject,
  objects: readonly FieldRuntimeObject[]
): { direction: TrainerFacing; approachDistance: number } | null => {
  const trainerObject = getNpcRuntimeObject(npc, map);
  const playerTile = playerObject.currentTile;
  const range = npc.trainerSightOrBerryTreeId ?? 0;
  const directions = npc.trainerType === TRAINER_TYPE_NORMAL
    ? [npc.facing]
    : directionOrder;

  for (const direction of directions) {
    const approachDistance = approachDistanceInDirection(trainerObject.currentTile, playerTile, range, direction);
    if (
      checkPathBetweenTrainerAndPlayer(
        map,
        trainerObject,
        playerObject,
        direction,
        approachDistance,
        objects
      ) !== 0
    ) {
      return { direction, approachDistance };
    }
  }

  return null;
};

export const checkForTrainersWantingBattle = (
  map: TileMap,
  player: PlayerState,
  npcs: NpcState[],
  runtime: ScriptRuntimeState,
  visibleNpcs: readonly NpcState[] = npcs.filter((npc) => isNpcVisible(npc, runtime.flags))
): TrainerSightMatch | null => {
  if (runtime.vars.trainerSightDisabled === 1) {
    return null;
  }

  const playerObject = getPlayerRuntimeObject(player, map);
  const objects = [
    ...visibleNpcs.map((npc) => getNpcRuntimeObject(npc, map)),
    playerObject
  ];

  for (const npc of npcs) {
    if (
      !visibleNpcs.includes(npc)
      || (npc.trainerType !== TRAINER_TYPE_NORMAL && npc.trainerType !== TRAINER_TYPE_BURIED)
      || !npc.interactScriptId
    ) {
      continue;
    }

    const trainerBattle = getDecompTrainerBattleInfoForScript(npc.interactScriptId);
    if (!trainerBattle || runtime.flags.has(trainerBattle.defeatFlag)) {
      continue;
    }

    if (
      trainerBattle.format === 'doubles'
      && runtime.party.filter((pokemon) => !pokemon.isEgg && pokemon.hp > 0).length < 2
    ) {
      continue;
    }

    const approach = getTrainerApproachDistance(map, npc, playerObject, objects);
    if (approach) {
      return {
        npc,
        direction: approach.direction,
        approachDistance: approach.approachDistance
      };
    }
  }

  return null;
};

export const startFieldTrainerSee = (match: TrainerSightMatch): FieldTrainerSeeState => {
  match.npc.facing = match.direction;
  match.npc.activeEmote = 'exclamation';
  return {
    trainerId: match.npc.id,
    phase: 'exclamation',
    direction: match.direction,
    approachDistance: Math.max(0, match.approachDistance - 1),
    remainingExclamationFrames: EXCLAMATION_FRAMES
  };
};

export const stepFieldTrainerSee = (
  state: FieldTrainerSeeState,
  npcs: readonly NpcState[],
  map: TileMap,
  dtSeconds: number
): boolean => {
  const npc = npcs.find((candidate) => candidate.id === state.trainerId);
  if (!npc) {
    state.phase = 'ready';
    return true;
  }

  if (state.phase === 'exclamation') {
    state.remainingExclamationFrames -= 1;
    if (state.remainingExclamationFrames > 0) {
      return false;
    }
    delete npc.activeEmote;
    state.phase = state.approachDistance > 0 ? 'approach' : 'ready';
    npc.facing = state.direction;
    return state.phase === 'ready';
  }

  if (state.phase === 'approach') {
    const vector = directionVector(state.direction);
    const targetTile = vec2(
      (npc.currentTile?.x ?? Math.floor(npc.position.x / map.tileSize)) + vector.x * state.approachDistance,
      (npc.currentTile?.y ?? Math.floor(npc.position.y / map.tileSize)) + vector.y * state.approachDistance
    );
    const targetPosition = vec2(targetTile.x * map.tileSize, targetTile.y * map.tileSize);
    const dx = targetPosition.x - npc.position.x;
    const dy = targetPosition.y - npc.position.y;
    const remaining = Math.hypot(dx, dy);

    npc.facing = state.direction;
    if (remaining <= 0.001) {
      npc.position = targetPosition;
      npc.currentTile = targetTile;
      npc.previousTile = targetTile;
      npc.moving = false;
      npc.animationTime = 0;
      state.phase = 'ready';
      return true;
    }

    const step = Math.min(remaining, TRAINER_APPROACH_PIXELS_PER_SECOND * dtSeconds);
    npc.position = vec2(npc.position.x + (dx / remaining) * step, npc.position.y + (dy / remaining) * step);
    npc.moving = true;
    npc.animationTime = (npc.animationTime ?? 0) + dtSeconds;
    return false;
  }

  npc.facing = state.direction;
  npc.moving = false;
  npc.animationTime = 0;
  return true;
};
