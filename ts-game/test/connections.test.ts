import { describe, expect, test } from 'vitest';
import { findConnectionForInput } from '../src/world/connections';
import { loadRoute1Map } from '../src/world/mapSource';
import { createPlayer } from '../src/game/player';

const input = {
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

describe('map connection edge probes', () => {
  test('detects Route 1 north and south decomp connections at map edges', () => {
    const map = loadRoute1Map();
    const player = createPlayer();

    player.position.x = 11 * map.tileSize;
    player.position.y = -12;
    expect(findConnectionForInput(map, player, { ...input, up: true })?.map).toBe('MAP_VIRIDIAN_CITY');

    player.position.y = (map.height - 1) * map.tileSize - 12;
    expect(findConnectionForInput(map, player, { ...input, down: true })?.map).toBe('MAP_PALLET_TOWN');
  });

  test('ignores non-edge movement', () => {
    const map = loadRoute1Map();
    const player = createPlayer();

    player.position.x = 11 * map.tileSize;
    player.position.y = 10 * map.tileSize;

    expect(findConnectionForInput(map, player, { ...input, up: true })).toBeNull();
  });
});
