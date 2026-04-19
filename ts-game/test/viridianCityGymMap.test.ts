import { describe, expect, test } from 'vitest';
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadViridianCityGymMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import viridianCityGymMapJson from '../src/world/maps/viridianCityGym.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Viridian City Gym compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(viridianCityGymMapJson).toEqual(JSON.parse(JSON.stringify(exportMap('ViridianCity_Gym'))));
  });

  test('loads Viridian City Gym into the runtime tile map shape', () => {
    const exported = exportMap('ViridianCity_Gym');
    const map = loadViridianCityGymMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.tileSize).toBe(exported.tileSize);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.connections).toEqual([]);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exported.encounterRows));
    expect(map.wildEncounters).toEqual(undefined);
    expect(map.triggers).toEqual(exported.triggers);
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.hiddenItems).toEqual(exported.hiddenItems);
    expect(map.warps).toEqual(exported.warps);
  });

  test('validates compact rows and preserves trigger, warp, and npc parity', () => {
    const baseSource = viridianCityGymMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(viridianCityGymMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
  });

  test('has 3 triggers: 2 gym statues and 1 hidden item', () => {
    const map = loadViridianCityGymMap();
    expect(map.triggers).toHaveLength(3);

    const statues = map.triggers.filter((t) =>
      t.scriptId === 'ViridianCity_Gym_EventScript_GymStatue'
    );
    expect(statues).toHaveLength(2);
    expect(statues[0]).toEqual({
      id: 'ViridianCity_Gym_EventScript_GymStatue',
      x: 15,
      y: 20,
      activation: 'interact',
      scriptId: 'ViridianCity_Gym_EventScript_GymStatue',
      facing: 'any',
      once: false
    });
    expect(statues[1].x).toBe(19);
    expect(statues[1].y).toBe(20);

    const hiddenItem = map.triggers.find((t) =>
      t.scriptId === 'FLAG_HIDDEN_ITEM_VIRIDIAN_CITY_GYM_MACHO_BRACE.hiddenItem'
    );
    expect(hiddenItem).toBeDefined();
    expect(hiddenItem!.x).toBe(2);
    expect(hiddenItem!.y).toBe(2);
    expect(hiddenItem!.once).toBe(true);
  });

  test('has 1 hidden item: ITEM_MACHO_BRACE at (2, 2)', () => {
    const map = loadViridianCityGymMap();
    expect(map.hiddenItems!).toHaveLength(1);
    expect(map.hiddenItems![0]).toEqual({
      x: 2,
      y: 2,
      elevation: 3,
      item: 'ITEM_MACHO_BRACE',
      quantity: 1,
      flag: 'FLAG_HIDDEN_ITEM_VIRIDIAN_CITY_GYM_MACHO_BRACE',
      underfoot: true
    });
  });

  test('has 3 exit warps to Viridian City', () => {
    const map = loadViridianCityGymMap();
    expect(map.warps).toHaveLength(3);
    for (const warp of map.warps) {
      expect(warp.destMap).toBe('MAP_VIRIDIAN_CITY');
      expect(warp.destWarpId).toBe(2);
      expect(warp.y).toBe(22);
      expect(warp.elevation).toBe(3);
    }
    expect(map.warps.map((w) => w.x)).toEqual([16, 17, 18]);
  });

  test('has 10 NPCs: Giovanni, 8 trainers, and Gym Guy', () => {
    const map = loadViridianCityGymMap();
    expect(map.npcs).toHaveLength(10);

    const giovanni = map.npcs.find((n) => n.id === 'LOCALID_VIRIDIAN_GIOVANNI');
    expect(giovanni).toEqual({
      id: 'LOCALID_VIRIDIAN_GIOVANNI',
      x: 2,
      y: 2,
      graphicsId: 'OBJ_EVENT_GFX_GIOVANNI',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'ViridianCity_Gym_EventScript_Giovanni',
      flag: 'FLAG_HIDE_VIRIDIAN_GIOVANNI'
    });

    const gymGuy = map.npcs.find((n) => n.id === 'ViridianCity_Gym_ObjectEvent_GymGuy');
    expect(gymGuy).toEqual({
      id: 'ViridianCity_Gym_ObjectEvent_GymGuy',
      x: 16,
      y: 20,
      graphicsId: 'OBJ_EVENT_GFX_GYM_GUY',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'ViridianCity_Gym_EventScript_GymGuy',
      flag: '0'
    });

    const trainers = map.npcs.filter((n) => n.trainerType === 'TRAINER_TYPE_NORMAL');
    expect(trainers).toHaveLength(8);
    expect(trainers.map((t) => t.id)).toEqual([
      'ViridianCity_Gym_ObjectEvent_Takashi',
      'ViridianCity_Gym_ObjectEvent_Yuji',
      'ViridianCity_Gym_ObjectEvent_Atsushi',
      'ViridianCity_Gym_ObjectEvent_Jason',
      'ViridianCity_Gym_ObjectEvent_Cole',
      'ViridianCity_Gym_ObjectEvent_Kiyo',
      'ViridianCity_Gym_ObjectEvent_Samuel',
      'ViridianCity_Gym_ObjectEvent_Warren'
    ]);
  });

  test('indoor map metadata is correct', () => {
    const source = viridianCityGymMapJson as Record<string, unknown>;
    const metadata = source.metadata as Record<string, unknown>;
    expect(metadata.mapType).toBe('MAP_TYPE_INDOOR');
    expect(metadata.allowCycling).toBe(false);
    expect(metadata.allowRunning).toBe(false);
    expect(metadata.allowEscaping).toBe(false);
    expect(metadata.showMapName).toBe(false);
    expect(metadata.music).toBe('MUS_GYM');
    expect(metadata.regionMapSection).toBe('MAPSEC_VIRIDIAN_CITY');
    expect(metadata.battleScene).toBe('MAP_BATTLE_SCENE_GYM');
  });
});
