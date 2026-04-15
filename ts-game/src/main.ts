import './style.css';
import { GameLoop } from './core/gameLoop';
import { createCamera, followTarget } from './core/camera';
import { BrowserInputAdapter } from './input/inputState';
import { CanvasRenderer } from './rendering/canvasRenderer';
import { loadRoute1Map } from './world/mapSource';
import { isLandEncounterAtPixel } from './world/tileMap';
import { createPlayer, stepPlayer } from './game/player';
import { collidesWithNpcs, createNpcsFromSources, stepNpcs } from './game/npc';
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
import { createBattleOverlay, updateBattleOverlay } from './ui/battleOverlay';
import { createBattleEncounterState, createBattleState, isBattleBlockingWorld, stepBattle, tryStartWildBattle } from './game/battle';

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

const battleOverlay = createBattleOverlay();
shell.append(battleOverlay.root);

app.append(shell);

const map = loadRoute1Map();
const player = createPlayer();
const npcs = createNpcsFromSources(map.npcs, map.tileSize);
const dialogue = createDialogueState();
const scriptRuntime = createScriptRuntimeState();
const startMenu = createStartMenuState();
const battle = createBattleState();
const battleEncounter = createBattleEncounterState();
const input = new BrowserInputAdapter();
input.attach();

const storage = window.localStorage;
const loadedSave = loadGameFromStorage(storage, DEFAULT_SAVE_SLOT_KEY);
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

    stepBattle(battle, snapshot, battleEncounter);

    if (!isBattleBlockingWorld(battle)) {
      stepStartMenu(startMenu, snapshot, dialogue, scriptRuntime, { onSaveConfirmed: handleSaveConfirmed });
    }

    if (!isStartMenuBlockingWorld(startMenu) && !isBattleBlockingWorld(battle)) {
      stepInteraction(
        dialogue,
        snapshot,
        player,
        npcs,
        map.tileSize,
        map.triggers,
        scriptRuntime,
        prototypeScriptRegistry
      );
    }

    const previousX = player.position.x;
    const previousY = player.position.y;

    if (!dialogue.active && !isStartMenuBlockingWorld(startMenu) && !isBattleBlockingWorld(battle)) {
      stepPlayer(
        player,
        snapshot,
        map,
        dt,
        (nextPosition) => collidesWithNpcs(nextPosition, npcs)
      );

      const movedThisFrame = previousX !== player.position.x || previousY !== player.position.y;
      if (movedThisFrame) {
        runStepTriggersAtPlayerTile(map.triggers, player, map.tileSize, {
          player,
          dialogue,
          runtime: scriptRuntime,
          scriptRegistry: prototypeScriptRegistry
        });

        const collisionProbe = { x: player.position.x + 8, y: player.position.y + 12 };
        if (tryStartWildBattle(battle, battleEncounter, movedThisFrame, isLandEncounterAtPixel(map, collisionProbe))) {
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
    renderer.render(map, player, npcs, camera);
    updateHud(hud, player, npcs, fps, camera, map, dialogue, scriptRuntime.lastScriptId, startMenu, battle);
    updateStartMenuView(startMenuView, startMenu);
    updateBattleOverlay(battleOverlay, battle);
  }
});

loop.start();
window.addEventListener('beforeunload', () => {
  input.detach();
  loop.stop();
});
