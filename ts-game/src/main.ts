import './style.css';
import { GameLoop } from './core/gameLoop';
import { BrowserInputAdapter } from './input/inputState';
import { CanvasRenderer } from './rendering/canvasRenderer';
import { createPrototypeRouteMap } from './world/tileMap';
import { createPlayer, stepPlayer } from './game/player';
import { createHud, updateHud } from './ui/hud';

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
app.append(shell);

const map = createPrototypeRouteMap();
const player = createPlayer();
const input = new BrowserInputAdapter();
input.attach();

const renderer = new CanvasRenderer(canvas);
renderer.resize(map.width * map.tileSize, map.height * map.tileSize);

let frames = 0;
let fps = 0;
let fpsAccumulator = 0;

const loop = new GameLoop({
  update(dt) {
    const snapshot = input.readSnapshot();
    stepPlayer(player, snapshot, map, dt);

    frames += 1;
    fpsAccumulator += dt;
    if (fpsAccumulator >= 1) {
      fps = frames / fpsAccumulator;
      frames = 0;
      fpsAccumulator = 0;
    }
  },
  render() {
    renderer.render(map, player);
    updateHud(hud, player, fps);
  }
});

loop.start();
window.addEventListener('beforeunload', () => {
  input.detach();
  loop.stop();
});
