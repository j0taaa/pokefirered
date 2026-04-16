import { describe, expect, test } from 'vitest';
import { resolveMapConnectionTransition } from '../src/game/mapConnections';
import { loadMapById, loadRoute2Map, loadRoute22Map, loadViridianCityMap } from '../src/world/mapSource';

describe('map connections', () => {
  test('matches Route 2 and Viridian City decomp connection offsets', () => {
    const route2 = loadRoute2Map();
    const route22 = loadRoute22Map();
    const viridianCity = loadViridianCityMap();

    expect(route2.connections).toEqual([
      { map: 'MAP_PEWTER_CITY', offset: -12, direction: 'up' },
      { map: 'MAP_VIRIDIAN_CITY', offset: -12, direction: 'down' }
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

  test('rejects coordinates outside the connected overlap', () => {
    expect(resolveMapConnectionTransition(loadViridianCityMap(), 10, 0, 'up', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute2Map(), 3, 79, 'down', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadViridianCityMap(), 0, 15, 'left', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute22Map(), 47, 5, 'right', loadMapById)).toBeNull();
  });

  test('returns null for unloaded destination maps', () => {
    expect(resolveMapConnectionTransition(loadRoute2Map(), 8, 0, 'up', loadMapById)).toBeNull();
  });

  test('loads Route 22 through the shared map loader', () => {
    expect(loadMapById('MAP_ROUTE22')?.id).toBe('MAP_ROUTE22');
  });
});
