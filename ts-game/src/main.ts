import './style.css';
import { GameLoop } from './core/gameLoop';
import { createCamera, followTarget } from './core/camera';
import { BrowserInputAdapter } from './input/inputState';
import { CanvasRenderer } from './rendering/canvasRenderer';
import { loadPrototypeRouteMap } from './world/mapSource';
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

const map = loadPrototypeRouteMap();
const player = createPlayer();
const input = new BrowserInputAdapter();
input.attach();

const renderer = new CanvasRenderer(canvas);
const camera = createCamera(12 * map.tileSize, 10 * map.tileSize);
renderer.resize(camera.viewportWidth, camera.viewportHeight);

let frames = 0;
let fps = 0;
let fpsAccumulator = 0;

const loop = new GameLoop({
  update(dt) {
    const snapshot = input.readSnapshot();
    stepPlayer(player, snapshot, map, dt);

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
    renderer.render(map, player, camera);
    updateHud(hud, player, fps, camera);
  }
});

loop.start();
window.addEventListener('beforeunload', () => {
  input.detach();
  loop.stop();
});
