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
