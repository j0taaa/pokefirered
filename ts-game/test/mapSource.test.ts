import { describe, expect, test } from 'vitest';
import { loadPrototypeRouteMap, mapFromSource, parseMapSource } from '../src/world/mapSource';

describe('map source loading', () => {
  test('loads the prototype map from JSON', () => {
    const map = loadPrototypeRouteMap();

    expect(map.width).toBe(20);
    expect(map.height).toBe(15);
    expect(map.tileSize).toBe(16);
    expect(map.walkable.length).toBe(300);
    expect(map.triggers.length).toBeGreaterThan(0);
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


  test('parses and validates triggers', () => {
    const source = parseMapSource({
      id: 'trigger-map',
      width: 1,
      height: 1,
      tileSize: 16,
      walkable: [true],
      triggers: [{ id: 't', x: 0, y: 0, activation: 'step', scriptId: 'script.1' }]
    });

    expect(source.triggers?.[0].facing).toBe('any');
    expect(source.triggers?.[0].once).toBe(false);
    expect(source.triggers?.[0].conditions).toBeUndefined();

    const sourceWithConditions = parseMapSource({
      id: 'trigger-map-conditions',
      width: 1,
      height: 1,
      tileSize: 16,
      walkable: [true],
      triggers: [{
        id: 't3',
        x: 0,
        y: 0,
        activation: 'step',
        scriptId: 'script.2',
        conditions: [{ var: 'progress', op: 'gte', value: 1 }, { flag: 'route.done', flagState: false }]
      }]
    });
    expect(sourceWithConditions.triggers?.[0].conditions?.length).toBe(2);

    expect(() => parseMapSource({
      id: 'bad-trigger',
      width: 1,
      height: 1,
      tileSize: 16,
      walkable: [true],
      triggers: [{ id: 't2', x: 0, y: 0, activation: 'oops', scriptId: 's' }]
    })).toThrow(/invalid activation/i);

    expect(() => parseMapSource({
      id: 'bad-trigger-condition',
      width: 1,
      height: 1,
      tileSize: 16,
      walkable: [true],
      triggers: [{
        id: 't4',
        x: 0,
        y: 0,
        activation: 'step',
        scriptId: 's',
        conditions: [{ var: 'progress', op: 'wat' }]
      }]
    })).toThrow(/invalid op/i);
  });
});
