import healLocationsSource from '../../../src/data/heal_locations.json';
import {
  sHealLocations,
  sWhiteoutRespawnHealCenterMapIdxs,
  sWhiteoutRespawnHealerNpcIds,
  type HealLocation as CHealLocation,
  type WhiteoutRespawnHealCenterMap
} from '../data/decompHealLocations';

export interface CenterRuntimeState {
  vars: Record<string, number>;
  lastHealLocation?: { mapGroup: string | number; mapNum: string | number };
  specialVarLastTalked?: string | number;
  trainerTower?: Array<{ spokeToOwner: boolean }>;
  towerChallengeId?: number;
}

export interface HealLocation {
  id: string;
  map: string;
  x: number;
  y: number;
  respawnMap: string;
  respawnNpc: string;
  respawnX: number;
  respawnY: number;
}

interface HealLocationSourceRow {
  id: string;
  map: string;
  x: number;
  y: number;
  respawn_map: string;
  respawn_npc: string;
}

interface HealLocationSourceFile {
  heal_locations: HealLocationSourceRow[];
}

export const HEAL_LOCATIONS_SOURCE = healLocationsSource as HealLocationSourceFile;

const RESPAWN_VAR = 'lastHealLocationId';

const DEFAULT_RESPAWN_POSITION = { x: 7, y: 4 } as const;
const RESPAWN_POSITION_OVERRIDES: Record<string, { x: number; y: number }> = {
  MAP_PALLET_TOWN_PLAYERS_HOUSE_1F: { x: 8, y: 5 },
  MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F: { x: 13, y: 12 },
  MAP_ONE_ISLAND_POKEMON_CENTER_1F: { x: 5, y: 4 },
  MAP_TRAINER_TOWER_LOBBY: { x: 4, y: 11 }
};

const getRespawnPosition = (respawnMap: string): { x: number; y: number } =>
  RESPAWN_POSITION_OVERRIDES[respawnMap] ?? DEFAULT_RESPAWN_POSITION;

export const HEAL_LOCATIONS: HealLocation[] = HEAL_LOCATIONS_SOURCE.heal_locations.map((location) => {
  const respawnPosition = getRespawnPosition(location.respawn_map);
  return {
    id: location.id,
    map: location.map,
    x: location.x,
    y: location.y,
    respawnMap: location.respawn_map,
    respawnNpc: location.respawn_npc,
    respawnX: respawnPosition.x,
    respawnY: respawnPosition.y
  };
});

export const getHealLocationById = (id: string): HealLocation | undefined =>
  HEAL_LOCATIONS.find((location) => location.id === id);

export const getHealLocationForMap = (centerMapId: string): HealLocation | undefined =>
  HEAL_LOCATIONS.find((location) => location.respawnMap === centerMapId);

export const getHealLocationForOverworldMap = (mapId: string): HealLocation | undefined =>
  HEAL_LOCATIONS.find((location) => location.map === mapId);

export const getHealLocationIndexByOverworldMap = (mapId: string): number => {
  const index = HEAL_LOCATIONS.findIndex((location) => location.map === mapId);
  return index >= 0 ? index + 1 : 0;
};

export function GetHealLocationIndexFromMapGroupAndNum(
  mapGroup: string | number,
  mapNum: string | number
): number {
  const index = sHealLocations.findIndex(
    (location) => location.mapGroup === mapGroup && location.mapNum === mapNum
  );
  return index >= 0 ? index + 1 : 0;
}

export function GetHealLocationPointerFromMapGroupAndNum(
  mapGroup: string | number,
  mapNum: string | number
): CHealLocation | null {
  const i = GetHealLocationIndexFromMapGroupAndNum(mapGroup, mapNum);
  if (i === 0) {
    return null;
  }

  return sHealLocations[i - 1] ?? null;
}

export function GetHealLocation(idx: number): CHealLocation | null {
  if (idx === 0) {
    return null;
  }
  if (idx > sHealLocations.length) {
    return null;
  }
  return sHealLocations[idx - 1] ?? null;
}

export const getHealLocationIdForCenterMap = (centerMapId: string): string | undefined =>
  getHealLocationForMap(centerMapId)?.id;

export const setRespawn = (runtime: CenterRuntimeState, healLocationId: string): void => {
  const location = getHealLocationById(healLocationId);
  if (location) {
    runtime.vars[RESPAWN_VAR] = HEAL_LOCATIONS.indexOf(location);
  }
};

export const getRespawnLocation = (runtime: CenterRuntimeState): HealLocation | undefined => {
  const index = runtime.vars[RESPAWN_VAR];
  if (typeof index === 'number' && index >= 0 && index < HEAL_LOCATIONS.length) {
    return HEAL_LOCATIONS[index];
  }
  return HEAL_LOCATIONS[0];
};

export interface WhiteoutRespawnWarp {
  mapId: string;
  healerNpcId: string;
  x: number;
  y: number;
}

export interface CWhiteoutRespawnWarp {
  mapGroup: string | number;
  mapNum: string | number;
  warpId: number;
  x: number;
  y: number;
}

const WARP_ID_NONE = -1;
const VAR_MAP_SCENE_TRAINER_TOWER = 'VAR_MAP_SCENE_TRAINER_TOWER';
const MAP_TRAINER_TOWER_LOBBY = 'MAP_TRAINER_TOWER_LOBBY';

const setWhiteoutWarpCoords = (
  runtime: CenterRuntimeState,
  warp: CWhiteoutRespawnWarp,
  respawn: WhiteoutRespawnHealCenterMap
): void => {
  if (respawn.mapGroup === 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F' && respawn.mapNum === 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F') {
    warp.x = 8;
    warp.y = 5;
  } else if (
    respawn.mapGroup === 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F' &&
    respawn.mapNum === 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F'
  ) {
    warp.x = 13;
    warp.y = 12;
  } else if (
    respawn.mapGroup === 'MAP_ONE_ISLAND_POKEMON_CENTER_1F' &&
    respawn.mapNum === 'MAP_ONE_ISLAND_POKEMON_CENTER_1F'
  ) {
    warp.x = 5;
    warp.y = 4;
  } else if (respawn.mapGroup === MAP_TRAINER_TOWER_LOBBY && respawn.mapNum === MAP_TRAINER_TOWER_LOBBY) {
    warp.x = 4;
    warp.y = 11;
    runtime.vars[VAR_MAP_SCENE_TRAINER_TOWER] = 0;
  } else {
    warp.x = 7;
    warp.y = 4;
  }
};

export function SetWhiteoutRespawnHealerNpcAsLastTalked(
  runtime: CenterRuntimeState,
  healLocationIdx: number
): void {
  runtime.specialVarLastTalked = sWhiteoutRespawnHealerNpcIds[healLocationIdx - 1]?.localId;
}

export function SetWhiteoutRespawnWarpAndHealerNpc(
  runtime: CenterRuntimeState,
  warp: CWhiteoutRespawnWarp
): void {
  if (runtime.vars[VAR_MAP_SCENE_TRAINER_TOWER] === 1) {
    const challenge = runtime.trainerTower?.[runtime.towerChallengeId ?? 0];
    if (!challenge?.spokeToOwner) {
      runtime.vars[VAR_MAP_SCENE_TRAINER_TOWER] = 0;
    }
    runtime.specialVarLastTalked = 1;
    warp.x = 4;
    warp.y = 11;
    warp.mapGroup = MAP_TRAINER_TOWER_LOBBY;
    warp.mapNum = MAP_TRAINER_TOWER_LOBBY;
    warp.warpId = 0xff;
  } else {
    const lastHealLocation = runtime.lastHealLocation;
    const healLocationIdx = lastHealLocation
      ? GetHealLocationIndexFromMapGroupAndNum(lastHealLocation.mapGroup, lastHealLocation.mapNum)
      : (runtime.vars[RESPAWN_VAR] ?? 0) + 1;
    const respawn = sWhiteoutRespawnHealCenterMapIdxs[healLocationIdx - 1];
    if (!respawn) {
      return;
    }

    warp.mapGroup = respawn.mapGroup;
    warp.mapNum = respawn.mapNum;
    warp.warpId = WARP_ID_NONE;
    setWhiteoutWarpCoords(runtime, warp, respawn);
    SetWhiteoutRespawnHealerNpcAsLastTalked(runtime, healLocationIdx);
  }
}

export const resolveWhiteoutRespawnWarp = (runtime: CenterRuntimeState): WhiteoutRespawnWarp | null => {
  const location = getRespawnLocation(runtime);
  if (!location) {
    return null;
  }

  return {
    mapId: location.respawnMap,
    healerNpcId: location.respawnNpc,
    x: location.respawnX,
    y: location.respawnY
  };
};
