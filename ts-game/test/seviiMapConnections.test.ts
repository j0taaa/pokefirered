import { describe, expect, test } from 'vitest';
import { resolveMapConnectionTransition } from '../src/game/mapConnections';
import {
  loadMapById,
  loadOneIslandKindleRoadMap,
  loadOneIslandMap,
  loadOneIslandTreasureBeachMap,
  loadThreeIslandBondBridgeMap,
  loadThreeIslandMap,
  loadThreeIslandPortMap,
  loadTwoIslandCapeBrinkMap,
  loadTwoIslandMap,
} from '../src/world/mapSource';
import type { TileMap } from '../src/world/tileMap';

type EdgeTransitionResult = {
  tileX: number;
  tileY: number;
  transition: NonNullable<ReturnType<typeof resolveMapConnectionTransition>>;
};

const findEdgeTransition = (
  map: TileMap,
  direction: 'up' | 'down' | 'left' | 'right'
): EdgeTransitionResult => {
  const edgeTiles = direction === 'up' || direction === 'down'
    ? Array.from({ length: map.width }, (_, index) => ({ x: index, y: direction === 'up' ? 0 : map.height - 1 }))
    : Array.from({ length: map.height }, (_, index) => ({ x: direction === 'left' ? 0 : map.width - 1, y: index }));

  for (const tile of edgeTiles) {
    const transition = resolveMapConnectionTransition(map, tile.x, tile.y, direction, loadMapById);
    if (transition) {
      return { tileX: tile.x, tileY: tile.y, transition };
    }
  }

  throw new Error(`No walkable ${direction} edge transition found for ${map.id}.`);
};

describe('Sevii map connections', () => {
  test('matches the decomp connection offsets for the Sevii story slice', () => {
    expect(loadOneIslandMap().connections).toEqual([
      { map: 'MAP_ONE_ISLAND_TREASURE_BEACH', offset: 0, direction: 'down' },
      { map: 'MAP_ONE_ISLAND_KINDLE_ROAD', offset: -120, direction: 'right' },
    ]);
    expect(loadOneIslandTreasureBeachMap().connections).toEqual([
      { map: 'MAP_ONE_ISLAND', offset: 0, direction: 'up' },
    ]);
    expect(loadOneIslandKindleRoadMap().connections).toEqual([
      { map: 'MAP_ONE_ISLAND', offset: 120, direction: 'left' },
    ]);
    expect(loadTwoIslandMap().connections).toEqual([
      { map: 'MAP_TWO_ISLAND_CAPE_BRINK', offset: 24, direction: 'up' },
    ]);
    expect(loadTwoIslandCapeBrinkMap().connections).toEqual([
      { map: 'MAP_TWO_ISLAND', offset: -24, direction: 'down' },
    ]);
    expect(loadThreeIslandMap().connections).toEqual([
      { map: 'MAP_THREE_ISLAND_PORT', offset: 0, direction: 'down' },
      { map: 'MAP_THREE_ISLAND_BOND_BRIDGE', offset: 0, direction: 'left' },
    ]);
    expect(loadThreeIslandPortMap().connections).toEqual([
      { map: 'MAP_THREE_ISLAND', offset: 0, direction: 'up' },
    ]);
    expect(loadThreeIslandBondBridgeMap().connections).toEqual([
      { map: 'MAP_THREE_ISLAND', offset: 0, direction: 'right' },
    ]);
  });

  test('transitions from One Island south edge into Treasure Beach using the decomp offset', () => {
    const { tileX, transition } = findEdgeTransition(loadOneIslandMap(), 'down');

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ONE_ISLAND_TREASURE_BEACH');
    expect(transition?.playerPosition).toEqual({ x: tileX * 16, y: 0 });
  });

  test('transitions from Treasure Beach north edge into One Island using the reciprocal offset', () => {
    const { tileX, transition } = findEdgeTransition(loadOneIslandTreasureBeachMap(), 'up');

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ONE_ISLAND');
    expect(transition?.playerPosition).toEqual({
      x: tileX * 16,
      y: (loadOneIslandMap().height - 1) * 16,
    });
  });

  test('transitions from One Island east edge into Kindle Road using the decomp offset', () => {
    const { tileY, transition } = findEdgeTransition(loadOneIslandMap(), 'right');

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ONE_ISLAND_KINDLE_ROAD');
    expect(transition?.playerPosition).toEqual({ x: 0, y: (tileY + 120) * 16 });
  });

  test('transitions from Kindle Road west edge into One Island using the reciprocal offset', () => {
    const { tileY, transition } = findEdgeTransition(loadOneIslandKindleRoadMap(), 'left');

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_ONE_ISLAND');
    expect(transition?.playerPosition).toEqual({
      x: (loadOneIslandMap().width - 1) * 16,
      y: (tileY - 120) * 16,
    });
  });

  test('transitions from Two Island north edge into Cape Brink using the decomp offset', () => {
    const { tileX, transition } = findEdgeTransition(loadTwoIslandMap(), 'up');

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_TWO_ISLAND_CAPE_BRINK');
    expect(transition?.playerPosition).toEqual({
      x: (tileX - 24) * 16,
      y: (loadTwoIslandCapeBrinkMap().height - 1) * 16,
    });
  });

  test('transitions from Cape Brink south edge into Two Island using the reciprocal offset', () => {
    const { tileX, transition } = findEdgeTransition(loadTwoIslandCapeBrinkMap(), 'down');

    expect(transition).not.toBeNull();
    expect(transition?.map.id).toBe('MAP_TWO_ISLAND');
    expect(transition?.playerPosition).toEqual({ x: (tileX + 24) * 16, y: 0 });
  });

  test('transitions from Three Island south edge into the port and west edge into Bond Bridge', () => {
    const downEdge = findEdgeTransition(loadThreeIslandMap(), 'down');
    const leftEdge = findEdgeTransition(loadThreeIslandMap(), 'left');

    expect(downEdge.transition.map.id).toBe('MAP_THREE_ISLAND_PORT');
    expect(downEdge.transition.playerPosition).toEqual({ x: downEdge.tileX * 16, y: 0 });
    expect(leftEdge.transition.map.id).toBe('MAP_THREE_ISLAND_BOND_BRIDGE');
    expect(leftEdge.transition.playerPosition).toEqual({
      x: (loadThreeIslandBondBridgeMap().width - 1) * 16,
      y: leftEdge.tileY * 16,
    });
  });

  test('transitions from the port and Bond Bridge back into Three Island', () => {
    const upEdge = findEdgeTransition(loadThreeIslandPortMap(), 'up');
    const rightEdge = findEdgeTransition(loadThreeIslandBondBridgeMap(), 'right');

    expect(upEdge.transition.map.id).toBe('MAP_THREE_ISLAND');
    expect(upEdge.transition.playerPosition).toEqual({
      x: upEdge.tileX * 16,
      y: (loadThreeIslandMap().height - 1) * 16,
    });
    expect(rightEdge.transition.map.id).toBe('MAP_THREE_ISLAND');
    expect(rightEdge.transition.playerPosition).toEqual({ x: 0, y: rightEdge.tileY * 16 });
  });

  test('rejects coordinates outside the connected overlap for offset Sevii edges', () => {
    expect(resolveMapConnectionTransition(loadTwoIslandMap(), 23, 0, 'up', loadMapById)).toBeNull();
    expect(resolveMapConnectionTransition(loadOneIslandKindleRoadMap(), 0, 119, 'left', loadMapById)).toBeNull();
  });

  test('loads the Sevii story outdoor maps through the shared map loader', () => {
    expect(loadMapById('MAP_ONE_ISLAND')?.id).toBe('MAP_ONE_ISLAND');
    expect(loadMapById('MAP_ONE_ISLAND_TREASURE_BEACH')?.id).toBe('MAP_ONE_ISLAND_TREASURE_BEACH');
    expect(loadMapById('MAP_ONE_ISLAND_KINDLE_ROAD')?.id).toBe('MAP_ONE_ISLAND_KINDLE_ROAD');
    expect(loadMapById('MAP_MT_EMBER_EXTERIOR')?.id).toBe('MAP_MT_EMBER_EXTERIOR');
    expect(loadMapById('MAP_TWO_ISLAND')?.id).toBe('MAP_TWO_ISLAND');
    expect(loadMapById('MAP_TWO_ISLAND_CAPE_BRINK')?.id).toBe('MAP_TWO_ISLAND_CAPE_BRINK');
    expect(loadMapById('MAP_THREE_ISLAND')?.id).toBe('MAP_THREE_ISLAND');
    expect(loadMapById('MAP_THREE_ISLAND_PORT')?.id).toBe('MAP_THREE_ISLAND_PORT');
    expect(loadMapById('MAP_THREE_ISLAND_BOND_BRIDGE')?.id).toBe('MAP_THREE_ISLAND_BOND_BRIDGE');
    expect(loadMapById('MAP_THREE_ISLAND_BERRY_FOREST')?.id).toBe('MAP_THREE_ISLAND_BERRY_FOREST');
  });
});
