import { describe, expect, test } from 'vitest';
import { createPlayer, getPlayerTilePosition, stepPlayer } from '../src/game/player';
import type { TileMap } from '../src/world/tileMap';

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
  const openMap: TileMap = {
    id: 'open-map',
    width: 12,
    height: 12,
    tileSize: 16,
    walkable: Array.from({ length: 12 * 12 }, () => true),
    connections: [],
    triggers: [],
    npcs: []
  };

  const blockedRowMap: TileMap = {
    id: 'blocked-row',
    width: 12,
    height: 12,
    tileSize: 16,
    walkable: Array.from({ length: 12 * 12 }, (_, index) => Math.floor(index / 12) !== 5),
    connections: [],
    triggers: [],
    npcs: []
  };

  test('does not move when no direction is pressed', () => {
    const player = createPlayer();
    const startX = player.position.x;

    stepPlayer(player, idleInput, openMap, 1 / 60);

    expect(player.position.x).toBe(startX);
    expect(player.moving).toBe(false);
  });

  test('moves right and updates facing direction', () => {
    const player = createPlayer();

    stepPlayer(
      player,
      { ...idleInput, right: true },
      openMap,
      1 / 10
    );

    expect(player.position.x).toBeGreaterThan(3 * 16);
    expect(player.facing).toBe('right');
    expect(player.moving).toBe(true);
    expect(player.animationTime).toBeGreaterThan(0);
  });

  test('prevents crossing blocked tiles', () => {
    const player = createPlayer();

    player.position.x = 9 * 16;
    player.position.y = 4.2 * 16;

    for (let i = 0; i < 30; i += 1) {
      stepPlayer(player, { ...idleInput, down: true }, blockedRowMap, 1 / 60);
    }

    expect(player.position.y).toBeLessThan(5 * 16);
    expect(player.moving).toBe(false);
  });

  test('prevents moving into entity collision callback', () => {
    const player = createPlayer();

    const startX = player.position.x;
    stepPlayer(
      player,
      { ...idleInput, right: true },
      openMap,
      1 / 10,
      () => true
    );

    expect(player.position.x).toBe(startX);
    expect(player.moving).toBe(false);
  });

  test('reports tile transitions only after crossing into the next tile', () => {
    const player = createPlayer();
    const startTile = getPlayerTilePosition(player.position, 16);

    player.position.x += 4;
    const sameTile = getPlayerTilePosition(player.position, 16);
    expect(sameTile).toEqual(startTile);

    player.position.x += 5;
    const nextTile = getPlayerTilePosition(player.position, 16);
    expect(nextTile.x).toBe(startTile.x + 1);
    expect(nextTile.y).toBe(startTile.y);
  });
});
