import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadMtEmberExteriorMap,
  loadOneIslandKindleRoadMap,
  loadOneIslandMap,
  loadOneIslandTreasureBeachMap,
  loadThreeIslandBerryForestMap,
  loadThreeIslandBondBridgeMap,
  loadThreeIslandMap,
  loadThreeIslandPortMap,
  loadTwoIslandCapeBrinkMap,
  loadTwoIslandMap,
  mapFromCompactSource,
  parseCompactMapSource,
} from '../src/world/mapSource';
import type { TileMap } from '../src/world/tileMap';
import mtEmberExteriorMapJson from '../src/world/maps/mtEmberExterior.json';
import oneIslandKindleRoadMapJson from '../src/world/maps/oneIslandKindleRoad.json';
import oneIslandMapJson from '../src/world/maps/oneIsland.json';
import oneIslandTreasureBeachMapJson from '../src/world/maps/oneIslandTreasureBeach.json';
import threeIslandBerryForestMapJson from '../src/world/maps/threeIslandBerryForest.json';
import threeIslandBondBridgeMapJson from '../src/world/maps/threeIslandBondBridge.json';
import threeIslandMapJson from '../src/world/maps/threeIsland.json';
import threeIslandPortMapJson from '../src/world/maps/threeIslandPort.json';
import twoIslandCapeBrinkMapJson from '../src/world/maps/twoIslandCapeBrink.json';
import twoIslandMapJson from '../src/world/maps/twoIsland.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] =>
  encounterRows.flatMap((row) => [...row]);

type SeviiMapCase = {
  label: string;
  exportName: string;
  json: Record<string, unknown>;
  load: () => TileMap;
};

const seviiOutdoorMaps: SeviiMapCase[] = [
  {
    label: 'One Island',
    exportName: 'OneIsland',
    json: oneIslandMapJson,
    load: loadOneIslandMap,
  },
  {
    label: 'One Island Treasure Beach',
    exportName: 'OneIsland_TreasureBeach',
    json: oneIslandTreasureBeachMapJson,
    load: loadOneIslandTreasureBeachMap,
  },
  {
    label: 'One Island Kindle Road',
    exportName: 'OneIsland_KindleRoad',
    json: oneIslandKindleRoadMapJson,
    load: loadOneIslandKindleRoadMap,
  },
  {
    label: 'Mt. Ember Exterior',
    exportName: 'MtEmber_Exterior',
    json: mtEmberExteriorMapJson,
    load: loadMtEmberExteriorMap,
  },
  {
    label: 'Two Island',
    exportName: 'TwoIsland',
    json: twoIslandMapJson,
    load: loadTwoIslandMap,
  },
  {
    label: 'Two Island Cape Brink',
    exportName: 'TwoIsland_CapeBrink',
    json: twoIslandCapeBrinkMapJson,
    load: loadTwoIslandCapeBrinkMap,
  },
  {
    label: 'Three Island',
    exportName: 'ThreeIsland',
    json: threeIslandMapJson,
    load: loadThreeIslandMap,
  },
  {
    label: 'Three Island Port',
    exportName: 'ThreeIsland_Port',
    json: threeIslandPortMapJson,
    load: loadThreeIslandPortMap,
  },
  {
    label: 'Three Island Bond Bridge',
    exportName: 'ThreeIsland_BondBridge',
    json: threeIslandBondBridgeMapJson,
    load: loadThreeIslandBondBridgeMap,
  },
  {
    label: 'Three Island Berry Forest',
    exportName: 'ThreeIsland_BerryForest',
    json: threeIslandBerryForestMapJson,
    load: loadThreeIslandBerryForestMap,
  },
];

describe('Sevii outdoor map sources', () => {
  test.each(seviiOutdoorMaps)('$label matches the decomp exporter output exactly', ({ exportName, json }) => {
    expect(json).toEqual(exportMap(exportName));
  });

  test.each(seviiOutdoorMaps)('$label loads into the runtime tile map shape', ({ exportName, load }) => {
    const exported = exportMap(exportName);
    const map = load();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.tileSize).toBe(exported.tileSize);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.connections).toEqual(exported.metadata.connections ?? []);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exported.encounterRows));
    expect(map.wildEncounters).toEqual(exported.wildEncounters);
    expect(map.triggers).toEqual(exported.triggers);
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.hiddenItems).toEqual(exported.hiddenItems);
    expect(map.warps).toEqual(exported.warps);
  });

  test.each(seviiOutdoorMaps)('$label validates compact row dimensions and encounter markers', ({ json }) => {
    const source = json as typeof oneIslandMapJson;

    expect(() => parseCompactMapSource({
      ...source,
      collisionRows: source.collisionRows.slice(1),
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...source,
      encounterRows: ['X'.repeat(source.width), ...source.encounterRows.slice(1)],
    })).toThrow(/encounterRows/i);
  });

  test('keeps the Sevii story connection topology from the decomp data', () => {
    expect(mapFromCompactSource(parseCompactMapSource(oneIslandMapJson)).connections).toEqual([
      { map: 'MAP_ONE_ISLAND_TREASURE_BEACH', offset: 0, direction: 'down' },
      { map: 'MAP_ONE_ISLAND_KINDLE_ROAD', offset: -120, direction: 'right' },
    ]);
    expect(mapFromCompactSource(parseCompactMapSource(oneIslandTreasureBeachMapJson)).connections).toEqual([
      { map: 'MAP_ONE_ISLAND', offset: 0, direction: 'up' },
    ]);
    expect(mapFromCompactSource(parseCompactMapSource(oneIslandKindleRoadMapJson)).connections).toEqual([
      { map: 'MAP_ONE_ISLAND', offset: 120, direction: 'left' },
    ]);
    expect(mapFromCompactSource(parseCompactMapSource(mtEmberExteriorMapJson)).connections).toEqual([]);
    expect(mapFromCompactSource(parseCompactMapSource(twoIslandMapJson)).connections).toEqual([
      { map: 'MAP_TWO_ISLAND_CAPE_BRINK', offset: 24, direction: 'up' },
    ]);
    expect(mapFromCompactSource(parseCompactMapSource(twoIslandCapeBrinkMapJson)).connections).toEqual([
      { map: 'MAP_TWO_ISLAND', offset: -24, direction: 'down' },
    ]);
    expect(mapFromCompactSource(parseCompactMapSource(threeIslandMapJson)).connections).toEqual([
      { map: 'MAP_THREE_ISLAND_PORT', offset: 0, direction: 'down' },
      { map: 'MAP_THREE_ISLAND_BOND_BRIDGE', offset: 0, direction: 'left' },
    ]);
    expect(mapFromCompactSource(parseCompactMapSource(threeIslandPortMapJson)).connections).toEqual([
      { map: 'MAP_THREE_ISLAND', offset: 0, direction: 'up' },
    ]);
    expect(mapFromCompactSource(parseCompactMapSource(threeIslandBondBridgeMapJson)).connections).toEqual([
      { map: 'MAP_THREE_ISLAND', offset: 0, direction: 'right' },
    ]);
    expect(mapFromCompactSource(parseCompactMapSource(threeIslandBerryForestMapJson)).connections).toEqual([]);
  });
});
