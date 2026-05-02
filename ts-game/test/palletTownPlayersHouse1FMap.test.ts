import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadPalletTownPlayersHouse1FMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import palletTownPlayersHouse1FMapJson from '../src/world/maps/palletTownPlayersHouse1F.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Pallet Town Players House 1F compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(palletTownPlayersHouse1FMapJson).toEqual(exportMap('PalletTown_PlayersHouse_1F'));
  });

  test('loads Players House 1F into the runtime tile map shape', () => {
    const exported = exportMap('PalletTown_PlayersHouse_1F');
    const map = loadPalletTownPlayersHouse1FMap();

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

  test('validates compact rows and preserves Pallet house 1F warp, sign, and NPC parity', () => {
    const baseSource = palletTownPlayersHouse1FMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(palletTownPlayersHouse1FMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toMatchObject([
      {
        id: 'PalletTown_PlayersHouse_1F_EventScript_TV',
        x: 6,
        y: 1,
        activation: 'interact',
        scriptId: 'PalletTown_PlayersHouse_1F_EventScript_TV',
        facing: 'any',
        once: false
      }
    ]);
    expect(map.warps).toEqual([
      { x: 5, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 0 },
      { x: 4, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 0 },
      { x: 10, y: 2, elevation: 3, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_2F', destWarpId: 0 },
      { x: 3, y: 9, elevation: 0, destMap: 'MAP_PALLET_TOWN', destWarpId: 0 }
    ]);
    expect(map.npcs).toEqual([
      {
        id: 'LOCALID_MOM',
        x: 8,
        y: 4,
        graphicsId: 'OBJ_EVENT_GFX_MOM',
        movementType: 'MOVEMENT_TYPE_FACE_LEFT',
        movementRangeX: 0,
        movementRangeY: 0,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: 'PalletTown_PlayersHouse_1F_EventScript_Mom',
        flag: '0'
      }
    ]);
  });
});
