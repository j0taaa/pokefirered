import { describe, expect, test } from 'vitest';
import {
  CHAMPION_SAVEWARP,
  POKECENTER_SAVEWARP,
  POSTGAME_GCN_LINK_FLAGS_MASK,
  UNLOCKED_POKEDEX_GCN_LINK_FLAGS_MASK,
  isMapPokeCenter,
  setPostgameFlags,
  setUnlockedPokedexFlags,
  trySetMapSaveWarpStatus
} from '../src/game/decompSaveLocation';

describe('decomp save_location', () => {
  test('recognizes Pokémon Center save-warp maps from the decomp list', () => {
    expect(isMapPokeCenter('MAP_VIRIDIAN_CITY_POKEMON_CENTER_1F')).toBe(true);
    expect(isMapPokeCenter('MAP_VIRIDIAN_CITY')).toBe(false);
    expect(isMapPokeCenter('MAP_PALLET_TOWN_PLAYERS_HOUSE_1F')).toBe(false);
  });

  test('TrySetMapSaveWarpStatus toggles poke center save warp bit', () => {
    const runtime = { specialSaveWarpFlags: 0xff, gcnLinkFlags: 0 };
    trySetMapSaveWarpStatus(runtime, 'MAP_CERULEAN_CITY');
    expect(runtime.specialSaveWarpFlags & POKECENTER_SAVEWARP).toBe(0);

    trySetMapSaveWarpStatus(runtime, 'MAP_CERULEAN_CITY_POKEMON_CENTER_1F');
    expect(runtime.specialSaveWarpFlags & POKECENTER_SAVEWARP).toBe(POKECENTER_SAVEWARP);
  });

  test('SetUnlockedPokedexFlags and SetPostgameFlags match the C bitmasks', () => {
    const runtime = { specialSaveWarpFlags: 0, gcnLinkFlags: 0 };
    setUnlockedPokedexFlags(runtime);
    expect(runtime.gcnLinkFlags).toBe(UNLOCKED_POKEDEX_GCN_LINK_FLAGS_MASK);

    setPostgameFlags(runtime);
    expect(runtime.specialSaveWarpFlags & CHAMPION_SAVEWARP).toBe(CHAMPION_SAVEWARP);
    expect(runtime.gcnLinkFlags & POSTGAME_GCN_LINK_FLAGS_MASK).toBe(POSTGAME_GCN_LINK_FLAGS_MASK);
  });
});
