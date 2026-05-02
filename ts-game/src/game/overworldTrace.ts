import { vec2, type Vec2 } from '../core/vec2';
import type { InputSnapshot } from '../input/inputState';
import {
  evaluateFieldCollision,
  type EvaluateFieldCollisionParams,
  type FieldCollisionEvaluation,
  type FieldRuntimeObject
} from './fieldCollision';
import {
  getPlayerRuntimeObject,
  stepPlayer,
  type PlayerState,
  type StepPlayerResult
} from './player';
import { MapGridGetElevationAt, type TileDirection, type TileMap } from '../world/tileMap';

const neutralInput: InputSnapshot = {
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

export interface TraceTileSnapshot {
  x: number;
  y: number;
  elevation?: number;
}

export interface CollisionTraceStep {
  label: string;
  direction: TileDirection;
  commitMovement?: boolean;
}

export interface CollisionTraceEntry {
  label: string;
  direction: TileDirection;
  result: FieldCollisionEvaluation['result'];
  from: TraceTileSnapshot;
  target: TraceTileSnapshot | null;
  movementTarget: TraceTileSnapshot | null;
  blockingObjectId: string | null;
  viaConnection: boolean;
  committed: boolean;
}

export interface RunCollisionTraceParams extends Omit<EvaluateFieldCollisionParams, 'direction'> {
  steps: CollisionTraceStep[];
}

export interface PlayerTraceStep {
  label: string;
  input: Partial<InputSnapshot>;
  dtSeconds?: number;
  settleFrames?: number;
}

export interface PlayerTraceEntry {
  label: string;
  input: InputSnapshot;
  result: {
    attemptedDirection: StepPlayerResult['attemptedDirection'];
    collision: FieldCollisionEvaluation['result'] | null;
    enteredNewTile: boolean;
    forcedMovement: boolean;
    connectionMapId: string | null;
  };
  before: PlayerTraceSnapshot;
  after: PlayerTraceSnapshot;
}

export interface PlayerTraceSnapshot {
  tile: TraceTileSnapshot | null;
  previousTile: TraceTileSnapshot | null;
  position: Vec2;
  facing: PlayerState['facing'];
  moving: boolean;
  runningState: PlayerState['runningState'] | null;
  avatarMode: PlayerState['avatarMode'] | null;
  stepSpeed: number | null;
}

export interface RunPlayerMovementTraceParams {
  map: TileMap;
  player: PlayerState;
  steps: PlayerTraceStep[];
  objects?: readonly FieldRuntimeObject[];
  loadMapById?: (mapId: string) => TileMap | null;
}

const tileSnapshot = (map: TileMap, tile: Vec2 | null | undefined): TraceTileSnapshot | null =>
  tile
    ? {
      x: tile.x,
      y: tile.y,
      elevation: MapGridGetElevationAt(map, tile.x, tile.y)
    }
    : null;

const runtimeObjectFrom = (object: FieldRuntimeObject): FieldRuntimeObject => ({
  ...object,
  currentTile: vec2(object.currentTile.x, object.currentTile.y),
  previousTile: vec2(object.previousTile.x, object.previousTile.y),
  initialTile: vec2(object.initialTile.x, object.initialTile.y)
});

const shouldCommitCollisionMovement = (collision: FieldCollisionEvaluation): boolean =>
  collision.result === 'none'
  || collision.result === 'ledgeJump';

const commitCollisionObject = (
  object: FieldRuntimeObject,
  collision: FieldCollisionEvaluation
): TileMap | null => {
  if (!collision.movementTarget || !shouldCommitCollisionMovement(collision)) {
    return null;
  }

  object.previousTile = vec2(object.currentTile.x, object.currentTile.y);
  object.previousElevation = object.currentElevation;
  object.currentTile = vec2(collision.movementTarget.tile.x, collision.movementTarget.tile.y);
  object.currentElevation = MapGridGetElevationAt(
    collision.movementTarget.map,
    collision.movementTarget.tile.x,
    collision.movementTarget.tile.y
  );
  return collision.movementTarget.map;
};

export const runCollisionTrace = ({
  map,
  object,
  objects = [],
  loadMapById,
  steps
}: RunCollisionTraceParams): CollisionTraceEntry[] => {
  const traceObject = runtimeObjectFrom(object);
  const traceObjects = objects.map(runtimeObjectFrom);
  let traceMap = map;

  return steps.map((step) => {
    const currentMap = traceMap;
    const from = tileSnapshot(currentMap, traceObject.currentTile)!;
    const collision = evaluateFieldCollision({
      map: currentMap,
      object: traceObject,
      direction: step.direction,
      objects: traceObjects,
      loadMapById
    });
    const committedMap = (step.commitMovement ?? true) ? commitCollisionObject(traceObject, collision) : null;
    const committed = committedMap !== null;
    if (committedMap) {
      traceMap = committedMap;
    }

    return {
      label: step.label,
      direction: step.direction,
      result: collision.result,
      from,
      target: collision.target ? tileSnapshot(collision.target.map, collision.target.tile) : null,
      movementTarget: collision.movementTarget
        ? tileSnapshot(collision.movementTarget.map, collision.movementTarget.tile)
        : null,
      blockingObjectId: collision.blockingObject?.id ?? null,
      viaConnection: collision.target?.viaConnection ?? false,
      committed
    };
  });
};

const traceInput = (input: Partial<InputSnapshot>): InputSnapshot => ({
  ...neutralInput,
  ...input
});

const playerSnapshot = (player: PlayerState): PlayerTraceSnapshot => ({
  tile: player.currentTile
    ? { x: player.currentTile.x, y: player.currentTile.y, elevation: player.currentElevation }
    : null,
  previousTile: player.previousTile
    ? { x: player.previousTile.x, y: player.previousTile.y, elevation: player.previousElevation }
    : null,
  position: vec2(player.position.x, player.position.y),
  facing: player.facing,
  moving: player.moving,
  runningState: player.runningState ?? null,
  avatarMode: player.avatarMode ?? null,
  stepSpeed: player.stepSpeed ?? null
});

export const runPlayerMovementTrace = ({
  map,
  player,
  steps,
  objects = [],
  loadMapById
}: RunPlayerMovementTraceParams): PlayerTraceEntry[] =>
  steps.map((step) => {
    const before = playerSnapshot(player);
    const input = traceInput(step.input);
    const dtSeconds = step.dtSeconds ?? 1 / 60;
    const result = stepPlayer(
      player,
      input,
      map,
      dtSeconds,
      (direction) => evaluateFieldCollision({
        map,
        object: getPlayerRuntimeObject(player, map),
        direction,
        objects,
        loadMapById
      })
    );

    for (let frame = 0; frame < (step.settleFrames ?? 0) && player.stepTarget; frame += 1) {
      stepPlayer(player, neutralInput, map, dtSeconds);
    }

    return {
      label: step.label,
      input,
      result: {
        attemptedDirection: result.attemptedDirection,
        collision: result.collision?.result ?? null,
        enteredNewTile: result.enteredNewTile,
        forcedMovement: result.forcedMovement,
        connectionMapId: result.connectionTransition?.target?.map.id ?? null
      },
      before,
      after: playerSnapshot(player)
    };
  });
