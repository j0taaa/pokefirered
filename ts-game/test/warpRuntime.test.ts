import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import { createPlayer } from '../src/game/player';
import {
  findWarpAtTile,
  isArrowWarpMetatileBehavior,
  isWarpMetatileBehavior,
  resolveWarpTransition
} from '../src/game/warps';
import {
  loadCeruleanCityMap,
  loadCeruleanCityPokemonCenter1FMap,
  loadCeruleanCityPokemonCenter2FMap,
  loadIndigoPlateauExteriorMap,
  loadIndigoPlateauPokemonCenter1FMap,
  loadMapById,
  loadPalletTownMap,
  loadPalletTownProfessorOaksLabMap,
  loadPalletTownPlayersHouse1FMap,
  loadPalletTownPlayersHouse2FMap,
  loadPalletTownRivalsHouseMap,
  loadPewterCityGymMap,
  loadPewterCityHouse1Map,
  loadPewterCityHouse2Map,
  loadPewterCityMap,
  loadPewterCityMartMap,
  loadPewterCityMuseum1FMap,
  loadPewterCityMuseum2FMap,
  loadPewterCityPokemonCenter1FMap,
  loadPewterCityPokemonCenter2FMap,
  loadVermilionCityGymMap,
  loadVermilionCityHouse1Map,
  loadVermilionCityHouse2Map,
  loadVermilionCityHouse3Map,
  loadVermilionCityMap,
  loadVermilionCityMartMap,
  loadVermilionCityPokemonCenter1FMap,
  loadVermilionCityPokemonCenter2FMap,
  loadVermilionCityPokemonFanClubMap,
  loadViridianCityGymMap,
  loadViridianCityHouseMap,
  loadViridianCityMap,
  loadViridianCityMartMap,
  loadViridianCityPokemonCenter1FMap,
  loadViridianCitySchoolMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import type { TileMap } from '../src/world/tileMap';
import indigoPlateauExteriorMapJson from '../src/world/maps/indigoPlateauExterior.json';

const createTestMap = (overrides: Partial<TileMap> = {}): TileMap => ({
  id: 'MAP_TEST',
  width: 4,
  height: 4,
  tileSize: 16,
  walkable: new Array(16).fill(true),
  tileBehaviors: new Array(16).fill(0),
  connections: [],
  triggers: [],
  npcs: [],
  hiddenItems: [],
  warps: [],
  ...overrides
});

describe('warp runtime', () => {
  test('parses compact behavior rows into tile behaviors', () => {
    const map = mapFromCompactSource(parseCompactMapSource(indigoPlateauExteriorMapJson));

    expect(map.tileBehaviors).toBeDefined();
    expect(map.tileBehaviors).toHaveLength(map.width * map.height);
    expect(map.tileBehaviors?.[6 * map.width + 11]).toBe(0x69);
  });

  test('rejects malformed compact behavior rows', () => {
    const base = indigoPlateauExteriorMapJson as CompactMapSource;

    expect(() => parseCompactMapSource({
      ...base,
      behaviorRows: ['69'.repeat(base.width - 1), ...(base.behaviorRows ?? []).slice(1)]
    })).toThrow(/behaviorRows/i);
  });

  test('matches decomp warp-door and arrow-warp behavior checks', () => {
    expect(isWarpMetatileBehavior(0x69)).toBe(true);
    expect(isWarpMetatileBehavior(0x67)).toBe(true);
    expect(isWarpMetatileBehavior(0x00)).toBe(false);
    expect(isArrowWarpMetatileBehavior(0x64, 'up')).toBe(true);
    expect(isArrowWarpMetatileBehavior(0x64, 'down')).toBe(false);
  });

  test('matches GetWarpEventAtPosition elevation wildcard semantics', () => {
    const map = createTestMap({
      warps: [{ x: 1, y: 2, elevation: 0, destMap: 'MAP_DEST', destWarpId: 0 }]
    });

    expect(findWarpAtTile(map, 1, 2, 3)).toEqual(map.warps[0]);
    expect(findWarpAtTile(map, 1, 2, 0)).toEqual(map.warps[0]);
    expect(findWarpAtTile(map, 0, 2, 3)).toBeNull();
  });

  test('resolves Indigo Plateau exterior door warp into the loaded Pokemon Center', () => {
    const map = loadIndigoPlateauExteriorMap();
    const player = createPlayer();
    player.position = vec2(11 * map.tileSize, 6 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 11, y: 6, elevation: 0, destMap: 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F', destWarpId: 0 },
      destinationMap: loadIndigoPlateauPokemonCenter1FMap(),
      destinationWarp: { x: 11, y: 16, elevation: 3, destMap: 'MAP_INDIGO_PLATEAU_EXTERIOR', destWarpId: 0 },
      playerPosition: { x: 11 * 16, y: 16 * 16 }
    });
  });

  test('resolves Indigo Plateau center exit back to the loaded exterior map', () => {
    const map = loadIndigoPlateauPokemonCenter1FMap();
    const player = createPlayer();
    player.position = vec2(11 * map.tileSize, 16 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 11, y: 16, elevation: 3, destMap: 'MAP_INDIGO_PLATEAU_EXTERIOR', destWarpId: 0 },
      destinationMap: loadIndigoPlateauExteriorMap(),
      destinationWarp: { x: 11, y: 6, elevation: 0, destMap: 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F', destWarpId: 0 },
      playerPosition: { x: 11 * 16, y: 6 * 16 }
    });
  });

  test('resolves the Viridian City Pokemon Center door warp into the loaded center map', () => {
    const map = loadViridianCityMap();
    const player = createPlayer();
    player.position = vec2(26 * map.tileSize, 26 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 26, y: 26, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_POKEMON_CENTER_1F', destWarpId: 1 },
      destinationMap: loadViridianCityPokemonCenter1FMap(),
      destinationWarp: { x: 7, y: 8, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 0 },
      playerPosition: { x: 7 * 16, y: 8 * 16 }
    });
  });

  test('resolves the Viridian City Pokemon Center exit warp back to loaded Viridian City', () => {
    const map = loadViridianCityPokemonCenter1FMap();
    const player = createPlayer();
    player.position = vec2(7 * map.tileSize, 8 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 7, y: 8, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 0 },
      destinationMap: loadViridianCityMap(),
      destinationWarp: { x: 26, y: 26, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_POKEMON_CENTER_1F', destWarpId: 1 },
      playerPosition: { x: 26 * 16, y: 26 * 16 }
    });
  });

  test('resolves the Viridian City Mart door warp into the loaded mart map', () => {
    const map = loadViridianCityMap();
    const player = createPlayer();
    player.position = vec2(36 * map.tileSize, 19 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 36, y: 19, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_MART', destWarpId: 1 },
      destinationMap: loadViridianCityMartMap(),
      destinationWarp: { x: 4, y: 7, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 4 },
      playerPosition: { x: 4 * 16, y: 7 * 16 }
    });
  });

  test('resolves the Viridian City Mart exit warp back to loaded Viridian City', () => {
    const map = loadViridianCityMartMap();
    const player = createPlayer();
    player.position = vec2(4 * map.tileSize, 7 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 4, y: 7, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 4 },
      destinationMap: loadViridianCityMap(),
      destinationWarp: { x: 36, y: 19, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_MART', destWarpId: 1 },
      playerPosition: { x: 36 * 16, y: 19 * 16 }
    });
  });

  test('resolves the Viridian City School door warp into the loaded school map', () => {
    const map = loadViridianCityMap();
    const player = createPlayer();
    player.position = vec2(25 * map.tileSize, 18 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 25, y: 18, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_SCHOOL', destWarpId: 1 },
      destinationMap: loadViridianCitySchoolMap(),
      destinationWarp: { x: 4, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 3 },
      playerPosition: { x: 4 * 16, y: 7 * 16 }
    });
  });

  test('resolves the Viridian City School exit warp back to loaded Viridian City', () => {
    const map = loadViridianCitySchoolMap();
    const player = createPlayer();
    player.position = vec2(4 * map.tileSize, 7 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 4, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 3 },
      destinationMap: loadViridianCityMap(),
      destinationWarp: { x: 25, y: 18, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_SCHOOL', destWarpId: 1 },
      playerPosition: { x: 25 * 16, y: 18 * 16 }
    });
  });

  test('resolves the Viridian City House door warp into the loaded house map', () => {
    const map = loadViridianCityMap();
    const player = createPlayer();
    player.position = vec2(25 * map.tileSize, 11 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 25, y: 11, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY_HOUSE', destWarpId: 1 },
      destinationMap: loadViridianCityHouseMap(),
      destinationWarp: { x: 4, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 1 },
      playerPosition: { x: 4 * 16, y: 7 * 16 }
    });
  });

  test('resolves the Viridian City House exit warp back to loaded Viridian City', () => {
    const map = loadViridianCityHouseMap();
    const player = createPlayer();
    player.position = vec2(4 * map.tileSize, 7 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 4, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 1 },
      destinationMap: loadViridianCityMap(),
      destinationWarp: { x: 25, y: 11, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY_HOUSE', destWarpId: 1 },
      playerPosition: { x: 25 * 16, y: 11 * 16 }
    });
  });

  test('resolves the Pallet Town front door warp into the loaded Players House 1F', () => {
    const map = loadPalletTownMap();
    const player = createPlayer();
    player.position = vec2(6 * map.tileSize, 7 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 6, y: 7, elevation: 0, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F', destWarpId: 1 },
      destinationMap: loadPalletTownPlayersHouse1FMap(),
      destinationWarp: { x: 4, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 0 },
      playerPosition: { x: 4 * 16, y: 8 * 16 }
    });
  });

  test('resolves the Pallet Town rival house front door warp into the loaded interior map', () => {
    const map = loadPalletTownMap();
    const player = createPlayer();
    player.position = vec2(15 * map.tileSize, 7 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 15, y: 7, elevation: 0, destMap: 'MAP_PALLET_TOWN_RIVALS_HOUSE', destWarpId: 0 },
      destinationMap: loadPalletTownRivalsHouseMap(),
      destinationWarp: { x: 4, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 1 },
      playerPosition: { x: 4 * 16, y: 8 * 16 }
    });
  });

  test("resolves the Pallet Town Oak's Lab front door warp into the loaded interior map", () => {
    const map = loadPalletTownMap();
    const player = createPlayer();
    player.position = vec2(16 * map.tileSize, 13 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 16, y: 13, elevation: 0, destMap: 'MAP_PALLET_TOWN_PROFESSOR_OAKS_LAB', destWarpId: 0 },
      destinationMap: loadPalletTownProfessorOaksLabMap(),
      destinationWarp: { x: 6, y: 12, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 2 },
      playerPosition: { x: 6 * 16, y: 12 * 16 }
    });
  });

  test('resolves the Players House 1F stair warp into the loaded 2F map', () => {
    const map = loadPalletTownPlayersHouse1FMap();
    const player = createPlayer();
    player.position = vec2(10 * map.tileSize, 2 * map.tileSize);
    player.facing = 'right';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 10, y: 2, elevation: 3, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_2F', destWarpId: 0 },
      destinationMap: loadPalletTownPlayersHouse2FMap(),
      destinationWarp: { x: 10, y: 2, elevation: 3, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F', destWarpId: 2 },
      playerPosition: { x: 10 * 16, y: 2 * 16 }
    });
  });

  test('resolves the Players House 2F stair warp back to the loaded 1F map', () => {
    const map = loadPalletTownPlayersHouse2FMap();
    const player = createPlayer();
    player.position = vec2(10 * map.tileSize, 2 * map.tileSize);
    player.facing = 'left';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 10, y: 2, elevation: 3, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F', destWarpId: 2 },
      destinationMap: loadPalletTownPlayersHouse1FMap(),
      destinationWarp: { x: 10, y: 2, elevation: 3, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_2F', destWarpId: 0 },
      playerPosition: { x: 10 * 16, y: 2 * 16 }
    });
  });

  test('resolves the Players House 1F exit warp back to loaded Pallet Town', () => {
    const map = loadPalletTownPlayersHouse1FMap();
    const player = createPlayer();
    player.position = vec2(4 * map.tileSize, 8 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 4, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 0 },
      destinationMap: loadPalletTownMap(),
      destinationWarp: { x: 6, y: 7, elevation: 0, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F', destWarpId: 1 },
      playerPosition: { x: 6 * 16, y: 7 * 16 }
    });
  });

  test('resolves the rival house exit warp back to loaded Pallet Town', () => {
    const map = loadPalletTownRivalsHouseMap();
    const player = createPlayer();
    player.position = vec2(4 * map.tileSize, 8 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 4, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 1 },
      destinationMap: loadPalletTownMap(),
      destinationWarp: { x: 15, y: 7, elevation: 0, destMap: 'MAP_PALLET_TOWN_RIVALS_HOUSE', destWarpId: 0 },
      playerPosition: { x: 15 * 16, y: 7 * 16 }
    });
  });

  test("resolves Oak's Lab exit warp back to loaded Pallet Town", () => {
    const map = loadPalletTownProfessorOaksLabMap();
    const player = createPlayer();
    player.position = vec2(6 * map.tileSize, 12 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 6, y: 12, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 2 },
      destinationMap: loadPalletTownMap(),
      destinationWarp: { x: 16, y: 13, elevation: 0, destMap: 'MAP_PALLET_TOWN_PROFESSOR_OAKS_LAB', destWarpId: 0 },
      playerPosition: { x: 16 * 16, y: 13 * 16 }
    });
  });

  test('reports unloaded destination maps for activatable building warps', () => {
    const map = createTestMap({
      tileBehaviors: [
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x69, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00
      ],
      warps: [{ x: 1, y: 1, elevation: 0, destMap: 'MAP_UNLOADED', destWarpId: 0 }]
    });
    const player = createPlayer();
    player.position = vec2(16, 16);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'unloaded_map',
      sourceWarp: map.warps[0]
    });
  });

  test('reports invalid destination warp ids on loaded maps', () => {
    const map = createTestMap({
      tileBehaviors: [
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x69, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00
      ],
      warps: [{ x: 1, y: 1, elevation: 0, destMap: 'MAP_INDIGO_PLATEAU_EXTERIOR', destWarpId: 9 }]
    });
    const player = createPlayer();
    player.position = vec2(16, 16);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'invalid_warp_id',
      sourceWarp: map.warps[0],
      destinationMap: loadIndigoPlateauExteriorMap()
    });
  });

  test('does not activate warp events on non-warp metatile behaviors', () => {
    const map = createTestMap({
      tileBehaviors: [
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x84, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00
      ],
      warps: [{ x: 1, y: 1, elevation: 0, destMap: 'MAP_INDIGO_PLATEAU_EXTERIOR', destWarpId: 0 }]
    });
    const player = createPlayer();
    player.position = vec2(16, 16);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'not_activatable',
      sourceWarp: map.warps[0]
    });
  });

  test('resolves the Viridian City gym door warp into the loaded gym map', () => {
    const map = loadViridianCityMap();
    const player = createPlayer();
    player.position = vec2(36 * map.tileSize, 10 * map.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(map, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const gymMap = loadViridianCityGymMap();
    expect(result.sourceWarp).toEqual({ x: 36, y: 10, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_GYM', destWarpId: 1 });
    expect(result.destinationMap!.id).toBe(gymMap.id);
    expect(result.destinationWarp).toEqual(gymMap.warps[1]);
    expect(result.playerPosition).toEqual({ x: 17 * 16, y: 22 * 16 });
  });

  test('resolves the Viridian City Gym exit warp back to loaded Viridian City', () => {
    const map = loadViridianCityGymMap();
    const player = createPlayer();
    player.position = vec2(17 * map.tileSize, 22 * map.tileSize);
    player.facing = 'down';

    const result = resolveWarpTransition(map, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const viridianMap = loadViridianCityMap();
    expect(result.sourceWarp).toEqual({ x: 17, y: 22, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 2 });
    expect(result.destinationMap!.id).toBe(viridianMap.id);
    expect(result.destinationWarp).toEqual(viridianMap.warps[2]);
    expect(result.playerPosition).toEqual({ x: 36 * 16, y: 10 * 16 });
  });

  test('resolves Pewter City Gym door warp into the loaded gym map', () => {
    const pewterMap = loadPewterCityMap();
    const player = createPlayer();
    player.position = vec2(15 * pewterMap.tileSize, 16 * pewterMap.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(pewterMap, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const gymMap = loadPewterCityGymMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_GYM', destWarpId: 1 });
    expect(result.destinationMap!.id).toBe(gymMap.id);
    expect(result.destinationWarp).toEqual(gymMap.warps[1]);
  });

  test('resolves Pewter City Gym exit warp back to Pewter City', () => {
    const gymMap = loadPewterCityGymMap();
    const player = createPlayer();
    player.position = vec2(6 * gymMap.tileSize, 14 * gymMap.tileSize);
    player.facing = 'down';

    const result = resolveWarpTransition(gymMap, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const pewterMap = loadPewterCityMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY', destWarpId: 2 });
    expect(result.destinationMap!.id).toBe(pewterMap.id);
    expect(result.destinationWarp).toEqual(pewterMap.warps[2]);
  });

  test('resolves Pewter City Mart door warp into the loaded mart map', () => {
    const pewterMap = loadPewterCityMap();
    const player = createPlayer();
    player.position = vec2(28 * pewterMap.tileSize, 18 * pewterMap.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(pewterMap, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const martMap = loadPewterCityMartMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_MART', destWarpId: 1 });
    expect(result.destinationMap!.id).toBe(martMap.id);
  });

  test('resolves Pewter City Pokemon Center door warp into the loaded center', () => {
    const pewterMap = loadPewterCityMap();
    const player = createPlayer();
    player.position = vec2(17 * pewterMap.tileSize, 25 * pewterMap.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(pewterMap, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const centerMap = loadPewterCityPokemonCenter1FMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_POKEMON_CENTER_1F', destWarpId: 1 });
    expect(result.destinationMap!.id).toBe(centerMap.id);
  });

  test('resolves Pewter City Museum 1F to 2F stair warp', () => {
    const museum1F = loadPewterCityMuseum1FMap();
    const player = createPlayer();
    player.position = vec2(8 * museum1F.tileSize, 8 * museum1F.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(museum1F, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const museum2F = loadPewterCityMuseum2FMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_MUSEUM_2F', destWarpId: 0 });
    expect(result.destinationMap!.id).toBe(museum2F.id);
  });

  test('resolves Pewter City Museum 2F to 1F stair warp', () => {
    const museum2F = loadPewterCityMuseum2FMap();
    const player = createPlayer();
    player.position = vec2(11 * museum2F.tileSize, 8 * museum2F.tileSize);
    player.facing = 'down';

    const result = resolveWarpTransition(museum2F, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const museum1F = loadPewterCityMuseum1FMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_MUSEUM_1F', destWarpId: 5 });
    expect(result.destinationMap!.id).toBe(museum1F.id);
  });

  test('resolves Pewter City House1 door warp', () => {
    const pewterMap = loadPewterCityMap();
    const player = createPlayer();
    player.position = vec2(33 * pewterMap.tileSize, 11 * pewterMap.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(pewterMap, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const house1 = loadPewterCityHouse1Map();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_HOUSE1', destWarpId: 1 });
    expect(result.destinationMap!.id).toBe(house1.id);
  });

  test('resolves Pewter City House2 door warp', () => {
    const pewterMap = loadPewterCityMap();
    const player = createPlayer();
    player.position = vec2(9 * pewterMap.tileSize, 30 * pewterMap.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(pewterMap, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const house2 = loadPewterCityHouse2Map();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_HOUSE2', destWarpId: 1 });
    expect(result.destinationMap!.id).toBe(house2.id);
  });

  test('resolves Pewter Center 1F to 2F stair warp', () => {
    const center1F = loadPewterCityPokemonCenter1FMap();
    const player = createPlayer();
    player.position = vec2(1 * center1F.tileSize, 6 * center1F.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(center1F, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const center2F = loadPewterCityPokemonCenter2FMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_POKEMON_CENTER_2F', destWarpId: 0 });
    expect(result.destinationMap!.id).toBe(center2F.id);
  });

  test('resolves Pewter Center 2F to 1F stair warp', () => {
    const center2F = loadPewterCityPokemonCenter2FMap();
    const player = createPlayer();
    player.position = vec2(1 * center2F.tileSize, 6 * center2F.tileSize);
    player.facing = 'down';

    const result = resolveWarpTransition(center2F, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const center1F = loadPewterCityPokemonCenter1FMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_POKEMON_CENTER_1F', destWarpId: 3 });
    expect(result.destinationMap!.id).toBe(center1F.id);
  });

  test('resolves Cerulean City door warps into the loaded interiors', () => {
    const cityMap = loadCeruleanCityMap();
    const destinations = [
      'MAP_CERULEAN_CITY_HOUSE1',
      'MAP_CERULEAN_CITY_HOUSE2',
      'MAP_CERULEAN_CITY_HOUSE3',
      'MAP_CERULEAN_CITY_POKEMON_CENTER_1F',
      'MAP_CERULEAN_CITY_GYM',
      'MAP_CERULEAN_CITY_BIKE_SHOP',
      'MAP_CERULEAN_CITY_MART',
      'MAP_CERULEAN_CITY_HOUSE4',
      'MAP_CERULEAN_CITY_HOUSE5'
    ];

    for (const destMap of destinations) {
      const warp = cityMap.warps.find((candidate) => candidate.destMap === destMap);
      expect(warp).toBeDefined();
      if (!warp) continue;

      const player = createPlayer();
      player.position = vec2(warp.x * cityMap.tileSize, warp.y * cityMap.tileSize);
      player.facing = 'up';

      const result = resolveWarpTransition(cityMap, player, loadMapById);
      expect(result.status).toBe('resolved');
      if (result.status !== 'resolved') continue;
      expect(result.sourceWarp).toEqual(warp);
      expect(result.destinationMap!.id).toBe(destMap);
      expect(result.destinationWarp).toEqual(result.destinationMap!.warps[warp.destWarpId]);
    }
  });

  test('resolves Cerulean Pokemon Center stairs between 1F and 2F', () => {
    const center1F = loadCeruleanCityPokemonCenter1FMap();
    const player = createPlayer();
    player.position = vec2(1 * center1F.tileSize, 6 * center1F.tileSize);
    player.facing = 'up';

    const upstairs = resolveWarpTransition(center1F, player, loadMapById);
    expect(upstairs.status).toBe('resolved');
    if (upstairs.status !== 'resolved') return;

    const center2F = loadCeruleanCityPokemonCenter2FMap();
    expect(upstairs.sourceWarp).toMatchObject({ destMap: 'MAP_CERULEAN_CITY_POKEMON_CENTER_2F', destWarpId: 0 });
    expect(upstairs.destinationMap!.id).toBe(center2F.id);

    player.position = vec2(1 * center2F.tileSize, 6 * center2F.tileSize);
    player.facing = 'down';

    const downstairs = resolveWarpTransition(center2F, player, loadMapById);
    expect(downstairs.status).toBe('resolved');
    if (downstairs.status !== 'resolved') return;
    expect(downstairs.sourceWarp).toMatchObject({ destMap: 'MAP_CERULEAN_CITY_POKEMON_CENTER_1F', destWarpId: 3 });
    expect(downstairs.destinationMap!.id).toBe(center1F.id);
  });

  test('resolves Vermilion City door warps into the loaded interiors', () => {
    const cityMap = loadVermilionCityMap();
    const destinations = [
      'MAP_VERMILION_CITY_HOUSE1',
      'MAP_VERMILION_CITY_POKEMON_CENTER_1F',
      'MAP_VERMILION_CITY_POKEMON_FAN_CLUB',
      'MAP_VERMILION_CITY_HOUSE2',
      'MAP_VERMILION_CITY_MART',
      'MAP_VERMILION_CITY_HOUSE3',
      'MAP_VERMILION_CITY_GYM'
    ];

    for (const destMap of destinations) {
      const warp = cityMap.warps.find((candidate) => candidate.destMap === destMap);
      expect(warp).toBeDefined();
      if (!warp) continue;

      const player = createPlayer();
      player.position = vec2(warp.x * cityMap.tileSize, warp.y * cityMap.tileSize);
      player.facing = 'up';

      const result = resolveWarpTransition(cityMap, player, loadMapById);
      expect(result.status).toBe('resolved');
      if (result.status !== 'resolved') continue;
      expect(result.sourceWarp).toEqual(warp);
      expect(result.destinationMap!.id).toBe(destMap);
      expect(result.destinationWarp).toEqual(result.destinationMap!.warps[warp.destWarpId]);
    }
  });

  test('resolves Vermilion Pokemon Center stairs between 1F and 2F', () => {
    const center1F = loadVermilionCityPokemonCenter1FMap();
    const player = createPlayer();
    player.position = vec2(1 * center1F.tileSize, 6 * center1F.tileSize);
    player.facing = 'up';

    const upstairs = resolveWarpTransition(center1F, player, loadMapById);
    expect(upstairs.status).toBe('resolved');
    if (upstairs.status !== 'resolved') return;

    const center2F = loadVermilionCityPokemonCenter2FMap();
    expect(upstairs.sourceWarp).toMatchObject({ destMap: 'MAP_VERMILION_CITY_POKEMON_CENTER_2F', destWarpId: 0 });
    expect(upstairs.destinationMap!.id).toBe(center2F.id);

    player.position = vec2(1 * center2F.tileSize, 6 * center2F.tileSize);
    player.facing = 'down';

    const downstairs = resolveWarpTransition(center2F, player, loadMapById);
    expect(downstairs.status).toBe('resolved');
    if (downstairs.status !== 'resolved') return;
    expect(downstairs.sourceWarp).toMatchObject({ destMap: 'MAP_VERMILION_CITY_POKEMON_CENTER_1F', destWarpId: 3 });
    expect(downstairs.destinationMap!.id).toBe(center1F.id);
  });

  test('resolves Vermilion Gym exit warps back to city', () => {
    const gym = loadVermilionCityGymMap();
    const player = createPlayer();
    const exitWarp = gym.warps[0];

    player.position = vec2(exitWarp.x * gym.tileSize, exitWarp.y * gym.tileSize);
    player.facing = 'down';

    const result = resolveWarpTransition(gym, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;
    expect(result.destinationMap!.id).toBe('MAP_VERMILION_CITY');
  });

  test('resolves Vermilion Fan Club exit warps back to city', () => {
    const fanClub = loadVermilionCityPokemonFanClubMap();
    const player = createPlayer();
    const exitWarp = fanClub.warps[0];

    player.position = vec2(exitWarp.x * fanClub.tileSize, exitWarp.y * fanClub.tileSize);
    player.facing = 'down';

    const result = resolveWarpTransition(fanClub, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;
    expect(result.destinationMap!.id).toBe('MAP_VERMILION_CITY');
  });

  test('resolves Vermilion House1/2/3 and Mart exit warps back to city', () => {
    const interiors = [
      loadVermilionCityHouse1Map,
      loadVermilionCityHouse2Map,
      loadVermilionCityHouse3Map,
      loadVermilionCityMartMap
    ];

    for (const load of interiors) {
      const map = load();
      const player = createPlayer();
      const exitWarp = map.warps[0];

      player.position = vec2(exitWarp.x * map.tileSize, exitWarp.y * map.tileSize);
      player.facing = 'down';

      const result = resolveWarpTransition(map, player, loadMapById);
      expect(result.status).toBe('resolved');
      if (result.status !== 'resolved') continue;
      expect(result.destinationMap!.id).toBe('MAP_VERMILION_CITY');
    }
  });
});
