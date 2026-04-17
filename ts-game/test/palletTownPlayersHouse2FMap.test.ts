import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadPalletTownPlayersHouse2FMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import palletTownPlayersHouse2FMapJson from '../src/world/maps/palletTownPlayersHouse2F.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Pallet Town Players House 2F compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(palletTownPlayersHouse2FMapJson).toEqual(exportMap('PalletTown_PlayersHouse_2F'));
  });

  test('loads Players House 2F into the runtime tile map shape', () => {
    const exported = exportMap('PalletTown_PlayersHouse_2F');
    const map = loadPalletTownPlayersHouse2FMap();

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
    expect(map.npcs).toEqual([]);
    expect(map.hiddenItems).toEqual([]);
    expect(map.warps).toEqual(exported.warps);
  });

  test('validates compact rows and preserves Pallet house 2F stair and sign parity', () => {
    const baseSource = palletTownPlayersHouse2FMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(palletTownPlayersHouse2FMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toEqual([
      {
        id: 'PalletTown_PlayersHouse_2F_EventScript_NES',
        x: 6,
        y: 5,
        activation: 'interact',
        scriptId: 'PalletTown_PlayersHouse_2F_EventScript_NES',
        facing: 'any',
        once: false
      },
      {
        id: 'PalletTown_PlayersHouse_2F_EventScript_PC',
        x: 1,
        y: 1,
        activation: 'interact',
        scriptId: 'PalletTown_PlayersHouse_2F_EventScript_PC',
        facing: 'any',
        once: false
      },
      {
        id: 'PalletTown_PlayersHouse_2F_EventScript_Sign',
        x: 11,
        y: 1,
        activation: 'interact',
        scriptId: 'PalletTown_PlayersHouse_2F_EventScript_Sign',
        facing: 'any',
        once: false
      }
    ]);
    expect(map.warps).toEqual([
      { x: 10, y: 2, elevation: 3, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F', destWarpId: 2 }
    ]);
    expect(map.npcs).toEqual([]);
  });
});
