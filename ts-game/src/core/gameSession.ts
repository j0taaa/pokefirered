import { createCamera, followTarget, type CameraState } from './camera';
import { loadMapById, loadRoute2Map } from '../world/mapSource';
import {
  clearPlayerMovement,
  createPlayer,
  getPlayerTilePosition,
  resolveInputDirection,
  stepPlayer,
  type StepPlayerResult
} from '../game/player';
import { createMapNpcs, isNpcVisible, stepNpcs, trySpawnObjectEvents } from '../game/npc';
import { createDialogueState, openDialogueSequence, stepInteraction } from '../game/interaction';
import { stepFieldTextPrinter } from '../game/decompFieldMessageBox';
import {
  applyPendingTrainerBattleOutcome,
  getRuntimeCoins,
  createScriptRuntimeState,
  getRuntimeMoney,
  isOakLabRivalTrainer,
  prototypeScriptRegistry,
  syncLegacyPlayTimeVars,
  setRuntimeMoney
} from '../game/scripts';
import {
  getDecompMapScriptLabel,
  getMatchingDecompMapScript2ScriptId,
  resumeDecompFieldScriptSession,
  runDecompFieldScript,
  type DecompMapScriptType
} from '../game/decompFieldDialogue';
import {
  runStrengthButtonTriggersAtTile,
  tryRunWalkIntoSignpostScript
} from '../game/triggers';
import { createStartMenuState, isStartMenuBlockingWorld, stepStartMenu } from '../game/menu';
import {
  addPokedexCaughtSpecies,
  addPokemonToParty,
  cloneFieldPokemon
} from '../game/pokemonStorage';
import {
  DEFAULT_SAVE_SLOT_KEY,
  saveGameToStorage,
  createSaveSnapshot,
  applySaveSnapshot,
  type SaveSnapshot,
  type StorageLike
} from '../game/saveData';
import { reloadSave, SAVE_STATUS_OK } from '../game/decompResetSaveHeap';
import {
  applyBattleRewards,
  clearBattlePostResult,
  configureBattleState,
  createBattlePokemonFromFieldPokemon,
  createBattleEncounterState,
  createBattleState,
  getBattlePostResult,
  isBattleBlockingWorld,
  stepBattle,
  type BattleTypeFlag,
  type BattlePokemonSnapshot
} from '../game/battle';
import {
  createFieldPoisonEffectState,
  stepFieldPoisonEffect
} from '../game/decompFieldPoison';
import { stepPcScreenEffect } from '../game/decompPcScreenEffect';
import { startNewGame } from '../game/decompNewGame';
import { getTotalPlayTimeMinutes, updatePlayTimeCounter } from '../game/decompPlayTime';
import { createDecompRng, nextDecompRandom } from '../game/decompRandom';
import { countEarnedBadges, getMapSectionDisplayName } from '../game/decompSaveMenuUtil';
import { setUnlockedPokedexFlags, trySetMapSaveWarpStatus } from '../game/decompSaveLocation';
import {
  doCurrentWeather,
  getSavedWeather,
  resumePausedWeather,
  setSavedWeatherFromCurrMapHeader,
  WEATHER_NONE
} from '../game/decompFieldWeatherUtil';
import {
  exitSafariMode,
  finalizeSafariBattle,
  getSafariZoneBallCount,
  getSafariZoneFlag
} from '../game/decompSafariZone';
import { resolveWhiteoutRespawnWarp } from '../game/decompHealLocation';
import { healParty, type FieldPokemonStatus } from '../game/pokemonStorage';
import {
  applyFieldActionStartSideEffects,
  createFieldAction,
  getFieldActionFrozenNpcIds,
  stepFieldAction,
  type FieldActionState
} from '../game/fieldActions';
import {
  applyConnectionTransition,
  applyPendingScriptWarp,
  applyResolvedWarpTransition,
  resolveStepWarpTransition,
  tryApplyArrowWarpBeforeMovement,
  type FieldWorldState
} from '../game/fieldWarpCoordinator';
import { resolveCurrentTileWarpTransition, resolveTileWarpTransition } from '../game/warps';
import { resolveMapConnectionTransition } from '../game/mapConnections';
import { resolveFieldInputState } from '../game/fieldInputCoordinator';
import { evaluatePlayerFieldCollision } from '../game/fieldCollisionCoordinator';
import { runPostMovementFieldOrder } from '../game/fieldOrderCoordinator';
import { startPendingTrainerBattleIfReady } from '../game/fieldBattleHandoffCoordinator';
import {
  checkForTrainersWantingBattle,
  startFieldTrainerSee,
  stepFieldTrainerSee,
  type FieldTrainerSeeState
} from '../game/fieldTrainerSee';
import type { AudioAdapter, InputAdapter, RenderAdapter, StorageAdapter } from '../api/adapters';
import type { TextApiJsonValue, TextApiSaveBlob } from '../api/textApiTypes';
import { createSaveEnvelope, hasValidSaveChecksum, isSaveEnvelope } from '../game/saveValidation';
import type { InputSnapshot } from '../input/inputState';
import type { TileMap } from '../world/tileMap';
import type { NpcState } from '../game/npc';
import type { PlayerState } from '../game/player';
import type { DialogueState } from '../game/interaction';
import type { ScriptRuntimeState } from '../game/scripts';
import type { StartMenuState } from '../game/menu';
import type { BattleEncounterState, BattleState } from '../game/battle';
import type { FieldPoisonEffectState } from '../game/decompFieldPoison';


const FIXED_STEP_SECONDS = 1 / 60;
const TEXT_API_SAVE_BLOB_SCHEMA_VERSION = 1;

export interface GameSessionAdapters {
  storage: StorageAdapter;
  audio: AudioAdapter;
  input: InputAdapter;
  render: RenderAdapter<RenderFrameState>;
}

export interface GameRuntimeState {
  readonly player: PlayerState;
  readonly dialogue: DialogueState;
  readonly scriptRuntime: ScriptRuntimeState;
  readonly startMenu: StartMenuState;
  readonly battle: BattleState;
  readonly battleEncounter: BattleEncounterState;
  readonly fieldPoisonEffect: FieldPoisonEffectState;
  readonly map: TileMap;
  readonly npcs: readonly NpcState[];
  readonly activeFieldAction: FieldActionState | null;
  readonly activeTrainerSee: FieldTrainerSeeState | null;
  readonly pendingSafariBattleResult: { safariBalls: number; caught: boolean } | null;
  readonly fps: number;
}

export interface RenderFrameState {
  readonly map: TileMap;
  readonly player: PlayerState;
  readonly visibleNpcs: readonly NpcState[];
  readonly camera: CameraState;
  readonly overlays: {
    readonly startMenu: StartMenuState;
    readonly runtime: ScriptRuntimeState;
    readonly battle: BattleState;
    readonly bag: ScriptRuntimeState['bag'];
    readonly dialogue: DialogueState;
    readonly fieldPoison: FieldPoisonEffectState;
    readonly pcScreenEffect: ScriptRuntimeState['pcScreenEffect'];
  };
  readonly hud: {
    readonly fps: number;
    readonly lastScriptId: ScriptRuntimeState['lastScriptId'];
  };
}

const storageAdapterToStorageLike = (adapter: StorageAdapter): StorageLike => ({
  getItem: (key) => adapter.load(key),
  setItem: (key, value) => adapter.save(key, value),
  removeItem: (key) => adapter.remove(key)
});

const isSaveSnapshotLike = (value: unknown): value is SaveSnapshot => (
  !!value
  && typeof value === 'object'
  && typeof (value as Partial<SaveSnapshot>).mapId === 'string'
  && typeof (value as Partial<SaveSnapshot>).schemaVersion === 'number'
  && !!(value as Partial<SaveSnapshot>).player
  && !!(value as Partial<SaveSnapshot>).runtime
);

export class GameSession {
  private readonly adapters: GameSessionAdapters;
  private runFrame: (snapshot: InputSnapshot, dt: number) => void = () => undefined;
  private readRuntimeState!: () => GameRuntimeState;
  private readRenderableState!: () => RenderFrameState;
  private exportBlob!: () => TextApiSaveBlob;
  private importBlob!: (blob: TextApiSaveBlob) => void;
  private applyTextApiWarp!: () => boolean;
  private applyTextApiWarpAt!: (tileX: number, tileY: number) => boolean;
  private applyTextApiConnection!: (direction: PlayerState['facing']) => boolean;

  constructor(adapters: GameSessionAdapters, storageKey = DEFAULT_SAVE_SLOT_KEY) {
    this.adapters = adapters;
    const storageLike = storageAdapterToStorageLike(adapters.storage);
    const defaultMap = loadRoute2Map();
    const player = createPlayer();
    const dialogue = createDialogueState();
    const scriptRuntime = createScriptRuntimeState();
    const startMenu = createStartMenuState();
    const battle = createBattleState();
    const battleEncounter = createBattleEncounterState();
    const fieldPoisonEffect = createFieldPoisonEffectState();
    const storage = storageLike;
    const reloadSaveResult = reloadSave({
      storage,
      key: storageKey,
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
    const fieldWorld: FieldWorldState = { map, npcs };
    const syncFieldWorldFromLocals = (): void => {
      fieldWorld.map = map;
      fieldWorld.npcs = npcs;
    };
    const syncLocalsFromFieldWorld = (): void => {
      map = fieldWorld.map;
      npcs = fieldWorld.npcs;
    };
    this.applyTextApiWarp = (): boolean => {
      const warpContext = {
        world: fieldWorld,
        player,
        runtime: scriptRuntime,
        loadMapById,
        runWarpMapScripts: runDecompWarpMapScripts
      };
      syncFieldWorldFromLocals();
      const applied = applyResolvedWarpTransition(
        warpContext,
        resolveCurrentTileWarpTransition(map, player, loadMapById, scriptRuntime.dynamicWarp)
      );
      if (applied) {
        syncLocalsFromFieldWorld();
      }
      return applied;
    };
    this.applyTextApiWarpAt = (tileX, tileY): boolean => {
      const warpContext = {
        world: fieldWorld,
        player,
        runtime: scriptRuntime,
        loadMapById,
        runWarpMapScripts: runDecompWarpMapScripts
      };
      syncFieldWorldFromLocals();
      const applied = applyResolvedWarpTransition(
        warpContext,
        resolveTileWarpTransition(map, tileX, tileY, player.facing, loadMapById, scriptRuntime.dynamicWarp)
      );
      if (applied) {
        syncLocalsFromFieldWorld();
      }
      return applied;
    };
    this.applyTextApiConnection = (direction): boolean => {
      syncFieldWorldFromLocals();
      const tile = player.currentTile ?? getPlayerTilePosition(player.position, map.tileSize);
      const transition = resolveMapConnectionTransition(map, tile.x, tile.y, direction, loadMapById);
      if (!transition) {
        return false;
      }

      fieldWorld.map = transition.map;
      fieldWorld.npcs = createMapNpcs(transition.map);
      player.position.x = transition.playerPosition.x;
      player.position.y = transition.playerPosition.y;
      clearPlayerMovement(player, transition.map);
      setSavedWeatherFromCurrMapHeader(scriptRuntime, transition.map.coordEventWeather);
      doCurrentWeather(scriptRuntime);
      trySetMapSaveWarpStatus(scriptRuntime, transition.map.id);
      runDecompWarpMapScripts();
      syncLocalsFromFieldWorld();
      if (scriptRuntime.lastScriptId === '') {
        scriptRuntime.lastScriptId = null;
      }
      return true;
    };
    trySetMapSaveWarpStatus(scriptRuntime, map.id);

    const handleSaveConfirmed = () => {
      trySetMapSaveWarpStatus(scriptRuntime, map.id);
      const result = saveGameToStorage(storage, map.id, player, scriptRuntime, storageKey);
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
        moves: member.moves.map((move) => move.id),
        movePpRemaining: member.moves.map((move) => move.ppRemaining),
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
      startPendingTrainerBattleIfReady({
        runtime: scriptRuntime,
        battle,
        dialogue,
        map
      });
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

    const camera = createCamera(15 * map.tileSize, 10 * map.tileSize);

    let frames = 0;
    let fps = 0;
    let fpsAccumulator = 0;
    let pendingSafariBattleResult: { safariBalls: number; caught: boolean } | null = null;
    let activeFieldAction: FieldActionState | null = null;
    let activeTrainerSee: FieldTrainerSeeState | null = null;


    const runFrame = (snapshot: InputSnapshot, dt: number): void => {
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

        const fieldInput = resolveFieldInputState(
          player,
          map,
          dialogue,
          startMenu,
          battle,
          activeFieldAction !== null || activeTrainerSee !== null,
          activeFieldAction !== null
        );

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

        if (fieldInput.canProcessStartMenu) {
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

        const canStepInteractionState = fieldInput.canProcessInteraction
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

        const warpContext = {
          world: fieldWorld,
          player,
          runtime: scriptRuntime,
          loadMapById,
          runWarpMapScripts: runDecompWarpMapScripts
        };

        syncFieldWorldFromLocals();
        applyPendingScriptWarp(warpContext);
        syncLocalsFromFieldWorld();

        const handleStepResult = (stepResult: StepPlayerResult) => {
          syncFieldWorldFromLocals();
          if (applyConnectionTransition(warpContext, stepResult)) {
            syncLocalsFromFieldWorld();
            return;
          }

          if (stepResult.collision?.result === 'directionalStairWarp') {
            player.avatarMode = 'normal';
          }
          if (applyResolvedWarpTransition(warpContext, resolveStepWarpTransition(warpContext, stepResult, snapshot))) {
            syncLocalsFromFieldWorld();
            return;
          }

          runPostMovementFieldOrder({
            map,
            player,
            dialogue,
            runtime: scriptRuntime,
            scriptRegistry: prototypeScriptRegistry,
            npcs,
            battle,
            battleEncounter,
            fieldPoisonEffect,
            respawnAfterFieldPoisonWhiteOut,
            syncBattleStateFromRuntime
          }, stepResult);
        };

        if (fieldInput.canStepActiveFieldAction || fieldInput.canContinuePlayerMovement || fieldInput.canProcessMovement) {
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
                && tryApplyArrowWarpBeforeMovement(warpContext, heldDirection)
            ) {
              syncLocalsFromFieldWorld();
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
                evaluatePlayerFieldCollision(map, player, visibleNpcs, scriptRuntime, loadMapById, direction)
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
        this.adapters.audio.consume(scriptRuntime.fieldAudio.events);
      };


    this.runFrame = runFrame;
    this.readRuntimeState = (): GameRuntimeState => ({
      player,
      dialogue,
      scriptRuntime,
      startMenu,
      battle,
      battleEncounter,
      fieldPoisonEffect,
      map,
      npcs,
      activeFieldAction,
      activeTrainerSee,
      pendingSafariBattleResult,
      fps
    });
    this.readRenderableState = (): RenderFrameState => {
      trySpawnObjectEvents(npcs, scriptRuntime.flags);
      const visibleNpcs = npcs.filter((npc) => isNpcVisible(npc, scriptRuntime.flags));
      return {
        map,
        player,
        visibleNpcs,
        camera,
        overlays: {
          startMenu,
          runtime: scriptRuntime,
          battle,
          bag: scriptRuntime.bag,
          dialogue,
          fieldPoison: fieldPoisonEffect,
          pcScreenEffect: scriptRuntime.pcScreenEffect
        },
        hud: {
          fps,
          lastScriptId: scriptRuntime.lastScriptId
        }
      };
    };
    this.exportBlob = (): TextApiSaveBlob => {
      const snapshot = createSaveSnapshot(map.id, player, scriptRuntime);
      const envelope = createSaveEnvelope(snapshot);
      return {
        schemaVersion: TEXT_API_SAVE_BLOB_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        data: envelope as unknown as TextApiJsonValue,
        checksum: envelope.checksum
      };
    };
    this.importBlob = (blob: TextApiSaveBlob): void => {
      const snapshot = (() => {
        const data = blob.data as unknown;
        if (isSaveEnvelope(data)) {
          if (!hasValidSaveChecksum(data)) {
            throw new Error('Invalid text API save blob checksum.');
          }
          return data.payload;
        }
        if (isSaveSnapshotLike(data)) {
          return data;
        }
        throw new Error('Invalid text API save blob payload.');
      })();
      const nextMap = loadMapById(snapshot.mapId);
      if (!nextMap) {
        throw new Error(`Invalid save blob map: ${snapshot.mapId}`);
      }
      map = nextMap;
      npcs = createMapNpcs(map);
      applySaveSnapshot(snapshot, map.id, player, scriptRuntime);
      clearPlayerMovement(player, map);
      trySetMapSaveWarpStatus(scriptRuntime, map.id);
      syncBattleStateFromRuntime();
      pendingSafariBattleResult = null;
      activeFieldAction = null;
      activeTrainerSee = null;
      followTarget(
        camera,
        { x: player.position.x + 8, y: player.position.y + 8 },
        { width: map.width * map.tileSize, height: map.height * map.tileSize }
      );
    };
  }

  step(input: InputSnapshot): void {
    this.runFrame(input, FIXED_STEP_SECONDS);
  }

  stepFrames(inputs: InputSnapshot[], frameCount: number): void {
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
      cancelPressed: false,
      select: false,
      selectPressed: false
    };
    for (let frame = 0; frame < frameCount; frame += 1) {
      this.step(inputs[frame] ?? neutralInput);
    }
  }

  getRuntimeState(): GameRuntimeState {
    return this.readRuntimeState();
  }

  getRenderableState(): RenderFrameState {
    return this.readRenderableState();
  }

  exportSaveBlob(): TextApiSaveBlob {
    return this.exportBlob();
  }

  importSaveBlob(blob: TextApiSaveBlob): void {
    this.importBlob(blob);
  }

  applyTextApiWarpTransition(): boolean {
    return this.applyTextApiWarp();
  }

  applyTextApiWarpTransitionAt(tileX: number, tileY: number): boolean {
    return this.applyTextApiWarpAt(tileX, tileY);
  }

  applyTextApiConnectionTransition(direction: PlayerState['facing']): boolean {
    return this.applyTextApiConnection(direction);
  }

  cleanup(): void {
    this.adapters.audio.reset();
  }
}
