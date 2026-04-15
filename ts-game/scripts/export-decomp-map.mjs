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

const TILE_ENCOUNTER_LAND = 1;
const TILE_ENCOUNTER_WATER = 2;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');

const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));

const readBinary = (relativePath) =>
  fs.readFileSync(path.join(repoRoot, relativePath));

const tilesetAttributePath = (tilesetName) => {
  const snakeName = tilesetName
    .replace(/^gTileset_/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();

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

const exportMap = (mapName) => {
  const map = readJson(`data/maps/${mapName}/map.json`);
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
    width: layout.width,
    height: layout.height,
    tileSize: 16,
    collisionRows,
    encounterRows,
    behaviorRows,
    triggers: map.bg_events.map((event) => ({
      id: event.script,
      x: event.x,
      y: event.y,
      activation: 'interact',
      scriptId: event.script,
      facing: event.player_facing_dir === 'BG_EVENT_PLAYER_FACING_ANY' ? 'any' : event.player_facing_dir,
      once: false
    })),
    npcs: map.object_events.map((event, index) => ({
      id: objectEventId(map, event, index),
      x: event.x,
      y: event.y,
      graphicsId: event.graphics_id,
      movementType: event.movement_type,
      movementRangeX: event.movement_range_x,
      movementRangeY: event.movement_range_y,
      scriptId: event.script,
      flag: event.flag
    }))
  };
};

const mapName = process.argv[2];
if (!mapName) {
  console.error('Usage: npm run export:map -- <MapName>');
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(exportMap(mapName), null, 2));
}
