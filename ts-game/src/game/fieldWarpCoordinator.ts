import { clearPlayerMovement, resolveInputDirection, type PlayerState, type StepPlayerResult } from './player';
import { createMapNpcs, type NpcState } from './npc';
import type { ScriptRuntimeState } from './scripts';
import { doCurrentWeather, setSavedWeatherFromCurrMapHeader } from './decompFieldWeatherUtil';
import { trySetMapSaveWarpStatus } from './decompSaveLocation';
import { applyWarpTransitionEffect } from './warpEffects';
import {
  assertWarpTransitionResolved,
  resolveArrowWarpTransition,
  resolveFacingDoorWarpTransition,
  resolveWarpTransition,
  type WarpTransition
} from './warps';
import type { InputSnapshot } from '../input/inputState';
import type { TileMap } from '../world/tileMap';

export interface FieldWorldState {
  map: TileMap;
  npcs: NpcState[];
}

export interface FieldWarpCoordinatorContext {
  world: FieldWorldState;
  player: PlayerState;
  runtime: ScriptRuntimeState;
  loadMapById: (mapId: string) => TileMap | null;
  runWarpMapScripts: () => void;
}

const replaceMap = (
  context: FieldWarpCoordinatorContext,
  map: TileMap,
  x: number,
  y: number,
  lastScriptId: string
): void => {
  context.world.map = map;
  context.world.npcs = createMapNpcs(map);
  context.player.position.x = x;
  context.player.position.y = y;
  clearPlayerMovement(context.player, map);
  setSavedWeatherFromCurrMapHeader(context.runtime, map.coordEventWeather);
  doCurrentWeather(context.runtime);
  trySetMapSaveWarpStatus(context.runtime, map.id);
  context.runWarpMapScripts();
  context.runtime.lastScriptId = lastScriptId;
};

export const applyPendingScriptWarp = (context: FieldWarpCoordinatorContext): boolean => {
  const pendingWarp = context.runtime.pendingScriptWarp;
  if (!pendingWarp) {
    return false;
  }

  context.runtime.pendingScriptWarp = null;
  const destinationMap = context.loadMapById(pendingWarp.mapId);
  if (!destinationMap) {
    throw new Error(`Invalid script warp destination: ${pendingWarp.kind} references unloaded map ${pendingWarp.mapId}.`);
  }

  replaceMap(
    context,
    destinationMap,
    pendingWarp.x * destinationMap.tileSize,
    pendingWarp.y * destinationMap.tileSize,
    `${pendingWarp.kind}.${pendingWarp.mapId}`
  );
  return true;
};

export const applyResolvedWarpTransition = (
  context: FieldWarpCoordinatorContext,
  warpTransition: WarpTransition
): boolean => {
  const map = context.world.map;
  if (warpTransition.status === 'resolved' && warpTransition.destinationMap && warpTransition.playerPosition) {
    applyWarpTransitionEffect(context.runtime, context.player, warpTransition);
    replaceMap(
      context,
      warpTransition.destinationMap,
      warpTransition.playerPosition.x,
      warpTransition.playerPosition.y,
      `warp.${warpTransition.sourceWarp?.destMap ?? warpTransition.destinationMap.id}`
    );
    return true;
  }

  if (warpTransition.status === 'unloaded_map' || warpTransition.status === 'invalid_warp_id') {
    clearPlayerMovement(context.player, map);
    context.runtime.lastScriptId = `warp.${warpTransition.status}.${warpTransition.sourceWarp?.destMap ?? 'unknown'}`;
    assertWarpTransitionResolved(warpTransition, map.id);
  }

  return false;
};

export const applyConnectionTransition = (
  context: FieldWarpCoordinatorContext,
  stepResult: StepPlayerResult
): boolean => {
  const connectionTarget = stepResult.connectionTransition?.target;
  if (!connectionTarget?.viaConnection) {
    return false;
  }

  replaceMap(
    context,
    connectionTarget.map,
    connectionTarget.tile.x * connectionTarget.map.tileSize,
    connectionTarget.tile.y * connectionTarget.map.tileSize,
    context.runtime.lastScriptId ?? ''
  );
  if (context.runtime.lastScriptId === '') {
    context.runtime.lastScriptId = null;
  }
  return true;
};

export const resolveStepWarpTransition = (
  context: FieldWarpCoordinatorContext,
  stepResult: StepPlayerResult,
  snapshot: InputSnapshot
): WarpTransition => {
  const map = context.world.map;
  const heldDirection = resolveInputDirection(snapshot);
  return stepResult.enteredNewTile || stepResult.collision?.result === 'directionalStairWarp'
    ? resolveWarpTransition(map, context.player, context.loadMapById, context.runtime.dynamicWarp, {
      allowArrowWarp: heldDirection === context.player.facing,
      allowDirectionalStairWarp: stepResult.collision?.result === 'directionalStairWarp'
    })
    : resolveFacingDoorWarpTransition(map, context.player, stepResult.attemptedDirection, context.loadMapById, context.runtime.dynamicWarp);
};

export const tryApplyArrowWarpBeforeMovement = (
  context: FieldWarpCoordinatorContext,
  heldDirection: PlayerState['facing'] | null
): boolean => applyResolvedWarpTransition(
  context,
  resolveArrowWarpTransition(
    context.world.map,
    context.player,
    heldDirection,
    context.loadMapById,
    context.runtime.dynamicWarp
  )
);
