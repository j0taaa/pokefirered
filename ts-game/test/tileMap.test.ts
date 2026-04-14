import { describe, expect, test } from 'vitest';
import { createPrototypeRouteMap, isWalkableAtPixel } from '../src/world/tileMap';

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
});
