import { describe, expect, test } from 'vitest';
import { findConnectionForInput, resolveMapConnection } from '../src/world/connections';
import { loadMapById, loadPalletTownMap, loadRoute1Map, loadViridianCityMap } from '../src/world/mapSource';
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

  test('resolves Route 1 south edge into Pallet Town with preserved x', () => {
    const route1 = loadRoute1Map();
    const player = createPlayer();

    player.position.x = 12 * route1.tileSize;
    player.position.y = (route1.height - 1) * route1.tileSize - 12;

    const resolved = resolveMapConnection(route1, player, { ...input, down: true }, loadMapById);

    expect(resolved?.connection.map).toBe('MAP_PALLET_TOWN');
    expect(resolved?.map.id).toBe('MAP_PALLET_TOWN');
    expect(resolved?.position).toEqual({ x: 12 * route1.tileSize, y: route1.tileSize });
  });

  test('resolves Route 1 north edge into Viridian City using original offset direction', () => {
    const route1 = loadRoute1Map();
    const player = createPlayer();

    player.position.x = 11 * route1.tileSize;
    player.position.y = -12;

    const resolved = resolveMapConnection(route1, player, { ...input, up: true }, loadMapById);

    expect(resolved?.connection.map).toBe('MAP_VIRIDIAN_CITY');
    expect(resolved?.map.id).toBe('MAP_VIRIDIAN_CITY');
    expect(resolved?.position).toEqual({ x: 23 * route1.tileSize, y: 38 * route1.tileSize });
  });

  test('resolves Pallet Town north edge back into Route 1 near the south entrance', () => {
    const palletTown = loadPalletTownMap();
    const player = createPlayer();

    player.position.x = 13 * palletTown.tileSize;
    player.position.y = -12;

    const resolved = resolveMapConnection(palletTown, player, { ...input, up: true }, loadMapById);

    expect(resolved?.connection.map).toBe('MAP_ROUTE1');
    expect(resolved?.map.id).toBe('MAP_ROUTE1');
    expect(resolved?.position).toEqual({ x: 13 * palletTown.tileSize, y: 38 * palletTown.tileSize });
  });

  test('resolves Viridian City south edge back into Route 1 with inverse connection offset', () => {
    const viridianCity = loadViridianCityMap();
    const player = createPlayer();

    player.position.x = 23 * viridianCity.tileSize;
    player.position.y = (viridianCity.height - 1) * viridianCity.tileSize - 12;

    const resolved = resolveMapConnection(viridianCity, player, { ...input, down: true }, loadMapById);

    expect(resolved?.connection.map).toBe('MAP_ROUTE1');
    expect(resolved?.map.id).toBe('MAP_ROUTE1');
    expect(resolved?.position).toEqual({ x: 11 * viridianCity.tileSize, y: viridianCity.tileSize });
  });

  test('leaves still-unloaded decomp connection destinations unresolved', () => {
    const viridianCity = loadViridianCityMap();
    const player = createPlayer();

    player.position.x = 23 * viridianCity.tileSize;
    player.position.y = -12;

    expect(resolveMapConnection(viridianCity, player, { ...input, up: true }, loadMapById)).toBeNull();
  });
});
