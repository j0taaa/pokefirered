import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadPalletTownRivalsHouseMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import palletTownRivalsHouseMapJson from '../src/world/maps/palletTownRivalsHouse.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Pallet Town rival house compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(palletTownRivalsHouseMapJson).toEqual(exportMap('PalletTown_RivalsHouse'));
  });

  test('loads the rival house into the runtime tile map shape', () => {
    const exported = exportMap('PalletTown_RivalsHouse');
    const map = loadPalletTownRivalsHouseMap();

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
    expect(map.hiddenItems).toEqual([]);
    expect(map.warps).toEqual(exported.warps);
  });

  test('validates compact rows and preserves rival house warp, sign, and NPC parity', () => {
    const baseSource = palletTownRivalsHouseMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(palletTownRivalsHouseMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toEqual([
      {
        id: 'PalletTown_RivalsHouse_EventScript_Bookshelf',
        x: 12,
        y: 1,
        activation: 'interact',
        scriptId: 'PalletTown_RivalsHouse_EventScript_Bookshelf',
        facing: 'any',
        once: false
      },
      {
        id: 'PalletTown_RivalsHouse_EventScript_Bookshelf',
        x: 11,
        y: 1,
        activation: 'interact',
        scriptId: 'PalletTown_RivalsHouse_EventScript_Bookshelf',
        facing: 'any',
        once: false
      },
      {
        id: 'PalletTown_RivalsHouse_EventScript_Picture',
        x: 9,
        y: 1,
        activation: 'interact',
        scriptId: 'PalletTown_RivalsHouse_EventScript_Picture',
        facing: 'any',
        once: false
      }
    ]);
    expect(map.warps).toEqual([
      { x: 4, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 1 },
      { x: 5, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 1 },
      { x: 3, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 1 }
    ]);
    expect(map.npcs).toEqual([
      {
        id: 'LOCALID_DAISY',
        x: 10,
        y: 6,
        graphicsId: 'OBJ_EVENT_GFX_DAISY',
        movementType: 'MOVEMENT_TYPE_WANDER_AROUND',
        movementRangeX: 1,
        movementRangeY: 3,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_RivalsHouse_EventScript_Daisy',
        flag: '0'
      },
      {
        id: 'LOCALID_TOWN_MAP',
        x: 6,
        y: 4,
        graphicsId: 'OBJ_EVENT_GFX_TOWN_MAP',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_RivalsHouse_EventScript_TownMap',
        flag: 'FLAG_HIDE_TOWN_MAP'
      }
    ]);
  });
});
