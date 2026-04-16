import { describe, expect, test } from 'vitest';
import { resolveMapConnectionTransition } from '../src/game/mapConnections';
import { loadMapById, loadRoute2Map, loadViridianCityMap } from '../src/world/mapSource';

describe('map connections', () => {
  test('matches Route 2 and Viridian City decomp connection offsets', () => {
    const route2 = loadRoute2Map();
    const viridianCity = loadViridianCityMap();

    expect(route2.connections).toEqual([
      { map: 'MAP_PEWTER_CITY', offset: -12, direction: 'up' },
      { map: 'MAP_VIRIDIAN_CITY', offset: -12, direction: 'down' }
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

  test('rejects coordinates outside the connected overlap', () => {
    expect(resolveMapConnectionTransition(loadViridianCityMap(), 10, 0, 'up', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute2Map(), 3, 79, 'down', loadMapById)).toBeNull();
  });

  test('returns null for unloaded destination maps', () => {
    expect(resolveMapConnectionTransition(loadRoute2Map(), 8, 0, 'up', loadMapById)).toBeNull();
  });
});
