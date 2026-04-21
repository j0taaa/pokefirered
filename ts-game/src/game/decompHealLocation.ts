import healLocationsSource from '../../../src/data/heal_locations.json';

export interface CenterRuntimeState {
  vars: Record<string, number>;
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

export const HEAL_LOCATIONS: HealLocation[] = (
  healLocationsSource as HealLocationSourceFile
).heal_locations.map((location) => {
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
