import { describe, expect, test } from 'vitest';
import { exportMap } from '../scripts/export-decomp-map.mjs';
import { prototypeScriptRegistry } from '../src/game/scripts';
import {
  loadVermilionCityGymMap,
  loadVermilionCityHouse1Map,
  loadVermilionCityHouse2Map,
  loadVermilionCityHouse3Map,
  loadVermilionCityMap,
  loadVermilionCityMartMap,
  loadVermilionCityPokemonCenter1FMap,
  loadVermilionCityPokemonCenter2FMap,
  loadVermilionCityPokemonFanClubMap,
  loadMapById,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import type { TileMap } from '../src/world/tileMap';
import vermilionCityGymJson from '../src/world/maps/vermilionCityGym.json';
import vermilionCityHouse1Json from '../src/world/maps/vermilionCityHouse1.json';
import vermilionCityHouse2Json from '../src/world/maps/vermilionCityHouse2.json';
import vermilionCityHouse3Json from '../src/world/maps/vermilionCityHouse3.json';
import vermilionCityMartJson from '../src/world/maps/vermilionCityMart.json';
import vermilionCityPokemonCenter1FJson from '../src/world/maps/vermilionCityPokemonCenter1F.json';
import vermilionCityPokemonCenter2FJson from '../src/world/maps/vermilionCityPokemonCenter2F.json';
import vermilionCityPokemonFanClubJson from '../src/world/maps/vermilionCityPokemonFanClub.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] =>
  encounterRows.flatMap((row) => [...row]);

const interiorCases = [
  {
    label: 'VermilionCity_Gym',
    mapId: 'MAP_VERMILION_CITY_GYM',
    fixture: vermilionCityGymJson,
    load: loadVermilionCityGymMap
  },
  {
    label: 'VermilionCity_House1',
    mapId: 'MAP_VERMILION_CITY_HOUSE1',
    fixture: vermilionCityHouse1Json,
    load: loadVermilionCityHouse1Map
  },
  {
    label: 'VermilionCity_House2',
    mapId: 'MAP_VERMILION_CITY_HOUSE2',
    fixture: vermilionCityHouse2Json,
    load: loadVermilionCityHouse2Map
  },
  {
    label: 'VermilionCity_House3',
    mapId: 'MAP_VERMILION_CITY_HOUSE3',
    fixture: vermilionCityHouse3Json,
    load: loadVermilionCityHouse3Map
  },
  {
    label: 'VermilionCity_Mart',
    mapId: 'MAP_VERMILION_CITY_MART',
    fixture: vermilionCityMartJson,
    load: loadVermilionCityMartMap
  },
  {
    label: 'VermilionCity_PokemonCenter_1F',
    mapId: 'MAP_VERMILION_CITY_POKEMON_CENTER_1F',
    fixture: vermilionCityPokemonCenter1FJson,
    load: loadVermilionCityPokemonCenter1FMap
  },
  {
    label: 'VermilionCity_PokemonCenter_2F',
    mapId: 'MAP_VERMILION_CITY_POKEMON_CENTER_2F',
    fixture: vermilionCityPokemonCenter2FJson,
    load: loadVermilionCityPokemonCenter2FMap
  },
  {
    label: 'VermilionCity_PokemonFanClub',
    mapId: 'MAP_VERMILION_CITY_POKEMON_FAN_CLUB',
    fixture: vermilionCityPokemonFanClubJson,
    load: loadVermilionCityPokemonFanClubMap
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

describe('Vermilion City interior compact map sources', () => {
  test.each(interiorCases)('$label matches the decomp exporter output exactly', ({ fixture, label }) => {
    expect(fixture).toEqual(JSON.parse(JSON.stringify(exportMap(label))));
  });

  test.each(interiorCases)('$label loads into the runtime tile map shape', ({ load, label }) => {
    expectRuntimeShape(load(), exportMap(label));
  });

  test.each(interiorCases)('$label is available through the shared map loader', ({ load, mapId }) => {
    expect(loadMapById(mapId)).toEqual(load());
  });

  test('compact row validation rejects malformed Vermilion Gym rows', () => {
    const baseSource = vermilionCityGymJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(vermilionCityGymJson);
    expect(mapFromCompactSource(compactSource).encounterTiles).toEqual(
      toEncounterTiles(compactSource.encounterRows ?? [])
    );
  });

  test('Vermilion Gym preserves trainer, trash can, statue, and exit warp metadata', () => {
    const map = loadVermilionCityGymMap();
    const source = vermilionCityGymJson as CompactMapSource & { metadata: Record<string, unknown> };

    expect(source.metadata.mapType).toBe('MAP_TYPE_INDOOR');
    expect(source.metadata.music).toBe('MUS_GYM');
    expect(source.metadata.battleScene).toBe('MAP_BATTLE_SCENE_GYM');
    expect(map.triggers).toHaveLength(17);
    expect(map.triggers.filter((t) => t.scriptId.startsWith('VermilionCity_Gym_EventScript_TrashCan'))).toHaveLength(15);
    expect(map.triggers.filter((t) => t.scriptId === 'VermilionCity_Gym_EventScript_GymStatue')).toHaveLength(2);
    expect(map.warps).toHaveLength(3);
    expect(map.warps.every((warp) => warp.destMap === 'MAP_VERMILION_CITY' && warp.destWarpId === 9)).toBe(true);
    expect(map.npcs).toHaveLength(5);
    expect(map.npcs.filter((npc) => npc.trainerType === 'TRAINER_TYPE_NORMAL')).toHaveLength(3);
    expect(map.npcs.map((npc) => npc.scriptId)).toEqual([
      'VermilionCity_Gym_EventScript_LtSurge',
      'VermilionCity_Gym_EventScript_Baily',
      'VermilionCity_Gym_EventScript_Dwayne',
      'VermilionCity_Gym_EventScript_GymGuy',
      'VermilionCity_Gym_EventScript_Tucker'
    ]);
  });

  test('Vermilion Pokemon Fan Club preserves chairman, NPCs, and sign triggers', () => {
    const map = loadVermilionCityPokemonFanClubMap();
    const source = vermilionCityPokemonFanClubJson as CompactMapSource & { metadata: Record<string, unknown> };

    expect(source.metadata.mapType).toBe('MAP_TYPE_INDOOR');
    expect(map.warps).toHaveLength(3);
    expect(map.warps.every((warp) => warp.destMap === 'MAP_VERMILION_CITY' && warp.destWarpId === 5)).toBe(true);
    expect(map.npcs).toHaveLength(6);
    expect(map.npcs.map((npc) => npc.scriptId)).toEqual([
      'VermilionCity_PokemonFanClub_EventScript_Chairman',
      'VermilionCity_PokemonFanClub_EventScript_WorkerF',
      'VermilionCity_PokemonFanClub_EventScript_Pikachu',
      'VermilionCity_PokemonFanClub_EventScript_Seel',
      'VermilionCity_PokemonFanClub_EventScript_Woman',
      'VermilionCity_PokemonFanClub_EventScript_FatMan'
    ]);
    expect(map.triggers).toHaveLength(2);
    expect(map.triggers.every((t) => t.activation === 'interact')).toBe(true);
    expect(map.triggers[0].scriptId).toBe('VermilionCity_PokemonFanClub_EventScript_RulesSign1');
    expect(map.triggers[1].scriptId).toBe('VermilionCity_PokemonFanClub_EventScript_RulesSign2');
  });

  test('Vermilion House1 preserves Fishing Guru NPC and exit warps', () => {
    const map = loadVermilionCityHouse1Map();

    expect(map.npcs).toHaveLength(1);
    expect(map.npcs[0].scriptId).toBe('VermilionCity_House1_EventScript_FishingGuru');
    expect(map.warps).toHaveLength(3);
    expect(map.warps.every((warp) => warp.destMap === 'MAP_VERMILION_CITY' && warp.destWarpId === 3)).toBe(true);
  });

  test('Vermilion House2 preserves Elyssa trade NPC and exit warps', () => {
    const map = loadVermilionCityHouse2Map();

    expect(map.npcs).toHaveLength(1);
    expect(map.npcs[0].scriptId).toBe('VermilionCity_House2_EventScript_Elyssa');
    expect(map.warps).toHaveLength(3);
    expect(map.warps.every((warp) => warp.destMap === 'MAP_VERMILION_CITY' && warp.destWarpId === 6)).toBe(true);
  });

  test('Vermilion House3 preserves Boy, Pidgey, Lass NPCs and letter trigger', () => {
    const map = loadVermilionCityHouse3Map();

    expect(map.npcs).toHaveLength(4);
    expect(map.npcs[0].scriptId).toBe('VermilionCity_House3_EventScript_Boy');
    expect(map.npcs[1].scriptId).toBe('VermilionCity_House3_EventScript_Pidgey');
    expect(map.npcs[3].scriptId).toBe('VermilionCity_House3_EventScript_Lass');
    expect(map.triggers).toHaveLength(1);
    expect(map.triggers[0].scriptId).toBe('VermilionCity_House3_EventScript_Letter');
    expect(map.warps).toHaveLength(3);
    expect(map.warps.every((warp) => warp.destMap === 'MAP_VERMILION_CITY' && warp.destWarpId === 8)).toBe(true);
  });

  test('Vermilion Mart preserves clerk and visitor NPCs', () => {
    const map = loadVermilionCityMartMap();

    expect(map.npcs).toHaveLength(3);
    expect(map.npcs.map((npc) => npc.scriptId)).toEqual([
      'VermilionCity_Mart_EventScript_Clerk',
      'VermilionCity_Mart_EventScript_CooltrainerF',
      'VermilionCity_Mart_EventScript_BaldingMan'
    ]);
    expect(map.warps).toHaveLength(3);
    expect(map.warps.every((warp) => warp.destMap === 'MAP_VERMILION_CITY' && warp.destWarpId === 7)).toBe(true);
  });

  test('Vermilion Pokemon Center 1F preserves nurse and NPC dialogue', () => {
    const map = loadVermilionCityPokemonCenter1FMap();

    expect(map.npcs).toHaveLength(7);
    expect(map.npcs[0].scriptId).toBe('VermilionCity_PokemonCenter_1F_EventScript_Nurse');
    expect(map.warps).toHaveLength(4);
    expect(map.warps[3]).toMatchObject({
      destMap: 'MAP_VERMILION_CITY_POKEMON_CENTER_2F',
      destWarpId: 0
    });
    expect(map.warps.slice(0, 3).every((w) => w.destMap === 'MAP_VERMILION_CITY' && w.destWarpId === 4)).toBe(true);
  });

  test('Vermilion Pokemon Center 2F preserves cable club NPCs and 2F warp', () => {
    const map = loadVermilionCityPokemonCenter2FMap();

    expect(map.npcs).toHaveLength(4);
    expect(map.warps).toHaveLength(3);
    expect(map.warps[0]).toMatchObject({
      destMap: 'MAP_VERMILION_CITY_POKEMON_CENTER_1F',
      destWarpId: 3
    });
  });

  test('Vermilion exterior warps resolve to all loaded city interiors', () => {
    const city = loadVermilionCityMap();
    const loadedInteriorDestinations = city.warps
      .map((warp) => warp.destMap)
      .filter((destMap) => destMap.startsWith('MAP_VERMILION_CITY_'));
    const expectedInteriors = [
      'MAP_VERMILION_CITY_HOUSE1',
      'MAP_VERMILION_CITY_POKEMON_CENTER_1F',
      'MAP_VERMILION_CITY_POKEMON_FAN_CLUB',
      'MAP_VERMILION_CITY_HOUSE2',
      'MAP_VERMILION_CITY_MART',
      'MAP_VERMILION_CITY_HOUSE3',
      'MAP_VERMILION_CITY_GYM'
    ];

    expect(new Set(loadedInteriorDestinations)).toEqual(new Set(expectedInteriors));
    for (const id of expectedInteriors) {
      expect(loadMapById(id)).not.toBeNull();
    }
  });

  test('all Vermilion interior script ids have registered handlers', () => {
    const scriptIds = new Set<string>();

    for (const { load } of interiorCases) {
      const map = load();
      map.npcs.forEach((npc) => {
        if (npc.scriptId && npc.scriptId !== '0x0') scriptIds.add(npc.scriptId);
      });
      map.triggers.forEach((trigger) => scriptIds.add(trigger.scriptId));
    }

    expect([...scriptIds].filter((scriptId) => !prototypeScriptRegistry[scriptId])).toEqual([]);
  });
});
