import { vec2 } from '../core/vec2';
import type { DialogueState } from './interaction';
import type { PlayerState } from './player';
import { isScriptFlagSet, type ScriptHandler, type ScriptRuntimeState } from './scripts';
import { runScriptById } from './scripts';
import type { TriggerCondition, TriggerZone } from '../world/mapSource';

export interface TriggerExecutionContext {
  player: PlayerState;
  dialogue: DialogueState;
  runtime: ScriptRuntimeState;
  scriptRegistry?: Record<string, ScriptHandler>;
}

type Facing = PlayerState['facing'];

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
  const didRun = runScriptById(trigger.scriptId, {
    player: context.player,
    dialogue: context.dialogue,
    runtime: context.runtime
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
  context: TriggerExecutionContext
): boolean => {
  const playerTile = toTile(player.position.x, player.position.y, tileSize);
  const direction = facingVector(player.facing);
  const targetX = playerTile.x + direction.x;
  const targetY = playerTile.y + direction.y;

  const trigger = triggers.find((candidate) =>
    candidate.activation === 'interact'
    && candidate.x === targetX
    && candidate.y === targetY
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
  let ranAny = false;

  for (const trigger of triggers) {
    if (trigger.activation !== 'step') {
      continue;
    }

    if (trigger.x !== playerTile.x || trigger.y !== playerTile.y) {
      continue;
    }

    if (!canRunTrigger(trigger, context.runtime)) {
      continue;
    }

    ranAny = executeTrigger(trigger, context) || ranAny;
  }

  return ranAny;
};
