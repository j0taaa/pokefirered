import { describe, expect, test } from 'vitest';
import { resolveMapConnectionTransition } from '../src/game/mapConnections';
import {
  loadMapById,
  loadCeladonCityMap,
  loadCeruleanCityMap,
  loadLavenderTownMap,
  loadPalletTownMap,
  loadPewterCityMap,
  loadRoute2Map,
  loadRoute21NorthMap,
  loadRoute21SouthMap,
  loadRoute22Map,
  loadRoute24Map,
  loadRoute25Map,
  loadRoute5Map,
  loadRoute6Map,
  loadRoute7Map,
  loadRoute8Map,
  loadRoute9Map,
  loadRoute10Map,
  loadRockTunnel1FMap,
  loadRockTunnelB1FMap,
  loadVermilionCityMap,
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
    expect(resolveMapConnectionTransition(loadVermilionCityMap(), 47, 16, 'right', loadMapById)).toBeNull();
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

  test('matches Cerulean City, Route 24, and Route 25 decomp connection offsets', () => {
    const cerulean = loadCeruleanCityMap();
    const route24 = loadRoute24Map();
    const route25 = loadRoute25Map();

    expect(cerulean.connections).toEqual([
      { map: 'MAP_ROUTE24', offset: 12, direction: 'up' },
      { map: 'MAP_ROUTE5', offset: 0, direction: 'down' },
      { map: 'MAP_ROUTE4', offset: 10, direction: 'left' },
      { map: 'MAP_ROUTE9', offset: 10, direction: 'right' }
    ]);
    expect(route24.connections).toEqual([
      { map: 'MAP_CERULEAN_CITY', offset: -12, direction: 'down' },
      { map: 'MAP_ROUTE25', offset: 0, direction: 'right' }
    ]);
    expect(route25.connections).toEqual([
      { map: 'MAP_ROUTE24', offset: 0, direction: 'left' }
    ]);
  });

  test('transitions from Cerulean City north edge into Route 24 using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadCeruleanCityMap(), 20, 0, 'up', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE24');
    expect(transition?.playerPosition).toEqual({ x: 8 * 16, y: 39 * 16 });
  });

  test('transitions from Route 24 south edge into Cerulean City using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute24Map(), 8, 39, 'down', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_CERULEAN_CITY');
    expect(transition?.playerPosition).toEqual({ x: 20 * 16, y: 0 });
  });

  test('transitions from Route 24 east edge into Route 25 using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute24Map(), 23, 5, 'right', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE25');
    expect(transition?.playerPosition).toEqual({ x: 0, y: 5 * 16 });
  });

  test('transitions from Route 25 west edge into Route 24 using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute25Map(), 0, 5, 'left', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE24');
    expect(transition?.playerPosition).toEqual({ x: 23 * 16, y: 5 * 16 });
  });

  test('rejects Route 24/25 coordinates outside the connected overlap', () => {
    expect(resolveMapConnectionTransition(loadCeruleanCityMap(), 11, 0, 'up', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadCeruleanCityMap(), 36, 0, 'up', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute24Map(), 0, 39, 'down', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute24Map(), 23, 6, 'right', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute25Map(), 0, 6, 'left', loadMapById)).toBeNull();
  });

  test('loads Route 24 and Route 25 through the shared map loader', () => {
    expect(loadMapById('MAP_ROUTE24')?.id).toBe('MAP_ROUTE24');
    expect(loadMapById('MAP_ROUTE25')?.id).toBe('MAP_ROUTE25');
  });

  test('matches Route 5/6/7/8/9/10 decomp connection offsets', () => {
    const celadon = loadCeladonCityMap();
    const route5 = loadRoute5Map();
    const route6 = loadRoute6Map();
    const route7 = loadRoute7Map();
    const route8 = loadRoute8Map();
    const route9 = loadRoute9Map();
    const route10 = loadRoute10Map();

    expect(celadon.connections).toEqual([
      { map: 'MAP_ROUTE16', offset: 10, direction: 'left' },
      { map: 'MAP_ROUTE7', offset: 10, direction: 'right' }
    ]);
    expect(route5.connections).toEqual([
      { map: 'MAP_CERULEAN_CITY', offset: 0, direction: 'up' },
      { map: 'MAP_SAFFRON_CITY_CONNECTION', offset: 0, direction: 'down' }
    ]);
    expect(route6.connections).toEqual([
      { map: 'MAP_SAFFRON_CITY_CONNECTION', offset: 0, direction: 'up' },
      { map: 'MAP_VERMILION_CITY', offset: -12, direction: 'down' }
    ]);
    expect(route7.connections).toEqual([
      { map: 'MAP_CELADON_CITY', offset: -10, direction: 'left' },
      { map: 'MAP_SAFFRON_CITY_CONNECTION', offset: -10, direction: 'right' }
    ]);
    expect(route8.connections).toEqual([
      { map: 'MAP_SAFFRON_CITY_CONNECTION', offset: -10, direction: 'left' },
      { map: 'MAP_LAVENDER_TOWN', offset: 0, direction: 'right' }
    ]);
    expect(route9.connections).toEqual([
      { map: 'MAP_CERULEAN_CITY', offset: -10, direction: 'left' },
      { map: 'MAP_ROUTE10', offset: 0, direction: 'right' }
    ]);
    expect(route10.connections).toEqual([
      { map: 'MAP_LAVENDER_TOWN', offset: 0, direction: 'down' },
      { map: 'MAP_ROUTE9', offset: 0, direction: 'left' }
    ]);
  });

  test('transitions from Cerulean City south edge into Route 5 using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadCeruleanCityMap(), 15, 39, 'down', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE5');
    expect(transition?.playerPosition).toEqual({ x: 15 * 16, y: 0 });
  });

  test('transitions from Route 5 north edge into Cerulean City using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute5Map(), 15, 0, 'up', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_CERULEAN_CITY');
    expect(transition?.playerPosition).toEqual({ x: 15 * 16, y: 39 * 16 });
  });

  test('transitions from Cerulean City east edge into Route 9 using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadCeruleanCityMap(), 47, 16, 'right', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE9');
    expect(transition?.playerPosition).toEqual({ x: 0, y: 6 * 16 });
  });

  test('transitions from Route 9 west edge into Cerulean City using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute9Map(), 0, 6, 'left', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_CERULEAN_CITY');
    expect(transition?.playerPosition).toEqual({ x: 47 * 16, y: 16 * 16 });
  });

  test('transitions from Route 9 east edge into Route 10 using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute9Map(), 71, 8, 'right', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE10');
    expect(transition?.playerPosition).toEqual({ x: 0, y: 8 * 16 });
  });

  test('transitions from Route 7 west edge into Celadon City using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute7Map(), 0, 2, 'left', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_CELADON_CITY');
    expect(transition?.playerPosition).toEqual({ x: 59 * 16, y: 12 * 16 });
  });

  test('transitions from Celadon City east edge into Route 7 using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadCeladonCityMap(), 59, 12, 'right', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE7');
    expect(transition?.playerPosition).toEqual({ x: 0, y: 2 * 16 });
  });

  test('transitions from Route 10 west edge into Route 9 using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute10Map(), 0, 8, 'left', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE9');
    expect(transition?.playerPosition).toEqual({ x: 71 * 16, y: 8 * 16 });
  });

  test('rejects Route 9/10 coordinates outside the connected overlap', () => {
    expect(resolveMapConnectionTransition(loadCeladonCityMap(), 59, 9, 'right', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadCeladonCityMap(), 59, 30, 'right', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadCeruleanCityMap(), 47, 30, 'right', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute9Map(), 0, 2, 'left', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute9Map(), 71, 0, 'right', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute10Map(), 0, 20, 'left', loadMapById)).toBeNull();
  });

  test('loads Route 5/6/7/8/9/10 through the shared map loader', () => {
    expect(loadMapById('MAP_CELADON_CITY')?.id).toBe('MAP_CELADON_CITY');
    expect(loadMapById('MAP_ROUTE5')?.id).toBe('MAP_ROUTE5');
    expect(loadMapById('MAP_ROUTE6')?.id).toBe('MAP_ROUTE6');
    expect(loadMapById('MAP_ROUTE7')?.id).toBe('MAP_ROUTE7');
    expect(loadMapById('MAP_ROUTE8')?.id).toBe('MAP_ROUTE8');
    expect(loadMapById('MAP_ROUTE9')?.id).toBe('MAP_ROUTE9');
    expect(loadMapById('MAP_ROUTE10')?.id).toBe('MAP_ROUTE10');
  });

  test('loads Rock Tunnel 1F and B1F through the shared map loader', () => {
    expect(loadRockTunnel1FMap().id).toBe('MAP_ROCK_TUNNEL_1F');
    expect(loadRockTunnelB1FMap().id).toBe('MAP_ROCK_TUNNEL_B1F');
    expect(loadMapById('MAP_ROCK_TUNNEL_1F')?.id).toBe('MAP_ROCK_TUNNEL_1F');
    expect(loadMapById('MAP_ROCK_TUNNEL_B1F')?.id).toBe('MAP_ROCK_TUNNEL_B1F');
  });

  test('matches Vermilion City decomp connection offsets', () => {
    const vermilion = loadVermilionCityMap();

    expect(vermilion.connections).toEqual([
      { map: 'MAP_ROUTE6', offset: 12, direction: 'up' },
      { map: 'MAP_ROUTE11', offset: 10, direction: 'right' }
    ]);
  });

  test('transitions from Route 6 south edge into Vermilion City using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute6Map(), 12, 39, 'down', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_VERMILION_CITY');
    expect(transition?.playerPosition).toEqual({ x: 24 * 16, y: 0 });
  });

  test('transitions from Vermilion City north edge into Route 6 using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadVermilionCityMap(), 24, 0, 'up', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE6');
    expect(transition?.playerPosition).toEqual({ x: 12 * 16, y: 39 * 16 });
  });

  test('rejects Vermilion City / Route 6 coordinates outside the connected overlap', () => {
    expect(resolveMapConnectionTransition(loadVermilionCityMap(), 11, 0, 'up', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadVermilionCityMap(), 36, 0, 'up', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute6Map(), 9, 39, 'down', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute6Map(), 13, 39, 'down', loadMapById)).toBeNull();
  });

  test('loads Vermilion City through the shared map loader', () => {
    expect(loadMapById('MAP_VERMILION_CITY')?.id).toBe('MAP_VERMILION_CITY');
  });

  test('matches Lavender Town decomp connection offsets', () => {
    const lavender = loadLavenderTownMap();

    expect(lavender.connections).toEqual([
      { map: 'MAP_ROUTE10', offset: 0, direction: 'up' },
      { map: 'MAP_ROUTE12', offset: 0, direction: 'down' },
      { map: 'MAP_ROUTE8', offset: 0, direction: 'left' }
    ]);
  });

  test('transitions from Route 8 east edge into Lavender Town using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute8Map(), 71, 9, 'right', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_LAVENDER_TOWN');
    expect(transition?.playerPosition).toEqual({ x: 0, y: 9 * 16 });
  });

  test('transitions from Lavender Town west edge into Route 8 using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadLavenderTownMap(), 0, 9, 'left', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE8');
    expect(transition?.playerPosition).toEqual({ x: 71 * 16, y: 9 * 16 });
  });

  test('transitions from Route 10 south edge into Lavender Town using the decomp offset', () => {
    const transition = resolveMapConnectionTransition(loadRoute10Map(), 11, 79, 'down', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_LAVENDER_TOWN');
    expect(transition?.playerPosition).toEqual({ x: 11 * 16, y: 0 });
  });

  test('transitions from Lavender Town north edge into Route 10 using the reciprocal offset', () => {
    const transition = resolveMapConnectionTransition(loadLavenderTownMap(), 11, 0, 'up', loadMapById);

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ROUTE10');
    expect(transition?.playerPosition).toEqual({ x: 11 * 16, y: 79 * 16 });
  });

  test('rejects Lavender Town coordinates outside the connected overlap', () => {
    expect(resolveMapConnectionTransition(loadRoute8Map(), 71, 8, 'right', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadLavenderTownMap(), 0, 8, 'left', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadRoute10Map(), 7, 79, 'down', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadLavenderTownMap(), 7, 0, 'up', loadMapById)).toBeNull();
  });

  test('loads Lavender Town through the shared map loader', () => {
    expect(loadMapById('MAP_LAVENDER_TOWN')?.id).toBe('MAP_LAVENDER_TOWN');
  });

  test('returns null for Celadon City left edge because Route 16 is still unloaded', () => {
    expect(resolveMapConnectionTransition(loadCeladonCityMap(), 0, 10, 'left', loadMapById)).toBeNull();
  });
});
