import './style.css';
import { GameLoop } from './core/gameLoop';
import { createCamera, followTarget } from './core/camera';
import { BrowserInputAdapter } from './input/inputState';
import { CanvasRenderer } from './rendering/canvasRenderer';
import { loadMapById, loadRoute2Map } from './world/mapSource';
import { createPlayer, getPlayerTilePosition, resolveInputDirection, stepPlayer } from './game/player';
import { collidesWithNpcs, createMapNpcs, isNpcVisible, stepNpcs } from './game/npc';
import { createDialogueState, stepInteraction } from './game/interaction';
import { createHud, updateHud } from './ui/hud';
import { createScriptRuntimeState, prototypeScriptRegistry } from './game/scripts';
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
  createBattlePokemonFromFieldPokemon,
  createBattleEncounterState,
  createBattleState,
  isBattleBlockingWorld,
  stepBattle,
  tryStartWildBattle,
  type BattlePokemonSnapshot
} from './game/battle';
import type { FieldPokemonStatus } from './game/pokemonStorage';
import { hasLandEncounterAtPixel } from './world/tileMap';
import { resolveMapConnectionTransition } from './game/mapConnections';

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
const input = new BrowserInputAdapter();
input.attach();

const storage = window.localStorage;
const loadedSave = loadGameFromStorage(storage, DEFAULT_SAVE_SLOT_KEY);
let map = loadedSave ? (loadMapById(loadedSave.mapId) ?? defaultMap) : defaultMap;
let npcs = createMapNpcs(map);

if (loadedSave && applySaveSnapshot(loadedSave, map.id, player, scriptRuntime)) {
  scriptRuntime.lastScriptId = `save.load.success.${loadedSave.saveIndex}`;
}

const handleSaveConfirmed = () => {
  const result = saveGameToStorage(storage, map.id, player, scriptRuntime, DEFAULT_SAVE_SLOT_KEY);
  scriptRuntime.lastScriptId = `save.write.${result.saveIndex}`;
  return result;
};

const battleStatusToField = (status: BattlePokemonSnapshot['status']): FieldPokemonStatus =>
  status === 'poison' ? 'poison' : 'none';

const snapshotToFieldPokemon = (member: BattlePokemonSnapshot) =>
  cloneFieldPokemon({
    species: member.species,
    level: member.level,
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
  battle.party = scriptRuntime.party.map((member) => createBattlePokemonFromFieldPokemon(member));
  battle.playerMon = battle.party[0] ?? battle.playerMon;
  battle.moves = battle.playerMon.moves;
};

const syncRuntimePartyFromBattle = () => {
  if (battle.party.length === 0) {
    return;
  }

  scriptRuntime.party = battle.party.map((member) => snapshotToFieldPokemon(member));
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

const loop = new GameLoop({
  update(dt) {
    const snapshot = input.readSnapshot();
    const visibleNpcs = npcs.filter((npc) => isNpcVisible(npc, scriptRuntime.flags));
    scriptRuntime.vars.playTimeSeconds = (scriptRuntime.vars.playTimeSeconds ?? 0) + dt;

    if (!battle.active) {
      syncBattleStateFromRuntime();
    }

    stepBattle(battle, snapshot, battleEncounter, scriptRuntime.bag);
    syncRuntimePartyFromBattle();

    if (battle.caughtMon) {
      addPokedexCaughtSpecies(scriptRuntime.pokedex, battle.caughtMon.species);
      addPokemonToParty(scriptRuntime.party, snapshotToFieldPokemon(battle.caughtMon));
      battle.caughtMon = null;
      syncBattleStateFromRuntime();
    }

    if (!isBattleBlockingWorld(battle)) {
      stepStartMenu(startMenu, snapshot, dialogue, scriptRuntime, {
        onSaveConfirmed: handleSaveConfirmed,
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
          money: Math.max(0, Math.trunc(scriptRuntime.vars.money ?? 3000)),
          badges: Math.max(0, Math.trunc(scriptRuntime.vars.badges ?? 0)),
          playTimeMinutes: Math.floor((scriptRuntime.vars.playTimeSeconds ?? 0) / 60),
          location: map.id,
          saveCount: scriptRuntime.saveCounter,
          profileLines: [
            `NAME    ${scriptRuntime.startMenu.playerName}`,
            `MODE    ${scriptRuntime.startMenu.mode.toUpperCase()}`,
            `POKeDEX ${scriptRuntime.pokedex.caughtSpecies.length} OWN`
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
        map.hiddenItems ?? []
      );
    }

    const previousTile = getPlayerTilePosition(player.position, map.tileSize);

    if (!dialogue.active && !isStartMenuBlockingWorld(startMenu) && !isBattleBlockingWorld(battle)) {
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
          resolveInputDirection(snapshot),
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
      } else if (enteredNewTile) {
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
          map.id
        )) {
          addPokedexSeenSpecies(scriptRuntime.pokedex, battle.wildMon.species);
          scriptRuntime.startMenu.seenPokemonCount = scriptRuntime.pokedex.seenSpecies.length;
          scriptRuntime.lastScriptId = 'battle.wild.start';
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
    renderer.render(map, player, visibleNpcs, camera, { startMenu, runtime: scriptRuntime, battle, bag: scriptRuntime.bag });
    updateHud(hud, player, visibleNpcs, fps, camera, dialogue, scriptRuntime.lastScriptId, startMenu, battle);
  }
});

loop.start();
window.addEventListener('beforeunload', () => {
  input.detach();
  loop.stop();
});
