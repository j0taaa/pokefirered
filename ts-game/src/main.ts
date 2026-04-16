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
  applySaveSnapshot,
  DEFAULT_SAVE_SLOT_KEY,
  loadGameFromStorage,
  saveGameToStorage
} from './game/saveData';
import { createStartMenuView, updateStartMenuView } from './ui/startMenu';
import { createBagMenuView, updateBagMenuView } from './ui/bagMenu';
import { createBattleOverlay, updateBattleOverlay } from './ui/battleOverlay';
import { createBattleEncounterState, createBattleState, isBattleBlockingWorld, stepBattle, tryStartWildBattle } from './game/battle';
import { hasLandEncounterAtPixel } from './world/tileMap';
import { resolveMapConnectionTransition } from './game/mapConnections';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Unable to mount app shell');
}

const shell = document.createElement('div');
shell.className = 'game-shell';
const canvas = document.createElement('canvas');
shell.append(canvas);

const hud = createHud();
shell.append(hud.root);

const startMenuView = createStartMenuView();
shell.append(startMenuView.root);

const bagMenuView = createBagMenuView();
shell.append(bagMenuView.root);

const battleOverlay = createBattleOverlay();
shell.append(battleOverlay.root);

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

const renderer = new CanvasRenderer(canvas);
const camera = createCamera(12 * map.tileSize, 10 * map.tileSize);
renderer.resize(camera.viewportWidth, camera.viewportHeight);

let frames = 0;
let fps = 0;
let fpsAccumulator = 0;

const loop = new GameLoop({
  update(dt) {
    const snapshot = input.readSnapshot();
    const visibleNpcs = npcs.filter((npc) => isNpcVisible(npc, scriptRuntime.flags));

    stepBattle(battle, snapshot, battleEncounter, scriptRuntime.bag);

    if (!isBattleBlockingWorld(battle)) {
      stepStartMenu(startMenu, snapshot, dialogue, scriptRuntime, { onSaveConfirmed: handleSaveConfirmed });
    }

    if (!isStartMenuBlockingWorld(startMenu) && !isBattleBlockingWorld(battle)) {
      stepInteraction(
        dialogue,
        snapshot,
        player,
        visibleNpcs,
        map.tileSize,
        map.triggers,
        map.hiddenItems,
        scriptRuntime,
        prototypeScriptRegistry
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
          scriptRegistry: prototypeScriptRegistry
        });

        const canEncounter = hasLandEncounterAtPixel(map, player.position);
        if (tryStartWildBattle(
          battle,
          battleEncounter,
          enteredNewTile,
          canEncounter,
          map.wildEncounters?.land
        )) {
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
  },
  render() {
    const visibleNpcs = npcs.filter((npc) => isNpcVisible(npc, scriptRuntime.flags));
    renderer.render(map, player, visibleNpcs, camera);
    updateHud(hud, player, visibleNpcs, fps, camera, dialogue, scriptRuntime.lastScriptId, startMenu, battle);
    updateStartMenuView(startMenuView, startMenu);
    updateBagMenuView(bagMenuView, startMenu.panel?.kind === 'bag' ? startMenu.panel : null, scriptRuntime.bag);
    updateBattleOverlay(battleOverlay, battle, scriptRuntime.bag);
  }
});

loop.start();
window.addEventListener('beforeunload', () => {
  input.detach();
  loop.stop();
});
