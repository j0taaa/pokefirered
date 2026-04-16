import { describe, expect, test } from 'vitest';
import { loadRoute2Map, mapFromSource, parseMapSource } from '../src/world/mapSource';

describe('map source loading', () => {
  test('loads the Route 2 compact map into runtime shape', () => {
    const map = loadRoute2Map();

    expect(map.id).toBe('MAP_ROUTE2');
    expect(map.width).toBe(24);
    expect(map.height).toBe(80);
    expect(map.tileSize).toBe(16);
    expect(map.walkable.length).toBe(1920);
    expect(map.encounterTiles?.length).toBe(1920);
    expect(map.wildEncounters?.land?.encounterRate).toBe(21);
    expect(map.triggers.length).toBeGreaterThan(0);
    expect(map.visual?.metatileIds).toHaveLength(1920);
    expect(map.visual?.layerTypes).toHaveLength(1920);
    expect(map.visual?.primaryTileset).toBe('general');
    expect(map.npcs.length).toBeGreaterThan(0);
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

  test('throws when encounter tile length does not match map size', () => {
    expect(() =>
      mapFromSource({
        id: 'broken-encounters',
        width: 2,
        height: 2,
        tileSize: 16,
        walkable: [true, false, true, false],
        encounterTiles: ['L', '.', 'L']
      })
    ).toThrow(/encounterTiles length/i);
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

    expect(() =>
      parseMapSource({
        id: 'bad-encounters',
        width: 1,
        height: 1,
        tileSize: 16,
        walkable: [true],
        encounterTiles: ['X']
      })
    ).toThrow(/encounterTiles/i);

    expect(() =>
      parseMapSource({
        id: 'bad-wild-encounters',
        width: 1,
        height: 1,
        tileSize: 16,
        walkable: [true],
        wildEncounters: { land: { encounterRate: 21, mons: [{ species: 'SPECIES_RATTATA' }] } }
      })
    ).toThrow(/wildEncounters/i);
  });

  test('validates optional visual and npc payloads', () => {
    expect(() =>
      parseMapSource({
        id: 'bad-visual',
        width: 1,
        height: 1,
        tileSize: 16,
        walkable: [true],
        visual: {
          primaryTileset: 'general',
          secondaryTileset: 'viridian_city',
          metatileIds: [],
          layerTypes: []
        }
      })
    ).toThrow(/metatileIds/i);

    expect(() =>
      parseMapSource({
        id: 'bad-npc',
        width: 1,
        height: 1,
        tileSize: 16,
        walkable: [true],
        npcs: [{ id: 'npc', x: 0, y: 0 }]
      })
    ).toThrow(/graphicsId/i);
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
