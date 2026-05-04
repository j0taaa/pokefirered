import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import { createBattleEncounterState, createBattlePokemonFromSpecies, createBattleState } from '../src/game/battle';
import { startPendingTrainerBattleIfReady } from '../src/game/fieldBattleHandoffCoordinator';
import { createFieldPoisonEffectState } from '../src/game/decompFieldPoison';
import { runPostMovementFieldOrder } from '../src/game/fieldOrderCoordinator';
import { applyResolvedWarpTransition, resolveStepWarpTransition, type FieldWorldState } from '../src/game/fieldWarpCoordinator';
import { createDialogueState } from '../src/game/interaction';
import { createMapNpcs } from '../src/game/npc';
import { createPlayer, type StepPlayerResult } from '../src/game/player';
import { createScriptRuntimeState } from '../src/game/scripts';
import {
  loadMapById,
  loadPewterCityGymMap,
  loadRoute3Map
} from '../src/world/mapSource';
import type { InputSnapshot } from '../src/input/inputState';
import type { TileMap } from '../src/world/tileMap';

const movementStep: StepPlayerResult = {
  attemptedDirection: 'down',
  collision: null,
  enteredNewTile: true,
  forcedMovement: false,
  connectionTransition: null
};

const idleInput: InputSnapshot = {
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
  cancelPressed: false,
  select: false,
  selectPressed: false
};

const createOrderContext = (map: TileMap = loadRoute3Map()) => {
  const player = createPlayer();
  player.position = vec2(26 * map.tileSize, 9 * map.tileSize);
  player.currentTile = vec2(26, 9);
  player.previousTile = vec2(26, 9);

  return {
    map,
    player,
    dialogue: createDialogueState(),
    runtime: createScriptRuntimeState(),
    npcs: createMapNpcs(map),
    battle: createBattleState(),
    battleEncounter: createBattleEncounterState(),
    fieldPoisonEffect: createFieldPoisonEffectState(),
    respawnAfterFieldPoisonWhiteOut: () => undefined,
    syncBattleStateFromRuntime: () => undefined
  };
};

describe('field runtime ordering coordinators', () => {
  test('blocked movement does not run trigger, warp, poison, Safari, or battle side effects', () => {
    const context = createOrderContext(loadRoute3Map());
    const order: string[] = [];

    const consumed = runPostMovementFieldOrder({
      ...context,
      hooks: {
        onOrder: (label) => order.push(label),
        doPoisonFieldEffect: () => {
          throw new Error('poison must not run for blocked movement');
        },
        runStepTriggersAtPlayerTile: () => {
          throw new Error('triggers must not run for blocked movement');
        },
        tryStartWildBattle: () => {
          throw new Error('battle must not run for blocked movement');
        }
      }
    }, {
      ...movementStep,
      collision: { result: 'impassable', target: null },
      enteredNewTile: false
    });

    expect(consumed).toBe(false);
    expect(order).toEqual([]);
  });

  test('Route 3 hidden-item step fixture keeps poison -> Safari -> trigger before wild battle', () => {
    const context = createOrderContext(loadRoute3Map());
    const order: string[] = [];
    const hiddenItemTrigger = context.map.triggers.find((trigger) => trigger.id === 'FLAG_HIDDEN_ITEM_ROUTE3_ORAN_BERRY.hiddenItem');

    expect(context.map.hiddenItems).toContainEqual(expect.objectContaining({ item: 'ITEM_ORAN_BERRY' }));
    expect(hiddenItemTrigger).toMatchObject({ x: 26, y: 9, activation: 'interact' });

    const consumed = runPostMovementFieldOrder({
      ...context,
      hooks: {
        onOrder: (label) => order.push(label),
        doPoisonFieldEffect: () => 'FLDPSN_NONE',
        safariZoneTakeStep: () => false,
        runStepTriggersAtPlayerTile: (triggers) => {
          expect(triggers).toContain(hiddenItemTrigger);
          return true;
        },
        tryStartWildBattle: () => {
          throw new Error('wild battle must not run after a consumed hidden-item trigger');
        }
      }
    }, movementStep);

    expect(consumed).toBe(true);
    expect(order).toEqual(['poison', 'safari', 'trigger']);
  });

  test('Route 3 grass fixture runs wild battle handoff only after movement side effects and step triggers decline', () => {
    const context = createOrderContext(loadRoute3Map());
    const order: string[] = [];

    const consumed = runPostMovementFieldOrder({
      ...context,
      hooks: {
        onOrder: (label) => order.push(label),
        doPoisonFieldEffect: () => 'FLDPSN_NONE',
        safariZoneTakeStep: () => false,
        runStepTriggersAtPlayerTile: () => false,
        hasLandEncounterAtPixel: () => true,
        tryStartWildBattle: () => true,
        addPokedexSeenSpecies: (pokedex, species) => {
          pokedex.seenSpecies.push(species);
        }
      }
    }, movementStep);

    expect(consumed).toBe(true);
    expect(order).toEqual(['poison', 'safari', 'trigger', 'wildEncounter']);
    expect(context.runtime.lastScriptId).toBe('battle.wild.start');
  });

  test('Pewter interior warp fixture resolves before post-movement trigger or battle side effects', () => {
    const map = loadPewterCityGymMap();
    const player = createPlayer();
    player.position = vec2(6 * map.tileSize, 14 * map.tileSize);
    player.currentTile = vec2(6, 14);
    player.previousTile = vec2(6, 13);
    player.facing = 'down';
    const runtime = createScriptRuntimeState();
    const world: FieldWorldState = { map, npcs: createMapNpcs(map) };
    const order: string[] = [];
    const warpContext = {
      world,
      player,
      runtime,
      loadMapById,
      runWarpMapScripts: () => order.push('warpScripts')
    };

    const transition = resolveStepWarpTransition(warpContext, movementStep, { ...idleInput, down: true });
    expect(transition.status).toBe('resolved');
    expect(transition.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY' });

    expect(applyResolvedWarpTransition(warpContext, transition)).toBe(true);
    expect(world.map.id).toBe('MAP_PEWTER_CITY');
    expect(runtime.lastScriptId).toBe('warp.MAP_PEWTER_CITY');
    expect(order).toEqual(['warpScripts']);
  });

  test('Pewter trainer encounter fixture hands off to battle before field movement resumes', () => {
    const map = loadPewterCityGymMap();
    const runtime = createScriptRuntimeState();
    const battle = createBattleState();
    const dialogue = createDialogueState();
    runtime.pendingTrainerBattle = {
      trainerId: 'TRAINER_LIAM',
      trainerName: 'LIAM',
      defeatFlag: 'FLAG_DEFEATED_PEWTER_GYM_TRAINER_0',
      trainerClass: 'CAMPER',
      format: 'singles',
      victoryFlags: [],
      trainerItems: [],
      trainerAiFlags: [],
      opponentParty: [createBattlePokemonFromSpecies('GEODUDE', 10)],
      started: false,
      resolved: false,
      result: null,
      continueScriptSession: null
    };

    expect(map.npcs.some((npc) => npc.scriptId === 'PewterCity_Gym_EventScript_Liam')).toBe(true);
    expect(startPendingTrainerBattleIfReady({ runtime, battle, dialogue, map })).toBe(true);
    expect(runtime.pendingTrainerBattle?.started).toBe(true);
    expect(battle.active).toBe(true);
    expect(runtime.lastScriptId).toBe('battle.trainer.start.trainer_liam');
  });
});
