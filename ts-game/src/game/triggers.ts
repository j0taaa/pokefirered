import { vec2 } from '../core/vec2';
import type { DialogueState } from './interaction';
import type { NpcState } from './npc';
import type { PlayerState } from './player';
import { runDecompFieldScript } from './decompFieldDialogue';
import { isScriptFlagSet, type ScriptHandler, type ScriptRuntimeState } from './scripts';
import { runScriptById } from './scripts';
import type { MapHiddenItemSource, TriggerCondition, TriggerZone } from '../world/mapSource';

export interface TriggerExecutionContext {
  player: PlayerState;
  dialogue: DialogueState;
  runtime: ScriptRuntimeState;
  scriptRegistry?: Record<string, ScriptHandler>;
  hiddenItems?: MapHiddenItemSource[];
  npcs?: NpcState[];
}

type Facing = PlayerState['facing'];

const MB_SIGNPOST = 0x84;
const MB_POKEMON_CENTER_SIGN = 0x87;
const MB_POKEMART_SIGN = 0x88;
const MB_INDIGO_PLATEAU_SIGN_1 = 0x91;
const MB_INDIGO_PLATEAU_SIGN_2 = 0x92;

const facingVector = (facing: Facing) => {
  switch (facing) {
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

const toTile = (x: number, y: number, tileSize: number) =>
  vec2(Math.floor((x + 8) / tileSize), Math.floor((y + 12) / tileSize));

const getPlayerElevation = (player: PlayerState): number => player.currentElevation ?? 0;

const getTileElevation = (
  tileElevations: number[] | undefined,
  mapWidth: number | undefined,
  tileX: number,
  tileY: number
): number | null => {
  if (!tileElevations || !mapWidth || tileX < 0 || tileY < 0) {
    return null;
  }

  const index = tileY * mapWidth + tileX;
  return index >= 0 && index < tileElevations.length ? tileElevations[index] : null;
};

const getFacingPositionElevation = (
  player: PlayerState,
  playerTile: ReturnType<typeof toTile>,
  mapWidth?: number,
  tileElevations?: number[]
): number => {
  const currentTileElevation = getTileElevation(tileElevations, mapWidth, playerTile.x, playerTile.y);
  if (currentTileElevation === null) {
    return getPlayerElevation(player);
  }

  return currentTileElevation !== 0 ? getPlayerElevation(player) : 0;
};

const triggerElevationMatches = (trigger: TriggerZone, elevation: number): boolean => {
  const triggerElevation = trigger.elevation ?? 0;
  return triggerElevation === elevation || triggerElevation === 0;
};

const getTileBehavior = (
  tileBehaviors: number[] | undefined,
  mapWidth: number | undefined,
  tileX: number,
  tileY: number
): number | null => {
  if (!tileBehaviors || !mapWidth || tileX < 0 || tileY < 0) {
    return null;
  }

  const index = tileY * mapWidth + tileX;
  return index >= 0 && index < tileBehaviors.length ? tileBehaviors[index] : null;
};

const matchesLegacyCondition = (trigger: TriggerZone, runtime: ScriptRuntimeState): boolean => {
  if (!trigger.conditionVar) {
    return true;
  }

  // Mirrors FireRed's CoordEvent trigger/index comparison:
  // VarGet(coordEvent->trigger) == coordEvent->index.
  const current = runtime.vars[trigger.conditionVar] ?? 0;
  return current === trigger.conditionEquals;
};

const matchesVarCondition = (
  condition: TriggerCondition,
  runtime: ScriptRuntimeState
): boolean => {
  if (!condition.var) {
    return true;
  }

  const current = runtime.vars[condition.var] ?? 0;
  const expected = condition.value ?? 0;
  const operator = condition.op ?? 'eq';
  switch (operator) {
    case 'eq':
      return current === expected;
    case 'ne':
      return current !== expected;
    case 'gt':
      return current > expected;
    case 'gte':
      return current >= expected;
    case 'lt':
      return current < expected;
    case 'lte':
      return current <= expected;
  }
};

const matchesFlagCondition = (
  condition: TriggerCondition,
  runtime: ScriptRuntimeState
): boolean => {
  if (!condition.flag) {
    return true;
  }

  const shouldBeSet = condition.flagState ?? true;
  return isScriptFlagSet(runtime, condition.flag) === shouldBeSet;
};

const matchesCondition = (trigger: TriggerZone, runtime: ScriptRuntimeState): boolean => {
  if (!matchesLegacyCondition(trigger, runtime)) {
    return false;
  }

  if (!trigger.conditions || trigger.conditions.length === 0) {
    return true;
  }

  return trigger.conditions.every((condition) =>
    matchesVarCondition(condition, runtime) && matchesFlagCondition(condition, runtime)
  );
};

const canRunTrigger = (trigger: TriggerZone, runtime: ScriptRuntimeState): boolean => {
  if (!matchesCondition(trigger, runtime)) {
    return false;
  }

  if (trigger.once && runtime.consumedTriggerIds.has(trigger.id)) {
    return false;
  }

  return true;
};

const markRan = (trigger: TriggerZone, runtime: ScriptRuntimeState): void => {
  if (trigger.once) {
    runtime.consumedTriggerIds.add(trigger.id);
  }
};

const executeTrigger = (
  trigger: TriggerZone,
  context: TriggerExecutionContext
): boolean => {
  if (trigger.scriptId.endsWith('.hiddenItem')) {
    const hiddenItem = context.hiddenItems?.find((entry) =>
      entry.flag === trigger.conditions?.find((condition) => condition.flag)?.flag
      || (entry.x === trigger.x && entry.y === trigger.y)
    );

    if (!hiddenItem) {
      return false;
    }

    (context.runtime.vars as Record<string, number | string>).VAR_0x8005 = hiddenItem.item;
    context.runtime.vars.VAR_0x8006 = hiddenItem.quantity ?? 1;

    const ran = runDecompFieldScript('EventScript_HiddenItemScript', {
      runtime: context.runtime,
      player: context.player,
      dialogue: context.dialogue,
      speakerId: 'system',
      hiddenItemFlag: hiddenItem.flag
    });
    if (!ran) {
      return false;
    }

    context.runtime.lastScriptId = trigger.scriptId;
    markRan(trigger, context.runtime);
    return true;
  }

  const didRun = runScriptById(trigger.scriptId, {
    player: context.player,
    dialogue: context.dialogue,
    runtime: context.runtime,
    npcs: context.npcs
  }, context.scriptRegistry);

  if (didRun) {
    markRan(trigger, context.runtime);
  }

  return didRun;
};

export const tryRunFacingTrigger = (
  triggers: TriggerZone[],
  player: PlayerState,
  tileSize: number,
  context: TriggerExecutionContext,
  mapWidth?: number,
  tileElevations?: number[]
): boolean => {
  const playerTile = toTile(player.position.x, player.position.y, tileSize);
  const direction = facingVector(player.facing);
  const targetX = playerTile.x + direction.x;
  const targetY = playerTile.y + direction.y;
  const targetElevation = getFacingPositionElevation(player, playerTile, mapWidth, tileElevations);

  const trigger = triggers.find((candidate) =>
    candidate.activation === 'interact'
    && candidate.x === targetX
    && candidate.y === targetY
    && triggerElevationMatches(candidate, targetElevation)
    && (candidate.facing === 'any' || candidate.facing === player.facing)
    && canRunTrigger(candidate, context.runtime)
  );

  if (!trigger) {
    return false;
  }

  return executeTrigger(trigger, context);
};

const getWalkIntoSignpostScriptId = (behavior: number | null, facing: Facing): string | null => {
  if (facing === 'left' || facing === 'right') {
    return null;
  }

  switch (behavior) {
    case MB_POKEMON_CENTER_SIGN:
      return facing === 'up' ? 'EventScript_PokecenterSign' : null;
    case MB_POKEMART_SIGN:
      return facing === 'up' ? 'EventScript_PokemartSign' : null;
    case MB_INDIGO_PLATEAU_SIGN_1:
      return 'EventScript_Indigo_UltimateGoal';
    case MB_INDIGO_PLATEAU_SIGN_2:
      return 'EventScript_Indigo_HighestAuthority';
    default:
      return null;
  }
};

export const tryRunWalkIntoSignpostScript = (
  triggers: TriggerZone[],
  player: PlayerState,
  heldDirection: Facing | null,
  tileSize: number,
  context: TriggerExecutionContext,
  mapWidth?: number,
  tileBehaviors?: number[],
  tileElevations?: number[],
  horizontalHeld = false
): boolean => {
  if (horizontalHeld || !heldDirection || heldDirection !== player.facing) {
    return false;
  }

  const playerTile = toTile(player.position.x, player.position.y, tileSize);
  const direction = facingVector(player.facing);
  const targetX = playerTile.x + direction.x;
  const targetY = playerTile.y + direction.y;
  const behavior = getTileBehavior(tileBehaviors, mapWidth, targetX, targetY);
  const scriptId = getWalkIntoSignpostScriptId(behavior, player.facing);
  if (scriptId) {
    return runScriptById(scriptId, {
      player,
      dialogue: context.dialogue,
      runtime: context.runtime,
      speakerId: 'sign',
      npcs: context.npcs
    }, context.scriptRegistry);
  }

  if (behavior !== MB_SIGNPOST || player.facing === 'left' || player.facing === 'right') {
    return false;
  }

  const targetElevation = getFacingPositionElevation(player, playerTile, mapWidth, tileElevations);
  const trigger = triggers.find((candidate) =>
    candidate.activation === 'interact'
    && candidate.x === targetX
    && candidate.y === targetY
    && triggerElevationMatches(candidate, targetElevation)
    && (candidate.facing === 'any' || candidate.facing === player.facing)
    && canRunTrigger(candidate, context.runtime)
  );

  if (!trigger) {
    return false;
  }

  return executeTrigger(trigger, context);
};

export const runStepTriggersAtPlayerTile = (
  triggers: TriggerZone[],
  player: PlayerState,
  tileSize: number,
  context: TriggerExecutionContext
): boolean => {
  const playerTile = toTile(player.position.x, player.position.y, tileSize);
  const playerElevation = getPlayerElevation(player);

  for (const trigger of triggers) {
    if (trigger.activation !== 'step') {
      continue;
    }

    if (trigger.x !== playerTile.x || trigger.y !== playerTile.y) {
      continue;
    }

    if (!triggerElevationMatches(trigger, playerElevation)) {
      continue;
    }

    if (!canRunTrigger(trigger, context.runtime)) {
      continue;
    }

    if (executeTrigger(trigger, context)) {
      return true;
    }
  }

  return false;
};

export const runStrengthButtonTriggersAtTile = (
  triggers: TriggerZone[],
  tile: { x: number; y: number },
  context: TriggerExecutionContext
): boolean => {
  for (const trigger of triggers) {
    if (trigger.x !== tile.x || trigger.y !== tile.y) {
      continue;
    }

    // Mirrors HandleBoulderActivateVictoryRoadSwitch: strength-button coord
    // events are selected by position only; their scripts handle scene vars.
    if (executeTrigger(trigger, context)) {
      return true;
    }
  }

  return false;
};
