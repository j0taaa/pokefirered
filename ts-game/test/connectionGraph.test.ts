import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import { resolveStepTarget } from '../src/game/fieldCollision';
import { exportedDecompMapIds } from '../src/world/mapRegistry';
import { loadMapById } from '../src/world/mapSource';
import type { TileMap } from '../src/world/tileMap';

const createTestMap = (overrides: Partial<TileMap> = {}): TileMap => ({
  id: 'MAP_TEST_SOURCE',
  width: 2,
  height: 2,
  tileSize: 16,
  walkable: new Array(4).fill(true),
  connections: [{ map: 'MAP_MISSING_NEIGHBOR', offset: 0, direction: 'right' }],
  triggers: [],
  npcs: [],
  hiddenItems: [],
  warps: [],
  ...overrides
});

describe('connection graph closure', () => {
  test('every exported decomp map connection resolves to a loadable neighbor map', () => {
    const checkedConnections: string[] = [];

    expect(exportedDecompMapIds).toHaveLength(425);

    for (const mapId of exportedDecompMapIds) {
      const map = loadMapById(mapId);
      expect(map, mapId).not.toBeNull();

      for (const [connectionIndex, connection] of map!.connections.entries()) {
        const label = `${mapId}.connections[${connectionIndex}] ${connection.direction} -> ${connection.map}`;
        expect(loadMapById(connection.map), label).not.toBeNull();
        checkedConnections.push(label);
      }
    }

    expect(checkedConnections.length).toBeGreaterThan(0);
  });

  test('invalid connection data produces a deterministic unloaded-map error', () => {
    const map = createTestMap();

    expect(() => resolveStepTarget(map, vec2(1, 1), 'right', () => null)).toThrow(
      'Invalid map connection: MAP_TEST_SOURCE right connection references unloaded map MAP_MISSING_NEIGHBOR.'
    );
  });
});
