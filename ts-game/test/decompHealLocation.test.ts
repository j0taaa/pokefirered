import { describe, expect, test } from 'vitest';
import {
  GetHealLocation,
  GetHealLocationIndexFromMapGroupAndNum,
  GetHealLocationPointerFromMapGroupAndNum,
  getHealLocationIndexByOverworldMap,
  getHealLocationById,
  HEAL_LOCATIONS,
  HEAL_LOCATIONS_SOURCE,
  resolveWhiteoutRespawnWarp,
  SetWhiteoutRespawnHealerNpcAsLastTalked,
  SetWhiteoutRespawnWarpAndHealerNpc,
  setRespawn
} from '../src/game/decompHealLocation';

describe('decomp heal location parity', () => {
  test('loads heal locations with decomp respawn overrides', () => {
    expect(HEAL_LOCATIONS_SOURCE.heal_locations).toHaveLength(20);
    expect(HEAL_LOCATIONS).toHaveLength(20);
    expect(HEAL_LOCATIONS_SOURCE.heal_locations[0]).toEqual({
      id: 'HEAL_LOCATION_PALLET_TOWN',
      map: 'MAP_PALLET_TOWN',
      x: 6,
      y: 8,
      respawn_map: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F',
      respawn_npc: 'LOCALID_MOM'
    });
    expect(getHealLocationById('HEAL_LOCATION_PALLET_TOWN')).toMatchObject({
      respawnMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F',
      respawnX: 8,
      respawnY: 5
    });
    expect(getHealLocationById('HEAL_LOCATION_ONE_ISLAND')).toMatchObject({
      respawnMap: 'MAP_ONE_ISLAND_POKEMON_CENTER_1F',
      respawnX: 5,
      respawnY: 4
    });
    expect(getHealLocationById('HEAL_LOCATION_INDIGO_PLATEAU')).toMatchObject({
      respawnMap: 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F',
      respawnX: 13,
      respawnY: 12
    });
    expect(HEAL_LOCATIONS.at(-1)).toMatchObject({
      id: 'HEAL_LOCATION_SIX_ISLAND',
      map: 'MAP_SIX_ISLAND',
      x: 11,
      y: 12,
      respawnMap: 'MAP_SIX_ISLAND_POKEMON_CENTER_1F',
      respawnNpc: 'LOCALID_SIX_ISLAND_NURSE'
    });
  });

  test('maps overworld maps to the decomp heal location index space', () => {
    expect(getHealLocationIndexByOverworldMap('MAP_PALLET_TOWN')).toBe(1);
    expect(getHealLocationIndexByOverworldMap('MAP_VIRIDIAN_CITY')).toBe(2);
    expect(getHealLocationIndexByOverworldMap('MAP_UNKNOWN')).toBe(0);
    expect(GetHealLocationIndexFromMapGroupAndNum('MAP_PALLET_TOWN', 'MAP_PALLET_TOWN')).toBe(1);
    expect(GetHealLocationIndexFromMapGroupAndNum('MAP_UNKNOWN', 'MAP_UNKNOWN')).toBe(0);
    expect(GetHealLocationPointerFromMapGroupAndNum('MAP_PALLET_TOWN', 'MAP_PALLET_TOWN')).toEqual(
      GetHealLocation(1)
    );
    expect(GetHealLocation(0)).toBeNull();
    expect(GetHealLocation(21)).toBeNull();
  });

  test('resolves the whiteout respawn warp from the saved heal location', () => {
    const runtime = { vars: {} as Record<string, number> };

    setRespawn(runtime, 'HEAL_LOCATION_INDIGO_PLATEAU');

    expect(resolveWhiteoutRespawnWarp(runtime)).toEqual({
      mapId: 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F',
      healerNpcId: 'LOCALID_LEAGUE_NURSE',
      x: 13,
      y: 12
    });
  });

  test('SetWhiteoutRespawnWarpAndHealerNpc follows the saved heal location tables', () => {
    const runtime = {
      vars: {},
      lastHealLocation: { mapGroup: 'MAP_INDIGO_PLATEAU_EXTERIOR', mapNum: 'MAP_INDIGO_PLATEAU_EXTERIOR' },
      specialVarLastTalked: undefined as string | number | undefined
    };
    const warp = { mapGroup: '', mapNum: '', warpId: 0, x: 0, y: 0 };

    SetWhiteoutRespawnWarpAndHealerNpc(runtime, warp);

    expect(warp).toEqual({
      mapGroup: 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F',
      mapNum: 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F',
      warpId: -1,
      x: 13,
      y: 12
    });
    expect(runtime.specialVarLastTalked).toBe('LOCALID_LEAGUE_NURSE');

    SetWhiteoutRespawnHealerNpcAsLastTalked(runtime, 1);
    expect(runtime.specialVarLastTalked).toBe('LOCALID_MOM');
  });

  test('SetWhiteoutRespawnWarpAndHealerNpc keeps the Trainer Tower branch exact', () => {
    const runtime = {
      vars: { VAR_MAP_SCENE_TRAINER_TOWER: 1 },
      trainerTower: [{ spokeToOwner: false }],
      towerChallengeId: 0,
      specialVarLastTalked: undefined as string | number | undefined
    };
    const warp = { mapGroup: '', mapNum: '', warpId: 0, x: 0, y: 0 };

    SetWhiteoutRespawnWarpAndHealerNpc(runtime, warp);

    expect(runtime.vars.VAR_MAP_SCENE_TRAINER_TOWER).toBe(0);
    expect(runtime.specialVarLastTalked).toBe(1);
    expect(warp).toEqual({
      mapGroup: 'MAP_TRAINER_TOWER_LOBBY',
      mapNum: 'MAP_TRAINER_TOWER_LOBBY',
      warpId: 0xff,
      x: 4,
      y: 11
    });
  });
});
