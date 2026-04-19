import { describe, expect, test } from 'vitest';
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadPewterCityGymMap,
  loadPewterCityHouse1Map,
  loadPewterCityHouse2Map,
  loadPewterCityMartMap,
  loadPewterCityMuseum1FMap,
  loadPewterCityMuseum2FMap,
  loadPewterCityPokemonCenter1FMap,
  loadPewterCityPokemonCenter2FMap,
  loadMapById,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import pewterCityGymJson from '../src/world/maps/pewterCityGym.json';
import pewterCityHouse1Json from '../src/world/maps/pewterCityHouse1.json';
import pewterCityHouse2Json from '../src/world/maps/pewterCityHouse2.json';
import pewterCityMartJson from '../src/world/maps/pewterCityMart.json';
import pewterCityMuseum1FJson from '../src/world/maps/pewterCityMuseum1F.json';
import pewterCityMuseum2FJson from '../src/world/maps/pewterCityMuseum2F.json';
import pewterCityPokemonCenter1FJson from '../src/world/maps/pewterCityPokemonCenter1F.json';
import pewterCityPokemonCenter2FJson from '../src/world/maps/pewterCityPokemonCenter2F.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Pewter City Gym', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(pewterCityGymJson).toEqual(JSON.parse(JSON.stringify(exportMap('PewterCity_Gym'))));
  });

  test('loads into the runtime tile map shape', () => {
    const exported = exportMap('PewterCity_Gym');
    const map = loadPewterCityGymMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.tileSize).toBe(exported.tileSize);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.encounterTiles).toEqual(toEncounterTiles(exported.encounterRows));
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.hiddenItems).toEqual(exported.hiddenItems);
    expect(map.warps).toEqual(exported.warps);
  });

  test('has correct indoor metadata', () => {
    const src = pewterCityGymJson as CompactMapSource & { metadata: Record<string, unknown> };
    expect(src.metadata.mapType).toBe('MAP_TYPE_INDOOR');
    expect(src.metadata.music).toBe('MUS_GYM');
    expect(src.metadata.battleScene).toBe('MAP_BATTLE_SCENE_GYM');
  });

  test('has 2 gym statue triggers', () => {
    const map = loadPewterCityGymMap();
    expect(map.triggers).toHaveLength(2);
    expect(map.triggers.every((t) => t.scriptId === 'PewterCity_Gym_EventScript_GymStatue')).toBe(true);
    expect(map.triggers[0]).toMatchObject({ x: 4, y: 12, activation: 'interact' });
    expect(map.triggers[1]).toMatchObject({ x: 8, y: 12, activation: 'interact' });
  });

  test('has 3 exit warps to Pewter City', () => {
    const map = loadPewterCityGymMap();
    expect(map.warps).toHaveLength(3);
    expect(map.warps.every((w) => w.destMap === 'MAP_PEWTER_CITY' && w.destWarpId === 2)).toBe(true);
    expect(map.warps[0]).toMatchObject({ x: 5, y: 14 });
    expect(map.warps[1]).toMatchObject({ x: 6, y: 14 });
    expect(map.warps[2]).toMatchObject({ x: 7, y: 14 });
  });

  test('has Brock, Liam, and Gym Guy NPCs', () => {
    const map = loadPewterCityGymMap();
    expect(map.npcs).toHaveLength(3);
    const [brock, liam, gymGuy] = map.npcs;
    expect(brock).toMatchObject({
      id: 'PewterCity_Gym_ObjectEvent_Brock',
      graphicsId: 'OBJ_EVENT_GFX_BROCK',
      trainerType: 'TRAINER_TYPE_NONE',
      scriptId: 'PewterCity_Gym_EventScript_Brock'
    });
    expect(liam).toMatchObject({
      id: 'PewterCity_Gym_ObjectEvent_Liam',
      graphicsId: 'OBJ_EVENT_GFX_CAMPER',
      trainerType: 'TRAINER_TYPE_NORMAL',
      trainerSightOrBerryTreeId: 4,
      scriptId: 'PewterCity_Gym_EventScript_Liam'
    });
    expect(gymGuy).toMatchObject({
      id: 'PewterCity_Gym_ObjectEvent_GymGuy',
      graphicsId: 'OBJ_EVENT_GFX_GYM_GUY',
      trainerType: 'TRAINER_TYPE_NONE',
      scriptId: 'PewterCity_Gym_EventScript_GymGuy'
    });
  });

  test('compact row validation rejects wrong row count and invalid chars', () => {
    const baseSource = pewterCityGymJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(pewterCityGymJson);
    const map = mapFromCompactSource(compactSource);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
  });
});

describe('Pewter City House 1', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(pewterCityHouse1Json).toEqual(JSON.parse(JSON.stringify(exportMap('PewterCity_House1'))));
  });

  test('loads into the runtime tile map shape', () => {
    const exported = exportMap('PewterCity_House1');
    const map = loadPewterCityHouse1Map();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.warps).toEqual(exported.warps);
  });

  test('has 3 exit warps to Pewter City', () => {
    const map = loadPewterCityHouse1Map();
    expect(map.warps).toHaveLength(3);
    expect(map.warps.every((w) => w.destMap === 'MAP_PEWTER_CITY' && w.destWarpId === 4)).toBe(true);
  });

  test('has Balding Man, Little Boy, and Nidoran NPCs', () => {
    const map = loadPewterCityHouse1Map();
    expect(map.npcs).toHaveLength(3);
    expect(map.npcs[0]).toMatchObject({
      id: 'PewterCity_House1_ObjectEvent_BaldingMan',
      graphicsId: 'OBJ_EVENT_GFX_BALDING_MAN',
      scriptId: 'PewterCity_House1_EventScript_BaldingMan'
    });
    expect(map.npcs[1]).toMatchObject({
      id: 'PewterCity_House1_ObjectEvent_LittleBoy',
      graphicsId: 'OBJ_EVENT_GFX_LITTLE_BOY',
      scriptId: 'PewterCity_House1_EventScript_LittleBoy'
    });
    expect(map.npcs[2]).toMatchObject({
      id: 'LOCALID_PEWTER_HOUSE_NIDORAN',
      graphicsId: 'OBJ_EVENT_GFX_NIDORAN_M',
      scriptId: 'PewterCity_House1_EventScript_Nidoran'
    });
  });

  test('compact row validation rejects wrong row count', () => {
    const baseSource = pewterCityHouse1Json as CompactMapSource & { encounterRows: string[] };
    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);
  });
});

describe('Pewter City House 2', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(pewterCityHouse2Json).toEqual(JSON.parse(JSON.stringify(exportMap('PewterCity_House2'))));
  });

  test('loads into the runtime tile map shape', () => {
    const exported = exportMap('PewterCity_House2');
    const map = loadPewterCityHouse2Map();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.warps).toEqual(exported.warps);
  });

  test('has 3 exit warps to Pewter City', () => {
    const map = loadPewterCityHouse2Map();
    expect(map.warps).toHaveLength(3);
    expect(map.warps.every((w) => w.destMap === 'MAP_PEWTER_CITY' && w.destWarpId === 6)).toBe(true);
  });

  test('has Old Man and Little Boy NPCs', () => {
    const map = loadPewterCityHouse2Map();
    expect(map.npcs).toHaveLength(2);
    expect(map.npcs[0]).toMatchObject({
      id: 'PewterCity_House2_ObjectEvent_OldMan',
      graphicsId: 'OBJ_EVENT_GFX_OLD_MAN_1',
      scriptId: 'PewterCity_House2_EventScript_OldMan'
    });
    expect(map.npcs[1]).toMatchObject({
      id: 'PewterCity_House2_ObjectEvent_LittleBoy',
      graphicsId: 'OBJ_EVENT_GFX_LITTLE_BOY',
      scriptId: 'PewterCity_House2_EventScript_LittleBoy'
    });
  });

  test('compact row validation rejects wrong row count', () => {
    const baseSource = pewterCityHouse2Json as CompactMapSource & { encounterRows: string[] };
    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);
  });
});

describe('Pewter City Mart', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(pewterCityMartJson).toEqual(JSON.parse(JSON.stringify(exportMap('PewterCity_Mart'))));
  });

  test('loads into the runtime tile map shape', () => {
    const exported = exportMap('PewterCity_Mart');
    const map = loadPewterCityMartMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.warps).toEqual(exported.warps);
  });

  test('has 3 exit warps to Pewter City', () => {
    const map = loadPewterCityMartMap();
    expect(map.warps).toHaveLength(3);
    expect(map.warps.every((w) => w.destMap === 'MAP_PEWTER_CITY' && w.destWarpId === 3)).toBe(true);
  });

  test('has Clerk, Youngster, and Boy NPCs', () => {
    const map = loadPewterCityMartMap();
    expect(map.npcs).toHaveLength(3);
    expect(map.npcs[0]).toMatchObject({
      id: 'PewterCity_Mart_ObjectEvent_Youngster',
      graphicsId: 'OBJ_EVENT_GFX_YOUNGSTER',
      scriptId: 'PewterCity_Mart_EventScript_Youngster'
    });
    expect(map.npcs[1]).toMatchObject({
      id: 'PewterCity_Mart_ObjectEvent_Boy',
      graphicsId: 'OBJ_EVENT_GFX_BOY',
      scriptId: 'PewterCity_Mart_EventScript_Boy'
    });
    expect(map.npcs[2]).toMatchObject({
      id: 'PewterCity_Mart_ObjectEvent_Clerk',
      graphicsId: 'OBJ_EVENT_GFX_CLERK',
      scriptId: 'PewterCity_Mart_EventScript_Clerk'
    });
  });

  test('compact row validation rejects wrong row count', () => {
    const baseSource = pewterCityMartJson as CompactMapSource & { encounterRows: string[] };
    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);
  });
});

describe('Pewter City Museum 1F', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(pewterCityMuseum1FJson).toEqual(JSON.parse(JSON.stringify(exportMap('PewterCity_Museum_1F'))));
  });

  test('loads into the runtime tile map shape', () => {
    const exported = exportMap('PewterCity_Museum_1F');
    const map = loadPewterCityMuseum1FMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.warps).toEqual(exported.warps);
  });

  test('has correct indoor metadata', () => {
    const src = pewterCityMuseum1FJson as CompactMapSource & { metadata: Record<string, unknown> };
    expect(src.metadata.mapType).toBe('MAP_TYPE_INDOOR');
    expect(src.metadata.music).toBe('MUS_PEWTER');
  });

  test('has 7 triggers (3 entrance step + 2 fossil + 2 journal)', () => {
    const map = loadPewterCityMuseum1FMap();
    expect(map.triggers).toHaveLength(7);
    const stepTriggers = map.triggers.filter((t) => t.activation === 'step');
    expect(stepTriggers).toHaveLength(3);
    expect(stepTriggers.every((t) => t.conditionVar === 'VAR_MAP_SCENE_PEWTER_CITY_MUSEUM_1F')).toBe(true);
    const fossilTriggers = map.triggers.filter((t) =>
      t.scriptId.includes('Fossil') || t.scriptId.includes('Aerodactyl') || t.scriptId.includes('Kabutops'));
    expect(fossilTriggers).toHaveLength(2);
  });

  test('has 6 warps (3 front door + 2 back door + 1 to 2F)', () => {
    const map = loadPewterCityMuseum1FMap();
    expect(map.warps).toHaveLength(6);
    const pewterExits = map.warps.filter((w) => w.destMap === 'MAP_PEWTER_CITY');
    expect(pewterExits).toHaveLength(5);
    const to2F = map.warps.filter((w) => w.destMap === 'MAP_PEWTER_CITY_MUSEUM_2F');
    expect(to2F).toHaveLength(1);
    expect(to2F[0]).toMatchObject({ x: 8, y: 8, destWarpId: 0 });
  });

  test('has 6 NPCs including Old Amber with FLAG_HIDE_OLD_AMBER', () => {
    const map = loadPewterCityMuseum1FMap();
    expect(map.npcs).toHaveLength(6);
    expect(map.npcs[0]).toMatchObject({
      id: 'LOCALID_MUSEUM_SCIENTIST1',
      graphicsId: 'OBJ_EVENT_GFX_WORKER_M',
      scriptId: 'PewterCity_Museum_1F_EventScript_Scientist1'
    });
    expect(map.npcs[2]).toMatchObject({
      id: 'PewterCity_Museum_1F_ObjectEvent_OldAmberScientist',
      graphicsId: 'OBJ_EVENT_GFX_SCIENTIST',
      scriptId: 'PewterCity_Museum_1F_EventScript_OldAmberScientist'
    });
    expect(map.npcs[3]).toMatchObject({
      id: 'LOCALID_OLD_AMBER',
      graphicsId: 'OBJ_EVENT_GFX_OLD_AMBER',
      flag: 'FLAG_HIDE_OLD_AMBER'
    });
    expect(map.npcs[5]).toMatchObject({
      id: 'PewterCity_Museum_1F_ObjectEvent_SeismicTossTutor',
      scriptId: 'PewterCity_Museum_1F_EventScript_SeismicTossTutor'
    });
  });

  test('compact row validation rejects wrong row count', () => {
    const baseSource = pewterCityMuseum1FJson as CompactMapSource & { encounterRows: string[] };
    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);
  });
});

describe('Pewter City Museum 2F', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(pewterCityMuseum2FJson).toEqual(JSON.parse(JSON.stringify(exportMap('PewterCity_Museum_2F'))));
  });

  test('loads into the runtime tile map shape', () => {
    const exported = exportMap('PewterCity_Museum_2F');
    const map = loadPewterCityMuseum2FMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.warps).toEqual(exported.warps);
  });

  test('has 8 triggers (2 Moon Stone + 6 Space Shuttle)', () => {
    const map = loadPewterCityMuseum2FMap();
    expect(map.triggers).toHaveLength(8);
    const moonStone = map.triggers.filter((t) => t.scriptId.includes('MoonStone'));
    expect(moonStone).toHaveLength(2);
    const spaceShuttle = map.triggers.filter((t) => t.scriptId.includes('SpaceShuttle'));
    expect(spaceShuttle).toHaveLength(6);
  });

  test('has 1 warp to Museum 1F', () => {
    const map = loadPewterCityMuseum2FMap();
    expect(map.warps).toHaveLength(1);
    expect(map.warps[0]).toMatchObject({
      x: 11, y: 8, destMap: 'MAP_PEWTER_CITY_MUSEUM_1F', destWarpId: 5
    });
  });

  test('has 5 NPCs (Scientist, Man, Old Man, Little Girl, Balding Man)', () => {
    const map = loadPewterCityMuseum2FMap();
    expect(map.npcs).toHaveLength(5);
    expect(map.npcs[0]).toMatchObject({
      id: 'PewterCity_Museum_2F_ObjectEvent_Scientist',
      scriptId: 'PewterCity_Museum_2F_EventScript_Scientist'
    });
    expect(map.npcs[1]).toMatchObject({
      id: 'PewterCity_Museum_2F_ObjectEvent_Man',
      movementType: 'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT',
      movementRangeX: 3
    });
    expect(map.npcs[2]).toMatchObject({
      id: 'PewterCity_Museum_2F_ObjectEvent_OldMan',
      graphicsId: 'OBJ_EVENT_GFX_OLD_MAN_2',
      scriptId: 'PewterCity_Museum_2F_EventScript_OldMan'
    });
  });

  test('compact row validation rejects wrong row count', () => {
    const baseSource = pewterCityMuseum2FJson as CompactMapSource & { encounterRows: string[] };
    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);
  });
});

describe('Pewter City Pokemon Center 1F', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(pewterCityPokemonCenter1FJson).toEqual(JSON.parse(JSON.stringify(exportMap('PewterCity_PokemonCenter_1F'))));
  });

  test('loads into the runtime tile map shape', () => {
    const exported = exportMap('PewterCity_PokemonCenter_1F');
    const map = loadPewterCityPokemonCenter1FMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.warps).toEqual(exported.warps);
  });

  test('has 4 warps (3 to Pewter City + 1 to 2F)', () => {
    const map = loadPewterCityPokemonCenter1FMap();
    expect(map.warps).toHaveLength(4);
    const pewterExits = map.warps.filter((w) => w.destMap === 'MAP_PEWTER_CITY');
    expect(pewterExits).toHaveLength(3);
    expect(pewterExits.every((w) => w.destWarpId === 5)).toBe(true);
    const to2F = map.warps.filter((w) => w.destMap === 'MAP_PEWTER_CITY_POKEMON_CENTER_2F');
    expect(to2F).toHaveLength(1);
    expect(to2F[0]).toMatchObject({ x: 1, y: 6, destWarpId: 0 });
  });

  test('has 7 NPCs including Nurse and Jigglypuff', () => {
    const map = loadPewterCityPokemonCenter1FMap();
    expect(map.npcs).toHaveLength(7);
    const nurse = map.npcs.find((n) => n.graphicsId === 'OBJ_EVENT_GFX_NURSE');
    expect(nurse).toMatchObject({
      id: 'LOCALID_PEWTER_NURSE',
      scriptId: 'PewterCity_PokemonCenter_1F_EventScript_Nurse'
    });
    const jigglypuff = map.npcs.find((n) => n.graphicsId === 'OBJ_EVENT_GFX_JIGGLYPUFF');
    expect(jigglypuff).toMatchObject({
      id: 'PewterCity_PokemonCenter_1F_ObjectEvent_Jigglypuff',
      scriptId: 'PewterCity_PokemonCenter_1F_EventScript_Jigglypuff'
    });
  });

  test('compact row validation rejects wrong row count', () => {
    const baseSource = pewterCityPokemonCenter1FJson as CompactMapSource & { encounterRows: string[] };
    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);
  });
});

describe('Pewter City Pokemon Center 2F', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(pewterCityPokemonCenter2FJson).toEqual(JSON.parse(JSON.stringify(exportMap('PewterCity_PokemonCenter_2F'))));
  });

  test('loads into the runtime tile map shape', () => {
    const exported = exportMap('PewterCity_PokemonCenter_2F');
    const map = loadPewterCityPokemonCenter2FMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.warps).toEqual(exported.warps);
  });

  test('has 3 warps (1 to 1F + Union Room + Trade Center)', () => {
    const map = loadPewterCityPokemonCenter2FMap();
    expect(map.warps).toHaveLength(3);
    expect(map.warps[0]).toMatchObject({
      x: 1, y: 6, destMap: 'MAP_PEWTER_CITY_POKEMON_CENTER_1F', destWarpId: 3
    });
    expect(map.warps[1]).toMatchObject({
      destMap: 'MAP_UNION_ROOM', destWarpId: 0
    });
    expect(map.warps[2]).toMatchObject({
      destMap: 'MAP_TRADE_CENTER', destWarpId: 0
    });
  });

  test('has 4 NPCs (3 receptionists + Mystery Gift man)', () => {
    const map = loadPewterCityPokemonCenter2FMap();
    expect(map.npcs).toHaveLength(4);
    const mysteryGift = map.npcs.find((n) => n.flag === 'FLAG_HIDE_MG_DELIVERYMEN');
    expect(mysteryGift).toMatchObject({
      id: 'CableClub_ObjectEvent_MysteryGiftMan',
      graphicsId: 'OBJ_EVENT_GFX_MG_DELIVERYMAN'
    });
  });

  test('compact row validation rejects wrong row count', () => {
    const baseSource = pewterCityPokemonCenter2FJson as CompactMapSource & { encounterRows: string[] };
    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);
  });
});

describe('Pewter interior loadMapById coverage', () => {
  const cases: Array<[string, string]> = [
    ['MAP_PEWTER_CITY_GYM', 'PewterCity_Gym'],
    ['MAP_PEWTER_CITY_HOUSE1', 'PewterCity_House1'],
    ['MAP_PEWTER_CITY_HOUSE2', 'PewterCity_House2'],
    ['MAP_PEWTER_CITY_MART', 'PewterCity_Mart'],
    ['MAP_PEWTER_CITY_MUSEUM_1F', 'PewterCity_Museum_1F'],
    ['MAP_PEWTER_CITY_MUSEUM_2F', 'PewterCity_Museum_2F'],
    ['MAP_PEWTER_CITY_POKEMON_CENTER_1F', 'PewterCity_PokemonCenter_1F'],
    ['MAP_PEWTER_CITY_POKEMON_CENTER_2F', 'PewterCity_PokemonCenter_2F']
  ];

  test.each(cases)('loadMapById resolves %s', (mapId, mapName) => {
    const map = loadMapById(mapId);
    expect(map).not.toBeNull();
    expect(map!.id).toBe(mapId);

    const exported = exportMap(mapName);
    expect(map!.width).toBe(exported.width);
    expect(map!.height).toBe(exported.height);
  });
});
