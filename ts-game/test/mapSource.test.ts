import { describe, expect, test } from 'vitest';
import {
  loadRoute2Map,
  loadRoute21SouthMap,
  loadRoute2ViridianForestNorthEntranceMap,
  loadViridianCityPokemonCenter1FMap,
  loadViridianForestMap,
  mapFromSource,
  parseMapSource
} from '../src/world/mapSource';

describe('map source loading', () => {
  test('loads the Route 2 compact map into runtime shape', () => {
    const map = loadRoute2Map();

    expect(map.id).toBe('MAP_ROUTE2');
    expect(map.width).toBe(24);
    expect(map.height).toBe(80);
    expect(map.tileSize).toBe(16);
    expect(map.walkable.length).toBe(1920);
    expect(map.collisionValues?.length).toBe(1920);
    expect(map.encounterTiles?.length).toBe(1920);
    expect(map.elevations?.length).toBe(1920);
    expect(map.terrainTypes?.length).toBe(1920);
    expect(map.wildEncounters?.land?.encounterRate).toBe(21);
    expect(map.triggers.length).toBeGreaterThan(0);
    expect(map.visual?.metatileIds).toHaveLength(1920);
    expect(map.visual?.layerTypes).toHaveLength(1920);
    expect(map.visual?.primaryTileset).toBe('general');
    expect(map.npcs.length).toBeGreaterThan(0);
    expect(map.coordEventWeather).toBe('WEATHER_SUNNY');
  });

  test('loads water and fishing encounter tables from decomp wild data', () => {
    const map = loadRoute21SouthMap();

    expect(map.wildEncounters?.water?.encounterRate).toBe(2);
    expect(map.wildEncounters?.water?.mons).toHaveLength(5);
    expect(map.wildEncounters?.fishing?.encounterRate).toBe(20);
    expect(map.wildEncounters?.fishing?.mons).toHaveLength(10);
  });

  test('preserves metadata weather on compact maps', () => {
    expect(loadViridianForestMap().coordEventWeather).toBe('WEATHER_SHADE');
  });

  test('preserves decomp running metadata on compact maps', () => {
    expect(loadRoute2Map().allowRunning).toBe(true);
    expect(loadRoute2Map().mapType).toBe('MAP_TYPE_ROUTE');
    expect(loadViridianCityPokemonCenter1FMap().allowRunning).toBe(false);
    expect(loadViridianCityPokemonCenter1FMap().mapType).toBe('MAP_TYPE_INDOOR');
  });

  test('keeps Route 2 north entrance mats on the covered layer from the decomp export', () => {
    const map = loadRoute2ViridianForestNorthEntranceMap();
    const tileIndex = 10 * map.width + 7;

    expect(map.collisionValues?.[tileIndex]).toBe(0);
    expect(map.visual?.metatileIds[tileIndex]).toBe(710);
    expect(map.visual?.layerTypes[tileIndex]).toBe(1);
  });

  test('keeps the shared Pokemon Center layout aligned with decomp tile attributes', () => {
    const map = loadViridianCityPokemonCenter1FMap();
    const tileAt = (x: number, y: number) => {
      const tileIndex = y * map.width + x;
      return {
        metatileId: map.visual?.metatileIds[tileIndex],
        layerType: map.visual?.layerTypes[tileIndex],
        collisionValue: map.collisionValues?.[tileIndex],
        behavior: map.tileBehaviors?.[tileIndex],
        elevation: map.elevations?.[tileIndex]
      };
    };

    expect(tileAt(7, 8)).toEqual({ metatileId: 707, layerType: 1, collisionValue: 0, behavior: 0x65, elevation: 3 });
    expect(tileAt(1, 6)).toEqual({ metatileId: 729, layerType: 1, collisionValue: 0, behavior: 0x6a, elevation: 4 });
    expect(tileAt(5, 3)).toEqual({ metatileId: 700, layerType: 1, collisionValue: 1, behavior: 0x80, elevation: 0 });
    expect(tileAt(11, 1)).toEqual({ metatileId: 98, layerType: 1, collisionValue: 1, behavior: 0x83, elevation: 0 });
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

  test('throws when collision value length does not match map size', () => {
    expect(() =>
      mapFromSource({
        id: 'broken-collision-values',
        width: 2,
        height: 2,
        tileSize: 16,
        walkable: [true, false, true, false],
        collisionValues: [0, 1, 0]
      })
    ).toThrow(/collisionValues length/i);
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

  test('throws when elevations length does not match map size', () => {
    expect(() =>
      mapFromSource({
        id: 'broken-elevations',
        width: 2,
        height: 2,
        tileSize: 16,
        walkable: [true, false, true, false],
        elevations: [3, 3, 3]
      })
    ).toThrow(/elevations length/i);
  });

  test('throws when terrain type length does not match map size', () => {
    expect(() =>
      mapFromSource({
        id: 'broken-terrain-types',
        width: 2,
        height: 2,
        tileSize: 16,
        walkable: [true, false, true, false],
        terrainTypes: [0, 1, 2]
      })
    ).toThrow(/terrainTypes length/i);
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
      triggers: [{ id: 't', x: 0, y: 0, elevation: 3, activation: 'step', scriptId: 'script.1' }]
    });

    expect(source.triggers?.[0].facing).toBe('any');
    expect(source.triggers?.[0].once).toBe(false);
    expect(source.triggers?.[0].elevation).toBe(3);
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

    expect(() => parseMapSource({
      id: 'bad-trigger-elevation',
      width: 1,
      height: 1,
      tileSize: 16,
      walkable: [true],
      triggers: [{ id: 't5', x: 0, y: 0, elevation: '3', activation: 'step', scriptId: 's' }]
    })).toThrow(/invalid elevation/i);
  });
});
