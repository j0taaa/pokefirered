import { describe, expect, test } from 'vitest';
import { createPlayer } from '../src/game/player';
import {
  assertWarpTransitionResolved,
  resolveWarpTransition
} from '../src/game/warps';
import { exportedDecompMapIds } from '../src/world/mapRegistry';
import { loadMapById } from '../src/world/mapSource';
import type { TileMap } from '../src/world/tileMap';

const WARP_ID_DYNAMIC = 255;
const MAP_DYNAMIC = 'MAP_DYNAMIC';

const createTestMap = (overrides: Partial<TileMap> = {}): TileMap => ({
  id: 'MAP_TEST_SOURCE',
  width: 2,
  height: 2,
  tileSize: 16,
  walkable: new Array(4).fill(true),
  tileBehaviors: [0x67, 0, 0, 0],
  connections: [],
  triggers: [],
  npcs: [],
  hiddenItems: [],
  warps: [{ x: 0, y: 0, elevation: 0, destMap: 'MAP_MISSING_DESTINATION', destWarpId: 0 }],
  ...overrides
});

describe('warp graph closure', () => {
  test('every exported decomp map loads through the generated registry', () => {
    expect(exportedDecompMapIds).toHaveLength(425);

    for (const mapId of exportedDecompMapIds) {
      expect(loadMapById(mapId), mapId).not.toBeNull();
    }
  });

  test('every non-dynamic warp destination resolves to a loadable map and destination warp', () => {
    const checkedWarps: string[] = [];
    const dynamicWarps: string[] = [];

    for (const mapId of exportedDecompMapIds) {
      const map = loadMapById(mapId);
      expect(map, mapId).not.toBeNull();

      for (const [warpIndex, warp] of map!.warps.entries()) {
        const label = `${mapId}.warps[${warpIndex}] -> ${warp.destMap}#${warp.destWarpId}`;

        if (warp.destWarpId === WARP_ID_DYNAMIC) {
          expect(warp.destMap, label).toBe(MAP_DYNAMIC);
          dynamicWarps.push(label);
          continue;
        }

        const destinationMap = loadMapById(warp.destMap);
        expect(destinationMap, label).not.toBeNull();
        expect(destinationMap!.warps[warp.destWarpId], label).toBeDefined();
        checkedWarps.push(label);
      }
    }

    expect(checkedWarps.length).toBeGreaterThan(0);
    expect(dynamicWarps.length).toBeGreaterThan(0);
  });

  test('invalid warp data produces a deterministic unloaded-map error', () => {
    const map = createTestMap();
    const player = createPlayer();
    player.position = { x: 0, y: 0 };
    const transition = resolveWarpTransition(map, player, () => null);

    expect(() => assertWarpTransitionResolved(transition, map.id)).toThrow(
      'Invalid warp destination: MAP_TEST_SOURCE warp at (0,0) references unloaded map MAP_MISSING_DESTINATION.'
    );
  });

  test('invalid destination warp ids produce a deterministic error', () => {
    const map = createTestMap({
      warps: [{ x: 0, y: 0, elevation: 0, destMap: 'MAP_TEST_DESTINATION', destWarpId: 3 }]
    });
    const destination = createTestMap({ id: 'MAP_TEST_DESTINATION', warps: [] });
    const player = createPlayer();
    player.position = { x: 0, y: 0 };
    const transition = resolveWarpTransition(map, player, (mapId) => mapId === destination.id ? destination : null);

    expect(() => assertWarpTransitionResolved(transition, map.id)).toThrow(
      'Invalid warp destination: MAP_TEST_SOURCE warp at (0,0) references missing warp 3 on MAP_TEST_DESTINATION.'
    );
  });
});
