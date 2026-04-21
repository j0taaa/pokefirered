import './style.css';
import { GameLoop } from './core/gameLoop';
import { createCamera, followTarget } from './core/camera';
import { BrowserInputAdapter } from './input/inputState';
import { CanvasRenderer } from './rendering/canvasRenderer';
import { loadMapById, loadRoute2Map } from './world/mapSource';
import { createPlayer, getPlayerTilePosition, resolveInputDirection, stepPlayer } from './game/player';
import { collidesWithNpcs, createMapNpcs, isNpcVisible, stepNpcs } from './game/npc';
import { createDialogueState, openDialogueSequence, stepInteraction } from './game/interaction';
import { createHud, updateHud } from './ui/hud';
import {
  applyPendingTrainerBattleOutcome,
  getRuntimeCoins,
  createScriptRuntimeState,
  getRuntimeMoney,
  prototypeScriptRegistry,
  syncLegacyPlayTimeVars,
  setRuntimeMoney
} from './game/scripts';
import { resumeDecompFieldScriptSession } from './game/decompFieldDialogue';
import { runStepTriggersAtPlayerTile } from './game/triggers';
import { createStartMenuState, isStartMenuBlockingWorld, stepStartMenu } from './game/menu';
import {
  addPokedexCaughtSpecies,
  addPokedexSeenSpecies,
  addPokemonToParty,
  cloneFieldPokemon
} from './game/pokemonStorage';
import {
  applySaveSnapshot,
  DEFAULT_SAVE_SLOT_KEY,
  loadGameFromStorage,
  saveGameToStorage
} from './game/saveData';
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
import { doPoisonFieldEffect, tryFieldPoisonWhiteOut } from './game/decompFieldPoisonStatus';
import { getTotalPlayTimeMinutes, updatePlayTimeCounter } from './game/decompPlayTime';
import { countEarnedBadges, getMapSectionDisplayName } from './game/decompSaveMenuUtil';
import { setUnlockedPokedexFlags, trySetMapSaveWarpStatus } from './game/decompSaveLocation';
import {
  exitSafariMode,
  finalizeSafariBattle,
  getSafariZoneBallCount,
  getSafariZoneFlag,
  safariZoneTakeStep,
  SAFARI_ZONE_TEXT_TIMES_UP
} from './game/decompSafariZone';
import { getRespawnLocation } from './game/pokemonCenterTemplate';
import { healParty, type FieldPokemonStatus } from './game/pokemonStorage';
import { hasLandEncounterAtPixel } from './world/tileMap';
import { resolveMapConnectionTransition } from './game/mapConnections';
import { resolveFacingDoorWarpTransition, resolveWarpTransition } from './game/warps';

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
const loadedSave = loadGameFromStorage(storage, DEFAULT_SAVE_SLOT_KEY);
let map = loadedSave ? (loadMapById(loadedSave.mapId) ?? defaultMap) : defaultMap;
let npcs = createMapNpcs(map);

if (loadedSave && applySaveSnapshot(loadedSave, map.id, player, scriptRuntime)) {
  scriptRuntime.lastScriptId = `save.load.success.${loadedSave.saveIndex}`;
}
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
  const respawn = getRespawnLocation(scriptRuntime);
  const respawnMap = respawn ? loadMapById(respawn.respawnMap) : null;
  if (!respawn || !respawnMap) {
    return;
  }

  healParty(scriptRuntime.party);
  map = respawnMap;
  npcs = createMapNpcs(map);
  player.position.x = respawn.respawnX * map.tileSize;
  player.position.y = respawn.respawnY * map.tileSize;
  player.facing = 'down';
  player.moving = false;
  player.animationTime = 0;
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
    caughtSpeciesIds: battle.caughtSpeciesIds
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

const clearFinishedTrainerBattleRequest = () => {
  const pending = scriptRuntime.pendingTrainerBattle;
  if (!pending || !pending.started || !pending.resolved || battle.active) {
    return;
  }

  if (pending.result === 'won' && pending.continueScriptSession) {
    resumeDecompFieldScriptSession(dialogue, {
      runtime: scriptRuntime,
      player,
      speakerId: pending.continueScriptSession.speakerId,
      session: pending.continueScriptSession.session
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

const renderer = new CanvasRenderer(canvas);
void renderer.preloadPartyMenuBackground().catch(() => undefined);
void renderer.preloadBattleUiAssets().catch(() => undefined);
const camera = createCamera(15 * map.tileSize, 10 * map.tileSize);
renderer.resize(camera.viewportWidth, camera.viewportHeight);

let frames = 0;
let fps = 0;
let fpsAccumulator = 0;
let pendingSafariBattleResult: { safariBalls: number; caught: boolean } | null = null;

const loop = new GameLoop({
  update(dt) {
    const snapshot = input.readSnapshot();
    const visibleNpcs = npcs.filter((npc) => isNpcVisible(npc, scriptRuntime.flags));
    void dt;
    updatePlayTimeCounter(scriptRuntime.playTime);
    stepFieldPoisonEffect(fieldPoisonEffect);
    syncLegacyPlayTimeVars(scriptRuntime);
    if (scriptRuntime.startMenu.hasPokedex) {
      setUnlockedPokedexFlags(scriptRuntime);
    }

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
    clearFinishedTrainerBattleRequest();

    if (battle.caughtMon) {
      addPokedexCaughtSpecies(scriptRuntime.pokedex, battle.caughtMon.species);
      addPokemonToParty(scriptRuntime.party, snapshotToFieldPokemon(battle.caughtMon));
      battle.caughtMon = null;
      syncBattleStateFromRuntime();
    }

    if (!battle.active && pendingSafariBattleResult) {
      const safariExitMessages = finalizeSafariBattle(scriptRuntime, pendingSafariBattleResult);
      pendingSafariBattleResult = null;
      if (safariExitMessages) {
        openDialogueSequence(dialogue, 'system', [...safariExitMessages]);
        scriptRuntime.lastScriptId = 'safari.out_of_balls';
      }
      syncBattleStateFromRuntime();
    }

    if (!isBattleBlockingWorld(battle)) {
      clearBattlePostResult(battle);
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

    if (!isStartMenuBlockingWorld(startMenu) && !isBattleBlockingWorld(battle)) {
      stepInteraction(
        dialogue,
        snapshot,
        player,
        visibleNpcs,
        map.tileSize,
        map.triggers,
        scriptRuntime,
        prototypeScriptRegistry,
        map.hiddenItems ?? [],
        map.width,
        map.tileBehaviors
      );
    }

    maybeStartPendingTrainerBattle();

    const previousTile = getPlayerTilePosition(player.position, map.tileSize);

    if (!dialogue.active && !isStartMenuBlockingWorld(startMenu) && !isBattleBlockingWorld(battle)) {
      const attemptedDirection = resolveInputDirection(snapshot);

      stepPlayer(
        player,
        snapshot,
        map,
        dt,
        (nextPosition) => collidesWithNpcs(nextPosition, visibleNpcs)
      );

      const currentTile = getPlayerTilePosition(player.position, map.tileSize);
      const enteredNewTile = previousTile.x !== currentTile.x || previousTile.y !== currentTile.y;
      const connectionTransition = !enteredNewTile
        ? resolveMapConnectionTransition(
          map,
          currentTile.x,
          currentTile.y,
          attemptedDirection,
          loadMapById
        )
        : null;

      if (connectionTransition) {
        map = connectionTransition.map;
        npcs = createMapNpcs(map);
        player.position.x = connectionTransition.playerPosition.x;
        player.position.y = connectionTransition.playerPosition.y;
        player.moving = false;
        player.animationTime = 0;
        trySetMapSaveWarpStatus(scriptRuntime, map.id);
      } else {
        const warpTransition = enteredNewTile
          ? resolveWarpTransition(map, player, loadMapById)
          : resolveFacingDoorWarpTransition(map, player, attemptedDirection, loadMapById);

        if (warpTransition.status === 'resolved' && warpTransition.destinationMap && warpTransition.playerPosition) {
          map = warpTransition.destinationMap;
          npcs = createMapNpcs(map);
          player.position.x = warpTransition.playerPosition.x;
          player.position.y = warpTransition.playerPosition.y;
          player.moving = false;
          player.animationTime = 0;
          trySetMapSaveWarpStatus(scriptRuntime, map.id);
          scriptRuntime.lastScriptId = `warp.${warpTransition.sourceWarp?.destMap ?? map.id}`;
        } else if (warpTransition.status === 'unloaded_map' || warpTransition.status === 'invalid_warp_id') {
          player.moving = false;
          player.animationTime = 0;
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
        } else if (enteredNewTile) {
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
          } else {
            runStepTriggersAtPlayerTile(map.triggers, player, map.tileSize, {
              player,
              dialogue,
              runtime: scriptRuntime,
              scriptRegistry: prototypeScriptRegistry,
              hiddenItems: map.hiddenItems ?? []
            });

            const canEncounter = hasLandEncounterAtPixel(map, player.position);
            if (tryStartWildBattle(
              battle,
              battleEncounter,
              enteredNewTile,
              canEncounter,
              map.wildEncounters?.land,
              map.battleScene,
              map.id,
              getSafariZoneFlag(scriptRuntime)
                ? {
                  mode: 'safari',
                  battleTypeFlags: ['safari'],
                  safariBalls: getSafariZoneBallCount(scriptRuntime)
                }
                : undefined
            )) {
              addPokedexSeenSpecies(scriptRuntime.pokedex, battle.wildMon.species);
              scriptRuntime.startMenu.seenPokemonCount = scriptRuntime.pokedex.seenSpecies.length;
              scriptRuntime.lastScriptId = getSafariZoneFlag(scriptRuntime)
                ? 'battle.safari.start'
                : 'battle.wild.start';
            }
          }
        }
      }
    } else {
      player.moving = false;
      player.animationTime = 0;
    }

    if (!isStartMenuBlockingWorld(startMenu) && !isBattleBlockingWorld(battle)) {
      const frozenNpcIds = dialogue.active && dialogue.speakerId
        ? new Set<string>([dialogue.speakerId])
        : new Set<string>();
      stepNpcs(npcs, map, dt, frozenNpcIds);
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
    scriptRuntime.startMenu.hasPokedex = scriptRuntime.pokedex.seenSpecies.length > 0 || scriptRuntime.startMenu.hasPokedex;
  },
  render() {
    const visibleNpcs = npcs.filter((npc) => isNpcVisible(npc, scriptRuntime.flags));
    renderer.render(map, player, visibleNpcs, camera, {
      startMenu,
      runtime: scriptRuntime,
      battle,
      bag: scriptRuntime.bag,
      dialogue,
      fieldPoison: fieldPoisonEffect
    });
    updateHud(hud, player, visibleNpcs, fps, camera, dialogue, scriptRuntime.lastScriptId, startMenu, battle);
  }
});

loop.start();
window.addEventListener('beforeunload', () => {
  input.detach();
  loop.stop();
});
