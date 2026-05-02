import { describe, expect, test } from 'vitest';
import { exportMap } from '../scripts/export-decomp-map.mjs';
import { prototypeScriptRegistry } from '../src/game/scripts';
import {
  loadCeruleanCityBikeShopMap,
  loadCeruleanCityGymMap,
  loadCeruleanCityHouse1Map,
  loadCeruleanCityHouse2Map,
  loadCeruleanCityHouse3Map,
  loadCeruleanCityHouse4Map,
  loadCeruleanCityHouse5Map,
  loadCeruleanCityMap,
  loadCeruleanCityMartMap,
  loadCeruleanCityPokemonCenter1FMap,
  loadCeruleanCityPokemonCenter2FMap,
  loadMapById,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import type { TileMap } from '../src/world/tileMap';
import ceruleanCityBikeShopJson from '../src/world/maps/ceruleanCityBikeShop.json';
import ceruleanCityGymJson from '../src/world/maps/ceruleanCityGym.json';
import ceruleanCityHouse1Json from '../src/world/maps/ceruleanCityHouse1.json';
import ceruleanCityHouse2Json from '../src/world/maps/ceruleanCityHouse2.json';
import ceruleanCityHouse3Json from '../src/world/maps/ceruleanCityHouse3.json';
import ceruleanCityHouse4Json from '../src/world/maps/ceruleanCityHouse4.json';
import ceruleanCityHouse5Json from '../src/world/maps/ceruleanCityHouse5.json';
import ceruleanCityMartJson from '../src/world/maps/ceruleanCityMart.json';
import ceruleanCityPokemonCenter1FJson from '../src/world/maps/ceruleanCityPokemonCenter1F.json';
import ceruleanCityPokemonCenter2FJson from '../src/world/maps/ceruleanCityPokemonCenter2F.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] =>
  encounterRows.flatMap((row) => [...row]);

const interiorCases = [
  {
    label: 'CeruleanCity_Gym',
    mapId: 'MAP_CERULEAN_CITY_GYM',
    fixture: ceruleanCityGymJson,
    load: loadCeruleanCityGymMap
  },
  {
    label: 'CeruleanCity_House1',
    mapId: 'MAP_CERULEAN_CITY_HOUSE1',
    fixture: ceruleanCityHouse1Json,
    load: loadCeruleanCityHouse1Map
  },
  {
    label: 'CeruleanCity_House2',
    mapId: 'MAP_CERULEAN_CITY_HOUSE2',
    fixture: ceruleanCityHouse2Json,
    load: loadCeruleanCityHouse2Map
  },
  {
    label: 'CeruleanCity_House3',
    mapId: 'MAP_CERULEAN_CITY_HOUSE3',
    fixture: ceruleanCityHouse3Json,
    load: loadCeruleanCityHouse3Map
  },
  {
    label: 'CeruleanCity_PokemonCenter_1F',
    mapId: 'MAP_CERULEAN_CITY_POKEMON_CENTER_1F',
    fixture: ceruleanCityPokemonCenter1FJson,
    load: loadCeruleanCityPokemonCenter1FMap
  },
  {
    label: 'CeruleanCity_PokemonCenter_2F',
    mapId: 'MAP_CERULEAN_CITY_POKEMON_CENTER_2F',
    fixture: ceruleanCityPokemonCenter2FJson,
    load: loadCeruleanCityPokemonCenter2FMap
  },
  {
    label: 'CeruleanCity_BikeShop',
    mapId: 'MAP_CERULEAN_CITY_BIKE_SHOP',
    fixture: ceruleanCityBikeShopJson,
    load: loadCeruleanCityBikeShopMap
  },
  {
    label: 'CeruleanCity_Mart',
    mapId: 'MAP_CERULEAN_CITY_MART',
    fixture: ceruleanCityMartJson,
    load: loadCeruleanCityMartMap
  },
  {
    label: 'CeruleanCity_House4',
    mapId: 'MAP_CERULEAN_CITY_HOUSE4',
    fixture: ceruleanCityHouse4Json,
    load: loadCeruleanCityHouse4Map
  },
  {
    label: 'CeruleanCity_House5',
    mapId: 'MAP_CERULEAN_CITY_HOUSE5',
    fixture: ceruleanCityHouse5Json,
    load: loadCeruleanCityHouse5Map
  }
] as const;

const expectRuntimeShape = (map: TileMap, exported: any): void => {
  expect(map.id).toBe(exported.id);
  expect(map.width).toBe(exported.width);
  expect(map.height).toBe(exported.height);
  expect(map.tileSize).toBe(exported.tileSize);
  expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
  expect(map.encounterTiles).toEqual(toEncounterTiles(exported.encounterRows));
  expect(map.triggers).toEqual(exported.triggers);
  expect(map.visual).toEqual(exported.visual);
  expect(map.npcs).toEqual(exported.npcs);
  expect(map.hiddenItems).toEqual(exported.hiddenItems);
  expect(map.warps).toEqual(exported.warps);
};

describe('Cerulean City interior compact map sources', () => {
  test.each(interiorCases)('$label matches the decomp exporter output exactly', ({ fixture, label }) => {
    expect(fixture).toEqual(JSON.parse(JSON.stringify(exportMap(label))));
  });

  test.each(interiorCases)('$label loads into the runtime tile map shape', ({ load, label }) => {
    expectRuntimeShape(load(), exportMap(label));
  });

  test.each(interiorCases)('$label is available through the shared map loader', ({ load, mapId }) => {
    expect(loadMapById(mapId)).toEqual(load());
  });

  test('compact row validation rejects malformed Cerulean Gym rows', () => {
    const baseSource = ceruleanCityGymJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(ceruleanCityGymJson);
    expect(mapFromCompactSource(compactSource).encounterTiles).toEqual(
      toEncounterTiles(compactSource.encounterRows ?? [])
    );
  });

  test('Cerulean Gym preserves trainer, statue, exit warp, and battle metadata', () => {
    const map = loadCeruleanCityGymMap();
    const source = ceruleanCityGymJson as CompactMapSource & { metadata: Record<string, unknown> };

    expect(source.metadata.mapType).toBe('MAP_TYPE_INDOOR');
    expect(source.metadata.music).toBe('MUS_GYM');
    expect(source.metadata.battleScene).toBe('MAP_BATTLE_SCENE_GYM');
    expect(map.triggers).toHaveLength(2);
    expect(map.triggers.every((trigger) => trigger.scriptId === 'CeruleanCity_Gym_EventScript_GymStatue')).toBe(true);
    expect(map.warps).toHaveLength(3);
    expect(map.warps.every((warp) => warp.destMap === 'MAP_CERULEAN_CITY' && warp.destWarpId === 4)).toBe(true);
    expect(map.npcs).toHaveLength(4);
    expect(map.npcs.map((npc) => npc.scriptId)).toEqual([
      'CeruleanCity_Gym_EventScript_Luis',
      'CeruleanCity_Gym_EventScript_Diana',
      'CeruleanCity_Gym_EventScript_Misty',
      'CeruleanCity_Gym_EventScript_GymGuy'
    ]);
    expect(map.npcs.filter((npc) => npc.trainerType === 'TRAINER_TYPE_NORMAL')).toHaveLength(2);
  });

  test('Cerulean Bike Shop preserves bicycle signs and voucher NPCs', () => {
    const map = loadCeruleanCityBikeShopMap();

    expect(map.triggers).toHaveLength(8);
    expect(map.triggers.every((trigger) => trigger.scriptId === 'CeruleanCity_BikeShop_EventScript_Bicycle')).toBe(true);
    expect(map.warps).toHaveLength(3);
    expect(map.warps.every((warp) => warp.destMap === 'MAP_CERULEAN_CITY' && warp.destWarpId === 5)).toBe(true);
    expect(map.npcs.map((npc) => npc.scriptId)).toEqual([
      'CeruleanCity_BikeShop_EventScript_Clerk',
      'CeruleanCity_BikeShop_EventScript_Youngster',
      'CeruleanCity_BikeShop_EventScript_Woman'
    ]);
  });

  test('Cerulean houses preserve special one-off events', () => {
    expect(loadCeruleanCityHouse1Map().npcs[0]).toMatchObject({
      scriptId: 'CeruleanCity_House1_EventScript_BadgeGuy'
    });
    expect(loadCeruleanCityHouse2Map().triggers).toMatchObject([
      {
        id: 'CeruleanCity_House2_EventScript_WallHole',
        x: 4,
        y: 1,
        activation: 'interact',
        scriptId: 'CeruleanCity_House2_EventScript_WallHole',
        facing: 'any',
        once: false
      }
    ]);
    expect(loadCeruleanCityHouse3Map().npcs.map((npc) => npc.scriptId)).toEqual([
      'CeruleanCity_House3_EventScript_Dontae',
      'CeruleanCity_House3_EventScript_OldWoman'
    ]);
    expect(loadCeruleanCityHouse4Map().npcs[0]).toMatchObject({
      id: 'LOCALID_WONDER_NEWS_BERRY_MAN',
      scriptId: 'CeruleanCity_House4_EventScript_WonderNewsBerryMan'
    });
    expect(loadCeruleanCityHouse5Map().triggers[0]).toMatchObject({
      scriptId: 'CeruleanCity_House5_EventScript_BerryCrushRankings'
    });
  });

  test('Cerulean exterior warps now resolve to all loaded city interiors except Cerulean Cave', () => {
    const city = loadCeruleanCityMap();
    const loadedInteriorDestinations = city.warps
      .map((warp) => warp.destMap)
      .filter((destMap) => destMap.startsWith('MAP_CERULEAN_CITY_'));
    const exteriorInteriorIds = interiorCases
      .map((entry) => entry.mapId)
      .filter((mapId) => mapId !== 'MAP_CERULEAN_CITY_POKEMON_CENTER_2F');

    expect(new Set(loadedInteriorDestinations)).toEqual(new Set(exteriorInteriorIds));
    expect(loadMapById('MAP_CERULEAN_CAVE_1F')).toBeNull();
  });

  test('all Cerulean interior script ids have registered handlers', () => {
    const scriptIds = new Set<string>();

    for (const { load } of interiorCases) {
      const map = load();
      map.npcs.forEach((npc) => scriptIds.add(npc.scriptId));
      map.triggers.forEach((trigger) => scriptIds.add(trigger.scriptId));
    }

    expect([...scriptIds].filter((scriptId) => !prototypeScriptRegistry[scriptId])).toEqual([]);
  });
});
