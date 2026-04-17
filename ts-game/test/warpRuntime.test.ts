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
  loadIndigoPlateauExteriorMap,
  loadIndigoPlateauPokemonCenter1FMap,
  loadMapById,
  loadPalletTownMap,
  loadPalletTownProfessorOaksLabMap,
  loadPalletTownPlayersHouse1FMap,
  loadPalletTownPlayersHouse2FMap,
  loadPalletTownRivalsHouseMap,
  loadViridianCityMap,
  loadViridianCityMartMap,
  loadViridianCityPokemonCenter1FMap,
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
});
