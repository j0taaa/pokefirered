import { describe, expect, test } from 'vitest';
import { loadPrototypeRouteMap, mapFromSource, parseMapSource } from '../src/world/mapSource';

describe('map source loading', () => {
  test('loads the prototype map from JSON', () => {
    const map = loadPrototypeRouteMap();

    expect(map.width).toBe(20);
    expect(map.height).toBe(15);
    expect(map.tileSize).toBe(16);
    expect(map.walkable.length).toBe(300);
  });

  test('throws when walkable length does not match map size', () => {
    expect(() =>
      mapFromSource({
        id: 'broken',
        width: 2,
        height: 2,
        tileSize: 16,
        walkable: [true, false, true]
      })
    ).toThrow(/walkable length/i);
  });

  test('validates raw map source payloads', () => {
    expect(() => parseMapSource({ id: '', width: 1, height: 1, tileSize: 16, walkable: [true] })).toThrow(
      /non-empty string/i
    );

    expect(() =>
      parseMapSource({
        id: 'bad-map',
        width: 2,
        height: 1,
        tileSize: 16,
        walkable: [1, 2]
      })
    ).toThrow(/boolean walkable array/i);
  });
});
