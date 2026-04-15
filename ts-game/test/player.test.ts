import { describe, expect, test } from 'vitest';
import { createPlayer, stepPlayer } from '../src/game/player';
import { createPrototypeRouteMap } from '../src/world/tileMap';
import { loadRoute1Map } from '../src/world/mapSource';

const idleInput = {
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
  cancelPressed: false
};

describe('player stepping', () => {
  test('does not move when no direction is pressed', () => {
    const map = createPrototypeRouteMap();
    const player = createPlayer();
    const startX = player.position.x;

    stepPlayer(player, idleInput, map, 1 / 60);

    expect(player.position.x).toBe(startX);
    expect(player.moving).toBe(false);
  });

  test('moves right and updates facing direction', () => {
    const map = createPrototypeRouteMap();
    const player = createPlayer();

    stepPlayer(
      player,
      { ...idleInput, right: true },
      map,
      1 / 10
    );

    expect(player.position.x).toBeGreaterThan(3 * 16);
    expect(player.facing).toBe('right');
    expect(player.moving).toBe(true);
    expect(player.animationTime).toBeGreaterThan(0);
  });

  test('prevents crossing blocked tiles', () => {
    const map = createPrototypeRouteMap();
    const player = createPlayer();

    player.position.x = 9 * 16;
    player.position.y = 4.2 * 16;

    for (let i = 0; i < 30; i += 1) {
      stepPlayer(player, { ...idleInput, down: true }, map, 1 / 60);
    }

    expect(player.position.y).toBeLessThan(5 * 16);
    expect(player.moving).toBe(false);
  });

  test('prevents moving into entity collision callback', () => {
    const map = createPrototypeRouteMap();
    const player = createPlayer();

    const startX = player.position.x;
    stepPlayer(
      player,
      { ...idleInput, right: true },
      map,
      1 / 10,
      () => true
    );

    expect(player.position.x).toBe(startX);
    expect(player.moving).toBe(false);
  });

  test('jumps two tiles over a south ledge like FireRed GetJump2MovementAction', () => {
    const map = loadRoute1Map();
    const player = createPlayer();
    player.position.x = 4 * 16;
    player.position.y = 4 * 16;

    stepPlayer(player, { ...idleInput, down: true }, map, 1 / 60);

    expect(player.position.x).toBe(4 * 16);
    expect(player.position.y).toBe(6 * 16);
    expect(player.facing).toBe('down');
    expect(player.moving).toBe(true);
    expect(player.jumping).toBe(true);
  });

  test('does not jump a ledge when walking against its one-way direction', () => {
    const map = loadRoute1Map();
    const player = createPlayer();
    player.position.x = 4 * 16;
    player.position.y = 6 * 16;

    stepPlayer(player, { ...idleInput, up: true }, map, 1 / 60);

    expect(player.position.y).toBeGreaterThan(5 * 16);
    expect(player.jumping).toBe(false);
  });
});
