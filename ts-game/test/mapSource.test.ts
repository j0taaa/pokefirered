import { describe, expect, test } from 'vitest';
import {
  expandBehaviorRows,
  expandCollisionRows,
  expandEncounterRows,
  loadPalletTownMap,
  loadPrototypeRouteMap,
  loadRoute1Map,
  loadViridianCityMap,
  mapFromCompactSource,
  mapFromSource,
  parseMapSource
} from '../src/world/mapSource';
import { palletTownCompactMapSource } from '../src/world/maps/palletTown';
import { route1CompactMapSource } from '../src/world/maps/route1';
import viridianCityCompactMapSource from '../src/world/maps/viridianCity.json';

describe('map source loading', () => {
  test('loads the prototype map from JSON', () => {
    const map = loadPrototypeRouteMap();

    expect(map.width).toBe(20);
    expect(map.height).toBe(15);
    expect(map.tileSize).toBe(16);
    expect(map.walkable.length).toBe(300);
    expect(map.triggers.length).toBeGreaterThan(0);
  });

  test('loads Route 1 from compact decomp adapter data', () => {
    const map = loadRoute1Map();

    expect(map.id).toBe('MAP_ROUTE1');
    expect(map.width).toBe(24);
    expect(map.height).toBe(40);
    expect(map.metadata?.music).toBe('MUS_ROUTE1');
    expect(map.metadata?.connections?.map((connection) => connection.map)).toEqual([
      'MAP_VIRIDIAN_CITY',
      'MAP_PALLET_TOWN'
    ]);
    expect(map.wildEncounters?.land?.encounterRate).toBe(21);
    expect(map.wildEncounters?.land?.mons).toHaveLength(12);
    expect(map.walkable.length).toBe(960);
    expect(map.encounterTypes.filter((type) => type === 'land').length).toBeGreaterThan(0);
    expect(map.metatileBehaviors).toContain(0x3b);
    expect(map.metatileBehaviors).toContain(0x84);
    expect(map.triggers).toHaveLength(1);
    expect(map.npcs.map((npc) => npc.scriptId)).toEqual([
      'Route1_EventScript_MartClerk',
      'Route1_EventScript_Boy'
    ]);
  });

  test('loads Pallet Town from compact decomp adapter data', () => {
    const map = loadPalletTownMap();

    expect(map.id).toBe('MAP_PALLET_TOWN');
    expect(map.width).toBe(24);
    expect(map.height).toBe(20);
    expect(map.metadata?.music).toBe('MUS_PALLET');
    expect(map.metadata?.connections?.map((connection) => connection.map)).toEqual([
      'MAP_ROUTE1',
      'MAP_ROUTE21_NORTH'
    ]);
    expect(map.walkable.length).toBe(480);
    expect(map.encounterTypes.filter((type) => type === 'water').length).toBe(10);
    expect(map.metatileBehaviors).toContain(0x15);
    expect(map.metatileBehaviors).toContain(0x84);
    expect(map.triggers.filter((trigger) => trigger.activation === 'step').map((trigger) => trigger.scriptId)).toEqual([
      'PalletTown_EventScript_OakTriggerLeft',
      'PalletTown_EventScript_OakTriggerRight',
      'PalletTown_EventScript_SignLadyTrigger'
    ]);
    expect(map.triggers.filter((trigger) => trigger.activation === 'interact').map((trigger) => trigger.scriptId)).toEqual([
      'PalletTown_EventScript_OaksLabSign',
      'PalletTown_EventScript_PlayersHouseSign',
      'PalletTown_EventScript_RivalsHouseSign',
      'PalletTown_EventScript_TownSign',
      'PalletTown_EventScript_TrainerTips'
    ]);
    expect(map.npcs.map((npc) => npc.scriptId)).toEqual([
      'PalletTown_EventScript_SignLady',
      'PalletTown_EventScript_FatMan',
      '0x0'
    ]);
  });

  test('loads Viridian City from compact decomp adapter data', () => {
    const map = loadViridianCityMap();

    expect(map.id).toBe('MAP_VIRIDIAN_CITY');
    expect(map.width).toBe(48);
    expect(map.height).toBe(40);
    expect(map.metadata?.music).toBe('MUS_PEWTER');
    expect(map.metadata?.connections?.map((connection) => connection.map)).toEqual([
      'MAP_ROUTE2',
      'MAP_ROUTE1',
      'MAP_ROUTE22'
    ]);
    expect(map.walkable.length).toBe(1920);
    expect(map.encounterTypes.filter((type) => type === 'water').length).toBe(30);
    expect(map.metatileBehaviors).toContain(0x3b);
    expect(map.metatileBehaviors).toContain(0x84);
    expect(map.triggers.filter((trigger) => trigger.activation === 'step')).toHaveLength(4);
    expect(map.triggers.filter((trigger) => trigger.activation === 'interact')).toHaveLength(5);
    expect(map.npcs.map((npc) => npc.scriptId)).toContain('ViridianCity_EventScript_ItemPotion');
  });

  test('throws when walkable length does not match map size', () => {
    expect(() =>
      mapFromSource({
        id: 'broken',
        width: 2,
        height: 2,
        tileSize: 16,
        walkable: [true, false, true]
      })
    ).toThrow(/walkable length/i);
  });

  test('validates raw map source payloads', () => {
    expect(() => parseMapSource({ id: '', width: 1, height: 1, tileSize: 16, walkable: [true] })).toThrow(
      /non-empty string/i
    );

    expect(() =>
      parseMapSource({
        id: 'bad-map',
        width: 2,
        height: 1,
        tileSize: 16,
        walkable: [1, 2]
      })
    ).toThrow(/boolean walkable array/i);
  });

  test('validates compact collision row payloads', () => {
    expect(() => mapFromCompactSource({
      id: 'bad-compact',
      width: 2,
      height: 1,
      tileSize: 16,
      collisionRows: ['...']
    })).toThrow(/collision row 0 has width/i);

    expect(() => expandCollisionRows({
      id: 'bad-marker',
      width: 1,
      height: 1,
      tileSize: 16,
      collisionRows: ['x']
    })).toThrow(/invalid collision marker/i);

    expect(() => expandEncounterRows({
      id: 'bad-encounter-marker',
      width: 1,
      height: 1,
      tileSize: 16,
      collisionRows: ['.'],
      encounterRows: ['x']
    })).toThrow(/invalid encounter marker/i);

    expect(() => expandBehaviorRows({
      id: 'bad-behavior-marker',
      width: 1,
      height: 1,
      tileSize: 16,
      collisionRows: ['.'],
      behaviorRows: ['0x']
    })).toThrow(/invalid behavior marker/i);
  });

  test('parses and validates triggers', () => {
    const source = parseMapSource({
      id: 'trigger-map',
      width: 1,
      height: 1,
      tileSize: 16,
      walkable: [true],
      triggers: [{ id: 't', x: 0, y: 0, activation: 'step', scriptId: 'script.1' }]
    });

    expect(source.triggers?.[0].facing).toBe('any');
    expect(source.triggers?.[0].once).toBe(false);
    expect(source.triggers?.[0].conditions).toBeUndefined();

    const sourceWithConditions = parseMapSource({
      id: 'trigger-map-conditions',
      width: 1,
      height: 1,
      tileSize: 16,
      walkable: [true],
      triggers: [{
        id: 't3',
        x: 0,
        y: 0,
        activation: 'step',
        scriptId: 'script.2',
        conditions: [{ var: 'progress', op: 'gte', value: 1 }, { flag: 'route.done', flagState: false }]
      }]
    });
    expect(sourceWithConditions.triggers?.[0].conditions?.length).toBe(2);

    expect(() => parseMapSource({
      id: 'bad-trigger',
      width: 1,
      height: 1,
      tileSize: 16,
      walkable: [true],
      triggers: [{ id: 't2', x: 0, y: 0, activation: 'oops', scriptId: 's' }]
    })).toThrow(/invalid activation/i);

    expect(() => parseMapSource({
      id: 'bad-trigger-condition',
      width: 1,
      height: 1,
      tileSize: 16,
      walkable: [true],
      triggers: [{
        id: 't4',
        x: 0,
        y: 0,
        activation: 'step',
        scriptId: 's',
        conditions: [{ var: 'progress', op: 'wat' }]
      }]
    })).toThrow(/invalid op/i);
  });

  test('parses and validates NPC sources', () => {
    const source = parseMapSource({
      id: 'npc-map',
      width: 1,
      height: 1,
      tileSize: 16,
      walkable: [true],
      npcs: [{
        id: 'npc-1',
        x: 0,
        y: 0,
        graphicsId: 'OBJ_EVENT_GFX_BOY',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        scriptId: 'NpcScript'
      }]
    });

    expect(source.npcs?.[0].scriptId).toBe('NpcScript');

    expect(() => parseMapSource({
      id: 'bad-npc',
      width: 1,
      height: 1,
      tileSize: 16,
      walkable: [true],
      npcs: [{ id: 'npc-1', x: 0, y: 0 }]
    })).toThrow(/graphicsId/i);
  });
});

describe('Route 1 decomp parity', () => {
  test('matches original Route1 map event coordinates and scripts', async () => {
    const fs = await import('node:fs');
    const raw = JSON.parse(fs.readFileSync('../data/maps/Route1/map.json', 'utf8'));

    expect(route1CompactMapSource.id).toBe(raw.id);
    expect(route1CompactMapSource.metadata).toMatchObject({
      name: raw.name,
      layout: raw.layout,
      music: raw.music,
      weather: raw.weather,
      mapType: raw.map_type,
      battleScene: raw.battle_scene,
      connections: raw.connections
    });
    expect(route1CompactMapSource.wildEncounters?.land?.mons.map((mon) => mon.species)).toEqual([
      'SPECIES_PIDGEY',
      'SPECIES_RATTATA',
      'SPECIES_PIDGEY',
      'SPECIES_RATTATA',
      'SPECIES_PIDGEY',
      'SPECIES_RATTATA',
      'SPECIES_PIDGEY',
      'SPECIES_RATTATA',
      'SPECIES_PIDGEY',
      'SPECIES_RATTATA',
      'SPECIES_PIDGEY',
      'SPECIES_RATTATA'
    ]);
    expect(route1CompactMapSource.wildEncounters?.land?.mons.map((mon) => mon.slotRate)).toEqual([
      20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1
    ]);
    expect(route1CompactMapSource.npcs?.map((npc) => ({
      x: npc.x,
      y: npc.y,
      graphics_id: npc.graphicsId,
      movement_type: npc.movementType,
      movement_range_x: npc.movementRangeX,
      movement_range_y: npc.movementRangeY,
      script: npc.scriptId,
      flag: npc.flag
    }))).toEqual(raw.object_events.map((event: Record<string, unknown>) => ({
      x: event.x,
      y: event.y,
      graphics_id: event.graphics_id,
      movement_type: event.movement_type,
      movement_range_x: event.movement_range_x,
      movement_range_y: event.movement_range_y,
      script: event.script,
      flag: event.flag
    })));

    expect(route1CompactMapSource.triggers?.map((trigger) => ({
      x: trigger.x,
      y: trigger.y,
      script: trigger.scriptId
    }))).toEqual(raw.bg_events.map((event: Record<string, unknown>) => ({
      x: event.x,
      y: event.y,
      script: event.script
    })));
  });

  test('matches original Route1 layout dimensions and MAPGRID collision bits', async () => {
    const fs = await import('node:fs');
    const route = JSON.parse(fs.readFileSync('../data/maps/Route1/map.json', 'utf8'));
    const layouts = JSON.parse(fs.readFileSync('../data/layouts/layouts.json', 'utf8')).layouts;
    const layout = layouts.find((entry: Record<string, unknown>) => entry.id === route.layout);
    const blockData = fs.readFileSync(`../${layout.blockdata_filepath}`);
    const primaryAttributes = fs.readFileSync('../data/tilesets/primary/general/metatile_attributes.bin');
    const secondaryAttributes = fs.readFileSync('../data/tilesets/secondary/pallet_town/metatile_attributes.bin');

    expect(route1CompactMapSource.width).toBe(layout.width);
    expect(route1CompactMapSource.height).toBe(layout.height);

    const rows: string[] = [];
    const encounterRows: string[] = [];
    const behaviorRows: string[] = [];
    const readMetatileAttributes = (metatileId: number): number => {
      const attributes = metatileId < 0x200 ? primaryAttributes : secondaryAttributes;
      const index = metatileId < 0x200 ? metatileId : metatileId - 0x200;
      const offset = index * 4;

      return offset + 4 <= attributes.length ? attributes.readUInt32LE(offset) : 0;
    };

    for (let y = 0; y < layout.height; y += 1) {
      let row = '';
      let encounterRow = '';
      let behaviorRow = '';
      for (let x = 0; x < layout.width; x += 1) {
        const block = blockData.readUInt16LE((y * layout.width + x) * 2);
        const metatileId = block & 0x03ff;
        const attributes = readMetatileAttributes(metatileId);
        const encounterType = (attributes & 0x07000000) >>> 24;
        row += ((block & 0x0c00) >> 10) === 0 ? '.' : '#';
        encounterRow += encounterType === 1 ? 'L' : encounterType === 2 ? 'W' : '.';
        behaviorRow += (attributes & 0x000001ff).toString(16).padStart(2, '0');
      }
      rows.push(row);
      encounterRows.push(encounterRow);
      behaviorRows.push(behaviorRow);
    }

    expect(route1CompactMapSource.collisionRows).toEqual(rows);
    expect(route1CompactMapSource.encounterRows).toEqual(encounterRows);
    expect(route1CompactMapSource.behaviorRows).toEqual(behaviorRows);
  });
});

describe('Pallet Town decomp parity', () => {
  test('matches original PalletTown map event coordinates and scripts', async () => {
    const fs = await import('node:fs');
    const raw = JSON.parse(fs.readFileSync('../data/maps/PalletTown/map.json', 'utf8'));

    expect(palletTownCompactMapSource.id).toBe(raw.id);
    expect(palletTownCompactMapSource.metadata).toMatchObject({
      name: raw.name,
      layout: raw.layout,
      music: raw.music,
      weather: raw.weather,
      mapType: raw.map_type,
      battleScene: raw.battle_scene,
      connections: raw.connections
    });
    expect(palletTownCompactMapSource.npcs?.map((npc) => ({
      x: npc.x,
      y: npc.y,
      graphics_id: npc.graphicsId,
      movement_type: npc.movementType,
      movement_range_x: npc.movementRangeX,
      movement_range_y: npc.movementRangeY,
      script: npc.scriptId,
      flag: npc.flag
    }))).toEqual(raw.object_events.map((event: Record<string, unknown>) => ({
      x: event.x,
      y: event.y,
      graphics_id: event.graphics_id,
      movement_type: event.movement_type,
      movement_range_x: event.movement_range_x,
      movement_range_y: event.movement_range_y,
      script: event.script,
      flag: event.flag
    })));

    expect(palletTownCompactMapSource.triggers?.filter((trigger) => trigger.activation === 'step').map((trigger) => ({
      x: trigger.x,
      y: trigger.y,
      script: trigger.scriptId,
      var: trigger.conditionVar,
      var_value: String(trigger.conditionEquals)
    }))).toEqual(raw.coord_events.map((event: Record<string, unknown>) => ({
      x: event.x,
      y: event.y,
      script: event.script,
      var: event.var,
      var_value: event.var_value
    })));

    expect(palletTownCompactMapSource.triggers?.filter((trigger) => trigger.activation === 'interact').map((trigger) => ({
      x: trigger.x,
      y: trigger.y,
      script: trigger.scriptId
    }))).toEqual(raw.bg_events.map((event: Record<string, unknown>) => ({
      x: event.x,
      y: event.y,
      script: event.script
    })));
  });

  test('matches original PalletTown layout dimensions and MAPGRID collision bits', async () => {
    const fs = await import('node:fs');
    const palletTown = JSON.parse(fs.readFileSync('../data/maps/PalletTown/map.json', 'utf8'));
    const layouts = JSON.parse(fs.readFileSync('../data/layouts/layouts.json', 'utf8')).layouts;
    const layout = layouts.find((entry: Record<string, unknown>) => entry.id === palletTown.layout);
    const blockData = fs.readFileSync(`../${layout.blockdata_filepath}`);
    const primaryAttributes = fs.readFileSync('../data/tilesets/primary/general/metatile_attributes.bin');
    const secondaryAttributes = fs.readFileSync('../data/tilesets/secondary/pallet_town/metatile_attributes.bin');

    expect(palletTownCompactMapSource.width).toBe(layout.width);
    expect(palletTownCompactMapSource.height).toBe(layout.height);

    const rows: string[] = [];
    const encounterRows: string[] = [];
    const behaviorRows: string[] = [];
    const readMetatileAttributes = (metatileId: number): number => {
      const attributes = metatileId < 0x200 ? primaryAttributes : secondaryAttributes;
      const index = metatileId < 0x200 ? metatileId : metatileId - 0x200;
      const offset = index * 4;

      return offset + 4 <= attributes.length ? attributes.readUInt32LE(offset) : 0;
    };

    for (let y = 0; y < layout.height; y += 1) {
      let row = '';
      let encounterRow = '';
      let behaviorRow = '';
      for (let x = 0; x < layout.width; x += 1) {
        const block = blockData.readUInt16LE((y * layout.width + x) * 2);
        const metatileId = block & 0x03ff;
        const attributes = readMetatileAttributes(metatileId);
        const encounterType = (attributes & 0x07000000) >>> 24;
        row += ((block & 0x0c00) >> 10) === 0 ? '.' : '#';
        encounterRow += encounterType === 1 ? 'L' : encounterType === 2 ? 'W' : '.';
        behaviorRow += (attributes & 0x000001ff).toString(16).padStart(2, '0');
      }
      rows.push(row);
      encounterRows.push(encounterRow);
      behaviorRows.push(behaviorRow);
    }

    expect(palletTownCompactMapSource.collisionRows).toEqual(rows);
    expect(palletTownCompactMapSource.encounterRows).toEqual(encounterRows);
    expect(palletTownCompactMapSource.behaviorRows).toEqual(behaviorRows);
  });
});

describe('Viridian City decomp parity', () => {
  test('matches original ViridianCity map event coordinates and scripts', async () => {
    const fs = await import('node:fs');
    const raw = JSON.parse(fs.readFileSync('../data/maps/ViridianCity/map.json', 'utf8'));
    const source = viridianCityCompactMapSource;

    expect(source.id).toBe(raw.id);
    expect(source.metadata).toMatchObject({
      name: raw.name,
      layout: raw.layout,
      music: raw.music,
      weather: raw.weather,
      mapType: raw.map_type,
      battleScene: raw.battle_scene,
      connections: raw.connections
    });
    expect(source.npcs.map((npc) => ({
      x: npc.x,
      y: npc.y,
      graphics_id: npc.graphicsId,
      movement_type: npc.movementType,
      movement_range_x: npc.movementRangeX,
      movement_range_y: npc.movementRangeY,
      script: npc.scriptId,
      flag: npc.flag
    }))).toEqual(raw.object_events.map((event: Record<string, unknown>) => ({
      x: event.x,
      y: event.y,
      graphics_id: event.graphics_id,
      movement_type: event.movement_type,
      movement_range_x: event.movement_range_x,
      movement_range_y: event.movement_range_y,
      script: event.script,
      flag: event.flag
    })));

    expect(source.triggers.filter((trigger) => trigger.activation === 'step').map((trigger) => ({
      x: trigger.x,
      y: trigger.y,
      script: trigger.scriptId,
      var: trigger.conditionVar,
      var_value: String(trigger.conditionEquals)
    }))).toEqual(raw.coord_events.map((event: Record<string, unknown>) => ({
      x: event.x,
      y: event.y,
      script: event.script,
      var: event.var,
      var_value: event.var_value
    })));

    expect(source.triggers.filter((trigger) => trigger.activation === 'interact').map((trigger) => ({
      x: trigger.x,
      y: trigger.y,
      script: trigger.scriptId
    }))).toEqual(raw.bg_events.map((event: Record<string, unknown>) => ({
      x: event.x,
      y: event.y,
      script: event.script
    })));
  });

  test('matches original ViridianCity layout dimensions and MAPGRID collision bits', async () => {
    const fs = await import('node:fs');
    const raw = JSON.parse(fs.readFileSync('../data/maps/ViridianCity/map.json', 'utf8'));
    const layouts = JSON.parse(fs.readFileSync('../data/layouts/layouts.json', 'utf8')).layouts;
    const layout = layouts.find((entry: Record<string, unknown>) => entry.id === raw.layout);
    const blockData = fs.readFileSync(`../${layout.blockdata_filepath}`);
    const primaryAttributes = fs.readFileSync('../data/tilesets/primary/general/metatile_attributes.bin');
    const secondaryAttributes = fs.readFileSync('../data/tilesets/secondary/viridian_city/metatile_attributes.bin');

    expect(viridianCityCompactMapSource.width).toBe(layout.width);
    expect(viridianCityCompactMapSource.height).toBe(layout.height);

    const rows: string[] = [];
    const encounterRows: string[] = [];
    const behaviorRows: string[] = [];
    const readMetatileAttributes = (metatileId: number): number => {
      const attributes = metatileId < 0x200 ? primaryAttributes : secondaryAttributes;
      const index = metatileId < 0x200 ? metatileId : metatileId - 0x200;
      const offset = index * 4;

      return offset + 4 <= attributes.length ? attributes.readUInt32LE(offset) : 0;
    };

    for (let y = 0; y < layout.height; y += 1) {
      let row = '';
      let encounterRow = '';
      let behaviorRow = '';
      for (let x = 0; x < layout.width; x += 1) {
        const block = blockData.readUInt16LE((y * layout.width + x) * 2);
        const metatileId = block & 0x03ff;
        const attributes = readMetatileAttributes(metatileId);
        const encounterType = (attributes & 0x07000000) >>> 24;
        row += ((block & 0x0c00) >> 10) === 0 ? '.' : '#';
        encounterRow += encounterType === 1 ? 'L' : encounterType === 2 ? 'W' : '.';
        behaviorRow += (attributes & 0x000001ff).toString(16).padStart(2, '0');
      }
      rows.push(row);
      encounterRows.push(encounterRow);
      behaviorRows.push(behaviorRow);
    }

    expect(viridianCityCompactMapSource.collisionRows).toEqual(rows);
    expect(viridianCityCompactMapSource.encounterRows).toEqual(encounterRows);
    expect(viridianCityCompactMapSource.behaviorRows).toEqual(behaviorRows);
  });
});
