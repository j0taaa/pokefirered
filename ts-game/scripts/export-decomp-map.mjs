import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MAPGRID_COLLISION_MASK = 0x0c00;
const MAPGRID_COLLISION_SHIFT = 10;
const MAPGRID_METATILE_ID_MASK = 0x03ff;
const NUM_METATILES_IN_PRIMARY = 0x200;
const METATILE_ATTRIBUTE_ENCOUNTER_TYPE_MASK = 0x07000000;
const METATILE_ATTRIBUTE_ENCOUNTER_TYPE_SHIFT = 24;
const METATILE_ATTRIBUTE_BEHAVIOR_MASK = 0x000001ff;
const METATILE_ATTRIBUTE_LAYER_TYPE_MASK = 0x60000000;
const METATILE_ATTRIBUTE_LAYER_TYPE_SHIFT = 29;

const TILE_ENCOUNTER_LAND = 1;
const TILE_ENCOUNTER_WATER = 2;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');

const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));

const readBinary = (relativePath) =>
  fs.readFileSync(path.join(repoRoot, relativePath));

const readWildEncounters = () =>
  readJson('src/data/wild_encounters.json');

let mapFolderIndex;

const tilesetFolderName = (tilesetName) =>
  tilesetName
    .replace(/^gTileset_/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-zA-Z])(\d)/g, '$1_$2')
    .toLowerCase();

const tilesetAttributePath = (tilesetName) => {
  const snakeName = tilesetFolderName(tilesetName);

  const primaryPath = `data/tilesets/primary/${snakeName}/metatile_attributes.bin`;
  if (fs.existsSync(path.join(repoRoot, primaryPath))) {
    return primaryPath;
  }

  return `data/tilesets/secondary/${snakeName}/metatile_attributes.bin`;
};

const readMetatileAttributes = (primaryAttributes, secondaryAttributes, metatileId) => {
  const attributes = metatileId < NUM_METATILES_IN_PRIMARY ? primaryAttributes : secondaryAttributes;
  const index = metatileId < NUM_METATILES_IN_PRIMARY
    ? metatileId
    : metatileId - NUM_METATILES_IN_PRIMARY;
  const offset = index * 4;

  return offset + 4 <= attributes.length ? attributes.readUInt32LE(offset) : 0;
};

const toEncounterMarker = (attributes) => {
  const encounterType = (attributes & METATILE_ATTRIBUTE_ENCOUNTER_TYPE_MASK)
    >>> METATILE_ATTRIBUTE_ENCOUNTER_TYPE_SHIFT;

  if (encounterType === TILE_ENCOUNTER_LAND) return 'L';
  if (encounterType === TILE_ENCOUNTER_WATER) return 'W';
  return '.';
};

const objectEventId = (map, event, index) => {
  if (event.local_id && event.local_id !== '0') {
    return event.local_id;
  }

  if (event.script && event.script.includes('_EventScript_')) {
    return event.script.replace('_EventScript_', '_ObjectEvent_');
  }

  return `${map.name}_ObjectEvent_${index + 1}`;
};

const warpEventToWarp = (event) => ({
  x: event.x,
  y: event.y,
  elevation: event.elevation,
  destMap: event.dest_map,
  destWarpId: Number(event.dest_warp_id)
});

const objectEventToCloneObject = (event) => ({
  x: event.x,
  y: event.y,
  graphicsId: event.graphics_id,
  targetLocalId: event.target_local_id,
  targetMap: event.target_map
});

const BG_EVENT_FACING_MAP = {
  BG_EVENT_PLAYER_FACING_ANY: 'any',
  BG_EVENT_PLAYER_FACING_NORTH: 'up',
  BG_EVENT_PLAYER_FACING_SOUTH: 'down',
  BG_EVENT_PLAYER_FACING_EAST: 'right',
  BG_EVENT_PLAYER_FACING_WEST: 'left'
};

const bgEventFacingToRuntime = (dir) => BG_EVENT_FACING_MAP[dir] ?? 'any';

const objectEventToBerryTree = (event) => ({
  x: event.x,
  y: event.y,
  elevation: event.elevation,
  berryTreeId: Number(event.trainer_sight_or_berry_tree_id),
  localId: event.local_id,
  scriptId: event.script,
  flag: event.flag
});

const hiddenItemEventToHiddenItem = (event) => ({
  x: event.x,
  y: event.y,
  elevation: event.elevation,
  item: event.item,
  quantity: Number(event.quantity),
  flag: event.flag,
  underfoot: event.underfoot === true
});

const bgEventToTrigger = (event) => {
  if (event.type === 'hidden_item') {
    return {
      id: `${event.flag}.hiddenItem`,
      x: event.x,
      y: event.y,
      activation: event.underfoot ? 'step' : 'interact',
      scriptId: `${event.flag}.hiddenItem`,
      facing: 'any',
      once: true,
      conditions: [{ flag: event.flag, flagState: false }]
    };
  }

  return {
    id: event.script,
    x: event.x,
    y: event.y,
    activation: 'interact',
    scriptId: event.script,
    facing: bgEventFacingToRuntime(event.player_facing_dir),
    once: false
  };
};

const coordEventToTrigger = (event) => ({
  id: event.script,
  x: event.x,
  y: event.y,
  activation: 'step',
  scriptId: event.script,
  facing: 'any',
  once: false,
  conditionVar: event.var,
  conditionEquals: Number(event.var_value)
});

const findEncounterRates = (type) =>
  readWildEncounters()
    .wild_encounter_groups
    .find((entry) => entry.label === 'gWildMonHeaders')
    ?.fields
    .find((field) => field.type === type)
    ?.encounter_rates ?? [];

const toWildGroup = (group, type) => group
  ? {
    encounterRate: group.encounter_rate ?? 0,
    mons: group.mons.map((mon, index) => ({
      minLevel: mon.min_level,
      maxLevel: mon.max_level,
      species: mon.species,
      slotRate: findEncounterRates(type)[index] ?? 0
    }))
  }
  : undefined;

const findWildEncounters = (mapId, gameName) => {
  const wildEncounters = readWildEncounters();
  const group = wildEncounters.wild_encounter_groups.find((entry) => entry.label === 'gWildMonHeaders');
  const mapEncounters = group?.encounters.find((entry) =>
    entry.map === mapId && entry.base_label?.endsWith(`_${gameName}`)
  );
  if (!mapEncounters) {
    return undefined;
  }

  return {
    land: toWildGroup(mapEncounters.land_mons, 'land_mons')
  };
};

const indexMapFolder = (index, label, folderName) => {
  if (typeof label !== 'string' || label.length === 0) {
    return;
  }

  if (!index.has(label)) {
    index.set(label, folderName);
  }
};

const getMapFolderIndex = () => {
  if (mapFolderIndex) {
    return mapFolderIndex;
  }

  const mapsDir = path.join(repoRoot, 'data/maps');
  const index = new Map();

  for (const folderName of fs.readdirSync(mapsDir)) {
    const mapJsonPath = path.join(mapsDir, folderName, 'map.json');
    if (!fs.existsSync(mapJsonPath)) {
      continue;
    }

    const map = JSON.parse(fs.readFileSync(mapJsonPath, 'utf8'));
    indexMapFolder(index, folderName, folderName);
    indexMapFolder(index, map.name, folderName);
    indexMapFolder(index, map.id, folderName);
  }

  mapFolderIndex = index;
  return index;
};

const resolveMapFolderName = (mapLabel) => {
  const folderName = getMapFolderIndex().get(mapLabel);
  if (!folderName) {
    throw new Error(
      `Unable to find map "${mapLabel}". Expected a folder name, map name, or MAP_* label from data/maps.`
    );
  }

  return folderName;
};

const exportMap = (mapName, gameName = 'FireRed') => {
  const resolvedMapName = resolveMapFolderName(mapName);
  const map = readJson(`data/maps/${resolvedMapName}/map.json`);
  const layouts = readJson('data/layouts/layouts.json').layouts;
  const layout = layouts.find((entry) => entry.id === map.layout);
  if (!layout) {
    throw new Error(`Unable to find layout "${map.layout}" for map "${mapName}".`);
  }

  const blockData = readBinary(layout.blockdata_filepath);
  const primaryAttributes = readBinary(tilesetAttributePath(layout.primary_tileset));
  const secondaryAttributes = readBinary(tilesetAttributePath(layout.secondary_tileset));
  const collisionRows = [];
  const encounterRows = [];
  const behaviorRows = [];
  const metatileIds = [];
  const layerTypes = [];

  for (let y = 0; y < layout.height; y += 1) {
    let collisionRow = '';
    let encounterRow = '';
    let behaviorRow = '';

    for (let x = 0; x < layout.width; x += 1) {
      const block = blockData.readUInt16LE((y * layout.width + x) * 2);
      const collision = (block & MAPGRID_COLLISION_MASK) >> MAPGRID_COLLISION_SHIFT;
      const metatileId = block & MAPGRID_METATILE_ID_MASK;
      const attributes = readMetatileAttributes(primaryAttributes, secondaryAttributes, metatileId);

      collisionRow += collision === 0 ? '.' : '#';
      encounterRow += toEncounterMarker(attributes);
      behaviorRow += (attributes & METATILE_ATTRIBUTE_BEHAVIOR_MASK).toString(16).padStart(2, '0');
      metatileIds.push(metatileId);
      layerTypes.push(
        (attributes & METATILE_ATTRIBUTE_LAYER_TYPE_MASK) >>> METATILE_ATTRIBUTE_LAYER_TYPE_SHIFT
      );
    }

    collisionRows.push(collisionRow);
    encounterRows.push(encounterRow);
    behaviorRows.push(behaviorRow);
  }

  return {
    id: map.id,
    metadata: {
      name: map.name,
      layout: map.layout,
      music: map.music,
      regionMapSection: map.region_map_section,
      weather: map.weather,
      mapType: map.map_type,
      allowCycling: map.allow_cycling,
      allowEscaping: map.allow_escaping,
      allowRunning: map.allow_running,
      showMapName: map.show_map_name,
      battleScene: map.battle_scene,
      connections: map.connections
    },
    wildEncounters: findWildEncounters(map.id, gameName),
    width: layout.width,
    height: layout.height,
    tileSize: 16,
    visual: {
      primaryTileset: tilesetFolderName(layout.primary_tileset),
      secondaryTileset: tilesetFolderName(layout.secondary_tileset),
      metatileIds,
      layerTypes
    },
    collisionRows,
    encounterRows,
    behaviorRows,
    triggers: [
      ...map.coord_events.map(coordEventToTrigger),
      ...map.bg_events.map(bgEventToTrigger)
    ],
    warps: map.warp_events.map(warpEventToWarp),
    hiddenItems: map.bg_events
      .filter((event) => event.type === 'hidden_item')
      .map(hiddenItemEventToHiddenItem),
    berryTrees: map.object_events
      .filter((event) => event.type !== 'clone' && event.movement_type === 'MOVEMENT_TYPE_BERRY_TREE_GROWTH')
      .map(objectEventToBerryTree),
    cloneObjects: map.object_events
      .filter((event) => event.type === 'clone')
      .map(objectEventToCloneObject),
    npcs: map.object_events
      .filter((event) => event.type !== 'clone')
      .map((event, index) => ({
        id: objectEventId(map, event, index),
        x: event.x,
        y: event.y,
        graphicsId: event.graphics_id,
        movementType: event.movement_type,
        movementRangeX: event.movement_range_x,
        movementRangeY: event.movement_range_y,
        trainerType: event.trainer_type,
        trainerSightOrBerryTreeId: Number(event.trainer_sight_or_berry_tree_id),
        scriptId: event.script,
        flag: event.flag
      }))
  };
};

export { exportMap, tilesetAttributePath };

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const mapName = process.argv[2];
  if (!mapName) {
    console.error('Usage: npm run export:map -- <MapName> [FireRed|LeafGreen]');
    process.exitCode = 1;
  } else {
    const gameName = process.argv[3] ?? 'FireRed';
    console.log(JSON.stringify(exportMap(mapName, gameName), null, 2));
  }
}
