import './style.css';
import { GameLoop } from './core/gameLoop';
import { createCamera, followTarget } from './core/camera';
import { BrowserInputAdapter } from './input/inputState';
import { CanvasRenderer } from './rendering/canvasRenderer';
import { loadMapById, loadRoute2Map } from './world/mapSource';
import {
  canProcessFieldInteractionInput,
  canProcessPlayerMovementInput,
  canProcessStartMenuInput,
  clearPlayerMovement,
  createPlayer,
  getPlayerRuntimeObject,
  hasPendingForcedMovement,
  resolveInputDirection,
  shouldRunNormalStepSideEffects,
  stepPlayer
} from './game/player';
import { createMapNpcs, getNpcRuntimeObject, isNpcVisible, stepNpcs, trySpawnObjectEvents } from './game/npc';
import { createDialogueState, openDialogueSequence, stepInteraction } from './game/interaction';
import { stepFieldTextPrinter } from './game/decompFieldMessageBox';
import { createHud, updateHud } from './ui/hud';
import {
  applyPendingTrainerBattleOutcome,
  getRuntimeCoins,
  createScriptRuntimeState,
  getRuntimeMoney,
  isOakLabRivalTrainer,
  prototypeScriptRegistry,
  syncLegacyPlayTimeVars,
  setRuntimeMoney
} from './game/scripts';
import {
  getDecompMapScriptLabel,
  getMatchingDecompMapScript2ScriptId,
  resumeDecompFieldScriptSession,
  runDecompFieldScript,
  type DecompMapScriptType
} from './game/decompFieldDialogue';
import {
  runStepTriggersAtPlayerTile,
  runStrengthButtonTriggersAtTile,
  tryRunWalkIntoSignpostScript
} from './game/triggers';
import { createStartMenuState, isStartMenuBlockingWorld, stepStartMenu } from './game/menu';
import {
  addPokedexCaughtSpecies,
  addPokedexSeenSpecies,
  addPokemonToParty,
  cloneFieldPokemon
} from './game/pokemonStorage';
import {
  DEFAULT_SAVE_SLOT_KEY,
  saveGameToStorage
} from './game/saveData';
import { reloadSave, SAVE_STATUS_OK } from './game/decompResetSaveHeap';
import {
  applyBattleRewards,
  clearBattlePostResult,
  configureBattleState,
  createBattlePokemonFromFieldPokemon,
  createBattleEncounterState,
  createBattleState,
  getBattlePostResult,
  isBattleBlockingWorld,
  startTrainerBattle,
  stepBattle,
  tryStartWildBattle,
  type BattleTypeFlag,
  type BattlePokemonSnapshot
} from './game/battle';
import {
  createFieldPoisonEffectState,
  fldEffPoisonIsActive,
  fldEffPoisonStart,
  stepFieldPoisonEffect
} from './game/decompFieldPoison';
import { stepPcScreenEffect } from './game/decompPcScreenEffect';
import { doPoisonFieldEffect, tryFieldPoisonWhiteOut } from './game/decompFieldPoisonStatus';
import { startNewGame } from './game/decompNewGame';
import { getTotalPlayTimeMinutes, updatePlayTimeCounter } from './game/decompPlayTime';
import { createDecompRng, nextDecompRandom } from './game/decompRandom';
import { countEarnedBadges, getMapSectionDisplayName } from './game/decompSaveMenuUtil';
import { setUnlockedPokedexFlags, trySetMapSaveWarpStatus } from './game/decompSaveLocation';
import {
  doCurrentWeather,
  getSavedWeather,
  resumePausedWeather,
  setSavedWeatherFromCurrMapHeader,
  WEATHER_NONE
} from './game/decompFieldWeatherUtil';
import {
  exitSafariMode,
  finalizeSafariBattle,
  getSafariZoneBallCount,
  getSafariZoneFlag,
  safariZoneTakeStep,
  SAFARI_ZONE_TEXT_TIMES_UP
} from './game/decompSafariZone';
import { resolveWhiteoutRespawnWarp } from './game/decompHealLocation';
import { healParty, type FieldPokemonStatus } from './game/pokemonStorage';
import { hasLandEncounterAtPixel, hasWaterEncounterAtPixel } from './world/tileMap';
import { evaluateFieldCollision } from './game/fieldCollision';
import {
  applyFieldActionStartSideEffects,
  createFieldAction,
  getFieldActionFrozenNpcIds,
  stepFieldAction,
  type FieldActionState
} from './game/fieldActions';
import { applyWarpTransitionEffect } from './game/warpEffects';
import { resolveArrowWarpTransition, resolveFacingDoorWarpTransition, resolveWarpTransition } from './game/warps';
import {
  checkForTrainersWantingBattle,
  startFieldTrainerSee,
  stepFieldTrainerSee,
  type FieldTrainerSeeState
} from './game/fieldTrainerSee';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Unable to mount app shell');
}

const shell = document.createElement('div');
shell.className = 'game-shell';
const viewport = document.createElement('div');
viewport.className = 'game-viewport';
const canvas = document.createElement('canvas');
viewport.append(canvas);

const hud = createHud();

shell.append(viewport, hud.root);

app.append(shell);

const defaultMap = loadRoute2Map();
const player = createPlayer();
const dialogue = createDialogueState();
const scriptRuntime = createScriptRuntimeState();
const startMenu = createStartMenuState();
const battle = createBattleState();
const battleEncounter = createBattleEncounterState();
const fieldPoisonEffect = createFieldPoisonEffectState();
const input = new BrowserInputAdapter();
input.attach();

const storage = window.localStorage;
const reloadSaveResult = reloadSave({
  storage,
  key: DEFAULT_SAVE_SLOT_KEY,
  defaultMap,
  loadMapById,
  player,
  runtime: scriptRuntime
});
let map = reloadSaveResult.map;

if (reloadSaveResult.loaded && reloadSaveResult.saveFileStatus === SAVE_STATUS_OK && reloadSaveResult.snapshot) {
  scriptRuntime.lastScriptId = `save.load.success.${reloadSaveResult.snapshot.saveIndex}`;
  if (getSavedWeather(scriptRuntime) === WEATHER_NONE && map.coordEventWeather) {
    setSavedWeatherFromCurrMapHeader(scriptRuntime, map.coordEventWeather);
  }
  resumePausedWeather(scriptRuntime);
} else {
  const generatedTrainerIdLower = Math.trunc(Date.now()) & 0xffff;
  const newGameRng = createDecompRng(generatedTrainerIdLower);
  const startResult = startNewGame(scriptRuntime, player, loadMapById, {
    generatedTrainerIdLower,
    randomHigh16: nextDecompRandom(newGameRng)
  });
  if (startResult) {
    map = startResult.map;
    clearPlayerMovement(player, map);
  }
  setSavedWeatherFromCurrMapHeader(scriptRuntime, map.coordEventWeather);
  doCurrentWeather(scriptRuntime);
}
let npcs = createMapNpcs(map);
trySetMapSaveWarpStatus(scriptRuntime, map.id);

const handleSaveConfirmed = () => {
  trySetMapSaveWarpStatus(scriptRuntime, map.id);
  const result = saveGameToStorage(storage, map.id, player, scriptRuntime, DEFAULT_SAVE_SLOT_KEY);
  scriptRuntime.lastScriptId = `save.write.${result.saveIndex}`;
  return result;
};

const handleSafariRetireConfirmed = () => {
  exitSafariMode(scriptRuntime);
  scriptRuntime.lastScriptId = 'safari.retire';
  syncBattleStateFromRuntime();
  return {
    ok: true,
    summary: 'Retired from the SAFARI GAME and returned to the counter.'
  };
};

const respawnAfterFieldPoisonWhiteOut = () => {
  const respawnWarp = resolveWhiteoutRespawnWarp(scriptRuntime);
  const respawnMap = respawnWarp ? loadMapById(respawnWarp.mapId) : null;
  if (!respawnWarp || !respawnMap) {
    return;
  }

  healParty(scriptRuntime.party);
  map = respawnMap;
  npcs = createMapNpcs(map);
  player.position.x = respawnWarp.x * map.tileSize;
  player.position.y = respawnWarp.y * map.tileSize;
  player.facing = 'down';
  clearPlayerMovement(player, map);
  setSavedWeatherFromCurrMapHeader(scriptRuntime, map.coordEventWeather);
  doCurrentWeather(scriptRuntime);
  trySetMapSaveWarpStatus(scriptRuntime, map.id);
  syncBattleStateFromRuntime();
};

const battleStatusToField = (status: BattlePokemonSnapshot['status']): FieldPokemonStatus =>
  status === 'poison' || status === 'badPoison' ? 'poison' : 'none';

const snapshotToFieldPokemon = (member: BattlePokemonSnapshot) =>
  cloneFieldPokemon({
    species: member.species,
    level: member.level,
    expProgress: member.expProgress,
    evs: { ...member.evs },
    maxHp: member.maxHp,
    hp: member.hp,
    attack: member.attack,
    defense: member.defense,
    speed: member.speed,
    spAttack: member.spAttack,
    spDefense: member.spDefense,
    catchRate: member.catchRate,
    types: [...member.types],
    status: battleStatusToField(member.status)
  });

const syncBattleStateFromRuntime = () => {
  const playerParty = scriptRuntime.party.map((member) => createBattlePokemonFromFieldPokemon(member));
  const safariModeActive = getSafariZoneFlag(scriptRuntime);
  const idleMode = safariModeActive
    ? 'safari'
    : battle.mode === 'safari'
      ? 'wild'
      : battle.mode;
  const nonSafariBattleTypeFlags = battle.battleTypeFlags.filter(
    (flag): flag is Exclude<BattleTypeFlag, 'safari'> => flag !== 'safari'
  );
  const idleBattleTypeFlags: BattleTypeFlag[] = safariModeActive
    ? [...nonSafariBattleTypeFlags, 'safari']
    : nonSafariBattleTypeFlags;
  configureBattleState(battle, {
    mode: idleMode,
    terrain: battle.terrain,
    mapBattleScene: battle.mapBattleScene,
    battleStyle: scriptRuntime.options.battleStyle,
    playerName: scriptRuntime.startMenu.playerName,
    playerParty,
    activePlayerPartyIndex: 0,
    opponentName: battle.opponentSide.name,
    trainerId: battle.opponentSide.trainerId,
    opponentParty: battle.opponentSide.party,
    activeOpponentPartyIndex: battle.opponentSide.activePartyIndexes[0],
    battleTypeFlags: idleBattleTypeFlags,
    safariBalls: safariModeActive ? getSafariZoneBallCount(scriptRuntime) : battle.safariBalls,
    caughtSpeciesIds: scriptRuntime.pokedex.caughtSpecies
  });
};

const syncRuntimePartyFromBattle = () => {
  if (battle.playerSide.party.length === 0) {
    return;
  }

  scriptRuntime.party = battle.playerSide.party.map((member) => snapshotToFieldPokemon(member));
};

const resolveBattlePayDayMoney = () => {
  const postResult = getBattlePostResult(battle);
  if (!battle.active || battle.phase !== 'resolved' || postResult.payDayTotal <= 0) {
    return;
  }

  setRuntimeMoney(scriptRuntime, getRuntimeMoney(scriptRuntime) + postResult.payDayTotal);
  battle.payDayMoney = 0;
  battle.postResult.payDayTotal = 0;
};

const resolvePendingTrainerBattleOutcome = () => {
  const pending = scriptRuntime.pendingTrainerBattle;
  const postResult = getBattlePostResult(battle);
  if (!pending || !pending.started || pending.resolved || !battle.active || battle.phase !== 'resolved') {
    return;
  }

  if (postResult.outcome !== 'won' && postResult.outcome !== 'lost') {
    return;
  }

  pending.resolved = true;
  pending.result = postResult.outcome;
  const moneyDelta = applyPendingTrainerBattleOutcome(scriptRuntime, pending, pending.result);
  if (moneyDelta >= 0) {
    battle.postResult.payouts = moneyDelta;
  } else {
    battle.postResult.losses = Math.abs(moneyDelta);
  }
  scriptRuntime.lastScriptId = `battle.trainer.${pending.trainerId.toLowerCase()}.${pending.result}`;
};

const resolveFinishedBattleAftermath = () => {
  const postResult = getBattlePostResult(battle);
  if (battle.active || postResult.outcome === 'none' || dialogue.active) {
    return;
  }

  const aftermathMessages: string[] = [];

  if (postResult.pendingMoveLearns.length > 0) {
    for (const learnedMove of postResult.pendingMoveLearns) {
      aftermathMessages.push(`${learnedMove.species} can now learn ${learnedMove.moveName}!`);
    }
  }

  if (postResult.pendingEvolutions.length > 0) {
    for (const evolution of postResult.pendingEvolutions) {
      aftermathMessages.push(`${evolution.species} is ready to evolve into ${evolution.evolvesTo}!`);
    }
  }

  if (postResult.whiteout || postResult.blackout) {
    aftermathMessages.push(
      `${scriptRuntime.startMenu.playerName} scurried to a POKeMON CENTER,`,
      'protecting the exhausted and fainted',
      'POKeMON from further harm...'
    );
    respawnAfterFieldPoisonWhiteOut();
    scriptRuntime.lastScriptId = postResult.whiteout ? 'battle.whiteout' : 'battle.blackout';
  }

  if (aftermathMessages.length > 0) {
    openDialogueSequence(dialogue, 'system', aftermathMessages);
  }

  clearBattlePostResult(battle);
};

const clearFinishedTrainerBattleRequest = () => {
  const pending = scriptRuntime.pendingTrainerBattle;
  if (!pending || !pending.started || !pending.resolved || battle.active || dialogue.active) {
    return;
  }

  if (
    pending.continueScriptSession
    && (pending.result === 'won' || isOakLabRivalTrainer(pending.trainerId))
  ) {
    resumeDecompFieldScriptSession(dialogue, {
      runtime: scriptRuntime,
      player,
      speakerId: pending.continueScriptSession.speakerId,
      session: pending.continueScriptSession.session,
      npcs
    });
  }

  scriptRuntime.pendingTrainerBattle = null;
};

const maybeStartPendingTrainerBattle = () => {
  const pending = scriptRuntime.pendingTrainerBattle;
  if (!pending || pending.started || dialogue.active || battle.active) {
    return;
  }

  startTrainerBattle(battle, {
    opponentName: pending.trainerName,
    trainerId: pending.trainerId,
    format: pending.format,
    opponentParty: pending.opponentParty,
    opponentTrainerItems: pending.trainerItems,
    opponentTrainerAiFlags: pending.trainerAiFlags,
    battleStyle: scriptRuntime.options.battleStyle,
    playerName: scriptRuntime.startMenu.playerName,
    playerParty: battle.playerSide.party,
    activePlayerPartyIndex: battle.playerSide.activePartyIndexes[0],
    mapBattleScene: map.battleScene
  });
  for (const pokemon of pending.opponentParty) {
    addPokedexSeenSpecies(scriptRuntime.pokedex, pokemon.species);
  }
  scriptRuntime.startMenu.seenPokemonCount = scriptRuntime.pokedex.seenSpecies.length;
  pending.started = true;
  scriptRuntime.lastScriptId = `battle.trainer.start.${pending.trainerId.toLowerCase()}`;
};

syncBattleStateFromRuntime();

const runDecompMapScript = (scriptId: string): boolean =>
  runDecompFieldScript(scriptId, {
    runtime: scriptRuntime,
    player,
    dialogue,
    speakerId: 'system',
    npcs
  });

const tryRunDecompMapScriptType = (scriptType: DecompMapScriptType): boolean => {
  const scriptId = getDecompMapScriptLabel(map.id, scriptType);
  return scriptId ? runDecompMapScript(scriptId) : false;
};

const tryRunDecompMapScript2Type = (scriptType: DecompMapScriptType): boolean => {
  const scriptId = getMatchingDecompMapScript2ScriptId(map.id, scriptType, scriptRuntime, player);
  return scriptId ? runDecompMapScript(scriptId) : false;
};

const runDecompWarpMapScripts = (): void => {
  if (tryRunDecompMapScriptType('MAP_SCRIPT_ON_TRANSITION') && dialogue.scriptSession) {
    return;
  }
  tryRunDecompMapScript2Type('MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE');
};

const renderer = new CanvasRenderer(canvas);
void renderer.preloadPartyMenuBackground().catch(() => undefined);
void renderer.preloadBattleUiAssets().catch(() => undefined);
const camera = createCamera(15 * map.tileSize, 10 * map.tileSize);
renderer.resize(camera.viewportWidth, camera.viewportHeight);

let frames = 0;
let fps = 0;
let fpsAccumulator = 0;
let pendingSafariBattleResult: { safariBalls: number; caught: boolean } | null = null;
let activeFieldAction: FieldActionState | null = null;
let activeTrainerSee: FieldTrainerSeeState | null = null;

const loop = new GameLoop({
  update(dt) {
    const snapshot = input.readSnapshot();
    trySpawnObjectEvents(npcs, scriptRuntime.flags);
    const visibleNpcs = npcs.filter((npc) => isNpcVisible(npc, scriptRuntime.flags));
    void dt;
    updatePlayTimeCounter(scriptRuntime.playTime);
    stepFieldPoisonEffect(fieldPoisonEffect);
    stepPcScreenEffect(scriptRuntime.pcScreenEffect);
    syncLegacyPlayTimeVars(scriptRuntime);
    if (scriptRuntime.startMenu.hasPokedex) {
      setUnlockedPokedexFlags(scriptRuntime);
    }

    const fieldControlsLocked = activeFieldAction !== null || activeTrainerSee !== null;
    const pendingForcedMovement = hasPendingForcedMovement(player, map);
    const inputGateContext = {
      fieldControlsLocked,
      pendingForcedMovement,
      dialogueActive: dialogue.active,
      scriptSessionActive: dialogue.scriptSession !== null,
      startMenuBlocking: isStartMenuBlockingWorld(startMenu),
      battleBlocking: isBattleBlockingWorld(battle)
    };
    const canProcessStartMenu = canProcessStartMenuInput(player, inputGateContext);
    const canProcessInteraction = canProcessFieldInteractionInput(player, inputGateContext);
    const canProcessMovement = canProcessPlayerMovementInput(player, inputGateContext);
    const canContinuePlayerMovement = player.stepTarget !== undefined;
    const canStepActiveFieldAction = activeFieldAction !== null
      && !dialogue.scriptSession
      && !dialogue.active
      && !isStartMenuBlockingWorld(startMenu)
      && !isBattleBlockingWorld(battle);

    if (!battle.active) {
      syncBattleStateFromRuntime();
    }

    stepBattle(battle, snapshot, battleEncounter, scriptRuntime.bag);
    if (battle.active && battle.mode === 'safari') {
      scriptRuntime.vars.safariBalls = battle.safariBalls;
      if (battle.phase === 'resolved' && battle.safariBalls === 0) {
        pendingSafariBattleResult = {
          safariBalls: battle.safariBalls,
          caught: battle.caughtMon !== null
        };
      }
    }
    applyBattleRewards(battle);
    syncRuntimePartyFromBattle();
    resolvePendingTrainerBattleOutcome();
    resolveBattlePayDayMoney();

    if (battle.caughtMon) {
      addPokedexCaughtSpecies(scriptRuntime.pokedex, battle.caughtMon.species);
      addPokemonToParty(scriptRuntime.party, snapshotToFieldPokemon(battle.caughtMon));
      battle.caughtMon = null;
      syncBattleStateFromRuntime();
    }

    resolveFinishedBattleAftermath();
    clearFinishedTrainerBattleRequest();

    if (!battle.active && pendingSafariBattleResult) {
      const safariExitMessages = finalizeSafariBattle(scriptRuntime, pendingSafariBattleResult);
      pendingSafariBattleResult = null;
      if (safariExitMessages) {
        openDialogueSequence(dialogue, 'system', [...safariExitMessages]);
        scriptRuntime.lastScriptId = 'safari.out_of_balls';
      }
      syncBattleStateFromRuntime();
    }

    if (activeTrainerSee) {
      const trainerSeeCompleted = stepFieldTrainerSee(activeTrainerSee, npcs, map, dt);
      if (!trainerSeeCompleted) {
        return;
      }

      const trainerNpc = npcs.find((npc) => npc.id === activeTrainerSee?.trainerId);
      activeTrainerSee = null;
      if (trainerNpc?.interactScriptId) {
        runDecompFieldScript(trainerNpc.interactScriptId, {
          runtime: scriptRuntime,
          player,
          dialogue,
          speakerId: trainerNpc.id,
          npcs
        });
        return;
      }
    }

    if (
      !dialogue.active
      && !dialogue.scriptSession
      && !isStartMenuBlockingWorld(startMenu)
      && !isBattleBlockingWorld(battle)
    ) {
      const trainerSight = checkForTrainersWantingBattle(map, player, npcs, scriptRuntime, visibleNpcs);
      if (trainerSight) {
        activeTrainerSee = startFieldTrainerSee(trainerSight);
        return;
      }
    }

    if (
      !dialogue.active
      && !dialogue.scriptSession
      && !isStartMenuBlockingWorld(startMenu)
      && !isBattleBlockingWorld(battle)
      && tryRunDecompMapScript2Type('MAP_SCRIPT_ON_FRAME_TABLE')
    ) {
      return;
    }

    if (canProcessStartMenu) {
      stepStartMenu(startMenu, snapshot, dialogue, scriptRuntime, {
        onSaveConfirmed: handleSaveConfirmed,
        onSafariRetireConfirmed: handleSafariRetireConfirmed,
        getPartyMembers: () => scriptRuntime.party.map((member, index) => ({
          species: member.species,
          level: member.level,
          hp: member.hp,
          maxHp: member.maxHp,
          attack: member.attack,
          defense: member.defense,
          speed: member.speed,
          spAttack: member.spAttack,
          spDefense: member.spDefense,
          types: [...member.types],
          status: member.status === 'none' ? 'OK' : member.status.toUpperCase(),
          isActive: index === 0
        })),
        onPartySwap: (fromIndex, toIndex) => {
          [scriptRuntime.party[fromIndex], scriptRuntime.party[toIndex]] = [
            scriptRuntime.party[toIndex],
            scriptRuntime.party[fromIndex]
          ];
          syncBattleStateFromRuntime();
        },
        getPlayerSummary: () => ({
          name: scriptRuntime.startMenu.playerName,
          money: getRuntimeMoney(scriptRuntime),
          badges: countEarnedBadges(scriptRuntime.flags),
          playTimeMinutes: getTotalPlayTimeMinutes(scriptRuntime.playTime),
          location: getMapSectionDisplayName(map.regionMapSection),
          locationSectionId: map.regionMapSection,
          saveCount: scriptRuntime.saveCounter,
          profileLines: [
            `NAME    ${scriptRuntime.startMenu.playerName}`,
            `MODE    ${scriptRuntime.startMenu.mode.toUpperCase()}`,
            `POKeDEX ${scriptRuntime.pokedex.caughtSpecies.length} OWN`,
            `COINS   ${getRuntimeCoins(scriptRuntime).toString().padStart(4, '0')}`
          ]
        })
      });
    }

    const canStepInteractionState = canProcessInteraction
      || (dialogue.active && !isStartMenuBlockingWorld(startMenu) && !isBattleBlockingWorld(battle))
      || (dialogue.scriptSession !== null && !isStartMenuBlockingWorld(startMenu) && !isBattleBlockingWorld(battle));

    if (canStepInteractionState) {
      stepInteraction(
        dialogue,
        snapshot,
        player,
        npcs,
        map.tileSize,
        map.triggers,
        scriptRuntime,
        prototypeScriptRegistry,
        map.hiddenItems ?? [],
        map.width,
        map.tileBehaviors,
        map.elevations,
        map.collisionValues,
        map.terrainTypes
      );
    }

    maybeStartPendingTrainerBattle();

    const applyPendingScriptWarp = (): boolean => {
      const pendingWarp = scriptRuntime.pendingScriptWarp;
      if (!pendingWarp) {
        return false;
      }

      scriptRuntime.pendingScriptWarp = null;
      const destinationMap = loadMapById(pendingWarp.mapId);
      if (!destinationMap) {
        scriptRuntime.lastScriptId = `script-warp.unloaded.${pendingWarp.mapId}`;
        openDialogueSequence(dialogue, 'system', [`This warp leads to ${pendingWarp.mapId}.`]);
        return true;
      }

      map = destinationMap;
      npcs = createMapNpcs(map);
      player.position.x = pendingWarp.x * map.tileSize;
      player.position.y = pendingWarp.y * map.tileSize;
      clearPlayerMovement(player, map);
      setSavedWeatherFromCurrMapHeader(scriptRuntime, map.coordEventWeather);
      doCurrentWeather(scriptRuntime);
      trySetMapSaveWarpStatus(scriptRuntime, map.id);
      runDecompWarpMapScripts();
      scriptRuntime.lastScriptId = `${pendingWarp.kind}.${pendingWarp.mapId}`;
      return true;
    };

    applyPendingScriptWarp();

    const applyWarpTransition = (warpTransition: ReturnType<typeof resolveWarpTransition>): boolean => {
      if (warpTransition.status === 'resolved' && warpTransition.destinationMap && warpTransition.playerPosition) {
        applyWarpTransitionEffect(scriptRuntime, player, warpTransition);
        map = warpTransition.destinationMap;
        npcs = createMapNpcs(map);
        player.position.x = warpTransition.playerPosition.x;
        player.position.y = warpTransition.playerPosition.y;
        clearPlayerMovement(player, map);
        setSavedWeatherFromCurrMapHeader(scriptRuntime, map.coordEventWeather);
        doCurrentWeather(scriptRuntime);
        trySetMapSaveWarpStatus(scriptRuntime, map.id);
        runDecompWarpMapScripts();
        scriptRuntime.lastScriptId = `warp.${warpTransition.sourceWarp?.destMap ?? map.id}`;
        return true;
      }

      if (warpTransition.status === 'unloaded_map' || warpTransition.status === 'invalid_warp_id') {
        clearPlayerMovement(player, map);
        scriptRuntime.lastScriptId = `warp.${warpTransition.status}.${warpTransition.sourceWarp?.destMap ?? 'unknown'}`;
        openDialogueSequence(
          dialogue,
          'system',
          [
            warpTransition.status === 'unloaded_map'
              ? `This warp leads to ${warpTransition.sourceWarp?.destMap ?? 'an unloaded map'}.`
              : `This warp points to an invalid destination on ${warpTransition.sourceWarp?.destMap ?? 'the target map'}.`
          ]
        );
        return true;
      }

      return false;
    };

    const handleStepResult = (
      stepResult: {
        attemptedDirection: typeof player.facing | null;
        collision: ReturnType<typeof evaluateFieldCollision> | null;
        enteredNewTile: boolean;
        forcedMovement: boolean;
        connectionTransition: ReturnType<typeof evaluateFieldCollision> | null;
      }
    ) => {
      const actionEnteredNewTile = stepResult.enteredNewTile;

      if (stepResult.connectionTransition?.target?.viaConnection) {
        map = stepResult.connectionTransition.target.map;
        npcs = createMapNpcs(map);
        player.position.x = stepResult.connectionTransition.target.tile.x * map.tileSize;
        player.position.y = stepResult.connectionTransition.target.tile.y * map.tileSize;
        clearPlayerMovement(player, map);
        setSavedWeatherFromCurrMapHeader(scriptRuntime, map.coordEventWeather);
        doCurrentWeather(scriptRuntime);
        trySetMapSaveWarpStatus(scriptRuntime, map.id);
        runDecompWarpMapScripts();
        return;
      }

      if (stepResult.collision?.result === 'directionalStairWarp') {
        player.avatarMode = 'normal';
      }
      const heldDirection = resolveInputDirection(snapshot);
      const warpTransition = actionEnteredNewTile || stepResult.collision?.result === 'directionalStairWarp'
        ? resolveWarpTransition(map, player, loadMapById, scriptRuntime.dynamicWarp, {
          allowArrowWarp: heldDirection === player.facing,
          allowDirectionalStairWarp: stepResult.collision?.result === 'directionalStairWarp'
        })
        : resolveFacingDoorWarpTransition(map, player, stepResult.attemptedDirection, loadMapById, scriptRuntime.dynamicWarp);

      if (applyWarpTransition(warpTransition)) {
        return;
      }

      if (!shouldRunNormalStepSideEffects(stepResult)) {
        return;
      }

      const poisonResult = doPoisonFieldEffect(scriptRuntime.party);
      if (poisonResult !== 'FLDPSN_NONE' && !fldEffPoisonIsActive(fieldPoisonEffect)) {
        fldEffPoisonStart(fieldPoisonEffect);
      }
      if (poisonResult === 'FLDPSN_FNT') {
        const whiteOut = tryFieldPoisonWhiteOut(scriptRuntime.party);
        const messages = [...whiteOut.faintedMessages];
        if (whiteOut.allMonsFainted) {
          messages.push(
            `${scriptRuntime.startMenu.playerName} scurried to a POKeMON CENTER,`,
            'protecting the exhausted and fainted',
            'POKeMON from further harm...'
          );
          respawnAfterFieldPoisonWhiteOut();
          scriptRuntime.lastScriptId = 'field.poison.whiteout';
        } else {
          scriptRuntime.lastScriptId = 'field.poison.faint';
        }
        if (messages.length > 0) {
          openDialogueSequence(dialogue, 'system', messages);
          return;
        }
      }

      if (safariZoneTakeStep(scriptRuntime)) {
        exitSafariMode(scriptRuntime);
        openDialogueSequence(dialogue, 'system', [...SAFARI_ZONE_TEXT_TIMES_UP]);
        scriptRuntime.lastScriptId = 'safari.times_up';
        syncBattleStateFromRuntime();
        return;
      }

      const stepTriggerStarted = runStepTriggersAtPlayerTile(map.triggers, player, map.tileSize, {
        player,
        dialogue,
        runtime: scriptRuntime,
        scriptRegistry: prototypeScriptRegistry,
        hiddenItems: map.hiddenItems ?? [],
        npcs
      });
      if (stepTriggerStarted) {
        return;
      }

      const isWaterEncounter = player.avatarMode === 'surfing' && hasWaterEncounterAtPixel(map, player.position);
      const canEncounter = isWaterEncounter || hasLandEncounterAtPixel(map, player.position);
      const encounterKind = isWaterEncounter ? 'water' : 'land';
      if (tryStartWildBattle(
        battle,
        battleEncounter,
        actionEnteredNewTile,
        canEncounter,
        isWaterEncounter ? map.wildEncounters?.water : map.wildEncounters?.land,
        map.battleScene,
        map.id,
        getSafariZoneFlag(scriptRuntime)
          ? {
            mode: 'safari',
            battleTypeFlags: ['safari'],
            safariBalls: getSafariZoneBallCount(scriptRuntime),
            encounterKind
          }
          : { encounterKind }
      )) {
        addPokedexSeenSpecies(scriptRuntime.pokedex, battle.wildMon.species);
        scriptRuntime.startMenu.seenPokemonCount = scriptRuntime.pokedex.seenSpecies.length;
        scriptRuntime.lastScriptId = getSafariZoneFlag(scriptRuntime)
          ? 'battle.safari.start'
          : 'battle.wild.start';
      }
    };

    if (canStepActiveFieldAction || canContinuePlayerMovement || canProcessMovement) {
      if (activeFieldAction) {
        const stepResult = stepFieldAction(activeFieldAction, player, npcs, map, dt);
        if (stepResult.completed) {
          activeFieldAction = null;
          if (stepResult.strengthButtonTile) {
            runStrengthButtonTriggersAtTile(
              map.triggers,
              stepResult.strengthButtonTile,
              {
                player,
                dialogue,
                runtime: scriptRuntime,
                scriptRegistry: prototypeScriptRegistry,
                hiddenItems: map.hiddenItems ?? [],
                npcs
              }
            );
          }
          handleStepResult(stepResult);
        }
      } else {
        const heldDirection = resolveInputDirection(snapshot);
        if (
          !player.moving
          && !player.stepTarget
          && applyWarpTransition(resolveArrowWarpTransition(
            map,
            player,
            heldDirection,
            loadMapById,
            scriptRuntime.dynamicWarp
          ))
        ) {
          return;
        }

        if (
          !player.moving
          && !player.stepTarget
          && tryRunWalkIntoSignpostScript(
            map.triggers,
            player,
            heldDirection,
            map.tileSize,
            {
              player,
              dialogue,
              runtime: scriptRuntime,
              scriptRegistry: prototypeScriptRegistry,
              hiddenItems: map.hiddenItems ?? [],
              npcs
            },
            map.width,
            map.tileBehaviors,
            map.elevations,
            snapshot.left || snapshot.right
          )
        ) {
          return;
        }

        const stepResult = stepPlayer(
          player,
          snapshot,
          map,
          dt,
          (direction) =>
            evaluateFieldCollision({
              map,
              object: {
                ...getPlayerRuntimeObject(player, map),
                strengthActive: scriptRuntime.flags.has('FLAG_SYS_USE_STRENGTH')
              },
              direction,
              objects: visibleNpcs.map((npc) => getNpcRuntimeObject(npc, map)),
              loadMapById
            })
        );

        if (stepResult.collision && stepResult.attemptedDirection) {
          const nextAction = createFieldAction(
            map,
            player,
            npcs,
            stepResult.collision,
            stepResult.attemptedDirection,
            loadMapById,
            stepResult.forcedMovement
          );
          if (nextAction) {
            applyFieldActionStartSideEffects(nextAction, scriptRuntime);
            activeFieldAction = nextAction;
            return;
          }
        }

        handleStepResult(stepResult);
      }
    } else if (!activeFieldAction) {
      clearPlayerMovement(player, map);
    }

    if (!isStartMenuBlockingWorld(startMenu) && !isBattleBlockingWorld(battle)) {
      const frozenNpcIds = new Set<string>(scriptRuntime.eventObjectLock.frozenObjectEventIds);
      if (dialogue.active && dialogue.speakerId) {
        frozenNpcIds.add(dialogue.speakerId);
      }
      for (const npcId of getFieldActionFrozenNpcIds(activeFieldAction, visibleNpcs)) {
        frozenNpcIds.add(npcId);
      }
      stepNpcs(npcs, map, dt, player, frozenNpcIds, scriptRuntime.flags);
    }

    followTarget(
      camera,
      { x: player.position.x + 8, y: player.position.y + 8 },
      { width: map.width * map.tileSize, height: map.height * map.tileSize }
    );

    frames += 1;
    fpsAccumulator += dt;
    if (fpsAccumulator >= 1) {
      fps = frames / fpsAccumulator;
      frames = 0;
      fpsAccumulator = 0;
    }

    scriptRuntime.startMenu.seenPokemonCount = scriptRuntime.pokedex.seenSpecies.length;
    scriptRuntime.startMenu.hasPokemon = scriptRuntime.party.length > 0;
    scriptRuntime.startMenu.hasPokedex = scriptRuntime.flags.has('FLAG_SYS_POKEDEX_GET') || scriptRuntime.startMenu.hasPokedex;
    if (dialogue.active) {
      stepFieldTextPrinter(dialogue.fieldMessageBox, 1, snapshot.interact || snapshot.cancel);
    }
  },
  render() {
    trySpawnObjectEvents(npcs, scriptRuntime.flags);
    const visibleNpcs = npcs.filter((npc) => isNpcVisible(npc, scriptRuntime.flags));
    renderer.render(map, player, visibleNpcs, camera, {
      startMenu,
      runtime: scriptRuntime,
      battle,
      bag: scriptRuntime.bag,
      dialogue,
      fieldPoison: fieldPoisonEffect,
      pcScreenEffect: scriptRuntime.pcScreenEffect
    });
    updateHud(hud, player, visibleNpcs, fps, camera, dialogue, scriptRuntime.lastScriptId, startMenu, battle);
  }
});

loop.start();
window.addEventListener('beforeunload', () => {
  input.detach();
  loop.stop();
});
