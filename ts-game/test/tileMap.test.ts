import { describe, expect, test } from 'vitest';
import {
  createPrototypeRouteMap,
  isDirectionalMoveBlocked,
  isJumpMetatileBehavior,
  isMetatileDirectionBlocked,
  isWalkableAtPixel
} from '../src/world/tileMap';

describe('tile map collision probes', () => {
  test('blocks the outer border tiles', () => {
    const map = createPrototypeRouteMap();

    expect(isWalkableAtPixel(map, { x: 0, y: 0 })).toBe(false);
    expect(isWalkableAtPixel(map, { x: 19 * 16 + 2, y: 10 * 16 + 2 })).toBe(false);
  });

  test('permits the intentional hedge gap', () => {
    const map = createPrototypeRouteMap();

    expect(isWalkableAtPixel(map, { x: 10 * 16 + 8, y: 5 * 16 + 8 })).toBe(true);
  });

  test('exposes FireRed directional blocking and ledge behavior helpers', () => {
    expect(isMetatileDirectionBlocked(0x32, 'up')).toBe(true);
    expect(isMetatileDirectionBlocked(0x32, 'down')).toBe(false);
    expect(isMetatileDirectionBlocked(0x34, 'up')).toBe(true);
    expect(isMetatileDirectionBlocked(0x34, 'right')).toBe(true);
    expect(isJumpMetatileBehavior(0x3b, 'down')).toBe(true);
    expect(isJumpMetatileBehavior(0x3b, 'up')).toBe(false);
  });

  test('blocks movement leaving a directional metatile from its closed side', () => {
    const map = {
      id: 'directional-block-test',
      width: 2,
      height: 1,
      tileSize: 16,
      walkable: [true, true],
      encounterTypes: ['none' as const, 'none' as const],
      metatileBehaviors: [0, 0x30],
      triggers: [],
      npcs: []
    };

    expect(isDirectionalMoveBlocked(
      map,
      { x: 8, y: 8 },
      { x: 16 + 8, y: 8 },
      'right'
    )).toBe(true);

    expect(isDirectionalMoveBlocked(
      map,
      { x: 8, y: 8 },
      { x: 9, y: 8 },
      'right'
    )).toBe(false);
  });
});
