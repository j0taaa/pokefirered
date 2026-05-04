import type { BattleEncounterState, BattleState, WildBattleStartConfig } from './battle';
import { tryStartWildBattle } from './battle';
import { doPoisonFieldEffect, tryFieldPoisonWhiteOut } from './decompFieldPoisonStatus';
import { fldEffPoisonIsActive, fldEffPoisonStart, type FieldPoisonEffectState } from './decompFieldPoison';
import {
  exitSafariMode,
  getSafariZoneBallCount,
  getSafariZoneFlag,
  safariZoneTakeStep,
  SAFARI_ZONE_TEXT_TIMES_UP
} from './decompSafariZone';
import type { DialogueState } from './interaction';
import { openDialogueSequence } from './interaction';
import type { NpcState } from './npc';
import type { PlayerState, StepPlayerResult } from './player';
import { shouldRunNormalStepSideEffects } from './player';
import { addPokedexSeenSpecies } from './pokemonStorage';
import type { ScriptHandler, ScriptRuntimeState } from './scripts';
import { runStepTriggersAtPlayerTile, type TriggerExecutionContext } from './triggers';
import { hasLandEncounterAtPixel, hasWaterEncounterAtPixel } from '../world/tileMap';
import type { TileMap } from '../world/tileMap';

type PoisonResult = ReturnType<typeof doPoisonFieldEffect>;

export interface FieldStepOrderHooks {
  onOrder?: (label: string) => void;
  doPoisonFieldEffect?: typeof doPoisonFieldEffect;
  fldEffPoisonIsActive?: typeof fldEffPoisonIsActive;
  fldEffPoisonStart?: typeof fldEffPoisonStart;
  tryFieldPoisonWhiteOut?: typeof tryFieldPoisonWhiteOut;
  safariZoneTakeStep?: typeof safariZoneTakeStep;
  exitSafariMode?: typeof exitSafariMode;
  openDialogueSequence?: typeof openDialogueSequence;
  runStepTriggersAtPlayerTile?: typeof runStepTriggersAtPlayerTile;
  hasWaterEncounterAtPixel?: typeof hasWaterEncounterAtPixel;
  hasLandEncounterAtPixel?: typeof hasLandEncounterAtPixel;
  tryStartWildBattle?: typeof tryStartWildBattle;
  addPokedexSeenSpecies?: typeof addPokedexSeenSpecies;
}

export interface FieldStepOrderContext {
  map: TileMap;
  player: PlayerState;
  dialogue: DialogueState;
  runtime: ScriptRuntimeState;
  scriptRegistry?: Record<string, ScriptHandler>;
  npcs: NpcState[];
  battle: BattleState;
  battleEncounter: BattleEncounterState;
  fieldPoisonEffect: FieldPoisonEffectState;
  respawnAfterFieldPoisonWhiteOut: () => void;
  syncBattleStateFromRuntime: () => void;
  hooks?: FieldStepOrderHooks;
}

const trace = (context: FieldStepOrderContext, label: string): void => {
  context.hooks?.onOrder?.(label);
};

const createTriggerContext = (context: FieldStepOrderContext): TriggerExecutionContext => ({
  player: context.player,
  dialogue: context.dialogue,
  runtime: context.runtime,
  scriptRegistry: context.scriptRegistry,
  hiddenItems: context.map.hiddenItems ?? [],
  npcs: context.npcs
});

const runPoisonStep = (context: FieldStepOrderContext): boolean => {
  trace(context, 'poison');
  const runPoison = context.hooks?.doPoisonFieldEffect ?? doPoisonFieldEffect;
  const isPoisonActive = context.hooks?.fldEffPoisonIsActive ?? fldEffPoisonIsActive;
  const startPoison = context.hooks?.fldEffPoisonStart ?? fldEffPoisonStart;
  const whiteOut = context.hooks?.tryFieldPoisonWhiteOut ?? tryFieldPoisonWhiteOut;
  const openDialogue = context.hooks?.openDialogueSequence ?? openDialogueSequence;

  const poisonResult: PoisonResult = runPoison(context.runtime.party);
  if (poisonResult !== 'FLDPSN_NONE' && !isPoisonActive(context.fieldPoisonEffect)) {
    startPoison(context.fieldPoisonEffect);
  }
  if (poisonResult !== 'FLDPSN_FNT') {
    return false;
  }

  const result = whiteOut(context.runtime.party);
  const messages = [...result.faintedMessages];
  if (result.allMonsFainted) {
    messages.push(
      `${context.runtime.startMenu.playerName} scurried to a POKeMON CENTER,`,
      'protecting the exhausted and fainted',
      'POKeMON from further harm...'
    );
    context.respawnAfterFieldPoisonWhiteOut();
    context.runtime.lastScriptId = 'field.poison.whiteout';
  } else {
    context.runtime.lastScriptId = 'field.poison.faint';
  }
  if (messages.length > 0) {
    openDialogue(context.dialogue, 'system', messages);
    return true;
  }
  return false;
};

const runSafariStep = (context: FieldStepOrderContext): boolean => {
  trace(context, 'safari');
  const takeStep = context.hooks?.safariZoneTakeStep ?? safariZoneTakeStep;
  if (!takeStep(context.runtime)) {
    return false;
  }

  const exitSafari = context.hooks?.exitSafariMode ?? exitSafariMode;
  const openDialogue = context.hooks?.openDialogueSequence ?? openDialogueSequence;
  exitSafari(context.runtime);
  openDialogue(context.dialogue, 'system', [...SAFARI_ZONE_TEXT_TIMES_UP]);
  context.runtime.lastScriptId = 'safari.times_up';
  context.syncBattleStateFromRuntime();
  return true;
};

const runStepTriggers = (context: FieldStepOrderContext): boolean => {
  trace(context, 'trigger');
  const runTriggers = context.hooks?.runStepTriggersAtPlayerTile ?? runStepTriggersAtPlayerTile;
  return runTriggers(
    context.map.triggers,
    context.player,
    context.map.tileSize,
    createTriggerContext(context)
  );
};

const runWildEncounter = (context: FieldStepOrderContext, actionEnteredNewTile: boolean): boolean => {
  trace(context, 'wildEncounter');
  const waterEncounterAt = context.hooks?.hasWaterEncounterAtPixel ?? hasWaterEncounterAtPixel;
  const landEncounterAt = context.hooks?.hasLandEncounterAtPixel ?? hasLandEncounterAtPixel;
  const startBattle = context.hooks?.tryStartWildBattle ?? tryStartWildBattle;
  const addSeen = context.hooks?.addPokedexSeenSpecies ?? addPokedexSeenSpecies;

  const isWaterEncounter = context.player.avatarMode === 'surfing' && waterEncounterAt(context.map, context.player.position);
  const canEncounter = isWaterEncounter || landEncounterAt(context.map, context.player.position);
  const encounterKind = isWaterEncounter ? 'water' : 'land';
  const battleConfig: WildBattleStartConfig = getSafariZoneFlag(context.runtime)
    ? {
      mode: 'safari',
      battleTypeFlags: ['safari'],
      safariBalls: getSafariZoneBallCount(context.runtime),
      encounterKind
    }
    : { encounterKind };

  if (!startBattle(
    context.battle,
    context.battleEncounter,
    actionEnteredNewTile,
    canEncounter,
    isWaterEncounter ? context.map.wildEncounters?.water : context.map.wildEncounters?.land,
    context.map.battleScene,
    context.map.id,
    battleConfig
  )) {
    return false;
  }

  addSeen(context.runtime.pokedex, context.battle.wildMon.species);
  context.runtime.startMenu.seenPokemonCount = context.runtime.pokedex.seenSpecies.length;
  context.runtime.lastScriptId = getSafariZoneFlag(context.runtime)
    ? 'battle.safari.start'
    : 'battle.wild.start';
  return true;
};

export const runPostMovementFieldOrder = (
  context: FieldStepOrderContext,
  stepResult: StepPlayerResult
): boolean => {
  if (!shouldRunNormalStepSideEffects(stepResult)) {
    return false;
  }

  const actionEnteredNewTile = stepResult.enteredNewTile;
  if (runPoisonStep(context)) {
    return true;
  }
  if (runSafariStep(context)) {
    return true;
  }
  if (runStepTriggers(context)) {
    return true;
  }
  return runWildEncounter(context, actionEnteredNewTile);
};
