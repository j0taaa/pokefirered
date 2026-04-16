import { describe, expect, test } from 'vitest';
import { resolveMapConnectionTransition } from '../src/game/mapConnections';
import {
  loadMapById,
  loadPalletTownMap,
  loadPewterCityMap,
  loadRoute2Map,
  loadRoute21NorthMap,
  loadRoute21SouthMap,
  loadRoute22Map,
  loadViridianCityMap
} from '../src/world/mapSource';

describe('map connections', () => {
  test('matches Route 2 and Viridian City decomp connection offsets', () => {
    const palletTown = loadPalletTownMap();
    const route2 = loadRoute2Map();
    const route21North = loadRoute21NorthMap();
    const route21South = loadRoute21SouthMap();
    const route22 = loadRoute22Map();
    const viridianCity = loadViridianCityMap();

    expect(palletTown.connections).toEqual([
      { map: 'MAP_ROUTE1', offset: 0, direction: 'up' },
      { map: 'MAP_ROUTE21_NORTH', offset: 0, direction: 'down' }
    ]);
    expect(route2.connections).toEqual([
      { map: 'MAP_PEWTER_CITY', offset: -12, direction: 'up' },
      { map: 'MAP_VIRIDIAN_CITY', offset: -12, direction: 'down' }
    ]);
    expect(route21North.connections).toEqual([
      { map: 'MAP_PALLET_TOWN', offset: 0, direction: 'up' },
      { map: 'MAP_ROUTE21_SOUTH', offset: 0, direction: 'down' }
    ]);
    expect(route21South.connections).toEqual([
      { map: 'MAP_ROUTE21_NORTH', offset: 0, direction: 'up' },
      { map: 'MAP_CINNABAR_ISLAND', offset: 0, direction: 'down' }
    ]);
    expect(route22.connections).toEqual([
      { map: 'MAP_ROUTE23', offset: 0, direction: 'up' },
      { map: 'MAP_VIRIDIAN_CITY', offset: -10, direction: 'right' }
    ]);
    expect(viridianCity.connections).toEqual([
      { map: 'MAP_ROUTE2', offset: 12, direction: 'up' },
      { map: 'MAP_ROUTE1', offset: 12, direction: 'down' },
      { map: 'MAP_ROUTE22', offset: 10, direction: 'left' }
    ]);
  });

  test('transitions from Viridian City north edge into Route 2 using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadViridianCityMap(), 20, 0, 'up', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE2');
    expect(transition?.playerPosition).toEqual({ x: 8 * 16, y: 79 * 16 });
  });

  test('transitions from Route 2 south edge into Viridian City using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute2Map(), 8, 79, 'down', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_VIRIDIAN_CITY');
    expect(transition?.playerPosition).toEqual({ x: 20 * 16, y: 0 });
  });

  test('transitions from Route 2 north edge into Pewter City using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute2Map(), 8, 0, 'up', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_PEWTER_CITY');
    expect(transition?.playerPosition).toEqual({ x: 20 * 16, y: 39 * 16 });
  });

  test('transitions from Pewter City south edge into Route 2 using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadPewterCityMap(), 20, 39, 'down', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE2');
    expect(transition?.playerPosition).toEqual({ x: 8 * 16, y: 0 });
  });

  test('transitions from Viridian City west edge into Route 22 using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadViridianCityMap(), 0, 16, 'left', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE22');
    expect(transition?.playerPosition).toEqual({ x: 47 * 16, y: 6 * 16 });
  });

  test('transitions from Route 22 east edge into Viridian City using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute22Map(), 47, 6, 'right', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_VIRIDIAN_CITY');
    expect(transition?.playerPosition).toEqual({ x: 0, y: 16 * 16 });
  });

  test('transitions from Pallet Town south edge into Route 21 North using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadPalletTownMap(), 8, 19, 'down', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE21_NORTH');
    expect(transition?.playerPosition).toEqual({ x: 8 * 16, y: 0 });
  });

  test('transitions from Route 21 North north edge into Pallet Town using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute21NorthMap(), 8, 0, 'up', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_PALLET_TOWN');
    expect(transition?.playerPosition).toEqual({ x: 8 * 16, y: 19 * 16 });
  });

  test('transitions from Route 21 North south edge into Route 21 South using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute21NorthMap(), 8, 49, 'down', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE21_SOUTH');
    expect(transition?.playerPosition).toEqual({ x: 8 * 16, y: 0 });
  });

  test('transitions from Route 21 South north edge into Route 21 North using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute21SouthMap(), 8, 0, 'up', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE21_NORTH');
    expect(transition?.playerPosition).toEqual({ x: 8 * 16, y: 49 * 16 });
  });

  test('rejects coordinates outside the connected overlap', () => {
    expect(resolveMapConnectionTransition(loadPalletTownMap(), 5, 19, 'down', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadViridianCityMap(), 10, 0, 'up', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute2Map(), 7, 0, 'up', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute2Map(), 3, 79, 'down', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadPewterCityMap(), 19, 39, 'down', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute21NorthMap(), 0, 0, 'up', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute21NorthMap(), 0, 49, 'down', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute21SouthMap(), 0, 0, 'up', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadViridianCityMap(), 0, 15, 'left', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute22Map(), 47, 5, 'right', loadMapById)).toBeNull();
  });

  test('returns null for unloaded destination maps', () => {
    expect(resolveMapConnectionTransition(loadPewterCityMap(), 47, 20, 'right', loadMapById)).toBeNull();
  });

  test('loads Route 22 through the shared map loader', () => {
    expect(loadMapById('MAP_ROUTE22')?.id).toBe('MAP_ROUTE22');
  });

  test('loads Pallet Town and Route 21 North through the shared map loader', () => {
    expect(loadMapById('MAP_PALLET_TOWN')?.id).toBe('MAP_PALLET_TOWN');
    expect(loadMapById('MAP_ROUTE21_NORTH')?.id).toBe('MAP_ROUTE21_NORTH');
    expect(loadMapById('MAP_ROUTE21_SOUTH')?.id).toBe('MAP_ROUTE21_SOUTH');
  });

  test('loads Pewter City through the shared map loader', () => {
    expect(loadMapById('MAP_PEWTER_CITY')?.id).toBe('MAP_PEWTER_CITY');
  });

  test('loads the Viridian Forest gatehouse maps through the shared map loader', () => {
    expect(loadMapById('MAP_ROUTE2_VIRIDIAN_FOREST_NORTH_ENTRANCE')?.id)
      .toBe('MAP_ROUTE2_VIRIDIAN_FOREST_NORTH_ENTRANCE');
    expect(loadMapById('MAP_ROUTE2_VIRIDIAN_FOREST_SOUTH_ENTRANCE')?.id)
      .toBe('MAP_ROUTE2_VIRIDIAN_FOREST_SOUTH_ENTRANCE');
  });
});
