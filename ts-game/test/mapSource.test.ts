import { describe, expect, test } from 'vitest';
import {
  expandCollisionRows,
  expandEncounterRows,
  loadPrototypeRouteMap,
  loadRoute1Map,
  mapFromCompactSource,
  mapFromSource,
  parseMapSource
} from '../src/world/mapSource';
import { route1CompactMapSource } from '../src/world/maps/route1';

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
    expect(map.walkable.length).toBe(960);
    expect(map.encounterTypes.filter((type) => type === 'land').length).toBeGreaterThan(0);
    expect(map.triggers).toHaveLength(1);
    expect(map.npcs.map((npc) => npc.scriptId)).toEqual([
      'Route1_EventScript_MartClerk',
      'Route1_EventScript_Boy'
    ]);
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
    const readMetatileAttributes = (metatileId: number): number => {
      const attributes = metatileId < 0x200 ? primaryAttributes : secondaryAttributes;
      const index = metatileId < 0x200 ? metatileId : metatileId - 0x200;
      const offset = index * 4;

      return offset + 4 <= attributes.length ? attributes.readUInt32LE(offset) : 0;
    };

    for (let y = 0; y < layout.height; y += 1) {
      let row = '';
      let encounterRow = '';
      for (let x = 0; x < layout.width; x += 1) {
        const block = blockData.readUInt16LE((y * layout.width + x) * 2);
        const metatileId = block & 0x03ff;
        const encounterType = (readMetatileAttributes(metatileId) & 0x07000000) >>> 24;
        row += ((block & 0x0c00) >> 10) === 0 ? '.' : '#';
        encounterRow += encounterType === 1 ? 'L' : encounterType === 2 ? 'W' : '.';
      }
      rows.push(row);
      encounterRows.push(encounterRow);
    }

    expect(route1CompactMapSource.collisionRows).toEqual(rows);
    expect(route1CompactMapSource.encounterRows).toEqual(encounterRows);
  });
});
