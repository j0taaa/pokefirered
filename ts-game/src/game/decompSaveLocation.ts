export interface SaveLocationRuntimeState {
  specialSaveWarpFlags: number;
  gcnLinkFlags: number;
  currentMapId?: string;
}

export const CONTINUE_GAME_WARP = 1 << 0;
export const POKECENTER_SAVEWARP = 1 << 1;
export const LOBBY_SAVEWARP = 1 << 2;
export const UNK_SPECIAL_SAVE_WARP_FLAG_3 = 1 << 3;
export const CHAMPION_SAVEWARP = 1 << 7;

export const UNLOCKED_POKEDEX_GCN_LINK_FLAGS_MASK = (1 << 0) | (1 << 4) | (1 << 5);
export const POSTGAME_GCN_LINK_FLAGS_MASK = (1 << 1) | (1 << 2) | (1 << 3) | (1 << 15);

const SAVE_LOCATION_POKE_CENTER_LIST = [
  'MAP_VIRIDIAN_CITY_POKEMON_CENTER_1F',
  'MAP_VIRIDIAN_CITY_POKEMON_CENTER_2F',
  'MAP_PEWTER_CITY_POKEMON_CENTER_1F',
  'MAP_PEWTER_CITY_POKEMON_CENTER_2F',
  'MAP_CERULEAN_CITY_POKEMON_CENTER_1F',
  'MAP_CERULEAN_CITY_POKEMON_CENTER_2F',
  'MAP_LAVENDER_TOWN_POKEMON_CENTER_1F',
  'MAP_LAVENDER_TOWN_POKEMON_CENTER_2F',
  'MAP_VERMILION_CITY_POKEMON_CENTER_1F',
  'MAP_VERMILION_CITY_POKEMON_CENTER_2F',
  'MAP_CELADON_CITY_POKEMON_CENTER_1F',
  'MAP_CELADON_CITY_POKEMON_CENTER_2F',
  'MAP_FUCHSIA_CITY_POKEMON_CENTER_1F',
  'MAP_FUCHSIA_CITY_POKEMON_CENTER_2F',
  'MAP_CINNABAR_ISLAND_POKEMON_CENTER_1F',
  'MAP_CINNABAR_ISLAND_POKEMON_CENTER_2F',
  'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F',
  'MAP_INDIGO_PLATEAU_POKEMON_CENTER_2F',
  'MAP_SAFFRON_CITY_POKEMON_CENTER_1F',
  'MAP_SAFFRON_CITY_POKEMON_CENTER_2F',
  'MAP_ROUTE4_POKEMON_CENTER_1F',
  'MAP_ROUTE4_POKEMON_CENTER_2F',
  'MAP_ROUTE10_POKEMON_CENTER_1F',
  'MAP_ROUTE10_POKEMON_CENTER_2F',
  'MAP_ONE_ISLAND_POKEMON_CENTER_1F',
  'MAP_ONE_ISLAND_POKEMON_CENTER_2F',
  'MAP_TWO_ISLAND_POKEMON_CENTER_1F',
  'MAP_TWO_ISLAND_POKEMON_CENTER_2F',
  'MAP_THREE_ISLAND_POKEMON_CENTER_1F',
  'MAP_THREE_ISLAND_POKEMON_CENTER_2F',
  'MAP_FOUR_ISLAND_POKEMON_CENTER_1F',
  'MAP_FOUR_ISLAND_POKEMON_CENTER_2F',
  'MAP_FIVE_ISLAND_POKEMON_CENTER_1F',
  'MAP_FIVE_ISLAND_POKEMON_CENTER_2F',
  'MAP_SEVEN_ISLAND_POKEMON_CENTER_1F',
  'MAP_SEVEN_ISLAND_POKEMON_CENTER_2F',
  'MAP_SIX_ISLAND_POKEMON_CENTER_1F',
  'MAP_SIX_ISLAND_POKEMON_CENTER_2F',
  'MAP_BATTLE_COLOSSEUM_2P',
  'MAP_TRADE_CENTER',
  'MAP_BATTLE_COLOSSEUM_4P',
  'MAP_UNION_ROOM'
] as const;

const SAVE_LOCATION_RELOAD_LOC_LIST: readonly string[] = [];
const EMPTY_MAP_LIST: readonly string[] = [];

const isMapInLocationList = (mapId: string, list: readonly string[]): boolean => list.includes(mapId);

const updateBit = (value: number, mask: number, enabled: boolean): number =>
  enabled ? value | mask : value & ~mask;

export const isMapPokeCenter = (mapId: string): boolean =>
  isMapInLocationList(mapId, SAVE_LOCATION_POKE_CENTER_LIST);

export const trySetMapSaveWarpStatus = (
  runtime: SaveLocationRuntimeState,
  mapId: string
): void => {
  let nextFlags = runtime.specialSaveWarpFlags;
  nextFlags = updateBit(nextFlags, POKECENTER_SAVEWARP, isMapInLocationList(mapId, SAVE_LOCATION_POKE_CENTER_LIST));
  nextFlags = updateBit(nextFlags, LOBBY_SAVEWARP, isMapInLocationList(mapId, SAVE_LOCATION_RELOAD_LOC_LIST));
  nextFlags = updateBit(nextFlags, UNK_SPECIAL_SAVE_WARP_FLAG_3, isMapInLocationList(mapId, EMPTY_MAP_LIST));
  runtime.specialSaveWarpFlags = nextFlags;
};

export const setUnlockedPokedexFlags = (runtime: SaveLocationRuntimeState): void => {
  runtime.gcnLinkFlags |= UNLOCKED_POKEDEX_GCN_LINK_FLAGS_MASK;
};

export const setPostgameFlags = (runtime: SaveLocationRuntimeState): void => {
  runtime.specialSaveWarpFlags |= CHAMPION_SAVEWARP;
  runtime.gcnLinkFlags |= POSTGAME_GCN_LINK_FLAGS_MASK;
};

export function IsCurMapInLocationList(
  runtime: SaveLocationRuntimeState,
  list: readonly string[]
): boolean {
  return isMapInLocationList(runtime.currentMapId ?? 'MAP_UNDEFINED', list);
}

export function IsCurMapPokeCenter(runtime: SaveLocationRuntimeState): boolean {
  return IsCurMapInLocationList(runtime, SAVE_LOCATION_POKE_CENTER_LIST);
}

export function IsCurMapReloadLocation(runtime: SaveLocationRuntimeState): boolean {
  return IsCurMapInLocationList(runtime, SAVE_LOCATION_RELOAD_LOC_LIST);
}

export function IsCurMapInEmptyList(runtime: SaveLocationRuntimeState): boolean {
  return IsCurMapInLocationList(runtime, EMPTY_MAP_LIST);
}

export function TrySetPokeCenterWarpStatus(runtime: SaveLocationRuntimeState): void {
  runtime.specialSaveWarpFlags = updateBit(runtime.specialSaveWarpFlags, POKECENTER_SAVEWARP, IsCurMapPokeCenter(runtime));
}

export function TrySetReloadWarpStatus(runtime: SaveLocationRuntimeState): void {
  runtime.specialSaveWarpFlags = updateBit(runtime.specialSaveWarpFlags, LOBBY_SAVEWARP, IsCurMapReloadLocation(runtime));
}

export function TrySetUnknownWarpStatus(runtime: SaveLocationRuntimeState): void {
  runtime.specialSaveWarpFlags = updateBit(runtime.specialSaveWarpFlags, UNK_SPECIAL_SAVE_WARP_FLAG_3, IsCurMapInEmptyList(runtime));
}

export function TrySetMapSaveWarpStatus(runtime: SaveLocationRuntimeState): void {
  TrySetPokeCenterWarpStatus(runtime);
  TrySetReloadWarpStatus(runtime);
  TrySetUnknownWarpStatus(runtime);
}

export function SetUnlockedPokedexFlags(runtime: SaveLocationRuntimeState): void {
  setUnlockedPokedexFlags(runtime);
}

export function SetPostgameFlags(runtime: SaveLocationRuntimeState): void {
  setPostgameFlags(runtime);
}
